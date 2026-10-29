#!/usr/bin/env node
// render-frames.mjs — render arbitrary frames of a composition in ONE bundle + ONE browser session.
// Used by still.sh, sheet.sh, strip.sh and the QA tools. Usage:
//   node scripts/render-frames.mjs <CompId> <outDir> <times> [--entry=src/entry-<film>.tsx] [--scale=0.5]
//        [--concurrency=2] [--props='{"k":1}'] [--also-out=<dir> [--also-props='{"capcheck":"mask"}']] [--no-cache]
// <times>: seconds, comma-separated (t1,t2,...: frame = round(t * fps) with the composition's fps, clamped to its
//   duration), or a RANGE t0:t1[:step] = every (step-th) frame from round(t0 * fps) to round(t1 * fps) at the
//   composition's own fps (strip.sh: 60 fps films get every frame, not every 2nd).
// --props: input props (JSON) for the composition, e.g. '{"lightOff":true}'.
// --also-out=<dir>: render the same frames a second time, in the same bundle and browser, with --also-props merged over
//   --props (default {"capcheck":"mask"}: the caption mask scripts/capcheck.py reads) into <dir>; each stdout line then
//   ends with that file too (sheet.sh's caption check: one call instead of two). If that pass fails, a warning goes to
//   stderr and the lines keep 3 fields (the call still succeeds).
// --entry=<path> | auto (default) | full: what gets bundled. auto = the ONE src/entry-*.tsx that registers <CompId> (a
//   literal id, else a template id such as Film2R-${id}; none or several: exit 2, pass --entry). full = src/index.ts.
//   (Until 2026-10-29 auto fell back to v1's entries: src/dev/registry.ts, src/entry-film.ts, src/index.ts.)
// The bundle is cached by a hash of src/ + public/ + the entry and reused while nothing changed; one browser serves
//   selectComposition and every frame (scripts/render/lib.mjs). The pixels are the same, byte for byte.
//   --no-cache bundles fresh and deletes it after (the old behaviour). GL=swangle|angle|... picks a GL (default: Chrome's).
// Times are seconds; prints one line per frame: "<seconds> <frame> <file>[ <second-pass file>]". Also prints ms/frame.
import path from 'node:path';
import fs from 'node:fs';
import {renderFrames, selectComposition} from '@remotion/renderer';
import {chromiumOptionsFromEnv, getBundle, openRenderBrowser, parseOpts, rel, resolveEntry} from './render/lib.mjs';

const [compId, outDirArg, timesArg, ...rest] = process.argv.slice(2);
if (!compId || !outDirArg || !timesArg) {
  console.error('usage: render-frames.mjs <CompId> <outDir> <t1,t2,...|t0:t1[:step]> [--entry=...] [--scale=0.5] [--concurrency=2] [--props=JSON] [--also-out=dir [--also-props=JSON]]');
  process.exit(2);
}
const opt = parseOpts(rest);
const inputProps = opt.props ? JSON.parse(opt.props) : {};
const scale = opt.scale ? Number(opt.scale) : 1;
const concurrency = opt.concurrency ? Number(opt.concurrency) : 2;
// GL: default (software raster) is ~3x faster than 'swangle' for our vector-heavy frames and renders identically
// (verified incl. 3D card flips). Override with GL=swangle|angle|swiftshader if ever needed.
const chromiumOptions = chromiumOptionsFromEnv();
const entryPoint = resolveEntry(compId, opt.entry, 'render-frames');
const alsoOut = opt['also-out'] ? path.resolve(opt['also-out']) : null;
const alsoProps = alsoOut ? {...inputProps, ...(opt['also-props'] ? JSON.parse(opt['also-props']) : {capcheck: 'mask'})} : null;

const outDir = path.resolve(outDirArg);
fs.mkdirSync(outDir, {recursive: true});
const tB = Date.now();
const b = await getBundle({entryPoint, serve: opt.serve ?? null, noCache: opt['no-cache'] === 'true'});
const serveUrl = b.serveUrl;
const tS = Date.now();
const browser = await openRenderBrowser({scale, chromiumOptions});
let code = 0;
try {
  const composition = await selectComposition({serveUrl, id: compId, inputProps, puppeteerInstance: browser, browserExecutable: null, chromiumOptions, logLevel: 'error'});
  const fps = composition.fps;
  const frameOf = (s) => Math.max(0, Math.min(composition.durationInFrames - 1, Math.round(s * fps)));
  // times: "t1,t2,..." (seconds) or "t0:t1[:step]" (every step-th frame between them, at the composition's fps)
  let times;
  const range = timesArg.match(/^\s*([-\d.]+)\s*:\s*([-\d.]+)\s*(?::\s*(\d+)\s*)?$/);
  if (range) {
    const [f0, f1] = [frameOf(Number(range[1])), frameOf(Number(range[2]))];
    const step = Math.max(1, Number(range[3] ?? 1));
    times = [];
    for (let f = f0; f <= f1; f += step) times.push(+(f / fps).toFixed(4));
  } else times = timesArg.split(',').map(Number);
  const frames = [...new Set(times.map(frameOf))].sort((a, c) => a - c);

  const pass = async (comp, props, dir) => {
    fs.mkdirSync(dir, {recursive: true});
    const tmp = fs.mkdtempSync(path.join(dir, '.frames-'));
    const t0 = Date.now();
    await renderFrames({
      composition: comp,
      serveUrl,
      inputProps: props,
      frames,
      outputDir: tmp,
      imageFormat: 'png',
      scale,
      concurrency,
      puppeteerInstance: browser,
      browserExecutable: null,
      chromiumOptions,
      logLevel: 'error',
      onStart: () => undefined,
      onFrameUpdate: (n, f, ms) => { if (process.env.PROFILE) console.error(`frame ${f} ${ms}ms`); },
      onBrowserLog: (l) => { if (process.env.PROFILE && l.text.includes('PROFILE')) console.error(l.text); },
    });
    const ms = Date.now() - t0;
    const files = fs.readdirSync(tmp).filter((f) => f.endsWith('.png')).sort();
    const byFrame = new Map();
    for (const f of files) {
      const m = f.match(/(\d+)\.png$/);
      if (m) byFrame.set(Number(m[1]), f);
    }
    const out = new Map();
    for (const fr of frames) {
      const src = byFrame.get(fr) ?? files[frames.indexOf(fr)];
      const dst = path.join(dir, `f${String(fr).padStart(5, '0')}.png`);
      if (src) fs.copyFileSync(path.join(tmp, src), dst);
      out.set(fr, dst);
    }
    fs.rmSync(tmp, {recursive: true, force: true});
    return {out, ms};
  };

  const main = await pass(composition, inputProps, outDir);
  let also = null;
  if (alsoOut) {
    // the second pass never fails the call (sheet.sh's mask pass was always optional): a warning, and 3-field lines
    try {
      const comp2 = await selectComposition({serveUrl, id: compId, inputProps: alsoProps, puppeteerInstance: browser, browserExecutable: null, chromiumOptions, logLevel: 'error'});
      also = await pass(comp2, alsoProps, alsoOut);
    } catch (e) {
      console.error(`[render-frames] the second pass (${JSON.stringify(alsoProps)}) failed, its files are left out: ${e?.message ?? e}`);
    }
  }
  for (const s of times) {
    const fr = frameOf(s);
    console.log(`${s} ${fr} ${main.out.get(fr)}${also ? ` ${also.out.get(fr)}` : ''}`);
  }
  console.error(`[render-frames] ${compId} (${rel(entryPoint)}): bundle ${((tS - tB) / 1000).toFixed(1)}s${b.cached ? ' (cached)' : ''}, ${frames.length} frames in ${(main.ms / 1000).toFixed(1)}s (${Math.round(main.ms / frames.length)} ms/frame incl. page setup, concurrency ${concurrency}, scale ${scale})${also ? `, again with ${JSON.stringify(alsoProps)} in ${(also.ms / 1000).toFixed(1)}s` : ''}, ${((Date.now() - tB) / 1000).toFixed(1)}s in all`);
} catch (e) {
  console.error(e);
  code = 1;
} finally {
  await browser.close({silent: true}).catch(() => undefined);
  b.release();
}
process.exitCode = code;
