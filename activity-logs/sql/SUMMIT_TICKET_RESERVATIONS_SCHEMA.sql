-- Summit 2026 Ticket Pre-Reservations Schema
-- Run this in Supabase SQL Editor

-- Ticket Pre-Reservations Table
CREATE TABLE IF NOT EXISTS summit_ticket_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'confirmed', 'cancelled')),
  reserved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure unique email per reservation
  CONSTRAINT unique_email_reservation UNIQUE (email)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ticket_reservations_status ON summit_ticket_reservations(status);
CREATE INDEX IF NOT EXISTS idx_ticket_reservations_reserved_at ON summit_ticket_reservations(reserved_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_reservations_email ON summit_ticket_reservations(email);

-- Function to get available ticket count (max 175 tickets)
CREATE OR REPLACE FUNCTION get_available_ticket_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reserved_count INTEGER;
  max_tickets INTEGER := 175;
BEGIN
  SELECT COUNT(*) INTO reserved_count
  FROM summit_ticket_reservations
  WHERE status IN ('reserved', 'confirmed');
  
  RETURN GREATEST(0, max_tickets - reserved_count);
END;
$$;

-- Function to get total reserved count
CREATE OR REPLACE FUNCTION get_reserved_ticket_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reserved_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO reserved_count
  FROM summit_ticket_reservations
  WHERE status IN ('reserved', 'confirmed');
  
  RETURN reserved_count;
END;
$$;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_summit_ticket_reservations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_summit_ticket_reservations_updated_at ON summit_ticket_reservations;
CREATE TRIGGER update_summit_ticket_reservations_updated_at
  BEFORE UPDATE ON summit_ticket_reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_summit_ticket_reservations_updated_at();

-- RLS Policies
ALTER TABLE summit_ticket_reservations ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a reservation (authenticated or anonymous)
DROP POLICY IF EXISTS "Anyone can submit ticket reservations" ON summit_ticket_reservations;
CREATE POLICY "Anyone can submit ticket reservations"
ON summit_ticket_reservations
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Users can view their own reservations
DROP POLICY IF EXISTS "Users can view their own reservations" ON summit_ticket_reservations;
CREATE POLICY "Users can view their own reservations"
ON summit_ticket_reservations
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Allow anonymous users to check availability (read-only for ticket count)
-- We'll use a function for this instead

-- Admins and summit members can view all reservations
DROP POLICY IF EXISTS "Admins and summit members can view all reservations" ON summit_ticket_reservations;
CREATE POLICY "Admins and summit members can view all reservations"
ON summit_ticket_reservations
FOR SELECT
TO authenticated
USING (check_user_is_admin_or_summit_member());

-- Admins and summit members can manage reservations
DROP POLICY IF EXISTS "Admins and summit members can manage reservations" ON summit_ticket_reservations;
CREATE POLICY "Admins and summit members can manage reservations"
ON summit_ticket_reservations
FOR ALL
TO authenticated
USING (check_user_is_admin_or_summit_member())
WITH CHECK (check_user_is_admin_or_summit_member());

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_available_ticket_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_ticket_count() TO anon;
GRANT EXECUTE ON FUNCTION get_reserved_ticket_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_reserved_ticket_count() TO anon;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

