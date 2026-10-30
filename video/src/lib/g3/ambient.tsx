// ambient.tsx: the SHARED AMBIENT KIT (G3_ANIMATIC §4: every set panel carries 2-3 ambient micro-moves, placed and
// scaled from these presets, never authored fresh per panel). Each is supporting life at its tier and at FINAL size
// and speed, so the mover budget shows on the board. They run on the FILM clock (phase from the seed), so the same
// preset in two panels of one set continues across a continuous join; story keys (a steam level, a window wave) are
// shot-local seconds like every other element time.
//
//   {"t": "ambient", "kit": "snow", "x": 0, "y": 600, "w": 1080, "h": 1080, "tier": "C"}
//   {"t": "ambient", "kit": "steam", "x": 540, "y": 900, "h": 300, "w": 220, "tier": "B", "level": [[0, 0.4], [2.9, 1]]}
//   {"t": "ambient", "kit": "window", "x": 400, "y": 700, "w": 400, "h": 500, "cols": 4, "rows": 5, "wave": [2.3, 3.9]}
//   {"t": "ambient", "kit": "cloud", "x": -200, "y": 80, "w": 1480, "h": 160, "speed": 10}
//   {"t": "ambient", "kit": "water", "pts": [[0, 1400], [1080, 1400]], "speed": 80}
//   {"t": "ambient", "kit": "bird", "x": 0, "y": 650, "w": 1080, "h": 120, "n": 3}
// Defaults (px/s at z 1): snow 55, steam rise 85, cloud 10, water 80, birds 70; snow flakes r 5, birds 18 px.

import React from 'react';
import {rng} from '../rng';
import {boardLoop, crown, ellipse, poly, type Pt} from '../sketch';
import {BOARD, stepL, type Weight} from './board';
import {keyed} from './motion';
import type {Ambient, Fill} from './types';

const mod = (a: number, n: number) => ((a % n) + n) % n;

/** the preset's main tone at its weight: A dark, B mid, C light (or the fill token asked) */
const markTone = (wt: Weight, fill?: Fill) => (fill ? wt.fill(fill) ?? BOARD.light : wt.tier === 'A' ? wt.tone(BOARD.dark)
  : wt.tier === 'C' ? wt.tone(BOARD.light) : wt.tone(BOARD.mid));

export const AmbientView: React.FC<{el: Ambient & {fill?: Fill; id?: string}; T: number; local: number; wt: Weight; seed: string}> = ({el, T, local, wt, seed}) => {
  const sd = (el as {seed?: string}).seed ?? seed;
  switch (el.kit) {
    case 'snow': {
      const n = el.n ?? Math.max(8, Math.min(90, Math.round((el.w * el.h) / 14000)));
      const r0 = el.r ?? 5;
      const v = el.speed ?? 55;
      const sway = el.sway ?? 12;
      const c = markTone(wt, el.fill);
      const out: React.ReactNode[] = [];
      for (let i = 0; i < n; i++) {
        const R = rng(`${sd}/f${i}`);
        const fx = R.range(0, el.w);
        const ph = R.range(0, el.h);
        const vi = v * R.range(0.8, 1.2);
        const period = R.range(2.2, 4.2);
        const a0 = R.range(0, Math.PI * 2);
        const rr = r0 * R.range(0.7, 1.2);
        const y = el.y + mod(ph + vi * T, el.h);
        const x = el.x + mod(fx + sway * Math.sin((2 * Math.PI * T) / period + a0), el.w);
        out.push(<circle key={i} cx={x} cy={y} r={rr} fill={c} />);
      }
      return <>{out}</>;
    }
    case 'steam': {
      const rate = el.rate ?? 2.6;
      const rise = el.rise ?? 85;
      const h = el.h ?? 260;
      const w = el.w ?? 160;
      const r0 = el.r ?? Math.max(14, w * 0.18);
      const life = h / rise;
      const k1 = Math.floor(T * rate);
      const k0 = k1 - Math.ceil(life * rate) - 1;
      const fillC = wt.tier === 'C' ? wt.tone(BOARD.light) : wt.tone(BOARD.paper);
      const lineC = wt.tier === 'C' ? null : wt.tier === 'A' ? wt.tone(BOARD.ink) : wt.tone(BOARD.mid);
      const lw = wt.tier === 'A' ? Math.min(5, wt.w) : 3;
      const out: React.ReactNode[] = [];
      for (let k = k1; k >= k0; k--) {
        const age = T - k / rate;
        if (age < 0 || age >= life) continue;
        const R = rng(`${sd}/p${k}`);
        // the level when this puff was born: a thinning or a stop lets the puffs already rising drift away
        const level = Math.max(0, Math.min(1, keyed(el.level, local - age, 1)));
        if (R.next() >= level) continue;
        const f = age / life;
        const x = el.x + Math.sin(f * 3.1 + R.range(0, 6.28)) * w * 0.16 + R.jitter(w * 0.08);
        const y = el.y - rise * age;
        const rr = (r0 + (w / 2 - r0) * f) * (0.6 + 0.4 * level) * R.range(0.85, 1.15);
        const ry = rr * 0.82;
        out.push(
          <g key={k}>
            <ellipse cx={x} cy={y} rx={rr} ry={ry} fill={fillC} />
            {lineC ? <path d={ellipse(x, y, rr, ry, {seed: `${sd}/l${k}`, ...boardLoop(rr)})} stroke={lineC} strokeWidth={lw} fill="none" strokeLinecap="round" /> : null}
          </g>,
        );
      }
      return <>{out}</>;
    }
    case 'window': {
      const cols = el.cols ?? 3;
      const rows = el.rows ?? 4;
      const [pw, ph] = el.pane ?? [Math.min(70, (el.w / cols) * 0.5), Math.min(90, (el.h / rows) * 0.5)];
      const lit = el.lit ? wt.fill(el.lit) ?? BOARD.paper : wt.tone(BOARD.paper);
      const dark = el.dark ? wt.fill(el.dark) ?? BOARD.mid : wt.tier === 'C' ? wt.tone(stepL(BOARD.light, -9)) : wt.tone(BOARD.mid);
      const n = cols * rows;
      const R = rng(`${sd}/order`);
      const order = R.shuffle(Array.from({length: n}, (_, i) => i));
      const rank = new Array<number>(n);
      order.forEach((cell, i) => (rank[cell] = i));
      // ambient: one window toggles each cycle (film clock); which one: a hash of the cycle's index
      const cyc = el.cycle ? Math.floor(T / el.cycle) : -1;
      const flip = el.cycle ? Math.floor(rng(`${sd}/c${cyc}`).next() * n) : -1;
      const out: React.ReactNode[] = [];
      for (let i = 0; i < n; i++) {
        const cx = i % cols;
        const cy = Math.floor(i / cols);
        const x = el.x + ((cx + 0.5) * el.w) / cols - pw / 2;
        const y = el.y + ((cy + 0.5) * el.h) / rows - ph / 2;
        let on = !!el.startLit;
        if (el.wave) {
          const [a, b] = el.wave;
          on = local >= a + ((b - a) * rank[i]) / Math.max(1, n - 1);
        }
        if (i === flip) on = !on;
        out.push(<rect key={i} x={x} y={y} width={pw} height={ph} fill={on ? lit : dark} />);
      }
      return <>{out}</>;
    }
    case 'cloud': {
      const rw = el.rw ?? 300;
      const rh = el.rh ?? 110;
      const v = el.speed ?? 10;
      const span = el.w + rw;
      const x = el.x - rw / 2 + mod((el.phase ?? rng(`${sd}/ph`).next()) * span + v * T, span);
      const cy = el.y + el.h / 2;
      const d = crown(x, cy, rw / 2, rh / 2, {seed: `${sd}/c`});
      const lineC = wt.tier === 'C' || wt.tier === null ? null : wt.line;
      return (
        <>
          <path d={d} fill={wt.tier === 'C' ? wt.tone(BOARD.light) : wt.tone(BOARD.paper)} />
          {lineC ? <path d={d} fill="none" stroke={lineC} strokeWidth={wt.tier === 'A' ? Math.min(5, wt.w) : 3} /> : null}
        </>
      );
    }
    case 'water': {
      const v = el.speed ?? 80;
      const dash = el.dash ?? 26;
      const gap = el.gap ?? 54;
      const d = poly(el.pts as Pt[], {seed: `${sd}/w`, joined: true, jitter: 0.3});
      return (
        <path d={d} fill="none" stroke={markTone(wt, el.fill)} strokeWidth={el.width ?? 6} strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-mod(v * T, dash + gap)} />
      );
    }
    case 'bird': {
      const n = el.n ?? 3;
      const v = el.speed ?? 70;
      const size = el.size ?? 18;
      const c = markTone(wt, el.fill);
      const out: React.ReactNode[] = [];
      for (let i = 0; i < n; i++) {
        const R = rng(`${sd}/b${i}`);
        const span = el.w + 4 * size;
        const x = el.x - 2 * size + mod(R.range(0, span) + v * R.range(0.85, 1.15) * T, span);
        const y = el.y + R.range(0.1, 0.9) * el.h + Math.sin(T * 1.3 + i) * 4;
        const up = Math.floor(T / 0.18 + i) % 2 === 0; // the wing tick: two drawings, stepped
        const s = size * R.range(0.8, 1.2);
        const d = up ? `M${x - s} ${y - s * 0.45}Q${x - s * 0.4} ${y - s * 0.5} ${x} ${y}Q${x + s * 0.4} ${y - s * 0.5} ${x + s} ${y - s * 0.45}`
          : `M${x - s} ${y + s * 0.2}Q${x - s * 0.4} ${y - s * 0.15} ${x} ${y}Q${x + s * 0.4} ${y - s * 0.15} ${x + s} ${y + s * 0.2}`;
        out.push(<path key={i} d={d} fill="none" stroke={c} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />);
      }
      return <>{out}</>;
    }
  }
  return null;
};
