/* ============================================================
   main.js — Landing page logic
   YES/NO, running NO button, sarcastic candle blowing
   ============================================================ */

/* ── State ───────────────────────────────────────────────── */
let candlesOut   = 0;
const TOTAL      = 3;
let isListening  = false;
let audioCtx, analyser, micStream;
let sarcasticIdx = 0;
let noClickCount = 0;
let weakBlowStreak = 0;

const sarcasticLines = [
  ["😐", "bestie... that was barely a breath."],
  ["💀", "the flame literally grew stronger. iconic."],
  ["🙄", "okay are you okay? do you need water?"],
  ["😒", "my grandma's dying breath was louder than that."],
  ["💁", "BLOW. not breathe. B-L-O-W."],
  ["😭", "the candles are JUDGING you right now."],
  ["🎤", "put the mic closer. unless your lungs gave up?"],
  ["🫠", "scientifically impossible to be this bad at blowing."],
];

const noTaunts = [
  "you've tried to escape <b>{n}</b> times 😭",
  "still trying to click NO? respect the persistence 💀",
  "girl. just click YES. <b>{n}</b> attempts wasted.",
  "that NO button is RUNNING for its LIFE ({n} attempts)",
  "okay at this point it's personal ({n} attempts lmaooo)",
];

/* ── Countdown ───────────────────────────────────────────── */
function updateCountdown() {
  const target = new Date('2026-10-23T00:00:00');
  const now    = new Date();
  const diff   = target - now;

  if (diff <= 0) {
    ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id => document.getElementById(id).textContent = '00');
    return;
  }
  document.getElementById('cd-days').textContent  = String(Math.floor(diff / 86400000)).padStart(2,'0');
  document.getElementById('cd-hours').textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2,'0');
  document.getElementById('cd-mins').textContent  = String(Math.floor((diff % 3600000) / 60000)).padStart(2,'0');
  document.getElementById('cd-secs').textContent  = String(Math.floor((diff % 60000) / 1000)).padStart(2,'0');
}
setInterval(updateCountdown, 1000);
updateCountdown();

/* ── NO Button — runs away ───────────────────────────────── */
const noBtn      = document.getElementById('no-btn');
const noCounter  = document.getElementById('no-counter');
const noCountEl  = document.getElementById('no-count');

function moveNo() {
  const margin = 30;
  const w = noBtn.offsetWidth  || 120;
  const h = noBtn.offsetHeight || 44;
  const maxX = window.innerWidth  - w - margin;
  const maxY = window.innerHeight - h - margin;
  const x = margin + Math.random() * Math.max(0, maxX - margin);
  const y = margin + Math.random() * Math.max(0, maxY - margin);

  noBtn.style.left = x + 'px';
  noBtn.style.top  = y + 'px';
  noBtn.style.transform = `rotate(${(Math.random() * 30 - 15).toFixed(1)}deg)`;

  noClickCount++;
  noCountEl.textContent = noClickCount;
  noCounter.classList.add('show');

  const taunt = noTaunts[Math.min(noClickCount - 1, noTaunts.length - 1)];
  noCounter.innerHTML = taunt.replace('{n}', `<b>${noClickCount}</b>`);

  if (noClickCount >= 10) {
    showSarcasm("🫡", "okay FINE. you win. loading it anyway.");
    setTimeout(() => handleYes(), 2000);
  }
}

noBtn.addEventListener('mouseenter', moveNo);
noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveNo(); }, { passive: false });
noBtn.addEventListener('click', () => {
  showSarcasm("🤯", "HOW. HOW DID YOU CLICK THAT.");
  setTimeout(() => handleYes(), 2000);
});

/* ── YES button ──────────────────────────────────────────── */
function handleYes() {
  burstConfetti();
  showSarcasm("🎉", "okay GREAT, finally. the candles have been waiting.");

  const yesSection    = document.getElementById('section-yesno');
  const candleSection = document.getElementById('section-candles');

  setTimeout(() => {
    yesSection.classList.add('hidden');
    candleSection.classList.remove('hidden');
  }, 800);
}

/* ── Confetti burst ──────────────────────────────────────── */
const CONFETTI_COLORS = ['#ffb3d4','#a8f0d8','#ffe699','#d4b8ff','#ffcba8','#a0d9ff','#b8f5c0','#ff9fb0'];

function burstConfetti() {
  const container = document.getElementById('confetti-container');
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = 6 + Math.random() * 10;
    piece.style.cssText = `
      left: ${10 + Math.random() * 80}%;
      width: ${size}px; height: ${size}px;
      background: ${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${1.5 + Math.random() * 2}s;
      animation-delay: ${Math.random() * 0.5}s;
    `;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

/* ── Sarcasm bubble ──────────────────────────────────────── */
let sarcasmTimer = null;
function showSarcasm(emoji, text) {
  const bubble = document.getElementById('sarcasm-bubble');
  bubble.textContent = `${emoji} ${text}`;
  bubble.classList.add('show');
  clearTimeout(sarcasmTimer);
  sarcasmTimer = setTimeout(() => bubble.classList.remove('show'), 3200);
}

/* ── Candle click fallback ───────────────────────────────── */
document.querySelectorAll('.candle-wrap').forEach(candle => {
  candle.addEventListener('click', () => blowOutCandle(candle.id.split('-')[1]));
  candle.style.cursor = 'pointer';
  candle.title = 'click to blow out!';
});

/* ── Blow out a candle ───────────────────────────────────── */
function blowOutCandle(id) {
  const candle = document.getElementById(`candle-${id}`);
  if (!candle || candle.classList.contains('out')) return;

  const smoke = document.getElementById(`smoke-${id}`);
  if (smoke) {
    smoke.classList.add('puff');
    setTimeout(() => smoke.classList.remove('puff'), 2100);
  }

  candle.classList.add('out');
  candlesOut++;

  if (candlesOut === TOTAL) {
    stopListening();
    setTimeout(successTransition, 1200);
  }
}

/* ── Success → journey.html ──────────────────────────────── */
function successTransition() {
  burstConfetti();
  burstConfetti();
  const overlay = document.getElementById('success-overlay');
  overlay.classList.add('visible');
  overlay.querySelector('h2').textContent = "okay bestie, now scroll through your story 🎀";
  overlay.querySelector('p').textContent  = "taking you there...";

  setTimeout(() => {
    const veil = document.getElementById('page-veil');
    veil.classList.add('cover');
    setTimeout(() => window.location.href = 'journey.html', 900);
  }, 1800);
}

/* ══════════════════════════════════════════════════════════
   MICROPHONE — blow detection
══════════════════════════════════════════════════════════ */
async function startListening() {
  if (isListening) { stopListening(); return; }

  const btn  = document.getElementById('mic-btn');
  const hint = document.getElementById('mic-hint');

  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(micStream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.6;
    source.connect(analyser);

    isListening = true;
    btn.classList.add('listening');
    document.getElementById('mic-btn-text').textContent = 'listening... 🎙️';
    hint.textContent = 'now BLOW towards your screen!';
    detectBlow();

  } catch (err) {
    console.warn('Mic denied:', err);
    hint.textContent = 'mic unavailable — click the candles instead! 🕯️';
    btn.disabled = true;
    showSarcasm("😶", "mic denied. click the candles like a normal person.");
  }
}

function stopListening() {
  isListening = false;
  if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
  if (audioCtx && audioCtx.state !== 'closed') { audioCtx.close(); audioCtx = null; }
  const btn = document.getElementById('mic-btn');
  btn.classList.remove('listening');
  document.getElementById('mic-btn-text').textContent = 'tap & blow 💨';
}

function detectBlow() {
  if (!isListening) return;

  const buffer = new Uint8Array(analyser.fftSize);
  analyser.getByteFrequencyData(buffer);

  // Average low-frequency energy — breath is mostly 100–800 Hz
  const lowBand = buffer.slice(0, 80);
  const avg = lowBand.reduce((a, b) => a + b, 0) / lowBand.length;

  if (avg > 32) {
    // Strong blow
    weakBlowStreak = 0;
    const next = getNextLitCandle();
    if (next) {
      blowOutCandle(next);
      if (candlesOut < TOTAL) showSarcasm("💨", "one down! keep going!");
    }
  } else if (avg > 14) {
    // Medium — almost
    weakBlowStreak++;
    if (weakBlowStreak === 3) {
      showSarcasm("😮‍💨", "getting there... a little harder!");
      weakBlowStreak = 0;
    }
  } else if (avg > 5) {
    // Too weak
    weakBlowStreak++;
    if (weakBlowStreak >= 5) {
      const [emoji, msg] = sarcasticLines[sarcasticIdx % sarcasticLines.length];
      showSarcasm(emoji, msg);
      sarcasticIdx++;
      weakBlowStreak = 0;
    }
  }

  if (candlesOut < TOTAL && isListening) requestAnimationFrame(detectBlow);
}

function getNextLitCandle() {
  for (let i = 1; i <= 3; i++) {
    const c = document.getElementById(`candle-${i}`);
    if (c && !c.classList.contains('out')) return String(i);
  }
  return null;
}
