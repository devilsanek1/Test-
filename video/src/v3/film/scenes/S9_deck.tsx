// S9_deck (S9 lane, G5b): OUR roof at the end of the pull-back: the near anchor, warm and dark, lived in
// (docs/v3/s9_scale_plan.md section 1 "our roof"; density_plan_g5b S9 "Our deck"). The deck in shade with snow drifts
// and a trail of footprints to you; the parapet (shade-snow lip, a run of fairy lights that keeps clear of you); the stair
// hut on the right (cut by the right and bottom edges: snow roof, a lit window, the door ajar spilling a two-step light
// pool, an antenna with a pennant, bulbs along its eave); a folding chair and a small table with a steaming mug; tiny
// you at the rail and PipTiny beside you. Deck plane (k 5, pinned on you): authored in END coords. At p 0 the deck
// plane shows only x 384-600 (screen 0-1080), so everything outside it slides in late (the hut after p ~0.8).
import React from 'react';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {blob, hline, line, smooth} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {EMBER, YouTiny, PipTiny, FoldingChair, SideTable, Pennant, StringLights3, Footprints, Shovel, Plant, LaundryLine, W} from '../kit';
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
    // snow caught in some seams (thin light lines: cheap fullness on the dark deck)
    if (sr.chance(0.45)) {
      const a = sr.range(0, 0.6);
      const bb = Math.min(1, a + sr.range(0.15, 0.4));
      seams += `M${(xb + (xe - xb) * a).toFixed(1)} ${(yb + (ye - yb) * a).toFixed(1)}L${(xb + (xe - xb) * bb).toFixed(1)} ${(yb + (ye - yb) * bb).toFixed(1)}`;
    }
  }
  // drifts: along the parapet's foot, banked into the left corner (stack, vent) and against the hut
  const footDrift = smooth([[x0, y - 2], [x1, y - 2], [x1, y + 12], [760, y + 20], [600, y + 12], [420, y + 22], [200, y + 14], [x0, y + 18]], {closed: true});
  const leftDrift = smooth([[-120, 1446], [262, 1452], [286, 1490], [236, 1536], [150, 1560], [196, 1640], [120, 1760], [168, 1880], [90, 1980], [-120, 1980]], {closed: true});
  const hutDrift = smooth([[770, 1450], [820, 1460], [840, 1560], [800, 1640], [760, 1600], [740, 1520]], {closed: true});
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
      <Ink d={planks} width={1.6} color={T9.deckDeep} />
      <Ink d={seams} width={2.4} color={T9.deckSnow} />
      <path d={leftDrift} fill={T9.deckSnow} />
      <path d={hutDrift} fill={T9.deckSnow} />
      <path d={poolOut} fill={EMBER.desk} />
      <path d={poolIn} fill={EMBER.ring} />
      <path d={footDrift} fill={T9.deckSnow} />
      <Ink d={hline(x0, x1, y + 13, {over: [0, 0], seed: 's9/fdI'})} width={1.4} color={EMBER.dc} />
      <path d={trail} fill={T9.deckSnow} />
      <Footprints points={steps} size={15} shrink={0.55} color={T9.footprint} seed="s9/fp" />
    </>
  );
};

/** Our parapet seen from behind: a shade-snow lip over the brick face (geometry as G5; the lip one step darker). */
const Parapet: React.FC = () => {
  const {y, lipH, h} = PARAPET;
  const x0 = -500;
  const x1 = 1580;
  const r = rng('s9/par');
  let bricks = '';
  for (let i = 0; i < 26; i++) {
    const bx = r.range(x0 + 60, x1 - 60);
    const by = y + lipH + r.range(8, h - 4);
    bricks += line(bx, by, bx + r.range(26, 44), by, {over: [0, 0], seed: `s9/bk${i}`});
  }
  let mortar = `M${x0} ${y + lipH + h * 0.5}H${x1}`;
  for (let x = x0 + 10, i = 0; x < x1; x += 44, i++) {
    const yy = i % 2 ? y + lipH + h * 0.5 : y + lipH + 6;
    mortar += `M${x + (i % 2 ? 22 : 0)} ${yy}v${h * 0.5 - 6}`;
  }
  return (
    <>
      <Fill rect={[x0, y + lipH, x1 - x0, h + 2]} color={T9.parapet} offset={false} seed="s9/pmass" />
      <Ink d={mortar} width={1.3} color={EMBER.brickShade} />
      <Fill rect={[x0, y + lipH, x1 - x0, 6]} color={EMBER.brickShade} offset={false} />
      <Fill rect={[x0, y, x1 - x0, lipH]} color={T9.deckSnow} offset={false} seed="s9/plip" />
      <Fill rect={[x0, y - 3, x1 - x0, 5]} color={T9.deckSnowLit} offset={false} />
      <Ink d={hline(x0, x1, y, {seed: 's9/pt', over: 'structural'}) + hline(x0, x1, y + lipH, {seed: 's9/pb', over: 'medium'})} width={3.4} />
      <Ink d={bricks} width={2} color={EMBER.brickShade} />
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
      <Fill rect={[x0 + 40, eave - 6, x1 - x0, 2000 - eave]} color={EMBER.brickShade} offset={false} seed="s9/hut" />
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
export const DeckPlane: React.FC<DeckPlaneProps> = ({tiny, thoom}) => (
  <>
    <Parapet />
    {/* fairy lights on the lip (20 bulbs), clear of you: x 0-380 and 600-790 (outside the start's view, x 384-600) */}
    <StringLights3 points={[[-30, 1402], [70, 1404], [170, 1403], [270, 1404], [372, 1402]]} sag={7} n={11} r={4.4} halo={false} sway={0.6} every={0.5} seed="s9/lip1" ink={1.5} />
    <StringLights3 points={[[606, 1402], [700, 1404], [796, 1402]]} sag={7} n={7} r={4.4} halo={false} sway={0.6} every={0.5} seed="s9/lip2" ink={1.5} />
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

/** A small snowman by the parapet (left of Pip, clear of you) and a snowy crate of firewood at the stack's foot. */
const DeckThings: React.FC = () => (
  <>
    {/* the crate */}
    <Fill rect={[150, 1488, 96, 62]} color={EMBER.beam} offset={false} seed="s9/crate" />
    <Ink d={`M150 1508h96M150 1528h96M150 1488h96v62h-96Z`} width={2.6} color={EMBER.anchor} />
    <path d={[0, 1, 2, 3, 4].map((i) => blob(164 + i * 17, 1484, 8, 6, {seed: `s9/log${i}`})).join('')} fill={EMBER.desk} />
    <path d={blob(198, 1478, 52, 7, {seed: 's9/crsn'})} fill={T9.deckSnowLit} />
    {/* a small snowman by the parapet (left of Pip, clear of you): a scarf, a stick arm, a coal smile */}
    <path d={blob(326, 1462, 30, 26, {seed: 's9/sm1'}) + blob(326, 1418, 21, 19, {seed: 's9/sm2'}) + blob(326, 1384, 14, 13, {seed: 's9/sm3'})} fill={T9.deckSnow} />
    <path d={blob(320, 1452, 20, 12, {seed: 's9/sm1l'}) + blob(321, 1412, 13, 9, {seed: 's9/sm2l'}) + blob(322, 1381, 8, 6, {seed: 's9/sm3l'})} fill={T9.deckSnowLit} />
    <Ink d={`${blob(326, 1462, 30, 26, {seed: 's9/sm1'})}${blob(326, 1418, 21, 19, {seed: 's9/sm2'})}${blob(326, 1384, 14, 13, {seed: 's9/sm3'})}`} width={2.4} />
    <Fill d={polyD([[307, 1398], [346, 1398], [348, 1406], [306, 1407]]) + polyD([[336, 1402], [345, 1404], [352, 1428], [342, 1430]])} color={EMBER.hl} offset={false} seed="s9/scarf" />
    <Ink d={`M305 1420L278 1398M286 1404l-6 -10M347 1418L372 1404`} width={2.6} color={EMBER.beam} />
    <path d={blob(306, 1356, 15, 4, {seed: 's9/hat0'})} fill={EMBER.anchor} />
    <path d={polyD([[313, 1357], [337, 1355], [336, 1338], [315, 1340]])} fill={EMBER.anchor} />
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
