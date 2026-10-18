/* ============================================================
   player.js — Vinyl Record Player & Music Manager
   - Real audio playback for:
     1. BTS — Friends
     2. BTS — Spring Day
     3. V (BTS) — Sweet Night
   - Turntable & Vinyl rotation
   ============================================================ */

const PLAYLIST = [
  {
    title: "Friends",
    artist: "BTS",
    src: "assets/audio/friends.mp3"
  },
  {
    title: "Spring Day",
    artist: "BTS",
    src: "assets/audio/spring_day.mp3"
  },
  {
    title: "Sweet Night",
    artist: "V (BTS)",
    src: "assets/audio/sweet_night.mp3"
  }
];

let currentSongIdx = parseInt(sessionStorage.getItem('wedding_song_idx') || '0', 10);
if (isNaN(currentSongIdx) || currentSongIdx < 0 || currentSongIdx >= PLAYLIST.length) {
  currentSongIdx = 0;
}

let isAudioPlaying = false;
let audioPlayer = null;

function initAudio() {
  if (!audioPlayer) {
    audioPlayer = new Audio();
    audioPlayer.preload = "auto";
    audioPlayer.src = PLAYLIST[currentSongIdx].src;

    audioPlayer.addEventListener('ended', () => {
      nextSong();
    });

    audioPlayer.addEventListener('play', () => {
      isAudioPlaying = true;
      setPlayerVisuals(true);
    });

    audioPlayer.addEventListener('pause', () => {
      isAudioPlaying = false;
      setPlayerVisuals(false);
    });

    audioPlayer.addEventListener('error', (e) => {
      console.warn("Audio element error:", e);
    });
  }
}

function updateSongInfo() {
  const song = PLAYLIST[currentSongIdx];
  const titleEl = document.getElementById('song-title');
  const artistEl = document.getElementById('song-artist');

  if (titleEl) titleEl.textContent = song.title;
  if (artistEl) artistEl.textContent = song.artist;

  if (audioPlayer) {
    const wasPlaying = isAudioPlaying;
    audioPlayer.src = song.src;
    if (wasPlaying) {
      audioPlayer.play().catch(err => console.log("Playback start:", err));
    }
  }

  sessionStorage.setItem('wedding_song_idx', currentSongIdx);
}

function togglePlay() {
  initAudio();
  if (isAudioPlaying) {
    audioPlayer.pause();
  } else {
    audioPlayer.play().then(() => {
      isAudioPlaying = true;
      setPlayerVisuals(true);
    }).catch(err => {
      console.log("Audio playback notice:", err);
      isAudioPlaying = true;
      setPlayerVisuals(true);
    });
  }
}

function nextSong() {
  initAudio();
  currentSongIdx = (currentSongIdx + 1) % PLAYLIST.length;
  updateSongInfo();
  if (isAudioPlaying) {
    audioPlayer.play().catch(() => {});
  }
}

function prevSong() {
  initAudio();
  currentSongIdx = (currentSongIdx - 1 + PLAYLIST.length) % PLAYLIST.length;
  updateSongInfo();
  if (isAudioPlaying) {
    audioPlayer.play().catch(() => {});
  }
}

function setPlayerVisuals(playing) {
  const disc = document.getElementById('vinyl-disc');
  const arm = document.getElementById('turntable-arm');
  const playBtn = document.getElementById('play-pause-btn');

  if (disc) {
    if (playing) disc.classList.add('spinning');
    else disc.classList.remove('spinning');
  }

  if (arm) {
    if (playing) arm.classList.add('playing');
    else arm.classList.remove('playing');
  }

  if (playBtn) {
    playBtn.innerHTML = playing
      ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
      : `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
  }
}

function togglePlayerCollapse() {
  const player = document.getElementById('vinyl-player');
  const toggleBtn = document.getElementById('player-toggle');
  if (!player) return;

  player.classList.toggle('collapsed');
  if (toggleBtn) {
    toggleBtn.textContent = player.classList.contains('collapsed') ? '▲' : '▼';
  }
}

// Global exposure
window.togglePlay = togglePlay;
window.nextSong = nextSong;
window.prevSong = prevSong;
window.togglePlayerCollapse = togglePlayerCollapse;

window.addEventListener('DOMContentLoaded', () => {
  initAudio();
  updateSongInfo();

  const disc = document.getElementById('vinyl-disc');
  if (disc) {
    disc.addEventListener('click', togglePlay);
  }
});
