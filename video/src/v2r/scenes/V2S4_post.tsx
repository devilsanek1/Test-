// V2S4_post.tsx (lane L3, V2S4 STORY part): the ONE dated fingerpost on her towpath (TREATMENT §5 S4 + "Texts on
// objects", §8 V16; plan_L3 §1b; map.ts S4.post / plateDec2025 / plateApr2026). Drawn in PLANE coordinates at the
// 17.96 pose (the post lands at x 575).
//   S4Post    (inside S4Path, slides with the towpath plane): a slim heritage post in plum with a gilt ball finial,
//             a moulded cast-iron foot on a stone plinth, two empty sockets that hint where the arms go, and its short
//             colour shadow east on the paving (STYLE §2). Bare until "military".
//   S4Plates  (V2S4.tsx draws it ABOVE Pip and the boat): the two arrow plates pointing WEST, top-to-bottom = time
//             order. 18.92 "military": the DEC 2025 plate knocks onto the post (its paper face grows out of its socket
//             to the tip in ~0.1 s with a small overshoot), its edge and plum keyline ink, then "DEC 2025" /
//             "unclassified work" / the credit pen on. 19.43-19.80: the APR 2026 plate, complete ON "heading". They are
//             the top layer so nothing ever moves over the lettering (Pip's leap into the sun passes BEHIND them).
// Lettering: K3 `WorldText` + `TXT_PLATES` (never retyped): keys 56 px with faux weight 0.9, body 31 px, credits 18 px.
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {line, circle} from '../../lib/sketch';
import {springAt, useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {useCaptionFont} from '../../lib/font';
import {Batch, Paint, ovalPath, P, Pt} from '../kit/canal/core';
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

function postBatch(): Batch {
  const b = new Batch();
  const x = POST.x;
  // its shadow on the paving: colour, flat, SHORT and east (STYLE §2; the world's own quad, V2S4_wcore SHADOW)
  b.poly(CM.stoneShade, [
    [x - 18, POST.footY - 1],
    [x + 18, POST.footY - 2],
    [x + 18 + 34, POST.footY + 4],
    [x - 11 + 34 * 0.9, POST.footY + 6],
  ]);
  b.layer();
  // stone plinth: lit face, a shade side to the east
  b.rect(CM.limestone, x - 18, PLINTH_TOP, 36, POST.footY - PLINTH_TOP);
  b.rect(CM.stoneShade, x + 9, PLINTH_TOP, 9, POST.footY - PLINTH_TOP);
  // the moulded cast-iron foot: a ring, a flared skirt, a lip on the plinth
  b.poly(CM.anchor, [
    [x - HW, BASE_TOP],
    [x + HW, BASE_TOP],
    [x + HW + 2, BASE_TOP + 16],
    [x + 13, PLINTH_TOP - 4],
    [x + 14, PLINTH_TOP],
    [x - 14, PLINTH_TOP],
    [x - 13, PLINTH_TOP - 4],
    [x - HW - 2, BASE_TOP + 16],
  ]);
  b.rect(CM.anchor, x - 11, BASE_TOP - 6, 22, 7);
  b.rect(CM.anchor, x - 11, BASE_TOP + 22, 22, 5);
  // the shaft, a sunlit stripe on its west side (the low sun is west)
  b.rect(CM.anchor, x - HW, SHAFT_TOP, HW * 2, BASE_TOP - SHAFT_TOP);
  b.rect(CM.coatPlum, x - HW + 2, SHAFT_TOP + 4, 3, BASE_TOP - SHAFT_TOP - 10);
  // the cap collar and the gilt ball finial with its spike
  b.rect(CM.anchor, x - 11, POST.topY, 22, 9);
  b.rect(CM.anchor, x - 6, POST.topY - 6, 12, 7);
  b.fill(CM.leafGold, ovalPath(x, POST.topY - 14, 8, 8));
  b.poly(CM.leafGold, [
    [x - 3, POST.topY - 20],
    [x + 3, POST.topY - 20],
    [x, POST.topY - 33],
  ]);
  b.fill(CM.lampCore, ovalPath(x - 3, POST.topY - 17, 2.2, 2.2));
  // the two empty sockets (where the arms will clamp): a moulded band with a gilt bolt
  for (const cy of SOCKETS) {
    b.rect(CM.anchor, x - 12, cy - SOCK_H / 2, 24, SOCK_H);
    b.rect(CM.anchor, x - 10, cy - SOCK_H / 2 - 3, 20, SOCK_H + 6);
    b.fill(CM.leafGold, ovalPath(x + 5, cy, 2, 2));
  }
  b.layer();
  // ink: loose, open, only where it carries form (shaft edges with a break, the foot, the finial, the sockets)
  const w = INK_PX.far;
  b.ink(line(x - HW, SHAFT_TOP + 2, x - HW, 880, {seed: 'pL1', over: [2, 0]}), w);
  b.ink(line(x - HW, 896, x - HW, BASE_TOP - 4, {seed: 'pL2', over: [0, 2]}), w);
  b.ink(line(x + HW, SHAFT_TOP + 2, x + HW, 812, {seed: 'pR1', over: [2, 0]}), w);
  b.ink(line(x + HW, 828, x + HW, BASE_TOP - 6, {seed: 'pR2', over: 'none'}), w);
  b.ink(
    `M${P(x - HW - 2, BASE_TOP + 16)}L${P(x - 13, PLINTH_TOP - 4)}L${P(x - 14, PLINTH_TOP)}M${P(x + HW + 2, BASE_TOP + 16)}L${P(x + 13, PLINTH_TOP - 4)}L${P(x + 15, PLINTH_TOP)}`,
    w,
  );
  b.ink(line(x - 20, PLINTH_TOP, x + 21, PLINTH_TOP, {seed: 'pPl', over: 'small'}), w);
  b.ink(line(x - 18, PLINTH_TOP + 2, x - 18, POST.footY, {seed: 'pPlL', over: 'none'}), INK_PX.hair);
  b.ink(line(x - 12, BASE_TOP - 6, x + 12, BASE_TOP - 6, {seed: 'pRing', over: 'small'}), INK_PX.hair);
  b.ink(line(x - 12, POST.topY, x + 12, POST.topY, {seed: 'pCap', over: 'small'}), INK_PX.hair);
  b.ink(circle(x, POST.topY - 14, 8, {seed: 'pBall', overlap: -40}), INK_PX.hair);
  for (const [i, cy] of SOCKETS.entries()) {
    b.ink(line(x - 12, cy - SOCK_H / 2, x + 12, cy - SOCK_H / 2, {seed: `pSo${i}`, over: [1, 2]}), INK_PX.hair);
    b.ink(line(x + 12, cy - SOCK_H / 2 + 2, x + 12, cy + SOCK_H / 2, {seed: `pSr${i}`, over: 'none'}), INK_PX.hair);
  }
  return b;
}

/** The bare post on the towpath plane (rendered inside S4Path: already slid with the plane). */
export const S4Post: React.FC = () => {
  const b = useMemo(postBatch, []);
  return <Paint b={b} seed="s4post" />;
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
  const ink = useMemo(() => {
    const [a, b2, c, d, e] = platePts(r);
    const o = {over: [3, 7] as [number, number], jitter: 0.5, drift: 0.15, breaks: false};
    return [
      line(e[0], e[1], a[0], a[1], {...o, seed: `${p.seed}e1`, over: [1, 4]}),
      line(a[0], a[1], b2[0] + 2, b2[1], {...o, seed: `${p.seed}e2`}),
      line(b2[0], b2[1] - 2, c[0], c[1] + 3, {...o, seed: `${p.seed}e3`, over: [2, 3]}),
      line(c[0] + 2, c[1], d[0], d[1], {...o, seed: `${p.seed}e4`}),
      line(d[0], d[1], e[0], e[1], {...o, seed: `${p.seed}e5`, over: [4, 1]}),
    ].join('');
  }, [r, p.seed]);
  const key = useMemo(() => {
    // the plum keyline: inset 6 px along the top, the post end and the bottom; open at the point (the key starts there)
    const k = 6;
    const xa = r.x0 + 30 + 22;
    return `M${P(xa, r.y0 + k)}L${P(r.x1 - k, r.y0 + k)}L${P(r.x1 - k, r.y1 - k)}L${P(xa + 6, r.y1 - k)}`;
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
      {/* the arm's underside in shade (its thickness), then the paper face */}
      <Fill d={under} color={CM.shadeWarm} offset={false} seed={`${p.seed}under`} />
      <Fill d={face} color={CM.paper} seed={`${p.seed}face`} offset={[3, 2]} />
      <Ink d={ink} at={p.at + 0.04} width={INK_PX.far} order="all" seed={`${p.seed}edge`} />
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
    s.rect(CM.anchor, x - 25, cy - SOCK_H / 2, 37, SOCK_H);
    s.rect(CM.anchor, x - 10, cy - SOCK_H / 2 - 3, 20, SOCK_H + 6);
    s.fill(CM.leafGold, ovalPath(x - 18, cy - 6, 2.2, 2.2));
    s.fill(CM.leafGold, ovalPath(x - 18, cy + 6, 2.2, 2.2));
    s.fill(CM.leafGold, ovalPath(x + 5, cy, 2, 2));
    s.layer();
    s.ink(line(x - 26, cy - SOCK_H / 2, x + 12, cy - SOCK_H / 2, {seed: `${p.seed}clT`, over: [1, 2]}), INK_PX.hair);
    s.ink(line(x - 26, cy + SOCK_H / 2, x - 8, cy + SOCK_H / 2, {seed: `${p.seed}clB`, over: [1, 1]}), INK_PX.hair);
    s.ink(line(x - 26, cy - SOCK_H / 2 + 1, x - 26, cy + SOCK_H / 2, {seed: `${p.seed}clL`, over: 'none'}), INK_PX.hair);
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
      {PLATES.map((p) => (
        <React.Fragment key={p.seed}>
          <PlateFace p={p} />
          <Clamps p={p} />
          <PlateText p={p} />
        </React.Fragment>
      ))}
    </XG>
  );
};

/** For QA / Pip: the plates' rects (world px at the pose). */
export const S4_PLATE_RECTS = [MAP.S4.plateDec2025, MAP.S4.plateApr2026] as const;
