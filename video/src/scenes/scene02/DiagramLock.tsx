// scene02/DiagramLock.tsx — the PHP lock as a BLUEPRINT DETAIL, built from the props-lane Lock's own geometry (LOCK,
// same box / cover / guide / bolt / strike / socket: the S01 lock box and this drawing are one design), with the extra
// S02 mechanics the shared Lock does not have yet (props-lane request in docs/scenes/S02.md):
//   - the CLOSED cover with its keyhole in ink on white (the match-cut frame reads as S01's lock box),
//   - the cover swinging open on its hinge (`coverOpenAt`, 0.2 s out(cubic)), shown open as a DASHED outline + a
//     dashed swing arc,
//   - a THUMB-TURN on a cam link to the bolt; `turnAt` turns it 90 deg (0.2 s out(cubic)), the bolt retracts all the way,
//   - the bolt test (`boltTestAt`: shoots at constant speed 0.13 s and SLAMS to a stop SHORT of the socket 9 units away,
//     rebounds 2.6 units (~7 px on screen in the x2.8 loupe) and a second small bounce),
//   - the gap mark (`gapMarkAt`): the gap floods peach, a bold ink bracket over it, a ring round it,
//   - Bit living in the socket (`bit`): camouflaged as the socket's ink until he peeks out, cowers, ducks, pops back.
// Polish (review: 'the focal object reads as a vector UI icon'): the plate and every mechanism outline are pen strokes
// (one Ink per edge, width vary 0.3, small overshoots and bows), the box's top-right corner is left OPEN with both edges
// overshooting (~7 px on screen in the loupe), the mint cavity / cream bolt / peach gap fills sit ~3 px off their
// outlines (the props misregistration rule), the bug ring is an open pen loop with an overlapping tail; `plate` fills
// the closed plate sand for the match frames (S01's lock box is a sand plate) and pops it to white; on the turn the
// gap bracket shrink-pops off and the bolt slides back to a visible stub with two ink motion ticks ('open').
// Anchor = box centre; size = box height (world px). Local units: the box is 80 x 100 (LOCK.box).

import React, {useId} from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, prog, springAt, springs, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {arc, circle, line, rect, roundRect, smooth, Pt} from '../../lib/sketch';
import {rng} from '../../lib/rng';
import {mat, XG} from '../../lib/xf';
import {LOCK} from '../shared/props/Lock';
import {Bit, bitPath} from '../shared/props/Bit';
import {PropRoot} from '../shared/props/common';

/** Thumb-turn pivot (local units): in the cavity's upper right, above the strike, so a hand from the upper right
 *  pinches it without covering the bolt, the gap or Bit. */
export const THUMB: Pt = [11, -27];

export type DiagramBit = {
  /** Size in lock-local units (body length). */
  size?: number;
  /** He slides out of the socket into the gap (0.2 s, outBack). */
  peekAt?: number;
  /** Hook pass 2 ('bug': Bit IS the bug): from peekAt he pops x1 -> x1.35 (out(cubic)), peaking ON hitAt with an
   *  antenna FLICK (his head and antennae snap up 16 deg about his feet, the antenna tips reach the thumb-turn), then
   *  settles to x1.15 (a damped bounce, ~0.15 s) and stays that size. */
  hitAt?: number;
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
  /** Draw ONLY the thumb-turn (the layer S02 puts above the pinching hand, so the knob shows between the fingers). */
  knobOnly?: boolean;
  /** The closed plate's fill until `until` (then it pops to white): S01's lock box colour on the match frames. */
  plate?: {color: string; until: number};
  seed?: string;
};

const f2 = (v: number) => v.toFixed(2);

/** Where the bolt slides back to on the turn: a 7-unit stub out of the guide (~19 px in the loupe), so 'open' reads. */
export const BOLT_OPEN = -14;
/** Fill misregistration in lock-local units (~3 px on screen in the x2.8 loupe). */
const MIS: [number, number] = [1.1, 0.8];
/** Hand-drawn mechanism strokes (lock-local units): small overshoots, a hair of bow and jitter (a ruler-free pen). */
const PEN = {over: [0.5, 1.3] as [number, number], jitter: 0.22, bow: 0.3, breaks: false};
const penRect = (x: number, y: number, w: number, h: number, seed: string) => rect(x, y, w, h, {...PEN, seed});
const penLine = (x0: number, y0: number, x1: number, y1: number, seed: string) => line(x0, y0, x1, y1, {...PEN, seed});

/** The box outline as four pen strokes (TL corner closes with a small overlap, the TR corner is OPEN: the top edge runs
 *  ~2.5 units past the right edge and the right edge starts ~2.7 above the top). Box [-40, -50, 80, 100], r 9. */
function boxEdges(seed: string): string[] {
  const r = rng(`${seed}/edges`);
  const j = () => r.range(-0.35, 0.35);
  return [
    `M-31 ${f2(-50 + j())}Q${f2(5 + j())} ${f2(-50.9 + j())} 42.6 ${f2(-50.3 + j())}`,
    `M${f2(40.2 + j())} -52.7Q${f2(40.9 + j())} -5 40 41A9 9 0 0 1 31 50`,
    `M31 ${f2(50.2 + j())}Q0 ${f2(50.8 + j())} -31 50A9 9 0 0 1 -40 41`,
    `M-40 41Q${f2(-40.7 + j())} -4 -40 -41A9 9 0 0 1 -31 -50L-27.4 ${f2(-50.1 + j())}`,
  ];
}

/** An open pen loop (lock-local): it sweeps 360 + overlap deg, its radius creeping out so the tail overlaps OUTSIDE the
 *  start (a ring drawn by hand, never a closed ellipse). */
function penRing(cx: number, cy: number, rad: number, overlap: number, seed: string): string {
  const r = rng(`${seed}/ring`);
  const a0 = r.range(0, 360);
  const ph = r.range(0, 6.28);
  const sweep = 360 + overlap;
  const n = 30;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = ((a0 + sweep * u) * Math.PI) / 180;
    const f = 0.955 + 0.12 * u + 0.03 * Math.sin(2 * a + ph);
    pts.push([cx + Math.cos(a) * rad * f, cy + Math.sin(a) * rad * f * 0.96]);
  }
  return smooth(pts);
}

/** Local bolt tip x at time t. */
export const BOLT_SHOOT = 0.13;
export function boltTip(t: number, testAt?: number, turnAt?: number): number {
  let tip: number = LOCK.tip.retracted;
  if (testAt !== undefined) {
    // constant speed out of the guide (moving from the first frame) and an abrupt stop = a slam; then it rebounds
    // 2.6 units off the stop (0.11 s) and bounces once more (0.8 units, 0.08 s): it hits something and stays short
    const q = prog(t, testAt, BOLT_SHOOT);
    const dt = t - testAt - BOLT_SHOOT;
    let knock = 0;
    if (dt > 0 && dt < 0.11) knock = -Math.sin(Math.pow(dt / 0.11, 0.7) * Math.PI) * 2.6;
    else if (dt >= 0.11 && dt < 0.19) knock = -Math.sin(((dt - 0.11) / 0.08) * Math.PI) * 0.8;
    tip = lerp(LOCK.tip.retracted, LOCK.tip.short, q) + knock;
  }
  if (turnAt !== undefined && t >= turnAt) tip = lerp(tip, BOLT_OPEN, prog(t, turnAt, 0.2, E.outCubic));
  return tip;
}

export const DiagramLock: React.FC<DiagramLockProps> = ({x, y, size, ink = 3.4, coverOpenAt, boltTestAt, gapMarkAt, turnAt, bit, knobOnly = false, plate, seed = 's2lock'}) => {
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
  const open = coverOpenAt === undefined ? 0 : prog(t, coverOpenAt, 0.2, E.outCubic);
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
  const turn = turnAt === undefined ? 0 : prog(t, turnAt, 0.2, E.outCubic);
  const knobRot = 90 * turn;
  const knob = (
    <XG key="thumb" m={mat.compose(mat.translate(THUMB[0], THUMB[1]), mat.rotate(knobRot))}>
      <Fill d={`M-5.5 0a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0Z`} color={palette.white} offset={false} mode="none" seed={`${seed}/tdF`} />
      <Ink d={circle(0, 0, 5.5, {seed: `${seed}/td`, overlap: 8})} width={W * 0.5} taper={false} vary={0} seed={`${seed}/td`} />
      <Fill d={roundRect(-3, -10, 6, 20, 3)} color={palette.cream} offset={false} mode="none" seed={`${seed}/tkF`} />
      <Ink d={roundRect(-3, -10, 6, 20, 3)} width={W * 0.6} taper={false} vary={0} seed={`${seed}/tk`} />
    </XG>
  );
  if (knobOnly) {
    return (
      <PropRoot x={x} y={y} s={s}>
        {knob}
      </PropRoot>
    );
  }

  const mech: React.ReactNode[] = [];
  // the SECTION: a pale mint cavity (ink Bit and the ink outlines read on it), white guide and strike, the tealDark
  // socket lined with a cream rim (the hole the bolt never reaches = the highest-contrast thing), a cream bar
  mech.push(<Fill key="cavF" d={`M${cx0} ${cy0}H${cx0 + cw}V${cy0 + ch}H${cx0}Z`} color={palette.mintPale} offset={MIS} mode="none" seed={`${seed}/cvf`} />);
  mech.push(<Fill key="housF" d={`M${hx} ${hy0}H${hb}V${hy0 + hh}H${hx}Z`} color={palette.white} offset={false} mode="none" seed={`${seed}/hsf`} />);
  mech.push(<Fill key="strikeF" d={`M${st[0]} ${st[1]}H${st[0] + st[2]}V${st[1] + st[3]}H${st[0]}Z`} color={palette.white} offset={false} mode="none" seed={`${seed}/stf`} />);
  mech.push(<Fill key="rimF" d={`M${rm[0]} ${rm[1]}H${rm[0] + rm[2]}V${rm[1] + rm[3]}H${rm[0]}Z`} color={palette.cream} offset={false} mode="none" seed={`${seed}/rmf`} />);
  mech.push(<Fill key="slotF" d={`M${sl[0]} ${sl[1]}H${sl[0] + sl[2]}V${sl[1] + sl[3]}H${sl[0]}Z`} color={palette.tealDark} offset={false} mode="none" seed={`${seed}/slf`} />);
  mech.push(<Ink key="cav" d={penRect(cx0, cy0, cw, ch, `${seed}/cav`)} width={W * 0.5} taper={false} vary={0.3} seed={`${seed}/cav`} />);
  // the guide and the strike (with the socket's rim notch in its left face): pen strokes, one Ink per piece
  const strikeI =
    penLine(st[0], st[1], st[0] + st[2], st[1], `${seed}/st1`) +
    penLine(st[0] + st[2], st[1], st[0] + st[2], st[1] + st[3], `${seed}/st2`) +
    penLine(st[0] + st[2], st[1] + st[3], st[0], st[1] + st[3], `${seed}/st3`) +
    penLine(st[0], st[1], st[0], rm[1], `${seed}/st4`) +
    penLine(st[0], rm[1] + rm[3], st[0], st[1] + st[3], `${seed}/st5`) +
    `M${st[0]} ${rm[1]}H${f2(rm[0] + rm[2] + 0.3)}V${f2(rm[1] + rm[3] + 0.2)}H${f2(st[0] - 0.6)}`;
  mech.push(<Ink key="hous" d={penRect(hx, hy0, hw, hh, `${seed}/hs`)} width={W * 0.8} taper={false} vary={0.3} seed={`${seed}/hous`} />);
  mech.push(<Ink key="mech" d={strikeI} width={W * 0.8} taper={false} vary={0.3} seed={`${seed}/mech`} />);
  // centre line (dash-dot) on the bolt axis: only its blueprint ticks outside the box
  mech.push(<Ink key="cl" d={`M-50 0H-42M50 0H42`} width={W * 0.3} taper={false} order="all" vary={0} seed={`${seed}/cl`} />);
  // the bar bolt: cream with an ink outline and a groove line
  if (boltL > 0.3) {
    mech.push(<Fill key="boltF" d={barD(hb, tip) + 'Z'} color={palette.cream} offset={MIS} mode="none" seed={`${seed}/bf`} />);
    mech.push(<Ink key="bolt" d={barD(hb, tip)} width={W * 0.8} taper={false} vary={0.3} seed={`${seed}/bolt`} />);
    if (boltL > 8) mech.push(<Ink key="boltG" d={`M${hb + 2} ${f2(-br + 3.4)}H${f2(tip - 4)}`} width={W * 0.4} taper={false} vary={0} seed={`${seed}/boltG`} />);
  }
  // cam link: from the thumb-turn pivot down to the bolt's top edge (the joint follows the bolt as it moves)
  const linkX = Math.max(hb + 1.5, Math.min(tip - 8, -4));
  // (polish: 0.42 -> 0.52 W, ~2.5 px in the loupe: it read as a stray scratch at phone size)
  mech.push(<Ink key="link" d={`M${THUMB[0]} ${THUMB[1]}L${f2(linkX)} ${-br}`} width={W * 0.52} taper={false} vary={0} seed={`${seed}/lk`} />);
  mech.push(<Ink key="linkJ" d={circle(linkX, -br - 1.2, 1.7, {seed: `${seed}/lj`})} width={W * 0.45} taper={false} vary={0} seed={`${seed}/lj`} />);
  // 'open': on the turn the bolt slides back to its stub and two short ink motion ticks stay behind its tip
  if (turnAt !== undefined && t >= turnAt + 0.1) {
    const tx = BOLT_OPEN + 3;
    const ticks = `M${tx} -2.6H${tx + 8}M${tx + 1.5} 2.8H${tx + 7.5}`;
    mech.push(<Ink key="mvT" d={ticks} at={turnAt + 0.1} dur={0.06} width={W * 0.5} taper={false} vary={0.2} seed={`${seed}/mv`} />);
  }
  // thumb-turn: a disc with a bar knob (vertical at rest, turns 90 deg)
  mech.push(knob);

  // ---- Bit in the socket (clipped at the socket mouth: the part inside the strike is hidden)
  let bitNode: React.ReactNode = null;
  if (bit) {
    const bs = bit.size ?? 26;
    const L = bs; // body length in local units (Bit design 20 -> bs)
    // how far out of the socket (0 = only the antenna tips at the mouth, 1 = head + front half in the gap)
    let out = 0.06;
    if (bit.peekAt !== undefined && t >= bit.peekAt) out = lerp(0.06, 1.1, springAt(t, bit.peekAt, springs.snappy));
    let squashY = 1;
    if (bit.hideAt !== undefined && t >= bit.hideAt) {
      const q = prog(t, bit.hideAt, 0.14, E.outQuad);
      out = lerp(out, -0.1, q);
      squashY = lerp(1, 0.6, Math.min(1, q * 1.6));
    }
    if (bit.popAt !== undefined && t >= bit.popAt) {
      out = lerp(-0.1, 1.0, springAt(t, bit.popAt, springs.snappy));
      squashY = 1;
    }
    let cower = 1;
    if (bit.cowerAt !== undefined && t >= bit.cowerAt && (bit.hideAt === undefined || t < bit.hideAt)) cower = lerp(1, 0.8, prog(t, bit.cowerAt, 0.08, E.outCubic));
    // Bit faces LEFT (flip): his feet anchor slides left out of the socket; at out = 1 his head reaches the bolt tip
    const mouth = sl[0];
    const ax = mouth + L * 0.62 - out * L * 0.62;
    const cowering = bit.cowerAt !== undefined && t >= bit.cowerAt;
    // the 'bug' hit: scale pop (x1.35 ON hitAt, settling to x1.15) and the antenna flick (a head-up snap about his feet,
    // peaking ON hitAt, sprung back with one small overshoot); Bit faces left, so + deg lifts his head
    let pop = 1;
    let flick = 0;
    if (bit.hitAt !== undefined && bit.peekAt !== undefined && t >= bit.peekAt) {
      if (t < bit.hitAt) {
        const q = prog(t, bit.peekAt, bit.hitAt - bit.peekAt, E.outCubic);
        pop = 1 + 0.35 * q;
        flick = 16 * prog(t, bit.hitAt - 0.05, 0.05, E.outCubic);
      } else {
        const u = t - bit.hitAt;
        pop = 1.15 + 0.2 * Math.exp(-u / 0.05) * Math.cos((2 * Math.PI * u) / 0.2);
        flick = 16 * Math.exp(-u / 0.045) * Math.cos((2 * Math.PI * u) / 0.16);
      }
    }
    bitNode = (
      <g key="bit">
        <defs>
          <clipPath id={`${uid}b`}>
            <rect x={-60} y={-60} width={mouth + 60 + 0.4} height={120} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${uid}b)`}>
          <XG m={mat.compose(mat.about(mat.scale(1 + (1 - cower) * 0.4, squashY * cower), ax, 9), mat.about(mat.compose(mat.scale(pop), mat.rotate(flick)), ax, 9))}>
            {/* a cream rim round his silhouette separates the ink beetle from the dark socket and the lock's ink */}
            <path d={bitPath(ax, 9, L, true)} fill="none" stroke={palette.cream} strokeWidth={W * 0.75} strokeLinejoin="round" />
            <Bit x={ax} y={9} size={L} flip look={cowering ? 'up' : 'auto'} seed={`${seed}/bit`} />
          </XG>
        </g>
      </g>
    );
  }

  // ---- the gap mark: the gap between the short bolt and the socket floods PEACH (under Bit: the bug lives there), a
  // bold ink bracket spans it under the bolt (ticks + a bar with inward arrowheads, blueprint convention, ~4.5 px on
  // screen, over a cream halo) and a big ring (ink over a cream halo: reads on white AND mint) circles it
  const gapFill: React.ReactNode[] = [];
  const marks: React.ReactNode[] = [];
  if (gapMarkAt !== undefined && t >= gapMarkAt) {
    const x0 = LOCK.tip.short;
    const x1 = st[0];
    // the peach gap: between the stopped tip and the socket mouth, from under the thumb-turn down to the bracket (taller
    // than the bolt, so it still shows round Bit when he sits in the gap; it stays once the bolt is retracted)
    gapFill.push(<Fill key="gapF" rect={[x0 + 0.4, -15, x1 - x0 - 0.8, 23]} color={palette.peach} at={gapMarkAt} mode="pop" dur={0.08} offset={MIS} seed={`${seed}/gpf`} />);
    const yb = br + 5.5; // just under the bolt (the thumb-turn sits above it)
    const dim = `M${x0} ${yb - 4}V${yb + 4}M${x1} ${yb - 4}V${yb + 4}M${x0 + 0.8} ${yb}H${x1 - 0.8}` + `M${x0 + 3} ${yb - 2}L${x0 + 0.8} ${yb}L${x0 + 3} ${yb + 2}M${x1 - 3} ${yb - 2}L${x1 - 0.8} ${yb}L${x1 - 3} ${yb + 2}`;
    // the bracket shrink-pops off on the turn (the gap it measured is no longer the point: the bolt is gone)
    const off = turnAt === undefined ? 0 : prog(t, turnAt, 0.08);
    if (off < 1) {
      const k = 1 - 0.8 * E.inQuad(off);
      const bc = (x0 + x1) / 2;
      marks.push(
        <XG key="gapBk" m={mat.about(mat.scale(k), bc, yb)}>
          <Ink d={dim} at={gapMarkAt} dur={0.06} width={W * 1.3} color={palette.cream} taper={false} vary={0} seed={`${seed}/gbh`} order="all" />
          <Ink d={dim} at={gapMarkAt} dur={0.06} width={W * 0.75} taper={false} vary={0} seed={`${seed}/gb`} order="all" />
        </XG>,
      );
    }
    // an open pen loop with a 14 deg tail overlapping outside its start (polish: was a near-perfect ellipse)
    const ring = penRing(LOCK.gap[0], 2, 22, 14, `${seed}/gr`);
    marks.push(<Ink key="gapRh" d={ring} at={gapMarkAt + 0.04} dur={0.13} width={W * 1.25} color={palette.cream} taper={false} vary={0} seed={`${seed}/grh`} />);
    marks.push(<Ink key="gapR" d={ring} at={gapMarkAt + 0.04} dur={0.13} width={W * 0.62} taper vary={0.25} seed={`${seed}/gr`} />);
  }

  // ---- cover (closed plate with the keyhole; swinging; then a dashed outline at its open position + swing arc)
  const cover: React.ReactNode[] = [];
  const coverD = roundRect(cx0, cy0, cw, ch, 4);
  const plateC = plate && t < plate.until ? plate.color : palette.white;
  if (!swung && Math.abs(coverSx) > 0.03) {
    cover.push(
      <XG key="cov" m={mat.about(mat.scale(coverSx, 1), cx0, 0)}>
        <Fill d={coverD} color={plateC} offset={false} mode="none" seed={`${seed}/cvF`} />
        {coverSx > 0.3 ? <Fill d={`M0 -13a7 7 0 1 0 0.01 0Z` + `M-3.4 -2L-5.5 13H5.5L3.4 -2Z`} color={palette.ink} offset={false} mode="none" seed={`${seed}/kh`} lookExempt /> : null}
        <Ink d={roundRect(cx0, cy0, cw, ch, 4, {closed: false, seed: `${seed}/cvi`})} width={W * 0.62} vary={0.3} seed={`${seed}/cvi`} />
      </XG>,
    );
  } else if (Math.abs(coverSx) <= 0.03) {
    cover.push(<Ink key="covE" d={`M${cx0} ${cy0 + 2}V${cy0 + ch - 2}`} width={W * 0.7} taper={false} vary={0} seed={`${seed}/ce`} />);
  }
  if (coverOpenAt !== undefined && t >= coverOpenAt + 0.1) {
    // the swing arc: the free edge's path over the top of the box, ending in a small arrowhead at the open position
    const xa = cx0 + cw - 3;
    const xb = cx0 - cw * 0.3;
    const xc = (xa + xb) / 2;
    const rx = (xa - xb) / 2;
    cover.push(<Ink key="arc" d={arc(xc, cy0 - 2, rx, 9, -4, -176, {seed: `${seed}/arc`})} width={W * 0.36} dash="2.6 2.4" taper={false} seed={`${seed}/arc`} />);
    cover.push(<Ink key="arcH" d={`M${f2(xb - 3.5)} ${f2(cy0 - 7)}L${f2(xb)} ${f2(cy0 - 1)}L${f2(xb + 4.5)} ${f2(cy0 - 5.5)}`} width={W * 0.36} taper={false} seed={`${seed}/arcH`} />);
  }
  if (swung) {
    const ow = cw * 0.3;
    const od = roundRect(cx0 - ow, cy0, ow, ch, 2.5);
    cover.push(<Fill key="coF" d={od} color={palette.white} offset={false} mode="none" seed={`${seed}/coF`} />);
    cover.push(<Ink key="coI" d={od} width={W * 0.5} dash="4 3.2" taper={false} seed={`${seed}/coI`} />);
  }

  // ---- box, screws, hinge ticks, dimension line under the box
  const edges = boxEdges(seed);
  const screws = LOCK.screws.map(([sx, sy]) => circle(sx, sy, 3.6, {seed: `${seed}/sc${sy}`, overlap: 8}) + `M${sx - 2.4} ${sy + 1.4}L${sx + 2.4} ${sy - 1.4}`).join('');
  const dim = line(-40, 62, 40, 62, {over: [0, 0], seed: `${seed}/dm`}) + `M-40 56V68M40 56V68M-40 62L-33 59M-40 62L-33 65M40 62L33 59M40 62L33 65`;

  return (
    <PropRoot x={x} y={y} s={s}>
      <Fill d={roundRect(bx0, by0, bw, bh, 9)} color={plateC} offset={false} mode="none" seed={`${seed}/body`} />
      {mech}
      {gapFill}
      {bitNode}
      {marks}
      {cover}
      {edges.map((e, i) => (
        <Ink key={`bx${i}`} d={e} width={W} vary={0.3} seed={`${seed}/boxI${i}`} />
      ))}
      <Ink d={screws} width={W * 0.45} taper={false} vary={0} seed={`${seed}/scr`} />
      <Ink d={`M${cx0 - 3} -26V-17M${cx0 - 3} 17V26`} width={W * 0.6} taper={false} order="all" vary={0} seed={`${seed}/hng`} />
      <Ink d={dim} width={W * 0.32} taper={false} vary={0} seed={`${seed}/dim`} />
    </PropRoot>
  );
};
