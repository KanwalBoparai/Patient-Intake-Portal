-- Run once in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.patient_profiles (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  date_of_birth date not null,
  address text not null,
  insurance_card_url text not null,
  photo_id_url text not null,
  -- A row physically cannot exist without consent: atomicity of the
  -- "complete profile only" rule is enforced at the lowest layer.
  consent boolean not null check (consent),
  created_at timestamptz not null default now()
);

-- The app uses the service-role key server-side only; RLS keeps the anon
-- key (unused) locked out entirely.
alter table public.patient_profiles enable row level security;
