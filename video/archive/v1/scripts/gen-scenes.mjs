#!/usr/bin/env node
// gen-scenes.mjs — regenerate src/data/scenes.json (the Film's cut list) from the storyboard ON THE CURRENT VOICE.
//   node scripts/gen-scenes.mjs [--storyboard=docs/storyboard_v2voice.json] [--out=src/data/scenes.json] [--force]
// Default storyboard: docs/storyboard_v2voice.json (docs/storyboard.json warped onto the v2 take with
// scripts/timewarp.py; falls back to docs/storyboard.json if the warped copy is missing).
// GUARD: the cut list must end exactly on the voice (assets/timing.json `duration`) and so must captions.json's last
// page (`e`). Otherwise nothing is written and the script exits 1 (--force writes anyway). `node
// scripts/engine-numbers.mjs --check` (run by sheet.sh) checks the same two numbers.
// The storyboard's free-text `loop` note ("un-build (69.84-70.687) ... rolled in (70.48-") is not rewritten by
// timewarp.py: when its times are on the v1 timeline (they end on assets/timewarp_v1_to_v2.json `from.duration`)
// they are mapped with the same piecewise-linear warp (starts take the later side, ends the earlier side).
// Maps each storyboard scene to {id, start, end, transitionIn, transitionOut?, captionTone, note}:
//   - transition types pass through (cut, matchcut, camera-continuous, foreground-wipe, push-through, unbuild);
//     'loop-start' becomes 'cut'. camera-continuous `dir` and foreground-wipe `dir` are read from the notes
//     ("truck right", "tilts up", "pull back", "left to right"...). foreground-wipe uses element 'scene' (the
//     outgoing scene module's exported `Wiper`; the Film falls back to the giant passer-by if there is none).
//   - captionTone comes from the storyboard caption pages' `tone` and exact `toneAt` switches, converted to
//     SCENE-LOCAL seconds.
//   - the last scene gets transitionOut {type: 'unbuild', dur, loop: true, captionAt} from storyboard.loop.
// Manual tweaks that must survive regeneration go in src/data/scenes.overrides.json: {"S07": {...partial scene}}
// (deep-merged into transitionIn / transitionOut, replaced elsewhere).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
  const [k, v] = a.slice(2).split('=');
  return [k, v ?? true];
}));
const sbDefault = fs.existsSync(path.join(root, 'docs/storyboard_v2voice.json')) ? 'docs/storyboard_v2voice.json' : 'docs/storyboard.json';
const sbPath = path.resolve(root, opt.storyboard ?? sbDefault);
const outPath = path.resolve(root, opt.out ?? 'src/data/scenes.json');
const ovPath = path.resolve(root, 'src/data/scenes.overrides.json');
const sb = JSON.parse(fs.readFileSync(sbPath, 'utf8'));
const overrides = fs.existsSync(ovPath) ? JSON.parse(fs.readFileSync(ovPath, 'utf8')) : {};
const r3 = (n) => Math.round(n * 1000) / 1000;
const timing = JSON.parse(fs.readFileSync(path.join(root, 'assets/timing.json'), 'utf8'));
const voDur = Number(timing.duration);

// v1 -> v2 warp (same math as scripts/timewarp.py)
const warpPath = path.join(root, 'assets/timewarp_v1_to_v2.json');
const warpDoc = fs.existsSync(warpPath) ? JSON.parse(fs.readFileSync(warpPath, 'utf8')) : null;
function warp(t, side = 'right') {
  const pts = warpDoc.anchors.map(([a, b]) => [Number(a), Number(b)]).sort((p, q) => p[0] - q[0]);
  const x = pts.map((p) => p[0]);
  const y = pts.map((p) => p[1]);
  if (t <= x[0]) return y[0] + (t - x[0]);
  if (t >= x[x.length - 1]) return y[y.length - 1] + (t - x[x.length - 1]);
  // right: the LAST anchor with x <= t starts the segment; left: the FIRST anchor with x >= t ends it
  let i = side === 'right' ? x.findIndex((v) => v > t) : x.findIndex((v) => v >= t);
  if (side === 'left' && x[i] === t) return y[i];
  const [x0, y0, x1, y1] = [x[i - 1], y[i - 1], x[i], y[i]];
  if (x1 === x0) return side === 'right' ? y1 : y0;
  return y0 + ((y1 - y0) * (t - x0)) / (x1 - x0);
}

function camDir(notes = '') {
  // the camera verb mentioned FIRST in the notes wins
  const n = notes.toLowerCase();
  const pats = [
    ['in', /push(es|ing)?[- ]in|pushes|dolly in|dives? in|zoom(s|ing)? in/],
    ['right', /truck(s|ing)? right|pans? right/],
    ['left', /truck(s|ing)? left|pans? left/],
    ['up', /tilt(s|ing)? up|crane(s|ing)? up/],
    ['down', /tilt(s|ing)? down|crane(s|ing)? down/],
    ['out', /pull(s|ing)?[- ]back|zoom(s|ing)? out/],
  ];
  let best = ['in', Infinity];
  for (const [d, re] of pats) {
    const m = n.match(re);
    if (m && m.index < best[1]) best = [d, m.index];
  }
  return best[0];
}
function wipeDir(notes = '') {
  const n = notes.toLowerCase();
  if (/right[- ]to[- ]left/.test(n)) return 'left';
  return 'right';
}

function transition(tr) {
  if (!tr) return {type: 'cut'};
  const t = tr.type === 'loop-start' ? 'cut' : tr.type;
  const out = {type: t};
  if (tr.dur && t !== 'cut' && t !== 'matchcut') out.dur = r3(tr.dur);
  if (t === 'camera-continuous') out.dir = camDir(tr.notes);
  if (t === 'foreground-wipe') {
    out.element = 'scene';
    out.dir = wipeDir(tr.notes);
  }
  return out;
}

const scenes = sb.scenes.map((s) => {
  // tone keys from the caption pages (scene-local)
  const keys = [];
  for (const c of s.captions ?? []) {
    if (c.tone) keys.push({t: r3(Math.max(0, c.s - s.start)), tone: c.tone});
    for (const k of c.toneAt ?? []) keys.push({t: r3(k.t - s.start), tone: k.tone});
  }
  keys.sort((a, b) => a.t - b.t);
  const tone = [];
  for (const k of keys) if (!tone.length || tone[tone.length - 1].tone !== k.tone) tone.push(k);
  if (tone.length) tone[0].t = 0;
  const scene = {id: s.id, start: r3(s.start), end: r3(s.end), transitionIn: transition(s.transitionIn), captionTone: tone.length ? tone : [{t: 0, tone: 'dark'}], note: s.title};
  return scene;
});

// the loop: last scene un-builds into frame 0
const last = scenes[scenes.length - 1];
const loopText = typeof sb.loop === 'string' ? sb.loop : JSON.stringify(sb.loop ?? '');
const ub = loopText.match(/un-build \((\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\)/);
const cap = loopText.match(/rolled in \((\d+(?:\.\d+)?)\s*-/);
let ub0 = ub ? Number(ub[1]) : NaN;
let ub1 = ub ? Number(ub[2]) : NaN;
let capAt = cap ? Number(cap[1]) : NaN;
// the loop note is free text: if its times are still on the v1 timeline while the scenes are on the voice, warp them
const v1End = warpDoc ? Number(warpDoc.from.duration) : NaN;
const onV1 = ub && Math.abs(ub1 - last.end) > 0.002 && Math.abs(ub1 - v1End) < 0.002 && Math.abs(last.end - Number(warpDoc?.to.duration)) < 0.002;
if (onV1) {
  ub0 = warp(ub0, 'right');
  ub1 = warp(ub1, 'left');
  if (cap) capAt = warp(capAt, 'right');
  console.log(`[gen-scenes] loop note times are on v1: warped to un-build ${r3(ub0)}-${r3(ub1)}, captions roll back at ${r3(capAt)}`);
}
last.transitionOut = {type: 'unbuild', dur: ub ? r3(ub1 - ub0) : 0.5, loop: true};
if (cap) last.transitionOut.captionAt = r3(capAt);

for (const s of scenes) {
  const ov = overrides[s.id];
  if (!ov) continue;
  for (const [k, v] of Object.entries(ov)) {
    if ((k === 'transitionIn' || k === 'transitionOut') && v && typeof v === 'object') s[k] = {...(s[k] ?? {}), ...v};
    else s[k] = v;
  }
}

// ---- guard: the cut list and the captions must end on the voice
const problems = [];
const filmEnd = Math.max(...scenes.map((s) => s.end));
if (Math.abs(filmEnd - voDur) > 0.002) problems.push(`scenes end at ${filmEnd} s but the voice (assets/timing.json duration) is ${voDur} s: wrong storyboard timeline? (v2: docs/storyboard_v2voice.json)`);
const capPath = path.join(root, 'src/data/captions.json');
if (fs.existsSync(capPath)) {
  const caps = JSON.parse(fs.readFileSync(capPath, 'utf8'));
  const capEnd = caps.length ? caps[caps.length - 1].e : NaN;
  if (Math.abs(capEnd - voDur) > 0.002) problems.push(`captions.json ends at ${capEnd} s, the voice at ${voDur} s: run node scripts/gen-captions.mjs --storyboard`);
}
const lt = last.transitionOut;
if (lt.captionAt !== undefined && (lt.captionAt < last.end - lt.dur - 0.5 || lt.captionAt > last.end)) problems.push(`loop captionAt ${lt.captionAt} is outside the last scene's un-build (${r3(last.end - lt.dur)}-${last.end})`);
for (const p of problems) console.error(`[gen-scenes] FAIL: ${p}`);
if (problems.length && !opt.force) {
  console.error('[gen-scenes] nothing written (--force to write anyway)');
  process.exit(1);
}

const body = '[\n' + scenes.map((s) => '  ' + JSON.stringify(s)).join(',\n') + '\n]\n';
fs.writeFileSync(outPath, body);
console.log(`[gen-scenes] ${path.relative(root, sbPath)}: ${scenes.length} scenes -> ${path.relative(root, outPath)} (0..${last.end} s, voice ${voDur} s)`);
