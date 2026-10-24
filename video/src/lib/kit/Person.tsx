// Person — ALWAYS SEEN FROM BEHIND (style bible 6): round head = hair colour, ears sticking out, neck block,
// "tombstone" torso, one accessory. No faces, no hands (except a raised arm holding a phone).
// Local origin (0,0) = bottom-centre of the torso (hip line). At s=1 the torso is ~92 px wide, the head ~46 px.
//
//   <Person x={300} y={1000} at={1.2} seed="p1" />                          // colour, random variant
//   <Person x={300} y={1000} style="line" hair="long" acc={['phone']} />  // white line-art (ink-only state)
//   <Person x={300} y={980} s={0.6} legs build="rise" at={2} />           // full figure, rises from behind its feet line
//   <Person ... ink={4.8} />                                               // on-screen ink weight (depthInk.front)
//
// build: 'draw' (ink strokes draw, fills pop 0.13-0.27 s later; default) | 'pop' (7% spring from the feet) |
// 'rise' (rises its own height from behind its base line, out-expo 0.33 s) | 'fade' (= a 1-frame pop; nothing fades).
// lod: 0 full, 1 simplified, 2 flat fill-only blob (far crowd: no ink at all).

import React, {useId, useMemo} from 'react';
import {palette} from '../theme';
import {osc, prog, useTime} from '../time';
import {rng, Seed} from '../rng';
import {Ink} from '../Ink';
import {Fill} from '../Fill';
import {Pop} from '../motion';
import {MOTION} from '../spec';
import {arc, blob, circle, crown, line, rectPath, roundRect, smooth, torso, Pt} from '../sketch';
import {At, b, inkW, Place} from './common';
import {mat, XG} from '../xf';

export type Hair = 'short' | 'long' | 'bun' | 'cap' | 'beanie' | 'bald' | 'curly';
export type Acc = 'backpack' | 'headphones' | 'strap' | 'phone' | 'scarf' | 'sign' | 'collar';

/** Coats / tops (style bible 6): sand, clay, cream, sage, teal, ochre, peach, occasionally white. Never orange. */
export const PERSON_BODIES = [palette.sand, palette.tan, palette.cream, palette.sage, palette.teal, palette.brown, palette.peach, palette.sand, palette.teal] as const;
/** Hair (back view: the head circle IS the hair): clay ~25%, ochre ~20%, sand ~20%, ink-dark ~20%, teal ~15%. */
export const PERSON_HAIR = [palette.tan, palette.tan, palette.brown, palette.brown, palette.sand, palette.ink, palette.ink, palette.tealDark] as const;
export const PERSON_LEGS = [palette.teal, palette.tealDark, palette.brown, palette.ink, palette.teal] as const;
export const PERSON_SHOES = [palette.teal, palette.peach, palette.cream, palette.tealDark] as const;
export const PERSON_PACKS = [palette.cream, palette.sand, palette.teal, palette.tealDark, palette.brown] as const;
/** Placards: peach, teal, sand, white. (One orange placard per scene at most: pass signColor={palette.sun} yourself.) */
export const SIGN_COLORS = [palette.peach, palette.teal, palette.sand, palette.card, palette.sage, palette.peach] as const;
/** Caps / beanies: saturated mid-dark tones so the head never reads as a face (a light cap over dark hair looks like a
 *  forehead over a beard). */
const HAT_COLORS = [palette.teal, palette.sage, palette.tealDark, palette.brown] as const;

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
  /** ON-SCREEN ink weight in px (depthInk: front 4.8, mid 3.4, far 2.2). 0 = no ink. Default ~3.4 * s^0.45. */
  ink?: number;
};

type Spec = ReturnType<typeof makeSpec>;

function makeSpec(p: PersonProps) {
  const r = rng(`person/${p.seed ?? 0}`);
  const line_ = p.style === 'line';
  const w = r.range(86, 100);
  const h = p.torsoH ?? (p.legs ? w * r.range(0.95, 1.08) : w * r.range(1.02, 1.16));
  const hr = w * r.range(0.23, 0.26);
  const round = r.range(0.36, 0.45);
  // 'bald' is never picked at random (a skin crown over a low hair band can read as a face); ask for it explicitly
  const hair: Hair = p.hair ?? r.weighted<Hair>([['short', 5], ['long', 2.2], ['bun', 1], ['cap', 1], ['beanie', 0.9], ['curly', 1.2]]);
  let acc: Acc[] = p.acc ?? [];
  if (!p.acc) {
    if (r.chance(0.26)) acc.push('backpack');
    else if (r.chance(0.16)) acc.push('strap');
    if ((hair === 'short' || hair === 'bun' || hair === 'curly') && r.chance(0.16)) acc.push('headphones');
    if (r.chance(0.08)) acc.push('scarf');
    if (!acc.includes('backpack') && r.chance(0.35)) acc.push('collar');
  }
  acc = acc.slice();
  const body = p.body ?? (line_ ? palette.card : r.pick(PERSON_BODIES));
  let hairColor = p.hairColor ?? r.pick(PERSON_HAIR);
  if (!line_ && hairColor === body) hairColor = hairColor === palette.ink ? palette.tan : palette.ink;
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
    hat: r.pick(HAT_COLORS.filter((c) => c !== body)),
    signColor: p.signColor ?? r.pick(SIGN_COLORS),
    seedStr: `person/${p.seed ?? 0}`,
    legH: h * 0.62,
    phase: r.range(0, 6.28),
    hz: r.range(0.45, 0.8),
  };
}

function makePaths(S: Spec) {
  const {w, h, hr, round, seedStr: sd} = S;
  const hy = -h - hr * 0.86; // head centre y (a little neck shows)
  const P: Record<string, string> = {};
  P.torso = torso(0, 0, w, h, round, 0.07);
  P.neck = rectPath(-hr * 0.42, hy + hr * 0.5, hr * 0.84, hr * 0.9 + 6);
  P.head = circle(0, hy, hr, {seed: `${sd}/head`, overlap: 18});
  P.headFill = blob(0, hy, hr, hr, {seed: `${sd}/head`});
  // ears stick out on both sides (the strongest "seen from behind" cue), unless something covers them
  const earsHidden = S.hair === 'long' || S.hair === 'beanie' || S.acc.includes('headphones');
  if (!earsHidden) {
    const ey = hy + hr * 0.12;
    P.earFill = blob(-hr * 0.98, ey, hr * 0.2, hr * 0.3, {seed: `${sd}/e1`}) + blob(hr * 0.98, ey, hr * 0.2, hr * 0.3, {seed: `${sd}/e2`});
    P.earInk = arc(-hr * 0.98, ey, hr * 0.2, hr * 0.3, 95, 265, {seed: `${sd}/ei1`}) + arc(hr * 0.98, ey, hr * 0.2, hr * 0.3, -85, 85, {seed: `${sd}/ei2`});
  }
  // hair
  if (S.hair === 'short' && S.line) P.hairInk = line(hr * 0.12, hy - hr * 0.78, hr * 0.5, hy - hr * 0.3, {over: [0, 0], seed: `${sd}/tick`});
  if (S.hair === 'bald') {
    // skin crown with a horseshoe of hair low on the back of the head
    P.baldBand = `M${-hr * 0.97} ${hy + hr * 0.05}Q0 ${hy + hr * 0.42} ${hr * 0.97} ${hy + hr * 0.05}L${hr * 0.86} ${hy + hr * 0.52}Q0 ${hy + hr * 1.08} ${-hr * 0.86} ${hy + hr * 0.52}Z`;
  }
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
    P.hairInk = line(-hr * 0.1, hy - hr * 0.62, hr * 0.32, hy - hr * 0.1, {over: [0, 0], seed: `${sd}/part`});
  }
  if (S.hair === 'cap') {
    // dome above a straight band; the strap opening is a small arch ON the band (back of a cap)
    // from behind the cap covers most of the head: only a narrow strip of hair shows at the nape
    const by = hy + hr * 0.42;
    const cw = Math.sqrt(Math.max(0, 1.03 * 1.03 - 0.42 * 0.42)) * hr;
    P.capFill = `M${-cw} ${by}A${hr * 1.03} ${hr * 1.03} 0 1 1 ${cw} ${by}Z`;
    P.capInk = line(-cw, by, cw, by - hr * 0.02, {over: [2, 2], seed: `${sd}/band`}) + arc(0, by, hr * 0.3, hr * 0.26, 180, 360, {seed: `${sd}/open`});
    P.capHole = `M${-hr * 0.3} ${by}A${hr * 0.3} ${hr * 0.26} 0 0 1 ${hr * 0.3} ${by}Z`;
    P.capBtn = circle(0, hy - hr * 1.0, hr * 0.12, {seed: `${sd}/btn`});
  }
  if (S.hair === 'beanie') {
    const by = hy + hr * 0.4;
    const cw = Math.sqrt(Math.max(0, 1.03 * 1.03 - 0.4 * 0.4)) * hr;
    P.capFill = `M${-cw} ${by}A${hr * 1.03} ${hr * 1.03} 0 1 1 ${cw} ${by}Z`;
    P.capInk = line(-cw, by, cw, by - hr * 0.01, {over: [1, 1], seed: `${sd}/bn1`}) + line(-hr * 0.98, hy + hr * 0.08, hr * 0.98, hy + hr * 0.07, {over: [1, 1], seed: `${sd}/bn2`});
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
      P.packDetail = `M${-bw * 0.2} ${by}Q0 ${by - 16} ${bw * 0.2} ${by}` + `M${-bw * 0.36} ${by + bh * 0.52}L${bw * 0.36} ${by + bh * 0.5}`;
    }
    if (a === 'strap') {
      P.strap = line(-w * 0.36, -h * 0.97, w * 0.4, -h * 0.02, {over: [0, 0], seed: `${sd}/st1`}) + line(-w * 0.28, -h * 1.0, w * 0.48, -h * 0.07, {over: [0, 0], seed: `${sd}/st2`});
    }
    if (a === 'collar') {
      P.collar = `M${-hr * 0.6} ${-h + hr * 0.12}L0 ${-h + hr * 0.95}L${hr * 0.6} ${-h + hr * 0.12}`;
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
      P.signInk = `M${px - 56} ${top - 76}L${px + 58} ${top - 76}M${px - 56} ${top - 78}L${px - 56} ${top + 2}`;
    }
  }
  if (!S.line) {
    const lw = w * 0.31;
    const g = w * 0.05;
    P.legs = rectPath(-g - lw, -2, lw, S.legH) + rectPath(g, -2, lw, S.legH);
    P.shoes = rectPath(-g - lw - 1, S.legH - 12, lw + 3, 14) + rectPath(g - 2, S.legH - 12, lw + 3, 14);
    P.legInk = `M${-g - lw} 0L${-g - lw} ${S.legH}M${-g} 0L${-g} ${S.legH - 2}M${g} 0L${g} ${S.legH - 2}M${g + lw} 0L${g + lw} ${S.legH}`;
  } else {
    const lw = w * 0.31;
    const g = w * 0.05;
    P.legInk = `M${-g - lw} 0L${-g - lw} ${S.legH}M${-g} 0L${-g} ${S.legH}M${g} 0L${g} ${S.legH}M${g + lw} 0L${g + lw} ${S.legH}`;
  }
  return P;
}

export const Person: React.FC<PersonProps> = (props) => {
  const {x = 0, y = 0, s = 1, at, build = 'draw', lod = 0, flip, legs, idle = 0, ink} = props;
  const t = useTime();
  const clipId = 'pr' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const S = useMemo(() => makeSpec(props), [props.seed, props.style, props.hair, props.acc?.join(), props.body, props.hairColor, props.legsColor, props.packColor, props.signColor, props.legs, props.torsoH]);
  const P = useMemo(() => makePaths(S), [S]);
  if (at !== undefined && t < at) return null;

  const W = ink === undefined ? inkW(s) : ink / Math.max(0.05, s);
  const inked = lod < 2 && W > 0;
  const sd = S.seedStr;
  // timing (draw mode): ink strokes draw with the spec pacing, fills pop 0.13-0.27 s after their outline starts
  const drawMode = build === 'draw' && at !== undefined;
  const A = drawMode ? at : undefined;
  const tm = (dt: number) => b(A, dt);
  const fillMode = drawMode ? 'pop' : 'none';

  const parts: React.ReactNode[] = [];
  const push = (n: React.ReactNode) => parts.push(n);
  const k = (n: string) => `${sd}/${n}`;
  const headColor = S.line ? palette.card : S.hair === 'bald' ? palette.sand : S.hairColor;

  // legs (behind)
  if (legs && P.legs && lod < 2) {
    push(<Fill key="legs" d={P.legs} color={S.legsColor} at={tm(0.2)} mode={drawMode ? 'grow' : 'none'} dir="down" offset={false} seed={k('legs')} />);
    push(<Fill key="shoes" d={P.shoes} color={S.shoeColor} at={tm(0.26)} mode={drawMode ? 'snap' : 'none'} offset={false} seed={k('shoes')} />);
    if (inked && lod === 0) push(<Ink key="legI" d={P.legInk} at={tm(0.06)} width={W * 0.9} seed={k('legI')} />);
  } else if (legs && P.legs) {
    push(<Fill key="legs" d={P.legs} color={S.legsColor} offset={false} seed={k('legs')} />);
  } else if (legs && S.line && inked) {
    push(<Ink key="legI" d={P.legInk} at={tm(0.06)} width={W * 0.9} seed={k('legI')} />);
  }
  // sign (behind the head)
  if (P.pole && lod < 2) {
    push(<Ink key="pole" d={P.pole} at={tm(0.3)} color={palette.brown} width={Math.max(W, 2) * 2} seed={k('pole')} />);
    push(<Fill key="signS" d={P.signShade} color={palette.tan} at={tm(0.42)} mode={drawMode ? 'pop' : 'none'} offset={false} seed={k('signS')} />);
    push(<Fill key="signF" d={P.signFill} color={S.signColor} at={tm(0.42)} mode={drawMode ? 'pop' : 'none'} offset={false} seed={k('signF')} />);
    if (inked) push(<Ink key="signI" d={P.signInk} at={tm(0.36)} width={W * 0.9} seed={k('signI')} />);
  }
  // neck (behind torso and head)
  if (lod < 2) push(<Fill key="neck" d={P.neck} color={S.line ? palette.card : palette.sand} at={tm(0.2)} mode={fillMode} offset={false} seed={k('neck')} />);
  // ears (behind the head)
  if (P.earFill && lod < 2) {
    push(<Fill key="earF" d={P.earFill} color={S.line ? palette.card : palette.sand} at={tm(0.24)} mode={fillMode} offset={false} seed={k('ear')} />);
    if (inked && lod === 0) push(<Ink key="earI" d={P.earInk} at={tm(0.14)} width={W * 0.85} order="all" seed={k('earI')} />);
  }
  // torso
  push(<Fill key="torsoF" d={P.torso} color={S.body} at={tm(0.16)} mode={drawMode ? 'pop' : 'none'} seed={k('torso')} offset={lod === 2 ? false : S.line ? [-2, -1.5] : undefined} />);
  if (inked) push(<Ink key="torso" d={P.torso} at={tm(0)} width={W} seed={k('torso')} />);
  // back accessories
  if (P.strap && lod === 0 && inked) push(<Ink key="strap" d={P.strap} at={tm(0.2)} width={W * 0.85} order="all" seed={k('strap')} />);
  if (P.packFill && lod < 2) {
    push(<Fill key="packF" d={P.packFill} color={S.packColor} at={tm(0.32)} mode={fillMode} seed={k('pack')} />);
    if (inked) push(<Ink key="pack" d={P.pack} at={tm(0.16)} width={W} seed={k('pack')} />);
    if (lod === 0 && inked) push(<Ink key="packD" d={P.packDetail} at={tm(0.3)} width={W * 0.85} seed={k('packD')} />);
  }
  if (P.collar && lod === 0 && inked) push(<Ink key="collar" d={P.collar} at={tm(0.2)} width={W * 0.85} seed={k('collar')} />);
  if (P.scarfFill && lod === 0) {
    push(<Fill key="scarfF" d={P.scarfFill} color={S.line ? palette.card : S.hat} at={tm(0.36)} mode={fillMode} seed={k('scarf')} />);
    if (inked) push(<Ink key="scarf" d={P.scarfInk} at={tm(0.24)} width={W * 0.9} seed={k('scarf')} />);
  }
  if (P.armFill && lod < 2) {
    push(<Fill key="armF" d={P.armFill} color={S.body} at={tm(0.3)} mode={fillMode} offset={false} seed={k('arm')} />);
    if (inked) push(<Ink key="arm" d={P.arm} at={tm(0.2)} width={W} order="all" seed={k('arm')} />);
    push(<Fill key="phoneF" d={P.phoneFill} color={palette.card} at={tm(0.38)} mode={fillMode} offset={false} seed={k('phoneF')} />);
    if (inked) push(<Ink key="phone" d={P.phone} at={tm(0.3)} width={W * 0.9} seed={k('phone')} />);
    if (inked && lod === 0) push(<Ink key="phoneL" d={P.phoneLine} at={tm(0.42)} width={W * 0.7} seed={k('phoneL')} />);
  }
  // head
  const headless = S.hair === 'long';
  if (!headless) {
    push(<Fill key="headF" d={P.headFill} color={headColor} at={tm(0.24)} mode={fillMode} offset={S.line ? false : undefined} seed={k('head')} />);
    if (inked) push(<Ink key="head" d={P.head} at={tm(0.08)} width={W} open={0.12} seed={k('head')} />);
  }
  if (P.baldBand && lod < 2) push(<Fill key="bald" d={P.baldBand} color={S.line ? palette.card : S.hairColor === palette.sand ? palette.tan : S.hairColor} at={tm(0.3)} mode={fillMode} offset={false} seed={k('bald')} />);
  if (P.hairFill) {
    push(<Fill key="hairF" d={P.hairFill} color={S.line ? palette.card : S.hairColor} at={tm(0.28)} mode={fillMode} offset={S.line ? false : undefined} seed={k('hair')} />);
    if (inked) push(<Ink key="hair" d={P.hairInk} at={tm(0.08)} width={W} seed={k('hairI')} />);
    if (P.hairDetail && lod === 0 && inked) push(<Ink key="hairD" d={P.hairDetail} at={tm(0.28)} width={W * 0.8} order="all" seed={k('hairD')} />);
  } else if (P.hairInk && lod === 0 && inked) {
    push(<Ink key="hair" d={P.hairInk} at={tm(0.28)} width={W * 0.85} seed={k('hairI')} />);
  }
  if (P.bunFill) {
    push(<Fill key="bunF" d={P.bunFill} color={S.line ? palette.card : S.hairColor} at={tm(0.3)} mode={fillMode} offset={S.line ? false : undefined} seed={k('bun')} />);
    if (inked) push(<Ink key="bun" d={P.bunInk} at={tm(0.18)} width={W} seed={k('bunI')} />);
  }
  if (P.capFill) {
    push(<Fill key="capF" d={P.capFill} color={S.line ? palette.card : S.hat} at={tm(0.3)} mode={fillMode} offset={false} seed={k('cap')} />);
    if (P.capHole) push(<Fill key="capH" d={P.capHole} color={S.line ? palette.card : S.hairColor} at={tm(0.34)} mode={fillMode} offset={false} seed={k('capH')} />);
    if (inked) push(<Ink key="cap" d={P.capInk} at={tm(0.22)} width={W * 0.9} seed={k('capI')} />);
    if (P.capBtn && lod === 0 && inked) push(<Ink key="capB" d={P.capBtn} at={tm(0.34)} width={W * 0.8} seed={k('capB')} />);
    if (P.pomFill) {
      push(<Fill key="pomF" d={P.pomFill} color={S.line ? palette.card : S.hat} at={tm(0.36)} mode={fillMode} offset={false} seed={k('pom')} />);
      if (inked) push(<Ink key="pom" d={P.pomInk} at={tm(0.28)} width={W * 0.9} seed={k('pomI')} />);
    }
  }
  if (P.phonesBand && lod < 2) {
    if (inked) push(<Ink key="hpb" d={P.phonesBand} at={tm(0.26)} width={W * 1.35} seed={k('hp')} />);
    push(<Fill key="cups" d={P.cups} color={S.line ? palette.card : palette.cream} at={tm(0.34)} mode={fillMode} offset={false} seed={k('cups')} />);
    if (inked) push(<Ink key="cupsI" d={P.cups} at={tm(0.3)} width={W * 0.8} seed={k('cupsI')} />);
  }

  let inner: React.ReactNode = <>{parts}</>;
  const base = legs ? S.legH : 0;
  if (at !== undefined && build === 'pop') inner = <Pop at={at} x={0} y={base}>{inner}</Pop>;
  let dy = 0;
  let clip: React.ReactNode = null;
  if (at !== undefined && build === 'rise') {
    const p = prog(t, at, MOTION.rise.dur, MOTION.rise.ease);
    const H = base + S.h + S.hr * 2.2 + (P.pole ? 160 : 0);
    if (p < 1) {
      // rises from behind its own base line (the crowd in front / the ground hides the entry)
      inner = <XG m={mat.translate(0, (1 - p) * H)}>{inner}</XG>;
      clip = (
        <defs>
          <clipPath id={clipId}>
            <rect x={-400} y={-1200} width={800} height={1200 + base + 4} />
          </clipPath>
        </defs>
      );
      inner = <g clipPath={`url(#${clipId})`}>{inner}</g>;
    }
  }
  if (idle) dy += osc(t, S.hz, S.phase) * idle;
  return (
    <Place x={x} y={y + dy} s={s} flip={flip}>
      {clip}
      {inner}
    </Place>
  );
};
