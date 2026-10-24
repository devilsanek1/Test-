#!/usr/bin/env node
// render-frames.mjs — render arbitrary frames of a composition in ONE bundle + ONE browser session.
// Used by still.sh and sheet.sh. Usage:
//   node scripts/render-frames.mjs <CompId> <outDir> <t1,t2,...> [--scale=0.5] [--concurrency=2] [--props='{"k":1}']
// --props: input props (JSON) for the composition, e.g. '{"capcheck":"mask"}' (caption mask for scripts/capcheck.mjs).
// --entry=auto (default) | full | <path>: what gets bundled. auto ISOLATES the composition so one lane's half-written
//   file can't break another lane's previews: a dev composition (src/dev/registry.ts) gets a generated entry that
//   imports only its own module; Main / S01.. use src/entry-film.ts (no dev previews); anything else src/index.ts.
//   full = src/index.ts (everything, like the Studio).
// Times are seconds; they are converted with the composition's fps and clamped to its duration.
// Prints one line per frame: "<seconds> <frame> <file>". Also prints ms/frame.
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderFrames, selectComposition} from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [compId, outDirArg, timesArg, ...rest] = process.argv.slice(2);
if (!compId || !outDirArg || !timesArg) {
  console.error('usage: render-frames.mjs <CompId> <outDir> <t1,t2,...> [--scale=0.5] [--concurrency=2]');
  process.exit(2);
}
const opt = Object.fromEntries(rest.filter((a) => a.startsWith('--')).map((a) => {
  const k = a.slice(2);
  const i = k.indexOf('=');
  return i < 0 ? [k, 'true'] : [k.slice(0, i), k.slice(i + 1)];
}));
const inputProps = opt.props ? JSON.parse(opt.props) : {};
const scale = opt.scale ? Number(opt.scale) : 1;
const concurrency = opt.concurrency ? Number(opt.concurrency) : 2;
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
// GL: default (software raster) is ~3x faster than 'swangle' for our vector-heavy frames and renders identically
// (verified incl. 3D card flips). Override with GL=swangle|angle|swiftshader if ever needed.
const chromiumOptions = process.env.GL && process.env.GL !== 'default' ? {gl: process.env.GL} : {};

// ---- entry point (isolated per composition by default)
function devEntry(id) {
  const regPath = path.join(root, 'src/dev/registry.ts');
  if (!fs.existsSync(regPath)) return null;
  const reg = fs.readFileSync(regPath, 'utf8');
  const m = reg.match(new RegExp(`\\{\\s*id:\\s*'${id}'\\s*,\\s*component:\\s*(\\w+)\\s*,\\s*durationSeconds:\\s*([\\d.]+)`));
  if (!m) return null;
  const [, comp, secs] = m;
  const imp = reg.match(new RegExp(`import\\s*\\{([^}]*\\b${comp}\\b[^}]*)\\}\\s*from\\s*'(\\./[^']+)'`));
  if (!imp) return null;
  const mod = path.join(root, 'src/dev', imp[2]);
  const dir = path.join(root, 'node_modules/.cache/render-entry');
  fs.mkdirSync(dir, {recursive: true});
  const file = path.join(dir, `${id}.js`);
  const theme = path.join(root, 'src/lib/theme');
  const body = [
    "import React from 'react';",
    "import {Composition, registerRoot} from 'remotion';",
    `import {${comp} as C} from ${JSON.stringify(mod)};`,
    `import {canvas} from ${JSON.stringify(theme)};`,
    `const Root = () => React.createElement(Composition, {id: ${JSON.stringify(id)}, component: C, durationInFrames: Math.round(${secs} * canvas.fps), fps: canvas.fps, width: canvas.width, height: canvas.height});`,
    'registerRoot(Root);',
    '',
  ].join('\n');
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== body) fs.writeFileSync(file, body);
  return file;
}
const entryOpt = opt.entry ?? 'auto';
let entryPoint = path.join(root, 'src/index.ts');
if (entryOpt === 'auto') {
  const dev = devEntry(compId);
  if (dev) entryPoint = dev;
  else if (compId === 'Main' || /^S\d+[a-z]?$/.test(compId)) entryPoint = path.join(root, 'src/entry-film.ts');
} else if (entryOpt !== 'full') entryPoint = path.resolve(entryOpt);

const outDir = path.resolve(outDirArg);
fs.mkdirSync(outDir, {recursive: true});
const tB = Date.now();
const serveUrl = await bundle({
  entryPoint,
  rootDir: root,
  publicDir: path.join(root, 'public'),
  enableCaching: true,
  onProgress: () => undefined,
});
const tS = Date.now();
const composition = await selectComposition({serveUrl, id: compId, inputProps, browserExecutable, chromiumOptions, logLevel: 'error'});
const fps = composition.fps;
const times = timesArg.split(',').map(Number);
const frameOf = (s) => Math.max(0, Math.min(composition.durationInFrames - 1, Math.round(s * fps)));
const frames = [...new Set(times.map(frameOf))].sort((a, b) => a - b);
const tmp = fs.mkdtempSync(path.join(outDir, '.frames-'));
const tR = Date.now();
await renderFrames({
  composition,
  serveUrl,
  inputProps,
  frames,
  outputDir: tmp,
  imageFormat: 'png',
  scale,
  concurrency,
  browserExecutable,
  chromiumOptions,
  logLevel: 'error',
  onStart: () => undefined,
  onFrameUpdate: (n, f, ms) => { if (process.env.PROFILE) console.error(`frame ${f} ${ms}ms`); },
  onBrowserLog: (l) => { if (process.env.PROFILE && l.text.includes('PROFILE')) console.error(l.text); },
});
const tE = Date.now();
const files = fs.readdirSync(tmp).filter((f) => f.endsWith('.png')).sort();
const byFrame = new Map();
for (const f of files) {
  const m = f.match(/(\d+)\.png$/);
  if (m) byFrame.set(Number(m[1]), f);
}
for (const s of times) {
  const fr = frameOf(s);
  const src = byFrame.get(fr) ?? files[frames.indexOf(fr)];
  const dst = path.join(outDir, `f${String(fr).padStart(5, '0')}.png`);
  if (src) fs.copyFileSync(path.join(tmp, src), dst);
  console.log(`${s} ${fr} ${dst}`);
}
fs.rmSync(tmp, {recursive: true, force: true});
fs.rmSync(serveUrl, {recursive: true, force: true});
console.error(`[render-frames] ${compId} (${path.relative(root, entryPoint)}): bundle ${((tS - tB) / 1000).toFixed(1)}s, ${frames.length} frames in ${((tE - tR) / 1000).toFixed(1)}s (${Math.round((tE - tR) / frames.length)} ms/frame incl. page setup, concurrency ${concurrency}, scale ${scale})`);
