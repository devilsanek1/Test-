#!/usr/bin/env node
// gen-scenes.mjs — regenerate src/data/scenes.json (the Film's cut list) from docs/storyboard.json.
//   node scripts/gen-scenes.mjs [--storyboard=docs/storyboard.json] [--out=src/data/scenes.json]
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
const sbPath = path.resolve(root, opt.storyboard ?? 'docs/storyboard.json');
const outPath = path.resolve(root, opt.out ?? 'src/data/scenes.json');
const ovPath = path.resolve(root, 'src/data/scenes.overrides.json');
const sb = JSON.parse(fs.readFileSync(sbPath, 'utf8'));
const overrides = fs.existsSync(ovPath) ? JSON.parse(fs.readFileSync(ovPath, 'utf8')) : {};
const r3 = (n) => Math.round(n * 1000) / 1000;

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
last.transitionOut = {type: 'unbuild', dur: ub ? r3(Number(ub[2]) - Number(ub[1])) : 0.5, loop: true};
if (cap) last.transitionOut.captionAt = Number(cap[1]);

for (const s of scenes) {
  const ov = overrides[s.id];
  if (!ov) continue;
  for (const [k, v] of Object.entries(ov)) {
    if ((k === 'transitionIn' || k === 'transitionOut') && v && typeof v === 'object') s[k] = {...(s[k] ?? {}), ...v};
    else s[k] = v;
  }
}

const body = '[\n' + scenes.map((s) => '  ' + JSON.stringify(s)).join(',\n') + '\n]\n';
fs.writeFileSync(outPath, body);
console.log(`[gen-scenes] ${scenes.length} scenes -> ${path.relative(root, outPath)} (0..${last.end} s)`);
