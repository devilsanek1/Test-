// S10 second row (replaces the OldQuarter 'second' layer through the set's `wrap`; stand-in for the sets request
// "second-row plaques with an `old` mask (5 of 9, alternating) and one old door with a pre-existing caretaker tag;
// support-tag slots on the plaques"). Fix round 1: nine REAL buildings behind the near row, not a frieze of plates:
// heights 60-160 px above siteM's cornice (the four under the sun stay low, plate-less rooftops with windows, so the
// 1/2 pie keeps its read; tall ones left of it and on the gap side), rooflines (gables, a stepped gable, parapets,
// chimneys), window dots, three showing in the street gap down to their doors. The five tall ones carry 34-36 px elephant
// wall plates: the OLD ones (0, 6, 8) flip tan with a big dust puff, drop crooked onto one screw and grow a cobweb tuft;
// 18 px support tags wave onto the current ones (5, 7) only, skipping 6 between them. With the near row: 4 old of 8.

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {blob, line, polyPath, rect, rectPath, Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {Cobweb, ElephantPlaque, OLD_QUARTER, pendulum, popK, PopUp, SI} from './kit';

const EYE = OLD_QUARTER.eye; // 1150: the far row stands on the eye line
type Roof = 'flat' | 'parapet' | 'gable' | 'chimney' | 'step';
type B = {x: number; w: number; top: number; roof: Roof; color: string; old: boolean; plate: Pt; size: number};

/** Old sites (5 of 9, alternating). Old (tan) plates sit on sage / cream walls, current (sand) plates on tan / sage. */
type Def = Omit<B, 'plate' | 'size'> & {/** plate centre y, plate size */ py: number; ps: number};
const DEF: Def[] = [
  {x: 346, w: 48, top: 692, roof: 'chimney', color: palette.sage, old: true, py: 752, ps: 36},
  {x: 394, w: 44, top: 754, roof: 'parapet', color: palette.tan, old: false, py: 0, ps: 0},
  {x: 438, w: 46, top: 762, roof: 'chimney', color: palette.cream, old: false, py: 0, ps: 0},
  {x: 484, w: 42, top: 748, roof: 'gable', color: palette.sand, old: false, py: 0, ps: 0},
  {x: 526, w: 46, top: 758, roof: 'step', color: palette.tan, old: false, py: 0, ps: 0},
  {x: 572, w: 44, top: 722, roof: 'parapet', color: palette.sage, old: false, py: 762, ps: 36},
  {x: 616, w: 46, top: 682, roof: 'flat', color: palette.cream, old: true, py: 730, ps: 36},
  {x: 662, w: 42, top: 706, roof: 'gable', color: palette.sage, old: false, py: 768, ps: 36},
  {x: 704, w: 46, top: 662, roof: 'chimney', color: palette.cream, old: true, py: 716, ps: 34},
];

export const SECOND: (B & {i: number; cx: number})[] = DEF.map((d, i) => {
  // the plate sits on the part of the wall that shows: building 8 is cut by siteR at x 740
  const cx = i === 8 ? 722 : d.x + d.w / 2;
  return {...d, i, cx: d.x + d.w / 2, plate: [cx, d.py] as Pt, size: d.ps};
});

const GABLE = 22;

/** Roof shapes (fills in the wall colour + their own ink) and window dots, batched once. */
const G = (() => {
  const roofs = SECOND.map((b) => {
    const {x, w, top} = b;
    const x1 = x + w + 2;
    let fill = '';
    let ink = '';
    let dark = '';
    if (b.roof === 'gable') {
      fill = polyPath([[x - 1, top + 1], [x + w / 2 + 1, top - GABLE], [x1 + 1, top + 1]]);
      ink = line(x - 3, top + 2, x + w / 2 + 1, top - GABLE, {seed: `s10s/g${b.i}a`, over: [2, 1]}) + line(x + w / 2 + 1, top - GABLE, x1 + 3, top + 2, {seed: `s10s/g${b.i}b`, over: [1, 2]});
    } else if (b.roof === 'step') {
      const s = w / 6;
      const pts: Pt[] = [[x, top + 1], [x, top - 6], [x + s, top - 6], [x + s, top - 13], [x + 2 * s, top - 13], [x + 2 * s, top - 20], [x + 4 * s + 2, top - 20], [x + 4 * s + 2, top - 13], [x + 5 * s + 2, top - 13], [x + 5 * s + 2, top - 6], [x1, top - 6], [x1, top + 1]];
      fill = polyPath(pts);
      ink = pts.slice(1, -1).reduce((acc, p, k, arr) => (k ? acc + line(arr[k - 1][0], arr[k - 1][1], p[0], p[1], {seed: `s10s/st${b.i}${k}`, over: 0, breaks: false}) : acc), '');
    } else {
      ink = line(x - 2, top, x1 + 2, top, {seed: `s10s/t${b.i}`, over: 'small', breaks: false});
      if (b.roof === 'parapet') {
        dark = rectPath(x - 3, top - 6, w + 8, 6);
        ink += line(x - 4, top - 6, x1 + 4, top - 6, {seed: `s10s/p${b.i}`, over: 0, breaks: false});
      }
      if (b.roof === 'chimney') {
        const cx = x + w * 0.68;
        dark = rectPath(cx, top - 18, 9, 18) + rectPath(cx - 2, top - 21, 13, 4);
        ink += line(cx, top, cx, top - 18, {seed: `s10s/c${b.i}a`, over: 0, breaks: false}) + line(cx + 9, top - 18, cx + 9, top, {seed: `s10s/c${b.i}b`, over: 0, breaks: false}) + line(cx - 3, top - 20, cx + 12, top - 20, {seed: `s10s/c${b.i}c`, over: 0, breaks: false});
      }
    }
    // the left wall edge (the right one is the next building's left edge)
    ink += line(x, b.roof === 'gable' ? top + 1 : b.roof === 'step' ? top - 6 : top, x, EYE, {seed: `s10s/l${b.i}`, over: 0, breaks: false});
    return {fill, ink, dark};
  });
  // window dots: rows every 26 px from under the roof to the doors, skipping the plate's storey
  const winDark: string[] = [];
  const winLight: string[] = [];
  for (const b of SECOND) {
    let wd = '';
    const ww = Math.max(6, b.w * 0.18);
    for (let yy = b.top + 12; yy < EYE - 46; yy += 26) {
      if (b.size > 0 && yy + 10 > b.plate[1] - b.size / 2 - 4 && yy < b.plate[1] + b.size / 2 + 4) continue;
      wd += rectPath(b.x + b.w * 0.2, yy, ww, 10) + rectPath(b.x + b.w * 0.62, yy, ww, 10);
    }
    (b.color === palette.sage ? winLight : winDark).push(wd);
  }
  // doors of the three gap buildings (their bases show in the gap)
  const doors = [
    {i: 6, x: 645, y: EYE - 34, w: 14, h: 34},
    {i: 7, x: 676, y: EYE - 34, w: 15, h: 34},
    {i: 8, x: 714, y: EYE - 34, w: 15, h: 34},
  ];
  return {roofs, winDark: winDark.join(''), winLight: winLight.join(''), doors};
})();

export type SecondRowProps = {
  /** Pop-up start (0.04 s stagger left to right). */
  popAt: number;
  /** The old plates flip (0.06 s apart) with a dust puff each. */
  flipAt: number;
  /** ... and later (on 'so' + 0.12, a beat after the puffs) drop crooked onto one screw and grow a cobweb tuft. */
  dropAt: number;
  /** One gap window lights up. */
  windowAt: number;
  /** Support tags pop onto the CURRENT plates (0.08 s apart), skipping the old ones. */
  tagsAt: number;
};

/** A dust puff: five specks fly out and shrink away (0.26 s, no fade). r = spread radius (doubled in fix round 1). */
const Puff: React.FC<{x: number; y: number; at: number; r?: number; seed: string}> = ({x, y, at, r = 22, seed}) => {
  const t = useTime();
  if (t < at || t >= at + 0.26) return null;
  const q = E.outCubic(prog(t, at, 0.18));
  const shrink = 1 - prog(t, at + 0.14, 0.12);
  let d = '';
  [[-1, -0.6], [1, -0.8], [-0.9, 0.7], [0.8, 0.9], [0.1, -1.1]].forEach(([dx, dy], i) => {
    const rr = 3.4 * shrink;
    if (rr > 0.3) d += blob(x + dx * (r * 0.55 + q * r), y + dy * (r * 0.45 + q * r * 0.8), rr, rr, {seed: `${seed}/${i}`});
  });
  return d ? <Fill d={d} color={palette.sand} mode="none" offset={false} seed={`${seed}/puff`} /> : null;
};

/** The far row's sage support tag (one string, an 18 x 17 tag with a cream tick), swinging in. (x, y) = the knot. */
const FarTag: React.FC<{x: number; y: number; at: number; seed: string}> = ({x, y, at, seed}) => {
  const t = useTime();
  if (t < at) return null;
  const k = popK(t, at, 0.12, 0.18);
  const sw = pendulum(t, at, -26, 0.45, 0.85);
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(sw), mat.scale(k))}>
      <Ink d={`M0 0L0 5`} width={1.4} taper={false} seed={`${seed}/s`} />
      <Fill d={rectPath(-9, 5, 18, 17)} color={palette.sage} offset={false} mode="none" seed={`${seed}/f`} />
      <Ink d={rect(-9, 5, 18, 17, {seed: `${seed}/i`, over: 0.5})} width={1.7} taper={false} seed={`${seed}/i`} />
      <Ink d={`M-4.5 13.5l3 3.5l5.6 -7`} width={2.2} color={palette.cream} taper={false} seed={`${seed}/c`} />
    </XG>
  );
};

export const SecondRow: React.FC<SecondRowProps> = ({popAt, flipAt, dropAt, windowAt, tagsAt}) => {
  const t = useTime();
  let flipI = 0;
  let tagI = 0;
  const flips = SECOND.map((b) => (b.old && b.size > 0 ? flipAt + 0.06 * flipI++ : undefined));
  let dropI = 0;
  const drops = SECOND.map((b) => (flips[b.i] !== undefined ? dropAt + 0.06 * dropI++ : undefined));
  const tags = SECOND.map((b) => (b.old || b.size === 0 ? undefined : tagsAt + 0.08 * tagI++));
  const winLit = t >= windowAt;
  return (
    <>
      {SECOND.map((b) => {
        const pa = popAt + 0.04 * b.i;
        const r = G.roofs[b.i];
        const P = b.size;
        const [px, py] = b.plate;
        const fa = flips[b.i];
        // old: after the flip (and a still beat) the plate drops onto its top-left screw and hangs crooked (outBack), a
        // cobweb tuft grows in its free corner
        const da = drops[b.i];
        const drop = da !== undefined ? 18 * prog(t, da, 0.3, E.outBack(2.2)) : 0;
        return (
          <PopUp key={b.i} at={pa} x={b.cx} y={EYE}>
            {r.fill ? <Fill d={r.fill} color={b.color} offset={false} seed={`s10s/rf${b.i}`} /> : null}
            <Fill rect={[b.x, b.top, b.w + 2, EYE - b.top]} color={b.color} seed={`s10s/b${b.i}`} />
            {r.dark ? <Fill d={r.dark} color={palette.brown} offset={false} mode="snap" seed={`s10s/rd${b.i}`} /> : null}
            <Ink d={r.ink} width={SI.far} taper={false} seed={`s10s/i${b.i}`} />
            {P > 0 ? (
              <XG m={mat.about(mat.rotate(drop), px - P * 0.38, py - P * 0.38)}>
                <ElephantPlaque x={px} y={py} size={P} variant="plate" age="new" flipOldAt={fa} ink={SI.far} seed={`s10s/p${b.i}`} />
                {da !== undefined ? <Cobweb x={px + P / 2} y={py - P / 2} r={P * 0.42} corner="tr" at={da + 0.04} dur={0.2} width={1.5} seed={`s10s/w${b.i}`} /> : null}
              </XG>
            ) : null}
          </PopUp>
        );
      })}
      {/* window dots, batched; they arrive with the last pop-ups */}
      {t >= popAt + 0.3 ? (
        <>
          <Fill d={G.winDark} color={palette.tealDark} offset={false} mode="snap" seed="s10s/win" />
          <Fill d={G.winLight} color={palette.mintPale} offset={false} mode="snap" seed="s10s/winl" />
        </>
      ) : null}
      {winLit ? <Fill rect={[SECOND[7].x + SECOND[7].w * 0.62, SECOND[7].top + 12 + 26 * 6, Math.max(6, SECOND[7].w * 0.18), 10]} color={palette.peach} offset={false} mode="snap" seed="s10s/lit" /> : null}
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
      {t >= popAt + 0.04 * 8 + 0.1
        ? (() => {
            const d = G.doors[2];
            const hx = d.x + d.w - 4;
            const hy = d.y + d.h * 0.55;
            return (
              <>
                <Ink d={`M${hx} ${hy}L${hx + 2} ${hy + 5}`} width={1} taper={false} seed="s10s/ct" />
                <Fill d={rectPath(hx - 2, hy + 5, 9, 11)} color={palette.sage} offset={false} mode="none" seed="s10s/ctag" />
                <Ink d={rect(hx - 2, hy + 5, 9, 11, {seed: 's10s/cti', over: 0.5})} width={1.1} taper={false} seed="s10s/cti" />
              </>
            );
          })()
        : null}
      {SECOND.map((b) => (flips[b.i] !== undefined ? <Puff key={`pf${b.i}`} x={b.plate[0]} y={b.plate[1]} at={flips[b.i]! + 0.1} seed={`s10s/pf${b.i}`} /> : null))}
      {/* the support tags, knotted to the plate's upper-right screw (hanging over its edge, clear of siteM's cornice) */}
      {SECOND.map((b) => (tags[b.i] !== undefined ? <FarTag key={`tg${b.i}`} x={b.plate[0] + b.size / 2 - 4} y={b.plate[1] - b.size / 2 + 5} at={tags[b.i]!} seed={`s10s/tg${b.i}`} /> : null))}
    </>
  );
};
