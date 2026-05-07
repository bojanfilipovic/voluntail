#!/usr/bin/env python3
"""Extract animal listings from Reptielenopvang Zwanenburg (Shopify page).

Single static page — no pagination, no detail fetches. Images are on the listing page.
"""

from __future__ import annotations

import argparse
import re

import requests
from bs4 import BeautifulSoup

from shared import DEFAULT_MIGRATIONS_DIR, MAX_IMAGE_URLS, RawAnimal, generate_migration

DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
)

ROZ_PAGE = "https://reptileessentials.nl/pages/dieren-in-de-opvang"
SHELTER_NAME = "Reptielenopvang Zwanenburg"


def _species_hint(name: str) -> str:
    low = name.lower()
    if "vogelspin" in low or "schorpioen" in low:
        return "arachnid"
    if "salamander" in low or "axolotl" in low or "kikker" in low:
        return "amphibian"
    return "reptile"


def extract(session: requests.Session) -> list[RawAnimal]:
    """Parse the single Shopify page and return available animals with images."""
    r = session.get(ROZ_PAGE, timeout=45)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")
    main = soup.select_one("main") or soup

    image_rows = main.select("div.image-row")
    animals: list[RawAnimal] = []

    for row in image_rows:
        imgs = row.select("img")
        if not imgs:
            continue
        first_img = imgs[0]
        row_urls: list[str] = []
        seen_in_row: set[str] = set()
        for img in imgs:
            raw = img.get("src", "").strip()
            if not raw or raw in seen_in_row:
                continue
            seen_in_row.add(raw)
            row_urls.append(raw)
        if not row_urls:
            continue

        img_alt = first_img.get("alt", "").strip()
        name = ""
        scientific = ""
        adopted = False

        # Walk next siblings for text describing this animal
        sibling = row.next_sibling
        attempts = 0
        while sibling and attempts < 5:
            if hasattr(sibling, "name") and sibling.name:
                cls = " ".join(sibling.get("class", []))
                if "image-row" in cls:
                    break
                text = sibling.get_text(strip=True)
                if text:
                    if "Geadopteerd" in text or "\U0001f973" in text:
                        adopted = True
                    m = re.match(r"^([A-Z][^(]+?)\s*\(([^)]+)\)", text)
                    if m:
                        name = m.group(1).strip()
                        scientific = m.group(2).strip()
                    elif not name and len(text) < 80:
                        name = text
                    break
            sibling = sibling.next_sibling
            attempts += 1

        if not name and img_alt:
            name = img_alt

        if not name or len(name) > 80:
            continue
        name = re.sub(r"Geadopteerd!?\s*\U0001f973?", "", name).strip()
        if "overleden" in name.lower():
            continue
        if not name:
            continue
        if adopted:
            continue

        desc = f"{name} ({scientific})" if scientific else name
        animals.append(
            RawAnimal(
                source="roz",
                name=name,
                description=desc[:500],
                detail_url=ROZ_PAGE,
                species_guess=_species_hint(name),
                city="Zwanenburg",
                image_urls=row_urls[:MAX_IMAGE_URLS],
            )
        )

    # Dedupe by name
    seen_names: set[str] = set()
    unique: list[RawAnimal] = []
    for a in animals:
        key = a.name.lower()
        if key in seen_names:
            continue
        seen_names.add(key)
        unique.append(a)
    return unique


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract ROZ animal listings → SQL migration.")
    parser.add_argument("--migrations-dir", type=str, default=str(DEFAULT_MIGRATIONS_DIR))
    parser.add_argument("--user-agent", default=DEFAULT_USER_AGENT)
    args = parser.parse_args()

    from pathlib import Path
    migrations_dir = Path(args.migrations_dir)

    session = requests.Session()
    session.headers.update({
        "User-Agent": args.user_agent.strip() or DEFAULT_USER_AGENT,
        "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
    })

    print("[roz] Fetching listing page...")
    animals = extract(session)
    print(f"[roz] Found {len(animals)} available animals")

    for a in animals:
        print(f"  {a.name}")

    sql_path = generate_migration(
        animals,
        shelter_name=SHELTER_NAME,
        source_label="roz",
        migrations_dir=migrations_dir,
        dedup_column="name",
    )
    print(f"\nWrote {sql_path}")


if __name__ == "__main__":
    main()
