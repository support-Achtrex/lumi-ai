const { pool } = require('../config/database');

async function seed() {
  try {
    const defaultPlans = [
      ['Pro', 'For standard research & tasks.', 20.00, 500.00, 'USD / month', 'individual', false, JSON.stringify(['500 AAIA Credits', 'Standard AI context window', 'Diagnostic reports', 'Vehicle history lookups'])],
      ['Max', 'Higher limits, priority access.', 100.00, 5000.00, 'USD / month', 'individual', true, JSON.stringify(['5,000 AAIA Credits', 'Advanced AI context window', 'Priority processing speed', 'Deep analytical research'])],
      ['Ultra', 'For power users & small shops.', 150.00, 10000.00, 'USD / month', 'individual', false, JSON.stringify(['10,000 AAIA Credits', 'Maximum AI context window', 'Early access to new features', 'Priority 24/7 support'])],
      ['Enterprise Monthly', 'Flexible pooled usage for teams.', 500.00, 999999.00, 'USD / month', 'enterprise', false, JSON.stringify(['Unlimited AAIA Credits', 'Fleet management integration', 'Custom data retention controls', 'Dedicated Account Manager'])],
      ['Enterprise Yearly', 'Best value for established organizations.', 30000.00, 999999.00, 'USD / year', 'enterprise', true, JSON.stringify(['Unlimited AAIA Credits', 'Everything in Monthly', 'API Access', 'On-premise deployment options', 'SLA guarantee'])]
    ];
    
    for (const p of defaultPlans) {
      await pool.query(
        `INSERT INTO plans (title, description, price_usd, credits, interval, tab, is_popular, features) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        p
      );
    }
    console.log('Successfully seeded plans!');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
seed();
