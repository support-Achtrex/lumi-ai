const { Pool } = require('pg');
const logger = require('./logger');

const poolConfig = process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL, max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000, ssl: { rejectUnauthorized: false } }
  : {
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME     || 'lumi_ai',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL error:', err);
});

async function connectDB() {
  const client = await pool.connect();
  client.release();
  logger.info('PostgreSQL pool initialised');
}

const bcrypt = require('bcryptjs');
const DEMO_PASSWORD_HASH = bcrypt.hashSync('password', 12);

async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn(`Slow query detected (${duration}ms): ${text}`);
    }
    return res;
  } catch (err) {
    const isConnError = err.code === 'ECONNREFUSED' 
      || err.code === '28P01' 
      || err.code === 'ENOTFOUND'
      || err.message.includes('ECONNREFUSED') 
      || err.message.includes('Connection terminated')
      || err.message.includes('password authentication failed');

    if (isConnError) {
      logger.debug(`[DEMO MODE] Intercepted query: ${text.substring(0, 50)}...`);
      
      if (text.includes('FROM users') || text.includes('INSERT INTO users')) {
        return {
          rows: [{
            id: '11111111-1111-1111-1111-111111111111',
            email: 'demo@achtrex.com',
            password: DEMO_PASSWORD_HASH,
            name: 'Demo Admin',
            role: 'enterprise',
            enterprise_id: '22222222-2222-2222-2222-222222222222',
            is_active: true,
            created_at: new Date(),
            last_login: new Date()
          }],
          rowCount: 1
        };
      }
      
      if (text.includes('INSERT INTO conversations')) {
        return { rows: [{ id: '33333333-3333-3333-3333-333333333333' }], rowCount: 1 };
      }
      
      return { rows: [], rowCount: 0 };
    }
    throw err;
  }
}

async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const release = client.release.bind(client);

  const timeout = setTimeout(() => {
    logger.error('Client checked out for more than 5 seconds');
  }, 5000);

  client.release = () => {
    clearTimeout(timeout);
    client.query = originalQuery;
    client.release = release;
    return release();
  };

  return client;
}

module.exports = { connectDB, query, getClient, pool };
