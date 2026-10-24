// S09 Part B (TerraceHill hill mode, world = canvas px at rest): the hidden match on door #4 at zoom 6, the pull-back up
// a hillside of ~650 doors, the still PEAK-3 vista. The A2 actors (crate, fallen old lock, Bit on the door frame, the
// keeper) are the SAME <A2Actors/> drawn through the hidden-cut map (a2ToBMat), standing on the SAME A2 stoop and plinth
// ledge (matchcut.tsx A2Ground), and house #4's door is A2's door until it turns 'fixed' (DoorMatch), so the cut holds;
// the keeper then walks to door #5 on a dotted path and kneels. Pip leaves the map on 'install' and hops onto a
// SCREEN-space bollard in the plaza at the near right (constant size 0.75), where the snail gives Bit the slowest ride on
// the hill; as the tram comes in he leaps up onto its roof (the Wiper carries him into S10).

import React from 'react';
import {Fill, Ink, Sun, Bird, palette, useTime, ease as E, prog, lerp, clamp, mat, XG, rand, line, polyPath} from '../../lib';
import {Elephant, hop, popSwitch} from '../../lib/mascot';
import {TerraceHill, TERRACE, terraceDoor, LayerWrap} from '../shared/sets';
import {Bit, Snail} from '../shared/props';
import {B} from './beats';
import {a2ToB, a2ToBMat, camAt, toScreen} from './camera';
import {A2Actors, PA, pipA, PipFigure} from './PartA';
import {A2Ground, DoorMatch} from './matchcut';
import {BigTags} from './tags';
import {Glint} from './shims';

// ---------------------------------------------------------------- small B-world beats

/** The keeper's dotted path from door #4 to door #5, drawn on behind him. */
const KeeperPath: React.FC = () => {
  const t = useTime();
  if (t < B.path) return null;
  const x0 = a2ToB([PA.keeper.x, PA.keeper.y])[0] - 4;
  const x1 = a2ToB(PA.keeperTo)[0];
  const y = a2ToB([0, PA.keeper.y])[1] + 3;
  // the keeper's x now (same walk as Keeper: linear from B.to over (kneel - to))
  const kx = lerp(x0 + 4, x1, clamp((t - B.to) / (B.kneel - B.to)));
  const reach = Math.max(x0, kx - 8);
  let d = '';
  for (let x = x0; x <= reach; x += 5) d += `M${(x - 1.2).toFixed(1)} ${y.toFixed(1)}h2.4`;
  return d ? <path d={d} stroke={palette.ink} strokeWidth={1.9} strokeLinecap="round" fill="none" /> : null;
};

/** One ink ring pulse around the check flag (scale-out, the stroke thins to nothing: no fade). */
const RingPulse: React.FC<{x: number; y: number; r: number; at: number; w?: number}> = ({x, y, r, at, w = 2.4}) => {
  const t = useTime();
  const p = prog(t, at, 0.32, E.outCubic);
  if (t < at || p >= 1) return null;
  return <circle cx={x} cy={y} r={r * (0.6 + 0.9 * p)} fill="none" stroke={palette.ink} strokeWidth={w * (1 - p)} />;
};

/** Far-row window dots that twinkle (cream pops for 3 frames) on 'server' and as the keeper kneels. */
const TWINKLES: {x: number; y: number; s: number; at: number}[] = (() => {
  const out: {x: number; y: number; s: number; at: number}[] = [];
  const rows = TERRACE.rows;
  for (let i = 0; i < 24; i++) {
    const k = 5 + Math.floor(rand('s9tw', `k${i}`) * 4);
    const R = rows[Math.min(k, rows.length - 1)];
    const x = 90 + rand('s9tw', `x${i}`) * 900;
    const at = (i % 3 === 0 ? B.server + 0.05 : i % 3 === 1 ? B.kneel : B.snail + 0.1) + rand('s9tw', `t${i}`) * 0.2;
    out.push({x, y: R.top + R.h * 0.32, s: Math.max(3.2, 22 * R.s), at});
  }
  return out;
})();

const Twinkles: React.FC = () => {
  const t = useTime();
  let d = '';
  for (const w of TWINKLES) if (t >= w.at && t < w.at + 0.1) d += `M${w.x.toFixed(1)} ${w.y.toFixed(1)}h${w.s.toFixed(1)}v${(w.s * 0.6).toFixed(1)}h${(-w.s).toFixed(1)}Z`;
  return d ? <path d={d} fill={palette.cream} /> : null;
};

/** Pigeons on the roof lines of rows 4-5 (TERRACE.rows[k].top). */
const PIGEONS: [number, number][] = [
  [262, TERRACE.rows[4].top],
  [292, TERRACE.rows[4].top + 1],
  [318, TERRACE.rows[4].top],
  [826, TERRACE.rows[5].top],
];

/** Peach rims on the ridge houses as the sun crests on 'server': short sun-side strips on the top band's roofline either
 *  side of the sun (snap pops, 0.03 s apart outward from the sun). [x, w]. */
const RIDGE_RIMS: [number, number][] = [
  [522, 22],
  [858, 26],
  [470, 18],
  [904, 20],
  [418, 16],
  [950, 18],
];
const RidgeRims: React.FC = () => {
  const t = useTime();
  if (t < B.server) return null;
  const top = TERRACE.ridge;
  let d = '';
  RIDGE_RIMS.forEach(([x, w], i) => {
    if (t >= B.server + Math.floor(i / 2) * 0.03) d += `M${x} ${top - 1}h${w}v5h${-w}Z`;
  });
  return <Fill d={d} color={palette.peach} offset={false} mode="snap" seed="s9ridgeRims" />;
};

/** The cream light path from the fixed door ends on the near pavement (y ~1700, a rounded pool end) instead of
 *  running out of the frame bottom like a beam. */
const PATH_END = polyPath([[488, 1692], [530, 1716], [572, 1692], [618, 2084], [442, 2084]]);

// ---------------------------------------------------------------- the near layer (SCREEN space, in the plaza)

/** A sand stone post with a tealDark cap slab on a short kerb that runs off the right edge (screen px). Pip sits on the
 *  cap; the snail crawls along its front edge. Clear of the right stander (x ~650-750) and of the row-0 doors. */
export const NEAR = {
  bollard: {x: 880, y: 1600, w: 86, h: 98},
  pip: {x: 884, scale: 0.75},
  snail: {x: 852, size: 26},
};
const CAP = NEAR.bollard.y - NEAR.bollard.h; // 1502: the cap's top
const BOLLARD_RISE = B.install - 0.36;
const NW = 4.4;

const NEAR_GEO = (() => {
  const {x, y, w} = NEAR.bollard;
  const x0 = x - w / 2;
  const capH = 14;
  return {
    kerbTop: polyPath([[806, 1584], [1140, 1598], [1140, 1622], [800, 1606]]),
    kerbFace: polyPath([[800, 1606], [1140, 1622], [1140, 1672], [800, 1652]]),
    kerbInk: line(806, 1584, 1140, 1598, {seed: 's9k/1', over: [3, 0], breaks: false}) + line(800, 1606, 1140, 1622, {seed: 's9k/2', over: [2, 0], breaks: false}) + line(800, 1652, 1140, 1672, {seed: 's9k/3', over: [0, 0], breaks: false}) + `M806 1584L800 1606L800 1652`,
    body: [x0, CAP + capH, w, y - CAP - capH] as [number, number, number, number],
    shade: [x0, CAP + capH, w * 0.24, y - CAP - capH] as [number, number, number, number],
    foot: [x0 - 6, y - 10, w + 12, 10] as [number, number, number, number],
    cap: [x0 - 8, CAP, w + 16, capH] as [number, number, number, number],
    ink:
      line(x0, CAP + capH, x0, y - 10, {seed: 's9b/l', over: [0, 0], breaks: false}) +
      line(x0 + w, CAP + capH, x0 + w, y - 10, {seed: 's9b/r', over: [0, 0], breaks: false}) +
      line(x0 - 10, CAP, x0 + w + 10, CAP, {seed: 's9b/ct', over: [3, 4], breaks: false}) +
      line(x0 - 8, CAP + capH, x0 + w + 9, CAP + capH, {seed: 's9b/cb', over: [1, 2], breaks: false}) +
      `M${x0 - 8} ${CAP}V${CAP + capH}M${x0 + w + 8} ${CAP}V${CAP + capH}` +
      line(x0 - 7, y - 10, x0 + w + 8, y - 10, {seed: 's9b/f', over: [2, 2], breaks: false}) +
      `M${x0 - 6} ${y - 10}V${y}M${x0 + w + 6} ${y - 10}V${y}`,
  };
})();

const NearLayer: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const t = useTime();
  if (t < BOLLARD_RISE) return <>{children}</>;
  const rise = E.outExpo(prog(t, BOLLARD_RISE, 0.33));
  const dy = (1 - rise) * 200;
  const G = NEAR_GEO;
  const crawlAt = B.snail;
  const snailX = NEAR.snail.x - Math.max(0, t - crawlAt) * 7;
  return (
    <>
      <XG m={mat.translate(0, dy)}>
        <Fill d={G.kerbTop} color={palette.sand} offset={false} mode="snap" seed="s9kerbT" />
        <Fill d={G.kerbFace} color={palette.tan} offset={false} mode="snap" seed="s9kerbF" />
        <Ink d={G.kerbInk} width={NW} taper={false} seed="s9kerbI" />
        <Fill rect={G.body} color={palette.sand} seed="s9post/b" />
        <Fill rect={G.shade} color={palette.tan} offset={false} mode="snap" seed="s9post/s" />
        <Fill rect={G.foot} color={palette.sand} offset={false} mode="snap" seed="s9post/f" />
        <Fill rect={G.cap} color={palette.tealDark} seed="s9post/c" />
        <Ink d={G.ink} width={NW} taper={false} seed="s9post/i" />
        <Snail x={NEAR.snail.x} y={CAP + 1} size={NEAR.snail.size} popAt={B.tags - 0.3} crawl={{at: crawlAt, speed: 7}} flip depth="mid" seed="s9snail" />
        {t >= B.tags - 0.26 ? <Bit x={snailX + 1} y={CAP + 1 - 16.8} size={14} state="ride" flip hopAt={B.tags - 0.26} hopH={0.6} seed="s9bitB" /> : null}
      </XG>
      {children}
    </>
  );
};

// ---------------------------------------------------------------- Pip in Part B (screen space)

const PipB: React.FC = () => {
  const t = useTime();
  const t0 = B.install;
  const air = 0.42;
  const mapped = (tt: number) => {
    const st = pipA(tt);
    const c = camAt(tt);
    const [sx, sy] = toScreen(c, a2ToB([st.x, st.y]));
    return {st, x: sx, y: sy, scale: PA.pip.scale * 0.25 * c.zoom};
  };
  if (t < t0) {
    const m = mapped(t);
    const crouch = t >= t0 - 0.14 ? 0.18 * Math.sin(((t - (t0 - 0.14)) / 0.14) * (Math.PI / 2)) : 0;
    return <PipFigure st={{...m.st, x: m.x, y: m.y, squash: m.st.squash + crouch}} scale={m.scale} t={t} />;
  }
  const to = {x: NEAR.pip.x, y: CAP + 1};
  // the boarding: crouch, then a big leap straight up past the tram's roof line (screen y 600) before its nose reaches
  // him; he lands on the roof at boardLand, where the Wiper takes over
  if (t >= B.board - 0.14) {
    if (t >= B.boardLand) return null;
    if (t < B.board) {
      // the crouch (anticipation) on the post
      const a = (t - (B.board - 0.14)) / 0.14;
      return <Elephant x={to.x} y={to.y} scale={NEAR.pip.scale} pose="sit-back" look={-0.4} squash={0.22 * Math.sin((a * Math.PI) / 2)} t={t} seed={9} />;
    }
    // straight up, decelerating to 14 px above the roof line, then down onto it (feet never above y 586: his head stays
    // under the caption box)
    const k = (t - B.board) / (B.boardLand - B.board);
    const up = 0.78;
    const y = k < up ? lerp(to.y, 586, 1 - Math.pow(1 - k / up, 2)) : lerp(586, 602, Math.pow((k - up) / (1 - up), 2));
    const squash = k < 0.3 ? -0.22 * (1 - k / 0.3) - 0.04 : -0.04;
    return <Elephant x={to.x} y={y} scale={NEAR.pip.scale} pose="stand-side" amount={Math.sqrt(Math.sin(Math.PI * Math.min(1, k)))} squash={squash} look={-0.4} t={t} seed={9} />;
  }
  const m0 = mapped(t0);
  const h = hop({t, t0, dur: air, from: {x: m0.x, y: m0.y}, to, height: 46});
  const k = clamp((t - t0) / air);
  const scale = lerp(m0.scale, NEAR.pip.scale, E.inOutSine(k));
  if (h.k < 1) {
    return <Elephant x={h.x} y={h.y} scale={scale} pose="stand-side" amount={h.spread} squash={h.squash} rotate={h.rotate} t={t} seed={9} />;
  }
  // on the post, watching the hill; the sigh (a quick sit-back squash pulse before the boarding crouch)
  const sigh = t >= B.sigh ? 0.08 * Math.sin(Math.min(1, (t - B.sigh) / 0.16) * Math.PI) : 0;
  // he looks up the hill at the flag on 'single', then along the rows of empty tags on 'server'
  const look = t < B.single + 0.1 ? -0.25 : t < B.server + 0.18 ? -0.7 : 0.45;
  const turn = popSwitch(t, B.single + 0.1) * 0.6 + popSwitch(t, B.server + 0.18) * 0.6;
  return <Elephant x={to.x} y={to.y} scale={NEAR.pip.scale} pose="sit-back" look={look} squash={h.squash + sigh + turn} t={t} seed={9} />;
};

// ---------------------------------------------------------------- Part B

export const PartBWorld: React.FC = () => {
  const t = useTime();
  const sunCrest = B.server;
  const sun =
    t >= sunCrest - 0.5 ? (
      <Sun
        cx={TERRACE.sun.x}
        cy={910}
        r={TERRACE.sun.r}
        drift={[0, 0]}
        moves={[
          {at: sunCrest - 0.34, dur: 0.34, y: TERRACE.sun.y, ease: E.outCubic},
          {at: B.end, dur: 0.56, r: 110, ease: E.inOutSine},
        ]}
        hops={[{t: B.end, to: [500, 690], air: 0.56, h: 60}]}
      />
    ) : null;
  const F = TERRACE.flag;
  const d3 = terraceDoor(0, -1);
  const fixed = t >= B.single;
  const wrap: LayerWrap = (name, _n, node) => {
    if (name === 'street') return fixed ? (
      <>
        {node}
        <Fill d={PATH_END} color={palette.mintPale} offset={false} mode="snap" seed="s9pathEnd" />
      </>
    ) : node;
    if (name === 'house4')
      return (
        <>
          {node}
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
      <TerraceHill
        revealFloor={TERRACE.revealFloor}
        plaqueWaveAt={B.to}
        waveStep={0.09}
        extendAt={B.every}
        flagAt={B.single - 0.1}
        fixedAt={B.single}
        checkBoxWaveAt={B.tags}
        checkBoxStep={0.075}
        house4Lock={{checkAt: B.check}}
        people={{riseAt: 3.55}}
        sun={sun}
        wrap={wrap}
        seed="terr"
      />
      {t >= B.tags ? <BigTags at={B.tags} step={0.075} /> : null}
      <RidgeRims />
      <KeeperPath />
      <XG m={a2ToBMat}>
        <A2Actors pip={false} />
      </XG>
      <Glint x={d3.plaque[0]} y={d3.plaque[1]} r={7} at={B.path} dur={0.3} ink={0.9} />
      <RingPulse x={F.x + F.size / 2} y={F.y - F.pole + F.size * 0.34} r={46} at={B.single + 0.02} />
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
  </NearLayer>
);
