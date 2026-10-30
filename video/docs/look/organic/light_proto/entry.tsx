// The PROPER LIGHT bench's entry (docs/look/organic/light.md §7): v2's palette module FIRST, exactly as
// src/entry-look-paint.tsx does, then one composition, LightBench (props: kind, n, captions). From video/:
//   python3 docs/look/organic/light_proto/make_assets.py <renders> /tmp/organic/light/proto_gen --t 1.6
//   node scripts/render-frames.mjs LightBench <dir> 1.0,1.05,... --entry=docs/look/organic/light_proto/entry.tsx \
//        --concurrency=1 --props='{"kind":"rimMask","n":4}'
import '../../../../src/v2r/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {LightBench, type LightBenchProps} from './LightBench';

const defaults: LightBenchProps = {kind: 'none', n: 1, captions: true};

const Root: React.FC = () => <Composition id="LightBench" component={LightBench} defaultProps={defaults} durationInFrames={420} fps={60} width={1080} height={1920} />;

registerRoot(Root);
