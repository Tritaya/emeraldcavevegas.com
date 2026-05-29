#!/usr/bin/env python3
"""
fetch-viator-emeraldcave.py — Bookable Viator inventory for the homepage
tour-map module on emeraldcavevegas.com.

Mirrors besttimetovisit-x.com/scripts/fetch-viator-tours.py (same Viator API
key, same conversion-score ranking, same productUrl campaign tagging) but is
scoped to ONE destination (Las Vegas, d684) and filtered to the Emerald Cave /
Black Canyon Colorado-River kayak tours that this single-destination site
monetises.

Why no coordinate resolution (unlike the besttimetovisit script): Viator
geocodes every Las Vegas kayak tour to its Strip hotel-pickup point (~36 mi
from the actual cave), so plotting tour coords on a cave-centric map is wrong.
The homepage map uses hand-set POI coordinates instead; these tours are
surfaced as a ranked bookable list. So we only need title/rating/price/thumb
from /products/search — no /products/{code} or /locations/bulk calls.

Output: ../emerald-cave-tours.json (read at page-build time / inlined into
index.html).

Usage:
  python scripts/fetch-viator-emeraldcave.py
  # operators-page variant with its own attribution campaign:
  python scripts/fetch-viator-emeraldcave.py --campaign emeraldcavevegas-operators --out emerald-cave-tours-operators.json
"""

import argparse
import json
import time
import urllib.request
import urllib.error
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
OUT_PATH = PROJECT_ROOT / "emerald-cave-tours.json"
ENV_PATH = Path(r"C:/Users/trita/xDATA/ZPython/ZETC/zViator/.env")
BASE_URL = "https://api.viator.com/partner"
CAMPAIGN = "emeraldcavevegas"
LAS_VEGAS_DEST_ID = 684

HEADERS = {
    "Accept": "application/json;version=2.0",
    "Accept-Language": "en",
}

# Conversion-score weights — identical to besttimetovisit fetch-viator-tours.py
# (which mirrors zViator/destination_search.py).
SCORE_WEIGHTS = {
    "LIKELY_TO_SELL_OUT": 50,
    "HIGH_REVIEWS": 40,        # synthetic (>=500 reviews)
    "HIGH_RATING": 35,         # synthetic (>=4.8)
    "SPECIAL_OFFER": 30,
    "INSTANT_CONFIRMATION": 25,
    "FREE_CANCELLATION": 20,
    "PRIVATE_TOUR": 15,
    "SKIP_THE_LINE": 10,
    "NEW_ON_VIATOR": 5,
}


def load_api_key() -> str:
    if not ENV_PATH.exists():
        raise SystemExit(f"Missing {ENV_PATH} — Viator API key required.")
    for line in ENV_PATH.read_text().splitlines():
        line = line.strip()
        if line.startswith("VIATOR_API_KEY"):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("VIATOR_API_KEY not found in zViator/.env")


def _request(method: str, path: str, api_key: str, body: dict | None = None) -> dict:
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = dict(HEADERS)
    headers["exp-api-key"] = api_key
    if data is not None:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body_str = e.read().decode("utf-8", errors="replace")
        raise SystemExit(f"{method} {path} → HTTP {e.code}: {body_str[:200]}") from e


def search_products(api_key: str, destination_id: int, target: int = 100) -> list[dict]:
    """Paginate /products/search (50/page on Basic-Access) until target reached."""
    PAGE_SIZE = 50
    out: list[dict] = []
    start = 1
    while len(out) < target:
        want = min(PAGE_SIZE, target - len(out))
        body = {
            "filtering": {"destination": str(destination_id)},
            "sorting": {"sort": "DEFAULT"},
            "pagination": {"start": start, "count": want},
            "currency": "USD",
        }
        page = _request("POST", "/products/search", api_key, body).get("products", [])
        if not page:
            break
        out.extend(page)
        if len(page) < want:
            break
        start += len(page)
    return out


def is_emerald_cave_tour(title: str) -> bool:
    """Keep Emerald Cave / Black Canyon Colorado-River kayak + paddle tours;
    drop bus/skywalk/horseback/helicopter day trips that share the d684 pool."""
    t = (title or "").lower()
    if any(x in t for x in ["skywalk", "horseback", "helicopter", "bus tour", "atv", "zipline"]):
        return False
    if "emerald" in t:
        return True
    if ("kayak" in t or "paddle" in t) and ("black canyon" in t or "colorado river" in t or "willow beach" in t):
        return True
    return False


def conversion_score(p: dict) -> int:
    score = 0
    flags = set(p.get("flags", []) or [])
    for flag, pts in SCORE_WEIGHTS.items():
        if flag in flags:
            score += pts
    reviews = (p.get("reviews") or {}).get("totalReviews", 0) or 0
    rating = (p.get("reviews") or {}).get("combinedAverageRating", 0) or 0
    if reviews >= 500:
        score += SCORE_WEIGHTS["HIGH_REVIEWS"]
    if rating >= 4.8:
        score += SCORE_WEIGHTS["HIGH_RATING"]
    return score


def add_campaign(url: str) -> str:
    if not url:
        return url
    if "campaign=" in url:
        return url
    sep = "&" if "?" in url else "?"
    return f"{url}{sep}campaign={CAMPAIGN}"


def pick_thumb(p: dict) -> str | None:
    """Smallest image variant >= 400 px wide (crisp at the ~120 px card / retina);
    fall back to largest available. Same rule as the besttimetovisit picker."""
    imgs = p.get("images") or []
    if not imgs:
        return None
    variants = sorted(imgs[0].get("variants", []), key=lambda v: v.get("width") or 0)
    for v in variants:
        if (v.get("width") or 0) >= 400:
            return v.get("url")
    return variants[-1].get("url") if variants else None


def main():
    global CAMPAIGN, OUT_PATH
    ap = argparse.ArgumentParser()
    ap.add_argument("--campaign", default=CAMPAIGN, help="Viator productUrl campaign tag (attribution)")
    ap.add_argument("--out", default=None, help="output JSON filename (relative to project root)")
    args = ap.parse_args()
    CAMPAIGN = args.campaign
    if args.out:
        OUT_PATH = PROJECT_ROOT / args.out

    api_key = load_api_key()
    print(f"Searching Las Vegas (d{LAS_VEGAS_DEST_ID}) for Emerald Cave kayak tours... [campaign={CAMPAIGN}]")
    pool = search_products(api_key, LAS_VEGAS_DEST_ID, target=100)
    print(f"  pool={len(pool)}")

    matches = [p for p in pool if is_emerald_cave_tour(p.get("title", ""))]
    ranked = sorted(matches, key=conversion_score, reverse=True)
    print(f"  emerald-cave matches={len(ranked)}")

    out_products = []
    for p in ranked:
        reviews_d = p.get("reviews") or {}
        pricing = (p.get("pricing") or {}).get("summary") or {}
        dur = p.get("duration")
        out_products.append({
            "code": p.get("productCode"),
            "title": p.get("title"),
            "url": add_campaign(p.get("productUrl", "")),
            "thumb": pick_thumb(p),
            "rating": reviews_d.get("combinedAverageRating"),
            "reviews": reviews_d.get("totalReviews"),
            "price": pricing.get("fromPrice"),
            "currency": (p.get("pricing") or {}).get("currency"),
            "duration_minutes": dur.get("fixedDurationInMinutes") if isinstance(dur, dict) else None,
            "flags": p.get("flags") or [],
            "score": conversion_score(p),
        })
        print(f"    {conversion_score(p):>4}  {reviews_d.get('combinedAverageRating')}★  {(p.get('title') or '')[:60]}")

    payload = {
        "destination": "Emerald Cave / Black Canyon, Colorado River",
        "viator_destination_id": LAS_VEGAS_DEST_ID,
        "fetched_at": time.strftime("%Y-%m-%d"),
        "campaign": CAMPAIGN,
        "products": out_products,
    }
    OUT_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nWrote {len(out_products)} tours → {OUT_PATH}")


if __name__ == "__main__":
    main()
