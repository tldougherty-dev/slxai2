-- Create a default "general" channel if it doesn't exist
-- Run this AFTER running DISCUSSIONS_SCHEMA.sql

INSERT INTO channels (name, description, is_private, created_by)
SELECT 'general', 'General discussion for all members', false, 'system'
WHERE NOT EXISTS (
  SELECT 1 FROM channels WHERE name = 'general'
);

