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
//
// G5b (density + scale, docs/v3/s9_scale_plan.md, CINEMATIC_GUIDE "Scale cues"): the end frame becomes vast and alive
// around the locked move. Planes back to front: the corner cloud and the hero cloud bank on its glow strip, the mountain
// as a PEAK (summit (760, 626)), pylons, hall B with its plume, the streams, the hall (fan run, LED grid, sign lit), the
// infinity line with a second data center, the hill town (the start slot, kept) and the far field (S9_far.tsx,
// S9_peak.tsx) | S9_FAR2: the mid band of small roofs climbing to the mountain | S9_MID: the near-mid houses (five types)
// cut by THE DROP, a canyon street to the hall with lamps, walkers and a car (S9_town.tsx) | S9_NEAR (new, hidden
// behind the start parapet): the terrace with dormers and a shoveller, the lit canyon slot behind your head, the mansard
// with its skylight ridge (S9_near.tsx) | the stack (in shade) | DECK: a warm lived-in corner in shade, the stair hut
// with its door ajar, chair, table and mug, fairy lights, footprints, PipTiny beside you (S9_deck.tsx) | the near
// flakes and, in the hold, a V of birds in a size ladder (S9_sky.tsx). Pip rides your shoulder at the start and moves
// to the lip behind the pot's wipe; the thoom on "mountain" (2.32) shakes snow off the roofs and makes Pip hop.
import React, {useId} from 'react';
import {World, ShotCam, useTime, type ToneKey} from '../../../lib';
import {Layer} from '../../../lib/cine/camera';
import {Ink} from '../../../lib/Ink';
import {rng} from '../../../lib/rng';
import {
  EMBER,
  FILM_TOD,
  Snowfall,
  SnowLayers,
  StickFlight,
  YouBack,
  MemoryStick,
  RoofVent,
  BrickStack,
  ChimneyPot,
  PullLayer,
  Pip3,
  planeMat,
  boxMat,
  startMat,
  s5Ease,
  type PullPlane,
  type PullBox,
  type StickFlightOpts,
  type Pt,
} from '../kit';
import {CornerCloud, HighClouds, CloudBank, FarGround, HillTown, FarField, InfinityLine, Pylons, HallB, HallPlume, HallFans, Hall, ThoomPuffs, FAR_HOUSES, HALL, HALL_ROOF, farRoofTop} from './S9_far';
import {PeakPile} from './S9_peak';
import {MidBand, NearMid} from './S9_town';
import {NearRoofs, NEAR_PUFFS} from './S9_near';
import {DeckPlane, PARAPET, StackDress, VentDress} from './S9_deck';
import {S9Birds, NearFlakes} from './S9_sky';
import {T9} from './S9_tones';

// ---- timing (scene seconds; VO "And" 0.00, "AI" 0.56, "data" 0.96, "centers." 1.20, "By" 1.92, "mountain." 2.32)
export const S9_DUR = 22.68 - 19.4;
export const S9_MOVE = 155 / 60; // 19.40-21.98, then the hold
/** The hand-over from your back view to tiny you, behind the pot (it covers both 1.276-1.437). */
const SWAP = 1.333;
/** "mountain.": the thoom (snow off the roofs, Pip hops). */
const THOOM = 2.32;
/** The move's progress at scene time t. */
export const s9p = (t: number) => s5Ease(t / S9_MOVE);

// ---- the planes (end-frame coordinates; the board's numbers, plus the G5b scale plan's two new planes)
export const S9_FAR: PullPlane = {o: [540, 880], off: [1080, 0], k: 1.11};
/** The mid band (22-34 px roofs): between the far field and the mid houses. */
export const S9_FAR2: PullPlane = {o: [500, 960], off: [1040, -120], k: 1.4};
export const S9_MID: PullPlane = {o: [480, 1000], off: [920, -300], k: 2};
/** The near roofs: hidden behind the start parapet, rising as it drops (peak 24 px/f). */
export const S9_NEAR: PullPlane = {o: [480, 1250], off: [560, 60], k: 3};
export const S9_DECK: PullPlane = {o: [480, 1430], k: 5};
/** The brick stack: from where the hall will land (600, 640; 1100 wide) to the left frame (-90, 980; 340 wide). */
export const S9_STACK: PullBox = {from: [600, 640], to: [-90, 980], s0: 1100 / 340};
/** Our vent: cut by the left edge (-260, 780; 500 wide) to the bottom-left (0, 1600; 150 wide). */
export const S9_VENT: PullBox = {from: [-260, 780], to: [0, 1600], s0: 1 / 0.3};

// ---- the streams: a stick every 0.1 s from the town's roofs into the hall's roof (far-plane coords)
/** The roof peak over a far-town point (where a stick rises from): the hill houses, else the far field. */
const peakAt = (x: number) => {
  if (x > -150) return farRoofTop(x);
  const h = FAR_HOUSES.find((hs) => x >= hs.x && x <= hs.x + hs.w) ?? FAR_HOUSES.reduce((a, c) => (Math.abs(c.x + c.w / 2 - x) < Math.abs(a.x + a.w / 2 - x) ? c : a));
  return (h.y ?? 0) - h.w * 0.62 - h.w * 0.42;
};
const STREAMS: StickFlightOpts[] = (() => {
  const r = rng('s9/streams');
  const out: StickFlightOpts[] = [];
  let i = 0;
  for (let t0 = -1.5; t0 < S9_DUR; t0 += 0.1, i++) {
    // most come from the left (the hill, then the far field left of the hall): over the pale bank they read; over the
    // gold mountain they would vanish
    const kind = i % 4;
    const sx = kind === 0 ? r.range(-860, -420) : kind === 1 ? r.range(40, 230) : kind === 2 ? r.range(-260, -40) : r.range(-120, 120);
    const long = kind === 0;
    const to: Pt = [r.range(HALL.x - 120, HALL.x + 120), HALL_ROOF + 16];
    const dur = long ? r.range(1.2, 1.4) : kind === 2 ? r.range(0.8, 0.95) : r.range(0.6, 0.75);
    out.push({from: [sx, peakAt(sx) + 10], to, t0, t1: t0 + dur, arc: long ? r.range(170, 220) : r.range(150, 190), w0: 60, w1: 50, rot0: r.range(-25, 25), rot1: r.range(-40, 40), end: 'shrink'});
  }
  return out;
})();

const FarPlane: React.FC = () => (
  <>
    <CornerCloud />
    <HighClouds />
    <CloudBank />
    <FarGround />
    <PeakPile />
    <Pylons />
    <HallB />
    <HallPlume />
    {/* the streams (behind the hall: each stick sinks behind its parapet, between the fans). No trail ticks and ~the
        held stick's size: with two dark ticks behind them the small sticks read as birds or drones (v3 cold read). */}
    {STREAMS.map((o, i) => (
      <StickFlight key={i} {...o} seed={`s9/st${i}`} ink={2} trail={false} />
    ))}
    <HallFans />
    <Hall />
    <InfinityLine />
    <HillTown />
    <FarField />
  </>
);

// ---- you, close (START coords, the deck plane's start map): back view, raising the one stick (S8's stick), Pip on
// your left shoulder looking where you look (it moves to the lip behind the pot's wipe)
/** Tone-on-tone folds and raglan seams on the sweater (the close back never stays one flat fill; LIFE_AND_DENSITY §4
 *  coatDetail), breathing with YouBack. Start coords (head 184 at (470, 1058)). */
const SWEATER_FOLDS =
  'M414 1270C380 1300 330 1330 298 1360M528 1266C568 1290 604 1316 628 1340' +
  'M560 1424C590 1396 616 1366 640 1336M520 1508C560 1470 600 1430 632 1396M486 1590C530 1550 580 1500 624 1462' +
  'M322 1452C316 1540 316 1630 310 1720M352 1560C350 1620 352 1680 348 1740M470 1330C472 1450 474 1580 478 1700';
const SweaterFolds: React.FC = () => {
  const t = useTime();
  return (
    <g transform={`translate(0 ${(Math.sin(t * 1.7) * 1.2).toFixed(2)})`}>
      <Ink d={SWEATER_FOLDS} width={2.6} color={EMBER.sweaterRib} />
    </g>
  );
};
const YouClose: React.FC = () => (
  <>
    <YouBack x={470} y={1058} head={184} hand={[748, 1214]} seed="s9/youB">
      <MemoryStick x={748} y={1172} w={330} rot={-6} seed="s9/stick" />
    </YouBack>
    <SweaterFolds />
    <Pip3 x={352} y={1276} scale={0.92} pose="sit-back" look={[{t: 0, v: 0.2}, {t: 0.7, v: 0.55}]} outdoor seed={9} />
  </>
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
          <PullLayer m={planeMat(S9_FAR2, p)}>
            <MidBand />
          </PullLayer>
          <PullLayer m={planeMat(S9_MID, p)}>
            <NearMid />
          </PullLayer>
          {/* falling snow: far (2-3 px, sparse) and mid, kept under the caption band (screen y >= 625) */}
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <rect x={-10} y={625} width={1100} height={1310} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <SnowLayers x={-40} y={600} w={1160} h={1360} layers={['far']} density={0.55} band={null} seed="s9/far" />
            <PullLayer m={planeMat(S9_MID, p)}>
              <Snowfall x={-300} y={420} w={1440} h={1100} n={46} seed="s9/snow" />
            </PullLayer>
          </g>
          <PullLayer m={planeMat(S9_NEAR, p)}>
            <NearRoofs />
            <ThoomPuffs at={THOOM} pts={NEAR_PUFFS} size={9} seed="near" />
          </PullLayer>
          {/* the brick stack (the shade side ~70 %): where the hall will land, then the left frame */}
          <PullLayer m={boxMat(S9_STACK, p)}>
            <BrickStack x={-76} y={980} w={326} h={480} pots={[0.8, 0.93]} potW={33} color={EMBER.brickShade} shade={T9.stackShade} exact seed="s9/stack" />
            <path d="M-72 1003h98v457h-98Z" fill={EMBER.brick} />
            <StackDress />
          </PullLayer>
          <PullLayer m={planeMat(S9_DECK, p)}>
            <DeckPlane tiny={t >= SWAP} thoom={THOOM} />
            <ThoomPuffs at={THOOM} pts={[[120, PARAPET.y], [300, PARAPET.y], [660, PARAPET.y], [860, 1176]]} size={11} seed="deck" />
          </PullLayer>
          {/* our vent (near clutter, on the deck) */}
          <PullLayer m={boxMat(S9_VENT, p)}>
            <RoofVent x={75} y={1964} w={100} h={330} exact seed="s9/vent" />
            <VentDress />
          </PullLayer>
          {t < SWAP ? (
            <PullLayer m={startMat(S9_DECK, p)}>
              <YouClose />
            </PullLayer>
          ) : null}
          <NearFlakes p={p} />
          {t >= POT.t0 && t < POT.t1 ? <ChimneyPot x={potX} y={POT.y} w={POT.w} seed="s9/pot" /> : null}
          <S9Birds at={1.85} />
        </Layer>
      </ShotCam>
    </World>
  );
};
export default S9;

/** White captions on the dusk-blue sky (5.3:1); the caption band stays plain sky for the whole move. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'light'}];
