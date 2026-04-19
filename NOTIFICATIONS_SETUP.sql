-- Notifications table for field force job alerts
-- Mirror of supabase/migrations/20250416000001_notifications_setup.sql
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  message text NOT NULL,
  type text DEFAULT 'job_assigned',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin insert notifications" ON notifications
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) = 'admin'
  );
