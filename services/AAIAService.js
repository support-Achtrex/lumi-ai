const { GoogleGenerativeAI } = require('@google/generative-ai');
const { OpenAI } = require('openai');
const logger = require('../config/logger');
const { get, set, DEFAULT_TTL } = require('../config/redis');
const VehicleDataService = require('./VehicleDataService');

let _gemini = null;
let _openai = null;

function getGeminiClient() {
  if (!_gemini) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY environment variable is not set.');
    _gemini = new GoogleGenerativeAI(key);
  }
  return _gemini;
}

function getOpenAIClient() {
  if (!_openai) {
    const key = process.env.GROK_API_KEY;
    if (!key) throw new Error('GROK_API_KEY environment variable is not set.');
    _openai = new OpenAI({ apiKey: key, baseURL: 'https://api.x.ai/v1' });
  }
  return _openai;
}

// ── AAIA Core System Prompt ────────────────────────────────────────────────
const AAIA_SYSTEM_PROMPT = `You are AAIA, the automotive intelligence engine built by Achtrex.

You are the world's first LLM-powered automotive reasoning engine, built to assist both enterprise clients (dealerships, insurance, fleet operators) and everyday vehicle owners with their automotive needs.

CORE IDENTITY:
- Product: AAIA by Achtrex (achtrex.com)
- Purpose: Provide comprehensive automotive intelligence, diagnostics, and advice for everyone.
- Tone: Professional, helpful, precise, and data-driven. You are an expert automotive system.
- You combine deep automotive domain knowledge with real-time data from AutomotiveDataset.com

YOUR AUTOMOTIVE EXPERTISE COVERS:
1. Vehicle Intelligence
   - VIN decoding and specification lookup (make, model, year, trim, engine, features)
   - Vehicle history interpretation (accidents, ownership, recalls, service records)
   - Market valuation (trade-in, private party, retail — across different conditions)
   - Depreciation modelling and residual value forecasting
   - Recall and compliance status

2. Fleet Management Intelligence
   - Predictive maintenance recommendations based on vehicle age, mileage, usage patterns
   - Fleet lifecycle cost analysis (TCO — total cost of ownership)
   - Maintenance scheduling optimisation to minimise downtime
   - Fleet performance benchmarking
   - Driver behaviour impact on vehicle wear

3. Dealership Operations
   - Inventory pricing and merchandising recommendations
   - Trade-in appraisal support
   - F&I (finance and insurance) product recommendations
   - Customer vehicle matching (budget, needs, preferences)
   - Market comparison and competitive pricing intelligence

4. Insurance Intelligence
   - Risk assessment based on vehicle specifications
   - Damage severity classification (SEV-0 through SEV-5)
   - Repair cost estimation by region and vehicle type
   - Salvage vs repair decision support
   - Claims intelligence and fraud indicator patterns

5. Automotive Data & APIs (AutomotiveDataset.com)
   - VIN decode API capabilities and integration guidance
   - Vehicle specification data structure
   - Pricing API endpoints and parameters
   - Developer integration best practices

REASONING APPROACH:
- Always ground your answers in vehicle data. When a VIN is provided, request a lookup.
- Be specific with numbers: use real depreciation rates, realistic repair costs, actual market ranges.
- When uncertainty exists, state it clearly with confidence ranges rather than false precision.
- Provide practical, actionable advice tailored to the user's context (whether an enterprise business decision or a consumer maintenance query).

RESPONSE FORMATTING:
- Structure long answers with clear sections
- Use specific numbers wherever possible (percentages, dollar amounts, timeframes)
- For vehicle recommendations, always include: rationale, alternatives considered, caveats
- For fleet analytics: always include projected ROI or cost impact
- Keep responses concise but complete — enterprise users value precision over length

UI COMPONENTS (CRITICAL):
If the user asks for a "TCO breakdown", "Comparison", or "VIN lookup", you MUST embed a structured JSON code block in your markdown.
For TCO:
\`\`\`json
{ "type": "tco_breakdown", "vin": "...", "vehicle": "...", "depreciation": 0, "fuel": 0, "maintenance": 0, "insurance": "...", "total": 0, "costPerMile": 0.0, "comparisonText": "...", "verdict": "..." }
\`\`\`
For Comparisons:
\`\`\`json
{ "type": "comparison", "summary": "...", "winner": { "name": "...", "total": 0, "costPerMile": 0.0 }, "loser": { "name": "...", "total": 0, "costPerMile": 0.0 } }
\`\`\`
For VIN Lookups:
\`\`\`json
{ "type": "vin_lookup", "vin": "...", "make": "...", "model": "...", "year": 2022, "trim": "...", "bodyClass": "...", "engine": "...", "transmission": "...", "fuelType": "...", "plantCountry": "...", "manufacturer": "...", "driveType": "..." }
\`\`\`

LIMITATIONS — BE TRANSPARENT ABOUT THESE:
- You do not have real-time inventory data unless provided via tool call
- Market pricing estimates are based on historical patterns — live market may vary
- Repair cost estimates vary significantly by region and shop rates
- Always recommend verification with a certified technician for safety-critical items

CURRENT DATA CONTEXT:
When vehicle data is retrieved from AutomotiveDataset.com, it will be injected into the conversation. Ground all your responses in this data.

You are AAIA. You make automotive enterprises smarter.`;

class AAIAService {

  // ── Main chat method (Grok with Gemini fallback) ───────────────────────────
  static async chat({ messages, sessionId, vehicleContext, enterpriseContext, stream = false, image = null }) {
    try {
      const enrichedMessages = await this.enrichMessages(messages, vehicleContext, image);

      const params = {
        model:      process.env.GROK_MODEL || 'grok-2-latest',
        max_tokens: parseInt(process.env.MAX_TOKENS) || 4096,
        messages:   [
          { role: 'system', content: AAIA_SYSTEM_PROMPT },
          ...enrichedMessages
        ]
      };

      if (stream) {
        return this.streamResponse(params, sessionId, enrichedMessages);
      }

      let response;
      try {
        response = await getOpenAIClient().chat.completions.create(params);
        const result = {
          content:      response.choices[0].message.content,
          inputTokens:  response.usage.prompt_tokens,
          outputTokens: response.usage.completion_tokens,
          model:        response.model,
          sessionId
        };
        await this.cacheInteraction(sessionId, messages, result);
        return result;
      } catch (err) {
        logger.warn(`Grok failed (${err.message}). Falling back to Gemini.`);
        const model = getGeminiClient().getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          systemInstruction: AAIA_SYSTEM_PROMPT
        });
        const contents = enrichedMessages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));
        const geminiRes = await model.generateContent({ contents });
        const text = geminiRes.response.text();
        
        const result = {
          content:      text,
          inputTokens:  0, // Gemini SDK doesn't always expose this easily
          outputTokens: 0,
          model: 'gemini-2.5-flash',
          sessionId
        };
        await this.cacheInteraction(sessionId, messages, result);
        return result;
      }

    } catch (error) {
      logger.error('AAIA chat error:', error);
      throw this.handleAPIError(error);
    }
  }

  // ── Streaming response (Grok with Gemini fallback) ────────────────────────
  static async* streamResponse(params, sessionId, enrichedMessages) {
    try {
      const stream = await getOpenAIClient().chat.completions.create({ ...params, stream: true });
      for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
          yield { 
            type: 'content_block_delta', 
            delta: { type: 'text_delta', text: chunk.choices[0].delta.content } 
          };
        }
      }
    } catch (err) {
      logger.warn(`Grok stream failed (${err.message}). Falling back to Gemini.`);
      const model = getGeminiClient().getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        systemInstruction: AAIA_SYSTEM_PROMPT
      });
      const contents = enrichedMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      const result = await model.generateContentStream({ contents });
      for await (const chunk of result.stream) {
        if (chunk.text()) {
          yield { 
            type: 'content_block_delta', 
            delta: { type: 'text_delta', text: chunk.text() } 
          };
        }
      }
    }
  }

  // ── Vehicle-context aware query ───────────────────────────────────────────
  static async vehicleQuery({ vin, question, sessionId }) {
    try {
      let vehicleData = null;
      if (vin) {
        vehicleData = await VehicleDataService.decodeVIN(vin);
      }

      const vehicleContext = vehicleData
        ? `\n\nVEHICLE DATA FROM AUTOMOTIVEDATA SET.COM:\n${JSON.stringify(vehicleData, null, 2)}\n\nUse this data to ground your response.`
        : '';

      const messages = [
        {
          role: 'user',
          content: `${question}${vehicleContext}`
        }
      ];

      return this.chat({ messages, sessionId });

    } catch (error) {
      logger.error('AAIA vehicle query error:', error);
      throw error;
    }
  }

  // ── Fleet analysis with predictive intelligence ───────────────────────────
  static async fleetAnalysis({ vehicles, analysisType, sessionId }) {
    const fleetSummary = vehicles.map(v =>
      `VIN: ${v.vin}, Mileage: ${v.mileage || 'unknown'}, Age: ${v.age || 'unknown'} years, ` +
      `Last Service: ${v.lastService || 'unknown'}, Make/Model: ${v.make} ${v.model} ${v.year}`
    ).join('\n');

    const prompts = {
      maintenance: `Analyse this fleet and provide a prioritised maintenance schedule for the next 90 days. For each vehicle, identify: (1) immediate maintenance required, (2) upcoming scheduled maintenance, (3) risk of breakdown if not serviced. Rank by urgency and estimated cost impact.\n\nFLEET:\n${fleetSummary}`,
      tco: `Calculate and compare the Total Cost of Ownership for each vehicle in this fleet. Include: depreciation, expected maintenance, fuel costs (estimate), insurance category, and recommend which vehicles should be replaced in the next 12 months.

IMPORTANT: For the final TCO summary, output a strictly formatted JSON code block like this:
\`\`\`json
{
  "type": "tco_breakdown",
  "vin": "4T1BF1FK2EU123456",
  "vehicle": "2022 Toyota Camry SE",
  "depreciation": 9200,
  "fuel": 11250,
  "maintenance": 4800,
  "insurance": "Standard",
  "total": 25250,
  "costPerMile": 0.34,
  "comparisonText": "12% below class average",
  "verdict": "Good value"
}
\`\`\`

FLEET:\n${fleetSummary}`,
      comparison: `Compare the vehicles in this fleet. 

IMPORTANT: Provide a strictly formatted JSON code block like this:
\`\`\`json
{
  "type": "comparison",
  "summary": "The Camry SE edges out the Accord LX by $1,550 over 5 years...",
  "winner": { "name": "Camry SE", "total": 25250, "costPerMile": 0.34 },
  "loser": { "name": "Accord LX", "total": 26800, "costPerMile": 0.36 }
}
\`\`\`

FLEET:\n${fleetSummary}`,
      performance: `Analyse fleet performance patterns. Identify underperforming vehicles, flag anomalies in mileage or maintenance history, and recommend fleet composition optimisations.\n\nFLEET:\n${fleetSummary}`,
      risk: `Assess operational risk across this fleet. Flag vehicles that are: (1) overdue for maintenance, (2) approaching end-of-life, (3) likely to require major repairs in the next 6 months. Provide a risk score (LOW/MEDIUM/HIGH/CRITICAL) for each.\n\nFLEET:\n${fleetSummary}`
    };

    const question = prompts[analysisType] || prompts.maintenance;

    return this.chat({
      messages: [{ role: 'user', content: question }],
      sessionId
    });
  }

  // ── Damage assessment ─────────────────────────────────────────────────────
  static async assessDamage({ damageDescription, vehicleInfo, location, image, sessionId }) {
    const context = `
VEHICLE: ${vehicleInfo?.year || ''} ${vehicleInfo?.make || ''} ${vehicleInfo?.model || ''} ${vehicleInfo?.trim || ''}
VIN: ${vehicleInfo?.vin || 'Not provided'}
LOCATION: ${location || 'Not specified'}
DAMAGE DESCRIPTION: ${damageDescription}`;

    const prompt = `Assess this vehicle damage and provide:

1. SEVERITY CLASSIFICATION using SEV-0 to SEV-5 scale:
   - SEV-0: No damage / cosmetic only
   - SEV-1: Minor scratch/scuff (<6 inches, no dent)
   - SEV-2: Moderate scratch/dent (paintwork required)
   - SEV-3: Significant panel damage (panel repair or replacement)
   - SEV-4: Structural or multi-panel damage
   - SEV-5: Total loss consideration

2. REPAIR METHOD RECOMMENDATION:
   - PDR (Paintless Dent Repair) viability
   - Conventional repair approach
   - Part replacement vs repair decision

3. COST ESTIMATE:
   - Labour hours estimate
   - Parts cost range (if replacement needed)
   - Total repair cost range for the specified location
   - PDR cost if applicable

4. INSURANCE IMPLICATIONS:
   - Claim worthiness vs out-of-pocket repair
   - Impact on vehicle value

${context}`;

    return this.chat({
      messages: [{ role: 'user', content: prompt }],
      image,
      sessionId
    });
  }

  // ── Diagnostic reasoning & repair guide generation (Grok) ─────────────────
  static async generateRepairGuide({ symptoms, vehicleInfo, dtcCodes, sessionId }) {
    const context = `
VEHICLE: ${vehicleInfo?.year || ''} ${vehicleInfo?.make || ''} ${vehicleInfo?.model || ''}
VIN: ${vehicleInfo?.vin || 'Not provided'}
ENGINE: ${vehicleInfo?.engine || 'Unknown'}
DTC CODES: ${dtcCodes?.join(', ') || 'None provided'}
SYMPTOMS: ${symptoms}`;

    const prompt = `Act as an advanced automotive diagnostic reasoning engine. Based on the provided symptoms and vehicle context, generate a structured, step-by-step repair guide and parts list.

Format your response as a strictly formatted JSON object with this exact structure:
{
  "dtcDefinition": "If a DTC is provided, provide its full technical definition here. Otherwise leave empty.",
  "detailedSummary": "Provide a comprehensive, highly detailed executive summary of the issue, potential causes, and overall diagnostic strategy. Explain the symptoms in depth.",
  "nodes": [
    {
      "id": "node-1",
      "type": "diagnostic_step|repair_action|verification",
      "title": "Short title of the step",
      "description": "Highly detailed explanation of what to check or do, providing clear technical depth.",
      "requiredTools": ["Tool 1", "Tool 2"],
      "requiredParts": [
        { "name": "Part Name", "partNumber": "OEM Part Number if known", "estimatedCost": "$XX.XX" }
      ],
      "safetyWarnings": ["Warning 1"],
      "estimatedTime": "XX minutes",
      "nextNodeIds": ["node-2", "node-3"]
    }
  ]
}

${context}

Return ONLY a valid JSON object and absolutely nothing else. Do not use markdown blocks.`;

    try {
      const response = await getOpenAIClient().chat.completions.create({
        model:      process.env.GROK_MODEL || 'grok-2-latest',
        max_tokens: 2500,
        messages:   [
          { role: 'system', content: 'You are a strict JSON-only diagnostic reasoning engine. Return only the JSON object without formatting or markdown code blocks.' },
          { role: 'user', content: prompt }
        ]
      });

      let responseText = response.choices[0].message.content.trim();
      if (responseText.startsWith('```json')) {
        responseText = responseText.substring(7, responseText.length - 3).trim();
      } else if (responseText.startsWith('```')) {
        responseText = responseText.substring(3, responseText.length - 3).trim();
      }
      return JSON.parse(responseText);
    } catch (error) {
      logger.warn(`Grok failed in generateRepairGuide (${error.message}). Falling back to Gemini.`);
      try {
        const model = getGeminiClient().getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          systemInstruction: 'You are a strict JSON-only diagnostic reasoning engine. Return only the JSON object without formatting or markdown code blocks.'
        });
        const geminiRes = await model.generateContent(prompt);
        let responseText = geminiRes.response.text().trim();
        if (responseText.startsWith('```json')) {
          responseText = responseText.substring(7, responseText.length - 3).trim();
        } else if (responseText.startsWith('```')) {
          responseText = responseText.substring(3, responseText.length - 3).trim();
        }
        return JSON.parse(responseText);
      } catch (geminiError) {
        logger.error('Failed to generate diagnostic reasoning nodes with both models:', geminiError);
        throw geminiError;
      }
    }
  }

  // ── Workflow automation intent detection (Grok) ───────────────────────────
  static async detectIntent(message) {
    const prompt = `Analyse this automotive business message and classify the user's intent.

MESSAGE: "${message}"

Return JSON only with this exact structure:
{
  "primaryIntent": "vehicle_lookup|fleet_analysis|damage_assessment|pricing_query|maintenance_schedule|inventory_search|customer_matching|compliance_check|general_query",
  "entities": {
    "vin": "extracted VIN if present or null",
    "make": "vehicle make if mentioned or null",
    "model": "vehicle model if mentioned or null",
    "year": "year if mentioned or null",
    "mileage": "mileage if mentioned or null",
    "budget": "budget if mentioned or null",
    "location": "location if mentioned or null"
  },
  "urgency": "low|medium|high",
  "requiresVehicleData": true|false,
  "confidence": 0.0 to 1.0
}`;

    try {
      const response = await getOpenAIClient().chat.completions.create({
        model:      process.env.GROK_MODEL || 'grok-4.3',
        max_tokens: 500,
        messages:   [
          { role: 'system', content: 'You are a JSON-only response system. Return valid JSON and nothing else.' },
          { role: 'user', content: prompt }
        ]
      });

      let responseText = response.choices[0].message.content.trim();
      if (responseText.startsWith('```json')) {
        responseText = responseText.substring(7, responseText.length - 3).trim();
      } else if (responseText.startsWith('```')) {
        responseText = responseText.substring(3, responseText.length - 3).trim();
      }
      return JSON.parse(responseText);
    } catch (error) {
      return {
        primaryIntent: 'general_query',
        entities: {},
        urgency: 'low',
        requiresVehicleData: false,
        confidence: 0.5
      };
    }
  }

  static async analyzeImage(base64Image) {
    try {
      if (!base64Image.startsWith('data:')) return null;
      
      const mimeType = base64Image.substring(5, base64Image.indexOf(';'));
      const data = base64Image.substring(base64Image.indexOf('base64,') + 7);
      
      const response = await getOpenAIClient().chat.completions.create({
        model: process.env.GROK_MODEL || 'grok-2-latest',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this image in high detail for a text-based AI system. Describe exactly what is shown. If it is a vehicle, identify the make, model, year range, color, and any visible damage. Be objective and extremely descriptive.' },
              { type: 'image_url', image_url: { url: base64Image, detail: 'low' } }
            ]
          }
        ]
      });
      
      return response.choices[0].message.content.trim();
    } catch (error) {
      logger.warn(`Grok image analysis failed (${error.message}). Falling back to Gemini.`);
      try {
        const mimeType = base64Image.substring(5, base64Image.indexOf(';'));
        const data = base64Image.substring(base64Image.indexOf('base64,') + 7);
        const { HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
        const model = getGeminiClient().getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE }
          ]
        });
        const result = await model.generateContent([
          'Analyze this image in high detail for a text-based AI system. Describe exactly what is shown. If it is a vehicle, identify the make, model, year range, color, and any visible damage. Be objective and extremely descriptive.',
          {
            inlineData: {
              data: data,
              mimeType: mimeType
            }
          }
        ]);
        return result.response.text().trim();
      } catch (geminiError) {
        logger.error('Gemini image analysis error:', geminiError);
        return 'Image analysis failed.';
      }
    }
  }

  // ── AI Parts Lookup ─────────────────────────────────────────────────────────
  static async getPartSuggestions(vehicleInfo) {
    const context = `VEHICLE: ${vehicleInfo?.year || ''} ${vehicleInfo?.make || ''} ${vehicleInfo?.model || ''} ${vehicleInfo?.trim || ''} (VIN: ${vehicleInfo?.vin || 'N/A'})`;
    const prompt = `Act as an expert automotive parts specialist. The user is looking for parts for this vehicle:
${context}

Based on this specific vehicle, generate a list of 5 common maintenance or replacement parts that owners often need (e.g. specific oil filters, brake pads, alternators). 

Also provide a friendly conversational prompt asking them which part they are looking for.

Return a STRICT JSON object in this exact format, with no markdown code blocks:
{
  "prompt": "Hi! I see you are looking for parts for your [Vehicle]. Here are some common items. Which specific part do you need?",
  "suggestions": [
    "Premium Ceramic Brake Pads",
    "Cabin Air Filter",
    "Spark Plugs",
    "Alternator",
    "Synthetic Oil Filter"
  ]
}`;

    try {
      const response = await getOpenAIClient().chat.completions.create({
        model: process.env.GROK_MODEL || 'grok-2-1212',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: 'You are a JSON-only API. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ]
      });

      let responseText = response.choices[0].message.content.trim();
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        responseText = match[0];
      }
      return JSON.parse(responseText);
    } catch (err) {
      logger.warn(`Grok failed for getPartSuggestions (${err.message}). Falling back to Gemini.`);
      try {
        const model = getGeminiClient().getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          systemInstruction: 'You are a JSON-only API. Return only valid JSON.'
        });
        const geminiRes = await model.generateContent([prompt]);
        let text = geminiRes.response.text().trim();
        const match = text.match(/\{[\s\S]*\}/);
        if (match) text = match[0];
        return JSON.parse(text);
      } catch (geminiErr) {
        logger.error('AAIA getPartSuggestions Gemini error:', geminiErr);
        return { prompt: "What part are you looking for?", suggestions: ["Brake Pads", "Oil Filter", "Battery", "Alternator"] };
      }
    }
  }

  static async getPartDetails(partQuery, vehicleInfo) {
    const context = vehicleInfo ? `VEHICLE: ${vehicleInfo?.year || ''} ${vehicleInfo?.make || ''} ${vehicleInfo?.model || ''} ${vehicleInfo?.trim || ''}` : `SEARCH QUERY: ${partQuery}`;
    const prompt = `You are an expert parts catalog system. The user wants detailed information for: "${partQuery}" for vehicle: ${context}.

Generate highly realistic technical details and a list of specific parts that match this query.
Return a STRICT JSON object with this exact structure (no markdown blocks):
{
  "status": "success",
  "data": {
    "year": "${vehicleInfo?.year || 'Unknown'}",
    "make": "${vehicleInfo?.make || 'Unknown'}",
    "model": "${vehicleInfo?.model || 'Unknown'}",
    "trim": "${vehicleInfo?.trim || 'Unknown'}",
    "category": "e.g. Engine / Brakes",
    "sub_category": "e.g. Engine Parts",
    "parts": [
      {
        "title": "Full descriptive name of the part",
        "price": "$45.99",
        "part_number": "12345678",
        "alternate_names": "Other common names",
        "description": "Detailed technical description and compatibility.",
        "images": [
          "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=600&h=400"
        ]
      }
    ]
  }
}

Important: Generate 3-5 parts in the array. Use Unsplash URLs as placeholder images (at least 1 image per part). Return ONLY valid JSON.`;

    try {
      const response = await getOpenAIClient().chat.completions.create({
        model: process.env.GROK_MODEL || 'grok-2-1212',
        max_tokens: 2000,
        messages: [
          { role: 'system', content: 'You are a JSON-only API. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ]
      });

      let responseText = response.choices[0].message.content.trim();
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        responseText = match[0];
      }
      return JSON.parse(responseText);
    } catch (err) {
      logger.warn(`Grok failed for getPartDetails (${err.message}). Falling back to Gemini.`);
      try {
        const model = getGeminiClient().getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          systemInstruction: 'You are a JSON-only API. Return only valid JSON.'
        });
        const geminiRes = await model.generateContent([prompt]);
        let text = geminiRes.response.text().trim();
        const match = text.match(/\{[\s\S]*\}/);
        if (match) text = match[0];
        return JSON.parse(text);
      } catch (geminiErr) {
        logger.error('AAIA getPartDetails error:', geminiErr);
        return { 
          status: "error", 
          data: { 
            parts: [{ 
              title: partQuery, part_number: "UNKNOWN", price: "$0.00", 
              description: "Details unavailable. API Error.", images: [] 
            }] 
          } 
        };
      }
    }
  }

  // ── Enrich messages with vehicle data and Gemini analysis ─────────────────
  static async enrichMessages(messages, vehicleContext, image) {
    // 1. Analyze the image using Gemini if present
    let imageAnalysisText = '';
    if (image) {
      imageAnalysisText = await this.analyzeImage(image);
    }

    return messages.map((msg, idx, arr) => {
      // We pass messages transparently to Grok via OpenAI SDK
      if (msg.role === 'system') return null;
      
      if (idx === arr.length - 1 && msg.role === 'user') {
        let contentStr = msg.content || '';
        
        if (imageAnalysisText) {
          contentStr += `\n\n[USER UPLOADED AN IMAGE - AI ANALYSIS]\n${imageAnalysisText}`;
        }
        
        if (vehicleContext) {
          contentStr += `\n\n[VEHICLE DATA CONTEXT]\n${JSON.stringify(vehicleContext, null, 2)}`;
        }
        
        return {
          ...msg,
          content: contentStr || ' '
        };
      }
      return msg;
    }).filter(Boolean);
  }

  static async transcribeAudio(base64Audio) {
    try {
      if (!base64Audio.startsWith('data:')) return '[Audio note received: Invalid format]';
      
      const mimeType = base64Audio.substring(5, base64Audio.indexOf(';'));
      const data = base64Audio.substring(base64Audio.indexOf('base64,') + 7);
      
      return '[Voice transcription unavailable: API region blocked]';
    } catch (error) {
      logger.error('Audio transcription error:', error);
      return '[Audio note received: Transcription failed]';
    }
  }

  // ── Cache interaction for analytics ──────────────────────────────────────
  static async cacheInteraction(sessionId, messages, result) {
    if (!sessionId) return;
    const key = `aaia:session:${sessionId}:last`;
    await set(key, {
      timestamp: new Date().toISOString(),
      messageCount: messages.length,
      tokens: result.inputTokens + result.outputTokens
    }, 86400); // 24h TTL
  }

  // ── Error normalisation ───────────────────────────────────────────────────
  static handleAPIError(error) {
    if (error.status === 429) {
      return { statusCode: 429, message: 'Rate limit reached. Please wait before sending another request.' };
    }
    if (error.status === 401) {
      return { statusCode: 401, message: 'Invalid API key. Check your configuration.' };
    }
    if (error.status === 500) {
      return { statusCode: 503, message: 'AI service temporarily unavailable. Please retry.' };
    }
    return error;
  }
}

module.exports = AAIAService;
