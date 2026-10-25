// S10 second row (replaces the OldQuarter 'second' layer through the set's `wrap`; stand-in for the sets request
// "second-row plaques with an `old` mask and one old door with a pre-existing caretaker tag; support-tag slots on the
// plaques"). Fix round 2 re-lay: nine real buildings behind the near row, the far plates enlarged to 44 px and kept clear
// of every other detail (no antenna rods, no dark boards over the sun, windows at half density):
//  - LEFT of the sun: one tall building (b0) with an OLD plate;
//  - UNDER the sun: four low, plate-less rooftops (tops 772-792), fills and one roofline stroke each, so the 1/2 pie reads;
//  - RIGHT of the sun: two tall ones (A current, B old);
//  - IN the street gap: a cream gabled house (C old) behind a lower tan one (D current).
// On 'versions' EVERY far plate paper-flips (a version check, 0.05 s apart): the old ones land dark (ochre, chipped,
// bent corner, crack) AND drop crooked onto their one screw in the same move, with a dust puff; the current ones land
// cream. On 'so' + 0.12 the old ones grow a cream cobweb tuft and sag a little more. On 'supported' the wave of 30 px
// support tags pops onto the CURRENT plates (A, then D), and each OLD plate it passes shudders (the skip, seen): A tag,
// B shudder, C shudder, D tag, 0.08 s apart. With the near row: 4 old of 8 plates.

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {blob, circle, line, polyPath, rect, rectPath, Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {OLD_QUARTER, PopUp, SI, SupportTag} from './kit';
import {plateFace} from './plate';

const EYE = OLD_QUARTER.eye; // 1150: the far row stands on the eye line
type Roof = 'flat' | 'gable' | 'step' | 'chimney';
/** `hang`: the screw an old plate keeps (it drops crooked about it; default 'tl'). */
type Plate = {x: number; y: number; old: boolean; hang?: 'tl' | 'tr'};
type B = {x: number; w: number; top: number; roof: Roof; color: string; plate?: Plate};

/** The old far plates' crooked drop onto their one screw + the sag on 'so' (deg). */
const DROP_DEG = 9;
const SAG_DEG = 3;
/** Far plate size (world px; 46 px on screen at the 1.05 push). */
/** A1 FR1: 33 (was 44: each far plate was ~5 far windows wide, a sticker on the skyline; a near plaque is ~2.4 near
 *  windows wide). */
export const FAR_PLATE = 33;
/** Far plate ink (world px): the far layer's thin weight. */
const FAR_INK = 2;
/** Pop stagger back to front (fix round 2b: 0.04 -> 0.03, with the row leading 'like' by 0.30 s, so all nine pops start
 *  0.571-0.811 local and settle by ~1.01: after the gap wedge, before the sun's spoke and its cream half on 'HALF'). */
const STAGGER = 0.03;

// Order = draw order (back to front) = pop order (STAGGER). Roof peaks stay >= 640 (screen >= 603: rule 10).
const DEF: B[] = [
  // b0: P0 centred on the wall right of siteL's mansard (its slope is at x <= 353 down to the mansard base 690 + 6 px
  // of ink overshoot): the plate spans 359-403, clear of it even after its crooked drop (fix round 2b: was x 369)
  // A1 FR1: b0's 45 px sliver beside the mansard (next to the sun) is left EMPTY: P0 is dropped (C carries the third old
  // plate of the row: siteM, B, C)
  {x: 338, w: 66, top: 646, roof: 'flat', color: palette.sage},
  {x: 398, w: 52, top: 792, roof: 'flat', color: palette.sand},
  {x: 450, w: 54, top: 776, roof: 'gable', color: palette.tan},
  {x: 504, w: 50, top: 790, roof: 'step', color: palette.cream},
  {x: 554, w: 48, top: 774, roof: 'chimney', color: palette.sage},
  // A1 FR1: every far plate sits fully inside ONE visible facade, below its roofline, >= 12 px from its edges
  {x: 602, w: 80, top: 662, roof: 'step', color: palette.tan, plate: {x: 646, y: 712, old: false}},
  {x: 682, w: 62, top: 648, roof: 'flat', color: palette.sage, plate: {x: 711, y: 708, old: true}},
  // the street gap (x 640-740): a cream gabled house behind a lower tan one (nearer, so drawn later)
  {x: 640, w: 100, top: 776, roof: 'gable', color: palette.cream, plate: {x: 690, y: 820, old: true, hang: 'tr'}},
  {x: 640, w: 100, top: 868, roof: 'flat', color: palette.tan, plate: {x: 690, y: 914, old: false}},
];

export const SECOND = DEF.map((d, i) => ({...d, i, cx: d.x + d.w / 2}));
const PLATED = SECOND.filter((b) => b.plate);

const GABLE = 22;

/** Roof shapes (fills in the wall colour + one roofline stroke) and the half-density window dots, batched once. */
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
      if (b.roof === 'chimney') {
        const cx = x + w * 0.3;
        dark = rectPath(cx, top - 14, 9, 14) + rectPath(cx - 2, top - 17, 13, 4);
        ink += line(cx - 3, top - 16, cx + 12, top - 16, {seed: `s10s/c${b.i}c`, over: 0, breaks: false});
      }
    }
    // the left wall edge (the right one is the next building's left edge)
    if (b.i !== 0) ink += line(x, b.roof === 'gable' ? top + 1 : b.roof === 'step' ? top - 6 : top, x, Math.min(EYE, b.i >= 7 ? EYE : 820), {seed: `s10s/l${b.i}`, over: 0, breaks: false});
    return {fill, ink, dark};
  });
  // window dots at HALF density (rows every 40 px, one column on narrow walls), skipping the plate's storey (+-8 px)
  const winDark: string[] = [];
  const winLight: string[] = [];
  for (const b of SECOND) {
    let wd = '';
    const ww = 7;
    const cols = b.w >= 58 ? [0.24, 0.66] : [0.42];
    for (let yy = b.top + 16; yy < EYE - 50; yy += 40) {
      if (b.plate && yy + 11 > b.plate.y - FAR_PLATE / 2 - 8 && yy < b.plate.y + FAR_PLATE / 2 + 8) continue;
      for (const c of cols) wd += rectPath(b.x + b.w * c, yy, ww, 11);
    }
    (b.color === palette.sage ? winLight : winDark).push(wd);
  }
  // the gap houses' doors on the eye line (the gabled house's door shows left of the nearer one's)
  const doors = [
    {i: 8, x: 652, y: EYE - 34, w: 15, h: 34},
    {i: 8, x: 712, y: EYE - 34, w: 15, h: 34},
  ];
  return {roofs, winDark: winDark.join(''), winLight: winLight.join(''), doors};
})();

export type SecondRowProps = {
  /** Pop-up start (STAGGER, back to front). */
  popAt: number;
  /** EVERY plate paper-flips (0.05 s apart): the old ones land dark + crooked with a dust puff. */
  flipAt: number;
  /** The old ones grow a cobweb tuft and sag a little more. */
  dropAt: number;
  /** One gap window lights up. */
  windowAt: number;
  /** The wave: tags pop onto the CURRENT plates and the OLD ones it passes shudder (0.08 s apart). */
  tagsAt: number;
};

/** A dust puff: five specks fly out and shrink away (0.26 s, no fade). */
const Puff: React.FC<{x: number; y: number; at: number; r?: number; seed: string}> = ({x, y, at, r = 26, seed}) => {
  const t = useTime();
  if (t < at || t >= at + 0.26) return null;
  const q = E.outCubic(prog(t, at, 0.18));
  const shrink = 1 - prog(t, at + 0.14, 0.12);
  let d = '';
  [[-1, -0.6], [1, -0.8], [-0.9, 0.7], [0.8, 0.9], [0.1, -1.1]].forEach(([dx, dy], i) => {
    const rr = 3.6 * shrink;
    if (rr > 0.3) d += blob(x + dx * (r * 0.55 + q * r), y + dy * (r * 0.45 + q * r * 0.8), rr, rr, {seed: `${seed}/${i}`});
  });
  return d ? <Fill d={d} color={palette.sand} mode="none" offset={false} seed={`${seed}/puff`} /> : null;
};

/** One far wall plate: flips at `flipAt` (scaleX through edge-on, the face swaps at the edge-on); an old one lands dark AND
 *  drops crooked onto its top-left screw (outBack) in the same move; `sagAt` adds 5 deg + a cream tuft in its free top-right
 *  corner; `shudderAt` = the wave skipping it (a 0.2 s jerk + a little hop); `tagAt` = a 30 px support tag pops on. */
const FarPlate: React.FC<{p: Plate; flipAt: number; sagAt: number; shudderAt?: number; tagAt?: number; seed: string}> = ({p, flipAt, sagAt, shudderAt, tagAt, seed}) => {
  const t = useTime();
  const P = FAR_PLATE;
  const s = P / 100;
  const q = prog(t, flipAt, 0.2, E.inOutSine);
  const old = p.old && q >= 0.5;
  const sx = q > 0 && q < 1 ? Math.max(0.03, Math.abs(Math.cos(Math.PI * q))) : 1;
  // the crooked drop starts at the swap (flipAt + 0.1), outBack; the sag on 'so'. Fix round 2b: 9 + 3 deg (was 16 + 5:
  // at 25-30 deg the dark plates read as diamonds / stickers in mid-air, not plates on a wall)
  // P0 and C keep their top-RIGHT screw (P0's free corner swings away from siteL's mansard), B its top-left
  const dir = p.hang === 'tr' ? -1 : 1;
  let rot = old ? dir * (DROP_DEG * prog(t, flipAt + 0.1, 0.24, E.outBack(2.2)) + SAG_DEG * prog(t, sagAt, 0.22, E.outBack(1.8))) : 0;
  let hop = 0;
  if (shudderAt !== undefined && t >= shudderAt && t < shudderAt + 0.2) {
    const d = t - shudderAt;
    rot += 6 * Math.exp(-d * 14) * Math.sin(d * 2 * Math.PI * 9);
    hop = -4 * Math.sin(Math.PI * Math.min(1, d / 0.12));
  }
  const pivot: Pt = [p.x - dir * 38 * s, p.y - 38 * s];
  // the old plate hangs on its ONE remaining screw (a fat ink screw head at the pivot, on the wall) and the empty hole
  // of the second screw stays on the wall where the plate's top-right corner was (an ink ring): a plate that dropped
  const dropped = old && t >= flipAt + 0.1;
  const hole: Pt = [p.x + dir * 38 * s, p.y - 38 * s];
  return (
    <>
      {dropped ? <Ink d={circle(hole[0], hole[1], 2.3, {seed: `${seed}/hole`})} width={1.5} taper={false} vary={0} seed={`${seed}/hole`} /> : null}
      <XG m={mat.compose(mat.translate(0, hop), mat.about(mat.rotate(rot), pivot[0], pivot[1]))}>
      <XG m={mat.compose(mat.translate(p.x, p.y), mat.scale(s * sx, s))}>{plateFace({old, W: FAR_INK / s, seed, offset: [3, 2.2], screws: !old})}</XG>
      {/* A1 FR1: no cobweb tufts on the far plates (dark + crooked is enough); the wave's tags are 24 px */}
      {tagAt !== undefined && t >= tagAt ? <SupportTag x={p.x + 5} y={p.y - P / 2 + 2} size={24} at={tagAt} checkAt={tagAt + 0.05} seed={`${seed}/tag`} /> : null}
      </XG>
      {old ? (
        <>
          <Fill d={circle(pivot[0], pivot[1] + hop, 3.1, {seed: `${seed}/scr`})} color={palette.ink} offset={false} mode="none" seed={`${seed}/scr`} />
          <Ink d={`M${(pivot[0] - 1.8).toFixed(1)} ${(pivot[1] + hop - 1.2).toFixed(1)}L${(pivot[0] + 1.8).toFixed(1)} ${(pivot[1] + hop + 1.2).toFixed(1)}`} width={0.9} color={palette.cream} taper={false} vary={0} seed={`${seed}/slot`} />
        </>
      ) : null}
    </>
  );
};

export const SecondRow: React.FC<SecondRowProps> = ({popAt, flipAt, dropAt, windowAt, tagsAt}) => {
  const t = useTime();
  const flips = new Map<number, number>();
  PLATED.forEach((b, k) => flips.set(b.i, flipAt + 0.05 * k));
  // the wave runs over the plates right of the sun and down the gap (A, B, C, D): tags on the current, shudders on the old
  const wave = new Map<number, number>();
  PLATED.filter((b) => b.i >= 5).forEach((b, k) => wave.set(b.i, tagsAt + 0.08 * k));
  const winLit = t >= windowAt;
  return (
    <>
      {SECOND.map((b) => {
        const pa = popAt + STAGGER * b.i;
        const r = G.roofs[b.i];
        const fa = flips.get(b.i);
        const wa = wave.get(b.i);
        return (
          <PopUp key={b.i} at={pa} x={b.cx} y={EYE}>
            {r.fill ? <Fill d={r.fill} color={b.color} offset={false} seed={`s10s/rf${b.i}`} /> : null}
            <Fill rect={[b.x, b.top, b.w + 2, EYE - b.top]} color={b.color} seed={`s10s/b${b.i}`} />
            {r.dark ? <Fill d={r.dark} color={palette.tan} offset={false} mode="snap" seed={`s10s/rd${b.i}`} /> : null}
            <Ink d={r.ink} width={SI.far} taper={false} seed={`s10s/i${b.i}`} />
            {b.plate && fa !== undefined ? (
              <FarPlate p={b.plate} flipAt={fa} sagAt={dropAt + 0.05 * PLATED.indexOf(b)} shudderAt={b.plate.old ? wa : undefined} tagAt={b.plate.old ? undefined : wa} seed={`s10s/p${b.i}`} />
            ) : null}
          </PopUp>
        );
      })}
      {/* window dots, batched (half density); they arrive with the last pop-ups */}
      {t >= popAt + STAGGER * 8 + 0.18 ? (
        <>
          <Fill d={G.winDark} color={palette.tealDark} offset={false} mode="snap" seed="s10s/win" />
          <Fill d={G.winLight} color={palette.mintPale} offset={false} mode="snap" seed="s10s/winl" />
        </>
      ) : null}
      {winLit ? <Fill rect={[SECOND[6].x + SECOND[6].w * 0.24, SECOND[6].top + 16 + 40 * 4, 7, 11]} color={palette.peach} offset={false} mode="snap" seed="s10s/lit" /> : null}
      {/* gap doors: the OLD gabled house's door already carries a host's own sage tag on its handle (a pauser detail) */}
      {G.doors.map((d, k) =>
        t >= popAt + STAGGER * (7 + k) + 0.1 ? (
          <React.Fragment key={k}>
            <Fill d={rectPath(d.x, d.y, d.w, d.h)} color={palette.teal} offset={false} mode="snap" seed={`s10s/d${k}`} />
            <Ink d={rect(d.x, d.y, d.w, d.h, {seed: `s10s/di${k}`, over: 1, edges: 'tlr'})} width={SI.hair} taper={false} seed={`s10s/di${k}`} />
            <Fill d={blob(d.x + d.w - 4, d.y + d.h * 0.55, 1.6, 1.6, {seed: `s10s/h${k}`})} color={palette.cream} offset={false} mode="none" seed={`s10s/h${k}`} />
          </React.Fragment>
        ) : null,
      )}
      {t >= popAt + STAGGER * 7 + 0.1
        ? (() => {
            const d = G.doors[0];
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
      {PLATED.map((b) => (b.plate!.old ? <Puff key={`pf${b.i}`} x={b.plate!.x} y={b.plate!.y} at={flips.get(b.i)! + 0.1} seed={`s10s/pf${b.i}`} /> : null))}
    </>
  );
};
