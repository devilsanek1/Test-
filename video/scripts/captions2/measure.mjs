#!/usr/bin/env node
// measure.mjs — the caption hand's ink metrics, measured in Chromium (the engine that draws the captions), for
// scripts/captions2/build_captions.py: every line-break, seat and type-frame decision uses these numbers.
//
//   node scripts/captions2/measure.mjs in.json out.json        # in: {"items": [{"t", "w", "size", "track"}]}
//   node scripts/captions2/measure.mjs --verify                # canvas metrics vs the SVG text's rendered pixels
//
// Each item is measured exactly like src/lib/captions2/layout.ts measures it in the browser: a canvas 2D context with
// `font = "<w> <size>px Gaegu"` and `letterSpacing = <track * size>px`; returned per item: adv (the advance, trailing
// letter-spacing included, as canvas and SVG both lay it out), left / right (the ink's edges relative to the origin,
// the trailing letter-spacing taken off the right), asc / desc (the ink above / below the baseline). Fonts:
// public/fonts/Gaegu-<w>.woff2 (OFL). Run from video/.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch {
  playwright = require(require.resolve('playwright', {paths: ['/usr/lib/node_modules', '/usr/local/lib/node_modules', process.cwd()]}));
}
const VIDEO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FONTS = path.join(VIDEO, 'public', 'fonts');
const WEIGHTS = [300, 400, 700];
const faceCss = WEIGHTS.map((w) => `@font-face{font-family:'Gaegu';src:url('${pathToFileURL(path.join(FONTS, `Gaegu-${w}.woff2`)).href}') format('woff2');font-weight:${w};font-style:normal;font-display:block}`).join('\n');

const args = process.argv.slice(2);
const verify = args.includes('--verify');
const [inPath, outPath] = args.filter((a) => !a.startsWith('--'));
if (!verify && (!inPath || !outPath)) {
  console.error('usage: node scripts/captions2/measure.mjs in.json out.json | --verify');
  process.exit(2);
}

// scratch space inside the project's gitignored cache (node_modules/.cache), removed on exit
const cacheDir = path.join(VIDEO, 'node_modules', '.cache', 'captions2');
fs.mkdirSync(cacheDir, {recursive: true});
const tmp = fs.mkdtempSync(path.join(cacheDir, 'measure-'));
const page0 = path.join(tmp, 'm.html');
fs.writeFileSync(page0, `<!doctype html><html><head><meta charset="utf-8"><style>${faceCss}html,body{margin:0;background:#000}</style></head><body><canvas id="c" width="8" height="8"></canvas></body></html>`);

const browser = await playwright.chromium.launch();
try {
  const page = await browser.newPage({viewport: {width: 1080, height: 1920}, deviceScaleFactor: 1});
  await page.goto(pathToFileURL(page0).href);
  await page.evaluate(async (ws) => {
    await Promise.all(ws.map((w) => document.fonts.load(`${w} 100px 'Gaegu'`, 'AIaH0123')));
    await document.fonts.ready;
  }, WEIGHTS);
  const measureAll = (items) =>
    page.evaluate((items) => {
      const ctx = document.getElementById('c').getContext('2d');
      return items.map((it) => {
        const track = it.track ?? 0.02;
        ctx.font = `${it.w} ${it.size}px 'Gaegu'`;
        ctx.letterSpacing = `${track * it.size}px`;
        const m = ctx.measureText(it.t);
        return {...it, adv: m.width, left: -m.actualBoundingBoxLeft, right: m.actualBoundingBoxRight - track * it.size, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent};
      });
    }, items);

  if (verify) {
    // render each sample as SVG <text> (the way the component draws it) and compare the pixel ink box with the canvas
    const samples = [
      {t: 'computers,', w: 300, size: 116, track: 0.02},
      {t: 'Did you know', w: 300, size: 136, track: 0.02},
      {t: 'tea.', w: 300, size: 190, track: 0.02},
      {t: 'wants', w: 700, size: 156, track: 0.02},
      {t: '70', w: 700, size: 250, track: -0.02},
      {t: 'AI actually runs', w: 300, size: 116, track: 0.02},
      {t: 'AI actually runs', w: 300, size: 116, track: 0},
    ];
    const ms = await measureAll(samples);
    for (const m of ms) {
      const ox = 100;
      const by = 300;
      await page.setContent(`<!doctype html><html><head><style>${faceCss}html,body{margin:0;background:#000}</style></head><body><svg width="1080" height="600" viewBox="0 0 1080 600" style="display:block"><text x="${ox}" y="${by}" style="font-family:'Gaegu';font-weight:${m.w};font-size:${m.size}px;letter-spacing:${(m.track ?? 0.02) * m.size}px;fill:#fff;font-kerning:normal">${m.t}</text></svg></body></html>`);
      await page.evaluate(async (w) => {
        await document.fonts.load(`${w} 100px 'Gaegu'`, 'A');
        await document.fonts.ready;
      }, m.w);
      const buf = await page.screenshot({clip: {x: 0, y: 0, width: 1080, height: 600}});
      const png = path.join(tmp, 'v.png');
      fs.writeFileSync(png, buf);
      const {execFileSync} = await import('node:child_process');
      const box = execFileSync('python3', ['-c', `import numpy as np;from PIL import Image;a=np.asarray(Image.open(${JSON.stringify(png)}).convert('L'))>100;ys,xs=np.nonzero(a);print(xs.min(),xs.max(),ys.min(),ys.max())`]).toString().trim().split(' ').map(Number);
      console.log(`${JSON.stringify(m.t).padEnd(20)} w${m.w} ${m.size}px track ${m.track}: canvas ink x ${(ox + m.left).toFixed(1)}-${(ox + m.right).toFixed(1)} (w ${(m.right - m.left).toFixed(1)}), y ${(by - m.asc).toFixed(1)}-${(by + m.desc).toFixed(1)} | svg pixels x ${box[0]}-${box[1]} (w ${box[1] - box[0] + 1}), y ${box[2]}-${box[3]}`);
    }
  } else {
    const inp = JSON.parse(fs.readFileSync(inPath, 'utf8'));
    const out = await measureAll(inp.items);
    fs.writeFileSync(outPath, JSON.stringify({engine: 'chromium canvas measureText', items: out}));
  }
} finally {
  await browser.close();
  fs.rmSync(tmp, {recursive: true, force: true});
}
