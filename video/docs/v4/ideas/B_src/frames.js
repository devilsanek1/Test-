// Imagination B's frames: one whole 9:16 frame per beat (value sketches), drawn with lib.js.
const FRAMES = {};

// ======================================================================================
// THE HOME VIEW: Katajanokka's quay at night from a person's eye, looking along the quay to its end by the water.
// Icebreakers moored on the left, Jugendstil blocks on the right, the harbour ice, the far city and Uspenski across.
// mode: 'vision' (the hall of computers stands at the quay's end and its heat runs home: B1, B12)
//       'plan'   (the lot is empty; the city's line stops short; the plan is pencilled in: B8)
// ======================================================================================
function homeView(o = {}) {
  const mode = o.mode || 'vision';
  seed(o.seed || 11);
  const cam = Cam(1050, 520, 1110, 1.7);
  let s = '';
  // sky: the band light and calm; under it the snowy night closes down toward the harbour
  s += `<linearGradient id="hsky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1112"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.27" stop-color="${C.paper}"/><stop offset="0.54" stop-color="${C.paper}"/><stop offset="0.66" stop-color="${V[11]}"/><stop offset="0.82" stop-color="${V[8]}"/><stop offset="1" stop-color="${V[9]}"/></linearGradient><rect x="0" y="0" width="${W}" height="1114" fill="url(#hsky)"/>`;
  s += cloudBank(760, 120, V[10], 0.45, 7) + cloudBank(900, 120, V[7], 0.35, 7);
  // ---- the far shore across the harbour (left): a low belt with the city's windows ----
  let far = P(polyD([[0, 1112], [0, 1080], [50, 1078], [60, 1068], [120, 1070], [130, 1076], [190, 1078], [200, 1088], [270, 1090], [280, 1098], [360, 1100], [370, 1106], [440, 1108], [440, 1112]], 1), V[5]);
  const nW = mode === 'vision' ? 120 : 26;
  for (let i = 0; i < nW; i++) { const x = rr(4, 430), y = rr(1084, 1108) + (x > 200 ? 8 : 0); far += rect(x, y, rr(2, 3.4), rr(2, 3), C.honey, `opacity="${f1(rr(0.5, 0.95))}"`); }
  s += far;
  // ---- the harbour ice (it mirrors the sky), the icebreakers' channel of dark water ----
  s += P(polyD([[0, 1110], [cam.p(-9.6, 0, 140)[0], 1112], cam.p(-9.6, -1.1, 3), [0, 1920]]), V[9]);
  s += P(smoothD([[0, 1148], [140, 1135], [300, 1124], [420, 1116], [300, 1130], [160, 1150], [0, 1175]], true), V[5], 'opacity="0.85"');
  for (let i = 0; i < 22; i++) { const y = rr(1125, 1700); const xmax = Math.max(10, cam.p(-9.6, -1.1, 1050 * 2.8 / (y - 1110))[0] - 20); const x0 = rr(-30, xmax * 0.8); s += S(lineD([[x0, y], [Math.min(xmax, x0 + rr(30, 130)), y + rr(-5, 5)]]), V[rnd() < 0.5 ? 7 : 11], rr(1, 2.6), 'opacity="0.7"'); }
  // the winter swimmer's ice hole by a ladder, steaming a little
  s += P(blobD(150, 1300, 52, 13, 9, 0.12), V[4]) + P(blobD(150, 1299, 45, 10, 9, 0.12), V[1]);
  s += steam(150, 1292, 70, 90, {n: 4, op: 0.35, col: V[12]});
  // ---- an icebreaker moored along the quay ahead: its stern toward us, black hull, pale decks, a funnel ----
  {
    const z = 58, zs = 64;
    let g = '';
    const st = (x, y) => cam.p(x, y, z);
    g += P(smoothD([st(-9.8, -1.1), st(-9.8, 4.2), st(-13, 5.1), st(-22, 5.4), st(-30, 5.1), st(-33, 3), st(-32, -1.1)], true), V[1]);
    g += P(polyD([st(-9.8, 3.3), st(-33, 3.6), st(-33, 4.1), st(-9.8, 3.9)], 0.3), V[8], 'opacity="0.6"');
    g += facadeX(cam, -9.8, z, z + 50, -1.1, 4.2, V[1]);
    // the decks set back, stepping in, pale; window rows dark, one or two lit cool
    const deck = (x1, x2, y1, y2, zz, fill) => faceZ(cam, zz, x1, x2, y1, y2, fill);
    g += deck(-30, -11.5, 5.1, 8.2, zs, V[11]) + deck(-28, -13, 8.2, 11.3, zs + 2, V[12]) + deck(-25.5, -15, 11.3, 13.8, zs + 4, V[13]);
    for (const [yy, zz, x1, x2] of [[6.2, zs, -29, -12.5], [9.3, zs + 2, -27, -14], [12.2, zs + 4, -24.5, -16]]) for (let x = x1; x < x2 - 0.8; x += 1.7) g += faceZ(cam, zz - 0.01, x, x + 1, yy, yy + 1.0, rnd() < 0.15 ? '#e2eef3' : V[3]);
    g += faceZ(cam, zs + 9, -23, -18, 13.8, 18.6, V[2]) + faceZ(cam, zs + 9 - 0.01, -23, -18, 16.6, 17.4, V[10]);
    g += S(lineD([cam.p(-20, 13.8, zs + 6), cam.p(-20, 20.5, zs + 6)]), V[3], 2.6) + S(lineD([cam.p(-22.4, 19.4, zs + 6), cam.p(-17.6, 19.4, zs + 6)]), V[3], 2);
    // snow on its decks' edges
    g += S(lineD([cam.p(-30, 8.25, zs), cam.p(-11.5, 8.25, zs)]), V[14], 2.4) + S(lineD([cam.p(-28, 11.35, zs + 2), cam.p(-13, 11.35, zs + 2)]), V[14], 2);
    s += g;
  }
  // ---- the quay: snow in night values, darker near (the quiet field), tracks converging ----
  s += P(polyD([cam.p(-9.6, 0, 2.6), cam.p(-9.6, 0, 120), cam.p(10.4, 0, 120), cam.p(10.4, 0, 2.6)]), V[7]);
  const bands = [[2.6, 4.2, V[4]], [4.2, 6.5, V[5]], [6.5, 11, V[6]], [11, 22, V[7]], [22, 120, V[8]]];
  for (const [z1, z2, col] of bands) s += P(polyD([cam.p(-9.6, 0, z1), cam.p(-9.6, 0, z2), cam.p(10.4, 0, z2), cam.p(10.4, 0, z1)], 1.5), col);
  // drifts and tyre tracks as flat-brush marks along the perspective (tone on tone)
  for (let i = 0; i < 26; i++) { const x = rr(-8.5, 9.5), z1 = rr(3, 40), z2 = z1 * rr(1.4, 2.4); s += S(lineD([cam.p(x, 0, z1), cam.p(x + rr(-0.2, 0.2), 0, z2)]), rnd() < 0.5 ? V[9] : V[5], cam.sz(rr(0.12, 0.3), z1), 'opacity="0.45"'); }
  for (const x of [3.1, 4.5, 6.6, 8.0]) s += S(lineD([cam.p(x, 0, 4.5), cam.p(x, 0, 120)]), V[4], 2, 'opacity="0.55"');
  // the kerb and its snow bank along the harbour, bollards with snow caps
  s += P(polyD([cam.p(-9.8, 0.1, 2.6), cam.p(-9.8, 0.1, 120), cam.p(-8.6, 0.8, 120), cam.p(-8.6, 0.8, 2.6)], 1), V[10]);
  for (const z of [4.4, 7.5, 13, 22, 36]) { const a = cam.p(-9.1, 0, z), b = cam.p(-9.1, 0.95, z), w = cam.sz(0.42, z); s += hrect(a[0] - w / 2, b[1], w, a[1] - b[1], V[1], 0.5) + ell(a[0], b[1], w * 0.62, w * 0.24, V[13]); }
  // ---- the Jugendstil row (right): stone facades shoulder to shoulder, steep roofs with snow, a corner turret ----
  const block = (z1, z2, h, fac, seedN, litP) => {
    let g = facadeX(cam, 10.4, z1, z2, 0, h, fac);
    g += poly3(cam, [[10.4, h, z1], [10.4, h, z2], [12, h + 2.4, z2], [12, h + 2.4, z1]], V[1]);
    g += S(lineD([cam.p(10.5, h + 0.25, z1), cam.p(10.5, h + 0.25, z2)]), V[12], 2.2, 'opacity="0.85"');
    g += facadeX(cam, 10.4, z1, z2, 0, 3.2, V[3]);
    seed(seedN);
    for (let fl = 0; fl < Math.floor((h - 4) / 3.2); fl++) {
      const y1 = 4.1 + fl * 3.2;
      for (let zz = z1 + 1.1; zz < z2 - 1.3; zz += rr(2.3, 3.0)) {
        const lit = rnd() < litP;
        const pts = q3(cam, [[10.4, y1, zz], [10.4, y1, zz + 1.2], [10.4, y1 + 1.8, zz + 1.2], [10.4, y1 + 1.8, zz]]);
        if (lit) { g += P(polyD(pts, 0.3), C.honey, `opacity="${f1(rr(0.55, 0.85))}"`); }
        else g += P(polyD(pts, 0.3), V[1]);
      }
    }
    for (const zz of [z1 + 2.5, (z1 + z2) / 2 + rr(-2, 2)]) { const a = cam.p(11.2, h + 1.1, zz), b = cam.p(11.2, h + 3.4, zz), w = cam.sz(0.85, zz); g += hrect(a[0] - w / 2, b[1], w, a[1] - b[1], V[1], 0.4) + ell(a[0], b[1], w * 0.6, w * 0.25, V[13]); }
    // its door (where the heat's branch turns in)
    const dz = z1 + 2.2; g += facadeX(cam, 10.4, dz, dz + 1.4, 0, 2.6, V[1]);
    return g;
  };
  const litP = mode === 'vision' ? 0.86 : 0.42;
  s += block(52, 67, 15.5, V[3], 32, litP) + block(41.5, 51.6, 16.6, V[2], 33, litP);
  // a lower old house nearer (its roof stays under the band), cut by the right edge
  s += block(17, 38.5, 10.2, V[3], 34, litP);
  // the corner turret between them: its window facing us is THE one warm window
  const tz = 40, tA = cam.p(10.1, 0, tz), tT = cam.p(10.1, 17.2, tz), tw = cam.sz(3.6, tz);
  s += hrect(tA[0] - tw / 2, tT[1], tw, tA[1] - tT[1], V[3], 0.8);
  s += hrect(tA[0] + tw * 0.1, tT[1], tw * 0.4, tA[1] - tT[1], V[2], 0.5, 'opacity="0.9"');
  const cap = cam.p(10.1, 19.6, tz);
  s += P(smoothD([[tA[0] - tw * 0.58, tT[1] + 2], [tA[0] - tw * 0.34, tT[1] - (tT[1] - cap[1]) * 0.5], [cap[0], cap[1]], [tA[0] + tw * 0.34, tT[1] - (tT[1] - cap[1]) * 0.5], [tA[0] + tw * 0.58, tT[1] + 2]], true), V[1]);
  s += S(smoothD([[tA[0] - tw * 0.52, tT[1]], [tA[0] - tw * 0.28, tT[1] - (tT[1] - cap[1]) * 0.48], [cap[0], cap[1] + 2]], false), V[12], 2.4, 'opacity="0.85"');
  const wy = (yy) => cam.p(10.1, yy, tz)[1];
  for (const [yy, lit, main] of [[4.4, mode === 'vision', false], [7.6, true, true], [10.8, mode === 'vision', false], [14, false, false]]) {
    const ww = tw * 0.4, top = wy(yy + 2.0), bot = wy(yy);
    s += win(tA[0] - ww / 2, top, ww, bot - top, {lit, glow: main ? 2.2 : 0.6, warm: main && o.stepWarmer ? C.honeyL : C.honey, core: main});
    if (main && o.windowFigure) s += person(tA[0] + ww * 0.12, bot - 2, (bot - top) * 0.95, {pose: o.windowFigure, coat: V[2], dark: V[2], hair: V[1], skin: V[3], scarf: V[2]});
  }
  // ---- the hall of giant computers at the quay's end (the vision), or the empty lot (the plan) ----
  const hz1 = 70;
  if (mode === 'vision') {
    let g = '';
    // the snow melted round its foot: a dark wet ring
    g += P(polyD([cam.p(-9, 0, hz1 - 3), cam.p(8.5, 0, hz1 - 3), cam.p(8.5, 0, hz1), cam.p(-9, 0, hz1)], 1), V[3]);
    g += faceZ(cam, hz1, -8.5, 8, 0, 14.5, V[1]);
    g += facadeX(cam, 8, hz1, hz1 + 30, 0, 14.5, V[0]);
    // its face: covered in the small cool lights of the giant computers inside, in rack-like columns (it reads as a
    // computer the size of a building), a faint cool glow over it
    g += faceZ(cam, hz1 - 0.02, -8.5, 8, 0, 14.5, '#dceef4', 'opacity="0.12" filter="url(#b4)"');
    for (let x = -8.1; x < 7.7; x += 0.42) {
      if (Math.abs(x) < 4.4 && true) { /* the door's columns are drawn below */ }
      if (((x + 8.1) / 0.42) % 5 > 3.6) continue;               // a gap between racks
      for (let y = 0.6; y < 14.1; y += 0.46) {
        if (Math.abs(x) < 4.3 && y < 8.9) continue;              // the door
        if (rnd() < 0.3) continue;
        const pp = cam.p(x, y, hz1 - 0.03);
        g += ell(pp[0], pp[1], 1.25, 1.25, '#eaf7fb', `opacity="${f1(rr(0.45, 0.95))}"`);
      }
    }
    // the big door, open on rows of giant computers (cool light, small lights)
    const d1 = cam.p(-4.2, 0, hz1), d2 = cam.p(4.2, 8.6, hz1);
    g += rect(d1[0] - 22, d2[1] - 16, d2[0] - d1[0] + 44, d1[1] - d2[1] + 22, '#eaf4f7', 'opacity="0.4" filter="url(#b14)"');
    g += hrect(d1[0], d2[1], d2[0] - d1[0], d1[1] - d2[1], '#d6e6ec', 0.4);
    for (let i = 0; i < 6; i++) { const xx = d1[0] + 9 + i * (d2[0] - d1[0] - 18) / 5, hh = (d1[1] - d2[1]) * (0.74 - Math.abs(i - 2.5) * 0.06), ww = 11; g += rect(xx - ww / 2, d1[1] - hh, ww, hh, V[1]); for (let k = 0; k < 8; k++) g += ell(xx + rr(-2, 2), d1[1] - hh + 5 + k * hh / 9, 1.3, 1.3, '#f6fdff'); }
    g += P(polyD([[d1[0], d1[1]], [d2[0], d1[1]], [d2[0] + 70, d1[1] + 40], [d1[0] - 70, d1[1] + 40]]), '#dfeef3', 'opacity="0.28" filter="url(#b8)"');
    // steam rolling off its roof into the snowing night, warm at its root
    const r1 = cam.p(-4, 14.5, hz1 + 6), r2 = cam.p(3.6, 14.5, hz1 + 12);
    g += steam(r1[0], r1[1], 220, 360, {warm: true, op: 0.85, lean: 0.1, n: 10, col: V[12], root: 0.25});
    g += steam(r2[0], r2[1], 170, 290, {warm: true, op: 0.75, lean: 0.2, n: 9, col: V[12], root: 0.25});
    s += g;
  } else {
    s += P(polyD([cam.p(-9, 0, hz1), cam.p(8.5, 0, hz1), cam.p(8.5, 0, 150), cam.p(-9, 0, 150)], 1), V[10]);
    for (let z = hz1; z < hz1 + 26; z += 2.6) { const a = cam.p(-9.4, 0, z), b = cam.p(-9.4, 1.2, z); s += S(lineD([a, b]), V[4], 1.6); }
    s += S(lineD([cam.p(-9.4, 1.0, hz1), cam.p(-9.4, 1.0, hz1 + 26)]), V[4], 1.2);
  }
  // the near snow (quiet, alive inside), footprints toward the hall
  s += P(smoothD([[-20, 1660], [200, 1636], [470, 1648], [720, 1628], [960, 1640], [1100, 1626], [1100, 1940], [-20, 1940]], true), V[4], 'opacity="0.85"');
  for (let i = 0; i < 12; i++) { const z = 3.0 + i * 0.6, p = cam.p(2.0 + (i % 2 ? 0.22 : -0.22), 0, z); s += ell(p[0], p[1], cam.sz(0.11, z), cam.sz(0.045, z), V[3], 'opacity="0.8"'); }
  // ---- the heat's line: a soft melted seam in the snow over the pipe, the warm showing through ----
  const lineX = -1.1;
  const zEnd = mode === 'vision' ? hz1 - 1 : 78;
  const pts = [];
  for (let z = 2.4; z <= zEnd; z *= 1.07) pts.push([lineX + Math.sin(z * 0.21) * 0.35, z]);
  pts.push([lineX, zEnd]);
  const seam = (half, col, ex, wob = 0.25) => {
    const tp = (z) => clamp(z / 5.5, 0.55, 1); const L = pts.map(([x, z]) => cam.p(x - half * tp(z) * (1 + rr(-wob, wob)), 0, z)), Rr = pts.map(([x, z]) => cam.p(x + half * tp(z) * (1 + rr(-wob, wob)), 0, z)).reverse();
    return P(smoothD(L.concat(Rr), true), col, ex);
  };
  s += seam(0.95, V[9], 'opacity="0.55"', 0.35);   // the wet snow at its edge, lighter
  s += seam(0.62, V[2], '', 0.3);                   // the melt: dark, wet
  s += seam(0.5, C.honey, 'opacity="0.4" filter="url(#b8)"', 0.2);
  // the warm pipe glimpsed through the slush: a thin warm core, broken by dark slush
  s += seam(0.2, C.honeyD, 'opacity="0.95"', 0.45);
  s += seam(0.085, C.honeyL, '', 0.55);
  for (let i = 0; i < pts.length; i++) { if (rnd() < 0.78) continue; const [x, z] = pts[i]; const p = cam.p(x + rr(-0.1, 0.1), 0, z), w = cam.sz(rr(0.08, 0.18), z) * clamp(z / 6, 0.5, 1); s += P(blobD(p[0], p[1], w, w * 0.28, 7, 0.45, rr(0, 3)), V[2], 'opacity="0.85"'); }
  // thin branches of melt to the far blocks' doors (the homes it reaches)
  for (const [zb, ok] of [[43.7, true], [53.6, true]]) {
    if (!ok || zb > zEnd) continue;
    const a = cam.p(lineX, 0, zb - 1.2), m = cam.p(4.5, 0, zb + 0.4), b = cam.p(10.2, 0, zb + 0.9);
    s += S(smoothD([a, m, b], false), V[3], cam.sz(0.26, zb), 'opacity="0.9"') + S(smoothD([a, m, b], false), C.honey, cam.sz(0.07, zb), 'opacity="0.85"');
  }
  // manholes on the line, puffing steam
  for (const zm of [9.5, 27, 52]) { if (zm > zEnd) continue; const m = cam.p(lineX + 0.1, 0, zm), w = cam.sz(0.75, zm); s += ell(m[0], m[1], w, w * 0.24, V[1]) + steam(m[0], m[1] - 2, w * 3, w * 8, {warm: true, op: 0.55, n: 6, col: V[12], lean: 0.12}); }
  // ---- the lamps hung on wires across the street (cool white) ----
  for (const z of [24, 42, 58]) {
    const a = cam.p(-9.3, 7.3, z), b = cam.p(10.4, 7.8, z), m = cam.p(0.6, 6.8, z);
    s += S(smoothD([a, m, b], false), V[3], 1.3, 'opacity="0.85"');
    const lw = cam.sz(0.7, z);
    s += ell(m[0], m[1] + lw * 0.5, lw * 2.4, lw * 1.5, '#f3f7f9', 'opacity="0.3" filter="url(#b14)"');
    s += P(polyD([[m[0] - lw / 2, m[1]], [m[0] + lw / 2, m[1]], [m[0] + lw * 0.32, m[1] + lw * 0.45], [m[0] - lw * 0.32, m[1] + lw * 0.45]]), V[2]) + ell(m[0], m[1] + lw * 0.48, lw * 0.32, lw * 0.13, '#ffffff');
    const pl = cam.p(-9.3, 0, z); s += S(lineD([pl, a]), V[2], cam.sz(0.16, z));
    // the lamp's pool on the snow, cool and faint
    const pc = cam.p(0.6, 0, z); s += ell(pc[0], pc[1], cam.sz(4, z), cam.sz(0.9, z), '#dfe7ec', 'opacity="0.16" filter="url(#b8)"');
  }
  // ---- the plan, pencilled over the empty lot (B8) ----
  if (mode === 'plan') {
    seed(77);
    const pz1 = hz1, pz2 = hz1 + 30, h = 13, c = (x, y, z) => cam.p(x, y, z);
    s += pencil([c(-8.5, 0, pz1), c(8, 0, pz1), c(8, h, pz1), c(-8.5, h, pz1), c(-8.5, 0, pz1)], 3.4);
    s += pencil([c(8, 0, pz1), c(8, 0, pz2), c(8, h, pz2), c(8, h, pz1)], 2.6, {op: 0.65});
    s += pencil([c(-3.4, 0, pz1), c(-3.4, 7.4, pz1), c(3.4, 7.4, pz1), c(3.4, 0, pz1)], 2.8, {op: 0.85});
    for (let i = 0; i < 4; i++) { const xx = -2.6 + i * 1.75; s += pencil([c(xx, 0.2, pz1 + 6), c(xx, 5.6, pz1 + 6)], 2, {op: 0.55}); }
    // the missing piece: a dashed pencil pipe from the city's line end to the drawn door
    s += pencil([c(lineX, 0, zEnd), c(lineX + 0.4, 0, 84), c(-0.4, 0, 88), c(0, 0, pz1)], 4.2, {dash: '16 11', op: 1});
    // the survey stake with its paper tag (the year)
    const stB = cam.p(-4.4, 0, 21), stT = cam.p(-4.4, 1.7, 21);
    s += S(lineD([stB, stT]), V[1], 4.2) + ell(stB[0], stB[1], 9, 3, V[3]);
    const tx = stT[0] + 10, ty = stT[1] + 2;
    s += S(lineD([[stT[0], stT[1] + 3], [tx + 3, ty + 6]]), V[2], 1.6);
    s += P(polyD([[tx, ty], [tx + 128, ty - 8], [tx + 133, ty + 70], [tx + 5, ty + 78]], 0.8), '#f4f2ea');
    s += `<text x="${tx + 68}" y="${ty + 54}" font-family="Gaegu" font-weight="700" font-size="52" text-anchor="middle" fill="${C.ink}" transform="rotate(-3.5 ${tx + 68} ${ty + 42})" class="ink">2027</text>`;
  }
  // ---- the resident walking home along the quay, from behind ----
  if (o.resident !== false) {
    const rp = o.residentPos || [2.2, 8.2];
    const f = cam.p(rp[0], 0, rp[1]);
    s += ell(f[0] + 4, f[1] + 1, cam.sz(0.55, rp[1]), cam.sz(0.12, rp[1]), V[3], 'opacity="0.6"');
    s += person(f[0], f[1], cam.sz(1.7, rp[1]), {pose: o.residentPose || 'walk', coat: V[1], dark: V[0], hair: V[0], skin: V[5], scarf: V[9], rim: C.honeyL});
  }
  s += snowfall(o.flakes || 300, 0, 1920);
  return s;
}

// ---------- B1: the warm line (the hook's landing frame, on "homes?") ----------
FRAMES.B1 = () => {
  let s = homeView({mode: 'vision', seed: 11});
  s += caption([
    {t: '70,000', x: 470, y: 470, size: 230, lit: true},
    {t: 'homes?', x: 760, y: 572, size: 116}
  ]);
  return svgPage(s);
};

// ======================================================================================
// THE HALL: inside a data center (B2-B5): an aisle between walls of giant computers, a high pale ceiling (the band)
// ======================================================================================
function hallAisle(o = {}) {
  // o.hot: the hot aisle (the machines' backs glowing); o.farDoor: the far door open on the snowy night
  seed(o.seed || 21);
  const cam = Cam(o.f || 950, 540, o.hz || 1080, 1.7);
  const ax = o.ax || 1.9, rh = o.rh || 2.9, z0 = o.z0 || 2.6, z1 = o.z1 || 48;
  let s = '';
  // the ceiling (pale, calm: the band) and the hall's upper walls, darkening toward the far wall
  s += `<linearGradient id="ceil" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1000"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.3" stop-color="${C.paper}"/><stop offset="0.6" stop-color="${C.paper}"/><stop offset="0.8" stop-color="${V[11]}"/><stop offset="1" stop-color="${V[8]}"/></linearGradient><rect x="0" y="0" width="${W}" height="${H}" fill="url(#ceil)"/>`;
  // ceiling beams and light strips, only past the band (converging)
  for (let z = 16; z < z1; z *= 1.22) { const a = cam.p(-14, 8.5, z), b = cam.p(14, 8.5, z); if (a[1] > 640) s += S(lineD([a, b]), V[10], cam.sz(0.25, z), 'opacity="0.7"'); }
  for (const x of [-1.2, 1.2]) { const a = cam.p(x, 8.3, 17), b = cam.p(x, 8.3, z1); s += S(lineD([a, b]), '#f7fbfc', 3, 'opacity="0.9"'); }
  // the upper side walls above the racks (mid), the far wall
  s += `<linearGradient id="wallg${o.seed || 21}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1100"><stop offset="0" stop-color="${C.paper}"/><stop offset="0.56" stop-color="${C.paper}"/><stop offset="0.72" stop-color="${V[10]}"/><stop offset="1" stop-color="${V[7]}"/></linearGradient>`;
  for (const sx of [-1, 1]) {
    s += P(polyD([cam.p(sx * ax, rh, z0), cam.p(sx * ax, rh, z1), cam.p(sx * ax, 8.5, z1), cam.p(sx * ax, 8.5, 2.6)], 1), `url(#wallg${o.seed || 21})`);
    // cable ladders and a row of small lights along the upper wall (structure, past the band)
    for (const yy of [rh + 1.6, rh + 2.4]) { const a = cam.p(sx * ax, yy, 7.5), b = cam.p(sx * ax, yy, z1); if (a[1] > 610) s += S(lineD([a, b]), V[6], 3, 'opacity="0.7"'); }
    for (let z = 8; z < z1; z *= 1.18) { const p = cam.p(sx * ax, rh + 3.2, z); if (p[1] > 640) s += ell(p[0], p[1], 2, 2, '#f4fafc', 'opacity="0.8"'); }
  }
  // the far wall and its door open on the night (snow, a few warm windows: where the heat could go)
  s += faceZ(cam, z1, -ax - 0.1, ax + 0.1, 0, 8.5, V[8]);
  if (o.farDoor !== false) {
    const d1 = cam.p(-1.4, 0, z1), d2 = cam.p(1.4, 3.4, z1);
    s += hrect(d1[0], d2[1], d2[0] - d1[0], d1[1] - d2[1], V[4], 0.4);
    s += hrect(d1[0], d1[1] - (d1[1] - d2[1]) * 0.28, d2[0] - d1[0], (d1[1] - d2[1]) * 0.28, V[11], 0.3);
    for (let i = 0; i < 6; i++) s += rect(d1[0] + rr(4, d2[0] - d1[0] - 6), d2[1] + rr(8, (d1[1] - d2[1]) * 0.5), 2.6, 2.6, C.honey);
    for (let i = 0; i < 10; i++) s += ell(rr(d1[0], d2[0]), rr(d2[1], d1[1]), 1.1, 1.1, '#ffffff', 'opacity="0.8"');
  }
  // cable trays over the racks (dark, converging)
  for (const sx of [-1, 1]) { const zs = (yy) => Math.max(z0 + 1, cam.f * (yy - 1.7) / (cam.hz - 615)); const a = cam.p(sx * (ax - 0.4), rh + 0.6, zs(rh + 0.6)), b = cam.p(sx * (ax - 0.4), rh + 0.6, z1); s += S(lineD([a, b]), V[3], 7, 'opacity="0.9"'); const c = cam.p(sx * (ax + 0.2), rh + 1.1, zs(rh + 1.1)), d = cam.p(sx * (ax + 0.2), rh + 1.1, z1); s += S(lineD([c, d]), V[4], 5, 'opacity="0.8"'); }
  // the floor: raised tiles, light, the racks' lights reflected
  s += P(polyD([cam.p(-ax, 0, z0), cam.p(-ax, 0, z1), cam.p(ax, 0, z1), cam.p(ax, 0, z0)]), o.hot ? V[7] : V[10]);
  for (let z = z0; z < z1; z *= 1.16) s += S(lineD([cam.p(-ax, 0, z), cam.p(ax, 0, z)]), V[8], 1.4, 'opacity="0.7"');
  for (const x of [-ax / 2, 0, ax / 2]) s += S(lineD([cam.p(x, 0, z0), cam.p(x, 0, z1)]), V[8], 1.4, 'opacity="0.7"');
  // the two walls of giant computers (their fronts, or their glowing backs in the hot aisle)
  for (const side of [-1, 1]) {
    const X = side * ax;
    for (let z = z0; z < z1 - 0.6; z += 0.72) {
      const zz = z + 0.66;
      const q = q3(cam, [[X, 0, z], [X, 0, zz], [X, rh, zz], [X, rh, z]]);
      s += P(polyD(q, 0.3), V[o.hot ? 2 : 1]);
      const inner = q3(cam, [[X, 0.12, z + 0.05], [X, 0.12, zz - 0.05], [X, rh - 0.1, zz - 0.05], [X, rh - 0.1, z + 0.05]]);
      if (o.hot) {
        // the backs: grilles glowing with the heat (the warm accent), dimmer far away
        const k = clamp(1.25 - z / 26, 0.35, 1);
        s += P(polyD(inner, 0.3), C.honey, `opacity="${f1(0.55 * k + 0.25)}"`);
        for (let yy = 0.3; yy < rh - 0.2; yy += 0.22) s += S(lineD([cam.p(X, yy, z + 0.06), cam.p(X, yy, zz - 0.06)]), C.honeyD, cam.sz(0.05, z), `opacity="${f1(0.8 * k)}"`);
      } else {
        s += P(polyD(inner, 0.3), V[2]);
        // rows of small lights on each computer's door
        for (let yy = 0.35; yy < rh - 0.2; yy += 0.17) if (rnd() < 0.8) { const p = cam.p(X, yy, z + 0.12 + rr(0, 0.25)), r = Math.max(0.9, cam.sz(0.022, z)); s += ell(p[0], p[1], r, r, '#e4f3f8', `opacity="${f1(rr(0.45, 1))}"`); }
      }
      s += S(lineD([cam.p(X, 0, z), cam.p(X, rh, z)]), V[0], Math.max(0.8, cam.sz(0.03, z)), 'opacity="0.8"');
    }
    // the light the rack lights throw on the floor (cool streaks), or the heat's glow on the floor
    const fl = q3(cam, [[side * ax * 0.98, 0, z0], [side * ax * 0.98, 0, z1], [side * ax * 0.55, 0, z1], [side * ax * 0.55, 0, z0]]);
    s += P(polyD(fl), o.hot ? C.honey : '#eaf5f9', `opacity="${o.hot ? 0.28 : 0.18}" filter="url(#b8)"`);
  }
  return {s, cam, ax, rh, z0, z1};
}

// ---------- B2: a cathedral of computers ----------
FRAMES.B2 = () => {
  const h = hallAisle({seed: 21, z1: 52});
  let s = h.s;
  const cam = h.cam;
  // the technician walking small down the aisle, pushing a cart
  const f = cam.p(0.35, 0, 15), hp = cam.sz(1.7, 15);
  s += ell(f[0], f[1] + 1, hp * 0.22, hp * 0.04, V[6], 'opacity="0.6"');
  s += person(f[0], f[1], hp, {pose: 'walk', coat: V[3], dark: V[1], hair: V[1], skin: V[6], scarf: V[8]});
  const c1 = cam.p(0.9, 0, 15.4), c2 = cam.p(1.5, 1.0, 15.4);
  s += hrect(c1[0], c2[1], c2[0] - c1[0], c1[1] - c2[1] - 3, V[4], 0.4) + rect(c1[0] - 4, c2[1], 4, (c1[1] - c2[1]) * 0.6, V[3]);
  // snow blown in over the threshold behind us: drifts on the floor, flakes in the near air
  s += P(smoothD([[-20, 1700], [160, 1668], [360, 1690], [520, 1676], [700, 1694], [900, 1664], [1100, 1688], [1100, 1940], [-20, 1940]], true), V[12]);
  s += P(smoothD([[-20, 1780], [240, 1754], [540, 1774], [820, 1748], [1100, 1770], [1100, 1940], [-20, 1940]], true), V[11], 'opacity="0.8"');
  for (const x of [430, 470, 610, 650]) s += S(lineD([[x + (x - 540) * 0.6, 1940], [x, 1690]]), V[9], 6, 'opacity="0.7"');
  s += snowfall(70, 1100, 1920, {rmax: 6}) + snowfall(40, 600, 1100, {rmax: 3, op: 0.6});
  s += caption([{t: 'giant computers,', x: 520, y: 400, size: 112}, {t: 'data centers.', x: 560, y: 528, size: 112}]);
  return svgPage(s);
};

// ---------- B3: too hot for snow ----------
FRAMES.B3 = () => {
  const h = hallAisle({seed: 23, hot: true, z1: 30, ax: 1.5, farDoor: false, hz: 1060});
  let s = h.s;
  const cam = h.cam;
  // the air shimmering up to the vents: soft warm haze rising off both walls
  for (let i = 0; i < 18; i++) { const sx = rnd() < 0.5 ? -1 : 1, z = rr(4, 22), a = cam.p(sx * 1.25, rr(0.8, 2.2), z), w = cam.sz(rr(0.25, 0.5), z), hh = cam.sz(rr(1.2, 2.4), z); s += P(blobD(a[0], a[1] - hh / 2, w, hh / 2, 8, 0.3), C.honeyC, 'opacity="0.22" filter="url(#b8)"'); }
  // the vents in the ceiling, past the band
  for (let z = 9; z < 28; z += 4.5) { const a = cam.p(-0.7, 8.4, z), b = cam.p(0.7, 8.4, z + 1.2); s += hrect(a[0], b[1], b[0] - a[0], Math.max(4, a[1] - b[1]), V[6], 0.5); }
  // the technician in the middle of the hot aisle, pulling off her beanie, her hair lifting
  const f = cam.p(0.1, 0, 7.4), hp = cam.sz(1.7, 7.4);
  s += ell(f[0], f[1] + 2, hp * 0.22, hp * 0.04, C.honeyD, 'opacity="0.45"');
  s += person(f[0], f[1], hp, {pose: 'beanie', coat: V[2], dark: V[1], hair: V[1], skin: V[7], scarf: V[9], rim: C.honeyL});
  // her hair lifting in the hot draught: a few loose strands rising
  s += S(smoothD([[f[0] - 4, f[1] - hp * 0.97], [f[0] - 10, f[1] - hp * 1.04], [f[0] - 6, f[1] - hp * 1.09]], false), V[1], 3) + S(smoothD([[f[0] + 5, f[1] - hp * 0.98], [f[0] + 9, f[1] - hp * 1.05], [f[0] + 3, f[1] - hp * 1.1]], false), V[1], 3);
  // snowflakes blown in behind us turn to drops and little puffs before they reach the machines
  for (let i = 0; i < 16; i++) { const x = rr(60, 1020), y = rr(640, 1250); const melt = y > 900; s += melt ? ell(x, y, 2.4, 3.4, '#f1f3f6', 'opacity="0.8"') + ell(x, y - 8, 9, 6, '#ffffff', 'opacity="0.35" filter="url(#b4)"') : ell(x, y, 3.2, 3.2, '#ffffff', 'opacity="0.9"'); }
  s += caption([{t: 'really', x: 340, y: 380, size: 112}, {t: 'hot.', x: 600, y: 520, lit: true, size: 170}]);
  return svgPage(s);
};

// ---------- B4: forty kettles in one ----------
function kettleCabinet(x, y, w, h, opts = {}) {
  // one giant computer, its front door swung wide: 8 shelves of 5 boiling kettles inside
  const {open = true, steamOn = true} = opts;
  let s = '';
  s += hrect(x - 12, y - 14, w + 24, h + 20, V[0], 1);                // the cabinet's body
  s += hrect(x, y, w, h, V[2], 0.8);                                   // its inside, lit a little by the heat
  s += rect(x, y, w, h, C.honey, 'opacity="0.12"');
  const rows = 8, cols = 5, ch = h / rows, cw = w / cols;
  for (let r = 0; r < rows; r++) {
    const sy = y + (r + 1) * ch;
    s += rect(x + 4, sy - 7, w - 8, 7, V[4]);                          // the shelf (a tray)
    for (let c = 0; c < cols; c++) s += kettle(x + (c + 0.5) * cw + rr(-2, 2), sy - 7, ch * 0.72, {steamOn: false, dir: 1});
  }
  // forty spouts' steam rising into one cloud over the cabinet
  if (steamOn) {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const sx = x + (c + 0.5) * cw - ch * 0.3, sy = y + (r + 1) * ch - 7 - ch * 0.6; s += ell(sx, sy, ch * 0.18, ch * 0.12, '#f4f5f7', 'opacity="0.55" filter="url(#b4)"'); }
    s += steam(x + w * 0.5, y - 10, w * 1.25, 260, {n: 9, col: '#eef0f3', op: 0.85, warm: true, root: 0.2});
    s += steam(x + w * 0.2, y + 10, w * 0.6, 200, {n: 6, col: '#eef0f3', op: 0.6});
    s += steam(x + w * 0.85, y + 10, w * 0.6, 220, {n: 6, col: '#eef0f3', op: 0.6, lean: 0.1});
  }
  // the door swung open toward us on the left hinge (its inner face dark, its lights dead)
  if (open) {
    s += P(polyD([[x - 12, y - 14], [x - 12 - w * 0.42, y + 40], [x - 12 - w * 0.42, y + h - 30], [x - 12, y + h + 6]], 1), V[1]);
    s += P(polyD([[x - 20, y + 6], [x - 8 - w * 0.4, y + 52], [x - 8 - w * 0.4, y + h - 42], [x - 20, y + h - 10]], 1), V[3]);
    for (let i = 0; i < 12; i++) s += S(lineD([[x - 22, y + 30 + i * (h - 60) / 12], [x - 10 - w * 0.38, y + 64 + i * (h - 110) / 12]]), V[2], 2, 'opacity="0.7"');
  }
  return s;
}
FRAMES.B4 = () => {
  seed(41);
  const cam = Cam(950, 540, 1080, 1.7);
  let s = '';
  // the cold aisle behind: the ceiling (the band), the rows receding to the right, dark with small lights
  s += `<linearGradient id="ceil4" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1100"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.27" stop-color="${C.paper}"/><stop offset="0.56" stop-color="${C.paper}"/><stop offset="0.75" stop-color="${V[11]}"/><stop offset="1" stop-color="${V[9]}"/></linearGradient><rect x="0" y="0" width="${W}" height="${H}" fill="url(#ceil4)"/>`;
  s += rect(0, 1080, W, 840, V[9]);
  for (let i = 0; i < 9; i++) { const x = 820 + i * 34, hh = 380 - i * 22; s += rackFront(x, 1080 - hh * 0.62, 30, hh, {lights: true, density: 0.6}); }
  for (let i = 0; i < 6; i++) { const x = 40 - i * 4 + i * 26, hh = 330 - i * 26; s += rackFront(x - 10, 1080 - hh * 0.62, 24, hh, {lights: true, density: 0.5}); }
  // the floor's tiles
  for (let k = 0; k < 8; k++) s += S(lineD([[0, 1120 + k * k * 9], [W, 1120 + k * k * 9]]), V[10], 1.5, 'opacity="0.8"');
  // the open giant computer: forty kettles
  s += kettleCabinet(330, 700, 470, 760);
  // its glow on the floor in front (the heat)
  s += ell(565, 1490, 330, 46, C.honey, 'opacity="0.25" filter="url(#b14)"');
  // the technician leaning back to take it in (a step behind, to the right)
  s += person(905, 1478, 330, {pose: 'awe', coat: V[3], dark: V[1], hair: V[1], skin: V[7], scarf: V[9], dir: -1, rim: C.honeyL});
  s += snowfall(18, 640, 1500, {rmax: 3, op: 0.5});
  s += caption([{t: '40', x: 470, y: 500, lit: true, size: 250}, {t: 'kettles,', x: 760, y: 572, size: 112}]);
  return svgPage(s);
};

// ======================================================================================
// B9: a drawn door opens. The pencil hall close: its big drawn door slides open on warm light; she leans in
// ======================================================================================
FRAMES.B9 = () => {
  seed(91);
  let s = '';
  s += `<linearGradient id="sky9" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1300"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.22" stop-color="${C.paper}"/><stop offset="0.46" stop-color="${C.paper}"/><stop offset="0.58" stop-color="${V[9]}"/><stop offset="1" stop-color="${V[5]}"/></linearGradient><rect x="0" y="0" width="${W}" height="1300" fill="url(#sky9)"/>`;
  // the harbour's dark water and ice behind the lot
  s += P(polyD([[0, 1230], [W, 1230], [W, 1300], [0, 1300]]), V[4]);
  // the snowy lot
  s += P(polyD([[0, 1290], [W, 1290], [W, H], [0, H]]), V[6]);
  s += P(polyD([[0, 1420], [W, 1420], [W, H], [0, H]]), V[5]);
  // the drawn hall: pale pencil lines on the night (its walls, its roofline, construction lines)
  const L = 70, R = 1010, T = 640, B = 1300;
  s += pencil([[L, B], [L, T], [R, T], [R, B]], 4.2);
  s += pencil([[L - 30, T + 2], [R + 40, T - 2]], 2, {op: 0.45});
  s += pencil([[L + 2, T + 120], [R - 2, T + 120]], 2, {op: 0.4, dash: '18 14'});
  for (let x = L + 110; x < R; x += 150) s += pencil([[x, T + 8], [x, T + 112]], 1.6, {op: 0.35});
  // the big sliding door, slid open: the opening full of warm light, the painted inside
  const dL = 300, dR = 760, dT = 820, dB = 1300;
  s += rect(dL - 60, dT - 50, dR - dL + 120, dB - dT + 60, C.honeyL, 'opacity="0.55" filter="url(#b40)"');
  s += hrect(dL, dT, dR - dL, dB - dT, C.honeyC, 0.6);
  s += rect(dL, dT, dR - dL, dB - dT, C.honeyL, 'opacity="0.45"');
  // inside: the first giant computers as soft dark shapes against the light, their pipes warm
  for (let i = 0; i < 5; i++) { const x = dL + 50 + i * 85, hh = 300 - Math.abs(i - 2) * 30; s += hrect(x, dB - hh, 54, hh, V[6], 0.6, 'opacity="0.75"'); s += S(lineD([[x + 27, dB - hh], [x + 27, dB - hh - 40], [x + 120, dB - hh - 40]]), C.honey, 6, 'opacity="0.8"'); }
  s += pencil([[dL, dB], [dL, dT], [dR, dT], [dR, dB]], 4);
  // the door leaf slid aside (drawn), its rail
  s += pencil([[dR + 12, dT + 6], [dR + 330, dT + 6], [dR + 330, dB], [dR + 12, dB]], 3.4);
  s += pencil([[dL - 40, dT - 18], [dR + 380, dT - 18]], 2.4, {op: 0.7});
  // the light spilling out over the snow (a widening pool)
  s += P(polyD([[dL, dB], [dR, dB], [dR + 210, 1920], [dL - 210, 1920]]), C.honeyL, 'opacity="0.38" filter="url(#b14)"');
  s += P(polyD([[dL + 40, dB], [dR - 40, dB], [dR + 110, 1920], [dL - 110, 1920]]), C.honeyC, 'opacity="0.25"');
  // the resident small at the threshold, leaning in, a long shadow behind her toward us
  s += P(polyD([[520, 1330], [560, 1330], [640, 1920], [440, 1920]]), V[2], 'opacity="0.55"');
  s += person(540, 1332, 300, {pose: 'lean', coat: V[1], dark: V[0], hair: V[0], skin: V[3], scarf: V[4], rim: C.honeyC});
  s += snowfall(200, 0, 1920);
  s += caption([{t: 'So how would', x: 470, y: 400, size: 112}, {t: 'that work?', x: 610, y: 522, size: 112}]);
  return svgPage(s);
};

// ======================================================================================
// B11: under the snow, into a home. The street before a Jugendstil block: a soft warm seam opens along the street over
// the pipe; a tram slides over it; the pipe climbs the wall in a soft thaw to the radiator under one window
// ======================================================================================
FRAMES.B11 = () => {
  seed(111);
  let s = '';
  s += `<linearGradient id="sky11" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1200"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.24" stop-color="${C.paper}"/><stop offset="0.5" stop-color="${C.paper}"/><stop offset="0.62" stop-color="${V[10]}"/><stop offset="1" stop-color="${V[7]}"/></linearGradient><rect x="0" y="0" width="${W}" height="1200" fill="url(#sky11)"/>`;
  // the block: its facade front-on, cut by the right edge; a steep snowy roof under the band
  const fx = 300, ft = 690, fb = 1300;
  s += hrect(fx, ft, W - fx + 20, fb - ft, V[3], 1);
  s += P(polyD([[fx - 20, ft + 4], [fx + 60, ft - 70], [W + 20, ft - 70], [W + 20, ft + 4]], 1), V[1]);
  s += S(lineD([[fx - 10, ft - 2], [fx + 64, ft - 66], [W + 20, ft - 66]]), V[12], 5);
  s += hrect(fx, fb - 120, W - fx + 20, 120, V[4], 1);  // the granite base
  // a neighbour block to the left, lower and farther (shoulder to shoulder)
  s += hrect(-20, 860, fx + 20, 440, V[2], 1) + P(polyD([[-20, 862], [-20, 820], [fx, 820], [fx, 862]], 1), V[1]);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) s += win(20 + c * 70, 900 + r * 110, 34, 60, {lit: rnd() < 0.5, glow: 0.4, core: false});
  // the facade's windows: a few lit, THE one window (third floor) the warmest, the radiator glowing under its sill
  const cols = [380, 560, 740, 920];
  for (let r = 0; r < 3; r++) for (const cx of cols) {
    const wy = 760 + r * 160, main = r === 1 && cx === 560;
    if (main) continue;
    s += win(cx - 32, wy, 64, 100, {lit: rnd() < 0.45, glow: 0.5, core: false});
  }
  const mx = 528, my = 920, mw = 64, mh = 100;
  s += win(mx, my, mw, mh, {lit: true, glow: 2.2});
  // the radiator under the sill, seen through the lower pane: warm fins (the heat arrived)
  for (let i = 0; i < 7; i++) s += rect(mx + 6 + i * 8, my + mh - 30, 5, 24, C.honeyD, 'opacity="0.9"');
  s += person(mx + 44, my + mh - 4, 74, {pose: 'stand', coat: V[3], dark: V[3], hair: V[2], skin: V[4], scarf: V[3]});
  // the soft thaw climbing the wall from the street to that radiator: the frost melted off the plaster over the riser
  s += meltSeam([[560, 1300], [556, 1200], [566, 1120], [558, 1040], [560, my + mh + 4]], [15, 11], {rim: true});
  // the street: snow, the tram rails, the kerb, and the soft seam over the pipe running along it and in to the wall
  s += P(polyD([[0, 1300], [W, 1300], [W, H], [0, H]]), V[7]);
  s += P(polyD([[0, 1420], [W, 1420], [W, H], [0, H]]), V[6]);
  s += P(polyD([[0, 1600], [W, 1600], [W, H], [0, H]]), V[5]);
  for (const y of [1352, 1378, 1452, 1490]) s += S(lineD([[0, y], [W, y]]), V[4], 3, 'opacity="0.7"');
  // the green tram sliding along the street (left): its long body, the cream window band lit cool, the pantograph on
  // the wire, the route box at its nose
  s += P(smoothD([[-80, 1110], [250, 1104], [318, 1112], [346, 1150], [352, 1330], [-80, 1336]], true), V[4]);
  s += P(polyD([[-80, 1140], [330, 1136], [346, 1160], [346, 1236], [-80, 1240]], 0.8), V[9]);
  for (let i = 0; i < 5; i++) s += hrect(-60 + i * 78, 1152, 60, 74, '#dbe8ee', 0.6, 'opacity="0.9"');
  s += hrect(304, 1150, 34, 80, '#e3eef2', 0.5) + hrect(270, 1112, 46, 22, V[2], 0.4) + rect(278, 1116, 30, 14, '#eef4f6');
  s += P(polyD([[-80, 1300], [352, 1296], [352, 1336], [-80, 1340]], 0.6), V[2]);
  s += S(lineD([[120, 1104], [150, 1052], [200, 1104]]), V[1], 4) + S(lineD([[150, 1052], [130, 1030], [230, 1030]]), V[1], 3);
  s += S(lineD([[-60, 1030], [W, 1018]]), V[3], 2);
  s += ell(330, 1250, 14, 7, '#f6fbfd') + ell(330, 1250, 40, 20, '#f2f7f9', 'opacity="0.35" filter="url(#b8)"');
  // the seam: the snow melted open along the street over the pipe, the warm showing through, turning in to the wall
  const seamPts = [[-30, 1700], [180, 1680], [360, 1640], [470, 1560], [540, 1420], [560, 1312]];
  s += meltSeam(seamPts, [64, 22]);
  // the manhole on the seam, steaming; a dog sniffing it
  s += ell(330, 1660, 50, 14, V[1]) + steam(330, 1650, 120, 230, {warm: true, col: V[12], op: 0.6, n: 7, lean: 0.12});
  s += dog(452, 1700, 70, V[1], -1);
  s += snowfall(240, 0, 1920);
  s += caption([{t: 'pipes under the streets', x: 540, y: 400, size: 100}, {t: "into people's homes.", x: 560, y: 522, size: 104}]);
  return svgPage(s);
};

// ---------- B5: one cup (her toast to the forty kettles) ----------
FRAMES.B5 = () => {
  seed(51);
  let s = '';
  s += `<linearGradient id="ceil5" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1100"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.27" stop-color="${C.paper}"/><stop offset="0.55" stop-color="${C.paper}"/><stop offset="0.75" stop-color="${V[11]}"/><stop offset="1" stop-color="${V[9]}"/></linearGradient><rect x="0" y="0" width="${W}" height="${H}" fill="url(#ceil5)"/>`;
  // the aisle behind her: dark computers with small lights receding left
  for (let i = 0; i < 7; i++) { const hh = 420 - i * 40; s += rackFront(20 + i * 52, 1120 - hh * 0.66, 46, hh, {density: 0.6}); }
  s += rect(0, 1110, W, 810, V[10]);
  for (let k = 0; k < 7; k++) s += S(lineD([[0, 1140 + k * k * 11], [W, 1140 + k * k * 11]]), V[9], 1.4, 'opacity="0.8"');
  // the open cabinet of forty kettles (right), steaming; its warmth on the floor
  s += kettleCabinet(500, 690, 500, 790, {open: false});
  s += ell(740, 1500, 330, 40, C.honey, 'opacity="0.22" filter="url(#b14)"');
  // her, seated on a stool, raising ONE mug to the wall of kettles (a toast)
  s += ell(300, 1572, 170, 22, V[7], 'opacity="0.6"');
  s += personProfile(250, 1570, 980, {pose: 'sit-toast', mug: true, coat: V[4], coatL: V[5], hair: V[1], skin: V[9], boot: V[2], rim: C.honeyL});
  s += caption([{t: "That's a lot", x: 500, y: 400, size: 112}, {t: 'of tea.', x: 640, y: 522, size: 112}]);
  return svgPage(s);
};
// ======================================================================================
// B6: snow falling up. On a data center's roof at night: one big fan near us (and its neighbours behind) blows the
// heat straight up; the warm air lifts the falling snow back up into the dark and is gone; far off, other halls do the
// same; on the horizon, Helsinki's small warm lights
// ======================================================================================
FRAMES.B6 = () => {
  seed(61);
  let s = '';
  // the band stays the light calm field; under it a big, deep, quiet night sky for the warmth to vanish into
  s += `<linearGradient id="sky6" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1292"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.22" stop-color="${C.paper}"/><stop offset="0.45" stop-color="${C.paper}"/><stop offset="0.52" stop-color="${V[9]}"/><stop offset="0.62" stop-color="${V[4]}"/><stop offset="0.9" stop-color="${V[3]}"/><stop offset="1" stop-color="${V[5]}"/></linearGradient><rect x="0" y="0" width="${W}" height="1294" fill="url(#sky6)"/>`;
  // far below and away: the snowy land, a dark forest belt, two far halls breathing their warmth away; Helsinki's lights
  s += P(polyD([[0, 1290], [W, 1290], [W, 1322], [0, 1322]]), V[8]);
  s += P(smoothD([[0, 1294], [150, 1282], [320, 1290], [480, 1280], [660, 1288], [840, 1282], [1080, 1288], [1080, 1304], [0, 1306]], true), V[2]);
  for (const [x, w] of [[96, 46], [236, 30]]) { s += hrect(x - w / 2, 1270, w, 14, V[1], 0.4) + rect(x - w / 2 + 4, 1272, w - 8, 2, C.honey, 'opacity="0.6"'); s += warmAir(x, 1270, w * 1.3, 300, {op: 0.55, lean: 0.06, n: 6}); }
  for (let i = 0; i < 46; i++) s += rect(rr(700, 1070), rr(1282, 1296), 2.2, 2, C.honey, `opacity="${f1(rr(0.45, 1))}"`);
  // the roof: its far parapet with snow, the deck dark and wet where the fan's warmth melts it
  s += P(polyD([[0, 1318], [W, 1318], [W, H], [0, H]]), V[4]);
  s += P(polyD([[0, 1318], [W, 1318], [W, 1346], [0, 1346]]), V[2]) + S(lineD([[0, 1318], [W, 1318]]), V[12], 5);
  for (const [y1, col] of [[1420, V[3]], [1640, V[2]]]) s += P(polyD([[0, y1], [W, y1 - 12], [W, H], [0, H]], 2), col);
  for (let i = 0; i < 9; i++) { const y = rr(1380, 1880); s += P(blobD(rr(0, W), y, rr(40, 130) * (y / 1300), rr(6, 14) * (y / 1300), 8, 0.3), V[6], 'opacity="0.4"'); }
  // one far fan at the roof's far edge, small, breathing faintly (the row goes on)
  { const cx = 900, cy = 1352, rx = 74, ry = rx * 0.26; s += ell(cx, cy + rx * 0.42, rx * 1.06, ry * 1.06, V[2]) + P(polyD([[cx - rx * 1.06, cy], [cx + rx * 1.06, cy], [cx + rx * 1.06, cy + rx * 0.42], [cx - rx * 1.06, cy + rx * 0.42]], 0.4), V[2]) + fan(cx, cy, rx, ry, {ring: V[4], inner: V[1], blade: V[7]}); s += warmAir(cx, cy - 4, rx * 1.2, 230, {op: 0.5, n: 6}); }
  // THE near fan: big, its housing, its blades turning, its mouth glowing with the heat
  const cx = 470, cy = 1572, rx = 330, ry = rx * 0.27, dh = rx * 0.4;
  s += ell(cx, cy + dh + ry * 0.4, rx * 1.4, ry * 1.6, V[1], 'opacity="0.75"');
  s += P(polyD([[cx - rx * 1.06, cy], [cx + rx * 1.06, cy], [cx + rx * 1.06, cy + dh], [cx - rx * 1.06, cy + dh]], 0.6), V[2]);
  s += ell(cx, cy + dh, rx * 1.06, ry * 1.06, V[2]);
  s += S(lineD([[cx - rx * 1.06, cy + dh * 0.5], [cx + rx * 1.06, cy + dh * 0.5]]), V[3], 2, 'opacity="0.7"');
  s += hotFan(cx, cy, rx, ry, {ring: V[4], blade: V[1]});
  // the warm air: honey at the mouth, a clear warm shimmer climbing, thinning to nothing in the dark
  const top = 690, hh = cy - top;
  s += warmAir(cx, cy - ry * 0.6, rx * 1.15, hh, {op: 1.0, lean: 0.02, n: 11, root: C.honey});
  // the snow lifted inside it: bright, clear streaks curving up, the higher the fainter; everywhere else it falls
  for (let i = 0; i < 80; i++) {
    const t = Math.pow(rnd(), 0.85), y = cy - ry - 16 - t * (hh - 70);
    const half = rx * (0.6 + 0.5 * t), x = cx + rr(-half, half) * 0.9;
    s += flakeMove(x, y, rr(2.8, 4.6) * (1.1 - t * 0.35), rr(18, 34) * (1.1 - t * 0.4), -1, 0.97 - t * 0.6, rr(-8, 8));
  }
  // her, small beside the fan, looking up as the warmth goes; the warm air tugging her coat
  s += ell(866, 1514, 50, 9, V[2], 'opacity="0.6"');
  s += fig(866, 1510, 178, {view: 'back', arms: [[10, 4], [8, 6]], coat: V[1], coatL: V[3], hair: V[0], skin: V[5], scarf: V[8], rim: C.honeyL, rimSide: -1, hairLift: 0.35});
  // the snow falling where the heat isn't (kept out of the warm column)
  { let g = ''; for (let i = 0; i < 210; i++) { const x = rr(0, W), y = rr(610, 1920); const t = clamp((cy - y) / hh, 0, 1), half = rx * (0.6 + 0.5 * t) + 34; if (y < cy && y > top - 40 && Math.abs(x - cx) < half) continue; const r = rr(1.4, 3.8); g += ell(x, y, r, r * rr(0.85, 1.1), '#f4f5f7', `opacity="${f1(rr(0.35, 0.8))}"`); } s += g; }
  s += caption([{t: 'big fans', x: 380, y: 400, size: 112}, {t: 'blow that heat outside.', x: 545, y: 522, size: 100}]);
  return svgPage(s);
};

// ======================================================================================
// B10: cool in, honey out. Inside the drawn hall on the snowy lot: its walls and roof are only pencil lines, so the
// night, the falling snow and the city's warm windows show through them; the machines inside are painted. The nearest
// stands open: a cold, frosted pipe brings cool water in at its foot, winds over every shelf of chips and leaves warm at
// its top; every machine's warm pipe joins one big warm pipe that runs out through the drawn wall toward the city.
// ======================================================================================
FRAMES.B10 = () => {
  seed(101);
  const cam = Cam(950, 540, 1080, 1.7);
  let s = '';
  s += `<linearGradient id="sky10" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1082"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.27" stop-color="${C.paper}"/><stop offset="0.55" stop-color="${C.paper}"/><stop offset="0.7" stop-color="${V[10]}"/><stop offset="1" stop-color="${V[7]}"/></linearGradient><rect x="0" y="0" width="${W}" height="1082" fill="url(#sky10)"/>`;
  // seen through the drawn walls: the harbour and the icebreaker far left, the city's blocks and warm windows right
  s += P(polyD([[0, 1082], [0, 1050], [200, 1046], [380, 1056], [380, 1082]], 1), V[5]);
  s += faceZ(cam, 70, -40, -22, 0, 12, V[11]) + faceZ(cam, 70, -40, -20, -1, 4, V[2]);
  for (let i = 0; i < 4; i++) { const x1 = 18 + i * 13; s += faceZ(cam, 64, x1, x1 + 12, 0, 15 + rr(-2, 2), V[2 + (i % 2)]); for (let k = 0; k < 12; k++) { const p = cam.p(x1 + rr(1, 11), rr(3, 13), 64); s += rect(p[0], p[1], 4, 6, rnd() < 0.65 ? C.honey : V[1], 'opacity="0.9"'); } }
  // the snowy lot (the hall's floor) with the pencil floor lines
  s += P(polyD([[0, 1080], [W, 1080], [W, H], [0, H]]), V[8]);
  for (const [y1, col] of [[1250, V[7]], [1460, V[6]], [1700, V[5]]]) s += P(polyD([[0, y1], [W, y1 - 10], [W, H], [0, H]], 2), col);
  seed(102);
  for (let z = 5; z < 60; z *= 1.32) s += pencil([cam.p(-9, 0, z), cam.p(9, 0, z)], 1.6, {col: V[11], op: 0.5});
  for (const x of [-9, 9]) s += pencil([cam.p(x, 0, 3.4), cam.p(x, 0, 60)], 2.6, {op: 0.8});
  // the drawn walls and roof: pencil only (the night shows through)
  const H1 = 10;
  for (const x of [-9, 9]) { s += pencil([cam.p(x, H1, 5.2), cam.p(x, H1, 60)], 3, {op: 0.85}); for (let z = 8; z < 60; z *= 1.35) s += pencil([cam.p(x, 0, z), cam.p(x, H1, z)], 1.8, {op: 0.55}); }
  s += pencil([cam.p(-9, 0, 60), cam.p(-9, H1, 60), cam.p(9, H1, 60), cam.p(9, 0, 60)], 2.4, {op: 0.7});
  for (let z = 9; z < 60; z *= 1.4) s += pencil([cam.p(-9, H1, z), cam.p(9, H1, z)], 1.6, {op: 0.45});
  // rows of giant computers behind, front-on, each with its pipes: cool in low, warm out high
  for (const z of [26, 19, 14, 10]) for (const x1 of [-6.6, -3.2, 0.8, 4.2]) {
    if (z === 10 && x1 < 0) continue;
    const w = 1.5, hh = 2.8;
    s += faceZ(cam, z, x1, x1 + w, 0, hh, V[1]);
    s += faceZ(cam, z - 0.01, x1 + 0.12, x1 + w - 0.12, 0.1, hh - 0.1, V[2]);
    for (let k = 0; k < 6; k++) { const p = cam.p(x1 + 0.3, 0.4 + k * 0.4, z - 0.02); s += ell(p[0], p[1], 1.3, 1.3, '#e8f6fb', 'opacity="0.8"'); }
    const lo = [cam.p(x1 + w / 2, 0.3, z - 0.05), cam.p(x1 + w / 2, -0.01, z - 0.05)], hi = [cam.p(x1 + w / 2, hh, z - 0.05), cam.p(x1 + w / 2, 3.7, z - 0.05)];
    s += S(lineD(lo), C.cool, cam.sz(0.16, z)) + S(lineD(hi), C.honey, cam.sz(0.16, z));
  }
  // the big warm pipe overhead collecting them, running toward us and then out through the drawn wall (right)
  const pipe = [cam.p(0, 3.8, 27), cam.p(0, 3.8, 6.4), cam.p(9.6, 3.8, 6.4), cam.p(16, 3.8, 6.4)];
  s += S(lineD(pipe), C.honeyD, 30) + S(lineD(pipe), C.honey, 19) + S(lineD(pipe), C.honeyL, 6, 'opacity="0.8"');
  s += steam(cam.p(9, 3.8, 6.4)[0], cam.p(9, 3.8, 6.4)[1] - 16, 70, 110, {n: 4, warm: true, col: V[13], op: 0.6});
  // the cool supply pipe low along the floor, frosted
  const sup = [cam.p(-9.5, 0.25, 4.6), cam.p(-1.9, 0.25, 4.6), cam.p(-1.9, 0.25, 27)];
  s += S(lineD(sup), C.coolD, 26) + S(lineD(sup), C.cool, 16);
  for (let i = 0; i < 18; i++) { const p = cam.p(rr(-9, -2.2), 0.25, 4.6); s += ell(p[0] + rr(-3, 3), p[1] + rr(-8, 8), rr(2.5, 5), rr(2, 4), '#ffffff', 'opacity="0.85"'); }
  // THE ONE OPEN: near, front-on, its door off: the cool pipe comes in at its foot, winds over each shelf of chips,
  // and leaves warm at its top (a breath of steam), up into the big pipe
  const zN = 4.6, x0 = -1.7, x1n = 0.0, yT = 2.9;
  const tl = cam.p(x0, yT, zN), br = cam.p(x1n, 0, zN), w = br[0] - tl[0], hh = br[1] - tl[1];
  s += hrect(tl[0] - 14, tl[1] - 14, w + 28, hh + 18, V[0], 1) + hrect(tl[0], tl[1], w, hh, V[3], 0.8);
  const rows = 6, pp = [[tl[0] - 60, br[1] - 22], [tl[0] + 24, br[1] - 22]];
  for (let r = 0; r < rows; r++) {
    const sy = br[1] - 40 - r * (hh - 70) / (rows - 1);
    s += hrect(tl[0] + 14, sy - 44, w - 28, 36, V[1], 0.5);
    for (let k = 0; k < 3; k++) s += hrect(tl[0] + 30 + k * (w - 60) / 3, sy - 38, (w - 60) / 3 - 14, 22, V[5], 0.4);
    const left = r % 2 === 0;
    pp.push([left ? tl[0] + 24 : tl[0] + w - 24, sy - 26]);
    pp.push([left ? tl[0] + w - 24 : tl[0] + 24, sy - 26]);
  }
  pp.push([tl[0] + w - 24, tl[1] - 40], [cam.p(0, 3.8, zN)[0], cam.p(0, 3.8, zN)[1]]);
  for (let i = 0; i < pp.length - 1; i++) {
    const t = i / (pp.length - 2);
    const col = t < 0.2 ? C.cool : t < 0.42 ? '#cfd3c4' : t < 0.6 ? C.honeyL : C.honey;
    const dk = t < 0.2 ? C.coolD : t < 0.42 ? V[8] : C.honeyD;
    s += S(lineD([pp[i], pp[i + 1]]), dk, 24) + S(lineD([pp[i], pp[i + 1]]), col, 15);
  }
  for (let i = 0; i < 8; i++) s += ell(tl[0] - 10 + rr(-50, 10), br[1] - 22 + rr(-10, 10), rr(2.5, 5), rr(2, 4), '#ffffff', 'opacity="0.85"');
  s += steam(tl[0] + w - 24, tl[1] - 50, 60, 90, {n: 4, warm: true, col: V[13], op: 0.7});
  for (let i = 0; i < 10; i++) s += ell(tl[0] - 6, tl[1] + 20 + i * hh / 10, 2, 2, '#e8f6fb');
  // her, beside it, in profile, a hand on its valve (scale, and life)
  s += ell(cam.p(0.9, 0, 5.4)[0], cam.p(0.9, 0, 5.4)[1], 70, 12, V[4], 'opacity="0.6"');
  s += personProfile(cam.p(0.95, 0, 5.4)[0], cam.p(0.95, 0, 5.4)[1], cam.sz(1.7, 5.4), {pose: 'stand-valve', dir: -1, coat: V[1], coatL: V[3], hair: V[0], skin: V[7], rim: C.honeyL});
  s += snowfall(200, 0, 1920);
  s += caption([{t: 'with water', x: 420, y: 400, size: 112}, {t: 'in pipes.', x: 640, y: 522, lit: true, size: 150}]);
  return svgPage(s);
};

// ======================================================================================
// B12: your chat, a warm window. On the street below her window: your gloved hand holds your phone (bottom left), your
// chat bubble popping; at your feet the warm line runs in the snow to her door; above, her window a step warmer, and
// her in it raising her mug; far down the quay, the hall's lights.
// ======================================================================================
FRAMES.B12 = () => {
  seed(121);
  const cam = Cam(1000, 560, 1150, 1.7);
  let s = '';
  s += `<linearGradient id="sky12" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1152"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.25" stop-color="${C.paper}"/><stop offset="0.52" stop-color="${C.paper}"/><stop offset="0.66" stop-color="${V[10]}"/><stop offset="0.85" stop-color="${V[7]}"/><stop offset="1" stop-color="${V[8]}"/></linearGradient><rect x="0" y="0" width="${W}" height="1152" fill="url(#sky12)"/>`;
  // far down the quay (left): the hall's lit door and its steam, the icebreaker's pale decks, the harbour
  const hd = cam.p(-9, 0, 120), hd2 = cam.p(-3, 9, 120);
  s += hrect(hd[0] - 8, hd2[1], hd2[0] - hd[0] + 50, hd[1] - hd2[1], V[2], 0.5);
  s += rect(hd[0] + 10, hd[1] - 24, 22, 24, '#dcebf0') + steam(hd[0] + 20, hd2[1], 90, 200, {n: 7, warm: true, col: V[11], op: 0.75, root: 0.25, lean: 0.1});
  s += faceZ(cam, 80, -36, -18, 4.6, 12, V[11]) + faceZ(cam, 80, -36, -16, -1, 4.6, V[1]);
  s += P(polyD([[0, 1150], [cam.p(-9, 0, 120)[0], 1152], cam.p(-9, 0, 6), [0, 1700]]), V[9]);
  // the street's snow
  s += P(polyD([cam.p(-9, 0, 2.6), cam.p(-9, 0, 140), cam.p(12, 0, 140), cam.p(12, 0, 2.6)]), V[8]);
  for (const [z1, z2, col] of [[2.6, 4, V[4]], [4, 6.5, V[5]], [6.5, 11, V[6]], [11, 22, V[7]]]) s += P(polyD([cam.p(-9, 0, z1), cam.p(-9, 0, z2), cam.p(12, 0, z2), cam.p(12, 0, z1)], 1.5), col);
  s += P(polyD([[0, 1790], [W, 1780], [W, H], [0, H]]), V[4]);
  // the row of blocks on the right receding toward the quay's end (warm windows), and HER house front-on, near
  for (const [z1, z2, hgt] of [[40, 70, 16.5], [24, 39.6, 15]]) {
    s += facadeX(cam, 12, z1, z2, 0, hgt, V[2]) + poly3(cam, [[12, hgt, z1], [12, hgt, z2], [13.6, hgt + 2.4, z2], [13.6, hgt + 2.4, z1]], V[1]);
    for (let fl = 0; fl < 4; fl++) for (let zz = z1 + 1.2; zz < z2 - 1.3; zz += 2.7) { const q = q3(cam, [[12, 4 + fl * 3.2, zz], [12, 4 + fl * 3.2, zz + 1.2], [12, 5.8 + fl * 3.2, zz + 1.2], [12, 5.8 + fl * 3.2, zz]]); s += P(polyD(q, 0.3), rnd() < 0.72 ? C.honey : V[1], 'opacity="0.85"'); }
  }
  // her house: an old three-storey Helsinki house, front-on, its steep roof under the band, a chimney with snow
  const hz = 19.5, hx1 = 1.2, hx2 = 12, hgt = 10.6;
  s += faceZ(cam, hz, hx1, hx2, 0, hgt, V[3]);
  s += poly3(cam, [[hx1 - 0.3, hgt, hz], [hx2 + 0.3, hgt, hz], [hx2 - 1.2, hgt + 2.6, hz + 2.5], [hx1 + 1.2, hgt + 2.6, hz + 2.5]], V[1]);
  s += S(lineD([cam.p(hx1 - 0.2, hgt + 0.2, hz), cam.p(hx2 + 0.2, hgt + 0.2, hz)]), V[12], 4);
  { const a = cam.p(9.6, hgt + 1.6, hz + 1.2), b = cam.p(9.6, hgt + 4, hz + 1.2), w = cam.sz(0.9, hz); s += hrect(a[0] - w / 2, b[1], w, a[1] - b[1], V[1], 0.4) + ell(a[0], b[1], w * 0.6, w * 0.25, V[13]); }
  s += faceZ(cam, hz - 0.01, hx1, hx2, 0, 2.8, V[4]);   // the granite base
  // its windows: the upper ones lit or dark; THE window (first floor, left of the door) a step warmer, her in it
  for (const [wx, wyy, lit] of [[2.3, 7.4, true], [5.4, 7.4, false], [8.6, 7.4, true], [8.6, 3.9, false]]) { const a = cam.p(wx, wyy + 1.9, hz - 0.02), b = cam.p(wx + 1.3, wyy, hz - 0.02); s += win(a[0], a[1], b[0] - a[0], b[1] - a[1], {lit, glow: 0.5, core: false}); }
  const wa = cam.p(2.3, 3.9 + 2.1, hz - 0.02), wb = cam.p(4.0, 3.9, hz - 0.02);
  s += win(wa[0], wa[1], wb[0] - wa[0], wb[1] - wa[1], {lit: true, glow: 2.6, warm: C.honeyL});
  // the radiator under its sill (warm fins), and her inside raising her mug (the toast from the kettle aisle, now hers)
  for (let i = 0; i < 6; i++) s += rect(wa[0] + 8 + i * 13, wb[1] - 34, 7, 26, C.honeyD, 'opacity="0.9"');
  s += personProfile(wa[0] + (wb[0] - wa[0]) * 0.32, wb[1] + 6, (wb[1] - wa[1]) * 1.05, {pose: 'stand-toast', mug: true, coat: V[3], coatL: V[3], hair: V[2], skin: V[4], boot: V[3]});
  // her door, where the warm line turns in
  const da = cam.p(6.2, 2.6, hz - 0.02), db = cam.p(7.6, 0, hz - 0.02);
  s += hrect(da[0], da[1], db[0] - da[0], db[1] - da[1], V[1], 0.5) + rect(da[0] + 4, da[1] + 4, db[0] - da[0] - 8, 16, C.honey, 'opacity="0.7"');
  // the warm line in the snow from your feet to her door (the melt, the warm showing through)
  s += meltSeam([[150, 1940], [250, 1730], [410, 1530], [560, 1385], [640, 1300], cam.p(6.9, 0, hz - 0.3)], [78, 18]);
  // your gloved hand and your phone, from the bottom left, your chat bubble popping (the screen's cool light)
  s += phoneHand(300, 1360, 270);
  s += snowfall(220, 0, 1920);
  s += caption([{t: 'heat', x: 290, y: 430, lit: true, size: 170}, {t: 'an apartment', x: 660, y: 470, size: 104}, {t: 'in Helsinki.', x: 690, y: 572, size: 104}]);
  return svgPage(s);
};

// ======================================================================================
// THE LOT VIEW (B7, B8: one view, one change; reworked in round 1). At the quay's end, a person's eye: on the right the
// last old block, its windows flung open, its people leaning out toward the warmth thrown away across the ice; ahead the
// empty lot by the water, its snow untouched behind a ploughed bank; the city's warm line comes from under our feet and
// stops in a burst at the bank. B8: the plan pencils itself onto the lot (a hall, its big door faintly warm, a dashed
// pipe across the gap, the year pinned on the drawing).
// ======================================================================================
function lotView(o = {}) {
  seed(81);
  const cam = Cam(1000, 540, 1250, 1.7);
  const plan = !!o.plan;
  let s = '';
  // the night sky under the band (the band itself stays the light calm field)
  s += `<linearGradient id="sky8" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1254"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.24" stop-color="${C.paper}"/><stop offset="0.47" stop-color="${C.paper}"/><stop offset="0.53" stop-color="${V[10]}"/><stop offset="0.66" stop-color="${V[6]}"/><stop offset="0.9" stop-color="${V[5]}"/><stop offset="1" stop-color="${V[7]}"/></linearGradient><rect x="0" y="0" width="${W}" height="1254" fill="url(#sky8)"/>`;
  s += cloudBank(760, 90, V[8], 0.3, 6);
  // the far shore across the harbour: a low belt of the city, its small warm windows
  s += P(polyD([[0, 1254], [0, 1226], [60, 1224], [70, 1212], [130, 1213], [140, 1222], [250, 1220], [262, 1208], [330, 1209], [340, 1218], [470, 1218], [480, 1210], [560, 1211], [570, 1220], [700, 1219], [1080, 1222], [1080, 1254]], 0.8), V[3]);
  for (let i = 0; i < 80; i++) s += rect(rr(4, 1070), rr(1214, 1246), rr(2, 3.4), rr(2, 3.2), C.honey, `opacity="${f1(rr(0.45, 0.95))}"`);
  // across the ice, a data center throwing its heat into the night: warm air rising, thinning to nothing
  s += hrect(96, 1210, 112, 30, V[1], 0.4) + rect(104, 1224, 96, 3, C.honey, 'opacity="0.55"');
  s += warmAir(152, 1208, 100, 520, {lean: 0.04, op: 1.3});
  // the harbour ice; the icebreakers' channel kept open along the far side
  s += P(polyD([[0, 1252], [W, 1252], [W, 1310], [0, 1310]]), V[10]);
  s += P(smoothD([[0, 1258], [300, 1256], [700, 1260], [1080, 1257], [1080, 1268], [700, 1272], [300, 1268], [0, 1270]], true), V[3], 'opacity="0.85"');
  for (let i = 0; i < 10; i++) { const y = rr(1276, 1304), x0 = rr(-40, 1000); s += S(lineD([[x0, y], [x0 + rr(40, 140), y + rr(-2, 2)]]), V[rnd() < 0.5 ? 8 : 12], rr(1, 2), 'opacity="0.6"'); }
  // the quay's stone edge along the water, snow-capped bollards
  s += P(polyD([[0, 1306], [W, 1306], [W, 1316], [0, 1316]], 0.6), V[3]);
  for (const X of [-14, -9.5, -5]) { const a = cam.p(X, 0, 29), b = cam.p(X, 0.9, 29), w = cam.sz(0.45, 29); s += hrect(a[0] - w / 2, b[1], w, a[1] - b[1], V[1], 0.4) + ell(a[0], b[1], w * 0.75, w * 0.3, V[13]); }
  // THE LOT: its snow untouched, smooth and pale (the missing piece's ground)
  s += P(polyD([[0, 1315], [W, 1315], [W, 1446], [0, 1446]]), V[11]);
  for (let i = 0; i < 7; i++) s += P(blobD(rr(30, 460), rr(1330, 1420), rr(60, 150), rr(4, 8), 8, 0.3), V[12], 'opacity="0.55"');
  s += P(smoothD([[0, 1394], [160, 1382], [330, 1390], [470, 1380], [470, 1400], [300, 1408], [0, 1412]], true), V[10], 'opacity="0.35" filter="url(#b8)"');
  // the last old house (right), front-on, two storeys and a steep snowy roof: its windows flung open on warm rooms
  const bz = 8.9, bx1 = -0.6, bx2 = 6.4;
  s += facadeX(cam, bx1, bz, 13, 0, 7, V[2]);
  s += faceZ(cam, bz, bx1, bx2, 0, 7, V[3]);
  s += faceZ(cam, bz - 0.01, bx1, bx2, 0, 3.3, V[4]);
  for (let yy = 0.55; yy < 3.3; yy += 0.68) s += S(lineD([cam.p(bx1, yy, bz - 0.02), cam.p(bx2, yy, bz - 0.02)]), V[3], 1.8, 'opacity="0.7"');
  s += faceZ(cam, bz - 0.02, bx1, bx2, 6.7, 7.05, V[5]) + S(lineD([cam.p(bx1 - 0.1, 7.08, bz - 0.03), cam.p(bx2, 7.08, bz - 0.03)]), V[12], 4);
  s += poly3(cam, [[bx1 - 0.25, 7.05, bz], [bx2, 7.05, bz], [bx2, 8.1, bz + 2.2], [bx1 + 0.6, 8.1, bz + 2.2]], V[1]);
  s += S(lineD([cam.p(bx1 + 0.5, 8.05, bz + 2.1), cam.p(bx2, 8.05, bz + 2.1)]), V[12], 3.4, 'opacity="0.85"');
  { const a = cam.p(3.2, 7.9, bz + 1.6), b = cam.p(3.9, 8.35, bz + 1.6); s += hrect(a[0], b[1], b[0] - a[0], a[1] - b[1], V[1], 0.4) + ell((a[0] + b[0]) / 2, b[1], (b[0] - a[0]) * 0.65, 4, V[13]); }
  const winAt = (X1, Y1, w = 1.25, h = 1.8) => { const a = cam.p(X1, Y1 + h, bz - 0.03), b = cam.p(X1 + w, Y1, bz - 0.03); return [a[0], a[1], b[0] - a[0], b[1] - a[1]]; };
  const life = o.life || ['oldman', 'mug'];
  [0.0, 2.3].forEach((X1, c) => {
    const [x, y, w, h] = winAt(X1, 4.1), kind = life[c];
    s += openWin(x, y, w, h, {open: true, spill: 1.1, leafL: 0.24, leafR: 0.24});
    s += sillLife(kind, x, y, w, h, -1, {k: 1.5});
  });
  // the ground floor: a café window lit low with a child kneeling on its bench, the house door, its cat on the step
  { const [x, y, w, h] = winAt(0.0, 0.9, 1.25, 1.75); s += openWin(x, y, w, h, {open: true, spill: 1, leafL: 0.24, leafR: 0.24}); s += sillLife('child', x, y, w, h, -1, {k: 1.45, out: -0.2}); }
  { const a = cam.p(2.55, 2.7, bz - 0.03), b = cam.p(3.45, 0, bz - 0.03); s += hrect(a[0], a[1], b[0] - a[0], b[1] - a[1], V[1], 0.4) + hrect(a[0] + 5, a[1] + 5, b[0] - a[0] - 10, 22, C.honey, 0.3, 'opacity="0.85"'); s += ell((a[0] + b[0]) / 2, b[1] + 6, 70, 12, C.honey, 'opacity="0.3" filter="url(#b8)"');
    s += sillLife('cat', a[0] - 40, b[1] - 120, 80, 120, -1, {k: 1.6}); }
  // the warm light the open windows throw on the snow at the house's foot
  s += ell(800, 1462, 330, 40, C.honey, 'opacity="0.24" filter="url(#b24)"');
  // the ploughed bank where the street's trodden snow ends and the lot begins (the line meets it and stops)
  s += P(smoothD([[-20, 1452], [60, 1436], [180, 1432], [300, 1438], [400, 1434], [470, 1440], [560, 1436], [700, 1440], [860, 1434], [1100, 1440], [1100, 1466], [-20, 1466]], true), V[12]);
  s += P(smoothD([[-20, 1458], [200, 1450], [420, 1454], [640, 1449], [1100, 1454], [1100, 1480], [-20, 1480]], true), V[9]);
  // the near street: trodden snow, tracks, darker toward us (a quiet field)
  s += P(polyD([[0, 1478], [W, 1478], [W, H], [0, H]]), V[6]);
  for (const [y1, col] of [[1560, V[5]], [1710, V[4]]]) s += P(smoothD([[0, y1], [300, y1 - 8], [700, y1 + 6], [1080, y1 - 4], [1080, H], [0, H]], true), col);
  for (let i = 0; i < 22; i++) { const x = rr(-20, 1060), y = rr(1490, 1900); s += S(lineD([[x, y], [x + rr(-30, 30), y + rr(40, 120)]]), V[rnd() < 0.5 ? 7 : 3], rr(3, 7), 'opacity="0.35"'); }
  for (let i = 0; i < 9; i++) { const p = [300 + i * 14 + (i % 2) * 10, 1890 - i * 48]; s += ell(p[0], p[1], 9 - i * 0.5, 4 - i * 0.2, V[3], 'opacity="0.7"'); }
  // the city's warm line from under our feet to the bank, where it stops
  const end = [396, 1446];
  s += meltSeam([[540, 1950], [522, 1800], [480, 1650], [430, 1530], end], [74, 15]);
  s += lineBurst(end[0], end[1] - 4, plan ? 0.6 : 1.05);
  if (plan) {
    seed(77);
    // the plan, drawn on the lot in soft pencil: a hall standing on the lot, its big door facing the line's end
    const z = 22, L = cam.p(-11.6, 0, z)[0], R = cam.p(bx1, 0, bz)[0] - 6, B = cam.p(0, 0, z)[1], T = cam.p(0, 10, z)[1];
    const zb = 46, bl = cam.p(-11.6, 10, zb), blB = cam.p(-11.6, 0, zb);
    // its left end receding toward the water, hatched in shade; the roof's far edge
    s += pencilHatch([[bl[0], bl[1]], [L, T], [L, B], [blB[0], blB[1]]], 9, {op: 0.32, w: 1.8});
    s += softPencil([[L, T], [bl[0], bl[1]], [blB[0], blB[1]]], 2.6, {op: 0.6, over: 8});
    s += softPencil([[bl[0], bl[1]], [R, bl[1] + 2]], 2, {op: 0.36});
    // the front: its walls, a parapet, the plinth, panel joints (a building standing on the lot, drawn; it runs on
    // behind the old house)
    s += softPencil([[L, B], [L, T]], 4.4, {over: 18, op: 0.86}) + softPencil([[L, T], [R, T]], 4.6, {over: 10, op: 0.88});
    s += softPencil([[L - 50, B + 1], [R, B - 1]], 2.4, {op: 0.5});
    s += softPencil([[L + 4, T + 22], [R, T + 22]], 2, {op: 0.5}) + softPencil([[L + 4, B - 24], [R, B - 24]], 1.8, {op: 0.42});
    for (let x = L + 64; x < 470; x += 64) s += softPencil([[x, T + 26], [x, B - 28]], 1.4, {op: 0.24, passes: 1});
    // the big door, faintly warm inside (the hope)
    const dL = cam.p(-9.0, 0, z)[0], dR = cam.p(-5.0, 0, z)[0], dT = cam.p(0, 5.6, z)[1];
    s += rect(dL - 40, dT - 40, dR - dL + 80, B - dT + 60, C.honey, 'opacity="0.26" filter="url(#b24)"');
    s += hrect(dL, dT, dR - dL, B - dT, C.honeyL, 0.5, 'opacity="0.24"');
    s += softPencil([[dL, B], [dL, dT], [dR, dT], [dR, B]], 4.2, {over: 8, op: 0.9});
    s += softPencil([[(dL + dR) / 2, dT + 6], [(dL + dR) / 2, B - 4]], 2, {op: 0.5});
    s += softPencil([[dL - 30, dT - 16], [dR + 70, dT - 16]], 2.2, {op: 0.55});
    // the missing piece: a dashed pencil pipe across the untouched snow from the line's end to the drawn door
    const pipe = [[end[0] - 12, end[1] - 6], [380, 1420], [300, 1388], [240, 1362], [(dL + dR) / 2 + 16, B + 2]];
    s += S(smoothD(pipe, false), C.honey, 18, 'opacity="0.2" filter="url(#b8)"');
    s += softPencil(sampleSmooth(pipe, 6), 5, {dash: '24 15', op: 0.9, passes: 2});
    // the survey stake where the line ends, its ribbon
    const st = cam.p(-1.25, 0, 9.7), stT = cam.p(-1.25, 1.45, 9.7);
    s += S(lineD([st, stT]), V[1], 5) + ell(st[0], st[1], 10, 3.5, V[3]) + P(polyD([[stT[0], stT[1] + 2], [stT[0] + 30, stT[1] + 8], [stT[0] + 26, stT[1] + 17], [stT[0], stT[1] + 12]], 0.4), V[12]);
    // the year, on a paper pinned to the drawing above its door (the type guide's world word, in its ink)
    const tx = Math.max(126, (dL + dR) / 2 - 140), ty = T + 36;
    s += G(P(polyD([[tx, ty], [tx + 280, ty - 4], [tx + 283, ty + 166], [tx + 3, ty + 170]], 0.8), '#d9dae6') + ell(tx + 140, ty + 12, 7, 7, V[2]) +
      `<text x="${tx + 141}" y="${ty + 126}" font-family="Gaegu" font-weight="700" font-size="138" text-anchor="middle" fill="#1f2b4b" class="ink">2027</text>`, `transform="rotate(-3 ${tx + 140} ${ty + 85})"`);
  }
  // her, in the street by the line's end, from behind: reaching toward the warmth (B7), or standing to look at the plan (B8)
  const f = cam.p(-0.2, 0, 7.3), hh = cam.sz(1.7, 7.3);
  s += ell(f[0] + 4, f[1] + 2, hh * 0.2, hh * 0.04, V[4], 'opacity="0.6"');
  s += fig(f[0], f[1], hh, plan ? {view: 'back', arms: [[8, 4], [10, 30]], coat: V[1], coatL: V[3], hair: V[0], skin: V[5], scarf: V[8], rim: C.honeyL, rimSide: 1} :
    {view: 'back', arms: [[112, -6], [34, 18]], lean: -7, dir: 1, coat: V[1], coatL: V[3], hair: V[0], skin: V[5], scarf: V[8], rim: C.honeyL, rimSide: 1});
  s += snowfall(200, 0, 1920);
  return s;
}
FRAMES.B7 = () => {
  let s = lotView({plan: false});
  s += caption([{t: 'But Helsinki', x: 360, y: 368, size: 112}, {t: 'wants', x: 570, y: 488, lit: true, size: 156}, {t: 'that heat.', x: 770, y: 580, size: 104}]);
  return svgPage(s);
};
FRAMES.B8 = () => {
  let s = lotView({plan: true});
  s += caption([{t: 'a plan,', x: 360, y: 400, size: 112}, {t: 'starting next year.', x: 560, y: 522, size: 108}]);
  return svgPage(s);
};

// ======================================================================================
// THE ALTERNATES (the beats I am least sure of)
// ======================================================================================
// ---------- B5alt: one cup, close (no one): one mug steaming in front of the soft wall of forty kettles ----------
FRAMES.B5alt = () => {
  seed(55);
  let s = '';
  s += `<linearGradient id="c5a" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1000"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.3" stop-color="${C.paper}"/><stop offset="0.6" stop-color="${C.paper}"/><stop offset="1" stop-color="${V[12]}"/></linearGradient><rect x="0" y="0" width="${W}" height="${H}" fill="url(#c5a)"/>`;
  s += G(kettleCabinet(40, 640, 1000, 1240, {open: false}), 'opacity="0.42"');
  s += rect(0, 600, W, 1320, V[12], 'opacity="0.3"');
  s += steam(540, 700, 1000, 220, {n: 8, col: '#f2f3f5', op: 0.8});
  // the open door's ledge, near, and on it ONE mug: dark on the light steam, warm tea, its tag, one curl of steam
  s += P(polyD([[0, 1330], [W, 1300], [W, 1420], [0, 1450]], 1), V[3]) + P(polyD([[0, 1330], [W, 1300], [W, 1318], [0, 1348]], 0.6), V[6]);
  const mx = 560, my = 1150;
  s += ell(mx, my + 152, 150, 22, V[2], 'opacity="0.6"');
  s += P(polyD([[mx - 120, my - 150], [mx + 112, my - 150], [mx + 100, my + 148], [mx - 108, my + 148]], 1), V[1]);
  s += S(smoothD([[mx + 108, my - 100], [mx + 200, my - 80], [mx + 196, my + 40], [mx + 102, my + 52]], false), V[1], 30);
  s += ell(mx - 4, my - 148, 112, 20, C.honey) + ell(mx - 4, my - 150, 70, 10, C.honeyL, 'opacity="0.7"');
  s += S(smoothD([[mx + 30, my - 150], [mx + 60, my - 60], [mx + 66, my + 10]], false), V[11], 3) + hrect(mx + 46, my + 10, 46, 54, '#f1efe6', 0.6);
  s += steam(mx - 10, my - 170, 220, 330, {n: 7, warm: true, col: '#f4f5f7', op: 0.9, lean: 0.12, root: 0.25});
  s += caption([{t: "That's a lot", x: 520, y: 400, size: 112}, {t: 'of tea.', x: 600, y: 522, size: 112}]);
  return svgPage(s);
};

// ---------- B6alt (reworked in round 1): out through the fan. Inside a data center's wall, one giant exhaust fan:
// through its turning blades the snowy night and a far town's few warm lights; the hall's warm air pours out through it
// and thins away over the empty snow; she stands small on the catwalk, her scarf pulled toward the fan ----------
FRAMES.B6alt = () => {
  seed(66);
  let s = '';
  // the hall's inner wall: pale and calm at the band, darkening down to the fan and the catwalk
  s += `<linearGradient id="w6a" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1920"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.15" stop-color="${C.paper}"/><stop offset="0.31" stop-color="${C.paper}"/><stop offset="0.4" stop-color="${V[10]}"/><stop offset="0.7" stop-color="${V[7]}"/><stop offset="1" stop-color="${V[4]}"/></linearGradient><rect x="0" y="0" width="${W}" height="${H}" fill="url(#w6a)"/>`;
  // concrete panel joints and a cable tray along the wall (under the band)
  for (const y of [700, 1560]) s += S(lineD([[0, y], [W, y]]), V[8], 2, 'opacity="0.6"');
  for (const x of [80, 1000]) s += S(lineD([[x, 640], [x, 1920]]), V[8], 2, 'opacity="0.5"');
  const cx = 540, cy = 1105, R = 400;
  // the opening: the night outside, seen through the fan
  s += `<clipPath id="fanhole"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath>`;
  let out = '';
  out += `<linearGradient id="n6a" gradientUnits="userSpaceOnUse" x1="0" y1="${cy - R}" x2="0" y2="${cy + R}"><stop offset="0" stop-color="${V[4]}"/><stop offset="0.55" stop-color="${V[6]}"/><stop offset="0.62" stop-color="${V[8]}"/><stop offset="1" stop-color="${V[9]}"/></linearGradient><rect x="${cx - R}" y="${cy - R}" width="${2 * R}" height="${2 * R}" fill="url(#n6a)"/>`;
  // the far snowy land, a dark tree line, and a far town's few warm lights where the heat could have gone
  out += P(smoothD([[cx - R, cy + 70], [cx - 200, cy + 58], [cx, cy + 66], [cx + 200, cy + 56], [cx + R, cy + 64], [cx + R, cy + 90], [cx - R, cy + 92]], true), V[3]);
  for (let i = 0; i < 26; i++) out += rect(rr(cx + 120, cx + 330), rr(cy + 52, cy + 66), 2.6, 2.4, C.honey, `opacity="${f1(rr(0.55, 1))}"`);
  out += P(polyD([[cx - R, cy + 90], [cx + R, cy + 88], [cx + R, cy + R], [cx - R, cy + R]]), V[9]);
  // the hall's warm air leaving: pale warm veils streaming out and away over the snow, thinning to nothing
  for (let i = 0; i < 8; i++) { const t = i / 7; out += P(blobD(cx + rr(-60, 60), cy + 20 - t * 120, R * (0.95 - 0.5 * t), 60 + 40 * t, 9, 0.25), i < 3 ? C.honeyL : '#efe4cf', `opacity="${f1(0.26 * (1 - t * 0.8))}" filter="url(#b40)"`); }
  // snow outside, swirled away in the stream
  for (let i = 0; i < 70; i++) { const a = rr(0, Math.PI * 2), r = rr(40, R); const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.9; out += ell(x, y, rr(1.6, 3.6), rr(1.6, 3.6), '#f6f7f9', `opacity="${f1(rr(0.4, 0.9))}"`); }
  s += G(out, 'clip-path="url(#fanhole)"');
  // the heat being pulled through, on our side: a warm glow round the opening's inner edge
  s += `<circle cx="${cx}" cy="${cy}" r="${R + 10}" fill="none" stroke="${C.honey}" stroke-width="70" opacity="0.32" filter="url(#b24)"/>`;
  // the blades turning: dark, softened by their motion (ghosts behind), lit warm along their edges
  const blade = (rot, op) => { let g = ''; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + rot; const p1 = [cx + Math.cos(a) * 52, cy + Math.sin(a) * 52], p2 = [cx + Math.cos(a + 0.34) * R * 0.94, cy + Math.sin(a + 0.34) * R * 0.94], p3 = [cx + Math.cos(a + 0.7) * R * 0.9, cy + Math.sin(a + 0.7) * R * 0.9], p4 = [cx + Math.cos(a + 0.38) * R * 0.4, cy + Math.sin(a + 0.38) * R * 0.4]; g += P(smoothD([p1, p2, p3, p4], true), V[1], `opacity="${op}"`); if (op > 0.8) g += S(smoothD([p1, p2], false), C.honeyL, 3, 'opacity="0.55"'); } return g; };
  s += blade(0.5, 0.18) + blade(0.36, 0.32) + blade(0.22, 0.92);
  s += `<circle cx="${cx}" cy="${cy}" r="56" fill="${V[1]}"/><circle cx="${cx}" cy="${cy}" r="20" fill="${C.honeyD}" opacity="0.8"/>`;
  // the guard: thin rings and spokes, the heavy housing ring with its bolts
  for (const k of [0.3, 0.55, 0.8]) s += `<circle cx="${cx}" cy="${cy}" r="${R * k}" fill="none" stroke="${V[2]}" stroke-width="2.4" opacity="0.65"/>`;
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; s += S(lineD([[cx + Math.cos(a) * 60, cy + Math.sin(a) * 60], [cx + Math.cos(a) * R, cy + Math.sin(a) * R]]), V[2], 2, 'opacity="0.55"'); }
  s += `<circle cx="${cx}" cy="${cy}" r="${R + 22}" fill="none" stroke="${V[2]}" stroke-width="44"/><circle cx="${cx}" cy="${cy}" r="${R + 2}" fill="none" stroke="${V[1]}" stroke-width="5"/>`;
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; s += ell(cx + Math.cos(a) * (R + 22), cy + Math.sin(a) * (R + 22), 4.5, 4.5, V[5]); }
  // the machines whose heat it is: the tops of a row of giant computers at the right, their small lights
  for (let i = 0; i < 4; i++) { const x = 800 + i * 76, y = 1480 - i * 30; s += hrect(x, y, 70, 1920 - y, V[2], 0.6); for (let k = 0; k < 9; k++) for (let j = 0; j < 2; j++) s += rect(x + 14 + j * 22, y + 20 + k * 22, 6, 3, '#dceef4', 'opacity="0.75"'); }
  s += P(blobD(880, 1470, 220, 60, 9, 0.3), C.honey, 'opacity="0.2" filter="url(#b40)"');
  // the catwalk: its grating and rail, under the fan
  s += P(polyD([[0, 1496], [W, 1496], [W, 1530], [0, 1530]], 0.6), V[3]) + S(lineD([[0, 1440], [W, 1440]]), V[2], 5) + S(lineD([[0, 1468], [W, 1468]]), V[2], 3, 'opacity="0.8"');
  for (let x = 30; x < W; x += 90) s += S(lineD([[x, 1440], [x, 1498]]), V[2], 4);
  s += P(polyD([[0, 1530], [W, 1530], [W, H], [0, H]]), V[2]);
  // her, small on the catwalk, from behind, watching the warmth go; the draught pulls her scarf and hair to the fan
  s += fig(330, 1500, 250, {view: 'back', arms: [[14, 8], [10, 30]], coat: V[1], coatL: V[3], hair: V[0], skin: V[5], scarf: V[8], rim: C.honeyL, rimSide: 1, hairLift: 0.5, lean: 3});
  s += P(smoothD([[340, 1306], [380, 1296], [420, 1278], [436, 1286], [398, 1310], [352, 1318]], true), V[8]);
  s += snowfall(40, 640, 1500, {rmax: 2.6, op: 0.5});
  s += caption([{t: 'to blow that', x: 520, y: 395, size: 112}, {t: 'heat outside.', x: 560, y: 515, size: 112}]);
  return svgPage(s);
};

// ---------- B7alt: the city leans out: along the quay, windows swing open and people lean out toward the warm plume
// drifting over the harbour: a hand held out, a mug held up, mittens hung out to warm ----------
FRAMES.B7alt = () => {
  seed(77);
  let s = '';
  s += `<linearGradient id="s7a" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1000"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.3" stop-color="${C.paper}"/><stop offset="0.6" stop-color="${C.paper}"/><stop offset="0.75" stop-color="${V[9]}"/><stop offset="1" stop-color="${V[6]}"/></linearGradient><rect x="0" y="0" width="${W}" height="1000" fill="url(#s7a)"/>`;
  // the Jugendstil facade, front-on, its steep roof under the band, a low corner turret at the right
  s += hrect(-20, 700, 940, 1240, V[3], 1) + P(polyD([[-20, 704], [60, 640], [880, 640], [930, 704]], 1), V[1]) + S(lineD([[-10, 700], [62, 644], [880, 644]]), V[12], 5);
  s += hrect(900, 690, 200, 1240, V[2], 1) + P(smoothD([[890, 692], [930, 650], [1000, 618], [1070, 650], [1110, 692]], true), V[1]);
  // the warm plume drifting in over the harbour from the right, across the facade (the heat they want)
  s += steam(1120, 900, 560, 60, {n: 9, warm: true, col: V[12], op: 0.85, lean: -9, root: 0.35, sharp: true});
  // windows in rows; the open ones: casements swung out, people leaning toward the warmth (lit from their rooms)
  const cols = [70, 280, 490, 700], rows = [790, 990, 1190, 1390];
  const open = {'0,1': 'mug', '1,0': 'hand', '2,1': 'hand', '3,0': 'mitten', '1,2': 'mug', '3,2': 'hand', '0,3': 'cat', '2,3': 'mug'};
  rows.forEach((wy, r) => cols.forEach((wx, c) => {
    const key = c + ',' + r, kind = open[key];
    s += win(wx, wy, 130, 150, {lit: true, glow: kind ? 1 : 0.5, core: false});
    if (!kind) return;
    s += P(polyD([[wx + 130, wy], [wx + 186, wy - 20], [wx + 186, wy + 170], [wx + 130, wy + 150]], 0.6), V[6]);   // the casement swung out
    s += P(polyD([[wx + 136, wy + 6], [wx + 180, wy - 8], [wx + 180, wy + 160], [wx + 136, wy + 144]], 0.6), '#e6eef2', 'opacity="0.35"');
    // a person at the sill, leaning out in profile toward the right (dark against the warm room, a warm rim)
    const px = wx + 70, py = wy + 150;
    s += personProfile(px, py + 110, 260, {pose: kind === 'mug' ? 'stand-toast' : 'stand-valve', mug: kind === 'mug', coat: V[2], coatL: V[3], hair: V[1], skin: V[7], rim: C.honeyL});
    if (kind === 'mitten') { s += S(lineD([[wx + 130, wy + 30], [wx + 220, wy + 22]]), V[1], 2); s += P(blobD(wx + 160, wy + 54, 13, 19, 7, 0.2), V[10]) + P(blobD(wx + 200, wy + 48, 13, 19, 7, 0.2), V[10]); }
    if (kind === 'cat') { s += P(smoothD([[wx + 110, wy + 150], [wx + 130, wy + 112], [wx + 176, wy + 104], [wx + 200, wy + 122], [wx + 196, wy + 150]], true), V[1]) + P(polyD([[wx + 184, wy + 108], [wx + 190, wy + 90], [wx + 198, wy + 110]]), V[1]); }
  }));
  // the street below: snow, the warm line under it
  s += P(polyD([[0, 1600], [W, 1600], [W, H], [0, H]]), V[6]) + P(polyD([[0, 1720], [W, 1710], [W, H], [0, H]]), V[5]);
  s += meltSeam([[-20, 1668], [300, 1660], [600, 1670], [1100, 1654]], [24, 18]);
  s += snowfall(200, 0, 1920);
  s += caption([{t: 'But Helsinki', x: 360, y: 368, size: 112}, {t: 'wants', x: 570, y: 488, lit: true, size: 156}, {t: 'that heat.', x: 770, y: 580, size: 104}]);
  return svgPage(s);
};

// ---------- B12alt: inside her warm flat: a cat asleep on the warm radiator under the window, her phone on the sill
// with your chat bubble popping, and out in the snow the quay, the warm line and the hall's lights far away ----------
FRAMES.B12alt = () => {
  seed(122);
  let s = '';
  // the room's wall: warm-lit by the lamp (the band is the wall above the window: calm and light)
  s += rect(0, 0, W, H, C.paper);
  s += rect(0, 620, W, 1300, V[11]);
  // the window: deep, its frame, the night outside (the quay, the line, the hall's lights)
  const wx = 190, wy = 650, ww = 700, wh = 700;
  s += hrect(wx - 30, wy - 30, ww + 60, wh + 60, V[13], 1);
  s += `<linearGradient id="n12" gradientUnits="userSpaceOnUse" x1="0" y1="${wy}" x2="0" y2="${wy + wh}"><stop offset="0" stop-color="${V[5]}"/><stop offset="1" stop-color="${V[7]}"/></linearGradient>`;
  s += rect(wx, wy, ww, wh, 'url(#n12)');
  s += P(polyD([[wx, wy + 430], [wx + ww, wy + 410], [wx + ww, wy + wh], [wx, wy + wh]]), V[9]);
  s += P(polyD([[wx, wy + 330], [wx + 300, wy + 330], [wx + 300, wy + 430], [wx, wy + 440]]), V[2]);
  for (let i = 0; i < 18; i++) s += rect(wx + 10 + rr(0, 280), wy + 340 + rr(0, 70), 6, 8, C.honey, 'opacity="0.85"');
  s += hrect(wx + 470, wy + 360, 130, 60, V[1], 0.5) + rect(wx + 515, wy + 395, 26, 25, '#dcebf0') + steam(wx + 535, wy + 360, 90, 170, {n: 6, warm: true, col: V[11], op: 0.7});
  s += S(lineD([[wx + ww / 2, wy], [wx + ww / 2, wy + wh]]), V[13], 16) + S(lineD([[wx, wy + 300], [wx + ww, wy + 300]]), V[13], 12);
  for (let i = 0; i < 30; i++) s += ell(wx + rr(0, ww), wy + rr(0, wh), 2.4, 2.4, '#f6f7f9', 'opacity="0.85"');
  // frost at the pane's lower corners, melting back
  s += P(blobD(wx + 40, wy + wh - 30, 90, 50, 9, 0.3), '#eef1f5', 'opacity="0.6" filter="url(#b8)"') + P(blobD(wx + ww - 40, wy + wh - 30, 90, 50, 9, 0.3), '#eef1f5', 'opacity="0.6" filter="url(#b8)"');
  // the sill (deep), the phone on it with your chat bubble popping
  s += hrect(wx - 70, wy + wh + 10, ww + 140, 44, V[13], 1) + hrect(wx - 70, wy + wh + 54, ww + 140, 22, V[9], 1);
  s += P(polyD([[wx + 520, wy + wh + 4], [wx + 640, wy + wh - 6], [wx + 650, wy + wh + 12], [wx + 526, wy + wh + 20]], 0.5), V[0]);
  s += P(smoothD([[wx + 560, wy + wh - 90], [wx + 660, wy + wh - 92], [wx + 666, wy + wh - 40], [wx + 640, wy + wh - 30], [wx + 562, wy + wh - 34]], true), C.honeyL);
  s += ell(wx + 595, wy + wh - 62, 7, 7, C.honeyD) + ell(wx + 615, wy + wh - 62, 7, 7, C.honeyD) + ell(wx + 635, wy + wh - 62, 7, 7, C.honeyD);
  // the radiator under the sill, warm: its fins honey; a cat asleep on the shelf above it, curled
  const ry0 = wy + wh + 100, rh = 300;
  s += rect(wx - 20, ry0 - 30, ww + 40, rh + 80, C.honey, 'opacity="0.3" filter="url(#b40)"');
  for (let i = 0; i < 16; i++) s += hrect(wx + 10 + i * 42, ry0, 30, rh, i % 2 ? C.honeyD : C.honey, 0.6);
  s += S(lineD([[wx, ry0 + 20], [wx + ww, ry0 + 20]]), C.honeyW, 6);
  s += P(smoothD([[wx + 130, wy + wh + 10], [wx + 150, wy + wh - 50], [wx + 230, wy + wh - 72], [wx + 330, wy + wh - 58], [wx + 360, wy + wh - 20], [wx + 352, wy + wh + 10]], true), V[2]);
  s += P(smoothD([[wx + 120, wy + wh - 6], [wx + 116, wy + wh - 58], [wx + 146, wy + wh - 70], [wx + 168, wy + wh - 48], [wx + 160, wy + wh - 4]], true), V[2]);
  s += P(polyD([[wx + 122, wy + wh - 54], [wx + 126, wy + wh - 86], [wx + 140, wy + wh - 64]]), V[2]) + P(polyD([[wx + 152, wy + wh - 66], [wx + 166, wy + wh - 90], [wx + 168, wy + wh - 58]]), V[2]);
  s += S(smoothD([[wx + 352, wy + wh - 6], [wx + 400, wy + wh + 4], [wx + 410, wy + wh - 30]], false), V[2], 14);
  s += S(smoothD([[wx + 150, wy + wh - 40], [wx + 300, wy + wh - 62]], false), C.honeyL, 3, 'opacity="0.7"');
  // the floor and the room's dark edges (a quiet frame)
  s += rect(0, 1720, W, 200, V[8]);
  s += caption([{t: 'heat', x: 300, y: 430, lit: true, size: 170}, {t: 'an apartment', x: 660, y: 470, size: 104}, {t: 'in Helsinki.', x: 690, y: 572, size: 104}]);
  return svgPage(s);
};
