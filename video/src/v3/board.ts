// board.ts: the storyboard house look (docs/look/STORYBOARD_STYLE.md §2, §6), shared by SketchReel's `board` mode and
// SketchIcons. Monochrome: paper + 3 tones for fills, ink for lines, red pencil only for the annotation layer (marks).
// Line weight by role: subject 9 px ink, middle plane 5 px ink, far plane 3 px mid grey.

export type Role = 'subject' | 'mid' | 'far';

export const BOARD = {
  paper: '#F7F5F0',
  light: '#CDCBC6',
  mid: '#9A9893',
  dark: '#3A3835',
  ink: '#1F1E1C',
  red: '#C23B22',
} as const;

const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const rgb = (hex: string): [number, number, number] | null => {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
};
const lstarRgb = ([r, g, b]: [number, number, number]) => {
  const y = 0.2126 * lin(r / 255) + 0.7152 * lin(g / 255) + 0.0722 * lin(b / 255);
  return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (24389 / 27) * y;
};

/** CIE L* (0 = black, 100 = white) of a #hex colour; NaN if it isn't one. */
export const lstar = (hex: string) => {
  const c = rgb(hex);
  return c ? lstarRgb(c) : NaN;
};

const TONES = (['paper', 'light', 'mid', 'dark'] as const).map((k) => ({k, c: BOARD[k] as string, L: lstar(BOARD[k])}));
const PAPER_RGB = rgb(BOARD.paper)!;

/** Snaps a colour's brightness to the nearest of the 4 board tones (paper, light, mid, dark). `o` = the colour's
 *  opacity over paper (blended first, so a 40 % red wash becomes light). Off the subject, dark becomes mid (the
 *  subject owns the only dark area); on the far plane everything is light or paper (washed out, no detail).
 *  Anything that isn't a #hex comes back unchanged. */
export function boardTone(hex: string, role: Role = 'subject', o = 1): string {
  const c = rgb(hex);
  if (!c) return hex;
  const a = Math.max(0, Math.min(1, o));
  const L = lstarRgb(c.map((v, i) => v * a + PAPER_RGB[i] * (1 - a)) as [number, number, number]);
  let best = TONES[0];
  for (const t of TONES) if (Math.abs(t.L - L) < Math.abs(best.L - L)) best = t;
  if (role === 'far' && (best.k === 'mid' || best.k === 'dark')) return BOARD.light;
  return best.k === 'dark' && role !== 'subject' ? BOARD.mid : best.c;
}

/** Board fill tokens (plus the legacy sketch names): paper is opaque paper, warm / cold / light -> light, mid -> mid,
 *  dark -> dark on the subject and mid elsewhere, pop -> dark (pop makes its element the subject by default). */
export type BoardFill = 'paper' | 'light' | 'mid' | 'dark' | 'pop' | 'warm' | 'cold';
export function boardFill(f: BoardFill, role: Role): string {
  switch (f) {
    case 'paper':
      return BOARD.paper;
    case 'light':
    case 'warm':
    case 'cold':
      return BOARD.light;
    case 'mid':
      return BOARD.mid;
    case 'dark':
      return role === 'subject' ? BOARD.dark : BOARD.mid;
    case 'pop':
      return BOARD.dark;
  }
}

/** The outline for a role: width (sw overrides) and colour. */
export const roleLine = (role: Role, sw?: number) => ({
  w: sw ?? (role === 'subject' ? 9 : role === 'mid' ? 5 : 3),
  c: role === 'far' ? BOARD.mid : BOARD.ink,
});
/** Inner details (a face, a strike's companion lines): 5 px on the subject, 3 px elsewhere. */
export const detailW = (role: Role) => (role === 'subject' ? 5 : 3);
