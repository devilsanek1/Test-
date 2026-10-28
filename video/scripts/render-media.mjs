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
//
// --master: THE MASTER ENCODE, the one place its settings live (docs/look/CRAFT.md §g, docs/PIPELINE_V2.md "Master
// encode"; measured 2026-10-28 on lib/sky's demo, docs/look/research/2026-10-27_sky_gradients.md §5):
//   lossless PNG frames         Remotion's default video frames are JPEG q80: they erase a sky's dither and band it;
//   colorSpace bt709            Remotion converts to limited-range BT.709 with zscale and tags it, in ONE encode (the old
//                               second "TV-range" pass re-encoded a BT.601 file and only re-labelled it BT.709: the
//                               mint sky came out 1.7 L* darker, dE76 up to 2.5, and the sky banded again);
//   x264 CRF 14, preset slow, aq-mode 3, yuv420p (8-bit High: every phone and platform decodes it), mp4 faststart.
//   node scripts/render-media.mjs Film2R out/v2r_master.mp4 --entry=src/entry-v2r-film.tsx --master --props='{"draftLabel":false}'
//   python3 -I scripts/qa/check_banding.py out/v2r_master.mp4 --region <the sky> --times <the sky shots>
// --crf / --codec still override; a 1440 x 2560 YouTube master is --master --scale=4/3 (a fraction is fine; a decimal
// that misses whole pixels, 1.3333 -> 2559.94 px, which Remotion refuses, snaps to the nearest whole-pixel size).
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [compId, outArg, ...rest] = process.argv.slice(2);
if (!compId || !outArg) {
  console.error('usage: render-media.mjs <CompId> <out> [--entry=...] [--scale=1] [--concurrency=3] [--frames=a-b] [--props=JSON] [--codec=h264] [--crf=18] [--master]');
  process.exit(2);
}
const opt = Object.fromEntries(rest.filter((a) => a.startsWith('--')).map((a) => {
  const k = a.slice(2);
  const i = k.indexOf('=');
  return i < 0 ? [k, 'true'] : [k.slice(0, i), k.slice(i + 1)];
}));
const inputProps = opt.props ? JSON.parse(opt.props) : {};
const fraction = (v) => {
  const m = String(v).match(/^\s*([\d.]+)\s*\/\s*([\d.]+)\s*$/);
  return m ? Number(m[1]) / Number(m[2]) : Number(v);
};
let scale = opt.scale ? fraction(opt.scale) : 1;
const concurrency = opt.concurrency ? Number(opt.concurrency) : 3;
const codec = opt.codec ?? 'h264';
/** The master encode (see the header): lossless frames, one BT.709 conversion, x264 CRF 14 slow + aq-mode 3. */
export const MASTER = {imageFormat: 'png', colorSpace: 'bt709', crf: 14, x264Preset: 'slow', pixelFormat: 'yuv420p', x264Params: 'aq-mode=3'};
const master = opt.master === 'true' && codec === 'h264';
/** Add -x264-params to the encoding ffmpeg call (the pre-stitcher; the stitcher too when it encodes rather than copies). */
const withX264Params = ({args}) => {
  const i = args.indexOf('libx264');
  if (i < 0 || args[i - 1] !== '-c:v') return args;
  const out = args.slice(0, -1);
  out.push('-x264-params', MASTER.x264Params, args[args.length - 1]);
  return out;
};
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const chromiumOptions = process.env.GL && process.env.GL !== 'default' ? {gl: process.env.GL} : {};
const entryPoint = path.resolve(opt.entry ?? path.join(root, 'src/index.ts'));
const frameRange = opt.frames ? opt.frames.split('-').map(Number) : null;
const out = path.resolve(outArg);
fs.mkdirSync(path.dirname(out), {recursive: true});

const t0 = Date.now();
const serveUrl = await bundle({entryPoint, rootDir: root, publicDir: path.join(root, 'public'), enableCaching: true, onProgress: () => undefined});
const composition = await selectComposition({serveUrl, id: compId, inputProps, browserExecutable, chromiumOptions, logLevel: 'error'});
if (!Number.isInteger(composition.height * scale) || !Number.isInteger(composition.width * scale)) {
  const snap = Math.round(composition.height * scale) / composition.height;
  if (Math.abs(snap - scale) < 1e-3 && Number.isInteger(composition.width * snap)) scale = snap;
}
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
  ...(master ? {imageFormat: MASTER.imageFormat, colorSpace: MASTER.colorSpace, crf: MASTER.crf, x264Preset: MASTER.x264Preset, pixelFormat: MASTER.pixelFormat, ffmpegOverride: withX264Params} : {}),
  ...(opt.crf ? {crf: Number(opt.crf)} : {}),
  onProgress: ({renderedFrames}) => {
    if (renderedFrames - shown >= Math.max(60, Math.round(total / 10))) {
      shown = renderedFrames;
      console.error(`[render-media] ${renderedFrames}/${total} frames, ${((Date.now() - t1) / 1000).toFixed(0)} s`);
    }
  },
});
fs.rmSync(serveUrl, {recursive: true, force: true});
console.error(`[render-media] ${compId} (${path.relative(root, entryPoint)}): bundle ${((t1 - t0) / 1000).toFixed(1)} s, ${total} frames in ${((Date.now() - t1) / 1000).toFixed(1)} s (scale ${scale}, concurrency ${concurrency}, GL ${process.env.GL ?? 'default'}${master ? ', MASTER: png frames, bt709, x264 crf ' + (opt.crf ?? MASTER.crf) + ' slow aq-mode 3' : ''}) -> ${out}`);
