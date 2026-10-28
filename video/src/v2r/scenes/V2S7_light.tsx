// V2S7_light.tsx (lane L5): the LIGHT LAYERS of V2S7 under RIG_CANAL at sunset (rigs.ts; THROUGHLINE §5; CRAFT §d;
// lib/LIGHT.md): the key is the low western sun (SUN2 at screen left), shadows fall right and a little toward us
// (toward 15, el 36, casts capped at 0.8 h); every shape a flat multiply step of the film's ONE tint family (rigs.ts
// TINT_CANAL), nothing outside V2S7.tsx's <Lit rig={RIG_CANAL}>, all of it off under {"lightOff": true} (the A side
// of check_light.py). Each piece lives in the float plane of the thing it belongs to and is drawn after the ground
// it falls on and before the thing itself (one multiply group per ground: never double-darkened).
//   S7WingShade        the wing's south faces one Shade step (it faces away from the low sun): the facade (its tone-on-
//                      tone lit panes and the lobby left out), the canopy's soffit a step deeper, the steps' risers, the
//                      west wall's face
//   S7BoardShadows     Google's board: the rig's contact under each foot + ONE cast along its legs' line (the kit's own
//                      flat shadow is off: never doubled); Pip's bollard: contact + cast (Pip and the bollard as one)
//   S7BollardForm      the bollard's form crescent away from the sun; Pip's contact on the bollard's cap
//   S7TreeShadows      the plane: contact on its grate + its cast to the right; its trunk's form band, its crown's crescent
//   S7FolkShadows      contact + cast under the door people, the cyclist, the pair at rest (+ their table), the bikes
//   S7CafeShadows      the cafe (table, chairs, the coat) and the planter: contact strips and casts (sun-projected
//                      in metres on the one camera); the planter's south face one Shade step; the coat's form band
//   S7BasinLight       the basin: its contact strip along the foot, its south face one Shade step, the west wall's
//                      shadow on the water (tint "water": the water's own deeper step, never the rose family)
import React from 'react';
import {CastShadow, ContactShadow, FormShade, Shade, Shadow, ShadowLayer, hull, polyD} from '../../lib/light';
import {useTime} from '../../lib/time';
import {B_LEGS_Y1} from '../world/map';
import {heightAt, kz, pt, S7_BIKES, S7_BOLLARD, S7_CAFE, S7_CAFE_PAIR, S7_TREE, type P2} from './V2S7_plan';
import {s7Canopy, s7Steps, s7WingShadeD} from './V2S7_wing';
import {s7WestWallFace} from './V2S7_far';
import {CAFE_PAIR, cyclistAt, staffIn, staffOut} from './V2S7_folk';
import {S7_PLANTER, s7BasinFaces, s7CoatD} from './V2S7_near';
import {S7_CROWN_CLUSTERS} from './V2S7_ground';
import {S7_WATER} from './V2S7_water';

// ---------------------------------------------------------------- the sun in metres (the one camera)

/** RIG_CANAL's sun on the forecourt: an object `h` m tall casts min(0.8 h, h / tan 36) along screen 15 deg: right
 *  and a little toward the lens (dz < 0). */
export function sunShift(h: number): P2 {
  const L = Math.min(0.8 * h, h / Math.tan((36 * Math.PI) / 180));
  const a = (15 * Math.PI) / 180;
  return [L * Math.cos(a), -L * Math.sin(a)];
}
/** A ring of radius r at (x, z) on the ground (level 0), projected. */
const groundRing = (x: number, z: number, r: number, n = 32): P2[] => Array.from({length: n}, (_, i) => pt(x + r * Math.cos((i / n) * Math.PI * 2), z + r * Math.sin((i / n) * Math.PI * 2)));
/** The shadow on the ground of a point (x, z) at height h. */
const shadowOf = (x: number, z: number, h: number): P2 => {
  const [dx, dz] = sunShift(h);
  return pt(x + dx, z + dz);
};

// ---------------------------------------------------------------- the wing (+1)

export const S7WingShade: React.FC = () => {
  const {soffit} = s7Canopy();
  const s = s7Steps();
  return (
    <>
      <Shade d={s7WingShadeD()} />
      <Shade d={polyD(soffit)} tint="cast" />
      <Shade d={polyD(s.riser1) + polyD(s.riser2)} />
    </>
  );
};

export const S7WestWallShade: React.FC = () => <Shade d={s7WestWallFace()} />;

// ---------------------------------------------------------------- the board and Pip's bollard (0)

/** The A-board's footprint on the forecourt: its front feet on y 1250, its back legs ~0.2 m behind. */
const BOARD_FOOT: P2[] = [[110, B_LEGS_Y1], [684, B_LEGS_Y1], [684, 1241], [110, 1241]];
const BOARD_H = B_LEGS_Y1 - 680;

export const S7BoardShadows: React.FC = () => {
  const {x, base, w} = S7_BOLLARD;
  const k = kz(7.63);
  return (
    <ShadowLayer>
      {/* the board: one cast along its legs' line, contact under its four feet */}
      <CastShadow x={397} y={1246} w={574} pts={BOARD_FOOT} h={BOARD_H} />
      <ContactShadow x={130} y={B_LEGS_Y1} w={42} h={8} />
      <ContactShadow x={650} y={B_LEGS_Y1} w={42} h={8} />
      <ContactShadow x={157} y={1247} w={18} h={6} />
      <ContactShadow x={677} y={1247} w={18} h={6} />
      {/* Pip's bollard (with Pip on it: one cast), its contact ring */}
      <CastShadow x={x} y={base} w={w} depth={w * 0.17} h={base - 1105} />
      <ContactShadow x={x} y={base} w={w + 0.03 * k} h={9} />
    </ShadowLayer>
  );
};

/** The bollard's silhouette (the same shape S7Bollard draws), for its form crescent. */
export const s7BollardD = (): string => {
  const {x, cap, base, w} = S7_BOLLARD;
  const r = w / 2;
  return `M${x - r - 3} ${base - 4}L${x - r} ${cap + 14}A${r} 14 0 0 1 ${x + r} ${cap + 14}L${x + r + 3} ${base - 4}Q${x} ${base + 4} ${x - r - 3} ${base - 4}Z`;
};

export const S7BollardForm: React.FC = () => (
  <>
    <FormShade d={s7BollardD()} kind="crescent" frac={0.32} />
    <ShadowLayer>
      <ContactShadow x={S7_BOLLARD.x} y={S7_BOLLARD.cap + 3} w={50} h={6} />
    </ShadowLayer>
  </>
);

// ---------------------------------------------------------------- the plane tree (+0.5)

export const S7TreeShadows: React.FC = () => {
  const [tx, ty] = pt(S7_TREE.x, S7_TREE.z);
  return (
    <ShadowLayer>
      <CastShadow x={tx} y={ty} w={S7_TREE.trunkW * 1.3} h={ty - S7_TREE.crown.y0} />
      <ContactShadow x={tx} y={ty} w={S7_TREE.trunkW * 1.5} h={7} />
    </ShadowLayer>
  );
};

/** The crown's silhouette: the union of its clusters (ellipses), for its crescent. */
const crownD = () =>
  S7_CROWN_CLUSTERS.map((c) => `M${c.x - c.rx} ${c.y}A${c.rx} ${c.ry} 0 1 0 ${c.x + c.rx} ${c.y}A${c.rx} ${c.ry} 0 1 0 ${c.x - c.rx} ${c.y}Z`).join('');
const trunkD = () => {
  const T = S7_TREE;
  return `M${T.sx - T.trunkW / 2} ${T.base}L${T.sx - T.trunkW * 0.39} ${T.trunkTop}L${T.sx + T.trunkW * 0.39} ${T.trunkTop}L${T.sx + T.trunkW / 2} ${T.base}Z`;
};
export const S7TrunkForm: React.FC = () => <FormShade d={trunkD()} frac={0.34} />;
export const S7CrownForm: React.FC = () => <FormShade d={crownD()} kind="crescent" frac={0.26} />;

// ---------------------------------------------------------------- people, bikes (+1, +0.5)

/** The door people outside and the pair at rest with their table, the bikes on the frontage (+1). */
export const S7FolkShadows: React.FC = () => {
  const t = useTime();
  const out: React.ReactNode[] = [];
  for (const [p, key] of [[staffIn(t), 'a'], [staffOut(t), 'b']] as const) {
    if (!p || p.inside) continue;
    out.push(<ContactShadow key={`c${key}`} x={p.x} y={p.y} w={p.h * 0.24} k={1.2} />);
    out.push(<CastShadow key={`s${key}`} x={p.x} y={p.y} w={p.h * 0.2} h={p.h} />);
  }
  const {z, seats} = CAFE_PAIR;
  const k = kz(z);
  for (const [i, sx] of seats.entries()) out.push(<ContactShadow key={`p${i}`} x={sx} y={pt(0, z)[1]} w={0.5 * k} h={6} />);
  const [tx, ty] = pt(S7_CAFE_PAIR.table, z);
  out.push(<ContactShadow key="pt" x={tx} y={ty} w={0.32 * k} h={5} />);
  out.push(<CastShadow key="pts" x={tx} y={ty} w={0.48 * k} h={0.74 * k} />);
  const kb = kz(S7_BIKES.z);
  for (const [i, bk] of S7_BIKES.bikes.entries()) {
    const [bx, by] = pt(bk.x, S7_BIKES.z + 0.15);
    out.push(<ContactShadow key={`b${i}`} x={bx} y={by} w={1.75 * kb} h={5} k={1.05} />);
  }
  for (const [i, x] of S7_BIKES.stands.entries()) {
    const [sx, sy] = pt(x, S7_BIKES.z);
    out.push(<ContactShadow key={`s${i}`} x={sx} y={sy} w={0.8 * kb} h={4} k={1.05} />);
  }
  return <ShadowLayer>{out}</ShadowLayer>;
};

/** The cyclist (+0.5, behind the plane): contact under the wheels, a cast to the right. */
export const S7CyclistShadow: React.FC = () => {
  const t = useTime();
  const c = cyclistAt(t);
  if (!c) return null;
  return (
    <ShadowLayer>
      <ContactShadow x={c.x} y={c.y} w={c.h * 0.95} h={6} k={1.05} />
      <CastShadow x={c.x} y={c.y} w={c.h * 0.8} depth={4} h={c.h} />
    </ShadowLayer>
  );
};

// ---------------------------------------------------------------- the cafe and the planter (-1)

type Chair = {x: number; z: number; seat: number; back: number; w: number; d: number};
/** A chair's shadow on the ground: the hull of its feet, its seat and its back's top carried along the sun (metres).
 *  `back`: which side its back rest stands on ('near' = toward us, chair A; 'right' = chair B). */
function chairShadowPts(c: Chair, back: 'near' | 'right'): P2[] {
  const x0 = c.x - c.w / 2;
  const x1 = c.x + c.w / 2;
  const z0 = c.z - c.d / 2;
  const z1 = c.z + c.d / 2;
  const pts: P2[] = [pt(x0, z0), pt(x1, z0), pt(x1, z1), pt(x0, z1)];
  for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]] as P2[]) pts.push(shadowOf(x, z, c.seat));
  if (back === 'near') for (const x of [x0, x1]) pts.push(shadowOf(x, z0, c.back + 0.04));
  else for (const z of [z0, z1]) pts.push(shadowOf(x1, z, c.back));
  return hull(pts);
}

export const S7CafeShadows: React.FC = () => {
  const {table, chairA, chairB} = S7_CAFE;
  const {x, z, r, h} = table;
  const [sx, sz] = sunShift(h);
  const top = groundRing(x + sx, z + sz, r, 40);
  const ped = hull([pt(x - 0.03, z), pt(x + 0.03, z), shadowOf(x - 0.03, z, h), shadowOf(x + 0.03, z, h)]);
  const P = S7_PLANTER;
  const box: P2[] = [pt(P.x0, P.z0), pt(P.x1, P.z0), pt(P.x1, P.z1), pt(P.x0, P.z1)];
  const boxCast = hull([...box, shadowOf(P.x0, P.z0, P.h), shadowOf(P.x1, P.z0, P.h), shadowOf(P.x1, P.z1, P.h), shadowOf(P.x0, P.z1, P.h), shadowOf(P.x0 + 0.2, (P.z0 + P.z1) / 2, P.grass * 0.85)]);
  const contactRing = groundRing(x, z, 0.18, 32);
  const feet = (c: Chair) =>
    [
      [c.x - c.w / 2 + 0.03, c.z - c.d / 2 + 0.03],
      [c.x + c.w / 2 - 0.03, c.z - c.d / 2 + 0.03],
      [c.x - c.w / 2 + 0.03, c.z + c.d / 2 - 0.03],
      [c.x + c.w / 2 - 0.03, c.z + c.d / 2 - 0.03],
    ] as P2[];
  return (
    <ShadowLayer>
      {/* casts: the table's top and pedestal, both chairs (chair A with its coat), the planter and its grasses */}
      <Shadow d={polyD(top)} tint="cast" soft={8} />
      <Shadow d={polyD(ped)} tint="cast" soft={4} />
      <Shadow d={polyD(chairShadowPts(chairA, 'near'))} tint="cast" soft={8} />
      <Shadow d={polyD(chairShadowPts(chairB, 'near'))} tint="cast" soft={8} />
      <Shadow d={polyD(boxCast)} tint="cast" soft={8} />
      {/* contact: the table's foot, the chairs' feet, the planter's foot */}
      <ContactShadow x={pt(x, z)[0]} y={pt(x, z)[1]} w={0} d={polyD(contactRing)} />
      {[chairA, chairB].flatMap((c, i) =>
        feet(c).map(([fx, fz], j) => {
          const [px, py] = pt(fx, fz);
          return <ContactShadow key={`cf${i}${j}`} x={px} y={py} w={0.07 * kz(fz)} h={Math.max(6, 0.03 * kz(fz))} />;
        }),
      )}
      <ContactShadow x={0} y={0} w={0} d={polyD([pt(P.x0 - 0.025, P.z0 - 0.025), pt(P.x1 + 0.02, P.z0 - 0.025), pt(P.x1 + 0.02, P.z0 + 0.03), pt(P.x0 - 0.025, P.z1 + 0.02)])} />
    </ShadowLayer>
  );
};

/** The planter's south face one Shade step; the coat's side away from the sun (a band). */
export const S7CafeForm: React.FC = () => {
  const P = S7_PLANTER;
  const face = polyD([pt(P.x0, P.z0, P.h), pt(P.x1, P.z0, P.h), pt(P.x1, P.z0, 0), pt(P.x0, P.z0, 0)]);
  return (
    <>
      <Shade d={face} />
      <FormShade d={polyD(s7CoatD())} frac={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- the basin (-0.5)

/** Its contact strip along the foot (the near rim and the west end), before the basin is drawn. */
export const S7BasinContact: React.FC = () => {
  const f = s7BasinFaces();
  const [a, b, c] = f.foot;
  const strip = polyD([[a[0] - 2, a[1] - 2], [b[0] - 4, b[1] - 3], [c[0] + 30, c[1] - 3], [c[0] + 30, c[1] + 9], [b[0] - 6, b[1] + 9], [a[0] - 5, a[1] + 4]]);
  return (
    <ShadowLayer>
      <Shadow d={strip} tint="contact" soft={3.5} />
    </ShadowLayer>
  );
};
/** The west wall's shadow on the water (after the water, before the rims): the water's own deeper step. */
export const S7BasinWaterShade: React.FC = () => (
  <ShadowLayer>
    <Shadow d={polyD([...S7_WATER.shade])} tint="water" />
  </ShadowLayer>
);
/** The near rim's south face, away from the low sun: one Shade step (after the rims). */
export const S7BasinFaceShade: React.FC = () => <Shade d={polyD(s7BasinFaces().nearFace)} />;

export {heightAt};
