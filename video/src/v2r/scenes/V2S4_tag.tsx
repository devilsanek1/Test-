// V2S4_tag.tsx (lane L3, V2S4 STORY part): her name tag (conform_L3 §2, §4: its two builds and its words kept; map.ts
// S4.nameTag x 590-1000, y 600-800). A paper card with a clean ink edge, screen-locked above her (she is screen-fixed
// while the world trucks), tied to her head by a thin ink leader. Tier A with her (the beat's subject while it shows);
// screen-locked paper: unlit, no shadow.
//   15.07 "She"  the leader pens up out of her head and the card pops at its top edge (a 4 % spring); "Sofia Liguori"
//                (48 px, faux weight 0.9) pens on fast (by 15.33).
//   16.60        a flap unfolds: the card extends down to y 800 on a spring (the old bottom stays as a soft crease), the
//                leader shortens; "Google DeepMind" (44 px) pens on.
//   18.80        the whole tag pops off (shrinks to its centre in 0.12 s), the leader with it.
// FEW AND BIG (REVIEW_1 MUST 3): only her name and her lab are drawn; her role, "3 years · resigned Oct 2026" and the
// source are in the post caption and the pinned comment (docs/v2/POSTING_KIT.md).
// Text left-aligned at x 608 (card x 590-892, fitted to the two lines: the widest, 264 px, of the 270 the card holds).
// It stays above y 840 (no text in the right rail below it) and never covers her (her head top is y 900) or the post
// (x 575). Words: K3 `TXT_NAME_TAG` (never retyped; build 1's last two role parts share one line, build 2's two parts
// share one line, the credit is one line).
import React from 'react';
import {CM, INK_PX} from '../palette';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {clamp, ease, springAt, useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {Tier} from '../../lib/tier';
import {useCaptionFont} from '../../lib/font';
import {P, ovalPath} from '../kit/canal/core';
import {WorldText} from '../kit/boards/WorldText';
import {TXT_NAME_TAG} from '../kit/boards/texts';
import * as MAP from '../world/map';
import {S4_BEATS, S4_HER, S4_HER_HEAD} from './V2S4_rig';

const X0 = MAP.S4.nameTag.x0; // 590
const X1 = MAP.S4.nameTag.x1; // 892
const Y0 = MAP.S4.nameTag.y0; // 600
const Y1A = 736; // build 1 bottom
const Y1B = MAP.S4.nameTag.y1 - 2; // 798: build 2 bottom (her head top is y 900)
const TX = X0 + 18;
const T1 = S4_BEATS.tagBuild1; // 15.07
const T2 = S4_BEATS.tagBuild2; // 16.60
const OFF = S4_BEATS.tagOff; // 18.80

/** The card's springs: a lively pop with a small (~4 %) overshoot, settled in ~0.3 s; never jittery. */
const POP = {stiffness: 26 * 26, damping: 2 * 0.72 * 26, mass: 1};

/** The leader's ends: just above her head (her head top is y 900) and the card's bottom edge a little left of it. */
const HEAD_END = {x: S4_HER_HEAD.x - 1, y: S4_HER.feetY - S4_HER.h - 9};
const CARD_END_X = 702;

type Line = {text: string; size: number; y: number; at: number; dur: number; weight?: number};
/** Build 1 (600-736): the name centred on the card; build 2 (736-798): the lab under the crease. */
const LINES: Line[] = [
  {text: TXT_NAME_TAG.name, size: 48, y: 684, at: T1 + 0.08, dur: 0.18, weight: 0.9},
  {text: TXT_NAME_TAG.lab, size: 44, y: 776, at: T2 + 0.08, dur: 0.22, weight: 0.9},
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
  // the leader: pens up out of her head at 15.07; a thread with a slight belly (static: STYLE §3, no sway)
  const lx0 = HEAD_END.x;
  const ly0 = HEAD_END.y;
  const ly1 = bottom - 1;
  const leader = `M${P(lx0, ly0)}Q${P((lx0 + CARD_END_X) / 2 + 6, (ly0 + ly1) / 2)} ${P(CARD_END_X, ly1)}`;
  return (
    <Tier tier="subject" tone={CM.paper}>
    <XG m={outer}>
      {ly0 - ly1 > 4 ? <Ink d={leader} at={T1} dur={0.08} width={INK_PX.hair} color={CM.line} seed="s4tagLeader" exit={false} /> : null}
      <XG m={pop}>
        <Fill d={card} color={CM.paper} offset={false} seed="s4tagCard" />
        {ext > 0.02 ? <Ink d={`M${P(X0 + 10, Y1A - 4)}L${P(X1 - 12, Y1A - 4)}`} width={INK_PX.hair} color={CM.stoneShade} seed="s4tagCrease" /> : null}
        <Ink d={card} width={INK_PX.mid} seed="s4tagEdge" />
        {/* the knot where the thread ties onto the card (v1's labels carry a pin: a small dark mark) */}
        <Fill d={ovalPath(CARD_END_X, bottom + 0.5, 3.4, 3)} color={CM.ink} offset={false} seed="s4tagKnot" />
        {LINES.map((l, i) => (
          <WorldText key={i} x={TX} y={l.y} size={l.size} text={l.text} at={l.at} dur={l.dur} weight={l.weight} seed={`s4tag${i}`} maxW={X1 - 14 - TX} />
        ))}
      </XG>
    </XG>
    </Tier>
  );
};
