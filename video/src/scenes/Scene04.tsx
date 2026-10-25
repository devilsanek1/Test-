// S04 "Fourteen years in plain sight" (storyboard v3, docs/storyboard_v3.md S04; cut(it) -> cut(years), 14.17-16.59 s).
// VO: "This bug was in there for like fourteen years"
//
// Stoop Street, close on door #4 (shared StoopStreet, people={false}: nobody looks at the door): the same PHP lock (lock4)
// with Bit sitting on it in plain sight, the tear-off calendar of YEAR pages beside the door, ivy on the door frame. A
// locked-off time-lapse: everything changes except the lock. MATCH-CUT in on the sun (S03's low glide-hop is mid-air at
// screen (810, 680) on the cut, drawn IN FRONT of the roofline until it touches down in its slot (930, 690) on 'This',
// then it sinks 7 px behind the roofline); Pip settles onto step 2 ('This'); 'bug': Bit hops (apex on the word) out of
// a peach spot with an ink ring, the lock box rattles and glints; 'was': a pair of passers-by walks away up the road and
// Pip yawns; the ivy creeps a step ('in'); 'there': 14 YEAR pages flip up and fly off the calendar 0.07 s apart, the ivy
// steps a season every two tears, far passers-by flicker up the road; 'for': Pip curls up asleep; 'like': a second pair
// strides past, Bit yawns and blinks; L5 swings in on a string from lock4 just before 'fourteen'; a cobweb draws over the
// lock box corner ('fourteen'); the last tan leaf drops off the ivy as it goes bare and lands on sleeping Pip's crown
// 0.3 s before the camera dives into lock4 ('years': a fixed 0.33 s ending on the cut, lock4 lands 65 x 80 at screen
// (483, 960) where S05's blueprint lock is; the L5 tag rides across to S05's annotation; the sun comes forward on the
// whoosh and slides into S05's notch (930, 725), the cut's second match anchor). On the dive's first frame the whole
// upper facade (world y < 990) switches to its flat, fill-only version as one unit, so no ink crosses the captions.
//
// Camera: scene04/camera.ts (a 3 % log-zoom creep about the cornice, then the dive). The sun is SCREEN space for the
// whole scene. Notes: docs/scenes/S04.md.

import React from 'react';
import {World, useScene, useTime, skies} from '../lib';
import {Sun} from '../lib/Sun';
import type {SunMove} from '../lib/Sun';
import {ease as E, lerp, springAt, springs} from '../lib/time';
import {mat, XG} from '../lib/xf';
import {Ink} from '../lib/Ink';
import {Fill} from '../lib/Fill';
import {palette} from '../lib/theme';
import {rectPath} from '../lib/sketch';
import {StoopStreet, LayerWrap, STOOP} from './shared/sets';
import {Cobweb, LabelTag, Lock, pendulum} from './shared/props';
import {SI} from './shared/sets';
import {beats, S04_START, S04_END, tearTimes} from './scene04/beats';
import {camAt, camMat, diveK, DIVE} from './scene04/camera';
import {above, ClipG, except, FlatChrome, GroundS04, ivyNode, SeasonIvy, seasonKeys, SplitInk, StepTones, WindowLife, YearCalendar, YearFlyers} from './scene04/props';
import {bitHopAt, BitS04, BugSpot, ghostList, Ghosts, HOP_DUR, Leaf, LockGlint, PipS04, spotAt, spotOff} from './scene04/cast';
import {DivePigeons, WireWhip} from './scene04/dive';

// ---------------------------------------------------------------- labels (final_script section 6)

const L5 = ['in the code since', 'at least 2012'];
const LK = STOOP.lock4;
/** lock4's bottom screw (the string's top). */
const L5_HANG: [number, number] = [LK.x + 3, LK.y + LK.h / 2 - 3];
/** L5's paper at rest (world; fix round 2: 26.5 world = 40 px lettering at the 1.5 zoom, the storyboard's size, the
 *  paper 20 world wider so 'in the code since' keeps its margins). Fix round 1: raised 15 and 4 world shorter (paper screen
 *  bottom ~1478 at the end of the creep, inside the label box y <= 1480, clear of the bottom UI from ~1520), its top ~6
 *  world under the lock (a ~27 px string), its eyelet 12 world right of the screw; at the cut (world under the end
 *  camera: it lands on S05's annotation tag, paper screen ~(425-752, 1000-1120), ~38 px lettering). Lerped through the
 *  dive. */
const L5_REST = {box: [240, 1155, 454, 1229] as [number, number, number, number], fs: 26.5};
const L5_CUT = {box: [300, 1152, 472, 1215] as [number, number, number, number], fs: 20};
/** lock4's box top-left corner (the cobweb's corner), its top-right corner (the glint) and its mount (the rattle's
 *  pivot: the top screw). */
const LOCK_TL: [number, number] = [LK.x - (LK.h * 0.8) / 2, LK.y - LK.h / 2];
const LOCK_TR: [number, number] = [LK.x + (LK.h * 0.8) / 2, LK.y - LK.h / 2];
const LOCK_PIVOT: [number, number] = [LK.x, LK.y - LK.h / 2 + 4];
/** The sun: its slot in this shot (it sinks 7 px into it after the touch-down), and S05's notch (where the dive slides
 *  it: S05's first frame has it at (930, 725)). */
const SUN_SLOT: [number, number] = [930, 690];
const SUN_SINK = 7;
const SUN_S05: [number, number] = [930, 725];
/** The dive's flatten line: everything of the set above world y 990 (the cornice, both upper window rows, the browser
 *  window, the wire, the rows' upper storeys and rooflines) goes fill-only on the dive's first frame, in one unit. World
 *  990 is below every object that enters the caption band during the dive (the band's bottom maps to world ~935 at the
 *  cut) and above everything on the door (the lintel ivy, the calendar's nail ~1003), so no object is split. */
const FLAT_Y = 990;
/** The near layer keeps the lamp post inked (left of x 90). */
const FLAT_NEAR_X0 = 90;
/** The cornice's top edge is fill-only (style rule 4: never an outline against the sky; fix round: its ink line touched
 *  caption line 2's descenders): the hero layer's ink is clipped above world 640.5 and the cream rim is redrawn. */
const RIM_CLIP = 640.5;
/** The near street tree, shifted 70 world right for S04 (fix round: the dive's sun crossed its crown): its box in the
 *  near layer (nothing else of that layer is in it). */
const TREE_BOX = rectPath(560, 930, 190, 470);
const TREE_DX = 70;

/** The lock box rattles about its top screw: +-5 deg for 0.15 s when Bit kicks off on 'bug', +-3 deg for 0.12 s when he
 *  lands back on it. */
const rattle = (t: number, off: number, land: number) => {
  const r = (at: number, amp: number, dur: number) => (t >= at && t < at + dur ? amp * Math.sin(((t - at) / (dur / 2)) * Math.PI * 2) * (1 - (t - at) / dur) : 0);
  return r(off, 5, 0.15) + r(land, 3, 0.12);
};

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
  const diving = t >= diveAt;

  // ---- the sun, SCREEN space the whole scene (a sky object at infinity does not move in a dolly): S03's glide-hop
  // continued (take-off at end(it), mid-air at (810, 680) on the cut, lands on 'This' in its slot and sinks 7 px into
  // it), then during the dive it slides down toward S05's notch (930, 725). Z-order: IN FRONT of the set while mid-hop
  // (the match object stays whole on the cut), then in the set's SKY slot (behind the towers, the rows' rooflines and
  // the wire) from the touch-down frame on 'This' (fix round 2: the swap one frame early cut a quarter of the moving
  // disc in one frame; now it lands inside the impact squash) to the end. Fix round 2 (major): it stays in the sky slot
  // through the dive (it was brought forward over the facades, a flat disc on house fronts at the cut): the receding
  // row slides up over it and S05's notch sun is simply there on the cut (legal on a cut).
  const sunMoves: SunMove[] = [
    {at: b.this, dur: 0.1, y: SUN_SLOT[1] + SUN_SINK, ease: E.outCubic},
    {at: diveAt, dur: DIVE, x: SUN_S05[0], y: SUN_S05[1], ease: E.inOutSine},
  ];
  const sunHops = [{t: b.sunTakeOff, to: SUN_SLOT, h: 15, air: b.this - b.sunTakeOff}];
  const sunFront = t < b.this;
  const sun = (
    <XG m={mat.inv(M)}>
      <Sun cx={690} cy={700} r={110} drift={[0, 0]} hops={sunHops} moves={sunMoves} />
    </XG>
  );

  // ---- the year calendar: 15 pages, 14 tears (the page swaps at the tear; the torn page flips up and flies off)
  const calendar = <YearCalendar tears={tears} />;

  // ivy: 8 nodes at the cut (it already peeks above Pip), +2 on 'in', +1 per tear (over the lintel)
  const ivySteps = [{t: -10, n: 8}, {t: b.ivy, n: 10}, ...tears.map((ta, i) => ({t: ta, n: Math.min(19, 11 + i)}))];

  // L5 through the dive: the paper and lettering ease toward S05's annotation (its on-screen size holds while the world
  // dives); its string runs from lock4's bottom screw to the eyelet (the tag's pop / swing pivot is the screw)
  const dk = diveK(t, end);
  const l5Box = L5_REST.box.map((v, i) => lerp(v, L5_CUT.box[i], dk)) as [number, number, number, number];
  const l5Fs = lerp(L5_REST.fs, L5_CUT.fs, dk);

  const hopAt = bitHopAt(b);
  const heroSlot = (
    <>
      <StepTones />
      <FlatChrome on={diving} />
      <WindowLife tears={tears} flatAbove={diving ? FLAT_Y : undefined} />
      <SeasonIvy steps={ivySteps} seasons={seasons} />
      {/* 'bug': a peach spot with an ink ring and glint ticks behind the lock box and Bit */}
      <BugSpot at={spotAt(b)} off={spotOff(b)} word={b.bug} />
      {/* the dive (fix round 2: it read as a tilt-down with sound off): the same spot RE-POPS behind lock4 on the dive's
          first frame, 10 % bigger, and holds to the cut, so the eye locks onto the target */}
      <BugSpot at={diveAt} off={end + 1} word={-10} k={1.1} />
      {/* lock4 (the set's own hero lock, drawn here so it can rattle about its top screw when Bit kicks off on 'bug') */}
      <XG m={mat.about(mat.rotate(rattle(t, hopAt, hopAt + HOP_DUR)), LOCK_PIVOT[0], LOCK_PIVOT[1])}>
        <Lock x={LK.x} y={LK.y} size={LK.h} seed="stoop/lock4" ink={SI.far} glintAt={b.bug} />
      </XG>
      {/* 'fourteen': a cobweb draws over the lock box's top-left corner (rule-5 lead: it lands with the highlight) */}
      <Cobweb x={LOCK_TL[0] + 1} y={LOCK_TL[1] + 1} r={20} corner="tl" at={b.cobweb - 0.1} dur={0.24} width={1.6} seed="s4web" />
      <YearFlyers tears={tears} until={diveAt} />
      <BitS04 b={b} />
      <LockGlint at={b.bug} p={[LOCK_TR[0] + 2, LOCK_TR[1] + 4]} />
      <LabelTag kind="tag" box={l5Box} hang={L5_HANG} text={L5} fontSize={l5Fs} at={b.l5} seed="s4L5" />
      {/* L5's string: a visible ink thread from the lock's bottom screw over the paper's top edge into the eyelet */}
      {t >= b.l5 ? <L5String box={l5Box} fs={l5Fs} at={b.l5} /> : null}
      <PipS04 b={b} cam={cam} />
      <Leaf from={ivyNode(8)} at={b.leaf} land={diveAt - 0.3} cam={cam} />
    </>
  );

  const ghosts = ghostList(b, tears);
  const wrap: LayerWrap = (name, _n, node) => {
    // the ground: its fills, its kerb lines, kerb-stone joints, a drain grate, a few specks
    if (name === 'ground') return <GroundS04 node={node} />;
    if (name === 'rows') return diving ? <SplitInk y={FLAT_Y} node={node} /> : node;
    if (name === 'hero')
      return diving ? (
        <SplitInk y={FLAT_Y} node={node} />
      ) : (
        <>
          <Fill rect={[STOOP.hero.x - 6, STOOP.hero.y - 6, STOOP.hero.w + 12, 7]} color={palette.cream} offset={false} mode="none" seed="s4/rim" />
          <ClipG d={except(above(RIM_CLIP))}>{node}</ClipG>
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
    if (name === 'near')
      return (
        <>
          <ClipG d={except(TREE_BOX)}>{diving ? <SplitInk y={FLAT_Y} x0={FLAT_NEAR_X0} node={node} /> : node}</ClipG>
          <XG m={mat.translate(TREE_DX, 0)}>
            <ClipG d={TREE_BOX}>{node}</ClipG>
          </XG>
          {/* the pigeons (the set's own, pixel-identical) take off and the wire snaps on the dive's first frame */}
          <DivePigeons diveAt={diveAt} />
          <WireWhip diveAt={diveAt} />
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
          pigeons={false}
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
