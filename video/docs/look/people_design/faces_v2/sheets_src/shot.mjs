// shot.mjs page.html out.png W H : an HTML page -> PNG at any size (the same Playwright/Chromium as scripts/type/render.mjs)
import {createRequire} from 'module';
import path from 'path';
import {pathToFileURL} from 'url';
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require(require.resolve('playwright', {paths: ['/usr/lib/node_modules', '/usr/local/lib/node_modules', '/home/user/Test-/video/node_modules', process.cwd()]})); }
const [page, out, W, H] = process.argv.slice(2);
const browser = await playwright.chromium.launch();
const p = await browser.newPage({viewport: {width: +W, height: +H}, deviceScaleFactor: 1});
await p.goto(pathToFileURL(path.resolve(page)).href);
await p.waitForTimeout(150);
await p.screenshot({path: out, clip: {x: 0, y: 0, width: +W, height: +H}});
await browser.close();
console.log('wrote', out);
