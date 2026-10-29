// S09 polish A1 (reviewer: "the keeper is the 'somebody' of the line, but his drawing is crude next to Pip and the
// onlookers: a bell torso with a straight brown waistband, no shoulder line, the raised arm a stick ending in a
// bowling-pin mitten"). The kit Keeper (props Figures) stays the body; this overlay is drawn in the SAME figure frame
// (feet, scale, flip, walk, bob and rise mirrored from the kit's FigFrame / BackBody / Keeper) and adds:
//   - a back yoke seam across the shoulders, the hanging sleeve's seam + two fold ticks + a cuff, and a sand hand with a
//     thumb notch that carries the toolbox by its handle (`keeperCarryHand`);
//   - the jacket skirt below the belt with a back vent (a work coat, not a bell over a waistband);
//   - the raised arm redrawn as a proper sleeve (props FigureArm, 1.3x wider than the kit's, cuff) ending in a HAND WITH A
//     THUMB: open while he reaches, then gripping the new lock (fingers curled over its edge, thumb on its face) from the
//     moment it lands on the door.
// Person-local units: hip line y 0, torso top -95, +x = the raised arm's side (the figure is drawn flipped).

import React from 'react';
import {Fill, Ink, palette, useTime, lerp, prog, clamp, ease as E, rand, rng, mat, XG, MOTION, blob, rectPath} from '../../lib';
import type {Pt} from '../../lib';
import {FigureArm} from '../shared/props';

const LEG = 62;
const TORSO = 95;

/** A1 FR2 (reviewer: the keeper's sand coat sat on sand / tan facades with no value contrast: invisible at phone size):
 *  his work coat is tealDark (KEEPER_COAT_MAP over the kit Keeper + this overlay); his hands keep the skin tone, passed as
 *  SKIN (the same sand, spelled in lower case so the coat map leaves it alone). */
export const SKIN = palette.sand.toLowerCase();
export const KEEPER_COAT = palette.tealDark;
export const KEEPER_COAT_MAP = (c: string) => (c === palette.sand ? KEEPER_COAT : c);

/** The kit Person's torso width, head radius and shoulder rounding for a seed (props Figures personGeo, mirrored). */
export function keeperGeo(seed: string) {
  const r = rng(`person/${seed}`);
  const w = r.range(86, 100);
  const hr = w * r.range(0.23, 0.26);
  const round = r.range(0.36, 0.45);
  return {w, hr, h: TORSO, round};
}

export type KeeperSpec = {
  x: number;
  y: number;
  h: number;
  seed: string;
  riseAt: number;
  reachAt: number;
  lowerAt?: number;
  installAt: number;
  installDur: number;
  walk: {at: number; hz: number; to: Pt; dur: number};
  /** The hand closes on the new lock from here (it lands on the door). */
  gripAt: number;
  /** A1 FR2: from here a cream rim strip runs down his sun-side (screen-right) shoulder and back. */
  rimAt?: number;
};

/** The kit Keeper's raise (props Figures raiseQ). */
const raiseQ = (t: number, at?: number, downAt?: number) => (at === undefined ? 0 : prog(t, at, 0.3, E.outBack(1.3)) * (downAt === undefined ? 1 : 1 - prog(t, downAt, 0.25, E.inOutCubic)));

/** The figure frame (props Figures FigFrame + BackBody's walk bob + RiseClip's offset) as a matrix, or null before the
 *  rise. */
function frameOf(t: number, p: KeeperSpec) {
  const g = keeperGeo(p.seed);
  const s = p.h / (LEG + g.h + g.hr * 2.6);
  if (t < p.riseAt) return null;
  const q = clamp((t - p.walk.at) / p.walk.dur);
  const walking = t >= p.walk.at && q < 1;
  const x = lerp(p.x, p.walk.to[0], t >= p.walk.at ? q : 0);
  const y = lerp(p.y, p.walk.to[1], t >= p.walk.at ? q : 0);
  const rise = (1 - prog(t, p.riseAt, MOTION.rise.dur, MOTION.rise.ease)) * p.h * 1.05;
  const ph = t * p.walk.hz * Math.PI + rand(p.seed, 'wph') * 6.28;
  const bob = walking ? -Math.abs(Math.sin(ph)) * LEG * 0.035 : 0;
  const hipY = y - LEG * s + rise;
  const m = mat.compose(mat.translate(x, hipY), mat.scale(-s, s), mat.translate(0, bob));
  return {g, s, m, x, y, hipY, walking};
}

/** Where the hanging (left) hand holds the toolbox handle, in the keeper's parent coordinates. */
export function keeperCarryHand(t: number, p: KeeperSpec): Pt {
  const f = frameOf(t, p);
  if (!f) return [p.x, p.y];
  const lx = -(f.g.w / 2 + 1);
  const ly = 11;
  return [f.x - f.s * lx, f.hipY + f.s * ly];
}

/** The hand at the end of the raised sleeve, in the hand's own frame (origin = wrist, -y = along the forearm). */
const GripHand: React.FC<{grip: number; W: number; seed: string}> = ({grip, W, seed}) => {
  // the cuff band, the back of the hand, four knuckle bumps (curled over the lock's edge when gripping), the thumb lobe
  // (spread while reaching, pressed onto the lock's face when gripping)
  const cuff = rectPath(-11, -3, 22, 7);
  const palm = `M-10 -3C-12 -10 -11 -19 -7 -22L7 -22C11 -19 12 -10 10 -3Z`;
  const kn = grip > 0.5 ? -24 : -28;
  const knuckles = [-6.3, -2.1, 2.1, 6.3].map((x, i) => blob(x, kn + (i === 0 || i === 3 ? 1.5 : 0), 2.6, grip > 0.5 ? 3 : 4.6, {seed: `${seed}/k${i}`})).join('');
  const thAng = lerp(-58, -22, grip);
  const th = blob(0, -7.5, 3.6, 8, {seed: `${seed}/th`});
  const thumbM = mat.compose(mat.translate(-9, -8), mat.rotate(thAng));
  return (
    <>
      <XG m={thumbM}>
        <Fill d={th} color={SKIN} offset={false} mode="none" seed={`${seed}/thf`} />
        <Ink d={th} width={W * 0.8} taper={false} seed={`${seed}/thi`} />
      </XG>
      <Fill d={palm + knuckles} color={SKIN} offset={false} mode="none" seed={`${seed}/pf`} />
      <Ink d={palm + knuckles} width={W * 0.8} taper={false} seed={`${seed}/pi`} />
      {grip > 0.5 ? <Ink d={`M-5 -15q5 2 10 0`} width={W * 0.55} taper={false} vary={0} seed={`${seed}/crease`} /> : null}
      <Fill d={cuff} color={palette.tan} offset={false} mode="none" seed={`${seed}/cf`} />
      <Ink d={cuff} width={W * 0.8} taper={false} seed={`${seed}/ci`} />
    </>
  );
};

/** The overlay (draw right AFTER the kit <Keeper/> with the same spec, inside the same transforms). */
export const KeeperDetail: React.FC<KeeperSpec> = (p) => {
  const t = useTime();
  const f = frameOf(t, p);
  if (!f) return null;
  const {g, s, m} = f;
  const hw = g.w / 2;
  const h = g.h;
  const W = 3.4 / s; // the kit's inkFor(h >= 120) = 3.4 px, local
  const R = Math.min(g.w * g.round, h * 0.8);
  const ys = -h + R * 0.62;
  // the hanging sleeve (-x side): seam, two fold ticks, cuff, the hand
  const seam = `M${-(hw - 12)} ${ys}Q${-(hw - 8)} ${-h * 0.45} ${-(hw - 5)} -9`;
  const folds = `M${-hw + 6} -50l7 -4M${-hw + 7} -40l8 -3`;
  const cuffY = -6;
  const hand = blob(-(hw + 1), 9, 6.5, 8.5, {seed: `${p.seed}/hh`});
  const thumbNotch = `M${-(hw + 1) + 4} 4q3 3 1 7`;
  // the jacket skirt below the belt with a back vent
  const fl = hw * 1.07;
  const skirt = `M${-fl} -3L${fl} -3L${fl + 3} 15L3 15L0 8L-3 15L${-fl - 3} 15Z`;
  const skirtI = `M${fl} -3L${fl + 3} 15L3 15L0 8L-3 15L${-fl - 3} 15L${-fl} -3M0 8V-6`;
  // the raised arm (as the kit's: same shoulder, same hand point incl. the install strokes)
  const q = raiseQ(t, p.reachAt, p.lowerAt);
  const work = t >= p.installAt && t < p.installAt + p.installDur ? Math.sin((t - p.installAt) * 40) * 4 : 0;
  const sh: Pt = [g.w * 0.34, -h * 0.8];
  const hp: Pt = [lerp(g.w * 0.5, g.w * 0.66, q) + work, lerp(-h * 0.05, -h * 1.18, q)];
  const ang = (Math.atan2(hp[1] - sh[1], hp[0] - sh[0]) * 180) / Math.PI;
  const grip = t >= p.gripAt ? Math.min(1, (t - p.gripAt) / 0.06) : 0;
  return (
    <XG m={m}>
      {/* skirt + vent (under the arms, over the legs' tops) */}
      <Fill d={skirt} color={palette.sand} offset={false} mode="none" seed={`${p.seed}/skirt`} />
      <Ink d={skirtI} width={W} taper={false} seed={`${p.seed}/skirtI`} />
      {p.rimAt !== undefined && t >= p.rimAt ? (
        <Ink d={`M${-(hw - 4)} -12V${ys}Q${-(hw - 4)} ${-h + 4} ${-(hw - R * 0.9)} ${-h + 4}`} width={W * 0.95} color={palette.cream} taper={false} vary={0} seed={`${p.seed}/rim`} />
      ) : null}
      {/* the back yoke seam across the shoulders */}
      <Ink d={`M${-(hw - 6)} ${ys}Q0 ${ys + 8} ${hw - 6} ${ys}`} width={W * 0.75} taper={false} seed={`${p.seed}/yoke`} />
      {/* the hanging sleeve + hand */}
      <Ink d={seam + folds + `M${-(hw + 0.5)} ${cuffY}L${-(hw - 13)} ${cuffY + 1}`} width={W * 0.75} taper={false} seed={`${p.seed}/sleeve`} />
      <Fill d={hand} color={SKIN} offset={false} mode="none" seed={`${p.seed}/hhf`} />
      <Ink d={hand + thumbNotch} width={W * 0.8} taper={false} seed={`${p.seed}/hhi`} />
      {q > 0.02 ? (
        <>
          <FigureArm sh={sh} hand={hp} w={25} coat={palette.sand} W={W * 0.9} hand2={false} seed={`${p.seed}/arm2`} />
          <XG m={mat.compose(mat.translate(hp[0], hp[1]), mat.rotate(ang + 90))}>
            <GripHand grip={grip} W={W} seed={`${p.seed}/grip`} />
          </XG>
        </>
      ) : null}
    </XG>
  );
};
