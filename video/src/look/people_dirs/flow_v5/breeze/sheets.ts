// FLOW v5, BREEZE: the sheets and the clip as pure SVG strings (the Remotion entry wraps them; dev.ts screenshots them).
//   sheetHer()     01_her.png      her in three views at 640 px on a sky of her colour family, at film size, filled black,
//                                  and beside references 02, 05, 06, 07 at one figure height
//   sheetCast()    02_cast.png     her and five more, each in a pose with weight, at one scale; together at film size
//   sheetMotion()  03_motion.png   eight frames of her walk into a headwind; eight frames from behind as a gust passes
//   sheetScene()   04_in_scene.png the cast at film size in our dusk still (P4Scene's plate and places), 2x crops, phone size
//   clipFrame(t)   motion.mp4      her walking in profile, large, the camera tracking her, two strangers behind
import {place} from './render';
import {breeze, WALK_T, type Look, type Pose} from './figure';
import {CAST, HER, STATURE, W2, W3, M1, M2, M3} from './cast';
import {REF_CROPS} from './refs';
import {PLATE_V6, PLATE_W, PLATE_H} from '../../hair_v2/plate';
import {lc} from './paint';
import type {Air} from './air';
import type {View} from './head';

const FONT = 'Inter, DejaVu Sans, sans-serif';
const K = {bg: '#2B2C41', panel: '#4A4D6A', film: '#3A3C54', ink: '#F3EEE8', sub: '#C2BDCE', dim: '#9590A8', light: '#EDE6E0'};
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const T = (x: number, y: number, text: string, o: {s?: number; w?: number; c?: string; a?: 'start' | 'middle' | 'end'} = {}) =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${o.s ?? 20}" font-weight="${o.w ?? 400}" fill="${o.c ?? K.sub}" text-anchor="${o.a ?? 'start'}">${esc(text)}</text>`;
let UIDN = 0;
const U = (p: string) => `${p}${UIDN++}`;

/** The breeze from the left, and a walker's headwind on top. */
export const AIR: Air = {dir: 1, base: 0.5};
export const WALK_AIR: Air = {dir: 1, base: 0.5, head: 0.16};
const airFor = (pose: Pose): Air => (pose.kind === 'walk' ? WALK_AIR : AIR);

/** One person, soles at (x, y), h px tall, in their own (or the given) view and pose. */
export function person(L: Look, x: number, y: number, h: number, o: {view?: View; pose?: Pose; t?: number; air?: Air; mono?: string; haze?: {c: string; k: number}; shadow?: boolean} = {}): string {
  const view = o.view ?? L.view ?? 'q';
  const pose = o.pose ?? L.pose ?? {kind: 'stand'};
  const parts = breeze(L, {view, pose, t: o.t ?? 0, air: o.air ?? airFor(pose), px: h});
  let s = place(parts, U('f'), x, y, h, {mono: o.mono, shadow: o.shadow});
  if (o.haze && !o.mono) s += place(parts, U('h'), x, y, h, {mono: o.haze.c, opacity: o.haze.k});
  return s;
}

/** A soft painted sky of her colour family (mauve to rose to peach), with a low warm glow on the key side. */
function sky(x: number, y: number, w: number, h: number): string {
  const id = U('sky');
  return (
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lc(62, 22, 338)}"/><stop offset="0.5" stop-color="${lc(74, 22, 18)}"/><stop offset="1" stop-color="${lc(86, 15, 55)}"/></linearGradient>` +
    `<radialGradient id="${id}g" cx="0.18" cy="0.72" r="0.55"><stop offset="0" stop-color="${lc(90, 18, 60)}" stop-opacity="0.55"/><stop offset="1" stop-color="${lc(90, 18, 60)}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${id}c" cx="0.75" cy="0.25" r="0.45"><stop offset="0" stop-color="${lc(70, 18, 320)}" stop-opacity="0.35"/><stop offset="1" stop-color="${lc(70, 18, 320)}" stop-opacity="0"/></radialGradient></defs>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="url(#${id})"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="url(#${id}g)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="url(#${id}c)"/>`
  );
}
/** A soft ground under a sky band: a warm plain fading to the horizon. */
function ground(x: number, y: number, w: number, h: number, horizon: number): string {
  const id = U('gr');
  const top = horizon - 40;
  const hh = y + h - top;
  const f = (v: number) => (Math.round(v * 1000) / 1000).toString();
  return (
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lc(74, 15, 22)}" stop-opacity="0"/><stop offset="${f(40 / hh)}" stop-color="${lc(74, 15, 22)}" stop-opacity="0.9"/><stop offset="${f(80 / hh)}" stop-color="${lc(72, 16, 25)}"/><stop offset="1" stop-color="${lc(60, 20, 30)}"/></linearGradient></defs>` +
    `<rect x="${x}" y="${top}" width="${w}" height="${hh}" fill="url(#${id})"/>`
  );
}
const clipRect = (x: number, y: number, w: number, h: number, inner: string) => {
  const id = U('cl');
  return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"/></clipPath></defs><g clip-path="url(#${id})">${inner}</g>`;
};
const svg = (W: number, H: number, inner: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${K.bg}"/>${inner}</svg>`;

const HER_VIEWS: [View, Pose, string, string][] = [
  ['q', {kind: 'stand'}, 'front 3/4, standing in the wind', 'the weight on one leg, the face into the air'],
  ['p', {kind: 'walk', phase: 0.12}, 'profile, walking into the wind', 'the front pressed onto the leading leg, the tail trailing'],
  ['b', {kind: 'stand'}, 'from behind', 'the hair over her back, the back panel a gentle flag'],
];

// ---------------------------------------------------------------- 01: her
export const HER_W = 2400;
export const HER_H = 1960;
export function sheetHer(): string {
  UIDN = 0;
  let s = T(30, 62, 'FLOW v5, BREEZE: her', {s: 40, w: 700, c: K.ink});
  s += T(32, 100, 'One shape in her one colour (the long coat, the breeze carrying its width downwind into a lifted tail), the hair one dark mass forking into a long lead ribbon; a breeze from the left. Large at 640 px, then film size.', {s: 20});
  // A: large
  let a = sky(30, 130, 2340, 760);
  HER_VIEWS.forEach(([v, pose], i) => {
    a += person(HER, 420 + i * 780, 850, 640, {view: v, pose});
  });
  s += clipRect(30, 130, 2340, 760, a);
  HER_VIEWS.forEach(([, , l1, l2], i) => {
    s += T(420 + i * 780, 924, l1, {s: 22, w: 600, c: K.ink, a: 'middle'});
    s += T(420 + i * 780, 952, l2, {s: 18, a: 'middle'});
  });
  // B: film size
  let b = sky(30, 980, 2340, 300);
  HER_VIEWS.forEach(([v, pose], i) => {
    b += person(HER, 260 + i * 150, 1250, 190, {view: v, pose});
    b += person(HER, 900 + i * 120, 1250, 150, {view: v, pose});
    b += person(HER, 1420 + i * 95, 1250, 120, {view: v, pose});
  });
  s += clipRect(30, 980, 2340, 300, b);
  s += T(1760, 1100, 'film size 1:1', {s: 22, w: 600, c: '#2B2C41'});
  s += T(1760, 1130, '190 px (the "you"), 150 px, 120 px tall', {s: 18, c: '#4A4D6A'});
  // C: filled black
  let c = `<rect x="30" y="1300" width="2340" height="250" rx="14" fill="${K.light}"/>`;
  HER_VIEWS.forEach(([v, pose], i) => {
    c += person(HER, 260 + i * 150, 1520, 190, {view: v, pose, mono: '#111'});
    c += person(HER, 900 + i * 120, 1520, 150, {view: v, pose, mono: '#111'});
    c += person(HER, 1420 + i * 95, 1520, 120, {view: v, pose, mono: '#111'});
  });
  s += c + T(1760, 1400, 'the same, filled black', {s: 22, w: 600, c: '#2B2C41'}) + T(1760, 1430, 'does each read at a glance as one shape?', {s: 18, c: '#4A4D6A'});
  // D: beside the references at one figure height
  const RH = 330;
  let d = '';
  let x = 30;
  REF_CROPS.forEach((r) => {
    const w = Math.round((r.w / r.h) * RH);
    d += `<image href="${r.src}" x="${x}" y="1580" width="${w}" height="${RH}" preserveAspectRatio="none"/>`;
    d += T(x, 1580 + RH + 28, r.label, {s: 16});
    x += w + 16;
  });
  const sx = x + 10;
  let e = sky(sx, 1580, 2370 - sx, RH);
  HER_VIEWS.forEach(([v, pose], i) => {
    e += person(HER, sx + 110 + i * 270, 1580 + RH - 6, RH - 12, {view: v, pose});
  });
  s += d + clipRect(sx, 1580, 2370 - sx, RH, e) + T(sx, 1580 + RH + 28, 'BREEZE her at the same figure height', {s: 16, c: K.ink});
  return svg(HER_W, HER_H, s);
}

// ---------------------------------------------------------------- 02: the cast
const CAST_LABEL: Record<string, [string, string, string]> = {
  her: ['her: the long coat', 'woman, 168 cm, long hair', 'standing in the wind'],
  w2: ['the big shirt, half-tucked', 'woman, soft, 164 cm, coily hair', 'wide trousers, a hand on her hip'],
  w3: ['the cropped knit, the bias skirt', 'woman, slim, 160 cm', 'the calm bun, from behind'],
  m1: ['the overcoat, a dark column', 'man, athletic, 184 cm, a short crop', 'walking into the wind'],
  m2: ['the big short-sleeved shirt', 'man, slim, 178 cm, swept back', 'a hand in a pocket'],
  m3: ['the boxy chore jacket', 'man, broad, 186 cm, a fade', 'standing in profile'],
};
export const CAST_W = 2400;
export const CAST_H = 1800;
export function sheetCast(): string {
  UIDN = 0;
  let s = T(30, 62, 'FLOW v5, BREEZE: the cast', {s: 40, w: 700, c: K.ink});
  s += T(32, 100, 'Her and five more at one scale (3.7 px a cm). Each one garment shape (or a top and a bottom), one calmer related colour, hair and legs the dark accent; skin across the range.', {s: 20});
  let a = sky(30, 130, 2340, 820);
  CAST.forEach((L, i) => {
    const h = Math.round(STATURE[L.id] * 3.72);
    a += person(L, 200 + i * 392, 910, h);
  });
  s += clipRect(30, 130, 2340, 820, a);
  CAST.forEach((L, i) => {
    const [l1, l2, l3] = CAST_LABEL[L.id];
    s += T(200 + i * 392, 980, l1, {s: 21, w: 600, c: K.ink, a: 'middle'});
    s += T(200 + i * 392, 1006, l2, {s: 16, a: 'middle'});
    s += T(200 + i * 392, 1027, l3, {s: 16, a: 'middle'});
  });
  // together at film size on one soft ground
  const gy = 1052;
  let b = sky(30, gy, 2340, 470) + ground(30, gy, 2340, 470, gy + 250);
  const px = (cm: number, depth: number) => Math.round(cm * 1.12 * depth);
  const group: [Look, number, number, number, View?, Pose?][] = [
    [M1, 1290, gy + 330, 0.86, 'p', {kind: 'walk', phase: 0.3}],
    [W3, 1660, gy + 336, 0.88],
    [M3, 820, gy + 344, 0.92],
    [W2, 1020, gy + 420, 1.0],
    [M2, 1150, gy + 430, 1.02],
    [HER, 1480, gy + 446, 1.06, 'q', {kind: 'stand'}],
  ];
  group.forEach(([L, x, y, k, v, pose]) => {
    b += person(L, x, y, px(STATURE[L.id], k), {view: v, pose, haze: {c: lc(80, 14, 20), k: (1.06 - k) * 0.9}});
  });
  s += clipRect(30, gy, 2340, 470, b);
  s += T(60, gy + 50, 'together at film size, one breeze from the left', {s: 22, w: 600, c: '#2B2C41'});
  s += T(60, gy + 78, 'the nearest 190 px tall, the farthest 158 px', {s: 18, c: '#4A4D6A'});
  // filled black at film size
  let c = `<rect x="30" y="1540" width="2340" height="230" rx="14" fill="${K.light}"/>`;
  CAST.forEach((L, i) => {
    c += person(L, 640 + i * 150, 1750, Math.round(STATURE[L.id] * 1.05), {mono: '#111'});
  });
  s += c + T(60, 1600, 'the same six, filled black at film size', {s: 22, w: 600, c: '#2B2C41'}) + T(60, 1630, 'one shape each, told apart by silhouette alone?', {s: 18, c: '#4A4D6A'});
  return svg(CAST_W, CAST_H, s);
}

// ---------------------------------------------------------------- 03: her motion
const WALK_NAMES = ['contact', 'down', 'passing', 'up', 'contact', 'down', 'passing', 'up'];
export const MOTION_W = 2400;
export const MOTION_H = 1180;
export const GUST: Air = {dir: 1, base: 0.5, gusts: [{t: 0.5, dur: 2.4, amp: 0.5}]};
export const GUST_TIMES = [0.2, 0.55, 0.85, 1.15, 1.5, 1.9, 2.35, 2.9];
export function sheetMotion(): string {
  UIDN = 0;
  let s = T(30, 62, 'FLOW v5, BREEZE: her motion', {s: 40, w: 700, c: K.ink});
  s += T(32, 100, 'Top: one walk cycle (1.10 s) into a headwind, the camera tracking her: the front pressed onto the leading leg, the tail trailing the stride, a flick running along the hem. Bottom: from behind as a gust passes: the hair and the coat rise and settle.', {s: 20});
  let a = sky(30, 130, 2340, 470);
  for (let i = 0; i < 8; i++) {
    const t = 3 * WALK_T + (i / 8) * WALK_T;
    a += person(HER, 170 + i * 292, 570, 420, {view: 'p', pose: {kind: 'walk', phase: t / WALK_T}, t, air: WALK_AIR});
  }
  s += clipRect(30, 130, 2340, 470, a);
  for (let i = 0; i < 8; i++) {
    const t = 3 * WALK_T + (i / 8) * WALK_T;
    s += T(150 + i * 292, 628, `${WALK_NAMES[i]} (${i < 4 ? 'near' : 'far'} foot)  ${t.toFixed(2)} s`, {s: 16, a: 'middle'});
  }
  let b = sky(30, 660, 2340, 470);
  GUST_TIMES.forEach((t, i) => {
    b += person(HER, 150 + i * 292, 1100, 420, {view: 'b', pose: {kind: 'stand'}, t, air: GUST});
  });
  s += clipRect(30, 660, 2340, 470, b);
  GUST_TIMES.forEach((t, i) => {
    s += T(150 + i * 292, 1158, `${t.toFixed(2)} s  air ${(Math.round(100 * (0.5 + 0.5 * gustEnv(t))) / 100).toFixed(2)}`, {s: 16, a: 'middle'});
  });
  return svg(MOTION_W, MOTION_H, s);
}
const gustEnv = (t: number) => {
  const u = (t - 0.5) / 2.4;
  if (u <= 0 || u >= 1) return 0;
  const sm = (a: number, b: number, x: number) => {
    const k = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return k * k * (3 - 2 * k);
  };
  return u < 0.32 ? sm(0, 0.32, u) : 1 - sm(0.32, 1, u);
};

// ---------------------------------------------------------------- 04: in the dusk still (P4Scene's plate and places)
export const SCENE_W = 2240;
export const SCENE_H = 2080;
/** P4Scene's places (hair_v4/SheetsFinal.tsx), each given one of our cast; heights from the stature and the depth (the
 *  quay ~0.93 px a cm, the promenade ~1.2). */
type Placed = {L: Look; x: number; y: number; h: number; view?: View; pose?: Pose; haze: number};
const SCENE_PLACES: Placed[] = [
  {L: M3, x: 222, y: 1074, h: Math.round(186 * 0.93), haze: 0.16},
  {L: W3, x: 432, y: 1080, h: Math.round(160 * 0.93), haze: 0.16},
  {L: M2, x: 372, y: 1388, h: Math.round(178 * 1.17), haze: 0.04},
  {L: W2, x: 548, y: 1402, h: Math.round(164 * 1.19), haze: 0.03},
  {L: M1, x: 856, y: 1400, h: Math.round(184 * 1.2), view: 'p', pose: {kind: 'walk', phase: 0.3}, haze: 0.03},
  {L: HER, x: 684, y: 1083, h: 156, view: 'p', pose: {kind: 'walk', phase: 0.12}, haze: 0.1},
];
export function sceneFigures(): string {
  return SCENE_PLACES.slice()
    .sort((a, b) => a.y - b.y)
    .map((p) => person(p.L, p.x, p.y, p.h, {view: p.view, pose: p.pose, haze: {c: lc(82, 12, 330), k: p.haze}}))
    .join('');
}
export function sheetScene(): string {
  UIDN = 0;
  const figs = sceneFigures();
  const plate = `<image href="${PLATE_V6}" x="0" y="0" width="${PLATE_W}" height="${PLATE_H}"/>`;
  let s = T(30, 60, 'FLOW v5, BREEZE: the cast in our dusk still', {s: 40, w: 700, c: K.ink});
  s += T(32, 98, 'The painted still v6 at dusk with P4Scene\'s places: her (156 px, walking, on the quay) and five strangers, one breeze from the left (the walkers feel their own headwind). Left: the frame 1:1.', {s: 20});
  s += `<svg x="30" y="130" width="${PLATE_W}" height="${PLATE_H}" viewBox="0 0 ${PLATE_W} ${PLATE_H}">${plate}${figs}</svg>`;
  const crops = [
    {x: 160, y: 890, w: 560, h: 220, label: 'the quay, 2x: her (156 px, walking into the wind) and two strangers'},
    {x: 320, y: 1160, w: 560, h: 270, label: 'the promenade, 2x: three strangers, 195-221 px'},
  ];
  crops.forEach((c, i) => {
    const sc = 1060 / 1120;
    const y = i === 0 ? 130 : 130 + 2 * crops[0].h * sc + 70;
    s += `<svg x="1150" y="${y}" width="${c.w * 2 * sc}" height="${c.h * 2 * sc}" viewBox="${c.x} ${c.y} ${c.w} ${c.h}">${plate}${figs}</svg>`;
    s += T(1150, y + c.h * 2 * sc + 26, c.label, {s: 19});
  });
  s += `<svg x="1150" y="1290" width="360" height="640" viewBox="0 0 ${PLATE_W} ${PLATE_H}">${plate}${figs}</svg>`;
  s += T(1530, 1320, 'At phone size', {s: 22, w: 600, c: K.ink});
  s += T(1530, 1350, 'the frame 1080 px wide shown 360 px', {s: 18});
  s += T(1530, 1376, 'wide (a phone held at arm\'s length)', {s: 18});
  ['Look at: does each person read at a', 'glance as one flowing shape, the hair', 'and the hems swept one way? Do they', 'belong in the scene\'s light?'].forEach((l, i) => {
    s += T(1530, 1430 + i * 26, l, {s: 19, c: K.ink});
  });
  return svg(SCENE_W, SCENE_H, s);
}

// ---------------------------------------------------------------- the clip: her walk, tracked
export const CLIP_W = 1080;
export const CLIP_H = 1920;
export const CLIP_SECONDS = 4;
/** Her ground speed (figure units a second): the planted foot slides back (138 + 148) units over the stance's 62 %. */
const GROUND_V = (138 + 148) / (0.62 * WALK_T);
const CLIP_AIR: Air = {dir: 1, base: 0.5, head: 0.16, gusts: [{t: 1.6, dur: 2.2, amp: 0.22}]};
const M1_T = 1.0;
/** One frame of the clip at time t (s). */
export function clipFrame(t: number): string {
  UIDN = 0;
  const W = CLIP_W;
  const H = CLIP_H;
  const herH = 1060;
  const herY = 1560;
  const herX = 640;
  const k = herH / 1000;
  // the camera tracks her: the near ground scrolls at her ground speed, the far ground slower (parallax)
  const vNear = GROUND_V * k;
  const farK = 0.36;
  const vFar = vNear * farK;
  const skyId = 'csky';
  let s = `<defs><linearGradient id="${skyId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lc(58, 22, 335)}"/><stop offset="0.45" stop-color="${lc(72, 22, 15)}"/><stop offset="0.72" stop-color="${lc(84, 16, 50)}"/><stop offset="1" stop-color="${lc(84, 16, 50)}"/></linearGradient>`;
  s += `<radialGradient id="cglow" cx="0.2" cy="0.66" r="0.6"><stop offset="0" stop-color="${lc(92, 16, 62)}" stop-opacity="0.6"/><stop offset="1" stop-color="${lc(92, 16, 62)}" stop-opacity="0"/></radialGradient>`;
  s += `<linearGradient id="cfar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lc(70, 16, 18)}"/><stop offset="1" stop-color="${lc(66, 18, 22)}"/></linearGradient>`;
  s += `<linearGradient id="cnear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lc(56, 22, 28)}"/><stop offset="1" stop-color="${lc(42, 22, 24)}"/></linearGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#${skyId})"/><rect width="${W}" height="${H}" fill="url(#cglow)"/>`;
  // a far soft ridge
  s += `<path d="M0 ${1210}C240 1180 420 1196 620 1170S960 1150 ${W} 1176V${H}H0Z" fill="${lc(76, 14, 10)}" opacity="0.8"/>`;
  // the far ground band where the strangers are
  const farY = 1250;
  s += `<rect x="0" y="${farY - 62}" width="${W}" height="${H - farY + 62}" fill="url(#cfar)"/>`;
  // far marks (small tufts), scrolling with the far ground
  for (let i = -2; i < 14; i++) {
    const x = ((i * 97 + vFar * t) % (W + 200)) - 100;
    const y = farY - 8 + ((i * 37) % 23);
    s += `<path d="M${x.toFixed(1)} ${y}l6 -16l4 16l5 -11l3 11z" fill="${lc(58, 16, 20)}" opacity="0.7"/>`;
  }
  // the two strangers behind, at two depths (each drifts with the ground at its own depth: parallax): W3 farther,
  // standing, so she drifts back; M1 nearer, walking the same way a little slower than the camera
  const w3H = 250;
  const w3X = -40 + vNear * (w3H / herH) * t;
  const m1H = 420;
  const m1Walk = GROUND_V * (m1H / 1000) * (WALK_T / M1_T);
  const m1X = 230 + (vNear * (m1H / herH) - m1Walk) * t;
  const haze = lc(82, 12, 330);
  s += person(W3, w3X, farY - 40, w3H, {view: 'b', pose: {kind: 'stand'}, t, air: {dir: 1, base: 0.5, gusts: CLIP_AIR.gusts}, haze: {c: haze, k: 0.3}});
  s += person(M1, m1X, farY + 36, m1H, {view: 'p', pose: {kind: 'walk', phase: t / M1_T + 0.3}, t, air: WALK_AIR, haze: {c: haze, k: 0.18}});
  // the near ground: her path
  const nearY = herY - 40;
  s += `<path d="M0 ${nearY}C300 ${nearY - 14} 700 ${nearY - 10} ${W} ${nearY - 20}V${H}H0Z" fill="url(#cnear)"/>`;
  // near marks: grass tufts and pebbles scrolling at her ground speed (the planted foot never slides)
  for (let i = -2; i < 9; i++) {
    const x = ((i * 173 + vNear * t) % (W + 400)) - 200;
    const y = nearY + 70 + ((i * 53) % 60);
    s += `<path d="M${x.toFixed(1)} ${y}l10 -34l6 34l9 -24l5 24z" fill="${lc(40, 20, 22)}" opacity="0.85"/>`;
    const px = ((i * 211 + 90 + vNear * t) % (W + 400)) - 200;
    s += `<ellipse cx="${px.toFixed(1)}" cy="${nearY + 250 + ((i * 41) % 90)}" rx="${14 + (i % 3) * 5}" ry="5" fill="${lc(36, 18, 22)}" opacity="0.6"/>`;
  }
  // her, large, walking into the wind
  s += person(HER, herX, herY, herH, {view: 'p', pose: {kind: 'walk', phase: t / WALK_T}, t, air: CLIP_AIR});
  return svg(W, H, s).replace(`<rect width="${W}" height="${H}" fill="${K.bg}"/>`, '');
}
