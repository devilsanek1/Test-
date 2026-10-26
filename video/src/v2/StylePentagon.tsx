// StylePentagon: video 2, P8 (the ONE scale moment) as a G4 look-check style frame, in our v1 house style (flat fills,
// kit ink in key places only, no gradients, no texture, no paper edge). One composition, palette candidates via the
// `palette` prop:
//   "6 Dusk"            the cold sister palette for the deal beat (CORE_LINE 2), its greys retuned to a saturated dusk
//                       blue / violet ladder with warm notes (playbook "Warm, never sickly")
//   "3 Cream & Cobalt"  video 2's main palette, the same shot without the sister shift (for comparison)
// Shot (docs/v2/storyboard_g3.md P8; CINEMATIC_GUIDE S1; COZY_AND_SCALE 4 K3): the camera has risen over a low stone
// wall (its coping a dark mass across the bottom); the Pentagon at dusk, too big for the frame (cut by both side
// edges), seen across a distance from a shallow raised angle (a true ground-level view hides the five sides); rows of
// identical parked cars at its foot are the ruler; haze planes lighter with distance; the caption band (y 317-556) is
// flat sky. Fairness (CORE_LINE 2): a plain building, no flags, figures, vehicles other than parked cars, weapons, text
// or "Google"; no glow, rim or hero colour on it. Hero (cobalt / indigo) is hers only, so it is absent here; no pop.
// The move: the rise lands at 2.08 s (on "AI"), then holds; the wall drops on its own outSine over the panel (2.48 s).
// Render the landing: npx remotion still src/entry-v2.tsx StylePentagon out.png --frame=140 --props='{"palette":"6 Dusk"}'

import React, {useId} from 'react';
import {AbsoluteFill} from 'remotion';
import {Ink} from '../lib/Ink';
import {Fill} from '../lib/Fill';
import {skyCaption, skyHighlightBox, stroke} from '../lib/theme';
import {crown, hline, line, polyPath, Pt, roundRect, vline} from '../lib/sketch';
import {rng} from '../lib/rng';
import {clamp, ease, useTime} from '../lib/time';
import {MOTION} from '../lib/spec';
import {mat, Mat, XG} from '../lib/xf';
import {captionFontStack, measureCaption, useCaptionFont} from '../lib/font';

// ---------------------------------------------------------------- palettes (roles -> hex, from docs/look/palettes.json)

export type PentPal = {
  name: string;
  ink: string;
  hl: string; // caption highlight box
  // sky (the page)
  sky: string;
  glow: string; // the warm horizon band (v1's peach band behind the skyline)
  sun: string; // the low sun (the palette's disc)
  // haze planes, far -> near
  far: string; // far city, fill only
  woods: string; // the woods behind the building, fill only
  // the colossus
  roof: string; // ring roofs, catching the sky
  well: string; // light wells + corner creases
  facade: string; // the front facade, in shade
  win: string; // window rows
  lit: string; // the 2-3 lit windows (human scale)
  sideLit: string; // right side face, toward the low sun
  sideShade: string;
  lawn: string; // courtyard
  courtTree: string;
  // its foot: the ruler
  walk: string; // the walk along the facade
  lot: string;
  lotLine: string;
  car: string;
  carGlass: string;
  wheel: string;
  road: string;
  roadLine: string;
  verge: string;
  bush: string;
  // the foreground wall (the dark mass)
  coping: string; // its top face, catching the sky
  lip: string;
  wall: string; // its face toward us
  joint: string;
};

/** 6 Dusk, retuned: palette 6's mist greys (#D9DEE5 / #BAC3CE / #8A9AA8, C* 4-10) read grey, so the ladder keeps its
 *  lightness steps but in saturated dusk blue-violet (C* 25-40), with the palette's own warm notes: the low peach sun
 *  (disc #F3B27E, also the caption highlight), a peach horizon band, three lit windows, a rose-apricot lit side, warm
 *  plum shadows on the wall. Sky #A9B5EC is L* 75, 8.6:1 with the ink. Hero indigo #3E5BD0 and pop coral #FF7A4D: unused. */
const DUSK: PentPal = {
  name: '6 Dusk',
  ink: '#1C1A26',
  hl: '#F3B27E',
  sky: '#A9B5EC',
  glow: '#F7CDB3',
  sun: '#F3B27E',
  far: '#B4AEDF',
  woods: '#8784C6',
  roof: '#BEBDE8',
  well: '#7C78BA',
  facade: '#716DB0',
  win: '#55509A',
  lit: '#F7C98B',
  sideLit: '#E9AE9C',
  sideShade: '#5D599F',
  lawn: '#7C9EBB',
  courtTree: '#5D7BA6',
  walk: '#C9C7EC',
  lot: '#9D9AD3',
  lotLine: '#C3C1EC',
  car: '#38357A',
  carGlass: '#B3B9EC',
  wheel: '#1F1C33',
  road: '#B3B0E1',
  roadLine: '#F3D2B8',
  verge: '#6F6BAE',
  bush: '#5A5699',
  coping: '#6A5F98',
  lip: '#2E2750',
  wall: '#463D73',
  joint: '#2A2349',
};

/** 3 Cream & Cobalt, kept warm (playbook): the cream page as the sky, a peach band and the peach disc low on it,
 *  apricot / terracotta haze planes instead of the palette's tan mids, a terracotta facade in shade, the anchor
 *  #2B2A44 on the wall and the cars. Hero cobalt #3F7FE0 (hers only) and pop orange #EC6B2E: unused. */
const COBALT: PentPal = {
  name: '3 Cream & Cobalt',
  ink: '#2B1B0A',
  hl: '#F6B892',
  sky: '#F3E6D6',
  glow: '#F9D9C1',
  sun: '#F6B892',
  far: '#EBC4AA',
  woods: '#D9997D',
  roof: '#F5DFCC',
  well: '#D6A188',
  facade: '#C8836B',
  win: '#A5624F',
  lit: '#FBE3B0',
  sideLit: '#F3B48E',
  sideShade: '#A66957',
  lawn: '#A9BD96',
  courtTree: '#86A07E',
  walk: '#F6E6D8',
  lot: '#E7C3AA',
  lotLine: '#F6E6D8',
  car: '#2B2A44',
  carGlass: '#F6B892',
  wheel: '#1C1A26',
  road: '#F0D9C6',
  roadLine: '#D9A889',
  verge: '#CB8C70',
  bush: '#B4705A',
  coping: '#6F6283',
  lip: '#24233A',
  wall: '#45405F',
  joint: '#2B2A44',
};

export const PENTAGON_PALETTES: Record<string, PentPal> = {[DUSK.name]: DUSK, [COBALT.name]: COBALT};

/** Palette by name ("6 Dusk", "Dusk", "3 Cream & Cobalt", "Cobalt"). Default: Dusk (the sister shift for this beat). */
export function pentPalette(name?: string): PentPal {
  const n = (name ?? '').trim().replace(/^\d+\s+/, '').toLowerCase();
  if (n.includes('cobalt') || n.startsWith('cream')) return COBALT;
  return DUSK;
}

// ---------------------------------------------------------------- the camera: one perspective for building + lot
// Plan in metres: X right, Z away from us (the front facade at Z = 0), Y up. Real plan (281 m sides, a 5-acre court);
// the height is raised 23.5 -> 32 m so the facade carries five window rows. The numbers solve for the landing frame:
// front corners at x 40 / 1040 (the side vertices fall outside the frame), roof front edge y 1040, apex y 640.

const D36 = Math.PI / 5;
const EDGE = 281;
const R_OUT = EDGE / (2 * Math.sin(D36)); // circumradius
const RI_OUT = R_OUT * Math.cos(D36); // inradius: centre -> front face
const COURT = 74.3; // courtyard inradius
const WELLS: [number, number][] = [
  [166, 172],
  [142, 148],
  [118, 124],
  [94, 100],
]; // light wells (inradius ranges), outside in
const HB = 32;
const DC = 900; // camera -> front face
const HALF = 500;
const ROOF_FRONT_Y = 1040;
const APEX_Y = 640;
const F = (HALF * DC) / (EDGE / 2);
const A_ = ((ROOF_FRONT_Y - APEX_Y) * DC * (DC + R_OUT + RI_OUT)) / (R_OUT + RI_OUT); // (camera height - HB) * F
const HY = ROOF_FRONT_Y - A_ / DC;
const HC = A_ / F + HB;

const proj = (X: number, Z: number, Y = 0): Pt => [540 + (X * F) / (DC + Z), HY + ((HC - Y) * F) / (DC + Z)];
const kAt = (Z: number) => F / (DC + Z); // px per metre at depth Z
const groundY = (Z: number) => proj(0, Z, 0)[1];
/** Plan vertices of a pentagon of inradius r on the building's centre, flat side toward us:
 *  [front-left, front-right, right, apex, left]. */
const ring = (r: number): Pt[] =>
  [0, 1, 2, 3, 4].map((k) => {
    const a = ((-126 + 72 * k) * Math.PI) / 180;
    const R = r / Math.cos(D36);
    return [R * Math.cos(a), RI_OUT + R * Math.sin(a)] as Pt;
  });
const atY = (pts: Pt[], Y: number): Pt[] => pts.map(([X, Z]) => proj(X, Z, Y));
const lerpP = (a: Pt, b: Pt, u: number): Pt => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];

const W_FRONT = stroke.inkBold; // 4.8
const W_MID = stroke.ink; // 3.4
const W_THIN = stroke.inkThin; // 2.2
const W_HAIR = stroke.inkHair; // 1.6

type PP = {P: PentPal};

// ---------------------------------------------------------------- sky: flat page, the warm band, the low sun

const GLOW_TOP = 618;
const SUN = {cx: 930, cy: 668, r: 60};

const SkyBand: React.FC<PP> = ({P}) => (
  <>
    <Fill rect={[-300, GLOW_TOP, 1680, 520]} color={P.glow} offset={false} />
    <Fill d={roundRect(SUN.cx - SUN.r, SUN.cy - SUN.r, SUN.r * 2, SUN.r * 2, SUN.r)} color={P.sun} offset={false} />
  </>
);

/** Two small birds by the sun: the life in a held wide (CINEMATIC S1 / K6). Hairline ink, slow drift. */
const Birds: React.FC<{P: PentPal; t: number}> = ({P, t}) => {
  const b = (x: number, y: number, s: number, ph: number) => {
    const f = 0.55 + 0.45 * Math.sin(t * 7 + ph); // wing beat
    return `M${x - s} ${y - s * 0.5 * f}Q${x - s * 0.45} ${y - s * 0.75 * f} ${x} ${y}Q${x + s * 0.45} ${y - s * 0.75 * f} ${x + s} ${y - s * 0.5 * f}`;
  };
  const dx = -10 * t;
  return <Ink d={b(756 + dx, 622, 11, 0) + b(790 + dx * 1.2, 640, 8, 1.7)} width={W_THIN} color={P.ink} taper={false} />;
};

// ---------------------------------------------------------------- far planes (fill only, no ink: haze)

const FarCity: React.FC<PP> = ({P}) => {
  const r = rng('p8/farcity');
  let d = '';
  for (let x = -40; x < 1120; ) {
    const w = r.range(26, 74);
    const h = r.chance(0.12) ? r.range(52, 66) : r.range(14, 44);
    d += polyPath([
      [x, 760],
      [x, 702 - h],
      [x + w, 702 - h],
      [x + w, 760],
    ]);
    x += w + (r.chance(0.3) ? r.range(4, 18) : -r.range(0, 8));
  }
  return <Fill d={d} color={P.far} offset={false} />;
};

const Woods: React.FC<PP> = ({P}) => {
  const r = rng('p8/woods');
  const crowns: string[] = [];
  for (let x = -60; x < 1140; ) {
    const rx = r.range(34, 62);
    crowns.push(crown(x + rx, 716 + r.range(-6, 8), rx, r.range(20, 30), {seed: `wd${Math.round(x)}`, bumps: 6, round: 0.7}));
    x += rx * r.range(1.3, 1.7);
  }
  return (
    <>
      {crowns.map((c, i) => (
        <Fill key={i} d={c} color={P.woods} offset={false} />
      ))}
      <Fill rect={[-300, 720, 1680, 500]} color={P.woods} offset={false} />
    </>
  );
};

// ---------------------------------------------------------------- the Pentagon

/** Window quads along a face from plan point a to b: `n` columns, `rows` storeys, projected (so they foreshorten). */
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

const Pentagon: React.FC<PP> = ({P}) => {
  const clipId = 'court' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const outer = ring(RI_OUT);
  const [fl, fr, rt, ap, lf] = outer;
  const roof = atY(outer, HB);
  const base = atY(outer, 0);
  const court = ring(COURT);
  const hole = atY(court, HB);
  const floor = atY(court, 0);
  // faces
  const front = [roof[0], roof[1], base[1], base[0]];
  const left = [roof[4], roof[0], base[0], base[4]];
  const right = [roof[1], roof[2], base[2], base[1]];
  // windows: ~3.5 m bays; the front face gets three lit windows (human scale, COZY 3), never more
  const wr = rng('p8/win');
  const dark = new Set<string>();
  for (let i = 0; i < 18; i++) dark.add(`${wr.int(0, 79)},${wr.int(0, 4)}`);
  const litKeys = ['23,1', '56,3', '61,0'];
  const winFront = faceWindows(fl, fr, 80, 5, (i, j) => dark.has(`${i},${j}`) || litKeys.includes(`${i},${j}`));
  const winLit = litKeys.map((k) => {
    const [i, j] = k.split(',').map(Number);
    return faceWindows(fl, fr, 80, 5, (ii, jj) => ii !== i || jj !== j);
  });
  const winLeft = faceWindows(lf, fl, 80, 5, () => false);
  const winRight = faceWindows(fr, rt, 80, 5, () => false);
  // courtyard: its two back walls face us (window rows), the rest is lawn, a few trees
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
  // creases where the rings meet at the corners
  const creases = court.map((c, k) => line(...proj(c[0], c[1], HB), ...proj(outer[k][0], outer[k][1], HB), {over: [0, 0], seed: `cr${k}`, breaks: false})).join('');
  const roofInk = [0, 1, 2, 3, 4].map((k) => line(...roof[k], ...roof[(k + 1) % 5], {over: 'small', seed: `ro${k}`})).join('');
  const faceInk =
    vline(roof[0][0], roof[0][1], base[0][1], {over: [0, 2], seed: 'c0'}) +
    vline(roof[1][0], roof[1][1], base[1][1], {over: [0, 2], seed: 'c1'}) +
    line(...base[4], ...base[0], {over: [0, 0], seed: 'b0'}) +
    line(...base[0], ...base[1], {over: 'small', seed: 'b1'}) +
    line(...base[1], ...base[2], {over: [0, 0], seed: 'b2'});
  const holeInk = [0, 1, 2, 3, 4].map((k) => line(...hole[k], ...hole[(k + 1) % 5], {over: [0, 0], seed: `ho${k}`, breaks: false})).join('');
  return (
    <>
      <Fill d={polyPath(left)} color={P.sideShade} offset={false} />
      <Fill d={polyPath(right)} color={P.sideLit} offset={false} />
      <Fill d={polyPath(front)} color={P.facade} seed="facade" />
      <Fill d={winLeft} color={P.win} offset={false} />
      <Fill d={winRight} color={P.facade} offset={false} />
      <Fill d={winFront} color={P.win} offset={false} />
      {winLit.map((d, i) => (
        <Fill key={i} d={d} color={P.lit} offset={false} />
      ))}
      {/* the roof: ring roofs with the light wells between them */}
      <Fill d={polyPath(roof)} color={P.roof} seed="roof" />
      {WELLS.map(([a, b], i) => (
        <React.Fragment key={i}>
          <Fill d={polyPath(atY(ring(b), HB))} color={P.well} offset={false} />
          <Fill d={polyPath(atY(ring(a), HB))} color={P.roof} offset={false} />
        </React.Fragment>
      ))}
      <Ink d={creases} width={W_THIN} color={P.well} taper={false} />
      {/* the courtyard (a hole in the roof): back walls, then the lawn and trees seen over the near wall */}
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <path d={polyPath(hole)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <Fill d={polyPath(hole)} color={P.facade} offset={false} />
        <Fill d={winCourt} color={P.win} offset={false} />
        <Fill d={polyPath(floor)} color={P.lawn} offset={false} />
        {trees.map((d, i) => (
          <Fill key={i} d={d} color={P.courtTree} offset={false} />
        ))}
      </g>
      <Ink d={holeInk} width={W_HAIR} color={P.ink} />
      <Ink d={roofInk + faceInk} width={W_THIN} color={P.ink} />
    </>
  );
};

// ---------------------------------------------------------------- the lot: rows of identical parked cars (the ruler)

const CAR_M = 8.2; // car length in plan metres (4.7 m drawn 1.75x so it reads; the building is 1.36x too)
const ROWS = [-24, -80, -136];
const LOT_END = -170;
const ROAD: [number, number] = [-172, -194];

/** One car, side view, facing right, length L, wheels on (x, y). Returns [body, glass, wheels] paths. */
function carPaths(x: number, y: number, L: number): [string, string, string] {
  const p = (u: number, v: number): Pt => [x + u * L, y + v * L];
  const body = roundRect(x, y - 0.27 * L, L, 0.2 * L, 0.07 * L) + polyPath([p(0.2, -0.26), p(0.31, -0.42), p(0.68, -0.42), p(0.81, -0.26)]);
  const glass = polyPath([p(0.27, -0.28), p(0.345, -0.395), p(0.48, -0.395), p(0.48, -0.28)]) + polyPath([p(0.52, -0.28), p(0.52, -0.395), p(0.655, -0.395), p(0.74, -0.28)]);
  const wr = 0.085 * L;
  const wheel = (u: number) => roundRect(x + u * L - wr, y - 0.06 * L - wr, wr * 2, wr * 2, wr);
  return [body, glass, wheel(0.21) + wheel(0.79)];
}

/** The lot's surface: drawn under the building (its top edge hides behind the facade during the rise). */
const LotGround: React.FC<PP> = ({P}) => {
  const top = groundY(0);
  return <Fill rect={[-300, top - 60, 1680, groundY(LOT_END) - top + 60]} color={P.lot} offset={false} />;
};

const Lot: React.FC<PP> = ({P}) => {
  const top = groundY(0);
  const lines = [-52, -108, -164].map((Z, i) => {
    const y = groundY(Z);
    return <Fill key={i} rect={[-60, y - 0.25 * kAt(Z), 1200, Math.max(2, 0.5 * kAt(Z))]} color={P.lotLine} offset={false} />;
  });
  const rows = ROWS.map((Z, ri) => {
    const r = rng(`p8/row${ri}`);
    const k = kAt(Z);
    const L = CAR_M * k;
    const y = groundY(Z);
    let body = '';
    let glass = '';
    let wheels = '';
    for (let x = -L * r.range(0.2, 0.9); x < 1080 + L; x += L * 1.36) {
      if (r.chance(0.14)) continue; // an empty bay
      const [b, g, w] = carPaths(x, y, L);
      body += b;
      glass += g;
      wheels += w;
    }
    return (
      <React.Fragment key={ri}>
        <Fill d={wheels} color={P.wheel} offset={false} />
        <Fill d={body} color={P.car} offset={false} />
        <Fill d={glass} color={P.carGlass} offset={false} />
      </React.Fragment>
    );
  });
  return (
    <>
      <Fill rect={[-300, top, 1680, groundY(-7) - top]} color={P.walk} offset={false} />
      {lines}
      {rows}
    </>
  );
};

const RoadVerge: React.FC<PP> = ({P}) => {
  const y0 = groundY(ROAD[0]);
  const y1 = groundY(ROAD[1]);
  const k = kAt((ROAD[0] + ROAD[1]) / 2);
  const ym = (y0 + y1) / 2;
  let dash = '';
  for (let x = -20; x < 1100; x += 9 * k) dash += polyPath([[x, ym - 0.3 * k], [x + 4.5 * k, ym - 0.3 * k], [x + 4.5 * k, ym + 0.3 * k], [x, ym + 0.3 * k]]);
  return (
    <>
      <Fill rect={[-300, groundY(LOT_END), 1680, y0 - groundY(LOT_END) + 1]} color={P.lotLine} offset={false} />
      <Fill rect={[-300, y0, 1680, y1 - y0 + 1]} color={P.road} offset={false} />
      <Fill d={dash} color={P.roadLine} offset={false} />
      <Fill rect={[-300, y1, 1680, 1400]} color={P.verge} offset={false} />
    </>
  );
};

/** A low hedge along the near side of the verge, half behind the wall's coping. */
const Hedge: React.FC<PP> = ({P}) => {
  const r = rng('p8/hedge');
  const crowns: string[] = [];
  for (let x = -70; x < 1150; ) {
    const rx = r.range(46, 78);
    crowns.push(crown(x + rx, WALL_Y - 6 + r.range(-4, 6), rx, r.range(30, 46), {seed: `hd${Math.round(x)}`, bumps: 7, round: 0.7}));
    x += rx * r.range(1.35, 1.8);
  }
  return (
    <>
      {crowns.map((c, i) => (
        <Fill key={i} d={c} color={P.bush} offset={false} />
      ))}
    </>
  );
};

// ---------------------------------------------------------------- the wall (foreground, the dark mass we rose over)

const WALL_Y = 1664; // the coping's top edge at the landing

const Wall: React.FC<PP> = ({P}) => {
  const top = WALL_Y;
  const lipY = top + 42;
  const faceY = lipY + 20;
  const r = rng('p8/wall');
  // coping joints (slabs ~250 px) and stone courses on the face, staggered
  let joints = '';
  for (let x = r.range(60, 180); x < 1080; x += r.range(230, 290)) joints += line(x, top + 3, x + 6, lipY - 2, {over: [0, 0], seed: `cj${Math.round(x)}`});
  const courses = [faceY + 70, faceY + 140, faceY + 210];
  courses.forEach((y, i) => (joints += hline(-40, 1120, y, {seed: `wc${i}`, over: [0, 0]})));
  [faceY, ...courses].forEach((y0, i) => {
    for (let x = (i % 2) * 90 + r.range(40, 110); x < 1080; x += r.range(150, 210)) joints += vline(x, y0 + 4, y0 + 66, {over: [0, 0], seed: `wv${i}-${Math.round(x)}`});
  });
  return (
    <>
      <Fill rect={[-300, faceY, 1680, 1400]} color={P.wall} offset={false} />
      <Fill rect={[-300, top, 1680, lipY - top]} color={P.coping} seed="coping" />
      <Fill rect={[-300, lipY, 1680, faceY - lipY]} color={P.lip} offset={false} />
      <Ink d={joints} width={W_MID} color={P.joint} />
      <Ink d={hline(-60, 1140, top, {seed: 'cope', over: 'structural'}) + hline(-60, 1140, lipY, {seed: 'lip', over: 'medium'})} width={W_FRONT} color={P.ink} />
    </>
  );
};

// ---------------------------------------------------------------- the caption (screen space, on flat sky)

const Caption: React.FC<PP> = ({P}) => {
  const ok = useCaptionFont();
  if (!ok) return null;
  const lines = ['a deal letting the', 'Pentagon use its AI'];
  const hl = 'Pentagon';
  let size: number = skyCaption.size;
  const widest = Math.max(...lines.map((l) => measureCaption(l, size)));
  if (widest > skyCaption.maxWidth) size = Math.floor((size * skyCaption.maxWidth) / widest);
  const pitch = ((skyCaption.line2 - skyCaption.line1) * size) / skyCaption.size;
  const base = [skyCaption.oneLine - pitch / 2, skyCaption.oneLine + pitch / 2];
  const l2 = lines[1];
  const lw = measureCaption(l2, size);
  const x0 = skyCaption.cx - lw / 2 + measureCaption(l2.slice(0, l2.indexOf(hl)), size);
  const pad = skyHighlightBox.padEm * size;
  const bw = measureCaption(hl, size) + pad * 2;
  return (
    <g>
      <rect x={x0 - pad} y={base[1] - skyHighlightBox.topEm * size} width={bw} height={(skyHighlightBox.topEm + skyHighlightBox.bottomEm) * size} rx={skyHighlightBox.radiusEm * size} fill={P.hl} />
      {lines.map((l, i) => (
        <text key={i} x={skyCaption.cx} y={base[i]} textAnchor="middle" fontFamily={captionFontStack} fontSize={size} fill={P.ink}>
          {l}
        </text>
      ))}
    </g>
  );
};

// ---------------------------------------------------------------- the frame

export type StylePentagonProps = {
  /** "6 Dusk" (default) | "3 Cream & Cobalt". */
  palette?: string;
  /** Draw the landing caption in the band (default true). */
  caption?: boolean;
};

/** The rise (S1 / K3, board P8): the camera lands at MOVE (on "AI"), the wall drops on its own over the panel. */
const MOVE = 2.08;
const PANEL = 2.48;
/** Start offsets (px, up) per layer at the cut; 0 at the landing. Nearer layers travel further (parallax); the
 *  colossus stays below y 600 throughout (the caption band is flat sky from the first frame). */
const TRAVEL = {far: 14, woods: 28, pentagon: 46, lot: 70, road: 100, verge: 170, hedge: 420, wall: 700};

export const StylePentagon: React.FC<StylePentagonProps> = ({palette: name = DUSK.name, caption = true}) => {
  const P = pentPalette(name);
  const t = useTime();
  const p = MOTION.camera.reveal(clamp(t / MOVE));
  const pw = ease.outSine(clamp(t / PANEL));
  // push 1.00 -> 1.04 during the rise (the frame is designed at the landing, i.e. at 1.04)
  const z = (1 + 0.04 * p) / 1.04;
  const cam = mat.about(mat.scale(z), 540, 960);
  const layer = (travel: number, prog = p): Mat => mat.compose(cam, mat.translate(0, -travel * (1 - prog)));
  return (
    <AbsoluteFill style={{background: P.sky, overflow: 'hidden'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        <rect x={0} y={0} width={1080} height={1920} fill={P.sky} />
        <XG m={layer(TRAVEL.far)}>
          <SkyBand P={P} />
          <FarCity P={P} />
        </XG>
        <Birds P={P} t={t} />
        <XG m={layer(TRAVEL.woods)}>
          <Woods P={P} />
        </XG>
        <XG m={layer(TRAVEL.lot)}>
          <LotGround P={P} />
        </XG>
        <XG m={layer(TRAVEL.pentagon)}>
          <Pentagon P={P} />
        </XG>
        <XG m={layer(TRAVEL.lot)}>
          <Lot P={P} />
        </XG>
        <XG m={layer(TRAVEL.road)}>
          <RoadVerge P={P} />
        </XG>
        <XG m={layer(TRAVEL.hedge, pw)}>
          <Hedge P={P} />
        </XG>
        <XG m={layer(TRAVEL.wall, pw)}>
          <Wall P={P} />
        </XG>
        {caption ? <Caption P={P} /> : null}
      </svg>
    </AbsoluteFill>
  );
};
