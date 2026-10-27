// V2S7_set.tsx (lane L5): the SET of V2S7 "Google says", back to front, in WORLD px (the 30.04 pose; V2S7.tsx wraps
// every part in the S7 camera). TREATMENT section 5 row S7 + the bottom third; STYLE.md sections 2-6.
//   S7SkyBand  (screen) the flat sunset band low in the west gap (below y 630; the sky above is World's, = S8's)
//   S7Far      the west gap past the wing's corner: far London roofs in flat depth steps (windows switching, chimney
//              pots, aerials), far street trees, the forecourt's west railing; SUN2 sets behind these roofs (drawn
//              before them, screen-fixed)
//   S7TreeL / S7TreeR   two young London planes (mottled bark, crowns in y 618-884): trunk + limbs, then the crown
//   S7Wing     the kit's WingS7 (plain lit windows, the "Google" canopy, the glass doors on DOOR_KEYS), clipped at
//              y 605 so its roof planting never rises above the band margin (screen y >= 600 under the float)
//   S7Steps    three low treads along the wing's frontage (people sit on them)
//   S7Ground   the forecourt: bands of granite setts between limestone kerbs (joints to VP), a slot drain, leaves
//   S7Bollard  Pip's stone bollard (cap = map BOARD_BOLLARD) and its short shadow
//   S7Basin    the fountain basin (near right): far rim, water, the left end lit by the low sun, the near rim + face
//   S7Cafe*    three bistro tables (cups, saucers, menu cards, a teapot, a vase) and chairs; the people are V2S7_life's
//   S7Rack / S7Planter   Sheffield stands with two bikes; a planter of grasses (the bottom centre)
// Colours: CM role tokens (and flat shadow mixes of them); ink by depth; no gradient, glow, blur or opacity.
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {line, poly, crown as crownD, crownTicks, blob, circle as circleInk, wire as wirePath} from '../../lib/sketch';
import {Batch, Paint, P, Pt, ovalPath, domePath, lobes, leafPath, lerp, rng, shadowInto} from '../kit/canal/core';
import {roofRowInto} from '../kit/canal/far';
import {bikeInto, drainInto} from '../kit/canal/towpath';
import {WingS7} from '../kit/canal/wing';
import {HandLetteredGoogle} from '../kit/canal/lettering';
import {Fill} from '../../lib/Fill';
import {
  WING, SKY_CLIP_Y, STEPS, VP, kAt, alongVP, TREE_L, TREE_R, BOLLARD, BASIN, basinLeftAt, JETS, CAFE, RACK, PLANTER,
  LIGHT, SHADOW_LEN, mixHex, DOOR_KEYS,
} from './V2S7_rig';

// ---------------------------------------------------------------- the clean pen

/** The house line for this set (OWNER_PLAYBOOK 2026-10-27: clean, confident, few lines; no jitter, no sketchy
 *  overshoot, no double strokes): one smooth stroke, ends exact. */
export const pen = (x1: number, y1: number, x2: number, y2: number, seed: string) => line(x1, y1, x2, y2, {seed, over: 'none', jitter: 0.15, drift: 0.08, bow: 0.25, breaks: false});

// ---------------------------------------------------------------- shared tones

/** Shadows are colour: warm plum-turned steps of the ground they fall on (never grey). */
export const SH_PAVING = mixHex(CM.paving, CM.shadeWarm, 0.36);
export const SH_STONE = mixHex(CM.limestone, CM.shadeWarm, 0.3);
const PAVING_DARK = mixHex(CM.paving, CM.brickLight, 0.28);
const JOINT = mixHex(CM.paving, CM.line, 0.55);

const clipId = 's7skyclip';
/** World-space clip: nothing of the set above SKY_CLIP_Y (the band margin stays flat sky under the float). */
export const S7SkyClipDefs: React.FC = () => (
  <defs>
    <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
      <rect x={-400} y={SKY_CLIP_Y} width={1900} height={2400} />
    </clipPath>
  </defs>
);
export const SkyClip: React.FC<{children?: React.ReactNode}> = ({children}) => <g clipPath={`url(#${clipId})`}>{children}</g>;

// ---------------------------------------------------------------- the low sunset band (screen space)

/** The warm afterglow behind the far roofs (a flat band below y 630; World's mint sky and dusk band above it). */
export const S7SkyBand: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    k.rect(CM.bandSunset, -20, 632, 1120, 420);
    return k;
  }, []);
  return <Paint b={b} seed="s7/skyband" misreg={false} />;
};

// ---------------------------------------------------------------- the far plane (west gap)

export const S7Far: React.FC<{t: number}> = ({t}) => {
  const stat = useMemo(() => {
    const b = new Batch();
    const ceil = SKY_CLIP_Y + 2;
    // row 1, farthest: pale stone and limestone, fill only (atmospheric step)
    roofRowInto(b, {x0: -60, x1: 380, base: 800, top: 664, spread: 14, seed: 's7/far1', walls: [CM.stoneShade, CM.limestone, CM.stoneShade, CM.glass], roof: CM.shadeCool, wRange: [36, 92], ceil});
    b.layer();
    // row 2: light brick and stucco, a few lit windows, fill only
    roofRowInto(b, {x0: -60, x1: 380, base: 820, top: 690, spread: 12, seed: 's7/far2', walls: [CM.brickLight, CM.stucco, CM.limestone, CM.brickLight, CM.paving], roof: CM.shadeWarm, wRange: [44, 110], ceil, win: 5});
    b.layer();
    // far street trees in autumn between the rows and the railing (column left of the board)
    const r = rng('s7/fartrees');
    for (let i = 0; i < 6; i++) {
      const x = -30 + i * 34 + r.jitter(8);
      const base = 870 + r.jitter(10);
      const R = r.range(26, 40);
      b.rect(CM.line, x - 2, base - R * 1.2, 4, R * 1.2);
      b.fill(i % 3 === 0 ? CM.leafGold : i % 3 === 1 ? CM.sage : CM.leafRust, blob(x, base - R * 1.5, R, R * 0.9, {seed: `s7/ft${i}`}));
      b.fill(i % 2 ? CM.sage : CM.coatMustard, blob(x + R * 0.3, base - R * 1.2, R * 0.55, R * 0.5, {seed: `s7/ftb${i}`}));
    }
    b.layer();
    // the forecourt's west edge: a low brick wall with railings and a gate pier (beyond it the far street)
    b.rect(CM.brick, -40, 1006, 200, 38);
    b.rect(CM.brickDeep, -40, 1006, 200, 6);
    b.rect(CM.limestone, -40, 1000, 200, 7);
    b.rect(CM.limestone, 84, 952, 22, 92);
    b.rect(CM.stoneShade, 98, 952, 8, 92);
    b.fill(CM.limestone, domePath(95, 952, 14, 10));
    let rail = '';
    for (let x = -36; x < 84; x += 13) rail += `M${P(x, 1000)}L${P(x, 954)}`;
    rail += `M${P(-40, 958)}L${P(84, 958)}M${P(-40, 986)}L${P(84, 986)}`;
    b.ink(rail, 1.6, CM.anchor);
    b.ink(pen(-40, 1000, 160, 1000, 's7/wallTop') + pen(84, 952, 84, 1044, 's7/pier'), INK_PX.hair, CM.ink, 0.2);
    return b;
  }, []);
  // row 3, the nearest far row: brick, its windows switching (sunset), hairline ink
  const near = new Batch();
  roofRowInto(near, {x0: -60, x1: 380, base: 880, top: 712, spread: 14, seed: 's7/far3', walls: [CM.brick, CM.stucco, CM.brickLight, CM.brickDeep], roof: CM.brickDeep, wRange: [60, 130], ink: 0, win: 7, lit: 0.55, t, ceil: SKY_CLIP_Y + 2});
  return (
    <>
      <Paint b={stat} seed="s7/far" misreg={false} />
      <Paint b={near} seed="s7/farnear" />
    </>
  );
};

// ---------------------------------------------------------------- plane trees

type Limb = {a: Pt; c: Pt; w0: number; w1: number};
type Cluster = {x: number; y: number; rx: number; ry: number};
type TreeSpec = {x: number; base: number; trunkTop: number; w: number; limbs: Limb[]; clusters: Cluster[]; seed: string};

const LEAF_TONES = [CM.sage, CM.leafGold, CM.sage, CM.leafRust, CM.coatMustard, CM.sage];

/** A London plane's trunk: tapered, mottled bark in patches (limestone ground, sage, stone shade, paving), the shade
 *  side to the right, loose open ink on the lit side. Then its limbs (fills + ink) up into the crown. */
function trunkInto(b: Batch, s: TreeSpec) {
  const r = rng(`${s.seed}/bark`);
  const wb = s.w;
  const wt = s.w * 0.78;
  const flare = s.w * 0.22;
  const tr: Pt[] = [
    [s.x - wb / 2 - flare, s.base],
    [s.x - wb / 2, s.base - 14],
    [s.x - wt / 2, s.trunkTop],
    [s.x + wt / 2, s.trunkTop],
    [s.x + wb / 2, s.base - 14],
    [s.x + wb / 2 + flare, s.base],
  ];
  b.poly(CM.limestone, tr);
  // limbs first share the bark colour (drawn under the patches)
  for (const L of s.limbs) {
    const dx = L.c[0] - L.a[0];
    const dy = L.c[1] - L.a[1];
    const n = Math.hypot(dx, dy) || 1;
    const nx = -dy / n;
    const ny = dx / n;
    b.poly(CM.limestone, [
      [L.a[0] + nx * L.w0 / 2, L.a[1] + ny * L.w0 / 2],
      [L.c[0] + nx * L.w1 / 2, L.c[1] + ny * L.w1 / 2],
      [L.c[0] - nx * L.w1 / 2, L.c[1] - ny * L.w1 / 2],
      [L.a[0] - nx * L.w0 / 2, L.a[1] - ny * L.w0 / 2],
    ]);
    // the pollard knuckle at the tip
    b.fill(CM.paving, ovalPath(L.c[0], L.c[1], L.w1 * 0.75, L.w1 * 0.6));
  }
  b.layer();
  // mottled patches on the trunk (camouflage plates), clipped by keeping them inside the trunk's width
  const tones = [CM.sage, CM.stoneShade, CM.paving, CM.sage, CM.coatOat];
  const h = s.base - s.trunkTop;
  for (let i = 0; i < 9; i++) {
    const v = (i + r.next() * 0.8) / 9;
    const y = s.trunkTop + h * v;
    const half = lerp(wt, wb, v) / 2;
    const cx = s.x + r.range(-half * 0.55, half * 0.55);
    const rx = Math.min(half * 0.55, r.range(4, 9));
    const ry = r.range(7, 15);
    b.fill(tones[i % tones.length], blob(cx, y, rx, ry, {seed: `${s.seed}/p${i}`, wobble: 0.12}));
  }
  // the shade side (light from the left): a strip down the right of the trunk and the limbs' undersides
  b.poly(CM.stoneShade, [
    [s.x + wt / 2 - wt * 0.3, s.trunkTop],
    [s.x + wt / 2, s.trunkTop],
    [s.x + wb / 2, s.base - 14],
    [s.x + wb / 2 + flare, s.base],
    [s.x + wb / 2 - wb * 0.28, s.base],
  ]);
  // ink: the lit edge (left), a broken right edge, a couple of bark marks; limbs on their top edge
  let d = pen(s.x - wb / 2 - flare * 0.6, s.base, s.x - wt / 2, s.trunkTop, `${s.seed}/tl`);
  for (const L of s.limbs.slice(0, 2)) d += pen(L.a[0] - L.w0 * 0.4, L.a[1], L.c[0] - L.w1 * 0.4, L.c[1], `${s.seed}/l${L.c[0].toFixed(0)}`);
  b.ink(d, INK_PX.far, CM.ink, 0.2);
}

/** The crown: autumn leaf clusters (scalloped, flat, misregistered), a few gaps showing limbs, leaf marks on the rim. */
function crownInto(b: Batch, s: TreeSpec, topMin: number) {
  const r = rng(`${s.seed}/crown`);
  s.clusters.forEach((c, i) => {
    const ry = Math.min(c.ry, (c.y - topMin) / 1.06);
    const col = LEAF_TONES[(i + 1) % LEAF_TONES.length];
    b.fill(col, crownD(c.x, c.y, c.rx, ry, {seed: `${s.seed}/c${i}`, round: 0.7}));
    // an inner light patch on the sun side (left), a darker patch low right
    b.fill(i % 2 ? CM.coatMustard : CM.leafGold, crownD(c.x - c.rx * 0.28, c.y - ry * 0.18, c.rx * 0.45, ry * 0.42, {seed: `${s.seed}/cl${i}`, round: 0.72}));
    if (r.chance(0.6)) b.fill(i % 3 === 0 ? CM.leafRust : mixHex(CM.sage, CM.shadeCool, 0.25), crownD(c.x + c.rx * 0.3, c.y + ry * 0.3, c.rx * 0.38, ry * 0.32, {seed: `${s.seed}/cd${i}`, round: 0.7}));
  });
  b.layer();
  // single leaves on the rim (five-point plane leaves read as small spiky lens shapes at this size)
  s.clusters.forEach((c, i) => {
    const ry = Math.min(c.ry, (c.y - topMin) / 1.06);
    for (let k = 0; k < 5; k++) {
      const a = r.range(0.2, Math.PI - 0.2) + (k % 2 ? 0 : Math.PI * 0.9);
      const lx = c.x + Math.cos(a) * c.rx * r.range(0.85, 1.05);
      const ly = Math.max(topMin + 6, c.y + Math.sin(a) * ry * r.range(0.85, 1.05));
      b.fill(LEAF_TONES[(i + k) % LEAF_TONES.length], leafPath(lx, ly, r.range(10, 15), r.range(3.5, 5), r.range(0, 180)));
    }
  });
  let ticks = '';
  s.clusters.forEach((c, i) => {
    if (i % 2) return;
    const ry = Math.min(c.ry, (c.y - topMin) / 1.06);
    ticks += crownTicks(c.x, c.y, c.rx, ry, {seed: `${s.seed}/t${i}`, n: 2, size: 7});
  });
  b.ink(ticks, INK_PX.hair, mixHex(CM.line, CM.sage, 0.35));
}

const TREE_R_SPEC: TreeSpec = {
  x: TREE_R.x,
  base: TREE_R.base,
  trunkTop: 846,
  w: 30,
  seed: 's7/treeR',
  limbs: [
    {a: [TREE_R.x - 6, 850], c: [TREE_R.x - 64, 744], w0: 16, w1: 9},
    {a: [TREE_R.x + 2, 848], c: [TREE_R.x + 10, 712], w0: 15, w1: 9},
    {a: [TREE_R.x + 6, 852], c: [TREE_R.x + 70, 760], w0: 14, w1: 8},
    {a: [TREE_R.x - 64, 744], c: [TREE_R.x - 78, 690], w0: 9, w1: 6},
  ],
  clusters: [
    {x: 976, y: 690, rx: 44, ry: 48},
    {x: 1030, y: 664, rx: 54, ry: 44},
    {x: 1090, y: 690, rx: 58, ry: 52},
    {x: 962, y: 772, rx: 40, ry: 40},
    {x: 1012, y: 752, rx: 50, ry: 46},
    {x: 1078, y: 790, rx: 56, ry: 50},
    {x: 1000, y: 826, rx: 34, ry: 28},
    {x: 1050, y: 842, rx: 38, ry: 28},
  ],
};

const TREE_L_SPEC: TreeSpec = {
  x: TREE_L.x,
  base: TREE_L.base,
  trunkTop: 862,
  w: 28,
  seed: 's7/treeL',
  limbs: [
    {a: [TREE_L.x - 4, 866], c: [TREE_L.x - 52, 770], w0: 15, w1: 8},
    {a: [TREE_L.x + 2, 864], c: [TREE_L.x + 8, 720], w0: 14, w1: 8},
    {a: [TREE_L.x + 6, 868], c: [TREE_L.x + 66, 762], w0: 13, w1: 8},
    {a: [TREE_L.x + 66, 762], c: [TREE_L.x + 96, 700], w0: 8, w1: 6},
  ],
  clusters: [
    {x: -24, y: 708, rx: 54, ry: 50},
    {x: 46, y: 678, rx: 56, ry: 50},
    {x: 116, y: 690, rx: 52, ry: 52},
    {x: 150, y: 676, rx: 26, ry: 30},
    {x: -10, y: 792, rx: 52, ry: 48},
    {x: 66, y: 772, rx: 52, ry: 46},
    {x: 30, y: 846, rx: 40, ry: 28},
    {x: 96, y: 830, rx: 34, ry: 30},
  ],
};

/** The tree's trunk and limbs (draw the festoon wires and the falling leaves after this, then the crown). */
const TreeTrunk: React.FC<{s: TreeSpec}> = ({s}) => {
  const b = useMemo(() => {
    const k = new Batch();
    trunkInto(k, s);
    return k;
  }, [s]);
  return <Paint b={b} seed={`${s.seed}/trunk`} />;
};
const TreeCrown: React.FC<{s: TreeSpec}> = ({s}) => {
  const b = useMemo(() => {
    const k = new Batch();
    crownInto(k, s, SKY_CLIP_Y + 8);
    return k;
  }, [s]);
  return <Paint b={b} seed={`${s.seed}/crown`} />;
};
export const S7TreeLTrunk: React.FC = () => <TreeTrunk s={TREE_L_SPEC} />;
export const S7TreeLCrown: React.FC = () => <TreeCrown s={TREE_L_SPEC} />;
export const S7TreeRTrunk: React.FC = () => <TreeTrunk s={TREE_R_SPEC} />;
export const S7TreeRCrown: React.FC = () => <TreeCrown s={TREE_R_SPEC} />;

/** The uplighters at the trees' feet: a small fitting, and once lit (the run) a flat lamp patch up the trunk. */
export const S7TreeLights: React.FC<{lit: boolean}> = ({lit}) => {
  const b = new Batch();
  for (const s of [TREE_L_SPEC, TREE_R_SPEC]) {
    const k = kAt(s.base);
    const fx = s.x - s.w * 0.9;
    b.rect(CM.anchor, fx - k * 0.06, s.base - k * 0.05, k * 0.12, k * 0.05);
    if (lit) {
      b.poly(CM.lamp, [
        [s.x - s.w * 0.5 + 2, s.base - 16],
        [s.x + s.w * 0.1, s.base - 18],
        [s.x + s.w * 0.05, s.base - 96],
        [s.x - s.w * 0.36, s.base - 108],
      ]);
      b.fill(CM.lampCore, ovalPath(fx, s.base - k * 0.05, k * 0.05, k * 0.02));
    }
  }
  return <Paint b={b} seed="s7/uplights" misreg={false} />;
};

// ---------------------------------------------------------------- the wing

/** The kit's canal wing at human size (plain lit windows, the "Google" canopy, the doors on the S7 keys). */
export const S7Wing: React.FC<{behindDoor?: React.ReactNode}> = ({behindDoor}) => (
  <SkyClip>
    <WingS7 doorKeys={DOOR_KEYS} behindDoor={behindDoor} />
  </SkyClip>
);

/** PATCH over a K6 kit bug (REQUEST filed): WingFront draws the fins' structure ink AFTER the canopy fascia, so in
 *  the S7 layout the fin lines at x ~768 and ~894 cross the fascia and the second "o" reads as a "b" ("Gobgle").
 *  Paint the fascia's own paper over those two lines (the SAME Fill seed as the kit's fascia, so the same
 *  misregistration) and redraw the kit's hand-lettered "Google" on top (identical strokes: no doubling). */
export const S7CanopyFix: React.FC = () => {
  const F = WING.canopy;
  const strips = [768.2, 894.2].map((x) => `M${P(x - 5, F.y0 + 1)}H${(x + 5).toFixed(1)}V${(F.y1 - 1).toFixed(1)}H${(x - 5).toFixed(1)}Z`).join('');
  return (
    <>
      <Fill d={strips} color={CM.paper} seed={`wingS7/stat/5/${CM.paper}`} />
      <HandLetteredGoogle cx={(F.x0 + F.x1) / 2} baseline={F.y0 + (F.y1 - F.y0) * 0.78} cap={Math.min(40, (F.y1 - F.y0) * 0.86)} />
    </>
  );
};

// ---------------------------------------------------------------- the front steps

export const S7Steps: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const x0 = WING.x0 - 30;
    const x1 = WING.x1 + 20;
    const T = STEPS.treads;
    for (let i = 0; i < T.length - 1; i++) {
      const y0 = T[i];
      const y1 = T[i + 1];
      const nose = Math.max(2.5, (y1 - y0) * 0.32);
      // tread (lit, seen from a little above) then the riser (stucco, raking light from the left)
      k.rect(i === 0 ? CM.limestone : CM.paper, x0, y0, x1 - x0, nose);
      k.rect(CM.stucco, x0, y0 + nose, x1 - x0, y1 - y0 - nose);
      k.rect(SH_STONE, x0, y0 + nose, x1 - x0, 1.6);
    }
    // the steps' west end (lit by the low sun) beyond the board, and their joints
    k.ink(pen(x0, T[0], x1, T[0], 's7/stepTop'), INK_PX.hair, CM.ink, 0.25);
    return k;
  }, []);
  return <Paint b={b} seed="s7/steps" />;
};

// ---------------------------------------------------------------- the forecourt paving

/** Ground depth (m from the lens) of screen y, and back (f = 1800 px at the wing's 25 m). */
const F_GROUND = (1012 - VP.y) * 25;
const depthAt = (y: number) => F_GROUND / Math.max(1e-6, y - VP.y);
const yAtDepth = (d: number) => VP.y + F_GROUND / d;

/** Granary-Square-like paving: E-W bands of small granite setts (0.30 x 0.18 m, running bond, in perspective to VP)
 *  between limestone kerb bands, a slot drain, specks and leaves. The setts read by COLOUR (scattered setts in close
 *  tones, no joint lines): a field made of small things (LIFE_AND_DENSITY section 0), clean (OWNER_PLAYBOOK). */
export const S7Ground: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const r = rng('s7/ground');
    const top = STEPS.treads[STEPS.treads.length - 1];
    k.rect(CM.paving, -60, top, 1200, 1960 - top);
    const gx = (x0g: number, y: number) => VP.x + x0g * kAt(y);
    const quad = (ga: number, gb: number, ya: number, yb: number): Pt[] => [[gx(ga, ya), ya], [gx(gb, ya), ya], [gx(gb, yb), yb], [gx(ga, yb), yb]];
    // bands from the far end (the steps' foot) toward the lens: a limestone kerb band, then a band of setts whose
    // texture is COLOUR (setts in close tones, no joint lines: the owner's clean, few-lines rule)
    const tones = [CM.stucco, CM.limestone, PAVING_DARK, CM.stucco, mixHex(CM.paving, CM.coatOat, 0.5)];
    let d = depthAt(top);
    let band = 0;
    while (d > 7.4) {
      const dk = d - 0.3;
      const ya = yAtDepth(d);
      const yb = yAtDepth(dk);
      k.poly(band % 2 ? CM.limestone : CM.stucco, quad(-12, 12, Math.max(top, ya), yb));
      k.rect(SH_STONE, -60, yb - 1, 1200, Math.max(1.2, (yb - ya) * 0.1));
      d = dk;
      const bandDepth = r.range(1.6, 2.2);
      const dEnd = Math.max(7.0, d - bandDepth);
      // the band's own ground tone (alternating), then setts in other tones scattered over it
      if (band % 2) k.poly(mixHex(CM.paving, CM.stucco, 0.45), quad(-12, 12, yAtDepth(d), yAtDepth(dEnd)));
      let row = 0;
      while (d > dEnd + 0.01) {
        const dn = Math.max(dEnd, d - 0.18);
        const y0 = yAtDepth(d);
        const y1 = yAtDepth(dn);
        if (y1 - y0 >= 4) {
          const off = row % 2 ? 0.15 : 0;
          for (let g = -12 + off; g < 12; g += 0.3) {
            if (gx(g, y0) > 1150 || gx(g + 0.3, y1) < -70) continue;
            if (r.chance(y0 > 1250 ? 0.2 : 0.13)) k.poly(tones[Math.floor(r.next() * tones.length)], quad(g + 0.015, g + 0.285, y0 + 0.8, y1 - 0.8));
          }
        }
        d = dn;
        row++;
      }
      band++;
    }
    // a slot drain across the forecourt (a dark slot with a steel lip)
    const yd = yAtDepth(10.6);
    for (let x = -60; x < 1140; x += 230) {
      k.rect(CM.shadeCool, x + 4, yd, 222, 2.4);
      k.rect(CM.paper, x + 4, yd - 1.4, 222, 1.4);
    }
    // specks and fallen leaves (more near the trees and the bottom)
    k.layer();
    for (let i = 0; i < 50; i++) {
      const y = r.range(top + 10, 1915);
      const sx = r.range(-20, 1100);
      const s = 0.035 * kAt(y);
      k.fill(CM.stoneShade, ovalPath(sx, y, Math.max(1, s * 0.6), Math.max(0.8, s * 0.35)));
    }
    const leafCols = [CM.leafGold, CM.leafRust, CM.coatMustard, CM.leafGold];
    const nearTree = (cx: number, base: number, n: number, spread: number, seed: string) => {
      const q = rng(seed);
      for (let i = 0; i < n; i++) {
        const y = base + q.range(-6, spread * 0.6);
        const x = cx + q.jitter(spread);
        const sz = 0.11 * kAt(y);
        k.fill(leafCols[i % leafCols.length], leafPath(x, y, sz, sz * 0.34, q.range(-40, 40)));
      }
    };
    nearTree(TREE_R.x - 20, TREE_R.base + 8, 20, 130, 's7/leavesR');
    nearTree(TREE_L.x + 30, TREE_L.base + 10, 16, 120, 's7/leavesL');
    for (let i = 0; i < 64; i++) {
      const y = r.range(1240, 1910);
      const x = r.range(-10, 1090);
      const sz = 0.1 * kAt(y);
      k.fill(leafCols[i % leafCols.length], leafPath(x, y, sz, sz * 0.34, r.range(-50, 50)));
    }
    // tree grates (iron, seen from above) round both trunks
    k.layer();
    for (const tr of [TREE_L, TREE_R]) {
      const kk = kAt(tr.base);
      const hw = kk * 0.62;
      const dz = kk * 0.09;
      k.poly(CM.shadeCool, [[tr.x - hw, tr.base - dz], [tr.x + hw, tr.base - dz], [tr.x + hw * 1.08, tr.base + dz], [tr.x - hw * 1.08, tr.base + dz]]);
      let g = '';
      for (let i = 1; i < 7; i++) {
        const u = i / 7;
        g += `M${P(lerp(tr.x - hw, tr.x + hw, u), tr.base - dz + 1)}L${P(lerp(tr.x - hw * 1.08, tr.x + hw * 1.08, u), tr.base + dz - 1)}`;
      }
      k.ink(g, 1.2, CM.paneUnlit);
    }
    drainInto(k, 640, 1690, 70, 's7/drain');
    return k;
  }, []);
  return <Paint b={b} seed="s7/ground" />;
};

// ---------------------------------------------------------------- the ground shadows of standing things

/** Short colour shadows (light from the left): the trees, the bollard (the board's is K3's own BoardShadow). */
export const S7Shadows: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const L: Pt = [LIGHT.x, LIGHT.y];
    shadowInto(k, TREE_R.x + 6, TREE_R.base, 34, SHADOW_LEN * 0.9, L, SH_PAVING);
    shadowInto(k, TREE_L.x + 6, TREE_L.base, 32, SHADOW_LEN * 0.9, L, SH_PAVING);
    shadowInto(k, BOLLARD.x + 4, BOLLARD.base, BOLLARD.w * 1.02, SHADOW_LEN, L, SH_PAVING);
    return k;
  }, []);
  return <Paint b={b} seed="s7/shadows" misreg={false} />;
};

// ---------------------------------------------------------------- Pip's bollard

export const S7Bollard: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const {x, cap, base, w} = BOLLARD;
    const capH = 14;
    const shaftTop = cap + capH;
    // shaft (limestone, lit left, shade right), a base ring, the domed cap
    k.poly(CM.limestone, [[x - w / 2, shaftTop], [x + w / 2, shaftTop], [x + w / 2 + 3, base - 6], [x - w / 2 - 3, base - 6]]);
    k.poly(CM.stoneShade, [[x + w * 0.18, shaftTop], [x + w / 2, shaftTop], [x + w / 2 + 3, base - 6], [x + w * 0.2, base - 6]]);
    k.rect(CM.stucco, x - w / 2 - 5, base - 9, w + 10, 9);
    k.rect(CM.stoneShade, x + w * 0.2, base - 9, w * 0.3 + 5, 9);
    k.fill(CM.limestone, domePath(x, shaftTop + 1, w / 2 + 3, capH + 2));
    k.fill(CM.paper, domePath(x - w * 0.14, shaftTop - 1, w * 0.22, capH * 0.55));
    k.rect(CM.stoneShade, x - w / 2 - 2, shaftTop, w + 4, 3);
    let d = pen(x - w / 2 - 1, shaftTop + 2, x - w / 2 - 3, base - 8, 's7/bol/l');
    d += `M${P(x - w / 2 - 3, shaftTop + 1)}A${(w / 2 + 3).toFixed(1)} ${(capH + 2).toFixed(1)} 0 0 1 ${P(x + w / 2 + 3, shaftTop + 1)}`;
    k.ink(d, INK_PX.mid, CM.ink, 0.18);
    return k;
  }, []);
  return <Paint b={b} seed="s7/bollard" />;
};

// ---------------------------------------------------------------- the fountain basin

/** The basin (static parts). The water's moving glints, ripples and the jets are V2S7_life's S7Water / S7Jets. */
export const S7Basin: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const {farY, nearY, faceY, x1} = BASIN;
    const fl = basinLeftAt(farY);
    const nl = basinLeftAt(nearY);
    const copF = 15;
    const copN = 26;
    const kN = kAt(nearY);
    // the west end's outer face, lit by the low sun (a parallelogram down to the ground)
    const endH = (y: number) => 0.42 * kAt(y);
    k.poly(CM.limestone, [[fl - 18, farY + copF], [fl - 2, farY + copF], [nl - 2, nearY + copN], [nl - 2, nearY + copN + endH(nearY) * 0.9], [fl - 18, farY + copF + endH(farY)]]);
    k.poly(CM.paper, [[fl - 18, farY + copF], [fl - 12, farY + copF], [nl - 16, nearY + copN + 6], [nl - 22, nearY + copN + 4]]);
    // far rim: coping (top), its inner face toward us, a shade line under the nosing
    k.poly(CM.limestone, [[fl - 18, farY], [x1, farY], [x1, farY + copF], [fl - 2, farY + copF]]);
    k.poly(CM.stucco, [[fl, farY + copF], [x1, farY + copF], [x1, farY + copF + 22], [fl + 4, farY + copF + 22]]);
    k.rect(SH_STONE, fl, farY + copF, x1 - fl, 3);
    // the water
    const wTop = farY + copF + 22;
    const wBot = nearY;
    k.poly(CM.water, [[basinLeftAt(wTop) + 4, wTop], [x1, wTop], [x1, wBot], [nl + 4, wBot]]);
    // flat depth bands: the far rim's reflection (deeper) and the sky's (glass) in broken strips
    k.poly(CM.waterDeep, [[basinLeftAt(wTop) + 4, wTop], [x1, wTop], [x1, wTop + 20], [basinLeftAt(wTop + 20) + 4, wTop + 20]]);
    const r = rng('s7/basin');
    for (let i = 0; i < 12; i++) {
      const y = lerp(wTop + 34, wBot - 16, (i + r.next()) / 12);
      const xa = basinLeftAt(y) + 10 + r.range(0, 80);
      const L = r.range(60, 200);
      k.rect(i % 3 === 0 ? CM.glass : CM.waterDeep, xa, y, Math.min(L, x1 - xa), r.range(2.5, 5));
    }
    // the nozzles: small bronze rings on the water
    for (const x of JETS.xs) k.fill(CM.line, ovalPath(x, JETS.y, 9, 3.4));
    // the left end's coping along the receding edge
    k.poly(CM.limestone, [[fl - 18, farY], [fl + 2, farY], [nl + 6, nearY], [nl - 22, nearY]]);
    // near rim: coping (seen from above), the nosing shade, the front face with joints, its base on the paving
    k.poly(CM.limestone, [[nl - 22, nearY], [x1, nearY], [x1, nearY + copN], [nl - 22, nearY + copN]]);
    k.rect(CM.paper, nl - 16, nearY + 3, 120, 5);
    k.rect(SH_STONE, nl - 22, nearY + copN, x1 - nl + 22, 5);
    k.poly(CM.stucco, [[nl - 22, nearY + copN + 5], [x1, nearY + copN + 5], [x1, faceY], [nl - 22, faceY]]);
    let j = '';
    for (let x = nl + 60; x < x1; x += 0.95 * kN) j += `M${P(x, nearY + copN + 8)}L${P(x + r.jitter(1), faceY - 3)}`;
    j += `M${P(nl - 20, (nearY + copN + faceY) / 2 + 6)}L${P(x1, (nearY + copN + faceY) / 2 + 4)}`;
    k.ink(j, 1.6, JOINT);
    k.rect(SH_PAVING, nl - 30, faceY, x1 - nl + 30, 9);
    // ink: the near rim's top edge and its west corner (front plane, 4.8), the far rim's edge (mid), open
    k.ink(pen(nl - 22, nearY, x1 + 10, nearY + 1, 's7/b/nr') + pen(nl - 22, nearY, nl - 22, faceY, 's7/b/nc'), INK_PX.mid, CM.ink, 0.15);
    k.ink(pen(fl - 18, farY, x1, farY, 's7/b/fr') + pen(fl - 18, farY, nl - 22, nearY, 's7/b/le'), INK_PX.far, CM.ink, 0.25);
    return k;
  }, []);
  return <Paint b={b} seed="s7/basin" />;
};

/** The basin's lights (in the run): small lamp dots along the inside of the near rim. */
export const S7BasinLights: React.FC<{lit: boolean}> = ({lit}) => {
  const b = new Batch();
  const y = BASIN.nearY - 6;
  for (let i = 0; i < 6; i++) {
    const x = basinLeftAt(y) + 44 + i * 70;
    b.fill(lit ? CM.lampCore : CM.stoneShade, ovalPath(x, y, 7, 3));
    if (lit) b.fill(CM.lamp, ovalPath(x, y - 9, 5, 9));
  }
  return <Paint b={b} seed="s7/basinLights" misreg={false} />;
};

// ---------------------------------------------------------------- the cafe

type TableSpec = {x: number; top: number; rx: number};

/** A bistro table sized to the people at it (rx px): a marble top seen from a little above, iron pedestal and foot,
 *  cups and saucers, a menu card (a paper tent, no words); the near one also a teapot and a vase with a dahlia. */
function tableInto(b: Batch, T: TableSpec, seed: string, items: 'far' | 'near') {
  const k = (2 * T.rx) / 0.7; // item scale: px per metre of this table
  const rx = T.rx;
  const ry = rx * 0.27;
  const legH = 0.68 * k;
  const iw = items === 'near' ? INK_PX.mid : INK_PX.far;
  b.rect(CM.anchor, T.x - k * 0.022, T.top + ry, k * 0.044, legH);
  b.poly(CM.anchor, [[T.x - k * 0.19, T.top + ry + legH], [T.x + k * 0.19, T.top + ry + legH], [T.x + k * 0.05, T.top + ry + legH - k * 0.05], [T.x - k * 0.05, T.top + ry + legH - k * 0.05]]);
  b.fill(CM.stoneShade, ovalPath(T.x, T.top + Math.max(3, k * 0.02), rx, ry));
  b.fill(CM.limestone, ovalPath(T.x, T.top, rx, ry));
  b.fill(CM.paper, ovalPath(T.x - rx * 0.32, T.top - ry * 0.18, rx * 0.5, ry * 0.5));
  b.ink(`M${P(T.x - rx, T.top)}A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 0 ${P(T.x + rx, T.top)}`, iw * 0.8, CM.ink, 0.2);
  b.layer();
  const r = rng(`${seed}/items`);
  const cup = (cx: number, cy: number, col: string) => {
    b.fill(CM.paper, ovalPath(cx, cy, k * 0.075, k * 0.022));
    b.poly(col, [[cx - k * 0.04, cy - k * 0.075], [cx + k * 0.04, cy - k * 0.075], [cx + k * 0.032, cy - k * 0.006], [cx - k * 0.032, cy - k * 0.006]]);
    b.fill(CM.line, ovalPath(cx, cy - k * 0.075, k * 0.04, k * 0.012));
    b.ink(`M${P(cx + k * 0.04, cy - k * 0.06)}q${(k * 0.03).toFixed(1)} ${(k * 0.01).toFixed(1)} 0 ${(k * 0.035).toFixed(1)}`, Math.max(1.2, iw * 0.4), CM.ink);
  };
  cup(T.x - rx * 0.45, T.top + ry * 0.2, CM.paper);
  cup(T.x + rx * 0.5, T.top + ry * 0.1, r.chance(0.5) ? CM.box : CM.paper);
  const mx = T.x + rx * 0.05;
  const my = T.top - ry * 0.25;
  const mw = k * 0.11;
  const mh = k * 0.14;
  b.poly(CM.paper, [[mx - mw / 2, my], [mx + mw / 2, my], [mx + mw * 0.42, my - mh], [mx - mw * 0.42, my - mh]]);
  b.poly(CM.box, [[mx - mw * 0.42, my - mh], [mx + mw * 0.42, my - mh], [mx + mw * 0.44, my - mh * 0.84], [mx - mw * 0.44, my - mh * 0.84]]);
  b.ink(`M${P(mx - mw / 2, my)}L${P(mx - mw * 0.42, my - mh)}L${P(mx + mw * 0.42, my - mh)}`, Math.max(1.2, iw * 0.4), CM.ink);
  if (items === 'near') {
    const tx = T.x - rx * 0.05;
    const ty = T.top + ry * 0.45;
    b.fill(CM.coatSlate, domePath(tx, ty, k * 0.08, k * 0.1));
    b.rect(CM.coatSlate, tx - k * 0.08, ty - 1, k * 0.16, k * 0.02);
    b.fill(CM.coatSlate, `M${P(tx + k * 0.07, ty - k * 0.04)}L${P(tx + k * 0.15, ty - k * 0.1)}L${P(tx + k * 0.14, ty - k * 0.08)}L${P(tx + k * 0.075, ty - k * 0.01)}Z`);
    b.fill(CM.paneUnlit, ovalPath(tx, ty - k * 0.1, k * 0.015, k * 0.012));
    const vx = T.x + rx * 0.72;
    const vy = T.top - ry * 0.3;
    b.rect(CM.glass, vx - k * 0.018, vy - k * 0.09, k * 0.036, k * 0.09);
    b.ink(`M${P(vx, vy - k * 0.09)}L${P(vx + 2, vy - k * 0.2)}`, 1.4, CM.sage);
    b.fill(CM.box, blob(vx + 2, vy - k * 0.21, k * 0.04, k * 0.032, {seed: `${seed}/dahlia`}));
    b.fill(CM.leafRust, ovalPath(vx + 2, vy - k * 0.21, k * 0.012, k * 0.01));
  }
}

/** A bistro chair sized to its sitter (W = the kit back's width): a bent-wood back hoop and splayed legs in ink
 *  (a thin frame is an ink-only thing), the seat filled only when the chair is empty. */
function chairInto(b: Batch, x: number, seatY: number, W: number, o: {empty?: boolean; color?: string; ink?: number} = {}) {
  const col = o.color ?? CM.line;
  const sw = W * 0.92;
  const back = W * 0.95;
  const legH = W * 1.0;
  const iw = o.ink ?? Math.max(1.6, Math.min(INK_PX.mid, W * 0.03));
  if (o.empty) b.fill(col, ovalPath(x, seatY, sw / 2, Math.max(3, sw * 0.14)));
  let d = `M${P(x - sw * 0.42, seatY + 2)}L${P(x - sw * 0.5, seatY + legH)}M${P(x + sw * 0.42, seatY + 2)}L${P(x + sw * 0.5, seatY + legH)}`;
  d += `M${P(x - sw * 0.2, seatY + 3)}L${P(x - sw * 0.24, seatY + legH * 0.95)}M${P(x + sw * 0.2, seatY + 3)}L${P(x + sw * 0.24, seatY + legH * 0.95)}`;
  b.ink(d, iw, col);
  const hb = `M${P(x - sw * 0.4, seatY)}L${P(x - sw * 0.44, seatY - back)}Q${P(x, seatY - back * 1.18)} ${P(x + sw * 0.44, seatY - back)}L${P(x + sw * 0.4, seatY)}`;
  b.ink(hb, iw * 1.15, col);
  b.ink(`M${P(x - sw * 0.42, seatY - back * 0.55)}Q${P(x, seatY - back * 0.66)} ${P(x + sw * 0.42, seatY - back * 0.55)}`, iw * 0.8, col);
}

/** The far tables T1 and T0 (cut by the left edge) and the empty chairs across them. The sitters come next. */
export const S7CafeBack: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const {t0: T0, t1: T1} = CAFE;
    chairInto(k, T1.x + 4, T1.top - 6, 64, {empty: true, color: CM.coatSlate, ink: INK_PX.hair});
    chairInto(k, T0.x + 6, T0.top - 6, 60, {empty: true, color: CM.line, ink: INK_PX.hair});
    k.layer();
    tableInto(k, T1, 's7/t1', 'far');
    tableInto(k, T0, 's7/t0', 'far');
    return k;
  }, []);
  return <Paint b={b} seed="s7/cafeBack" />;
};

/** The chair backs in front of the T1 sitters (we look at their backs through the hoops), an empty chair pulled out. */
export const S7CafeT1Chairs: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    for (const s of [...CAFE.s1, CAFE.s0]) chairInto(k, s.x, s.seat + 3, s.h * 0.62, {color: s.x > 300 ? CM.coatSlate : CM.line, ink: INK_PX.far});
    chairInto(k, CAFE.t1.x - 110, 1478, 70, {empty: true, color: CM.coatSlate, ink: INK_PX.far});
    return k;
  }, []);
  return <Paint b={b} seed="s7/cafeT1Chairs" />;
};

/** The near table T2 (its top shows above the two near head-backs) and an empty chair pulled out right of it. */
export const S7CafeNear: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const T2 = CAFE.t2;
    chairInto(k, T2.x + 196, 1812, 96, {empty: true, color: CM.coatSlate, ink: INK_PX.far + 0.4});
    k.layer();
    tableInto(k, T2, 's7/t2', 'near');
    return k;
  }, []);
  return <Paint b={b} seed="s7/cafeNear" />;
};

// ---------------------------------------------------------------- the bike rack and the planter

export const S7Rack: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const {base, xs, w, h} = RACK;
    // two bikes leaning on the stands (profile), the stands' tubes (steel, cool slate) in front of the far bike
    bikeInto(k, xs[0] + w * 0.55, base + 4, RACK.R, 's7/bike1', CM.brickDeep, -1);
    k.layer();
    let tube = '';
    for (const x of xs) tube += `M${P(x, base)}L${P(x, base - h + w * 0.28)}Q${P(x, base - h)} ${P(x + w * 0.28, base - h)}L${P(x + w * 0.72, base - h)}Q${P(x + w, base - h)} ${P(x + w, base - h + w * 0.28)}L${P(x + w, base)}`;
    k.ink(tube, 7.5, CM.shadeCool);
    k.ink(tube, 1.4, CM.ink, 0.45);
    for (const x of xs) {
      k.rect(SH_PAVING, x - 4, base - 2, 10, 6);
      k.rect(SH_PAVING, x + w - 4, base - 2, 10, 6);
    }
    k.layer();
    bikeInto(k, xs[1] + w * 0.4, base + 10, RACK.R + 2, 's7/bike2', CM.coatSlate, 1);
    return k;
  }, []);
  return <Paint b={b} seed="s7/rack" misreg={false} />;
};

export const S7Planter: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const {x0, x1, base, h} = PLANTER;
    const r = rng('s7/planter');
    // grasses behind the box's rim: sage masses, rust and gold autumn tufts, oat seed heads (static: no sway)
    k.fill(CM.sage, lobes(x0 + 6, x1 - 6, base - h + 6, h * 1.2, 's7/pl/g1', 6));
    k.fill(CM.leafGold, lobes(x0 + 30, x0 + 110, base - h + 4, h * 0.85, 's7/pl/g2', 3));
    k.fill(CM.leafRust, lobes(x1 - 100, x1 - 24, base - h + 4, h * 0.7, 's7/pl/g3', 3));
    let g = '';
    const n = Math.round((x1 - x0) / 9);
    for (let i = 0; i < n; i++) {
      const bx = x0 + 10 + ((x1 - x0 - 20) * (i + r.next() * 0.5)) / n;
      const L = h * r.range(0.8, 1.6);
      const lean = r.jitter(L * 0.18);
      g += `M${P(bx, base - h + 2)}Q${P(bx + lean * 0.4, base - h - L * 0.5)} ${P(bx + lean, base - h - L)}`;
      if (r.chance(0.3)) k.fill(CM.coatOat, leafPath(bx + lean, base - h - L, 12, 3.6, 80 + r.jitter(20)));
    }
    k.ink(g, 1.8, mixHex(CM.sage, CM.shadeCool, 0.35));
    k.layer();
    // the box: wooden planks with a capping rail
    k.rect(CM.line, x0, base - h, x1 - x0, h);
    k.rect(CM.brickDeep, x0 - 4, base - h - 4, x1 - x0 + 8, 10);
    k.rect(mixHex(CM.line, CM.shadeWarm, 0.35), x1 - (x1 - x0) * 0.22, base - h + 6, (x1 - x0) * 0.22, h - 6);
    let p = '';
    for (let i = 1; i < 4; i++) p += `M${P(x0 + 3, base - h + (h * i) / 4)}L${P(x1 - 3, base - h + (h * i) / 4 + r.jitter(1))}`;
    k.ink(p, 1.3, mixHex(CM.line, CM.brickDeep, 0.5));
    k.ink(pen(x0 - 4, base - h - 4, x1 + 4, base - h - 3, 's7/pl/top') + pen(x0, base - h, x0, base, 's7/pl/l'), INK_PX.mid, CM.ink, 0.2);
    return k;
  }, []);
  return <Paint b={b} seed="s7/planter" />;
};

// ---------------------------------------------------------------- wires (festoons) under the crowns

/** A festoon's wire only (the bulbs are life: V2S7_life S7Festoons). */
export const festoonWire = (from: Pt, to: Pt, sag: number, seed: string) => wirePath(from[0], from[1], to[0], to[1], sag, {seed});

export {TREE_L_SPEC, TREE_R_SPEC, poly, circleInk, alongVP};
