// Video 2 (restart) K5 Pip entry: the character sheet, the actions clip and a design study. The palette import MUST
// stay first: it rewrites the house theme tokens to 10 Canal Mint before any lib module is evaluated.
//   npx remotion still src/entry-v2r-pip.tsx KitPip <out.png> --frame=60 --scale=0.5 --gl=angle
//   npx remotion render src/entry-v2r-pip.tsx PipActions <out.mp4> --gl=angle --concurrency=2 --scale=0.5
import './v2r/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {PipStudy, STUDY} from './v2r/kit/pip/PipStudy';
import {PipZoom, ZOOM} from './v2r/kit/pip/PipZoom';
import {KitPip, SHEET} from './v2r/kit/pip/KitPip';
import {ACTIONS_DUR, PipActions} from './v2r/kit/pip/PipActions';
import {PipSweep, SWEEP_DUR} from './v2r/kit/pip/PipSweep';
import {PipWatchStudy, WATCH_STUDY} from './v2r/kit/pip/PipWatchStudy';

const PipRoot: React.FC = () => (
  <>
    <Composition id="KitPip" component={KitPip} fps={60} width={SHEET.w} height={SHEET.h} durationInFrames={240} />
    <Composition id="PipActions" component={PipActions} fps={60} width={1080} height={1920} durationInFrames={Math.round(ACTIONS_DUR * 60)} />
    <Composition id="PipSweep" component={PipSweep} fps={60} width={600} height={400} durationInFrames={Math.round(SWEEP_DUR * 60)} />
    <Composition id="PipStudy" component={PipStudy} fps={60} width={STUDY.w} height={STUDY.h} durationInFrames={120} defaultProps={{size: 200}} />
    <Composition id="PipWatchStudy" component={PipWatchStudy} fps={60} width={WATCH_STUDY.w} height={WATCH_STUDY.h} durationInFrames={60} />
    <Composition id="PipZoom" component={PipZoom} fps={60} width={ZOOM.w} height={ZOOM.h} durationInFrames={900} defaultProps={{size: 300}} />
  </>
);

registerRoot(PipRoot);
