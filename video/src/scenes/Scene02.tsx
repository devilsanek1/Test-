// S02 "The takeover diagram" (storyboard v3, cut(purpose) -> cut(password), 4.715-8.393 s on the take).
// VO: "because of this bug where hackers could take over a site without a password."
// The 'inset': a tight look at the PHP master blueprint (BlueprintWall, drawing outward from the lock). The lock detail
// lands exactly where S01's dive left govB's lock box (screen (560, 1150), ~70 x 86 px at the cut) and the blueprint's
// own DETAIL CIRCLE round it swells into a loupe (x2.4) so the mechanism reads on a phone: the cover swings open, the
// bolt stops SHORT, Bit peeks out of the socket; a dashed hooded hand turns the thumb-turn with no key and a tiny
// schematic site is taken over; a key gets crossed out. Labels L1 (static title-block card) and L2 (with a leader).
// Camera, beats, positions: docs/storyboard_v3.md S02 + docs/storyboard_v3_resolved.json; notes: docs/scenes/S02.md.
import React, {useId} from 'react';
import {World, Sun, XG, Ink, Fill, useTime, useScene, palette, prog, lerp, springAt, springs, ease as E, mat, circle} from '../lib';
import {ElephantTimeline, hop} from '../lib/mascot';
import {BlueprintWall, BLUEPRINT_WALL} from './shared/sets';
import {LabelTag} from './shared/props';
import {camAt, camMat} from './scene02/camera';
import {B, S02_END, S02_START} from './scene02/beats';
import {DiagramLock, THUMB} from './scene02/DiagramLock';
import {DiagramHand, KeyCross, SiteIcon, dashPath, pointAlong} from './scene02/shims';
import type {Pt} from '../lib/sketch';

const L = BLUEPRINT_WALL.lock;
const LOCK_SIZE = L.h; // 75: 60 x 75 world, 69 x 86 px on screen at the 1.15 landing (the S01 match)
const C: Pt = [L.x, L.y];
// the detail loupe: the blueprint's callout circle (r 64) swells to r 145 and magnifies the lock x2.4 about its centre
const LOUPE = {at: 0.1, r0: 64, r1: 145, m: 2.4};
// the thumb-turn knob in the magnified view (world)
const KNOB: Pt = [C[0] + THUMB[0] * (LOCK_SIZE / 100) * LOUPE.m, C[1] + THUMB[1] * (LOCK_SIZE / 100) * LOUPE.m];
// the site icon sits 30 px higher than the storyboard box (640-760 x 1090-1210) so it clears the sheet's elephant stamp
const ICON: [number, number, number, number] = [640, 1060, 120, 120];
// dashed connector: out of the loupe's right edge at the bolt axis, along, then down onto the icon's roof
const CONNECTOR: Pt[] = [
  [C[0] + Math.sqrt(LOUPE.r1 ** 2 - 14 ** 2) + 3, C[1] + 14],
  [ICON[0] + 60, C[1] + 14],
  [ICON[0] + 60, ICON[1] - 2],
];
// the sheet's inner rect (inside the teal frame): the diagram hand is DRAWN ON the plan, so it is clipped to it
const [SX, SY, SW, SH] = BLUEPRINT_WALL.sheet;
const SHEET_IN: [number, number, number, number] = [SX + 12, SY + 12, SW - 24, SH - 24];
const DASH = 9;
const GAP = 7;
const PIP_PERCH = BLUEPRINT_WALL.perch;
const PIP_SCALE = 1.2 / 1.3; // 1.2 on screen at the 1.30 landing (~115 px)

/** The lock detail inside the swelling detail circle. Before the swell it is the plain 60 x 75 detail (the match). */
const Loupe: React.FC = () => {
  const t = useTime();
  const uid = 'lp' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const k = t < LOUPE.at ? 0 : springAt(t, LOUPE.at, springs.pop);
  const r = lerp(LOUPE.r0, LOUPE.r1, k);
  const m = lerp(1, LOUPE.m, k);
  // keep the lock's pen ~5 px on screen once magnified (3.4 world at x1, 1.58 x 2.4 = 3.8 world at x2.4)
  const ink = lerp(3.4, 1.58, Math.min(1, k));
  const lock = (
    <DiagramLock
      x={C[0]}
      y={C[1]}
      size={LOCK_SIZE}
      ink={ink}
      coverOpenAt={B.coverOpen}
      boltTestAt={B.boltTest}
      gapMarkAt={B.bug}
      turnAt={B.take}
      bit={{size: 17, peekAt: B.bug - 0.02, cowerAt: B.could, hideAt: B.over, popAt: B.handOut}}
    />
  );
  if (k <= 0) return lock;
  const ring = circle(C[0], C[1], r, {seed: 's2loupe', overlap: 14});
  return (
    <g>
      <Fill d={`M${C[0] - r} ${C[1]}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`} color={palette.white} offset={false} mode="none" seed="s2lpF" />
      <defs>
        <clipPath id={`${uid}c`} clipPathUnits="userSpaceOnUse">
          <circle cx={C[0]} cy={C[1]} r={r - 1} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${uid}c)`}>
        <XG m={mat.about(mat.scale(m), C[0], C[1])}>{lock}</XG>
      </g>
      <Ink d={ring} width={4.2} taper={false} vary={0} seed="s2lpI" />
    </g>
  );
};

const Connector: React.FC = () => {
  const t = useTime();
  if (t < B.site) return null;
  // the dashes draw on loupe -> icon; on 'could' they march one step toward the icon (0.12 s)
  const phase = prog(t, B.could, 0.12, E.inOutCubic);
  const {d, len} = dashPath(CONNECTOR, DASH, GAP, phase);
  const nodes: React.ReactNode[] = [<Ink key="dash" d={d} at={phase > 0 ? undefined : B.site} dur={0.2} width={2.8} taper={false} vary={0} seed="s2con" />];
  // 'over': an arrow runs along the connector (0.24 s) and stays as the arrowhead on the icon's roof
  if (t >= B.over) {
    const q = prog(t, B.over, 0.24, E.inOutCubic);
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

const Pip: React.FC = () => {
  const t = useTime();
  // hop in from S01 (mid-air at the cut, lands on 'because'), hop out toward the lens at the end (crosses the cut)
  const hIn = hop({t, t0: B.pipLand - 0.4, dur: 0.4, from: {x: 930, y: 860}, to: {x: PIP_PERCH[0], y: PIP_PERCH[1]}, height: 50});
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
      flip={air && !out}
      amount={air ? h.spread : undefined}
      keys={[
        {t: -1, pose: 'stand-side'},
        {t: B.pipLand, pose: 'sit-back', look: -0.55},
        {t: B.handIn + 0.05, pose: 'sit-back', look: 0.55},
        {t: B.take + 0.05, pose: 'sit-back', look: -0.45},
        {t: B.pipCover, pose: 'ears-cover'},
        {t: B.pipHop - 0.2, pose: 'stand-side', expression: 'wide'},
      ]}
    />
  );
};

const Scene02: React.FC = () => {
  const t = useTime();
  const sc = useScene();
  const dur = sc ? sc.end - sc.start : S02_END - S02_START;
  const cam = camAt(t, dur);
  return (
    <World sky={[{t: 0, tod: 'day'}]}>
      {/* the sun peeks over the cornice (screen space, its lower part behind the facade) */}
      <Sun cx={870} cy={740} r={110} drift={[6, 0]} />
      <XG m={camMat(cam)}>
        {/* the PHP master blueprint: its linework draws outward from the lock from the cut (0.7 s) */}
        <BlueprintWall drawAt={0} lock={{at: 1e6}} calendar={undefined} />
        {/* the lock detail (match object: already there at the cut), then the detail loupe */}
        <Loupe />
        <Connector />
        <SiteIcon x={ICON[0]} y={ICON[1]} w={ICON[2]} h={ICON[3]} at={B.site - 0.04} takenAt={B.over} unlockAt={B.siteWord} flutterAt={B.flutter} seed="s2site" />
        <KeyCross x={338} y={846} size={84} at={B.without} crossAt={B.without + 0.17} settleAt={B.flutter} seed="s2key" />
        <LabelTag kind="card" x={215 + 196} y={724} text="PHP2Shell · two linked flaws" fontSize={40 / 1.3} inkPx={2.2} at={B.L1} seed="s2L1" />
        <LabelTag kind="card" box={[214, 1110, 618, 1198]} text={['no password ·', 'control of the site and its data']} fontSize={40 / 1.32} inkPx={2.2} at={B.L2} leader={[ICON[0] + 10, 1160]} seed="s2L2" />
        <defs>
          <clipPath id="s2sheet" clipPathUnits="userSpaceOnUse">
            <rect x={SHEET_IN[0]} y={SHEET_IN[1]} width={SHEET_IN[2]} height={SHEET_IN[3]} />
          </clipPath>
        </defs>
        <g clipPath="url(#s2sheet)">
          <DiagramHand x={KNOB[0]} y={KNOB[1] - 4} angle={-36} scale={1.45} enterAt={B.handIn} from={560} turnAt={B.take} turnDeg={34} exitAt={B.handOut} ink={2.6} seed="s2hand" />
        </g>
        <Pip />
      </XG>
    </World>
  );
};
export default Scene02;
