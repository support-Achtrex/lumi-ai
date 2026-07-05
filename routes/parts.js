const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const logger = require('../config/logger');

// Require authentication for all parts routes
router.use(authenticate);

// ── Mock Database ─────────────────────────────────────────────────────────────
const MOCK_PARTS = [
  { id: 'p1', oem: '12345-ABC', name: 'Premium Ceramic Brake Pads', category: 'Brakes', price: 89.99, stock: 12, description: 'High-performance ceramic brake pads designed for low dust and noise.' },
  { id: 'p2', oem: '98765-XYZ', name: 'Alternator 130 Amp', category: 'Electrical', price: 215.50, stock: 4, description: 'Remanufactured 130A alternator with a 1-year warranty.' },
  { id: 'p3', oem: 'OIL-FLT-01', name: 'Extended Life Oil Filter', category: 'Engine', price: 12.99, stock: 45, description: 'Synthetic blend media traps 99% of dirt and contaminants.' },
  { id: 'p4', oem: 'BAT-12V-800', name: '12V AGM Automotive Battery', category: 'Electrical', price: 199.99, stock: 8, description: '800 CCA AGM battery. Excellent starting power and vibration resistance.' },
  { id: 'p5', oem: 'SPR-PLG-04', name: 'Iridium Spark Plug Set (4)', category: 'Ignition', price: 45.00, stock: 20, description: 'Laser iridium spark plugs for maximum performance and longevity.' }
];

// ── Search Endpoint ───────────────────────────────────────────────────────────
router.post('/search', async (req, res) => {
  try {
    const { mode, query } = req.body;
    
    // In a real application, you would make an axios call to your parts provider here.
    // Example:
    // const response = await axios.post('https://api.epicor.com/parts', { mode, query });
    // return res.json(response.data);
    
    logger.info(`[Parts] Lookup requested. Mode: ${mode}, Query: ${JSON.stringify(query)}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock search logic
    let results = [];
    if (mode === 'oem') {
      const oemTerm = query.oem?.toLowerCase() || '';
      results = MOCK_PARTS.filter(p => p.oem.toLowerCase().includes(oemTerm));
    } else {
      // For VIN or YMMT, we'll just return a random subset of parts to simulate vehicle-specific fits
      const numResults = Math.floor(Math.random() * 3) + 2; // Return 2 to 4 parts
      results = [...MOCK_PARTS].sort(() => 0.5 - Math.random()).slice(0, numResults);
    }
    
    res.json({ success: true, parts: results });
  } catch (error) {
    logger.error('[Parts] Search error:', error);
    res.status(500).json({ success: false, error: 'Failed to search for parts' });
  }
});

module.exports = router;
