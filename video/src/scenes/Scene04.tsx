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
// steps a season every two tears (fills only; a bare step is a leaf drop), the hero site is redesigned every other tear
// (the lock never changes), far passers-by flicker up the road; 'for': Pip curls up asleep; 'like': a second pair
// strides past, Bit yawns and blinks; L5 swings in on a string from lock4 just before 'fourteen'; a small hair cobweb
// draws on the lock box's OUTER top-left corner ('fourteen'); the last tan leaf drops off the ivy as it goes bare and
// lands on sleeping Pip's crown 0.3 s before the camera dives into lock4 ('years': 0.365 s ending on the cut, lock4
// lands 65 x 80 at screen (483, 960) where S05's blueprint lock is; the L5 tag rides across to S05's annotation; the
// sun stays in the sky slot and the receding row slides up over it). In the dive the facade is treated for the caption
// band ROW BY ROW: each row's ink turns tan as it reaches the band and goes fill-only once inside it (BandInk).
//
// Camera: scene04/camera.ts (a 3 % log-zoom creep about the cornice, then the dive). The sun is SCREEN space for the
// whole scene. Notes: docs/scenes/S04.md.

import React from 'react';
import {World, useScene, useTime, skies} from '../lib';
import {Sun} from '../lib/Sun';
import {ease as E, lerp, prog, springAt, springs} from '../lib/time';
import {mat, XG} from '../lib/xf';
import {Ink} from '../lib/Ink';
import {Fill} from '../lib/Fill';
import {palette} from '../lib/theme';
import {rectPath} from '../lib/sketch';
import {StoopStreet, LayerWrap, STOOP} from './shared/sets';
import {LabelTag, Lock, pendulum} from './shared/props';
import {SI} from './shared/sets';
import {beats, S04_START, S04_END, tearTimes} from './scene04/beats';
import {camAt, camMat, diveK, DIVE} from './scene04/camera';
import type {Cam} from './scene04/camera';
import {above, BAND_OFF, BandInk, ClipG, except, GroundS04, HairWeb, HeroBrowser, ivyNode, SeasonIvy, seasonKeys, siteAt, SplitInk, StepTones, WindowLife, YearCalendar, YearFlyers} from './scene04/props';
import type {BandState, Box} from './scene04/props';
import {bitHopAt, BitS04, BugSpot, ghostList, Ghosts, HOP_DUR, Leaf, LockGlint, PipS04, SPOT, spotAt, spotOff} from './scene04/cast';
import {DivePigeons, DiveRipple, WireWhip} from './scene04/dive';

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
 *  dive. A1 fix round: the paper's left edge trimmed 240 -> 270 world (it butted against sleeping Pip's rump; now
 *  >= 15 px of air; 'in the code since' needs ~150 of the 184 world, so the margins hold; eyelet still on the screw). */
const L5_REST = {box: [270, 1153, 454, 1225] as [number, number, number, number], fs: 26.5};
const L5_CUT = {box: [300, 1152, 472, 1215] as [number, number, number, number], fs: 20};
/** lock4's box top-left corner (the cobweb's corner), its top-right corner (the glint) and its mount (the rattle's
 *  pivot: the top screw). */
const LOCK_TL: [number, number] = [LK.x - (LK.h * 0.8) / 2, LK.y - LK.h / 2];
const LOCK_TR: [number, number] = [LK.x + (LK.h * 0.8) / 2, LK.y - LK.h / 2];
const LOCK_PIVOT: [number, number] = [LK.x, LK.y - LK.h / 2 + 4];
/** The 'fourteen' cobweb's radius (world): r 15 = ~23 px at zoom 1.5, ~28 px at the cut. */
const WEB_R = 15;
/** The sun's slot in this shot (S03's hop lands here; S04 bends the landing to SUN_LAND.touch, then it slides back in
 *  and sinks 7 px into the slot, behind the left row's roofline, and holds there to the cut). */
const SUN_SLOT: [number, number] = [930, 690];
const SUN_SINK = 7;
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
/** The sky the sun can show in once it is in the set's sky slot (world): above the hero house and the left row's
 *  roofline (the row's quad top runs from (520, 660) to the VP). Fix round 2: in the dive the flat (ink-less) facades
 *  leave hairline seams between houses and the sun, behind them, showed through as thin orange slivers at the cut;
 *  everything of the sun below this roofline is behind the row anyway. */
const SUN_SKY = `M-4000 -4000H4000V${STOOP.vp[1]}H${STOOP.vp[0]}L520 660H-4000Z`;
const TREE_DX = 70;
/** The underlay behind the hero / left-row seam (world rect; A1 fix round 2): x 512-526 sits under the hero cornice
 *  (which reaches x 526) above the roofline and under the hero facade / the row's first house below it, so it only
 *  shows where the dive's zoom opens a sliver between them; y 664 (under the cornice, just below the roofline's start at
 *  660) to the pavement. */
const SEAM_UNDERLAY: [number, number, number, number] = [512, 664, 14, STOOP.pavementY - 664];
/** The cornice soffit (world rect): a tan band behind the cornice's lower edge (680) and the facade fill's top (A1 fix
 *  round 2: a 4 px strip of sky ran between them). */
const SOFFIT: [number, number, number, number] = [STOOP.hero.x, 674, STOOP.hero.w, 14];
/** The planter (the set's furniture[0]), 42 world right for S04 (A1 fix round): its bush now hides the pairs' NEAR
 *  members' shoes (feet at world ~(537-545, 1326-1338), screen y ~1600, in the bottom UI zone) as they walk behind it. */
const PLANTER = {...STOOP.furniture[0], x: STOOP.furniture[0].x + 42};
/** The dive's caption band, ROW BY ROW (A1 fix round: fix round 3 softened the whole set above world 990 to tan on one
 *  frame early in the dive, so the upper rows were tan-lined and the door dark ink with the split across the house
 *  mid-frame; and once in the band the tan mullions and the browser's dots / pill were still busy behind the glyphs).
 *  Each row of the facade is a unit: its ink turns TAN on the frame its top reaches screen y BAND_TAN (just under the
 *  band, 570), and its lines go altogether (FILL-ONLY) only once the WHOLE unit is inside the band (its bottom above
 *  BAND_FLAT; A1 fix round 2: units went flat as soon as their top was 80 px deep, so a unit straddling the band edge
 *  was half ink-less and the receding row's verticals started abruptly on a horizontal line well under the band; now a
 *  straddling unit stays tan: the ink lightens toward the band instead of stopping on a line). `top` = the row's top
 *  (world), `y` = the boundary under it (no object crosses it): the cornice (its lower line 680, boundary 700), the upper
 *  window row (frames from 706, boundary 835: between the rows), the second window row (frames from 856, boundary 990:
 *  above the door and the calendar; it straddles the band at the cut, so it ends tan). The hero browser (760-900, it
 *  straddles 835) is its own unit (`BROWSER_BOX`), and its bar goes flat (one teal field, no dots, no pill) when it
 *  reaches BAND_TAN. Nothing below world 990 ever changes. */
const BAND_ROWS = [
  {top: 680, y: 700},
  {top: 706, y: 835},
  {top: 856, y: 990},
];
const BAND_TAN = 600;
const BAND_FLAT = 600;
const BROWSER_BOX: Box = [STOOP.browser[0] - 5, STOOP.browser[1] - 5, STOOP.browser[0] + STOOP.browser[2] + 5, STOOP.browser[1] + STOOP.browser[3] + 5];
/** The near layer only takes the band rows down to the upper window row's boundary (835): the lamp's head and crossbar
 *  (world ~640-660) soften with the cornice; the lantern (960-1006) is never split. */
const BAND_NEAR_CAP = 835;
function bandState(cam: Cam, on: boolean, cap = Infinity): BandState {
  if (!on) return BAND_OFF;
  const sy = (wy: number) => (wy - cam.y) * cam.zoom + 960;
  let tanY: number | null = null;
  let flatY: number | null = null;
  for (const r of BAND_ROWS) {
    if (r.y > cap) break;
    if (sy(r.top) < BAND_TAN) tanY = r.y;
    if (sy(r.y) < BAND_FLAT) flatY = r.y;
  }
  return {tanY, flatY, bTan: sy(BROWSER_BOX[1]) < BAND_TAN, bFlat: sy(BROWSER_BOX[3]) < BAND_FLAT};
}
/** The sun's landing and z-swap (A1 fix round 2: the roofline-parallel clip SWEEP is gone; its edge lay on no drawn
 *  line, so for two frames the landing disc was a lemon / D shape floating over the hero house). The glide (S03's hop,
 *  replayed with the same key: identical on the cut) is bent after the cut so it TOUCHES DOWN on 'This' at `touch`,
 *  where the disc is fully clear of the hero house and of the left row's roofline (~3 px of sky between the disc and the
 *  roofline's ink); the z-order swaps on that frame (nothing overlaps the disc there but the wire, which is drawn over
 *  both copies, and the far towers, which are behind both copies: the swap is invisible). From the touch-down the
 *  landing squash plays and the disc SLIDES down-left into its slot behind the row (`slide` s, in-out sine, from one
 *  frame after the touch-down) and sinks 7 px into it: the bite grows from zero and is always bounded by the inked
 *  roofline. The bend is a cubic Hermite offset added to the hop (zero at the cut with zero slope, so position and
 *  velocity match S03; its end slope `land` cancels most of the hop's sideways speed at the touch-down: the disc lands
 *  moving ~4 px / frame, not 18). Screen px. */
const SUN_LAND = {touch: [990, 668] as [number, number], land: [-413, 39] as [number, number], slide: 0.26, delay: 1 / 30};
/** The sun's screen offset from S03's hop path at scene time t (the hop lands at SUN_SLOT on 'This'). */
function sunOffset(t: number, touchAt: number): [number, number] {
  const dx = SUN_LAND.touch[0] - SUN_SLOT[0];
  const dy = SUN_LAND.touch[1] - SUN_SLOT[1];
  if (t <= 0) return [0, 0];
  if (t <= touchAt) {
    const u = t / touchAt;
    const h01 = 3 * u * u - 2 * u * u * u;
    const h11 = u * u * u - u * u;
    return [dx * h01 + touchAt * SUN_LAND.land[0] * h11, dy * h01 + touchAt * SUN_LAND.land[1] * h11];
  }
  const e = prog(t, touchAt + SUN_LAND.delay, SUN_LAND.slide, E.inOutSine);
  return [dx * (1 - e), dy * (1 - e) + SUN_SINK * e];
}
/** L5's entry pendulum (fix round 3: -16 -> -12 deg, with the paper 2 world higher and 4 shorter: its swing no longer
 *  dips past the 1480 label box). */
const L5_SWING = -12;
/** The dive's spot re-pop leads the dive's first frame by 0.05 s (rule-5 lead; its pop spring reaches full size ~0.14 s
 *  after the pop). */
const SPOT_REPOP_LEAD = 0.05;

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
  const diveAt = end - DIVE; // = b.dive, w54 'years'
  const diving = t >= diveAt;
  const band = bandState(cam, diving);
  const bandNear = bandState(cam, diving, BAND_NEAR_CAP);
  const site = siteAt(tears, t);

  // ---- the sun, SCREEN space the whole scene (a sky object at infinity does not move in a dolly): S03's glide-hop
  // continued (take-off at end(it), mid-air at (810, 680) on the cut), bent after the cut so it touches down on 'This'
  // in clear sky right of the hero house (SUN_LAND), then slides down-left into its slot behind the left row and sinks
  // 7 px into it; it holds there to the end (A1 fix round 2: it no longer slides toward S05's notch in the dive, where
  // the rising roofline and the stepped far towers cut it into a jagged shard; the receding row slides up over it and
  // S05's notch sun is simply there on the cut). Z-order: IN FRONT of the hero and the rows while mid-hop (the match
  // object stays whole on the cut), behind them from the touch-down frame, where nothing overlaps the disc. Both copies
  // sit in FRONT of the far towers (drawn after the far layer) and BEHIND the wire and the near layer (the front copy is
  // drawn at the start of the near layer), so neither the towers nor the wire ever change sides of the disc.
  const sunHops = [{t: b.sunTakeOff, to: SUN_SLOT, h: 15, air: b.this - b.sunTakeOff}];
  const sunFront = t < b.this;
  const [sox, soy] = sunOffset(t, b.this);
  const sun = (
    <XG m={mat.inv(M)}>
      <XG m={mat.translate(sox, soy)}>
        <Sun cx={690} cy={700} r={110} drift={[0, 0]} hops={sunHops} />
      </XG>
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
      {/* the hero browser: teal bar, sand third dot; its SITE is redesigned on every other tear (seven times in the
          fourteen years, the chrome once) while the lock never changes; in the dive its bar goes flat in the band */}
      <HeroBrowser layout={site.layout} chrome={site.chrome} flat={band.bTan} />
      <WindowLife tears={tears} />
      <SeasonIvy steps={ivySteps} seasons={seasons} />
      {/* 'bug': a peach spot with an ink ring and glint ticks behind the lock box and Bit */}
      <BugSpot at={spotAt(b)} off={spotOff(b)} word={b.bug} />
      {/* the dive (fix round 2: it read as a tilt-down with sound off): the same spot RE-POPS behind lock4, 10 % bigger,
          and holds to the cut, so the eye locks onto the target (A1 fix round 2: it pops 0.05 s before the dive's first
          frame, so it is full size by dive frame 3 instead of frame 5) */}
      <BugSpot at={diveAt - SPOT_REPOP_LEAD} off={end + 1} word={-10} k={1.1} />
      {/* A1 fix round 2: a broken ink ring ripples outward from the full-size spot on dive frames 3-6 (the hair speed
          ticks of fix round 3 read as pen scratches over the calendar and the door glass) */}
      <DiveRipple at={diveAt + 0.078} cam={cam} target={SPOT.c} spotR={SPOT.r * 1.1} />
      {/* lock4 (the set's own hero lock, drawn here so it can rattle about its top screw when Bit kicks off on 'bug') */}
      <XG m={mat.about(mat.rotate(rattle(t, hopAt, hopAt + HOP_DUR)), LOCK_PIVOT[0], LOCK_PIVOT[1])}>
        <Lock x={LK.x} y={LK.y} size={LK.h} seed="stoop/lock4" ink={SI.far} glintAt={b.bug} />
      </XG>
      {/* 'fourteen' (w53 + 0.10): a small hair cobweb on the OUTSIDE of the lock box's top-left corner, spanning the gap
          to the door leaf (A1 fix round: r 15 world, 1.2 world = ~2 px at zoom 1.5, 2.3 px at the cut; four radials, two
          sagging arcs; the keyhole and the box face stay clear: lock4 is the dive's target and the match-cut object) */}
      <HairWeb x={LOCK_TL[0] - 0.5} y={LOCK_TL[1] - 0.5} r={WEB_R} corner="tl" at={b.cobweb} dur={0.24} width={1.2} seed="s4web" />
      <YearFlyers tears={tears} until={diveAt} />
      <BitS04 b={b} />
      <LockGlint at={b.bug} p={[LOCK_TR[0] + 2, LOCK_TR[1] + 4]} />
      <LabelTag kind="tag" box={l5Box} hang={L5_HANG} text={L5} fontSize={l5Fs} at={b.l5} swing={false} rot={pendulum(t, b.l5, L5_SWING, 0.5, 0.8)} seed="s4L5" />
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
    // the sun's back copy: after the far towers (they never cut the disc: A1 fix round 2, in the dive their stepped
    // roofs rose over it as a jagged shard), behind everything else, clipped to the sky above the left row's roofline
    if (name === 'far')
      return (
        <>
          {node}
          {sunFront ? null : <ClipG d={SUN_SKY}>{sun}</ClipG>}
        </>
      );
    if (name === 'rows')
      return (
        <>
          {/* A1 fix round 2: an underlay behind the hero / left-row seam (world x 512-526, under the hero cornice's
              reach, from just under the roofline's start to the pavement): in the dive the zoom opened a 2-4 px sliver of
              sky between the hero facade fill and the receding row along the whole house height */}
          <Fill rect={SEAM_UNDERLAY} color={palette.sand} offset={false} mode="none" seed="s4/seam" />
          <BandInk s={band} B={BROWSER_BOX} node={node} />
        </>
      );
    if (name === 'hero') {
      const rimmed = (
        <>
          <Fill rect={[STOOP.hero.x - 6, STOOP.hero.y - 6, STOOP.hero.w + 12, 7]} color={palette.cream} offset={false} mode="none" seed="s4/rim" />
          {/* A1 fix round 2: the soffit under the cornice (the facade fill's misregistration left a 4 px strip of SKY
              between the cornice band and the wall, so the cornice floated): a tan shadow band behind them */}
          <Fill rect={SOFFIT} color={palette.tan} offset={false} mode="none" seed="s4/soffit" />
          <ClipG d={except(above(RIM_CLIP))}>{node}</ClipG>
        </>
      );
      return <BandInk s={band} B={BROWSER_BOX} node={rimmed} />;
    }
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
          {/* the sun's front copy (mid-hop, until the touch-down): over the hero and the rows, under the wire */}
          {sunFront ? sun : null}
          {/* the wire snaps on the dive's first frame (everything of the layer right of x 90 above 990 goes flat: the
              wire's ink; WireWhip draws it whipping away); the lamp's head and crossbar soften with the cornice row */}
          <ClipG d={except(TREE_BOX)}>{diving ? <SplitInk y={FLAT_Y} x0={FLAT_NEAR_X0} node={<BandInk s={bandNear} B={BROWSER_BOX} node={node} />} /> : node}</ClipG>
          <XG m={mat.translate(TREE_DX, 0)}>
            <ClipG d={TREE_BOX}>{node}</ClipG>
          </XG>
          {/* the pigeons (the set's own, pixel-identical) take off and the wire snaps on the dive's first frame */}
          <DivePigeons diveAt={diveAt} cam={cam} />
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
          furniture={[PLANTER]}
          pigeons={false}
          calendar={calendar}
          heroLock={false}
          heroSlot={heroSlot}
          wrap={wrap}
          seed="stoop"
        />
      </XG>
    </World>
  );
};

/** L5's string: 2 world px (3 px on screen) from lock4's bottom screw to the tag's eyelet, following the tag's pop and
 *  pendulum exactly (LabelTag's own geometry: eyelet at (w / 2, max(er + 3, 0.36 em)), rotation + pop about the hang). */
const L5String: React.FC<{box: [number, number, number, number]; fs: number; at: number}> = ({box, fs, at}) => {
  const t = useTime();
  const k = springAt(t, at, springs.pop);
  const ang = (pendulum(t, at, L5_SWING, 0.5, 0.8) * Math.PI) / 180;
  const er = Math.max(2.5, Math.min(7, fs * 0.13));
  const ey = Math.max(er + 3, fs * 0.36);
  const dx = (box[0] + box[2]) / 2 - L5_HANG[0];
  const dy = box[1] + ey - er * 0.6 - L5_HANG[1];
  const x1 = L5_HANG[0] + k * (dx * Math.cos(ang) - dy * Math.sin(ang));
  const y1 = L5_HANG[1] + k * (dx * Math.sin(ang) + dy * Math.cos(ang));
  return <Ink d={`M${L5_HANG[0]} ${L5_HANG[1]}L${x1.toFixed(1)} ${y1.toFixed(1)}`} width={2} taper={false} seed="s4L5s" />;
};

export default Scene04;
