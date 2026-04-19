-- Adoption animals (directory); CMS writes via API; public reads filtered by published + query params.
create table if not exists public.animals (
    id uuid primary key default gen_random_uuid(),
    shelter_id uuid not null references public.shelters (id) on delete cascade,
    city text not null default '',
    name text not null,
    description text not null default '',
    species text not null,
    status text not null,
    published boolean not null default false,
    image_url text null,
    external_url text null,
    created_at timestamptz not null default now()
);

create index if not exists animals_shelter_id_idx on public.animals (shelter_id);

create index if not exists animals_city_lower_idx on public.animals (lower(city));

create index if not exists animals_published_idx on public.animals (published);

-- Defence in depth for PostgREST / least-privilege roles (same idea as shelters + peer_feedback).
-- Ktor using the DB owner or `service_role` typically bypasses RLS; anon must not see drafts.
alter table public.animals enable row level security;

create policy "animals_select_published"
    on public.animals
    for select
    to anon, authenticated
    using (published = true);

-- No insert/update/delete policies for anon/authenticated: mutations go through the API with a
-- privileged connection. Add service_role-only policies here if you ever use the Supabase client
-- for CMS from a trusted server context.
