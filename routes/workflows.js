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

module.exports = router;
