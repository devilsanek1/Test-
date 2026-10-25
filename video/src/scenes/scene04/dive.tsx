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
import {Cam, K_CREEP, toScreen, toWorld} from './camera';

/** The camera the pigeons perched under (the creep's end = the dive's start). */
const K_PERCH: Cam = K_CREEP;

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

/** A pigeon in flight, heading LEFT: a small body with its head forward and two wing strokes, raised in a deep V (`up`)
 *  or swept down under the body. */
const Flapper: React.FC<{x: number; y: number; s: number; up: boolean; color: string; seed: string}> = ({x, y, s, up, color, seed}) => {
  const wings = up ? 'M-20 -26Q-9 -14 1 -8Q9 -16 22 -27' : 'M-19 3Q-9 -10 1 -8Q10 -10 21 2';
  const body = 'M-12 -8C-10 -13 6 -12 13 -7C7 -3 -6 -3 -12 -8Z';
  const head = 'M-17 -9a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z';
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.scale(s))}>
      <Fill d={body + head} color={color} offset={false} mode="none" seed={`${seed}/b`} />
      <Ink d={body + head} width={1.5} taper={false} seed={`${seed}/o`} />
      <Ink d={wings} width={2.1} taper={false} seed={`${seed}/w`} />
    </XG>
  );
};

/** The pigeons: perched until `diveAt` (w54 'years': the camera's dive starts on that frame, still almost at rest, so
 *  their take-off is the word-locked anticipation beat), then they fly out of the shot to the LEFT. Fix round 3: they
 *  used to vanish mid-frame (screen x ~600) on the dive's third frame; now each follows a SCREEN path (placed through the
 *  camera, so the dive does not drag them up into the captions): (493, 650) -> out past the left edge in four frames,
 *  accelerating ~120 -> ~300 px / frame, rising only ~10 px a frame (always under the caption band, y > 600), wings
 *  alternating up / down per frame. */
export const DivePigeons: React.FC<{diveAt: number; cam: Cam; seed?: string}> = ({diveAt, cam, seed = 'stoop'}) => {
  const t = useTime();
  const d = t - diveAt;
  if (d >= 5 * FRAME) return null;
  return (
    <>
      {PIGEONS.map(({p, color}, i) => {
        if (d < 0) return <Bird key={i} x={p[0]} y={p[1]} s={0.85} seed={`${seed}/pg${i}`} color={color} />;
        const k = d / FRAME + 0.6; // frames into the flight (the first frame already off the wire)
        const s0 = toScreen(cam, p);
        const home = toScreen(K_PERCH, p);
        const sx = home[0] - (95 * k + 32 * k * k) - 18 * i;
        const sy = Math.max(605, home[1] - 9 * k - 6 * i);
        if (sx < -60) return null;
        const q = toWorld(cam, [sx, sy]);
        void s0;
        const up = Math.floor(d / FRAME) % 2 === 0;
        return <Flapper key={i} x={q[0]} y={q[1]} s={0.85 - 0.04 * k} up={up} color={color} seed={`s4pg${i}`} />;
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
