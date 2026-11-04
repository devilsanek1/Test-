#!/usr/bin/env node
// render_test.mjs — the captions2 test stills: src/lib/captions2 playing a caption file over a still background, rendered
// by Remotion (the real component, 60 fps), at chosen times; with --capcheck also the caption mask and the bare frame,
// for `python3 scripts/capcheck.py <list> --words` (every word >= 4.5:1).
//
//   node scripts/captions2/render_test.mjs [--times=0,3.6,24.7,40] [--src=public/v4/captions2.json]
//        [--bg=scripts/type/bg/bg_night.png | --bg=none] [--out=out/v4] [--prefix=captions2_test] [--capcheck] [--debug]
//        [--comp=Captions2Test | Captions2Cover]   (the cover title R10 and the world word R7 on a plain tag)
//
// Writes <out>/<prefix>_<t>.png (+ _phone.jpg, 360 px wide: read it at 100 %), and with --capcheck <prefix>_<t>_mask.png,
// <prefix>_<t>_bg.png and <prefix>_capcheck.txt (the list capcheck.py reads). It bundles ONLY src/lib/captions2/demo/
// entry.tsx with a scratch public dir (the fonts, the caption file, the background), so no other lane's half-written
// file can break it and nothing is added to public/. One render at a time on the shared CPUs. Run from video/.
import path from 'node:path';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderFrames, selectComposition} from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
  const k = a.slice(2);
  const i = k.indexOf('=');
  return i < 0 ? [k, 'true'] : [k.slice(0, i), k.slice(i + 1)];
}));
const times = (opt.times ?? '0,3.6,24.7,40').split(',').map(Number);
const src = path.resolve(root, opt.src ?? 'public/v4/captions2.json');
const bgArg = opt.bg ?? 'scripts/type/bg/bg_night.png';
const outDir = path.resolve(root, opt.out ?? 'out/v4');
const prefix = opt.prefix ?? 'captions2_test';
const capcheck = opt.capcheck === 'true';
const debug = opt.debug === 'true';
const compId = opt.comp ?? 'Captions2Test';
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';

// the scratch public dir
const pub = path.join(root, 'node_modules/.cache/captions2/public');
fs.rmSync(pub, {recursive: true, force: true});
fs.mkdirSync(path.join(pub, 'fonts'), {recursive: true});
fs.mkdirSync(path.join(pub, 'cap'), {recursive: true});
for (const w of [300, 400, 700]) fs.copyFileSync(path.join(root, `public/fonts/Gaegu-${w}.woff2`), path.join(pub, `fonts/Gaegu-${w}.woff2`));
fs.copyFileSync(src, path.join(pub, 'cap/captions2.json'));
let bg = '';
if (bgArg !== 'none') {
  fs.copyFileSync(path.resolve(root, bgArg), path.join(pub, 'bg' + path.extname(bgArg)));
  bg = 'bg' + path.extname(bgArg);
}

fs.mkdirSync(outDir, {recursive: true});
const t0 = Date.now();
const serveUrl = await bundle({entryPoint: path.join(root, 'src/lib/captions2/demo/entry.tsx'), rootDir: root, publicDir: pub, enableCaching: true, onProgress: () => undefined});
const tag = (t) => t.toFixed(3).replace('.', '_');
const passes = [{name: '', props: {}}];
if (capcheck) passes.push({name: '_mask', props: {capcheck: 'mask'}}, {name: '_bg', props: {capcheck: 'bg'}});
const list = [];
for (const pass of passes) {
  const inputProps = {src: 'cap/captions2.json', bg, debug: debug && !pass.name, ...pass.props};
  const composition = await selectComposition({serveUrl, id: compId, inputProps, browserExecutable, logLevel: 'error'});
  const fps = composition.fps;
  const frameOf = (s) => Math.max(0, Math.min(composition.durationInFrames - 1, Math.round(s * fps)));
  const frames = [...new Set(times.map(frameOf))].sort((a, b) => a - b);
  const tmp = fs.mkdtempSync(path.join(outDir, '.c2frames-'));
  await renderFrames({composition, serveUrl, inputProps, frames, outputDir: tmp, imageFormat: 'png', concurrency: 2, browserExecutable, logLevel: 'error', onStart: () => undefined, onFrameUpdate: () => undefined});
  const files = fs.readdirSync(tmp).filter((f) => f.endsWith('.png')).sort();
  const byFrame = new Map(files.map((f) => [Number(f.match(/(\d+)\.png$/)[1]), f]));
  for (const s of times) {
    const fr = frameOf(s);
    const dst = path.join(outDir, `${prefix}_${tag(fr / fps)}${pass.name}.png`);
    fs.copyFileSync(path.join(tmp, byFrame.get(fr) ?? files[frames.indexOf(fr)]), dst);
    if (!pass.name) {
      execFileSync('python3', ['-c', `from PIL import Image; im=Image.open(${JSON.stringify(dst)}).convert('RGB'); im.resize((360,640), Image.LANCZOS).save(${JSON.stringify(dst.replace(/\.png$/, '_phone.jpg'))}, quality=88)`]);
      console.log(`${(fr / fps).toFixed(3)} ${fr} ${path.relative(root, dst)}`);
    }
  }
  fs.rmSync(tmp, {recursive: true, force: true});
  if (pass.name === '_bg') {
    for (const s of times) {
      const fr = frameOf(s);
      const f = (n) => path.join(outDir, `${prefix}_${tag(fr / fps)}${n}.png`);
      list.push(`${(fr / fps).toFixed(3)} ${fr} ${f('_bg')} ${f('_mask')}`);
    }
  }
}
if (capcheck) {
  const lp = path.join(outDir, `${prefix}_capcheck.txt`);
  fs.writeFileSync(lp, list.join('\n') + '\n');
  console.log(`capcheck list: ${path.relative(root, lp)}  (python3 scripts/capcheck.py ${path.relative(root, lp)} --words --captions=${path.relative(root, src)})`);
}
fs.rmSync(serveUrl, {recursive: true, force: true});
console.error(`[captions2 render_test] ${times.length} times x ${passes.length} passes in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
