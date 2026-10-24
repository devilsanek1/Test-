// CineDemo — 22 s proof of the cinematic direction (cine lane), with the balance note's dosing: peak, baseline, peak,
// peak, and the sun hopping from shot to shot. Preview: scripts/sheet.sh CineDemo 0 21.9 24 out.png
//   A (0-5.6 s)    PEAK, Arcane vista from a height: a back-view observer and the mascot on a rooftop parapet (cut by
//                  the bottom edge) over an endless dusk city that builds row by row, a half-set r 300 sun behind a
//                  colossal stepped tower; the push is anchored on the far city, so the world grows, not the observer.
//   D (5.4-9.9)    BASELINE, reference 2's eye-level street at golden hour: one 0.3 H back-view figure cut by the left
//                  edge, a queue shrinking to the vanishing point, the mascot at people's feet, sun r 110, 5 % push-in.
//   B (9.6-15.9)   PEAK, worm's-eye: a monumental government building BACKLIT by the sun (flat shadow fields + peach
//                  rim, so the captions sit on calm fields), columns popping in, people rising on the steps, a slow
//                  crane up from the plaza to the dome.
//   C (15.6-22)    PEAK, pull-back from one lit window (someone at a website) to a wall of thousands of windows that light
//                  up, then go dark in waves; the hero window is the last one off. Neighbours are close-ups while big.
// Cuts ride on the edge of something passing the lens (WipeCut: a column, a passer-by).
// Check modes (props): {mode: 'street'} | {mode: 'tower'} | {mode: 'loop'} (un-build + loop seam) and {lock: true}
// (camera locked, for event-density checks).
import React, {createContext, useContext} from 'react';
import {useTime} from '../lib/time';
import {bez} from '../lib/spec';
import {palette, stroke} from '../lib/theme';
import {XG} from '../lib/xf';
import {Person} from '../lib/kit';
import {Rise} from '../lib/motion';
import {Look, useExit} from '../lib/exit';
import {Standalone} from '../lib/Film';
import {Elephant, ElephantTimeline, popIn} from '../lib/mascot';
import {SkyCaptions, CaptionBeat, ToneRegion} from '../lib/Captions';
import {CaptionTone} from '../lib/theme';
import {
  affineFromTri,
  Balustrade,
  BigSun,
  Birds,
  CAM,
  CamKey,
  CineCamera,
  CineCameraProps,
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
  project,
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
  wallCellOn,
  wallQuadVP,
  WindowCloseup,
  windowQuad,
  WipeCut,
  wipeEdge,
  Hills,
  PerspectiveStreet,
  Tower,
  Silhouette,
  RimLight,
  Glow,
  LitWindows,
  camAt,
  passerPath,
  persp1,
  PERSON_FEET,
  PERSON_H,
} from '../lib/cine';

// ---------------------------------------------------------------- camera lock (density checks)

const LockCtx = createContext(false);
/** CineCamera that holds its first key when the demo runs with {lock: true}. */
const Cam: React.FC<CineCameraProps> = (p) => {
  const lock = useContext(LockCtx);
  return <CineCamera {...p} keys={lock && p.keys?.length ? [p.keys[0]] : p.keys} handheld={lock ? 0 : p.handheld} />;
};

/** The mascot follows the un-build (it ignores exit by itself: drive draw = 1 - exit). */
const Mascot: React.FC<React.ComponentProps<typeof Elephant>> = (p) => {
  const e = useExit();
  return <Elephant {...p} draw={Math.max(0, 1 - e * 1.6)} />;
};

// ---------------------------------------------------------------- timeline

const CUT_AD = {at: 5.35, dur: 0.55};
const CUT_DB = {at: 9.6, dur: 0.5};
const CUT_BC = {at: 15.6, dur: 0.55};
const T_A = [0, CUT_AD.at + CUT_AD.dur] as const;
const T_D = [CUT_AD.at, CUT_DB.at + CUT_DB.dur] as const;
const T_B = [CUT_DB.at, CUT_BC.at + CUT_BC.dur] as const;
const T_C = [CUT_BC.at, 22] as const;

// ---------------------------------------------------------------- A: vista (peak)

const HZ = 1010;
const A_KEYS: CamKey[] = [
  {t: 0, push: 0, zoom: 1, anchor: [600, 1000], anchorDepth: 0.85},
  {t: 5.9, push: 0.14, zoom: 1.04, anchor: [600, 1000], anchorDepth: 0.85, ease: bez(0.45, 0, 0.15, 1)},
];
/** Where A's sun is on screen at its last frame (the next shot's sun starts there). */
const A_SUN = {x: 600, y: HZ + 30, r: 300, set: HZ + 80};

const ShotA: React.FC = () => {
  const t = useTime();
  const P = TOD.dusk;
  return (
    <Cam keys={A_KEYS} handheld={1.2} seed="A">
      <Layer depth={1}>
        <Sky tod={P} horizon={HZ} />
        <Stars tod={P} region={[-100, -100, 1180, 900]} at={0.1} span={4.5} n={90} />
        <SkyCloud x={-40} y={720} w={330} tod={P} color={mix(P.teal, P.sage, 0.5)} drift={5} seed="ca1" at={0.6} />
        <SkyCloud x={760} y={700} w={250} tod={P} color={P.sage} drift={7} seed="ca2" at={1.4} />
        <Streaks y={HZ - 30} tod={P} n={4} color={P.horizonGlow} />
        <BigSun cx={A_SUN.x} cy={A_SUN.y} r={A_SUN.r} horizon={HZ + 80} tod={P} path={[{t: 0, y: A_SUN.y}, {t: 6, y: A_SUN.set}]} beats={[1.25, {t: 4.4, amp: 0.08}]} drift={[0, 0]} />
        <Birds at={2.4} from={[-80, 760]} to={[1160, 640]} dur={4.5} n={5} size={16} />
      </Layer>
      <EndlessCity
        horizon={HZ}
        nearY={1600}
        rows={6}
        tod={P}
        seed="pilt"
        towers={0.1}
        beacons={0.9}
        build={{at: -2.6, span: 1.0, rowStagger: 0.45, order: 'center'}}
        rowProps={(r) => ({
          hRange: r.i < 2 ? [260, 700] : r.i < 4 ? [160, 480] : [90, 300],
          // ONE colossal stepped tower in the far city, wider than everything, cut by the sun
          landmarks: r.i === 1 ? [{x: 300, w: 1150, h: 3000, kind: 'step'}] : r.i === 2 ? [{x: 860, w: 230, h: 1500, kind: 'tower'}] : undefined,
        })}
        windows={{
          initial: 0.1,
          blinds: 0.12,
          events: [
            {at: 1.5, dur: 4.2, to: 'on', pattern: 'random', fraction: 0.45},
            // counting bursts on the words: a sweep of lights across the city on "22 million", another on "hit"
            {at: 1.15, dur: 0.5, to: 'on', pattern: 'sweep', dir: 0, fraction: 0.18},
            {at: 4.25, dur: 0.45, to: 'on', pattern: 'sweep', dir: 180, fraction: 0.2},
            {at: 2.8, dur: 3, to: 'off', pattern: 'random', fraction: 0.05},
          ],
        }}
      />
      <Layer depth={-0.15}>
        <Ledge y={1690} top={30} face={260} tod={P} floor={palette.tealDark} />
        <ElephantTimeline x={650} y={1696} scale={0.95} t={t} seed={3} look={0.3} keys={[{t: 0, pose: 'sit-back'}, {t: 4.3, pose: 'sit-back', look: -0.5}]} />
      </Layer>
      <Layer depth={-0.2}>
        <Rimmed color={palette.peach} dx={4} dy={-3}>
          <Person x={330} y={1915} s={2.6} seed="vista-fig" hair="short" body={palette.teal} hairColor={palette.ink} acc={['strap']} idle={1.6} ink={stroke.inkBold} />
        </Rimmed>
      </Layer>
      <Layer depth={-0.8}>
        <StringLights x1={-80} y1={60} x2={1160} y2={130} sag={46} n={13} r={14} tod={P} on={{at: 2.0, dur: 1.2}} seed="slA" width={2.6} at={0.3} />
      </Layer>
    </Cam>
  );
};

// ---------------------------------------------------------------- D: eye-level street (baseline)

const D_VP: [number, number] = [560, 800];
/** Street camera: eye a bit above head height (reference 2: foreground heads sit just under the horizon). */
const D_ST = {f: 900, camH: 260, road: 210, walk: 300};
const dP = persp1({vx: D_VP[0], vy: D_VP[1], f: D_ST.f, camH: D_ST.camH});
/** A queue on the path, receding to the vanishing point (feet on the ground plane, heights from the same camera). */
const D_QUEUE = Array.from({length: 13}, (_, i) => {
  const z = 420 * Math.pow(1.24, i);
  const [x, y, k] = dP(95 + (i % 2 ? 26 : -18), 0, z);
  return {x, y, h: 170 * k};
});

const ShotD: React.FC = () => {
  const t = useTime();
  const P = TOD.golden;
  const [hx, hy, hk] = dP(-140, 0, 245); // the hero: 0.32 H, cut by the left edge
  const [mx, my, mk] = dP(-10, 0, 262); // the mascot at their feet
  return (
    <Cam keys={[{t: 0, zoom: 1}, {t: 4.5, zoom: 1.05, ease: CAM.slow}]} handheld={0.8} seed="D">
      <Layer depth={1}>
        <Sky tod={P} horizon={D_VP[1]} />
        <SkyCloud x={330} y={175} w={200} tod="day" drift={5} seed="dc" at={0.5} />
        <BigSun cx={A_SUN.x} cy={A_SUN.set} r={A_SUN.r} horizon={D_VP[1] + 12} tod={P} path={[{t: 0, x: A_SUN.x, y: A_SUN.set + 26, r: A_SUN.r * 1.04}, {t: 0.75, x: D_VP[0], y: D_VP[1] - 95, r: 110, ease: bez(0.3, 1.4, 0.5, 1)}]} beats={[1.65, {t: 3.25, amp: 0.1}]} glow={0} />
        <Hills y={D_VP[1] + 14} amp={34} color={palette.sage} seed="dh" />
        <Birds at={1.0} from={[1120, 680]} to={[-60, 630]} dur={3.2} n={4} size={14} />
      </Layer>
      <Layer depth={0}>
        <PerspectiveStreet
          vp={D_VP}
          {...D_ST}
          tod={P}
          seed="dmain"
          crowd={22}
          heights={[330, 430]}
          poleH={470}
          poles={900}
          lightsOn={{at: 1.8, dur: 1.6}}
          windows={{initial: 0.08, events: [{at: 1.2, dur: 2.8, to: 'on', pattern: 'random', fraction: 0.35}]}}
        />
        {/* the queue keeps growing toward the vanishing point while the narrator speaks */}
        <TinyCrowd spots={D_QUEUE} tod={P} at={0.2} span={3.4} order="front" walk={0} seed="queue" />
        <ElephantTimeline x={mx} y={my} scale={(0.27 * 170 * mk) / 96} t={t} seed={4} look={0.25} keys={[{t: 0, pose: 'sit-back'}, {t: 3.1, pose: 'sit-back', look: -0.6}]} />
      </Layer>
      <Layer depth={-0.05}>
        <Rise at={0.15} dist={300}>
          <Person x={hx} y={hy - PERSON_FEET * ((170 * hk) / PERSON_H)} s={(170 * hk) / PERSON_H} legs seed="d-hero" hair="beanie" body={palette.teal} hairColor={palette.brown} acc={['backpack']} idle={1.2} ink={stroke.inkBold} />
        </Rise>
      </Layer>
      <Layer depth={-0.6}>
        <StringLights x1={-120} y1={40} x2={1200} y2={150} sag={60} n={11} r={16} tod={P} lit={false} seed="slD" width={2.8} />
      </Layer>
    </Cam>
  );
};

// ---------------------------------------------------------------- B: backlit monument (peak)

/** A clock on the drum: the minute hand ticks every second (a one-frame pop per tick). */
const ClockEmblem: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => {
  const t = useTime();
  const tick = Math.floor(t * 1);
  const m = (-90 + 50 + tick * 6) * (Math.PI / 180);
  const h = (-90 + 300) * (Math.PI / 180);
  const hand = (a: number, l: number) => `M${x} ${y}L${(x + Math.cos(a) * l).toFixed(1)} ${(y + Math.sin(a) * l).toFixed(1)}`;
  return <path d={hand(h, r * 0.42) + hand(m, r * 0.66)} stroke={palette.ink} strokeWidth={stroke.inkThin} strokeLinecap="round" />;
};

const MON = {cx: 540, by: 1900, bw: 1600, ty: 150, taper: 0.52};
const B_KEYS: CamKey[] = [
  {t: 0, y: 1260, zoom: 1.06, rot: -0.6},
  {t: 5.9, y: 960, zoom: 1, rot: 0, ease: CAM.reveal},
];

const ShotB: React.FC = () => {
  const t = useTime();
  const P = TOD.golden;
  const sun0 = {x: D_VP[0], y: D_VP[1] - 45};
  return (
    <Cam keys={B_KEYS} handheld={0.8} seed="B">
      <Layer depth={0.92}>
        <Sky tod={P} horizon={2400} span={900} />
        <BigSun cx={sun0.x} cy={sun0.y} r={115} tod={P} glow={2} path={[{t: 0, x: sun0.x, y: sun0.y + 30, r: 115}, {t: 1.1, x: 860, y: 830, r: 150, ease: bez(0.4, 0, 0.3, 1.25)}]} beats={[1.5, {t: 3.65, amp: 0.1}]} />
        <Birds at={1.6} from={[1150, 230]} to={[-150, 120]} dur={3.4} n={6} size={18} />
      </Layer>
      <Layer depth={0}>
        {/* plaza */}
        <rect x={-600} y={1890} width={2300} height={900} fill={palette.cream} />
        <path d={`M-600 1890H1700`} stroke={palette.ink} strokeWidth={stroke.ink} />
        <LightShaft from={[1180, 700]} angle={128} length={1700} w0={90} w1={420} beams={2} color={palette.cream} opacity={0.16} sweep={1} at={1.2} />
        <Monument
          {...MON}
          tod={P}
          light="back"
          people={30}
          doorPeople={3}
          seed="gov"
          build={{at: -0.45, dur: 3.1}}
          // the crowd keeps gathering on the steps all shot long (a counting build), four banners drop on "four",
          // the door opens on "Nobody", the clock pops in once the crane has carried it under the captions
          peopleAt={{at: 0.3, span: 4.6}}
          banners={{at: 1.3, n: 4, stagger: 0.16, upAt: 4.55}}
          doorAt={3.45}
          sideLitAt={[2.5, 2.95]}
          emblemY={1690}
          emblemAt={4.3}
          emblem={(x, y, r) => <ClockEmblem x={x} y={y} r={r} />}
        />
        <TinyCrowd spots={[{x: 160, y: 2010}, {x: 290, y: 2050}, {x: 700, y: 2030}, {x: 845, y: 2080}, {x: 610, y: 2120}, {x: 420, y: 2160}, {x: 520, y: 1990}, {x: 980, y: 2040}]} horizon={1500} k={0.17} tod={P} at={0.1} span={3.5} order="random" walk={0.5} walkDir={-90} seed="plaza" />
      </Layer>
      <Layer depth={-0.5}>
        <Balustrade x={40} y={1520} w={230} h={900} side="left" tod={P} rim="right" seed="balB" />
        <ElephantTimeline x={155} y={1524} scale={1.1} t={t} seed={5} look={0.5} keys={[{t: 0, pose: 'sit-back'}, {t: 3.6, pose: 'sit-back', look: -0.3}]} />
        <Person x={860} y={2240 - 60 * 2.2} s={2.2} legs seed="b-near" hair="cap" body={palette.teal} idle={1} ink={stroke.inkBold} />
      </Layer>
    </Cam>
  );
};

// ---------------------------------------------------------------- C: pull-back from one window (peak)

const C_VP: [number, number] = [1000, 1180];
const WALL: Quad = wallQuadVP({vp: C_VP, near: [-170, -1000, 2600], farX: 690});
const ROWS = 80;
const COLS = 44;
const WFW = 0.42;
const WFH = 0.72;
const HERO: [number, number] = [40, 5];
const HERO_OFF = 5.45;
/** 5 x 5 block around the hero drawn as close-ups while the wall is zoomed past 3x. */
const LOD: [number, number][] = [];
for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) if (dr || dc) LOD.push([HERO[0] + dr, HERO[1] + dc]);
const C_EVENTS = [
  {at: 0.7, dur: 2.6, to: 'on' as const, pattern: 'wave' as const, origin: [(HERO[1] + 0.5) / COLS, (HERO[0] + 0.5) / ROWS] as [number, number], noise: 0.35, fraction: 0.93},
  {at: 3.4, dur: 1.6, to: 'off' as const, pattern: 'wave' as const, origin: [1, 0.45] as [number, number], noise: 0.25},
  {at: 4.0, dur: 1.3, to: 'off' as const, pattern: 'wave' as const, origin: [0.6, 0] as [number, number], noise: 0.3},
];
const WALL_SPEC = {quad: WALL, rows: ROWS, cols: COLS, fw: WFW, fh: WFH, seed: 'wall', exclude: [HERO], events: C_EVENTS, initial: 0};
const CAPTION_SAFE = {y0: 262, y1: 592};
const LOD_ABOVE = 3;

/** The wall's thin ink stays ~1.6 px on screen through a 24x pull-back. */
const ScreenInkWall: React.FC<{children: (w: number) => React.ReactNode}> = ({children}) => {
  const cam = useCam();
  return <>{children(1.6 / layerScale(cam, 0))}</>;
};

/** Place a WindowCloseup (local glass w x h) onto a window quad of the wall. */
const OnCell: React.FC<{q: Quad; h: number; children: (w: number, h: number) => React.ReactNode}> = ({q, h, children}) => {
  const w = Math.round((h * Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1])) / Math.hypot(q[3][0] - q[0][0], q[3][1] - q[0][1]));
  return <XG m={affineFromTri([0, 0, w, h], q[0], q[1], q[3])}>{children(w, h)}</XG>;
};

const ShotC: React.FC = () => {
  const t = useTime();
  const P = TOD.night;
  const hq = windowQuad(WALL, ROWS, COLS, HERO[0], HERO[1], WFW, WFH);
  const hc: [number, number] = [(hq[0][0] + hq[2][0]) / 2, (hq[0][1] + hq[2][1]) / 2];
  const pop = popIn(t, 4.15);
  const keys: CamKey[] = [
    {t: 0, zoom: 5, push: 0.79, anchor: hc, anchorTo: [540, 1120]},
    {t: 0.45, zoom: 5, push: 0.79, anchor: hc, anchorTo: [540, 1120]},
    {t: 4.4, zoom: 1, push: 0, anchor: hc, ease: CAM.reveal},
  ];
  return (
    <Cam keys={keys} handheld={0.6} seed="C">
      <Layer depth={1}>
        <Sky tod={P} horizon={C_VP[1]} />
        <Stars tod={P} region={[500, -200, 1300, 1100]} n={90} at={0.5} span={3} />
        <BigSun cx={C_VP[0]} cy={C_VP[1] + 5} r={110} horizon={C_VP[1]} tod={P} path={[{t: 0, y: C_VP[1] + 5}, {t: 6.2, y: C_VP[1] + 85}]} glow={3} glowMode="stack" glowOpacity={0.2} beats={[1.5, {t: 4.2, amp: 0.1}]} />
      </Layer>
      <EndlessCity horizon={C_VP[1]} nearY={1500} rows={4} farS={0.12} nearS={0.4} tod={P} seed="far" x0={500} x1={1500} windows={{initial: 0.5, events: [{at: 3.5, dur: 2, to: 'off', pattern: 'sweep', dir: 180, fraction: 0.8}]}} />
      <Layer depth={0}>
        <ScreenInkWall>
          {(w) => <WallOfWindows {...WALL_SPEC} tod={P} inkW={w} precision={3} keepDark={CAPTION_SAFE} lod={{cells: LOD, above: LOD_ABOVE}} />}
        </ScreenInkWall>
        {/* LOD: the 24 windows around the hero as close-ups (frame, sill, curtain, room) while they are big */}
        <CloseupRing />
        <OnCell q={hq} h={760}>
          {(w, h) => <WindowCloseup w={w} h={h} tod={P} offAt={HERO_OFF} seed="hero" screenTick={0.4} flickerAt={[1.45]} person={<Person x={w * 0.3} y={h * 0.93} s={1.25} seed="hero-p" hair="bun" body={palette.teal} />} />}
        </OnCell>
        <Rise at={3.75} dist={420}>
          <Ledge y={1540} x0={620} x1={1180} top={24} face={90} tod={P} floor={palette.tealDark} seed="ledgeC" />
          {pop.visible ? (
            <Rimmed color={P.glow} dx={-3} dy={-3}>
              <Mascot x={800} y={1552} scale={1.05 * pop.scale} squash={pop.squash} pose="sit-back" t={t} seed={7} look={-0.7} />
            </Rimmed>
          ) : null}
        </Rise>
      </Layer>
    </Cam>
  );
};

/** Close-ups for the LOD cells: lit exactly when the wall would light them, forced dark in the caption band. */
const CloseupRing: React.FC = () => {
  const t = useTime();
  const cam = useCam();
  if (layerScale(cam, 0) <= LOD_ABOVE) return null;
  return (
    <>
      {LOD.map(([r, c], i) => {
        const q = windowQuad(WALL, ROWS, COLS, r, c, WFW, WFH);
        const a = project(cam, 0, q[0]);
        const b = project(cam, 0, q[2]);
        if (Math.max(a[0], b[0]) < -60 || Math.min(a[0], b[0]) > 1140 || Math.max(a[1], b[1]) < -60 || Math.min(a[1], b[1]) > 1980) return null;
        const inBand = Math.max(a[1], b[1]) >= CAPTION_SAFE.y0 - 40 && Math.min(a[1], b[1]) <= CAPTION_SAFE.y1 + 40;
        const on = !inBand && wallCellOn(WALL_SPEC, r, c, t);
        const seed = `nb${r}/${c}`;
        const withPerson = (r * 7 + c * 3) % 3 === 0;
        return (
          <OnCell key={i} q={q} h={760}>
            {(w, h) => (
              <WindowCloseup
                w={w}
                h={h}
                tod={TOD.night}
                lit={on}
                seed={seed}
                desk={(r + c) % 2 === 0}
                screenTick={0.5 + (i % 3) * 0.15}
                // dark neighbours: someone draws the curtain now and then
                curtainAt={on ? undefined : 1.0 + ((i * 0.37) % 1) * 2.4}
                person={withPerson && on ? <Person x={w * 0.3} y={h * 0.93} s={1.2} seed={`${seed}p`} body={palette.sage} /> : undefined}
                chair={withPerson}
              />
            )}
          </OnCell>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- captions + tones

const CAPTIONS: CaptionBeat[] = [
  {s: 0.25, lines: [{text: 'and there are about', s: 0.25}, {text: '22 million copies of PHP', s: 1.1}], highlights: [{text: '22 million', s: 1.25}]},
  {s: 3.1, lines: [{text: 'out there', s: 3.1}, {text: 'that could be hit.', s: 3.75}], highlights: [{text: 'hit', s: 4.4}]},
  {s: 5.85, lines: [{text: 'Someone has to install', s: 5.85}, {text: 'that fix on every site,', s: 6.7}], highlights: [{text: 'every site', s: 7.0}]},
  {s: 8.4, lines: [{text: 'the slow one.', s: 8.4}], highlights: [{text: 'slow', s: 8.6}]},
  {s: 10.0, lines: [{text: 'Government websites', s: 10.0}, {text: 'in four countries', s: 10.9}], highlights: [{text: 'four', s: 11.1}]},
  {s: 13.1, lines: [{text: 'Nobody hacked them.', s: 13.1}], highlights: [{text: 'Nobody', s: 13.25}]},
  {s: 15.95, lines: [{text: 'the safest thing', s: 15.95}, {text: 'is to switch it off', s: 16.8}], highlights: [{text: 'switch', s: 17.1}]},
  {s: 19.1, lines: [{text: "That's what those", s: 19.1}, {text: 'government sites did.', s: 19.7}], highlights: [{text: 'government', s: 19.8}]},
];
type ShotTone = {from: number; tone: CaptionTone};
const SHOT_TONES: ShotTone[] = [
  {from: 0, tone: 'light'}, // A dusk
  {from: CUT_AD.at + CUT_AD.dur / 2, tone: 'dark'}, // D golden street
  {from: CUT_DB.at + CUT_DB.dur / 2, tone: 'dark'}, // B golden, backlit monument (ink on the shadow fields >= 5:1)
  {from: CUT_BC.at + CUT_BC.dur / 2, tone: 'light'}, // C night
];
const toneAtT = (T: number): CaptionTone => SHOT_TONES.filter((s) => T >= s.from).pop()!.tone;
/** During a wipe each side of the moving edge keeps its own shot's tone, and the dark element passing the lens takes
 *  white text (later regions win; rects are [x0, y0, x1, y1] in screen px). */
const WIPES = [
  {...CUT_AD, dir: 'right', kind: 'column'},
  {...CUT_DB, dir: 'left', kind: 'passer'},
  {...CUT_BC, dir: 'right', kind: 'column'},
] as const;
const toneRegions = (T: number): ToneRegion[] | null => {
  for (const w of WIPES) {
    const e = wipeEdge(T, w.at, w.dur, w.dir, w.kind);
    if (!e) continue;
    const before = toneAtT(w.at - 0.01);
    const after = toneAtT(w.at + w.dur);
    const x = e.x;
    const k = 1 + 0.08 * e.p; // WipePass grows 8 % about the element's foot
    const grow = `translate(${x} 1920) scale(${k}) translate(${-x} -1920)`;
    const regs: ToneRegion[] = [
      {tone: before, rect: w.dir === 'right' ? [x, -200, 1300, 2200] : [-200, -200, x, 2200]},
      {tone: after, rect: w.dir === 'right' ? [-200, -200, x, 2200] : [x, -200, 1300, 2200]},
    ];
    if (w.kind === 'column') regs.push({tone: 'light', d: `M${x - 150} -60H${x + 150}V1980H${x - 150}Z`, transform: grow});
    else regs.push({tone: 'light', d: passerPath(x), transform: `${grow} translate(0 ${-Math.abs(Math.sin(e.p * Math.PI * 3)) * 10})`});
    return regs;
  }
  return null;
};

// ---------------------------------------------------------------- kit checks
// npx remotion still src/index.ts CineDemo out.png --frame=75 --props='{"mode":"street"}'   (or "tower", "loop")

const StreetCheck: React.FC = () => {
  const P = TOD.golden;
  const VP: [number, number] = [600, 790];
  return (
    <CineCamera keys={[{t: 0, push: 0}, {t: 6, push: 0.15}]} handheld={1}>
      <Layer depth={1}>
        <Sky tod={P} horizon={VP[1]} />
        <SkyCloud x={160} y={200} w={220} tod="day" drift={6} />
        <BigSun cx={VP[0]} cy={VP[1] - 40} r={110} horizon={VP[1] + 10} tod={P} />
        <Hills y={VP[1] + 10} amp={40} color={palette.sage} seed="h1" />
      </Layer>
      <Layer depth={0}>
        <PerspectiveStreet vp={VP} tod={P} seed="main" crowd={60} lightsOn={{at: 1, dur: 2}} />
        {/* people on the road: under 40 px batched blobs, above it inked kit Persons (camH 110: h = (y - horizon) * 170 / 110) */}
        <TinyCrowd n={26} area={[260, 812, 900, 1010]} horizon={VP[1]} k={170 / 110} tod={P} at={0.2} span={1.5} walk={0.4} seed="road" />
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
        <Tower x={600} y={1950} wl={520} wr={430} top={-200} vpy={-4200} tod={P} floors={70} at={0} buildDur={1.6} windows={{initial: 0.1, events: [{at: 0.5, dur: 4, to: 'on', pattern: 'rows', fraction: 0.6}]}} />
        <LightShaft from={[1100, 650]} angle={125} length={2000} w0={80} w1={600} beams={3} color={palette.peach} opacity={0.16} sweep={3} at={1} />
      </Layer>
      <Layer depth={0}>
        {/* regression: these two silhouettes must show ONCE (no mask tiling) */}
        <Silhouette color={deep.teal60}>
          <Person x={300} y={1760} s={1.6} seed="sil1" legs />
          <Person x={420} y={1790} s={1.3} seed="sil2" legs acc={['backpack']} />
        </Silhouette>
        <Rimmed color={palette.peach} dx={4} dy={-3} silhouette={deep.teal60}>
          <Person x={760} y={1700} s={1.4} seed="sil3" legs />
        </Rimmed>
        <TinyCrowd n={50} area={[0, 1700, 1080, 1900]} horizon={1300} k={0.06} tod={P} silhouette={deep.teal60} at={0.3} span={2} />
        <RimLight rect={[700, 1500, 300, 500]} side="right" width={10} color={palette.peach} />
        <Glow cx={900} cy={1400} r={10} rings={3} spread={2.5} color={P.glow} core={palette.peach} at={2} />
        <LitWindows grid={{x: 60, y: 1400, w: 220, h: 260, rows: 6, cols: 5}} initial={0} events={[{at: 0.5, dur: 2, to: 'on', pattern: 'wave', origin: [0, 1]}, {at: 4, dur: 1, to: 'off', pattern: 'rows'}]} ink={{}} dark={palette.tealDark} />
      </Layer>
    </CineCamera>
  );
};

/** Un-build + loop seam check: a small vista that opens with the paper -> colour cascade, un-builds at 3.5 s and loops
 *  into its own frame 0 at 4.0 s (Standalone renders the t < 0 state underneath). */
const LoopScene: React.FC = () => {
  const t = useTime();
  const P = TOD.dusk;
  return (
    <CineFrame bg="transparent">
      <Look cascade={{at: 0.05, origin: [600, 1000], speed: 2400}}>
        <CineCamera keys={[{t: 0, push: 0}, {t: 4, push: 0.06}]}>
          <Layer depth={1}>
            <Sky tod={P} horizon={HZ} />
            <Stars tod={P} region={[-100, -100, 1180, 900]} n={60} />
            <SkyCloud x={760} y={700} w={250} tod={P} color={P.sage} seed="lc" />
            <BigSun cx={600} cy={HZ + 20} r={260} horizon={HZ + 80} tod={P} />
          </Layer>
          <EndlessCity horizon={HZ} nearY={1560} rows={4} tod={P} seed="loop" towers={0.12} windows={{initial: 0.4}} />
          <Layer depth={0}>
            <Tower x={900} y={1500} wl={160} wr={120} top={700} vpy={-3000} tod={P} floors={30} colsL={5} colsR={4} />
            <TinyCrowd n={30} area={[80, 1500, 1000, 1640]} horizon={1010} k={0.08} tod={P} />
          </Layer>
          <Layer depth={-0.4}>
            <Ledge y={1680} tod={P} floor={palette.tealDark} />
            <Person x={330} y={2010} s={2.4} seed="loop-fig" body={palette.teal} hairColor={palette.ink} />
            <Mascot x={640} y={1686} scale={0.95} pose="sit-back" t={t} seed={3} />
            <StringLights x1={-80} y1={60} x2={1160} y2={130} sag={46} n={13} r={14} tod={P} seed="slL" />
          </Layer>
        </CineCamera>
      </Look>
    </CineFrame>
  );
};

export const CineDemo: React.FC<{mode?: 'demo' | 'street' | 'tower' | 'loop'; lock?: boolean}> = ({mode = 'demo', lock = false}) =>
  mode === 'street' ? (
    <CineFrame bg={palette.sky}>
      <StreetCheck />
    </CineFrame>
  ) : mode === 'tower' ? (
    <CineFrame bg={palette.tealDark}>
      <TowerCheck />
    </CineFrame>
  ) : mode === 'loop' ? (
    <Standalone unbuild={{at: 3.5}} loop={{at: 4}}>
      <LoopScene />
    </Standalone>
  ) : (
    <LockCtx.Provider value={lock}>
      <CineFrame bg={palette.tealDark} overlay={<SkyCaptions beats={CAPTIONS} tone={toneAtT} regions={toneRegions} hookAtStart />}>
        <WipeCut
          {...CUT_AD}
          dir="right"
          kind="column"
          tod="dusk"
          a={
            <Shot from={T_A[0]} to={T_A[1]}>
              <ShotA />
            </Shot>
          }
          b={
            <WipeCut
              {...CUT_DB}
              dir="left"
              kind="passer"
              tod="golden"
              a={
                <Shot from={T_D[0]} to={T_D[1]}>
                  <ShotD />
                </Shot>
              }
              b={
                <WipeCut
                  {...CUT_BC}
                  dir="right"
                  kind="column"
                  tod="night"
                  rim={palette.sage}
                  a={
                    <Shot from={T_B[0]} to={T_B[1]}>
                      <ShotB />
                    </Shot>
                  }
                  b={
                    <Shot from={T_C[0]} to={T_C[1]}>
                      <ShotC />
                    </Shot>
                  }
                />
              }
            />
          }
        />
      </CineFrame>
    </LockCtx.Provider>
  );

/** Camera keys of each shot (shot-local seconds), for tools (camera speed checks). */
export const CINE_DEMO_CAMS = {A: A_KEYS, B: B_KEYS, camAt};
