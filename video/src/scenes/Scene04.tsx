// S04 "Fourteen years in plain sight" (storyboard v3, docs/storyboard_v3.md S04; cut(it) -> cut(years), 14.17-16.59 s).
// VO: "This bug was in there for like fourteen years"
//
// Stoop Street, close on door #4 (shared StoopStreet, people={false}: nobody looks at the door): the same PHP lock (lock4)
// with Bit sitting on it in plain sight, the tear-off calendar of YEAR pages beside the door, ivy on the door frame. A
// locked-off time-lapse: everything changes except the lock. MATCH-CUT in on the sun (S03's low glide-hop is mid-air at
// screen (810, 680) on the cut, drawn IN FRONT of the roofline until it touches down in its slot (930, 690) on 'This');
// Pip settles onto step 2 ('This'), yawns, curls up asleep ('for'); Bit hops and the lock rattles under an ink attention
// ring ('bug'); a pair of passers-by walks away up the road ('was'); the ivy creeps a step ('in'); 'there': 14 YEAR
// pages tear 0.07 s apart and fly off, the ivy steps a season every two tears, far passers-by flicker up the road;
// 'like': a second pair strides past, Bit yawns and blinks; L5 swings in on a string from lock4 just before 'fourteen';
// a cobweb draws over the lock box corner ('fourteen'); an orange leaf drifts off the ivy over the lintel, across the
// door glass, and lands on sleeping Pip's ear just before the camera dives into lock4 ('years': a fixed 0.33 s ending
// on the cut, lock4 lands 65 x 80 at screen (483, 960) where S05's blueprint lock is; the L5 tag rides across to S05's
// annotation; the sun slides into S05's notch (930, 725), the cut's second match anchor).
//
// Camera: scene04/camera.ts (a 3 % log-zoom creep about the cornice, then the dive). The sun is SCREEN space for the
// whole scene. Notes: docs/scenes/S04.md.

import React from 'react';
import {World, useScene, useTime, skies} from '../lib';
import {Sun} from '../lib/Sun';
import {ease as E, lerp, springAt, springs} from '../lib/time';
import {mat, XG} from '../lib/xf';
import {Ink} from '../lib/Ink';
import {Fill} from '../lib/Fill';
import {palette} from '../lib/theme';
import {line, rectPath} from '../lib/sketch';
import {StoopStreet, LayerWrap, SI, STOOP} from './shared/sets';
import {Calendar, Cobweb, LabelTag, Lock, pendulum, yearPages} from './shared/props';
import {beats, S04_START, S04_END, tearTimes} from './scene04/beats';
import {camAt, camMat, diveK, DIVE} from './scene04/camera';
import {DiveFlat, ivyNode, SeasonIvy, seasonKeys, WindowLife, YearFlyers} from './scene04/props';
import {BitS04, ghostList, Ghosts, Leaf, PipS04, pipEarWorld} from './scene04/cast';

// ---------------------------------------------------------------- labels (final_script section 6)

const L5 = ['in the code since', 'at least 2012'];
const LK = STOOP.lock4;
/** lock4's bottom screw (the string's top). */
const L5_HANG: [number, number] = [LK.x + 3, LK.y + LK.h / 2 - 3];
/** L5's paper at rest (world, ~36 px lettering at the 1.5 zoom): its top ~21 world under the lock (a ~45 px string),
 *  its eyelet 12 world right of the screw (the closest sleeping Pip allows: his head hides only the paper's blank
 *  bottom-left corner, never the lettering); at the cut (world under the end camera: it lands on
 *  S05's annotation tag, paper screen ~(425-752, 1000-1120), ~38 px lettering). Lerped through the dive. */
const L5_REST = {box: [248, 1172, 442, 1244] as [number, number, number, number], fs: 24};
const L5_CUT = {box: [300, 1152, 472, 1215] as [number, number, number, number], fs: 20};
/** When (after the dive starts) the caption band goes calm: the camera is already moving as the hero cornice crosses
 *  caption line 2 (frame 65). */
const CALM_AFTER = 0.06;
/** lock4's box top-left corner (the cobweb's corner) and its mount (the rattle's pivot: the top screw). */
const LOCK_TL: [number, number] = [LK.x - (LK.h * 0.8) / 2, LK.y - LK.h / 2];
const LOCK_PIVOT: [number, number] = [LK.x, LK.y - LK.h / 2 + 4];
/** The sun: its slot in this shot, and S05's notch (where the dive slides it: S05's first frame has it at (930, 725)). */
const SUN_SLOT: [number, number] = [930, 690];
const SUN_S05: [number, number] = [930, 725];

/** The lock box rattles +-2 deg for 0.15 s (Bit's hop kicks it on 'bug'). */
const rattle = (t: number, at: number) => (t >= at && t < at + 0.15 ? 2 * Math.sin(((t - at) / 0.075) * Math.PI * 2) * (1 - (t - at) / 0.15) : 0);

/** A little deliberate pavement under the stoop (the bottom band reads as ground): kerb-stone joints along the near
 *  kerb and a drain grate. World coords. */
const KERB_JOINTS = (() => {
  let d = '';
  for (let x = -40; x <= 720; x += 64) d += line(x, STOOP.pavementY + 2, x - 1, STOOP.pavementY + 17, {seed: `s4kj${x}`, over: 0});
  return d;
})();
const GRATE: [number, number, number, number] = [470, 1452, 74, 26];
const GRATE_INK = (() => {
  const [x, y, w, h] = GRATE;
  let d = rectPath(x, y, w, h);
  for (let i = 1; i < 6; i++) d += `M${(x + (w * i) / 6).toFixed(1)} ${y + 4}V${y + h - 4}`;
  return d;
})();

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
  const diveAt = end - DIVE;

  // the sun, SCREEN space the whole scene (a sky object at infinity does not move in a dolly): S03's glide-hop continued
  // (take-off at end(it), mid-air at (810, 680) on the cut, lands on 'This' in its slot), then during the dive it slides
  // down into S05's notch (930, 725). It is drawn IN FRONT of the set while it is mid-hop (a character crossing the
  // roofline: the match object stays whole on the cut) and through the dive (the facade sweeps up behind it); between
  // the two it sits in the set's sky slot behind the roofline and the wire.
  const sunFront = t < b.this || t >= diveAt;
  const sun = (
    <XG m={mat.inv(M)}>
      <Sun cx={690} cy={700} r={110} drift={[0, 0]} hops={[{t: b.sunTakeOff, to: SUN_SLOT, h: 15, air: b.this - b.sunTakeOff}]} moves={[{at: diveAt, dur: DIVE, x: SUN_S05[0], y: SUN_S05[1], ease: E.inOutSine}]} />
    </XG>
  );

  // the year calendar: 15 pages, 14 tears (the page swaps at the tear; the torn page flies off in YearFlyers)
  const calendar = <Calendar x={STOOP.calendar[0]} y={STOOP.calendar[1]} w={STOOP.calendar[2]} h={STOOP.calendar[3]} pages={yearPages(15)} tearAt={tears} tearDur={0.001} seed="s4cal" />;

  // ivy: 8 nodes at the cut (it already peeks above Pip), +2 on 'in', +1 per tear (over the lintel)
  const ivySteps = [{t: -10, n: 8}, {t: b.ivy, n: 10}, ...tears.map((ta, i) => ({t: ta, n: Math.min(19, 11 + i)}))];

  // L5 through the dive: the paper and lettering ease toward S05's annotation (its on-screen size holds while the world
  // dives); its string runs from lock4's bottom screw to the eyelet (the tag's pop / swing pivot is the screw)
  const dk = diveK(t, end);
  const l5Box = L5_REST.box.map((v, i) => lerp(v, L5_CUT.box[i], dk)) as [number, number, number, number];
  const l5Fs = lerp(L5_REST.fs, L5_CUT.fs, dk);

  const ear = pipEarWorld();
  const heroSlot = (
    <>
      <WindowLife tears={tears} />
      <SeasonIvy steps={ivySteps} seasons={seasons} />
      {/* lock4 (the set's own hero lock, drawn here so it can rattle about its top screw when Bit kicks off on 'bug') */}
      <XG m={mat.about(mat.rotate(rattle(t, b.bug - 0.1)), LOCK_PIVOT[0], LOCK_PIVOT[1])}>
        <Lock x={LK.x} y={LK.y} size={LK.h} seed="stoop/lock4" ink={SI.far} glintAt={b.bug} />
      </XG>
      {/* 'fourteen': a cobweb draws over the lock box's top-left corner (rule-5 lead: it lands with the highlight) */}
      <Cobweb x={LOCK_TL[0] + 1} y={LOCK_TL[1] + 1} r={20} corner="tl" at={b.cobweb - 0.1} dur={0.24} width={1.6} seed="s4web" />
      <YearFlyers tears={tears} />
      <BitS04 b={b} />
      <LabelTag kind="tag" box={l5Box} hang={L5_HANG} text={L5} fontSize={l5Fs} at={b.l5} seed="s4L5" />
      {/* L5's string: a visible ink thread from the lock's bottom screw over the paper's top edge into the eyelet */}
      {t >= b.l5 ? <L5String box={l5Box} fs={l5Fs} at={b.l5} /> : null}
      <PipS04 b={b} cam={cam} />
      {/* the dive's caption band: each hero object pops whole to its flat no-ink version once it is in the band */}
      <DiveFlat cam={cam} from={diveAt + CALM_AFTER} />
      <Leaf from={ivyNode(15)} to={[ear[0], ear[1]]} at={b.leaf} land={diveAt - 0.14} />
    </>
  );

  const ghosts = ghostList(b, tears);
  const wrap: LayerWrap = (name, _n, node) => {
    if (name === 'ground')
      return (
        <>
          {node}
          <Ink d={KERB_JOINTS} width={SI.far} taper={false} seed="s4kj" />
          <Fill rect={GRATE} color={palette.tealDark} offset={false} mode="none" seed="s4gr" />
          <Ink d={GRATE_INK} width={SI.far} taper={false} seed="s4gri" />
        </>
      );
    // every passer-by walks on the road beyond the planter: all of them behind it (pot and bush as one unit)
    if (name === 'people')
      return (
        <>
          <Ghosts list={ghosts} />
          {node}
        </>
      );
    return node;
  };

  return (
    <World sky={[{t: 0, tod: 'day', color: skies.day}]}>
      <XG m={M}>
        <StoopStreet
          people={false}
          foreground={false}
          furniture={[STOOP.furniture[0]]}
          sun={sunFront ? null : sun}
          calendar={calendar}
          heroLock={false}
          heroSlot={heroSlot}
          wrap={wrap}
          seed="stoop"
        />
        {sunFront ? sun : null}
      </XG>
    </World>
  );
};

/** L5's string: 2 world px (3 px on screen) from lock4's bottom screw to the tag's eyelet, following the tag's pop and
 *  pendulum exactly (LabelTag's own geometry: eyelet at (w / 2, max(er + 3, 0.36 em)), rotation + pop about the hang). */
const L5String: React.FC<{box: [number, number, number, number]; fs: number; at: number}> = ({box, fs, at}) => {
  const t = useTime();
  const k = springAt(t, at, springs.pop);
  const ang = (pendulum(t, at, -16, 0.5, 0.8) * Math.PI) / 180;
  const er = Math.max(2.5, Math.min(7, fs * 0.13));
  const ey = Math.max(er + 3, fs * 0.36);
  const dx = (box[0] + box[2]) / 2 - L5_HANG[0];
  const dy = box[1] + ey - er * 0.6 - L5_HANG[1];
  const x1 = L5_HANG[0] + k * (dx * Math.cos(ang) - dy * Math.sin(ang));
  const y1 = L5_HANG[1] + k * (dx * Math.sin(ang) + dy * Math.cos(ang));
  return <Ink d={`M${L5_HANG[0]} ${L5_HANG[1]}L${x1.toFixed(1)} ${y1.toFixed(1)}`} width={2} taper={false} seed="s4L5s" />;
};

export default Scene04;
