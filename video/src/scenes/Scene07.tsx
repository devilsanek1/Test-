// S07 "Word got out" — "but word got out before the fix was ready," (cut(heads-up) -> cut(ready); 21.985-24.095 s).
// Town Square at golden hour (NoticeboardCorner + TelephoneWires WIRES.S07 + the Workshop corner preset): the leaked
// sheet lens-wipes in and shrinks into the notice pinned on the board's left pane (the scene arrives as flat fills,
// its linework draws on top -> bottom), the board's address-bar rail goes online, clones 2 -> 4 -> 8 on pane 2 and the
// wall, a copy slaps onto Pip's face, four clones lift off to the wires and fan out left of the sun (Bit rides one,
// right at the sun's left limb), readers rise and raise phones, the sun lands behind the wall top and becomes an hours
// clock (the fix is not ready) that no copy ever covers, the workshop's blind stays down ('still fixing...', J4: the
// shared FixSign, the same sign as S06's J3 and S09's J5), then a fixed 0.40 s tilt-up follows the copies into S08 (wires
// at screen 896 / 928 / 960, the sun arriving at (640, 1021) with S08's slide speed, the copies at S08's first-frame pegs
// and on-screen speeds). Label L7 on the board's bottom rail.
// Beat table: scene07/beats.ts. Parts: scene07/parts.tsx. No shims.
// Isolated preview entry: scene07/entry.tsx. Notes: docs/scenes/S07.md.

import React from 'react';
import {World, Sun, XG, mat, palette, useTime, ease as E, Pt} from '../lib';
import {NoticeboardCorner, NOTICE_CORNER} from './shared/sets';
import type {LayerWrap} from './shared/sets';
import {EdgeOnlooker, FixSign, HoursClock, LabelTag, LeakSheet} from './shared/props';
import {useBeats} from './scene07/beats';
import {BoardClones, camAt, camMat, CLONE, CloneSpot, cruiseFor, FarRoofDetails, Flyer, InkReveal, PaneGlass, PhoneCopy, Pigeon, PinDot, PipS07, PUSHED, RevealPass, RiseFromLow, SpinWedge, WallDetails, WireCopy, WireCopySpec} from './scene07/parts';

// ---------------------------------------------------------------- layout (world px at camera rest)

/** The notice on the left pane (pane 1 = x 153-436, y 943-1347). */
const NOTICE = {x: 295, y: 1140, w: 210, h: 270, rot: -2};
/** Its pin: the top centre of the rotated sheet. */
const PIN: Pt = [NOTICE.x + 118.8 * Math.sin((NOTICE.rot * Math.PI) / 180), NOTICE.y - 118.8 * Math.cos((NOTICE.rot * Math.PI) / 180)];

const S7_READERS = NOTICE_CORNER.readers;
/** The right-hand readers' heads, nudged left of the set slots so both heads are in frame after the push (the set's
 *  (1010, 1260) head was cropped off at screen x ~1100). Fix round 1: reader 2 (sage, cap) moved up-left so reader 3's
 *  raised phone arm passes right of its cap instead of across it. */
const RIGHT_HEADS: Pt[] = [
  [835, 1255],
  [944, 1236],
];
/** Reader 3 (brown coat): the set's 'long' hair read as a featureless tan dome on a flat slab from behind; a dark bun +
 *  a collar band give it a back of the head and a shoulder line like the left readers. */
const READER3 = {hair: 'bun' as const, hairColor: palette.ink, acc: ['collar' as const]};
/** The left readers wait low in the frame from the cut (heads at y ~1740 / 1765) and rise the rest of the way on 'out'. */
const LOW = [1740 - S7_READERS[0].head[1], 1765 - S7_READERS[1].head[1]];
/** On 'fix' the sun lifts so the clock's hub clears the far roofline (sun top at screen ~610, under the 570 caption
 *  floor). */
const CLOCK_LIFT = 100;
/** The sun's screen y on the cut (S08's match: (640, 1021) r110, half behind the wall top) and its speed there: S08 keeps
 *  sliding it down 6 px in 0.12 s out(cubic) (Scene08.tsx SUN_MOVES[0]) = 150 px/s on its first frame. */
const SUN_CUT_Y = 1021;
const SUN_CUT_V = 150;
/** The sun's way down to the cut: from the clock's lift (screen y 720) to SUN_CUT_Y over SUN_RET s, a cubic Hermite that
 *  starts at rest and ends at SUN_CUT_V: peak ~24 px / frame (the camera's own exit speed), no stop-start at the cut. */
const SUN_RET = 0.6;
const sunReturnEase = (() => {
  const m1 = (SUN_CUT_V * SUN_RET) / (SUN_CUT_Y - (820 - CLOCK_LIFT));
  return (u: number) => (m1 - 2) * u * u * u + (3 - m1) * u * u;
})();
/** Screen x of S08's pegged copies on its first frame (src/scenes/Scene08.tsx COPIES / BIT_COPY x0 at its crane start
 *  (540, 1260) zoom 1.3: screen = 540 + (x0 - 540) x 1.3) and their slide (v0 + the residual drift vr, S08 world px/s
 *  at zoom 1.3): S07's copies end exactly there, at exactly that screen speed. If S08 moves or retimes its copies,
 *  update these. */
const S08_COPIES = {w0: {x0: 128, v0: 298, vr: 20, seed: 's8/cp0'}, w2: {x0: 262, v0: 215, vr: 20, seed: 's8/cp1'}, w1: {x0: 392, v0: 95, vr: 12, seed: 's8/cp2'}, bit: {x0: 478, v0: 166, vr: 6, seed: 's8/cp3'}};
const cutSx = (c: {x0: number}) => 540 + (c.x0 - 540) * 1.3;
/** Rate of S08's crane zoom on its first frame (1 / s). S08's crane zoom now runs on its own track, 1.3 -> 1.0 inOutSine
 *  in log space (Scene08.tsx craneZoom): it starts at ZERO rate, so on the cut the frame moves as one. (With the old
 *  out(quart) zoom this was -0.6 / s and the zoom-out pulled every copy right: the review's 'copies brake on the cut'.)
 *  If S08 changes the crane zoom's start rate, put it here. */
const S08_DZ = 0;
/** S07 world speed (leftwards) that equals S08's ON-SCREEN speed of a copy on its first frame: its slide (copyX'(0) =
 *  v0 + vr, S08 world px/s at zoom 1.3; fix round 1 adds the residual drift vr) minus any zoom-out pull (screen x =
 *  540 + (x - 540) z: d/dt = -(v0 + vr) z + (x0 - 540) dz/dt). w0 / bit / w2 / w1 = 390 / 211 / 288 / 131 S07 px/s. */
const cutV = (c: {x0: number; v0: number; vr: number}) => ((c.v0 + c.vr) * 1.3 - (c.x0 - 540) * S08_DZ) / PUSHED.z;
/** World x (S07) of a screen x on the last frame (camera (480, 764) zoom 1.06). */
const cutWorldX = (sx: number) => PUSHED.x + (sx - 540) / PUSHED.z;
/** The phone that shows the leak: reader 2's (sage, cap), over the board's right frame edge, clear of the notice
 *  (fix round 1: reader 1's phone + its ring piled up on the notice's lock sketch and ringed Bit doodle). World, measured
 *  on the render at t 1.6 (raised and settled from 1.42). */
const PHONE: Pt = [728, 1156];
/** J4 'still fixing...' (props FixSign, fs 26 = 27.6 px lettering on screen): hung from a nail on the blind's top-left so
 *  the card hangs over the shop window's top-left corner, above the round elephant sign and left of the right rail after
 *  the push (card right edge ~ screen 975). Drawn after the set (not in the blind slot: the window frame would cross
 *  the part of the card left of the blind). */
const J4 = {x: 822, y: 958, fs: 26};

const Scene07: React.FC = () => {
  const t = useTime();
  const B = useBeats();
  const cam = camAt(t, B);
  const M = camMat(cam);

  // ---- the hours clock on the sun (pops on 'fix' (word - 0.04), pops off as the tilt starts). One minute-hand turn in
  //      0.42 s (<= 45 deg a frame at the inOut(sine) peak, a peach speed wedge trailing the hand while it is fast) and
  //      ONE hour-hand tick with it: an hour passes, the fix is not ready (fix round 1: 3 ticks against 1 turn).
  const CLK = {at: B.fix, spinAt: B.fix + 0.02, spinDur: 0.42, turns: 1, outAt: B.tilt - 0.08};

  // ---- the sun: screen space (the push does not move it). It lifts on 'fix' so the clock face clears the roofline, then
  //      comes down to S08's (640, 1021) over the last 0.6 s (Hermite: from rest, arriving at S08's slide speed).
  const sun = (
    <XG m={mat.inv(M)}>
      <Sun
        cx={420}
        cy={985}
        r={110}
        drift={[0, 0]}
        hops={[{t: B.before - 1.0, to: [640, 820], h: 74, air: 1.0}]}
        moves={[
          {at: B.fix + 0.01, dur: 0.26, y: 820 - CLOCK_LIFT, ease: E.outBack(1.4)},
          {at: B.end - SUN_RET, dur: SUN_RET, y: SUN_CUT_Y, ease: sunReturnEase},
        ]}
      >
        {(r) => (
          <>
            <SpinWedge r={r} at={CLK.at} spinAt={CLK.spinAt} spinDur={CLK.spinDur} turns={CLK.turns} outAt={CLK.outAt} />
            <HoursClock r={r} at={CLK.at} spinAt={CLK.spinAt} spinDur={CLK.spinDur} turns={CLK.turns} hourSteps={1} outAt={CLK.outAt} seed="s7clock" />
          </>
        )}
      </Sun>
    </XG>
  );

  // ---- clones 2 -> 4 -> 8 on pane 2 and the wall (never on the notice's lock sketch), in GROUPS on the beat: 2 just
  //      before 'got', 2 more on 'out', 4 more 0.16 s later (two frames). Four of them hand a copy up to the wires: the
  //      copy peels off its clone (same place, size and tilt) and the clone STAYS, so 8 are on the board through 'before'.
  const lift = {A: B.before - 0.2, Bit: B.before - 0.14, C: B.before - 0.08, D: B.before - 0.02};
  const g1 = B.got - 0.08;
  const g3 = B.out + 0.16;
  const SRC = {
    C: {x: 530, y: 1032, at: g1, rot: -6, s: 0.8, liftAt: lift.C},
    A: {x: 78, y: 1004, at: g1, rot: 6, s: 0.62, liftAt: lift.A},
    Bit: {x: 628, y: 1214, at: B.out, rot: 5, s: 0.75, liftAt: lift.Bit},
    D: {x: 548, y: 1252, at: g3, rot: -4, s: 0.9, liftAt: lift.D},
  };
  const clones: CloneSpot[] = [
    SRC.C,
    SRC.A,
    {x: 655, y: 1048, at: B.out, rot: 4, s: 0.7}, // the flyer shoots off this one
    SRC.Bit,
    SRC.D,
    {x: 592, y: 1130, at: g3, rot: -3, s: 0.6},
    {x: 690, y: 1296, at: g3 + 1 / 30, rot: 7, s: 0.5},
    {x: 172, y: 1304, at: g3 + 1 / 30, rot: -6, s: 0.5},
  ];
  // the board keeps every clone (no liftAt: the copies are duplicates peeling off)
  const boardClones: CloneSpot[] = clones.map(({liftAt: _l, ...c}) => c);

  // ---- copies peg onto the wires on 'before', fanned out left of the sun (x 200 / 446 / 290 / 370), and travel left
  //      over the rooftops, slowest nearest the sun: no copy ever covers the clock (ring left edge ~ world 489). On the
  //      tilt a gust ramps each to S08's ON-SCREEN hand-over speed (cutV), ending exactly at S08's first-frame pegs.
  const RAMP = B.end - B.tilt;
  const spec = (src: CloneSpot, wire: 0 | 1 | 2, x: number, pegAt: number, s8: (typeof S08_COPIES)['w0'], seed: string, extra: Partial<WireCopySpec> = {}): WireCopySpec => ({
    from: [src.x, src.y],
    fromS: (src.s * CLONE.w) / 210,
    fromRot: src.rot,
    liftAt: src.liftAt!,
    wire,
    x,
    pegAt,
    vc: cruiseFor(x, pegAt, cutWorldX(cutSx(s8)), cutV(s8), B.end, RAMP),
    vEnd: cutV(s8),
    rampAt: B.tilt,
    rampDur: RAMP,
    leanTo: {seed: s8.seed, t0: B.end},
    seed,
    ...extra,
  });
  const copies: WireCopySpec[] = [
    spec(SRC.A, 0, 200, B.before, S08_COPIES.w0, 's7wc0'),
    spec(SRC.Bit, 1, 446, B.before + 0.06, S08_COPIES.bit, 's7wc1', {bit: true, bitHopAt: B.was + 0.02}),
    spec(SRC.C, 2, 290, B.before + 0.12, S08_COPIES.w2, 's7wc2'),
    spec(SRC.D, 1, 370, B.before + 0.18, S08_COPIES.w1, 's7wc3'),
  ];

  // far roof details go into the set's roofs layer (behind the wall); quiet details on the left wall field
  const wrap: LayerWrap = (name, _z, node) =>
    name === 'roofs' ? (
      <>
        {node}
        <FarRoofDetails />
      </>
    ) : name === 'wall' ? (
      <>
        {node}
        <WallDetails />
      </>
    ) : (
      node
    );

  const set = (_pass: RevealPass) => (
    <>
      <NoticeboardCorner
        sun={sun}
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
      {/* J4: the makers' blind is still down: 'still fixing...' (props FixSign: the one sign of J3 / J4 / J5). Hung from a
          nail on the blind's top-left, drawn after the set so the window frame and the round sign's bracket stay behind it */}
      <FixSign x={J4.x} y={J4.y} fs={J4.fs} swingAt={[B.fix]} seed="s7J4" />
      {/* pigeons on the wires: they hop as copies peg below them (x 384 / 330 = S08's WIRE_PIGEONS, scene08/cast.tsx: they
          carry over the cut on the same screen spot); one flaps up on 'was' as the first copy reaches it */}
      <Pigeon wire={0} x={384} hopAt={[B.before + 0.18]} seed="s7pg0" />
      <Pigeon wire={0} x={330} hopAt={[B.before + 0.12]} flip color={palette.sand} seed="s7pg1" />
      <Pigeon wire={0} x={70} flyAt={B.was - 0.02} flyTo={[-240, -150]} seed="s7pg2" />
    </>
  );

  // readers at the frame sides: the left two wait low from the cut and rise on 'out', the right two pop up on 'the';
  // four phones go up. arms 'near': the phone arm is the only arm drawn (no hand left floating at the hip).
  const reader = (i: number) => {
    const r = S7_READERS[i];
    const head = i < 2 ? r.head : RIGHT_HEADS[i - 2];
    const look = i === 3 ? READER3 : {hair: r.hair, hairColor: undefined, acc: r.acc};
    return (
      <EdgeOnlooker
        key={i}
        x={head[0]}
        y={head[1]}
        head={82}
        hair={look.hair}
        hairColor={look.hairColor}
        body={r.body}
        acc={[...look.acc]}
        riseAt={i < 2 ? undefined : B.the - 0.06 + (i - 2) * 0.06}
        raisePhoneAt={[B.the, B.the + 0.15, B.the + 0.05, B.the + 0.2][i]}
        arms="near"
        rim={i < 2 ? 'left' : 'right'}
        seed={`nc/rd${i}`}
      />
    );
  };
  // fill-first reveal: the linework draws on top -> bottom (ground marks included). The low left readers are NOT in it:
  // they are the foreground from the cut, fully drawn (in the film the paint edge's bare corner keeps their ink).
  const REVEAL = {at: B.cut + 0.05, dur: 0.48, y0: 560, y1: 1900};

  return (
    <World sky={[{t: 0, tod: 'golden'}]}>
      <XG m={M}>
        <InkReveal {...REVEAL} render={set} />

        {/* the board: the notice (after the lens wipe lands), its pin, the clones */}
        {t >= B.pinPip + 0.06 ? <LeakSheet x={NOTICE.x} y={NOTICE.y} w={NOTICE.w} h={NOTICE.h} rot={NOTICE.rot} pin={false} depth="mid" seed="s7notice" /> : null}
        <PinDot x={PIN[0]} y={PIN[1]} at={B.pinPip + 0.06} />
        <BoardClones spots={boardClones} seed="s7clone" />

        {/* copies travel left along the wires (Bit rides one) */}
        {copies.map((c) => (
          <WireCopy key={c.seed} c={c} />
        ))}

        {/* L7 on the board's bottom rail */}
        <LabelTag kind="card" box={[300, 1338, 640, 1436]} text={['word leaked Oct 20 ·', 'fix out Oct 21']} fontSize={36} swing at={B.label} seed="s7L7" />

        {/* Pip on the board top + the flyer gag */}
        <PipS07 B={B} />
        <Flyer B={B} from={[655, 1048]} />

        {[0, 1].map((i) => (
          <RiseFromLow key={i} at={B.out + i * 0.06} low={LOW[i]}>
            {reader(i)}
          </RiseFromLow>
        ))}
        {/* the right pair far -> near: reader 3 (brown, head higher) behind reader 2, so its phone arm passes behind
            reader 2's cap instead of across it */}
        {[3, 2].map((i) => reader(i))}
        <PhoneCopy x={PHONE[0]} y={PHONE[1]} at={B.was - 0.1} ringAt={B.was - 0.06} rot={-3} ringR={39} />

        {/* the lens wipe: the printed sheet at the lens shrinks into the notice (on top of everything until it lands) */}
        {t < B.pinPip + 0.06 ? (
          <LeakSheet x={NOTICE.x} y={NOTICE.y} w={NOTICE.w} h={NOTICE.h} rot={NOTICE.rot} pin={false} depth="mid" lensWipe={{at: B.pinPip + 0.06 - 0.433, from: [-260, 1250], fromS: 1.6, peak: 8, focus: [540, 960]}} seed="s7notice" />
        ) : null}
      </XG>
    </World>
  );
};

export default Scene07;
