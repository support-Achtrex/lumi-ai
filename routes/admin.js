const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireRole } = require('../middleware/auth');
const { query } = require('../config/database');

// All routes here require admin access
router.use(authenticate, requireRole('admin'));

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const PartnerStore = require('../services/PartnerStore');

    let totalUsers = 0;
    let activeUsers = 0;
    let roleCounts = { admin: 0, user: 0, enterprise: 0, developer: 0 };
    let planCounts = { free: 0, starter: 0, pro: 0, enterprise: 0 };
    let recentUsers = [];

    try {
      const usersRes = await query(`
        SELECT id, email, name, role, is_active, plan_type, credits, created_at 
        FROM users 
        ORDER BY created_at DESC
      `);
      const users = usersRes.rows || [];
      totalUsers = users.length;
      activeUsers = users.filter(u => u.is_active).length;
      users.forEach(u => {
        const r = u.role || 'user';
        const p = u.plan_type || 'free';
        roleCounts[r] = (roleCounts[r] || 0) + 1;
        planCounts[p] = (planCounts[p] || 0) + 1;
      });
      recentUsers = users.slice(0, 6);
    } catch (e) {
      // Degraded fallback
    }

    const allGarages = PartnerStore.getGarages({ approvalStatus: 'all' });
    const totalGarages = allGarages.length;
    const activeVans = allGarages.filter(g => g.isMobileCapable).length;
    const allBookings = PartnerStore.getBookings({ isAdmin: true });
    const totalBookings = allBookings.length;
    const pendingBookings = allBookings.filter(b => b.status === 'pending').length;

    let totalRevenue = 0;
    try {
      const invRes = await query(`SELECT COALESCE(SUM(amount), 0) as total_rev FROM invoices WHERE status = 'paid'`);
      if (invRes.rows.length > 0) {
        totalRevenue = parseFloat(invRes.rows[0].total_rev) || 0;
      }
    } catch (e) {}

    let totalApiRequests = 0;
    try {
      const usageRes = await query(`SELECT COUNT(*) as total FROM api_usage`);
      if (usageRes.rows.length > 0) {
        totalApiRequests = parseInt(usageRes.rows[0].total, 10) || 0;
      }
    } catch (e) {}

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        roleCounts,
        planCounts,
        totalGarages,
        activeVans,
        totalBookings,
        pendingBookings,
        totalRevenue,
        totalApiRequests,
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/admin/users ───────────────────────────────────────────────────────
router.get('/users', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, email, name, role, is_active, last_login, created_at, credits, plan_type, company, phone
       FROM users
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/admin/users ──────────────────────────────────────────────────────
router.post('/users', async (req, res, next) => {
  try {
    const { email, password, name, role = 'user', plan_type = 'free', credits = 5.0, company, phone, is_active = true } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'A user with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = uuidv4();

    const result = await query(
      `INSERT INTO users (id, email, password, name, role, is_active, credits, plan_type, company, phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING id, email, name, role, is_active, credits, plan_type, company, phone, created_at`,
      [id, email.trim().toLowerCase(), hashedPassword, name.trim(), role, is_active, credits, plan_type, company || null, phone || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ── PUT /api/admin/users/:id ───────────────────────────────────────────────────
router.put('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, is_active, name, email, plan_type, company, phone, password } = req.body;

    if (id === req.user.id && (role && role !== 'admin' || is_active === false)) {
      return res.status(400).json({ success: false, error: 'Cannot demote or deactivate your own admin account' });
    }

    let hashedPassword = null;
    if (password && password.trim().length >= 6) {
      hashedPassword = await bcrypt.hash(password.trim(), 12);
    }

    const result = await query(
      `UPDATE users 
       SET role = COALESCE($1, role), 
           is_active = COALESCE($2, is_active),
           name = COALESCE($3, name),
           email = COALESCE($4, email),
           plan_type = COALESCE($5, plan_type),
           company = COALESCE($6, company),
           phone = COALESCE($7, phone),
           password = COALESCE($8, password),
           updated_at = NOW()
       WHERE id = $9
       RETURNING id, email, name, role, is_active, credits, plan_type, company, phone, last_login, created_at`,
      [role, is_active, name, email, plan_type, company, phone, hashedPassword, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /api/admin/users/:id ────────────────────────────────────────────────
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot delete your own admin account' });
    }

    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ── PUT /api/admin/users/:id/credits ─────────────────────────────────────────
router.put('/users/:id/credits', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { credits, plan_type } = req.body;
    const result = await query(
      `UPDATE users SET credits = $1, plan_type = COALESCE($2, plan_type), updated_at = NOW() WHERE id = $3 RETURNING id, email, credits, plan_type`,
      [credits, plan_type, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (e) { next(e); }
});

// ── PUT /api/admin/users/:id/password ────────────────────────────────────────
router.put('/users/:id/password', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await query(
      `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
      [hashedPassword, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (e) { next(e); }
});

// ── GET /api/admin/plans ───────────────────────────────────────────────────────
router.get('/plans', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM plans ORDER BY price_usd ASC');
    res.json({ success: true, data: result.rows });
  } catch (e) { next(e); }
});

// ── POST /api/admin/plans ──────────────────────────────────────────────────────
router.post('/plans', async (req, res, next) => {
  try {
    const { title, description, price_usd, credits, interval, tab, is_popular, features } = req.body;
    const result = await query(
      `INSERT INTO plans (title, description, price_usd, credits, interval, tab, is_popular, features) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, price_usd, credits, interval, tab, is_popular, JSON.stringify(features || [])]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (e) { next(e); }
});

// ── PUT /api/admin/plans/:id ───────────────────────────────────────────────────
router.put('/plans/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, price_usd, credits, interval, tab, is_popular, features, is_active } = req.body;
    const result = await query(
      `UPDATE plans 
       SET title=$1, description=$2, price_usd=$3, credits=$4, interval=$5, tab=$6, is_popular=$7, features=$8, is_active=$9 
       WHERE id=$10 RETURNING *`,
      [title, description, price_usd, credits, interval, tab, is_popular, JSON.stringify(features || []), is_active, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (e) { next(e); }
});

// ── DELETE /api/admin/plans/:id ────────────────────────────────────────────────
router.delete('/plans/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM plans WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { next(e); }
});

// ── GET /api/admin/discounts ───────────────────────────────────────────────────
router.get('/discounts', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM discounts ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (e) { next(e); }
});

// ── POST /api/admin/discounts ──────────────────────────────────────────────────
router.post('/discounts', async (req, res, next) => {
  try {
    const { code, percentage_off, fixed_amount_off, max_uses, expires_at } = req.body;
    const result = await query(
      `INSERT INTO discounts (code, percentage_off, fixed_amount_off, max_uses, expires_at) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [code, percentage_off || null, fixed_amount_off || null, max_uses || null, expires_at || null]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (e) { next(e); }
});

// ── DELETE /api/admin/discounts/:id ────────────────────────────────────────────
router.delete('/discounts/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM discounts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { next(e); }
});

// ── PARTNER SHOPS & GARAGES MANAGEMENT (ADMIN) ──────────────────────────────
router.get('/garages', (req, res) => {
  const PartnerStore = require('../services/PartnerStore');
  const list = PartnerStore.getGarages({ approvalStatus: 'all' });
  res.json({ success: true, data: list });
});

router.post('/garages', (req, res) => {
  const PartnerStore = require('../services/PartnerStore');
  const partner = PartnerStore.createGarage(req.body);
  res.status(201).json({ success: true, data: partner });
});

router.put('/garages/:id', (req, res) => {
  const PartnerStore = require('../services/PartnerStore');
  const updated = PartnerStore.updateGarage(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Partner not found' });
  res.json({ success: true, data: updated });
});

router.delete('/garages/:id', (req, res) => {
  const PartnerStore = require('../services/PartnerStore');
  const deleted = PartnerStore.deleteGarage(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, error: 'Partner not found' });
  res.json({ success: true, message: 'Partner removed' });
});

// ── SERVICE BOOKINGS MANAGEMENT (ADMIN) ──────────────────────────────────────
router.get('/bookings', (req, res) => {
  const PartnerStore = require('../services/PartnerStore');
  const list = PartnerStore.getBookings({ isAdmin: true });
  res.json({ success: true, data: list });
});

router.put('/bookings/:id', (req, res) => {
  const PartnerStore = require('../services/PartnerStore');
  const booking = PartnerStore.updateBooking(req.params.id, req.body);
  if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
  res.json({ success: true, data: booking });
});

router.delete('/bookings/:id', (req, res) => {
  const PartnerStore = require('../services/PartnerStore');
  const deleted = PartnerStore.deleteBooking(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, error: 'Booking not found' });
  res.json({ success: true, message: 'Booking removed' });
});

// ── SYSTEM DIAGNOSTICS (ADMIN) ───────────────────────────────────────────────
router.get('/system', async (req, res, next) => {
  try {
    const memory = process.memoryUsage();
    const uptime = process.uptime();
    
    let dbStatus = 'connected';
    let dbLatencyMs = 0;
    try {
      const t0 = Date.now();
      await query('SELECT 1');
      dbLatencyMs = Date.now() - t0;
    } catch (e) {
      dbStatus = 'degraded';
    }

    let redisStatus = 'active';
    try {
      const { get } = require('../config/redis');
      await get('health:ping');
    } catch (e) {
      redisStatus = 'disabled';
    }

    res.json({
      success: true,
      data: {
        environment: process.env.NODE_ENV || 'production',
        version: process.env.PRODUCT_VERSION || '1.0.0',
        uptimeSeconds: Math.floor(uptime),
        nodeVersion: process.version,
        memoryUsageMB: {
          rss: Math.round(memory.rss / 1024 / 1024),
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024)
        },
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs
        },
        redis: {
          status: redisStatus
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
