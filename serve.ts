// A minimal static file server for the app, for local play-testing only.
//
// Serves the files under app/ on http://localhost:8080. Any path that would
// climb out of app/ is refused. Node 22, standard library only.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = resolve(join(fileURLToPath(import.meta.url), '..', 'app'));
const PORT = 8080;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    let path = decodeURIComponent(url.pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = resolve(join(APP, normalize(path)));
    if (!file.startsWith(APP + sep) && file !== APP) {
      res.writeHead(403, { 'content-type': 'text/plain' });
      res.end('Forbidden: outside app/');
      return;
    }
    const bytes = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(bytes);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Serving app/ at http://localhost:${PORT}`);
});
