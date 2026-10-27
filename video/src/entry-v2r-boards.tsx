// K3 lettering + boards kit entry (video 2 "One Small Window"; src/v2r/kit/boards/README.md). The palette import MUST
// stay first: it rewrites the house theme tokens to 10 Canal Mint before any lib module is evaluated (src/v2r/palette.ts).
// Compositions (60 fps; review code in src/v2r/kit/boards/sheets.tsx):
//   KitBoards      the kit's contact sheet (2160 x 3000): every piece 1:1 at its film size, built, labelled, on its shot's
//                  ground; the key frames at phone width (216 px); the one type scale
//   Boards-Deal    S6 whole (24.00-28.06 = 244 f), scene-local s     Boards-Google  S7 whole (28.06-32.93 = 292 f)
//   Boards-Her     S8 whole (32.93-39.08 = 369 f)                     Boards-BBC     S2 film 7.94-10.94 (180 f, FILM s)
//   Boards-S4      S4 whole (14.86-20.55 = 341 f): tag + fingerpost   Boards-S5      S5 whole (20.55-24.00 = 207 f)
//   BoardActions   every preset's timeline in sequence, the landing, the loop un-build (1080 x 1920)
//   GL=angle node scripts/render-frames.mjs KitBoards <dir> 0.5 --entry=src/entry-v2r-boards.tsx --scale=0.5
//   GL=angle node scripts/render-frames.mjs Boards-Google <dir> 0.4,1.8,2.3,4.1 --entry=src/entry-v2r-boards.tsx --scale=1
//   npx remotion render src/entry-v2r-boards.tsx BoardActions out/k3_actions.mp4 --gl=angle --concurrency=2 --scale=0.5
import './v2r/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {
  ACTIONS_DUR,
  BoardActions,
  BoardsBBC,
  BoardsDeal,
  BoardsGoogle,
  BoardsHer,
  BoardsS4,
  BoardsS5,
  COMP_FRAMES,
  KitBoards,
  SHEET_BOARDS,
} from './v2r/kit/boards/sheets';

const BoardsRoot: React.FC = () => (
  <>
    <Composition id="KitBoards" component={KitBoards} fps={60} width={SHEET_BOARDS.w} height={SHEET_BOARDS.h} durationInFrames={60} />
    <Composition id="Boards-Deal" component={BoardsDeal} fps={60} width={1080} height={1920} durationInFrames={COMP_FRAMES.deal} />
    <Composition id="Boards-Google" component={BoardsGoogle} fps={60} width={1080} height={1920} durationInFrames={COMP_FRAMES.google} />
    <Composition id="Boards-Her" component={BoardsHer} fps={60} width={1080} height={1920} durationInFrames={COMP_FRAMES.her} />
    <Composition id="Boards-BBC" component={BoardsBBC} fps={60} width={1080} height={1920} durationInFrames={COMP_FRAMES.bbc} />
    <Composition id="Boards-S4" component={BoardsS4} fps={60} width={1080} height={1920} durationInFrames={COMP_FRAMES.s4} />
    <Composition id="Boards-S5" component={BoardsS5} fps={60} width={1080} height={1920} durationInFrames={COMP_FRAMES.s5} />
    <Composition id="BoardActions" component={BoardActions} fps={60} width={1080} height={1920} durationInFrames={Math.round(ACTIONS_DUR * 60)} />
  </>
);

registerRoot(BoardsRoot);
