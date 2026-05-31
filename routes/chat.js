const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate, requireCredits } = require('../middleware/auth');
const { chatRateLimiter } = require('../middleware/rateLimiter');
const LumiAIService    = require('../services/LumiAIService');
const ConversationService = require('../services/ConversationService');
const VehicleDataService  = require('../services/VehicleDataService');
const logger = require('../config/logger');

// ── POST /api/chat/message — Standard chat (non-streaming) ───────────────────
router.post('/message',
  authenticate,
  requireCredits(1),
  chatRateLimiter,
  [
    body('message').notEmpty().isString().isLength({ max: 4000 }),
    body('conversationId').optional().isUUID(),
    body('vin').optional().matches(/^[A-HJ-NPR-Z0-9]{17}$/i)
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { message, conversationId, vin } = req.body;
      const userId = req.user.id;

      // Detect user intent for better context
      const intent = await LumiAIService.detectIntent(message);

      // Get or create conversation
      let convId = conversationId;
      if (!convId) {
        const conv = await ConversationService.createConversation({
          userId,
          title: ConversationService.generateTitle(message),
          enterpriseId: req.user.enterprise_id
        });
        convId = conv.id;
      }

      // Get message history for context window
      const history = await ConversationService.getMessageHistory(convId, 20);

      // Fetch vehicle data if VIN provided or detected
      let vehicleContext = null;
      const targetVIN = vin || intent.entities?.vin;
      if (targetVIN && VehicleDataService.validateVIN(targetVIN)) {
        try {
          vehicleContext = await VehicleDataService.decodeVIN(targetVIN);
        } catch (e) {
          logger.warn(`Failed to fetch vehicle data for VIN ${targetVIN}:`, e.message);
        }
      }

      // Build message array: history + new message
      const messages = [
        ...history,
        { role: 'user', content: message }
      ];

      // Call LUMI AI
      const aiResponse = await LumiAIService.chat({
        messages,
        sessionId:       convId,
        vehicleContext,
        enterpriseContext: req.user.enterprise_id
      });

      // Save both messages to DB
      await ConversationService.saveMessage({
        conversationId: convId,
        role:    'user',
        content: message,
        metadata: { intent, vin: targetVIN || null }
      });

      await ConversationService.saveMessage({
        conversationId: convId,
        role:    'assistant',
        content: aiResponse.content,
        metadata: {
          inputTokens:  aiResponse.inputTokens,
          outputTokens: aiResponse.outputTokens,
          model:        aiResponse.model
        }
      });

      // Deduct credit
      if (req.user.plan_type !== 'enterprise' && req.user.role !== 'admin') {
        const { query } = require('../config/database');
        await query('UPDATE users SET credits = credits - 1 WHERE id = $1', [req.user.id]);
      }

      res.json({
        success: true,
        data: {
          conversationId: convId,
          message:        aiResponse.content,
          intent,
          vehicleData:    vehicleContext,
          usage: {
            inputTokens:  aiResponse.inputTokens,
            outputTokens: aiResponse.outputTokens
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/chat/stream — Streaming chat (SSE) ──────────────────────────────
router.post('/stream',
  authenticate,
  requireCredits(1),
  chatRateLimiter,
  [
    body('message').optional().isString().isLength({ max: 4000 }),
    body('image').optional().isString(),
    body('voice').optional().isString()
  ],
  async (req, res, next) => {
    try {
      let { message, conversationId, vin, image, voice, vehicleContext } = req.body;
      const userId = req.user.id;
      const VehicleDataService = require('../services/VehicleDataService');

      if (voice) {
        const transcript = await LumiAIService.transcribeAudio(voice);
        message = (message || '') + (message ? '\n\n' : '') + `[Voice Transcription]\n${transcript}`;
      }
      
      if (!message && !image) {
        return res.status(400).json({ success: false, error: 'Message, image, or voice is required' });
      }

      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      // Get conversation history
      let convId = conversationId;
      if (!convId) {
        const conv = await ConversationService.createConversation({
          userId,
          title: ConversationService.generateTitle(message),
          enterpriseId: req.user.enterprise_id
        });
        convId = conv.id;
        res.write(`data: ${JSON.stringify({ type: 'conversation_id', id: convId })}\n\n`);
      }

      const history = await ConversationService.getMessageHistory(convId, 20);
      const messages = [...history, { role: 'user', content: message }];

      // Save user message immediately
      await ConversationService.saveMessage({
        conversationId: convId,
        role:    'user',
        content: message || '[Image Attachment]',
        metadata: { hasImage: !!image, hasVoice: !!voice }
      });

      // Detect VIN in message if vehicleContext not already provided
      if (!vehicleContext && message) {
        const vinMatch = message.match(/\b[A-HJ-NPR-Z0-9]{17}\b/i);
        if (vinMatch) {
          try {
            vehicleContext = await VehicleDataService.decodeVIN(vinMatch[0]);
          } catch (e) {
            console.error('Failed to decode detected VIN:', e);
          }
        }
      }

      // Start streaming
      let fullResponse = '';
      const stream = await LumiAIService.chat({ messages, sessionId: convId, stream: true, image, vehicleContext });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text;
          fullResponse += text;
          res.write(`data: ${JSON.stringify({ type: 'token', text })}\n\n`);
        }
      }

      // Save complete AI response
      await ConversationService.saveMessage({
        conversationId: convId,
        role:    'assistant',
        content: fullResponse
      });

      // Deduct credit
      if (req.user.plan_type !== 'enterprise' && req.user.role !== 'admin') {
        const { query } = require('../config/database');
        await query('UPDATE users SET credits = credits - 1 WHERE id = $1', [req.user.id]);
      }

      res.write(`data: ${JSON.stringify({ type: 'done', conversationId: convId })}\n\n`);
      res.end();

    } catch (error) {
      if (!res.headersSent) {
        next(error);
      } else {
        res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
        res.end();
      }
    }
  }
);

// ── GET /api/chat/conversations — List user conversations ─────────────────────
router.get('/conversations', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await ConversationService.getUserConversations(
      req.user.id,
      { page: parseInt(page), limit: parseInt(limit) }
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/chat/conversations/:id — Get conversation detail ─────────────────
router.get('/conversations/:id', authenticate, async (req, res, next) => {
  try {
    const conversation = await ConversationService.getConversation(req.params.id, req.user.id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }
    res.json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /api/chat/conversations/:id — Delete conversation ──────────────────
router.delete('/conversations/:id', authenticate, async (req, res, next) => {
  try {
    const deleted = await ConversationService.deleteConversation(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
