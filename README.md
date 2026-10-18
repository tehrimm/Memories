# Asma's Love Letter 💌

> *A visual journey — written by fate, for Asma — on the eve of October 23rd, 2026.*

A whimsical, vintage, interactive website gifted to Asma on her Nikkah. Features:

- 🕯️ **Candle-blow landing** — blow out 3 candles using your mic (Web Audio API)
- 📸 **Photo journey** — 6 chapters from baby to Nikkah day with Polaroid-style photos
- 🎵 **Vinyl record player** — BTS & AOT songs via YouTube IFrame API
- ⏳ **Live countdown** to October 23rd
- 🌸 **Rose petal animations** and vintage grain aesthetic

---

## 🚀 Running Locally

Since the YouTube player requires an HTTP server (not `file://`), run a local server:

```bash
# Option 1: Python (if installed)
python -m http.server 8080
# Then visit http://localhost:8080

# Option 2: Node.js live-server
npx live-server
```

---

## 🌐 Deploy to GitHub Pages (Free Hosting)

1. Create a new repo on GitHub (e.g. `asma-love-letter`)
2. In this folder, run:

```bash
git init
git add .
git commit -m "💌 initial commit — asma's love letter"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/asma-love-letter.git
git push -u origin main
```

3. On GitHub → repo Settings → Pages → Source: `main` branch → `/root`
4. Your site will be live at: `https://YOUR_USERNAME.github.io/asma-love-letter`

---

## 🎵 Updating Songs

Open `player.js` and edit the `PLAYLIST` array. Each song needs:
- `title` — displayed on the player
- `artist` — displayed below the title
- `videoId` — the YouTube video ID (the part after `?v=` in the URL)

---

## 📸 Adding Real Photos

Replace the images in `assets/images/` with Asma's actual photos:
- `photo_roses.png` → Chapter 1 (baby photo)
- `photo_stars.png` → Chapter 1 (childhood)
- `photo_book.png`  → Chapter 2 (memory 1)
- `photo_letter.png`→ Chapter 2 (memory 2)
- `photo_hands.png` → Chapter 2 (memory 3)
- `photo_golden.png`→ Chapter 4 (new chapter)

---

*made with 💕 by tehrim*
