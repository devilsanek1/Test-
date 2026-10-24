// S01 Government Plaza powers down: the whole shot as one component (scene time from useTime()), so S12's rewind can
// replay it (wrap it in a TimeProvider / TimeShift that maps S12's time onto S01's, stepped like a tape).
//   storyboard v3 S01 (docs/storyboard_v3.md, docs/storyboard_v3_resolved.json): frame 0 = the bottom of the SunPress,
//   govB's screen a bright line; the power-off wave (govA 'all', govC 'over', the far civic skyline 'Europe'); shutters
//   slam on 'shut' / 'down', govC only half on 'bunch'; padlocks; lettered 'back soon' tags on 'on'; govD stays lit;
//   the ring on govB's lock; the dive into the lock box (fixed 0.33 s) onto S02's blueprint lock.
import React from 'react';
import {palette} from '../../lib/theme';
import {clamp, ease as E, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Sun} from '../../lib/Sun';
import {Fill} from '../../lib/Fill';
import {Pt, rectPath} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {GovEvents, GovernmentPlaza, GovId, PLAZA} from '../shared/sets';
import {Bit, EdgeOnlooker, MarkRing, PowerGlyph, SunPress} from '../shared/props';
import {layerMat, zoomAt} from './camera';
import {B} from './timing';
import {CitizenPlan, OnlookerPhoneArm, PigeonPlan, PipPlan, PipS01, PlazaCitizen, Pigeon} from './cast';
import {s01WindowSlot} from './screens';
import {DOME_GLASS, GovCShutter, LAMP_GLASS, LanternOff, S01FarCivic} from './shims';

const SUN = PLAZA.sun; // (720, 900) r155
const VP = PLAZA.vp as Pt;
const HZ = PLAZA.horizon;
const MID = 3.4;

// ---------------------------------------------------------------- per-building switch-off plan (kit v3 events)

const SLAM_DUR = 0.16;
/** The power-off wave and the closures. govB: frame 0 holds its screen as the bright line (state 'frame0') and
 *  screenOffAt 0 releases it; govD stays lit ('a bunch of', not all). The slams LAND on 'shut' / 'down' / 'bunch'
 *  (offAt = landing). Padlocks (1.3x, 36 px) / lettered tags are shifted apart on the rails (the kit's default slots
 *  overlap once the tag is lettered); the padlocks glint on 'PURPOSE'. */
export const S01_GOV: Partial<Record<GovId, GovEvents>> = {
  govA: {screenOffAt: B.crtA, shutterAt: B.slamA, offAt: B.slamA + SLAM_DUR, padlockAt: B.padlocks[1], padlockProps: {x: 152, size: 36}, glintAt: B.padlockGlint[1], tagAt: B.tags[1], tagProps: {lettered: true, size: 74, x: 226}},
  govB: {screenOffAt: 0, shutterAt: B.slamB, offAt: B.slamB + SLAM_DUR, padlockAt: B.padlocks[0], padlockProps: {x: 462, size: 36}, glintAt: B.padlockGlint[0], tagAt: B.tags[0], tagProps: {lettered: true, size: 144, x: 566}, lanternOffAt: B.domeLanternOff},
  govC: {screenOffAt: B.crtC, shutterAt: B.slamC, shutterStop: 0.5, padlockAt: B.padlocks[2], padlockProps: {x: 838, size: 36}, glintAt: B.padlockGlint[2], tagAt: B.tags[2], tagProps: {lettered: true, size: 62, x: 900}},
};

/** What the SET draws: S01_GOV minus govC's shutter / padlock / tag / glint, which `GovCShutter` (shims.tsx) draws with
 *  the props RollerShutter's partial-drop jolt (the kit's ShutterRig drops h x stop with a full-closure bounce). govC
 *  keeps shutterStop, so the set still draws its rolled-up shutter box. Drop this once the kit passes stopAt. */
const S01_GOV_SET: Partial<Record<GovId, GovEvents>> = (() => {
  const {shutterAt: _s, padlockAt: _p, tagAt: _t, glintAt: _g, ...rest} = S01_GOV.govC as GovEvents;
  return {...S01_GOV, govC: rest};
})();

/** The windows with the ink-dark dead screen (local stand-in, see screens.tsx). S12: pass the same slot. */
export const S01_WINDOWS = s01WindowSlot(S01_GOV, true);

// ---------------------------------------------------------------- citizens: the watching crowd (fix round 1)

/** Three rows of back-view people facing the plaza (the references' signature: rows shrinking toward the steps):
 *  a FRONT row of four readable 134-192 px figures on the plaza (feet y 1494-1540), a SECOND row of two ~110 px
 *  (feet ~1472), the far row of 50-66 px at the steps and one silhouette deep on the sun path. Every front / second-row
 *  figure acts in head swaps (back view -> 3/4 toward govB: cheek and ear appear) and turns back on 'PURPOSE'.
 *  Kept clear of govB's door and lock box (x 470-620, y 1230-1400: the dive target), of Pip (x 760-870) and of the
 *  edge onlooker's phone. */
export const S01_CITIZENS: CitizenPlan[] = [
  // FRONT row. fA: raises a phone toward govB on w3+0.25 (lit screen: a mini govB), lowers it on 'websites'
  {x: 300, y: 1540, h: 190, seed: 's01/fA', hair: 'bun', acc: ['backpack'], body: palette.sand, phone: {up: B.phonesUp, down: B.phoneDown, side: 1}, turn: [{t: B.heads + 0.1, d: 1}, {t: B.headsBack + 0.03, d: 0}], lean: [{t: B.heads + 0.1, a: 3}, {t: B.headsBack + 0.03, a: 0}], bob: 0.6},
  // fB, fC: walking away at frame 0 (the seam is mid-motion); they stop on 'Governments' and swap to a 3/4 head toward govB
  {x: 415, y: 1514, h: 162, seed: 's01/fB', hair: 'short', acc: ['collar'], body: palette.peach, walk: {speed: 12, hz: 2.1, slowAt: B.heads - 0.12, stopAt: B.heads}, turn: [{t: B.heads, d: 1}, {t: B.headsBack, d: 0}], lean: [{t: B.heads, a: 8}, {t: B.headsBack, a: 0}]},
  {x: 712, y: 1532, h: 180, seed: 's01/fC', hair: 'curly', acc: ['strap'], body: palette.cream, walk: {speed: 11, hz: 2.0, slowAt: B.heads - 0.08, stopAt: B.heads + 0.04}, turn: [{t: B.heads + 0.04, d: -1}, {t: B.headsBack + 0.05, d: 0}], lean: [{t: B.heads + 0.04, a: -8}, {t: B.headsBack + 0.05, a: 0}]},
  // fD: looks at govB, then on 'of' points straight up at govC's clock tower (head back up), lowers it on 'PURPOSE'
  {x: 905, y: 1494, h: 134, seed: 's01/fD', hair: 'short', acc: ['collar'], body: palette.tan, turn: [{t: B.heads + 0.16, d: -1}, {t: B.point, d: 0}], point: {at: B.point, side: 1, hand: [20, -178], downAt: B.headsBack}, lean: [{t: B.heads + 0.16, a: -4}, {t: B.point, a: 2}, {t: B.headsBack, a: 0}]},
  // SECOND row: turn on 'all' / 'over'
  {x: 255, y: 1474, h: 112, seed: 's01/sA', hair: 'short', acc: [], body: palette.sage, turn: [{t: B.crtA, d: 1}, {t: B.headsBack + 0.08, d: 0}], bob: 0.5},
  {x: 645, y: 1470, h: 108, seed: 's01/sB', hair: 'bun', acc: ['backpack'], body: palette.brown, turn: [{t: B.crtC, d: -1}, {t: B.headsBack + 0.06, d: 0}], lean: [{t: B.crtC, a: -4}, {t: B.headsBack + 0.06, a: 0}]},
  // FAR row at the steps (the set's citizen seeds): a walker who slows on 'all' and stops, idlers
  {x: 600, y: 1436, h: 62, seed: 'plaza/cit0', walk: {speed: 9, hz: 1.9, slowAt: B.crtA, stopAt: B.crtA + 0.5}, lean: [{t: B.crtA + 0.5, a: -4}, {t: B.headsBack, a: 0}]},
  {x: 548, y: 1446, h: 66, seed: 'plaza/cit4', bob: 0.7},
  {x: 468, y: 1440, h: 54, seed: 'plaza/cit6', bob: 0.5},
  {x: 130, y: 1442, h: 52, seed: 'plaza/cit7'},
  {x: 744, y: 1402, h: 26, seed: 'plaza/cit8', silhouette: true},
];
/** Paint order: far first, then by feet y. */
const CITIZEN_ORDER = S01_CITIZENS.map((c, i) => [c.y, i] as [number, number]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);

// ---------------------------------------------------------------- pigeons on the lamp crossbar

/** They fly in UNDER govA's window band (y 906-1014) and swing back onto the bar (fix round 1: the old route crossed
 *  the browser window and the bare 'v' ticks read as UI chevrons). */
const PG = PLAZA.pigeons;
export const S01_PIGEONS: PigeonPlan[] = [
  {x: PG[0][0], y: PG[0][1], seed: 'pg0', color: palette.white, landAt: 0.12, inDur: B.pigeonsLand - 0.12, fromAbs: [-70, 1180], via: [220, 1090], flyAt: B.pigeonsFly, flyTo: [190, -380], backAt: B.pigeonBack, backFrom: [-150, -250]},
  {x: PG[1][0], y: PG[1][1], seed: 'pg1', color: palette.sand, landAt: 0.17, inDur: B.pigeonsLand + 0.06 - 0.17, fromAbs: [-70, 1232], via: [250, 1124], shuffleAt: B.shuffle, shuffleDx: -10, flyAt: B.pigeonsFly + 0.05, flyTo: [260, -330]},
  {x: PG[2][0], y: PG[2][1], seed: 'pg2', color: palette.white, flip: true, landAt: 0.22, inDur: B.pigeonsLand + 0.12 - 0.22, fromAbs: [-70, 1150], via: [285, 1066], flyAt: B.pigeonsFly + 0.1, flyTo: [330, -300]},
];

// ---------------------------------------------------------------- Pip (frame 0: sit-back, look 0, seed 11, idle clock t = 0)

export const S01_PIP_SEED = 11;
export const S01_PIP: PipPlan = {x: PLAZA.pip[0], y: PLAZA.pip[1], flinchAt: B.pipFlinch, lookAt: B.heads, look: -0.55, hopAt: B.pipHop, landAt: B.pipLand, backAt: B.pipBack, exitAt: B.dive + 0.045, exitTo: [1010, 1270], lookBackAt: B.headsBack + 0.05};

// ---------------------------------------------------------------- Bit: seated ON govA's cornice ledge line

/** Bit's spot (fix round 1: +6 px, his feet on the cornice's ledge line instead of floating in the band). S12 ends on it. */
export const S01_BIT: [number, number] = [PLAZA.bit[0], PLAZA.bit[1] + 6];

// ---------------------------------------------------------------- the edge onlookers (PLAZA.onlookers, re-acted)

/** The left onlooker raises a phone along an elbow arc (the scene draws that arm: OnlookerPhoneArm); the phone ends
 *  right of his head at screen x ~165, clear of the lamp post, its lit screen showing a mini govB. */
const ONL_PHONE = {up: B.phonesUp + 0.06, hand: [202, 1471] as [number, number]};
const Onlookers: React.FC = () => {
  const t = useTime();
  return (
    <>
      {PLAZA.onlookers.map((o, i) => {
        const head = 60 * o.s * 1.05;
        const body = [palette.teal, palette.sand, palette.sage][i];
        const raised = i === 0 && t >= ONL_PHONE.up;
        return (
          <React.Fragment key={i}>
            <EdgeOnlooker
              x={o.head[0]}
              y={o.head[1]}
              head={head}
              hair={(['short', 'bun', 'cap'] as const)[i]}
              body={body}
              acc={i === 1 ? ['scarf'] : i === 2 ? ['collar'] : ['hood']}
              rim={i === 2 ? 'left' : 'right'}
              arms={i === 0 ? (raised ? false : 'near') : 'both'}
              seed={`plaza/onl${i}`}
            />
            {i === 0 ? <OnlookerPhoneArm x={o.head[0]} y={o.head[1]} head={head} seed={`plaza/onl${i}`} coat={body} up={ONL_PHONE.up} hand={ONL_PHONE.hand} /> : null}
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- 'PURPOSE': the padlocks glint

/** Two glint ticks pop off a padlock's upper-left corner, cream on the dark shutter slats it hangs from (the kit's glint
 *  is a 1-px cream tick: invisible on a phone; the facade right of the body is taken by the tags). Pop 30 % -> 100 % in
 *  0.05 s, gone after 0.25 s. */
const PadlockSpark: React.FC<{x: number; y: number; at: number; seed: string}> = ({x, y, at, seed}) => {
  const t = useTime();
  if (t < at || t >= at + 0.25) return null;
  const k = 0.3 + 0.7 * E.outBack(1.8)(clamp((t - at) / 0.05));
  return (
    <XG m={mat.about(mat.scale(k), x - 14, y - 10)}>
      <Ink d={`M${x - 16} ${y - 13}L${x - 28} ${y - 26}M${x - 19} ${y - 4}L${x - 35} ${y - 6}`} width={4.2} color={palette.cream} taper={false} seed={seed} />
    </XG>
  );
};
const SPARKS: [number, number, number][] = [
  [462, PLAZA.gov.govB.padlock[1], B.padlockGlint[0]],
  [152, PLAZA.gov.govA.padlock[1], B.padlockGlint[1]],
  [838, PLAZA.gov.govC.padlock[1] - 0.5 * PLAZA.gov.govC.window[3], B.padlockGlint[2]],
];

// ---------------------------------------------------------------- the dive: govB's shutter thins out

/** During the 0.33 s dive the camera scales the ink 3.07x (the shutter's 1.5 px ribs reached ~5 px, review: heavy
 *  parallel bars at the cut, scribble under the caption): from the dive start the curtain is re-covered flat and its
 *  ribs redrawn at width x (zoom / zoom0)^-0.6 (1.0 at the dive start: no step), and they thin out to nothing over
 *  4.585-4.645, so the last 3 frames (f139-f141, the caption over the shutter) show a flat tealDark curtain under the
 *  rail and box. Same rib path and seed as props RollerShutter. */
const GovBDiveShutter: React.FC = () => {
  const t = useTime();
  if (t < B.dive || t >= B.cut) return null;
  const [x, y, w, h] = PLAZA.gov.govB.window;
  const z = zoomAt(t, 'buildings') / zoomAt(B.dive, 'buildings');
  const rw = SHUTTER_RIB * Math.pow(z, -0.6) * (1 - prog(t, 4.585, 0.06));
  let ribs = '';
  for (let yy = y + h - 24; yy > y + 2; yy -= 14) ribs += `M${x + 3} ${yy.toFixed(1)}H${x + w - 3}`;
  return (
    <>
      <Fill d={rectPath(x + 2.2, y + 2, w - 4.4, h - 14)} color={palette.tealDark} offset={false} mode="none" seed="s01/bdive" />
      {rw > 0.05 ? <Ink d={ribs} width={rw} taper={false} vary={0} seed="plaza/govB/sh/rb" /> : null}
    </>
  );
};
/** props RollerShutter's rib width at the set's mid ink (iw x 0.45). */
const SHUTTER_RIB = MID * 0.45;

// ---------------------------------------------------------------- the shot

export const PlazaShutdown: React.FC = () => {
  const t = useTime();
  const extra: Record<string, React.ReactNode> = {
    far: <S01FarCivic offAt={B.civicOff[0]} lanternsOffAt={B.civicLanterns[0]} />,
    buildings: (
      <>
        <GovCShutter ev={S01_GOV.govC as GovEvents} />
        <LanternOff r={DOME_GLASS} at={B.domeLanternOff} seed="s01/domeOff" />
        <GovBDiveShutter />
        <Bit x={S01_BIT[0]} y={S01_BIT[1]} size={PLAZA.bitSize} seed="plaza/bit" state="idle" />
        {SPARKS.map(([x, y, at], i) => (
          <PadlockSpark key={i} x={x} y={y} at={at} seed={`s01/spark${i}`} />
        ))}
        <MarkRing x={PLAZA.gov.govB.lock[0]} y={PLAZA.gov.govB.lock[1]} r={24} at={B.lockRing} dur={0.12} width={2.4} seed="s01/ring" />
      </>
    ),
    light: (
      <>
        {CITIZEN_ORDER.map((i) => (
          <PlazaCitizen key={i} p={S01_CITIZENS[i]} vp={VP} horizon={HZ} />
        ))}
      </>
    ),
    near: (
      <>
        <LanternOff r={LAMP_GLASS} at={B.lampOff} seed="s01/lampOff" />
        {S01_PIGEONS.map((p) => (
          <Pigeon key={p.seed} p={p} />
        ))}
        <Onlookers />
        <PipS01 p={S01_PIP} seed={S01_PIP_SEED} />
      </>
    ),
  };
  const wrap = (name: string, _nearness: number, node: React.ReactNode) => (
    <XG m={layerMat(t, name)}>
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
      gov={S01_GOV_SET}
      windowSlot={S01_WINDOWS}
      civicOffAt={B.civicOff[0]}
      civicLanternsOffAt={B.civicLanterns[0]}
      citizensAt={false}
      onlookers={false}
      bit={false}
      lanternOffAt={B.lampOff}
      wrap={wrap}
      seed="plaza"
    />
  );
};
