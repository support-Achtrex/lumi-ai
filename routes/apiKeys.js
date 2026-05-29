const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { query } = require('../config/database');
const crypto = require('crypto');

// GET /api/keys - List all keys for the user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, key_value, created_at, last_used_at FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/keys/generate - Generate a new API key
router.post('/generate', authenticate, async (req, res, next) => {
  try {
    const { name = 'Default Key' } = req.body;
    const rawKey = 'lumi_live_' + crypto.randomBytes(24).toString('hex');
    
    const result = await query(
      'INSERT INTO api_keys (user_id, name, key_value) VALUES ($1, $2, $3) RETURNING id, name, key_value, created_at, last_used_at',
      [req.user.id, name, rawKey]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/keys/:id - Delete an API key
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM api_keys WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Key not found' });
    }
    
    res.json({ success: true, message: 'Key deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
