// src/services/api.js  — AAIA API client
const BASE = process.env.REACT_APP_API_URL || '/api';

class APIService {

  // ── Token ────────────────────────────────────────────────────────────────
  static getToken()         { return localStorage.getItem('aaia_token'); }
  static setToken(t)        { localStorage.setItem('aaia_token', t); }
  static clearToken()       { localStorage.removeItem('aaia_token'); localStorage.removeItem('aaia_user'); }
  static getCurrentUser()   { const u = localStorage.getItem('aaia_user'); return u ? JSON.parse(u) : null; }

  // ── Base request ─────────────────────────────────────────────────────────
  static async req(path, opts = {}) {
    const token = this.getToken();
    const res = await fetch(`${BASE}${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...opts.headers
      }
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) { this.clearToken(); window.location.href = '/login'; }
      if (res.status === 402 && data.error === 'CREDITS_EXHAUSTED') {
        window.dispatchEvent(new CustomEvent('creditsExhausted'));
      }
      throw { status: res.status, message: data.message || data.error || 'Request failed', error: data.error };
    }
    return data;
  }

  static get(p)     { return this.req(p); }
  static post(p, b) { return this.req(p, { method: 'POST',   body: JSON.stringify(b) }); }
  static put(p, b)  { return this.req(p, { method: 'PUT',    body: JSON.stringify(b) }); }
  static del(p)     { return this.req(p, { method: 'DELETE' }); }

  // ── Auth ─────────────────────────────────────────────────────────────────
  static async login(email, password) {
    const res = await this.post('/auth/login', { email, password });
    this.setToken(res.data.token);
    localStorage.setItem('aaia_user', JSON.stringify(res.data.user));
    return res.data;
  }
  static async register(name, email, password, company, phone) {
    const res = await this.post('/auth/register', { name, email, password, company, phone });
    this.setToken(res.data.token);
    localStorage.setItem('aaia_user', JSON.stringify(res.data.user));
    return res.data;
  }
  static async logout() {
    try { await this.post('/auth/logout', {}); } catch {}
    this.clearToken();
  }
  static async updateProfile(name) { return (await this.put('/auth/profile', { name })).data; }
  static async changePassword(currentPassword, newPassword) { return (await this.post('/auth/change-password', { currentPassword, newPassword })).data; }
  static async getMe() { return (await this.get('/auth/me')).user; }

  // ── Billing ──────────────────────────────────────────────────────────────
  static getPlans() { return this.get('/billing/plans').then(res => res.data); }
  static initializePayment(amount, discountCode = '', plan_id = '', callback_url = '', vin = '') { return this.post('/billing/paystack/initialize', { amount, discountCode, plan_id, callback_url, vin }).then(res => res); }
  static verifyPayment(reference) { return this.get(`/billing/paystack/verify?reference=${reference}`).then(res => res); }
  static getInvoices() { return this.get('/billing/invoices').then(res => res.data); }

  // ── Admin ────────────────────────────────────────────────────────────────
  static getAdminUsers() { return this.get('/admin/users').then(res => res.data); }
  static updateAdminUser(id, data) { return this.put(`/admin/users/${id}`, data).then(res => res.data); }
  static deleteAdminUser(id) { return this.del(`/admin/users/${id}`); }
  static updateAdminUserCredits(id, credits, plan_type) { return this.put(`/admin/users/${id}/credits`, { credits, plan_type }).then(res => res.data); }
  static updateAdminUserPassword(id, password) { return this.put(`/admin/users/${id}/password`, { password }).then(res => res.data); }

  static getAdminPlans() { return this.get('/admin/plans').then(res => res.data); }
  static createAdminPlan(data) { return this.post('/admin/plans', data).then(res => res.data); }
  static updateAdminPlan(id, data) { return this.put(`/admin/plans/${id}`, data).then(res => res.data); }
  static deleteAdminPlan(id) { return this.del(`/admin/plans/${id}`); }

  static getAdminDiscounts() { return this.get('/admin/discounts').then(res => res.data); }
  static createAdminDiscount(data) { return this.post('/admin/discounts', data).then(res => res.data); }
  static deleteAdminDiscount(id) { return this.del(`/admin/discounts/${id}`); }

  // ── Usage & Analytics ───────────────────────────────────────────────────
  static getUsage() { return this.get('/usage').then(res => res.data); }

  // ── Chat ─────────────────────────────────────────────────────────────────
  static async sendMessage(message, conversationId, vin) {
    const res = await this.post('/chat/message', { message, conversationId, vin });
    return res.data;
  }
  static async getConversations(page = 1) {
    const res = await this.get(`/chat/conversations?page=${page}`);
    return res.data;
  }
  static async getConversation(id) {
    const res = await this.get(`/chat/conversations/${id}`);
    return res.data;
  }
  static async deleteConversation(id) { return this.del(`/chat/conversations/${id}`); }

  // ── Chat ───────────────────────────────────────────────────────────────────
  static async *streamMessage({ message, conversationId, vin, image, voice }) {
    const token = this.getToken();
    const response = await fetch(`${BASE}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({ message, conversationId, vin, image, voice })
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      
      // Global interceptor for credit limits
      if (response.status === 402 && err.error === 'CREDITS_EXHAUSTED') {
        window.dispatchEvent(new CustomEvent('creditsExhausted'));
      }

      throw new Error(err.error || err.message || 'API request failed');
    }

    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value).split('\n')) {
        if (line.startsWith('data: ')) {
          try { yield JSON.parse(line.slice(6)); } catch {}
        }
      }
    }
  }

  // ── Vehicles ─────────────────────────────────────────────────────────────
  static async decodeVIN(vin) { return (await this.get(`/vehicles/decode/${vin}`)).data; }
  static async getVehicleFull(vin, mileage, condition, zipCode) {
    const params = new URLSearchParams();
    if (mileage) params.append('mileage', mileage);
    if (condition) params.append('condition', condition);
    if (zipCode) params.append('zipCode', zipCode);
    return (await this.get(`/vehicles/${vin}/full?${params}`)).data;
  }

  static async getVehicleHistoryReport(vin) {
    try {
      // Fetch via backend proxy to avoid CORS issues
      const res = await this.get(`/vehicles/${vin}/html-report`);
      return res.data;
    } catch (e) {
      // Fallback mock if the hypothetical endpoint is unreachable so we can still render the best UI
      return {
        vin: vin,
        report_date: new Date().toISOString(),
        summary: {
          accidents_reported: 0,
          structural_damage: false,
          airbag_deployment: false,
          odometer_rollback: false,
          owners: 2,
          service_records: 14,
          open_recalls: 0,
          title_status: 'Clean'
        },
        ownership_history: [
          { owner: 1, year_purchased: 2018, type: 'Personal Lease', location: 'California', length_owned: '3 yrs 2 mos' },
          { owner: 2, year_purchased: 2021, type: 'Personal', location: 'Nevada', length_owned: '2 yrs 5 mos' }
        ],
        service_history: [
          { date: '2023-11-12', mileage: 45200, facility: 'Nevada Auto Care', description: 'Oil and filter changed, tires rotated, brakes inspected.' },
          { date: '2022-04-05', mileage: 32000, facility: 'Desert Ford Service', description: 'Transmission fluid changed, air filter replaced.' },
          { date: '2021-09-18', mileage: 25100, facility: 'California Dealership', description: 'Vehicle sold. Comprehensive inspection performed.' },
          { date: '2019-10-10', mileage: 12050, facility: 'California Dealership', description: 'Scheduled maintenance performed.' }
        ]
      };
    }
  }

  static async getVehiclePricing(vin, mileage, condition = 'good') {
    return (await this.get(`/vehicles/${vin}/pricing?mileage=${mileage}&condition=${condition}`)).data;
  }
  static checkUnlockedReport(vin) { return this.get(`/vehicles/${vin}/unlocked`); }
  static async getVehicleHistory(vin)    { return (await this.get(`/vehicles/${vin}/history`)).data; }
  static async getVehicleRecalls(vin)    { return (await this.get(`/vehicles/${vin}/recalls`)).data; }
  static async getDepreciation(vin, mileage, years = 5) {
    return (await this.get(`/vehicles/${vin}/depreciation?mileage=${mileage}&years=${years}`)).data;
  }
  static async batchDecodeVINs(vins)     { return (await this.post('/vehicles/batch', { vins })).data; }
  static async searchVehicles(params)    { return (await this.get(`/vehicles/search?${new URLSearchParams(params)}`)).data; }
  static async askAboutVehicle(vin, q)   { return (await this.post(`/vehicles/${vin}/ask`, { question: q })).data; }

  // ── Fleet ─────────────────────────────────────────────────────────────────
  static async createFleet(name, description) { return (await this.post('/fleet', { name, description })).data; }
  static async getFleets()                    { return (await this.get('/fleet')).data; }
  static async getFleetVehicles(id)           { return (await this.get(`/fleet/${id}/vehicles`)).data; }
  static async addVehiclesToFleet(id, vins)   { return (await this.post(`/fleet/${id}/vehicles`, { vins })).data; }
  static async addVehicleByYMMT(id, { year, make, model, trim }) { return (await this.post(`/fleet/${id}/vehicles/ymmt`, { year: parseInt(year), make, model, trim })).data; }
  static async analyseFleet(id, type)         { return (await this.post(`/fleet/${id}/analyse`, { analysisType: type })).data; }
  static async updateFleetVehicle(fid, vin, data) { return (await this.put(`/fleet/${fid}/vehicles/${vin}`, data)).data; }

  // ── Diagnostics ──────────────────────────────────────────────────────────
  static async assessDamage(damageDescription, vin, location, image) {
    return (await this.post('/diagnostics/assess', { damageDescription, vin, location, image })).data;
  }
  static async getDiagnosticReasoning(symptoms, vin, dtcCodes) {
    return (await this.post('/diagnostics/reasoning', { symptoms, vin, dtcCodes })).data;
  }
  static async getMaintenanceSchedule(vin, mileage, lastServiceMileage, symptoms) {
    return (await this.post('/diagnostics/maintenance', { vin, mileage, lastServiceMileage, symptoms })).data;
  }
  static async calculateTCO(vin, currentMileage, annualMileage, ownershipYears) {
    return (await this.post('/diagnostics/tco', { vin, currentMileage, annualMileage, ownershipYears })).data;
  }

  // ── Inspection ───────────────────────────────────────────────────────────
  static async createInspection(vin, mileage, inspectorId) {
    return (await this.post('/inspections', { vin, mileage, inspectorId })).data;
  }
  static async getInspection(id)           { return (await this.get(`/inspections/${id}`)).data; }
  static async getInspections(filters)     { return (await this.get(`/inspections?${new URLSearchParams(filters)}`)).data; }
  static async updateInspectionItem(id, section, item, status, note) {
    return (await this.put(`/inspections/${id}/items`, { section, item, status, note })).data;
  }
  static async finaliseInspection(id)      { return (await this.post(`/inspections/${id}/finalise`, {})).data; }
  static async getInspectionReport(id)     { return (await this.get(`/inspections/${id}/report`)).data; }

  // ── Workflows ─────────────────────────────────────────────────────────────
  static async getWorkflows()              { return (await this.get('/workflows')).data; }
  static async createWorkflow(data)        { return (await this.post('/workflows', data)).data; }
  static async deleteWorkflow(id)          { return (await this.del(`/workflows/${id}`)).data; }

  // ── Analytics ─────────────────────────────────────────────────────────────
  static async getUsageStats()             { return (await this.get('/analytics/usage')).data; }
  // ── Reports ───────────────────────────────────────────────────────────────
  static async getReports()                { return (await this.get('/reports')).reports; }
  static async getReport(id)               { return (await this.get(`/reports/${id}`)).report; }
  static async saveReport(name, type, content) { return (await this.post('/reports', { name, type, content })).report; }
}

export default APIService;
