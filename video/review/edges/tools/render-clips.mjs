#!/usr/bin/env node
// render-clips.mjs — EdgeLab clips (MP4) or frame benchmarks from ONE isolated bundle.
//   node review/edges/tools/render-clips.mjs jobs.json [--scale=0.5] [--concurrency=2]
// jobs.json = [{"props": {...}, "frames": [0, 149], "out": "x.mp4"}            -> an H.264 clip
//              {"props": {...}, "frames": [0, 149], "bench": 24}               -> render 24 spread frames (PNG, discarded)]
// Prints ms/frame per job (incl. encoding for clips; frames only for bench).
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderFrames, selectComposition, openBrowser} from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const [jobsFile, ...rest] = process.argv.slice(2);
const opt = Object.fromEntries(rest.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')));
const scale = Number(opt.scale ?? 0.5);
const concurrency = Number(opt.concurrency ?? 2);
const jobs = JSON.parse(fs.readFileSync(jobsFile, 'utf8'));
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';

const dir = path.join(root, 'node_modules/.cache/render-entry');
fs.mkdirSync(dir, {recursive: true});
const entry = path.join(dir, 'EdgeLab.js');
fs.writeFileSync(
  entry,
  [
    "import React from 'react';",
    "import {Composition, registerRoot} from 'remotion';",
    `import {EdgeLab as C} from ${JSON.stringify(path.join(root, 'src/dev/EdgeLab'))};`,
    `import {canvas} from ${JSON.stringify(path.join(root, 'src/lib/theme'))};`,
    "const Root = () => React.createElement(Composition, {id: 'EdgeLab', component: C, durationInFrames: Math.round(6 * canvas.fps), fps: canvas.fps, width: canvas.width, height: canvas.height});",
    'registerRoot(Root);',
    '',
  ].join('\n'),
);
const serveUrl = await bundle({entryPoint: entry, rootDir: root, publicDir: path.join(root, 'public'), enableCaching: true, onProgress: () => undefined});
const browser = await openBrowser('chrome', {browserExecutable});
const base = await selectComposition({serveUrl, id: 'EdgeLab', inputProps: {}, browserExecutable, puppeteerInstance: browser, logLevel: 'error'});
for (const j of jobs) {
  const composition = {...base, props: j.props};
  const t0 = Date.now();
  let n;
  if (j.bench) {
    const [a, b] = j.frames;
    const frames = Array.from({length: j.bench}, (_, i) => Math.round(a + ((b - a) * i) / Math.max(1, j.bench - 1)));
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'edgebench-'));
    await renderFrames({composition, serveUrl, inputProps: j.props, frames, outputDir: tmp, imageFormat: 'png', scale: j.scale ?? scale, concurrency, puppeteerInstance: browser, logLevel: 'error', onStart: () => undefined, onFrameUpdate: () => undefined});
    fs.rmSync(tmp, {recursive: true, force: true});
    n = frames.length;
  } else {
    fs.mkdirSync(path.dirname(path.resolve(j.out)), {recursive: true});
    await renderMedia({composition, serveUrl, inputProps: j.props, codec: 'h264', crf: 18, outputLocation: path.resolve(j.out), frameRange: j.frames, scale: j.scale ?? scale, concurrency, puppeteerInstance: browser, logLevel: 'error', muted: true, overwrite: true});
    n = j.frames[1] - j.frames[0] + 1;
  }
  const ms = Date.now() - t0;
  console.log(`[render-clips] ${JSON.stringify(j.props)} ${j.out ?? 'bench'}: ${n} frames, ${Math.round(ms / n)} ms/frame (scale ${j.scale ?? scale}, concurrency ${concurrency})`);
}
await browser.close({silent: true});
fs.rmSync(serveUrl, {recursive: true, force: true});
