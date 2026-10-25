// S05 overlays ON the shared BlueprintWall (drawn inside its layers through Scene05's `wrap`): the paper tone and the
// colour accents of the plan (fix round 2: a flat mintPale paper under the plan's ink, the callout a white spot round
// the lock), the 'found' ring, the thumb-turn and bolt the dashed hand turns, the door's right leaf swinging ajar on
// 'bad', the flight of steps re-drawn as treads / risers and the plaza in front of them. World px, scene seconds.
//
// Banner layer order (Scene05.tsx): set banner -> SheetTint (mintPale field) -> scan beams (opaque white) -> SheetPanels
// (cream) -> the set's ink again (`<Look fills="none">`) -> DoorSwing -> SheetLock (white callout, lock box, section,
// lock ink) -> labels, hand, Bit, Pip. Every pixel is a palette colour (no translucency stacking).
import React, {useId} from 'react';
import {palette} from '../../lib/theme';
import {clamp, ease as E, lerp, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {Look} from '../../lib/exit';
import {blob, line, polyPath, rect, rectPath, roundRect, smooth, Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {BLUEPRINT_WALL, SI} from '../shared/sets';
import {Lock, LOCK, lockPoint} from '../shared/props';

const L = BLUEPRINT_WALL.lock;
export const LOCK_C: Pt = [L.x, L.y];
/** Lock-local point (100-unit design box) -> world. */
export const lp = (x: number, y: number): Pt => lockPoint(L.x, L.y, L.h, [x, y]);
/** The thumb-turn the dashed hand pinches: on the box's top edge. World. */
export const KNOB: Pt = lp(4, -43);

// ---------------------------------------------------------------- the paper and its colour

// the set's geometry (BlueprintWall.tsx G): door elevation 330..646 x 796..1190, its opening (door2) 352..624 x
// 818..1168 with the centre mullion at x 488 (the lock straddles it), panels 98 wide
const DT = BLUEPRINT_WALL.topMargin[3] + 6; // 796: the door elevation's head
const [BX, BY, BW, BH] = BLUEPRINT_WALL.sheet;
const PANEL_UL: [number, number, number, number] = [370, DT + 36, 98, 894 - DT - 36];
const PANEL_LR: [number, number, number, number] = [508, 1040, 98, 110];
const PANEL_UR: [number, number, number, number] = [508, DT + 36, 98, 894 - DT - 36];
const TITLE: [number, number, number, number] = [BX + 26, BY + BH - 96, 176, 70];
/** The sheet's inner field (inside the 12 px teal frame). */
export const SHEET_IN: [number, number, number, number] = [BX + 12, BY + 12, BW - 24, BH - 24];
/** The paper tone (fix round 2: was the set's #FFF, the brightest area in the frame). */
export const PAPER = palette.mintPale;
const ST = BLUEPRINT_WALL.stamp;

/** The paper tone over the sheet's field, with a hole for the corner stamp (its white disc + ring stay the set's). The
 *  set's ink is re-stroked over it (Scene05: `<Look fills="none">`). */
export const SheetTint: React.FC = () => {
  const r = ST.r + 5;
  const hole = `M${ST.x - r} ${ST.y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  return <Fill d={rectPath(...SHEET_IN) + hole} rule="evenodd" color={PAPER} offset={false} mode="none" seed="s5paper" />;
};

/** Cream on two door panels and the title block (misregistered, under the re-stroked ink). */
export const SheetPanels: React.FC = () => (
  <>
    <Fill rect={PANEL_UL} color={palette.cream} seed="s5pnUL" />
    <Fill rect={PANEL_LR} color={palette.cream} seed="s5pnLR" />
    <Fill rect={TITLE} color={palette.cream} seed="s5title" />
  </>
);

/** The callout: a WHITE disc inside the set's r64 callout ring (the brightest spot on the plan), the lock box white
 *  with S02's section one step stronger, the lock's ink redrawn on top. */
const DISC = blob(L.x, L.y, 58, 57, {seed: 's5disc'});
const BOX_D = roundRect(LOCK.box[0], LOCK.box[1], LOCK.box[2], LOCK.box[3], 9);
const SECTION_D = rectPath(LOCK.cover[0], LOCK.cover[1], LOCK.cover[2], LOCK.cover[3]);
/** The section colour inside the lock box. */
export const SECTION = palette.bg;
const LOCK_M = mat.compose(mat.translate(L.x, L.y), mat.scale(L.h / LOCK.h));

/** A1 polish: the callout disc OPENS in S04's peach (its lock spot, same place and radius on the matchcut: the same lock,
 *  now drawn on the plan) and steps to white with a 1-frame fill pop (x 1.06) on Bit's hop into the socket. */
export const SheetLock: React.FC<{whiteAt?: number}> = ({whiteAt = 0}) => {
  const t = useTime();
  const white = t >= whiteAt;
  const pop = white && t < whiteAt + 1 / 30 ? 1.06 : 1;
  return (
  <>
    <XG m={pop !== 1 ? mat.about(mat.scale(pop), L.x, L.y) : mat.I}>
      <Fill d={DISC} color={white ? palette.white : palette.peach} seed="s5disc" />
    </XG>
    <XG m={LOCK_M}>
      <Fill d={BOX_D} color={palette.white} offset={false} seed="s5box" />
      <Fill d={SECTION_D} color={SECTION} seed="s5sect" />
    </XG>
    {/* the set's lock (same props), ink only, over the new fills */}
    <Look fills="none">
      <Lock x={L.x} y={L.y} size={L.h} state="blueprint" seed="bpw/lock" ink={SI.mid} />
    </Look>
  </>
  );
};

// ---------------------------------------------------------------- the door swings ajar ('bad')

/** The opening's right half (the right leaf, hinged on the right jamb x 624) and the swing. */
const LEAF = {x0: 488, x1: 624, y0: 818, y1: 1168};
const SWING = {narrow: 0.76, grow: 9, dur: 0.2};
/** Swing amount at t: 0 (shut) .. 1 (ajar), a 0.2 s out-back (the leaf knocks open a touch past and settles). */
export const swingAt = (t: number, at: number) => (t < at ? 0 : E.outBack(1.6)(prog(t, at, SWING.dur)));

/** The leaf's map at swing q: x narrows toward the hinge, the free edge grows taller (it comes toward us). */
function leafMap(q: number) {
  const k = 1 - (1 - SWING.narrow) * q;
  const d = SWING.grow * q;
  const yc = (LEAF.y0 + LEAF.y1) / 2;
  const hy = (LEAF.y1 - LEAF.y0) / 2;
  return (x: number, y: number): Pt => {
    const u = (LEAF.x1 - x) / (LEAF.x1 - LEAF.x0);
    return [LEAF.x1 - (LEAF.x1 - x) * k, y + ((y - yc) / hy) * d * u];
  };
}
const quad = (m: (x: number, y: number) => Pt, r: [number, number, number, number]): Pt[] => [m(r[0], r[1]), m(r[0] + r[2], r[1]), m(r[0] + r[2], r[1] + r[3]), m(r[0], r[1] + r[3])];
const quadInk = (P: Pt[], seed: string) => P.map((p, i) => line(p[0], p[1], P[(i + 1) % 4][0], P[(i + 1) % 4][1], {seed: `${seed}${i}`, over: 3})).join('');

/** 'bad', after the bolt clears: the plan's right door leaf swings ajar (narrowed, its free edge taller) and the
 *  opening behind it shows as ONE flat tealDark gap (~33 world = 37 px on screen) from the mullion to the free edge,
 *  above and below the callout. It stays open. */
export const DoorSwing: React.FC<{at: number}> = ({at}) => {
  const t = useTime();
  const q = swingAt(t, at);
  if (q <= 0) return null;
  const m = leafMap(q);
  const leaf: [number, number, number, number] = [LEAF.x0, LEAF.y0, LEAF.x1 - LEAF.x0, LEAF.y1 - LEAF.y0];
  const P = quad(m, leaf);
  const ur = quad(m, PANEL_UR);
  const lr = quad(m, PANEL_LR);
  return (
    <>
      {/* the dark opening (inside the frame lines: the lintel, sill and right jamb stay the set's) */}
      <Fill d={rectPath(LEAF.x0 + 1.6, LEAF.y0 + 1.6, LEAF.x1 - LEAF.x0 - 3.6, LEAF.y1 - LEAF.y0 - 3.2)} color={palette.tealDark} offset={false} mode="none" seed="s5gap" />
      {/* the leaf, swung toward us */}
      <Fill d={polyPath(P)} color={PAPER} offset={false} mode="none" seed="s5leafF" />
      <Fill d={polyPath(lr)} color={palette.cream} offset={false} mode="none" seed="s5leafP" />
      <Ink d={quadInk(P, 's5lf')} width={SI.far} taper={false} seed="s5leafI" />
      <Ink d={quadInk(ur, 's5ur') + quadInk(lr, 's5lr')} width={SI.far} taper={false} seed="s5leafJ" />
    </>
  );
};

// ---------------------------------------------------------------- the 'found' ring

/** One open hand-circling pen stroke round the lock (well outside the set's r64 callout): it starts upper left, runs
 *  clockwise and overshoots its start by 25 deg, spiralling out ~7 % so the tail passes OUTSIDE the start. */
function ringPath(x: number, y: number, r: number): string {
  const a0 = (200 * Math.PI) / 180;
  const sweep = ((360 + 25) * Math.PI) / 180;
  const rot = (-10 * Math.PI) / 180;
  const n = 34;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = a0 + sweep * u;
    const f = 1 + 0.07 * u + 0.018 * Math.sin(3 * a + 1.3);
    const ex = Math.cos(a) * r * 1.05 * f;
    const ey = Math.sin(a) * r * 0.95 * f;
    pts.push([x + ex * Math.cos(rot) - ey * Math.sin(rot), y + ex * Math.sin(rot) + ey * Math.cos(rot)]);
  }
  return smooth(pts);
}

/** The 'found' mark: strokes on in 0.17 s at `at` ('out'-0.06), one quick 0.15 s scale pulse at `pulseAt` ('how'). */
export const FoundRing: React.FC<{x: number; y: number; r: number; at: number; pulseAt: number; width?: number; color?: string}> = ({x, y, r, at, pulseAt, width = 4.8, color = palette.ink}) => {
  const t = useTime();
  if (t < at) return null;
  const k = 1 + 0.12 * Math.sin(Math.PI * clamp((t - pulseAt) / 0.15));
  return (
    <XG m={mat.about(mat.scale(k), x, y)}>
      <Ink d={ringPath(x, y, r)} at={at} dur={0.17} pace="free" width={width} color={color} seed="s5ring" />
    </XG>
  );
};

// ---------------------------------------------------------------- the thumb-turn and the bolt

/** The bolt's travel (lock units): from the flaw's short stop (9, a 9-unit gap from the socket) all the way back THROUGH
 *  the guide (-27): 36 units = 27 world = 31 px on screen; the cavity from the guide to the socket is left empty (39
 *  units) and the bar's tail shows left of the guide. */
const BOLT = {from: LOCK.tip.short, to: -27, len: 30};

/** The turn (s): fix round 4 0.22 -> 0.20 (the turn starts 0.05 s earlier and the door swings at 'bad'+0.12). */
export const TURN_DUR = 0.2;

/** The thumb-turn the dashed hand redraws and turns (90 deg, `dur`), and the bolt sliding all the way back with it:
 *  the lock opens with no key (S02's 'take over', recalled on 'bad'). Drawn over the lock. */
export const LockTurn: React.FC<{drawAt: number; turnAt: number; undrawAt: number; dur?: number}> = ({drawAt, turnAt, undrawAt, dur = TURN_DUR}) => {
  const t = useTime();
  const id = 'lt5' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (t < drawAt) return null;
  const q = E.inOutSine(prog(t, turnAt, dur));
  const k = L.h / 100; // world px per lock unit
  const W = 2.2;
  const [hx, , hw] = LOCK.housing;
  const hb = hx + hw; // -21: the guide's right edge
  const tip = lerp(BOLT.from, BOLT.to, q);
  const tail = tip - BOLT.len;
  const br = LOCK.boltR;
  const P = (x: number, y: number) => lp(x, y).map((v) => v.toFixed(1)).join(' ');
  // cover the set's short bar (right of the guide)
  const patch = `M${P(hb + 0.6, -br - 1.4)}L${P(10.6, -br - 1.4)}L${P(10.6, br + 1.4)}L${P(hb + 0.6, br + 1.4)}Z`;
  // the bar right of the guide (bevelled tip) while the tip is out
  const bev = 2;
  const barR = tip > hb + 0.5 ? `M${P(hb, -br)}L${P(tip - bev, -br)}L${P(tip, -br + bev)}L${P(tip, br - bev)}L${P(tip - bev, br)}L${P(hb, br)}` : '';
  // its tail left of the guide (x < -28), clipped at the box's inner edge (-38)
  const tx0 = Math.max(tail, -38);
  const barL = tail < hx - 0.5 ? `M${P(hx, -br)}L${P(tx0, -br)}L${P(tx0, br)}L${P(hx, br)}` : '';
  const knobR = 7 * k;
  const knobOn = t < undrawAt + 0.12;
  const rot = 90 * q;
  const [x0, y0] = lp(-40, -br - 2);
  const [x1, y1] = lp(-21, br + 2);
  return (
    <>
      {q > 0 ? (
        <>
          <path d={patch} fill={SECTION} />
          {barL ? (
            <>
              <defs>
                <clipPath id={id} clipPathUnits="userSpaceOnUse">
                  <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} />
                </clipPath>
              </defs>
              <g clipPath={`url(#${id})`}>
                <path d={barL + 'Z'} fill={palette.white} />
              </g>
            </>
          ) : null}
          <Ink d={barR + barL} width={W} taper={false} vary={0} seed="s5bolt" />
        </>
      ) : null}
      {knobOn ? (
        <XG m={mat.compose(mat.translate(KNOB[0], KNOB[1]), mat.rotate(rot))}>
          <path d={`M${-knobR} 0a${knobR} ${knobR} 0 1 0 ${2 * knobR} 0a${knobR} ${knobR} 0 1 0 ${-2 * knobR} 0Z`} fill={palette.white} />
          <Ink d={`M${-knobR} 0a${knobR} ${knobR} 0 1 0 ${2 * knobR} 0a${knobR} ${knobR} 0 1 0 ${-2 * knobR} 0` + `M${-knobR * 1.5} 0H${knobR * 1.5}`} at={drawAt + 0.04} dur={0.12} width={W} taper={false} vary={0} seed="s5knob" />
        </XG>
      ) : null}
    </>
  );
};

/** The hand's turn (deg) about its pinch point: 12 deg over TURN_DUR in-out sine (the sleeve's break end, ~250 world
 *  out, peaks at ~15.5 px/frame). */
export const handTurn = (t: number, at: number, deg = 12, dur = TURN_DUR) => deg * E.inOutSine(prog(t, at, dur));

// ---------------------------------------------------------------- the steps and the plaza

/** The flight re-drawn over the set's stripes (fix round 3: ACROSS THE FACADE ONLY, stopping at the corner pilaster):
 *  four steps (cream tread band + sand riser, ONE ink nosing line each) from the frame's left edge to the corner
 *  pilaster's base (x 846), a tan cheek block under the wing (cream coping, its face ink) where the flight stops; the
 *  deep bottom tread / landing the front row stands on (feet 1470) and its sand plinth riser run the full width (the
 *  pavement). The back row stands on the landing's back edge (feet 1446). The nosing lines are CUT where a figure's legs
 *  cross them (`gaps`, from the figure's pop): no hairline runs through a leg. */
export const STEPS = {y0: 1320, pitch: 30, n: 4, tread: 9, landing: [1440, 1474] as [number, number], plinth: 1488, x1: 846};
const X0 = -170;
const X1 = 1300;
/** A cut in the nosing lines: lines with y0 < y < y1 skip [x0, x1] while from <= t < to. */
export type StepGap = {x0: number; x1: number; y0: number; y1: number; from: number; to?: number};
const STEP_LINES: {y: number; x0: number; x1: number; seed: string; dy: number}[] = [
  ...Array.from({length: STEPS.n}, (_, i) => ({y: STEPS.y0 + i * STEPS.pitch, x0: X0, x1: STEPS.x1, seed: `s5st${i}`, dy: 1})),
  {y: STEPS.landing[0], x0: X0, x1: X1, seed: 's5stL', dy: 1.5},
  {y: STEPS.landing[1], x0: X0, x1: X1, seed: 's5stP', dy: 2},
];
const STEP_G = (() => {
  const x1 = STEPS.x1;
  let treads = rectPath(X0, STEPS.landing[0], X1 - X0, STEPS.landing[1] - STEPS.landing[0]);
  for (let i = 0; i < STEPS.n; i++) treads += rectPath(X0, STEPS.y0 + i * STEPS.pitch, x1 - X0, STEPS.tread);
  // the cheek block under the wing (the flight stops against it), its cream coping and face ink. Fix round 4 (it read
  // as a blank slab): a deeper cream coping that overhangs the block's left face, its lines OVERSHOOTING with open
  // corners (the reference's hand), a darker riser band along its foot (ochre, the plinth's shadow step) and two
  // clusters of short ink hatch ticks on the face (worn stone); no new focal element
  const y0 = STEPS.y0;
  const yF = STEPS.landing[0];
  const cheek = rectPath(x1, y0 - 2, X1 - x1, yF - y0 + 2);
  const coping = rectPath(x1 - 11, y0 - 6, X1 - x1 + 11, 15);
  const foot = rectPath(x1, yF - 9, X1 - x1, 9);
  const cheekInk =
    line(x1 - 19, y0 - 6, X1, y0 - 5, {seed: 's5chT', over: [0, 0]}) +
    line(x1 - 14, y0 + 9, X1, y0 + 10, {seed: 's5chC', over: [0, 0]}) +
    line(x1 - 11, y0 - 3, x1 - 10.5, y0 + 6.5, {seed: 's5chL', over: [0, 0]}) +
    line(x1, y0 + 13, x1 + 1, yF - 2, {seed: 's5chE', over: [0, 0]}) +
    line(x1 - 6, yF - 9, X1, yF - 8, {seed: 's5chF', over: [0, 0]});
  const tick = (x: number, y: number, n: number) => Array.from({length: n}, (_, i) => `M${x + i * 7} ${y + i * 1.5}l-7 9`).join('');
  const hatch = tick(884, 1346, 3) + tick(966, 1392, 2) + tick(912, 1404, 2);
  // A1 polish: a small civic plaque on the block's face (an ochre plate, two screw dots, two cream 'lettering' lines:
  // illegible on purpose, the block sits in the right rail at screen x > 950)
  const plaque = roundRect(918, 1336, 44, 26, 3);
  const plaqueLines = 'M926 1345.5H954M929 1353H950';
  const screws = 'M921.5 1340.2a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0ZM955.3 1340.2a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z';
  return {base: rectPath(X0, y0 - 2, X1 - X0, STEPS.plinth - y0 + 2), treads, cheek, coping, foot, cheekInk, hatch, plaque, plaqueLines, screws};
})();

/** The nosing lines with the gaps open at t (segments between the cuts; each line keeps its own seed). */
function stepInk(t: number, gaps: StepGap[]): string {
  let d = '';
  for (const L of STEP_LINES) {
    const cuts = gaps
      .filter((g) => t >= g.from && (g.to === undefined || t < g.to) && L.y > g.y0 && L.y < g.y1)
      .map((g) => [Math.max(L.x0, g.x0), Math.min(L.x1, g.x1)] as [number, number])
      .filter(([a, c]) => c > a)
      .sort((p, q) => p[0] - q[0]);
    let x = L.x0;
    const segs: [number, number][] = [];
    for (const [a, c] of cuts) {
      if (a > x + 4) segs.push([x, a]);
      x = Math.max(x, c);
    }
    if (L.x1 > x + 4) segs.push([x, L.x1]);
    const span = L.x1 - L.x0;
    segs.forEach(([a, c], i) => {
      const ya = L.y + (L.dy * (a - L.x0)) / span;
      const yc = L.y + (L.dy * (c - L.x0)) / span;
      d += line(a, ya, c, yc, {seed: `${L.seed}/${i}`, over: [0, 0]});
    });
  }
  return d;
}

export const StepsOverlay: React.FC<{gaps?: StepGap[]}> = ({gaps = []}) => {
  const t = useTime();
  return (
    <>
      <Fill d={STEP_G.base} color={palette.sand} offset={false} seed="s5stB" />
      <Fill d={STEP_G.treads} color={palette.cream} seed="s5stT" />
      <Fill d={STEP_G.cheek} color={palette.tan} offset={false} mode="none" seed="s5chk" />
      <Fill d={STEP_G.coping} color={palette.cream} offset={false} mode="none" seed="s5cop" />
      <Fill d={STEP_G.foot} color={palette.brown} offset={false} mode="none" seed="s5chFt" />
      <Ink d={stepInk(t, gaps)} width={SI.mid} seed="s5stI" />
      <Ink d={STEP_G.cheekInk} width={SI.mid} seed="s5chI" />
      <Ink d={STEP_G.hatch} width={SI.hair} taper={false} seed="s5chH" />
      <Fill d={STEP_G.plaque} color={palette.brown} offset={[1.5, 1]} seed="s5plq" />
      <Ink d={STEP_G.plaque} width={SI.far} taper={false} seed="s5plqI" />
      <Ink d={STEP_G.plaqueLines} width={2} color={palette.cream} taper={false} vary={0} seed="s5plqL" />
      <Fill d={STEP_G.screws} color={palette.ink} offset={false} mode="none" seed="s5plqS" />
    </>
  );
};

// ---------------------------------------------------------------- the wing's small details (A1 polish)

/** Pause-worthy detail on the wing's flat wall (wing layer, parallax 0.4; drawn over the set's wing): a drainpipe down
 *  its left corner (a hopper head under the roof coping, three bracket ticks, a shoe kicking out at the foot), a potted
 *  plant on the upper window's sill and an AC unit hung under the lower window's sill. No lettering (right rail). */
const WING_D = (() => {
  const px = 862;
  const pw = 9;
  const top = 868;
  const foot = 1300;
  const pipe = rectPath(px, top, pw, foot - top) + `M${px} ${foot}Q${px} ${foot + 12} ${px + 16} ${foot + 12}L${px + 16} ${foot + 3}Q${px + pw} ${foot + 3} ${px + pw} ${foot}Z`;
  const hopper = `M${px - 6} 856L${px + pw + 6} 856L${px + pw + 1} ${top + 2}L${px - 1} ${top + 2}Z`;
  const pipeInk =
    line(px, top + 2, px, foot, {seed: 's5dpL', over: [0, 0]}) +
    line(px + pw, top + 2, px + pw, foot - 2, {seed: 's5dpR', over: [0, 0]}) +
    `M${px} ${foot}Q${px} ${foot + 12} ${px + 16} ${foot + 12}M${px + pw} ${foot - 2}Q${px + pw} ${foot + 3} ${px + 16} ${foot + 3}` +
    hopper +
    [960, 1080, 1200].map((y) => `M${px - 3} ${y}H${px + pw + 3}`).join('');
  // the plant: an ochre pot on the sill of the window at (900, 920) (sill line y 1010), three sage leaf blobs
  const pot = `M906 994L930 994L927 1011L909 1011Z`;
  const leaves = blob(913, 985, 9, 7, {seed: 's5pl1'}) + blob(925, 983, 8, 8, {seed: 's5pl2'}) + blob(919, 976, 7, 8, {seed: 's5pl3'});
  // the AC unit under the window at (900, 1100) (sill line y 1190): a cream box, its grille, two bracket ticks
  const ac = roundRect(910, 1197, 42, 26, 2.5);
  const acInk = 'M916 1204H946M916 1210H946M916 1216H946' + 'M914 1223L918 1230M948 1223L944 1230';
  return {pipe, hopper, pipeInk, pot, leaves, ac, acInk};
})();

export const WingDetails: React.FC = () => (
  <>
    <Fill d={WING_D.pipe + WING_D.hopper} color={palette.teal} offset={false} mode="none" seed="s5dp" />
    <Ink d={WING_D.pipeInk} width={SI.far} taper={false} seed="s5dpI" />
    <Fill d={WING_D.leaves} color={palette.sage} offset={false} mode="none" seed="s5plF" />
    <Fill d={WING_D.pot} color={palette.brown} offset={false} mode="none" seed="s5potF" />
    <Ink d={WING_D.leaves + WING_D.pot} width={SI.far} taper={false} seed="s5plI" />
    <Fill d={WING_D.ac} color={palette.cream} offset={[1, 1]} seed="s5acF" />
    <Ink d={WING_D.ac} width={SI.far} taper={false} seed="s5acI" />
    <Ink d={WING_D.acInk} width={SI.hair} taper={false} vary={0} seed="s5acG" />
  </>
);

/** The forecourt in front of the steps (fix round 2): ONE flat mintPale field (the set's broken paving hairlines read as
 *  scratches: covered) and one flat sand shade wedge cast by the facade, a diagonal from the steps' left end down
 *  across the audience's aisle. No ink. */
const PLAZA = {top: STEPS.plinth, wedge: [[-300, STEPS.plinth], [720, STEPS.plinth], [130, 1830], [-300, 1830]] as Pt[]};
export const PlazaGround: React.FC = () => (
  <>
    <Fill d={rectPath(-400, PLAZA.top, 1900, 520)} color={palette.mintPale} offset={false} mode="none" seed="s5plaza" />
    <Fill d={polyPath(PLAZA.wedge)} color={palette.sand} offset={false} mode="none" seed="s5wedge" />
  </>
);

// ---------------------------------------------------------------- the keyhole glyph (fix round 3)

/** A solid ink keyhole in the callout's white margin, left of the lock box (lock units: x -58, the box edge is -40,
 *  the white disc ~-77), 1.25 x the Lock's own keyhole: the callout now reads 'LOCK', not 'another tablet'. */
const KEYHOLE = 'M0 -13a7 7 0 1 0 0.01 0Z' + 'M-3.4 -2L-5.5 13H5.5L3.4 -2Z';
export const CalloutKeyhole: React.FC = () => {
  const [kx, ky] = lp(-58, 2);
  const k = (L.h / 100) * 1.25;
  return (
    <XG m={mat.compose(mat.translate(kx, ky), mat.scale(k))}>
      <Fill d={KEYHOLE} color={palette.ink} offset={false} mode="none" seed="s5kh" />
    </XG>
  );
};

// ---------------------------------------------------------------- the cornice's underside (fix round 3)

/** The cornice seen from below (the low angle's tell): the set's flat tan band (world 610-650) becomes a tan fascia
 *  (610-622), a tealDark soffit strip (622-633) and a dentil row (633-648: cream blocks on tealDark), re-inked. Screen
 *  ~587-632 at the 1.13 lock. Facade layer (parallax 0.67). */
const CORN = {x0: -180, x1: 819.6, top: BLUEPRINT_WALL.facade.corn[0], fascia: 622, soffit: 633, bot: BLUEPRINT_WALL.facade.corn[1] - 2};
const CORNICE_G = (() => {
  const {x0, x1, fascia, soffit, bot, top} = CORN;
  let blocks = '';
  let blockInk = '';
  for (let x = x0 + 6; x + 15 < x1; x += 27) {
    blocks += rectPath(x, soffit, 15, bot - soffit);
    blockInk += `M${x.toFixed(1)} ${soffit}V${bot}M${(x + 15).toFixed(1)} ${soffit}V${bot}`;
  }
  const ink =
    line(x0, top, x1 + 6, top, {seed: 's5cnT', over: [0, 3]}) +
    line(x0, fascia, x1 + 4, fascia, {seed: 's5cnF', over: [0, 2]}) +
    line(x0, soffit, x1 + 2, soffit, {seed: 's5cnS', over: [0, 1]}) +
    line(x0, bot + 1, x1, bot + 1, {seed: 's5cnB', over: [0, 1]}) +
    line(x1, top, x1, bot + 1, {seed: 's5cnE', over: [1, 1]});
  return {fascia: rectPath(x0, top, x1 - x0, fascia - top), soffit: rectPath(x0, fascia, x1 - x0, bot + 1 - fascia), blocks, ink, blockInk};
})();
export const CorniceSoffit: React.FC = () => (
  <>
    <Fill d={CORNICE_G.fascia} color={palette.tan} offset={false} mode="none" seed="s5cnf" />
    <Fill d={CORNICE_G.soffit} color={palette.tealDark} offset={false} mode="none" seed="s5cns" />
    <Fill d={CORNICE_G.blocks} color={palette.cream} offset={false} mode="none" seed="s5cnb" />
    <Ink d={CORNICE_G.ink} width={SI.mid} seed="s5cnI" />
    <Ink d={CORNICE_G.blockInk} width={SI.hair} taper={false} vary={0} seed="s5cnbI" />
  </>
);
