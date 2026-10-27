// V2S5_text.tsx (lane L4): the S5 lettering on objects = K3's pieces (lane L5, src/v2r/kit/boards: ONE type scale and
// one look for every lettered object in the film; TREATMENT section 5 "Texts on objects", section 8 credits):
//   NewsBox  the US newspaper box beside the bench, START coords (face x 470-780, y 880-1230, no masthead): the headline
//            "Google–Pentagon deal for classified work" (key 40 x 3) + its 18 px credit; it rides the deck's start map
//            (small at the rail at the end: x 388-516).
//   Plaque   the viewpoint plaque, END coords, popping ON "Pentagon" (scene 1.88 = 22.43): "The Pentagon" (key 56) /
//            "US Department of Defense" (body 30). The lane's spot (L4_spec section 3): its plate on the terrace just in
//            front of the balustrade, x 441-769, y 1119-1246 (no post: its bottom edge on the floor line), right of the
//            pair and in front of the news box's right half; at its pop (p 0.70, the deck 1.30x) the text stays inside
//            x <= 880; at the end it sits below the Pentagon's facades (their bottom edge ~y 1000-1045).
import React from 'react';
import {NewsBox as K3NewsBox, Plaque as K3Plaque} from '../kit/boards';

/** The plaque's END spot (K3 Plaque: x = centre, y = the plate's bottom edge when stand = false). */
export const PLAQUE_SPOT = {x: 605, y: 1246, stand: false};

export const NewsBox: React.FC = () => <K3NewsBox />;

export const Plaque: React.FC<{at: number}> = ({at}) => <K3Plaque at={at} x={PLAQUE_SPOT.x} y={PLAQUE_SPOT.y} stand={PLAQUE_SPOT.stand} />;
