// board.ts: the storyboard house look (docs/look/STORYBOARD_STYLE.md §2, §6) for the shared G3 kit. Monochrome: paper +
// 3 tones for fills, ink for tier A's lines, mid grey for tier B's, red pencil only for the annotation layer (marks).
// The WEIGHT follows the attention TIER (story role, never depth; G3_ANIMATIC §3, CRAFT §b):
//   A  the beat's 1-3 subjects: the ink outline 9 px, inner details 5 px, the only dark mass
//   B  supporting life near the story (the mascot, people, story objects off their beat): 3 px mid-grey lines, no dark mass
//   C  the environment (room, street, town, sky, weather, far life): a light tone with no contour; open lines that ARE
//      lines (rails, wires, the ground's lines to the VP) at 3 px light; the scribble mass at light grey
// The PLANE (CRAFT §f.1) sets a grey step on top: each farther plane paler (converging on the paper's air), each nearer
// one a step darker. Elements without a tier keep v3's role weights (subject 9 px ink, mid 5 px ink, far 3 px mid).

import type {Fill, Role, Tier} from './types';

export const BOARD = {
  paper: '#F7F5F0',
  light: '#CDCBC6',
  mid: '#9A9893',
  dark: '#3A3835',
  ink: '#1F1E1C',
  red: '#C23B22',
} as const;

const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
export const rgbOf = (hex: string): [number, number, number] | null => {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
};
const lstarRgb = ([r, g, b]: [number, number, number]) => {
  const y = 0.2126 * lin(r / 255) + 0.7152 * lin(g / 255) + 0.0722 * lin(b / 255);
  return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (24389 / 27) * y;
};
const hex2 = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
const toHex = (c: [number, number, number]) => `#${hex2(c[0])}${hex2(c[1])}${hex2(c[2])}`.toUpperCase();

/** CIE L* (0 = black, 100 = white) of a #hex colour; NaN if it isn't one. */
export const lstar = (hex: string) => {
  const c = rgbOf(hex);
  return c ? lstarRgb(c) : NaN;
};

/** a + (b - a) * k in sRGB (greys: close to a step in L*) */
export function mix(a: string, b: string, k: number): string {
  const ca = rgbOf(a);
  const cb = rgbOf(b);
  if (!ca || !cb) return a;
  const kk = Math.max(0, Math.min(1, k));
  return toHex([0, 1, 2].map((i) => ca[i] + (cb[i] - ca[i]) * kk) as [number, number, number]);
}

/** The colour `dL` L* lighter (dL > 0) or darker (dL < 0), toward paper or ink along the board's own grey line. */
export function stepL(hex: string, dL: number): string {
  const L = lstar(hex);
  if (Number.isNaN(L) || dL === 0) return hex;
  const target = dL > 0 ? BOARD.paper : BOARD.ink;
  const Lt = lstar(target);
  const want = Math.max(Math.min(L + dL, 97), 11);
  // bisection on the mix factor (L* is monotonic along the mix)
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const m = (lo + hi) / 2;
    const Lm = lstar(mix(hex, target, m));
    if ((dL > 0 && Lm < want) || (dL < 0 && Lm > want)) lo = m;
    else hi = m;
  }
  return Math.abs(Lt - L) < 0.5 ? hex : mix(hex, target, (lo + hi) / 2);
}

/** The board's plane ladder (CRAFT §f.2's k = .12 / .22 / .40 / .65 made visible on the 4-tone board): the mix toward
 *  the paper's air per farther plane, and the L* step darker per nearer plane (CRAFT: 5 / 10). Light (L* 82) reads
 *  85 / 88 / 91 / 93 on +1 ... +4; mid (63) 70 / 77 / 83 / 88. Tier A takes half its plane's step. */
export const PLANE_K: Record<number, number> = {1: 0.2, 2: 0.4, 3: 0.6, 4: 0.75};
export const PLANE_NEAR_DL: Record<number, number> = {[-1]: -5, [-2]: -10};

/** a colour on plane p (0 = as drawn); half = tier A (half the step) */
export function planeTone(hex: string, plane = 0, half = false): string {
  if (!plane || !hex || hex === 'none' || !hex.startsWith('#')) return hex;
  const p = Math.max(-2, Math.min(4, Math.round(plane)));
  if (p > 0) return mix(hex, BOARD.paper, (PLANE_K[p] ?? 0.75) * (half ? 0.5 : 1));
  const d = PLANE_NEAR_DL[p] ?? -10;
  return stepL(hex, half ? d / 2 : d);
}

const TONES = (['paper', 'light', 'mid', 'dark'] as const).map((k) => ({k, c: BOARD[k] as string, L: lstar(BOARD[k])}));
const PAPER_RGB = rgbOf(BOARD.paper)!;

/** An icon's or a hex colour's role for tone snapping: subject (A), mid (v3), far (v3; B's tones), env (tier C). */
export type ToneRole = 'subject' | 'mid' | 'far' | 'env';

/** Snaps a colour's brightness to the nearest of the 4 board tones (paper, light, mid, dark). `o` = the colour's opacity
 *  over paper. Off the subject, dark becomes mid (the subject owns the only dark area); far and tier C wash out to
 *  light or paper. Anything that isn't a #hex comes back unchanged. */
export function boardTone(hex: string, role: ToneRole = 'subject', o = 1): string {
  const c = rgbOf(hex);
  if (!c) return hex;
  const a = Math.max(0, Math.min(1, o));
  const L = lstarRgb(c.map((v, i) => v * a + PAPER_RGB[i] * (1 - a)) as [number, number, number]);
  let best = TONES[0];
  for (const t of TONES) if (Math.abs(t.L - L) < Math.abs(best.L - L)) best = t;
  if ((role === 'far' || role === 'env') && (best.k === 'mid' || best.k === 'dark')) return BOARD.light;
  return best.k === 'dark' && role !== 'subject' ? BOARD.mid : best.c;
}

/** Fill tokens by tone role: paper is opaque paper; warm / cold / light -> light; mid -> mid (light on tier C); dark ->
 *  dark on the subject, mid on B / v3 roles, light on C; pop -> dark (pop makes its element the subject). */
export function boardFill(f: Fill, role: ToneRole): string {
  switch (f) {
    case 'paper':
      return BOARD.paper;
    case 'light':
    case 'warm':
    case 'cold':
      return BOARD.light;
    case 'mid':
      return role === 'env' ? BOARD.light : BOARD.mid;
    case 'dark':
      return role === 'subject' ? BOARD.dark : role === 'env' ? BOARD.light : BOARD.mid;
    case 'pop':
      return role === 'env' ? BOARD.light : role === 'subject' ? BOARD.dark : BOARD.mid;
  }
  return BOARD.light;
}

/** v3's outline for a role: width (sw overrides) and colour. */
export const roleLine = (role: ToneRole, sw?: number) => ({
  w: sw ?? (role === 'subject' ? 9 : role === 'mid' ? 5 : 3),
  c: role === 'env' ? BOARD.light : role === 'far' ? BOARD.mid : BOARD.ink,
});
/** Inner details: 5 px on the subject, 3 px elsewhere. */
export const detailW = (role: ToneRole) => (role === 'subject' ? 5 : 3);

/** The resolved weight of one element: everything the renderer needs to draw it at its tier and plane. */
export type Weight = {
  /** null = no tier (v3 role weights) */
  tier: Tier | null;
  /** the tone role icons, figures and boardTone use */
  role: ToneRole;
  /** the outline colour, or null for no outline (tier C shapes) */
  line: string | null;
  w: number;
  detail: number;
  /** a fill token -> its colour at this tier and plane */
  fill: (f?: Fill) => string | undefined;
  /** any colour -> its plane step */
  tone: (hex: string) => string;
  /** the colour open lines (things that ARE lines) take */
  openLine: string;
  /** may carry the dark mass */
  dark: boolean;
  plane: number;
};

/** The element's tier: the panel's override, its own, the dress role's C, or pop's A; null = none (v3 role). */
export function tierOf(el: {tier?: Tier; role?: Role; fill?: unknown; id?: string}, overrides?: Record<string, Tier>): Tier | null {
  if (el.id && overrides && overrides[el.id]) return overrides[el.id];
  if (el.tier) return el.tier;
  if (el.role === 'dress') return 'C';
  if (el.fill === 'pop') return 'A';
  return null;
}

/** v3's role (when an element has no tier): role, or 'subject' for a pop fill, 'far' for f < 0.5, else 'mid' */
export const v3Role = (el: {role?: Role; fill?: unknown; f?: number}): 'subject' | 'mid' | 'far' =>
  el.role && el.role !== 'dress' ? el.role : el.fill === 'pop' ? 'subject' : el.f !== undefined && el.f < 0.5 ? 'far' : 'mid';

export function weightOf(el: {tier?: Tier; role?: Role; fill?: unknown; id?: string; f?: number; sw?: number; plane?: number},
  overrides?: Record<string, Tier>): Weight {
  const tier = tierOf(el, overrides);
  const plane = el.plane ?? 0;
  const half = tier === 'A';
  const tone = (hex: string) => planeTone(hex, plane, half);
  if (tier === 'A') {
    return {tier, role: 'subject', line: tone(BOARD.ink), w: el.sw ?? 9, detail: 5, dark: true, plane, tone,
      openLine: tone(BOARD.ink), fill: (f) => (f === undefined ? undefined : tone(boardFill(f, 'subject')))};
  }
  if (tier === 'B') {
    return {tier, role: 'far', line: tone(BOARD.mid), w: el.sw ?? 3, detail: 3, dark: false, plane, tone,
      openLine: tone(BOARD.mid), fill: (f) => (f === undefined ? undefined : tone(f === 'dark' || f === 'pop' ? BOARD.mid : boardFill(f, 'far')))};
  }
  if (tier === 'C') {
    return {tier, role: 'env', line: null, w: el.sw ?? 3, detail: 3, dark: false, plane, tone,
      openLine: tone(BOARD.light), fill: (f) => tone(f === 'paper' ? BOARD.paper : BOARD.light)};
  }
  const r = v3Role(el);
  const rl = roleLine(r, el.sw);
  return {tier: null, role: r, line: tone(rl.c), w: rl.w, detail: detailW(r), dark: r === 'subject', plane, tone,
    openLine: tone(rl.c), fill: (f) => (f === undefined ? undefined : tone(boardFill(f, r)))};
}

/** The rig's one shadow value. */
export const shadowTone = (s?: string) => (!s || s === 'mid' ? BOARD.mid : s === 'light' ? BOARD.light : s);
