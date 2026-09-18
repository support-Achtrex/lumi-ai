const logger = require('../config/logger');

// Master synchronized partner & service store for live production & admin console
class PartnerStore {
  constructor() {
    this.PARTNER_GARAGES = [
      {
        id: 'gar-001',
        name: 'Apex Precision Mobile Mechanics',
        tagline: 'Certified Master Techs Dispatched Directly to Your Driveway or Office',
        type: 'mobile_mechanic',
        isMobileCapable: true,
        approvalStatus: 'approved',
        rating: 4.95,
        reviewCount: 142,
        phone: '+1 (800) 555-APEX',
        email: 'dispatch@apexmobilemechanics.com',
        address: 'Mobile Fleet Hub - 100 Industrial Pkwy',
        city: 'Metro Area (Within 35 miles)',
        state: 'TX',
        zip: '77001',
        latitude: 29.7604,
        longitude: -95.3698,
        mapUrl: 'https://www.google.com/maps?q=29.7604,-95.3698',
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
        approvalStatus: 'approved',
        rating: 4.9,
        reviewCount: 98,
        phone: '+1 (800) 555-EURO',
        email: 'service@vanguardperformance.com',
        address: '742 Motorsport Blvd, Suite 10',
        city: 'Central City',
        state: 'CA',
        zip: '90001',
        latitude: 34.0522,
        longitude: -118.2437,
        mapUrl: 'https://www.google.com/maps?q=34.0522,-118.2437',
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
        approvalStatus: 'approved',
        rating: 4.88,
        reviewCount: 215,
        phone: '+1 (800) 555-RAPID',
        email: 'contact@rapidfixmobile.com',
        address: 'Mobile Rapid Unit 4',
        city: 'Tri-County Area',
        state: 'FL',
        zip: '33101',
        latitude: 25.7617,
        longitude: -80.1918,
        mapUrl: 'https://www.google.com/maps?q=25.7617,-80.1918',
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
        approvalStatus: 'approved',
        rating: 4.85,
        reviewCount: 167,
        phone: '+1 (800) 555-TECH',
        email: 'info@precisionautotech.com',
        address: '1240 Commercial Highway',
        city: 'West District',
        state: 'IL',
        zip: '60601',
        latitude: 41.8781,
        longitude: -87.6298,
        mapUrl: 'https://www.google.com/maps?q=41.8781,-87.6298',
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
        approvalStatus: 'approved',
        rating: 4.92,
        reviewCount: 310,
        phone: '+1 (800) 555-PART',
        email: 'orders@titanparts.com',
        address: '500 Logistics Way, Hub 3',
        city: 'Metro Distribution Center',
        state: 'NY',
        zip: '10001',
        latitude: 40.7128,
        longitude: -74.0060,
        mapUrl: 'https://www.google.com/maps?q=40.7128,-74.0060',
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

    this.USER_BOOKINGS = [
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
        contactName: 'Alex Morgan',
        contactPhone: '+1 (555) 019-2834',
        notes: 'Please call 10 minutes prior to arrival. Gate code is #4821.',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ];
  }

  // ── Garages Methods ────────────────────────────────────────────────────────
  getGarages({ type, service, search, isMobileOnly, approvalStatus, isPublic = false } = {}) {
    let results = [...this.PARTNER_GARAGES];

    if (isPublic) {
      // In public portal, only return approved partners
      results = results.filter(g => (g.approvalStatus || 'approved') === 'approved');
    } else if (approvalStatus && approvalStatus !== 'all') {
      results = results.filter(g => (g.approvalStatus || 'approved') === approvalStatus);
    }

    if (type && type !== 'all') {
      if (type === 'mobile') {
        results = results.filter(g => g.isMobileCapable);
      } else {
        results = results.filter(g => g.type === type);
      }
    }

    if (isMobileOnly === 'true' || isMobileOnly === true) {
      results = results.filter(g => g.isMobileCapable);
    }

    if (service) {
      const sLower = service.toLowerCase();
      results = results.filter(g =>
        Array.isArray(g.servicesOffered) &&
        g.servicesOffered.some(s => s.toLowerCase().includes(sLower))
      );
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(g =>
        (g.name && g.name.toLowerCase().includes(q)) ||
        (g.city && g.city.toLowerCase().includes(q)) ||
        (g.tagline && g.tagline.toLowerCase().includes(q)) ||
        (Array.isArray(g.servicesOffered) && g.servicesOffered.some(s => s.toLowerCase().includes(q)))
      );
    }

    return results;
  }

  getGarageById(id) {
    return this.PARTNER_GARAGES.find(g => g.id === id);
  }

  createGarage(data) {
    const defaultImg = data.isMobileCapable
      ? 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80';

    const lat = data.latitude ? parseFloat(data.latitude) : null;
    const lng = data.longitude ? parseFloat(data.longitude) : null;

    let mapUrl = data.mapUrl;
    if (!mapUrl) {
      if (lat && lng) {
        mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      } else if (data.address && data.city) {
        mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.address}, ${data.city} ${data.state || ''} ${data.zip || ''}`)}`;
      }
    }

    const services = Array.isArray(data.servicesOffered)
      ? data.servicesOffered
      : (data.servicesOffered ? data.servicesOffered.split(',').map(s => s.trim()).filter(Boolean) : ['Diagnostics & Repair']);

    const newPartner = {
      id: data.id || `gar-${Date.now()}`,
      name: (data.name || 'New Partner Garage').trim(),
      tagline: data.tagline || (data.isMobileCapable ? 'Certified Remote Mobile Service' : 'Certified Automotive Center'),
      type: data.type || (data.isMobileCapable ? 'mobile_mechanic' : 'garage'),
      isMobileCapable: Boolean(data.isMobileCapable),
      approvalStatus: data.approvalStatus || 'approved',
      rating: parseFloat(data.rating) || 5.0,
      reviewCount: parseInt(data.reviewCount) || 1,
      phone: (data.phone || '+1 (800) 555-AAIA').trim(),
      email: (data.email || 'partner@aaia.achtrex.com').trim(),
      address: data.address || 'Local Metro',
      city: data.city || 'Metro Hub',
      state: data.state || '',
      zip: data.zip || '',
      latitude: lat,
      longitude: lng,
      mapUrl: mapUrl || '',
      serviceRadiusMiles: parseInt(data.serviceRadiusMiles) || (data.isMobileCapable ? 30 : 15),
      hourlyRate: parseInt(data.hourlyRate) || 110,
      servicesOffered: services,
      verifiedBadge: true,
      badges: data.isMobileCapable ? ['🚐 Remote Mobile Van', '✅ AAIA Certified'] : ['🏢 Verified Facility', '✅ AAIA Certified'],
      logo: data.logo || null,
      image: data.image || data.logo || defaultImg,
      operatingHours: data.operatingHours || 'Mon-Sat: 8:00 AM - 6:00 PM',
      bio: data.bio || 'Verified automotive service provider.'
    };

    this.PARTNER_GARAGES.unshift(newPartner);
    logger.info(`PartnerStore: Added partner ${newPartner.name} (${newPartner.id})`);
    return newPartner;
  }

  updateGarage(id, data) {
    const index = this.PARTNER_GARAGES.findIndex(g => g.id === id);
    if (index === -1) return null;

    const existing = this.PARTNER_GARAGES[index];
    const services = data.servicesOffered !== undefined
      ? (Array.isArray(data.servicesOffered) ? data.servicesOffered : data.servicesOffered.split(',').map(s => s.trim()).filter(Boolean))
      : existing.servicesOffered;

    let mapUrl = data.mapUrl || existing.mapUrl;
    const lat = data.latitude !== undefined ? (data.latitude ? parseFloat(data.latitude) : null) : existing.latitude;
    const lng = data.longitude !== undefined ? (data.longitude ? parseFloat(data.longitude) : null) : existing.longitude;
    if (lat && lng) {
      mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    }

    const updated = {
      ...existing,
      ...data,
      latitude: lat,
      longitude: lng,
      mapUrl,
      servicesOffered: services,
      hourlyRate: data.hourlyRate !== undefined ? parseInt(data.hourlyRate) : existing.hourlyRate,
      serviceRadiusMiles: data.serviceRadiusMiles !== undefined ? parseInt(data.serviceRadiusMiles) : existing.serviceRadiusMiles
    };

    this.PARTNER_GARAGES[index] = updated;
    logger.info(`PartnerStore: Updated partner ${updated.name} (${updated.id})`);
    return updated;
  }

  deleteGarage(id) {
    const index = this.PARTNER_GARAGES.findIndex(g => g.id === id);
    if (index === -1) return false;
    this.PARTNER_GARAGES.splice(index, 1);
    logger.info(`PartnerStore: Removed partner ${id}`);
    return true;
  }

  // ── Bookings Methods ───────────────────────────────────────────────────────
  getBookings({ userId, isAdmin = false, status, mode, search } = {}) {
    let list = [...this.USER_BOOKINGS];

    if (!isAdmin && userId) {
      list = list.filter(b => b.userId === userId || b.userId === 'demo-user');
    }

    if (status && status !== 'all') {
      list = list.filter(b => (b.status || 'pending') === status);
    }

    if (mode && mode !== 'all') {
      list = list.filter(b => (b.bookingMode || 'garage') === mode);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        (b.serviceType && b.serviceType.toLowerCase().includes(q)) ||
        (b.contactName && b.contactName.toLowerCase().includes(q)) ||
        (b.serviceAddress && b.serviceAddress.toLowerCase().includes(q)) ||
        (b.garageName && b.garageName.toLowerCase().includes(q))
      );
    }

    return list;
  }

  getBookingById(id) {
    return this.USER_BOOKINGS.find(b => b.id === id);
  }

  createBooking(data) {
    const newBooking = {
      id: data.id || `bk-${Date.now().toString().slice(-6)}`,
      userId: data.userId || 'demo-user',
      garageId: data.garageId || 'gar-001',
      garageName: data.garageName || 'AAIA Certified Service Partner',
      garagePhone: data.garagePhone || '+1 (800) 555-AAIA',
      serviceType: data.serviceType || 'Automotive Diagnostic & Service',
      bookingMode: data.bookingMode || 'remote_mobile',
      vehicleDetails: data.vehicleDetails || { make: 'Vehicle', model: 'Unspecified', year: 2023 },
      serviceAddress: data.serviceAddress || (data.bookingMode === 'dropoff' ? 'Shop Facility' : 'Customer Address'),
      scheduledDate: data.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: data.scheduledTime || '10:00 AM',
      contactPhone: data.contactPhone || '+1 (555) 000-0000',
      contactName: data.contactName || 'Customer',
      status: data.status || 'pending',
      estimatedCost: data.estimatedCost || 'Custom quote upon inspection',
      mechanicName: data.bookingMode === 'remote_mobile' ? 'Mobile Unit Dispatched Upon Confirmation' : 'Service Advisor at Facility',
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };

    this.USER_BOOKINGS.unshift(newBooking);
    logger.info(`PartnerStore: New booking created ${newBooking.id} (${newBooking.serviceType})`);
    return newBooking;
  }

  updateBooking(id, data) {
    const booking = this.USER_BOOKINGS.find(b => b.id === id);
    if (!booking) return null;
    Object.assign(booking, data);
    logger.info(`PartnerStore: Updated booking ${id} status: ${booking.status}`);
    return booking;
  }

  deleteBooking(id) {
    const index = this.USER_BOOKINGS.findIndex(b => b.id === id);
    if (index === -1) return false;
    this.USER_BOOKINGS.splice(index, 1);
    logger.info(`PartnerStore: Deleted booking ${id}`);
    return true;
  }
}

// Singleton instance
const partnerStoreInstance = new PartnerStore();
module.exports = partnerStoreInstance;
