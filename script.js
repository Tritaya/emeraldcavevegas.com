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
if (weatherEl) {
  const WMO = {
    0:'Clear sky', 1:'Mainly clear', 2:'Partly cloudy', 3:'Overcast',
    45:'Fog', 48:'Icy fog', 51:'Light drizzle', 53:'Drizzle', 55:'Heavy drizzle',
    61:'Light rain', 63:'Rain', 65:'Heavy rain', 71:'Light snow', 73:'Snow', 75:'Heavy snow',
    77:'Snow grains', 80:'Light showers', 81:'Showers', 82:'Heavy showers',
    85:'Snow showers', 86:'Heavy snow showers', 95:'Thunderstorm',
    96:'Thunderstorm + hail', 99:'Thunderstorm + heavy hail'
  };
  fetch('https://api.open-meteo.com/v1/forecast?latitude=35.89&longitude=-114.69' +
    '&current=temperature_2m,wind_speed_10m,wind_gusts_10m,uv_index,weathercode' +
    '&wind_speed_unit=mph&temperature_unit=fahrenheit&timezone=America%2FPhoenix')
    .then(r => r.json())
    .then(d => {
      const c = d.current;
      const wind = Math.round(c.wind_speed_10m);
      const gusts = Math.round(c.wind_gusts_10m);
      const uv = Math.round(c.uv_index);
      const temp = Math.round(c.temperature_2m);
      const desc = WMO[c.weathercode] || 'Unknown';
      const now = new Date().toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit', timeZone:'America/Phoenix'});

      let vClass, vText;
      if (wind < 10)      { vClass = 'verdict-go';      vText = '✓ Good paddling conditions'; }
      else if (wind < 20) { vClass = 'verdict-caution'; vText = '⚠ Moderate wind — exercise caution'; }
      else                { vClass = 'verdict-hold';    vText = '✗ High wind — consider delaying'; }

      weatherEl.innerHTML = `
        <div class="weather-main">
          <span class="weather-temp">${temp}°F</span>
          <span class="weather-desc">${desc}</span>
        </div>
        <div class="weather-stats">
          <div class="weather-stat"><span class="weather-stat-n">${wind} mph</span><span class="weather-stat-l">Wind</span></div>
          <div class="weather-stat"><span class="weather-stat-n">${gusts} mph</span><span class="weather-stat-l">Gusts</span></div>
          <div class="weather-stat"><span class="weather-stat-n">UV ${uv}</span><span class="weather-stat-l">UV Index</span></div>
          <div class="weather-stat"><span class="weather-stat-n">54°F</span><span class="weather-stat-l">River (constant)</span></div>
          <span class="weather-verdict ${vClass}">${vText}</span>
        </div>
        <span class="weather-updated">Willow Beach, AZ · ${now}</span>`;
    })
    .catch(() => {
      weatherEl.innerHTML = '<span class="weather-loading">Weather data unavailable — check <a href="https://forecast.weather.gov/MapClick.php?CityName=Willow+Beach&state=AZ" target="_blank" rel="noopener noreferrer">NWS Willow Beach forecast</a> before paddling.</span>';
    });
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
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 72;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});
