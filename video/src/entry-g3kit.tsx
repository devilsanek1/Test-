// The shared G3 kit's self-test (not a film): G3KitTest draws public/g3kit/selftest.json (scripts/g3/build_selftest.py),
// every tier-1 delta of docs/G3_ANIMATIC.md §7 on screen. Stills:
//   node scripts/render-frames.mjs G3KitTest out/g3kit 0.5,1.9,3.4,5.2,7.5 --entry=src/entry-g3kit.tsx --scale=0.5
import React from 'react';
import {registerRoot} from 'remotion';
import {G3ReelComposition} from './lib/g3';

const KitRoot: React.FC = () => <G3ReelComposition id="G3KitTest" film="g3kit" animatic="g3kit/selftest.json" />;

registerRoot(KitRoot);
