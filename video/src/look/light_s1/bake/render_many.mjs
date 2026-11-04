#!/usr/bin/env node
// render_many.mjs: many renders of LightS1 (one frame each) in ONE bundle and ONE browser (light_proof.md §6): the
// bake's parts renders, the three stills, the bench. From video/:
//   node src/look/light_s1/bake/render_many.mjs <jobs.json> <outDir> [--concurrency=1]
// jobs.json: [{"name": "base", "t": 1.0, "props": {"look": "light", "parts": [...], "slab": "#000000"}}, ...]
// Writes <outDir>/<name>.png and prints "<name> <ms>" per job (ms = the frame's render incl. its page setup).
// GL as render-frames.mjs (GL=angle, as the paint bakes and light.md's bench render).
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderFrames, selectComposition} from '@remotion/renderer';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const [jobsArg, outDirArg, ...rest] = process.argv.slice(2);
const opt = Object.fromEntries(rest.filter((a) => a.startsWith('--')).map((a) => {
  const k = a.slice(2);
  const i = k.indexOf('=');
  return i < 0 ? [k, 'true'] : [k.slice(0, i), k.slice(i + 1)];
}));
const jobs = JSON.parse(fs.readFileSync(jobsArg, 'utf8'));
const outDir = path.resolve(outDirArg);
fs.mkdirSync(outDir, {recursive: true});
const concurrency = opt.concurrency ? Number(opt.concurrency) : 1;
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const chromiumOptions = process.env.GL && process.env.GL !== 'default' ? {gl: process.env.GL} : {};
const entryPoint = path.join(root, 'src/look/light_s1/entry.tsx');
const tB = Date.now();
const serveUrl = await bundle({entryPoint, rootDir: root, publicDir: path.join(root, 'public'), enableCaching: true, onProgress: () => undefined});
console.error(`[render_many] bundle ${((Date.now() - tB) / 1000).toFixed(1)}s`);
const browser = await openBrowser('chrome', {browserExecutable, chromiumOptions});
try {
  for (const job of jobs) {
    const inputProps = job.props ?? {};
    const composition = await selectComposition({serveUrl, id: 'LightS1', inputProps, browserExecutable, chromiumOptions, puppeteerInstance: browser, logLevel: 'error'});
    const frames = (job.ts ?? [job.t ?? 1.0]).map((s) => Math.max(0, Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps))));
    const tmp = fs.mkdtempSync(path.join(outDir, '.frames-'));
    const t0 = Date.now();
    await renderFrames({
      composition, serveUrl, inputProps, frames, outputDir: tmp, imageFormat: 'png', concurrency, browserExecutable,
      chromiumOptions, puppeteerInstance: browser, logLevel: 'error', onStart: () => undefined, onFrameUpdate: () => undefined,
    });
    const ms = Date.now() - t0;
    const files = fs.readdirSync(tmp).filter((f) => f.endsWith('.png')).sort();
    if (files.length === 1) fs.copyFileSync(path.join(tmp, files[0]), path.join(outDir, `${job.name}.png`));
    else files.forEach((f, i) => fs.copyFileSync(path.join(tmp, f), path.join(outDir, `${job.name}_${String(frames[i]).padStart(5, '0')}.png`)));
    fs.rmSync(tmp, {recursive: true, force: true});
    console.log(`${job.name} ${frames.length} ${ms}`);
  }
} finally {
  await browser.close({silent: true});
  fs.rmSync(serveUrl, {recursive: true, force: true});
}
