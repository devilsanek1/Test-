// V2S2_Near (lane L2): our bank in S2 (conform_L2 §3, §10; CRAFT §f.4-5; DIRECTION rule 3: things, never a stranger's
// back). Screen px at the pose, FILM seconds. One camera (V2S2_Ground): everything that runs along the canal runs to
// the VP (1400, 700), cross joints are level and foreshorten, things are sized by the ground camera at their base.
//   S2Bank      plane 0: our coping (limestone) along the water edge and the railing (CM.line: posts and rails, never
//               plum), receding to the VP; Pip sits on the coping at its seat (590, 1050), in front of the railing.
//   S2Towpath   plane -1 / -2: York-stone courses as long two-tone bands from the VP (joints dL* 7, bands >= 3 px), the
//               cross joints level and staggered; the nearer rows a value step darker (NEAR_STEPS); a cast-iron drain;
//               a few fallen leaves as flat shapes.
//   S2NearThings  the kiosk's foot (two bundles of papers tied with string, a crate), the dog lying at rest by the kiosk,
//               the planter of grasses cut by the left edge, the slim near lamp (CM.line, x 1030, cut by the right edge;
//               its swan-neck leaves the frame right) with a bike locked to its foot (cut by the bottom-right).
// Tiers: environment (flat fills, no lines); things that ARE lines (the bike's frame and wheels, the string) as thin
// same-hue strokes. The light layers (contact / cast / form) are in V2S2_Light.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {Tier} from '../../lib/tier';
import {nearStep, seamTone} from '../../lib/depth';
import {Batch, Paint, P, Pt as KPt, rng, leafPath} from '../kit/canal/core';
import {CROSS_ROWS, GROUND_VP, LONG_JOINTS, OUR_COPING, OUR_EDGE, fanX, pxPerMAt} from './V2S2_Ground';

type Pt = [number, number];
const poly = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${P(x, y)}`).join('') + 'Z';

// ---------------------------------------------------------------- colours (near = a value step darker per plane)

/** The towpath's two York-stone tones on plane -1 (behind y NEAR_ROW) and -2 (nearer). */
const STONE_A = CM.paving;
const STONE_B = '#ECD3BE'; // a second warm stone, one soft step from the paving (long two-tone bands)
export const PAVE = {
  far: {a: nearStep(STONE_A, -1), b: nearStep(STONE_B, -1)},
  near: {a: nearStep(STONE_A, -2), b: nearStep(STONE_B, -2)},
};
/** Where the nearer value step starts (a cross row near y 1550). */
export const NEAR_ROW = CROSS_ROWS.reduce((best, y) => (Math.abs(y - 1550) < Math.abs(best - 1550) ? y : best), CROSS_ROWS[0]);
/** The railing and the lamp: CM.line (STYLE §2: posts, frames, railings; never plum). */
const IRON = CM.line;

// ---------------------------------------------------------------- our bank: the coping and the railing (plane 0)

/** The railing posts along our edge: one every 1.8 m from the left frame edge toward the VP (x = 1400 - 12726 / z). */
export const RAIL_POSTS: number[] = (() => {
  const out: number[] = [];
  for (let z = 8.4; z < 36; z += 1.8) {
    const x = 1400 - 12726 / z;
    if (x > 1090) break;
    out.push(x);
  }
  return out;
})();

export const S2Bank: React.FC = () => {
  const b = useMemo(() => {
    const b = new Batch();
    const xs: number[] = [];
    for (let x = -60; x <= 1140; x += 30) xs.push(x);
    // the coping: limestone between the water edge and its near side, a thin shaded lip at the water
    const top: Pt[] = xs.map((x) => [x, OUR_EDGE(x)]);
    const bot: Pt[] = xs.map((x) => [x, OUR_COPING(x)]).reverse() as Pt[];
    b.poly(CM.limestone, [...top, ...bot] as KPt[]);
    b.poly(seamTone(CM.limestone, 9), [...top, ...xs.map((x) => [x, OUR_EDGE(x) + Math.max(1.5, pxPerMAt(OUR_EDGE(x)) * 0.05)] as Pt).reverse()] as KPt[]);
    b.layer();
    // the rails (a top rail and a mid rail: the same fan, 1.0 m and 0.5 m up) and the posts
    const rail = (k: number, th: number) => {
      const a: Pt[] = xs.map((x) => [x, OUR_EDGE(x) - pxPerMAt(OUR_EDGE(x)) * k]);
      const c: Pt[] = xs.map((x) => [x, OUR_EDGE(x) - pxPerMAt(OUR_EDGE(x)) * (k - th)] as Pt).reverse();
      b.poly(IRON, [...a, ...c] as KPt[]);
    };
    rail(1.0, 0.045);
    rail(0.52, 0.03);
    for (const x of RAIL_POSTS) {
      const y = OUR_EDGE(x);
      const m = pxPerMAt(y);
      const w = Math.max(2, m * 0.06);
      b.rect(IRON, x - w / 2, y - m * 1.04, w, m * 1.04);
      // a ball finial
      b.fill(IRON, `M${P(x - w * 0.9, y - m * 1.04)}a${(w * 0.9).toFixed(2)} ${(w * 0.9).toFixed(2)} 0 1 1 ${(w * 1.8).toFixed(2)} 0a${(w * 0.9).toFixed(2)} ${(w * 0.9).toFixed(2)} 0 1 1 ${(-w * 1.8).toFixed(2)} 0Z`);
    }
    return b;
  }, []);
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s2bank" misreg={false} />
    </Tier>
  );
};

// ---------------------------------------------------------------- our towpath (plane -1 / -2)

/** The towpath's region: below the coping's near side, inside the frame (+ overscan for the float). */
const TOWPATH_CLIP = (() => {
  const pts: Pt[] = [];
  for (let x = -60; x <= 1140; x += 30) pts.push([x, OUR_COPING(x)]);
  pts.push([1140, 1990], [-60, 1990]);
  return poly(pts);
})();

/** A band along a fan line (from the VP through (xb, 1920)) between rows y0..y1, `w(y)` px wide. */
function fanBand(xb: number, y0: number, y1: number, w: (y: number) => number): string {
  const n = 10;
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const y = y0 + ((y1 - y0) * i) / n;
    const x = fanX(xb, y);
    const hw = w(y) / 2;
    L.push([x - hw, y]);
    R.push([x + hw, y]);
  }
  return poly([...L, ...R.reverse()]);
}

/** The quad between two fan lines, rows y0..y1. */
function fanQuad(xa: number, xb: number, y0: number, y1: number): string {
  return poly([[fanX(xa, y0), y0], [fanX(xb, y0), y0], [fanX(xb, y1), y1], [fanX(xa, y1), y1]]);
}

const S2_TOWPATH_ID = 's2towpathclip';

export const S2Towpath: React.FC<{part: 'far' | 'near'}> = ({part}) => {
  const b = useMemo(() => {
    const b = new Batch();
    const r = rng('s2towpath');
    const yTop = 1040;
    const rows: [number, number, 'far' | 'near'][] = (
      [
        [yTop, NEAR_ROW, 'far'],
        [NEAR_ROW, 1990, 'near'],
      ] as [number, number, 'far' | 'near'][]
    ).filter((r) => r[2] === part);
    const joints = [GROUND_VP[0] + 400, ...LONG_JOINTS]; // the first band starts right of the frame
    // the long two-tone bands between the long joints, each plane its own step
    for (const [y0, y1, plane] of rows) {
      const tone = PAVE[plane];
      for (let k = 0; k < joints.length - 1; k++) b.fill(k % 2 ? tone.b : tone.a, fanQuad(joints[k], joints[k + 1], y0, y1));
    }
    b.layer();
    // the long joints: bands that narrow with distance (2 cm of stone gap: >= 3 px from mid ground, dL* 7)
    for (const [y0, y1, plane] of rows) {
      const seam = seamTone(PAVE[plane].a, 7);
      for (const xb of LONG_JOINTS) b.fill(seam, fanBand(xb, y0, y1, (y) => Math.max(2.2, pxPerMAt(y) * 0.02)));
    }
    // the cross joints: level, staggered (every other course offset), a softer seam (dL* 5)
    CROSS_ROWS.forEach((y, i) => {
      const plane = y < NEAR_ROW ? 'far' : 'near';
      if (plane !== part) return;
      const seam = seamTone(PAVE[plane].a, 5);
      const h = Math.max(1.6, pxPerMAt(y) * 0.012);
      for (let k = i % 2; k < joints.length - 1; k += 2) {
        const xa = fanX(joints[k], y);
        const xc = fanX(joints[k + 1], y);
        b.rect(seam, Math.min(xa, xc), y - h / 2, Math.abs(xc - xa), h);
      }
    });
    b.layer();
    // a cast-iron drain in the paving (foreshortened, a slate frame and its slots)
    if (part === 'near') {
      const y = 1716;
      const m = pxPerMAt(y);
      const cx = 486;
      const w = m * 0.5;
      const d = m * 0.5 * 0.42; // foreshortened depth
      b.fill(CM.coatSlate, poly([[cx - w / 2, y - d / 2], [cx + w / 2, y - d / 2], [cx + w / 2 + 6, y + d / 2], [cx - w / 2 + 6, y + d / 2]]));
      for (let s = 1; s < 6; s++) {
        const xs = cx - w / 2 + (w * s) / 6;
        b.rect(seamTone(CM.coatSlate, 8), xs - 3, y - d / 2 + 5, 6, d - 10);
      }
    }
    // a few fallen leaves lying flat (foreshortened)
    for (let i = 0; i < 11; i++) {
      const y = r.range(1330, 1880);
      const x = r.range(250, 900);
      if ((y < NEAR_ROW ? 'far' : 'near') !== part) continue;
      const s = pxPerMAt(y) * 0.11;
      b.fill(r.pick([CM.leafGold, CM.leafRust, CM.leafGold]), leafPath(x, y, s, s * 0.32, r.range(-30, 30)));
    }
    return b;
  }, [part]);
  return (
    <Tier tier="environment">
      <defs>
        <clipPath id={`${S2_TOWPATH_ID}-${part}`}>
          <path d={TOWPATH_CLIP} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${S2_TOWPATH_ID}-${part})`}>
        <Paint b={b} seed={`s2towpath/${part}`} misreg={false} />
      </g>
    </Tier>
  );
};

// ---------------------------------------------------------------- the near things

/** The things' footprints (screen px at the pose), for the light layer. */
export const NEAR = {
  bundles: [
    {x: 18, y: 1318, w: 66, h: 36},
    {x: 88, y: 1324, w: 58, h: 30},
  ],
  crate: {x: -6, y: 1300, w: 84, h: 52},
  dog: {x: 196, y: 1372, len: 128},
  planter: {x0: -40, x1: 226, rim: 1452, base: 1740},
  lamp: {x: 1030, w: 30, foot: 2000},
  bike: {x: 930, y: 1912, r: 112},
};

/** The lamp's swan-neck: from the post's top it curves right out of the frame (below y 600). */
const LAMP_TOP = 700;

const PlanterGrass: React.FC = () => {
  const {x0, x1, rim} = NEAR.planter;
  const b = useMemo(() => {
    const b = new Batch();
    const r = rng('s2grass');
    // tall grass blades as flat tapered shapes in two sages, leaning a little with the canal wind
    for (let i = 0; i < 34; i++) {
      const x = x0 + 18 + r.range(0, x1 - x0 - 36);
      const h = r.range(120, 230);
      const lean = r.range(-0.18, 0.32);
      const w = r.range(7, 12);
      const tx = x + lean * h;
      const ty = rim + 6 - h;
      const c = r.chance(0.55) ? nearStep(CM.sage, -2) : nearStep('#9DB596', -2);
      b.fill(c, `M${P(x - w / 2, rim + 8)}Q${P(x - w * 0.2 + lean * h * 0.5, rim - h * 0.5)} ${P(tx, ty)}Q${P(x + w * 0.3 + lean * h * 0.55, rim - h * 0.48)} ${P(x + w / 2, rim + 8)}Z`);
      // a seed head on some (a small oval at the tip)
      if (r.chance(0.3)) b.fill(nearStep(CM.leafGold, -1), `M${P(tx - 5, ty + 12)}a5 12 0 1 1 10 0a5 12 0 1 1 -10 0Z`);
    }
    return b;
  }, [x0, x1, rim]);
  return <Paint b={b} seed="s2grass" misreg={false} />;
};

/** The kiosk's foot (plane 0): a crate, two bundles of papers tied with string, the dog lying at rest. */
export const S2KioskFoot: React.FC = () => {
  const b = useMemo(() => {
    const b = new Batch();
    // ---- the kiosk's foot: a crate and two bundles of papers tied with string
    const {crate} = NEAR;
    b.rect(nearStep('#C99052', -1), crate.x, crate.y - crate.h, crate.w, crate.h);
    b.rect(nearStep('#DDB06F', -1), crate.x, crate.y - crate.h, crate.w, crate.h * 0.22);
    b.rect(nearStep('#DDB06F', -1), crate.x, crate.y - crate.h * 0.55, crate.w, crate.h * 0.16);
    for (const p of NEAR.bundles) {
      b.rect(nearStep(CM.paper, -1), p.x, p.y - p.h, p.w, p.h);
      b.rect(nearStep(CM.stucco, -1), p.x, p.y - p.h * 0.32, p.w, p.h * 0.32);
      // the string (a thing that IS a line): two thin bands round the bundle
      b.rect(nearStep(CM.line, -1), p.x + p.w * 0.3, p.y - p.h, 2.4, p.h);
      b.rect(nearStep(CM.line, -1), p.x, p.y - p.h * 0.55, p.w, 2.4);
    }
    b.layer();
    // ---- the dog lying at rest by the kiosk (a russet dog, an oat chest, head on its paws; a plum collar)
    {
      const {x, y, len} = NEAR.dog;
      const k = len / 128;
      const fur = nearStep('#9A5A3E', -1);
      const chest = nearStep(CM.coatOat, -1);
      // body: a long low loaf
      b.fill(fur, `M${P(x, y)}C${P(x - 6 * k, y - 34 * k)} ${P(x + 40 * k, y - 46 * k)} ${P(x + 78 * k, y - 40 * k)}C${P(x + 104 * k, y - 36 * k)} ${P(x + 112 * k, y - 18 * k)} ${P(x + 108 * k, y)}Z`);
      // the head resting on the paws (front), an ear, the muzzle
      b.fill(fur, `M${P(x - 4 * k, y)}C${P(x - 10 * k, y - 26 * k)} ${P(x - 40 * k, y - 30 * k)} ${P(x - 44 * k, y - 12 * k)}L${P(x - 44 * k, y)}Z`);
      b.fill(chest, `M${P(x - 44 * k, y)}C${P(x - 50 * k, y - 8 * k)} ${P(x - 58 * k, y - 6 * k)} ${P(x - 60 * k, y)}Z`);
      b.fill(nearStep('#7A4530', -1), `M${P(x - 18 * k, y - 26 * k)}C${P(x - 10 * k, y - 18 * k)} ${P(x - 8 * k, y - 8 * k)} ${P(x - 16 * k, y - 4 * k)}C${P(x - 22 * k, y - 10 * k)} ${P(x - 24 * k, y - 20 * k)} ${P(x - 18 * k, y - 26 * k)}Z`);
      // paws forward, the tail curled round
      b.fill(chest, `M${P(x - 30 * k, y)}L${P(x + 6 * k, y)}L${P(x + 6 * k, y - 6 * k)}L${P(x - 30 * k, y - 6 * k)}Z`);
      b.fill(fur, `M${P(x + 104 * k, y - 6 * k)}C${P(x + 126 * k, y - 4 * k)} ${P(x + 128 * k, y + 8 * k)} ${P(x + 96 * k, y + 4 * k)}Z`);
      b.fill(CM.coatPlum, `M${P(x - 8 * k, y - 22 * k)}L${P(x - 2 * k, y - 22 * k)}L${P(x - 2 * k, y - 4 * k)}L${P(x - 8 * k, y - 4 * k)}Z`);
    }
    b.layer();
    return b;
  }, []);
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s2kioskfoot" misreg={false} />
    </Tier>
  );
};

export const S2NearThings: React.FC = () => {
  const box = useMemo(() => {
    const b = new Batch();
    // ---- the planter of grasses (cut by the left edge): two wood tones, plank ends
    {
      const {x0, x1, rim, base} = NEAR.planter;
      const wood = nearStep(CM.line, -2);
      const woodLit = nearStep('#B9744E', -2);
      b.rect(wood, x0, rim, x1 - x0, base - rim);
      b.rect(woodLit, x0, rim, x1 - x0, 18);
      for (let k = 1; k < 4; k++) b.rect(seamTone(wood, 7), x0, rim + 18 + ((base - rim - 18) * k) / 4, x1 - x0, 3);
      b.fill(nearStep('#8C6A55', -2), `M${P(x0, rim + 2)}L${P(x1, rim + 2)}L${P(x1 - 6, rim + 12)}L${P(x0, rim + 12)}Z`); // soil
    }
    return b;
  }, []);
  const lampBike = useMemo(() => {
    const b = new Batch();
    // ---- the slim near lamp (CM.line, a step darker: plane -2): the post from below the frame up to the swan-neck,
    // which curves right and leaves the frame at y ~640-680 (never near the band)
    const {x, w} = NEAR.lamp;
    const c = nearStep(IRON, -2);
    b.fill(c, `M${P(x - w * 0.62, 1990)}L${P(x - w * 0.5, LAMP_TOP + 90)}C${P(x - w * 0.5, LAMP_TOP + 20)} ${P(x + 10, LAMP_TOP - 40)} ${P(x + 60, LAMP_TOP - 46)}L${P(1140, LAMP_TOP - 56)}L${P(1140, LAMP_TOP - 56 + w * 0.7)}L${P(x + 62, LAMP_TOP - 46 + w * 0.72)}C${P(x + 24, LAMP_TOP - 38 + w * 0.7)} ${P(x + w * 0.5, LAMP_TOP + 30)} ${P(x + w * 0.5, LAMP_TOP + 90)}L${P(x + w * 0.62, 1990)}Z`);
    b.rect(nearStep(CM.coatMustard, -2), x - w * 0.56, 1220, w * 1.12, 10); // a painted band
    b.rect(c, x - w * 0.8, 1640, w * 1.6, 30); // a collar
    b.layer();
    // ---- the bike locked to the lamp's foot (cut by the bottom-right): wheels and frame are things that ARE lines
    const {x: bx, y: by, r} = NEAR.bike;
    const tyre = nearStep(CM.coatSlate, -2);
    const frame = nearStep(CM.coatMustard, -2);
    const ring = (cx: number, cy: number, rr: number, t: number) =>
      `M${P(cx - rr, cy)}a${rr} ${rr} 0 1 1 ${2 * rr} 0a${rr} ${rr} 0 1 1 ${-2 * rr} 0ZM${P(cx - rr + t, cy)}a${rr - t} ${rr - t} 0 1 0 ${2 * (rr - t)} 0a${rr - t} ${rr - t} 0 1 0 ${-2 * (rr - t)} 0Z`;
    b.fill(tyre, ring(bx - r * 1.2, by, r, 10));
    b.fill(tyre, ring(bx + r * 1.25, by, r, 10));
    const hub1: Pt = [bx - r * 1.2, by];
    const hub2: Pt = [bx + r * 1.25, by];
    const seat: Pt = [bx - r * 0.55, by - r * 1.2];
    const head: Pt = [bx + r * 0.95, by - r * 1.25];
    const crank: Pt = [bx, by];
    const bar = (a: Pt, c2: Pt, th: number) => {
      const dx = c2[0] - a[0];
      const dy = c2[1] - a[1];
      const L = Math.hypot(dx, dy) || 1;
      const nx = (-dy / L) * (th / 2);
      const ny = (dx / L) * (th / 2);
      b.fill(frame, poly([[a[0] + nx, a[1] + ny], [c2[0] + nx, c2[1] + ny], [c2[0] - nx, c2[1] - ny], [a[0] - nx, a[1] - ny]]));
    };
    bar(hub1, seat, 9);
    bar(seat, crank, 9);
    bar(crank, hub1, 8);
    bar(seat, head, 9);
    bar(head, crank, 10);
    bar(head, hub2, 9);
    b.fill(nearStep(CM.anchor, -1), `M${P(seat[0] - 26, seat[1] - 10)}L${P(seat[0] + 22, seat[1] - 12)}L${P(seat[0] + 18, seat[1] - 2)}L${P(seat[0] - 22, seat[1])}Z`); // saddle
    b.fill(frame, poly([[head[0] - 6, head[1] - 22], [head[0] + 40, head[1] - 30], [head[0] + 42, head[1] - 22], [head[0] - 4, head[1] - 14]])); // bars
    // the lock: a short D round the post
    b.fill(nearStep(CM.coatSlate, -2), ring(NEAR.lamp.x, 1600, 26, 6));
    return b;
  }, []);
  return (
    <Tier tier="environment">
      <Paint b={box} seed="s2nearthings" misreg={false} />
      <PlanterGrass />
      <Paint b={lampBike} seed="s2lampbike" misreg={false} />
    </Tier>
  );
};

/** For the review: the region the towpath fills (the depth sheet's ground). */
export const TOWPATH_ROI: [number, number, number, number] = [0, 1360, 1080, 1900];
