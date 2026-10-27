// V2S2_Set (lane L2): the S2 set, forked from the canal kit's S2Set (kit/canal/sets.tsx) for the shot's own layering and
// the owner's people rule. Changes from the kit set: the A-board slot is drawn BEFORE the newsstand (it slides out from
// behind the kiosk at 8.44); no kit near busts (the shot draws its own small head-backs, <= ~140 px wide); the passing
// boat enters far right from the VP side; the near lamp is lower (its arm stays below y 600); extra life slots.
// Times are FILM seconds (the scene wraps the set in <TimeShift by={-6.1}>).
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {line} from '../../lib/sketch';
import {Batch, Paint, ovalPath, P, Pt, shadowInto, lerp, rng, leafPath} from '../kit/canal/core';
import {Pigeons, Ducks, Movers, FallingLeaves} from '../kit/canal/life';
import {WingS2, s2x, s2y, s2g, s2u, StoryState} from '../kit/canal/wall';
import {Newsstand} from '../kit/canal/newsstand';
import {Planter, Bench, bikeInto, drainInto, binInto, Lamp} from '../kit/canal/towpath';
import {PerspBoat} from '../kit/canal/boat';
import * as MAP from '../world/map';
import {S2_BENCH, S2_BENCH_SEAT} from './V2S2_Layout';

// ---------------------------------------------------------------- S2

/** The S2 bench's seat line (the bench people sit on it, the backrest covers their lower backs). */
export {S2_BENCH_SEAT};

/** Our bank's water edge in S2 (the railing's foot) and the railing's top (a post at x 590 tops out at y 1050:
 *  Pip's seat, map S2.pipSeat). */
export const S2_BANK = {
  edge: (x: number) => lerp(1192, 1118, x / 1080),
  railTop: (x: number) => lerp(1072, 1032, x / 1080) + (x === 590 ? 0 : 0),
};
/** The far bank in S2: the wing's base, the far towpath (18 g deep) and its coping (6 g), per column position u. */
const s2FarCoping = (u: number) => s2y('base', u) + 24 * s2g(u);

export type V2S2SetProps = {
  story?: Record<string, StoryState>;
  staffCoolAt?: number;
  storyOverlay?: React.ComponentProps<typeof WingS2>['storyOverlay'];
  /** The A-board TOLD THE BBC + the newsagent: drawn BEFORE the kiosk so it slides out from behind it. */
  aBoard?: React.ReactNode;
  /** The bench people (K4 Reporter + Staffer), drawn before the bench's back view. */
  bench?: React.ReactNode;
  /** The newsagent, in front of the kiosk's corner (drawn after it). */
  agent?: React.ReactNode;
  /** Pip on the railing post: behind the bench people (the reporter's head may tuck under Pip's base). */
  pip?: React.ReactNode;
  /** Far-towpath and water life drawn behind our railing (walkers, a jogger, a cyclist). */
  farLife?: React.ReactNode;
  /** Our towpath's people (passers-by, the dog, head-backs cut by the bottom), drawn last (nearest). */
  near?: React.ReactNode;
  /** The passing boat: it enters at the VP side (u boatU0) at this film time and glides toward us at boatSpeed u/s. */
  boatAt?: number;
  boatU0?: number;
  boatSpeed?: number;
};

export const V2S2Set: React.FC<V2S2SetProps> = ({story, staffCoolAt, storyOverlay, aBoard, agent, bench, pip, farLife, near: nearPeople, boatAt = 7.0, boatU0 = 17, boatSpeed = 1.4}) => {
  const t = useTime();
  const uEnd = s2u(1120);
  const far = useMemo(() => {
    const b = new Batch();
    const r = rng('s2far');
    // the water: between the far coping and our edge
    const top: Pt[] = [];
    for (let u = -2.5; u <= uEnd; u += 0.25) top.push([s2x(u), s2FarCoping(u) - 2]);
    b.poly(CM.water, [...top, [1120, 1300], [-40, 1300]]);
    // the far towpath: paving band + coping + the coping's shade on the water
    const band = (a: (u: number) => number, c: (u: number) => number): Pt[] => {
      const p: Pt[] = [];
      for (let u = -2.5; u <= uEnd; u += 0.25) p.push([s2x(u), a(u)]);
      for (let u = uEnd; u >= -2.5; u -= 0.25) p.push([s2x(u), c(u)]);
      return p;
    };
    b.poly(CM.paving, band((u) => s2y('base', u) - 1, (u) => s2FarCoping(u) - 6 * s2g(u)));
    b.poly(CM.limestone, band((u) => s2FarCoping(u) - 6 * s2g(u), (u) => s2FarCoping(u)));
    b.poly(CM.waterDeep, band((u) => s2FarCoping(u), (u) => s2FarCoping(u) + 7 * s2g(u)));
    // reflections of the wing's lit windows and brick in the water (broken dashes under the far coping)
    b.layer();
    for (let u = -2; u < uEnd; u += 0.5) {
      const g = s2g(u);
      const x = s2x(u);
      const y0 = s2FarCoping(u) + 8 * g;
      for (let k = 0; k < 5; k++) {
        const yy = y0 + k * 9 * g;
        const w = r.range(20, 60) * g;
        if (r.chance(0.7)) b.rect(k % 2 ? CM.brickLight : r.chance(0.4) ? CM.lamp : CM.waterDeep, x - w / 2 + r.jitter(8 * g), yy, w, Math.max(1.5, 3 * g));
      }
    }
    let d = '';
    for (let u = -2.5; u < uEnd; u += 0.5) d += `M${P(s2x(u), s2FarCoping(u) - 6 * s2g(u))}L${P(s2x(u + 0.5), s2FarCoping(u + 0.5) - 6 * s2g(u + 0.5))}`;
    b.ink(d, INK_PX.hair);
    return b;
  }, [uEnd]);
  // ripples and glints on the S2 water (inside the wedge between the banks)
  const life = new Batch();
  const rr = rng('s2ripples');
  for (let i = 0; i < 34; i++) {
    const x = rr.range(-20, 1100);
    const yTop = s2FarCoping(s2u(x)) + 10;
    const yBot = S2_BANK.edge(x) - 6;
    if (yBot <= yTop) continue;
    const v = rr.next();
    const y = lerp(yTop, yBot, v);
    const sc = 0.5 + v * 0.8;
    const xx = x + ((-9 * t * sc) % 60);
    const w = rr.range(18, 50) * sc;
    const on = i % 3 === 0 ? (t / rr.range(1.3, 2.6) + rr.next()) % 1 < 0.45 : true;
    if (on) life.fill(i % 3 === 0 ? CM.paper : CM.waterDeep, `M${P(xx - w / 2, y)}Q${P(xx, y - 2.2 * sc)} ${P(xx + w / 2, y)}Q${P(xx, y + 2.2 * sc)} ${P(xx - w / 2, y)}Z`);
  }
  // the moored boats along the far bank (perspective) and the passing boat (from the VP side toward us)
  const mooredA = {u0: 4.6, u1: 9.2};
  const boatU = t >= boatAt ? boatU0 - (t - boatAt) * boatSpeed : 99;
  const lane = (u: number, off: number) => s2FarCoping(u) + off * s2g(u);
  const near = useMemo(() => {
    const b = new Batch();
    const r = rng('s2near');
    // our towpath (the near ground) from our edge down: paving, joints converging toward the VP, leaves, a drain
    const edge: Pt[] = [];
    for (let x = -40; x <= 1120; x += 40) edge.push([x, S2_BANK.edge(x)]);
    b.poly(CM.paving, [...edge, [1120, 1940], [-40, 1940]]);
    // the coping along our edge
    const cop: Pt[] = [];
    for (let x = -40; x <= 1120; x += 40) cop.push([x, S2_BANK.edge(x) - 2]);
    b.poly(CM.limestone, [...cop, ...cop.slice().reverse().map(([x, y]) => [x, y + 16] as Pt)]);
    let j = '';
    const vp = [1400, 700];
    for (let k = 0; k < 14; k++) {
      const yb = 1940;
      const xb = -600 + k * 210 + r.jitter(30);
      // a joint line from the bottom toward the VP, stopping at our edge
      const tEnd = (S2_BANK.edge(Math.max(-40, Math.min(1120, xb))) + 20 - yb) / (vp[1] - yb);
      const x1 = xb + (vp[0] - xb) * tEnd;
      const y1 = yb + (vp[1] - yb) * tEnd;
      for (let s = 0; s < 3; s++) {
        const a = r.range(0, 0.7);
        const c = Math.min(1, a + r.range(0.15, 0.35));
        j += `M${P(lerp(xb, x1, a), lerp(yb, y1, a))}L${P(lerp(xb, x1, c), lerp(yb, y1, c))}`;
      }
    }
    for (let y = 1260; y < 1920; y += r.range(70, 140)) {
      const x = r.range(80, 900);
      j += `M${P(x, y)}L${P(x + r.range(60, 160), y + r.jitter(6))}`;
    }
    b.ink(j, INK_PX.far, CM.line);
    b.layer();
    // a band of granite setts along our coping (small stones, two colours)
    for (let x = -40; x < 1120; x += 26) {
      const y = S2_BANK.edge(x) + 16;
      b.rect(r.chance(0.5) ? CM.stoneShade : CM.limestone, x + 1, y + 1, 24, 14);
      b.rect(r.chance(0.5) ? CM.limestone : CM.stoneShade, x + 13, y + 17, 24, 14);
    }
    // the towpath's painted "share the space" marks: a walker and a bike pictogram (paper paint, no words)
    const pic = (cx: number, cy: number, k: number) => {
      b.fill(CM.paper, ovalPath(cx - 60 * k, cy - 52 * k, 9 * k, 9 * k));
      b.poly(CM.paper, [[cx - 66 * k, cy - 40 * k], [cx - 52 * k, cy - 40 * k], [cx - 48 * k, cy - 6 * k], [cx - 40 * k, cy + 22 * k], [cx - 50 * k, cy + 22 * k], [cx - 58 * k, cy], [cx - 66 * k, cy + 22 * k], [cx - 76 * k, cy + 22 * k], [cx - 68 * k, cy - 6 * k]]);
      for (const wx of [cx + 10 * k, cx + 64 * k]) {
        b.fill(CM.paper, ovalPath(wx, cy + 8 * k, 16 * k, 16 * k));
        b.fill(CM.paving, ovalPath(wx, cy + 8 * k, 11 * k, 11 * k));
      }
      b.poly(CM.paper, [[cx + 10 * k, cy + 6 * k], [cx + 36 * k, cy - 20 * k], [cx + 62 * k, cy + 6 * k], [cx + 58 * k, cy + 10 * k], [cx + 36 * k, cy - 12 * k], [cx + 14 * k, cy + 10 * k]]);
      b.fill(CM.paper, ovalPath(cx + 34 * k, cy - 34 * k, 7 * k, 7 * k));
    };
    pic(600, 1560, 1.15);
    for (let i = 0; i < 60; i++) {
      const y = r.range(1240, 1900);
      const s = lerp(10, 22, (y - 1240) / 660);
      b.fill(r.pick([CM.leafGold, CM.leafRust, CM.coatMustard]), leafPath(r.range(0, 1080), y, s, s * 0.35, r.range(-40, 40)));
    }
    drainInto(b, 470, 1760, 120, 's2drain');
    // long golden-hour shadows to the right across our towpath (the low sun is west = screen left)
    const sun: Pt = [-900, 900];
    for (const [x, y, w, len] of [[620, 1290, 30, 320], [780, 1290, 30, 300], [190, 1252, 40, 360], [530, 1252, 40, 330], [120, 1650, 180, 300], [80, 1292, 120, 260]] as [number, number, number, number][]) shadowInto(b, x, y, w, len, sun, CM.stoneShade, 0.15);
    // a bike rack with two bikes behind the passers-by, a bin by the bench
    for (const x of [250, 330, 410]) b.ink(`M${P(x, 1352)}L${P(x, 1300)}Q${P(x + 20, 1278)} ${P(x + 40, 1300)}L${P(x + 40, 1352)}`, INK_PX.mid, CM.anchor);
    bikeInto(b, 300, 1356, 34, 's2rb1', CM.coatSlate, 1);
    bikeInto(b, 392, 1360, 34, 's2rb2', CM.brick, -1);
    binInto(b, 842, 1330, 70, 's2bin');
    // two puddles mirroring the sky (a leaf afloat in one)
    for (const [px, py, pw] of [[300, 1420, 150], [760, 1640, 210]] as [number, number, number][]) {
      b.fill(CM.glass, `M${P(px - pw / 2, py)}Q${P(px - pw * 0.2, py - pw * 0.12)} ${P(px + pw * 0.1, py - pw * 0.08)}Q${P(px + pw / 2, py - pw * 0.06)} ${P(px + pw * 0.45, py + pw * 0.05)}Q${P(px, py + pw * 0.14)} ${P(px - pw / 2, py)}Z`);
      b.fill(CM.skyHigh, `M${P(px - pw * 0.25, py - pw * 0.03)}L${P(px + pw * 0.2, py - pw * 0.05)}L${P(px + pw * 0.15, py - pw * 0.01)}L${P(px - pw * 0.2, py + pw * 0.01)}Z`);
    }
    b.fill(CM.leafRust, leafPath(780, 1636, 22, 8, 20));
    // the bike locked to the lamp-post bottom-right (the post is a Lamp below)
    bikeInto(b, 870, 1905, 92, 's2bike', CM.coatMustard, -1);
    return b;
  }, []);
  return (
    <>
      <WingS2 story={story} staffCoolAt={staffCoolAt} storyOverlay={storyOverlay} />
      <Pigeons ledge={[90, 520, 652]} n={5} size={16} seed="s2parapet" />
      <Paint b={far} seed="s2far" />
      <Paint b={life} seed="s2life" misreg={false} />
      {/* the far towpath: lamps receding at the fins (never over a story window), walkers both ways */}
      {[2.5, 5.5, 9.5, 15.5].map((u, i) => (
        <Lamp key={i} x={s2x(u)} y={s2y('base', u) + 12 * s2g(u)} h={290 * s2g(u)} seed={`s2lamp${i}`} />
      ))}
      <Movers
        idPrefix="s2far"
        movers={[
          {pose: 'walk', from: [1100, s2y('base', s2u(1100)) + 12 * s2g(s2u(1100))], to: [560, s2y('base', 3) + 12 * s2g(3)], h: [40, 120], speed: 30, phase: 0.2, seed: 's2fw1', acc: 'tote'},
          {pose: 'walk', from: [560, s2y('base', 3) + 12 * s2g(3)], to: [1100, s2y('base', s2u(1100)) + 12 * s2g(s2u(1100))], h: [120, 40], speed: 28, phase: 0.75, seed: 's2fw2', acc: 'scarf'},
          {pose: 'jog', from: [1100, s2y('base', s2u(1100)) + 12 * s2g(s2u(1100))], to: [560, s2y('base', 3) + 12 * s2g(3)], h: [40, 120], speed: 70, phase: 0.45, seed: 's2fj', acc: 'cap'},
        ]}
      />
      <PerspBoat stern={[s2x(mooredA.u1), lane(mooredA.u1, 34)]} bow={[s2x(mooredA.u0), lane(mooredA.u0, 34)]} hStern={150 * s2g(mooredA.u1)} hBow={150 * s2g(mooredA.u0)} seed="s2moored" cabin={CM.sage} />
      {boatU < boatU0 + 0.01 && boatU > -6 ? (
        <PerspBoat stern={[s2x(boatU + 5), lane(boatU + 5, 92)]} bow={[s2x(boatU), lane(boatU, 92)]} hStern={175 * s2g(boatU + 5)} hBow={175 * s2g(boatU)} seed="s2passing" cabin={CM.coatOat} />
      ) : null}
      <Ducks ducks={[{x: 760, y: 1080, size: 22, vx: -10, drake: true}, {x: 300, y: 1150, size: 26, vx: -7}]} seed="s2ducks" />
      {farLife}
      {/* our bank: the railing (a post tops out at Pip's seat), the A-board under the kiosk, the bench, the planter */}
      <Paint b={near} seed="s2near" />
      <S2Railing />
      {aBoard}
      <Newsstand x0={-70} x1={124} top={918} ground={1292} seed="s2news" />
      {agent}
      {pip}
      {bench}
      <Bench x={(S2_BENCH.x0 + S2_BENCH.x1) / 2} y={S2_BENCH.y1} w={S2_BENCH.x1 - S2_BENCH.x0} view="back" seed="s2bench" />
      <Planter x0={-30} x1={230} y={1650} h={190} seed="s2planter" />
      {/* the near lamp, lowered so its swan-neck arm leaves the frame below y 600 (never near the caption band) */}
      <Lamp x={930} y={1990} h={1290} w={30} variant="near" seed="s2nearlamp" />
      {nearPeople}
      <FallingLeaves box={[600, 640, 1080, 1700]} n={6} size={15} seed="s2fall" wind={-30} />
    </>
  );
};

/** S2's railing along our edge, with a post exactly at Pip's seat (x 590, top y 1050). */
const S2Railing: React.FC = () => {
  const b = useMemo(() => {
    const b = new Batch();
    const posts: number[] = [];
    for (let x = 590; x > -160; x -= 168) posts.unshift(x);
    for (let x = 590 + 160; x < 1200; x += 160 - (x - 590) * 0.04) posts.push(x);
    const top = (x: number) => (x === 590 ? MAP.S2.pipSeat.y : S2_BANK.railTop(x) + (MAP.S2.pipSeat.y - S2_BANK.railTop(590)));
    // rails
    const rail: Pt[] = [];
    for (let x = -60; x <= 1120; x += 40) rail.push([x, top(x) + 6]);
    b.poly(CM.anchor, [...rail, ...rail.slice().reverse().map(([x, y]) => [x, y + 6] as Pt)]);
    const mid: Pt[] = [];
    for (let x = -60; x <= 1120; x += 40) mid.push([x, lerp(top(x), S2_BANK.edge(x), 0.55)]);
    b.poly(CM.anchor, [...mid, ...mid.slice().reverse().map(([x, y]) => [x, y + 4] as Pt)]);
    let bars = '';
    for (const x of posts) {
      b.rect(CM.anchor, x - 6, top(x), 12, S2_BANK.edge(x) - top(x));
      b.fill(CM.anchor, ovalPath(x, top(x) - 1, 9, 6));
    }
    for (let x = -60; x < 1120; x += 26) bars += `M${P(x, lerp(top(x), S2_BANK.edge(x), 0.55) + 3)}L${P(x, S2_BANK.edge(x) - 2)}`;
    b.ink(bars, INK_PX.far, CM.anchor);
    b.ink(line(-60, top(-60) + 6, 1120, top(1120) + 6, {seed: 's2rail', over: 'small'}), INK_PX.mid);
    return b;
  }, []);
  return <Paint b={b} seed="s2railing" />;
};

