import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.webmanifest':'application/manifest+json', '.svg':'image/svg+xml', '.png':'image/png', '.json':'application/json' };
const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!file.startsWith(root + sep) && file !== resolve(root, 'index.html')) { res.writeHead(403).end('Forbidden'); return; }
  try {
    if (!statSync(file).isFile()) throw new Error('not a file');
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'no-referrer' });
    createReadStream(file).pipe(res);
  } catch { res.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' }).end('Not found'); }
});
const port = Number(process.env.PORT || 4173);
server.listen(port, '127.0.0.1', () => console.log(`FinTrack local: http://127.0.0.1:${port}`));

