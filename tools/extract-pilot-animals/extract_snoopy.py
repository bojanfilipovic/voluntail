#!/usr/bin/env python3
"""Extract adoptable dog listings from Udruga Snoopy (snoopy.hr).

Listing page: https://snoopy.hr/udomi/ — parses links under zenke/, muzjaci/, stariji_psi/, stenci/.
Detail pages: gallery images + icon-row stats for description.

Dedup: external_url (unique per dog detail page).
"""

from __future__ import annotations

import argparse
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

import requests
from bs4 import BeautifulSoup

from shared import DEFAULT_MIGRATIONS_DIR, MAX_IMAGE_URLS, RawAnimal, generate_migration

DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
)

LISTING_URL = "https://snoopy.hr/udomi/"
SHELTER_NAME = "Udruga Snoopy"
DEFAULT_DELAY_SEC = 3.0

_DETAIL_LINK_RE = re.compile(
    r'href="(https://snoopy\.hr/(?:zenke|muzjaci|stariji_psi|stenci)/[a-z0-9-]+/)"',
    re.I,
)

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


def _is_noise_image(url: str) -> bool:
    low = url.lower()
    noise = (
        "snoopy-logo",
        "cropped-snoopy",
        "weight-loss",
        "/height.png",
        "/pet.png",
        "frisbee",
        "silhouette",
        "/dog.png",
        "dog-2.png",
        "black-cat",
        "syringe",
        "processor.png",
        "prevention",
        "baby-lexi",
        "/font",
        "svg+xml",
        "data:image",
        "spacer",
        "placeholder",
        "ikona-doniraj",
        "ikona-",
        "-icon",
    )
    return any(x in low for x in noise)


def _normalize_img_src(raw: str, base_url: str) -> str:
    src = raw.strip()
    if src.startswith("//"):
        src = "https:" + src
    if src.startswith("/"):
        src = urljoin(base_url, src)
    return src


def _collect_detail_images(soup: BeautifulSoup, page_url: str) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []

    def push(u: str) -> None:
        if not u or _is_noise_image(u):
            return
        if "/wp-content/uploads/" not in u.lower():
            return
        low = u.lower()
        if not any(low.endswith(ext) for ext in (".jpg", ".jpeg", ".png", ".webp")):
            return
        if u in seen:
            return
        seen.add(u)
        ordered.append(u)

    for tag in soup.find_all(["img", "a"]):
        if tag.name == "img":
            for attr in ("data-src", "data-lazy-src", "src"):
                raw = tag.get(attr) or ""
                if raw:
                    push(_normalize_img_src(raw, page_url))
            srcset = tag.get("srcset") or tag.get("data-srcset") or ""
            if srcset:
                first = srcset.split(",")[0].strip().split()[0]
                if first:
                    push(_normalize_img_src(first, page_url))
        else:
            href = tag.get("href") or ""
            if href.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                push(_normalize_img_src(href, page_url))

    # Prefer larger originals (paths without -480x etc.) by listing unique URLs first occurrence order
    return ordered[:MAX_IMAGE_URLS]


def _description_noise(text: str) -> bool:
    t = text.strip()
    if not t:
        return True
    low = t.lower()
    if "+385" in t or "iban" in low or "@" in t:
        return True
    if t in ("UDOMI", "DONIRAJ"):
        return True
    if "vrijeme posjeta" in low:
        return True
    return False


def _detail_description(soup: BeautifulSoup) -> str:
    parts: list[str] = []
    for span in soup.select(".dsm_icon_list_text"):
        t = span.get_text(strip=True)
        if _description_noise(t):
            continue
        if t and t not in parts:
            parts.append(t)
    if parts:
        return ", ".join(parts)[:500]
    for p in soup.select(".et_pb_text_inner p"):
        t = p.get_text(strip=True)
        if len(t) > 20:
            return t[:500]
    return "Pas dostupan za udomljavanje — vidi profil na snoopy.hr."


def _detail_name(soup: BeautifulSoup, fallback_slug: str) -> str:
    title_tag = soup.find("title")
    if title_tag:
        text = title_tag.get_text(strip=True)
        if "|" in text:
            name = text.split("|")[0].strip()
            if name:
                return name
    return fallback_slug.replace("-", " ").title()


def _fetch_listing_urls(session: requests.Session, delay: float) -> list[str]:
    _ensure_robots_allow(LISTING_URL)
    r = session.get(LISTING_URL, timeout=45)
    r.raise_for_status()
    time.sleep(delay)
    found = sorted(set(_DETAIL_LINK_RE.findall(r.text)))
    return found


def _fetch_animal(
    session: requests.Session,
    detail_url: str,
    delay: float,
) -> RawAnimal | None:
    _ensure_robots_allow(detail_url)
    slug = detail_url.rstrip("/").split("/")[-1]
    try:
        r = session.get(detail_url, timeout=45)
        r.raise_for_status()
    except Exception:
        return None
    finally:
        time.sleep(delay)

    soup = BeautifulSoup(r.text, "html.parser")
    name = _detail_name(soup, slug)
    description = _detail_description(soup)
    image_urls = _collect_detail_images(soup, detail_url)

    return RawAnimal(
        source="snoopy",
        name=name,
        description=description,
        detail_url=detail_url.rstrip("/") + "/",
        species_guess="dog",
        city="Pula",
        image_urls=image_urls,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract Snoopy animal listings → SQL migration.")
    parser.add_argument("--migrations-dir", type=str, default=str(DEFAULT_MIGRATIONS_DIR))
    parser.add_argument("--delay-seconds", type=float, default=DEFAULT_DELAY_SEC)
    parser.add_argument("--user-agent", default=DEFAULT_USER_AGENT)
    args = parser.parse_args()

    migrations_dir = Path(args.migrations_dir)
    delay = max(0.0, args.delay_seconds)

    global _robots_ua
    ua = args.user_agent.strip() or DEFAULT_USER_AGENT
    _robots_ua = ua

    session = requests.Session()
    session.headers.update({
        "User-Agent": ua,
        "Accept-Language": "hr-HR,hr;q=0.9,en;q=0.8",
    })

    print("[snoopy] Fetching listing page...")
    urls = _fetch_listing_urls(session, delay)
    print(f"[snoopy] Found {len(urls)} detail URLs")

    animals: list[RawAnimal] = []
    for u in urls:
        a = _fetch_animal(session, u, delay)
        if a:
            animals.append(a)
            print(f"  {a.name}")
        else:
            print(f"  (skip failed) {u}", file=sys.stderr)

    sql_path = generate_migration(
        animals,
        shelter_name=SHELTER_NAME,
        source_label="snoopy",
        migrations_dir=migrations_dir,
        dedup_column="external_url",
    )
    print(f"\nWrote {sql_path}")


if __name__ == "__main__":
    main()
