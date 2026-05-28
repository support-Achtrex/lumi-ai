const express = require('express');
const router  = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate, requireRole } = require('../middleware/auth');
const { query } = require('../config/database');
const LumiAIService      = require('../services/LumiAIService');
const VehicleDataService = require('../services/VehicleDataService');
const { v4: uuidv4 } = require('uuid');

// ── POST /api/fleet — Create fleet ────────────────────────────────────────────
router.post('/',
  authenticate,
  [
    body('name').notEmpty().isString(),
    body('description').optional().isString()
  ],
  async (req, res, next) => {
    try {
      const { name, description } = req.body;
      const id = uuidv4();

      const result = await query(
        `INSERT INTO fleets (id, user_id, enterprise_id, name, description, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
        [id, req.user.id, req.user.enterprise_id || null, name, description || null]
      );

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/fleet — List user fleets ─────────────────────────────────────────
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT f.*, COUNT(fv.id) as vehicle_count
       FROM fleets f
       LEFT JOIN fleet_vehicles fv ON f.id = fv.fleet_id
       WHERE f.user_id = $1 AND f.deleted_at IS NULL
       GROUP BY f.id ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/fleet/:id/vehicles — Add vehicles to fleet ─────────────────────
router.post('/:id/vehicles',
  authenticate,
  [body('vins').isArray({ min: 1, max: 50 })],
  async (req, res, next) => {
    try {
      const { vins } = req.body;
      const fleetId = req.params.id;

      // Verify fleet belongs to user
      const fleet = await query('SELECT id FROM fleets WHERE id = $1 AND user_id = $2', [fleetId, req.user.id]);
      if (fleet.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Fleet not found' });
      }

      // Validate and fetch vehicle data
      const vehicleData = await VehicleDataService.batchDecodeVINs(vins);

      // Insert fleet vehicles
      const insertedVINs = [];
      for (const vehicle of vehicleData) {
        const id = uuidv4();
        await query(
          `INSERT INTO fleet_vehicles (id, fleet_id, vin, vehicle_data, added_at)
           VALUES ($1, $2, $3, $4, NOW())
           ON CONFLICT (fleet_id, vin) DO UPDATE SET vehicle_data = $4`,
          [id, fleetId, vehicle.vin, JSON.stringify(vehicle)]
        );
        insertedVINs.push(vehicle.vin);
      }

      res.json({
        success: true,
        message: `${insertedVINs.length} vehicles added to fleet`,
        data: { added: insertedVINs }
      });
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/fleet/:id/vehicles — Get fleet vehicles ─────────────────────────
router.get('/:id/vehicles', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT fv.*, f.name as fleet_name
       FROM fleet_vehicles fv
       JOIN fleets f ON fv.fleet_id = f.id
       WHERE fv.fleet_id = $1 AND f.user_id = $2
       ORDER BY fv.added_at DESC`,
      [req.params.id, req.user.id]
    );

    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/fleet/:id/analyse — LUMI AI fleet intelligence ─────────────────
router.post('/:id/analyse',
  authenticate,
  [body('analysisType').isIn(['maintenance', 'tco', 'performance', 'risk'])],
  async (req, res, next) => {
    try {
      const { analysisType } = req.body;
      const fleetId = req.params.id;

      // Get fleet vehicles
      const vehiclesResult = await query(
        `SELECT vin, vehicle_data, mileage, last_service_date
         FROM fleet_vehicles fv
         JOIN fleets f ON fv.fleet_id = f.id
         WHERE fv.fleet_id = $1 AND f.user_id = $2`,
        [fleetId, req.user.id]
      );

      if (vehiclesResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Fleet not found or empty' });
      }

      const vehicles = vehiclesResult.rows.map(v => ({
        vin:         v.vin,
        mileage:     v.mileage,
        lastService: v.last_service_date,
        ...v.vehicle_data
      }));

      const analysis = await LumiAIService.fleetAnalysis({
        vehicles,
        analysisType,
        sessionId: `fleet:${fleetId}:${analysisType}`
      });

      // Store analysis result
      await query(
        `UPDATE fleets SET last_analysis = $1, last_analysis_type = $2, last_analysis_at = NOW()
         WHERE id = $3`,
        [analysis.content, analysisType, fleetId]
      );

      res.json({
        success: true,
        data: {
          analysisType,
          fleetId,
          vehicleCount: vehicles.length,
          analysis:     analysis.content,
          generatedAt:  new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// ── PUT /api/fleet/:id/vehicles/:vin — Update vehicle data (mileage, etc.) ────
router.put('/:id/vehicles/:vin',
  authenticate,
  async (req, res, next) => {
    try {
      const { mileage, lastServiceDate, notes } = req.body;

      await query(
        `UPDATE fleet_vehicles SET
           mileage = COALESCE($1, mileage),
           last_service_date = COALESCE($2, last_service_date),
           notes = COALESCE($3, notes),
           updated_at = NOW()
         FROM fleets f
         WHERE fleet_vehicles.fleet_id = f.id
           AND fleet_vehicles.fleet_id = $4
           AND fleet_vehicles.vin = $5
           AND f.user_id = $6`,
        [mileage || null, lastServiceDate || null, notes || null, req.params.id, req.params.vin, req.user.id]
      );

      res.json({ success: true, message: 'Vehicle updated' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
