// StyleNook: video 3, frame 0 (the hook) as a G4 look-check style frame, in our v1 house style (flat fills, kit ink,
// misregistered fills, no gradients, no paper edge). One composition, three palette candidates via the `palette` prop:
//   A "Mint & Clay 1.1"  the whole frame in palette 2
//   B "Sage Study"       the room in palette 5, the window in palette 6 "Dusk" (the sister-palette shift, PALETTE.md)
//   C "Autumn Ochre"     the room in palette 7; the window uses added cool slates (palette 7 has no cool mids)
// Colour jobs (PALETTE.md): hero = the laptops (old + new), anchor = phone, lamp, old screen, a few spines, the
// near roofs; ONE pop = the paper price tag + "Add to cart" + the cart badge (the hook's look-here).
// Shot: docs/v3/archive/g3_v1/storyboard_g3_v1.md S1, docs/look/COZY_AND_SCALE.md 2-3 and 6.1 (cozy 1:1 POV nook,
// shelf cut by the top on the left, one frosty window 15-30 % holding the data center, lamp pool on the taped hinge,
// phone cut by the bottom, captions on a flat wall across y 317-556).
// Render: npx remotion still src/entry-v3.tsx StyleNook out.png --props='{"palette":"Sage Study"}'

import React, {useId} from 'react';
import {AbsoluteFill} from 'remotion';
import {Ink} from '../lib/Ink';
import {Fill} from '../lib/Fill';
import {Tod} from '../lib/tod';
import {Window} from '../lib/kit/Window';
import {Laptop} from '../lib/kit/Icons';
import {palette as theme, skyCaption, skyHighlightBox, stroke} from '../lib/theme';
import {blob, circle, crown, ellipse, glint, hline, line, poly, polyPath, Pt, rect, roundRect, smooth, textLines, vline} from '../lib/sketch';
import {rng} from '../lib/rng';
import {useTime} from '../lib/time';
import {mat, XG} from '../lib/xf';
import {captionFontStack, measureCaption, useCaptionFont} from '../lib/font';

// ---------------------------------------------------------------- palettes (roles -> hex, from docs/look/palettes.json)

export type NookPal = {
  name: string;
  ink: string;
  // room
  wall: string; // the page (PALETTE bg)
  reveal: string; // window reveal (wall depth)
  slope: string; // attic ceiling, top right
  beam: string;
  shelf: string;
  books: string[];
  desk: string;
  ring: string; // lamp pool, outer ring
  core: string; // lamp pool core + the lit lamp mouth
  trim: string; // window frame + mullions (the palette's "line" colour)
  sillTop: string;
  sillFront: string;
  pot: string;
  leaf: string;
  mug: string;
  mugBand: string;
  tape: string;
  skin: string;
  nail: string;
  sleeve: string;
  screen: string; // the phone screen (the one secondary light)
  paper: string; // the notebook in the foreground
  panel: string; // product photo backdrop on the phone
  newScreen: string; // the new laptop's screen in the product photo
  // outside (the window)
  sky: string;
  dc: string;
  dcSide: string;
  led: string;
  roofs: string;
  snow: string;
  frost: string;
  houseLit: string;
  // the references' trick
  hero: string;
  anchor: string;
  pop: string;
  popText: string;
  hl: string; // caption highlight box
};

const INK = '#2B1B0A';

/** 2 Mint & Clay 1.1: v1's world, teal hero, deeper anchor, marigold pop; v1's night sky in the window. */
const MINT: NookPal = {
  name: 'Mint & Clay 1.1',
  ink: INK,
  wall: '#A6CABB',
  reveal: '#6D988B',
  slope: '#BA977E',
  beam: '#88652F',
  shelf: '#D9BBA1',
  books: ['#F6B892', '#F3E0CB', '#6D988B', '#547977', '#88652F', '#BA977E', '#EBF6E5'],
  desk: '#BA977E',
  ring: '#F6B892',
  core: '#F3E0CB',
  trim: '#547977',
  sillTop: '#EBF6E5',
  sillFront: '#6D988B',
  pot: '#88652F',
  leaf: '#547977',
  mug: '#F3E0CB',
  mugBand: '#6D988B',
  tape: '#F3E0CB',
  skin: '#D9BBA1',
  nail: '#F3E0CB',
  sleeve: '#6D988B',
  screen: '#FFFFFF',
  paper: '#EBF6E5',
  panel: '#EBF6E5',
  newScreen: '#F6B892',
  sky: '#588077',
  dc: '#3E605F',
  dcSide: '#203A3B',
  led: '#EBF6E5',
  roofs: '#203A3B',
  snow: '#EBF6E5',
  frost: '#A6CABB',
  houseLit: '#F6B892',
  hero: '#00857F',
  anchor: '#203A3B',
  pop: '#F9A31B',
  popText: INK,
  hl: '#F6B892',
};

/** 5 Sage Study (room) + 6 Dusk (window): COZY_AND_SCALE 3's numbers (ring #F2D49B, core #F0E2BF on desk tan, frost
 *  #D9DEE5, window #BAC3CE / #8A9AA8 / #545F6D, amber pop); the hero keeps one hue across the shift. */
const SAGE: NookPal = {
  name: 'Sage Study',
  ink: INK,
  wall: '#EEF0E3',
  reveal: '#D7E0C8',
  slope: '#D9BBA1',
  beam: '#BA977E',
  shelf: '#9DB39A',
  books: ['#D7E0C8', '#F2D49B', '#9DB39A', '#D9BBA1', '#D9A27E', '#F0E2BF', '#BA977E'],
  desk: '#D9BBA1',
  ring: '#F2D49B',
  core: '#F0E2BF',
  trim: '#9DB39A',
  sillTop: '#F0E2BF',
  sillFront: '#D7E0C8',
  pot: '#D9A27E',
  leaf: '#22332C',
  mug: '#F0E2BF',
  mugBand: '#9DB39A',
  tape: '#F0E2BF',
  skin: '#D9A27E',
  nail: '#F0E2BF',
  sleeve: '#9DB39A',
  screen: '#FFFFFF',
  paper: '#EEF0E3',
  panel: '#EEF0E3',
  newScreen: '#F2D49B',
  sky: '#BAC3CE',
  dc: '#8A9AA8',
  dcSide: '#545F6D',
  led: '#D9DEE5',
  roofs: '#545F6D',
  snow: '#D9DEE5',
  frost: '#D9DEE5',
  houseLit: '#F3B27E',
  hero: '#1F8A78',
  anchor: '#22332C',
  pop: '#F2A541',
  popText: INK,
  hl: '#F2D49B',
};

/** 7 Autumn Ochre: our clay family warmer, burnt-orange hero, dark brown anchor, the small cool blue pop (a screen
 *  glow). Its window needs a cold outside the palette lacks: three ADDED slates (sky / dc / dcSide). */
const OCHRE: NookPal = {
  name: 'Autumn Ochre',
  ink: INK,
  wall: '#F3E6D3',
  reveal: '#D9BBA1',
  slope: '#D9BBA1',
  beam: '#88652F',
  shelf: '#D9BBA1',
  books: ['#E9B66B', '#F6B892', '#D9BBA1', '#88652F', '#C98A64', '#F3E6D3', '#BA977E'],
  desk: '#BA977E',
  ring: '#F6B892',
  core: '#F3E6D3',
  trim: '#88652F',
  sillTop: '#F3E6D3',
  sillFront: '#D9BBA1',
  pot: '#C98A64',
  leaf: '#88652F',
  mug: '#F3E6D3',
  mugBand: '#88652F',
  tape: '#F3E6D3',
  skin: '#C98A64',
  nail: '#F6B892',
  sleeve: '#88652F',
  screen: '#FFFFFF',
  paper: '#F3E6D3',
  panel: '#F3E6D3',
  newScreen: '#F6B892',
  sky: '#9DA8B0',
  dc: '#6E7A85',
  dcSide: '#4C555E',
  led: '#F3E6D3',
  roofs: '#4C555E',
  snow: '#F3E6D3',
  frost: '#C9CFD2',
  houseLit: '#E9B66B',
  hero: '#D05D38',
  anchor: '#3A2A22',
  pop: '#2F8EEB',
  popText: '#FFFFFF',
  hl: '#F6B892',
};

/** C-warm "Autumn Ember" (owner, 2026-10-26: "we need a warm feeling, not sick"): Autumn Ochre without the sickly cast.
 *  The yellow-beige page goes peach cream, the muddy tan desk goes terracotta-apricot, the olive line/wood goes warm
 *  red-brown, the lamp pool goes golden, and the grey night window becomes a saturated dusk blue with warm lit houses. */
const EMBER: NookPal = {
  ...OCHRE,
  name: 'Autumn Ember',
  wall: '#F6E3D4',
  reveal: '#EBC2A4',
  slope: '#EBC2A4',
  beam: '#9A4A2E',
  shelf: '#E6B293',
  books: ['#F2B263', '#F4A988', '#EBC2A4', '#9A4A2E', '#D9805A', '#F6E3D4', '#C98A64'],
  desk: '#DA9670',
  ring: '#F7C98B',
  core: '#FBE6C2',
  trim: '#9A4A2E',
  sillTop: '#F6E3D4',
  sillFront: '#EBC2A4',
  pot: '#D9805A',
  leaf: '#3F5A3C',
  mug: '#F6E3D4',
  mugBand: '#D9542F',
  tape: '#F6E3D4',
  skin: '#D9926B',
  nail: '#F4A988',
  sleeve: '#A8492F',
  paper: '#F6E3D4',
  panel: '#F6E3D4',
  newScreen: '#F4A988',
  sky: '#5B6A94',
  dc: '#46527C',
  dcSide: '#323A5E',
  led: '#D6E4FF',
  roofs: '#323A5E',
  snow: '#E6EBF7',
  frost: '#CBD5EC',
  houseLit: '#F7B65E',
  hero: '#D9542F',
  anchor: '#3A1F16',
  hl: '#F4A988',
};

export const NOOK_PALETTES: Record<string, NookPal> = {[MINT.name]: MINT, [SAGE.name]: SAGE, [OCHRE.name]: OCHRE, [EMBER.name]: EMBER};

/** Palette by name ("Mint & Clay 1.1", "2 Mint & Clay 1.1", or the candidate letter "A" / "B" / "C"). */
export function nookPalette(name?: string): NookPal {
  const n = (name ?? '').trim().replace(/^\d+\s+/, '').toLowerCase();
  if (n === 'b' || n.startsWith('sage')) return SAGE;
  if (n === 'c2' || n.includes('ember')) return EMBER;
  if (n === 'c' || n.startsWith('autumn') || n.startsWith('ochre')) return OCHRE;
  return MINT;
}

// ---------------------------------------------------------------- layout (canvas px at rest)

const DESK_Y = 1192; // the desk's back edge = the sill's bottom
const GLASS = {x: 340, y: 636, w: 630, h: 520}; // kit Window opening (its frame band adds 14 px around)
const MULL_X = 648; // vertical mullion (14 wide)
const TRANSOM_Y = 828; // horizontal transom (14 tall)
const PHONE = {x: 490, y: 1066, w: 400, h: 880, rot: -3, cx: 690, cy: 1510}; // 'Add to cart' lands at y <= 1480 (ENGINE safe)
const W_MID = stroke.ink; // 3.4
const W_THIN = stroke.inkThin; // 2.2
const W_HAIR = stroke.inkHair; // 1.6
const W_FRONT = stroke.inkBold; // 4.8

type PP = {P: NookPal};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const add = (a: Pt, b: Pt, k = 1): Pt => [a[0] + b[0] * k, a[1] + b[1] * k];
/** Screen point of a phone-local point (the phone is rotated about its centre). */
const phonePt = (x: number, y: number): Pt => {
  const c = Math.cos((PHONE.rot * Math.PI) / 180);
  const s = Math.sin((PHONE.rot * Math.PI) / 180);
  const dx = x - PHONE.cx;
  const dy = y - PHONE.cy;
  return [PHONE.cx + dx * c - dy * s, PHONE.cy + dx * s + dy * c];
};

// ---------------------------------------------------------------- room: attic slope + beam (the top-edge object)

const Room: React.FC<PP> = ({P}) => {
  const k = 284 / 550; // slope of the eave line
  const slope: Pt[] = [
    [560, -40],
    [1120, -40],
    [1120, -30 + 560 * k],
  ];
  const beam: Pt[] = [
    [560, -30],
    [1120, -30 + 560 * k],
    [1120, -4 + 560 * k],
    [510, -30],
  ];
  return (
    <>
      <Fill d={polyPath(slope)} color={P.slope} offset={false} />
      <Fill d={polyPath(beam)} color={P.beam} seed="beam" />
      <Ink d={line(560, -30, 1120, -30 + 560 * k, {over: [0, 0], seed: 'eave'}) + line(510, -30, 1120, -4 + 560 * k, {over: [0, 0], seed: 'eave2'})} width={W_MID} />
      {/* ceiling planks, parallel to the eave */}
      <Ink d={[64, 128, 192].map((d) => line(560 + d / k, -30, 1120, -30 - d + 560 * k, {over: [0, 0], seed: `pl${d}`})).join('')} width={W_THIN} />
    </>
  );
};

// ---------------------------------------------------------------- shelf (left, cut by the top; open back = the wall)

type Book = {x: number; w: number; h: number; c: string; band: number; band2: boolean; label: boolean};

function bookRow(x0: number, x1: number, hMin: number, hMax: number, P: NookPal, seed: string): Book[] {
  const r = rng(`books/${seed}`);
  const out: Book[] = [];
  let x = x0;
  while (x < x1 - 16) {
    const w = Math.min(r.range(19, 34), x1 - x);
    const h = r.range(hMin, hMax);
    const c = r.chance(0.13) ? P.anchor : r.pick(P.books);
    out.push({x, w, h, c, band: r.range(0.12, 0.26), band2: r.chance(0.45), label: r.chance(0.3)});
    x += w + (r.chance(0.18) ? r.range(2, 5) : 0);
  }
  return out;
}

const Books: React.FC<{P: NookPal; x0: number; x1: number; base: number; hMin: number; hMax: number; seed: string; lean?: boolean}> = ({P, x0, x1, base, hMin, hMax, seed, lean}) => {
  const row = bookRow(x0, lean ? x1 - 40 : x1, hMin, hMax, P, seed);
  let ink = '';
  const fills: React.ReactNode[] = [];
  row.forEach((b, i) => {
    const y = base - b.h;
    fills.push(<Fill key={`f${i}`} rect={[b.x, y, b.w, b.h]} color={b.c} seed={`${seed}/${i}`} />);
    ink += rect(b.x, y, b.w, b.h, {seed: `${seed}/r${i}`, over: 'small', edges: 'tlr'});
    ink += hline(b.x + 2, b.x + b.w - 2, y + b.h * b.band, {seed: `${seed}/b${i}`, over: [1, 1]});
    if (b.band2) ink += hline(b.x + 2, b.x + b.w - 2, y + b.h * (1 - b.band * 0.7), {seed: `${seed}/c${i}`, over: [1, 1]});
    if (b.label && b.w > 22) ink += rect(b.x + 5, y + b.h * 0.42, b.w - 10, b.h * 0.16, {seed: `${seed}/l${i}`, over: [1, 2]});
  });
  let leanEl: React.ReactNode = null;
  if (lean) {
    // the last book leans on its neighbour
    const last = row[row.length - 1];
    const lx = last ? last.x + last.w + 2 : x0;
    const h = (hMin + hMax) / 2;
    const a = (-14 * Math.PI) / 180;
    const pts: Pt[] = [
      [lx + 4, base],
      [lx + 4 + 28 * Math.cos(a), base + 28 * Math.sin(a)],
      [lx + 4 + 28 * Math.cos(a) + h * Math.sin(-a), base + 28 * Math.sin(a) - h * Math.cos(a)],
      [lx + 4 + h * Math.sin(-a), base - h * Math.cos(a)],
    ];
    // lean to the left onto the row: mirror the tilt
    const m: Pt[] = pts.map(([px, py]) => [lx + (px - lx) * 0.6 + (base - py) * -0.25 + 26, py]);
    leanEl = (
      <>
        <Fill d={polyPath(m)} color={P.books[2]} seed={`${seed}/lean`} />
        <Ink d={poly(m, {closed: true, seed: `${seed}/leanI`, over: 'small'})} width={W_THIN} />
      </>
    );
  }
  return (
    <>
      {fills}
      <Ink d={ink} width={W_THIN} />
      {leanEl}
    </>
  );
};

const BOARDS = [-8, 268, 584, 856, 1150]; // top of each 16 px board
const UPRIGHT = {x: 116, w: 24}; // clear of the caption lines (line 2 starts at x ~160)

const Shelf: React.FC<PP> = ({P}) => {
  // ink of the upright is broken across the caption band (y 300-584 stays a flat field)
  const up =
    vline(UPRIGHT.x, -30, 300, {over: [0, 0], seed: 'u1'}) +
    vline(UPRIGHT.x + UPRIGHT.w, -30, 300, {over: [0, 0], seed: 'u2'}) +
    vline(UPRIGHT.x, 584, DESK_Y, {over: [0, 0], seed: 'u3'}) +
    vline(UPRIGHT.x + UPRIGHT.w, 584, DESK_Y, {over: [0, 0], seed: 'u4'});
  let boards = '';
  BOARDS.forEach((y, i) => {
    boards += hline(-30, UPRIGHT.x, y, {seed: `bt${i}`, over: [0, 3]}) + hline(-30, UPRIGHT.x, y + 16, {seed: `bb${i}`, over: [0, 2]});
  });
  return (
    <>
      <Books P={P} x0={-14} x1={112} base={BOARDS[1]} hMin={150} hMax={214} seed="c1" />
      <Books P={P} x0={-14} x1={58} base={BOARDS[3]} hMin={160} hMax={222} seed="c3" />
      <Books P={P} x0={-14} x1={108} base={BOARDS[4]} hMin={170} hMax={230} seed="c4" lean />
      {/* a small potted plant (a sign of care) */}
      <Fill d={polyPath([[66, 812], [110, 812], [104, 856], [72, 856]])} color={P.pot} seed="pot" />
      <Ink d={poly([[66, 812], [110, 812], [104, 856], [72, 856]], {closed: true, seed: 'potI', over: 'small'})} width={W_THIN} />
      <Fill d={crown(88, 784, 30, 30, {seed: 'leaf', bumps: 7, round: 0.7})} color={P.leaf} seed="leafF" />
      <Ink d={crown(88, 784, 30, 30, {seed: 'leaf', bumps: 7, round: 0.7})} width={W_THIN} open={0.3} />
      {BOARDS.map((y, i) => (
        <Fill key={i} rect={[-30, y, UPRIGHT.x + 30, 16]} color={P.shelf} seed={`board${i}`} />
      ))}
      <Fill rect={[UPRIGHT.x, -30, UPRIGHT.w, DESK_Y + 30]} color={P.shelf} offset={false} />
      <Ink d={boards} width={W_MID} />
      <Ink d={up} width={W_MID} />
    </>
  );
};

// ---------------------------------------------------------------- the window: reveal, kit frame, the cold outside

/** The stylised data center: a tall stack of server floors (cut by the window top), rows of small LED ticks, an
 *  annex with rooftop units, a long low block for the campus. Far plane: fill only, no ink. */
const DataCenter: React.FC<PP> = ({P}) => {
  const ticks: React.ReactNode[] = [];
  const r = rng('dc/leds');
  const row = (x0: number, x1: number, y: number, step: number, w: number, key: string, off = 0.08) => {
    for (let x = x0, i = 0; x + w <= x1; x += step, i++) if (!r.chance(off)) ticks.push(<rect key={`${key}${i}`} x={x} y={y} width={w} height={5} fill={P.led} />);
  };
  const floors: React.ReactNode[] = [];
  for (let y = 600, i = 0; y < 1060; y += 50, i++) {
    floors.push(<rect key={`fl${i}`} x={736} y={y} width={186} height={6} fill={P.dcSide} />);
    row(750, 910, y + 24, 18, 9, `t${i}`);
  }
  [990, 1022].forEach((y, i) => row(574, 700, y, 18, 9, `a${i}`, 0.15));
  row(392, 556, 1034, 22, 9, 'c', 0.35);
  return (
    <>
      <rect x={372} y={1008} width={240} height={70} fill={P.dc} />
      <rect x={560} y={960} width={152} height={118} fill={P.dc} />
      <rect x={560} y={960} width={152} height={8} fill={P.dcSide} />
      <rect x={572} y={950} width={58} height={10} fill={P.dcSide} />
      <rect x={644} y={946} width={40} height={14} fill={P.dcSide} />
      <rect x={706} y={560} width={30} height={518} fill={P.dcSide} />
      <rect x={736} y={560} width={186} height={518} fill={P.dc} />
      {floors}
      {ticks}
    </>
  );
};

type House = {x0: number; x1: number; eave: number; peak: number; lit?: [number, number]};
const HOUSES: House[] = [
  {x0: 326, x1: 448, eave: 1094, peak: 1052, lit: [372, 1114]},
  {x0: 430, x1: 570, eave: 1102, peak: 1064},
  {x0: 860, x1: 990, eave: 1088, peak: 1046, lit: [912, 1106]},
];

const Outside: React.FC<{P: NookPal; t: number}> = ({P, t}) => {
  const g = GLASS;
  // snow pile on the outside sill: a scalloped strip along the glass bottom
  const r = rng('sillsnow');
  let snowPile = `M${g.x - 4} ${g.y + g.h + 4}L${g.x - 4} ${g.y + g.h - 14}`;
  for (let x = g.x - 4; x < g.x + g.w + 4; ) {
    const w = r.range(34, 70);
    const nx = Math.min(g.x + g.w + 4, x + w);
    snowPile += `Q${(x + nx) / 2} ${g.y + g.h - 14 - r.range(10, 18)} ${nx} ${g.y + g.h - 14 + r.jitter(2)}`;
    x = nx;
  }
  snowPile += `L${g.x + g.w + 4} ${g.y + g.h + 4}Z`;
  // falling snow (steady weather outside): seeded flakes that drift down and wrap
  const fr = rng('flakes');
  const flakes: React.ReactNode[] = [];
  for (let i = 0; i < 26; i++) {
    const x0 = fr.range(g.x + 8, g.x + g.w - 8);
    const y0 = fr.range(g.y, g.y + g.h);
    const sp = fr.range(26, 44);
    const rad = fr.range(2.6, 4.6);
    const y = g.y + ((y0 - g.y + sp * t) % g.h);
    const x = x0 + Math.sin(t * 0.9 + i) * 4;
    flakes.push(<circle key={i} cx={x} cy={y} r={rad} fill={P.snow} />);
  }
  const frost = [crown(g.x + 6, g.y + g.h - 4, 120, 74, {seed: 'fr1', bumps: 9, round: 0.7}), crown(g.x + g.w - 4, g.y + g.h - 6, 104, 66, {seed: 'fr2', bumps: 8, round: 0.7}), crown(g.x, g.y, 96, 66, {seed: 'fr3', bumps: 7, round: 0.7}), crown(g.x + g.w, g.y, 104, 72, {seed: 'fr4', bumps: 7, round: 0.7})];
  // a few frost crystals, hairline, only in the frost
  const star = (x: number, y: number, s: number) => line(x - s, y, x + s, y, {over: [0, 0], seed: `s${x}a`}) + line(x - s * 0.5, y - s * 0.86, x + s * 0.5, y + s * 0.86, {over: [0, 0], seed: `s${x}b`}) + line(x + s * 0.5, y - s * 0.86, x - s * 0.5, y + s * 0.86, {over: [0, 0], seed: `s${x}c`});
  return (
    <>
      <DataCenter P={P} />
      {HOUSES.map((h, i) => {
        const pk = (h.x0 + h.x1) / 2;
        const body: Pt[] = [
          [h.x0, g.y + g.h + 10],
          [h.x0, h.eave],
          [h.x0 - 10, h.eave + 4],
          [pk, h.peak],
          [h.x1 + 10, h.eave + 4],
          [h.x1, h.eave],
          [h.x1, g.y + g.h + 10],
        ];
        const cap: Pt[] = [
          [h.x0 - 14, h.eave + 6],
          [pk, h.peak - 9],
          [h.x1 + 14, h.eave + 6],
          [h.x1 + 4, h.eave + 12],
          [pk, h.peak + 8],
          [h.x0 - 4, h.eave + 12],
        ];
        return (
          <React.Fragment key={i}>
            <Fill d={polyPath(body)} color={P.roofs} offset={false} />
            <Fill d={polyPath(cap)} color={P.snow} offset={false} />
            {h.lit ? <rect x={h.lit[0]} y={h.lit[1]} width={15} height={18} fill={P.houseLit} /> : null}
          </React.Fragment>
        );
      })}
      {flakes}
      {frost.map((d, i) => (
        <Fill key={i} d={d} color={P.frost} offset={false} />
      ))}
      <Fill d={snowPile} color={P.snow} offset={false} />
      <Ink d={star(g.x + 44, g.y + g.h - 44, 9) + star(g.x + 96, g.y + g.h - 22, 6) + star(g.x + g.w - 40, g.y + g.h - 40, 8) + star(g.x + 26, g.y + 22, 8) + star(g.x + 62, g.y + 14, 5) + star(g.x + g.w - 30, g.y + 26, 8) + star(g.x + g.w - 70, g.y + 12, 5)} width={W_HAIR} />
    </>
  );
};

const WindowView: React.FC<{P: NookPal; t: number}> = ({P, t}) => {
  const id = 'glass' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const g = GLASS;
  const fb = 14;
  const fx0 = g.x - fb;
  const fy0 = g.y - fb;
  const fx1 = g.x + g.w + fb;
  // the wall opening: reveal outer edge (left 22, top 26, right 30 px of wall depth)
  const ox0 = fx0 - 22;
  const oy0 = fy0 - 26;
  const ox1 = fx1 + 30;
  const sill0 = 1160;
  const reveal = [
    polyPath([[ox0, oy0], [ox1, oy0], [fx1, fy0], [fx0, fy0]]),
    polyPath([[ox0, oy0], [fx0, fy0], [fx0, sill0], [ox0, sill0]]),
    polyPath([[ox1, oy0], [ox1, sill0], [fx1, sill0], [fx1, fy0]]),
  ];
  const revealInk = rect(ox0, oy0, ox1 - ox0, sill0 - oy0, {seed: 'open', edges: 'tlr', over: 'medium'}) + line(ox0, oy0, fx0, fy0, {over: [0, 2], seed: 'm1'}) + line(ox1, oy0, fx1, fy0, {over: [0, 2], seed: 'm2'});
  const mullD = rect(MULL_X, g.y, 14, g.h, {seed: 'mv', over: [0, 0], edges: 'lr'}) + rect(g.x, TRANSOM_Y, g.w, 14, {seed: 'mh', over: [0, 0], edges: 'tb'});
  return (
    <>
      {reveal.map((d, i) => (
        <Fill key={i} d={d} color={P.reveal} offset={false} />
      ))}
      <Ink d={revealInk} width={W_MID} />
      {/* kit Window: the frame band, the night glass and its outline */}
      <Window x={g.x} y={g.y} w={g.w} h={g.h} panes={1} glass={P.sky} frame={P.trim} glint={false} seed="nookwin" />
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <rect x={g.x + 2} y={g.y + 2} width={g.w - 4} height={g.h - 4} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <Outside P={P} t={t} />
      </g>
      <Fill rect={[MULL_X, g.y, 14, g.h]} color={P.trim} offset={false} />
      <Fill rect={[g.x, TRANSOM_Y, g.w, 14]} color={P.trim} offset={false} />
      <Ink d={mullD} width={W_THIN} />
      <Fill d={blob(MULL_X + 7, TRANSOM_Y + 22, 7, 9, {seed: 'latch'})} color={P.anchor} offset={false} />
      {/* the inside sill (the desk line) */}
      <Fill rect={[ox0 - 14, sill0, ox1 - ox0 + 28, 16]} color={P.sillTop} seed="sillT" />
      <Fill rect={[ox0 - 14, sill0 + 16, ox1 - ox0 + 28, DESK_Y - sill0 - 16]} color={P.sillFront} seed="sillF" />
      <Ink d={hline(ox0 - 14, ox1 + 14, sill0, {seed: 'sl1', over: 'medium'}) + hline(ox0 - 14, ox1 + 14, sill0 + 16, {seed: 'sl2', over: 'small'}) + vline(ox0 - 14, sill0, DESK_Y, {over: [0, 0], seed: 'sl3'}) + vline(ox1 + 14, sill0, DESK_Y, {over: [0, 0], seed: 'sl4'})} width={W_MID} />
    </>
  );
};

// ---------------------------------------------------------------- the desk and the lamp pool

const POOL = {cx: 222, cy: 1338, rx: 330, ry: 120};

const Desk: React.FC<PP> = ({P}) => (
  <>
    <Fill rect={[-40, DESK_Y, 1160, 800]} color={P.desk} offset={false} />
    <Ink d={hline(-60, 1140, DESK_Y, {seed: 'deskE', over: 'structural'})} width={W_MID} />
    {/* the pool: two flat rings, lighter toward the centre, no gradient (COZY 3) */}
    <Fill d={blob(POOL.cx, POOL.cy, POOL.rx, POOL.ry, {seed: 'pool1', wobble: 0.02})} color={P.ring} offset={false} />
    <Fill d={blob(POOL.cx - 6, POOL.cy - 6, POOL.rx * 0.6, POOL.ry * 0.6, {seed: 'pool2', wobble: 0.025})} color={P.core} offset={false} />
    <Ink d={line(40, 1560, 300, 1566, {seed: 'gr1', over: [0, 0]}) + line(120, 1690, 420, 1697, {seed: 'gr2', over: [0, 0]}) + line(30, 1830, 210, 1834, {seed: 'gr3', over: [0, 0]})} width={W_THIN} />
  </>
);

/** Anglepoise desk lamp in the anchor colour, its lit mouth in the pool's core colour; the head points at the hinge. */
const Lamp: React.FC<PP> = ({P}) => {
  const base: Pt = [424, 1236];
  const elbow: Pt = [476, 1058];
  const head: Pt = [366, 986];
  const rodD = `M${base[0]} ${base[1] - 10}L${elbow[0]} ${elbow[1]}L${head[0]} ${head[1]}`;
  const shadeD = `M-24 0Q0 -16 24 0L72 104L-72 104Z`;
  return (
    <>
      <Fill d={blob(base[0], base[1], 56, 15, {seed: 'lb'})} color={P.anchor} />
      <Ink d={ellipse(base[0], base[1], 56, 15, {seed: 'lbI'})} width={W_MID} />
      <Ink d={rodD} width={11} color={P.anchor} taper={false} />
      <Ink d={line(base[0] + 12, base[1] - 30, elbow[0] + 12, elbow[1] + 22, {over: [0, 0], seed: 'spring'})} width={W_HAIR} />
      <Fill d={blob(elbow[0], elbow[1], 11, 11, {seed: 'el'})} color={P.anchor} />
      <Ink d={circle(elbow[0], elbow[1], 11, {seed: 'elI'})} width={W_THIN} />
      <XG m={mat.compose(mat.translate(head[0], head[1]), mat.rotate(28))}>
        <Fill d={shadeD} color={P.anchor} offset={[1.5, 1]} />
        <Ink d={poly([[-24, 0], [-72, 104]], {seed: 'sh1'}) + poly([[24, 0], [72, 104]], {seed: 'sh2'}) + 'M-24 0Q0 -16 24 0'} width={W_MID} />
        <Fill d={blob(0, 104, 72, 16, {seed: 'mouth'})} color={P.core} offset={false} />
        <Ink d={ellipse(0, 104, 72, 16, {seed: 'mouthI'})} width={W_MID} />
        <Fill d={blob(0, -10, 9, 8, {seed: 'knob'})} color={P.anchor} offset={false} />
      </XG>
    </>
  );
};

// ---------------------------------------------------------------- the old laptop (hero), taped hinge

const OldLaptop: React.FC<PP> = ({P}) => {
  const x = 78;
  const y = 1104;
  const w = 280;
  const h = 178;
  const hy = y + h; // hinge
  const deck: Pt[] = [
    [x, hy],
    [x + w, hy],
    [x + w + 26, hy + 60],
    [x - 26, hy + 60],
  ];
  const edge: Pt[] = [
    [x - 26, hy + 60],
    [x + w + 26, hy + 60],
    [x + w + 26, hy + 70],
    [x - 26, hy + 70],
  ];
  // the tape strip across the left hinge (torn ends)
  const tapeLocal: Pt[] = [
    [-50, -13],
    [46, -13],
    [50, -6],
    [45, 0],
    [51, 7],
    [46, 13],
    [-50, 13],
    [-45, 6],
    [-51, -1],
    [-45, -7],
  ];
  const ta = (-32 * Math.PI) / 180;
  const tc: Pt = [x + 30, hy + 6];
  const tape: Pt[] = tapeLocal.map(([px, py]) => [tc[0] + px * Math.cos(ta) - py * Math.sin(ta), tc[1] + px * Math.sin(ta) + py * Math.cos(ta)]);
  const keyRow = (yy: number, inset: number) => `M${x + inset} ${yy}L${x + w - inset} ${yy}`;
  return (
    <>
      <Fill d={roundRect(x, y, w, h, 12)} color={P.hero} seed="olid" />
      <Fill rect={[x + 20, y + 20, w - 40, h - 36]} color={P.anchor} offset={false} />
      <Ink d={roundRect(x, y, w, h, 12, {seed: 'olidI'})} width={W_MID} />
      <Ink d={rect(x + 20, y + 20, w - 40, h - 36, {seed: 'oscr', over: [1, 3]})} width={W_THIN} />
      <Ink d={glint(x + 70, y + 110, 46, {seed: 'oglint'})} width={W_THIN} color={P.core} />
      <Fill d={polyPath(edge)} color={P.hero} seed="oedge" />
      <Fill d={polyPath(deck)} color={P.hero} seed="odeck" />
      <Ink d={poly(deck, {closed: true, seed: 'odeckI'}) + poly([edge[1], edge[2], edge[3], edge[0]], {seed: 'oedgeI'})} width={W_MID} />
      <Ink d={keyRow(hy + 12, 18) + keyRow(hy + 25, 12) + keyRow(hy + 38, 6)} width={8} color={P.anchor} dash="15 5" />
      <Ink d={rect(x + w / 2 - 44, hy + 46, 88, 10, {seed: 'otp', over: [1, 2]})} width={W_HAIR} />
      <Fill d={polyPath(tape)} color={P.tape} offset={[1, 1]} />
      <Ink d={poly(tape, {closed: true, joined: true, seed: 'tapeI'})} width={W_THIN} />
    </>
  );
};

// ---------------------------------------------------------------- the mug (steam = small slow loop)

const Mug: React.FC<{P: NookPal; t: number}> = ({P, t}) => {
  const x0 = 914;
  const x1 = 1012;
  const top = 1222;
  const bot = 1334;
  const body = `M${x0} ${top}L${x0} ${bot - 18}Q${x0} ${bot} ${x0 + 18} ${bot}L${x1 - 18} ${bot}Q${x1} ${bot} ${x1} ${bot - 18}L${x1} ${top}Z`;
  const steam = (sx: number, ph: number) => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 5; i++) pts.push([sx + Math.sin(i * 1.3 + ph + t * 1.6) * 8, top - 18 - i * 22]);
    return smooth(pts);
  };
  return (
    <>
      <Ink d={`M${x1 - 2} ${top + 22}C${x1 + 44} ${top + 18} ${x1 + 44} ${top + 84} ${x1 - 2} ${top + 80}`} width={15} color={P.mug} taper={false} />
      <Ink d={`M${x1 - 2} ${top + 14}C${x1 + 54} ${top + 10} ${x1 + 54} ${top + 92} ${x1 - 2} ${top + 88}`} width={W_THIN} />
      <Fill d={body} color={P.mug} seed="mug" />
      <Fill rect={[x0, top + 40, x1 - x0, 18]} color={P.mugBand} offset={false} />
      <Ink d={line(x0, top, x0, bot - 14, {over: [0, 0], seed: 'mg1'}) + line(x1, top, x1, bot - 14, {over: [0, 0], seed: 'mg2'}) + `M${x0} ${bot - 18}Q${x0} ${bot} ${x0 + 18} ${bot}L${x1 - 18} ${bot}Q${x1} ${bot} ${x1} ${bot - 18}`} width={W_MID} />
      <Fill d={blob((x0 + x1) / 2, top, (x1 - x0) / 2, 11, {seed: 'rim'})} color={P.anchor} offset={false} />
      <Ink d={ellipse((x0 + x1) / 2, top, (x1 - x0) / 2, 11, {seed: 'rimI'})} width={W_MID} />
      <Ink d={steam(946, 0) + steam(980, 2.1)} width={W_THIN} />
    </>
  );
};

// ---------------------------------------------------------------- an open notebook + pencil (foreground, cut by the left)

const Notebook: React.FC<PP> = ({P}) => {
  const L: Pt[] = [[-60, 1600], [150, 1580], [160, 1830], [-50, 1850]];
  const R: Pt[] = [[150, 1580], [352, 1606], [348, 1852], [160, 1830]];
  const pencil: Pt[] = [[60, 1906], [330, 1722], [344, 1740], [76, 1924]];
  const tip: Pt[] = [[330, 1722], [372, 1704], [344, 1740]];
  return (
    <>
      <Fill d={polyPath([[-64, 1594], [356, 1600], [352, 1860], [-54, 1858]])} color={P.books[4]} seed="nbc" />
      <Fill d={polyPath(L)} color={P.paper} seed="nbl" />
      <Fill d={polyPath(R)} color={P.paper} seed="nbr" />
      <Ink d={poly(L, {closed: true, seed: 'nblI', over: 'small'}) + poly(R, {closed: true, seed: 'nbrI', over: 'small'})} width={W_MID} />
      <Ink d={[0, 1, 2, 3, 4].map((i) => line(186, 1640 + i * 34, 326, 1652 + i * 34, {over: [0, 0], seed: `nr${i}`})).join('') + [0, 1, 2].map((i) => line(-20, 1654 + i * 36, 120, 1644 + i * 36, {over: [0, 0], seed: `nl${i}`})).join('')} width={W_HAIR} />
      <Fill d={polyPath(pencil)} color={P.books[0]} seed="pen" />
      <Fill d={polyPath(tip)} color={P.paper} offset={false} />
      <Ink d={poly(pencil, {closed: true, seed: 'penI', over: 'small'}) + poly(tip, {closed: true, seed: 'tipI', over: [0, 0]})} width={W_MID} />
    </>
  );
};

// ---------------------------------------------------------------- the phone (foreground, cut by the bottom)

const UiText: React.FC<{x: number; y: number; size: number; fill: string; anchor?: 'start' | 'middle'; children: React.ReactNode}> = ({x, y, size, fill, anchor = 'start', children}) => (
  <text x={x} y={y} fontFamily={captionFontStack} fontSize={size} fill={fill} textAnchor={anchor}>
    {children}
  </text>
);

const Phone: React.FC<PP> = ({P}) => {
  const {x, y, w, h} = PHONE;
  const heroMap = (c: string) => {
    const u = c.toUpperCase();
    return u === theme.tealDark.toUpperCase() || u === theme.sand.toUpperCase() ? P.hero : c;
  };
  const sparkle = (sx: number, sy: number, s: number) => `M${sx} ${sy - s}L${sx} ${sy + s}M${sx - s} ${sy}L${sx + s} ${sy}`;
  return (
    <XG m={mat.about(mat.rotate(PHONE.rot), PHONE.cx, PHONE.cy)}>
      <Fill d={roundRect(x, y, w, h, 56)} color={P.anchor} seed="phone" />
      <Fill d={roundRect(x + 16, y + 16, w - 32, h - 32, 42)} color={P.screen} offset={false} />
      <Ink d={roundRect(x, y, w, h, 56, {seed: 'phoneI'})} width={W_FRONT} />
      <Fill d={roundRect(x + 160, y + 30, 80, 20, 10)} color={P.anchor} offset={false} />
      {/* shop header: back chevron, title, cart with its badge */}
      <Ink d={poly([[x + 52, y + 70], [x + 40, y + 82], [x + 52, y + 94]], {joined: true, seed: 'chev'})} width={W_THIN} />
      <UiText x={x + 64} y={y + 93} size={32} fill={P.ink}>
        Laptops
      </UiText>
      <Ink d={poly([[x + 300, y + 70], [x + 310, y + 70], [x + 318, y + 94], [x + 342, y + 94], [x + 348, y + 78], [x + 313, y + 78]], {joined: true, seed: 'cart'}) + circle(x + 322, y + 102, 4, {seed: 'w1'}) + circle(x + 340, y + 102, 4, {seed: 'w2'})} width={W_THIN} />
      <Fill d={blob(x + 352, y + 64, 16, 16, {seed: 'badge'})} color={P.pop} offset={false} />
      <Ink d={circle(x + 352, y + 64, 16, {seed: 'badgeI'})} width={W_THIN} />
      <UiText x={x + 352} y={y + 73} size={26} fill={P.popText} anchor="middle">
        1
      </UiText>
      {/* product photo: the new laptop (kit Laptop, its lid and base remapped to the hero) */}
      <Fill d={roundRect(x + 36, y + 114, w - 72, 150, 18)} color={P.panel} offset={false} />
      <Tod map={heroMap}>
        <Laptop x={x + 118} y={y + 128} w={164} screen={P.newScreen} seed="newlap" width={W_MID} />
      </Tod>
      <Ink d={glint(x + 156, y + 200, 34, {seed: 'nglint'})} width={W_THIN} />
      <Ink d={sparkle(x + 312, y + 142, 10) + sparkle(x + 90, y + 222, 7)} width={W_THIN} />
      <Ink d={textLines(x + 40, y + 288, 230, {n: 2, gap: 18, seed: 'title'})} width={W_THIN} />
      {/* "Add to cart" (the pop), mid-tap */}
      <Fill d={roundRect(x + 40, y + 330, 320, 72, 20)} color={P.pop} seed="btn" />
      <Ink d={roundRect(x + 40, y + 330, 320, 72, 20, {seed: 'btnI'})} width={W_MID} />
      <UiText x={x + 180} y={y + 380} size={46} fill={P.popText} anchor="middle">
        Add to cart
      </UiText>
      <Ink d={textLines(x + 40, y + 440, 300, {n: 4, gap: 22, seed: 'desc', heading: false})} width={W_HAIR} />
    </XG>
  );
};

/** The paper price tag hanging off the phone on a string (the pop; $ marks, no real price). */
const Tag: React.FC<PP> = ({P}) => {
  const from = phonePt(PHONE.x + 12, PHONE.y + 58);
  const hole: Pt = [444, 1226];
  const shape: Pt[] = [
    [-22, -60],
    [22, -60],
    [46, -36],
    [46, 64],
    [-46, 64],
    [-46, -36],
  ];
  const m = mat.compose(mat.translate(hole[0], hole[1]), mat.rotate(9), mat.translate(0, 44));
  return (
    <>
      <Ink d={smooth([from, [from[0] - 20, from[1] + 30], [hole[0] + 2, hole[1] - 16], hole])} width={W_THIN} />
      <XG m={m}>
        <Fill d={polyPath(shape)} color={P.pop} seed="tag" />
        <Ink d={poly(shape, {closed: true, seed: 'tagI', over: 'small'})} width={W_MID} />
        <Fill d={blob(0, -44, 7, 7, {seed: 'hole'})} color={P.core} offset={false} />
        <Ink d={circle(0, -44, 7, {seed: 'holeI'})} width={W_THIN} />
        <UiText x={0} y={26} size={60} fill={P.popText} anchor="middle">
          $$
        </UiText>
      </XG>
    </>
  );
};

// ---------------------------------------------------------------- the hand (POV: thumb on "Add to cart", no face)

const Hand: React.FC<PP> = ({P}) => {
  const B: Pt = [950, 1740];
  const T: Pt = phonePt(PHONE.x + 330, PHONE.y + 368);
  const len = Math.hypot(T[0] - B[0], T[1] - B[1]);
  const u: Pt = [(T[0] - B[0]) / len, (T[1] - B[1]) / len];
  const n: Pt = [-u[1], u[0]];
  const thumb: Pt[] = [add(B, n, 50), add(add(T, n, 37), u, -10), add(add(T, n, 24), u, 22), add(T, u, 34), add(add(T, n, -24), u, 22), add(add(T, n, -37), u, -10), add(B, n, -50)];
  const nailC = add(T, u, -6);
  const ang = (Math.atan2(u[1], u[0]) * 180) / Math.PI + 90;
  const crease = (k: number, s: number) => {
    const c = add(T, u, -k);
    return line(...add(c, n, s), ...add(c, n, -s * 0.7), {over: [0, 0], seed: `cr${k}`});
  };
  const palm = 'M680 1990C700 1860 760 1772 862 1730C944 1698 1040 1706 1110 1730L1110 1990Z';
  const fingers: Pt[] = [phonePt(PHONE.x + 4, 1604), phonePt(PHONE.x + 2, 1652), phonePt(PHONE.x, 1700)];
  return (
    <>
      {fingers.map(([fx, fy], i) => (
        <React.Fragment key={i}>
          <XG m={mat.compose(mat.translate(fx, fy), mat.rotate(12 - i * 4))}>
            <Fill d={roundRect(-56, -22, 82, 44, 21)} color={P.skin} seed={`fgf${i}`} />
            <Ink d={roundRect(-56, -22, 82, 44, 21, {seed: `fgI${i}`})} width={W_MID} />
            <Ink d={line(4, -11, 7, 11, {over: [0, 0], seed: `fgn${i}`})} width={W_HAIR} />
          </XG>
        </React.Fragment>
      ))}
      <Fill d={smooth(thumb, {closed: true})} color={P.skin} seed="thumb" />
      <Ink d={smooth(thumb.slice(0, 6))} width={W_FRONT} />
      <Ink d={line(...thumb[5], ...add(thumb[6], u, 40), {over: [0, 0], seed: 'thE'})} width={W_FRONT} />
      <XG m={mat.compose(mat.translate(nailC[0], nailC[1]), mat.rotate(ang))}>
        <Fill d={roundRect(-19, -22, 38, 42, 14)} color={P.nail} offset={false} />
        <Ink d={roundRect(-19, -22, 38, 42, 14, {seed: 'nail'})} width={W_THIN} />
      </XG>
      <Ink d={crease(118, 20) + crease(132, 14)} width={W_THIN} />
      <Fill d={palm} color={P.skin} seed="palm" />
      <Ink d="M680 1990C700 1860 760 1772 862 1730C944 1698 1040 1706 1110 1730" width={W_FRONT} />
      <Fill d={polyPath([[900, 1990], [940, 1880], [1110, 1836], [1110, 1990]])} color={P.sleeve} seed="sleeve" />
      <Ink d={line(940, 1880, 1110, 1836, {seed: 'cuff', over: 'medium'}) + line(966, 1902, 1110, 1866, {seed: 'cuff2', over: 'small'})} width={W_FRONT} />
    </>
  );
};

// ---------------------------------------------------------------- the hook caption (frame-0 words, on the flat wall)

const HookCaption: React.FC<PP> = ({P}) => {
  const ok = useCaptionFont();
  if (!ok) return null;
  const lines = ['AI is making your', 'next laptop pricier.'];
  const hl = 'pricier.';
  let size = skyCaption.size * 1.06; // hook style
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

export type StyleNookProps = {
  /** "Mint & Clay 1.1" | "Sage Study" | "Autumn Ochre" (or "A" / "B" / "C"). */
  palette?: string;
  /** Draw the frame-0 hook words in the caption band (default true). */
  caption?: boolean;
};

export const StyleNook: React.FC<StyleNookProps> = ({palette: name = MINT.name, caption = true}) => {
  const P = nookPalette(name);
  const t = useTime();
  // frame 0's 3 % push (S1: the push is already running on frame 0); captions stay in screen space
  const z = 1 + 0.03 * clamp01(t / 4);
  const cam = mat.about(mat.scale(z), 540, 948);
  return (
    <AbsoluteFill style={{background: P.wall, overflow: 'hidden'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        <XG m={cam}>
          <rect x={-200} y={-200} width={1480} height={2320} fill={P.wall} />
          <Room P={P} />
          <Shelf P={P} />
          <WindowView P={P} t={t} />
          <Desk P={P} />
          <Lamp P={P} />
          <OldLaptop P={P} />
          <Mug P={P} t={t} />
          <Notebook P={P} />
          <Phone P={P} />
          <Tag P={P} />
          <Hand P={P} />
        </XG>
        {caption ? <HookCaption P={P} /> : null}
      </svg>
    </AbsoluteFill>
  );
};
