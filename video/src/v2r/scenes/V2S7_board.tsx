// V2S7_board.tsx (lane L5): Google's board at B for V2S7 (TREATMENT section 5 "Texts on objects", S7; section 8 A5,
// V14): K3's GoogleBoard with its own defaults, which ARE S7's: face = map B (x 150-630, y 700-1220), legs to
// B_LEGS_Y1, shot-local GOOGLE_T (GOOGLE SAYS + the clack 0.30 = 28.36; follows its "AI principles" pen 1.59-1.98,
// complete ON "principles" 30.04; the small row "human oversight" 2.24; bans retaliation "of any kind" pen 2.68-4.02,
// complete ON "of" 32.08; the credit with the header). The same face, frame, type, light and shadow as the deal board
// (S6) and hers (S8): nothing here overrides K3, so the three boards stay equal.
import React from 'react';
import {GoogleBoard} from '../kit/boards';

export const S7Board: React.FC = () => <GoogleBoard />;
