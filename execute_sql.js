require('dotenv').config();
const { pool } = require('./config/database');

async function run() {
  try {
    console.log('Running direct SQL for plans and discounts...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        price_usd DECIMAL(10,2) NOT NULL,
        credits DECIMAL(10,2) NOT NULL,
        interval VARCHAR(50) DEFAULT 'month',
        tab VARCHAR(50) DEFAULT 'individual',
        is_popular BOOLEAN DEFAULT false,
        features JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS discounts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) UNIQUE NOT NULL,
        percentage_off DECIMAL(5,2),
        fixed_amount_off DECIMAL(10,2),
        max_uses INTEGER,
        uses INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Seed default plans if table is empty
    const { rows } = await pool.query('SELECT COUNT(*) FROM plans');
    if (parseInt(rows[0].count) === 0) {
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
      console.log('Seeded default plans.');
    }

    console.log('✅ Tables created successfully!');
  } catch (error) {
    console.error('❌ SQL failed:', error);
  } finally {
    await pool.end();
  }
}

run();
