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

Each shelter is a `ShelterExtractor` class in `extract.py`:

```python
class ShelterExtractor(ABC):
    source_id: str       # e.g. "doa", "roz"
    shelter_name: str    # must match DB shelter name
    listing_url: str

    def fetch_animals(self, session, max_pages, delay) -> list[RawAnimal]: ...
    def fetch_image(self, session, detail_url, delay) -> str | None: ...
```

To add a new shelter: implement the class and add it to `EXTRACTORS` list.

---

## 1. Extract (HTTP → JSON)

```bash
cd tools/extract-pilot-animals
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

```bash
python extract.py --out-dir ./out
```

This fetches listing pages and then each animal's detail page for the real photo URL.

For extra caution between pages:

```bash
python extract.py --out-dir ./out --delay-seconds 4
```

| Flag | Default | Role |
|------|---------|------|
| `--delay-seconds` | **3.0** | Wait after each page/detail fetch. Values below 2 print a warning. |
| `--doa-pages` | 5 | Max listing pages for DOA |
| `--roz-pages` | 8 | Max listing pages for ROZ |
| `--user-agent` | see source | Sent on every request |

Output: `out/pilot_animals_raw.json` (gitignored).

Shape: `{ "doa": [ ... ], "roz": [ ... ] }` with `source`, `name`, `description`, `detail_url`, `species_guess`, `city`, `image_url`.

---

## 2. Generate SQL migration (JSON → `.sql`)

```bash
python json_to_migration.py out/pilot_animals_raw.json
```

Writes `backend/supabase/migrations/<UTC_YYYYMMDDHHMMSS>_import_pilot_animals_from_extract.sql`. **Review** the file, then apply via your Supabase process.

| Flag | Meaning |
|------|---------|
| `--dry-run` | Print target path and counts; no file written |
| `--output PATH` | Exact output path (disables auto timestamp name) |
| `--migrations-dir DIR` | Override migrations directory |

**Behaviour:**
- Maps `source` → shelter (`doa` → DOA dierenasiel, `roz` → Reptielenopvang Zwanenburg)
- Uses real `image_url` from extract when present; falls back to picsum placeholder
- **Idempotent:** skips insert if `external_url` already exists in animals table (safe to re-run)
- Species aligned with backend enums (unknown → `reptile`)

---

## Full workflow (copy-paste)

```bash
cd tools/extract-pilot-animals
source .venv/bin/activate
python extract.py --out-dir ./out
python json_to_migration.py out/pilot_animals_raw.json
# Review the generated .sql file, then apply to Supabase
```

---

## robots.txt

Before large pulls, verify:

- `https://doa-dierenasiel.nl/robots.txt`
- `https://reptielenopvang.nl/robots.txt`

The script enforces `can_fetch` for your User-Agent when rules load (no CLI switch to bypass).

## Terms vs robots

`robots.txt` is not a contract. Repeated or automated imports may still require **permission** from the shelter — ask when in doubt.
