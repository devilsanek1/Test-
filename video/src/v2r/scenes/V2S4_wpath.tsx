// V2S4_wpath.tsx (lane L3, V2S4 WORLD helpers): HER TOWPATH, the 1.0x path plane at the 17.96 pose (plane px). TIER C
// (flat, no line; the people on it in V2S4_wcast, the post in V2S4_post).
//   garden walls   y 862-992 at the back: each garden its own (stock brick in three tones, a rendered one, piers with
//                  stone caps), three wooden gates, iron railings (a calm mid slate, never plum), roses on a trellis,
//                  ivy spilling over, a pot on the coping
//   paving         y 992-1070: flagstones laid out from S4_CAM (V2S4_depth): level joints every 0.6 m (rows that
//                  foreshorten, 12.7 px near -> 6.5 px far) and receding joints every 0.75 m that converge on the shot's
//                  vanishing point (540, 760) at EVERY frame of the truck (re-projected per frame: their near ends ride the
//                  plane, their far ends move 0.75x, as the ground does); a manhole, a drain, a few fallen leaves
//   coping         y 1070-1082: one stone band and its lip; three bollards
//   furniture      heritage lamp posts (off: low sun), a planter of grasses, a litter bin, a lifebuoy on its post, the
//                  reader's bench, the angler, the heron (still)
// The hand-drawn marks are gone (brick ticks, render patches, gate planks and straps, moss dabs, blooms dots, the drain
// and manhole hatching, the mooring rings, 46 leaf specks, the coping's ticks), and so are the movers the life budget
// cuts (the wall pigeons, the skittering leaves; conform_L3 §2). LIGHT (RIG_CANAL, V2S4_light): ONE ShadowLayer for
// the whole towpath (contact + cast under every standing thing, the walkers, the post and HER: hers is screen-fixed, so
// it is placed at her screen x minus the plane's offset), the gate piers' casts on the walls, the walls' band at their
// foot; FormShade on the bollards, the bin and the planter.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {seamTone} from '../../lib/depth';
import {Shadow, ShadowLayer, ContactShadow, CastShadow} from '../../lib/light';
import {Batch, Paint, P, rng, ovalPath, domePath, lobes, leafPath} from '../kit/canal/core';
import {Heron} from '../kit/canal/life';
import {ROW, PLANE_X} from './V2S4_wcore';
import {S4_K, S4_HER, s4PlaneDx} from './V2S4_rig';
import {S4_CAM} from './V2S4_depth';
import {benchReaderInto, anglerInto, walkerStanders, Walkers, READER_STANDERS, ANGLER_STANDERS, S4_IRON, S4_WOOD} from './V2S4_wcast';
import {S4FormShades, type Stander} from './V2S4_light';
import {POST_STANDERS} from './V2S4_post';

const [X0, X1] = PLANE_X(1);
const TOP = ROW.wallTop;
const FOOT = ROW.wallFoot;
const COP = ROW.copingTop;
const EDGE = ROW.edge;

// ---------------------------------------------------------------- garden walls

type Seg = {x0: number; x1: number; kind: 'brick' | 'render' | 'gate' | 'railing' | 'trellis'; c: string; ivy?: boolean; pot?: boolean; gate?: string};
const SEGS: Seg[] = [
  {x0: X0, x1: 128, kind: 'brick', c: CM.brick, ivy: true},
  {x0: 128, x1: 300, kind: 'trellis', c: CM.stucco},
  {x0: 300, x1: 352, kind: 'gate', c: CM.brickDeep, gate: CM.coatSlate},
  {x0: 352, x1: 566, kind: 'railing', c: CM.brickLight},
  {x0: 566, x1: 690, kind: 'brick', c: CM.brickDeep},
  {x0: 690, x1: 830, kind: 'brick', c: CM.brick, pot: true},
  {x0: 830, x1: 882, kind: 'gate', c: CM.brick, gate: CM.sage},
  {x0: 882, x1: 1110, kind: 'brick', c: CM.brickLight, ivy: true},
  {x0: 1110, x1: 1250, kind: 'render', c: CM.limestone},
  {x0: 1250, x1: 1300, kind: 'gate', c: CM.brickLight, gate: CM.brickDeep},
  {x0: 1300, x1: X1, kind: 'railing', c: CM.brick},
];
const PIER_W = 14;

function wallsInto(b: Batch) {
  const r = rng('s4walls');
  const gates = SEGS.filter((s) => s.kind === 'gate');
  const walls = SEGS.filter((s) => s.kind !== 'gate');
  // P0: wall bodies, gate piers, gate leaves (flat: one calm leaf each)
  for (const s of walls) b.rect(s.c, s.x0, TOP, s.x1 - s.x0, FOOT - TOP);
  for (const s of gates) {
    for (const px of [s.x0, s.x1 - PIER_W]) b.rect(s.c, px, TOP - 12, PIER_W, FOOT - TOP + 12);
    const gx0 = s.x0 + PIER_W;
    const gx1 = s.x1 - PIER_W;
    b.rect(s.gate as string, gx0, TOP - 4, gx1 - gx0, FOOT - TOP + 4);
    b.fill(s.gate as string, `M${P(gx0, TOP - 4)}Q${P((gx0 + gx1) / 2, TOP - 14)} ${P(gx1, TOP - 4)}Z`);
  }
  b.layer();
  // P1: copings and pier caps
  for (const s of walls) b.rect(CM.limestone, s.x0 - 2, TOP - 7, s.x1 - s.x0 + 4, 8);
  for (const s of gates) for (const px of [s.x0, s.x1 - PIER_W]) b.rect(CM.limestone, px - 3, TOP - 18, PIER_W + 6, 7);
  b.layer();
  // P2: pier domes, the railings (one calm mid slate: rails, bars and spikes, never a dark line), the trellis roses
  for (const s of gates) for (const px of [s.x0, s.x1 - PIER_W]) b.fill(CM.limestone, domePath(px + PIER_W / 2, TOP - 18, PIER_W / 2 + 1, 6));
  for (const s of walls) {
    if (s.kind === 'railing') {
      const ry = TOP - 62;
      b.rect(S4_IRON, s.x0, ry + 6, s.x1 - s.x0, 3);
      b.rect(S4_IRON, s.x0, TOP - 16, s.x1 - s.x0, 2.4);
      for (let x = s.x0 + 7; x < s.x1 - 2; x += 15) {
        b.rect(S4_IRON, x - 0.9, ry + 2, 1.8, TOP - 8 - ry);
        b.poly(S4_IRON, [[x - 2.2, ry + 4], [x, ry - 3], [x + 2.2, ry + 4]]);
      }
    }
  }
  b.layer();
  // P3: plants (the trellis roses as one climbing mass, ivy), the pot on the coping
  for (const s of walls) {
    const w = s.x1 - s.x0;
    if (s.kind === 'trellis') {
      b.fill(CM.sage, lobes(s.x0 + 6, s.x1 - 6, TOP - 4, 54, `s4tr${s.x0}`, Math.round(w / 34)));
      b.fill(CM.leafGold, lobes(s.x0 + w * 0.55, s.x1 - 10, TOP - 8, 34, `s4tr2${s.x0}`, 2));
    }
    if (s.ivy) {
      for (let k = 0; k < Math.round(w / 30); k++) {
        const ix = r.range(s.x0 + 4, s.x1 - 20);
        const drop = r.range(26, 90);
        b.fill(k % 3 === 2 ? CM.leafGold : CM.sage, lobes(ix - 12, ix + 22, TOP + drop * 0.35, drop * 0.55, `s4ivyw${s.x0}${k}`, 2));
        b.fill(CM.sage, lobes(ix - 6, ix + 14, TOP + drop, drop * 0.5, `s4ivyx${s.x0}${k}`, 2));
      }
    }
    if (s.pot) {
      const px = s.x0 + w * 0.3;
      b.fill(CM.sage, lobes(px - 13, px + 13, TOP - 21, 18, 's4wpot', 3));
    }
  }
  b.layer();
  for (const s of walls) {
    if (!s.pot) continue;
    const px = s.x0 + (s.x1 - s.x0) * 0.3;
    b.poly(CM.brickDeep, [[px - 9, TOP - 22], [px + 9, TOP - 22], [px + 7, TOP - 7], [px - 7, TOP - 7]]);
  }
}

// ---------------------------------------------------------------- paving + coping

/** The towpath's depth from S4_CAM: the coping (y 1070) is 14.0 m away, the wall foot (y 992) 18.7 m. */
const Z_NEAR = S4_CAM.z(COP);
const Z_FAR = S4_CAM.z(FOOT);
/** Level joints every 0.6 m (y of each row, near -> far, inside the towpath). */
const ROWS_Y: number[] = (() => {
  const out: number[] = [];
  for (let z = Z_NEAR + 0.6; z < Z_FAR - 0.15; z += 0.6) out.push(S4_CAM.y(z));
  return out;
})();
/** Receding joints every 0.75 m along the towpath (their near ends, plane x at the pose: 75 px at 100 px/m). */
const JOINTS_X: number[] = (() => {
  const out: number[] = [];
  for (let x = X0 - 400; x < X1 + 120; x += 75) out.push(x);
  return out;
})();
/** The joints' tones: the receding ones a visible joint (dL* 9, CRAFT §f.4: >= 6 reads), the level ones a soft one (dL* 5)
 *  so the rows foreshorten without stacking the ground into level bands. */
const JOINT_DEEP = seamTone(CM.paving, 9);
const JOINT_SOFT = seamTone(CM.paving, 5);

function groundInto(b: Batch) {
  b.rect(CM.paving, X0, FOOT, X1 - X0, COP - FOOT + 1);
  b.layer();
  // the level joints: thin soft bands, narrowing with distance
  for (const y of ROWS_Y) {
    const w = 1.2 + 1.1 * ((y - FOOT) / (COP - FOOT));
    b.rect(JOINT_SOFT, X0, y - w / 2, X1 - X0, w);
  }
  // a manhole cover and a drain grate: flat foreshortened shapes on the flags (no hatching)
  b.poly(CM.stoneShade, [[920, 1026], [978, 1026], [982, 1044], [916, 1044]]);
  b.poly(CM.limestone, [[925, 1029], [973, 1029], [976, 1041], [922, 1041]]);
  b.poly(CM.stoneShade, [[456, 1050], [496, 1050], [494, 1060], [458, 1060]]);
  b.layer();
  // a few fallen leaves lying flat (sized by distance: 13 px far, 19 px near)
  const r = rng('s4pleaves');
  for (let i = 0; i < 7; i++) {
    const y = r.range(FOOT + 10, COP - 6);
    const s = 13 + 6 * ((y - FOOT) / (COP - FOOT));
    b.fill(i % 2 ? CM.leafGold : CM.leafRust, leafPath(r.range(X0 + 60, X1 - 60), y, s, s * 0.34, r.range(-30, 30)));
  }
  b.layer();
  // the coping: one stone band, its lip in shade toward the water
  b.rect(CM.limestone, X0, COP, X1 - X0, EDGE - COP);
  b.rect(CM.stoneShade, X0, EDGE - 4, X1 - X0, 4);
}

/** The receding joints at film t: each joint's near end rides the plane (1.0x), its far end the wall foot's depth
 *  (0.75x), so every joint runs to the fixed vanishing point (540, 760) on screen. Plane px (drawn inside the plane's
 *  slide `dx`). */
function jointsBatch(dx: number): Batch {
  const b = new Batch();
  const k = Z_NEAR / Z_FAR;
  const [vx] = S4_CAM.vp;
  for (const xn of JOINTS_X) {
    const sn = xn + dx;
    const sf = vx + (sn - vx) * k;
    if (Math.max(sn, sf) < -20 || Math.min(sn, sf) > 1100) continue;
    const xf = sf - dx;
    const wn = 2.6;
    const wf = wn * k;
    b.poly(JOINT_DEEP, [[xn - wn / 2, COP], [xn + wn / 2, COP], [xf + wf / 2, FOOT], [xf - wf / 2, FOOT]]);
  }
  return b;
}

// ---------------------------------------------------------------- furniture (flat, mid tones, no ink)

const LAMPS = [{x: 40, h: 290}, {x: 905, h: 290}, {x: 1392, h: 290}];
const LAMP_FOOT = 1064;
const BOLLARDS = [150, 792, 1122];
const PLANTER = {x0: 146, x1: 236, y: 1006, h: 40};
const BIN = {x: 482, y: 1012, h: 48};
const BUOY = {x: 1086, y: 1068, cy: 1030};

/** A heritage lamp post (off: the low sun): plinth, column, ladder bar, lantern glass, cap and finial; one calm mid
 *  slate, no ink (a thin dark lamp post reads as a line: CRAFT §c). */
function lampInto(b: Batch, x: number, y: number, h: number) {
  const cw = Math.max(2.5, h * 0.034);
  b.fill(S4_IRON, `M${P(x - cw * 1.6, y)}L${P(x - cw * 1.2, y - h * 0.08)}L${P(x + cw * 1.2, y - h * 0.08)}L${P(x + cw * 1.6, y)}Z`);
  b.fill(S4_IRON, `M${P(x - cw * 0.7, y - h * 0.08)}L${P(x - cw * 0.45, y - h * 0.8)}L${P(x + cw * 0.45, y - h * 0.8)}L${P(x + cw * 0.7, y - h * 0.08)}Z`);
  b.rect(S4_IRON, x - cw, y - h * 0.36, cw * 2, Math.max(2.4, h * 0.018));
  b.rect(S4_IRON, x - cw * 2.6, y - h * 0.79, cw * 5.2, Math.max(2.4, h * 0.012));
  const lb = y - h * 0.82;
  const lt = y - h * 0.94;
  b.fill(CM.glass, `M${P(x - cw * 1.5, lb)}L${P(x - cw * 2.4, lt)}L${P(x + cw * 2.4, lt)}L${P(x + cw * 1.5, lb)}Z`);
  b.fill(S4_IRON, `M${P(x - cw * 2.8, lt)}L${P(x, lt - h * 0.045)}L${P(x + cw * 2.8, lt)}Z`);
  b.fill(S4_IRON, ovalPath(x, lt - h * 0.055, cw * 0.6, cw * 0.7));
}

/** A cast-iron mooring bollard on the coping (a calm slate, its form step from the light layer). */
const bollardD = (x: number, y: number, h: number) => {
  const w = h * 0.9;
  return `M${P(x - w * 0.42, y)}L${P(x - w * 0.3, y - h * 0.55)}L${P(x - w * 0.42, y - h * 0.78)}Q${P(x, y - h * 1.08)} ${P(x + w * 0.42, y - h * 0.78)}L${P(x + w * 0.3, y - h * 0.55)}L${P(x + w * 0.42, y)}Z`;
};
const binD = () => {
  const {x, y, h} = BIN;
  const w = h * 0.62;
  return `M${P(x - w / 2, y - h * 0.86)}Q${P(x, y - h * 1.02)} ${P(x + w / 2, y - h * 0.86)}L${P(x + w * 0.44, y)}L${P(x - w * 0.44, y)}Z`;
};
const planterD = () => `M${P(PLANTER.x0, PLANTER.y - PLANTER.h)}L${P(PLANTER.x1, PLANTER.y - PLANTER.h)}L${P(PLANTER.x1, PLANTER.y)}L${P(PLANTER.x0, PLANTER.y)}Z`;

/** The far furniture (the wall side: drawn before the walkers pass in front of it). */
function farThingsInto(b: Batch) {
  b.fill(S4_WOOD, planterD());
  b.fill(S4_IRON, binD());
  b.layer();
  b.fill(CM.sage, lobes(PLANTER.x0 + 4, PLANTER.x1 - 4, PLANTER.y - PLANTER.h + 2, PLANTER.h * 1.4, 's4pl1/g'));
  b.rect(CM.coatMustard, BIN.x - BIN.h * 0.22, BIN.y - BIN.h * 0.62, BIN.h * 0.44, BIN.h * 0.08);
}

/** The near furniture (lamps, the lifebuoy post, the bollards, the angler): over the walkers. */
function nearThingsInto(b: Batch) {
  for (const l of LAMPS) lampInto(b, l.x, LAMP_FOOT, l.h);
  // the lifebuoy: a short post with a ring (peach and paper quarters, never the sun's orange)
  b.rect(S4_WOOD, BUOY.x - 3, 1000, 6, BUOY.y - 1000);
  b.rect(S4_WOOD, BUOY.x - 10, 1000, 20, 4);
  for (const x of BOLLARDS) b.fill(S4_IRON, bollardD(x, COP + 2, 26));
  b.layer();
  for (let q = 0; q < 4; q++) {
    const a0 = (q * Math.PI) / 2;
    const a1 = a0 + Math.PI / 2;
    const R = 17;
    const ri = 9;
    b.fill(q % 2 ? CM.paper : CM.box, `M${P(BUOY.x + Math.cos(a0) * R, BUOY.cy + Math.sin(a0) * R)}A${R} ${R} 0 0 1 ${P(BUOY.x + Math.cos(a1) * R, BUOY.cy + Math.sin(a1) * R)}L${P(BUOY.x + Math.cos(a1) * ri, BUOY.cy + Math.sin(a1) * ri)}A${ri} ${ri} 0 0 0 ${P(BUOY.x + Math.cos(a0) * ri, BUOY.cy + Math.sin(a0) * ri)}Z`);
  }
  b.layer();
  anglerInto(b);
}

/** Everything standing on the towpath that casts (plane px at the pose; the walkers and her are added per frame). */
const STATIC_STANDERS: Stander[] = [
  ...LAMPS.map((l) => ({x: l.x, y: LAMP_FOOT, w: 26, h: l.h, w2: 8})),
  ...BOLLARDS.map((x) => ({x, y: COP + 2, w: 24, h: 24, w2: 18})),
  {x: (PLANTER.x0 + PLANTER.x1) / 2, y: PLANTER.y, w: PLANTER.x1 - PLANTER.x0, h: PLANTER.h + 20},
  {x: BIN.x, y: BIN.y, w: BIN.h * 0.6, h: BIN.h},
  {x: BUOY.x, y: BUOY.y, w: 12, h: 68, w2: 6},
  {x: 236, y: COP + 4, w: 22, h: 60, w2: 8},
  ...READER_STANDERS,
  ...ANGLER_STANDERS,
  ...POST_STANDERS,
];

/** The gate piers' casts on the wall face east of them, and the walls' shade band at their foot (the low sun throws
 *  the wall's shadow a little toward us: ~6 px on the flags at that depth). */
const WALL_SHADES: string[] = [
  ...SEGS.filter((s) => s.kind === 'gate').map((s) => `M${P(s.x1, TOP - 4)}L${P(s.x1 + 12, TOP + 2)}L${P(s.x1 + 12, FOOT)}L${P(s.x1, FOOT)}Z`),
  `M${P(X0, FOOT)}L${P(X1, FOOT)}L${P(X1, FOOT + 6)}L${P(X0, FOOT + 6)}Z`,
];

/** The towpath's ground shadows at film t: one isolated multiply layer (no double darkening where casts cross). */
const TowpathShadows: React.FC<{t: number; dx: number}> = ({t, dx}) => {
  const her: Stander = {x: S4_HER.x - dx, y: S4_HER.feetY, w: S4_HER.h * 0.26, h: S4_HER.h, w2: S4_HER.h * 0.2, person: true};
  const things = [...STATIC_STANDERS, ...walkerStanders(t), her];
  return (
    <ShadowLayer>
      {WALL_SHADES.map((d, i) => (
        <Shadow key={`w${i}`} d={d} tint="cast" />
      ))}
      {things.map((s, i) => (
        <React.Fragment key={i}>
          <ContactShadow x={s.x} y={s.y} w={s.w} k={s.k ?? (s.person ? 1.2 : 1.1)} />
          {s.h > 0 ? <CastShadow x={s.x} y={s.y} w={s.w2 ?? s.w * 0.8} h={s.h} /> : null}
        </React.Fragment>
      ))}
    </ShadowLayer>
  );
};

// ---------------------------------------------------------------- the plane

export const PathPlane: React.FC = () => {
  const t = useTime();
  const dx = s4PlaneDx(S4_K.path, t);
  const ground = useMemo(() => {
    const b = new Batch();
    wallsInto(b);
    b.layer();
    groundInto(b);
    return b;
  }, []);
  const far = useMemo(() => {
    const b = new Batch();
    farThingsInto(b);
    return b;
  }, []);
  const bench = useMemo(() => {
    const b = new Batch();
    benchReaderInto(b);
    return b;
  }, []);
  const near = useMemo(() => {
    const b = new Batch();
    nearThingsInto(b);
    return b;
  }, []);
  return (
    <>
      <Paint b={ground} seed="s4pathGround" misreg={false} />
      <Paint b={jointsBatch(dx)} seed="s4pathJoints" misreg={false} />
      <TowpathShadows t={t} dx={dx} />
      <Paint b={far} seed="s4pathFar" misreg={false} />
      <S4FormShades ds={[planterD(), binD()]} />
      <Walkers />
      <Paint b={bench} seed="s4pathBench" misreg={false} />
      <Paint b={near} seed="s4pathNear" misreg={false} />
      <S4FormShades ds={BOLLARDS.map((x) => bollardD(x, COP + 2, 26))} />
      <Heron x={236} y={COP + 4} h={96} face={1} turnAt={999} seed="s4heron" />
    </>
  );
};
