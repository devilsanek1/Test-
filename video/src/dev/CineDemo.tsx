// CineDemo — 22 s proof of the cinematic direction (cine lane), with the balance note's dosing: peak, baseline, peak,
// peak. Time of day only moves FORWARD (golden -> golden -> late golden -> night) and the sun only sets across cuts,
// hopping from shot to shot after each wiper has passed. Preview: scripts/sheet.sh CineDemo 0 21.9 24 out.png
//   A (0-6.1 s)     PEAK, Arcane vista: the hook opens on the sun and the crown of ONE colossal tower (it rises through
//                   the caption band and out of frame, a cloud band across it) and TILTS down 640 px (CAM.reveal) onto
//                   a backlit observer and the mascot on a parapet over an endless golden city; a district lights up on
//                   "22 million", the tower and the street lamps on "hit". The push is anchored on the far city.
//   D (5.6-10.25)   BASELINE, reference 2's eye-level street: camera at 1.1x head height (heads hug the horizon), a queue
//                   on the central path from the lens (the first figures 0.4-0.55 H, cut by the bottom edge) to the
//                   vanishing point, the mascot at their feet, a dressed street (car, bike, mailbox, palms, tree, lamp,
//                   fence, pitched roofs, doors), walkers on both walks, a dolly push anchored on the VP.
//   B (9.75-16.2)   PEAK, worm's-eye: a BACKLIT government building cropped by the frame (pediment past both edges,
//                   lantern out of the top), inked below the caption band, a plaza crowd of back-view people, a
//                   backlit head-and-shoulders silhouette at the lens; crane up while the upper storeys keep building.
//   C (15.7-22)     PEAK, pull-back from one lit window (8x -> 1.5x, cruise <= 20 px / frame) to a wall of windows that
//                   light up, then go dark in waves that start at the captions; the hero window stays framed and is the
//                   last light off. Close-ups degrade by screen size (full -> room -> pane, identical to the grid).
// Cuts ride on the edge of something passing the lens (WipeCut: a column, a passer-by), each centred on a caption page.
// Check modes (props): {mode: 'street'} | {mode: 'tower'} | {mode: 'loop'} (un-build + loop seam) | {mode: 'wipes'}
// (the cine wipers over flat fields) | {mode: 'speed'} (camera speed report per shot) and {lock: true} (camera locked,
// for event-density checks).
import React, {createContext, useContext} from 'react';
import {useTime} from '../lib/time';
import {palette, skyCaption, stroke} from '../lib/theme';
import {XG} from '../lib/xf';
import {Bike, Car, LampPost, Palm, Person, Tree, WaterTower} from '../lib/kit';
import {Rise} from '../lib/motion';
import {Look, useExit} from '../lib/exit';
import {Standalone} from '../lib/Film';
import {Elephant, ElephantTimeline, popIn} from '../lib/mascot';
import {SkyCaptions, CaptionBeat, ToneRegion} from '../lib/Captions';
import {CaptionTone} from '../lib/theme';
import type {Pt} from '../lib/sketch';
import {line} from '../lib/sketch';
import {
  affineFromTri,
  Balustrade,
  BigSun,
  Birds,
  CAM,
  CamKey,
  camFull,
  camPath,
  camSpeed,
  CineCamera,
  CineCameraProps,
  CineFrame,
  cityRows,
  ColumnWiper,
  deep,
  EndlessCity,
  Glow,
  GroundPlane,
  Hills,
  KeepDark,
  Layer,
  layerScale,
  Ledge,
  LightShaft,
  LitWindows,
  mix,
  Monument,
  monumentMap,
  PasserWiper,
  PerspectiveStreet,
  persp1,
  PERSON_FEET,
  PERSON_H,
  project,
  Quad,
  RimLight,
  Rimmed,
  Shot,
  Silhouette,
  Sky,
  SkyCloud,
  Stars,
  Streaks,
  StringLights,
  TinyCrowd,
  TOD,
  Tower,
  unproject,
  useCam,
  WallOfWindows,
  wallCellState,
  wallDarkFrom,
  wallQuadVP,
  WindowCloseup,
  windowQuad,
  WipeCut,
  wipeToneRegions,
} from '../lib/cine';

// ---------------------------------------------------------------- camera lock (density checks)

const LockCtx = createContext(false);
/** CineCamera that holds its LAST key (the shot's resting framing) when the demo runs with {lock: true}. */
const Cam: React.FC<CineCameraProps> = (p) => {
  const lock = useContext(LockCtx);
  return <CineCamera {...p} keys={lock && p.keys?.length ? [{...p.keys[p.keys.length - 1], t: 0}] : p.keys} handheld={lock ? 0 : p.handheld} />;
};

/** The mascot follows the un-build (it ignores exit by itself: drive draw = 1 - exit). */
const Mascot: React.FC<React.ComponentProps<typeof Elephant>> = (p) => {
  const e = useExit();
  return <Elephant {...p} draw={Math.max(0, 1 - e * 1.6)} />;
};

// ---------------------------------------------------------------- timeline
// Each wipe's midpoint sits on the first word of the incoming caption page (motion spec 7).

const CUT_AD = {at: 5.6, dur: 0.5};
const CUT_DB = {at: 9.75, dur: 0.5};
const CUT_BC = {at: 15.7, dur: 0.5};
const T_A = [0, CUT_AD.at + CUT_AD.dur] as const;
const T_D = [CUT_AD.at, CUT_DB.at + CUT_DB.dur] as const;
const T_B = [CUT_DB.at, CUT_BC.at + CUT_BC.dur] as const;
const T_C = [CUT_BC.at, 22] as const;

// ---------------------------------------------------------------- A: vista (peak, the hook)

const HZ = 1010;
const A_ANCHOR = {anchor: [600, 1000] as Pt, anchorDepth: 0.85};
/** The hook: open tilted UP on the sun and the colossal tower's crown, tilt down 640 px onto the observer (CAM.reveal:
 *  a 2.5 s crane-down, peak ~12 px / frame), while a slow push anchored on the far city keeps going. */
const A_KEYS: CamKey[] = [
  {t: 0, tilt: 640, push: 0, ...A_ANCHOR},
  {t: 2.5, tilt: 0, push: 0.05, ...A_ANCHOR, ease: CAM.reveal},
  {t: 6.1, tilt: 0, push: 0.12, zoom: 1.03, ...A_ANCHOR},
];
const A_SUN = {x: 640, y0: 860, y1: 1000, r: 300};
const A_ROWS = cityRows({horizon: HZ, nearY: 1600, rows: 6});
/** The colossal tower (row 1): ~3x anything near it, rising through the caption band and out of the frame top. */
const TOWER = {x: 330, w: 1300, h: 9800, row: 1};
const towerScreen = (() => {
  const r = A_ROWS[TOWER.row];
  const w = TOWER.w * r.s;
  return {x0: TOWER.x - w / 2, x1: TOWER.x + w / 2, base: r.base, podium: r.base - TOWER.h * r.s * 0.12};
})();

/** Aviation beacons on the tower's podium corners: pop on "hit", then blink. */
const Beacons: React.FC<{at: number}> = ({at}) => {
  const t = useTime();
  if (t < at) return null;
  const blink = Math.floor((t - at) * 1.6) % 2 === 0;
  const y = towerScreen.podium - 6;
  return (
    <>
      {[towerScreen.x0 + 10, towerScreen.x1 - 10].map((x, i) => (
        <Glow key={i} cx={x} cy={y} r={blink || t - at < 0.6 ? 5 : 3.2} rings={3} spread={2.6} color={palette.peach} opacity={0.3} core={palette.sun} at={at + i * 0.08} />
      ))}
    </>
  );
};

const ShotA: React.FC = () => {
  const t = useTime();
  const P = TOD.golden;
  return (
    <Cam keys={A_KEYS} handheld={1.2} seed="A">
      <Layer depth={1}>
        <Sky tod={P} horizon={HZ} />
        {/* high clouds only the opening (tilted-up) frames see */}
        <SkyCloud x={620} y={-360} w={300} tod={P} drift={6} seed="ca0" />
        <SkyCloud x={40} y={-120} w={240} tod={P} drift={4} seed="ca1" at={0.5} />
        <BigSun cx={A_SUN.x} cy={A_SUN.y0} r={A_SUN.r} horizon={HZ + 80} tod={P} path={[{t: 0, y: A_SUN.y0}, {t: 6.1, y: A_SUN.y1}]} beats={[1.25, {t: 4.4, amp: 0.1}]} drift={[2, 0]} />
        <Birds at={2.2} from={[-80, 820]} to={[1160, 720]} dur={4} n={5} size={16} />
      </Layer>
      <EndlessCity
        horizon={HZ}
        nearY={1600}
        rows={6}
        tod={P}
        seed="pilt"
        towers={0.1}
        beacons={0.9}
        backFrom={4}
        lampsOn={{at: 4.45, dur: 1.1}}
        build={{at: -2.6, span: 1.0, rowStagger: 0.45, order: 'center'}}
        rowProps={(r) => ({
          hRange: r.i < 2 ? [260, 700] : r.i < 4 ? [160, 480] : [90, 300],
          landmarks:
            r.i === TOWER.row
              ? [{x: TOWER.x, w: TOWER.w, h: TOWER.h, kind: 'colossal', color: mix(palette.sky, palette.sage, 0.55), quietAbove: 640}]
              : r.i === 2
                ? [{x: 880, w: 230, h: 1300, kind: 'tower'}]
                : undefined,
          // the colossal tower lights up bottom -> top on "hit" (its own row's events)
          ...(r.i === TOWER.row
            ? {
                windows: {
                  initial: 0.1,
                  events: [
                    {at: 1.5, dur: 4, to: 'on', pattern: 'random', fraction: 0.3},
                    {at: 4.35, dur: 0.5, to: 'on', pattern: 'rows', region: [0.18, 0, 0.44, 1], fraction: 0.9},
                  ],
                },
              }
            : {}),
        })}
        inRow={(r) =>
          r.i === TOWER.row
            ? {
                // the cloud band crossing the tower (Arcane panel 4): in FRONT of the far row, behind the nearer ones
                front: (
                  <>
                    <SkyCloud x={-120} y={700} w={620} h={70} tod={P} drift={7} seed="band1" />
                    <SkyCloud x={240} y={668} w={440} h={52} tod={P} drift={11} seed="band2" at={1.0} />
                    <Beacons at={4.4} />
                  </>
                ),
              }
            : null
        }
        windows={{
          initial: 0.1,
          blinds: 0.12,
          events: [
            {at: 1.5, dur: 4.2, to: 'on', pattern: 'random', fraction: 0.4},
            // a whole district lights up in one sweep on "22 million", another on "out there"
            {at: 1.15, dur: 0.45, to: 'on', pattern: 'sweep', dir: 0, region: [0.0, 0.55, 0.5, 0.86], fraction: 0.92},
            {at: 3.55, dur: 0.45, to: 'on', pattern: 'sweep', dir: 180, region: [0.52, 0.55, 1.0, 0.86], fraction: 0.92},
            {at: 2.8, dur: 3, to: 'off', pattern: 'random', fraction: 0.05},
          ],
        }}
      />
      <Layer depth={-0.15}>
        <Ledge y={1700} top={30} face={260} tod={P} floor={palette.tealDark} />
        {/* on "PHP" the elephant turns to us (it IS the PHP elephant), then back to the view */}
        <ElephantTimeline x={720} y={1706} scale={0.95} t={t} seed={3} look={0.3} keys={[{t: 0, pose: 'sit-back'}, {t: 1.85, pose: 'sit-front', expression: 'happy'}, {t: 2.9, pose: 'sit-back'}, {t: 4.3, pose: 'sit-back', look: -0.5}]} />
      </Layer>
      <Layer depth={-0.25}>
        {/* the observer: a back-view silhouette against the sun (Arcane panel 1), a peach rim sliver on the sun side,
            shoulders to waist, cut by the bottom edge */}
        <Rimmed color={palette.peach} dx={6} dy={-4} silhouette={deep.teal78}>
          <Person x={280} y={2000} s={3.5} seed="vista-fig" hair="short" body={palette.teal} hairColor={palette.ink} acc={['strap']} idle={1.6} ink={0} />
        </Rimmed>
      </Layer>
    </Cam>
  );
};

// ---------------------------------------------------------------- D: eye-level street (baseline)

const D_VP: Pt = [560, 800];
/** Street camera: the eye 1.1x head height (187 for 170 people), so heads hug the horizon; a narrow central path
 *  (`road` 120) between lawn strips and low pitched-roof houses (reference 2 f_1). */
const D_ST = {f: 900, camH: 187, road: 120, walk: 260};
const dP = persp1({vx: D_VP[0], vy: D_VP[1], f: D_ST.f, camH: D_ST.camH});
/** The queue on the path, from the lens (z 150: the hero, 0.55 H, cut by the bottom edge) to the vanishing point. */
const D_HERO = {x: -62, z: 150};
const D_QUEUE = Array.from({length: 15}, (_, i) => {
  const z = 182 * Math.pow(1.24, i);
  const [x, y, k] = dP(i % 2 ? -46 + (i % 4) * 4 : 52 - (i % 3) * 6, 0, z);
  return {x, y, h: 170 * k};
});
const D_SUN_START = {x: 602, y: 1003, r: 309}; // where A's sun is on screen at A's last frame

/** A small kerbside mailbox (reference 2 f_1): post, box, flag. x, y = foot, s = scale. */
const Mailbox: React.FC<{x: number; y: number; s: number; flagAt?: number}> = ({x, y, s, flagAt}) => {
  const t = useTime();
  const up = flagAt !== undefined && t >= flagAt;
  const bw = 70 * s;
  const bh = 46 * s;
  const top = y - 150 * s;
  const ink = line(x - 5 * s, y, x - 5 * s, top + bh, {seed: 'mb1', over: [0, 0], breaks: false}) + line(x + 5 * s, y, x + 5 * s, top + bh, {seed: 'mb2', over: [0, 0], breaks: false}) + `M${x - bw / 2} ${top + bh}L${x - bw / 2} ${top + bh * 0.4}Q${x - bw / 2} ${top} ${x} ${top}Q${x + bw / 2} ${top} ${x + bw / 2} ${top + bh * 0.4}L${x + bw / 2} ${top + bh}Z`;
  const fx = x + bw / 2 - 4 * s;
  return (
    <>
      <rect x={x - 5 * s + 2} y={top + bh} width={10 * s} height={y - top - bh} fill={palette.brown} />
      <path d={`M${x - bw / 2 + 3} ${top + bh + 2}L${x - bw / 2 + 3} ${top + bh * 0.4 + 2}Q${x - bw / 2 + 3} ${top + 2} ${x + 3} ${top + 2}Q${x + bw / 2 + 3} ${top + 2} ${x + bw / 2 + 3} ${top + bh * 0.4 + 2}L${x + bw / 2 + 3} ${top + bh + 2}Z`} fill={palette.white} />
      <path d={up ? `M${fx} ${top + bh * 0.7}L${fx} ${top - 18 * s}L${fx + 16 * s} ${top - 12 * s}L${fx} ${top - 6 * s}` : `M${fx} ${top + bh * 0.7}L${fx + 26 * s} ${top + bh * 0.7}L${fx + 20 * s} ${top + bh * 0.45}L${fx + 26 * s} ${top + bh * 0.2}`} fill="none" stroke={palette.sun} strokeWidth={4 * s} strokeLinecap="round" />
      <path d={ink} fill="none" stroke={palette.ink} strokeWidth={stroke.ink} strokeLinejoin="round" strokeLinecap="round" />
    </>
  );
};

/** Kit dressing placed on the street's ground plane with the street's own camera (far -> near), the near 30 %. */
const StreetDressing: React.FC = () => {
  const g = (x: number, z: number) => dP(x, 0, z);
  const items: {z: number; node: React.ReactNode}[] = [];
  const put = (x: number, z: number, f: (sx: number, sy: number, k: number) => React.ReactNode) => {
    const [sx, sy, k] = g(x, z);
    items.push({z, node: f(sx, sy, k)});
  };
  put(600, 5400, (x, y, k) => <WaterTower x={x} y={y} h={430 * k} seed="dwt" />);
  put(-470, 3300, (x, y, k) => <Palm x={x} y={y} h={660 * k} seed="dp1" lean={0.06} />);
  put(500, 3000, (x, y, k) => <Palm x={x} y={y} h={620 * k} seed="dp2" lean={-0.08} />);
  put(-430, 2300, (x, y, k) => <Palm x={x} y={y} h={600 * k} seed="dp3" lean={0.1} />);
  put(-350, 1750, (x, y, k) => <Tree x={x} y={y} size={95 * k} h={170 * k} seed="dt2" color={palette.teal} />);
  put(330, 1300, (x, y, k) => <Tree x={x} y={y} size={110 * k} h={190 * k} seed="dt1" color={palette.sage} />);
  put(300, 1060, (x, y, k) => <LampPost x={x} y={y} h={380 * k} seed="dl1" arm="left" lightAt={3.2} width={Math.max(1.6, stroke.ink * Math.min(1, k))} />);
  put(-290, 980, (x, y, k) => <Car x={x} y={y} w={190 * k} seed="dcar" color={palette.teal} lightsOn={3.9} />);
  put(-262, 760, (x, y, k) => <Bike x={x} y={y} s={0.62 * k} seed="dbike" basket />);
  put(-180, 600, (x, y, k) => <Mailbox x={x} y={y} s={k * 0.95} flagAt={2.6} />);
  items.sort((a, b) => b.z - a.z);
  return <>{items.map((it, i) => <React.Fragment key={i}>{it.node}</React.Fragment>)}</>;
};

const ShotD: React.FC = () => {
  const t = useTime();
  const P = TOD.golden;
  const [hx, hy, hk] = dP(D_HERO.x, 0, D_HERO.z);
  const [mx, my, mk] = dP(4, 0, 196); // the mascot at their feet, between the first two in the queue
  return (
    <Cam keys={[{t: 0, push: 0, anchor: D_VP, anchorDepth: 0.95}, {t: 4.65, push: 0.09, anchor: D_VP, anchorDepth: 0.95, ease: CAM.slow}]} handheld={0.8} seed="D">
      <Layer depth={1}>
        <Sky tod={P} horizon={D_VP[1]} />
        <SkyCloud x={330} y={175} w={200} tod={P} drift={5} seed="dc" at={0.5} />
        <SkyCloud x={760} y={640} w={150} tod={P} drift={-4} seed="dc2" at={2.3} />
        {/* the sun arrives where A left it (behind the street), and HOPS (anticipation, stretch, landing squash) onto
            the vanishing point after the column has passed, landing on "that"; then it keeps setting */}
        <BigSun cx={D_SUN_START.x} cy={D_SUN_START.y} r={D_SUN_START.r} horizon={D_VP[1] + 14} tod={P} moves={[{at: 0.42, dur: 0.75, r: 110}]} hops={[{t: 0.5, to: [D_VP[0], D_VP[1] - 22], h: 110, air: 0.6}]} beats={[{t: 3.25, amp: 0.1}]} glow={0} />
        <Hills y={D_VP[1] + 14} amp={34} color={palette.sage} seed="dh" />
        <Birds at={1.0} from={[1120, 690]} to={[-60, 640]} dur={3.2} n={4} size={14} />
        <Birds at={2.9} from={[-80, 700]} to={[1160, 620]} dur={2.6} n={3} size={18} seed="db2" />
      </Layer>
      <Layer depth={0}>
        <PerspectiveStreet
          vp={D_VP}
          {...D_ST}
          tod={P}
          seed="dmain"
          crowd={34}
          standing={0.3}
          heights={[270, 330]}
          poleH={520}
          poles={1400}
          poleStart={2400}
          fence="right"
          roadColor={palette.cream}
          walkColor={palette.mintPale}
          lightsOn={{at: 1.8, dur: 1.6}}
          windows={{initial: 0.08, events: [{at: 1.2, dur: 2.8, to: 'on', pattern: 'random', fraction: 0.35}]}}
        />
        <StreetDressing />
        {/* the queue keeps growing toward the vanishing point while the narrator speaks */}
        <TinyCrowd spots={D_QUEUE} tod={P} at={0.2} span={4.0} order="back" walk={0} seed="queue" />
        <ElephantTimeline x={mx} y={my} scale={(0.27 * 170 * mk) / 96} t={t} seed={4} look={0.25} keys={[{t: 0, pose: 'sit-back'}, {t: 3.1, pose: 'sit-back', look: -0.6}]} />
      </Layer>
      <Layer depth={-0.05}>
        <Rise at={0.15} dist={300}>
          <Person x={hx} y={hy - PERSON_FEET * ((170 * hk) / PERSON_H)} s={(170 * hk) / PERSON_H} legs seed="d-hero" hair="short" body={palette.teal} hairColor={palette.brown} acc={['backpack']} idle={1.2} ink={stroke.inkBold} />
        </Rise>
      </Layer>
      <Layer depth={-0.6}>
        <StringLights x1={-120} y1={40} x2={1200} y2={150} sag={60} n={11} r={16} tod={P} on={{at: 3.45, dur: 0.65}} seed="slD" width={2.8} />
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

/** Cropped by the frame at rest: the pediment runs past both edges, the lantern leaves the top, only the flat pediment
 *  / drum fields sit in the caption band. Scale chain: plaza person ~70 px, door ~160 px, column ~700 px. */
const MON = {cx: 540, by: 1820, bw: 1950, ty: -260, taper: 0.52};
/** The plaza: its horizon (behind the building) and camera, so the crowd and the paving share one perspective. */
const PLAZA = {vp: [540, 1712] as Pt, camH: 400, f: 900};
const B_KEYS: CamKey[] = [
  {t: 0, y: 1120, zoom: 1.04, rot: -0.5},
  {t: 6.0, y: 960, zoom: 1, rot: 0, ease: CAM.reveal},
];
const D_SUN_END = {x: D_VP[0], y: D_VP[1] - 22 + 9.5 * (T_D[1] - T_D[0] - 0.5)};

/** Lanterns on the stylobate between the columns (Monument elevation units mapped to the screen), popping on in turn. */
const PorticoLanterns: React.FC<{at: number; step: number}> = ({at, step}) => {
  const M = monumentMap(MON);
  const xs = Array.from({length: 7}, (_, i) => 60 + (880 / 7) * (i + 0.5));
  return (
    <>
      {xs.map((X, i) => {
        const [x, y] = M.at(X, 300);
        const r = M.scale(X, 300) * 9;
        return <Glow key={i} cx={x} cy={y} r={r} rings={3} spread={2.4} color={palette.peach} opacity={0.3} core={palette.cream} at={at + i * step} />;
      })}
    </>
  );
};

const ShotB: React.FC = () => {
  const t = useTime();
  const P = TOD.golden;
  return (
    <Cam keys={B_KEYS} handheld={0.8} seed="B">
      <Layer depth={0.92}>
        <Sky tod={P} horizon={2400} span={900} />
        {/* D's sun hops up behind the drum's right shoulder once the passer has gone, then sinks behind the pediment */}
        <BigSun cx={D_SUN_END.x} cy={D_SUN_END.y} r={110} tod={P} glow={2} moves={[{at: 0.55, dur: 0.6, r: 150}]} hops={[{t: 0.62, to: [930, 560], h: 120, air: 0.55}]} beats={[{t: 3.5, amp: 0.1}]} drift={[2, 12]} />
        <Birds at={3.7} from={[1150, 230]} to={[-150, 120]} dur={2.6} n={6} size={18} />
        <Birds at={0.9} from={[-120, 900]} to={[1200, 780]} dur={3.4} n={4} size={14} seed="b2" />
      </Layer>
      <Layer depth={0}>
        <GroundPlane vp={PLAZA.vp} y0={MON.by - 6} f={PLAZA.f} camH={PLAZA.camH} every={260} radial={300} tod={P} seed="plaza" />
        <LightShaft from={[1180, 760]} angle={128} length={1700} w0={90} w1={420} beams={2} color={palette.cream} opacity={0.16} sweep={1} at={1.2} />
        <Monument
          {...MON}
          tod={P}
          light="back"
          people={30}
          doorPeople={3}
          seed="gov"
          build={{at: -1.6, dur: 3.4}}
          // the crowd keeps gathering on the steps all shot long (a counting build), four banners drop on "four",
          // the door opens on "Nobody", the clock pops in once the crane has carried it under the captions
          peopleAt={{at: 0.3, span: 4.6}}
          banners={{at: 1.3, n: 4, stagger: 0.16, upAt: 4.55}}
          doorAt={3.45}
          sideLitAt={[2.5, 2.95]}
          sideOffAt={[5.55, 5.75]}
          emblemY={1300}
          emblemAt={4.3}
          emblem={(x, y, r) => <ClockEmblem x={x} y={y} r={r} />}
        />
        {/* lanterns between the columns switch on one by one (a counting build while the speaker lists) */}
        <PorticoLanterns at={1.9} step={0.24} />
        {/* the plaza crowd: 44 back-view people 50-90 px tall, walking up to the steps (one perspective with the paving) */}
        <TinyCrowd n={44} area={[-60, MON.by + 4, 1140, 2010]} horizon={PLAZA.vp[1]} k={170 / PLAZA.camH} tod={P} at={-1.2} span={4.2} order="random" walk={0.45} walkDir={-90} walkSpeed={0.5} seed="plaza" />
      </Layer>
      <Layer depth={-0.5}>
        <Balustrade x={40} y={1560} w={230} h={900} side="left" tod={P} rim="right" seed="balB" />
        <ElephantTimeline x={155} y={1564} scale={1.1} t={t} seed={5} look={0.5} keys={[{t: 0, pose: 'sit-back'}, {t: 3.6, pose: 'sit-back', look: -0.3}]} />
        {/* at the lens, backlit: head and shoulders only, in the bottom corner (the sun is behind the monument) */}
        <Rimmed color={palette.peach} dx={6} dy={-5} silhouette={deep.teal78}>
          <Person x={880} y={2330} s={4.4} seed="b-near" hair="cap" body={palette.teal} idle={1} ink={0} />
        </Rimmed>
      </Layer>
    </Cam>
  );
};

// ---------------------------------------------------------------- C: pull-back from one window (peak)

const C_VP: Pt = [1000, 1180];
const WALL: Quad = wallQuadVP({vp: C_VP, near: [-170, -620, 2600], farX: 690});
const ROWS = 56;
const COLS = 30;
const WFW = 0.44;
const WFH = 0.72;
const HERO: [number, number] = [28, 3];
/** The hero goes dark on "did." (21.45 s), the last light on the wall; the cut follows ~0.55 s later. */
const HERO_OFF = 21.45 - T_C[0];
/** 5 x 5 block around the hero drawn as close-ups (level of detail by screen size). */
const LOD: [number, number][] = [];
for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) if (dr || dc) LOD.push([HERO[0] + dr, HERO[1] + dc]);
const HQ = windowQuad(WALL, ROWS, COLS, HERO[0], HERO[1], WFW, WFH);
const HC: Pt = [(HQ[0][0] + HQ[2][0]) / 2, (HQ[0][1] + HQ[2][1]) / 2];
const HERO_GLASS = Math.hypot(HQ[1][0] - HQ[0][0], HQ[1][1] - HQ[0][1]);
/** Below this layer zoom the 24 neighbours are plain grid panes (their close-ups are at 'glass' level by then). */
const LOD_ABOVE = 1.15;
/** 8x -> 1.3x over 5.3 s (CAM.reveal cruise <= 20 px / frame anywhere on screen), the hero kept framed at (440, 1110)
 *  and >= 40 px tall; the wall's top edge leaves a wedge of night sky top right. */
const C_KEYS: CamKey[] = [
  {t: 0, zoom: 4, push: 0.5, anchor: HC, anchorTo: [540, 1090]},
  {t: 0.3, zoom: 4, push: 0.5, anchor: HC, anchorTo: [540, 1090]},
  {t: 5.6, zoom: 1.3, push: 0, anchor: HC, anchorTo: [440, 1110], ease: CAM.reveal},
];
const C_HANDHELD = 0.6;
const C_PATH = camPath(C_KEYS, 0, {handheld: C_HANDHELD, seed: 'C'});

/** Off-wave origins: the wall u / v under the caption block when "switch" is spoken (the darkness spreads from the
 *  words), and the far side. */
const wallUV = (q: Quad, p: Pt): [number, number] => {
  // nearest cell centre (brute force, once)
  let best: [number, number] = [0.5, 0.5];
  let bd = Infinity;
  for (let r = 0; r < ROWS; r += 2)
    for (let c = 0; c < COLS; c++) {
      const w = windowQuad(q, ROWS, COLS, r, c, WFW, WFH);
      const d = Math.hypot((w[0][0] + w[2][0]) / 2 - p[0], (w[0][1] + w[2][1]) / 2 - p[1]);
      if (d < bd) {
        bd = d;
        best = [(c + 0.5) / COLS, (r + 0.5) / ROWS];
      }
    }
  return best;
};
const CAP_UV = wallUV(WALL, unproject(camFull(C_KEYS, 1.4, {handheld: C_HANDHELD, seed: 'C'}), 0, [520, 430]));
type Ev = {at: number; dur: number; to: 'on' | 'off'; pattern: 'wave' | 'rows' | 'random'; origin?: [number, number]; noise?: number; fraction?: number; region?: [number, number, number, number]};
/** Switch-offs in BURSTS: one block of floors after another goes dark (0.12 s each, 0.4 s apart), starting at the block
 *  under the captions and spreading outward (a counting rhythm: sites switching off one by one, and every burst is
 *  its own legible event), then the last stragglers, then the hero. */
const OFF_BLOCKS: [number, number, number, number][] = [];
for (let i = 0; i < 2; i++) for (let j = 0; j < 4; j++) OFF_BLOCKS.push([i * 0.5, j * 0.25, i * 0.5 + 0.5, j * 0.25 + 0.25]);
OFF_BLOCKS.sort((p, q) => Math.hypot((p[0] + p[2]) / 2 - CAP_UV[0], (p[1] + p[3]) / 2 - CAP_UV[1]) - Math.hypot((q[0] + q[2]) / 2 - CAP_UV[0], (q[1] + q[3]) / 2 - CAP_UV[1]));
const C_EVENTS: Ev[] = [
  {at: 0.4, dur: 2.1, to: 'on', pattern: 'wave', origin: [(HERO[1] + 0.5) / COLS, (HERO[0] + 0.5) / ROWS], noise: 0.35, fraction: 0.94},
  ...OFF_BLOCKS.map((r, i): Ev => ({at: 2.45 + 0.4 * i, dur: 0.12, to: 'off', pattern: 'rows', region: r})),
  {at: 5.45, dur: 0.1, to: 'off', pattern: 'random'},
];
const WALL_SPEC = {quad: WALL, rows: ROWS, cols: COLS, fw: WFW, fh: WFH, seed: 'wall', exclude: [HERO], events: C_EVENTS, initial: 0};

/** The caption lines' ink boxes (screen px) in C's local time: windows behind the words switch off (with hysteresis
 *  along the camera path: once dark, they stay dark). Widths are a deterministic estimate (0.44 em per character). */
const captionBoxes = (beats: CaptionBeat[], t0: number) => (t: number): [number, number, number, number][] => {
  const T = t + t0;
  const out: [number, number, number, number][] = [];
  const sorted = beats.slice().sort((a, b) => a.s - b.s);
  sorted.forEach((b, bi) => {
    const start = b.s - 0.04;
    const end = (sorted[bi + 1]?.s ?? Infinity) - 0.04 + 0.45;
    if (T < start || T > end) return;
    b.lines.forEach((ln, i) => {
      if (T < (i === 0 ? start : ln.s - 0.08)) return;
      const size = skyCaption.size;
      const w = ln.text.length * size * 0.44;
      const base = b.lines.length === 1 ? skyCaption.oneLine : [skyCaption.line1, skyCaption.line2][i];
      out.push([skyCaption.cx - w / 2, base - size * 0.78, skyCaption.cx + w / 2, base + size * 0.24]);
    });
  });
  return out;
};

/** The wall's thin ink stays ~1.6 px on screen through the pull-back. */
const ScreenInkWall: React.FC<{children: (w: number) => React.ReactNode}> = ({children}) => {
  const cam = useCam();
  return <>{children(1.6 / layerScale(cam, 0))}</>;
};

/** Place a WindowCloseup (local glass w x h) onto a window quad of the wall. */
const OnCell: React.FC<{q: Quad; h: number; children: (w: number, h: number) => React.ReactNode}> = ({q, h, children}) => {
  const w = Math.round((h * Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1])) / Math.hypot(q[3][0] - q[0][0], q[3][1] - q[0][1]));
  return <XG m={affineFromTri([0, 0, w, h], q[0], q[1], q[3])}>{children(w, h)}</XG>;
};

/** Close-up level of detail from the glass's on-screen width (jittered per cell, so steps never land in one frame). */
const detailFor = (px: number, j: number): 'full' | 'room' | 'glass' => (px >= 74 * (0.9 + 0.2 * j) ? 'full' : px >= 48 * (0.9 + 0.2 * j) ? 'room' : 'glass');
const heroOverride = (row: number, col: number, t: number, on: boolean) => (row === HERO[0] && col === HERO[1] ? t < HERO_OFF : on);

const ShotC: React.FC = () => {
  const t = useTime();
  const P = TOD.night;
  const pop = popIn(t, 3.15);
  return (
    <Cam keys={C_KEYS} handheld={C_HANDHELD} seed="C">
      <Layer depth={1}>
        <Sky tod={P} horizon={C_VP[1]} />
        <Stars tod={P} region={[300, -500, 1400, 1000]} n={130} at={0.5} span={3} />
      </Layer>
      <Layer depth={0}>
        <ScreenInkWall>{(w) => <WallOfWindows {...WALL_SPEC} tod={P} inkW={w} precision={3} keepDark={C_KEEP} lod={{cells: LOD, above: LOD_ABOVE}} override={heroOverride} />}</ScreenInkWall>
        {/* LOD: the hero and the 24 windows around it as close-ups while they are big enough to need it */}
        <CloseupRing />
      </Layer>
      {/* our own rooftop, near the lens (screen space): it rises into the frame as the camera pulls back over it */}
      <Rise at={2.7} dist={460}>
        <Ledge y={1600} x0={-60} x1={1140} top={24} face={96} tod={P} floor={palette.tealDark} seed="ledgeC" detail />
        {pop.visible ? (
          <Rimmed color={P.glow} dx={-3} dy={-3}>
            <Mascot x={780} y={1612} scale={1.05 * pop.scale} squash={pop.squash} pose={t > HERO_OFF + 0.1 ? 'sit-front' : 'sit-back'} expression={t > HERO_OFF + 0.1 ? 'worried' : undefined} t={t} seed={7} look={-0.7} />
          </Rimmed>
        ) : null}
      </Rise>
    </Cam>
  );
};

const C_KEEP: KeepDark = {boxes: () => [], path: C_PATH, span: [0, T_C[1] - T_C[0]], pad: 18, ragged: 30};

/** Close-ups for the hero + LOD cells: the same state, colour and darkness as the grid would give them. */
const CloseupRing: React.FC = () => {
  const t = useTime();
  const cam = useCam();
  const z = layerScale(cam, 0);
  const darkFrom = wallDarkFrom(WALL_SPEC, C_KEEP);
  const P = TOD.night;
  const cells: [number, number][] = [HERO, ...LOD];
  return (
    <>
      {cells.map(([r, c], i) => {
        const q = windowQuad(WALL, ROWS, COLS, r, c, WFW, WFH);
        const a = project(cam, 0, q[0]);
        const b = project(cam, 0, q[2]);
        if (Math.max(a[0], b[0]) < -60 || Math.min(a[0], b[0]) > 1140 || Math.max(a[1], b[1]) < -60 || Math.min(a[1], b[1]) > 1980) return null;
        const hero = i === 0;
        // below the wall's lod threshold the grid draws the neighbours itself (the hero is never in the grid)
        if (!hero && z <= LOD_ABOVE) return null;
        const st = wallCellState(WALL_SPEC, r, c, t, {darkFrom, override: heroOverride});
        const j = hero ? 0.5 : ((r * 7 + c * 13) % 10) / 10;
        const detail = detailFor(HERO_GLASS * z, j);
        const lit = P.windowLit[Math.min(P.windowLit.length - 1, Math.floor(st.k3 * P.windowLit.length))];
        const seed = hero ? 'hero' : `nb${r}/${c}`;
        const withPerson = hero || (r * 7 + c * 3) % 3 === 0;
        return (
          <OnCell key={i} q={q} h={760}>
            {(w, h) => (
              <WindowCloseup
                w={w}
                h={h}
                tod={P}
                on={st.on}
                lit={st.on}
                seed={seed}
                detail={detail}
                litColor={lit}
                darkColor={P.windowDark}
                desk={hero || (r + c) % 2 === 0}
                screenTick={hero ? 0.4 : 0.5 + (i % 3) * 0.15}
                // dark neighbours: someone draws the curtain now and then
                curtainAt={st.on || hero ? undefined : 1.0 + ((i * 0.37) % 1) * 2.4}
                person={withPerson && st.on ? <Person x={w * 0.3} y={h * 0.93} s={1.22} seed={`${seed}p`} hair={hero ? 'bun' : undefined} body={hero ? palette.teal : palette.sage} /> : undefined}
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
  {s: 19.6, lines: [{text: "That's what those", s: 19.6}, {text: 'government sites did.', s: 20.5}], highlights: [{text: 'government', s: 20.6}]},
];
C_KEEP.boxes = captionBoxes(CAPTIONS, T_C[0]);

type ShotTone = {from: number; tone: CaptionTone};
/** Caption tone per shot = TOD[x].text: ink on the golden skies, white once it is night. */
const SHOT_TONES: ShotTone[] = [
  {from: 0, tone: 'dark'}, // A golden
  {from: CUT_AD.at + CUT_AD.dur / 2, tone: 'dark'}, // D golden street
  {from: CUT_DB.at + CUT_DB.dur / 2, tone: 'dark'}, // B golden, backlit monument (ink on the flat shadow fields >= 4.5:1)
  {from: CUT_BC.at + CUT_BC.dur / 2, tone: 'light'}, // C night
];
const toneAtT = (T: number): CaptionTone => SHOT_TONES.filter((s) => T >= s.from).pop()!.tone;
const WIPES = [
  {...CUT_AD, dir: 'right' as const, kind: 'column' as const},
  {...CUT_DB, dir: 'left' as const, kind: 'passer' as const},
  {...CUT_BC, dir: 'right' as const, kind: 'column' as const},
];
/** During a wipe each side keeps its own shot's tone and the element passing the lens takes its wiper's own regions. */
const toneRegions = (T: number): ToneRegion[] | null => {
  for (const w of WIPES) {
    const r = wipeToneRegions(T, w, toneAtT(w.at - 0.01), toneAtT(w.at + w.dur));
    if (r) return r;
  }
  return null;
};

// ---------------------------------------------------------------- kit checks
// npx remotion still src/index.ts CineDemo out.png --frame=75 --props='{"mode":"street"}'   (or "tower", "loop", "wipes", "speed")

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
        <PerspectiveStreet vp={VP} tod={P} seed="main" crowd={60} lightsOn={{at: 1, dur: 2}} heights={[300, 420]} fence="both" />
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

/** The cine wipers over flat fields (left: the outgoing tone, right: the incoming), with their caption regions
 *  outlined: the passer must have NO see-through hole, the rim is a one-sided sliver on the leading edge. */
const WipesCheck: React.FC = () => {
  const t = useTime();
  const p = (t % 2) / 2;
  const x = 1080 * (0.15 + 0.7 * p);
  const regs = PasserWiper.captionRegions({x, p, dir: 'left'});
  return (
    <>
      <rect x={0} y={0} width={1080} height={1920} fill={TOD.golden.sky} />
      <rect x={540} y={0} width={540} height={1920} fill={palette.sun} />
      <path d="M0 960H1080M540 0V1920" stroke={palette.white} strokeWidth={6} />
      <PasserWiper x={x} p={p} dir="left" />
      <g transform="translate(0 0)">
        {regs.map((r, i) => (
          <path key={i} d={r.d} transform={r.transform} fill="none" stroke="#FF00FF" strokeWidth={3} strokeDasharray="12 8" />
        ))}
      </g>
      <g transform="translate(-260 0)">
        <ColumnWiper x={1080 - x * 0.4} p={p} dir="right" />
      </g>
    </>
  );
};

/** Camera speed report (camSpeed over every shot, all layer depths in use): max on-screen px / frame and when.
 *  Flat inked art strobes above ~15-20 px / frame. */
const SHOT_CAMS: {name: string; keys: CamKey[]; t1: number; depths: number[]; handheld: number; seed: string}[] = [
  {name: 'A vista (tilt + push)', keys: A_KEYS, t1: T_A[1] - T_A[0], depths: [1, 0.84, 0.6, 0.37, -0.15, -0.25], handheld: 1.2, seed: 'A'},
  {name: 'D street (dolly push)', keys: [{t: 0, push: 0, anchor: D_VP, anchorDepth: 0.95}, {t: 4.65, push: 0.09, anchor: D_VP, anchorDepth: 0.95, ease: CAM.slow}], t1: T_D[1] - T_D[0], depths: [1, 0, -0.05, -0.6], handheld: 0.8, seed: 'D'},
  {name: 'B monument (crane)', keys: B_KEYS, t1: T_B[1] - T_B[0], depths: [0.92, 0, -0.5], handheld: 0.8, seed: 'B'},
  {name: 'C pull-back (8x -> 1.5x)', keys: C_KEYS, t1: T_C[1] - T_C[0], depths: [1, 0], handheld: C_HANDHELD, seed: 'C'},
];
export const cineSpeedReport = () => SHOT_CAMS.map((s) => ({name: s.name, ...camSpeed(s.keys, {t0: 0, t1: s.t1, depths: s.depths, handheld: s.handheld, seed: s.seed})}));

const SpeedCheck: React.FC = () => {
  const rows = cineSpeedReport();
  return (
    <>
      <rect x={0} y={0} width={1080} height={1920} fill={palette.cream} />
      <text x={60} y={140} fontSize={44} fill={palette.ink} fontFamily="sans-serif">
        Camera speed (max px / frame, 30 fps)
      </text>
      {rows.map((r, i) => (
        <React.Fragment key={i}>
          <text x={60} y={260 + i * 150} fontSize={38} fill={palette.ink} fontFamily="sans-serif">
            {r.name}
          </text>
          <text x={60} y={310 + i * 150} fontSize={34} fill={r.max > 20 ? palette.sun : palette.teal} fontFamily="monospace">
            {`max ${r.max.toFixed(1)} px/f @ ${r.at.toFixed(2)} s (depth ${r.depth}), avg ${r.avg.toFixed(1)}`}
          </text>
        </React.Fragment>
      ))}
    </>
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
            <SkyCloud x={760} y={700} w={250} tod={P} seed="lc" />
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

export const CineDemo: React.FC<{mode?: 'demo' | 'street' | 'tower' | 'loop' | 'wipes' | 'speed'; lock?: boolean}> = ({mode = 'demo', lock = false}) =>
  mode === 'street' ? (
    <CineFrame bg={palette.sky}>
      <StreetCheck />
    </CineFrame>
  ) : mode === 'tower' ? (
    <CineFrame bg={palette.tealDark}>
      <TowerCheck />
    </CineFrame>
  ) : mode === 'wipes' ? (
    <CineFrame bg={palette.sky}>
      <WipesCheck />
    </CineFrame>
  ) : mode === 'speed' ? (
    <CineFrame bg={palette.cream}>
      <SpeedCheck />
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
          tod="golden"
          rim={palette.peach}
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
              rim={palette.peach}
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
