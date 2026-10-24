// props/Bit.tsx — BIT, the tiny ink beetle who lives in the flaw (P3). On screen from frame 0 to the last frame.
//
//   <Bit x={200} y={705} size={16} />                                        // idle on govA's cornice (antennae wiggle)
//   <Bit x={595} y={1100} size={30} state="peek" peekAt={6.4} />             // peeks out past an edge at (x, y)
//   <Bit ... hideAt={7} />  <Bit ... hopAt={3.2} />  <Bit ... alertAt={24.0} />  // duck back, hop, ink "!"
//   <Bit crawl={{at: 18, path: [[330, 1112], [360, 1000]], speed: 60}} size={16} />   // crawls along a path (scuttle: fast)
//   <Bit ... state="silhouette" />  <Bit ... state="doodle" at={32} />        // wave specks / the leaked page's line version
//   <BitSwarm spots={[{x, y, size, at}]} />                                   // hundreds of silhouettes in one path
//
// Look: a side-view beetle facing RIGHT (flip to face left): a solid-ink dome shell, a round ink head with a cream eye
// dot, two antennae, three little legs. Anchor (x, y) = where his feet touch the surface, at the middle of his body.
// size = body length in world px (16 x 10 in wide shots, ~20 on the blueprint, ~60 in the S02 close-up, 1-8 px specks).
// Detail drops with on-screen size: < 6 px a silhouette (dome + head), < 18 px no eye rim / leg joints.

import React from 'react';
import {palette} from '../../../lib/theme';
import {ease as E, lerp, osc, prog, springAt, springs, useTime} from '../../../lib/time';
import {rand, Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {ExitFade} from '../../../lib/exit';
import {PathBuf} from '../../../lib/cine/util';
import type {Pt} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {alongPath, bt, hopY, landSquash, lodOf, matScale, pathLen, PropBase} from './common';
import {useXf} from '../../../lib/xf';
import {AlertMark} from './Glyphs';

export type BitState = 'idle' | 'peek' | 'hide' | 'crawl' | 'scuttle' | 'ride' | 'hop' | 'alert' | 'silhouette' | 'doodle';

/** Local design: body length 20 (x -10..10), feet at y 0, shell top at y -11. */
const L = 20;
const SHELL = 'M-10 -1.2C-10.4 -8 -5.5 -11.4 0 -11.4C4.6 -11.4 7.6 -8.6 7.4 -1.2Z';
const HEAD: [number, number, number] = [8.6, -4.6, 3.6];

/** Closed silhouette path (shell + head) of a Bit at (x, y) with body length `size`, for batching (PathBuf.raw). */
export function bitPath(x: number, y: number, size: number, flip = false): string {
  const k = size / L;
  const f = flip ? -1 : 1;
  const X = (v: number) => (x + v * k * f).toFixed(1);
  const Y = (v: number) => (y + v * k).toFixed(1);
  const hr = HEAD[2] * k;
  return (
    `M${X(-10)} ${Y(-1.2)}C${X(-10.4)} ${Y(-8)} ${X(-5.5)} ${Y(-11.4)} ${X(0)} ${Y(-11.4)}C${X(4.6)} ${Y(-11.4)} ${X(7.6)} ${Y(-8.6)} ${X(7.4)} ${Y(-1.2)}Z` +
    `M${X(HEAD[0]) } ${(y + HEAD[1] * k - hr).toFixed(1)}a${hr.toFixed(2)} ${hr.toFixed(2)} 0 1 0 0.01 0Z`
  );
}

export type BitProps = PropBase & {
  /** Body length in world px. Default 16. */
  size?: number;
  state?: BitState;
  /** Peek: emerges forward past the edge at his anchor x (clipped behind it) over 0.2 s; `peekAmount` 0..1 (default 0.75). */
  peekAt?: number;
  peekAmount?: number;
  /** Duck / hide: squashes and slips back behind the edge (or into the gap) over 0.14 s. */
  hideAt?: number;
  /** Hop (h = 1.2 body lengths, 0.3 s) with take-off and landing squash. */
  hopAt?: number;
  hopH?: number;
  /** Ink "!" pops above him; antennae stand up. Holds for alertDur (default 0.9 s). */
  alertAt?: number;
  alertDur?: number;
  /** Crawl along a polyline (parent coords) from `at` at `speed` px/s; overrides x / y. 'scuttle' state = fast legs. */
  crawl?: {at: number; path: Pt[]; speed?: number};
  /** Draw-on for the doodle state / pop-in for the others. */
  at?: number;
};

export const Bit: React.FC<BitProps> = (p) => {
  const t = useTime();
  const m = useXf();
  const {size = 16, state = 'idle', seed = 'bit', at, outAt, outDur} = p;
  let {x = 0, y = 0} = p;
  let rot = p.rot ?? 0;
  const s = size / L;
  const onScreen = size * matScale(m);
  const lod = state === 'silhouette' ? 0 : lodOf(onScreen, 6, 18);
  const ph = rand(seed, 'ph') * 6.28;
  const doodle = state === 'doodle';

  if (at !== undefined && t < at) return null;

  // ---- crawl along a path
  let moving = false;
  let speedK = 1;
  if (p.crawl && t >= p.crawl.at) {
    const sp = p.crawl.speed ?? (state === 'scuttle' ? 90 : 30);
    const d = (t - p.crawl.at) * sp;
    const q = alongPath(p.crawl.path, d);
    x = q.p[0];
    y = q.p[1];
    rot += q.ang - (p.flip ? 180 : 0);
    moving = d < pathLen(p.crawl.path);
    speedK = state === 'scuttle' ? 2.4 : 1;
  } else if (p.crawl) {
    x = p.crawl.path[0][0];
    y = p.crawl.path[0][1];
    const q = alongPath(p.crawl.path, 0);
    rot += q.ang - (p.flip ? 180 : 0);
  }
  if (state === 'crawl' || state === 'scuttle') moving = moving || !p.crawl;

  // ---- peek / hide (local x offset behind an edge at local x = 0 ... the anchor is the edge)
  let shift = 0;
  let clipEdge = false;
  let squash = 1;
  if (state === 'peek' || p.peekAt !== undefined) {
    clipEdge = true;
    const amt = p.peekAmount ?? 0.75;
    const q = p.peekAt !== undefined ? prog(t, p.peekAt, 0.2, E.outBack(1.6)) : 1;
    shift = lerp(-L - 8, -L + amt * L + 2, q) + 10; // hidden: antenna tips behind the edge too
  }
  if (p.hideAt !== undefined && t >= p.hideAt) {
    const q = prog(t, p.hideAt, 0.14, E.inCubic);
    squash = lerp(1, 0.55, Math.min(1, q * 1.6));
    if (clipEdge) shift = lerp(shift, -L - 8 + 10, q);
    else if (q >= 1) return null; // ducked into the gap
  }
  if (state === 'hide' && p.hideAt === undefined) return null;

  // ---- hop
  const hopDur = 0.3;
  const hy = hopY(t, p.hopAt, hopDur, (p.hopH ?? 1.2) * L);
  const [lsx, lsy] = p.hopAt !== undefined ? (t < p.hopAt ? [1, 1] : landSquash(t, p.hopAt + hopDur, 0.8)) : [1, 1];
  const antic = p.hopAt !== undefined && t >= p.hopAt - 0.06 && t < p.hopAt ? 0.85 : 1;

  // ---- life: antennae wiggle, breathing, legs
  const alertOn = p.alertAt !== undefined && t >= p.alertAt && t < p.alertAt + (p.alertDur ?? 0.9);
  const wig = state === 'ride' ? 0.3 : 1;
  const a1 = alertOn ? -12 : osc(t, 1.7, ph) * 9 * wig;
  const a2 = alertOn ? -8 : osc(t, 2.1, ph + 1.3) * 11 * wig;
  const breathe = 1 + osc(t, 0.6, ph) * 0.02;
  const legPh = moving ? t * 9 * speedK + ph : 0;
  const pop = at !== undefined && !doodle ? springAt(t, at, springs.pop) : 1;

  // ---- drawing (local units, facing right)
  const W = Math.min(2.4, Math.max(0.9, 1.2 / Math.max(0.2, s))); // keep legs ~1.2 px on screen at small sizes
  const legs = (() => {
    let d = '';
    const xs = [-6, -1.5, 3];
    xs.forEach((lx, i) => {
      const sw = moving ? Math.sin(legPh + i * 2.1) * 2.2 : 0;
      const lift = moving ? Math.max(0, Math.cos(legPh + i * 2.1)) * 1.2 : 0;
      d += `M${lx} -2L${(lx - 1.8 + sw).toFixed(2)} ${(-0.4 - lift).toFixed(2)}L${(lx - 2.6 + sw).toFixed(2)} ${(0.4 - lift).toFixed(2)}`;
    });
    return d;
  })();
  const ant = (base: Pt, len: number, ang: number) => {
    const a = (ang * Math.PI) / 180;
    const mid: Pt = [base[0] + Math.cos(a) * len * 0.55, base[1] + Math.sin(a) * len * 0.55];
    const end: Pt = [base[0] + Math.cos(a + 0.35) * len, base[1] + Math.sin(a + 0.35) * len];
    return `M${base[0]} ${base[1]}Q${mid[0].toFixed(2)} ${mid[1].toFixed(2)} ${end[0].toFixed(2)} ${end[1].toFixed(2)}`;
  };
  const antennae = ant([9.4, -7.6], 8.5, -62 + a1) + ant([8.2, -7.9], 7.6, -84 + a2);
  const headD = `M${HEAD[0]} ${HEAD[1] - HEAD[2]}a${HEAD[2]} ${HEAD[2]} 0 1 0 0.01 0Z`;
  const bodyColor = palette.ink; // Bit stays solid ink in every state (paper / line-art frames included)

  const parts: React.ReactNode[] = [];
  if (lod === 0) {
    parts.push(<Fill key="sil" d={SHELL + headD} color={palette.ink} offset={false} mode="none" seed={`${seed}/sil`} lookExempt />);
  } else if (doodle) {
    parts.push(<Fill key="dF" d={SHELL + headD} color={palette.white} at={bt(at, 0.15)} offset={[0.8, 0.6]} seed={`${seed}/dF`} />);
    parts.push(<Ink key="dI" d={SHELL + headD + 'M-1 -11L-1.5 -2' + legs + antennae} at={at} dur={0.35} width={W * 0.8} seed={`${seed}/dI`} />);
  } else {
    parts.push(<Ink key="legs" d={legs} width={W} taper={false} seed={`${seed}/legs`} />);
    parts.push(<Ink key="ant" d={antennae} width={W * 0.85} taper={false} seed={`${seed}/ant`} />);
    parts.push(<Fill key="shell" d={SHELL} color={bodyColor} offset={false} mode="none" seed={`${seed}/shell`} lookExempt />);
    parts.push(<Fill key="head" d={headD} color={bodyColor} offset={false} mode="none" seed={`${seed}/head`} lookExempt />);
    // cream details: eye dot (+ a shell highlight arc when big enough)
    parts.push(
      <ExitFade key="eye" x={9.6} y={-5.6}>
        <circle cx={9.7} cy={-5.6} r={1.15} fill={palette.cream} />
        {lod === 2 ? <path d="M-6.5 -7.2Q-4 -10 0 -10.2" stroke={palette.cream} strokeWidth={0.9} fill="none" strokeLinecap="round" /> : null}
      </ExitFade>,
    );
  }

  let inner: React.ReactNode = <>{parts}</>;
  // body transform: peek shift, breathing, squash, hop
  const sxB = breathe * lsx * (1 / Math.max(0.6, squash * antic)) ** 0.25;
  const syB = breathe * lsy * squash * antic;
  inner = <XG m={mat.compose(mat.translate(shift, hy / s), mat.about(mat.scale(sxB * pop, syB * pop), 0, 0))}>{inner}</XG>;
  if (clipEdge) {
    // everything behind the edge (local x < 0 before the flip) is hidden
    inner = <ClipHalf>{inner}</ClipHalf>;
  }
  const alert = alertOn ? <AlertMark x={8 + shift} y={-24} size={11} at={p.alertAt} seed={`${seed}/!`} /> : null;

  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot), mat.scale(p.flip ? -s : s, s))}>
      {outAt !== undefined ? <OutWrap at={outAt} dur={outDur}>{inner}{alert}</OutWrap> : <>{inner}{alert}</>}
    </XG>
  );
};

/** Clip to x >= 0 (local). */
const ClipHalf: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <>
      <defs>
        <clipPath id={`bh${id}`}>
          <rect x={0} y={-60} width={80} height={90} />
        </clipPath>
      </defs>
      <g clipPath={`url(#bh${id})`}>{children}</g>
    </>
  );
};

/** Build-out for Bit: he shrinks to his feet (no fade). */
const OutWrap: React.FC<{at: number; dur?: number; children?: React.ReactNode}> = ({at, dur = 0.2, children}) => {
  const t = useTime();
  const k = 1 - E.inCubic(prog(t, at, dur));
  if (k <= 0.001) return null;
  return <XG m={mat.about(mat.scale(k), 0, 0)}>{children}</XG>;
};

// ---------------------------------------------------------------- BitSwarm

export type BitSpot = {x: number; y: number; size: number; at?: number; flip?: boolean};

/** Many Bit silhouettes (waves: S02's seven locks, S10's hillside) batched into ONE ink path. Each pops in at its `at`
 *  (1-frame pop with a 2-frame +30 % overshoot) and sinks to its feet with the un-build. */
export const BitSwarm: React.FC<{spots: BitSpot[]; color?: string; outAt?: number}> = ({spots, color = palette.ink, outAt}) => {
  const t = useTime();
  const pb = new PathBuf();
  for (const sp of spots) {
    if (sp.at !== undefined && t < sp.at) continue;
    if (outAt !== undefined && t >= outAt) continue;
    const k = sp.at === undefined ? 1 : t < sp.at + 0.07 ? 1.3 : 1;
    pb.raw(bitPath(sp.x, sp.y, sp.size * k, sp.flip));
  }
  if (pb.empty) return null;
  return (
    <ExitFade>
      <path d={pb.d} fill={color} />
    </ExitFade>
  );
};

/** Bit's local design: body length 20, head centre, eye. */
export const BIT = {length: L, head: [HEAD[0], HEAD[1]] as Pt, eye: [9.7, -5.6] as Pt};
