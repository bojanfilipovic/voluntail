-- Peer feedback hardening + optional contact (combined; replaces split 831/832/833 migrations).

-- Deny-by-default for anon/authenticated via PostgREST when no policies exist.
-- Ktor DB_URL typically uses a role that bypasses RLS (e.g. owner/superuser).
alter table public.shelters enable row level security;

alter table public.peer_feedback enable row level security;

-- Align message cap with API (4000 chars; overrides 8000 from create_peer_feedback migration).
alter table public.peer_feedback drop constraint peer_feedback_message_max_len;

alter table public.peer_feedback
add constraint peer_feedback_message_max_len check (
    char_length(message) <= 4000
);

-- Optional contact (name/email/handle); short cap for pilot peers.
alter table public.peer_feedback
add column contact text null;

alter table public.peer_feedback
add constraint peer_feedback_contact_max_len check (
    contact is null
    or char_length(contact) <= 100
);
