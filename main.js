/* ============================================================
   main.js — Landing page logic
   - YES / NO button (NO button runs away on hover/touch)
   - Candle blowing (Mic detection with calibration + debounce)
   - Sarcastic commentary on weak blowing
   - No emojis, clean pastel design
   ============================================================ */

/* ── State ───────────────────────────────────────────────── */
let candlesOut       = 0;
const TOTAL_CANDLES  = 3;
let isListening      = false;
let audioCtx         = null;
let analyser         = null;
let micStream        = null;
let noClickCount     = 0;
let sarcasticIdx     = 0;
let weakBlowStreak   = 0;
let sustainedBlowMs  = 0;
let lastBlowTime     = 0;
let micStartTime     = 0;
let blowCooldown     = false;

/* ── Page Entrance (Fade out veil) ────────────────────────── */
function dismissVeil() {
  const veil = document.getElementById('page-veil');
  if (veil) {
    veil.style.opacity = '0';
    setTimeout(() => { veil.style.pointerEvents = 'none'; }, 800);
  }
}
window.addEventListener('load', dismissVeil);
document.addEventListener('DOMContentLoaded', dismissVeil);
// Fallback in case load already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(dismissVeil, 50);
}

const sarcasticLines = [
  "bestie... that was barely a breath.",
  "the flame literally grew stronger. iconic.",
  "okay are you okay? do you need water?",
  "my grandma's dying breath was louder than that.",
  "BLOW. not breathe. B-L-O-W.",
  "the candles are JUDGING you right now.",
  "put the mic closer. unless your lungs gave up?",
  "scientifically impossible to be this bad at blowing."
];

const noTaunts = [
  "you've tried to escape <b>{n}</b> times",
  "still trying to click NO? respect the persistence",
  "girl. just click YES. <b>{n}</b> attempts wasted.",
  "that NO button is RUNNING for its LIFE ({n} attempts)",
  "okay at this point it's personal ({n} attempts)"
];

/* ── Countdown ───────────────────────────────────────────── */
function updateCountdown() {
  const target = new Date('2026-10-23T00:00:00');
  const now    = new Date();
  const diff   = target - now;

  if (diff <= 0) {
    ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '00';
    });
    return;
  }
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');

  if (daysEl) daysEl.textContent  = String(Math.floor(diff / 86400000)).padStart(2,'0');
  if (hoursEl) hoursEl.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2,'0');
  if (minsEl) minsEl.textContent  = String(Math.floor((diff % 3600000) / 60000)).padStart(2,'0');
  if (secsEl) secsEl.textContent  = String(Math.floor((diff % 60000) / 1000)).padStart(2,'0');
}
setInterval(updateCountdown, 1000);
updateCountdown();

/* ── NO Button — runs away ───────────────────────────────── */
const noBtn      = document.getElementById('no-btn');
const noCounter  = document.getElementById('no-counter');
const noCountEl  = document.getElementById('no-count');

function moveNo() {
  if (!noBtn) return;
  const margin = 40;
  const w = noBtn.offsetWidth  || 120;
  const h = noBtn.offsetHeight || 44;
  const maxX = window.innerWidth  - w - margin;
  const maxY = window.innerHeight - h - margin;
  const x = margin + Math.random() * Math.max(0, maxX - margin);
  const y = margin + Math.random() * Math.max(0, maxY - margin);

  noBtn.style.left = x + 'px';
  noBtn.style.top  = y + 'px';
  noBtn.style.transform = `rotate(${(Math.random() * 26 - 13).toFixed(1)}deg)`;

  noClickCount++;
  if (noCountEl) noCountEl.textContent = noClickCount;
  if (noCounter) {
    noCounter.classList.add('show');
    const taunt = noTaunts[Math.min(noClickCount - 1, noTaunts.length - 1)];
    noCounter.innerHTML = taunt.replace('{n}', `<b>${noClickCount}</b>`);
  }

  if (noClickCount >= 10) {
    showSarcasm("okay FINE. you win. loading it anyway.");
    setTimeout(() => handleYes(), 1800);
  }
}

if (noBtn) {
  noBtn.addEventListener('mouseenter', moveNo);
  noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveNo(); }, { passive: false });
  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    moveNo();
  });
}

/* ── YES button ──────────────────────────────────────────── */
function handleYes() {
  burstConfetti();
  showSarcasm("okay GREAT, finally. the candles have been waiting.");

  const yesSection    = document.getElementById('section-yesno');
  const candleSection = document.getElementById('section-candles');

  setTimeout(() => {
    if (yesSection) yesSection.classList.add('hidden');
    if (candleSection) candleSection.classList.remove('hidden');
  }, 600);
}

/* ── Confetti burst ──────────────────────────────────────── */
const CONFETTI_COLORS = ['#ffb3d4','#a8f0d8','#ffe699','#d4b8ff','#ffcba8','#a0d9ff','#b8f5c0','#ff9fb0'];

function burstConfetti() {
  const container = document.getElementById('confetti-container');
  if (!container) return;
  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = 6 + Math.random() * 10;
    piece.style.cssText = `
      left: ${10 + Math.random() * 80}%;
      width: ${size}px; height: ${size}px;
      background: ${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${1.5 + Math.random() * 2}s;
      animation-delay: ${Math.random() * 0.4}s;
    `;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

/* ── Sarcasm bubble ──────────────────────────────────────── */
let sarcasmTimer = null;
function showSarcasm(text) {
  const bubble = document.getElementById('sarcasm-bubble');
  if (!bubble) return;
  bubble.textContent = text;
  bubble.classList.add('show');
  clearTimeout(sarcasmTimer);
  sarcasmTimer = setTimeout(() => bubble.classList.remove('show'), 3500);
}

/* ── Candle click fallback ───────────────────────────────── */
document.querySelectorAll('.candle-wrap').forEach(candle => {
  candle.addEventListener('click', () => {
    const id = candle.id.split('-')[1];
    blowOutCandle(id, true);
  });
  candle.style.cursor = 'pointer';
  candle.title = 'click to extinguish candle';
});

/* ── Blow out a candle ───────────────────────────────────── */
function blowOutCandle(id, isManualClick = false) {
  const candle = document.getElementById(`candle-${id}`);
  if (!candle || candle.classList.contains('out')) return;

  const smoke = document.getElementById(`smoke-${id}`);
  if (smoke) {
    smoke.classList.add('puff');
    setTimeout(() => smoke.classList.remove('puff'), 2100);
  }

  candle.classList.add('out');
  candlesOut++;
  lastBlowTime = Date.now();
  blowCooldown = true;

  // Feedback
  if (candlesOut === 1) {
    showSarcasm(isManualClick ? "clicker detected. 1 down, 2 to go." : "nice! 1 down, 2 to go!");
  } else if (candlesOut === 2) {
    showSarcasm("almost there! one candle left!");
  } else if (candlesOut === TOTAL_CANDLES) {
    showSarcasm("ALL OUT! look at those lungs. taking you in...");
    stopListening();
    setTimeout(successTransition, 1300);
    return;
  }

  setTimeout(() => {
    blowCooldown = false;
  }, 1500); // 1.5s cooldown between candle blows so all 3 don't blow in 1 burst
}

/* ── Success → journey.html ──────────────────────────────── */
function successTransition() {
  burstConfetti();
  burstConfetti();
  const overlay = document.getElementById('success-overlay');
  if (overlay) {
    overlay.classList.add('visible');
    const h2 = overlay.querySelector('h2');
    const p = overlay.querySelector('p');
    if (h2) h2.textContent = "candles out! now let's travel through your story";
    if (p) p.textContent  = "taking you there...";
  }

  setTimeout(() => {
    const veil = document.getElementById('page-veil');
    if (veil) veil.classList.add('cover');
    setTimeout(() => {
      window.location.href = 'journey.html';
    }, 900);
  }, 1800);
}

/* ══════════════════════════════════════════════════════════
   MICROPHONE — Calibrated blow detection with debounce
   ══════════════════════════════════════════════════════════ */
async function startListening() {
  if (isListening) {
    stopListening();
    return;
  }

  const btn  = document.getElementById('mic-btn');
  const hint = document.getElementById('mic-hint');

  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
    });
    audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(micStream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.5;
    source.connect(analyser);

    isListening = true;
    micStartTime = Date.now();
    sustainedBlowMs = 0;
    blowCooldown = false;

    if (btn) btn.classList.add('listening');
    const btnText = document.getElementById('mic-btn-text');
    if (btnText) btnText.textContent = 'listening... blow now';
    if (hint) hint.textContent = 'BLOW directly towards your mic!';

    requestAnimationFrame(detectBlowLoop);

  } catch (err) {
    console.warn('Mic denied or unavailable:', err);
    if (hint) hint.textContent = 'mic unavailable — click each candle to blow them out!';
    if (btn) btn.disabled = true;
    showSarcasm("mic unavailable. click each candle to extinguish them!");
  }
}

function stopListening() {
  isListening = false;
  if (micStream) {
    micStream.getTracks().forEach(t => t.stop());
    micStream = null;
  }
  if (audioCtx && audioCtx.state !== 'closed') {
    audioCtx.close().catch(() => {});
    audioCtx = null;
  }
  const btn = document.getElementById('mic-btn');
  if (btn) btn.classList.remove('listening');
  const btnText = document.getElementById('mic-btn-text');
  if (btnText) btnText.textContent = 'tap & blow';
}

let lastCheckTime = performance.now();

function detectBlowLoop(now) {
  if (!isListening) return;

  const dt = now - lastCheckTime;
  lastCheckTime = now;

  // Wait 700ms after user clicks mic button to ignore initial click pop
  if (Date.now() - micStartTime < 700) {
    requestAnimationFrame(detectBlowLoop);
    return;
  }

  // Cooldown active after previous blow
  if (blowCooldown || candlesOut >= TOTAL_CANDLES) {
    sustainedBlowMs = 0;
    requestAnimationFrame(detectBlowLoop);
    return;
  }

  const buffer = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(buffer);

  // Breath wind noise is concentrated in 60Hz - 600Hz (first 30 bins with fftSize 512 at 44.1kHz)
  const breathBand = buffer.slice(1, 35);
  const avg = breathBand.reduce((a, b) => a + b, 0) / breathBand.length;

  if (avg > 48) {
    // Strong sound / blowing energy
    sustainedBlowMs += dt;
    // Require sustained blow for at least 160ms (not just an instantaneous tap)
    if (sustainedBlowMs >= 160) {
      sustainedBlowMs = 0;
      weakBlowStreak = 0;
      const nextCandle = getNextLitCandle();
      if (nextCandle) {
        blowOutCandle(nextCandle, false);
      }
    }
  } else if (avg > 18) {
    // Weak sound
    sustainedBlowMs = 0;
    weakBlowStreak += dt;
    if (weakBlowStreak >= 900) {
      // Weak blowing for almost a second -> trigger sarcasm!
      const msg = sarcasticLines[sarcasticIdx % sarcasticLines.length];
      showSarcasm(msg);
      sarcasticIdx++;
      weakBlowStreak = 0;
    }
  } else {
    sustainedBlowMs = 0;
  }

  if (candlesOut < TOTAL_CANDLES && isListening) {
    requestAnimationFrame(detectBlowLoop);
  }
}

function getNextLitCandle() {
  for (let i = 1; i <= 3; i++) {
    const c = document.getElementById(`candle-${i}`);
    if (c && !c.classList.contains('out')) return String(i);
  }
  return null;
}
