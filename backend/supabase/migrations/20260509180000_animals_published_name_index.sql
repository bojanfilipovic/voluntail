-- Supports public directory pagination (published filter + name sort) at scale.
CREATE INDEX IF NOT EXISTS idx_animals_published_name ON animals (published, name);
