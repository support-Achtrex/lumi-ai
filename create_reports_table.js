require('dotenv').config();
const { pool } = require('./config/database');

async function run() {
  try {
    console.log('Creating reports table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        size_bytes INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Reports table created successfully!');
  } catch (error) {
    console.error('❌ SQL failed:', error);
  } finally {
    await pool.end();
  }
}

run();
