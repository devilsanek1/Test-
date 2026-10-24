// KitDemo v3 — 12 s FULL-BLEED EYE-LEVEL street: reference 2's baseline grammar, where the VIEWER FEELS SMALL.
// THE CAMERA: one eye-level lens (persp.tsx `eyeLevel`) at 1.1 x a standing person's height, horizon at world.horizon
// (0.40 H, ref 2 measured). Every person is placed from that camera (feet y -> size), so all heads sit in a thin band
// just under the horizon, the queue converges ON the horizon line, and the near walkers tower over the lower frame
// (0.30-0.45 H; one passer-by cut by the left edge pushes the world back). A camera at 2-4 x head height looks DOWN
// on a diorama: the viewer feels big (the review-3 finding this version fixes).
// The rest: a huge low sun on the horizon, a far skyline (cine Skyline rows, tops below the caption band) and far
// palms, a long single-storey row behind a picket fence, houses down the left, string lights and corner fronds, a
// gentle push-in, day -> dusk -> night (each object relights in one frame as the sky edge passes it), an un-build that
// loops back to frame 0 MID-MOTION (the opening sun rise and colour cascade start at t < 0).
// Exercises: eyeLevel camera, Crowd `eye` rows + rise rule, Person hero detail, World sky+tod keys and push, Tod roles,
// TodAnchor relight wave, Plane facades, Festoon, Palm/Fronds/WaterTower/Car, Sun beats/hop/set, Look cascade,
// Standalone loop, SkyCaptions tone wipe, mascot (ExitShrink, no fades), cine Skyline fed by useTod([x, y]).
// Preview: scripts/sheet.sh KitDemo 0 12 24 out.png
import React from 'react';
import {Standalone, ToneKey} from '../lib/Film';
import {SkyKey, World} from '../lib/World';
import {Sun} from '../lib/Sun';
import {exitFillProgress, ExitShrink, Look, useExit, useLook} from '../lib/exit';
import {Ink} from '../lib/Ink';
import {Fill} from '../lib/Fill';
import {Tod, useTod} from '../lib/tod';
import {eyeLevel, Plane, wallQuad} from '../lib/persp';
import {palette, stroke, world} from '../lib/theme';
import {ease as E, lerp, prog, useTime} from '../lib/time';
import {CaptionBeat} from '../lib/Captions';
import {crown, hline, line, polyPath, smooth, Pt} from '../lib/sketch';
import {Building, Car, Crowd, Festoon, Fronds, LampPost, Noticeboard, Palm, Paper, Person, Place, Tree, UtilityPole, WaterTower} from '../lib/kit';
import {Skyline} from '../lib/cine';
import {ElephantTimeline, popIn} from '../lib/mascot';

// ---------------------------------------------------------------- THE CAMERA (copy this block into a scene)

const H = world.horizon; // 768: reference 2's 0.40 H
const VP: Pt = [560, H];
/** Eye-level lens at 1.1 x person height: cam.height(feetY), cam.s(feetY, legH), cam.hip(feetY, legH), cam.x(X, feetY). */
const cam = eyeLevel({horizon: H, vpx: VP[0], ratio: 1.1});
/** Screen x of the ground line X person-heights from the camera axis, at screen y (a ray to the VP). */
const gx = (X: number, y: number) => cam.x(X, y);
const BOTTOM = 2100; // ground is authored past the frame bottom (bleed)

// ground strips in person-heights from the camera axis (reference 2 f_1): street | verge | walkway | hedge | fence
const X_STREET = -2.0;
const X_VERGE = -0.95;
const X_WALK_L = -0.72;
const X_WALK_R = 0.92;
const X_FENCE = 1.02;

const captions: CaptionBeat[] = [
  {s: 0.1, lines: [{text: 'An eye-level street,', s: 0.1}, {text: 'drawn in ink.', s: 1.2}], highlights: [{text: 'ink', s: 1.75}], style: 'hook'},
  {s: 2.5, lines: [{text: 'Every head sits', s: 2.5}, {text: 'on the horizon.', s: 3.5}], highlights: [{text: 'horizon', s: 4.0}]},
  {s: 5.0, lines: [{text: 'The sun is a character:', s: 5.0}, {text: 'it hops on the beat.', s: 5.9}], highlights: [{text: 'hops', s: 6.2}]},
  {s: 7.5, lines: [{text: 'At night the captions', s: 7.5}, {text: 'turn white.', s: 8.5}], highlights: [{text: 'white', s: 8.75}]},
  {s: 9.9, lines: [{text: 'Then it all', s: 9.9}, {text: 'un-builds.', s: 10.7}], highlights: [{text: 'un-builds', s: 10.9}]},
];
// one sky, one light: each key wipes the sky down and every object relights in one frame as the edge passes it
const SKY: SkyKey[] = [
  {t: 0, tod: 'day'},
  {t: 6.9, tod: 'dusk', wipe: 'down', dur: 0.45},
  {t: 8.45, tod: 'night', wipe: 'down', dur: 0.45},
];
// the caption colour follows the same edge
const TONE: ToneKey[] = [
  {t: 0, tone: 'dark'},
  {t: 8.45, tone: 'light', wipe: 'down', dur: 0.45},
];
const NIGHT = 8.45;

// ---------------------------------------------------------------- far layers (fill-only, atmospheric)

/** Cine rows inside the core grammar: absent in the paper state, pop in when the colour cascade reaches them,
 *  sink into their base line in the un-build (raw SVG does not read Look / exit by itself). */
const CineRow: React.FC<{base: number; children?: React.ReactNode}> = ({base, children}) => {
  const t = useTime();
  const look = useLook();
  const e = useExit();
  if (look.fills !== 'color') return null;
  if (look.cascade && t < look.cascade.at + 0.04) return null;
  const d = exitFillProgress(e, 0.4, 0.3);
  if (d >= 1) return null;
  const k = 1 - E.inCubic(d);
  return <g transform={k < 1 ? `translate(0 ${base}) scale(1 ${k.toFixed(4)}) translate(0 ${-base})` : undefined}>{children}</g>;
};

/** The far city on the horizon (cine Skyline rows), fill-only and close to the sky colour, two clusters framing the
 *  sun. Every top stays below y 600 (the caption band is one flat value). At night: window dots switch on. */
const FarCity: React.FC = () => {
  const tod = useTod([560, H - 60]); // flips when the sky edge reaches the city
  const night = tod === 'night';
  const win = {initial: 0, noDark: !night, events: night ? [{at: NIGHT + 0.25, dur: 1.6, to: 'on' as const, pattern: 'random' as const, fraction: 0.45}] : []};
  const far = {s: 0.17, depth: 0.78, tod, towers: 0, hRange: [380, 760] as [number, number], wRange: [110, 220] as [number, number], colors: [palette.sage, palette.teal], windows: win, rimSide: 'none' as const};
  const near = {s: 0.22, depth: 0.55, tod, towers: 0, hRange: [140, 330] as [number, number], wRange: [120, 240] as [number, number], colors: [palette.teal, palette.sage, palette.tealDark], windows: win, rimSide: 'none' as const};
  return (
    <CineRow base={H}>
      <Skyline base={H + 2} x0={150} x1={470} seed="kdFarL" landmarks={[{x: 380, w: 200, h: 860, kind: 'dome'}]} {...far} />
      <Skyline base={H + 2} x0={660} x1={980} seed="kdFarR" landmarks={[{x: 760, w: 160, h: 900, kind: 'step'}]} {...far} />
      <Skyline base={H + 3} x0={250} x1={880} seed="kdNear" landmarks={[{x: 640, w: 70, h: 720, kind: 'spire'}]} {...near} />
    </CineRow>
  );
};

/** Low far hills on the horizon (the far row of the relight table). */
const FarHills: React.FC = () => {
  const ptsL: Pt[] = [[-160, H + 3], [-40, H - 22], [90, H - 14], [210, H - 30], [330, H - 10], [460, H + 3]];
  const ptsR: Pt[] = [[640, H + 3], [760, H - 20], [880, H - 34], [1000, H - 16], [1120, H - 28], [1240, H + 3]];
  const shape = (p: Pt[]) => smooth(p, {}) + `L${p[p.length - 1][0]} ${H + 30}L${p[0][0]} ${H + 30}Z`;
  return (
    <Tod role="far">
      <Fill d={shape(ptsL) + shape(ptsR)} color={palette.sage} offset={false} seed="kdHills" />
    </Tod>
  );
};

/** Tall palms down both sides of the street near the vanishing point, flanking the sun (ref 2 f_1): 5-8 person
 *  heights tall, their crowns just under the caption band. A water tower on the far right. */
const PALMS: [number, number, number][] = [
  // [X, feetY, crown top y]: two clusters flank the sun, one small palm stands in front of it (ref 2 f_1)
  [-5.6, 796, 606],
  [-4.6, 804, 598],
  [-3.9, 814, 640],
  [0.9, 782, 668],
  [4.4, 800, 612],
  [5.4, 794, 596],
  [3.8, 812, 646],
];
const FarTown: React.FC = () => (
  <Tod role="far">
    <WaterTower x={gx(7.4, 802)} y={802} h={cam.height(802) * 3.8} at={1.3} seed="kdWT" />
    {PALMS.map(([X, fy, top], i) => (
      <Palm key={i} x={gx(X, fy)} y={fy} h={fy - top} lean={X < 0 ? -0.06 : 0.06} at={1.0 + i * 0.08} seed={`kdP${i}`} color={i % 2 ? palette.teal : palette.sage} />
    ))}
  </Tod>
);

// ---------------------------------------------------------------- ground plane

const Ground: React.FC = () => {
  // walkway joints at equal ground depths (screen offset from the horizon ~ 1 / distance)
  let joints = '';
  for (let k = 0; k < 16; k++) {
    const y = H + 1200 / (1.15 + k * 0.85);
    if (y > 1990) continue;
    joints += line(gx(X_WALK_L, y) + 8, y, gx(X_WALK_R, y) - 8, y, {seed: `j${k}`, over: [0, 0], breaks: false});
  }
  const strip = (x0: number, x1: number): Pt[] => [VP, [gx(x1, BOTTOM), BOTTOM], [gx(x0, BOTTOM), BOTTOM]];
  return (
    <>
      <Fill d={polyPath([[-300, H], [1380, H], [1380, BOTTOM], [-300, BOTTOM]])} color={palette.mintPale} offset={false} seed="lawn" />
      <Fill d={polyPath(strip(X_STREET - 3, X_STREET))} color={palette.sage} offset={false} seed="lawnL" />
      <Fill d={polyPath(strip(X_VERGE, X_WALK_L))} color={palette.teal} offset={false} seed="verge" />
      <Fill d={polyPath(strip(X_WALK_R, X_FENCE + 0.05))} color={palette.teal} offset={false} seed="hedgeStrip" />
      <Fill d={polyPath(strip(X_WALK_L, X_WALK_R))} color={palette.cream} offset={false} seed="walk" />
      <Ink d={line(gx(X_WALK_L, 2000), 2000, VP[0] - 3, H + 4, {seed: 'kL'}) + line(gx(X_VERGE, 2000), 2000, VP[0] - 4, H + 4, {seed: 'kL2'})} width={stroke.ink} />
      <Ink d={line(gx(X_WALK_R, 2000), 2000, VP[0] + 3, H + 4, {seed: 'kR'})} width={stroke.ink} />
      <Ink d={line(gx(X_STREET, 2000), 2000, VP[0] - 5, H + 3, {seed: 'kS'})} width={stroke.inkThin} />
      <Ink d={joints} width={stroke.inkHair} />
      <Ink d={hline(-60, 1140, H, {seed: 'hz', over: [0, 0]})} width={stroke.inkThin} />
    </>
  );
};

// ---------------------------------------------------------------- left: single-storey houses on a receding plane

// near edge at screen x -140 on the ground line X = -2.6: each house ~1.4 person-heights to the eaves
const HX = -2.8;
const HFEET = H + ((VP[0] + 140) / -HX) * 1.1; // feet y where the house line meets x = -140
const PL_W = 2600;
const PL_H = 560;
const housePx = cam.height(HFEET) * 2.0; // the plane's full height (eaves ~1.1 person-heights + the roof) at the near edge
const leftQuad = wallQuad({vp: VP, x: -140, top: HFEET - housePx, bottom: HFEET, depth: 0.88});

const Houses: React.FC = () => (
  <Plane quad={leftQuad} w={PL_W} h={PL_H}>
    <Building x={40} y={PL_H} w={600} floors={1} floorH={300} seed="hA" color={palette.cream} roof="pitched" door={1} cols={3} lightAt={NIGHT + 0.3} lit={0.7} />
    <Tree x={740} y={PL_H} size={120} seed="tA" color={palette.sage} sway={false} />
    <Building x={860} y={PL_H} w={560} floors={1} floorH={290} seed="hB" color={palette.tan} roof="pitched" door={0} cols={3} lightAt={NIGHT + 0.55} lit={0.6} />
    <Building x={1540} y={PL_H} w={520} floors={1} floorH={290} seed="hC" color={palette.sand} roof="pitched" door={2} cols={3} lightAt={NIGHT + 0.8} lit={0.6} />
    <Tree x={2160} y={PL_H} size={110} seed="tB" color={palette.teal} sway={false} />
    <Building x={2260} y={PL_H} w={340} floors={1} floorH={280} seed="hD" color={palette.cream} roof="pitched" cols={2} lightAt={NIGHT + 1.0} lit={0.6} />
  </Plane>
);

// ---------------------------------------------------------------- right: picket fence + hedge, a long low building behind

const FW = 3000;
const FH = 300;
const FFEET = H + ((1220 - VP[0]) / X_FENCE) * 1.1; // the fence line meets x = 1220 here
const fencePx = cam.height(FFEET) * 0.72;
const fenceQuad = wallQuad({vp: VP, x: 1220, top: FFEET - fencePx, bottom: FFEET, depth: 0.95});

const Fence: React.FC = () => {
  let posts = '';
  for (let x = 30; x < FW; x += 64) posts += line(x, 18, x, FH, {seed: `fp${x}`, over: [4, 0], breaks: false});
  const bumps: React.ReactNode[] = [];
  const crowns: string[] = [];
  for (let i = 0; i < 16; i++) {
    const cx = 100 + i * 190;
    const d = crown(cx, -30, 140, 78, {seed: `hc${i}`, bumps: 7});
    crowns.push(d);
    bumps.push(<Fill key={`hf${i}`} d={d} color={i % 2 ? palette.teal : palette.tealDark} offset={[5, 3]} seed={`hcf${i}`} />);
  }
  return (
    <Plane quad={fenceQuad} w={FW} h={FH}>
      {bumps}
      <Ink d={crowns.join('')} width={stroke.ink} open={0.35} />
      <Fill rect={[0, 18, FW, FH - 18]} color={palette.white} offset={[4, 2]} seed="fenceF" />
      <Ink d={hline(0, FW, 64, {seed: 'r1'}) + hline(0, FW, FH - 56, {seed: 'r2'})} width={stroke.ink} />
      <Ink d={posts} width={stroke.ink} order="all" />
    </Plane>
  );
};

// the long single-storey row behind the hedge (ref 2 f_1's right side): its eaves stay under the caption band
const RX = 1.75;
const RFEET = H + ((1240 - VP[0]) / RX) * 1.1;
const rowPx = cam.height(RFEET) * 1.75;
const rightQuad = wallQuad({vp: VP, x: 1240, top: RFEET - rowPx, bottom: RFEET, depth: 0.9});
const RightRow: React.FC = () => (
  <Plane quad={rightQuad} w={2400} h={420}>
    <Building x={0} y={420} w={1100} floors={1} floorH={340} seed="rA" color={palette.sand} roof="cornice" cols={6} win="wide" door={2} lightAt={NIGHT + 0.4} lit={0.8} />
    <Building x={1160} y={420} w={1240} floors={1} floorH={320} seed="rB" color={palette.cream} roof="cornice" cols={6} win="square" lightAt={NIGHT + 0.7} lit={0.7} />
  </Plane>
);

// ---------------------------------------------------------------- poles, lights (far: their tops stay under the band)

const POLES = [
  {X: -1.25, fy: 830},
  {X: -1.25, fy: 800},
  {X: 1.3, fy: 815},
].map((p) => {
  const h = cam.height(p.fy) * 4.2;
  return {x: gx(p.X, p.fy), y: p.fy, h, top: [gx(p.X, p.fy), p.fy - h] as Pt};
});

const Poles: React.FC = () => (
  <>
    {POLES.map((p, i) => (
      <UtilityPole key={i} x={p.x} y={p.y} h={620} s={p.h / 620} seed={`up${i}`} />
    ))}
  </>
);

const Lights: React.FC = () => {
  const lightAt = NIGHT + 0.05;
  return (
    <>
      {/* foreground strand right across the top of the frame (cropped): pushes the world back */}
      <Festoon x1={-60} y1={40} x2={1140} y2={96} sag={58} n={11} bulb={16} at={0.6} lightAt={lightAt} seed="sl0" width={stroke.ink} />
      {/* strands across the street near the vanishing point (ref 2 f_1), under the sun */}
      <Festoon x1={POLES[0].top[0]} y1={POLES[0].top[1] + 10} x2={POLES[2].top[0]} y2={POLES[2].top[1] + 12} sag={26} n={12} bulb={[5, 5]} at={1.4} lightAt={lightAt + 0.35} seed="sl1" width={stroke.inkHair} />
      <Festoon x1={POLES[1].top[0]} y1={POLES[1].top[1] + 6} x2={POLES[2].top[0]} y2={POLES[2].top[1] + 8} sag={14} n={8} bulb={3.5} at={1.6} lightAt={lightAt + 0.6} seed="sl2" width={stroke.inkHair} />
    </>
  );
};

// ---------------------------------------------------------------- the people, all from the camera

const WALK_LEG = 150; // ref 2 walkers: long legs (~45 % of the figure)

/** One person placed by the camera: X person-heights from the axis, feet at y. */
const Placed: React.FC<{X: number; feet: number; legH?: number} & Omit<React.ComponentProps<typeof Person>, 'x' | 'y' | 's'>> = ({X, feet, legH = WALK_LEG, ...p}) => (
  <Person x={gx(X, feet)} y={cam.hip(feet, legH)} s={cam.s(feet, legH)} legs legH={legH} {...p} />
);

/** The queue: a long organic line on the right half of the walkway, converging on the horizon. */
const Queue: React.FC = () => (
  <Crowd
    eye={{horizon: H, ratio: 1.1}}
    far={{y: 789, x0: gx(0.3, 789), x1: gx(0.8, 789)}}
    near={{y: 1190, x0: gx(0.32, 1190), x1: gx(0.82, 1190)}}
    rows={13}
    density={0.8}
    spacing={0.95}
    at={2.35}
    span={2.0}
    order="front"
    build="rise"
    idle={1.2}
    jitter={{x: 0.3, y: 0.15, scale: [0.62, 1.06]}}
    rim="left"
    seed="kd3q"
  />
);

/** A few strollers on the left half, farther off. */
const Strollers: React.FC = () => (
  <Crowd eye={{horizon: H}} far={{y: 792, x0: gx(-0.6, 792), x1: gx(-0.3, 792)}} near={{y: 1010, x0: gx(-0.62, 1010), x1: gx(-0.28, 1010)}} rows={6} density={0.55} spacing={1.4} at={3.1} span={1.2} build="pop" idle={1} jitter={{x: 0.4, y: 0.2, scale: [0.7, 1.08]}} seed="kd3s" />
);

/** The two hero walkers (0.36 / 0.34 H at the start, heads at y ~840, ref 2 f_1) strolling into depth, and a
 *  passer-by cut by the left edge and the frame bottom. */
const Walkers: React.FC = () => {
  const t = useTime();
  const u = prog(t, 0, 12);
  return (
    <>
      <Placed X={lerp(-0.32, -0.3, u)} feet={lerp(1530, 1470, u)} at={0.75} build="draw" walk={1.7} hair="short" acc={['headphones', 'hood']} body={palette.teal} legsColor={palette.tealDark} hairColor={palette.ink} seed="kdW1" ink={stroke.inkBold} />
      <Placed X={lerp(0.04, 0.05, u)} feet={lerp(1482, 1428, u)} at={0.95} build="draw" walk={1.55} hair="bun" acc={['backpack']} body={palette.sage} legsColor={palette.tan} hairColor={palette.brown} seed="kdW2" ink={stroke.inkBold} />
    </>
  );
};
const PasserBy: React.FC = () => (
  // the nearest thing in the shot: cut by the left edge and the frame bottom (its feet are below the frame, so its
  // rise is hidden by the frame edge), head still in the band just under the horizon
  <Placed X={-0.5} feet={1990} legH={160} at={0.55} build="rise" idle={1.4} hair="cap" acc={['strap']} body={palette.brown} legsColor={palette.teal} hairColor={palette.ink} seed="kdPB" ink={stroke.inkBold} />
);

// ---------------------------------------------------------------- the mascot (the corgi's spot in ref 2 f_1)

const PIP_X = gx(-0.1, 1600);
const PIP_Y = 1600;
const Mascot: React.FC = () => {
  const t = useTime();
  const p = popIn(t, 1.9);
  if (!p.visible) return null;
  return (
    // un-build: shrinks to its feet (no opacity ramp)
    <ExitShrink x={PIP_X} y={PIP_Y}>
      <ElephantTimeline
        x={PIP_X}
        y={PIP_Y}
        scale={1.45 * p.scale}
        squash={p.squash}
        t={t}
        seed={7}
        keys={[
          {t: 0, pose: 'sit-back'},
          {t: 6.1, pose: 'trunk-up', expression: 'happy'},
          {t: 7.1, pose: 'sit-back'},
          {t: 9.35, pose: 'trunk-up', expression: 'happy'},
          {t: 10.2, pose: 'sit-back'},
        ]}
      />
    </ExitShrink>
  );
};

// ---------------------------------------------------------------- the scene

export const StreetScene: React.FC = () => (
  <World sky={SKY} push={{to: 1.06, dur: 2.4, anchor: VP}}>
    {/* the opening starts BEFORE t 0 (sun rise -0.12 s, colour cascade -0.05 s): the loop seam is mid-motion */}
    <Look cascade={{at: -0.05, origin: VP, speed: 3200}}>
      <Sun
        cx={560}
        cy={690}
        r={120}
        horizon={H}
        rise={{at: -0.12, from: [560, 880]}}
        beats={[1.65, {t: 4.1, amp: 0.11}, {t: 6.95, amp: 0.06}, {t: 8.75, amp: 0.1}, {t: 9.95, amp: 0.07}, {t: 10.85, amp: 0.11}]}
        hops={[{t: 6.05, to: [600, 690], h: 60}]}
        moves={[{at: 7.3, dur: 2.4, y: 880}]}
        drift={[10, 0]}
      />
      <FarCity />
      <FarHills />
      <FarTown />
      <Ground />
      <Poles />
      <RightRow />
      <Houses />
      <Car x={gx(-1.55, 1010)} y={1010} w={cam.height(1010) * 1.3} at={1.5} seed="kdCar" color={palette.teal} lightsOn={NIGHT + 0.5} />
      <Fence />
      {[880, 835].map((fy, i) => (
        <LampPost key={i} x={gx(1.12, fy)} y={fy} h={cam.height(fy) * 2.6} at={1.0 + i * 0.1} lightAt={NIGHT + 0.15 + i * 0.12} arm="left" seed={`lp${i}`} width={stroke.inkThin} />
      ))}
      {/* a notice board on the right verge, facing the camera: draw-on, paper drops, the stamp is the hero orange */}
      <Place x={gx(0.62, 960) - 50} y={960 - cam.height(960) * 0.95} s={cam.height(960) / 560}>
        <Noticeboard x={0} y={0} w={420} h={300} legs={230} at={4.3} seed="kdboard">
          <Paper x={30} y={26} w={150} h={200} at={5.25} entry="drop" seed="kdpaper" stamp={{at: 6.2}} />
          <Paper x={220} y={40} w={160} h={120} at={5.5} entry="drop" seed="kdpaper2" lines={3} />
        </Noticeboard>
      </Place>
      <Strollers />
      <Queue />
      <Walkers />
      <Mascot />
      <PasserBy />
      <Lights />
      {/* foreground framing: palm fronds poking in from the top corners (dusk: a darker silhouette on the sage sky,
          night: one step lighter than the sky) */}
      <Tod role="framing">
        <Fronds x={-40} y={-10} r={330} angles={[8, 30, 54, 80]} at={0.5} seed="kdFrL" width={stroke.ink} />
        <Fronds x={1120} y={0} r={300} angles={[102, 126, 150, 172]} at={0.62} seed="kdFrR" width={stroke.ink} />
      </Tod>
    </Look>
  </World>
);

export const KitDemo: React.FC = () => (
  <Standalone captions={captions} tone={TONE} unbuild={{at: 11.45, dur: 0.5}} loop={{at: 12}}>
    <StreetScene />
  </Standalone>
);
