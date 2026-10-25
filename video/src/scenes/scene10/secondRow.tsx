// S10 second row (replaces the OldQuarter 'second' layer through the set's `wrap`; stand-in for the sets request
// "second-row plaques with an `old` mask and one old door with a pre-existing caretaker tag; support-tag slots on the
// plaques"). A1 FR2 re-lay: ten buildings behind the near row, SIX far plates at 40 px (42 on screen), ink 2.0, kept clear
// of every other detail (no antenna rods, no dark boards over the sun, windows at half density):
//  - LEFT of the sun: one tall building (b0) with a current plate (P0);
//  - UNDER the sun: four low, plate-less rooftops (tops 772-792), fills and one roofline stroke each, so the 1/2 pie reads;
//  - RIGHT of the sun: two tall ones (A old on a cream wall, B current);
//  - IN the street gap: three houses stepping down toward us (C old, D current, E old), plates zig-zagging.
// On 'versions' EVERY far plate paper-flips (a version check, 0.04 s apart, reading order): the old ones land with a
// 1-frame dark pop, then ochre (chipped, bent corner, crack) AND drop crooked onto their one screw in the same move, with
// a 1.5x dust puff; the current ones land cream. On 'so' + 0.12 the old ones sag a little more. On 'supported' the wave
// of 24 px support tags pops onto the CURRENT plates and each OLD plate it passes shudders (the skip, seen), 0.06 s
// apart. With the near row: 4 old of 9 plates (about half at thumbnail size).

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {blob, circle, line, polyPath, rect, rectPath, Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {mix} from '../../lib/cine/util';
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
/** A1 FR2: 40 (42 on screen; was 33: at thumbnail size the far plates were specks and 'half' rested on the sun pie). */
export const FAR_PLATE = 40;
/** Far plate ink (world px): the far layer's thin weight. */
const FAR_INK = 2;
/** Pop stagger back to front (fix round 2b: 0.04 -> 0.03, with the row leading 'like' by 0.30 s, so all nine pops start
 *  0.571-0.811 local and settle by ~1.01: after the gap wedge, before the sun's spoke and its cream half on 'HALF'). */
/** A1 FR2: 0.025 with the row at 'like' - 0.22 (ten pops, the last settles ~40.71, its own beat after the sun lands). */
const STAGGER = 0.025;

// Order = draw order (back to front) = pop order (STAGGER). Roof peaks stay >= 640 (screen >= 603: rule 10).
const DEF: B[] = [
  // A1 FR2 (far cascade you can see): SIX far plates at 40 px (42 on screen), ink 2.0, alternating current / OLD in
  // reading order (P0, A, B, C, D, E): with the near row 4 old of 9 at thumbnail size. Every plate sits fully inside
  // ONE visible facade (the gap's visible width is 654-726 below y 921, between the near sites' return faces), the old
  // ones on LIGHT walls (cream / mintPale / sand) so the ochre plate is the darkest thing on its wall.
  // b0: P0 (current) in the sliver right of siteL's edge (345) and left of the sun (b0 covers the sun's left rim)
  {x: 338, w: 66, top: 646, roof: 'flat', color: palette.sage, plate: {x: 375, y: 726, old: false}},
  {x: 398, w: 52, top: 792, roof: 'flat', color: palette.sand},
  {x: 450, w: 54, top: 776, roof: 'gable', color: palette.tan},
  {x: 504, w: 50, top: 790, roof: 'step', color: palette.cream},
  {x: 554, w: 48, top: 774, roof: 'chimney', color: palette.sage},
  // A (OLD, cream wall beside the sun) and B (current, tan)
  {x: 602, w: 80, top: 662, roof: 'step', color: palette.cream, plate: {x: 646, y: 706, old: true}},
  {x: 682, w: 62, top: 648, roof: 'flat', color: palette.tan, plate: {x: 712, y: 694, old: false}},
  // the street gap (x 640-740): three houses stepping down toward us (each nearer one drawn later), plates zig-zag
  {x: 640, w: 100, top: 800, roof: 'gable', color: palette.mintPale, plate: {x: 673, y: 838, old: true, hang: 'tr'}},
  {x: 640, w: 100, top: 892, roof: 'flat', color: palette.tan, plate: {x: 700, y: 932, old: false}},
  {x: 640, w: 100, top: 980, roof: 'chimney', color: palette.sand, plate: {x: 681, y: 1022, old: true}},
];

export const SECOND = DEF.map((d, i) => ({...d, i, cx: d.x + d.w / 2}));
const PLATED = SECOND.filter((b) => b.plate);

const GABLE = 22;
/** Far flip spacing (storyboard: 0.04 s apart). */
const FLIP_STEP = 0.04;
/** Wrap FR1: when an OLD far plate lands (its 1-frame dark pop) the whole building ages on the same frame: its facade
 *  takes a 35 % wash of the old-plate brown and its window dots turn into dark ink ticks, so old / current reads by
 *  building MASS at thumbnail size (alternating light and dark far houses), not only by the 40 px plates. */
const AGE_WASH = 0.7;
/** The windows that light on 'of' (window-dot origins, world; each on a visible wall: b0, A, E). */
const LIT: Pt[] = [[338 + 66 * 0.24, 662], [602 + 80 * 0.24, 758], [640 + 100 * 0.66, 1076]];

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
  // window dots at HALF density (rows every 40 px, one column on narrow walls), skipping the plate's storey (+-8 px).
  // Wrap FR1: per building, drawn inside its PopUp (the batched layer sat on top of the nearer gap houses); an old
  // building also gets its aged windows: slanted dark ink ticks on the same spots
  const win: string[] = [];
  const ticks: string[] = [];
  for (const b of SECOND) {
    let wd = '';
    let tk = '';
    const ww = 7;
    const cols = b.w >= 58 ? [0.24, 0.66] : [0.42];
    for (let yy = b.top + 16; yy < EYE - 50; yy += 40) {
      if (b.plate && yy + 11 > b.plate.y - FAR_PLATE / 2 - 8 && yy < b.plate.y + FAR_PLATE / 2 + 8) continue;
      for (const c of cols) {
        const wx = b.x + b.w * c;
        wd += rectPath(wx, yy, ww, 11);
        tk += polyPath([[wx + 1.5, yy - 1], [wx + ww + 0.5, yy + 0.5], [wx + ww - 1, yy + 12], [wx - 0.5, yy + 10.5]]);
      }
    }
    win.push(wd);
    ticks.push(tk);
  }
  // the nearest gap house's (E, OLD) doors on the eye line, inside the visible 654-726 between the return faces
  const doors = [
    {i: 9, x: 664, y: EYE - 34, w: 15, h: 34},
    {i: 9, x: 700, y: EYE - 34, w: 15, h: 34},
  ];
  return {roofs, win, ticks, doors};
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

/** A dust puff: five specks fly out and shrink away (0.26 s, no fade). A1 FR2: r 39 / specks 5.4 on the far flips (1.5x). */
const Puff: React.FC<{x: number; y: number; at: number; r?: number; speck?: number; seed: string}> = ({x, y, at, r = 26, speck = 3.6, seed}) => {
  const t = useTime();
  if (t < at || t >= at + 0.26) return null;
  const q = E.outCubic(prog(t, at, 0.18));
  const shrink = 1 - prog(t, at + 0.14, 0.12);
  let d = '';
  [[-1, -0.6], [1, -0.8], [-0.9, 0.7], [0.8, 0.9], [0.1, -1.1]].forEach(([dx, dy], i) => {
    const rr = speck * shrink;
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
  // A1 FR2: an old plate LANDS with a 1-frame dark pop (ink-brown face, 1.12x) as its flip completes: the thunk of 'old'
  const thunk = p.old && t >= flipAt + 0.2 && t < flipAt + 0.2 + 1 / 30;
  const pk = thunk ? 1.12 : 1;
  // the old plate hangs on its ONE remaining screw (a fat ink screw head at the pivot, on the wall) and the empty hole
  // of the second screw stays on the wall where the plate's top-right corner was (an ink ring): a plate that dropped
  const dropped = old && t >= flipAt + 0.1;
  const hole: Pt = [p.x + dir * 38 * s, p.y - 38 * s];
  return (
    <>
      {dropped ? <Ink d={circle(hole[0], hole[1], 2.3, {seed: `${seed}/hole`})} width={1.5} taper={false} vary={0} seed={`${seed}/hole`} /> : null}
      <XG m={mat.compose(mat.translate(0, hop), mat.about(mat.rotate(rot), pivot[0], pivot[1]))}>
      <XG m={mat.compose(mat.translate(p.x, p.y), mat.scale(s * sx * pk, s * pk))}>{plateFace({old, W: FAR_INK / s, seed, offset: [3, 2.2], screws: !old, oldFill: thunk ? palette.ink : undefined})}</XG>
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
  // A1 FR2: 0.04 s apart (storyboard), reading order P0, A, B, C, D, E
  PLATED.forEach((b, k) => flips.set(b.i, flipAt + FLIP_STEP * k));
  // the wave runs over every far plate in reading order: tags on the current, shudders on the old (the skip, seen)
  const wave = new Map<number, number>();
  PLATED.forEach((b, k) => wave.set(b.i, tagsAt + 0.06 * k));
  const last = SECOND.length - 1;
  const winOn = t >= popAt + STAGGER * last + 0.18;
  return (
    <>
      {SECOND.map((b) => {
        const pa = popAt + STAGGER * b.i;
        const r = G.roofs[b.i];
        const fa = flips.get(b.i);
        const wa = wave.get(b.i);
        // Wrap FR1: an old building ages on its plate's landing frame (the 1-frame dark pop)
        const aged = !!b.plate?.old && fa !== undefined && t >= fa + 0.2;
        const color = aged ? mix(b.color, palette.brown, AGE_WASH) : b.color;
        return (
          <PopUp key={b.i} at={pa} x={b.cx} y={EYE}>
            {r.fill ? <Fill d={r.fill} color={color} offset={false} seed={`s10s/rf${b.i}`} /> : null}
            <Fill rect={[b.x, b.top, b.w + 2, EYE - b.top]} color={color} seed={`s10s/b${b.i}`} />
            {r.dark ? <Fill d={r.dark} color={palette.tan} offset={false} mode="snap" seed={`s10s/rd${b.i}`} /> : null}
            <Ink d={r.ink} width={SI.far} taper={false} seed={`s10s/i${b.i}`} />
            {/* window dots (half density); they arrive with the last pop-ups */}
            {winOn ? (
              aged ? (
                <Fill d={G.ticks[b.i]} color={palette.ink} offset={false} mode="snap" seed={`s10s/tk${b.i}`} />
              ) : (
                <Fill d={G.win[b.i]} color={b.color === palette.sage ? palette.mintPale : palette.tealDark} offset={false} mode="snap" seed={`s10s/win${b.i}`} />
              )
            ) : null}
            {b.plate && fa !== undefined ? (
              <FarPlate p={b.plate} flipAt={fa} sagAt={dropAt + 0.05 * PLATED.indexOf(b)} shudderAt={b.plate.old ? wa : undefined} tagAt={b.plate.old ? undefined : wa} seed={`s10s/p${b.i}`} />
            ) : null}
          </PopUp>
        );
      })}
      {/* A1 FR2: on 'of' three far windows light in a 0.04 s cascade (b0, A, E: all on visible wall; the single window
          lit before sat behind the gap house and nothing marked the word) */}
      {LIT.map(([x, y], k) => (t >= windowAt + 0.04 * k ? <Fill key={`lit${k}`} rect={[x - 1, y - 1, 9, 13]} color={palette.peach} offset={false} mode="snap" seed={`s10s/lit${k}`} /> : null))}
      {/* gap doors: the OLD gabled house's door already carries a host's own sage tag on its handle (a pauser detail) */}
      {G.doors.map((d, k) =>
        t >= popAt + STAGGER * d.i + 0.1 ? (
          <React.Fragment key={k}>
            <Fill d={rectPath(d.x, d.y, d.w, d.h)} color={palette.teal} offset={false} mode="snap" seed={`s10s/d${k}`} />
            <Ink d={rect(d.x, d.y, d.w, d.h, {seed: `s10s/di${k}`, over: 1, edges: 'tlr'})} width={SI.hair} taper={false} seed={`s10s/di${k}`} />
            <Fill d={blob(d.x + d.w - 4, d.y + d.h * 0.55, 1.6, 1.6, {seed: `s10s/h${k}`})} color={palette.cream} offset={false} mode="none" seed={`s10s/h${k}`} />
          </React.Fragment>
        ) : null,
      )}
      {t >= popAt + STAGGER * G.doors[0].i + 0.1
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
      {PLATED.map((b) => (b.plate!.old ? <Puff key={`pf${b.i}`} x={b.plate!.x} y={b.plate!.y} at={flips.get(b.i)! + 0.1} r={39} speck={5.4} seed={`s10s/pf${b.i}`} /> : null))}
    </>
  );
};
