#!/usr/bin/env python3
"""One-off extract for DOA + ROZ pilot pages (see README).

Defaults are intentionally conservative (delay, robots.txt). Prefer that over speed.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

import requests
from bs4 import BeautifulSoup

# Identify this client clearly (RFC 7231 style: product + optional comment).
# Replace the URL with your public repo or contact page when you have one.
DEFAULT_USER_AGENT = (
    "VoluntailPilotExtract/1.0 "
    "(+https://github.com/bojanfilipovic/voluntail; directory import tooling; human-reviewed runs only)"
)

DOA_LIST = "https://doa-dierenasiel.nl/dieren/dier-adopteren/"
ROZ_LIST = "https://reptielenopvang.nl/binnengekomen-dieren"

# Default pause between paginated listing requests (one host per loop). Conservative default.
DEFAULT_PAGE_DELAY_SEC = 3.0


@dataclass
class RawAnimal:
    source: str
    name: str
    description: str
    detail_url: str
    species_guess: str
    city: str | None


def species_from_kind_nl(kind: str) -> str:
    k = kind.strip().lower()
    if k.startswith("konijn"):
        return "rabbit"
    if k.startswith("hond"):
        return "dog"
    if k.startswith("kat"):
        return "cat"
    return "dog"


#
# robots.txt — stdlib only; fail soft if robots cannot be fetched/parsed.
#
_ROBOTS_CACHE: dict[str, RobotFileParser | None] = {}


def _robots_parser(netloc: str, scheme: str = "https") -> RobotFileParser | None:
    if netloc in _ROBOTS_CACHE:
        return _ROBOTS_CACHE[netloc]
    rp = RobotFileParser()
    robots_url = f"{scheme}://{netloc}/robots.txt"
    rp.set_url(robots_url)
    try:
        rp.read()
        _ROBOTS_CACHE[netloc] = rp
    except Exception:
        _ROBOTS_CACHE[netloc] = None
    return _ROBOTS_CACHE[netloc]


def ensure_robots_allow(url: str, user_agent: str) -> None:
    parsed = urlparse(url)
    rp = _robots_parser(parsed.netloc, parsed.scheme or "https")
    if rp is None:
        return
    if not rp.can_fetch(user_agent, url):
        print(
            "error: robots.txt disallows this URL for our User-Agent:\n"
            f"  {url}\n"
            "Adjust --user-agent if rules allow another product token, or fetch data manually.",
            file=sys.stderr,
        )
        sys.exit(2)


_ROZ_TITLE = re.compile(
    r"^\s*(\d+\s+\w+\s+\d{4})\s*-\s*(.+?)\s*\(([^)]+)\)\s*$", re.UNICODE
)


def roz_species_hint(title_rest: str) -> str:
    low = title_rest.lower()
    if "vogelspin" in low:
        return "arachnid"
    if "salamander" in low or "kikker" in low:
        return "amphibian"
    return "reptile"


def fetch_doa(
    session: requests.Session,
    max_pages: int,
    page_delay_sec: float,
) -> list[RawAnimal]:
    out: list[RawAnimal] = []
    ua = session.headers.get("User-Agent", "")
    for page in range(1, max_pages + 1):
        url = DOA_LIST if page == 1 else f"{DOA_LIST.rstrip('/')}/page/{page}/"
        ensure_robots_allow(url, ua)
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
                    species_guess=species_from_kind_nl(kind_nl),
                    city="Amsterdam",
                )
            )
        time.sleep(page_delay_sec)
    seen: set[str] = set()
    uniq: list[RawAnimal] = []
    for a in out:
        if a.detail_url in seen:
            continue
        seen.add(a.detail_url)
        uniq.append(a)
    return uniq


def fetch_roz(
    session: requests.Session,
    max_pages: int,
    step: int,
    page_delay_sec: float,
) -> list[RawAnimal]:
    out: list[RawAnimal] = []
    ua = session.headers.get("User-Agent", "")
    for page_idx in range(max_pages):
        start = page_idx * step
        url = f"{ROZ_LIST}?start={start}"
        ensure_robots_allow(url, ua)
        r = session.get(url, timeout=45)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        table = soup.select_one("table")
        if not table:
            break
        rows = table.select("tbody tr") or table.select("tr")
        batch = 0
        for tr in rows:
            link = tr.select_one('a[href*="/binnengekomen-dieren/"]')
            if not link:
                continue
            title = link.get_text(" ", strip=True)
            href = link.get("href") or ""
            abs_url = urljoin(ROZ_LIST + "/", href)
            m = _ROZ_TITLE.match(title)
            if m:
                intro, rest, city = m.group(1), m.group(2).strip(), m.group(3).strip()
                desc = f"Binnengekomen: {intro} — {rest}. ({city})"
                name = rest[:200]
            else:
                city = ""
                name = title[:200]
                desc = title[:500]
            sp = roz_species_hint(name)
            out.append(
                RawAnimal(
                    source="roz",
                    name=name,
                    description=desc[:500],
                    detail_url=abs_url,
                    species_guess=sp,
                    city=city or None,
                )
            )
            batch += 1
        time.sleep(page_delay_sec)
        if batch == 0:
            break
    seen: set[str] = set()
    uniq: list[RawAnimal] = []
    for a in out:
        if a.detail_url in seen:
            continue
        seen.add(a.detail_url)
        uniq.append(a)
    return uniq


def main() -> None:
    parser = argparse.ArgumentParser(
        epilog=(
            "Conservative defaults: pause between listing pages, always apply robots.txt when the "
            "file can be read. Use --user-agent with a working contact URL; avoid lowering delay "
            "unless necessary. There is no flag to ignore robots — use manual data if disallowed."
        ),
    )
    parser.add_argument("--out-dir", type=Path, default=Path("out"))
    parser.add_argument("--doa-pages", type=int, default=5)
    parser.add_argument("--roz-pages", type=int, default=8)
    parser.add_argument(
        "--delay-seconds",
        type=float,
        default=DEFAULT_PAGE_DELAY_SEC,
        metavar="SEC",
        help=(
            f"seconds to wait after each listing page fetch (default: {DEFAULT_PAGE_DELAY_SEC}). "
            "Higher is kinder to third-party sites; 4+ is reasonable for cautious runs."
        ),
    )
    parser.add_argument(
        "--user-agent",
        default=DEFAULT_USER_AGENT,
        help="Full User-Agent on every request (default points at this repo; override if needed).",
    )
    args = parser.parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)

    session = requests.Session()
    ua = args.user_agent.strip() or DEFAULT_USER_AGENT
    session.headers.update(
        {
            "User-Agent": ua,
            "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
        }
    )

    delay = max(0.0, float(args.delay_seconds))
    if delay > 0 and delay < 2.0:
        print(
            "warning: --delay-seconds below 2s increases load on shelter sites; "
            "prefer the default or higher unless you have a strong reason.",
            file=sys.stderr,
        )
    if "OWNER" in ua or "github.com/OWNER" in ua:
        print(
            "warning: User-Agent still contains OWNER placeholder — set --user-agent "
            "to your real repo or contact page before routine runs.",
            file=sys.stderr,
        )

    doa = fetch_doa(session, args.doa_pages, delay)
    roz = fetch_roz(session, args.roz_pages, 25, delay)

    payload: dict[str, Any] = {
        "doa": [asdict(x) for x in doa],
        "roz": [asdict(x) for x in roz],
    }
    target = args.out_dir / "pilot_animals_raw.json"
    target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {target} ({len(doa)} DOA, {len(roz)} ROZ rows)")


if __name__ == "__main__":
    main()
