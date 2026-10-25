// S08 additions to the shared DomeCity v3 (fix round 2):
//   - LightDoors: the rattler doors drawn LIGHT (cream / peach, ink sides + top, a dark handle) on rows 2-3, so every
//     ink-dark rattler sits on a light door (the set's teal doors are off: `doors={false}`); row 3 has three big near
//     doors for the 86-92 px rattlers.
//   - WireSpans: the three wires continue PAST the rooftop pole along S07's own curves (mapped through the cut) to a
//     second pole just right of the board (A1 fix round 1: no wires through the city right of the board or the dome
//     once the board is up); the first pole is a junction (the board covers the middle).
//   - District (A1 fix round 2): a dense far district at row-0/1 scale inside the glass (2 tiers of 15-35 px blocks,
//     window dots, one browser-chrome landmark); the blocks pop on the glass frame, the dots + landmark window later.
//   - DeckClutter: our roof deck between the two neighbours (hatch, vent pipes, drain, tar seams).
//   - Neighbours: two back-view rooftop neighbours cropped by the bottom edge (EdgeOnlooker, 300-420 px), in their own
//     NEAR layer (parallax factor 1.2: they drop away faster than the parapet during the crane); fix round 3b: clearly
//     different people from S07's readers (curly hair / sage coat, ochre beanie / tan coat); on 'millions' the left one
//     flinches, the right one puts both hands on its head.
import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, osc, prog, useTime} from '../../lib/time';
import {mat, XG} from '../../lib/xf';
import {rng} from '../../lib/rng';
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

/** A1 fix round 2 (the reviewers: five 60-90 px browser towers inside the glass were row-2 scale while the city outside
 *  is 20-40 px blocks, so inside and outside contradicted each other and the dome read as a greenhouse on nearby roofs):
 *  a DENSE FAR DISTRICT at row-0/1 scale: two tiers of 15-35 px blocks (a back tier on row 0's street, a front tier on
 *  row 1's, both footed behind row 2), a downtown profile that rises toward the dome's centre-left, fill-only glass-step
 *  fills (back tier lighter: the haze ladder under the glass) with 3 px window dots, and ONE browser-chrome landmark
 *  (42 px wide) left of the lookout. Deterministic (seeded). The old plinth is gone: the foot is behind row 2. */
type Block = {x: number; w: number; top: number; base: number; fill: string; dot: string; tier: 0 | 1};
const LANDMARK = {x: DOME8.cx - 92, w: 42, top: 958, base: 1124};
const DISTRICT: Block[] = (() => {
  const out: Block[] = [];
  const x0 = DOME8.cx - DOME8.rx + 18;
  const x1 = DOME8.cx + DOME8.rx - 14;
  // the district's skyline: highest a little left of the centre (the lookout stands right of it)
  const prof = (x: number) => Math.exp(-(((x - (DOME8.cx - 40)) / (DOME8.rx * 0.55)) ** 2));
  const BACK = ['#88B3A0', '#7CA995', '#94BDAA'];
  const FRONT = [palette.sage, '#5F8C80', palette.teal];
  for (const tier of [0, 1] as const) {
    const r = rng(`s8/district${tier}`);
    let x = x0 - r.range(0, 10);
    let i = 0;
    while (x < x1) {
      const w = r.range(15, tier ? 35 : 27);
      const cx = x + w / 2;
      const base = tier ? 1124 : 1062;
      const hMin = tier ? 34 : 30;
      const hMax = tier ? 118 : 150;
      const top = base - (hMin + (hMax - hMin) * prof(cx) * r.range(0.55, 1));
      const skipLm = tier === 1 && x + w > LANDMARK.x - 2 && x < LANDMARK.x + LANDMARK.w + 2;
      if (!skipLm) {
        const pal = tier ? FRONT : BACK;
        const k = (i + r.int(0, 1)) % pal.length;
        out.push({x, w, top, base, fill: pal[k], dot: tier ? (k === 2 ? palette.sage : '#ACD1BF') : '#ACD1BF', tier});
      }
      x += w + r.range(-3, 2);
      i++;
    }
  }
  return out;
})();
const DISTRICT_GEO = (() => {
  const fills = new Map<string, string>();
  const dots = new Map<string, string>();
  const r = rng('s8/districtDots');
  for (const b of DISTRICT) {
    fills.set(b.fill, (fills.get(b.fill) ?? '') + rectPath(b.x, b.top, b.w, b.base - b.top + 2));
    // 3 px window dots on a jittered grid (fewer on the back tier)
    let d = '';
    for (let yy = b.top + 5; yy < b.base - 8; yy += 7) {
      for (let xx = b.x + 3.5; xx < b.x + b.w - 5; xx += 6.5) {
        if (!r.chance(b.tier ? 0.55 : 0.4)) continue;
        d += `M${xx.toFixed(1)} ${yy.toFixed(1)}h3v3h-3Z`;
      }
    }
    dots.set(b.dot, (dots.get(b.dot) ?? '') + d);
  }
  const L = LANDMARK;
  return {fills: [...fills], dots: [...dots], lm: rectPath(L.x, L.top, L.w, L.base - L.top), lmInk: rect(L.x, L.top, L.w, L.base - L.top, {seed: 's8/lmi', edges: 'tlr', over: 'small'})};
})();
export const DISTRICT_N = DISTRICT.length + 1;

/** The far district inside the dome (clip it to the dome interior in the scene). The blocks POP on the glass frame
 *  (`at`: 1.08x for 2 frames about the foot line, no growing from zero), their window dots at `chromeAt` (a later onset)
 *  with the landmark's browser window. */
export const District: React.FC<{at: number; chromeAt?: number}> = ({at, chromeAt = at}) => {
  const t = useTime();
  if (t < at) return null;
  const k = t < at + 0.067 ? 1.08 : 1;
  const L = LANDMARK;
  return (
    <g transform={k !== 1 ? `translate(0 ${L.base}) scale(1 ${k}) translate(0 ${-L.base})` : undefined}>
      {DISTRICT_GEO.fills.map(([c, d]) => (
        <path key={c} d={d} fill={c} />
      ))}
      {t >= chromeAt
        ? DISTRICT_GEO.dots.map(([c, d]) => (
            <path key={c} d={d} fill={c} />
          ))
        : null}
      <Fill d={DISTRICT_GEO.lm} color={palette.teal} offset={false} mode="snap" seed="s8/lm" />
      {t >= chromeAt ? <BrowserChrome x={L.x + 3} y={L.top + 6} w={L.w - 6} h={26} depth="hair" seed="s8/lmc" /> : null}
      <Ink d={DISTRICT_GEO.lmInk} width={1.4} taper={false} seed="s8/lmi" />
    </g>
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
const NB_LOOK = {L: {hair: 'curly' as const, hairColor: palette.brown, body: palette.sage}, R: {hair: 'beanie' as const, hairColor: palette.brown, body: palette.brown}};

/** A1 fix round 2 (the reviewers: the left neighbour's near-ink hair was the biggest dark mass on the cut frame): ochre
 *  hair (the kit's dark-brown hair token) with three interior ink strands (ref2's foreground heads), over the cream rim. */
const HAIR_STRANDS_L = (() => {
  const {x, y, head} = NB.L;
  const r = head / 2;
  const P = (u: number, v: number) => `${(x + u * r).toFixed(1)} ${(y + v * r).toFixed(1)}`;
  return `M${P(-0.62, -0.38)}Q${P(-0.42, -0.02)} ${P(-0.5, 0.36)}` + `M${P(-0.08, -0.78)}Q${P(0.06, -0.38)} ${P(-0.04, 0.02)}` + `M${P(0.42, -0.56)}Q${P(0.5, -0.24)} ${P(0.38, 0.12)}`;
})();

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
        <Ink d={HAIR_STRANDS_L} width={2.6} color={palette.ink} order="all" seed="s8/nbLstr" />
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
