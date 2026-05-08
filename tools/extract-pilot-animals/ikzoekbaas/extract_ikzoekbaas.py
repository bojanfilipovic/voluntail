#!/usr/bin/env python3
"""Extract animal listings from Ik Zoek Baas (ikzoekbaas.dierenbescherming.nl).

High-level pipeline (for debugging)
-----------------------------------

1. **Discovery** — Build a list of animal detail URLs (`…/asieldier/…`):

   - **Category mode** (`--category-urls-file`): Playwright opens each *zoek-asieldieren* overview
     URL. The listing site paginates with HTTP query params (not only infinite scroll). For each
     overview line we visit ``?page=1``, ``?page=2``, … until a page yields **no** ``/asieldier/``
     links after scrolling (or we hit ``--max-category-pages``). Optional ``--listing-range``
     sets ``range=`` so more cards fit on one page (fewer round-trips).

   - **Direct mode** (`--urls-file`, `--demo`): no Playwright; only these URLs are fetched.

   Modes combine: discovered URLs + manual URLs are merged and de-duplicated (order preserved).

2. **Detail fetch** — For each unique detail URL, ``requests`` loads the HTML (robots.txt checked).

3. **Shelter resolution** — Count ``cms.dierenbescherming.nl/assets/<slug>/`` occurrences in HTML;
   dominant slug → map to ``public.shelters.name``. The map is built **from NL shelter seed SQL**
   (CMS URLs + camelCase name heuristic), then **overridden** by ``cms_slug_to_shelter.json``.
   Unknown slug → skip row (add an alias in the JSON).

4. **Emit** — Idempotent ``INSERT … SELECT … WHERE NOT EXISTS`` SQL under ``--migrations-dir``.
   Run summary / skip manifest JSON go under ``--artifacts-dir`` (default: ``ikzoekbaas/runs/``),
   not next to the migration unless you pass explicit paths.

Install browsers once: ``playwright install chromium``
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlencode, urljoin, urlparse, urlunparse
from urllib.robotparser import RobotFileParser

import requests
from bs4 import BeautifulSoup

# Parent package is extract-pilot-animals (shared.py lives there).
_TOOLS_ROOT = Path(__file__).resolve().parent.parent
if str(_TOOLS_ROOT) not in sys.path:
    sys.path.insert(0, str(_TOOLS_ROOT))

from shelter_slug_from_seeds import (
    build_slug_map_from_seed_sql,
    default_seed_sql_paths,
    merge_slug_maps,
)
from shared import DEFAULT_MIGRATIONS_DIR, MAX_IMAGE_URLS, RawAnimal, generate_migration

BASE = "https://ikzoekbaas.dierenbescherming.nl"
DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
)
SOURCE_LABEL = "Ik Zoek Baas"
DEFAULT_DELAY_SEC = 3.0
SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_SLUG_MAP = SCRIPT_DIR / "cms_slug_to_shelter.json"
DEFAULT_ARTIFACTS_DIR = SCRIPT_DIR / "runs"

IGNORE_CMS_SLUGS = frozenset(
    {
        "common",
        "default",
        "static",
        "global",
        "assets",
    }
)

CMS_ASSET_SLUG_RE = re.compile(
    r"https://cms\.dierenbescherming\.nl/assets/([^/]+)/",
    re.I,
)
CMS_FULL_URL_RE = re.compile(
    r"https://cms\.dierenbescherming\.nl/[^\s\"'<>]+",
    re.I,
)
_DUTCH_POSTCODE_CITY = re.compile(
    r"\b(\d{4}\s*[A-Z]{2})\s+([A-Z][a-zA-Z\-]+(?:\s+[A-Z][a-zA-Z\-]+)*)\b"
)

_robots_cache: dict[str, RobotFileParser | None] = {}
_robots_ua: str = DEFAULT_USER_AGENT

RODENT_HINTS_EN_NL = (
    "cavia",
    "hamster",
    "gerbil",
    "chinchilla",
    "rat",
    "muis",
    "knaagdier",
    "fretten",
    "fret ",
)


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


def _load_slug_map(path: Path) -> dict[str, str]:
    if not path.is_file():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    out: dict[str, str] = {}
    for k, v in data.items():
        if k.startswith("_"):
            continue
        if isinstance(v, str):
            out[k] = v
    return out


def _species_from_detail_url(url: str, description: str) -> str:
    """Map Ik Zoek Baas URL path + text to ShelterSpecies enum name."""
    p = urlparse(url)
    parts = [x for x in p.path.lower().split("/") if x]
    kind = ""
    for i, seg in enumerate(parts):
        if seg == "asieldier" and i + 1 < len(parts):
            kind = parts[i + 1]
            break
    desc_low = description.lower()
    if kind == "honden":
        return "dog"
    if kind == "katten":
        return "cat"
    if kind == "konijnen-en-knagers":
        if any(h in desc_low for h in RODENT_HINTS_EN_NL):
            return "rodent"
        return "rabbit"
    if kind == "vogels":
        return "wildlife"
    if kind == "ex-proefdieren":
        if "hond" in desc_low:
            return "dog"
        if "kat" in desc_low:
            return "cat"
        return "wildlife"
    if kind == "overige":
        return "wildlife"
    return "wildlife"


def _pick_cms_slug(html: str) -> str | None:
    counts: Counter[str] = Counter()
    for m in CMS_ASSET_SLUG_RE.finditer(html):
        s = m.group(1)
        low = s.lower()
        if low in IGNORE_CMS_SLUGS:
            continue
        counts[s] += 1
    if not counts:
        return None
    return counts.most_common(1)[0][0]


def _city_from_html(html: str) -> str | None:
    m = _DUTCH_POSTCODE_CITY.search(html)
    if m:
        return m.group(2).strip()
    return None


def _normalize_img_url(page_url: str, raw: str) -> str:
    u = raw.strip()
    if not u:
        return ""
    if u.startswith("//"):
        u = "https:" + u
    elif u.startswith("/"):
        u = urljoin(page_url, u)
    return u


def _collect_image_urls(
    soup: BeautifulSoup,
    page_url: str,
    raw_html: str,
    *,
    shelter_cms_slug: str,
) -> list[str]:
    """Collect cms.dierenbescherming.nl image URLs for this animal only.

    Full-page scraping pulls in unrelated CMS assets (related listings, promos). Restrict to the
    shelter asset folder we already resolved via HTML counts — ``…/assets/<slug>/…``.
    """
    folder_marker = f"/assets/{shelter_cms_slug}/"
    seen: list[str] = []

    def add(u: str) -> None:
        u = _normalize_img_url(page_url, u)
        if not u or "cms.dierenbescherming.nl" not in u.lower():
            return
        low = u.lower()
        if "/admin/" in low or "/assets/common/" in low:
            return
        if folder_marker not in u:
            return
        if u not in seen:
            seen.append(u)

    for sel in (
        ("meta", {"property": "og:image"}),
        ("meta", {"name": "twitter:image"}),
    ):
        tag = soup.find(sel[0], sel[1])
        if tag and tag.get("content"):
            add(tag["content"])

    for tag in soup.find_all(["img", "source"]):
        for attr in ("src", "data-src", "data-lazy-src"):
            val = tag.get(attr) or ""
            if val:
                add(val)
        srcset = tag.get("srcset") or ""
        if srcset:
            for part in srcset.split(","):
                piece = part.strip().split()[0] if part.strip() else ""
                if piece:
                    add(piece)

    for m in CMS_FULL_URL_RE.finditer(raw_html):
        add(m.group(0))

    return seen[:MAX_IMAGE_URLS]


def _parse_detail(
    session: requests.Session,
    url: str,
    slug_map: dict[str, str],
    delay: float,
) -> tuple[RawAnimal | None, dict | None]:
    """Returns (animal, skip_record) — one of them is set."""
    _ensure_robots_allow(url)
    time.sleep(delay)
    resp = session.get(url, headers={"User-Agent": DEFAULT_USER_AGENT}, timeout=45)
    resp.raise_for_status()
    html = resp.text
    soup = BeautifulSoup(html, "html.parser")

    title_tag = soup.find("title")
    name = (title_tag.string or title_tag.get_text() or "").strip() if title_tag else ""
    if not name:
        name = "Unknown"

    meta_desc = soup.find("meta", attrs={"name": "description"})
    description = ""
    if meta_desc and meta_desc.get("content"):
        description = meta_desc["content"].strip().replace("\r\n", "\n")
    if not description:
        ogd = soup.find("meta", property="og:description")
        if ogd and ogd.get("content"):
            description = ogd["content"].strip()

    slug = _pick_cms_slug(html)
    if not slug:
        return None, {"url": url, "cms_slug": None, "reason": "no_cms_asset_slug"}

    db_name = slug_map.get(slug)
    if not db_name:
        return None, {"url": url, "cms_slug": slug, "reason": "unmapped_cms_slug"}

    species = _species_from_detail_url(url, description)
    city = _city_from_html(html)
    images = _collect_image_urls(soup, url, html, shelter_cms_slug=slug)

    animal = RawAnimal(
        source="ikzoekbaas",
        name=name[:500],
        description=description[:15000] if description else name,
        detail_url=url.split("?", 1)[0],
        species_guess=species,
        city=city or "",
        image_urls=images,
        resolved_shelter_name=db_name,
    )
    return animal, None


def _read_lines_file(path: Path | None) -> list[str]:
    if path is None or not path.is_file():
        return []
    out: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            out.append(line)
    return out


def _normalize_detail_url(u: str) -> str:
    if not u.startswith("http"):
        u = urljoin(BASE + "/", u.lstrip("/"))
    return u.split("?", 1)[0].rstrip("/")


def _listing_url_with_page(category_url: str, page: int, listing_range: int | None) -> str:
    """Merge ``page`` (and optional ``range``) into a zoek-asieldieren listing URL."""
    u = category_url if category_url.startswith("http") else urljoin(BASE + "/", category_url.lstrip("/"))
    parsed = urlparse(u)
    q = parse_qs(parsed.query)
    q["page"] = [str(page)]
    if listing_range is not None:
        q["range"] = [str(listing_range)]
    query = urlencode(q, doseq=True)
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, query, parsed.fragment))


def _scroll_collect_detail_hrefs(
    page: Any,
    *,
    scroll_passes: int,
    scroll_wait_ms: int,
    stable_stop_after: int = 6,
) -> list[str]:
    """Scroll listing until link count stabilizes; return raw ``href`` strings."""
    prev_n = 0
    stable_rounds = 0
    last_hrefs: list[str] = []
    for _ in range(scroll_passes):
        page.evaluate(
            """() => {
              const h = Math.max(
                document.body ? document.body.scrollHeight : 0,
                document.documentElement ? document.documentElement.scrollHeight : 0
              );
              const step = Math.max(window.innerHeight * 0.85, 400);
              for (let y = 0; y < h; y += step) {
                window.scrollTo(0, y);
              }
              window.scrollTo(0, document.body ? document.body.scrollHeight : 0);
            }"""
        )
        page.wait_for_timeout(scroll_wait_ms)
        for sel in (
            'button:has-text("Meer resultaten")',
            'button:has-text("Toon meer")',
            'button:has-text("Laad meer")',
        ):
            try:
                loc = page.locator(sel).first
                if loc.count() and loc.is_visible(timeout=400):
                    loc.click(timeout=2500)
                    page.wait_for_timeout(scroll_wait_ms)
            except Exception:
                pass
        hrefs = page.eval_on_selector_all(
            'a[href*="/asieldier/"]',
            "els => els.map(e => e.href)",
        )
        last_hrefs = [str(h) for h in hrefs]
        n_unique = len(set(last_hrefs))
        if n_unique == prev_n:
            stable_rounds += 1
            if stable_rounds >= stable_stop_after:
                break
        else:
            stable_rounds = 0
        prev_n = n_unique
    return last_hrefs


def discover_detail_urls_playwright(
    category_urls: list[str],
    *,
    headless: bool,
    scroll_passes: int,
    scroll_wait_ms: int,
    timeout_ms: int,
    listing_range: int | None,
    max_category_pages: int,
) -> tuple[list[str], list[dict[str, Any]], dict[str, Any]]:
    """Return (unique detail urls in encounter order, page errors, pagination stats).

    Listing pages use ``?page=`` pagination; visiting only ``…/honden`` without paging yields the
    first page only (~``range`` animals). We walk ``page=1..`` until a listing page contributes no
    ``/asieldier/`` links after scrolling.
    """
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as e:
        print(
            "error: playwright is required for --category-urls-file. "
            "Run: pip install playwright && playwright install chromium",
            file=sys.stderr,
        )
        raise SystemExit(1) from e

    collected: list[str] = []
    page_errors: list[dict[str, Any]] = []
    listing_pages_opened = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        try:
            context = browser.new_context(user_agent=DEFAULT_USER_AGENT, locale="nl-NL")
            for cat_url in category_urls:
                cu = cat_url if cat_url.startswith("http") else urljoin(BASE + "/", cat_url.lstrip("/"))
                page = context.new_page()
                try:
                    prev_page_urls: frozenset[str] | None = None
                    for page_num in range(1, max_category_pages + 1):
                        listing_page_url = _listing_url_with_page(cu, page_num, listing_range)
                        listing_pages_opened += 1
                        page.goto(listing_page_url, wait_until="domcontentloaded", timeout=timeout_ms)

                        if page_num == 1:
                            for sel in (
                                'button:has-text("Alles accepteren")',
                                'button:has-text("Accepteren")',
                                '[data-testid="cookie-accept"]',
                            ):
                                try:
                                    loc = page.locator(sel).first
                                    if loc.count() and loc.is_visible(timeout=1500):
                                        loc.click(timeout=3000)
                                        page.wait_for_timeout(300)
                                        break
                                except Exception:
                                    pass

                        try:
                            page.wait_for_selector(
                                'a[href*="/asieldier/"]',
                                timeout=min(45_000, timeout_ms),
                            )
                        except Exception:
                            if page_num == 1:
                                page_errors.append(
                                    {
                                        "category_url": cu,
                                        "listing_page_url": listing_page_url,
                                        "error": "timeout_waiting_for_animal_links",
                                    }
                                )
                            break

                        raw_hrefs = _scroll_collect_detail_hrefs(
                            page,
                            scroll_passes=scroll_passes,
                            scroll_wait_ms=scroll_wait_ms,
                        )
                        normalized = [_normalize_detail_url(h) for h in raw_hrefs]
                        page_urls = frozenset(normalized)

                        if not page_urls:
                            break

                        if prev_page_urls is not None and page_urls == prev_page_urls:
                            print(
                                f"listing pagination stop (duplicate page content): {listing_page_url}",
                                file=sys.stderr,
                            )
                            break
                        prev_page_urls = page_urls

                        for h in normalized:
                            collected.append(h)

                        print(
                            f"listing page {page_num}: {len(page_urls)} unique animal links "
                            f"({listing_page_url})",
                            file=sys.stderr,
                        )
                except Exception as ex:
                    page_errors.append({"category_url": cu, "error": str(ex)})
                finally:
                    page.close()
        finally:
            browser.close()

    seen: set[str] = set()
    unique: list[str] = []
    for u in collected:
        if u not in seen:
            seen.add(u)
            unique.append(u)
    stats = {
        "listing_pages_opened": listing_pages_opened,
        "listing_range_applied": listing_range,
        "max_category_pages_cap": max_category_pages,
    }
    return unique, page_errors, stats


def _count_reasons(skipped: list[dict]) -> dict[str, int]:
    c: Counter[str] = Counter()
    for s in skipped:
        r = s.get("reason") or "unknown"
        c[r] += 1
    return dict(c)


def main() -> None:
    parser = argparse.ArgumentParser(description="Ik Zoek Baas → Voluntail animals SQL seed")
    parser.add_argument(
        "--urls-file",
        type=Path,
        help="Newline-separated ikzoekbaas animal detail URLs (/asieldier/...)",
    )
    parser.add_argument(
        "--category-urls-file",
        type=Path,
        help="Newline-separated zoek-asieldieren overview URLs; requires Playwright + chromium",
    )
    parser.add_argument(
        "--demo",
        action="store_true",
        help=f"Fetch one known detail URL ({BASE}/asieldier/honden/4597957-guusje) for smoke test",
    )
    parser.add_argument("--delay-seconds", type=float, default=DEFAULT_DELAY_SEC)
    parser.add_argument("--migrations-dir", type=Path, default=DEFAULT_MIGRATIONS_DIR)
    parser.add_argument(
        "--artifacts-dir",
        type=Path,
        default=DEFAULT_ARTIFACTS_DIR,
        help="Directory for summary/skip JSON (default: ikzoekbaas/runs/)",
    )
    parser.add_argument(
        "--slug-map",
        type=Path,
        default=DEFAULT_SLUG_MAP,
        help="Optional JSON slug → shelter name; overrides automatic mappings from seed SQL",
    )
    parser.add_argument(
        "--no-seed-slug-map",
        action="store_true",
        help="Do not derive slugs from NL/pilot shelter seed SQL (use --slug-map JSON only)",
    )
    parser.add_argument(
        "--extra-seed-sql",
        type=Path,
        action="append",
        default=[],
        metavar="PATH",
        help="Additional shelter seed .sql to parse for CMS slugs (repeatable)",
    )
    parser.add_argument(
        "--skip-log",
        type=Path,
        default=None,
        help="Write skipped URLs JSON (default: under --artifacts-dir)",
    )
    parser.add_argument(
        "--summary-json",
        type=Path,
        default=None,
        help="Write run summary JSON (default: under --artifacts-dir)",
    )
    parser.add_argument("--user-agent", default=DEFAULT_USER_AGENT)
    parser.add_argument(
        "--playwright-timeout-ms",
        type=int,
        default=90_000,
        help="Navigation / selector timeout for category pages",
    )
    parser.add_argument(
        "--scroll-passes",
        type=int,
        default=45,
        help="Max scroll iterations per category page (infinite-scroll grids)",
    )
    parser.add_argument(
        "--scroll-wait-ms",
        type=int,
        default=900,
        help="Wait between scroll steps (ms)",
    )
    parser.add_argument(
        "--no-headless",
        action="store_true",
        help="Show Chromium (useful if cookie/consent blocks headless)",
    )
    parser.add_argument(
        "--listing-range",
        type=int,
        default=100,
        help="Listing page size (adds range= to overview URLs). Use 0 for site default.",
    )
    parser.add_argument(
        "--max-category-pages",
        type=int,
        default=500,
        help="Safety cap: max ?page=N per overview URL line",
    )
    args = parser.parse_args()

    global _robots_ua
    _robots_ua = args.user_agent

    detail_urls: list[str] = []
    category_urls_raw = _read_lines_file(args.category_urls_file)
    discovered_from_category: list[str] = []
    category_page_errors: list[dict[str, Any]] = []
    listing_stats: dict[str, Any] = {}
    listing_range = None if args.listing_range == 0 else args.listing_range

    if category_urls_raw:
        discovered_from_category, category_page_errors, listing_stats = discover_detail_urls_playwright(
            category_urls_raw,
            headless=not args.no_headless,
            scroll_passes=args.scroll_passes,
            scroll_wait_ms=args.scroll_wait_ms,
            timeout_ms=args.playwright_timeout_ms,
            listing_range=listing_range,
            max_category_pages=args.max_category_pages,
        )

    if args.demo:
        detail_urls.append(f"{BASE}/asieldier/honden/4597957-guusje")
    detail_urls.extend(_read_lines_file(args.urls_file))
    detail_urls.extend(discovered_from_category)

    if not detail_urls:
        parser.error("Provide --urls-file and/or --demo and/or --category-urls-file")

    seen: set[str] = set()
    urls_unique: list[str] = []
    for u in detail_urls:
        nu = _normalize_detail_url(u)
        if nu not in seen:
            seen.add(nu)
            urls_unique.append(nu)

    auto_slug_map: dict[str, str] = {}
    if not args.no_seed_slug_map:
        seed_paths = list(default_seed_sql_paths()) + list(args.extra_seed_sql)
        for sp in seed_paths:
            if not sp.is_file():
                print(f"warn: shelter seed SQL not found (skip): {sp}", file=sys.stderr)
                continue
            auto_slug_map.update(build_slug_map_from_seed_sql(sp.read_text(encoding="utf-8")))
    manual_slug_map = _load_slug_map(args.slug_map)
    slug_map = merge_slug_maps(auto_slug_map, manual_slug_map)
    if not slug_map:
        print(
            "error: empty slug map — enable seed SQL mappings or fill cms_slug_to_shelter.json",
            file=sys.stderr,
        )
        sys.exit(1)
    print(
        f"shelter slug map: {len(auto_slug_map)} from seed SQL, "
        f"{len(manual_slug_map)} JSON entries → {len(slug_map)} keys merged",
        file=sys.stderr,
    )

    session = requests.Session()
    animals: list[RawAnimal] = []
    skipped: list[dict] = []

    for u in urls_unique:
        try:
            animal, skip = _parse_detail(session, u, slug_map, args.delay_seconds)
            if animal:
                animals.append(animal)
            elif skip:
                skipped.append(skip)
                print(
                    f"skip: {skip.get('reason')} slug={skip.get('cms_slug')} url={skip['url']}",
                    file=sys.stderr,
                )
        except requests.RequestException as ex:
            rec = {"url": u, "reason": "fetch_error", "detail": str(ex)}
            skipped.append(rec)
            print(f"skip: fetch_error url={u} ({ex})", file=sys.stderr)
        except Exception as ex:
            rec = {"url": u, "reason": "parse_error", "detail": str(ex)}
            skipped.append(rec)
            print(f"skip: parse_error url={u} ({ex})", file=sys.stderr)

    reasons = _count_reasons(skipped)
    unmatched_shelter = reasons.get("unmapped_cms_slug", 0)
    animals_no_images = sum(1 for a in animals if not a.image_urls)

    summary: dict[str, Any] = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "category_urls_input": len(category_urls_raw),
        "detail_urls_discovered_from_categories_unique": len(discovered_from_category),
        "detail_urls_after_dedupe": len(urls_unique),
        "detail_fetch_attempted": len(urls_unique),
        "imported_to_sql": len(animals),
        "animals_with_no_image_urls": animals_no_images,
        "skipped_total": len(skipped),
        "skipped_by_reason": reasons,
        "unmatched_to_shelter_count": unmatched_shelter,
        "category_page_errors": category_page_errors,
        "category_listing_stats": listing_stats,
        "slug_map_keys_total": len(slug_map),
        "slug_map_keys_from_seed_sql": len(auto_slug_map),
        "slug_map_entries_from_json_file": len(manual_slug_map),
        "slug_map_seed_disabled": bool(args.no_seed_slug_map),
        "notes": (
            "unmatched_to_shelter_count counts rows where cms slug was not in slug-map JSON. "
            "no_cms_asset_slug means no cms.dierenbescherming.nl/assets/<slug>/ on the page."
        ),
    }

    print("\n=== Ik Zoek Baas extract summary ===")
    print(f"  Category overview URLs processed:     {len(category_urls_raw)}")
    if listing_stats:
        print(
            f"  Listing pages opened (pagination):   {listing_stats.get('listing_pages_opened', 0)}"
        )
    print(f"  Detail URLs found via Playwright:      {len(discovered_from_category)}")
    print(f"  Unique detail URLs to fetch:           {len(urls_unique)}")
    print(f"  Successfully matched shelter + SQL:    {len(animals)}")
    print(f"  Animals with zero image URLs:          {animals_no_images}")
    print(f"  Skipped (all reasons):                 {len(skipped)}")
    print(f"    — unmatched to shelter (slug map):  {unmatched_shelter}")
    print(f"    — no CMS asset slug on page:        {reasons.get('no_cms_asset_slug', 0)}")
    print(f"    — fetch / HTTP errors:              {reasons.get('fetch_error', 0)}")
    print(f"    — parse errors:                     {reasons.get('parse_error', 0)}")
    if category_page_errors:
        print(f"  Category page Playwright issues:       {len(category_page_errors)}")
    print("=====================================\n")

    if not animals:
        print("error: no animals extracted", file=sys.stderr)
        fail_path = args.summary_json
        if fail_path is None:
            stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
            fail_path = args.artifacts_dir / f"ikzoekbaas_failed_summary_{stamp}.json"
        fail_path.parent.mkdir(parents=True, exist_ok=True)
        fail_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
        print(f"wrote summary: {fail_path}")
        sys.exit(1)

    fallback_shelter = animals[0].resolved_shelter_name or ""
    out_sql = generate_migration(
        animals,
        shelter_name=fallback_shelter,
        source_label=SOURCE_LABEL,
        migrations_dir=args.migrations_dir,
        dedup_column="external_url",
    )
    print(f"wrote {out_sql}")

    summ_path = args.summary_json
    if summ_path is None:
        summ_path = args.artifacts_dir / f"{out_sql.stem}_summary.json"
    summ_path.parent.mkdir(parents=True, exist_ok=True)
    summ_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"wrote summary: {summ_path}")

    skip_path = args.skip_log
    if skip_path is None:
        skip_path = args.artifacts_dir / f"{out_sql.stem}_skipped.json"
    if skipped:
        skip_path.parent.mkdir(parents=True, exist_ok=True)
        skip_path.write_text(json.dumps(skipped, indent=2), encoding="utf-8")
        print(f"wrote skip manifest ({len(skipped)} rows): {skip_path}")
    elif skip_path.exists():
        skip_path.unlink()


if __name__ == "__main__":
    main()
