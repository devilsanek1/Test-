#!/usr/bin/env node
// capcheck.mjs — caption legibility check: renders frames twice (normal + caption mask) and measures, in the caption
// band, how much of the background behind the text is below 3:1 contrast against the ACTIVE tone (scripts/capcheck.py).
// Exit code 1 if any frame fails (> 5 % of the background near the glyphs below 3:1).
//
//   node scripts/capcheck.mjs Main                        # every scene: 4 frames each + every transition window
//   node scripts/capcheck.mjs Main --per-scene=6 --step=2 # denser (step = frames between samples in windows)
//   node scripts/capcheck.mjs S07                         # one scene composition (same sampling, scene-local)
//   node scripts/capcheck.mjs KitDemo --t0=0 --t1=12 --n=48
//   node scripts/capcheck.mjs CineDemo --times=5.8,5.9,6.0
// Options: --scale=0.5 (render scale) --thresh=0.05 --keep=<dir> (keep the renders) --verbose --viz=<dir> (band crops
//          with the failing background pixels in magenta)
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [comp, ...rest] = process.argv.slice(2);
if (!comp) {
  console.error('usage: node scripts/capcheck.mjs <CompId> [--times=..|--t0= --t1= --n=] [--per-scene=4] [--step=2] [--scale=0.5] [--thresh=0.05] [--keep=dir]');
  process.exit(2);
}
const opt = Object.fromEntries(rest.filter((a) => a.startsWith('--')).map((a) => {
  const k = a.slice(2);
  const i = k.indexOf('=');
  return i < 0 ? [k, 'true'] : [k.slice(0, i), k.slice(i + 1)];
}));
const scale = Number(opt.scale ?? 0.5);
const fps = 30;
const per = Number(opt['per-scene'] ?? 4);
const step = Number(opt.step ?? 2) / fps;

function sceneTimes(scenes, offset) {
  const ts = [];
  const add = (t) => ts.push(Math.round((t - offset) * fps) / fps);
  scenes.forEach((s, i) => {
    for (let k = 0; k < per; k++) add(s.start + 0.15 + ((s.end - s.start - 0.3) * (k + 0.5)) / per);
    const tr = i > 0 ? s.transitionIn : undefined;
    const c = s.start;
    const win = (a, b) => {
      for (let t = a; t <= b + 1e-6; t += step) add(t);
    };
    if (tr) {
      const d = tr.dur ?? {cut: 0, matchcut: 0, 'camera-continuous': 1.4, 'foreground-wipe': 0.8, 'push-through': 1.1, unbuild: 0.5}[tr.type] ?? 0;
      if (tr.type === 'foreground-wipe') win(c - d / 2, c + d / 2);
      else if (tr.type === 'unbuild') win(c - d * 0.45, c);
      else win(c - 2 / fps, c + 2 / fps);
    }
    for (const k of s.captionTone ?? []) if (k.t > 0) win(s.start + k.t - 1 / fps, s.start + k.t + (k.dur ?? 0.4));
    if (s.transitionOut?.type === 'unbuild') win(s.end - (s.transitionOut.dur ?? 0.5) * 0.45, s.end - 1 / fps);
  });
  return [...new Set(ts.filter((t) => t >= 0))].sort((a, b) => a - b);
}

let times;
if (opt.times) times = opt.times.split(',').map(Number);
else if (opt.t1 !== undefined) {
  const t0 = Number(opt.t0 ?? 0);
  const t1 = Number(opt.t1);
  const n = Number(opt.n ?? 24);
  times = Array.from({length: n}, (_, i) => t0 + ((t1 - t0) * i) / Math.max(1, n - 1));
} else {
  const scenes = JSON.parse(fs.readFileSync(path.join(root, 'src/data/scenes.json'), 'utf8'));
  if (comp === 'Main') times = sceneTimes(scenes, 0);
  else {
    const s = scenes.find((x) => x.id === comp);
    if (!s) {
      console.error(`[capcheck] ${comp}: pass --times or --t0/--t1 (not a scene id)`);
      process.exit(2);
    }
    times = sceneTimes([s], s.start);
  }
}

const tmp = opt.keep ? path.resolve(opt.keep) : fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'capcheck.'));
fs.mkdirSync(path.join(tmp, 'frame'), {recursive: true});
fs.mkdirSync(path.join(tmp, 'mask'), {recursive: true});
const render = (dir, extra) =>
  execFileSync('node', [path.join(root, 'scripts/render-frames.mjs'), comp, path.join(tmp, dir), times.map((t) => t.toFixed(4)).join(','), `--scale=${scale}`, ...extra], {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit']})
    .trim()
    .split('\n')
    .map((l) => l.split(' '));
console.error(`[capcheck] ${comp}: ${times.length} frames at scale ${scale}`);
const a = render('frame', []);
const b = render('mask', ['--props={"capcheck":"mask"}']);
const list = a.map(([s, fr, f], i) => `${s} ${fr} ${f} ${b[i][2]}`).join('\n');
fs.writeFileSync(path.join(tmp, 'list.txt'), list + '\n');
let code = 0;
try {
  execFileSync('python3', [path.join(root, 'scripts/capcheck.py'), path.join(tmp, 'list.txt'), `--scale=${scale}`, `--thresh=${opt.thresh ?? 0.05}`, ...(opt.verbose ? [] : ['--quiet']), ...(opt.viz ? [`--viz=${path.resolve(opt.viz)}`] : [])], {stdio: 'inherit'});
} catch (e) {
  code = e.status ?? 1;
}
if (!opt.keep) fs.rmSync(tmp, {recursive: true, force: true});
else console.error(`[capcheck] renders kept in ${tmp}`);
process.exit(code);
