# -*- coding: utf-8 -*-
"""Emit the GYG rental-offer cards (ec-tours matrix) for emerald-cave-kayak-rental.html.
Selects the self-guided / rental offers from the Emerald Cave scrape, ranks by
rating x review-volume, base64-encodes GYG affiliate links with cmp=...-rental."""
import json, io, glob, os, base64, math, re, html

HERE = os.path.dirname(os.path.abspath(__file__))
PARTNER, CMP = "1Q7ZSYC", "emeraldcavevegas-rental"
RENTAL_IDS = {559379, 524674, 527986, 746744}

def newest():
    return max(glob.glob(os.path.join(HERE, "gyg_*.json")), key=os.path.getmtime)

def rating(t):
    try: return float(t.get("formattedRating") or 0)
    except: return 0.0
def reviews(t): return int(t.get("reviewCount") or 0)
def clean(t):
    return re.sub(r"\s*[-–]\s*20\d\d\s*\(.*?\)\s*$", "", t.get("title") or "").strip()
def _thumb_url(u):
    m = re.search(r"/tour_img/([^/]+?\.(?:jpe?g|png))$", u, re.I)
    return f"https://cdn.getyourguide.com/img/tour/{m.group(1)}/99.jpg" if m else u

def thumb(t, used):
    """First image not already used by a prior card (sibling tours share image lists)."""
    for u in (t.get("images") or []):
        tu = _thumb_url(u)
        if tu not in used:
            used.add(tu); return tu
    u = (t.get("images") or [""])[0]
    return _thumb_url(u) if u else ""
def aff(u):
    return f"{u}{'&' if '?' in u else '?'}partner_id={PARTNER}&utm_medium=online_publisher&cmp={CMP}"
def b64(u): return base64.b64encode(u.encode()).decode()
def pickup(t):
    s = clean(t).lower()
    return ("ec-pickup", "Optional Vegas shuttle") if "shuttle" in s else ("ec-pickup ec-pickup-meet", "Willow Beach pickup")

def main():
    tours = [t for t in json.load(io.open(newest(), encoding="utf-8")) if int(t.get("id") or 0) in RENTAL_IDS]
    tours.sort(key=lambda t: rating(t) * (1 + math.log10(max(reviews(t), 1))), reverse=True)
    esc = lambda s: html.escape(str(s), quote=True)
    used = set()
    blocks = []
    for i, t in enumerate(tours, 1):
        pc, pl = pickup(t)
        blocks.append(
            '      <li class="ec-tour-item">\n'
            f'        <a class="vlink ec-tour" data-vurl="{b64(aff(t["url"]))}" role="link" rel="sponsored nofollow noopener" tabindex="0">\n'
            f'          <span class="ec-rank">{i}</span>\n'
            f'          <img class="ec-thumb" src="{esc(thumb(t, used))}" alt="" loading="lazy" width="92" height="92">\n'
            '          <span class="ec-body">\n'
            f'            <span class="ec-title">{esc(clean(t))}</span>\n'
            '            <span class="ec-meta">\n'
            f'              <span class="ec-rating">{rating(t):.1f}★ ({reviews(t):,})</span>\n'
            f'              <span class="ec-price">from {esc(t.get("formattedStartingPrice") or "")}</span>\n'
            f'              <span class="{pc}">{esc(pl)}</span>\n'
            '            </span>\n'
            '          </span>\n'
            '          <span class="ec-cta">Check availability →</span>\n'
            '        </a>\n'
            '      </li>'
        )
    out = '<ol class="ec-tours">\n' + "\n".join(blocks) + '\n    </ol>'
    io.open(os.path.join(HERE, "_rental_cards.html"), "w", encoding="utf-8").write(out)
    print(out)
    print(f"\n-- {len(tours)} rental cards written to _rental_cards.html --")

if __name__ == "__main__":
    main()
