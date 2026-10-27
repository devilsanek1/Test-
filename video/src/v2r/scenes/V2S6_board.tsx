// V2S6_board.tsx (lane L5): S6's deal board slot = K3's DealBoard (src/v2r/kit/boards), at its scene-local defaults:
// the face S6_FACE (x 160-640, y 700-1220) inside the contract rect S6.board0 (x 120-680, y 680-1240), legs to the kerb
// y 1252; at the cut the frame, the tag, the FULL clause and the credit are up and the board clacks (0); the purpose
// line pops ON "any" (0.03); the F12 line pops on "veto" (2.40). Drawn in MID-plane coordinates: the gate's mid plane
// carries it (the contract drift, exactly 100 px over the shot, parallel to the lens: pure translation, text sharp).
// (The stand-in this file held before K3 landed is in git history: commit 39a4531.)
import React from 'react';
import {DealBoard} from '../kit/boards';

export const S6Board: React.FC = () => <DealBoard />;
