// Screenshot docs/look/palette_board.html to docs/look/palette_family.png (run palette_board.py first).
const {chromium} = require('playwright');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 1400, height: 800}, deviceScaleFactor: 1.5});
  await page.goto('file://' + path.join(root, 'docs/look/palette_board.html'));
  await page.waitForTimeout(300);
  await page.screenshot({path: path.join(root, 'docs/look/palette_family.png'), fullPage: true});
  await browser.close();
})();
