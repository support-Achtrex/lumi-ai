require('dotenv').config();
const { pool } = require('./config/database');

async function run() {
  try {
    console.log('Adding company and phone to users table...');
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR(255);`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`);
    console.log('✅ SQL execution successful!');
  } catch (error) {
    console.error('❌ SQL failed:', error);
  } finally {
    await pool.end();
  }
}

run();
