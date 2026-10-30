// techniques_chrome_bench.js: runs techniques_chrome_bench.html in the render's headless shell with SwiftShader (as
// remotion.config.ts's 'swangle'), on the v6 still; prints JSON (docs/look/organic/techniques.md §3.7, §3.12).
//   node docs/look/organic/techniques_chrome_bench.js        (from video/; Playwright from the global install)
const path = require('path');
const fs = require('fs');
const {chromium} = require(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const STILL = path.join(__dirname, '../../studies/2026-10-28_city_posters/paint_test/paint_still_v6.png');
(async () => {
  const browser = await chromium.launch({executablePath: EXE, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
  const page = await browser.newPage();
  await page.goto('file://' + path.join(__dirname, 'techniques_chrome_bench.html'));
  const b64 = fs.readFileSync(STILL).toString('base64');
  const svg = await page.evaluate(async (b) => await window.runSVG(b), b64);
  const vec = await page.evaluate(async () => await window.runVec());
  const gl = await page.evaluate(async (s) => await window.runGL(s), 'data:image/png;base64,' + b64);
  delete gl.akf_png;
  console.log(JSON.stringify({...svg, ...vec, ...gl}, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
