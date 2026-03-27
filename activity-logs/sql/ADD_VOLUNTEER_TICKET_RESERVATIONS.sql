-- Add 25 Volunteer Ticket Reservations
-- For accommodation team, presenters, and committee
-- These are placeholders that can be edited later when names are confirmed
-- Run this in Supabase SQL Editor

-- Insert 25 volunteer reservations
INSERT INTO summit_ticket_reservations (name, email, phone, organization, status)
VALUES
  ('Volunteer 1', 'volunteer1@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 2', 'volunteer2@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 3', 'volunteer3@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 4', 'volunteer4@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 5', 'volunteer5@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 6', 'volunteer6@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 7', 'volunteer7@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 8', 'volunteer8@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 9', 'volunteer9@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 10', 'volunteer10@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 11', 'volunteer11@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 12', 'volunteer12@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 13', 'volunteer13@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 14', 'volunteer14@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 15', 'volunteer15@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 16', 'volunteer16@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 17', 'volunteer17@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 18', 'volunteer18@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 19', 'volunteer19@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 20', 'volunteer20@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 21', 'volunteer21@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 22', 'volunteer22@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 23', 'volunteer23@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 24', 'volunteer24@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved'),
  ('Volunteer 25', 'volunteer25@signapse.ai', NULL, 'Accommodation Team / Presenters / Committee', 'reserved')
ON CONFLICT (email) DO NOTHING;

-- Verify the count
-- Should show 29 total reserved (4 existing + 25 new = 29)
-- Available should be 146 (175 - 29 = 146)
SELECT 
  COUNT(*) as total_reserved,
  COUNT(*) FILTER (WHERE status = 'reserved') as reserved_count,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count
FROM summit_ticket_reservations
WHERE status IN ('reserved', 'confirmed');

-- Check available tickets (should be 146)
SELECT get_available_ticket_count() as available_tickets;
