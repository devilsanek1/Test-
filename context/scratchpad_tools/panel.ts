// ---------------------------------------------------------------- shared: the corner strokes

/** The artist's ruled corner: one or two thin ruled lines along the cut edges near a corner, sitting 2-4 px OUT in the
 *  paper (misregistered from the colour like every fill in the style) and overshooting the corner into the margin.
 *  `h` = the horizontal (along the top cut) and `v` = the vertical (along the side cut); each is optional.
 *  sx = +1 for a left corner, -1 for a right one. Single strokes, no re-strokes. */
function ruledCorner(
  r: ReturnType<typeof rng>,
  key: string,
  c: Pt,
  sx: 1 | -1,
  o: {h?: {len: [number, number]; over: number}; v?: {len: [number, number]; over: number}},
): EdgeStroke[] {
  const out: EdgeStroke[] = [];
  const m = r.range(2.5, 4); // out into the paper
  if (o.h) {
    const y = c[1] - m;
    const x0 = c[0] + sx * r.range(o.h.len[0], o.h.len[1]);
    const x1 = c[0] - sx * o.h.over;
    out.push({d: ruled([x0, y + r.jitter(0.6)], [x1, y + r.jitter(0.6)], `${key}h`, 0.2), w: stroke.inkThin});
  }
  if (o.v) {
    const x = c[0] - sx * m;
    const y0 = c[1] + r.range(o.v.len[0], o.v.len[1]);
    const y1 = c[1] - o.v.over;
    out.push({d: ruled([x + r.jitter(0.6), y0], [x + r.jitter(0.6), y1], `${key}v`, 0.2), w: stroke.inkThin});
  }
  return out;
}

/** Lowest y a stroke near the left / right frame edge may reach: just above the caption block. */
const STROKE_MAX_Y = CAPTION_SAFE[1] - 12;

// ---------------------------------------------------------------- panel

/** Reference 1's panel, phone-aware: "the sketch runs out at the edges". Colour stops on a hand-cut edge, the line art
 *  keeps going into white paper and visibly STOPS there (lines end in the white, like f_9.0), and the colour runs out of
 *  the frame at the bottom (the ground and the foreground figures stay full-bleed and in colour, nothing white sits
 *  under the platform's description text).
 *  - LEFT 38-44 px (the side that carries the charm: away from the right rail), cut in 3-4 scissor strokes (2-3 px
 *    jogs), ending at y 1490-1570 in ONE sharp diagonal snip out to the frame edge; RIGHT 18-22 px (clear of the
 *    rail), TOP 14-18 px (clear of the status bar); every side off-axis by < 1 px.
 *  - The ink layer is clipped to a comb on the left: stretches of 80-180 px where the line art stops 6-20 px short of
 *    the screen edge (a line ends in the white, 20-35 px past the colour), between stretches where it runs off.
 *  - Two inked corners, single strokes: top-left = a crossing ruled pair, the horizontal ending in the paper;
 *    top-right (usually sky) = one ruled vertical that overshoots off the top. */
function panel(seed: Seed, a: number): EdgeSpec {
  const r = rng(`${seed}/panel`);
  let L = r.range(38, 44) * a;
  const R = r.range(18, 22) * a;
  const T = r.range(14, 18) * a;
  const yOpen = r.range(1490, 1570);
  const snipDy = r.range(120, 170);
  const tilt = () => r.jitter(0.8);
  let pts: Pt[] = [];
  let tl: Pt = [L, T];
  let tr: Pt = [W - R, T];
  for (let k = 0; k < 12; k++, L *= 0.9) {
    tl = [L, T];
    tr = [W - R, T + tilt()];
    const corners: Pt[] = [tl, tr, [W - R + tilt(), H + 40], [-40, H + 40], [-40, yOpen + snipDy], [L + tilt(), yOpen]];
    pts = cutPoly(corners, r.fork(`cut${k}`), {
      side: (i) =>
        i === 0 ? {segs: [2, 3], dev: 1.8 * a, bow: 1.2 * a} : i === 1 ? {segs: [3, 4], dev: 2.2 * a, bow: 1.2 * a} : i === 5 ? {segs: [3, 4], dev: 2.6 * a, bow: 1.6 * a} : {segs: [1, 1], dev: 0, bow: 0},
    });
    if (containsRect(pts, CAPTION_SAFE)) break;
  }
  // the ink comb (left side, down to just below the snip)
  const rc = r.fork('comb');
  const comb: Pt[] = [];
  let y = yOpen + 60;
  while (y > -40) {
    const h = rc.range(80, 180);
    const k = rc.chance(0.6) ? rc.range(6, 20) * a : -2;
    comb.push([k, y], [k, y - h]);
    y -= h;
  }
  const inkPts: Pt[] = [[W + 40, -60], [W + 40, H + 40], [-40, H + 40], [-40, yOpen + 60], ...comb, [-40, y - 20], [-40, -60]];
  const strokes: EdgeStroke[] = [
    ...ruledCorner(r.fork('tl'), `${seed}ptl`, tl, 1, {h: {len: [170, 290], over: Math.min(L - 10, r.range(18, 30) * a)}, v: {len: [150, STROKE_MAX_Y - T], over: 40}}),
    ...ruledCorner(r.fork('tr'), `${seed}ptr`, tr, -1, {v: {len: [200, 320], over: 40}}),
  ];
  return {variant: 'panel', colour: pathOf(pts), colourPts: pts, ink: pathOf(inkPts), inkPts, strokes};
}
