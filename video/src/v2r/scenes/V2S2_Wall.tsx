// V2S2_Wall (lane L2): Google's canal wing as S2's RECEDING WALL, conformed to DIRECTION rules 2-6 (conform_L2 §4, §6,
// §10; CRAFT §c, §d, §f; THROUGHLINE §5b). The geometry is the canal kit's own (kit/canal/wall.tsx: S2_WALL, s2x / s2y /
// s2g, the story windows on their exact map rects): this fork only changes how it is PAINTED.
//   Depth   the wall steps into planes by column (one flat step per plane toward S2's air, `recede` / `planePalette`):
//           plane 0 the near bays (u <= 2.5: her window M, SW1, W2), +1 to u 6.5, +2 to u 14.5, +3 to the vanishing
//           point; every step sits on a fin, so no seam shows. Windows: their own colours on 0 and +1, tone-on-tone
//           from +2 (CRAFT §f.2: never a dark speck or the lamp colour far away).
//   Tiers   the main building's setbacks behind the wing, one plane farther than the wall in front of them, as a
//           STAIRCASE of flat blocks whose tops step down toward the vanishing point (never a ruler line at y 600;
//           every top at y >= 604), a lit sliver on each block's sun side (west = left), tone-on-tone rows of windows.
//   Line    tier C (environment): flat fills only, no structural ink (the clean pen's environment draws none anyway).
//   Light   RIG_CANAL (the low western sun off-screen left): each fin's short shade falls right on the facade (a form
//           Shadow); the parapet's coping casts a thin strip; story panes lit flat (L* <= 92), cooling at 8.96 in ONE step.
//   Life    one pane switch at a time on a visible window, never a story pane, never within 1 s of 8.96 or 10.26-10.60
//           (7.30, 11.70); the parapet pigeons are the scene's (V2S2_Set).
// FILM seconds (the scene runs inside <TimeShift by={-6.1}>).
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {S2_AIR} from '../world/skies';
import {useTime} from '../../lib/time';
import {Tier} from '../../lib/tier';
import {ShadowLayer, Shadow} from '../../lib/light';
import {makeAtmosphere, planePalette, recede, toneOnTone} from '../../lib/depth';
import {Batch, Paint, P, Pt, rng, lerp, lobes} from '../kit/canal/core';
import {S2_STORY, S2_WALL, s2g, s2u, s2x, s2y} from '../kit/canal/wall';
import type {StoryState} from '../kit/canal/wall';
import * as MAP from '../world/map';

type Level = keyof typeof S2_WALL.levels;

/** S2's atmosphere (lib/depth): the air = the converted sky's lowest colour behind the far end (THROUGHLINE §5b,
 *  RESUME 2026-10-28: `horizonColor`; world/skies S2_AIR). */
export const S2_ATM = makeAtmosphere({name: 'canal S2', air: S2_AIR});

/** The plane of a wall column position u (steps on the fins at u = 2.5, 6.5, 14.5). */
export const wallPlane = (u: number): number => (u <= 2.5 ? 0 : u <= 6.5 ? 1 : u <= 14.5 ? 2 : 3);
/** The wall's plane segments [u0, u1, plane]. */
const SEGS = (uEnd: number): [number, number, number][] => [
  [-2.5, 2.5, 0],
  [2.5, 6.5, 1],
  [6.5, 14.5, 2],
  [14.5, uEnd, 3],
];

/** The wall's structural materials (planePalette merges them on the far planes). */
const MATERIALS = [CM.brickLight, CM.limestone, CM.stoneShade, CM.sage, CM.leafGold, CM.leafRust];
const PALETTES = new Map<number, Record<string, string>>();
/** A structural colour on plane p: unchanged on 0, one step toward the air on +1, merged and stepped from +2. */
export const wallCol = (c: string, p: number): string => {
  if (p <= 0) return c;
  if (p < 2) return recede(c, p, S2_ATM);
  let pal = PALETTES.get(p);
  if (!pal) {
    pal = planePalette(MATERIALS, p, S2_ATM);
    PALETTES.set(p, pal);
  }
  return pal[c] ?? recede(c, p, S2_ATM);
};

/** A band between two levels from u0 to u1 as a polygon (sampled). */
function bandPts(top: Level | ((u: number) => number), bot: Level | ((u: number) => number), u0: number, u1: number): Pt[] {
  const T = typeof top === 'string' ? (u: number) => s2y(top, u) : top;
  const B = typeof bot === 'string' ? (u: number) => s2y(bot, u) : bot;
  const pts: Pt[] = [];
  const n = Math.max(2, Math.ceil((u1 - u0) * 3));
  for (let i = 0; i <= n; i++) {
    const u = lerp(u0, u1, i / n);
    pts.push([s2x(u), T(u)]);
  }
  for (let i = n; i >= 0; i--) {
    const u = lerp(u0, u1, i / n);
    pts.push([s2x(u), B(u)]);
  }
  return pts;
}

// ---------------------------------------------------------------- the tiers: a stepped staircase of setbacks

/** The setbacks' tops (screen y at the pose) by column ranges: the highest row first; each next row 16 px lower. Every
 *  top >= 604 (K2: nothing built above y 600) and they step DOWN toward the vanishing point. */
const TIER_STEPS: [number, number, number][] = [
  // [u0, u1, top y] of the highest (farthest) setback
  [-2.6, 1.6, 606],
  [1.6, 4.4, 618],
  [4.4, 8.2, 632],
  [8.2, 13.5, 646],
  [13.5, 21, 658],
  [21, 60, 668],
];
const TIER_ROWS = [
  {dy: 0, mat: CM.limestone},
  {dy: 15, mat: CM.stucco},
  {dy: 29, mat: CM.brickLight},
];

// ---------------------------------------------------------------- panes

/** A pane on plane p: its own colours on 0 / +1 (lit: lamp + a lamp core + one interior thing; unlit: glass, a shade
 *  wedge, a sky glint), tone-on-tone on the wall from +2. */
function paneInto(b: Batch, x: number, y: number, w: number, h: number, lit: boolean, p: number, seed: string) {
  if (p >= 2) {
    b.rect(toneOnTone(wallCol(CM.brickLight, p), {lit, dE: 5}), x, y, w, h);
    return;
  }
  const c = (col: string) => (p > 0 ? recede(col, p, S2_ATM) : col);
  const r = rng(seed);
  if (!lit) {
    b.rect(c(CM.glass), x, y, w, h);
    const lo = r.range(0.45, 0.65);
    b.poly(c(CM.shadeCool), [[x, y + h * lo], [x + w, y + h * (lo - 0.2)], [x + w, y + h], [x, y + h]]);
    if (w > 14) b.poly(c(CM.skyHigh), [[x + w * 0.12, y], [x + w * 0.4, y], [x, y + h * 0.35], [x, y + h * 0.15]]);
    return;
  }
  b.rect(c(CM.lamp), x, y, w, h);
  if (w > 10) {
    b.rect(c(CM.lampCore), x + w * 0.12, y + h * 0.1, w * 0.76, h * 0.45);
    const kind = r.int(0, 2);
    if (kind === 0) b.rect(c(CM.coatOat), x, y, w, h * r.range(0.18, 0.4));
    if (kind === 1 && w > 30) b.fill(c(CM.sage), lobes(x + w * 0.1, x + w * 0.45, y + h, h * 0.35, `${seed}/pl`, 2));
    if (kind === 2 && w > 30) b.fill(c(CM.coatOat), `M${P(x + w * 0.38, y + h * 0.24)}L${P(x + w * 0.62, y + h * 0.24)}L${P(x + w * 0.56, y + h * 0.12)}L${P(x + w * 0.44, y + h * 0.12)}Z`);
    b.poly(c(CM.glass), [[x + w, y], [x + w, y + h * 0.18], [x + w * 0.8, y]]);
  }
}

/** Which procedural panes are lit (a seeded half, golden evening), and the two switches (one pane, one step each:
 *  never a story pane, never within 1 s of 8.96 or 10.26-10.60). [col, row, at, lit after] */
const SWITCHES: [number, 'first' | 'ground', number, boolean][] = [
  [3, 'ground', 7.3, false],
  [4, 'first', 11.7, true],
];
const litBase = (c: number, row: 'first' | 'ground') => {
  const r = rng(`s2pane/${c}/${row}`);
  return r.chance(0.58);
};
const litAt = (t: number, c: number, row: 'first' | 'ground') => {
  let lit = litBase(c, row);
  for (const [sc, sr, at, after] of SWITCHES) if (sc === c && sr === row && t >= at) lit = after;
  return lit;
};

/** The lit staff panes (CRAFT §d: L* 85-92, flat, no glow): lamp-lit before 8.96, then ONE step to a cooler white. */
export const STAFF_PANE_LIT = CM.lamp;
export const STAFF_PANE_COOL = '#E3EAE6';

export type S2WallProps = {
  /** The staff panes turn the cooler white at this time (map staffOnAt 8.96, 0.04 s apart). */
  staffCoolAt?: number;
  staffStagger?: number;
  /** Drawn over each story window (the staff silhouettes and blinds; her outline). */
  storyOverlay?: (w: MAP.Spot & {id: string}) => React.ReactNode;
  /** The story windows' tier per id at time t (her window and the staff windows promote on their beats). */
  storyTier?: (id: string) => 'subject' | 'support' | 'environment';
};

export const S2Wall: React.FC<S2WallProps> = ({staffCoolAt = MAP.S2.staffOnAt, staffStagger = MAP.S2.staffOnStagger, storyOverlay, storyTier}) => {
  const t = useTime();
  const uEnd = s2u(1120);
  const stat = useMemo(() => {
    const b = new Batch();
    // ---- the tiers (one plane farther than the wall in front of them): far rows first
    for (let k = TIER_ROWS.length - 1; k >= 0; k--) {
      const row = TIER_ROWS[k];
      for (let i = 0; i < TIER_STEPS.length; i++) {
        const [u0, u1Raw, top0] = TIER_STEPS[i];
        const u1 = Math.min(u1Raw, uEnd);
        if (u0 >= uEnd) break;
        const top = top0 + row.dy;
        const p = Math.min(4, wallPlane((u0 + u1) / 2) + 1);
        // the block runs from its flat top down behind the parapet (the wing covers its foot)
        const bot = (u: number) => s2y('coping', u);
        const visible = (u: number) => top < s2y('parapet', u) - 2;
        if (!visible(u0) && !visible(u1)) continue;
        b.poly(wallCol(row.mat, p), bandPts(() => top, bot, u0, u1));
        // the lit sliver on the block's sun side (west = left): 4 px of the block's own colour a step lighter
        const xl = s2x(u0);
        b.poly(toneOnTone(wallCol(row.mat, p), {lit: true, dE: 4}), [[xl, top], [xl + 4, top], [xl + 4, s2y('parapet', u0)], [xl, s2y('parapet', u0)]]);
        // tone-on-tone rows of tiny windows (none on +4)
        if (p < 4) {
          const wallC = wallCol(row.mat, p);
          for (let u = u0 + 0.2; u < u1 - 0.1; u += 0.34) {
            const g = s2g(u);
            const ww = Math.max(2, 8 * g * g);
            const wh = Math.max(2, 6 * g);
            const x = s2x(u);
            for (let y = top + 5 * g + 2; y + wh < s2y('parapet', u) - 3; y += wh * 2) {
              b.rect(toneOnTone(wallC, {lit: rng(`s2tw/${k}/${u.toFixed(2)}/${y.toFixed(0)}`).chance(0.4), dE: 4}), x - ww / 2, y, ww, wh);
            }
          }
        }
      }
    }
    b.layer();
    // ---- the wing: per plane segment, the brick body, the coping, the stone band, the plinth, the base
    for (const [u0, u1Raw, p] of SEGS(uEnd)) {
      const u1 = Math.min(u1Raw, uEnd);
      if (u0 >= u1) continue;
      b.poly(wallCol(CM.brickLight, p), bandPts('parapet', 'base', u0, u1));
      b.poly(wallCol(CM.limestone, p), bandPts('parapet', 'coping', u0, u1));
      b.poly(wallCol(CM.limestone, p), bandPts('bandTop', 'bandBot', u0, u1));
      b.poly(wallCol(CM.limestone, p), bandPts('plinth', 'base', u0, u1));
    }
    b.layer();
    // ---- the roof-terrace planting over the coping (y >= 604), merged and calm with distance
    for (let u = -2.3; u < uEnd; u += rng(`s2pl/${u.toFixed(1)}`).range(0.5, 0.9)) {
      const g = s2g(u);
      const x = s2x(u);
      const y = s2y('parapet', u);
      const p = wallPlane(u);
      const h = Math.min(y - 604, rng(`s2plh/${u.toFixed(2)}`).range(10, 22) * g);
      if (h > 3 && 52 * g >= 6) b.fill(wallCol(rng(`s2plc/${u.toFixed(2)}`).pick([CM.sage, CM.sage, CM.leafGold, CM.leafRust]), p), lobes(x - 26 * g, x + 26 * g, y + 2, h, `s2pl/${u.toFixed(2)}`, 2));
    }
    b.layer();
    // ---- the fins between the columns: slim limestone (their shade is the light layer's)
    for (let u = -2.5; u < uEnd; u += 1) {
      const g = s2g(u);
      const x = s2x(u);
      const w = Math.max(1.5, 12 * g * g);
      if (w < 2) continue;
      const p = wallPlane(u + 0.01);
      b.poly(wallCol(CM.limestone, p), [[x - w / 2, s2y('coping', u)], [x + w / 2, s2y('coping', u)], [x + w / 2, s2y('plinth', u)], [x - w / 2, s2y('plinth', u)]]);
    }
    return b;
  }, [uEnd]);

  // ---- per frame: the procedural panes (two switches) and the story panes
  const dyn = new Batch();
  for (let c = -2; c <= Math.ceil(uEnd); c++) {
    for (const row of ['first', 'ground'] as const) {
      if (S2_STORY.find((s) => s.col === c && s.row === row)) continue;
      const g = s2g(c);
      const x = s2x(c);
      const w = (row === 'first' ? 110 : 100) * g * g * (c < 2 ? 1.12 : 1);
      const y0 = s2y(row === 'first' ? 'firstTop' : 'groundTop', c);
      const y1 = s2y(row === 'first' ? 'firstBot' : 'groundBot', c);
      if (x - w / 2 > 1100 || w < 2) continue;
      const p = wallPlane(c);
      paneInto(dyn, x - w / 2, y0, w, y1 - y0, litAt(t, c, row), p, `s2pane/${c}/${row}`);
      // the mullion and transom on the near planes; the sill
      if (p <= 1 && w > 14) {
        const mc = p > 0 ? recede(CM.shadeCool, p, S2_ATM) : CM.shadeCool;
        dyn.rect(mc, x - Math.max(0.8, w * 0.015), y0, Math.max(1.6, w * 0.03), y1 - y0);
        dyn.rect(mc, x - w / 2, y0 + (y1 - y0) * 0.2, w, Math.max(1.2, (y1 - y0) * 0.018));
      }
      if (w > 6) dyn.rect(wallCol(CM.limestone, p), x - w / 2 - w * 0.06, y1, w * 1.12, Math.max(1.5, 6 * g));
    }
  }

  // ---- the story windows: exact rects (her dark pane; the staff panes lamp-lit, then the cooler white in one step)
  const story = S2_STORY.map((w) => {
    const sb = new Batch();
    const staffIdx = MAP.S2.staffWindows.findIndex((s) => s.id === w.id);
    let st: StoryState = w.id === 'HER' ? 'dark' : 'lit';
    if (staffIdx >= 0 && t >= staffCoolAt + staffIdx * staffStagger) st = 'cool';
    const x0 = w.x - w.w / 2;
    const y0 = w.y - w.h / 2;
    if (st === 'dark') {
      sb.rect(CM.anchor, x0, y0, w.w, w.h);
      sb.poly(CM.paneUnlit, [[x0 + w.w * 0.08, y0 + w.h * 0.05], [x0 + w.w * 0.32, y0 + w.h * 0.05], [x0 + w.w * 0.08, y0 + w.h * 0.28]]);
    } else {
      sb.rect(st === 'cool' ? STAFF_PANE_COOL : STAFF_PANE_LIT, x0, y0, w.w, w.h);
      if (st === 'lit') sb.rect(CM.lampCore, x0 + w.w * 0.12, y0 + w.h * 0.1, w.w * 0.76, w.h * 0.45);
    }
    sb.rect(CM.shadeCool, x0 + w.w * 0.5 - 2, y0, 4, w.h);
    sb.rect(CM.shadeCool, x0, y0 + w.h * 0.2, w.w, 3);
    sb.rect(CM.limestone, x0 - 8, y0 + w.h, w.w + 16, 7);
    return {w, sb};
  });

  // ---- the light: each fin's short shade falls right on the facade (form strength), on the near and mid planes
  const finShades: string[] = [];
  for (let u = -2.5; u < Math.min(uEnd, 9); u += 1) {
    const g = s2g(u);
    const x = s2x(u);
    const w = Math.max(1.5, 12 * g * g);
    const sw = Math.max(2, 9 * g * g);
    finShades.push(`M${P(x + w / 2, s2y('coping', u))}L${P(x + w / 2 + sw, s2y('coping', u) + 2 * g)}L${P(x + w / 2 + sw, s2y('plinth', u))}L${P(x + w / 2, s2y('plinth', u))}Z`);
  }

  return (
    <>
      <Tier tier="environment">
        <Paint b={stat} seed="s2wall/stat" misreg={false} />
        <Paint b={dyn} seed="s2wall/dyn" misreg={false} />
      </Tier>
      <ShadowLayer>
        {finShades.map((d, i) => (
          <Shadow key={i} d={d} tint="form" />
        ))}
      </ShadowLayer>
      {story.map(({w, sb}) => (
        <Tier key={w.id} tier={storyTier ? storyTier(w.id) : 'support'}>
          <Paint b={sb} seed={`s2wall/story/${w.id}`} misreg={false} />
        </Tier>
      ))}
      {storyOverlay ? S2_STORY.map((w) => <React.Fragment key={`o${w.id}`}>{storyOverlay(w)}</React.Fragment>) : null}
    </>
  );
};
