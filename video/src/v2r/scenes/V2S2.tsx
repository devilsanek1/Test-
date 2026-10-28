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
import {S2FarLife, S2Motes} from './V2S2_Life';
import {staffOverlay} from './V2S2_Staff';
import {S2BenchPeople} from './V2S2_Bench';
import {PipS2} from './V2S2_Pip';
import {Tier} from '../../lib/tier';
import {toneOnTone} from '../../lib/depth';
import {Lit} from '../../lib/light';
import {RIG_CANAL} from '../world/rigs';
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

/** Her dark window's A outline (6.82 "one"; the critic, 2026-10-28: the old 3 px limestone line, L* 56 C* 8, was
 *  invisible and grey): in ONE frame (DIRECTION rule 8 keeps draw-ons for frame 0) her window becomes a framed object:
 *  a limestone casing pops round the plum pane (a 9 px reveal on three sides, the lit head a step lighter; a 10 px sill
 *  projecting 5 px each side, its lit top a step lighter), and ONE closed 3.0 px line runs round the casing's outer
 *  edge in the brick wall's own deep warm shade (tier subject, tone CM.brickLight: the clean pen draws it at L* -35,
 *  ~L* 39 warm brick), the only full outline in the frame. The pane itself is untouched: exactly M (335, 785) 133 x
 *  164, the plum anchor all shot (the S3 match). */
const HER_CASE = (() => {
  const {x, y, w, h} = S2.herDarkWindow;
  const x0 = x - w / 2;
  const y0 = y - h / 2;
  const x1 = x + w / 2;
  const y1 = y + h / 2;
  const c = 9; // the reveal
  const sill = 10;
  const proj = 5; // the sill's projection past the casing
  return {x0, y0, x1, y1, c, sill, proj, X0: x0 - c, Y0: y0 - c, X1: x1 + c, S0: x0 - c - proj, S1: x1 + c + proj, SY: y1 + sill};
})();
const r1 = (v: number) => v.toFixed(1);
const rectD = (x0: number, y0: number, x1: number, y1: number) => `M${r1(x0)} ${r1(y0)}H${r1(x1)}V${r1(y1)}H${r1(x0)}Z`;
/** The casing's stone (three sides: head, left and right reveals), its lit head, the sill and its lit top. */
const CASE_D = (() => {
  const k = HER_CASE;
  return rectD(k.X0, k.Y0 + 3, k.x0, k.y1) + rectD(k.x1, k.Y0 + 3, k.X1, k.y1);
})();
const CASE_LIT_D = rectD(HER_CASE.X0, HER_CASE.Y0, HER_CASE.X1, HER_CASE.y0);
const SILL_D = rectD(HER_CASE.S0, HER_CASE.y1 + 3, HER_CASE.S1, HER_CASE.SY);
const SILL_LIT_D = rectD(HER_CASE.S0, HER_CASE.y1, HER_CASE.S1, HER_CASE.y1 + 3);
/** The outline: ONE closed path round the casing and its projecting sill (no corner crossings). */
const HER_OUTLINE_D = (() => {
  const k = HER_CASE;
  return `M${r1(k.X0)} ${r1(k.Y0)}H${r1(k.X1)}V${r1(k.y1)}H${r1(k.S1)}V${r1(k.SY)}H${r1(k.S0)}V${r1(k.y1)}H${r1(k.X0)}Z`;
})();
const CASE_LIT = toneOnTone(CM.limestone, {lit: true, dE: 5});
const HerOutline: React.FC = () => {
  const t = useTime();
  if (t < S2.outlineAt) return null;
  return (
    <Tier tier="subject" tone={CM.brickLight}>
      <Fill d={CASE_D + SILL_D} color={CM.limestone} offset={false} seed="s2herCase" />
      <Fill d={CASE_LIT_D + SILL_LIT_D} color={CASE_LIT} offset={false} seed="s2herCaseLit" />
      <Ink d={HER_OUTLINE_D} width={INK_PX.mid} seed="s2herOutline" />
    </Tier>
  );
};

const storyOverlay = (w: MAP.Spot & {id: string}): React.ReactNode => {
  if (w.id === 'HER') return <HerOutline />;
  return staffOverlay(w);
};

/** The story panes' tiers (conform_L2 §4): her window is the subject from "one" (6.82); each staff window is promoted
 *  on its own click of "staff" (8.96 + i 0.04) and stays A through the blinds and "contracts"; before that, support. */
const storyTierAt = (t: number) => (id: string): 'subject' | 'support' => {
  if (id === 'HER') return t >= S2.outlineAt ? 'subject' : 'support';
  const i = S2.staffWindows.findIndex((w) => w.id === id);
  return i >= 0 && t >= S2.staffOnAt + i * S2.staffOnStagger ? 'subject' : 'support';
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
            <Lit rig={RIG_CANAL}>
              <CanalCast person={k4Person}>
                <V2S2Set
                  staffCoolAt={S2.staffOnAt}
                  storyOverlay={storyOverlay}
                  storyTier={storyTierAt(t)}
                  aBoard={<S2Board />}
                  agent={<S2Newsagent />}
                  bench={<S2BenchPeople />}
                  pip={<PipS2 />}
                  farLife={
                    <>
                      <S2FarLife />
                      <S2Motes layer="far" />
                    </>
                  }
                  leaves={<S2Motes layer="leaves" />}
                  extra={<S2Motes layer="near" />}
                />
              </CanalCast>
            </Lit>
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
