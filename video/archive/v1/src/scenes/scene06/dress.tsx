// scene06/dress.tsx — S06's scene-local DRESSING layer (fix round 1: the frame was sparser than the reference artist's,
// ref2 f_1 converges poles, wires, trees and a queue of people on the vanishing point). Everything here is set dressing
// placed in the MakersLane world (coords at camera rest) and drawn inside the set's layer wraps:
//   houses   (F.houses)    telephone poles along the left kerb, two wires converging on the VP (seeds S07's wire
//                          motif), two pigeons on a wire that hop on 'heads-up'
//   roofs    (F.far)       a varied far skyline over the roof boxes: chimneys, a water tower over the sun, a clock spire,
//                          a tree crown
//   workshop (F.workshop)  fix round 2: the set's long cream kerb slab + sand pavement plinth (read as a loading dock)
//                          painted over with the lane's sand; ONE door-wide step under the door (one tread), the wall's
//                          foot line, a potted plant and a crate by the door, a pigeon that lands on the cornice, and a
//                          quiet cropped neighbour facade right of the workshop (sand wall, drainpipe, part of a window)
//   houses   (F.houses)    fix round 2: the left row's ink scaled with depth (3.4 px near -> 2.2 far: the set draws the
//                          near house at 2.2 / 1.3) and mullions + side curtains on its blank browser panes
//   floor    (F.floor)     fix round 2: the set's first tan 'post shadow' wedge (it ran from the passer at (455, 1300) to
//                          the frame bottom: a median strip) painted over: Shadows (parts.tsx) draws every figure's
//                          shadow with one length rule instead; fix round 3: the second wedge too (bottom-right, it
//                          pointed up-left at the sun with no caster)
//   houses   (F.houses)    fix round 3: ONE neighbour draws a curtain (PaneCurtain) instead of the set's row-wide pop
//   fg       (F.fg)        a shrub in its tub cropped by the right frame edge, low (the bollard is gone: it read as a
//                          tombstone); fix round 3: a festoon of lights across the top of the frame (ref2 f_12 / f_33
//                          top framing), lowest ~y 240 on screen
// Nothing here enters the caption band (screen y 280-570): the near pole's top is world 610 (screen >= 578).

import React from 'react';
import {Bird} from '../../lib/kit';
import {blob, crown, ease as E, Fill, Ink, line, lerp, mat, osc, palette, polyPath, prog, Pt, rectPath, useTime, XG} from '../../lib';
import type {Quad} from '../../lib/persp';
import {MAKERS_LANE, perspRowLayout, SI, WORKSHOP_LANE} from '../shared/sets';

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

/** The set's workshop kerb plane + forward pavement (MakersLane G.kerbTop / kerbFace / pave / paveFace(2) / kerbInk:
 *  x from the lane ray through (600, 1500) to 1240, y 1500-1676), painted over with the lane's flat sand (the floor is
 *  one flat sand field there, so the parallax step between the layers never shows). */
const KERB_COVER = (() => {
  const VP = MAKERS_LANE.vp;
  const W = WORKSHOP_LANE;
  const kx = (y: number) => VP[0] + ((W.x0 - VP[0]) * (y - VP[1])) / (W.base - VP[1]);
  return polyPath([[W.x0 - 8, W.base - 3], [1260, W.base - 3], [1260, 1688], [kx(1688) - 8, 1688]]);
})();
/** The wall's foot (the workshop and its neighbour stand straight on the lane). */
const FOOT_INK = line(WORKSHOP_LANE.x0 - 2, WORKSHOP_LANE.base, 1250, WORKSHOP_LANE.base + 1, {seed: 's6foot', over: [3, 0], breaks: false});

export const DoorDressing: React.FC<{pigeonAt: number}> = ({pigeonAt}) => (
  <>
    <Fill d={KERB_COVER} color={palette.sand} offset={false} mode="none" seed="s6kerbC" />
    <Ink d={FOOT_INK} width={SI.mid} taper={false} seed="s6footI" />
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

// ---------------------------------------------------------------- the neighbour right of the workshop (workshop layer)

/** A quiet cropped neighbour facade (fix round 2: the frame right of the workshop wall was an inkless sand slab under
 *  the peach band): a sand wall from x 1004 (just right of the workshop's wall line) behind the right rail UI, its own
 *  cornice at 880, a brown drainpipe with two brackets, and the left part of a teal window (mullion, sill). Low detail,
 *  2.2-3 px ink. */
const NB = {x0: 1004, top: 880, base: WORKSHOP_LANE.base, pipeX: 1020, win: [1046, 1046, 70, 112] as [number, number, number, number]};
const NB_G = (() => {
  const wall = polyPath([[NB.x0, NB.top], [1260, NB.top], [1260, NB.base], [NB.x0, NB.base]]);
  const cornice = polyPath([[NB.x0 - 2, NB.top - 12], [1260, NB.top - 12], [1260, NB.top + 4], [NB.x0 - 2, NB.top + 4]]);
  const [wx, wy, ww, wh] = NB.win;
  const glass = rectPath(wx, wy, ww, wh);
  const pipe = rectPath(NB.pipeX - 4, NB.top + 4, 8, NB.base - NB.top - 4);
  const ink = line(NB.x0 - 4, NB.top - 12, 1260, NB.top - 13, {seed: 's6nb1', over: [3, 0], breaks: false}) + line(NB.x0, NB.top + 4, 1260, NB.top + 5, {seed: 's6nb2', over: 0, breaks: false}) + line(NB.x0 - 1, NB.top - 12, NB.x0, NB.top + 4, {seed: 's6nb3', over: 0});
  const winInk = line(wx, wy, wx + ww + 30, wy, {seed: 's6nbw1', over: [2, 0]}) + line(wx, wy, wx, wy + wh, {seed: 's6nbw2', over: [0, 2]}) + line(wx - 6, wy + wh + 4, wx + ww + 30, wy + wh + 5, {seed: 's6nbw3', over: [3, 0]}) + line(wx + ww * 0.52, wy + 2, wx + ww * 0.52, wy + wh - 2, {seed: 's6nbw4', over: 0}) + line(wx + 2, wy + wh * 0.5, wx + ww + 28, wy + wh * 0.5, {seed: 's6nbw5', over: 0});
  const pipeInk = line(NB.pipeX - 4, NB.top + 6, NB.pipeX - 4, NB.base - 2, {seed: 's6nbp1', over: 0}) + line(NB.pipeX + 4, NB.top + 6, NB.pipeX + 4, NB.base - 2, {seed: 's6nbp2', over: 0}) + rectPath(NB.pipeX - 7, 1010, 14, 6) + rectPath(NB.pipeX - 7, 1330, 14, 6);
  // a curtain in the window's left half (a partial fill: the reference panes are never blank)
  const curtain = `M${wx} ${wy}L${wx + ww * 0.4} ${wy}Q${wx + ww * 0.22} ${wy + wh * 0.45} ${wx + ww * 0.3} ${wy + wh}L${wx} ${wy + wh}Z`;
  return {wall, cornice, glass, pipe, ink, winInk, pipeInk, curtain};
})();

export const NeighbourRight: React.FC = () => (
  <>
    <Fill d={NB_G.wall} color={palette.sand} offset={false} mode="none" seed="s6nbW" />
    <Fill d={NB_G.cornice} color={palette.tan} offset={false} mode="none" seed="s6nbC" />
    <Fill d={NB_G.glass} color={palette.teal} seed="s6nbG" />
    <Fill d={NB_G.curtain} color={palette.peach} offset={false} mode="none" seed="s6nbCu" />
    <Fill d={NB_G.pipe} color={palette.brown} offset={false} mode="none" seed="s6nbP" />
    <Ink d={NB_G.ink + NB_G.winInk} width={SI.far * 1.2} taper={false} order="all" seed="s6nbI" />
    <Ink d={NB_G.pipeInk} width={SI.far} taper={false} order="all" seed="s6nbPI" />
  </>
);

// ---------------------------------------------------------------- the left row: ink by depth + pane detail (houses)

/** The SAME layout MakersLane draws (memoised by spec: identical geometry and seeds). */
const LEFT = perspRowLayout({quad: [[-140, 700], [330, 900], [330, 1120], [-140, 1700]], n: 6, H: 700, hw: 700 * 0.5, storeys: 3, side: 'left', seed: 'laneL', colors: [palette.sand, palette.tan, palette.sand, palette.sand, palette.tan, palette.sand], litFraction: 0.8});
/** Ink by depth (world px; the set draws every full-tier house at 2.2 and its thin lines at 1.3): near 3.4 -> 2.2. */
const ROW_INK = [3.4, 2.8, 2.4];
const lerpPt = (a: Pt, b: Pt, u: number): Pt => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
/** Bilinear point in a screen quad (TL, TR, BR, BL). */
const inQuad = (q: Quad, u: number, v: number): Pt => lerpPt(lerpPt(q[0], q[1], u), lerpPt(q[3], q[2], u), v);

const ROW_G = (() => {
  const out: {ink: string; thin: string; w: number; curtains: string; mull: string}[] = [];
  LEFT.houses.forEach((h, i) => {
    if (i >= ROW_INK.length || h.tier === 'fill' || h.tier === 'dots') return;
    // the browser window's screen (below its bar: the lower 76 % of h.browser)
    const b = h.browser;
    const sq: Quad = [inQuad(b, 0, 0.24), inQuad(b, 1, 0.24), b[2], b[3]];
    const P = (u: number, v: number) => inQuad(sq, u, v);
    const poly = (pts: Pt[]) => polyPath(pts);
    // side curtains: ~30 % each, the inner edge tied back in a curve (40-70 % of the pane stays lit)
    const cl = poly([P(0, 0), P(0.3, 0), P(0.2, 0.42), P(0.27, 1), P(0, 1)]);
    const cr = poly([P(1, 0), P(0.7, 0), P(0.8, 0.42), P(0.73, 1), P(1, 1)]);
    const m0 = P(0.5, 0);
    const m1 = P(0.5, 1);
    const n0 = P(0, 0.52);
    const n1 = P(1, 0.52);
    const mull = line(m0[0], m0[1], m1[0], m1[1], {seed: `s6m${i}a`, over: 0}) + line(n0[0], n0[1], n1[0], n1[1], {seed: `s6m${i}b`, over: 0});
    out.push({ink: h.g.ink, thin: h.g.thin, w: ROW_INK[i], curtains: cl + cr, mull});
  });
  return out;
})();

export const LeftRowDetail: React.FC = () => (
  <>
    {ROW_G.map((g, i) => (
      <React.Fragment key={i}>
        <Fill d={g.curtains} color={palette.tan} offset={false} mode="none" seed={`s6rc${i}`} />
        <Ink d={g.mull} width={g.w * 0.7} taper={false} order="all" seed={`s6rm${i}`} />
        {g.ink ? <Ink d={g.ink} width={g.w} taper={false} seed={`lane/L/i${i}`} /> : null}
        {g.thin ? <Ink d={g.thin} width={g.w * 0.72} taper={false} seed={`lane/L/t${i}`} /> : null}
      </React.Fragment>
    ))}
  </>
);

// ---------------------------------------------------------------- the floor: the set's post-shadow wedges (floor)

/** MakersLane G.bandsTan's two wedges ([x at the frame bottom, half width there, y0 -> y1] on rays from the VP), 3-4 px
 *  wider each side, painted over with the lane's sand: (1) [470, 78, 1300 -> 2060] ran from the passer at (455, 1300) to
 *  the frame bottom (a median strip); (2) fix round 3: [1080, 120, 1700 -> 2060] sat alone at the bottom-right pointing
 *  up-left at the sun (against the scene's radial rule) with no caster on frame 0. The cropped shrub's own shadow runs
 *  from its tub base (y 1990, below the frame) down-right, off frame: nothing to draw. */
const BAND_COVER = (() => {
  const VP = MAKERS_LANE.vp;
  const rayAt = (xb: number, y: number) => VP[0] + ((xb - VP[0]) * (y - VP[1])) / (1920 - VP[1]);
  const wedge = (xb: number, hw: number, y0: number, y1: number) =>
    polyPath([[rayAt(xb - hw * 0.35, y0) - 3, y0 - 3], [rayAt(xb + hw * 0.35, y0) + 3, y0 - 3], [rayAt(xb + hw, y1) + 4, y1 + 4], [rayAt(xb - hw, y1) - 4, y1 + 4]]);
  return wedge(470, 78, 1300, 2060) + wedge(1080, 120, 1700, 2060);
})();

export const FloorCover: React.FC = () => <Fill d={BAND_COVER} color={palette.sand} offset={false} mode="none" seed="s6bandC" />;

// ---------------------------------------------------------------- one neighbour draws a curtain (houses layer)

/** Fix round 3 (the set's curtainsAt popped ~8 panes peach at once: lights switching on, not a curtain): ONE near upper
 *  pane of the left row (house 1's upper-left window, the same quad the set's PerspRow draws: screen ~x 63-92, y 858-956
 *  at rest) gets a peach curtain that slides across it from the left in 0.1 s (an ink leading edge, one fold), and one
 *  ink tick flicks off its right side as it closes. Sets request: MakersLane curtainsAt {t, panes: [i]}. */
const PANE = (() => {
  const h = LEFT.houses[1];
  const m = /M(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)Z/.exec(h.g.lit);
  const n = m ? m.slice(1).map(Number) : [104.4, 872.1, 131.2, 878.5, 131.2, 965.5, 104.4, 966.3];
  return [[n[0], n[1]], [n[2], n[3]], [n[4], n[5]], [n[6], n[7]]] as Quad;
})();

export const PaneCurtain: React.FC<{at: number}> = ({at}) => {
  const t = useTime();
  if (t < at) return null;
  const q = E.outCubic(prog(t, at, 0.1));
  const P = (u: number, v: number) => inQuad(PANE, u, v);
  const e0 = P(q, 0);
  const e1 = P(q, 1);
  const body = polyPath([P(0, 0), e0, e1, P(0, 1)]);
  const fold = q > 0.3 ? line(P(q * 0.45, 0.04)[0], P(q * 0.45, 0.04)[1], P(q * 0.5, 0.96)[0], P(q * 0.5, 0.96)[1], {over: 0, seed: 's6pcF'}) : '';
  const edge = line(e0[0], e0[1] + 1, e1[0], e1[1] - 1, {over: 0, seed: 's6pcE'});
  // one tick off the pane's right side as the curtain closes (0.06-0.18 s)
  const d = t - at - 0.06;
  let tick = '';
  if (d >= 0 && d < 0.12) {
    const r = P(1, 0.35);
    const L = 11 * Math.sin((d / 0.12) * Math.PI);
    tick = `M${(r[0] + 6).toFixed(1)} ${r[1].toFixed(1)}l${L.toFixed(1)} ${(-L * 0.45).toFixed(1)}`;
  }
  return (
    <>
      <Fill d={body} color={palette.peach} offset={false} mode="none" seed="s6pcB" />
      <Ink d={edge + fold} width={2.2} taper={false} order="all" seed="s6pcI" />
      {tick ? <Ink d={tick} width={2.6} taper={false} seed="s6pcT" /> : null}
    </>
  );
};

// ---------------------------------------------------------------- festoon lights across the top (fg layer)

/** Fix round 3 (the top of the frame was bare flat mint in every frame; ref2 f_12 / f_33 crop a string of lights across
 *  the top): one festoon strung across the lane close to the camera (fg layer), sagging from off-frame left to off-frame
 *  right, lowest ~y 230 on screen (the caption band from 280 stays clean), cream bulbs on short stems every ~120 px; the
 *  string sways a hair (2.5 px, 0.55 Hz) and each bulb swings on its stem. World x -320 .. 1480 covers the frame through
 *  the truck. */
const FESTOON = {x0: -320, y0: 70, x1: 1480, y1: 52, sag: 192, n: 15, r: 11.5};
const festoonAt = (u: number, sag: number): Pt => {
  const x = lerp(FESTOON.x0, FESTOON.x1, u);
  const y = lerp(FESTOON.y0, FESTOON.y1, u) + sag * 4 * u * (1 - u);
  return [x, y];
};

export const FestoonLights: React.FC = () => {
  const t = useTime();
  const sag = FESTOON.sag + 2.5 * Math.sin(t * 2 * Math.PI * 0.55);
  let wire = '';
  const N = 24;
  for (let i = 0; i <= N; i++) {
    const p = festoonAt(i / N, sag);
    wire += `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  }
  let stems = '';
  let bulbs = '';
  for (let k = 0; k < FESTOON.n; k++) {
    const u = (k + 0.5) / FESTOON.n;
    const [x, y] = festoonAt(u, sag);
    const a = ((5 * Math.sin(t * 2 * Math.PI * 0.8 + k * 1.7)) * Math.PI) / 180;
    const L = 10;
    const bx = x + Math.sin(a) * (L + FESTOON.r);
    const by = y + Math.cos(a) * (L + FESTOON.r);
    stems += `M${x.toFixed(1)} ${y.toFixed(1)}L${(x + Math.sin(a) * L).toFixed(1)} ${(y + Math.cos(a) * L).toFixed(1)}`;
    bulbs += blob(bx, by, FESTOON.r, FESTOON.r * 1.06, {seed: `s6fb${k}`});
  }
  return (
    <>
      <Ink d={wire} width={2.6} taper={false} seed="s6fW" />
      <Ink d={stems} width={3.2} taper={false} order="all" seed="s6fS" />
      <Fill d={bulbs} color={palette.cream} offset={false} mode="none" seed="s6fBf" />
      <Ink d={bulbs} width={2.6} taper={false} seed="s6fBi" />
    </>
  );
};

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
  </>
);
