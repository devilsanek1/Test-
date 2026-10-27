// Video 2 (restart) LIGHT DEMO: lib/light.tsx (the film-agnostic light and shadow module, docs/look/CRAFT.md §d; how-to
// src/lib/LIGHT.md) under the canal evening sun, drawn in the tiered clean pen (src/v2r/pen.ts). The palette module is
// imported FIRST. Compositions (1080 x 1920, 60 fps):
//   LightDemo2R   a towpath at golden hour: her (the subject) by the water, Pip on a mooring bollard, a bench, a heritage
//                 lamp (off at golden hour), a moored narrowboat. ONE rig: the low sun behind-left (shadows fall right and
//                 a little toward us), the canal shadow family (CM.shadeWarm at 0.20 / 0.28 / 0.48), form / cast / contact
//                 shadows on everything that stands, the far facades one step down (they face away from the sun), the
//                 foreground in an off-screen terrace's shade, a rim on her key side only.
//   LightRig2R    the rig's lightProblems() on the surfaces its shadows land on, and the pen's penProblems(): both 0.
// Render (always GL=angle; 4 shared CPUs; stills at 0.4) and the gate (an A/B of the same frame):
//   GL=angle node scripts/render-frames.mjs LightDemo2R <on> 1 --entry=src/entry-v2r-light.tsx --scale=0.4
//   GL=angle node scripts/render-frames.mjs LightDemo2R <off> 1 --entry=src/entry-v2r-light.tsx --scale=0.4 --props='{"lightOff":true}'
//   python3 -I scripts/qa/check_light.py <off>/f00060.png <on>/f00060.png --subject 420,1380,530,1570 --sky '#BCDCCF'
// The film's own rigs (one per set) come from docs/v2/THROUGHLINE.md; CANAL_EVENING here is the demo's example.
import './v2r/palette';
import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {CM, skyBands, TOD} from './v2r/palette';
import {penProblems} from './v2r/pen';
import {World} from './lib/World';
import {Fill} from './lib/Fill';
import {Tier} from './lib/tier';
import {CastShadow, ContactShadow, FormShade, Lit, lightProblems, makeRig, polyD, Rim, Shade, ShadowLayer, Shadow, sunLight, tintFamily} from './lib/light';
import {Bench, Bollard, FarRoofs, Lamp, Narrowboat, Water} from './v2r/kit/canal';
import {Her} from './v2r/kit/cast';
import {Pip} from './v2r/kit/pip';

const W = 1080;
const H = 1920;
const FPS = 60;

/** The canal shadow family: the palette's own shadow colour (CM.shadeWarm) at three strengths. On the paving form /
 *  cast / contact dL* -9 / -13 / -22, chroma kept (0.95-1.1x), turning 11-29 deg toward rose; on the water the hue turns
 *  toward violet (+3..+15), never grey for form and cast (no contact strips on water). Day: no ambient step. */
export const TINT_CANAL = tintFamily(CM.shadeWarm, {form: 0.2, cast: 0.28, contact: 0.48}, '#FFFFFF');

/** The demo's rig: the evening sun low behind-left (shadows fall right, 12 deg toward us, capped at 0.8 h, CRAFT §d.5);
 *  a lamp's pool (when the lamps light at sunset) two steps over the paving (+5 / +8 L*). */
export const CANAL_EVENING = makeRig({
  name: 'towpath, golden hour',
  key: sunLight({toward: 12, el: 36}),
  ground: 0.28,
  cap: 0.8,
  tints: TINT_CANAL,
  pool: ['#FBE6C2', '#FFF2D9'],
  surface: CM.paving,
  rim: '#FFE7BE',
  window: CM.lamp,
  windowOff: CM.lamp,
  form: {frac: 0.3},
});

// ---------------------------------------------------------------- the set (canvas px)

const GROUND_Y = 1140; // our towpath's back edge (the coping's foot)
const LAMP = {x: 170, y: 1500, h: 620};
const BENCH = {x: 790, y: 1430, w: 230};
const HER = {x: 470, y: 1560, h: 170};
const BOLLARD = {x: 930, y: 1650, h: 56};
const PIP = {x: 930, y: 1650 - 56 * 0.78 - 8, size: 92};

/** The bench's footprint on the ground (the iron ends and the seat's shadow outline), for its cast shadow. */
const benchPts = (): [number, number][] => {
  const {x, y, w} = BENCH;
  return [
    [x - w / 2, y - 10],
    [x + w / 2, y - 10],
    [x + w / 2, y + 2],
    [x - w / 2, y + 2],
  ];
};

const LightDemo2R: React.FC = () => {
  const her = <Her x={HER.x} y={HER.y} h={HER.h} pose="stand" view="rear34" seed="demoHer" />;
  const bench = <Bench x={BENCH.x} y={BENCH.y} w={BENCH.w} view="back" seed="demoBench" />;
  const boat = <Narrowboat x={120} water={1092} len={600} h={84} dir={1} seed="demoBoat" cabin={CM.sage} topView={8} roofItems panel={false} smoke={false} />;
  const bollardD = polyD([
    [BOLLARD.x - BOLLARD.h * 0.38, BOLLARD.y],
    [BOLLARD.x - BOLLARD.h * 0.42, BOLLARD.y - BOLLARD.h * 0.9],
    [BOLLARD.x + BOLLARD.h * 0.42, BOLLARD.y - BOLLARD.h * 0.9],
    [BOLLARD.x + BOLLARD.h * 0.38, BOLLARD.y],
  ]);
  return (
    <World sky={skyBands('golden')} tod={TOD.golden} horizon={760}>
      <Lit rig={CANAL_EVENING}>
        {/* the environment: far bank, water, the moored boat, our towpath (flat, no line) */}
        <Tier tier="environment">
          <FarRoofs base={900} top={690} seed="demoFar" rows={3} win={7} />
          <Water y0={880} y1={1120} seed="demoWater" bankShade={10} ripples={22} glints={10} reflTop={890} reflections={[{x0: 140, x1: 700, color: CM.sage, depth: 40}]} />
          {boat}
          <Fill rect={[-40, 1118, 1160, 24]} color={CM.limestone} />
          <Fill rect={[-40, GROUND_Y, 1160, H - GROUND_Y + 40]} color={CM.paving} backdrop />
        </Tier>
        {/* the far facades face away from the low sun: the whole bank one form step down; the boat's hull side too */}
        <Shade d={polyD([[-60, 640], [1140, 640], [1140, 902], [-60, 902]])} />
        <FormShade of={boat} c={[420, 1060]} size={[600, 110]} frac={0.28} />
        {/* ground shadows: one multiply layer after the ground, before what stands on it */}
        <ShadowLayer>
          <ContactShadow x={LAMP.x} y={LAMP.y} w={34} />
          <CastShadow x={LAMP.x} y={LAMP.y} w={18} h={LAMP.h} />
          <ContactShadow x={BENCH.x} y={BENCH.y} w={BENCH.w} h={10} />
          <CastShadow x={BENCH.x} y={BENCH.y} w={BENCH.w} pts={benchPts()} h={BENCH.w * 0.42} />
          <ContactShadow x={HER.x} y={HER.y} w={44} k={1.2} />
          <CastShadow x={HER.x} y={HER.y} w={40} h={HER.h} />
          <ContactShadow x={BOLLARD.x} y={BOLLARD.y} w={BOLLARD.h * 0.84} />
          <CastShadow x={BOLLARD.x} y={BOLLARD.y} w={BOLLARD.h * 0.8} h={BOLLARD.h + PIP.size * 0.9} />
          {/* the off-screen terrace behind-left shades the foreground: one cast step, a soft edge */}
          <Shadow d={polyD([[-40, 1700], [1120, 1790], [1120, 1960], [-40, 1960]])} soft={12} />
        </ShadowLayer>
        <Lamp x={LAMP.x} y={LAMP.y} h={LAMP.h} seed="demoLamp" />
        {bench}
        <Bollard x={BOLLARD.x} y={BOLLARD.y} h={BOLLARD.h} seed="demoBollard" />
        <ShadowLayer>
          <ContactShadow x={PIP.x} y={BOLLARD.y - BOLLARD.h * 0.98} w={52} h={7} />
        </ShadowLayer>
        <Pip x={PIP.x} y={BOLLARD.y - BOLLARD.h * 0.98} size={PIP.size} facing="back" seed="demoPip" idle={0} />
        {her}
        {/* form: the side away from the sun on each thing in the light */}
        <FormShade of={bench} c={[BENCH.x, BENCH.y - 50]} size={[BENCH.w, 100]} />
        <FormShade d={bollardD} kind="band" />
        <FormShade of={her} c={[HER.x, HER.y - HER.h / 2]} size={[52, HER.h]} />
        <FormShade d={polyD([[LAMP.x - 6, LAMP.y - LAMP.h * 0.08], [LAMP.x + 6, LAMP.y - LAMP.h * 0.08], [LAMP.x + 5, LAMP.y - LAMP.h * 0.8], [LAMP.x - 5, LAMP.y - LAMP.h * 0.8]])} frac={0.4} />
        {/* the subject's lit edge, on its key side only */}
        <Rim of={her} c={[HER.x, HER.y - HER.h / 2]} size={[52, HER.h]} width={4} />
      </Lit>
    </World>
  );
};

// ---------------------------------------------------------------- the rig check

const SURFACES: Record<string, string> = {
  paving: CM.paving,
  stucco: CM.stucco,
  limestone: CM.limestone,
  brickLight: CM.brickLight,
  brick: CM.brick,
  wood: CM.line,
  coatOat: CM.coatOat,
  bandGold: CM.bandGold,
};

const LightRig2R: React.FC = () => {
  const probs = [...lightProblems(CANAL_EVENING, SURFACES, {ground: CM.paving}), ...penProblems(CM)];
  const lines = [`rig '${CANAL_EVENING.name}': form ${CANAL_EVENING.tints.form} cast ${CANAL_EVENING.tints.cast} contact ${CANAL_EVENING.tints.contact}`, `${probs.length} problems`, ...probs];
  return (
    <AbsoluteFill style={{background: CM.paper}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {lines.map((l, i) => (
          <text key={i} x={40} y={80 + i * 40} fontSize={26} fontFamily="'DejaVu Sans', sans-serif" fill={i === 1 && probs.length ? '#C4291C' : CM.ink}>
            {l}
          </text>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const V2RLightRoot: React.FC = () => (
  <>
    <Composition id="LightDemo2R" component={LightDemo2R} durationInFrames={2 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="LightRig2R" component={LightRig2R} durationInFrames={1} fps={FPS} width={W} height={H} />
  </>
);

registerRoot(V2RLightRoot);
