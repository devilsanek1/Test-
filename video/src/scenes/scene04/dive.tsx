// S04 dive extras (fix round 2): what happens to the wire and its pigeons when the upper set goes flat on the dive's
// first frame, so the change is motivated instead of a one-frame vanish:
//  - the two pigeons are drawn here (StoopStreet pigeons={false}): before the dive the set's own Bird, same positions,
//    seeds and colours (pixel-identical); on the dive's first frame they TAKE OFF: two flap frames (wings up, then down)
//    darting LEFT and a little up, then they are out of the shot. Their path stays under the caption band (screen y > 570)
//    so nothing crosses the glyphs;
//  - the telephone wire SNAPS at the lamp end on the same frame and whips right, out of frame, in two frames (the lamp
//    keeps its stub: the near layer left of world x 90 stays inked).
// Both are world space (they ride the dive) and drawn after the near layer's flat copy (always inked).

import React from 'react';
import {palette} from '../../lib/theme';
import {useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {Bird} from '../../lib/kit';
import {wirePoint} from '../../lib/sketch';
import type {Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {SI, STOOP} from '../shared/sets';

const FRAME = 1 / 30;
const W = STOOP.wire;
/** The set's wire (StoopStreet: wire(a, b + (160, 6), sag x 1.15)). */
const WA: Pt = W.a;
const WB: Pt = [W.b[0] + 160, W.b[1] + 6];
const SAG = W.sag * 1.15;

/** The set's pigeon perches (StoopStreet's own wirePoint call). */
export const PIGEONS: {p: Pt; color: string}[] = STOOP.pigeons.map((p, i) => {
  const q = wirePoint(WA[0], WA[1], WB[0], WB[1], SAG, (p[0] - WA[0]) / (WB[0] - WA[0]));
  return {p: [q[0], q[1] + 1] as Pt, color: i ? palette.sand : palette.white};
});

/** A pigeon in flight: a small body and two wing strokes (`up` = wings raised). */
const Flapper: React.FC<{x: number; y: number; s: number; up: boolean; color: string; seed: string}> = ({x, y, s, up, color, seed}) => {
  const f = up ? 11 : -5;
  const wings = `M-17 ${-8 - f}Q-8 -6 0 -4Q8 -6 17 ${-8 - f}`;
  const body = 'M-11 -6C-9 -12 6 -12 11 -7C8 -2 -6 -1 -11 -6Z';
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.scale(-s, s))}>
      <Fill d={body} color={color} offset={false} mode="none" seed={`${seed}/b`} />
      <Ink d={body + wings} width={1.7} taper={false} seed={`${seed}/w`} />
    </XG>
  );
};

/** The pigeons: perched until `diveAt`, then a two-frame take-off to the left (world offsets), gone from frame 3. */
export const DivePigeons: React.FC<{diveAt: number; seed?: string}> = ({diveAt, seed = 'stoop'}) => {
  const t = useTime();
  const d = t - diveAt;
  if (d >= 2 * FRAME) return null;
  return (
    <>
      {PIGEONS.map(({p, color}, i) => {
        if (d < 0) return <Bird key={i} x={p[0]} y={p[1]} s={0.85} seed={`${seed}/pg${i}`} color={color} />;
        const first = d < FRAME;
        const off: Pt = first ? [-24 - 6 * i, -9 - 3 * i] : [-84 - 10 * i, -12 - 4 * i];
        return <Flapper key={i} x={p[0] + off[0]} y={p[1] + off[1]} s={first ? 0.85 : 0.75} up={first} color={color} seed={`s4pg${i}`} />;
      })}
    </>
  );
};

/** The wire's whip: on the dive's first frame its lamp end has snapped (free end at world x ~360, curling up), on the
 *  second only its last stretch is still in the shot at the right edge; then it is gone (out of frame right). */
export const WireWhip: React.FC<{diveAt: number}> = ({diveAt}) => {
  const t = useTime();
  const d = t - diveAt;
  if (d < 0 || d >= 2 * FRAME) return null;
  const first = d < FRAME;
  const [fx, fy] = first ? [360, 652] : [610, 664];
  // the free end curls up and back (the whip), then the wire runs on in a deep sag to the far pole
  const c1: Pt = [fx + 40, fy + 58];
  const c2: Pt = [fx + (WB[0] - fx) * 0.45, WB[1] + SAG * 1.4];
  const curl = `M${fx - 16} ${fy - 8}Q${fx - 13} ${fy + 4} ${fx} ${fy}`;
  const d1 = `${curl}C${c1[0]} ${c1[1]} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${WB[0]} ${WB[1]}`;
  return <Ink d={d1} width={SI.far} taper={false} seed="s4/whip" />;
};
