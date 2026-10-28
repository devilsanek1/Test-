// V2S8 set (lane L6, builder A): THE WORLD of her lane at sunset, looking WEST down her towpath (TREATMENT section 5,
// row S8 + its bottom third; plan_L6.md sections 1-4; V2S8_clock.ts is the contract). Everything but her house row at
// the bend, the board, the people and Pip. Every part draws at the LANDING pose (35.60) and shifts by its plane's
// offset (V2S8_depth S8Plane: the truck + its share of the parallax float); the un-build (Fill / Ink read the exit)
// wraps it all.
//   S8Sky    lib/sky's one continuous gradient (world/skies S8_EVENING) + the low sun SUN8 (420, 625) r 40, a flat disc
//                                                                                                       sky (no shift)
//   S8Far    beyond the bend, depth +2 on the sunset band: the gasholder frames, a brick viaduct with ONE train (before
//            the truck), a canal warehouse + works chimney (the set's ONE smoke), terrace roofs; merged to four close
//            values near the air (lib/depth planePalette), windows tone-on-tone, nothing under 4 px      far 24
//   S8South  the far bank across the basin, depth +1 (one step toward the air): warehouses, terrace backs, blocks,
//            autumn trees, static windows, the far towpath with tiny walkers, benches and lamps         south 60
//   S8Water  the canal (+0.5: S8Canal, the water field, then the far wall) AND THE HOUSE BAND (the towpath beyond the bend, her
//            forecourt, the coping to the VP), drawn here, UNDER S8House                          water 110 / house 160
//   S8Boat   the cafe boat moored along our coping (its x 0-150 strip shows at the landing: the serving hatch, a
//            menu card, herb pots, the lit pigeon box, the stove chimney, bunting, the roof lights)          250
//   S8Ground the board band (towpath flagstones, the coping, a ring + the boat's rope) and the near band (one value
//            step darker: slabs, ONE drain); joints and courses as tone bands to the lane's VP            250 / 320
//   S8Front  the cafe deck (boards to the VP, two little tables with chairs, mugs + the set's ONE steam, a folded
//            chair, a potted bay, a coiled rope), the planter, the near lamp (a short slate post)          320
// TIERS (CRAFT §b; THROUGHLINE §4 S8): all of it tier C (`<Tier tier="environment">`: the clean pen draws no outline
// and calms the fills). DEPTH (CRAFT §f; conform_L6 §10): far fills recede through S8_ATM (V2S8_depth: the ONE air),
// the near plane one value step darker (onPlane 'near'). LINE (CRAFT §c): no specks, dabs, scattered leaves, crack
// weeds, ripple dashes, glints, crumbs or hatching; big areas flat; iron is slate (S1_IRON), never plum. LIGHT
// (lib/light, RIG_CANAL_S8 from V2S8.tsx's <Lit>: the sun AHEAD, shadows toward us, backlit form): her house's shade
// on the bands as one cast multiply, contact strips under everything that touches the deck, the boat's waterline strip
// (tint water), form steps on the planter and the bay's crown. The lamp pools are the lead's (V2S8_light).
// The lens: one camera model in metres (focal 935 px, eye 1.3 m over the towpath, VP (600, 948)) so the coping,
// the paving, the boat and the deck all recede to the lane's VP; the far bank stands 41 m off across the basin.
import React, {useId, useMemo} from 'react';
import {CM} from '../palette';
import {Fill} from '../../lib/Fill';
import {Tier} from '../../lib/tier';
import {useTime} from '../../lib/time';
import {useExit} from '../../lib/exit';
import {Sky} from '../../lib/sky';
import {CastShadow, ContactShadow, FormShade, Shadow, ShadowLayer} from '../../lib/light';
import {planePalette, recede, seamTone, toneOnTone} from '../../lib/depth';
import {S8_EVENING} from '../world/skies';
import {rng, rand} from '../../lib/rng';
import type {Pt} from '../../lib/sketch';
import * as MAP from '../world/map';
import {Batch, Paint, P, r1, ovalPath, domePath, lobes, lerp, PlaneMap} from '../kit/canal/core';
import type {Quad} from '../kit/canal/core';
import {Puffs, Ducks} from '../kit/canal/life';
import {FarCrowd} from '../kit/cast/Crowd';
import type {FarSpot} from '../kit/cast/Crowd';
import {S1_IRON} from './V2S1_set_core';
import {L, LANE, KERB_Y, NEAR_Y, SKYLINE_MIN_Y, lampRunAt} from './V2S8_clock';
import {EarlyExit} from './V2S8_exit';
import {S8Plane, S8_ATM, onPlane, planeColors} from './V2S8_depth';
import {HOUSE_CONTACTS} from './V2S8_house';

// ---------------------------------------------------------------- colour: CM tokens, flat mixes, planes

const rgbOf = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
/** A flat mix of two CM tokens (STYLE: every fill is a CM token or a flat mix of two). */
const mix = (a: string, b: string, k: number): string => {
  const A = rgbOf(a);
  const B = rgbOf(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};
/** The near plane (-1): one value step darker, hue and chroma kept (lib/depth nearStep via V2S8_depth onPlane). */
const near = (c: string) => onPlane(c, 'near');
/** Tier C iron (V2S1_set_core S1_IRON, the film's slate iron: lamp posts, rings, drains, chair frames; never plum). */
const IRON = S1_IRON;
const IRON_NEAR = near(S1_IRON);
const TONE = {
  copeJoint: seamTone(CM.limestone, 7),
  wood: mix(CM.leafGold, CM.box, 0.42), // the cafe deck: honey boards
  timber: mix(CM.line, CM.brickDeep, 0.3), // planter boards, edge boards
  sett: mix(CM.stucco, CM.paving, 0.5), // her forecourt (one flat sett tone)
};
/** Light sources keep their own colours on every plane (lit panes, bulbs, the lantern glass). */
const isLight = (c: string) => c === CM.lamp || c === CM.lampCore || c === CM.sun;

/** Recolour a batch's fills in place (each layer's colours through `f`, merging what lands on one colour); `ink`
 *  false drops its ink (a far plane is simpler: no lines; the clean pen draws none on tier C anyway). */
function remap(b: Batch, f: (c: string) => string, ink = false): Batch {
  for (const l of b.layers) {
    const fills = new Map<string, string[]>();
    l.fills.forEach((ds, c) => {
      const m = f(c);
      const a = fills.get(m);
      if (a) a.push(...ds);
      else fills.set(m, [...ds]);
    });
    l.fills = fills;
    if (!ink) l.inks = new Map();
  }
  return b;
}
/** Every fill colour a batch uses (window keys `win:<wall>` excluded). */
const fillsOf = (...bs: Batch[]) => {
  const s = new Set<string>();
  for (const b of bs) for (const l of b.layers) l.fills.forEach((_, c) => (c.startsWith('win:') ? s.add(c.slice(4)) : s.add(c)));
  return Array.from(s);
};

// ---------------------------------------------------------------- the lane lens (landing pose, metres)

/** Focal length (px): her door 2.1 m = 180 px at the house front (y 1060, Z 10.85 m). */
const F = 935;
/** Eye height above the towpath (m). */
const EYE = 1.3;
const VX = LANE.vp.x;
const HY = LANE.horizonY;
/** Screen point (landing pose) of a lane point: X m right of the lens axis (- = toward the canal), h m above the
 *  towpath, Z m ahead. */
const cam = (X: number, h: number, Z: number): Pt => [VX + (F * X) / Z, HY + (F * (EYE - h)) / Z];
/** Depth (m) of the towpath under screen y; lateral X (m) of the towpath point under screen (x, y). */
const zAt = (y: number) => (F * EYE) / Math.max(0.5, y - HY);
const xAt = (x: number, y: number) => ((x - VX) * zAt(y)) / F;
/** Our coping: its water edge is the contract line (0, 1290) -> VP; the stones are 0.36 m wide. */
const COPE_X = xAt(0, LANE.copingY0);
const COPE_IN = COPE_X + 0.36;
/** The low sun ahead-left: its azimuth as dX/dZ. Shadows run toward the lens, a little right. */
const SUN_DX = (MAP.SUN8.x - VX) / F;
/** Her house's left corner on the ground (B's row starts at x ~648, ground y 1060): her house's shade line. */
const CORNER = {X: xAt(648, LANE.houseGround), Z: zAt(LANE.houseGround)};
const shadeX = (Z: number) => CORNER.X + SUN_DX * (Z - CORNER.Z);
/** Band depths. */
const Z_KERB = zAt(KERB_Y);
const Z_NEAR = zAt(NEAR_Y);
const Z_HOUSE = zAt(LANE.houseGround);
/** A ground quad (towpath level h): X0..X1 across, Zf (far) .. Zn (near). */
const gq = (X0: number, X1: number, Zf: number, Zn: number, h = 0): Pt[] => [cam(X0, h, Zf), cam(X1, h, Zf), cam(X1, h, Zn), cam(X0, h, Zn)];
/** Points along a line of constant X (a line to the VP) from Za to Zb. */
const runX = (X: number, Za: number, Zb: number, n = 12, h = 0): Pt[] => Array.from({length: n + 1}, (_, i) => cam(X, h, Za + ((Zb - Za) * i) / n));
const yOf = (Z: number) => HY + (F * EYE) / Z;

/** Moves its children with a plane of the multiplane truck and its share of the parallax float (V2S8_depth). */
const OnPlane = S8Plane;

/** OVERSCAN (DIRECTION rule 8, DEPTH.md: >= 40 px past every frame edge at every truck pose and float offset): the
 *  near band's paving and the deck run from x -70 to 1460 (its truck 320 + the float's 6 px), the board band's to 1440. */
const OVER = {x0: -70, near1: 1460, board1: 1440, bottom: 1990} as const;

// ---------------------------------------------------------------- the ground: joints and courses as tone bands

/** A COURSE seam across a ground band at depth Z (screen y = yOf(Z)): a level tone band from the band's left edge
 *  x0(y) to x1(y), its height the joint's 3 cm foreshortened, never under 2.2 px (visible: seamTone dL* 7). */
function courseInto(b: Batch, col: string, Z: number, x0: (y: number) => number, x1: (y: number) => number) {
  const y = yOf(Z);
  const h = Math.max(2.2, (F * EYE * 0.03) / (Z * Z));
  b.poly(col, [[x0(y - h / 2), y - h / 2], [x1(y - h / 2), y - h / 2], [x1(y + h / 2), y + h / 2], [x0(y + h / 2), y + h / 2]]);
}
/** A JOINT running into the picture at lateral X from depth Za (far) to Zb (near): a band 3 cm wide (narrowing
 *  with distance to the lane's VP). */
const jointInto = (b: Batch, col: string, X: number, Za: number, Zb: number) => b.poly(col, gq(X - 0.015, X + 0.015, Za, Zb));
/** Course depths from Zfar to Znear every `d` m (a flagstone's depth). */
const coursesZ = (Zfar: number, Znear: number, d: number): number[] => {
  const out: number[] = [];
  for (let z = Znear + d; z < Zfar - d * 0.4; z += d) out.push(z);
  return out;
};
/** The coping's water edge x at screen y (its line to the VP); its inner edge. */
const copeXAt = (y: number) => cam(COPE_X, 0, zAt(y))[0];
const copeInAt = (y: number) => cam(COPE_IN, 0, zAt(y))[0];

// ================================================================= S8Sky (one continuous sky + the sun, the ONE orange)

/** The low sun ahead, SETTING (critic_L6 MUST 1; S1's model, CRAFT §f "Failures"): (420, 640) r 40, its top at y 600
 *  (out of the caption band), its lower part behind ONE level far roofline at y 646-650 (S8Far's MILL), so a half-disc
 *  sets behind the far rows, its visible base ~30 px over her board's frame top (676-680). A local value until the
 *  integrator moves map SUN8 (REQUEST map.ts: SUN8 -> (420, 640) r 40); the sky's warmth (world/skies S8_EVENING) is
 *  centred under it. */
export const S8_SUN = {x: MAP.SUN8.x, y: 640, r: MAP.SUN8.r} as const;
/** The sky's un-build: it contracts into SUN0 (S1's sun spot, where S1's flood will grow it back out from: the loop's
 *  mirror) over exit e 0.30 -> 0.92, easing in, from a radius that covers every sky corner (and the float's margin). */
const SKY_EXIT = {e0: 0.3, e1: 0.92, r0: 1400} as const;
/** THE SKY (lib/sky; CRAFT §g, DIRECTION rule 6): ONE gentle, dithered gradient (world/skies S8_EVENING: the caption
 *  field's mint flat through the band, a pale warm light band, the sunset horizon behind the far rows, the sun's warmth
 *  low and wide round SUN8), then the sun's disc, a flat shape on top (no halo: the warmth is the sky's). Fixed through
 *  the truck and the float (the sky plane), raw SVG (the clean pen never recolours it), never under a light layer. At
 *  the un-build the disc goes FIRST (EarlyExit, gone by e ~0.2) and the sky contracts into SUN0 (S1's sun: its half-disc
 *  is under the shrinking sky until the last frames), so two suns never share a frame and S1's frame 0 is what is left. */
export const S8Sky: React.FC = () => {
  const e = useExit();
  const id = 's8sky' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const k = Math.min(1, Math.max(0, (e - SKY_EXIT.e0) / (SKY_EXIT.e1 - SKY_EXIT.e0)));
  const r = SKY_EXIT.r0 * (1 - k * k);
  return (
    <Tier tier="environment">
      {k > 0 ? (
        <defs>
          <clipPath id={id} clipPathUnits="userSpaceOnUse">
            <circle cx={MAP.SUN0.x} cy={MAP.SUN0.y} r={Math.max(0, r)} />
          </clipPath>
        </defs>
      ) : null}
      {r > 0 ? (
        <g clipPath={k > 0 ? `url(#${id})` : undefined}>
          <Sky spec={S8_EVENING} />
        </g>
      ) : null}
      <EarlyExit to={0.3}>
        <Fill d={ovalPath(S8_SUN.x, S8_SUN.y, S8_SUN.r, S8_SUN.r)} color={CM.sun} offset={false} seed="s8sun" />
      </EarlyExit>
    </Tier>
  );
};

// ================================================================= S8Far (beyond the bend; far plane 24, depth +2)

/** S8Far's depth plane (CRAFT §f.2: +2 on the sunset band, k .22 toward the air, <= 4 values, nothing under 4 px). */
const FAR_PLANE = 2;
/** The calm zone round the sun (far-plane x at the landing AND before the truck, -24): no mid row there; the low far
 *  skyline (y ~700) behind THE MILL, whose one level roofline cuts the disc. */
const CALM: [number, number] = [346, 532];
/** THE MILL (the sun's roofline; CRAFT §f "Failures": one near-level edge cuts the disc, or it is whole): a long flat-
 *  roofed canal mill on the far rows, its stone coping LEVEL at y 646 across far x 343-538, i.e. across the whole disc
 *  (S8_SUN x 380-460) at the landing AND before the truck (the far plane's -24, plus its float share, 2.4 px). Nothing
 *  stands on it in front of the disc (no stack, pot, gable or notch); its left end abuts the works chimney (x 333-343),
 *  the right terrace (FN, from x ~505) overlaps its right end. Tone-on-tone windows (a real building, never a slab);
 *  the far plane's palette like the rest of S8Far. */
const MILL = {x0: 343, x1: 538, top: 650, cope: 4, win: {w: 6, h: 9, gx: 15, gy: 22, y0: 660}} as const;

/** One row of far buildings: walls, roofs (pitched, mansard, gable, flat with a coping), chimney stacks with pots,
 *  and (o.win >= 4) its window grid as `win:<wall>` fills (tone-on-tone on the wall, set after the plane's palette).
 *  Never above SKYLINE_MIN_Y; every part >= 4 px (plane +2). */
function farRowInto(
  b: Batch,
  o: {x0: number; x1: number; base: number; top: (x: number) => number; seed: string; walls: string[]; roofs: string[]; w: [number, number]; win: number; winTo: number; stack: number; skip?: [number, number]},
) {
  const r = rng(o.seed);
  let x = o.x0 - r.range(0, o.w[1] * 0.5);
  let i = 0;
  while (x < o.x1) {
    const w = r.range(o.w[0], o.w[1]);
    if (o.skip && x + w > o.skip[0] && x < o.skip[1]) {
      x = Math.max(x + 4, o.skip[1]);
      continue;
    }
    const kind = r.weighted([
      ['pitch', 4],
      ['mansard', 2],
      ['flat', 2],
      ['gable', 1],
    ] as const);
    const rh = Math.min(w * 0.3, 19);
    const apex = kind === 'gable' ? rh * 1.15 : kind === 'flat' ? 4 : rh;
    const top = Math.max(o.top(x + w / 2) + r.jitter(4), SKYLINE_MIN_Y + 3 + apex);
    const wall = o.walls[i % o.walls.length];
    const roof = r.pick(o.roofs);
    b.rect(wall, x, top, w + 0.8, o.base - top);
    if (kind === 'pitch') b.poly(roof, [[x - 1.5, top], [x + w * 0.13, top - rh], [x + w * 0.87, top - rh], [x + w + 1.5, top]]);
    else if (kind === 'mansard') b.poly(roof, [[x - 1, top], [x + w * 0.09, top - rh], [x + w * 0.91, top - rh], [x + w + 1, top]]);
    else if (kind === 'gable') b.poly(roof, [[x - 2, top], [x + w / 2, top - rh * 1.15], [x + w + 2, top]]);
    else b.rect(CM.bandSunset, x - 1.5, top - 4, w + 3, 4);
    if (o.stack > 0 && kind !== 'flat') {
      const ns = r.chance(0.45) ? 2 : 1;
      for (let k = 0; k < ns; k++) {
        const cx = x + w * (ns === 1 ? r.range(0.3, 0.7) : k ? r.range(0.72, 0.88) : r.range(0.12, 0.28));
        const cw = Math.max(5, r.range(0.7, 1.15) * o.stack);
        const chh = r.range(0.9, 1.5) * o.stack;
        const ct = Math.max(SKYLINE_MIN_Y + 7, top - rh * 0.75 - chh);
        b.rect(CM.brickLight, cx - cw / 2, ct, cw, top - ct);
      }
    }
    if (o.win >= 4) {
      const ww = o.win;
      const cols = Math.max(1, Math.floor((w - ww) / (ww * 2.3)));
      for (let wy = top + ww * 1.1; wy + ww * 1.5 < Math.min(o.base, o.winTo); wy += ww * 2.6) {
        for (let c = 0; c < cols; c++) b.rect(`win:${wall}`, x + (w - cols * ww * 2.3) / 2 + c * ww * 2.3 + ww * 0.65, wy, ww, ww * 1.5);
      }
    }
    x += w;
    i++;
  }
}

/** A King's-Cross gasholder guide frame, far off: columns round a circle (cosine spacing, >= 4 px), the ring girders
 *  as flat front arcs (4 px), the drum inside if any. No lattice (under 4 px on plane +2). Fills only. */
function gasholderOwn(b: Batch, cx: number, top: number, base: number, r: number, o: {drum?: number; tiers?: number} = {}) {
  const tiers = o.tiers ?? 3;
  const ry = r * 0.09;
  const cw = Math.max(4, r * 0.06);
  const H = base - top;
  const ringY = (k: number) => top + (H * k) / tiers;
  if (o.drum) {
    const dt = base - H * o.drum;
    b.poly(CM.box, [[cx - r * 0.93, dt], [cx + r * 0.93, dt], [cx + r * 0.93, base], [cx - r * 0.93, base]]);
    b.fill(CM.bandSunset, ovalPath(cx, dt, r * 0.93, ry * 0.9));
  }
  b.layer();
  const n = 12;
  for (let k = 0; k <= n / 2; k++) {
    const x = cx - Math.cos((k / (n / 2)) * Math.PI) * r;
    b.rect(CM.brickLight, x - cw / 2, top - ry * 0.4, cw, base - top + ry * 0.4);
  }
  for (let k = 0; k <= tiers; k++) {
    const y = ringY(k);
    const up: Pt[] = [];
    const dn: Pt[] = [];
    for (let a = 0; a <= 24; a++) {
      const px = cx - Math.cos((a / 24) * Math.PI) * (r + cw * 0.5);
      const py = y - Math.sin((a / 24) * Math.PI) * ry;
      up.push([px, py - 2]);
      dn.push([px, py + 2 + (k === 0 ? 1 : 0)]);
    }
    b.poly(CM.brickLight, [...up, ...dn.reverse()]);
  }
}

/** The canal warehouse beyond the bend (left of the calm zone): brick, a stone cornice, arched windows (tone-on-tone),
 *  the loading-door column; and the slim works chimney beside it (it smokes: the set's ONE smoke). */
const WARE = {x0: 244, x1: 330, top: 624, col: [256, 281, 306] as const, rows: [640, 671, 702, 733] as const, chim: {x: 338, w: 10, top: 650}};
const archPath = (x: number, y: number, w: number, h: number) => `M${P(x, y + h)}L${P(x, y + w / 2)}A${r1(w / 2)} ${r1(w / 2)} 0 0 1 ${P(x + w, y + w / 2)}L${P(x + w, y + h)}Z`;

/** The one train over the viaduct: crosses left -> right before the truck (gone by film 37.1), into the warehouse's lee. */
const VIA = {x0: -160, x1: 244, deck: 668, base: 772, pitch: 34};
const TRAIN = {x0: -160, x1: 244, h: 10, t0: L(33.25), speed: 150};

type FarLayout = {back: Batch; front: Batch; pal: (c: string) => string};

function farLayout(): FarLayout {
  const back = new Batch();
  // FB: the low far skyline across the whole width (no windows: under 4 px), very low under the sun
  farRowInto(back, {
    x0: -130,
    x1: 760,
    base: 962,
    top: (x) => (x > CALM[0] - 10 && x < CALM[1] + 10 ? 700 : x < CALM[0] ? 690 : 676),
    seed: 's8far/fb',
    walls: [CM.box, CM.brickLight, CM.bandSunset, CM.box],
    roofs: [CM.brickLight],
    w: [18, 44],
    win: 0,
    winTo: 950,
    stack: 5,
  });
  back.layer();
  // the King's-Cross gasholder triplet (one with its drum), behind the viaduct
  gasholderOwn(back, -46, 622, 820, 54);
  gasholderOwn(back, 74, 612, 830, 64, {drum: 0.62});
  gasholderOwn(back, 196, 630, 820, 46);
  back.layer();
  // the brick viaduct (deck, a stone coping, piers, arches whose openings show the far skyline through)
  const {x0, x1, deck, base, pitch} = VIA;
  const dh = 11;
  back.rect(CM.brickLight, x0, deck, x1 - x0, dh);
  back.rect(CM.bandSunset, x0, deck - 4, x1 - x0, 4);
  for (let x = x0; x < x1; x += pitch) {
    const pw = pitch * 0.26;
    back.rect(CM.brickLight, x, deck + dh - 1, pw, base - deck - dh + 1);
    const ax = x + pw;
    const aw = pitch - pw;
    back.fill(CM.brickLight, `M${P(ax, deck + dh - 1)}L${P(ax + aw, deck + dh - 1)}L${P(ax + aw, deck + dh + aw * 0.55)}A${r1(aw / 2)} ${r1(aw / 2)} 0 0 0 ${P(ax, deck + dh + aw * 0.55)}Z`);
  }
  const front = new Batch();
  // FM: mid buildings (limestone / stucco / light brick), small windows
  farRowInto(front, {
    x0: 236,
    x1: 760,
    base: 962,
    top: (x) => 652 + Math.sin(x * 0.07) * 6,
    seed: 's8far/fm',
    walls: [CM.bandSunset, CM.box, CM.brickLight, CM.bandSunset],
    roofs: [CM.brickLight],
    w: [26, 54],
    win: 0,
    winTo: 800,
    stack: 7,
    skip: CALM,
  });
  front.layer();
  // THE MILL: the sun's one level roofline (a flat roof, a stone coping), tone-on-tone windows below it
  front.rect(CM.brickLight, MILL.x0, MILL.top, MILL.x1 - MILL.x0, 962 - MILL.top);
  front.rect(CM.bandSunset, MILL.x0, MILL.top - MILL.cope, MILL.x1 - MILL.x0, MILL.cope + 1);
  for (let wy = MILL.win.y0; wy + MILL.win.h < 800; wy += MILL.win.gy) {
    for (let wx = MILL.x0 + 8; wx + MILL.win.w < MILL.x1 - 6; wx += MILL.win.gx) front.rect(`win:${CM.brickLight}`, wx, wy, MILL.win.w, MILL.win.h);
  }
  front.layer();
  // the canal warehouse + the works chimney
  front.rect(CM.brickLight, WARE.x0, WARE.top, WARE.x1 - WARE.x0, 962 - WARE.top);
  front.rect(CM.bandSunset, WARE.x0 - 3, WARE.top - 4, WARE.x1 - WARE.x0 + 6, 5);
  for (const y of WARE.rows) for (const cx of WARE.col) front.fill(`win:${CM.brickLight}`, archPath(cx, y, 11, 19));
  const c = WARE.chim;
  front.poly(CM.brickLight, [[c.x - c.w / 2, c.top], [c.x + c.w / 2, c.top], [c.x + c.w / 2 + 2, 962], [c.x - c.w / 2 - 2, 962]]);
  front.layer();
  // FN right: the terrace right of the sun (brick, slate, stacks)
  farRowInto(front, {
    x0: CALM[1],
    x1: 760,
    base: 962,
    top: (x) => 640 + Math.sin(x * 0.05) * 6,
    seed: 's8far/fn',
    walls: [CM.brickLight, CM.box, CM.brickLight, CM.bandSunset],
    roofs: [CM.brick],
    w: [30, 50],
    win: 8,
    winTo: 800,
    stack: 9,
  });
  // one taller stack (x 594)
  front.rect(CM.brickLight, 589, 628, 11, 22);
  // the plane's palette: every material merged to its few close values (lib/depth planePalette; behind her pale house
  // row, L* > 70, CRAFT §f.2 starts the far city at +3's simplicity: 3 values within 12 dE), windows one tone-on-tone
  // step on their own wall (never a dark speck or the lamp colour)
  const cols = fillsOf(back, front);
  const P2 = planePalette(cols, FAR_PLANE, S8_ATM, {values: 3, spread: 12});
  const pal = (col: string): string => (col.startsWith('win:') ? toneOnTone(pal(col.slice(4)), {dE: 3}) : P2[col] ?? recede(col, FAR_PLANE, S8_ATM));
  remap(back, pal);
  remap(front, pal);
  return {back, front, pal};
}

/** The train: five cars (stone, the lead car light brick), clipped to the viaduct's visible run. */
function trainInto(b: Batch, t: number, pal: (c: string) => string) {
  const {x0, x1, h, t0, speed} = TRAIN;
  const deck = VIA.deck - 4;
  const cw = h * 3.6;
  const gap = 2.2;
  const n = 5;
  const head = x0 + (t - t0) * speed;
  if (t < t0 || head - n * (cw + gap) > x1) return;
  for (let k = 0; k < n; k++) {
    const f = head - k * (cw + gap);
    const a = Math.max(x0, f - cw);
    const z = Math.min(x1, f);
    if (z - a < 4) continue;
    b.rect(pal(k === 0 ? CM.brickLight : CM.stucco), a, deck - h, z - a, h);
  }
}

export const S8Far: React.FC = () => {
  const t = useTime();
  const lay = useMemo(farLayout, []);
  const backEl = useMemo(() => <Paint b={lay.back} seed="s8far/back" misreg={false} />, [lay]);
  const frontEl = useMemo(() => <Paint b={lay.front} seed="s8far/front" misreg={false} />, [lay]);
  const tr = new Batch();
  trainInto(tr, t, lay.pal);
  return (
    <Tier tier="environment">
      <OnPlane p="far">
        {backEl}
        <Paint b={tr} seed="s8far/train" misreg={false} />
        {frontEl}
        <EarlyExit>
          <Puffs x={WARE.chim.x} y={WARE.chim.top - 2} seed="s8far/smoke1" kind="smoke" scale={0.42} drift={-20} ceil={610} />
        </EarlyExit>
      </OnPlane>
    </Tier>
  );
};

// ================================================================= S8South (the far bank across the basin; 60, depth +1)

/** The far bank's facade line stands D m off to the left, its towpath a little above our eye: base y at screen x,
 *  px per metre at screen x, screen x of depth Z. */
const SB_D = 41;
const sbBase = (x: number) => HY - 10 * ((VX - x) / VX);
const sbS = (x: number) => Math.max(0.05, (VX - x) / SB_D);
const sbX = (Z: number) => VX - (F * SB_D) / Z;
const kOf = (x: number) => Math.max(0, (VX - x) / VX);
/** The far bank's plane (+1: one step toward the air; lit windows allowed, static). */
const south = (c: string) => (isLight(c) ? c : c.startsWith('win:') ? toneOnTone(recede(c.slice(4), 1, S8_ATM), {dE: 5}) : recede(c, 1, S8_ATM));

type SBld = {x0: number; x1: number; w: number; H: number; kind: 'ware' | 'terr' | 'block'; wall: string; pm: PlaneMap; seed: string};
type STree = {x: number; y: number; s: number; seed: string};
type SLamp = {x: number; y: number; s: number};

/** The far bank's layout (screen px at the landing, south plane): buildings along the bank from x -260 to the VP. */
const SOUTH = (() => {
  const r = rng('s8south/layout');
  const blds: SBld[] = [];
  const trees: STree[] = [];
  const lamps: SLamp[] = [];
  let Z = 44;
  let i = 0;
  while (Z < 2400) {
    const kind = r.weighted([
      ['ware', 3],
      ['terr', 5],
      ['block', 2],
    ] as const);
    const w = kind === 'ware' ? r.range(11, 16) : kind === 'terr' ? r.range(5.2, 7.4) : r.range(9, 12);
    const H = kind === 'ware' ? r.range(13, 15.5) : kind === 'terr' ? r.range(10, 12) : r.range(11, 13.5);
    const x0 = sbX(Z);
    const x1 = sbX(Z + w);
    const quad: Quad = [
      [x0, sbBase(x0) - H * sbS(x0)],
      [x1, sbBase(x1) - H * sbS(x1)],
      [x1, sbBase(x1)],
      [x0, sbBase(x0)],
    ];
    const wall = kind === 'ware' ? r.pick([CM.brickDeep, CM.brick]) : kind === 'terr' ? r.pick([CM.brickLight, CM.brick, CM.brickLight, CM.stucco]) : r.pick([CM.stucco, CM.limestone]);
    blds.push({x0, x1, w, H, kind, wall, pm: new PlaneMap(w, H, quad), seed: `s8sb${i}`});
    Z += w;
    i++;
  }
  // autumn trees on the far towpath every ~20 m (some skipped), tiny lamps every 24 m
  for (let z = 50; z < 900; z += r.range(16, 26)) {
    if (r.chance(0.35)) continue;
    const x = sbX(z);
    trees.push({x, y: sbBase(x), s: sbS(x), seed: `s8sbt${Math.round(z)}`});
  }
  for (let z = 47; z < 1200; z += 24) {
    const x = sbX(z);
    lamps.push({x, y: sbBase(x), s: sbS(x)});
  }
  return {blds, trees, lamps};
})();

/** A facade's windows in local metres: rows of arched (warehouse), sash (terrace) or wide (block) windows. */
function sbWindows(bl: SBld): {q: Pt[]; arch: boolean}[] {
  const out: {q: Pt[]; arch: boolean}[] = [];
  const st = bl.kind === 'terr' ? 3.0 : bl.kind === 'ware' ? 3.3 : 2.9;
  const ww = bl.kind === 'block' ? 1.6 : bl.kind === 'ware' ? 1.15 : 0.95;
  const wh = bl.kind === 'block' ? 1.3 : bl.kind === 'ware' ? 1.75 : 1.55;
  const bay = bl.kind === 'block' ? 2.6 : bl.kind === 'ware' ? 2.5 : 2.3;
  const cols = Math.max(1, Math.floor((bl.w - 0.6) / bay));
  const u0 = (bl.w - cols * bay) / 2 + (bay - ww) / 2;
  for (let v = bl.H - 1.0 - wh; v > 1.3; v -= st) {
    for (let c = 0; c < cols; c++) {
      if (bl.kind === 'ware' && c === Math.floor(cols / 2)) continue; // the loading doors
      out.push({q: bl.pm.q(u0 + c * bay, v, ww, wh), arch: bl.kind === 'ware'});
    }
  }
  return out;
}

export const S8South: React.FC = () => {
  const stat = useMemo(() => {
    const b = new Batch();
    // facades, far first (the near ones overlap them toward the VP); windows STATIC (a fixed lit pattern: nothing on the
    // far bank switches), each unlit pane one tone-on-tone step on its wall, the lit ones lamp-lit
    for (let k = SOUTH.blds.length - 1; k >= 0; k--) {
      const bl = SOUTH.blds[k];
      if (bl.x0 > VX - 2) continue;
      const pm = bl.pm;
      b.poly(bl.wall, pm.q(0, 0, bl.w, bl.H));
      const s = sbS(bl.x0);
      if (bl.kind === 'ware') {
        b.poly(CM.limestone, pm.q(-0.1, 0, bl.w + 0.2, 0.45));
        b.poly(CM.stucco, pm.q(bl.w * 0.15, 0.8, bl.w * 0.7, 0.7));
        b.poly(CM.line, pm.q(bl.w / 2 - 0.65, 1.0, 1.3, bl.H - 1.0)); // loading doors column
      } else if (bl.kind === 'terr') {
        b.poly(CM.stoneShade, pm.q(-0.1, 0, bl.w + 0.2, 0.3));
        for (const u of [0.15, bl.w - 0.85]) b.poly(bl.wall === CM.brick ? CM.brickLight : CM.brick, pm.q(u, -1.3, 0.7, 1.3));
      } else {
        b.poly(CM.limestone, pm.q(-0.1, 0, bl.w + 0.2, 0.4));
        for (let v = 2.7; v < bl.H - 1; v += 2.9) b.poly(CM.limestone, pm.q(0.4, v, bl.w - 0.8, 0.22));
      }
      if (s > 1.5) sbWindows(bl).forEach((w, j) => b.poly(rand(bl.seed, j) < 0.3 ? CM.lamp : `win:${bl.wall}`, w.q));
    }
    b.layer();
    // the far towpath strip (a thin pale band) under the facades
    const tp: Pt[] = [];
    for (let x = -300; x <= VX; x += 40) tp.push([x, sbBase(x) - 1.5 * kOf(x)]);
    for (let x = VX; x >= -300; x -= 40) tp.push([x, sbBase(x) + 4.5 * kOf(x)]);
    b.poly(CM.paving, tp);
    // trees in front (crowns of sage / gold / rust lobes on a trunk)
    for (const tr of SOUTH.trees) {
      if (tr.x > VX - 6) continue;
      const s = tr.s;
      const R = 2.6 * s;
      const cy = tr.y - 6.6 * s;
      const r = rng(tr.seed);
      b.poly(CM.line, [[tr.x - 0.18 * s, tr.y], [tr.x - 0.1 * s, cy], [tr.x + 0.1 * s, cy], [tr.x + 0.18 * s, tr.y]]);
      b.fill(r.pick([CM.sage, CM.leafGold, CM.leafRust, CM.sage]), lobes(tr.x - R, tr.x + R, cy + R * 0.85, R * 1.7, `${tr.seed}/a`, 4));
      b.fill(r.pick([CM.leafGold, CM.coatMustard, CM.leafRust]), lobes(tr.x - R * 0.75, tr.x + R * 0.2, cy + R * 0.2, R * 0.95, `${tr.seed}/b`, 3));
    }
    // benches on the far towpath
    for (const z of [58, 81]) {
      const x = sbX(z);
      const s = sbS(x);
      const y = sbBase(x);
      b.rect(CM.line, x - 0.8 * s, y - 0.5 * s, 1.6 * s, Math.max(3, 0.12 * s));
    }
    // the tiny lamps along the far towpath: lit from the start (every light but the run's is on at sunset)
    b.layer();
    SOUTH.lamps.forEach((lp) => {
      if (lp.x > VX - 8) return;
      const s = lp.s;
      b.rect(IRON, lp.x - Math.max(1, 0.07 * s), lp.y - 3.6 * s, Math.max(2, 0.14 * s), 3.6 * s);
      b.fill(CM.lampCore, ovalPath(lp.x, lp.y - 3.75 * s, Math.max(1.6, 0.2 * s), Math.max(1.8, 0.26 * s)));
    });
    return remap(b, south);
  }, []);
  const statEl = useMemo(() => <Paint b={stat} seed="s8south" misreg={false} />, [stat]);
  const walkers: FarSpot[] = [
    {x: 26, y: sbBase(26) + 1.5, h: 22, vx: 7, wrap: [-50, 200], seed: 's8sbw/1'},
    {x: 138, y: sbBase(138) + 1.5, h: 19, vx: -5.5, wrap: [-50, 200], seed: 's8sbw/2'},
    {x: sbX(58), y: sbBase(sbX(58)) - 0.45 * sbS(sbX(58)), h: 12, sit: true, seed: 's8sbw/3'},
  ];
  return (
    <Tier tier="environment">
      <OnPlane p="south">
        {statEl}
        <EarlyExit>
          <FarCrowd spots={walkers} />
        </EarlyExit>
      </OnPlane>
    </Tier>
  );
};

// ================================================================= S8Water (the canal; 110, depth +0.5) + the house band (160)

/** The far wall of the basin (water plane): its coping (limestone), its brick face, the waterline; y at screen x. */
const farWall = (x: number) => {
  const k = kOf(x);
  const b = sbBase(x);
  return {top: b + 2.5 * k, cope: b + 6.5 * k, foot: b + 18 * k};
};
/** The canal's water field (water plane, landing coords): from the horizon (HY - 6) down to y1, x0..x1. */
const WATER = {x0: -320, x1: 840, y1: 1450};

/** THE CANAL'S WATER, its own piece: ONE flat field (no reflections, ripple dashes or glints drawn by hand), geometry
 *  WATER. Drawn first by S8Water, inside its tier-C water plane. Hidden behind the board and the cafe boat at every
 *  pose but a ~40 x 70 px patch right of the board, so it stays this flat field, not lib/water (the water swap,
 *  2026-10-28, docs/v2/water/SWAPS.md: the seam check found the pop was the un-build order, fixed in S8Water with an
 *  early exit; a lib/water field would not take part in the un-build). */
export const S8Canal: React.FC = () => {
  const el = useMemo(() => {
    const b = new Batch();
    b.rect(recede(CM.water, 0.5, S8_ATM), WATER.x0, HY - 6, WATER.x1 - WATER.x0, WATER.y1 - HY + 6);
    // seed 's8water' layer 0: the un-build's seeded jitter stays what it was when the field shared S8Water's batch
    return <Paint b={b} seed="s8water" misreg={false} />;
  }, []);
  return el;
};

export const S8Water: React.FC = () => {
  const stat = useMemo(() => {
    const b = new Batch();
    // layer 0 is S8Canal's (the water field); the far wall stays on layer 1 (its seeds unchanged)
    b.layer();
    const xs: number[] = [];
    for (let x = WATER.x0; x <= VX; x += 30) xs.push(x);
    xs.push(VX);
    const band = (f: (x: number) => number, g: (x: number) => number): Pt[] => [...xs.map((x) => [x, f(x)] as Pt), ...xs.slice().reverse().map((x) => [x, g(x)] as Pt)];
    // the far wall (the far bank's plane, +1): its shade at the waterline, the brick face, the coping
    b.poly(recede(CM.waterDeep, 1, S8_ATM), band((x) => farWall(x).foot - 1, (x) => farWall(x).foot + 7 * kOf(x)));
    b.poly(recede(CM.brick, 1, S8_ATM), band((x) => farWall(x).cope - 0.5, (x) => farWall(x).foot));
    b.poly(recede(CM.limestone, 1, S8_ATM), band((x) => farWall(x).top, (x) => farWall(x).cope));
    return b;
  }, []);
  const statEl = useMemo(() => <Paint b={stat} seed="s8water" misreg={false} />, [stat]);
  return (
    <Tier tier="environment">
      <OnPlane p="water">
        {/* the water field leaves EARLY in the un-build (gone by e 0.3, while the board still covers it): it exited
            with the rest, so the board's exit bared it as a flat teal band for 2-3 frames (2335-2337) over S1's pale
            frame 0 (the water swap's seam check, docs/v2/water/SWAPS.md) */}
        <EarlyExit to={0.3}>
          <S8Canal />
        </EarlyExit>
        {statEl}
        <EarlyExit>
          <Ducks ducks={[{x: 112, y: 985, size: 19, vx: -2.6, drake: true}, {x: 138, y: 991, size: 17, vx: -2.4}]} seed="s8ducks" x0={-60} x1={220} />
        </EarlyExit>
      </OnPlane>
      <OnPlane p="house">
        <HouseBand />
      </OnPlane>
    </Tier>
  );
};

/** Her house's cast shade on a ground band (the sun ahead-left: it falls toward us, right of the shade line from her
 *  corner): one cast multiply (lib/light Shadow, the rig's tint family), never a hand-picked fill. */
const houseShadeD = (Zf: number, Zn: number, xR: number): string => {
  const a = cam(shadeX(Zf), 0, Zf);
  const z = cam(shadeX(Zn), 0, Zn);
  return `M${P(a[0], a[1] - 1)}L${P(xR, a[1] - 1)}L${P(xR, z[1] + 1)}L${P(z[0], z[1] + 1)}Z`;
};

/** THE HOUSE BAND (house plane 160, y < 1100): the towpath beyond the bend (X COPE_IN .. her corner's X, to the VP),
 *  the towpath in front of the terrace (X < 0), her forecourt (X > 0, y 1060-1100: one flat sett tone with its
 *  courses), the coping to the VP with two mooring rings, her house's shade (a cast multiply). Drawn under S8House. */
const HouseBand: React.FC = () => {
  const el = useMemo(() => {
    const b = new Batch();
    const zFar = 420;
    // the towpath (paving) right of the coping, to the bend line X = CORNER.X, and the forecourt strip to x 1350
    const base: Pt[] = [...runX(COPE_IN, Z_KERB, zFar, 16), [VX + 0.5, HY + 0.6], ...runX(CORNER.X, zFar, Z_HOUSE, 10), [1360, LANE.houseGround - 1], [1360, KERB_Y + 3], [cam(COPE_IN, 0, Z_KERB)[0], KERB_Y + 3]];
    b.poly(CM.paving, base);
    // her forecourt: one flat sett tone (x > ~600 at the landing)
    b.poly(TONE.sett, [cam(0, 0, Z_HOUSE), [1360, LANE.houseGround - 1], [1360, KERB_Y + 3], cam(0, 0, Z_KERB)]);
    // the coping (limestone stones)
    b.poly(CM.limestone, [...runX(COPE_X, Z_KERB, zFar, 16), ...runX(COPE_IN, zFar, Z_KERB, 16)]);
    b.layer();
    // joints and courses as tone bands to the VP (CRAFT §f.4): the towpath's long joints (X every 1.0 m, offset half a
    // pitch from the board band's: the band edge reads as a course), its courses every 0.75 m while they stay >= 6 px
    // apart (to Z ~12 m; past it the joints alone run on to the bend); the forecourt's courses every 0.9 m
    const joint = seamTone(CM.paving, 7);
    for (let X = COPE_IN + 0.5; X < -0.2; X += 1.0) jointInto(b, seamTone(CM.paving, 11), X, 24, Z_KERB);
    for (const z of coursesZ(12.2, Z_KERB, 0.75)) courseInto(b, joint, z, copeInAt, () => VX);
    const sj = seamTone(TONE.sett, 7);
    for (const z of coursesZ(Z_HOUSE, Z_KERB, 0.9)) courseInto(b, sj, z, () => VX, () => 1360);
    // the coping's cross joints (every 0.95 m, a stone each) and its water lip (its edge face, one step down)
    for (let z = Z_KERB + 0.6; z < 40; z += 0.95) b.poly(TONE.copeJoint, [cam(COPE_X + 0.02, 0, z + 0.02), cam(COPE_IN - 0.02, 0, z + 0.02), cam(COPE_IN - 0.02, 0, z - 0.02), cam(COPE_X + 0.02, 0, z - 0.02)]);
    b.poly(seamTone(CM.limestone, 9), [...runX(COPE_X, Z_KERB, 80, 10), ...runX(COPE_X + 0.035, 80, Z_KERB, 10)]);
    // two iron rings on the coping (slate)
    for (const z of [9.4, 13.6]) {
      const [x, y] = cam(COPE_X + 0.16, 0, z);
      const s = F / z;
      b.fill(IRON, ovalPath(x, y, Math.max(4, 0.08 * s), Math.max(2.5, 0.035 * s)));
    }
    // the kerb between the forecourt and the towpath flagstones (horizontal: it slides along itself)
    b.rect(CM.limestone, 600, KERB_Y - 4, 760, 4);
    return <Paint b={b} seed="s8house/band" misreg={false} />;
  }, []);
  return (
    <>
      {el}
      {/* ONE shadow layer for the house band: her house's cast shade, then the forecourt things' contact strips (drawn
          over it inside the layer, so they never double-darken) */}
      <ShadowLayer>
        <Shadow d={houseShadeD(Z_HOUSE, Z_KERB, 1360)} tint="cast" />
        {HOUSE_CONTACTS.map((c, i) => (
          <ContactShadow key={i} x={c.x} y={c.y} w={c.w} h={c.h} />
        ))}
      </ShadowLayer>
    </>
  );
};

// ================================================================= S8Boat (the cafe boat; boat plane 250, depth 0)

/** The boat's side plane stands 0.24 m off our coping; its stern is near (L 0 at Z 2.4 m, off the left edge), its
 *  bow far (L 18.6, behind the board). Heights in m above the towpath. Only L ~1.4-2.8 m ever shows (x 0-150). */
const BOAT = {X: COPE_X - 0.24, Z0: 2.4, len: 18.6, hull: -0.32, gun0: -0.03, gun1: 0.07, roof: 1.07, trim: 1.12};
const bp = (Lm: number, h: number, inn = 0): Pt => cam(BOAT.X - inn, h, BOAT.Z0 + Lm);
/** A rectangle on the boat's side: along L0..L1, up h0..h1 (inn = metres in from the side, - = toward us). */
const bq = (L0: number, L1: number, h0: number, h1: number, inn = 0): Pt[] => [bp(L0, h1, inn), bp(L1, h1, inn), bp(L1, h0, inn), bp(L0, h0, inn)];
/** An ellipse on the side (portholes): centre L, h, radius m. */
const bOval = (Lc: number, hc: number, rad: number, inn = 0): Pt[] =>
  Array.from({length: 14}, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return bp(Lc + Math.cos(a) * rad, hc + Math.sin(a) * rad, inn);
  });
/** The roof lights: a wire on posts along the roof's near edge, bulbs every 0.45 m (near -> far). */
const BULBS = (() => {
  const out: {L: number; h: number}[] = [];
  const posts = [1.15, 4.1, 7.05, 10.0, 12.95];
  for (let p = 0; p < posts.length - 1; p++) {
    const a = posts[p];
    const c = posts[p + 1];
    for (let Lm = a + 0.3; Lm < c - 0.1; Lm += 0.45) {
      const u = (Lm - a) / (c - a);
      out.push({L: Lm, h: 1.75 - Math.sin(u * Math.PI) * 0.17});
    }
  }
  return {posts, bulbs: out};
})();
/** The bunting: a line from a stern pole to a pole far along, small flags hanging. */
const BUNT = {L0: 0.5, L1: 7.6, h0: 2.0, h1: 1.92, sag: 0.2, n: 18};
const buntAt = (u: number): Pt => bp(lerp(BUNT.L0, BUNT.L1, u), lerp(BUNT.h0, BUNT.h1, u) - Math.sin(u * Math.PI) * BUNT.sag, 0.02);
/** The boat's waterline on the water (a cast-strength strip, tint water: never a contact strip on water). */
const BOAT_WATERLINE = (() => {
  const top: Pt[] = [];
  const bot: Pt[] = [];
  for (let k = 0; k <= 12; k++) {
    const Lm = (18.3 * k) / 12;
    const p = bp(Lm, BOAT.hull, 0);
    const q = bp(Lm, BOAT.hull, 0.3);
    top.push([p[0], p[1] - 1]);
    bot.push([q[0], Math.max(q[1], p[1] + 5)]);
  }
  return `M${top.map(([x, y]) => P(x, y)).join('L')}L${bot.reverse().map(([x, y]) => P(x, y)).join('L')}Z`;
})();

export const S8Boat: React.FC = () => {
  const t = useTime();
  const stat = useMemo(() => {
    const b = new Batch();
    const {gun0, gun1, roof, trim, hull} = BOAT;
    // hull (slate), the plum gunwale stripe (the palette's anchor: a boat's livery), the bow sweeping up
    b.poly(CM.paneUnlit, [...bq(0, 17.1, hull, gun0)]);
    b.poly(CM.paneUnlit, [bp(17.1, gun0), bp(18.5, gun1 + 0.22), bp(18.6, gun1 + 0.3), bp(18.3, hull), bp(17.1, hull)]);
    b.poly(CM.anchor, [...bq(0, 17.1, gun0, gun1)]);
    b.poly(CM.anchor, [bp(17.1, gun1), bp(18.62, gun1 + 0.34), bp(18.55, gun1 + 0.22), bp(17.1, gun0)]);
    b.layer();
    // the cabin (oat), a mustard coach line, the roof trim
    b.poly(CM.coatOat, bq(1.0, 15.1, gun1, roof));
    b.poly(CM.coatMustard, bq(1.05, 15.05, roof - 0.12, roof - 0.085));
    b.poly(CM.limestone, bq(0.94, 15.16, roof, trim));
    // the cratch at the bow well, the stern deck's counter
    b.poly(CM.coatSlate, [bp(15.1, roof - 0.1), bp(16.9, gun1 + 0.2), bp(15.1, gun1)]);
    b.poly(CM.line, bq(0.2, 1.0, gun1, gun1 + 0.12));
    b.layer();
    // portholes along the cabin (lit): far ones behind the board, every 1.25 m; a painted panel
    for (let Lm = 3.3; Lm < 14.6; Lm += 1.25) {
      if (Math.abs(Lm - 8.3) < 0.7) {
        b.poly(CM.stucco, bOval(Lm, 0.6, 0.3));
        continue;
      }
      b.poly(CM.coatMustard, bOval(Lm, 0.62, 0.19));
      b.poly(CM.lamp, bOval(Lm, 0.62, 0.14));
    }
    // ---- the strip (x 0-150 at the landing): the menu card (blank slate: no chalk scribbles), the serving hatch
    b.poly(CM.line, bq(1.43, 1.69, 0.26, 0.82));
    b.poly(CM.coatSlate, bq(1.46, 1.66, 0.3, 0.78));
    // the hatch: brick frame, a warm lit interior, a back shelf with jars, a counter with cups
    b.poly(CM.brickDeep, bq(1.76, 2.66, 0.36, 1.0));
    b.poly(CM.lamp, bq(1.82, 2.6, 0.43, 0.95));
    b.poly(CM.line, bq(1.82, 2.6, 0.7, 0.73));
    for (let k = 0; k < 4; k++) {
      const Lj = 1.9 + k * 0.17;
      b.poly([CM.sage, CM.paper, CM.leafRust, CM.paper][k], bq(Lj, Lj + 0.09, 0.73, 0.73 + 0.08 + (k % 2) * 0.03));
    }
    b.poly(CM.stoneShade, bq(2.3, 2.52, 0.45, 0.66)); // the coffee machine
    b.poly(CM.line, bq(1.72, 2.7, 0.37, 0.44)); // the counter
    for (let k = 0; k < 2; k++) {
      const Lc = 1.9 + k * 0.2;
      b.poly(CM.paper, bq(Lc, Lc + 0.09, 0.44, 0.54));
    }
    // the striped awning over the hatch (it leans out toward us)
    for (let k = 0; k < 8; k++) {
      const a = 1.7 + k * 0.125;
      b.poly(k % 2 ? CM.paper : CM.box, [bp(a, 1.1, 0), bp(a + 0.125, 1.1, 0), bp(a + 0.125, 0.97, -0.22), bp(a, 0.97, -0.22)]);
    }
    // a lit porthole past the hatch
    b.poly(CM.coatMustard, bOval(2.86, 0.66, 0.13));
    b.poly(CM.lamp, bOval(2.86, 0.66, 0.095));
    // the rope's T-stud on the gunwale (iron)
    b.poly(IRON, bq(2.18, 2.3, gun1, gun1 + 0.05, -0.04));
    b.layer();
    // ---- the roof (only its near edge shows): herb pots, the pigeon box (lit), the stove chimney, light posts
    const pot = (Lm: number, inn: number, hgt: number, green: string, seed: string) => {
      const a = bp(Lm - 0.09, trim, inn);
      const c = bp(Lm + 0.09, trim, inn);
      const top = bp(Lm, trim + hgt, inn)[1];
      const wpx = c[0] - a[0];
      b.poly(CM.brickDeep, [[a[0] - wpx * 0.12, top], [c[0] + wpx * 0.12, top], [c[0], a[1]], [a[0], a[1]]]);
      b.fill(green, lobes(a[0] - wpx * 0.3, c[0] + wpx * 0.3, top + 1, wpx * 1.1, seed, 3));
    };
    pot(1.5, 0.06, 0.17, CM.sage, 's8boat/p1');
    pot(2.62, 0.08, 0.16, CM.sage, 's8boat/p3');
    // the pigeon box: a little skylight, its side panes lit
    b.poly(CM.line, [bp(2.0, trim, 0.25), bp(2.36, trim, 0.25), bp(2.32, trim + 0.17, 0.3), bp(2.04, trim + 0.17, 0.3)]);
    b.poly(CM.lampCore, [bp(2.06, trim + 0.03, 0.25), bp(2.3, trim + 0.03, 0.25), bp(2.28, trim + 0.13, 0.28), bp(2.08, trim + 0.13, 0.28)]);
    b.poly(CM.limestone, [bp(1.98, trim + 0.17, 0.3), bp(2.38, trim + 0.17, 0.3), bp(2.36, trim + 0.2, 0.32), bp(2.0, trim + 0.2, 0.32)]);
    // the stove chimney (a slate pipe and its cap)
    const ch0 = bp(2.47, trim, 0.13);
    const ch1 = bp(2.47, 1.66, 0.13);
    const cw = (0.055 * F) / (BOAT.Z0 + 2.47);
    b.rect(IRON, ch0[0] - cw / 2, ch1[1], cw, ch0[1] - ch1[1]);
    b.fill(IRON, domePath(ch0[0], ch1[1] + 1, cw * 0.95, cw * 0.55));
    // light posts and the bunting poles (timber)
    for (const Lp of BULBS.posts) {
      const a = bp(Lp, trim, 0.04);
      const z = bp(Lp, 1.8, 0.04);
      b.rect(CM.line, a[0] - 1.5, z[1], 3, a[1] - z[1]);
    }
    for (const Lp of [BUNT.L0, BUNT.L1]) {
      const a = bp(Lp, trim, 0.02);
      const z = bp(Lp, Lp === BUNT.L0 ? BUNT.h0 + 0.04 : BUNT.h1 + 0.04, 0.02);
      b.rect(CM.line, a[0] - 1.5, z[1], 3, a[1] - z[1]);
    }
    return b;
  }, []);
  const statEl = useMemo(() => <Paint b={stat} seed="s8boat" misreg={false} />, [stat]);
  // per frame: the bunting (a slow flutter); the roof lights are on from the start (every light but the run's)
  const f = new Batch();
  const n = BUNT.n;
  for (let k = 0; k < n; k++) {
    const [x, y] = buntAt(k / n);
    const [x2, y2] = buntAt((k + 0.82) / n);
    const s = F / (BOAT.Z0 + lerp(BUNT.L0, BUNT.L1, k / n));
    const sw = Math.sin(t * 2.2 + k * 1.3) * 0.014 * s;
    f.fill([CM.box, CM.sage, CM.coatMustard, CM.paper, CM.blossom][k % 5], `M${P(x, y)}L${P(x2, y2)}L${P((x + x2) / 2 + sw, (y + y2) / 2 + 0.1 * s)}Z`);
  }
  BULBS.bulbs.forEach((q, i) => {
    const [x, y] = bp(q.L, q.h - 0.03, 0.04);
    const s = F / (BOAT.Z0 + q.L);
    f.fill(i % 3 ? CM.lamp : CM.lampCore, ovalPath(x, y + 0.035 * s, 0.03 * s + 1, 0.04 * s + 1));
  });
  const wires = useMemo(() => {
    const wb = new Batch();
    let bl = '';
    for (let k = 0; k <= 24; k++) {
      const [x, y] = buntAt(k / 24);
      bl += `${k ? 'L' : 'M'}${P(x, y)}`;
    }
    let wire = '';
    BULBS.posts.forEach((Lp, p) => {
      if (p === BULBS.posts.length - 1) return;
      const c = BULBS.posts[p + 1];
      for (let k = 0; k <= 8; k++) {
        const u = k / 8;
        const [x, y] = bp(lerp(Lp, c, u), 1.8 - Math.sin(u * Math.PI) * 0.17, 0.04);
        wire += `${k ? 'L' : 'M'}${P(x, y)}`;
      }
    });
    // the wires ARE the things (a tier-C hairline, CRAFT §c)
    wb.ink(bl + wire, 1.2, CM.line, 0, {thing: true});
    return <Paint b={wb} seed="s8boat/wires" misreg={false} />;
  }, []);
  return (
    <Tier tier="environment">
      <OnPlane p="boat">
        <ShadowLayer>
          <Shadow d={BOAT_WATERLINE} tint="water" />
        </ShadowLayer>
        {statEl}
        {wires}
        <EarlyExit>
          <Paint b={f} seed="s8boat/life" misreg={false} />
        </EarlyExit>
      </OnPlane>
    </Tier>
  );
};

// ================================================================= S8Ground (the board band 250 + the near band 320)

/** The mooring ring on our coping (left of the board's legs) and the boat's rope to it. */
const RING = {Z: 3.9, X: COPE_X + 0.17};

const BoardBand: React.FC = () => {
  const el = useMemo(() => {
    const b = new Batch();
    // paving right of the coping (the kerb line at y 1100 is horizontal: it slides along itself)
    b.poly(CM.paving, [...runX(COPE_IN, Z_KERB, Z_NEAR, 10), [OVER.board1, NEAR_Y + 2], [OVER.board1, KERB_Y]]);
    b.poly(CM.limestone, [...runX(COPE_X - 0.02, Z_KERB, Z_NEAR - 0.3, 10), ...runX(COPE_IN, Z_NEAR - 0.3, Z_KERB, 10)]);
    b.layer();
    // the towpath's long joints (X every 1.0 m) and its courses (every 0.6 m) as tone bands to the VP
    const joint = seamTone(CM.paving, 7);
    const right = () => OVER.board1;
    for (let X = COPE_IN + 1.0; X < 9; X += 1.0) jointInto(b, seamTone(CM.paving, 11), X, Z_KERB, Z_NEAR);
    for (const z of coursesZ(Z_KERB, Z_NEAR, 0.6)) courseInto(b, joint, z, copeInAt, right);
    // the coping: cross joints (a stone each), the water lip (its edge face, one step down)
    for (let z = Z_NEAR + 0.2; z < Z_KERB; z += 0.9) b.poly(TONE.copeJoint, [cam(COPE_X + 0.02, 0, z + 0.025), cam(COPE_IN - 0.02, 0, z + 0.025), cam(COPE_IN - 0.02, 0, z - 0.025), cam(COPE_X + 0.02, 0, z - 0.025)]);
    b.poly(seamTone(CM.limestone, 9), [...runX(COPE_X - 0.02, Z_KERB, Z_NEAR - 0.3, 8), ...runX(COPE_X + 0.04, Z_NEAR - 0.3, Z_KERB, 8)]);
    // the mooring ring (iron)
    const [rx, ry] = cam(RING.X, 0, RING.Z);
    const rs = F / RING.Z;
    b.fill(IRON, ovalPath(rx, ry, 0.1 * rs, 0.045 * rs));
    b.fill(CM.limestone, ovalPath(rx, ry, 0.07 * rs, 0.026 * rs));
    return <Paint b={b} seed="s8board/band" misreg={false} />;
  }, []);
  // the boat's rope from its T-stud to the ring (the boat rides the board band: same plane): one band, the thing itself
  const rope = useMemo(() => {
    const b = new Batch();
    const a = bp(2.24, BOAT.gun1 + 0.03, -0.05);
    const z = cam(RING.X, 0.02, RING.Z);
    const up: Pt[] = [];
    const dn: Pt[] = [];
    for (let k = 0; k <= 10; k++) {
      const u = k / 10;
      const x = lerp(a[0], z[0], u) + Math.sin(u * Math.PI) * 4;
      const y = lerp(a[1], z[1], u) + Math.sin(u * Math.PI) * 9;
      up.push([x, y - 2.2]);
      dn.push([x, y + 2.2]);
    }
    b.poly(CM.coatOat, [...up, ...dn.reverse()]);
    return <Paint b={b} seed="s8board/rope" misreg={false} />;
  }, []);
  return (
    <>
      {el}
      <ShadowLayer>
        <Shadow d={houseShadeD(Z_KERB, Z_NEAR - 0.02, OVER.board1)} tint="cast" />
      </ShadowLayer>
      {rope}
    </>
  );
};

/** The near band's ONE drain (a slate grate, foreshortened on the paving): centre x of its far edge, depth Zf. */
const DRAIN = {x: 742, Zf: zAt(1494), w: 0.4, d: 0.24};

const NearBand: React.FC = () => {
  const el = useMemo(() => {
    const b = new Batch();
    // the near paving: one value step darker than her plane's (the nearer ground band, CRAFT §f.4)
    const pave = near(CM.paving);
    b.rect(pave, OVER.x0, NEAR_Y - 2, OVER.near1 - OVER.x0, OVER.bottom - NEAR_Y + 2);
    b.layer();
    // long joints (X every 1.0 m, offset half a pitch from the board band's) and courses every 0.6 m: tone bands to the VP
    const joint = seamTone(pave, 7);
    const zBot = zAt(OVER.bottom);
    for (let X = COPE_IN + 0.5; X < 6; X += 1.0) jointInto(b, seamTone(pave, 11), X, Z_NEAR, zBot);
    for (const z of coursesZ(Z_NEAR, zBot, 0.6)) courseInto(b, joint, z, () => OVER.x0, () => OVER.near1);
    // the drain: a slate frame and its slots, foreshortened
    const X = xAt(DRAIN.x, yOf(DRAIN.Zf));
    b.poly(IRON_NEAR, gq(X - DRAIN.w / 2, X + DRAIN.w / 2, DRAIN.Zf, DRAIN.Zf - DRAIN.d));
    const slot = seamTone(IRON_NEAR, 10);
    for (let k = 0; k < 5; k++) {
      const a = X - DRAIN.w / 2 + (DRAIN.w * (k + 0.3)) / 5;
      b.poly(slot, gq(a, a + (DRAIN.w / 5) * 0.4, DRAIN.Zf - DRAIN.d * 0.15, DRAIN.Zf - DRAIN.d * 0.85));
    }
    return <Paint b={b} seed="s8near/band" misreg={false} />;
  }, []);
  return (
    <>
      {el}
      <ShadowLayer>
        <Shadow d={houseShadeD(Z_NEAR, zAt(OVER.bottom), OVER.near1)} tint="cast" />
      </ShadowLayer>
    </>
  );
};

export const S8Ground: React.FC = () => (
  <Tier tier="environment">
    <OnPlane p="board">
      <BoardBand />
    </OnPlane>
    <OnPlane p="near">
      <NearBand />
    </OnPlane>
  </Tier>
);

// ================================================================= S8Front (the near band's objects; near 320, depth -1)

/** The cafe deck: a timber platform on the towpath at the bottom-left (boards to the lane's VP), its furniture small
 *  and seen a little from above. Every colour on the near plane (one value step darker). */
const DECK = {h: 0.12, Zfar: zAt(1350) * ((EYE - 0.12) / EYE), Xr: -0.05, Xl: -2.6};
const deckP = (X: number, Z: number): Pt => cam(X, DECK.h, Z);
/** The deck's left edge runs far off the frame (x ~-1700 at its near end): every deck shape is cut at x -70 (40 px of
 *  overscan + the float), so its fills keep their real size and un-build like the rest (an off-frame bbox made the deck
 *  a 'slab' that wiped down in the last frames before the seam). Sutherland-Hodgman against one edge. */
const DECK_X0 = OVER.x0;
const clipX = (pts: Pt[], x0 = DECK_X0): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const ain = a[0] >= x0;
    const bin = b[0] >= x0;
    if (ain) out.push(a);
    if (ain !== bin) {
      const u = (x0 - a[0]) / (b[0] - a[0]);
      out.push([x0, a[1] + (b[1] - a[1]) * u]);
    }
  }
  return out;
};

/** The deck's things (landing coords on the near plane). */
const TABLES = [
  {x: 60, y: 1448, R: 64, hgt: 76},
  {x: 405, y: 1700, R: 88, hgt: 84},
];
const CHAIRS: {x: number; y: number; s: number; col: string}[] = [
  {x: -6, y: 1548, s: 1.0, col: CM.coatMustard},
  {x: 128, y: 1552, s: 1.0, col: CM.box},
  {x: 330, y: 1806, s: 1.25, col: CM.sage},
  {x: 486, y: 1812, s: 1.25, col: CM.coatMustard},
];
const BAY = {pot: [[490, 1324], [534, 1324], [529, 1384], [495, 1384]] as Pt[], crown: lobes(484, 540, 1298, 46, 's8deck/bay', 4)};
const ROPE = {x: 186, y: 1806, rx: 70, ry: 23};
const FOLDED = {foot: [566, 1441] as Pt};

/** The deck's boards: one honey field, its edge boards, and its seams every 4 planks (0.25 m) as tone bands to the VP. */
const DeckBoards: React.FC = () => {
  const el = useMemo(() => {
    const b = new Batch();
    const zN = 1.05;
    const zF = DECK.Zfar;
    const wood = near(TONE.wood);
    b.poly(wood, clipX([deckP(DECK.Xl, zF), deckP(DECK.Xr, zF), deckP(DECK.Xr, zN), deckP(DECK.Xl, zN)]));
    b.layer();
    const seam = seamTone(wood, 7);
    for (let X = DECK.Xl + 0.25; X < DECK.Xr - 0.1; X += 0.25) {
      const q = clipX([deckP(X - 0.012, zF), deckP(X + 0.012, zF), deckP(X + 0.012, zN), deckP(X - 0.012, zN)]);
      if (q.length >= 3) b.poly(seam, q);
    }
    // the deck's edge boards: the far edge (horizontal) and the right edge (to the VP)
    const timber = near(TONE.timber);
    b.poly(timber, clipX([deckP(DECK.Xl, zF), deckP(DECK.Xr + 0.04, zF), deckP(DECK.Xr + 0.04, zF - 0.06), deckP(DECK.Xl, zF - 0.06)]));
    b.poly(timber, [deckP(DECK.Xr - 0.04, zF), deckP(DECK.Xr + 0.03, zF), deckP(DECK.Xr + 0.03, zN), deckP(DECK.Xr - 0.04, zN)]);
    return <Paint b={b} seed="s8deck/boards" misreg={false} />;
  }, []);
  return el;
};

/** Contact strips where the deck's things touch the boards (CRAFT §d.6), one multiply layer, before the things. */
const DeckContacts: React.FC = () => (
  <ShadowLayer>
    {TABLES.map((tb, i) => (
      <ContactShadow key={`t${i}`} x={tb.x} y={tb.y + tb.hgt} w={tb.R * 0.8} />
    ))}
    {CHAIRS.map((c, i) => (
      <ContactShadow key={`c${i}`} x={c.x} y={c.y} w={38 * c.s} h={8 * c.s} />
    ))}
    <ContactShadow x={512} y={1384} w={40} />
    <ContactShadow x={FOLDED.foot[0]} y={FOLDED.foot[1]} w={22} h={6} />
    <ContactShadow x={ROPE.x} y={ROPE.y + ROPE.ry * 0.4} w={ROPE.rx * 1.9} h={12} />
  </ShadowLayer>
);

/** The deck's furniture and things (tables, chairs, mugs, the teapot, a plate, the blanket, the potted bay, the folded
 *  chair, the coiled rope), all on the near plane; iron in slate. */
const DeckThings: React.FC = () => {
  const el = useMemo(() => {
    const b = new Batch();
    // the potted bay (small lollipop) at the back-right corner
    b.poly(CM.brickDeep, BAY.pot);
    b.rect(CM.brick, 488, 1324, 48, 6);
    b.rect(CM.line, 509, 1282, 6, 44);
    b.fill(CM.sage, BAY.crown);
    // the folded chair leaning on the deck's edge
    b.poly(CM.line, [[540, 1300], [556, 1298], [574, 1440], [558, 1442]]);
    b.poly(CM.coatOat, [[543, 1310], [554, 1309], [566, 1404], [555, 1406]]);
    b.layer();
    // bistro chairs (seat + back hoop + legs), seen from behind, at the two tables
    const chair = (x: number, y: number, s: number, col: string) => {
      b.rect(IRON, x - 18 * s, y - 26 * s, 3 * s, 26 * s);
      b.rect(IRON, x + 15 * s, y - 26 * s, 3 * s, 26 * s);
      b.rect(IRON, x - 12 * s, y - 24 * s, 3 * s, 22 * s);
      b.rect(IRON, x + 9.5 * s, y - 24 * s, 3 * s, 22 * s);
      b.fill(col, ovalPath(x, y - 27 * s, 20 * s, 6.5 * s));
      b.fill(IRON, `M${P(x - 17 * s, y - 28 * s)}Q${P(x - 18 * s, y - 62 * s)} ${P(x, y - 62 * s)}Q${P(x + 18 * s, y - 62 * s)} ${P(x + 17 * s, y - 28 * s)}L${P(x + 13.5 * s, y - 28 * s)}Q${P(x + 14 * s, y - 57 * s)} ${P(x, y - 57 * s)}Q${P(x - 14 * s, y - 57 * s)} ${P(x - 13.5 * s, y - 28 * s)}Z`);
    };
    chair(CHAIRS[0].x, CHAIRS[0].y, CHAIRS[0].s, CHAIRS[0].col);
    chair(CHAIRS[1].x, CHAIRS[1].y, CHAIRS[1].s, CHAIRS[1].col);
    // the tables: a slate pedestal, a round top seen from a little above
    const table = (x: number, y: number, R: number, hgt: number) => {
      b.rect(IRON, x - 4, y, 8, hgt);
      b.fill(IRON, ovalPath(x, y + hgt, R * 0.38, R * 0.08));
      b.fill(CM.paper, ovalPath(x, y, R, R * 0.32));
      b.fill(CM.limestone, ovalPath(x, y + 3, R * 0.95, R * 0.26));
    };
    for (const tb of TABLES) table(tb.x, tb.y, tb.R, tb.hgt);
    b.layer();
    chair(CHAIRS[2].x, CHAIRS[2].y, CHAIRS[2].s, CHAIRS[2].col);
    chair(CHAIRS[3].x, CHAIRS[3].y, CHAIRS[3].s, CHAIRS[3].col);
    // a blanket (a check throw) over the near chair's back
    b.poly(CM.blossom, [[318, 1726], [346, 1728], [352, 1770], [314, 1772]]);
    b.rect(CM.box, 316, 1744, 34, 6);
    const mug = (x: number, y: number, col: string) => {
      b.rect(col, x - 8, y - 17, 16, 17);
      b.fill(CM.line, ovalPath(x, y - 17, 8, 2.6));
      b.fill(col, `M${P(x + 7, y - 14)}Q${P(x + 15, y - 10)} ${P(x + 7, y - 4)}L${P(x + 7, y - 6.5)}Q${P(x + 11, y - 10)} ${P(x + 7, y - 11.5)}Z`);
    };
    mug(36, 1442, CM.box);
    mug(84, 1448, CM.coatMustard);
    mug(372, 1694, CM.sage);
    mug(432, 1706, CM.box);
    b.fill(CM.coatSlate, domePath(458, 1690, 15, 21)); // the teapot
    b.fill(CM.paper, ovalPath(392, 1716, 19, 6)); // a plate with a slice of cake
    b.poly(CM.leafGold, [[384, 1712], [401, 1714], [393, 1706]]);
    // the coiled rope at the front-left (cut by nothing: a flat coil, its inner turn one step down)
    b.fill(CM.coatOat, ovalPath(ROPE.x, ROPE.y, ROPE.rx, ROPE.ry));
    b.fill(seamTone(CM.coatOat, 8), ovalPath(ROPE.x, ROPE.y + 2, ROPE.rx * 0.74, ROPE.ry * 0.7));
    b.fill(CM.coatOat, ovalPath(ROPE.x, ROPE.y, ROPE.rx * 0.6, ROPE.ry * 0.56));
    b.fill(CM.line, ovalPath(ROPE.x, ROPE.y, ROPE.rx * 0.31, ROPE.ry * 0.3));
    return <Paint b={remap(b, (c) => (isLight(c) ? c : near(c)))} seed="s8deck" misreg={false} />;
  }, []);
  // the lantern jar on the near table: lit from the start (every light but the run's)
  const jar = new Batch();
  jar.rect(near(CM.glass), 52, 1410, 15, 21);
  jar.rect(CM.lamp, 55, 1416, 9, 11);
  jar.rect(IRON_NEAR, 51, 1407, 17, 4);
  return (
    <>
      {el}
      <Paint b={jar} seed="s8deck/jar" misreg={false} />
      <FormShade d={BAY.crown} kind="crescent" />
      <EarlyExit>
        <Puffs x={432} y={1686} seed="s8deck/st2" kind="steam" scale={0.46} drift={-14} ceil={610} />
      </EarlyExit>
    </>
  );
};

/** The planter bottom-right: a timber box (cut by the bottom edge), its soil, an autumn shrub, a few broad grass blades
 *  that sway slowly, a rosemary mass. Fewer, larger things (CRAFT §c). */
const PLANTER = {x0: 860, x1: 1112, top: 1806, y: 1990};
const planterBox = `M${PLANTER.x0} ${PLANTER.top}H${PLANTER.x1}V${PLANTER.y}H${PLANTER.x0}Z`;

const Planter: React.FC = () => {
  const t = useTime();
  const stat = useMemo(() => {
    const b = new Batch();
    const {x0, x1, top, y} = PLANTER;
    b.poly(TONE.timber, [[x0, top], [x1, top], [x1, y], [x0, y]]);
    b.rect(CM.brickDeep, x0 - 4, top - 6, x1 - x0 + 8, 10);
    b.layer();
    // soil, the shrub (rust / gold), a mound of grass behind the rosemary
    b.fill(CM.line, `M${P(x0 + 2, top)}Q${P((x0 + x1) / 2, top - 10)} ${P(x1 - 2, top)}Z`);
    b.fill(CM.sage, lobes(x0 + 92, x1 - 6, top + 2, 120, 's8pl/grass', 4));
    b.fill(mix(CM.sage, CM.shadeCool, 0.22), lobes(x0 + 150, x1 - 8, top + 2, 70, 's8pl/rosemary', 3));
    b.fill(CM.leafRust, lobes(x0 + 4, x0 + 112, top + 4, 100, 's8shrub/a', 4));
    b.fill(CM.leafGold, lobes(x0 + 22, x0 + 92, top - 36, 60, 's8shrub/b', 3));
    return remap(b, near);
  }, []);
  // per frame: six broad grass blades swaying slowly (tier C life: small, slow)
  const b = new Batch();
  const r = rng('s8pl/blades');
  const {x0, x1, top} = PLANTER;
  const blade = near(mix(CM.sage, CM.coatOat, 0.35));
  for (let i = 0; i < 6; i++) {
    const bx = x0 + 110 + ((x1 - x0 - 130) * (i + r.range(0.1, 0.9))) / 6;
    const len = r.range(90, 150);
    const sw = Math.sin(t * 0.9 + i * 0.8) * len * 0.05;
    const tip: Pt = [bx + sw + (i % 2 ? 10 : -10), top - len];
    b.poly(blade, [[bx - 5, top + 4], [bx + sw * 0.4 - 3, top - len * 0.5], tip, [bx + sw * 0.4 + 3, top - len * 0.5], [bx + 5, top + 4]]);
  }
  const statEl = useMemo(() => <Paint b={stat} seed="s8planter" misreg={false} />, [stat]);
  return (
    <>
      {statEl}
      <Paint b={b} seed="s8planter/blades" misreg={false} />
      <FormShade d={planterBox} />
    </>
  );
};

/** THE NEAR LAMP: a short lamp standard on the near band beside the cafe deck (~1.4 m, 1.6 m from the lens: its foot
 *  in frame at y 1700, above the planter), slate (tier C iron, one value step darker on the near plane), 20 px wide, no
 *  swan neck. At the landing its lantern stands in frame at x 1048 (99 px right of W's frame); before the truck
 *  (-320 px) the column (x 718-738) and the lantern (x 714-742, y >= 812) keep >= 24 px off W's frame (y <= 785) and
 *  her walk (x <= 690). The lantern lights ONCE on the run's first switch-on (f2237, lampRunAt('nearPool')); its pool
 *  belongs round its foot (x, foot). `top` = the column's top (under the lantern's cup); `lantern` = its glass box. */
export const NLAMP = {x: 1048, w: 20, top: 878, arm: 878, lantern: {x: 1048, y0: 812, y1: 878, w: 28}, foot: 1700};

const NearLamp: React.FC = () => {
  const t = useTime();
  const el = useMemo(() => {
    const b = new Batch();
    const {x, w, top, lantern: ln, foot} = NLAMP;
    const hw = w / 2;
    // the column (a slight flare to the foot: 20 -> 22 px), one collar, a low plinth on the paving
    b.poly(IRON_NEAR, [[x - hw - 1, foot - 16], [x - hw, top], [x + hw, top], [x + hw + 1, foot - 16]]);
    b.rect(IRON_NEAR, x - hw - 1, 1404, w + 2, 12);
    b.poly(IRON_NEAR, [[x - hw - 6, foot], [x - hw - 3, foot - 18], [x + hw + 3, foot - 18], [x + hw + 6, foot]]);
    // the lantern: the cup under it, the cap over it (a flat top: nothing above y 812)
    b.poly(IRON_NEAR, [[x - ln.w / 2 + 3, ln.y1 - 10], [x + ln.w / 2 - 3, ln.y1 - 10], [x + hw - 2, top + 2], [x - hw + 2, top + 2]]);
    b.poly(IRON_NEAR, [[x - ln.w / 2 - 3, ln.y0 + 8], [x + ln.w / 2 + 3, ln.y0 + 8], [x + ln.w / 2 - 2, ln.y0], [x - ln.w / 2 + 2, ln.y0]]);
    return b;
  }, []);
  const lit = t >= lampRunAt('nearPool'); // on ONCE (flash safety: no flicker)
  const g = new Batch();
  const {x, lantern: ln} = NLAMP;
  g.poly(lit ? CM.lampCore : near(CM.glass), [[x - ln.w / 2, ln.y0 + 8], [x + ln.w / 2, ln.y0 + 8], [x + ln.w / 2 - 4, ln.y1 - 10], [x - ln.w / 2 + 4, ln.y1 - 10]]);
  if (lit) g.poly(CM.lamp, [[x - 6, ln.y0 + 12], [x + 6, ln.y0 + 12], [x + 4, ln.y1 - 14], [x - 4, ln.y1 - 14]]);
  return (
    <>
      <Paint b={g} seed="s8nlamp/glass" misreg={false} />
      <Paint b={el} seed="s8nlamp" misreg={false} />
    </>
  );
};

export const S8Front: React.FC = () => (
  <Tier tier="environment">
    <OnPlane p="near">
      <DeckBoards />
      <DeckContacts />
      <DeckThings />
      <ShadowLayer>
        <ContactShadow x={NLAMP.x} y={NLAMP.foot} w={NLAMP.w + 12} />
        <CastShadow x={NLAMP.x} y={NLAMP.foot} w={NLAMP.w + 6} h={NLAMP.foot - NLAMP.lantern.y0} />
      </ShadowLayer>
      <NearLamp />
      <Planter />
    </OnPlane>
  </Tier>
);
