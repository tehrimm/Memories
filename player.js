/* ============================================================
   player.js — Vinyl record player that ACTUALLY PLAYS music
   Uses YouTube IFrame API with a visible play/pause interface
   Requires the page to be served over HTTP (not file://)
   ============================================================ */

const PLAYLIST = [
  /* BTS */
  { title: "Spring Day",       artist: "BTS",    videoId: "xEeFrLSkMm8" },
  { title: "Life Goes On",     artist: "BTS",    videoId: "xWmKDSuCDOk" },
  { title: "Sweet Night",      artist: "V (BTS)",videoId: "VhBDk7SHJFQ"  },
  { title: "Friends",          artist: "Jimin & V", videoId: "MBdVXkSdhwU" },
  { title: "Boy With Luv",     artist: "BTS",    videoId: "XsX3ATc3FbA" },
  { title: "Zero O'Clock",     artist: "BTS",    videoId: "3ATGwGqXC5Y"  },
  /* Attack on Titan */
  { title: "YouSeeBIGGIRL/T:T",artist: "AOT OST",videoId: "0sdaB4jEBGE" },
  { title: "Vogel im Käfig",   artist: "AOT OST",videoId: "x4JMB5CbSPs" },
  { title: "Barricades",       artist: "AOT OST",videoId: "aKHKyHhKDCE" },
];

let ytPlayer   = null;
let currentIdx = 0;
let isPlaying  = false;
let ytReady    = false;
let playerCollapsed = false;

/* ── Load YouTube IFrame API ───────────────────────────── */
(function loadYTAPI() {
  const tag      = document.createElement('script');
  tag.src        = 'https://www.youtube.com/iframe_api';
  const first    = document.getElementsByTagName('script')[0];
  first.parentNode.insertBefore(tag, first);
})();

/* ── Called by YouTube API when ready ──────────────────── */
function onYouTubeIframeAPIReady() {
  ytReady = true;

  ytPlayer = new YT.Player('yt-hidden-player', {
    height: '1',
    width:  '1',
    videoId: PLAYLIST[currentIdx].videoId,
    playerVars: {
      autoplay:       0,
      controls:       0,
      disablekb:      1,
      fs:             0,
      modestbranding: 1,
      rel:            0,
      playsinline:    1,
    },
    events: {
      onReady:       onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError:       onPlayerError,
    },
  });
}

function onPlayerReady(event) {
  updateSongDisplay();
  // Show hint that player is ready
  const hint = document.querySelector('.player-click-hint');
  if (hint) hint.textContent = 'click ▶ to play 🎵';
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    document.getElementById('vinyl-disc').classList.add('spinning');
    setPlayIcon(true);
  } else if (event.data === YT.PlayerState.PAUSED ||
             event.data === YT.PlayerState.BUFFERING) {
    isPlaying = false;
    document.getElementById('vinyl-disc').classList.remove('spinning');
    setPlayIcon(false);
  } else if (event.data === YT.PlayerState.ENDED) {
    nextSong();
  }
}

function onPlayerError(event) {
  console.warn('YT player error:', event.data);
  // Try next song if current one fails
  nextSong();
}

/* ── Play / Pause ──────────────────────────────────────── */
function togglePlay() {
  if (!ytReady || !ytPlayer) return;

  if (isPlaying) {
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.playVideo();
  }
}

/* ── Navigation ────────────────────────────────────────── */
function nextSong() {
  currentIdx = (currentIdx + 1) % PLAYLIST.length;
  loadAndPlay();
}

function prevSong() {
  currentIdx = (currentIdx - 1 + PLAYLIST.length) % PLAYLIST.length;
  loadAndPlay();
}

function loadAndPlay() {
  if (!ytReady || !ytPlayer) return;
  updateSongDisplay();
  ytPlayer.loadVideoById(PLAYLIST[currentIdx].videoId);
  // loadVideoById auto-plays
}

/* ── UI helpers ────────────────────────────────────────── */
function updateSongDisplay() {
  const song = PLAYLIST[currentIdx];
  const titleEl  = document.getElementById('song-title');
  const artistEl = document.getElementById('song-artist');
  if (titleEl)  titleEl.textContent  = song.title;
  if (artistEl) artistEl.textContent = song.artist;
}

function setPlayIcon(playing) {
  const btn = document.getElementById('play-pause-btn');
  if (!btn) return;
  btn.innerHTML = playing
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
}

function togglePlayer() {
  playerCollapsed = !playerCollapsed;
  const body = document.getElementById('player-body');
  const btn  = document.getElementById('player-toggle');
  if (!body) return;

  if (playerCollapsed) {
    body.style.display = 'none';
    btn.textContent    = '▲';
    btn.title          = 'expand player';
  } else {
    body.style.display = '';
    btn.textContent    = '▼';
    btn.title          = 'collapse player';
  }
}

/* ── Clicking the vinyl disc also toggles play ─────────── */
window.addEventListener('DOMContentLoaded', () => {
  const disc = document.getElementById('vinyl-disc');
  if (disc) disc.addEventListener('click', togglePlay);
  updateSongDisplay();
});
