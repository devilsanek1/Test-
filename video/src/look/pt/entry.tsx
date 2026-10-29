// PT lane (patchwork + texture) demo entry, never imported by a film:
//   GL=angle node scripts/render-frames.mjs <Comp> <dir> <t,...> --entry=src/look/pt/entry.tsx --props='{...}'
//   PtPatchworkDemo  props {mode: 'flat' | 'patch' | 'grid'}: lib/patchwork on v2 S1's lens (engine_patchwork.png)
//   PtTextureDemo    props {mode: 'flat' | 'mottle'}: lib/texture per plane, floating 0.2-1.6 s, then a hold (engine_texture.png)
//   PtTextureCal     props {k, seed, scale, chroma, cal, dx, dy, band, big}: the mottle's calibration fields
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {PtPatchworkDemo} from './PatchworkDemo';
import {PtTextureCal} from './TextureCal';
import {PtTextureDemo} from './TextureDemo';

const Root: React.FC = () => (
  <>
    <Composition id="PtPatchworkDemo" component={PtPatchworkDemo} durationInFrames={60} fps={60} width={1080} height={1920} defaultProps={{mode: 'patch' as const}} />
    <Composition id="PtTextureDemo" component={PtTextureDemo} durationInFrames={120} fps={60} width={1080} height={1920} defaultProps={{mode: 'mottle' as const}} />
    <Composition id="PtTextureCal" component={PtTextureCal} durationInFrames={120} fps={60} width={1080} height={1920} defaultProps={{k: 1}} />
  </>
);
registerRoot(Root);
