// S04 "Fourteen years in plain sight" (storyboard v3, docs/storyboard_v3.md S04; cut(it) -> cut(years), 14.17-16.59 s).
// VO: "This bug was in there for like fourteen years"
//
// Stoop Street, close on door #4 (shared StoopStreet, people={false}: nobody looks at the door): the same PHP lock (lock4)
// with Bit sitting on it in plain sight, the tear-off calendar of YEAR pages beside the door, ivy on the door frame. A
// locked-off time-lapse: everything changes except the lock. MATCH-CUT in on the sun (S03's low glide-hop is mid-air at
// screen (810, 680) on the cut; it touches down in its slot (930, 690) on 'This'); Pip lands on step 2 ('This'), yawns,
// curls up asleep ('for'); Bit hops ('bug'); ink-only ghost passers-by pop on the pavement ('was'); the ivy creeps a step
// ('in'); 'there': 14 YEAR pages tear 0.07 s apart and fly off, the ivy (and the near tree) step a season every two tears,
// ghosts flicker past ~1 per tear; 'like': a second pair strides past, Bit yawns and blinks; L5 swings in on a string
// from lock4 just before 'fourteen'; a cobweb draws over the lock box corner ('fourteen'); a tan leaf drifts off the ivy
// and lands on sleeping Pip's ear as the camera dives into lock4 ('years': a fixed 0.33 s ending on the cut, lock4 lands
// 65 x 80 at screen (483, 960) where S05's blueprint lock is; the L5 tag rides across to S05's annotation).
//
// Camera: scene04/camera.ts (a 3 % log-zoom creep, then the dive). The sun is SCREEN space until the dive starts, then it
// stays pinned to the world and leaves with the dive (S05's sun is already in its notch). Notes: docs/scenes/S04.md.

import React from 'react';
import {World, useScene, useTime, skies} from '../lib';
import {Sun} from '../lib/Sun';
import {lerp} from '../lib/time';
import {mat, XG} from '../lib/xf';
import {StoopStreet, LayerWrap} from './shared/sets';
import {Calendar, Cobweb, LabelTag, yearPages} from './shared/props';
import {beats, S04_START, S04_END, tearTimes} from './scene04/beats';
import {camAt, camMat, diveK, DIVE} from './scene04/camera';
import {DiveCalm, ivyNode, SeasonIvy, seasonKeys, WindowLife, YearFlyers} from './scene04/props';
import {BitS04, ghostList, Ghosts, Leaf, PipS04, pipEarWorld} from './scene04/cast';
import {STOOP} from './shared/sets';

// ---------------------------------------------------------------- labels (final_script section 6)

const L5 = ['in the code since', 'at least 2012'];
/** L5's paper at rest (world, ~36 px lettering at the 1.5 zoom) and at the cut (world under the end camera: it lands on
 *  S05's annotation tag, paper screen ~(425-752, 1000-1120), ~38 px lettering). Lerped through the dive. */
const L5_REST = {box: [306, 1160, 500, 1232] as [number, number, number, number], fs: 24};
const L5_CUT = {box: [300, 1152, 472, 1215] as [number, number, number, number], fs: 20};
const L5_HANG: [number, number] = [STOOP.lock4.x + 2, STOOP.lock4.y + STOOP.lock4.h / 2 - 2];
/** When (after the dive starts) the caption band goes calm: the camera is already moving (~25 px / frame) as the hero
 *  cornice enters the band (frame 65). */
const CALM_AFTER = 0.06;
/** The planter's ground line (STOOP.furniture[0]): ghosts sort around it. */
const PLANTER_Y = STOOP.furniture[0].y;
/** lock4's box top-left corner (the cobweb's corner). */
const LOCK_TL: [number, number] = [STOOP.lock4.x - (STOOP.lock4.h * 0.8) / 2, STOOP.lock4.y - STOOP.lock4.h / 2];

const Scene04: React.FC = () => {
  const t = useTime();
  const scene = useScene();
  const start = scene?.start ?? S04_START;
  const end = (scene?.end ?? S04_END) - start;
  const b = beats(start);
  const tears = tearTimes(b);
  const seasons = seasonKeys(tears);
  const cam = camAt(t, end);
  const M = camMat(cam);

  // the sun: S03's glide-hop continued (take-off at end(it), mid-air at (810, 680) on the cut, lands on 'This' in its
  // slot (930, 690) r110), SCREEN space and pinned (no idle drift) until the dive; from the dive on it stays with the world
  const Msun = camMat(camAt(Math.min(t, end - DIVE), end));
  const sun = (
    <XG m={mat.inv(Msun)}>
      <Sun cx={690} cy={700} r={110} drift={[0, 0]} hops={[{t: b.sunTakeOff, to: [930, 690], h: 15, air: b.this - b.sunTakeOff}]} />
    </XG>
  );

  // the year calendar: 15 pages, 14 tears (the page swaps at the tear; the torn page flies off in YearFlyers)
  const calendar = <Calendar x={STOOP.calendar[0]} y={STOOP.calendar[1]} w={STOOP.calendar[2]} h={STOOP.calendar[3]} pages={yearPages(15)} tearAt={tears} tearDur={0.001} seed="s4cal" />;

  // ivy: 8 nodes at the cut (it already peeks above Pip), +2 on 'in', +1 per tear (over the lintel)
  const ivySteps = [{t: -10, n: 8}, {t: b.ivy, n: 10}, ...tears.map((ta, i) => ({t: ta, n: Math.min(19, 11 + i)}))];

  // L5 through the dive: the paper and lettering ease toward S05's annotation (its on-screen size holds while the world dives)
  const dk = diveK(t, end);
  const l5Box = L5_REST.box.map((v, i) => lerp(v, L5_CUT.box[i], dk)) as [number, number, number, number];
  const l5Fs = lerp(L5_REST.fs, L5_CUT.fs, dk);

  const ear = pipEarWorld();
  const heroSlot = (
    <>
      <WindowLife tears={tears} />
      <SeasonIvy steps={ivySteps} seasons={seasons} />
      {/* 'fourteen': a cobweb draws over the lock box's top-left corner (inkHair, 0.3 s), beside Bit, not over him */}
      <Cobweb x={LOCK_TL[0] + 1} y={LOCK_TL[1] + 1} r={20} corner="tl" at={b.cobweb} dur={0.3} width={1.3} seed="s4web" />
      <YearFlyers tears={tears} />
      <BitS04 b={b} />
      <LabelTag kind="tag" box={l5Box} hang={L5_HANG} text={L5} fontSize={l5Fs} at={b.l5} seed="s4L5" />
      <PipS04 b={b} cam={cam} />
      {/* the dive's smear: once the hero browser window reaches the caption band its chrome flattens to one flat field (no
          ink, no bar) so the caption reads over it for the last frames before the cut */}
      {t >= b.dive + CALM_AFTER ? <DiveCalm camY={cam.y} zoom={cam.zoom} /> : null}
      <Leaf from={ivyNode(9)} to={[ear[0], ear[1]]} at={b.leaf} land={b.dive} />
    </>
  );

  const ghosts = ghostList(b, tears);
  const wrap: LayerWrap = (name, _n, node) => {
    if (name === 'people')
      return (
        <>
          {/* ghosts behind the planter (feet farther than its base) first, the nearer ones in front of it */}
          <Ghosts list={ghosts} filter={(g) => g.y < PLANTER_Y} />
          {node}
          <Ghosts list={ghosts} filter={(g) => g.y >= PLANTER_Y} />
        </>
      );
    return node;
  };

  return (
    <World sky={[{t: 0, tod: 'day', color: skies.day}]}>
      <XG m={M}>
        <StoopStreet
          people={false}
          foreground="kerb"
          sun={sun}
          calendar={calendar}
          season={seasons}
          heroLock={{glintAt: b.bug + 0.08}}
          heroSlot={heroSlot}
          wrap={wrap}
          seed="stoop"
        />
      </XG>
    </World>
  );
};

export default Scene04;
