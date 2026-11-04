// Scene 1, still v3: THE FULL STREET ALONG THE CANAL across the water (the owner on still v1: "the street along the
// canal ours is pretty empty while their have density"). Tier C, small and calm, drawn on the far towpath's plane (the
// `towpath` slot of S1World, WORLD px: the group is shifted by V3_SHIFT). The strangers are ~0.8x v2's 1.70 m figure
// at their spot (s1FigureHAt), so she, on our landing at ~210 px, is clearly the nearer one; nobody stands behind her
// head (x 205-395 on the bend) or in the doorway (the lit door stays clear: the read of "Google").
//   awnings   two café awnings on the wing's ground storey (left bay; the right bays over the boats): a dark underside
//             band (the darks in many small pieces), a striped valance lit by the low western sun
//   café      round iron tables and chairs under the left awning, three people at rest
//   people    walkers both ways, a couple talking, a cyclist, a dog walker; two small figures on the bridge
//   bikes     two parked against the left bay, thin iron lines (things that ARE lines: DIRECTION rule 4)
//   trees     two small autumn trees in planters on the towpath, one by the wing's west corner, one right of the door
import React from 'react';
import {Fill} from '../../lib/Fill';
import {Tier} from '../../lib/tier';
import {ContactShadow, ShadowLayer} from '../../lib/light';
import {CM} from '../../v2r/palette';
import {Person, Seated} from '../../v2r/kit/cast';
import * as MAP from '../../v2r/world/map';
import {dark} from './darks';
import {s1WingBaseY} from './V2S1_set_wing';

type Pt = [number, number];
const r1 = (n: number) => Math.round(n * 10) / 10;
const poly = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${r1(x)} ${r1(y)}`).join('') + 'Z';
const ell = (cx: number, cy: number, rx: number, ry: number) => `M${r1(cx - rx)} ${r1(cy)}a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(rx * 2)} 0a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(-rx * 2)} 0Z`;
const F: React.FC<{d: string; c: string; s: string}> = ({d, c, s}) => <Fill d={d} color={c} seed={`v3st/${s}`} offset={false} />;

/** The far towpath's feet line at x (v2's bend) and a stranger's height there (0.8x v2's 1.70 m figure). */
const feet = (x: number) => MAP.s1TowpathFeetY(x);
const hAt = (x: number, k = 1) => Math.round(MAP.s1FigureHAt(x) * STRANGER_K * k);
/** The strangers' share of v2's 1.70 m figure at their spot: small and calm, so she (210 px) is clearly the nearer one. */
const STRANGER_K = 0.66;

// ---------------------------------------------------------------- awnings

type Awning = {x0: number; x1: number; colour: () => string; stripe: () => string; seed: string};
const AWNINGS: Awning[] = [
  {x0: 340, x1: 516, colour: () => CM.brick, stripe: () => CM.stucco ?? CM.paper, seed: 'awL'},
  {x0: 748, x1: 900, colour: () => CM.sage, stripe: () => CM.paper, seed: 'awR1'},
  {x0: 912, x1: 1082, colour: () => CM.coatMustard, stripe: () => CM.paper, seed: 'awR2'},
];
/** Heights over the wing's base at x: the attach line, the front edge, the valance's bottom. */
const AW = {attach: 172, front: 138, valance: 122} as const;

const AwningShape: React.FC<{a: Awning}> = ({a}) => {
  const b0 = s1WingBaseY(a.x0);
  const b1 = s1WingBaseY(a.x1);
  const yAt = (x: number, dy: number) => b0 + ((b1 - b0) * (x - a.x0)) / (a.x1 - a.x0) - dy;
  // the underside, seen from below (the shade band between the wall and the front edge): one dark piece
  const under = poly([[a.x0, yAt(a.x0, AW.attach)], [a.x1, yAt(a.x1, AW.attach)], [a.x1 + 6, yAt(a.x1, AW.front)], [a.x0 - 6, yAt(a.x0, AW.front)]]);
  // the valance: lit stripes, a scalloped hem
  const n = Math.max(4, Math.round((a.x1 - a.x0) / 22));
  const w = (a.x1 - a.x0 + 12) / n;
  const stripes: string[] = [];
  const alt: string[] = [];
  for (let i = 0; i < n; i++) {
    const xa = a.x0 - 6 + i * w;
    const xb = xa + w;
    const top0 = yAt(xa, AW.front);
    const top1 = yAt(xb, AW.front);
    const bot0 = yAt(xa, AW.valance);
    const bot1 = yAt(xb, AW.valance);
    const d = `M${r1(xa)} ${r1(top0)}L${r1(xb)} ${r1(top1)}L${r1(xb)} ${r1(bot1)}Q${r1((xa + xb) / 2)} ${r1((bot0 + bot1) / 2 + 7)} ${r1(xa)} ${r1(bot0)}Z`;
    (i % 2 ? alt : stripes).push(d);
  }
  return (
    <>
      <F d={under} c={dark('eave')} s={`${a.seed}/under`} />
      <F d={stripes.join('')} c={a.colour()} s={`${a.seed}/val`} />
      <F d={alt.join('')} c={a.stripe()} s={`${a.seed}/valAlt`} />
    </>
  );
};

// ---------------------------------------------------------------- café tables, bikes, trees

const Table: React.FC<{x: number; s: string}> = ({x, s}) => {
  const y = feet(x) - 2;
  const k = hAt(x) / 120;
  const top = y - 40 * k;
  return (
    <>
      <F d={poly([[x - 2 * k, top], [x + 2 * k, top], [x + 3 * k, y], [x - 3 * k, y]])} c={dark('iron')} s={`${s}/leg`} />
      <F d={ell(x, top, 15 * k, 3.4 * k)} c={CM.paper} s={`${s}/top`} />
      <F d={poly([[x - 15 * k, top], [x + 15 * k, top], [x + 15 * k, top + 2.4 * k], [x - 15 * k, top + 2.4 * k]])} c={dark('iron')} s={`${s}/edge`} />
      {/* two cups */}
      <F d={poly([[x - 6 * k, top - 5 * k], [x - 2 * k, top - 5 * k], [x - 2.4 * k, top], [x - 5.6 * k, top]]) + poly([[x + 4 * k, top - 4 * k], [x + 7 * k, top - 4 * k], [x + 6.6 * k, top], [x + 4.4 * k, top]])} c={CM.paper} s={`${s}/cups`} />
    </>
  );
};

const Chair: React.FC<{x: number; dir: 1 | -1; s: string}> = ({x, dir, s}) => {
  const y = feet(x) - 2;
  const k = hAt(x) / 120;
  const seat = y - 24 * k;
  const back = x - dir * 9 * k;
  const d = poly([[x - 9 * k, seat], [x + 9 * k, seat], [x + 9 * k, seat + 2.4 * k], [x - 9 * k, seat + 2.4 * k]]) + poly([[back - 1.4 * k, seat - 22 * k], [back + 1.4 * k, seat - 22 * k], [back + 1.4 * k, y], [back - 1.4 * k, y]]) + poly([[x + dir * 8 * k - 1.2 * k, seat], [x + dir * 8 * k + 1.2 * k, seat], [x + dir * 8 * k + 1.2 * k, y], [x + dir * 8 * k - 1.2 * k, y]]);
  return <F d={d} c={dark('iron')} s={`${s}/chair`} />;
};

/** A parked bike, side on: two wheels and its frame as thin iron lines (things that are lines), a saddle. */
const Bike: React.FC<{x: number; s: string; flip?: boolean}> = ({x, flip}) => {
  const y = feet(x) - 1;
  const k = hAt(x) / 120;
  const r = 15 * k;
  const f = flip ? -1 : 1;
  const a: Pt = [x - f * 20 * k, y - r];
  const b: Pt = [x + f * 20 * k, y - r];
  const seat: Pt = [x - f * 7 * k, y - r - 20 * k];
  const bar: Pt = [x + f * 15 * k, y - r - 23 * k];
  const crank: Pt = [x - f * 1 * k, y - r];
  const iron = dark('iron');
  const w = Math.max(1.6, 2.1 * k);
  return (
    <g fill="none" stroke={iron} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round">
      <circle cx={a[0]} cy={a[1]} r={r} />
      <circle cx={b[0]} cy={b[1]} r={r} />
      <path d={`M${r1(a[0])} ${r1(a[1])}L${r1(crank[0])} ${r1(crank[1])}L${r1(seat[0])} ${r1(seat[1])}L${r1(a[0])} ${r1(a[1])}M${r1(crank[0])} ${r1(crank[1])}L${r1(bar[0] - f * 2 * k)} ${r1(bar[1] + 6 * k)}L${r1(seat[0])} ${r1(seat[1] + 2 * k)}M${r1(b[0])} ${r1(b[1])}L${r1(bar[0])} ${r1(bar[1])}l${r1(-f * 5 * k)} ${r1(-1 * k)}`} />
      <path d={`M${r1(seat[0] - 5 * k)} ${r1(seat[1] - 1.5 * k)}h${r1(9 * k)}`} strokeWidth={w * 1.8} />
    </g>
  );
};

/** A small autumn tree in a square planter on the towpath: a slim trunk, a crown of three lobes, lit left. */
const Tree: React.FC<{x: number; s: string; autumn?: boolean}> = ({x, s, autumn}) => {
  const y = feet(x) - 1;
  const k = hAt(x) / 120;
  const crownY = y - 150 * k;
  const lit = autumn ? CM.leafGold ?? CM.box : CM.sage;
  const shade = autumn ? CM.leafRust ?? CM.brick : CM.sage;
  const crown = ell(x - 10 * k, crownY + 6 * k, 30 * k, 26 * k) + ell(x + 14 * k, crownY, 30 * k, 30 * k) + ell(x + 2 * k, crownY - 22 * k, 26 * k, 22 * k);
  return (
    <>
      <F d={poly([[x - 2.6 * k, crownY + 20 * k], [x + 2.6 * k, crownY + 20 * k], [x + 3.4 * k, y - 22 * k], [x - 3.4 * k, y - 22 * k]])} c={dark('wood')} s={`${s}/trunk`} />
      <F d={crown} c={shade} s={`${s}/crown`} />
      <F d={ell(x - 14 * k, crownY - 2 * k, 20 * k, 20 * k) + ell(x - 2 * k, crownY - 24 * k, 17 * k, 13 * k)} c={lit} s={`${s}/lit`} />
      <F d={poly([[x - 16 * k, y - 24 * k], [x + 16 * k, y - 24 * k], [x + 14 * k, y], [x - 14 * k, y]])} c={CM.brickDeep} s={`${s}/box`} />
      <F d={poly([[x + 2 * k, y - 24 * k], [x + 16 * k, y - 24 * k], [x + 14 * k, y], [x + 2 * k, y]])} c={dark('wood')} s={`${s}/boxShade`} />
    </>
  );
};

// ---------------------------------------------------------------- the people (tier C: small, calm, at rest or strolling)

type Walker = {x: number; dir: 1 | -1; k?: number; step: number; seed: string; pose?: 'walk' | 'stand' | 'cycle'};
/** Strangers on the far towpath. Clear: x 150-420 (round her head), the doorway 540-722. */
const WALKERS: Walker[] = [
  {x: 84, dir: 1, k: 0.92, step: 1.5, seed: 'v3w/bend1'},
  {x: 452, dir: -1, step: 2.5, seed: 'v3w/cafeWalk'},
  {x: 790, dir: 1, step: 0.5, seed: 'v3w/right1'},
  {x: 862, dir: -1, step: 1.5, seed: 'v3w/right2', pose: 'cycle'},
  {x: 1012, dir: -1, step: 2.5, seed: 'v3w/right3'},
];
/** Two small figures on the bridge's deck (rail top 934: they show from the waist up behind the parapet). */
const BRIDGE_FOLK: Walker[] = [
  {x: 34, dir: 1, k: 0.66, step: 1.5, seed: 'v3w/bridge1'},
  {x: 118, dir: -1, k: 0.64, step: 0.5, seed: 'v3w/bridge2'},
];

const Stranger: React.FC<{w: Walker; feetY?: number; h?: number}> = ({w, feetY, h}) => {
  const y = feetY ?? feet(w.x);
  const hh = h ?? hAt(w.x, w.k ?? 1);
  if (w.pose === 'stand') return <Person x={w.x} y={y} h={hh} seed={w.seed} pose="stand" view="rear34" flip={w.dir === 1} />;
  if (w.pose === 'cycle') return <Person x={w.x} y={y} h={hh} seed={w.seed} pose="cycle" view="profile" flip={w.dir === 1} />;
  return <Person x={w.x} y={y} h={hh} seed={w.seed} pose="walk" view="profile" flip={w.dir === 1} step={w.step} />;
};

/** The café's three people at rest (seated height ~0.52 of a standing one). */
const SEATED = [
  {x: 372, side: 1 as const, seed: 'v3s/cafe1'},
  {x: 426, side: -1 as const, seed: 'v3s/cafe2'},
  {x: 488, side: -1 as const, seed: 'v3s/cafe3'},
];

export const V3FarStreet: React.FC = () => {
  const seatY = (x: number) => feet(x) - 2 - (24 * hAt(x)) / 120;
  return (
    <>
      <Tier tier="environment">
        {AWNINGS.map((a) => (
          <AwningShape key={a.seed} a={a} />
        ))}
        <Tree x={738} s="treeE" autumn />
        <Bike x={540 - 10} s="bike1" />
      </Tier>
      {/* the café under the left awning */}
      <ShadowLayer>
        {[...SEATED.map((p) => p.x), 400, 458, 452].map((x, i) => (
          <ContactShadow key={i} x={x} y={feet(x) - 1} w={26} />
        ))}
      </ShadowLayer>
      <Tier tier="environment">
        <Chair x={372} dir={1} s="ch1" />
        <Chair x={488} dir={-1} s="ch3" />
      </Tier>
      <Tier tier="environment">
        {SEATED.map((p) => (
          <Seated key={p.seed} x={p.x} y={seatY(p.x)} h={Math.round(hAt(p.x) * 0.52)} seed={p.seed} side={p.side} view="rear34" cup={p.seed.endsWith('2') ? 0.3 : undefined} />
        ))}
      </Tier>
      <Tier tier="environment">
        <Table x={400} s="tb1" />
        <Table x={458} s="tb2" />
      </Tier>
      {/* the walkers, the talker, the cyclist */}
      <ShadowLayer>
        {WALKERS.map((w) => (
          <ContactShadow key={w.seed} x={w.x} y={feet(w.x) - 1} w={hAt(w.x, w.k ?? 1) * 0.26} />
        ))}
      </ShadowLayer>
      <Tier tier="environment">
        {WALKERS.map((w) => (
          <Stranger key={w.seed} w={w} />
        ))}
      </Tier>
      {/* the bridge's two walkers, behind its parapet: only what rises over the rail top shows (a clip at the rail) */}
      <defs>
        <clipPath id="v3BridgeRail" clipPathUnits="userSpaceOnUse">
          <rect x={-120} y={0} width={470} height={BRIDGE_RAIL_TOP} />
        </clipPath>
      </defs>
      <g clipPath="url(#v3BridgeRail)">
        <Tier tier="environment">
          {BRIDGE_FOLK.map((w) => (
            <Stranger key={w.seed} w={w} feetY={958} h={hAt(200, w.k ?? 1)} />
          ))}
        </Tier>
      </g>
    </>
  );
};
/** The bridge's rail top (V2S1_set_far BRIDGE.railTop + 2: the figures sink behind the rail's top bar). */
const BRIDGE_RAIL_TOP = 936;
