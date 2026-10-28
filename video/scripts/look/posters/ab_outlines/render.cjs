// Render an SVG or HTML file to PNG with the pre-installed Chromium (Playwright).
//   node render.cjs <in.svg|in.html> <out.png> [width] [height|full] [deviceScaleFactor]
// An SVG is shown at its own width/height; an HTML page is shot full-page at `width` CSS px.
const {chromium} = require('playwright');
const path = require('path');
(async () => {
  const [inp, out, w = '1800', h = 'full', dpr = '1'] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: +w, height: h === 'full' ? 1000 : +h}, deviceScaleFactor: +dpr});
  await page.goto('file://' + path.resolve(inp));
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(200);
  if (inp.endsWith('.svg')) {
    const el = await page.$('svg');
    await el.screenshot({path: out, omitBackground: false});
  } else {
    await page.screenshot({path: out, fullPage: h === 'full'});
  }
  await browser.close();
})();
