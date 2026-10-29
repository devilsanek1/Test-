// S04 dive extras: what happens to the wire and its pigeons when the dive starts (so nothing just vanishes), and the
// dive's speed ticks:
//  - the two pigeons are drawn here (StoopStreet pigeons={false}): before the dive the set's own Bird, same positions,
//    seeds and colours (pixel-identical); on w54 'years' (the dive's first frame) they TAKE OFF and fly out past the
//    LEFT edge in four frames on a screen path under the caption band (fix round 3: they vanished mid-frame);
//  - the telephone wire SNAPS at the lamp end on the same frame and whips right, out of frame, in two frames (the lamp
//    keeps its stub: the near layer left of world x 90 stays inked);
//  - the RIPPLE (A1 fix round 2; fix round 3's seven hair ticks read as pen scratches): one broken ink ring steps
//    outward from the re-popped peach spot on dive frames 3-6.
// All world space (they ride the dive), placed through the camera where they follow a screen path.

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
 *  camera, so the dive does not drag them up into the captions): (493, 652) -> out past the left edge in four frames,
 *  ~60 -> ~210 -> ~230 px / frame, rising only ~10 px a frame (always under the caption band, y > 600), wings
 *  alternating up / down per frame. */
export const DivePigeons: React.FC<{diveAt: number; cam: Cam; seed?: string}> = ({diveAt, cam, seed = 'stoop'}) => {
  const t = useTime();
  const d = t - diveAt;
  if (d >= 5 * FRAME) return null;
  return (
    <>
      {PIGEONS.map(({p, color}, i) => {
        if (d < 0) return <Bird key={i} x={p[0]} y={p[1]} s={0.85} seed={`${seed}/pg${i}`} color={color} />;
        const k = d / FRAME + 0.3; // frames into the flight (the first frame already off the wire)
        const home = toScreen(K_PERCH, p);
        const sx = home[0] - (95 * k + 32 * k * k) - 18 * i;
        const sy = Math.max(605, home[1] - 9 * k - 6 * i);
        if (sx < -60) return null;
        const q = toWorld(cam, [sx, sy]);
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

/** The dive's RIPPLE (A1 fix round 2: the seven hair speed ticks of fix round 3 were ~1 px on screen, 30-40 px long and
 *  scattered over the calendar grid and the door glass: stray pen scratches, invisible at phone size). Every straight
 *  lane out of the lock crosses the door glass, the calendar grid or the tag's lettering, so the burst is a RING, not
 *  ticks: one broken ink ring (three arcs, 15 deg gaps) concentric with the re-popped peach spot, at the mid ink
 *  weight (3.0 -> 2.2 px on SCREEN), stepping OUTWARD with the dive's optical flow from 1.3x to 2.4x the spot's radius
 *  on four frames (dive frames 3-6, once the spot is full size), turning a little each frame. A clean circle around the
 *  target reads as 'here, into this' with the sound off and cannot be mistaken for marks on the wall. Its top stays at
 *  screen y >= ~930, far under the caption band. Screen space through the camera; `spotR` = the spot's world radius. */
const RIPPLE = [
  {k: 1.3, w: 3.0},
  {k: 1.65, w: 2.8},
  {k: 2.0, w: 2.5},
  {k: 2.4, w: 2.2},
];
export const DiveRipple: React.FC<{at: number; cam: Cam; target: Pt; spotR: number}> = ({at, cam, target, spotR}) => {
  const t = useTime();
  const d = t - at;
  if (d < -0.5 * FRAME || d >= (RIPPLE.length - 0.5) * FRAME) return null;
  const i = Math.max(0, Math.round(d / FRAME));
  const {k, w} = RIPPLE[i];
  const c = toScreen(cam, target);
  const r = spotR * cam.zoom * k;
  let path = '';
  for (let j = 0; j < 3; j++) {
    const a0 = ((-80 + 12 * i + j * 120) * Math.PI) / 180;
    const a1 = a0 + (105 * Math.PI) / 180;
    const p0 = toWorld(cam, [c[0] + Math.cos(a0) * r, c[1] + Math.sin(a0) * r]);
    const p1 = toWorld(cam, [c[0] + Math.cos(a1) * r, c[1] + Math.sin(a1) * r]);
    const rw = r / cam.zoom;
    path += `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}A${rw.toFixed(1)} ${rw.toFixed(1)} 0 0 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
  }
  return <Ink d={path} width={w / cam.zoom} taper={false} seed={`s4/ripple${i}`} />;
};
