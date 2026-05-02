-- ================================================================
-- CASA CARE — ATOMIC SCHEMA (8-Stage Service Lifecycle)
-- Layered on top of existing `profiles` + `tickets` schema.
-- Adds: tiers, KYC, assets/QR, 90s dispatch, geo proof, revised
-- quotes, parts, media, QC audits, rework, financials, retention,
-- predictive maintenance, plus all SOP triggers/functions.
-- Idempotent — safe to re-run.
-- ================================================================

-- ============ ENUMS ============
DO $$ BEGIN
  CREATE TYPE casa_user_tier AS ENUM ('individual', 'nri_owner', 'corporate_hq', 'field_force');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE casa_kyc_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE casa_asset_category AS ENUM ('ac', 'ro', 'plumbing', 'carpentry', 'painting', 'electrical', 'appliance', 'nri_property', 'movers', 'amc', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE casa_ticket_lifecycle_status AS ENUM (
    'open', 'assigned', 'en_route', 'in_progress',
    'awaiting_qc', 'rework', 'qc_passed', 'closed',
    'red_flag', 'payment_pending'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE casa_payment_mode AS ENUM ('upi', 'card', 'cod', 'pay_later');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE casa_offer_response AS ENUM ('pending', 'accepted', 'rejected', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE casa_log_event_type AS ENUM ('trip_start', 'check_in', 'check_out', 'work_started', 'work_completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE casa_qc_verdict AS ENUM ('pass', 'fail');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE casa_quote_approval AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE casa_media_type AS ENUM ('issue_photo', 'voice_note', 'before_photo', 'after_photo', 'video', 'invoice_pdf');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ STAGE 01: PROFILE EXTENSIONS, TIERS, KYC ============

-- Extend profiles with tier + language (preserve existing role column).
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS user_tier casa_user_tier DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS language_pref text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS notification_token text;

-- Tier-specific metadata (1:1 with profiles).
CREATE TABLE IF NOT EXISTS tier_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  -- Individual: typically empty
  -- NRI Owner
  passport_url text,
  oci_url text,
  property_manager_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  -- Corporate HQ
  company_name text,
  gst_number text,
  auth_letter_url text,
  -- Field Force
  agent_certification_url text,
  background_check_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tier_metadata_user ON tier_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_tier_metadata_pm ON tier_metadata(property_manager_id);

-- KYC verification records.
CREATE TABLE IF NOT EXISTS kyc_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  document_url text,
  status casa_kyc_status DEFAULT 'pending',
  rejection_reason text,
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_records(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_records(status);

-- ============ STAGE 02: ASSETS & QR REGISTRY ============

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_sticker_id text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category casa_asset_category NOT NULL,
  brand text,
  model text,
  install_date date,
  property_address text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  service_history jsonb DEFAULT '[]'::jsonb,
  last_service_date date,
  next_service_due date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assets_user ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_qr ON assets(qr_sticker_id);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_next_service ON assets(next_service_due);

-- ============ STAGE 02-07: TICKET ENGINE EXTENSIONS ============

-- Extend the existing tickets table with the atomic lifecycle fields.
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS ticket_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lifecycle_status casa_ticket_lifecycle_status DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS issue_desc text,
  ADD COLUMN IF NOT EXISTS voice_note_path text,
  ADD COLUMN IF NOT EXISTS est_price numeric(12, 2),
  ADD COLUMN IF NOT EXISTS final_price numeric(12, 2),
  ADD COLUMN IF NOT EXISTS payment_mode casa_payment_mode,
  ADD COLUMN IF NOT EXISTS service_lat numeric(10, 7),
  ADD COLUMN IF NOT EXISTS service_lng numeric(10, 7),
  ADD COLUMN IF NOT EXISTS geofence_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS proxy_signoff_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS property_manager_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS completion_token text,
  ADD COLUMN IF NOT EXISTS completion_signed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS dispatcher_alert_sent boolean DEFAULT false;

-- Generator for TKT-YYMMDD-NNNN ticket codes.
CREATE OR REPLACE FUNCTION generate_casa_ticket_code()
RETURNS text AS $$
DECLARE
  prefix text;
  seq_for_day int;
BEGIN
  prefix := 'TKT-' || to_char(now(), 'YYMMDD') || '-';
  SELECT COUNT(*) + 1 INTO seq_for_day
    FROM tickets
    WHERE ticket_code LIKE prefix || '%';
  RETURN prefix || lpad(seq_for_day::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_casa_ticket_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.ticket_code IS NULL THEN
    NEW.ticket_code := generate_casa_ticket_code();
  END IF;
  -- Auto-flag NRI proxy sign-off requirement on insert.
  IF NEW.proxy_signoff_required IS NULL OR NEW.proxy_signoff_required = false THEN
    IF EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = NEW.user_id AND p.user_tier = 'nri_owner'
    ) THEN
      NEW.proxy_signoff_required := true;
      -- Pre-populate property manager from tier_metadata if available.
      IF NEW.property_manager_id IS NULL THEN
        SELECT property_manager_id INTO NEW.property_manager_id
          FROM tier_metadata WHERE user_id = NEW.user_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_casa_ticket_code ON tickets;
CREATE TRIGGER trg_set_casa_ticket_code
  BEFORE INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_casa_ticket_code();

CREATE INDEX IF NOT EXISTS idx_tickets_ticket_code ON tickets(ticket_code);
CREATE INDEX IF NOT EXISTS idx_tickets_lifecycle ON tickets(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_tickets_asset ON tickets(asset_id);

-- ============ STAGE 03-04: AGENTS, 90s OFFERS, SERVICE LOGS ============

CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  phone text,
  current_lat numeric(10, 7),
  current_lng numeric(10, 7),
  last_location_at timestamptz,
  skill_tags text[] DEFAULT ARRAY[]::text[],
  rating_avg numeric(3, 2) DEFAULT 5.0,
  completed_jobs int DEFAULT 0,
  rework_count int DEFAULT 0,
  availability_status text DEFAULT 'offline'
    CHECK (availability_status IN ('available', 'busy', 'offline')),
  active_ticket_id uuid REFERENCES tickets(id) ON DELETE SET NULL,
  background_check_passed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agents_user ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(availability_status);
CREATE INDEX IF NOT EXISTS idx_agents_skills ON agents USING gin (skill_tags);

-- 90-second dispatch window. attempt_number 1..3 per ticket.
CREATE TABLE IF NOT EXISTS ticket_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  attempt_number int NOT NULL CHECK (attempt_number BETWEEN 1 AND 3),
  offered_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '90 seconds'),
  responded_at timestamptz,
  response casa_offer_response NOT NULL DEFAULT 'pending',
  reject_reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (ticket_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS idx_ticket_offers_ticket ON ticket_offers(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_offers_agent ON ticket_offers(agent_id);
CREATE INDEX IF NOT EXISTS idx_ticket_offers_expires ON ticket_offers(expires_at);
CREATE INDEX IF NOT EXISTS idx_ticket_offers_response ON ticket_offers(response);

-- Proof of attendance / geo-tagged service log.
CREATE TABLE IF NOT EXISTS service_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  event_type casa_log_event_type NOT NULL,
  event_at timestamptz NOT NULL DEFAULT now(),
  geo_lat numeric(10, 7),
  geo_lng numeric(10, 7),
  selfie_url text,
  distance_from_target_m numeric(10, 2),
  needs_manual_verification boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_logs_ticket ON service_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_service_logs_agent ON service_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_service_logs_event ON service_logs(event_type);

-- Approximate Haversine distance in meters (no PostGIS dependency).
CREATE OR REPLACE FUNCTION casa_haversine_m(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
RETURNS numeric AS $$
DECLARE
  r numeric := 6371000;
  dlat numeric;
  dlon numeric;
  a numeric;
BEGIN
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat / 2) ^ 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ^ 2;
  RETURN r * 2 * atan2(sqrt(a), sqrt(1 - a));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 100m geofence enforcement on CHECK_IN.
CREATE OR REPLACE FUNCTION casa_enforce_geofence()
RETURNS trigger AS $$
DECLARE
  ticket_lat numeric;
  ticket_lng numeric;
  dist numeric;
BEGIN
  IF NEW.event_type = 'check_in' THEN
    SELECT service_lat, service_lng INTO ticket_lat, ticket_lng
      FROM tickets WHERE id = NEW.ticket_id;
    IF ticket_lat IS NOT NULL AND NEW.geo_lat IS NOT NULL THEN
      dist := casa_haversine_m(ticket_lat, ticket_lng, NEW.geo_lat, NEW.geo_lng);
      NEW.distance_from_target_m := dist;
      IF dist > 100 THEN
        NEW.needs_manual_verification := true;
      ELSE
        UPDATE tickets SET geofence_verified = true WHERE id = NEW.ticket_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_casa_geofence ON service_logs;
CREATE TRIGGER trg_casa_geofence
  BEFORE INSERT ON service_logs
  FOR EACH ROW
  EXECUTE FUNCTION casa_enforce_geofence();

-- ============ STAGE 03 "3-STRIKE" RULE ============

CREATE OR REPLACE FUNCTION casa_three_strike_redflag()
RETURNS trigger AS $$
DECLARE
  expired_count int;
BEGIN
  IF NEW.response IN ('expired', 'rejected') AND NEW.attempt_number = 3 THEN
    SELECT COUNT(*) INTO expired_count
      FROM ticket_offers
      WHERE ticket_id = NEW.ticket_id
        AND response IN ('expired', 'rejected');
    IF expired_count >= 3 THEN
      UPDATE tickets
        SET lifecycle_status = 'red_flag',
            dispatcher_alert_sent = true,
            updated_at = now()
        WHERE id = NEW.ticket_id;
      INSERT INTO notifications (user_id, ticket_id, message, type)
      SELECT p.id, NEW.ticket_id,
             'Ticket flagged RED — 3 dispatch attempts failed. Manual intervention required.',
             'red_flag_alert'
        FROM profiles p
        WHERE p.role = 'admin';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_casa_three_strike ON ticket_offers;
CREATE TRIGGER trg_casa_three_strike
  AFTER INSERT OR UPDATE ON ticket_offers
  FOR EACH ROW
  EXECUTE FUNCTION casa_three_strike_redflag();

-- Helper: expire stale offers (call from a scheduled function every minute).
CREATE OR REPLACE FUNCTION casa_expire_stale_offers()
RETURNS int AS $$
DECLARE
  affected int;
BEGIN
  UPDATE ticket_offers
    SET response = 'expired', responded_at = now()
    WHERE response = 'pending' AND expires_at < now();
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql;

-- ============ STAGE 05: REVISED QUOTES, PARTS, MEDIA ============

CREATE TABLE IF NOT EXISTS revised_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  original_estimate numeric(12, 2),
  revised_total numeric(12, 2) NOT NULL,
  itemized_parts jsonb DEFAULT '[]'::jsonb,
  reason text,
  customer_approval_status casa_quote_approval DEFAULT 'pending',
  decided_at timestamptz,
  visit_only_charge numeric(12, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_revised_quotes_ticket ON revised_quotes(ticket_id);
CREATE INDEX IF NOT EXISTS idx_revised_quotes_status ON revised_quotes(customer_approval_status);

CREATE TABLE IF NOT EXISTS parts_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id text UNIQUE NOT NULL,
  part_name text NOT NULL,
  category casa_asset_category,
  cost numeric(10, 2) NOT NULL,
  warranty_months int DEFAULT 0,
  stock_qty int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parts_inventory_category ON parts_inventory(category);

CREATE TABLE IF NOT EXISTS ticket_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  media_type casa_media_type NOT NULL,
  storage_path text NOT NULL,
  caption text,
  taken_at timestamptz DEFAULT now(),
  geo_lat numeric(10, 7),
  geo_lng numeric(10, 7),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_media_ticket ON ticket_media(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_media_type ON ticket_media(media_type);

-- Visit-only invoice on quote rejection.
CREATE OR REPLACE FUNCTION casa_visit_only_on_quote_reject()
RETURNS trigger AS $$
DECLARE
  visit_charge numeric(12, 2);
  invoice_no text;
  ticket_user_id uuid;
BEGIN
  IF NEW.customer_approval_status = 'rejected'
     AND (OLD.customer_approval_status IS DISTINCT FROM 'rejected') THEN
    visit_charge := COALESCE(NEW.visit_only_charge, 250);
    invoice_no := 'INV-' || to_char(now(), 'YYMMDD') || '-' || substr(NEW.ticket_id::text, 1, 6);

    SELECT user_id INTO ticket_user_id FROM tickets WHERE id = NEW.ticket_id;

    INSERT INTO invoices (
      ticket_id, user_id, invoice_number, service_charge, total_amount,
      payment_mode, payment_status, notes
    ) VALUES (
      NEW.ticket_id, ticket_user_id, invoice_no, visit_charge, visit_charge,
      'cod', 'pending', 'Diagnosis-only visit charge (revised quote rejected).'
    ) ON CONFLICT (ticket_id) DO NOTHING;

    UPDATE tickets
      SET lifecycle_status = 'closed',
          status = 'closed',
          final_price = visit_charge,
          closed_at = now(),
          updated_at = now()
      WHERE id = NEW.ticket_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_casa_visit_only ON revised_quotes;
CREATE TRIGGER trg_casa_visit_only
  AFTER UPDATE ON revised_quotes
  FOR EACH ROW
  EXECUTE FUNCTION casa_visit_only_on_quote_reject();

-- ============ STAGE 06: QC AUDITS & REWORK REGISTRY ============

CREATE TABLE IF NOT EXISTS qc_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  checklist_results jsonb NOT NULL DEFAULT '{
    "photo_quality": null,
    "location_verified": null,
    "time_on_site_reasonable": null,
    "parts_logged": null,
    "customer_rating_checked": null
  }'::jsonb,
  verdict casa_qc_verdict NOT NULL,
  customer_call_notes text,
  reviewed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qc_audits_ticket ON qc_audits(ticket_id);
CREATE INDEX IF NOT EXISTS idx_qc_audits_verdict ON qc_audits(verdict);

CREATE TABLE IF NOT EXISTS rework_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  child_rework_id uuid REFERENCES tickets(id) ON DELETE SET NULL,
  rework_reason text NOT NULL,
  agent_payout_deduction numeric(10, 2) DEFAULT 0,
  qc_audit_id uuid REFERENCES qc_audits(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rework_parent ON rework_registry(parent_ticket_id);
CREATE INDEX IF NOT EXISTS idx_rework_child ON rework_registry(child_rework_id);

-- NRI proxy sign-off: allow property manager to sign completion.
CREATE OR REPLACE FUNCTION casa_validate_completion_signoff()
RETURNS trigger AS $$
DECLARE
  ticket_owner uuid;
  is_nri boolean;
  pm_id uuid;
BEGIN
  IF NEW.completion_signed_by IS NOT NULL
     AND (OLD.completion_signed_by IS DISTINCT FROM NEW.completion_signed_by) THEN

    ticket_owner := NEW.user_id;
    pm_id := NEW.property_manager_id;

    SELECT (user_tier = 'nri_owner') INTO is_nri
      FROM profiles WHERE id = ticket_owner;

    IF NEW.completion_signed_by = ticket_owner THEN
      -- Owner sign-off always valid.
      RETURN NEW;
    END IF;

    IF is_nri AND pm_id IS NOT NULL AND NEW.completion_signed_by = pm_id THEN
      -- NRI proxy sign-off via designated property manager.
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'Invalid completion sign-off: must be ticket owner, or property_manager_id for NRI tier';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_casa_signoff ON tickets;
CREATE TRIGGER trg_casa_signoff
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION casa_validate_completion_signoff();

-- ============ STAGE 07: FINANCIALS (INVOICES already exist; ensure shape) ============

-- The legacy `invoices` table from migration 001 references service_requests.
-- Create the production-grade invoices table only if not already present.
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid UNIQUE REFERENCES tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  invoice_number text UNIQUE NOT NULL,
  service_charge numeric(12, 2) NOT NULL DEFAULT 0,
  parts_charge numeric(12, 2) DEFAULT 0,
  tax_total numeric(12, 2) DEFAULT 0,
  gst_rate numeric(5, 2) DEFAULT 18,
  gst_breakdown jsonb DEFAULT '{}'::jsonb,
  total_amount numeric(12, 2) NOT NULL,
  payment_mode casa_payment_mode,
  payment_status text DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  paid_at timestamptz,
  payment_ref text,
  pdf_url text,
  notes text,
  generated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_ticket ON invoices(ticket_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(payment_status);

-- ============ STAGE 08: LOYALTY & RETENTION ============

CREATE TABLE IF NOT EXISTS loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points_balance int DEFAULT 0,
  points_redeemed int DEFAULT 0,
  referral_code text UNIQUE,
  last_updated timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_user ON loyalty_points(user_id);

CREATE TABLE IF NOT EXISTS predictive_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_service_date date,
  next_service_due date NOT NULL,
  category casa_asset_category,
  reason text,
  reminder_status text DEFAULT 'pending'
    CHECK (reminder_status IN ('pending', 'sent', 'acknowledged', 'cancelled')),
  reminder_sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE (asset_id, next_service_due)
);

CREATE INDEX IF NOT EXISTS idx_predictive_user ON predictive_maintenance(user_id);
CREATE INDEX IF NOT EXISTS idx_predictive_due ON predictive_maintenance(next_service_due);
CREATE INDEX IF NOT EXISTS idx_predictive_status ON predictive_maintenance(reminder_status);

-- Days-between-service per asset category.
CREATE OR REPLACE FUNCTION casa_service_interval_days(cat casa_asset_category)
RETURNS int AS $$
BEGIN
  RETURN CASE cat
    WHEN 'ac' THEN 180
    WHEN 'ro' THEN 120
    WHEN 'plumbing' THEN 365
    WHEN 'carpentry' THEN 365
    WHEN 'painting' THEN 730
    WHEN 'electrical' THEN 365
    WHEN 'appliance' THEN 365
    WHEN 'amc' THEN 90
    WHEN 'nri_property' THEN 90
    ELSE 365
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Daily scan: queue predictive_maintenance rows for assets due for service.
CREATE OR REPLACE FUNCTION casa_scan_predictive_maintenance()
RETURNS int AS $$
DECLARE
  inserted int := 0;
  rec record;
  due_date date;
BEGIN
  FOR rec IN
    SELECT a.id AS asset_id, a.user_id, a.category, a.last_service_date
      FROM assets a
      WHERE a.last_service_date IS NOT NULL
        AND a.last_service_date <= (current_date - (casa_service_interval_days(a.category) || ' days')::interval)
  LOOP
    due_date := rec.last_service_date + casa_service_interval_days(rec.category);
    INSERT INTO predictive_maintenance (asset_id, user_id, last_service_date, next_service_due, category, reason)
    VALUES (
      rec.asset_id, rec.user_id, rec.last_service_date, due_date, rec.category,
      'Auto-generated: ' || rec.category || ' service overdue (>' || casa_service_interval_days(rec.category) || ' days).'
    )
    ON CONFLICT (asset_id, next_service_due) DO NOTHING;
    GET DIAGNOSTICS inserted = ROW_COUNT;
  END LOOP;
  RETURN inserted;
END;
$$ LANGUAGE plpgsql;

-- ============ updated_at TRIGGERS ============

CREATE OR REPLACE FUNCTION casa_touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_touch_tier_metadata BEFORE UPDATE ON tier_metadata
    FOR EACH ROW EXECUTE FUNCTION casa_touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_touch_assets BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION casa_touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_touch_agents BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION casa_touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_touch_revised_quotes BEFORE UPDATE ON revised_quotes
    FOR EACH ROW EXECUTE FUNCTION casa_touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_touch_parts BEFORE UPDATE ON parts_inventory
    FOR EACH ROW EXECUTE FUNCTION casa_touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ ROW LEVEL SECURITY ============

ALTER TABLE tier_metadata        ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_records          ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets               ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents               ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_offers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE revised_quotes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts_inventory      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_media         ENABLE ROW LEVEL SECURITY;
ALTER TABLE qc_audits            ENABLE ROW LEVEL SECURITY;
ALTER TABLE rework_registry      ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices             ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points       ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_maintenance ENABLE ROW LEVEL SECURITY;

-- Helper macro: admin-or-owner pattern reused below.

DROP POLICY IF EXISTS "tier_metadata self read" ON tier_metadata;
CREATE POLICY "tier_metadata self read" ON tier_metadata FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "tier_metadata self write" ON tier_metadata;
CREATE POLICY "tier_metadata self write" ON tier_metadata FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "kyc self read" ON kyc_records;
CREATE POLICY "kyc self read" ON kyc_records FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "kyc self insert" ON kyc_records;
CREATE POLICY "kyc self insert" ON kyc_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "assets owner read" ON assets;
CREATE POLICY "assets owner read" ON assets FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'field_force')));
DROP POLICY IF EXISTS "assets owner write" ON assets;
CREATE POLICY "assets owner write" ON assets FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "agents self read" ON agents;
CREATE POLICY "agents self read" ON agents FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'corporate')));
DROP POLICY IF EXISTS "agents self update" ON agents;
CREATE POLICY "agents self update" ON agents FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ticket_offers agent or admin" ON ticket_offers;
CREATE POLICY "ticket_offers agent or admin" ON ticket_offers FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM agents a WHERE a.id = ticket_offers.agent_id AND a.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
DROP POLICY IF EXISTS "ticket_offers agent respond" ON ticket_offers;
CREATE POLICY "ticket_offers agent respond" ON ticket_offers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM agents a WHERE a.id = ticket_offers.agent_id AND a.user_id = auth.uid()));

DROP POLICY IF EXISTS "service_logs by agent or owner" ON service_logs;
CREATE POLICY "service_logs by agent or owner" ON service_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM agents a WHERE a.id = service_logs.agent_id AND a.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM tickets t WHERE t.id = service_logs.ticket_id AND t.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
DROP POLICY IF EXISTS "service_logs agent insert" ON service_logs;
CREATE POLICY "service_logs agent insert" ON service_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM agents a WHERE a.id = service_logs.agent_id AND a.user_id = auth.uid()));

DROP POLICY IF EXISTS "revised_quotes ticket parties" ON revised_quotes;
CREATE POLICY "revised_quotes ticket parties" ON revised_quotes FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM tickets t WHERE t.id = revised_quotes.ticket_id
            AND (t.user_id = auth.uid() OR t.assigned_to = auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
DROP POLICY IF EXISTS "revised_quotes customer decide" ON revised_quotes;
CREATE POLICY "revised_quotes customer decide" ON revised_quotes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM tickets t WHERE t.id = revised_quotes.ticket_id AND t.user_id = auth.uid()));

DROP POLICY IF EXISTS "parts public read" ON parts_inventory;
CREATE POLICY "parts public read" ON parts_inventory FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "ticket_media parties" ON ticket_media;
CREATE POLICY "ticket_media parties" ON ticket_media FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_media.ticket_id
            AND (t.user_id = auth.uid() OR t.assigned_to = auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'corporate'))
  );
DROP POLICY IF EXISTS "ticket_media uploader insert" ON ticket_media;
CREATE POLICY "ticket_media uploader insert" ON ticket_media FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "qc audits admin/qc" ON qc_audits;
CREATE POLICY "qc audits admin/qc" ON qc_audits FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'corporate'))
         OR EXISTS (SELECT 1 FROM tickets t WHERE t.id = qc_audits.ticket_id AND t.user_id = auth.uid()));

DROP POLICY IF EXISTS "rework admin read" ON rework_registry;
CREATE POLICY "rework admin read" ON rework_registry FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'corporate')));

DROP POLICY IF EXISTS "invoices owner read" ON invoices;
CREATE POLICY "invoices owner read" ON invoices FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "loyalty self read" ON loyalty_points;
CREATE POLICY "loyalty self read" ON loyalty_points FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "predictive owner read" ON predictive_maintenance;
CREATE POLICY "predictive owner read" ON predictive_maintenance FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============ END OF ATOMIC SCHEMA ============
