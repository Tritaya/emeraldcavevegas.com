# -*- coding: utf-8 -*-
"""Add the GetYourGuide auto-widget (cmp=emeraldcavevegas-ap) + the GYG analytics/
widget loader script to every INNER page (all *.html except index.html, which already
carries the homepage -a widget). Idempotent: skips a page that already has either.
The widget goes just before the footer (the late-page second conversion point); the
script goes in <head> (the widget will not render without it)."""
import glob, os, io

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

GYG_SCRIPT = (
    '  <!-- GetYourGuide Analytics + widget loader -->\n'
    '  <script async defer src="https://widget.getyourguide.com/dist/pa.umd.production.min.js" data-gyg-partner-id="1Q7ZSYC"></script>\n'
)

WIDGET = (
    '\n<!-- LIVE AVAILABILITY — GetYourGuide auto-widget (inner-page second conversion point) -->\n'
    '<section class="live-availability">\n'
    '  <div class="container">\n'
    '    <h2 class="op-widget-h">Check live availability &amp; prices</h2>\n'
    '    <p class="op-widget-sub">Real-time dates and instant booking for Emerald Cave kayak tours, Black Canyon trips and rentals via GetYourGuide — free cancellation on most options.</p>\n'
    '    <div data-gyg-widget="auto" data-gyg-partner-id="1Q7ZSYC" data-gyg-cmp="emeraldcavevegas-ap" data-gyg-locale-code="en-US" data-gyg-currency="USD"></div>\n'
    '  </div>\n'
    '</section>\n\n'
)

def main():
    for path in sorted(glob.glob(os.path.join(SITE, "*.html"))):
        name = os.path.basename(path)
        if name == "index.html":
            continue
        h = io.open(path, encoding="utf-8").read()
        changed = []
        if "pa.umd.production.min.js" not in h:
            if "</head>" in h:
                h = h.replace("</head>", GYG_SCRIPT + "</head>", 1); changed.append("script")
        if 'data-gyg-cmp="emeraldcavevegas-ap"' not in h:
            anchor = '<footer class="site-footer">'
            if anchor in h:
                h = h.replace(anchor, WIDGET + anchor, 1); changed.append("widget")
        if changed:
            io.open(path, "w", encoding="utf-8").write(h)
        print(f"  {name}: {'+'.join(changed) if changed else 'no change'}")

if __name__ == "__main__":
    main()
