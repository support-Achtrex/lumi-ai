const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { query } = require('../config/database');

// All routes here require admin access
router.use(authenticate, requireRole('admin'));

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

// ── PUT /api/admin/users/:id ───────────────────────────────────────────────────
router.put('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;

    if (id === req.user.id && (role !== 'admin' || is_active === false)) {
      return res.status(400).json({ success: false, error: 'Cannot demote or deactivate your own admin account' });
    }

    const result = await query(
      `UPDATE users 
       SET role = COALESCE($1, role), 
           is_active = COALESCE($2, is_active),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, email, name, role, is_active, last_login, created_at`,
      [role, is_active, id]
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
      `UPDATE users SET credits = $1, plan_type = $2, updated_at = NOW() WHERE id = $3 RETURNING id, email, credits, plan_type`,
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
      [title, description, price_usd, credits, interval, tab, is_popular, JSON.stringify(features)]
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
      [title, description, price_usd, credits, interval, tab, is_popular, JSON.stringify(features), is_active, id]
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

module.exports = router;
