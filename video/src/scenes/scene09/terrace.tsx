// S09 Part B, fix round 2: the PEAK-3 hillside dressing over TerraceHill (all in TerraceHill's world, drawn in its
// wraps; the set itself is not edited). TerraceHill stacks each row's base right on the row below's roof, so at phone
// size the hill read as one wall of identical boxes. This module turns it into TERRACES and calms the far rows:
//   NearLodRow0   row 0's houses (all but #4, which the set draws in full detail) at near LOD from the ghost's pop on:
//                 a browser window with chrome + content (ChromeSlot), a glazed door (FacadeDoor), the elephant plaque and
//                 the OLD lock, at an on-screen ink floor (so the slow start of the pull-back after the pop shows real
//                 houses, not flat slabs, and the near row keeps its detail at rest).
//   TerraceDress  per row k (far -> near, with the set's own reveal-under-the-caption-floor and edge extension):
//                 - rows 1-7: a terrace band under the row: a sand coping strip (misregistered) where its houses stand
//                   and a tan retaining-wall face down to the row below's roof line (that roof line + the coping inked,
//                   the ink drawing on row by row on 'every'), stone joints on rows 1-3;
//                 - two more switchback stair runs (x ~170 / ~910, rows 1-5) beside the set's own at x ~612, their
//                   flights drawing on on 'every';
//                 - rows 4-7 (the haze ladder): the per-house windows / screens / plaques / locks dropped: three flat tones
//                   per row (light / mid / dark, the set's per-house colour pick, tinted toward the sky), a roof slab and
//                   the door, so the far hill reads as depth, not texture;
//                 - the EMPTY check-box tag wave (the set's own tags are off: `checkBoxWaveAt` is not passed): a WHITE
//                   card (brighter than every facade) with a heavy ink outline and an EMPTY ink box on rows 0-3, each hung
//                   at its own small angle (tags, not framed plaques), ~30 px on row 0, springing in row by row; door
//                   #4's tag is the same tag with the one ink TICK.
//   FixedPool     door #4's light at the doorstep: the set's cream path down the street is covered (it read as a
//                 necktie) and a short stepped peach pool (two flat ellipses) sits on the kerb under the glow arch.

import React from 'react';
import {Fill, Ink, palette, useTime, line, rand, mat, XG, misreg, springAt, springs, clamp} from '../../lib';
import {PathBuf, mix} from '../../lib/cine/util';
import {atmos} from '../../lib/cine/atmosphere';
import {TERRACE, FacadeDoor} from '../shared/sets';
import {ChromeSlot, PlaqueSlot} from '../shared/sets/propSlots';
import {Lock} from '../shared/props';
import {B} from './beats';
import {camAt} from './camera';
import {A2_BAND_UNTIL} from './matchcut';

const ROWS = TERRACE.rows;
const SEED = 'terr';
const COLORS = [palette.cream, palette.sand, palette.tan, palette.mintPale];
const HAZE = TERRACE.hazeFrom;
const EXT: [number, number] = [-700, 1780];
const f2 = (n: number) => n.toFixed(2);

/** The set's numbers (TerraceHill.tsx), mirrored: the initial hill half-width, its stair column, its on-screen ink. */
const halfW = (k: number) => 610 - Math.min(1, k / 16) * 300;
const setStairX = (k: number) => 612 + (k % 2 ? 1 : -1) * 6 * Math.pow(0.8, k);
const SCREEN_INK = [3.4, 2.2, 1.6, 1.6];
const WORLD_INK = [0.85, 0.6, 0.55, 0.5, 0.45, 0.4];
const rowInk = (k: number, zoom: number) => {
  const scr = Math.max((WORLD_INK[k] ?? 0) * zoom, SCREEN_INK[k] ?? 0);
  return scr < 1.2 ? 0 : scr / zoom;
};
const tint = (c: string, k: number) => (k <= 2 ? c : atmos(c, Math.min(1, k / (HAZE + 3)), 'day', {clear: 0.2}));

/** Timing: the terraces extend at the frame's sides on 'server' (also passed to TerraceHill `extendAt`); the walls'
 *  ink and the stairs draw on on 'every'; the tag wave from 'single' + 0.10. */
export const EXTEND_AT = B.server - 0.05;
const DRAW_AT = B.every;
const TAG_STEP = 0.075;

// ---------------------------------------------------------------- per-house bookkeeping

type House = {j: number; x: number; cx: number; ci: number; gap: boolean; mine: boolean};

/** My stair columns (rows 1-5): the house whose centre is nearest these x. */
const MY_STAIRS = [168, 912];
const myStairJ = (k: number, tx: number) => {
  const R = ROWS[k];
  return Math.round((tx - R.x0 - R.w / 2) / R.w);
};

function housesOf(k: number): House[] {
  const R = ROWS[k];
  const out: House[] = [];
  const j0 = Math.floor((EXT[0] - R.x0) / R.w) - 1;
  const j1 = Math.ceil((EXT[1] - R.x0) / R.w) + 1;
  for (let j = j0; j <= j1; j++) {
    const x = R.x0 + j * R.w;
    const cx = x + R.w / 2;
    if (cx < EXT[0] || cx > EXT[1]) continue;
    const gap = k >= 1 && k <= 6 && Math.abs(cx - setStairX(k)) < R.w * 0.5;
    const mine = !gap && k >= 1 && k <= 5 && MY_STAIRS.some((tx) => myStairJ(k, tx) === j);
    const ci = k === 1 && j === 0 ? 2 : Math.floor(rand(SEED, `hill/${k}/${j}`) * COLORS.length);
    out.push({j, x, cx, ci, gap, mine});
  }
  return out;
}
const HOUSES = ROWS.slice(0, HAZE).map((_, k) => housesOf(k));
const inCore = (k: number, cx: number) => Math.abs(cx - 540) <= halfW(k);

// ---------------------------------------------------------------- static per-row geometry (core / edges)

type RowGeo = {
  coping: string;
  wall: string;
  bandInk: string;
  joints: string;
  stairFill: string;
  stairInk: string;
  flat: string[]; // rows 4+: light / mid / dark facades
  roofs: string;
  doors: string;
};

function rowGeo(k: number, part: 'core' | 'edge'): RowGeo {
  const R = ROWS[k];
  const u = R.s;
  const pick = (h: House) => (part === 'core' ? inCore(k, h.cx) : !inCore(k, h.cx));
  const hs = HOUSES[k].filter(pick);
  const g: RowGeo = {coping: '', wall: '', bandInk: '', joints: '', stairFill: '', stairInk: '', flat: ['', '', ''], roofs: '', doors: ''};
  if (!hs.length) return g;
  const xa = Math.min(...hs.map((h) => h.x));
  const xb = Math.max(...hs.map((h) => h.x + R.w));
  if (k >= 1) {
    const P = ROWS[k - 1];
    const yGround = R.base - 9 * u; // where the row's houses stand (their doors end at base - 10.5 u)
    const yLip = R.base - 5 * u;
    const yRoof = P.top + 3 * P.s; // the row below's roof line
    const cp = new PathBuf(2);
    cp.rect(xa, yGround, xb - xa, yLip - yGround);
    const wl = new PathBuf(2);
    wl.rect(xa, yLip, xb - xa, yRoof - yLip);
    g.coping = cp.d;
    g.wall = wl.d;
    const sd = `s9t/${k}/${part}`;
    // per-house pen strokes (a long sketched line drifts tens of px across 2,500 px), overshooting into the neighbours
    let bi = '';
    for (const h of hs) {
      const ov = () => [(1 + 4 * rand(sd, `o${h.j}/${bi.length % 7}`)) * u, (1 + 4 * rand(sd, `p${h.j}/${bi.length % 5}`)) * u] as [number, number];
      bi += line(h.x, yGround, h.x + R.w, yGround, {seed: `${sd}/g${h.j}`, over: ov(), breaks: false, drift: 0.4});
      bi += line(h.x, yRoof, h.x + R.w, yRoof, {seed: `${sd}/r${h.j}`, over: ov(), breaks: false, drift: 0.4});
      if (k <= 3 && rand(sd, `l${h.j}`) < 0.7) bi += line(h.x + 2 * u, yLip, h.x + R.w - 2 * u, yLip, {seed: `${sd}/l${h.j}`, over: 0, breaks: false, drift: 0.3});
    }
    g.bandInk = bi;
    if (k <= 3) {
      // stone joints on the wall face: short vertical ticks, seeded, ~3 per house
      let d = '';
      for (const h of hs) {
        for (let i = 0; i < 3; i++) {
          if (rand(sd, `${h.j}/${i}`) < 0.35) continue;
          const jx = h.x + R.w * (0.15 + 0.32 * i + 0.1 * rand(sd, `x${h.j}/${i}`));
          d += `M${f2(jx)} ${f2(yLip + 0.5 * u)}V${f2(yRoof - 0.4 * u)}`;
        }
      }
      g.joints = d;
    }
  }
  for (const h of hs) {
    if (h.mine) {
      // my switchback stair: the column becomes a stair cut into the terraces, its flight drawn on at 'every'
      const st = new PathBuf(2);
      st.rect(h.x, R.top, R.w, R.h);
      g.stairFill += st.d;
      const left = MY_STAIRS[0] === MY_STAIRS.find((tx) => myStairJ(k, tx) === h.j);
      const dir = (k % 2 ? -1 : 1) * (left ? 1 : -1);
      const sx = h.cx;
      const a = sx - dir * R.w * 0.3;
      const b = sx + dir * R.w * 0.3;
      const tw = dir * R.w * 0.16;
      let d = `M${f2(a)} ${f2(R.base)}L${f2(b)} ${f2(R.top)}M${f2(a + tw)} ${f2(R.base)}L${f2(b + tw)} ${f2(R.top)}`;
      for (let s = 1; s < 8; s++) {
        const q = s / 8;
        d += `M${f2(a + (b - a) * q)} ${f2(R.base - R.h * q)}l${f2(tw)} 0`;
      }
      // the landing at the top of the flight (a short ledge on the next terrace)
      d += `M${f2(b - dir * R.w * 0.06)} ${f2(R.top + 1.5 * u)}h${f2(dir * R.w * 0.34)}`;
      g.stairInk += d;
      continue;
    }
    if (k >= 4 && !h.gap) {
      const tone = COLORS[h.ci] === palette.tan ? 2 : COLORS[h.ci] === palette.sand ? 1 : 0;
      // from under the band above (its wall runs down to this row's top + 3 u), a roof slab right under that roof line
      const pb = new PathBuf(2);
      pb.rect(h.x, R.top + 3 * u, R.w + 0.4, R.h - 3 * u);
      g.flat[tone] += pb.d;
      const rf = new PathBuf(2);
      rf.rect(h.x, R.top + 3 * u, R.w * (0.55 + 0.3 * rand(SEED, `rf${k}/${h.j}`)), 5 * u);
      g.roofs += rf.d;
      const dr = new PathBuf(2);
      dr.rect(h.x + 34 * u, R.top + 97.5 * u, 26 * u, 50 * u);
      g.doors += dr.d;
    }
  }
  return g;
}
const GEO = ROWS.slice(0, HAZE).map((_, k) => ({core: rowGeo(k, 'core'), edge: rowGeo(k, 'edge')}));

// ---------------------------------------------------------------- camera helpers (the set's reveal + extension)

const screenY = (t: number, wy: number) => {
  const c = camAt(t);
  return (wy - c.y) * c.zoom + 960;
};
const revealOf = (t: number, k: number) => clamp((screenY(t, ROWS[k].top) - TERRACE.revealFloor) / 14 + 1);
const extendedAt = (t: number, k: number) => t >= EXTEND_AT + k * 0.03;
const revealXf = (reveal: number, y: number, node: React.ReactNode) => (reveal >= 1 ? node : reveal <= 0 ? null : <XG m={mat.about(mat.scale(1, reveal), 540, y)}>{node}</XG>);

// ---------------------------------------------------------------- the check-box tags (my wave)

/** Tag width in world px (k x 19 house units, with the set's on-screen floors on rows 0-3). Rows 0-1 a touch larger
 *  (~30 / 24 px at rest). */
const TAG_K = [1.58, 1.5, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4];
const tagSize = (k: number, zoom: number) => Math.max(TAG_K[k] * 19 * ROWS[k].s, (TERRACE.checkBox.minScreen[k] ?? 0) / zoom, 4);
const hangOf = (k: number, x: number): [number, number] => [x + TERRACE.checkBox.hang[0] * ROWS[k].s, ROWS[k].top + TERRACE.checkBox.hang[1] * ROWS[k].s];

/** A tag hanging from (hx, hy), swung by `a` radians about the hang point: a slightly skewed card, an EMPTY box, the
 *  string loop. Points are rotated by hand so hundreds batch into one path per part. */
const rot = (hx: number, hy: number, a: number) => {
  const c = Math.cos(a);
  const sn = Math.sin(a);
  return (dx: number, dy: number) => `${f2(hx + dx * c - dy * sn)} ${f2(hy + dx * sn + dy * c)}`;
};
const tagQuad = (hx: number, hy: number, s: number, a = 0) => {
  const P = rot(hx, hy, a);
  return `M${P(-s * 0.46, s * 0.22)}L${P(s * 0.5, s * 0.12)}L${P(s * 0.47, s * 0.98)}L${P(-s * 0.5, s * 1.02)}Z`;
};
const tagBox = (hx: number, hy: number, s: number, a = 0) => {
  const P = rot(hx, hy, a);
  const b = s * 0.25;
  const by = s * 0.58;
  return `M${P(-b, by - b)}L${P(b, by - b)}L${P(b, by + b)}L${P(-b, by + b)}Z`;
};
const tagLoop = (hx: number, hy: number, s: number, a = 0) => {
  const P = rot(hx, hy, a);
  return `M${P(-s * 0.2, s * 0.18)}L${P(0, -s * 0.06)}L${P(s * 0.2, s * 0.14)}`;
};
/** Each tag hangs at its own small angle (+-7 deg, seeded): hand-hung tags, not a grid of framed plaques. */
const swingOf = (k: number, j: number) => (rand('s9tag', `${k}/${j}`) - 0.5) * 0.24;

const RowTags: React.FC<{k: number; zoom: number; extended: boolean}> = ({k, zoom, extended}) => {
  const t = useTime();
  const at = B.tags + k * TAG_STEP;
  if (t < at) return null;
  const pop = springAt(t, at, springs.pop);
  if (pop <= 0.02) return null;
  const s = tagSize(k, zoom) * pop;
  const inked = k <= 3;
  let body = '';
  let box = '';
  let loop = '';
  for (const h of HOUSES[k]) {
    if (h.gap || h.mine || (k === 0 && h.j === 0)) continue;
    if (!extended && !inCore(k, h.cx)) continue;
    if (h.cx < -60 || h.cx > 1140) continue;
    const [hx, hy] = hangOf(k, h.x);
    const a = swingOf(k, h.j);
    body += tagQuad(hx, hy, s, a);
    box += tagBox(hx, hy, s, a);
    if (inked) loop += tagLoop(hx, hy, s, a);
  }
  const sc = (px: number) => px / zoom;
  return (
    <>
      <Fill d={body} color={palette.white} offset={false} mode="snap" seed={`s9tg${k}/b`} />
      {inked ? null : <Fill d={box} color={tint(palette.sand, k)} offset={false} mode="snap" seed={`s9tg${k}/x`} />}
      {inked ? (
        <>
          <Ink d={loop} width={sc(1.6)} color={palette.tealDark} taper={false} vary={0} seed={`s9tg${k}/lp`} />
          <Ink d={body} width={sc(k <= 1 ? 1.8 : 1.4)} taper={false} vary={0} seed={`s9tg${k}/o`} />
          <Ink d={box} width={sc(k === 0 ? 2.6 : k === 1 ? 2.2 : 1.6)} taper={false} vary={0} seed={`s9tg${k}/xi`} />
        </>
      ) : null}
    </>
  );
};

/** Door #4's tag: the same white tag + empty box, and the ONE tick (ink, drawn on, overshooting the box). */
export const House4Tag: React.FC = () => {
  const t = useTime();
  const at = B.tags;
  if (t < at) return null;
  const zoom = camAt(t).zoom;
  const pop = springAt(t, at, springs.pop);
  const s = tagSize(0, zoom) * pop;
  const H = TERRACE.house4.facade;
  const [hx, hy] = [H[0] + TERRACE.checkBox.hang[0], H[1] + TERRACE.checkBox.hang[1]];
  const b = s * 0.25;
  const by = hy + s * 0.58;
  const tick = `M${f2(hx - b * 0.85)} ${f2(by - b * 0.05)}L${f2(hx - b * 0.2)} ${f2(by + b * 0.7)}L${f2(hx + b * 1.25)} ${f2(by - b * 1.25)}`;
  return (
    <>
      <Fill d={tagQuad(hx, hy, s)} color={palette.white} offset={false} mode="snap" seed="s9h4tag/b" />
      <Ink d={tagLoop(hx, hy, s)} width={1.6 / zoom} color={palette.tealDark} taper={false} vary={0} seed="s9h4tag/lp" />
      <Ink d={tagQuad(hx, hy, s)} width={1.8 / zoom} taper={false} vary={0} seed="s9h4tag/o" />
      <Ink d={tagBox(hx, hy, s)} width={2.6 / zoom} taper={false} vary={0} seed="s9h4tag/xi" />
      <Ink d={tick} at={at + 0.06} width={3 / zoom} taper={false} seed="s9h4tag/tick" />
    </>
  );
};

// ---------------------------------------------------------------- the dressing

const RowDress: React.FC<{k: number; zoom: number; extended: boolean}> = ({k, zoom, extended}) => {
  const parts = extended ? [GEO[k].core, GEO[k].edge] : [GEO[k].core];
  const iw = rowInk(k, zoom);
  // the retaining-wall face one step darker than the tan houses (so a wall never merges with a tan facade), stepping
  // toward the sky with the row like everything else
  const wall = atmos(mix(palette.tan, palette.brown, 0.45), Math.min(1, k / (HAZE + 1)), 'day', {clear: 0.1});
  const coping = tint(palette.sand, k);
  const off: [number, number] | false = k <= 3 ? [(misreg.dx * 2) / zoom, (misreg.dy * 2) / zoom] : false;
  const tones = [tint(mix(palette.cream, palette.sand, 0.25), k), tint(palette.sand, k), tint(palette.tan, k)];
  const roof = tint(mix(palette.tan, palette.tealDark, 0.25), k);
  const door = tint(palette.teal, k);
  return (
    <>
      {parts.map((g, i) => (
        <React.Fragment key={i}>
          {g.flat.map((d, ti) => (d ? <Fill key={ti} d={d} color={tones[ti]} offset={false} mode="snap" seed={`s9t/fl${k}/${i}/${ti}`} /> : null))}
          {g.roofs ? <Fill d={g.roofs} color={roof} offset={false} mode="snap" seed={`s9t/rf${k}/${i}`} /> : null}
          {g.doors ? <Fill d={g.doors} color={door} offset={false} mode="snap" seed={`s9t/dr${k}/${i}`} /> : null}
          {g.stairFill ? <Fill d={g.stairFill} color={wall} offset={false} mode="snap" seed={`s9t/sf${k}/${i}`} /> : null}
          {g.wall ? <Fill d={g.wall} color={wall} offset={false} mode="snap" seed={`s9t/w${k}/${i}`} /> : null}
          {g.coping ? <Fill d={g.coping} color={coping} offset={off} mode="snap" seed={`s9t/c${k}/${i}`} /> : null}
          {iw > 0 && g.joints ? <Ink d={g.joints} width={iw * 0.6} taper={false} vary={0} seed={`s9t/j${k}/${i}`} /> : null}
          {iw > 0 && g.bandInk ? <Ink d={g.bandInk} at={DRAW_AT + k * 0.03} order="all" width={iw} taper={false} vary={0.05} seed={`s9t/bi${k}/${i}`} /> : null}
          {g.stairInk ? <Ink d={g.stairInk} at={DRAW_AT + 0.02 + k * 0.05} order="all" width={Math.max(iw * 0.85, 1.3 / zoom)} taper={false} vary={0} seed={`s9t/si${k}/${i}`} /> : null}
        </React.Fragment>
      ))}
      <RowTags k={k} zoom={zoom} extended={extended} />
    </>
  );
};

/** Draw in TerraceHill's 'hill' wrap, after the set's rows (and after NearLodRow0). */
export const TerraceDress: React.FC = () => {
  const t = useTime();
  if (t < A2_BAND_UNTIL) return null;
  const zoom = camAt(t).zoom;
  const out: React.ReactNode[] = [];
  for (let k = HAZE - 1; k >= 0; k--) {
    const reveal = revealOf(t, k);
    if (reveal <= 0) continue;
    out.push(<React.Fragment key={k}>{revealXf(reveal, ROWS[k].base, <RowDress k={k} zoom={zoom} extended={extendedAt(t, k)} />)}</React.Fragment>);
  }
  return <>{out}</>;
};

// ---------------------------------------------------------------- row 0 near LOD

/** Row 0's houses (not #4) with real detail from the ghost's pop on. Draw in TerraceHill's 'hill' wrap, after the rows,
 *  before TerraceDress (the tags and the row-1 band go over it). */
export const NearLodRow0: React.FC = () => {
  const t = useTime();
  if (t < A2_BAND_UNTIL) return null;
  const c = camAt(t);
  const zoom = c.zoom;
  const R = ROWS[0];
  const x0 = c.x - 540 / zoom - R.w;
  const x1 = c.x + 540 / zoom + R.w;
  const W = Math.max(0.85, 1.9 / zoom);
  const WS = Math.max(0.85, 3.4 / zoom);
  const out: React.ReactNode[] = [];
  for (const h of HOUSES[0]) {
    if (h.j === 0 || h.x + R.w < x0 || h.x > x1) continue;
    const col = COLORS[h.ci];
    const top = R.top;
    const sd = `s9n0/${h.j}`;
    out.push(
      <React.Fragment key={h.j}>
        <Fill rect={[h.x, top, R.w + 0.3, R.h]} color={col} offset={[misreg.dx / zoom, misreg.dy / zoom]} mode="snap" seed={`${sd}/f`} />
        {col !== palette.tan ? <Fill rect={[h.x, top, R.w * 0.18, R.h]} color={palette.sand} offset={false} mode="snap" seed={`${sd}/s`} /> : null}
        <Ink d={line(h.x, R.base, h.x, top, {seed: `${sd}/w`, over: [0, 3]}) + line(h.x + 3, top + 8, h.x + R.w - 3, top + 8, {seed: `${sd}/c`, over: [1, 3]})} width={WS} taper={false} vary={0} seed={`${sd}/wi`} />
        <ChromeSlot x={h.x + 17.5} y={top + 30} w={55} h={35} width={W} seed={`${sd}/bw`} />
        <FacadeDoor r={[h.x + 32.5, top + 97.5, 30, 50]} width={W} seed={`${sd}/d`} />
        <PlaqueSlot x={h.x + 18} y={top + 110} size={8} width={Math.max(0.4, 1 / zoom)} seed={`${sd}/p`} />
        <Lock x={h.x + 57.5} y={top + 122.5} size={10.5} ink={Math.max(0.6, 1.2 / zoom)} seed={`${sd}/l`} />
      </React.Fragment>,
    );
  }
  return <>{out}</>;
};

// ---------------------------------------------------------------- the fixed door's light at the doorstep

/** The set's cream path (TerraceHill FIXED_PATH, (516-544, 1500) -> (448-612, 2080)) covered with the street, the
 *  kerb strip and lines re-drawn with the set's own seeds on top (pixel-identical), then a stepped peach pool on the
 *  kerb under door #4. Draw in TerraceHill's 'street' wrap, after the street, from `fixedAt`. */
export const FixedPool: React.FC = () => {
  const t = useTime();
  if (t < B.single) return null;
  const zoom = camAt(t).zoom;
  const base = ROWS[0].base;
  return (
    <>
      <Fill d={`M512 ${base}L548 ${base}L618 2090L442 2090Z`} color={palette.mintPale} offset={false} mode="snap" seed="s9pool/cover" />
      <Fill rect={[430, base, 200, 10]} color={palette.sand} offset={false} mode="snap" seed="s9pool/kerb" />
      <Ink d={line(-700, base + 10, 1780, base + 10, {seed: `${SEED}/k1`, over: 0}) + line(-40, base + 34, 1120, base + 35, {seed: `${SEED}/k2`, over: 0})} width={Math.max(0.85, 3.4 / zoom)} taper={false} vary={0} seed={`${SEED}/kerb`} />
      <Fill d="M494 1506a36 7 0 1 0 72 0a36 7 0 1 0 -72 0Z" color={palette.peach} offset={false} mode="snap" seed="s9pool/p" />
      <Fill d="M514 1505.5a16 3.2 0 1 0 32 0a16 3.2 0 1 0 -32 0Z" color={palette.cream} offset={false} mode="snap" seed="s9pool/c" />
    </>
  );
};
