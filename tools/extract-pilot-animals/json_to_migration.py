#!/usr/bin/env python3
"""
Emit a Supabase SQL migration from extract.py output (`pilot_animals_raw.json`).

Writes `backend/supabase/migrations/<UTC_YYYYMMDDHHMMSS>_import_pilot_animals_from_extract.sql`
unless `--output` is set.

Does not touch the Kotlin API or database — only generates a file for you to review and apply.

Expect JSON produced by conservative extract runs (see README): human review before applying migration.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MIGRATIONS_DIR = REPO_ROOT / "backend" / "supabase" / "migrations"

VALID_SPECIES = frozenset(
    {
        "dog",
        "cat",
        "rabbit",
        "reptile",
        "rodent",
        "amphibian",
        "wildlife",
        "arachnid",
    }
)

SHELTER_BY_SOURCE = {
    "doa": "DOA dierenasiel",
    "roz": "Reptielenopvang Zwanenburg",
}


def sql_str(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def slug_from_detail_url(url: str) -> str:
    path = url.rstrip("/").split("/")[-1]
    safe = re.sub(r"[^a-zA-Z0-9_-]+", "-", path).strip("-").lower()
    return (safe or "animal")[:120]


def pic_url(species: str, detail_url: str) -> str:
    slug = slug_from_detail_url(detail_url)
    return f"https://picsum.photos/seed/voluntail-ph-{species}-{slug}/400/400"


def normalize_species(raw: str) -> str:
    t = raw.strip().lower()
    if t in VALID_SPECIES:
        return t
    return "reptile"


def city_for_row(source: str, raw_city: Any) -> str:
    if isinstance(raw_city, str) and raw_city.strip():
        return raw_city.strip()
    if source == "doa":
        return "Amsterdam"
    return "Zwanenburg"


def insert_statement(
    shelter_name: str,
    city: str,
    name: str,
    description: str,
    species: str,
    image_url: str,
    external_url: str | None,
) -> str:
    ext_sql = "null" if not external_url else sql_str(external_url)
    return f"""insert into public.animals (
    shelter_id,
    city,
    name,
    description,
    species,
    status,
    published,
    image_url,
    external_url
)
select s.id,
       {sql_str(city)},
       {sql_str(name)},
       {sql_str(description)},
       {sql_str(species)},
       'available',
       true,
       {sql_str(image_url)},
       {ext_sql}
from public.shelters s
where s.name = {sql_str(shelter_name)}
limit 1;

"""


def load_payload(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    rows: list[dict[str, Any]] = []
    if isinstance(data, dict):
        for key in ("doa", "roz"):
            chunk = data.get(key)
            if isinstance(chunk, list):
                rows.extend(chunk)
    elif isinstance(data, list):
        rows = data
    else:
        raise SystemExit("JSON must be an object with doa/roz arrays or a single array")
    return rows


def main() -> None:
    parser = argparse.ArgumentParser(
        description=__doc__,
        epilog=(
            "Prefer JSON from extract.py conservative defaults (delay, robots). Review every "
            "generated migration before applying to Supabase."
        ),
    )
    parser.add_argument(
        "input_json",
        type=Path,
        nargs="?",
        default=Path("out/pilot_animals_raw.json"),
        help="Path to pilot_animals_raw.json (default: ./out/pilot_animals_raw.json)",
    )
    parser.add_argument(
        "--migrations-dir",
        type=Path,
        default=DEFAULT_MIGRATIONS_DIR,
        help=f"Supabase migrations directory (default: {DEFAULT_MIGRATIONS_DIR})",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        default=None,
        help="Exact output file path (overrides auto-generated timestamp name)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print target path and row count; do not write",
    )
    args = parser.parse_args()

    inp = args.input_json
    if not inp.is_file():
        print(f"error: input file not found: {inp}", file=sys.stderr)
        sys.exit(1)

    rows = load_payload(inp)
    stmts: list[str] = []
    skipped = 0
    for row in rows:
        src = str(row.get("source", "")).strip().lower()
        if src not in SHELTER_BY_SOURCE:
            skipped += 1
            continue
        name = str(row.get("name", "")).strip()
        if not name:
            skipped += 1
            continue
        shelter = SHELTER_BY_SOURCE[src]
        species = normalize_species(str(row.get("species_guess", "reptile")))
        city = city_for_row(src, row.get("city"))
        desc = str(row.get("description", "")).strip() or f"Imported from extract JSON ({src})."
        detail = str(row.get("detail_url", "")).strip()
        img = pic_url(species, detail if detail else name)
        stmts.append(
            insert_statement(
                shelter,
                city,
                name[:500],
                desc[:2000],
                species,
                img,
                detail if detail else None,
            )
        )

    now = datetime.now(timezone.utc)
    stamp = now.strftime("%Y%m%d%H%M%S")
    out_path = args.output
    if out_path is None:
        out_path = args.migrations_dir / f"{stamp}_import_pilot_animals_from_extract.sql"

    header = f"""-- Pilot animals imported from extract JSON (not automatic in CI).
-- Source file: {inp.as_posix()}
-- Generated at (UTC): {now.isoformat()}
-- Rows emitted: {len(stmts)} (skipped: {skipped})

"""

    body = header + "\n".join(stmts)
    if body and not body.endswith("\n"):
        body += "\n"

    if args.dry_run:
        print(out_path.as_posix())
        print(f"statements: {len(stmts)}, skipped: {skipped}")
        return

    args.migrations_dir.mkdir(parents=True, exist_ok=True)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(body, encoding="utf-8")
    print(f"Wrote {out_path} ({len(stmts)} inserts)")


if __name__ == "__main__":
    main()
