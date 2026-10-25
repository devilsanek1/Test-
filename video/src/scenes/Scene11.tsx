// S11 "Just turn it off" (cut(anymore) -> cut(everything); 45.62-52.16 on the take). docs/storyboard_v3.md S11.
// "Even the FBI said if you can't update yet, just turn it off, which is basically tech support's answer to everything."
//
// Government Plaza seen close on the Domed Capitol's browser window (PLAZA.closeup: camera (518, 826) zoom 1.6): a
// progress bar that can't finish, the official advice taped up inside the window like a shop notice (L14), then the sun
// is pressed like a power button, govB's shutter comes down clean, the lights step out, the padlock and the lettered
// 'back soon' tag of S01 arrive (now explained), and a cream sticky note on the closed shutter makes the tech-support
// joke (J6: 'Turn it off ~~and on again~~'). Pip watches from the sill's left end and shrugs on 'answer'; the snail is
// the running gag; Bit hops onto the padlock's shackle (rewatch spot: he guards the lock that keeps the bug out).
// Near plane: the plaza lamp post near the left edge (its whole lantern head in frame, x >= 73: clear of the film edge's
// bare left strip; Pip hops in behind it) and two quiet back-view onlookers at the bottom LEFT (under the UI, brown / tan
// hair, no phones; fix round 3: moved from the bottom right, where S10's last frame has its own head); govA keeps its lit
// tone (only govB steps darker). Fix round 2: the switch-off spreads as ONE outward ripple from govB in the pause after
// 'off,' (govA, govC, the far civic skyline, the lanterns: all done by 'is'), so 'is' .. 'everything' carries only the
// joke's events; Pip shrugs toward the sun, settles facing us, and leaps up-right toward the lens (stand-side) at the end.
// Fix round 3: 'updating...' lives in the address pill and the page has ONE fat bar + a big % tile; 'off' is light going
// out (govB's drum slots and lantern glass start lit peach and pop to tealDark in the cascade; the near lamp's glass goes
// tealDark); the press ripple is a flat peach stepped band; the note's back is a sticky-note back while it falls.
//
// Hard cut in and out (no transition camera). Camera: a 4 % push from rest, locked, a 3 % lean into the joke, hold.
// Local helpers: ./scene11/* (beats, camera, actors: pigeons, snail, govB's window ('updating...' pill, one fat bar + %
// flip tile), the plain glass panes with a CRT power-off for govA / govC / govD at the frame edges; shims: NoteFlight
// (the J6 drop from behind the cornice, NoteBack while it falls, flip to the face on the slap) / NoteBreeze / NoteStrike
// (one 5.2 px marker stroke) around the shared StickyNote, StepRipple (the press ring: a flat peach stepped band), a
// Sparkle, PadlockRock / TagTwirl (motion around S01's own padlock and lettered tag); entry = an isolated preview entry).
// Shared kit: GovernmentPlaza (far civic skyline, shutters, lights out), LabelTag (L14 notice), StickyNote (J6),
// ShutterPadlock + BackSoonTag (S01's govB padlock and one-line white 'back soon' tag, S01's seeds), PowerGlyph, SunPress,
// Bit (+ scene11 BitRim), EdgeOnlooker. scene11/near: NearLamp, StepTreads (ink on the far steps), BandClip (the
// top-to-bottom lights-out cascade), LitGlass (govB's lit drum slots + lantern glass until the cascade).

import React, {useMemo} from 'react';
import {World, Sun, useTime, useScene, mat, XG} from '../lib';
import {ease as E, prog, springAt, springs} from '../lib/time';
import {Elephant, ElephantTimeline, hop} from '../lib/mascot';
import type {PoseKey} from '../lib/mascot';
import {crtPhase, GovernmentPlaza, PLAZA, GovId} from './shared/sets';
import {BackSoonTag, Bit, EdgeOnlooker, LabelTag, PowerGlyph, ShutterPadlock, StickyNote, SunPress} from './shared/props';
import {ABS, localBeats, SCENE} from './scene11/beats';
import {camAt, camKeys, camMat, toScreen} from './scene11/camera';
import {GovBWindow, Pigeon, PlainPane, SillSnail} from './scene11/actors';
import {BandClip, GovAQuiet, LitGlass, NearLamp, StepTreads} from './scene11/near';
import {CivicHaze} from './scene11/civic';
import {backSoonFont, backSoonW, BitRim, NoteBack, NoteBreeze, NoteFlight, NoteStrike, OnlookerHairMarks, OnlookerTurn, PadlockRock, padlockShackleTop, PipHopSmear, ShutterStreaks, Sparkle, StepRipple, TagTwirl} from './scene11/shims';
import {Fill} from '../lib/Fill';
import {Ink} from '../lib/Ink';
import {palette, skies, stroke} from '../lib/theme';
import {blob, line, rectPath} from '../lib/sketch';
import {useCaptionFont} from '../lib/font';
import {layoutText} from './shared/props/Labels';
import type {Pt} from '../lib/sketch';

// ---------------------------------------------------------------- anchors (world = S01 camera rest)

const SUN = {x: 870, y: 700, r: 110}; // SCREEN space, in the gap right of the dome
const SUN_DRIFT = -10; // px/s (ENGINE rule 6: >= 10, the World default): ~65 px left over the scene, toward the gap's middle
const SILL_Y = PLAZA.closeup.sill; // 1122
const PIP_W: Pt = [387, SILL_Y]; // the sill's left end (16 left of v1: his ear clears the readout and the notice's tape)
// govB's sill (the set's line runs x 404-632) gets a short HORN to the left under Pip (classical sills project past the
// jamb), so he sits squarely on a ledge instead of hanging in front of govA's column
const SILL = {x0: 404, x1: 632, horn: 350, depth: 9};
const PIP_S = 1.2; // on-screen scale at zoom 1.6 (grows with the push like the sill)
// Bit waits on the sill between the padlock's spot (462) and the tag's left edge (~527): never under the tag's lettering
// when it swings in, and his hop onto the shackle is a short one to the LEFT that never crosses the tag
const BIT_SILL: Pt = [505, SILL_Y];
const BIT_SIZE = 13; // world: ~22 px on screen (fix round 2: was 11 / 18 px, a speck on the shutter), with a cream rim
// S01's govB padlock and tag (scene01/plaza.tsx S01_GOV.govB: padlock x 462 size 36, the lettered tag at x 566): the
// SAME props (ShutterPadlock / BackSoonTag), the same seeds the set's rigs use ('plaza/govB/pl', 'plaza/govB/tag'), so
// the S11 -> S12 hard cut back to the S01 wide keeps them: a sand padlock that reads as an ink outline on the darkened
// facade, a WHITE one-line 'back soon' tag
const PAD: Pt = [462, PLAZA.gov.govB.padlock[1]]; // body centre (1121)
const PAD_SIZE = 36;
const SHACKLE_TOP: Pt = [PAD[0], PAD[1] + padlockShackleTop(PAD_SIZE)];
// the tag hangs from a nail just above the rail at S01's x; its one-line layout is sized so the whole drop ends at world
// y 1140 (screen <= ~1488 at the 1.71 lean, clear of the bottom platform UI from 1500): ~79 x 39 world, lettering ~17
// world = ~29 px on screen (S01 hangs a 138-wide one from y 1104 at zoom ~1.03: the same shape, colour and lettering)
const TAG = {x: 566, y: 1094, bottom: 1140};
const SNAIL_AT: Pt = [641, SILL_Y]; // the sill's right end: its eye stalks stay clear of the notice's 'EU'
// L14, inside the lower part of the browser screen (world x 414-622), under the page's bar row (local y < 40), left edge
// with clear air to Pip's ear.
// fix round 3: inset INSIDE the glass like a shop notice, bottom ~1425 (world 1106, 10 world above the window's bottom
// frame). A1 fix round 1 (review: 32 px lettering, the storyboard asks 36, house range 34-40): 21.7 world lettering
// (~36 px at 1.66) on a paper sized to its text (the notice's padding needs 8.7 em for 'UK NCSC · CERT-EU' = 189 world,
// wider than the glass leaves between Pip's ear and the right jamb), drawn 0.93x condensed in x (`sx`): paper ~175 world
// = x 440-615 (screen ~408-699 at 1.66: 16 px of air to Pip's ear at ~392, 11 px to the jamb at ~710)
const NOTICE = {x: 527, y: 1076, fs: 21.7, sx: 0.93};
const NOTICE_LINES = ['FBI · NSA', 'UK NCSC · CERT-EU'];
// J6 on the closed shutter: A1 fix round 1 (review: at ~250 x 190 px with 42 px lettering the whole joke was ~2.4 % of
// the frame and competed with the white tag and the padlock): 1.18x, 172 x 136 world (~294 x 233 px at 1.71), 29 world
// lettering (~50 px), anchored HIGHER: its top overlaps the shutter box (y 935-948, the box is 952-970) so the bottom
// stays above the padlock / tag row (bottom-left corner ~(455, 1083): ~16 px above Bit on the shackle; over the tag's
// left end ~1078 < its nail 1094); right corner ~626 just over the jamb (622). S12 (cast.tsx S11_NOTE) must use these
// numbers.
const NOTE = {x: 536, y: 1009, w: 172, h: 136};
const NOTE_LINES = ['Turn it off', 'and on again'];
const NOTE_FS = 29;
const NOTE_ROT = -4;
// its BACK while it falls (fix round 3): squarer, 143 x 136 world (A1 fix round 1: 1.15x with the face), the show-through
// at 22 world
const NOTE_BACK = {w: 143, h: 136, fs: 22};
// the drop: from behind govB's cornice (its lower edge at world y 926 hides it), just left of the cornice pigeon
const NOTE_FROM: Pt = [566, 884]; // hidden at the start (the tipped sheet's bottom ~ the cornice's lower edge 926)
const CORNICE_B = 926;
const CORNICE_PIGEON: Pt = [640, 904];
// A1 fix round 1: 42 world left (was 454), on the box's left end: the bigger note's top-left corner (~446, 948) keeps
// ~20 px of air to the pigeon, which now sits right above Pip
const BOX_PIGEON: Pt = [412, 952];
const PIGEON_S = 0.8;

// govA / govC / govD keep their normal lit chrome (the same params the set's own WindowRig uses at detail 'close')
const MID_CLOSE = 3.4 * 0.7;

// govB's bands (GovernmentPlaza G.B): dome base 792, cornice bottom 926, x 396-640
const G_B = {x0: 396, x1: 640, domeBase: 792, cornB: 926};
const GOVB_WIN = PLAZA.gov.govB.window; // [414, 970, 208, 146]: the shutter's curtain rect

// Pip's exit hop toward the lens (feet anchor, SCREEN px from his sill point; tau = s after b.pipOut): x = x0 + vx tau,
// y = y0 + vy tau + g tau^2, scale = PIP_S' (1 + grow tau), rotate = rot0 + rotV tau (deg), pose sit-front (happy)
// fix round 2: a real LEAP (stand-side, legs spread, facing right toward S12's bollard side), the feet clear the sill by
// ~85 px on f193 and are still rising at the cut (~130 px up); the growth is capped (~1.3x at the cut) so the hop, not
// the scale, carries the motion
const SHRUG_DUR = 0.5;
// the near onlookers (SCREEN px, head centre + diameter): bottom left, inside the film edge's colour (x >= 54, y <= 1895)
// A1 fix round 1 (review: the long-haired head read as an arched door / tombstone with no neck or shoulders, both froze
// for 6.5 s, and onlooker 2's crown touched govB's elephant plaque): both raised ~42 px so collars and shoulders show
// (still inside the edge's colour: x >= 54, y <= 1895); onlooker 2 sits over the plaque (an overlap, no tangent) and
// turns toward govB on the shutter's slam, back on 'tech' (OnlookerTurn)
const ONL = [
  {x: 222, y: 1798, head: 104},
  {x: 420, y: 1756, head: 110},
];
// A1 polish (review: S11's last frame was still rising at -7 px / frame while S12 picks him up already falling): the
// leap's APEX is now at the cut (vy = -2 g tau_c, tau_c = 52.163 - 51.945 = 0.218 s) with the SAME rise at the cut
// (132.5 px), so the last frame's position is unchanged within 2.4 px (feet y 1323.8, was 1326.2) and his vertical
// speed there is ~-2 px / frame (was -8.6): S12's first frame (just past the apex, falling) follows on
const PIP_EXIT = {vx: 150, vy: -1215.2, g: 2787.2, grow: 1.4, rot0: -12, rotV: 20};

const Scene11: React.FC = () => {
  useCaptionFont();
  const t = useTime();
  const scene = useScene();
  const start = scene.id === 'S11' ? scene.start : SCENE.start;
  const b = useMemo(() => localBeats(start), [start]);
  const keys = useMemo(() => camKeys({lookNotice: b.lookNotice, offCut: ABS.offCut - start, leanEnd: b.pipOut}), [b, start]);
  // lights out, one frame per band from 'off' (each time lands just before its frame: f104 / f105 / f106 / f107)
  const LO = {lantern: b.lightsOut, dome: b.lightsOut + 1 / 30, drum: b.lightsOut + 2 / 30, facade: b.lightsOut + 3 / 30};
  const cam = camAt(keys, t);
  const M = camMat(cam);
  const Minv = mat.inv(M);

  // ---- the window's progress bar: 8 %, a flicker on 'FBI', 9 % on "can't", back to 8 % on 'yet'
  // the L14 paper's on-screen width (world): its text layout x the condensing
  const noticeW = layoutText(NOTICE_LINES, NOTICE.fs, {x: 0.48, top: 0.4, bot: 0.32}).w * NOTICE.sx;
  const steps = [
    {t: -10, v: 0.08},
    {t: b.barStep, v: 0.09},
    {t: b.barBack, v: 0.08},
  ];

  const sun = (
    <XG m={Minv}>
      {/* the press squashes about the DRIFTED centre; the ripple ring is S11's stepped one (PressRipple thins to grey) */}
      <SunPress at={b.press} cx={SUN.x + SUN_DRIFT * t} cy={SUN.y} r={SUN.r} width={3.4} ripple={false}>
        <Sun cx={SUN.x} cy={SUN.y} r={SUN.r} drift={[SUN_DRIFT, 0]}>
          {(r) => <PowerGlyph r={r} inkOnAt={b.glyph} seed="s11/pwr" />}
        </Sun>
      </SunPress>
      {/* a flat peach band stepping r 118 -> 128 -> 138 (2 frames each), then gone in one frame. A1 polish (review: the
          146 / 168 steps put peach at screen y 530-552, inside the caption band): its outer edge stays at r <= 140.5, top
          >= 559. A1 fix round 1 (review: a 3 px last step thinned away like a fade): widths 10 / 7 / 5, still solid when
          it vanishes */}
      <StepRipple cx={SUN.x + SUN_DRIFT * b.press} cy={SUN.y} at={b.press} radii={[118, 128, 138]} widths={[10, 7, 5]} />
    </XG>
  );

  // govA / govC: their normal lit chrome until the switch-off spreads to them (CRT collapse, then a dark screen)
  const crtEv: Partial<Record<GovId, {screenOffAt: number}>> = {govA: {screenOffAt: b.govAScreen}, govC: {screenOffAt: b.govCScreen}};
  const windowSlot = (id: GovId, r: [number, number, number, number]) => {
    if (id !== 'govB') {
      const ev = crtEv[id];
      const u = ev ? crtPhase(t, ev) : 0;
      // govC / govD are cut by the right edge: plain lit panes (their chrome dots and bars read as clutter there)
      // govC's brown shade strip (world x 800-840) read as an ochre patch beside the sun: painted in govC's facade tan
      // under the pane (drawn in the slot, so the pane and its frame stay on top)
      if (id === 'govC')
        return (
          <>
            <Fill d={rectPath(802, 713, 38, 198)} color={palette.tan} offset={false} mode="none" seed="s11/govC/shade" />
            <PlainPane r={r} inkW={MID_CLOSE * 0.85} crt={u} seed={`s11/${id}/pane`} />
          </>
        );
      // govA too (fix round 2): its cropped chrome (a white pill + a peach bar sliver at the left edge) read as stray
      // shapes; a plain glass pane, its collapse an already-squashed cream / peach band (no white block at the edge)
      return <PlainPane r={r} inkW={MID_CLOSE} crt={u} seed={`s11/${id}/pane`} />;
    }
    return (
      <GovBWindow r={r} steps={steps} hiccups={[b.ringHiccup1, b.barBack]} barsAt={[b.ringHiccup1 - 0.12, b.barFlicker - 0.03, b.earFlick - 0.03]} barsX0={NOTICE.x - noticeW / 2 - r[0] + 3} reloadAt={[b.snailCrawl + 0.05]} shakeAt={b.barBack} flickerAt={b.barFlicker} ringR={12.5} alertAt={b.alert} inkW={MID_CLOSE} seed="s11/govB">
        <XG m={mat.about(mat.scale(NOTICE.sx, 1), NOTICE.x, NOTICE.y)}>
          <LabelTag kind="notice" x={NOTICE.x} y={NOTICE.y} lines={NOTICE_LINES} fontSize={NOTICE.fs} minFont={NOTICE.fs} at={b.notice} rot={-1} inkPx={2.2} paper={palette.white} seed="s11/L14" />
        </XG>
      </GovBWindow>
    );
  };

  // ---- Bit: on the sill (watching the snail come), hops onto the padlock's shackle at the clunk
  const bitHopDur = 0.3;
  let bit: React.ReactNode;
  {
    const q = t < b.bitHop ? 0 : Math.min(1, (t - b.bitHop) / bitHopDur);
    const onLock = t >= b.bitHop + bitHopDur;
    let bx = BIT_SILL[0];
    let by = BIT_SILL[1];
    let flip = false;
    let rot = 0;
    if (q > 0 && !onLock) {
      bx = BIT_SILL[0] + (SHACKLE_TOP[0] - BIT_SILL[0]) * q;
      by = BIT_SILL[1] + (SHACKLE_TOP[1] - BIT_SILL[1]) * q - Math.sin(Math.PI * q) * 24;
      flip = true;
      rot = -14 * Math.cos(Math.PI * q);
    } else if (onLock) {
      bx = SHACKLE_TOP[0];
      by = SHACKLE_TOP[1];
      // lands facing left, turns to face the note, looks up at it on "support's"
      flip = t < b.noteCurl - 0.32;
      if (t >= b.noteCurl && t < b.noteCurl + 0.75) rot = -20 * Math.sin(Math.min(1, (t - b.noteCurl) / 0.2) * Math.PI * 0.5) * (t > b.noteCurl + 0.55 ? 1 - (t - b.noteCurl - 0.55) / 0.2 : 1);
      // the tap on 'to'-end: a quick peck of the head onto the shackle (0.12 s, done before the strike starts 0.1 s later;
      // was a 0.3 s hop that ran across the strike's first frames)
      if (t >= b.bitTap && t < b.bitTap + 0.12) rot += 24 * Math.sin(prog(t, b.bitTap, 0.12) * Math.PI);
    }
    bit = (
      <>
        <BitRim x={bx} y={by} size={BIT_SIZE} flip={flip} rot={rot} px={1.8} />
        <Bit x={bx} y={by} size={BIT_SIZE} flip={flip} rot={rot} look={onLock && t >= b.noteCurl ? 'up' : 'auto'} seed="s11/bit" />
      </>
    );
  }

  // ---- Pip (screen space: constant pen; scale follows the push so he stays on the sill)
  const pipAnchor = toScreen(cam, PIP_W);
  const pipScale = PIP_S * (cam.z / 1.6);
  // each reaction is a visible pose change at phone size: a pop (ElephantTimeline's popSwitch), a lean of the whole body
  // toward what he looks at (rot, deg about the feet, sprung), look at +-1 (the trunk curl shows), and a stretch when he
  // looks UP (the sun, the pigeon landing above him)
  const pipKeys: (PoseKey & {rot: number; up?: number})[] = [
    {t: -10, pose: 'sit-back', look: 0, rot: 0},
    {t: b.earFlick, pose: 'sit-back', look: 0.6, rot: 1},
    {t: b.lookNotice, pose: 'sit-back', look: 0.75, rot: 0}, // no lean: his ear keeps clear air to the notice's tape
    {t: b.snailCrawl + 0.06, pose: 'sit-back', look: 0.95, rot: 0, up: 0.06}, // the page tries again: he perks up at the bar
    // A1 polish (review: 1-7 deg leans of the back view do not read at phone size): a SILHOUETTE change. On end(yet) he
    // gets up on the sill in profile facing the sun (stand-side, facing right), nose and trunk tipped up toward it, and
    // holds it through the press (braced, eyes wide); the shutter's slam drops him back to sit-back (startle)
    {t: b.glanceSun, pose: 'stand-side', look: 0.4, rot: -14, up: 0.12},
    {t: b.press - 0.2, pose: 'stand-side', look: 0.4, expression: 'wide', rot: -17, up: -0.08}, // braces (a crouch, eyes wide) as it gets pressed
    {t: b.shutter + 0.06, pose: 'sit-back', look: 0.2, rot: -5},
    {t: b.padlock + 0.1, pose: 'sit-back', look: 0.6, rot: 4}, // the click: he glances at the padlock
    {t: b.pigeonLand + 0.08, pose: 'sit-back', look: 0.3, rot: -2, up: 0.08}, // a pigeon lands right above him: he looks up
    {t: b.noteSlap + 0.2, pose: 'sit-back', look: 1, rot: 7},
    // the shrug points at the button that was pressed: head toward the sun (look 1) and the body leaning to it
    {t: b.shrug, pose: 'shrug', look: 1, expression: 'meh', rot: 6},
    // fix round 2: he SETTLES facing us (no pop back to the back view right on the punchline), well before Bit's tap
    // and the strike; the crouch / leap at b.pipOut starts from this front pose
    {t: b.shrug + SHRUG_DUR, pose: 'sit-front', look: 0.7, expression: 'meh', rot: 0},
  ];
  let pipRot = 0;
  let pipUp = 0;
  for (let i = 1; i < pipKeys.length; i++) {
    const sp = springAt(t, pipKeys[i].t, springs.snappy);
    pipRot += (pipKeys[i].rot - pipKeys[i - 1].rot) * sp;
    pipUp += ((pipKeys[i].up ?? 0) - (pipKeys[i - 1].up ?? 0)) * sp;
  }
  // the shrug: shoulders up and down TWICE (amount 0 -> 1 -> 0.4 -> 1 -> 0 over 0.5 s, storyboard 0.5 s)
  let shrugAmt: number | undefined;
  if (t >= b.shrug && t < b.shrug + SHRUG_DUR) {
    const d = t - b.shrug;
    const K: [number, number][] = [[0, 0], [0.08, 1], [0.18, 0.4], [0.28, 1], [0.4, 0.25], [0.5, 0]];
    for (let i = 1; i < K.length; i++) if (d <= K[i][0]) {
      const q = E.inOutSine((d - K[i - 1][0]) / (K[i][0] - K[i - 1][0]));
      shrugAmt = K[i - 1][1] + (K[i][1] - K[i - 1][1]) * q;
      break;
    }
  }
  let pip: React.ReactNode;
  // the hop in from past the left edge (S10 sends him off its right edge, fully out at 45.595): on f0 nothing of him
  // shows; a low arc (~55 px / frame across: a ballistic leap, motion_spec 25), first readable on f1-f2, passing behind
  // the lamp post, touching down ON 'Even'
  // fix round 3: a LOWER arc (feet ~1430-1500, body under govA's window sill at y >= ~1300 on f1-f2: he reads against
  // govA's column base and the lamp post, never on govA's window glass)
  const inHop = hop({t, t0: b.pipLand - 0.34, dur: 0.34, from: {x: -270, y: 1500}, to: {x: pipAnchor[0], y: pipAnchor[1]}, height: 32});
  if (t < b.pipLand) {
    // A1 polish: 3 ink speed lines trail him on the fast frames (f1-f5, ~55 px / frame), S12's fall-smear language
    let smear: React.ReactNode = null;
    if (inHop.airborne && t >= 1 / 30 - 1e-4 && inHop.k < 0.88) {
      const h0 = hop({t: t - 0.005, t0: b.pipLand - 0.34, dur: 0.34, from: {x: -270, y: 1500}, to: {x: pipAnchor[0], y: pipAnchor[1]}, height: 32});
      smear = <PipHopSmear x={inHop.x} y={inHop.y} vx={(inHop.x - h0.x) / 0.005} vy={(inHop.y - h0.y) / 0.005} scale={pipScale} />;
    }
    pip =
      inHop.k > 0 || t >= b.pipLand - 0.5 ? (
        <>
          {smear}
          <Elephant x={inHop.x} y={inHop.y} scale={pipScale} pose="stand-side" amount={inHop.spread} squash={inHop.squash} rotate={inHop.rotate} t={t} seed={11} />
        </>
      ) : null;
  } else if (t < b.pipOut) {
    // hops off the sill toward the lens: a crouch first (A1 polish: 0.09 s, from the strike's end: it no longer runs
    // under the strike)
    const t0 = b.pipOut;
    const crouch = t >= t0 - 0.09 ? 0.2 * Math.sin((Math.min(1, (t - (t0 - 0.09)) / 0.09) * Math.PI) / 2) : 0;
    pip = <ElephantTimeline x={pipAnchor[0]} y={pipAnchor[1]} scale={pipScale} t={t} seed={11} keys={pipKeys} squash={inHop.squash + crouch - pipUp} rotate={pipRot} amount={shrugAmt} />;
  } else {
    // fix round 2: a real LEAP up and toward the lens, facing right (S12's bollard side): the profile leap pose
    // (stand-side, legs reaching fore and aft, ears + tail up: hop().spread language) with a takeoff stretch, nose up;
    // the feet leave the sill on f190-f191, clear it by ~85 px on f193 and are still rising at the cut (~130 px up);
    // the growth is capped at ~1.3x. He stays left of / above the padlock and left of the note, so the last frame keeps
    // the payoff clear. S12 continues: he drops in onto his bollard on 'And' (hand-off numbers: docs/scenes/S11.md).
    const tau = t - b.pipOut;
    const x = pipAnchor[0] + PIP_EXIT.vx * tau;
    const y = pipAnchor[1] + PIP_EXIT.vy * tau + PIP_EXIT.g * tau * tau;
    const grow = 1 + PIP_EXIT.grow * tau;
    const stretch = -0.22 * Math.exp(-tau * 7) - 0.04;
    const spread = Math.sqrt(Math.min(1, tau / 0.12));
    // A1 fix round 1 (review: the takeoff runs 34-39 px / frame unsmeared on f190-f193, the one fast figure move with no
    // speed lines): the in-hop's PipHopSmear trails him over the fast part of the leap (tau 0.02-0.12), along his real
    // velocity (vy = PIP_EXIT.vy + 2 g tau, px / s)
    const smear =
      tau > 0.02 && tau < 0.12 ? <PipHopSmear x={x} y={y} vx={PIP_EXIT.vx} vy={PIP_EXIT.vy + 2 * PIP_EXIT.g * tau} scale={pipScale * grow} /> : null;
    pip = (
      <>
        {smear}
        <Elephant x={x} y={y} scale={pipScale * grow} pose="stand-side" amount={spread} expression="happy" squash={stretch} rotate={PIP_EXIT.rot0 + PIP_EXIT.rotV * tau} t={t} seed={11} />
      </>
    );
  }

  // ---- J6: the sticky note drops from behind govB's cornice (blank back), flips to its lettered face and slaps onto the
  // closed shutter on 'tech'; the strike (S11's heavier NoteStrike) on 'everything'
  const slapAt = b.noteSlap + 0.03;
  const noteEl = (slap: boolean) => (
    <StickyNote
      x={NOTE.x}
      y={NOTE.y}
      w={NOTE.w}
      h={NOTE.h}
      lines={NOTE_LINES}
      size={NOTE_FS}
      slapAt={slap ? slapAt : undefined}
      flutter={false}
      curlAt={[b.noteCurl, b.strike + 0.27]}
      rot={NOTE_ROT}
      inkPx={3.4}
      seed="s11/J6"
    />
  );

  // ---- the near plane in BOLD (style bible: weight by depth, front 4.5-5 px): govB's sill top (with its horn under Pip
  // and one doubled re-stroke) and the shutter box's lower edge; the horn steps darker with govB's lights
  const kz = cam.z;
  const govBOff = t >= LO.facade;
  const nearPlane = (
    <>
      <Fill d={rectPath(SILL.horn, SILL_Y, SILL.x0 + 2 - SILL.horn, SILL.depth)} color={govBOff ? palette.tan : palette.sand} offset={false} mode="none" seed="s11/horn" />
      <Ink d={line(SILL.horn, SILL_Y + 0.5, SILL.horn, SILL_Y + SILL.depth - 1, {seed: 's11/hornEnd', over: [0, 0]})} width={stroke.ink / kz} taper={false} seed="s11/hornEnd" />
      <Ink d={line(SILL.horn - 5, SILL_Y, SILL.x1 + 6, SILL_Y, {seed: 's11/sillB', over: [0, 0]})} width={stroke.inkBold / kz} taper={false} vary={0.06} seed="s11/sillB" />
      <Ink d={line(SILL.horn + 20, SILL_Y + 2.6, SILL.x0 + 150, SILL_Y + 2.2, {seed: 's11/sillB2', over: [0, 0]})} width={stroke.ink / kz} taper={false} seed="s11/sillB2" />
      <Ink d={line(SILL.x0 - 1, 970, SILL.x1 + 1, 970, {seed: 's11/boxB', over: [0, 0]})} width={stroke.inkBold / kz} taper={false} vary={0.06} seed="s11/boxB" />
    </>
  );
  const tagW = backSoonW(TAG.bottom - TAG.y);

  const civicOffTimes = [0, 1, 2, 3, 4, 5].map((i) => b.civicOff + i * 0.04);
  const civicWrap = (name: string, _n: number, node: React.ReactNode) =>
    name === 'far' ? (
      <>
        {node}
        <CivicHaze offAt={civicOffTimes} lanternsOffAt={b.civicLanterns} />
      </>
    ) : (
      node
    );
  // the plaza; `govBOffAt` = when govB's body steps darker (the lantern has its own switch at 'off')
  const plaza = (govBOffAt: number) => (
    <GovernmentPlaza
      state="built"
      detail="close"
      sun={sun}
      bit={false}
      citizensAt={false}
      onlookers={false}
      gov={{
        // govB: padlock + tag are drawn by the scene (below)
        govB: {shutterAt: b.shutter, lanternOffAt: LO.lantern, offAt: govBOffAt},
        // the switch-off spreads across the plaza: govA's screen goes dark and its shutter slams, but govA keeps its
        // lit tone (fix round 1: the left third of the frame stays pale behind the joke); govC half shut
        govA: {shutterAt: b.govAShutter},
        govC: {shutterAt: b.govCShutter, shutterStop: 0.5},
      }}
      windowSlot={windowSlot}
      // A1 fix round 1 (review: the set's two-step civic 'off' made a dark-teal mass beside the note, darker than the near
      // facades): the set's skyline stays lit and S11's CivicHaze (scene11/civic.tsx) steps it ONE haze step in the far
      // slot, same 0.04 s left-to-right cadence, dots + lanterns dark
      wrap={civicWrap}
      seed="plaza"
    />
  );
  // lights out on 'off' as a 1-frame cascade TOP TO BOTTOM (storyboard): lantern, dome, drum + cornice, facade. The set's
  // govB LightsOut is one switch, so for the two in-between frames the scene draws the set a second time, already dark,
  // clipped to the top bands (identical everywhere else: same seeds, same time). Local stand-in until the sets lane
  // gives LightsOut per-band times.
  const cascadeY = t >= LO.dome && t < LO.facade ? (t >= LO.drum ? G_B.cornB : G_B.domeBase) : undefined;

  return (
    <World sky={[{t: 0, tod: 'day'}]}>
      <XG m={M}>
        {plaza(LO.facade)}
        {cascadeY !== undefined ? (
          <BandClip y={cascadeY} x0={G_B.x0 - 30} x1={G_B.x1 + 30} id="s11-lo-cascade">
            {plaza(LO.lantern)}
          </BandClip>
        ) : null}
        {/* A1 fix round 1: govA quieted in the close shot (sky gap to govB's dome / drum, two frieze lines cut short, flute
            breaks): scene11/near GovAQuiet */}
        <GovAQuiet sky={skies.day} domeDarkAt={LO.dome} />
        {/* A1 polish: cream motion streaks on the slamming shutter's fastest frames (f101-f103: its ribs alias) */}
        <ShutterStreaks x={GOVB_WIN[0]} y={GOVB_WIN[1]} w={GOVB_WIN[2]} h={GOVB_WIN[3]} slamAt={b.shutter} />
        {/* govB's lit glass (drum slots, lantern core): lit until the cascade, then dark (lantern f104, drum f106) */}
        <LitGlass lanternAt={LO.lantern} drumAt={LO.drum} />
        {/* govC's clock face sat as a half-cropped white disc at the right edge beside the sun: S11 paints the turret plain
            (its tan, inside its ink edges), so the strip keeps one simple vertical edge shape */}
        <Fill d={rectPath(838, 641, 64, 58)} color={palette.tan} offset={false} mode="none" seed="s11/clockpatch" />
        {/* the far steps in the gap get ink treads + a kerb (flat stripes read as blinds at this zoom) */}
        <StepTreads x0={G_B.x1 + 6} x1={788} kz={kz} />
        {nearPlane}
        {/* on the closed shutter: the sticky note (J6), then S01's lettered 'back soon' tag on its nail and S01's padlock
            on the rail (drawn by the scene: they rock / twirl and they sit over the bold near-plane strokes) */}
        <NoteFlight x={NOTE.x} y={NOTE.y} from={NOTE_FROM} arriveAt={slapAt} dur={slapAt - b.noteDrop} flipDur={0.15} clipY={CORNICE_B} back={<NoteBack x={NOTE.x} y={NOTE.y} w={NOTE_BACK.w} h={NOTE_BACK.h} rot={NOTE_ROT} lines={NOTE_LINES} fontSize={NOTE_BACK.fs} inkPx={3.4} />} face={noteEl(false)} />
        <NoteBreeze x={NOTE.x} y={NOTE.y} h={NOTE.h} flutterAt={[b.noteCurl - 0.02, b.strike + 0.25]} joltAt={b.strike}>
          {noteEl(true)}
          {t >= slapAt ? <NoteStrike x={NOTE.x} y={NOTE.y} w={NOTE.w} h={NOTE.h} lines={NOTE_LINES} fontSize={NOTE_FS} strike="and on again" rot={NOTE_ROT} at={b.strike} widthPx={6.5} overPx={9} seed="s11/J6/strike" /> : null}
        </NoteBreeze>
        {/* A1 polish: on the twirl's edge-on frames (narrower than 35 %) the same tag with no lettering (the paper edge) */}
        <TagTwirl x={TAG.x} y={TAG.y} twirlAt={[b.tagTwirl]} edge={<BackSoonTag x={TAG.x} y={TAG.y} lettered text=" " font={backSoonFont(tagW)} size={tagW} at={b.tag} tapAt={[b.tagTwirl + 0.45, b.tagSway]} inkPx={3.4} seed="plaza/govB/tag" />}>
          <BackSoonTag x={TAG.x} y={TAG.y} lettered text="back soon" size={tagW} minFont={10} at={b.tag} tapAt={[b.tagTwirl + 0.45, b.tagSway]} inkPx={3.4} seed="plaza/govB/tag" />
        </TagTwirl>
        {t >= b.tag ? <path d={blob(TAG.x, TAG.y - 0.4, 1.6, 1.6, {seed: 's11/nail'})} fill={palette.ink} /> : null}
        <PadlockRock x={PAD[0]} y={PAD[1]} size={PAD_SIZE} rockAt={[b.glint - 0.02]} tapAt={[b.bitTap + 0.04]}>
          <ShutterPadlock x={PAD[0]} y={PAD[1]} size={PAD_SIZE} at={b.padlock} glintAt={b.glint} width={3.4 / cam.z} seed="plaza/govB/pl" />
        </PadlockRock>
        <Sparkle x={PAD[0] + 15} y={PAD[1] - 5} r={7} at={[b.glint]} />
        {/* the sill: the snail (running gag), Bit; the pigeons on the cornice and on the shutter box */}
        <SillSnail x={SNAIL_AT[0]} y={SNAIL_AT[1]} size={28} shellAt={b.snailShell} crawlAt={b.snailCrawl} hideAt={b.snailHide} antennaeAt={b.antennae} peekAt={b.pipOut} speed={5} seed="s11/snail" />
        {bit}
        <Pigeon x={CORNICE_PIGEON[0]} y={CORNICE_PIGEON[1]} s={PIGEON_S} shuffle={[{at: b.ringHiccup1, dx: -9}, {at: b.cornShuffle, dx: 6}, {at: b.barBack + 0.17, dx: 4}, {at: b.antennae + 0.08, dx: -3}]} hopAt={[b.cornShuffle, b.press + 0.05, b.glint + 0.17]} preenAt={b.preen} seed="s11/pg1" />
        {/* the box pigeon: crouch, then off up-left (the whole bird, flapping, 20 -> 28 px / frame) with the tag sway,
            after Pip's hop-off: clear of the box by the cut, mid-flight on the last frame */}
        <Pigeon x={BOX_PIGEON[0]} y={BOX_PIGEON[1]} s={PIGEON_S} land={{at: b.pigeonLand, from: [175, 875], dur: 0.45}} shuffle={[{at: b.noteSlap + 0.18, dx: 5}]} hopAt={[b.glint - 0.03]} hopH={20} flyAt={b.pigeonFly} flyTo={[-300, -200]} flySpeed={[20, 28]} seed="s11/pg2" />
      </XG>
      {/* the near layer (screen space): Pip, the plaza lamp post near the left edge (Pip hops in behind it), then two
          quiet back-view onlookers at the BOTTOM LEFT, at the base of govA's columns (under the platform UI: depth +
          scale, as in ref 1 f_9.0). Fix round 3: moved from the bottom right, where S10's last frame has its own
          back-view head (a jump cut of identities on the hard cut) and where the film edge's bare corner cut them.
          Fix round 2: brown / tan hair and NO phones in S11 (S12 opens on the wide with the phones already up) */}
      {pip}
      <NearLamp offAt={b.lampOff} />
      <EdgeOnlooker x={ONL[0].x} y={ONL[0].y} head={ONL[0].head} hair="long" hairColor={palette.brown} body={palette.sage} acc={['collar']} rim="right" seed="s11/onl1" />
      <OnlookerHairMarks x={ONL[0].x} y={ONL[0].y} head={ONL[0].head} hair={palette.brown} />
      <OnlookerTurn x={ONL[1].x} y={ONL[1].y} turnAt={b.shutter + 0.03} backAt={b.noteSlap}>
        <EdgeOnlooker x={ONL[1].x} y={ONL[1].y} head={ONL[1].head} hair="short" hairColor={palette.tan} body={palette.teal} acc={['hood']} rim="right" seed="s11/onl2" />
      </OnlookerTurn>
    </World>
  );
};

export default Scene11;
