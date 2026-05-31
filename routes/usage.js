const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { query } = require('../config/database');

// GET /api/usage - Get current month's usage analytics
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Total tokens and requests for the current month
    const totalsResult = await query(
      `SELECT 
         COUNT(*) as total_requests,
         COALESCE(SUM(input_tokens + output_tokens), 0) as total_tokens
       FROM api_usage
       WHERE user_id = $1
         AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)`,
      [userId]
    );

    // Grouped by day for charts (last 30 days)
    const dailyResult = await query(
      `SELECT 
         to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day,
         COUNT(*) as daily_requests,
         COALESCE(SUM(input_tokens + output_tokens), 0) as daily_tokens
       FROM api_usage
       WHERE user_id = $1
         AND created_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY date_trunc('day', created_at)
       ORDER BY date_trunc('day', created_at) ASC`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        totals: totalsResult.rows[0],
        daily: dailyResult.rows
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
