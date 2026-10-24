// props/Envelope.tsx — the quiet letter (P9, S05 -> S06): a white envelope with a wax-seal spot, and the door's mail slot.
//
//   <Envelope x={905} y={1210} pullFromCoatAt={25.30} coatY={1240} />          // S05: rises out of the coat (clipped)
//   <Envelope x={hx} y={hy} carry={{at: 25.44}} sealPoint />                    // S06: carried, bobbing with the walk
//   <Envelope ... slot={{at: 26.6, x: 670, y: 1300, w: 50}} />                  // slides through the slot (0.25 s)
//   <MailSlot x={670} y={1300} clickAt={26.85} />                              // 50 x 10 plate, the flap clicks
//   envelopeSeal(x, y, size)  -> world point where the WaxSeal lands
//
// Envelope anchor (x, y) = its centre; size = width (60 default, height 2/3). The flap is a V meeting at the seal spot.

import React, {useId} from 'react';
import {palette} from '../../../lib/theme';
import {ease as E, lerp, osc, prog, useTime} from '../../../lib/time';
import {Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {line, rect, rectPath, roundRect, Pt} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {bt, Depth, DEPTH_INK, misregScreen} from './common';

/** Where the seal sits on an envelope centred at (x, y) of width `size`. */
export const envelopeSeal = (x: number, y: number, size = 60): Pt => [x, y + size * 0.03];

export type EnvelopeProps = {
  x: number;
  y: number;
  size?: number;
  rot?: number;
  at?: number;
  /** Rises out of a coat: from `coatY` (a clip line below which it is hidden) up to (x, y) with a twist (0.3 s). */
  pullFromCoatAt?: number;
  coatY?: number;
  /** Walk bob while carried (hz default 1.7 steps/s, amp 3 px). */
  carry?: {at?: number; hz?: number; amp?: number};
  /** Slides through a horizontal mail slot centred at (x, y) of width w: aligns over 40 %, then disappears into it. */
  slot?: {at: number; x: number; y: number; w?: number; dur?: number};
  depth?: Depth;
  seed?: Seed;
};

export const Envelope: React.FC<EnvelopeProps> = ({x, y, size = 60, rot = 0, at, pullFromCoatAt, coatY, carry, slot, depth = 'mid', seed = 'env'}) => {
  const t = useTime();
  const clipId = 'ev' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const start = Math.min(at ?? Infinity, pullFromCoatAt ?? Infinity);
  if (Number.isFinite(start) && t < start) return null;
  const w = size;
  const h = size * 0.66;
  const s = size / 60;
  let cx = x;
  let cy = y;
  let r = rot;
  let sx = 1;
  let clipY: number | null = null; // world y below which the envelope is hidden
  if (pullFromCoatAt !== undefined && t < pullFromCoatAt + 0.4) {
    const q = MOTION_OUT(prog(t, pullFromCoatAt, 0.3));
    const fromY = (coatY ?? y + h) + h * 0.6;
    cy = lerp(fromY, y, q);
    r = rot + lerp(-24, 0, q);
    if (coatY !== undefined) clipY = coatY;
  }
  if (carry && (carry.at === undefined || t >= carry.at)) {
    const hz = carry.hz ?? 1.7;
    cy += -Math.abs(osc(t, hz / 2)) * (carry.amp ?? 3);
    r += osc(t, hz / 2, 1) * 2;
  }
  if (slot && t >= slot.at) {
    const dur = slot.dur ?? 0.25;
    const a = prog(t, slot.at, dur * 0.4, E.inOutSine);
    const b = prog(t, slot.at + dur * 0.4, dur * 0.6, E.inCubic);
    if (b >= 1) return null;
    const sw = slot.w ?? 50;
    cx = lerp(cx, slot.x, a);
    cy = lerp(cy, slot.y - h / 2, a) + b * h;
    r = lerp(r, 0, a);
    sx = lerp(1, Math.min(1, (sw * 0.92) / w), a);
    clipY = slot.y;
  }
  const iw = DEPTH_INK[depth] / s;
  const off = misregScreen(seed);
  const body = (
    <XG m={mat.compose(mat.translate(cx, cy), mat.rotate(r), mat.scale(sx * s, s))}>
      <Fill d={rectPath(-30, -20, 60, 40)} color={palette.white} at={bt(at, 0.1)} offset={[off[0] / s, off[1] / s]} seed={`${seed}/f`} />
      <Ink d={rect(-30, -20, 60, 40, {seed: `${seed}/o`, over: 3})} at={at} dur={0.25} width={iw} seed={`${seed}/o`} />
      <Ink d={`M-29 -19L0 2L29 -19` + line(-29, 19, -9, 3, {over: [0, 0], seed: `${seed}/l1`}) + line(29, 19, 9, 3, {over: [0, 0], seed: `${seed}/l2`})} at={bt(at, 0.12)} width={iw * 0.75} seed={`${seed}/v`} />
    </XG>
  );
  if (clipY === null) return body;
  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <rect x={-5000} y={-5000} width={10000} height={clipY + 5000} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>{body}</g>
    </>
  );
};

const MOTION_OUT = (x: number) => (x >= 1 ? 1 : (1 - Math.pow(2, -10 * x)) / (1 - Math.pow(2, -10)));

/** The door's mail slot: a sand plate (w x h, default 50 x 10) with a dark slot and a hinged flap that clicks. (x, y) = centre. */
export const MailSlot: React.FC<{x: number; y: number; w?: number; h?: number; at?: number; clickAt?: number | number[]; depth?: Depth; seed?: Seed}> = ({x, y, w = 50, h = 10, at, clickAt, depth = 'far', seed = 'slot'}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const clicks = clickAt === undefined ? [] : Array.isArray(clickAt) ? clickAt : [clickAt];
  let flap = 1;
  for (const c of clicks) if (t >= c && t < c + 0.18) flap = Math.min(flap, 1 - 0.8 * Math.sin(Math.PI * ((t - c) / 0.18)));
  const iw = DEPTH_INK[depth];
  const pw = w + 12;
  const ph = h + 10;
  return (
    <>
      <Fill d={roundRect(x - pw / 2, y - ph / 2, pw, ph, 3)} color={palette.sand} at={at} offset={[1.5, 1.5]} seed={`${seed}/p`} />
      <Fill d={rectPath(x - w / 2, y - h / 2, w, h)} color={palette.ink} offset={false} at={bt(at, 0.05)} mode="snap" seed={`${seed}/s`} />
      <XG m={mat.about(mat.scale(1, flap), x, y - h / 2)}>
        <Fill d={rectPath(x - w / 2, y - h / 2, w, h)} color={palette.sand} offset={false} at={bt(at, 0.08)} mode="snap" seed={`${seed}/fl`} />
        <Ink d={line(x - w / 2 + 3, y + h / 2 - 2, x + w / 2 - 3, y + h / 2 - 2, {over: [0, 0], seed: `${seed}/fli`})} width={iw * 0.6} seed={`${seed}/fli`} />
      </XG>
      <Ink d={roundRect(x - pw / 2, y - ph / 2, pw, ph, 3, {closed: false, seed: `${seed}/o`})} at={at} dur={0.15} width={iw} seed={`${seed}/o`} />
    </>
  );
};
