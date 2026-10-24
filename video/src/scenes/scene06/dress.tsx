// scene06/dress.tsx — S06's scene-local DRESSING layer (fix round 1: the frame was sparser than the reference artist's,
// ref2 f_1 converges poles, wires, trees and a queue of people on the vanishing point). Everything here is set dressing
// placed in the MakersLane world (coords at camera rest) and drawn inside the set's layer wraps:
//   houses   (F.houses)    telephone poles along the left kerb, two wires converging on the VP (seeds S07's wire
//                          motif), two pigeons on a wire that hop on 'heads-up'
//   roofs    (F.far)       a varied far skyline over the roof boxes: chimneys, a water tower over the sun, a clock spire,
//                          a tree crown
//   workshop (F.workshop)  a cream stoop step under the door (the door sat 50 px above the pavement), a potted plant and
//                          a crate by the door, a pigeon that lands on the cornice
//   fg       (F.fg)        a planter + bollard cropped by the right frame edge, low (the frame edge carries interest
//                          under the loose paint edge)
// Nothing here enters the caption band (screen y 280-570): the near pole's top is world 610 (screen >= 578).

import React from 'react';
import {Bird} from '../../lib/kit';
import {blob, crown, ease as E, Fill, Ink, line, lerp, mat, osc, palette, polyPath, prog, Pt, rectPath, useTime, XG} from '../../lib';
import {Bollard} from '../shared/props';
import {SI} from '../shared/sets';

// ---------------------------------------------------------------- poles + wires (houses layer)

/** The left row's kerb line (MakersLane baseX): x at y. */
const kerbX = (y: number) => 330 - ((330 + 140) * (y - 1120)) / 580;
/** Pole foot y along the kerb, near -> far; height = 2.0 x (foot - horizon 1040). */
const POLE_Y = [1470, 1262, 1172, 1128];
type Pole = {x: number; y: number; h: number; top: number; w: number; bar: number; bw: number; ink: number};
const POLES: Pole[] = POLE_Y.map((y, i) => {
  const h = 2.0 * (y - 1040);
  const top = y - h;
  return {x: kerbX(y), y, h, top, w: Math.max(4, h * 0.024), bar: top + h * 0.05, bw: h * 0.075, ink: [SI.front, SI.mid, SI.far, SI.hair][i]};
});
/** Where the two wires vanish (just left of the sun, under the far roofline). */
const WIRE_END: Pt[] = [
  [392, 1004],
  [402, 1008],
];

/** Wire i's control points: pole crossbar ends, near -> far, then the vanishing end. */
function wirePts(i: 0 | 1): Pt[] {
  const s = i === 0 ? -0.82 : 0.82;
  return [...POLES.map((p) => [p.x + s * p.bw, p.bar] as Pt), WIRE_END[i]];
}

/** A point on wire i between pole a and a + 1 at u (sagging quadratic). */
function wireAt(i: 0 | 1, a: number, u: number): Pt {
  const P = wirePts(i);
  const p0 = P[a];
  const p1 = P[a + 1];
  const sag = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) * 0.06;
  const c: Pt = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + sag * 2];
  return [(1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0], (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1]];
}

const POLE_G = (() => {
  let fills = '';
  const inks: string[] = ['', '', '', ''];
  POLES.forEach((p, i) => {
    const wt = p.w * 0.7;
    fills += polyPath([[p.x - p.w / 2, p.y], [p.x - wt / 2, p.top], [p.x + wt / 2, p.top], [p.x + p.w / 2, p.y]]);
    fills += rectPath(p.x - p.bw, p.bar - Math.max(2, p.h * 0.008), p.bw * 2, Math.max(3, p.h * 0.014));
    let d = line(p.x - p.w / 2, p.y, p.x - wt / 2, p.top, {seed: `s6pole${i}l`, over: [0, 3]}) + line(p.x + p.w / 2, p.y, p.x + wt / 2, p.top, {seed: `s6pole${i}r`, over: [0, 2]});
    d += line(p.x - p.bw - 3, p.bar - p.h * 0.008, p.x + p.bw + 3, p.bar - p.h * 0.008, {seed: `s6pole${i}b`, over: [3, 3]});
    const tick = Math.max(3, p.h * 0.012);
    for (const fx of [-0.82, -0.35, 0.35, 0.82]) d += `M${(p.x + p.bw * fx).toFixed(1)} ${(p.bar - p.h * 0.008).toFixed(1)}l0 ${(-tick).toFixed(1)}`;
    // a step peg pair on the near pole (detail at hero size)
    if (i === 0) for (let k = 0; k < 4; k++) d += `M${(p.x - p.w / 2).toFixed(1)} ${(p.y - 180 - k * 110).toFixed(1)}l-9 2M${(p.x + p.w / 2).toFixed(1)} ${(p.y - 235 - k * 110).toFixed(1)}l9 2`;
    inks[i] = d;
  });
  let wires = '';
  for (const i of [0, 1] as const) {
    const P = wirePts(i);
    for (let a = 0; a < P.length - 1; a++) {
      const p0 = P[a];
      const p1 = P[a + 1];
      const sag = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) * 0.06;
      wires += `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}Q${((p0[0] + p1[0]) / 2).toFixed(1)} ${((p0[1] + p1[1]) / 2 + sag * 2).toFixed(1)} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
    }
  }
  return {fills, inks, wires};
})();

/** Pigeons on the outer wire between the near poles; on 'heads-up' they hop (0.06 s apart), the second turns round. */
const WirePigeons: React.FC<{hopAt: number}> = ({hopAt}) => {
  const t = useTime();
  const spots = [0.34, 0.5];
  return (
    <>
      {spots.map((u, k) => {
        const p = wireAt(1, 0, u);
        const a = hopAt + k * 0.06;
        const q = prog(t, a, 0.2);
        const dy = q > 0 && q < 1 ? -Math.sin(q * Math.PI) * 16 : 0;
        const flip = k === 1 ? t >= a + 0.1 : false;
        return (
          <XG key={k} m={mat.translate(0, dy)}>
            <Bird x={p[0]} y={p[1] + 1} s={0.78} seed={`s6pg${k}`} color={k ? palette.sand : palette.cream} flip={flip} />
          </XG>
        );
      })}
    </>
  );
};

export const PolesAndWires: React.FC<{hopAt: number}> = ({hopAt}) => (
  <>
    <Ink d={POLE_G.wires} width={SI.far} taper={false} order="all" seed="s6wires" />
    <Fill d={POLE_G.fills} color={palette.brown} offset={false} mode="none" seed="s6poleF" />
    {POLE_G.inks.map((d, i) => (
      <Ink key={i} d={d} width={POLES[i].ink} taper={false} order="all" seed={`s6poleI${i}`} />
    ))}
    <WirePigeons hopAt={hopAt} />
  </>
);

// ---------------------------------------------------------------- far skyline (roofs layer)

const SKY_G = (() => {
  // chimneys + pots on the roof boxes (MakersLane G.roofs: 338-380 @1022, 470-520 @1008, 575-620 @1014)
  let d = rectPath(352, 1003, 10, 20) + rectPath(349, 999, 16, 6) + rectPath(500, 990, 9, 20) + rectPath(497, 986, 15, 6) + rectPath(596, 994, 9, 22);
  // a water tower over the sun: tank on four legs, a conical cap
  d += rectPath(428, 972, 34, 22) + polyPath([[423, 973], [445, 958], [467, 973]]);
  for (const lx of [431, 441, 449, 458]) d += rectPath(lx, 992, 3, 32);
  d += polyPath([[431, 1006], [461, 1003], [461, 1007], [431, 1010]]);
  // a clock spire between the sun and the workshop
  d += rectPath(565, 942, 24, 82) + polyPath([[561, 943], [577, 896], [593, 943]]);
  // a tree crown between the roof boxes
  const tree = crown(530, 1004, 22, 18, {seed: 's6tree', bumps: 7, round: 0.7});
  return {d, tree};
})();

export const FarSkyline: React.FC = () => (
  <>
    <Fill d={SKY_G.tree} color={palette.tan} offset={false} mode="none" seed="s6farT" />
    <Fill d={SKY_G.d} color={palette.tan} offset={false} mode="none" seed="s6farS" />
    <Fill d={blob(577, 958, 6.5, 6.5, {seed: 's6clock'})} color={palette.cream} offset={false} mode="none" seed="s6clockF" />
    <Ink d={`M577 958l0 -4.5M577 958l3.5 1.5`} width={1.4} taper={false} seed="s6clockI" />
  </>
);

// ---------------------------------------------------------------- the workshop door dressing (workshop layer)

const DOOR = {x: 620, w: 100, bottom: 1450, base: 1500};
const DOOR_G = (() => {
  const x0 = DOOR.x - 12;
  const x1 = DOOR.x + DOOR.w + 12;
  const tread = rectPath(x0, DOOR.bottom, x1 - x0, 14);
  const face = rectPath(x0, DOOR.bottom + 14, x1 - x0, DOOR.base - DOOR.bottom - 14);
  // open-cornered ink: the tread nose and the step's top, sides short of the corners
  const ink = line(x0 - 4, DOOR.bottom + 14, x1 + 5, DOOR.bottom + 14, {seed: 's6stp1', over: [3, 4]}) + line(x0 + 3, DOOR.bottom, x1 - 2, DOOR.bottom, {seed: 's6stp2', over: [0, 0]}) + line(x0, DOOR.bottom + 18, x0, DOOR.base - 6, {seed: 's6stp3', over: 0}) + line(x1, DOOR.bottom + 20, x1, DOOR.base - 4, {seed: 's6stp4', over: 0});
  // potted plant right of the step
  const potX = x1 + 30;
  const pot = polyPath([[potX - 19, 1462], [potX + 19, 1462], [potX + 14, DOOR.base], [potX - 14, DOOR.base]]);
  const potInk = line(potX - 22, 1462, potX + 22, 1462, {seed: 's6pot1', over: [2, 2]}) + line(potX - 19, 1463, potX - 14, DOOR.base, {seed: 's6pot2', over: 0}) + line(potX + 19, 1463, potX + 14, DOOR.base, {seed: 's6pot3', over: 0});
  const leaves = crown(potX, 1432, 27, 31, {seed: 's6potc', bumps: 7, round: 0.65});
  // a crate further right, under the shop window
  const cx0 = potX + 38;
  const crate = rectPath(cx0, 1446, 64, 54);
  const crateInk = line(cx0 - 3, 1446, cx0 + 67, 1447, {seed: 's6cr1', over: [2, 2]}) + line(cx0, 1446, cx0 + 1, DOOR.base, {seed: 's6cr2', over: 0}) + line(cx0 + 64, 1447, cx0 + 63, DOOR.base, {seed: 's6cr3', over: 0}) + line(cx0 + 3, 1466, cx0 + 61, 1465, {seed: 's6cr4', over: 0}) + line(cx0 + 3, 1482, cx0 + 61, 1482, {seed: 's6cr5', over: 0});
  return {tread, face, ink, pot, potInk, leaves, potX, crate, crateInk, cx0};
})();

/** The pigeon that lands on the workshop cornice: flies in from the right (flapping), lands with a squash. */
const CornicePigeon: React.FC<{landAt: number}> = ({landAt}) => {
  const t = useTime();
  const to: Pt = [905, 719];
  const from: Pt = [1130, 690];
  const fly = 0.32;
  if (t < landAt - fly) return null;
  if (t < landAt) {
    const u = E.outQuad(prog(t, landAt - fly, fly));
    const x = lerp(from[0], to[0], u);
    const y = lerp(from[1], to[1], u) - Math.sin(u * Math.PI) * 18 - 10;
    const flap = osc(t, 7, 0.4) * 9;
    const d = `M${x - 16} ${y - 6 - flap}Q${x - 8} ${y - 2} ${x} ${y}Q${x + 8} ${y - 2} ${x + 16} ${y - 6 - flap}`;
    return <Ink d={d} width={2.6} taper={false} seed="s6cpf" />;
  }
  const d = t - landAt;
  const sq = d < 0.16 ? 1 - 0.2 * Math.sin((d / 0.16) * Math.PI) : 1;
  return (
    <XG m={mat.about(mat.scale(2 - sq, sq), to[0], to[1])}>
      <Bird x={to[0]} y={to[1]} s={0.8} seed="s6cp" color={palette.cream} flip />
    </XG>
  );
};

export const DoorDressing: React.FC<{pigeonAt: number}> = ({pigeonAt}) => (
  <>
    <Fill d={DOOR_G.face} color={palette.sand} offset={false} mode="none" seed="s6stpF" />
    <Fill d={DOOR_G.tread} color={palette.cream} offset={false} mode="none" seed="s6stpT" />
    <Ink d={DOOR_G.ink} width={SI.mid} taper={false} order="all" seed="s6stpI" />
    <Fill d={DOOR_G.crate} color={palette.cream} offset={false} mode="none" seed="s6crF" />
    <Ink d={DOOR_G.crateInk} width={SI.mid} taper={false} order="all" seed="s6crI" />
    <Fill d={DOOR_G.pot} color={palette.tan} offset={false} mode="none" seed="s6potF" />
    <Fill d={DOOR_G.leaves} color={palette.sage} offset={false} mode="none" seed="s6potL" />
    <Ink d={DOOR_G.leaves} width={SI.mid} taper={false} seed="s6potLI" />
    <Ink d={DOOR_G.potInk} width={SI.mid} taper={false} order="all" seed="s6potI" />
    <CornicePigeon landAt={pigeonAt} />
  </>
);

// ---------------------------------------------------------------- cropped foreground (fg layer)

const FG_G = (() => {
  const box = polyPath([[905, 1812], [1180, 1812], [1180, 1990], [912, 1990]]);
  const boxInk = line(896, 1812, 1180, 1814, {seed: 's6fg1', over: [4, 0]}) + line(905, 1814, 912, 1990, {seed: 's6fg2', over: 0}) + line(910, 1838, 1180, 1840, {seed: 's6fg3', over: 0});
  const shrub = crown(1052, 1730, 128, 98, {seed: 's6fgc', bumps: 9, round: 0.7});
  return {box, boxInk, shrub};
})();

export const ForegroundRight: React.FC = () => (
  <>
    <Fill d={FG_G.shrub} color={palette.sage} offset={false} mode="none" seed="s6fgS" />
    <Ink d={FG_G.shrub} width={SI.front} taper={false} seed="s6fgSI" />
    <Fill d={FG_G.box} color={palette.tan} offset={false} mode="none" seed="s6fgB" />
    <Ink d={FG_G.boxInk} width={SI.front} taper={false} order="all" seed="s6fgBI" />
    <Bollard x={846} y={1905} w={58} h={112} seed="s6bol" />
  </>
);
