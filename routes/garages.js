const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const logger = require('../config/logger');
const PartnerStore = require('../services/PartnerStore');

// ── GET /api/garages — List & Filter Garages & Mobile Mechanics ───────────────
router.get('/', optionalAuth, (req, res) => {
  try {
    const { type, service, search, isMobileOnly } = req.query;
    const results = PartnerStore.getGarages({
      type,
      service,
      search,
      isMobileOnly,
      isPublic: true
    });

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    logger.error('Error fetching garages:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve partner directory' });
  }
});

// ── GET /api/garages/:id — Details ──────────────────────────────────────────
router.get('/:id', optionalAuth, (req, res) => {
  const garage = PartnerStore.getGarageById(req.params.id);
  if (!garage) {
    return res.status(404).json({ success: false, error: 'Partner not found' });
  }
  res.json({ success: true, data: garage });
});

// ── POST /api/garages/onboard — Partner Onboarding Form ──────────────────────
router.post('/onboard', optionalAuth, (req, res) => {
  try {
    const {
      name,
      tagline,
      type,
      isMobileCapable,
      phone,
      email,
      address,
      city,
      state,
      zip,
      latitude,
      longitude,
      serviceRadiusMiles,
      hourlyRate,
      servicesOffered,
      bio,
      logo,
      image
    } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ success: false, error: 'Business name, phone, and email are required.' });
    }

    const newPartner = PartnerStore.createGarage({
      name,
      tagline,
      type,
      isMobileCapable,
      phone,
      email,
      address,
      city,
      state,
      zip,
      latitude,
      longitude,
      serviceRadiusMiles,
      hourlyRate,
      servicesOffered,
      bio,
      logo,
      image,
      approvalStatus: 'approved'
    });

    res.status(201).json({
      success: true,
      message: 'Successfully registered with the AAIA Partner Network!',
      data: newPartner
    });
  } catch (error) {
    logger.error('Error onboarding partner:', error);
    res.status(500).json({ success: false, error: 'Failed to onboard partner garage.' });
  }
});

module.exports = router;
