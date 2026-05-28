const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { query } = require('../config/database');

// ── GET /api/analytics/usage — User usage stats ───────────────────────────────
router.get('/usage', authenticate, async (req, res, next) => {
  try {
    const stats = await query(
      `SELECT
         COUNT(DISTINCT c.id)     as total_conversations,
         COUNT(m.id)              as total_messages,
         COUNT(CASE WHEN m.role = 'user' THEN 1 END) as user_messages,
         COUNT(CASE WHEN m.role = 'assistant' THEN 1 END) as ai_responses,
         SUM((m.metadata->>'inputTokens')::int)  as total_input_tokens,
         SUM((m.metadata->>'outputTokens')::int) as total_output_tokens,
         MIN(c.created_at) as first_conversation,
         MAX(c.updated_at) as last_activity
       FROM conversations c
       LEFT JOIN messages m ON c.id = m.conversation_id
       WHERE c.user_id = $1 AND c.deleted_at IS NULL`,
      [req.user.id]
    );

    res.json({ success: true, data: stats.rows[0] });
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
