// CineDemo — 18 s proof of the cinematic direction (cine lane): three full-bleed shots that make the viewer feel
// SMALL, in the reference's flat ink style. Preview: scripts/sheet.sh CineDemo 0 18 18 out.png
//   A (0-6 s)   Arcane vista: the mascot and a back-view figure on a rooftop ledge over an endless dusk city,
//               giant low sun, windows lighting up across the city, slow push-in.
//   B (6-12 s)  worm's-eye: a monumental government building towering over tiny people, light shaft, crane-up.
//   C (12-18 s) pull-back: from one lit window to a wall of thousands of windows going dark in waves.
import React from 'react';
import {useTime} from '../lib/time';
import {XG} from '../lib/xf';
import {palette} from '../lib/theme';
import {Person} from '../lib/kit';
import {Elephant} from '../lib/mascot';
import {
  BigSun,
  Birds,
  CAM,
  CineCamera,
  CineFrame,
  EndlessCity,
  Layer,
  Ledge,
  LightShaft,
  Monument,
  Quad,
  WindowCloseup,
  affineFromTri,
  layerScale,
  useCam,
  Shot,
  Sky,
  Stars,
  Streaks,
  TinyCrowd,
  TOD,
  WallOfWindows,
  windowQuad,
} from '../lib/cine';

// ---------------------------------------------------------------- A: vista

const HZ = 1010;

const ShotA: React.FC = () => {
  const t = useTime();
  const P = TOD.dusk;
  return (
    <CineCamera keys={[{t: 0, push: 0, anchor: [540, 1420], anchorDepth: -0.4}, {t: 6, push: 0.16, anchor: [540, 1420], anchorDepth: -0.4, ease: (x) => x}]} handheld={1.5} seed="A">
      <Layer depth={1}>
        <Sky tod={P} horizon={HZ} />
        <Stars tod={P} region={[-100, -100, 1180, 640]} at={0.3} span={5} n={70} />
        <Streaks y={HZ - 60} tod={P} n={5} />
        <BigSun cx={610} cy={HZ + 10} r={150} horizon={HZ + 40} tod={P} path={[{t: 0, y: HZ + 10}, {t: 6, y: HZ + 55}]} pulse={[1.1, 3.3]} />
        <Birds at={0.6} from={[-80, 760]} to={[1160, 620]} dur={6.5} n={5} size={16} />
      </Layer>
      <EndlessCity
        horizon={HZ}
        nearY={1640}
        rows={6}
        tod={P}
        seed="pilt"
        towers={0.1}
        beacons={0.9}
        rowProps={(r) => ({hRange: r.i < 2 ? [260, 700] : r.i < 4 ? [160, 480] : [90, 300]})}
        windows={{initial: 0.12, blinds: 0.12, events: [{at: 0.2, dur: 5.5, to: 'on', pattern: 'random', fraction: 0.55}, {at: 1.5, dur: 4, to: 'off', pattern: 'random', fraction: 0.06}]}}
      />
      <Layer depth={-0.4}>
        <Ledge y={1440} tod={P} floor={palette.tealDark} />
        <Person x={400} y={1452} s={1.35} seed="vista-fig" hair="short" body={palette.tealDark} hairColor={palette.ink} acc={['strap']} idle={1.2} />
        <Elephant x={600} y={1452} scale={1.0} pose="sit-back" t={t} seed={3} look={0.3} />
      </Layer>
    </CineCamera>
  );
};

// ---------------------------------------------------------------- B: worm's-eye monument

const ShotB: React.FC = () => {
  const t = useTime();
  const P = TOD.golden;
  return (
    <CineCamera keys={[{t: 0, y: 1260, rot: -0.8}, {t: 6, y: -560, rot: 0, ease: CAM.reveal}]} handheld={1.2} seed="B">
      <Layer depth={0.92}>
        <Sky tod={P} horizon={2300} span={2600} />
        <BigSun cx={790} cy={520} r={150} tod={P} glow={3} pulse={[4.6]} />
      </Layer>
      <Layer depth={0}>
        <rect x={-600} y={1850} width={2300} height={900} fill={P.cream} />
        <Monument cx={540} by={1860} bw={1750} ty={-1780} tod={P} people={46} seed="gov" />
        <TinyCrowd n={36} area={[-100, 1900, 1180, 2200]} horizon={1500} k={0.09} tod={P} walk={0.4} walkDir={-90} seed="plaza" />
        <LightShaft from={[1500, -1600]} angle={118} length={4200} w0={260} w1={1300} beams={3} color={palette.white} opacity={0.13} sweep={1.5} />
        <Birds at={2.2} from={[200, 700]} to={[1250, -300]} dur={3.2} n={6} size={20} />
      </Layer>
      <Layer depth={-0.5}>
        <Person x={170} y={2140} s={2.6} seed="b-near" hair="cap" body={palette.teal} idle={1} />
        <rect x={700} y={1640} width={600} height={500} fill={P.tan} />
        <Elephant x={840} y={1642} scale={1.1} pose="sit-back" t={t} seed={5} look={-0.4} />
      </Layer>
    </CineCamera>
  );
};

// ---------------------------------------------------------------- C: pull-back from one window

const WALL: Quad = [
  [-170, -1000],
  [690, 560],
  [690, 1240],
  [-170, 2600],
];
const ROWS = 80;
const COLS = 44;
const WFW = 0.42;
const WFH = 0.72;
const HERO: [number, number] = [40, 4];
const HERO_OFF = 5.45;

/** The wall's thin ink stays ~1.6 px on screen through a 30x pull-back. */
const ScreenInkWall: React.FC<{children: (w: number) => React.ReactNode}> = ({children}) => {
  const cam = useCam();
  return <>{children(1.6 / layerScale(cam, 0))}</>;
};

const ShotC: React.FC = () => {
  const t = useTime();
  const P = TOD.night;
  const hq = windowQuad(WALL, ROWS, COLS, HERO[0], HERO[1], WFW, WFH);
  const hc: [number, number] = [(hq[0][0] + hq[2][0]) / 2, (hq[0][1] + hq[2][1]) / 2];
  const CH = 760;
  const CW = Math.round((CH * Math.hypot(hq[1][0] - hq[0][0], hq[1][1] - hq[0][1])) / Math.hypot(hq[3][0] - hq[0][0], hq[3][1] - hq[0][1]));
  const place = affineFromTri([0, 0, CW, CH], hq[0], hq[1], hq[3]);
  return (
    <CineCamera keys={[{t: 0, zoom: 5, push: 0.833, anchor: hc, anchorTo: [540, 880]}, {t: 0.5, zoom: 5, push: 0.833, anchor: hc, anchorTo: [540, 880]}, {t: 4.4, zoom: 1, push: 0, anchor: hc, ease: CAM.reveal}]} handheld={0.6} seed="C">
      <Layer depth={1}>
        <Sky tod={P} horizon={1180} />
        <Stars tod={P} region={[500, -200, 1300, 1100]} n={90} at={0.5} span={3} />
        <BigSun cx={900} cy={1185} r={110} horizon={1180} tod={P} path={[{t: 0, y: 1185}, {t: 6, y: 1260}]} glow={3} />
      </Layer>
      <EndlessCity horizon={1180} nearY={1500} rows={4} farS={0.12} nearS={0.4} tod={P} seed="far" x0={500} x1={1500} haze={0.35} windows={{initial: 0.5, events: [{at: 3.5, dur: 2, to: 'off', pattern: 'sweep', dir: 180, fraction: 0.8}]}} />
      <Layer depth={0}>
        <ScreenInkWall>
          {(w) => (
            <WallOfWindows
              quad={WALL}
              rows={ROWS}
              cols={COLS}
              tod={P}
              initial={0}
              exclude={[HERO]}
              fw={WFW}
              fh={WFH}
              inkW={w}
              precision={3}
              events={[
                {at: 0.7, dur: 2.2, to: 'on', pattern: 'wave', origin: [HERO[1] / COLS, HERO[0] / ROWS], noise: 0.35, fraction: 0.93},
                {at: 3.3, dur: 1.7, to: 'off', pattern: 'wave', origin: [1, 0.45], noise: 0.25},
                {at: 4.0, dur: 1.3, to: 'off', pattern: 'wave', origin: [0.6, 0], noise: 0.3},
              ]}
            />
          )}
        </ScreenInkWall>
        <XG m={place}>
          <WindowCloseup w={CW} h={CH} tod={P} offAt={HERO_OFF} seed="hero" person={<Person x={CW * 0.3} y={CH * 0.93} s={1.25} seed="hero-p" hair="bun" body={palette.teal} />} />
        </XG>
      </Layer>
    </CineCamera>
  );
};

export const CineDemo: React.FC = () => (
  <CineFrame bg={palette.tealDark}>
    <Shot from={0} to={6}>
      <ShotA />
    </Shot>
    <Shot from={6} to={12}>
      <ShotB />
    </Shot>
    <Shot from={12} to={18}>
      <ShotC />
    </Shot>
  </CineFrame>
);
