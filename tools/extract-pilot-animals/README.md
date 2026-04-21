# Pilot animal listing extract + SQL migration

Offline tooling only — **not** production. Defaults and docs assume **respectful, conservative** use of third-party shelter sites.

## Principles (read first)

1. **Identify yourself** — Defaults use this repo’s GitHub path; override `--user-agent` if yours differs (avoid generic placeholders).
2. **Obey robots.txt** — The script always applies **`urllib.robotparser`** when `robots.txt` can be read (there is **no** bypass flag — use manual copy or ask the site if blocked).
3. **Go slow** — Default **3 seconds** between paginated listing requests; use **4+** when you want extra caution.
4. **Stay small** — Occasional local runs; no unattended cron against live sites without shelter approval.
5. **Review generated SQL** — Migrations are human-reviewed; never auto-apply to production without inspection.

---

## 1. Extract (HTTP → JSON)

```bash
cd tools/extract-pilot-animals
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

**Recommended run** (default User-Agent in `extract.py` already points at `bojanfilipovic/voluntail`; override only if needed):

```bash
python extract.py --out-dir ./out \
  --user-agent "VoluntailPilotExtract/1.0 (+https://github.com/bojanfilipovic/voluntail; pilot directory import)"
```

For extra caution between listing pages:

```bash
python extract.py --out-dir ./out --delay-seconds 4 \
  --user-agent "VoluntailPilotExtract/1.0 (+https://github.com/bojanfilipovic/voluntail; pilot directory import)"
```

| Flag | Default | Role |
|------|---------|------|
| `--delay-seconds` | **3.0** | Wait after **each** paginated listing response (DOA page / ROZ `?start=`). Values **below 2** print a **warning** (still allowed if you must debug). |
| `--user-agent` | see `extract.py` | Sent on every request. Defaults to **bojanfilipovic/voluntail**; script warns if the legacy **`OWNER`** placeholder appears. |

Output: [`out/pilot_animals_raw.json`](./out/pilot_animals_raw.json) (paths under `**/out/` are gitignored).

Shape: `{ "doa": [ ... ], "roz": [ ... ] }` with `source`, `name`, `description`, `detail_url`, `species_guess`, `city`.

### robots.txt (manual sanity check)

Before large pulls, open in a browser:

- `https://doa-dierenasiel.nl/robots.txt`
- `https://reptielenopvang.nl/robots.txt`

The script enforces `can_fetch` for your User-Agent when rules load (there is **no CLI switch** to ignore robots). If `robots.txt` cannot be read, checks are skipped (same pattern as many tools when rules are unavailable).

---

## 2. Generate SQL migration (JSON → `.sql`)

Input should be JSON from **conservative** extract runs above. Then:

```bash
source .venv/bin/activate
python json_to_migration.py out/pilot_animals_raw.json
```

Writes `backend/supabase/migrations/<UTC_YYYYMMDDHHMMSS>_import_pilot_animals_from_extract.sql`. **Review** the file, then apply via your Supabase process.

| Flag | Meaning |
|------|---------|
| `--dry-run` | Print target path and counts; no file written |
| `--output PATH` | Exact output path (disables auto timestamp name) |
| `--migrations-dir DIR` | Override migrations directory |

**Behaviour:** maps `source` → shelter (`doa` → DOA dierenasiel, `roz` → Reptielenopvang Zwanenburg); `species_guess` aligned with backend enums (unknown → `reptile`); picsum placeholders; **duplicates allowed** (one `INSERT` per JSON row).

---

## Terms vs robots

`robots.txt` is not a contract. Repeated or automated imports may still require **permission** from the shelter — ask when in doubt.
