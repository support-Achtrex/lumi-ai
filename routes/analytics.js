const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { query } = require('../config/database');

// ── GET /api/analytics/usage — User usage stats ───────────────────────────────
router.get('/usage', authenticate, async (req, res, next) => {
  try {
    const stats = await query(
      `SELECT
         COUNT(*) as total_requests,
         COUNT(*) as user_messages,
         COALESCE(SUM(input_tokens), 0) as total_input_tokens,
         COALESCE(SUM(output_tokens), 0) as total_output_tokens,
         MIN(created_at) as first_activity,
         MAX(created_at) as last_activity
       FROM api_usage
       WHERE user_id = $1`,
      [req.user.id]
    );

    res.json({ success: true, data: stats.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/analytics/chart — Usage over time ────────────────────────────────
router.get('/chart', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
         TO_CHAR(DATE(created_at), 'Mon DD') as date,
         COUNT(*)::int as requests,
         COALESCE(SUM(input_tokens + output_tokens), 0)::int as tokens
       FROM api_usage
       WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) ASC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/analytics/popular-queries — Common query types ──────────────────
router.get('/popular-queries', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
         metadata->>'intent' as intent_type,
         COUNT(*) as count
       FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       WHERE c.user_id = $1 AND m.role = 'user'
         AND metadata->>'intent' IS NOT NULL
       GROUP BY metadata->>'intent'
       ORDER BY count DESC
       LIMIT 10`,
      [req.user.id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
