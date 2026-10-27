// kit/Cat.tsx: HER CAT, the film's recurring living character (ONE model; it lives in her home only: O1, P2, P4, P5, P6,
// P12, P13; never on the deal or Google pages, never in P3 or P8). A warm dark tabby (CC.catBody / catStripe, cream chest,
// muzzle and paws, amber eyes): it reads on the cream wall, the apricot desk and the dusk-blue window, and it is never the
// hero cobalt or the pop orange. Secondary: it never steals the key action; keep it out of the caption band and never on
// the clause, the bubble or her face. Its eye-line can lead the viewer (`look`).
//   <Cat x y size pose facing look life at seed />
//   x, y   the ground point under the cat's middle (canvas px): the shelf, sill, desk or floor line it sits on
//   size   body length (nose to rump, tail excluded) in canvas px. Board sizes: nook wide (P2) ~150, P13 ~180, P4 ~210,
//          a desk-close cat (O1 / P5) 300-520; reads from ~90 px.
//   pose   'sit' (side, 3/4 head) | 'sitFront' | 'loaf' | 'sleep' (curled) | 'walk' (side; move x yourself) | 'peek'
//          (head + paws over an edge at y: a desk-close insert)
//   look   a canvas point the head (and the eyes) turn toward (the badge, the run-on paper, the bubble)
//   life   idle life (default on): breathing, a slow blink, an ear twitch, a tail flick (sit / loaf / sleep: the tip
//          only), each on its own seeded clock; `wash` = [t0, t1] windows where a front paw rises to the mouth (sit).
// Drawn in local units (body length 100), placed by a matrix; ink stays at screen weight (W.far below 160 px, W.mid up).

import React from 'react';
import {blob, ellipse, line, polyPath, smooth} from '../../../lib/sketch';
import {rand} from '../../../lib/rng';
import {clamp, useTime} from '../../../lib/time';
import {mat, Mat, XG} from '../../../lib/xf';
import {InkScale} from '../../../lib/inkComp';
import {CC} from '../palette';
import {applyM, At, b, Fill, fillAt, Ink, Pt, W} from './util';
import {loopT, stepT} from './Ambient';

export type CatPose = 'sit' | 'sitFront' | 'loaf' | 'sleep' | 'walk' | 'peek';

export type CatProps = {
  x: number;
  y: number;
  /** Body length px (default 150). */
  size?: number;
  pose?: CatPose;
  facing?: 'l' | 'r';
  /** A canvas point to look at (head turn + pupils). */
  look?: Pt;
  /** Idle life (default true). */
  life?: boolean;
  /** Paw-wash windows [t0, t1] (scene s), 'sit' only. */
  wash?: [number, number][];
  /** Eyes: 'open' (default) | 'half' (drowsy) | 'closed'. 'sleep' is always closed. */
  eyes?: 'open' | 'half' | 'closed';
  at?: At;
  seed?: string;
};

/** A tube along points with per-point widths (local units): a closed smooth outline. */
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

/** Seeded idle clocks (the AD: a cat event every ~1.5 s that READS at phone size): a slow blink every ~3 s (0.3 s), an
 *  ear twitch every ~2.6 s, a big tail flick every ~2 s (0.6 s, stepped at 12 drawings / s); their phases interleave. */
const blinkOn = (t: number, seed: string) => loopT(t, 2.9 + rand(seed, 'bp') * 0.6, rand(seed, 'bo') * 4) < 0.3;
const earTwitch = (t: number, seed: string) => loopT(t, 2.4 + rand(seed, 'ep') * 0.5, rand(seed, 'eo') * 4 + 0.9) < 0.18;
const tailFlick = (t: number, seed: string) => {
  const per = 1.8 + rand(seed, 'tp') * 0.5;
  const u = loopT(stepT(t, 12), per, rand(seed, 'to') * per + 0.5);
  return u < 0.6 ? Math.sin((u / 0.6) * Math.PI) : 0;
};

type Head = {c: Pt; rx: number; ry: number; front: number; rot: number; eyeDir: Pt; eyes: 'open' | 'half' | 'closed'; ear: boolean};

/** The head (local units): ears, head, muzzle, nose, eyes, forehead stripes, whiskers. `front` 0 = 3/4 side (facing
 *  +x), 1 = straight to camera. */
const CatHead: React.FC<{h: Head; ink: number; inner: number; detail: boolean; at: At; seed: string}> = ({h, ink, inner, detail, at, seed}) => {
  const {c, rx, ry, front} = h;
  const cx = c[0];
  const cy = c[1];
  const off = (1 - front) * rx * 0.34; // the face's centre slides toward +x in 3/4
  const fx = cx + off;
  // ears (in head units): base points and tip; the 3/4 far ear is narrower
  const earPts = (side: number): Pt[] => {
    const k = side < 0 ? 1 - 0.35 * (1 - front) : 1;
    const bx0 = fx + side * rx * 0.25;
    const bx1 = fx + side * rx * 0.95 * k + (side < 0 ? 0 : 0);
    const tip: Pt = [fx + side * rx * 0.78 * k, cy - ry * 1.62];
    return [[bx0, cy - ry * 0.78], tip, [bx1, cy - ry * 0.42]];
  };
  const twitch = h.ear ? 22 : 0;
  const earL = rotPts(earPts(-1), [fx - rx * 0.6, cy - ry * 0.6], -twitch * 0.2);
  const earR = rotPts(earPts(1), [fx + rx * 0.6, cy - ry * 0.6], twitch);
  const innerOf = (e: Pt[]): Pt[] => {
    const m: Pt = [(e[0][0] + e[1][0] + e[2][0]) / 3, (e[0][1] + e[1][1] + e[2][1]) / 3 + ry * 0.08];
    return e.map(([x, y]) => [m[0] + (x - m[0]) * 0.55, m[1] + (y - m[1]) * 0.55]);
  };
  const headD = blob(cx, cy, rx, ry, {seed: `${seed}/head`, wobble: 0.02});
  const eyeY = cy - ry * 0.08;
  const eyeX = [fx - rx * (0.42 - 0.08 * (1 - front)), fx + rx * 0.4];
  const er = rx * 0.17;
  const muz: Pt = [fx + rx * 0.02, cy + ry * 0.42];
  const muzzle = blob(muz[0] - rx * 0.2, muz[1], rx * 0.26, ry * 0.26, {seed: `${seed}/mzL`}) + blob(muz[0] + rx * 0.2, muz[1], rx * 0.26, ry * 0.26, {seed: `${seed}/mzR`});
  const nose = polyPath([[muz[0] - rx * 0.1, muz[1] - ry * 0.26], [muz[0] + rx * 0.1, muz[1] - ry * 0.26], [muz[0], muz[1] - ry * 0.1]]);
  const mouth = smooth([[muz[0] - rx * 0.16, muz[1] + ry * 0.06], [muz[0] - rx * 0.06, muz[1] + ry * 0.12], [muz[0], muz[1] - ry * 0.06]]) + smooth([[muz[0], muz[1] - ry * 0.06], [muz[0] + rx * 0.06, muz[1] + ry * 0.12], [muz[0] + rx * 0.16, muz[1] + ry * 0.06]]);
  const whisk = [-1, 1]
    .map((sd) =>
      [0, 1].map((j) => line(muz[0] + sd * rx * 0.3, muz[1] + j * ry * 0.1, muz[0] + sd * rx * (0.95 + 0.1 * j), muz[1] - ry * 0.08 + j * ry * 0.22, {over: [0, 0], seed: `${seed}/wh${sd}${j}`})).join(''),
    )
    .join('');
  const mStripes = [-0.22, 0, 0.22].map((u, i) => line(fx + u * rx, cy - ry * 0.92, fx + u * rx * 0.8, cy - ry * (0.58 - (i === 1 ? 0.06 : 0)), {over: [0, 0], seed: `${seed}/m${i}`})).join('');
  const eyeShape = (ex: number, i: number) => {
    const w = er * (i === 0 ? 0.9 + 0.1 * front : 1);
    if (h.eyes === 'closed') return {closed: smooth([[ex - w, eyeY - er * 0.05], [ex, eyeY + er * 0.55], [ex + w, eyeY - er * 0.05]]), open: ''};
    const hh = h.eyes === 'half' ? er * 0.45 : er * 0.82;
    return {closed: '', open: `M${ex - w} ${eyeY}Q${ex} ${eyeY - hh * 1.3} ${ex + w} ${eyeY}Q${ex} ${eyeY + hh * 1.1} ${ex - w} ${eyeY}Z`};
  };
  const eyes = eyeX.map((ex, i) => eyeShape(ex, i));
  const pd: Pt = [h.eyeDir[0] * er * 0.38, h.eyeDir[1] * er * 0.25];
  return (
    <XG m={mat.about(mat.rotate(h.rot), cx, cy + ry * 0.6)}>
      {[earL, earR].map((e, i) => (
        <React.Fragment key={i}>
          <Fill d={polyPath(e)} color={CC.catBody} at={fillAt(at, 0.04)} offset={false} />
          {detail ? <Fill d={polyPath(innerOf(e))} color={CC.catEar} at={fillAt(at, 0.06)} offset={false} /> : null}
          <Ink d={smooth(e)} width={inner} at={b(at, 0.04)} />
        </React.Fragment>
      ))}
      <Fill d={headD} color={CC.catBody} at={fillAt(at, 0.02)} seed={`${seed}/headF`} />
      <Fill d={muzzle} color={CC.catLight} at={fillAt(at, 0.06)} offset={false} />
      {detail ? <Ink d={mStripes} width={inner * 1.25} color={CC.catStripe} at={b(at, 0.08)} taper={false} /> : null}
      <Ink d={headD} width={ink} at={b(at, 0.02)} open={0.06} />
      <Fill d={nose} color={CC.catEar} at={fillAt(at, 0.08)} offset={false} />
      {detail ? <Ink d={mouth} width={Math.max(1.2, inner * 0.7)} at={b(at, 0.1)} /> : null}
      {eyes.map((e, i) =>
        e.open ? (
          <React.Fragment key={i}>
            <Fill d={e.open} color={detail ? CC.catEye : CC.ink} at={fillAt(at, 0.08)} offset={false} />
            {detail ? (
              <>
                <Fill d={blob(eyeX[i] + pd[0], eyeY + pd[1] - er * 0.05, er * 0.2, er * (h.eyes === 'half' ? 0.3 : 0.6), {seed: `${seed}/pu${i}`})} color={CC.ink} at={fillAt(at, 0.1)} offset={false} />
                <Ink d={e.open} width={inner * 0.8} at={b(at, 0.08)} />
              </>
            ) : null}
          </React.Fragment>
        ) : (
          <Ink key={i} d={e.closed} width={inner} at={b(at, 0.08)} />
        ),
      )}
      {detail ? <Ink d={whisk} width={Math.max(1.1, inner * 0.55)} at={b(at, 0.12)} /> : null}
    </XG>
  );
};

export const Cat: React.FC<CatProps> = ({x, y, size = 150, pose = 'sit', facing = 'r', look, life = true, wash, eyes = 'open', at, seed = 'cat'}) => {
  const tReal = useTime();
  const t = life ? tReal : 0;
  const S = size / 100;
  const sx = facing === 'r' ? 1 : -1;
  const breathe = life ? 1 + 0.016 * Math.sin((2 * Math.PI * t) / (pose === 'sleep' ? 3.2 : 2.6) + rand(seed, 'br') * 6) : 1;
  const M: Mat = mat.compose(mat.translate(x, y), mat.scale(sx * S, S));
  const ink = size >= 260 ? W.mid : size >= 160 ? W.far + 0.6 : W.far;
  const inner = Math.max(1.4, ink * 0.62);
  const detail = size >= 110;
  const blink = life && blinkOn(t, seed);
  const ear = life && earTwitch(t, seed);
  const flick = life ? tailFlick(t, seed) : 0;
  // a head tilt every ~4.4 s (1.1 s, a held drawing): curious, then back
  const glance = life && loopT(stepT(t, 12), 4.2 + rand(seed, 'gp') * 0.6, rand(seed, 'go') * 4 + 2.1) < 1.1 ? 1 : 0;
  const washing = pose === 'sit' && !!wash && wash.some(([a, z]) => tReal >= a && tReal < z);
  const eyeState: Head['eyes'] = pose === 'sleep' || eyes === 'closed' ? 'closed' : blink ? 'closed' : washing ? 'half' : eyes;
  // the look target in local units
  const lookLocal = (hc: Pt): {dir: Pt; ang: number} => {
    if (!look) return {dir: [0.5, 0.1], ang: 0};
    const inv = mat.inv(M);
    const q = applyM(inv, look[0], look[1]);
    const dx = q[0] - hc[0];
    const dy = q[1] - hc[1];
    const l = Math.hypot(dx, dy) || 1;
    return {dir: [dx / l, dy / l], ang: (Math.atan2(dy, Math.max(8, Math.abs(dx)) * Math.sign(dx || 1)) * 180) / Math.PI};
  };
  const body = (d: string, k: string, color = CC.catBody, open = 0.05) => (
    <>
      <Fill d={d} color={color} at={fillAt(at)} seed={`${seed}/${k}`} />
      <Ink d={d} width={ink} at={at} open={open} />
    </>
  );
  const stripes = (segs: [Pt, Pt][], w = 4.2) => (detail ? <Ink d={segs.map(([a, z], i) => line(a[0], a[1], z[0], z[1], {over: [0, 0], seed: `${seed}/st${i}`})).join('')} width={w * S} color={CC.catStripe} at={b(at, 0.08)} taper={false} /> : null);
  const tailD = (pts: Pt[], w0 = 8.5, w1 = 6.2) => tube(pts, pts.map((_, i) => w0 + ((w1 - w0) * i) / Math.max(1, pts.length - 1)));
  const tailTip = (pts: Pt[]) => {
    const a = pts[pts.length - 2];
    const z = pts[pts.length - 1];
    return tube([[a[0] + (z[0] - a[0]) * 0.45, a[1] + (z[1] - a[1]) * 0.45], z], [6.6, 6.2]);
  };
  let content: React.ReactNode = null;
  if (pose === 'sit' || pose === 'sitFront') {
    const front = pose === 'sitFront';
    const hc: Pt = front ? [0, -73] : [17, -79];
    const lk = lookLocal(hc);
    const rot = (look ? clamp(lk.ang * (front ? 0.25 : 0.55), -32, 26) : 0) + glance * (look ? -8 : -14);
    const head: Head = {c: hc, rx: front ? 19 : 17, ry: front ? 16 : 15, front: front ? 1 : 0, rot, eyeDir: lk.dir, eyes: eyeState, ear};
    if (front) {
      const bodyD = smooth([[-26, 0], [-31, -14], [-23, -34], [-14, -51], [0, -57], [14, -51], [23, -34], [31, -14], [26, 0]], {closed: true, tension: 0.4});
      let tail: Pt[] = [[22, -6], [33, 2], [18, 6], [-4, 6], [-18, 2]];
      tail = [...tail.slice(0, 3), ...rotPts(tail.slice(3), tail[2], 0), ...[]];
      const tailF = rotPts(tail.slice(3), tail[2], -flick * 34);
      const tl = [...tail.slice(0, 3), ...tailF];
      content = (
        <XG m={mat.about(mat.scale(1, breathe), 0, 0)}>
          {body(tailD(tl), 'tail')}
          {stripes([[[26, -1], [30, 4]], [[10, 2], [10, 8]]], 3)}
          {body(bodyD, 'body')}
          {[-1, 1].map((sd) => (
            <React.Fragment key={sd}>
              <Fill d={blob(sd * 20, -13, 12, 12, {seed: `${seed}/hn${sd}`})} color={CC.catBody} at={fillAt(at, 0.02)} offset={false} />
              <Ink d={smooth([[sd * 9, -22], [sd * 22, -26], [sd * 31, -12], [sd * 27, -1]])} width={inner} at={b(at, 0.03)} />
            </React.Fragment>
          ))}
          <Fill d={smooth([[-10, -53], [10, -53], [9, -30], [0, -20], [-9, -30]], {closed: true})} color={CC.catLight} at={fillAt(at, 0.04)} offset={false} />
          {stripes([[[-20, -40], [-14, -34]], [[20, -40], [14, -34]], [[-25, -24], [-18, -20]], [[25, -24], [18, -20]]], 3.4)}
          {[-1, 1].map((sd) => (
            <React.Fragment key={`l${sd}`}>
              {body(tube([[sd * 7, -40], [sd * 7.5, -3]], [9, 8.4]), `leg${sd}`)}
              <Fill d={blob(sd * 8, -2.5, 6.6, 4, {seed: `${seed}/pw${sd}`})} color={CC.catLight} at={fillAt(at, 0.05)} offset={false} />
              <Ink d={ellipse(sd * 8, -2.5, 6.6, 4, {seed: `${seed}/pwI${sd}`})} width={inner} at={b(at, 0.05)} />
            </React.Fragment>
          ))}
          <CatHead h={head} ink={ink} inner={inner} detail={detail} at={at} seed={seed} />
        </XG>
      );
    } else {
      const bodyD = smooth([[-34, 0], [-42, -14], [-40, -34], [-28, -50], [-10, -60], [4, -66], [14, -65], [21, -55], [22, -38], [20, -18], [18, 0]], {closed: true, tension: 0.4});
      const tail0: Pt[] = [[-36, -5], [-30, 3], [-10, 5], [10, 4], [26, 1], [33, -6]];
      const tl = [...tail0.slice(0, 4), ...rotPts(tail0.slice(4), tail0[3], -flick * 48)];
      const pawUp = washing ? Math.sin(((tReal * 6) % 1) * Math.PI) : 0;
      const nearPaw: Pt = washing ? [24, -66 + pawUp * 3] : [14, -2];
      const nearKnee: Pt = washing ? [22, -46] : [13, -36];
      content = (
        <XG m={mat.about(mat.scale(1, breathe), 0, 0)}>
          {body(tailD(tl), 'tail')}
          <Fill d={tailTip(tl)} color={CC.catStripe} at={fillAt(at, 0.03)} offset={false} />
          {stripes([[[-22, 0], [-20, 9]], [[0, 1], [0, 9]], [[16, -1], [18, 7]]], 3.2)}
          {body(tube([[4, -34], [5, -2]], [8.4, 7.6]), 'legF', CC.catBody)}
          <Fill d={blob(6, -2.5, 6, 3.6, {seed: `${seed}/pwF`})} color={CC.catLight} at={fillAt(at, 0.05)} offset={false} />
          {body(bodyD, 'body')}
          <Fill d={blob(-21, -19, 21, 18, {seed: `${seed}/haunch`})} color={CC.catBody} at={fillAt(at, 0.02)} offset={false} />
          <Ink d={smooth([[-34, -30], [-24, -38], [-6, -30], [-2, -14], [-6, -2]])} width={inner} at={b(at, 0.03)} />
          {stripes([[[-30, -46], [-25, -35]], [[-18, -55], [-14, -43]], [[-6, -61], [-3, -50]], [[-30, -14], [-22, -10]], [[-28, -26], [-20, -24]]])}
          <Fill d={smooth([[11, -61], [21, -54], [22, -40], [18, -28], [13, -36], [9, -50]], {closed: true})} color={CC.catLight} at={fillAt(at, 0.04)} offset={false} />
          {body(tube([nearKnee[0] === 13 ? [12, -38] : [16, -50], nearKnee, nearPaw], [9.2, 8.8, 8]), 'legN')}
          <Fill d={blob(nearPaw[0] + 2, nearPaw[1] - 0.5, 6.8, 4, {seed: `${seed}/pwN`})} color={CC.catLight} at={fillAt(at, 0.05)} offset={false} />
          <Ink d={ellipse(nearPaw[0] + 2, nearPaw[1] - 0.5, 6.8, 4, {seed: `${seed}/pwNI`})} width={inner} at={b(at, 0.05)} />
          <CatHead h={{...head, rot: washing ? 14 : head.rot}} ink={ink} inner={inner} detail={detail} at={at} seed={seed} />
        </XG>
      );
    }
  } else if (pose === 'loaf') {
    const hc: Pt = [24, -45];
    const lk = lookLocal(hc);
    const head: Head = {c: hc, rx: 16, ry: 14, front: 0.3, rot: (look ? clamp(lk.ang * 0.5, -25, 20) : 0) + glance * -12, eyeDir: lk.dir, eyes: eyes === 'open' && eyeState !== 'closed' ? 'half' : eyeState, ear};
    const bodyD = smooth([[-40, 0], [-46, -12], [-44, -28], [-30, -40], [0, -43], [20, -39], [29, -26], [29, -9], [24, 0]], {closed: true, tension: 0.4});
    const tail0: Pt[] = [[-42, -6], [-36, 2], [-14, 4], [6, 3], [18, 1]];
    const tl = [...tail0.slice(0, 3), ...rotPts(tail0.slice(3), tail0[2], -flick * 30)];
    content = (
      <XG m={mat.about(mat.scale(1, breathe), 0, 0)}>
        {body(bodyD, 'body')}
        {stripes([[[-34, -36], [-30, -24]], [[-20, -41], [-17, -28]], [[-6, -43], [-4, -30]], [[8, -42], [9, -31]]])}
        <Fill d={blob(24, -3, 9, 3.6, {seed: `${seed}/pw`})} color={CC.catLight} at={fillAt(at, 0.05)} offset={false} />
        <Ink d={ellipse(24, -3, 9, 3.6, {seed: `${seed}/pwI`})} width={inner} at={b(at, 0.05)} />
        {body(tailD(tl, 7.6, 6), 'tail')}
        <Fill d={tailTip(tl)} color={CC.catStripe} at={fillAt(at, 0.03)} offset={false} />
        <CatHead h={head} ink={ink} inner={inner} detail={detail} at={at} seed={seed} />
      </XG>
    );
  } else if (pose === 'sleep') {
    const bodyD = smooth([[-40, -2], [-44, -20], [-32, -40], [-6, -46], [20, -40], [36, -24], [38, -6], [30, 0]], {closed: true, tension: 0.42});
    const tail0: Pt[] = [[-38, -6], [-28, 3], [0, 5], [22, 2], [34, -6], [38, -14]];
    const tl = [...tail0.slice(0, 4), ...rotPts(tail0.slice(4), tail0[3], -flick * 22)];
    const head: Head = {c: [20, -24], rx: 15, ry: 12.5, front: 0.6, rot: 12, eyeDir: [0, 0], eyes: 'closed', ear};
    content = (
      <XG m={mat.about(mat.scale(1, breathe), 0, 0)}>
        {body(bodyD, 'body')}
        <Fill d={blob(-16, -24, 20, 16, {seed: `${seed}/haunch`})} color={CC.catBody} at={fillAt(at, 0.02)} offset={false} />
        <Ink d={smooth([[-34, -30], [-22, -40], [-4, -34], [0, -18]])} width={inner} at={b(at, 0.03)} />
        {stripes([[[-28, -40], [-24, -30]], [[-14, -45], [-11, -34]], [[0, -46], [1, -36]], [[-36, -18], [-28, -16]]])}
        <CatHead h={head} ink={ink} inner={inner} detail={detail} at={at} seed={seed} />
        {body(tailD(tl, 8.4, 6.6), 'tail')}
        <Fill d={tailTip(tl)} color={CC.catStripe} at={fillAt(at, 0.03)} offset={false} />
      </XG>
    );
  } else if (pose === 'walk') {
    const ph = stepT(tReal, 10) * 5.2;
    const leg = (hip: Pt, k: number, key: string, color: string) => {
      const a = ph + k;
      const foot: Pt = [hip[0] + Math.sin(a) * 9, -2 - Math.max(0, Math.cos(a)) * 6];
      const knee: Pt = [(hip[0] + foot[0]) / 2 + 3, (hip[1] + foot[1]) / 2];
      return body(tube([hip, knee, foot], [9, 7.6, 7]), key, color);
    };
    const hc: Pt = [40, -54];
    const lk = lookLocal(hc);
    const head: Head = {c: hc, rx: 15, ry: 13, front: 0, rot: look ? clamp(lk.ang * 0.4, -20, 20) : 0, eyeDir: lk.dir, eyes: eyeState, ear};
    const tail: Pt[] = [[-38, -42], [-50, -58], [-52, -78], [-44 + Math.sin(ph * 0.5) * 3, -88]];
    content = (
      <>
        {leg([-28, -30], Math.PI, 'lbF', CC.catBody)}
        {leg([20, -32], 0, 'lfF', CC.catBody)}
        {body(tailD(tail, 8, 6.2), 'tail')}
        <Fill d={tailTip(tail)} color={CC.catStripe} at={fillAt(at, 0.03)} offset={false} />
        {body(smooth([[-40, -30], [-38, -46], [-20, -53], [10, -51], [27, -47], [31, -37], [24, -27], [0, -25], [-30, -24]], {closed: true, tension: 0.4}), 'body')}
        {stripes([[[-30, -50], [-27, -38]], [[-16, -53], [-13, -41]], [[-2, -52], [0, -41]], [[12, -51], [13, -41]]])}
        {leg([-24, -30], 0, 'lbN', CC.catBody)}
        {leg([24, -32], Math.PI, 'lfN', CC.catBody)}
        <CatHead h={head} ink={ink} inner={inner} detail={detail} at={at} seed={seed} />
      </>
    );
  } else {
    // peek: the head and both front paws over an edge at y = 0
    const hc: Pt = [0, -27];
    const lk = lookLocal(hc);
    const head: Head = {c: hc, rx: 20, ry: 17, front: 1, rot: look ? clamp(lk.ang * 0.18, -16, 16) : 0, eyeDir: lk.dir, eyes: eyeState, ear};
    content = (
      <>
        <Fill d={smooth([[-24, 0], [-22, -14], [0, -18], [22, -14], [24, 0]], {closed: true})} color={CC.catBody} at={fillAt(at)} offset={false} />
        <CatHead h={head} ink={ink} inner={inner} detail={detail} at={at} seed={seed} />
        {[-1, 1].map((sd) => (
          <React.Fragment key={sd}>
            <Fill d={blob(sd * 13, -3, 9, 5, {seed: `${seed}/pk${sd}`})} color={CC.catBody} at={fillAt(at, 0.05)} offset={false} />
            <Fill d={blob(sd * 13, -2, 7, 3, {seed: `${seed}/pkt${sd}`})} color={CC.catLight} at={fillAt(at, 0.06)} offset={false} />
            <Ink d={smooth([[sd * 13 - 9, 0], [sd * 13 - 8, -6], [sd * 13, -8], [sd * 13 + 8, -6], [sd * 13 + 9, 0]])} width={inner} at={b(at, 0.05)} />
          </React.Fragment>
        ))}
      </>
    );
  }
  return (
    <XG m={M}>
      <InkScale value={1 / S}>{content}</InkScale>
    </XG>
  );
};

/** The cat's head centre on canvas (aim a look line, keep it clear of the bubble). */
export const catHead = (p: {x: number; y: number; size?: number; pose?: CatPose; facing?: 'l' | 'r'}): Pt => {
  const S = (p.size ?? 150) / 100;
  const sx = (p.facing ?? 'r') === 'r' ? 1 : -1;
  const pose = p.pose ?? 'sit';
  const hc: Pt = pose === 'sitFront' ? [0, -73] : pose === 'loaf' ? [24, -45] : pose === 'sleep' ? [20, -24] : pose === 'walk' ? [40, -54] : pose === 'peek' ? [0, -27] : [17, -79];
  return [p.x + sx * hc[0] * S, p.y + hc[1] * S];
};
