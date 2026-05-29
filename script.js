/* ============================================================
   Emerald Cave Vegas — Interactions
   ============================================================ */

// ── STICKY HEADER ──────────────────────────────────────────
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── MOBILE NAV ─────────────────────────────────────────────
const toggle = document.querySelector('.nav-toggle');
const mobileNav = document.querySelector('.mobile-nav');

if (toggle && mobileNav) {
  toggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelectorAll('span').forEach((s, i) => {
      if (open) {
        if (i === 0) s.style.transform = 'rotate(45deg) translate(6px,6px)';
        if (i === 1) s.style.opacity = '0';
        if (i === 2) s.style.transform = 'rotate(-45deg) translate(6px,-6px)';
      } else {
        s.style.transform = '';
        s.style.opacity = '';
      }
    });
  });

  mobileNav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelectorAll('span').forEach(s => {
        s.style.transform = '';
        s.style.opacity = '';
      });
    })
  );
}

// ── FAQ ACCORDION ──────────────────────────────────────────
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-a');
    const open   = btn.getAttribute('aria-expanded') === 'true';

    // close all others
    document.querySelectorAll('.faq-q[aria-expanded="true"]').forEach(other => {
      if (other !== btn) {
        other.setAttribute('aria-expanded', 'false');
        other.closest('.faq-item').querySelector('.faq-a').classList.remove('open');
      }
    });

    btn.setAttribute('aria-expanded', String(!open));
    answer.classList.toggle('open', !open);
  });
});

// ── TABLE SORT ─────────────────────────────────────────────
const table = document.getElementById('compTable');
if (table) {
  const headers = table.querySelectorAll('th.sortable');
  headers.forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      const col  = parseInt(th.dataset.col, 10);
      const asc  = th.getAttribute('aria-sort') !== 'ascending';
      const tbody = table.querySelector('tbody');
      const rows  = Array.from(tbody.querySelectorAll('tr'));

      rows.sort((a, b) => {
        const aCell = a.cells[col];
        const bCell = b.cells[col];
        const aVal  = aCell.dataset.val !== undefined ? parseFloat(aCell.dataset.val) : aCell.textContent.replace(/[^0-9.]/g, '');
        const bVal  = bCell.dataset.val !== undefined ? parseFloat(bCell.dataset.val) : bCell.textContent.replace(/[^0-9.]/g, '');
        const aN = isNaN(aVal) ? 0 : aVal;
        const bN = isNaN(bVal) ? 0 : bVal;
        return asc ? bN - aN : aN - bN;
      });

      headers.forEach(h => h.removeAttribute('aria-sort'));
      th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');
      rows.forEach(r => tbody.appendChild(r));
    });
  });
}

// ── SCROLL REVEAL ──────────────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll([
  '.dest-card',
  '.pick-item',
  '.op-card',
  '.choose-item',
  '.safety-item',
  '.review-card',
  '.photo-tip',
  '.practical-block',
  '.stats-bar',
].join(',')).forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  observer.observe(el);
});

// ── OPEN-METEO WEATHER WIDGET ──────────────────────────────
const weatherEl = document.getElementById('weatherWidget');
const pill      = document.getElementById('conditionsPill');

function degToCompass(d) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(d / 45) % 8];
}
function fToC(f) { return Math.round((f - 32) * 5 / 9); }
function verdictClass(w) {
  return w < 10 ? 'go' : w < 20 ? 'caution' : 'hold';
}
function verdictText(w) {
  if (w < 10)  return '✓ Good paddling conditions';
  if (w < 20)  return '⚠ Moderate wind — exercise caution';
  return '✗ High wind — consider delaying';
}

const WMO = {
  0:'Clear sky', 1:'Mainly clear', 2:'Partly cloudy', 3:'Overcast',
  45:'Fog', 48:'Icy fog', 51:'Light drizzle', 53:'Drizzle', 55:'Heavy drizzle',
  61:'Light rain', 63:'Rain', 65:'Heavy rain', 71:'Light snow', 73:'Snow', 75:'Heavy snow',
  77:'Snow grains', 80:'Light showers', 81:'Showers', 82:'Heavy showers',
  85:'Snow showers', 86:'Heavy snow showers', 95:'Thunderstorm',
  96:'Thunderstorm + hail', 99:'Thunderstorm + heavy hail'
};

if (weatherEl) {
  fetch('https://api.open-meteo.com/v1/forecast?latitude=35.89&longitude=-114.69' +
    '&current=temperature_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,uv_index,weathercode' +
    '&hourly=wind_speed_10m,wind_direction_10m' +
    '&wind_speed_unit=mph&temperature_unit=fahrenheit&timezone=America%2FPhoenix&forecast_days=1')
    .then(r => r.json())
    .then(d => {
      const c     = d.current;
      const wind  = Math.round(c.wind_speed_10m);
      const gusts = Math.round(c.wind_gusts_10m);
      const dir   = degToCompass(c.wind_direction_10m);
      const uv    = Math.round(c.uv_index);
      const tempF = Math.round(c.temperature_2m);
      const tempC = fToC(tempF);
      const desc  = WMO[c.weathercode] || 'Variable';
      const now   = new Date().toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit', timeZone:'America/Phoenix'});
      const vCls  = verdictClass(wind);
      const vTxt  = verdictText(wind);

      // build hourly bar chart — find current hour index, show next 7 hrs
      const curHour = new Date(c.time).getHours();
      const hWinds  = d.hourly.wind_speed_10m;
      const hDirs   = d.hourly.wind_direction_10m;
      const hours   = [];
      for (let i = 0; i < 7; i++) {
        const idx = curHour + i;
        if (idx < hWinds.length) hours.push({ w: Math.round(hWinds[idx]), d: degToCompass(hDirs[idx]), h: idx });
      }
      const maxW = Math.max(...hours.map(h => h.w), 5);
      const fmtH = h => {
        const ampm = h >= 12 ? 'pm' : 'am';
        return (h % 12 || 12) + ampm;
      };
      const hourBars = hours.map((h, i) => {
        const pct   = Math.max(6, Math.round((h.w / maxW) * 100));
        const cls   = verdictClass(h.w);
        const label = i === 0 ? 'Now' : fmtH(h.h);
        return `<div class="wind-hour">
          <div class="wind-bar-wrap"><div class="wind-bar ${cls}" style="height:${pct}%"></div></div>
          <span class="wind-hour-val">${h.w}</span>
          <span class="wind-hour-time">${label}</span>
        </div>`;
      }).join('');

      weatherEl.classList.add('loaded');
      weatherEl.innerHTML = `
        <div class="weather-header">
          <span class="weather-title">
            Conditions at Willow Beach, AZ
            <span class="live-badge"><span class="live-dot"></span> Live</span>
          </span>
          <span class="weather-updated">Updated ${now}</span>
        </div>
        <div class="weather-body">
          <div class="weather-main">
            <span class="weather-temp">${tempF}°F <span class="weather-temp-c">/ ${tempC}°C</span></span>
            <span class="weather-desc">${desc}</span>
            <span class="weather-verdict verdict-${vCls}">${vTxt}</span>
          </div>
          <div>
            <div class="weather-stats">
              <div class="weather-stat">
                <span class="weather-stat-n">${wind} mph ${dir}</span>
                <span class="weather-stat-l">Wind</span>
              </div>
              <div class="weather-stat">
                <span class="weather-stat-n">${gusts} mph</span>
                <span class="weather-stat-l">Gusts</span>
              </div>
              <div class="weather-stat">
                <span class="weather-stat-n">UV ${uv}</span>
                <span class="weather-stat-l">UV Index</span>
              </div>
            </div>
            <p class="wind-hours-label">Wind forecast — next 7 hours (mph)</p>
            <div class="wind-hours">${hourBars}</div>
          </div>
        </div>
        <div class="river-note">
          <strong>River: 54°F / 12°C year-round</strong> — water is drawn from the bottom of Lake Mead through Hoover Dam's penstocks, not the sun-warmed surface. The river stays cold regardless of air temperature. Cold-shock risk on capsize even in summer heat.
        </div>`;

      // populate floating pill
      if (pill) {
        pill.querySelector('.pill-dot').className = `pill-dot ${vCls}`;
        pill.querySelector('.pill-wind').textContent = `${wind} mph ${dir}`;
        pill.style.display = 'flex';
      }
    })
    .catch(() => {
      if (weatherEl) weatherEl.innerHTML = '<span class="weather-loading">Weather data unavailable — <a href="https://forecast.weather.gov/MapClick.php?CityName=Willow+Beach&state=AZ" target="_blank" rel="noopener noreferrer">check NWS forecast</a> before paddling.</span>';
    });
}

// show pill after scrolling past hero
if (pill) {
  const heroEnd = document.querySelector('.facts-bar');
  const obs = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting && weatherEl && weatherEl.classList.contains('loaded'))
      pill.style.display = 'flex';
    else
      pill.style.display = 'none';
  }, { threshold: 0 });
  if (heroEnd) obs.observe(heroEnd);
}

// ── GALLERY DRAG-SCROLL ─────────────────────────────────────
document.querySelectorAll('.scroll-gallery').forEach(g => {
  let isDown = false, startX, scrollLeft;
  g.addEventListener('mousedown', e => {
    isDown = true; startX = e.pageX - g.offsetLeft; scrollLeft = g.scrollLeft;
  });
  g.addEventListener('mouseleave', () => isDown = false);
  g.addEventListener('mouseup',    () => isDown = false);
  g.addEventListener('mousemove',  e => {
    if (!isDown) return;
    e.preventDefault();
    g.scrollLeft = scrollLeft - (e.pageX - g.offsetLeft - startX);
  });
});

// ── SMOOTH SCROLL (fallback for older browsers) ─────────────
// Scoped to in-page anchors only. .vlink (affiliate links) have no href, so
// they're untouched here — handled by the affiliate click handler below.
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 72;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});

// ── AFFILIATE LINK HANDLER (.vlink) ─────────────────────────
// Affiliate URLs are base64-encoded in data-vurl rather than written as plain
// hrefs — keeps the outbound-affiliate footprint out of the static HTML
// (mirrors the besttimetovisit DestinationMap pattern). The whole card (and
// the map popup CTA) is clickable; this decodes and opens in a new tab.
// Registered globally so it also covers popups injected later by Leaflet.
function openVlink(target) {
  if (!target || !target.dataset || !target.dataset.vurl) return;
  try {
    window.open(atob(target.dataset.vurl), '_blank', 'noopener,noreferrer');
  } catch (e) { /* swallow malformed token */ }
}
document.addEventListener('click', e => {
  const link = e.target.closest && e.target.closest('.vlink');
  if (!link) return;
  e.preventDefault();
  openVlink(link);
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const link = e.target.closest && e.target.closest('.vlink');
  if (!link) return;
  e.preventDefault();
  openVlink(link);
});

// ── EMERALD CAVE LEAFLET MAP ────────────────────────────────
// Cave-centric orientation map: hand-set POI coordinates (the bookable Viator
// tours geocode to the Vegas pickup point ~36 mi away, so they're surfaced as
// the list above instead of map markers). Leaflet + OpenStreetMap, no API key.
// Lazy-loaded from CDN only when the map scrolls into view — saves ~140 KB on
// bounces. Matches the besttimetovisit DestinationMap loader.
(function () {
  const el = document.getElementById('ecMap');
  if (!el) return;

  const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  const LEAFLET_JS  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

  // Accurate, hand-set landmark coordinates (NOT from Viator).
  const POIS = [
    { lat: 35.890861, lon: -114.6855819, kind: 'cave',   icon: '◆',
      title: 'Emerald Cave', sub: 'The destination — 2.2 mi upstream of Willow Beach. Peak glow 10am–2pm.', cta: true },
    { lat: 35.8677,    lon: -114.6705,    kind: 'launch', icon: '🛶',
      title: 'Willow Beach Marina', sub: 'The only public launch. DIY kayak/SUP rentals from $65/day; guided-tour put-in.' },
    { lat: 35.9756,    lon: -114.7290,    kind: 'spring', icon: '♨',
      title: 'Arizona Hot Springs', sub: 'Geothermal pools upstream — included on some full-day Hoover Dam tours.' },
    { lat: 36.0161,    lon: -114.7377,    kind: 'dam',    icon: '🏞',
      title: 'Hoover Dam', sub: 'Full-day tours launch here (NPS-authorized operators only) for the 12-mile run.' },
  ];

  // Approximate paddle route, Willow Beach → Emerald Cave (upstream, ~2.2 mi).
  const ROUTE = [
    [35.8677, -114.6705], [35.8745, -114.6720], [35.8810, -114.6790],
    [35.8862, -114.6835], [35.890861, -114.6855819],
  ];

  function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    return new Promise((resolve, reject) => {
      const css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = LEAFLET_CSS; document.head.appendChild(css);
      const s = document.createElement('script');
      s.src = LEAFLET_JS;
      s.onload = () => resolve(window.L);
      s.onerror = () => reject(new Error('Leaflet failed to load'));
      document.head.appendChild(s);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function initMap() {
    if (el.dataset.initialized) return;
    el.dataset.initialized = '1';
    loadLeaflet().then(L => {
      const map = L.map(el, { scrollWheelZoom: false }).setView([35.928, -114.69], 12);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Paddle route line.
      L.polyline(ROUTE, { color: '#1d5c4d', weight: 4, opacity: 0.85, dashArray: '1,8', lineCap: 'round' }).addTo(map);

      // Top Viator tour's affiliate token (base64) for the cave-marker CTA —
      // reuse the first list card so there's a single source of truth.
      const topTour = document.querySelector('.ec-tour');
      const topVurl = topTour ? topTour.getAttribute('data-vurl') : null;

      const group = L.featureGroup();
      POIS.forEach(p => {
        const m = L.marker([p.lat, p.lon], {
          icon: L.divIcon({
            className: '',
            html: '<span class="ec-pin ec-pin-' + p.kind + '">' + p.icon + '</span>',
            iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -16],
          }),
        });
        const ctaHtml = (p.cta && topVurl)
          ? '<a class="vlink ec-pop-cta" data-vurl="' + topVurl + '" role="link" rel="sponsored nofollow noopener" tabindex="0">Book a kayak tour →</a>'
          : '';
        m.bindPopup(
          '<div class="ec-pop"><strong class="ec-pop-title">' + escapeHtml(p.title) + '</strong>' +
          '<span class="ec-pop-sub">' + escapeHtml(p.sub) + '</span>' + ctaHtml + '</div>',
          { maxWidth: 240, minWidth: 200 }
        );
        m.addTo(group);
      });
      group.addTo(map);

      const b = group.getBounds();
      if (b.isValid()) map.fitBounds(b.pad(0.18), { maxZoom: 13 });
      map.once('click', () => map.scrollWheelZoom.enable());
    }).catch(() => {
      el.innerHTML = '<p class="tm-mapfail">Map unavailable — Emerald Cave is at 35.8909°N, 114.6856°W, ' +
        '2.2 mi upstream of Willow Beach Marina. <a href="#maps">See the static maps below.</a></p>';
    });
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { initMap(); io.unobserve(e.target); } });
    }, { rootMargin: '200px' });
    io.observe(el);
  } else {
    initMap();
  }
})();
