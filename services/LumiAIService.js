const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../config/logger');
const { get, set, DEFAULT_TTL } = require('../config/redis');
const VehicleDataService = require('./VehicleDataService');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// ── LUMI AI Core System Prompt ────────────────────────────────────────────────
// This is the heart of LUMI AI — the automotive-domain reasoning layer
const LUMI_SYSTEM_PROMPT = `You are LUMI AI, the automotive intelligence engine built by Achtrex.

You are the world's first LLM-powered automotive reasoning engine purpose-built for enterprise clients — dealerships, insurance companies, fleet operators, and automotive developers.

CORE IDENTITY:
- Product: LUMI AI by Achtrex (achtrex.com)
- Purpose: Enterprise automotive intelligence — not consumer-facing advice
- Tone: Professional, precise, data-driven. You are an expert system, not a chatbot.
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
- For fleet recommendations, always consider total cost of ownership, not just acquisition cost.
- Think in enterprise terms: your users are making business decisions, not personal ones.

RESPONSE FORMATTING:
- Structure long answers with clear sections
- Use specific numbers wherever possible (percentages, dollar amounts, timeframes)
- For vehicle recommendations, always include: rationale, alternatives considered, caveats
- For fleet analytics: always include projected ROI or cost impact
- Keep responses concise but complete — enterprise users value precision over length

LIMITATIONS — BE TRANSPARENT ABOUT THESE:
- You do not have real-time inventory data unless provided via tool call
- Market pricing estimates are based on historical patterns — live market may vary
- Repair cost estimates vary significantly by region and shop rates
- Always recommend verification with a certified technician for safety-critical items

CURRENT DATA CONTEXT:
When vehicle data is retrieved from AutomotiveDataset.com, it will be injected into the conversation. Ground all your responses in this data.

You are LUMI AI. You make automotive enterprises smarter.`;

class LumiAIService {

  // ── Main chat method — supports both streaming and non-streaming ──────────
  static async chat({ messages, sessionId, vehicleContext, enterpriseContext, stream = false }) {
    try {
      // Build message array with vehicle data injection
      const enrichedMessages = await this.enrichMessages(messages, vehicleContext);

      const params = {
        model:      process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS) || 4096,
        system:     LUMI_SYSTEM_PROMPT,
        messages:   enrichedMessages
      };

      if (stream) {
        return this.streamResponse(params, sessionId);
      }

      const response = await anthropic.messages.create(params);

      const result = {
        content:      response.content[0].text,
        inputTokens:  response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        model:        response.model,
        sessionId
      };

      // Cache the response for analytics
      await this.cacheInteraction(sessionId, messages, result);

      return result;

    } catch (error) {
      logger.error('LUMI AI chat error:', error);
      throw this.handleAPIError(error);
    }
  }

  // ── Streaming response using Server-Sent Events ───────────────────────────
  static async streamResponse(params, sessionId) {
    const stream = await anthropic.messages.stream(params);
    return stream;
  }

  // ── Vehicle-context aware query ───────────────────────────────────────────
  static async vehicleQuery({ vin, question, sessionId }) {
    try {
      // Fetch vehicle data from AutomotiveDataset.com
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
      logger.error('LUMI AI vehicle query error:', error);
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
      tco: `Calculate and compare the Total Cost of Ownership for each vehicle in this fleet. Include: depreciation, expected maintenance, fuel costs (estimate), insurance category, and recommend which vehicles should be replaced in the next 12 months.\n\nFLEET:\n${fleetSummary}`,
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
  static async assessDamage({ damageDescription, vehicleInfo, location, sessionId }) {
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
      sessionId
    });
  }

  // ── Diagnostic reasoning & repair guide generation (Node Editor) ────────────
  static async generateRepairGuide({ symptoms, vehicleInfo, dtcCodes, sessionId }) {
    const context = `
VEHICLE: ${vehicleInfo?.year || ''} ${vehicleInfo?.make || ''} ${vehicleInfo?.model || ''}
VIN: ${vehicleInfo?.vin || 'Not provided'}
ENGINE: ${vehicleInfo?.engine || 'Unknown'}
DTC CODES: ${dtcCodes?.join(', ') || 'None provided'}
SYMPTOMS: ${symptoms}`;

    const prompt = `Act as an advanced automotive diagnostic reasoning engine. Based on the provided symptoms and vehicle context, generate a structured, step-by-step repair guide and parts list.

Format your response as a JSON array representing diagnostic "nodes" in a decision tree. Each node should have this exact structure:
[
  {
    "id": "node-1",
    "type": "diagnostic_step|repair_action|verification",
    "title": "Short title of the step",
    "description": "Detailed explanation of what to check or do",
    "requiredTools": ["Tool 1", "Tool 2"],
    "requiredParts": [
      { "name": "Part Name", "partNumber": "OEM Part Number if known", "estimatedCost": "$XX.XX" }
    ],
    "safetyWarnings": ["Warning 1"],
    "estimatedTime": "XX minutes",
    "nextNodeIds": ["node-2", "node-3"] // Branching logic depending on findings
  }
]

${context}

Return ONLY a valid JSON array and absolutely nothing else. Do not use markdown blocks.`;

    try {
      const response = await anthropic.messages.create({
        model:      process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        system:     'You are a strict JSON-only diagnostic reasoning engine. Return only the JSON array of nodes without formatting or markdown code blocks.',
        messages:   [{ role: 'user', content: prompt }]
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      logger.error('Failed to generate diagnostic reasoning nodes:', error);
      throw error;
    }
  }

  // ── Workflow automation intent detection ──────────────────────────────────
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
      const response = await anthropic.messages.create({
        model:      process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system:     'You are a JSON-only response system. Return valid JSON and nothing else.',
        messages:   [{ role: 'user', content: prompt }]
      });

      return JSON.parse(response.content[0].text);
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

  // ── Enrich messages with vehicle data context ─────────────────────────────
  static async enrichMessages(messages, vehicleContext) {
    if (!vehicleContext) return messages;

    // Inject vehicle data into the last user message
    return messages.map((msg, idx) => {
      if (idx === messages.length - 1 && msg.role === 'user') {
        return {
          ...msg,
          content: `${msg.content}\n\n[VEHICLE DATA CONTEXT]\n${JSON.stringify(vehicleContext, null, 2)}`
        };
      }
      return msg;
    });
  }

  // ── Cache interaction for analytics ──────────────────────────────────────
  static async cacheInteraction(sessionId, messages, result) {
    if (!sessionId) return;
    const key = `lumi:session:${sessionId}:last`;
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
      return { statusCode: 401, message: 'Invalid Anthropic API key. Check your configuration.' };
    }
    if (error.status === 500) {
      return { statusCode: 503, message: 'AI service temporarily unavailable. Please retry.' };
    }
    return error;
  }
}

module.exports = LumiAIService;
