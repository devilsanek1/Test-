// KitDemo v2.1 — 12 s FULL-BLEED eye-level street (reference 2's grammar, the viewer feels small): one-point
// perspective to a vanishing point under a huge low sun, a far skyline (cine Skyline rows, fill-only) and a far town
// (hills, palms, a water tower, a parked car) on the lawns, an organic queue seen from behind that STARTS AT THE
// CAMERA (two hero walkers cut by the frame bottom), string lights and corner fronds, a gentle push-in, and day ->
// dusk -> night where the WHOLE street relights with the sky wipe (reference 2's step table) and the captions turn
// white along the same edge. Ends in an un-build that loops back into frame 0 (paper/ink, then the colour cascade).
// Exercises: World sky+tod keys and push, Tod roles, Plane facades, Crowd jitter/rim/hero, Person hero + walk,
// Building lightAt, Festoon, LampPost, UtilityPole, Palm/Fronds/WaterTower/Car, Sun beats/hop/set, Look cascade,
// Standalone loop, SkyCaptions tone wipe, mascot, cine Skyline fed by useTod().
// Preview: scripts/sheet.sh KitDemo 0 12 24 out.png
import React from 'react';
import {Standalone, ToneKey} from '../lib/Film';
import {SkyKey, World} from '../lib/World';
import {Sun} from '../lib/Sun';
import {exitFillProgress, Look, useExit, useLook} from '../lib/exit';
import {Ink} from '../lib/Ink';
import {Fill} from '../lib/Fill';
import {Tod, useTod} from '../lib/tod';
import {Plane, rayPoint, wallQuad} from '../lib/persp';
import {palette, stroke} from '../lib/theme';
import {ease as E, lerp, prog, useTime} from '../lib/time';
import {CaptionBeat} from '../lib/Captions';
import {crown, hline, line, polyPath, smooth, Pt} from '../lib/sketch';
import {Building, Car, Crowd, Fronds, LampPost, Noticeboard, Palm, Paper, Person, Place, Festoon, Tree, UtilityPole, WaterTower} from '../lib/kit';
import {Skyline} from '../lib/cine';
import {drawOut, ElephantTimeline, popIn} from '../lib/mascot';

const VP: Pt = [560, 880];
const H = VP[1];
const BOTTOM = 1920;
/** x on a ray from the VP through (x0, BOTTOM), at screen height y. */
const rayX = (x0: number, y: number) => VP[0] + ((x0 - VP[0]) * (y - H)) / (BOTTOM - H);

const captions: CaptionBeat[] = [
  {s: 0.1, lines: [{text: 'An eye-level street,', s: 0.1}, {text: 'drawn in ink.', s: 1.2}], highlights: [{text: 'ink', s: 1.75}], style: 'hook'},
  {s: 2.5, lines: [{text: 'The crowd walks off', s: 2.5}, {text: 'into the distance.', s: 3.5}], highlights: [{text: 'distance', s: 4.2}]},
  {s: 5.0, lines: [{text: 'The sun is a character:', s: 5.0}, {text: 'it hops on the beat.', s: 5.9}], highlights: [{text: 'hops', s: 6.2}]},
  {s: 7.5, lines: [{text: 'At night the captions', s: 7.5}, {text: 'turn white.', s: 8.5}], highlights: [{text: 'white', s: 8.75}]},
  {s: 9.9, lines: [{text: 'Then it all', s: 9.9}, {text: 'un-builds.', s: 10.7}], highlights: [{text: 'un-builds', s: 10.9}]},
];
// one sky, one light: each key relights the whole street with the sky's own down-wipe
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

/** The far city (cine Skyline rows: crowns, domes, spires, antennas), fill-only and close to the sky colour. Two
 *  clusters frame a gap where the sun sits; every top stays below y 600 (the caption band is one flat value). By day
 *  plain silhouettes; at night dark panes and window dots switching on. */
const FarCity: React.FC = () => {
  const tod = useTod();
  const night = tod === 'night';
  const win = {initial: 0, noDark: !night, events: night ? [{at: NIGHT + 0.25, dur: 1.6, to: 'on' as const, pattern: 'random' as const, fraction: 0.45}] : []};
  const far = {s: 0.3, depth: 0.75, tod, towers: 0, hRange: [380, 700] as [number, number], wRange: [110, 220] as [number, number], colors: [palette.sage, palette.teal], windows: win, rimSide: 'none' as const};
  const near = {s: 0.42, depth: 0.45, tod, towers: 0, hRange: [120, 300] as [number, number], wRange: [120, 240] as [number, number], colors: [palette.teal, palette.sage, palette.tealDark], windows: win, rimSide: 'none' as const};
  return (
    <CineRow base={H}>
      <Skyline base={H + 2} x0={110} x1={440} seed="kdFarL" landmarks={[{x: 330, w: 220, h: 760, kind: 'dome'}]} {...far} />
      <Skyline base={H + 2} x0={690} x1={1010} seed="kdFarR" landmarks={[{x: 800, w: 170, h: 820, kind: 'step'}]} {...far} />
      <Skyline base={H + 4} x0={210} x1={920} seed="kdNear" landmarks={[{x: 612, w: 70, h: 560, kind: 'spire'}]} {...near} />
    </CineRow>
  );
};

/** Rolling far hills on both lawns (the far row of the relight table: sage by day, #4B706B at night). */
const FarHills: React.FC = () => {
  const ptsL: Pt[] = [[-160, H + 4], [-60, H - 34], [60, H - 22], [170, H - 46], [300, H - 18], [420, H + 4]];
  const ptsR: Pt[] = [[640, H + 4], [740, H - 30], [860, H - 50], [980, H - 26], [1100, H - 44], [1240, H + 4]];
  const shape = (p: Pt[]) => smooth(p, {}) + `L${p[p.length - 1][0]} ${H + 40}L${p[0][0]} ${H + 40}Z`;
  return (
    <Tod role="far">
      <Fill d={shape(ptsL) + shape(ptsR)} color={palette.sage} offset={false} seed="kdHills" />
    </Tod>
  );
};

/** The far town on the right lawn: palms, a water tower, a parked car (reference 2 f_1 / f_33). */
const FarTown: React.FC = () => (
  <Tod role="far">
    <WaterTower x={1010} y={H + 8} h={170} at={1.3} seed="kdWT" />
    {[
      [690, H + 14, 150],
      [760, H + 30, 200],
      [905, H + 44, 240],
      [1050, H + 70, 300],
    ].map(([x, y, h], i) => (
      <Palm key={i} x={x} y={y} h={h} at={1.0 + i * 0.12} seed={`kdP${i}`} color={i % 2 ? palette.teal : palette.sage} />
    ))}
  </Tod>
);

// ---------------------------------------------------------------- ground plane

const Ground: React.FC = () => {
  const kerbL = -120;
  const kerbR = 1060;
  const edgeL = -760;
  const edgeR = 1700;
  // sidewalk joints at perspective depths
  let joints = '';
  for (let k = 1; k < 14; k++) {
    const y = H + (BOTTOM + 260 - H) / (1 + k * 0.62);
    joints += line(rayX(kerbL, y) + 6, y, rayX(kerbR, y) - 6, y, {seed: `j${k}`, over: [0, 0], breaks: false});
  }
  return (
    <>
      <Fill d={polyPath([[-300, H], [1380, H], [1380, 2100], [-300, 2100]])} color={palette.mintPale} offset={false} seed="lawn" />
      <Fill d={polyPath([[rayX(edgeL, H + 6), H + 6], VP, [rayX(kerbL, 2100), 2100], [rayX(edgeL, 2100), 2100]])} color={palette.sage} offset={false} seed="grassL" />
      <Fill d={polyPath([VP, [rayX(edgeR, H + 6), H + 6], [rayX(edgeR, 2100), 2100], [rayX(kerbR, 2100), 2100]])} color={palette.teal} offset={false} seed="hedgeR" />
      <Fill d={polyPath([VP, [rayX(kerbR, 2100), 2100], [rayX(kerbL, 2100), 2100]])} color={palette.cream} offset={false} seed="walk" />
      <Ink d={line(rayX(kerbL, 2000), 2000, VP[0] - 4, H + 6, {seed: 'kL'})} width={stroke.ink} />
      <Ink d={line(rayX(kerbR, 2000), 2000, VP[0] + 4, H + 6, {seed: 'kR'})} width={stroke.ink} />
      <Ink d={joints} width={stroke.inkHair} />
      <Ink d={hline(-60, 1140, H, {seed: 'hz', over: [0, 0]})} width={stroke.inkThin} />
    </>
  );
};

// ---------------------------------------------------------------- left: houses on a receding plane

const PL_W = 2600;
const PL_H = 640;
const leftQuad = wallQuad({vp: VP, x: -140, top: 1180 - PL_H * 1.0, bottom: 1250, depth: 0.86});

const Houses: React.FC = () => (
  <Plane quad={leftQuad} w={PL_W} h={PL_H + 70}>
    <Building x={40} y={PL_H + 70} w={560} floors={2} floorH={250} seed="hA" color={palette.cream} roof="pitched" door={1} cols={3} lightAt={NIGHT + 0.3} lit={0.7} />
    <Tree x={700} y={PL_H + 70} size={130} seed="tA" color={palette.sage} sway={false} />
    <Building x={820} y={PL_H + 70} w={520} floors={2} floorH={240} seed="hB" color={palette.tan} roof="pitched" door={0} cols={3} lightAt={NIGHT + 0.55} lit={0.6} />
    <Building x={1500} y={PL_H + 70} w={500} floors={2} floorH={230} seed="hC" color={palette.sand} roof="pitched" door={2} cols={3} lightAt={NIGHT + 0.8} lit={0.6} />
    <Tree x={2120} y={PL_H + 70} size={120} seed="tB" color={palette.teal} sway={false} />
    <Building x={2240} y={PL_H + 70} w={360} floors={2} floorH={230} seed="hD" color={palette.cream} roof="pitched" cols={2} lightAt={NIGHT + 1.0} lit={0.6} />
  </Plane>
);

// ---------------------------------------------------------------- right: picket fence + hedge on a plane

const FW = 3000;
const FH = 260;
const fenceQuad = wallQuad({vp: VP, x: 1120, top: 1330, bottom: 1330 + FH, depth: 0.94});

const Fence: React.FC = () => {
  let posts = '';
  for (let x = 30; x < FW; x += 70) posts += line(x, 18, x, FH, {seed: `fp${x}`, over: [4, 0], breaks: false});
  const bumps: React.ReactNode[] = [];
  for (let i = 0; i < 16; i++) {
    const cx = 100 + i * 190;
    bumps.push(<Fill key={`hf${i}`} d={crown(cx, -60, 130, 110, {seed: `hc${i}`, bumps: 7})} color={i % 2 ? palette.teal : palette.tealDark} offset={[5, 3]} seed={`hcf${i}`} />);
  }
  return (
    <Plane quad={fenceQuad} w={FW} h={FH}>
      {bumps}
      {Array.from({length: 16}, (_, i) => (
        <Ink key={`hi${i}`} d={crown(100 + i * 190, -60, 130, 110, {seed: `hc${i}`, bumps: 7})} width={stroke.ink} open={0.35} />
      ))}
      <Fill rect={[0, 18, FW, FH - 18]} color={palette.white} offset={[4, 2]} seed="fenceF" />
      <Ink d={hline(0, FW, 60, {seed: 'r1'}) + hline(0, FW, FH - 50, {seed: 'r2'})} width={stroke.ink} />
      <Ink d={posts} width={stroke.ink} order="all" />
    </Plane>
  );
};

// ---------------------------------------------------------------- poles, wires and lights

const POLES = [0.0, 0.42, 0.64, 0.78, 0.86].map((k) => {
  const base = rayPoint(VP, [rayX(-430, 1700), 1700], k);
  const s = 1 - k;
  return {x: base[0], y: base[1], s, top: [base[0], base[1] - 1050 * s] as Pt};
});

const Poles: React.FC = () => (
  <>
    {POLES.slice()
      .reverse()
      .map((p, i) => (
        <UtilityPole key={i} x={p.x} y={p.y} h={1050} s={p.s} seed={`up${i}`} />
      ))}
    {/* the power line converging on the vanishing point */}
    <Ink d={POLES.slice(0, -1).map((p, i) => line(p.top[0] - 52 * p.s, p.top[1] + 26 * p.s, POLES[i + 1].top[0] - 52 * POLES[i + 1].s, POLES[i + 1].top[1] + 26 * POLES[i + 1].s, {seed: `pl${i}`, over: [0, 0], breaks: false})).join('')} width={stroke.inkHair} />
  </>
);

const Lights: React.FC = () => {
  const lightAt = NIGHT + 0.05;
  return (
    <>
      {/* foreground strand right across the top of the frame (cropped): pushes the world back */}
      <Festoon x1={-60} y1={40} x2={1140} y2={96} sag={58} n={11} bulb={16} at={0.6} lightAt={lightAt} seed="sl0" width={stroke.ink} />
      <Festoon x1={POLES[1].top[0]} y1={POLES[1].top[1] + 40} x2={1000} y2={760} sag={36} bulb={[8, 7]} at={1.2} lightAt={lightAt + 0.35} seed="sl1" />
      <Festoon x1={POLES[2].top[0]} y1={POLES[2].top[1] + 30} x2={850} y2={812} sag={22} bulb={[5, 4]} at={1.5} lightAt={lightAt + 0.6} seed="sl2" width={stroke.inkHair} />
      <Festoon x1={POLES[3].top[0]} y1={POLES[3].top[1] + 20} x2={720} y2={846} sag={12} n={6} bulb={3} at={1.7} lightAt={lightAt + 0.8} seed="sl3" width={stroke.inkHair} />
    </>
  );
};

// ---------------------------------------------------------------- the queue starts at the camera

/** Two hero walkers strolling into depth (sleeves, hands, hood, rim strip), cut by the frame bottom. */
const Walkers: React.FC = () => {
  const t = useTime();
  const u = prog(t, 0, 12);
  return (
    <>
      <Person x={lerp(300, 336, u)} y={lerp(1760, 1700, u)} s={lerp(1.5, 1.4, u)} at={0.75} build="rise" legs legH={150} walk={1.7} hair="short" acc={['headphones', 'hood']} body={palette.teal} legsColor={palette.tealDark} hairColor={palette.ink} seed="kdW1" ink={stroke.inkBold} />
      <Person x={lerp(815, 780, u)} y={lerp(1815, 1750, u)} s={lerp(1.78, 1.66, u)} at={0.95} build="rise" legs legH={150} walk={1.55} hair="bun" acc={['backpack']} body={palette.sage} legsColor={palette.tan} hairColor={palette.brown} seed="kdW2" ink={stroke.inkBold} />
    </>
  );
};

// ---------------------------------------------------------------- the mascot

const Mascot: React.FC = () => {
  const t = useTime();
  const p = popIn(t, 1.9);
  if (!p.visible) return null;
  return (
    <ElephantTimeline
      draw={drawOut(t, 11.5, 0.3)}
      x={556}
      y={1660}
      scale={1.0 * p.scale}
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
  );
};

// ---------------------------------------------------------------- the scene

export const StreetScene: React.FC = () => (
  <World sky={SKY} push={{to: 1.06, dur: 2.4, anchor: VP}}>
    <Look cascade={{at: 0.03, origin: VP, speed: 3200}}>
      <Sun
        cx={560}
        cy={712}
        r={150}
        horizon={H}
        rise={{at: 0, from: [560, 900]}}
        beats={[1.65, {t: 4.1, amp: 0.11}, {t: 6.95, amp: 0.06}, {t: 8.75, amp: 0.1}, {t: 9.95, amp: 0.07}, {t: 10.85, amp: 0.11}]}
        hops={[{t: 6.05, to: [600, 712], h: 74}]}
        moves={[{at: 7.3, dur: 2.4, y: 930}]}
        drift={[10, 0]}
      />
      <FarCity />
      <FarHills />
      <FarTown />
      <Ground />
      <Houses />
      <Car x={70} y={1300} w={250} at={1.5} seed="kdCar" color={palette.teal} lightsOn={NIGHT + 0.5} />
      <Poles />
      <Fence />
      {[0.55, 0.8].map((k, i) => {
        const base = rayPoint(VP, [1000, 1660], k);
        return <LampPost key={i} x={base[0]} y={base[1]} h={560 * (1 - k)} at={1.0 + i * 0.1} lightAt={NIGHT + 0.15 + i * 0.12} arm="left" seed={`lp${i}`} width={stroke.inkThin} />;
      })}
      {/* a notice board facing the camera on the verge: draw-on, paper drops, the stamp is the scene's hero orange */}
      <Place x={792} y={1012} s={0.42}>
        <Noticeboard x={0} y={0} w={420} h={300} legs={330} at={4.3} seed="kdboard">
          <Paper x={30} y={26} w={150} h={200} at={5.25} entry="drop" seed="kdpaper" stamp={{at: 6.2}} />
          <Paper x={220} y={40} w={160} h={120} at={5.5} entry="drop" seed="kdpaper2" lines={3} />
        </Noticeboard>
      </Place>
      <Crowd
        far={{y: 905, x0: rayX(-40, 905), x1: rayX(980, 905), s: 0.07}}
        near={{y: 1430, x0: rayX(60, 1430), x1: rayX(940, 1430), s: 0.82}}
        rows={10}
        density={0.66}
        spacing={1.25}
        legRows={10}
        at={2.35}
        span={2.0}
        order="back"
        build="rise"
        idle={1.2}
        jitter={{x: 0.3, y: 0.15, scale: [0.6, 1.1]}}
        rim="left"
        seed="kd2crowd"
      />
      <Walkers />
      <Mascot />
      <Lights />
      {/* foreground framing: palm fronds poking in from the top corners (night: one step lighter than the sky) */}
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
