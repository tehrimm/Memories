/* ============================================================
   ASMA'S LOVE LETTER — Landing Page Script
   Rose petals · Countdown · Candle blow detection
   ============================================================ */

'use strict';

// ── Rose Petals ───────────────────────────────────────────────
const PETAL_EMOJIS = ['🌸', '🌹', '✿', '❀', '🌺'];
const petalContainer = document.getElementById('petals-container');

function createPetal(burst = false) {
  const p = document.createElement('div');
  p.classList.add('petal');
  p.textContent = PETAL_EMOJIS[Math.floor(Math.random() * PETAL_EMOJIS.length)];
  p.style.left            = (Math.random() * 100) + 'vw';
  p.style.fontSize        = (9 + Math.random() * 10) + 'px';
  p.style.animationDuration  = (burst ? (3 + Math.random() * 4) : (8 + Math.random() * 10)) + 's';
  p.style.animationDelay     = burst ? '0s' : '-' + (Math.random() * 12) + 's';
  p.style.opacity            = 0.4 + Math.random() * 0.4;
  p.style.filter             = `hue-rotate(${Math.random() * 40}deg)`;
  petalContainer.appendChild(p);
  if (burst) {
    setTimeout(() => p.remove(), 8000);
  }
}

// Seed initial ambient petals
for (let i = 0; i < 22; i++) createPetal();

// ── Countdown ─────────────────────────────────────────────────
const NIKKAH_DATE = new Date('2026-10-23T00:00:00+05:00');

function pad(n) { return String(n).padStart(2, '0'); }

function updateCountdown() {
  const diff = NIKKAH_DATE - Date.now();
  if (diff <= 0) {
    ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id => {
      document.getElementById(id).textContent = '00';
    });
    document.querySelector('.countdown-label').textContent = '✦ today is the day ✦';
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000)  / 60000);
  const s = Math.floor((diff % 60000)    / 1000);
  document.getElementById('cd-days').textContent  = pad(d);
  document.getElementById('cd-hours').textContent = pad(h);
  document.getElementById('cd-mins').textContent  = pad(m);
  document.getElementById('cd-secs').textContent  = pad(s);
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ── Candle State ──────────────────────────────────────────────
let blown       = 0;
let listening   = false;
let audioCtx    = null;
let analyserNode = null;
let micSource   = null;
let animFrame   = null;

function extinguishCandle(n, delay = 0) {
  setTimeout(() => {
    const wrap  = document.getElementById('candle-' + n);
    const smoke = document.getElementById('smoke-' + n);
    if (!wrap || wrap.classList.contains('out')) return;

    // Trigger smoke puff
    smoke.classList.add('puff');
    // Brief flicker then go out
    setTimeout(() => {
      wrap.classList.add('out');
      blown++;
      if (blown >= 3) onAllOut();
    }, 250);
  }, delay);
}

function onAllOut() {
  // Stop mic
  listening = false;
  if (animFrame)   cancelAnimationFrame(animFrame);
  if (micSource)   micSource.disconnect();
  if (audioCtx)    audioCtx.close();

  // Burst of petals!
  for (let i = 0; i < 40; i++) {
    setTimeout(() => createPetal(true), Math.random() * 1200);
  }

  // Show success overlay
  const overlay = document.getElementById('success-overlay');
  setTimeout(() => {
    overlay.classList.add('visible');
    // Navigate after a beat
    setTimeout(() => {
      document.getElementById('page-veil').classList.add('cover');
      setTimeout(() => { window.location.href = 'journey.html'; }, 1300);
    }, 2200);
  }, 500);
}

// ── Mic / Blow Detection ──────────────────────────────────────
async function startListening() {
  if (listening || blown >= 3) return;
  const btn  = document.getElementById('mic-btn');
  const hint = document.getElementById('mic-hint');
  const txt  = document.getElementById('mic-btn-text');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

    audioCtx    = new (window.AudioContext || window.webkitAudioContext)();
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 256;
    micSource   = audioCtx.createMediaStreamSource(stream);
    micSource.connect(analyserNode);

    listening = true;
    btn.classList.add('listening');
    btn.disabled = true;
    txt.textContent = 'now blow! 🎤';
    hint.textContent = 'take a deep breath and blow towards your screen...';

    const data = new Uint8Array(analyserNode.frequencyBinCount);
    let cooldown = false;
    let highFrames = 0; // require sustained volume

    function detect() {
      if (!listening) return;
      analyserNode.getByteFrequencyData(data);
      const avg = data.reduce((s, v) => s + v, 0) / data.length;

      if (avg > 28 && !cooldown) {
        highFrames++;
        if (highFrames > 3) { // sustained blow (≈ 3 frames @ ~60fps)
          cooldown = true;
          highFrames = 0;

          const remaining = [1, 2, 3].filter(n => {
            const el = document.getElementById('candle-' + n);
            return el && !el.classList.contains('out');
          });
          remaining.forEach((num, i) => extinguishCandle(num, i * 420));

          setTimeout(() => { cooldown = false; }, 2500);
        }
      } else {
        highFrames = 0;
      }

      animFrame = requestAnimationFrame(detect);
    }
    detect();

  } catch (_err) {
    // Mic denied — offer manual click fallback
    hint.textContent = '🚫 mic unavailable — click each candle to blow it out!';
    btn.textContent = '💨 click to blow';
    btn.disabled = false;
    btn.classList.remove('listening');
    btn.onclick = () => {
      if (blown < 3) extinguishCandle(blown + 1);
    };

    // Also make candles themselves clickable
    [1,2,3].forEach(n => {
      const el = document.getElementById('candle-' + n);
      if (el) el.style.cursor = 'pointer';
      el?.addEventListener('click', () => {
        if (!el.classList.contains('out')) extinguishCandle(n);
      });
    });
  }
}
