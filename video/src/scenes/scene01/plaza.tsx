// S01 Government Plaza powers down: the whole shot as one component (scene time from useTime()), so S12's rewind can
// replay it (wrap it in a TimeProvider / TimeShift that maps S12's time onto S01's, stepped like a tape).
//   storyboard v3 S01 (docs/storyboard_v3.md, docs/storyboard_v3_resolved.json): frame 0 = the bottom of the SunPress,
//   govB's screen a bright line; the power-off wave (govA 'all', govC 'over', the far civic skyline 'Europe'); shutters
//   slam on 'shut' / 'down', govC only half on 'bunch'; padlocks; lettered 'back soon' tags on 'on'; govD stays lit;
//   the ring on govB's lock; the dive into the lock box (fixed 0.33 s) onto S02's blueprint lock.
import React from 'react';
import {palette} from '../../lib/theme';
import {useTime} from '../../lib/time';
import {Sun} from '../../lib/Sun';
import {Pt} from '../../lib/sketch';
import {XG} from '../../lib/xf';
import {GovEvents, GovernmentPlaza, GovId, PLAZA} from '../shared/sets';
import {EdgeOnlooker, MarkRing, PowerGlyph, SunPress} from '../shared/props';
import {layerMat, PARALLAX} from './camera';
import {B} from './timing';
import {CitizenPlan, PigeonPlan, PipS01, PlazaCitizen, Pigeon} from './cast';

const SUN = PLAZA.sun; // (720, 900) r155
const VP = PLAZA.vp as Pt;
const HZ = PLAZA.horizon;
const MID = 3.4;

// ---------------------------------------------------------------- per-building switch-off plan (kit v3 events)

const SLAM_DUR = 0.16;
/** The power-off wave and the closures. govB: frame 0 holds its screen as the bright line (state 'frame0') and
 *  screenOffAt 0 releases it; govD stays lit ('a bunch of', not all). Padlocks / lettered tags are shifted apart on the
 *  rails (the kit's default slots overlap once the tag is lettered). */
export const S01_GOV: Partial<Record<GovId, GovEvents>> = {
  govA: {screenOffAt: B.crtA, shutterAt: B.slamA, offAt: B.slamA + SLAM_DUR, padlockAt: B.padlocks[1], padlockProps: {x: 152}, tagAt: B.tags[1], tagProps: {lettered: true, size: 74, x: 226}},
  govB: {screenOffAt: 0, shutterAt: B.slamB, offAt: B.slamB + SLAM_DUR, padlockAt: B.padlocks[0], padlockProps: {x: 462}, tagAt: B.tags[0], tagProps: {lettered: true, size: 104, x: 562}, lanternOffAt: B.domeLanternOff},
  govC: {screenOffAt: B.crtC, shutterAt: B.slamC, shutterStop: 0.5, padlockAt: B.padlocks[2], padlockProps: {x: 838}, tagAt: B.tags[2], tagProps: {lettered: true, size: 62, x: 900}},
};

// ---------------------------------------------------------------- citizens (PLAZA.citizens slots, re-acted)

const C = PLAZA.citizens;
/** The six readable citizens + the four far ones. Bodies are explicit so the pointing sleeve matches the coat. */
const CITIZENS: CitizenPlan[] = [
  // c0: a walker who slows on 'all' and stops
  {x: C[0].x, y: C[0].y, h: C[0].h, seed: 'c0', body: palette.sage, hair: 'short', walk: {speed: 9, hz: 1.9, slowAt: B.crtA, stopAt: B.crtA + 0.5}, lean: [{t: B.crtA + 0.5, a: -4}, {t: B.headsBack, a: 0}]},
  // c1, c3: walking at frame 0 (the seam is mid-motion), they stop on 'Governments' and turn toward govB
  {x: C[1].x, y: C[1].y, h: C[1].h, seed: 'c1', body: palette.tan, hair: 'bun', walk: {speed: 10, hz: 2.1, slowAt: B.heads - 0.12, stopAt: B.heads}, lean: [{t: B.heads, a: -6}, {t: B.headsBack, a: 0}]},
  // c2: raises a phone toward govB, lowers it on 'websites'
  {x: C[2].x, y: C[2].y, h: C[2].h, seed: 'c2', body: palette.teal, hair: 'curly', acc: ['backpack'], phone: {up: B.phonesUp, down: B.phoneDown}, lean: [{t: B.heads + 0.05, a: -3}, {t: B.headsBack, a: 0}], bob: 0.6},
  {x: C[3].x, y: C[3].y, h: C[3].h, seed: 'c3', body: palette.brown, hair: 'long', walk: {speed: 9, hz: 2.0, slowAt: B.heads - 0.1, stopAt: B.heads + 0.04}, lean: [{t: B.heads + 0.04, a: -7}, {t: B.headsBack + 0.05, a: 0}]},
  {x: C[4].x, y: C[4].y, h: C[4].h, seed: 'c4', body: palette.sand, hair: 'cap', acc: ['strap'], bob: 0.7},
  // c5: points up at govC on 'of'
  {x: C[5].x, y: C[5].y, h: C[5].h, seed: 'c5', body: palette.sage, hair: 'beanie', point: {at: B.point, side: -1, hand: [-30, -205]}, lean: [{t: B.point, a: -2}]},
  // far texture on govA's steps and two silhouettes deep in the gap
  {x: C[6].x, y: C[6].y, h: C[6].h, seed: 'c6', body: palette.teal, hair: 'short'},
  {x: C[7].x, y: C[7].y, h: C[7].h, seed: 'c7', body: palette.tan, hair: 'bun'},
  {x: C[8].x, y: C[8].y, h: C[8].h, seed: 'c8', body: palette.sage, silhouette: true},
  {x: C[9].x, y: C[9].y, h: C[9].h, seed: 'c9', body: palette.sage, silhouette: true},
];
/** Paint order: far first, then by feet y. */
const CITIZEN_ORDER = CITIZENS.map((c, i) => [c.y, i] as [number, number]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);

// ---------------------------------------------------------------- pigeons on the lamp crossbar

const PG = PLAZA.pigeons;
const PIGEONS: PigeonPlan[] = [
  {x: PG[0][0], y: PG[0][1], seed: 'pg0', color: palette.white, landAt: B.pigeonsLand - 0.24, from: [170, -150], flyAt: B.pigeonsFly, flyTo: [190, -380], backAt: B.pigeonBack, backFrom: [-150, -250]},
  {x: PG[1][0], y: PG[1][1], seed: 'pg1', color: palette.sand, landAt: B.pigeonsLand - 0.18, from: [200, -120], shuffleAt: B.shuffle, shuffleDx: -10, flyAt: B.pigeonsFly + 0.05, flyTo: [260, -330]},
  {x: PG[2][0], y: PG[2][1], seed: 'pg2', color: palette.white, flip: true, landAt: B.pigeonsLand - 0.12, from: [230, -170], flyAt: B.pigeonsFly + 0.1, flyTo: [330, -300]},
];

// ---------------------------------------------------------------- the edge onlookers (PLAZA.onlookers, re-acted)

const Onlookers: React.FC = () => (
  <>
    {PLAZA.onlookers.map((o, i) => (
      <EdgeOnlooker
        key={i}
        x={o.head[0]}
        y={o.head[1]}
        head={60 * o.s * 1.05}
        hair={(['short', 'bun', 'cap'] as const)[i]}
        body={[palette.teal, palette.sand, palette.sage][i]}
        acc={i === 1 ? ['scarf'] : i === 2 ? ['collar'] : ['hood']}
        rim={i === 2 ? 'left' : 'right'}
        arms={i === 0 ? 'near' : 'both'}
        raisePhoneAt={i === 0 ? B.phonesUp + 0.06 : undefined}
        seed={`plaza/onl${i}`}
      />
    ))}
  </>
);

// ---------------------------------------------------------------- the shot

export const PlazaShutdown: React.FC = () => {
  const t = useTime();
  const extra: Record<string, React.ReactNode> = {
    buildings: (
      <>
        <MarkRing x={PLAZA.gov.govB.lock[0]} y={PLAZA.gov.govB.lock[1]} r={24} at={B.lockRing} dur={0.12} width={2.4} seed="s01/ring" />
      </>
    ),
    light: (
      <>
        {CITIZEN_ORDER.map((i) => (
          <PlazaCitizen key={i} p={CITIZENS[i]} vp={VP} horizon={HZ} />
        ))}
      </>
    ),
    near: (
      <>
        {PIGEONS.map((p) => (
          <Pigeon key={p.seed} p={p} />
        ))}
        <Onlookers />
        <PipS01
          p={{x: PLAZA.pip[0], y: PLAZA.pip[1], lookAt: B.heads, look: -0.55, hopAt: B.pipHop, landAt: B.pipLand, backAt: B.pipBack, exitAt: B.dive + 0.06, exitTo: [1010, 1270], lookBackAt: B.headsBack + 0.05}}
        />
      </>
    ),
  };
  const wrap = (name: string, _nearness: number, node: React.ReactNode) => (
    <XG m={layerMat(t, PARALLAX[name] ?? 1)}>
      {node}
      {extra[name] ?? null}
    </XG>
  );
  // frame 0 = the bottom of the SunPress (0.88) with the ripple at its emission radius; it releases over 0.2 s while
  // the ripple runs out to r + 40 (S12 ends on mode="reverse": the same state)
  const sun = (
    <SunPress mode="release" at={B.rippleAt} cx={SUN.x} cy={SUN.y} r={SUN.r} width={MID}>
      <Sun cx={SUN.x} cy={SUN.y} r={SUN.r} drift={[0, 0]}>
        {(r: number) => <PowerGlyph r={r} glintAt={B.glint} seed="s01/pwr" />}
      </Sun>
    </SunPress>
  );
  return (
    <GovernmentPlaza
      state="frame0"
      sun={sun}
      gov={S01_GOV}
      civicOffAt={B.civicOff[0]}
      civicLanternsOffAt={B.civicLanterns[0]}
      citizensAt={false}
      onlookers={false}
      lanternOffAt={B.lampOff}
      wrap={wrap}
      seed="plaza"
    />
  );
};
