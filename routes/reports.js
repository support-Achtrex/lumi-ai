const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Get all reports for the user
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, type, size_bytes, created_at FROM reports WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ reports: rows });
  } catch (error) {
    console.error('Fetch reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get a single report
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM reports WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    res.json({ report: rows[0] });
  } catch (error) {
    console.error('Fetch report error:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Save a new report
router.post('/', async (req, res) => {
  try {
    const { name, type, content } = req.body;
    const sizeBytes = Buffer.byteLength(content, 'utf8');
    
    const { rows } = await pool.query(
      'INSERT INTO reports (user_id, name, type, content, size_bytes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, name, type, content, sizeBytes]
    );
    res.status(201).json({ report: rows[0] });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

module.exports = router;
