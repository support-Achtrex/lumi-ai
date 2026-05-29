require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function migrate() {
  try {
    console.log('Starting database migration...');
    
    // Check if migration has already run (users table exists)
    const check = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')");
    if (check.rows[0].exists) {
      console.log('✅ Database already migrated. Skipping.');
      return;
    }

    const sqlPath = path.join(__dirname, 'migrations', '001_create_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    console.log('✅ Migration successful! Tables created.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
