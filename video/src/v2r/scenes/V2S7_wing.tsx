// V2S7_wing.tsx (lane L5): Google's canal wing in V2S7, plane +1 (THROUGHLINE §5b: "+1 the wing's facade, one shade step
// behind the board: it faces away from the low sun"). Drawn for this shot (the canal kit's WingS7 shows bright lamp and
// sky-glass panes that switch, and its fin lines cross the canopy's letters): the same building (two storeys, light
// brick, limestone fins on the piers, a stone band under the first-floor sills, the plinth, the glass doors under the
// canopy hand-lettered "Google", map S7.canopyGoogle), seen frontal at 72 px/m from the forecourt's eye level.
//   The field behind Google's board (CRAFT §f "a separation backing ... a real thing of the set"): the shaded brick
//   facade with TONE-ON-TONE lit windows (a warm interior one soft step over the shaded wall, never the lamp colour
//   or a sky-glass glare), so the board's cream face and plum frame stand off a calm field. The one bright warm area
//   is the lobby behind the doors (lamp-lit, where the staff go in and out).
//   Depth on one camera: the canopy stands 1.2 m proud: its underside (a soffit band) and its west end (a narrow face
//   receding to the VP, lit by the low western sun) show; two low steps run along the frontage to the floor at 0.30 m.
//   Every fill takes the +1 step toward the air (V2S7_plan onPlane: recede, pre-compensated for the clean pen);
//   environment tier (no outlines). The facade's shade is a LIGHT layer (V2S7_light S7WingShade: one Shade step on the
//   south faces, the panes and the lobby left out).
// WORLD px; the doors run on DOOR_KEYS (shot-local s); the staff inside are the `behindDoor` slot.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Tier} from '../../lib/tier';
import {Slot} from '../kit/tiers';
import {lch, fromLch, multiply} from '../../lib/light';
import {recede} from '../../lib/depth';
import {Batch, Paint, P, lobes, ovalPath, clamp01, lerp} from '../kit/canal/core';
import {HandLetteredGoogle} from '../kit/canal/lettering';
import {TINT_CANAL} from '../world/rigs';
import {S7_AIR} from '../world/skies';
import {onPlane, S7_ATM, S7_STEPS, S7_WING, pt, yAt} from './V2S7_plan';
import {DOOR_KEYS} from './V2S7_rig';

const W = S7_WING;

// ---------------------------------------------------------------- colours (+1, as shown)

/** The wing's materials on +1 (authored so the pen shows recede(c, 1)). */
export const WING_C = {
  brick: onPlane(CM.brickLight, 1),
  stone: onPlane(CM.limestone, 1),
  stoneLit: onPlane(CM.paper, 1),
  frame: onPlane(CM.brickDeep, 1),
  sill: onPlane(CM.stucco, 1),
  fascia: onPlane(CM.paper, 1),
} as const;

/** A lit pane, tone-on-tone with the SHADED wall: the wall as shown under the Shade step, one soft step lighter and
 *  turned a little toward the lamp's gold (dE ~8): a calm lit interior, never the lamp colour (CRAFT §f.2, §d.2). */
const paneTone = (lift: number, warm: number) => {
  const wall = multiply(recede(CM.brickLight, 1, S7_ATM), TINT_CANAL.form);
  const c = lch(wall);
  return fromLch(c.L + lift, c.C + 3, c.h + warm);
};
/** Panes are NOT under the facade's Shade (V2S7_light cuts them out): authored for the environment tier. */
const PANE = {
  upper: onPlaneExact(paneTone(7, 16)),
  upperTop: onPlaneExact(paneTone(10, 20)),
  lower: onPlaneExact(paneTone(9, 18)),
  lowerTop: onPlaneExact(paneTone(12, 22)),
};
/** A colour already on its plane: only the pen's pull is pre-compensated. */
function onPlaneExact(c: string): string {
  return onPlane(c, 0);
}

// ---------------------------------------------------------------- geometry the light layer needs

const r1 = (v: number) => Math.round(v * 10) / 10;
const rectD = (x0: number, y0: number, x1: number, y1: number) => `M${P(x0, y0)}H${r1(x1)}V${r1(y1)}H${r1(x0)}Z`;
/** The same rect wound the other way (a hole under the nonzero rule). */
const holeD = (x0: number, y0: number, x1: number, y1: number) => `M${P(x0, y0)}V${r1(y1)}H${r1(x1)}V${r1(y0)}Z`;

/** Every pane (upper and lower storeys) and the door opening, screen rects [x0, y0, x1, y1]. */
export function s7WingPanes(): [number, number, number, number][] {
  const out: [number, number, number, number][] = [];
  for (const [x0, x1] of W.upper) out.push([x0, W.upperY[0], Math.min(x1, W.x1), W.upperY[1]]);
  for (const [x0, x1] of W.lower) out.push([x0, W.lowerY[0], Math.min(x1, W.x1), W.lowerY[1]]);
  return out;
}

/** The facade's south faces in shade (V2S7_light): the whole front minus the panes and the lobby (holes), the
 *  canopy's fascia included (it faces south too). */
export function s7WingShadeD(): string {
  let d = rectD(W.x0, W.top, W.x1 + 30, W.floorY);
  for (const [x0, y0, x1, y1] of s7WingPanes()) d += holeD(x0, y0, x1, y1);
  const D = W.door;
  d += holeD(D.x0 - 16, D.y0, D.x1 + 16, D.y1);
  return d;
}

/** The canopy's underside (a soffit band seen from below) and its west end face, screen polygons (one camera). */
export function s7Canopy() {
  const F = W.fascia;
  const zF = W.z - W.canopyDepth;
  // the fascia is drawn where the map puts it (its front face at zF); the soffit runs back to the facade (z 25)
  const level = 1.6 - ((F.y1 - 897) * zF) / 1800;
  const back = pt((F.x0 - 540) * (zF / 1800), W.z, level);
  const backR = pt((F.x1 - 540) * (zF / 1800), W.z, level);
  const topBack = pt((F.x0 - 540) * (zF / 1800), W.z, 1.6 - ((F.y0 - 6 - 897) * zF) / 1800);
  const soffit: [number, number][] = [[F.x0 - 10, F.y1], [F.x1 + 10, F.y1], [backR[0] + 10, backR[1]], [back[0] - 10, back[1]]];
  const end: [number, number][] = [[F.x0 - 10, F.y0 - 6], [F.x0 - 10, F.y1], [back[0] - 10, back[1]], [topBack[0] - 10, topBack[1]]];
  return {soffit, end};
}

// ---------------------------------------------------------------- the static front

function frontInto(k: Batch) {
  // the brick wall (one plane), the coping, the band under the first-floor sills, the plinth
  k.rect(WING_C.brick, W.x0, W.top, W.x1 - W.x0 + 30, W.floorY - W.top);
  k.layer();
  k.rect(WING_C.stone, W.x0, W.coping[0], W.x1 - W.x0 + 30, W.coping[1] - W.coping[0]);
  k.rect(WING_C.stone, W.x0, W.band[0], W.x1 - W.x0 + 30, W.band[1] - W.band[0]);
  k.rect(WING_C.stone, W.x0, W.floorY - 22, W.x1 - W.x0 + 30, 22);
  // the west corner pier
  k.rect(WING_C.stone, W.pier[0], W.top, W.pier[1] - W.pier[0], W.floorY - W.top);
  // window panes: a calm lit interior (two tones: the room and its lit ceiling band), slim warm frames and mullions
  k.layer();
  W.upper.forEach(([x0, x1], i) => {
    const xr = Math.min(x1, W.x1 + 30);
    k.rect(PANE.upper, x0, W.upperY[0], xr - x0, W.upperY[1] - W.upperY[0]);
    k.rect(PANE.upperTop, x0, W.upperY[0], xr - x0, (W.upperY[1] - W.upperY[0]) * 0.22);
    if (i % 2) k.rect(WING_C.frame, (x0 + x1) / 2 - 1.8, W.upperY[0], 3.6, W.upperY[1] - W.upperY[0]);
    k.rect(WING_C.frame, x0, W.upperY[0] + (W.upperY[1] - W.upperY[0]) * 0.22, xr - x0, 2.6);
    k.rect(WING_C.sill, x0 - 6, W.upperY[1], xr - x0 + 12, 5.5);
  });
  for (const [x0, x1] of W.lower) {
    const xr = Math.min(x1, W.x1 + 30);
    k.rect(PANE.lower, x0, W.lowerY[0], xr - x0, W.lowerY[1] - W.lowerY[0]);
    k.rect(PANE.lowerTop, x0, W.lowerY[0], xr - x0, (W.lowerY[1] - W.lowerY[0]) * 0.18);
    for (let x = x0 + (xr - x0) / 2; x < xr - 4; x += (xr - x0) / 2) k.rect(WING_C.frame, x - 1.8, W.lowerY[0], 3.6, W.lowerY[1] - W.lowerY[0]);
    k.rect(WING_C.frame, x0, W.lowerY[0] + (W.lowerY[1] - W.lowerY[0]) * 0.18, xr - x0, 2.6);
  }
  // the fins: slim limestone in front of the piers between the upper bays (0.12 m), coping to plinth
  k.layer();
  for (const [x0] of W.upper) k.rect(WING_C.stone, x0 - 16.5, W.coping[1], 8.6, W.floorY - 22 - W.coping[1]);
}

/** The canopy: its fascia (paper) with a limestone cap, the soffit band and the west end face (one camera). */
function canopyInto(k: Batch) {
  const F = W.fascia;
  const {soffit, end} = s7Canopy();
  k.poly(WING_C.stone, soffit);
  k.poly(WING_C.stoneLit, end);
  k.rect(WING_C.fascia, F.x0, F.y0, F.x1 - F.x0, F.y1 - F.y0);
  k.rect(WING_C.stone, F.x0 - 10, F.y0 - 6, F.x1 - F.x0 + 20, 7);
}

/** Two low steps along the frontage: risers (south: in shade, V2S7_light) and treads (sky-lit, one step lighter). */
export function s7Steps() {
  const [z1, z2, z3] = S7_STEPS.z;
  const rise = S7_STEPS.rise;
  const xa = -2.62;
  const xb = 8.2;
  const riser1: [number, number][] = [pt(xa, z1, 0), pt(xb, z1, 0), pt(xb, z1, rise), pt(xa, z1, rise)];
  const tread1: [number, number][] = [pt(xa, z1, rise), pt(xb, z1, rise), pt(xb, z2, rise), pt(xa, z2, rise)];
  const riser2: [number, number][] = [pt(xa, z2, rise), pt(xb, z2, rise), pt(xb, z2, 2 * rise), pt(xa, z2, 2 * rise)];
  const tread2: [number, number][] = [pt(xa, z2, 2 * rise), pt(xb, z2, 2 * rise), pt(xb, z3, 2 * rise), pt(xa, z3, 2 * rise)];
  return {riser1, tread1, riser2, tread2};
}

function stepsInto(k: Batch) {
  const s = s7Steps();
  k.poly(WING_C.stone, s.riser1);
  k.poly(WING_C.stone, s.riser2);
  k.poly(WING_C.stoneLit, s.tread1);
  k.poly(WING_C.stoneLit, s.tread2);
}

// ---------------------------------------------------------------- the lobby and the doors (per frame)

/** Door opening 0..1 from [t, open] keys (eased between keys). */
export function doorOpenAt(t: number, keys: [number, number][] = DOOR_KEYS): number {
  if (!keys.length || t <= keys[0][0]) return keys.length ? keys[0][1] : 0;
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, a] = keys[i - 1];
      const [t1, c] = keys[i];
      const u = clamp01((t - t0) / Math.max(1e-6, t1 - t0));
      return lerp(a, c, u * u * (3 - 2 * u));
    }
  }
  return keys[keys.length - 1][1];
}

/** The lobby behind the doors: warm and lamp-lit (the one bright area on the wing), a counter, a tall plant, three
 *  pendant lights. Emissive lamp colours (never recoloured by the pen). */
function lobbyInto(k: Batch) {
  const D = W.door;
  const h = D.y1 - D.y0;
  k.rect(CM.lamp, D.x0 - 16, D.y0, D.x1 - D.x0 + 32, h);
  k.rect(CM.lampCore, D.x0 - 16, D.y0, D.x1 - D.x0 + 32, h * 0.42);
  k.layer();
  k.rect(onPlane(CM.stucco, 1), D.x0 - 16, D.y1 - 16, D.x1 - D.x0 + 32, 16);
  k.rect(onPlane(CM.line, 1), D.x0 + (D.x1 - D.x0) * 0.56, D.y1 - 62, (D.x1 - D.x0) * 0.36, 46);
  k.fill(onPlane(CM.sage, 1), lobes(D.x0 + 4, D.x0 + 50, D.y1 - 28, 92, 's7/lobbyPlant', 3));
  k.rect(onPlane(CM.brickDeep, 1), D.x0 + 14, D.y1 - 44, 22, 28);
  for (let j = 0; j < 3; j++) k.fill(CM.lampCore, ovalPath(D.x0 + (D.x1 - D.x0) * (0.25 + j * 0.25), D.y0 + 16, 7, 4));
}

/** The two glass leaves sliding apart into their pockets (open 0..1), the fixed side lights, the frames. */
function doorsInto(k: Batch, open: number) {
  const D = W.door;
  const leafW = (D.x1 - D.x0) / 2;
  const fr = 4;
  const frame = WING_C.frame;
  for (const side of [0, 1]) {
    const shift = open * leafW * (side ? 1 : -1);
    const a0 = D.x0 + side * leafW + shift;
    const a = Math.max(D.x0, a0);
    const e = Math.min(D.x1, a0 + leafW);
    if (e - a <= 0.5) continue;
    k.rect(frame, a, D.y0, e - a, fr);
    k.rect(frame, a, D.y1 - 9, e - a, 9);
    if (a0 >= D.x0 - 1e-3) k.rect(frame, a, D.y0, fr, D.y1 - D.y0);
    if (a0 + leafW <= D.x1 + 1e-3) k.rect(frame, e - fr, D.y0, fr, D.y1 - D.y0);
    // a brass pull bar on the meeting edge
    const hx = side ? a0 + fr + 5 : a0 + leafW - fr - 8;
    if (hx > D.x0 && hx < D.x1 - 3) k.rect(onPlane(CM.coatMustard, 1), hx, D.y0 + (D.y1 - D.y0) * 0.36, 3, (D.y1 - D.y0) * 0.28);
  }
  // the fixed side lights (glass over the lobby's edge) and their frames
  for (const [x0, x1] of [[D.x0 - 16, D.x0], [D.x1, D.x1 + 16]] as [number, number][]) {
    k.rect(frame, x0, D.y0, 3, D.y1 - D.y0);
    k.rect(frame, x1 - 3, D.y0, 3, D.y1 - D.y0);
  }
  k.rect(frame, D.x0 - 16, D.y0 - 4, D.x1 - D.x0 + 32, 4);
}

// ---------------------------------------------------------------- the wing

/** The wing (+1): the static front, the canopy, the steps, the lobby with `behindDoor` (the staff seen through the
 *  glass), the doors on DOOR_KEYS, and the canopy's letters (graphic ink, one step toward the air). */
export const S7WingFront: React.FC<{behindDoor?: React.ReactNode}> = ({behindDoor}) => {
  const t = useTime();
  const stat = useMemo(() => {
    const k = new Batch();
    frontInto(k);
    k.layer();
    canopyInto(k);
    k.layer();
    stepsInto(k);
    return k;
  }, []);
  const lobby = useMemo(() => {
    const k = new Batch();
    lobbyInto(k);
    return k;
  }, []);
  const doors = new Batch();
  doorsInto(doors, doorOpenAt(t));
  const F = W.fascia;
  return (
    <Tier tier="environment" bg={S7_AIR}>
      <Paint b={stat} seed="s7/wing" misreg={false} />
      <Paint b={lobby} seed="s7/lobby" misreg={false} />
      <Slot>{behindDoor}</Slot>
      <Paint b={doors} seed="s7/doors" misreg={false} />
      <HandLetteredGoogle cx={(F.x0 + F.x1) / 2} baseline={F.y0 + (F.y1 - F.y0) * 0.78} cap={Math.min(40, (F.y1 - F.y0) * 0.86)} color={recede(CM.ink, 1, S7_ATM)} />
    </Tier>
  );
};

/** The door opening (the lobby box) and the floor line, for the staff's clip and the light layer. */
export const S7_DOOR_BOX = {x0: W.door.x0 - 16, y0: W.door.y0, x1: W.door.x1 + 16, y1: W.door.y1} as const;
export const S7_FLOOR_Y = yAt(W.z, 0.3);
