#!/usr/bin/env python3
"""The topic shortlist as a phone-portrait chart (owner, 2026-10-28: "show me the visual next time we do research -
like the story and some bar chart ... showing the score on each category").

  python3 scripts/topic_chart.py docs/vN/topic_scores.json docs/vN/topic_chart.png [--top 8]

The JSON: {"title", "subtitle", "criteria": [{"key", "label", "weight"}] in the order of importance,
"stories": [{"rank", "name", "scores": {key: 0-10}, "total"}]}. One block per story: its name and weighted score, then
one bar per criterion (0-10, the value printed). One series, so one colour and no legend; the criterion labels carry
the identity. Colours from the dataviz reference palette (series-1 on the light surface, validated).
"""
import json
import sys
import textwrap

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

SURFACE, INK, INK2, MUTED = '#fcfcfb', '#0b0b0b', '#52514e', '#8a8984'
BAR, TRACK, RULE = '#2a78d6', '#e9e8e4', '#e3e2de'
W, PAD, DPI = 1080, 64, 100
LABEL_X, TRACK_X, TRACK_W = PAD, 400, 520
ROW, BAR_H = 36, 16


def pt(px):
    return px * 72 / DPI


def draw(data, out, top):
    crit, stories = data['criteria'], data['stories'][:top]
    blocks = []
    for s in stories:
        lines = textwrap.wrap(f"{s['rank']}. {s['name']}", 40)
        if len(lines) > 2:
            lines = lines[:2]
            lines[1] = lines[1][:37].rstrip() + '...'
        blocks.append(lines)
    head = 200
    heights = [max(len(b), 2) * 42 + 26 + len(crit) * ROW + 44 for b in blocks]
    H = head + sum(heights) + PAD
    fig = plt.figure(figsize=(W / DPI, H / DPI), dpi=DPI, facecolor=SURFACE)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, W)
    ax.set_ylim(H, 0)
    ax.axis('off')
    font = {'family': 'Inter'}

    ax.text(PAD, 70, data.get('title', 'Story shortlist'), fontsize=pt(46), fontweight='bold', color=INK, va='center', **font)
    ax.text(PAD, 122, data.get('subtitle', ''), fontsize=pt(27), color=INK2, va='center', **font)
    ax.text(PAD, 165, 'Each bar: one criterion, 0-10. Most important first.', fontsize=pt(22), color=MUTED,
            va='center', **font)

    y = head
    for s, lines, h in zip(stories, blocks, heights):
        ax.plot([PAD, W - PAD], [y, y], color=RULE, lw=2, solid_capstyle='butt')
        ty = y + 40
        for i, ln in enumerate(lines):
            ax.text(PAD, ty + i * 42, ln, fontsize=pt(33), fontweight='semibold', color=INK, va='center', **font)
        ax.text(W - PAD, y + 44, f"{s['total']:.1f}", fontsize=pt(54), fontweight='bold', color=INK, ha='right',
                va='center', **font)
        tied = any(o is not s and f"{o['total']:.1f}" == f"{s['total']:.1f}" for o in stories)
        ax.text(W - PAD, y + 88, 'out of 10' + (' (tied)' if tied else ''), fontsize=pt(20), color=MUTED, ha='right',
                va='center', **font)
        ry = y + max(len(lines), 2) * 42 + 26 + ROW / 2
        for c in crit:
            v = float(s['scores'][c['key']])
            ax.text(LABEL_X, ry, c['label'], fontsize=pt(24), color=INK2, va='center', **font)
            ax.add_patch(FancyBboxPatch((TRACK_X, ry - BAR_H / 2), TRACK_W, BAR_H,
                                        boxstyle='round,pad=0,rounding_size=4', fc=TRACK, ec='none'))
            if v > 0:
                ax.add_patch(FancyBboxPatch((TRACK_X, ry - BAR_H / 2), max(TRACK_W * v / 10, 8), BAR_H,
                                            boxstyle='round,pad=0,rounding_size=4', fc=BAR, ec='none'))
            ax.text(TRACK_X + TRACK_W + 18, ry, f'{v:g}', fontsize=pt(24), color=INK, va='center', **font)
            ry += ROW
        y += h
    fig.savefig(out, dpi=DPI, facecolor=SURFACE)
    print(f'{out}: {len(stories)} stories, {W}x{H}px')


if __name__ == '__main__':
    args = sys.argv[1:]
    top = 8
    if '--top' in args:
        i = args.index('--top')
        top = int(args[i + 1])
        del args[i:i + 2]
    if len(args) != 2:
        sys.exit(__doc__)
    with open(args[0], encoding='utf-8') as f:
        draw(json.load(f), args[1], top)
