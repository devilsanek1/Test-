// V2S4_tag.tsx (lane L3, V2S4 STORY part): her name tag (TREATMENT §5 S4 "Texts on objects", §8 A6; plan_L3 §1c;
// map.ts S4.nameTag). A paper card with a loose ink outline, screen-locked above her (she is screen-fixed while the
// world trucks), tied to her head by a thin ink leader. Drawn inside the push camera (gone before the push matters).
//   15.07 "She"  the leader pens up out of her head and the card pops at its top edge (a 4 % spring, its top never
//                above y 600); "Sofia Liguori" (44 px, faux weight 0.9) and the three role lines pen on fast (by 15.55).
//   16.60        a flap unfolds: the card extends down to y 870 on a spring (the old bottom stays as a soft crease), the
//                leader shortens; "3 years ·" / "resigned Oct 2026" pen on "and told", the source on "the BBC" (17.08).
//   18.80        the whole tag pops off (shrinks to its centre in 0.12 s), the leader with it.
// Text left-aligned at x 612 (card x 594-876). No TEXT in the right rail (x > 780 below y 840): the two credit lines
// are short. It never covers her (card bottom 870 < her head top 900). Words: K3 `TXT_NAME_TAG` (never retyped).
import React from 'react';
import {CM, INK_PX} from '../palette';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {line} from '../../lib/sketch';
import {clamp, ease, springAt, useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {useCaptionFont} from '../../lib/font';
import {P} from '../kit/canal/core';
import {WorldText} from '../kit/boards/WorldText';
import {TXT_NAME_TAG} from '../kit/boards/texts';
import * as MAP from '../world/map';
import {S4_BEATS, S4_HER, S4_HER_HEAD} from './V2S4_rig';

const X0 = 594;
const X1 = 876;
const Y0 = MAP.S4.nameTag.y0; // 600
const Y1A = 764; // build 1 bottom
const Y1B = 870; // build 2 bottom
const TX = 612;
const T1 = S4_BEATS.tagBuild1; // 15.07
const T2 = S4_BEATS.tagBuild2; // 16.60
const OFF = S4_BEATS.tagOff; // 18.80

/** The card's springs: a lively pop with a small (~4 %) overshoot, settled in ~0.3 s; never jittery. */
const POP = {stiffness: 26 * 26, damping: 2 * 0.72 * 26, mass: 1};

/** The credit as two short lines ("Source: BBC News," / "21 Oct 2026"): split the K3 string after its first comma. */
const CREDIT: [string, string] = (() => {
  const s = TXT_NAME_TAG.credit;
  const i = s.indexOf(', ');
  return i < 0 ? [s, ''] : [s.slice(0, i + 1), s.slice(i + 2)];
})();

/** The leader's ends: just above her head (her head top is y 900) and the card's bottom edge a little left of it. */
const HEAD_END = {x: S4_HER_HEAD.x - 1, y: S4_HER.feetY - S4_HER.h - 9};
const CARD_END_X = 702;

type Line = {text: string; size: number; y: number; at: number; dur: number; weight?: number};
const LINES: Line[] = [
  {text: TXT_NAME_TAG.name, size: 44, y: 644, at: T1 + 0.08, dur: 0.18, weight: 0.9},
  {text: TXT_NAME_TAG.role[0], size: 30, y: 680, at: T1 + 0.21, dur: 0.13},
  {text: TXT_NAME_TAG.role[1], size: 30, y: 713, at: T1 + 0.3, dur: 0.11},
  {text: TXT_NAME_TAG.role[2], size: 30, y: 746, at: T1 + 0.38, dur: 0.1},
  {text: TXT_NAME_TAG.more[0], size: 30, y: 784, at: T2 + 0.08, dur: 0.1},
  {text: TXT_NAME_TAG.more[1], size: 30, y: 817, at: T2 + 0.16, dur: 0.16},
  {text: CREDIT[0], size: 18, y: 842, at: 17.02, dur: 0.12},
  {text: CREDIT[1], size: 18, y: 861, at: 17.1, dur: 0.1},
];

export const S4Tag: React.FC = () => {
  useCaptionFont();
  const t = useTime();
  if (t < T1 || t >= OFF + 0.12) return null;
  // the card: pops at its top edge, then its flap unfolds
  const s1 = springAt(t, T1, POP);
  const ext = t < T2 ? 0 : springAt(t, T2, POP);
  const bottom = Y1A + (Y1B - Y1A) * ext;
  // the pop-off: everything shrinks to the card's centre
  const off = t < OFF ? 0 : ease.inCubic(clamp((t - OFF) / 0.12));
  const cx = (X0 + X1) / 2;
  const cy = (Y0 + bottom) / 2;
  const outer = off > 0 ? mat.about(mat.scale(1 - off), cx, cy) : mat.I;
  const pop = mat.about(mat.scale(Math.max(0.05, s1)), cx, Y0);
  const card = `M${P(X0, Y0)}L${P(X1, Y0)}L${P(X1, bottom)}L${P(X0, bottom)}Z`;
  // a loose outline: corner overshoots everywhere except UP past the card's top (y 600 is the flat sky's edge)
  const lo = {jitter: 0.5, drift: 0.12, breaks: false};
  const outline = [
    line(X0, Y0 + 1.5, X1, Y0 + 1.5, {...lo, seed: 's4tagT', over: [5, 3], drift: 0, bow: 0.3}),
    line(X1, Y0, X1, bottom, {...lo, seed: 's4tagR', over: [0, 5]}),
    line(X1, bottom, X0, bottom, {...lo, seed: 's4tagB', over: [4, 6]}),
    line(X0, bottom, X0, Y0, {...lo, seed: 's4tagL', over: [3, 0]}),
  ].join('');
  // the leader: pens up out of her head at 15.07; a gentle sway (a thread, never a jitter)
  const sway = 2.2 * Math.sin((t - T1) * 2.1);
  const lx0 = HEAD_END.x;
  const ly0 = HEAD_END.y;
  const ly1 = bottom - 1;
  const leader = `M${P(lx0, ly0)}Q${P((lx0 + CARD_END_X) / 2 + 6 + sway, (ly0 + ly1) / 2)} ${P(CARD_END_X, ly1)}`;
  return (
    <XG m={outer}>
      {ly0 - ly1 > 4 ? <Ink d={leader} at={T1} dur={0.08} width={INK_PX.hair} seed="s4tagLeader" exit={false} /> : null}
      <XG m={pop}>
        <Fill d={card} color={CM.paper} offset={[3, 2]} seed="s4tagCard" />
        {ext > 0.02 ? <Ink d={`M${P(X0 + 10, Y1A - 4)}L${P(X1 - 12, Y1A - 4)}`} width={INK_PX.hair} color={CM.stoneShade} seed="s4tagCrease" /> : null}
        <Ink d={outline} width={INK_PX.far} seed="s4tagEdge" />
        {LINES.map((l, i) => (
          <WorldText key={i} x={TX} y={l.y} size={l.size} text={l.text} at={l.at} dur={l.dur} weight={l.weight} seed={`s4tag${i}`} maxW={X1 - 14 - TX} />
        ))}
      </XG>
    </XG>
  );
};
