"""Derive Ik Zoek Baas CMS asset folder slugs → ``public.shelters.name`` from shelter seed SQL.

The NL seed file embeds authoritative slugs in ``image_url`` values::

    https://cms.dierenbescherming.nl/assets/<slug>/...

For rows without a CMS URL we derive a **best-effort** camelCase slug from ``name`` (same
convention as De Dierenbescherming CMS). Manual entries in ``cms_slug_to_shelter.json`` override
automatic mappings on key collision.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

from shared import REPO_ROOT

# Same INSERT shape as NL seeds: uuid row then quoted shelter name.
_ROW_HEAD = re.compile(
    r"\(\s*'([a-f0-9-]{36})'::uuid,\s*\n\s*'((?:[^']|'')*)'",
    re.IGNORECASE | re.MULTILINE,
)
_CMS_SLUG_IN_SQL = re.compile(r"cms\.dierenbescherming\.nl/assets/([^/'\"\s]+)/", re.I)


def _sql_row_tuple_span(sql: str, open_paren_idx: int) -> tuple[int, int] | None:
    """Balanced ``( … )`` for one VALUES row; ignores ``( )`` inside single-quoted strings."""
    i = open_paren_idx
    depth = 0
    in_str = False
    n = len(sql)
    while i < n:
        c = sql[i]
        if in_str:
            if c == "'":
                if i + 1 < n and sql[i + 1] == "'":
                    i += 2
                    continue
                in_str = False
            i += 1
            continue
        if c == "'":
            in_str = True
            i += 1
            continue
        if c == "(":
            depth += 1
        elif c == ")":
            depth -= 1
            if depth == 0:
                return open_paren_idx, i + 1
        i += 1
    return None


def default_seed_sql_paths() -> list[Path]:
    return [
        REPO_ROOT / "backend/supabase/migrations/seeds/20260508170000_seed_extra_shelters_nl.sql",
        REPO_ROOT / "backend/supabase/migrations/seeds/20260508203000_seed_nl_shelters_ikzoekbaas_top_cms_slugs.sql",
        REPO_ROOT / "backend/supabase/migrations/seeds/20260505150000_seed_pilot_shelters.sql",
    ]


def _unescape_sql_string(s: str) -> str:
    return s.replace("''", "'")


def _strip_trailing_paren_note(name: str) -> str:
    name = name.strip()
    return re.sub(r"\s*\([^)]*\)\s*$", "", name).strip()


def shelter_name_to_cms_slug(name: str) -> str:
    """Best-effort camelCase slug used under cms.dierenbescherming.nl/assets/."""
    name = _strip_trailing_paren_note(name)
    if not name:
        return ""
    words = re.split(r"[\s\-]+", name)
    words = [w for w in words if w]
    if not words:
        return ""
    head = words[0].lower()
    tail = "".join(w.capitalize() for w in words[1:])
    return head + tail


def build_slug_map_from_seed_sql(sql_text: str, *, stderr: bool = True) -> dict[str, str]:
    """Return cms_slug → shelter ``name``."""
    slug_to_name: dict[str, str] = {}
    names_in_order: list[str] = []

    skip_slug = frozenset({"common", "default", "static", "global", "assets"})

    for m in _ROW_HEAD.finditer(sql_text):
        name = _unescape_sql_string(m.group(2))
        names_in_order.append(name)
        span = _sql_row_tuple_span(sql_text, m.start())
        if span is None:
            continue
        segment = sql_text[span[0] : span[1]]
        for cms_m in _CMS_SLUG_IN_SQL.finditer(segment):
            slug = cms_m.group(1)
            if slug.lower() in skip_slug:
                continue
            prev = slug_to_name.get(slug)
            if prev is not None and prev != name and stderr:
                print(
                    f"warn: CMS slug {slug!r} maps to both {prev!r} and {name!r} (keeping first)",
                    file=sys.stderr,
                )
                continue
            if slug not in slug_to_name:
                slug_to_name[slug] = name

    for name in names_in_order:
        guess = shelter_name_to_cms_slug(name)
        if not guess:
            continue
        if guess not in slug_to_name:
            slug_to_name[guess] = name

    return slug_to_name


def merge_slug_maps(
    auto: dict[str, str],
    manual: dict[str, str],
    *,
    stderr: bool = True,
) -> dict[str, str]:
    """``manual`` wins on duplicate keys."""
    out = dict(auto)
    for k, v in manual.items():
        if k in out and out[k] != v and stderr:
            print(f"shelter slug override {k!r}: {out[k]!r} → {v!r} (from slug-map JSON)", file=sys.stderr)
        out[k] = v
    return out
