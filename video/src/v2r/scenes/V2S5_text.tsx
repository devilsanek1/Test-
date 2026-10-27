// V2S5_text.tsx (lane L4): the S5 lettering on objects. TREATMENT section 5 "Texts on objects" + section 8 credits.
//   NewsBox  the US newspaper box beside the bench (START coords: face x 470-780, y 880-1230; no masthead): the
//            headline "Google–Pentagon deal for classified work" (40 px, 3 lines) + "Reported Apr 2026 · The
//            Information via Japan Times; 9to5Google" (18 px). Drawn through the deck's start map (it shrinks with
//            the crane to a small box at the balustrade).
//   Plaque   the viewpoint plaque on the balustrade (END coords), popping ON "Pentagon" (22.43): "The Pentagon" +
//            "US Department of Defense". A viewpoint's orientation plaque (no seal, flag or insignia: V15).
// K3 (L5) owns the film's StatementBoard family; it ships no NewsBox / Plaque yet, so these are drawn here with the
// engine primitives (Fill, Ink, sketch, the caption font) on K3's type scale (key >= 56 at 216 px; body 30-40;
// credits 18-20). Text pops (scale), never fades.
import React from 'react';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {rect as skRect, line as skLine} from '../../lib/sketch';
import {captionFontStack, useCaptionFont} from '../../lib/font';
import {useTime} from '../../lib/time';
import {useExit} from '../../lib/exit';
import {CM} from '../palette';
import {S5} from '../world/map';
import {mix} from '../kit/dc/core';

const T: React.FC<{x: number; y: number; size: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; children: string; weight?: number}> = ({x, y, size, fill = CM.ink, anchor = 'middle', children}) => (
  <text x={x} y={y} fontFamily={captionFontStack} fontSize={size} fill={fill} textAnchor={anchor}>
    {children}
  </text>
);

/** Pop scale for a build at `at` (overshoot 1.12 then settle), 0 before. */
const popK = (t: number, at: number) => {
  if (t < at) return 0;
  const k = (t - at) * 60;
  if (k >= 8) return 1;
  return k < 3 ? 0.3 + 0.82 * (k / 3) : 1.12 - 0.12 * ((k - 3) / 5);
};

/** The newspaper box, START coords (the contract's face x 470-780, y 880-1230). An honour box on two legs: slate body,
 *  a window holding the front page (no masthead), a coin slot and a pull handle; the headline is the page's own. */
export const NewsBox: React.FC = () => {
  const fontOk = useCaptionFont();
  const exit = useExit();
  const b = S5.start.newsBox;
  const w = b.x1 - b.x0;
  const bodyY0 = b.y0;
  const bodyY1 = b.y1 - 62;
  const win = {x: b.x0 + 20, y: b.y0 + 22, w: w - 40, h: 238};
  const body = mix(CM.coatSlate, CM.paneUnlit, 0.2);
  const bodyLit = mix(CM.coatSlate, CM.sky, 0.28);
  return (
    <g>
      {/* legs + feet on the paving, and its shadow (toward us-left: the sun is beyond) */}
      <Fill d={`M${b.x0 - 30} ${b.y1 - 4}L${b.x1 - 60} ${b.y1 - 4}L${b.x1 - 120} ${b.y1 + 22}L${b.x0 - 90} ${b.y1 + 22}Z`} color={mix(CM.paving, CM.shadeWarm, 0.4)} offset={false} />
      <Fill rect={[b.x0 + 36, bodyY1, 22, 58]} color={CM.anchor} />
      <Fill rect={[b.x1 - 58, bodyY1, 22, 58]} color={CM.anchor} />
      <Fill rect={[b.x0 + 26, b.y1 - 8, 42, 8]} color={CM.anchor} />
      <Fill rect={[b.x1 - 68, b.y1 - 8, 42, 8]} color={CM.anchor} />
      {/* the body: lit right face strip, the front */}
      <Fill rect={[b.x0, bodyY0, w, bodyY1 - bodyY0]} color={body} />
      <Fill rect={[b.x1 - 26, bodyY0 + 6, 20, bodyY1 - bodyY0 - 12]} color={bodyLit} />
      <Fill rect={[b.x0 - 6, bodyY0 - 12, w + 12, 16]} color={mix(body, CM.anchor, 0.3)} />
      {/* the window: the front page behind glass */}
      <Fill rect={[win.x, win.y, win.w, win.h]} color={CM.paper} />
      <Fill d={`M${win.x + win.w - 70} ${win.y}L${win.x + win.w - 30} ${win.y}L${win.x + win.w - 110} ${win.y + win.h}L${win.x + win.w - 150} ${win.y + win.h}Z`} color={mix(CM.paper, CM.glass, 0.55)} offset={false} />
      {/* the page's column rules under the credit (no words beyond the headline and its credit) */}
      {[0, 1].map((i) => (
        <Fill key={i} rect={[win.x + 22 + i * 10, win.y + 206 + i * 14, win.w - 44 - i * 60, 6]} color={mix(CM.stoneShade, CM.paper, 0.15)} offset={false} />
      ))}
      {/* coin slot, handle, the lower panel */}
      <Fill rect={[b.x0 + 34, win.y + win.h + 22, 70, 30]} color={mix(body, CM.anchor, 0.35)} />
      <Fill rect={[b.x0 + 46, win.y + win.h + 33, 46, 6]} color={CM.anchor} offset={false} />
      <Fill rect={[b.x1 - 120, win.y + win.h + 26, 74, 14]} color={CM.limestone} />
      <Ink d={skRect(b.x0, bodyY0, w, bodyY1 - bodyY0, {seed: 'nb/body'})} width={3.4} />
      <Ink d={skRect(win.x, win.y, win.w, win.h, {seed: 'nb/win'})} width={2.6} />
      <Ink d={skLine(b.x0 + 36, bodyY1, b.x0 + 36, b.y1 - 4, {seed: 'nb/l1'})} width={2.6} />
      <Ink d={skLine(b.x1 - 36, bodyY1, b.x1 - 36, b.y1 - 4, {seed: 'nb/l2'})} width={2.6} />
      {fontOk && exit < 0.25 ? (
        <g>
          <T x={win.x + win.w / 2} y={win.y + 46} size={40}>Google–Pentagon</T>
          <T x={win.x + win.w / 2} y={win.y + 88} size={40}>deal for</T>
          <T x={win.x + win.w / 2} y={win.y + 130} size={40}>classified work</T>
          <T x={win.x + win.w / 2} y={win.y + 164} size={18}>Reported Apr 2026 · The Information</T>
          <T x={win.x + win.w / 2} y={win.y + 186} size={18}>via Japan Times; 9to5Google</T>
        </g>
      ) : null}
    </g>
  );
};

/** The plaque rect (END coords): on the balustrade's coping, right of the stranger and the box, out of the rail. */
export const PLAQUE = {x0: 532, x1: 776, y0: 1066, y1: 1168};

/** The viewpoint plaque (END coords), popping on "Pentagon" (scene `at`): a bronze-dark panel on a short stone
 *  plinth standing on the coping, an orientation arrow toward the building, two lines. */
export const Plaque: React.FC<{at: number}> = ({at}) => {
  const t = useTime();
  const fontOk = useCaptionFont();
  const exit = useExit();
  const k = popK(t, at);
  if (k <= 0) return null;
  const p = PLAQUE;
  const cx = (p.x0 + p.x1) / 2;
  const w = p.x1 - p.x0;
  const h = p.y1 - p.y0;
  return (
    <g transform={`translate(${cx} ${p.y1 + 14}) scale(${k}) translate(${-cx} ${-(p.y1 + 14)})`}>
      <Fill rect={[cx - 26, p.y1 - 4, 52, 24]} color={CM.limestone} />
      <Fill rect={[p.x0, p.y0, w, h]} color={CM.anchor} />
      <Fill rect={[p.x0 + 8, p.y0 + 8, w - 16, h - 16]} color={mix(CM.anchor, CM.coatPlum, 0.4)} offset={false} />
      <Ink d={skRect(p.x0, p.y0, w, h, {seed: 'plq'})} width={3.4} />
      {fontOk && exit < 0.25 ? (
        <g>
          <T x={cx} y={p.y0 + 52} size={46} fill={CM.paper}>The Pentagon</T>
          <T x={cx} y={p.y0 + 84} size={21} fill={CM.lampCore}>US Department of Defense</T>
        </g>
      ) : null}
      {/* the orientation arrow on the coping, pointing up-right toward the building */}
      <Fill d={`M${p.x1 - 4} ${p.y0 - 8}l26 -22l2 14l14 2z`} color={CM.anchor} offset={false} />
    </g>
  );
};
