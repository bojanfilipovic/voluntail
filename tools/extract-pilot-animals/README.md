# Pilot animal listing extract + SQL migration

Offline tooling only — **not** production. Defaults and docs assume **respectful, conservative** use of third-party shelter sites.

## Principles (read first)

1. **Identify yourself** — Defaults use this repo's GitHub path; override `--user-agent` if yours differs (avoid generic placeholders).
2. **Obey robots.txt** — The script always applies **`urllib.robotparser`** when `robots.txt` can be read (there is **no** bypass flag — use manual copy or ask the site if blocked).
3. **Go slow** — Default **3 seconds** between paginated listing requests; use **4+** when you want extra caution.
4. **Stay small** — Occasional local runs; no unattended cron against live sites without shelter approval.
5. **Review generated SQL** — Migrations are human-reviewed; never auto-apply to production without inspection.

---

## Architecture

Standalone scripts (each calls `shared.generate_migration`):

| Script | Shelter DB `name` | Listing |
|--------|-------------------|---------|
| `extract_doa.py` | `DOA dierenasiel` | DOA adopt pages |
| `extract_roz.py` | `Reptielenopvang Zwanenburg` | Shopify “in opvang” |
| `extract_snoopy.py` | `Udruga Snoopy` | `https://snoopy.hr/udomi/` |
| `ikzoekbaas/extract_ikzoekbaas.py` | **Per animal** (`resolved_shelter_name`) | Detail URLs and/or Playwright category crawl — see [`ikzoekbaas/README.md`](ikzoekbaas/README.md) |

Add a new single-shelter source: copy an existing script, adjust parsing + `SHELTER_NAME`, run once, review the generated SQL under `backend/supabase/migrations/seeds/`.

### Ik Zoek Baas

See **[`ikzoekbaas/README.md`](ikzoekbaas/README.md)** — bundle includes script, `cms_slug_to_shelter.json`, and `category_urls.example.txt`.

---

## Run an extractor (writes `.sql` directly)

```bash
cd tools/extract-pilot-animals
python3 -m venv .venv && source .venv/bin/activate   # once
pip install -r requirements.txt
```

Each script writes a timestamped `.sql` file under `backend/supabase/migrations/seeds/` — **review** before applying. Ik Zoek Baas additionally writes `*_summary.json` / `*_skipped.json` under `ikzoekbaas/runs/` by default (not next to the migration).

```bash
python extract_doa.py --delay-seconds 3 --max-pages 3
python extract_roz.py
python extract_snoopy.py --delay-seconds 3
python ikzoekbaas/extract_ikzoekbaas.py --urls-file urls.txt --delay-seconds 3
```

Common flags: `--delay-seconds`, `--migrations-dir`, `--user-agent` (see `--help` per script).

---

## robots.txt

Before large pulls, verify:

- `https://doa-dierenasiel.nl/robots.txt`
- `https://reptielenopvang.nl/robots.txt`
- `https://snoopy.hr/robots.txt`
- `https://ikzoekbaas.dierenbescherming.nl/robots.txt` (note: `Disallow: /api` — do not use API endpoints from tooling)

The script enforces `can_fetch` for your User-Agent when rules load (no CLI switch to bypass).

## Terms vs robots

`robots.txt` is not a contract. Repeated or automated imports may still require **permission** from the shelter — ask when in doubt.
