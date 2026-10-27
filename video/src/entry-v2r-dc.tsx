// K7 Arlington kit entry (video 2 "One Small Window"). The palette import MUST stay first: it rewrites the house theme
// tokens to 10 Canal Mint before any lib module is evaluated (src/v2r/palette.ts). Compositions:
//   KitDC      the kit's contact sheet (2160 x 3000): npx remotion still src/entry-v2r-dc.tsx KitDC out.png --scale=0.5
//   CraneEnd   S5's end frame (the landing hold, alive), 1080 x 1920, 60 fps
//   CraneMove  S5 whole (20.55-24.00 = 207 frames), the ONE crane on the re-fit ease
//   GateDC     S6's set on its lateral truck (24.00-28.06 = 244 frames)
import './v2r/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {KitDC, SHEET_DC, CraneEnd, CraneMove, GateDC} from './v2r/kit/dc/sheets';

const DcRoot: React.FC = () => (
  <>
    <Composition id="KitDC" component={KitDC} fps={60} width={SHEET_DC.w} height={SHEET_DC.h} durationInFrames={60} />
    <Composition id="CraneEnd" component={CraneEnd} fps={60} width={1080} height={1920} durationInFrames={36} />
    <Composition id="CraneMove" component={CraneMove} fps={60} width={1080} height={1920} durationInFrames={207} />
    <Composition id="GateDC" component={GateDC} fps={60} width={1080} height={1920} durationInFrames={244} />
  </>
);

registerRoot(DcRoot);
