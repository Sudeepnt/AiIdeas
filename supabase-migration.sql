-- Run this in your Supabase SQL Editor to add the new columns
ALTER TABLE tools
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS audience text,
ADD COLUMN IF NOT EXISTS built_in_7_days text;
