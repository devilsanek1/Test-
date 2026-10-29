// Render SVG files to PNG with Playwright's Chromium: node render.cjs in.svg out.png [in2.svg out2.png ...]
// The PNG takes the SVG's width/height attributes as its size (deviceScaleFactor 1).
const {chromium} = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
(async () => {
  const args = process.argv.slice(2);
  const browser = await chromium.launch();
  for (let i = 0; i + 1 < args.length; i += 2) {
    const svg = fs.readFileSync(args[i], 'utf8');
    const w = +(svg.match(/<svg[^>]*\swidth="(\d+)"/) || [0, 1080])[1];
    const h = +(svg.match(/<svg[^>]*\sheight="(\d+)"/) || [0, 1920])[1];
    const page = await browser.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 1});
    await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;padding:0;overflow:hidden;background:#fff}svg{display:block}</style></head><body>${svg}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    await page.screenshot({path: args[i + 1], clip: {x: 0, y: 0, width: w, height: h}});
    await page.close();
  }
  await browser.close();
})();
