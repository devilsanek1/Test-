// P8_site.tsx (lane L5-scale): the Pentagon and everything in front of it, for P8 (the scale beat). The building, its
// projection and the parked-car ruler are StylePentagon's (src/v2/StylePentagon.tsx, the approved style frame
// review/look/v2_g4/pentagon_dusk.png), copied, not imported, re-solved for the board's "too big for the frame" landing
// (art director, fix round): apex y 712, roof front y 1195, facade bottom y 1348, the outer corners ~140 px off both
// side edges, a big courtyard. Added for the great-scale cues (owner, 2026-10-26): a few office windows switching on,
// roof units, two tight rows of ~46 identical small parked cars at its foot (the ruler at near true size: a car is
// ~1/45 of the front face), bay ticks and tall lot lamps in the one-point perspective of the ground, a drive that
// sweeps from the highway on the left across the lawn and recedes to the building (the one receding element), a
// violet-green tree lawn (cast shadows; clumps overlapping the lot), a four-lane highway with moving cars (warm headlight
// beams) and street lamps coming on one by one, a verge with trees over the near lane, a fence at the top of the
// embankment, then THE DROP: treetops on the slope below us, seen from above, and the stone wall we rise over (coping,
// courses of stones, uneven ivy, a moss cushion, a missing stone, staggered weep holes, two pigeons that take off).
// Fairness (CORE_LINE 2): a plain building; no flags, figures, aircraft, weapons, text or "Google"; no glow, rim or hero
// colour on it. All cars are the one plain sedan of the ruler.
// Coordinates: canvas px of the LANDING frame (camera at rest = the rise's end); P8.tsx moves each plane.
import React, {useId} from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {stroke} from '../../../lib/theme';
import {crown, hline, line, polyPath, Pt, roundRect, vline} from '../../../lib/sketch';
import {rand, rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {DUSK, birdShape} from '../kit';
import {P8X} from './P8_pal';

const P = DUSK;

// ---------------------------------------------------------------- the camera: one perspective for building + ground
// (StylePentagon's model.) Plan in metres: X right, Z away from us (the front facade at Z = 0), Y up. The numbers solve
// for the landing frame: front corners at x 50 / 1030, roof front edge y 1195, apex y 712; a farther, higher camera than
// the style frame (DC 1600 m, ~25 deg down), so the five-ring roof opens up and its outer corners run off both edges.
const D36 = Math.PI / 5;
const EDGE = 281;
const R_OUT = EDGE / (2 * Math.sin(D36));
const RI_OUT = R_OUT * Math.cos(D36);
const COURT = 74.3;
const WELLS: [number, number][] = [
  [166, 172],
  [142, 148],
  [118, 124],
  [94, 100],
];
const HB = 44;
const DC = 1600;
const HALF = 490;
const ROOF_FRONT_Y = 1195;
const APEX_Y = 712;
const F = (HALF * DC) / (EDGE / 2);
const A_ = ((ROOF_FRONT_Y - APEX_Y) * DC * (DC + R_OUT + RI_OUT)) / (R_OUT + RI_OUT);
const HY = ROOF_FRONT_Y - A_ / DC;
const HC = A_ / F + HB;

export const proj = (X: number, Z: number, Y = 0): Pt => [540 + (X * F) / (DC + Z), HY + ((HC - Y) * F) / (DC + Z)];
export const kAt = (Z: number) => F / (DC + Z);
export const groundY = (Z: number) => proj(0, Z, 0)[1];
const ring = (r: number): Pt[] =>
  [0, 1, 2, 3, 4].map((k) => {
    const a = ((-126 + 72 * k) * Math.PI) / 180;
    const R = r / Math.cos(D36);
    return [R * Math.cos(a), RI_OUT + R * Math.sin(a)] as Pt;
  });
const atY = (pts: Pt[], Y: number): Pt[] => pts.map(([X, Z]) => proj(X, Z, Y));
const lerpP = (a: Pt, b: Pt, u: number): Pt => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
/** The roof's back edge (screen y at x): the far world shows above it. */
export const roofBackY = (x: number) => {
  const roof = atY(ring(RI_OUT), HB);
  const [lf, ap, rt] = [roof[4], roof[3], roof[2]];
  const [a, b] = x <= ap[0] ? [lf, ap] : [ap, rt];
  return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]);
};

/** The wall's coping top edge at the landing (low in the frame: the drop below us shows above it). */
export const WALL_Y_LAND = 1770;

const W_FRONT = stroke.inkBold;
const W_MID = stroke.ink;
const W_THIN = stroke.inkThin;
const W_HAIR = stroke.inkHair;

// ---------------------------------------------------------------- the Pentagon

function faceWindows(a: Pt, b: Pt, n: number, rows: number, skip: (i: number, j: number) => boolean): string {
  let d = '';
  for (let j = 0; j < rows; j++) {
    const y0 = (HB * (j + 0.3)) / (rows + 0.25);
    const y1 = y0 + (HB / (rows + 0.25)) * 0.42;
    for (let i = 0; i < n; i++) {
      if (skip(i, j)) continue;
      const u0 = (i + 0.3) / n;
      const u1 = (i + 0.68) / n;
      const pa = lerpP(a, b, u0);
      const pb = lerpP(a, b, u1);
      d += polyPath([proj(pa[0], pa[1], y1), proj(pb[0], pb[1], y1), proj(pb[0], pb[1], y0), proj(pa[0], pa[1], y0)]);
    }
  }
  return d;
}

/** Office windows that switch (runs of n adjacent windows on the front face: i column, j storey; on / off scene s).
 *  "A few windows lighting" (brief): the style frame's three plus short runs, never a lit facade. */
const LIT_RUNS: {i: number; j: number; n: number; on: number; off?: number}[] = [
  {i: 23, j: 1, n: 1, on: -9},
  {i: 61, j: 0, n: 1, on: -9},
  {i: 56, j: 3, n: 1, on: -9, off: 1.62},
  {i: 11, j: 2, n: 3, on: 0.48},
  {i: 37, j: 4, n: 2, on: 1.08},
  {i: 70, j: 1, n: 3, on: 1.74},
  {i: 46, j: 0, n: 2, on: 2.22},
  {i: 31, j: 2, n: 2, on: -9, off: 0.86},
];

const GEO = (() => {
  const outer = ring(RI_OUT);
  const [fl, fr, rt, , lf] = outer;
  const roof = atY(outer, HB);
  const base = atY(outer, 0);
  const court = ring(COURT);
  const hole = atY(court, HB);
  const floor = atY(court, 0);
  const front = [roof[0], roof[1], base[1], base[0]];
  const left = [roof[4], roof[0], base[0], base[4]];
  const right = [roof[1], roof[2], base[2], base[1]];
  const wr = rng('p8/win');
  const dark = new Set<string>();
  for (let i = 0; i < 18; i++) dark.add(`${wr.int(0, 79)},${wr.int(0, 4)}`);
  const runKeys = new Set<string>();
  LIT_RUNS.forEach((r) => {
    for (let k = 0; k < r.n; k++) runKeys.add(`${r.i + k},${r.j}`);
  });
  const winFront = faceWindows(fl, fr, 80, 5, (i, j) => dark.has(`${i},${j}`) || runKeys.has(`${i},${j}`));
  const winRuns = LIT_RUNS.map((r) => faceWindows(fl, fr, 80, 5, (i, j) => j !== r.j || i < r.i || i >= r.i + r.n));
  const winLeft = faceWindows(lf, fl, 80, 5, () => false);
  const winRight = faceWindows(fr, rt, 80, 5, () => false);
  const winCourt = faceWindows(court[2], court[3], 30, 5, () => false) + faceWindows(court[3], court[4], 30, 5, () => false);
  const tr = rng('p8/courttrees');
  const trees: string[] = [];
  for (let i = 0; i < 14; i++) {
    const X = tr.range(-62, 62);
    const Z = RI_OUT + tr.range(-58, 52);
    const [x, y] = proj(X, Z, 0);
    const k = kAt(Z);
    trees.push(crown(x, y - 5 * k, tr.range(4.5, 6.5) * k, tr.range(3.6, 5) * k, {seed: `ct${i}`, bumps: 6, round: 0.72}));
  }
  const creases = court.map((c, k) => line(...proj(c[0], c[1], HB), ...proj(outer[k][0], outer[k][1], HB), {over: [0, 0], seed: `cr${k}`, breaks: false})).join('');
  const roofInk = [1, 2, 3, 4].map((k) => line(...roof[k], ...roof[(k + 1) % 5], {over: 'small', seed: `ro${k}`})).join('');
  const faceInk = line(...base[4], ...base[0], {over: [0, 0], seed: 'b0'}) + line(...base[1], ...base[2], {over: [0, 0], seed: 'b2'});
  const frontInk =
    line(...roof[0], ...roof[1], {over: 'small', seed: 'rf'}) +
    vline(roof[0][0], roof[0][1], base[0][1], {over: [0, 2], seed: 'c0'}) +
    vline(roof[1][0], roof[1][1], base[1][1], {over: [0, 2], seed: 'c1'}) +
    line(...base[0], ...base[1], {over: 'small', seed: 'b1'});
  const holeInk = [0, 1, 2, 3, 4].map((k) => line(...hole[k], ...hole[(k + 1) % 5], {over: [0, 0], seed: `ho${k}`, breaks: false})).join('');
  // roof units (plain HVAC boxes) on the outer ring, a plain building's roof detail
  const ur = rng('p8/units');
  let unitTop = '';
  let unitSide = '';
  const unit = (X: number, Z: number, w: number, dz: number, h: number) => {
    const t0 = proj(X, Z, HB + h);
    const t1 = proj(X + w, Z, HB + h);
    const t2 = proj(X + w, Z + dz, HB + h);
    const t3 = proj(X, Z + dz, HB + h);
    const b0 = proj(X, Z, HB);
    const b1 = proj(X + w, Z, HB);
    unitTop += polyPath([t3, t2, t1, t0]);
    unitSide += polyPath([t0, t1, b1, b0]);
  };
  for (let X = -128; X < 118; X += ur.range(22, 40)) unit(X, ur.range(5, 14), ur.range(5, 9), ur.range(3, 5), ur.range(2.2, 3.4));
  // two side rings (they recede: fewer, smaller)
  for (const [X, Z] of [
    [-160, 70],
    [-178, 120],
    [150, 64],
    [170, 112],
    [-60, 46],
    [40, 44],
  ] as Pt[])
    unit(X + ur.jitter(6), Z, ur.range(5, 8), ur.range(3, 4), ur.range(2, 3));
  return {roof, base, hole, floor, front, left, right, winFront, winRuns, winLeft, winRight, winCourt, trees, creases, roofInk, faceInk, frontInk, holeInk, unitTop, unitSide};
})();

export const P8Pentagon: React.FC = () => {
  const t = useTime();
  const clipId = 'p8court' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const g = GEO;
  return (
    <>
      <Fill d={polyPath(g.left)} color={P.sideShade} offset={false} />
      <Fill d={polyPath(g.right)} color={P.sideLit} offset={false} />
      <Fill d={polyPath(g.front)} color={P.facade} seed="p8facade" />
      <Fill d={g.winLeft} color={P.win} offset={false} />
      <Fill d={g.winRight} color={P.facade} offset={false} />
      <Fill d={g.winFront} color={P.win} offset={false} />
      {LIT_RUNS.map((r, i) => (
        <path key={i} d={g.winRuns[i]} fill={t >= r.on && (r.off === undefined || t < r.off) ? P.lit : P.win} />
      ))}
      <Fill d={polyPath(g.roof)} color={P.roof} seed="p8roof" />
      {WELLS.map(([a, b], i) => (
        <React.Fragment key={i}>
          <Fill d={polyPath(atY(ring(b), HB))} color={P.well} offset={false} />
          <Fill d={polyPath(atY(ring(a), HB))} color={P.roof} offset={false} />
        </React.Fragment>
      ))}
      <Ink d={g.creases} width={W_THIN} color={P.well} taper={false} />
      <path d={g.unitSide} fill={P8X.unitSide} />
      <path d={g.unitTop} fill={P8X.unitTop} />
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <path d={polyPath(g.hole)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <Fill d={polyPath(g.hole)} color={P.facade} offset={false} />
        <Fill d={g.winCourt} color={P.win} offset={false} />
        <Fill d={polyPath(g.floor)} color={P8X.lawn} offset={false} />
        {g.trees.map((d, i) => (
          <Fill key={i} d={d} color={P.courtTree} offset={false} />
        ))}
      </g>
      <Ink d={g.holeInk} width={W_HAIR} color={P.ink} />
      <Ink d={g.roofInk + g.faceInk} width={W_THIN} color={P.ink} />
      <Ink d={g.frontInk} width={W_MID} color={P.ink} />
    </>
  );
};

// ---------------------------------------------------------------- the car (the ruler's one model)

/** The ruler: a parked car's length in plan metres (~1.3x a real 4.6 m sedan so its roof and windows still read at
 *  ~21 px; ~46 per row, ~45 to the front face). */
const LOT_CAR_M = 6;
/** The moving cars on the nearer highway: a little larger (nearer, and they carry the life). */
const HW_CAR_M = 8;

/** One car, side view, facing right, length L, wheels on (x, y). [body, glass, wheels]. */
function carPaths(x: number, y: number, L: number): [string, string, string] {
  const p = (u: number, v: number): Pt => [x + u * L, y + v * L];
  const body = roundRect(x, y - 0.27 * L, L, 0.2 * L, 0.07 * L) + polyPath([p(0.2, -0.26), p(0.31, -0.42), p(0.68, -0.42), p(0.81, -0.26)]);
  const glass = polyPath([p(0.27, -0.28), p(0.345, -0.395), p(0.48, -0.395), p(0.48, -0.28)]) + polyPath([p(0.52, -0.28), p(0.52, -0.395), p(0.655, -0.395), p(0.74, -0.28)]);
  const wr = 0.085 * L;
  const wheel = (u: number) => roundRect(x + u * L - wr, y - 0.06 * L - wr, wr * 2, wr * 2, wr);
  return [body, glass, wheel(0.21) + wheel(0.79)];
}

// ---------------------------------------------------------------- ground bands in plan (they recede in perspective)

type P2 = [number, number];
/** A band of half-width hw (plan m) along a plan polyline, projected to the ground: one closed polygon. */
const planBand = (pts: P2[], hw: number): string => {
  const left: Pt[] = [];
  const right: Pt[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const l = Math.hypot(dx, dz) || 1;
    const nx = -dz / l;
    const nz = dx / l;
    left.push(proj(p[0] + nx * hw, p[1] + nz * hw));
    right.push(proj(p[0] - nx * hw, p[1] - nz * hw));
  });
  return polyPath([...left, ...right.reverse()]);
};
const cubic = (a: P2, b: P2, c: P2, d: P2, n: number): P2[] =>
  Array.from({length: n + 1}, (_, i) => {
    const u = i / n;
    const v = 1 - u;
    return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]] as P2;
  });

// ---------------------------------------------------------------- the lot at its foot: two rows of identical parked cars

const ROWS = [-12, -32];
const LOT_END = -42;
/** The drive's centre line (plan X) where it recedes to the building, and its half-width (m). */
const DRIVE_X = -53;
const DRIVE_HW = 4.6;

/** The ground around and in front of the building: drawn UNDER it (its top edge hides behind the facade and, beside
 *  the building, runs back to the depth of its outer corners). */
export const P8LotGround: React.FC = () => {
  const top = groundY(300);
  return <Fill rect={[-300, top, 1680, groundY(LOT_END) - top + 260]} color={P.lot} offset={false} />;
};

const LOT = (() => {
  const pitch = LOT_CAR_M * 1.12;
  const rows = ROWS.map((Z, ri) => {
    const r = rng(`p8/row${ri}`);
    const k = kAt(Z);
    const L = LOT_CAR_M * k;
    const y = groundY(Z);
    let body = '';
    let glass = '';
    let wheels = '';
    let bays = '';
    for (let X = -172 + r.range(0, pitch); X < 172; X += pitch) {
      // the bay tick at the bay's left edge, a ground line receding toward the vanishing point
      const xb = X - pitch / 2;
      if (Math.abs(xb - DRIVE_X) > DRIVE_HW + 1.5) bays += polyPath([proj(xb - 0.22, Z + 1.6), proj(xb + 0.22, Z + 1.6), proj(xb + 0.22, Z - 3.6), proj(xb - 0.22, Z - 3.6)]);
      if (Math.abs(X - DRIVE_X) < DRIVE_HW + LOT_CAR_M * 0.6) continue; // the drive runs through the rows
      if (r.chance(0.08)) continue; // an empty bay
      const [b, g, w] = carPaths(proj(X - LOT_CAR_M / 2, Z)[0], y, L);
      body += b;
      glass += g;
      wheels += w;
    }
    return {body, glass, wheels, bays};
  });
  // tall lot lamps between the rows (a second ruler, ~14 m), staggered; they come on one by one
  const Z = -22;
  const posts = [-131, -92, -18, 37, 94, 139].map((X, i) => {
    const [x, y] = proj(X, Z);
    const k = kAt(Z);
    const h = 14 * k;
    return {
      x,
      pole: vline(x, y - h, y, {over: [0, 0], seed: `lp8p${i}`, breaks: false}),
      head: roundRect(x - 1.6 * k, y - h - 0.5 * k, 3.2 * k, 0.9 * k, 0.4 * k),
      pool: `M${(x - 5.5 * k).toFixed(1)} ${(y + 0.5).toFixed(1)}a${(5.5 * k).toFixed(1)} ${(1.3 * k).toFixed(1)} 0 1 0 ${(11 * k).toFixed(1)} 0a${(5.5 * k).toFixed(1)} ${(1.3 * k).toFixed(1)} 0 1 0 ${(-11 * k).toFixed(1)} 0Z`,
      on: 1.3 + 0.17 * ((i * 4) % 6),
    };
  });
  // the drive through the lot (to the walk at the facade's foot), its curbs and centre dashes
  const drive = [
    [DRIVE_X, -4],
    [DRIVE_X, LOT_END - 1],
  ] as P2[];
  return {rows, posts, drive: planBand(drive, DRIVE_HW + 0.5), driveIn: planBand(drive, DRIVE_HW)};
})();

const dashes = (pts: P2[], every: number, len: number, hw: number) => {
  // dashes along a plan polyline (sampled densely): a short band every `every` metres
  let d = '';
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (let s = 0; s < l; s += 0.5) {
      const u = s / l;
      const m = acc + s;
      if (m % every < 0.5) {
        const p0: P2 = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
        const u1 = Math.min(1, (s + len) / l);
        const p1: P2 = [a[0] + (b[0] - a[0]) * u1, a[1] + (b[1] - a[1]) * u1];
        d += planBand([p0, p1], hw);
      }
    }
    acc += l;
  }
  return d;
};

export const P8Lot: React.FC = () => {
  const t = useTime();
  const top = groundY(0);
  const [a, b] = LOT.rows;
  return (
    <>
      <Fill rect={[-300, top, 1680, groundY(-5) - top]} color={P.walk} offset={false} />
      <path d={LOT.drive} fill={P8X.curb} />
      <path d={LOT.driveIn} fill={P.road} />
      {LOT.posts.map((l, i) => (t >= l.on ? <path key={i} d={l.pool} fill={P8X.pool} /> : null))}
      <path d={a.bays + b.bays} fill={P8X.bay} />
      <Fill d={a.wheels} color={P.wheel} offset={false} />
      <Fill d={a.body} color={P.car} offset={false} />
      <Fill d={a.glass} color={P.carGlass} offset={false} />
      <Ink d={LOT.posts.map((l) => l.pole).join('')} width={W_THIN} color={P.post} taper={false} />
      {LOT.posts.map((l, i) => (
        <path key={`h${i}`} d={l.head} fill={t >= l.on ? P8X.lampOn : P8X.lampOff} />
      ))}
      <Fill d={b.wheels} color={P.wheel} offset={false} />
      <Fill d={b.body} color={P.car} offset={false} />
      <Fill d={b.glass} color={P.carGlass} offset={false} />
    </>
  );
};

// ---------------------------------------------------------------- the lawn: the drive sweeping across it, its trees

const LAWN_END = -76;
/** The drive from the highway: it leaves the far carriageway on the left and sweeps across the lawn, then recedes
 *  straight to the lot (plan m). */
const DRIVE_PATH: P2[] = [...cubic([-196, -78.5], [-112, -78.5], [DRIVE_X, -73], [DRIVE_X, -50], 28), [DRIVE_X, LOT_END + 1]];

const LAWN = (() => {
  const y0 = groundY(LOT_END);
  const r = rng('p8/lawntrees');
  const trees: {trunk: string; crown: string; lit: string; shadow: string; seed: string}[] = [];
  const tree = (X: number, Z: number, s: number) => {
    const k = kAt(Z);
    const [x, y] = proj(X, Z);
    const rx = r.range(4.2, 5.6) * s * k;
    const ry = r.range(3.6, 4.6) * s * k;
    const h = r.range(6.5, 8.5) * s * k;
    const cy = y - h;
    const seed = `lt${Math.round(X * 10)}_${Math.round(Z)}`;
    trees.push({
      trunk: roundRect(x - 0.4 * k, cy, 0.8 * k, h, 0.3 * k),
      crown: crown(x, cy, rx, ry, {seed, bumps: 7, round: 0.72}),
      lit: crown(x + rx * 0.22, cy - ry * 0.25, rx * 0.62, ry * 0.55, {seed: `${seed}l`, bumps: 5, round: 0.75}),
      // the cast shadow falls left (the sun is low on the right): a long flat ellipse on the grass
      shadow: `M${(x - rx * 2.6).toFixed(1)} ${(y + 0.5).toFixed(1)}a${(rx * 1.5).toFixed(1)} ${(1.1 * k).toFixed(1)} 0 1 0 ${(rx * 3).toFixed(1)} 0a${(rx * 1.5).toFixed(1)} ${(1.1 * k).toFixed(1)} 0 1 0 ${(-rx * 3).toFixed(1)} 0Z`,
      seed,
    });
  };
  // clumps of 1-3 trees at uneven spacing and depth; some stand at the lot's edge (their crowns over the far row)
  for (let X = -160; X < 170; ) {
    if (Math.abs(X - DRIVE_X) < 12) {
      X += 14;
      continue;
    }
    const n = r.chance(0.35) ? 1 : r.chance(0.6) ? 2 : 3;
    const Z0 = r.chance(0.3) ? -45 - r.range(0, 3) : -52 - r.range(0, 16);
    for (let i = 0; i < n; i++) tree(X + i * r.range(4.5, 7), Z0 - r.range(0, 5), r.chance(0.2) ? 1.25 : 1);
    X += n * 6 + (r.chance(0.3) ? r.range(26, 44) : r.range(8, 18));
  }
  // draw far -> near
  return {y0, trees: trees.reverse()};
})();

export const P8Lawn: React.FC = () => {
  const t = useTime();
  return (
    <>
      <Fill rect={[-300, LAWN.y0 - 2, 1680, 600]} color={P8X.lawn} offset={false} />
      <Fill rect={[-300, LAWN.y0 - 2, 1680, 3]} color={P8X.curb} offset={false} />
      <path d={planBand(DRIVE_PATH, DRIVE_HW + 0.5)} fill={P8X.curb} />
      <path d={planBand(DRIVE_PATH, DRIVE_HW)} fill={P.road} />
      <path d={dashes(DRIVE_PATH, 6, 2.6, 0.22)} fill={P.roadLine} />
      {LAWN.trees.map((q) => (
        <path key={`s${q.seed}`} d={q.shadow} fill={P8X.lawnShade} />
      ))}
      {LAWN.trees.map((q) => {
        const dx = Math.sin(2 * Math.PI * 0.45 * t + rand(q.seed, 'ph') * 6.28) * 1.6;
        return (
          <g key={q.seed}>
            <path d={q.trunk} fill={P8X.trunk} />
            <g transform={`translate(${dx.toFixed(2)} 0)`}>
              <path d={q.crown} fill={P8X.tree} />
              <path d={q.lit} fill={P8X.treeLit} />
            </g>
          </g>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- the highway: four lanes of moving cars, lamps coming on

/** A lane: depth Z, direction, speed (px/s at its depth), cars on its loop, and `late` = scene times at which one more
 *  car ENTERS the frame (new life during the landing and the hold; nudged later if it would overlap a looping car). */
type Lane = {Z: number; dir: 1 | -1; v: number; n: number; seed: string; late?: number[]};
const HW_TOP = LAWN_END; // -76
const HW_MEDIAN: [number, number] = [-102, -109];
const HW_END = -136;
const LANES: Lane[] = [
  {Z: -83, dir: 1, v: 92, n: 3, seed: 'l1', late: [1.3]},
  {Z: -96, dir: 1, v: 124, n: 3, seed: 'l2', late: [2.02]},
  {Z: -118, dir: -1, v: 112, n: 3, seed: 'l3', late: [1.62]},
  {Z: -131, dir: -1, v: 86, n: 4, seed: 'l4', late: [1.12, 2.28]},
];
/** Street lamps on the highway's far edge; they come on one by one, left to right, as the lawn rises into view. */
export const LAMP_ON0 = 0.98;
export const LAMP_STEP = 0.11;
const LAMP_XS = Array.from({length: 9}, (_, i) => 62 + 120 * i);

const laneCars = (lane: Lane) => {
  const L = HW_CAR_M * kAt(lane.Z);
  const [body, glass, wheels] = carPaths(0, 0, L);
  const beam = polyPath([
    [L * 0.98, -0.2 * L],
    [L * 2.5, -0.27 * L],
    [L * 2.5, 0.05 * L],
    [L * 0.98, -0.08 * L],
  ]);
  const head = roundRect(L * 0.93, -0.22 * L, 0.08 * L, 0.07 * L, 0.02 * L);
  const tail = roundRect(-0.01 * L, -0.23 * L, 0.06 * L, 0.06 * L, 0.02 * L);
  // the loop: each car's phase (px along a loop of `span`), the late entries placed so they never overlap
  const span = 1080 + L * 6;
  const r = rng(`p8/${lane.seed}`);
  const xs: number[] = [];
  let x0 = r.range(0, span / lane.n);
  for (let j = 0; j < lane.n; j++) {
    xs.push(x0);
    x0 += span / lane.n + r.range(-0.25, 0.25) * (span / lane.n);
  }
  const md = (a: number, b: number) => {
    const d = (((a - b) % span) + span) % span;
    return Math.min(d, span - d);
  };
  const enterAt = (te: number) => (lane.dir === 1 ? 2 * L - lane.v * te : 1080 + 3 * L + lane.v * te);
  for (const te0 of lane.late ?? []) {
    let te = te0;
    while (xs.some((x) => md(x, enterAt(te)) < 1.9 * L) && te < te0 + 1) te += 0.04;
    xs.push(enterAt(te));
  }
  return {L, body, glass, wheels, beam, head, tail, span, xs};
};
const LANE_CARS = LANES.map(laneCars);

type CarModel = ReturnType<typeof laneCars>;
const Cars: React.FC<{lane: Lane; c: CarModel; t: number}> = ({lane, c, t}) => {
  const y = groundY(lane.Z);
  const span = c.span;
  const out: React.ReactNode[] = [];
  for (let j = 0; j < c.xs.length; j++) {
    const xr = ((((c.xs[j] + lane.dir * lane.v * t) % span) + span) % span) - c.L * 3;
    const tf = lane.dir === 1 ? `translate(${xr.toFixed(1)} ${y.toFixed(1)})` : `translate(${(xr + c.L).toFixed(1)} ${y.toFixed(1)}) scale(-1 1)`;
    out.push(
      <g key={j} transform={tf}>
        <path d={c.beam} fill={P8X.beam} />
        <path d={c.wheels} fill={P.wheel} />
        <path d={c.body} fill={P.car} />
        <path d={c.glass} fill={P.carGlass} />
        <path d={c.head} fill={P8X.beam} />
        <path d={c.tail} fill={P8X.tail} />
      </g>,
    );
  }
  return <>{out}</>;
};

const HW = (() => {
  const y0 = groundY(HW_TOP);
  const y1 = groundY(HW_END);
  const ym0 = groundY(HW_MEDIAN[0]);
  const ym1 = groundY(HW_MEDIAN[1]);
  const dash = (Z: number) => {
    const k = kAt(Z);
    const y = groundY(Z);
    let d = '';
    for (let x = -40; x < 1120; x += 9 * k) d += polyPath([[x, y - 0.25 * k], [x + 3.6 * k, y - 0.25 * k], [x + 3.6 * k, y + 0.25 * k], [x, y + 0.25 * k]]);
    return d;
  };
  const edge = (Z: number) => {
    const k = kAt(Z);
    const y = groundY(Z);
    return `M-300 ${y - 0.2 * k}H1380V${y + 0.2 * k}H-300Z`;
  };
  // the guardrail on the median: a rail and its posts
  const k = kAt(HW_MEDIAN[0]);
  let posts = '';
  for (let x = -20; x < 1120; x += 5 * k) posts += `M${x.toFixed(1)} ${(ym0 - 0.2 * k).toFixed(1)}V${(ym0 - 1.1 * k).toFixed(1)}`;
  const lampK = kAt(HW_TOP);
  const lamps = LAMP_XS.map((x, i) => {
    const y = y0 + 1;
    const h = 11 * lampK;
    return {
      x,
      pole: vline(x, y - h, y, {over: [0, 0], seed: `lp${i}`, breaks: false}),
      arm: line(x, y - h, x + 2.2 * lampK, y - h - 0.4 * lampK, {over: [0, 0], seed: `la${i}`, breaks: false}),
      head: roundRect(x + 1.4 * lampK, y - h - 0.6 * lampK, 2.4 * lampK, 1.1 * lampK, 0.5 * lampK),
      pool: `M${x - 30} ${y + 8}a34 7 0 1 0 68 0a34 7 0 1 0 -68 0Z`,
    };
  });
  return {y0, y1, ym0, ym1, dash: dash(-89.5) + dash(-124.5), edges: edge(-77.4) + edge(-101.3) + edge(-109.8) + edge(-134.6), posts, lamps, railY: ym0 - 1.1 * k};
})();

export const P8Highway: React.FC = () => {
  const t = useTime();
  return (
    <>
      <Fill rect={[-300, HW.y0, 1680, 700]} color={P.road} offset={false} />
      {HW.lamps.map((l, i) => (t >= LAMP_ON0 + LAMP_STEP * i ? <path key={i} d={l.pool} fill={P8X.pool} /> : null))}
      <path d={HW.edges} fill={P.walk} />
      <path d={HW.dash} fill={P.roadLine} />
      {/* lamps on the far edge: poles, then their heads (dark until they come on) */}
      <Ink d={HW.lamps.map((l) => l.pole + l.arm).join('')} width={W_HAIR} color={P.post} taper={false} />
      {HW.lamps.map((l, i) => (
        <path key={i} d={l.head} fill={t >= LAMP_ON0 + LAMP_STEP * i ? P8X.lampOn : P8X.lampOff} />
      ))}
      <Cars lane={LANES[0]} c={LANE_CARS[0]} t={t} />
      <Cars lane={LANES[1]} c={LANE_CARS[1]} t={t} />
      <Fill rect={[-300, HW.ym0, 1680, HW.ym1 - HW.ym0]} color={P8X.median} offset={false} />
      <path d={HW.posts} stroke={P8X.rail} strokeWidth={2.2} fill="none" />
      <path d={`M-300 ${HW.railY - 1.6}H1380V${HW.railY + 1.6}H-300Z`} fill={P8X.rail} />
      <Cars lane={LANES[2]} c={LANE_CARS[2]} t={t} />
      <Cars lane={LANES[3]} c={LANE_CARS[3]} t={t} />
    </>
  );
};

// ---------------------------------------------------------------- the verge, its trees, the fence at the embankment's top

const VERGE_END = -156;
const VERGE = (() => {
  const r = rng('p8/verge');
  const bushes: {d: string; lit: string}[] = [];
  for (let x = -40; x < 1120; ) {
    const Z = -146 + r.range(-6, 6);
    const k = kAt(Z);
    const y = groundY(Z);
    const rx = r.range(2.4, 4.2) * k;
    const ry = r.range(1.6, 2.4) * k;
    bushes.push({
      d: crown(x, y - ry * 0.6, rx, ry, {seed: `vb${Math.round(x)}`, bumps: 6, round: 0.72}),
      lit: crown(x + rx * 0.2, y - ry * 0.9, rx * 0.55, ry * 0.5, {seed: `vbl${Math.round(x)}`, bumps: 5, round: 0.75}),
    });
    x += r.chance(0.3) ? r.range(90, 160) : r.range(30, 60);
  }
  // a few verge trees: nearer than the highway, their crowns stand over its near lane (they break the band edge)
  const trees: {trunk: string; d: string; lit: string; seed: string}[] = [];
  for (const [X, s] of [
    [-128, 1.1],
    [-121, 0.9],
    [-12, 1.0],
    [104, 1.15],
    [112, 0.95],
    [119, 1.05],
  ] as [number, number][]) {
    const Z = -140 - r.range(0, 4);
    const k = kAt(Z);
    const [x, y] = proj(X, Z);
    const h = 8.5 * s * k;
    const rx = 5 * s * k;
    const ry = 4.3 * s * k;
    const seed = `vt${X}`;
    trees.push({
      trunk: roundRect(x - 0.45 * k, y - h, 0.9 * k, h, 0.3 * k),
      d: crown(x, y - h, rx, ry, {seed, bumps: 7, round: 0.72}),
      lit: crown(x + rx * 0.22, y - h - ry * 0.25, rx * 0.6, ry * 0.55, {seed: `${seed}l`, bumps: 5, round: 0.75}),
      seed,
    });
  }
  // the fence at the embankment's top (posts + two wires): the edge of the drop
  const y = groundY(VERGE_END) + 3;
  const k = kAt(VERGE_END);
  let fence = '';
  for (let x = -30; x < 1120; x += 3.2 * k) fence += `M${x.toFixed(1)} ${y.toFixed(1)}V${(y - 1.2 * k).toFixed(1)}`;
  fence += `M-300 ${(y - 1.05 * k).toFixed(1)}H1380M-300 ${(y - 0.55 * k).toFixed(1)}H1380`;
  return {bushes, trees, fence};
})();

export const P8Verge: React.FC = () => {
  const t = useTime();
  const y0 = groundY(HW_END);
  const y1 = groundY(VERGE_END);
  return (
    <>
      <Fill rect={[-300, y0, 1680, y1 - y0 + 1]} color={P.verge} offset={false} />
      {/* the embankment falling away below the fence (the treetops of the slope stand in front of it) */}
      <Fill rect={[-300, y1, 1680, 700]} color={P8X.canopyDark} offset={false} />
      {VERGE.bushes.map((b, i) => (
        <React.Fragment key={i}>
          <path d={b.d} fill={P8X.bush} />
          <path d={b.lit} fill={P8X.bushLit} />
        </React.Fragment>
      ))}
      {VERGE.trees.map((q) => {
        const dx = Math.sin(2 * Math.PI * 0.4 * t + rand(q.seed, 'ph') * 6.28) * 2;
        return (
          <g key={q.seed}>
            <path d={q.trunk} fill={P8X.trunk} />
            <g transform={`translate(${dx.toFixed(2)} 0)`}>
              <path d={q.d} fill={P8X.bush} />
              <path d={q.lit} fill={P8X.bushLit} />
            </g>
          </g>
        );
      })}
      <path d={VERGE.fence} stroke={P8X.rail} strokeWidth={2.2} fill="none" />
    </>
  );
};

// ---------------------------------------------------------------- the drop: treetops on the slope below the wall

const TREETOPS = (() => {
  const r = rng('p8/treetops');
  const out: {dark: string; body: string; lit: string; seed: string}[] = [];
  for (let x = -60; x < 1160; ) {
    const rx = r.range(52, 92);
    const ry = r.range(38, 54);
    const cy = WALL_Y_LAND - r.range(40, 92);
    const s = `tt${Math.round(x)}`;
    out.push({
      dark: crown(x + rx, cy + 10, rx * 1.08, ry * 1.05, {seed: `${s}d`, bumps: 8, round: 0.7}),
      body: crown(x + rx, cy, rx, ry, {seed: s, bumps: 8, round: 0.72}),
      lit: crown(x + rx * 1.18, cy - ry * 0.3, rx * 0.6, ry * 0.5, {seed: `${s}l`, bumps: 6, round: 0.75}),
      seed: s,
    });
    x += rx * r.range(1.15, 1.6);
  }
  return out;
})();

export const P8Treetops: React.FC = () => {
  const t = useTime();
  return (
    <>
      {TREETOPS.map((q) => {
        const dx = Math.sin(2 * Math.PI * 0.32 * t + rand(q.seed, 'ph') * 6.28) * 3;
        return (
          <g key={q.seed} transform={`translate(${dx.toFixed(2)} 0)`}>
            <path d={q.dark} fill={P8X.canopyDark} />
            <path d={q.body} fill={P8X.canopy} />
            <path d={q.lit} fill={P8X.canopyLit} />
          </g>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- the wall (foreground: the dark mass we rise over)

const COURSE = 70;
const N_COURSES = 16;

const WALL = (() => {
  const top = WALL_Y_LAND;
  const lipY = top + 42;
  const faceY = lipY + 20;
  const r = rng('p8/wall');
  let joints = '';
  for (let x = r.range(60, 180); x < 1080; x += r.range(230, 290)) joints += line(x, top + 3, x + 6, lipY - 2, {over: [0, 0], seed: `cj${Math.round(x)}`});
  const courses = Array.from({length: N_COURSES}, (_, i) => faceY + COURSE * (i + 1));
  courses.forEach((y, i) => (joints += hline(-40, 1120, y, {seed: `wc${i}`, over: [0, 0]})));
  // stones: staggered blocks, three flat tones (no texture); one stone is missing (a dark recess with a lit sill) and
  // one is split by a crack, so the big field never reads mechanical
  const tones: string[][] = [[], [], []];
  let missing = '';
  let sill = '';
  [faceY, ...courses].forEach((y0, i) => {
    let x = -60 + (i % 2) * 90 - r.range(0, 60);
    let j = 0;
    while (x < 1140) {
      const w = r.range(140, 220);
      const tone = r.chance(0.5) ? 0 : r.chance(0.5) ? 1 : 2;
      tones[tone].push(`M${x.toFixed(1)} ${y0.toFixed(1)}h${w.toFixed(1)}v${COURSE}h${(-w).toFixed(1)}Z`);
      if (i === 2 && j === 4) {
        // a corner broken off this stone: a jagged dark recess, its broken floor catching the light
        const bx = x + w * 0.38;
        missing += polyPath([[bx, y0 + 4], [bx + w * 0.2, y0 + 12], [bx + w * 0.34, y0 + 5], [x + w - 4, y0 + 9], [x + w - 4, y0 + COURSE - 5], [bx + w * 0.08, y0 + COURSE - 5], [bx - 8, y0 + COURSE * 0.55], [bx + 6, y0 + 26]]);
        sill += polyPath([[bx + w * 0.08, y0 + COURSE - 13], [x + w - 4, y0 + COURSE - 15], [x + w - 4, y0 + COURSE - 5], [bx + w * 0.08, y0 + COURSE - 5]]);
      }
      x += w;
      j++;
      if (x < 1080) joints += vline(x, y0 + 4, y0 + COURSE - 4, {over: [0, 0], seed: `wv${i}-${Math.round(x)}`});
    }
  });
  // moss: small patches along the coping, and one tuft of grass growing out of the coping's joint (left of centre)
  let moss = '';
  for (let i = 0; i < 7; i++) {
    const x = r.range(20, 1060);
    moss += roundRect(x, top + r.range(4, 26), r.range(18, 46), r.range(5, 9), 4);
  }
  let cushion = '';
  let cushionLit = '';
  const gr = rng('p8/tuft');
  for (let i = 0; i < 26; i++) {
    const x = 470 + gr.range(0, 120) + (i % 2) * 6;
    const h = gr.range(14, 34) * (1 - Math.abs(x - 530) / 110);
    const lean = gr.range(-9, 9);
    const blade = polyPath([[x - 3, top + 6], [x + lean, top + 6 - h], [x + 3, top + 6]]);
    if (gr.chance(0.4)) cushionLit += blade;
    else cushion += blade;
  }
  cushion += roundRect(468, top - 2, 128, 12, 6);
  // weep holes, staggered across three courses, each with a stain run below it
  let weep = '';
  let stain = '';
  for (const [x, c] of [
    [214, 1.3],
    [612, 2.45],
    [915, 0.55],
  ]) {
    const y = faceY + COURSE * c;
    weep += roundRect(x, y, 26, 16, 7);
    stain += roundRect(x - 4, y + 13, 34, 9, 4.5);
  }
  // lichen patches down the face (flat blobs) and two old cracks across a few stones
  for (let i = 0; i < 7; i++) {
    const x = r.range(40, 1040);
    const y = faceY + r.range(20, COURSE * 9);
    for (let k = 0; k < 3; k++) moss += roundRect(x + r.range(-14, 14), y + r.range(-8, 8), r.range(14, 30), r.range(8, 14), 6);
  }
  const crack = (x: number, y: number, n: number, seed: string) => {
    const cr = rng(seed);
    let d = `M${x} ${y}`;
    for (let i = 0; i < n; i++) {
      x += cr.range(-18, 18);
      y += cr.range(16, 28);
      d += `L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  };
  joints += crack(338, faceY + 4, 3, 'p8crack1') + crack(840, faceY + COURSE * 3 + 4, 5, 'p8crack2');
  // ivy clumps hanging over the coping, unevenly: two close together on the left, one long far to the right, one short
  // stub at the right edge; leaf blobs on a stem, each clump sways about its root
  const ivy = [
    {x: 92, n: 13, len: 200},
    {x: 166, n: 7, len: 100},
    {x: 748, n: 14, len: 230},
    {x: 1018, n: 4, len: 52},
  ].map((c, ci) => {
    let dark = '';
    let lit = '';
    let stem = '';
    const ir = rng(`p8/ivy${ci}`);
    let px = c.x;
    let py = top - 6;
    stem += `M${px} ${py}`;
    for (let i = 0; i < c.n; i++) {
      px += ir.jitter(14);
      py += c.len / c.n + ir.jitter(4);
      stem += `L${px.toFixed(1)} ${py.toFixed(1)}`;
      for (const side of [-1, 1]) {
        const lx = px + side * ir.range(8, 16);
        const ly = py + ir.jitter(5);
        const rr = ir.range(7, 11);
        const leaf = `M${(lx - rr).toFixed(1)} ${ly.toFixed(1)}Q${lx.toFixed(1)} ${(ly - rr * 1.3).toFixed(1)} ${(lx + rr).toFixed(1)} ${ly.toFixed(1)}Q${lx.toFixed(1)} ${(ly + rr * 0.9).toFixed(1)} ${(lx - rr).toFixed(1)} ${ly.toFixed(1)}Z`;
        if (ir.chance(0.35)) lit += leaf;
        else dark += leaf;
      }
    }
    // a few leaves along the coping too
    for (let i = 0; i < 6; i++) {
      const lx = c.x + ir.range(-50, 50);
      const ly = top + ir.range(-4, 10);
      const rr = ir.range(8, 12);
      dark += `M${(lx - rr).toFixed(1)} ${ly.toFixed(1)}Q${lx.toFixed(1)} ${(ly - rr * 1.3).toFixed(1)} ${(lx + rr).toFixed(1)} ${ly.toFixed(1)}Q${lx.toFixed(1)} ${(ly + rr * 0.9).toFixed(1)} ${(lx - rr).toFixed(1)} ${ly.toFixed(1)}Z`;
    }
    return {x: c.x, y: top, dark, lit, stem, seed: `ivy${ci}`};
  });
  return {top, lipY, faceY, joints, tones, moss, cushion, cushionLit, weep, stain, missing, sill, ivy};
})();

/** The two pigeons on the coping (wall-layer px): they take off as the camera starts to rise. */
export const PIGEONS = [
  {x: 296, at: 0.36, s: 1, dir: -1},
  {x: 352, at: 0.5, s: 0.92, dir: -1},
];

const perched = (x: number, y: number, s: number, face: number, bob: number) => {
  // body, head, tail: a flat silhouette that reads at phone size (~40 px long)
  const f = face;
  const by = y - 11 * s;
  const body = `M${x - 17 * s * f} ${by + 2 * s}Q${x - 4 * s * f} ${by - 13 * s} ${x + 12 * s * f} ${by - 6 * s}Q${x + 17 * s * f} ${by + 4 * s} ${x + 6 * s * f} ${by + 9 * s}Q${x - 8 * s * f} ${by + 12 * s} ${x - 17 * s * f} ${by + 2 * s}Z`;
  const hx = x + (14 + bob * 2) * s * f;
  const hy = by - (12 - bob * 2) * s;
  const head = `M${hx - 6.5 * s} ${hy}a${6.5 * s} ${6.5 * s} 0 1 0 ${13 * s} 0a${6.5 * s} ${6.5 * s} 0 1 0 ${-13 * s} 0Z`;
  const beak = polyPath([
    [hx + 5.5 * s * f, hy - 1.5 * s],
    [hx + 11 * s * f, hy + 0.5 * s],
    [hx + 5.5 * s * f, hy + 2 * s],
  ]);
  const tail = polyPath([
    [x - 14 * s * f, by + 1 * s],
    [x - 27 * s * f, by + 4 * s],
    [x - 25 * s * f, by + 8 * s],
    [x - 12 * s * f, by + 7 * s],
  ]);
  const legs = `M${x - 2 * s} ${by + 10 * s}V${y}M${x + 3 * s} ${by + 10 * s}V${y}`;
  const wing = `M${x - 10 * s * f} ${by}Q${x + 0 * s * f} ${by - 6 * s} ${x + 8 * s * f} ${by - 1 * s}Q${x - 1 * s * f} ${by + 5 * s} ${x - 10 * s * f} ${by}Z`;
  return {body: body + head + tail, beak, legs, wing};
};

export const P8Wall: React.FC = () => {
  const t = useTime();
  const w = WALL;
  return (
    <>
      <Fill rect={[-300, w.faceY, 1680, COURSE * (N_COURSES + 2)]} color={P.wall} offset={false} />
      <path d={w.tones[1].join('')} fill={P8X.stone2} />
      <path d={w.tones[2].join('')} fill={P8X.stone3} />
      <path d={w.missing} fill={P.lip} />
      <path d={w.sill} fill={P8X.stone2} />
      <path d={w.stain} fill={P8X.moss} />
      <path d={w.weep} fill={P8X.weep} />
      <Fill rect={[-300, w.top, 1680, w.lipY - w.top]} color={P.coping} seed="p8coping" />
      <path d={w.moss} fill={P8X.moss} />
      <Fill rect={[-300, w.lipY, 1680, w.faceY - w.lipY]} color={P.lip} offset={false} />
      <Ink d={w.joints} width={W_MID} color={P.joint} />
      <Ink d={hline(-60, 1140, w.top, {seed: 'p8cope', over: 'structural'}) + hline(-60, 1140, w.lipY, {seed: 'p8lip', over: 'medium'})} width={W_FRONT} color={P.ink} />
      <path d={w.cushion} fill={P8X.ivy} />
      <path d={w.cushionLit} fill={P8X.ivyLit} />
      {w.ivy.map((c) => {
        const a = Math.sin(2 * Math.PI * 0.6 * t + rand(c.seed, 'ph') * 6.28) * 2.4;
        return (
          <g key={c.seed} transform={`rotate(${a.toFixed(2)} ${c.x} ${c.y})`}>
            <path d={c.stem} stroke={P8X.ivy} strokeWidth={2.4} fill="none" strokeLinecap="round" />
            <path d={c.dark} fill={P8X.ivy} />
            <path d={c.lit} fill={P8X.ivyLit} />
          </g>
        );
      })}
      {PIGEONS.map((pg, i) => {
        if (t >= pg.at) return null;
        const bob = Math.floor(t * 5 + i * 2) % 3 === 0 ? 1 : 0;
        const b = perched(pg.x, w.top, 1.15 * pg.s, pg.dir, bob);
        return (
          <g key={i}>
            <path d={b.legs} stroke={P8X.birdNear} strokeWidth={2.4} fill="none" />
            <path d={b.body} fill={P8X.birdNear} />
            <path d={b.wing} fill={P8X.birdBelly} />
            <path d={b.beak} fill={P.sideLit} />
          </g>
        );
      })}
    </>
  );
};

/** A pigeon in flight (screen px): the kit bird glyph, flapping fast as it climbs away over the drop, getting smaller. */
export const P8PigeonFlight: React.FC<{start: (i: number) => Pt}> = ({start}) => {
  const t = useTime();
  return (
    <>
      {PIGEONS.map((pg, i) => {
        const tau = t - pg.at;
        if (tau < 0 || tau > 1.7) return null;
        const [x0, y0] = start(i);
        const x = x0 - 230 * tau - 70 * tau * tau;
        const y = y0 - 26 - 250 * tau + 40 * tau * tau;
        const s = 24 * pg.s * (1 - 0.45 * Math.min(1, tau / 1.4));
        const flap = Math.floor(tau * 12 + i) % 2;
        return <path key={i} d={birdShape(x, y, s, flap)} fill={P8X.birdNear} stroke={P8X.birdNear} strokeWidth={Math.max(1.4, s * 0.12)} strokeLinejoin="round" />;
      })}
    </>
  );
};

/** A loose flock seen FROM ABOVE, crossing over the lawn (highway-layer px): the birds are below the camera. */
export const P8LowFlock: React.FC = () => {
  const t = useTime();
  const cx = 120 + 150 * t;
  const cy = groundY(-70) - 18;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    const lag = (i % 2 === 0 ? 1 : -1) * Math.ceil(i / 2);
    const x = cx - Math.abs(lag) * 30 + rand('p8lf', `x${i}`) * 16;
    const y = cy + lag * 9 + Math.sin(t * 3 + i) * 3;
    const s = 10 + rand('p8lf', `s${i}`) * 3;
    out.push(<path key={i} d={birdShape(x, y, s, Math.floor(t * 9 + i * 1.7) % 2)} fill={P8X.bird} stroke={P8X.bird} strokeWidth={1.4} strokeLinejoin="round" />);
  }
  return <>{out}</>;
};

/** A few birds bursting UP out of the treetops below us late in the rise (slope-layer px): the drop under the camera. */
export const TREE_BIRDS_AT = 1.8;
export const P8TreeBirds: React.FC = () => {
  const t = useTime();
  const out: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    const u = t - TREE_BIRDS_AT - i * 0.07;
    if (u < 0) continue;
    const x0 = 360 + i * 70 + rand('p8tb', `x${i}`) * 40;
    const vx = (i - 2) * 55 + rand('p8tb', `v${i}`) * 30;
    const x = x0 + vx * u;
    const y = WALL_Y_LAND - 70 - 330 * u + 90 * u * u;
    const s = 15 + rand('p8tb', `s${i}`) * 4;
    out.push(<path key={i} d={birdShape(x, y, s, Math.floor(u * 11 + i) % 2)} fill={P8X.birdNear} stroke={P8X.birdNear} strokeWidth={1.8} strokeLinejoin="round" />);
  }
  return <>{out}</>;
};
