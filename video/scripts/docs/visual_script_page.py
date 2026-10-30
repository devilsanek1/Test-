#!/usr/bin/env python3
"""Build the phone page the owner reads a visual script on (G2.5): the summary, one card per shot (the words, what we
see, the camera, the join, and the rest folded away), the loop and the owner's questions, with the locked voice built
in: each card's play button plays the take from that shot, and the card in play lights up.

Why (v4, 2026-10-30): the owner reads on a phone and the files don't open in the app; a 49 KB markdown is not a phone
read. Publish the page with the Artifact tool and the take as files {"take.mp4": <take.m4a>, "take.mp3": <take.mp3>}.

    python3 scripts/docs/visual_script_page.py docs/vN/visual/VISUAL_SCRIPT.md OUT.html --title "Helsinki Visual Script" \\
        --stage "Video 4 · G2.5 visual script" --headline "<the core line>"
"""
import argparse
import html
import json
import re


def inline(md):
    """The little markdown a visual script uses, as safe HTML: **bold**, *italic*, `code`."""
    t = html.escape(md.strip())
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<em>\1</em>', t)
    t = re.sub(r'`(.+?)`', r'<code>\1</code>', t)
    return t


def section(md, title_start):
    m = re.search(r'^## ' + re.escape(title_start) + r'.*?$(.*?)(?=^## |\Z)', md, flags=re.M | re.S)
    return m.group(1).strip() if m else ''


def bullets(block):
    """Top-level '- ' items (with their wrapped lines) of a markdown block."""
    items, cur = [], None
    for line in block.split('\n'):
        if re.match(r'^(- |\d+\. )', line):
            if cur is not None:
                items.append(cur)
            cur = re.sub(r'^(- |\d+\. )', '', line)
        elif cur is not None and line.strip():
            cur += ' ' + line.strip()
    if cur is not None:
        items.append(cur)
    return items


def main():
    p = argparse.ArgumentParser()
    p.add_argument('script'); p.add_argument('out')
    p.add_argument('--title', required=True); p.add_argument('--stage', required=True); p.add_argument('--headline', required=True)
    a = p.parse_args()
    md = open(a.script, encoding='utf-8').read()

    top = re.search(r'\*\*In 5 lines\*\*\n(.*?)\n\n', md, flags=re.S)
    summary = [inline(re.sub(r'^\d+\.\s*', '', x)) for x in (top.group(1).split('\n') if top else []) if x.strip()]

    shots = []
    for m in re.finditer(r'^### (S\d+) · ([\d.]+)-([\d.]+) s \(([\d.]+) s\)(.*?)$(.*?)(?=^### |^## |\Z)', md, flags=re.M | re.S):
        sid, t0, t1, dur, tag, body = m.groups()
        fields = {}
        for it in bullets(body):
            fm = re.match(r'\*\*(.+?):\*\*\s*(.*)', it, flags=re.S)
            if fm:
                fields[fm.group(1)] = fm.group(2)
        shots.append({'id': sid, 't0': float(t0), 't1': float(t1), 'dur': dur,
                      'tag': tag.replace('★', '').strip(' ·'), 'f': fields})

    # the one-line read of each shot, from the script's "At a glance" list ("- S1 · 0.00-4.28 · <what happens> · C ★")
    glance = {}
    for it in bullets(section(md, 'At a glance')):
        gm = re.match(r'(S\d+)\s*·\s*[\d.]+-[\d.]+\s*·\s*(.*?)(?:\s*·\s*[A-F](?:\s*[x×]\s*\d+)?)?\s*★?\s*$', it)
        if gm:
            glance[gm.group(1)] = gm.group(2)
    ORDER = [('What we see', 'Screen'), ('Camera', 'Camera'), ('Into the next shot', 'Join'), ('Words in the picture', 'Words'),
             ('Sound', 'Sound'), ('The thread', 'Thread'), ('Notes', 'Notes')]

    def card(s):
        f = s['f']
        words = f.get('Voice', '')
        one = glance.get(s['id'], '')
        full = ''.join(f'<div class="row"><span class="k">{html.escape(k)}</span><span class="v">{inline(f[key])}</span></div>'
                       for k, key in ORDER if f.get(key))
        label = f' <span class="tag">{html.escape(s["tag"])}</span>' if s['tag'] else ''
        return (f'<article class="shot" id="{s["id"]}" data-t0="{s["t0"]}" data-t1="{s["t1"]}">'
                f'<header><button class="play" type="button" aria-label="Play {s["id"]}" data-t="{s["t0"]}">&#9654;</button>'
                f'<h3>{s["id"]}{label}</h3><span class="when">{s["t0"]:.2f}&ndash;{s["t1"]:.2f} s</span></header>'
                + (f'<p class="one">{inline(one)}</p>' if one else '')
                + (f'<p class="said">{inline(words)}</p>' if words else '')
                + (f'<details><summary>The full shot: picture, camera, join, sound</summary>{full}</details>' if full else '')
                + '</article>')

    loop = bullets(section(md, 'The loop back to frame 0'))
    questions = bullets(section(md, 'Open questions for the owner'))
    total = shots[-1]['t1'] if shots else 0
    css = open(__file__.replace('visual_script_page.py', 'visual_script_page.css'), encoding='utf-8').read()
    page = f'''<title>{html.escape(a.title)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&display=swap">
<style>{css}</style>
<main class="wrap">
  <header class="top">
    <p class="eyebrow">{html.escape(a.stage)}</p>
    <h1>{html.escape(a.headline)}</h1>
    <ol class="five">{''.join(f'<li>{x}</li>' for x in summary)}</ol>
  </header>
  <section class="player" aria-label="The locked voice">
    <audio id="take" controls preload="auto"><source src="take.mp4" type="audio/mp4"><source src="take.mp3" type="audio/mpeg"></audio>
    <div class="track" id="track" aria-hidden="true">{''.join(f'<span style="flex:{s["t1"] - s["t0"]:.2f}" data-id="{s["id"]}">{s["id"][1:]}</span>' for s in shots)}</div>
    <p class="hint">Tap &#9654; on a shot to hear its line; the shot in play lights up. {len(shots)} shots, {total:.1f} s.</p>
  </section>
  <section class="shots">{''.join(card(s) for s in shots)}</section>
  <section class="end">
    <h2>The loop back to frame 0</h2>
    {''.join(f'<p>{inline(x)}</p>' for x in loop)}
    <h2>Your call</h2>
    <ol class="q">{''.join(f'<li>{inline(x)}</li>' for x in questions)}</ol>
  </section>
</main>
<script>
const audio = document.getElementById('take');
const cards = [...document.querySelectorAll('.shot')];
const ticks = [...document.querySelectorAll('#track span')];
function mark() {{
  const t = audio.currentTime || 0;
  cards.forEach((c, i) => {{ const on = t >= +c.dataset.t0 && t < +c.dataset.t1 && (t > 0 || !audio.paused); c.classList.toggle('now', on); ticks[i] && ticks[i].classList.toggle('now', on); }});
}}
let raf = 0; const loop = () => {{ mark(); if (!audio.paused) raf = requestAnimationFrame(loop); }};
audio.addEventListener('play', () => {{ cancelAnimationFrame(raf); loop(); }});
['pause', 'seeked', 'ended'].forEach(e => audio.addEventListener(e, mark));
function jump(t) {{ audio.currentTime = Math.max(0, t); const p = audio.play(); if (p && p.catch) p.catch(() => {{}}); mark(); }}
document.querySelectorAll('.play').forEach(b => b.addEventListener('click', () => jump(+b.dataset.t)));
ticks.forEach((k, i) => k.addEventListener('click', () => {{ jump(+cards[i].dataset.t0); cards[i].scrollIntoView({{behavior: 'smooth', block: 'start'}}); }}));
mark();
</script>
'''
    open(a.out, 'w', encoding='utf-8').write(page)
    print(f'{a.out}: {len(shots)} shots, {len(summary)} summary lines, {len(loop)} loop notes, {len(questions)} questions')


if __name__ == '__main__':
    main()
