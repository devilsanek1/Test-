// Imagination B's drawing kit: whole-frame value sketches at 1080 x 1920 (cool night greys + ONE warm accent, the heat).
// Used by frames.js; pages/BNN.html call FRAMES[id]() and the renderer (video/scripts/type/render.mjs) shoots the page.
const W = 1080, H = 1920;

// ---------- seeded randomness (every frame redraws the same) ----------
let _s = 1;
function seed(n) { _s = ((n + 7) * 2654435761) >>> 0 || 1; for (let i = 0; i < 5; i++) rnd(); }
function rnd() { _s ^= _s << 13; _s >>>= 0; _s ^= _s >>> 17; _s ^= _s << 5; _s >>>= 0; return _s / 4294967296; }
const rr = (a, b) => a + (b - a) * rnd();
const ri = (a, b) => Math.floor(rr(a, b + 1));
const f1 = (v) => Math.round(v * 10) / 10;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- the values: cool night greys (0 darkest .. 14 lightest), the paper, the one warm accent ----------
const V = ['#0e1017', '#151820', '#1c2029', '#232833', '#2c323e', '#363d4a', '#424a58', '#505867', '#606878', '#727a89',
  '#868d9b', '#9ba1ad', '#b2b7c0', '#cbced5', '#e2e3e6'];
const C = {
  paper: '#ecebe6', paperT: '#e3e3e4', ink: '#2b2335',
  honey: '#f0ac52', honeyL: '#ffd27f', honeyC: '#fff1d4', honeyD: '#c58237', honeyW: '#7e5a39',
  cool: '#9cc8dc', coolD: '#5f8fa8', pencil: '#eef1f5', light: '#e9f2f5'
};

// ---------- svg basics ----------
function polyD(pts, jit = 0) {
  return 'M' + pts.map((p) => f1(p[0] + (jit ? rr(-jit, jit) : 0)) + ' ' + f1(p[1] + (jit ? rr(-jit, jit) : 0))).join(' L') + ' Z';
}
function lineD(pts, jit = 0) {
  return 'M' + pts.map((p) => f1(p[0] + (jit ? rr(-jit, jit) : 0)) + ' ' + f1(p[1] + (jit ? rr(-jit, jit) : 0))).join(' L');
}
// Catmull-Rom through the points, as cubic beziers (closed or open)
function smoothD(pts, closed = true, k = 1) {
  const n = pts.length; if (n < 2) return '';
  const P = (i) => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
  let d = 'M' + f1(P(0)[0]) + ' ' + f1(P(0)[1]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6 * k, p1[1] + (p2[1] - p0[1]) / 6 * k];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6 * k, p2[1] - (p3[1] - p1[1]) / 6 * k];
    d += ' C' + f1(c1[0]) + ' ' + f1(c1[1]) + ' ' + f1(c2[0]) + ' ' + f1(c2[1]) + ' ' + f1(p2[0]) + ' ' + f1(p2[1]);
  }
  return d + (closed ? ' Z' : '');
}
function blobD(cx, cy, rx, ry, n = 9, irr = 0.22, rot = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2, r = 1 + rr(-irr, irr);
    pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
  }
  return smoothD(pts, true);
}
const P = (d, fill, ex = '') => `<path d="${d}" fill="${fill}" ${ex}/>`;
const S = (d, stroke, w, ex = '') => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${ex}/>`;
const G = (inner, ex = '') => `<g ${ex}>${inner}</g>`;
const rect = (x, y, w, h, fill, ex = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}" ${ex}/>`;
const ell = (cx, cy, rx, ry, fill, ex = '') => `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${fill}" ${ex}/>`;
// a hand-cut rectangle (made things stay straight, but no ruler line left unbroken)
const hrect = (x, y, w, h, fill, jit = 1.2, ex = '') => P(polyD([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], jit), fill, ex);

function defs(extra = '') {
  const blur = (id, s, m = 60) => `<filter id="${id}" x="-${m}%" y="-${m}%" width="${100 + 2 * m}%" height="${100 + 2 * m}%"><feGaussianBlur stdDeviation="${s}"/></filter>`;
  return `<defs>${blur('b1', 1.2, 20)}${blur('b2', 2.2, 30)}${blur('b4', 4, 40)}${blur('b8', 8)}${blur('b14', 14)}${blur('b24', 24, 90)}${blur('b40', 40, 120)}${blur('b70', 70, 160)}
  <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.52  0 0 0 0.10 0"/></filter>
  <filter id="mottle" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="3" seed="9" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.6  0 0 0 0 0.62  0 0 0 0 0.68  0 0 0 0.16 -0.02"/></filter>
  ${extra}</defs>`;
}

// ---------- the sky and the caption band (the band kept as a light calm field: the board's convention) ----------
function sky(hz, low = V[10], mid = V[12], id = 'skyg') {
  const t = (y) => clamp(y / hz, 0, 1).toFixed(3);
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${hz}">
    <stop offset="0" stop-color="${C.paperT}"/><stop offset="${t(290)}" stop-color="${C.paper}"/><stop offset="${t(600)}" stop-color="${C.paper}"/>
    <stop offset="${t(Math.min(hz - 60, 760))}" stop-color="${mid}"/><stop offset="1" stop-color="${low}"/></linearGradient>` +
    `<rect x="0" y="0" width="${W}" height="${hz + 4}" fill="url(#${id})"/>`;
}
// a soft painted cloud bank (tone on tone, below the band)
function cloudBank(y, h, col, op = 0.5, n = 7) {
  let s = '';
  for (let i = 0; i < n; i++) s += P(blobD(rr(-60, W + 60), y + rr(-h * 0.3, h * 0.3), rr(140, 260), rr(h * 0.25, h * 0.5), 9, 0.25), col, `opacity="${f1(op * rr(0.6, 1))}" filter="url(#b24)"`);
  return s;
}

// captions: rows [{t, x, y, size, anchor, lit}] in the hand (Gaegu); the lit word bolder, bigger, with a soft warm halo
function caption(rows) {
  let s = '';
  for (const r of rows) {
    const size = r.size || (r.lit ? 156 : 112), wgt = r.lit ? 700 : 400, a = r.anchor || 'middle';
    if (r.lit) s += `<text x="${r.x}" y="${r.y}" font-family="Gaegu" font-weight="700" font-size="${size}" text-anchor="${a}" fill="${C.honeyL}" opacity="0.75" filter="url(#b8)" letter-spacing="2">${r.t}</text>`;
    s += `<text x="${r.x}" y="${r.y}" font-family="Gaegu" font-weight="${wgt}" font-size="${size}" text-anchor="${a}" fill="${C.ink}" letter-spacing="2">${r.t}</text>`;
  }
  return `<g class="ink">${s}</g>`;
}

// snow falling: three sizes, half density and small in the band
function snowfall(n, y0 = 0, y1 = H, opts = {}) {
  const {col = '#f4f5f7', op = 0.85, rmax = 5, dark = false} = opts;
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = rr(0, W), y = rr(y0, y1);
    const inBand = y > 280 && y < 610;
    if (inBand && rnd() < 0.55) continue;
    const r = inBand ? rr(1.2, 2.6) : rr(1.4, rmax) * (rnd() < 0.12 ? 1.6 : 1);
    s += ell(x, y, r, r * rr(0.85, 1.1), dark && inBand ? V[11] : col, `opacity="${f1(rr(op * 0.45, op))}"`);
  }
  return G(s);
}

// steam: soft vapour rising from (x, y), h tall, w wide at its top; warm at its root if warm
function steam(x, y, w, h, opts = {}) {
  const {n = 8, col = V[13], warm = false, op = 0.7, lean = 0, root = 0.35, sharp = false} = opts;
  let s = '';
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1);
    const cx = x + lean * t * h + rr(-w * 0.18, w * 0.18) * t;
    const cy = y - t * h;
    const rx = (w * 0.18 + w * 0.42 * t) * rr(0.8, 1.15), ry = rx * rr(0.55, 0.85);
    const c = warm && t < root ? (t < root * 0.5 ? C.honeyL : C.honeyC) : col;
    const b = sharp ? (rx > 90 ? 'b14' : rx > 45 ? 'b8' : 'b4') : (rx > 90 ? 'b40' : rx > 45 ? 'b24' : rx > 20 ? 'b14' : 'b8');
    s += P(blobD(cx, cy, rx, ry, 8, 0.2), c, `opacity="${f1(op * (1 - t * 0.7))}" filter="url(#${b})"`);
  }
  return G(s);
}

// a lit window (a source: its pane, a small bloom at the pane only) or a dark one
function win(x, y, w, h, opts = {}) {
  const {lit = false, warm = C.honey, glow = 1, frame = V[1], cross = true, core = true} = opts;
  let s = '';
  if (lit) {
    if (glow) s += rect(x - w * 0.35, y - h * 0.25, w * 1.7, h * 1.5, warm, `opacity="${0.32 * glow}" filter="url(#b8)"`);
    s += hrect(x, y, w, h, warm, 0.6);
    if (core) s += hrect(x + w * 0.2, y + h * 0.18, w * 0.6, h * 0.55, C.honeyC, 0.5, 'opacity="0.55" filter="url(#b2)"');
    if (cross && w > 9) s += rect(x + w / 2 - Math.max(0.8, w * 0.06) / 2, y, Math.max(0.8, w * 0.06), h, frame, 'opacity="0.7"') + rect(x, y + h * 0.42, w, Math.max(0.8, h * 0.05), frame, 'opacity="0.7"');
  } else {
    s += hrect(x, y, w, h, opts.fill || V[1], 0.6);
  }
  return s;
}

// ---------- the camera (one camera, a person's eye) ----------
function Cam(f, cx, hz, eye) {
  return {f, cx, hz, eye,
    p(X, Y, Z) { return [cx + f * X / Z, hz - f * (Y - eye) / Z]; },
    sz(L, Z) { return f * L / Z; }};
}
const q3 = (cam, pts) => pts.map((p) => cam.p(p[0], p[1], p[2]));
const poly3 = (cam, pts, fill, ex = '', jit = 0.6) => P(polyD(q3(cam, pts), jit), fill, ex);
// a quad on the vertical plane X = x (a facade along the street), from z1..z2, y1..y2
const facadeX = (cam, x, z1, z2, y1, y2, fill, ex = '') => poly3(cam, [[x, y1, z1], [x, y1, z2], [x, y2, z2], [x, y2, z1]], fill, ex);
// a quad on the plane Z = z (a face toward the camera)
const faceZ = (cam, z, x1, x2, y1, y2, fill, ex = '') => poly3(cam, [[x1, y1, z], [x2, y1, z], [x2, y2, z], [x1, y2, z]], fill, ex);
// a quad on the ground (Y = y), x1..x2, z1..z2
const ground3 = (cam, y, x1, x2, z1, z2, fill, ex = '') => poly3(cam, [[x1, y, z1], [x2, y, z1], [x2, y, z2], [x1, y, z2]], fill, ex);

// ---------- people (small, from behind or in profile, acting with their pose; the people in use come at the key frames) ----------
// (x, y) = the feet's midpoint on the ground; h = height in px. pose: walk | stand | lean | raise | reach | toast | beanie
function person(x, y, h, opts = {}) {
  const {pose = 'walk', coat = V[3], dark = V[1], hair = V[2], skin = V[6], rim = null, dir = 1, scarf = V[8], hat = false} = opts;
  const u = h / 100; // 100 units tall
  const X = (v) => x + v * u * dir, Y = (v) => y - v * u;
  let s = '';
  // legs
  const step = pose === 'walk' ? 7 : 2.5;
  s += P(polyD([[X(-2.5), Y(44)], [X(-1), Y(44)], [X(-step + 1.5), Y(1.5)], [X(-step - 2.5), Y(0.5)]]), dark);
  s += P(polyD([[X(1), Y(44)], [X(3.5), Y(44)], [X(step + 2.5), Y(0.8)], [X(step - 1.5), Y(1.5)]]), dark);
  s += ell(X(-step - 1), Y(0.6), 3.4 * u, 1.6 * u, dark) + ell(X(step + 1), Y(0.6), 3.4 * u, 1.6 * u, dark);
  // coat: a long coat, flared a little at the hem (one flowing element: the hem)
  s += P(smoothD([[X(-9), Y(78)], [X(-10.5), Y(60)], [X(-12.5), Y(38)], [X(-11), Y(34.5)], [X(0), Y(33.5)], [X(12), Y(34.8)], [X(12.5), Y(39)], [X(10.5), Y(60)], [X(9), Y(78)], [X(0), Y(80.5)]], true), coat);
  // arms by pose
  const arm = (pts) => S(smoothD(pts, false), coat, 4.6 * u);
  if (pose === 'raise' || pose === 'toast') {
    s += arm([[X(8), Y(76)], [X(14), Y(70)], [X(17), Y(82)], [X(15), Y(93)]]);
    s += arm([[X(-8), Y(76)], [X(-10), Y(62)], [X(-9), Y(50)]]);
    s += ell(X(15), Y(94.5), 2.3 * u, 2.3 * u, skin);
  } else if (pose === 'reach') {
    s += arm([[X(8), Y(76)], [X(18), Y(78)], [X(27), Y(82)]]);
    s += arm([[X(-8), Y(76)], [X(-10), Y(62)], [X(-10), Y(50)]]);
    s += ell(X(28), Y(82.5), 2.1 * u, 2.1 * u, skin);
  } else if (pose === 'lean') {
    s += arm([[X(8), Y(76)], [X(14), Y(66)], [X(18), Y(58)]]);
    s += arm([[X(-8), Y(76)], [X(-13), Y(66)], [X(-16), Y(58)]]);
  } else if (pose === 'beanie') {
    s += arm([[X(8), Y(76)], [X(15), Y(80)], [X(17), Y(92)], [X(14), Y(101)]]);
    s += arm([[X(-8), Y(76)], [X(-10), Y(62)], [X(-9), Y(50)]]);
    s += P(blobD(X(14), Y(103), 4.2 * u, 3 * u, 7, 0.2), V[5]);
  } else if (pose === 'awe') {
    s += arm([[X(8), Y(76)], [X(13), Y(80)], [X(12), Y(92)], [X(6), Y(96)]]);
    s += arm([[X(-8), Y(76)], [X(-11), Y(62)], [X(-12), Y(52)]]);
  } else {
    const sw = pose === 'walk' ? 4 : 1;
    s += arm([[X(8), Y(76)], [X(10.5), Y(62)], [X(10 + sw), Y(50)]]);
    s += arm([[X(-8), Y(76)], [X(-10.5), Y(62)], [X(-10 - sw), Y(50)]]);
  }
  // scarf (its end lifting: the one flowing element) and the head
  s += P(polyD([[X(-6), Y(80)], [X(6), Y(80)], [X(5), Y(84.5)], [X(-5), Y(84.5)]]), scarf);
  s += P(smoothD([[X(4), Y(81)], [X(9), Y(75)], [X(12), Y(70)], [X(10), Y(69)], [X(6), Y(76)]], true), scarf);
  s += ell(X(0), Y(90.5), 5.8 * u, 7 * u, skin);
  if (hat) s += P(smoothD([[X(-6.4), Y(92)], [X(-5), Y(98.5)], [X(0), Y(100.5)], [X(5), Y(98.5)], [X(6.4), Y(92)]], true), V[6]);
  // hair: a clean bob with a little life at the ends (seen from behind it covers the head)
  s += P(smoothD([[X(-6.8), Y(84)], [X(-7.6), Y(91)], [X(-5.5), Y(97.5)], [X(0), Y(99.4)], [X(5.5), Y(97.5)], [X(7.6), Y(91)], [X(7.4), Y(84)], [X(5), Y(82.6)], [X(0), Y(84.2)], [X(-4.6), Y(82.6)]], true), hair);
  if (rim) s += S(smoothD([[X(-7.6), Y(91)], [X(-5.5), Y(97.5)], [X(0), Y(99.4)]], false), rim, 1.6 * u, 'opacity="0.9"') + S(smoothD([[X(-10.6), Y(60)], [X(-12.4), Y(39)]], false), rim, 1.3 * u, 'opacity="0.7"');
  return G(s);
}

// a small dog, side-on, nose down (life on the street)
function dog(x, y, h, col = V[2], dir = 1) {
  const u = h / 40, X = (v) => x + v * u * dir, Y = (v) => y - v * u;
  let s = '';
  s += P(smoothD([[X(-22), Y(24)], [X(-10), Y(30)], [X(10), Y(29)], [X(18), Y(26)], [X(26), Y(18)], [X(30), Y(10)], [X(25), Y(9)], [X(17), Y(16)], [X(8), Y(17)], [X(-12), Y(16)], [X(-22), Y(18)]], true), col);
  for (const lx of [-17, -11, 6, 11]) s += P(polyD([[X(lx), Y(18)], [X(lx + 3), Y(18)], [X(lx + 3), Y(0)], [X(lx), Y(0)]]), col);
  s += P(smoothD([[X(-21), Y(24)], [X(-28), Y(31)], [X(-30), Y(35)], [X(-25), Y(27)]], true), col);
  s += P(polyD([[X(20), Y(24)], [X(24), Y(31)], [X(26), Y(23)]]), col);
  return G(s);
}

// ---------- the machine's pieces ----------
// a giant computer seen front-on (screen space): a tall cabinet, its front a perforated door, rows of small lights
function rackFront(x, y, w, h, opts = {}) {
  const {body = V[1], door = V[2], lights = true, lightCol = '#dcecf2', density = 1, seedN = 1} = opts;
  let s = hrect(x, y, w, h, body, 1);
  s += hrect(x + w * 0.06, y + h * 0.03, w * 0.88, h * 0.94, door, 0.8);
  // the trays: faint horizontal joints
  const rows = Math.max(6, Math.round(h / 34));
  for (let i = 1; i < rows; i++) s += rect(x + w * 0.08, y + h * 0.03 + i * (h * 0.94 / rows), w * 0.84, Math.max(0.8, h * 0.004), V[3], 'opacity="0.8"');
  if (lights) {
    for (let i = 0; i < rows; i++) {
      const yy = y + h * 0.03 + (i + 0.5) * (h * 0.94 / rows);
      const nL = Math.max(2, Math.round(w / 24 * density));
      for (let j = 0; j < nL; j++) if (rnd() < 0.7) {
        const xx = x + w * 0.14 + (j / Math.max(1, nL - 1)) * w * 0.3 + rr(-1, 1);
        const r = Math.max(1, w * 0.012);
        s += ell(xx, yy, r, r, lightCol, `opacity="${f1(rr(0.5, 1))}"`);
      }
    }
  }
  return G(s);
}

// an electric jug kettle, boiling (screen space; (x, y) = its base centre; s = its height)
function kettle(x, y, s, opts = {}) {
  const {body = V[9], shade = V[7], dark = V[3], gauge = C.honey, steamOn = true, dir = 1} = opts;
  const u = s / 100, X = (v) => x + v * u * dir, Y = (v) => y - v * u;
  let g = '';
  g += P(polyD([[X(-34), Y(0)], [X(34), Y(0)], [X(32), Y(9)], [X(-32), Y(9)]], 0.4), dark); // base
  g += P(smoothD([[X(-31), Y(9)], [X(-27), Y(60)], [X(-22), Y(84)], [X(0), Y(90)], [X(20), Y(84)], [X(26), Y(60)], [X(31), Y(9)]], true), body);
  g += P(smoothD([[X(8), Y(9)], [X(13), Y(60)], [X(14), Y(84)], [X(20), Y(84)], [X(26), Y(60)], [X(31), Y(9)]], true), shade, 'opacity="0.8"');
  g += P(smoothD([[X(-22), Y(84)], [X(-14), Y(94)], [X(0), Y(97)], [X(14), Y(94)], [X(20), Y(84)], [X(0), Y(90)]], true), dark); // lid
  g += P(polyD([[X(-27), Y(58)], [X(-44), Y(80)], [X(-46), Y(77)], [X(-30), Y(44)]], 0.4), body); // spout
  g += S(smoothD([[X(26), Y(70)], [X(44), Y(66)], [X(46), Y(40)], [X(30), Y(26)]], false), dark, 6 * u); // handle
  g += P(polyD([[X(-6), Y(18)], [X(4), Y(18)], [X(5), Y(64)], [X(-5), Y(64)]], 0.3), gauge); // the water gauge: the heat inside
  if (steamOn) g += steam(X(-46), Y(82), 36 * u, 120 * u, {n: 4, col: '#eef0f3', op: 0.75, lean: -0.15 * dir});
  return G(g);
}

// a big roof fan (an ellipse in perspective), blades turning
function fan(cx, cy, rx, ry, opts = {}) {
  const {ring = V[2], inner = V[1], blade = V[6], warm = true} = opts;
  let s = ell(cx, cy + ry * 0.35, rx * 1.08, ry * 1.25, V[1]);  // the housing's side
  s += ell(cx, cy, rx * 1.08, ry * 1.08, ring);
  s += ell(cx, cy, rx * 0.94, ry * 0.94, inner);
  if (warm) s += ell(cx, cy, rx * 0.8, ry * 0.8, C.honey, 'opacity="0.35" filter="url(#b8)"');
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2 + 0.4;
    const p1 = [cx + Math.cos(a) * rx * 0.12, cy + Math.sin(a) * ry * 0.12];
    const p2 = [cx + Math.cos(a + 0.5) * rx * 0.86, cy + Math.sin(a + 0.5) * ry * 0.86];
    const p3 = [cx + Math.cos(a + 0.95) * rx * 0.8, cy + Math.sin(a + 0.95) * ry * 0.8];
    s += P(smoothD([p1, p2, p3], true), blade, 'opacity="0.85"');
  }
  s += ell(cx, cy, rx * 0.12, ry * 0.12, V[4]);
  return G(s);
}

// pencil: the plan's language (pale, dry, a little broken, never a ruler line); two passes
function pencil(pts, w = 3, opts = {}) {
  const {col = C.pencil, op = 0.9, dash = null, jit = 1.6} = opts;
  const d1 = lineD(pts, jit), d2 = lineD(pts.map((p) => [p[0] + rr(-1.5, 1.5), p[1] + rr(-1.5, 1.5)]), jit);
  const da = dash ? `stroke-dasharray="${dash}"` : '';
  return S(d1, col, w, `opacity="${op}" ${da}`) + S(d2, col, w * 0.55, `opacity="${op * 0.55}" ${da}`);
}

// a gloved hand holding a phone (POV, from the bottom left): (x, y) = the phone's centre, s = the phone's height
function phoneHand(x, y, s, opts = {}) {
  const {glove = V[3], gloveL = V[5], screen = '#cfe0e8', bubble = C.honeyL} = opts;
  const u = s / 100, X = (v) => x + v * u, Y = (v) => y + v * u;
  let g = '';
  // the forearm/cuff from the frame's bottom-left
  g += P(smoothD([[X(-150), Y(260)], [X(-70), Y(60)], [X(-20), Y(40)], [X(20), Y(70)], [X(-30), Y(300)]], true), V[2]);
  g += P(smoothD([[X(-72), Y(72)], [X(-24), Y(52)], [X(-10), Y(80)], [X(-56), Y(104)]], true), V[4]); // the cuff's knit
  // the phone
  g += P(polyD([[X(-30), Y(-52)], [X(30), Y(-50)], [X(32), Y(50)], [X(-28), Y(52)]], 0.4), V[0]);
  g += P(polyD([[X(-26), Y(-46)], [X(26), Y(-44)], [X(28), Y(45)], [X(-24), Y(47)]], 0.3), screen);
  g += rect(X(-26), Y(-60), 52 * u, 120 * u, screen, 'opacity="0.18" filter="url(#b14)"'); // the screen's cool spill
  // the chat: two grey bubbles and the new one, popping (the warm accent: your chat)
  g += P(polyD([[X(-20), Y(-36)], [X(8), Y(-36)], [X(8), Y(-26)], [X(-20), Y(-26)]], 0.3), V[10]);
  g += P(polyD([[X(-20), Y(-20)], [X(-2), Y(-20)], [X(-2), Y(-10)], [X(-20), Y(-10)]], 0.3), V[10]);
  g += P(smoothD([[X(-6), Y(-2)], [X(20), Y(-2)], [X(22), Y(4)], [X(22), Y(16)], [X(20), Y(20)], [X(-4), Y(20)], [X(-6), Y(14)]], true), bubble);
  g += P(polyD([[X(16), Y(19)], [X(24), Y(26)], [X(20), Y(18)]]), bubble);
  g += ell(X(4), Y(9), 2.2 * u, 2.2 * u, C.honeyD) + ell(X(9), Y(9), 2.2 * u, 2.2 * u, C.honeyD) + ell(X(14), Y(9), 2.2 * u, 2.2 * u, C.honeyD);
  // the gloved fingers round the phone
  g += P(smoothD([[X(-40), Y(10)], [X(-30), Y(-14)], [X(-22), Y(-8)], [X(-26), Y(30)], [X(-34), Y(54)], [X(-46), Y(44)]], true), glove);
  g += P(smoothD([[X(24), Y(30)], [X(38), Y(26)], [X(40), Y(40)], [X(26), Y(46)]], true), glove);
  g += P(smoothD([[X(26), Y(46)], [X(40), Y(42)], [X(41), Y(55)], [X(24), Y(60)]], true), glove);
  g += P(smoothD([[X(-30), Y(48)], [X(28), Y(54)], [X(30), Y(66)], [X(-24), Y(80)], [X(-50), Y(70)]], true), glove);
  g += S(smoothD([[X(-44), Y(40)], [X(-34), Y(12)]], false), gloveL, 2 * u, 'opacity="0.7"');
  return G(g);
}

// the page's last layers: a faint paper grain over everything but the band, kept very low
function finish() {
  return `<rect x="0" y="0" width="${W}" height="${H}" filter="url(#grain)" opacity="0.5"/>` +
    `<rect x="0" y="600" width="${W}" height="${H - 600}" filter="url(#mottle)"/>`;
}
function svgPage(inner, extraDefs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs(extraDefs)}${inner}${finish()}</svg>`;
}

// her in profile (facing +x when dir = 1): the film's one person near the camera. pose: sit-toast | stand-toast |
// stand-valve | stand. (x, y) = her feet (standing) or the stool's foot (seated); h = her standing height in px.
function personProfile(x, y, h, opts = {}) {
  const {pose = 'stand', dir = 1, coat = V[1], coatL = V[3], hair = V[0], skin = V[6], rim = null, mug = false, boot = V[0]} = opts;
  const u = h / 100, X = (v) => x + v * u * dir, Y = (v) => y - v * u;
  let s = '';
  const sit = pose.startsWith('sit');
  const hip = sit ? [0, 30] : [0, 50], sh = sit ? [2, 61] : [1.5, 80], head = sit ? [4.5, 70] : [3.5, 89.5];
  if (sit) {
    s += P(polyD([[X(-9), Y(28)], [X(9), Y(28)], [X(8), Y(25)], [X(-8), Y(25)]], 0.3), V[3]);           // the stool
    s += S(lineD([[X(-7), Y(25)], [X(-9), Y(0)]]), V[3], 2.2 * u) + S(lineD([[X(7), Y(25)], [X(9), Y(0)]]), V[3], 2.2 * u);
    s += P(smoothD([[X(-4), Y(36)], [X(14), Y(35)], [X(23), Y(33)], [X(24), Y(27)], [X(12), Y(26.5)], [X(-5), Y(27)]], true), coat); // thigh
    s += P(polyD([[X(19), Y(30)], [X(25), Y(30)], [X(26), Y(3)], [X(21), Y(3)]], 0.3), coat);          // shin
    s += P(smoothD([[X(20), Y(4)], [X(30), Y(3.5)], [X(31), Y(0)], [X(19.5), Y(0)]], true), boot);
  } else {
    s += P(polyD([[X(-3), Y(50)], [X(3), Y(50)], [X(4.5), Y(2)], [X(-0.5), Y(2)]], 0.3), coat);
    s += P(polyD([[X(-1), Y(48)], [X(4), Y(48)], [X(-3), Y(2)], [X(-7.5), Y(2)]], 0.3), coat);
    s += P(smoothD([[X(0), Y(3)], [X(9), Y(2.5)], [X(9.5), Y(0)], [X(-0.5), Y(0)]], true), boot) + P(smoothD([[X(-7.5), Y(3)], [X(1), Y(2.5)], [X(1.5), Y(0)], [X(-8), Y(0)]], true), boot);
    // the coat's hem, flared a little (the one flowing element)
    s += P(smoothD([[X(-6), Y(80)], [X(-8.5), Y(62)], [X(-10.5), Y(40)], [X(-3), Y(38)], [X(8), Y(39)], [X(8.5), Y(60)], [X(7), Y(80)]], true), coat);
  }
  // the torso (a knit or a coat), the scarf
  s += P(smoothD([[X(hip[0] - 7), Y(hip[1] + 2)], [X(sh[0] - 6), Y(sh[1] - 2)], [X(sh[0]), Y(sh[1] + 2)], [X(sh[0] + 6), Y(sh[1] - 3)], [X(hip[0] + 7), Y(hip[1] + 1)]], true), coat);
  s += P(smoothD([[X(sh[0] - 4), Y(sh[1] + 1)], [X(sh[0] + 4), Y(sh[1] + 1.5)], [X(sh[0] + 5), Y(sh[1] - 3)], [X(sh[0] - 4), Y(sh[1] - 3.5)]], true), V[9]);
  // the far arm (resting) and the near arm by pose
  const hx = sh[0] + 3, hy = sh[1] - 1;
  let hand = null;
  if (pose.endsWith('toast')) {
    s += S(smoothD([[X(hx), Y(hy)], [X(hx + 9), Y(hy + 3)], [X(hx + 15), Y(hy + 13)]], false), coatL, 3.6 * u);
    hand = [hx + 16, hy + 15];
  } else if (pose === 'stand-valve') {
    s += S(smoothD([[X(hx), Y(hy)], [X(hx + 9), Y(hy - 6)], [X(hx + 17), Y(hy - 8)]], false), coatL, 3.6 * u);
    hand = [hx + 18.5, hy - 8];
  } else {
    s += S(smoothD([[X(hx), Y(hy)], [X(hx + 2), Y(hy - 14)], [X(hx + 4), Y(hy - 26)]], false), coatL, 3.6 * u);
    hand = [hx + 4.5, hy - 27.5];
  }
  s += ell(X(hand[0]), Y(hand[1]), 1.9 * u, 1.9 * u, skin);
  // the head in profile: the face (a small nose, the lips a tone, an open eye looking ahead), the neck
  s += P(polyD([[X(head[0] - 2), Y(head[1] - 9)], [X(head[0] + 2), Y(head[1] - 9)], [X(head[0] + 2.5), Y(head[1] - 4)], [X(head[0] - 2), Y(head[1] - 4)]], 0.2), skin);
  s += P(smoothD([[X(head[0] - 5.5), Y(head[1] + 1)], [X(head[0] - 3), Y(head[1] + 6.5)], [X(head[0] + 2.5), Y(head[1] + 7)], [X(head[0] + 5.5), Y(head[1] + 3.5)], [X(head[0] + 6), Y(head[1] + 0.5)], [X(head[0] + 7.2), Y(head[1] - 1)], [X(head[0] + 6), Y(head[1] - 2)], [X(head[0] + 5.6), Y(head[1] - 4)], [X(head[0] + 4.4), Y(head[1] - 6)], [X(head[0] + 1), Y(head[1] - 6.6)], [X(head[0] - 3), Y(head[1] - 4)]], true), skin);
  s += ell(X(head[0] + 4.4), Y(head[1] + 1.3), 0.55 * u, 0.7 * u, V[0]);
  // the hair: a clean bob, the back full to the jaw, a soft fringe; a few ends lifting
  s += P(smoothD([[X(head[0] - 6.6), Y(head[1] - 5)], [X(head[0] - 7.4), Y(head[1] + 2)], [X(head[0] - 5), Y(head[1] + 7.6)], [X(head[0] + 1), Y(head[1] + 8.4)], [X(head[0] + 5.6), Y(head[1] + 6.2)], [X(head[0] + 5.2), Y(head[1] + 3.6)], [X(head[0] + 1.6), Y(head[1] + 4.6)], [X(head[0] - 0.6), Y(head[1] + 1)], [X(head[0] - 1.6), Y(head[1] - 5.4)], [X(head[0] - 4), Y(head[1] - 6.6)]], true), hair);
  if (rim) s += S(smoothD([[X(head[0] + 5.6), Y(head[1] + 6)], [X(head[0] + 6.1), Y(head[1] + 0.6)], [X(head[0] + 7.1), Y(head[1] - 1)]], false), rim, 0.8 * u, 'opacity="0.9"') + S(smoothD([[X(sh[0] + 6), Y(sh[1] - 3)], [X(hip[0] + 7.5), Y(hip[1] + 2)]], false), rim, 0.9 * u, 'opacity="0.75"');
  if (mug && hand) {
    const mx = X(hand[0] + 1.5), my = Y(hand[1] + 2.5), mw = 5.6 * u, mh = 6.4 * u;
    s += P(polyD([[mx - mw / 2, my - mh / 2], [mx + mw / 2, my - mh / 2], [mx + mw * 0.44, my + mh / 2], [mx - mw * 0.44, my + mh / 2]], 0.4), V[0]);
    s += S(smoothD([[mx + mw * 0.45 * dir, my - mh * 0.25], [mx + mw * 0.85 * dir, my - mh * 0.1], [mx + mw * 0.8 * dir, my + mh * 0.3], [mx + mw * 0.42 * dir, my + mh * 0.32]], false), V[0], 1.2 * u);
    s += ell(mx, my - mh / 2, mw * 0.46, mh * 0.1, C.honey);
    s += S(lineD([[mx + mw * 0.1, my - mh / 2], [mx + mw * 0.22, my + mh * 0.15]]), V[12], 0.4 * u) + hrect(mx + mw * 0.1, my + mh * 0.12, 1.8 * u, 2.2 * u, '#f2efe4', 0.3);
    s += steam(mx, my - mh * 0.6, 10 * u, 26 * u, {n: 5, warm: true, col: '#f3f4f6', op: 0.85, lean: 0.12 * dir, root: 0.3});
  }
  return G(s);
}

// sample a smooth (Catmull-Rom) path through pts into many points
function sampleSmooth(pts, per = 10) {
  const n = pts.length, out = [];
  const Pp = (i) => pts[clamp(i, 0, n - 1)];
  for (let i = 0; i < n - 1; i++) {
    const p0 = Pp(i - 1), p1 = Pp(i), p2 = Pp(i + 1), p3 = Pp(i + 2);
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  out.push(pts[n - 1]);
  return out;
}
// the heat's seam in screen space: the snow melted open over a warm pipe (wet dark slush, the warm showing through
// in a broken core, a lighter wet rim). w: half-width in px (a number, or [near, far] tapering along the path)
function meltSeam(pts, w, opts = {}) {
  const {per = 8, glow = true, core = true, rim = true} = opts;
  const q = sampleSmooth(pts, per), n = q.length;
  const wAt = (i) => Array.isArray(w) ? lerp(w[0], w[1], i / (n - 1)) : w;
  const jit = q.map(() => [1 + rr(-0.28, 0.28), 1 + rr(-0.28, 0.28)]);
  const band = (k, which = 1) => {
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = q[Math.max(0, i - 1)], b = q[Math.min(n - 1, i + 1)];
      let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const ln = Math.hypot(nx, ny) || 1; nx /= ln; ny /= ln;
      const ww = wAt(i) * k;
      L.push([q[i][0] + nx * ww * jit[i][0], q[i][1] + ny * ww * jit[i][0]]);
      R.push([q[i][0] - nx * ww * jit[i][1], q[i][1] - ny * ww * jit[i][1]]);
    }
    return smoothD(L.concat(R.reverse()), true);
  };
  let s = '';
  if (rim) s += P(band(1.55), V[10], 'opacity="0.45"');
  s += P(band(1.0), V[2]);
  if (glow) s += P(band(0.8), C.honey, 'opacity="0.38" filter="url(#b8)"');
  if (core) {
    s += P(band(0.34), C.honeyD, 'opacity="0.95"');
    s += P(band(0.14), C.honeyL);
    for (let i = 2; i < n - 2; i += 2) if (rnd() < 0.42) { const ww = wAt(i); s += P(blobD(q[i][0] + rr(-ww * 0.2, ww * 0.2), q[i][1] + rr(-ww * 0.2, ww * 0.2), ww * rr(0.25, 0.5), ww * rr(0.15, 0.3), 7, 0.3), V[2], 'opacity="0.92"'); }
  }
  return G(s);
}
