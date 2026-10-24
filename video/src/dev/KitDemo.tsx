// KitDemo v2 — 12 s FULL-BLEED eye-level street (reference 2's grammar, the viewer feels small): one-point
// perspective to a vanishing point under a huge low sun, a colossal far skyline silhouetted against it, a crowd seen
// from behind walking into the distance, string lights, captions in the sky with a tone switch at nightfall, and an
// un-build that loops back into frame 0 (the paper/ink state, then the colour cascade from the vanishing point).
// Exercises: World + sky wipes, Plane (projected facades/fence), Crowd depth ink, Person rise, StringLights,
// UtilityPole, LampPost, Sun (rise, beats, hop, set), Look cascade, Standalone loop, SkyCaptions tones, mascot.
// Preview: scripts/sheet.sh KitDemo 0 12 24 out.png
import React from 'react';
import {Standalone} from '../lib/Film';
import {World} from '../lib/World';
import {Sun} from '../lib/Sun';
import {Look} from '../lib/exit';
import {Ink} from '../lib/Ink';
import {Fill} from '../lib/Fill';
import {Plane, rayPoint, wallQuad} from '../lib/persp';
import {palette, skies, stroke, world} from '../lib/theme';
import {lerp, useTime} from '../lib/time';
import {CaptionBeat} from '../lib/Captions';
import {crown, crownTicks, hline, line, polyPath, rect, Pt} from '../lib/sketch';
import {Building, Crowd, LampPost, Noticeboard, Paper, Person, Place, StringLights, Tree, UtilityPole} from '../lib/kit';
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
const SKY = [
  {t: 0, color: skies.day},
  {t: 6.9, color: skies.dusk, wipe: 'down' as const, dur: 0.45},
  {t: 8.45, color: skies.night, wipe: 'down' as const, dur: 0.45},
];
const TONE = [
  {t: 0, tone: 'dark' as const},
  {t: 8.45, tone: 'light' as const},
];

// ---------------------------------------------------------------- far layers (fill-only, atmospheric)

/** The colossal skyline at the vanishing point: two flat rows, the farther one closer to the sky colour. */
const Skyline: React.FC = () => {
  // [x, w, top]: two clusters framing a gap where the sun sits; low blocks across the gap cut the disc's lower edge
  const far: [number, number, number][] = [
    [190, 70, 660], [252, 58, 590], [306, 88, 500], [388, 34, 620],
    [726, 40, 600], [760, 96, 480], [850, 62, 590], [906, 70, 670],
  ];
  const near: [number, number, number][] = [
    [230, 90, 770], [316, 70, 720], [386, 70, 800], [452, 76, 836], [526, 84, 850], [608, 70, 830], [676, 64, 800], [736, 90, 740], [822, 86, 790],
  ];
  const tower = ([x, w, top]: [number, number, number], i: number, color: string, key: string) => (
    <Fill key={`${key}${i}`} d={polyPath([[x, H + 4], [x, top + 18], [x + w * 0.2, top + 18], [x + w * 0.2, top], [x + w * 0.8, top], [x + w * 0.8, top + 18], [x + w, top + 18], [x + w, H + 4]])} color={color} offset={false} seed={`${key}${i}`} />
  );
  return (
    <>
      {far.map((t, i) => tower(t, i, palette.sage, 'skf'))}
      {/* a spire that crosses the sun and pierces the sky */}
      <Fill d={polyPath([[604, H], [604, 600], [613, 520], [622, 600], [622, H]])} color={palette.teal} offset={false} seed="spire" />
      {near.map((t, i) => tower(t, i, palette.teal, 'skn'))}
      <Fill rect={[-200, H - 8, 1480, 14]} color={palette.tealDark} offset={false} seed="hills" />
    </>
  );
};

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
    <Building x={40} y={PL_H + 70} w={560} floors={2} floorH={250} seed="hA" color={palette.cream} roof="pitched" door={1} cols={3} />
    <Tree x={700} y={PL_H + 70} size={130} seed="tA" color={palette.sage} sway={false} />
    <Building x={820} y={PL_H + 70} w={520} floors={2} floorH={240} seed="hB" color={palette.tan} roof="pitched" door={0} cols={3} />
    <Building x={1500} y={PL_H + 70} w={500} floors={2} floorH={230} seed="hC" color={palette.sand} roof="pitched" door={2} cols={3} />
    <Tree x={2120} y={PL_H + 70} size={120} seed="tB" color={palette.teal} sway={false} />
    <Building x={2240} y={PL_H + 70} w={360} floors={2} floorH={230} seed="hD" color={palette.cream} roof="pitched" cols={2} />
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
  const lightAt = 8.5;
  return (
    <>
      {/* foreground strand right across the top of the frame (cropped): pushes the world back */}
      <StringLights x1={-60} y1={40} x2={1140} y2={96} sag={58} n={11} bulb={16} at={0.6} lightAt={lightAt} seed="sl0" width={stroke.ink} />
      <StringLights x1={POLES[1].top[0]} y1={POLES[1].top[1] + 40} x2={1000} y2={760} sag={36} bulb={[8, 7]} at={1.2} lightAt={lightAt + 0.1} seed="sl1" />
      <StringLights x1={POLES[2].top[0]} y1={POLES[2].top[1] + 30} x2={850} y2={812} sag={22} bulb={[5, 4]} at={1.5} lightAt={lightAt + 0.2} seed="sl2" width={stroke.inkHair} />
      <StringLights x1={POLES[3].top[0]} y1={POLES[3].top[1] + 20} x2={720} y2={846} sag={12} n={6} bulb={3} at={1.7} lightAt={lightAt + 0.3} seed="sl3" width={stroke.inkHair} />
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
      x={700}
      y={1688}
      scale={1.0 * p.scale}
      squash={p.squash}
      t={t}
      seed={7}
      keys={[
        {t: 0, pose: 'sit-back'},
        {t: 6.1, pose: 'trunk-up', expression: 'happy'},
        {t: 7.1, pose: 'sit-back'},
      ]}
    />
  );
};

// ---------------------------------------------------------------- the scene

export const StreetScene: React.FC = () => (
  <World sky={SKY}>
    <Look cascade={{at: 0.03, origin: VP, speed: 3200}}>
      <Sun
        cx={560}
        cy={712}
        r={150}
        horizon={H}
        rise={{at: 0, from: [560, 900]}}
        beats={[1.65, {t: 4.1, amp: 0.11}]}
        hops={[{t: 6.05, to: [600, 712], h: 74}]}
        moves={[{at: 7.3, dur: 2.4, y: 930}]}
        drift={[4, 0]}
      />
      <Skyline />
      <Ground />
      <Houses />
      <Poles />
      <Fence />
      {[0.55, 0.8].map((k, i) => {
        const base = rayPoint(VP, [1000, 1660], k);
        return <LampPost key={i} x={base[0]} y={base[1]} h={560 * (1 - k)} at={1.0 + i * 0.1} lightAt={8.55 + i * 0.05} arm="left" seed={`lp${i}`} width={stroke.inkThin} />;
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
        density={0.7}
        spacing={1.25}
        legRows={10}
        at={2.35}
        span={2.0}
        order="back"
        build="rise"
        idle={0.6}
        seed="kd2crowd"
      />
      <Mascot />
      <Lights />
      {/* foreground framing: big figures cropped by the frame edges */}
      <Person x={150} y={1985} s={2.5} at={0.9} build="rise" hair="short" acc={['collar']} body={palette.teal} hairColor={palette.ink} seed="fg1" ink={stroke.inkBold} />
      <Person x={985} y={2010} s={2.2} at={1.15} build="rise" hair="bun" acc={['backpack']} body={palette.sand} hairColor={palette.brown} seed="fg2" ink={stroke.inkBold} />
    </Look>
  </World>
);

export const KitDemo: React.FC = () => (
  <Standalone captions={captions} tone={TONE} unbuild={{at: 11.45, dur: 0.5}} loop={{at: 12}}>
    <StreetScene />
  </Standalone>
);
