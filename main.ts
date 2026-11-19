// Sunset Cover Studio's entrypoint: hands the app in.
//
// Copies app/ and screenshots/ from beside this file into the output directory
// (MAKEFUN_OUTPUT_DIR, else /output), then writes output/dossier.json with
// buildDossier from vendor/makefun-app.ts. Node 22, standard library only.
//
// The copy is deterministic: files are walked in sorted order and copied byte
// for byte, so two runs write the same bytes. The output directory itself is
// never removed — only its contents are cleared — because the grader mounts it
// read-only for the process and removing it would fail.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const REPO = dirname(fileURLToPath(import.meta.url));
const OUT = process.env.MAKEFUN_OUTPUT_DIR || '/output';

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

/** Empties a directory's contents without removing the directory itself. */
function clearContents(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    return;
  }
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

/** Copies a directory tree in sorted order, byte for byte. */
function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  const entries = readdirSync(from, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1));
  for (const entry of entries) {
    const src = join(from, entry.name);
    const dst = join(to, entry.name);
    if (entry.isDirectory()) copyTree(src, dst);
    else if (entry.isFile()) cpSync(src, dst);
  }
}

/** Refuses a screenshots/ that breaks the gate's caps, before any dossier is written. */
function checkScreenshots(dir) {
  const names = readdirSync(dir).filter((n) => !n.startsWith('.')).sort();
  if (names.length > DOSSIER_CAPS.screenshots.max) {
    throw new Error(`screenshots/: ${names.length} images, over the ${DOSSIER_CAPS.screenshots.max} allowed`);
  }
  for (const name of names) {
    const size = statSync(join(dir, name)).size;
    if (size > DOSSIER_CAPS.screenshots.max_bytes) {
      throw new Error(`screenshots/${name}: ${size} bytes, over the ${DOSSIER_CAPS.screenshots.max_bytes} allowed`);
    }
  }
}

clearContents(OUT);
copyTree(join(REPO, 'app'), join(OUT, 'app'));
copyTree(join(REPO, 'screenshots'), join(OUT, 'screenshots'));
checkScreenshots(join(OUT, 'screenshots'));
writeFileSync(join(OUT, 'dossier.json'), buildDossier(OUT, DOSSIER_CAPS));
console.log(`Wrote ${OUT}/dossier.json`);
