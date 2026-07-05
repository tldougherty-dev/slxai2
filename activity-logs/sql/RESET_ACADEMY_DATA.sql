-- Delete all Academy data (run in Supabase SQL Editor)
-- Order respects foreign keys

DELETE FROM academy_email_logs;
DELETE FROM academy_registrations;
DELETE FROM academy_workshop_resources;
DELETE FROM academy_workshops;
DELETE FROM academy_workshop_submissions;
DELETE FROM academy_presenters;
DELETE FROM academy_categories;
