const { query } = require('../config/database');
(async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS unlocked_reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        vin VARCHAR(50) NOT NULL,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, vin)
      )
    `);
    console.log("unlocked_reports table created successfully");
  } catch (err) {
    console.error("Error creating table:", err);
  }
  process.exit(0);
})();
