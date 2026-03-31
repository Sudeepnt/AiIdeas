-- Run this in your Supabase SQL Editor
CREATE TABLE IF NOT EXISTS tools (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  name text not null,
  description text not null,
  revenue text,
  tech_stack text,
  link text not null
);

-- Set up Row Level Security (RLS)
-- For this simple app, we can allow public read and insert.
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON tools FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access"
  ON tools FOR INSERT
  WITH CHECK (true);
