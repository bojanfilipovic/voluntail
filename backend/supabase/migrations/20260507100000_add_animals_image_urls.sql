-- Multiple ordered gallery URLs per animal (directory + Explore). Legacy image_url backfilled then cleared when superseded.
ALTER TABLE public.animals
    ADD COLUMN IF NOT EXISTS image_urls text[] NOT NULL DEFAULT '{}';

UPDATE public.animals
SET image_urls = ARRAY[image_url]::text[]
WHERE image_url IS NOT NULL
  AND trim(image_url) <> ''
  AND cardinality(image_urls) = 0;

UPDATE public.animals
SET image_url = NULL
WHERE cardinality(image_urls) > 0;
