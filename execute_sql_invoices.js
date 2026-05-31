require('dotenv').config();
const { pool } = require('./config/database');

async function run() {
  try {
    console.log('Creating invoices table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC(10, 2) NOT NULL,
        plan_name VARCHAR(100) NOT NULL,
        reference VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'paid',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ invoices table created successfully!');
  } catch (error) {
    console.error('❌ SQL failed:', error);
  } finally {
    await pool.end();
  }
}

run();
