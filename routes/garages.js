const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const logger = require('../config/logger');

// In-memory persistent store initialized with rich certified automotive partners
let PARTNER_GARAGES = [
  {
    id: 'gar-001',
    name: 'Apex Precision Mobile Mechanics',
    tagline: 'Certified Master Techs Dispatched Directly to Your Driveway or Office',
    type: 'mobile_mechanic',
    isMobileCapable: true,
    rating: 4.95,
    reviewCount: 142,
    phone: '+1 (800) 555-APEX',
    email: 'dispatch@apexmobilemechanics.com',
    address: 'Mobile Fleet Hub - 100 Industrial Pkwy',
    city: 'Metro Area (Within 35 miles)',
    serviceRadiusMiles: 35,
    hourlyRate: 110,
    servicesOffered: [
      'Remote Mobile Diagnostics',
      'On-Site Brake Replacement',
      'Mobile Battery & Alternator',
      'Oil, Filter & Fluid Flushes',
      'Suspension & Strut Replacement',
      'Emergency Roadside Repair',
      'Pre-Purchase Mobile Inspection'
    ],
    verifiedBadge: true,
    badges: ['🚐 Remote Mobile Van', '⚡ 60-Min Dispatch', '⭐ Master ASE Certified'],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
    operatingHours: 'Mon-Sun: 7:00 AM - 9:00 PM',
    bio: 'Fully equipped mobile workshop vans with hydraulic jacks, onboard diagnostic computers, and OEM tooling. We perform 85% of standard vehicle repairs right at your location.'
  },
  {
    id: 'gar-002',
    name: 'Vanguard Euro & Performance Center',
    tagline: 'Specialized Diagnostics and Repairs for German & European Vehicles',
    type: 'garage',
    isMobileCapable: false,
    rating: 4.9,
    reviewCount: 98,
    phone: '+1 (800) 555-EURO',
    email: 'service@vanguardperformance.com',
    address: '742 Motorsport Blvd, Suite 10',
    city: 'Central City',
    serviceRadiusMiles: 15,
    hourlyRate: 145,
    servicesOffered: [
      'Drivetrain & Engine Rebuilds',
      'Turbocharger & Supercharger Service',
      'Transmission Flushes & Clutches',
      'Brembo & Carbon Ceramic Brakes',
      'ECU Tuning & Module Coding',
      'Suspension & Track Setup'
    ],
    verifiedBadge: true,
    badges: ['🏢 Certified Facility', '🏆 Euro Specialist', '🔧 Dyno Equipped'],
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
    operatingHours: 'Mon-Fri: 8:00 AM - 6:00 PM',
    bio: 'State-of-the-art 12-bay automotive service facility with factory diagnostic equipment for Porsche, BMW, Mercedes-Benz, Audi, and exotic vehicles.'
  },
  {
    id: 'gar-003',
    name: 'RapidFix Mobile Garage & Fleet Pro',
    tagline: '24/7 Mobile Roadside Diagnostics & Rapid Repair Dispatch',
    type: 'mobile_mechanic',
    isMobileCapable: true,
    rating: 4.88,
    reviewCount: 215,
    phone: '+1 (800) 555-RAPID',
    email: 'contact@rapidfixmobile.com',
    address: 'Mobile Rapid Unit 4',
    city: 'Tri-County Area',
    serviceRadiusMiles: 50,
    hourlyRate: 95,
    servicesOffered: [
      'Emergency Mobile Diagnostics',
      'Starter & Alternator Replacements',
      'Mobile Brake Service',
      'Belt & Hose Emergency Fixes',
      'Mobile Fuel System Flush',
      'Fleet On-Site Routine Care'
    ],
    verifiedBadge: true,
    badges: ['🚐 Remote Mobile Van', '🚨 24/7 Emergency', '⚡ Fast Arrival'],
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
    operatingHours: '24 Hours / 7 Days a Week',
    bio: 'On-demand mobile technician network equipped with heavy-duty service trucks ready to rescue stranded vehicles or service your fleet at your depot.'
  },
  {
    id: 'gar-004',
    name: 'Precision Auto Tech & Fleet Center',
    tagline: 'Comprehensive Domestic & Import Mechanical Overhauls',
    type: 'garage',
    isMobileCapable: true,
    rating: 4.85,
    reviewCount: 167,
    phone: '+1 (800) 555-TECH',
    email: 'info@precisionautotech.com',
    address: '1240 Commercial Highway',
    city: 'West District',
    serviceRadiusMiles: 20,
    hourlyRate: 115,
    servicesOffered: [
      'Comprehensive Multi-Point Inspection',
      'AC Compressor & Refrigerant Recharge',
      'Brake Rotors & Calipers',
      'Timing Belt & Water Pump',
      'Catalytic Converter & Exhaust',
      'Remote Mobile Van Option'
    ],
    verifiedBadge: true,
    badges: ['🏢 Drive-in Facility', '🚐 Mobile Van Available', '🛡️ 2-Year Warranty'],
    image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80',
    operatingHours: 'Mon-Sat: 7:30 AM - 6:00 PM',
    bio: 'ASE Blue Seal certified facility with drive-in service bays and two remote mobile mechanic vans for flexible customer convenience.'
  },
  {
    id: 'gar-005',
    name: 'Titan OEM & Performance Parts Direct',
    tagline: 'Wholesale & Retail OEM Genuine Parts with Same-Day Courier Delivery',
    type: 'parts_shop',
    isMobileCapable: false,
    rating: 4.92,
    reviewCount: 310,
    phone: '+1 (800) 555-PART',
    email: 'orders@titanparts.com',
    address: '500 Logistics Way, Hub 3',
    city: 'Metro Distribution Center',
    serviceRadiusMiles: 40,
    hourlyRate: 0,
    servicesOffered: [
      'OEM Genuine Replacement Parts',
      'Performance Aftermarket Upgrades',
      'Same-Day Local Part Courier Delivery',
      'Part Number Cross-Referencing',
      'Wholesale Trade Accounts'
    ],
    verifiedBadge: true,
    badges: ['📦 Same-Day Delivery', '🏷️ Wholesale Pricing', '💯 100% OEM Genuine'],
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80',
    operatingHours: 'Mon-Sat: 6:30 AM - 8:00 PM',
    bio: 'Direct warehouse distributor carrying over 250,000 SKUs for Asian, Domestic, and European manufacturers. Direct delivery to your mechanic or home.'
  }
];

// ── GET /api/garages — List & Filter Garages & Mobile Mechanics ───────────────
router.get('/', authenticate, (req, res) => {
  try {
    const { type, service, search, isMobileOnly } = req.query;
    let results = [...PARTNER_GARAGES];

    if (type && type !== 'all') {
      results = results.filter(g => g.type === type);
    }

    if (isMobileOnly === 'true') {
      results = results.filter(g => g.isMobileCapable);
    }

    if (service) {
      const sLower = service.toLowerCase();
      results = results.filter(g => 
        g.servicesOffered.some(s => s.toLowerCase().includes(sLower))
      );
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(g => 
        g.name.toLowerCase().includes(q) ||
        g.city.toLowerCase().includes(q) ||
        g.tagline.toLowerCase().includes(q) ||
        g.servicesOffered.some(s => s.toLowerCase().includes(q))
      );
    }

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
router.get('/:id', authenticate, (req, res) => {
  const garage = PARTNER_GARAGES.find(g => g.id === req.params.id);
  if (!garage) {
    return res.status(404).json({ success: false, error: 'Partner not found' });
  }
  res.json({ success: true, data: garage });
});

// ── POST /api/garages/onboard — Partner Onboarding Form ──────────────────────
router.post('/onboard', authenticate, (req, res) => {
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
      serviceRadiusMiles,
      hourlyRate,
      servicesOffered,
      bio
    } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ success: false, error: 'Business name, phone, and email are required.' });
    }

    const newPartner = {
      id: `gar-${Date.now()}`,
      name,
      tagline: tagline || (isMobileCapable ? 'Certified Remote Mobile Service' : 'Certified Automotive Repair'),
      type: type || (isMobileCapable ? 'mobile_mechanic' : 'garage'),
      isMobileCapable: Boolean(isMobileCapable),
      rating: 5.0,
      reviewCount: 1,
      phone,
      email,
      address: address || 'Local Area',
      city: city || 'Local Metro',
      serviceRadiusMiles: parseInt(serviceRadiusMiles) || (isMobileCapable ? 25 : 15),
      hourlyRate: parseInt(hourlyRate) || 100,
      servicesOffered: Array.isArray(servicesOffered) ? servicesOffered : (servicesOffered ? servicesOffered.split(',').map(s => s.trim()) : ['General Automotive Diagnostics & Repair']),
      verifiedBadge: true,
      badges: isMobileCapable ? ['🚐 Remote Mobile Van', '✨ Newly Onboarded'] : ['🏢 Verified Facility', '✨ Newly Onboarded'],
      image: isMobileCapable 
        ? 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
      operatingHours: 'Mon-Sat: 8:00 AM - 6:00 PM',
      bio: bio || 'Certified automotive professional dedicated to high quality diagnostics, repairs, and customer transparency.'
    };

    PARTNER_GARAGES.unshift(newPartner);

    logger.info(`New partner garage onboarded: ${newPartner.name} (${newPartner.type})`);

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

router.PARTNER_GARAGES = PARTNER_GARAGES;
module.exports = router;
