// S08 set pieces, one component per multiplane layer (see city.ts for the geometry and the layer depths).
import React, {useId} from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {useLook} from '../../lib/exit';
import {line, polyPath, rect, rectPath, Pt} from '../../lib/sketch';
import {mat, Mat} from '../../lib/xf';
import {layerMat, useCam} from '../../lib/cine/camera';
import {Glass, glassStep, HALF, popUpK, SI} from '../shared/sets';
import {ChromeSlot} from '../shared/sets/propSlots';
import {copingY, DEPTH, DOME, DOME_G, KERBS, PARAPET, POLE, ROW, ROWS, TOWER, TOWER_G, WIRES_D} from './city';

// ---------------------------------------------------------------- a city row

/** When a window chunk lights peach at dusk: from the horizon outward (row 0 first), then from the sun's x outward. */
export const duskLitAt = (duskAt: number, ri: number, chunk: number) => duskAt + ri * 0.14 + Math.abs(chunk - 2.2) * 0.07;

export const CityRow: React.FC<{ri: number; dotsAt?: number; duskAt?: number; fillsOnly?: boolean; seed: string}> = ({ri, dotsAt, duskAt, fillsOnly, seed}) => {
  const t = useTime();
  const R = ROWS[ri];
  const inkW = ri === 3 ? SI.mid : ri === 2 ? 1.9 : 0;
  return (
    <>
      <Fill d={R.street.d} color={R.street.color} offset={false} mode="snap" seed={`${seed}/st`} />
      <Fill d={R.back.d} color={R.back.color} offset={false} mode="snap" seed={`${seed}/bk`} />
      {R.fills.map((f, i) => (f.d ? <Fill key={i} d={f.d} color={f.color} offset={ri >= 2 ? undefined : false} mode="snap" seed={`${seed}/f${i}`} /> : null))}
      {R.dots.map((d, c) => {
        if (!d) return null;
        const lit = duskAt !== undefined && t >= duskLitAt(duskAt, ri, c);
        // row 0 shows window dots only once they are lit (fill-only haze by day)
        if (ri === 0 && !lit) return null;
        if (dotsAt !== undefined && !lit && t < dotsAt + c * 0.06) return null;
        return <Fill key={`d${c}`} d={d} color={lit ? palette.peach : ri === 1 ? HALF.sand : palette.tealDark} offset={false} mode="snap" seed={`${seed}/d${c}`} />;
      })}
      {R.bw && !fillsOnly ? <Fill d={R.bw} color={duskAt !== undefined && t >= duskLitAt(duskAt, ri, 2) ? palette.peach : palette.cream} offset={false} mode="snap" seed={`${seed}/bw`} /> : null}
      {R.bars && !fillsOnly ? <Fill d={R.bars} color={palette.tealDark} offset={false} mode="snap" seed={`${seed}/bar`} /> : null}
      {!fillsOnly && R.doors ? <Fill d={R.doors} color={palette.teal} offset={false} mode="snap" seed={`${seed}/door`} /> : null}
      {!fillsOnly && inkW > 0 && R.ink ? <Ink d={R.ink + R.doorInk + KERBS[ri]} width={inkW} taper={false} seed={`${seed}/i`} /> : null}
      {!fillsOnly
        ? R.chrome.map((c, i) =>
            dotsAt !== undefined && t < dotsAt + 0.05 + i * 0.05 ? null : <ChromeSlot key={`c${i}`} x={c[0]} y={c[1]} w={c[2]} h={c[3]} width={ri === 3 ? SI.far : SI.hair} seed={`${seed}/c${i}`} />,
          )
        : null}
    </>
  );
};

// ---------------------------------------------------------------- the glass dome

/** The dome interior in the coordinates of ANOTHER layer (its clip follows the dome through the parallax). */
export function useDomeClip(depth: number): Mat {
  const c = useCam();
  return mat.mul(mat.inv(layerMat(c, depth)), layerMat(c, DEPTH.row1));
}

/** A copy of children drawn through the glass (one Glass step lighter), clipped to the dome interior. */
export const ThroughGlass: React.FC<{depth: number; on: boolean; children?: React.ReactNode}> = ({depth, on, children}) => {
  const id = 'g8' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const m = useDomeClip(depth);
  if (!on) return null;
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={DOME_G.interior} transform={mat.str(m)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <Glass>{children}</Glass>
      </g>
    </>
  );
};

/** The glass sky inside the dome (row-1 layer, drawn BEFORE the sun): two sky steps lighter than the sky behind it. */
export const DomeGlassSky: React.FC<{glassAt: number; sky: (t: number) => string; band: [number, number]}> = ({glassAt, sky, band}) => {
  const t = useTime();
  const id = 'gs8' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (t < glassAt) return null;
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={DOME_G.interior} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <path d={DOME_G.interior} fill={sky(t)} />
        <path d={rectPath(-200, band[0], 1480, band[1] - band[0] + 2)} fill={glassStep(palette.peach)} />
      </g>
    </>
  );
};

/** Dome ink + light: the bold 4.8 arc drawn from both feet up to the apex, then the rim strip, glints and lattice. */
export const DomeShell: React.FC<{at: number; dur: number; glassAt: number; glintSweepAt?: number}> = ({at, dur, glassAt, glintSweepAt}) => {
  const t = useTime();
  const look = useLook();
  const glass = t >= glassAt;
  // one glint sweep: the glint bars slide across the glass (a flat white bar, no fade), then rest on the sun side
  let glintM = '';
  if (glintSweepAt !== undefined && t >= glintSweepAt && t < glintSweepAt + 0.5) {
    const q = E.inOutSine(prog(t, glintSweepAt, 0.5));
    glintM = `translate(${(-260 + 260 * q).toFixed(1)} ${(30 - 30 * q).toFixed(1)})`;
  }
  return (
    <>
      {glass && look.fills === 'color' ? <path d={DOME_G.rim} fill={palette.cream} /> : null}
      {glass && t >= glassAt + 0.07 && look.fills === 'color' ? <path d={DOME_G.glints} fill={palette.white} transform={glintM || undefined} /> : null}
      {glass ? <Ink d={DOME_G.lattice} width={SI.hair} taper={false} at={glassAt} dur={0.2} order="all" seed="s8/lat" /> : null}
      <Ink d={DOME_G.leftHalf} width={SI.front} at={at} dur={dur} pace="free" ease={E.inOutCubic} taper={false} seed="s8/arcL" />
      <Ink d={DOME_G.rightHalf} width={SI.front} at={at} dur={dur} pace="free" ease={E.inOutCubic} taper={false} seed="s8/arcR" />
    </>
  );
};

/** The watchtower: a tealDark lattice silhouette at the dome's right foot, cabin dark; rises (scaleY from its base). */
export const Watchtower: React.FC<{at: number}> = ({at}) => {
  const t = useTime();
  const k = popUpK(t, at, 0.05);
  if (k <= 0.001) return null;
  const cx = (TOWER.x0 + TOWER.x1) / 2;
  return (
    <g transform={k !== 1 ? `translate(${cx} ${TOWER.base}) scale(1 ${k.toFixed(4)}) translate(${-cx} ${-TOWER.base})` : undefined}>
      <Fill d={TOWER_G.frame} color={palette.tealDark} offset={false} mode="snap" seed="s8/tw" />
      <Fill d={TOWER_G.slot} color={'#2E4847'} offset={false} mode="snap" seed="s8/tws" />
    </g>
  );
};

/** The searchlight from the cabin: a flat cream wedge at a FIXED 0.55 opacity with dashed ink edges (never animated
 *  opacity), sweeping over the glass; `angle(t)` in degrees (180 = pointing left), clamped so the cone stays below the
 *  caption band. */
export const Searchlight: React.FC<{at: number; angle: (t: number) => number}> = ({at, angle}) => {
  const t = useTime();
  const look = useLook();
  if (t < at || look.fills !== 'color') return null;
  const [ox, oy] = TOWER.light;
  const a = Math.max(150, Math.min(188, angle(t)));
  const L = 760 * E.outCubic(prog(t, at, 0.18));
  const half = 7;
  const d0 = ((a - half) * Math.PI) / 180;
  const d1 = ((a + half) * Math.PI) / 180;
  const p0: Pt = [ox + Math.cos(d0) * L, oy + Math.sin(d0) * L];
  const p1: Pt = [ox + Math.cos(d1) * L, oy + Math.sin(d1) * L];
  return (
    <>
      <path d={polyPath([[ox, oy], p0, p1])} fill={palette.cream} opacity={0.55} />
      <path d={`M${ox} ${oy}L${p0[0].toFixed(1)} ${p0[1].toFixed(1)}M${ox} ${oy}L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`} fill="none" stroke={palette.ink} strokeWidth={SI.hair} strokeDasharray="10 9" strokeLinecap="round" />
      <circle cx={ox} cy={oy} r={5} fill={palette.cream} />
    </>
  );
};

/** The peach horizon band in the sky (screen-ish: the sky layer), behind row 0. */
export const HorizonBand: React.FC<{band: [number, number]}> = ({band}) => (
  <Fill rect={[-400, band[0], 1880, band[1] - band[0] + 2]} color={palette.peach} offset={false} mode="snap" seed="s8/band" />
);

// ---------------------------------------------------------------- the near layer: our parapet

const NEAR = (() => {
  const P = PARAPET;
  const yT = copingY;
  const coping = polyPath([[-180, yT(-180)], [1260, yT(1260)], [1260, yT(1260) + P.coping], [-180, yT(-180) + P.coping]]);
  const face = polyPath([[-180, yT(-180) + P.coping], [1260, yT(1260) + P.coping], [1260, P.face], [-180, P.face + 6]]);
  const deck = polyPath([[-180, P.face + 6], [1260, P.face], [1260, 2200], [-180, 2200]]);
  const deckShade = polyPath([[-180, P.face + 6], [1260, P.face], [1260, P.face + 46], [-180, P.face + 58]]);
  let joints = '';
  for (let i = 0; i < 9; i++) {
    const jx = -100 + i * 150 + (i % 3) * 14;
    joints += line(jx, yT(jx) + P.coping + 10, jx + 1, P.face - 6, {seed: `s8/jt${i}`, over: 0, breaks: false});
  }
  joints += line(-180, yT(-180) + P.coping + 62, 1260, yT(1260) + P.coping + 60, {seed: 's8/jh', over: 0});
  const ledgeInk =
    line(-180, yT(-180) - 1, 1260, yT(1260) - 1, {seed: 's8/cp1', over: [40, 40]}) +
    line(-180, yT(-180) + 7, 1260, yT(1260) + 7, {seed: 's8/cp2', over: [26, 50]}) +
    line(-180, yT(-180) + P.coping, 1260, yT(1260) + P.coping, {seed: 's8/cp3', over: [30, 30]}) +
    line(-180, P.face + 6, 1260, P.face, {seed: 's8/fb', over: 0});
  // the chimney stack cut by the left frame edge, two pots (the pigeons' perch)
  const cs = {x0: -40, x1: 64, top: 1340};
  const stack = rectPath(cs.x0, cs.top, cs.x1 - cs.x0, yT(cs.x0) - cs.top + 2);
  const potTops = rectPath(-6, 1296, 24, 44) + rectPath(30, 1306, 22, 34);
  const potBands = rectPath(cs.x0 - 6, cs.top, cs.x1 - cs.x0 + 12, 12);
  const chimInk =
    rect(cs.x0, cs.top, cs.x1 - cs.x0, yT(cs.x0) - cs.top, {seed: 's8/ch1', over: 'small', edges: 'tlr'}) +
    line(cs.x0 - 8, cs.top, cs.x1 + 8, cs.top, {seed: 's8/ch1t', over: [4, 4]}) +
    rect(-6, 1296, 24, 44, {seed: 's8/ch2', over: 'small', edges: 'tlr'}) +
    rect(30, 1306, 22, 34, {seed: 's8/ch3', over: 'small', edges: 'tlr'}) +
    line(-30, 1384, -8, 1384, {seed: 's8/chb', over: 0}) +
    line(20, 1410, 46, 1410, {seed: 's8/chb2', over: 0});
  // the antenna at the right edge, standing on the coping
  const antenna = line(1000, yT(1000), 1000, 1250, {seed: 's8/an', over: 0}) + line(968, 1292, 1032, 1292, {seed: 's8/an1', over: [2, 2]}) + line(976, 1326, 1024, 1326, {seed: 's8/an2', over: [2, 2]}) + line(958, 1264, 1042, 1264, {seed: 's8/an3', over: [2, 2]}) + line(1000, 1362, 1040, yT(1040), {seed: 's8/an4', over: 0});
  // the telephone pole at x 540 where the three wires end (on our parapet), with a cross-arm and insulators
  const px = POLE.x;
  const pole = polyPath([[px - 6, yT(px)], [px + 6, yT(px)], [px + 4.5, POLE.top], [px - 4.5, POLE.top]]);
  const arm = rectPath(px - 26, 1206, 52, 8);
  const poleInk = line(px - 6, yT(px), px - 4.5, POLE.top, {seed: 's8/pl', over: [0, 3]}) + line(px + 6, yT(px), px + 4.5, POLE.top, {seed: 's8/pr', over: [0, 3]}) + rect(px - 26, 1206, 52, 8, {seed: 's8/pa', over: 'small'});
  return {coping, face, deck, deckShade, joints, ledgeInk, stack, potTops, potBands, chimInk, antenna, pole, arm, poleInk};
})();

export const NearSet: React.FC = () => (
  <>
    <Fill d={NEAR.deck} color={palette.sand} offset={false} seed="s8/deck" />
    <Fill d={NEAR.deckShade} color={palette.teal} offset={false} seed="s8/deckS" />
    <Fill d={NEAR.face} color={palette.tan} offset={false} seed="s8/face" />
    <Fill d={NEAR.coping} color={palette.cream} offset={false} seed="s8/coping" />
    <Ink d={NEAR.joints} width={SI.far} taper={false} seed="s8/joints" />
    <Ink d={NEAR.ledgeInk} width={SI.front} seed="s8/ledge" />
    <Fill d={NEAR.stack} color={palette.brown} seed="s8/stack" />
    <Fill d={NEAR.potBands} color={palette.tan} offset={false} seed="s8/potb" />
    <Fill d={NEAR.potTops} color={palette.sand} seed="s8/pott" />
    <Ink d={NEAR.chimInk} width={SI.front} seed="s8/chim" />
    <Ink d={NEAR.antenna} width={SI.mid} color={palette.tealDark} taper={false} seed="s8/ant" />
  </>
);

/** The pole + the three wires (drawn before the board, which then stands in front of the pole). */
export const PoleWires: React.FC = () => (
  <>
    <Ink d={WIRES_D} width={SI.far} taper={false} order="all" seed="s8/wires" />
    <Fill d={NEAR.pole} color={palette.brown} seed="s8/pole" />
    <Fill d={NEAR.arm} color={palette.brown} offset={false} seed="s8/arm" />
    <Ink d={NEAR.poleInk} width={SI.mid} taper={false} seed="s8/polei" />
    <Fill d={[0, 1, 2].map((i) => rectPath(POLE.x - 22 + i * 20, 1198, 6, 9)).join('')} color={palette.white} offset={false} seed="s8/ins" />
  </>
);

export {DOME, ROW};
