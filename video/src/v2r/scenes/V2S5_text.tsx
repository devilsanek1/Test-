// V2S5_text.tsx (lane L4): the S5 lettering on objects = K3's pieces (lane L5, src/v2r/kit/boards: ONE type scale and
// one look for every lettered object in the film; TREATMENT section 5 "Texts on objects", section 8 credits):
//   NewsBox  the US newspaper box beside the bench, START coords (face x 470-780, y 880-1230, no masthead): the headline
//            "Google–Pentagon deal for classified work" at BODY size 34 (the director, 2026-10-27: 40 is off the type
//            scale; nothing between 34 and 56) in 3 lines + its 18 px credit; it rides the deck's start map (small at the
//            rail at the end: x 388-516). K3's box is drawn as is and its front page is re-lettered here at 34 (K3 still
//            sets 40: a REQUEST to L5 to move its default).
//   Plaque   the viewpoint plaque, END coords, popping ON "Pentagon" (scene 1.88 = 22.43): "The Pentagon" (key 56) /
//            "US Department of Defense" (body 30). The lane's spot (L4_spec section 3): its plate on the terrace just in
//            front of the balustrade, x 441-769, y 1119-1246 (no post: its bottom edge on the floor line), right of the
//            pair and in front of the news box's right half; at its pop (p 0.70, the deck 1.30x) the text stays inside
//            x <= 880; at the end it sits below the Pentagon's facades (their bottom edge ~y 1000-1045).
import React from 'react';
import {Fill} from '../../lib/Fill';
import {XG, mat} from '../../lib/xf';
import {polyPath} from '../../lib/sketch';
import {S5} from '../world/map';
import {NewsBox as K3NewsBox, Plaque as K3Plaque, WorldText, TYPE, TXT_NEWS_BOX} from '../kit/boards';
import {NEWS_BOX, SMALL_COLORS} from '../kit/boards/small';

/** The plaque's END spot (K3 Plaque: x = centre, y = the plate's bottom edge when stand = false). */
export const PLAQUE_SPOT = {x: 605, y: 1246, stand: false};

const rectD = (x0: number, y0: number, x1: number, y1: number) => polyPath([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);

/** The front page at body size (box units, the K3 box's own 310 x 350 frame): page, head rules, the 3-line headline at
 *  34, a short rule, the 18 px credit. Drawn over K3's page (same window, same colours). */
const PAGE34 = {headline: [104, 142, 180], midRule: 195, credit: [218, 239]};

export const NewsBox: React.FC = () => {
  const r = S5.start.newsBox;
  const N = NEWS_BOX;
  const W = N.window;
  const C = SMALL_COLORS;
  const cx = N.w / 2;
  const m = mat.compose(mat.translate(r.x0, r.y0), mat.scale((r.x1 - r.x0) / N.w, (r.y1 - r.y0) / N.h));
  return (
    <>
      <K3NewsBox />
      <XG m={m}>
        <Fill d={rectD(W.x0 + 4, W.y0 + 3.5, W.x1, W.y1)} color={C.face} offset={false} seed="s5nb/page" />
        <Fill d={rectD(W.x0 + 14, N.rules[0] - 0.55, W.x1 - 12, N.rules[0] + 0.55) + rectD(W.x0 + 14, N.rules[1] - 0.55, W.x1 - 12, N.rules[1] + 0.55)} color={C.pageRule} offset={false} seed="s5nb/rules" />
        <Fill d={rectD(cx - 72, PAGE34.midRule - 0.6, cx + 72, PAGE34.midRule + 0.6)} color={C.pageRule} offset={false} seed="s5nb/mid" />
        {TXT_NEWS_BOX.headline.map((s, i) => (
          <WorldText key={`h${i}`} x={cx} y={PAGE34.headline[i]} size={TYPE.body} text={s} anchor="middle" weight={0} maxW={W.x1 - W.x0 - 16} seed={`s5nb/h${i}`} />
        ))}
        {TXT_NEWS_BOX.credit.map((s, i) => (
          <WorldText key={`c${i}`} x={cx} y={PAGE34.credit[i]} size={TYPE.credit} text={s} anchor="middle" maxW={W.x1 - W.x0 - 16} seed={`s5nb/c${i}`} />
        ))}
      </XG>
    </>
  );
};

export const Plaque: React.FC<{at: number}> = ({at}) => <K3Plaque at={at} x={PLAQUE_SPOT.x} y={PLAQUE_SPOT.y} stand={PLAQUE_SPOT.stand} />;
