// Draws the cover on a canvas 2D context: sky grade, striped sun, photo panels
// with per-panel crop, silhouettes, caption lettering, grain and vignette.
//
// Everything here is deterministic: the only randomness is a seeded generator,
// so the same state always paints the same pixels at any size.

import { panelsFor, captionBandFor } from './presets.js';

/** A small seeded generator (mulberry32) so grain and rain never vary between runs. */
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The path of one panel: a rectangle, or a parallelogram when it carries a slant. */
function panelPath(ctx, p) {
  ctx.beginPath();
  if (p.slant) {
    ctx.moveTo(p.x + p.slant, p.y);
    ctx.lineTo(p.x + p.w, p.y);
    ctx.lineTo(p.x + p.w - p.slant, p.y + p.h);
    ctx.lineTo(p.x, p.y + p.h);
  } else {
    ctx.rect(p.x, p.y, p.w, p.h);
  }
  ctx.closePath();
}

/** Draws one photo slot into its panel, cover-fit, with the slot's zoom and pan. */
function drawPhoto(ctx, slot, p) {
  const img = slot.img;
  if (!img || !img.naturalWidth) {
    const g = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = `600 ${Math.max(12, p.h * 0.09)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Add a photo', p.x + p.w / 2, p.y + p.h / 2);
    ctx.textBaseline = 'alphabetic';
    return;
  }
  const base = Math.max(p.w / img.naturalWidth, p.h / img.naturalHeight);
  const scale = base * (slot.zoom || 1);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const ox = (slot.ox || 0) * Math.max(0, (dw - p.w) / 2);
  const oy = (slot.oy || 0) * Math.max(0, (dh - p.h) / 2);
  ctx.drawImage(img, p.x + (p.w - dw) / 2 + ox, p.y + (p.h - dh) / 2 + oy, dw, dh);
}

/** A disc cut by horizontal transparent stripes, drawn on its own canvas first. */
function drawStripedSun(ctx, sun, cx, cy, r) {
  const off = document.createElement('canvas');
  const s = Math.ceil(r * 2 + 4);
  off.width = s;
  off.height = s;
  const o = off.getContext('2d');
  o.fillStyle = sun.color;
  o.beginPath();
  o.arc(s / 2, s / 2, r, 0, Math.PI * 2);
  o.fill();
  if (sun.stripes) {
    o.globalCompositeOperation = 'destination-out';
    const gap = r / 9;
    for (let i = 0; i < 5; i++) {
      const y = s / 2 + r * 0.05 + i * gap * 1.6;
      o.fillRect(0, y, s, gap * (0.5 + i * 0.18));
    }
    o.globalCompositeOperation = 'source-over';
  }
  if (sun.glow) {
    ctx.save();
    ctx.shadowColor = sun.color;
    ctx.shadowBlur = r * 0.9;
    ctx.drawImage(off, cx - s / 2, cy - s / 2);
    ctx.restore();
  } else {
    ctx.drawImage(off, cx - s / 2, cy - s / 2);
  }
}

/** One original palm silhouette, drawn in code: a tapered trunk and seven fronds. */
function drawPalm(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ctx.fillStyle = color;
  // Trunk: tapered and gently curved.
  ctx.beginPath();
  ctx.moveTo(-0.06, 0);
  ctx.quadraticCurveTo(-0.02, -0.55, 0.14, -0.98);
  ctx.lineTo(0.24, -0.98);
  ctx.quadraticCurveTo(0.09, -0.55, 0.05, 0);
  ctx.closePath();
  ctx.fill();
  // Fronds: filled blades arcing down from the crown.
  const crown = [0.19, -0.98];
  const fronds = [
    [-0.55, -1.35, -0.8, -0.7],
    [-0.3, -1.5, -0.42, -0.8],
    [0.05, -1.55, 0.0, -0.88],
    [0.38, -1.5, 0.45, -0.82],
    [0.65, -1.3, 0.8, -0.68],
    [0.8, -0.95, 0.88, -0.45],
    [-0.7, -0.95, -0.88, -0.5],
  ];
  for (const [cx, cy, tx, ty] of fronds) {
    ctx.beginPath();
    ctx.moveTo(crown[0], crown[1]);
    ctx.quadraticCurveTo(cx, cy, tx, ty);
    ctx.quadraticCurveTo(cx * 0.55 + crown[0] * 0.45, cy * 0.55 + crown[1] * 0.45 + 0.14, crown[0], crown[1]);
    ctx.closePath();
    ctx.fill();
  }
  // Coconuts.
  ctx.beginPath();
  ctx.arc(0.22, -0.9, 0.06, 0, Math.PI * 2);
  ctx.arc(0.31, -0.86, 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A city skyline silhouette along a baseline, with a few lit windows. */
function drawSkyline(ctx, x, y, w, h, color, lit, rand) {
  ctx.save();
  ctx.fillStyle = color;
  let bx = x;
  while (bx < x + w) {
    const bw = w * (0.04 + rand() * 0.06);
    const bh = h * (0.35 + rand() * 0.65);
    ctx.fillRect(bx, y - bh, bw, bh);
    if (rand() < 0.4) ctx.fillRect(bx + bw * 0.3, y - bh - h * 0.12, bw * 0.4, h * 0.12);
    bx += bw + w * 0.012;
  }
  ctx.fillStyle = lit;
  for (let i = 0; i < 26; i++) {
    const wx = x + rand() * w;
    const wy = y - rand() * h * 0.85;
    ctx.fillRect(wx, wy, Math.max(2, w * 0.004), Math.max(2, h * 0.03));
  }
  ctx.restore();
}

/** Diagonal rain streaks for Neon Nights. */
function drawRain(ctx, W, H, rand) {
  ctx.save();
  ctx.strokeStyle = 'rgba(174, 243, 255, 0.35)';
  ctx.lineWidth = Math.max(1, W * 0.0012);
  ctx.lineCap = 'round';
  const n = Math.floor((W * H) / 26000);
  for (let i = 0; i < n; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const len = H * (0.02 + rand() * 0.03);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - len * 0.18, y + len);
    ctx.stroke();
  }
  ctx.restore();
}

/** Deterministic film grain: seeded speckle over the whole cover. */
function drawGrain(ctx, W, H, rand) {
  const n = Math.floor((W * H) / 1100);
  for (let i = 0; i < n; i++) {
    const v = rand();
    ctx.fillStyle = v < 0.5 ? `rgba(255,255,255,${0.02 + rand() * 0.05})` : `rgba(0,0,0,${0.02 + rand() * 0.05})`;
    const s = 1 + Math.floor(rand() * 2);
    ctx.fillRect(rand() * W, rand() * H, s, s);
  }
}

/** A soft dark vignette around the edges. */
function drawVignette(ctx, W, H) {
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.26)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

/** Splits a title into at most two lines that fit `maxWidth` at `size`. */
function wrapTitle(ctx, title, maxWidth, size) {
  ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
  const words = title.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Draws the caption (title + tagline) inside the band, sized to fit it. */
function drawCaption(ctx, preset, band, title, tagline, W) {
  const cap = preset.caption;
  const text = (title || '').trim().toUpperCase();
  const sub = (tagline || '').trim();
  const maxWidth = band.w * 0.92;
  // Shrink the title until the whole block (title lines + tagline) fits the band.
  let size = band.h * 0.38;
  let tagSize = Math.max(13, band.h * 0.1);
  let lines = text ? wrapTitle(ctx, text, maxWidth, size) : [];
  const blockH = () => lines.length * size * 1.02 + (sub ? tagSize * 1.7 : 0);
  while (size > 16 && (lines.length > 2 || blockH() > band.h * 0.88)) {
    size -= 2;
    tagSize = Math.max(13, size * 0.25);
    lines = wrapTitle(ctx, text, maxWidth, size);
  }
  const lineHeight = size * 1.02;
  const top = band.y + (band.h - blockH()) / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.forEach((line, i) => {
    const y = top + lineHeight * (i + 0.5);
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(2, size * 0.09);
    ctx.strokeStyle = cap.outline;
    ctx.shadowColor = cap.shadow;
    ctx.shadowBlur = size * 0.18;
    ctx.shadowOffsetY = size * 0.04;
    ctx.strokeText(line, band.x + band.w / 2, y);
    ctx.fillStyle = cap.fill;
    ctx.fillText(line, band.x + band.w / 2, y);
  });
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  if (sub) {
    ctx.font = `600 ${tagSize}px Inter, sans-serif`;
    try {
      ctx.letterSpacing = `${Math.max(1, tagSize * 0.22)}px`;
    } catch {
      // letterSpacing is optional; the tagline still draws without it.
    }
    ctx.fillStyle = cap.taglineColor;
    ctx.fillText(sub.toUpperCase(), band.x + band.w / 2, top + lines.length * lineHeight + tagSize * 0.85);
    try {
      ctx.letterSpacing = '0px';
    } catch {
      // Reset is best effort.
    }
  }
}

/**
 * Draws the whole cover for `state` on `ctx` at pixel size W x H.
 * state: { preset, photos, title, tagline, grade, grain, vignette, seed }
 * photos: [{ img, zoom, ox, oy }] one per panel, in panel order.
 */
export function drawCover(ctx, state, W, H) {
  const preset = state.preset;
  const kind = W === H ? 'square' : W < H ? 'portrait' : 'landscape';
  const rand = seeded(state.seed || 20261119);

  // Sky grade over the whole cover.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  preset.sky.forEach((c, i) => sky.addColorStop(i / (preset.sky.length - 1), c));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Photo panels, each with its grade overlay and a thin frame.
  const panels = panelsFor(preset, kind, W, H);
  const border = Math.max(2, W * 0.003);
  panels.forEach((p, i) => {
    ctx.save();
    panelPath(ctx, p);
    ctx.clip();
    drawPhoto(ctx, state.photos[i] || {}, p);
    const grade = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
    grade.addColorStop(0, preset.grade[0]);
    grade.addColorStop(1, preset.grade[1]);
    ctx.globalAlpha = 0.35 + 0.65 * (state.grade ?? 0.8);
    ctx.fillStyle = grade;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.globalAlpha = 1;
    ctx.restore();
    ctx.save();
    panelPath(ctx, p);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = border;
    ctx.stroke();
    ctx.restore();
  });

  // Caption band shading, then the silhouettes at its edges.
  const band = captionBandFor(preset, kind, W, H);
  const darkText = preset.caption.fill === '#17324a';
  const shade = ctx.createLinearGradient(0, band.y, 0, band.y + band.h);
  if (darkText) {
    shade.addColorStop(0, 'rgba(255, 248, 234, 0.10)');
    shade.addColorStop(1, 'rgba(255, 248, 234, 0.55)');
  } else {
    shade.addColorStop(0, 'rgba(20, 8, 32, 0.10)');
    shade.addColorStop(1, 'rgba(20, 8, 32, 0.52)');
  }
  ctx.fillStyle = shade;
  ctx.fillRect(band.x, band.y, band.w, band.h);

  // The sun, rising from behind the panel row inside the band, bright and
  // striped, with the caption lettering over it.
  ctx.save();
  ctx.beginPath();
  ctx.rect(band.x, band.y, band.w, band.h);
  ctx.clip();
  drawStripedSun(ctx, preset.sun, preset.sun.x * W, band.y + band.h * 0.42, band.h * 0.62);
  ctx.restore();

  const silhouette = preset.id === 'coastal' ? 'rgba(23, 50, 74, 0.85)' : 'rgba(18, 8, 30, 0.9)';
  if (preset.palms) {
    drawPalm(ctx, band.x + band.w * 0.085, band.y + band.h * 0.98, band.h * 0.28, silhouette);
    drawPalm(ctx, band.x + band.w * 0.915, band.y + band.h * 0.98, band.h * 0.26, silhouette);
  }
  if (preset.skyline) {
    // Two skyline runs at the band's edges, leaving the centre clear for the tagline.
    const segW = band.w * 0.3;
    const segH = band.h * 0.3;
    drawSkyline(ctx, band.x + band.w * 0.02, band.y + band.h * 0.99, segW, segH, silhouette, '#ff5ea8', rand);
    drawSkyline(ctx, band.x + band.w * 0.68, band.y + band.h * 0.99, segW, segH, silhouette, '#ff5ea8', rand);
  }

  // Caption lettering.
  drawCaption(ctx, preset, band, state.title, state.tagline, W);

  if (preset.rain) drawRain(ctx, W, H, rand);
  if (state.grain) drawGrain(ctx, W, H, rand);
  if (state.vignette) drawVignette(ctx, W, H);
}

/** The pixel rects of the preset's panels, for hit-testing a pointer on the preview. */
export function panelRects(preset, W, H) {
  const kind = W === H ? 'square' : W < H ? 'portrait' : 'landscape';
  return panelsFor(preset, kind, W, H);
}
