-- Anonymous peer feedback (suggestion box). Reads via Supabase dashboard; POST via Ktor API.
create table if not exists public.peer_feedback (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    message text not null,
    contact text null,
    constraint peer_feedback_message_max_len check (
        char_length(message) <= 4000
    ),
    constraint peer_feedback_contact_max_len check (
        contact is null
        or char_length(contact) <= 100
    )
);

alter table public.peer_feedback enable row level security;
