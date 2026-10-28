// V2S2_Near (lane L2): our bank in S2 (conform_L2 §3, §10; CRAFT §f.4-5; DIRECTION rule 3: things, never a stranger's
// back). Screen px at the pose, FILM seconds. One camera (V2S2_Ground): everything that runs along the canal runs to
// the VP (1400, 700), cross joints are level and foreshorten, things are sized by the ground camera at their base.
//   S2Bank      plane 0: our coping (limestone) along the water edge, receding to the VP, no railing (the King's Cross
//               towpath: the water stays open); three cast-iron mooring bollards set just back from the edge (CM.line,
//               never plum), Pip's at its seat (590, 1050), two more receding toward the VP.
//   S2Towpath   plane -1: York-stone courses as long two-tone bands from the VP (joints dL* 7, bands >= 3 px), the
//               cross joints level and staggered (the far rows ride the bench's plane in the float, the near rows the
//               things' plane: ONE tone family, no seam across the path); a cast-iron drain; a few fallen leaves.
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

/** The towpath's two York-stone tones, plane -1 (one family over the whole path: a value step across it would read
 *  as a shadow edge). */
const STONE_A = CM.paving;
const STONE_B = '#ECD3BE'; // a second warm stone, one soft step from the paving (long two-tone bands)
const PAVE_TONES = {a: nearStep(STONE_A, -1), b: nearStep(STONE_B, -1)};
export const PAVE = {far: PAVE_TONES, near: PAVE_TONES};
/** Where the float's split runs (a cross row near y 1550): the rows above ride plane -0.5, the rows below plane -1. */
export const NEAR_ROW = CROSS_ROWS.reduce((best, y) => (Math.abs(y - 1550) < Math.abs(best - 1550) ? y : best), CROSS_ROWS[0]);
/** The bollards and the lamp: CM.line (STYLE §2: posts, frames, railings; never plum). */
const IRON = CM.line;
/** The lit (sun, left) face of a CM.line post: one warm step lighter. */
const IRON_LIT = '#B9744E';

// ---------------------------------------------------------------- our bank: the coping and the railing (plane 0)

/** The mooring bollards: Pip's (its top = Pip's seat, 590 1050) and two more on the same line to the VP, 0.46 m tall,
 *  set just back from the coping. Feet on the line through the VP and Pip's bollard's foot. */
const BOLLARD_FOOT = (x: number) => GROUND_VP[1] + ((1098 - GROUND_VP[1]) * (GROUND_VP[0] - x)) / (GROUND_VP[0] - 590);
export const BOLLARDS: {x: number; foot: number; h: number; w: number}[] = [590, 860, 1000].map((x) => {
  const foot = BOLLARD_FOOT(x);
  const m = pxPerMAt(foot);
  return {x, foot, h: m * 0.46, w: m * 0.28};
});

/** A cast-iron bollard: a drum with a domed cap, a neck under it, a lit left face (the low western sun). */
function bollard(b: Batch, x: number, foot: number, h: number, w: number) {
  const top = foot - h;
  const capH = h * 0.2;
  const cw = w * 1.22;
  b.rect(IRON, x - w / 2, top + capH * 0.9, w, h - capH * 0.9);
  b.rect(IRON_LIT, x - w / 2, top + capH * 0.9, Math.max(1.5, w * 0.24), h - capH * 0.9);
  b.rect(seamTone(IRON, 8), x - w * 0.42, top + capH * 0.9, w * 0.84, Math.max(1, h * 0.07)); // the neck
  b.fill(IRON, `M${P(x - cw / 2, top + capH)}C${P(x - cw / 2, top - capH * 0.4)} ${P(x + cw / 2, top - capH * 0.4)} ${P(x + cw / 2, top + capH)}Z`);
  b.fill(IRON_LIT, `M${P(x - cw / 2, top + capH)}C${P(x - cw / 2, top + capH * 0.2)} ${P(x - cw * 0.2, top - capH * 0.15)} ${P(x - cw * 0.08, top - capH * 0.18)}L${P(x - cw * 0.2, top + capH)}Z`);
}

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
    // the bollards, far to near
    for (const o of [...BOLLARDS].reverse()) bollard(b, o.x, o.foot, o.h, o.w);
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
    const yTop = Math.floor(OUR_COPING(1140)) - 4; // the coping's near side at the right edge (the clip trims the rest)
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
  planter: {x0: -40, x1: 226, rim: 1590, base: 1740},
  lamp: {x: 1030, w: 30, foot: 2000},
  bike: {x: 930, y: 1912, r: 112},
};

/** The planter's wood (CM.line a step nearer): the nearest shade at the left edge (the near motes read against it). */
export const PLANTER_WOOD = nearStep(CM.line, -2);

/** The lamp's swan-neck: from the post's top it curves right out of the frame (below y 600). */
const LAMP_TOP = 700;

const PlanterGrass: React.FC = () => {
  const {x0, x1, rim} = NEAR.planter;
  const b = useMemo(() => {
    const b = new Batch();
    const r = rng('s2grass');
    // tall grass blades as flat tapered shapes in two sages, leaning a little with the canal wind
    for (let i = 0; i < 28; i++) {
      const x = x0 + 18 + r.range(0, x1 - x0 - 36);
      const h = r.range(95, 175);
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
    // ---- the dog lying at rest by the kiosk, facing it (left): a russet sphinx pose, the head up, one ear down, an oat
    // muzzle and chest, front legs stretched forward, the haunch a step darker, the tail round the rump; a plum collar
    {
      const {x, y, len} = NEAR.dog;
      const k = len / 128;
      const X = (v: number) => x + v * k;
      const Y = (v: number) => y - v * k;
      const fur = nearStep('#9A5A3E', -1);
      const furDeep = seamTone(fur, 9);
      const chest = nearStep(CM.coatOat, -1);
      // the far legs (a step darker, behind)
      b.fill(furDeep, `M${P(X(-6), Y(0))}L${P(X(-44), Y(0))}L${P(X(-44), Y(7))}L${P(X(-6), Y(9))}Z`);
      // body: shoulders up at the front, a long back, the rump rounded at the rear
      b.fill(fur, `M${P(X(-8), Y(0))}C${P(X(-12), Y(24))} ${P(X(-2), Y(40))} ${P(X(16), Y(40))}C${P(X(50), Y(38))} ${P(X(78), Y(36))} ${P(X(96), Y(34))}C${P(X(118), Y(32))} ${P(X(122), Y(8))} ${P(X(112), Y(0))}Z`);
      // the haunch (the near hind leg folded)
      b.fill(furDeep, `M${P(X(70), Y(0))}C${P(X(70), Y(22))} ${P(X(104), Y(28))} ${P(X(110), Y(12))}C${P(X(112), Y(4))} ${P(X(104), Y(0))} ${P(X(96), Y(0))}Z`);
      // the near front leg stretched forward, an oat paw
      b.fill(fur, `M${P(X(4), Y(0))}L${P(X(-40), Y(0))}C${P(X(-44), Y(0))} ${P(X(-44), Y(9))} ${P(X(-40), Y(9))}L${P(X(6), Y(11))}Z`);
      b.fill(chest, `M${P(X(-40), Y(0))}C${P(X(-46), Y(0))} ${P(X(-47), Y(9))} ${P(X(-40), Y(9))}L${P(X(-32), Y(9))}L${P(X(-32), Y(0))}Z`);
      // the neck and the head, up
      b.fill(fur, `M${P(X(-6), Y(26))}C${P(X(-10), Y(46))} ${P(X(-14), Y(58))} ${P(X(-22), Y(64))}C${P(X(-34), Y(70))} ${P(X(-44), Y(62))} ${P(X(-42), Y(52))}C${P(X(-40), Y(42))} ${P(X(-28), Y(34))} ${P(X(-18), Y(24))}Z`);
      // the muzzle (oat), pointing left, a dark nose
      b.fill(chest, `M${P(X(-38), Y(60))}C${P(X(-48), Y(60))} ${P(X(-58), Y(56))} ${P(X(-60), Y(51))}C${P(X(-58), Y(46))} ${P(X(-48), Y(45))} ${P(X(-38), Y(48))}Z`);
      b.fill(CM.anchor, `M${P(X(-61), Y(53))}a${(3.2 * k).toFixed(2)} ${(2.6 * k).toFixed(2)} 0 1 1 ${(6.4 * k).toFixed(2)} 0a${(3.2 * k).toFixed(2)} ${(2.6 * k).toFixed(2)} 0 1 1 ${(-6.4 * k).toFixed(2)} 0Z`);
      // the oat chest under the neck
      b.fill(chest, `M${P(X(-18), Y(24))}C${P(X(-26), Y(30))} ${P(X(-30), Y(20))} ${P(X(-24), Y(10))}L${P(X(-10), Y(10))}Z`);
      // the ear: a dark flap down the side of the head
      b.fill(furDeep, `M${P(X(-20), Y(66))}C${P(X(-12), Y(62))} ${P(X(-8), Y(50))} ${P(X(-12), Y(42))}C${P(X(-18), Y(46))} ${P(X(-24), Y(56))} ${P(X(-20), Y(66))}Z`);
      // the collar
      b.fill(CM.coatPlum, `M${P(X(-10), Y(44))}L${P(X(-3), Y(40))}L${P(X(-6), Y(32))}L${P(X(-14), Y(37))}Z`);
      // the tail round the rump onto the paving
      b.fill(fur, `M${P(X(110), Y(6))}C${P(X(128), Y(4))} ${P(X(130), Y(-6))} ${P(X(112), Y(-6))}C${P(X(104), Y(-6))} ${P(X(100), Y(-2))} ${P(X(100), Y(2))}Z`);
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
      const wood = PLANTER_WOOD;
      const woodLit = nearStep('#B9744E', -2);
      b.rect(wood, x0, rim, x1 - x0, base - rim);
      b.rect(woodLit, x0, rim, x1 - x0, 18);
      for (let k = 1; k < 3; k++) b.rect(seamTone(wood, 7), x0, rim + 18 + ((base - rim - 18) * k) / 3, x1 - x0, 3);
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
