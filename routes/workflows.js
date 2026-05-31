// routes/workflows.js — Workflow automation routes
const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const LumiAIService = require('../services/LumiAIService');

// ── POST /api/workflows/automate — Detect intent and route to workflow ────────
router.post('/automate',
  authenticate,
  [body('input').notEmpty().isString().isLength({ max: 2000 })],
  async (req, res, next) => {
    try {
      const { input } = req.body;

      // Use LUMI AI to detect intent and determine workflow
      const intent = await LumiAIService.detectIntent(input);

      // Route to appropriate handler based on intent
      const workflows = {
        vehicle_lookup:     'Routing to vehicle intelligence module',
        fleet_analysis:     'Routing to fleet analytics module',
        damage_assessment:  'Routing to damage assessment module',
        pricing_query:      'Routing to market pricing module',
        maintenance_schedule: 'Routing to maintenance scheduler',
        inventory_search:   'Routing to inventory search module',
        general_query:      'Routing to general LUMI AI chat'
      };

      res.json({
        success: true,
        data: {
          intent,
          workflow:  workflows[intent.primaryIntent] || workflows.general_query,
          nextAction: intent.primaryIntent,
          entities:   intent.entities
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/workflows — List workflows ───────────────────────────────────────
router.get('/', authenticate, async (req, res, next) => {
  try {
    // Auto-create table if not exists
    await require('../config/database').query(`
      CREATE TABLE IF NOT EXISTS workflows (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name            VARCHAR(200) NOT NULL,
        trigger_type    VARCHAR(50) NOT NULL,
        trigger_config  JSONB NOT NULL DEFAULT '{}',
        action_type     VARCHAR(50) NOT NULL,
        action_config   JSONB NOT NULL DEFAULT '{}',
        is_active       BOOLEAN NOT NULL DEFAULT true,
        created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    const result = await require('../config/database').query(
      'SELECT * FROM workflows WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows || [] });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/workflows — Create workflow ─────────────────────────────────────
router.post('/',
  authenticate,
  [
    body('name').notEmpty().isString(),
    body('trigger_type').notEmpty().isString(),
    body('trigger_config').isObject(),
    body('action_type').notEmpty().isString(),
    body('action_config').isObject()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { name, trigger_type, trigger_config, action_type, action_config } = req.body;
      const { v4: uuidv4 } = require('uuid');
      const id = uuidv4();

      await require('../config/database').query(
        `INSERT INTO workflows (id, user_id, name, trigger_type, trigger_config, action_type, action_config)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, req.user.id, name, trigger_type, JSON.stringify(trigger_config), action_type, JSON.stringify(action_config)]
      );

      res.status(201).json({ success: true, data: { id, name, trigger_type, action_type } });
    } catch (error) {
      next(error);
    }
  }
);

// ── DELETE /api/workflows/:id ─────────────────────────────────────────────────
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await require('../config/database').query(
      'DELETE FROM workflows WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Workflow deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
