// Town — the far-town layer of reference 2's street shots (f_1, f_33, f_42): palms, fronds (also as foreground
// framing from the top corners), a water tower, a parked car seen from behind, rolling hills. Ink + flat fills, so
// they relight with the time of day (<Tod role="far"> for the far ones, role="framing" for corner fronds).
// (Rolling hills: a Fill with smooth() bumps under <Tod role="far">, see src/dev/KitDemo.tsx; the cine `Hills` is the
// raw-SVG version that takes `tod`.)
//
//   <Palm x={760} y={900} h={220} at={1} seed="p1" />                       // trunk draws, fronds pop out
//   <Fronds x={1080} y={0} r={260} angles={[100, 130, 160, 190]} at={0.4} /> // framing from the top-right corner
//   <WaterTower x={880} y={860} h={150} at={1.4} />
//   <Car x={160} y={1010} w={240} at={1.6} color={palette.teal} />          // back view, peach tail lights

import React from 'react';
import {palette, stroke} from '../theme';
import {osc, useTime} from '../time';
import {rng, Seed} from '../rng';
import {Ink} from '../Ink';
import {Fill} from '../Fill';
import {Pop} from '../motion';
import {line, polyPath, rect, rectPath, roundRect, smooth, Pt} from '../sketch';
import {At, b, inkW, Place} from './common';

const f1 = (n: number) => n.toFixed(1);

// ---------------------------------------------------------------- fronds

/** One frond (local px, from the origin along `deg`): a jagged leaf whose spine droops; returns [fill, spine]. */
function frond(len: number, deg: number, droop: number, wid: number, seed: Seed): [string, string] {
  const r = rng(`frond/${seed}`);
  const a = (deg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const spine = (u: number): Pt => [dx * u * len, dy * u * len + droop * u * u * len];
  const n = 9;
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const [x, y] = spine(u);
    const [x2, y2] = spine(Math.min(1, u + 0.01));
    const tl = Math.hypot(x2 - x, y2 - y) || 1;
    const nx = -(y2 - y) / tl;
    const ny = (x2 - x) / tl;
    const w = Math.sin(Math.PI * Math.min(1, u * 1.1)) * wid * (i % 2 ? 1.25 : 0.55) * r.range(0.85, 1.1);
    L.push([x + nx * w, y + ny * w]);
    R.push([x - nx * w * 0.8, y - ny * w * 0.8]);
  }
  const fill = polyPath([...L, ...R.reverse()]);
  const sp = smooth(Array.from({length: 5}, (_, i) => spine(i / 4)), {});
  return [fill, sp];
}

export type FrondsProps = {
  x: number;
  y: number;
  /** Frond length (px). */
  r?: number;
  /** Frond directions in degrees (0 = right, 90 = down). */
  angles?: number[];
  at?: At;
  color?: string;
  seed?: Seed;
  /** On-screen ink width. */
  width?: number;
  /** Idle sway amplitude in degrees (default 1.2). */
  sway?: number;
};

/** A fan of palm fronds from one point: a palm crown, or framing that pokes in from a frame corner. */
export const Fronds: React.FC<FrondsProps> = ({x, y, r = 120, angles = [-170, -140, -110, -70, -40, -10, 25, 155], at, color = palette.teal, seed = 'fr', width = stroke.ink, sway = 1.2}) => {
  const t = useTime();
  const rr = rng(`fronds/${seed}`);
  const parts = angles.map((a, i) => {
    const down = Math.sin((a * Math.PI) / 180) > 0.3;
    return frond(r * rr.range(0.82, 1.08), a + rr.jitter(6), down ? 0.15 : 0.42, r * 0.11, `${seed}/${i}`);
  });
  const rot = sway ? osc(t, 0.23, rr.range(0, 6)) * sway : 0;
  const fills = parts.map((p) => p[0]).join('');
  const spines = parts.map((p) => p[1]).join('');
  const inner = (
    <>
      <Fill d={fills} color={color} seed={`${seed}/f`} />
      <Ink d={fills} width={width * 0.8} at={at} dur={0.3} />
      <Ink d={spines} width={width * 0.7} at={b(at, 0.1)} order="all" />
    </>
  );
  return (
    <Place x={x} y={y} rot={rot}>
      {at !== undefined ? (
        <Pop at={at + 0.05} x={0} y={0}>
          {inner}
        </Pop>
      ) : (
        inner
      )}
    </Place>
  );
};

// ---------------------------------------------------------------- palm

export type PalmProps = {x: number; y: number; h?: number; lean?: number; at?: At; seed?: Seed; color?: string; trunk?: string; width?: number};

/** A tall thin palm: a curved trunk (two ink lines, ochre fill) and a jagged crown of fronds. y = ground. */
export const Palm: React.FC<PalmProps> = ({x, y, h = 220, lean, at, seed = 'palm', color = palette.teal, trunk = palette.brown, width = stroke.inkThin}) => {
  const r = rng(`palm/${seed}`);
  const ln = lean ?? r.range(-0.18, 0.18);
  const top: Pt = [x + ln * h, y - h];
  const mid: Pt = [x + ln * h * 0.35 + r.jitter(6), y - h * 0.5];
  const w0 = Math.max(3, h * 0.035);
  const w1 = w0 * 0.6;
  const left = smooth([[x - w0, y], [mid[0] - (w0 + w1) / 2, mid[1]], [top[0] - w1, top[1]]], {});
  const right = smooth([[x + w0, y], [mid[0] + (w0 + w1) / 2, mid[1]], [top[0] + w1, top[1]]], {});
  const body = polyPath([[x - w0, y], [mid[0] - (w0 + w1) / 2, mid[1]], [top[0] - w1, top[1]], [top[0] + w1, top[1]], [mid[0] + (w0 + w1) / 2, mid[1]], [x + w0, y]]);
  let rings = '';
  for (let k = 1; k < 6; k++) {
    const u = k / 6;
    const cx = x + (top[0] - x) * u;
    const cy = y + (top[1] - y) * u;
    const ww = w0 + (w1 - w0) * u;
    rings += `M${f1(cx - ww)} ${f1(cy)}L${f1(cx + ww)} ${f1(cy - 1)}`;
  }
  return (
    <>
      <Fill d={body} color={trunk} at={b(at, 0.15)} mode="grow" dir="up" offset={false} seed={`${seed}/t`} />
      <Ink d={left + right} at={at} dur={0.3} width={width} order="all" />
      <Ink d={rings} at={b(at, 0.25)} width={width * 0.7} order="all" />
      <Fronds x={top[0]} y={top[1]} r={h * 0.36} at={b(at, 0.35)} color={color} seed={`${seed}/c`} width={width} />
    </>
  );
};

// ---------------------------------------------------------------- water tower

/** Reference 2's water tower on the far hill: four legs with cross bracing, a round tank, a conical cap. y = ground. */
export const WaterTower: React.FC<{x: number; y: number; h?: number; at?: At; seed?: Seed; tank?: string; cap?: string; width?: number}> = ({x, y, h = 150, at, seed = 'wt', tank = palette.white, cap = palette.teal, width = stroke.inkThin}) => {
  const tw = h * 0.42;
  const th = h * 0.26;
  const ty = y - h * 0.72; // tank bottom
  const legs = line(x - tw * 0.42, y, x - tw * 0.3, ty, {over: [0, 2], seed: `${seed}/l1`}) + line(x + tw * 0.42, y, x + tw * 0.3, ty, {over: [0, 2], seed: `${seed}/l2`}) + line(x - tw * 0.12, y, x - tw * 0.1, ty, {over: 0, seed: `${seed}/l3`}) + line(x + tw * 0.12, y, x + tw * 0.1, ty, {over: 0, seed: `${seed}/l4`});
  const my = (y + ty) / 2;
  const brace = `M${f1(x - tw * 0.4)} ${f1(y - 4)}L${f1(x + tw * 0.33)} ${f1(my)}L${f1(x - tw * 0.32)} ${f1(ty + 4)}M${f1(x + tw * 0.4)} ${f1(y - 4)}L${f1(x - tw * 0.33)} ${f1(my)}L${f1(x + tw * 0.32)} ${f1(ty + 4)}`;
  const capPts: Pt[] = [
    [x - tw * 0.56, ty - th],
    [x, ty - th - h * 0.14],
    [x + tw * 0.56, ty - th],
  ];
  return (
    <>
      <Ink d={legs} at={at} dur={0.3} width={width} order="all" />
      <Ink d={brace} at={b(at, 0.2)} width={width * 0.75} />
      <Fill d={roundRect(x - tw / 2, ty - th, tw, th, th * 0.25)} color={tank} at={b(at, 0.4)} seed={`${seed}/tk`} />
      <Ink d={rect(x - tw / 2, ty - th, tw, th, {seed: `${seed}/tki`, over: 3})} at={b(at, 0.3)} width={width} />
      <Fill d={polyPath(capPts)} color={cap} at={b(at, 0.5)} mode="grow" dir="up" seed={`${seed}/cp`} />
      <Ink d={line(capPts[0][0], capPts[0][1], capPts[1][0], capPts[1][1], {seed: `${seed}/c1`, over: [2, 0]}) + line(capPts[1][0], capPts[1][1], capPts[2][0], capPts[2][1], {seed: `${seed}/c2`, over: [0, 2]})} at={b(at, 0.42)} width={width} />
    </>
  );
};

// ---------------------------------------------------------------- car (back view)

/** A parked car seen from behind (reference 2 f_1): body, cabin with a pale rear window, peach tail lights, plate.
 *  x = centre, y = ground, w = width. */
export const Car: React.FC<{x: number; y: number; w?: number; at?: At; seed?: Seed; color?: string; glass?: string; width?: number; lightsOn?: number}> = ({x, y, w = 240, at, seed = 'car', color = palette.teal, glass = palette.mintPale, width = stroke.ink, lightsOn}) => {
  const t = useTime();
  const s = w / 240;
  const W = inkW(s, width);
  const on = lightsOn !== undefined && t >= lightsOn;
  return (
    <Place x={x} y={y} s={s}>
      {/* wheels peek out below the body */}
      <Fill d={rectPath(-108, -30, 34, 30) + rectPath(74, -30, 34, 30)} color={palette.ink} at={b(at, 0.2)} mode="snap" offset={false} seed={`${seed}/wh`} />
      {/* cabin */}
      <Fill d={polyPath([[-84, -96], [-62, -150], [62, -150], [84, -96]])} color={color} at={b(at, 0.22)} seed={`${seed}/cb`} />
      <Fill d={polyPath([[-66, -102], [-50, -140], [50, -140], [66, -102]])} color={glass} at={b(at, 0.34)} mode="wipe" dir="down" offset={false} seed={`${seed}/gl`} />
      {/* body */}
      <Fill d={roundRect(-120, -100, 240, 74, 14)} color={color} at={b(at, 0.18)} seed={`${seed}/bd`} />
      <Fill d={rectPath(-112, -84, 30, 16) + rectPath(82, -84, 30, 16)} color={on ? palette.sun : palette.peach} at={b(at, 0.4)} mode="snap" offset={false} seed={`${seed}/tl`} />
      <Fill d={rectPath(-26, -66, 52, 20)} color={palette.white} at={b(at, 0.44)} mode="snap" offset={false} seed={`${seed}/pl`} />
      <Ink
        d={polyPathOpen([[-84, -98], [-62, -150], [62, -150], [84, -98]]) + rect(-120, -100, 240, 74, {seed: `${seed}/bdi`, over: 3}) + rect(-66, -140, 132, 38, {seed: `${seed}/gli`, over: 2})}
        at={at}
        dur={0.35}
        width={W}
      />
      <Ink d={line(-124, -30, 124, -30, {seed: `${seed}/bp`, over: [4, 4]}) + rect(-26, -66, 52, 20, {seed: `${seed}/pli`, over: 1})} at={b(at, 0.3)} width={W * 0.8} />
    </Place>
  );
};
const polyPathOpen = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join('');
