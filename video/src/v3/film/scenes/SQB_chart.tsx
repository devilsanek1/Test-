// SQB_chart (HOME lane; docs/v3/flow_v2.md §4 SQB, §5): THE CHART on the nook's card (home_set's CARD, right of the
// window), drawn in H1 px right after the card's paper and static face (title, subtitle, axes, 2005, 2025), so it is
// lit exactly like the paper it is printed on: the card is unlit (CRAFT §d.9; no light layer or shadow of its own).
// Keyed on FILM time: SQB draws it as its subject, SQC draws the finished card through J2's pan back (the same
// component, so the J2 seam is one drawing).
//
//   6.98-9.28   the line draws DOWNHILL with the voice ("Laptops get better for the same money"), 2005 -> Sept 2025,
//               one small bump in 2021 (FL 1.6); the pen's head is a hero dot that stays on the stroke's end once
//               drawn ("now": it pops once on "this past year", 11.80, and the hook turns up from it)
//   10.32-10.50 a doodle laptop drops onto the line (~2010) and lands on "buy" (10.60): its screen says "$999"
//   10.82       a shinier, bigger BETTER one pops onto the line right after it (~2015), the SAME "$999" ("one." 10.92):
//               same money, better laptop = lower on the line (the index is quality-adjusted, FL 1.8/1.9)
//   11.80       "this past year": the dot at the line's end pops once and, in the same frame, a soft band in a pale
//               hero tint pops in over the past year (YEAR_BAND, final round R3-3: the turn's own picture; the hook
//               rises inside it at 13.85 and "+9.7%" lands over it)
//   13.85-14.45 the line hooks UP (Sept 2025 -> Sept 2026, the hero colour), ending just before "up" (14.52)
//   14.74       "+9.7%" pops alone, above the hook ("almost10%" 14.84), and in the same frame the old deal's doodles
//               step back, ONE event (final pass, the owner's "not sure what to keep my attention on"): both go to tier
//               B (a soft terracotta, no outline, pale screens, the prices and the badge in a soft ink), a 2-step
//               change, so the number and the hook own the card's hero; the falling line stays the hero, the eye's
//               path to the turn. Measured (the frame's top-3 % salience on the card): 76 % at 12.5 and 13.5, 58 % at
//               14.95. Stepping them (and the line) back earlier, at "But" (11.80), left the card 10 % at 12.5 and gave
//               the window strip and the mug 65 %; at the hook's start, 33 % while it drew.
//   (no source line on the card: on-screen words read at phone size or are not drawn, owner 2026-10-28; the BLS source
//   sits in the pinned comment, POSTING.md)
// The shape is the BLS index's (CUUR0000SEEE01, FL 1.6-1.8): falling fast early and slower later, the 2021 bump, the
// turn up at the end; no y numbers (the label carries the one number). Hierarchy (CRAFT §b): the line, then the
// doodles, then the line's end (the dot's pop), then the hook and "+9.7%" are the subject in turn (the hero colour, the
// laptops' full outline on their beat only; the line is a graphic stroke); nothing else on the card moves. Layout: the old deal reads left to right (the falling
// line, the doodles in the middle, the turn and its number on the right), each clear of the static face.
// READ AT PHONE SIZE (final pass, OPEN 12: "$999" / "BETTER" were ~25 / 23 px, ~6 px on a phone): the doodles are the
// laptop's own shapes (laptopGeo) drawn plain for the chart (lid, screen, deck, a keyboard plate; no trackpad, no
// glint), so each screen is ONE big price: "$999" at 38 / 42 px (was 25 / 29), "BETTER" at 32 px (was 23), the most
// the card's plot holds under its subtitle and left of "+9.7%" (doodle boxes checked against the static face's glyph
// extents: >= 8 px clear of the subtitle, >= 11 px of "+9.7%", 38 px between the doodles).
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {poly, polyPath} from '../../../lib/sketch';
import {Tier} from '../../../lib/tier';
import {clamp, ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, laptopGeo, quadPt, Txt, type Pt} from '../kit';
import {stepAt} from '../kit/Haze';
import {mixRgb, TCircle, TPath} from '../kit/util';
import {CARD, CARD_PAPER, plotPt} from './home_set';

// ================================================================= the data (year, v: 0..1 of the plot's height)

/** u 0..1 = 2005..2026 (home_set's plotPt; the 2025 label sits at u 0.95). */
const uOf = (year: number) => (year - 2005) / 21;
const P = (year: number, v: number): Pt => plotPt([uOf(year), v]);

/** The line, Jan 2005 -> Sept 2025: the index falls fast early, slower later, one small bump in 2021 (FL 1.6). */
export const LINE_PTS: [number, number][] = [
  [2005.0, 0.88],
  [2006.5, 0.765],
  [2008.0, 0.668],
  [2010.0, 0.56],
  [2012.0, 0.478],
  [2014.0, 0.412],
  [2016.0, 0.357],
  [2018.0, 0.312],
  [2019.8, 0.278],
  [2020.7, 0.264],
  [2021.5, 0.305],
  [2022.4, 0.256],
  [2024.0, 0.217],
  [2025.7, 0.186],
];
/** The hook, Sept 2025 -> Sept 2026 (a quadratic: it leaves level, then turns UP; it ends at the x axis's end). */
const HOOK = {c: [2026.35, 0.19] as [number, number], end: [2026.7, 0.452] as [number, number]};

/** Catmull-Rom through pts (centripetal enough for our gentle data), sampled every ~3 px. */
function catmull(pts: Pt[]): Pt[] {
  const out: Pt[] = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 3));
    for (let k = 1; k <= n; k++) {
      const t = k / n;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  return out;
}

function quad(a: Pt, c: Pt, b: Pt, n: number): Pt[] {
  const out: Pt[] = [];
  for (let k = 1; k <= n; k++) {
    const t = k / n;
    const v = 1 - t;
    out.push([v * v * a[0] + 2 * v * t * c[0] + t * t * b[0], v * v * a[1] + 2 * v * t * c[1] + t * t * b[1]]);
  }
  return out;
}

/** The whole stroke (H1 px): the line's samples, then the hook's; and where the hook starts along it. */
const LINE_XY = catmull(LINE_PTS.map(([yr, v]) => P(yr, v)));
const HOOK_XY = quad(LINE_XY[LINE_XY.length - 1], P(HOOK.c[0], HOOK.c[1]), P(HOOK.end[0], HOOK.end[1]), 14);
const STROKE: Pt[] = [...LINE_XY, ...HOOK_XY];
const CUM: number[] = STROKE.reduce<number[]>((acc, p, i) => {
  acc.push(i ? acc[i - 1] + Math.hypot(p[0] - STROKE[i - 1][0], p[1] - STROKE[i - 1][1]) : 0);
  return acc;
}, []);
const L_LINE = CUM[LINE_XY.length - 1];
const L_ALL = CUM[CUM.length - 1];

/** The stroke cut at length s (its points, the last one interpolated). */
function upTo(s: number): Pt[] {
  if (s >= L_ALL) return STROKE;
  const out: Pt[] = [STROKE[0]];
  for (let i = 1; i < STROKE.length; i++) {
    if (CUM[i] >= s) {
      const k = (s - CUM[i - 1]) / Math.max(1e-6, CUM[i] - CUM[i - 1]);
      out.push([STROKE[i - 1][0] + (STROKE[i][0] - STROKE[i - 1][0]) * k, STROKE[i - 1][1] + (STROKE[i][1] - STROKE[i - 1][1]) * k]);
      return out;
    }
    out.push(STROKE[i]);
  }
  return out;
}

/** The line's point and its direction (degrees, screen) at a year (the line part only). */
export function linePose(year: number): {p: Pt; deg: number} {
  const x = P(year, 0)[0];
  for (let i = 1; i < LINE_XY.length; i++) {
    if (LINE_XY[i][0] >= x) {
      const a = LINE_XY[i - 1];
      const b = LINE_XY[i];
      const k = (x - a[0]) / Math.max(1e-6, b[0] - a[0]);
      return {p: [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], deg: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI};
    }
  }
  return {p: LINE_XY[LINE_XY.length - 1], deg: 0};
}

const pathOf = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');

// ================================================================= the beats (film seconds)

export const CHART_BEATS = {
  draw: [6.98, 9.28] as [number, number],
  drop: [10.32, 10.5] as [number, number],
  better: 10.82,
  hook: [13.85, 14.45] as [number, number],
  label: 14.74,
  source: 15.05,
  /** "this past year" (11.88): the pen's dot at the line's end pops once (the eye waits where the hook will turn). */
  pulse: 11.8,
  /** The doodles step back to tier B as "+9.7%" pops: one event. */
  step: 14.74,
};
export const LINE_W = 9;

/** The doodles OFF their beat (tier B, from CHART_BEATS.step; CRAFT §b: soft, no outline, no near-black): the hero
 *  60 % toward the paper for the lids (L* 77, C* 27; the B tier's pull takes it to ~C* 24), their deck edge and keys one
 *  step deeper (L* 69), the screens a pale peach 13 L* over the lid, the prices and BETTER in a soft ink (L* 49 on
 *  L* 90), the badge's pill one pale step. */
export const OLD_DEAL_OFF = {
  lid: mixRgb(EMBER.hero, CARD_PAPER, 0.6),
  deep: mixRgb(EMBER.heroDeep, CARD_PAPER, 0.5),
  screen: mixRgb('#F6D2C0', CARD_PAPER, 0.4),
  ink: '#9A6A55',
  badge: mixRgb('#F6D2C0', CARD_PAPER, 0.7),
};
/** 0 = the doodles on their beat, 0.5 = the 3-frame half step, 1 = off-beat (tier B). */
export const oldDealOff = (T: number): number => stepAt(T, CHART_BEATS.step);

// ================================================================= the doodles (the laptop, drawn plain, standing ON the line)

/** A doodle: the film's laptop (laptopGeo's shapes) standing on the line at `year` (its deck's front edge on the
 *  stroke, tilted a hint of the line's slope), ONE big "$999" on its screen (`price` px). Their years leave the right
 *  third to the hook and its number; their sizes are the most the plot holds (the header's layout check: the BETTER
 *  badge 9 px under the subtitle's descenders, its right edge 11 px left of "+9.7%"). */
export const DOODLES = {
  mine: {year: 2009.6, w: 88, price: 38},
  better: {year: 2015.2, w: 98, price: 42},
};
/** The doodles' lid height (x w): a touch flatter than the kit's 0.64, so the big price fits under the subtitle. */
const LID_H = 0.6;
/** BETTER: its letters (px) and a tight warm-white pill round them (w, h x the letters; its gap over the lid x w). */
const BADGE = {size: 32, w: 3.34, h: 1.04, gap: 0.05};
/** Doodle 1's landing fall (px along the line's normal): short, so its lid never crosses the subtitle (was 40). */
const FALL = 18;

/** How much of the line's slope a doodle takes (1 = flush on the slope, like a sled; 0 = level): a hint of it, so it
 *  rests ON the line without sliding down it. */
const TILT = 0.35;

/** Where a doodle stands: its hinge (the kit Laptop's x, y), rotation and its foot point (its deck's front edge
 *  centre, on the stroke: the line passes under the deck, so the laptop stands ON it). */
export function doodlePose(year: number, w: number): {x: number; y: number; rot: number; foot: Pt} {
  const {p, deg} = linePose(year);
  const rot = deg * TILT;
  const a = (rot * Math.PI) / 180;
  // the foot: a hair above the stroke's centre (the deck's front edge covers the stroke's top half)
  const foot: Pt = [p[0], p[1] - LINE_W * 0.15];
  // the laptop's lowest point (its deck's front edge, with the edge strip) sits 0.27 w under the hinge (laptopGeo)
  const d = w * 0.27;
  return {x: foot[0] + Math.sin(a) * d, y: foot[1] - Math.cos(a) * d, rot, foot};
}

/** One doodle laptop, hinge (x, y), width w, in its own frame (the caller tilts it): the fills (lid, deck, its edge,
 *  ONE keyboard plate: the kit's key rows would be specks at this size), the price filling its screen (no glint, no
 *  trackpad), then the subject's one closed outline (inside its fill) and the hinge line. `k`: 0 on its beat (the
 *  subject: the hero, the full outline), 0.5 the half step, 1 off-beat (tier B: OLD_DEAL_OFF, the lines drop). */
const DoodleLaptop: React.FC<{x: number; y: number; w: number; variant: 'old' | 'new'; price: number; k: number}> = ({x, y, w, variant, price, k}) => {
  const g = laptopGeo(x, y, w, LID_H);
  const lid = mixRgb(EMBER.hero, OLD_DEAL_OFF.lid, k);
  const deep = mixRgb(EMBER.heroDeep, OLD_DEAL_OFF.deep, k);
  const screen = mixRgb(variant === 'old' ? EMBER.anchor : EMBER.newScreen, OLD_DEAL_OFF.screen, k);
  const ink = mixRgb(variant === 'old' ? EMBER.core : EMBER.ink, OLD_DEAL_OFF.ink, k);
  const keys = polyPath([quadPt(g.deck, 0.12, 0.16), quadPt(g.deck, 0.88, 0.16), quadPt(g.deck, 0.9, 0.62), quadPt(g.deck, 0.1, 0.62)]);
  const body: Pt[] = [g.lid[0], g.lid[1], g.lid[2], g.deck[2], g.edge[2], g.edge[3], g.deck[3], g.lid[3]];
  const [cx, cy] = g.screenC;
  return (
    <Tier tier={k >= 0.5 ? 'support' : 'subject'} tone={lid}>
      <Fill d={polyPath(g.lid)} color={lid} offset={false} />
      <Fill d={polyPath(g.edge)} color={deep} offset={false} />
      <Fill d={polyPath(g.deck)} color={lid} offset={false} />
      <Fill d={keys} color={deep} offset={false} />
      <Fill d={polyPath(g.scr)} color={screen} offset={false} />
      <Txt x={cx} y={cy + price * 0.33} size={price} fill={ink} fit={(g.scr[1][0] - g.scr[0][0]) * 0.88}>
        $999
      </Txt>
      <Ink d={poly(body, {closed: true})} inside={polyPath(body)} width={3.4} />
      <Ink d={poly([g.lid[3], g.lid[2]])} width={2.2} />
    </Tier>
  );
};

/** The BETTER badge over the new laptop's lid: a tight warm-white pill with ink letters at 32 px (was 23: the most
 *  the gap under the subtitle holds); off-beat its pill one pale step, no outline, the letters soft. */
const BetterBadge: React.FC<{x: number; y: number; w: number; k: number}> = ({x, y, w, k}) => {
  const g = laptopGeo(x, y, w, LID_H);
  const top = (g.lid[0][1] + g.lid[1][1]) / 2;
  const cx = (g.lid[0][0] + g.lid[1][0]) / 2;
  const s = BADGE.size;
  const bw = s * BADGE.w;
  const bh = s * BADGE.h;
  const by = top - bh - w * BADGE.gap;
  const r = bh * 0.3;
  return (
    <Tier tier={k >= 0.5 ? 'support' : 'subject'} tone={EMBER.white}>
      <TPath
        d={`M${cx - bw / 2 + r} ${by}H${cx + bw / 2 - r}Q${cx + bw / 2} ${by} ${cx + bw / 2} ${by + r}V${by + bh - r}Q${cx + bw / 2} ${by + bh} ${cx + bw / 2 - r} ${by + bh}H${cx - bw / 2 + r}Q${cx - bw / 2} ${by + bh} ${cx - bw / 2} ${by + bh - r}V${by + r}Q${cx - bw / 2} ${by} ${cx - bw / 2 + r} ${by}Z`}
        fill={mixRgb(EMBER.white, OLD_DEAL_OFF.badge, k)}
        stroke={EMBER.beam}
        strokeWidth={2}
        tone={EMBER.white}
      />
      <Txt x={cx} y={by + bh / 2 + s * 0.33} size={s} fill={mixRgb(EMBER.ink, OLD_DEAL_OFF.ink, k)} fit={bw * 0.9}>
        BETTER
      </Txt>
    </Tier>
  );
};

const Doodle: React.FC<{year: number; w: number; price: number; variant: 'old' | 'new'; k: number}> = ({year, w, price, variant, k}) => {
  const q = doodlePose(year, w);
  return (
    <XG m={mat.about(mat.rotate(q.rot), q.x, q.y)}>
      <DoodleLaptop x={q.x} y={q.y} w={w} variant={variant} price={price} k={k} />
      {variant === 'new' ? <BetterBadge x={q.x} y={q.y} w={w} k={k} /> : null}
    </XG>
  );
};

/** Laptop 1 drops onto the line (a short fall along the line's normal, outCubic) and lands with a small squash. */
const MineDoodle: React.FC<{T: number; k: number}> = ({T, k: off}) => {
  const [t0, t1] = CHART_BEATS.drop;
  if (T < t0) return null;
  const {w, year, price} = DOODLES.mine;
  const q = doodlePose(year, w);
  const a = (q.rot * Math.PI) / 180;
  const fall = FALL * (1 - ease.outCubic(clamp((T - t0) / (t1 - t0))));
  // the landing: one squash of 8 % about the foot (along the laptop's own axes) and back, over 0.12 s
  const k = T < t1 ? 0 : clamp((T - t1) / 0.12);
  const sq = 1 - 0.08 * Math.sin(Math.PI * k);
  const body = <Doodle year={year} w={w} price={price} variant="old" k={off} />;
  if (fall < 0.01 && sq > 0.9999) return body;
  const m = mat.mul(mat.translate(Math.sin(a) * fall, -Math.cos(a) * fall), mat.about(mat.compose(mat.rotate(q.rot), mat.scale(1 + (1 - sq) * 0.5, sq), mat.rotate(-q.rot)), q.foot[0], q.foot[1]));
  return <XG m={m}>{body}</XG>;
};

/** Laptop 2 pops in place (about its foot, 0.2 -> 1 with a small overshoot, 0.14 s). */
const BetterDoodle: React.FC<{T: number; k: number}> = ({T, k}) => {
  const at = CHART_BEATS.better;
  if (T < at) return null;
  const {w, year, price} = DOODLES.better;
  const q = doodlePose(year, w);
  const p = prog(T, at, 0.14, ease.outBack(1.4));
  const s = 0.2 + 0.8 * p;
  const body = <Doodle year={year} w={w} price={price} variant="new" k={k} />;
  return s >= 0.999 && p >= 1 ? body : <XG m={mat.about(mat.scale(s), q.foot[0], q.foot[1])}>{body}</XG>;
};

// ================================================================= "+9.7%" and the source

/** "+9.7%": right-aligned over the hook's top (its right end near the card's right margin), clear of the falling line
 *  under it and of the BETTER doodle on its left. */
export const LABEL = (() => {
  const top = P(HOOK.end[0], HOOK.end[1]);
  return {x: CARD.x + CARD.w - 26, y: top[1] - 30, size: 110};
})();

const Label: React.FC<{T: number}> = ({T}) => {
  if (T < CHART_BEATS.label) return null;
  const p = prog(T, CHART_BEATS.label, 0.16, ease.outBack(1.4));
  const s = 0.2 + 0.8 * p;
  // centred on the label's own middle (it is right-aligned: its width is ~2.2 x its size)
  const cx = LABEL.x - LABEL.size * 1.1;
  const cy = LABEL.y - LABEL.size * 0.33;
  const txt = (
    <Txt x={LABEL.x} y={LABEL.y} size={LABEL.size} fill={EMBER.hero} anchor="end">
      +9.7%
    </Txt>
  );
  return s >= 0.999 && p >= 1 ? txt : <XG m={mat.about(mat.scale(s), cx, cy)}>{txt}</XG>;
};


// ================================================================= the chart

/** How much of the stroke is drawn at film time T (px along it) and whether the pen's dot shows (it rides the head
 *  while the line draws and then stays on the stroke's end: "now", where the hook will turn up). */
export function strokeAt(T: number): {s: number; pen: boolean} {
  const [d0, d1] = CHART_BEATS.draw;
  const [h0, h1] = CHART_BEATS.hook;
  if (T < d0) return {s: 0, pen: false};
  if (T < d1) return {s: L_LINE * ease.inOutSine((T - d0) / (d1 - d0)), pen: true};
  if (T < h0) return {s: L_LINE, pen: true};
  if (T < h1) return {s: L_LINE + (L_ALL - L_LINE) * ease.inOutSine((T - h0) / (h1 - h0)), pen: true};
  return {s: L_ALL, pen: true};
}

/** The pen dot's size at film time T: one pop on "this past year" (x1.5 and back over 0.3 s, a smooth swell). */
function dotPulse(T: number): number {
  const u = (T - CHART_BEATS.pulse) / 0.3;
  return u <= 0 || u >= 1 ? 1 : 1 + 0.5 * Math.sin(Math.PI * u) ** 2;
}

// ================================================================= "this past year" (the turn's stage)

/** "But this past year, in the US," (11.48-13.56) had no picture of its own (final round, R3-3: the dot's x1.5 swell,
 *  ~9 pt on a phone, on a framing unchanged since 6.45, was the only event; the cold watch's first swipe point). At
 *  CHART_BEATS.pulse the plot's last year gets ONE visible event on the card: a soft band in a pale tint of the hero
 *  (tier-B value: C* ~21, no outline, flat, soft top corners) pops in over the past year (Sept 2025 -> Sept 2026, the
 *  hook's span), the plot's full height, with the dot's swell in the same frame; the end dot sits inside it and it
 *  stays as the stage where the line hooks up (13.85) and "+9.7%" lands (14.74). It starts at 2025 (over the "2025"
 *  label, the dot inside with room for its swell: ~51 px wide), its foot stops just above the x axis (the axis stays
 *  one crisp line) and its right edge covers the hook's round end cap. */
export const YEAR_BAND = (() => {
  const x0 = P(2025, 0)[0];
  const x1 = P(HOOK.end[0], 0)[0] + LINE_W * 0.5 + 2;
  const [, top] = plotPt([0, 1]);
  const [, axis] = plotPt([0, 0]);
  return {x: x0, y: top - 12, w: x1 - x0, h: axis - 2 - (top - 12), r: 5};
})();
/** The band's fill: the hero 72 % of the way to the card's paper (L* ~83, C* ~21 on the paper's 95: seen at phone
 *  size, never loud; the line, the dot and the hook keep the hero itself). */
export const YEAR_BAND_FILL = mixRgb(EMBER.hero, CARD_PAPER, 0.72);
const YEAR_BAND_D = (() => {
  const {x, y, w, h, r} = YEAR_BAND;
  return `M${x} ${y + h}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h}Z`;
})();

/** The band pops in about its centre (0.3 -> 1 with a small overshoot, 0.18 s: the house pop) and stays. */
const YearBand: React.FC<{T: number}> = ({T}) => {
  if (T < CHART_BEATS.pulse) return null;
  const p = prog(T, CHART_BEATS.pulse, 0.18, ease.outBack(1.4));
  const s = 0.3 + 0.7 * p;
  const band = <TPath d={YEAR_BAND_D} fill={YEAR_BAND_FILL} />;
  if (p >= 1) return band;
  const {x, y, w, h} = YEAR_BAND;
  return <XG m={mat.about(mat.scale(s), x + w / 2, y + h / 2)}>{band}</XG>;
};

/** THE CHART at film time T (H1 px; draw it as HomeSet's `card`). Nothing before 6.98 (the J1 seam sees the bare
 *  face only). */
export const OldDealChart: React.FC<{T?: number}> = ({T: Tin}) => {
  const t = useTime();
  const T = Tin ?? t;
  const {s, pen} = strokeAt(T);
  if (s <= 0) return null;
  const off = oldDealOff(T);
  const pts = upTo(s);
  const head = pts[pts.length - 1];
  return (
    <Tier tier="subject">
      <YearBand T={T} />
      <TPath d={pathOf(pts)} stroke={EMBER.hero} strokeWidth={LINE_W} strokeLinecap="round" strokeLinejoin="round" fill="none" graphic />
      {pen ? <TCircle cx={head[0]} cy={head[1]} r={LINE_W * 0.95 * dotPulse(T)} fill={EMBER.hero} /> : null}
      <MineDoodle T={T} k={off} />
      <BetterDoodle T={T} k={off} />
      <Label T={T} />
    </Tier>
  );
};
