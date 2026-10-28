// V2S7_folk.tsx (lane L5): the LIFE of V2S7 that is not a particle, every figure sized by the shot's one camera
// (V2S7_plan: 1.7 m people at their own depth) and every time shot-local (film - 28.10). Tiers (conform_L5 §3):
// B (support, thin tinted lines) = the door people, small backs taking turns; C (environment, no line) = the cyclist,
// the two people at rest at the cafe table in the west strip (fill only: `ink={0}`), the parked bikes, the festoon, the
// boat smoke. At most three noticeable movers at once, taking turns (the staffer in 0-1.8 s, the cyclist
// 1.3-3.5 s, the staffer out from 2.6 s); nothing enters, pops or turns in 27.90-28.30 (local -0.2..0.2): the staffer
// going in is already walking; nothing new starts in 32.50-33.10 (local 4.40-5.00) but the wiper.
//   S7StaffInside / S7StaffOutside   the door people (in through the doors on DOOR_KEYS, then out and away right)
//   S7Cyclist      one cyclist across the forecourt (z 21) from behind the board's right edge, behind the plane's trunk
//   S7CafePair     two people at rest at a small cafe table in the west strip (z 19.5): a cup lifts, slowly
//   S7Bikes        two Sheffield stands with two bikes along the frontage right of the doors (z 23.2)
//   S7Festoon      ONE string from the wing to the plane, its 15 bulbs in THREE groups switching on together on film
//                  frames 1812 / 1836 / 1848 (30.200 / 30.600 / 30.800: the sound lane's request, map S7.boardBeats):
//                  three switch-ons, <= 3 in any second; the lit bulbs are lib/light SourceCore (no glow, no flicker)
import React from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Tier} from '../../lib/tier';
import {SourceCore, fromLch} from '../../lib/light';
import {wire as wirePath, wirePoint} from '../../lib/sketch';
import {Batch, Paint, P, ovalPath, lerp, clamp01} from '../kit/canal/core';
import {bikeInto} from '../kit/canal/towpath';
import {Person, Seated, strideFor} from '../kit/cast';
import {heightAt, kz, onPlane, pt, S7_BIKES, S7_CAFE_PAIR, S7_FESTOON, S7_LANES, S7_STEPS, xAt, yAt} from './V2S7_plan';
import {S7_DOOR_BOX} from './V2S7_wing';

// ---------------------------------------------------------------- the door people (B)

export type FolkPose = {x: number; y: number; h: number; inside: boolean; view: 'back' | 'profile'; flip: boolean; z: number};

/** The door line (the facade, z 25): a figure switches between the outside layer and the lobby slot exactly there,
 *  in the open doorway (x 2.5 m: clear of the west side light's frame), so the switch is seamless (same place, size
 *  and pose on both sides). */
const DOOR_Z = 25.0;
/** The staffer going IN: already walking toward the doors (a back) when the shot opens, up the steps and through the
 *  door line at 0.95 s (the doors open 0.58-1.58), on into the lobby (to z 25.4), then left, gone behind the side
 *  light by ~1.8 s. One continuous path: no jump at the door. */
export function staffIn(t: number): FolkPose | null {
  const {x: [xa, xb], z: [za, zb]} = S7_LANES.staffIn;
  const T0 = -1.5;
  const T1 = 0.95;
  if (t < T0 || t > 1.8) return null;
  if (t < T1) {
    const u = (t - T0) / (T1 - T0);
    const x = lerp(xa, xb, u);
    const z = lerp(za, zb, u);
    // up the two low steps over the last 0.7 m
    const lev = clamp01((z - S7_STEPS.z[0] + 0.05) / (S7_STEPS.z[2] - S7_STEPS.z[0])) * 2 * S7_STEPS.rise;
    const [sx, sy] = pt(x, z, lev);
    return {x: sx, y: sy, h: heightAt(z, 1.7), inside: false, view: 'back', flip: false, z};
  }
  // inside: straight on to z 25.4 (0.95-1.16 s, a back), then left along the lobby (a profile)
  const u = (t - T1) / (1.8 - T1);
  const a = clamp01(u / 0.25);
  const z = lerp(DOOR_Z, 25.4, a);
  const x = xb - 1.7 * clamp01((u - 0.25) / 0.75);
  const [sx, sy] = pt(x, z, 2 * S7_STEPS.rise);
  return {x: sx, y: sy, h: heightAt(z, 1.7), inside: true, view: u < 0.25 ? 'back' : 'profile', flip: false, z};
}

/** The staffer coming OUT: inside (profile, walking right) from 2.55 s, bearing toward the doors and over the door
 *  line at 3.05 (open 2.82-3.80), down the steps and away right along the frontage (z 23.7), behind the bikes and the
 *  plane. One continuous path: no jump at the door. */
export function staffOut(t: number): FolkPose | null {
  const T0 = 2.55;
  const T1 = 3.05;
  if (t < T0) return null;
  if (t < T1) {
    const u = (t - T0) / (T1 - T0);
    // along the lobby at z 25.4, the last fifth bearing out to the door line
    const z = lerp(25.4, DOOR_Z, clamp01((u - 0.8) / 0.2));
    const [sx, sy] = pt(lerp(1.05, S7_LANES.staffOut.x[0], u), z, 2 * S7_STEPS.rise);
    return {x: sx, y: sy, h: heightAt(z, 1.7), inside: true, view: 'profile', flip: true, z};
  }
  const s = t - T1;
  const z = lerp(DOOR_Z, S7_LANES.staffOut.z, clamp01(s / 1.0));
  const x = S7_LANES.staffOut.x[0] + 1.3 * s;
  const lev = clamp01((z - S7_STEPS.z[0] + 0.05) / (S7_STEPS.z[2] - S7_STEPS.z[0])) * 2 * S7_STEPS.rise;
  const [sx, sy] = pt(x, z, lev);
  if (sx > 1160) return null;
  return {x: sx, y: sy, h: heightAt(z, 1.7), inside: false, view: 'profile', flip: true, z};
}

const STAFF_A = {hair: 'bun', acc: 'tote', coat: CM.coatMustard, hairColor: CM.hair[2]} as const;
const STAFF_B = {hair: 'short', acc: 'strap', coat: CM.stoneShade, hairColor: CM.hair[1]} as const;

/** Walking at ~1.3 m/s, 1.8 steps/s (0.72 m steps): a profile walk's stride keeps its feet from sliding. */
const StaffFig: React.FC<{s: FolkPose; seed: string; traits: React.ComponentProps<typeof Person>['traits']; t: number}> = ({s, seed, traits, t}) => (
  <Person x={s.x} y={s.y} h={s.h} seed={seed} pose="walk" view={s.view} flip={s.flip} step={1.8 * (Math.floor(t * 12) / 12)} stride={s.view === 'back' ? 0.55 : strideFor(0.72 * kz(s.z), s.h, 'profile')} traits={traits} exact />
);

/** Clip the inside-the-door figures to the lobby box (they are seen through the glass). */
const DoorClip: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <>
    <defs>
      <clipPath id="s7doorclip" clipPathUnits="userSpaceOnUse">
        <rect x={S7_DOOR_BOX.x0} y={S7_DOOR_BOX.y0} width={S7_DOOR_BOX.x1 - S7_DOOR_BOX.x0} height={S7_DOOR_BOX.y1 - S7_DOOR_BOX.y0 + 1} />
      </clipPath>
    </defs>
    <g clipPath="url(#s7doorclip)">{children}</g>
  </>
);

/** The staff seen through the door glass (the wing's behindDoor slot). */
export const S7StaffInside: React.FC = () => {
  const t = useTime();
  const a = staffIn(t);
  const b = staffOut(t);
  return (
    <Tier tier="support">
      <DoorClip>
        {a && a.inside ? <StaffFig s={a} seed="s7/staffA" traits={STAFF_A} t={t} /> : null}
        {b && b.inside ? <StaffFig s={b} seed="s7/staffB" traits={STAFF_B} t={t} /> : null}
      </DoorClip>
    </Tier>
  );
};
/** The staff outside (on the steps and the frontage). */
export const S7StaffOutside: React.FC = () => {
  const t = useTime();
  const a = staffIn(t);
  const b = staffOut(t);
  return (
    <Tier tier="support">
      {a && !a.inside ? <StaffFig s={a} seed="s7/staffA" traits={STAFF_A} t={t} /> : null}
      {b && !b.inside ? <StaffFig s={b} seed="s7/staffB" traits={STAFF_B} t={t} /> : null}
    </Tier>
  );
};

// ---------------------------------------------------------------- the cyclist (C)

/** The cyclist's coat and trousers: light (L* >= 69: a tier-C figure's same-hue lines stay over L* 55, never a dark
 *  drawn line), a cool denim that never hides a gold or rust leaf blowing across it (the leaves cross his path at
 *  ~2.4-3.3 s). */
const S7_CYCLIST_COAT = '#A4B2C9';

/** The cyclist (z 21: 146 px, a slow 2.6 m/s = 223 px/s): out from behind the board's right edge at ~1.30 s, off the
 *  right edge by ~3.4 s. */
export const CYCLIST = {z: 21, v: 2.6, t0: 1.3, x0: xAt(640, 21)} as const;
export function cyclistAt(t: number): {x: number; y: number; h: number} | null {
  const x = CYCLIST.x0 + CYCLIST.v * (t - CYCLIST.t0);
  const [sx, sy] = pt(x, CYCLIST.z);
  if (t < CYCLIST.t0 - 0.4 || sx > 1240) return null;
  return {x: sx, y: sy, h: heightAt(CYCLIST.z, 1.72)};
}

export const S7Cyclist: React.FC = () => {
  const t = useTime();
  const c = cyclistAt(t);
  if (!c) return null;
  return (
    <Tier tier="environment">
      <Person x={c.x} y={c.y} h={c.h} seed="s7/cyclist" pose="cycle" view="profile" flip pedal={1.2} traits={{hair: 'cap', acc: 'backpack', coat: S7_CYCLIST_COAT, trousers: '#B4AABF', hairColor: CM.hair[2], hatColor: CM.coatOat}} exact />
    </Tier>
  );
};

// ---------------------------------------------------------------- the west strip: two at rest (C)

/** The pair's seat line and seated height (head top to the seat: 0.85 m at z 19.5), and the small table. */
export const CAFE_PAIR = (() => {
  const {z, table, seats} = S7_CAFE_PAIR;
  const seatY = yAt(z, 0.46);
  const h = 0.85 * kz(z);
  return {z, seatY, h, seats: seats.map((x) => pt(x, z)[0]), table: pt(table, z)};
})();

export const S7CafePair: React.FC = () => {
  const t = useTime();
  const {z, seatY, h, seats} = CAFE_PAIR;
  const cup = clamp01((t - 1.6) / 0.6) * (1 - clamp01((t - 3.1) / 0.6));
  const b = new Batch();
  // the small round table between them (marble top on a pedestal) and their two chairs' backs
  const [tx] = pt(S7_CAFE_PAIR.table, z);
  const k = kz(z);
  b.rect(onPlane(CM.stoneShade, 1), tx - 0.02 * k, yAt(z, 0.72), 0.04 * k, yAt(z) - yAt(z, 0.72));
  b.fill(onPlane(CM.limestone, 1), ovalPath(tx, yAt(z, 0.74), 0.24 * k, 0.05 * k));
  b.fill(onPlane(CM.paper, 1), ovalPath(tx - 0.05 * k, yAt(z, 0.77), 0.04 * k, 0.02 * k));
  return (
    <Tier tier="environment">
      <Seated x={seats[0]} y={seatY} h={h} seed="s7/pair/a" view="profile" flip cup={cup} side={1} ink={0} traits={{hair: 'long', acc: 'scarf', coat: CM.brickLight, trousers: '#B9A9B6', hairColor: CM.hair[4], accColor: CM.sage}} />
      <Seated x={seats[1]} y={seatY} h={h * 0.97} seed="s7/pair/b" view="profile" read ink={0} traits={{hair: 'short', acc: 'none', coat: CM.sage, trousers: '#A9A3B9', hairColor: CM.hair[3]}} />
      <Paint b={b} seed="s7/pairTable" misreg={false} />
    </Tier>
  );
};

// ---------------------------------------------------------------- bikes on the frontage (C, static)

export const S7Bikes: React.FC = () => {
  const b = new Batch();
  const {z, stands, bikes} = S7_BIKES;
  const k = kz(z);
  const steel = onPlane(CM.shadeCool, 1);
  // the stands: an inverted U tube (0.75 m wide, 0.8 m tall) as one closed shape
  for (const x of stands) {
    const [x0, yb] = pt(x - 0.375, z);
    const x1 = pt(x + 0.375, z)[0];
    const top = yAt(z, 0.8);
    const w = 0.045 * k;
    const r = 0.16 * k;
    b.fill(steel, `M${P(x0 - w / 2, yb)}L${P(x0 - w / 2, top + r)}Q${P(x0 - w / 2, top - w / 2)} ${P(x0 + r, top - w / 2)}L${P(x1 - r, top - w / 2)}Q${P(x1 + w / 2, top - w / 2)} ${P(x1 + w / 2, top + r)}L${P(x1 + w / 2, yb)}L${P(x1 - w / 2, yb)}L${P(x1 - w / 2, top + r)}Q${P(x1 - w / 2, top + w / 2)} ${P(x1 - r, top + w / 2)}L${P(x0 + r, top + w / 2)}Q${P(x0 + w / 2, top + w / 2)} ${P(x0 + w / 2, top + r)}L${P(x0 + w / 2, yb)}Z`);
  }
  b.layer();
  bikes.forEach((bk, i) => {
    const [bx, by] = pt(bk.x, z + 0.15);
    bikeInto(b, bx, by, 0.34 * kz(z + 0.15), `s7/bike${i}`, i ? onPlane(CM.brick, 1) : onPlane(CM.sage, 1), bk.dir);
  });
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s7/bikes" misreg={false} />
    </Tier>
  );
};

// ---------------------------------------------------------------- the festoon (C): three switch-ons

/** The festoon's wire as shown (a 'tone' line: the pen keeps it as authored). */
const FESTOON_WIRE = fromLch(60, 18, 45);

/** Local switch-on times of the festoon's three groups: film frames 1812 / 1836 / 1848 (30.200 / 30.600 / 30.800). */
export const FESTOON_ON = [1812, 1836, 1848].map((f) => f / 60 - 28.1) as [number, number, number];
/** Which group a bulb belongs to (left third first: nearest the board, then outward into the plane). */
export const festoonGroup = (i: number) => Math.min(S7_FESTOON.groups - 1, Math.floor((i * S7_FESTOON.groups) / S7_FESTOON.n));

/** The bulb centres (screen px), hanging just under the wire. */
export function festoonBulbs(): [number, number][] {
  const {from, to, sag, n, bulb} = S7_FESTOON;
  return Array.from({length: n}, (_, i) => {
    const [x, y] = wirePoint(from[0], from[1], to[0], to[1], sag, (i + 0.5) / n);
    return [x, y + bulb * 1.3] as [number, number];
  });
}

export const S7Festoon: React.FC = () => {
  const t = useTime();
  const {from, to, sag, bulb} = S7_FESTOON;
  const b = new Batch();
  // the wire IS the thing (tier C: a hairline within dL* 15 of the wall and panes behind it, L* 60 on 67-79)
  b.ink(wirePath(from[0], from[1], to[0], to[1], sag, {seed: 's7/festoon'}), 1.4, FESTOON_WIRE, 0, {thing: true});
  b.layer();
  const bulbs = festoonBulbs();
  const off = onPlane(CM.stoneShade, 1);
  const cap = onPlane(CM.coatSlate, 1);
  const lit: string[] = [];
  bulbs.forEach(([x, y], i) => {
    b.rect(cap, x - bulb * 0.32, y - bulb * 1.3, bulb * 0.64, bulb * 0.45);
    // every bulb's glass (the light-off look); a lit one gets its SourceCore on top (one frame, no glow, no flicker)
    const d = ovalPath(x, y, bulb * 0.78, bulb);
    b.fill(off, d);
    if (t >= FESTOON_ON[festoonGroup(i)] - 1e-6) lit.push(d);
  });
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s7/festoon" misreg={false} />
      {lit.length ? <SourceCore d={lit.join('')} /> : null}
    </Tier>
  );
};
