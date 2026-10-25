// S08 additions to the shared DomeCity v3 (fix round 2):
//   - LightDoors: the rattler doors drawn LIGHT (cream / peach, ink sides + top, a dark handle) on rows 2-3, so every
//     ink-dark rattler sits on a light door (the set's teal doors are off: `doors={false}`); row 3 has three big near
//     doors for the 86-92 px rattlers.
//   - WireSpans: the three wires continue PAST the rooftop pole along S07's own curves (mapped through the cut) to a
//     second pole just right of the board (A1 fix round 1: no wires through the city right of the board or the dome
//     once the board is up); the first pole is a junction (the board covers the middle).
//   - DistrictTowers: 5 browser-chrome towers inside the glass (no glass step), the protected sites; they pop on the
//     glass frame, their browser windows a beat later (fix round 3b).
//   - DeckClutter: our roof deck between the two neighbours (hatch, vent pipes, drain, tar seams).
//   - Neighbours: two back-view rooftop neighbours cropped by the bottom edge (EdgeOnlooker, 300-420 px), in their own
//     NEAR layer (parallax factor 1.2: they drop away faster than the parapet during the crane); fix round 3b: clearly
//     different people from S07's readers (curly hair / sage coat, ochre beanie / tan coat); on 'millions' the left one
//     flinches, the right one puts both hands on its head.
import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, osc, prog, useTime} from '../../lib/time';
import {mat, XG} from '../../lib/xf';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {blob, ellipse, line, polyPath, rect, rectPath} from '../../lib/sketch';
import {BrowserChrome, DEPTH_INK, EdgeOnlooker, FigureArm} from '../shared/props';
import {SI, WIRES, wireAt} from '../shared/sets';
import {DOME8, DOORS3, R2} from './layout';
import {doorPaths} from './crowd';

// ---------------------------------------------------------------- light doors (rows 2 and 3)

const doorSet = (list: {x: number; y: number; dh: number}[], seed: string) => {
  let cream = '';
  let peach = '';
  let ink = '';
  let handles = '';
  list.forEach((q, i) => {
    const p = doorPaths(q.x, q.y, q.dh);
    if (i % 3 === 1) peach += p.fill;
    else cream += p.fill;
    ink += rect(q.x - q.dh * 0.23, q.y - q.dh, q.dh * 0.46, q.dh, {seed: `${seed}${i}`, edges: 'tlr', over: 'small'});
    handles += `M${p.handle[0].toFixed(1)} ${(p.handle[1] - q.dh * 0.05).toFixed(1)}l0 ${(q.dh * 0.1).toFixed(1)}`;
  });
  return {cream, peach, ink, handles};
};
const D3 = doorSet(
  DOORS3.map((d) => ({x: d.x, y: d.y, dh: d.h})),
  's8/d3',
);
const D2 = doorSet(
  R2.map((q) => ({x: q.x, y: q.y, dh: q.h * 1.18})),
  's8/d2',
);

/** Row 3 (`row="3"`, the near layer) or row 2 light doors. */
export const LightDoors: React.FC<{row: 2 | 3}> = ({row}) => {
  const D = row === 3 ? D3 : D2;
  const w = row === 3 ? SI.far : SI.hair;
  return (
    <>
      <Fill d={D.cream} color={palette.cream} offset={false} mode="snap" seed={`s8/ld${row}c`} />
      <Fill d={D.peach} color={palette.peach} offset={false} mode="snap" seed={`s8/ld${row}p`} />
      <Ink d={D.ink} width={w} taper={false} seed={`s8/ld${row}i`} />
      <path d={D.handles} stroke={palette.ink} strokeWidth={w * 1.4} strokeLinecap="round" />
    </>
  );
};

// ---------------------------------------------------------------- wire spans past the pole (the S07 match)

/** S07 world -> S08 world at the cut (S07 camera (480, 760) zoom 1.06, S08 camera (540, 1260) zoom 1.3). */
const K = 1.06 / 1.3;
/** A1 fix round 1: the right-hand spans END at a second rooftop pole right of the board (x 950: screen ~1073 on the cut
 *  frame, at the right edge, where S07's own pole stood just off frame; screen 950 at rest, in the right rail), so the
 *  city right of the board, the flood there and the dome are nearly wire-free once the board has risen (they ran on to
 *  the right edge through the payoff), and the tally's overflow gates on the board's frame stay clear of the pole. */
export const POLE2 = {x: 950, base: 1443, top: 1140};
const SPANS = (() => {
  let d = '';
  const ties: number[] = [];
  for (let i = 0; i < 3; i++) {
    // S07's wire i continues right of x7 = 480 (our pole) along its own curve, mapped through the cut, to POLE2
    const pts: [number, number][] = [];
    for (let k = 0; k <= 16; k++) {
      const x8 = 540 + (k / 16) * (POLE2.x - 540);
      const x7 = 480 + (x8 - 540) / K;
      const y7 = wireAt(WIRES.S07, i, x7)[1];
      // anchored on our pole's tie-off height (S07 and S08 differ by < 1 px there)
      const y8 = WIRES.S08.ys[i] + K * (y7 - wireAt(WIRES.S07, i, 480)[1]);
      pts.push([x8, y8]);
    }
    ties.push(pts[pts.length - 1][1]);
    d += pts.map((p, k) => `${k ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
  }
  return {d, ties};
})();

/** The wires' right-hand spans from the pole at x 540 to POLE2 (draw with the wires, before the board), and POLE2 itself:
 *  the kit pole's look (an ochre post with a cap, an insulator pin where each wire ties off). */
export const WireSpans: React.FC = () => {
  const P = POLE2;
  const post = polyPath([
    [P.x - 8, P.base],
    [P.x - 6, P.top],
    [P.x + 6, P.top],
    [P.x + 8, P.base],
  ]);
  const ink =
    line(P.x - 8, P.base, P.x - 6, P.top, {seed: 's8/q1', over: [0, 3]}) +
    line(P.x + 8, P.base, P.x + 6, P.top, {seed: 's8/q2', over: [0, 3]}) +
    line(P.x - 11, P.top, P.x + 11, P.top, {seed: 's8/qc', over: [2, 2]}) +
    SPANS.ties.map((yy, i) => `M${(P.x - 6).toFixed(1)} ${yy.toFixed(1)}l${(i % 2 ? 14 : -10).toFixed(1)} 0`).join('');
  return (
    <>
      <Fill d={post} color={palette.brown} seed="s8/q2post" />
      <Ink d={ink} width={SI.front * 0.8} taper={false} seed="s8/q2i" />
      <Ink d={SPANS.d} width={SI.far} taper={false} order="all" seed="s8/spans" />
    </>
  );
};

// ---------------------------------------------------------------- the protected district (inside the glass)

/** A1 fix round 1: re-spaced for the narrower dome (cx 310, rx 172), clear of the watchtower's legs (x 324-372). */
const TOWERS = [
  {x: 158, y: 1004, w: 32, h: 76},
  {x: 192, y: 958, w: 54, h: 122},
  {x: 250, y: 922, w: 58, h: 158},
  {x: 377, y: 972, w: 50, h: 108},
  {x: 432, y: 1000, w: 34, h: 80},
];

/** Five browser-chrome towers inside the (fix round 3b: broad shield) dome. Clip them to the dome interior in the
 *  scene. Fix round 3b: the tower bodies POP on the glass frame (`at`: 1.08x for 2 frames, no growing from zero: the
 *  glass never shows an empty bowl), their browser windows pop at `chromeAt` (a later onset); teal / sage (no glass
 *  step): the protected district reads as one distinct block inside, the crowd as another outside. */
export const DistrictTowers: React.FC<{at: number; chromeAt?: number}> = ({at, chromeAt = at}) => {
  const t = useTime();
  if (t < at) return null;
  const k = t < at + 0.067 ? 1.08 : 1;
  return (
    <>
      {TOWERS.map((q, i) => {
        const body = rectPath(q.x, q.y + 4, q.w, q.h);
        return (
          <g key={i} transform={k !== 1 ? `translate(${q.x + q.w / 2} ${q.y + q.h}) scale(1 ${k}) translate(${-(q.x + q.w / 2)} ${-(q.y + q.h)})` : undefined}>
            <Fill d={body} color={i % 2 ? palette.sage : palette.teal} offset={false} mode="snap" seed={`s8/dt${i}`} />
            {q.w >= 50 && t >= chromeAt ? <BrowserChrome x={q.x + 4} y={q.y + 10} w={q.w - 8} h={Math.min(46, q.h * 0.36)} depth="hair" seed={`s8/dtc${i}`} /> : null}
            <Ink d={rect(q.x, q.y + 4, q.w, q.h, {seed: `s8/dti${i}`, edges: 'tlr', over: 'small'})} width={SI.hair} taper={false} seed={`s8/dti${i}`} />
          </g>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- the dome's foot (plinth)

const PLINTH = (() => {
  const x0 = DOME8.cx - DOME8.rx - 8;
  const x1 = DOME8.cx + DOME8.rx + 8;
  const y0 = DOME8.by - 5;
  const y1 = DOME8.by + 7;
  return {fill: rectPath(x0, y0, x1 - x0, y1 - y0), ink: line(x0, y0, x1, y0, {seed: 's8/pl0', over: [4, 4]}) + line(x0 + 2, y1, x1 - 2, y1, {seed: 's8/pl1', over: [2, 2]})};
})();

/** Fix round 3: a cream plinth along the dome's foot (y by-5 .. by+7) between the glass and the crowd pressed against it:
 *  the district is an island on its base, the crowd stands in front of it. Pops with the glass (`at`). */
export const DomePlinth: React.FC<{at: number}> = ({at}) => {
  const t = useTime();
  if (t < at) return null;
  return (
    <>
      <Fill d={PLINTH.fill} color={palette.cream} offset={false} mode="snap" seed="s8/plf" />
      <Ink d={PLINTH.ink} width={SI.far} taper={false} seed="s8/pli" />
    </>
  );
};

// ---------------------------------------------------------------- our roof deck

const DECK = (() => {
  const hatch = rectPath(366, 1700, 136, 46);
  const hatchLid = rectPath(360, 1688, 148, 14);
  const pipes = rectPath(530, 1650, 18, 64);
  const pipeCaps = ellipse(539, 1650, 13, 5, {seed: 's8/pc1'});
  const drain = ellipse(452, 1850, 34, 10, {seed: 's8/drain'});
  const ink =
    rect(366, 1700, 136, 46, {seed: 's8/hatch', over: 'small'}) +
    rect(360, 1688, 148, 14, {seed: 's8/lid', over: 'small'}) +
    rect(530, 1650, 18, 64, {seed: 's8/p1', edges: 'lr', over: 0}) +
    pipeCaps +
    drain +
    line(426, 1850, 478, 1850, {seed: 's8/dr1', over: 0}) +
    line(436, 1844, 468, 1844, {seed: 's8/dr2', over: 0});
  const tar = line(300, 1790, 640, 1782, {seed: 's8/tar1', over: 0}) + line(340, 1890, 620, 1896, {seed: 's8/tar2', over: 0}) + line(420, 1630, 560, 1632, {seed: 's8/tar3', over: 0});
  return {hatch, hatchLid, pipes, drain, ink, tar};
})();

/** Our roof deck between the neighbours (depth 0). */
export const DeckClutter: React.FC = () => (
  <>
    <Ink d={DECK.tar} width={SI.far} taper={false} seed="s8/tar" />
    <Fill d={DECK.drain} color={palette.tan} offset={false} seed="s8/drainf" />
    <Fill d={DECK.hatch} color={palette.tan} seed="s8/hatchf" />
    <Fill d={DECK.hatchLid} color={palette.teal} seed="s8/lidf" />
    <Fill d={DECK.pipes} color={palette.cream} seed="s8/pipef" />
    <Ink d={DECK.ink} width={SI.mid} taper={false} seed="s8/deck" />
  </>
);

// ---------------------------------------------------------------- the rooftop neighbours (near layer)

/** Parallax factor of the neighbours' layer (depth 1 - f): nearer than our parapet. */
export const NEIGHBOUR_F = 1.2;

/** Head centres / diameters (world, the neighbours' own layer). */
export const NB = {L: {x: 250, y: 1684, head: 164}, R: {x: 950, y: 1690, head: 170}};

/** A crescent rim on one side of a head (centre c, radius r): outer arc from angle a0 to a1 (deg, 0 = right, 90 =
 *  down), back along an inner arc w px in. */
function crescent(cx: number, cy: number, r: number, a0: number, a1: number, w: number): string {
  const pt = (a: number, rr: number) => `${(cx + Math.cos((a * Math.PI) / 180) * rr).toFixed(1)} ${(cy + Math.sin((a * Math.PI) / 180) * rr).toFixed(1)}`;
  const big = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sw = a1 > a0 ? 1 : 0;
  return `M${pt(a0, r)}A${r} ${r} 0 ${big} ${sw} ${pt(a1, r)}L${pt(a1, r - w * 0.3)}A${r - w} ${r - w} 0 ${big} ${1 - sw} ${pt(a0, r - w * 0.3)}Z`;
}

/** The detail the kit leaves out at this size (fix round 3; ref2 f_33's near heads): sand ear fills (behind the head). */
const HeadBack: React.FC<{c: {x: number; y: number; head: number}}> = ({c}) => {
  const r = c.head / 2;
  const ears = blob(c.x - 0.99 * r, c.y + 0.1 * r, 0.15 * r, 0.26 * r, {seed: 's8/earL'}) + blob(c.x + 0.99 * r, c.y + 0.1 * r, 0.15 * r, 0.26 * r, {seed: 's8/earR'});
  return <Fill d={ears} color={palette.sand} offset={false} mode="none" seed="s8/ears" />;
};

/** One-sided cream rims on the sun side of each head (fix round 3). */
const RIM_L = (() => {
  const {x, y, head} = NB.L;
  const r = head / 2;
  return crescent(x, y, r * 1.0, -70, 62, Math.max(5, r * 0.08));
})();
const RIM_R = (() => {
  const {x, y, head} = NB.R;
  const r = head / 2;
  return crescent(x, y, r * 1.02, 190, 318, Math.max(5, r * 0.08));
})();
/** The beanie's ribbed fold: three short tealDark ticks along its turned-up band. */
const BEANIE_RIB = (() => {
  const {x, y, head} = NB.R;
  const r = head / 2;
  let d = '';
  for (const u of [-0.5, -0.17, 0.17, 0.5]) d += `M${(x + u * r).toFixed(1)} ${(y + 0.06 * r).toFixed(1)}l${(0.02 * r).toFixed(1)} ${(0.2 * r).toFixed(1)}`;
  return d;
})();

/** Fix round 3: the right neighbour's reaction on 'millions' (replaces the raised white phone: it sat in the right
 *  rail and was the brightest thing in the frame): BOTH hands to the head (the arms swing up from below the frame,
 *  0.25 s outBack, elbows out); jointed sleeves (FigureArm) in the coat colour, sand hands on the beanie's sides. */
const HandsToHead: React.FC<{at: number; coat: string}> = ({at, coat}) => {
  const t = useTime();
  if (t < at) return null;
  const {x, y, head} = NB.R;
  const r = head / 2;
  const q = E.outBack(1.4)(prog(t, at, 0.25));
  const arm = (sd: -1 | 1) => {
    const sh: [number, number] = [x + sd * 1.32 * r, 1955];
    const down: [number, number] = [sh[0] + sd * 10, 2160];
    const up: [number, number] = [x + sd * 0.98 * r, y + 0.02 * r];
    const hand: [number, number] = [lerp(down[0], up[0], q), lerp(down[1], up[1], q)];
    return <FigureArm key={sd} sh={sh} hand={hand} w={0.5 * r} coat={coat} W={DEPTH_INK.front} side={sd} bend={70} seed={`s8/nbRarm${sd}`} />;
  };
  return (
    <>
      {arm(-1)}
      {arm(1)}
    </>
  );
};

/** The near pair's look. Fix round 3b: clearly DIFFERENT people from S07's side readers (the bun / tan-hair reader and
 *  the teal-cap reader at ~75 px heads: the same identity at 2.3x across the match cut read as a pop on the people), so
 *  the cut reads as a new place: dark curly hair over a sage coat (left), an ochre-banded beanie over an OCHRE coat (right;
 *  A1 fix round 1: one value darker than the tan deck, it was the deck's own tan and separated only by its outline). */
const NB_LOOK = {L: {hair: 'curly' as const, hairColor: palette.ink, body: palette.sage}, R: {hair: 'beanie' as const, hairColor: palette.brown, body: palette.brown}};

/** Two back-view neighbours watching the city from our deck, cropped by the bottom edge (EdgeOnlooker: the coat always
 *  runs off the frame). Front ink (4.8, the heaviest in the frame), ear fills, a cream rim on the sun side; the left one
 *  flinches on 'millions', the right one puts both hands on its head. Each bobs on its own (1.2 px). */
export const Neighbours: React.FC<{reactAt: number; flinchAt: number}> = ({reactAt, flinchAt}) => {
  const t = useTime();
  const bobL = osc(t, 0.5, 0.7) * 1.2;
  const bobR = osc(t, 0.45, 2.3) * 1.2;
  // a sharp flinch: down 14 px in 0.08 s, back over 0.22 s
  const fl = t >= flinchAt && t < flinchAt + 0.3 ? (t - flinchAt < 0.08 ? E.outCubic((t - flinchAt) / 0.08) : 1 - E.inOutSine((t - flinchAt - 0.08) / 0.22)) * 14 : 0;
  const jolt = t >= reactAt && t < reactAt + 0.2 ? -Math.sin(((t - reactAt) / 0.2) * Math.PI) * 6 : 0;
  return (
    <>
      <XG m={mat.translate(0, bobL + fl)}>
        <HeadBack c={NB.L} />
        <EdgeOnlooker x={NB.L.x} y={NB.L.y} head={NB.L.head} hair={NB_LOOK.L.hair} hairColor={NB_LOOK.L.hairColor} body={NB_LOOK.L.body} acc={['collar']} rim="right" arms="near" depth="front" bob={0} seed="s8/nbL" />
        <Fill d={RIM_L} color={palette.cream} offset={false} mode="none" seed="s8/nbLrim" />
      </XG>
      <XG m={mat.translate(0, bobR + jolt)}>
        <EdgeOnlooker x={NB.R.x} y={NB.R.y} head={NB.R.head} hair={NB_LOOK.R.hair} hairColor={NB_LOOK.R.hairColor} body={NB_LOOK.R.body} rim="left" arms={t >= reactAt ? false : 'near'} depth="front" bob={0} seed="s8/nbR" />
        <Fill d={RIM_R} color={palette.cream} offset={false} mode="none" seed="s8/nbRrim" />
        <Ink d={BEANIE_RIB} width={2.4} color={palette.ink} order="all" taper={false} seed="s8/nbRrib" />
        <HandsToHead at={reactAt} coat={NB_LOOK.R.body} />
      </XG>
    </>
  );
};
