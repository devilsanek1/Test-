// props/Elephant.tsx — the PHP marker family (P2): one generic ink elephant emblem (standing side-on, trunk raised;
// never periwinkle, never the PHP logo), the plaques it lives on, and the blueprint stamp.
//
//   <ElephantEmblem x={0} y={0} size={60} />                                  // 100 x 80 design box, centred on (x, y)
//   <ElephantPlaque x={150} y={1080} size={50} at={0.4} />                    // square sand wall plate (S01 ~20, plaque4 50)
//   <ElephantPlaque x={..} y={..} size={18} variant="blank" />                // blank cream plate (S02's three non-PHP)
//   <ElephantPlaque x={..} y={..} size={4} variant="dot" blinkAt={51.2} />    // S10 plaque dots (2-6 px)
//   <ElephantPlaque x={600} y={980} size={90} variant="round" swingAt={27.5} /> // round sign on an iron bracket (S06 r45)
//   <ElephantPlaque x={540} y={1120} size={120} variant="hanging" flipOldAt={62.4} cobwebAt={63} dustAt={63.1} caneAt={63.3} />
//   <ElephantStamp x={330} y={1400} rx={160} ry={60} slamAt={7.9} />        // S02 perspective print; r={40} for S05
//
// Plate anchors: (x, y) = plate CENTRE; 'round' / 'hanging' = the bracket's WALL POINT (the sign hangs below the arm,
// toward `side`). size = plate side / sign diameter in world px. Events: tickOnAt (count pop), pulseAt (112 % + two ink
// ring pulses, 0.2 s), swingAt (pendulum -16 -> 0, 0.5 s), flipOldAt (paper flip to the old plaque), cobwebAt, dustAt,
// caneAt (cane pops, the emblem leans 12 deg on it), wobbleAt, blinkAt (wave blink: cream flash + 125 % pop).
// The emblem switches to a solid ink silhouette under ~24 px on screen (reads at 14 px), line art above.

import React from 'react';
import {palette} from '../../../lib/theme';
import {ease as E, lerp, osc, prog, springAt, springs, useTime} from '../../../lib/time';
import {rand, Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {blob, circle, ellipse, line, polyPath, rect, roundRect, smooth, Pt} from '../../../lib/sketch';
import {mat, useXf, XG} from '../../../lib/xf';
import {bt, Depth, DEPTH_INK, lodOf, matScale, misregScreen, pendulum, PropBase, PropRoot, usePropFrame} from './common';
import {Cobweb} from './Glyphs';

// ---------------------------------------------------------------- emblem geometry (100 x 80 box, centred, faces right)

/** Closed tube polygon around a centreline (width w0 -> w1), smoothed. */
function tube(c: Pt[], w0: number, w1: number): string {
  const n = c.length;
  const L: Pt[] = [];
  const Rr: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = c[Math.max(0, i - 1)];
    const b = c[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const w = lerp(w0, w1, i / (n - 1)) / 2;
    L.push([c[i][0] + nx * w, c[i][1] + ny * w]);
    Rr.push([c[i][0] - nx * w, c[i][1] - ny * w]);
  }
  return smooth([...L, ...Rr.reverse()], {closed: true, tension: 0.45});
}

type EmblemGeo = {farLegs: string; nearLegs: string; body: string; head: string; trunk: string; ear: string; tail: string; eye: string; detail: string; toes: string; cane?: string};
const GEO = new Map<string, EmblemGeo>();

function emblemGeo(style: 'modern' | 'old'): EmblemGeo {
  const hit = GEO.get(style);
  if (hit) return hit;
  const old = style === 'old';
  const body = smooth(
    [
      [-36, 8],
      [-35, -8],
      [-24, -18],
      [-4, -21],
      [14, -18],
      [22, -6],
      [21, 10],
      [6, 18],
      [-16, 19],
      [-32, 15],
    ],
    {closed: true},
  );
  const farLegs = roundRect(-25, 6, 10, 27, 3) + roundRect(4, 6, 10, 27, 3);
  const nearLegs = roundRect(-34, 8, 11, 26, 3.5) + roundRect(12, 8, 11, 26, 3.5);
  const head = blob(26, -12, 13, 12.5, {seed: 'emb-head', wobble: 0.02});
  const trunkC: Pt[] = old
    ? [
        [34, -5],
        [40, -11],
        [44, -21],
        [45, -31],
        [41, -38],
        [35, -38],
        [33, -33],
        [37, -30],
      ]
    : [
        [34, -5],
        [40, -11],
        [44, -21],
        [44, -31],
        [40, -37],
        [35, -36],
      ];
  const trunk = tube(trunkC, 8.6, old ? 3.2 : 4.4);
  const ear = blob(20, -10, 9, 11.5, {seed: 'emb-ear', wobble: 0.03});
  const tail = old ? `M-35 -2Q-41 4 -42 10Q-43 16 -38 15Q-36 12 -39 11` : `M-35 -2Q-41 5 -41 13M-41 13l-2 3M-41 13l1.5 3`;
  const eye = blob(30.5, -15, 1.7, 1.7, {seed: 'emb-eye'});
  let detail = `M${[28, 0].join(' ')}Q33 2 36 -2`; // mouth line under the trunk
  if (old) detail += `M17 -14Q23 -16 23 -9Q22 -5 18 -7Q17 -10 20 -10` + `M-28 -10Q-10 -17 10 -14` + `M-30 10Q-12 15 8 12`;
  else detail += `M-26 -6Q-24 -12 -18 -14M-22 2Q-20 -4 -14 -6`; // two skin wrinkles on the back
  const toes = `M-32 32h3M-27 32h3M14 32h3M19 32h3`;
  const geo: EmblemGeo = {farLegs, nearLegs, body, head, trunk, ear, tail, eye, detail, toes};
  if (old) geo.cane = tube([[51, 34], [48, 8], [46, -12]], 4.2, 4.2) + tube([[46, -12], [45, -18], [40, -20], [36, -16]], 4.2, 4.2);
  GEO.set(style, geo);
  return geo;
}

export type ElephantEmblemProps = {
  x?: number;
  y?: number;
  /** Width of the 100 x 80 design box in world px. Default 100. */
  size?: number;
  style?: 'modern' | 'old';
  /** 'auto' (solid under ~24 px on screen), 'line' (ink over `bg` fills), 'solid' (ink silhouette). */
  mode?: 'auto' | 'line' | 'solid';
  /** Fill colour of the line-art parts (the plate colour, so overlaps read cleanly). Default sand. */
  bg?: string;
  /** Ink colour (default ink). */
  color?: string;
  at?: number;
  /** Lean (deg, clockwise) about the front foot: the old emblem leans on its cane. */
  lean?: number;
  /** Draw the cane (old style). Pops at caneAt. */
  cane?: boolean;
  caneAt?: number;
  /** Ink width in world px. Default by size. */
  ink?: number;
  seed?: Seed;
};

export const ElephantEmblem: React.FC<ElephantEmblemProps> = ({x = 0, y = 0, size = 100, style = 'modern', mode = 'auto', bg = palette.sand, color = palette.ink, at, lean = 0, cane = false, caneAt, ink, seed = 'emb'}) => {
  const t = useTime();
  const m = useXf();
  const s = size / 100;
  const screen = size * matScale(m);
  const solid = mode === 'solid' || (mode === 'auto' && screen < 24);
  const G = emblemGeo(style);
  const W = (ink ?? Math.max(1.1, Math.min(3.4, size * 0.035))) / s;
  if (at !== undefined && t < at) return null;
  const leanM = lean ? mat.about(mat.rotate(lean), 18, 34) : mat.I;
  const caneK = caneAt !== undefined ? springAt(t, caneAt, springs.pop) : 1;
  const parts: React.ReactNode[] = [];
  if (solid) {
    parts.push(<Fill key="sil" d={G.farLegs + G.body + G.nearLegs + G.head + G.trunk + G.ear} color={color} at={at} mode="snap" offset={false} seed={`${seed}/sil`} lookExempt />);
  } else {
    const L = (k: string, d: string, dt: number, fill = true, wk = 1, open = 0) => {
      if (fill) parts.push(<Fill key={`${k}F`} d={d} color={bg} at={bt(at, dt + 0.04)} mode="snap" offset={false} seed={`${seed}/${k}F`} />);
      parts.push(<Ink key={`${k}I`} d={d} at={bt(at, dt)} width={W * wk} color={color} seed={`${seed}/${k}I`} open={open} />);
    };
    L('farLegs', G.farLegs, 0.1);
    L('body', G.body, 0, true, 1, 0.08);
    L('nearLegs', G.nearLegs, 0.14);
    L('head', G.head, 0.05);
    L('trunk', G.trunk, 0.08);
    L('ear', G.ear, 0.12);
    parts.push(<Ink key="tail" d={G.tail} at={bt(at, 0.16)} width={W * 0.9} color={color} seed={`${seed}/tail`} />);
    parts.push(<Fill key="eye" d={G.eye} color={color} at={bt(at, 0.2)} mode="snap" offset={false} seed={`${seed}/eye`} lookExempt />);
    if (screen >= 44) parts.push(<Ink key="det" d={G.detail + (screen >= 70 ? G.toes : '')} at={bt(at, 0.2)} width={W * 0.6} color={color} seed={`${seed}/det`} order="all" />);
  }
  const caneNode =
    cane && G.cane && (caneAt === undefined || t >= caneAt) ? (
      <XG key="cane" m={mat.about(mat.scale(caneK), 51, 34)}>
        <Fill d={G.cane} color={palette.brown} offset={false} seed={`${seed}/caneF`} />
        {!solid ? <Ink d={G.cane} width={W * 0.75} color={color} seed={`${seed}/caneI`} /> : null}
      </XG>
    ) : null;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.scale(s))}>
      <XG m={leanM}>{parts}</XG>
      {caneNode}
    </XG>
  );
};

// ---------------------------------------------------------------- ElephantPlaque

export type PlaqueVariant = 'plate' | 'blank' | 'dot' | 'round' | 'hanging';

export type ElephantPlaqueProps = PropBase & {
  /** Plate side / sign diameter in world px. Default 50. */
  size?: number;
  variant?: PlaqueVariant;
  age?: 'new' | 'old';
  /** Bracket arm direction for round / hanging signs. Default 'right'. */
  side?: 'left' | 'right';
  /** Bracket arm length (world px). Default 0.95 x size. */
  arm?: number;
  tickOnAt?: number;
  pulseAt?: number | number[];
  swingAt?: number;
  flipOldAt?: number;
  cobwebAt?: number;
  dustAt?: number;
  caneAt?: number;
  wobbleAt?: number;
  blinkAt?: number;
  /** Plate colour override (default sand; old = tan; blank = cream). */
  color?: string;
};

export const ElephantPlaque: React.FC<ElephantPlaqueProps> = (p) => {
  const t = useTime();
  const {x = 0, y = 0, size = 50, variant = 'plate', at, outAt, outDur, seed = 'plq', side = 'right'} = p;
  const s = size / 100; // local design: plate 100 x 100 centred
  const F = usePropFrame({scale: s, depth: p.depth, ink: p.ink, at, dur: p.dur, baseDur: 0.5, seed, defDepth: size >= 80 ? 'mid' : 'far'});
  const lod = lodOf(100 * F.k, 6, 22);
  const start = p.tickOnAt ?? at;
  if (start !== undefined && t < start) return null;
  const T = (dt: number) => bt(start, dt * (p.dur ? p.dur / 0.5 : 1));
  const flipQ = p.flipOldAt !== undefined ? prog(t, p.flipOldAt, 0.2, E.inOutSine) : 0;
  const old = p.age === 'old' || flipQ >= 0.5;
  const flipSx = p.flipOldAt !== undefined && flipQ > 0 && flipQ < 1 ? Math.max(0.02, Math.abs(Math.cos(Math.PI * flipQ))) : 1;
  const blink = p.blinkAt !== undefined && t >= p.blinkAt && t < p.blinkAt + 0.1;
  const plateCol = p.color ?? (variant === 'blank' ? palette.cream : old ? palette.tan : palette.sand);
  const W = F.W;

  // scale pulses: tick pop, pulse 112 %, blink 125 %
  let k = p.tickOnAt !== undefined ? springAt(t, p.tickOnAt, springs.pop) : 1;
  const pulses = p.pulseAt === undefined ? [] : Array.isArray(p.pulseAt) ? p.pulseAt : [p.pulseAt];
  const rings: React.ReactNode[] = [];
  for (const pa of pulses) {
    if (t >= pa && t < pa + 0.32) {
      const q = (t - pa) / 0.2;
      k *= 1 + 0.12 * Math.sin(Math.PI * Math.min(1, q));
      for (let i = 0; i < 2; i++) {
        const qq = (t - pa - i * 0.08) / 0.22;
        if (qq > 0 && qq < 1) rings.push(<rect key={`r${pa}${i}`} x={-50 - 14 - 26 * qq} y={-50 - 14 - 26 * qq} width={128 + 52 * qq} height={128 + 52 * qq} rx={10} fill="none" stroke={palette.ink} strokeWidth={W * (1 - qq)} />);
      }
    }
  }
  if (blink) k *= 1.25;
  const wob = p.wobbleAt !== undefined && t >= p.wobbleAt && t < p.wobbleAt + 0.6 ? 5 * Math.exp(-(t - p.wobbleAt) * 6) * Math.sin((t - p.wobbleAt) * 30) : 0;

  // ---- the plate face (local 100 x 100 centred on 0, 0)
  const face: React.ReactNode[] = [];
  if (variant === 'dot' || lod === 0) {
    face.push(<Fill key="dot" d={blob(0, 0, 50, 50, {seed: `${seed}/dot`, wobble: 0.02})} color={blink ? palette.cream : plateCol} at={start} mode="snap" offset={false} seed={`${seed}/dot`} />);
    if (100 * F.k >= 3.2 && variant === 'dot') face.push(<Ink key="dotI" d={circle(0, 0, 50, {seed: `${seed}/doti`})} width={Math.min(W, 1.2 / F.k)} taper={false} seed={`${seed}/doti`} />);
  } else if (variant === 'round') {
    face.push(<Fill key="disc" d={blob(0, 0, 50, 50, {seed: `${seed}/disc`, wobble: 0.015})} color={blink ? palette.cream : plateCol} at={T(0.1)} offset={F.off} seed={`${seed}/disc`} />);
    face.push(<Ink key="discI" d={circle(0, 0, 50, {seed: `${seed}/disci`, overlap: 14})} at={T(0)} width={W} seed={`${seed}/disci`} />);
    if (lod === 2) face.push(<Ink key="disc2" d={circle(0, 0, 41, {seed: `${seed}/disc2`, overlap: -30})} at={T(0.12)} width={W * 0.55} seed={`${seed}/disc2`} />);
    face.push(<ElephantEmblem key="emb" size={66} y={2} bg={plateCol} style={old ? 'old' : 'modern'} at={T(0.2)} seed={`${seed}/e`} ink={W * 0.8} />);
  } else {
    // square plate (wall plate / hanging sign); the old one has a chipped corner
    const plate = old ? polyPath([[-50, -50], [26, -50], [33, -42], [38, -44], [44, -36], [50, -30], [50, 50], [-50, 50]]) : roundRect(-50, -50, 100, 100, 6);
    face.push(<Fill key="plate" d={plate} color={blink ? palette.cream : plateCol} at={T(0.1)} offset={F.off} seed={`${seed}/plate`} />);
    if (lod === 2 && variant !== 'blank') face.push(<Fill key="bevel" d={polyPath([[-50, -44], [-43, -44], [-43, 43], [44, 43], [44, 50], [-50, 50]])} color={old ? palette.brown : palette.tan} at={T(0.2)} mode="snap" offset={F.off} seed={`${seed}/bev`} />);
    face.push(<Ink key="plateI" d={old ? polyPath([[-50, -50], [26, -50], [33, -42], [38, -44], [44, -36], [50, -30], [50, 50], [-50, 50]]) : rect(-50, -50, 100, 100, {seed: `${seed}/pi`, over: 5})} at={T(0)} width={W} seed={`${seed}/pi`} />);
    if (lod === 2) {
      const scr = variant === 'blank' ? [[-38, 0], [38, 0]] : [[-38, -38], [38, 38], [-38, 38], [old ? 30 : 38, old ? -32 : -38]];
      face.push(<Fill key="screws" d={scr.map(([a, b2]) => blob(a, b2, 3.6, 3.6, {seed: `${seed}/s${a}${b2}`})).join('')} color={palette.ink} at={T(0.3)} mode="snap" offset={false} seed={`${seed}/scr`} />);
    }
    if (variant !== 'blank') face.push(<ElephantEmblem key="emb" size={74} y={4} bg={plateCol} style={old ? 'old' : 'modern'} at={T(0.2)} seed={`${seed}/e`} ink={W * 0.8} cane={old} caneAt={p.caneAt} lean={old ? 12 * (p.caneAt === undefined ? 1 : prog(t, p.caneAt + 0.12, 0.2, E.outBack(1.4))) : 0} />);
  }
  if (old && lod === 2) {
    if (p.cobwebAt !== undefined || p.age === 'old') face.push(<Cobweb key="web" x={-50} y={-50} r={44} corner="tl" at={p.cobwebAt} width={1.6 / s} seed={`${seed}/web`} />);
    const dustT = p.dustAt;
    if (dustT !== undefined || p.age === 'old') {
      const pts: Pt[] = [[-30, 60], [8, 58], [36, 63], [58, 24], [-60, 30]];
      pts.forEach(([dx, dy], i) => {
        const a = dustT === undefined ? undefined : dustT + i * 0.04;
        face.push(<Fill key={`dust${i}`} d={blob(dx, dy, 2.6, 2.6, {seed: `${seed}/du${i}`})} color={palette.ink} at={a} mode="spring" offset={false} seed={`${seed}/du${i}`} />);
      });
    }
  }

  const faceNode = (
    <XG m={mat.compose(mat.scale(flipSx * k, k), mat.rotate(wob))}>
      {face}
      {rings}
    </XG>
  );

  // ---- hanging signs: bracket + pendulum about the hook
  if (variant === 'round' || variant === 'hanging') {
    const dir = side === 'right' ? 1 : -1;
    const armL = (p.arm ?? size * 0.95) / s;
    const hookX = dir * armL * 0.66;
    const chain = 16;
    const sw = pendulum(t, p.swingAt, -16, 0.5, 0.8) * dir;
    const brW = Math.max(W * 1.3, 2.4 / s);
    const bracket =
      line(0, 0, dir * armL, 0, {over: [0, 3], seed: `${seed}/arm`}) +
      line(0, armL * 0.55, dir * armL * 0.5, 0, {over: [0, 0], seed: `${seed}/brace`}) +
      `M${dir * armL} 0q${dir * 8} 0 ${dir * 8} -8q0 -6 ${-dir * 5} -5`;
    const signTop = chain;
    return (
      <PropRoot x={x} y={y} s={s} rot={p.rot} flip={p.flip} outAt={outAt} outDur={outDur}>
        <Ink d={bracket} at={T(0)} width={brW} seed={`${seed}/br`} />
        <Fill d={roundRect(-6, -10, 12, armL * 0.75, 4)} color={palette.tealDark} at={T(0.05)} mode="snap" offset={false} seed={`${seed}/plate0`} />
        <XG m={mat.about(mat.rotate(sw), hookX, 0)}>
          <Ink d={`M${hookX - 18} 0L${hookX - 22} ${signTop}M${hookX + 18} 0L${hookX + 22} ${signTop}`} at={T(0.05)} width={W * 0.7} seed={`${seed}/ch`} order="all" />
          <XG m={mat.translate(hookX, signTop + 50)}>{faceNode}</XG>
        </XG>
      </PropRoot>
    );
  }
  return (
    <PropRoot x={x} y={y} s={s} rot={p.rot} flip={p.flip} outAt={outAt} outDur={outDur}>
      {faceNode}
    </PropRoot>
  );
};

/** Centre of a hanging sign's face (world) for a bracket at (x, y): handy to place a cane / cobweb / Pip's look target. */
export function signCentre(x: number, y: number, size: number, side: 'left' | 'right' = 'right', arm?: number): Pt {
  const dir = side === 'right' ? 1 : -1;
  const armL = arm ?? size * 0.95;
  return [x + dir * armL * 0.66, y + (size / 100) * 16 + size / 2];
}

// ---------------------------------------------------------------- ElephantStamp

export type ElephantStampProps = {
  x: number;
  y: number;
  /** Ellipse radii (perspective print, S02 160 x 60) or a round stamp radius `r` (S05 40). */
  rx?: number;
  ry?: number;
  r?: number;
  /** Ring width (world px). Default 14 (ellipse) / 0.17 r (round). */
  ring?: number;
  color?: string;
  /** Drawn at `at` (no slam), or SLAM: the ink ring strokes on (0.13 s), then the print slams 2.6 x -> 1.0 x (0.27 s). */
  at?: number;
  slamAt?: number;
  depth?: Depth;
  seed?: Seed;
};

export const ElephantStamp: React.FC<ElephantStampProps> = ({x, y, rx: rxIn, ry: ryIn, r, ring, color = palette.sand, at, slamAt, depth, seed = 'stamp'}) => {
  const t = useTime();
  const rx = rxIn ?? r ?? 40;
  const ry = ryIn ?? r ?? 40;
  const rw = ring ?? (r !== undefined ? r * 0.17 : 14);
  const iw = DEPTH_INK[depth ?? 'far'];
  const start = slamAt ?? at;
  if (start !== undefined && t < start) return null;
  const ringAt = slamAt;
  const printAt = slamAt !== undefined ? slamAt + 0.13 : at;
  const showPrint = printAt === undefined || t >= printAt;
  const k = slamAt !== undefined && showPrint ? lerp(2.6, 1, E.inOutCubic(prog(t, printAt!, 0.27))) : 1;
  const sq = ry / rx;
  const off = misregScreen(seed);
  const ringPath = `M${x - rx} ${y}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0Z` + `M${x - rx + rw} ${y}a${rx - rw} ${ry - rw * sq} 0 1 1 ${(rx - rw) * 2} 0a${rx - rw} ${ry - rw * sq} 0 1 1 ${-(rx - rw) * 2} 0Z`;
  return (
    <>
      {ringAt !== undefined ? <Ink d={ellipse(x, y, rx + 2, ry + 2, {seed: `${seed}/ri`, overlap: 18})} at={ringAt} dur={0.13} width={iw} taper={false} seed={`${seed}/ri`} /> : null}
      {showPrint ? (
        <XG m={mat.about(mat.scale(k), x, y)}>
          <Fill d={ringPath} color={color} rule="evenodd" offset={[off[0] * 0.8, off[1] * 0.8]} seed={`${seed}/ring`} />
          <XG m={mat.compose(mat.translate(x, y), mat.scale(1, sq), mat.translate(-x, -y))}>
            <ElephantEmblem x={x} y={y + rx * 0.04} size={rx * 1.12} mode="line" bg={palette.cream} seed={`${seed}/e`} ink={iw * 1.1} />
          </XG>
          {ringAt === undefined ? <Ink d={ellipse(x, y, rx + 2, ry + 2, {seed: `${seed}/ri`, overlap: 18})} width={iw} taper={false} seed={`${seed}/ri2`} /> : null}
        </XG>
      ) : null}
    </>
  );
};

/** Seeded colour variety helper for plaque rows (rarely used: keeps every plaque sand unless old). */
export const plaqueSeed = (i: number, base: Seed = 'row') => `${base}/${i}/${Math.floor(rand(base, i) * 1000)}`;
export {osc};
