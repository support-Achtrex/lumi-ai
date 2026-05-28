const Redis = require('ioredis');
const logger = require('./logger');

let client;

async function connectRedis() {
  client = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : new Redis({
    host:     process.env.REDIS_HOST     || 'localhost',
    port:     parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy(times) {
      if (times > 10) return null;
      return Math.min(times * 100, 3000);
    }
  });

  client.on('error', (err) => logger.error('Redis error:', err));
  client.on('connect', () => logger.info('Redis connected'));

  await client.ping();
}

function getClient() {
  if (!client) throw new Error('Redis not initialised — call connectRedis() first');
  return client;
}

async function set(key, value, ttlSeconds) {
  const c = getClient();
  const serialised = JSON.stringify(value);
  if (ttlSeconds) {
    await c.setex(key, ttlSeconds, serialised);
  } else {
    await c.set(key, serialised);
  }
}

async function get(key) {
  const c = getClient();
  const value = await c.get(key);
  return value ? JSON.parse(value) : null;
}

async function del(key) {
  const c = getClient();
  return c.del(key);
}

async function exists(key) {
  const c = getClient();
  return c.exists(key);
}

const DEFAULT_TTL = parseInt(process.env.REDIS_TTL) || 3600;

module.exports = { connectRedis, getClient, set, get, del, exists, DEFAULT_TTL };
