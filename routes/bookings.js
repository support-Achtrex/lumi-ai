const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const logger = require('../config/logger');
const PartnerStore = require('../services/PartnerStore');

// ── GET /api/bookings — Get all bookings for authenticated user ──────────────
router.get('/', authenticate, (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user';
    const userBookings = PartnerStore.getBookings({ userId, isAdmin: req.user?.role === 'admin' });
    res.json({
      success: true,
      count: userBookings.length,
      data: userBookings
    });
  } catch (error) {
    logger.error('Error getting bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings.' });
  }
});

// ── POST /api/bookings — Create a new Service Booking ────────────────────────
router.post('/', authenticate, (req, res) => {
  try {
    const {
      garageId,
      garageName,
      garagePhone,
      serviceType,
      bookingMode, // 'dropoff' or 'remote_mobile'
      vehicleDetails,
      serviceAddress,
      scheduledDate,
      scheduledTime,
      contactPhone,
      contactName,
      estimatedCost,
      notes
    } = req.body;

    if (!serviceType || !scheduledDate || !scheduledTime) {
      return res.status(400).json({
        success: false,
        error: 'Service type, date, and time are required.'
      });
    }

    if (bookingMode === 'remote_mobile' && !serviceAddress) {
      return res.status(400).json({
        success: false,
        error: 'Service address is required for Remote Mobile Garage dispatch.'
      });
    }

    const newBooking = PartnerStore.createBooking({
      userId: req.user?.id || 'demo-user',
      garageId: garageId || 'gar-001',
      garageName: garageName || 'AAIA Certified Service Partner',
      garagePhone: garagePhone || '+1 (800) 555-AAIA',
      serviceType,
      bookingMode: bookingMode || 'remote_mobile',
      vehicleDetails: vehicleDetails || { make: 'Vehicle', model: 'Unspecified', year: 2023 },
      serviceAddress: serviceAddress || (bookingMode === 'dropoff' ? 'Shop Facility' : 'User Address'),
      scheduledDate,
      scheduledTime,
      contactPhone: contactPhone || req.user?.phone || 'Provided upon dispatch',
      contactName: contactName || req.user?.name || 'Customer',
      estimatedCost: estimatedCost || 'Custom quote upon inspection',
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: bookingMode === 'remote_mobile' 
        ? 'Remote mobile service requested! A mobile mechanic van is scheduled to arrive at your location.' 
        : 'Service appointment reserved at certified garage!',
      data: newBooking
    });
  } catch (error) {
    logger.error('Error creating booking:', error);
    res.status(500).json({ success: false, error: 'Failed to create service booking.' });
  }
});

// ── PATCH /api/bookings/:id/status — Update Booking Status ───────────────────
router.patch('/:id/status', authenticate, (req, res) => {
  try {
    const { status } = req.body;
    const booking = PartnerStore.updateBooking(req.params.id, { status });
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    logger.error('Error updating booking status:', error);
    res.status(500).json({ success: false, error: 'Failed to update booking status.' });
  }
});

module.exports = router;
