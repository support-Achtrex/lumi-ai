require('dotenv').config();
const { pool } = require('./config/database');

async function run() {
  try {
    console.log('Creating api_keys table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        key_value VARCHAR(255) NOT NULL UNIQUE,
        last_used_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ api_keys table created successfully!');
  } catch (error) {
    console.error('❌ SQL failed:', error);
  } finally {
    await pool.end();
  }
}

run();
