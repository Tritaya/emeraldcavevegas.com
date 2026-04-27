# emeraldcavevegas.com — Build Workflow

Independent kayak guide for Emerald Cave, Black Canyon, Colorado River.
Static HTML/CSS/JS site. No build step, no framework, no dependencies.

---

## Table of Contents

1. [Project overview](#1-project-overview)
2. [Repository and deployment](#2-repository-and-deployment)
3. [File inventory](#3-file-inventory)
4. [Design system](#4-design-system)
5. [Page architecture](#5-page-architecture)
6. [Schema markup (SEO / GEO / AEO)](#6-schema-markup)
7. [Images and media](#7-images-and-media)
8. [Open-Meteo weather widget](#8-open-meteo-weather-widget)
9. [JavaScript features](#9-javascript-features)
10. [Adding and editing content](#10-adding-and-editing-content)
11. [Deployment workflow](#11-deployment-workflow)
12. [Known issues and gotchas](#12-known-issues-and-gotchas)
13. [Research source files](#13-research-source-files)

---

## 1. Project overview

**Purpose:** Lonely Planet-style independent traveller reference for Emerald Cave on the Colorado River, Black Canyon, Arizona. Not an affiliate site. No booking commissions. No commercial relationships with any operator.

**Audience:** Las Vegas visitors planning a half-day kayak trip — first-timers to experienced paddlers, families, photographers, and travellers researching which tour operator to book (or whether to go self-guided).

**Canonical domain:** `https://emeraldcavevegas.com/` (DNS not yet pointed as of April 2026; site live on GitHub Pages and Netlify in the meantime).

**Character:** Data journalism aesthetic. Information-first. Prose and tables, not cards. Wikipedia density, FiveThirtyEight visual register. Treats the reader as an adult.

---

## 2. Repository and deployment

| | |
|---|---|
| **GitHub repo** | `https://github.com/Tritaya/emeraldcavevegas.com` (public) |
| **GitHub Pages** | `https://tritaya.github.io/emeraldcavevegas.com/` |
| **Netlify** | Connected to the same repo; auto-deploys on push to `master` |
| **Canonical (future)** | `https://emeraldcavevegas.com/` |
| **Branch** | `master` (single branch, deploys from root `/`) |

### GitHub Pages setup

Enabled via repo Settings → Pages → Source: Deploy from branch `master`, folder `/` (root).
Deploys automatically on every push.

### Netlify setup

Netlify is connected to the GitHub repo. The UI was previously misconfigured with a leftover `hugo` build command from another project. Fixed with `netlify.toml`:

```toml
[build]
  command   = ""
  publish   = "."
```

**Critical:** the Netlify UI Build command and Publish directory fields must also be **blank** (cleared in Site settings → Build & deploy → Build settings). If the UI fields are non-empty they override `netlify.toml`. Both must agree.

### Pushing changes

```bash
git add <files>
git commit -m "description"
git push origin master
```

No build step. Push = deploy. Both GitHub Pages and Netlify pick it up automatically within ~2 minutes.

**Note on paths:** The working directory path contains special characters. Never use `cd` in Bash tool commands — pass absolute paths as arguments instead. Use PowerShell for file operations when Bash fails on the path.

---

## 3. File inventory

```
emeraldcavevegas.com/
│
├── index.html                          Main destination guide
├── operators.html                      Dedicated operator comparison page
├── styles.css                          All styles (single file)
├── script.js                           All JS (single file)
├── favicon.svg                         SVG favicon — emerald gem mark
├── sitemap.xml                         Two URLs: index + operators
├── robots.txt                          All crawlers allowed, incl. AI bots
├── netlify.toml                        Overrides Netlify build config
│
├── emerald-cave-arizona-zoom-out-map.webp    Regional location map
├── emerald-cave-willow-beach-zoom-in-map.webp  Willow Beach detail map
├── map-las-vegas-to-willow-beach.webp        Driving route screenshot
├── map-us93-to-marina.webp                   Access road descent screenshot
├── map-marina-to-emerald-cave.webp           Paddle route satellite screenshot
└── map-hoover-dam-to-willow-beach.webp       Full-day route screenshot
```

### Source data (not in repo, in LIMBO parent folder)

```
C:\Users\trita\Dropbox\.........myfolder\LIMBO\emerald-cave-vegas\
├── report.md                           Full 17-operator research report
└── results\
    ├── Emerald_Cave_General_Info.json  Destination data, Reddit insights
    ├── River_Dogz.json
    ├── Blazin_Paddles.json
    ├── Evolution_Expeditions.json
    ├── EZ_Kayak_Tours.json
    ├── LVCKC_Las_Vegas_Clear_Kayak_Company.json
    ├── Venture_Out_Vegas.json
    ├── Desert_Adventures.json
    ├── Oneness_Adventures.json
    ├── Kayak_Lake_Mead.json
    ├── Desert_River_Outfitters.json
    ├── Trek_Las_Vegas.json
    ├── Las_Vegas_Paddleboard_SUP_Tours.json
    └── Willow_Beach_Marina.json

C:\Users\trita\xDATA\ZHugo\_html\venicewatertaxitransfer\
└── gyg_en_gbemerald_cave_l158722_34offers.json   34 GYG offers with images/reviews
```

---

## 4. Design system

### CSS custom properties (`styles.css`)

```css
--bg:        #fafaf8   /* warm off-white page background */
--bg-alt:    #f2f1ed   /* infoboxes, table stripes, callouts */
--border:    #dedad4   /* all dividing lines */
--text:      #1c1b18   /* near-black body text */
--muted:     #5a5751   /* captions, labels, secondary text */
--accent:    #1d5c4d   /* deep emerald — links, headings, highlights */
--accent-lt: #e8f4f1   /* light emerald — callout backgrounds */
--danger:    #b83c2a   /* HIGH hazard labels */
--warn:      #9a6809   /* MEDIUM hazard labels */
--serif:     'Fraunces', Georgia, serif
--sans:      'Source Sans 3', system-ui, sans-serif
--max:       820px     /* content column max-width */
--wide:      1120px    /* nav / facts bar / footer max-width */
```

### Typography

| Element | Font | Weight | Notes |
|---|---|---|---|
| H1–H3 | Fraunces | 700 | Optical-size variable serif, editorial |
| Body text | Source Sans 3 | 400 | Humanist sans, high legibility |
| Nav labels | Source Sans 3 | 700–800 | Uppercase, tracked |
| Data/numbers | Source Sans 3 | 700 | Tabular figures where needed |
| Pull quotes | Fraunces | 400 italic | `.editorial` and `.voice` blockquotes |

Fonts loaded from Google Fonts with `display=swap`. Preconnect hints in `<head>`.

### Key components

| Class | Description |
|---|---|
| `.callout` | Green-tinted info box with left border — key facts |
| `.infobox` | Gray-background box — quick reference lists |
| `blockquote.voice` | Reddit / community quotes — italic serif, left border |
| `blockquote.editorial` | Attributed press quotes (e.g. Lonely Planet) — top border rule |
| `.data-table` | Sortable table — dark header, striped rows |
| `.scroll-gallery` | Horizontal drag-scroll image strip |
| `.map-grid` | 2-col grid for map figures |
| `.season-grid` | 2-col grid for seasonal breakdown boxes |
| `.weather-widget` | Live conditions block — see §8 |
| `.conditions-pill` | Floating bottom-right live conditions button |
| `.faq-item / .faq-q / .faq-a` | Accordion FAQ |
| `.hz.hz-h / .hz-m / .hz-l` | Hazard level tags (HIGH / MEDIUM / LOW) |
| `.facts-bar` | Dark full-width key stats strip below hero |
| `.op-entry` | Operator profile block on operators.html |

---

## 5. Page architecture

### `index.html` — section order

| `id` | Section | Purpose |
|---|---|---|
| `top` | Header / nav | Sticky, links to all sections and operators.html |
| — | Hero | H1, deck, byline, hero image |
| — | Facts bar | 6 key stats in dark strip |
| `what-is` | What is Emerald Cave? | LP editorial quote, location, geology, infobox |
| `glow` | Why does it glow? | Optics science, primary/secondary windows, Reddit quote |
| `maps` | Location and maps | 6 map images + Google Maps iframe |
| `when` | When to visit | Time-of-day guide, 4-season grid, cave capacity callout |
| `getting-there` | Getting there | Driving, parking, self-guided rental, shuttle, Hoover Dam, cell coverage, what-to-bring infobox |
| `safety` | Safety and conditions | **Weather widget**, 6 hazard entries with level tags |
| `voices` | Community voices | 3 Reddit-sourced quotes |
| `photography` | Photography guide | Midday vs afternoon, composition, scroll gallery |
| `faq` | FAQ | 15-item accordion |
| `operators` | Tour operators teaser | Bullet summary + link to operators.html |
| `methodology` | About this guide | Independence statement, scope, last updated |
| — | Footer | Nav links, external links |
| — | Floating pill | `#conditionsPill` — live conditions, fixed bottom-right |

### `operators.html` — section order

| `id` | Section |
|---|---|
| `table` | Full sortable comparison table (13 operators) + scroll gallery |
| `choose` | Decision guide (by use case) |
| `detail` | Individual operator profiles with prose + images |
| `methodology` | Research methodology note |

---

## 6. Schema markup

All schema is inline JSON-LD in `<head>`. Both pages carry relevant types.

### `index.html` schema graph

```
@graph:
  WebSite          — site identity
  Article          — the guide itself (headline, dateModified, author)
  TouristAttraction — Emerald Cave (geo coords, address, containedInPlace)
  FAQPage          — 15 Q&A pairs (mirrors the visible FAQ accordion)
```

**GeoCoordinates:** `35.890861°N, -114.6855819°W`
**ContainedInPlace:** Lake Mead National Recreation Area (NPS)

### `operators.html` schema

```
ItemList — 13 operators with position, name, url
```

### AEO / GEO optimisation principles applied

- H2 headings are question-format where they address search queries
- Every FAQ answer is self-contained (re-states context, not just "yes")
- Stats included in prose every ~200 words (number-rich text performs better in AI retrieval)
- Canonical URLs pre-set for `emeraldcavevegas.com` even while served from GitHub Pages
- `robots.txt` explicitly allows all major AI crawlers: GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot, Meta-ExternalAgent, Bytespider, etc.

---

## 7. Images and media

### Hero image

```
https://cdn.getyourguide.com/img/tour/63e8f0a3...jpeg/99.jpg
```

Hotlinked from GYG CDN. Also used as OG image in meta tags.

### GYG CDN image hotlinking

Images throughout the site and galleries are hotlinked from `cdn.getyourguide.com`. This works and is fast, but CDN URLs can rotate without notice if GYG changes their storage structure. If images break, check the source JSON for updated URLs:

```
C:\Users\trita\xDATA\ZHugo\_html\venicewatertaxitransfer\gyg_en_gbemerald_cave_l158722_34offers.json
```

The JSON has 412 unique image URLs across 34 offers. Images are in the `"images": []` array of each offer object.

### Local map files (in repo)

All 6 map webp files are in the repo root and tracked by git:

| File | Shows | Google Maps link in caption |
|---|---|---|
| `emerald-cave-arizona-zoom-out-map.webp` | Regional context | — |
| `emerald-cave-willow-beach-zoom-in-map.webp` | Willow Beach detail | — |
| `map-las-vegas-to-willow-beach.webp` | Driving route Las Vegas → marina | Yes |
| `map-us93-to-marina.webp` | Access road descent (4 mi) | Yes |
| `map-marina-to-emerald-cave.webp` | 2.2-mile paddle route | Yes |
| `map-hoover-dam-to-willow-beach.webp` | Full-day 12-mile route | Yes |

Source screenshots are in `C:\Users\trita\Dropbox\.........myfolder\LIMBO\` under their original names (with → characters). Copied to repo with clean hyphenated filenames.

### Google Maps iframe

Embedded in the maps section:

```
https://maps.google.com/maps?q=35.890861,-114.6855819&z=14&output=embed
```

No API key required. Coordinates target Emerald Cave directly.

### Favicon

`favicon.svg` — two-layer diamond (◆) in site colors. Outer ring `#a8ddd4`, inner diamond `#e8f4f1`, background `#1d5c4d`. Referenced in both HTML files as `<link rel="icon" type="image/svg+xml" href="favicon.svg">`.

---

## 8. Open-Meteo weather widget

### What it shows

Live conditions for Willow Beach, AZ (35.89°N, 114.69°W), fetched on page load:

- Current air temperature (°F and °C)
- Wind speed + compass direction (e.g. "14 mph SW")
- Wind gusts
- UV index
- Weather description (WMO code mapped to English)
- **Hourly wind bar chart** — next 7 hours, color-coded green/amber/red
- River temperature note: 54°F / 12°C year-round with explanation
- Paddling conditions verdict: Good / Caution / High wind
- "Updated at X:XX PM" timestamp

### Floating pill

`#conditionsPill` — fixed bottom-right. Appears after the facts bar scrolls out of view (IntersectionObserver). Shows pulsing dot + wind speed + verdict color. Clicking scrolls to the safety section.

### API endpoint

```
https://api.open-meteo.com/v1/forecast
  ?latitude=35.89
  &longitude=-114.69
  &current=temperature_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,uv_index,weathercode
  &hourly=wind_speed_10m,wind_direction_10m
  &wind_speed_unit=mph
  &temperature_unit=fahrenheit
  &timezone=America%2FPhoenix
  &forecast_days=1
```

Free tier, no API key, no rate limit for reasonable use.

### Verdict thresholds

| Wind speed | Class | Verdict |
|---|---|---|
| < 10 mph | `go` (green) | ✓ Good paddling conditions |
| 10–19 mph | `caution` (amber) | ⚠ Moderate wind — exercise caution |
| ≥ 20 mph | `hold` (red) | ✗ High wind — consider delaying |

### Error fallback

On fetch failure, displays: *"Weather data unavailable — check NWS forecast before paddling."* with a link to the NWS Willow Beach point forecast.

---

## 9. JavaScript features

All JS is in `script.js`, no external libraries.

| Feature | Description |
|---|---|
| Sticky header | Adds `.scrolled` class at 60px scroll |
| Mobile nav | Hamburger toggle with animated spans; closes on link click |
| FAQ accordion | One item open at a time; `aria-expanded` managed |
| Sortable table | `#compTable` — click column header to sort; `data-val` attribute used for numeric sort |
| Scroll reveal | IntersectionObserver adds `.visible` to `.reveal` elements as they enter viewport |
| Smooth scroll | `a[href^="#"]` — offset by 72px for sticky header height |
| Weather widget | Open-Meteo fetch, WMO code map, hourly bar chart, floating pill |
| Gallery drag-scroll | Mouse drag on `.scroll-gallery` elements |

---

## 10. Adding and editing content

### Add a new FAQ item

In `index.html`, copy a `<div class="faq-item">` block and fill in the question/answer. Then add a matching `{"@type": "Question", ...}` entry to the `FAQPage` schema in `<head>`.

### Add an operator to the comparison table

1. In `operators.html`, add a `<tr>` to the `<tbody>` in `#compTable` — follow the existing pattern with `data-val` on sortable columns.
2. Add an `.op-entry` prose block in `#detail` with image, meta-row, and description.
3. Update the `ItemList` schema in `operators.html` `<head>` — increment `numberOfItems` and add a `ListItem`.
4. Optionally add a bullet to the teaser list in `index.html #operators`.

### Add a new map

1. Take screenshot in Google Maps satellite view, export as webp.
2. Copy to repo folder with clean hyphenated filename.
3. Add a `<figure class="map-fig">` in the maps section of `index.html`.
4. Stage and push.

### Update prices / ratings

Prices and ratings are hardcoded in the HTML table and operator profiles. Review annually (or when notified of changes). Update `dateModified` in the Article schema and the "Last updated" timestamp in the methodology sections.

### Add GYG images to a gallery

Pull image URLs from the source JSON:
```
C:\Users\trita\xDATA\ZHugo\_html\venicewatertaxitransfer\gyg_en_gbemerald_cave_l158722_34offers.json
```
Each offer has an `"images": []` array. Add `<img>` tags inside any `.scroll-gallery` div.

---

## 11. Deployment workflow

### Standard change

```bash
# edit files
git add <changed files>
git commit -m "description"
git push origin master
```

GitHub Pages deploys in ~2 minutes. Netlify deploys in ~1 minute.

### Adding binary files (images, webp)

PowerShell copy with clean destination filename (avoids Bash failures on the Cyrillic/special-char path):

```powershell
$src = "C:\Users\trita\Dropbox\.........myfolder\LIMBO"
$dst = "C:\Users\trita\Dropbox\.........myfolder\LIMBO\emeraldcavevegas.com"
Copy-Item "$src\source file name.webp" "$dst\clean-name.webp"
```

Then `git add` and commit as normal.

### Pointing DNS to emeraldcavevegas.com

When ready to go live on the real domain:

1. In domain registrar DNS: add `CNAME emeraldcavevegas.com → tritaya.github.io`
   (or A records pointing to GitHub Pages IPs)
2. In GitHub repo Settings → Pages → Custom domain: enter `emeraldcavevegas.com`
3. GitHub will generate an HTTPS certificate automatically (Let's Encrypt, ~minutes)
4. Canonical URLs, OG tags, sitemap, and schema are already pre-set to `https://emeraldcavevegas.com/` — no code changes needed

---

## 12. Known issues and gotchas

### Bash + Cyrillic path failure

The repo lives under `C:\Users\trita\Dropbox\.........myfolder\LIMBO\emeraldcavevegas.com`. The path contains special characters. Bash `cd` to this path fails silently before any command runs. **Never use `cd` in Bash tool calls.** Use absolute paths in all commands, or use PowerShell for file operations.

### Netlify UI overrides netlify.toml

Netlify has two layers of config: the UI (Site settings → Build & deploy) and `netlify.toml`. The UI takes precedence for the `commandOrigin` field. If the Netlify UI still has a non-empty Build command or Publish directory from a previous project, it will override the blank settings in `netlify.toml` and the build will fail. Both must be blank.

### GitHub Pages path prefix

GitHub Pages serves the site at `https://tritaya.github.io/emeraldcavevegas.com/` (with subdirectory). All asset references in HTML are relative (e.g. `href="styles.css"`, `src="favicon.svg"`) so they resolve correctly under the subdirectory. Do not use absolute paths like `/styles.css` — these would break on GitHub Pages.

### GYG CDN image availability

Images hotlinked from `cdn.getyourguide.com` are served without authentication. If GYG rotates their storage URLs, hotlinked images will break. No fix needed until it happens — just update URLs from the source JSON.

### Google Maps iframe HTTPS

The iframe `src` uses `https://maps.google.com/maps?...&output=embed`. This works without an API key. Do not switch to the Maps JavaScript API embed — it requires billing setup and a key.

### Schema dateModified

The `Article` schema has `"dateModified": "2026-04-27"`. Update this whenever substantive content changes are made. It signals freshness to Google and AI crawlers.

---

## 13. Research source files

| File | Contents |
|---|---|
| `emerald-cave-vegas/report.md` | Full 17-operator research report with detailed fields for each operator |
| `emerald-cave-vegas/results/Emerald_Cave_General_Info.json` | Destination data: geology, conditions, glow science, Reddit community insights on wind/crowds/sparkle effect |
| `emerald-cave-vegas/results/*.json` | Individual operator profiles (one file per operator) |
| `gyg_en_gbemerald_cave_l158722_34offers.json` | 34 GYG listings with images, ratings, prices, reviews, highlights, includes/excludes |
| `finance/MarinaHugo/geo-aeo-research.md` | GEO/AEO optimisation guidelines used when structuring content |

### Key Reddit insights (from Emerald_Cave_General_Info.json)

These are embedded in the site as community voice quotes:

- **Wind:** "First-person accounts report 40 mph gusts even in March on the return paddle."
- **3–4 pm sparkle:** "A distinct second glow window at 3–4 PM when the cave is in shade but the underwater floor is still sunlit — creates a 'sparkles on the ceiling' effect. Fewer tour groups, zero queue."
- **Crowd tip:** "Launch in the afternoon when tour groups are heading back — you get the cave mostly to yourself."

---

*Last updated: April 27, 2026*
