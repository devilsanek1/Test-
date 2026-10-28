#!/usr/bin/env python3
"""The topic shortlist as a phone-portrait column chart (owner, 2026-10-28: "show me the visual next time we do research -
like the story and some bar chart ... showing the score on each category"; then "make the visual into column chart").

  python3 scripts/topic_chart.py docs/vN/topic_scores.json docs/vN/topic_chart.png [--top 8]

The JSON: {"title", "subtitle", "criteria": [{"key", "label", "short", "weight"}] in the order of importance,
"stories": [{"rank", "name", "scores": {key: 0-10}, "total"}]}. One block per story: its name and weighted score, then
one column per criterion, most important on the left (0-10 on a light track, the value above it, the short label
below). A name wraps to at most two balanced lines.
One series, so one colour and no legend; the criterion labels carry the identity. Colours from the dataviz reference
palette (series-1 on the light surface, validated).
"""
import json
import sys
import textwrap

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Rectangle

SURFACE, INK, INK2, MUTED = '#fcfcfb', '#0b0b0b', '#52514e', '#8a8984'
BAR, TRACK, RULE = '#2a78d6', '#e9e8e4', '#e3e2de'
W, PAD, DPI = 1080, 64, 100
COL_W, PLOT_H, R = 64, 160, 4
NAME_H, HEADROOM, FOOT = 110, 40, 64


def pt(px):
    return px * 72 / DPI


def column(ax, cx, base, h, colour):
    """A column anchored to the baseline: rounded top, square bottom."""
    h = max(h, 2 * R)
    ax.add_patch(FancyBboxPatch((cx - COL_W / 2, base - h), COL_W, h, boxstyle=f'round,pad=0,rounding_size={R}',
                                fc=colour, ec='none'))
    ax.add_patch(Rectangle((cx - COL_W / 2, base - R), COL_W, R, fc=colour, ec='none'))


def draw(data, out, top):
    crit, stories = data['criteria'], data['stories'][:top]
    blocks = []
    for s in stories:
        name = f"{s['rank']}. {s['name']}"
        fits = [textwrap.wrap(name, w) for w in range(24, 41)]
        fits = [ls for ls in fits if len(ls) <= 2]
        lines = min(fits, key=lambda ls: max(map(len, ls))) if fits else textwrap.wrap(name, 40)
        if len(lines) > 2:
            lines = lines[:2]
            lines[1] = lines[1][:37].rstrip() + '...'
        blocks.append(lines)
    head = 200
    block_h = NAME_H + HEADROOM + PLOT_H + FOOT
    H = head + len(stories) * block_h + PAD
    fig = plt.figure(figsize=(W / DPI, H / DPI), dpi=DPI, facecolor=SURFACE)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, W)
    ax.set_ylim(H, 0)
    ax.axis('off')
    font = {'family': 'Inter'}

    ax.text(PAD, 70, data.get('title', 'Story shortlist'), fontsize=pt(46), fontweight='bold', color=INK, va='center', **font)
    ax.text(PAD, 122, data.get('subtitle', ''), fontsize=pt(27), color=INK2, va='center', **font)
    ax.text(PAD, 165, 'Each column: one criterion, 0-10. Most important on the left.', fontsize=pt(22), color=MUTED,
            va='center', **font)

    slot = (W - 2 * PAD) / len(crit)
    y = head
    for s, lines in zip(stories, blocks):
        ax.plot([PAD, W - PAD], [y, y], color=RULE, lw=2, solid_capstyle='butt')
        for i, ln in enumerate(lines):
            ax.text(PAD, y + 40 + i * 42, ln, fontsize=pt(33), fontweight='semibold', color=INK, va='center', **font)
        ax.text(W - PAD, y + 44, f"{s['total']:.1f}", fontsize=pt(54), fontweight='bold', color=INK, ha='right',
                va='center', **font)
        tied = any(o is not s and f"{o['total']:.1f}" == f"{s['total']:.1f}" for o in stories)
        ax.text(W - PAD, y + 88, 'out of 10' + (' (tied)' if tied else ''), fontsize=pt(20), color=MUTED, ha='right',
                va='center', **font)
        base = y + NAME_H + HEADROOM + PLOT_H
        for j, c in enumerate(crit):
            v = float(s['scores'][c['key']])
            cx = PAD + slot * (j + 0.5)
            column(ax, cx, base, PLOT_H, TRACK)
            if v > 0:
                column(ax, cx, base, PLOT_H * v / 10, BAR)
            ax.text(cx, base - PLOT_H - 20, f'{v:g}', fontsize=pt(26), fontweight='semibold', color=INK,
                    ha='center', va='center', **font)
            ax.text(cx, base + 28, c.get('short') or c['label'].split()[0], fontsize=pt(23), color=INK2, ha='center',
                    va='center', **font)
        y += block_h
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
