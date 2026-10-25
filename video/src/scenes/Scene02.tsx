// S02 "The takeover diagram" (storyboard v3, cut(purpose) -> cut(password), 4.715-8.393 s on the take).
// VO: "because of this bug where hackers could take over a site without a password."
// The 'inset': a tight look at the PHP master blueprint (BlueprintWall + a local ink grid, drawing outward from the
// lock). The lock detail lands exactly where S01's dive left govB's lock box (screen (560, 1150), ~70 x 86 px at the
// cut) and the blueprint's own DETAIL CIRCLE round it swells into a loupe (x2.8) that CARRIES THE DIVE ON: from the cut
// the lock's on-screen log-zoom (camera landing + loupe) follows one out(cubic) curve that starts at S01's exit rate
// (~6.2/s) and decays monotonically. In the loupe the cover swings open, the bolt slams to a stop SHORT, the gap floods
// peach and Bit peeks out of the socket; a dashed hooded hand turns the thumb-turn with no key and a tiny schematic
// site is taken over (window goes dark, big flag, ring); a key is erased into the paper and crossed out. Labels L1
// (static title-block card) and L2 (curved leader). Three white back-view onlookers in the bottom band.
// Camera, beats, positions: docs/storyboard_v3.md S02 + docs/storyboard_v3_resolved.json; notes: docs/scenes/S02.md.
import React, {useId} from 'react';
import {World, Sun, XG, Ink, Fill, useTime, useScene, palette, prog, lerp, clamp, ease as E, mat, circle} from '../lib';
import {ElephantTimeline, hop} from '../lib/mascot';
import {BlueprintWall, BLUEPRINT_WALL} from './shared/sets';
import {LabelTag, DiagramHand, KeyCross, dashPath, pointAlong} from './shared/props';
import {camAt, camMat, LAND} from './scene02/camera';
import {B, LAST_FRAME_ABS, S02_END, S02_START, W, local} from './scene02/beats';
import {DiagramLock, THUMB} from './scene02/DiagramLock';
import {TakenSite} from './scene02/TakenSite';
import {PlanGrid, GRID_TINT} from './scene02/PlanGrid';
import {Onlookers} from './scene02/Onlookers';
import type {Pt} from '../lib/sketch';

const DUR = S02_END - S02_START;
const L = BLUEPRINT_WALL.lock;
const LOCK_SIZE = L.h; // 75: 60 x 75 world, 69 x 86 px on screen at the 1.15 landing (the S01 match)
const C: Pt = [L.x, L.y];
// the detail loupe: the blueprint's callout circle (r 64) swells to r 140 and magnifies the lock x2.8 about its centre
// (lock 168 x 210 world = 225 x 281 px at zoom 1.34; its rounded box reaches r ~127, inside the ring). ink1 keeps the
// magnified box pen at ~5 px on screen (1.36 x 2.8 x 1.34).
const LOUPE = {r0: 64, r1: 140, m: 2.8, dur: 0.56, ink0: 3.4, ink1: 1.36};
const LN_M = Math.log(LOUPE.m);
/** The camera landing's log-zoom since the cut (camera.ts: out(quad) over LAND). */
const zLand = (t: number) => Math.log(camAt(Math.min(Math.max(t, 0), LAND), DUR).zoom / camAt(0, DUR).zoom);
const DZ = zLand(LAND);
/** Loupe swell 0..1 at scene time t: camera landing + loupe together follow ONE out(cubic) log-zoom curve from the cut,
 *  so the lock's on-screen zoom rate starts at S01's dive exit rate (3 (DZ + ln m) / dur = ~6.3/s) and decays
 *  monotonically to the creep (no stall, no re-kick). k = 0 at t = 0: the match frame is unchanged. */
const loupeK = (t: number) => (t <= 0 ? 0 : clamp(((DZ + LN_M) * E.outCubic(prog(t, 0, LOUPE.dur)) - zLand(t)) / LN_M));
const loupeAt = (t: number) => {
  const k = loupeK(t);
  return {k, m: Math.exp(k * LN_M), r: LOUPE.r0 * Math.pow(LOUPE.r1 / LOUPE.r0, k), ink: LOUPE.ink0 * Math.pow(LOUPE.ink1 / LOUPE.ink0, k)};
};
// the thumb-turn knob in the fully magnified view (world)
const KNOB: Pt = [C[0] + THUMB[0] * (LOCK_SIZE / 100) * LOUPE.m, C[1] + THUMB[1] * (LOCK_SIZE / 100) * LOUPE.m];
// the site icon sits 30 px higher than the storyboard box (640-760 x 1090-1210) so it clears the sheet's elephant stamp
const ICON: [number, number, number, number] = [640, 1060, 120, 120];
const ICON_C: Pt = [ICON[0] + ICON[2] / 2, ICON[1] + ICON[3] * 0.55];
// dashed connector: out of the loupe's right edge at the bolt axis, along, then down onto the icon's roof
const CONNECTOR: Pt[] = [
  [C[0] + Math.sqrt(LOUPE.r1 ** 2 - 14 ** 2) + 3, C[1] + 14],
  [ICON[0] + 60, C[1] + 14],
  [ICON[0] + 60, ICON[1] - 2],
];
// L2: lower left, 14 world under the loupe's bottom (1100) and 12 above the door-width dimension line (1214); its left
// edge 20 world (~27 px) inside the sheet's inner frame (212), never tangent to it
const L2_BOX: [number, number, number, number] = [232, 1114, 596, 1202];
// its leader: a curved ink line from the card's right edge to a dot on the icon's left wall (~80 px on screen), drawn
// over a white paper halo that breaks the door-elevation lines it crosses (the drafting convention, no '+' crossings)
const LEADER = `M${L2_BOX[2] + 2} 1170C624 1172 642 1154 ${ICON[0] + 14} 1146`;
const LEADER_DOT: Pt = [ICON[0] + 14, 1146];
// the sheet's inner rect (inside the teal frame): the diagram hand is DRAWN ON the plan, so it is clipped to it
const [SX, SY, SW, SH] = BLUEPRINT_WALL.sheet;
const SHEET_IN: [number, number, number, number] = [SX + 12, SY + 12, SW - 24, SH - 24];
// the plan grid (a pale blueprint tint, PlanGrid.tsx): below the clean top margin, inside the frame; no segment within
// 150 of the lock, thinning out to 300 (the loupe's surround stays clean paper)
const GRID_AREA: [number, number, number, number] = [SX + 12, BLUEPRINT_WALL.topMargin[3] + 4, SX + SW - 12, SY + SH - 12];
// the grid keeps off the sheet's elephant stamp badge and its title block (both printed on the plan)
const ST = BLUEPRINT_WALL.stamp;
const GRID_HOLES = [{c: [ST.x, ST.y, ST.r + 14] as [number, number, number]}, {r: [SX + 18, SY + SH - 106, SX + 212, SY + SH - 16] as [number, number, number, number]}];
// the crossed-out key: up-left of the loupe, clear of its ring, the L1 card and the hand, on a patch rubbed clean
const KEY: Pt = [292, 826];
// the eraser's path over the key's patch (three rubs, a thick paper-white stroke): its round caps stay >= 24 world inside
// the sheet's inner edge (212), and it is clipped to the sheet (OnSheet), so it never notches the frame
const ERASE = `M256 798L352 804L258 826L354 832L260 854L350 858`;
// the connector: heavier than the grid (3.6 world, ~4.8 px), long dashes, on a solid paper-white halo that breaks the
// grid and plan lines it crosses (the same convention as L2's leader), so 'this lock guards that site' reads unmistakably
const CON = {w: 3.6, dash: 14, gap: 8, halo: 10};
// Pip sits 14 world right of the set's perch (700, 680) on the same rod (fix round 2): the sun now drifts into S03's
// slot (690, 700), and at the perch his ears-cover ear was tangent to its right edge; this leaves a clear ~20 px gap
const PIP_PERCH: Pt = [BLUEPRINT_WALL.perch[0] + 14, BLUEPRINT_WALL.perch[1]];
const PIP_SCALE = 1.2 / 1.3; // 1.2 on screen at the 1.30 landing (~115 px)
// the diagram hand. Exit (fix round 2): 300 world (the fingertips clear the sheet's right edge at ~280 incl. the let-go)
// in 0.34 s in(cubic) from end(password)-0.15: on screen 0.5, 3, 8, 15, 24, 36, 50, 66, 84 px per frame, a pull-away
// visible over ~9 frames, gone before the last S02 frame (was 380 in 0.18 s in-out: a 2-frame vanish)
const HAND = {angle: -40, turn: 18, scale: 1.2, from: 430, exitTravel: 300, exitDur: 0.34, ink: 3.2, dash: [6, 5] as [number, number]};
const PINCH: Pt = [KNOB[0], KNOB[1] - 3];
// solid ink contact strokes on the index and thumb tips (DiagramHand local units: fingertips at the origin)
const TIPS = 'M4.5 -10.6C0.4 -9.6 -1.6 -6 1.6 -2.8' + 'M6.2 9.2C1.6 8.2 -1.2 4.8 2.6 1.8';

const lockNode = (ink: number, knobOnly = false) => (
  <DiagramLock
    x={C[0]}
    y={C[1]}
    size={LOCK_SIZE}
    ink={ink}
    coverOpenAt={B.coverOpen}
    boltTestAt={B.boltTest}
    gapMarkAt={B.bug}
    turnAt={B.turn}
    knobOnly={knobOnly}
    bit={{size: 24, peekAt: B.bitPeek, cowerAt: B.could, hideAt: B.bitHide, popAt: B.bitPop}}
  />
);

const LoupeClip: React.FC<{r: number; m: number; children: React.ReactNode}> = ({r, m, children}) => {
  const uid = 'lp' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <>
      <defs>
        <clipPath id={`${uid}c`} clipPathUnits="userSpaceOnUse">
          <circle cx={C[0]} cy={C[1]} r={r - 1} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${uid}c)`}>
        <XG m={mat.about(mat.scale(m), C[0], C[1])}>{children}</XG>
      </g>
    </>
  );
};

/** The lock detail inside the swelling detail circle. Before the swell it is the plain 60 x 75 detail (the match). */
const Loupe: React.FC = () => {
  const t = useTime();
  const {r, m, ink} = loupeAt(t);
  // before the swell the ring is the blueprint's callout circle round the detail (r 64, ~74 px at the cut): it picks up
  // S01's ink ring round govB's lock box (~71 px) at the same spot, so the match carries the ring too
  const ring = circle(C[0], C[1], r, {seed: 's2loupe', overlap: 14});
  // the pen's re-stroke (style bible: doubled strokes): a short arc on the upper left, 2-6 px outside the ring and
  // ~1.5 deg off-parallel, drawn on as the swell settles
  let re = '';
  for (let i = 0; i <= 14; i++) {
    const u = i / 14;
    const a = ((196 + 52 * u) * Math.PI) / 180;
    const rr = r + lerp(1.6, 4.6, u);
    re += `${i ? 'L' : 'M'}${(C[0] + Math.cos(a) * rr).toFixed(1)} ${(C[1] + Math.sin(a) * rr).toFixed(1)}`;
  }
  return (
    <g>
      <Fill d={`M${C[0] - r} ${C[1]}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`} color={palette.white} offset={false} mode="none" seed="s2lpF" />
      <LoupeClip r={r} m={m}>
        {lockNode(ink)}
      </LoupeClip>
      <Ink d={ring} width={3.5} taper={false} vary={0} seed="s2lpI" />
      {t >= 0.42 ? <Ink d={re} at={0.42} width={2.2} taper={false} vary={0} seed="s2lpR" /> : null}
    </g>
  );
};

/** The thumb-turn again, ABOVE the pinching hand (clipped to the loupe): it stays readable between the fingertips. */
const LoupeKnob: React.FC = () => {
  const t = useTime();
  if (t < B.handIn + 0.2) return null;
  const {r, m, ink} = loupeAt(t);
  return (
    <LoupeClip r={r} m={m}>
      {lockNode(ink, true)}
    </LoupeClip>
  );
};

const CON_PATH = 'M' + CONNECTOR.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L');

const Connector: React.FC = () => {
  const t = useTime();
  if (t < B.site) return null;
  // the dashes draw on loupe -> icon; on 'could' they march one step toward the icon (0.12 s, out(cubic))
  const phase = prog(t, B.could, 0.12, E.outCubic);
  const {d, len} = dashPath(CONNECTOR, CON.dash, CON.gap, phase);
  const nodes: React.ReactNode[] = [
    <Ink key="halo" d={CON_PATH} at={B.site} dur={0.2} width={CON.halo} color={palette.white} taper={false} vary={0} cap="butt" seed="s2conH" />,
    <Ink key="dash" d={d} at={phase > 0 ? undefined : B.site} dur={0.2} width={CON.w} taper={false} vary={0} seed="s2con" />,
  ];
  // 'over': an arrow runs along the connector (0.16 s, landing on the word) and stays as the arrowhead on the roof
  if (t >= B.arrow) {
    const q = prog(t, B.arrow, 0.16, E.inOutSine);
    const s1 = q * len;
    const s0 = Math.max(0, s1 - 50);
    const pts: Pt[] = [];
    for (let i = 0; i <= 8; i++) pts.push(pointAlong(CONNECTOR, s0 + ((s1 - s0) * i) / 8).p);
    const {p, ang} = pointAlong(CONNECTOR, s1);
    const a = (ang * Math.PI) / 180;
    const hl = 18;
    const head = `M${(p[0] - Math.cos(a - 0.5) * hl).toFixed(1)} ${(p[1] - Math.sin(a - 0.5) * hl).toFixed(1)}L${p[0].toFixed(1)} ${p[1].toFixed(1)}L${(p[0] - Math.cos(a + 0.5) * hl).toFixed(1)} ${(p[1] - Math.sin(a + 0.5) * hl).toFixed(1)}`;
    if (q < 1) nodes.push(<path key="streak" d={'M' + pts.map((pp) => `${pp[0].toFixed(1)} ${pp[1].toFixed(1)}`).join('L')} stroke={palette.ink} strokeWidth={3.6} strokeLinecap="round" fill="none" />);
    nodes.push(<path key="head" d={head} stroke={palette.ink} strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />);
  }
  return <>{nodes}</>;
};

/** Clip to the sheet's inner rect (world): the diagram hand is drawn ON the plan, it enters from the sheet's edge. */
const OnSheet: React.FC<{children: React.ReactNode}> = ({children}) => {
  const id = 'sh' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <rect x={SHEET_IN[0]} y={SHEET_IN[1]} width={SHEET_IN[2]} height={SHEET_IN[3]} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </>
  );
};

/** The hoodie drawstring's swing (deg, + = trailing toward the fingertips): a damped pendulum kicked by each move of the
 *  hand (slide-in stop, turn, let-go), an idle sway, and a trailing lean as the hand accelerates away on the exit. */
const cordSwing = (t: number) => {
  const kicks: [number, number][] = [
    [B.handIn + 0.22, 18],
    [B.turn + 0.05, -12],
    [B.release, 9],
  ];
  let a = 2.5 * Math.sin((t - B.handIn) * Math.PI * 2 * 0.7);
  for (const [t0, amp] of kicks) if (t > t0) a += amp * Math.exp(-(t - t0) * 3.2) * Math.sin((t - t0) * Math.PI * 2 * 1.9);
  return a + 24 * prog(t, B.handOut, HAND.exitDur, E.inQuad);
};

// the hood cue (fix round 2), in DiagramHand's local units (fingertips at the origin, the forearm along +x, x1.2): the
// sleeve is the kit's teal hoodie fill (DiagramHand `sleeve`, the attempters' hoodie: teal sleeve, tealDark ribbed
// cuff) and a hoodie drawstring with an ink aglet hangs from the cuff's lower edge, swinging with the hand
const CORD_AT: Pt = [111, 33];
const CORD_L = 34;

/** The dashed hooded hand. The shared DiagramHand does the slide-in, the dashes and the fills (dashed outline, white
 *  paper hand, the teal hoodie sleeve, the flat tealDark ribbed cuff); this rig adds: the turn on the thumb-turn (out(cubic), with the
 *  knob), the GRAB (12 px further onto the knob and back as the slide ends), the let-go (backs off 26 px) and the hover
 *  (a slow bob), the exit (300 px along the arm in 0.34 s in(cubic), from end(password)-0.15: past the sheet's edge
 *  before the last frame), solid ink contact strokes on the index and thumb tips, and the hoodie drawstring. */
const HandRig: React.FC = () => {
  const t = useTime();
  if (t < B.handIn) return null;
  const rot = HAND.turn * prog(t, B.turn, 0.2, E.outCubic);
  const a = ((HAND.angle + rot) * Math.PI) / 180;
  const grab = -12 * Math.sin(Math.PI * prog(t, B.handIn + 0.27, 0.24));
  const letGo = 26 * prog(t, B.release, 0.2, E.outCubic);
  const hover = t > B.release + 0.2 ? 7 * Math.sin(((t - B.release - 0.2) / 0.95) * Math.PI * 2) : 0;
  const exit = HAND.exitTravel * prog(t, B.handOut, HAND.exitDur, E.inCubic);
  if (exit >= HAND.exitTravel - 0.5) return null;
  const d = grab + letGo + hover + exit;
  const lift = t > B.release ? -4 * Math.sin(((t - B.release) / 0.95) * Math.PI * 2) : 0;
  // DiagramHand's own frame (its slide-in and the settle squeeze), for the contact strokes and the hood cue
  const a0 = (HAND.angle * Math.PI) / 180;
  const slide = HAND.from * (1 - prog(t, B.handIn, 0.3, E.outCubic));
  const sq = Math.max(0, Math.sin(clamp((t - B.handIn - 0.3 - 0.12) / 0.14) * Math.PI)) * 0.05;
  const handLocal = mat.compose(mat.translate(PINCH[0] + Math.cos(a0) * slide, PINCH[1] + Math.sin(a0) * slide), mat.rotate(HAND.angle), mat.scale(HAND.scale * (1 - sq), HAND.scale * (1 + sq * 0.5)));
  // the drawstring hangs world-down (90 deg in the world = 90 - arm angle in the hand's frame), plus its swing
  const g = ((90 - (HAND.angle + rot) + cordSwing(t)) * Math.PI) / 180;
  const u: Pt = [Math.cos(g), Math.sin(g)];
  const n: Pt = [-u[1], u[0]];
  const end: Pt = [CORD_AT[0] + u[0] * CORD_L, CORD_AT[1] + u[1] * CORD_L];
  const mid: Pt = [CORD_AT[0] + u[0] * CORD_L * 0.5 + n[0] * 2.4, CORD_AT[1] + u[1] * CORD_L * 0.5 + n[1] * 2.4];
  const cord = `M${CORD_AT[0]} ${CORD_AT[1]}Q${mid[0].toFixed(2)} ${mid[1].toFixed(2)} ${end[0].toFixed(2)} ${end[1].toFixed(2)}`;
  const aglet = `M${(end[0] + u[0] * 1.5).toFixed(2)} ${(end[1] + u[1] * 1.5).toFixed(2)}L${(end[0] + u[0] * 8.5).toFixed(2)} ${(end[1] + u[1] * 8.5).toFixed(2)}`;
  const iw = 1 / HAND.scale;
  return (
    <XG m={mat.compose(mat.translate(Math.cos(a) * d, Math.sin(a) * d + lift), mat.about(mat.rotate(rot), PINCH[0], PINCH[1]))}>
      <DiagramHand x={PINCH[0]} y={PINCH[1]} angle={HAND.angle} scale={HAND.scale} enterAt={B.handIn} from={HAND.from} ink={HAND.ink} dash={HAND.dash} handFill={palette.white} sleeve={palette.teal} seed="s2hand" />
      <XG m={handLocal}>
        <Ink d={TIPS} width={3.6 * iw} taper={false} vary={0} seed="s2tips" />
        <Ink d={cord} width={2.3 * iw} taper={false} vary={0} seed="s2cord" />
        <path d={aglet} stroke={palette.ink} strokeWidth={5.4 * iw} strokeLinecap="round" fill="none" />
      </XG>
    </XG>
  );
};

/** The site icon reacts: a squash-pop with its flag ('over') and a jolt on 'site' (its padlock pops). */
const SiteJolt: React.FC<{children: React.ReactNode}> = ({children}) => {
  const t = useTime();
  const base: Pt = [ICON[0] + ICON[2] / 2, ICON[1] + ICON[3]];
  const pop = t >= B.flag ? 1 + 0.12 * Math.sin(Math.PI * prog(t, B.flag, 0.2)) * (1 - prog(t, B.flag + 0.2, 0.1)) : 1;
  const jolt = t >= B.siteWord ? 5 * Math.exp(-(t - B.siteWord) * 9) * Math.sin((t - B.siteWord) * 40) : 0;
  return <XG m={mat.compose(mat.about(mat.rotate(jolt), base[0], base[1]), mat.about(mat.scale(2 - pop, pop), base[0], base[1]))}>{children}</XG>;
};

/** 'over': an ink ring pops round the icon and runs out (r 74 -> 96, 0.16 s), then pops off (a ripple, never fades). */
const IconRing: React.FC = () => {
  const t = useTime();
  if (t < B.ring || t >= B.ring + 0.2) return null;
  const r = lerp(74, 96, E.outCubic(prog(t, B.ring, 0.16)));
  return <Ink d={circle(ICON_C[0], ICON_C[1], r, {seed: 's2ring', overlap: 12})} width={2.2} taper={false} vary={0} seed="s2ring" />;
};

/** L2's curved leader + end dot, over a paper halo (draws on after the card pops). */
const Leader: React.FC = () => {
  const t = useTime();
  const at = B.L2 + 0.12;
  if (t < at) return null;
  return (
    <>
      <Ink d={LEADER} at={at} width={9} color={palette.white} taper={false} vary={0} cap="butt" seed="s2ldH" />
      <Ink d={LEADER} at={at} width={2.2} taper={false} vary={0} seed="s2ld" />
      {t >= at + 0.1 ? <Fill d={`M${LEADER_DOT[0] - 4.2} ${LEADER_DOT[1]}a4.2 4.2 0 1 0 8.4 0a4.2 4.2 0 1 0 -8.4 0Z`} color={palette.ink} at={at + 0.1} mode="pop" offset={false} seed="s2ldD" /> : null}
    </>
  );
};

// ---- Pip's hop OUT, handed to S03 (fix round 2). S03's pickup as of its fix round 2 (src/scenes/scene03/cast.tsx,
// read-only here): at S03's t0 Pip is at world (830, 905) = screen (830, 915) under S03's rest camera, already FALLING
// down-left (vx -1133, vy0 +400 px/s, g ~5,400), scale 1.2, stand-side spread 0.85, flipped, nose up ~6 deg, stretch
// -0.2; S03's first frame (8.400) shows him at ~(822, 918). S02's last film frame (8.3667) is one S03 frame before:
// S03's own ballistic extrapolation puts him at (860, 906) moving (-1133, +257) px/s. A curve from the rod to exactly
// that would swing 43 px RIGHT before turning left (net x ~0), so S02 lands at (848, 906) moving (-680, +257) px/s:
// position within one S03 frame, the same phase (falling, down-left), the horizontal speed picks up across the cut.
// The hop is a Hermite curve in world px from the rod (a small hop up) to that point and velocity: on screen 12, 8, 19,
// 27, 30, 29, 26, 25 px per frame. Retune S03_PICKUP if S03 moves its pickup again.
const S03_PICKUP = {screen: [848, 906] as Pt, v: [-680, 257] as Pt, scale: 1.2, rotate: 6, amount: 0.85, squash: -0.2};
const T_LAST = +(LAST_FRAME_ABS - S02_START).toFixed(4);
const CAM_LAST = camAt(T_LAST, DUR);
const PIP_OUT = {
  t0: B.pipHop,
  t1: T_LAST,
  p0: PIP_PERCH,
  p1: [(S03_PICKUP.screen[0] - 540) / CAM_LAST.zoom + CAM_LAST.x, (S03_PICKUP.screen[1] - 960) / CAM_LAST.zoom + CAM_LAST.y] as Pt,
  v0: [0, -480] as Pt, // world px/s: a small hop up off the rod
  v1: [S03_PICKUP.v[0] / CAM_LAST.zoom, S03_PICKUP.v[1] / CAM_LAST.zoom] as Pt,
};
const hermite = (p0: number, p1: number, m0: number, m1: number, D: number, s: number) =>
  (2 * s ** 3 - 3 * s ** 2 + 1) * p0 + (s ** 3 - 2 * s ** 2 + s) * D * m0 + (-2 * s ** 3 + 3 * s ** 2) * p1 + (s ** 3 - s ** 2) * D * m1;
/** Pip's position on the hop out (world) and its progress 0..1 (past 1: extrapolated, only S02's own preview sees it). */
const pipOutAt = (t: number): {p: Pt; s: number} => {
  const {t0, t1, p0, p1, v0, v1} = PIP_OUT;
  const D = t1 - t0;
  if (t >= t1) return {p: [p1[0] + v1[0] * (t - t1), p1[1] + v1[1] * (t - t1)], s: 1};
  const s = clamp((t - t0) / D);
  return {p: [hermite(p0[0], p1[0], v0[0], v1[0], D, s), hermite(p0[1], p1[1], v0[1], v1[1], D, s)], s};
};
// the ears-cover gag reads at thumbnail size: Pip leans and looks down at the crossed key first (0.1 s), then the pose
// pops x1.3 (the front ears-cover rig is ~30 % smaller than sit-back), shivers, and big worry marks flick out round
// his head (the pose's own marks are ~5 px)
const COVER_SCALE = 1.3;
// worry marks (Pip-local units, x his scale; anchor = feet): three short strokes fanned out on each side of the head
const WORRY: [Pt, Pt][] = [
  [[-50, -92], [-62, -104]],
  [[-56, -74], [-71, -77]],
  [[-52, -56], [-65, -50]],
];

const Pip: React.FC = () => {
  const t = useTime();
  // hop in across the frame's right edge ON the cut (S01 lost him off its right edge at ~(1060, 920)): a short, low arc
  // from just off the right edge (world (975, 860), screen ~(1120, 835) at 1.15) so it reads as a hop (~50 px per frame),
  // landing on the rod on 'because'+0.15; at the first S02 frame he is ~43 % along, mid-air
  const hIn = hop({t, t0: B.pipLand - 0.23, dur: 0.23, from: {x: 975, y: 860}, to: {x: PIP_PERCH[0], y: PIP_PERCH[1]}, height: 22});
  const out = t >= B.pipEars;
  let x = hIn.x;
  let y = hIn.y;
  let squash = hIn.squash;
  let rotate = hIn.rotate;
  let amount: number | undefined = t < B.pipLand ? hIn.spread : undefined;
  let scale = PIP_SCALE;
  if (out) {
    const {p, s} = pipOutAt(t);
    [x, y] = t < B.pipHop ? PIP_PERCH : p;
    if (t < B.pipHop) {
      // ears up, crouch (anticipation)
      squash = 0.2 * Math.sin((clamp((t - B.pipEars) / (B.pipHop - B.pipEars)) * Math.PI) / 2);
      rotate = 0;
      amount = 0;
    } else {
      // stretch in the air, the nose follows the arc (up off the rod, down in the fall, up again as the ears flare into
      // S03's float); the spread and the scale arrive at S03's values on the last frame
      squash = lerp(-0.26, S03_PICKUP.squash, s);
      rotate = s < 0.5 ? lerp(10, -8, s / 0.5) : lerp(-8, S03_PICKUP.rotate, (s - 0.5) / 0.5);
      amount = s < 0.35 ? lerp(0.3, 1, s / 0.35) : lerp(1, S03_PICKUP.amount, (s - 0.35) / 0.65);
      scale = lerp(PIP_SCALE, S03_PICKUP.scale / CAM_LAST.zoom, s);
    }
  } else if (t >= B.pipLean) {
    // the gag: lean toward the key (0.1 s), then ears-cover x1.3 with a shiver
    rotate = -9 * E.outCubic(prog(t, B.pipLean, 0.1)) * (1 - prog(t, B.pipCover, 0.08));
    const k = E.outBack(1.8)(prog(t, B.pipCover - 0.02, 0.14));
    scale = PIP_SCALE * lerp(1, COVER_SCALE, k);
    if (t >= B.pipCover) x += 1.6 * Math.sin((t - B.pipCover) * Math.PI * 2 * 11);
  }
  // worry marks: flick out 0.06 s after the cover, wobble, pop off as the ears lift
  let worry: React.ReactNode = null;
  if (t >= B.pipCover + 0.06 && t < B.pipEars) {
    const sc = PIP_SCALE * COVER_SCALE;
    const wob = Math.sin((t - B.pipCover) * Math.PI * 2 * 3.1) * 2.2;
    let d = '';
    for (const sd of [-1, 1]) {
      for (const [i, [a, b]] of WORRY.entries()) {
        const w = (i % 2 ? -1 : 1) * wob;
        d += `M${(x + sd * a[0] * sc).toFixed(1)} ${(y + (a[1] + w) * sc).toFixed(1)}L${(x + sd * b[0] * sc).toFixed(1)} ${(y + (b[1] + w) * sc).toFixed(1)}`;
      }
    }
    worry = <Ink d={d} at={B.pipCover + 0.06} dur={0.08} order="all" width={2.6} taper={false} vary={0} seed="s2worry" />;
  }
  return (
    <>
      <ElephantTimeline
        x={x}
        y={y}
        scale={scale}
        t={t}
        seed={22}
        squash={squash}
        rotate={rotate}
        flip={t < B.pipLand || out}
        amount={amount}
        keys={[
          {t: -1, pose: 'stand-side'},
          {t: B.pipLand, pose: 'sit-back', look: -0.55},
          {t: B.handIn + 0.05, pose: 'sit-back', look: 0.55},
          {t: B.take + 0.05, pose: 'sit-back', look: -0.45},
          {t: B.siteWord + 0.1, pose: 'sit-back', look: 0.2},
          {t: B.without + 0.06, pose: 'sit-back', look: -0.9},
          {t: B.pipLean, pose: 'sit-back', look: -1},
          {t: B.pipCover, pose: 'ears-cover'},
          {t: B.pipEars, pose: 'stand-side', expression: 'wide'},
        ]}
      />
      {worry}
    </>
  );
};

const Scene02: React.FC = () => {
  const t = useTime();
  const sc = useScene();
  const dur = sc ? sc.end - sc.start : DUR;
  const cam = camAt(t, dur);
  return (
    <World sky={[{t: 0, tod: 'day'}]}>
      {/* the sun peeks over the cornice (screen space, behind the facade), left of Pip: (668, 700) r110, top 590 (under
          the 560 sky ceiling), only its cap above the cornice; it drifts 6 px/s and reaches S03's slot (690, 700) r110
          exactly on the hard cut (fix round 2: was 18 px short, a near-miss jitter across the cut) */}
      <Sun cx={668} cy={700} r={110} drift={[6, 0]} />
      <XG m={camMat(cam)}>
        {/* the PHP master blueprint, pre-rolled 0.3 s: its outer linework is already drawing outward at the cut (the
            swelling loupe covers plan lines that are there = a magnifier); its own Lock is hidden (the loupe draws it) */}
        <BlueprintWall drawAt={-0.3} lock={{at: 1e6}} foreground={false} />
        <PlanGrid area={GRID_AREA} from={C} at={-0.06} holes={GRID_HOLES} color={GRID_TINT} pitch={52} width={0.85} thin={[150, 300]} />
        {/* the lock detail (match object: already there at the cut), then the detail loupe */}
        <Loupe />
        <Connector />
        <IconRing />
        <SiteJolt>
          <TakenSite x={ICON[0]} y={ICON[1]} w={ICON[2]} h={ICON[3]} at={B.site - 0.04} takenAt={B.taken} flagAt={B.flag} unlockAt={B.siteWord} flutterAt={B.flutter} ink={3.8} seed="s2site" />
        </SiteJolt>
        {/* 'without': an eraser rubs a patch of paper clean beside the loupe (0.1 s, three rubs), the key draws in it,
            then an ink cross strikes it */}
        {t >= B.erase ? (
          <OnSheet>
            <Ink d={ERASE} at={B.erase} dur={0.1} pace="free" width={40} color={palette.white} taper={false} vary={0} seed="s2erase" />
          </OnSheet>
        ) : null}
        <KeyCross x={KEY[0]} y={KEY[1]} size={118} at={B.without} crossAt={B.without + 0.17} settleAt={B.flutter} ink={5.2} seed="s2key" />
        <LabelTag kind="card" x={215 + 196} y={724} text="PHP2Shell · two linked flaws" fontSize={40 / 1.3} inkPx={2.2} at={B.L1} seed="s2L1" />
        <LabelTag kind="card" box={L2_BOX} text={['no password', 'control of the site and its data']} fontSize={40 / 1.32} inkPx={2.2} at={B.L2} seed="s2L2" />
        <Leader />
        <OnSheet>
          <HandRig />
        </OnSheet>
        <LoupeKnob />
        <Onlookers turnA={local(W.over)} turnB={local(W.password)} turnC={B.release + 0.05} />
        <Pip />
      </XG>
    </World>
  );
};
export default Scene02;
