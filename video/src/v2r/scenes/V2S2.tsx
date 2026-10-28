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
import {S2Plane, S2_PLANE} from './V2S2_Float';
import {Tier} from '../../lib/tier';
import {Sky} from '../../lib/sky';
import {S2_EVENING} from '../world/skies';
import type {ToneKey} from '../../lib/Film';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

const S2 = MAP.S2;
const START = 6.1;

// ---------------------------------------------------------------- the camera (film seconds)

/** The pull out of the push-through: 1.12 -> 1.00 about her window M on an out-sine (still settling after the
 *  transition's whip, lands at 6.70). The 6 % story push is retired (DIRECTION rule 8: no zoom in a hold). */
export const pullZ = (t: number) => {
  const k = S2.camera.pullBack;
  return k.from + (k.to - k.from) * ease.outSine(clamp((t - k.t0) / (k.t1 - k.t0)));
};
/** World -> screen at film time t: the pull about M. The float is per plane (V2S2_Float S2Plane). */
export const s2Cam = (t: number) => mat.about(mat.scale(pullZ(t)), S2.camera.pullBack.anchor.x, S2.camera.pullBack.anchor.y);

// ---------------------------------------------------------------- the story windows

/** Her dark window's A outline (6.82 "one"): pops on in ONE frame (DIRECTION rule 8 keeps draw-ons for frame 0), one
 *  closed line round the pane at M in its stone frame's own deep warm shade (tier subject, tone = the limestone frame:
 *  the clean pen draws it 3.0 px at the tone's L* -35, the only full outline in the frame). The pane stays the plum
 *  anchor all shot. */
const M_RECT = (() => {
  const {x, y, w, h} = S2.herDarkWindow;
  const o = 2; // the line sits on the stone frame round the pane, just outside the plum
  return {x0: x - w / 2 - o, y0: y - h / 2 - o, x1: x + w / 2 + o, y1: y + h / 2 + o};
})();
const HER_OUTLINE_D = `M${M_RECT.x0.toFixed(1)} ${M_RECT.y0.toFixed(1)}H${M_RECT.x1.toFixed(1)}V${M_RECT.y1.toFixed(1)}H${M_RECT.x0.toFixed(1)}Z`;
const HerOutline: React.FC = () => {
  const t = useTime();
  if (t < S2.outlineAt) return null;
  return (
    <Tier tier="subject" tone={CM.limestone}>
      <Ink d={HER_OUTLINE_D} width={INK_PX.mid} seed="s2herOutline" />
    </Tier>
  );
};

const storyOverlay = (w: MAP.Spot & {id: string}): React.ReactNode => {
  if (w.id === 'HER') return <HerOutline />;
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

/** The sky (lib/sky, world/skies S2_EVENING: one continuous gentle gradient, flat through the caption band, warm toward
 *  the horizon behind the tiers) in SCREEN space: it never floats or zooms (DIRECTION rules 6, 8). Then the cloud. */
const ScreenSky: React.FC = () => (
  <>
    <Sky spec={S2_EVENING} />
    <S2Cloud />
  </>
);

/** The world is clipped to y >= 600 on screen: no built top ever shows in the band margin, even while the pull-back's
 *  1.12 lifts the tiers (K2 UI.skylineMinY). */
const WORLD_CLIP_ID = 's2worldclip';

// ---------------------------------------------------------------- the shot

const Shot: React.FC = () => {
  const t = useTime(); // film seconds
  const z = pullZ(t);
  return (
    <>
      <ScreenSky />
      <defs>
        <clipPath id={WORLD_CLIP_ID}>
          <rect x={-60} y={600} width={1200} height={1400} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${WORLD_CLIP_ID})`}>
      <XG m={s2Cam(t)}>
        <InkScale zoom={z} k={0.6}>
          <S2Plane plane={S2_PLANE.subject}>
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
          </S2Plane>
        </InkScale>
      </XG>
      </g>
    </>
  );
};

const V2S2: React.FC = () => (
  <World sky={CM.sky} horizon={1000}>
    <TimeShift by={-START}>
      <Shot />
    </TimeShift>
  </World>
);
export default V2S2;
