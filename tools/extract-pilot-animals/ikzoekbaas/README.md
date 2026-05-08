# Ik Zoek Baas → Voluntail seed extract

## What this script does (debugging map)

| Step | Mechanism | Your knobs |
|------|-----------|------------|
| **1. Listing discovery** | Playwright opens each **zoek-asieldieren** URL from `--category-urls-file`. The site paginates with **`?page=`** (not endless scroll alone). For each line we load `page=1`, `page=2`, … until a listing returns **no** `/asieldier/…` links after scrolling, we hit **`--max-category-pages`**, or two consecutive pages expose the **same** set of links. **`--listing-range`** adds `range=` so more animals appear per page (fewer HTTP round-trips). | `--category-urls-file`, `--listing-range`, `--max-category-pages`, `--scroll-passes`, `--scroll-wait-ms`, `--no-headless` |
| **2. Merge URLs** | Adds `--urls-file` / `--demo` URLs; **de-duplicates** while keeping order. | `--urls-file`, `--demo` |
| **3. Detail HTML** | `requests` GET each `/asieldier/…` page; **robots.txt** checked. | `--delay-seconds`, `--user-agent` |
| **4. Shelter** | Dominant CMS `<slug>` on page → map from **NL + pilot shelter seed SQL** (URLs in `image_url` + camelCase from `name`), then overrides from **`cms_slug_to_shelter.json`**. Unknown slug → skipped row. | `--slug-map`, `--no-seed-slug-map`, `--extra-seed-sql` |
| **5. Output** | Idempotent SQL inserts under **`--migrations-dir`**. Summary + skip manifest JSON under **`--artifacts-dir`** (default **`runs/`** here — not in Supabase seeds). | `--migrations-dir`, `--artifacts-dir`, `--summary-json`, `--skip-log` |

If SQL shows **few rows**: expand **`cms_slug_to_shelter.json`** only for CMS slugs missing from seeds (see `runs/*_skipped.json`). Ensure category URLs cover every overview you care about (filters in the URL are preserved when paging).

## Bundled files

| File | Purpose |
|------|---------|
| `extract_ikzoekbaas.py` | CLI |
| `cms_slug_to_shelter.json` | Optional overrides when Ik Zoek Baas slug ≠ seed-derived mapping |
| `category_urls.example.txt` | Example overview URLs (one per line; query params kept) |
| `runs/` | Default folder for `*_summary.json` and `*_skipped.json` |

## Run

From **`tools/extract-pilot-animals/`**:

```bash
source .venv/bin/activate   # once: python -m venv .venv && pip install -r requirements.txt
playwright install chromium

python ikzoekbaas/extract_ikzoekbaas.py --demo --delay-seconds 3

python ikzoekbaas/extract_ikzoekbaas.py \
  --category-urls-file ikzoekbaas/category_urls.example.txt \
  --delay-seconds 3 \
  --listing-range 100
```

Use `--no-headless` if a cookie banner blocks discovery.

### Useful defaults

- **`--listing-range 100`** (default): larger grids per `?page=` so you visit fewer listing pages.
- **`--max-category-pages 500`**: safety cap per overview line.

SQL is written to `backend/supabase/migrations/seeds/` by default; JSON reports go to **`ikzoekbaas/runs/`**.
