const axios = require('axios');
const { get, set, DEFAULT_TTL } = require('../config/redis');
const logger = require('../config/logger');

const apiClient = axios.create({
  baseURL:  process.env.AUTOMOTIVE_DATASET_BASE_URL || 'https://api.automotivedata set.com/v1',
  timeout:  parseInt(process.env.AUTOMOTIVE_DATASET_TIMEOUT) || 5000,
  headers: {
    'X-API-Key':    process.env.AUTOMOTIVE_DATASET_API_KEY,
    'Content-Type': 'application/json',
    'User-Agent':   'LUMI-AI/1.0 (Achtrex)'
  }
});

// Response interceptor for logging
apiClient.interceptors.response.use(
  res => res,
  err => {
    logger.error('AutomotiveDataset API error:', {
      status: err.response?.status,
      url:    err.config?.url,
      message: err.message
    });
    return Promise.reject(err);
  }
);

class VehicleDataService {

  // ── VIN Decode ───────────────────────────────────────────────────────────
  static async decodeVIN(vin) {
    if (!vin || vin.length !== 17) {
      throw { statusCode: 400, message: 'Invalid VIN — must be exactly 17 characters' };
    }

    const cacheKey = `vehicle:vin:${vin.toUpperCase()}`;
    const cached = await get(cacheKey);
    if (cached) {
      logger.debug(`VIN cache hit: ${vin}`);
      return cached;
    }

    try {
      const { data } = await apiClient.get(`/vin/${vin.toUpperCase()}`);
      await set(cacheKey, data, DEFAULT_TTL * 24); // VIN data rarely changes — cache 24h
      return data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw { statusCode: 404, message: `VIN not found: ${vin}` };
      }
      throw error;
    }
  }

  // ── Vehicle Specifications ────────────────────────────────────────────────
  static async getSpecifications(make, model, year, trim) {
    const cacheKey = `vehicle:specs:${make}:${model}:${year}:${trim || 'base'}`;
    const cached = await get(cacheKey);
    if (cached) return cached;

    const params = { make, model, year };
    if (trim) params.trim = trim;

    const { data } = await apiClient.get('/specifications', { params });
    await set(cacheKey, data, DEFAULT_TTL * 12);
    return data;
  }

  // ── Market Pricing ────────────────────────────────────────────────────────
  static async getMarketPricing(vin, mileage, condition = 'good', zipCode) {
    const cacheKey = `vehicle:pricing:${vin}:${mileage}:${condition}`;
    const cached = await get(cacheKey);
    if (cached) return cached;

    const params = { vin: vin.toUpperCase(), mileage, condition };
    if (zipCode) params.zip_code = zipCode;

    const { data } = await apiClient.get('/pricing/market', { params });
    await set(cacheKey, data, 3600); // Pricing changes daily — 1h cache
    return data;
  }

  // ── Vehicle History ───────────────────────────────────────────────────────
  static async getHistory(vin) {
    const cacheKey = `vehicle:history:${vin.toUpperCase()}`;
    const cached = await get(cacheKey);
    if (cached) return cached;

    const { data } = await apiClient.get(`/history/${vin.toUpperCase()}`);
    await set(cacheKey, data, DEFAULT_TTL * 6); // 6h cache
    return data;
  }

  // ── Recall Information ────────────────────────────────────────────────────
  static async getRecalls(vin) {
    const cacheKey = `vehicle:recalls:${vin.toUpperCase()}`;
    const cached = await get(cacheKey);
    if (cached) return cached;

    const { data } = await apiClient.get(`/recalls/${vin.toUpperCase()}`);
    await set(cacheKey, data, DEFAULT_TTL * 12); // Recalls rarely change intra-day
    return data;
  }

  // ── Bulk VIN batch decode ─────────────────────────────────────────────────
  static async batchDecodeVINs(vins) {
    if (!vins || vins.length === 0) return [];
    if (vins.length > 50) throw { statusCode: 400, message: 'Maximum 50 VINs per batch request' };

    // Check cache for each VIN first
    const results = [];
    const uncachedVINs = [];

    for (const vin of vins) {
      const cached = await get(`vehicle:vin:${vin.toUpperCase()}`);
      if (cached) {
        results.push(cached);
      } else {
        uncachedVINs.push(vin.toUpperCase());
      }
    }

    // Batch request uncached VINs
    if (uncachedVINs.length > 0) {
      const { data } = await apiClient.post('/vin/batch', { vins: uncachedVINs });
      for (const vehicle of data.results) {
        await set(`vehicle:vin:${vehicle.vin}`, vehicle, DEFAULT_TTL * 24);
        results.push(vehicle);
      }
    }

    return results;
  }

  // ── Search vehicles by make/model/year ────────────────────────────────────
  static async searchVehicles({ make, model, yearFrom, yearTo, bodyStyle, fuelType, limit = 20 }) {
    const params = { limit };
    if (make)       params.make       = make;
    if (model)      params.model      = model;
    if (yearFrom)   params.year_from  = yearFrom;
    if (yearTo)     params.year_to    = yearTo;
    if (bodyStyle)  params.body_style = bodyStyle;
    if (fuelType)   params.fuel_type  = fuelType;

    const { data } = await apiClient.get('/vehicles/search', { params });
    return data;
  }

  // ── Depreciation calculation ──────────────────────────────────────────────
  static async getDepreciation(vin, currentMileage, projectedYears = 5) {
    const cacheKey = `vehicle:depreciation:${vin}:${currentMileage}:${projectedYears}`;
    const cached = await get(cacheKey);
    if (cached) return cached;

    const params = { vin: vin.toUpperCase(), current_mileage: currentMileage, projected_years: projectedYears };
    const { data } = await apiClient.get('/pricing/depreciation', { params });
    await set(cacheKey, data, DEFAULT_TTL * 12);
    return data;
  }

  // ── Validate VIN format ───────────────────────────────────────────────────
  static validateVIN(vin) {
    if (!vin || typeof vin !== 'string') return false;
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    if (!vinRegex.test(vin)) return false;

    // Check digit validation (position 9)
    const transliteration = '0123456789.ABCDEFGH..JKLMN.P.R..STUVWXYZ';
    const weights = [8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];
    let sum = 0;

    for (let i = 0; i < 17; i++) {
      const val = transliteration.indexOf(vin[i].toUpperCase());
      if (val === -1 || transliteration[val] === '.') return false;
      sum += parseInt(transliteration[val]) * weights[i];
    }

    const remainder = sum % 11;
    const checkDigit = vin[8].toUpperCase();
    return (remainder === 10 ? 'X' : String(remainder)) === checkDigit;
  }
}

module.exports = VehicleDataService;
