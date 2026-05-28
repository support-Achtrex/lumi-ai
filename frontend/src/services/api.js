// src/services/api.js  — LUMI AI API client
const BASE = process.env.REACT_APP_API_URL || '/api';

class APIService {

  // ── Token ────────────────────────────────────────────────────────────────
  static getToken()         { return localStorage.getItem('lumi_token'); }
  static setToken(t)        { localStorage.setItem('lumi_token', t); }
  static clearToken()       { localStorage.removeItem('lumi_token'); localStorage.removeItem('lumi_user'); }
  static getCurrentUser()   { const u = localStorage.getItem('lumi_user'); return u ? JSON.parse(u) : null; }

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
      throw { status: res.status, message: data.error || 'Request failed' };
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
    localStorage.setItem('lumi_user', JSON.stringify(res.data.user));
    return res.data;
  }
  static async register(name, email, password) {
    const res = await this.post('/auth/register', { name, email, password });
    this.setToken(res.data.token);
    localStorage.setItem('lumi_user', JSON.stringify(res.data.user));
    return res.data;
  }
  static async logout() {
    try { await this.post('/auth/logout', {}); } catch {}
    this.clearToken();
  }

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

  // Streaming — async generator
  static async* streamMessage(message, conversationId, vin) {
    const token = this.getToken();
    const response = await fetch(`${BASE}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message, conversationId, vin })
    });
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
  static async getVehicleFull(vin, mileage, condition, zip) {
    const p = new URLSearchParams();
    if (mileage)    p.set('mileage', mileage);
    if (condition)  p.set('condition', condition);
    if (zip)        p.set('zipCode', zip);
    return (await this.get(`/vehicles/${vin}/full?${p}`)).data;
  }
  static async getVehiclePricing(vin, mileage, condition = 'good') {
    return (await this.get(`/vehicles/${vin}/pricing?mileage=${mileage}&condition=${condition}`)).data;
  }
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
  static async analyseFleet(id, type)         { return (await this.post(`/fleet/${id}/analyse`, { analysisType: type })).data; }
  static async updateFleetVehicle(fid, vin, data) { return (await this.put(`/fleet/${fid}/vehicles/${vin}`, data)).data; }

  // ── Diagnostics ──────────────────────────────────────────────────────────
  static async assessDamage(damageDescription, vin, location) {
    return (await this.post('/diagnostics/assess', { damageDescription, vin, location })).data;
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

  // ── Analytics ─────────────────────────────────────────────────────────────
  static async getUsageStats()             { return (await this.get('/analytics/usage')).data; }
  static async getPopularQueries()         { return (await this.get('/analytics/popular-queries')).data; }
}

export default APIService;
