// V2S2 "The wall" (lane L2). Film 6.10-12.98 s; TREATMENT.md §3, §5 (row S2), §8; map.ts S2 (every spot and time).
// RIVERSIDE from the south towpath, BUSY: Google's canal wing as a receding wall of lit windows across the water, her
// dark window ringed, five staff windows around it whose blinds drop on "scared", the bench with the reporter and the
// staffer (the hood goes up), the newsstand's A-board TOLD THE BBC, Pip on the railing post (one beat: on "But" it
// swivels to the wall), the push and the window match into V2S3.
//   6.10-6.70  out of the push-through: the scene's own 1.12 -> 1.00 ease-out (outSine: it keeps settling after the
//              transition's whip and lands at 6.70) about her dark window (200, 795); Pip hops in from the bottom-left
//              under the story windows and lands on the post (590, 1050) at 6.71
//   6.70-8.50  the float: 0 -> -8 px (in-out sine, ~7 px/s), the eye travels down the wall; back to 0 by 12.80
//   6.82 the pencil ring draws round her window ("one") · 8.28-8.44 "But": Pip swivels to the wall · 8.42 the newsagent
//   shoves the A-board out (clack 8.44) · 8.50-12.80 the 6 % story push on W2 · 8.96 "staff": five windows cool, a
//   standing back in each · 9.48 "BBC": the reporter's notebook opens, the staffer turns and leans in · 10.26-10.60
//   "scared": five blinds to half, the backs step back; 10.36 the hood + hunch · 12.20 "contracts": W2's blind fully
//   down · 12.85 the notebook claps shut; Pip hops (PIP_HOP_S2_S3, which L3's V2S3 continues) · 12.98 W2 = W2_CUT.
// Screen space (outside the camera, inside the TimeShift): the flat mint sky over y 0-600 (no built top ever shows
// above y 600 during the pull or the push) and ONE small high cloud in the top gutter (y 150-270, drifting left).
// Everything inside runs on FILM seconds (<TimeShift by={-6.1}>) so map.ts / kit defaults land as written.
// Helpers: V2S2_Set.tsx (the set), V2S2_Life.tsx (life), V2S2_Board.tsx (A-board + newsagent), V2S2_Staff.tsx (the
// staff windows), V2S2_Bench.tsx (the bench pair + notebook), V2S2_Pip.tsx (Pip), V2S2_Layout.ts (shared numbers).
import React from 'react';
import {World} from '../../lib/World';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {InkScale} from '../../lib/inkComp';
import {useTime, TimeShift, clamp, ease} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {CM, INK_PX} from '../palette';
import * as MAP from '../world/map';
import {CanalCast} from '../kit/canal/slots';
import {k4Person} from '../kit/canal/k4k5';
import {V2S2Set} from './V2S2_Set';
import {S2Board, S2Newsagent} from './V2S2_Board';
import {S2FarLife, S2NearLife} from './V2S2_Life';
import {staffOverlay} from './V2S2_Staff';
import {S2BenchPeople} from './V2S2_Bench';
import {PipS2} from './V2S2_Pip';
import type {ToneKey} from '../../lib/Film';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

const S2 = MAP.S2;
const START = 6.1;

// ---------------------------------------------------------------- the camera (film seconds)

/** The float's far point (px): the world slides left a little while the eye travels down the wall (within +-9 px, so
 *  her window and SW5 stay in the key-read box x >= 120), back to 0 by the end of the push. */
export const FLOAT_PX = -8;
/** Float: 0 -> FLOAT_PX over 6.70-8.50 (in-out sine, peak ~7 px/s), then back to 0 by 12.80 (in-out cubic). */
export const floatDx = (t: number): number => {
  const a = S2.camera.pullBack.t1;
  const b = S2.camera.push.t0;
  if (t <= a) return 0;
  if (t <= b) return FLOAT_PX * ease.inOutSine(clamp((t - a) / (b - a)));
  return FLOAT_PX * (1 - ease.inOutCubic(clamp((t - b) / (S2.camera.push.t1 - b))));
};
/** The pull out of the push-through: 1.12 -> 1.00 on an out-sine (still settling after the whip, lands at 6.70). */
export const pullZ = (t: number) => {
  const k = S2.camera.pullBack;
  return k.from + (k.to - k.from) * ease.outSine(clamp((t - k.t0) / (k.t1 - k.t0)));
};
export const pushZ = (t: number) => {
  const k = S2.camera.push;
  return k.from + (k.to - k.from) * ease.inOutCubic(clamp((t - k.t0) / (k.t1 - k.t0)));
};
/** World -> screen at film time t: the push about W2 (outermost), the float, the pull about her window. */
export const s2Cam = (t: number) =>
  mat.compose(
    mat.about(mat.scale(pushZ(t)), S2.camera.push.anchor.x, S2.camera.push.anchor.y),
    mat.translate(floatDx(t), 0),
    mat.about(mat.scale(pullZ(t)), S2.camera.pullBack.anchor.x, S2.camera.pullBack.anchor.y),
  );

// ---------------------------------------------------------------- the story windows

/** The pencil ring round her dark window ("one", 6.82): one loose stroke, drawn on in 0.32 s, a 10 % overshoot. */
const RING_D = (() => {
  const {x, y} = S2.herDarkWindow;
  const rx = 79;
  const ry = 103;
  const pts: string[] = [];
  const a0 = -2.2;
  const span = Math.PI * 2 * 1.1;
  const n = 64;
  for (let i = 0; i <= n; i++) {
    const a = a0 + (span * i) / n;
    const wob = 1 + 0.025 * Math.sin(a * 3 + 1.3) + 0.03 * (i / n);
    pts.push(`${(x + Math.cos(a) * rx * wob).toFixed(1)},${(y + Math.sin(a) * ry * wob).toFixed(1)}`);
  }
  return `M${pts.join('L')}`;
})();

const storyOverlay = (w: MAP.Spot & {id: string}): React.ReactNode => {
  if (w.id === 'HER') return <Ink d={RING_D} at={S2.ringAt} dur={0.32} pace="free" width={INK_PX.front} seed="s2ring" />;
  return staffOverlay(w);
};

// ---------------------------------------------------------------- screen space: the sky and its one cloud

/** One small high cloud in the top gutter: flat skyHigh lobes, no ink, x ~620-1050, y ~150-270, drifting left 4 px/s
 *  (film seconds). Nothing is drawn in y 290-600. */
const CLOUD_LOBES: [number, number, number, number][] = [
  // cx, cy, rx, ry (relative to the cloud's left-bottom anchor)
  [70, -38, 70, 36],
  [150, -62, 78, 52],
  [245, -52, 72, 44],
  [318, -34, 62, 30],
  [190, -22, 150, 22],
];
const S2Cloud: React.FC = () => {
  const t = useTime();
  const x0 = 640 - 4 * (t - START);
  const yb = 262;
  let d = '';
  for (const [cx, cy, rx, ry] of CLOUD_LOBES) {
    const X = x0 + cx;
    const Y = yb + cy;
    d += `M${(X - rx).toFixed(1)} ${Y.toFixed(1)}a${rx} ${ry} 0 1 1 ${2 * rx} 0a${rx} ${ry} 0 1 1 ${-2 * rx} 0Z`;
  }
  // a flat bottom (the lobes sit on one line)
  d += `M${(x0 + 40).toFixed(1)} ${yb - 22}L${(x0 + 350).toFixed(1)} ${yb - 22}L${(x0 + 340).toFixed(1)} ${yb}L${(x0 + 50).toFixed(1)} ${yb}Z`;
  return <Fill d={d} color={CM.skyHigh} offset={false} seed="s2cloud" />;
};

const ScreenSky: React.FC = () => (
  <>
    <Fill rect={[-10, -10, 1100, 610]} color={CM.sky} offset={false} seed="s2skyslab" />
    <S2Cloud />
  </>
);

// ---------------------------------------------------------------- the shot

const Shot: React.FC = () => {
  const t = useTime(); // film seconds
  const z = pullZ(t) * pushZ(t);
  return (
    <>
      <XG m={s2Cam(t)}>
        <InkScale zoom={z} k={0.6}>
          <CanalCast person={k4Person}>
            <V2S2Set
              staffCoolAt={S2.staffOnAt}
              storyOverlay={storyOverlay}
              aBoard={<S2Board />}
              agent={<S2Newsagent />}
              bench={<S2BenchPeople />}
              pip={<PipS2 />}
              farLife={<S2FarLife />}
              near={<S2NearLife />}
            />
          </CanalCast>
        </InkScale>
      </XG>
      <ScreenSky />
    </>
  );
};

const V2S2: React.FC = () => (
  <World sky={[CM.sky, CM.bandGold]} horizon={1000}>
    <TimeShift by={-START}>
      <Shot />
    </TimeShift>
  </World>
);
export default V2S2;
