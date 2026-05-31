require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function migrate2() {
  try {
    console.log('Starting workflow database migration...');
    const check = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'workflows')");
    if (check.rows[0].exists) {
      console.log('✅ Workflows table already exists. Skipping.');
      return;
    }
    const sqlPath = path.join(__dirname, 'migrations', '002_create_workflows.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('✅ Migration successful! Workflows table created.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate2();
