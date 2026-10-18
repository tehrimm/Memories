/* ============================================================
   ASMA'S LOVE LETTER — Journey Page Script
   Scroll reveal · Parallax · Countdown · Chapter progress
   ============================================================ */

'use strict';

// ── Entrance: fade in (page came from candle transition) ──────
window.addEventListener('load', () => {
  const veil = document.getElementById('page-veil');
  if (veil) {
    veil.style.opacity = '1';
    veil.style.transition = 'opacity 1.6s ease';
    setTimeout(() => {
      veil.style.opacity = '0';
      setTimeout(() => { veil.style.pointerEvents = 'none'; }, 1700);
    }, 120);
  }
});

// ── Rose petals (soft, ambient) ───────────────────────────────
const PETAL_EMOJIS = ['🌸', '🌹', '✿', '❀', '🌺'];
const petalContainer = document.getElementById('petals-container');

function createPetal() {
  const p = document.createElement('div');
  p.classList.add('petal');
  p.textContent = PETAL_EMOJIS[Math.floor(Math.random() * PETAL_EMOJIS.length)];
  p.style.left              = Math.random() * 100 + 'vw';
  p.style.fontSize          = (7 + Math.random() * 7) + 'px';
  p.style.animationDuration = (10 + Math.random() * 12) + 's';
  p.style.animationDelay    = '-' + (Math.random() * 14) + 's';
  p.style.opacity           = 0.15 + Math.random() * 0.25;
  petalContainer.appendChild(p);
}
for (let i = 0; i < 16; i++) createPetal();

// ── Scroll Reveal ─────────────────────────────────────────────
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el    = entry.target;
    const delay = el.dataset.delay || '0';
    setTimeout(() => el.classList.add('revealed'), parseInt(delay));
    io.unobserve(el);
  });
}, { threshold: 0.10, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ── Polaroid parallax on mouse move ──────────────────────────
document.addEventListener('mousemove', e => {
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;

  document.querySelectorAll('.polaroid').forEach((p, i) => {
    const rect = p.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;
    const baseRot = parseFloat(p.dataset.rotate || '0');
    const str = 3 + (i % 4);
    p.style.transform = `rotate(${baseRot + dx * 1.2}deg) translate(${dx*str}px, ${dy*str}px)`;
  });
});

// ── Countdown (final chapter) ─────────────────────────────────
const NIKKAH = new Date('2026-10-23T00:00:00+05:00');
function pad(n) { return String(n).padStart(2, '0'); }

function tick() {
  const el = document.getElementById('journey-countdown');
  if (!el) return;
  const diff = NIKKAH - Date.now();
  if (diff <= 0) { el.textContent = 'today is the day ✨'; return; }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000)  / 60000);
  const s = Math.floor((diff % 60000)    / 1000);
  el.textContent = `${pad(d)} days  •  ${pad(h)} hrs  •  ${pad(m)} min  •  ${pad(s)} sec`;
}
tick(); setInterval(tick, 1000);

// ── Chapter progress dots ─────────────────────────────────────
const chapters = document.querySelectorAll('.chapter');
const dots     = document.querySelectorAll('.progress-dot');

new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const idx = [...chapters].indexOf(entry.target);
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  });
}, { threshold: 0.45 }).observe ? (() => {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = [...chapters].indexOf(entry.target);
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    });
  }, { threshold: 0.45 });
  chapters.forEach(ch => obs.observe(ch));
})() : null;
