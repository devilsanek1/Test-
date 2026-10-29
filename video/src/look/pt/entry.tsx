// PT lane (patchwork + texture) demo entry: GL=angle node scripts/render-frames.mjs <Comp> <dir> <t> --entry=src/look/pt/entry.tsx
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {PtProbe} from './probe';
import {PtProbe2} from './probe2';
import {PtPatchworkDemo} from './PatchworkDemo';

const Root: React.FC = () => (
  <>
    <Composition id="PtProbe" component={PtProbe} durationInFrames={60} fps={60} width={1080} height={1920} defaultProps={{variant: 'turb' as const, dx: 0, k1: 0.09, freq: 0.012, oct: 2}} />
    <Composition id="PtPatchworkDemo" component={PtPatchworkDemo} durationInFrames={60} fps={60} width={1080} height={1920} defaultProps={{mode: 'patch' as const}} />
    <Composition id="PtProbe2" component={PtProbe2} durationInFrames={120} fps={60} width={1080} height={1920} defaultProps={{variant: 'none' as const}} />
  </>
);
registerRoot(Root);
