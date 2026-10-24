// EdgeLab — the screen-edge treatments (src/lib/edges, docs/EDGES.md) over three representative shots, so the variants
// can be judged side by side and in motion. Composition `EdgeLab` (6 s), driven by props:
//   {variant: 'clean' | 'trim' | 'panel' | 'vignette' | 'construction' | 'rough-tb', shot: 'street' | 'monument' |
//    'vista', amount?: number, seed?: string, from?: number (shot seconds at lab t 0), cam?: boolean, margin?: 'actors' |
//    'strict' | 'look', paper?: 'white' | 'warm' | colour, debug?: boolean, captions?: boolean}
// Shots: KitDemo's eye-level street (default from 7.6 s, dusk), CineDemo's backlit monument (shot B, 13.0 s) and its
// Arcane vista (shot A, 4.6 s). `cam` adds a slow lab push + pan to the street (its own push ends at 2.4 s) so the
// edge can be judged while the world moves under it; the monument cranes by itself.
//   scripts/still.sh EdgeLab 0 out.png --props='{"variant":"panel","shot":"monument"}'
//   npx remotion render src/index.ts EdgeLab out.mp4 --frames=0-149 --scale=0.5 --concurrency=2 \
//     --props='{"variant":"panel","shot":"street","from":3.2,"cam":true}'
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {EdgeTreatment, EdgeVariant} from '../lib/edges';
import {StageContexts, StageCam} from '../lib/stage';
import {SkyCaptions, CaptionBeat} from '../lib/Captions';
import {palette} from '../lib/theme';
import {ease, prog} from '../lib/time';
import {StreetScene} from './KitDemo';
import {CineDemo} from './CineDemo';

export type EdgeShot = 'street' | 'monument' | 'vista';
/** Each shot's lab start and its screen vanishing point (for the construction guides). */
export const EDGE_SHOTS: Record<EdgeShot, {label: string; from: number; vp: [number, number]}> = {
  street: {label: 'KitDemo street (7.6 s, dusk)', from: 7.6, vp: [560, 768]},
  monument: {label: 'CineDemo monument (13.0 s)', from: 13.0, vp: [540, 1660]},
  vista: {label: 'CineDemo vista (4.6 s)', from: 4.6, vp: [600, 1000]},
};

const CAPTIONS: CaptionBeat[] = [
  {s: 0, lines: [{text: 'So now comes', s: 0}, {text: 'step two, the slow one.', s: 0}], highlights: [{text: 'slow', s: 0}], style: 'hook'},
  {s: 2.6, lines: [{text: 'The edge stays put', s: 2.6}, {text: 'while the world moves.', s: 3.2}], highlights: [{text: 'edge', s: 2.75}]},
];

/** Lab camera for the street: a slow push (x1.07) and a 40 px pan over 5 s, in-out sine (MOTION.camera.slow). */
const labCam = (t: number): StageCam => {
  const p = prog(t, 0, 5, ease.inOutSine);
  return {ox: 40 * p, oy: -12 * p, zoom: 1 + 0.07 * p, rot: 0};
};

const HIDE_CINE_CAPTIONS = '.edgeLabCine div > svg ~ svg{display:none !important}';

export const EdgeLab: React.FC<{
  variant?: EdgeVariant;
  shot?: EdgeShot;
  amount?: number;
  seed?: string;
  from?: number;
  cam?: boolean;
  margin?: 'actors' | 'strict' | 'look';
  debug?: boolean;
  captions?: boolean;
  paper?: 'white' | 'warm' | string;
}> = ({variant = 'panel', shot = 'street', amount = 1, seed = 'film', from, cam = false, margin = 'actors', debug = false, captions = true, paper}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const T = frame / fps;
  const start = from ?? EDGE_SHOTS[shot].from;
  const scene =
    shot === 'street' ? (
      <StageContexts scene={{id: 'edgelab', start: 0, end: 1e9, dur: 1e9}} cam={cam ? labCam(T) : undefined}>
        <StreetScene />
      </StageContexts>
    ) : (
      <div className="edgeLabCine" style={{position: 'absolute', inset: 0}}>
        <style>{HIDE_CINE_CAPTIONS}</style>
        <CineDemo />
      </div>
    );
  return (
    <AbsoluteFill style={{background: palette.sky, overflow: 'hidden'}}>
      <EdgeTreatment variant={variant} seed={seed} amount={amount} margin={margin} debug={debug} paper={paper} vp={EDGE_SHOTS[shot].vp}>
        <Sequence from={-Math.round(start * fps)} layout="none">
          {scene}
        </Sequence>
      </EdgeTreatment>
      {captions ? <SkyCaptions beats={CAPTIONS} tone="dark" /> : null}
    </AbsoluteFill>
  );
};
