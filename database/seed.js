require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const uuid = require('uuid');

async function seed() {
  try {
    console.log('Starting database seeding...');
    
    // Check if demo user already exists
    const check = await pool.query('SELECT id FROM users WHERE email = $1', ['demo@achtrex.com']);
    
    if (check.rowCount === 0) {
      const enterpriseId = uuid.v4();
      const userId = uuid.v4();
      const hash = await bcrypt.hash('password', 12);
      
      // Create enterprise
      await pool.query(`
        INSERT INTO enterprises (id, name, industry, plan)
        VALUES ($1, $2, $3, $4)
      `, [enterpriseId, 'Demo Enterprise', 'dealership', 'enterprise']);
      
      // Create user
      await pool.query(`
        INSERT INTO users (id, email, password, name, role, enterprise_id, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [userId, 'demo@achtrex.com', hash, 'Demo Admin', 'enterprise', enterpriseId, true]);
      
      console.log('✅ Demo user created: demo@achtrex.com / password');
    } else {
      console.log('✅ Demo user already exists.');
    }
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
