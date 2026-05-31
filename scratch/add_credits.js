require('dotenv').config();
const { pool } = require('../config/database');

async function run() {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS credits DECIMAL(10,2) DEFAULT 0.00;');
    console.log('✅ Added credits column to users table.');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await pool.end();
  }
}
run();
