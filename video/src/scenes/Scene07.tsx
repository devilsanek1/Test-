// S07 "Word got out" — "but word got out before the fix was ready," (cut(heads-up) -> cut(ready); 21.985-24.095 s).
// Town Square at golden hour (NoticeboardCorner + TelephoneWires WIRES.S07 + the Workshop corner preset): the leaked
// sheet lens-wipes in and shrinks into the notice pinned on the board's left pane (the scene arrives as flat fills,
// its linework draws on top -> bottom), the board's address-bar rail goes online, clones 2 -> 4 -> 8, a copy slaps
// onto Pip's face, copies lift off to the wires and travel left over the rooftops (Bit rides one), readers rise and
// raise phones, the sun lands behind the wall top and becomes an hours clock (the fix is not ready), the workshop's
// blind stays down ('still fixing...', J4), then a fixed 0.40 s tilt-up follows the copies into S08 (wires at screen
// 896 / 928 / 960, the sun half behind the wall top at (640, 1021)). Label L7 on the board's bottom rail.
// Beat table: scene07/beats.ts. Local stand-ins (LabelTag, BlindSign): scene07/shims.tsx. Notes: docs/scenes/S07.md.

import React from 'react';
import {World, Sun, XG, mat, useTime} from '../lib';
import {NoticeboardCorner, NOTICE_CORNER, WORKSHOP_CORNER} from './shared/sets';
import {HoursClock, LeakClones, LeakSheet, OnlookerSlotProps} from './scene07/kit';
import {EdgeOnlooker} from './shared/props';
import {useBeats} from './scene07/beats';
import {camAt, camMat, Flyer, InkReveal, PhoneCopy, Pigeon, PinDot, PipS07, RevealPass, tiltPx, WireCopy, WireCopySpec} from './scene07/parts';
import {BlindSign, LabelTag} from './scene07/shims';

// ---------------------------------------------------------------- layout (world px at camera rest)

/** The notice on the left pane (pane 1 = x 153-436, y 943-1347). */
const NOTICE = {x: 295, y: 1140, w: 210, h: 270, rot: -2};
/** Its pin: the top centre of the rotated sheet. */
const PIN: [number, number] = [NOTICE.x + 119 * Math.sin((-NOTICE.rot * Math.PI) / 180) * -1, NOTICE.y - 119 * Math.cos((NOTICE.rot * Math.PI) / 180)];

const S7_READERS = NOTICE_CORNER.readers;

const Scene07: React.FC = () => {
  const t = useTime();
  const B = useBeats();
  const cam = camAt(t, B);
  const M = camMat(cam);
  const tilt = tiltPx(t, B);

  // ---- the sun: screen space (the push does not move it), the tilt moves it down with every layer
  const sunM = mat.mul(mat.inv(M), mat.translate(0, tilt));
  const sun = (
    <XG m={sunM}>
      <Sun cx={420} cy={985} r={110} drift={[0, 0]} hops={[{t: B.before - 1.0, to: [640, 820], h: 74, air: 1.0}]}>
        {(r) => <HoursClock r={r} at={B.fix} spinAt={B.fix + 0.04} spinDur={0.48} turns={2.5} hourSteps={3} outAt={B.tilt} seed="s7clock" />}
      </Sun>
    </XG>
  );

  // ---- clones 2 -> 4 -> 8 across both panes
  const clones = [
    {x: 528, y: 1050, at: B.got, rot: -6, s: 0.8},
    {x: 655, y: 1222, at: B.got + 0.04, rot: 5, s: 0.8},
    {x: 650, y: 1040, at: B.out, rot: 4, s: 0.8},
    {x: 398, y: 1288, at: B.out + 0.04, rot: -5, s: 0.66},
    {x: 522, y: 1262, at: B.out + 0.16, rot: 3, s: 0.8},
    {x: 590, y: 1145, at: B.out + 0.19, rot: -3, s: 0.8},
    {x: 398, y: 1004, at: B.out + 0.22, rot: 7, s: 0.66},
    {x: 205, y: 990, at: B.out + 0.25, rot: -6, s: 0.6},
  ];

  // ---- copies lift off the board, peg onto the wires on 'before' and travel left over the rooftops (into S08)
  const copies: WireCopySpec[] = [
    {from: [560, 1040], liftAt: B.before - 0.2, wire: 0, x: 500, pegAt: B.before, speed: 360, seed: 's7wc0'},
    {from: [620, 1140], liftAt: B.before - 0.14, wire: 1, x: 640, pegAt: B.before + 0.06, speed: 360, bit: true, seed: 's7wc1'},
    {from: [500, 1250], liftAt: B.before - 0.08, wire: 2, x: 430, pegAt: B.before + 0.12, speed: 360, seed: 's7wc2'},
    {from: [650, 1220], liftAt: B.before - 0.02, wire: 1, x: 880, pegAt: B.before + 0.18, speed: 360, seed: 's7wc3'},
  ];

  const set = (pass: RevealPass) => (
    <>
      <NoticeboardCorner
        sun={pass === 'ink' ? null : sun}
        board={{railLightAt: B.got}}
        workshop={{signSwingAt: B.fix}}
        readers={false}
        pigeons={false}
        seed="nc"
      />
      {/* J4: the makers' blind is still down: 'still fixing...' (on the blind's left half, clear of the right rail) */}
      <BlindSign x={WORKSHOP_CORNER.shop[0] + 58} y={WORKSHOP_CORNER.shop[1] + 12} swingAt={[B.fix]} seed="s7blind" />
    </>
  );

  return (
    <World sky={[{t: 0, tod: 'golden'}]}>
      <XG m={M}>
        <InkReveal at={B.cut + 0.05} dur={0.45} y0={560} y1={1560} render={set} />

        {/* the board: the notice (after the lens wipe lands), its pin, the clones */}
        {t >= B.pinPip + 0.06 ? <LeakSheet x={NOTICE.x} y={NOTICE.y} w={NOTICE.w} h={NOTICE.h} rot={NOTICE.rot} pin={false} depth="mid" seed="s7notice" /> : null}
        <PinDot x={PIN[0]} y={PIN[1]} at={B.pinPip + 0.06} />
        <LeakClones spots={clones} seed="s7clone" />

        {/* the wires: pigeons hop over the passing pegs; one flaps up on 'was'; copies travel left (Bit rides one) */}
        <Pigeon wire={0} x={470} hopAt={[B.before + 0.02]} seed="s7pg0" />
        <Pigeon wire={0} x={428} hopAt={[B.before + 0.13]} flip color="#D9BBA1" seed="s7pg1" />
        <Pigeon wire={1} x={700} flyAt={B.was - 0.02} flyTo={[-240, -150]} seed="s7pg2" />
        {copies.map((c) => (
          <WireCopy key={c.seed} c={c} />
        ))}

        {/* L7 on the board's bottom rail */}
        <LabelTag x={470} y={1352} w={346} h={92} lines={['word leaked Oct 20 ·', 'fix out Oct 21']} size={38} at={B.label} seed="s7L7" />

        {/* Pip on the board top + the flyer gag */}
        <PipS07 B={B} />
        <Flyer B={B} from={[650, 1040]} />

        {/* readers at the frame sides: the left two rise on 'out', the right two on 'the'; four phones go up */}
        {S7_READERS.map((r, i) => (
          <EdgeOnlooker
            key={i}
            x={r.head[0]}
            y={r.head[1]}
            head={82}
            hair={r.hair}
            body={r.body}
            acc={r.acc}
            riseAt={i < 2 ? B.out + i * 0.06 : B.the - 0.06 + (i - 2) * 0.06}
            raisePhoneAt={[B.the, B.the + 0.05, B.the + 0.15, B.the + 0.2][i]}
            rim={i < 2 ? 'left' : 'right'}
            seed={`nc/rd${i}`}
          />
        ))}
        <PhoneCopy x={0} y={0} at={B.was} />

        {/* the lens wipe: the printed sheet at the lens shrinks into the notice (on top of everything until it lands) */}
        {t < B.pinPip + 0.06 ? (
          <LeakSheet x={NOTICE.x} y={NOTICE.y} w={NOTICE.w} h={NOTICE.h} rot={NOTICE.rot} pin={false} depth="mid" lensWipe={{at: B.pinPip + 0.06 - 0.433, from: [-260, 1250], fromS: 1.6, peak: 8, focus: [540, 960]}} seed="s7notice" />
        ) : null}
      </XG>
    </World>
  );
};

export default Scene07;

export type {OnlookerSlotProps};
