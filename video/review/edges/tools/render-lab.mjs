#!/usr/bin/env node
// render-lab.mjs — render many EdgeLab stills (different props) from ONE bundle + ONE browser.
//   node review/edges/tools/render-lab.mjs jobs.json [--scale=1] [--concurrency=2]
// jobs.json = [{"props": {...EdgeLab props}, "t": 0, "out": "path.png"}, ...]
// Prints "<ms> <out>" per still, and the mean ms/frame per variant at the end.
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const [jobsFile, ...rest] = process.argv.slice(2);
const opt = Object.fromEntries(rest.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')));
const scale = Number(opt.scale ?? 1);
const conc = Number(opt.concurrency ?? 2);
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
const composition = await selectComposition({serveUrl, id: 'EdgeLab', inputProps: {}, browserExecutable, puppeteerInstance: browser, logLevel: 'error'});
const stats = {};
let next = 0;
async function worker() {
  while (next < jobs.length) {
    const j = jobs[next++];
    fs.mkdirSync(path.dirname(path.resolve(j.out)), {recursive: true});
    const t0 = Date.now();
    await renderStill({
      composition: {...composition, props: j.props},
      serveUrl,
      inputProps: j.props,
      frame: Math.round((j.t ?? 0) * composition.fps),
      output: path.resolve(j.out),
      scale: j.scale ?? scale,
      puppeteerInstance: browser,
      logLevel: 'error',
      overwrite: true,
    });
    const ms = Date.now() - t0;
    const k = j.props.variant ?? 'panel';
    (stats[k] ??= []).push(ms);
    console.log(`${ms} ${j.out}`);
  }
}
await Promise.all(Array.from({length: conc}, worker));
await browser.close({silent: true});
fs.rmSync(serveUrl, {recursive: true, force: true});
for (const [k, v] of Object.entries(stats)) console.log(`[render-lab] ${k}: ${Math.round(v.reduce((a, b) => a + b, 0) / v.length)} ms/still (n ${v.length}, scale ${scale}, concurrency ${conc})`);
