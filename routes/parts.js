const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const logger = require('../config/logger');
const AAIAService = require('../services/AAIAService');
const VehicleDataService = require('../services/VehicleDataService');

// Require authentication for all parts routes
router.use(authenticate);

// ── Search/Suggest Endpoint ───────────────────────────────────────────────────
router.post('/suggest', async (req, res) => {
  try {
    const { mode, query } = req.body;
    logger.info(`[Parts AI] Suggest requested. Mode: ${mode}, Query: ${JSON.stringify(query)}`);
    
    let vehicleInfo = null;

    if (mode === 'vin') {
      vehicleInfo = await VehicleDataService.decodeVIN(query.vin);
    } else if (mode === 'ymmt') {
      vehicleInfo = {
        year: query.year,
        make: query.make,
        model: query.model,
        trim: query.trim || 'Base'
      };
    }

    if (!vehicleInfo && mode !== 'oem') {
      return res.status(400).json({ success: false, error: 'Failed to identify vehicle' });
    }

    const aiResponse = await AAIAService.getPartSuggestions(vehicleInfo);
    
    res.json({ success: true, vehicleInfo, ...aiResponse });
  } catch (error) {
    logger.error('[Parts AI] Suggest error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate part suggestions' });
  }
});

// ── Part Details Endpoint ─────────────────────────────────────────────────────
router.post('/details', async (req, res) => {
  try {
    const { partQuery, vehicleInfo } = req.body;
    logger.info(`[Parts AI] Details requested. Query: ${partQuery}`);
    
    const aiResponse = await AAIAService.getPartDetails(partQuery, vehicleInfo);
    
    res.json({ success: true, ...aiResponse });
  } catch (error) {
    logger.error('[Parts AI] Details error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch part details' });
  }
});

module.exports = router;
