#!/usr/bin/env node
// gen-captions.mjs — regenerate src/data/captions.json from assets/timing.json (the VO timing source of truth).
//   node scripts/gen-captions.mjs [--timing=assets/timing.json] [--out=src/data/captions.json] [--no-hook]
//   node scripts/gen-captions.mjs --storyboard[=docs/storyboard.json]
// --storyboard: take the PAGING and the (multi-word) highlights from the storyboard's caption pages, but every time
//   is re-derived from timing.json: page/line start = start of its first word, highlight = start of its first word.
//   An explicit final loop page (the first page's line 1 again) is dropped: the Film adds it itself
//   (scenes.json transitionOut.captionAt). Page `tone`s are NOT read here (tone lives in scenes.json captionTone:
//   scripts/gen-scenes.mjs).
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

const words = timing.words;
const norm = (w) => w.toLowerCase().replace(/[^a-z0-9']/g, '');
/** Start time of the first word of `text` at or after time `near` (searching +-1.5 s). */
function wordStart(text, near) {
  const first = norm(text.split(/\s+/)[0] ?? '');
  let best = null;
  for (const w of words) {
    if (Math.abs(w.s - near) > 1.5) continue;
    if (norm(w.w) === first || norm(w.w).startsWith(first) || first.startsWith(norm(w.w))) {
      if (!best || Math.abs(w.s - near) < Math.abs(best.s - near)) best = w;
    }
  }
  return best ? best.s : near;
}

let pages;
if (opt.storyboard) {
  const sbPath = path.resolve(root, typeof opt.storyboard === 'string' ? opt.storyboard : 'docs/storyboard.json');
  const sb = JSON.parse(fs.readFileSync(sbPath, 'utf8'));
  pages = sb.scenes.flatMap((sc) => sc.captions ?? []);
  const first = pages[0]?.lines?.[0]?.text;
  if (pages.length > 1 && pages[pages.length - 1].lines.length === 1 && pages[pages.length - 1].lines[0].text === first) pages = pages.slice(0, -1);
  pages = pages.map((c) => {
    const lines = c.lines.map((l) => ({text: l.text, s: r3(wordStart(l.text, Math.max(l.s, 0.05)))}));
    const s0 = lines[0].s;
    return {
      s: r3(s0),
      e: r3(c.e),
      lines,
      highlights: (c.highlights ?? []).map((h) => {
        const ws = wordStart(h.text, h.s);
        if (Math.abs(ws - h.s) > 0.06) console.warn(`[gen-captions] highlight "${h.text}": storyboard ${h.s} -> word start ${r3(ws)}`);
        return {text: h.text, s: r3(ws)};
      }),
    };
  });
} else {
  pages = timing.captions.map((c) => ({
    s: r3(c.s),
    e: r3(c.e),
    lines: c.lines.map((l) => ({text: l.text, s: r3(l.s)})),
    highlights: (c.highlights ?? []).map((h) => ({text: h.text, s: r3(h.s)})),
  }));
}

const out = pages.map((beat, i) => {
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
