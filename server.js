require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { globalRateLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./config/logger');

// ── Routes ───────────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/auth');
const chatRoutes      = require('./routes/chat');
const vehicleRoutes   = require('./routes/vehicles');
const fleetRoutes     = require('./routes/fleet');
const diagnosticRoutes = require('./routes/diagnostics');
const workflowRoutes  = require('./routes/workflows');
const analyticsRoutes = require('./routes/analytics');
const apiKeysRoutes   = require('./routes/apiKeys');

const app = express();
const server = http.createServer(app);

// ── Socket.IO (real-time chat streaming) ─────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Make io accessible in routes
app.set('io', io);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"]
    }
  }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: msg => logger.http(msg.trim()) } }));
app.use(globalRateLimiter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'LUMI AI',
    company: 'Achtrex',
    version: process.env.PRODUCT_VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/chat',        chatRoutes);
app.use('/api/vehicles',    vehicleRoutes);
app.use('/api/fleet',       fleetRoutes);
app.use('/api/diagnostics', diagnosticRoutes);
app.use('/api/workflows',   workflowRoutes);
app.use('/api/analytics',   analyticsRoutes);
app.use('/api/keys',        apiKeysRoutes);

// ── Socket.IO handlers ────────────────────────────────────────────────────────
const { setupSocketHandlers } = require('./services/SocketService');
setupSocketHandlers(io);

// ── Production Frontend Serving ───────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React frontend app
  app.use(express.static(path.join(__dirname, 'frontend', 'build')));

  // Anything that doesn't match the above API routes, send back index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
  });
}

// ── Error handlers ────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Startup ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

async function start() {
    try {
      await connectDB();
      logger.info('✅ PostgreSQL connected');
    } catch (dbErr) {
      logger.error('⚠️ PostgreSQL connection failed. Running in degraded/demo mode.', dbErr.message);
    }

    try {
      await connectRedis();
      logger.info('✅ Redis connected');
    } catch (redisErr) {
      logger.error('⚠️ Redis connection failed. Cache disabled.', redisErr.message);
    }

    server.listen(PORT, () => {
      logger.info(`🚀 LUMI AI server running on port ${PORT}`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🌐 Frontend: ${process.env.FRONTEND_URL}`);
      logger.info(`🤖 Model: ${process.env.ANTHROPIC_MODEL}`);
    });
}

start();

module.exports = { app, server };
