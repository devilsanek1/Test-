// S10 second row (replaces the OldQuarter 'second' layer through the set's `wrap`; stand-in for the sets request
// "second-row plaques with an `old` mask (5 of 9, alternating) and one old door with a pre-existing caretaker tag;
// support-tag slots on the plaques"). Nine narrow far buildings above siteM and in the street gap (640-740), each with a
// small elephant wall plate on its top storey (above siteM's cornice, so all nine read), popping up from behind the
// near row; the old ones (0, 2, 4, 6, 8) flip with a dust puff; tiny support tags wave onto the current ones.

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {blob, line, rect, rectPath} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {ElephantPlaque, OLD_QUARTER, pendulum, popK, PopUp, SI} from './kit';

const EYE = OLD_QUARTER.eye; // 1150: the far row stands on the eye line
const WIDTHS = [44, 46, 42, 45, 43, 44, 46, 42, 44];
const TOPS = [748, 740, 754, 744, 758, 742, 750, 738, 746];
/** Old sites (5 of 9, alternating). Old plates sit on sage walls, current (sand) plates on tan / cream walls. */
const OLD = [true, false, true, false, true, false, true, false, true];
const COLS = [palette.sage, palette.tan, palette.sage, palette.cream, palette.sage, palette.tan, palette.sage, palette.cream, palette.sage];
export const PLAQUE_Y = 782;
const PLAQUE = 18;

export const SECOND = (() => {
  let x = 346;
  return WIDTHS.map((w, i) => {
    const b = {i, x, w, top: TOPS[i], cx: x + w / 2, old: OLD[i], color: COLS[i]};
    x += w;
    return b;
  });
})();

const G = (() => {
  const win: string[] = [];
  const winDark: string[] = [];
  for (const b of SECOND) {
    let w = '';
    for (let yy = 806; yy < EYE - 44; yy += 30) w += rectPath(b.x + b.w * 0.18, yy, b.w * 0.24, 14) + rectPath(b.x + b.w * 0.58, yy, b.w * 0.24, 14);
    (b.color === palette.sage ? winDark : win).push(w);
  }
  // doors on the two gap buildings (their bases show in the gap)
  const doors = [7, 8].map((i) => {
    const b = SECOND[i];
    return {i, x: b.cx - 8, y: EYE - 34, w: 16, h: 34};
  });
  return {win: win.join(''), winDark: winDark.join(''), doors};
})();

export type SecondRowProps = {
  /** Pop-up start (0.04 s stagger left to right). */
  popAt: number;
  /** The old plates flip (0.04 s apart) with a dust puff each. */
  flipAt: number;
  /** One gap window lights up. */
  windowAt: number;
  /** Tiny support tags pop onto the CURRENT plates (0.06 s apart), skipping the old ones. */
  tagsAt: number;
};

/** A dust puff: four specks fly out 10 px and shrink away (0.35 s, no fade). */
const Puff: React.FC<{x: number; y: number; at: number; r?: number; seed: string}> = ({x, y, at, r = 11, seed}) => {
  const t = useTime();
  if (t < at || t >= at + 0.36) return null;
  const q = E.outCubic(prog(t, at, 0.26));
  const shrink = 1 - prog(t, at + 0.2, 0.16);
  let d = '';
  [[-1, -0.6], [1, -0.8], [-0.9, 0.7], [0.8, 0.9]].forEach(([dx, dy], i) => {
    const rr = 2.2 * shrink;
    if (rr > 0.2) d += blob(x + dx * (r * 0.6 + q * r), y + dy * (r * 0.5 + q * r * 0.8), rr, rr, {seed: `${seed}/${i}`});
  });
  return d ? <Fill d={d} color={palette.sand} mode="none" offset={false} seed={`${seed}/puff`} /> : null;
};

/** The tiny sage support tag of the far row (one string, a 7 x 10 tag), swinging in. */
const TinyTag: React.FC<{x: number; y: number; at: number; seed: string}> = ({x, y, at, seed}) => {
  const t = useTime();
  if (t < at) return null;
  const k = popK(t, at, 0.12, 0.18);
  const sw = pendulum(t, at, -18, 0.45, 0.8);
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(sw), mat.scale(k))}>
      <Ink d={`M0 0L0 4`} width={1.1} taper={false} seed={`${seed}/s`} />
      <Fill d={rectPath(-4, 4, 8, 10)} color={palette.sage} offset={false} mode="none" seed={`${seed}/f`} />
      <Ink d={rect(-4, 4, 8, 10, {seed: `${seed}/i`, over: 0.5})} width={1.2} taper={false} seed={`${seed}/i`} />
    </XG>
  );
};

export const SecondRow: React.FC<SecondRowProps> = ({popAt, flipAt, windowAt, tagsAt}) => {
  const t = useTime();
  let flipI = 0;
  let tagI = 0;
  const flips = SECOND.map((b) => (b.old ? flipAt + 0.04 * flipI++ : undefined));
  const tags = SECOND.map((b) => (b.old ? undefined : tagsAt + 0.06 * tagI++));
  const winLit = t >= windowAt;
  return (
    <>
      {SECOND.map((b) => {
        const pa = popAt + 0.04 * b.i;
        return (
          <PopUp key={b.i} at={pa} x={b.cx} y={EYE}>
            <Fill rect={[b.x, b.top, b.w + 2, EYE - b.top]} color={b.color} seed={`s10s/b${b.i}`} />
            <Ink d={line(b.x, b.top, b.x + b.w + 2, b.top, {seed: `s10s/t${b.i}`, over: 'small', breaks: false}) + line(b.x, b.top, b.x, EYE, {seed: `s10s/l${b.i}`, over: 0, breaks: false})} width={SI.far} taper={false} seed={`s10s/i${b.i}`} />
            <ElephantPlaque x={b.cx} y={PLAQUE_Y} size={PLAQUE} variant="plate" age="new" flipOldAt={flips[b.i]} ink={SI.hair} seed={`s10s/p${b.i}`} />
          </PopUp>
        );
      })}
      {/* windows (only the gap shows them: siteM hides the rest), batched; they arrive with the last pop-ups */}
      {t >= popAt + 0.3 ? (
        <>
          <Fill d={G.win} color={palette.sage} offset={false} mode="snap" seed="s10s/win" />
          <Fill d={G.winDark} color={palette.tealDark} offset={false} mode="snap" seed="s10s/wind" />
        </>
      ) : null}
      {winLit ? <Fill rect={[SECOND[7].x + SECOND[7].w * 0.18, 926, SECOND[7].w * 0.24, 14]} color={palette.peach} offset={false} mode="snap" seed="s10s/lit" /> : null}
      {/* gap doors: building 8 is OLD and already carries a host's own sage tag on its handle (a pauser detail, never animated) */}
      {G.doors.map((d) =>
        t >= popAt + 0.04 * d.i + 0.1 ? (
          <React.Fragment key={d.i}>
            <Fill d={rectPath(d.x, d.y, d.w, d.h)} color={palette.teal} offset={false} mode="snap" seed={`s10s/d${d.i}`} />
            <Ink d={rect(d.x, d.y, d.w, d.h, {seed: `s10s/di${d.i}`, over: 1, edges: 'tlr'})} width={SI.hair} taper={false} seed={`s10s/di${d.i}`} />
            <Fill d={blob(d.x + d.w - 4, d.y + d.h * 0.55, 1.6, 1.6, {seed: `s10s/h${d.i}`})} color={palette.cream} offset={false} mode="none" seed={`s10s/h${d.i}`} />
          </React.Fragment>
        ) : null,
      )}
      {t >= popAt + 0.04 * 8 + 0.1 ? (
        <>
          <Ink d={`M${G.doors[1].x + G.doors[1].w - 4} ${G.doors[1].y + G.doors[1].h * 0.55}L${G.doors[1].x + G.doors[1].w - 2} ${G.doors[1].y + G.doors[1].h * 0.55 + 5}`} width={1} taper={false} seed="s10s/ct" />
          <Fill d={rectPath(G.doors[1].x + G.doors[1].w - 6, G.doors[1].y + G.doors[1].h * 0.55 + 5, 8, 10)} color={palette.sage} offset={false} mode="none" seed="s10s/ctag" />
          <Ink d={rect(G.doors[1].x + G.doors[1].w - 6, G.doors[1].y + G.doors[1].h * 0.55 + 5, 8, 10, {seed: 's10s/cti', over: 0.5})} width={1.1} taper={false} seed="s10s/cti" />
        </>
      ) : null}
      {SECOND.map((b) => (b.old ? <Puff key={`pf${b.i}`} x={b.cx} y={PLAQUE_Y} at={flips[b.i]! + 0.1} seed={`s10s/pf${b.i}`} /> : null))}
      {SECOND.map((b) => (!b.old ? <TinyTag key={`tg${b.i}`} x={b.cx + PLAQUE * 0.3} y={PLAQUE_Y + PLAQUE / 2} at={tags[b.i]!} seed={`s10s/tg${b.i}`} /> : null))}
    </>
  );
};
