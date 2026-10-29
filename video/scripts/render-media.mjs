#!/usr/bin/env node
// render-media.mjs — render a composition (or a frame range of it) to a video / audio file with @remotion/renderer's
// renderMedia, in ONE bundle (cached while src/ and public/ are unchanged) and ONE browser (scripts/render/lib.mjs).
// Chrome's default GL (Skia CPU raster) is the default here and in the CLI since 2026-10-29 (remotion.config.ts no
// longer sets 'swangle', which was ~45x slower and moved pixels); GL=swangle|angle|... still picks one.
//   node scripts/render-media.mjs <CompId> <out> [--entry=src/entry-v3-film.tsx] [--scale=1] [--concurrency=3]
//        [--frames=a-b] [--props='{"k":1}'] [--codec=h264|wav|...] [--crf=18] [--timeout=120000] [--master] [--muted]
//        [--parallel[=K] [--scenes=<scenes.json>|none] [--cues=<cues.json>|none] [--audio=auto|render|none] [--work=dir]]
// --entry: as render-frames.mjs (default auto: the one src/entry-*.tsx that registers <CompId>).
// --muted: no audio track. --no-cache: bundle fresh (the bundle is otherwise cached, scripts/render/lib.mjs).
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
// The posted MASTER renders in ONE step (no --parallel): its encode is one x264 run over the whole film.
//
// --parallel[=K] (K default 3): REVIEW CUTS (the owner's gate videos) at full size (streamlining Phase 1, PLAN item 5):
//   the range is cut into K chunks on the film's own scene boundaries (scripts/film_chunks.py, from --scenes or
//   src/<film>/film/scenes.json for an entry-<film>-film.tsx, when the composition IS the film's timeline; else K equal
//   parts), each rendered MUTED by its own process and browser (--concurrency each, default 2) with the same encode
//   flags (--master, --crf, --scale, --props), then joined by a stream copy (every frame once, pts n/fps, a keyframe at
//   each seam) and the audio muxed ONCE: the premixed file itself when the film's cues (--cues, or
//   public/<film>/cues.json) are {"audio": <file>, "sfx": []} and Remotion's own asset list confirms the composition
//   plays exactly that file, else ONE audio-only pass (--codec=wav) beside the chunks. The audio is encoded exactly as
//   renderMedia encodes it, so its stream equals a one-step render's. Each chunk is its own x264 run: its last frames
//   lose ~0.3 dB (invisible at CRF 14) — fine for a review cut, not for the posted master (one step; parallel masters
//   wait for the owner's yes, PLAN Phase 2). --work=<dir> keeps the chunks and the audio there.
//   node scripts/render-media.mjs Film2R deliverables/v2/v2r_g6.mp4 --entry=src/entry-v2r-film.tsx --master --parallel
//   Measured on the 4-core box (phase1_render.md): the whole v2r film at full size 7:35 one step -> 5:19 with 3 chunks
//   (lit shots are capped by one Chrome compositor thread per browser: more browsers help); a shot that already keeps
//   every core busy gains nothing, and a 0.25-0.5 scale lane clip gains nothing (render it in one step).
// Old chunked recipe (docs/G5_BLOCKING.md §8b): one chunk = --frames=a-b, the audio once = --codec=wav.
import path from 'node:path';
import fs from 'node:fs';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {BROWSER_EXECUTABLE, chromiumOptionsFromEnv, getBundle, openRenderBrowser, parseOpts, rel, resolveEntry} from './render/lib.mjs';

const [compId, outArg, ...rest] = process.argv.slice(2);
if (!compId || !outArg) {
  console.error('usage: render-media.mjs <CompId> <out> [--entry=...] [--scale=1] [--concurrency=3] [--frames=a-b] [--props=JSON] [--codec=h264] [--crf=18] [--master] [--muted] [--parallel=K]');
  process.exit(2);
}
const opt = parseOpts(rest);
const inputProps = opt.props ? JSON.parse(opt.props) : {};
const fraction = (v) => {
  const m = String(v).match(/^\s*([\d.]+)\s*\/\s*([\d.]+)\s*$/);
  return m ? Number(m[1]) / Number(m[2]) : Number(v);
};
let scale = opt.scale ? fraction(opt.scale) : 1;
const parallel = opt.parallel === undefined ? 1 : opt.parallel === 'true' ? 3 : Number(opt.parallel);
const concurrency = opt.concurrency ? Number(opt.concurrency) : parallel > 1 ? 2 : 3;
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
const chromiumOptions = chromiumOptionsFromEnv();
const entryPoint = resolveEntry(compId, opt.entry, 'render-media');
const frameRange = opt.frames ? opt.frames.split('-').map(Number) : null;
const out = path.resolve(outArg);
if (!Number.isInteger(parallel) || parallel < 1 || (parallel > 1 && codec !== 'h264')) {
  console.error('[render-media] --parallel[=K] (K an integer, default 3) renders h264 mp4 only; audio alone (--codec=wav) is one pass');
  process.exit(2);
}
fs.mkdirSync(path.dirname(out), {recursive: true});

const t0 = Date.now();
const b = await getBundle({entryPoint, serve: opt.serve ?? null, noCache: opt['no-cache'] === 'true'});
const serveUrl = b.serveUrl;
let browser = await openRenderBrowser({scale, chromiumOptions});
let code = 0;
try {
  const composition = await selectComposition({serveUrl, id: compId, inputProps, puppeteerInstance: browser, browserExecutable: null, chromiumOptions, logLevel: 'error'});
  if (!Number.isInteger(composition.height * scale) || !Number.isInteger(composition.width * scale)) {
    const snap = Math.round(composition.height * scale) / composition.height;
    if (Math.abs(snap - scale) < 1e-3 && Number.isInteger(composition.width * snap)) {
      scale = snap;
      // renderMedia launches its browser with --force-device-scale-factor = the scale: relaunch ours the same way
      await browser.close({silent: true}).catch(() => undefined);
      browser = await openRenderBrowser({scale, chromiumOptions});
    }
  }
  const t1 = Date.now();
  const total = frameRange ? frameRange[1] - frameRange[0] + 1 : composition.durationInFrames;
  const masterNote = master ? ', MASTER: png frames, bt709, x264 crf ' + (opt.crf ?? MASTER.crf) + ' slow aq-mode 3' : '';
  if (parallel > 1) {
    const {renderParallel} = await import('./render/parallel.mjs');
    await renderParallel({compId, out, opt, entryPoint, serveUrl, composition, browser, inputProps, scale, concurrency, frameRange, parallel, master, masterNote, t0});
  } else {
    let shown = 0;
    await renderMedia({
      composition,
      serveUrl,
      codec,
      outputLocation: out,
      inputProps,
      scale,
      concurrency,
      ...(process.env.RM_OWN_BROWSER === '1' ? {browserExecutable: BROWSER_EXECUTABLE} : {puppeteerInstance: browser, browserExecutable: null}),
      chromiumOptions,
      logLevel: 'error',
      timeoutInMilliseconds: opt.timeout ? Number(opt.timeout) : 120000,
      ...(frameRange ? {frameRange} : {}),
      ...(opt.muted === 'true' ? {muted: true} : {}),
      ...(master ? {imageFormat: MASTER.imageFormat, colorSpace: MASTER.colorSpace, crf: MASTER.crf, x264Preset: MASTER.x264Preset, pixelFormat: MASTER.pixelFormat, ffmpegOverride: withX264Params} : {}),
      ...(opt.crf ? {crf: Number(opt.crf)} : {}),
      onProgress: ({renderedFrames}) => {
        if (renderedFrames - shown >= Math.max(60, Math.round(total / 10))) {
          shown = renderedFrames;
          console.error(`[render-media] ${renderedFrames}/${total} frames, ${((Date.now() - t1) / 1000).toFixed(0)} s`);
        }
      },
    });
    console.error(`[render-media] ${compId} (${rel(entryPoint)}): bundle ${((t1 - t0) / 1000).toFixed(1)} s${b.cached ? ' (cached)' : ''}, ${total} frames in ${((Date.now() - t1) / 1000).toFixed(1)} s (scale ${scale}, concurrency ${concurrency}, GL ${process.env.GL ?? 'default'}${masterNote}${opt.muted === 'true' ? ', muted' : ''}) -> ${out}`);
  }
} catch (e) {
  console.error(e);
  code = 1;
} finally {
  await browser.close({silent: true}).catch(() => undefined);
  b.release();
}
process.exitCode = code;
