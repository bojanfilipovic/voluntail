-- Anonymous peer feedback (suggestion box). Reads via Supabase dashboard; POST via Ktor API.
-- Depends on: shelters, animals (see migration order: animals must run before this file).
create table if not exists public.peer_feedback (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    message text not null,
    contact text null,
    shelter_id uuid null references public.shelters (id) on delete set null,
    animal_id uuid null references public.animals (id) on delete set null,
    constraint peer_feedback_message_max_len check (
        char_length(message) <= 4000
    ),
    constraint peer_feedback_contact_max_len check (
        contact is null
        or char_length(contact) <= 100
    )
);

alter table public.peer_feedback enable row level security;
