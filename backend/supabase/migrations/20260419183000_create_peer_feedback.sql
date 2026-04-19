-- Anonymous peer feedback (suggestion box). Read rows in Supabase dashboard; no public GET in V1.
create table if not exists public.peer_feedback (
    id uuid primary key default gen_random_uuid (),
    created_at timestamptz not null default now(),
    message text not null,
    constraint peer_feedback_message_max_len check (
        char_length(message) <= 8000
    )
);
