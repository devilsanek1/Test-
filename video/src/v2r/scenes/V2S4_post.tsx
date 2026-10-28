// V2S4_post.tsx (lane L3, V2S4 STORY part): the ONE dated fingerpost on her towpath (TREATMENT §5 S4 + "Texts on
// objects", §8 V16; plan_L3 §1b; map.ts S4.post / plateDec2025 / plateApr2026). Drawn in PLANE coordinates at the
// 17.96 pose (the post lands at x 575).
//   S4Post    (inside S4Path, slides with the towpath plane): a slim heritage post in plum with a gilt ball finial,
//             a moulded cast-iron foot on a stone plinth, two empty sockets that hint where the arms go. Bare until
//             "military". TIER A from its beat: its ONE closed outline (INK_PX.mid, the post's own deep shade: the pen
//             draws it 3.0 px) pops on with the DEC plate (18.92: a promotion pops the outline, never the fill, THROUGHLINE
//             §4); its contact and cast shadows are the towpath's ShadowLayer (V2S4_wpath, from POST_STANDERS), its form
//             step the light layer's FormShade on its right side (the low sun is west).
//   S4Plates  (V2S4.tsx draws it ABOVE Pip and the boat): the two arrow plates pointing WEST, top-to-bottom = time
//             order. 18.92 "military": the DEC 2025 plate knocks onto the post (its paper face grows out of its socket
//             to the tip in ~0.1 s with a small overshoot), its ONE closed edge (tier A) and its closed plum keyline,
//             then "DEC 2025" / "unclassified work" / the credit pen on. 19.43-19.80: the APR 2026 plate, complete ON
//             "heading". They are the top layer so nothing ever moves over the lettering.
// Lettering: K3 `WorldText` + `TXT_PLATES` (never retyped): keys 56 px with faux weight 0.9, body 31 px, credits 18 px.
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {springAt, useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {useCaptionFont} from '../../lib/font';
import {Batch, Paint, ovalPath, P, Pt} from '../kit/canal/core';
import {Tier} from '../../lib/tier';
import {FormShade} from '../../lib/light';
import type {Stander} from './V2S4_light';
import {WorldText, textW} from '../kit/boards/WorldText';
import {TXT_PLATES} from '../kit/boards/texts';
import * as MAP from '../world/map';
import {S4_K, s4PlaneDx} from './V2S4_rig';

const POST = MAP.S4.post; // x 575, top 735, foot 1060
const HW = 7.5; // half the shaft width (15 px)
const SHAFT_TOP = POST.topY + 8; // under the cap collar
const BASE_TOP = 1006; // the cast-iron foot starts here
const PLINTH_TOP = 1046;

/** The two sockets (y centres) the arms clamp into: one per plate, at its mid-height (plan: two small empty collars). */
const SOCKETS = [(MAP.S4.plateDec2025.y0 + MAP.S4.plateDec2025.y1) / 2, (MAP.S4.plateApr2026.y0 + MAP.S4.plateApr2026.y1) / 2];
const SOCK_H = 26;

// ---------------------------------------------------------------- the post (plane, static)

/** A rounded rect (the post's mouldings get soft corners: CRAFT §c; a sharp convex corner of a dark fill reads as a
 *  line mark at phone size). */
const rr = (x: number, y: number, w: number, h: number, r: number) => {
  const k = Math.min(r, w / 2, h / 2);
  return `M${P(x + k, y)}L${P(x + w - k, y)}Q${P(x + w, y)} ${P(x + w, y + k)}L${P(x + w, y + h - k)}Q${P(x + w, y + h)} ${P(x + w - k, y + h)}L${P(x + k, y + h)}Q${P(x, y + h)} ${P(x, y + h - k)}L${P(x, y + k)}Q${P(x, y)} ${P(x + k, y)}Z`;
};

function postBatch(): Batch {
  const b = new Batch();
  const x = POST.x;
  // stone plinth: lit face, a shade side to the east
  b.fill(CM.limestone, rr(x - 18, PLINTH_TOP, 36, POST.footY - PLINTH_TOP + 2, 3));
  b.rect(CM.stoneShade, x + 9, PLINTH_TOP + 2, 9, POST.footY - PLINTH_TOP - 2);
  // the moulded cast-iron foot: ONE smooth flare from the shaft down to the plinth (no protruding rings: a thin dark
  // moulding beside the shaft reads as a line mark at phone size)
  b.fill(CM.anchor, `M${P(x - HW, BASE_TOP - 8)}L${P(x + HW, BASE_TOP - 8)}C${P(x + HW, BASE_TOP + 14)} ${P(x + 13, PLINTH_TOP - 14)} ${P(x + 14, PLINTH_TOP - 4)}Q${P(x + 14.5, PLINTH_TOP)} ${P(x + 10, PLINTH_TOP)}L${P(x - 10, PLINTH_TOP)}Q${P(x - 14.5, PLINTH_TOP)} ${P(x - 14, PLINTH_TOP - 4)}C${P(x - 13, PLINTH_TOP - 14)} ${P(x - HW, BASE_TOP + 14)} ${P(x - HW, BASE_TOP - 8)}Z`);
  // the shaft, a sunlit stripe on its west side (the low sun is west)
  b.rect(CM.anchor, x - HW, SHAFT_TOP, HW * 2, BASE_TOP - SHAFT_TOP);
  b.fill(CM.coatPlum, rr(x - HW + 2, SHAFT_TOP + 4, 3, BASE_TOP - SHAFT_TOP - 10, 1.5));
  b.layer();
  // the gilt finial assembly: the cap collar, the neck, the ball and its spike (gilt like the ball: a dark collar
  // wider than the shaft would read as two line marks)
  b.fill(CM.leafGold, rr(x - 10, POST.topY, 20, 10, 4));
  b.fill(CM.leafGold, rr(x - 5, POST.topY - 7, 10, 9, 3));
  b.fill(CM.leafGold, ovalPath(x, POST.topY - 14, 8, 8));
  b.poly(CM.leafGold, [
    [x - 3, POST.topY - 20],
    [x + 3, POST.topY - 20],
    [x, POST.topY - 33],
  ]);
  b.fill(CM.lampCore, ovalPath(x - 3, POST.topY - 17, 2.2, 2.2));
  // the two empty sockets (where the arms will clamp): gilt bands round the shaft (soft corners)
  for (const cy of SOCKETS) b.fill(CM.leafGold, rr(x - 10, cy - SOCK_H / 2, 20, SOCK_H, 4));
  return b;
}

/** The post's iron silhouette (foot, shaft, collar, ball and spike) as ONE closed path: its tier-A outline and its form
 *  step's shape. */
const POST_D = (() => {
  const x = POST.x;
  const top = POST.topY;
  // the left half, bottom -> top, as (dx, y); the right half mirrors it
  const left: [number, number][] = [
    [-14, PLINTH_TOP],
    [-14, PLINTH_TOP - 4],
    [-11, PLINTH_TOP - 14],
    [-HW - 1, BASE_TOP + 10],
    [-HW, BASE_TOP - 8],
  ];
  for (const cy of [...SOCKETS].sort((a, c) => c - a)) left.push([-HW, cy + 13], [-10, cy + 13], [-10, cy - 13], [-HW, cy - 13]);
  left.push([-HW, top + 10], [-10, top + 10], [-10, top], [-5, top], [-5, top - 6], [-4.5, top - 7.5]);
  const right = left.map(([dx, y]) => [-dx, y] as [number, number]).reverse();
  return (
    `M${left.map(([dx, y]) => P(x + dx, y)).join('L')}` +
    `A8 8 0 1 1 ${right.map(([dx, y]) => P(x + dx, y)).join('L')}Z`
  );
})();

/** The post's ground shadows (plane px; drawn by the towpath's one ShadowLayer, V2S4_wpath): contact under the plinth,
 *  the cast of the whole post along the light. */
export const POST_STANDERS: Stander[] = [{x: POST.x, y: POST.footY, w: 38, h: POST.footY - POST.topY + 33, w2: 16}];

/** The bare post on the towpath plane (rendered inside S4Path: already slid with the plane): fills at tier A always
 *  (no value pop), its one closed outline from the DEC plate's knock-on, the form step on its right side. */
export const S4Post: React.FC = () => {
  const t = useTime();
  const b = useMemo(postBatch, []);
  return (
    <Tier tier="subject" tone={CM.anchor}>
      <Paint b={b} seed="s4post" misreg={false} />
      <FormShade d={POST_D} />
      {t >= MAP.S4.decPlateAt ? <Ink d={POST_D} width={INK_PX.mid} order="all" seed="s4postEdge" /> : null}
    </Tier>
  );
};

// ---------------------------------------------------------------- the plates (top layer)

type PlateSpec = {
  r: MAP.Rect;
  text: {key: string; body: string; credit: string};
  /** The face starts to grow out of its socket. */
  at: number;
  /** Spring of the face (w0 rad/s, damping ratio). */
  w0: number;
  zeta: number;
  /** Pen windows [start, end] for the key, the body, the credit. */
  key: [number, number];
  body: [number, number];
  credit: [number, number];
  seed: string;
};

const PLATES: PlateSpec[] = [
  {
    r: MAP.S4.plateDec2025,
    text: TXT_PLATES.dec,
    at: MAP.S4.decPlateAt, // 18.92 "military"
    w0: 34,
    zeta: 0.74,
    key: [19.0, 19.18],
    body: [19.12, 19.29],
    credit: [19.22, 19.4],
    seed: 'dec',
  },
  {
    r: MAP.S4.plateApr2026,
    text: TXT_PLATES.apr,
    at: MAP.S4.aprPlatePen[0] - 0.02, // pops on 19.45
    w0: 46,
    zeta: 0.74,
    key: [19.49, 19.62],
    body: [19.59, 19.72],
    credit: [19.66, 19.8], // complete ON "heading" (19.80)
    seed: 'apr',
  },
];

const spring = (t: number, at: number, w0: number, zeta: number) => springAt(t, at, {stiffness: w0 * w0, damping: 2 * zeta * w0, mass: 1});

/** The plate outline: tip (x0, mid), body from x0 + 30 to x1. */
function platePts(r: MAP.Rect): Pt[] {
  const ym = (r.y0 + r.y1) / 2;
  const xb = r.x0 + 30;
  return [
    [xb, r.y0],
    [r.x1, r.y0],
    [r.x1, r.y1],
    [xb, r.y1],
    [r.x0, ym],
  ];
}

const PlateFace: React.FC<{p: PlateSpec}> = ({p}) => {
  const t = useTime();
  const {r} = p;
  const key = useMemo(() => {
    // the plum keyline: the arrow inset 6 px, ONE closed path (no stroke ends near the lettering)
    const k = 6;
    const ym = (r.y0 + r.y1) / 2;
    const xb = r.x0 + 30;
    return `M${P(xb + k * 0.4, r.y0 + k)}L${P(r.x1 - k, r.y0 + k)}L${P(r.x1 - k, r.y1 - k)}L${P(xb + k * 0.4, r.y1 - k)}L${P(r.x0 + k * 1.8, ym)}Z`;
  }, [r]);
  if (t < p.at) return null;
  // the face grows out of its socket (scale x about the post end) with a small overshoot
  const sx = Math.max(0.02, spring(t, p.at, p.w0, p.zeta));
  const ym = (r.y0 + r.y1) / 2;
  const face = `M${platePts(r)
    .map(([x, y]) => P(x, y))
    .join('L')}Z`;
  const under = `M${P(r.x0 + 33, r.y1 - 1)}L${P(r.x1, r.y1 - 1)}L${P(r.x1, r.y1 + 5)}L${P(r.x0 + 31, r.y1 + 5)}L${P(r.x0 + 4, ym + 3)}Z`;
  return (
    <XG m={mat.about(mat.scale(sx, 1), r.x1, ym)}>
      {/* the arm's underside in shade (its thickness), then the paper face, its one closed edge, the closed keyline */}
      <Fill d={under} color={CM.shadeWarm} offset={false} seed={`${p.seed}under`} />
      <Fill d={face} color={CM.paper} offset={false} seed={`${p.seed}face`} />
      <Ink d={face} at={p.at + 0.04} width={INK_PX.mid} order="all" seed={`${p.seed}edge`} />
      <Ink d={key} at={p.at + 0.07} width={INK_PX.hair} color={CM.anchor} order="all" seed={`${p.seed}key`} />
    </XG>
  );
};

/** The socket's tongue over each plate's post end (it knocks on with the plate): the band now grips the arm. */
const Clamps: React.FC<{p: PlateSpec}> = ({p}) => {
  const t = useTime();
  const b = useMemo(() => {
    const s = new Batch();
    const x = POST.x;
    const cy = (p.r.y0 + p.r.y1) / 2;
    s.fill(CM.anchor, rr(x - 25, cy - SOCK_H / 2, 20, SOCK_H, 5));
    s.fill(CM.leafGold, rr(x - 10, cy - SOCK_H / 2, 20, SOCK_H, 4));
    return s;
  }, [p]);
  if (t < p.at) return null;
  return <Paint b={b} seed={`${p.seed}clamps`} misreg={false} />;
};

const PlateText: React.FC<{p: PlateSpec}> = ({p}) => {
  useCaptionFont();
  const {r, text} = p;
  const base = r.y0 + 52; // 807 / 917
  const keyX = r.x0 + 30;
  const bodyX = keyX + textW(text.key, 56) + 14;
  return (
    <>
      <WorldText x={keyX} y={base} size={56} text={text.key} at={p.key[0]} dur={p.key[1] - p.key[0]} weight={0.9} seed={`${p.seed}K`} maxW={232} />
      <WorldText x={bodyX} y={base} size={31} text={text.body} at={p.body[0]} dur={p.body[1] - p.body[0]} weight={0.55} seed={`${p.seed}B`} maxW={r.x1 - 14 - bodyX} />
      <WorldText x={keyX} y={r.y0 + 85} size={18} text={text.credit} at={p.credit[0]} dur={p.credit[1] - p.credit[0]} seed={`${p.seed}C`} maxW={r.x1 - 18 - keyX} />
    </>
  );
};

/** The two plates, drawn above Pip and the boat (V2S4.tsx); they slide with the path plane like the post (at rest
 *  from 17.96, before they build). */
export const S4Plates: React.FC = () => {
  const t = useTime();
  return (
    <XG m={mat.translate(s4PlaneDx(S4_K.path, t), 0)}>
      <Tier tier="subject" tone={CM.paper}>
      {PLATES.map((p) => (
        <React.Fragment key={p.seed}>
          <PlateFace p={p} />
          <Clamps p={p} />
          <PlateText p={p} />
        </React.Fragment>
      ))}
      </Tier>
    </XG>
  );
};

/** For QA / Pip: the plates' rects (world px at the pose). */
export const S4_PLATE_RECTS = [MAP.S4.plateDec2025, MAP.S4.plateApr2026] as const;
