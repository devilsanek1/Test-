// sets/catalog.tsx — every set with a label, its sky colour and two renderers:
//   thumb()   = the set at camera rest in a representative state (no World: draw your own sky rect, then this;
//               the props lane's SharedKitSheet uses it for the set thumbnails, scaled into a cell)
//   preview() = a full <World> demo with storyboard-v1 demo times (the SetsPreview harness)
// The demo times live here (and only here): sets never hard-code a beat time.

import React from 'react';
import {palette, skies} from '../../../lib/theme';
import {GovernmentPlaza, PLAZA, PLAZA_REST, plazaShutdownGov} from './GovernmentPlaza';
import {StoopBeats, StoopStreet, STOOP} from './StoopStreet';
import {BlueprintStreet, BLUEPRINT} from './BlueprintStreet';
import {BlueprintWall, BLUEPRINT_WALL} from './BlueprintWall';
import {MakersLane, MAKERS_LANE, Workshop, WORKSHOP_CORNER} from './MakersLane';
import {NoticeboardCorner, NOTICE_CORNER, TelephoneWires, WIRES} from './NoticeboardCorner';
import {DomeCity, DomeTallies, DOME} from './DomeCity';
import {TerraceHill, TerraceRings, TERRACE, TERRACE_FLAT} from './TerraceHill';
import {OldQuarter, OLD_QUARTER} from './OldQuarter';
import {DemoSun, DemoWorld} from './preview/demo';
import {mat, XG} from '../../../lib/xf';
import {ease as E, useTime} from '../../../lib/time';
import {Tod} from '../../../lib/tod';

/** Golden-hour thumbnails: the same relight a scene's World applies (light fields one step warmer). */
const Golden: React.FC<{children?: React.ReactNode}> = ({children}) => <Tod value="golden">{children}</Tod>;

/** Camera matrix: world point (x, y) at screen centre, zoom z. */
export const camMat = (x: number, y: number, z: number) => mat.compose(mat.translate(540, 960), mat.scale(z), mat.translate(-x, -y));

/** Demo tally beat: one mark every 0.18 s from 1.7 s (13 marks). */
const TallyClock: React.FC = () => {
  const t = useTime();
  return <DomeTallies n={Math.min(13, Math.max(0, (t - 1.7) / 0.18))} />;
};

export type SetEntry = {id: string; label: string; sky: string; thumb: () => React.ReactNode; preview: (variant?: string) => React.ReactNode};

const S01_GOV = {
  govA: {chromeAt: 0.54, screenOnAt: 0.9, shutterAt: 2.4, offAt: 2.45, tagAt: 3.4, padlockAt: 3.64, glintAt: 4.28},
  govB: {chromeAt: 0.46, screenOnAt: 0.94, shutterAt: 2.82, offAt: 2.87, tagAt: 3.45, padlockAt: 3.72, glintAt: 4.28},
  govC: {chromeAt: 0.62, screenOnAt: 0.98, shutterAt: 3.04, offAt: 3.09, tagAt: 3.5, padlockAt: 3.8, glintAt: 4.28},
  govD: {chromeAt: 0.7, screenOnAt: 1.02, shutterAt: 3.25, offAt: 3.3, tagAt: 3.55, padlockAt: 3.88, glintAt: 4.28},
};

/** Storyboard v3 S01 on the recorded take (scene seconds): frame 0 = the press (govB's screen a bright line), the
 *  power-off wave (govA 'all', govC 'over', the civic skyline 'Europe'), shutters ('shut', 'down', govC half on 'bunch'),
 *  padlocks, lettered tags, govB's lantern on 'purpose'. */
const S01_V3 = {
  govA: {screenOffAt: 0.63, shutterAt: 1.98, offAt: 2.12, padlockAt: 3.44, tagAt: 3.74},
  govB: {screenOffAt: 0.0, shutterAt: 1.71, offAt: 1.85, padlockAt: 3.38, tagAt: 3.69, lanternOffAt: 3.96},
  govC: {screenOffAt: 0.89, shutterAt: 2.35, shutterStop: 0.5, padlockAt: 3.5, tagAt: 3.79},
};
/** Storyboard v3 S12 (scene seconds, recorded take): the shut-down state at the cut, then the stepped rewind from
 *  'before' (1.55) to one step before the press (2.85). */
const S12_V3 = (() => {
  const g = plazaShutdownGov(-1);
  return {
    govA: {...g.govA, tagOutAt: 1.55, padlockOutAt: 1.7, liftAt: 2.15, onAt: 2.4, screenOnAt: 2.57},
    govB: {...g.govB, tagOutAt: 1.6, padlockOutAt: 1.75, lanternOnAt: 1.86, liftAt: 2.23, onAt: 2.48, screenLineAt: 2.85},
    govC: {...g.govC, tagOutAt: 1.65, padlockOutAt: 1.8, liftAt: 2.07, screenOnAt: 2.4},
  };
})();

export const SET_CATALOG: SetEntry[] = [
  {
    id: 'plaza',
    label: 'GovernmentPlaza',
    sky: skies.day,
    thumb: () => <GovernmentPlaza state="built" sun={<DemoSun cx={PLAZA.sun.x} cy={PLAZA.sun.y} r={PLAZA.sun.r} glyph />} pennantsAt />,
    preview: (v) => (
      <DemoWorld push={v === undefined || v === 'built'}>
        {v === 'endBuilt' || v === 'endOff' ? (
          <GovernmentPlaza state={v === 'endOff' ? 'off' : 'built'} cascadeAt={v === 'endOff' ? undefined : 0.03} gov={v === 'endOff' ? undefined : S01_GOV} pennantsAt={v === 'endOff' ? undefined : [1.23, 1.38, 1.53, 1.68]} lanternOffAt={v === 'endOff' ? undefined : 3.25} pigeonsAt={v === 'endOff' ? undefined : 1.7} pigeonsFlyAt={v === 'endOff' ? undefined : 3.3} sun={<DemoSun cx={PLAZA.sun.x} cy={PLAZA.sun.y} r={PLAZA.sun.r} glyph />} />
        ) : v === 'f0built' || v === 'f0line' ? (
          <GovernmentPlaza state={v === 'f0line' ? 'lineArt' : 'built'} cascadeAt={v === 'f0line' ? undefined : 0.03} gov={v === 'f0line' ? undefined : S01_GOV} pennantsAt={v === 'f0line' ? undefined : [1.23, 1.38, 1.53, 1.68]} pigeonsAt={v === 'f0line' ? undefined : 1.7} sun={<DemoSun cx={PLAZA_REST.sunFrame0.x} cy={PLAZA_REST.sunFrame0.y} r={PLAZA_REST.sunFrame0.r} glyph />} />
        ) : v === 'closeup' || v === 'dive' ? (
          <XG m={v === 'closeup' ? camMat(PLAZA.closeup.cam[0], PLAZA.closeup.cam[1], PLAZA.closeup.zoom) : camMat(PLAZA.dive.cam[0], PLAZA.dive.cam[1], PLAZA.dive.zoom)}>
            <GovernmentPlaza state="built" detail="close" gov={{govB: {shutterAt: 2.0, padlockAt: 2.5, tagAt: 2.3}}} sun={<DemoSun cx={PLAZA.sun.x + 40} cy={PLAZA.sun.y - 40} r={110 / PLAZA.closeup.zoom} glyph />} />
          </XG>
        ) : v === 'v3' ? (
          <GovernmentPlaza state="frame0" gov={S01_V3} civicOffAt={1.16} civicLanternsOffAt={1.41} phonesAt={1.41} phonesDownAt={3.04} lanternOffAt={2.69} pigeonsAt={0.89} pigeonsFlyAt={2.75} sun={<DemoSun cx={PLAZA.sun.x} cy={PLAZA.sun.y} r={PLAZA.sun.r} glyph />} />
        ) : v === 'rewind' ? (
          <GovernmentPlaza state="built" gov={S12_V3} idleOffset={-3.2} civicOffAt={-1} civicOnAt={2.24} civicLanternsOffAt={-1} lanternOffAt={-1} lanternOnAt={1.94} phonesAt={-1} phonesDownAt={0.86} sun={<DemoSun cx={PLAZA.sun.x} cy={PLAZA.sun.y} r={PLAZA.sun.r} glyph />} />
        ) : v === 'lineArt' ? (
          <GovernmentPlaza state="lineArt" sun={<DemoSun cx={PLAZA_REST.sunFrame0.x} cy={PLAZA_REST.sunFrame0.y} r={PLAZA_REST.sunFrame0.r} glyph />} />
        ) : v === 'off' ? (
          <GovernmentPlaza state="off" sun={<DemoSun cx={PLAZA.sun.x} cy={PLAZA.sun.y} r={PLAZA.sun.r} glyph />} />
        ) : (
          <GovernmentPlaza
            state="built"
            cascadeAt={0.03}
            gov={S01_GOV}
            pennantsAt={[1.23, 1.38, 1.53, 1.68]}
            citizensAt={1.06}
            phonesAt={2.05}
            lanternOffAt={3.25}
            pigeonsAt={1.7}
            pigeonsFlyAt={3.3}
            sun={<DemoSun cx={PLAZA.sun.x} cy={PLAZA.sun.y} r={PLAZA.sun.r} glyph />}
          />
        )}
      </DemoWorld>
    ),
  },
  {
    id: 'stoop',
    label: 'StoopStreet',
    sky: skies.day,
    thumb: () => <StoopStreet sun={<DemoSun cx={720} cy={850} r={110} />} heroSlot={<StoopBeats magnifierAt={-1} wrenchAt={-1} />} />,
    preview: (v) =>
      v === 'night' ? (
        <DemoWorld sky={skies.night}>
          <StoopStreet tod="night" sun={null} heroSlot={<StoopBeats magnifierAt={-1} wrenchAt={-1} checkAt={2.6} peachAt={2.7} ledgeAt={3.2} />} />
        </DemoWorld>
      ) : v === 'tower' ? (
        <DemoWorld>
          <StoopStreet sun={<DemoSun cx={720} cy={850} r={110} />} heroSlot={<StoopBeats magnifierAt={-1} wrenchAt={-1} towerAt={0.5} towerDownAt={3.0} />} season={[{t: 0, s: 'green'}, {t: 3.5, s: 'peach'}, {t: 3.6, s: 'tan'}, {t: 3.7, s: 'bare'}]} ivy={0.6} heroLock={{cobwebAt: 3.2}} />
        </DemoWorld>
      ) : (
        <DemoWorld push>
          <StoopStreet drawAt={v === 'draw' ? 0.2 : undefined} sun={<DemoSun cx={720} cy={850} r={110} />} stoop={{step1At: 1.9, step2At: 2.3}} heroSlot={<StoopBeats magnifierAt={2.4} wrenchAt={3.1} />} />
        </DemoWorld>
      ),
  },
  {
    id: 'blueprint',
    label: 'BlueprintStreet',
    sky: skies.day,
    thumb: () => <BlueprintStreet sun={<DemoSun cx={690} cy={700} r={110} />} />,
    preview: (v) =>
      v === 'closeup' ? (
        <DemoWorld>
          <XG m={camMat(BLUEPRINT.closeup.cam[0], BLUEPRINT.closeup.cam[1], BLUEPRINT.closeup.zoom)}>
            <BlueprintStreet sun={<DemoSun cx={720} cy={750} r={55} />} lock={{screwsOutAt: 1, coverOpenAt: 1.3, boltTestAt: 1.8, gapMarkAt: 2.2}} />
          </XG>
        </DemoWorld>
      ) : (
        <DemoWorld push>
          <BlueprintStreet
            sun={<DemoSun cx={690} cy={700} r={110} />}
            gridAt={0.1}
            stampAt={0.8}
            popAt={{L1: 1.2, R1: 1.26, L2: 1.32, R2: 1.38, L3: 1.44, R3: 1.5, L4: 1.56, R4: 1.62, L5: 1.68}}
            plaqueAt={{P: 2.4, L1: 2.48, R1: 2.56, L2: 2.64, R2: 2.72, L4: 2.8, R3: 2.88, L3: 3.1, L5: 3.12, R4: 3.14}}
            ventAt={2.0}
            signSwingAt={2.1}
          />
        </DemoWorld>
      ),
  },
  {
    id: 'wall',
    label: 'BlueprintWall',
    sky: skies.day,
    thumb: () => <BlueprintWall sun={<DemoSun cx={930} cy={725} r={110} />} />,
    preview: (v) => (
      <DemoWorld>
        <XG m={camMat(540, 960, 1.08)}>
          <BlueprintWall drawAt={v === 'draw' ? 0.3 : undefined} sun={<DemoSun cx={BLUEPRINT_WALL.sun.x} cy={BLUEPRINT_WALL.sun.y} r={110} />} />
        </XG>
      </DemoWorld>
    ),
  },
  {
    id: 'lane',
    label: 'MakersLane',
    sky: skies.golden,
    thumb: () => (
      <Golden>
        <MakersLane sun={<DemoSun cx={MAKERS_LANE.sun.x} cy={MAKERS_LANE.sun.y} r={120} />} />
      </Golden>
    ),
    preview: (v) =>
      v === 'corner' ? (
        <DemoWorld tod="golden">
          <Workshop layout={WORKSHOP_CORNER} blind="down" signSwingAt={0.5} doorOpenAt={2.5} />
        </DemoWorld>
      ) : (
        <DemoWorld tod="golden">
          <MakersLane sun={<DemoSun cx={MAKERS_LANE.sun.x} cy={MAKERS_LANE.sun.y} r={120} />} curtainsAt={0.6} workshop={{glowAt: 1.0, makersAt: 1.0, blindDownAt: 2.4, signSwingAt: 1.6, slotClickAt: 1.9}} />
        </DemoWorld>
      ),
  },
  {
    id: 'corner',
    label: 'NoticeboardCorner',
    sky: skies.golden,
    thumb: () => (
      <Golden>
        <NoticeboardCorner sun={<DemoSun cx={NOTICE_CORNER.sun.x} cy={NOTICE_CORNER.sun.y} r={110} />} />
      </Golden>
    ),
    preview: () => (
      <DemoWorld tod="golden">
        <NoticeboardCorner sun={<DemoSun cx={NOTICE_CORNER.sun.x} cy={NOTICE_CORNER.sun.y} r={110} />} board={{riseAt: 0.3, railLightAt: 1.2}} readers={{riseAt: 0.6, phonesAt: 2.0}} workshop={{signSwingAt: 1.0, doorOpenAt: 3.0}} pigeonsFlyAt={3.4} />
      </DemoWorld>
    ),
  },
  {
    id: 'dome',
    label: 'DomeCity',
    sky: skies.golden,
    thumb: () => (
      <Golden>
        <DomeCity sun={<DemoSun cx={DOME.sun.x} cy={DOME.sun.y} r={165} />} searchAt={-1} />
        <DomeTallies n={12} />
      </Golden>
    ),
    preview: (v) => (
      <DemoWorld tod={v === 'dusk' ? 'dusk' : 'golden'}>
        <XG m={v === 'crane' ? camMat(540, 1260, 1.3) : v === 'push' ? camMat(480, 1040, 1.15) : mat.I}>
          <DomeCity sun={<DemoSun cx={DOME.sun.x} cy={DOME.sun.y} r={165} />} domeAt={0.2} towerAt={1.2} searchAt={1.6} dotsAt={0.4} duskAt={v === 'dusk' ? 0 : undefined} />
          <TallyClock />
          <TelephoneWires spec={WIRES.S08} />
        </XG>
      </DemoWorld>
    ),
  },
  {
    id: 'terrace',
    label: 'TerraceHill',
    sky: skies.day,
    thumb: () => (
      <>
        <TerraceHill flagAt={-1} sun={<DemoSun cx={TERRACE.sun.x} cy={TERRACE.sun.y} r={TERRACE.sun.r} />} />
        <TerraceRings />
      </>
    ),
    preview: (v) => {
      // demo pull-back 6.0 -> 1.0 over 2.2 s (log-space zoom), anchored on house #4 like the storyboard camera
      const Pull: React.FC = () => {
        const t = useTime();
        if (v === 'flat')
          return <TerraceHill mode="flat" plaqueWaveAt={0.5} bitWaveAt={1.0} flagAt={1.4} sun={<DemoSun cx={TERRACE_FLAT.sun.x} cy={TERRACE_FLAT.sun.y} r={TERRACE_FLAT.sun.r} />} />;
        const q = v === 'match' ? 0 : v === 'rest' ? 1 : E.inOutSine(Math.min(1, Math.max(0, (t - 0.3) / 2.2)));
        const z = Math.exp(Math.log(6) * (1 - q));
        const cx = 540;
        const cy = 1407 + (960 - 1407) * q;
        return (
          <XG m={camMat(cx, cy, z)}>
            <TerraceHill revealFloor={TERRACE.revealFloor} plaqueWaveAt={2.6} bitWaveAt={3.2} flagAt={2.9} extendAt={3.4} sun={<DemoSun cx={700} cy={760} r={150} />} />
            <TerraceRings at={3.6} />
          </XG>
        );
      };
      return (
        <DemoWorld>
          <Pull />
        </DemoWorld>
      );
    },
  },
  {
    id: 'old',
    label: 'OldQuarter',
    sky: skies.golden,
    thumb: () => (
      <Golden>
        <OldQuarter sun={<DemoSun cx={OLD_QUARTER.sun.x} cy={OLD_QUARTER.sun.y} r={110} />} />
      </Golden>
    ),
    preview: (v) => (
      <DemoWorld tod="golden">
        {v === 'unbuild' ? (
          <OldQuarter sun={<DemoSun cx={OLD_QUARTER.sun.x} cy={OLD_QUARTER.sun.y} r={110} />} board={{}} audience outAt={0.5} outDur={0.6} />
        ) : v === 'board' ? (
          <XG m={camMat(550, 1020, 1.12)}>
            <OldQuarter sun={<DemoSun cx={530} cy={725} r={110 / 1.12} />} board={{riseAt: 0.3, railLightAt: 0.8, paneDarkAt: 2.0, pane2ScaleInAt: 2.4}} audience={{riseAt: 0.5}} />
          </XG>
        ) : (
          <OldQuarter sun={<DemoSun cx={OLD_QUARTER.sun.x} cy={OLD_QUARTER.sun.y} r={110} />} sitePopAt={[0.3, 0.6, 0.9]} plaqueSwingAt={1.4} oldPlaque={{flipOldAt: 2.2, cobwebAt: 2.8, dustAt: 2.9, caneAt: 3.1}} />
        )}
      </DemoWorld>
    ),
  },
];

void palette;
void STOOP;
