// V2S8 "Her words" (lane L6). Film 32.93-39.08 s; TREATMENT.md sections 3-5 (row S8), 8 (fairness, Q9), map.ts S8;
// conform_L6.md (wins over the older handover) and RESUME_2026-10-28.md (depth, the sky, light, particles, the float).
// The LANE along her towpath, looking west at sunset: the cafe boat moored left with its quote-of-the-day A-board,
// her towpath running to the bend, her house at the bend facing down the lane (teal door, W above-right of it).
//   -0.23-0.23  S7's narrowboat wipes in (travelling west); Pip rides its stern deck in and leaps to the board bollard
//   0.23 "She": SHE SAYS pops on the board (clack); she walks home · 0.85 "can't": three ghosts pop ahead of her,
//   Pip's ears down · 1.57 she reaches her door · 1.82 it shuts, the ghosts stay · 2.02 W lights
//   2.06-2.67 ONE plain truck left (inside the pause; multiplane, V2S8_clock) · 2.79 "her words": the cafe owner
//   wipes the board clean in one stroke from its left side · 3.61 the quote pen-draws on · 4.35 / 4.75 / 4.95 the lamps
//   light in a run west down the lane (three switch-ons) · 4.77 "not": Pip looks up at W
//   2.82-5.67 the landing hold floats (a parallax float, home by 5.67) · 5.89-6.15 the engine un-builds S8 onto S1's
//   frame-0 state (the sun first, then the set, the ghosts and W last, the sky contracting into SUN0; Pip settles 30 px
//   onto S1's bollard and un-builds: S1's own Pip draws on from frame 0).
// TIERS (CRAFT §b, THROUGHLINE §4 S8): A her + the ghosts (her walk; the ghosts' pop, then B with their line), W
// (34.55-34.95 and from "not" to the end), her board (from the wipe 35.72); B Pip, the cafe owner, her door; C the lane,
// lamps, the cafe boat, canal, roofs, the sun, smoke, steam, walkers. LIGHT: <Lit rig={RIG_CANAL_S8}> (the low sun
// ahead: shadows toward us, backlit form; V2S8_light). DEPTH: V2S8_depth (planes, the air, the plane groups + float).
// Parts (each its own file): V2S8_clock (times, planes, bands, camera, float), V2S8_depth, V2S8_set (sky, far, south
// bank, water, the cafe boat, the lane's ground bands, the near band), V2S8_house (her house and the terrace at the
// bend, W, her door, lamps), V2S8_board (her board, its bollard, the cafe owner), V2S8_cast (her, the ghosts, the
// public), V2S8_pip (Pip), V2S8_light (shadows, rim, W's spill, the lamp pools), V2S8_exit (the un-build order).
import React, {useId} from 'react';
import {World} from '../../lib/World';
import {useExit} from '../../lib/exit';
import {Lit} from '../../lib/light';
import {CAPTION_BAND, Particles} from '../../lib/particles';
import type {ParticlesProps} from '../../lib/particles';
import {RIG_CANAL_S8} from '../world/rigs';
import {CM} from '../palette';
import * as MAP from '../world/map';
import {CanalCast} from '../kit/canal/slots';
import {k4Person} from '../kit/canal/k4k5';
import type {ToneKey} from '../../lib/Film';
import {S8Sky, S8Far, S8South, S8Water, S8Boat, S8Ground, S8Front} from './V2S8_set';
import {S8House, S8Window, S8DoorLeaf} from './V2S8_house';
import {S8Board} from './V2S8_board';
import {S8Her, S8GhostsLayer, S8Public} from './V2S8_cast';
import {S8Pip} from './V2S8_pip';
import {S8HouseBandLight, S8LaneLight, S8LaneShadows} from './V2S8_light';
import {L, S8T} from './V2S8_clock';
import type {PlaneId} from './V2S8_clock';
import {S8Plane, S8_ATM} from './V2S8_depth';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

/** THE PARTICLES, SEEN at phone size (CRAFT §f.6; the owner on v4 "I don't see any changes in the particles", on v5
 *  "leafs are great"; lib/particles' presets, never shrunk; conform_L6 §10; THROUGHLINE §5b S8 row), tier C, calm:
 *    leaves  the proven particle: three 34-40 px palmate plane leaves blown in from off the right edge on a light
 *            easterly (born 35.70, 36.35, 37.00: the landing hold), fluttering and turning leftward across the lane's open mid ground,
 *            the towpath in front of her house, below the ghosts' feet and Pip's bollard, settling on the near paving
 *    motes   S8 is the mote shot (the sun ahead), sized by distance: FAR 6-10 px backlit in SUN8's light against her
 *            house's shaded facade right of her door, under W (L* ~68); NEAR 12-16 px (lib plane -2, the preset's
 *            nearSize), 2-3 from the landing, drifting slowly in front of the facade's shaded right end, right of W
 *  No glints: no open water under SUN8 in frame at any pose (the basin is behind the board and the cafe boat).
 *  Nothing is born after 38.60 (nothing enters in the seam's 38.72-39.08); at the un-build they go with the sky, swept
 *  by its contraction into SUN0 (S1's frame 0 has none). Joins: the wipe in (scene 0) and the seam (6.15). */
export const S8_PARTICLE_JOINS = [0, S8T.end];
const HER_PATH: [number, number, number, number] = [690, 860, 170, 320];
const W_BOX: [number, number, number, number] = [MAP.W.x - MAP.W.w / 2 - 20, MAP.W.y - MAP.W.h / 2 - 20, MAP.W.w + 40, MAP.W.h + 40];
const GHOSTS_BOX: [number, number, number, number] = [610, 900, 170, 200];
/** Her board (frame) and Pip on its bollard, board-plane landing coords: the leaves keep clear of both. */
const BOARD_BOX: [number, number, number, number] = [100, 670, 590, 600];
const PIP_BOX: [number, number, number, number] = [640, 1100, 120, 215];
const SUN8_AT: [number, number] = [MAP.SUN8.x, MAP.SUN8.y];
/** The near lamp's lantern at the landing (V2S8_set NLAMP): the far motes keep off it. */
const LANTERN_BOX: [number, number, number, number] = [1024, 800, 48, 90];
export const S8_PARTICLE_FIELDS: {p: PlaneId; f: ParticlesProps}[] = [
  {p: 'house', f: {kind: 'motes', seed: 's8motes', region: {rect: [866, 810, 150, 190]}, on: '#CD9985', count: 5, atm: S8_ATM, plane: 0, t0: -3, t1: L(38.6), joins: S8_PARTICLE_JOINS, avoid: [CAPTION_BAND, W_BOX, HER_PATH, GHOSTS_BOX, LANTERN_BOX], sun: SUN8_AT}},
  {p: 'near', f: {kind: 'motes', seed: 's8motesNear', plane: -2, region: {ellipse: {cx: 1005, cy: 745, rx: 38, ry: 45}}, on: '#CD9985', count: 3, lift: 18, margin: 12, t0: S8T.truckT1, t1: L(38.6), joins: S8_PARTICLE_JOINS, avoid: [CAPTION_BAND, W_BOX], sun: SUN8_AT}},
  {p: 'board', f: {kind: 'leaves', seed: 's8leaves', leaf: 'palmate', region: {rect: [1110, 1150, 40, 70]}, on: '#E8D2BF', colors: [CM.leafRust, CM.leafGold, CM.leafRust], births: [L(35.7), L(36.35), L(37.0)], size: [34, 40], speed: [45, 70], drift: [-115, 0], floor: 1430, margin: 12, t0: S8T.wipeT1, t1: L(38.6), joins: S8_PARTICLE_JOINS, avoid: [CAPTION_BAND, BOARD_BOX, PIP_BOX, GHOSTS_BOX], sun: SUN8_AT}},
];
/** The sky's un-build circle (S8Sky's numbers: exit e 0.30 -> 0.92, r 1400 -> 0 easing in, about SUN0). */
const skyExitR = (e: number) => {
  const k = Math.min(1, Math.max(0, (e - 0.3) / 0.62));
  return 1400 * (1 - k * k);
};
const S8Particles: React.FC = () => {
  const e = useExit();
  const id = 's8pt' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const r = skyExitR(e);
  if (r <= 0) return null;
  const clip = e > 0.3;
  return (
    <>
      {clip ? (
        <defs>
          <clipPath id={id} clipPathUnits="userSpaceOnUse">
            <circle cx={MAP.SUN0.x} cy={MAP.SUN0.y} r={r} />
          </clipPath>
        </defs>
      ) : null}
      <g clipPath={clip ? `url(#${id})` : undefined}>
        {S8_PARTICLE_FIELDS.map(({p, f}) => (
          <S8Plane key={f.seed} p={p}>
            <Particles {...f} />
          </S8Plane>
        ))}
      </g>
    </>
  );
};

/** The sky's foot at the un-build: the gradient runs to y 800 behind the set; as the set un-builds its foot rises to
 *  the caption band's (560) over exit e 0 -> 0.35, so the peach horizon behind the far rows never shows as a band over
 *  S1's frame 0 (what the set uncovers is S1's pale drawing); the rest contracts into SUN0 (S8Sky). */
const SKY_FOOT = {from: 800, to: 560, e1: 0.35} as const;
const S8SkyAtExit: React.FC = () => {
  const e = useExit();
  const id = 's8sf' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (e <= 0) return <S8Sky />;
  const u = Math.min(1, e / SKY_FOOT.e1);
  const foot = SKY_FOOT.from - (SKY_FOOT.from - SKY_FOOT.to) * u * u * (3 - 2 * u);
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <rect x={-200} y={-200} width={1480} height={foot + 200} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <S8Sky />
      </g>
    </>
  );
};

const V2S8: React.FC = () => {
  const e = useExit();
  // the World sky is only a backstop under the set (S8Sky draws the sky); at the un-build it goes at once, so S1's
  // frame 0 (the loop underlay) shows through wherever S8 has un-built
  return (
    <World sky={e > 0 ? 'transparent' : CM.sky} horizon={900}>
      <Lit rig={RIG_CANAL_S8}>
        <CanalCast person={k4Person}>
          <S8SkyAtExit />
          <S8Far />
          <S8South />
          <S8Water />
          <S8HouseBandLight />
          <S8House />
          <S8Window />
          <S8Boat />
          <S8Ground />
          <S8LaneLight />
          <S8LaneShadows />
          <S8Public />
          <S8Her />
          <S8DoorLeaf />
          <S8GhostsLayer />
          <S8Particles />
          <S8Board />
          <S8Front />
          <S8Pip />
        </CanalCast>
      </Lit>
    </World>
  );
};
export default V2S8;
