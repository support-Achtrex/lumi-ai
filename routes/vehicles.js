const express = require('express');
const router  = express.Router();
const { param, query, body, validationResult } = require('express-validator');
const { authenticate, requireCredits } = require('../middleware/auth');
const { vehicleRateLimiter } = require('../middleware/rateLimiter');
const VehicleDataService = require('../services/VehicleDataService');
const LumiAIService      = require('../services/LumiAIService');

// ── GET /api/vehicles/decode/:vin ─────────────────────────────────────────────
router.get('/decode/:vin',
  authenticate,
  vehicleRateLimiter,
  [param('vin').isLength({ min: 17, max: 17 }).matches(/^[A-HJ-NPR-Z0-9]{17}$/i)],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Invalid VIN format' });
      }

      const data = await VehicleDataService.decodeVIN(req.params.vin);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/vehicles/:vin/full — Decode + history + pricing in one call ──────
router.get('/:vin/full',
  authenticate,
  requireCredits(1),
  vehicleRateLimiter,
  async (req, res, next) => {
    try {
      const { vin } = req.params;
      const { mileage, condition, zipCode } = req.query;

      if (!VehicleDataService.validateVIN(vin)) {
        return res.status(400).json({ success: false, error: 'Invalid VIN' });
      }

      // Fetch all data in parallel
      const [specs, history, recalls, pricing] = await Promise.allSettled([
        VehicleDataService.decodeVIN(vin),
        VehicleDataService.getHistory(vin),
        VehicleDataService.getRecalls(vin),
        mileage ? VehicleDataService.getMarketPricing(vin, parseInt(mileage), condition || 'good', zipCode) : Promise.resolve(null)
      ]);

      // Deduct credit
      if (req.user.plan_type !== 'enterprise' && req.user.role !== 'admin') {
        const { query } = require('../config/database');
        await query('UPDATE users SET credits = credits - 1 WHERE id = $1', [req.user.id]);
      }

      res.json({
        success: true,
        data: {
          vin,
          specifications: specs.status === 'fulfilled'  ? specs.value    : null,
          history:        history.status === 'fulfilled' ? history.value  : null,
          recalls:        recalls.status === 'fulfilled' ? recalls.value  : null,
          pricing:        pricing.status === 'fulfilled' ? pricing.value  : null,
          errors: {
            specifications: specs.status === 'rejected'  ? specs.reason?.message  : null,
            history:        history.status === 'rejected' ? history.reason?.message : null,
            recalls:        recalls.status === 'rejected' ? recalls.reason?.message : null,
            pricing:        pricing.status === 'rejected' ? pricing.reason?.message : null,
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/vehicles/:vin/pricing ────────────────────────────────────────────
router.get('/:vin/pricing',
  authenticate,
  async (req, res, next) => {
    try {
      const { vin } = req.params;
      const { mileage, condition = 'good', zipCode } = req.query;

      if (!mileage) {
        return res.status(400).json({ success: false, error: 'mileage parameter is required' });
      }

      const data = await VehicleDataService.getMarketPricing(vin, parseInt(mileage), condition, zipCode);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/vehicles/:vin/history ────────────────────────────────────────────
router.get('/:vin/history', authenticate, async (req, res, next) => {
  try {
    const data = await VehicleDataService.getHistory(req.params.vin);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/vehicles/:vin/recalls ────────────────────────────────────────────
router.get('/:vin/recalls', authenticate, async (req, res, next) => {
  try {
    const data = await VehicleDataService.getRecalls(req.params.vin);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/vehicles/batch ───────────────────────────────────────────────────
router.post('/batch',
  authenticate,
  [body('vins').isArray({ min: 1, max: 50 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const data = await VehicleDataService.batchDecodeVINs(req.body.vins);
      res.json({ success: true, data, count: data.length });
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/vehicles/search ──────────────────────────────────────────────────
router.get('/search',
  authenticate,
  async (req, res, next) => {
    try {
      const { make, model, yearFrom, yearTo, bodyStyle, fuelType, limit } = req.query;
      const data = await VehicleDataService.searchVehicles({
        make, model, yearFrom: yearFrom ? parseInt(yearFrom) : undefined,
        yearTo: yearTo ? parseInt(yearTo) : undefined,
        bodyStyle, fuelType, limit: limit ? parseInt(limit) : 20
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/vehicles/:vin/ask — Ask LUMI AI about this specific vehicle ─────
router.post('/:vin/ask',
  authenticate,
  [body('question').notEmpty().isString().isLength({ max: 2000 })],
  async (req, res, next) => {
    try {
      const { vin } = req.params;
      const { question } = req.body;

      const response = await LumiAIService.vehicleQuery({
        vin,
        question,
        sessionId: `vehicle:${vin}:${req.user.id}`
      });

      res.json({ success: true, data: { answer: response.content, vin } });
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/vehicles/:vin/depreciation ───────────────────────────────────────
router.get('/:vin/depreciation',
  authenticate,
  async (req, res, next) => {
    try {
      const { mileage, years = 5 } = req.query;
      if (!mileage) {
        return res.status(400).json({ success: false, error: 'mileage parameter is required' });
      }
      const data = await VehicleDataService.getDepreciation(req.params.vin, parseInt(mileage), parseInt(years));
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
