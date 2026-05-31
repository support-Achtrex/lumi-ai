const { query } = require('../config/database');
(async () => {
  try {
    const plans = await query('SELECT * FROM plans WHERE is_active = true');
    console.log("Plans count:", plans.rows.length);
    if (plans.rows.length === 0) {
      console.log("No active plans found!");
    } else {
      console.log(plans.rows);
    }
    
    const invoices = await query('SELECT * FROM invoices LIMIT 5');
    console.log("Invoices count:", invoices.rows.length);
    if (invoices.rows.length > 0) {
      console.log(invoices.rows);
    }
  } catch (err) {
    console.error("DB Error:", err.message);
  }
  process.exit(0);
})();
