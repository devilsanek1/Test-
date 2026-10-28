// Video 2 (restart) WATER DEMO: lib/water.tsx (the film's ONE shared water; how-to src/lib/WATER.md, rules
// docs/look/CRAFT.md §f.7) on two sample specs that are not S1's, so the component is proven beyond its first shot. The
// palette module is imported FIRST. Two compositions (1080 x 1920, 60 fps, 4 s):
//   WaterFarSample     lod 'far' (R14): an S5-like far river strip, 23 px tall under a morning sky (the film's S5_SKY),
//                      a far shore and a bridge's arches mirrored as flat bands, flecks in the sun's column, current
//                      lines: no slices at all (the lint's "no slice row under 2 px")
//   WaterAffineSample  an S2-like receding canal: the far quay slopes toward the vanishing point, so its wall, its lit
//                      windows and its lamp posts mirror about the sloped waterline (R1's affine map), the near water
//                      in bars on the shared grid, the low sun's glitter under it
// Render (stills; the far strip is checked zoomed):
//   node scripts/render-frames.mjs WaterFarSample <dir> 2 --entry=src/entry-v2r-water.tsx
//   node scripts/render-frames.mjs WaterAffineSample <dir> 2 --entry=src/entry-v2r-water.tsx
import './v2r/palette';
import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {CM} from './v2r/palette';
import {S2_EVENING, S5_SKY} from './v2r/world/skies';
import {Sky} from './lib/sky';
import {Water, waterProblems} from './lib/water';
import {FAR_BOT, FAR_SHORE, WATER_AFFINE_SAMPLE, WATER_FAR_SAMPLE, nearY, quayY, wall, windows} from './lib/water_samples';

const W = 1080;
const H = 1920;
const FPS = 60;
const PAPER = '#FBF3E6';

// ================================================================= the compositions

const Far: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Sky spec={S5_SKY} />
        <path d={`M-40 ${FAR_SHORE.map((p) => `${p[0]} ${p[1]}`).join('L')}Z`} fill="#B7B9A8" />
        <path d={WATER_FAR_SAMPLE.sources.slice(1, 6).map((s) => `M${s.thing!.map((p) => `${p[0]} ${p[1]}`).join('L')}Z`).join('')} fill="#C9BFB4" />
        <Water spec={WATER_FAR_SAMPLE} t={t} />
        <rect x={-40} y={FAR_BOT} width={1160} height={H - FAR_BOT} fill="#B9CFA5" />
      </svg>
    </AbsoluteFill>
  );
};
const Affine: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Sky spec={S2_EVENING} />
        <path d={`M${wall.map((p) => `${p[0]} ${p[1]}`).join('L')}Z`} fill="#C99683" />
        {windows.map((p, i) => (
          <path key={i} d={`M${p.map((q) => `${q[0]} ${q[1]}`).join('L')}Z`} fill={CM.lamp} />
        ))}
        <path d={`M-40 ${quayY(-40) - 6}L1080 ${quayY(1080) - 6}L1080 ${quayY(1080)}L-40 ${quayY(-40)}Z`} fill={CM.limestone} />
        <path d={`M502 ${quayY(502)}L505 ${quayY(505) - 300}L515 ${quayY(505) - 300}L518 ${quayY(518)}Z`} fill="#9DA3B3" />
        <Water spec={WATER_AFFINE_SAMPLE} t={t} />
        <path d={`M-40 ${nearY(-40)}L1120 ${nearY(1120)}L1120 ${H}L-40 ${H}Z`} fill={CM.paving} />
      </svg>
    </AbsoluteFill>
  );
};

/** The samples' lint (the demo shows it in the browser console when a sample has a problem). */
for (const spec of [WATER_FAR_SAMPLE, WATER_AFFINE_SAMPLE]) {
  const pr = waterProblems(spec, {t1: 4});
  if (pr.length) console.warn(`[water demo] ${spec.id}:\n  ${pr.join('\n  ')}`);
}

const WaterDemoRoot: React.FC = () => (
  <>
    <Composition id="WaterFarSample" component={Far} durationInFrames={4 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="WaterAffineSample" component={Affine} durationInFrames={4 * FPS} fps={FPS} width={W} height={H} />
  </>
);

registerRoot(WaterDemoRoot);
