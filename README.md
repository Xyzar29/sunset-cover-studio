# Sunset Cover Studio

[![Make the GTA 6 Cover Art](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/Xyzar29/sunset-cover-studio/rank.svg)](https://make.fun/c/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/Xyzar29/sunset-cover-studio/reward.svg)](https://make.fun/c/gta6-cover-art-01)

An offline web app that turns your photo and a caption into multi-panel
GTA-poster-style cover art, exported as a PNG to share.

## What it does

Pick a preset — **Golden Hour** (a warm sunset grid with a big hero panel),
**Neon Nights** (a diagonal split in magenta and cyan, with rain and a
skyline) or **Coastal Cruise** (three bright strips: sky, sea, street) — load
up to four of your own photos (one per panel, never uploaded), drag each photo
on the preview to position it, set its zoom and numeric offsets, write a title
and a tagline, then export a PNG in any of the three post sizes: 1080 x 1080,
1080 x 1350 or 1920 x 1080.

Every cover is drawn on canvas in code: the sunset or neon grade, a striped
retro sun, original palm-tree and skyline silhouettes, bold outlined display
lettering, deterministic film grain and a vignette. A one-click sample loader
fills the panels so anyone can try it instantly.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no
network request at runtime: every script, font and sample photo is a file
under `app/`.

## Files

- `app/index.html`, `app/style.css` — the editor page.
- `app/src/presets.js` — the three presets: panels, grades, suns, silhouettes.
- `app/src/cover.js` — the canvas renderer that draws a cover at any size.
- `app/src/main.js` — the editor wiring: slots, crop, caption, export.
- `app/src/shots.js` — fixed scenes for reproducible screenshots.
- `app/fonts/` — Anton (display lettering) and Inter (interface), both under
  the SIL Open Font License; the license texts sit beside them.
- `app/samples/` — three free-to-use sample photos, including one made with
  an image model for this entry.

## Originality

All art in this entry is original: the silhouettes and sun are drawn in code,
the lettering uses the vendored Anton and Inter fonts (SIL Open Font License),
and no Rockstar Games logo, wordmark, artwork, character or font appears
anywhere.

---

Made for the make.fun bounty [Make GTA 6 Cover Art](https://make.fun/c/gta6-cover-art-01).
Try make.fun yourself: https://make.fun/r/86zc8pnt (referral code `86zc8pnt`).
