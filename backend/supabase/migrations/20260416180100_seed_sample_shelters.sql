-- Seed data aligned with Kotlin ShelterSamples (English copy).
-- Stable UUIDs (PK is uuid — not the old string ids used in-memory only).
-- Re-runnable: upserts on primary key conflict.
insert into public.shelters (id, name, description, latitude, longitude, registry_tag, species, signup_url)
values
    (
        '11111111-1111-4111-8111-111111111111'::uuid,
        'The Animal Line (sample)',
        'Dogs and cats from the Utrecht area. '
            || 'Small foster network for dogs and rabbits. '
            || 'V1: curated manually in Supabase; this row is stub data for API wiring only.',
        52.0907,
        5.1214,
        'DOA',
        '["dog","cat","rabbit"]'::jsonb,
        'https://example.com/signup'
    ),
    (
        '22222222-2222-4222-8222-222222222222'::uuid,
        'Northern Reptile House (sample)',
        'Specialist care for reptiles and amphibians. '
            || 'Focus on housing and rehoming reptiles. '
            || 'Stub record for the ROZ track and map pins.',
        52.3676,
        4.9041,
        'ROZ',
        '["reptile","amphibian"]'::jsonb,
        null
    )
on conflict (id) do update set
    name = excluded.name,
    description = excluded.description,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    registry_tag = excluded.registry_tag,
    species = excluded.species,
    signup_url = excluded.signup_url;
