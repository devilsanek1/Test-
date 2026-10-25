// ---------------------------------------------------------------- trim

/** A hand-trimmed WINDOW, the quiet one: paper only where a phone viewer sees it and nothing hides it, and the world
 *  still bleeds. Hand-cut side slivers (LEFT 28-32 px with one stretch where the scissors drift out to 36-40, RIGHT
 *  22-26 px: clear of the rail), a thin TOP (12-16 px: clear of the status bar), the BOTTOM OPEN (ground and
 *  foreground run off the frame in colour). One sharp, uneven scissor snip at the top-right corner (a straight
 *  chamfer, 18-28 x 30-46 px, never a radius); at the top-left the artist's two ruled lines cross and overshoot into
 *  the paper (single thin strokes). Everything else is the scene's own ink running off the screen across the slivers. */
function trim(seed: Seed, a: number): EdgeSpec {
  const r = rng(`${seed}/trim`);
  let L = r.range(28, 32) * a;
  let Lw = r.range(36, 40) * a;
  const R = r.range(22, 26) * a;
  const T = r.range(12, 16) * a;
  const w0 = r.range(560, 900);
  const w1 = w0 + r.range(300, 440);
  const tr0 = r.range(80, 120); // the drift out / back in runs over 80-120 px (a gentle 4-6 deg turn)
  const tr1 = r.range(80, 120);
  const snip: [number, number] = [r.range(18, 28) * a, r.range(30, 46) * a];
  const tilt = () => r.jitter(0.8);
  let pts: Pt[] = [];
  let tl: Pt = [L, T];
  for (let k = 0; k < 12; k++, L *= 0.9, Lw *= 0.9) {
    tl = [L, T];
    const yT = T + tilt();
    const corners: Pt[] = [
      tl,
      [W - R - snip[0], yT],
      [W - R, yT + snip[1]],
      [W - R + tilt(), H + 40],
      [L + tilt(), H + 40],
      [L, w1 + tr1],
      [Lw, w1],
      [Lw + tilt(), w0],
      [L, w0 - tr0],
    ];
    pts = cutPoly(corners, r.fork(`cut${k}`), {
      side: (i) => (i === 0 ? {segs: [2, 3], dev: 1.2 * a, bow: 1 * a} : i === 2 ? {segs: [3, 4], dev: 1.5 * a, bow: 1.2 * a} : i === 4 || i === 6 || i === 8 ? {segs: [1, 2], dev: 1.5 * a, bow: 1 * a} : {segs: [1, 1], dev: 0, bow: 0}),
    });
    if (containsRect(pts, CAPTION_SAFE)) break;
  }
  const strokes = ruledCorner(r.fork('tl'), `${seed}ttl`, tl, 1, {h: {len: [140, 240], over: Math.min(L - 8, r.range(16, 22) * a)}, v: {len: [140, STROKE_MAX_Y - T], over: 40}});
  return {variant: 'trim', colour: pathOf(pts), colourPts: pts, ink: null, inkPts: null, strokes};
}
