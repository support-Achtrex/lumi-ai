const logger = require('../config/logger');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message    = err.message || 'Internal server error';

  // Log server errors
  if (statusCode >= 500) {
    logger.error('Server error:', {
      message, statusCode,
      stack:  err.stack,
      path:   req.path,
      method: req.method,
      userId: req.user?.id
    });
  } else {
    logger.warn('Client error:', { message, statusCode, path: req.path });
  }

  // Don't expose stack traces in production
  const response = {
    success: false,
    error:   process.env.NODE_ENV === 'production' && statusCode >= 500
               ? 'An unexpected error occurred. Please try again.'
               : message
  };

  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error:   `Route not found: ${req.method} ${req.path}`
  });
}

module.exports = { errorHandler, notFoundHandler };
