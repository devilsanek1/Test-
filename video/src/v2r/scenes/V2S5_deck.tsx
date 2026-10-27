// V2S5_deck.tsx (lane L4): the S5 DECK (the viewpoint terrace in END coords, drawn in the rig's deck plane: pinned on the
// stranger, 2.42x at the start) and the end frame's near frames:
//   S5Deck        the terrace under the figures: floor, balustrade, people, props, life
//   S5DeckOver    over the figures (the stranger's bench backrest hides their backs; the bag)
//   S5TreeLeft    the blossoming terrace tree, the LEFT frame (its own box TREE_BOX: it slides in from the left)
//   S5RightFrame  the corner tree + the end lamppost, the RIGHT frame (its own box RIGHT_BOX)
//   S5WipeProp    the lamppost with two hanging baskets that wipes the backs at the peak (base at (0, 0); the rig moves it)
//   S5NearEnd     screen-space near masses / petals over everything but the start foreground (gets p)
// Import rule: never import V2S5_rig / V2S5_set / V2S5_figs (the rig imports this file).
import React from 'react';
import {XG} from '../../lib/xf';
import {Terrace, Pigeons, StrangerBench, TerraceTree, CornerTree, LampPost, LAMP_RIGHT, NearPetals} from '../kit/dc/terrace';
import {CRANE_T, T1_BOX, L2_BOX, WIPE, type PullBox} from '../kit/dc/crane';

/** The left frame's box: its crown's top-left travels in from the left (end top held at y 642). */
export const TREE_BOX: PullBox = T1_BOX;
/** The right frame's box: the lamppost's base travels in from beyond the bottom-right. */
export const RIGHT_BOX: PullBox = L2_BOX;

export const S5Deck: React.FC = () => (
  <>
    <Terrace />
    <Pigeons />
  </>
);
export const S5DeckOver: React.FC = () => <StrangerBench />;
export const S5TreeLeft: React.FC = () => <TerraceTree burstAt={CRANE_T.april} />;
export const S5RightFrame: React.FC = () => (
  <>
    <CornerTree />
    <XG m={[1, 0, 0, 1, LAMP_RIGHT.x, LAMP_RIGHT.base]}>
      <LampPost h={LAMP_RIGHT.h} />
    </XG>
  </>
);
export const S5WipeProp: React.FC = () => <LampPost h={WIPE.h} basket seed="wipe" />;
export const S5NearEnd: React.FC<{p: number}> = () => <NearPetals n={10} />;
