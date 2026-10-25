// ../../../../tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v1/video/src/lib/rng.ts
var import_remotion = require("remotion");
var Rng = class _Rng {
  constructor(seed) {
    this.seed = seed;
  }
  seed;
  i = 0;
  /** [0, 1) */
  next() {
    return (0, import_remotion.random)(`${this.seed}#${this.i++}`);
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

// ../../../../tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v1/video/src/lib/theme.ts
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
var stroke = {
  ink: 3.4,
  // default (mid-depth) line weight at 1080 px width
  inkThin: 2.2,
  // far / detail lines
  inkBold: 4.8,
  // foreground figures, heavy ledges
  inkHair: 1.6,
  // glints, paper text lines, cables
  taperEnd: 0.45
  // long lines thin to this fraction of width at their ends
};
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
var skyCaption = {
  cx: 520,
  // reference 2 centres captions slightly left of frame centre (clears the right rail)
  line1: 387,
  line2: 510,
  /** A one-line page sits centred between the two slots (motion spec 4). */
  oneLine: 448,
  size: 98,
  // reference 2 measured (emphasis pages ~168)
  maxWidth: 850,
  /** Roll window: text outside [clipTop, clipBottom] is hidden (lines rise into it; pages scroll out of it). */
  clipTop: 280,
  clipBottom: 570,
  /** 'scroll' = reference 1's measured page scroll / line-2 rise / highlight wipe (docs/motion_spec.md 4).
   *  'pop' = reference 2's grammar (docs/style_bible_ref2.md 3): pages, lines and highlight boxes pop in 1 frame. */
  motion: "scroll"
};
var captionTones = {
  dark: { text: palette.ink, highlight: palette.highlight, highlightText: palette.ink },
  light: { text: palette.white, highlight: palette.highlight, highlightText: palette.ink }
};
var skies = {
  day: "#ACD1BF",
  // reference 2 day sky
  /** GOLDEN = the SAME flat day sky (style_bible_ref2 8: "golden variant = same flat sky + peach-lit faces"): golden
   *  hour is told by the light on the world (todSteps.golden: light fields one step warmer) and a big low sun, never
   *  by a cream sky (cream facades, walkways and white clouds vanished into it: 1.0-1.3:1). */
  golden: "#ACD1BF",
  dusk: palette.sage,
  night: "#588077",
  // reference 2 night sky (never darker behind captions)
  deep: palette.tealDark,
  /** A deliberate warm paper sky for a stylised beat (NOT a time of day; no relight row is built for it: keep cream /
   *  white / mintPale fills off it). The old `skies.golden` value. */
  cream: palette.cream
};
var todSky = { day: skies.day, golden: skies.golden, dusk: skies.dusk, night: skies.night, dawn: skies.day };
var nightFar = "#4B706B";
var todSteps = {
  day: {},
  // GOLDEN (the same flat day sky, style_bible_ref2 8 "same flat sky + peach-lit faces"): the COOLEST light field steps
  // one palette step warmer (pale-green ground / lawns / glass / pale facades -> cream), clouds warm to cream, and the
  // figures' lit rim strips catch the low sun as PEACH. Nothing gets darker; whites, cream, mid and dark tones, ink and
  // the sun never move. Deliberately NOT cream -> peach: whole walkways and walls turned into the accent colour (peach
  // placards / highlight boxes vanished into peach ground, review 4).
  golden: {
    base: { mintPale: palette.cream },
    cloud: { white: palette.cream, mintPale: palette.cream },
    rim: { white: palette.peach }
  },
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
var glow = {
  /** Night bulb halo #749484 (ref 2 measured, one step lighter than the night sky). */
  bulbHalo: "#749484",
  /** Halo radius in bulb radii (ref 2: 2.2). */
  bulbHaloR: 2.2,
  lamp: palette.peach
};
var todBulbHalo = { day: null, golden: null, dawn: null, dusk: null, night: glow.bulbHalo };

// ../../../../tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v1/video/src/lib/edges/rough.ts
var r1 = (n2) => Math.round(n2 * 10) / 10;
var P = (p) => `${r1(p[0])} ${r1(p[1])}`;
var lerpPt = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
var pathOf = (pts, close = true) => pts.map((p, i) => `${i ? "L" : "M"}${P(p)}`).join("") + (close ? "Z" : "");
function smoothClosed(pts) {
  const n2 = pts.length;
  let d = `M${P(pts[0])}`;
  for (let i = 0; i < n2; i++) {
    const p0 = pts[(i - 1 + n2) % n2];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n2];
    const p3 = pts[(i + 2) % n2];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d + "Z";
}
function cutSide(a, b, r2, o = {}) {
  const [s0, s1] = o.segs ?? [2, 3];
  const dev = o.dev ?? 2.5;
  const bow = (o.bow ?? 2) * r2.range(-1, 1);
  const n2 = Math.max(1, r2.int(s0, s1));
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const nx = -(b[1] - a[1]) / len;
  const ny = (b[0] - a[0]) / len;
  const ts = [];
  let acc = 0;
  const w = Array.from({ length: n2 }, () => r2.range(0.6, 1.4));
  const tot = w.reduce((s, v) => s + v, 0);
  for (let i = 0; i < n2 - 1; i++) {
    acc += w[i] / tot;
    ts.push(acc);
  }
  const out = ts.map((t) => {
    const p = lerpPt(a, b, t);
    const off = bow * 4 * t * (1 - t) + r2.jitter(dev);
    return [p[0] + nx * off, p[1] + ny * off];
  });
  out.push(b);
  return out;
}
function cutPoly(corners, r2, o = {}) {
  const out = [corners[0]];
  corners.forEach((c, i) => {
    const nxt = corners[(i + 1) % corners.length];
    const so = { ...o, ...o.side?.(i) ?? {} };
    const pts = cutSide(c, nxt, r2.fork(`s${i}`), so);
    if (i === corners.length - 1) pts.pop();
    out.push(...pts);
  });
  return out;
}
function roundRectPts(x0, y0, x1, y1, rad, step = 6) {
  const out = [];
  const R = rad.map((v) => typeof v === "number" ? [v, v] : v);
  const arc2 = (cx, cy, rx, ry, a0, a1) => {
    const n2 = Math.max(2, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) / step));
    for (let i = 0; i <= n2; i++) {
      const a = a0 + (a1 - a0) * i / n2;
      out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    }
  };
  const [tl, tr, br, bl] = R;
  arc2(x0 + tl[0], y0 + tl[1], tl[0], tl[1], Math.PI, Math.PI * 1.5);
  arc2(x1 - tr[0], y0 + tr[1], tr[0], tr[1], -Math.PI / 2, 0);
  arc2(x1 - br[0], y1 - br[1], br[0], br[1], 0, Math.PI / 2);
  arc2(x0 + bl[0], y1 - bl[1], bl[0], bl[1], Math.PI / 2, Math.PI);
  return out;
}
function resampleClosed(pts, step) {
  const n2 = pts.length;
  const seg = [];
  let total = 0;
  for (let i2 = 0; i2 < n2; i2++) {
    const a = pts[i2];
    const b = pts[(i2 + 1) % n2];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    seg.push(l);
    total += l;
  }
  const m = Math.max(8, Math.round(total / step));
  const out = [];
  let i = 0;
  let acc = 0;
  for (let k = 0; k < m; k++) {
    const s = k / m * total;
    while (acc + seg[i] < s && i < n2 - 1) {
      acc += seg[i];
      i++;
    }
    const t = seg[i] ? (s - acc) / seg[i] : 0;
    out.push(lerpPt(pts[i], pts[(i + 1) % n2], t));
  }
  return out;
}
function organic(base, r2, o) {
  const pts = resampleClosed(base, o.step ?? 26);
  const n2 = pts.length;
  const harm = o.harmonics ?? [
    [r2.int(3, 5), 0.55],
    [r2.int(7, 11), 0.3],
    [r2.int(15, 21), 0.15]
  ];
  const ph = harm.map(() => r2.range(0, Math.PI * 2));
  const cx = pts.reduce((s, p) => s + p[0], 0) / n2;
  const cy = pts.reduce((s, p) => s + p[1], 0) / n2;
  return pts.map((p, i) => {
    const a = pts[(i - 1 + n2) % n2];
    const b = pts[(i + 1) % n2];
    let nx = -(b[1] - a[1]);
    let ny = b[0] - a[0];
    const l = Math.hypot(nx, ny) || 1;
    nx /= l;
    ny /= l;
    if (nx * (p[0] - cx) + ny * (p[1] - cy) < 0) {
      nx = -nx;
      ny = -ny;
    }
    const u = i / n2;
    let w = 0;
    harm.forEach(([k, wt], j) => w += wt * Math.sin(Math.PI * 2 * k * u + ph[j]));
    const off = o.amp * w * (o.ampAt ? o.ampAt(p) : 1);
    return [p[0] + nx * off, p[1] + ny * off];
  });
}
function inside(p, poly2) {
  let c = false;
  for (let i = 0, j = poly2.length - 1; i < poly2.length; j = i++) {
    const a = poly2[i];
    const b = poly2[j];
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1] || 1e-9) + a[0]) c = !c;
  }
  return c;
}
function containsRect(poly2, [x0, y0, x1, y1], step = 20) {
  for (let x = x0; x <= x1; x += step) if (!inside([x, y0], poly2) || !inside([x, y1], poly2)) return false;
  for (let y = y0; y <= y1; y += step) if (!inside([x0, y], poly2) || !inside([x1, y], poly2)) return false;
  return true;
}

// ../../../../tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v1/video/src/lib/sketch.ts
var r12 = (n2) => Math.round(n2 * 10) / 10;
var P2 = (x, y) => `${r12(x)} ${r12(y)}`;
var D2R = Math.PI / 180;
var autoSeed = (...n2) => n2.map((v) => Math.round(v)).join(",");
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
  const dOff = Math.tan(driftDeg * D2R) * len;
  const ax = x1 - ux * o1 + r2.jitter(j);
  const ay = y1 - uy * o1 + r2.jitter(j);
  const bx = x2 + ux * o2 - uy * dOff + r2.jitter(j);
  const by = y2 + uy * o2 + ux * dOff + r2.jitter(j);
  const bow = (o.bow ?? Math.max(0.4, len * 4e-3)) * r2.range(-1, 1);
  const cx = (ax + bx) / 2 - uy * bow * 2;
  const cy = (ay + by) / 2 + ux * bow * 2;
  const total = len + o1 + o2;
  if (o.breaks === false || total <= 400) return `M${P2(ax, ay)}Q${P2(cx, cy)} ${P2(bx, by)}`;
  const n2 = total > 800 ? r2.int(3, 4) : r2.int(2, 3);
  const cuts = [0];
  for (let i = 1; i < n2; i++) cuts.push(i / n2 + r2.jitter(0.25 / n2));
  cuts.push(1);
  let d = "";
  for (let i = 0; i < n2; i++) {
    const gap = i > 0 ? r2.range(6, 16) / total : 0;
    const t0 = cuts[i] + gap / 2;
    const t1 = cuts[i + 1] - (i < n2 - 1 ? r2.range(3, 8) / total : 0);
    if (t1 <= t0) continue;
    const p0x = quadAt(ax, cx, bx, t0);
    const p0y = quadAt(ay, cy, by, t0);
    const p1x = quadAt(ax, cx, bx, t1);
    const p1y = quadAt(ay, cy, by, t1);
    const qx = p0x + (t1 - t0) * ((1 - t0) * (cx - ax) + t0 * (bx - cx));
    const qy = p0y + (t1 - t0) * ((1 - t0) * (cy - ay) + t0 * (by - cy));
    d += `M${P2(p0x, p0y)}Q${P2(qx, qy)} ${P2(p1x, p1y)}`;
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
    return pts.map(([x, y], i) => `${i ? "L" : "M"}${P2(x + r2.jitter(j), y + r2.jitter(j))}`).join("");
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
  const n2 = pts.length;
  if (n2 < 2) return "";
  const k = (o.tension ?? 0.5) / 3;
  const get = (i) => o.closed ? pts[(i + n2) % n2] : pts[Math.max(0, Math.min(n2 - 1, i))];
  let d = `M${P2(pts[0][0], pts[0][1])}`;
  const segs = o.closed ? n2 : n2 - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) * k;
    const c1y = p1[1] + (p2[1] - p0[1]) * k;
    const c2x = p2[0] - (p3[0] - p1[0]) * k;
    const c2y = p2[1] - (p3[1] - p1[1]) * k;
    d += `C${P2(c1x, c1y)} ${P2(c2x, c2y)} ${P2(p2[0], p2[1])}`;
  }
  return o.closed ? d + "Z" : d;
}
var smooth = memo("smooth", _smooth);
function ellipsePts(cx, cy, rx, ry, o, closedLoop) {
  const r2 = rng(o.seed ?? autoSeed(cx, cy, rx, ry));
  const wob = o.wobble ?? 0.035;
  const a0 = (o.start ?? r2.range(0, 360)) * D2R;
  const over = closedLoop ? 0 : (o.overlap ?? r2.range(-8, 28)) * D2R;
  const per = Math.PI * (rx + ry);
  const n2 = Math.max(8, Math.min(28, Math.round(per / 22)));
  const ph1 = r2.range(0, 6.28);
  const ph2 = r2.range(0, 6.28);
  const k1 = r2.range(0.5, 1);
  const k2 = r2.range(0.2, 0.6);
  const drift = closedLoop ? 0 : r2.range(-0.6, 0.6) * wob;
  const sweep = Math.PI * 2 + over;
  const pts = [];
  const count = closedLoop ? n2 : n2 + Math.max(1, Math.round(n2 * over / (Math.PI * 2)));
  for (let i = 0; i <= (closedLoop ? n2 - 1 : count); i++) {
    const u = closedLoop ? i / n2 : i / count;
    const a = a0 + sweep * u;
    const f = 1 + wob * (k1 * Math.sin(2 * a + ph1) + k2 * Math.sin(3 * a + ph2)) / 1.4 + drift * u;
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
  const span = Math.abs(a1 - a0) * D2R * (rx + ry) * 0.5;
  const n2 = Math.max(3, Math.min(24, Math.round(span / 20)));
  const ph = r2.range(0, 6.28);
  const pts = [];
  for (let i = 0; i <= n2; i++) {
    const a = (a0 + (a1 - a0) * i / n2) * D2R;
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
  return `M${P2(x1 - ux * o1, y1 - uy * o1)}Q${P2((x1 + x2) / 2, (y1 + y2) / 2 + sag * 2)} ${P2(x2 + ux * o2, y2 + uy * o2)}`;
}
var wire = memo("wire", _wire);
function _crown(cx, cy, rx, ry, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(cx, cy, rx, ry));
  const per = Math.PI * (rx + ry);
  const n2 = o.bumps ?? Math.max(6, Math.round(per / 52));
  const a0 = r2.range(0, 360) * D2R;
  const pts = [];
  for (let i = 0; i < n2; i++) {
    const a = a0 + (i + r2.jitter(0.22)) / n2 * Math.PI * 2;
    const f = 1 + r2.jitter(0.06);
    pts.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]);
  }
  const round = o.round ?? 0.62;
  let d = `M${P2(pts[0][0], pts[0][1])}`;
  for (let i = 0; i < n2; i++) {
    const [x2, y2] = pts[(i + 1) % n2];
    const [x1, y1] = pts[i];
    const chord = Math.hypot(x2 - x1, y2 - y1);
    const rad = chord * (round + r2.jitter(0.06));
    d += `A${r12(rad)} ${r12(rad)} 0 0 1 ${P2(x2, y2)}`;
  }
  return d + "Z";
}
var crown = memo("crown", _crown);
function _crownTicks(cx, cy, rx, ry, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(cx, cy, rx, ry, 7));
  const n2 = o.n ?? Math.max(3, Math.min(7, Math.round(rx * ry / 1800)));
  const s = o.size ?? Math.max(6, Math.min(12, rx * 0.095));
  let d = "";
  const a0 = r2.range(0, Math.PI * 2);
  for (let i = 0; i < n2; i++) {
    let a = a0 + i * 2.39996 + r2.jitter(0.3);
    if (Math.sin(a) < -0.3) a = -a;
    const rr = r2.range(0.58, 0.78);
    const x = cx + Math.cos(a) * rx * rr;
    const y = cy + Math.sin(a) * ry * rr;
    const w = s * r2.range(0.6, 1.2);
    const tilt = Math.cos(a) * 0.35 + r2.jitter(0.15);
    d += `M${P2(x - w, y - w * (0.32 + tilt))}C${P2(x - w * 0.75, y + w * 0.38)} ${P2(x + w * 0.75, y + w * 0.38)} ${P2(x + w, y - w * (0.32 - tilt))}`;
  }
  return d;
}
var crownTicks = memo("crownTicks", _crownTicks);
function _glint(x, y, len = 40, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(x, y, len));
  const a = (o.angle ?? -62) * D2R;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const gap = o.gap ?? Math.max(6, len * 0.22);
  const l2 = len * r2.range(0.45, 0.7);
  const nx = -uy;
  const ny = ux;
  const ox = x + nx * gap + ux * len * 0.12;
  const oy = y + ny * gap + uy * len * 0.12;
  return `M${P2(x, y)}L${P2(x + ux * len, y + uy * len)}M${P2(ox, oy)}L${P2(ox + ux * l2, oy + uy * l2)}`;
}
var glint = memo("glint", _glint);
function _hatch(x, y, w, h, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(x, y, w, h, 3));
  const a = (o.angle ?? 45) * D2R;
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
    d += `M${P2(px + dx * ta, py + dy * ta)}L${P2(px + dx * tb, py + dy * tb)}`;
  }
  return d;
}
var hatch = memo("hatch", _hatch);
function _arrow(x1, y1, x2, y2, o = {}) {
  const seed = o.seed ?? autoSeed(x1, y1, x2, y2);
  const r2 = rng(seed);
  const head = o.head ?? 18;
  const spread = (o.spread ?? 30) * D2R;
  const shaft = line(x1, y1, x2, y2, { seed: `${seed}/s`, over: [r2.range(0, 4), 0], bow: o.bow });
  const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI;
  const h1 = `M${P2(x2 + Math.cos(a - spread) * head, y2 + Math.sin(a - spread) * head)}L${P2(x2, y2)}`;
  const h2 = `L${P2(x2 + Math.cos(a + spread) * head * r2.range(0.85, 1.1), y2 + Math.sin(a + spread) * head * r2.range(0.85, 1.1))}`;
  return shaft + h1 + h2;
}
var arrow = memo("arrow", _arrow);
function _check(x, y, size = 80, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(x, y, size, 1));
  const s = size;
  const a = [x - 0.38 * s, y + 0.02 * s + r2.jitter(0.03 * s)];
  const b = [x - 0.12 * s, y + 0.42 * s];
  const c = [x + 0.42 * s + r2.jitter(0.03 * s), y - 0.5 * s];
  return `M${P2(...a)}Q${P2(a[0] + 0.12 * s, b[1] - 0.15 * s)} ${P2(...b)}Q${P2(x + 0.1 * s, y - 0.05 * s)} ${P2(...c)}`;
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
  const n2 = o.n ?? 4;
  const gap = o.gap ?? 22;
  let d = "";
  for (let i = 0; i < n2; i++) {
    const frac = i === 0 && o.heading !== false ? r2.range(0.3, 0.45) : i === n2 - 1 ? r2.range(0.35, 0.6) : r2.range(0.72, 1);
    const lw = w * frac;
    const lx = o.align === "center" ? x + (w - lw) / 2 : x;
    const ly = y + i * gap + (i > 0 && o.heading !== false ? gap * 0.35 : 0);
    d += `M${P2(lx, ly + r2.jitter(0.6))}L${P2(lx + lw, ly + r2.jitter(0.8))}`;
  }
  return d;
}
var textLines = memo("textLines", _textLines);
function _wallTicks(x, y, w, h, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(x, y, w, h, 5));
  const n2 = o.n ?? Math.max(3, Math.round(w * h / 22e3));
  const s = o.size ?? 22;
  let d = "";
  for (let i = 0; i < n2; i++) {
    const px = x + r2.range(0.05, 0.95) * w;
    const py = y + r2.range(0.05, 0.95) * h;
    const L = s * r2.range(0.6, 1.3);
    const kind = r2.int(0, 3);
    if (kind === 0) d += `M${P2(px, py)}L${P2(px + L, py + r2.jitter(0.6))}`;
    else if (kind === 1) d += `M${P2(px, py - L * 0.45)}L${P2(px, py)}L${P2(px + L, py)}`;
    else if (kind === 2) d += `M${P2(px, py)}L${P2(px + L, py)}L${P2(px + L, py - L * 0.45)}`;
    else d += `M${P2(px, py + L * 0.45)}L${P2(px, py)}L${P2(px + L, py)}`;
  }
  return d;
}
var wallTicks = memo("wallTicks", _wallTicks);
function _speedLines(x, y, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(x, y, 11));
  const n2 = o.n ?? 3;
  const len = o.len ?? 30;
  const gap = o.gap ?? 12;
  const a = (o.angle ?? 180) * D2R;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  let d = "";
  for (let i = 0; i < n2; i++) {
    const off = (i - (n2 - 1) / 2) * gap;
    const sx = x - uy * off + ux * r2.range(0, len * 0.3);
    const sy = y + ux * off + uy * r2.range(0, len * 0.3);
    const l = len * r2.range(0.6, 1);
    d += `M${P2(sx, sy)}L${P2(sx + ux * l, sy + uy * l)}`;
  }
  return d;
}
var speedLines = memo("speedLines", _speedLines);
function _scribble(x, y, w, h, o = {}) {
  const r2 = rng(o.seed ?? autoSeed(x, y, w, h, 13));
  const n2 = o.n ?? 6;
  const pts = [];
  for (let i = 0; i <= n2; i++) pts.push([x + w * i / n2 + r2.jitter(w * 0.03), i % 2 ? y + h + r2.jitter(h * 0.1) : y + r2.jitter(h * 0.1)]);
  return smooth(pts, { tension: 0.3 });
}
var scribble = memo("scribble", _scribble);
function _roundRect(x, y, w, h, rad, o = {}) {
  const rr = Math.min(rad, w / 2, h / 2);
  const r2 = rng(o.seed ?? autoSeed(x, y, w, h, rad));
  const j = (a) => a + r2.jitter(0.6);
  let d = `M${P2(x + rr, y)}H${r12(j(x + w - rr))}A${r12(rr)} ${r12(rr)} 0 0 1 ${P2(x + w, y + rr)}V${r12(j(y + h - rr))}A${r12(rr)} ${r12(rr)} 0 0 1 ${P2(x + w - rr, y + h)}H${r12(j(x + rr))}A${r12(rr)} ${r12(rr)} 0 0 1 ${P2(x, y + h - rr)}V${r12(j(y + rr))}A${r12(rr)} ${r12(rr)} 0 0 1 ${P2(x + rr, y)}`;
  if (o.closed === false) d += `H${r12(x + rr + Math.min(w * 0.12, 14))}`;
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
  return `M${P2(x - bx, y)}L${P2(x - hw, top + R)}C${P2(x - hw, top + R * k)} ${P2(x - hw + R * k, top)} ${P2(x - hw + R, top)}L${P2(x + hw - R, top)}C${P2(x + hw - R * k, top)} ${P2(x + hw, top + R * k)} ${P2(x + hw, top + R)}L${P2(x + bx, y)}`;
}
var torso = memo("torso", _torso);

// ../../../../tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v1/video/src/lib/edges/shared.ts
var W = world.w;
var H = world.h;
var CAPTION_SAFE = (() => {
  const half = skyCaption.maxWidth * 1.06 / 2 + 20;
  return [Math.round(skyCaption.cx - half), skyCaption.clipTop - 22, Math.round(skyCaption.cx + half), skyCaption.clipBottom + 24];
})();
var PHONE_UI = { top: 180, bottom: 400, rail: { x: 950, y0: 900, y1: 1500 } };
var STROKE_MAX_Y = CAPTION_SAFE[1] - 12;
var ruled = (a, b, seed, drift = 0.25) => line(a[0], a[1], b[0], b[1], { seed, over: "none", drift, bow: 1.2, jitter: 0.6, breaks: false });
function ruledCorner(r2, key, c, sx, o) {
  const out = [];
  const m = r2.range(2.5, 4);
  if (o.h) {
    const y = c[1] - m;
    const x0 = c[0] + sx * r2.range(o.h.len[0], o.h.len[1]);
    const x1 = c[0] - sx * o.h.over;
    out.push({ d: ruled([x0, y + r2.jitter(0.6)], [x1, y + r2.jitter(0.6)], `${key}h`, 0.2), w: stroke.inkThin });
  }
  if (o.v) {
    const x = c[0] - sx * m;
    const y0 = c[1] + r2.range(o.v.len[0], o.v.len[1]);
    const y1 = c[1] - o.v.over;
    out.push({ d: ruled([x + r2.jitter(0.6), y0], [x + r2.jitter(0.6), y1], `${key}v`, 0.2), w: stroke.inkThin });
  }
  return out;
}

// ../../../../tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v1/video/src/lib/edges/paint.ts
var PAINT_LOOSENESS = { "paint-subtle": 0.5, "paint-medium": 1, "paint-loose": 1.6 };
var ANCHORS = [
  [
    0.5,
    {
      base: [24, 16, 40, 22],
      wander: [8, 5, 18, 7],
      bandStep: [6, 14],
      ov: [30, 70],
      tilt: 6,
      kneeP: 0.3,
      knee: 4,
      tongues: 1,
      tongueW: [180, 320],
      shelves: 1,
      shelf: [8, 14],
      shelfW: [140, 320],
      notches: 0,
      notch: [14, 26],
      notchW: [90, 170],
      chamfer: [80, 140],
      lip: [70, 150],
      lipOut: [6, 12],
      bleed: [90, 170],
      over: [14, 34],
      endP: 0.5,
      stretch: [24, 70],
      minD: 7
    }
  ],
  [
    1,
    {
      base: [42, 22, 72, 40],
      wander: [16, 8, 36, 14],
      bandStep: [12, 32],
      ov: [30, 80],
      tilt: 12,
      kneeP: 0.45,
      knee: 8,
      tongues: 2,
      tongueW: [180, 380],
      shelves: 2,
      shelf: [12, 26],
      shelfW: [140, 360],
      notches: 2,
      notch: [28, 70],
      notchW: [90, 230],
      chamfer: [150, 250],
      lip: [90, 200],
      lipOut: [8, 18],
      bleed: [110, 220],
      over: [24, 58],
      endP: 0.62,
      stretch: [22, 70],
      minD: 8
    }
  ],
  [
    1.6,
    {
      base: [74, 30, 124, 62],
      wander: [30, 10, 64, 22],
      bandStep: [18, 48],
      ov: [30, 90],
      tilt: 20,
      kneeP: 0.6,
      knee: 14,
      tongues: 3,
      tongueW: [200, 420],
      shelves: 3,
      shelf: [16, 40],
      shelfW: [140, 400],
      notches: 4,
      notch: [44, 130],
      notchW: [100, 280],
      chamfer: [210, 340],
      lip: [110, 240],
      lipOut: [10, 26],
      bleed: [130, 280],
      over: [30, 66],
      endP: 0.72,
      stretch: [20, 64],
      minD: 8
    }
  ]
];
var mix = (a, b, t) => a + (b - a) * t;
function mixParams(a, b, t) {
  const out = {};
  for (const k of Object.keys(a)) {
    const va = a[k];
    const vb = b[k];
    out[k] = Array.isArray(va) ? va.map((v, i) => mix(v, vb[i], t)) : mix(va, vb, t);
  }
  return out;
}
function paintParams(L) {
  const [[l0, p0], [l1, p1], [l2, p2]] = ANCHORS;
  if (L <= l0) {
    const k = Math.max(0, L / l0);
    const s = (v) => v.map((x) => x * k);
    return { ...p0, base: s(p0.base), wander: s(p0.wander), bandStep: s(p0.bandStep), tilt: p0.tilt * k, knee: p0.knee * k, shelf: s(p0.shelf), notch: s(p0.notch), chamfer: s(p0.chamfer), lipOut: s(p0.lipOut), over: s(p0.over), tongues: p0.tongues * k, shelves: p0.shelves * k };
  }
  if (L <= l1) return mixParams(p0, p1, (L - l0) / (l1 - l0));
  return mixParams(p1, p2, (L - l1) / (l2 - l1));
}
var LEN = [W, H, W, H];
var toScreen = (s, u, d) => s === 0 ? [u, d] : s === 1 ? [W - d, u] : s === 2 ? [W - u, H - d] : [d, H - u];
var fromScreen = (s, p) => s === 0 ? { u: p[0], d: p[1] } : s === 1 ? { u: p[1], d: W - p[0] } : s === 2 ? { u: W - p[0], d: H - p[1] } : { u: H - p[1], d: p[0] };
var lerpR = (r2, t) => r2[0] + (r2[1] - r2[0]) * t;
var OFF = 40;
function interp(k, u) {
  if (u <= k[0].u) return k[0].d;
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i];
    const b = k[i + 1];
    if (u >= a.u && u <= b.u) return b.u - a.u < 1e-6 ? b.d : a.d + (b.d - a.d) * (u - a.u) / (b.u - a.u);
  }
  return k[k.length - 1].d;
}
var [CX0, CY0, CX1, CY1] = CAPTION_SAFE;
var CAP_PAD = 36;
var RAIL = [PHONE_UI.rail.y0 - 40, PHONE_UI.rail.y1 + 40];
var PAINT_LIMITS = { left: CX0 - 12, right: W - CX1 - 12, rail: 18, top: CY0 - 24, bottom: PHONE_UI.bottom - 20 };
var ZONES = [
  [[CX0 - 30, CX1 + 30, PAINT_LIMITS.top]],
  [
    [CY0 - CAP_PAD, CY1 + CAP_PAD, PAINT_LIMITS.right],
    [RAIL[0], RAIL[1], PAINT_LIMITS.rail]
  ],
  [[-1e4, 1e4, PAINT_LIMITS.bottom]],
  [[H - (CY1 + CAP_PAD), H - (CY0 - CAP_PAD), PAINT_LIMITS.left]]
];
var zoneMax = (s, u) => ZONES[s].reduce((m, [a, b, z]) => u >= a && u <= b ? Math.min(m, z) : m, Infinity);
function clampZones(s, k) {
  let out = k;
  for (const [a, b, m] of ZONES[s]) {
    const ins = [];
    for (const u of [a, b]) if (u > out[0].u && u < out[out.length - 1].u && !out.some((p) => Math.abs(p.u - u) < 1e-6)) ins.push({ u, d: interp(out, u) });
    out = [...out, ...ins].sort((p, q) => p.u - q.u).map((p) => p.u >= a - 1e-6 && p.u <= b + 1e-6 ? { u: p.u, d: Math.min(p.d, m) } : p);
  }
  return out;
}
var area = (p) => p.reduce((s, a, i) => {
  const b = p[(i + 1) % p.length];
  return s + a[0] * b[1] - b[0] * a[1];
}, 0);
var cw = (p) => area(p) < 0 ? p.slice().reverse() : p;
var dedupe = (p) => p.filter((a, i) => {
  const b = p[(i + p.length - 1) % p.length];
  return Math.hypot(a[0] - b[0], a[1] - b[1]) > 0.5;
});
function insidePoly(p, poly2) {
  let c = false;
  for (let i = 0, j = poly2.length - 1; i < poly2.length; j = i++) {
    const a = poly2[i];
    const b = poly2[j];
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1] || 1e-9) + a[0]) c = !c;
  }
  return c;
}
var insideAny = (p, polys) => polys.some((q) => insidePoly(p, q));
function containsRectAny(polys, [x0, y0, x1, y1], step = 10) {
  for (let x = x0; x <= x1; x += step) if (!insideAny([x, y0], polys) || !insideAny([x, y1], polys)) return false;
  for (let y = y0; y <= y1; y += step) if (!insideAny([x0, y], polys) || !insideAny([x1, y], polys)) return false;
  return true;
}
function depthAt(polys, s, u) {
  let best = Infinity;
  for (const poly2 of polys) {
    for (let i = 0; i < poly2.length; i++) {
      const a = fromScreen(s, poly2[i]);
      const b = fromScreen(s, poly2[(i + 1) % poly2.length]);
      if (a.u > u === b.u > u) continue;
      const d = a.d + (b.d - a.d) * (u - a.u) / (b.u - a.u || 1e-9);
      if (d < best) best = d;
    }
  }
  return best;
}
var block = (x0, y0, x1, y1, r2, j = 2.5) => [
  [x0 + r2.jitter(j), y0 + r2.jitter(j)],
  [x1 + r2.jitter(j), y0 + r2.jitter(j)],
  [x1 + r2.jitter(j), y1 + r2.jitter(j)],
  [x0 + r2.jitter(j), y1 + r2.jitter(j)]
];
var CACHE = /* @__PURE__ */ new Map();
function paintSpec(seed, looseness) {
  const key = `${seed}|${looseness.toFixed(3)}`;
  let g = CACHE.get(key);
  if (!g) {
    let L = looseness;
    for (let i = 0; i < 10; i++, L *= 0.9) {
      g = build(seed, L);
      if (containsRectAny(g.colourPolys, CAPTION_SAFE, 10)) break;
    }
    CACHE.set(key, g);
  }
  return g;
}
function build(seed, L) {
  const P3 = paintParams(L);
  const r2 = rng(`${seed}/paint`);
  const perm = r2.fork("roles").shuffle([0, 1, 2, 3]);
  const diag = (perm[0] + 2) % 4;
  const [ca, cb] = perm.filter((k) => k !== perm[0] && k !== diag);
  const roles = ["square", "square", "square", "square"];
  roles[perm[0]] = "unpainted";
  if (L >= 0.75) roles[ca] = "bleed";
  if (L >= 0.3) roles[cb] = "lip";
  if (L >= 1.3) roles[diag] = "unpainted";
  const rsp = r2.fork("splits");
  const s1 = rsp.range(680, 780);
  const s2a = rsp.range(1180, 1480);
  const s3a = rsp.range(1020, 1200);
  const s3b = rsp.range(1380, 1640);
  const nBands = L < 0.75 ? 2 : L < 1.3 ? 3 : 4;
  const splits = nBands === 2 ? [s1] : nBands === 3 ? [s1, s2a] : [s1, s3a, s3b];
  const nb = splits.length + 1;
  const insets = (s) => {
    const rr = r2.fork(`insets${s}`);
    const out = [];
    let prev = P3.base[s] + P3.wander[s] * rr.jitter(1);
    for (let i = 0; i < 6; i++) {
      const tilt = P3.wander[s] * 0.5 * rr.jitter(1);
      const sign = prev > P3.base[s] + P3.wander[s] * 0.5 ? -1 : prev < P3.base[s] - P3.wander[s] * 0.5 ? 1 : rr.sign();
      const step = lerpR(P3.bandStep, rr.next());
      if (i > 0) prev = P3.base[s] + 0.4 * (prev - P3.base[s]) + sign * step;
      out.push([prev - tilt / 2, prev + tilt / 2]);
    }
    return out.slice(0, nb);
  };
  const lIn = insets(3);
  const rIn = insets(1);
  const re = r2.fork("ends");
  const topD = [P3.base[0] + P3.wander[0] * re.jitter(1), P3.base[0] + P3.wander[0] * re.jitter(1)];
  const botD = [P3.base[2] + P3.wander[2] * re.jitter(1), P3.base[2] + P3.wander[2] * re.jitter(1)];
  const rov = r2.fork("overlap");
  const ovs = [0, 1, 2].map(() => [lerpR(P3.ov, rov.next()), lerpR(P3.ov, rov.next()), P3.tilt * rov.jitter(1), P3.tilt * rov.jitter(1)]);
  const clampD = (s, u, d) => Math.min(Math.max(d, P3.minD), zoneMax(s, u));
  const rk = r2.fork("knees");
  const kneeDraws = Array.from({ length: 24 }, () => [rk.next(), rk.range(0.3, 0.7), rk.jitter(1)]);
  let kneeI = 0;
  const edge = (s, a, b, frame) => {
    const ka = fromScreen(s, a);
    const kb = fromScreen(s, b);
    const [c, t, j] = kneeDraws[kneeI++ % kneeDraws.length];
    const k = [ka];
    if (c < P3.kneeP && kb.u - ka.u > 260) k.push({ u: ka.u + (kb.u - ka.u) * t, d: Math.max(P3.minD, ka.d + (kb.d - ka.d) * t + j * P3.knee) });
    k.push(kb);
    return frame ? clampZones(s, k) : k;
  };
  const bands = [];
  for (let i = 0; i < nb; i++) {
    const first = i === 0;
    const last = i === nb - 1;
    const oT = first ? null : ovs[i - 1];
    const oB = last ? null : ovs[i];
    const yTL = first ? topD[0] : splits[i - 1] - oT[1] + oT[2];
    const yTR = first ? topD[1] : splits[i - 1] - oT[1] - oT[2];
    const yBL = last ? H - botD[0] : splits[i] + oB[0] + oB[3];
    const yBR = last ? H - botD[1] : splits[i] + oB[0] - oB[3];
    const TL = [clampD(3, H - yTL, lIn[i][0]), first ? clampD(0, lIn[i][0], yTL) : yTL];
    const TR = [W - clampD(1, yTR, rIn[i][0]), first ? clampD(0, W - rIn[i][0], yTR) : yTR];
    const BR = [W - clampD(1, yBR, rIn[i][1]), last ? H - clampD(2, rIn[i][1], H - yBR) : yBR];
    const BL = [clampD(3, H - yBL, lIn[i][1]), last ? H - clampD(2, W - lIn[i][1], H - yBL) : yBL];
    bands.push({
      k: [edge(0, TL, TR, first), edge(1, TR, BR, true), edge(2, BR, BL, last), edge(3, BL, TL, true)],
      frame: [first, true, last, true],
      corners: [first ? 0 : -1, first ? 1 : -1, last ? 2 : -1, last ? 3 : -1]
    });
  }
  const taken = [[], [], [], []];
  const free = (s, lo, hi, w, forbid) => {
    let fr = [[lo, hi - w]];
    for (const [a, b] of [...forbid, ...taken[s].map(([a2, b2]) => [a2 - 50, b2 + 50])]) {
      fr = fr.flatMap(([x, y]) => {
        const o = [];
        if (a - w > x) o.push([x, Math.min(y, a - w)]);
        if (b < y) o.push([Math.max(x, b), y]);
        return o;
      });
    }
    return fr.filter(([x, y]) => y > x);
  };
  const pickIn = (fr, t) => {
    const tot = fr.reduce((s, [x, y]) => s + (y - x), 0);
    if (tot < 1) return null;
    let at = t * tot;
    for (const [x, y] of fr) {
      if (at <= y - x) return x + at;
      at -= y - x;
    }
    return null;
  };
  const keep = (role) => role === "unpainted" ? P3.chamfer[1] + 80 : role === "bleed" ? P3.bleed[1] * 1.2 + 70 : role === "lip" ? P3.lip[1] + 60 : 0;
  const seams = (s) => s === 1 || s === 3 ? splits.map((y) => s === 1 ? y : H - y).map((u) => [u - P3.ov[1] - 50, u + P3.ov[1] + 50]) : [];
  const cornerKeep = (s) => {
    const out = [];
    if (keep(roles[s])) out.push([-1e4, keep(roles[s])]);
    if (keep(roles[(s + 1) % 4])) out.push([LEN[s] - keep(roles[(s + 1) % 4]), 1e4]);
    return out;
  };
  const zoneForbid = (s) => ZONES[s].filter((z) => z[2] < 200).map(([a, b]) => [a - 30, b + 30]);
  const colK = bands.map((b) => b.k.map((k) => k.slice()));
  const nN = Math.round(P3.notches);
  for (let i = 0; i < 5; i++) {
    const rf = r2.fork(`notch${i}`);
    const s = rf.weighted([
      [3, 0.5],
      [2, 0.3],
      [0, 0.1],
      [1, 0.1]
    ]);
    const w = lerpR(P3.notchW, rf.next());
    const depth = lerpR(P3.notch, rf.next());
    const t = rf.next();
    const scoop = rf.chance(0.35);
    const a1 = rf.range(0.12, 0.3);
    const a2 = rf.range(0.7, 0.9);
    const k2 = rf.range(0.6, 1.1);
    const mirror = rf.chance(0.5);
    if (i >= nN) continue;
    const cands = bands.map((b, bi) => ({ bi, k: b.k[s], frame: b.frame[s] })).filter((c2) => c2.frame);
    const fr = cands.flatMap((c2) => free(s, c2.k[0].u + 70, c2.k[c2.k.length - 1].u - 70, w, [...zoneForbid(s), ...cornerKeep(s), ...seams(s)]));
    const at = pickIn(fr, t);
    if (at === null) continue;
    const c = cands.find((cc) => at >= cc.k[0].u + 69 && at + w <= cc.k[cc.k.length - 1].u - 69);
    if (!c) continue;
    taken[s].push([at, at + w]);
    const ua = at;
    const ub = at + w;
    const base = colK[c.bi][s];
    const pos = (f) => mirror ? ub - f * w : ua + f * w;
    const mid = (scoop ? [{ u: pos(0.06 + a1 * 0.2), d: interp(base, pos(0.06 + a1 * 0.2)) + depth }] : [
      { u: pos(a1 * 0.5), d: interp(base, pos(a1 * 0.5)) + depth },
      { u: pos(1 - (1 - a2) * 0.5), d: interp(base, pos(1 - (1 - a2) * 0.5)) + depth * k2 }
    ]).sort((p, q) => p.u - q.u);
    colK[c.bi][s] = [...base.filter((p) => p.u < ua), { u: ua, d: interp(base, ua) }, ...mid, { u: ub, d: interp(base, ub) }, ...base.filter((p) => p.u > ub)];
  }
  const rc = r2.fork("chamfers");
  const cham = [0, 1, 2, 3].map(() => ({ cIn: rc.next(), cOut: rc.next(), two: rc.chance(0.55), t1: rc.range(0.22, 0.42), t2: rc.range(0.58, 0.8), b1: rc.range(-0.3, 0.3), b2: rc.range(-0.3, 0.3), t0: rc.range(0.35, 0.65), b0: rc.range(-0.35, 0.25), ke: rc.range(0.4, 0.6) }));
  const chamExtent = (k, s, q) => {
    if (s === 1 || s === 3) return k <= 1 ? Math.max(20, CY0 - CAP_PAD - 8 - q[1]) : k === 2 ? Math.max(20, q[1] - RAIL[1] - 8) : 420;
    return 420;
  };
  const assemble = (kk, corners, sketch) => {
    const lists = kk.map((k) => k.slice());
    const knees = [[], [], [], []];
    for (let s = 0; s < 4; s++) {
      const k = corners[s];
      if (k < 0 || roles[k] !== "unpainted") continue;
      const ci = cham[k];
      const sIn = (k + 3) % 4;
      const inL = lists[sIn];
      const outL = lists[k];
      const q = toScreen(k, outL[0].u, outL[0].d);
      const spanIn = inL[inL.length - 1].u - inL[0].u;
      const spanOut = outL[outL.length - 1].u - outL[0].u;
      const ke = sketch ? ci.ke : 1;
      const cIn = Math.min(lerpR(P3.chamfer, ci.cIn), chamExtent(k, sIn, q), spanIn * 0.45) * ke;
      const cOut = Math.min(lerpR(P3.chamfer, ci.cOut), chamExtent(k, k, q), spanOut * 0.45) * ke;
      const uA = inL[inL.length - 1].u - cIn;
      const uB = outL[0].u + cOut;
      const A = toScreen(sIn, uA, interp(inL, uA));
      const B = toScreen(k, uB, interp(outL, uB));
      lists[sIn] = [...inL.filter((p) => p.u < uA), fromScreen(sIn, A)];
      lists[k] = [fromScreen(k, B), ...outL.filter((p) => p.u > uB)];
      const knee = (t, bulge) => {
        const m = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
        return [m[0] + (q[0] - m[0]) * bulge, m[1] + (q[1] - m[1]) * bulge];
      };
      knees[k] = ci.two ? [knee(ci.t1, ci.b1), knee(ci.t2, ci.b2)] : [knee(ci.t0, ci.b0)];
    }
    const pts = [];
    for (let s = 0; s < 4; s++) {
      pts.push(...knees[s]);
      pts.push(...lists[s].map((p) => toScreen(s, p.u, p.d)));
    }
    return cw(dedupe(pts));
  };
  const bandPaint = bands.map((b, i) => assemble(colK[i], b.corners, false));
  const bandSketch = bands.map((b) => assemble(b.k, b.corners, true));
  const blocks = [];
  const lipCorner = [];
  const cornerQ = (k) => {
    const b = k <= 1 ? bands[0] : bands[nb - 1];
    const kk = b.k[k];
    return toScreen(k, kk[0].u, kk[0].d);
  };
  const inward = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1]
  ];
  const fc = [
    [0, 0],
    [W, 0],
    [W, H],
    [0, H]
  ];
  for (let k = 0; k < 4; k++) {
    const rb = r2.fork(`cblock${k}`);
    const q = cornerQ(k);
    const [ix, iy] = inward[k];
    const t1 = rb.next();
    const t2 = rb.next();
    const t3 = rb.next();
    const t4 = rb.next();
    const dx = Math.abs(q[0] - fc[k][0]);
    const dy = Math.abs(q[1] - fc[k][1]);
    if (roles[k] === "bleed") {
      const bx = Math.max(dx + 40, lerpR(P3.bleed, t1));
      const by = Math.max(dy + 40, lerpR(P3.bleed, t2) * (k <= 1 ? 0.8 : 1.2));
      const xs = [fc[k][0] - ix * OFF, fc[k][0] + ix * bx];
      const ys = [fc[k][1] - iy * OFF, fc[k][1] + iy * by];
      blocks.push(cw(block(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), rb)));
    } else if (roles[k] === "lip") {
      const ox = Math.max(0, Math.min(lerpR(P3.lipOut, t1), dx - P3.minD));
      const oy = Math.max(0, Math.min(lerpR(P3.lipOut, t2), dy - P3.minD));
      const sx = lerpR(P3.lip, t3);
      const sy = Math.min(lerpR(P3.lip, t4), k <= 1 ? Math.max(30, CY0 - CAP_PAD - 8 - q[1]) : 400);
      const c = [q[0] - ix * ox, q[1] - iy * oy];
      const xs = [c[0], q[0] + ix * sx];
      const ys = [c[1], q[1] + iy * sy];
      blocks.push(cw(block(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), rb, 1.5)));
      lipCorner[k] = c;
    }
  }
  const nT = Math.round(P3.tongues);
  const nS = Math.round(P3.shelves);
  const features = (kind, n2) => {
    for (let i = 0; i < 4; i++) {
      const rf = r2.fork(`${kind}${i}`);
      const s = kind === "tongue" ? rf.weighted([
        [2, 0.5],
        [3, 0.25],
        [1, 0.1],
        [0, 0.15]
      ]) : rf.weighted([
        [3, 0.45],
        [0, 0.25],
        [2, 0.2],
        [1, 0.1]
      ]);
      const w = lerpR(kind === "tongue" ? P3.tongueW : P3.shelfW, rf.next());
      const t = rf.next();
      const out = lerpR(P3.shelf, rf.next());
      const slant = rf.range(0.18, 0.42);
      const flip = rf.chance(0.5);
      const reach = rf.range(30, 80);
      const jit = Array.from({ length: 9 }, () => rf.jitter(1.5));
      if (i >= n2) continue;
      const forbid = [...cornerKeep(s), ...seams(s), ...kind === "shelf" ? zoneForbid(s) : []];
      const at = pickIn(free(s, 60, LEN[s] - 60, w, forbid), t);
      if (at === null) continue;
      taken[s].push([at, at + w]);
      const body = [...bandPaint, ...blocks];
      let deep = 0;
      let shallow = Infinity;
      for (let u = at; u <= at + w; u += 10) {
        const d = depthAt(body, s, u);
        if (Number.isFinite(d)) {
          deep = Math.max(deep, d);
          shallow = Math.min(shallow, d);
        }
      }
      if (!Number.isFinite(shallow)) continue;
      const inner = deep + reach;
      let q;
      if (kind === "tongue") {
        const e = slant * w;
        const a = flip ? 8 : e;
        const b = flip ? e : 8;
        q = [toScreen(s, at, -OFF), toScreen(s, at + w, -OFF), toScreen(s, at + w - b, inner), toScreen(s, at + a, inner)];
      } else {
        const o = shallow - out < P3.minD + 4 ? -OFF : shallow - out;
        q = [toScreen(s, at, o), toScreen(s, at + w, o + jit[8] * 2), toScreen(s, at + w, inner), toScreen(s, at, inner)];
      }
      blocks.push(cw(q.map((p, j) => [p[0] + jit[2 * j], p[1] + jit[2 * j + 1]])));
    }
  };
  features("tongue", nT);
  features("shelf", nS);
  const colourPolys = [...bandPaint, ...blocks];
  const sketchPolys = [...bandSketch, ...blocks];
  const ri = r2.fork("ink");
  const inkPolys = [...sketchPolys];
  const toFrame = (p, n2) => {
    if (p[0] < 0 || p[0] > W || p[1] < 0 || p[1] > H) return 0;
    const tx = n2[0] > 1e-6 ? (W - p[0]) / n2[0] : n2[0] < -1e-6 ? -p[0] / n2[0] : Infinity;
    const ty = n2[1] > 1e-6 ? (H - p[1]) / n2[1] : n2[1] < -1e-6 ? -p[1] / n2[1] : Infinity;
    return Math.min(tx, ty);
  };
  let ends = true;
  let runLeft = 0;
  let cur = lerpR(P3.over, 0.5);
  for (const poly2 of sketchPolys) {
    const m = poly2.length;
    const lastOver = [];
    const firstOver = [];
    for (let i = 0; i < m; i++) {
      const a = poly2[i];
      const b = poly2[(i + 1) % m];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      firstOver[i] = lastOver[i] = 0;
      if (len < 2) continue;
      const dx = (b[0] - a[0]) / len;
      const dy = (b[1] - a[1]) / len;
      const n2 = [dy, -dx];
      const comb = [a];
      const reach = (t2, short) => {
        const p = [a[0] + dx * t2, a[1] + dy * t2];
        const D = toFrame(p, n2);
        const over = D < 16 || !ends ? D + OFF : Math.max(8, Math.min(cur, D - short));
        return [p[0] + n2[0] * over, p[1] + n2[1] * over, over];
      };
      let t = 0;
      let first = true;
      while (t <= len) {
        if (runLeft <= 0) {
          ends = ri.next() < P3.endP;
          runLeft = ri.range(80, 220);
        }
        cur = Math.min(P3.over[1], Math.max(P3.over[0], cur + ri.jitter(0.4 * (P3.over[1] - P3.over[0]))));
        const [x, y, over] = reach(t, ri.range(6, 22));
        if (first) firstOver[i] = over;
        first = false;
        lastOver[i] = over;
        comb.push([x, y]);
        if (t >= len) break;
        const st = lerpR(P3.stretch, ri.next());
        runLeft -= st;
        t = Math.min(len, t + st);
      }
      comb.push(b);
      inkPolys.push(cw(comb));
    }
    for (let i = 0; i < m; i++) {
      const p0 = poly2[(i + m - 1) % m];
      const v = poly2[i];
      const p1 = poly2[(i + 1) % m];
      const d0 = [v[0] - p0[0], v[1] - p0[1]];
      const d1 = [p1[0] - v[0], p1[1] - v[1]];
      const l0 = Math.hypot(d0[0], d0[1]);
      const l1 = Math.hypot(d1[0], d1[1]);
      if (l0 < 2 || l1 < 2 || d0[0] * d1[1] - d0[1] * d1[0] <= 0) continue;
      const o = Math.min(lastOver[(i + m - 1) % m], firstOver[i]);
      if (!(o > 0)) continue;
      const n0 = [d0[1] / l0, -d0[0] / l0];
      const n1 = [d1[1] / l1, -d1[0] / l1];
      inkPolys.push(cw([v, [v[0] + n0[0] * o, v[1] + n0[1] * o], [v[0] + (n0[0] + n1[0]) * o * 0.7, v[1] + (n0[1] + n1[1]) * o * 0.7], [v[0] + n1[0] * o, v[1] + n1[1] * o]]));
    }
  }
  const strokes = [];
  const rs = r2.fork("ruled");
  const topK = [0, 1].filter((k) => roles[k] === "square" || roles[k] === "lip");
  const pickK = rs.chance(0.5) ? 0 : 1;
  const kR = topK.length > 1 ? pickK : topK[0];
  const qR = kR === void 0 ? null : roles[kR] === "lip" ? lipCorner[kR] : cornerQ(kR);
  if (qR && L >= 0.3 && qR[1] < STROKE_MAX_Y - 60) {
    const k = kR;
    const q = qR;
    const sx = k === 0 ? 1 : -1;
    const side = k === 0 ? q[0] : W - q[0];
    strokes.push(
      ...ruledCorner(rs, `${seed}pnt${k}`, q, sx, {
        h: { len: [150, 260], over: Math.max(6, Math.min(side - 8, rs.range(16, 26) * Math.min(1.3, L))) },
        // the vertical stops above the caption block (it sits inside the caption block's x range when the side is deep)
        v: { len: [Math.min(140, STROKE_MAX_Y - q[1] - 20), STROKE_MAX_Y - q[1]], over: 40 }
      })
    );
  }
  const path = (polys) => polys.map((p) => pathOf(p)).join("");
  return { colour: path(colourPolys), colourPts: bandPaint[0], colourPolys, ink: path(inkPolys), inkPolys, strokes, meta: { roles, splits, L } };
}

// ../../../../tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v1/video/src/lib/edges/variants.ts
var dir = (a, b) => {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
};
var add = (p, u, k) => [p[0] + u[0] * k, p[1] + u[1] * k];
function panel(seed, a) {
  const r2 = rng(`${seed}/panel`);
  let L = r2.range(36, 42) * a;
  const R = r2.range(18, 22) * a;
  const T = r2.range(14, 18) * a;
  const yOpen = r2.range(1490, 1570);
  const snipDy = r2.range(120, 170);
  const tilt = () => r2.jitter(0.8);
  let pts = [];
  let tl = [L, T];
  let tr = [W - R, T];
  for (let k = 0; k < 12; k++, L *= 0.9) {
    tl = [L, T];
    tr = [W - R, T + tilt()];
    const corners = [tl, tr, [W - R + tilt(), H + 40], [-40, H + 40], [-40, yOpen + snipDy], [L + tilt(), yOpen]];
    pts = cutPoly(corners, r2.fork(`cut${k}`), {
      side: (i) => i === 0 ? { segs: [2, 3], dev: 1.8 * a, bow: 1.2 * a } : i === 1 ? { segs: [3, 4], dev: 2.2 * a, bow: 1.2 * a } : i === 5 ? { segs: [3, 4], dev: 2.6 * a, bow: 1.6 * a } : { segs: [1, 1], dev: 0, bow: 0 }
    });
    if (containsRect(pts, CAPTION_SAFE)) break;
  }
  const rc = r2.fork("comb");
  const comb = [];
  let y = yOpen + 60;
  while (y > -40) {
    const h = rc.range(80, 180);
    const k = rc.chance(0.6) ? rc.range(6, 20) * a : -2;
    comb.push([k, y], [k, y - h]);
    y -= h;
  }
  const inkPts = [[W + 40, -60], [W + 40, H + 40], [-40, H + 40], [-40, yOpen + 60], ...comb, [-40, y - 20], [-40, -60]];
  const strokes = [
    ...ruledCorner(r2.fork("tl"), `${seed}ptl`, tl, 1, { h: { len: [170, 290], over: Math.min(L - 10, r2.range(18, 30) * a) }, v: { len: [150, STROKE_MAX_Y - T], over: 40 } }),
    ...ruledCorner(r2.fork("tr"), `${seed}ptr`, tr, -1, { v: { len: [200, 320], over: 40 } })
  ];
  return { variant: "panel", colour: pathOf(pts), colourPts: pts, ink: pathOf(inkPts), inkPts, strokes };
}
function vignette(seed, a) {
  const r2 = rng(`${seed}/vignette`);
  const sideL = r2.range(4, 18) * a;
  const sideR = r2.range(4, 18) * a;
  const top = r2.range(56, 90) * a;
  const bot = r2.range(90, 130) * a;
  const flipT = r2.chance(0.5);
  const flipB = r2.chance(0.5);
  const tA = [r2.range(110, 170) * a, r2.range(150, 230) * a];
  const tB = [r2.range(230, 320) * a, r2.range(120, 180) * a];
  const bA = [r2.range(180, 250) * a, r2.range(240, 330) * a];
  const bB = [r2.range(330, 430) * a, r2.range(460, 620) * a];
  let rad = [flipT ? tA : tB, flipT ? tB : tA, flipB ? bA : bB, flipB ? bB : bA];
  const wr = r2.fork("wob");
  const harmonics = [
    [wr.int(2, 3), 0.45],
    [wr.int(4, 6), 0.35],
    [wr.int(9, 13), 0.2]
  ];
  let pts = [];
  for (let k = 0; k < 14; k++) {
    const base = roundRectPts(sideL, top, W - sideR, H - bot, rad);
    pts = organic(base, rng(`${seed}/vignette/wob`), {
      amp: 18 * a,
      harmonics,
      // more wobble where the contour turns (the corners), less along the long sides
      ampAt: (p) => 0.6 + 0.8 * Math.max(0, Math.min(1, (360 - Math.max(Math.min(p[0], W - p[0]), Math.min(p[1], H - p[1]))) / 360))
    });
    if (containsRect(pts, CAPTION_SAFE)) break;
    rad = [[rad[0][0] * 0.88, rad[0][1] * 0.88], [rad[1][0] * 0.88, rad[1][1] * 0.88], rad[2], rad[3]];
  }
  return { variant: "vignette", colour: smoothClosed(pts), colourPts: pts, strokes: [] };
}
function construction(seed, a, o) {
  const r2 = rng(`${seed}/construction`);
  const vp = o.vp ?? world.vp;
  const strokes = [];
  const [cx02, cy02, cx12, cy12] = CAPTION_SAFE;
  const inCap = (p) => p[0] > cx02 - 10 && p[0] < cx12 + 10 && p[1] > cy02 - 10 && p[1] < cy12 + 10;
  const targets = [
    [r2.range(-60, 120), H + 60],
    [W - r2.range(-60, 120), H + 60],
    [-60, r2.range(1240, 1560)],
    [W + 60, r2.range(1180, 1500)]
  ];
  if (r2.chance(0.7)) targets.push([r2.range(300, 420), H + 60]);
  if (r2.chance(0.6)) targets.push([-60, r2.range(-60, 120)]);
  if (r2.chance(0.6)) targets.push([W + 60, r2.range(-60, 120)]);
  targets.forEach((tp, i) => {
    const rr = r2.fork(`g${i}`);
    const u = dir(vp, tp);
    const tx = u[0] > 1e-6 ? (W - vp[0]) / u[0] : u[0] < -1e-6 ? -vp[0] / u[0] : Infinity;
    const ty = u[1] > 1e-6 ? (H - vp[1]) / u[1] : u[1] < -1e-6 ? -vp[1] / u[1] : Infinity;
    const te = Math.min(tx, ty);
    const out = add(vp, u, te + rr.range(10, 30));
    const inn = add(vp, u, te - rr.range(120, 260) * a);
    if (inCap(inn) || inCap(out)) return;
    strokes.push({ d: ruled(inn, out, `${seed}cg${i}`, 0.15), w: stroke.inkThin });
  });
  const hy = vp[1] + r2.jitter(3);
  strokes.push({ d: ruled([-24, hy + r2.jitter(2)], [r2.range(110, 200) * a, hy + r2.jitter(2)], `${seed}hzL`, 0.2), w: stroke.inkThin });
  strokes.push({ d: ruled([W - r2.range(110, 200) * a, hy + r2.jitter(2)], [W + 24, hy + r2.jitter(2)], `${seed}hzR`, 0.2), w: stroke.inkThin });
  const tick = (p, inward, key) => {
    const rr = r2.fork(key);
    const len = rr.range(22, 36) * a;
    const along = [inward[1], -inward[0]];
    const p0 = add(p, inward, -8);
    const p1 = add(add(p, inward, len), along, rr.jitter(1.5));
    if (inCap(p1)) return;
    strokes.push({ d: ruled(p0, p1, `${seed}${key}`, 0.5), w: stroke.inkThin, taper: false });
    if (rr.chance(0.35)) strokes.push({ d: ruled(add(p0, along, 8), add(p1, along, 8 + rr.jitter(1.5)), `${seed}${key}b`, 0.5), w: stroke.inkHair, taper: false });
  };
  [1 / 3, 1 / 2, 2 / 3].forEach((f, i) => {
    tick([0, H * f + r2.jitter(6)], [1, 0], `tl${i}`);
    tick([W, H * f + r2.jitter(6)], [-1, 0], `tr${i}`);
    tick([W * f + r2.jitter(6), 0], [0, 1], `tt${i}`);
    tick([W * f + r2.jitter(6), H], [0, -1], `tb${i}`);
  });
  const cm = r2.chance(0.5) ? [0, 2] : [1, 3];
  const corners = [
    [0, 0],
    [W, 0],
    [W, H],
    [0, H]
  ];
  for (const ci of cm) {
    const rr = r2.fork(`cm${ci}`);
    const c = corners[ci];
    const sx = c[0] === 0 ? 1 : -1;
    const sy = c[1] === 0 ? 1 : -1;
    const inset = rr.range(22, 32) * a;
    const k = [c[0] + sx * inset, c[1] + sy * inset];
    strokes.push({ d: ruled([k[0] - sx * rr.range(16, 30), k[1]], [k[0] + sx * rr.range(80, 150) * a, k[1]], `${seed}cmh${ci}`, 0.3), w: stroke.inkThin });
    strokes.push({ d: ruled([k[0], k[1] - sy * rr.range(16, 30)], [k[0], k[1] + sy * rr.range(100, 190) * a], `${seed}cmv${ci}`, 0.3), w: stroke.inkThin });
  }
  return { variant: "construction", colour: null, colourPts: null, strokes };
}
function roughTB(seed, a) {
  const r2 = rng(`${seed}/roughtb`);
  const t0 = [-60, r2.range(44, 70) * a];
  const t1 = [W + 60, r2.range(44, 70) * a];
  const b1 = [W + 60, H - r2.range(56, 90) * a];
  const b0 = [-60, H - r2.range(56, 90) * a];
  const o = { segs: [4, 6], dev: 6 * a, bow: 4 * a };
  const pts = [t0, ...cutSide(t0, t1, r2.fork("top"), o), b1, ...cutSide(b1, b0, r2.fork("bot"), o)];
  return { variant: "rough-tb", colour: pathOf(pts), colourPts: pts, strokes: [] };
}
function trim(seed, a) {
  const r2 = rng(`${seed}/trim`);
  let L = r2.range(28, 32) * a;
  let Lw = r2.range(36, 40) * a;
  const R = r2.range(22, 26) * a;
  const T = r2.range(12, 16) * a;
  const w0 = r2.range(560, 900);
  const w1 = w0 + r2.range(300, 440);
  const tr0 = r2.range(80, 120);
  const tr1 = r2.range(80, 120);
  const snip = [r2.range(18, 28) * a, r2.range(30, 46) * a];
  const tilt = () => r2.jitter(0.8);
  let pts = [];
  let tl = [L, T];
  for (let k = 0; k < 12; k++, L *= 0.9, Lw *= 0.9) {
    tl = [L, T];
    const yT = T + tilt();
    const corners = [
      tl,
      [W - R - snip[0], yT],
      [W - R, yT + snip[1]],
      [W - R + tilt(), H + 40],
      [L + tilt(), H + 40],
      [L, w1 + tr1],
      [Lw, w1],
      [Lw + tilt(), w0],
      [L, w0 - tr0]
    ];
    pts = cutPoly(corners, r2.fork(`cut${k}`), {
      side: (i) => i === 0 ? { segs: [2, 3], dev: 1.2 * a, bow: 1 * a } : i === 2 ? { segs: [3, 4], dev: 1.5 * a, bow: 1.2 * a } : i === 4 || i === 6 || i === 8 ? { segs: [1, 2], dev: 1.5 * a, bow: 1 * a } : { segs: [1, 1], dev: 0, bow: 0 }
    });
    if (containsRect(pts, CAPTION_SAFE)) break;
  }
  const strokes = ruledCorner(r2.fork("tl"), `${seed}ttl`, tl, 1, { h: { len: [140, 240], over: Math.min(L - 8, r2.range(16, 22) * a) }, v: { len: [140, STROKE_MAX_Y - T], over: 40 } });
  return { variant: "trim", colour: pathOf(pts), colourPts: pts, ink: null, inkPts: null, strokes };
}
var CACHE2 = /* @__PURE__ */ new Map();
function edgeSpec(variant, seed = "edge", amount = 1, o = {}) {
  const a = Math.max(0, amount);
  const key = `${variant}|${seed}|${a.toFixed(3)}|${o.vp?.join(",") ?? ""}`;
  let s = CACHE2.get(key);
  if (s) return s;
  if (variant === "clean" || a <= 0) s = { variant, colour: null, colourPts: null, strokes: [] };
  else if (variant === "panel") s = panel(seed, a);
  else if (variant === "vignette") s = vignette(seed, a);
  else if (variant === "construction") s = construction(seed, a, o);
  else if (variant === "rough-tb") s = roughTB(seed, a);
  else if (variant === "paint" || variant in PAINT_LOOSENESS) {
    const g = paintSpec(seed, variant === "paint" ? a : PAINT_LOOSENESS[variant] * a);
    s = { variant, colour: g.colour, colourPts: g.colourPts, colourPolys: g.colourPolys, ink: g.ink, inkPolys: g.inkPolys, strokes: g.strokes };
  } else s = trim(seed, a);
  CACHE2.set(key, s);
  return s;
}

// ../../../../tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v1check.ts
var W2 = 1080;
var H2 = 1920;
var [cx0, cy0, cx1, cy1] = CAPTION_SAFE;
var WHERE = process.argv.includes("--where");
var QUICK = process.argv.includes("--quick");
function spans(polys, c, vertical) {
  const iv = [];
  for (const p of polys) {
    const xs = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i];
      const b = p[(i + 1) % p.length];
      const [ay, by, ax, bx] = vertical ? [a[0], b[0], a[1], b[1]] : [a[1], b[1], a[0], b[0]];
      if (ay > c === by > c) continue;
      xs.push(ax + (bx - ax) * (c - ay) / (by - ay));
    }
    xs.sort((m, n2) => m - n2);
    for (let i = 0; i + 1 < xs.length; i += 2) iv.push([xs[i], xs[i + 1]]);
  }
  iv.sort((m, n2) => m[0] - n2[0]);
  const out = [];
  for (const s of iv) {
    const l = out[out.length - 1];
    if (l && s[0] <= l[1] + 0.5) l[1] = Math.max(l[1], s[1]);
    else out.push([s[0], s[1]]);
  }
  return out;
}
var pct = (v, q) => {
  const s = v.slice().sort((a, b) => a - b);
  return s.length ? s[Math.min(s.length - 1, Math.floor(q * s.length))] : NaN;
};
var fails = 0;
var n = 0;
var fail = (m) => {
  fails++;
  if (fails < 1e5) console.log("FAIL " + m);
};
var variants = ["paint-subtle", "paint-medium", "paint-loose"];
var scenes = [["no hints", void 0]];
var stats = {};
for (const v of variants) {
  for (const amount of QUICK ? [1] : [0.6, 0.8, 1, 1.2, 1.4]) {
    for (const [sceneName, hints] of scenes) {
      for (let s = 0; s < (QUICK ? 10 : 40); s++) {
        const seed = s === 0 ? "film" : `scene-${String(s).padStart(2, "0")}`;
        const spec = edgeSpec(v, seed, amount, { hints });
        const polys = spec.colourPolys;
        const inkPolys = spec.inkPolys;
        n++;
        const tag = `${v} ${seed} x${amount} [${sceneName}]`;
        if (!containsRectAny(polys, CAPTION_SAFE, 10)) fail(`${tag}: colour cuts the caption block`);
        for (const kr of hints?.keep ?? []) if (!containsRectAny(polys, kr, 8)) fail(`${tag}: keep rect ${kr} is cut`);
        for (const st2 of spec.strokes) {
          const nums = (st2.d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
          for (let i = 0; i + 1 < nums.length; i += 2) {
            const [x, y] = [nums[i], nums[i + 1]];
            if (x > cx0 - 6 && x < cx1 + 6 && y > cy0 - 6 && y < cy1 + 6) {
              fail(`${tag}: a stroke enters the caption block at ${x},${y}`);
              break;
            }
          }
        }
        for (let y = cy0 - 30; y <= cy1 + 30; y += 4) {
          const l = depthAt(polys, 3, H2 - y);
          const r2 = depthAt(polys, 1, y);
          if (l > PAINT_LIMITS.left + 0.5) fail(`${tag}: left paper ${l.toFixed(1)} beside the caption at y ${y}`);
          if (r2 > PAINT_LIMITS.right + 0.5) fail(`${tag}: right paper ${r2.toFixed(1)} beside the caption at y ${y}`);
        }
        for (let y = 900; y <= 1500; y += 4) {
          const r2 = depthAt(polys, 1, y);
          if (r2 > PAINT_LIMITS.rail + 0.5) fail(`${tag}: right paper ${r2.toFixed(1)} under the rail at y ${y}`);
        }
        const mask = new Uint8Array(W2 * H2);
        for (let y = 0; y < H2; y++) for (const [a, b] of spans(polys, y + 0.5, false)) for (let x = Math.max(0, Math.ceil(a - 0.5)); x < Math.min(W2, Math.floor(b - 0.5) + 1); x++) mask[y * W2 + x] = 1;
        let paperPx = 0;
        let visPx = 0;
        const seen = new Uint8Array(W2 * H2);
        const stack = [];
        for (let i = 0; i < W2 * H2; i++) {
          if (mask[i]) continue;
          paperPx++;
          const y = i / W2 | 0;
          if (y >= 180 && y <= 1520) visPx++;
          const x = i % W2;
          if (x === 0 || y === 0 || x === W2 - 1 || y === H2 - 1) {
            seen[i] = 1;
            stack.push(i);
          }
        }
        while (stack.length) {
          const i = stack.pop();
          const x = i % W2;
          for (const j of [x > 0 ? i - 1 : -1, x < W2 - 1 ? i + 1 : -1, i - W2, i + W2]) {
            if (j < 0 || j >= W2 * H2 || seen[j] || mask[j]) continue;
            seen[j] = 1;
            stack.push(j);
          }
        }
        let holes = 0;
        let hx = 0;
        let hy = 0;
        for (let i = 0; i < W2 * H2; i++)
          if (!mask[i] && !seen[i]) {
            holes++;
            hx = i % W2;
            hy = i / W2 | 0;
          }
        let hair = 0;
        const hairAt = [];
        for (let y = 0; y < H2; y += 2) {
          let a = 0;
          while (a < W2 && !mask[y * W2 + a]) a++;
          if (a > 0 && a < 6) hair++, hairAt.push(`L y${y}`);
          let b = 0;
          while (b < W2 && !mask[y * W2 + W2 - 1 - b]) b++;
          if (b > 0 && b < 6) hair++, hairAt.push(`R y${y}`);
        }
        for (let x = 0; x < W2; x += 2) {
          let a = 0;
          while (a < H2 && !mask[a * W2 + x]) a++;
          if (a > 0 && a < 6) hair++, hairAt.push(`T x${x}`);
          let b = 0;
          while (b < H2 && !mask[(H2 - 1 - b) * W2 + x]) b++;
          if (b > 0 && b < 6) hair++, hairAt.push(`B x${x}`);
        }
        if (holes > 4) fail(`${tag}: ${holes} px of enclosed paper (holes between blocks)${WHERE ? ` e.g. at ${hx},${hy}` : ""}`);
        if (hair > 10) fail(`${tag}: ${hair} hairline scanlines at the frame edge${WHERE ? ` ${hairAt.slice(0, 4).join(" ")}` : ""}`);
        let jogs = 0;
        for (let side = 0; side < 4; side++) {
          const len = side % 2 ? H2 : W2;
          const d = [];
          for (let u = 1; u < len; u += 2) d.push(Math.max(0, Math.min(400, depthAt(polys, side, u))));
          let last = -100;
          for (let i = 6; i < d.length; i++) {
            const dd = Math.abs(d[i] - d[i - 6]);
            const before = Math.abs(d[i - 6] - (d[i - 12] ?? d[i - 6]));
            const after = Math.abs((d[i + 6] ?? d[i]) - d[i]);
            if (dd >= 6 && dd < 24 && before < 2 && after < 2) {
              if (i - last > 8) {
                jogs++;
                if (WHERE && jogs <= 2 && amount === 1) console.log(`  jog ${v} ${seed} [${sceneName}] side ${side} u ${i * 2 + 1}: ${d[i - 6].toFixed(0)} -> ${d[i].toFixed(0)}`);
              }
              last = i;
            }
          }
        }
        let dashes = 0;
        let dashLines = 0;
        for (let side = 0; side < 4; side++) {
          for (let dd = 4; dd <= 200; dd += 6) {
            const vertical = side === 1 || side === 3;
            const c = side === 0 ? dd : side === 1 ? W2 - dd : side === 2 ? H2 - dd : dd;
            const col = spans(polys, c, vertical);
            const ink = spans(inkPolys, c, vertical);
            const len = vertical ? H2 : W2;
            const paper = [];
            let x = 0;
            for (const [a, b] of col) {
              if (a > x) paper.push([x, Math.min(a, len)]);
              x = Math.max(x, b);
            }
            if (x < len) paper.push([x, len]);
            let lineDash = false;
            for (const [pa, pb] of paper) {
              if (pb - pa < 80) continue;
              const cov = ink.map(([a, b]) => [Math.max(a, pa), Math.min(b, pb)]).filter(([a, b]) => b - a > 20);
              for (let i = 1; i < cov.length; i++) {
                const gap = cov[i][0] - cov[i - 1][1];
                if (gap > 1 && gap < 60) {
                  (stats[v] ??= { gapHist: [0, 0, 0, 0], paper: [], vis: [], L: [], R: [], T: [], B: [], bare: [], inkKB: [], jogs: 0, dashes: 0, dashLines: 0, holes: 0, hair: 0 }).gapHist[gap < 4 ? 0 : gap < 12 ? 1 : gap < 30 ? 2 : 3]++;
                  dashes++;
                  lineDash = true;
                  if (WHERE && amount === 1 && s < 2 && dashes <= 6) console.log(`  dash ${v} ${seed} [${sceneName}] side ${side} depth ${dd}: gap ${cov[i - 1][1].toFixed(0)}-${cov[i][0].toFixed(0)}`);
                }
              }
            }
            if (lineDash) dashLines++;
          }
        }
        const key = v;
        const st = stats[key] ??= { gapHist: [0, 0, 0, 0], paper: [], vis: [], L: [], R: [], T: [], B: [], bare: [], inkKB: [], jogs: 0, dashes: 0, dashLines: 0, holes: 0, hair: 0 };
        st.jogs += jogs;
        st.dashes += dashes;
        st.dashLines += dashLines;
        st.holes += holes > 4 ? 1 : 0;
        st.hair += hair > 10 ? 1 : 0;
        if (amount === 1) {
          st.paper.push(paperPx / (W2 * H2) * 100);
          st.vis.push(visPx / (W2 * 1340) * 100);
          for (let y = 200; y <= 1500; y += 10) {
            st.L.push(Math.max(0, depthAt(polys, 3, H2 - y)));
            st.R.push(Math.max(0, depthAt(polys, 1, y)));
          }
          for (let x = 60; x <= 1020; x += 10) {
            st.T.push(Math.max(0, depthAt(polys, 0, x)));
            st.B.push(Math.max(0, depthAt(polys, 2, W2 - x)));
          }
          st.bare.push(paintSpec(seed, PAINT_LOOSENESS[v], hints).meta.roles.filter((r2) => r2 === "bare").length);
          st.inkKB.push((spec.ink ?? "").length / 1024);
        }
      }
    }
  }
}
console.log(`${n} paint edges checked (3 presets x 5 amounts x 4 scenes (3 lab shots + no hints) x 40 seeds), ${fails} failures`);
var r = (v) => `${pct(v, 0.05).toFixed(0)} / ${pct(v, 0.5).toFixed(0)} / ${pct(v, 0.95).toFixed(0)}`;
console.log("preset @ amount 1 (4 scenes x 40 seeds): p5 / median / p95; jogs / dashes over all amounts");
for (const [k, s] of Object.entries(stats)) {
  console.log(`${k}: paper ${r(s.paper)} % of the frame (${r(s.vis)} % of y 180-1520); depth left ${r(s.L)}, right ${r(s.R)} (y 200-1500), top ${r(s.T)}, bottom ${r(s.B)} px; bare corners ${r(s.bare)}; ink clip ${r(s.inkKB)} KB; jogs 6-24 px ${s.jogs} (${(s.jogs / (QUICK ? 40 : 800)).toFixed(2)} per edge); ink gaps < 60 px on lines parallel to an edge ${s.dashes} (${(s.dashes / (QUICK ? 40 : 800)).toFixed(2)} per edge; by width 1-4 / 4-12 / 12-30 / 30-60 px: ${s.gapHist.join(" / ")}); edges with holes ${s.holes}, with hairlines ${s.hair}`);
}
process.exit(fails ? 1 : 0);
