const express = require('express');
const router  = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const LumiAIService = require('../services/LumiAIService');
const VehicleDataService = require('../services/VehicleDataService');

// ── POST /api/diagnostics/assess — Damage assessment ─────────────────────────
router.post('/assess',
  authenticate,
  [
    body('damageDescription').notEmpty().isString().isLength({ max: 2000 }),
    body('vin').optional().matches(/^[A-HJ-NPR-Z0-9]{17}$/i),
    body('location').optional().isString()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { damageDescription, vin, location } = req.body;

      // Fetch vehicle info if VIN provided
      let vehicleInfo = null;
      if (vin) {
        try {
          vehicleInfo = await VehicleDataService.decodeVIN(vin);
        } catch (e) {
          // Non-fatal — continue without vehicle context
        }
      }

      const assessment = await LumiAIService.assessDamage({
        damageDescription,
        vehicleInfo,
        location,
        sessionId: `damage:${req.user.id}:${Date.now()}`
      });

      res.json({
        success: true,
        data: {
          assessment:  assessment.content,
          vehicleInfo,
          location,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/diagnostics/maintenance — Maintenance recommendation ────────────
router.post('/maintenance',
  authenticate,
  [
    body('vin').notEmpty().matches(/^[A-HJ-NPR-Z0-9]{17}$/i),
    body('mileage').isInt({ min: 0 }),
    body('lastServiceMileage').optional().isInt({ min: 0 }),
    body('symptoms').optional().isString()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { vin, mileage, lastServiceMileage, symptoms } = req.body;

      const vehicleData = await VehicleDataService.decodeVIN(vin);

      const prompt = `Provide a detailed maintenance assessment for this vehicle:

VEHICLE: ${vehicleData.year} ${vehicleData.make} ${vehicleData.model} ${vehicleData.trim || ''}
VIN: ${vin}
CURRENT MILEAGE: ${mileage.toLocaleString()} miles
LAST SERVICE MILEAGE: ${lastServiceMileage ? lastServiceMileage.toLocaleString() + ' miles' : 'Unknown'}
REPORTED SYMPTOMS: ${symptoms || 'None reported'}
ENGINE: ${vehicleData.engine || 'Not specified'}
FUEL TYPE: ${vehicleData.fuelType || 'Not specified'}

Provide:
1. IMMEDIATE ATTENTION items (safety-critical or overdue)
2. SCHEDULED MAINTENANCE due now or within 1,000 miles
3. UPCOMING MAINTENANCE in the next 5,000 miles
4. ESTIMATED TOTAL COST for all recommended services
5. PRIORITY ranking: CRITICAL / HIGH / MEDIUM / LOW for each item`;

      const response = await LumiAIService.chat({
        messages: [{ role: 'user', content: prompt }],
        sessionId: `maintenance:${vin}:${req.user.id}`
      });

      res.json({
        success: true,
        data: {
          vin,
          mileage,
          vehicle:    vehicleData,
          assessment: response.content,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/diagnostics/tco — Total Cost of Ownership calculation ───────────
router.post('/tco',
  authenticate,
  [
    body('vin').notEmpty().matches(/^[A-HJ-NPR-Z0-9]{17}$/i),
    body('currentMileage').isInt({ min: 0 }),
    body('annualMileage').isInt({ min: 1000, max: 200000 }),
    body('ownershipYears').isInt({ min: 1, max: 10 }),
    body('fuelPricePerGallon').optional().isFloat()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { vin, currentMileage, annualMileage, ownershipYears, fuelPricePerGallon } = req.body;

      const [vehicleData, pricing, depreciation] = await Promise.all([
        VehicleDataService.decodeVIN(vin),
        VehicleDataService.getMarketPricing(vin, currentMileage),
        VehicleDataService.getDepreciation(vin, currentMileage, ownershipYears)
      ]);

      const prompt = `Calculate the Total Cost of Ownership (TCO) for this vehicle over ${ownershipYears} year(s):

VEHICLE: ${vehicleData.year} ${vehicleData.make} ${vehicleData.model} ${vehicleData.trim || ''}
CURRENT MILEAGE: ${currentMileage.toLocaleString()} miles
ANNUAL MILEAGE: ${annualMileage.toLocaleString()} miles
OWNERSHIP PERIOD: ${ownershipYears} year(s)
CURRENT MARKET VALUE: $${pricing?.retailValue?.toLocaleString() || 'Unknown'}
FUEL TYPE: ${vehicleData.fuelType || 'Unknown'}
FUEL PRICE: $${fuelPricePerGallon || 3.50}/gallon
MPG: ${vehicleData.cityMpg || '?'} city / ${vehicleData.highwayMpg || '?'} highway
DEPRECIATION DATA: ${JSON.stringify(depreciation || {})}

Calculate and break down:
1. DEPRECIATION cost over the period
2. FUEL COST estimate
3. INSURANCE category estimate (no specific rates — use class)
4. MAINTENANCE & REPAIR estimates by year
5. TOTAL TCO and cost per mile
6. COMPARISON: Is this vehicle above/below average TCO for its class?
7. RECOMMENDATION: Keep, sell now, or replacement timeline`;

      const response = await LumiAIService.chat({
        messages: [{ role: 'user', content: prompt }],
        sessionId: `tco:${vin}:${req.user.id}`
      });

      res.json({
        success: true,
        data: {
          vin, currentMileage, annualMileage, ownershipYears,
          vehicle:     vehicleData,
          marketData:  pricing,
          tcoAnalysis: response.content,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/diagnostics/reasoning — Diagnostic Node Editor ──────────────────
router.post('/reasoning',
  authenticate,
  [
    body('symptoms').notEmpty().isString(),
    body('vin').optional().matches(/^[A-HJ-NPR-Z0-9]{17}$/i),
    body('dtcCodes').optional().isArray()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { symptoms, vin, dtcCodes } = req.body;

      let vehicleInfo = null;
      if (vin) {
        try {
          vehicleInfo = await VehicleDataService.decodeVIN(vin);
        } catch (e) {
          // Ignore fetch error
        }
      }

      const reasoningNodes = await LumiAIService.generateRepairGuide({
        symptoms,
        vehicleInfo,
        dtcCodes,
        sessionId: `reasoning:${req.user.id}:${Date.now()}`
      });

      res.json({
        success: true,
        data: {
          nodes: reasoningNodes,
          vehicleInfo,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
