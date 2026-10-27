// S9_deck (S9 lane, G5b): OUR roof at the end of the pull-back: the near anchor, warm and dark, lived in
// (docs/v3/s9_scale_plan.md section 1 "our roof"; density_plan_g5b S9 "Our deck"). The deck in shade with snow drifts
// and a trail of footprints to you; the parapet (shade-snow lip, a run of fairy lights that keeps clear of you); the stair
// hut on the right (cut by the right and bottom edges: snow roof, a lit window, the door ajar spilling a two-step light
// pool, an antenna with a pennant, bulbs along its eave); a folding chair and a small table with a steaming mug; tiny
// you at the rail and PipTiny beside you. Deck plane (k 5, pinned on you): authored in END coords. At p 0 the deck
// plane shows only x 384-600 (screen 0-1080), so everything outside it slides in late (the hut after p ~0.8).
// G5b review (2, 4, 5, 6): the parapet face in shade (L 24: your sweater and the jeans read on it) with brick courses,
// coping stones and snow lumps (5x at the start); the deck with snow in most seams, plank grain and knots, drifts over
// ~28 %; the deck's empty middle dressed (the snowman moved here with a dusk-blue scarf, a sledge on its side, a salt
// bucket, a bird feeder with sparrows); the hut front one step lighter than the deck with siding, a snowy downpipe,
// icicles, a wreath and its window's light on the wall; at the start, three big lip bulbs either side of you (swapped out
// behind the pot's wipe, so the end keeps 60 px clear round you).
import React from 'react';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {blob, hline, line, smooth} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {EMBER, YouTiny, PipTiny, FoldingChair, SideTable, Pennant, StringLights3, Footprints, Shovel, Plant, LaundryLine, Drainpipe, Icicles, W} from '../kit';
import {Bird} from '../../../lib/kit';
import {T9} from './S9_tones';

type Pt = [number, number];
const f1 = (v: number) => v.toFixed(1);
const rectD = (x: number, y: number, w: number, h: number) => `M${f1(x)} ${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}Z`;
const polyD = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join('') + 'Z';

export const PARAPET = {y: 1398, lipH: 16, h: 34};
export const YOU_FEET: Pt = [490, 1490];
export const PIP_AT: Pt = [424, 1398];
const DECK = {y: 1446, x0: -500, x1: 1580, h: 520, vp: [470, 1010] as Pt};
export const HUT = {x0: 800, x1: 1130, top: 1170, eave: 1188};
const DOOR = {x0: 836, x1: 924, top: 1580};
const WIN = {x: 902, y: 1292, w: 72, h: 92};

/** The deck floor in shade: planks converging on you, snow drifts (~30 %), a trail of footprints, the door's light pool. */
const DeckFloor: React.FC = () => {
  const {y, x0, x1, h, vp} = DECK;
  let planks = '';
  let seams = '';
  const n = 34;
  const sr = rng('s9/seams');
  for (let i = 0; i < n; i++) {
    const xb = x0 + ((i + 0.5) / n) * (x1 - x0);
    const yb = y + h;
    const u = (yb - y) / (yb - vp[1]);
    const xe = xb + (vp[0] - xb) * u;
    const ye = yb + (vp[1] - yb) * u;
    planks += line(xb, yb, xe, ye, {over: [0, 0], seed: `s9/pl${i}`});
    // snow caught in most seams (light lines, one or two runs each: cheap fullness on the dark deck)
    for (let k = 0; k < 2; k++) {
      if (!sr.chance(k ? 0.45 : 0.85)) continue;
      const a = sr.range(k ? 0.45 : 0, k ? 0.8 : 0.5);
      const bb = Math.min(1, a + sr.range(0.18, 0.45));
      seams += `M${(xb + (xe - xb) * a).toFixed(1)} ${(yb + (ye - yb) * a).toFixed(1)}L${(xb + (xe - xb) * bb).toFixed(1)} ${(yb + (ye - yb) * bb).toFixed(1)}`;
    }
  }
  // plank grain (short strokes along each plank) and knots, one step darker than the deck
  let grain = '';
  let knots = '';
  const gr = rng('s9/grain');
  for (let i = 0; i < n - 1; i++) {
    const xb0 = x0 + ((i + 0.5) / n) * (x1 - x0);
    const xb1 = x0 + ((i + 1.5) / n) * (x1 - x0);
    const yb = y + h;
    const at = (side: number, u: number): Pt => {
      const xb = xb0 + (xb1 - xb0) * side;
      const k = u * ((yb - y) / (yb - vp[1]));
      return [xb + (vp[0] - xb) * k, yb + (vp[1] - yb) * k];
    };
    for (let g = 0; g < 3; g++) {
      const side = gr.range(0.25, 0.75);
      const a = gr.range(0, 0.85);
      const p0 = at(side, a);
      const p1 = at(side + gr.jitter(0.04), Math.min(1, a + gr.range(0.06, 0.16)));
      grain += `M${f1(p0[0])} ${f1(p0[1])}L${f1(p1[0])} ${f1(p1[1])}`;
    }
    if (gr.chance(0.55)) {
      const [kx, ky] = at(gr.range(0.35, 0.65), gr.range(0.05, 0.9));
      const sc = (ky - vp[1]) / (yb - vp[1]);
      knots += blob(kx, ky, 4 + 5 * sc, 1.6 + 2.2 * sc, {seed: `s9/knot${i}`});
    }
  }
  // fine grain on the reach the start frame sees 5x (x ~380-610, y 1446-1530, the planks at your feet): 6 hairlines
  // per plank there, so the close deck reads as wood, never a flat rust field; at the end they melt into the plank tone
  let fine = '';
  const fr = rng('s9/fineGrain');
  for (let i = 0; i < n - 1; i++) {
    const xb0 = x0 + ((i + 0.5) / n) * (x1 - x0);
    const xb1 = x0 + ((i + 1.5) / n) * (x1 - x0);
    const yb = y + h;
    const at = (side: number, u: number): Pt => {
      const xb = xb0 + (xb1 - xb0) * side;
      const k = u * ((yb - y) / (yb - vp[1]));
      return [xb + (vp[0] - xb) * k, yb + (vp[1] - yb) * k];
    };
    const [mx] = at(0.5, 0.95);
    if (mx < 340 || mx > 640) continue;
    for (let g = 0; g < 6; g++) {
      const side = 0.12 + (g / 5) * 0.76 + fr.jitter(0.04);
      const a = fr.range(0.82, 0.96);
      const p0 = at(side, a);
      const p1 = at(side + fr.jitter(0.03), Math.min(1, a + fr.range(0.025, 0.06)));
      fine += `M${f1(p0[0])} ${f1(p0[1])}L${f1(p1[0])} ${f1(p1[1])}`;
    }
  }
  // drifts: along the parapet's foot, banked into the left corner (stack, vent) and against the hut
  const footDrift = smooth([[x0, y - 2], [x1, y - 2], [x1, y + 12], [760, y + 20], [600, y + 12], [420, y + 22], [200, y + 14], [x0, y + 18]], {closed: true});
  const leftDrift = smooth([[-120, 1446], [262, 1452], [286, 1490], [236, 1536], [150, 1560], [196, 1640], [120, 1760], [168, 1880], [90, 1980], [-120, 1980]], {closed: true});
  const hutDrift = smooth([[770, 1450], [820, 1460], [840, 1560], [800, 1640], [760, 1600], [740, 1520]], {closed: true});
  // windblown drifts over the open deck (with the corners and the trail: ~28 % of the deck in snow)
  const midDrift = smooth([[96, 1640], [210, 1612], [360, 1630], [430, 1668], [392, 1716], [250, 1730], [130, 1712], [80, 1680]], {closed: true});
  const lowDrift = smooth([[150, 1800], [300, 1784], [420, 1810], [440, 1880], [360, 1930], [200, 1920], [130, 1870]], {closed: true});
  const rightDrift = smooth([[560, 1500], [660, 1486], [740, 1500], [730, 1540], [640, 1556], [570, 1540]], {closed: true});
  const cr = rng('s9/clumps');
  let clumps = '';
  for (let i = 0; i < 26; i++) {
    const cy = cr.range(1470, 1900);
    const cx = cr.range(60, 780);
    if (cx > 470 && cx < 580) continue; // the trail
    const sc = (cy - vp[1]) / (y + h - vp[1]);
    clumps += blob(cx, cy, (6 + cr.range(4, 14)) * sc, (2 + cr.range(1, 4)) * sc, {seed: `s9/cl${i}`});
  }
  // the door's light: two flat steps spilling onto the deck toward the lower left
  const poolOut = polyD([[DOOR.x0 + 4, 1730], [DOOR.x1, 1760], [920, 1960], [540, 1960], [600, 1830]]);
  const poolIn = polyD([[DOOR.x0 + 10, 1780], [DOOR.x1 - 6, 1800], [900, 1960], [680, 1960], [720, 1870]]);
  // footprints from the bottom edge to you, on a trodden strip of snow (the eye's path up the deck)
  const steps: Pt[] = [];
  const pathX = (u: number) => 548 - 54 * u + Math.sin(u * 5) * 6;
  for (let i = 0; i < 18; i++) {
    const u = i / 17;
    steps.push([pathX(u), 1960 - 450 * u]);
  }
  const trailL: Pt[] = [];
  const trailR: Pt[] = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    const hw = 34 - 20 * u;
    trailL.push([pathX(u) - hw + Math.sin(u * 13) * 3, 1980 - 470 * u]);
    trailR.push([pathX(u) + hw + Math.sin(u * 11 + 1) * 3, 1980 - 470 * u]);
  }
  const trail = smooth([...trailL, ...trailR.reverse()], {closed: true});
  return (
    <>
      <Fill rect={[x0, y, x1 - x0, h]} color={T9.deck} offset={false} seed="s9/floor" />
      <path d={grain} fill="none" stroke={T9.deckGrain} strokeWidth={1.3} strokeLinecap="round" />
      <path d={fine} fill="none" stroke={T9.deckDeep} strokeWidth={0.7} strokeLinecap="round" />
      <path d={knots} fill={T9.deckGrain} />
      <Ink d={planks} width={1.6} color={T9.deckDeep} />
      <Ink d={seams} width={2.6} color={T9.deckSnow} />
      <path d={clumps} fill={T9.deckSnow} />
      <path d={leftDrift} fill={T9.deckSnow} />
      <path d={hutDrift} fill={T9.deckSnow} />
      <path d={midDrift} fill={T9.deckSnow} />
      <path d={lowDrift} fill={T9.deckSnow} />
      <path d={rightDrift} fill={T9.deckSnow} />
      <path d={poolOut} fill={EMBER.desk} />
      <path d={poolIn} fill={EMBER.ring} />
      <path d={footDrift} fill={T9.deckSnow} />
      <Ink d={hline(x0, x1, y + 13, {over: [0, 0], seed: 's9/fdI'})} width={1.4} color={EMBER.dc} />
      <path d={trail} fill={T9.deckSnow} />
      <Footprints points={steps} size={15} shrink={0.55} color={T9.footprint} seed="s9/fp" />
    </>
  );
};

/** Our parapet seen from behind: a shade-snow lip with snow lumps over a coping course and a brick face IN SHADE (L 24,
 *  so your sweater and jeans read on it; 5x at the start: coping joints, staggered brick courses, a few odd bricks). */
const PARAPET_D = (() => {
  const {y, lipH, h} = PARAPET;
  const x0 = -500;
  const x1 = 1580;
  const top = y + lipH;
  const cop = 7; // the coping course under the snow
  const r = rng('s9/par');
  let courses = '';
  let odd = '';
  const rows = 3;
  const rh = (h - cop) / rows;
  for (let k = 0; k < rows; k++) {
    const yy = top + cop + k * rh;
    if (k) courses += `M${x0} ${f1(yy)}H${x1}`;
    for (let x = x0 + (k % 2 ? 11 : 0); x < x1; x += 22) {
      courses += `M${f1(x)} ${f1(yy + 1)}v${f1(rh - 2)}`;
      if (r.chance(0.12)) odd += rectD(x + 1.5, yy + 1.5, 19, rh - 3);
    }
  }
  let joints = '';
  for (let x = x0 + 16; x < x1; x += 46) joints += `M${x} ${top}v${cop}`;
  // snow lumps along the lip (none on the reach of the end frame's figures: Pip x 400-450, you x 455-525)
  let lumps = '';
  for (let x = x0 + 30; x < x1; x += r.range(24, 52)) {
    if (x > 392 && x < 532) continue;
    const w = r.range(8, 20);
    lumps += blob(x, y - 1, w, r.range(3, 6.5), {seed: `s9/lump${Math.round(x)}`});
  }
  return {top, cop, courses, odd, joints, lumps, x0, x1};
})();
const Parapet: React.FC = () => {
  const {y, lipH, h} = PARAPET;
  const {top, cop, courses, odd, joints, lumps, x0, x1} = PARAPET_D;
  return (
    <>
      <Fill rect={[x0, top, x1 - x0, h + 2]} color={T9.parapetShade} offset={false} seed="s9/pmass" />
      <path d={odd} fill={T9.deckDeep} />
      <path d={courses} fill="none" stroke={EMBER.brickShade} strokeWidth={1.3} />
      <Fill rect={[x0, top, x1 - x0, cop]} color={T9.coping} offset={false} />
      <path d={joints} fill="none" stroke={EMBER.anchor} strokeWidth={1.2} />
      <Fill rect={[x0, top + cop, x1 - x0, 2]} color={EMBER.anchor} offset={false} />
      <Fill rect={[x0, y, x1 - x0, lipH]} color={T9.deckSnow} offset={false} seed="s9/plip" />
      <Fill rect={[x0, y - 3, x1 - x0, 5]} color={T9.deckSnowLit} offset={false} />
      <path d={lumps} fill={T9.deckSnowLit} />
      <Ink d={hline(x0, x1, y, {seed: 's9/pt', over: 'structural'}) + hline(x0, x1, y + lipH, {seed: 's9/pb', over: 'medium'})} width={3.4} />
    </>
  );
};

/** The hut front's siding: boards every 15 px, cut round the window and the door. */
const HUT_SIDING = (() => {
  let d = '';
  for (let y = HUT.eave + 10; y < 1990; y += 15) {
    const segs: [number, number][] = [[HUT.x0 + 40, HUT.x1]];
    const cut = (a: number, b: number) => {
      const out: [number, number][] = [];
      for (const [s0, s1] of segs.splice(0)) {
        if (b <= s0 || a >= s1) out.push([s0, s1]);
        else {
          if (a > s0) out.push([s0, a]);
          if (b < s1) out.push([b, s1]);
        }
      }
      segs.push(...out);
    };
    if (y > WIN.y - 4 && y < WIN.y + WIN.h + 10) cut(WIN.x - 8, WIN.x + WIN.w + 8);
    if (y > DOOR.top - 12) cut(DOOR.x0 - 8, DOOR.x1 + 8);
    for (const [a, b] of segs) d += `M${a} ${y}H${b}`;
  }
  return d;
})();

/** A wreath: a ring of dark leaves with berries and a warm bow (hung on the hut). */
const Wreath: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => {
  const leaves = Array.from({length: 14}, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return blob(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.34, r * 0.26, {seed: `s9/wr${i}`});
  }).join('');
  const berries = [0.4, 1.5, 2.6, 3.7, 4.9].map((a) => blob(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9, 3.2, 3.2, {seed: `s9/wb${a}`})).join('');
  return (
    <>
      <path d={leaves} fill={EMBER.leaf} />
      <path d={berries} fill={EMBER.mugBand} />
      <path d={blob(x - r * 0.3, y - r * 0.95, r * 0.5, r * 0.18, {seed: 's9/wsn'})} fill={T9.deckSnowLit} />
      <path d={polyD([[x, y + r * 0.9], [x - 12, y + r * 0.9 - 8], [x - 12, y + r * 0.9 + 8]]) + polyD([[x, y + r * 0.9], [x + 12, y + r * 0.9 - 8], [x + 12, y + r * 0.9 + 8]])} fill={EMBER.ring} />
      <Ink d={`M${x} ${y + r * 0.9}l-12 -8v16Z M${x} ${y + r * 0.9}l12 -8v16Z`} width={1.6} />
    </>
  );
};

/** The stair hut (right, cut by the right and bottom edges). */
const StairHut: React.FC = () => {
  const t = useTime();
  const {x0, x1, top, eave} = HUT;
  const flick = Math.sin(t * 1.3) > 0.97; // a person passing inside the lit window, now and then
  return (
    <>
      {/* side face toward the parapet (shade) and the front face */}
      <Fill d={polyD([[x0, eave], [x0 + 40, eave - 6], [x0 + 40, 1990], [x0, 1990]])} color={EMBER.anchor} offset={false} />
      <Fill rect={[x0 + 40, eave - 6, x1 - x0, 2000 - eave]} color={T9.hutFront} offset={false} seed="s9/hut" />
      {/* the window's warm light on the wall, then the siding (one step darker than the face) */}
      <path d={polyD([[WIN.x - 26, WIN.y - 14], [WIN.x + WIN.w + 26, WIN.y - 14], [WIN.x + WIN.w + 44, WIN.y + WIN.h + 60], [WIN.x - 40, WIN.y + WIN.h + 60]])} fill={T9.hutSpill} />
      <path d={HUT_SIDING} fill="none" stroke={EMBER.brickShade} strokeWidth={1.6} />
      {/* roof: a snow slab with an overhang */}
      <Fill d={polyD([[x0 - 14, eave + 2], [x0 + 20, top], [x1 + 20, top], [x1 + 20, eave + 2]])} color={T9.deckSnow} offset={false} />
      <Fill d={polyD([[x0 - 14, eave + 2], [x0 + 20, top - 8], [x0 + 60, top - 12], [x1 + 20, top - 12], [x1 + 20, top + 4], [x0 + 22, top + 4]])} color={EMBER.snow} offset={false} />
      <Fill rect={[x0 - 14, eave, x1 - x0 + 40, 8]} color={EMBER.anchor} offset={false} />
      {/* the lit window: warm, two panes, a sill with snow */}
      <Fill rect={[WIN.x, WIN.y, WIN.w, WIN.h]} color={EMBER.houseLit} offset={false} />
      <Fill rect={[WIN.x + 8, WIN.y + 8, WIN.w - 16, WIN.h * 0.5]} color={EMBER.core} offset={false} />
      {flick ? <path d={blob(WIN.x + 40, WIN.y + 50, 12, 28, {seed: 's9/hutp'})} fill={EMBER.beam} /> : null}
      <Ink d={`M${WIN.x + WIN.w / 2} ${WIN.y}V${WIN.y + WIN.h}M${WIN.x} ${WIN.y + WIN.h * 0.55}H${WIN.x + WIN.w}`} width={3} color={EMBER.anchor} />
      <Fill rect={[WIN.x - 8, WIN.y + WIN.h, WIN.w + 16, 9]} color={T9.deckSnowLit} offset={false} />
      <Ink d={`M${WIN.x} ${WIN.y}H${WIN.x + WIN.w}V${WIN.y + WIN.h}H${WIN.x}Z`} width={W.mid} />
      {/* the door ajar: a frame, the light inside, the leaf swung in */}
      <Fill rect={[DOOR.x0 - 8, DOOR.top - 10, DOOR.x1 - DOOR.x0 + 16, 420]} color={EMBER.anchor} offset={false} />
      <Fill rect={[DOOR.x0, DOOR.top, DOOR.x1 - DOOR.x0, 400]} color={EMBER.core} offset={false} />
      <Fill d={polyD([[DOOR.x0 + 34, DOOR.top + 4], [DOOR.x1, DOOR.top - 4], [DOOR.x1, 2000], [DOOR.x0 + 34, 2000]])} color={EMBER.beam} offset={false} />
      <Fill rect={[DOOR.x0 + 42, DOOR.top + 150, 6, 30]} color={EMBER.hl} offset={false} />
      <Ink d={`M${x0} ${eave}V1990M${x0 + 40} ${eave - 6}V1990M${DOOR.x0 - 8} 2000V${DOOR.top - 10}H${DOOR.x1 + 8}V2000`} width={W.mid} />
      <Ink d={`M${x0 - 14} ${eave + 2}L${x0 + 20} ${top}L${x1 + 30} ${top}`} width={W.mid} />
      {/* a snowy downpipe and icicles under the eave; a wreath beside the door */}
      <Drainpipe x={1058} y0={eave + 4} y1={1990} w={16} seed="s9/pipe" ink={2.2} />
      <path d={blob(1058, eave + 6, 13, 5, {seed: 's9/pipeSn'}) + blob(1058, 1640, 11, 4, {seed: 's9/pipeSn2'})} fill={T9.deckSnowLit} />
      <Icicles x0={846} x1={1040} y={eave + 2} n={8} len={[12, 34]} seed="s9/hutIce" ink={1.4} />
      <Wreath x={990} y={1520} r={26} />
      {/* the antenna mast and pennant (1.7 Hz) */}
      <Pennant x={1004} y={top - 6} h={112} w={44} seed="s9/pen" />
      <Ink d={`M992 ${top - 60}h24M995 ${top - 82}h18`} width={2.2} color={EMBER.anchor} />
      {/* bulbs along the eave */}
      <StringLights3 points={[[x0 - 10, eave + 10], [900, eave + 12], [1000, eave + 12], [1100, eave + 12]]} sag={12} n={7} r={5} halo={false} sway={1} every={0.5} seed="s9/hutBulbs" ink={1.6} />
    </>
  );
};

export type DeckPlaneProps = {tiny: boolean; thoom: number};
/** The deck plane, back to front. */
/** Spindrift: a gust lifts powder off the parapet's snow lip early in the move (0.80 s, right of your raised arm), a
 *  stream of puffs blown right and up that swell and thin out in 0.55 s. Near air in the move (4x -> 3x here), the
 *  wind the falling snow already shows; gone as the pot crosses. (Not on the left: the vent covers that lip, and
 *  further in it would land beside Pip.) End coords. */
const GUSTS = [{t0: 0.8, x0: 556, x1: 650}];
export const SpinDrift: React.FC = () => {
  const t = useTime();
  let d = '';
  let grains = '';
  GUSTS.forEach((g, gi) => {
    const r = rng(`s9/drift${gi}`);
    const n = 7;
    for (let i = 0; i < n; i++) {
      const born = g.t0 + i * 0.045 + r.range(0, 0.03);
      const kk = (t - born) / 0.55;
      const sz = r.range(3, 4.4);
      const x = g.x0 + ((g.x1 - g.x0) * i) / (n - 1) + r.jitter(4);
      const dx = r.range(20, 30);
      const dy = r.range(7, 12);
      if (kk <= 0 || kk >= 1) continue;
      const rad = sz * Math.sin(kk * Math.PI) * (1 - kk * 0.35);
      const px = x + dx * kk;
      const py = PARAPET.y - 2 - dy * (1 - (1 - kk) * (1 - kk));
      d += blob(px, py, rad * 1.6, rad, {seed: `s9/dr${gi}_${i}`});
      // a trail of loose grains behind each puff
      for (let j = 1; j <= 2; j++) {
        const q = Math.max(0, kk - j * 0.12);
        grains += `M${f1(x + dx * q - 0.5)} ${f1(PARAPET.y - 2 - dy * (1 - (1 - q) * (1 - q)))}h1v1h-1Z`;
      }
    }
  });
  return d ? (
    <>
      <path d={d} fill={T9.deckSnowLit} />
      <path d={grains} fill={T9.deckSnowLit} />
    </>
  ) : null;
};

export const DeckPlane: React.FC<DeckPlaneProps> = ({tiny, thoom}) => (
  <>
    <Parapet />
    {/* fairy lights on the lip (20 bulbs), clear of you: x 0-380 and 600-790 (outside the start's view, x 384-600) */}
    <StringLights3 points={[[-30, 1402], [70, 1404], [170, 1403], [270, 1404], [372, 1402]]} sag={7} n={11} r={4.4} halo={false} sway={0.6} every={0.5} seed="s9/lip1" ink={1.5} />
    <StringLights3 points={[[606, 1402], [700, 1404], [796, 1402]]} sag={7} n={7} r={4.4} halo={false} sway={0.6} every={0.5} seed="s9/lip2" ink={1.5} />
    {/* the start's lip bulbs either side of you (x 384-439 and 514-600 show at 5x): gone at the swap behind the pot */}
    {tiny ? null : (
      <>
        <StringLights3 points={[[372, 1402], [440, 1404]]} sag={5} n={2} r={4.4} halo={false} sway={0.6} every={0.5} seed="s9/lipS1" ink={1.5} />
        <StringLights3 points={[[512, 1404], [606, 1402]]} sag={6} n={3} r={4.4} halo={false} sway={0.6} every={0.5} seed="s9/lipS2" ink={1.5} />
      </>
    )}
    <DeckFloor />
    <VentClutter />
    <DeckThings />
    <StairHut />
    {/* a laundry line from a post on the deck to the hut's wall: three pieces swaying (colour without the hero) */}
    <Ink d={`M652 1716V1552M644 1554h16`} width={4} color={EMBER.anchor} />
    <path d={blob(652, 1550, 9, 3, {seed: 's9/postsn'})} fill={T9.deckSnowLit} />
    <LaundryLine a={[654, 1560]} b={[812, 1520]} sag={18} n={3} size={44} seed="s9/laundry" ink={2.6} />
    {/* the chair and the small table with the steaming mug, by the hut's door */}
    <FoldingChair x={640} y={1772} w={112} seed="s9/chair" ink={3} />
    <SideTable x={758} y={1758} w={92} mug seed="s9/table" ink={3} />
    {tiny ? (
      <>
        <PipTiny x={PIP_AT[0]} y={PIP_AT[1]} h={56} side="r" hopAt={thoom} seed={5} ink={2.2} />
        <YouTiny x={YOU_FEET[0]} y={YOU_FEET[1]} h={184} stickW={56} ink={2.6} seed="s9/youT" />
      </>
    ) : null}
  </>
);

/** The brick stack's dressing (in the stack's box, end coords: x -76..250, y 980..1460): mortar courses with staggered
 *  joints (the start frame sees x -76..58 of it at 3.2x: a wall MADE of bricks, never a flat slab), a string course with
 *  snow, an aerial's strapping with its cable, iron rungs. Raw strokes: they grow with the box (mortar up close). */
const STACK_D = (() => {
  const x0 = -72;
  const x1 = 248;
  const split = 26; // the lit strip | the shade side
  const top = 1004;
  const r = rng('s9/stackBricks');
  let lit = '';
  let shade = '';
  for (let y = top + 12, k = 0; y < 1460; y += 12, k++) {
    if (y > 1172 && y < 1196) continue; // the string course
    lit += `M${x0} ${y}H${split}`;
    shade += `M${split} ${y}H${x1}`;
    for (let x = x0 + (k % 2 ? 17 : 0); x < x1; x += 34) {
      if (r.chance(0.14)) continue;
      const d = `M${x.toFixed(1)} ${y - 12}v12`;
      if (x < split) lit += d;
      else shade += d;
    }
  }
  const rungs: string[] = [];
  for (let y = 1048; y < 1450; y += 42) rungs.push(`M36 ${y}h18v-3h-18Z`);
  return {lit, shade, rungs: rungs.join('')};
})();
export const StackDress: React.FC = () => (
  <>
    <path d={STACK_D.lit} fill="none" stroke={EMBER.brickShade} strokeWidth={1.1} />
    <path d={STACK_D.shade} fill="none" stroke={T9.deckDeep} strokeWidth={1.1} />
    {/* the string course: a corbelled band with snow on it */}
    <path d="M-80 1176h334v14h-334Z" fill={T9.stackShade} />
    <path d="M-80 1176h106v14h-106Z" fill={EMBER.brickShade} />
    <path d={blob(86, 1173, 168, 4.5, {seed: 's9/scSnow'})} fill={T9.deckSnow} />
    {/* an aerial's strapping round the stack and its cable running down */}
    <path d="M-76 1046h326v4h-326ZM-76 1112h326v4h-326Z" fill={EMBER.anchor} />
    <path d="M14 1040h12v80h-12Z" fill={EMBER.anchor} />
    <path d="M20 1120C22 1200 8 1260 14 1460" fill="none" stroke={EMBER.anchor} strokeWidth={2.2} />
    {/* iron rungs up the face */}
    <path d={STACK_D.rungs} fill={EMBER.anchor} />
  </>
);

/** The vent's louvres and seam (in the vent's box, end coords). */
export const VentDress: React.FC = () => (
  <>
    <path d={Array.from({length: 13}, (_, i) => `M32 ${1652 + i * 24}h86`).join('')} fill="none" stroke={EMBER.anchor} strokeWidth={1.4} />
    <path d="M75 1640V1964" fill="none" stroke={EMBER.anchor} strokeWidth={1} />
  </>
);

/** A snowman: base bottom (x, y), scale s (s 1 = 150 px tall), a dusk-blue scarf (never the caption-highlight colour). */
const Snowman: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => {
  const B = (dx: number, dy: number, rx: number, ry: number, seed: string) => blob(x + dx * s, y + dy * s, rx * s, ry * s, {seed});
  const body = B(0, -26, 30, 26, 's9/sm1') + B(0, -70, 21, 19, 's9/sm2') + B(0, -104, 14, 13, 's9/sm3');
  const P = (pts: Pt[]) => polyD(pts.map(([dx, dy]) => [x + dx * s, y + dy * s] as Pt));
  return (
    <>
      <path d={blob(x + 6 * s, y - 2 * s, 40 * s, 7 * s, {seed: 's9/smSh'})} fill={T9.footprint} />
      <path d={body} fill={T9.deckSnow} />
      <path d={B(-6, -36, 20, 12, 's9/sm1l') + B(-5, -76, 13, 9, 's9/sm2l') + B(-4, -107, 8, 6, 's9/sm3l')} fill={T9.deckSnowLit} />
      <Ink d={body} width={2.4} />
      <Fill d={P([[-19, -90], [20, -90], [22, -82], [-20, -81]]) + P([[10, -86], [19, -84], [26, -60], [16, -58]])} color={T9.scarf} offset={false} seed="s9/scarf" />
      <Ink d={`M${x - 21 * s} ${y - 68 * s}L${x - 48 * s} ${y - 90 * s}M${x - 40 * s} ${y - 84 * s}l${-6 * s} ${-10 * s}M${x + 21 * s} ${y - 70 * s}L${x + 46 * s} ${y - 84 * s}`} width={2.6} color={EMBER.beam} />
      <path d={blob(x - 20 * s, y - 132 * s, 15 * s, 4 * s, {seed: 's9/hat0'})} fill={EMBER.anchor} />
      <path d={P([[-13, -131], [11, -133], [10, -150], [-11, -148]])} fill={EMBER.anchor} />
      <path d={B(-2, -150, 10, 3, 's9/hatSn')} fill={T9.deckSnowLit} />
      <path d={[0, 1, 2].map((i) => B(0, -60 + i * 12, 2.4, 2.4, `s9/btn${i}`)).join('')} fill={EMBER.anchor} />
    </>
  );
};

/** A wooden sledge stood on its side (seat slats facing us, the runners' curled noses), snow on its top edge. */
const Sledge: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => {
  const h = w * 0.42;
  const slats = [0.12, 0.36, 0.6].map((u) => rectD(x + w * 0.08, y - h * 0.95 + u * h, w * 0.84, h * 0.18)).join('');
  const runner = `M${x} ${y}H${x + w * 0.86}C${x + w * 1.02} ${y} ${x + w * 1.04} ${y - h * 0.5} ${x + w * 0.9} ${y - h * 0.62}`;
  return (
    <>
      <path d={slats} fill={EMBER.desk} />
      <Ink d={slats} width={1.8} />
      <Ink d={`M${x + w * 0.2} ${y}V${y - h * 0.95}M${x + w * 0.7} ${y}V${y - h * 0.95}`} width={3} color={EMBER.anchor} />
      <Ink d={runner} width={3.4} color={EMBER.anchor} />
      <path d={blob(x + w * 0.5, y - h * 0.97, w * 0.44, 4, {seed: 's9/sledSn'})} fill={T9.deckSnowLit} />
    </>
  );
};

/** A salt bucket (galvanised, a scoop in it, salt spilled on the snow). */
const SaltBucket: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => {
  const h = w * 0.9;
  const body = polyD([[x - w / 2, y - h], [x + w / 2, y - h], [x + w * 0.4, y], [x - w * 0.4, y]]);
  return (
    <>
      <path d={blob(x + w * 0.2, y + 2, w * 0.8, w * 0.14, {seed: 's9/salt'})} fill={T9.deckSnowLit} />
      <path d={body} fill={EMBER.skyLow} />
      <path d={polyD([[x - w * 0.18, y - h], [x - w * 0.06, y - h], [x - w * 0.1, y], [x - w * 0.22, y]])} fill={EMBER.frost} />
      <path d={blob(x, y - h, w / 2, w * 0.12, {seed: 's9/saltTop'})} fill={EMBER.snow} />
      <Ink d={body + `M${x - w * 0.46} ${y - h * 0.62}H${x + w * 0.46}`} width={2} />
      <Ink d={`M${x - w / 2} ${y - h}C${x - w / 2} ${y - h * 1.7} ${x + w / 2} ${y - h * 1.7} ${x + w / 2} ${y - h}`} width={1.6} color={EMBER.dcSide} />
      <Ink d={`M${x + w * 0.1} ${y - h * 1.02}L${x + w * 0.42} ${y - h * 1.5}`} width={4} color={EMBER.beam} />
    </>
  );
};

/** A bird feeder on a pole, sparrows on its perch and one pecking on the snow below (their own hops and head turns). */
const BirdFeeder: React.FC<{x: number; y: number; h: number}> = ({x, y, h}) => {
  const top = y - h;
  return (
    <>
      <Ink d={`M${x} ${y}V${top}`} width={4} color={EMBER.anchor} />
      <path d={rectD(x - 26, top - 4, 52, 6)} fill={EMBER.beam} />
      <path d={polyD([[x - 20, top - 4], [x + 20, top - 4], [x + 16, top - 30], [x - 16, top - 30]])} fill={EMBER.core} />
      <path d={polyD([[x - 30, top - 28], [x, top - 50], [x + 30, top - 28]])} fill={EMBER.beam} />
      <path d={polyD([[x - 32, top - 28], [x - 2, top - 54], [x + 2, top - 54], [x + 32, top - 28], [x + 22, top - 32], [x, top - 46], [x - 22, top - 32]])} fill={T9.deckSnowLit} />
      <Ink d={`M${x - 26} ${top - 4}h52v6h-52Z M${x - 30} ${top - 28}L${x} ${top - 50}L${x + 30} ${top - 28} M${x - 20} ${top - 4}L${x - 16} ${top - 30}M${x + 20} ${top - 4}L${x + 16} ${top - 30}`} width={2} />
      <path d={blob(x, y + 2, 26, 5, {seed: 's9/feedSeed'})} fill={T9.footprint} />
      <Bird x={x - 14} y={top - 4} s={0.5} color={T9.sparrow} seed="s9/sp1" />
      <Bird x={x + 16} y={top - 4} s={0.46} color={T9.sparrow} seed="s9/sp2" flip />
      <Bird x={x + 34} y={y + 2} s={0.52} color={T9.sparrow} seed="s9/sp3" flip />
    </>
  );
};

/** The deck's things: the snowy firewood crate at the stack's foot, and in the deck's open middle (G5b review 4-5) the
 *  snowman (moved off the rail: the rail reads "Pip, you"), a sledge on its side, a salt bucket and a bird feeder. */
const DeckThings: React.FC = () => (
  <>
    {/* the crate */}
    <Fill rect={[150, 1488, 96, 62]} color={EMBER.beam} offset={false} seed="s9/crate" />
    <Ink d={`M150 1508h96M150 1528h96M150 1488h96v62h-96Z`} width={2.6} color={EMBER.anchor} />
    <path d={[0, 1, 2, 3, 4].map((i) => blob(164 + i * 17, 1484, 8, 6, {seed: `s9/log${i}`})).join('')} fill={EMBER.desk} />
    <path d={blob(198, 1478, 52, 7, {seed: 's9/crsn'})} fill={T9.deckSnowLit} />
    <SaltBucket x={300} y={1600} w={40} />
    <Sledge x={340} y={1690} w={104} />
    <Snowman x={226} y={1716} s={1.18} />
    <BirdFeeder x={418} y={1830} h={150} />
  </>
);

/** Near clutter by the vent, in the DECK plane (in the vent's box it would stand 3x tall beside you at p 0): the
 *  shovel leaning on it and two pots under snow; it meets the vent at the landing. */
export const VentClutter: React.FC = () => (
  <>
    <Shovel x={176} y={1918} h={176} lean={-13} seed="s9/shovel" ink={W.mid} />
    <Plant x={250} y={1930} kind="succulent" size={84} snow seed="s9/pot1" />
    <Plant x={330} y={1950} kind="snake" size={120} snow seed="s9/pot2" />
  </>
);
