// Fixed scenes for reproducible screenshots.
//
// A `?shot=` query names a scene: `cover` paints the cover alone (editor hidden),
// `editor` shows the full editor with photos loaded. The query may also carry
// `preset`, `size`, `title`, `tagline` and up to four `photo0..photo3` sample
// names (files under samples/). `window.__shotReady` is set once the cover is
// painted with the display font loaded, so a screenshot script can wait on it.

export async function runShot(shot, query, apply) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const photos = [];
  for (let i = 0; i < 4; i++) {
    const name = query.get(`photo${i}`);
    if (name) photos.push(`samples/${name}.jpg`);
  }
  if (photos.length === 0) photos.push(`samples/${query.get('photo') ?? 'hero'}.jpg`);
  await apply({
    preset: query.get('preset') ?? 'golden',
    size: query.get('size') ?? '1080x1080',
    title: query.get('title') ?? 'Sunset Heist',
    tagline: query.get('tagline') ?? 'Vice City · Golden Hour',
    photos,
  });
  // Two frames past the paint, once the display font is in hand.
  await document.fonts.load('80px Anton');
  await document.fonts.ready;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
