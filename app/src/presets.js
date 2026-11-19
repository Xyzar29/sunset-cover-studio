// The three cover presets of Sunset Cover Studio.
//
// Each preset names its panels as fractions of the cover (x, y, width, height,
// 0..1), a caption band, a colour grade, a sun, silhouettes and caption style.
// A panel may carry a `slant`: the top edge is shifted right by that fraction of
// the cover width, so Neon Nights gets its diagonal split. Layouts are given
// per aspect class: square, portrait and landscape.

export const ASPECTS = {
  '1080x1080': { w: 1080, h: 1080, kind: 'square', label: 'Square 1080 x 1080' },
  '1080x1350': { w: 1080, h: 1350, kind: 'portrait', label: 'Portrait 1080 x 1350' },
  '1920x1080': { w: 1920, h: 1080, kind: 'landscape', label: 'Wide 1920 x 1080' },
};

export const PRESETS = {
  golden: {
    id: 'golden',
    name: 'Golden Hour',
    blurb: 'Warm sunset grid: a big hero panel, three small ones, a striped sun.',
    sky: ['#2b1445', '#7a2a63', '#e2543e', '#f9a03f', '#ffd97a'],
    grade: ['rgba(255, 122, 61, 0.28)', 'rgba(122, 42, 99, 0.30)'],
    sun: { x: 0.5, y: 0.84, r: 0.16, color: '#ff9e2e', stripes: true },
    palms: true,
    skyline: false,
    rain: false,
    caption: {
      fill: '#fff6e8',
      outline: '#1c0f2e',
      shadow: 'rgba(28, 15, 46, 0.55)',
      align: 'center',
      taglineColor: '#ffe3b3',
    },
    panels: {
      square: [
        { x: 0.03, y: 0.03, w: 0.6, h: 0.44 },
        { x: 0.65, y: 0.03, w: 0.32, h: 0.21 },
        { x: 0.65, y: 0.26, w: 0.32, h: 0.21 },
        { x: 0.03, y: 0.49, w: 0.94, h: 0.17 },
      ],
      portrait: [
        { x: 0.03, y: 0.02, w: 0.94, h: 0.36 },
        { x: 0.03, y: 0.4, w: 0.46, h: 0.16 },
        { x: 0.51, y: 0.4, w: 0.46, h: 0.16 },
        { x: 0.03, y: 0.58, w: 0.94, h: 0.12 },
      ],
      landscape: [
        { x: 0.02, y: 0.03, w: 0.46, h: 0.64 },
        { x: 0.5, y: 0.03, w: 0.24, h: 0.31 },
        { x: 0.76, y: 0.03, w: 0.22, h: 0.31 },
        { x: 0.5, y: 0.36, w: 0.48, h: 0.31 },
      ],
    },
    captionBand: {
      square: { x: 0, y: 0.68, w: 1, h: 0.32 },
      portrait: { x: 0, y: 0.72, w: 1, h: 0.28 },
      landscape: { x: 0, y: 0.7, w: 1, h: 0.3 },
    },
  },

  neon: {
    id: 'neon',
    name: 'Neon Nights',
    blurb: 'Diagonal split, magenta and cyan duotone, glowing tall caption.',
    sky: ['#0d0618', '#2b0f4d', '#a4136b', '#ff2e88'],
    grade: ['rgba(255, 46, 136, 0.30)', 'rgba(0, 229, 255, 0.26)'],
    sun: { x: 0.78, y: 0.84, r: 0.13, color: '#ff5ea8', stripes: false, glow: true },
    palms: false,
    skyline: true,
    rain: true,
    caption: {
      fill: '#eafcff',
      outline: '#12041f',
      shadow: 'rgba(255, 46, 136, 0.65)',
      align: 'center',
      taglineColor: '#8ef3ff',
    },
    panels: {
      square: [
        { x: 0.03, y: 0.03, w: 0.58, h: 0.63, slant: 0.06 },
        { x: 0.65, y: 0.03, w: 0.32, h: 0.3, slant: -0.04 },
        { x: 0.61, y: 0.35, w: 0.17, h: 0.31, slant: -0.04 },
        { x: 0.8, y: 0.35, w: 0.17, h: 0.31, slant: -0.04 },
      ],
      portrait: [
        { x: 0.03, y: 0.02, w: 0.94, h: 0.36, slant: 0.03 },
        { x: 0.03, y: 0.4, w: 0.46, h: 0.14, slant: -0.03 },
        { x: 0.51, y: 0.4, w: 0.46, h: 0.14, slant: -0.03 },
        { x: 0.03, y: 0.56, w: 0.94, h: 0.14, slant: 0.03 },
      ],
      landscape: [
        { x: 0.02, y: 0.03, w: 0.46, h: 0.64, slant: 0.05 },
        { x: 0.5, y: 0.03, w: 0.24, h: 0.31, slant: -0.03 },
        { x: 0.76, y: 0.03, w: 0.22, h: 0.31, slant: -0.03 },
        { x: 0.5, y: 0.36, w: 0.48, h: 0.31, slant: -0.03 },
      ],
    },
    captionBand: {
      square: { x: 0, y: 0.68, w: 1, h: 0.32 },
      portrait: { x: 0, y: 0.72, w: 1, h: 0.28 },
      landscape: { x: 0, y: 0.7, w: 1, h: 0.3 },
    },
  },

  coastal: {
    id: 'coastal',
    name: 'Coastal Cruise',
    blurb: 'Three bright strips: sky, sea, street, under a retro stripe sun.',
    sky: ['#bfe8f2', '#ffe9b8', '#ffd27a'],
    grade: ['rgba(255, 214, 122, 0.18)', 'rgba(64, 190, 220, 0.16)'],
    sun: { x: 0.5, y: 0.82, r: 0.14, color: '#ff8f3d', stripes: true },
    palms: true,
    skyline: false,
    rain: false,
    caption: {
      fill: '#17324a',
      outline: '#fff8ea',
      shadow: 'rgba(23, 50, 74, 0.35)',
      align: 'center',
      taglineColor: '#1d5a74',
    },
    panels: {
      square: [
        { x: 0.03, y: 0.03, w: 0.94, h: 0.2 },
        { x: 0.03, y: 0.25, w: 0.94, h: 0.18 },
        { x: 0.03, y: 0.45, w: 0.94, h: 0.18 },
      ],
      portrait: [
        { x: 0.03, y: 0.02, w: 0.94, h: 0.22 },
        { x: 0.03, y: 0.26, w: 0.94, h: 0.2 },
        { x: 0.03, y: 0.48, w: 0.94, h: 0.2 },
      ],
      landscape: [
        { x: 0.02, y: 0.03, w: 0.96, h: 0.2 },
        { x: 0.02, y: 0.25, w: 0.96, h: 0.18 },
        { x: 0.02, y: 0.45, w: 0.96, h: 0.2 },
      ],
    },
    captionBand: {
      square: { x: 0, y: 0.65, w: 1, h: 0.35 },
      portrait: { x: 0, y: 0.7, w: 1, h: 0.3 },
      landscape: { x: 0, y: 0.67, w: 1, h: 0.33 },
    },
  },
};

/** The preset's panels for an aspect kind, as pixel rects on a cover of width W and height H. */
export function panelsFor(preset, kind, W, H) {
  return preset.panels[kind].map((p) => ({
    x: p.x * W,
    y: p.y * H,
    w: p.w * W,
    h: p.h * H,
    slant: (p.slant ?? 0) * W,
  }));
}

/** The preset's caption band for an aspect kind, as a pixel rect. */
export function captionBandFor(preset, kind, W, H) {
  const b = preset.captionBand[kind];
  return { x: b.x * W, y: b.y * H, w: b.w * W, h: b.h * H };
}
