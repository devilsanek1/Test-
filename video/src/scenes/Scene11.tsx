// S11 "Just turn it off" (cut(anymore) -> cut(everything); 45.62-52.16 on the take). docs/storyboard_v3.md S11.
// "Even the FBI said if you can't update yet, just turn it off, which is basically tech support's answer to everything."
//
// Government Plaza seen close on the Domed Capitol's browser window (PLAZA.closeup: camera (518, 826) zoom 1.6): a
// progress bar that can't finish, the official advice taped up inside the window like a shop notice (L14), then the sun
// is pressed like a power button, govB's shutter comes down clean, the lights step out, the padlock and the lettered
// 'back soon' tag of S01 arrive (now explained), and a cream sticky note on the closed shutter makes the tech-support
// joke (J6: 'Turn it off ~~and on again~~'). Pip watches from the sill's left end and shrugs on 'answer'; the snail is
// the running gag; Bit hops onto the padlock's shackle (rewatch spot: he guards the lock that keeps the bug out).
//
// Hard cut in and out (no transition camera). Camera: a 4 % push from rest, locked, a 3 % lean into the joke, hold.
// Local helpers: ./scene11/* (beats, camera, actors: pigeons, snail, govB's window with its fat 'updating... 8%' bar, the
// CRT screen for govA, plain panes for govC / govD at the right edge; shims: NoteFlight (the J6 drop from behind the
// cornice, blank back, flip to the face on the slap) / NoteBreeze / NoteStrike (one ~4 px marker stroke) around the shared
// StickyNote, StepRipple (the press ring, stepped width), a Sparkle, PadlockRock / TagTwirl (motion around S01's own
// padlock and lettered tag); entry = an isolated preview entry). Shared kit: GovernmentPlaza (far civic skyline,
// shutters, lights out), LabelTag (L14 notice), StickyNote (J6), ShutterPadlock + BackSoonTag (S01's govB padlock and
// one-line white 'back soon' tag, S01's seeds), PowerGlyph, SunPress, Bit.

import React, {useMemo} from 'react';
import {World, Sun, useTime, useScene, mat, XG} from '../lib';
import {ease as E, springAt, springs} from '../lib/time';
import {Elephant, ElephantTimeline, hop} from '../lib/mascot';
import type {PoseKey} from '../lib/mascot';
import {CRT, crtPhase, GovernmentPlaza, PLAZA, GovId} from './shared/sets';
import {ChromeSlot} from './shared/sets/propSlots';
import {BackSoonTag, Bit, LabelTag, PowerGlyph, ShutterPadlock, StickyNote, SunPress} from './shared/props';
import {ABS, localBeats, SCENE} from './scene11/beats';
import {camAt, camKeys, camMat, toScreen} from './scene11/camera';
import {crtContent, GovBWindow, Pigeon, PlainPane, SillSnail} from './scene11/actors';
import {BandClip, NearLamp, StepTreads} from './scene11/near';
import {EdgeOnlooker} from './shared/props';
import {backSoonW, NoteBreeze, NoteFlight, NoteStrike, PadlockRock, padlockShackleTop, Sparkle, StepRipple, TagTwirl} from './scene11/shims';
import {Fill} from '../lib/Fill';
import {Ink} from '../lib/Ink';
import {palette, stroke} from '../lib/theme';
import {blob, line, rectPath} from '../lib/sketch';
import {useCaptionFont} from '../lib/font';
import type {Pt} from '../lib/sketch';

// ---------------------------------------------------------------- anchors (world = S01 camera rest)

const SUN = {x: 870, y: 700, r: 110}; // SCREEN space, in the gap right of the dome
const SUN_DRIFT = -7; // px/s: the sun is never perfectly still (ENGINE 9): ~46 px left over the scene, toward the gap's middle
const SILL_Y = PLAZA.closeup.sill; // 1122
const PIP_W: Pt = [387, SILL_Y]; // the sill's left end (16 left of v1: his ear clears the readout and the notice's tape)
// govB's sill (the set's line runs x 404-632) gets a short HORN to the left under Pip (classical sills project past the
// jamb), so he sits squarely on a ledge instead of hanging in front of govA's column
const SILL = {x0: 404, x1: 632, horn: 350, depth: 9};
const PIP_S = 1.2; // on-screen scale at zoom 1.6 (grows with the push like the sill)
// Bit waits on the sill between the padlock's spot (462) and the tag's left edge (~527): never under the tag's lettering
// when it swings in, and his hop onto the shackle is a short one to the LEFT that never crosses the tag
const BIT_SILL: Pt = [505, SILL_Y];
const BIT_SIZE = 11; // world: ~18 px on screen
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
// L14, inside the lower part of the browser screen (world x 414-622): 20.5 world lettering (~34 px on screen at 1.66; the
// paper the notice's padding needs for 'UK NCSC · CERT-EU' at that size is 178 wide), right edge on the screen's right
// frame, left edge with clear air to Pip's ear (Pip sits 8 world further left than v2 and leans less toward it)
const NOTICE = {x: 534, y: 1083, w: 178, h: 63, fs: 20.5};
// J6 on the closed shutter's right part: 146 x 112 world, 24.5 world lettering (~42 px at 1.71: the joke reads at phone
// size); right edge 618 < the jamb (622), top 972 > the box line (970), the tilted bottom corner ~1088 < the tag's nail
// (1094)
const NOTE = {x: 545, y: 1028, w: 146, h: 112};
const NOTE_LINES = ['Turn it off', 'and on again'];
const NOTE_FS = 24.5;
const NOTE_ROT = -4;
// the drop: from behind govB's cornice (its lower edge at world y 926 hides it), just left of the cornice pigeon
const NOTE_FROM: Pt = [570, 890]; // fully hidden at the start (the tipped sheet x 497-643, bottom < 926: behind the cornice)
const CORNICE_B = 926;
const CORNICE_PIGEON: Pt = [640, 904];
const BOX_PIGEON: Pt = [454, 952];
const PIGEON_S = 0.8;

// govA / govC / govD keep their normal lit chrome (the same params the set's own WindowRig uses at detail 'close')
const MID_CLOSE = 3.4 * 0.7;

const Scene11: React.FC = () => {
  useCaptionFont();
  const t = useTime();
  const scene = useScene();
  const start = scene.id === 'S11' ? scene.start : SCENE.start;
  const b = useMemo(() => localBeats(start), [start]);
  const keys = useMemo(() => camKeys({lookNotice: b.lookNotice, offCut: ABS.offCut - start, leanEnd: b.pipOut}), [b, start]);
  const cam = camAt(keys, t);
  const M = camMat(cam);
  const Minv = mat.inv(M);

  // ---- the window's progress bar: 8 %, a flicker on 'FBI', 9 % on "can't", back to 8 % on 'yet'
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
      {/* grow 28: the ring's top stays at screen y >= 562, under the caption band (bottom 570) */}
      <StepRipple cx={SUN.x + SUN_DRIFT * b.press} cy={SUN.y} r={SUN.r} at={b.press} grow={28} />
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
      if (id !== 'govA') return <PlainPane r={r} inkW={MID_CLOSE} crt={u} seed={`s11/${id}/pane`} />;
      // govA's collapse sits at the left frame edge, on 'is' under its slamming shutter: the first visible frame is an
      // already-squashed band with a cream core and a peach halo (no full white screen popping at the edge)
      const content = u > 0.001 && u < 0.999 ? crtContent(Math.max(u, CRT.line * 0.85), `s11/${id}/crt`, palette.cream, palette.peach) : undefined;
      return <ChromeSlot x={r[0]} y={r[1]} w={r[2]} h={r[3]} width={MID_CLOSE} offAt={u >= 0.999 ? -1e6 : undefined} content={content} seed={`s11/${id}/bw`} />;
    }
    return (
      <GovBWindow r={r} steps={steps} hiccups={[b.ringHiccup1, b.barBack]} barsAt={[b.ringHiccup1 - 0.12, b.barFlicker - 0.03, b.earFlick - 0.03]} barsX0={NOTICE.x - NOTICE.w / 2 - r[0] + 3} reloadAt={[b.snailCrawl + 0.05]} shakeAt={b.barBack} flickerAt={b.barFlicker} ringR={12.5} alertAt={b.barBack} inkW={MID_CLOSE} seed="s11/govB">
        <LabelTag kind="notice" x={NOTICE.x} y={NOTICE.y} w={NOTICE.w} h={NOTICE.h} lines={['FBI · NSA', 'UK NCSC · CERT-EU']} fontSize={NOTICE.fs} minFont={20.5} at={b.notice} rot={-1} inkPx={2.2} seed="s11/L14" />
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
    }
    bit = <Bit x={bx} y={by} size={BIT_SIZE} flip={flip} rot={rot} hopAt={onLock ? b.bitTap : undefined} hopH={0.5} seed="s11/bit" />;
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
    {t: b.glanceSun, pose: 'sit-back', look: 1, rot: 3, up: 0.08},
    {t: b.press - 0.2, pose: 'sit-back', look: 1, rot: 7, up: 0.03}, // braces, leaning toward the sun as it gets pressed
    {t: b.shutter + 0.06, pose: 'sit-back', look: 0.2, rot: -5},
    {t: b.padlock + 0.1, pose: 'sit-back', look: 0.6, rot: 4}, // the click: he glances at the padlock
    {t: b.pigeonLand + 0.08, pose: 'sit-back', look: 0.3, rot: -2, up: 0.08}, // a pigeon lands right above him: he looks up
    {t: b.noteSlap + 0.2, pose: 'sit-back', look: 1, rot: 7},
    {t: b.shrug, pose: 'shrug', look: 0.8, expression: 'meh', rot: 3},
    {t: b.shrug + 0.62, pose: 'sit-back', look: 0.7, rot: 4},
  ];
  let pipRot = 0;
  let pipUp = 0;
  for (let i = 1; i < pipKeys.length; i++) {
    const sp = springAt(t, pipKeys[i].t, springs.snappy);
    pipRot += (pipKeys[i].rot - pipKeys[i - 1].rot) * sp;
    pipUp += ((pipKeys[i].up ?? 0) - (pipKeys[i - 1].up ?? 0)) * sp;
  }
  // the shrug: shoulders up and down TWICE (amount 0 -> 1 -> 0.4 -> 1 -> 0 over 0.6 s)
  let shrugAmt: number | undefined;
  if (t >= b.shrug && t < b.shrug + 0.62) {
    const d = t - b.shrug;
    const K: [number, number][] = [[0, 0], [0.1, 1], [0.22, 0.4], [0.34, 1], [0.5, 0.25], [0.62, 0]];
    for (let i = 1; i < K.length; i++) if (d <= K[i][0]) {
      const q = E.inOutSine((d - K[i - 1][0]) / (K[i][0] - K[i - 1][0]));
      shrugAmt = K[i - 1][1] + (K[i][1] - K[i - 1][1]) * q;
      break;
    }
  }
  let pip: React.ReactNode;
  // the hop in from past the left edge (S10 sends him off its right edge): at f0 he is mid-air at the edge (feet x ~30,
  // the front half of him in frame); a low arc (~43 px / frame across), touching down ON 'Even'
  const inHop = hop({t, t0: b.pipLand - 0.4, dur: 0.4, from: {x: -200, y: 1300}, to: {x: pipAnchor[0], y: pipAnchor[1]}, height: 25});
  if (t < b.pipLand) {
    pip = inHop.k > 0 || t >= b.pipLand - 0.5 ? <Elephant x={inHop.x} y={inHop.y} scale={pipScale} pose="stand-side" amount={inHop.spread} squash={inHop.squash} rotate={inHop.rotate} t={t} seed={11} /> : null;
  } else if (t < b.pipOut) {
    // hops off the sill toward the lens: a crouch first
    const t0 = b.pipOut;
    const crouch = t >= t0 - 0.12 ? 0.2 * Math.sin((Math.min(1, (t - (t0 - 0.12)) / 0.12) * Math.PI) / 2) : 0;
    pip = <ElephantTimeline x={pipAnchor[0]} y={pipAnchor[1]} scale={pipScale} t={t} seed={11} keys={pipKeys} squash={inHop.squash + crouch - pipUp} rotate={pipRot} amount={shrugAmt} />;
  } else {
    // a hop UP and AT the lens: he grows ~1.5x by the cut (comes at the camera), drifts a little right (the
    // left-to-right travel of S10 -> S11 -> S12's bollard side) and is already falling at the cut. He stays left of the
    // padlock / tag / note, so the last frame keeps the payoff clear. S12 continues the fall onto his bollard on 'And'.
    const tau = t - b.pipOut;
    const x = pipAnchor[0] + 60 * tau;
    const y = pipAnchor[1] - 800 * tau + 2800 * tau * tau;
    const grow = 1 + 2.4 * tau;
    const stretch = -0.18 * Math.exp(-tau * 8);
    pip = <Elephant x={x} y={y} scale={pipScale * grow} pose="stand-side" amount={Math.min(1, tau * 6)} squash={stretch} rotate={-6 + 40 * tau} t={t} seed={11} />;
  }

  // ---- J6: the sticky note drops from behind govB's cornice (blank back), flips to its lettered face and slaps onto the
  // closed shutter on 'tech'; the strike (S11's heavier NoteStrike) on 'everything'
  const slapAt = b.noteSlap + 0.03;
  const noteEl = (slap: boolean, blank = false) => (
    <StickyNote
      x={NOTE.x}
      y={NOTE.y}
      w={NOTE.w}
      h={NOTE.h}
      lines={blank ? [] : NOTE_LINES}
      size={NOTE_FS}
      slapAt={slap ? slapAt : undefined}
      flutter={false}
      curlAt={blank ? undefined : [b.noteCurl, b.strike + 0.2]}
      rot={NOTE_ROT}
      inkPx={3.4}
      seed="s11/J6"
    />
  );

  // ---- the near plane in BOLD (style bible: weight by depth, front 4.5-5 px): govB's sill top (with its horn under Pip
  // and one doubled re-stroke) and the shutter box's lower edge; the horn steps darker with govB's lights
  const kz = cam.z;
  const govBOff = t >= b.lightsOut + 1 / 30;
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

  return (
    <World sky={[{t: 0, tod: 'day'}]}>
      <XG m={M}>
        <GovernmentPlaza
          state="built"
          detail="close"
          sun={sun}
          bit={false}
          citizensAt={false}
          onlookers={false}
          gov={{
            // govB: the lantern goes out a frame before the building (top to bottom); padlock + tag are drawn below
            govB: {shutterAt: b.shutter, lanternOffAt: b.lightsOut, offAt: b.lightsOut + 1 / 30},
            // the switch-off spreads across the plaza (S12 opens on govA shuttered + darker, govC half shut)
            govA: {shutterAt: b.govAShutter, offAt: b.govAOff},
            govC: {shutterAt: b.govCShutter, shutterStop: 0.5},
          }}
          windowSlot={windowSlot}
          civicOffAt={[0, 1, 2, 3, 4, 5].map((i) => b.civicOff + i * 0.1)}
          civicLanternsOffAt={b.civicLanterns}
          seed="plaza"
        />
        {/* govC's clock face sat as a half-cropped white disc at the right edge beside the sun: S11 paints the turret plain
            (its tan, inside its ink edges), so the strip keeps one simple vertical edge shape */}
        <Fill d={rectPath(838, 641, 64, 58)} color={palette.tan} offset={false} mode="none" seed="s11/clockpatch" />
        {nearPlane}
        {/* on the closed shutter: the sticky note (J6), then S01's lettered 'back soon' tag on its nail and S01's padlock
            on the rail (drawn by the scene: they rock / twirl and they sit over the bold near-plane strokes) */}
        <NoteFlight x={NOTE.x} y={NOTE.y} from={NOTE_FROM} arriveAt={slapAt} dur={slapAt - b.noteDrop} clipY={CORNICE_B} back={noteEl(false, true)} face={noteEl(false)} />
        <NoteBreeze x={NOTE.x} y={NOTE.y} h={NOTE.h} flutterAt={[b.noteCurl - 0.02, b.strike + 0.18]} joltAt={b.strike}>
          {noteEl(true)}
          {t >= slapAt ? <NoteStrike x={NOTE.x} y={NOTE.y} w={NOTE.w} h={NOTE.h} lines={NOTE_LINES} fontSize={NOTE_FS} strike="and on again" rot={NOTE_ROT} at={b.strike} widthPx={4} overPx={7} seed="s11/J6/strike" /> : null}
        </NoteBreeze>
        <TagTwirl x={TAG.x} y={TAG.y} twirlAt={[b.tagTwirl]}>
          <BackSoonTag x={TAG.x} y={TAG.y} lettered text="back soon" size={tagW} minFont={10} at={b.padlock + 0.04} tapAt={[b.tagTwirl + 0.45, b.tagSway]} inkPx={3.4} seed="plaza/govB/tag" />
        </TagTwirl>
        {t >= b.padlock + 0.04 ? <path d={blob(TAG.x, TAG.y - 0.4, 1.6, 1.6, {seed: 's11/nail'})} fill={palette.ink} /> : null}
        <PadlockRock x={PAD[0]} y={PAD[1]} size={PAD_SIZE} rockAt={[b.glint - 0.02, b.bitTap]}>
          <ShutterPadlock x={PAD[0]} y={PAD[1]} size={PAD_SIZE} at={b.padlock} glintAt={b.glint} width={3.4 / cam.z} seed="plaza/govB/pl" />
        </PadlockRock>
        <Sparkle x={PAD[0] + 15} y={PAD[1] - 5} r={7} at={[b.glint]} />
        {/* the sill: the snail (running gag), Bit; the pigeons on the cornice and on the shutter box */}
        <SillSnail x={SNAIL_AT[0]} y={SNAIL_AT[1]} size={28} shellAt={b.snailShell} crawlAt={b.snailCrawl} hideAt={b.bitHop} antennaeAt={b.antennae} peekAt={b.pipOut} seed="s11/snail" />
        {bit}
        <Pigeon x={CORNICE_PIGEON[0]} y={CORNICE_PIGEON[1]} s={PIGEON_S} shuffle={[{at: b.ringHiccup1, dx: -9}, {at: b.cornShuffle, dx: 6}, {at: b.barBack + 0.17, dx: 4}, {at: b.antennae + 0.08, dx: -3}]} hopAt={[b.press + 0.05, b.glint + 0.17]} preenAt={b.preen} seed="s11/pg1" />
        {/* the box pigeon: crouch, then off up-left (the whole bird, flapping, 16 -> 24 px / frame): clear of the box by
            the cut, mid-flight on the last frame */}
        <Pigeon x={BOX_PIGEON[0]} y={BOX_PIGEON[1]} s={PIGEON_S} land={{at: b.pigeonLand, from: [175, 875], dur: 0.45}} shuffle={[{at: b.noteSlap + 0.18, dx: 5}]} hopAt={[b.glint - 0.03]} hopH={20} flyAt={b.pigeonFly} flyTo={[-300, -200]} flySpeed={[16, 24]} seed="s11/pg2" />
      </XG>
      {pip}
    </World>
  );
};

export default Scene11;
