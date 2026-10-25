// S12 Before there was even a fix (the rewind): the whole shot. It is S01's plaza (scene01/plaza.tsx PlazaShutdown,
// mirrored layer by layer: the same set props, windows, shutter hardware, lanterns, citizens, pigeons, Pip, edge
// figures, branch, tree ticks and sun) driven by the S01 clock W(t) (timing.ts): S01's settled tail in the P phase with
// S12's own beats added, then S01 backwards, stepped like a tape, down to t = 0. Differences from PlazaShutdown: S12's
// camera (camera.ts) instead of S01's push + dive, no lock ring and no leap to S02, the P / R plans (cast.tsx), Bit's
// walk home, and the sun's glyph swaps (power -> REWIND on 'before' -> power on 'fix.') on S12's own clock.
// KEEP IN STEP WITH scene01/plaza.tsx PlazaShutdown: the last frame must stay S01's frame 0 (docs/scenes/S12.md 'Seam').
import React from 'react';
import {TimeProvider, useTime} from '../../lib/time';
import {Sun} from '../../lib/Sun';
import {XG} from '../../lib/xf';
import {InkScale} from '../../lib/inkComp';
import {GovEvents, GovernmentPlaza, GovId, PLAZA} from '../shared/sets';
import {PowerGlyph, RewindGlyph, SunPress} from '../shared/props';
import {B as S01B} from '../scene01/timing';
import {NearObserver, Onlookers, S01_GOV, S01_PIP_SEED, S01_WINDOWS} from '../scene01/plaza';
import {Pigeon, PipS01, PlazaCitizen} from '../scene01/cast';
import {DOME_GLASS, LanternOff, S01Shutter} from '../scene01/shims';
import {DoorLanterns, PressTicks, S01Branch, S01Glyph, SunRipple, TreeTicks} from '../scene01/dressing';
import {layerMat} from './camera';
import {B, DOME_LANTERN_R, inRewind, pipClockR, s01Clock} from './timing';
import {BitHome, CITIZEN_ORDER, DidSparkles, OnlookersP, P_CITIZENS, P_GOV, P_PIGEONS, PipP, P_NEAR, R_CITIZENS, R_GOV, R_NEAR, R_PIGEONS, R_PIP, S11Note, SB_SEED, SbPoint} from './cast';

const SUN = PLAZA.sun; // (720, 900) r155
const VP = PLAZA.vp as [number, number];
const HZ = PLAZA.horizon;
const MID = 3.4; // S01's SunPress ink

/** What the SET draws (as S01: S01_GOV minus the shutter / padlock / tag / glint events, which S01Shutter draws on
 *  top), with govB's dome lantern switched at DOME_LANTERN_R so the rewind relights it on 'there' before the lamp. */
const GOV_SET: Partial<Record<GovId, GovEvents>> = (() => {
  const strip = (e?: GovEvents): GovEvents => {
    const {shutterAt: _s, padlockAt: _p, tagAt: _t, glintAt: _g, ...rest} = e ?? {};
    return rest;
  };
  return {...S01_GOV, govA: strip(S01_GOV.govA), govB: {...strip(S01_GOV.govB), lanternOffAt: DOME_LANTERN_R}, govC: strip(S01_GOV.govC)};
})();

/** The REWIND glyph sits in the OPEN part of the disc (fix round 1: centred on the sun at full power-glyph size its back
 *  edge was tangent to govD's cornice strokes and its top-right corner cut by govD's overshoot): 0.9 x, up-left of the
 *  centre (sun-local px), so its back edge stays >= 8 px left of govD's cornice overshoots and its tip, nudges included,
 *  stays well above govB's cornice line. */
const REW = {k: 0.9, x: -20, y: -28} as const;

/** The sun's glyph: S01's own (S01Glyph, S01 clock) until 'before'; then on S12's clock the power glyph shrinks out, the
 *  bold cream REWIND glyph pops in (nudging left on 'there' / 'was' / 'even') and pops back to the power glyph on
 *  'fix.'; once that pop has settled the glyph is S01's own again (at W = 0: S01's frame-0 glyph, to the pixel).
 *  Fix round 2: each swap is SEQUENCED, never two glyphs in one frame: the outgoing glyph is drawn only before the
 *  incoming one's first frame (`rewindShow` / `powerShow`), and the incoming one enters mid-pop (timing.ts B). */
const Glyph: React.FC<{r: number; t: number}> = ({r, t}) => {
  if (t < B.powerOut || t >= B.powerHandBack) return <S01Glyph r={r} glintAt={S01B.glintPop} seed="s01/pwr" />;
  return (
    <TimeProvider global={t} offset={0}>
      {t < B.rewindShow ? <PowerGlyph r={r} outAt={B.powerOut} seed="s01/pwr" /> : null}
      {t >= B.rewindShow && t < B.powerShow ? <RewindGlyph r={r * REW.k} x={REW.x} y={REW.y} at={B.rewindIn} outAt={B.rewindOut} nudgeAt={[...B.rewindNudge]} seed="s12/rew" /> : null}
      {t >= B.powerShow ? <PowerGlyph r={r} at={B.powerIn} seed="s01/pwr" /> : null}
    </TimeProvider>
  );
};

export const PlazaRewind: React.FC = () => {
  const t = useTime(); // S12-local
  const W = s01Clock(t);
  const rew = inRewind(t);
  const citizens = rew ? R_CITIZENS : P_CITIZENS;
  const pigeons = rew ? R_PIGEONS : P_PIGEONS;
  const gov = rew ? R_GOV : P_GOV;
  const extra: Record<string, React.ReactNode> = {
    buildings: (
      <>
        {(['govC', 'govA', 'govB'] as const).map((id) => (
          <S01Shutter key={id} id={id} ev={gov[id]} />
        ))}
        <LanternOff r={DOME_GLASS} at={DOME_LANTERN_R} seed="s01/domeOff" />
        <DoorLanterns offAt={[S01B.lampOff, S01B.lampOff + 0.06]} />
        <S11Note t={t} />
        <DidSparkles t={t} />
        <BitHome t={t} />
      </>
    ),
    light: (
      <>
        {CITIZEN_ORDER.map((i) => {
          const sb = !rew && citizens[i].seed === SB_SEED;
          return (
            <React.Fragment key={i}>
              {sb ? <SbPoint p={citizens[i]} rim /> : null}
              <PlazaCitizen p={citizens[i]} vp={VP} horizon={HZ} />
              {sb ? <SbPoint p={citizens[i]} /> : null}
            </React.Fragment>
          );
        })}
      </>
    ),
    near: (
      <>
        <TreeTicks />
        {pigeons.map((p) => (
          <Pigeon key={p.seed} p={p} />
        ))}
        {rew ? (
          <TimeProvider global={pipClockR(t)} offset={0}>
            <PipS01 p={R_PIP} seed={S01_PIP_SEED} />
          </TimeProvider>
        ) : (
          <PipP t={t} />
        )}
        {(rew ? R_NEAR : P_NEAR).map((c) => (
          <NearObserver key={c.seed} p={c} />
        ))}
        {rew ? <Onlookers /> : <OnlookersP />}
        <S01Branch />
      </>
    ),
  };
  // S12's camera on every layer (S01's parallax exponents); ink factor 1 (S01 wraps with its dive compensation, which
  // is exactly 1 at t = 0: the same tree, so the seam frame matches)
  const wrap = (name: string, _nearness: number, node: React.ReactNode) => (
    <XG m={layerMat(t, name)}>
      <InkScale value={1}>
        {node}
        {extra[name] ?? null}
      </InkScale>
    </XG>
  );
  const sun = (
    <>
      <SunPress mode="release" at={S01B.rippleAt} cx={SUN.x} cy={SUN.y} r={SUN.r} width={MID} ripple={false}>
        <Sun cx={SUN.x} cy={SUN.y} r={SUN.r} drift={[0, 0]}>
          {(r: number) => <Glyph r={r} t={t} />}
        </Sun>
      </SunPress>
      <SunRipple cx={SUN.x} cy={SUN.y} r={SUN.r} at={S01B.rippleAt} />
      <PressTicks cx={SUN.x} cy={SUN.y} at={S01B.rippleAt} />
    </>
  );
  return (
    <TimeProvider global={W} offset={0}>
      <GovernmentPlaza
        state="frame0"
        sun={sun}
        gov={GOV_SET}
        windowSlot={S01_WINDOWS}
        civicOffAt={S01B.civicOff[0]}
        civicLanternsOffAt={S01B.civicLanterns[0]}
        citizensAt={false}
        onlookers={false}
        bit={false}
        lanternOffAt={S01B.lampOff}
        wrap={wrap}
        seed="plaza"
      />
    </TimeProvider>
  );
};
