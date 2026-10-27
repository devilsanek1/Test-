// V2S2 "The wall" (lane L2). Film 6.10-12.98 s; TREATMENT.md §3, §5 (row S2), §8; map.ts S2 (every spot and time).
// RIVERSIDE from the south towpath, BUSY: Google's canal wing as a receding wall of lit windows across the water, her
// dark window ringed, five staff windows around it whose blinds drop on "scared", the bench with the reporter and the
// staffer (the hood goes up), the newsstand's A-board TOLD THE BBC, Pip on the railing post (one beat: on "But" its
// head turns to the wall), the push and the window match into V2S3.
//   6.10-6.70  out of the push-through: the scene's own 1.12 -> 1.00 ease-out about her dark window (200, 795); Pip
//              hops in from the bottom-left and lands on the post (590, 1050)
//   6.82 the pencil ring draws round her window ("one") · 8.30 "But": Pip's head turns to the wall · 8.44 the A-board
//   slides out (newsagent) · 8.50-12.80 the 6 % story push on W2 · 8.96 "staff": five windows cool, a standing back in
//   each · 9.48 "BBC": notebook opens, the staffer turns · 10.26-10.60 "scared": five blinds to half, the backs step
//   back; 10.36 the hood · 12.20 "contracts": W2's blind fully down · 12.85 the notebook claps shut; Pip hops (the arc
//   PIP_HOP_S2_S3 that L3's V2S3 continues) · 12.98 the match: W2 = W2_CUT.
// Everything inside runs on FILM seconds (<TimeShift by={-6.1}>) so map.ts / kit defaults land as written.
// Helpers: V2S2_Set.tsx (the set, forked from the canal kit), V2S2_Board.tsx (A-board + newsagent), V2S2_Life.tsx.
import React from 'react';
import {World} from '../../lib/World';
import {Ink} from '../../lib/Ink';
import {InkScale} from '../../lib/inkComp';
import {useTime, TimeShift, clamp, ease} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {CM, INK_PX} from '../palette';
import * as MAP from '../world/map';
import {CanalCast} from '../kit/canal/slots';
import {k4Person} from '../kit/canal/k4k5';
import {StaffWindow, Staffer, Reporter} from '../kit/cast';
import type {BlindKey} from '../kit/cast/Staff';
import {PipTrack} from '../kit/pip';
import {V2S2Set, S2_BENCH_SEAT} from './V2S2_Set';
import {S2Board, S2Newsagent} from './V2S2_Board';
import {S2FarLife, S2NearLife} from './V2S2_Life';
import type {ToneKey} from '../../lib/Film';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

const S2 = MAP.S2;
const START = 6.1;

// ---------------------------------------------------------------- the camera (film seconds)

/** Float: ~10 px/s drift (the world slides left: the eye travels down the wall), back to 0 by the cut. */
const floatDx = (t: number): number => {
  const a = 6.7;
  const b = S2.camera.push.t0;
  if (t <= a) return 0;
  if (t <= b) return -S2.camera.floatPxS * (t - a);
  const peak = -S2.camera.floatPxS * (b - a);
  return peak * (1 - ease.inOutCubic(clamp((t - b) / (S2.camera.push.t1 - b))));
};
const pullZ = (t: number) => {
  const k = S2.camera.pullBack;
  return k.from + (k.to - k.from) * ease.outCubic(clamp((t - k.t0) / (k.t1 - k.t0)));
};
const pushZ = (t: number) => {
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
  const i = S2.staffWindows.findIndex((s) => s.id === w.id);
  if (i < 0) return null;
  const tBlind = S2.blindsAt + i * S2.blindsStagger;
  const keys: BlindKey[] = [{t: tBlind, k: 0.5}];
  if (w.id === 'W2') keys.push({t: S2.w2BlindDownAt, k: 1});
  return <StaffWindow x={w.x} y={w.y} w={w.w} h={w.h} seed={w.id} lightAt={S2.staffOnAt + i * S2.staffOnStagger} backAt={tBlind} blind={keys} pane={false} />;
};

// ---------------------------------------------------------------- the bench and Pip

const REPORTER = {x: 634, h: 156};
const STAFFER = {x: 728, h: 184};

const Bench: React.FC = () => (
  <>
    <Reporter x={REPORTER.x} y={S2_BENCH_SEAT} h={REPORTER.h} />
    <Staffer x={STAFFER.x} y={S2_BENCH_SEAT} h={STAFFER.h} />
  </>
);

/** Pip's world-space landing for the S2 -> S3 hop: the inverse of S3.pipSeat under the 1.06 push (no float then). */
const HOP_TO: [number, number] = (() => {
  const a = S2.camera.push.anchor;
  const z = S2.camera.push.to;
  return [a.x + (MAP.S3.pipSeat.x - a.x) / z, a.y + (MAP.S3.pipSeat.y - a.y) / z];
})();

const PipS2: React.FC = () => (
  <PipTrack
    x={-70}
    y={1270}
    size={100}
    facing="back"
    seed="pipS2"
    keys={[
      {t: 6.14, hop: {to: [S2.pipSeat.x, S2.pipSeat.y], height: 170, dur: 0.5, style: 'tuck'}},
      {t: 6.95, target: [REPORTER.x + 10, S2_BENCH_SEAT - REPORTER.h * 0.7]},
      {t: MAP.PIP.find((p) => p.shot === 'V2S2')!.beats[1].t, target: [S2.staffWindows[0].x, S2.staffWindows[0].y], dur: 0.22},
      {t: MAP.PIP_HOP_S2_S3.t0, target: null, hop: {to: HOP_TO, height: MAP.PIP_HOP_S2_S3.apexPx / S2.camera.push.to, dur: MAP.PIP_HOP_S2_S3.t1 - MAP.PIP_HOP_S2_S3.t0}},
    ]}
  />
);

// ---------------------------------------------------------------- the shot

const Shot: React.FC = () => {
  const t = useTime(); // film seconds
  const z = pullZ(t) * pushZ(t);
  return (
    <XG m={s2Cam(t)}>
      <InkScale zoom={z} k={0.6}>
        <CanalCast person={k4Person}>
          <V2S2Set
            staffCoolAt={S2.staffOnAt}
            storyOverlay={storyOverlay}
            aBoard={<S2Board />}
            agent={<S2Newsagent />}
            bench={<Bench />}
            pip={<PipS2 />}
            farLife={<S2FarLife />}
            near={<S2NearLife />}
          />
        </CanalCast>
      </InkScale>
    </XG>
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
