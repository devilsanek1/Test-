// src/lib/spec.ts
import { Easing } from "remotion";

// src/lib/time.ts
import React, { createContext, useContext } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
var TimeCtx = createContext(null);
var clamp = (v, lo = 0, hi = 1) => v < lo ? lo : v > hi ? hi : v;
var outBackF = (s) => (x) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
var inBackF = (s) => (x) => (s + 1) * x * x * x - s * x * x;
var ease = {
  linear: ((x) => x),
  inQuad: ((x) => x * x),
  outQuad: ((x) => 1 - (1 - x) * (1 - x)),
  inOutQuad: ((x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
  inCubic: ((x) => x * x * x),
  outCubic: ((x) => 1 - Math.pow(1 - x, 3)),
  inOutCubic: ((x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  inQuart: ((x) => x * x * x * x),
  outQuart: ((x) => 1 - Math.pow(1 - x, 4)),
  inOutQuart: ((x) => x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2),
  outQuint: ((x) => 1 - Math.pow(1 - x, 5)),
  inOutQuint: ((x) => x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2),
  outExpo: ((x) => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inExpo: ((x) => x <= 0 ? 0 : Math.pow(2, 10 * x - 10)),
  inOutSine: ((x) => -(Math.cos(Math.PI * x) - 1) / 2),
  outSine: ((x) => Math.sin(x * Math.PI / 2)),
  inSine: ((x) => 1 - Math.cos(x * Math.PI / 2)),
  /** Overshoots then settles. s=1.70158 is the classic; 1.2 is subtle, 2.5 is bouncy. */
  outBack: (s = 1.70158) => outBackF(s),
  inBack: (s = 1.70158) => inBackF(s),
  /** Exponential ease-out normalised to reach 1 at x=1; k = sharpness (4-5 fits the reference caption roll). */
  expOut: (k = 4.5) => (x) => x >= 1 ? 1 : (1 - Math.exp(-k * x)) / (1 - Math.exp(-k)),
  /** Hand-drawn pen stroke: quick start, gentle landing. Default for Ink. */
  pen: ((x) => 1 - Math.pow(1 - x, 2.2))
};

// src/lib/spec.ts
var bez = (x1, y1, x2, y2) => Easing.bezier(x1, y1, x2, y2);
function cruiseEase(acc = 0.25, dec = 0.35) {
  const a = Math.max(1e-3, acc);
  const d = Math.max(1e-3, dec);
  const v = 1 / (1 - (a + d) / 2);
  return (u) => {
    const x = clamp(u);
    if (x < a) return v * (x / 2 - a / (2 * Math.PI) * Math.sin(Math.PI * x / a));
    if (x > 1 - d) {
      const y = 1 - x;
      return 1 - v * (y / 2 - d / (2 * Math.PI) * Math.sin(Math.PI * y / d));
    }
    return v * (a / 2 + (x - a));
  };
}
var outExp = (x) => x >= 1 ? 1 : (1 - Math.pow(2, -10 * x)) / (1 - Math.pow(2, -10));
var MOTION = {
  /** Caption page change: the whole stack scrolls up by the clip height + 20 px. */
  captionScroll: { dur: 0.45, ease: bez(0, 0.7, 0.12, 1), lead: 0.04 },
  /** Caption line 2 rises ~1.15 line pitches from below. */
  captionLine2: { dur: 0.42, ease: bez(0, 0.7, 0.12, 1), lead: 0.08, pitch: 1.15 },
  /** Keyword highlight wipe L->R: 0.19 s + 0.3 ms per px of box width. */
  highlight: { base: 0.19, perPx: 3e-4, ease: bez(0.3, 0.3, 0.1, 1), lead: 0.1 },
  /** One pen stroke: 3-6 frames whatever its length; successive strokes start 1 frame apart. */
  stroke: { min: 0.1, max: 0.2, pxPerSec: 3e3, stagger: 1 / 30 },
  /** Fill lag after its outline STARTS (ink-first). */
  fillLag: { min: 0.13, max: 0.27 },
  /** Fill arrival: grow from 20% about its centre over 3-4 frames (or a 1-frame pop). */
  fillGrow: { dur: 0.12, from: 0.2 },
  /** Large base fill wipe (facade), linear. */
  baseWipe: { dur: 0.12 },
  /** Rise-in from below (people, placards): ~own height, 50% in frame 1. */
  rise: { dur: 0.33, ease: outExp, spring: { damping: 40, stiffness: 700, mass: 1 } },
  /** Stagger for "counting" builds (people, coins); 1/30 for texture builds; 0-1 frame for a burst. */
  riseStagger: 0.15,
  /** Exit by sinking. */
  sink: { dur: 0.2, stagger: 2 / 30 },
  answerPanel: { dur: 0.3, from: 0.2, ease: bez(0.4, 0, 0.2, 1), lead: 0.25 },
  mark: { dur: 0.17, lead: 0 },
  /** Pop from a source: appear at 30%, hold 2 f, grow 10 f. */
  popFrom: { from: 0.3, hold: 2 / 30, dur: 0.33, ease: bez(0.3, 0.2, 0.05, 1) },
  stamp: { ring: 4 / 30, slam: 0.27, from: 2.6 },
  sunPulse: { attack: 0.08, hold: 0.08, release: 0.27, amp: 0.08, ampRange: [0.04, 0.13] },
  sunBounce: { h: [26, 62] },
  hop: { antic: 0.1, air: 1.03, land: 0.07, recover: 0.13, height: 74, squash: [1.085, 0.88], antSquash: [1.07, 0.91], stretch: [0.97, 1.06] },
  arcHop: { dur: 1.25, speed: 330, apex: 127 },
  sunDrift: { min: 10 },
  catJump: { air: 0.35, gravity: 4e3 },
  pushIn: { dur: 1.15, to: 1.9, ease: bez(0.6, 0.25, 0.41, 0.87) },
  matchZoom: { in: 4 / 30, hold: 3 / 30, out: 6 / 30 },
  /** Un-build recipe (all ease-in): lines loosen 3 f, fills shrink 5-6 f, ink retracts 4 f, slab collapses 5 f. */
  unbuild: { loose: 0.1, fillShrink: 0.18, inkRetract: 0.13, slabCollapse: 0.17, total: 0.5 },
  /** THE camera vocabulary: ONE source of truth for both kits (the cine `CAM` presets carry the same values: ease
   *  inOutCubic, slow inOutSine, reveal trapezoid(0.25, 0.35), settle outCubic). Long, weighty moves 2-6 s.
   *  ease: default in-out move | slow: very long moves (4-6 s) | reveal: crane / tilt reveal that CRUISES (peak 1.43x
   *  its average speed; keep the peak <= 15-20 px / frame or flat ink strobes) | settle: a move that starts in motion
   *  (continuing a transition) and lands softly | push: reference 2's per-shot gentle zoom (World `push`, ShotCam
   *  `push`: +6 % over 2 s, in-out sine; ref 2 measured +1.3...+5.9 %, 1.0-3.3 s). `peakPxPerFrame` = the strobe
   *  limit for cruises. */
  camera: {
    min: 2,
    max: 6,
    ease: ease.inOutCubic,
    slow: ease.inOutSine,
    reveal: cruiseEase(0.25, 0.35),
    settle: ease.outCubic,
    push: { to: 1.06, dur: 2, ease: ease.inOutSine },
    peakPxPerFrame: 18
  }
};

// src/lib/cine/camera.tsx
import { createContext as createContext4, useContext as useContext4 } from "react";

// src/lib/theme.ts
var palette = {
  bg: "#A6CABB",
  // mint page background (also the "sky" block inside panels)
  card: "#FFFFFF",
  ink: "#2B1B0A",
  // dark brown linework + caption text
  sun: "#EC6B2E",
  // the orange disc / primary accent
  highlight: "#F6B892",
  // caption keyword highlight box (peach)
  peach: "#F6B892",
  // placards, screens, awnings (same paint as highlight)
  salmon: "#F6B892",
  // alias of peach (no second salmon in the reference)
  cream: "#F3E0CB",
  // light walls
  tan: "#BA977E",
  // dark walls, shade step ('clay')
  brown: "#88652F",
  // ochre: hair, jackets, trunks, posts
  teal: "#547977",
  // doors, frames, coats
  tealDark: "#3E605F",
  // darkest fill: shade step, kick panels, dusk sky
  sage: "#6D988B",
  // glass panes, tree crowns, cladding
  mintPale: "#EBF6E5",
  // ground / glass fill
  olive: "#3E605F",
  // alias of tealDark (not in the reference; avoid)
  grey: "#D9BBA1",
  // alias of sand (not in the reference; avoid)
  sky: "#A6CABB",
  // panel sky block
  sand: "#D9BBA1",
  // mid walls, necks/skin, light hair, paper dog-ears
  clay: "#BA977E",
  // alias of tan
  ochre: "#88652F",
  // alias of brown
  white: "#FFFFFF"
  // paper, signs, unfilled line-art people, glass glare
};
var canvas = { width: 1080, height: 1920, fps: 30 };
var type = {
  family: "CaptionHand",
  // @font-face name; the style stream installs the font file in public/fonts
  size: 82,
  lineHeight: 1.17,
  // 96 px baseline-to-baseline
  color: palette.ink,
  weight: 400,
  // Patrick Hand has one weight; never fake-bold
  letterSpacing: 0,
  maxLineWidth: 780,
  baselines: { line1: 1208, line2: 1304, punch: 1265 },
  // card-local
  punchScale: 1.16,
  // one-line punch captions
  hookScale: 1.06,
  // opening / loop caption
  clip: { top: 1070, bottom: 1400 }
  // card-local caption viewport for the roll
};
var world = {
  w: 1080,
  h: 1920,
  /** Default eye-level horizon (y). Low camera: towers rise into the sky above it. */
  horizon: 768,
  // reference 2 median 0.40 H (docs/style_bible_ref2.md); peaks go lower (0.58-0.70 H)
  /** Default vanishing point. */
  vp: [540, 768],
  /** Author scenes this far past every frame edge (camera-continuous / push transitions zoom out by up to ~12%). */
  bleed: 140
};
var captionTones = {
  dark: { text: palette.ink, highlight: palette.highlight, highlightText: palette.ink },
  light: { text: palette.white, highlight: palette.highlight, highlightText: palette.ink }
};
var skies = {
  day: "#ACD1BF",
  // reference 2 day sky
  golden: palette.cream,
  dusk: palette.sage,
  night: "#588077",
  // reference 2 night sky (never darker behind captions)
  deep: palette.tealDark
};
var todSky = { day: skies.day, golden: skies.golden, dusk: skies.dusk, night: skies.night, dawn: skies.day };
var nightFar = "#4B706B";
var todSteps = {
  day: {},
  golden: {},
  dawn: {},
  dusk: {
    base: { mintPale: palette.sky, cream: palette.sand, sand: palette.tan },
    // far mintPale follows the base row (-> sky): sage would BE the dusk sky
    far: { sage: palette.teal, teal: palette.tealDark },
    // framing: teal fronds stay teal on the sage dusk sky (a darker silhouette, ref 2); teal -> sage would vanish
    // into the sky and leave only the ink (review 3). Sage fronds step down to teal for the same reason.
    framing: { sage: palette.teal }
  },
  night: {
    base: { mintPale: palette.sage, sky: palette.sage, cream: palette.sand, sand: palette.tan },
    far: { mintPale: nightFar, cream: palette.tan, sand: palette.tan, sage: nightFar, teal: palette.tealDark },
    cloud: { white: palette.sage, mintPale: palette.sage },
    // teal fronds one step LIGHTER than the night sky; tealDark stays (teal would be ~the night sky: 1.09:1)
    framing: { teal: palette.sage }
  }
};

// src/lib/xf.tsx
import { createContext as createContext2, useContext as useContext2 } from "react";
import { Fragment, jsx } from "react/jsx-runtime";
var D2R = Math.PI / 180;
var mat = {
  I: [1, 0, 0, 1, 0, 0],
  /** m * n (apply n first, then m). */
  mul: (m, n) => [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5]
  ],
  /** compose(a, b, c) = a * b * c, i.e. like the SVG transform list "a b c". */
  compose: (...ms) => ms.reduce((acc, m) => mat.mul(acc, m), mat.I),
  translate: (x, y) => [1, 0, 0, 1, x, y],
  scale: (sx, sy = sx) => [sx, 0, 0, sy, 0, 0],
  rotate: (deg) => {
    const c = Math.cos(deg * D2R);
    const s = Math.sin(deg * D2R);
    return [c, s, -s, c, 0, 0];
  },
  skewX: (deg) => [1, 0, Math.tan(deg * D2R), 1, 0, 0],
  skewY: (deg) => [1, Math.tan(deg * D2R), 0, 1, 0, 0],
  /** Apply m about the point (ox, oy). */
  about: (m, ox, oy) => mat.compose(mat.translate(ox, oy), m, mat.translate(-ox, -oy)),
  inv: (m) => {
    const det = m[0] * m[3] - m[1] * m[2] || 1e-9;
    const a = m[3] / det;
    const b = -m[1] / det;
    const c = -m[2] / det;
    const d = m[0] / det;
    return [a, b, c, d, -(a * m[4] + c * m[5]), -(b * m[4] + d * m[5])];
  },
  isIdentity: (m, eps = 1e-4) => Math.abs(m[0] - 1) < eps && Math.abs(m[1]) < eps && Math.abs(m[2]) < eps && Math.abs(m[3] - 1) < eps && Math.abs(m[4]) < 0.05 && Math.abs(m[5]) < 0.05,
  str: (m) => `matrix(${m.map((v) => +v.toFixed(5)).join(" ")})`
};
var XfCtx = createContext2(mat.I);
var ProjCtx = createContext2(null);
var ProjProvider = ProjCtx.Provider;

// src/lib/rng.ts
import { random } from "remotion";
var Rng = class _Rng {
  constructor(seed) {
    this.seed = seed;
    this.i = 0;
  }
  /** [0, 1) */
  next() {
    return random(`${this.seed}#${this.i++}`);
  }
  range(a, b) {
    return a + (b - a) * this.next();
  }
  /** Integer in [a, b] inclusive. */
  int(a, b) {
    return Math.floor(this.range(a, b + 1 - 1e-9));
  }
  /** Uniform in [-amount, amount]. */
  jitter(amount) {
    return (this.next() * 2 - 1) * amount;
  }
  sign() {
    return this.next() < 0.5 ? -1 : 1;
  }
  chance(p) {
    return this.next() < p;
  }
  pick(arr) {
    return arr[Math.floor(this.next() * arr.length) % arr.length];
  }
  /** Weighted pick: items [[value, weight], ...]. */
  weighted(items) {
    const total = items.reduce((s, [, w]) => s + w, 0);
    let x = this.next() * total;
    for (const [v, w] of items) {
      if ((x -= w) <= 0) return v;
    }
    return items[items.length - 1][0];
  }
  /** Deterministic shuffle (returns a new array). */
  shuffle(arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
  fork(sub) {
    return new _Rng(`${this.seed}/${sub}`);
  }
};
var rng = (seed) => new Rng(seed);

// src/lib/sketch.ts
var r1 = (n) => Math.round(n * 10) / 10;
var P = (x, y) => `${r1(x)} ${r1(y)}`;
var D2R2 = Math.PI / 180;
var autoSeed = (...n) => n.map((v) => Math.round(v)).join(",");
var PATH_CACHE = /* @__PURE__ */ new Map();
function memo(name, fn) {
  return (...args) => {
    const key = name + JSON.stringify(args);
    let v = PATH_CACHE.get(key);
    if (v === void 0) {
      v = fn(...args);
      if (PATH_CACHE.size > 2e5) PATH_CACHE.clear();
      PATH_CACHE.set(key, v);
    }
    return v;
  };
}
var OVER_RANGES = { small: [3, 8], medium: [6, 15], structural: [30, 62] };
function overs(r2, over, len) {
  if (Array.isArray(over)) return over;
  if (typeof over === "number") return [over * r2.range(0.5, 1.4), over * r2.range(0.5, 1.4)];
  if (over === "none") return [0, 0];
  if (over) {
    const [lo, hi] = OVER_RANGES[over];
    return [r2.range(lo, hi), r2.range(lo, hi)];
  }
  const base = Math.min(14, Math.max(4, len * 0.05));
  const end = () => {
    const k = r2.next();
    if (k < 0.2) return r2.range(0, 2);
    if (k < 0.85 || len < 50) return base * r2.range(0.5, 1.3);
    return Math.min(40, base * r2.range(1.8, 3.2));
  };
  return [end(), end()];
}
var quadAt = (p0, c, p1, t) => (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * c + t * t * p1;
function _line(x1, y1, x2, y2, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(x1, y1, x2, y2));
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const [o1, o2] = overs(r2, o.over, len);
  const j = o.jitter ?? 0.8;
  const vertical = Math.abs(uy) > 0.9;
  const driftDeg = (o.drift ?? r2.range(0.3, 1)) * (vertical ? 0.4 : 1) * r2.sign();
  const dOff = Math.tan(driftDeg * D2R2) * len;
  const ax = x1 - ux * o1 + r2.jitter(j);
  const ay = y1 - uy * o1 + r2.jitter(j);
  const bx = x2 + ux * o2 - uy * dOff + r2.jitter(j);
  const by = y2 + uy * o2 + ux * dOff + r2.jitter(j);
  const bow = (o.bow ?? Math.max(0.4, len * 4e-3)) * r2.range(-1, 1);
  const cx = (ax + bx) / 2 - uy * bow * 2;
  const cy = (ay + by) / 2 + ux * bow * 2;
  const total = len + o1 + o2;
  if (o.breaks === false || total <= 400) return `M${P(ax, ay)}Q${P(cx, cy)} ${P(bx, by)}`;
  const n = total > 800 ? r2.int(3, 4) : r2.int(2, 3);
  const cuts = [0];
  for (let i = 1; i < n; i++) cuts.push(i / n + r2.jitter(0.25 / n));
  cuts.push(1);
  let d = "";
  for (let i = 0; i < n; i++) {
    const gap = i > 0 ? r2.range(6, 16) / total : 0;
    const t0 = cuts[i] + gap / 2;
    const t1 = cuts[i + 1] - (i < n - 1 ? r2.range(3, 8) / total : 0);
    if (t1 <= t0) continue;
    const p0x = quadAt(ax, cx, bx, t0);
    const p0y = quadAt(ay, cy, by, t0);
    const p1x = quadAt(ax, cx, bx, t1);
    const p1y = quadAt(ay, cy, by, t1);
    const qx = p0x + (t1 - t0) * ((1 - t0) * (cx - ax) + t0 * (bx - cx));
    const qy = p0y + (t1 - t0) * ((1 - t0) * (cy - ay) + t0 * (by - cy));
    d += `M${P(p0x, p0y)}Q${P(qx, qy)} ${P(p1x, p1y)}`;
  }
  return d;
}
var line = memo("line", _line);
function _rect(x, y, w, h, o = {}) {
  const seed = o.seed ?? autoSeed(x, y, w, h);
  const r2 = rng(seed);
  let edges = o.edges ?? "tlrb";
  if (o.open && r2.chance(o.open)) edges = edges.replace(r2.chance(0.55) ? "r" : "b", "");
  const base = { over: o.over, bow: o.bow, jitter: o.jitter, drift: o.drift ?? r2.range(0.1, 0.5), breaks: o.breaks };
  const out = [];
  for (const e of edges) {
    const s = `${seed}/${e}${r2.int(0, 999)}`;
    if (e === "t") out.push(line(x, y, x + w, y, { ...base, seed: s }));
    if (e === "b") out.push(line(x, y + h, x + w, y + h, { ...base, seed: s }));
    if (e === "l") out.push(line(x, y, x, y + h, { ...base, seed: s }));
    if (e === "r") out.push(line(x + w, y, x + w, y + h, { ...base, seed: s }));
  }
  return out.join("");
}
var rect = memo("rect", _rect);
function _poly(points, o = {}) {
  const seed = o.seed ?? autoSeed(...points.flat());
  const pts = o.closed ? [...points, points[0]] : points;
  if (o.joined) {
    const r2 = rng(seed);
    const j = o.jitter ?? 0.8;
    return pts.map(([x, y], i) => `${i ? "L" : "M"}${P(x + r2.jitter(j), y + r2.jitter(j))}`).join("");
  }
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    out.push(line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], { over: o.over, bow: o.bow, jitter: o.jitter, seed: `${seed}/${i}` }));
  }
  return out.join("");
}
var poly = memo("poly", _poly);
function _smooth(points, o = {}) {
  const pts = points;
  const n = pts.length;
  if (n < 2) return "";
  const k = (o.tension ?? 0.5) / 3;
  const get = (i) => o.closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  let d = `M${P(pts[0][0], pts[0][1])}`;
  const segs = o.closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) * k;
    const c1y = p1[1] + (p2[1] - p0[1]) * k;
    const c2x = p2[0] - (p3[0] - p1[0]) * k;
    const c2y = p2[1] - (p3[1] - p1[1]) * k;
    d += `C${P(c1x, c1y)} ${P(c2x, c2y)} ${P(p2[0], p2[1])}`;
  }
  return o.closed ? d + "Z" : d;
}
var smooth = memo("smooth", _smooth);
function ellipsePts(cx, cy, rx, ry, o, closedLoop) {
  const r2 = rng(o.seed ?? autoSeed(cx, cy, rx, ry));
  const wob = o.wobble ?? 0.035;
  const a0 = (o.start ?? r2.range(0, 360)) * D2R2;
  const over = closedLoop ? 0 : (o.overlap ?? r2.range(-8, 28)) * D2R2;
  const per = Math.PI * (rx + ry);
  const n = Math.max(8, Math.min(28, Math.round(per / 22)));
  const ph1 = r2.range(0, 6.28);
  const ph2 = r2.range(0, 6.28);
  const k1 = r2.range(0.5, 1);
  const k2 = r2.range(0.2, 0.6);
  const drift2 = closedLoop ? 0 : r2.range(-0.6, 0.6) * wob;
  const sweep = Math.PI * 2 + over;
  const pts = [];
  const count = closedLoop ? n : n + Math.max(1, Math.round(n * over / (Math.PI * 2)));
  for (let i = 0; i <= (closedLoop ? n - 1 : count); i++) {
    const u = closedLoop ? i / n : i / count;
    const a = a0 + sweep * u;
    const f = 1 + wob * (k1 * Math.sin(2 * a + ph1) + k2 * Math.sin(3 * a + ph2)) / 1.4 + drift2 * u;
    pts.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]);
  }
  return pts;
}
function _ellipse(cx, cy, rx, ry, o = {}) {
  return smooth(ellipsePts(cx, cy, rx, ry, o, false));
}
var ellipse = memo("ellipse", _ellipse);
function _blob(cx, cy, rx, ry, o = {}) {
  return smooth(ellipsePts(cx, cy, rx, ry, o, true), { closed: true });
}
var blob = memo("blob", _blob);
function _arc(cx, cy, rx, ry, a0, a1, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(cx, cy, rx, a0, a1));
  const wob = o.wobble ?? 0.02;
  const span = Math.abs(a1 - a0) * D2R2 * (rx + ry) * 0.5;
  const n = Math.max(3, Math.min(24, Math.round(span / 20)));
  const ph = r2.range(0, 6.28);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = (a0 + (a1 - a0) * i / n) * D2R2;
    const f = 1 + wob * Math.sin(2.3 * a + ph);
    pts.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]);
  }
  return smooth(pts);
}
var arc = memo("arc", _arc);
function _wire(x1, y1, x2, y2, sag = 18, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(x1, y1, x2, y2, sag));
  const [o1, o2] = Array.isArray(o.over) ? o.over : [r2.range(2, 10), r2.range(2, 10)];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return `M${P(x1 - ux * o1, y1 - uy * o1)}Q${P((x1 + x2) / 2, (y1 + y2) / 2 + sag * 2)} ${P(x2 + ux * o2, y2 + uy * o2)}`;
}
var wire = memo("wire", _wire);
function _crown(cx, cy, rx, ry, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(cx, cy, rx, ry));
  const per = Math.PI * (rx + ry);
  const n = o.bumps ?? Math.max(6, Math.round(per / 52));
  const a0 = r2.range(0, 360) * D2R2;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = a0 + (i + r2.jitter(0.22)) / n * Math.PI * 2;
    const f = 1 + r2.jitter(0.06);
    pts.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]);
  }
  const round = o.round ?? 0.62;
  let d = `M${P(pts[0][0], pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const [x2, y2] = pts[(i + 1) % n];
    const [x1, y1] = pts[i];
    const chord = Math.hypot(x2 - x1, y2 - y1);
    const rad = chord * (round + r2.jitter(0.06));
    d += `A${r1(rad)} ${r1(rad)} 0 0 1 ${P(x2, y2)}`;
  }
  return d + "Z";
}
var crown = memo("crown", _crown);
function _crownTicks(cx, cy, rx, ry, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(cx, cy, rx, ry, 7));
  const n = o.n ?? Math.max(3, Math.min(7, Math.round(rx * ry / 1800)));
  const s = o.size ?? Math.max(6, Math.min(12, rx * 0.095));
  let d = "";
  const a0 = r2.range(0, Math.PI * 2);
  for (let i = 0; i < n; i++) {
    let a = a0 + i * 2.39996 + r2.jitter(0.3);
    if (Math.sin(a) < -0.3) a = -a;
    const rr = r2.range(0.58, 0.78);
    const x = cx + Math.cos(a) * rx * rr;
    const y = cy + Math.sin(a) * ry * rr;
    const w = s * r2.range(0.6, 1.2);
    const tilt = Math.cos(a) * 0.35 + r2.jitter(0.15);
    d += `M${P(x - w, y - w * (0.32 + tilt))}C${P(x - w * 0.75, y + w * 0.38)} ${P(x + w * 0.75, y + w * 0.38)} ${P(x + w, y - w * (0.32 - tilt))}`;
  }
  return d;
}
var crownTicks = memo("crownTicks", _crownTicks);
function _glint(x, y, len = 40, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(x, y, len));
  const a = (o.angle ?? -62) * D2R2;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const gap = o.gap ?? Math.max(6, len * 0.22);
  const l2 = len * r2.range(0.45, 0.7);
  const nx = -uy;
  const ny = ux;
  const ox = x + nx * gap + ux * len * 0.12;
  const oy = y + ny * gap + uy * len * 0.12;
  return `M${P(x, y)}L${P(x + ux * len, y + uy * len)}M${P(ox, oy)}L${P(ox + ux * l2, oy + uy * l2)}`;
}
var glint = memo("glint", _glint);
function _hatch(x, y, w, h, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(x, y, w, h, 3));
  const a = (o.angle ?? 45) * D2R2;
  const gap = o.gap ?? 12;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const nx = -dy;
  const ny = dx;
  const corners = [
    [x, y],
    [x + w, y],
    [x, y + h],
    [x + w, y + h]
  ];
  const projs = corners.map(([px, py]) => px * nx + py * ny);
  const lo = Math.min(...projs);
  const hi = Math.max(...projs);
  let d = "";
  for (let s = lo + gap * 0.5; s < hi; s += gap) {
    const px = nx * s;
    const py = ny * s;
    let t0 = -1e6;
    let t1 = 1e6;
    const clip = (p, q) => {
      if (Math.abs(p) < 1e-9) return q >= 0;
      const t = q / p;
      if (p < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
      return true;
    };
    if (!clip(-dx, px - x) || !clip(dx, x + w - px) || !clip(-dy, py - y) || !clip(dy, y + h - py)) continue;
    if (t1 - t0 < 2) continue;
    const j = o.jitter ?? 1.5;
    const ta = t0 + r2.range(0, j * 2);
    const tb = t1 - r2.range(0, j * 2);
    d += `M${P(px + dx * ta, py + dy * ta)}L${P(px + dx * tb, py + dy * tb)}`;
  }
  return d;
}
var hatch = memo("hatch", _hatch);
function _arrow(x1, y1, x2, y2, o = {}) {
  const seed = o.seed ?? autoSeed(x1, y1, x2, y2);
  const r2 = rng(seed);
  const head = o.head ?? 18;
  const spread = (o.spread ?? 30) * D2R2;
  const shaft = line(x1, y1, x2, y2, { seed: `${seed}/s`, over: [r2.range(0, 4), 0], bow: o.bow });
  const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI;
  const h1 = `M${P(x2 + Math.cos(a - spread) * head, y2 + Math.sin(a - spread) * head)}L${P(x2, y2)}`;
  const h2 = `L${P(x2 + Math.cos(a + spread) * head * r2.range(0.85, 1.1), y2 + Math.sin(a + spread) * head * r2.range(0.85, 1.1))}`;
  return shaft + h1 + h2;
}
var arrow = memo("arrow", _arrow);
function _check(x, y, size = 80, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(x, y, size, 1));
  const s = size;
  const a = [x - 0.38 * s, y + 0.02 * s + r2.jitter(0.03 * s)];
  const b = [x - 0.12 * s, y + 0.42 * s];
  const c = [x + 0.42 * s + r2.jitter(0.03 * s), y - 0.5 * s];
  return `M${P(...a)}Q${P(a[0] + 0.12 * s, b[1] - 0.15 * s)} ${P(...b)}Q${P(x + 0.1 * s, y - 0.05 * s)} ${P(...c)}`;
}
var check = memo("check", _check);
function _cross(x, y, size = 80, o = {}) {
  const seed = o.seed ?? autoSeed(x, y, size, 2);
  const h = size / 2;
  return line(x - h, y - h, x + h, y + h, { seed: `${seed}/a`, over: [2, 6], bow: size * 0.03 }) + line(x + h, y - h, x - h, y + h, { seed: `${seed}/b`, over: [2, 8], bow: size * 0.03 });
}
var cross = memo("cross", _cross);
function _textLines(x, y, w, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(x, y, w, 9));
  const n = o.n ?? 4;
  const gap = o.gap ?? 22;
  let d = "";
  for (let i = 0; i < n; i++) {
    const frac = i === 0 && o.heading !== false ? r2.range(0.3, 0.45) : i === n - 1 ? r2.range(0.35, 0.6) : r2.range(0.72, 1);
    const lw = w * frac;
    const lx = o.align === "center" ? x + (w - lw) / 2 : x;
    const ly = y + i * gap + (i > 0 && o.heading !== false ? gap * 0.35 : 0);
    d += `M${P(lx, ly + r2.jitter(0.6))}L${P(lx + lw, ly + r2.jitter(0.8))}`;
  }
  return d;
}
var textLines = memo("textLines", _textLines);
function _wallTicks(x, y, w, h, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(x, y, w, h, 5));
  const n = o.n ?? Math.max(3, Math.round(w * h / 22e3));
  const s = o.size ?? 22;
  let d = "";
  for (let i = 0; i < n; i++) {
    const px = x + r2.range(0.05, 0.95) * w;
    const py = y + r2.range(0.05, 0.95) * h;
    const L = s * r2.range(0.6, 1.3);
    const kind = r2.int(0, 3);
    if (kind === 0) d += `M${P(px, py)}L${P(px + L, py + r2.jitter(0.6))}`;
    else if (kind === 1) d += `M${P(px, py - L * 0.45)}L${P(px, py)}L${P(px + L, py)}`;
    else if (kind === 2) d += `M${P(px, py)}L${P(px + L, py)}L${P(px + L, py - L * 0.45)}`;
    else d += `M${P(px, py + L * 0.45)}L${P(px, py)}L${P(px + L, py)}`;
  }
  return d;
}
var wallTicks = memo("wallTicks", _wallTicks);
function _speedLines(x, y, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(x, y, 11));
  const n = o.n ?? 3;
  const len = o.len ?? 30;
  const gap = o.gap ?? 12;
  const a = (o.angle ?? 180) * D2R2;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  let d = "";
  for (let i = 0; i < n; i++) {
    const off = (i - (n - 1) / 2) * gap;
    const sx = x - uy * off + ux * r2.range(0, len * 0.3);
    const sy = y + ux * off + uy * r2.range(0, len * 0.3);
    const l = len * r2.range(0.6, 1);
    d += `M${P(sx, sy)}L${P(sx + ux * l, sy + uy * l)}`;
  }
  return d;
}
var speedLines = memo("speedLines", _speedLines);
function _scribble(x, y, w, h, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(x, y, w, h, 13));
  const n = o.n ?? 6;
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push([x + w * i / n + r2.jitter(w * 0.03), i % 2 ? y + h + r2.jitter(h * 0.1) : y + r2.jitter(h * 0.1)]);
  return smooth(pts, { tension: 0.3 });
}
var scribble = memo("scribble", _scribble);
function _roundRect(x, y, w, h, rad, o = {}) {
  const rr = Math.min(rad, w / 2, h / 2);
  const r2 = rng(o.seed ?? autoSeed(x, y, w, h, rad));
  const j = (a) => a + r2.jitter(0.6);
  let d = `M${P(x + rr, y)}H${r1(j(x + w - rr))}A${r1(rr)} ${r1(rr)} 0 0 1 ${P(x + w, y + rr)}V${r1(j(y + h - rr))}A${r1(rr)} ${r1(rr)} 0 0 1 ${P(x + w - rr, y + h)}H${r1(j(x + rr))}A${r1(rr)} ${r1(rr)} 0 0 1 ${P(x, y + h - rr)}V${r1(j(y + rr))}A${r1(rr)} ${r1(rr)} 0 0 1 ${P(x + rr, y)}`;
  if (o.closed === false) d += `H${r1(x + rr + Math.min(w * 0.12, 14))}`;
  else d += "Z";
  return d;
}
var roundRect = memo("roundRect", _roundRect);
function _torso(x, y, w, h, round = 0.38, flare = 0.06) {
  const hw = w / 2;
  const bx = hw * (1 + flare);
  const R = Math.min(w * round, h * 0.8);
  const top = y - h;
  const k = 0.42;
  return `M${P(x - bx, y)}L${P(x - hw, top + R)}C${P(x - hw, top + R * k)} ${P(x - hw + R * k, top)} ${P(x - hw + R, top)}L${P(x + hw - R, top)}C${P(x + hw - R * k, top)} ${P(x + hw, top + R * k)} ${P(x + hw, top + R)}L${P(x + bx, y)}`;
}
var torso = memo("torso", _torso);

// src/lib/stage.tsx
import { createContext as createContext3, useContext as useContext3 } from "react";
import { jsx as jsx2 } from "react/jsx-runtime";
var SceneCtx = createContext3({ id: "none", start: 0, end: 0, dur: 0 });
var SceneProvider = SceneCtx.Provider;
var STAGE_REST = { ox: 0, oy: 0, zoom: 1, rot: 0 };
var StageCamCtx = createContext3(STAGE_REST);
var StageCamProvider = StageCamCtx.Provider;
var C = [world.w / 2, world.h / 2];
var AppliedCtx = createContext3(mat.I);
var AppliedStageProvider = AppliedCtx.Provider;
var WorldStageCtx = createContext3(null);
var WorldStageProvider = WorldStageCtx.Provider;
var KindCtx = createContext3("card");
var StageKindProvider = KindCtx.Provider;
var TransCtx = createContext3(null);
var TransitionProvider = TransCtx.Provider;
var ClipCtx = createContext3(void 0);
var StageClipProvider = ClipCtx.Provider;

// src/lib/cine/camera.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
var SCREEN = { w: canvas.width, h: canvas.height, cx: canvas.width / 2, cy: canvas.height / 2 };
function trapezoid(acc = 0.25, dec = 0.35) {
  const a = Math.max(1e-3, acc);
  const d = Math.max(1e-3, dec);
  const v = 1 / (1 - (a + d) / 2);
  return (u) => {
    const x = clamp(u);
    if (x < a) return v * (x / 2 - a / (2 * Math.PI) * Math.sin(Math.PI * x / a));
    if (x > 1 - d) {
      const y = 1 - x;
      return 1 - v * (y / 2 - d / (2 * Math.PI) * Math.sin(Math.PI * y / d));
    }
    return v * (a / 2 + (x - a));
  };
}
var CAM = {
  /** default move ease: long, symmetric, heavy. */
  ease: ease.inOutCubic,
  /** gentler start/stop for very long moves (4-6 s). */
  slow: ease.inOutSine,
  /** a crane / tilt reveal: sine lift-off over 25%, cruise, long soft landing over 35% (peak 1.43x average). */
  reveal: trapezoid(0.25, 0.35),
  /** a move that starts already in motion (continuing a previous shot) and lands softly. First segment only. */
  settle: ease.outCubic,
  /** push * f is linear up to `pushKnee`, then saturates smoothly toward `maxPushF` (nothing passes the lens). */
  pushKnee: 0.85,
  maxPushF: 0.94
};
var CAM_REST = { ox: 0, oy: 0, zoom: 1, push: 0, rot: 0, pan: 0, tilt: 0 };
var CamCtx = createContext4(CAM_REST);

// ../../../../tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/camcheck.ts
var r = MOTION.camera.reveal;
console.log("reveal(0.25)", r(0.25).toFixed(3), "CAM", CAM.reveal(0.25).toFixed(3));
for (const u of [0.1, 0.5, 0.9]) console.log("ease", u, MOTION.camera.ease(u).toFixed(4), CAM.ease(u).toFixed(4), "slow", MOTION.camera.slow(u).toFixed(4), CAM.slow(u).toFixed(4));
var peak = 0;
for (let f = 0; f < 150; f++) {
  const a = r(f / 150), b = r((f + 1) / 150);
  peak = Math.max(peak, Math.abs(b - a) * 1200);
}
console.log("example avg", (1200 / 150).toFixed(1), "px/frame, peak", peak.toFixed(1));
