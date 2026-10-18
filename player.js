/* ============================================================
   ASMA'S LOVE LETTER — Vinyl Record Player
   Powered by YouTube IFrame API
   ⚠️  To update songs: edit PLAYLIST below with correct YouTube video IDs.
       Tip: Go to youtube.com/watch?v=VIDEO_ID — the VIDEO_ID is after "v="
   ============================================================ */

'use strict';

const PLAYLIST = [
  { title: 'Spring Day',         artist: 'BTS',               videoId: 'xEeFrLSkMm8' },
  { title: 'Sweet Night',        artist: 'V (BTS)',            videoId: 'bvHfmmEAtxo' },
  { title: 'Life Goes On',       artist: 'BTS',                videoId: '_oLiKRFMtFo' },
  { title: 'Friends',            artist: 'Jimin & V',          videoId: 'MBdVXkSdhwU' },
  { title: 'Boy With Luv',       artist: 'BTS ft. Halsey',     videoId: 'XsX3ATc3FbA' },
  { title: 'Zero O\'Clock',      artist: 'BTS',                videoId: 'KxqBxEJ7Tkc' },
  { title: 'YouSeeBIGGIRL/T:T', artist: 'Hiroyuki Sawano (AOT)', videoId: '0sdaB4jEBGE' },
  { title: 'Vogel im Käfig',    artist: 'Sawano/Mizuki (AOT)',  videoId: 'JRmgLtGfVF8' },
  { title: 'Barricades',        artist: 'Hiroyuki Sawano (AOT)', videoId: 'bGQdxbYEkx4' },
];

let currentIdx  = parseInt(sessionStorage.getItem('songIdx') || '0', 10);
let isPlaying   = false;
let ytPlayer    = null;
let playerReady = false;

// ── Load YouTube IFrame API ───────────────────────────────────
(function loadYTAPI() {
  if (document.getElementById('yt-api-script')) return;
  const tag = document.createElement('script');
  tag.id  = 'yt-api-script';
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
})();

window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player('yt-hidden-player', {
    height: '1',
    width:  '1',
    videoId: PLAYLIST[currentIdx].videoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
    },
    events: {
      onReady:       onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError:       onPlayerError,
    },
  });
};

function onPlayerReady() {
  playerReady = true;
  updateDisplay();
  // If user had music playing on a previous page, resume
  if (sessionStorage.getItem('wasPlaying') === 'true') {
    ytPlayer.playVideo();
  }
}

function onPlayerStateChange(e) {
  const S = YT.PlayerState;
  if (e.data === S.ENDED)  { nextSong(); return; }
  if (e.data === S.PLAYING) {
    isPlaying = true;
    setVinylState(true);
    sessionStorage.setItem('wasPlaying', 'true');
    sessionStorage.setItem('songIdx', currentIdx);
  }
  if (e.data === S.PAUSED || e.data === S.CUED) {
    isPlaying = false;
    setVinylState(false);
    sessionStorage.setItem('wasPlaying', 'false');
  }
}

function onPlayerError() {
  // Skip unplayable songs
  console.warn('[Player] Video unavailable, skipping…');
  setTimeout(nextSong, 800);
}

// ── Public Controls ───────────────────────────────────────────
function togglePlay() {
  if (!playerReady) return;
  isPlaying ? ytPlayer.pauseVideo() : ytPlayer.playVideo();
}

function nextSong() {
  currentIdx = (currentIdx + 1) % PLAYLIST.length;
  loadSong();
}

function prevSong() {
  currentIdx = (currentIdx - 1 + PLAYLIST.length) % PLAYLIST.length;
  loadSong();
}

function loadSong(autoplay = true) {
  sessionStorage.setItem('songIdx', currentIdx);
  updateDisplay();
  if (!playerReady) return;
  if (autoplay) {
    ytPlayer.loadVideoById(PLAYLIST[currentIdx].videoId);
  } else {
    ytPlayer.cueVideoById(PLAYLIST[currentIdx].videoId);
  }
}

// ── UI helpers ────────────────────────────────────────────────
function updateDisplay() {
  const song = PLAYLIST[currentIdx];
  const titleEl  = document.getElementById('song-title');
  const artistEl = document.getElementById('song-artist');
  if (titleEl)  titleEl.textContent  = song.title;
  if (artistEl) artistEl.textContent = song.artist;
}

function setVinylState(playing) {
  const disc    = document.getElementById('vinyl-disc');
  const arm     = document.querySelector('.tonearm');
  const playBtn = document.getElementById('play-pause-btn');
  if (disc)    disc.style.animationPlayState = playing ? 'running' : 'paused';
  if (arm)     arm.classList.toggle('playing', playing);
  if (playBtn) playBtn.innerHTML = playing ? pauseIcon() : playIcon();
}

function playIcon()  {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
}
function pauseIcon() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
}

// ── Player collapse/expand ────────────────────────────────────
let playerCollapsed = false;
function togglePlayer() {
  const body   = document.getElementById('player-body');
  const toggle = document.getElementById('player-toggle');
  playerCollapsed = !playerCollapsed;
  body.style.display   = playerCollapsed ? 'none' : 'block';
  toggle.textContent   = playerCollapsed ? '▲' : '▼';
}
