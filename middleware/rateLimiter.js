const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

// Global rate limiter — all endpoints
const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max:      parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message:  { success: false, error: 'Too many requests. Please wait and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded: ${req.ip} ${req.path}`);
    res.status(429).json({ success: false, error: 'Too many requests. Please wait and try again.' });
  }
});

// Chat endpoint — stricter limit (AI calls are expensive)
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max:      parseInt(process.env.CHAT_RATE_LIMIT_MAX) || 30,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { success: false, error: 'Chat rate limit reached. Maximum 30 messages per minute.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Auth endpoints — prevent brute force
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { success: false, error: 'Too many login attempts. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Vehicle data lookup
const vehicleRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 60,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { success: false, error: 'Vehicle lookup rate limit reached.' },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { globalRateLimiter, chatRateLimiter, authRateLimiter, vehicleRateLimiter };
