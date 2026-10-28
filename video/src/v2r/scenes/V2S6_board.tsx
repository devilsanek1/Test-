// V2S6_board.tsx (lane L5): S6's deal board = K3's DealBoard (src/v2r/kit/boards), promoted to the SUBJECT tier for the
// whole shot (conform_L5 §2: one closed outline in the stiles' own deep shade, keys at full contrast). The face S6_FACE
// (x 160-640, y 700-1220) inside the contract rect S6.board0 (x 120-680, y 680-1240), legs to the kerb y 1252. On the
// inner clock (film - 24.00): the frame, the tag, the FULL clause and the credit are up when S5's tree uncovers it
// (23.80-23.98); the purpose line pops ON "any" (0.03, film 24.03) with the board's clack; the F12 line on "veto"
// (2.467, film 26.467 = f1588: the sound lane). Its ground shadows are the rig's (V2S6_near S6GroundShadows):
// K3's own flat shadow is off.
import React from 'react';
import {DealBoard} from '../kit/boards';
import {S6} from '../world/map';
import {T0} from './V2S6_rig';

export const S6Board: React.FC = () => (
  <DealBoard tier="subject" clackAt={S6.purposeLineAt - T0} purposeAt={S6.purposeLineAt - T0} f12At={S6.f12LineAt - T0} shadow={false} />
);
