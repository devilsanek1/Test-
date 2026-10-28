// Video 2 (restart) SKY DEMO: lib/sky.tsx (ONE CONTINUOUS SKY: an eased OKLab gradient, the low sun's warmth, a
// blue-noise dither; docs/look/CRAFT.md §g, how-to src/lib/SKY.md) on an S1-like evening: the mint caption field on top,
// a warm horizon, the sun low at SUN0 (196, 772) r 52 (map.ts) behind a simple far skyline, the wing on the right. The
// palette module is imported FIRST. One parametric composition (1080 x 1920, 60 fps, 3 s, a locked camera unless
// `float`):
//   SkyDemo2R    props {variant: 'after' (lib/sky, default) | 'before' (a plain 2-stop SVG gradient, mint at the band's
//                foot -> peach at the horizon, hex stops, no dither but Chrome's own) | 'steps' (S1's six flat steps and
//                its 1.6x halo, as on 2026-10-27), amp (dither codes, default 2), grain (px, default 2), dither (true), warmth
//                (true), scene (true: the skyline, the sun, the wing), caption (true), float (px: a slow 2D drift of the
//                whole set, 0 = locked)}
//   SkyBefore2R / SkySteps2R   the same with variant 'before' / 'steps'.
// Render (stills at full size for the banding check; the clip for the encode tests):
//   node scripts/render-frames.mjs SkyDemo2R <dir> 1 --entry=src/entry-v2r-sky.tsx
//   node scripts/render-media.mjs SkyDemo2R <out>.mp4 --entry=src/entry-v2r-sky.tsx --master
//   python3 -I scripts/qa/check_banding.py <frame.png | clip.mp4> --region 0,0,330,800
import './v2r/palette';
import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame, useVideoConfig} from 'remotion';
import {CM} from './v2r/palette';
import {SUN0} from './v2r/world/map';
import {S1_EVENING, S1_HORIZON} from './v2r/world/skies';
import {eveningSky, horizonColor, mixSky, oklch, Sky, skyProblems} from './lib/sky';
import {captionFontStack, useCaptionFont} from './lib/font';

const W = 1080;
const H = 1920;
const FPS = 60;

/** S1's warm horizon and evening sky (src/v2r/world/skies.ts: the film's one sky per set): the mint flat through the
 *  caption band, a gentle zenith, a pale warm light band, the peach horizon at y 800 (behind the far roofs), the low
 *  sun's warmth 340 x 204 around SUN0. */
const HORIZON = S1_HORIZON;

/** A zenith `drop` OKLCH L under the band colour, a touch richer and cooler (eveningSky's recipe). */
const zenithOf = (drop: number) => {
  const b = oklch(CM.sky);
  return {l: b.l - drop, c: b.c + drop / 3, h: b.h + (drop > 0 ? 6 : 0)};
};

/** S1's sky on 2026-10-27 (L1, V2S1_set_core): the mint flat to y 572, then five flat steps. */
const STEPS = ['#BCDCCF', '#CEDECD', '#DFE1CB', '#EDE3C9', '#F8E0C3', '#FBD9BB'];
const STEPS_Y = [572, 618, 664, 708, 752];

export type SkyDemoProps = {
  variant?: 'after' | 'before' | 'steps';
  amp?: number;
  grain?: number;
  dither?: boolean;
  warmth?: boolean;
  scene?: boolean;
  caption?: boolean;
  float?: number;
  /** The zenith's OKLCH L drop from the band colour (eveningSky's default 0.012 when unset). */
  zenithDrop?: number;
};

const Before: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="skyBefore" gradientUnits="userSpaceOnUse" x1={0} y1={556} x2={0} y2={800}>
        <stop offset={0} stopColor={CM.sky} />
        <stop offset={1} stopColor={HORIZON} />
      </linearGradient>
    </defs>
    <rect x={-120} y={-120} width={1320} height={2160} fill="url(#skyBefore)" />
  </g>
);

const Steps: React.FC = () => (
  <g>
    {STEPS.map((c, i) => {
      const y0 = i === 0 ? -120 : STEPS_Y[i - 1];
      const y1 = i < STEPS_Y.length ? STEPS_Y[i] : 2040;
      return <rect key={i} x={-120} y={y0} width={1320} height={y1 - y0} fill={c} />;
    })}
    <circle cx={SUN0.x} cy={SUN0.y} r={SUN0.r * 1.6} fill="#FFD4AE" />
  </g>
);

/** A far skyline, the sun and the wing: flat shapes only, the same in every variant (the sky is what is under test). */
const Scene: React.FC = () => {
  const haze = horizonColor(S1_EVENING, SUN0.x);
  const far = mixSky(CM.brickLight, haze, 0.62);
  const far2 = mixSky(CM.stucco, haze, 0.5);
  const roofs: [number, number, number][] = [
    [-20, 70, 790],
    [50, 120, 772],
    [120, 160, 796],
    [160, 230, 764],
    [230, 300, 788],
    [300, 350, 776],
  ];
  return (
    <g>
      <circle cx={SUN0.x} cy={SUN0.y} r={SUN0.r} fill={CM.sun} />
      {roofs.map(([x0, x1, y], i) => (
        <rect key={i} x={x0} y={y} width={x1 - x0} height={1200 - y} fill={i % 2 ? far : far2} />
      ))}
      <rect x={330} y={600} width={760} height={600} fill={CM.stucco} />
      <rect x={330} y={600} width={760} height={42} fill={CM.brickLight} />
      {[380, 560, 740, 920].map((x) => (
        <rect key={x} x={x} y={690} width={110} height={150} fill={CM.glass} />
      ))}
      <rect x={-120} y={1150} width={1320} height={160} fill={CM.water} />
      <rect x={-120} y={1310} width={1320} height={730} fill={CM.paving} />
    </g>
  );
};

const Caption: React.FC = () => {
  const ok = useCaptionFont();
  if (!ok) return null;
  return (
    <g fontFamily={captionFontStack} fontSize={72} fill={CM.ink} textAnchor="middle">
      <text x={540} y={372}>
        SHE SAYS: NO CRITICIZING
      </text>
      <text x={540} y={452}>
        GOOGLE. FOR LIFE.
      </text>
    </g>
  );
};

export const SkyDemo2R: React.FC<SkyDemoProps> = ({variant = 'after', amp = 2, grain = 2, dither = true, warmth = true, scene = true, caption = true, float = 0, zenithDrop}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const base = zenithDrop === undefined ? S1_EVENING : eveningSky({band: CM.sky, horizon: HORIZON, horizonY: 800, sun: {x: SUN0.x, y: SUN0.y, rx: 340}, zenith: zenithOf(zenithDrop)});
  const spec = {...base, sun: warmth ? base.sun : null, dither: dither ? {amp, grain} : (false as const)};
  const dx = float ? float * Math.sin(t * 0.9) : 0;
  const dy = float ? float * 0.5 * Math.sin(t * 0.63) : 0;
  return (
    <AbsoluteFill style={{backgroundColor: '#FFFFFF'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g transform={`translate(${dx} ${dy})`}>
          {variant === 'after' ? <Sky spec={spec} /> : variant === 'before' ? <Before /> : <Steps />}
          {scene ? <Scene /> : null}
        </g>
        {caption ? <Caption /> : null}
      </svg>
    </AbsoluteFill>
  );
};

/** The demo sky's own check (CRAFT §g): logged once per bundle, [] = OK. */
const probs = skyProblems(S1_EVENING, {ink: CM.ink});
if (probs.length) console.warn('[sky demo] skyProblems:', probs);

const Root: React.FC = () => (
  <>
    <Composition id="SkyDemo2R" component={SkyDemo2R} durationInFrames={3 * FPS} fps={FPS} width={W} height={H} defaultProps={{variant: 'after'} as SkyDemoProps} />
    <Composition id="SkyBefore2R" component={SkyDemo2R} durationInFrames={3 * FPS} fps={FPS} width={W} height={H} defaultProps={{variant: 'before'} as SkyDemoProps} />
    <Composition id="SkySteps2R" component={SkyDemo2R} durationInFrames={3 * FPS} fps={FPS} width={W} height={H} defaultProps={{variant: 'steps'} as SkyDemoProps} />
  </>
);

registerRoot(Root);
