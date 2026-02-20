-- Migration: Add organization column to waitlist table
-- Run this in Supabase SQL Editor to add the organization field to existing waitlist table

ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS organization TEXT;
