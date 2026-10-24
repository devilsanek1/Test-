// S07 "Word got out" — "but word got out before the fix was ready," (cut(heads-up) -> cut(ready); 21.985-24.095 s).
// Town Square at golden hour (NoticeboardCorner + TelephoneWires WIRES.S07 + the Workshop corner preset): the leaked
// sheet lens-wipes in and shrinks into the notice pinned on the board's left pane (the scene arrives as flat fills,
// its linework draws on top -> bottom), the board's address-bar rail goes online, clones 2 -> 4 -> 8 on pane 2 and the
// wall, a copy slaps onto Pip's face, four clones lift off to the wires and fan out left of the sun (Bit rides one,
// right at the sun's left limb), readers rise and raise phones, the sun lands behind the wall top and becomes an hours
// clock (the fix is not ready) that no copy ever covers, the workshop's blind stays down ('still fixing...', J4), then a
// fixed 0.40 s tilt-up follows the copies into S08 (wires at screen 896 / 928 / 960, the sun at rest at (640, 1021),
// the copies at S08's first-frame pegs and speeds). Label L7 on the board's bottom rail.
// Beat table: scene07/beats.ts. Parts: scene07/parts.tsx. No shims (J4 is the shared LabelTag card, as S06's J3).
// Isolated preview entry: scene07/entry.tsx. Notes: docs/scenes/S07.md.

import React from 'react';
import {World, Sun, XG, mat, palette, useTime, ease as E, Pt} from '../lib';
import {NoticeboardCorner, NOTICE_CORNER} from './shared/sets';
import type {LayerWrap} from './shared/sets';
import {EdgeOnlooker, HoursClock, LabelTag, LeakSheet} from './shared/props';
import {useBeats} from './scene07/beats';
import {BoardClones, camAt, camMat, CLONE, CloneSpot, cruiseFor, FarRoofDetails, Flyer, InkReveal, PaneGlass, PhoneCopy, Pigeon, PinDot, PipS07, PUSHED, RevealPass, RiseFromLow, SpinWedge, WireCopy, WireCopySpec} from './scene07/parts';

// ---------------------------------------------------------------- layout (world px at camera rest)

/** The notice on the left pane (pane 1 = x 153-436, y 943-1347). */
const NOTICE = {x: 295, y: 1140, w: 210, h: 270, rot: -2};
/** Its pin: the top centre of the rotated sheet. */
const PIN: Pt = [NOTICE.x + 118.8 * Math.sin((NOTICE.rot * Math.PI) / 180), NOTICE.y - 118.8 * Math.cos((NOTICE.rot * Math.PI) / 180)];

const S7_READERS = NOTICE_CORNER.readers;
/** The right-hand readers' heads, nudged left of the set slots so both heads are in frame after the push (the set's
 *  (1010, 1260) head was cropped off at screen x ~1100). */
const RIGHT_HEADS: Pt[] = [
  [866, 1304],
  [944, 1236],
];
/** The left readers wait low in the frame from the cut (heads at y ~1740 / 1765) and rise the rest of the way on 'out'. */
const LOW = [1740 - S7_READERS[0].head[1], 1765 - S7_READERS[1].head[1]];
/** On 'fix' the sun lifts a little so the whole clock face reads over the wall top. */
const CLOCK_LIFT = 70;
/** The sun's screen y on the cut (S08's match: (640, 1021) r110, half behind the wall top). */
const SUN_CUT_Y = 1021;
/** Screen x of S08's pegged copies on its first frame (src/scenes/Scene08.tsx COPIES / BIT_COPY x0 at its crane start
 *  (540, 1260) zoom 1.3: screen = 540 + (x0 - 540) x 1.3) and their hand-over speeds (v0, S08 world px/s at zoom 1.3):
 *  S07's copies end exactly there, at exactly that screen speed. If S08 moves or retimes its copies, update these. */
const CUT_COPIES = {w0: 540 + (128 - 540) * 1.3, w2: 540 + (262 - 540) * 1.3, w1: 540 + (392 - 540) * 1.3, bit: 540 + (478 - 540) * 1.3};
const CUT_V = {w0: 298, w2: 215, w1: 95, bit: 166};
/** S07 world speed of an S08 world speed (the screen speed is the same on both sides of the cut). */
const s7v = (v8: number) => (v8 * 1.3) / PUSHED.z;
/** World x (S07) of a screen x on the last frame (camera (480, 760) zoom 1.06). */
const cutWorldX = (sx: number) => PUSHED.x + (sx - 540) / PUSHED.z;
/** Reader 1's phone screen once raised (world, measured on the render at t 1.5). */
const PHONE: Pt = [296, 1238];
/** J4 'still fixing...' card centre, over the shop window's top-left corner: above the round elephant sign and clear of
 *  the right rail after the push (card right edge ~ screen 948). */
const J4 = {x: 812, y: 990};

const Scene07: React.FC = () => {
  const t = useTime();
  const B = useBeats();
  const cam = camAt(t, B);
  const M = camMat(cam);

  // ---- the hours clock on the sun (pops just before 'fix', gone as the tilt starts). One minute-hand turn in 0.40 s:
  //      <= 47 deg a frame at the inOut(sine) peak, with a peach speed wedge trailing the hand while it is fast.
  const CLK = {at: B.fix - 0.04, spinAt: B.fix - 0.01, spinDur: 0.4, turns: 1, outAt: B.tilt - 0.14};

  // ---- the sun: screen space (the push does not move it). On the tilt it travels to S08's (640, 1021) on its own
  //      inOut(sine) curve, so it arrives there at rest (S08's sky sun is still): no velocity break at the cut.
  const sun = (
    <XG m={mat.inv(M)}>
      <Sun
        cx={420}
        cy={985}
        r={110}
        drift={[0, 0]}
        hops={[{t: B.before - 1.0, to: [640, 820], h: 74, air: 1.0}]}
        moves={[
          {at: B.fix - 0.03, dur: 0.2, y: 820 - CLOCK_LIFT, ease: E.outBack(1.4)},
          {at: B.tilt, dur: B.end - B.tilt, y: SUN_CUT_Y, ease: E.inOutSine},
        ]}
      >
        {(r) => (
          <>
            <SpinWedge r={r} at={CLK.at} spinAt={CLK.spinAt} spinDur={CLK.spinDur} turns={CLK.turns} outAt={CLK.outAt} />
            <HoursClock r={r} at={CLK.at} spinAt={CLK.spinAt} spinDur={CLK.spinDur} turns={CLK.turns} hourSteps={3} outAt={CLK.outAt} seed="s7clock" />
          </>
        )}
      </Sun>
    </XG>
  );

  // ---- clones 2 -> 4 -> 8 on pane 2 and the wall (never on the notice's lock sketch); four of them lift off to the
  //      wires (each hides on the frame its wire copy flies on from its place)
  const lift = {A: B.before - 0.2, Bit: B.before - 0.14, C: B.before - 0.08, D: B.before - 0.02};
  const SRC = {
    C: {x: 530, y: 1032, at: B.got - 0.08, rot: -6, s: 0.8, liftAt: lift.C},
    A: {x: 78, y: 1004, at: B.got - 0.04, rot: 6, s: 0.62, liftAt: lift.A},
    Bit: {x: 628, y: 1214, at: B.out + 0.04, rot: 5, s: 0.75, liftAt: lift.Bit},
    D: {x: 548, y: 1252, at: B.out + 0.08, rot: -4, s: 0.9, liftAt: lift.D},
  };
  const clones: CloneSpot[] = [
    SRC.C,
    SRC.A,
    {x: 655, y: 1048, at: B.out, rot: 4, s: 0.7}, // the flyer shoots off this one
    SRC.Bit,
    SRC.D,
    {x: 592, y: 1130, at: B.out + 0.16, rot: -3, s: 0.6},
    {x: 690, y: 1296, at: B.out + 0.19, rot: 7, s: 0.5},
    {x: 172, y: 1304, at: B.out + 0.22, rot: -6, s: 0.5},
  ];

  // ---- copies peg onto the wires on 'before', fanned out left of the sun (x 200 / 446 / 290 / 370), and travel left
  //      over the rooftops, slowest nearest the sun: no copy ever covers the clock (ring left edge ~ world 489). On the
  //      tilt a gust takes them all up to S08's hand-over speeds (CUT_V), ending exactly at S08's first-frame pegs.
  const RAMP = B.end - B.tilt;
  const spec = (src: CloneSpot, wire: 0 | 1 | 2, x: number, pegAt: number, sx: number, v8: number, seed: string, extra: Partial<WireCopySpec> = {}): WireCopySpec => ({
    from: [src.x, src.y],
    fromS: (src.s * CLONE.w) / 210,
    fromRot: src.rot,
    liftAt: src.liftAt!,
    wire,
    x,
    pegAt,
    vc: cruiseFor(x, pegAt, cutWorldX(sx), s7v(v8), B.end, RAMP),
    vEnd: s7v(v8),
    rampAt: B.tilt,
    rampDur: RAMP,
    seed,
    ...extra,
  });
  const copies: WireCopySpec[] = [
    spec(SRC.A, 0, 200, B.before, CUT_COPIES.w0, CUT_V.w0, 's7wc0'),
    spec(SRC.Bit, 1, 446, B.before + 0.06, CUT_COPIES.bit, CUT_V.bit, 's7wc1', {bit: true, bitHopAt: B.was + 0.02}),
    spec(SRC.C, 2, 290, B.before + 0.12, CUT_COPIES.w2, CUT_V.w2, 's7wc2'),
    spec(SRC.D, 1, 370, B.before + 0.18, CUT_COPIES.w1, CUT_V.w1, 's7wc3'),
  ];

  // far roof details go into the set's roofs layer (behind the wall)
  const wrap: LayerWrap = (name, _z, node) =>
    name === 'roofs' ? (
      <>
        {node}
        <FarRoofDetails />
      </>
    ) : (
      node
    );

  const set = (pass: RevealPass) => (
    <>
      <NoticeboardCorner
        sun={pass === 'ink' ? null : sun}
        board={{
          railLightAt: B.got,
          pane1: (r) => <PaneGlass r={r} corner="tl" seed="s7pane1" />,
          pane2: (r) => <PaneGlass r={r} corner="tr" seed="s7pane2" />,
        }}
        workshop={{signSwingAt: B.fix}}
        readers={false}
        pigeons={false}
        wrap={wrap}
        seed="nc"
      />
      {/* J4: the makers' blind is still down: 'still fixing...' (S06's J3 card, the shared LabelTag). Pinned over the shop
          window's top-left corner, drawn after the set so the window frame and the round sign's bracket stay behind it */}
      <LabelTag kind="card" x={J4.x} y={J4.y} text={['still', 'fixing...']} fontSize={29} swing={[B.fix]} seed="s7J4" />
      {/* pigeons on the wires: they hop as copies land by them; one flaps up on 'was' as the first copy reaches it */}
      <Pigeon wire={0} x={250} hopAt={[B.before - 0.02]} seed="s7pg0" />
      <Pigeon wire={0} x={350} hopAt={[B.before + 0.16]} flip color={palette.sand} seed="s7pg1" />
      <Pigeon wire={0} x={70} flyAt={B.was - 0.02} flyTo={[-240, -150]} seed="s7pg2" />
    </>
  );

  // readers at the frame sides: the left two wait low from the cut and rise on 'out', the right two pop up on 'the';
  // four phones go up. arms 'near': the phone arm is the only arm drawn (no hand left floating at the hip).
  const reader = (i: number) => {
    const r = S7_READERS[i];
    const head = i < 2 ? r.head : RIGHT_HEADS[i - 2];
    return (
      <EdgeOnlooker
        key={i}
        x={head[0]}
        y={head[1]}
        head={82}
        hair={r.hair}
        body={r.body}
        acc={r.acc}
        riseAt={i < 2 ? undefined : B.the - 0.06 + (i - 2) * 0.06}
        raisePhoneAt={[B.the, B.the + 0.05, B.the + 0.15, B.the + 0.2][i]}
        arms="near"
        rim={i < 2 ? 'left' : 'right'}
        seed={`nc/rd${i}`}
      />
    );
  };
  const leftReaders = () => (
    <>
      {[0, 1].map((i) => (
        <RiseFromLow key={i} at={B.out + i * 0.06} low={LOW[i]}>
          {reader(i)}
        </RiseFromLow>
      ))}
    </>
  );
  // fill-first reveal: the linework draws on top -> bottom down to the frame bottom (ground marks, the low readers)
  const REVEAL = {at: B.cut + 0.05, dur: 0.48, y0: 560, y1: 1900};

  return (
    <World sky={[{t: 0, tod: 'golden'}]}>
      <XG m={M}>
        <InkReveal {...REVEAL} render={set} />

        {/* the board: the notice (after the lens wipe lands), its pin, the clones */}
        {t >= B.pinPip + 0.06 ? <LeakSheet x={NOTICE.x} y={NOTICE.y} w={NOTICE.w} h={NOTICE.h} rot={NOTICE.rot} pin={false} depth="mid" seed="s7notice" /> : null}
        <PinDot x={PIN[0]} y={PIN[1]} at={B.pinPip + 0.06} />
        <BoardClones spots={clones} seed="s7clone" />

        {/* copies travel left along the wires (Bit rides one) */}
        {copies.map((c) => (
          <WireCopy key={c.seed} c={c} />
        ))}

        {/* L7 on the board's bottom rail */}
        <LabelTag kind="card" box={[300, 1338, 640, 1436]} text={['word leaked Oct 20 ·', 'fix out Oct 21']} fontSize={36} swing at={B.label} seed="s7L7" />

        {/* Pip on the board top + the flyer gag */}
        <PipS07 B={B} />
        <Flyer B={B} from={[655, 1048]} />

        <InkReveal {...REVEAL} render={leftReaders} />
        {[2, 3].map((i) => reader(i))}
        <PhoneCopy x={PHONE[0]} y={PHONE[1]} at={B.was - 0.1} ringAt={B.was - 0.06} rot={4} />

        {/* the lens wipe: the printed sheet at the lens shrinks into the notice (on top of everything until it lands) */}
        {t < B.pinPip + 0.06 ? (
          <LeakSheet x={NOTICE.x} y={NOTICE.y} w={NOTICE.w} h={NOTICE.h} rot={NOTICE.rot} pin={false} depth="mid" lensWipe={{at: B.pinPip + 0.06 - 0.433, from: [-260, 1250], fromS: 1.6, peak: 8, focus: [540, 960]}} seed="s7notice" />
        ) : null}
      </XG>
    </World>
  );
};

export default Scene07;
