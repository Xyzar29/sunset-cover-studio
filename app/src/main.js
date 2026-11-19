// Wires the page: presets, photo slots with crop and pan, caption, look controls
// and one-click PNG export in the three post sizes. A `?shot=` query sets up a
// fixed scene for a screenshot instead (./shots.js). Photos are read on this
// machine only, never uploaded.
import { drawCover, panelRects } from './cover.js';
import { PRESETS, ASPECTS } from './presets.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const statusEl = $('status');

const state = {
  preset: PRESETS.golden,
  sizeKey: '1080x1080',
  title: 'Sunset Heist',
  tagline: 'Vice City · Golden Hour',
  grade: 0.8,
  grain: true,
  vignette: true,
  seed: 20261119,
  // One slot per panel, in panel order: { img, zoom, ox, oy }.
  photos: [0, 1, 2, 3].map(() => ({ img: null, zoom: 1, ox: 0, oy: 0 })),
};
let selectedPanel = 0;

function aspect() {
  return ASPECTS[state.sizeKey];
}

/** Paints the preview canvas at the chosen export aspect, scaled to display size. */
function redraw() {
  const a = aspect();
  const scale = Math.min(760 / a.w, 760 / a.h);
  canvas.width = Math.round(a.w * scale);
  canvas.height = Math.round(a.h * scale);
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(canvas.width / a.w, canvas.height / a.h);
  drawCover(ctx, state, a.w, a.h);
  ctx.restore();
  // The selected panel gets a coral outline on the preview (never in a cover shot).
  const rects = panelRects(state.preset, a.w, a.h);
  const p = rects[selectedPanel];
  if (p && !document.body.classList.contains('shot-cover')) {
    ctx.save();
    ctx.strokeStyle = '#ff7a3d';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 6]);
    ctx.strokeRect(
      (p.x / a.w) * canvas.width + 2,
      (p.y / a.h) * canvas.height + 2,
      (p.w / a.w) * canvas.width - 4,
      (p.h / a.h) * canvas.height - 4,
    );
    ctx.restore();
  }
}

function say(message) {
  statusEl.textContent = message;
}

/** Loads an image from a URL, resolving to the image once it can be drawn. */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${url}`));
    img.src = url;
  });
}

/** Loads a local file into a slot, keeping the crop the slot already had. */
async function loadFileIntoSlot(file, slot) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    say(`"${file.name}" is not an image. Choose a JPG, PNG or WebP photo.`);
    return;
  }
  try {
    const img = await loadImage(URL.createObjectURL(file));
    state.photos[slot] = { img, zoom: 1, ox: 0, oy: 0 };
    selectedPanel = slot;
    syncSlotControls();
    redraw();
    say(`Photo ${slot + 1} loaded from ${file.name}. Drag it on the preview to position it.`);
  } catch {
    say(`Could not read "${file.name}". Try another image file.`);
  }
}

async function loadSampleIntoSlot(url, slot) {
  try {
    const img = await loadImage(url);
    state.photos[slot] = { img, zoom: 1, ox: 0, oy: 0 };
    selectedPanel = slot;
    syncSlotControls();
    redraw();
  } catch {
    say(`Could not load the sample photo ${url}.`);
  }
}

// ---- photo slots -----------------------------------------------------------

const slotsEl = $('slots');
const SAMPLES = ['hero.jpg', 'pier.jpg', 'boulevard.jpg', 'hero.jpg'];

function buildSlots() {
  slotsEl.innerHTML = '';
  state.photos.forEach((slot, i) => {
    const row = document.createElement('div');
    row.className = 'slot';
    row.dataset.slot = String(i);
    row.innerHTML = `
      <button type="button" class="slot-pick" aria-pressed="false">
        <span class="slot-num">${i + 1}</span>
        <span class="slot-name">Panel ${i + 1}</span>
        <span class="slot-state">Empty</span>
      </button>
      <span class="slot-actions">
        <label class="slot-file">Choose a photo
          <input type="file" accept="image/*">
        </label>
        <button type="button" class="slot-sample">Use a sample</button>
        <button type="button" class="slot-clear">Remove</button>
      </span>`;
    row.querySelector('.slot-pick').addEventListener('click', () => {
      selectedPanel = i;
      syncSlotControls();
      redraw();
    });
    row.querySelector('.slot-file input').addEventListener('change', (e) => {
      loadFileIntoSlot(e.target.files[0], i);
      e.target.value = '';
    });
    row.querySelector('.slot-sample').addEventListener('click', () => {
      loadSampleIntoSlot(`samples/${SAMPLES[i]}`, i);
    });
    row.querySelector('.slot-clear').addEventListener('click', () => {
      state.photos[i] = { img: null, zoom: 1, ox: 0, oy: 0 };
      syncSlotControls();
      redraw();
      say(`Photo ${i + 1} removed.`);
    });
    slotsEl.appendChild(row);
  });
}

function syncSlotControls() {
  const count = state.preset.panels[aspect().kind].length;
  [...slotsEl.children].forEach((row, i) => {
    const slot = state.photos[i];
    const used = i < count;
    row.classList.toggle('slot-unused', !used);
    row.classList.toggle('slot-selected', i === selectedPanel);
    row.querySelector('.slot-pick').setAttribute('aria-pressed', String(i === selectedPanel));
    row.querySelector('.slot-state').textContent = !used
      ? 'Not used by this preset'
      : slot.img
        ? 'Photo loaded'
        : 'Empty';
    row.querySelector('.slot-name').textContent = used ? `Panel ${i + 1}` : `Panel ${i + 1} (unused)`;
  });
  const slot = state.photos[selectedPanel];
  $('zoom').value = String(slot.zoom);
  $('zoom-value').textContent = `${Math.round(slot.zoom * 100)}%`;
  $('offset-x').value = String(Math.round(slot.ox * 100));
  $('offset-y').value = String(Math.round(slot.oy * 100));
  $('panel-label').textContent = `Panel ${selectedPanel + 1} crop`;
}

// ---- presets and size ------------------------------------------------------

const presetsEl = $('presets');
for (const preset of Object.values(PRESETS)) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'preset';
  button.dataset.preset = preset.id;
  button.setAttribute('aria-pressed', String(preset.id === 'golden'));
  button.innerHTML = `<span class="preset-name">${preset.name}</span><span class="preset-blurb">${preset.blurb}</span>`;
  button.addEventListener('click', () => {
    state.preset = preset;
    [...presetsEl.children].forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    syncSlotControls();
    redraw();
    say(`${preset.name} preset selected.`);
  });
  presetsEl.appendChild(button);
}

for (const [key, a] of Object.entries(ASPECTS)) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'size';
  button.dataset.size = key;
  button.setAttribute('aria-pressed', String(key === state.sizeKey));
  button.textContent = a.label;
  button.addEventListener('click', () => {
    state.sizeKey = key;
    [...$('sizes').children].forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    syncSlotControls();
    redraw();
    say(`Preview size: ${a.label}.`);
  });
  $('sizes').appendChild(button);
}

// ---- caption and look ------------------------------------------------------

$('title').addEventListener('input', (e) => {
  state.title = e.target.value;
  redraw();
});
$('tagline').addEventListener('input', (e) => {
  state.tagline = e.target.value;
  redraw();
});
$('grade').addEventListener('input', (e) => {
  state.grade = Number(e.target.value) / 100;
  $('grade-value').textContent = `${e.target.value}%`;
  redraw();
});
$('grain').addEventListener('change', (e) => {
  state.grain = e.target.checked;
  redraw();
});
$('vignette').addEventListener('change', (e) => {
  state.vignette = e.target.checked;
  redraw();
});

// ---- panel crop: sliders, numeric offsets, drag on the preview -------------

$('zoom').addEventListener('input', (e) => {
  state.photos[selectedPanel].zoom = Number(e.target.value);
  $('zoom-value').textContent = `${Math.round(Number(e.target.value) * 100)}%`;
  redraw();
});
$('offset-x').addEventListener('input', (e) => {
  state.photos[selectedPanel].ox = Number(e.target.value) / 100;
  redraw();
});
$('offset-y').addEventListener('input', (e) => {
  state.photos[selectedPanel].oy = Number(e.target.value) / 100;
  redraw();
});

let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const a = aspect();
  const px = ((e.clientX - rect.left) / rect.width) * a.w;
  const py = ((e.clientY - rect.top) / rect.height) * a.h;
  const rects = panelRects(state.preset, a.w, a.h);
  const hit = rects.findIndex((p) => px >= p.x && px <= p.x + p.w && py >= p.y && py <= p.y + p.h);
  if (hit < 0) return;
  selectedPanel = hit;
  syncSlotControls();
  drag = { panel: hit, x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
  canvas.style.cursor = 'grabbing';
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const rect = canvas.getBoundingClientRect();
  const a = aspect();
  const dx = ((e.clientX - drag.x) / rect.width) * a.w;
  const dy = ((e.clientY - drag.y) / rect.height) * a.h;
  drag.x = e.clientX;
  drag.y = e.clientY;
  const slot = state.photos[drag.panel];
  if (!slot.img) return;
  slot.ox = Math.max(-1, Math.min(1, slot.ox + dx / 240));
  slot.oy = Math.max(-1, Math.min(1, slot.oy + dy / 240));
  syncSlotControls();
  redraw();
});
canvas.addEventListener('pointerup', () => {
  drag = null;
  canvas.style.cursor = '';
});

// ---- export ----------------------------------------------------------------

function exportCover(key) {
  const a = ASPECTS[key];
  const off = document.createElement('canvas');
  off.width = a.w;
  off.height = a.h;
  drawCover(off.getContext('2d'), state, a.w, a.h);
  off.toBlob((blob) => {
    if (!blob) {
      say('Export failed: the browser could not make the PNG. Try again.');
      return;
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sunset-cover-${a.w}x${a.h}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 5000);
    say(`Saved sunset-cover-${a.w}x${a.h}.png`);
  }, 'image/png');
}

for (const [key, a] of Object.entries(ASPECTS)) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'export';
  button.textContent = `Export PNG ${a.w} x ${a.h}`;
  button.addEventListener('click', () => exportCover(key));
  $('exports').appendChild(button);
}

$('load-samples').addEventListener('click', async () => {
  for (let i = 0; i < 4; i++) await loadSampleIntoSlot(`samples/${SAMPLES[i]}`, i);
  say('Sample photos loaded. Edit the caption and export a cover.');
});

// ---- fixed screenshot scenes -----------------------------------------------

buildSlots();
syncSlotControls();

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, async (scene) => {
    state.preset = PRESETS[scene.preset] ?? PRESETS.golden;
    state.sizeKey = scene.size in ASPECTS ? scene.size : '1080x1080';
    state.title = scene.title;
    state.tagline = scene.tagline;
    $('title').value = scene.title;
    $('tagline').value = scene.tagline;
    for (let i = 0; i < scene.photos.length; i++) {
      state.photos[i] = { img: await loadImage(scene.photos[i]), zoom: 1, ox: 0, oy: 0 };
    }
    [...presetsEl.children].forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.preset === state.preset.id)));
    [...$('sizes').children].forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.size === state.sizeKey)));
    syncSlotControls();
    redraw();
  }).catch((err) => {
    say(`Shot scene failed: ${err.message}`);
    window.__shotReady = true;
  });
} else {
  // The display font changes the lettering, so paint again once it arrives.
  document.fonts.load('80px Anton').then(redraw).catch(() => {});
  document.fonts.ready.then(redraw).catch(() => {});
  redraw();
}
