// O1_cat (lane L1-desk): HER CAT on the desk insert (O1 + P12), a local variant of kit/Cat's 'sit' (the same model:
// the warm dark tabby, its sit body, stripes, chest, paws and idle clocks) whose head REALLY turns to what it watches.
// The kit's `look` only rolls a camera-facing head ~15 degrees, so a sound-off viewer saw a cat posing for the camera
// (art director, fix round). Here the head is a small sphere turned in YAW toward the cat's front (local +x: canvas
// left, where the action is): the features slide toward the target, the muzzle and nose stick out past the outline
// (3/4 to profile), the far eye hides behind the muzzle, the ears swing round; PITCH dips the chin (nose down at the
// run-on pouring off the desk); the head moves toward the target and the body LEANS forward (a shear about the paws).
// The tail curls round the front paws and its tip hangs over the desk's front edge and swishes (always on).
// See the lane's REQUESTS: kit Cat `turn` / `pitch` / `lean` (fold this back into the one model).
// Drawn in the kit's local units (body length 100, ground y 0, +x = the cat's front), facing left, kit Ink / Fill
// (inside O1's BuildWave it builds by position like the rest of the set: frame 0 shows its bare lines).
import React from 'react';
import {blob, ellipse, line, polyPath, smooth} from '../../../lib/sketch';
import {rand} from '../../../lib/rng';
import {clamp, useTime} from '../../../lib/time';
import {mat, Mat, XG} from '../../../lib/xf';
import {InkScale} from '../../../lib/inkComp';
import {CC, Fill, Ink, loopT, stepT, type Pt, W} from '../kit';

export type DeskCatPose = {
  /** Head yaw toward the cat's front (deg): 20 = mostly to camera, 70 = 3/4 to profile. */
  yaw: number;
  /** Chin dip (deg, + = nose down toward the front). */
  pitch: number;
  /** Body lean forward (a shear about the paws: 0..0.2). */
  lean: number;
  /** Extra head offset toward the target (local units). */
  head: Pt;
  /** Pupil direction (local, +x = the cat's front, +y = down). */
  eye: Pt;
  /** A big tail flick on a beat (0..1). */
  flick?: number;
};

/** A tube along points with per-point widths (local units): a closed smooth outline (kit/Cat's). */
function tube(pts: Pt[], widths: number[]): string {
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)];
    const c = pts[Math.min(pts.length - 1, i + 1)];
    const dx = c[0] - a[0];
    const dy = c[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    const n: Pt = [-dy / l, dx / l];
    const w = widths[Math.min(i, widths.length - 1)] / 2;
    L.push([pts[i][0] + n[0] * w, pts[i][1] + n[1] * w]);
    R.push([pts[i][0] - n[0] * w, pts[i][1] - n[1] * w]);
  }
  return smooth([...L, ...R.reverse()], {closed: true, tension: 0.42});
}

const rotPts = (pts: Pt[], about: Pt, deg: number): Pt[] => {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return pts.map(([x, y]) => [about[0] + (x - about[0]) * c - (y - about[1]) * s, about[1] + (x - about[0]) * s + (y - about[1]) * c]);
};

/** The kit's idle clocks (kit/Cat): a slow blink every ~3 s, an ear twitch every ~2.6 s; their phases by seed. */
const blinkOn = (t: number, seed: string) => loopT(t, 2.9 + rand(seed, 'bp') * 0.6, rand(seed, 'bo') * 4) < 0.3;
const earTwitch = (t: number, seed: string) => loopT(t, 2.4 + rand(seed, 'ep') * 0.5, rand(seed, 'eo') * 4 + 0.9) < 0.18;

const D2R = Math.PI / 180;

/** The turned head at the origin (local units): ears, head, forehead stripes, eyes + pupils, muzzle, nose, mouth,
 *  whiskers. `yaw` slides every feature over a sphere toward +x; a feature turned past the silhouette is hidden. */
const TurnedHead: React.FC<{yaw: number; eye: Pt; eyes: 'open' | 'closed'; ear: boolean; ink: number; inner: number; seed: string}> = ({yaw, eye, eyes, ear, ink, inner, seed}) => {
  const rx = 17.5;
  const ry = 15;
  const th = yaw * D2R;
  const az = (deg: number) => deg * D2R + th;
  // ears: on the top, set back (latitude ~55 deg): x = 0.62 rx sin(phi + yaw), width by |cos|
  const earPts = (phiDeg: number): Pt[] => {
    const a = az(phiDeg);
    const cx = 0.66 * rx * Math.sin(a);
    const w = 0.84 * rx * Math.max(0.42, Math.abs(Math.cos(a)));
    return [
      [cx - w / 2, -ry * 0.62],
      [cx + 0.1 * rx, -ry * 1.6],
      [cx + w / 2, -ry * 0.5],
    ];
  };
  const innerOf = (e: Pt[]): Pt[] => {
    const m: Pt = [(e[0][0] + e[1][0] + e[2][0]) / 3, (e[0][1] + e[1][1] + e[2][1]) / 3 + ry * 0.08];
    return e.map(([x, y]) => [m[0] + (x - m[0]) * 0.55, m[1] + (y - m[1]) * 0.55]);
  };
  // the far ear (turned away) first; the near ear twitches
  const near = earPts(-46);
  const far = earPts(46);
  const nearT = ear ? rotPts(near, [near[0][0], near[0][1]], -18) : near;
  const headD = blob(0, 0, rx * (1 + 0.06 * Math.sin(th)), ry, {seed: `${seed}/head`, wobble: 0.02});
  // eyes on the face (phi = -/+ 30): the near eye stays, the far eye slides behind the muzzle
  const er = rx * 0.19;
  const eyeY = -ry * 0.1;
  const eyeList = [-30, 30]
    .map((phi) => ({x: 0.96 * rx * Math.sin(az(phi)), k: Math.cos(az(phi))}))
    .filter((e) => e.k > 0.3);
  // muzzle (it stands out past the outline in 3/4), nose, mouth
  const sm = Math.sin(th);
  const mx = 1.02 * rx * sm;
  const my = ry * 0.42;
  const mw = rx * 0.44 * (0.72 + 0.28 * Math.cos(th));
  const muzzle = blob(mx, my, mw, ry * 0.3, {seed: `${seed}/mz`, wobble: 0.03});
  const nx = 1.16 * rx * sm + 0.6;
  const nose = polyPath([
    [nx - rx * 0.12, my - ry * 0.26],
    [nx + rx * 0.08, my - ry * 0.26],
    [nx - rx * 0.01, my - ry * 0.08],
  ]);
  const mouth = smooth([
    [nx - rx * 0.01, my - ry * 0.06],
    [nx - rx * 0.06, my + ry * 0.12],
    [nx - rx * 0.2, my + ry * 0.1],
  ]);
  const whisk =
    [0, 1].map((j) => line(mx + rx * 0.16, my + j * ry * 0.12, mx + rx * (0.78 + 0.08 * j), my - ry * 0.06 + j * ry * 0.24, {over: [0, 0], seed: `${seed}/whF${j}`})).join('') +
    [0, 1].map((j) => line(mx - mw * 0.7, my + j * ry * 0.12, mx - mw * 0.7 - rx * (0.42 + 0.06 * j), my - ry * 0.04 + j * ry * 0.22, {over: [0, 0], seed: `${seed}/whB${j}`})).join('');
  const fx = 0.5 * rx * sm;
  const mStripes = [-0.22, 0, 0.22].map((u, i) => line(fx + u * rx, -ry * 0.92, fx + u * rx * 0.8, -ry * (0.58 - (i === 1 ? 0.06 : 0)), {over: [0, 0], seed: `${seed}/m${i}`})).join('');
  return (
    <>
      {[far, nearT].map((e, i) => (
        <React.Fragment key={i}>
          <Fill d={polyPath(e)} color={CC.catBody} offset={false} />
          <Fill d={polyPath(innerOf(e))} color={CC.catEar} offset={false} />
          <Ink d={smooth(e)} width={inner} />
        </React.Fragment>
      ))}
      <Fill d={headD} color={CC.catBody} seed={`${seed}/headF`} />
      <Ink d={mStripes} width={inner * 1.25} color={CC.catStripe} taper={false} />
      <Ink d={headD} width={ink} open={0.06} />
      <Fill d={muzzle} color={CC.catLight} offset={false} />
      <Ink d={muzzle} width={inner} open={0.18} />
      <Fill d={nose} color={CC.catEar} offset={false} />
      <Ink d={mouth} width={Math.max(1.2, inner * 0.7)} />
      {eyeList.map((e, i) => {
        const w = er * (0.55 + 0.45 * e.k);
        if (eyes === 'closed') return <Ink key={i} d={smooth([[e.x - w, eyeY - er * 0.05], [e.x, eyeY + er * 0.55], [e.x + w, eyeY - er * 0.05]])} width={inner} />;
        const hh = er * 0.84;
        const d = `M${e.x - w} ${eyeY}Q${e.x} ${eyeY - hh * 1.3} ${e.x + w} ${eyeY}Q${e.x} ${eyeY + hh * 1.1} ${e.x - w} ${eyeY}Z`;
        // pupils pinned toward what it watches (the near side of each eye)
        const px = e.x + clamp(eye[0], -1, 1) * w * 0.48;
        const py = eyeY + clamp(eye[1], -1, 1) * er * 0.28 - er * 0.04;
        return (
          <React.Fragment key={i}>
            <Fill d={d} color={CC.catEye} offset={false} />
            <Fill d={blob(px, py, er * 0.24, er * 0.62, {seed: `${seed}/pu${i}`})} color={CC.ink} offset={false} />
            <Ink d={d} width={inner * 0.8} />
          </React.Fragment>
        );
      })}
      <Ink d={whisk} width={Math.max(1.1, inner * 0.55)} />
    </>
  );
};

/** HER CAT at the desk's front edge, sitting, watching (O1 / P12). (x, y) = the ground point under its middle. */
export const DeskCat: React.FC<{x: number; y: number; size: number; pose: DeskCatPose; seed?: string}> = ({x, y, size, pose, seed = 'o1/cat'}) => {
  const t = useTime();
  const S = size / 100;
  const M: Mat = mat.compose(mat.translate(x, y), mat.scale(-S, S));
  const ink = size >= 260 ? W.mid : size >= 160 ? W.far + 0.6 : W.far;
  const inner = Math.max(1.4, ink * 0.62);
  const breathe = 1 + 0.016 * Math.sin((2 * Math.PI * t) / 2.6 + rand(seed, 'br') * 6);
  const eyes: 'open' | 'closed' = blinkOn(t, seed) ? 'closed' : 'open';
  const ear = earTwitch(t, seed);
  const body = (d: string, k: string, color = CC.catBody, open = 0.05) => (
    <>
      <Fill d={d} color={color} seed={`${seed}/${k}`} />
      <Ink d={d} width={ink} open={open} />
    </>
  );
  const stripes = (segs: [Pt, Pt][], w = 4.2) => <Ink d={segs.map(([a, z], i) => line(a[0], a[1], z[0], z[1], {over: [0, 0], seed: `${seed}/st${i}`})).join('')} width={w * S} color={CC.catStripe} taper={false} />;
  // the tail: round the front paws, then its tip hangs over the desk's front edge (local y > 2.5) and swishes; a flick
  // (P12, on "can't") throws it up and back. Stepped at 12 drawings / s.
  const ts = stepT(t, 12);
  const swish = Math.sin(2 * Math.PI * 0.72 * ts + rand(seed, 'sw') * 6) * 0.8 + Math.sin(2 * Math.PI * 1.9 * ts) * 0.2;
  const flick = clamp(pose.flick ?? 0, 0, 1);
  const tail0: Pt[] = [[-36, -5], [-30, 3], [-12, 6], [6, 6], [17, 5]];
  const hang: Pt[] = [[17, 5], [23, 13], [25, 30], [23, 46]];
  const pivot: Pt = [20, 8];
  const hangR = rotPts(hang, pivot, -swish * 22 - flick * 70);
  const tl = [...tail0, ...hangR.slice(1)];
  const tailD = tube(tl, tl.map((_, i) => 8.6 + ((6.2 - 8.6) * i) / (tl.length - 1)));
  const tipA = tl[tl.length - 2];
  const tipZ = tl[tl.length - 1];
  const tipD = tube([[tipA[0] + (tipZ[0] - tipA[0]) * 0.4, tipA[1] + (tipZ[1] - tipA[1]) * 0.4], tipZ], [6.6, 6.2]);
  // the body (kit sit), leaning forward about the paws; the head turned, dipped and moved toward the target
  const lean = clamp(pose.lean, 0, 0.25);
  const shear: Mat = [1, 0, -lean, 1, 0, 0];
  const hc: Pt = [17 + lean * 79 + pose.head[0], -79 + pose.head[1]];
  const bodyD = smooth([[-34, 0], [-42, -14], [-40, -34], [-28, -50], [-10, -60], [4, -66], [14, -65], [21, -55], [22, -38], [20, -18], [18, 0]], {closed: true, tension: 0.4});
  return (
    <XG m={M}>
      <InkScale value={1 / S}>
        {body(tailD, 'tail')}
        <Fill d={tipD} color={CC.catStripe} offset={false} />
        {stripes([[[-22, 0], [-20, 9]], [[0, 1], [0, 9]], [[24, 22], [27, 26]]], 3.2)}
        <XG m={mat.about(mat.scale(1, breathe), 0, 0)}>
          <XG m={shear}>
            {body(tube([[4, -34], [5, -2]], [8.4, 7.6]), 'legF')}
            <Fill d={blob(6, -2.5, 6, 3.6, {seed: `${seed}/pwF`})} color={CC.catLight} offset={false} />
            {body(bodyD, 'body')}
            <Fill d={blob(-21, -19, 21, 18, {seed: `${seed}/haunch`})} color={CC.catBody} offset={false} />
            <Ink d={smooth([[-34, -30], [-24, -38], [-6, -30], [-2, -14], [-6, -2]])} width={inner} />
            {/* the neck: a fill bridge from the chest up to the moved head (shear-frame coords), so it never floats */}
            <Fill d={tube([[12, -56], [hc[0] - 2 + lean * (hc[1] + 8), hc[1] + 8]], [15, 17])} color={CC.catBody} offset={false} />
            {stripes([[[-30, -46], [-25, -35]], [[-18, -55], [-14, -43]], [[-6, -61], [-3, -50]], [[-30, -14], [-22, -10]], [[-28, -26], [-20, -24]]])}
            <Fill d={smooth([[11, -61], [21, -54], [22, -40], [18, -28], [13, -36], [9, -50]], {closed: true})} color={CC.catLight} offset={false} />
            {body(tube([[12, -38], [13, -36], [14, -2]], [9.2, 8.8, 8]), 'legN')}
            <Fill d={blob(16, -2.5, 6.8, 4, {seed: `${seed}/pwN`})} color={CC.catLight} offset={false} />
            <Ink d={ellipse(16, -2.5, 6.8, 4, {seed: `${seed}/pwNI`})} width={inner} />
          </XG>
          <XG m={mat.compose(mat.translate(hc[0], hc[1]), mat.about(mat.rotate(pose.pitch), 0, 9))}>
            <TurnedHead yaw={pose.yaw} eye={pose.eye} eyes={eyes} ear={ear} ink={ink} inner={inner} seed={seed} />
          </XG>
        </XG>
      </InkScale>
    </XG>
  );
};

/** The head centre on canvas for a pose (to aim the eye-line and keep the paper clear of it). */
export const deskCatHead = (x: number, y: number, size: number, pose: Pick<DeskCatPose, 'lean' | 'head'>): Pt => {
  const S = size / 100;
  const lx = 17 + clamp(pose.lean, 0, 0.25) * 79 + pose.head[0];
  const ly = -79 + pose.head[1];
  return [x - lx * S, y + ly * S];
};
