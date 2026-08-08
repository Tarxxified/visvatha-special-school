-- ============================================================
-- VISVATHA — ENQUIRIES TABLE SETUP
-- ------------------------------------------------------------
-- Run this once in your Supabase project:
-- Dashboard → SQL Editor → New query → paste this → Run
-- ============================================================

-- Needed for gen_random_uuid() below (usually already enabled on Supabase)
create extension if not exists pgcrypto;

create table if not exists enquiries (
  id           uuid primary key default gen_random_uuid(),
  parent_name  text not null,
  child_age    integer not null check (child_age between 1 and 18),
  phone        text not null,
  email        text not null,
  interest     text not null,
  message      text default '',
  status       text not null default 'new' check (status in ('new', 'contacted', 'enrolled', 'closed')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Speeds up the admin dashboard's "newest first" sort and status filter
create index if not exists idx_enquiries_created_at on enquiries (created_at desc);
create index if not exists idx_enquiries_status on enquiries (status);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
-- With RLS on and no policies, NOBODY can touch this table through
-- Supabase's public REST API — only the service_role key (used
-- server-side for admin operations) bypasses RLS entirely.
--
-- The one policy below opens a narrow exception: the "anon" role
-- (i.e. anyone using the public anon key) may INSERT new rows, and
-- nothing else — no reading, editing, or deleting. This is what lets
-- the website's public enquiry form submit using the anon key, while
-- keeping every enquiry's contents (name, phone, email...) unreadable
-- and untouchable to anyone who only has that key.
alter table enquiries enable row level security;

create policy "Public can submit enquiries"
  on enquiries
  for insert
  to anon
  with check (true);
