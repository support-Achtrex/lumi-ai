require('dotenv').config();
const { pool } = require('./config/database');

async function run() {
  try {
    const res = await pool.query('SELECT email, role, plan_type, credits FROM users');
    console.log(res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
