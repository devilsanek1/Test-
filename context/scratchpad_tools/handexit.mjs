// when is the diagram hand fully outside the sheet's inner rect (x 212..764, y 692..1288)?
const nums = (d) => (d.match(/-?\d+(\.\d+)?/g) || []).map(Number);
const HAND_OUT = 'M2 -10C10 -16 24 -20 38 -24C52 -30 70 -31 84 -25L100 -23L100 23C86 27 70 31 56 30C45 30 37 27 31 22C23 18 13 13 5 9C0 7 -1 3 3 1.5C10 2.5 18 5 25 6.5C21 1.5 15 -1.5 7 -2.5C2 -3 -2 -6 2 -10Z';
const SLEEVE = 'M98 -32L640 -70L640 70L98 32C93 12 93 -12 98 -32Z';
const pts = [];
for (const d of [HAND_OUT, SLEEVE]) { const n = nums(d); for (let i = 0; i + 1 < n.length; i += 2) pts.push([n[i], n[i + 1]]); }
// densify the sleeve edges
for (let u = 0; u <= 1; u += 0.02) { pts.push([98 + 542 * u, -32 - 38 * u]); pts.push([98 + 542 * u, 32 + 38 * u]); }
const KNOB = [488 + 11 * 0.75 * 2.8, 960 - 27 * 0.75 * 2.8];
const PINCH = [KNOB[0], KNOB[1] - 3];
for (const angle of [-40, -34]) {
  const a = (angle * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  const vis = (d, rot = 0) => {
    const ar = ((angle + rot) * Math.PI) / 180, cr = Math.cos(ar), sr = Math.sin(ar);
    let n = 0;
    for (const [lx, ly] of pts) {
      const X = PINCH[0] + 1.2 * (lx * cr - ly * sr) + d * c;
      const Y = PINCH[1] + 1.2 * (lx * sr + ly * cr) + d * s;
      if (X > 212 && X < 764 && Y > 692 && Y < 1288) n++;
    }
    return n;
  };
  let dIn = 0; while (vis(dIn) > 0) dIn += 1;
  let dOut = 0; while (vis(dOut, 18) > 0) dOut += 1; // turned 18 deg (the turn rotates about the pinch)
  // sleeve top edge vs the sheet's top inner edge (y 692) at rest: min y of sleeve top edge inside x < 764
  let minY = 1e9;
  for (let u = 0; u <= 1; u += 0.001) { const lx = 98 + 542 * u, ly = -32 - 38 * u; const X = PINCH[0] + 1.2 * (lx * c - ly * s), Y = PINCH[1] + 1.2 * (lx * s + ly * c); if (X < 776) minY = Math.min(minY, Y); }
  console.log({angle, slideInHiddenFrom: dIn, exitHiddenAt_turned: dOut, sleeveTopMinY_insideSheet: minY.toFixed(1)});
}
console.log('--- turned exits and sleeve crossings');
for (const angle of [-30, -28, -26]) {
  for (const rot of [0, 18]) {
    const ar = ((angle + rot) * Math.PI) / 180, cr = Math.cos(ar), sr = Math.sin(ar);
    const W = (lx, ly, d) => [PINCH[0] + 1.2 * (lx * cr - ly * sr) + d * cr, PINCH[1] + 1.2 * (lx * sr + ly * cr) + d * sr];
    let d = 0;
    const vis = (d) => pts.some(([lx, ly]) => { const [X, Y] = W(lx, ly, d); return X > 212 && X < 764 && Y > 692 && Y < 1288; });
    while (vis(d)) d++;
    // sleeve top edge at the sheet's inner right edge x=764 (d=0)
    let yTop = null, yBot = null;
    for (let u = 0; u <= 1; u += 0.0005) { const [X, Y] = W(98 + 542 * u, -32 - 38 * u, 0); if (yTop === null && X >= 764) yTop = Y; const [X2, Y2] = W(98 + 542 * u, 32 + 38 * u, 0); if (yBot === null && X2 >= 764) yBot = Y2; }
    console.log({angle, rot, hiddenAtTravel: d, sleeveTopAtRightEdge: yTop?.toFixed(0), sleeveBotAtRightEdge: yBot?.toFixed(0)});
  }
}
