// S02 "The takeover diagram" (storyboard v3, cut(purpose) -> cut(password), 4.715-8.393 s on the take).
// VO: "because of this bug where hackers could take over a site without a password."
// The 'inset': a tight look at the PHP master blueprint (BlueprintWall, drawing outward from the lock). The lock detail
// lands exactly where S01's dive left govB's lock box (screen (560, 1150), ~70 x 86 px at the cut); its cover swings
// open, the bolt stops SHORT, Bit peeks out of the socket; a dashed hooded hand turns the thumb-turn with no key and a
// tiny schematic site is taken over; a key gets crossed out. Labels L1 (static title-block card) and L2 (with a leader).
// Camera, beats, positions: docs/storyboard_v3.md S02 + docs/storyboard_v3_resolved.json; notes: docs/scenes/S02.md.
import React from 'react';
import {World, Sun, XG, Ink, useTime, useScene, palette, prog, ease as E} from '../lib';
import {ElephantTimeline, hop} from '../lib/mascot';
import {BlueprintWall, BLUEPRINT_WALL} from './shared/sets';
import {LabelTag, lockPoint} from './shared/props';
import {camAt, camMat} from './scene02/camera';
import {B, S02_END, S02_START} from './scene02/beats';
import {DiagramLock, THUMB} from './scene02/DiagramLock';
import {DiagramHand, KeyCross, SiteIcon, dashPath, pointAlong} from './scene02/shims';
import type {Pt} from '../lib/sketch';

const L = BLUEPRINT_WALL.lock;
const LOCK_SIZE = L.h; // 75: 60 x 75 world, 69 x 86 px on screen at the 1.15 landing
const THUMB_W = lockPoint(L.x, L.y, LOCK_SIZE, THUMB);
// the icon sits 30 px higher than the storyboard box (640-760 x 1090-1210) so it clears the sheet's elephant stamp
const ICON: [number, number, number, number] = [640, 1060, 120, 120];
// dashed connector: out of the lock's right side at the bolt axis, along, then down onto the icon's roof
const CONNECTOR: Pt[] = [
  [L.x + 34, L.y + 14],
  [ICON[0] + 60, L.y + 14],
  [ICON[0] + 60, ICON[1] - 2],
];
// the sheet's inner rect (inside the teal frame): the diagram hand is DRAWN ON the plan, so it is clipped to it
const [SX, SY, SW, SH] = BLUEPRINT_WALL.sheet;
const SHEET_IN: [number, number, number, number] = [SX + 12, SY + 12, SW - 24, SH - 24];
const DASH = 9;
const GAP = 7;
const PIP_PERCH = BLUEPRINT_WALL.perch;
const PIP_SCALE = 1.2 / 1.3; // 1.2 on screen at the 1.30 landing (~115 px)

const Connector: React.FC = () => {
  const t = useTime();
  if (t < B.site) return null;
  // the dashes draw on lock -> icon; on 'could' they march one step toward the icon (0.12 s)
  const phase = prog(t, B.could, 0.12, E.inOutCubic);
  const {d, len} = dashPath(CONNECTOR, DASH, GAP, phase);
  const nodes: React.ReactNode[] = [
    <Ink key="dash" d={d} at={phase > 0 ? undefined : B.site} dur={0.28} width={2.6} taper={false} vary={0} seed="s2con" />,
  ];
  // 'over': an arrow runs along the connector (0.26 s) and stays as the arrowhead on the icon's roof
  if (t >= B.over) {
    const q = prog(t, B.over, 0.26, E.inOutCubic);
    const s1 = q * len;
    const s0 = Math.max(0, s1 - 60);
    const pts: Pt[] = [];
    for (let i = 0; i <= 8; i++) pts.push(pointAlong(CONNECTOR, s0 + ((s1 - s0) * i) / 8).p);
    const {p, ang} = pointAlong(CONNECTOR, s1);
    const a = (ang * Math.PI) / 180;
    const hl = 15;
    const head = `M${(p[0] - Math.cos(a - 0.5) * hl).toFixed(1)} ${(p[1] - Math.sin(a - 0.5) * hl).toFixed(1)}L${p[0].toFixed(1)} ${p[1].toFixed(1)}L${(p[0] - Math.cos(a + 0.5) * hl).toFixed(1)} ${(p[1] - Math.sin(a + 0.5) * hl).toFixed(1)}`;
    if (q < 1) nodes.push(<path key="streak" d={'M' + pts.map((pp) => `${pp[0].toFixed(1)} ${pp[1].toFixed(1)}`).join('L')} stroke={palette.ink} strokeWidth={3.4} strokeLinecap="round" fill="none" />);
    nodes.push(<path key="head" d={head} stroke={palette.ink} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />);
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
        {/* the lock detail (match object: already there at the cut) */}
        <DiagramLock
          x={L.x}
          y={L.y}
          size={LOCK_SIZE}
          coverOpenAt={B.coverOpen}
          boltTestAt={B.boltTest}
          gapMarkAt={B.bug}
          turnAt={B.take}
          bit={{size: 26, peekAt: B.bug - 0.02, cowerAt: B.could, hideAt: B.over, popAt: B.handOut}}
        />
        <Connector />
        <SiteIcon x={ICON[0]} y={ICON[1]} w={ICON[2]} h={ICON[3]} at={B.site - 0.04} takenAt={B.over} unlockAt={B.siteWord} flutterAt={B.flutter} seed="s2site" />
        <KeyCross x={604} y={1030} size={84} at={B.without} crossAt={B.without + 0.17} settleAt={B.flutter} seed="s2key" />
        <LabelTag kind="card" x={215 + 196} y={724} text="PHP2Shell · two linked flaws" fontSize={40 / 1.3} inkPx={2.2} at={B.L1} seed="s2L1" />
        <LabelTag kind="card" box={[214, 1098, 618, 1190]} text={['no password ·', 'control of the site and its data']} fontSize={40 / 1.32} inkPx={2.2} at={B.L2} leader={[ICON[0] + 10, 1150]} seed="s2L2" />
        <defs>
          <clipPath id="s2sheet" clipPathUnits="userSpaceOnUse">
            <rect x={SHEET_IN[0]} y={SHEET_IN[1]} width={SHEET_IN[2]} height={SHEET_IN[3]} />
          </clipPath>
        </defs>
        <g clipPath="url(#s2sheet)">
          <DiagramHand x={THUMB_W[0]} y={THUMB_W[1] - 3} angle={-36} scale={0.82} enterAt={B.handIn} from={520} turnAt={B.take} turnDeg={34} exitAt={B.handOut} seed="s2hand" />
        </g>
        <Pip />
      </XG>
    </World>
  );
};
export default Scene02;
