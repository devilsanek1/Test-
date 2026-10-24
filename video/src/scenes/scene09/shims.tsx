// S09 LOCAL STAND-INS for shared-kit pieces requested in docs/storyboard_v3.json "requests" that do not exist yet
// (a later fix round swaps them for the shared versions; same names / props where the request names them):
//   LidCrate      = props LockCrate with `lidAt` / `tagsAt` (the crate of new locks: lid pops, check tags pop up)
//   CartSign      = sets MakersLane `blindSign` re-hung on the MakersCart ('still fixing...' -> struck, 'fixed!')
//   Glint         = a 1-frame-pop four-point sparkle (plaque glint)
// Everything is flat: pops (7 % spring), swings, draw-ons, wipes. No opacity animation anywhere.

import React from 'react';
import {Fill, Ink, palette, prog, springAt, springs, useTime, ease as E, lerp, rect, line, rectPath, roundRect, mat, XG, captionFontStack, useCaptionFont, useXf} from '../../lib';
import {CheckBoxTag, Lock} from '../shared/props';

const f1 = (v: number) => v.toFixed(1);
const f2 = (v: number) => v.toFixed(2);

// ---------------------------------------------------------------- LidCrate (LockCrate lidAt / tagsAt)

export type LidCrateProps = {
  /** Bottom centre (world). */
  x: number;
  y: number;
  /** Crate width (world). Height 0.62 x. Default 70. */
  size?: number;
  n?: number;
  /** The lid swings open (hinged at its back-left end): new locks rise into view. Omit = shut. */
  lidAt?: number;
  /** The crate's cream check tags pop up out of it (0.04 s stagger). */
  tagsAt?: number;
  /** World ink width. */
  ink?: number;
  seed?: string;
};

/** A sand crate of NEW (fixed, sage) locks with a tan lid. Shut: just the box + lid. lidAt: the lid flips open and back
 *  (0.16 s, overshoot) and the locks bob up into the opening; tagsAt: cream check-box tags pop up on sticks. */
export const LidCrate: React.FC<LidCrateProps> = ({x, y, size = 70, n = 3, lidAt, tagsAt, ink = 2.2, seed = 'lidcrate'}) => {
  const t = useTime();
  const w = size;
  const h = size * 0.62;
  const top = y - h;
  const open = lidAt !== undefined && t >= lidAt;
  // lid angle: 0 shut -> -118 deg (stands up and back, past vertical), with a 7 % overshoot spring
  const lidK = lidAt === undefined ? 0 : springAt(t, lidAt, springs.pop);
  const lidAng = -118 * lidK;
  const lockH = size * 0.5;
  const locks: React.ReactNode[] = [];
  if (open) {
    for (let i = 0; i < n; i++) {
      const at = lidAt! + 0.04 + i * 0.04;
      if (t < at) continue;
      const rise = springAt(t, at, springs.pop);
      const lx = x - w / 2 + (w * (i + 0.5)) / n + (i % 2 ? 1.5 : -1.5);
      const peek = lockH * (0.42 + (i % 2 ? 0.08 : 0));
      const ly = top + lockH / 2 - peek * rise + 2;
      locks.push(<Lock key={i} x={lx} y={ly} size={lockH} state="fixed" ink={ink * 0.8} rot={(i - (n - 1) / 2) * 8} seed={`${seed}/l${i}`} />);
    }
  }
  const tags: React.ReactNode[] = [];
  if (tagsAt !== undefined && t >= tagsAt) {
    const m = n + 1;
    for (let i = 0; i < m; i++) {
      const at = tagsAt + i * 0.04;
      if (t < at) continue;
      const tx = x - w / 2 + (w * (i + 0.5)) / m;
      const k = springAt(t, at, springs.pop);
      const stickTop = top - size * (0.62 + (i % 2) * 0.14) * k;
      tags.push(
        <React.Fragment key={i}>
          <Ink d={`M${f1(tx)} ${f1(top + 2)}L${f1(tx + (i - 1.5) * 1.5)} ${f1(stickTop)}`} width={ink * 0.7} taper={false} vary={0} seed={`${seed}/s${i}`} />
          <CheckBoxTag x={tx + (i - 1.5) * 1.5} y={stickTop - size * 0.1} size={size * 0.34} at={at} ink={ink * 0.75} seed={`${seed}/t${i}`} />
        </React.Fragment>,
      );
    }
  }
  const lidW = w + 8;
  const lidD = rectPath(0, -9, lidW, 9);
  return (
    <>
      {open ? <Fill rect={[x - w / 2 + 3, top - 4, w - 6, 8]} color={palette.tealDark} offset={false} mode="snap" seed={`${seed}/hole`} /> : null}
      {tags}
      {locks}
      <Fill rect={[x - w / 2, top, w, h]} color={palette.sand} seed={`${seed}/f`} />
      <Fill rect={[x - w / 2, top, w * 0.13, h]} color={palette.tan} offset={false} mode="snap" seed={`${seed}/sh`} />
      <Ink d={rect(x - w / 2, top, w, h, {seed: `${seed}/o`, over: 4})} width={ink} seed={`${seed}/o`} />
      <Ink d={line(x - w / 2 + 4, top + h * 0.5, x + w / 2 - 4, top + h * 0.5, {over: [0, 0], seed: `${seed}/s1`}) + line(x - w / 2 + w * 0.2, top + 4, x - w / 2 + w * 0.2, y - 4, {over: [0, 0], seed: `${seed}/s2`}) + line(x + w / 2 - w * 0.2, top + 4, x + w / 2 - w * 0.2, y - 4, {over: [0, 0], seed: `${seed}/s3`})} width={ink * 0.65} taper={false} order="all" seed={`${seed}/sl`} />
      {/* the lid, hinged at the back-left top corner */}
      <XG m={mat.compose(mat.translate(x - w / 2 - 4, top), mat.rotate(lidAng))}>
        <Fill d={lidD} color={palette.tan} seed={`${seed}/lid`} />
        <Ink d={rect(0, -9, lidW, 9, {seed: `${seed}/lidI`, over: 3})} width={ink} seed={`${seed}/lidI`} />
      </XG>
    </>
  );
};

// ---------------------------------------------------------------- CartSign (MakersLane blindSign on the MakersCart)

export type CartSignProps = {
  /** Hang point (world): the top of the post the card hangs from. */
  x: number;
  y: number;
  /** Card width (world). */
  w?: number;
  /** Font size (world). */
  fs?: number;
  /** 'still fixing...' gets struck through (draw-on 0.12 s). */
  strikeAt?: number;
  /** 'fixed!' is scribbled beside / under it (L -> R wipe 0.16 s). */
  fixedAt?: number;
  ink?: number;
  seed?: string;
};

/** The workshop blind's sign card, re-hung on the cart: 'still fixing...' (J3 / J4), then J5: struck + 'fixed!'. */
export const CartSign: React.FC<CartSignProps> = ({x, y, w = 190, fs = 30, strikeAt, fixedAt, ink = 2.2, seed = 'cartsign'}) => {
  const t = useTime();
  useCaptionFont();
  const m = useXf();
  const uid = `cs${seed.replace(/[^a-zA-Z0-9]/g, '')}`;
  const h = fs * 2.55;
  const top = y + fs * 0.5;
  const x0 = x - w / 2;
  // the card swings a little when the strike lands (a tap)
  const sw = strikeAt !== undefined && t >= strikeAt ? -7 * Math.exp(-(t - strikeAt) * 5) * Math.cos((2 * Math.PI * (t - strikeAt)) / 0.55) : 0;
  const sp = strikeAt === undefined ? 0 : E.inOutSine(prog(t, strikeAt, 0.12));
  const fp = fixedAt === undefined ? 0 : E.outCubic(prog(t, fixedAt, 0.16));
  const line1Y = top + fs * 1.05;
  const line2Y = top + fs * 2.15;
  const tx0 = x0 + w * 0.08;
  const tx1 = x0 + w * 0.92;
  const s = Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) || 1;
  return (
    <XG m={mat.about(mat.rotate(sw), x, y)}>
      <Ink d={`M${f1(x)} ${f1(y)}L${f1(x0 + w * 0.2)} ${f1(top + 2)}M${f1(x)} ${f1(y)}L${f1(x0 + w * 0.8)} ${f1(top + 2)}`} width={ink * 0.7} taper={false} vary={0} seed={`${seed}/str`} />
      <circle cx={x} cy={y} r={ink * 1.3} fill={palette.ink} />
      <Fill d={roundRect(x0, top, w, h, fs * 0.18)} color={palette.cream} offset={[3 / s, 2 / s]} seed={`${seed}/card`} />
      <Ink d={roundRect(x0, top, w, h, fs * 0.18)} width={ink} taper={false} seed={`${seed}/cardI`} />
      <text x={x} y={line1Y} fontFamily={captionFontStack} fontSize={fs} fill={palette.ink} textAnchor="middle">
        still fixing...
      </text>
      {sp > 0 ? <path d={`M${f1(tx0)} ${f1(line1Y - fs * 0.3)}L${f1(lerp(tx0, tx1, sp))} ${f1(line1Y - fs * 0.27 - sp * fs * 0.06)}`} stroke={palette.ink} strokeWidth={ink * 1.4} strokeLinecap="round" fill="none" /> : null}
      {fp > 0 ? (
        <>
          <defs>
            <clipPath id={uid} clipPathUnits="userSpaceOnUse">
              <rect x={x0} y={top + fs * 1.2} width={w * fp} height={fs * 1.3} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${uid})`}>
            <text x={x + w * 0.04} y={line2Y} fontFamily={captionFontStack} fontSize={fs * 1.12} fill={palette.ink} textAnchor="middle" transform={`rotate(-4 ${f1(x)} ${f1(line2Y)})`}>
              fixed!
            </text>
          </g>
        </>
      ) : null}
    </XG>
  );
};

// ---------------------------------------------------------------- Glint

/** A four-point cream sparkle with an ink edge that pops (spring) and is gone after `dur`. */
export const Glint: React.FC<{x: number; y: number; r: number; at: number; dur?: number; ink?: number}> = ({x, y, r, at, dur = 0.3, ink = 1}) => {
  const t = useTime();
  if (t < at || t > at + dur) return null;
  const k = springAt(t, at, springs.pop) * (t > at + dur - 0.07 ? 0.6 : 1);
  const q = r * 0.28;
  const d = `M${f2(x)} ${f2(y - r * k)}L${f2(x + q * k)} ${f2(y - q * k)}L${f2(x + r * k)} ${f2(y)}L${f2(x + q * k)} ${f2(y + q * k)}L${f2(x)} ${f2(y + r * k)}L${f2(x - q * k)} ${f2(y + q * k)}L${f2(x - r * k)} ${f2(y)}L${f2(x - q * k)} ${f2(y - q * k)}Z`;
  return <path d={d} fill={palette.cream} stroke={palette.ink} strokeWidth={ink} strokeLinejoin="round" />;
};
