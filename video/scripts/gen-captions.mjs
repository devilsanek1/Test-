#!/usr/bin/env node
// gen-captions.mjs — regenerate src/data/captions.json from assets/timing.json (the VO timing source of truth).
//   node scripts/gen-captions.mjs [--timing=assets/timing.json] [--out=src/data/captions.json] [--no-hook]
// Output: [{s, e, lines: [{text, s}], highlights: [{text, s}], style?}], all times = WORD STARTS in seconds.
// The caption component applies the measured leads itself (page -0.04, line 2 -0.08, highlight -0.10), so never
// shift times here. The first page gets style "hook" (x1.06, style bible 10) unless --no-hook.
// Optional overrides: src/data/captions.overrides.json = {"<index>": {style?, highlights?: [{text, s}] | [], lines?}}
// is merged on top (by caption index) so manual tweaks survive regeneration.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
  const [k, v] = a.slice(2).split('=');
  return [k, v ?? true];
}));
const timingPath = path.resolve(root, opt.timing ?? 'assets/timing.json');
const outPath = path.resolve(root, opt.out ?? 'src/data/captions.json');
const ovPath = path.resolve(root, 'src/data/captions.overrides.json');

const timing = JSON.parse(fs.readFileSync(timingPath, 'utf8'));
const overrides = fs.existsSync(ovPath) ? JSON.parse(fs.readFileSync(ovPath, 'utf8')) : {};
const r3 = (n) => Math.round(n * 1000) / 1000;

const out = timing.captions.map((c, i) => {
  const beat = {
    s: r3(c.s),
    e: r3(c.e),
    lines: c.lines.map((l) => ({text: l.text, s: r3(l.s)})),
    highlights: (c.highlights ?? []).map((h) => ({text: h.text, s: r3(h.s)})),
  };
  if (i === 0 && !opt['no-hook']) beat.style = 'hook';
  const ov = overrides[String(i)];
  if (ov) Object.assign(beat, ov);
  return beat;
});

// sanity: pages back to back, lines inside their page, at most one highlight per line
for (let i = 0; i < out.length; i++) {
  const b = out[i];
  if (i > 0 && b.s < out[i - 1].s) throw new Error(`caption ${i} starts before caption ${i - 1}`);
  for (const l of b.lines) if (l.s < b.s - 1e-6 || l.s > b.e + 1e-6) console.warn(`[gen-captions] caption ${i}: line "${l.text}" at ${l.s} outside [${b.s}, ${b.e}]`);
}

const body = '[\n' + out.map((b) => '  ' + JSON.stringify(b)).join(',\n') + '\n]\n';
fs.writeFileSync(outPath, body);
console.log(`[gen-captions] ${out.length} pages -> ${path.relative(root, outPath)} (${r3(out[0].s)}..${r3(out[out.length - 1].e)} s)`);
