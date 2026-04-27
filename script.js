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
