/* ============================================================
   journey.js — Horizontal bee trail scroll & chapter mechanics
   - Horizontal drag, wheel, and keyboard scrolling
   - SVG path-following animated bee
   - Chapter stops reveal at precise scroll percentages
   - Yellow horizontal egg cracking animation
   - Video chapter with audio pause & resume
   - Harry Potter, Genshin, and Spider-Man themed chapters
   - Spider-Man carousel slider
   - Letter modal overlay (music continues playing uninterrupted)
   - October 23 countdown
   ============================================================ */

const wrap         = document.getElementById('journey-wrap');
const inner        = document.getElementById('journey-inner');
const bee          = document.getElementById('bee');
const trail        = document.getElementById('bee-trail');
const progressPath = document.getElementById('bee-trail-progress');
const scrollHint   = document.getElementById('scroll-hint');
const dots         = document.querySelectorAll('.ch-dot');
const letterOverlay= document.getElementById('letter-overlay');
const videoModal   = document.getElementById('video-modal');
const videoPlayer  = document.getElementById('chapter-video-player');

let pathLength = 0;
let wasSongPlayingBeforeVideo = false;

/* ── Page Entrance ────────────────────────────────────────── */
window.addEventListener('load', () => {
  const veil = document.getElementById('page-veil');
  if (veil) {
    requestAnimationFrame(() => {
      veil.style.opacity = '0';
      setTimeout(() => { veil.style.pointerEvents = 'none'; }, 800);
    });
  }

  // Check file protocol warning
  if (window.location.protocol === 'file:') {
    const warn = document.getElementById('protocol-warn');
    if (warn) warn.style.display = 'block';
  }

  if (trail) {
    pathLength = trail.getTotalLength();
    if (progressPath) {
      progressPath.style.strokeDasharray  = pathLength;
      progressPath.style.strokeDashoffset = pathLength;
    }
    placeBee(0);
  }
});

/* ── Start Journey ────────────────────────────────────────── */
function startJourney() {
  const prompt = document.getElementById('music-prompt');
  if (prompt) prompt.classList.add('hidden');

  revealElement('title-0');

  // Start music on user interaction
  if (typeof togglePlay === 'function' && typeof isAudioPlaying !== 'undefined' && !isAudioPlaying) {
    togglePlay();
  }

  // On mobile screens, auto-collapse the player so the bee trail and story are fully clear
  const player = document.getElementById('vinyl-player');
  if (player && window.innerWidth <= 768) {
    player.classList.add('collapsed');
    const toggleBtn = document.getElementById('player-toggle');
    if (toggleBtn) toggleBtn.textContent = '▲';
  }
}
window.startJourney = startJourney;

/* ── Horizontal Scroll via Wheel ─────────────────────────── */
if (wrap) {
  wrap.addEventListener('wheel', (e) => {
    e.preventDefault();
    wrap.scrollLeft += e.deltaY + e.deltaX;
  }, { passive: false });
}

/* ── Drag to Scroll ──────────────────────────────────────── */
let isDragging = false, dragStartX = 0, scrollStartL = 0;

if (wrap) {
  wrap.addEventListener('mousedown', (e) => {
    isDragging   = true;
    dragStartX   = e.pageX - wrap.offsetLeft;
    scrollStartL = wrap.scrollLeft;
    wrap.style.cursor = 'grabbing';
  });

  wrap.addEventListener('mouseleave', () => {
    isDragging = false;
    wrap.style.cursor = 'grab';
  });

  wrap.addEventListener('mouseup', () => {
    isDragging = false;
    wrap.style.cursor = 'grab';
  });

  wrap.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - wrap.offsetLeft;
    wrap.scrollLeft = scrollStartL - (x - dragStartX);
  });

  // Touch Support
  let touchStartX = 0, touchScrollL = 0;
  wrap.addEventListener('touchstart', (e) => {
    touchStartX  = e.touches[0].pageX;
    touchScrollL = wrap.scrollLeft;
  }, { passive: true });

  wrap.addEventListener('touchmove', (e) => {
    const dx = touchStartX - e.touches[0].pageX;
    wrap.scrollLeft = touchScrollL + dx;
  }, { passive: true });
}

/* ── Scroll Stops & Progress Mapping ─────────────────────── */
const STOPS = [
  { id: 'stop-1',     pct: 0.12, chapter: 1 }, // Chapter 1: Yellow Egg
  { id: 'stop-2',     pct: 0.26, chapter: 2 }, // Chapter 2: Gol Gappay Video
  { id: 'stop-3',     pct: 0.42, chapter: 3 }, // Chapter 3: Harry Potter
  { id: 'stop-4',     pct: 0.58, chapter: 4 }, // Chapter 4: Genshin Impact
  { id: 'stop-5',     pct: 0.74, chapter: 5 }, // Chapter 5: Spider-Man Carousel
  { id: 'stop-final', pct: 0.88, chapter: 6 }  // Chapter 6: Final Stop
];

const revealed = new Set();

if (wrap) {
  wrap.addEventListener('scroll', onScroll);
}

function onScroll() {
  const maxScroll = wrap.scrollWidth - wrap.clientWidth;
  if (maxScroll <= 0) return;

  const pct = Math.min(Math.max(wrap.scrollLeft / maxScroll, 0), 1);

  // On mobile view, collapse open player when user scrolls through the journey
  if (window.innerWidth <= 768 && wrap.scrollLeft > 20) {
    const player = document.getElementById('vinyl-player');
    if (player && !player.classList.contains('collapsed')) {
      player.classList.add('collapsed');
      const toggleBtn = document.getElementById('player-toggle');
      if (toggleBtn) toggleBtn.textContent = '▲';
    }
  }

  placeBee(pct);

  if (pathLength > 0 && progressPath) {
    progressPath.style.strokeDashoffset = pathLength * (1 - pct);
  }

  // Trigger reveals
  STOPS.forEach(stop => {
    if (pct >= stop.pct && !revealed.has(stop.id)) {
      revealed.add(stop.id);
      revealElement(stop.id);
      updateChapterDot(stop.chapter);

      // Chapter 1: Auto-trigger horizontal egg crack so picture flows out
      if (stop.id === 'stop-1') {
        setTimeout(() => {
          const egg = document.getElementById('egg-card');
          if (egg) egg.classList.add('cracked');
        }, 400);
      }
    }
  });

  if (wrap.scrollLeft > 60 && scrollHint) {
    scrollHint.classList.add('gone');
  }

  if (pct < 0.06) {
    updateChapterDot(0);
  }
}

/* ── Move Bee along SVG Path ─────────────────────────────── */
function placeBee(pct) {
  if (!pathLength || !trail || !bee) return;

  const safePct = Math.max(0, Math.min(1, pct));
  const dist    = safePct * pathLength;
  const pt      = trail.getPointAtLength(dist);

  const svgEl    = document.getElementById('trail-svg');
  if (!svgEl || !wrap) return;

  const svgRect  = svgEl.getBoundingClientRect();
  const wrapRect = wrap.getBoundingClientRect();

  const svgOffsetLeft = wrap.scrollLeft + svgRect.left - wrapRect.left;
  const svgOffsetTop  = wrap.scrollTop  + svgRect.top  - wrapRect.top;

  const beeX = svgOffsetLeft + pt.x;
  const beeY = svgOffsetTop  + pt.y;

  bee.style.left = beeX + 'px';
  bee.style.top  = beeY + 'px';
}

/* ── Reveal Elements ─────────────────────────────────────── */
function revealElement(id) {
  const el = document.getElementById(id);
  if (!el) return;
  setTimeout(() => el.classList.add('revealed'), 50);
}

/* ── Chapter Dot Indicators ──────────────────────────────── */
function updateChapterDot(idx) {
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
  });
}

/* ── Chapter 1: Horizontal Yellow Egg Cracking Toggle ────── */
function toggleEggCrack() {
  const egg = document.getElementById('egg-card');
  if (egg) egg.classList.toggle('cracked');
}
window.toggleEggCrack = toggleEggCrack;

/* ── Chapter 2: Video Modal & Audio Pause Mechanics ──────── */
function openChapterVideo() {
  // Pause background music when video plays so audio doesn't clash
  if (typeof isAudioPlaying !== 'undefined' && isAudioPlaying) {
    wasSongPlayingBeforeVideo = true;
    if (typeof togglePlay === 'function') {
      togglePlay();
    }
  } else {
    wasSongPlayingBeforeVideo = false;
  }

  if (videoModal) {
    videoModal.classList.add('open');
    if (videoPlayer) {
      videoPlayer.play().catch(() => {});
    }
  }
}

function closeChapterVideo() {
  if (videoModal) {
    videoModal.classList.remove('open');
    if (videoPlayer) {
      videoPlayer.pause();
    }
  }

  // Resume background song if it was playing before
  if (wasSongPlayingBeforeVideo && typeof isAudioPlaying !== 'undefined' && !isAudioPlaying) {
    if (typeof togglePlay === 'function') {
      togglePlay();
    }
  }
}

window.openChapterVideo = openChapterVideo;
window.closeChapterVideo = closeChapterVideo;

/* ── Chapter 5: Spider-Man Carousel Slider ───────────────── */
let currentSlide = 0;
const TOTAL_SLIDES = 5;

function updateCarousel() {
  const track = document.getElementById('carousel-track');
  const indicator = document.getElementById('carousel-indicator');
  if (track) {
    track.style.transform = `translateX(-${currentSlide * 250}px)`;
  }
  if (indicator) {
    indicator.textContent = `photo ${currentSlide + 1} of ${TOTAL_SLIDES}`;
  }
}

function nextCarouselSlide(e) {
  if (e) e.stopPropagation();
  currentSlide = (currentSlide + 1) % TOTAL_SLIDES;
  updateCarousel();
}

function prevCarouselSlide(e) {
  if (e) e.stopPropagation();
  currentSlide = (currentSlide - 1 + TOTAL_SLIDES) % TOTAL_SLIDES;
  updateCarousel();
}

window.nextCarouselSlide = nextCarouselSlide;
window.prevCarouselSlide = prevCarouselSlide;

/* ── Letter Overlay Modal (Music NEVER stops!) ─────────────── */
function openLetter() {
  // Explicitly ensure music continues playing without any interruption
  if (letterOverlay) letterOverlay.classList.add('open');
}

function closeLetter() {
  if (letterOverlay) letterOverlay.classList.remove('open');
}

window.openLetter = openLetter;
window.closeLetter = closeLetter;

/* ── October 23rd Countdown ──────────────────────────────── */
function updateFinalCountdown() {
  const el = document.getElementById('final-countdown');
  if (!el) return;

  const target = new Date('2026-10-23T00:00:00');
  const now    = new Date();
  const diff   = target - now;

  if (diff <= 0) {
    el.textContent = 'today is the day!';
    return;
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  el.textContent = `${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s to go`;
}
setInterval(updateFinalCountdown, 1000);
updateFinalCountdown();

/* ── Keyboard Arrow Navigation ───────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    wrap?.scrollBy({ left: 240, behavior: 'smooth' });
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    wrap?.scrollBy({ left: -240, behavior: 'smooth' });
  } else if (e.key === 'Escape') {
    closeLetter();
    closeChapterVideo();
  }
});

/* ── Resize Handler ──────────────────────────────────────── */
window.addEventListener('resize', () => {
  if (trail) pathLength = trail.getTotalLength();
  const maxScroll = wrap ? (wrap.scrollWidth - wrap.clientWidth) : 0;
  const pct = (wrap && maxScroll > 0) ? (wrap.scrollLeft / maxScroll) : 0;
  placeBee(pct);
});
