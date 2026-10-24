// scene02/DiagramLock.tsx — the PHP lock as a BLUEPRINT DETAIL, built from the props-lane Lock's own geometry (LOCK,
// same box / cover / guide / bolt / strike / socket: the S01 lock box and this drawing are one design), with the extra
// S02 mechanics the shared Lock does not have yet (props-lane request in docs/scenes/S02.md):
//   - the CLOSED cover with its keyhole in ink on white (the match-cut frame reads as S01's lock box),
//   - the cover swinging open on its hinge (`coverOpenAt`), shown open as a DASHED outline + a dashed swing arc,
//   - a THUMB-TURN on a cam link to the bolt; `turnAt` turns it 90 deg (0.2 s) and the bolt retracts all the way,
//   - the bolt test (`boltTestAt`: shoots 0.2 s, stops SHORT of the socket 9 units away, knocks back 3 units),
//   - the gap bracket + ring (`gapMarkAt`),
//   - Bit living in the socket (`bit`): camouflaged as the socket's ink until he peeks out, cowers, ducks, pops back.
// Anchor = box centre; size = box height (world px). Local units: the box is 80 x 100 (LOCK.box).

import React, {useId} from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, prog, springAt, springs, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {arc, circle, line, roundRect, Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {LOCK} from '../shared/props/Lock';
import {Bit} from '../shared/props/Bit';
import {PropRoot} from '../shared/props/common';

/** Thumb-turn pivot (local units): in the cavity above the bolt, so a hand from the upper right reaches it without
 *  covering the gap. */
export const THUMB: Pt = [-9, -26];

export type DiagramBit = {
  /** Size in lock-local units (body length). */
  size?: number;
  /** He slides out of the socket into the gap (0.2 s, outBack). */
  peekAt?: number;
  /** Antennae down / cower (squash about his feet) and a look up at the hand. */
  cowerAt?: number;
  /** He ducks back into the socket (0.14 s). */
  hideAt?: number;
  /** He pops back out (0.18 s). */
  popAt?: number;
};

export type DiagramLockProps = {
  x: number;
  y: number;
  /** Box height in world px (width 0.8 x). */
  size: number;
  /** Box ink in world px. */
  ink?: number;
  coverOpenAt?: number;
  boltTestAt?: number;
  gapMarkAt?: number;
  turnAt?: number;
  bit?: DiagramBit;
  seed?: string;
};

const f2 = (v: number) => v.toFixed(2);

/** Local bolt tip x at time t. */
export function boltTip(t: number, testAt?: number, turnAt?: number): number {
  let tip: number = LOCK.tip.retracted;
  if (testAt !== undefined) {
    const q = prog(t, testAt, 0.2, E.outCubic);
    const dt = t - testAt - 0.2;
    const knock = dt > 0 && dt < 0.14 ? -Math.sin((dt / 0.14) * Math.PI) * 3 : 0;
    tip = lerp(LOCK.tip.retracted, LOCK.tip.short, q) + knock;
  }
  if (turnAt !== undefined && t >= turnAt) {
    const hb = LOCK.housing[0] + LOCK.housing[2];
    tip = lerp(tip, hb, prog(t, turnAt, 0.2, E.inOutCubic));
  }
  return tip;
}

export const DiagramLock: React.FC<DiagramLockProps> = ({x, y, size, ink = 3.4, coverOpenAt, boltTestAt, gapMarkAt, turnAt, bit, seed = 's2lock'}) => {
  const t = useTime();
  const uid = 'dl' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const s = size / LOCK.h;
  const W = ink / s; // local ink
  const [bx0, by0, bw, bh] = LOCK.box;
  const [cx0, cy0, cw, ch] = LOCK.cover;
  const [hx, hy0, hw, hh] = LOCK.housing;
  const hb = hx + hw;
  const br = LOCK.boltR;
  const st = LOCK.strike;
  const sl = LOCK.slot;
  const rm = LOCK.rim;

  // ---- cover swing: scaleX 1 -> edge-on -> -0.3 about the hinge (0.2 s)
  const open = coverOpenAt === undefined ? 0 : prog(t, coverOpenAt, 0.2, E.inOutSine);
  const coverSx = 1 - 1.3 * open;
  const swung = open >= 1;

  // ---- bolt
  const tip = boltTip(t, boltTestAt, turnAt);
  const boltL = Math.max(0, tip - hb);
  const barD = (x0: number, x1: number) => {
    const bev = Math.min(2.4, Math.max(0, x1 - x0) * 0.4);
    return `M${f2(x0)} ${-br}H${f2(x1 - bev)}L${f2(x1)} ${f2(-br + bev)}V${f2(br - bev)}L${f2(x1 - bev)} ${br}H${f2(x0)}`;
  };

  // ---- thumb-turn
  const turn = turnAt === undefined ? 0 : prog(t, turnAt, 0.2, E.inOutCubic);
  const knobRot = 90 * turn;

  const mech: React.ReactNode[] = [];
  // cavity outline + guide + strike "C" round the socket + socket inner edge
  mech.push(<Ink key="cav" d={`M${cx0} ${cy0}H${cx0 + cw}V${cy0 + ch}H${cx0}Z`} width={W * 0.55} taper={false} vary={0} seed={`${seed}/cav`} />);
  const strikeI = `M${st[0]} ${st[1]}H${st[0] + st[2]}V${st[1] + st[3]}H${st[0]}V${rm[1] + rm[3]}H${rm[0] + rm[2]}V${rm[1]}H${st[0]}Z`;
  mech.push(<Fill key="strikeF" d={`M${st[0]} ${st[1]}H${st[0] + st[2]}V${st[1] + st[3]}H${st[0]}Z`} color={palette.white} offset={false} mode="none" seed={`${seed}/stf`} />);
  mech.push(<Ink key="mech" d={`M${hx} ${hy0}H${hb}V${hy0 + hh}H${hx}Z` + strikeI} width={W * 0.62} taper={false} vary={0} seed={`${seed}/mech`} />);
  mech.push(<Ink key="slot" d={`M${sl[0]} ${sl[1]}H${sl[0] + sl[2]}V${sl[1] + sl[3]}H${sl[0]}`} width={W * 0.42} taper={false} vary={0} seed={`${seed}/slot`} />);
  // centre line (dash-dot) through the bolt axis
  mech.push(<Ink key="cl" d={`M-48 0H-40M-36 0H-34M-30 0H-20M-16 0H-14M-10 0H0M4 0H6M10 0H20M24 0H26M30 0H40M44 0H48`} width={W * 0.3} taper={false} order="all" vary={0} seed={`${seed}/cl`} />);
  // the bar bolt: white with an ink outline and a groove line
  if (boltL > 0.3) {
    mech.push(<Fill key="boltF" d={barD(hb, tip) + 'Z'} color={palette.white} offset={false} mode="none" seed={`${seed}/bf`} />);
    mech.push(<Ink key="bolt" d={barD(hb, tip) + (boltL > 8 ? `M${hb + 2} ${f2(-br + 3.4)}H${f2(tip - 4)}` : '')} width={W * 0.62} taper={false} vary={0} seed={`${seed}/bolt`} />);
  }
  // cam link: thumb-turn pivot down to the bolt's top edge (it follows the bolt)
  const linkX = Math.max(hb + 1.5, Math.min(tip - 6, THUMB[0] + 4));
  mech.push(<Ink key="link" d={`M${THUMB[0]} ${THUMB[1]}L${f2(linkX)} ${-br}`} width={W * 0.45} taper={false} vary={0} seed={`${seed}/lk`} />);
  // thumb-turn: a disc with a bar knob (vertical at rest, turns 90 deg)
  mech.push(
    <XG key="thumb" m={mat.compose(mat.translate(THUMB[0], THUMB[1]), mat.rotate(knobRot))}>
      <Fill d={`M-5.5 0a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0Z`} color={palette.white} offset={false} mode="none" seed={`${seed}/tdF`} />
      <Ink d={circle(0, 0, 5.5, {seed: `${seed}/td`, overlap: 8})} width={W * 0.5} taper={false} vary={0} seed={`${seed}/td`} />
      <Fill d={roundRect(-2.6, -9.5, 5.2, 19, 2.6)} color={palette.white} offset={false} mode="none" seed={`${seed}/tkF`} />
      <Ink d={roundRect(-2.6, -9.5, 5.2, 19, 2.6)} width={W * 0.55} taper={false} vary={0} seed={`${seed}/tk`} />
    </XG>,
  );

  // ---- Bit in the socket (clipped at the socket mouth: the part inside the strike is hidden)
  let bitNode: React.ReactNode = null;
  if (bit) {
    const bs = bit.size ?? 26;
    const L = bs; // body length in local units (Bit design 20 -> bs)
    // how far out of the socket (0 = only the antenna tips at the mouth, 1 = head + front half in the gap)
    let out = 0.06;
    if (bit.peekAt !== undefined && t >= bit.peekAt) out = lerp(0.06, 1, springAt(t, bit.peekAt, springs.snappy));
    let squashY = 1;
    if (bit.hideAt !== undefined && t >= bit.hideAt) {
      const q = prog(t, bit.hideAt, 0.14, E.inCubic);
      out = lerp(out, -0.1, q);
      squashY = lerp(1, 0.6, Math.min(1, q * 1.6));
    }
    if (bit.popAt !== undefined && t >= bit.popAt) {
      out = lerp(-0.1, 0.85, springAt(t, bit.popAt, springs.snappy));
      squashY = 1;
    }
    let cower = 1;
    if (bit.cowerAt !== undefined && t >= bit.cowerAt && (bit.hideAt === undefined || t < bit.hideAt)) cower = lerp(1, 0.8, prog(t, bit.cowerAt, 0.08, E.outCubic));
    // Bit faces LEFT (flip): his feet anchor slides left out of the socket; at out = 1 his head reaches the bolt tip
    const mouth = sl[0];
    const ax = mouth + L * 0.62 - out * L * 0.62;
    const cowering = bit.cowerAt !== undefined && t >= bit.cowerAt;
    bitNode = (
      <g key="bit">
        <defs>
          <clipPath id={`${uid}b`}>
            <rect x={-60} y={-60} width={mouth + 60 + 0.4} height={120} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${uid}b)`}>
          <XG m={mat.about(mat.scale(1 + (1 - cower) * 0.4, squashY * cower), ax, 9)}>
            <Bit x={ax} y={9} size={L} flip look={cowering ? 'up' : 'auto'} seed={`${seed}/bit`} />
          </XG>
        </g>
      </g>
    );
  }

  // ---- gap bracket + ring
  const marks: React.ReactNode[] = [];
  if (gapMarkAt !== undefined && t >= gapMarkAt) {
    const x0 = LOCK.tip.short;
    const x1 = st[0];
    const yb = st[1] - 5;
    let dash = `M${x0} ${yb - 3.5}V${yb + 3.5}M${x1} ${yb - 3.5}V${yb + 3.5}`;
    for (let xx = x0 + 1.3; xx < x1 - 1; xx += 3.4) dash += `M${xx.toFixed(1)} ${yb}H${Math.min(x1 - 1.3, xx + 1.8).toFixed(1)}`;
    marks.push(<Ink key="gapB" d={dash} at={gapMarkAt} dur={0.1} width={W * 0.5} taper={false} seed={`${seed}/gb`} order="all" />);
    marks.push(<Ink key="gapR" d={circle(LOCK.gap[0] - 1, 1, 15, {seed: `${seed}/gr`, overlap: 26})} at={gapMarkAt + 0.04} dur={0.13} width={W * 0.62} taper={false} seed={`${seed}/gr`} />);
  }

  // ---- cover (closed plate with the keyhole; swinging; then a dashed outline at its open position + swing arc)
  const cover: React.ReactNode[] = [];
  const coverD = roundRect(cx0, cy0, cw, ch, 4);
  if (!swung && Math.abs(coverSx) > 0.03) {
    cover.push(
      <XG key="cov" m={mat.about(mat.scale(coverSx, 1), cx0, 0)}>
        <Fill d={coverD} color={palette.white} offset={false} mode="none" seed={`${seed}/cvF`} />
        {coverSx > 0.3 ? <Fill d={`M0 -13a7 7 0 1 0 0.01 0Z` + `M-3.4 -2L-5.5 13H5.5L3.4 -2Z`} color={palette.ink} offset={false} mode="none" seed={`${seed}/kh`} lookExempt /> : null}
        <Ink d={roundRect(cx0, cy0, cw, ch, 4, {closed: false, seed: `${seed}/cvi`})} width={W * 0.62} vary={0} seed={`${seed}/cvi`} />
      </XG>,
    );
  } else if (Math.abs(coverSx) <= 0.03) {
    cover.push(<Ink key="covE" d={`M${cx0} ${cy0 + 2}V${cy0 + ch - 2}`} width={W * 0.7} taper={false} vary={0} seed={`${seed}/ce`} />);
  }
  if (coverOpenAt !== undefined && t >= coverOpenAt + 0.1) {
    // the swing arc: from the free edge round the hinge (dashed, drawn on with the swing)
    const r = cw * 0.92;
    cover.push(<Ink key="arc" d={arc(cx0, cy0 - 2, r, -8, -172, {seed: `${seed}/arc`})} width={W * 0.38} dash="2.6 2.4" taper={false} seed={`${seed}/arc`} />);
  }
  if (swung) {
    const ow = cw * 0.3;
    const od = roundRect(cx0 - ow, cy0, ow, ch, 2.5);
    cover.push(<Fill key="coF" d={od} color={palette.white} offset={false} mode="none" seed={`${seed}/coF`} />);
    cover.push(<Ink key="coI" d={od} width={W * 0.5} dash="4 3.2" taper={false} seed={`${seed}/coI`} />);
  }

  // ---- box, screws, hinge ticks, dimension line under the box
  const box = roundRect(bx0, by0, bw, bh, 9, {closed: false, seed: `${seed}/box`});
  const screws = LOCK.screws.map(([sx, sy]) => circle(sx, sy, 3.6, {seed: `${seed}/sc${sy}`, overlap: 8}) + `M${sx - 2.4} ${sy + 1.4}L${sx + 2.4} ${sy - 1.4}`).join('');
  const dim = line(-40, 62, 40, 62, {over: [0, 0], seed: `${seed}/dm`}) + `M-40 56V68M40 56V68M-40 62L-33 59M-40 62L-33 65M40 62L33 59M40 62L33 65`;

  return (
    <PropRoot x={x} y={y} s={s}>
      <Fill d={roundRect(bx0, by0, bw, bh, 9)} color={palette.white} offset={false} mode="none" seed={`${seed}/body`} />
      {mech}
      {bitNode}
      {marks}
      {cover}
      <Ink d={box} width={W} vary={0} seed={`${seed}/boxI`} />
      <Ink d={screws} width={W * 0.45} taper={false} vary={0} seed={`${seed}/scr`} />
      <Ink d={`M${cx0 - 3} -26V-17M${cx0 - 3} 17V26`} width={W * 0.6} taper={false} order="all" vary={0} seed={`${seed}/hng`} />
      <Ink d={dim} width={W * 0.32} taper={false} vary={0} seed={`${seed}/dim`} />
    </PropRoot>
  );
};
