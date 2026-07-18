-- KK Benjamin — editable content store.
-- Run this once in your Supabase project: SQL Editor → paste → Run.
-- No seeding needed: any field not in this table falls back to the site's
-- built-in default copy, so the site is never blank.

-- 1. Content table (one row per editable field) -----------------------------
create table if not exists public.content (
  key        text primary key,
  value      text not null,
  page       text,
  type       text not null default 'text',
  updated_at timestamptz not null default now()
);

alter table public.content enable row level security;

-- Public can read content; writes happen only through the service-role key
-- (which bypasses RLS), so no write policy is defined.
drop policy if exists "content public read" on public.content;
create policy "content public read"
  on public.content for select
  using (true);

-- 2. Image bucket (public read) ---------------------------------------------
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

drop policy if exists "site-images public read" on storage.objects;
create policy "site-images public read"
  on storage.objects for select
  using (bucket_id = 'site-images');
