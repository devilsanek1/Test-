// S9_near (S9 lane, G5b): the NEAR ROOFS (plane S9_NEAR: k 3, hidden behind the start parapet, rising as it drops;
// docs/v3/s9_scale_plan.md section 1): three calm masses just beyond our parapet. Left, a terrace roof under snow with
// a run of five lit dormers, two smoking stacks and a neighbour shovelling; the canyon slot between (its left wall in
// shade, its right wall lit behind your head, string lights across); right, a mansard (a row of dormer windows 10 x 14
// on 26) with a skylight ridge aimed at the campus; a flat roof behind the stair hut. End-frame coordinates.
// Start-frame guard: in x 187-347 (the start slot) nothing rises above y 1237 (it would peek over the start parapet);
// the stacks stand at x >= 360 (behind the brick stack at p 0).
import React from 'react';
import {Ink} from '../../../lib/Ink';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {EMBER, BrickStack, RoofNeighbour, Smoke, StringLights3, RoofAerials, W} from '../kit';
import {T9} from './S9_tones';
import {canyonAt} from './S9_town';

type Pt = [number, number];
const f1 = (v: number) => v.toFixed(1);
const rectD = (x: number, y: number, w: number, h: number) => `M${f1(x)} ${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}Z`;
const polyD = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join('') + 'Z';

// ---------------------------------------------------------------- geometry (end coords)
const TERRACE = {x0: -60, x1: 434, ridge: 1252, eave: 1318, base: 1520};
const MANSARD = {x0: 518, x1: 836, top: 1250, slope: 1262, cornice: 1320, base: 1520};
const FLAT = {x0: 830, x1: 1160, top: 1236};
export const NEAR_STACKS = [
  {x: 360, y: 1206, w: 18},
  {x: 400, y: 1196, w: 22},
];
const DORMERS = [262, 290, 318, 346, 374].map((x) => ({x, y: 1278, w: 17, h: 15}));
const MANSARD_WINS = Array.from({length: 11}, (_, i) => ({x: MANSARD.x0 + 14 + i * 26, y: 1274, w: 10, h: 14}));
/** The window that pops on in the hold (~2.9 s): the hold's one new light. */
const POP_WIN = 6;
const POP_AT = 2.9;

const SLOT = (() => {
  // the canyon between the masses: dark inside, its right wall lit (storeys of window ticks 9 x 12 -> 3 x 4)
  const yT = 1236;
  const yB = 1520;
  const [lT, rT] = canyonAt(yT);
  const slot: Pt[] = [[canyonAt(yB)[0] - 6, yB], [lT - 4, yT], [rT + 4, yT], [canyonAt(yB)[1] + 6, yB]];
  const wallX = (y: number) => {
    const [l, r] = canyonAt(y);
    return l + (r - l) * 0.46;
  };
  const wall: Pt[] = [[wallX(yB), yB], [wallX(yT), yT], [rT + 4, yT], [canyonAt(yB)[1] + 6, yB]];
  let ticks = '';
  let lit = '';
  const r = rng('s9/slotwin');
  for (let y = 1398; y > yT + 6; ) {
    const k = (y - yT) / (1398 - yT);
    const th = 4 + 8 * k;
    const tw = 3 + 6 * k;
    const x0 = wallX(y) + 3;
    const x1 = canyonAt(y)[1] + 2;
    for (let x = x0; x + tw < x1; x += tw * 1.9) {
      if (r.chance(0.3)) lit += rectD(x, y - th, tw, th);
      else ticks += rectD(x, y - th, tw, th);
    }
    y -= th * 2.1;
  }
  // the shade wall on the left: a few lit windows
  let leftLit = '';
  for (const [y, k] of [[1300, 0.4], [1356, 0.75]] as const) {
    const x = canyonAt(y)[0] + 2;
    leftLit += rectD(x, y - 10 * k - 4, 4 + 4 * k, 8 + 8 * k);
  }
  return {slot: polyD(slot), wall: polyD(wall), ticks, lit, leftLit};
})();

const TERRACE_D = (() => {
  const {x0, x1, ridge, eave, base} = TERRACE;
  // roof plane facing us under snow (a shade band at the eave), the facade below with windows
  const roof = polyD([[x0, eave + 4], [x0 + 6, ridge], [x1 - 6, ridge], [x1, eave + 4]]);
  const shade = polyD([[x0, eave + 4], [x0 + 2, eave - 10], [x1 - 2, eave - 10], [x1, eave + 4]]);
  const facade = rectD(x0, eave + 2, x1 - x0, base - eave);
  let wins = '';
  let winsLit = '';
  const r = rng('s9/terraceWin');
  for (let x = x0 + 30; x < x1 - 20; x += 34) {
    const lit = r.chance(0.55);
    const d = rectD(x, eave + 18, 14, 22);
    if (lit) winsLit += d;
    else wins += d;
  }
  const gutter = rectD(x0 - 2, eave + 1, x1 - x0 + 4, 5);
  return {roof, shade, facade, wins, winsLit, gutter};
})();

const MANSARD_D = (() => {
  const {x0, x1, top, slope, cornice, base} = MANSARD;
  const flat = polyD([[x0 + 10, slope + 2], [x0 + 18, top], [x1 - 18, top], [x1 - 10, slope + 2]]);
  const slopeD = polyD([[x0, cornice], [x0 + 10, slope], [x1 - 10, slope], [x1, cornice]]);
  const corniceD = rectD(x0 - 4, cornice - 2, x1 - x0 + 8, 6);
  const facade = rectD(x0, cornice + 3, x1 - x0, base - cornice);
  let caps = '';
  MANSARD_WINS.forEach((w) => {
    caps += polyD([[w.x - 3, w.y + 1], [w.x + w.w / 2, w.y - 6], [w.x + w.w + 3, w.y + 1]]);
  });
  let fwin = '';
  let fwinLit = '';
  const r = rng('s9/mansardWin');
  for (let x = x0 + 16; x < x1 - 20; x += 30) {
    const d = rectD(x, cornice + 16, 13, 20);
    if (r.chance(0.5)) fwinLit += d;
    else fwin += d;
  }
  // the skylight ridge (620, 1395) -> (720, 1250): a glazed strip aimed at the campus
  const a: Pt = [620, 1398];
  const bb: Pt = [722, 1250];
  const nx = 9;
  const strip = polyD([[a[0] - nx, a[1]], [bb[0] - 4, bb[1]], [bb[0] + 4, bb[1]], [a[0] + nx, a[1]]]);
  let panes = '';
  let panesLit = '';
  const N = 9;
  for (let i = 0; i < N; i++) {
    const u0 = (i + 0.12) / N;
    const u1 = (i + 0.88) / N;
    const P = (u: number, s: number): Pt => [a[0] + (bb[0] - a[0]) * u + s * (nx - (nx - 4) * u), a[1] + (bb[1] - a[1]) * u];
    const d = polyD([P(u0, -0.7), P(u1, -0.7), P(u1, 0.7), P(u0, 0.7)]);
    if (i % 3 === 1) panesLit += d;
    else panes += d;
  }
  const ridgeLine = `M${a[0]} ${a[1]}L${bb[0]} ${bb[1]}`;
  return {flat, slope: slopeD, cornice: corniceD, facade, caps, fwin, fwinLit, strip, panes, panesLit, ridgeLine};
})();

export const NearRoofs: React.FC = () => {
  const t = useTime();
  const pop = t >= POP_AT;
  return (
    <>
      {/* the base under the masses (the canyon's depth) */}
      <path d={rectD(-200, 1290, 1500, 300)} fill={EMBER.dcDark} />
      {/* ---- the flat roof behind the stair hut (aerials over the hut's roof) */}
      <path d={rectD(FLAT.x0, FLAT.top, FLAT.x1 - FLAT.x0, 300)} fill={EMBER.roofs} />
      <path d={rectD(FLAT.x0 - 3, FLAT.top - 6, FLAT.x1 - FLAT.x0 + 6, 10)} fill={EMBER.snow} />
      <RoofAerials x={968} y={FLAT.top - 2} s={1.15} />
      {/* ---- the mansard */}
      <path d={MANSARD_D.flat} fill={EMBER.snow} />
      <path d={MANSARD_D.slope} fill={EMBER.roofs} />
      {MANSARD_WINS.map((w, i) => (
        <path key={i} d={rectD(w.x, w.y, w.w, w.h)} fill={i === POP_WIN ? (pop ? EMBER.houseLit : EMBER.dcDark) : i % 3 === 0 ? EMBER.houseLit : i % 3 === 1 ? EMBER.dcDark : T9.nmWin} />
      ))}
      <path d={MANSARD_D.caps} fill={EMBER.snow} />
      <path d={MANSARD_D.facade} fill={EMBER.dcSide} />
      <path d={MANSARD_D.fwin} fill={EMBER.dcDark} />
      <path d={MANSARD_D.fwinLit} fill={EMBER.houseLit} />
      <path d={MANSARD_D.cornice} fill={EMBER.snow} />
      <path d={MANSARD_D.strip} fill={EMBER.frost} />
      <path d={MANSARD_D.panes} fill={EMBER.skyLow} />
      <path d={MANSARD_D.panesLit} fill={EMBER.houseLit} />
      <Ink d={MANSARD_D.ridgeLine} width={1.6} color={EMBER.dcDark} />
      <Ink d={`M${MANSARD.x0} ${MANSARD.cornice}L${MANSARD.x0 + 10} ${MANSARD.slope}L${MANSARD.x1 - 10} ${MANSARD.slope}L${MANSARD.x1} ${MANSARD.cornice}`} width={W.mid} />
      {/* ---- the canyon slot (the drop): dark, its right wall lit behind your head */}
      <path d={SLOT.slot} fill={EMBER.dcDark} />
      <path d={SLOT.wall} fill={T9.litWall} />
      <path d={SLOT.ticks} fill={EMBER.dc} />
      <path d={SLOT.lit} fill={EMBER.houseLit} />
      <path d={SLOT.leftLit} fill={EMBER.houseLit} />
      {/* ---- the terrace */}
      <path d={TERRACE_D.facade} fill={EMBER.roofs} />
      <path d={TERRACE_D.wins} fill={EMBER.dcDark} />
      <path d={TERRACE_D.winsLit} fill={EMBER.houseLit} />
      <path d={TERRACE_D.roof} fill={EMBER.snow} />
      <path d={TERRACE_D.shade} fill={EMBER.frost} />
      <path d={TERRACE_D.gutter} fill={EMBER.dcSide} />
      {DORMERS.map((d, i) => (
        <React.Fragment key={i}>
          <path d={rectD(d.x, d.y, d.w, d.h)} fill={EMBER.roofs} />
          <path d={rectD(d.x + 4, d.y + 4, d.w - 8, d.h - 5)} fill={i === 1 ? EMBER.dcDark : EMBER.houseLit} />
          <path d={polyD([[d.x - 3, d.y + 1], [d.x + d.w / 2, d.y - 8], [d.x + d.w + 3, d.y + 1]])} fill={EMBER.snow} />
        </React.Fragment>
      ))}
      <Ink d={`M${TERRACE.x0 + 6} ${TERRACE.ridge}L${TERRACE.x1 - 6} ${TERRACE.ridge}L${TERRACE.x1} ${TERRACE.eave + 4}`} width={W.mid} />
      {DORMERS.map((d, i) => (
        <Ink key={i} d={`M${d.x - 3} ${d.y + 1}L${d.x + d.w / 2} ${d.y - 8}L${d.x + d.w + 3} ${d.y + 1}M${d.x} ${d.y + 1}V${d.y + d.h}M${d.x + d.w} ${d.y + 1}V${d.y + d.h}`} width={W.hair} />
      ))}
      {NEAR_STACKS.map((s, i) => (
        <React.Fragment key={i}>
          <BrickStack x={s.x} y={s.y} w={s.w} h={TERRACE.ridge - s.y + 30} pots={[0.5]} potW={s.w * 0.5} color={EMBER.roofs} shade={EMBER.dcSide} bricks={0} exact seed={`s9/nst${i}`} ink={2.6} />
          <Smoke x={s.x + s.w / 2} y={s.y - s.w * 0.75} seed={`s9/nsm${i}`} rise={70} drift={56} r0={3} r1={10} />
        </React.Fragment>
      ))}
      <RoofNeighbour x={302} y={1314} h={40} kind="shovel" seed="s9/shov" coat={EMBER.hl} />
      {/* string lights across the slot */}
      <StringLights3 from={[420, 1258]} to={[528, 1268]} sag={12} n={7} r={3.6} halo={false} sway={1} every={0.5} seed="s9/sl3" ink={1.4} />
    </>
  );
};

/** Roof edges that shed snow on the thoom (end coords, near plane). */
export const NEAR_PUFFS: Pt[] = [
  [292, 1252],
  [400, 1252],
  [600, 1250],
  [700, 1250],
  [790, 1250],
];
