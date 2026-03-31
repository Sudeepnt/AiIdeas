-- Run this in your Supabase SQL Editor to create the keep_alive table
CREATE TABLE IF NOT EXISTS keep_alive (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  message text not null
);

-- Allow public insertion so our Vercel API route can insert the ping
ALTER TABLE keep_alive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert access"
  ON keep_alive FOR INSERT
  WITH CHECK (true);
