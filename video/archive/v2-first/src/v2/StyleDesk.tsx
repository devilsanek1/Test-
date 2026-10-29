// StyleDesk: video 2, FRAME 0 / O1 (the opening desk insert) as a G4 look-check style frame, in our v1 house style
// (flat fills, kit ink, misregistered fills, no gradients, no paper edge, texture off). One composition, three palette
// candidates via the `palette` prop:
//   A "Cream & Cobalt"   palette 3, warmed (peach / apricot mids, red-brown wood, golden pool, dusk-blue window)
//   B "Autumn Ember"     palette 9 (v3's approved warm palette)
//   C "Sage Study"       palette 5 room, palette 6 "Dusk" in the window (the sister-palette shift; Dusk's indigo, not
//                        its grey mists: "a saturated dusk blue, never grey")
// Colour jobs (PALETTE.md, CORE_LINE.md §2): hero = HER (the sleeve) + her badge lanyard, never "Google"; anchor = lamp
// shade, pen, highlighter body, coffee, the far roofs; ONE pop = the highlighted clause (band + highlighter tip).
// Shot: docs/v2/storyboard_g3.md O1 (HOME BASE desk, COZY, INSERT high 3/4, PULL OUT 1.05 -> 1.00 ease-in over 6.12 s):
// the contract in a golden lamp pool, signed, the clause "no criticizing / Google" highlighted, her sleeve holding the
// highlighter, her GOOGLE badge (hand-lettered) dropped in a cardboard box with its lanyard spilling over the rim, a
// steaming mug, a pen; a bookcase cut by the top on the left with a short wall shelf + trailing plant (the top-edge
// object, above the words), a dusk window cut by the right edge (only the gutters rise through y 317-556); the lamp
// head cut by the right edge; a wastebasket in the knee space. Frame-0 words in screen space on the flat wall.
// Finals (frame 0, full scale): review/look/v2_g4/desk_A.png / desk_B.png / desk_C.png.
// Fairness: generic figure (sleeve + hand only), no logo, no military imagery.
// Render: npx remotion still src/entry-v2.tsx StyleDesk out.png --props='{"palette":"A"}'

import React, {createContext, useContext, useId} from 'react';
import {AbsoluteFill} from 'remotion';
import {Ink as KitInk, InkProps, parseInk} from '../lib/Ink';
import {bbox, Fill as KitFill, FillProps} from '../lib/Fill';
import {skyCaption, skyHighlightBox, stroke} from '../lib/theme';
import {blob, circle, crown, ellipse, glint, hline, line, poly, polyPath, Pt, rect, rectPath, roundRect, smooth, textLines, vline} from '../lib/sketch';
import {rng} from '../lib/rng';
import {prog, useTime} from '../lib/time';
import {mat, Mat, useXf, XG} from '../lib/xf';
import {captionFontStack, measureCaption, useCaptionFont} from '../lib/font';

// ---------------------------------------------------------------- palettes (roles -> hex, from docs/look/palettes.json)

export type DeskPal = {
  name: string;
  ink: string;
  // room
  wall: string; // the page (PALETTE bg)
  wallShade: string; // bookcase back, window reveal, baseboard
  shelf: string; // bookcase wood
  books: string[];
  desk: string; // desk top (L* <= 80 so the pool reads)
  deskFront: string; // apron + leg
  deskShade: string; // cast shadows on the desk (warm)
  floor: string;
  under: string; // the floor under the desk (warm shade, never grey)
  ring: string; // lamp pool, outer ring
  core: string; // lamp pool core + lit lamp mouth
  // props
  paper: string; // the contract (the lightest thing in the frame)
  paperEdge: string; // its underside / the folder in the box
  box: string; // cardboard
  boxSide: string;
  boxIn: string;
  pot: string;
  leaf: string;
  frame: string; // photo frame in the box
  badge: string;
  badgeBand: string;
  photo: string;
  skin: string;
  nail: string;
  mug: string;
  mugBand: string;
  // the window
  trim: string;
  sill: string;
  sky: string;
  cloud: string;
  far: string;
  roofs: string;
  lit: string;
  moon: string;
  star: string;
  // the references' trick
  hero: string;
  anchor: string;
  pop: string;
  hl: string; // caption highlight box
  muted: string; // the credit line
};

const INK = '#2B1B0A';

/** A, 3 Cream & Cobalt (CORE_LINE §2's pick), warmed per the "warm, never sickly" rule: cream page, apricot desk,
 *  red-brown wood, golden pool, saturated dusk-blue window (added: palette 3 has no night blues). Cobalt hero ONLY on
 *  her sleeve + lanyard; the orange pop ONLY on the highlighted line. */
const COBALT: DeskPal = {
  name: 'Cream & Cobalt',
  ink: INK,
  wall: '#F3E6D6',
  wallShade: '#EBCFB5',
  shelf: '#DFA27A',
  books: ['#F6B892', '#C8714E', '#EBCFB5', '#9A5236', '#E9B47A', '#F3E6D6', '#D98A62'],
  desk: '#DC9C74',
  deskFront: '#C27D57',
  deskShade: '#C9875F',
  floor: '#CB8C66',
  under: '#A8644A',
  ring: '#F7CF9C',
  core: '#FBE6C6',
  paper: '#FFF8EE',
  paperEdge: '#E9C9AA',
  box: '#E3B07B',
  boxSide: '#CC9260',
  boxIn: '#A9704A',
  pot: '#C8714E',
  leaf: '#5E8C6A',
  frame: '#9A5236',
  badge: '#FFF8EE',
  badgeBand: '#F6B892',
  photo: '#EBCFB5',
  skin: '#EDB894',
  nail: '#F8DAC4',
  mug: '#F3E6D6',
  mugBand: '#F6B892',
  trim: '#A65A3C',
  sill: '#F3E6D6',
  sky: '#4D5C99',
  cloud: '#5C6BA6',
  far: '#3D4A85',
  roofs: '#2B2A44',
  lit: '#F7C98B',
  moon: '#FBE6C6',
  star: '#F3E6D6',
  hero: '#3F7FE0',
  anchor: '#2B2A44',
  pop: '#EC6B2E',
  hl: '#F6B892',
  muted: '#7A5038',
};

/** B, 9 Autumn Ember (v3's approved warm palette): peach cream, terracotta-apricot desk, warm red-brown wood, golden
 *  pool, saturated dusk-blue window. Burnt-orange hero on her sleeve + lanyard; the blue pop on the highlighted line. */
const EMBER: DeskPal = {
  name: 'Autumn Ember',
  ink: INK,
  wall: '#F6E3D4',
  wallShade: '#EBC2A4',
  shelf: '#E6B293',
  books: ['#F2B263', '#F4A988', '#EBC2A4', '#9A4A2E', '#D9805A', '#F6E3D4', '#C98A64'],
  desk: '#DA9670',
  deskFront: '#BF7650',
  deskShade: '#C7845C',
  floor: '#C8805A',
  under: '#A85A3C',
  ring: '#F7C98B',
  core: '#FBE6C2',
  paper: '#FFF7EE',
  paperEdge: '#EBC2A4',
  box: '#EDBD86',
  boxSide: '#D6A06A',
  boxIn: '#AE6A42',
  pot: '#D9805A',
  leaf: '#3F5A3C',
  frame: '#9A4A2E',
  badge: '#FFF7EE',
  badgeBand: '#F4A988',
  photo: '#EBC2A4',
  skin: '#EBAA84',
  nail: '#F8D6BF',
  mug: '#F6E3D4',
  mugBand: '#D9805A',
  trim: '#9A4A2E',
  sill: '#F6E3D4',
  sky: '#5B6A94',
  cloud: '#68779F',
  far: '#46527C',
  roofs: '#323A5E',
  lit: '#F7B65E',
  moon: '#FBE6C2',
  star: '#E6EBF7',
  hero: '#D9542F',
  anchor: '#3A1F16',
  pop: '#2F8EEB',
  hl: '#F4A988',
  muted: '#7F4632',
};

/** C, 5 Sage Study room + 6 Dusk window: sage and oat walls, sage wood, a warm honey desk and golden pool (warmed: the
 *  owner's "not sick" rule), forest anchor, teal hero on her sleeve + lanyard, the amber pop on the highlighted line.
 *  The window takes Dusk's indigo night, peach moon and lit window (its grey mists are not used). */
const SAGE: DeskPal = {
  name: 'Sage Study',
  ink: INK,
  wall: '#EEF0E3',
  wallShade: '#D7E0C8',
  shelf: '#9DB39A',
  books: ['#D7E0C8', '#F2D49B', '#9DB39A', '#E3B08C', '#D9A27E', '#F0E2BF', '#C98A64'],
  desk: '#D49A72',
  deskFront: '#B87C58',
  deskShade: '#C38960',
  floor: '#CC9068',
  under: '#A66A4C',
  ring: '#F2D49B',
  core: '#F0E2BF',
  paper: '#FBF8EE',
  paperEdge: '#D7E0C8',
  box: '#E3B67F',
  boxSide: '#CC9C66',
  boxIn: '#A06E46',
  pot: '#C98A64',
  leaf: '#4E7A5C',
  frame: '#B87C58',
  badge: '#FBF8EE',
  badgeBand: '#F2D49B',
  photo: '#D7E0C8',
  skin: '#E6AE88',
  nail: '#F5D9C4',
  mug: '#F0E2BF',
  mugBand: '#9DB39A',
  trim: '#9DB39A',
  sill: '#F0E2BF',
  sky: '#5266B0',
  cloud: '#6275BA',
  far: '#3A4A92',
  roofs: '#1F2433',
  lit: '#F3B27E',
  moon: '#F3B27E',
  star: '#D9DEE5',
  hero: '#1F8A78',
  anchor: '#22332C',
  pop: '#F2A541',
  hl: '#F2D49B',
  muted: '#5C5A46',
};

export const DESK_PALETTES: Record<string, DeskPal> = {[COBALT.name]: COBALT, [EMBER.name]: EMBER, [SAGE.name]: SAGE};

/** Palette by name ("Cream & Cobalt", "3 Cream & Cobalt", ...) or candidate letter ("A" / "B" / "C"). */
export function deskPalette(name?: string): DeskPal {
  const n = (name ?? '').trim().replace(/^\d+\s+/, '').toLowerCase();
  if (n === 'b' || n.includes('ember') || n.startsWith('autumn')) return EMBER;
  if (n === 'c' || n.startsWith('sage') || n.includes('dusk')) return SAGE;
  return COBALT;
}

// ---------------------------------------------------------------- the opening build (StyleDeskOpen.tsx)
// Without a provider every piece renders as the finished style frame (StyleDesk). Inside <DeskBuild.Provider> the
// scene is MADE: each ink drawing draws on when the ink wave reaches its centre, each fill is plain paper until the
// colour wave reaches its centre, then flips whole in one frame (the engine's opening cascade, ENGINE.md <Look>), and
// the hand lettering writes on left to right. Centres are world points (the camera removed via `uncam`).

export type DeskBuildV = {
  /** Draw-on start (s) of an ink drawing centred at world point c. */
  inkAt: (c: Pt) => number;
  /** Time (s) the colour reaches world point c (paper before). */
  colourAt: (c: Pt) => number;
  /** The bare-line state's paper colour. */
  paper: string;
  /** Inverse of the camera matrix (screen -> world). */
  uncam: Mat;
  /** The signature's own draw-on (pace free). */
  sig?: {at: number; dur: number};
};
export const DeskBuild = createContext<DeskBuildV | null>(null);

const worldCentre = (b: DeskBuildV, m: Mat, d: string): Pt => {
  const bb = bbox(d);
  return apply(mat.mul(b.uncam, m), bb.x + bb.w / 2, bb.y + bb.h / 2);
};

/** Kit Fill; paper until the colour wave reaches it (inside a DeskBuild). */
const Fill: React.FC<FillProps> = (p) => {
  const b = useContext(DeskBuild);
  const m = useXf();
  const t = useTime();
  if (!b) return <KitFill {...p} />;
  const d = p.d ?? (p.rect ? rectPath(p.rect[0], p.rect[1], p.rect[2], p.rect[3]) : '');
  return <KitFill {...p} color={t < b.colourAt(worldCentre(b, m, d)) ? b.paper : p.color} />;
};

/** Kit Ink; draws on when the ink wave reaches it (inside a DeskBuild; big groups draw all strokes at once). */
const Ink: React.FC<InkProps> = (p) => {
  const b = useContext(DeskBuild);
  const m = useXf();
  if (!b || p.at !== undefined) return <KitInk {...p} />;
  const n = parseInk(p.d).subs.length;
  return <KitInk {...p} at={b.inkAt(worldCentre(b, m, p.d))} order={n > 5 ? 'all' : p.order} />;
};

// ---------------------------------------------------------------- layout (canvas px at camera rest)

const DESK_BACK = 668; // the desk's back edge (the wall line)
export const DESK_FRONT = 1384; // the desk's front edge
export const APRON = 76; // front face height
const DESK_R: [number, number] = [996, 1044]; // the desk's right end, back -> front (it widens toward us)
const LEG = {x: 1006, w: 30, foot: 1768};
const FLOOR_Y = 1080; // the wall-floor line past the desk's right end
export const PAGE = {x: 334, y: 704, w: 420, h: 500, rot: -2.5};
const POOL = {cx: 575, cy: 965, rx: 380, ry: 255};
const REVEAL_X = 932; // the window's wall opening (only the right gutter rises through the caption band)
const FRAME_X = 950;
const GLASS_X = 964;
const SILL_Y = 636;
const TRANSOM_Y = 262;
const W_MID = stroke.ink; // 3.4
const W_THIN = stroke.inkThin; // 2.2
const W_HAIR = stroke.inkHair; // 1.6
const W_FRONT = stroke.inkBold; // 4.8

type PP = {P: DeskPal};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const apply = (m: Mat, x: number, y: number): Pt => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
const add = (a: Pt, b: Pt, k = 1): Pt => [a[0] + b[0] * k, a[1] + b[1] * k];
const dirDeg = (deg: number): Pt => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
export const PAGE_M: Mat = mat.compose(mat.translate(PAGE.x + PAGE.w / 2, PAGE.y + PAGE.h / 2), mat.rotate(PAGE.rot), mat.translate(-PAGE.w / 2, -PAGE.h / 2));

/** Hand-lettered text (the caption hand font), SVG text in the current coordinates. */
/** A pointed leaf: from its stem (x, y) toward `deg`, length `len`. */
const leafPath = (x: number, y: number, len: number, deg: number): string => {
  const u = dirDeg(deg);
  const n: Pt = [-u[1], u[0]];
  const w = len * 0.42;
  const tip = add([x, y], u, len);
  const c1 = add(add([x, y], u, len * 0.5), n, w);
  const c2 = add(add([x, y], u, len * 0.5), n, -w);
  return `M${x} ${y}Q${c1[0]} ${c1[1]} ${tip[0]} ${tip[1]}Q${c2[0]} ${c2[1]} ${x} ${y}Z`;
};

const Letter: React.FC<{x: number; y: number; size: number; fill: string; anchor?: 'start' | 'middle'; children: React.ReactNode}> = ({x, y, size, fill, anchor = 'start', children}) => {
  const b = useContext(DeskBuild);
  const m = useXf();
  const t = useTime();
  let style: React.CSSProperties | undefined;
  if (b) {
    // inside a DeskBuild the words write on, left to right, when the ink wave reaches them
    const p = prog(t, b.inkAt(apply(mat.mul(b.uncam, m), x + size, y - size * 0.35)), 0.2);
    if (p <= 0) return null;
    if (p < 1) style = {clipPath: `inset(-30% ${((1 - p) * 100).toFixed(1)}% -30% -5%)`};
  }
  return (
    <text x={x} y={y} fontFamily={captionFontStack} fontSize={size} fill={fill} textAnchor={anchor} style={style}>
      {children}
    </text>
  );
};

// ---------------------------------------------------------------- the bookcase (left, cut by the top; the gutter only)

type Book = {x: number; w: number; h: number; c: string; band: number; band2: boolean};

function bookRow(x0: number, x1: number, hMin: number, hMax: number, P: DeskPal, seed: string): Book[] {
  const r = rng(`v2books/${seed}`);
  const out: Book[] = [];
  let x = x0;
  while (x < x1 - 14) {
    const w = Math.min(r.range(19, 32), x1 - x);
    out.push({x, w, h: r.range(hMin, hMax), c: r.chance(0.14) ? P.anchor : r.pick(P.books), band: r.range(0.12, 0.26), band2: r.chance(0.45)});
    x += w + (r.chance(0.18) ? r.range(2, 5) : 0);
  }
  return out;
}

const Books: React.FC<{P: DeskPal; x0: number; x1: number; base: number; hMin: number; hMax: number; seed: string}> = ({P, x0, x1, base, hMin, hMax, seed}) => {
  const row = bookRow(x0, x1, hMin, hMax, P, seed);
  let ink = '';
  const fills = row.map((b, i) => {
    const y = base - b.h;
    ink += rect(b.x, y, b.w, b.h, {seed: `${seed}/r${i}`, over: 'small', edges: 'tlr'});
    ink += hline(b.x + 2, b.x + b.w - 2, y + b.h * b.band, {seed: `${seed}/b${i}`, over: [1, 1]});
    if (b.band2) ink += hline(b.x + 2, b.x + b.w - 2, y + b.h * (1 - b.band * 0.7), {seed: `${seed}/c${i}`, over: [1, 1]});
    return <Fill key={i} rect={[b.x, y, b.w, b.h]} color={b.c} seed={`${seed}/${i}`} />;
  });
  return (
    <>
      {fills}
      <Ink d={ink} width={W_THIN} />
    </>
  );
};

const BC = {x0: -40, up: 76, upW: 20, boards: [-10, 226, 588]};

export const Bookcase: React.FC<PP> = ({P}) => {
  const ux = BC.up;
  let boards = '';
  BC.boards.forEach((y, i) => {
    boards += hline(BC.x0, ux, y, {seed: `bct${i}`, over: [0, 2]}) + hline(BC.x0, ux, y + 16, {seed: `bcb${i}`, over: [0, 2]});
  });
  return (
    <>
      <Fill rect={[BC.x0, -40, ux - BC.x0, DESK_BACK + 40]} color={P.wallShade} offset={false} />
      <Books P={P} x0={-34} x1={ux - 4} base={BC.boards[1]} hMin={150} hMax={206} seed="top" />
      <Books P={P} x0={-34} x1={ux - 12} base={BC.boards[2]} hMin={118} hMax={164} seed="mid" />
      {BC.boards.map((y, i) => (
        <Fill key={i} rect={[BC.x0, y, ux - BC.x0, 16]} color={P.shelf} seed={`bcboard${i}`} />
      ))}
      <Fill rect={[ux, -40, BC.upW, DESK_BACK + 40]} color={P.shelf} offset={false} />
      <Ink d={boards} width={W_MID} />
      <Ink d={vline(ux, -40, DESK_BACK, {over: [0, 0], seed: 'bcu1'}) + vline(ux + BC.upW, -40, DESK_BACK, {over: [0, 0], seed: 'bcu2'})} width={W_MID} />
    </>
  );
};

/** Three books lying flat at the desk's back-left (abundance at the edges). */
export const BookStack: React.FC<PP> = ({P}) => {
  const bk: [number, number, number, string][] = [
    [-40, 684, 150, P.books[1]],
    [-40, 660, 128, P.books[4]],
    [-40, 640, 140, P.anchor],
  ];
  return (
    <>
      {bk.map(([x, y, w, c], i) => {
        const h = i === 0 ? 28 : i === 1 ? 24 : 20;
        return (
          <React.Fragment key={i}>
            <Fill rect={[x, y, w, h]} color={c} seed={`stk${i}`} />
            <Ink d={rect(x, y, w, h, {seed: `stkI${i}`, over: 'small', edges: 'tbr'}) + vline(x + w - 14, y + 3, y + h - 3, {over: [0, 0], seed: `stkS${i}`})} width={W_THIN} />
          </React.Fragment>
        );
      })}
    </>
  );
};

/** The top-edge object (COZY 2): a short wall shelf off the bookcase, its books cut by the top at frame 0, a pot whose
 *  trailing plant hangs over the board (a sign of care). Stays above y 250, left of the words. */
export const TopShelf: React.FC<PP> = ({P}) => {
  const x0 = BC.up + BC.upW;
  const x1 = 404;
  const y = 176;
  const pot: Pt[] = [
    [292, 132],
    [340, 132],
    [334, y],
    [298, y],
  ];
  const vines: Pt[][] = [
    [
      [304, 170],
      [294, 196],
      [298, 222],
      [288, 246],
    ],
    [
      [326, 172],
      [340, 198],
      [336, 220],
      [352, 238],
    ],
  ];
  // [stem x, stem y, direction deg]
  const leaves: [number, number, number][] = [
    [296, 190, 160],
    [298, 212, 20],
    [292, 236, 165],
    [292, 248, 70],
    [338, 192, 15],
    [337, 214, 165],
    [346, 232, 25],
    [352, 240, 95],
  ];
  const brackets = [x0 + 34, x1 - 46].map((bx) => [
    [bx, y + 16],
    [bx + 30, y + 16],
    [bx, y + 50],
  ] as Pt[]);
  return (
    <>
      <Books P={P} x0={x0 + 8} x1={252} base={y} hMin={162} hMax={198} seed="top2" />
      {brackets.map((b, i) => (
        <React.Fragment key={i}>
          <Fill d={polyPath(b)} color={P.shelf} seed={`brk${i}`} />
          <Ink d={poly(b, {closed: true, seed: `brkI${i}`, over: [0, 0]})} width={W_THIN} />
        </React.Fragment>
      ))}
      <Fill d={polyPath(pot)} color={P.pot} seed="tpot" />
      <Ink d={poly(pot, {closed: true, seed: 'tpotI', over: 'small'})} width={W_THIN} />
      <Fill d={crown(316, 118, 34, 30, {seed: 'tleaf', bumps: 7, round: 0.7})} color={P.leaf} seed="tleafF" />
      <Ink d={crown(316, 118, 34, 30, {seed: 'tleaf', bumps: 7, round: 0.7})} width={W_THIN} open={0.3} />
      <Fill rect={[x0, y, x1 - x0, 16]} color={P.shelf} seed="tboard" />
      <Ink d={rect(x0, y, x1 - x0, 16, {seed: 'tboardI', over: [0, 2], edges: 'tbr'})} width={W_MID} />
      <Ink d={vines.map((v) => smooth(v)).join('')} width={W_THIN} />
      {leaves.map(([lx, ly, deg], i) => (
        <Fill key={i} d={leafPath(lx, ly, 24, deg)} color={P.leaf} offset={false} />
      ))}
      <Ink d={leaves.map(([lx, ly, deg]) => leafPath(lx, ly, 24, deg)).join('')} width={W_HAIR} open={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- the window (right, cut by the top and right edges)

const Outside: React.FC<{P: DeskPal; t: number}> = ({P, t}) => {
  const fr = rng('v2stars');
  const stars: Pt[] = [
    [996, 86],
    [1052, 318],
    [992, 410],
    [1062, 486],
    [1010, 230],
  ];
  const drift = (t * 6) % 260;
  return (
    <>
      <rect x={GLASS_X - 10} y={-60} width={240} height={SILL_Y + 80} fill={P.sky} />
      {/* two flat cloud bars drifting slowly (steady weather outside) */}
      <rect x={GLASS_X - 120 + drift} y={196} width={150} height={12} rx={6} fill={P.cloud} />
      <rect x={GLASS_X - 40 + drift * 0.8} y={214} width={90} height={10} rx={5} fill={P.cloud} />
      {/* the moon: a crescent (the moon disc bitten by a sky disc) */}
      <circle cx={1034} cy={146} r={30} fill={P.moon} />
      <circle cx={1048} cy={136} r={26} fill={P.sky} />
      {stars.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={fr.range(2.8, 4.4)} fill={P.star} />
      ))}
      {/* far roofs, then one near gable with the one lit window (only ours would be in the pop) */}
      <path d={polyPath([[GLASS_X - 10, 572], [990, 556], [1004, 566], [1004, 540], [1036, 518], [1068, 540], [1140, 540], [1140, 660], [GLASS_X - 10, 660]])} fill={P.far} />
      <path d={polyPath([[GLASS_X - 10, 604], [1000, 604], [1040, 576], [1080, 604], [1140, 604], [1140, 660], [GLASS_X - 10, 660]])} fill={P.roofs} />
      <rect x={1004} y={560} width={14} height={30} fill={P.roofs} />
      <rect x={1032} y={612} width={15} height={18} fill={P.lit} />
    </>
  );
};

export const WindowView: React.FC<{P: DeskPal; t: number}> = ({P, t}) => {
  const id = 'v2glass' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const b = useContext(DeskBuild);
  const paper = b !== null && t < b.colourAt([GLASS_X + 100, 330]);
  return (
    <>
      {/* the reveal (wall depth), the frame band, the glass */}
      <Fill rect={[REVEAL_X, -40, FRAME_X - REVEAL_X, SILL_Y + 40]} color={P.wallShade} offset={false} />
      <Fill rect={[FRAME_X, -40, GLASS_X - FRAME_X, SILL_Y + 40]} color={P.trim} offset={false} />
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <rect x={GLASS_X} y={-60} width={240} height={SILL_Y + 60} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{paper ? <rect x={GLASS_X - 10} y={-60} width={240} height={SILL_Y + 80} fill={b.paper} /> : <Outside P={P} t={t} />}</g>
      <Fill rect={[GLASS_X, TRANSOM_Y, 200, 14]} color={P.trim} offset={false} />
      <Ink d={vline(REVEAL_X, -40, SILL_Y, {over: [0, 0], seed: 'rv'}) + vline(GLASS_X, -40, SILL_Y, {over: [0, 0], seed: 'gl'}) + rect(GLASS_X, TRANSOM_Y, 200, 14, {seed: 'tr', over: [0, 0], edges: 'tb'})} width={W_MID} />
      <Ink d={glint(1000, 560 - 150, 40, {seed: 'wglint'})} width={W_THIN} color={P.star} />
      {/* the sill */}
      <Fill rect={[REVEAL_X - 14, SILL_Y, 220, 16]} color={P.sill} seed="sill" />
      <Ink d={hline(REVEAL_X - 14, 1140, SILL_Y, {seed: 'sl1', over: [6, 0]}) + hline(REVEAL_X - 14, 1140, SILL_Y + 16, {seed: 'sl2', over: [4, 0]}) + vline(REVEAL_X - 14, SILL_Y, SILL_Y + 16, {over: [0, 0], seed: 'sl3'})} width={W_MID} />
    </>
  );
};

// ---------------------------------------------------------------- the room below: wall strip, floor, desk

export const Floor: React.FC<PP> = ({P}) => (
  <>
    {/* past the desk's right end: the wall, a baseboard, the floor behind */}
    <Fill rect={[DESK_R[0] - 20, FLOOR_Y - 18, 200, 18]} color={P.wallShade} offset={false} />
    <Fill rect={[DESK_R[0] - 20, FLOOR_Y, 200, 1000]} color={P.floor} offset={false} />
    <Ink d={hline(DESK_R[0], 1140, FLOOR_Y - 18, {seed: 'bb1', over: [0, 0]}) + hline(DESK_R[0], 1140, FLOOR_Y, {seed: 'bb2', over: [0, 0]})} width={W_THIN} />
    {/* under the desk: warm shade; in front of it: the floor */}
    <Fill rect={[-60, DESK_FRONT + APRON, LEG.x + 60, LEG.foot - DESK_FRONT - APRON]} color={P.under} offset={false} />
    <Fill d={polyPath([[-60, LEG.foot - 4], [1140, LEG.foot + 14], [1140, 2000], [-60, 2000]])} color={P.floor} offset={false} />
    <Ink d={line(-60, LEG.foot - 4, LEG.x, LEG.foot + 11, {seed: 'fl0', over: [0, 0]})} width={W_THIN} />
    <Ink d={line(120, 1838, 1140, 1856, {seed: 'fl1', over: [0, 0]}) + line(-60, 1912, 1140, 1934, {seed: 'fl2', over: [0, 0]})} width={W_HAIR} />
  </>
);

export const Desk: React.FC<PP> = ({P}) => {
  const top: Pt[] = [
    [-60, DESK_BACK],
    [DESK_R[0], DESK_BACK],
    [DESK_R[1], DESK_FRONT],
    [-60, DESK_FRONT],
  ];
  return (
    <>
      <Fill d={polyPath(top)} color={P.desk} offset={false} />
      <Fill rect={[-60, DESK_FRONT, DESK_R[1] + 60, APRON]} color={P.deskFront} offset={false} />
      <Fill rect={[LEG.x, DESK_FRONT + APRON, LEG.w, LEG.foot - DESK_FRONT - APRON]} color={P.deskFront} seed="leg" />
      <Ink d={hline(-60, DESK_R[0], DESK_BACK, {seed: 'dkB', over: 'structural'})} width={W_MID} />
      <Ink d={line(DESK_R[0], DESK_BACK, DESK_R[1], DESK_FRONT, {seed: 'dkR', over: [4, 0]}) + hline(-60, DESK_R[1], DESK_FRONT, {seed: 'dkF', over: [0, 6]}) + hline(-60, DESK_R[1], DESK_FRONT + APRON, {seed: 'dkA', over: [0, 4]}) + vline(DESK_R[1], DESK_FRONT, DESK_FRONT + APRON, {seed: 'dkE', over: [0, 0]})} width={W_MID} />
      <Ink d={vline(LEG.x, DESK_FRONT + APRON, LEG.foot, {seed: 'lg1', over: [0, 3]}) + vline(LEG.x + LEG.w, DESK_FRONT + APRON, LEG.foot + 2, {seed: 'lg2', over: [0, 3]})} width={W_MID} />
      {/* a drawer in the apron */}
      <Ink d={rect(600, DESK_FRONT + 13, 300, APRON - 26, {seed: 'drw', over: 'small'})} width={W_THIN} />
      <Fill d={blob(750, DESK_FRONT + APRON / 2, 13, 7, {seed: 'knob'})} color={P.anchor} offset={false} />
      {/* the lamp pool: two flat rings, lighter toward the centre, no gradient (COZY 3) */}
      <Fill d={blob(POOL.cx, POOL.cy, POOL.rx, POOL.ry, {seed: 'pool1', wobble: 0.02})} color={P.ring} offset={false} />
      <Fill d={blob(POOL.cx - 8, POOL.cy - 4, POOL.rx * 0.64, POOL.ry * 0.64, {seed: 'pool2', wobble: 0.025})} color={P.core} offset={false} />
      {/* wood grain, a few hairlines outside the pool */}
      <Ink d={line(40, 1236, 236, 1240, {seed: 'gr1', over: [0, 0]}) + line(760, 712, 960, 716, {seed: 'gr2', over: [0, 0]}) + line(860, 1300, 1020, 1303, {seed: 'gr3', over: [0, 0]}) + line(600, 1346, 780, 1349, {seed: 'gr4', over: [0, 0]})} width={W_HAIR} />
    </>
  );
};

/** A wastebasket in the knee space (abundance at the edges; the dark under-desk is no dead block). */
export const Basket: React.FC<PP> = ({P}) => {
  const top = 1590;
  const bot = 1738;
  const body: Pt[] = [
    [758, top],
    [882, top],
    [868, bot],
    [772, bot],
  ];
  return (
    <>
      <Fill d={polyPath(body)} color={P.boxSide} seed="bsk" />
      <Fill d={blob(820, top, 62, 13, {seed: 'bskO'})} color={P.boxIn} offset={false} />
      {[
        [800, top - 8, 22],
        [840, top - 4, 17],
      ].map(([bx, by, br], i) => (
        <React.Fragment key={i}>
          <Fill d={crown(bx, by, br, br * 0.85, {seed: `ball${i}`, bumps: 8, round: 0.55})} color={P.paperEdge} offset={false} />
          <Ink d={crown(bx, by, br, br * 0.85, {seed: `ball${i}`, bumps: 8, round: 0.55}) + poly([[bx - br * 0.5, by - br * 0.2], [bx - br * 0.1, by + br * 0.15], [bx + br * 0.35, by - br * 0.3]], {seed: `crease${i}`, over: [0, 0]})} width={W_HAIR} />
        </React.Fragment>
      ))}
      <Ink d={line(758, top, 772, bot, {seed: 'bsk1', over: [0, 0]}) + line(882, top, 868, bot, {seed: 'bsk2', over: [0, 0]}) + hline(772, 868, bot, {seed: 'bsk3', over: [0, 0]}) + ellipse(820, top, 62, 13, {seed: 'bskR'})} width={W_THIN} />
      <Ink d={line(790, top + 30, 798, bot - 12, {seed: 'bw1', over: [0, 0]}) + line(820, top + 30, 820, bot - 12, {seed: 'bw2', over: [0, 0]}) + line(850, top + 30, 842, bot - 12, {seed: 'bw3', over: [0, 0]})} width={W_HAIR} />
    </>
  );
};

// ---------------------------------------------------------------- the cardboard box: she quit (badge + lanyard inside)

export const BOX = {fl: 36, fr: 280, bl: 56, br: 296, back: 800, rim: 930, bot: 1008};

/** The badge at rest in the box (world <- badge local). */
export const BADGE_REST: Mat = mat.compose(mat.translate(170, 872), mat.rotate(-11));
/** A badge in motion: its transform, and how far its lanyard has draped (0 = bunched behind it, 1 = over the rim). */
export type BadgeState = {m: Mat; drape: number};

/** The box. `badge`: omit = at rest, null = not there yet, else the badge in flight. `jolt` 0..1 squashes the box
 *  (the badge landing), `tip` (deg) knocks the photo frame. */
export const Box: React.FC<{P: DeskPal; ok: boolean; badge?: BadgeState | null; jolt?: number; tip?: number}> = ({P, ok, badge, jolt = 0, tip = 0}) => {
  const {fl, fr, bl, br, back, rim, bot} = BOX;
  const opening: Pt[] = [
    [fl, rim],
    [fr, rim],
    [br, back],
    [bl, back],
  ];
  const right: Pt[] = [
    [fr, rim],
    [br, back],
    [br, back + (bot - rim)],
    [fr, bot],
  ];
  const flapBack: Pt[] = [
    [bl, back],
    [br, back],
    [br + 8, back - 44],
    [bl + 14, back - 46],
  ];
  const flapL: Pt[] = [
    [fl, rim],
    [bl, back],
    [bl - 44, back + 6],
    [fl - 46, rim - 6],
  ];
  const flapR: Pt[] = [
    [fr, rim],
    [br, back],
    [br + 46, back + 10],
    [fr + 44, rim + 4],
  ];
  // the badge (its clip toward the back), lying on the folder
  const bm = badge ? badge.m : BADGE_REST;
  const clip = apply(BADGE_REST, 0, -54);
  const restPts: Pt[] = [
      clip,
      [112, 822],
      [74, 856],
      [80, 904],
      [104, rim],
      [116, 968],
      [158, 992],
      [204, 978],
      [224, 944],
      [226, rim - 6],
      [220, 896],
      [204, 858],
      add(clip, [12, 2]),
  ];
  // in flight: the rest shape in the badge's own frame, bunched toward its clip, carried by the badge
  const inv = mat.inv(BADGE_REST);
  const lanPts = badge
    ? restPts.map((q0): Pt => {
        const q = apply(inv, q0[0], q0[1]);
        const k = 0.5 + 0.5 * badge.drape;
        return apply(bm, q[0] * k, -54 + (q[1] + 54) * k);
      })
    : restPts;
  const lanyard = smooth(lanPts, {closed: true});
  const frameM = mat.compose(mat.translate(252, 788), mat.rotate(7 + tip));
  return (
    <XG m={jolt ? mat.about(mat.scale(1 + 0.015 * jolt, 1 - 0.04 * jolt), (fl + br) / 2, bot) : mat.I}>
      {/* contact shadow on the desk (warm, flat) */}
      <Fill d={polyPath([[fl - 30, bot - 6], [fr, bot - 6], [fr + 6, bot + 10], [fl - 40, bot + 12]])} color={P.deskShade} offset={false} />
      <Fill d={polyPath(flapBack)} color={P.box} seed="flb" />
      <Ink d={poly(flapBack, {closed: true, seed: 'flbI', over: 'small'})} width={W_MID} />
      {/* contents standing at the back: a plant, a photo frame */}
      <Fill d={crown(104, 784, 46, 40, {seed: 'bxleaf', bumps: 8, round: 0.7})} color={P.leaf} seed="bxleafF" />
      <Ink d={crown(104, 784, 46, 40, {seed: 'bxleaf', bumps: 8, round: 0.7})} width={W_THIN} open={0.25} />
      <XG m={frameM}>
        <Fill rect={[-40, -50, 80, 96]} color={P.frame} seed="frm" />
        <Fill rect={[-28, -38, 56, 72]} color={P.photo} offset={false} />
        <Fill d={polyPath([[-28, 34], [-28, 8], [-6, -10], [10, 6], [28, -4], [28, 34]])} color={P.books[0]} offset={false} />
        <Fill d={blob(14, -22, 8, 8, {seed: 'frsun'})} color={P.ring} offset={false} />
        <Ink d={rect(-40, -50, 80, 96, {seed: 'frmI', over: 'small'}) + rect(-28, -38, 56, 72, {seed: 'frmJ', over: [0, 1]})} width={W_THIN} />
      </XG>
      {/* the opening, the inside, the folder */}
      <Fill d={polyPath(opening)} color={P.boxIn} offset={false} />
      <Fill d={polyPath([[bl + 2, back + 4], [br - 2, back + 4], [br - 4, back + 46], [bl + 4, back + 46]])} color={P.boxSide} offset={false} />
      <Fill d={blob(104, 836, 28, 10, {seed: 'potrim'})} color={P.pot} offset={false} />
      <Fill d={polyPath([[62, 846], [246, 838], [252, 922], [60, 926]])} color={P.paperEdge} seed="fold" />
      <Ink d={poly([[62, 846], [246, 838], [252, 922]], {seed: 'foldI', over: 'small'})} width={W_THIN} />
      {/* walls */}
      <Fill rect={[fl, rim, fr - fl, bot - rim]} color={P.box} seed="bxF" />
      <Fill d={polyPath(right)} color={P.boxSide} seed="bxR" />
      <Fill d={polyPath(flapL)} color={P.box} seed="flL" />
      <Fill d={polyPath(flapR)} color={P.boxSide} seed="flR" />
      <Ink d={poly(flapL, {closed: true, seed: 'flLI', over: 'small'}) + poly(flapR, {closed: true, seed: 'flRI', over: 'small'})} width={W_MID} />
      <Ink d={rect(fl, rim, fr - fl, bot - rim, {seed: 'bxFI', over: 'small'}) + poly([[fr, bot], [br, back + (bot - rim)], [br, back]], {seed: 'bxRI', over: 'small'}) + line(bl, back, br, back, {seed: 'bxBI', over: 'small'})} width={W_MID} />
      <Ink d={hline(fl + 70, fr - 70, rim + 40, {seed: 'bxtape', over: [0, 0]}) + hline(fl + 70, fr - 70, rim + 50, {seed: 'bxtape2', over: [0, 0]})} width={W_HAIR} />
      {badge === null ? null : (
        <>
      {/* her lanyard (hero), spilling over the front rim; ribbon = ink under a narrower hero stroke */}
      <Ink d={lanyard} width={19} color={P.ink} taper={false} />
      <Ink d={lanyard} width={12.5} color={P.hero} taper={false} />
      {/* the GOOGLE badge, hand-lettered (never a logo) */}
      <XG m={bm}>
        <Fill d={roundRect(-84, -54, 168, 112, 12)} color={P.badge} seed="badge" />
        <Fill rect={[-84, -42, 168, 22]} color={P.badgeBand} offset={false} />
        <Ink d={roundRect(-84, -54, 168, 112, 12, {seed: 'badgeI'})} width={W_MID} />
        <Fill d={roundRect(-14, -52, 28, 9, 4)} color={P.anchor} offset={false} />
        <Fill rect={[-72, -12, 42, 56]} color={P.photo} offset={false} />
        <Fill d={blob(-51, 8, 11, 12, {seed: 'phead'})} color={P.badgeBand} offset={false} />
        <Fill d={`M-68 44Q-66 24 -51 22Q-36 24 -34 44Z`} color={P.badgeBand} offset={false} />
        <Ink d={rect(-72, -12, 42, 56, {seed: 'photoI', over: [0, 1]})} width={W_THIN} />
        {ok ? (
          <Letter x={-24} y={17} size={33} fill={P.ink}>
            GOOGLE
          </Letter>
        ) : null}
        <Ink d={textLines(-22, 32, 92, {n: 2, gap: 10, seed: 'bdgt', heading: false})} width={W_HAIR} />
      </XG>
        </>
      )}
    </XG>
  );
};

// ---------------------------------------------------------------- the contract (subject): signed, the clause highlighted

export type Clause = {size: number; rows: {txt: string; base: number; w: number}[]};

export function clauseLayout(ok: boolean): Clause {
  const size = 50;
  const est = (s: string) => (ok ? measureCaption(s, size) : s.length * size * 0.42);
  return {size, rows: [{txt: 'no criticizing', base: 252, w: est('no criticizing')}, {txt: 'Google', base: 310, w: est('Google')}]};
}

export const CL_X = 34;
const bandPts = (x0: number, x1: number, by: number, s: number, seed: string): Pt[] => {
  const r = rng(seed);
  const t = by - s * 0.58;
  const b = by + s * 0.14;
  return [
    [x0 + 6, t + r.jitter(1.5)],
    [x1 + r.jitter(2), t + 2],
    [x1 - 8, b + r.jitter(1.5)],
    [x0 - 2, b - 1],
  ];
};

/** The highlighter tip in world coords: the end of the band under "Google". */
export function tipPoint(cl: Clause): Pt {
  const g = cl.rows[1];
  return apply(PAGE_M, CL_X + g.w + 10, g.base - cl.size * 0.22);
}

/** The contract. `bands`: how far the highlighter has run along each clause row (0..1, default done). `runOn`: how
 *  far (px) the page has run on past its bottom edge (the opening: 2030, 2040, ... over the desk's front edge). */
export const Contract: React.FC<{P: DeskPal; ok: boolean; cl: Clause; bands?: [number, number]; runOn?: number}> = ({P, ok, cl, bands = [1, 1], runOn = 0}) => {
  const {w, h} = PAGE;
  const b = useContext(DeskBuild);
  const SX = 18; // the signature block, shifted clear of her fingers
  const sig = smooth(
    (
      [
        [214, 438],
        [226, 410],
        [236, 438],
        [244, 418],
        [258, 430],
        [270, 404],
        [278, 436],
        [292, 420],
        [310, 432],
        [324, 414],
        [336, 430],
        [352, 424],
        [380, 428],
      ] as Pt[]
    ).map(([x, y]): Pt => [x + SX, y]),
  );
  return (
    <XG m={PAGE_M}>
      <Fill rect={[5, 7, w, h]} color={P.paperEdge} offset={false} />
      <Fill rect={[0, 0, w, h]} color={P.paper} offset={false} />
      <Ink d={rect(0, 0, w, h, {seed: 'pageI', over: 'small'})} width={W_MID} />
      {ok ? (
        <Letter x={CL_X} y={66} size={46} fill={P.ink}>
          JOB CONTRACT
        </Letter>
      ) : null}
      <Ink d={textLines(CL_X, 110, 352, {n: 4, gap: 26, seed: 'ct1', heading: false})} width={W_THIN} />
      {/* the highlighter band (the pop) under the clause's words, then the words */}
      {cl.rows.map((r, i) =>
        bands[i] > 0 ? <Fill key={i} d={polyPath(bandPts(CL_X - 6, CL_X - 6 + Math.max(14, (r.w + 16) * bands[i]), r.base, cl.size, `band${i}`))} color={P.pop} offset={false} /> : null,
      )}
      {ok
        ? cl.rows.map((r, i) => (
            <Letter key={i} x={CL_X} y={r.base} size={cl.size} fill={P.ink}>
              {r.txt}
            </Letter>
          ))
        : null}
      <Ink d={textLines(CL_X, 352, 352, {n: 2, gap: 26, seed: 'ct2', heading: false})} width={W_THIN} />
      {/* signed */}
      <Ink d={textLines(CL_X, 446, 118, {n: 1, seed: 'ctd', heading: false})} width={W_THIN} />
      <Ink d={line(196 + SX, 432, 206 + SX, 444, {over: [0, 0], seed: 'x1'}) + line(206 + SX, 432, 196 + SX, 444, {over: [0, 0], seed: 'x2'})} width={W_THIN} />
      <Ink d={hline(214 + SX, 392 + SX / 2, 450, {seed: 'sigl', over: [0, 4]})} width={W_THIN} />
      {b?.sig ? <Ink d={sig} width={W_MID} at={b.sig.at} dur={b.sig.dur} pace="free" /> : <Ink d={sig} width={W_MID} />}
      {runOn > 0 ? <RunOn P={P} L={runOn} /> : null}
    </XG>
  );
};

/** Mix two #RRGGBB colours (k = share of b). */
const mixHex = (a: string, b: string, k: number): string => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, '0')).join('');
};

const RUN_YEARS = [2030, 2040, 2050, 2060, 2070, 2080, 2090];
const RUN_STEP = 234; // px of page per decade
/** The page running on past its bottom edge (page-local coords, inside PAGE_M): the same paper, the clause's lines
 *  going on, a year every RUN_STEP px, a rolled leading edge; past the desk's front edge it hangs (shaded, a crease). */
const RunOn: React.FC<{P: DeskPal; L: number}> = ({P, L}) => {
  const {w, h} = PAGE;
  const y1 = h + L;
  // the desk's front edge (world y DESK_FRONT) in page-local coords: y = (Y - b x - f) / d
  const M = PAGE_M;
  const edgeY = (x: number) => (DESK_FRONT - M[1] * x - M[5]) / M[3];
  const e0 = edgeY(0);
  const ew = edgeY(w);
  const over = y1 > Math.min(e0, ew);
  const shade = mixHex(P.paper, P.paperEdge, 0.55);
  const r = rng('v2runon');
  const rows: string[] = [];
  const years: {y: number; label: number}[] = [];
  for (let k = 0; k < RUN_YEARS.length; k++) {
    const yy = h + 74 + k * RUN_STEP;
    if (yy < y1 - 26) years.push({y: yy, label: RUN_YEARS[k]});
  }
  for (let i = 0, y = h + 30; y < y1 - 20; i++, y += 26) {
    const lw = r.range(250, 352);
    if (years.some((yr) => Math.abs(yr.y - 14 - y) < 24)) continue;
    rows.push(hline(CL_X, CL_X + lw, y, {seed: `ro${i}`, over: [0, 0]}));
  }
  return (
    <>
      <Fill rect={[5, h, w, L]} color={P.paperEdge} offset={false} />
      <Fill rect={[0, h - 1, w, L + 1]} color={P.paper} offset={false} />
      {over ? <Fill d={polyPath([[0, e0], [w, ew], [w, y1], [0, y1]])} color={shade} offset={false} /> : null}
      <Ink d={rows.join('')} width={W_THIN} />
      {years.map((yr, i) => (
        <React.Fragment key={i}>
          <Ink d={hline(CL_X, 218, yr.y - 14, {seed: `ry${i}`, over: [0, 0]})} width={W_THIN} />
          <Letter x={232} y={yr.y} size={42} fill={P.ink}>
            {String(yr.label)}
          </Letter>
        </React.Fragment>
      ))}
      <Ink d={line(0, h, 0, y1, {seed: 'roL', over: [0, 0]}) + line(w, h, w, y1, {seed: 'roR', over: [0, 0]})} width={W_MID} taper={false} />
      {over ? <Ink d={line(0, e0, w, ew, {seed: 'roE', over: [0, 0]})} width={W_THIN} taper={false} /> : null}
      {/* the rolled leading edge */}
      <XG m={mat.translate(0, y1)}>
        <Fill d={roundRect(-8, -15, w + 16, 30, 14)} color={P.paper} offset={false} />
        <Fill d={roundRect(-8, 1, w + 16, 14, 7)} color={P.paperEdge} offset={false} />
        <Ink d={roundRect(-8, -15, w + 16, 30, 14, {seed: 'roll'})} width={W_MID} taper={false} />
        <Ink d={ellipse(8, 0, 5, 9, {seed: 'rollA'}) + ellipse(w - 8, 0, 5, 9, {seed: 'rollB'})} width={W_HAIR} />
      </XG>
    </>
  );
};

/** The signing pen, lying across the page's bottom-right corner. */
export const Pen: React.FC<PP> = ({P}) => {
  const a: Pt = [706, 1182];
  const b: Pt = [874, 1238];
  const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return (
    <>
      <Fill d={polyPath([[a[0] + 30, a[1] + 16], [b[0], b[1] + 12], [b[0] - 8, b[1] + 20], [a[0] + 24, a[1] + 22]])} color={P.deskShade} offset={false} />
      <XG m={mat.compose(mat.translate(a[0], a[1]), mat.rotate(ang))}>
        <Fill d={polyPath([[0, 0], [20, -6], [20, 6]])} color={P.paper} offset={false} />
        <Fill d={roundRect(20, -8, L - 20, 16, 7)} color={P.anchor} seed="pen" />
        <Fill rect={[52, -8, 6, 16]} color={P.paper} offset={false} />
        <Ink d={roundRect(20, -8, L - 20, 16, 7, {seed: 'penI'}) + poly([[20, -6], [0, 0], [20, 6]], {seed: 'penT', over: [0, 0]})} width={W_THIN} />
        <Ink d={line(L - 70, -12, L - 14, -12, {seed: 'penC', over: [0, 0]})} width={W_THIN} color={P.paper} />
      </XG>
    </>
  );
};

// ---------------------------------------------------------------- the mug (a sign of care; steam = a small slow loop)

export const Mug: React.FC<{P: DeskPal; t: number}> = ({P, t}) => {
  const x0 = 800;
  const x1 = 898;
  const top = 950;
  const bot = 1054;
  const body = `M${x0} ${top}L${x0} ${bot - 18}Q${x0} ${bot} ${x0 + 18} ${bot}L${x1 - 18} ${bot}Q${x1} ${bot} ${x1} ${bot - 18}L${x1} ${top}Z`;
  const steam = (sx: number, ph: number) => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 5; i++) pts.push([sx + Math.sin(i * 1.3 + ph + t * 1.6) * 8, top - 18 - i * 20]);
    return smooth(pts);
  };
  return (
    <>
      {/* its shadow, cast away from the lamp: the unlit desk showing through the pool */}
      <Fill d={smooth([[x0 + 10, bot - 6], [x0 - 40, bot + 18], [x0 - 70, bot + 40], [x0 - 30, bot + 46], [x1 - 10, bot + 6]], {closed: true})} color={P.deskShade} offset={false} />
      <Ink d={`M${x1 - 2} ${top + 22}C${x1 + 44} ${top + 18} ${x1 + 44} ${top + 80} ${x1 - 2} ${top + 76}`} width={15} color={P.mug} taper={false} />
      <Ink d={`M${x1 - 2} ${top + 14}C${x1 + 54} ${top + 10} ${x1 + 54} ${top + 88} ${x1 - 2} ${top + 84}`} width={W_THIN} />
      <Fill d={body} color={P.mug} seed="mug" />
      <Fill rect={[x0, top + 40, x1 - x0, 18]} color={P.mugBand} offset={false} />
      <Ink d={line(x0, top, x0, bot - 14, {over: [0, 0], seed: 'mg1'}) + line(x1, top, x1, bot - 14, {over: [0, 0], seed: 'mg2'}) + `M${x0} ${bot - 18}Q${x0} ${bot} ${x0 + 18} ${bot}L${x1 - 18} ${bot}Q${x1} ${bot} ${x1} ${bot - 18}`} width={W_MID} />
      <Fill d={blob((x0 + x1) / 2, top, (x1 - x0) / 2, 13, {seed: 'rim'})} color={P.anchor} offset={false} />
      <Ink d={ellipse((x0 + x1) / 2, top, (x1 - x0) / 2, 13, {seed: 'rimI'})} width={W_MID} />
      <Ink d={steam(834, 0) + steam(866, 2.1)} width={W_THIN} />
    </>
  );
};

// ---------------------------------------------------------------- the lamp head (cut by the right edge)

export const Lamp: React.FC<PP> = ({P}) => {
  const B: Pt = [1094, 648]; // the shade's back (off frame at frame 0)
  const M: Pt = [930, 806]; // the mouth centre
  const len = Math.hypot(M[0] - B[0], M[1] - B[1]);
  const ua: Pt = [(M[0] - B[0]) / len, (M[1] - B[1]) / len];
  const pa: Pt = [ua[1], -ua[0]];
  const shade: Pt[] = [add(B, pa, 30), add(M, pa, 88), add(M, pa, -88), add(B, pa, -30)];
  const ang = (Math.atan2(pa[1], pa[0]) * 180) / Math.PI;
  return (
    <>
      <Ink d={`M${B[0]} ${B[1]}L1170 520`} width={12} color={P.anchor} taper={false} />
      <Fill d={polyPath(shade)} color={P.anchor} offset={[1.5, 1]} />
      <Fill d={blob(B[0], B[1], 32, 32, {seed: 'lb'})} color={P.anchor} offset={false} />
      <Ink d={line(...shade[0], ...shade[1], {seed: 'ls1', over: [0, 2]}) + line(...shade[3], ...shade[2], {seed: 'ls2', over: [0, 2]})} width={W_MID} />
      <XG m={mat.compose(mat.translate(M[0], M[1]), mat.rotate(ang))}>
        <Fill d={blob(0, 0, 88, 24, {seed: 'mouth'})} color={P.core} offset={false} />
        <Ink d={ellipse(0, 0, 88, 24, {seed: 'mouthI'})} width={W_MID} />
      </XG>
    </>
  );
};

// ---------------------------------------------------------------- her sleeve + hand with the highlighter (no face)

export const Arm: React.FC<{P: DeskPal; tip: Pt; reach?: number}> = ({P, tip, reach = 820}) => {
  const UA = 112; // the highlighter axis: from the tip toward her hand (down, a little left: the fist stays under the words)
  const u = dirDeg(UA);
  const v = dirDeg(121); // the forearm comes in from the bottom-left corner
  const pv: Pt = [-v[1], v[0]];
  const W = add(tip, u, 188); // the cuff
  const C1 = add(W, v, reach);
  const mid = add(W, v, 400);
  const sideA: Pt[] = [add(W, pv, 62), add(mid, pv, 96), add(C1, pv, 112)];
  const sideB: Pt[] = [add(W, pv, -62), add(mid, pv, -90), add(C1, pv, -104)];
  const sleeve = smooth([...sideA, ...[...sideB].reverse()], {closed: true, tension: 0.35});
  const cuff2 = add(W, v, 34);
  const fold = (k: number, s: number, l: number) => {
    const c = add(add(W, v, k), pv, s);
    return line(...c, ...add(c, v, l), {over: [0, 0], seed: `fold${k}`});
  };
  return (
    <>
      <Fill d={sleeve} color={P.hero} seed="sleeve" />
      <Ink d={smooth(sideA) + smooth(sideB)} width={W_FRONT} />
      <Ink d={line(...add(W, pv, 62), ...add(W, pv, -62), {seed: 'cuf1', over: [3, 3]}) + line(...add(cuff2, pv, 64), ...add(cuff2, pv, -64), {seed: 'cuf2', over: [0, 0]})} width={W_MID} />
      <Ink d={fold(150, 30, 70) + fold(250, -20, 90) + fold(330, 46, 60)} width={W_THIN} />
      <XG m={mat.compose(mat.translate(tip[0], tip[1]), mat.rotate(UA))}>
        {/* wrist into the cuff */}
        <Fill d={roundRect(150, -34, 56, 66, 26)} color={P.skin} seed="wrist" />
        <Ink d={line(156, -34, 200, -36, {seed: 'wr1', over: [0, 0]}) + line(156, 32, 200, 30, {seed: 'wr2', over: [0, 0]})} width={W_MID} />
        {/* the highlighter: pop chisel tip, anchor body; its back end stays inside the fist (the wrist reads) */}
        <Fill d={polyPath([[0, -5], [18, -12], [18, 12], [0, 5]])} color={P.pop} offset={false} />
        <Fill d={roundRect(18, -15, 152, 30, 8)} color={P.anchor} seed="hlb" />
        <Fill rect={[30, -15, 8, 30]} color={P.badge} offset={false} />
        <Ink d={roundRect(18, -15, 152, 30, 8, {seed: 'hlbI'}) + poly([[18, -12], [0, -5], [0, 5], [18, 12]], {seed: 'hlT', over: [0, 0]})} width={W_MID} />
        {/* the fist, the curled fingers toward us, the thumb along the marker */}
        <Fill d={roundRect(84, -46, 94, 90, 32)} color={P.skin} seed="fist" />
        <Ink d={roundRect(84, -46, 94, 90, 32, {seed: 'fistI'})} width={W_FRONT} />
        {[88, 110, 132, 154].map((fx, i) => (
          <React.Fragment key={i}>
            <Fill d={roundRect(fx, -62, 24, 36, 12)} color={P.skin} seed={`fg${i}`} />
            <Ink d={roundRect(fx, -62, 24, 36, 12, {seed: `fgI${i}`, closed: false})} width={W_MID} />
          </React.Fragment>
        ))}
        <Fill d={roundRect(58, 6, 80, 32, 16)} color={P.skin} seed="thumb" />
        <Ink d={roundRect(58, 6, 80, 32, 16, {seed: 'thumbI', closed: false})} width={W_FRONT} />
        <Fill d={roundRect(63, 12, 20, 20, 8)} color={P.nail} offset={false} />
        <Ink d={roundRect(63, 12, 20, 20, 8, {seed: 'tnail'})} width={W_HAIR} />
      </XG>
    </>
  );
};

// ---------------------------------------------------------------- frame-0 words (screen space, on the flat wall)

export const Claim: React.FC<{P: DeskPal; ok: boolean}> = ({P, ok}) => {
  if (!ok) return null;
  const lines = ['NO CRITICIZING', 'GOOGLE. FOR LIFE.'];
  const hl = 'FOR LIFE.';
  let size: number = skyCaption.size;
  const widest = Math.max(...lines.map((l) => measureCaption(l, size)));
  if (widest > skyCaption.maxWidth) size = Math.floor((size * skyCaption.maxWidth) / widest);
  const base = [skyCaption.line1, skyCaption.line2];
  const l2 = lines[1];
  const lw = measureCaption(l2, size);
  const x0 = skyCaption.cx - lw / 2 + measureCaption(l2.slice(0, l2.indexOf(hl)), size);
  const pad = skyHighlightBox.padEm * size;
  const bw = measureCaption(hl, size) + pad * 2;
  return (
    <g>
      <text x={skyCaption.cx} y={base[0] - size * 0.98} textAnchor="middle" fontFamily={captionFontStack} fontSize={60} fill={P.ink}>
        SHE SAYS:
      </text>
      <rect x={x0 - pad} y={base[1] - skyHighlightBox.topEm * size} width={bw} height={(skyHighlightBox.topEm + skyHighlightBox.bottomEm) * size} rx={skyHighlightBox.radiusEm * size} fill={P.hl} />
      {lines.map((l, i) => (
        <text key={i} x={skyCaption.cx} y={base[i]} textAnchor="middle" fontFamily={captionFontStack} fontSize={size} fill={P.ink}>
          {l}
        </text>
      ))}
      <text x={skyCaption.cx} y={base[1] + 76} textAnchor="middle" fontFamily={captionFontStack} fontSize={36} fill={P.muted}>
        Her account to BBC News, 21 Oct 2026
      </text>
    </g>
  );
};

// ---------------------------------------------------------------- the frame

export type StyleDeskProps = {
  /** "Cream & Cobalt" | "Autumn Ember" | "Sage Study" (or "A" / "B" / "C"). */
  palette?: string;
  /** Draw the frame-0 words on the wall (default true). */
  caption?: boolean;
};

export const StyleDesk: React.FC<StyleDeskProps> = ({palette: name = 'A', caption = true}) => {
  const P = deskPalette(name);
  const t = useTime();
  const ok = useCaptionFont();
  const cl = clauseLayout(ok);
  const tip = tipPoint(cl);
  // O1's one move: pull out 1.05 -> 1.00, ease-in, over the shot (6.12 s); captions stay in screen space
  const p = clamp01(t / 6.12);
  const z = 1.05 - 0.05 * p * p;
  const cam = mat.about(mat.scale(z), 540, 960);
  return (
    <AbsoluteFill style={{background: P.wall, overflow: 'hidden'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        <XG m={cam}>
          <rect x={-200} y={-200} width={1480} height={2320} fill={P.wall} />
          <Bookcase P={P} />
          <TopShelf P={P} />
          <WindowView P={P} t={t} />
          <Floor P={P} />
          <Basket P={P} />
          <Desk P={P} />
          <BookStack P={P} />
          <Box P={P} ok={ok} />
          <Contract P={P} ok={ok} cl={cl} />
          <Pen P={P} />
          <Mug P={P} t={t} />
          <Lamp P={P} />
          <Arm P={P} tip={tip} />
        </XG>
        {caption ? <Claim P={P} ok={ok} /> : null}
      </svg>
    </AbsoluteFill>
  );
};
