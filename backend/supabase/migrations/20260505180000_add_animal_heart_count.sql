-- Add heart_count column for anonymous "like" feature (public engagement signal).
ALTER TABLE public.animals ADD COLUMN heart_count integer NOT NULL DEFAULT 0;
