/* ============================================================
   journey.js — Horizontal bee trail scroll logic
   - Drag to scroll
   - Mouse wheel → horizontal scroll
   - Bee follows SVG path as user scrolls
   - Elements reveal when bee reaches them
   - Chapter dot progress
   - Final countdown
   ============================================================ */

const wrap  = document.getElementById('journey-wrap');
const inner = document.getElementById('journey-inner');
const bee   = document.getElementById('bee');
const trail = document.getElementById('bee-trail');
const progressPath = document.getElementById('bee-trail-progress');
const scrollHint   = document.getElementById('scroll-hint');
const dots         = document.querySelectorAll('.ch-dot');

let pathLength = 0;

/* ── Page fade-in ────────────────────────────────────────── */
window.addEventListener('load', () => {
  const veil = document.getElementById('page-veil');
  if (veil) {
    requestAnimationFrame(() => {
      veil.style.opacity = '0';
      setTimeout(() => { veil.style.pointerEvents = 'none'; }, 900);
    });
  }
  // Measure path length after render
  pathLength = trail.getTotalLength();
  // Set progress path to fully hidden initially
  progressPath.style.strokeDasharray  = pathLength;
  progressPath.style.strokeDashoffset = pathLength;
  // Place bee at start
  placeBee(0);
});

/* ── Start journey (from the start screen) ────────────────── */
function startJourney() {
  const prompt = document.getElementById('music-prompt');
  prompt.classList.add('hidden');
  // Reveal opener title
  revealElement('title-0');
  // Try to start music (user gesture happened — click)
  if (typeof togglePlay === 'function') togglePlay();
}

/* ── Convert vertical mouse-wheel to horizontal scroll ────── */
wrap.addEventListener('wheel', (e) => {
  e.preventDefault();
  wrap.scrollLeft += e.deltaY + e.deltaX;
}, { passive: false });

/* ── Drag scrolling ──────────────────────────────────────── */
let isDragging = false, dragStartX = 0, scrollStartL = 0;

wrap.addEventListener('mousedown', (e) => {
  isDragging  = true;
  dragStartX  = e.pageX - wrap.offsetLeft;
  scrollStartL = wrap.scrollLeft;
  wrap.style.cursor = 'grabbing';
});
wrap.addEventListener('mouseleave', () => { isDragging = false; wrap.style.cursor = 'grab'; });
wrap.addEventListener('mouseup',    () => { isDragging = false; wrap.style.cursor = 'grab'; });
wrap.addEventListener('mousemove',  (e) => {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.pageX - wrap.offsetLeft;
  wrap.scrollLeft = scrollStartL - (x - dragStartX);
});

/* ── Touch scrolling (mobile) ────────────────────────────── */
let touchStartX = 0, touchScrollL = 0;
wrap.addEventListener('touchstart', (e) => {
  touchStartX  = e.touches[0].pageX;
  touchScrollL = wrap.scrollLeft;
}, { passive: true });
wrap.addEventListener('touchmove', (e) => {
  const dx = touchStartX - e.touches[0].pageX;
  wrap.scrollLeft = touchScrollL + dx;
}, { passive: true });

/* ── Scroll handler — bee + reveals ──────────────────────── */
/* Map each stop to its approximate scroll % trigger */
const STOPS = [
  { id: 'stop-1',     pct: 0.12, chapter: 1 },
  { id: 'title-1',    pct: 0.14, chapter: 1 },
  { id: 'stop-2',     pct: 0.27, chapter: 2 },
  { id: 'title-2',    pct: 0.29, chapter: 2 },
  { id: 'stop-3a',    pct: 0.40, chapter: 3 },
  { id: 'title-3',    pct: 0.42, chapter: 3 },
  { id: 'stop-3b',    pct: 0.46, chapter: 3 },
  { id: 'stop-4',     pct: 0.58, chapter: 4 },
  { id: 'title-4',    pct: 0.60, chapter: 4 },
  { id: 'stop-5',     pct: 0.74, chapter: 5 },
  { id: 'title-5',    pct: 0.76, chapter: 5 },
  { id: 'stop-final', pct: 0.90, chapter: 6 },
];
const revealed = new Set();

wrap.addEventListener('scroll', onScroll);

function onScroll() {
  const maxScroll = wrap.scrollWidth - wrap.clientWidth;
  if (maxScroll <= 0) return;

  const pct = Math.min(wrap.scrollLeft / maxScroll, 1);

  // Move bee along SVG path
  placeBee(pct);

  // Animate progress path
  if (pathLength > 0) {
    progressPath.style.strokeDashoffset = pathLength * (1 - pct);
  }

  // Reveal elements
  STOPS.forEach(stop => {
    if (pct >= stop.pct && !revealed.has(stop.id)) {
      revealed.add(stop.id);
      revealElement(stop.id);
      updateChapterDot(stop.chapter);
    }
  });

  // Hide scroll hint after first real scroll
  if (wrap.scrollLeft > 80) scrollHint.classList.add('gone');

  // Update opener chapter dot
  if (pct < 0.05) updateChapterDot(0);
}

/* ── Place bee at position along SVG path ────────────────── */
function placeBee(pct) {
  if (!pathLength || !trail) return;

  // Clamp
  const safePct = Math.max(0, Math.min(1, pct));
  const dist = safePct * pathLength;
  const pt   = trail.getPointAtLength(dist);

  // The SVG is positioned at top:50% transform:translateY(-50%)
  // Its bounding rect tells us where the SVG is on screen relative to scroll container
  const svgEl = document.getElementById('trail-svg');
  const svgRect = svgEl.getBoundingClientRect();
  const wrapRect = wrap.getBoundingClientRect();

  // pt is in SVG coordinates (relative to SVG element's top-left)
  // We need position relative to #journey-inner (the scroll content)
  // SVG left edge in inner = wrap.scrollLeft + svgRect.left - wrapRect.left
  const svgOffsetLeft = wrap.scrollLeft + svgRect.left - wrapRect.left;
  const svgOffsetTop  = wrap.scrollTop  + svgRect.top  - wrapRect.top;

  const beeX = svgOffsetLeft + pt.x;
  const beeY = svgOffsetTop  + pt.y;

  bee.style.left = beeX + 'px';
  bee.style.top  = beeY + 'px';
}

/* ── Reveal an element ───────────────────────────────────── */
function revealElement(id) {
  const el = document.getElementById(id);
  if (!el) return;
  // Small stagger for nicer feel
  setTimeout(() => el.classList.add('revealed'), 50);
}

/* ── Update chapter progress dots ───────────────────────── */
function updateChapterDot(chapterIndex) {
  dots.forEach((d, i) => d.classList.toggle('active', i === chapterIndex));
}

/* ── Final countdown ─────────────────────────────────────── */
function updateFinalCountdown() {
  const el = document.getElementById('final-countdown');
  if (!el) return;

  const target = new Date('2026-10-23T00:00:00');
  const now    = new Date();
  const diff   = target - now;

  if (diff <= 0) {
    el.textContent = '🎊 today is the day!!';
    return;
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  el.textContent = `${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s to go ✨`;
}
setInterval(updateFinalCountdown, 1000);
updateFinalCountdown();

/* ── Keyboard arrow navigation ───────────────────────────── */
document.addEventListener('keydown', (e) => {
  const speed = 200;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    wrap.scrollBy({ left: speed, behavior: 'smooth' });
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    wrap.scrollBy({ left: -speed, behavior: 'smooth' });
  }
});

/* ── Recalculate on resize ────────────────────────────────── */
window.addEventListener('resize', () => {
  pathLength = trail.getTotalLength();
  const maxScroll = wrap.scrollWidth - wrap.clientWidth;
  const pct = maxScroll > 0 ? wrap.scrollLeft / maxScroll : 0;
  placeBee(pct);
});
