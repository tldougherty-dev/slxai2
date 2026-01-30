-- Simple Fix for Ticket Reservations RLS
-- Run this in Supabase SQL Editor - matches the working interest_submissions pattern

-- Drop all existing policies first
DROP POLICY IF EXISTS "Anyone can submit ticket reservations" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Anonymous can read ticket counts" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Anonymous can check own reservation by email" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Admins and summit members can view all reservations" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Admins and summit members can manage reservations" ON summit_ticket_reservations;

-- Enable RLS (in case it's disabled)
ALTER TABLE summit_ticket_reservations ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy - EXACTLY like interest_submissions (this works!)
CREATE POLICY "Anyone can submit ticket reservations"
  ON summit_ticket_reservations
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Allow anonymous to SELECT (needed for .select() after insert)
CREATE POLICY "Anonymous can read reservations"
  ON summit_ticket_reservations
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated users can view their own
CREATE POLICY "Users can view their own reservations"
  ON summit_ticket_reservations
  FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Admins can view all (using the existing function)
CREATE POLICY "Admins can view all reservations"
  ON summit_ticket_reservations
  FOR SELECT
  TO authenticated
  USING (check_user_is_admin());

-- Admins can manage all
CREATE POLICY "Admins can manage reservations"
  ON summit_ticket_reservations
  FOR ALL
  TO authenticated
  USING (check_user_is_admin())
  WITH CHECK (check_user_is_admin());

-- Refresh schema
NOTIFY pgrst, 'reload schema';

