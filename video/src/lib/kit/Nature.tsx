// Nature / street props: Tree, Bike, BirdsOnWire, LampPost.
//
//   <Tree x={780} y={900} size={80} at={2.0} seed="t1" />           // trunk, then scalloped crown pops, leaf ticks
//   <Bike x={200} y={1000} at={3} seed="b" basket />                  // ink only, wheels draw as loops
//   <BirdsOnWire x1={70} y1={300} x2={890} y2={280} sag={20} n={3} at={1} flyAt={6} />
//   <LampPost x={150} y={900} h={320} at={1} lightAt={4} />

import React from 'react';
import {palette, stroke} from '../theme';
import {ease as E, lerp, osc, prog, springAt, springs, useTime} from '../time';
import {rand, rng, Seed} from '../rng';
import {Ink} from '../Ink';
import {Fill} from '../Fill';
import {Pop, Wobble} from '../motion';
import {ExitFade} from '../exit';
import {blob, circle, crown, crownTicks, line, poly, polyPath, wire, wirePoint, Pt} from '../sketch';
import {At, b, inkW, Place} from './common';
import {mat, XG} from '../xf';

// ---------------------------------------------------------------- Tree

export type TreeProps = {
  x: number;
  y: number;
  /** Crown radius (px). Default 80. */
  size?: number;
  /** Trunk height to crown centre. Default size * 1.35. */
  h?: number;
  at?: At;
  seed?: Seed;
  color?: string;
  /** 'round' | 'tall' (narrow) | 'bush' (no trunk) | 'line' (crown not filled, like the reference's white tree). */
  variant?: 'round' | 'tall' | 'bush' | 'line';
  /** Idle sway. Default true. */
  sway?: boolean;
  width?: number;
};

export const Tree: React.FC<TreeProps> = ({x, y, size = 80, h, at, seed = 'tree', color = palette.teal, variant = 'round', sway = true, width = stroke.ink}) => {
  const r = rng(`tree/${seed}`);
  const rx = variant === 'tall' ? size * 0.72 : size;
  const ry = variant === 'tall' ? size * 1.15 : size * 0.9;
  const th = variant === 'bush' ? 0 : h ?? size * 1.35;
  const cx = x + r.jitter(size * 0.05);
  const cy = y - th - (variant === 'bush' ? ry * 0.85 : 0);
  const crownD = crown(cx, cy, rx, ry, {seed: `${seed}/c`});
  const trunk = th > 0 ? line(x - 3, y, x - 2, cy + ry * 0.2, {over: [0, 0], seed: `${seed}/t1`}) + line(x + 4, y, x + 3, cy + ry * 0.35, {over: [0, 0], seed: `${seed}/t2`}) : '';
  const branches =
    th > 0
      ? line(x, cy + ry * 0.92, x - rx * r.range(0.16, 0.26), cy + ry * r.range(0.5, 0.62), {over: [0, 1], seed: `${seed}/b1`}) +
        line(x + 1, cy + ry * 1.0, x + rx * r.range(0.12, 0.2), cy + ry * r.range(0.68, 0.78), {over: [0, 1], seed: `${seed}/b2`})
      : '';
  const ticks = crownTicks(cx, cy, rx, ry, {seed: `${seed}/k`});
  const content = (
    <>
      {trunk ? <Ink d={trunk} at={at} dur={0.3} width={width} order="all" /> : null}
      {variant !== 'line' ? (
        <Pop at={b(at, 0.4) ?? -100} x={cx} y={cy + ry * 0.6} spring={springs.pop}>
          <Fill d={crownD} color={color} seed={`${seed}/cf`} />
        </Pop>
      ) : null}
      {branches ? <Ink d={branches} at={b(at, 0.55)} dur={0.2} width={width * 0.85} order="all" /> : null}
      <Ink d={crownD} at={b(at, 0.15)} dur={0.55} width={width} />
      <Ink d={ticks} at={b(at, 0.75)} dur={0.3} width={width * 0.8} order="all" />
    </>
  );
  if (!sway) return content;
  return (
    <Wobble amp={0.6} rot={0.7} hz={0.35} x={x} y={y} seed={`${seed}/w`}>
      {content}
    </Wobble>
  );
};

// ---------------------------------------------------------------- Bike

export type BikeProps = {x: number; y: number; s?: number; at?: At; seed?: Seed; basket?: boolean; flip?: boolean; color?: string; width?: number};

/** Side-view bicycle, ink only (local origin = ground point between the wheels). */
export const Bike: React.FC<BikeProps> = ({x, y, s = 1, at, seed = 'bike', basket = false, flip = false, color, width = stroke.ink}) => {
  const R = 34;
  const rw: Pt = [-50, -R];
  const fw: Pt = [52, -R];
  const bb: Pt = [-4, -R + 2];
  const seatTop: Pt = [-20, -R - 50];
  const head: Pt = [36, -R - 52];
  const W = inkW(s, width);
  const wheels = circle(rw[0], rw[1], R, {seed: `${seed}/w1`, overlap: 12}) + circle(fw[0], fw[1], R, {seed: `${seed}/w2`, overlap: 16});
  const frame =
    poly([rw, bb, seatTop, rw], {seed: `${seed}/f1`, over: [0, 3]}) +
    poly([bb, head, seatTop], {seed: `${seed}/f2`, over: [0, 4]}) +
    line(head[0], head[1], fw[0], fw[1], {seed: `${seed}/fork`, over: [3, 0]});
  const parts =
    line(seatTop[0], seatTop[1], seatTop[0] - 4, seatTop[1] - 12, {over: 0, seed: `${seed}/sp`}) +
    line(seatTop[0] - 16, seatTop[1] - 13, seatTop[0] + 8, seatTop[1] - 13, {over: 1, seed: `${seed}/seat`}) +
    line(head[0], head[1], head[0] - 4, head[1] - 14, {over: 0, seed: `${seed}/stem`}) +
    line(head[0] - 12, head[1] - 15, head[0] + 8, head[1] - 17, {over: 1, seed: `${seed}/bar`});
  const bsk = basket ? poly([[head[0] + 6, head[1] - 4], [head[0] + 40, head[1] - 4], [head[0] + 34, head[1] + 22], [head[0] + 10, head[1] + 22]], {closed: true, seed: `${seed}/bk`, over: 2}) : '';
  return (
    <Place x={x} y={y} s={s} flip={flip}>
      {basket ? <Fill d={polyPath([[head[0] + 6, head[1] - 4], [head[0] + 40, head[1] - 4], [head[0] + 34, head[1] + 22], [head[0] + 10, head[1] + 22]])} color={palette.tan} at={b(at, 0.9)} seed={`${seed}/bkf`} /> : null}
      <Ink d={wheels} at={at} dur={0.5} width={W} color={color} />
      <Ink d={frame} at={b(at, 0.3)} dur={0.5} width={W} color={color} />
      <Ink d={parts + bsk} at={b(at, 0.7)} dur={0.35} width={W} color={color} />
      <Ink d={circle(bb[0], bb[1], 6, {seed: `${seed}/bbc`})} at={b(at, 0.8)} dur={0.1} width={W * 0.8} color={color} />
    </Place>
  );
};

// ---------------------------------------------------------------- Birds on a wire

const birdBody = (seed: string) => blob(0, -10, 13, 9, {seed, wobble: 0.04});

export const Bird: React.FC<{x: number; y: number; s?: number; seed?: Seed; at?: At; flyAt?: number; flyTo?: [number, number]; color?: string; flip?: boolean}> = ({
  x,
  y,
  s = 1,
  seed = 'bird',
  at,
  flyAt,
  flyTo = [260, -320],
  color = palette.cream,
  flip,
}) => {
  const t = useTime();
  const sd = String(seed);
  const ph = rand(sd, 'ph') * 6.28;
  if (at !== undefined && t < at) return null;
  const fly = flyAt !== undefined ? prog(t, flyAt, 1.6, E.inQuad) : 0;
  if (fly >= 1) return null;
  const pop = at !== undefined ? springAt(t, at, springs.wobbly) : 1;
  // idle: occasional head turn + tiny hop
  const look = Math.sin(t * 1.3 + ph) > 0.75 ? -10 : 0;
  const hop = Math.max(0, osc(t, 0.23, ph)) > 0.97 ? -3 : 0;
  if (fly > 0) {
    const fx = flyTo[0] * fly;
    const fy = flyTo[1] * fly - Math.sin(fly * Math.PI) * 40;
    const flap = osc(t, 7, ph) * 9;
    const d = `M-16 ${-6 - flap}Q-8 -2 0 0Q8 -2 16 ${-6 - flap}`;
    return (
      <Place x={x + fx} y={y + fy - 12} s={s * (1 - fly * 0.4)}>
        <path d={d} fill="none" stroke={palette.ink} strokeWidth={inkW(s) * 0.9} strokeLinecap="round" strokeLinejoin="round" />
      </Place>
    );
  }
  return (
    <Place x={x} y={y + hop} s={s * pop} flip={flip}>
      <Fill d={birdBody(sd)} color={color} offset={[-2, -1]} seed={`${sd}/f`} />
      <Ink d={`M-11 -16Q-2 -21 6 -18M-12 -4Q-4 1 8 -2M-12 -7L-24 -2`} width={inkW(s) * 0.85} seed={`${sd}/i`} />
      <XG m={look ? mat.about(mat.rotate(look), 9, -16) : mat.I}>
        <Fill d={blob(10, -19, 6.5, 6, {seed: `${sd}/h`})} color={color} offset={false} seed={`${sd}/hf`} />
        <Ink d={circle(10, -19, 6.5, {seed: `${sd}/h`, overlap: 12})} width={inkW(s) * 0.85} />
        <Fill d="M16 -19L21 -18L16 -16.5Z" color={palette.sun} offset={false} mode="snap" seed={`${sd}/bk`} />
        <Fill d={blob(12, -20.5, 1.2, 1.2, {seed: `${sd}/eye`})} color={palette.ink} offset={false} seed={`${sd}/ey`} />
      </XG>
      <Fill d={`M-6 -14Q2 -16 6 -10Q0 -6 -8 -9Z`} color={palette.tan} offset={false} seed={`${sd}/w`} />
    </Place>
  );
};

export type BirdsOnWireProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  sag?: number;
  /** Number of birds (placed around the middle) or explicit positions 0..1 along the wire. */
  n?: number;
  us?: number[];
  at?: At;
  /** Birds take off (staggered) at this time. */
  flyAt?: number;
  seed?: Seed;
  s?: number;
  width?: number;
};

export const BirdsOnWire: React.FC<BirdsOnWireProps> = ({x1, y1, x2, y2, sag = 18, n = 3, us, at, flyAt, seed = 'birds', s = 1, width = stroke.inkThin}) => {
  const r = rng(`birds/${seed}`);
  const pos = us ?? Array.from({length: n}, (_, i) => 0.5 + (i - (n - 1) / 2) * r.range(0.045, 0.06) * (60 / Math.max(60, Math.abs(x2 - x1) / 10)));
  return (
    <>
      <Ink d={wire(x1, y1, x2, y2, sag, {seed: `${seed}/w`})} at={at} dur={0.6} width={width} />
      {pos.map((u, i) => {
        const [bx, by] = wirePoint(x1, y1, x2, y2, sag, u);
        return <Bird key={i} x={bx} y={by + 1} s={s} seed={`${seed}/${i}`} at={b(at, 0.5 + i * 0.12)} flyAt={flyAt !== undefined ? flyAt + i * 0.18 : undefined} />;
      })}
    </>
  );
};

// ---------------------------------------------------------------- Lamp post

export type LampPostProps = {x: number; y: number; h?: number; at?: At; seed?: Seed; lightAt?: number; arm?: 'left' | 'right'; color?: string; width?: number};

export const LampPost: React.FC<LampPostProps> = ({x, y, h = 320, at, seed = 'lamp', lightAt, arm = 'right', color = palette.tealDark, width = stroke.ink}) => {
  const t = useTime();
  const dir = arm === 'right' ? 1 : -1;
  const top = y - h;
  const ax = x + dir * 58;
  const pole = line(x - 4, y, x - 4, top, {over: [0, 0], seed: `${seed}/p1`}) + line(x + 4, y, x + 4, top + 6, {over: [0, 0], seed: `${seed}/p2`});
  const armD = `M${x} ${top + 4}Q${x + dir * 6} ${top - 26} ${ax} ${top - 18}`;
  const shade: Pt[] = [
    [ax - 18, top + 6],
    [ax - 9, top - 18],
    [ax + 9, top - 18],
    [ax + 18, top + 6],
  ];
  // switches on with a 1-frame flicker (on, off, on): never a fade. The cone is a static translucent flat polygon.
  const dt = lightAt !== undefined ? t - lightAt : -1;
  const lit = dt >= 0 && !(dt > 0.07 && dt < 0.14) ? 1 : 0;
  const flick = 1;
  return (
    <>
      {lit > 0 ? (
        <ExitFade>
          <Fill d={polyPath([[ax - 14, top + 6], [ax + 14, top + 6], [ax + 80, y], [ax - 80, y]])} color={palette.cream} opacity={0.38 * lit * flick} offset={false} seed={`${seed}/cone`} />
          <circle cx={ax} cy={top + 8} r={30} fill={palette.peach} opacity={0.3 * lit * flick} />
          <circle cx={ax} cy={top + 8} r={18} fill={palette.peach} opacity={0.3 * lit * flick} />
        </ExitFade>
      ) : null}
      <Fill d={`M${x - 4} ${y}L${x - 4} ${top}L${x + 4} ${top}L${x + 4} ${y}Z`} color={color} at={b(at, 0.4)} mode="grow" offset={false} seed={`${seed}/pf`} />
      <Fill d={`M${x - 12} ${y}L${x - 8} ${y - 26}L${x + 8} ${y - 26}L${x + 12} ${y}Z`} color={color} at={b(at, 0.45)} mode="grow" offset={false} seed={`${seed}/base`} />
      <Ink d={pole} at={at} dur={0.4} width={width} order="all" />
      <Ink d={armD} at={b(at, 0.35)} dur={0.25} width={width} />
      <Fill d={polyPath(shade)} color={color} at={b(at, 0.7)} mode="pop" seed={`${seed}/sh`} />
      <Ink d={poly(shade, {closed: true, seed: `${seed}/shi`, over: 2})} at={b(at, 0.55)} dur={0.3} width={width} />
      <ExitFade>
        <circle cx={ax} cy={top + 9} r={5} fill={lit > 0 ? palette.sun : palette.cream} />
      </ExitFade>
    </>
  );
};


// ---------------------------------------------------------------- Festoon: string lights (reference 2). (The cine lane has a richer StringLights with tod / sway.)

export type FestoonProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Sag (px, positive = down). */
  sag?: number;
  /** Number of bulbs. Default: one per ~70 px. */
  n?: number;
  /** Bulb radius (px). [near, far] interpolates along the wire (a strand receding in perspective). Default 9. */
  bulb?: number | [number, number];
  at?: At;
  /** Bulbs switch on L->R (1 frame apart), each a 1-frame pop to peach with a stepped halo. */
  lightAt?: number;
  seed?: Seed;
  /** Wire ink width (on screen). Default inkThin. */
  width?: number;
  color?: string;
  litColor?: string;
};

/** A festoon of bulbs on a sagging wire. Wire draws, bulbs pop in L->R, then light up. Built from Ink/Fill only, so
 *  it works inside a <Plane> and un-builds with the scene. */
export const Festoon: React.FC<FestoonProps> = ({x1, y1, x2, y2, sag = 30, n, bulb = 9, at, lightAt, seed = 'lights', width = stroke.inkThin, color = palette.white, litColor = palette.peach}) => {
  const t = useTime();
  const len = Math.hypot(x2 - x1, y2 - y1);
  const count = n ?? Math.max(3, Math.round(len / 70));
  const [b0, b1] = Array.isArray(bulb) ? bulb : [bulb, bulb];
  const out: React.ReactNode[] = [<Ink key="w" d={wire(x1, y1, x2, y2, sag, {seed: `${seed}/w`})} at={at} width={width} />];
  for (let i = 0; i < count; i++) {
    const u = (i + 0.5) / count;
    const [bx, by0] = wirePoint(x1, y1, x2, y2, sag, u);
    const r = lerp(b0, b1, u);
    const by = by0 + r * 1.25;
    const bAt = b(at, 0.15 + i * (1 / 30));
    const on = lightAt !== undefined && t >= lightAt + i * (1 / 30);
    out.push(
      <React.Fragment key={i}>
        {on ? <Fill d={blob(bx, by, r * 2.5, r * 2.5, {seed: `${seed}/h${i}`})} color={litColor} opacity={0.22} offset={false} seed={`${seed}/hf${i}`} /> : null}
        {on ? <Fill d={blob(bx, by, r * 1.7, r * 1.7, {seed: `${seed}/g${i}`})} color={litColor} opacity={0.3} offset={false} seed={`${seed}/gf${i}`} /> : null}
        <Fill d={blob(bx, by, r, r * 1.08, {seed: `${seed}/b${i}`})} color={on ? litColor : color} at={bAt} mode="snap" offset={[r * 0.15, r * 0.12]} seed={`${seed}/bf${i}`} />
        {r > 3 ? <Ink d={`M${bx.toFixed(1)} ${(by0 - 1).toFixed(1)}L${bx.toFixed(1)} ${(by - r * 0.8).toFixed(1)}` + circle(bx, by, r, {seed: `${seed}/bi${i}`, overlap: 8})} at={bAt} width={Math.min(width, r * 0.35)} /> : null}
      </React.Fragment>,
    );
  }
  return <>{out}</>;
};

// ---------------------------------------------------------------- Utility pole

/** A wooden utility / light pole: ochre shaft, crossbar, two insulators. x = centre, y = ground. */
export const UtilityPole: React.FC<{x: number; y: number; h?: number; s?: number; at?: At; seed?: Seed; bar?: boolean; width?: number; color?: string}> = ({x, y, h = 620, s = 1, at, seed = 'pole', bar = true, width = stroke.ink, color = palette.brown}) => {
  const w = 14;
  const W = inkW(s, width);
  const top = -h;
  return (
    <Place x={x} y={y} s={s}>
      <Fill rect={[-w / 2, top, w, h]} color={color} at={b(at, 0.12)} mode="wipe" dir="up" offset={[2, 1]} seed={`${seed}/f`} />
      <Ink d={line(-w / 2, 0, -w / 2, top, {over: [0, 6], seed: `${seed}/l`}) + line(w / 2, 0, w / 2, top + 4, {over: [0, 3], seed: `${seed}/r`})} at={at} width={W} order="all" />
      {bar ? <Fill rect={[-62, top + 40, 124, 10]} color={color} at={b(at, 0.22)} mode="snap" offset={[2, 1]} seed={`${seed}/bf`} /> : null}
      {bar ? <Ink d={line(-66, top + 40, 66, top + 40, {over: [3, 6], seed: `${seed}/b1`}) + line(-62, top + 50, 62, top + 50, {over: [2, 4], seed: `${seed}/b2`})} at={b(at, 0.1)} width={W * 0.9} /> : null}
      {bar ? <Ink d={line(-52, top + 40, -52, top + 26, {over: 0, seed: `${seed}/i1`}) + line(52, top + 40, 52, top + 26, {over: 0, seed: `${seed}/i2`})} at={b(at, 0.2)} width={W * 1.3} /> : null}
    </Place>
  );
};
