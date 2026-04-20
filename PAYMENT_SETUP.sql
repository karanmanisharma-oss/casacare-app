-- Payment columns on tickets
-- Mirror of supabase/migrations/20250416000002_payment_setup.sql
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_txn_id text,
  ADD COLUMN IF NOT EXISTS payment_amount numeric,
  ADD COLUMN IF NOT EXISTS payment_date timestamptz;
