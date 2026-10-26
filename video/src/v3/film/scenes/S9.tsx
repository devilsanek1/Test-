// S9 (19.40-22.68, "And so do AI data centers. By the mountain."): SCALE 2/2, the film's ONE big move, the S5
// PULL-BACK CRANE REVEAL (docs/look/CINEMATIC_GUIDE.md S5, the owner's favourite; spec docs/v3/proposal_pullback.md;
// locked board public/v3/animatic.json "S9", built by scripts/v3/build_proposal_pullback.py, whose plane maps and
// boxes this set uses exactly).
//
// START (cut from S8's extreme close of the gold stick: a match on the object): YOU from behind, 3/4, head turned
// right (hair and ear, no face), cut at the hips, raising your ONE memory stick (S8's stick, 330 px, chips readable)
// on OUR roof at blue hour; the warm brick stack stands where the data center will land, our vent is cut by the left
// edge, and the only view out is the cool bright slot of the far hill town, where sticks rise and streak off right.
// MOVE (19.40-21.98, 155 f at 60 fps, then a 42 f hold to the cut on "They"): pull back + crane up + a pinned truck on
// the S5 ease cubic-bezier(0.55, 0.03, 0.50, 1.0); real multiplane parallax, one progress p for every plane:
//   sky locked (World) | FAR x1.11 -> 1 sliding 1 W from the right, horizon held (hill town, hall, mountain, streams)
//   | MID x2 -> 1 from 920 right / 300 up (snowy roofs, the lit street, the town's stacks) | the brick stack and our
//   vent box to box (near clutter) | DECK x5 -> 1 pinned on (480, 1430) (parapet, planks, you: the pivot).
// The chimney pot crosses the lens at the move's peak (90 px/f, a flat soft mass over you for 11 f) and hides the
// hand-over from your back view to tiny you (1.333 s); its trailing edge is the light burst (the pale band, the hall
// and its lit sign, sticks pouring in from the town's roofs). The mountain of gold sticks swings in over the right
// roofline from ~21.10 and lands on "mountain" (21.72, p 0.985), bigger than the hall.
// END (hold): tiny you (184 px) at our parapet, back to us, your one stick up; the planks and the lit street lead
// from you to the dark AI DATA CENTER; the mountain on the right third (top y >= 620); white captions on plain sky.
// Speeds at 60 fps: far 14.5, mid <= ~21, stack <= ~20 px/f (detailed layers <= 25); only the pot goes faster.
import React, {useId} from 'react';
import {World, ShotCam, Fill, useTime, type ToneKey} from '../../../lib';
import {Layer} from '../../../lib/cine/camera';
import {rng} from '../../../lib/rng';
import {
  EMBER,
  FILM_TOD,
  DataCenter,
  TownBand,
  Snowfall,
  StickFlight,
  Pile,
  YouBack,
  YouTiny,
  MemoryStick,
  RoofLedge,
  RoofVent,
  BrickStack,
  ChimneyPot,
  MidTown,
  RoofDeck,
  PullLayer,
  planeMat,
  boxMat,
  startMat,
  s5Ease,
  type HouseSpec,
  type PullPlane,
  type PullBox,
  type StickFlightOpts,
  type Pt,
} from '../kit';

// ---- timing (scene seconds; VO "And" 0.00, "AI" 0.56, "data" 0.96, "centers." 1.20, "By" 1.92, "mountain." 2.32)
export const S9_DUR = 22.68 - 19.4;
export const S9_MOVE = 155 / 60; // 19.40-21.98, then the hold
/** The hand-over from your back view to tiny you, behind the pot (it covers both 1.276-1.437). */
const SWAP = 1.333;
/** The move's progress at scene time t. */
export const s9p = (t: number) => s5Ease(t / S9_MOVE);

// ---- the planes (end-frame coordinates; the board's numbers)
export const S9_FAR: PullPlane = {o: [540, 880], off: [1080, 0], k: 1.11};
export const S9_MID: PullPlane = {o: [480, 1000], off: [920, -300], k: 2};
export const S9_DECK: PullPlane = {o: [480, 1430], k: 5};
/** The brick stack: from where the hall will land (600, 640; 1100 wide) to the left frame (-90, 980; 340 wide). */
export const S9_STACK: PullBox = {from: [600, 640], to: [-90, 980], s0: 1100 / 340};
/** Our vent: cut by the left edge (-260, 780; 500 wide) to the bottom-left (0, 1600; 150 wide). */
export const S9_VENT: PullBox = {from: [-260, 780], to: [0, 1600], s0: 1 / 0.3};

// ---- the far plane: the pale band, the hill town (the slot's view), the hall, the mountain, the streams
const BAND_TOP = 790;
const HALL = {x: 450, y: 1030, w: 340, h: 180};
const HALL_ROOF = HALL.y - HALL.h;
/** The far ground's top: the hill on the left (houses step down it), level at the hall's base. */
const groundTop = (x: number) => (x <= -300 ? 896 : x >= 150 ? HALL.y : 896 + ((x + 300) / 450) * (HALL.y - 896));
/** Far houses: two rows on the hill, a row at the hall's foot (lower: nearer, so the whole hall shows), a row in front
 *  of the mountain's foot. ~34 px wide (the ruler), fill only (far plane: no ink). */
const FAR_HOUSES: HouseSpec[] = (() => {
  const r = rng('s9/farTown');
  const out: HouseSpec[] = [];
  const row = (x0: number, x1: number, ground: (x: number) => number, w0: number) => {
    for (let x = x0; x < x1; ) {
      const w = w0 * r.range(0.85, 1.15);
      out.push({x, w, y: ground(x + w / 2), lit: r.chance(0.72), chimney: r.chance(0.5)});
      x += w + w0 * r.range(0.05, 0.35);
    }
  };
  row(-1900, -330, () => 884, 32); // hill crest, back row
  row(-1880, 170, (x) => groundTop(x) + 22, 36); // the hill's face down to the hall
  row(170, 660, () => 1078, 40); // at the hall's foot
  row(640, 1500, () => 1050, 40); // in front of the mountain's foot
  return out;
})();
/** The roof peak over a far-town point (where a stick rises from). */
const peakAt = (x: number) => {
  const h = FAR_HOUSES.find((hs) => x >= hs.x && x <= hs.x + hs.w) ?? FAR_HOUSES.reduce((a, c) => (Math.abs(c.x + c.w / 2 - x) < Math.abs(a.x + a.w / 2 - x) ? c : a));
  return (h.y ?? 0) - h.w * 0.62 - h.w * 0.42;
};
/** The streams: a stick every 0.1 s, cycling over the town's roofs (the hill far left: long flights that streak off
 *  right behind the stack before the reveal; the hall's foot and the mountain's front: short hops), each diving into
 *  the hall's roof between its units. Deterministic list (far-plane coords). */
const STREAMS: StickFlightOpts[] = (() => {
  const r = rng('s9/streams');
  const out: StickFlightOpts[] = [];
  let i = 0;
  for (let t0 = -1.5; t0 < S9_DUR; t0 += 0.1, i++) {
    // most come from the left (the hill and the houses by our stack): over the pale band they read; over the gold
    // mountain they would vanish
    const kind = i % 4;
    const sx = kind === 0 ? r.range(-860, -420) : kind === 1 ? r.range(40, 230) : kind === 2 ? r.range(-260, -40) : r.range(660, 720);
    const long = kind === 0;
    const to: Pt = [r.range(HALL.x - 120, HALL.x + 120), HALL_ROOF + 16];
    const dur = long ? r.range(1.2, 1.4) : kind === 2 ? r.range(0.8, 0.95) : r.range(0.6, 0.75);
    out.push({from: [sx, peakAt(sx) + 10], to, t0, t1: t0 + dur, arc: long ? r.range(170, 220) : r.range(150, 190), w0: 50, w1: 40, rot0: r.range(-25, 25), rot1: r.range(-40, 40), end: 'shrink'});
  }
  return out;
})();

const FarPlane: React.FC = () => (
  <>
    {/* the pale band toward the horizon (one flat step lighter than the sky: the burst behind the hall) */}
    <Fill rect={[-2000, BAND_TOP, 4000, 400]} color={EMBER.skyLow} offset={false} />
    {/* the mountain of memory sticks: gold sticks with black chips (the kit Pile, ~62 px sticks), past the right edge */}
    <Pile x={840} y={HALL.y} w={840} h={372} stickW={62} ink={2.2} seed="s9/pile" />
    {/* the streams (behind the hall: each stick sinks behind its parapet, into the roof) */}
    {STREAMS.map((o, i) => (
      <StickFlight key={i} {...o} seed={`s9/st${i}`} ink={2} />
    ))}
    {/* the AI data center: the dark body, its sign lit (ink letters on cold light) */}
    <DataCenter x={HALL.x} y={HALL.y} w={HALL.w} h={HALL.h} variant="dark" signLitAt={0} signH={52} ink={2.6} seed="s9/dc" />
    {/* the far ground: the hill on the left, level at the hall's base */}
    <Fill d={`M-2000 1500L-2000 ${groundTop(-2000)}L-300 ${groundTop(-300)}L150 ${HALL.y}L2000 ${HALL.y}L2000 1500Z`} color={EMBER.frost} offset={false} />
    <TownBand y={1078} houses={FAR_HOUSES} far seed="s9/far" />
  </>
);

// ---- the mid plane: snowy roofs with chimneys and lit windows, the lit street from our parapet to the hall's foot
const STREET = {yB: 1440, yT: 1104, xBL: 402, xBR: 578, xTL: 452, xTR: 470};
const MidPlane: React.FC = () => (
  <MidTown
    x0={-320}
    x1={1160}
    rows={[
      {y: 1150, w: 62},
      {y: 1252, w: 86},
      {y: 1362, w: 112},
    ]}
    street={STREET}
    lamps={5}
    exact
    seed="s9/mid"
  />
);

// ---- the deck plane (OUR roof): planks converging on you, the parapet, tiny you
const YOU_FEET: Pt = [490, 1490];
const DeckPlane: React.FC<{tiny: boolean}> = ({tiny}) => (
  <>
    <RoofDeck y={1446} x0={-500} x1={1580} h={520} vp={[470, 1010]} planks={13} exact seed="s9/deck" />
    <RoofLedge y={1398} x0={-500} x1={1580} h={34} lipH={16} ventX={null} bricks={14} exact ink={3.4} seed="s9/ledge" />
    {tiny ? <YouTiny x={YOU_FEET[0]} y={YOU_FEET[1]} h={184} stickW={56} ink={2.6} seed="s9/youT" /> : null}
  </>
);

// ---- you, close (START coords, the deck plane's start map): back view, raising the one stick (S8's stick)
const YouClose: React.FC = () => (
  <YouBack x={470} y={1058} head={184} hand={[748, 1214]} seed="s9/youB">
    <MemoryStick x={748} y={1172} w={330} rot={-6} seed="s9/stick" />
  </YouBack>
);

// ---- the chimney pot: its own crossing at the move's peak (the board's: 90 px/f, left edge -2010 at 1.00 s)
const POT = {t0: 1.0, t1: 1.62, x0: -2010, v: 90 * 60, y: 700, w: 1200};

const S9: React.FC = () => {
  const t = useTime();
  const p = s9p(t);
  const clipId = 's9snow' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const potX = POT.x0 + POT.v * (t - POT.t0);
  return (
    <World stage="context" sky={[{t: 0, tod: FILM_TOD, color: EMBER.sky}]}>
      <ShotCam>
        <Layer depth={0}>
          <PullLayer m={planeMat(S9_FAR, p)}>
            <FarPlane />
          </PullLayer>
          <PullLayer m={planeMat(S9_MID, p)}>
            <MidPlane />
          </PullLayer>
          {/* falling snow in the mid plane, kept under the caption band (screen y >= 625) */}
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <rect x={-10} y={625} width={1100} height={1310} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <PullLayer m={planeMat(S9_MID, p)}>
              <Snowfall x={-300} y={420} w={1440} h={1100} n={46} seed="s9/snow" />
            </PullLayer>
          </g>
          {/* the brick stack: where the hall will land, then the left frame (pots offscreen until late) */}
          <PullLayer m={boxMat(S9_STACK, p)}>
            <BrickStack x={-76} y={980} w={326} h={480} pots={[0.8, 0.93]} potW={33} exact seed="s9/stack" />
          </PullLayer>
          <PullLayer m={planeMat(S9_DECK, p)}>
            <DeckPlane tiny={t >= SWAP} />
          </PullLayer>
          {/* our vent (near clutter, on the deck) */}
          <PullLayer m={boxMat(S9_VENT, p)}>
            <RoofVent x={75} y={1964} w={100} h={330} exact seed="s9/vent" />
          </PullLayer>
          {t < SWAP ? (
            <PullLayer m={startMat(S9_DECK, p)}>
              <YouClose />
            </PullLayer>
          ) : null}
          {t >= POT.t0 && t < POT.t1 ? <ChimneyPot x={potX} y={POT.y} w={POT.w} seed="s9/pot" /> : null}
        </Layer>
      </ShotCam>
    </World>
  );
};
export default S9;

/** White captions on the dusk-blue sky (5.3:1); the caption band stays plain sky for the whole move. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'light'}];
