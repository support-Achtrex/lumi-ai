const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { get } = require('../config/redis');
const logger = require('../config/logger');

// ── Verify JWT token ──────────────────────────────────────────────────────────
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    const token = authHeader.substring(7);

    // Check if token is blacklisted (logged out)
    const blacklisted = await get(`blacklist:token:${token}`);
    if (blacklisted) {
      return res.status(401).json({
        success: false,
        error: 'Token has been invalidated. Please log in again.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get fresh user data
    const result = await query(
      `SELECT id, email, name, role, enterprise_id, is_active, credits, plan_type, last_login
       FROM users WHERE id = $1 AND is_active = true`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found or account deactivated'
      });
    }

    req.user = result.rows[0];
    req.token = token;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired. Please log in again.' });
    }
    logger.error('Auth middleware error:', error);
    return res.status(500).json({ success: false, error: 'Authentication error' });
  }
}

// ── Role-based access control ──────────────────────────────────────────────────
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    next();
  };
}

// ── Enforce Credit Limits ─────────────────────────────────────────────────────
function requireCredits(cost = 1) {
  return async (req, res, next) => {
    // If user has an unlimited enterprise plan or is an admin, they bypass credit limits
    if (req.user.plan_type === 'enterprise' || req.user.role === 'admin') {
      return next();
    }
    
    // Check if they have enough credits
    if (parseFloat(req.user.credits) < cost) {
      return res.status(402).json({
        success: false,
        error: 'CREDITS_EXHAUSTED',
        message: 'You have exhausted your credits. Please upgrade to a premium plan.'
      });
    }
    
    next();
  };
}

// ── Optional auth (for public endpoints that can also be authenticated) ───────
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return authenticate(req, res, next);
}

module.exports = { authenticate, requireRole, requireCredits, optionalAuth };
