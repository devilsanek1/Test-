// S09 polish A1 (reviewer major: "the fix is barely visible: a 90 px tan crate on the tan stoop wall reads as papers in a
// box"): THE crate of new locks, drawn by the scene so it is the second-brightest thing in the A1 frame after the sun.
// A slatted SAGE crate (two cream slats, teal corner battens, ink 2.2) whose cream lid flips UP on 'fix' - 0.08 to stand
// behind the opening and show its PEACH inside face (the warm accent of the film), with ONE ink ring pulse (r ~70) on the
// pop; two new sage locks bob up into the opening, the raised one at its left end (the one Pip lifts) is drawn by
// PartA's CrateExtras. Same anchor convention as the kit LockCrate: (x, y) = bottom centre, `size` = width (world px).
// The kit LockCrate's lid swings -118 deg about its back-LEFT corner, i.e. edge-on across Pip's ear at this spot, and its
// sand body has no contrast on the tan wall: this local crate keeps its locks (props Lock 'fixed') and its tags
// (props CheckBoxTag, PartA) and replaces the box itself. No opacity anywhere: pops, springs, an ink ring that thins.

import React from 'react';
import {Fill, Ink, palette, useTime, rect as sketchRect, line, rectPath, springAt, springs, prog, ease as E} from '../../lib';
import {Lock} from '../shared/props';

export type CrateGeom = {x: number; y: number; w: number; h: number};
export const crateGeom = (x: number, y: number, size: number): CrateGeom => ({x, y, w: size, h: size * 0.62});

/** Height of the open lid's inside face standing behind the opening (world px per crate width). */
export const LID_UP = 0.4;

/** The lid flips up (shut slab -> upright peach panel) with the 7 % spring. Returns the panel's visible height. */
const lidH = (t: number, lidAt: number, g: CrateGeom) => {
  const shut = g.w * 0.085;
  if (t < lidAt) return {open: false, h: shut};
  const k = springAt(t, lidAt, springs.pop);
  return {open: true, h: shut + (g.w * LID_UP - shut) * k};
};

/** The crate's back half: the open lid's upright inside face and the dark opening (draw BEFORE the locks / tags). */
export const CrateBack: React.FC<{g: CrateGeom; lidAt: number; ink: number; seed: string}> = ({g, lidAt, ink, seed}) => {
  const t = useTime();
  const L = lidH(t, lidAt, g);
  if (!L.open) return null;
  const top = g.y - g.h;
  const x0 = g.x - g.w / 2 - 4;
  const lw = g.w + 8;
  // the upright lid: its outside rim (cream) shows as a band along the top, the inside face is peach
  const panel = rectPath(x0, top - L.h, lw, L.h);
  return (
    <>
      <Fill d={panel} color={palette.peach} offset={[3, 2]} mode="snap" seed={`${seed}/lidIn`} />
      <Fill rect={[x0, top - L.h, lw, Math.min(L.h, g.w * 0.07)]} color={palette.cream} offset={false} mode="snap" seed={`${seed}/lidRim`} />
      <Ink d={sketchRect(x0, top - L.h, lw, L.h, {seed: `${seed}/lidI`, over: 3})} width={ink} taper={false} seed={`${seed}/lidI`} />
      {/* two hinge ticks at the lid's foot */}
      <Ink d={`M${(g.x - g.w * 0.3).toFixed(1)} ${(top - 6).toFixed(1)}v8M${(g.x + g.w * 0.3).toFixed(1)} ${(top - 6).toFixed(1)}v8`} width={ink * 0.8} taper={false} vary={0} seed={`${seed}/hinge`} />
      {/* the dark opening along the rim */}
      <Fill rect={[g.x - g.w / 2 + 4, top - 5, g.w - 8, 8]} color={palette.tealDark} offset={false} mode="snap" seed={`${seed}/hole`} />
    </>
  );
};

/** Two new sage locks bob up into the opening after the lid (0.04 s apart), right of the raised one. */
export const CrateLocks: React.FC<{g: CrateGeom; lidAt: number; ink: number; seed: string}> = ({g, lidAt, ink, seed}) => {
  const t = useTime();
  if (t < lidAt + 0.04) return null;
  const size = g.w * 0.36;
  const spots: [number, number, number][] = [
    [0.04, 0.0, -4],
    [0.29, 4, 7],
  ];
  return (
    <>
      {spots.map(([u, dy, rot], i) => {
        const at = lidAt + 0.04 + i * 0.04;
        if (t < at) return null;
        const k = springAt(t, at, springs.pop);
        return <Lock key={i} x={g.x + u * g.w} y={g.y - g.h + size * 0.12 + dy + (1 - k) * size * 0.6} size={size} state="fixed" ink={ink} rot={rot} seed={`${seed}/l${i}`} />;
      })}
    </>
  );
};

/** The crate's front: the sage body (two cream slats, teal corner battens) and, until `lidAt`, the shut cream lid. */
export const CrateFront: React.FC<{g: CrateGeom; lidAt: number; ink: number; seed: string}> = ({g, lidAt, ink, seed}) => {
  const t = useTime();
  const {x, y, w, h} = g;
  const x0 = x - w / 2;
  const top = y - h;
  const bat = w * 0.1;
  const slat = h * 0.13;
  const s1 = top + h * 0.3;
  const s2 = top + h * 0.64;
  const L = lidH(t, lidAt, g);
  return (
    <>
      <Fill rect={[x0, top, w, h]} color={palette.sage} offset={[4, 3]} mode="snap" seed={`${seed}/body`} />
      <Fill d={rectPath(x0 + bat, s1, w - 2 * bat, slat) + rectPath(x0 + bat, s2, w - 2 * bat, slat)} color={palette.cream} offset={false} mode="snap" seed={`${seed}/slat`} />
      <Fill d={rectPath(x0, top, bat, h) + rectPath(x0 + w - bat, top, bat, h)} color={palette.teal} offset={false} mode="snap" seed={`${seed}/bat`} />
      <Ink
        d={
          sketchRect(x0, top, w, h, {seed: `${seed}/o`, over: 4}) +
          line(x0 + bat, top + 2, x0 + bat, y - 2, {seed: `${seed}/b1`, over: [0, 0]}) +
          line(x0 + w - bat, top + 2, x0 + w - bat, y - 2, {seed: `${seed}/b2`, over: [0, 0]}) +
          line(x0 + bat, s1, x0 + w - bat, s1, {seed: `${seed}/s1`, over: [0, 0]}) +
          line(x0 + bat, s1 + slat, x0 + w - bat, s1 + slat, {seed: `${seed}/s1b`, over: [0, 0]}) +
          line(x0 + bat, s2, x0 + w - bat, s2, {seed: `${seed}/s2`, over: [0, 0]}) +
          line(x0 + bat, s2 + slat, x0 + w - bat, s2 + slat, {seed: `${seed}/s2b`, over: [0, 0]})
        }
        width={ink}
        taper={false}
        seed={`${seed}/oi`}
      />
      {/* nail heads on the battens */}
      <Ink d={`M${(x0 + bat / 2).toFixed(1)} ${(s1 + slat / 2).toFixed(1)}h0.1M${(x0 + w - bat / 2).toFixed(1)} ${(s1 + slat / 2).toFixed(1)}h0.1M${(x0 + bat / 2).toFixed(1)} ${(s2 + slat / 2).toFixed(1)}h0.1M${(x0 + w - bat / 2).toFixed(1)} ${(s2 + slat / 2).toFixed(1)}h0.1`} width={ink * 1.6} taper={false} vary={0} seed={`${seed}/nails`} />
      {!L.open ? (
        <>
          <Fill rect={[x0 - 4, top - L.h, w + 8, L.h]} color={palette.cream} offset={[3, 2]} mode="snap" seed={`${seed}/lid`} />
          <Ink d={sketchRect(x0 - 4, top - L.h, w + 8, L.h, {seed: `${seed}/lidS`, over: 3})} width={ink} taper={false} seed={`${seed}/lidS`} />
        </>
      ) : null}
    </>
  );
};

/** One ink ring pulse (scale-out, the stroke thins to nothing: no fade). */
export const InkRing: React.FC<{x: number; y: number; r: number; at: number; w?: number; dur?: number}> = ({x, y, r, at, w = 3.4, dur = 0.3}) => {
  const t = useTime();
  if (t < at) return null;
  const p = prog(t, at, dur, E.outCubic);
  if (p >= 1) return null;
  return <circle cx={x} cy={y} r={r * (0.55 + 0.6 * p)} fill="none" stroke={palette.ink} strokeWidth={w * (1 - p)} />;
};
