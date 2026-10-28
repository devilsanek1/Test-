// V2S5_text.tsx (lane L4): the S5 lettering on objects = K3's pieces (lane L5, src/v2r/kit/boards: ONE type scale and
// one look for every lettered object in the film; TREATMENT section 5 "Texts on objects", section 8 credits):
//   NewsBox  the US newspaper box beside the bench, START coords (face x 470-780, y 880-1230, no masthead): the headline
//            "Google–Pentagon deal for classified work" at 44 px in 4 rows (REVIEW_1 MUST 3: few and big, every drawn
//            line >= 44 px; the 276-unit page holds "Google–Pentagon" on one row only under 44), no credit (the post
//            carries it: docs/v2/POSTING_KIT.md); it rides the deck's start map (small at the rail at the end: x 388-516).
//            K3's box is drawn as is and its front page is re-lettered here.
//   Plaque   the viewpoint plaque, END coords, popping ON "Pentagon" (scene 1.88 = 22.43): "The Pentagon" (key 56) alone
//            (its 30 px body is not drawn since REVIEW_1 MUST 3). The lane's spot (L4_spec section 3): its plate on the terrace just in
//            front of the balustrade, x 441-769, y 1110-1237 (no post: its bottom edge on the border band, 7 px in front
//            of the balustrade's base), right of the pair and in front of the news box's right half; at its pop (p 0.70,
//            the deck 1.30x) the text stays inside x <= 880; at the end it sits below the Pentagon's facades (their bottom
//            edge ~y 1000-1045). Tier A from its pop (conform_L4 §5). Its separation (check_depth "melts", QA
//            2026-10-28: at y 1119-1246 the limestone face and its frame sat on the light paving and balustrade, median
//            |dL*| 5.2; with its top on the Pentagon's cast band still 6.9-8.3, 34 % at one value): K3's DARK PANEL
//            (`panel="dark"`, the integrator 2026-10-28, L4's request): a bronze-dark plate (L* 36) with limestone letters
//            in the same bronze frame, against the paving's L* ~75-87; its foot on its own contact shadow (+ its cast,
//            left in the end light).
import React from 'react';
import {Fill} from '../../lib/Fill';
import {useTime} from '../../lib/time';
import {CastShadow, ContactShadow, ShadowLayer, fromLch} from '../../lib/light';
import {Tier} from '../../lib/tier';
import {CM} from '../palette';
import {XG, mat} from '../../lib/xf';
import {polyPath} from '../../lib/sketch';
import {S5} from '../world/map';
import {NewsBox as K3NewsBox, Plaque as K3Plaque, WorldText, TYPE, TXT_NEWS_BOX, plaqueLayout} from '../kit/boards';
import {NEWS_BOX, SMALL_COLORS, popK} from '../kit/boards/small';

/** The plaque's END spot (K3 Plaque: x = centre, y = the plate's bottom edge when stand = false) and its panel. */
export const PLAQUE_SPOT = {x: 605, y: 1237, stand: false, panel: 'dark' as const};

const rectD = (x0: number, y0: number, x1: number, y1: number) => polyPath([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);

/** The news box is the SUBJECT (tier A: one closed outline in its own shade) from just after the slot's burst into the
 *  move (film 20.90-22.033; conform_L4 §5), the environment before and after (scene s). It steps down BEHIND the
 *  lamppost wipe (f1322: the two baskets centred on the box hide its body and most of the page; only the page's top
 *  line shows above them), never in plain view mid-move (it was 21.75). */
export const NEWS_A: [number, number] = [20.9 - 20.55, 1322 / 60 - 20.55];

/** The re-lettered front page, tied to the box's tier: on its beat (A) K3's page and ink; off it (C) ONE calm step,
 *  page and letters closer in value (dL* ~84 -> ~36), so from the step on the Pentagon owns the contrast (22.43; CRAFT
 *  §b: the environment's local contrast <= 7, never a subject's). Shown exactly (backdrops: the tier never shifts them). */
const PAGE_TONES = {
  subject: {page: SMALL_COLORS.face, rule: SMALL_COLORS.pageRule, text: CM.ink},
  environment: {page: fromLch(88, 8, 78), rule: fromLch(73, 9, 62), text: fromLch(52, 12, 48)},
} as const;

/** The front page (box units, the K3 box's own 310 x 350 frame; 1 unit = 1 px at the START pose): page, head rules and
 *  the 4-row headline at 44 (rows 46 apart under the head rules at 64-67.5, the last baseline 15 units above the
 *  window's foot). Drawn over K3's page (same window; its colours follow the box's tier). */
const PAGE44 = {size: 44, headline: [108, 154, 200, 246]};

export const NewsBox: React.FC = () => {
  const r = S5.start.newsBox;
  const N = NEWS_BOX;
  const W = N.window;
  const cx = N.w / 2;
  const m = mat.compose(mat.translate(r.x0, r.y0), mat.scale((r.x1 - r.x0) / N.w, (r.y1 - r.y0) / N.h));
  const t = useTime();
  const tier = t >= NEWS_A[0] && t < NEWS_A[1] ? 'subject' : 'environment';
  const P = PAGE_TONES[tier];
  const bw = r.x1 - r.x0;
  return (
    <>
      {/* its light (the rig's family, V2S5_light): the strip where its feet meet the paving and its cast (the box's
          own drawn ground shadow is off: one shadow system) */}
      <ShadowLayer>
        <CastShadow x={(r.x0 + r.x1) / 2} y={r.y1 - 6} w={bw * 0.92} depth={bw * 0.16} h={(r.y1 - r.y0) * 0.94} />
        <ContactShadow x={(r.x0 + r.x1) / 2} y={r.y1} w={bw * 0.86} h={12} />
      </ShadowLayer>
      <K3NewsBox tier={tier} shadow={false} />
      <Tier tier={tier}>
        <XG m={m}>
          <Fill d={rectD(W.x0 + 4, W.y0 + 3.5, W.x1, W.y1)} color={P.page} offset={false} backdrop seed="s5nb/page" />
          <Fill d={rectD(W.x0 + 14, N.rules[0] - 0.55, W.x1 - 12, N.rules[0] + 0.55) + rectD(W.x0 + 14, N.rules[1] - 0.55, W.x1 - 12, N.rules[1] + 0.55)} color={P.rule} offset={false} backdrop seed="s5nb/rules" />
          {TXT_NEWS_BOX.headline44.map((s, i) => (
            <WorldText key={`h${i}`} x={cx} y={PAGE44.headline[i]} size={PAGE44.size} text={s} anchor="middle" weight={0.9} color={P.text} maxW={W.x1 - W.x0 - 16} seed={`s5nb/h${i}`} />
          ))}
        </XG>
      </Tier>
    </>
  );
};

/** The plaque is tier A from its pop (conform_L4 §5: "the Pentagon + the plaque (from 22.43)"): K3's closed outline.
 *  Its light (the rig's family, V2S5_light; at the end the sun is upper right): the strip where its plate meets the
 *  terrace and its cast, falling left and toward us; both pop with the plate (K3's build pop from its foot). */
export const Plaque: React.FC<{at: number}> = ({at}) => {
  const t = useTime();
  if (t < at) return null;
  const {x, y, stand, panel} = PLAQUE_SPOT;
  const L = plaqueLayout(TYPE.key, undefined, stand, false);
  const x0 = x - L.w / 2;
  const x1 = x + L.w / 2;
  return (
    <>
      <XG m={mat.about(mat.scale(popK(t, at, 0.25)), x, y)}>
        <ShadowLayer>
          <CastShadow x={x} y={y} w={L.w} pts={[[x0, y - 3], [x1 + 3, y - 3], [x1 + 3, y + 2], [x0, y + 2]]} h={L.h} />
          <ContactShadow x={x + 1.5} y={y + 1} w={L.w + 3} k={1.02} h={10} />
        </ShadowLayer>
      </XG>
      <K3Plaque at={at} x={x} y={y} stand={stand} panel={panel} body={false} tier="subject" />
    </>
  );
};
