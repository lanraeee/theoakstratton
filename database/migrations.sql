-- Migration: Fix database schema for production
-- This file contains ALTER statements to fix issues in existing databases

-- 1. Add missing columns to users table if they don't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;

-- 2. Convert pricing_plans.id from UUID to VARCHAR
-- First, check if the column needs to be changed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pricing_plans' AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    -- Drop the foreign key reference first
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_plan_id_fkey;

    -- Create a new column with VARCHAR type
    ALTER TABLE pricing_plans ADD COLUMN id_new VARCHAR(100);

    -- Copy data from old UUID column to new VARCHAR column
    UPDATE pricing_plans SET id_new = id::text;

    -- Drop the old column and rename the new one
    ALTER TABLE pricing_plans DROP CONSTRAINT pricing_plans_pkey;
    ALTER TABLE pricing_plans DROP COLUMN id;
    ALTER TABLE pricing_plans RENAME COLUMN id_new TO id;

    -- Add back the primary key
    ALTER TABLE pricing_plans ADD PRIMARY KEY (id);

    -- Re-create the foreign key reference
    ALTER TABLE orders ADD CONSTRAINT orders_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES pricing_plans(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Fix the dashboard_stats view to handle division by zero
DROP VIEW IF EXISTS dashboard_stats;

CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM leads) as total_leads,
  (SELECT COUNT(*) FROM leads WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '7 days') as new_this_week,
  (SELECT COUNT(*) FROM email_templates WHERE is_active = true) as active_templates,
  (SELECT COUNT(*) FROM leads WHERE status = 'customer') as converted_customers,
  (SELECT COALESCE(ROUND(100 * COUNT(CASE WHEN status = 'customer' THEN 1 END)::numeric / NULLIF(COUNT(*)::numeric, 0), 2), 0)
   FROM leads WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '30 days') as engagement_rate;

-- 4. Seed default pricing plans if table is empty
INSERT INTO pricing_plans (id, name, description, price_gbp, features, display_order, is_active)
VALUES
  ('starter', 'Starter', 'Perfect for small businesses', 29900, '["Basic BNPL", "Up to 100 customers", "Email support"]'::jsonb, 1, true),
  ('growth', 'Growth', 'For growing companies', 79900, '["Advanced BNPL", "Up to 1000 customers", "Priority support", "Analytics"]'::jsonb, 2, true),
  ('premium', 'Premium', 'Enterprise solution', 199900, '["Full BNPL Suite", "Unlimited customers", "24/7 support", "Custom integrations"]'::jsonb, 3, true)
ON CONFLICT (id) DO UPDATE SET
  updated_at = CURRENT_TIMESTAMP;
