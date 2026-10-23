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
const videoOverlay = document.getElementById('video-center-overlay');

let pathLength = 4074; // Pre-calculated accurate path length, refined dynamically
let wasSongPlayingBeforeVideo = false;

/* ── Immediate Trail & Bee Initialization (Never wait for heavy media!) ── */
function initTrail() {
  if (trail) {
    try {
      const len = trail.getTotalLength();
      if (len > 0) pathLength = len;
    } catch (e) {}
    if (progressPath) {
      progressPath.style.strokeDasharray  = pathLength;
      progressPath.style.strokeDashoffset = pathLength;
    }
    // Update bee position and trail progress immediately
    onScroll();
  }
}

function dismissVeil() {
  const veil = document.getElementById('page-veil');
  if (veil) {
    veil.style.opacity = '0';
    setTimeout(() => { veil.style.pointerEvents = 'none'; }, 800);
  }
  // Check file protocol warning
  if (window.location.protocol === 'file:') {
    const warn = document.getElementById('protocol-warn');
    if (warn) warn.style.display = 'block';
  }
}

// Run immediately as script is at bottom of body!
initTrail();
dismissVeil();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initTrail();
    dismissVeil();
  });
}
window.addEventListener('load', () => {
  initTrail();
  dismissVeil();
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
  { id: 'stop-1',     x: 720,  chapter: 1 }, // Chapter 1: Yellow Egg
  { id: 'stop-2',     x: 1380, chapter: 2 }, // Chapter 2: Gol Gappay Video
  { id: 'stop-3',     x: 2020, chapter: 3 }, // Chapter 3: Harry Potter
  { id: 'stop-4',     x: 2680, chapter: 4 }, // Chapter 4: Genshin Impact
  { id: 'stop-5',     x: 3360, chapter: 5 }, // Chapter 5: Spider-Man Carousel
  { id: 'stop-final', x: 4050, chapter: 6 }  // Chapter 6: Final Stop
];

const revealed = new Set();
let scrollRafId = null;

if (wrap) {
  wrap.addEventListener('scroll', () => {
    if (!scrollRafId) {
      scrollRafId = requestAnimationFrame(() => {
        onScroll();
        scrollRafId = null;
      });
    }
  }, { passive: true });
}

function onScroll() {
  if (!wrap) return;

  const scrollL = wrap.scrollLeft;
  const clientW = wrap.clientWidth;

  // On mobile view, collapse open player when user scrolls through the journey
  if (window.innerWidth <= 768 && scrollL > 20) {
    const player = document.getElementById('vinyl-player');
    if (player && !player.classList.contains('collapsed')) {
      player.classList.add('collapsed');
      const toggleBtn = document.getElementById('player-toggle');
      if (toggleBtn) toggleBtn.textContent = '▲';
    }
  }

  // Active focus point along the journey:
  // On mobile, the bee stays right in the visible area (60% across the viewport)
  // On desktop, 50% across the viewport
  const focusRatio = window.innerWidth <= 768 ? 0.60 : 0.50;
  const currentWorldX = scrollL + (clientW * focusRatio);

  // Trail path starts at x = 80, ends at x = 3980
  const trailStartX = 100;
  const trailEndX   = 3980;
  const beePct = Math.min(Math.max((currentWorldX - trailStartX) / (trailEndX - trailStartX), 0), 1);

  placeBee(beePct);

  if (pathLength > 0 && progressPath) {
    progressPath.style.strokeDashoffset = pathLength * (1 - beePct);
  }

  // Trigger reveals when stop enters visible screen
  STOPS.forEach(stop => {
    const enterViewportX = scrollL + clientW;
    if (enterViewportX >= stop.x + 40 && !revealed.has(stop.id)) {
      revealed.add(stop.id);
      revealElement(stop.id);

      // Chapter 1: Auto-trigger horizontal egg crack so picture flows out
      if (stop.id === 'stop-1') {
        setTimeout(() => {
          const egg = document.getElementById('egg-card');
          if (egg) egg.classList.add('cracked');
        }, 400);
      }
    }
  });

  // Update chapter dots based on closest stop to center of screen
  const centerWorldX = scrollL + (clientW * 0.5);
  if (scrollL < 220) {
    updateChapterDot(0);
  } else {
    let closestStop = STOPS[0];
    let minDiff = Math.abs(centerWorldX - STOPS[0].x);
    for (let i = 1; i < STOPS.length; i++) {
      const diff = Math.abs(centerWorldX - STOPS[i].x);
      if (diff < minDiff) {
        minDiff = diff;
        closestStop = STOPS[i];
      }
    }
    updateChapterDot(closestStop.chapter);
  }

  if (scrollL > 60 && scrollHint) {
    scrollHint.classList.add('gone');
  }
}

/* ── Move Bee along SVG Path ─────────────────────────────── */
function placeBee(pct) {
  if (!pathLength || !trail || !bee || !wrap) return;

  const safePct = Math.max(0, Math.min(1, pct));
  const dist    = safePct * pathLength;
  const pt      = trail.getPointAtLength(dist);

  // Use getBoundingClientRect relative to the scroll container
  // This correctly handles mobile, desktop, and any viewport size
  const svgEl   = document.getElementById('trail-svg');
  if (!svgEl) return;

  const svgRect  = svgEl.getBoundingClientRect();
  const wrapRect = wrap.getBoundingClientRect();

  // Translate SVG-local coordinates into journey-inner absolute coordinates
  const beeX = wrap.scrollLeft + (svgRect.left - wrapRect.left) + pt.x;
  const beeY = wrap.scrollTop  + (svgRect.top  - wrapRect.top)  + pt.y;

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
if (videoPlayer) {
  videoPlayer.addEventListener('play', () => {
    const overlay = document.getElementById('video-center-overlay');
    if (overlay) overlay.classList.add('hidden');
    // Ensure background music is paused
    if (typeof isAudioPlaying !== 'undefined' && isAudioPlaying) {
      wasSongPlayingBeforeVideo = true;
      if (typeof togglePlay === 'function') togglePlay();
    }
  });

  videoPlayer.addEventListener('pause', () => {
    const overlay = document.getElementById('video-center-overlay');
    if (overlay) overlay.classList.remove('hidden');
  });

  videoPlayer.addEventListener('ended', () => {
    const overlay = document.getElementById('video-center-overlay');
    if (overlay) overlay.classList.remove('hidden');
    if (wasSongPlayingBeforeVideo && typeof isAudioPlaying !== 'undefined' && !isAudioPlaying) {
      if (typeof togglePlay === 'function') togglePlay();
    }
  });
}

function toggleModalVideoPlay() {
  if (!videoPlayer) return;
  if (videoPlayer.paused) {
    const p = videoPlayer.play();
    if (p !== undefined) {
      p.then(() => {
        const overlay = document.getElementById('video-center-overlay');
        if (overlay) overlay.classList.add('hidden');
      }).catch(err => {
        console.warn('Play failed:', err);
      });
    }
  } else {
    videoPlayer.pause();
  }
}
window.toggleModalVideoPlay = toggleModalVideoPlay;

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
      if (!videoPlayer.src || !videoPlayer.src.includes('vid.mp4')) {
        videoPlayer.src = 'assets/images/vid.mp4';
      }
      const overlay = document.getElementById('video-center-overlay');
      const playPromise = videoPlayer.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          if (overlay) overlay.classList.add('hidden');
        }).catch((err) => {
          console.warn('Browser requires explicit tap to play with sound:', err);
          if (overlay) overlay.classList.remove('hidden');
        });
      }
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

/* ── October 23rd Wedding Timer (Since 1:25 PM) ──────────── */
function updateFinalCountdown() {
  const el = document.getElementById('final-countdown');
  if (!el) return;

  const weddingTime = new Date('2026-10-23T13:25:00');
  const now = new Date();
  const diff = now - weddingTime;

  if (diff >= 0) {
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    const dayStr = d > 0 ? `${d}d ` : '';
    el.textContent = `married for ${dayStr}${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s 💕`;
  } else {
    const remaining = Math.abs(diff);
    const h = Math.floor((remaining % 86400000) / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    el.textContent = `${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s until 1:25 PM`;
  }
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
