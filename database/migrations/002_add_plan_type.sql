ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50) DEFAULT 'free';
UPDATE users SET credits = 5.00 WHERE credits = 0.00;
UPDATE users SET plan_type = 'free' WHERE plan_type IS NULL;
