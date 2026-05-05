"""Shared types and SQL generation for extract scripts."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MIGRATIONS_DIR = REPO_ROOT / "backend" / "supabase" / "migrations" / "seeds"


@dataclass
class RawAnimal:
    source: str
    name: str
    description: str
    detail_url: str
    species_guess: str
    city: str | None
    image_url: str | None = None


def sql_str(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def generate_migration(
    animals: list[RawAnimal],
    shelter_name: str,
    source_label: str,
    migrations_dir: Path = DEFAULT_MIGRATIONS_DIR,
    dedup_column: str = "external_url",
) -> Path:
    """Generate an idempotent SQL migration file from extracted animals.

    dedup_column: which column to use for "already exists" check.
      - "external_url" for DOA (each animal has a unique detail page)
      - "name" for ROZ (single shared page URL, dedupe by animal name)
    """
    now = datetime.now(timezone.utc)
    stamp = now.strftime("%Y%m%d%H%M%S")
    slug = source_label.lower().replace(" ", "_")
    out_path = migrations_dir / f"{stamp}_import_{slug}_animals.sql"

    header = f"""-- {source_label} animals import
-- Generated at (UTC): {now.isoformat()}
-- Animals: {len(animals)}
-- Idempotent: skips rows where {dedup_column} already exists for this shelter.

"""
    stmts: list[str] = []
    for a in animals:
        img_sql = sql_str(a.image_url) if a.image_url else "null"
        ext_sql = sql_str(a.detail_url) if a.detail_url else "null"
        city_sql = sql_str(a.city or "")

        if dedup_column == "name":
            dedup_clause = f"where a.name = {sql_str(a.name)} and a.shelter_id = s.id"
        else:
            dedup_clause = f"where a.external_url = {ext_sql}"

        stmts.append(
            f"insert into public.animals "
            f"(shelter_id, city, name, description, species, status, published, image_url, external_url)\n"
            f"select s.id, {city_sql}, {sql_str(a.name)}, {sql_str(a.description)}, "
            f"{sql_str(a.species_guess)}, 'available', true, {img_sql}, {ext_sql}\n"
            f"from public.shelters s\n"
            f"where s.name = {sql_str(shelter_name)}\n"
            f"  and not exists (select 1 from public.animals a {dedup_clause})\n"
            f"limit 1;\n"
        )

    body = header + "\n".join(stmts)
    migrations_dir.mkdir(parents=True, exist_ok=True)
    out_path.write_text(body, encoding="utf-8")
    return out_path
