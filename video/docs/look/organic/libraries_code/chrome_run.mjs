// Run a page in the local chrome-headless-shell with WebGL2 (SwiftShader), serving /tmp/organic/libraries from memory
// routes (no server process). The page sets window.__done = {png: dataURL, ...} when finished.
// usage: node chrome_run.mjs <page path under /tmp/organic/libraries> <out.png> [query]
import fs from 'fs';
import path from 'path';
const { chromium } = await import('/tmp/organic/libraries/npm/node_modules/playwright-core/index.mjs');
const ROOT = '/tmp/organic/libraries';
const [page_, outPng, query = ''] = process.argv.slice(2);
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.wasm': 'application/wasm' };
await page.route('http://lib.local/**', async (route) => {
  const u = new URL(route.request().url());
  const p = path.join(ROOT, decodeURIComponent(u.pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) return route.fulfill({ status: 404, body: 'nf' });
  route.fulfill({ status: 200, body: fs.readFileSync(p), headers: { 'content-type': types[path.extname(p)] || 'application/octet-stream' } });
});
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const t0 = Date.now();
await page.goto(`http://lib.local/${page_}${query ? '?' + query : ''}`);
await page.waitForFunction(() => window.__done !== undefined, null, { timeout: 600000 });
const done = await page.evaluate(() => window.__done);
if (done.error) { console.log('ERROR', done.error); process.exit(1); }
fs.writeFileSync(outPng, Buffer.from(done.png.split(',')[1], 'base64'));
console.log(`chrome: ${page_} -> ${outPng} in ${((Date.now() - t0) / 1000).toFixed(1)} s`, done.info ?? '');
await browser.close();
