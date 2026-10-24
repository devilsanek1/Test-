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
// Local helpers: ./scene11/* (beats, camera, actors, shims = stand-ins for the pending shared LabelTag / StickyNote /
// lettered BackSoonTag).

import React, {useMemo} from 'react';
import {World, Sun, palette, useTime, useScene, mat, XG} from '../lib';
import {Elephant, ElephantTimeline, hop} from '../lib/mascot';
import type {PoseKey} from '../lib/mascot';
import {GovernmentPlaza, PLAZA, GovId} from './shared/sets';
import {ChromeSlot} from './shared/sets/propSlots';
import {Bit, LabelTag, PowerGlyph, SunPress} from './shared/props';
import {ABS, localBeats, SCENE} from './scene11/beats';
import {camAt, camKeys, camMat, toScreen} from './scene11/camera';
import {GovBWindow, Pigeon, SillSnail} from './scene11/actors';
import {StickyNote} from './scene11/shims';
import type {Pt} from '../lib/sketch';

// ---------------------------------------------------------------- anchors (world = S01 camera rest)

const SUN = {x: 870, y: 700, r: 110}; // SCREEN space, in the gap right of the dome
const SILL_Y = PLAZA.closeup.sill; // 1122
const PIP_W: Pt = [403, SILL_Y]; // the sill's left end
const PIP_S = 1.2; // on-screen scale at zoom 1.6 (grows with the push like the sill)
const BIT_SILL: Pt = [594, SILL_Y];
const BIT_SIZE = 11; // world: ~18 px on screen
const PAD = PLAZA.gov.govB.padlock; // [518, 1121] body centre
const SHACKLE_TOP: Pt = [PAD[0], PAD[1] - 16.5];
const SNAIL_AT: Pt = [634, SILL_Y];
const NOTICE = {x: 533, y: 1073, w: 160, h: 64}; // L14, inside the lower left of the browser screen
const NOTE = {x: 568, y: 1058, w: 92, h: 72}; // J6 on the closed shutter's lower right
const CORNICE_PIGEON: Pt = [640, 904];
const BOX_PIGEON: Pt = [454, 952];

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

  const windowSlot = (id: GovId, r: [number, number, number, number]) => {
    if (id !== 'govB') return <ChromeSlot x={r[0]} y={r[1]} w={r[2]} h={r[3]} width={id === 'govD' ? MID_CLOSE * (4 / 3.4) : MID_CLOSE} seed={`s11/${id}/bw`} />;
    return (
      <GovBWindow r={r} steps={steps} hiccups={[b.ringHiccup1, b.barBack]} barsAt={[0.3, 0.55, 0.8]} reloadAt={[b.barStep, b.snailCrawl + 0.17]} shakeAt={b.barBack} flickerAt={b.barFlicker} inkW={MID_CLOSE} seed="s11/govB">
        <LabelTag kind="notice" x={NOTICE.x} y={NOTICE.y} w={NOTICE.w} h={NOTICE.h} lines={['FBI · NSA', 'UK NCSC · CERT-EU']} fontSize={21} at={b.notice} rot={-1.5} inkPx={2.2} seed="s11/L14" />
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
  const pipKeys: PoseKey[] = [
    {t: -10, pose: 'sit-back', look: 0},
    {t: b.earFlick, pose: 'sit-back', look: 0.35},
    {t: b.lookNotice, pose: 'sit-back', look: 0.6},
    {t: b.glanceSun, pose: 'sit-back', look: 1},
    {t: b.shutter + 0.06, pose: 'sit-back', look: 0.3},
    {t: b.noteSlap + 0.2, pose: 'sit-back', look: 0.55},
    {t: b.shrug, pose: 'shrug', look: 0.8, expression: 'meh'},
    {t: b.shrug + 0.55, pose: 'sit-back', look: 0.7},
  ];
  let pip: React.ReactNode;
  const inHop = hop({t, t0: b.pipLand - 0.36, dur: 0.36, from: {x: -90, y: 1250}, to: {x: pipAnchor[0], y: pipAnchor[1]}, height: 70});
  if (t < b.pipLand) {
    pip = inHop.k > 0 || t >= b.pipLand - 0.5 ? <Elephant x={inHop.x} y={inHop.y} scale={pipScale} pose="stand-side" amount={inHop.spread} squash={inHop.squash} rotate={inHop.rotate} t={t} seed={11} /> : null;
  } else if (t < b.pipOut) {
    pip = <ElephantTimeline x={pipAnchor[0]} y={pipAnchor[1]} scale={pipScale} t={t} seed={11} keys={pipKeys} squash={inHop.squash} />;
  } else {
    // hops off the sill toward the lens: down-left and bigger, out of frame by the cut
    const outHop = hop({t, t0: b.pipOut + 0.12, dur: 0.34, from: {x: pipAnchor[0], y: pipAnchor[1]}, to: {x: 230, y: 2260}, height: 60});
    const grow = 1 + 0.9 * Math.max(0, outHop.k);
    pip =
      outHop.k <= 0 ? (
        <ElephantTimeline x={pipAnchor[0]} y={pipAnchor[1]} scale={pipScale} t={t} seed={11} keys={pipKeys} squash={outHop.squash} />
      ) : (
        <Elephant x={outHop.x} y={outHop.y} scale={pipScale * grow} pose="stand-side" flip amount={outHop.spread} squash={outHop.squash} rotate={outHop.rotate} t={t} seed={11} />
      );
  }

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
            govB: {
              shutterAt: b.shutter,
              offAt: b.lightsOut,
              padlockAt: b.padlock,
              glintAt: b.glint,
              tagAt: b.padlock + 0.04,
              tagProps: {lettered: true, text: ['back', 'soon'], size: 50, inkPx: 2.2, twirlAt: b.tagTwirl, tapAt: [b.tagTwirl + 0.45, b.tagSway]},
            },
          }}
          windowSlot={windowSlot}
          seed="plaza"
        />
        {/* on the closed shutter (the set hangs the padlock + the lettered 'back soon' tag of S01 on it): the sticky note (J6) */}
        <StickyNote
          x={NOTE.x}
          y={NOTE.y}
          w={NOTE.w}
          h={NOTE.h}
          lines={['Turn it off', 'and on again']}
          size={15}
          strike="and on again"
          slapAt={b.noteSlap + 0.03}
          flutter={{from: [720, 950], dur: 0.38, spin: 80}}
          strikeAt={b.strike}
          curlAt={[b.noteCurl, b.strike + 0.2]}
          rot={-4}
          seed="s11/J6"
        />
        {/* the sill: the snail (running gag), Bit; the pigeons on the cornice and on the shutter box */}
        <SillSnail x={SNAIL_AT[0]} y={SNAIL_AT[1]} size={28} shellAt={b.snailShell} crawlAt={b.snailCrawl} hideAt={b.bitHop} antennaeAt={b.antennae} peekAt={b.pipOut} seed="s11/snail" />
        {bit}
        <Pigeon x={CORNICE_PIGEON[0]} y={CORNICE_PIGEON[1]} s={0.85} shuffle={[{at: b.ringHiccup1, dx: -9}, {at: 2.1, dx: 6}, {at: 2.32, dx: 4}]} hopAt={[b.press + 0.05]} preenAt={b.preen} seed="s11/pg1" />
        <Pigeon x={BOX_PIGEON[0]} y={BOX_PIGEON[1]} s={0.85} land={{at: b.pigeonLand, from: [300, 840], dur: 0.45}} shuffle={[{at: b.noteSlap + 0.18, dx: 5}]} hopAt={[b.glint]} flyAt={b.tagSway} flyTo={[-320, -260]} color={palette.white} seed="s11/pg2" />
      </XG>
      {pip}
    </World>
  );
};

export default Scene11;
