// boards/small.tsx: K3's small lettered objects (TREATMENT.md section 9 K3; section 5 "Texts on objects"; section 8
// fairness): the paper NAME TAG over her (S4), the FINGERPOST (S4: one post, two arrow plates pointing west), the US
// NEWS BOX (S5 start), the viewpoint PLAQUE (S5 end) and a generic DOOR SIGN. The same family as StatementBoard's
// enamel boards: plum frames lit with coat plum on the sun side, cream faces (exact, never misregistered) with a shade
// edge, a plum keyline, brass screws, ink lettering in the caption hand (WorldText only, words only from texts.ts),
// warm colour shadows. Flat fills, NO opacity / gradient / blur, ever: a build is a pop, a spring or a pen.
//
//   <NameTag />        S4 (lane L3): screen-locked over her; builds 0.21 / 1.74, pops off 3.94 (scene s)
//   <Fingerpost />     S4 (lane L3): on the path plane; DEC plate pops 4.06, APR plate fill 4.59, pen done 4.94
//   <NewsBox />        S5 (lane L4): START coords (face x 470-780, y 880-1230); already there (`at` optional)
//   <Plaque />         S5 (lane L4): END coords; pops at 1.88 (22.43, ON "Pentagon"); auto-sized to `keySize`
//   <DoorSign x y />   any door: 1-3 lines (default CLASSIFIED / AUTHORIZED / PERSONNEL ONLY), sized by `size`
//
// CLOCK: every time is SCENE-LOCAL seconds (useTime() inside the shot = film time - the shot's start); the presets'
// defaults are their shot's beats from map.ts (SMALL_CLOCK). Pass `null` for "already there" (or "never" for `off`).
// EXIT: every piece un-builds with the loop (Fill / Ink / WorldText read useExit; `exit={false}` opts out).
// INK by size: mid 3.4 on the tag edge, the post and the plates; far 2.2 on details, the news box and the plaque;
// hair 1.6 for keylines and rules; loose and open on outer contours only, never round the lettering.

import React from 'react';
import {CM, INK_PX} from '../../palette';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {circle, glint, line, poly, polyPath, type Pt} from '../../../lib/sketch';
import {clamp, ease, prog, springAt, springs, useTime} from '../../../lib/time';
import {XG, mat} from '../../../lib/xf';
import {useCaptionFont} from '../../../lib/font';
import {rand} from '../../../lib/rng';
import {S4, S5, shotById, type Rect, type XY} from '../../world/map';
import {TYPE, WorldText, textW} from './WorldText';
import {TXT_NAME_TAG, TXT_NEWS_BOX, TXT_PLAQUE, TXT_PLATES, TXT_SERVICE_DOOR} from './texts';
import {BOARD_COLORS, KEY_WEIGHT, mixHex} from './StatementBoard';
import {tiered} from '../tiers';

// ---------------------------------------------------------------- colour (CM tokens and flat mixes of them)

/** A flat sRGB step between two palette colours (k 0 = a). A colour, never drawn as a gradient. (= StatementBoard's
 *  `mixHex`: one implementation for the whole kit.) */
export const tone = mixHex;

/** Every colour these pieces use. The family colours ARE StatementBoard's BOARD_COLORS (frame, lit, shade, face,
 *  keyline, brass, lettering, shadow), so a tag, a plate and a board read as one kit and can never drift apart. */
export const SMALL_COLORS = {
  frame: BOARD_COLORS.frame,
  frameLit: BOARD_COLORS.frameLit,
  frameShade: BOARD_COLORS.frameShade,
  face: BOARD_COLORS.face,
  keyline: BOARD_COLORS.keyline,
  brass: BOARD_COLORS.screw,
  brassShade: BOARD_COLORS.screwSlot,
  lettering: BOARD_COLORS.lettering,
  /** Ground shadows: a warm shade of the paving (colour, never grey). */
  shadow: BOARD_COLORS.shadow,
  // the news box: a slate honour box, lit on the sun side (screen left), no brand
  box: CM.coatSlate,
  boxLit: tone(CM.coatSlate, CM.lampCore, 0.36),
  boxShade: tone(CM.coatSlate, CM.anchor, 0.34),
  boxDoor: tone(CM.coatSlate, CM.anchor, 0.13),
  chrome: CM.limestone,
  chromeShade: CM.stoneShade,
  glassGlint: tone(CM.glass, CM.shadeCool, 0.38),
  pageShade: tone(CM.paper, CM.stoneShade, 0.55),
  pageRule: tone(CM.ink, CM.paper, 0.3),
  // the plaque: a bronze frame round a limestone face, on a bronze post
  bronze: CM.coatMustard,
  bronzeDeep: CM.line,
  plaqueFace: CM.limestone,
} as const;

/** The fills' misregistration from their line (px, ~2.7: inside the house 2-5 px, the boards' direction: right and
 *  down). Text-bearing faces stay exact (offset false). */
export const MISREG: [number, number] = [2.2, 1.5];

// Key lines (>= 56 px) use StatementBoard's KEY_WEIGHT (imported above): ONE faux weight for every key in the film.

// ---------------------------------------------------------------- the clocks (scene-local defaults from map.ts)

const r3 = (v: number) => Math.round(v * 1000) / 1000;
const S4_START = shotById('V2S4').start; // 14.86
const S5_START = shotById('V2S5').start; // 20.55
const PLAQUE_FILM_T = S5.beats.find((b) => /plaque/.test(b.what))?.t0 ?? 22.43;

/** Scene-local times of every preset (film time - shot start). */
export const SMALL_CLOCK = {
  /** S4 (start 14.86): build 1 on "She" 15.07, build 2 on 16.60, pops off 18.80. */
  nameTag: {at: r3(S4.nameTagBuilds[0] - S4_START), growAt: r3(S4.nameTagBuilds[1] - S4_START), off: r3(S4.nameTagOffAt - S4_START)},
  /** S4: the DEC plate pops on "military" 18.92 (pen done ~19.36); the APR plate's fill 19.45, its pen done ON "heading" 19.80. */
  fingerpost: {decAt: r3(S4.decPlateAt - S4_START), aprAt: r3(S4.aprPlatePen[0] - S4_START), aprEnd: r3(S4.aprPlatePen[1] - S4_START)},
  /** S5 (start 20.55): the plaque pops ON "Pentagon" 22.43 (p 0.70). */
  plaque: {at: r3(PLAQUE_FILM_T - S5_START)},
} as const;

// ---------------------------------------------------------------- shared helpers

/** Glyph extents of the caption hand (em, measured with fontTools): ascenders 0.715, caps 0.662, x-height 0.467,
 *  descenders 0.312, parentheses 0.79 above / 0.074 below. */
export const EM = {asc: 0.715, cap: 0.662, x: 0.467, desc: 0.312, paren: 0.79} as const;
/** Height of a line's ink above its baseline (px). */
export const inkTop = (text: string, size: number) => size * (/[()]/.test(text) ? EM.paren : /[A-Z0-9bdfhklt“”‘’]/.test(text) ? EM.asc : EM.x);
/** Depth of a line's ink below its baseline (px). */
export const inkBottom = (text: string, size: number) => size * (/[gjpqy]/.test(text) ? EM.desc : /[(),;]/.test(text) ? 0.09 : 0.01);

/** A build pop: 0 before `at`, then `from` -> 1 on the house pop spring (7 % overshoot, settled ~0.3 s). */
export const popK = (t: number, at: number | undefined, from = 0.3) => (at === undefined ? 1 : t < at ? 0 : from + (1 - from) * springAt(t, at, springs.pop));

/** Pops off: shrinks to nothing on an ease-in (`dur` s; WorldText's `off` grammar, no swell, so nothing ever grows
 *  past its built edges). 1 before `off`, 0 once gone. */
export const offK = (t: number, off: number | undefined, dur = 0.14) => {
  if (off === undefined || t < off) return 1;
  const k = prog(t, off, dur);
  return k >= 1 ? 0 : 1 - ease.inCubic(k);
};

const f1 = (v: number) => (Math.round(v * 10) / 10).toString();
/** A closed circle path (for fills; evenodd cuts holes). */
export const circlePath = (cx: number, cy: number, r: number) => `M${f1(cx - r)} ${f1(cy)}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0Z`;
/** A closed rect path. */
const rectD = (x0: number, y0: number, x1: number, y1: number) => polyPath([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
/** A closed rect with rounded corners. */
function roundRectD(x0: number, y0: number, x1: number, y1: number, r: number): string {
  const q = Math.max(0, Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2));
  return `M${f1(x0 + q)} ${f1(y0)}H${f1(x1 - q)}Q${f1(x1)} ${f1(y0)} ${f1(x1)} ${f1(y0 + q)}V${f1(y1 - q)}Q${f1(x1)} ${f1(y1)} ${f1(x1 - q)} ${f1(y1)}H${f1(x0 + q)}Q${f1(x0)} ${f1(y1)} ${f1(x0)} ${f1(y1 - q)}V${f1(y0 + q)}Q${f1(x0)} ${f1(y0)} ${f1(x0 + q)} ${f1(y0)}Z`;
}

/** A convex polygon inset by d (every edge moved inward, neighbours re-intersected); either winding. */
export function insetPoly(pts: readonly Pt[], d: number): Pt[] {
  const n = pts.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % n];
    area += ax * by - bx * ay;
  }
  const s = area > 0 ? 1 : -1;
  const ls = pts.map((a, i) => {
    const b = pts[(i + 1) % n];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 1;
    return {ax: a[0] + (-dy / L) * s * d, ay: a[1] + (dx / L) * s * d, dx, dy};
  });
  return ls.map((l, i) => {
    const p = ls[(i + n - 1) % n];
    const det = p.dx * l.dy - p.dy * l.dx;
    if (Math.abs(det) < 1e-9) return [l.ax, l.ay] as Pt;
    const u = ((l.ax - p.ax) * l.dy - (l.ay - p.ay) * l.dx) / det;
    return [p.ax + p.dx * u, p.ay + p.dy * u] as Pt;
  });
}

/** Loose contour ink along a polyline: every edge starts on its corner and runs a few px past the next one, so a
 *  corner gets ONE pen tick (never a crossed X); `over` = [start, end] px, the end varied per edge (seeded). */
export function edgeInk(pts: readonly Pt[], closed: boolean, seed: string, over: [number, number] = [0.5, 5]): string {
  const n = pts.length;
  const segs = closed ? n : n - 1;
  let d = '';
  for (let i = 0; i < segs; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const end = over[1] * (0.45 + 0.9 * rand(seed, `o${i}`));
    d += line(a[0], a[1], b[0], b[1], {over: [over[0], end], jitter: 0.35, drift: 0.25, bow: 0.6, breaks: false, seed: `${seed}/${i}`});
  }
  return d;
}

/** Two brass screw heads with their slots (fills + ink), the boards' screws. */
const Screws: React.FC<{pts: XY[]; r: number; seed: string; exit: boolean}> = ({pts, r, seed, exit}) => {
  const slots = pts
    .map((p, i) => {
      const a = (0.35 + 0.9 * i) % Math.PI;
      const l = r * 0.75;
      return `M${f1(p.x - Math.cos(a) * l)} ${f1(p.y - Math.sin(a) * l)}L${f1(p.x + Math.cos(a) * l)} ${f1(p.y + Math.sin(a) * l)}`;
    })
    .join('');
  return (
    <>
      <Fill d={pts.map((p) => circlePath(p.x, p.y, r)).join('')} color={SMALL_COLORS.brass} offset={false} seed={`${seed}/screw`} exit={exit} />
      <Ink d={slots} width={Math.max(0.9, r * 0.34)} color={SMALL_COLORS.brassShade} taper={false} vary={0} seed={`${seed}/slot`} exit={exit} />
    </>
  );
};

// =================================================================================================================
// 1. PaperTag + NameTag (S4, lane L3)
// =================================================================================================================

/** One row of a paper tag. */
export type TagRow = {
  text: string;
  size: number;
  /** 0 = written in the first build; 1 = the second (the tag GROWS down to take it, `growAt`). */
  group?: 0 | 1;
  /** Space above this row beyond the default leading (px). */
  gap?: number;
  /** WorldText faux weight. */
  weight?: number;
  /** Pen duration (s). Default 0.18. */
  dur?: number;
};

/** Paper tag geometry (px): text pads, the luggage-tag head (clipped corners + the reinforced string hole), the
 *  plum keyline inset, the brass eyelet ring and its hole. */
export const TAG = {padL: 16, padR: 14, padTop: 15, padBottom: 13, head: 36, cut: 18, keyInset: 6, ring: 10.5, hole: 4.6} as const;

export type TagLayout = {
  /** Tag width and its heights after build 1 (h1) and build 2 (h2), px. */
  w: number;
  h1: number;
  h2: number;
  /** The text column: left edge and width (px from the tag's left edge). */
  textX: number;
  textW: number;
  /** Row baselines (px below the tag's top edge) and widths. */
  baselines: number[];
  widths: number[];
  head: number;
};

/** Measures a tag's rows (caption-hand widths, exact once the font has loaded) and lays them out top-down. */
export function tagLayout(rows: readonly TagRow[], hole: 'left' | 'right' | 'none' = 'right'): TagLayout {
  const head = hole === 'none' ? 0 : TAG.head;
  const widths = rows.map((r) => textW(r.text, r.size));
  const tw = Math.ceil(Math.max(0, ...widths));
  const baselines: number[] = [];
  let y = TAG.padTop + (rows.length ? inkTop(rows[0].text, rows[0].size) : 0);
  rows.forEach((r, i) => {
    if (i > 0) {
      const p = rows[i - 1];
      y += 0.3 * p.size + 0.72 * r.size + (r.gap ?? (p.size === r.size ? 4 : 7));
    }
    baselines.push(y);
  });
  const bottom = (g: 0 | 1) => {
    let last = -1;
    rows.forEach((r, i) => {
      if ((r.group ?? 0) <= g) last = i;
    });
    return last < 0 ? TAG.padTop + TAG.padBottom : baselines[last] + inkBottom(rows[last].text, rows[last].size) + TAG.padBottom;
  };
  return {w: TAG.padL + tw + TAG.padR + head, h1: bottom(0), h2: bottom(1), textX: (hole === 'left' ? head : 0) + TAG.padL, textW: tw, baselines, widths, head};
}

/** The luggage-tag outline: a rectangle whose head end (the string-hole side) has both corners clipped at 45 deg. */
function tagPts(x0: number, y0: number, w: number, h: number, side: 'left' | 'right' | 'none', c: number): Pt[] {
  const x1 = x0 + w;
  const y1 = y0 + h;
  const k = Math.min(c, h / 2 - 1);
  if (side === 'right') return [[x0, y0], [x1 - k, y0], [x1, y0 + k], [x1, y1 - k], [x1 - k, y1], [x0, y1]];
  if (side === 'left') return [[x0 + k, y0], [x1, y0], [x1, y1], [x0 + k, y1], [x0, y1 - k], [x0, y0 + k]];
  return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
}

export type PaperTagProps = {
  /** Top-left corner of the tag (px, before the tilt). */
  x: number;
  y: number;
  rows: readonly TagRow[];
  /** Where the thin ink leader ends (e.g. just above her head). null = no leader. It leaves the tag's bottom edge
   *  straight above this point (clamped to the text column). */
  to?: XY | null;
  /** Build 1 (scene s): the leader draws up from `to`, the paper pops out of it (spring), the edge inks, the pen
   *  writes the group-0 rows. Omit = already there. */
  at?: number;
  /** Build 2: the paper GROWS down on a spring (never a fade) and the pen writes the group-1 rows. Omit = the tag is
   *  full height from the start (group-1 rows follow group 0 in build 1). */
  growAt?: number;
  /** Pops off (shrinks into the leader's end). */
  off?: number;
  /** A slight tilt (deg, about the top-centre; the text stays vector-sharp). */
  tilt?: number;
  /** The head end with the reinforced string hole. */
  hole?: 'left' | 'right' | 'none';
  /** A short string loop through the eyelet, its tails hanging beside the head end (<= 7 px outside the tag). */
  string?: boolean;
  /** Edge ink width (default mid 3.4); the leader is thin (far 2.2). */
  ink?: number;
  leaderInk?: number;
  seed?: string;
  exit?: boolean;
};

/** A paper luggage tag on a thin ink leader: cream face, ink edge (loose, open), plum keyline, a brass-reinforced
 *  string hole in its clipped head end, rows in the caption hand. Grows down for a second build. */
const PaperTagBody: React.FC<PaperTagProps> = ({x, y, rows, to = null, at, growAt, off, tilt = 0, hole = 'right', string = true, ink = INK_PX.mid, leaderInk = INK_PX.far, seed = 'tag', exit = true}) => {
  useCaptionFont();
  const t = useTime();
  const L = tagLayout(rows, hole);
  if (at !== undefined && t < at) return null;
  const kOff = offK(t, off);
  if (kOff <= 0) return null;
  const C = SMALL_COLORS;
  const staged = growAt !== undefined && rows.some((r) => (r.group ?? 0) === 1);
  const grow = !staged ? 1 : t < (growAt as number) ? 0 : springAt(t, growAt as number, springs.pop);
  const h = L.h1 + (L.h2 - L.h1) * grow;
  const w = L.w;
  // the tilt turns about the top-centre, so the top edge stays put while the tag grows
  const cx = x + w / 2;
  const th = (tilt * Math.PI) / 180;
  const rot = (px: number, py: number): XY => ({x: cx + (px - cx) * Math.cos(th) - (py - y) * Math.sin(th), y: y + (px - cx) * Math.sin(th) + (py - y) * Math.cos(th)});
  const textL = x + L.textX;
  const lx = to ? clamp(to.x, textL + 12, textL + L.textW - 12) : cx;
  const B = rot(lx, y + h);
  const anchor = to ?? B;
  // times: the leader draws up (0.1 s), the paper pops out of it (house pop, 7 %), its edges ink, and once it has
  // landed (+0.24 s) the pen writes row after row
  const bodyAt = at === undefined ? undefined : at + (to ? 0.07 : 0);
  const kPop = popK(t, bodyAt, 0.25);
  const inkAt = bodyAt === undefined ? undefined : bodyAt + 0.07;
  const rowAt: (number | undefined)[] = [];
  let c0 = bodyAt === undefined ? undefined : bodyAt + 0.24;
  let c1 = staged ? (growAt as number) + 0.1 : undefined;
  for (const r of rows) {
    const d = (r.dur ?? 0.18) * 0.78;
    if (staged && (r.group ?? 0) === 1) {
      rowAt.push(c1);
      c1 = (c1 as number) + d;
    } else {
      rowAt.push(c0);
      if (c0 !== undefined) c0 += d;
    }
  }
  // shapes
  const pts = tagPts(x, y, w, h, hole, TAG.cut);
  const ex = hole === 'left' ? x + L.head / 2 + 2 : x + w - L.head / 2 - 2;
  const ey = y + Math.min(L.h1, h) / 2;
  const holeD = hole === 'none' ? '' : circlePath(ex, ey, TAG.hole);
  const paperD = polyPath(pts) + holeD;
  const keyD = poly(insetPoly(pts, TAG.keyInset), {closed: true, joined: true, jitter: 0.35, seed: `${seed}/key`});
  const edgeD = edgeInk(pts, true, `${seed}/edge`, [0.5, 4.5]);
  const leaderD = to ? line(to.x, to.y, B.x, B.y, {over: [0, 1], bow: 1.6, drift: 0, jitter: 0.3, seed: `${seed}/leader`}) : '';
  // the string: a short loop through the eyelet, over the head end's edge, two loose tails hanging beside it
  const sx = hole === 'left' ? -1 : 1;
  const xe = hole === 'left' ? x : x + w;
  const stringD =
    string && hole !== 'none'
      ? `M${f1(ex)} ${f1(ey - 1)}C${f1(ex + sx * 6)} ${f1(ey - 13)} ${f1(xe + sx * 5)} ${f1(ey - 13)} ${f1(xe + sx * 6)} ${f1(ey - 2)}` +
        `C${f1(xe + sx * 7)} ${f1(ey + 9)} ${f1(xe + sx * 2)} ${f1(ey + 19)} ${f1(xe + sx * 4)} ${f1(ey + 31)}` +
        `M${f1(ex + sx * 1)} ${f1(ey + 2)}C${f1(ex + sx * 7)} ${f1(ey + 10)} ${f1(xe + sx * 2)} ${f1(ey + 6)} ${f1(xe + sx * 3)} ${f1(ey + 12)}` +
        `C${f1(xe + sx * 4)} ${f1(ey + 18)} ${f1(xe + sx * 7)} ${f1(ey + 24)} ${f1(xe + sx * 6)} ${f1(ey + 37)}`
      : '';
  return (
    <XG m={mat.about(mat.scale(kOff), anchor.x, anchor.y)}>
      {to ? (
        <>
          <Ink d={leaderD} width={leaderInk} color={C.lettering} taper={false} vary={0} at={at} seed={`${seed}/leadI`} exit={exit} graphic />
          <Fill d={circlePath(to.x, to.y, 2.7)} color={C.lettering} offset={false} at={at} mode="snap" seed={`${seed}/dot`} exit={exit} />
        </>
      ) : null}
      {kPop > 0.001 ? (
        <XG m={mat.about(mat.scale(kPop), B.x, B.y)}>
          <XG m={mat.about(mat.rotate(tilt), cx, y)}>
            <Fill d={paperD} color={C.face} rule="evenodd" offset={false} seed={`${seed}/paper`} exit={exit} />
            <Ink d={keyD} width={INK_PX.hair} color={C.keyline} taper={false} vary={0} at={inkAt} seed={`${seed}/keyI`} exit={exit} graphic />
            {hole !== 'none' ? (
              <>
                <Fill d={circlePath(ex, ey, TAG.ring) + holeD} color={C.brass} rule="evenodd" offset={false} seed={`${seed}/ring`} exit={exit} />
                <Ink
                  d={circle(ex, ey, TAG.ring, {seed: `${seed}/ringO`, wobble: 0.02, overlap: 8}) + circle(ex, ey, TAG.hole + 0.5, {seed: `${seed}/ringH`, wobble: 0.02, overlap: 4})}
                  width={INK_PX.hair}
                  color={C.brassShade}
                  taper={false}
                  vary={0}
                  at={inkAt}
                  seed={`${seed}/ringI`}
                  exit={exit}
                />
              </>
            ) : null}
            <Ink d={edgeD} width={ink} color={C.lettering} open={0.08} at={inkAt} seed={`${seed}/edgeI`} exit={exit} />
            {stringD ? <Ink d={stringD} width={INK_PX.hair} color={C.lettering} taper={false} vary={0} at={inkAt} seed={`${seed}/string`} exit={exit} thing /> : null}
          </XG>
        </XG>
      ) : null}
      {/* the rows ride the tilt but not the pop: the pen writes on paper that has landed, so letters never bob */}
      <XG m={mat.about(mat.rotate(tilt), cx, y)}>
        {rows.map((r, i) => (
          <WorldText key={i} x={textL} y={y + L.baselines[i]} size={r.size} text={r.text} at={rowAt[i]} mode="pen" dur={r.dur ?? 0.18} weight={r.weight ?? 0} seed={`${seed}/r${i}`} exit={exit} />
        ))}
      </XG>
    </XG>
  );
};
export const PaperTag = tiered('support', {}, PaperTagBody);

/** S4's name tag rows (TREATMENT section 5): the name 44 px + three role rows (build 1, 15.07); two rows + the BBC
 *  source (build 2, 16.60). Body never under 30 px; the credit at 18. */
export const NAME_TAG_ROWS: readonly TagRow[] = [
  {text: TXT_NAME_TAG.name, size: 44, weight: 0.7, dur: 0.24},
  ...TXT_NAME_TAG.role.map((text): TagRow => ({text, size: TYPE.bodySmall, dur: 0.16})),
  ...TXT_NAME_TAG.more.map((text): TagRow => ({text, size: TYPE.bodySmall, group: 1, dur: 0.16})),
  {text: TXT_NAME_TAG.credit, size: TYPE.credit, group: 1, dur: 0.18},
];

/** The leader's end: just above her head (S4.her: x 720, head top y 900). */
export const NAME_TAG_TO: XY = {x: S4.her.x, y: S4.her.feetY - S4.her.h - 8};

export type NameTagProps = {
  /** Top-left (default x 600, y 605: inside S4.nameTag's x 600-880 and y >= 600, clear of the post at x 575). */
  x?: number;
  y?: number;
  to?: XY | null;
  /** Scene-local times (S4 clock): build 1 0.21, build 2 1.74, off 3.94. null = already there / never. */
  at?: number | null;
  growAt?: number | null;
  off?: number | null;
  tilt?: number;
  /** The string loop through the eyelet (default on). */
  string?: boolean;
  seed?: string;
  exit?: boolean;
};

/** S4's name tag over her (lane L3), screen-locked. Measured layout (Patrick Hand): 269 px wide (x 600-869; the text
 *  column x 616-819), 180 px tall after build 1 (y 605-785), 270 after build 2 (y 605-875); tilted -1.2 deg its
 *  corners stay inside x 600-875, y 602-878 (above her head at 900); the leader from ~(724, 785 -> 876) to (720, 892). */
const NameTagBody: React.FC<NameTagProps> = ({
  x = S4.nameTag.x0,
  y = S4.nameTag.y0 + 5,
  to = NAME_TAG_TO,
  at = SMALL_CLOCK.nameTag.at,
  growAt = SMALL_CLOCK.nameTag.growAt,
  off = SMALL_CLOCK.nameTag.off,
  tilt = -1.2,
  string = true,
  seed = 'nameTag',
  exit = true,
}) => <PaperTag x={x} y={y} rows={NAME_TAG_ROWS} to={to} at={at ?? undefined} growAt={growAt ?? undefined} off={off ?? undefined} tilt={tilt} hole="right" string={string} seed={seed} exit={exit} />;

// =================================================================================================================
// 2. Fingerpost (S4, lane L3): ONE post, two arrow plates pointing WEST (screen left), top-to-bottom = time order
// =================================================================================================================

/** Fingerpost geometry (px): the post's width, the arrow point's depth, the plum rim, row baselines (fractions of the
 *  plate height: key 0.54, credit 0.77), the text inset after the point, the key-body gap, the margin to the post. */
export const POST = {w: 24, point: 30, rim: 6, keyBase: 0.54, creditBase: 0.77, padL: 5, gap: 16, margin: 12} as const;

export type PlateText = {key: string; body: string; credit: string};

/** The largest body size (34 -> 30) at which every plate holds key (56) + body side by side and its credit (18),
 *  with POST.margin before the post. S4's plates (450 px, point 30): 31 px. */
export function plateBodySize(plates: {rect: Rect; text: PlateText}[], postX: number, postW: number = POST.w): number {
  const lim = postX - postW / 2 - POST.margin;
  for (let s = 34; s > 30; s--) {
    const fits = plates.every(({rect, text}) => {
      const x0 = rect.x0 + POST.point + POST.padL;
      return x0 + textW(text.key, TYPE.key) + POST.gap + textW(text.body, s) <= lim && x0 + textW(text.credit, TYPE.credit) <= lim;
    });
    if (fits) return s;
  }
  return TYPE.bodySmall;
}

export type ArrowPlateProps = {
  /** The plate: x0 = the arrow's tip (west), y0..y1; it runs on behind the post to `rootX`. */
  rect: Rect;
  rootX: number;
  text: PlateText;
  bodySize?: number;
  /** The fill pops (swings out from the post on the `rise` spring). Omit = already there. */
  at?: number;
  /** The pen: ONE sweep left -> right over all rows, from penAt to penEnd (default at + 0.08 -> + 0.4). */
  penAt?: number;
  penEnd?: number;
  ink?: number;
  seed?: string;
  exit?: boolean;
};
export const NameTag = tiered('support', {}, NameTagBody);

/** One arrow plate: plum rim (misregistered), cream face (exact), a dark underside for its thickness, loose ink on
 *  the outer contour; row 1 = key 56 + body side by side on one baseline, row 2 = the credit 18. */
const ArrowPlateBody: React.FC<ArrowPlateProps> = ({rect, rootX, text, bodySize = 31, at, penAt, penEnd, ink = INK_PX.mid, seed = 'plate', exit = true}) => {
  useCaptionFont();
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const C = SMALL_COLORS;
  const {x0, y0, y1} = rect;
  const ym = (y0 + y1) / 2;
  const P = POST.point;
  // the swing-out rides the house `rise` spring (~3 % overshoot, full width by +0.14 s): the pen starts on a plate
  // that is still settling, so its letters ride the swing; a gentle spring keeps them from stretching
  const sx = at === undefined ? 1 : springAt(t, at, springs.rise);
  if (sx <= 0.001) return null;
  const sy = 0.72 + 0.28 * Math.min(1, sx);
  const outer: Pt[] = [[rootX, y0], [x0 + P, y0], [x0, ym], [x0 + P, y1], [rootX, y1]];
  const face = insetPoly(outer, POST.rim);
  const under: Pt[] = outer.map(([px, py]) => [px, py + 4]);
  const edgeD = edgeInk([[rootX - 6, y0], [x0 + P, y0], [x0, ym], [x0 + P, y1], [rootX - 6, y1]], false, `${seed}/edge`, [0.5, 5]);
  // the pen: one sweep at one speed over every row (a sign-writer's pass), so all rows complete together
  const tx = x0 + P + POST.padL;
  const kw = textW(text.key, TYPE.key);
  const bw = textW(text.body, bodySize);
  const cw = textW(text.credit, TYPE.credit);
  const bx = tx + kw + POST.gap;
  const xEnd = Math.max(bx + bw, tx + cw);
  const p0 = penAt ?? (at === undefined ? undefined : at + 0.08);
  const p1 = penEnd ?? (p0 === undefined ? undefined : p0 + 0.4);
  const v = p0 === undefined || p1 === undefined ? 1 : (xEnd - tx) / Math.max(0.05, p1 - p0);
  const rAt = (rx: number) => (p0 === undefined ? undefined : p0 + (rx - tx) / v);
  const rDur = (rw: number) => Math.max(0.06, rw / v);
  const inkAt = at === undefined ? undefined : at + 0.06;
  const kb = y0 + (y1 - y0) * POST.keyBase;
  const cb = y0 + (y1 - y0) * POST.creditBase;
  return (
    <XG m={mat.about(mat.scale(sx, sy), rootX, ym)}>
      <Fill d={polyPath(under)} color={C.frameShade} offset={MISREG} seed={`${seed}/under`} exit={exit} />
      <Fill d={polyPath(outer)} color={C.frame} offset={MISREG} seed={`${seed}/rim`} exit={exit} />
      <Fill d={polyPath(face)} color={C.face} offset={false} seed={`${seed}/face`} exit={exit} />
      <Ink d={edgeD} width={ink} open={0.1} at={inkAt} seed={`${seed}/edgeI`} exit={exit} />
      <WorldText x={tx} y={kb} size={TYPE.key} text={text.key} weight={KEY_WEIGHT} at={rAt(tx)} dur={rDur(kw)} seed={`${seed}/k`} exit={exit} />
      <WorldText x={bx} y={kb} size={bodySize} text={text.body} at={rAt(bx)} dur={rDur(bw)} seed={`${seed}/b`} exit={exit} />
      <WorldText x={tx} y={cb} size={TYPE.credit} text={text.credit} at={rAt(tx)} dur={rDur(cw)} seed={`${seed}/c`} exit={exit} />
    </XG>
  );
};
export const ArrowPlate = tiered('support', {}, ArrowPlateBody);

export type PostProps = {
  /** Centre x, the top of the shaft (the finial sits above it), the foot on the ground (px). */
  x: number;
  top: number;
  foot: number;
  w?: number;
  /** The post's own build (pops up from its foot). Omit = there. */
  at?: number;
  /** Clamp collars on the post (each pops with its plate). */
  collars?: {y: number; at?: number}[];
  ink?: number;
  seed?: string;
  exit?: boolean;
};

/** The painted post: a plum shaft lit on the sun side (left), a cap collar and a brass ball finial, a flared cast foot,
 *  clamp collars with brass bolts where the plates are fixed. */
const SignPostBody: React.FC<PostProps> = ({x, top, foot, w = POST.w, at, collars = [], ink = INK_PX.mid, seed = 'post', exit = true}) => {
  const t = useTime();
  const k = popK(t, at, 0.2);
  if (k <= 0.001) return null;
  const C = SMALL_COLORS;
  const hw = w / 2;
  const fy = foot - 36; // the top of the cast foot
  const ballR = 9;
  const ballY = top - 8 - 4 - ballR;
  const off = MISREG;
  const ink1 =
    line(x - hw, top + 1, x - hw, fy, {over: [0, 3], jitter: 0.5, seed: `${seed}/sl`}) +
    line(x + hw, top + 1, x + hw, fy, {over: [0, 3], jitter: 0.5, seed: `${seed}/sr`}) +
    line(x - hw - 6, top - 8, x + hw + 6, top - 8, {over: [1, 4], jitter: 0.4, seed: `${seed}/cap`}) +
    edgeInk([[x - 13, fy], [x - 19, foot], [x + 19, foot], [x + 13, fy]], false, `${seed}/foot`, [0.5, 4]);
  return (
    <XG m={mat.about(mat.scale(1, k), x, foot)}>
      {/* the shaft, its lit strip (west, the sun side) */}
      <Fill d={rectD(x - hw, top, x + hw, fy + 2)} color={C.frame} offset={off} seed={`${seed}/shaft`} exit={exit} />
      <Fill d={rectD(x - hw, top + 2, x - hw + 5, fy)} color={C.frameLit} offset={off} seed={`${seed}/lit`} exit={exit} />
      {/* the flared cast foot and its collar */}
      <Fill d={polyPath([[x - 13, fy], [x + 13, fy], [x + 19, foot], [x - 19, foot]])} color={C.frame} offset={off} seed={`${seed}/foot`} exit={exit} />
      <Fill d={polyPath([[x - 13, fy], [x - 8, fy], [x - 12, foot], [x - 19, foot]])} color={C.frameLit} offset={off} seed={`${seed}/footLit`} exit={exit} />
      <Fill d={rectD(x - 15, fy - 6, x + 15, fy)} color={C.frameShade} offset={off} seed={`${seed}/footCollar`} exit={exit} />
      {/* the cap collar, the neck, the brass ball finial */}
      <Fill d={rectD(x - hw - 6, top - 8, x + hw + 6, top + 1)} color={C.frameShade} offset={off} seed={`${seed}/capC`} exit={exit} />
      <Fill d={rectD(x - 4, top - 13, x + 4, top - 7)} color={C.frame} offset={off} seed={`${seed}/neck`} exit={exit} />
      <Fill d={circlePath(x, ballY, ballR)} color={C.brass} offset={MISREG} seed={`${seed}/ball`} exit={exit} />
      <Fill d={circlePath(x - 3, ballY - 3, 2.6)} color={CM.lampCore} offset={false} seed={`${seed}/ballHi`} exit={exit} />
      {/* clamp collars + bolts (with their plates) */}
      {collars.map((c, i) =>
        c.at !== undefined && t < c.at ? null : (
          <React.Fragment key={i}>
            <Fill d={rectD(x - hw - 4, c.y, x + hw + 4, c.y + 9)} color={C.frameShade} offset={off} at={c.at} mode="spring" seed={`${seed}/col${i}`} exit={exit} />
            <Fill d={circlePath(x, c.y + 4.5, 2.4)} color={C.brass} offset={false} at={c.at} mode="spring" seed={`${seed}/bolt${i}`} exit={exit} />
          </React.Fragment>
        ),
      )}
      <Ink d={ink1} width={ink} open={0.12} at={at === undefined ? undefined : at + 0.05} seed={`${seed}/ink`} exit={exit} />
      <Ink d={circle(x, ballY, ballR, {seed: `${seed}/ballI`, wobble: 0.03, overlap: 10})} width={INK_PX.far} at={at === undefined ? undefined : at + 0.08} seed={`${seed}/ballInk`} exit={exit} />
    </XG>
  );
};
export const SignPost = tiered('support', {}, SignPostBody);

export type FingerpostProps = {
  /** The post: centre x, shaft top, foot (default map S4.post: x 575, 735, 1060). */
  x?: number;
  top?: number;
  foot?: number;
  w?: number;
  /** The plates (default map S4.plateDec2025 / plateApr2026: x 110-560, the tip at x0; they run on behind the post). */
  dec?: Rect;
  apr?: Rect;
  /** Scene-local times (S4 clock): the DEC plate pops at decAt (4.06, "military") and its pen sweep completes at decEnd
   *  (default decAt + 0.46 = 4.52); the APR plate's fill pops at aprAt (4.59) and its pen completes at aprEnd (4.94,
   *  "heading"). null = already there. */
  decAt?: number | null;
  decEnd?: number;
  aprAt?: number | null;
  aprEnd?: number;
  /** The post's own pop (omit = there from the start: it is part of the towpath). */
  postAt?: number;
  /** Body size; default the largest that fits both plates (S4: 31). */
  bodySize?: number;
  /** The flat ground shadow east of the foot (the low sun is west). */
  shadow?: boolean;
  ink?: number;
  seed?: string;
  exit?: boolean;
};

/** S4's fingerpost (lane L3): ONE post, the DEC 2025 plate over the APR 2026 plate, both pointing west; fill-first, then
 *  a pen sweep. Nothing right of the post's foot but its shadow (x <= 594 above y 1060: clear of the right rail). */
const FingerpostBody: React.FC<FingerpostProps> = ({
  x = S4.post.x,
  top = S4.post.topY,
  foot = S4.post.footY,
  w = POST.w,
  dec = S4.plateDec2025,
  apr = S4.plateApr2026,
  decAt = SMALL_CLOCK.fingerpost.decAt,
  decEnd,
  aprAt = SMALL_CLOCK.fingerpost.aprAt,
  aprEnd = SMALL_CLOCK.fingerpost.aprEnd,
  postAt,
  bodySize,
  shadow = true,
  ink = INK_PX.mid,
  seed = 'fingerpost',
  exit = true,
}) => {
  useCaptionFont();
  const t = useTime();
  const bs = bodySize ?? plateBodySize([{rect: dec, text: TXT_PLATES.dec}, {rect: apr, text: TXT_PLATES.apr}], x, w);
  const dAt = decAt ?? undefined;
  const aAt = aprAt ?? undefined;
  const showShadow = shadow && (postAt === undefined || t >= postAt + 0.15);
  return (
    <>
      {showShadow ? <Fill d={polyPath([[x - 19, foot], [x + 19, foot], [x + 104, foot + 7], [x + 34, foot + 10]])} color={SMALL_COLORS.shadow} offset={false} seed={`${seed}/shadow`} exit={exit} /> : null}
      <ArrowPlate rect={dec} rootX={x} text={TXT_PLATES.dec} bodySize={bs} at={dAt} penAt={dAt === undefined ? undefined : dAt + 0.1} penEnd={dAt === undefined ? undefined : decEnd ?? dAt + 0.46} ink={ink} seed={`${seed}/dec`} exit={exit} />
      <ArrowPlate rect={apr} rootX={x} text={TXT_PLATES.apr} bodySize={bs} at={aAt} penAt={aAt === undefined ? undefined : aAt + 0.06} penEnd={aAt === undefined ? undefined : aprEnd} ink={ink} seed={`${seed}/apr`} exit={exit} />
      <SignPost
        x={x}
        top={top}
        foot={foot}
        w={w}
        at={postAt}
        collars={[
          {y: dec.y0 + 12, at: dAt},
          {y: dec.y1 - 21, at: dAt},
          {y: apr.y0 + 12, at: aAt},
          {y: apr.y1 - 21, at: aAt},
        ]}
        ink={ink}
        seed={`${seed}/post`}
        exit={exit}
      />
    </>
  );
};
export const Fingerpost = tiered('support', {}, FingerpostBody);

// =================================================================================================================
// 3. NewsBox (S5, lane L4): a US honour newspaper box, NO masthead or brand
// =================================================================================================================

/** The box is drawn in its own 310 x 350 units (coin housing top -> feet), then fitted to `rect`. The window is the
 *  front page behind glass (276 x 200, 17 px in from each side): the 40 px headline (247 px) keeps 14 px a side. */
export const NEWS_BOX = {
  w: 310,
  h: 350,
  window: {x0: 17, y0: 58, x1: 293, y1: 258},
  /** Page rows (box units): two plain head rules, the headline's three baselines, a short rule, the credit's two. */
  rules: [64, 67.5],
  headline: [102, 147, 192],
  midRule: 200,
  credit: [218, 239],
} as const;

export type NewsBoxProps = {
  /** The box's contract rect, coin housing top -> feet (default S5.start.newsBox, START coords: x 470-780, y 880-1230).
   *  The box is fitted to it: keep its 310 : 350 aspect (another aspect stretches the lettering). */
  rect?: Rect;
  /** Optional build (scene s): the box pops up from its feet, inks, the headline pens on. Omit = already there. */
  at?: number;
  /** The flat ground shadow (toward us and east: the sun is beyond, in the slot to the west). */
  shadow?: boolean;
  ink?: number;
  seed?: string;
  exit?: boolean;
};

/** S5's newspaper box (lane L4): a slate honour box lit on its west side, the chrome coin housing on the lid (coin
 *  slot, a blank price window, the return knob), a hinged door whose window shows the front page (headline 40 px x 3
 *  + the 18 px credit; two plain rules at its head, no masthead), the pull handle, a blank coin-return plate, short
 *  legs on feet, a ground shadow. No masthead, no brand, no logo. */
const NewsBoxBody: React.FC<NewsBoxProps> = ({rect = S5.start.newsBox, at, shadow = true, ink = INK_PX.far, seed = 'newsBox', exit = true}) => {
  useCaptionFont();
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const C = SMALL_COLORS;
  const N = NEWS_BOX;
  const m = mat.compose(mat.translate(rect.x0, rect.y0), mat.scale((rect.x1 - rect.x0) / N.w, (rect.y1 - rect.y0) / N.h));
  const k = popK(t, at, 0.3);
  const inkAt = at === undefined ? undefined : at + 0.07;
  const hAt = at === undefined ? undefined : at + 0.16;
  const W = N.window;
  const cx = N.w / 2;
  const off = MISREG;
  const bodyY0 = 42;
  const bodyY1 = 326;
  const outline =
    edgeInk([[0, bodyY0 + 2], [0, bodyY1], [N.w, bodyY1], [N.w, bodyY0 + 2]], false, `${seed}/body`, [0.5, 4]) +
    edgeInk([[-7, 44], [-7, 24], [N.w + 7, 24], [N.w + 7, 44]], false, `${seed}/lid`, [0.5, 3]) +
    line(-6, 44, N.w + 6, 44, {over: [0, 2], jitter: 0.3, seed: `${seed}/lidB`});
  const details =
    edgeInk([[10, 50], [300, 50], [300, 316], [10, 316]], true, `${seed}/door`, [0.3, 2.5]) +
    edgeInk([[W.x0, W.y0], [W.x1, W.y0], [W.x1, W.y1], [W.x0, W.y1]], true, `${seed}/win`, [0.3, 2.5]) +
    edgeInk([[202, 24], [202, 7], [209, 0], [285, 0], [292, 7], [292, 24]], false, `${seed}/coin`, [0, 1.5]) +
    edgeInk([[30, 327], [30, 342]], false, `${seed}/l1`, [0, 1]) +
    edgeInk([[52, 327], [52, 342]], false, `${seed}/l2`, [0, 1]) +
    edgeInk([[258, 327], [258, 342]], false, `${seed}/l3`, [0, 1]) +
    edgeInk([[280, 327], [280, 342]], false, `${seed}/l4`, [0, 1]) +
    edgeInk([[115, 274], [195, 274], [195, 283], [115, 283]], true, `${seed}/handle`, [0, 1]) +
    edgeInk([[232, 270], [284, 270], [284, 292], [232, 292]], true, `${seed}/plate`, [0, 1]);
  const page = (
    <>
      {/* the front page behind glass: the frame's shadow along its top and west edges, two plain rules at its head
          (no masthead, no name), the headline, a short rule, the credit, a glint low on the glass */}
      <Fill d={rectD(W.x0, W.y0, W.x1, W.y1)} color={C.face} offset={false} seed={`${seed}/page`} exit={exit} />
      <Fill d={rectD(W.x0, W.y0, W.x1, W.y0 + 3.5) + rectD(W.x0, W.y0 + 3.5, W.x0 + 4, W.y1)} color={C.pageShade} offset={false} seed={`${seed}/pageSh`} exit={exit} />
      <Ink
        d={line(W.x0 + 14, N.rules[0], W.x1 - 12, N.rules[0], {over: [0, 0], drift: 0, jitter: 0.2, seed: `${seed}/rule1`}) + line(W.x0 + 14, N.rules[1], W.x1 - 12, N.rules[1], {over: [0, 0], drift: 0, jitter: 0.2, seed: `${seed}/rule2`})}
        width={1.1}
        color={C.pageRule}
        taper={false}
        vary={0}
        at={inkAt}
        seed={`${seed}/rules`}
        exit={exit}
        graphic
      />
      <Ink d={line(cx - 72, N.midRule, cx + 72, N.midRule, {over: [0, 0], drift: 0, jitter: 0.3, seed: `${seed}/rule3`})} width={1.2} color={C.pageRule} taper={false} vary={0} at={inkAt} seed={`${seed}/rule3I`} exit={exit} graphic />
      {TXT_NEWS_BOX.headline.map((s, i) => (
        <WorldText key={`h${i}`} x={cx} y={N.headline[i]} size={40} text={s} anchor="middle" weight={0.5} at={hAt === undefined ? undefined : hAt + i * 0.12} dur={0.16} maxW={W.x1 - W.x0 - 16} seed={`${seed}/h${i}`} exit={exit} />
      ))}
      {TXT_NEWS_BOX.credit.map((s, i) => (
        <WorldText key={`c${i}`} x={cx} y={N.credit[i]} size={TYPE.credit} text={s} anchor="middle" at={hAt === undefined ? undefined : hAt + 0.4 + i * 0.08} dur={0.14} maxW={W.x1 - W.x0 - 16} seed={`${seed}/c${i}`} exit={exit} />
      ))}
      <Ink d={glint(270, 252, 28, {seed: `${seed}/glint`, angle: -60, gap: 8})} width={INK_PX.far} color={C.glassGlint} taper={false} at={inkAt} seed={`${seed}/glintI`} exit={exit} />
    </>
  );
  return (
    <XG m={m}>
      {shadow && (at === undefined || t >= at + 0.12) ? <Fill d={polyPath([[16, N.h], [294, N.h], [352, N.h + 21], [64, N.h + 23]])} color={C.shadow} offset={false} seed={`${seed}/shadow`} exit={exit} /> : null}
      {k > 0.001 ? (
        <XG m={mat.about(mat.scale(k), cx, N.h)}>
          {/* short legs, feet */}
          <Fill d={rectD(30, bodyY1 - 2, 52, 344) + rectD(258, bodyY1 - 2, 280, 344)} color={C.frame} offset={off} seed={`${seed}/legs`} exit={exit} />
          <Fill d={rectD(30, bodyY1, 35, 344) + rectD(258, bodyY1, 263, 344)} color={C.frameLit} offset={off} seed={`${seed}/legsLit`} exit={exit} />
          <Fill d={rectD(22, 342, 60, 350) + rectD(250, 342, 288, 350)} color={C.frameShade} offset={off} seed={`${seed}/feet`} exit={exit} />
          {/* the body, its lit west side, the base strip */}
          <Fill d={rectD(0, bodyY0, N.w, bodyY1)} color={C.box} offset={off} seed={`${seed}/body`} exit={exit} />
          <Fill d={rectD(0, bodyY0 + 2, 12, bodyY1 - 2)} color={C.boxLit} offset={off} seed={`${seed}/bodyLit`} exit={exit} />
          <Fill d={rectD(0, bodyY1 - 9, N.w, bodyY1)} color={C.boxShade} offset={off} seed={`${seed}/base`} exit={exit} />
          {/* the lid (overhanging) with its lit top; the coin housing on it: coin slot, a blank price window, the knob */}
          <Fill d={rectD(-7, 24, N.w + 7, 44)} color={C.boxShade} offset={off} seed={`${seed}/lid`} exit={exit} />
          <Fill d={rectD(-7, 24, N.w + 7, 30)} color={C.boxLit} offset={off} seed={`${seed}/lidLit`} exit={exit} />
          <Fill d={roundRectD(202, 0, 292, 25, 7)} color={C.chrome} offset={off} seed={`${seed}/coin`} exit={exit} />
          <Fill d={rectD(202, 18, 292, 25)} color={C.chromeShade} offset={off} seed={`${seed}/coinSh`} exit={exit} />
          <Fill d={rectD(218, 5, 223, 16)} color={C.frame} offset={false} seed={`${seed}/slot`} exit={exit} />
          <Fill d={rectD(233, 5, 263, 14)} color={C.chromeShade} offset={false} seed={`${seed}/priceWin`} exit={exit} />
          <Fill d={circlePath(277, 10, 5)} color={C.chromeShade} offset={false} seed={`${seed}/knob`} exit={exit} />
          {/* the door panel, its hinges (west), the window (the page), the pull handle, a blank coin-return plate */}
          <Fill d={rectD(10, 50, 300, 316)} color={C.boxDoor} offset={off} seed={`${seed}/door`} exit={exit} />
          <Fill d={rectD(6, 84, 13, 102) + rectD(6, 272, 13, 290)} color={C.boxShade} offset={false} seed={`${seed}/hinges`} exit={exit} />
          {page}
          <Fill d={rectD(120, 268, 126, 275) + rectD(184, 268, 190, 275)} color={C.boxShade} offset={false} seed={`${seed}/handleP`} exit={exit} />
          <Fill d={roundRectD(115, 274, 195, 283, 4)} color={C.chrome} offset={off} seed={`${seed}/handle`} exit={exit} />
          <Fill d={roundRectD(232, 270, 284, 292, 3)} color={C.chrome} offset={off} seed={`${seed}/plate`} exit={exit} />
          <Fill d={rectD(232, 287, 284, 292)} color={C.chromeShade} offset={false} seed={`${seed}/plateSh`} exit={exit} />
          <Ink d={outline} width={INK_PX.mid} open={0.1} at={inkAt} seed={`${seed}/out`} exit={exit} />
          <Ink d={details} width={ink} open={0.06} at={inkAt} seed={`${seed}/det`} exit={exit} />
        </XG>
      ) : null}
    </XG>
  );
};
export const NewsBox = tiered('support', {}, NewsBoxBody);

// =================================================================================================================
// 4. Plaque (S5, lane L4): a viewpoint orientation plaque, bronze frame, limestone face; no seal, flag or insignia
// =================================================================================================================

/** The terrace's plaque mount (END coords; mirrors kit/dc/terrace.tsx TERRACE.plaqueMount) and its coping line
 *  (TERRACE.railTop ~1180). */
export const PLAQUE_MOUNT: Rect = {x0: 560, y0: 1120, x1: 760, y1: 1226};
export const PLAQUE_COPING_Y = 1180;

export type PlaqueLayout = {w: number; h: number; frame: number; keyBase: number; bodyBase: number; stand: {w: number; h: number}; total: number};

/** The plaque's body size for a key size: 30 with the 56 px key (the type scale's body); 24 with a smaller key (the
 *  small-mount variant: 'US Department of Defense' 231 px). */
export const plaqueBodySize = (keySize: number) => (keySize >= TYPE.key ? TYPE.bodySmall : 24);

/** The plaque's size for its key / body sizes (measured text + a 7 px bronze frame + 13 px pads), on a 26 px bronze
 *  post: 56 / 30 = 329 x 127; 40 / 30 = 329 x 110 (the body line sets the width); 40 / 24 = 271 x 104. */
export function plaqueLayout(keySize: number = TYPE.key, bodySize: number = plaqueBodySize(keySize), stand = true): PlaqueLayout {
  const frame = 7;
  const pad = 13;
  const tw = Math.max(textW(TXT_PLAQUE.key, keySize), textW(TXT_PLAQUE.body, bodySize));
  const w = Math.ceil(tw + 2 * (frame + pad));
  const keyBase = frame + 9 + inkTop(TXT_PLAQUE.key, keySize);
  const bodyBase = keyBase + inkBottom(TXT_PLAQUE.key, keySize) + 6 + inkTop(TXT_PLAQUE.body, bodySize);
  const h = Math.ceil(bodyBase + inkBottom(TXT_PLAQUE.body, bodySize) + 9 + frame);
  const st = stand ? {w: 24, h: 26} : {w: 0, h: 0};
  return {w, h, frame, keyBase, bodyBase, stand: st, total: h + st.h};
}

export type PlaqueProps = {
  /** Centre x and the foot of its bronze post (END coords). Default x 612, the foot on the coping (1182): at key 56
   *  the plate spans x 447-777, y 1029-1156 (right edge <= 780: out of the right rail). */
  x?: number;
  y?: number;
  /** Key size (56 reads at 216 px wide; 40 for a small mount) and body size (default plaqueBodySize: 30 with 56,
   *  24 with a smaller key). */
  keySize?: number;
  bodySize?: number;
  /** Pops up from its foot (scene-local; default 1.88 = 22.43, ON "Pentagon"). null = already there. */
  at?: number | null;
  /** The bronze post under the plate (false: the plate's bottom edge sits at y). */
  stand?: boolean;
  /** A small bronze pointer tab toward the building (default 'up': it stands in front of and below it). */
  pointer?: 'up' | 'left' | 'right' | 'none';
  ink?: number;
  seed?: string;
  exit?: boolean;
};

/** S5's viewpoint plaque (lane L4): "The Pentagon" (key) + "US Department of Defense" (body) on a limestone face in a
 *  bronze frame, two brass screws, a small pointer tab toward the building, on a short bronze post; it pops up from its
 *  foot with the text on it (no pen: it reads ON the word). */
const PlaqueBody: React.FC<PlaqueProps> = ({x = 612, y = PLAQUE_COPING_Y + 2, keySize = TYPE.key, bodySize, at = SMALL_CLOCK.plaque.at, stand = true, pointer = 'up', ink = INK_PX.far, seed = 'plaque', exit = true}) => {
  useCaptionFont();
  const t = useTime();
  const bs = bodySize ?? plaqueBodySize(keySize);
  const pAt = at ?? undefined;
  if (pAt !== undefined && t < pAt) return null;
  const k = popK(t, pAt, 0.25);
  if (k <= 0.001) return null;
  const C = SMALL_COLORS;
  const Lp = plaqueLayout(keySize, bs, stand);
  const x0 = x - Lp.w / 2;
  const x1 = x + Lp.w / 2;
  const y1 = y - Lp.stand.h;
  const y0 = y1 - Lp.h;
  const f = Lp.frame;
  const off = MISREG;
  const pt = 13;
  const tab: Pt[] | null =
    pointer === 'up'
      ? [[x - pt, y0 + 1], [x, y0 - pt], [x + pt, y0 + 1]]
      : pointer === 'right'
        ? [[x1 - 1, (y0 + y1) / 2 - pt], [x1 + pt, (y0 + y1) / 2], [x1 - 1, (y0 + y1) / 2 + pt]]
        : pointer === 'left'
          ? [[x0 + 1, (y0 + y1) / 2 - pt], [x0 - pt, (y0 + y1) / 2], [x0 + 1, (y0 + y1) / 2 + pt]]
          : null;
  const sw = Lp.stand.w / 2;
  const outInk =
    edgeInk([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true, `${seed}/out`, [0.5, 4]) +
    (stand ? edgeInk([[x - sw, y1 + 1], [x - sw, y - 6]], false, `${seed}/sl`, [0, 1]) + edgeInk([[x + sw, y1 + 1], [x + sw, y - 6]], false, `${seed}/sr`, [0, 1]) : '') +
    (tab ? edgeInk(tab, false, `${seed}/tab`, [0, 1.5]) : '');
  const screwR = 2.8;
  return (
    <XG m={mat.about(mat.scale(k), x, y)}>
      {stand ? (
        <>
          {/* a cast bronze post (lit on the sun side, west) on a foot plate: reads on stone and on paving alike */}
          <Fill d={rectD(x - sw, y1 - 2, x + sw, y - 4)} color={C.bronzeDeep} offset={off} seed={`${seed}/stand`} exit={exit} />
          <Fill d={rectD(x - sw, y1 - 2, x - sw + 5, y - 4)} color={C.bronze} offset={off} seed={`${seed}/standLit`} exit={exit} />
          <Fill d={rectD(x - sw - 8, y - 6, x + sw + 8, y)} color={C.bronzeDeep} offset={off} seed={`${seed}/standFoot`} exit={exit} />
        </>
      ) : null}
      {tab ? <Fill d={polyPath(tab)} color={C.bronze} offset={off} seed={`${seed}/tab`} exit={exit} /> : null}
      {/* the plate's thickness (right and below), the bronze frame, its bevel line, the limestone face */}
      <Fill d={rectD(x0 + 3, y0 + 3.5, x1 + 3, y1 + 3.5)} color={C.bronzeDeep} offset={false} seed={`${seed}/edge`} exit={exit} />
      <Fill d={rectD(x0, y0, x1, y1)} color={C.bronze} offset={off} seed={`${seed}/frame`} exit={exit} />
      <Fill d={rectD(x0 + f, y0 + f, x1 - f, y1 - f)} color={C.plaqueFace} offset={false} seed={`${seed}/face`} exit={exit} />
      <Ink d={poly([[x0 + f, y1 - f], [x0 + f, y0 + f], [x1 - f, y0 + f]], {joined: true, jitter: 0.2, seed: `${seed}/bevel`})} width={INK_PX.hair} color={C.bronzeDeep} taper={false} vary={0} seed={`${seed}/bevelI`} exit={exit} />
      <Screws pts={[{x: x0 + f / 2 + 0.5, y: (y0 + y1) / 2}, {x: x1 - f / 2 - 0.5, y: (y0 + y1) / 2}]} r={screwR} seed={seed} exit={exit} />
      <Ink d={outInk} width={ink} open={0.1} seed={`${seed}/ink`} exit={exit} />
      <WorldText x={x} y={y0 + Lp.keyBase} size={keySize} text={TXT_PLAQUE.key} anchor="middle" weight={keySize >= 56 ? KEY_WEIGHT : 0.7} seed={`${seed}/k`} exit={exit} />
      <WorldText x={x} y={y0 + Lp.bodyBase} size={bs} text={TXT_PLAQUE.body} anchor="middle" seed={`${seed}/b`} exit={exit} />
    </XG>
  );
};
export const Plaque = tiered('support', {}, PlaqueBody);

// =================================================================================================================
// 5. DoorSign: a small enamel plate for any door (1-3 lines; "classified", never "secret"; US spelling)
// =================================================================================================================

export type DoorSignLayout = {w: number; h: number; rim: number; sizes: number[]; baselines: number[]};

/** The plate's size for its lines: line 1 at `size`, the rest at 0.6 x (>= 12), centred, a plum rim, cream face. */
export function doorSignLayout(lines: readonly string[], size: number = TYPE.bodySmall): DoorSignLayout {
  const sizes = lines.map((_, i) => (i === 0 ? size : Math.max(12, Math.round(size * 0.6))));
  const rim = Math.max(3, Math.round(size * 0.16));
  const pad = Math.max(8, Math.round(size * 0.45));
  const tw = Math.max(0, ...lines.map((l, i) => textW(l, sizes[i])));
  const w = Math.ceil(tw + 2 * (rim + pad));
  const baselines: number[] = [];
  let yy = rim + pad * 0.75 + (lines.length ? inkTop(lines[0], sizes[0]) : 0);
  lines.forEach((l, i) => {
    if (i > 0) yy += 0.3 * sizes[i - 1] + 0.72 * sizes[i] + (i === 1 ? 5 : 2);
    baselines.push(yy);
  });
  const last = lines.length - 1;
  const h = Math.ceil(yy + (last >= 0 ? inkBottom(lines[last], sizes[last]) : 0) + pad * 0.75 + rim);
  return {w, h, rim, sizes, baselines};
}

export type DoorSignProps = {
  /** Centre x and top y of the plate. */
  x: number;
  y: number;
  /** Line 1's size (px; default 30); the others at 0.6 x. The plate is sized to the text. */
  size?: number;
  lines?: readonly string[];
  /** Pops at this time (scene s). Omit = there. */
  at?: number;
  ink?: number;
  seed?: string;
  exit?: boolean;
};

/** A small enamel door plate: plum rim with its dark edge (the plate's thickness), cream face, two brass screws,
 *  centred lines; pops about its centre. */
const DoorSignBody: React.FC<DoorSignProps> = ({x, y, size = TYPE.bodySmall, lines = TXT_SERVICE_DOOR, at, ink = INK_PX.far, seed = 'doorSign', exit = true}) => {
  useCaptionFont();
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const k = popK(t, at, 0.3);
  if (k <= 0.001) return null;
  const C = SMALL_COLORS;
  const D = doorSignLayout(lines, size);
  const x0 = x - D.w / 2;
  const x1 = x + D.w / 2;
  const y1 = y + D.h;
  const r = D.rim;
  const rr = Math.max(2, r * 0.9);
  const screwR = Math.max(1.8, size * 0.085);
  const pad = (D.w - 2 * r - Math.max(...lines.map((l, i) => textW(l, D.sizes[i])))) / 2;
  return (
    <XG m={mat.about(mat.scale(k), x, y + D.h / 2)}>
      <Fill d={roundRectD(x0 + 2, y + 2.5, x1 + 2, y1 + 2.5, rr)} color={C.frameShade} offset={false} seed={`${seed}/edge`} exit={exit} />
      <Fill d={roundRectD(x0, y, x1, y1, rr)} color={C.frame} offset={MISREG} seed={`${seed}/rim`} exit={exit} />
      <Fill d={roundRectD(x0 + r, y + r, x1 - r, y1 - r, Math.max(1, rr - r * 0.6))} color={C.face} offset={false} seed={`${seed}/face`} exit={exit} />
      <Screws pts={[{x: x0 + r + Math.max(screwR + 2, pad * 0.45), y: y + D.h / 2}, {x: x1 - r - Math.max(screwR + 2, pad * 0.45), y: y + D.h / 2}]} r={screwR} seed={seed} exit={exit} />
      <Ink d={edgeInk([[x0, y1 - 2], [x0, y], [x1, y], [x1, y1], [x0 + 2, y1]], false, `${seed}/out`, [0.5, 3])} width={ink} open={0.12} seed={`${seed}/ink`} exit={exit} />
      {lines.map((l, i) => (
        <WorldText key={i} x={x} y={y + D.baselines[i]} size={D.sizes[i]} text={l} anchor="middle" weight={i === 0 ? 0.6 : 0} seed={`${seed}/l${i}`} exit={exit} />
      ))}
    </XG>
  );
};
export const DoorSign = tiered('support', {}, DoorSignBody);
