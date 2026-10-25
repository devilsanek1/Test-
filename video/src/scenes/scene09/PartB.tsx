// S09 Part B (TerraceHill hill mode, world = canvas px at the set's rest; S09's rest camera sits 70 px higher, camera.ts
// REST_DY): the hidden match on door #4 at zoom 6, the 'to install' build (ghost.tsx), the pull-back up a hillside of
// ~650 doors, the still PEAK-3 vista. The A2 actors (crate, fallen old lock, Bit on the door frame, the keeper) are the
// SAME <A2Actors/> drawn through the hidden-cut map (a2ToBMat), standing on the SAME A2 stoop and plinth ledge
// (matchcut.tsx A2Ground), and house #4's door is A2's door until it turns 'fixed' (DoorMatch), so the cut holds; the
// keeper then walks to door #5 on a dotted path and kneels. The hillside itself is the scene's (hill.tsx: terraces,
// bow, stairs, ridge), drawn in place of the set's 'hill' layer. Pip leaves the map on 'install' and hops onto a
// SCREEN-space stone pier at the near right (constant size 0.75) that ends a frontal balustrade cut by the frame (the near
// framing), where the snail gives Bit the slowest ride on the hill; as the tram comes in he leaps up onto its roof (the
// Wiper carries him into S10).

import React from 'react';
import {Fill, Ink, Sun, Bird, Tod, palette, useTime, ease as E, prog, lerp, clamp, mat, XG, rand, line, sunPoseAt, polyPath} from '../../lib';
import {Elephant, hop, popSwitch} from '../../lib/mascot';
import type {PoseName} from '../../lib/mascot';
import {TerraceHill, TERRACE, terraceDoor, LayerWrap, HALF} from '../shared/sets';
import type {WalkerAnchor} from '../shared/sets';
import {Bit, Snail} from '../shared/props';
import {B} from './beats';
import {a2ToB, a2ToBMat, camAt, toScreen} from './camera';
import {A2Actors, PA, pipA, pipRidePoint} from './PartA';
import {A2Ground, DoorMatch} from './matchcut';
import {Glint} from './shims';
import {A2Ghost} from './ghost';
import {bowAt, FixedPool, Hill, House4Tag, HROWS, SUN_CREST} from './hill';

// ---------------------------------------------------------------- small B-world beats

/** The keeper's dotted path from door #4 to door #5, drawn on behind him (3 px dashes on screen). */
const KeeperPath: React.FC = () => {
  const t = useTime();
  if (t < B.path) return null;
  const zoom = camAt(t).zoom;
  const x0 = a2ToB([PA.keeper.x, PA.keeper.y])[0] - 4;
  const x1 = a2ToB(PA.keeperTo)[0];
  const y = a2ToB([0, PA.keeper.y])[1] + 3;
  // the keeper's x now (same walk as Keeper: linear from B.to over (kneel - to))
  const kx = lerp(x0 + 4, x1, clamp((t - B.to) / (B.kneel - B.to)));
  const reach = Math.max(x0, kx - 10);
  let d = '';
  for (let x = x0; x <= reach; x += 7) d += `M${(x - 1.8).toFixed(1)} ${y.toFixed(1)}h3.6`;
  return d ? <path d={d} stroke={palette.ink} strokeWidth={Math.max(1.2, 3 / zoom)} strokeLinecap="round" fill="none" /> : null;
};

/** One ink ring pulse around the check flag (scale-out, the stroke thins to nothing: no fade). */
const RingPulse: React.FC<{x: number; y: number; r: number; at: number; w?: number}> = ({x, y, r, at, w = 2.4}) => {
  const t = useTime();
  const p = prog(t, at, 0.32, E.outCubic);
  if (t < at || p >= 1) return null;
  return <circle cx={x} cy={y} r={r * (0.6 + 0.9 * p)} fill="none" stroke={palette.ink} strokeWidth={w * (1 - p)} />;
};

/** The flag's pole, re-drawn over row 1's ledge (the set's pole runs under it): from door #4's cornice up to the flag,
 *  2.2 px ink, drawing on with the raise, so the flag plainly belongs to the fixed door. */
const FLAG_AT = B.single - 0.27;
const FlagPole: React.FC = () => {
  const t = useTime();
  if (t < FLAG_AT) return null;
  const F = TERRACE.flag;
  const zoom = camAt(t).zoom;
  return <Ink d={line(F.x, F.y + 1, F.x, F.y - F.pole - 2, {over: [0, 0], seed: 's9flagpole'})} at={FLAG_AT} dur={0.1} width={Math.max(1.6, 2.2 / zoom)} taper={false} seed="s9flagpole" />;
};

/** Far-row window dots that twinkle (cream pops for 3 frames) on 'server' and as the keeper kneels. */
const TWINKLES: {x: number; y: number; s: number; at: number}[] = (() => {
  const out: {x: number; y: number; s: number; at: number}[] = [];
  const rows = HROWS;
  for (let i = 0; i < 24; i++) {
    const k = 5 + Math.floor(rand('s9tw', `k${i}`) * 3);
    const R = rows[Math.min(k, rows.length - 1)];
    const x = 90 + rand('s9tw', `x${i}`) * 900;
    const at = (i % 3 === 0 ? B.server + 0.05 : i % 3 === 1 ? B.kneel : B.snail + 0.1) + rand('s9tw', `t${i}`) * 0.2;
    out.push({x, y: R.top + R.h * 0.32 + bowAt(k, x), s: Math.max(3.2, 22 * R.s), at});
  }
  return out;
})();

const Twinkles: React.FC = () => {
  const t = useTime();
  let d = '';
  for (const w of TWINKLES) if (t >= w.at && t < w.at + 0.1) d += `M${w.x.toFixed(1)} ${w.y.toFixed(1)}h${w.s.toFixed(1)}v${(w.s * 0.6).toFixed(1)}h${(-w.s).toFixed(1)}Z`;
  return d ? <path d={d} fill={palette.cream} /> : null;
};

/** Pigeons on the roof lines of rows 4-5 (bowed). */
const PIGEONS: [number, number][] = [
  [262, HROWS[4].top + bowAt(4, 262)],
  [292, HROWS[4].top + 1 + bowAt(4, 292)],
  [318, HROWS[4].top + bowAt(4, 318)],
  [826, HROWS[5].top + bowAt(5, 826)],
];

// ---------------------------------------------------------------- the street: re-toned, standers + their long shadows

/** The terrace street takes A2's pavement tone (HALF.daySky, one step under mintPale): the ground value holds across the
 *  'to' build, and at rest the bottom band is no longer the frame's brightest field (it merged with the white paint
 *  edge). */
const STREET_TONE = (c: string) => (c && c.toUpperCase() === palette.mintPale.toUpperCase() ? HALF.daySky : c);

/** Two back-view standers, small against the hill (~140 px at rest: hill:figure >= 6:1), looking up it: one ON the VP
 *  axis under the fixed door, one to the left; feet at screen ~1780 / 1760 (world - 70). */
const STANDERS: WalkerAnchor[] = [
  {x: 300, y: 1690, h: 132, go: 'stand', body: palette.sand, hair: 'bun', acc: ['backpack']},
  {x: 540, y: 1712, h: 142, go: 'stand', body: palette.teal, hair: 'short', acc: ['scarf']},
];
const STANDERS_RISE = 3.55;
/** Their flat long shadows fall TOWARD the camera (the sun is behind the ridge at SUN_CREST): a darker street step from
 *  the feet, fanning away from the sun, ~1.35 x the height (cut by the frame bottom). */
const SHADOWS = (() => {
  const [sx, sy] = [SUN_CREST.x, SUN_CREST.y];
  let d = '';
  for (const s of STANDERS) {
    const dx = s.x - sx;
    const dy = s.y - sy;
    const L = Math.hypot(dx, dy);
    const ux = dx / L;
    const uy = dy / L;
    const len = s.h * 1.35;
    const w0 = s.h * 0.13;
    const w1 = s.h * 0.2;
    const ex = s.x + ux * len;
    const ey = s.y + uy * len;
    d += polyPath([
      [s.x - w0 * uy - 2, s.y - 3],
      [s.x + w0 * uy + 2, s.y - 3],
      [ex + w1 * uy, ey - w1 * ux * 0.2],
      [ex - w1 * uy, ey + w1 * ux * 0.2],
    ]);
  }
  return d;
})();
const Shadows: React.FC = () => {
  const t = useTime();
  if (t < STANDERS_RISE + 0.05) return null;
  return <Fill d={SHADOWS} color={palette.sky} offset={false} mode="snap" seed="s9shadows" />;
};

// ---------------------------------------------------------------- the near layer (SCREEN space): pier + balustrade

/** A stone pier (frontal: horizontal cap and joints) at the near right, cut by the frame bottom, ending a balustrade that
 *  runs off the right edge (the PEAK's near framing: ~22 % of the bottom edge, 4.8 px ink, consistent with the hill's
 *  frontal elevation). Pip sits on the pier's cap; the snail crawls along its front edge. */
export const NEAR = {
  pier: {x: 884, top: 1480, w: 88},
  pip: {x: 884, scale: 0.75},
  snail: {x: 856, size: 26},
  rail: {top: 1716, base: 1880, x1: 1100},
};
const CAP = NEAR.pier.top;
const BOLLARD_RISE = B.install - 0.36;
const NW = 4.8;

const NEAR_GEO = (() => {
  const {x, top, w} = NEAR.pier;
  const x0 = x - w / 2;
  const capH = 18;
  const bottom = 1960;
  const R = NEAR.rail;
  const rx0 = x0 + w;
  // balusters: narrow sand posts with a waist, every 34 px
  let bal = '';
  let balInk = '';
  for (let bx = rx0 + 22; bx < R.x1; bx += 34) {
    const y0 = R.top + 18;
    const y1 = R.base;
    const p = polyPath([
      [bx - 7, y0],
      [bx + 7, y0],
      [bx + 4, (y0 + y1) / 2],
      [bx + 8, y1],
      [bx - 8, y1],
      [bx - 4, (y0 + y1) / 2],
    ]);
    bal += p;
    balInk += `M${bx - 7} ${y0}L${bx - 4} ${(y0 + y1) / 2}L${bx - 8} ${y1}M${bx + 7} ${y0}L${bx + 4} ${(y0 + y1) / 2}L${bx + 8} ${y1}`;
  }
  return {
    body: [x0, top + capH, w, bottom - top - capH] as [number, number, number, number],
    shade: [x0, top + capH, w * 0.24, bottom - top - capH] as [number, number, number, number],
    band: [x0 - 4, top + 120, w + 8, 12] as [number, number, number, number],
    cap: [x0 - 9, top, w + 18, capH] as [number, number, number, number],
    coping: [rx0 - 2, R.top, R.x1 - rx0 + 2, 18] as [number, number, number, number],
    plinth: [rx0 - 2, R.base, R.x1 - rx0 + 2, 60] as [number, number, number, number],
    bal,
    ink:
      line(x0, top + capH, x0, bottom, {seed: 's9p/l', over: [0, 0], breaks: false}) +
      line(x0 + w, top + capH, x0 + w, R.top, {seed: 's9p/r', over: [0, 0], breaks: false}) +
      line(x0 - 11, top, x0 + w + 11, top, {seed: 's9p/ct', over: [3, 4], breaks: false}) +
      line(x0 - 9, top + capH, x0 + w + 10, top + capH, {seed: 's9p/cb', over: [1, 2], breaks: false}) +
      `M${x0 - 9} ${top}V${top + capH}M${x0 + w + 9} ${top}V${top + capH}` +
      line(x0 - 4, top + 120, x0 + w + 4, top + 120, {seed: 's9p/b1', over: [2, 2], breaks: false}) +
      line(x0 - 4, top + 132, x0 + w + 4, top + 132, {seed: 's9p/b2', over: [2, 2], breaks: false}) +
      // the balustrade: coping top + bottom, base rail
      line(rx0 - 2, R.top, R.x1, R.top, {seed: 's9r/ct', over: [0, 0], breaks: false}) +
      line(rx0, R.top + 18, R.x1, R.top + 18, {seed: 's9r/cb', over: [0, 0], breaks: false}) +
      line(rx0, R.base, R.x1, R.base, {seed: 's9r/b', over: [0, 0], breaks: false}),
    joints: `M${x0 + w * 0.5} ${top + 60}v-24M${x0 + w * 0.3} ${top + 190}v-26M${x0 + w * 0.7} ${top + 300}v-28M${x0 + w * 0.42} ${top + 400}v-24`,
    balInk,
  };
})();

const NearLayer: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const t = useTime();
  if (t < BOLLARD_RISE) return <>{children}</>;
  const rise = E.outExpo(prog(t, BOLLARD_RISE, 0.33));
  const dy = (1 - rise) * 520;
  const G = NEAR_GEO;
  const crawlAt = B.snail;
  const snailX = NEAR.snail.x - Math.max(0, t - crawlAt) * 7;
  return (
    <>
      <XG m={mat.translate(0, dy)}>
        <Fill rect={G.coping} color={palette.sand} seed="s9rail/c" />
        <Fill d={G.bal} color={palette.cream} offset={false} mode="snap" seed="s9rail/b" />
        <Fill rect={G.plinth} color={palette.tan} offset={false} mode="snap" seed="s9rail/p" />
        <Ink d={G.balInk} width={NW * 0.62} taper={false} seed="s9rail/bi" />
        <Fill rect={G.body} color={palette.sand} seed="s9pier/b" />
        <Fill rect={G.shade} color={palette.tan} offset={false} mode="snap" seed="s9pier/s" />
        <Fill rect={G.band} color={palette.tan} offset={false} mode="snap" seed="s9pier/bd" />
        <Fill rect={G.cap} color={palette.tealDark} seed="s9pier/c" />
        <Ink d={G.ink} width={NW} taper={false} seed="s9pier/i" />
        <Ink d={G.joints} width={NW * 0.5} taper={false} seed="s9pier/j" />
        <Snail x={NEAR.snail.x} y={CAP + 1} size={NEAR.snail.size} popAt={B.tags - 0.3} crawl={{at: crawlAt, speed: 7}} flip depth="mid" seed="s9snail" />
        {t >= SNAIL_HOP + SNAIL_HOP_DUR ? <Bit x={snailX + 1} y={CAP + 1 - 16.8} size={BIT_SNAIL} state="ride" flip hopAt={SNAIL_HOP + SNAIL_HOP_DUR - 0.3} hopH={0} seed="s9bit" /> : null}
      </XG>
      {children}
    </>
  );
};

// ---------------------------------------------------------------- Pip + Bit in Part B (screen space)

/** Pip in Part B's screen space from his 'install' hop on (before it he is an A2 actor drawn through the map, so the
 *  hidden cut holds him to the pixel): the hop off the mapped ledge onto the pier (his line weight and size ease from
 *  the map's to the screen's), sitting on the pier, the boarding leap. `lw` = Elephant lineWeight. */
type PipShot = {x: number; y: number; scale: number; pose: PoseName; squash: number; rotate: number; amount?: number; look?: number; lw: number};

/** The boarding (fix round 2b): the sigh, then a crouch, then the take-off ~0.04 s before the tram's nose enters, so the
 *  ~880 px rise to the roof spans 8 frames (<= ~150 px/frame, a stretched leap on the fastest frames) and he is above the
 *  roof line before the nose reaches his x (~5.11 s); he lands on the roof at boardLand (the Wiper's hand-over). */
const SIGH_AT = B.sigh - 0.19;
const CROUCH_AT = B.board - 0.25;
const TAKEOFF = B.board - 0.15;
const APEX_AT = B.boardLand - 0.05;
const ROOF_Y = 602;

function pipShot(t: number): PipShot | null {
  const t0 = B.install;
  if (t < t0) return null;
  const air = 0.42;
  const to = {x: NEAR.pip.x, y: CAP + 1};
  if (t >= CROUCH_AT) {
    if (t >= B.boardLand) return null;
    if (t < TAKEOFF) {
      const a = (t - CROUCH_AT) / (TAKEOFF - CROUCH_AT);
      return {x: to.x, y: to.y, scale: NEAR.pip.scale, pose: 'sit-back', look: -0.4, squash: 0.24 * Math.sin((a * Math.PI) / 2), rotate: 0, lw: 1};
    }
    // up: a near-constant-speed rise (no full stop before the roof), easing only over its last frames; the apex is
    // the roof line itself, then a 2-frame settle onto it
    if (t < APEX_AT) {
      const k = (t - TAKEOFF) / (APEX_AT - TAKEOFF);
      const f = 1 - Math.pow(1 - k, 1.35);
      const y = lerp(to.y, ROOF_Y - 10, f);
      const squash = k < 0.55 ? -0.3 * (1 - k / 0.55) - 0.05 : -0.05;
      return {x: to.x, y, scale: NEAR.pip.scale, pose: 'stand-side', amount: Math.sqrt(Math.min(1, k * 1.4)), squash, look: -0.4, rotate: 0, lw: 1};
    }
    const k = (t - APEX_AT) / (B.boardLand - APEX_AT);
    return {x: to.x, y: lerp(ROOF_Y - 10, ROOF_Y, k * k), scale: NEAR.pip.scale, pose: 'stand-side', amount: 1, squash: -0.04, look: -0.4, rotate: 0, lw: 1};
  }
  const st0 = pipA(t0);
  const c0 = camAt(t0);
  const [x0, y0] = toScreen(c0, a2ToB([st0.x, st0.y]));
  const s0 = PA.pip.scale * 0.25 * c0.zoom;
  const h = hop({t, t0, dur: air, from: {x: x0, y: y0}, to, height: 46});
  const k = clamp((t - t0) / air);
  const e = E.inOutSine(k);
  if (h.k < 1) return {x: h.x, y: h.y, scale: lerp(s0, NEAR.pip.scale, e), pose: 'stand-side', amount: h.spread, squash: h.squash, rotate: h.rotate, lw: lerp(0.25 * c0.zoom, 1, e)};
  // on the pier, watching the hill; the sigh (a slow sit-back squash pulse) before the boarding crouch
  const sigh = t >= SIGH_AT ? 0.09 * Math.sin(Math.min(1, (t - SIGH_AT) / 0.2) * Math.PI) : 0;
  // he looks up the hill at the flag on 'single', then along the rows of empty tags on 'server'
  const look = t < B.single + 0.1 ? -0.25 : t < B.server + 0.18 ? -0.7 : 0.45;
  const turn = popSwitch(t, B.single + 0.1) * 0.6 + popSwitch(t, B.server + 0.18) * 0.6;
  // Bit hops off his head onto the snail: a little push-off squash
  const push = t >= SNAIL_HOP && t < SNAIL_HOP + 0.1 ? 0.06 * Math.sin(((t - SNAIL_HOP) / 0.1) * Math.PI) : 0;
  return {x: to.x, y: to.y, scale: NEAR.pip.scale, pose: 'sit-back', look, squash: h.squash + sigh + turn + push, rotate: 0, lw: 1};
}

const PipB: React.FC = () => {
  const t = useTime();
  const p = pipShot(t);
  if (!p) return null;
  return <Elephant x={p.x} y={p.y} scale={p.scale} pose={p.pose} amount={p.amount} squash={p.squash} rotate={p.rotate} look={p.look} lineWeight={p.lw} t={t} seed={9} />;
};

/** Bit hops off Pip's head onto the snail's shell (the snail has popped onto the cap at tags-0.30). */
const SNAIL_HOP = B.tags - 0.26;
const SNAIL_HOP_DUR = 0.24;
const BIT_SNAIL = 14;
const snailShell = (t: number): [number, number] => [NEAR.snail.x - Math.max(0, t - B.snail) * 7 + 1, CAP + 1 - 16.8];

/** Bit riding Pip in screen space (from Pip's 'install' hop: BitOnPip in PartA carried him until then), then the hop
 *  down onto the snail; NearLayer draws him riding the snail from the landing. One Bit at any time. */
const BitRide: React.FC = () => {
  const t = useTime();
  if (t < B.install || t >= SNAIL_HOP + SNAIL_HOP_DUR) return null;
  const p = pipShot(t);
  if (!p) return null;
  const head = pipRidePoint({x: p.x, y: p.y, pose: p.pose, squash: p.squash, rotate: p.rotate}, p.scale);
  const s0 = PA.bitSize * 0.25 * camAt(B.install).zoom;
  const size = lerp(s0, BIT_SNAIL, E.inOutSine(clamp((t - B.install) / 0.42)));
  if (t < SNAIL_HOP) return <Bit x={head[0]} y={head[1]} size={size} state="ride" rot={p.rotate} seed="s9bit" />;
  const q = (t - SNAIL_HOP) / SNAIL_HOP_DUR;
  const [sx, sy] = snailShell(t);
  return <Bit x={lerp(head[0], sx, q)} y={lerp(head[1], sy, q) - Math.sin(Math.PI * q) * 34} size={BIT_SNAIL} state="hop" flip rot={-20 + 30 * q} seed="s9bit" />;
};

// ---------------------------------------------------------------- Part B

export const PartBWorld: React.FC = () => {
  const t = useTime();
  const sunCrest = B.server;
  // the sun crests the ridge ON 'server' at SUN_CREST (screen (700, 775) at rest, top 625); on the cut it takes off
  // toward S10's slot (screen (500, 690) = world (500, 620)), shrinking r 150 -> 110 out-cubic, a low hop (S10's numbers).
  // The take-off's anticipation squash is anchored at the disc's bottom: held at its crest top through the anticipation.
  const sunMoves = [
    {at: sunCrest - 0.34, dur: 0.34, y: SUN_CREST.y, ease: E.outCubic},
    {at: B.end, dur: 0.56, r: 110, ease: E.outCubic},
  ];
  const sunHops = [{t: B.end, to: [500, 620] as [number, number], air: 0.56, h: 14}];
  const pose = sunPoseAt(t, {cx: SUN_CREST.x, cy: 910, r: SUN_CREST.r, moves: sunMoves, hops: sunHops});
  const hold = t >= B.end - 0.1 && t < B.end ? 2 * pose.r * (1 - pose.sq.sy) : 0;
  const sun =
    t >= sunCrest - 0.5 ? (
      <XG m={mat.translate(0, -hold)}>
        <Sun cx={SUN_CREST.x} cy={910} r={SUN_CREST.r} drift={[0, 0]} moves={sunMoves} hops={sunHops} />
      </XG>
    ) : null;
  const F = TERRACE.flag;
  const d3 = terraceDoor(0, -1);
  const wrap: LayerWrap = (name, _n, node) => {
    if (name === 'street')
      return (
        <Tod map={STREET_TONE}>
          {node}
          <FixedPool />
          <Shadows />
        </Tod>
      );
    // the scene's hillside replaces the set's rows (hill.tsx)
    if (name === 'hill') return <Hill />;
    if (name === 'house4')
      return (
        <>
          {node}
          <FlagPole />
          <House4Tag />
          <A2Ghost />
          <DoorMatch />
          <XG m={a2ToBMat}>
            <A2Ground />
          </XG>
        </>
      );
    return node;
  };
  return (
    <>
      <TerraceHill flagAt={FLAG_AT} fixedAt={B.single} house4Lock={{checkAt: B.check}} people={{walkers: STANDERS, riseAt: STANDERS_RISE}} sun={sun} wrap={wrap} seed="terr" />
      <KeeperPath />
      <XG m={a2ToBMat}>
        <A2Actors partB />
      </XG>
      <Glint x={d3.plaque[0]} y={d3.plaque[1]} r={7} at={B.path} dur={0.3} ink={0.9} />
      <RingPulse x={F.x + F.size / 2} y={F.y - F.pole + F.size * 0.34} r={46} at={B.single - 0.02} />
      <Twinkles />
      {/* a few pigeons perched on the terrace roofs lift off on 'server' and wheel away right, under the caption floor */}
      {PIGEONS.map((b, i) => (
        <Bird key={i} x={b[0]} y={b[1]} s={0.5} at={B.every + 0.1 + i * 0.05} flyAt={B.server + 0.06 + i * 0.07} flyTo={[520, -230]} color={i % 2 ? palette.sand : palette.white} seed={`s9pg${i}`} />
      ))}
    </>
  );
};

export const PartBScreen: React.FC = () => (
  <NearLayer>
    <PipB />
    <BitRide />
  </NearLayer>
);
