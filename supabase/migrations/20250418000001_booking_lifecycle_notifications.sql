-- Booking / ticket lifecycle notification log (emails + SMS)
-- CasaCare uses `tickets` as the service booking entity; `booking_id` stores the ticket UUID.

CREATE TABLE IF NOT EXISTS booking_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'sms')),
  event_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  template_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_notifications_booking_id ON booking_notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_notifications_user_id ON booking_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_notifications_status ON booking_notifications(status);
CREATE INDEX IF NOT EXISTS idx_booking_notifications_event_type ON booking_notifications(event_type);

ALTER TABLE booking_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own booking notifications"
  ON booking_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all booking notifications"
  ON booking_notifications FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
