-- Public shelter nominations (Suggest Shelter). Separate from peer_feedback.
-- Review via Supabase SQL editor; status is a PostgreSQL ENUM (flip manually when needed).

create type public.shelter_suggestion_status as enum (
    'pending',
    'reviewed',
    'rejected',
    'imported'
);

create table if not exists public.shelter_suggestions (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    name text not null,
    latitude double precision not null,
    longitude double precision not null,
    description text null,
    city text null,
    species_note text null,
    signup_url text null,
    image_url text null,
    donation_url text null,
    contact text null,
    status public.shelter_suggestion_status not null default 'pending',
    constraint shelter_suggestions_species_note_len check (
        species_note is null
        or char_length(species_note) <= 2000
    ),
    constraint shelter_suggestions_description_len check (
        description is null
        or char_length(description) <= 10000
    ),
    constraint shelter_suggestions_city_len check (
        city is null
        or char_length(city) <= 200
    ),
    constraint shelter_suggestions_contact_len check (
        contact is null
        or char_length(contact) <= 100
    ),
    constraint shelter_suggestions_name_len check (
        char_length(name) <= 300
    ),
    constraint shelter_suggestions_signup_url_len check (
        signup_url is null
        or char_length(signup_url) <= 2000
    ),
    constraint shelter_suggestions_image_url_len check (
        image_url is null
        or char_length(image_url) <= 2000
    ),
    constraint shelter_suggestions_donation_url_len check (
        donation_url is null
        or char_length(donation_url) <= 2000
    )
);

alter table public.shelter_suggestions enable row level security;
