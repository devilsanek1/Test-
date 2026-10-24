// Person — back view, like the reference crowds: head circle, hair variants, rounded shoulders, accessories.
// Local origin (0,0) = bottom-centre of the torso (hip line). At s=1 the torso is ~92 px wide.
//
//   <Person x={300} y={1000} at={1.2} seed="p1" />                          // colour, random variant
//   <Person x={300} y={1000} style="line" hair="long" acc={['phone']} />  // white line-art (f_12.0)
//   <Person x={300} y={980} s={0.6} legs build="pop" at={2} />            // full figure, pops in
//
// build: 'draw' (ink draws, fills land after; default) | 'pop' (spring up from the feet) | 'rise' (slides up
// into frame + fades) | 'fade'. lod: 0 full, 1 simplified, 2 flat blobs (far crowd).

import React, {useMemo} from 'react';
import {palette} from '../theme';
import {ease as E, osc, prog, useTime} from '../time';
import {rng, Seed} from '../rng';
import {Ink} from '../Ink';
import {Fill} from '../Fill';
import {Pop} from '../motion';
import {arc, blob, circle, crown, line, rectPath, roundRect, smooth, torso, Pt} from '../sketch';
import {At, b, inkW, Place} from './common';

export type Hair = 'short' | 'long' | 'bun' | 'cap' | 'beanie' | 'bald' | 'curly';
export type Acc = 'backpack' | 'headphones' | 'strap' | 'phone' | 'scarf' | 'sign' | 'collar';

export const PERSON_BODIES = [palette.peach, palette.cream, palette.tan, palette.sage, palette.teal, palette.mintPale, palette.salmon, palette.grey, palette.brown] as const;
export const PERSON_HAIR = [palette.ink, palette.brown, palette.olive, palette.tan, palette.tealDark, palette.ink, palette.brown] as const;
export const PERSON_LEGS = [palette.teal, palette.tealDark, palette.brown, palette.olive, palette.ink, palette.sage] as const;
export const PERSON_SHOES = [palette.sage, palette.mintPale, palette.cream, palette.tealDark, palette.tan] as const;
export const PERSON_PACKS = [palette.teal, palette.tealDark, palette.sage, palette.salmon, palette.brown] as const;
export const SIGN_COLORS = [palette.sun, palette.teal, palette.salmon, palette.brown, palette.card, palette.sage] as const;

export type PersonProps = {
  x?: number;
  y?: number;
  s?: number;
  at?: At;
  build?: 'draw' | 'pop' | 'rise' | 'fade';
  seed?: Seed;
  style?: 'color' | 'line';
  hair?: Hair;
  acc?: Acc[];
  body?: string;
  hairColor?: string;
  legsColor?: string;
  packColor?: string;
  signColor?: string;
  /** Draw legs + shoes below the hip line (full figure). */
  legs?: boolean;
  /** Torso height override (px, local). Long torsos for people cut by the frame bottom. */
  torsoH?: number;
  lod?: 0 | 1 | 2;
  flip?: boolean;
  /** Idle bob amplitude in px (default 0). */
  idle?: number;
};

type Spec = ReturnType<typeof makeSpec>;

function makeSpec(p: PersonProps) {
  const r = rng(`person/${p.seed ?? 0}`);
  const line_ = p.style === 'line';
  const w = r.range(86, 100);
  const h = p.torsoH ?? (p.legs ? w * r.range(0.95, 1.08) : w * r.range(1.02, 1.16));
  const hr = w * r.range(0.22, 0.26);
  const round = r.range(0.34, 0.44);
  const hair: Hair = p.hair ?? r.weighted<Hair>([['short', 5], ['long', 2.2], ['bun', 1], ['cap', 1], ['beanie', 0.9], ['bald', 0.5], ['curly', 1.2]]);
  let acc: Acc[] = p.acc ?? [];
  if (!p.acc) {
    if (r.chance(0.26)) acc.push('backpack');
    else if (r.chance(0.16)) acc.push('strap');
    if (hair !== 'long' && hair !== 'beanie' && r.chance(0.16)) acc.push('headphones');
    if (r.chance(0.08)) acc.push('scarf');
    if (!acc.includes('backpack') && r.chance(0.35)) acc.push('collar');
  }
  acc = acc.slice();
  const body = p.body ?? (line_ ? palette.card : r.pick(PERSON_BODIES));
  let hairColor = p.hairColor ?? r.pick(PERSON_HAIR);
  if (!line_ && hairColor === body) hairColor = palette.ink;
  return {
    line: line_,
    w,
    h,
    hr,
    round,
    hair,
    acc,
    body,
    hairColor: line_ ? palette.card : hairColor,
    legsColor: p.legsColor ?? r.pick(PERSON_LEGS),
    shoeColor: r.pick(PERSON_SHOES),
    packColor: p.packColor ?? (line_ ? palette.card : r.pick(PERSON_PACKS.filter((c) => c !== body))),
    accent: r.pick([palette.salmon, palette.teal, palette.sun, palette.sage, palette.tan]),
    signColor: p.signColor ?? r.pick(SIGN_COLORS),
    seedStr: `person/${p.seed ?? 0}`,
    legH: h * 0.62,
    tilt: r.jitter(2.5),
    phase: r.range(0, 6.28),
    hz: r.range(0.45, 0.8),
  };
}

function makePaths(S: Spec) {
  const {w, h, hr, round, seedStr: sd} = S;
  const hy = -h - hr * 0.72; // head centre y
  const P: Record<string, string> = {};
  P.torso = torso(0, 0, w, h, round, 0.07);
  P.head = circle(0, hy, hr, {seed: `${sd}/head`, overlap: 18});
  P.headFill = blob(0, hy, hr, hr, {seed: `${sd}/head`});
  // hair
  if (S.hair === 'short' && S.line) P.hairInk = `M${-hr * 0.42} ${hy - hr * 0.52}Q${0} ${hy - hr * 0.18} ${hr * 0.48} ${hy - hr * 0.5}`;
  if (S.hair === 'curly') {
    P.hairFill = crown(0, hy - 2, hr * 1.1, hr * 1.06, {seed: `${sd}/curl`, bumps: 9, round: 0.7});
    P.hairInk = P.hairFill;
  }
  if (S.hair === 'long') {
    const pts: Pt[] = [
      [-hr * 0.98, hy + hr * 1.75],
      [-hr * 1.08, hy + hr * 0.6],
      [-hr * 0.95, hy - hr * 0.55],
      [0, hy - hr * 1.05],
      [hr * 0.95, hy - hr * 0.55],
      [hr * 1.08, hy + hr * 0.6],
      [hr * 0.98, hy + hr * 1.75],
    ];
    P.hairFill = smooth(pts, {closed: true});
    P.hairInk = smooth([...pts, [-hr * 0.5, hy + hr * 1.9], [-hr * 0.98, hy + hr * 1.75]] as Pt[], {});
    P.hairDetail = `M${-hr * 0.35} ${hy - hr * 0.4}L${-hr * 0.4} ${hy + hr * 1.35}M${hr * 0.3} ${hy - hr * 0.3}L${hr * 0.33} ${hy + hr * 1.25}`;
  }
  if (S.hair === 'bun') {
    P.bunFill = blob(0, hy - hr * 1.12, hr * 0.38, hr * 0.36, {seed: `${sd}/bun`});
    P.bunInk = circle(0, hy - hr * 1.12, hr * 0.38, {seed: `${sd}/bun`, overlap: 10});
    P.hairInk = `M${-hr * 0.3} ${hy - hr * 0.78}Q0 ${hy - hr * 0.68} ${hr * 0.3} ${hy - hr * 0.78}`;
  }
  if (S.hair === 'cap') {
    P.capFill = `M${-hr * 1.02} ${hy - hr * 0.05}A${hr * 1.02} ${hr * 1.02} 0 0 1 ${hr * 1.02} ${hy - hr * 0.05}Q0 ${hy + hr * 0.18} ${-hr * 1.02} ${hy - hr * 0.05}Z`;
    P.capInk = `M${-hr * 1.02} ${hy - hr * 0.08}Q0 ${hy + hr * 0.2} ${hr * 1.02} ${hy - hr * 0.08}` + `M${-hr * 0.3} ${hy + hr * 0.05}Q0 ${hy - hr * 0.22} ${hr * 0.3} ${hy + hr * 0.05}`;
    P.capBtn = circle(0, hy - hr * 1.0, hr * 0.12, {seed: `${sd}/btn`});
  }
  if (S.hair === 'beanie') {
    P.capFill = `M${-hr * 1.02} ${hy + hr * 0.12}A${hr * 1.02} ${hr * 1.02} 0 0 1 ${hr * 1.02} ${hy + hr * 0.12}Z`;
    P.capInk = `M${-hr} ${hy + hr * 0.12}L${hr} ${hy + hr * 0.12}M${-hr * 0.92} ${hy - hr * 0.22}L${hr * 0.92} ${hy - hr * 0.22}M${-hr * 0.8} ${hy - hr * 0.52}L${hr * 0.8} ${hy - hr * 0.52}`;
    P.pomFill = blob(0, hy - hr * 1.18, hr * 0.3, hr * 0.3, {seed: `${sd}/pom`});
    P.pomInk = circle(0, hy - hr * 1.18, hr * 0.3, {seed: `${sd}/pom`});
  }
  // accessories
  for (const a of S.acc) {
    if (a === 'headphones') {
      P.phonesBand = arc(0, hy, hr * 1.13, hr * 1.13, 192, 348, {seed: `${sd}/hp`});
      P.cups = roundRect(-hr * 1.22, hy - hr * 0.32, hr * 0.32, hr * 0.7, hr * 0.14) + roundRect(hr * 0.9, hy - hr * 0.32, hr * 0.32, hr * 0.7, hr * 0.14);
    }
    if (a === 'backpack') {
      const bw = w * 0.56;
      const bh = h * 0.6;
      const by = -h * 0.84;
      P.pack = roundRect(-bw / 2, by, bw, bh, 12, {closed: false, seed: `${sd}/pk`});
      P.packFill = roundRect(-bw / 2, by, bw, bh, 12);
      P.packDetail = `M${-bw * 0.2} ${by}Q0 ${by - 16} ${bw * 0.2} ${by}` + `M${-bw * 0.36} ${by + bh * 0.52}Q0 ${by + bh * 0.42} ${bw * 0.36} ${by + bh * 0.52}`;
    }
    if (a === 'strap') {
      P.strap = line(-w * 0.36, -h * 0.97, w * 0.4, -h * 0.02, {over: [0, 0], seed: `${sd}/st1`}) + line(-w * 0.28, -h * 1.0, w * 0.48, -h * 0.07, {over: [0, 0], seed: `${sd}/st2`});
    }
    if (a === 'collar') {
      P.collar = `M${-hr * 0.55} ${-h + 2}L0 ${-h + hr * 0.62}L${hr * 0.55} ${-h + 2}`;
    }
    if (a === 'scarf') {
      P.scarfFill = `M${-hr * 0.95} ${-h - 4}Q0 ${-h + 16} ${hr * 0.95} ${-h - 4}L${hr * 0.9} ${-h + 8}Q0 ${-h + 28} ${-hr * 0.9} ${-h + 8}Z` + `M${hr * 0.05} ${-h + 10}L${hr * 0.6} ${-h + 10}L${hr * 0.5} ${-h + 52}L${hr * 0.12} ${-h + 50}Z`;
      P.scarfInk = `M${-hr * 0.95} ${-h - 4}Q0 ${-h + 16} ${hr * 0.95} ${-h - 4}M${-hr * 0.9} ${-h + 8}Q0 ${-h + 28} ${hr * 0.9} ${-h + 8}M${hr * 0.12} ${-h + 18}L${hr * 0.12} ${-h + 50}L${hr * 0.5} ${-h + 52}L${hr * 0.58} ${-h + 16}`;
    }
    if (a === 'phone') {
      const sx = w * 0.4;
      const hx = w * 0.56;
      const hyy = hy - hr * 1.5;
      P.armFill = `M${sx - 9} ${-h * 0.82}L${hx - 9} ${hyy}L${hx + 9} ${hyy - 2}L${sx + 12} ${-h * 0.86}Z`;
      P.arm = `M${sx - 10} ${-h * 0.8}L${hx - 9} ${hyy + 4}M${hx + 9} ${hyy + 2}L${sx + 13} ${-h * 0.88}`;
      P.phone = roundRect(hx - 13, hyy - 42, 27, 46, 5, {closed: false, seed: `${sd}/ph`});
      P.phoneFill = roundRect(hx - 13, hyy - 42, 27, 46, 5);
      P.phoneLine = `M${hx - 6} ${hyy - 32}L${hx + 6} ${hyy - 32}`;
    }
    if (a === 'sign') {
      const px = w * 0.28;
      const top = hy - hr - 64;
      P.pole = `M${px} ${-h * 0.5}L${px + 2} ${top}`;
      P.signFill = rectPath(px - 56, top - 76, 112, 76);
      P.signShade = rectPath(px - 50, top - 70, 112, 76);
    }
  }
  if (!S.line) {
    const lw = w * 0.31;
    const g = w * 0.05;
    P.legs = rectPath(-g - lw, -2, lw, S.legH) + rectPath(g, -2, lw, S.legH);
    P.shoes = rectPath(-g - lw - 1, S.legH - 12, lw + 3, 14) + rectPath(g - 2, S.legH - 12, lw + 3, 14);
  }
  return P;
}

export const Person: React.FC<PersonProps> = (props) => {
  const {x = 0, y = 0, s = 1, at, build = 'draw', lod = 0, flip, legs, idle = 0} = props;
  const t = useTime();
  const S = useMemo(() => makeSpec(props), [props.seed, props.style, props.hair, props.acc?.join(), props.body, props.hairColor, props.legsColor, props.packColor, props.signColor, props.legs, props.torsoH]);
  const P = useMemo(() => makePaths(S), [S]);
  if (at !== undefined && t < at) return null;

  const W = inkW(s);
  const sd = S.seedStr;
  // timing
  const drawMode = build === 'draw' && at !== undefined;
  const A = drawMode ? at : undefined;
  const tm = (dt: number) => b(A, dt);
  const fillMode = drawMode ? 'pop' : 'none';

  const parts: React.ReactNode[] = [];
  const push = (n: React.ReactNode) => parts.push(n);
  const k = (n: string) => `${sd}/${n}`;

  // legs (behind)
  if (legs && P.legs && lod < 2) {
    push(<Fill key="legs" d={P.legs} color={S.legsColor} at={tm(0.3)} mode={drawMode ? 'grow' : 'none'} dir="down" offset={false} seed={k('legs')} />);
    push(<Fill key="shoes" d={P.shoes} color={S.shoeColor} at={tm(0.4)} mode={drawMode ? 'fade' : 'none'} offset={false} seed={k('shoes')} />);
  } else if (legs && P.legs) {
    push(<Fill key="legs" d={P.legs} color={S.legsColor} offset={false} seed={k('legs')} />);
  }
  // sign (behind the head)
  if (P.pole && lod < 2) {
    push(<Ink key="pole" d={P.pole} at={tm(0.45)} dur={0.2} color={palette.brown} width={W * 2} seed={k('pole')} />);
    push(<Fill key="signS" d={P.signShade} color={palette.tan} at={tm(0.55)} mode={drawMode ? 'pop' : 'none'} offset={false} seed={k('signS')} opacity={0.8} />);
    push(<Fill key="signF" d={P.signFill} color={S.signColor} at={tm(0.55)} mode={drawMode ? 'pop' : 'none'} offset={false} seed={k('signF')} />);
  }
  // torso
  push(<Fill key="torsoF" d={P.torso} color={S.body} at={tm(0.26)} mode={drawMode ? 'grow' : 'none'} dir="up" seed={k('torso')} offset={lod === 2 ? false : S.line ? [-2, -1.5] : undefined} />);
  if (lod < 2) push(<Ink key="torso" d={P.torso} at={tm(0)} dur={0.34} width={W} seed={k('torso')} />);
  // back accessories
  if (P.strap && lod === 0) push(<Ink key="strap" d={P.strap} at={tm(0.4)} dur={0.2} width={W * 0.85} order="all" seed={k('strap')} />);
  if (P.packFill && lod < 2) {
    push(<Fill key="packF" d={P.packFill} color={S.packColor} at={tm(0.48)} mode={fillMode} seed={k('pack')} />);
    push(<Ink key="pack" d={P.pack} at={tm(0.36)} dur={0.25} width={W} seed={k('pack')} />);
    if (lod === 0) push(<Ink key="packD" d={P.packDetail} at={tm(0.5)} dur={0.2} width={W * 0.85} seed={k('packD')} />);
  }
  if (P.collar && lod === 0) push(<Ink key="collar" d={P.collar} at={tm(0.36)} dur={0.15} width={W * 0.85} seed={k('collar')} />);
  if (P.scarfFill && lod === 0) {
    push(<Fill key="scarfF" d={P.scarfFill} color={S.accent} at={tm(0.5)} mode={fillMode} seed={k('scarf')} />);
    push(<Ink key="scarf" d={P.scarfInk} at={tm(0.4)} dur={0.25} width={W * 0.9} seed={k('scarf')} />);
  }
  if (P.armFill && lod < 2) {
    push(<Fill key="armF" d={P.armFill} color={S.body} at={tm(0.45)} mode={fillMode} offset={false} seed={k('arm')} />);
    push(<Ink key="arm" d={P.arm} at={tm(0.38)} dur={0.2} width={W} order="all" seed={k('arm')} />);
    push(<Fill key="phoneF" d={P.phoneFill} color={palette.card} at={tm(0.55)} mode={fillMode} offset={false} seed={k('phoneF')} />);
    push(<Ink key="phone" d={P.phone} at={tm(0.5)} dur={0.2} width={W * 0.9} seed={k('phone')} />);
    push(<Ink key="phoneL" d={P.phoneLine} at={tm(0.65)} dur={0.1} width={W * 0.7} seed={k('phoneL')} />);
  }
  // head
  const headless = S.hair === 'long';
  const headColor = S.line ? palette.card : S.hair === 'bald' ? (S.body === palette.peach ? palette.cream : palette.peach) : S.hairColor;
  if (!headless) {
    push(<Fill key="headF" d={P.headFill} color={S.line ? palette.card : headColor} at={tm(0.36)} mode={fillMode} offset={S.line ? false : undefined} seed={k('head')} />);
    if (lod < 2) push(<Ink key="head" d={P.head} at={tm(0.16)} dur={0.24} width={W} seed={k('head')} />);
  }
  if (P.hairFill) {
    push(<Fill key="hairF" d={P.hairFill} color={S.line ? palette.card : S.hairColor} at={tm(0.4)} mode={fillMode} offset={S.line ? false : undefined} seed={k('hair')} />);
    if (lod < 2) push(<Ink key="hair" d={P.hairInk} at={tm(0.16)} dur={0.3} width={W} seed={k('hairI')} />);
    if (P.hairDetail && lod === 0) push(<Ink key="hairD" d={P.hairDetail} at={tm(0.42)} dur={0.18} width={W * 0.8} order="all" seed={k('hairD')} />);
  } else if (P.hairInk && lod === 0) {
    push(<Ink key="hair" d={P.hairInk} at={tm(0.4)} dur={0.15} width={W * 0.85} seed={k('hairI')} />);
  }
  if (P.bunFill) {
    push(<Fill key="bunF" d={P.bunFill} color={S.line ? palette.card : S.hairColor} at={tm(0.42)} mode={fillMode} offset={S.line ? false : undefined} seed={k('bun')} />);
    if (lod < 2) push(<Ink key="bun" d={P.bunInk} at={tm(0.3)} dur={0.15} width={W} seed={k('bunI')} />);
  }
  if (P.capFill) {
    push(<Fill key="capF" d={P.capFill} color={S.line ? palette.card : S.accent} at={tm(0.45)} mode={fillMode} offset={false} seed={k('cap')} />);
    if (lod < 2) push(<Ink key="cap" d={P.capInk} at={tm(0.35)} dur={0.25} width={W * 0.9} seed={k('capI')} />);
    if (P.capBtn && lod === 0) push(<Ink key="capB" d={P.capBtn} at={tm(0.5)} dur={0.1} width={W * 0.8} seed={k('capB')} />);
    if (P.pomFill) {
      push(<Fill key="pomF" d={P.pomFill} color={S.line ? palette.card : S.accent} at={tm(0.5)} mode={fillMode} offset={false} seed={k('pom')} />);
      if (lod < 2) push(<Ink key="pom" d={P.pomInk} at={tm(0.42)} dur={0.12} width={W * 0.9} seed={k('pomI')} />);
    }
  }
  if (P.phonesBand && lod < 2) {
    push(<Ink key="hpb" d={P.phonesBand} at={tm(0.4)} dur={0.2} width={W * 1.35} seed={k('hp')} />);
    push(<Fill key="cups" d={P.cups} color={palette.ink} at={tm(0.5)} mode={fillMode} offset={false} seed={k('cups')} />);
  }

  let inner: React.ReactNode = <>{parts}</>;
  const by = legs ? S.legH : 0;
  if (at !== undefined && build === 'pop') inner = <Pop at={at} x={0} y={by}>{inner}</Pop>;
  let dy = 0;
  let op = 1;
  if (at !== undefined && build === 'rise') {
    const p = prog(t, at, 0.55, E.outCubic);
    dy = (1 - p) * 90;
    op = prog(t, at, 0.3);
  }
  if (at !== undefined && build === 'fade') op = prog(t, at, 0.4);
  if (idle) dy += osc(t, S.hz, S.phase) * idle;
  return (
    <Place x={x} y={y + dy} s={s} flip={flip}>
      <g opacity={op < 1 ? op : undefined}>{inner}</g>
    </Place>
  );
};
