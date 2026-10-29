#!/usr/bin/env python3
"""Build the page a voice take reaches the owner on: a player, the take's cadence strip (its waveform with the long
pauses marked) and the script to tap through (each line jumps the audio there).

Why (v4 G2, 2026-10-29): attachments don't play in the Claude app on the owner's phone (a .wav: "Can't open play it
here"; an .m4a and an .mp3: "None are available"), so a take goes out as a private claude.ai page made with the
Artifact tool. The page plays `take.mp4` (the AAC file; .m4a is not a type the Artifact tool serves) or `take.mp3`.

    python3 scripts/voice/take_page.py TAKE.wav PASTE.md OUT.html --title "Helsinki Voice Take" \\
        --stage "Video 4 · G2 voice take · audio only" --headline "<the core line>" [--next "<what the yes leads to>"]

Then: ffmpeg the two phone formats (docs/voice/API_QUICKSTART.md step 5) and publish OUT.html with the Artifact tool,
files {"take.mp4": <take.m4a>, "take.mp3": <take.mp3>}. Word times: Whisper small.en ($WHISPER_DIR); a pause of
--beat seconds or more between words is drawn as a beat and named by the words after it.
"""
import argparse
import html
import json
import os
import re

import numpy as np
import soundfile as sf

TEMPLATE = """<title>{{TITLE}}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&display=swap">
<style>
/* one column for a phone: what it is, the player with its cadence strip, then the script to tap through */
:root {
  --bg: #f2f4f7; --fg: #19212d; --muted: #586373; --line: #d6dce5; --wave: #a3aebd; --accent: #c8701f; --card: #ffffff;
  --display: "Bricolage Grotesque", "Avenir Next", "Segoe UI", system-ui, sans-serif;
  --body: "Atkinson Hyperlegible", "Helvetica Neue", Arial, system-ui, sans-serif;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #0e141d; --fg: #e7ecf3; --muted: #9ba7b7; --line: #243042; --wave: #4b5b71; --accent: #f0a14b; --card: #151d29; color-scheme: dark } }
:root[data-theme="dark"] {
  --bg: #0e141d; --fg: #e7ecf3; --muted: #9ba7b7; --line: #243042; --wave: #4b5b71; --accent: #f0a14b; --card: #151d29; color-scheme: dark }
body { background: var(--bg); color: var(--fg); font: 400 1rem/1.55 var(--body); }
.wrap { max-width: 40rem; margin: 0 auto; display: grid; gap: 1.5rem;
  padding-block: 1.75rem 3rem; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
.eyebrow { margin: 0; font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
h1 { margin: .35rem 0 0; font: 700 clamp(1.6rem, 6vw, 2.2rem)/1.12 var(--display); text-wrap: balance; }
.meta { margin: .6rem 0 0; color: var(--muted); font-size: .92rem; font-variant-numeric: tabular-nums; }
.player { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 1rem; display: grid; gap: .75rem; }
audio { width: 100%; }
.strip { width: 100%; height: auto; display: block; cursor: pointer; touch-action: manipulation; }
.strip .bar { fill: var(--wave); }
.strip .played { fill: var(--fg); }
.strip .beat { fill: var(--accent); opacity: .22; }
.strip .beatmark { fill: var(--accent); }
.strip .head { fill: var(--accent); }
.legend { margin: 0; font-size: .82rem; color: var(--muted); display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
.legend i { display: inline-block; width: .8rem; height: .8rem; border-radius: 3px; background: var(--accent); opacity: .5; }
h2 { margin: 0; font: 600 1.05rem/1.3 var(--display); }
ol { list-style: none; margin: .5rem 0 0; padding: 0; display: grid; gap: .25rem; }
.line { width: 100%; display: grid; grid-template-columns: 2.6rem 1fr; gap: .6rem; align-items: start; text-align: left;
  background: transparent; color: inherit; border: 0; border-radius: 10px; padding: .6rem .5rem; font: inherit; cursor: pointer; }
.line:hover { background: color-mix(in srgb, var(--line) 45%, transparent); }
.line:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.line.now { background: color-mix(in srgb, var(--accent) 14%, transparent); }
.when { color: var(--muted); font-size: .85rem; padding-top: .12rem; font-variant-numeric: tabular-nums; }
.say { min-width: 0; }
.tag { display: inline-block; margin-right: .4rem; font-size: .72rem; letter-spacing: .06em; text-transform: uppercase; color: var(--accent); }
.next { margin: 0; padding-top: 1rem; border-top: 1px solid var(--line); color: var(--muted); font-size: .92rem; }
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; } }
</style>
<main class="wrap">
  <header>
    <p class="eyebrow">{{STAGE}}</p>
    <h1>{{HEADLINE}}</h1>
    <p class="meta">{{META}}</p>
  </header>
  <section class="player" aria-label="The take">
    <audio id="take" controls preload="auto">
      <source src="take.mp4" type="audio/mp4">
      <source src="take.mp3" type="audio/mpeg">
    </audio>
    <svg class="strip" id="strip" viewBox="0 0 1000 110" role="img" aria-label="The take's waveform, with the two deliberate beats marked; tap to jump there"></svg>
    <p class="legend"><i></i> {{LEGEND}}</p>
  </section>
  <section aria-labelledby="scriptTitle">
    <h2 id="scriptTitle">The script, as voiced</h2>
    <ol>
{{LINES}}
    </ol>
  </section>
  <p class="next">{{NEXT}}</p>
</main>
<script>
const DATA = {{DATA}};
const audio = document.getElementById('take');
const svg = document.getElementById('strip');
const NS = 'http://www.w3.org/2000/svg';
const W = 1000, H = 110, n = DATA.env.length, bw = W / n;
const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const x = t => (t / DATA.duration) * W;
for (const b of DATA.beats) {
  svg.appendChild(el('rect', { class: 'beat', x: x(b.from), y: 0, width: Math.max(4, x(b.to) - x(b.from)), height: H }));
  svg.appendChild(el('rect', { class: 'beatmark', x: x(b.from), y: 0, width: Math.max(4, x(b.to) - x(b.from)), height: 4 }));
}
const bars = DATA.env.map((v, i) => {
  const h = Math.max(2, v * (H - 18));
  const r = el('rect', { class: 'bar', x: i * bw + bw * 0.15, y: (H - h) / 2 + 4, width: bw * 0.7, height: h, rx: 1 });
  svg.appendChild(r); return r;
});
const head = el('rect', { class: 'head', x: 0, y: 0, width: 3, height: H });
svg.appendChild(head);
const lines = [...document.querySelectorAll('.line')];
const starts = lines.map(b => parseFloat(b.dataset.t));
function paint() {
  const t = audio.currentTime || 0;
  head.setAttribute('x', Math.min(W - 3, x(t)));
  const k = Math.floor((t / DATA.duration) * n);
  bars.forEach((r, i) => r.setAttribute('class', i < k ? 'bar played' : 'bar'));
  let cur = 0; starts.forEach((s, i) => { if (t + 0.05 >= s) cur = i; });
  lines.forEach((b, i) => b.classList.toggle('now', i === cur && (t > 0 || !audio.paused)));
}
let raf = 0;
const loop = () => { paint(); if (!audio.paused) raf = requestAnimationFrame(loop); };
audio.addEventListener('play', () => { cancelAnimationFrame(raf); loop(); });
audio.addEventListener('pause', paint);
audio.addEventListener('seeked', paint);
audio.addEventListener('ended', paint);
function jump(t) { audio.currentTime = Math.max(0, t); const p = audio.play(); if (p && p.catch) p.catch(() => {}); paint(); }
lines.forEach(b => b.addEventListener('click', () => jump(parseFloat(b.dataset.t))));
svg.addEventListener('click', e => { const r = svg.getBoundingClientRect(); jump(((e.clientX - r.left) / r.width) * DATA.duration); });
paint();
</script>
"""


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('take'); p.add_argument('paste'); p.add_argument('out')
    p.add_argument('--title', required=True, help='the page name, 2-4 words (e.g. "Helsinki Voice Take")')
    p.add_argument('--stage', required=True, help='e.g. "Video 4 · G2 voice take · audio only"')
    p.add_argument('--headline', required=True, help='the core line')
    p.add_argument('--voice', default='', help='the voice name for the meta line')
    p.add_argument('--next', default='Next: your yes locks the voice, then G3, the sketch animatic. Quick changes without a new recording: faster or slower, more excited at the start, a longer pause before the payoff.')
    p.add_argument('--beat', type=float, default=0.5, help='a pause at least this long is marked on the strip')
    p.add_argument('--whisper-dir', default=os.environ.get('WHISPER_DIR', '/tmp/whisper'))
    a = p.parse_args()

    import soxr
    from faster_whisper import WhisperModel
    y, sr = sf.read(a.take, dtype='float32')
    if y.ndim > 1:
        y = y.mean(axis=1)
    dur = len(y) / sr
    nb = 220
    step = max(1, len(y) // nb)
    env = [float(np.max(np.abs(y[i * step:(i + 1) * step]))) for i in range(nb)]
    top = max(env) or 1.0
    env = [round((e / top) ** 0.6, 3) for e in env]
    y16 = soxr.resample(y, sr, 16000) if sr != 16000 else y
    wm = WhisperModel('small.en', device='cpu', compute_type='int8', download_root=a.whisper_dir)
    segs, _ = wm.transcribe(y16.astype(np.float32), beam_size=5, word_timestamps=True)
    words = [(w.start, w.end, w.word.strip()) for s in segs for w in s.words]
    key = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())

    raw = open(a.paste, encoding='utf-8').read()
    paras = [q.strip() for q in re.split(r'\n\s*\n', raw) if q.strip()]
    lines, wi = [], 0
    for k, q in enumerate(paras):
        tag = re.match(r'\[([^\]]*)\]', q)
        text = re.sub(r'\[[^\]]*\]\s*', '', q)
        first = key(text.split()[0])
        while wi < len(words) and key(words[wi][2]) != first:
            wi += 1
        t = words[wi][0] if wi < len(words) else 0.0
        wi += 1
        lines.append(f'      <li><button class="line" type="button" data-t="{t:.2f}" id="line{k}">\n'
                     f'        <span class="when">{int(t // 60)}:{int(t % 60):02d}</span>\n'
                     f'        <span class="say">' + (f'<span class="tag">{html.escape(tag.group(1))}</span>' if tag else '')
                     + f'{html.escape(text)}</span>\n      </button></li>')
    beats = []
    for i in range(1, len(words)):
        if words[i][0] - words[i - 1][1] >= a.beat:
            nxt = ' '.join(w[2] for w in words[i:i + 3])
            beats.append({'from': round(words[i - 1][1], 2), 'to': round(words[i][0], 2), 'label': 'before ' + nxt})
    span = (words[-1][1] - words[0][0]) if words else dur
    meta = ' &middot; '.join(x for x in [f'{dur:.1f} s', f'voice {html.escape(a.voice)}' if a.voice else '',
                                          f'{60 * len(words) / max(span, 0.1):.0f} words a minute', 'checked word for word'] if x)
    legend = ('the long pauses: ' + '; '.join('before &ldquo;' + html.escape(b['label'][7:]) + '&rdquo;' for b in beats)
              + '. Tap the strip or a line to jump.') if beats else 'Tap the strip or a line to jump.'
    page = (TEMPLATE.replace('{{TITLE}}', html.escape(a.title)).replace('{{STAGE}}', html.escape(a.stage))
            .replace('{{HEADLINE}}', html.escape(a.headline)).replace('{{META}}', meta)
            .replace('{{LINES}}', '\n'.join(lines)).replace('{{LEGEND}}', legend).replace('{{NEXT}}', html.escape(a.next))
            .replace('{{DATA}}', json.dumps({'duration': round(dur, 2), 'env': env, 'beats': beats})))
    open(a.out, 'w', encoding='utf-8').write(page)
    print(f'{a.out}: {dur:.1f} s, {len(lines)} lines, {len(beats)} marked pauses; publish it with the Artifact tool and '
          'files {"take.mp4": <take.m4a>, "take.mp3": <take.mp3>}')


if __name__ == '__main__':
    main()
