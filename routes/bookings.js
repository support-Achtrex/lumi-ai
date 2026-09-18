const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const logger = require('../config/logger');

// In-memory persistent bookings store
let USER_BOOKINGS = [
  {
    id: 'bk-1001',
    userId: 'demo-user',
    garageId: 'gar-001',
    garageName: 'Apex Precision Mobile Mechanics',
    garagePhone: '+1 (800) 555-APEX',
    serviceType: 'On-Site Brake Replacement & Fluid Flush',
    bookingMode: 'remote_mobile',
    vehicleDetails: {
      year: 2022,
      make: 'Toyota',
      model: 'Camry SE',
      color: 'Midnight Black Metallic',
      vin: '4T1B11HK5NU123890'
    },
    serviceAddress: '1428 Elm Street, Apt 4B (Driveway)',
    scheduledDate: '2026-09-24',
    scheduledTime: '10:30 AM',
    status: 'confirmed',
    estimatedCost: '$290 - $340',
    mechanicName: 'Dave R. (Mobile Van #3)',
    notes: 'Please call 10 minutes prior to arrival. Gate code is #4821.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// ── GET /api/bookings — Get all bookings for authenticated user ──────────────
router.get('/', authenticate, (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user';
    const userBookings = USER_BOOKINGS.filter(b => b.userId === userId || b.userId === 'demo-user');
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

    const newBooking = {
      id: `bk-${Date.now().toString().slice(-6)}`,
      userId: req.user?.id || 'demo-user',
      garageId: garageId || 'gar-001',
      garageName: garageName || 'AAIA Certified Service Partner',
      garagePhone: garagePhone || '+1 (800) 555-AAIA',
      serviceType,
      bookingMode: bookingMode || 'remote_mobile',
      vehicleDetails: vehicleDetails || { make: 'Vehicle', model: 'Unspecified', year: 2023 },
      serviceAddress: serviceAddress || (bookingMode === 'dropoff' ? 'Shop Location' : 'User Address'),
      scheduledDate,
      scheduledTime,
      contactPhone: contactPhone || req.user?.phone || 'Provided upon dispatch',
      contactName: contactName || req.user?.name || 'Customer',
      status: 'pending',
      estimatedCost: estimatedCost || 'Custom quote upon inspection',
      mechanicName: bookingMode === 'remote_mobile' ? 'Mobile Unit Dispatched Upon Confirmation' : 'Service Advisor at Facility',
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    USER_BOOKINGS.unshift(newBooking);

    logger.info(`New booking created: ${newBooking.id} for ${newBooking.serviceType} (${newBooking.bookingMode})`);

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
    const booking = USER_BOOKINGS.find(b => b.id === req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    booking.status = status || booking.status;
    res.json({ success: true, data: booking });
  } catch (error) {
    logger.error('Error updating booking status:', error);
    res.status(500).json({ success: false, error: 'Failed to update booking status.' });
  }
});

module.exports = router;
