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

Add a new shelter: copy an existing script, adjust parsing + `SHELTER_NAME`, run once, review the generated SQL under `backend/supabase/migrations/seeds/`.

---

## Run an extractor (writes `.sql` directly)

```bash
cd tools/extract-pilot-animals
python3 -m venv .venv && source .venv/bin/activate   # once
pip install -r requirements.txt
```

Each script writes a timestamped file under `backend/supabase/migrations/seeds/` — **review** before applying.

```bash
python extract_doa.py --delay-seconds 3 --max-pages 3
python extract_roz.py
python extract_snoopy.py --delay-seconds 3
```

Common flags: `--delay-seconds`, `--migrations-dir`, `--user-agent` (see `--help` per script).

---

## robots.txt

Before large pulls, verify:

- `https://doa-dierenasiel.nl/robots.txt`
- `https://reptielenopvang.nl/robots.txt`
- `https://snoopy.hr/robots.txt`

The script enforces `can_fetch` for your User-Agent when rules load (no CLI switch to bypass).

## Terms vs robots

`robots.txt` is not a contract. Repeated or automated imports may still require **permission** from the shelter — ask when in doubt.
