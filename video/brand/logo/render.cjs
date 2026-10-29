// Screenshot an HTML file with the pre-installed Playwright Chromium.
// usage: node render.cjs <in.html> <out.png> <width> [scale=1] [fullPage=1]
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const [inp, out, width, scale = '1', full = '1'] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +width, height: 800 }, deviceScaleFactor: +scale });
  await page.goto('file://' + path.resolve(inp), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, fullPage: full === '1' });
  await browser.close();
})();
