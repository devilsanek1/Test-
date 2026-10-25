// S11 near-plane and depth helpers (fix round 1):
//   NearLamp     the plaza's lamp post at the LEFT frame edge (SCREEN space: a foreground layer the 4 % push / 3 % lean
//                barely moves): a slim tealDark post from below the frame to a WHOLE cream lantern head at screen x ~3-77,
//                y 832-962 (under the caption band; fix round 2: the head is fully in frame and the post stands 29 px in
//                from the edge, so it reads as a lamp, not a frame border), a short crossbar (the bar S12's pigeons land
//                on). Its lantern pops off (cream -> sand) with the switch-off ripple. Pip's in-hop passes BEHIND it.
//   StepTreads   ink for the plaza's far steps in the gap between govB and govD (world): the set leaves them as flat
//                cream / sand stripes in colour (its step lines are paper-only), which at zoom 1.7 read as blinds. Three
//                broken tread lines + a kerb line in the set's hand turn them back into steps.
//   BandClip     clips its children to world y < `y` (and an x span): S11's top-to-bottom lights-out cascade draws the
//                set a second time, already dark, over the top bands for the two in-between frames.

import React from 'react';
import {palette, stroke} from '../../lib/theme';
import {useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {blob, line, polyPath, rectPath} from '../../lib/sketch';

// ---------------------------------------------------------------- NearLamp (screen px)

const LAMP = {x: 40, w: 22, lantern: [878, 962] as [number, number], lw: 58, roofTop: 832, barY: 1012, barX1: 122};

export const NearLamp: React.FC<{offAt?: number; seed?: string}> = ({offAt, seed = 's11/lamp'}) => {
  const t = useTime();
  const off = offAt !== undefined && t >= offAt;
  const {x, w, lw} = LAMP;
  const [ly0, ly1] = LAMP.lantern;
  const x0 = x - w / 2;
  const x1 = x + w / 2;
  const post = rectPath(x0, ly1 + 14, w, 1990 - ly1);
  const collar = rectPath(x - w * 0.75, ly1, w * 1.5, 16);
  const roof = polyPath([[x - lw / 2 - 8, ly0], [x, LAMP.roofTop], [x + lw / 2 + 8, ly0]]);
  const bar = rectPath(x1 - 2, LAMP.barY, LAMP.barX1 - x1 + 2, 11);
  const bold = stroke.inkBold;
  const ink =
    line(x1, 1990, x1 - 1, ly1 + 16, {seed: `${seed}/r`, over: 0}) +
    line(x0, 1990, x0 + 1, ly1 + 16, {seed: `${seed}/l`, over: 0}) +
    line(x - w * 0.75 - 1, ly1 + 1, x - w * 0.75, ly1 + 16, {seed: `${seed}/c4`, over: 0}) +
    line(x - w * 0.75 - 2, ly1, x + w * 0.75 + 3, ly1 + 1, {seed: `${seed}/c1`, over: [2, 2]}) +
    line(x - w * 0.75, ly1 + 16, x + w * 0.75 + 2, ly1 + 16, {seed: `${seed}/c2`, over: [2, 2]}) +
    line(x + w * 0.75 + 1, ly1, x + w * 0.75, ly1 + 16, {seed: `${seed}/c3`, over: 0}) +
    line(x1 - 4, LAMP.barY, LAMP.barX1 + 6, LAMP.barY - 1, {seed: `${seed}/b1`, over: [0, 4]}) +
    line(x1, LAMP.barY + 11, LAMP.barX1 - 2, LAMP.barY + 10, {seed: `${seed}/b2`, over: [0, 3]}) +
    line(LAMP.barX1 + 1, LAMP.barY - 2, LAMP.barX1, LAMP.barY + 11, {seed: `${seed}/b3`, over: 0}) +
    line(x - lw / 2 - 10, ly0, x, LAMP.roofTop, {seed: `${seed}/rf1`, over: [2, 0]}) +
    line(x, LAMP.roofTop, x + lw / 2 + 10, ly0, {seed: `${seed}/rf2`, over: [0, 2]}) +
    line(x - lw / 2 - 10, ly0 + 1, x + lw / 2 + 10, ly0, {seed: `${seed}/rf3`, over: [2, 2]});
  const glass =
    line(x + lw / 2, ly0, x + lw / 2 - 1, ly1, {seed: `${seed}/g1`, over: [1, 1]}) +
    line(x - lw / 2, ly0, x - lw / 2 + 1, ly1, {seed: `${seed}/g3`, over: [1, 1]}) +
    line(x, ly0 + 2, x + 1, ly1 - 2, {seed: `${seed}/g2`, over: 0});
  return (
    <>
      <Fill d={post + bar} color={palette.tealDark} offset={false} mode="none" seed={`${seed}/post`} />
      <Fill d={rectPath(x - lw / 2, ly0, lw, ly1 - ly0)} color={off ? palette.sand : palette.cream} offset={false} mode="none" seed={`${seed}/glass`} />
      <Fill d={roof + collar} color={palette.tealDark} offset={false} mode="none" seed={`${seed}/roof`} />
      {/* a white glint stroke on the lit glass (off: none) */}
      {!off ? <path d={`M${x + 6} ${ly0 + 40}L${x + 18} ${ly0 + 14}`} fill="none" stroke={palette.white} strokeWidth={3.4} strokeLinecap="round" /> : null}
      <Ink d={ink} width={bold} taper={false} vary={0.06} seed={`${seed}/ink`} />
      <Ink d={glass} width={stroke.ink} taper={false} vary={0.05} seed={`${seed}/gink`} />
      <path d={blob(x, LAMP.roofTop - 7, 7, 7, {seed: `${seed}/fin`})} fill={palette.ink} />
    </>
  );
};

// ---------------------------------------------------------------- StepTreads (world)

/** The far steps' tread lines in the gap (world x `x0`..`x1`), at the set's flight edges (PLAZA.civicBase 1166: coping,
 *  flights of 8 / 12 / 20 px steps; the plaza horizon at 1384). `kz` = camera zoom (constant screen width). */
export const StepTreads: React.FC<{x0: number; x1: number; kz: number; seed?: string}> = ({x0, x1, kz, seed = 's11/treads'}) => {
  const treads = [1209, 1265, 1305, 1345];
  let d = '';
  treads.forEach((y, i) => {
    d += line(x0 + 4 + (i % 2) * 6, y, x1 - 3 - ((i + 1) % 2) * 8, y + 0.6, {seed: `${seed}/t${i}`, over: [0, 0]});
  });
  const kerb = line(x0 + 2, 1385, x1 - 2, 1386, {seed: `${seed}/k`, over: [0, 0]});
  return (
    <>
      <Ink d={d} width={stroke.inkThin / kz} taper={false} vary={0.08} seed={`${seed}/i`} />
      <Ink d={kerb} width={stroke.ink / kz} taper={false} vary={0.06} seed={`${seed}/ki`} />
    </>
  );
};

// ---------------------------------------------------------------- BandClip (world)

export const BandClip: React.FC<{y: number; x0: number; x1: number; id: string; children?: React.ReactNode}> = ({y, x0, x1, id, children}) => (
  <>
    <defs>
      <clipPath id={id}>
        <rect x={x0} y={-4000} width={x1 - x0} height={y + 4000} />
      </clipPath>
    </defs>
    <g clipPath={`url(#${id})`}>{children}</g>
  </>
);
