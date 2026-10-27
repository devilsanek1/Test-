// canal/lettering.tsx: the canopy's hand-lettered "Google" (TREATMENT §2, V15): a sign-writer's monoline brush in
// ink, lower case after a capital G, NO logo shapes, NO logo colours. Each letter is its own pen stroke group, so the
// canopy can pop the letters in one by one (S1 0.97: "the canopy letters fill-pop one by one"), draw them on, or show
// them whole. Glyphs are drawn in a box with the baseline at y 0 and a cap height of 38 units.

import React from 'react';
import {CM} from '../../palette';
import {Ink} from '../../../lib/Ink';
import {useTime, springAt, springs} from '../../../lib/time';
import {XG, mat} from '../../../lib/xf';

type Glyph = {d: string; adv: number};

/** The six glyphs (cap height 38, x-height 24, descender 14), monoline paths. */
const GLYPHS: Glyph[] = [
  // G: a round capital with an inward bar
  {d: 'M27 -31C23 -38 13 -39 7.5 -35C2 -31 0 -24 0.5 -17C1 -8 6.5 -0.5 14.5 0C20 0.3 24.5 -3 26 -7.5L26 -17.5M26 -17.5L16 -17.5', adv: 31},
  // o
  {d: 'M19 -12.5C19 -19.5 15 -24 9.8 -24C4.2 -24 0.8 -19.5 0.8 -12C0.8 -4.6 4.6 0.2 10 0.2C15.6 0.2 19 -4.8 19 -12.5C19 -15.5 18 -18.5 16.8 -20', adv: 23},
  // o (a touch different: hand-lettered, never twins)
  {d: 'M18.6 -12C18.8 -19.8 14.6 -24.2 9.6 -24C4 -23.8 0.9 -19.2 1 -11.8C1.1 -4.4 5 0.1 10.2 0C15.4 -0.1 18.4 -4.6 18.6 -12C18.6 -14 18.4 -15.8 17.9 -17.4', adv: 23},
  // g: bowl + a descender that hooks left
  {d: 'M18 -19C16.5 -22.6 13.6 -24 10 -24C4.4 -24 1 -19.6 1 -13.2C1 -6.6 4.6 -2.6 9.8 -2.6C14.4 -2.6 17.4 -6.2 18 -11M18.2 -24.4L18.2 4C18.2 11 14 15 8.6 15C4.6 15 2 13 1 10.4', adv: 23},
  // l: a tall stem with a little foot turn
  {d: 'M4.2 -39L4.2 -5C4.2 -1.4 6 0.4 9 -0.6', adv: 12},
  // e
  {d: 'M1.4 -12.4L18.6 -12.6C18.8 -19.6 14.8 -24 9.8 -24C4.2 -24 0.8 -19.4 0.8 -12C0.8 -4.4 5.2 0.2 11 0.2C14.6 0.2 17.2 -1.6 19 -4.6', adv: 22},
];
const SPACING = 3;

/** Total advance of "Google" at cap height `cap` px. */
export const googleWidth = (cap: number) => (GLYPHS.reduce((s, g) => s + g.adv, 0) + SPACING * (GLYPHS.length - 1)) * (cap / 38);

export type HandLetteredProps = {
  /** Centre x and baseline y (screen px). */
  cx: number;
  baseline: number;
  /** Cap height in px (the map's canopy letters are ~48 px). */
  cap: number;
  /** Letters pop in one by one from this time (spring pop, `each` s apart). Omit = already there. */
  at?: number;
  each?: number;
  /** Draw the strokes on instead of popping (pen reveal). */
  draw?: boolean;
  width?: number;
  color?: string;
  /** Horizontal shear for a slight 3/4 (px of x per px of y, e.g. 0.02). */
  shear?: number;
};

/** "Google", hand-lettered in ink, letter by letter. */
export const HandLetteredGoogle: React.FC<HandLetteredProps> = ({cx, baseline, cap, at, each = 0.06, draw = false, width, color = CM.ink, shear = 0}) => {
  const t = useTime();
  const k = cap / 38;
  const total = googleWidth(cap);
  let x = cx - total / 2;
  const w = width ?? Math.max(2.4, cap * 0.1);
  const out: React.ReactNode[] = [];
  GLYPHS.forEach((g, i) => {
    const gx = x;
    x += (g.adv + SPACING) * k;
    const la = at === undefined ? undefined : at + i * each;
    if (la !== undefined && t < la && !draw) return;
    const s = la === undefined || draw ? 1 : Math.max(0.05, springAt(t, la, springs.pop));
    const m = mat.compose(mat.translate(gx, baseline), [1, 0, -shear, 1, 0, 0], mat.scale(k), mat.about(mat.scale(s), g.adv / 2, -15));
    out.push(
      <XG key={i} m={m}>
        <Ink d={g.d} width={w / k} color={color} seed={`goog${i}`} at={draw ? la : undefined} vary={0.04} taper={false} />
      </XG>,
    );
  });
  return <>{out}</>;
};
