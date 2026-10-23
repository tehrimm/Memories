# Memories 💌 — A Whimsical Journey for Asma

> *A visual journey — written by fate, for Asma — on the eve of October 23rd, 2026.*  
> **Live Website:** [https://tehrimm.github.io/Memories/](https://tehrimm.github.io/Memories/)

A whimsical, pastel, interactive gift website dedicated to Asma on her Nikkah celebration. Built with vanilla HTML5, CSS3, and JavaScript, featuring playful interactive animations, custom audio, and nostalgic moments.

---

## ✨ Features & Highlights

- 🐝 **Interactive Bee Flight Trail**:
  - An animated SVG bumblebee that glides smoothly along an organic flight path as you scroll horizontally.
  - Supports mouse wheel, horizontal drag, touch gestures, and keyboard navigation.
  - Dynamic progress bar tracking the journey across all chapter checkpoints.

- 🕯️ **Interactive Candle Landing**:
  - Playful opening gatekeeper with an evasive "No" button that tracks dodge attempts.
  - Interactive mic-driven candle blowing using the **Web Audio API** (or fallback click-to-extinguish).
  - Floating stars, cute mascot, and live countdown timer to the big day.

- 🎵 **Vinyl Record Turntable & Audio Player**:
  - Custom turntable deck featuring a rotating vinyl disc and responsive tonearm.
  - Collapsible floating mini-player pill designed for clean viewing on both desktop and mobile.
  - Audio playback persistence across pages using `sessionStorage`.
  - Built-in offline-ready tracks:
    1. **BTS** — *Friends* (`assets/audio/friends.mp3`)
    2. **BTS** — *Spring Day* (`assets/audio/spring_day.mp3`)
    3. **V (BTS)** — *Sweet Night* (`assets/audio/sweet_night.mp3`)

- 📖 **Themed Story Chapters**:
  - **Chapter 1 (The Beginning)**: Interactive seamless yellow egg that cracks open horizontally on click to reveal baby Asma.
  - **Chapter 2 (Gol Gappay)**: Video player modal that automatically pauses the background playlist during video playback and resumes on close.
  - **Chapter 3 (Harry Potter)**: Hogwarts theme with animated Golden Snitch and lightning bolt badge.
  - **Chapter 4 (Genshin Impact)**: Co-op gaming memories with a glowing Primogem accent.
  - **Chapter 5 (Together)**: Interactive Spider-Man themed 5-photo carousel with web accents and slide indicators.
  - **Chapter 6 (New Beginning)**: October 23rd countdown, wedding rings badge, and a heartfelt letter overlay (with music playing uninterrupted).

- 🌸 **Whimsical Pastel Aesthetic**:
  - Floating ambient glowing orbs, drifting SVG clouds, twinkling stars, and Polaroid-style photo frames with washi tape accents.
  - Modern handwritten & display typography via Google Fonts (*Caveat*, *Pacifico*, *Nunito*).

---

## 📁 Repository Structure

```text
├── index.html           # Landing page (yes/no gatekeeper & candle blowing)
├── journey.html         # Main horizontal journey experience & story chapters
├── main.js              # Logic for candles, mic detection, and gatekeeper
├── journey.js           # Horizontal scrolling, bee trail, chapter reveals & modals
├── player.js            # Turntable audio player & playlist manager
├── style.css            # Global pastel theme, animations, polaroids, and layout
├── assets/
│   ├── audio/           # Local audio tracks (.mp3 and .m4a)
│   │   ├── friends.mp3
│   │   ├── spring_day.mp3
│   │   └── sweet_night.mp3
│   └── images/          # Chapter polaroid images, placeholders, and video clip
│       ├── 1.png - 5.png
│       ├── egg_placeholder.png
│       ├── genshin.png
│       ├── harry.jpg
│       ├── sikhandar_placeholder.png
│       └── vid.mp4
└── README.md
```

---

## 🚀 Running Locally

Because modern web browsers restrict audio playback and certain assets over the `file://` protocol, run the project with a local HTTP server:

### Option 1: Node.js (Included)
```bash
npm install
npm start
```
*Runs via `live-server` on `http://localhost:8080`.*

### Option 2: Python
```bash
# Python 3
python -m http.server 8080
# Open http://localhost:8080 in your browser
```

---

## 🌐 Deploying & Updating GitHub Pages

The live site is published at:
**[https://tehrimm.github.io/Memories/](https://tehrimm.github.io/Memories/)**

To push new updates to GitHub Pages:

```bash
# 1. Stage and commit changes
git add .
git commit -m "feat: update memories and story details"

# 2. Push to main
git push origin main

# 3. Synchronize gh-pages branch (ensures GitHub Pages builds the latest version)
git push origin main:gh-pages
```

---

## 🎨 Customization

- **Updating Songs**: In [player.js](player.js), edit the `PLAYLIST` array with your desired audio source and details:
  ```javascript
  const PLAYLIST = [
    { title: "Song Name", artist: "Artist", src: "assets/audio/your_song.mp3" }
  ];
  ```
- **Updating Photos**: Place new images in [assets/images/](assets/images/) and update the `src` references in [journey.html](journey.html).
- **Personalizing the Letter**: Edit the text inside the `#letter-overlay .letter-body` in [journey.html](journey.html).

---

*Made with 💕 by Tehrim*
