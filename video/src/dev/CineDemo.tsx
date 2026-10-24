// CineDemo — 18 s proof of the cinematic direction (cine lane): three full-bleed shots that make the viewer feel
// SMALL, in the reference's flat ink style. Preview: scripts/sheet.sh CineDemo 0 18 18 out.png
//   A (0-6 s)   Arcane vista: the mascot and a back-view figure on a rooftop ledge over an endless dusk city,
//               giant low sun, colossal far towers, windows lighting up across the city, string lights, slow push-in.
//   B (6-12 s)  worm's-eye: a monumental government building towering over tiny people, light shaft, crane-up
//               reveal of the dome with the sun behind it.
//   C (12-18 s) pull-back: from one lit window (someone at a website) to a wall of thousands of windows that light
//               up, then go dark in waves; the hero window is the last one off.
// Cuts hide behind foreground wipes (something passes close to the lens).
import React from 'react';
import {useTime} from '../lib/time';
import {palette, stroke} from '../lib/theme';
import {XG} from '../lib/xf';
import {Person} from '../lib/kit';
import {Rise} from '../lib/motion';
import {Elephant, popIn} from '../lib/mascot';
import {SkyCaptions, CaptionBeat} from '../lib/Captions';
import {CaptionTone} from '../lib/theme';
import {
  affineFromTri,
  BigSun,
  Birds,
  CAM,
  CineCamera,
  CineFrame,
  SkyCloud,
  deep,
  EndlessCity,
  Layer,
  layerScale,
  Ledge,
  LightShaft,
  mix,
  Monument,
  Plinth,
  Quad,
  Rimmed,
  Shot,
  Sky,
  Stars,
  Streaks,
  StringLights,
  TinyCrowd,
  TOD,
  useCam,
  WallOfWindows,
  WindowCloseup,
  windowQuad,
  WipePass,
  Hills,
  PerspectiveStreet,
  Tower,
  Silhouette,
  RimLight,
  Glow,
  LitWindows,
} from '../lib/cine';

// ---------------------------------------------------------------- A: vista

const HZ = 1010;

const ShotA: React.FC = () => {
  const t = useTime();
  const P = TOD.dusk;
  return (
    <CineCamera keys={[{t: 0, push: 0, anchor: [560, 1180]}, {t: 6.4, push: 0.22, anchor: [560, 1180], ease: CAM.slow}]} handheld={1.5} seed="A">
      <Layer depth={1}>
        <Sky tod={P} horizon={HZ} />
        <Stars tod={P} region={[-100, -100, 1180, 560]} at={0.2} span={5.5} n={80} />
        <SkyCloud x={-40} y={560} w={330} tod={P} color={mix(P.teal, P.sage, 0.5)} drift={5} seed="ca1" />
        <SkyCloud x={720} y={690} w={250} tod={P} color={P.sage} drift={7} seed="ca2" />
        <Streaks y={HZ - 30} tod={P} n={4} color={P.horizonGlow} />
        <BigSun cx={610} cy={HZ + 20} r={150} horizon={HZ + 60} tod={P} path={[{t: 0, y: HZ + 20}, {t: 6, y: HZ + 70}]} beats={[0.32, {t: 1.33, amp: 0.1}]} glowSpread={1.1} />
        <Birds at={0.6} from={[-80, 780]} to={[1160, 600]} dur={6.5} n={5} size={16} />
      </Layer>
      <EndlessCity
        horizon={HZ}
        nearY={1640}
        rows={6}
        tod={P}
        seed="pilt"
        towers={0.1}
        beacons={0.9}
        rowProps={(r) => ({
          hRange: r.i < 2 ? [260, 700] : r.i < 4 ? [160, 480] : [90, 300],
          landmarks: r.i === 1 ? [{x: 330, w: 210, h: 3500, kind: 'spire'}, {x: 980, w: 170, h: 2600, kind: 'step'}] : r.i === 2 ? [{x: 770, w: 190, h: 2100, kind: 'tower'}] : undefined,
        })}
        windows={{initial: 0.12, blinds: 0.12, events: [{at: 0.2, dur: 5.5, to: 'on', pattern: 'random', fraction: 0.55}, {at: 1.5, dur: 4, to: 'off', pattern: 'random', fraction: 0.06}]}}
      />
      <Layer depth={-0.45}>
        <Ledge y={1450} tod={P} floor={deep.teal60} />
        <Rimmed color={palette.peach} dx={4} dy={-3}>
          <Person x={400} y={1462} s={1.4} seed="vista-fig" hair="short" body={deep.teal60} hairColor={palette.ink} acc={['strap']} idle={1.2} />
        </Rimmed>
        <Rimmed color={palette.peach} dx={3} dy={-4}>
          <Elephant x={612} y={1462} scale={1.0} pose="sit-back" t={t} seed={3} look={0.35} />
        </Rimmed>
      </Layer>
      <Layer depth={-0.8}>
        <StringLights x1={-80} y1={70} x2={1160} y2={150} sag={46} n={13} r={13} tod={P} on={{at: 0.8, dur: 1.4}} seed="slA" width={2.6} />
      </Layer>
    </CineCamera>
  );
};

// ---------------------------------------------------------------- B: worm's-eye monument

/** A clock in the pediment: the minute hand ticks every second (a one-frame pop per tick). */
const ClockEmblem: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => {
  const t = useTime();
  const tick = Math.floor(t * 1);
  const m = (-90 + 50 + tick * 6) * (Math.PI / 180);
  const h = (-90 + 300) * (Math.PI / 180);
  const hand = (a: number, l: number) => `M${x} ${y}L${(x + Math.cos(a) * l).toFixed(1)} ${(y + Math.sin(a) * l).toFixed(1)}`;
  return (
    <>
      <circle cx={x} cy={y} r={r * 0.82} fill="none" stroke={palette.ink} strokeWidth={stroke.inkHair} />
      <path d={hand(h, r * 0.42) + hand(m, r * 0.66)} stroke={palette.ink} strokeWidth={stroke.inkThin} strokeLinecap="round" />
    </>
  );
};

const ShotB: React.FC = () => {
  const t = useTime();
  const P = TOD.golden;
  return (
    <CineCamera keys={[{t: 0, y: 1260, rot: -0.8}, {t: 5.2, y: -540, rot: 0, ease: CAM.reveal}, {t: 6, y: -575, ease: CAM.settle}]} handheld={1.2} seed="B">
      <Layer depth={0.92}>
        <Sky tod={P} horizon={2300} span={2600} />
        <BigSun cx={790} cy={520} r={150} tod={P} glow={3} beats={[4.4, 5.3]} />
      </Layer>
      <Layer depth={0}>
        <rect x={-600} y={1850} width={2300} height={900} fill={P.cream} />
        <Monument cx={540} by={1860} bw={1750} ty={-1780} tod={P} people={46} seed="gov" emblem={(x, y, r) => <ClockEmblem x={x} y={y} r={r} />} />
        <TinyCrowd n={36} area={[-100, 1900, 1180, 2200]} horizon={1500} k={0.09} tod={P} walk={0.4} walkDir={-90} seed="plaza" at={0} span={1.6} />
        <LightShaft from={[1500, -1600]} angle={118} length={4200} w0={260} w1={1300} beams={3} color={palette.white} opacity={0.13} sweep={1.5} at={0.9} />
        <Birds at={2.0} from={[180, 760]} to={[1250, -300]} dur={3.2} n={7} size={20} />
        <Birds at={3.6} from={[900, 300]} to={[-200, -500]} dur={2.6} n={4} size={18} seed="b2" />
      </Layer>
      <Layer depth={-0.5}>
        <Person x={150} y={2080} s={2.3} seed="b-near" hair="cap" body={palette.teal} idle={1} />
        <Plinth x={850} y={1640} w={300} h={600} tod={P} />
        <Elephant x={850} y={1642} scale={1.1} pose="sit-back" t={t} seed={5} look={-0.4} />
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
  const pop = popIn(t, 4.15);
  return (
    <CineCamera keys={[{t: 0, zoom: 5, push: 0.833, anchor: hc, anchorTo: [540, 880]}, {t: 0.5, zoom: 5, push: 0.833, anchor: hc, anchorTo: [540, 880]}, {t: 4.4, zoom: 1, push: 0, anchor: hc, ease: CAM.reveal}]} handheld={0.6} seed="C">
      <Layer depth={1}>
        <Sky tod={P} horizon={1180} />
        <Stars tod={P} region={[500, -200, 1300, 1100]} n={90} at={0.5} span={3} />
        <BigSun cx={900} cy={1185} r={110} horizon={1180} tod={P} path={[{t: 0, y: 1185}, {t: 6, y: 1265}]} glow={3} />
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
        <Rise at={3.75} dist={420}>
          <Ledge y={1540} x0={620} x1={1180} top={24} face={90} tod={P} floor={deep.teal60} seed="ledgeC" />
          {pop.visible ? (
            <Rimmed color={P.glow} dx={-3} dy={-3}>
              <Elephant x={800} y={1552} scale={1.05 * pop.scale} squash={pop.squash} pose="sit-back" t={t} seed={7} look={-0.7} />
            </Rimmed>
          ) : null}
        </Rise>
      </Layer>
    </CineCamera>
  );
};

// ---------------------------------------------------------------- captions + film

const CAPTIONS: CaptionBeat[] = [
  {s: 0.25, lines: [{text: 'and there are about', s: 0.25}, {text: '22 million copies of PHP', s: 1.1}], highlights: [{text: '22 million', s: 1.25}]},
  {s: 3.6, lines: [{text: 'out there', s: 3.6}, {text: 'that could be hit.', s: 4.3}], highlights: [{text: 'hit', s: 4.95}]},
  {s: 6.35, lines: [{text: 'Government websites', s: 6.35}, {text: 'in four countries', s: 7.4}], highlights: [{text: 'four', s: 7.6}]},
  {s: 9.6, lines: [{text: 'Nobody hacked them.', s: 9.6}], highlights: [{text: 'Nobody', s: 9.75}]},
  {s: 12.35, lines: [{text: 'the safest thing', s: 12.35}, {text: 'is to switch it off', s: 13.3}], highlights: [{text: 'switch', s: 13.6}]},
  {s: 15.4, lines: [{text: "That's what those", s: 15.4}, {text: 'government sites did.', s: 16.0}], highlights: [{text: 'government', s: 16.1}]},
];
const tone = (T: number): CaptionTone => (T >= 6 && T < 12 ? 'dark' : 'light');

// ---------------------------------------------------------------- kit checks
// npx remotion still src/index.ts CineDemo out.png --frame=75 --props='{"mode":"street"}'   (or "tower")

const StreetCheck: React.FC = () => {
  const P = TOD.golden;
  const VP: [number, number] = [600, 980];
  return (
    <CineCamera keys={[{t: 0, push: 0}, {t: 6, push: 0.15}]} handheld={1}>
      <Layer depth={1}>
        <Sky tod={P} horizon={VP[1]} />
        <SkyCloud x={160} y={430} w={300} tod="day" drift={6} />
        <BigSun cx={VP[0]} cy={VP[1] - 40} r={150} horizon={VP[1] + 10} tod={P} />
        <Hills y={VP[1] + 10} amp={50} color={P.sand} seed="h1" />
      </Layer>
      <Layer depth={0}>
        <PerspectiveStreet vp={VP} tod={P} seed="main" crowd={60} lightsOn={{at: 1, dur: 2}} />
      </Layer>
    </CineCamera>
  );
};

const TowerCheck: React.FC = () => {
  const P = TOD.dusk;
  return (
    <CineCamera keys={[{t: 0, y: 1100}, {t: 6, y: 700}]}>
      <Layer depth={1}>
        <Sky tod={P} horizon={1700} span={1700} />
        <Stars tod={P} region={[0, 0, 1080, 900]} at={0} span={3} />
      </Layer>
      <Layer depth={0.3}>
        <Tower x={600} y={1950} wl={520} wr={430} top={-200} vpy={-4200} tod={P} floors={70} windows={{initial: 0.1, events: [{at: 0.5, dur: 4, to: 'on', pattern: 'rows', fraction: 0.6}]}} />
        <LightShaft from={[1100, -200]} angle={125} length={2600} w0={80} w1={700} beams={3} color={palette.peach} opacity={0.16} sweep={3} at={1} />
      </Layer>
      <Layer depth={0}>
        <Silhouette color={deep.teal60}>
          <Person x={300} y={1760} s={1.6} seed="sil1" legs />
          <Person x={420} y={1790} s={1.3} seed="sil2" legs acc={['backpack']} />
        </Silhouette>
        <TinyCrowd n={50} area={[0, 1700, 1080, 1900]} horizon={1300} k={0.06} tod={P} silhouette={deep.teal60} at={0.3} span={2} />
        <RimLight rect={[700, 1500, 300, 500]} side="right" width={10} color={palette.peach} />
        <Glow cx={900} cy={1400} r={10} rings={3} spread={2.5} color={P.glow} core={palette.peach} at={2} />
        <LitWindows grid={{x: 60, y: 1400, w: 220, h: 260, rows: 6, cols: 5}} initial={0} events={[{at: 0.5, dur: 2, to: 'on', pattern: 'wave', origin: [0, 1]}, {at: 4, dur: 1, to: 'off', pattern: 'rows'}]} ink={{}} dark={palette.tealDark} />
      </Layer>
    </CineCamera>
  );
};

export const CineDemo: React.FC<{mode?: 'demo' | 'street' | 'tower'}> = ({mode = 'demo'}) =>
  mode === 'street' ? (
    <CineFrame bg={palette.sky}>
      <StreetCheck />
    </CineFrame>
  ) : mode === 'tower' ? (
    <CineFrame bg={palette.tealDark}>
      <TowerCheck />
    </CineFrame>
  ) : (
  <CineFrame bg={palette.tealDark} overlay={<SkyCaptions beats={CAPTIONS} tone={tone} hookAtStart />}>
    <Shot from={0} to={6}>
      <ShotA />
    </Shot>
    <Shot from={6} to={12}>
      <ShotB />
    </Shot>
    <Shot from={12} to={18}>
      <ShotC />
    </Shot>
    <WipePass at={5.72} dur={0.56} dir="right" color={deep.teal60} rim={palette.peach} seed="w1" />
    <WipePass at={11.72} dur={0.56} dir="left" color={palette.tealDark} rim={palette.sage} seed="w2" />
  </CineFrame>
  );
