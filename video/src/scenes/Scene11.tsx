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
// CRT screen for govA / govC; shims: NoteBreeze / NoteFlight around the shared StickyNote, a Sparkle, and S11Padlock +
// S11Tag = STAND-INS for the set's govB padlock / tag rigs until the set draws govB's sill under them; entry = an
// isolated preview entry). Shared kit: GovernmentPlaza (far civic skyline, shutters, lights out), LabelTag (L14
// notice), StickyNote (J6), PowerGlyph, SunPress, Bit.

import React, {useMemo} from 'react';
import {World, Sun, useTime, useScene, mat, XG} from '../lib';
import {ease as E, springAt, springs} from '../lib/time';
import {Elephant, ElephantTimeline, hop} from '../lib/mascot';
import type {PoseKey} from '../lib/mascot';
import {crtPhase, GovernmentPlaza, PLAZA, GovId} from './shared/sets';
import {ChromeSlot} from './shared/sets/propSlots';
import {Bit, LabelTag, PowerGlyph, StickyNote, SunPress} from './shared/props';
import {ABS, localBeats, SCENE} from './scene11/beats';
import {camAt, camKeys, camMat, toScreen} from './scene11/camera';
import {crtContent, GovBWindow, Pigeon, SillSnail} from './scene11/actors';
import {NoteBreeze, NoteFlight, padlockShackleTop, S11Padlock, S11Tag, Sparkle} from './scene11/shims';
import type {Pt} from '../lib/sketch';

// ---------------------------------------------------------------- anchors (world = S01 camera rest)

const SUN = {x: 870, y: 700, r: 110}; // SCREEN space, in the gap right of the dome
const SILL_Y = PLAZA.closeup.sill; // 1122
const PIP_W: Pt = [403, SILL_Y]; // the sill's left end
const PIP_S = 1.2; // on-screen scale at zoom 1.6 (grows with the push like the sill)
const BIT_SILL: Pt = [594, SILL_Y];
const BIT_SIZE = 11; // world: ~18 px on screen
const PAD = PLAZA.gov.govB.padlock; // [488, 1121] body centre (the set's govB padlock slot)
const PAD_SIZE = 34; // world: ~56 px on screen (the set's 28 read as a hollow outline)
const SHACKLE_TOP: Pt = [PAD[0], PAD[1] + padlockShackleTop(PAD_SIZE)];
// the lettered 'back soon' tag: the set's govB tag slot (566, 1111) raised 20 on a nail so its lower edge stays at
// screen y <= 1500 at the 1.71 lean (bottom platform UI zone)
const TAG = {x: PLAZA.gov.govB.tag[0], y: PLAZA.gov.govB.tag[1] - 20, size: 48, text: ['back', 'soon'] as [string, string]};
const SNAIL_AT: Pt = [634, SILL_Y];
const NOTICE = {x: 549, y: 1082, w: 140, h: 56}; // L14, inside the lower part of the browser screen, clear of Pip's ear
const NOTE = {x: 553, y: 1033, w: 118, h: 92}; // J6 on the closed shutter's right part, above the tag's nail
const NOTE_FROM: Pt = [905, 990]; // off the right edge (the breeze)
const CORNICE_PIGEON: Pt = [640, 904];
const BOX_PIGEON: Pt = [454, 952];
const PIGEON_S = 0.8;

// govA / govC / govD keep their normal lit chrome (the same params the set's own WindowRig uses at detail 'close')
const MID_CLOSE = 3.4 * 0.7;

const Scene11: React.FC = () => {
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
      <SunPress at={b.press} cx={SUN.x} cy={SUN.y} r={SUN.r} width={3.4}>
        <Sun cx={SUN.x} cy={SUN.y} r={SUN.r} drift={[0, 0]}>
          {(r) => <PowerGlyph r={r} inkOnAt={b.glyph} seed="s11/pwr" />}
        </Sun>
      </SunPress>
    </XG>
  );

  // govA / govC: their normal lit chrome until the switch-off spreads to them (CRT collapse, then a dark screen)
  const crtEv: Partial<Record<GovId, {screenOffAt: number}>> = {govA: {screenOffAt: b.govAScreen}, govC: {screenOffAt: b.govCScreen}};
  const windowSlot = (id: GovId, r: [number, number, number, number]) => {
    if (id !== 'govB') {
      const ev = crtEv[id];
      const u = ev ? crtPhase(t, ev) : 0;
      const content = u > 0.001 && u < 0.999 ? crtContent(u, `s11/${id}/crt`) : undefined;
      return <ChromeSlot x={r[0]} y={r[1]} w={r[2]} h={r[3]} width={id === 'govD' ? MID_CLOSE * (4 / 3.4) : MID_CLOSE} offAt={u >= 0.999 ? -1e6 : undefined} content={content} seed={`s11/${id}/bw`} />;
    }
    return (
      <GovBWindow r={r} steps={steps} hiccups={[b.ringHiccup1, b.barBack]} barsAt={[b.ringHiccup1 - 0.12, b.barFlicker - 0.03, b.earFlick - 0.03]} reloadAt={[b.snailCrawl + 0.17]} shakeAt={b.barBack} flickerAt={b.barFlicker} ringR={12.5} inkW={MID_CLOSE} seed="s11/govB">
        <LabelTag kind="notice" x={NOTICE.x} y={NOTICE.y} w={NOTICE.w} h={NOTICE.h} lines={['FBI · NSA', 'UK NCSC · CERT-EU']} fontSize={19} at={b.notice} rot={-1.5} inkPx={2.2} seed="s11/L14" />
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
    {t: b.earFlick, pose: 'sit-back', look: 0.6, rot: 4},
    {t: b.lookNotice, pose: 'sit-back', look: 1, rot: 8},
    {t: b.glanceSun, pose: 'sit-back', look: 1, rot: 3, up: 0.08},
    {t: b.shutter + 0.06, pose: 'sit-back', look: 0.2, rot: -5},
    {t: b.padlock + 0.04, pose: 'sit-back', look: 0.6, rot: 4}, // the click: he glances at the padlock
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
  const inHop = hop({t, t0: b.pipLand - 0.36, dur: 0.36, from: {x: -90, y: 1250}, to: {x: pipAnchor[0], y: pipAnchor[1]}, height: 70});
  if (t < b.pipLand) {
    pip = inHop.k > 0 || t >= b.pipLand - 0.5 ? <Elephant x={inHop.x} y={inHop.y} scale={pipScale} pose="stand-side" amount={inHop.spread} squash={inHop.squash} rotate={inHop.rotate} t={t} seed={11} /> : null;
  } else if (t < b.pipOut) {
    // hops off the sill toward the lens: a crouch first
    const t0 = b.pipOut;
    const crouch = t >= t0 - 0.12 ? 0.2 * Math.sin((Math.min(1, (t - (t0 - 0.12)) / 0.12) * Math.PI) / 2) : 0;
    pip = <ElephantTimeline x={pipAnchor[0]} y={pipAnchor[1]} scale={pipScale} t={t} seed={11} keys={pipKeys} squash={inHop.squash + crouch - pipUp} rotate={pipRot} amount={shrugAmt} />;
  } else {
    // a ballistic leap down-right that grows (he leaves toward the viewer, keeping the left-to-right travel of
    // S10 -> S11; S12 lands him on his bollard on 'And')
    const tau = t - b.pipOut;
    const x = pipAnchor[0] + 380 * tau;
    const y = pipAnchor[1] - 150 * tau + 0.5 * 9000 * tau * tau;
    const grow = 1 + 3.2 * tau;
    const stretch = -0.18 * Math.exp(-tau * 8);
    pip = <Elephant x={x} y={y} scale={pipScale * grow} pose="stand-side" amount={Math.min(1, tau * 6)} squash={stretch} rotate={-8 + 60 * tau} t={t} seed={11} />;
  }

  // ---- J6: the sticky note rides the breeze in from off the right edge and slaps onto the closed shutter
  const slapAt = b.noteSlap + 0.03;
  const noteEl = (slap: boolean) => (
    <StickyNote
      x={NOTE.x}
      y={NOTE.y}
      w={NOTE.w}
      h={NOTE.h}
      lines={['Turn it off', 'and on again']}
      size={19.5}
      strike="and on again"
      slapAt={slap ? slapAt : undefined}
      flutter={false}
      strikeAt={b.strike}
      curlAt={[b.noteCurl, b.strike + 0.2]}
      rot={-4}
      inkPx={2.6}
      seed="s11/J6"
    />
  );

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
          civicOffAt={[0, 1, 2, 3, 4, 5].map((i) => b.padlock + 0.1 + i * 0.12)}
          civicLanternsOffAt={b.padlock + 0.6}
          seed="plaza"
        />
        {/* on the closed shutter: the sticky note (J6), then the lettered 'back soon' tag on its nail and the padlock on
            the rail (drawn here, OVER govB's sill ink: stand-ins for the set's rigs) */}
        <NoteFlight x={NOTE.x} y={NOTE.y} from={NOTE_FROM} arriveAt={slapAt} dur={0.8}>
          {noteEl(false)}
        </NoteFlight>
        <NoteBreeze x={NOTE.x} y={NOTE.y} h={NOTE.h} flutterAt={[b.noteCurl - 0.02, b.strike + 0.18]} joltAt={b.strike}>
          {noteEl(true)}
        </NoteBreeze>
        <S11Tag x={TAG.x} y={TAG.y} size={TAG.size} text={TAG.text} at={b.padlock + 0.04} twirlAt={[b.tagTwirl]} tapAt={[b.tagTwirl + 0.45, b.tagSway]} inkPx={2.2} seed="s11/tag" />
        <S11Padlock x={PAD[0]} y={PAD[1]} size={PAD_SIZE} at={b.padlock} rockAt={[b.glint - 0.02, b.bitTap]} seed="s11/pl" />
        <Sparkle x={PAD[0] - 17} y={PAD[1] - 2} r={7} at={[b.glint]} />
        {/* the sill: the snail (running gag), Bit; the pigeons on the cornice and on the shutter box */}
        <SillSnail x={SNAIL_AT[0]} y={SNAIL_AT[1]} size={28} shellAt={b.snailShell} crawlAt={b.snailCrawl} hideAt={b.bitHop} antennaeAt={b.antennae} peekAt={b.pipOut} seed="s11/snail" />
        {bit}
        <Pigeon x={CORNICE_PIGEON[0]} y={CORNICE_PIGEON[1]} s={PIGEON_S} shuffle={[{at: b.ringHiccup1, dx: -9}, {at: b.snailCrawl + 0.14, dx: 6}, {at: b.barBack - 0.06, dx: 4}]} hopAt={[b.press + 0.05]} preenAt={b.preen} seed="s11/pg1" />
        <Pigeon x={BOX_PIGEON[0]} y={BOX_PIGEON[1]} s={PIGEON_S} land={{at: b.pigeonLand, from: [300, 840], dur: 0.45}} shuffle={[{at: b.noteSlap + 0.18, dx: 5}]} hopAt={[b.glint - 0.03]} hopH={20} flyAt={b.tagSway} flyTo={[-320, -260]} seed="s11/pg2" />
      </XG>
      {pip}
    </World>
  );
};

export default Scene11;
