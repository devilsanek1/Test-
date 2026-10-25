// Screenshots review/look/texture/*.html to PNG (1080x1920) and motion.html to frames/ (150 frames, 30 fps).
const {chromium} = require('playwright');
const fs = require('fs');
const path = require('path');
const dir = path.resolve(__dirname, '..', '..', 'review/look/texture');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 1080, height: 1920}, deviceScaleFactor: 1});
  for (const f of fs.readdirSync(dir).filter((f) => /^p\d_[A-D]\.html$/.test(f))) {
    await page.goto('file://' + path.join(dir, f));
    await page.screenshot({path: path.join(dir, f.replace('.html', '.png'))});
  }
  fs.mkdirSync(path.join(dir, 'frames'), {recursive: true});
  await page.goto('file://' + path.join(dir, 'motion.html'));
  for (let i = 0; i < 150; i++) {
    await page.evaluate((t) => window.setT(t), i / 149);
    await page.screenshot({path: path.join(dir, 'frames', `f${String(i).padStart(3, '0')}.png`)});
  }
  await browser.close();
})();
