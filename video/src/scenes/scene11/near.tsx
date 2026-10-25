// S11 near-plane and depth helpers (fix round 1):
//   NearLamp     the plaza's lamp post near the LEFT frame edge (SCREEN space: a foreground layer the 4 % push / 3 % lean
//                barely moves): a slim tealDark post from below the frame to a WHOLE cream lantern head at screen x ~73-151,
//                y 832-962 (under the caption band; fix round 3: moved in from x 3-77, clear of the film edge's bare left
//                strip), a short crossbar (the bar S12's pigeons land on). Its lantern goes dark (cream -> tealDark) with
//                the switch-off ripple. Pip's in-hop passes BEHIND it.
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

// fix round 3: the whole lamp stands at x >= 73 (post 101-123, roof 73-151, crossbar to 194). The film's paint edge
// (FILM_EDGES paint-subtle, no S11 hints yet) leaves a bare strip at x < 54 on the left: at x 3-77 the lantern and post
// were cut lengthways into line art and colour (EDGES.md: a lamp is never half colour, half line art)
const LAMP = {x: 112, w: 22, lantern: [878, 962] as [number, number], lw: 58, roofTop: 832, barY: 1012, barX1: 194};

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
      {/* lit: cream glass; off (fix round 3): the glass goes DARK (tealDark), a light going out, not a shade step */}
      <Fill d={rectPath(x - lw / 2, ly0, lw, ly1 - ly0)} color={off ? palette.tealDark : palette.cream} offset={false} mode="none" seed={`${seed}/glass`} />
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

// ---------------------------------------------------------------- LitGlass (world)

/** govB's lit glass for the lights-out beat (fix round 3: in daylight a one-step darker facade read as a passing cloud;
 *  'off' now reads as LIGHT going out): the six drum window slots (the set's `drumSlits`: x 442 + 29 i, y 822, 9 x 34)
 *  and the dome lantern's glass (inset inside the set's lantern ink, (508, 612, 20, 40)) are drawn LIT (peach slots, a
 *  peach lantern core) over the set until their cascade frame; then the lantern core pops to tealDark (`lanternAt`) and
 *  the slots hand back to the set's own tealDark slits (`drumAt`). Flat colours, one-frame pops. */
export const LitGlass: React.FC<{lanternAt: number; drumAt: number; seed?: string}> = ({lanternAt, drumAt, seed = 's11/lit'}) => {
  const t = useTime();
  let slots = '';
  for (let i = 0; i < 6; i++) slots += rectPath(442 + i * 29, 822, 9, 34);
  return (
    <>
      {t < drumAt ? <Fill d={slots} color={palette.peach} offset={false} mode="none" seed={`${seed}/slots`} /> : null}
      <Fill d={rectPath(511, 616, 14, 32)} color={t < lanternAt ? palette.peach : palette.tealDark} offset={false} mode="none" seed={`${seed}/lantern`} />
    </>
  );
};
