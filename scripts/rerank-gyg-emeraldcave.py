# -*- coding: utf-8 -*-
"""
Re-rank the GYG Emerald Cave kayak offers (scraped from emerald-cave-l158722) and
emit the homepage tour-matrix data: top 6 by rating x review-volume, each with a
base64-encoded GYG affiliate data-vurl (the same cloaking the Viator links used).

Usage: python rerank-gyg-emeraldcave.py [path/to/gyg_offers.json]
       (defaults to the newest gyg_*.json in this scripts/ dir)
"""
import sys, os, json, io, glob, base64, math, re

PARTNER = "1Q7ZSYC"
CMP = "emeraldcavevegas"
HERE = os.path.dirname(os.path.abspath(__file__))

def newest_gyg():
    files = glob.glob(os.path.join(HERE, "gyg_*.json"))
    return max(files, key=os.path.getmtime) if files else None

def load(path):
    with io.open(path, encoding="utf-8") as f:
        d = json.load(f)
    return d if isinstance(d, list) else d.get("products") or d.get("offers") or []

def rating_of(t):
    r = t.get("rating")
    if isinstance(r, (int, float)) and r > 0:
        return float(r)
    fr = t.get("formattedRating")
    try:
        return float(fr)
    except (TypeError, ValueError):
        return 0.0

def reviews_of(t):
    return int(t.get("reviewCount") or t.get("reviews") or 0)

def price_str(t):
    p = t.get("formattedStartingPrice")
    if p:
        return p
    n = t.get("startingPrice") or t.get("price")
    return f"${int(round(n))}" if n else ""

def img_of(t):
    imgs = t.get("images") or []
    return imgs[0] if imgs else (t.get("thumb") or "")

def is_emerald_kayak(t):
    """Keep real Emerald Cave / Black Canyon / Willow Beach kayak tours; drop Thailand etc."""
    s = ((t.get("title") or "") + " " + (t.get("url") or "")).lower()
    if "ko-lanta" in s or "koh-lanta" in s or "ko lanta" in s or "thailand" in s:
        return False
    return ("emerald" in s) or ("black-canyon" in s) or ("willow-beach" in s) or ("willow beach" in s)

def score(t):
    # rating x review-volume (wirecutter logic: "rating, review volume, and availability")
    return rating_of(t) * (1.0 + math.log10(max(reviews_of(t), 1)))

def aff(url):
    sep = "&" if "?" in url else "?"
    return f"{url}{sep}partner_id={PARTNER}&utm_medium=online_publisher&cmp={CMP}"

def b64(url):
    return base64.b64encode(url.encode()).decode()

def clean_title(t):
    s = t.get("title") or ""
    s = re.sub(r"\s*[-–]\s*20\d\d\s*\(.*?\)\s*$", "", s)   # strip " - 2026 (Verified Reviews)"
    return s.strip()

def itin_text(t):
    parts = []
    for it in (t.get("itinerary") or []):
        if isinstance(it, dict):
            parts.append((it.get("name") or "") + " " + (it.get("description") or ""))
    return " ".join(parts).lower()

STRIP_HOTELS = ("aria", "excalibur", "mgm", "bellagio", "caesars", "luxor", "park mgm",
                "resort & casino", "hotel & casino", "strip", "harrah")

def pickup(t):
    s = (clean_title(t) + " " + (t.get("url") or "")).lower()
    it = itin_text(t)
    # explicit no-transport / rental / self-launch => Willow Beach meet-up
    if any(k in s for k in ("without transportation", "no shuttle", "no-shuttle", "rental",
                            "from-willow-beach", "from willow beach", "self-guided", "self guided")):
        return ("ec-pickup ec-pickup-meet", "Willow Beach meet-up")
    # pickup hotels in itinerary, or a shuttle/pickup/from-LV title => Strip hotel pickup
    if any(h in it for h in STRIP_HOTELS) or any(k in s for k in ("shuttle", "pickup", "from las vegas", "vegas pickup")):
        return ("ec-pickup", "Strip hotel pickup")
    return ("ec-pickup ec-pickup-meet", "Willow Beach meet-up")

def hot(t):
    """Honest demand/popularity flag from real GYG signals (not flag key names).
    Returns (show, label)."""
    badges = [str(x) for x in (t.get("badges") or [])]
    btxt = " ".join(badges).lower()
    flg = t.get("flags") or {}
    label = t.get("bookedRecentlyLabel")
    if "#1 selling" in btxt or "best seller" in btxt or "bestseller" in btxt:
        return True, "🔥 #1 seller"
    if flg.get("isLikelyToSellOut") is True:
        return True, "🔥 Selling fast"
    m = re.search(r"(\d+)", str(label or ""))
    if m and int(m.group(1)) >= 5:
        return True, "🔥 " + str(label)
    return False, ""

def dur(t):
    m = t.get("duration_minutes")
    if not m:
        d = t.get("duration") or ""
        return d if isinstance(d, str) else ""
    h, mm = divmod(int(m), 60)
    return (f"{h}h" + (f" {mm}m" if mm else "")) if h else f"{mm}m"

def main():
    path = sys.argv[1] if len(sys.argv) > 1 else newest_gyg()
    if not path or not os.path.exists(path):
        print("No GYG offers JSON found in", HERE); sys.exit(1)
    print("source:", os.path.basename(path))
    tours = [t for t in load(path) if is_emerald_kayak(t) and reviews_of(t) >= 25 and rating_of(t) >= 4.3]
    tours.sort(key=score, reverse=True)
    top = tours[:6]
    print(f"kept {len(tours)} eligible, top 6:\n")
    out = []
    for i, t in enumerate(top, 1):
        rec = {
            "rank": i,
            "title": clean_title(t),
            "rating": f"{rating_of(t):.2f}".rstrip("0").rstrip(".") if rating_of(t) else "",
            "reviews": reviews_of(t),
            "price": price_str(t),
            "dur": dur(t),
            "pickup_cls": pickup(t)[0], "pickup_lbl": pickup(t)[1],
            "hot": hot(t)[0], "hot_lbl": hot(t)[1],
            "badge": (t.get("badges") or [None])[0],
            "url": aff(t.get("url") or ""),
            "vurl_b64": b64(aff(t.get("url") or "")),
            "image": img_of(t),
            "score": round(score(t), 2),
        }
        out.append(rec)
        print(f"  {i}. {rec['rating']}* ({rec['reviews']:>5}) {rec['price']:>6}  {rec['dur']:>5}  {rec['hot_lbl']:<18} {rec['pickup_lbl']:<20} | {(rec['title'] or '')[:54]}")
    with io.open(os.path.join(HERE, "gyg-emeraldcave-ranked.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print("\nwrote gyg-emeraldcave-ranked.json (rank/title/rating/reviews/price/dur/pickup/vurl_b64/image)")

if __name__ == "__main__":
    main()
