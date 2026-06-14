# -*- coding: utf-8 -*-
"""Swap the homepage tour matrix from Viator -> GetYourGuide, in index.html ONLY.
Replaces the <ol class="ec-tours"> block with re-ranked GYG cards, updates the
"booking via Viator" credit line, and the homepage's own footer disclaimer.
Other pages, script.js, and data files are untouched."""
import io, os, re, json, html

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
INDEX = os.path.join(SITE, "index.html")
RANKED = os.path.join(HERE, "gyg-emeraldcave-ranked.json")

def thumb(url):
    # Scraped full-res form is  cdn.getyourguide.com/image/99/tour_img/<hash>.<ext>
    # The small 92px thumb form (what the gallery uses, returns 200) is
    #   cdn.getyourguide.com/img/tour/<hash>.<ext>/99.jpg   (NOT image/99/tour_img/.../99.jpg → 404)
    m = re.search(r"/tour_img/([^/]+?\.(?:jpe?g|png))$", url, re.I)
    if m:
        return f"https://cdn.getyourguide.com/img/tour/{m.group(1)}/99.jpg"
    return url

def tidy(title):
    return title.replace("Half Day Tour-No Shuttle", "Half-Day Tour").strip()

def card(r):
    esc = lambda s: html.escape(str(s), quote=True)
    meta = [f'              <span class="ec-rating">{r["rating"]}★ ({r["reviews"]:,})</span>',
            f'              <span class="ec-price">from {esc(r["price"])}</span>']
    if r.get("dur"):
        meta.append(f'              <span class="ec-dur">{esc(r["dur"])}</span>')
    meta.append(f'              <span class="{r["pickup_cls"]}">{esc(r["pickup_lbl"])}</span>')
    if r.get("hot") and r.get("hot_lbl"):
        meta.append(f'              <span class="ec-hot">{esc(r["hot_lbl"])}</span>')
    return (
        '      <li class="ec-tour-item">\n'
        f'        <a class="vlink ec-tour" data-vurl="{r["vurl_b64"]}" role="link" rel="sponsored nofollow noopener" tabindex="0">\n'
        f'          <span class="ec-rank">{r["rank"]}</span>\n'
        f'          <img class="ec-thumb" src="{esc(thumb(r["image"]))}" alt="" loading="lazy" width="92" height="92">\n'
        '          <span class="ec-body">\n'
        f'            <span class="ec-title">{esc(tidy(r["title"]))}</span>\n'
        '            <span class="ec-meta">\n'
        + "\n".join(meta) + "\n"
        '            </span>\n'
        '          </span>\n'
        '          <span class="ec-cta">Check availability →</span>\n'
        '        </a>\n'
        '      </li>'
    )

def main():
    ranked = json.load(io.open(RANKED, encoding="utf-8"))
    cards = "\n".join(card(r) for r in ranked)
    new_ol = '<ol class="ec-tours">\n' + cards + '\n    </ol>'

    h = io.open(INDEX, encoding="utf-8").read()
    orig = h

    # 1) replace the tour matrix <ol>
    h, n_ol = re.subn(r'<ol class="ec-tours">.*?</ol>', lambda m: new_ol, h, count=1, flags=re.S)

    # 2) credit line under the matrix
    h, n_cr = re.subn(
        r'(Live availability and booking via <strong>)Viator(</strong>\. We may earn a commission from bookings made through these links, at no extra cost to you — it never affects our independent rankings\. Prices from \$79; tours verified )May 2026',
        r'\1GetYourGuide\g<2>June 2026', h, count=1)

    # 3) homepage footer disclaimer (this index.html copy only)
    h, n_ft = re.subn(r'Tour booking links route through Viator and may earn us',
                      'Tour booking links route through GetYourGuide and may earn us', h, count=1)

    io.open(INDEX, "w", encoding="utf-8").write(h)
    print(f"replacements: ol={n_ol}  credit={n_cr}  footer={n_ft}")
    print("viator left in index.html:", h.lower().count("viator"))
    print("getyourguide booking links (t-ids):", len(re.findall(r'data-vurl=', h)))

if __name__ == "__main__":
    main()
