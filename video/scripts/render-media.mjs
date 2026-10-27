#!/usr/bin/env node
// render-media.mjs — render a composition (or a frame range of it) to a video / audio file in ONE bundle with
// @remotion/renderer's renderMedia and the browser render-frames.mjs uses. Chrome's default GL (Skia CPU raster) is the
// default here: on the 4-core box it renders v3's Film3 ~10x faster than the CLI (remotion.config.ts sets 'swangle':
// 0.27 vs 2.9 s per full-size frame), and the pictures differ only in anti-aliasing (4-9 % of the pixels by a few
// levels, nothing visible at 1:1). Use ONE GL for every chunk of a film and for its seam stills (GL=swangle to match a
// CLI render).
//   node scripts/render-media.mjs <CompId> <out> [--entry=src/entry-v3-film.tsx] [--scale=1] [--concurrency=3]
//        [--frames=a-b] [--props='{"k":1}'] [--codec=h264|wav|...] [--crf=18] [--timeout=120000]
// Chunked full-size render (docs/G5_BLOCKING.md §8b; chunk list: scripts/film_chunks.py), e.g. one chunk:
//   node scripts/render-media.mjs Film3 /tmp/c/03_SQC.mp4 --entry=src/entry-v3-film.tsx --frames=996-1163
// and the film's audio once: node scripts/render-media.mjs Film3 /tmp/c/film_audio.wav --entry=... --codec=wav
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [compId, outArg, ...rest] = process.argv.slice(2);
if (!compId || !outArg) {
  console.error('usage: render-media.mjs <CompId> <out> [--entry=...] [--scale=1] [--concurrency=3] [--frames=a-b] [--props=JSON] [--codec=h264] [--crf=18]');
  process.exit(2);
}
const opt = Object.fromEntries(rest.filter((a) => a.startsWith('--')).map((a) => {
  const k = a.slice(2);
  const i = k.indexOf('=');
  return i < 0 ? [k, 'true'] : [k.slice(0, i), k.slice(i + 1)];
}));
const inputProps = opt.props ? JSON.parse(opt.props) : {};
const scale = opt.scale ? Number(opt.scale) : 1;
const concurrency = opt.concurrency ? Number(opt.concurrency) : 3;
const codec = opt.codec ?? 'h264';
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const chromiumOptions = process.env.GL && process.env.GL !== 'default' ? {gl: process.env.GL} : {};
const entryPoint = path.resolve(opt.entry ?? path.join(root, 'src/index.ts'));
const frameRange = opt.frames ? opt.frames.split('-').map(Number) : null;
const out = path.resolve(outArg);
fs.mkdirSync(path.dirname(out), {recursive: true});

const t0 = Date.now();
const serveUrl = await bundle({entryPoint, rootDir: root, publicDir: path.join(root, 'public'), enableCaching: true, onProgress: () => undefined});
const composition = await selectComposition({serveUrl, id: compId, inputProps, browserExecutable, chromiumOptions, logLevel: 'error'});
const t1 = Date.now();
const total = frameRange ? frameRange[1] - frameRange[0] + 1 : composition.durationInFrames;
let shown = 0;
await renderMedia({
  composition,
  serveUrl,
  codec,
  outputLocation: out,
  inputProps,
  scale,
  concurrency,
  browserExecutable,
  chromiumOptions,
  logLevel: 'error',
  timeoutInMilliseconds: opt.timeout ? Number(opt.timeout) : 120000,
  ...(frameRange ? {frameRange} : {}),
  ...(opt.crf ? {crf: Number(opt.crf)} : {}),
  onProgress: ({renderedFrames}) => {
    if (renderedFrames - shown >= Math.max(60, Math.round(total / 10))) {
      shown = renderedFrames;
      console.error(`[render-media] ${renderedFrames}/${total} frames, ${((Date.now() - t1) / 1000).toFixed(0)} s`);
    }
  },
});
fs.rmSync(serveUrl, {recursive: true, force: true});
console.error(`[render-media] ${compId} (${path.relative(root, entryPoint)}): bundle ${((t1 - t0) / 1000).toFixed(1)} s, ${total} frames in ${((Date.now() - t1) / 1000).toFixed(1)} s (scale ${scale}, concurrency ${concurrency}, GL ${process.env.GL ?? 'default'}) -> ${out}`);
