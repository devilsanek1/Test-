// FLOW v5, GUST: the stills and the clip as SVG strings (the Remotion compositions in Sheets.tsx draw them; a fast
// dev loop can too). Each sheet is built for one question, feeling first: is she light, graceful and alive, carried
// by the wind; does she read at a glance at phone size; does she belong with the references?
//   herSheet     01_her.png      her in three views, large, on a sky of her colour family; film size; filled black
//   castSheet    02_cast.png     her and five strangers in a pose with weight; together at film size on one ground
//   motionSheet  03_motion.png   eight frames of her walk into a headwind; eight frames from behind as a gust passes
//   clipFrame    motion.mp4      4 s, her walking in profile, large, the camera tracking her, two strangers behind
//   sceneSheet   04_in_scene.png the cast at film size in the dusk still (P4Scene's plate and places), 2x crops, phone
import {figure, type Look} from './figure';
import {place, castShadow} from './paint';
import {type Wind, breeze, gusty} from './air';
import {HER, NIA, ROSA, THEO, KOFI, JUN} from './cast';
import type {View, Pose} from './body';

const FONT = 'Inter, DejaVu Sans, sans-serif';
export const C = {bg: '#2B2C41', panel: '#3A3C54', ink: '#F3EEE8', sub: '#C9C3D6', dim: '#9993AC'};
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const T = (x: number, y: number, t: string, o: {s?: number; w?: number; c?: string; a?: 'start' | 'middle' | 'end'} = {}) =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${o.s ?? 20}" font-weight="${o.w ?? 400}" fill="${o.c ?? C.sub}" text-anchor="${o.a ?? 'start'}">${esc(t)}</text>`;

let UID = 0;
const uid = (p: string) => `${p}${++UID}`;
type Fig = {look: Look; view: View; pose: Pose; x: number; y: number; h: number; t?: number; wind: Wind; mono?: string; shadow?: {color: string; opacity: number}; noGround?: boolean};
export function fig(f: Fig): string {
  const parts = figure(f.look, f.view, f.pose, {t: f.t ?? 0, wind: f.wind, px: f.h, shadow: f.shadow});
  return place(parts, uid('f'), f.x, f.y, f.h, {mono: f.mono, noGround: f.noGround});
}

/** A soft painted sky of her colour family (violet above, rose, a peach glow low), with two soft cloud banks. */
function sky(id: string, x: number, y: number, w: number, h: number, o: {top?: string; mid?: string; low?: string} = {}): string {
  return (
    `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.top ?? '#6F5B93'}"/><stop offset="0.55" stop-color="${o.mid ?? '#D490A3'}"/><stop offset="1" stop-color="${o.low ?? '#F3C9B4'}"/></linearGradient>` +
    `<radialGradient id="${id}r" cx="0.25" cy="0.72" r="0.6"><stop offset="0" stop-color="#FFE3CC" stop-opacity="0.55"/><stop offset="1" stop-color="#FFE3CC" stop-opacity="0"/></radialGradient>` +
    `<filter id="${id}b" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="${Math.round(h / 30)}"/></filter><clipPath id="${id}c"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"/></clipPath></defs>` +
    `<g clip-path="url(#${id}c)"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}g)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}r)"/>` +
    `<g filter="url(#${id}b)" opacity="0.45"><ellipse cx="${x + w * 0.72}" cy="${y + h * 0.18}" rx="${w * 0.3}" ry="${h * 0.07}" fill="#B98BB0"/><ellipse cx="${x + w * 0.2}" cy="${y + h * 0.34}" rx="${w * 0.22}" ry="${h * 0.045}" fill="#E8A9B0"/></g></g>`
  );
}

// ================================================================ 01: her
export const HER_W = 2400;
export const HER_H = 1500;
const STEADY = (k: string) => breeze(`steady-${k}`, 1, 0, 0.0);
const WALK_PERIOD = 1.1;
export function herSheet(): string {
  UID = 0;
  const w = STEADY('her');
  const views: [View, Pose, string, string][] = [
    ['q', {kind: 'stand'}, 'front 3/4, standing in the wind', 'her head turned to the wind, the profile edge, one small eye'],
    ['p', {kind: 'walk', ph: 0.1, period: WALK_PERIOD}, 'profile, walking into it', 'the wind presses the front to the leg; the back hem streams in points'],
    ['b', {kind: 'stand'}, 'from behind (the references’ favourite view)', 'the windward half hangs; the coat’s own back half flies as one flag'],
  ];
  let s = `<rect width="${HER_W}" height="${HER_H}" fill="${C.bg}"/>`;
  s += T(40, 62, 'FLOW v5 · GUST: her, carried by the wind', {s: 40, w: 800, c: C.ink});
  s += T(42, 100, 'One long open coat to the shin in her one colour: the windward side hangs, the coat’s own back half flies as ONE pointed flag in its shade; the hair leaves as one mass and parts into three ribbons and a wisp; the body calm, the edges alive.', {s: 20});
  s += sky('sk1', 30, 126, HER_W - 60, 1010);
  const X = [380, 1110, 1780];
  views.forEach(([v, pose, lab, sub], i) => {
    s += fig({look: HER, view: v, pose, x: X[i], y: 836, h: 640, wind: w, shadow: {color: '#5a2f48', opacity: 0.3}});
    s += T(X[i] - 160, 884, lab, {s: 22, w: 700, c: '#3b2340'});
    s += T(X[i] - 160, 912, sub, {s: 18, c: '#4d3552'});
  });
  // film size, in the sky's low band
  views.forEach(([v, pose], i) => {
    s += fig({look: HER, view: v, pose, x: 150 + i * 300, y: 1090, h: 170, wind: w, shadow: {color: '#5a2f48', opacity: 0.3}});
  });
  s += T(60, 1118, 'film size 1:1 (170 px tall: the “you” in a frame)', {s: 18, w: 700, c: '#3b2340'});
  views.forEach(([v, pose], i) => {
    s += fig({look: HER, view: v, pose, x: 1100 + i * 250, y: 1090, h: 130, wind: w, shadow: {color: '#5a2f48', opacity: 0.3}});
  });
  s += T(1030, 1118, 'and smaller (130 px: a stranger’s size)', {s: 18, w: 700, c: '#3b2340'});
  // filled black at film size
  s += `<rect x="30" y="1150" width="${HER_W - 60}" height="290" rx="14" fill="#E9E3DC"/>`;
  s += T(60, 1180, 'the same at film size, filled black: does each read as one clear shape?', {s: 18, w: 700, c: '#2B2C41'});
  views.forEach(([v, pose], i) => {
    s += fig({look: HER, view: v, pose, x: 150 + i * 300, y: 1400, h: 170, wind: w, mono: '#111'});
    s += fig({look: HER, view: v, pose, x: 1100 + i * 250, y: 1400, h: 130, wind: w, mono: '#111'});
  });
  s += T(42, 1474, 'Look at: is she light, graceful, alive, carried by the wind? Simpler and flowier than v4 (no kit of parts, no tailoring), and one of the references’ family (02, 05, 06, 07)?', {s: 19, c: C.ink});
  return s;
}

// ================================================================ 02: the cast
export const CAST_W = 2600;
export const CAST_H = 1560;
type Who = {look: Look; view: View; pose: Pose; name: string; line: string};
export const WHO: Who[] = [
  {look: HER, view: 'q', pose: {kind: 'stand'}, name: 'her', line: 'the long open coat · 168 cm'},
  {look: NIA, view: 'b', pose: {kind: 'stand'}, name: 'the belted trench', line: 'a low knot (the calm cut) · 175 cm'},
  {look: ROSA, view: 'q', pose: {kind: 'stand'}, name: 'the bias skirt, a cropped knit', line: 'a lob blown back, one acting arm · 160 cm'},
  {look: THEO, view: 'p', pose: {kind: 'walk', ph: 0.12, period: 1.2}, name: 'the long overcoat', line: 'a short cut swept back · 188 cm'},
  {look: KOFI, view: 'q', pose: {kind: 'stand'}, name: 'the big open shirt', line: 'a dark tee, wide trousers, a close crop · 182 cm'},
  {look: JUN, view: 'q', pose: {kind: 'stand'}, name: 'the chore jacket', line: 'a dark tee, wide trousers · 176 cm'},
];
export function castSheet(): string {
  UID = 0;
  const w = STEADY('cast');
  let s = `<rect width="${CAST_W}" height="${CAST_H}" fill="${C.bg}"/>`;
  s += T(40, 62, 'FLOW v5 · GUST: the cast', {s: 40, w: 800, c: C.ink});
  s += T(42, 100, 'Each person is ONE long outer piece that is the figure: her the one saturated colour, the strangers each one calmer related colour; hair and legs the dark accent. One wind, one scale (3.6 px per cm).', {s: 20});
  s += sky('sk2', 30, 126, CAST_W - 60, 900, {top: '#7A6A9A', mid: '#D3A0AE', low: '#EFCDBA'});
  WHO.forEach((p, i) => {
    const h = p.look.stature * 3.6;
    // her coat's flag needs room downwind: she stands a little further left
    const x = i === 0 ? 180 : 210 + i * 405;
    s += fig({look: p.look, view: p.view, pose: p.pose, x, y: 880, h, wind: w, shadow: {color: '#5a3448', opacity: 0.3}});
    s += T(Math.max(46, x - 150), 930, p.name, {s: 21, w: 700, c: '#3b2340'});
    s += T(Math.max(46, x - 150), 958, p.line, {s: 17, c: '#4d3552'});
  });
  // together at film size on one soft ground
  s += `<defs><linearGradient id="gr2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C99AA8"/><stop offset="0.45" stop-color="#E5BDB0"/><stop offset="1" stop-color="#E9C9B8"/></linearGradient></defs>`;
  s += `<rect x="30" y="1046" width="${CAST_W - 60}" height="440" rx="14" fill="url(#gr2)"/>`;
  s += `<rect x="30" y="1046" width="${CAST_W - 60}" height="210" rx="14" fill="#B993B5" opacity="0.55"/>`;
  s += T(60, 1082, 'together at film size, 1:1 (about 1 px per cm, her 170 px): six shapes that read at a glance, one family', {s: 18, w: 700, c: '#2B2C41'});
  const group: [number, number, number][] = [
    [3, 760, 1360],
    [1, 1010, 1372],
    [0, 1230, 1400],
    [2, 1450, 1386],
    [4, 1680, 1366],
    [5, 1890, 1394],
  ];
  group
    .slice()
    .sort((a, b) => a[2] - b[2])
    .forEach(([i, x, y]) => {
      const p = WHO[i];
      const h = p.look.stature * (0.98 + (y - 1360) * 0.002);
      s += fig({look: p.look, view: p.view, pose: p.pose, x, y, h, wind: w, shadow: {color: '#6a3c4a', opacity: 0.35}});
    });
  s += T(42, 1530, 'Look at: varied builds, heights, skin and cuts, women feminine and men manly, today’s clothes translated (no capes, no hats); does each read filled at film size?', {s: 19, c: C.ink});
  return s;
}

// ================================================================ 03: her motion
export const MOTION_W = 2600;
export const MOTION_H = 1330;
export const WALK_WIND: Wind = breeze('walk', 1.1, 0, 0.08);
export const GUST_WIND: Wind = gusty('gust', 0.5, 0.95, 0.25, 0.45, 1.1);
export const GUST_T = [0, 0.3, 0.5, 0.7, 0.9, 1.2, 1.6, 2.2];
export function motionSheet(): string {
  UID = 0;
  let s = `<rect width="${MOTION_W}" height="${MOTION_H}" fill="${C.bg}"/>`;
  s += T(40, 62, 'FLOW v5 · GUST: her motion', {s: 40, w: 800, c: C.ink});
  s += T(42, 100, 'The body calm, the edges alive: the hair and the hems feel the wind late and slower toward the tips (a gust travels down a ribbon), overshoot a touch and settle; nothing jitters.', {s: 20});
  const FH = 430;
  s += sky('sk3a', 30, 126, MOTION_W - 60, 560, {top: '#7A6A9A', mid: '#D49AAA', low: '#EFC9B6'});
  s += T(54, 160, 'walking in profile into a headwind: one stride cycle (1.1 s), eight frames', {s: 21, w: 700, c: '#3b2340'});
  const cell = (i: number, y0: number, h: number, inner: string) => {
    const x0 = 42 + i * 316;
    return `<svg x="${x0}" y="${y0}" width="304" height="${h}" viewBox="${x0} ${y0} 304 ${h}" overflow="hidden"><rect x="${x0}" y="${y0}" width="304" height="${h}" fill="#ffffff" opacity="0.06"/>${inner}</svg>`;
  };
  for (let i = 0; i < 8; i++) {
    const t = 2 + (i * WALK_PERIOD) / 8;
    const x = 150 + i * 316;
    s += cell(i, 176, 500, fig({look: HER, view: 'p', pose: {kind: 'walk', ph: t / WALK_PERIOD, period: WALK_PERIOD}, x, y: 640, h: FH, t, wind: WALK_WIND, shadow: {color: '#5a2f48', opacity: 0.3}}));
    s += T(x - 90, 672, `f ${Math.round(t * 60)} · ${t.toFixed(2)} s`, {s: 16, c: '#4d3552'});
  }
  s += sky('sk3b', 30, 706, MOTION_W - 60, 560, {top: '#7A6A9A', mid: '#D49AAA', low: '#EFC9B6'});
  s += T(54, 740, 'from behind as a gust passes: the hair and the coat’s back half rise, stream and settle (the wind’s strength under each)', {s: 21, w: 700, c: '#3b2340'});
  // a little smaller than the walk, so the coat's flying back half and the hair stay inside each frame
  GUST_T.forEach((t, i) => {
    const x = 108 + i * 316;
    s += cell(i, 756, 500, fig({look: HER, view: 'b', pose: {kind: 'stand'}, x, y: 1220, h: 400, t, wind: GUST_WIND, shadow: {color: '#5a2f48', opacity: 0.3}}));
    s += T(x - 56, 1252, `f ${Math.round(t * 60)} · ${t.toFixed(2)} s · wind ${GUST_WIND.s(t).toFixed(2)}`, {s: 16, c: '#4d3552'});
  });
  s += T(42, 1306, 'Look at: one wind drives everything that can move; the body stays upright and calm; the wind presses the coat’s front to the leading leg, the back hem streams; a gust lifts, overshoots a little, settles.', {s: 19, c: C.ink});
  return s;
}

// ================================================================ the clip: her walking, the camera tracking her
export const CLIP_W = 1080;
export const CLIP_H = 1920;
export const CLIP_FRAMES = 240;
const CLIP_WIND: Wind = (() => {
  const g = gusty('clip', 1.02, 0.32, 1.7, 0.6, 1.4);
  return g;
})();
const HER_H_PX = 950;
const HER_X = 410;
const GROUND = 1660;
export function clipFrame(t: number): string {
  UID = 0;
  // her ground speed (figure units/s) -> px/s at her size: the world slides right under her
  const herSpeed = ((166 + 180) / (0.62 * WALK_PERIOD)) * (HER_H_PX / 1000);
  const shift = (k: number, x0: number, span: number) => {
    // a layer at depth scale k: its features move right at k x her speed, wrapping over `span`
    const x = x0 + herSpeed * k * t;
    return ((((x + 200) % span) + span) % span) - 200;
  };
  let s = '';
  // the sky of her colour family, deeper above
  s += `<defs><linearGradient id="csky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E4C86"/><stop offset="0.42" stop-color="#B6809F"/><stop offset="0.66" stop-color="#E8A9A7"/><stop offset="0.74" stop-color="#F6CBB2"/></linearGradient>`;
  s += `<radialGradient id="csun" cx="0.18" cy="0.7" r="0.5"><stop offset="0" stop-color="#FFE6CF" stop-opacity="0.75"/><stop offset="1" stop-color="#FFE6CF" stop-opacity="0"/></radialGradient>`;
  s += `<linearGradient id="cgnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C98E9A"/><stop offset="0.35" stop-color="#B07488"/><stop offset="1" stop-color="#7E5274"/></linearGradient>`;
  s += `<filter id="cbl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter></defs>`;
  s += `<rect width="${CLIP_W}" height="${CLIP_H}" fill="url(#csky)"/><rect width="${CLIP_W}" height="${CLIP_H}" fill="url(#csun)"/>`;
  // slow clouds (far: barely move)
  s += `<g filter="url(#cbl)" opacity="0.5"><ellipse cx="${shift(0.05, 760, 1600)}" cy="380" rx="420" ry="70" fill="#9C7AA8"/><ellipse cx="${shift(0.05, 200, 1600)}" cy="620" rx="300" ry="50" fill="#E3A2AE"/></g>`;
  // the far hills (a soft band), the mid plain
  const hills = (k: number, y: number, amp: number, col: string, op: number) => {
    const o = (herSpeed * k * t) % 1400;
    let d = `M-20 ${CLIP_H}L-20 ${y}`;
    for (let x = -20; x <= CLIP_W + 20; x += 20) {
      const X = x - o;
      d += `L${x} ${(y + amp * Math.sin(X / 230) + amp * 0.5 * Math.sin(X / 97 + 1.3)).toFixed(1)}`;
    }
    return `<path d="${d}L${CLIP_W + 20} ${CLIP_H}Z" fill="${col}" opacity="${op}"/>`;
  };
  s += hills(0.08, 1250, 14, '#9C6F96', 0.55);
  s += hills(0.2, 1330, 8, '#A87792', 0.7);
  s += `<rect x="0" y="1360" width="${CLIP_W}" height="${CLIP_H - 1360}" fill="url(#cgnd)"/>`;
  // lamp posts in the mid ground (ref 02), passing slowly
  const MID = 0.42;
  for (let i = 0; i < 4; i++) {
    const x = shift(MID, 120 + i * 470, 1880);
    s += `<rect x="${(x - 3).toFixed(1)}" y="1120" width="6" height="300" fill="#4E3554" opacity="0.8"/><circle cx="${x.toFixed(1)}" cy="1118" r="7" fill="#FFE2B8"/><circle cx="${x.toFixed(1)}" cy="1118" r="22" fill="#FFE2B8" opacity="0.18"/>`;
  }
  // a stranger standing far off, looking out (static in the world: she drifts right with the far ground)
  const FAR = 0.24;
  const niaX = -30 + herSpeed * FAR * t;
  s += fig({look: NIA, view: 'b', pose: {kind: 'stand'}, x: niaX, y: 1352, h: 1000 * FAR * (175 / 168), t, wind: CLIP_WIND, shadow: {color: '#5a2f48', opacity: 0.25}});
  // a stranger walking the same way at her pace (the lamps and the tufts carry the travel)
  const theoP = 1.3;
  const theoH = 1000 * MID * (188 / 168);
  const theoSpeed = ((176 + 190) / (0.62 * theoP)) * (theoH / 1000);
  const theoX = 965 + (herSpeed * MID - theoSpeed) * t;
  s += fig({look: THEO, view: 'p', pose: {kind: 'walk', ph: t / theoP + 0.37, period: theoP}, x: theoX, y: 1440, h: theoH, t, wind: CLIP_WIND, shadow: {color: '#5a2f48', opacity: 0.25}});
  // grass tufts on the ground: the far ones slide slowly, the near ones at her speed (her feet never skate)
  const tuft = (x: number, y: number, k: number, op: number) => {
    const h = 34 * k;
    const w = 26 * k;
    // a few blades bent downwind (one wind)
    let d = '';
    for (let j = 0; j < 4; j++) {
      const bx = x + (j - 1.5) * w * 0.35;
      const lean = (12 + j * 5) * k;
      d += `M${(bx - 2 * k).toFixed(1)} ${y}Q${(bx + lean * 0.3).toFixed(1)} ${(y - h * 0.6).toFixed(1)} ${(bx + lean).toFixed(1)} ${(y - h * (0.8 + 0.1 * (j % 2))).toFixed(1)}Q${(bx + lean * 0.35).toFixed(1)} ${(y - h * 0.45).toFixed(1)} ${(bx + 2 * k).toFixed(1)} ${y}Z`;
    }
    return `<path d="${d}" fill="#5E3A5E" opacity="${op}"/>`;
  };
  for (let i = 0; i < 7; i++) s += tuft(shift(MID, i * 310 + 60, 2170), 1420 + (i % 3) * 14, 0.5, 0.45);
  for (let i = 0; i < 6; i++) s += tuft(shift(1, i * 420 + (i % 2) * 130, 2520), GROUND + 6 + (i % 3) * 70, 1.1 + (i % 3) * 0.25, 0.6);
  // her
  s += fig({look: HER, view: 'p', pose: {kind: 'walk', ph: t / WALK_PERIOD, period: WALK_PERIOD}, x: HER_X, y: GROUND, h: HER_H_PX, t, wind: CLIP_WIND, shadow: {color: '#4a2240', opacity: 0.3}});
  return s;
}

// ================================================================ 04: the cast in the dusk still
export const SCENE_W = 2240;
export const SCENE_H = 2080;
/** px per cm by the depth on the quay (P4Scene's people: 0.93 px/cm on the back quay at y ~1080, 1.23 on the promenade
 *  at y ~1400). */
const depth = (y: number) => 0.93 + ((y - 1080) / (1400 - 1080)) * (1.23 - 0.93);
const SCENE_WIND: Wind = breeze('scene', 0.9, 0, 0.0);
const SCENE_WALK: Wind = breeze('scene-walk', 1.08, 0, 0.0);
/** The low sun (behind the far town on the left): its warm rim on every figure's sun side, the light travelling to the
 *  right and a touch down; every figure's long soft shadow runs to the right and a touch up the ground, as the mascot's
 *  does; the shadow's colour and strength sampled from the mascot's (the ground darkened by about an eighth). */
const SUN = {color: '#FFD3A2', k: 0.7, width: 1.6};
const SUN_LIGHT: [number, number] = [0.96, 0.28];
const SCENE_SHADOW = {k: [0.92, 0.16] as [number, number], color: '#4A2E2C', opacity: 0.34};
type Placed = {look: Look; view: View; pose: Pose; x: number; y: number};
// her nearest and largest, alone in the foreground with the mascot (walking the promenade into the wind); the five
// strangers smaller behind her, on the back quay
export const PLACED: Placed[] = [
  {look: NIA, view: 'b', pose: {kind: 'stand'}, x: 150, y: 1062},
  {look: ROSA, view: 'q', pose: {kind: 'stand'}, x: 262, y: 1072},
  {look: KOFI, view: 'q', pose: {kind: 'stand'}, x: 420, y: 1078},
  {look: THEO, view: 'p', pose: {kind: 'walk', ph: 0.62, period: 1.2}, x: 612, y: 1088},
  {look: JUN, view: 'q', pose: {kind: 'stand'}, x: 736, y: 1094},
  {look: HER, view: 'p', pose: {kind: 'walk', ph: 0.1, period: WALK_PERIOD}, x: 436, y: 1420},
];
export function sceneFigures(): string {
  return PLACED.slice()
    .sort((a, b) => a.y - b.y)
    .map((p) => {
      const h = Math.round(p.look.stature * depth(p.y));
      const parts = figure(p.look, p.view, p.pose, {t: 0, wind: p.pose.kind === 'walk' ? SCENE_WALK : SCENE_WIND, px: h, shadow: {color: '#4A2E2C', opacity: 0.4}, sun: SUN});
      const id = uid('s');
      return castShadow(parts, id, p.x, p.y, h, {...SCENE_SHADOW, blurPx: Math.max(1.2, h / 110)}) + place(parts, id, p.x, p.y, h, {light: SUN_LIGHT});
    })
    .join('');
}
export const HER_SCENE_PX = Math.round(HER.stature * depth(1420));
export function sceneSheet(plate: string, pw: number, ph: number): string {
  UID = 0;
  const figs = sceneFigures();
  let s = `<rect width="${SCENE_W}" height="${SCENE_H}" fill="${C.bg}"/>`;
  s += T(30, 60, 'FLOW v5 · GUST: the cast in our dusk still', {s: 40, w: 800, c: C.ink});
  s += T(32, 98, `The painted still v6 at dusk. Her (${HER_SCENE_PX} px, walking the promenade into the wind) nearest, alone in front with the mascot; five strangers smaller behind her on the quay. The low sun's long shadows, its warm rim. Left: the frame 1:1.`, {s: 20});
  s += `<svg x="30" y="130" width="${pw}" height="${ph}" viewBox="0 0 ${pw} ${ph}"><image href="${plate}" x="0" y="0" width="${pw}" height="${ph}"/>${figs}</svg>`;
  const crops = [
    {x: 90, y: 880, w: 720, h: 250, label: 'the quay, 2x: five strangers behind her (148-176 px), each with the sun’s long shadow and warm rim'},
    {x: 250, y: 1150, w: 600, h: 300, label: `the promenade, 2x: her (${HER_SCENE_PX} px) and the mascot, the low sun’s shadows`},
  ];
  let yy = 130;
  crops.forEach((c) => {
    const sc = 1060 / (2 * c.w);
    const y = yy;
    yy += c.h * 2 * sc + 64;
    s += `<svg x="1150" y="${y}" width="${c.w * 2 * sc}" height="${c.h * 2 * sc}" viewBox="${c.x} ${c.y} ${c.w} ${c.h}"><image href="${plate}" x="0" y="0" width="${pw}" height="${ph}"/>${figs}</svg>`;
    s += T(1150, y + c.h * 2 * sc + 26, c.label, {s: 19});
  });
  s += `<svg x="1150" y="1220" width="360" height="640" viewBox="0 0 ${pw} ${ph}"><image href="${plate}" x="0" y="0" width="${pw}" height="${ph}"/>${figs}</svg>`;
  s += T(1530, 1250, 'At phone size', {s: 22, w: 700, c: C.ink});
  s += T(1530, 1282, 'the frame 1080 px wide shown 360 px', {s: 18});
  s += T(1530, 1308, 'wide (a phone held at arm’s length)', {s: 18});
  ['Look at: at phone size, is she the one', 'you find first, nearest, in her colour?', 'Do the strangers sit behind her,', 'smaller? Does each person stand in', 'the scene’s light: the long shadow,', 'the warm rim on the sun side?'].forEach((t, i) => {
    s += T(1530, 1370 + i * 26, t, {s: 19, c: C.ink});
  });
  return s;
}
