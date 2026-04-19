-- Shelters directory (V1). Apply via Supabase SQL editor or your migration workflow.
create table if not exists public.shelters (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text not null,
    latitude double precision not null,
    longitude double precision not null,
    species jsonb not null default '[]'::jsonb,
    signup_url text null,
    image_url text null,
    donation_url text null
);
