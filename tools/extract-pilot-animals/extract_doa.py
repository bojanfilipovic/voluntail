#!/usr/bin/env python3
"""Extract animal listings from DOA dierenasiel (WordPress/Elementor).

Fetches listing pages + each detail page for the real photo URL.
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

import requests
from bs4 import BeautifulSoup

from shared import DEFAULT_MIGRATIONS_DIR, RawAnimal, generate_migration

# Browser-like UA required: DOA's WAF rejects non-browser User-Agent strings.
DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
)

DOA_LIST = "https://doa-dierenasiel.nl/dieren/dier-adopteren/"
SHELTER_NAME = "DOA dierenasiel"
DEFAULT_DELAY_SEC = 1.0


# ---------------------------------------------------------------------------
# robots.txt
# ---------------------------------------------------------------------------

_robots_cache: dict[str, RobotFileParser | None] = {}
_robots_ua: str = DEFAULT_USER_AGENT


def _robots_parser(netloc: str, scheme: str = "https") -> RobotFileParser | None:
    if netloc in _robots_cache:
        return _robots_cache[netloc]
    robots_url = f"{scheme}://{netloc}/robots.txt"
    try:
        resp = requests.get(robots_url, headers={"User-Agent": _robots_ua}, timeout=15)
        if resp.status_code in (401, 403):
            _robots_cache[netloc] = None
            return None
        resp.raise_for_status()
        rp = RobotFileParser()
        rp.set_url(robots_url)
        rp.parse(resp.text.splitlines())
        _robots_cache[netloc] = rp
    except Exception:
        _robots_cache[netloc] = None
    return _robots_cache[netloc]


def _ensure_robots_allow(url: str) -> None:
    parsed = urlparse(url)
    rp = _robots_parser(parsed.netloc, parsed.scheme or "https")
    if rp is None:
        return
    if not rp.can_fetch(_robots_ua, url):
        print(f"error: robots.txt disallows: {url}", file=sys.stderr)
        sys.exit(2)


# ---------------------------------------------------------------------------
# Species detection
# ---------------------------------------------------------------------------


def _species_from_kind_nl(kind: str) -> str:
    k = kind.strip().lower()
    if k.startswith("konijn"):
        return "rabbit"
    if k.startswith("hond"):
        return "dog"
    if k.startswith("kat"):
        return "cat"
    return "dog"


# ---------------------------------------------------------------------------
# Image fetching
# ---------------------------------------------------------------------------


def _looks_like_animal_image(url: str) -> bool:
    low = url.lower()
    if any(low.endswith(ext) for ext in (".jpg", ".jpeg", ".png", ".webp")):
        return True
    if "wp-content/uploads" in low:
        return True
    return False


def _fetch_image(session: requests.Session, detail_url: str, delay: float) -> str | None:
    _ensure_robots_allow(detail_url)
    try:
        r = session.get(detail_url, timeout=45)
        r.raise_for_status()
    except Exception:
        return None
    finally:
        time.sleep(delay)
    soup = BeautifulSoup(r.text, "html.parser")
    candidates: list[str] = []
    for img in soup.select(".elementor-widget-image img, .elementor-section img"):
        src = img.get("data-src") or img.get("src") or ""
        if not src or "logo" in src.lower() or "placeholder" in src.lower():
            continue
        if "elementor/thumbs" in src.lower():
            continue
        if src.startswith("//"):
            src = "https:" + src
        if src.startswith("/"):
            src = urljoin(detail_url, src)
        if _looks_like_animal_image(src):
            candidates.append(src)
    # Prefer kenneldata images (actual per-animal photos from shelter system)
    for c in candidates:
        if "kenneldata" in c:
            return c
    return candidates[0] if candidates else None


# ---------------------------------------------------------------------------
# Listing extraction
# ---------------------------------------------------------------------------


def _fetch_listings(session: requests.Session, max_pages: int, delay: float) -> list[RawAnimal]:
    out: list[RawAnimal] = []
    for page in range(1, max_pages + 1):
        url = DOA_LIST if page == 1 else f"{DOA_LIST.rstrip('/')}/page/{page}/"
        _ensure_robots_allow(url)
        r = session.get(url, timeout=45)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        for col in soup.select("div[data-column-clickable*='adoptiedieren']"):
            url_a = col.get("data-column-clickable") or ""
            if "adoptiedieren" not in url_a:
                continue
            h2s = col.select("h2.elementor-heading-title")
            texts: list[str] = []
            for h in h2s:
                span = h.find("span")
                texts.append((span or h).get_text(strip=True))
            if len(texts) < 2:
                continue
            kind_nl, name = texts[0], texts[1]
            subtitle = ""
            for div in col.select(".elementor-heading-title"):
                t = div.get_text(strip=True)
                if t in texts:
                    continue
                if "," in t or "mannelijk" in t.lower() or "vrouwelijk" in t.lower():
                    subtitle = t
                    break
            if not subtitle:
                subtitle = f"{kind_nl} — zie adoptiepagina."
            out.append(
                RawAnimal(
                    source="doa",
                    name=name,
                    description=subtitle[:500],
                    detail_url=url_a.strip(),
                    species_guess=_species_from_kind_nl(kind_nl),
                    city="Amsterdam",
                )
            )
        time.sleep(delay)
    # Dedupe
    seen: set[str] = set()
    uniq: list[RawAnimal] = []
    for a in out:
        if a.detail_url in seen:
            continue
        seen.add(a.detail_url)
        uniq.append(a)
    return uniq


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract DOA animal listings → SQL migration.")
    parser.add_argument("--max-pages", type=int, default=3)
    parser.add_argument("--delay-seconds", type=float, default=DEFAULT_DELAY_SEC)
    parser.add_argument("--migrations-dir", type=str, default=str(DEFAULT_MIGRATIONS_DIR))
    parser.add_argument("--user-agent", default=DEFAULT_USER_AGENT)
    args = parser.parse_args()

    migrations_dir = Path(args.migrations_dir)

    global _robots_ua
    session = requests.Session()
    ua = args.user_agent.strip() or DEFAULT_USER_AGENT
    _robots_ua = ua
    session.headers.update({
        "User-Agent": ua,
        "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
    })
    delay = max(0.0, args.delay_seconds)

    print(f"[doa] Fetching listings (max {args.max_pages} pages)...")
    animals = _fetch_listings(session, args.max_pages, delay)
    print(f"[doa] Found {len(animals)} animals")

    print("[doa] Fetching detail images...")
    fetched = 0
    for i, animal in enumerate(animals, 1):
        img = _fetch_image(session, animal.detail_url, delay)
        if img:
            animal.image_url = img
            fetched += 1
        if i % 10 == 0:
            print(f"  ... {i}/{len(animals)} ({fetched} images)")
    print(f"[doa] Got images for {fetched}/{len(animals)} animals")

    sql_path = generate_migration(
        animals,
        shelter_name=SHELTER_NAME,
        source_label="doa",
        migrations_dir=migrations_dir,
        dedup_column="external_url",
    )
    print(f"\nWrote {sql_path}")


if __name__ == "__main__":
    main()
