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
import {B, S02_END, S02_START, W, local} from './scene02/beats';
import {DiagramLock, THUMB} from './scene02/DiagramLock';
import {TakenSite} from './scene02/TakenSite';
import {PlanGrid} from './scene02/PlanGrid';
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
// L2: lower left, 14 world under the loupe's bottom (1100) and 12 above the door-width dimension line (1214)
const L2_BOX: [number, number, number, number] = [214, 1114, 596, 1202];
// its leader: a curved ink line from the card's right edge to a dot on the icon's left wall (~80 px on screen), drawn
// over a white paper halo that breaks the door-elevation lines it crosses (the drafting convention, no '+' crossings)
const LEADER = `M${L2_BOX[2] + 2} 1170C624 1172 642 1154 ${ICON[0] + 14} 1146`;
const LEADER_DOT: Pt = [ICON[0] + 14, 1146];
// the sheet's inner rect (inside the teal frame): the diagram hand is DRAWN ON the plan, so it is clipped to it
const [SX, SY, SW, SH] = BLUEPRINT_WALL.sheet;
const SHEET_IN: [number, number, number, number] = [SX + 12, SY + 12, SW - 24, SH - 24];
// the plan grid: below the clean top margin, inside the frame
const GRID_AREA: [number, number, number, number] = [SX + 12, BLUEPRINT_WALL.topMargin[3] + 4, SX + SW - 12, SY + SH - 12];
// the grid keeps off the sheet's elephant stamp badge and its title block (both printed on the plan)
const ST = BLUEPRINT_WALL.stamp;
const GRID_HOLES = [{c: [ST.x, ST.y, ST.r + 14] as [number, number, number]}, {r: [SX + 18, SY + SH - 106, SX + 212, SY + SH - 16] as [number, number, number, number]}];
// the crossed-out key: up-left of the loupe, clear of its ring, the L1 card and the hand, on a patch rubbed clean
const KEY: Pt = [292, 826];
// the eraser's path over the key's patch (three rubs, a thick paper-white stroke)
const ERASE = `M232 798L352 804L236 826L354 832L238 854L350 858`;
const DASH = 9;
const GAP = 7;
const PIP_PERCH = BLUEPRINT_WALL.perch;
const PIP_SCALE = 1.2 / 1.3; // 1.2 on screen at the 1.30 landing (~115 px)
// the diagram hand
const HAND = {angle: -40, turn: 18, scale: 1.2, from: 560, exitTravel: 380, exitDur: 0.18, ink: 3.2, dash: [6, 5] as [number, number]};
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

const Connector: React.FC = () => {
  const t = useTime();
  if (t < B.site) return null;
  // the dashes draw on loupe -> icon; on 'could' they march one step toward the icon (0.12 s, out(cubic))
  const phase = prog(t, B.could, 0.12, E.outCubic);
  const {d, len} = dashPath(CONNECTOR, DASH, GAP, phase);
  const nodes: React.ReactNode[] = [<Ink key="dash" d={d} at={phase > 0 ? undefined : B.site} dur={0.2} width={2.8} taper={false} vary={0} seed="s2con" />];
  // 'over': an arrow runs along the connector (0.16 s, landing on the word) and stays as the arrowhead on the roof
  if (t >= B.arrow) {
    const q = prog(t, B.arrow, 0.16, E.inOutSine);
    const s1 = q * len;
    const s0 = Math.max(0, s1 - 50);
    const pts: Pt[] = [];
    for (let i = 0; i <= 8; i++) pts.push(pointAlong(CONNECTOR, s0 + ((s1 - s0) * i) / 8).p);
    const {p, ang} = pointAlong(CONNECTOR, s1);
    const a = (ang * Math.PI) / 180;
    const hl = 15;
    const head = `M${(p[0] - Math.cos(a - 0.5) * hl).toFixed(1)} ${(p[1] - Math.sin(a - 0.5) * hl).toFixed(1)}L${p[0].toFixed(1)} ${p[1].toFixed(1)}L${(p[0] - Math.cos(a + 0.5) * hl).toFixed(1)} ${(p[1] - Math.sin(a + 0.5) * hl).toFixed(1)}`;
    if (q < 1) nodes.push(<path key="streak" d={'M' + pts.map((pp) => `${pp[0].toFixed(1)} ${pp[1].toFixed(1)}`).join('L')} stroke={palette.ink} strokeWidth={3.6} strokeLinecap="round" fill="none" />);
    nodes.push(<path key="head" d={head} stroke={palette.ink} strokeWidth={3.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />);
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

/** The dashed hooded hand. The shared DiagramHand does the slide-in, the dashes and the fills (dashed sleeve outline,
 *  white paper hand, the flat tealDark ribbed cuff); this rig adds: the turn on the thumb-turn (out(cubic), with the
 *  knob), the GRAB (12 px further onto the knob and back as the slide ends), the let-go (backs off 26 px) and the hover
 *  (a slow bob), the exit (380 px along the arm in 0.18 s in-out: past the sheet's edge before the cut), and solid ink
 *  contact strokes on the index and thumb tips. */
const HandRig: React.FC = () => {
  const t = useTime();
  if (t < B.handIn) return null;
  const rot = HAND.turn * prog(t, B.turn, 0.2, E.outCubic);
  const a = ((HAND.angle + rot) * Math.PI) / 180;
  const grab = -12 * Math.sin(Math.PI * prog(t, B.handIn + 0.27, 0.24));
  const letGo = 26 * prog(t, B.release, 0.2, E.outCubic);
  const hover = t > B.release + 0.2 ? 7 * Math.sin(((t - B.release - 0.2) / 0.95) * Math.PI * 2) : 0;
  const exit = HAND.exitTravel * prog(t, B.handOut, HAND.exitDur, E.inOutCubic);
  if (exit >= HAND.exitTravel - 0.5) return null;
  const d = grab + letGo + hover + exit;
  const lift = t > B.release ? -4 * Math.sin(((t - B.release) / 0.95) * Math.PI * 2) : 0;
  // DiagramHand's own frame (its slide-in and the settle squeeze), for the contact strokes
  const a0 = (HAND.angle * Math.PI) / 180;
  const slide = HAND.from * (1 - prog(t, B.handIn, 0.3, E.outCubic));
  const sq = Math.max(0, Math.sin(clamp((t - B.handIn - 0.3 - 0.12) / 0.14) * Math.PI)) * 0.05;
  const handLocal = mat.compose(mat.translate(PINCH[0] + Math.cos(a0) * slide, PINCH[1] + Math.sin(a0) * slide), mat.rotate(HAND.angle), mat.scale(HAND.scale * (1 - sq), HAND.scale * (1 + sq * 0.5)));
  return (
    <XG m={mat.compose(mat.translate(Math.cos(a) * d, Math.sin(a) * d + lift), mat.about(mat.rotate(rot), PINCH[0], PINCH[1]))}>
      <DiagramHand x={PINCH[0]} y={PINCH[1]} angle={HAND.angle} scale={HAND.scale} enterAt={B.handIn} from={HAND.from} ink={HAND.ink} dash={HAND.dash} handFill={palette.white} sleeve={false} seed="s2hand" />
      <XG m={handLocal}>
        <Ink d={TIPS} width={3.6 / HAND.scale} taper={false} vary={0} seed="s2tips" />
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

const Pip: React.FC = () => {
  const t = useTime();
  // hop in across the frame's right edge ON the cut (S01 lost him off its right edge at ~(1060, 920)): at the first S02
  // frame he is at screen ~(1090, 815), mid-air, and lands on the rod on 'because'; hop out toward the lens at the end
  const hIn = hop({t, t0: B.pipLand - 0.23, dur: 0.23, from: {x: 1100, y: 1000}, to: {x: PIP_PERCH[0], y: PIP_PERCH[1]}, height: 30});
  const hOut = hop({t, t0: B.pipHop, dur: 0.42, from: {x: PIP_PERCH[0], y: PIP_PERCH[1]}, to: {x: 610, y: 1040}, height: 36});
  const out = t >= B.pipHop - 0.14;
  const h = out ? hOut : hIn;
  const air = (!out && t < B.pipLand) || (out && h.airborne);
  const scale = PIP_SCALE * (out && h.airborne ? 1 + 0.45 * h.k : 1);
  return (
    <ElephantTimeline
      x={h.x}
      y={h.y}
      scale={scale}
      t={t}
      seed={22}
      squash={h.squash}
      rotate={h.rotate}
      flip={air || out || t >= B.pipHop - 0.2}
      amount={air ? h.spread : undefined}
      keys={[
        {t: -1, pose: 'stand-side'},
        {t: B.pipLand, pose: 'sit-back', look: -0.55},
        {t: B.handIn + 0.05, pose: 'sit-back', look: 0.55},
        {t: B.take + 0.05, pose: 'sit-back', look: -0.45},
        {t: B.siteWord + 0.1, pose: 'sit-back', look: 0.2},
        {t: B.without + 0.06, pose: 'sit-back', look: -0.9},
        {t: B.pipCover, pose: 'ears-cover'},
        {t: B.pipHop - 0.2, pose: 'stand-side', expression: 'wide'},
      ]}
    />
  );
};

const Scene02: React.FC = () => {
  const t = useTime();
  const sc = useScene();
  const dur = sc ? sc.end - sc.start : DUR;
  const cam = camAt(t, dur);
  return (
    <World sky={[{t: 0, tod: 'day'}]}>
      {/* the sun peeks over the cornice (screen space, behind the facade), left of Pip: (650, 705) r110 -> x 540-760,
          top 595 (under the 560 sky ceiling), only its cap above the cornice (S03's sun slot is (690, 700)) */}
      <Sun cx={650} cy={705} r={110} drift={[6, 0]} />
      <XG m={camMat(cam)}>
        {/* the PHP master blueprint, pre-rolled 0.3 s: its outer linework is already drawing outward at the cut (the
            swelling loupe covers plan lines that are there = a magnifier); its own Lock is hidden (the loupe draws it) */}
        <BlueprintWall drawAt={-0.3} lock={{at: 1e6}} foreground={false} />
        <PlanGrid area={GRID_AREA} from={C} at={-0.06} holes={GRID_HOLES} />
        {/* the lock detail (match object: already there at the cut), then the detail loupe */}
        <Loupe />
        <Connector />
        <IconRing />
        <SiteJolt>
          <TakenSite x={ICON[0]} y={ICON[1]} w={ICON[2]} h={ICON[3]} at={B.site - 0.04} takenAt={B.taken} flagAt={B.flag} unlockAt={B.siteWord} flutterAt={B.flutter} ink={3.8} seed="s2site" />
        </SiteJolt>
        {/* 'without': an eraser rubs a patch of paper clean beside the loupe (0.1 s, three rubs), the key draws in it,
            then an ink cross strikes it */}
        {t >= B.erase ? <Ink d={ERASE} at={B.erase} dur={0.1} pace="free" width={40} color={palette.white} taper={false} vary={0} seed="s2erase" /> : null}
        <KeyCross x={KEY[0]} y={KEY[1]} size={118} at={B.without} crossAt={B.without + 0.17} settleAt={B.flutter} ink={5.2} seed="s2key" />
        <LabelTag kind="card" x={215 + 196} y={724} text="PHP2Shell · two linked flaws" fontSize={40 / 1.3} inkPx={2.2} at={B.L1} seed="s2L1" />
        <LabelTag kind="card" box={L2_BOX} text={['no password ·', 'control of the site and its data']} fontSize={40 / 1.32} inkPx={2.2} at={B.L2} seed="s2L2" />
        <Leader />
        <OnSheet>
          <HandRig />
        </OnSheet>
        <LoupeKnob />
        <Onlookers turnA={local(W.over)} turnC={local(W.password)} phone={B.release + 0.05} />
        <Pip />
      </XG>
    </World>
  );
};
export default Scene02;
