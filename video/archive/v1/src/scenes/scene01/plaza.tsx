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
import {mat, XG} from '../../lib/xf';
import {InkScale} from '../../lib/inkComp';
import {GovEvents, GovernmentPlaza, GovId, PLAZA} from '../shared/sets';
import {Bit, EdgeOnlooker, SunPress} from '../shared/props';
import {inkComp, layerMat, toScreen, zoomAt} from './camera';
import {B} from './timing';
import {CitizenPlan, leanAt, OnlookerPhoneArm, OnlookerShade, PigeonPlan, PipLeap, PipPlan, PipS01, PlazaCitizen, Pigeon} from './cast';
import {s01WindowSlot} from './screens';
import {DOME_GLASS, LanternOff, S01_PADLOCK_SIZE, S01Shutter} from './shims';
import {DoorLanterns, LockRing, PRESS, pressK, PressTicks, S01Branch, S01Glyph, SunRipple, TreeTicks} from './dressing';
import {ShutdownRings, SlatTag} from './hook';

const SUN = PLAZA.sun; // (720, 900) r155
const VP = PLAZA.vp as Pt;
const HZ = PLAZA.horizon;
const MID = 3.4;

// ---------------------------------------------------------------- per-building switch-off plan (kit v3 events)

const SLAM_DUR = 0.16;
/** The power-off wave and the closures. govB: frame 0 holds its screen as the bright line (state 'frame0') and
 *  screenOffAt B.crtB ('Governments' 0.19, under shutdown ring 1) releases it (S12's rewind relights it there too);
 *  govD stays lit ('a bunch of', not all). The slams LAND on 'shut' / 'down' / 'bunch'
 *  (offAt = landing). Lettered tags are shifted apart on the rails (the kit's default slots overlap once the tag is
 *  lettered). Fix round 3: the padlocks are the scene's BIG CREAM S01Padlock (52-58 px, body centre 20 px above the
 *  bottom rail's bottom edge, so it covers the rail and the last slats: `padlockProps` mirrors x / y / size for kit
 *  readers), they glint on 'PURPOSE'. */
export const S01_GOV: Partial<Record<GovId, GovEvents>> = {
  govA: {screenOffAt: B.crtA, shutterAt: B.slamA, offAt: B.slamA + SLAM_DUR, padlockAt: B.padlocks[1], padlockProps: {x: 152, y: 994, size: S01_PADLOCK_SIZE.govA}, glintAt: B.padlockGlint[1], tagAt: B.tags[1], tagProps: {lettered: true, size: 74, x: 226}},
  // fix round 4: govB's tag 124 wide at x 546, hung 14 px higher (1090): it clears the door pediment's apex and govB's
  // right wall line (review: two tangents on the cover frame); the padlock moves 10 left (452) to keep an 8 px gap
  govB: {screenOffAt: B.crtB, shutterAt: B.slamB, offAt: B.slamB + SLAM_DUR, padlockAt: B.padlocks[0], padlockProps: {x: 452, y: 1096, size: S01_PADLOCK_SIZE.govB}, glintAt: B.padlockGlint[0], tagAt: B.tags[0], tagProps: {lettered: true, size: 124, x: 546, y: 1090}, lanternOffAt: B.domeLanternOff},
  // fix round 4: govC keeps its padlock only (review: its 62 px tag's 14 px letters were illegible and cluttered the
  // half-shutter read; J1 reads on govB and govA)
  govC: {screenOffAt: B.crtC, shutterAt: B.slamC, shutterStop: 0.5, padlockAt: B.padlocks[2], padlockProps: {x: 838, y: 767, size: S01_PADLOCK_SIZE.govC}, glintAt: B.padlockGlint[2]},
};

/** What the SET draws: S01_GOV minus every shutter / padlock / tag / glint, which `S01Shutter` (shims.tsx) draws on top
 *  (the cream padlock, the lock-click jolt, govC's partial-drop jolt, the dive ink compensation). The set still draws
 *  each rolled-up shutter box (redrawn identically), the screens, the lights-out step and govB's dome lantern. */
const S01_GOV_SET: Partial<Record<GovId, GovEvents>> = (() => {
  const strip = (e?: GovEvents): GovEvents => {
    const {shutterAt: _s, padlockAt: _p, tagAt: _t, glintAt: _g, ...rest} = e ?? {};
    return rest;
  };
  return {...S01_GOV, govA: strip(S01_GOV.govA), govB: strip(S01_GOV.govB), govC: strip(S01_GOV.govC)};
})();

/** What S01Shutter draws in S01 (hook pass 2): govB WITHOUT the kit tag under the rail: S01 hangs its big tag on the
 *  slats instead (hook.tsx SlatTag). S01_GOV itself keeps the old tag for S12 (its S11 note hangs on those slats). */
const S01_GOV_DRAW: Partial<Record<GovId, GovEvents>> = {...S01_GOV, govB: {...S01_GOV.govB, tagAt: undefined}};
/** The later power presses (one per shutdown ring, timing.ts B.ring): the click = the bottom of each press. */
export const S01_PRESSES = B.ring.map((r) => r.at);

/** The windows with the ink-dark dead screen (local stand-in, see screens.tsx). S12: pass the same slot. */
export const S01_WINDOWS = s01WindowSlot(S01_GOV, true);

// ---------------------------------------------------------------- citizens: the watching crowd (fix round 1)

/** Three rows of back-view people facing the plaza (the references' signature: rows shrinking toward the steps). Fix
 *  round 5 (review: a 134-190 px front row sat visually on the step band, so the eye compared people with the ~790 px
 *  facades at ~4:1, handsome but not monumental): the FRONT row is ~0.75 x (h 100-142: fA 142, fC 134, fD 100, all on
 *  one perspective line h ~ (feet y - 1381)), the SECOND row ~80 px, the far row 50-66 px at the steps (about 10:1
 *  against the facades), and the fB walker is dropped so open plaza floor shows between the near observer and the
 *  steps. The near observer stays the single big foreground figure. fA and fC are the two readable citizens; every
 *  front / second-row figure acts in head swaps (back view -> 3/4 toward govB: cheek and ear appear) and turns back on
 *  'PURPOSE'. Kept clear of govB's door and lock box (x 470-620, y 1230-1400: the dive target), of Pip (x 760-870) and
 *  of the edge onlooker's phone. */
export const S01_CITIZENS: CitizenPlan[] = [
  // FRONT row. fA: raises a phone toward govB on w3+0.25 (lit screen: a mini govB), lowers it on 'websites'
  {x: 318, y: 1540, h: 142, seed: 's01/fA', hair: 'bun', acc: ['backpack'], body: palette.sand, phone: {up: B.phonesUp, down: B.phoneDown, side: 1}, turn: [{t: B.heads + 0.1, d: 1}, {t: B.headsBack + 0.03, d: 0}], lean: [{t: B.heads + 0.1, a: 3}, {t: B.headsBack + 0.03, a: 0}], bob: 0.6},
  // fC: walking away at frame 0 (the seam is mid-motion); stops on 'Governments' and swaps to a 3/4 head toward govB
  {x: 712, y: 1532, h: 134, seed: 's01/fC', hair: 'curly', acc: ['strap'], body: palette.cream, walk: {speed: 9, hz: 2.0, slowAt: B.heads - 0.08, stopAt: B.heads + 0.04}, turn: [{t: B.heads + 0.04, d: -1}, {t: B.headsBack + 0.05, d: 0}], lean: [{t: B.heads + 0.04, a: -8}, {t: B.headsBack + 0.05, a: 0}]},
  // fD: looks at govB, then on 'of' points straight up at govC's clock tower (head back up), lowers it on 'PURPOSE'
  {x: 905, y: 1494, h: 100, seed: 's01/fD', hair: 'short', acc: ['collar'], body: palette.tan, turn: [{t: B.heads + 0.16, d: -1}, {t: B.point, d: 0}], point: {at: B.point, side: 1, hand: [20, -178], downAt: B.headsBack}, lean: [{t: B.heads + 0.16, a: -4}, {t: B.point, a: 2}, {t: B.headsBack, a: 0}]},
  // SECOND row (~80 px): turn on 'all' / 'over'
  {x: 172, y: 1474, h: 82, seed: 's01/sA', hair: 'short', acc: [], body: palette.sage, turn: [{t: B.crtA, d: 1}, {t: B.headsBack + 0.08, d: 0}], bob: 0.5},
  {x: 640, y: 1470, h: 80, seed: 's01/sB', hair: 'bun', acc: ['backpack'], body: palette.brown, turn: [{t: B.crtC, d: -1}, {t: B.headsBack + 0.06, d: 0}], lean: [{t: B.crtC, a: -4}, {t: B.headsBack + 0.06, a: 0}]},
  // FAR row at the steps (the set's citizen seeds): a walker who slows on 'all' and stops, idlers
  {x: 600, y: 1436, h: 62, seed: 'plaza/cit0', walk: {speed: 9, hz: 1.9, slowAt: B.crtA, stopAt: B.crtA + 0.5}, lean: [{t: B.crtA + 0.5, a: -4}, {t: B.headsBack, a: 0}]},
  {x: 548, y: 1446, h: 66, seed: 'plaza/cit4', bob: 0.7},
  {x: 468, y: 1440, h: 54, seed: 'plaza/cit6', bob: 0.5},
  {x: 130, y: 1442, h: 52, seed: 'plaza/cit7'},
  {x: 744, y: 1402, h: 26, seed: 'plaza/cit8', silhouette: true},
];
/** NEAR observer (PEAK-1 depth, ref2 f_1 / ref f_9.0): one big back-view figure cut by the bottom edge, left of Pip's
 *  bollard column, in the near layer (it leaves the dive fast, down and out). Fix round 4 (review: a flat tealDark
 *  tombstone with an ink-black ball head, the least drawn and darkest mass of the hook frame): the kit's tier-A
 *  foreground figure `EdgeOnlooker` (hood, hanging arms with sleeve seams and cuffs running off the bottom edge, the
 *  white rim strip, open contour) in a teal coat with ochre hair, plus the scene's tealDark shade wedge on the right of
 *  the back (`NearShade`). Leans toward govB on 'Governments', straightens on 'PURPOSE'. */
export type NearPlan = {x: number; y: number; head: number; seed: string; hair: 'short'; hairColor: string; body: string; acc: ('hood' | 'collar')[]; rim: 'left' | 'right'; lean: {t: number; a: number}[]; bob: number};
export const S01_NEAR: NearPlan[] = [
  {x: 566, y: 1572, head: 112, seed: 's01/nA', hair: 'short', hairColor: palette.brown, body: palette.teal, acc: ['hood'], rim: 'left', lean: [{t: B.heads + 0.08, a: -3}, {t: B.headsBack + 0.04, a: 0}], bob: 1.2},
];

/** Paint order: far first, then by feet y. */
const CITIZEN_ORDER = S01_CITIZENS.map((c, i) => [c.y, i] as [number, number]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);

// ---------------------------------------------------------------- pigeons on the lamp crossbar

/** They fly in UNDER govA's window band (y 906-1014) and swing back onto the bar (fix round 1). Fix round 5: ochre
 *  bodies with a cream belly and a closed ~2 px ink outline, perched (PerchedPigeon) and flying (Flyer), so they
 *  separate from govA's sand columns (the perch is the set's lamp crossbar: it stays at PLAZA.pigeons). Fix round 4: bird
 *  silhouettes (Flyer: filled wings, tealDark head; perched heads tealDark too), no white birds, and the
 *  scatter goes UP and LEFT out of the frame (off the left edge within ~0.35 s), so nothing crosses govA's shutter while
 *  the padlocks pop (3.30-3.70). */
const PG = PLAZA.pigeons;
export const S01_PIGEONS: PigeonPlan[] = [
  {x: PG[0][0], y: PG[0][1], seed: 'pg0', color: palette.cream, landAt: 0.12, inDur: B.pigeonsLand - 0.12, fromAbs: [-70, 1180], via: [220, 1090], flyAt: B.pigeonsFly, flyTo: [-300, -250], backAt: B.pigeonBack, backFrom: [-150, -250]},
  {x: PG[1][0], y: PG[1][1], seed: 'pg1', color: palette.cream, landAt: 0.17, inDur: B.pigeonsLand + 0.06 - 0.17, fromAbs: [-70, 1232], via: [250, 1124], shuffleAt: B.shuffle, shuffleDx: -10, flyAt: B.pigeonsFly + 0.05, flyTo: [-330, -330]},
  {x: PG[2][0], y: PG[2][1], seed: 'pg2', color: palette.cream, flip: true, landAt: 0.22, inDur: B.pigeonsLand + 0.12 - 0.22, fromAbs: [-70, 1150], via: [285, 1066], flyAt: B.pigeonsFly + 0.1, flyTo: [-360, -290]},
];

// ---------------------------------------------------------------- Pip (frame 0: sit-back, look 0, seed 11, idle clock t = 0)

export const S01_PIP_SEED = 11;
/** Fix round 4: Pip sits 12 px lower on the bollard cap (review: govD's ground line at y 1380 ran exactly along the
 *  bottom of his ears, a line through his neck at phone size; now it passes behind the ear lobes). */
export const S01_PIP: PipPlan = {x: PLAZA.pip[0], y: PLAZA.pip[1] + 12, flinchAt: B.pipFlinch, lookAt: B.heads, look: -0.55, hopAt: B.pipHop, landAt: B.pipLand, backAt: B.pipBack, exitAt: B.pipExit, lookBackAt: B.headsBack + 0.05};

// ---------------------------------------------------------------- Bit: seated ON govA's cornice ledge line

/** Bit's spot (fix round 1: +6 px, his feet on the cornice's ledge line instead of floating in the band). S12 ends on it. */
export const S01_BIT: [number, number] = [PLAZA.bit[0], PLAZA.bit[1] + 6];

// ---------------------------------------------------------------- the edge onlookers (PLAZA.onlookers, re-acted)

/** The left onlooker raises a phone along an elbow arc (the scene draws that arm: OnlookerPhoneArm); the phone ends
 *  right of his head at screen x ~165, clear of the lamp post, its lit screen showing a mini govB. Fix round 4: he
 *  lowers it on the pause before the dive (4.03 -> 4.28), so his arm hangs again when the dive pulls him out (review:
 *  his body left the frame ahead of the raised arm: a 'cane' hook for 5 frames). Onlooker [1] (the bottom-left bun
 *  head) is dropped (review: five framing elements in the bottom band; the left onlooker is the one side crop). */
const ONL_PHONE = {up: B.phonesUp + 0.06, down: B.onlookerPhoneDown, hand: [232, 1468] as [number, number]};
export const ONLOOKERS = [0, 2];
/** Fix round 5 (review: the film's paint edge took the fill off his hood and head: a half-erased ghost at the left
 *  edge of frame 0): the left onlooker stands 36 px further in (head x 88), so the loose edge bares paper on the ground
 *  around him, not on him. S12: the same offset. */
export const ONL_DX: number[] = [36, 0, 0];
export const Onlookers: React.FC = () => {
  const t = useTime();
  return (
    <>
      {ONLOOKERS.map((i) => {
        const o = PLAZA.onlookers[i];
        const head = 60 * o.s * 1.05;
        const body = [palette.tan, palette.sand, palette.sage][i];
        const raised = i === 0 && t >= ONL_PHONE.up;
        return (
          <React.Fragment key={i}>
            <EdgeOnlooker
              x={o.head[0] + ONL_DX[i]}
              y={o.head[1]}
              head={head}
              hair={(['short', 'bun', 'cap'] as const)[i]}
              body={body}
              acc={i === 1 ? ['scarf'] : i === 2 ? ['collar'] : ['hood']}
              rim={i === 2 ? 'left' : 'right'}
              arms={i === 0 ? (raised ? false : 'near') : 'both'}
              seed={`plaza/onl${i}`}
            />
            {i === 0 ? <OnlookerPhoneArm x={o.head[0] + ONL_DX[i]} y={o.head[1]} head={head} seed={`plaza/onl${i}`} coat={body} up={ONL_PHONE.up} down={ONL_PHONE.down} hand={ONL_PHONE.hand} /> : null}
          </React.Fragment>
        );
      })}
    </>
  );
};

/** The near observer (S01_NEAR): kit EdgeOnlooker leaning about a point below the frame, plus a tealDark shade wedge
 *  down the right side of the back (one light step, ref2 1.7). */
export const NearObserver: React.FC<{p: NearPlan}> = ({p}) => {
  const t = useTime();
  const lean = leanAt(t, p.lean);
  return (
    <XG m={mat.about(mat.rotate(lean), p.x, 2080)}>
      <EdgeOnlooker x={p.x} y={p.y} head={p.head} hair={p.hair} hairColor={p.hairColor} body={p.body} acc={p.acc} rim={p.rim} arms="both" bob={p.bob} seed={p.seed} />
      <OnlookerShade x={p.x} y={p.y} head={p.head} seed={p.seed} bob={p.bob} />
    </XG>
  );
};

// ---------------------------------------------------------------- the shot

export const PlazaShutdown: React.FC = () => {
  const t = useTime();
  const extra: Record<string, React.ReactNode> = {
    buildings: (
      <>
        {(['govC', 'govA', 'govB'] as const).map((id) => (
          <S01Shutter key={id} id={id} ev={S01_GOV_DRAW[id] as GovEvents} />
        ))}
        <SlatTag at={B.tags[0]} slap={B.purposeSlap} outAt={B.slatTagOut} />
        <LanternOff r={DOME_GLASS} at={B.domeLanternOff} seed="s01/domeOff" />
        <DoorLanterns offAt={[B.lampOff, B.lampOff + 0.06]} />
        <Bit x={S01_BIT[0]} y={S01_BIT[1]} size={PLAZA.bitSize} seed="plaza/bit" state="idle" />
        <LockRing x={PLAZA.gov.govB.lock[0]} y={PLAZA.gov.govB.lock[1]} at={B.lockRing} dive={B.dive} cut={B.cut} />
      </>
    ),
    light: (
      <>
        {/* hook pass 2: the shutdown rings, over the facades and the ground, under the crowd and the near layer */}
        <ShutdownRings layer="light" />
        {CITIZEN_ORDER.map((i) => (
          <PlazaCitizen key={i} p={S01_CITIZENS[i]} vp={VP} horizon={HZ} />
        ))}
      </>
    ),
    near: (
      <>
        <TreeTicks />
        {S01_PIGEONS.map((p) => (
          <Pigeon key={p.seed} p={p} />
        ))}
        <PipS01 p={S01_PIP} seed={S01_PIP_SEED} />
        {S01_NEAR.map((c) => (
          <NearObserver key={c.seed} p={c} />
        ))}
        <Onlookers />
        <S01Branch />
      </>
    ),
  };
  // every layer (the set's strokes AND the scene's extras) draws its ink compensated in the dive (ENGINE.md 4b:
  // (zoom / zoom at 4.385)^-0.6 per layer, exactly 1 up to the dive start), so the cut lands at ~3-6 px like S02
  const wrap = (name: string, _nearness: number, node: React.ReactNode) => (
    <XG m={layerMat(t, name)}>
      <InkScale value={inkComp(t, name)}>
        {node}
        {extra[name] ?? null}
      </InkScale>
    </XG>
  );
  // frame 0 = the bottom of the SunPress (0.88) with the ripple at its emission radius; it releases over 0.2 s while
  // the ripple runs out to r + 40 (S12 ends on mode="reverse": the same state)
  const discPress = pressK(t, S01_PRESSES);
  const sun = (
    <>
      <SunPress mode="release" at={B.rippleAt} cx={SUN.x} cy={SUN.y} r={SUN.r} width={MID} ripple={false}>
        {/* hook pass 2: the disc dips PRESS.disc on each later press (identity outside them: frame 0 untouched) */}
        <XG m={discPress === 0 ? mat.I : mat.about(mat.scale(1 - PRESS.disc * discPress), SUN.x, SUN.y)}>
          <Sun cx={SUN.x} cy={SUN.y} r={SUN.r} drift={[0, 0]}>
            {(r: number) => <S01Glyph r={r} glintAt={B.glintPop} seed="s01/pwr" pressAt={S01_PRESSES} />}
          </Sun>
        </XG>
      </SunPress>
      {/* the ripple: a cream band with ink edges (the kit's ink ring read as an outline around the sun), and the three
          press ticks in the clear sky above the gap (frame 0 only: gone by 0.1 s) */}
      <SunRipple cx={SUN.x} cy={SUN.y} r={SUN.r} at={B.rippleAt} />
      <PressTicks cx={SUN.x} cy={SUN.y} at={B.rippleAt} />
    </>
  );
  return (
    <>
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
      {/* Pip's leap across the matchcut, in SCREEN space (outside the camera): from the bollard top where the near
          layer had him at take-off to S02's pickup state (handoff.ts) */}
      <PipLeap p={S01_PIP} from={PIP_TAKEOFF} fromScale={PIP_TAKEOFF_SCALE} />
    </>
  );
};

/** Pip's take-off point on screen (the bollard top in the near layer at B.pipExit) and his screen scale there. */
const PIP_TAKEOFF = toScreen(B.pipExit, [S01_PIP.x, S01_PIP.y], 'near') as Pt;
const PIP_TAKEOFF_SCALE = zoomAt(B.pipExit, 'near');
