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
    // every floor's windows, most of them warm (the homes the heat reaches, warming in a wave from the branches)
    for (let y1 = 4.0; y1 + 1.8 < h - 0.6; y1 += 3.1) {
      for (let zz = z1 + 1.0; zz < z2 - 1.2; zz += mode === 'vision' ? rr(1.75, 2.0) : rr(2.2, 2.7)) {
        const lit = rnd() < litP;
        const pts = q3(cam, [[10.4, y1, zz], [10.4, y1, zz + 1.1], [10.4, y1 + 1.8, zz + 1.1], [10.4, y1 + 1.8, zz]]);
        if (lit) { const hot = mode === 'vision' && rnd() < 0.3; g += P(polyD(pts, 0.3), hot ? C.honeyL : C.honey, `opacity="${f1(rr(0.7, 0.95))}"`); }
        else g += P(polyD(pts, 0.3), V[1]);
      }
    }
    // the ground floor's shop windows, lit low, their light on the snow
    if (mode === 'vision') for (let zz = z1 + 1.6; zz < z2 - 2.2; zz += rr(4.2, 5.2)) {
      const pts = q3(cam, [[10.4, 0.6, zz], [10.4, 0.6, zz + 2.2], [10.4, 2.5, zz + 2.2], [10.4, 2.5, zz]]);
      g += P(polyD(pts, 0.3), C.honey, 'opacity="0.75"');
      const f0 = cam.p(9.6, 0, zz + 1.1); g += ell(f0[0], f0[1], cam.sz(1.6, zz), cam.sz(0.35, zz), C.honey, 'opacity="0.22" filter="url(#b8)"');
    }
    for (const zz of [z1 + 2.5, (z1 + z2) / 2 + rr(-2, 2)]) { const a = cam.p(11.2, h + 1.1, zz), b = cam.p(11.2, h + 3.4, zz), w = cam.sz(0.85, zz); if (b[1] > 616) g += hrect(a[0] - w / 2, b[1], w, a[1] - b[1], V[1], 0.4) + ell(a[0], b[1], w * 0.6, w * 0.25, V[13]); }
    // its doors (where the heat's branches turn in)
    for (const dz of (mode === 'vision' && z1 < 20 ? [z1 + 3.4, z1 + 11.4, z1 + 18.6] : [z1 + 2.2])) g += facadeX(cam, 10.4, dz, dz + 1.4, 0, 2.6, V[1]) + facadeX(cam, 10.4, dz + 0.15, dz + 1.25, 2.0, 2.5, C.honey, 'opacity="0.8"');
    return g;
  };
  const litP = mode === 'vision' ? 0.96 : 0.42;
  // the city behind the row (the next street's taller blocks), their upper floors' windows over the row's roofs
  if (mode === 'vision') {
    seed(36);
    for (const [z1, z2, h, X] of [[46, 64, 25, 26], [64, 88, 27, 26], [88, 120, 28, 26]]) {
      s += facadeX(cam, X, z1, z2, 0, h, V[2]) + poly3(cam, [[X, h, z1], [X, h, z2], [X + 2, h + 2.6, z2], [X + 2, h + 2.6, z1]], V[1]);
      for (let y1 = 13; y1 + 1.6 < h - 0.6; y1 += 3.0) for (let zz = z1 + 1; zz < z2 - 1.2; zz += 2.4) if (rnd() < 0.9) s += P(polyD(q3(cam, [[X, y1, zz], [X, y1, zz + 1.1], [X, y1 + 1.6, zz + 1.1], [X, y1 + 1.6, zz]]), 0.3), C.honey, `opacity="${f1(rr(0.55, 0.9))}"`);
    }
  }
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
  if (mode === 'vision') { seed(29); s += P(polyD([[300, 1112], [300, 1096], [380, 1092], [390, 1084], [470, 1086], [480, 1094], [560, 1092], [570, 1082], [660, 1084], [670, 1094], [760, 1096], [760, 1112]], 0.6), V[5]); for (let i = 0; i < 90; i++) s += rect(rr(304, 756), rr(1088, 1110), rr(2.2, 3.4), rr(2, 3), C.honey, `opacity="${f1(rr(0.55, 0.98))}"`); s += ell(530, 1098, 260, 24, C.honey, 'opacity="0.16" filter="url(#b14)"'); }
  if (mode === 'vision') {
    let g = '';
    seed(71);
    // the hall of giant computers is a plan: its walls and roof only drawn, in soft pencil; the computers inside painted
    // (four floors of them, their small cool lights), the big door open on them, the night showing through the walls
    const hzF = hz1, hzB = hz1 + 30, Xl = -8.5, Xr = 8, Ht = 14.5;
    for (let fl = 0; fl < 4; fl++) {
      const y0 = fl * 3.5 + 0.1, y1 = y0 + 2.5;
      for (let x = Xl + 0.4; x < Xr - 0.5; x += 0.95) {
        if (fl === 0 && Math.abs(x + 0.1) < 4.6) continue;
        const zr = hzF + 3, a = cam.p(x, y1, zr), b = cam.p(x + 0.7, y0, zr);
        g += rect(a[0], a[1], b[0] - a[0], b[1] - a[1], V[1], 'opacity="0.92"');
        for (let yy = y0 + 0.25; yy < y1 - 0.15; yy += 0.32) { const p = cam.p(x + 0.18 + (rnd() < 0.5 ? 0 : 0.3), yy, zr - 0.01); g += ell(p[0], p[1], 1.4, 1.4, '#e8f6fb', `opacity="${f1(rr(0.6, 1))}"`); }
      }
      const fy = cam.p(0, y0 - 0.1, hzF + 3)[1];
      g += softPencil([[cam.p(Xl, 0, hzF + 3)[0], fy], [cam.p(Xr, 0, hzF + 3)[0], fy]], 1.6, {op: 0.4, passes: 1});
    }
    // the big door open on the machines (cool light inside), its light on the snow
    const d1 = cam.p(-4.2, 0, hzF), d2 = cam.p(4.2, 8.6, hzF);
    g += rect(d1[0] - 22, d2[1] - 16, d2[0] - d1[0] + 44, d1[1] - d2[1] + 22, '#eaf4f7', 'opacity="0.3" filter="url(#b14)"');
    g += hrect(d1[0], d2[1], d2[0] - d1[0], d1[1] - d2[1], '#cfe1e8', 0.4, 'opacity="0.55"');
    for (let i = 0; i < 6; i++) { const xx = d1[0] + 9 + i * (d2[0] - d1[0] - 18) / 5, hh = (d1[1] - d2[1]) * 0.62, ww = 11; g += rect(xx - ww / 2, d1[1] - hh, ww, hh, V[1]); for (let kk = 0; kk < 7; kk++) g += ell(xx + rr(-2, 2), d1[1] - hh + 5 + kk * hh / 8, 1.3, 1.3, '#f6fdff'); }
    g += P(polyD([[d1[0], d1[1]], [d2[0], d1[1]], [d2[0] + 70, d1[1] + 40], [d1[0] - 70, d1[1] + 40]]), '#dfeef3', 'opacity="0.24" filter="url(#b8)"');
    // the drawn walls: the front, the far side going back, the roof's edges, the door, overshooting corners
    const fr = [cam.p(Xl, 0, hzF), cam.p(Xr, 0, hzF), cam.p(Xr, Ht, hzF), cam.p(Xl, Ht, hzF)];
    g += softPencil([fr[0], fr[3]], 3.6, {over: 10, op: 0.95}) + softPencil([fr[3], fr[2]], 3.6, {over: 12, op: 0.95}) + softPencil([fr[2], fr[1]], 3.6, {over: 10, op: 0.95});
    g += softPencil([[fr[0][0] - 30, fr[0][1] + 1], [fr[1][0] + 30, fr[1][1] - 1]], 2.4, {op: 0.6});
    g += softPencil([cam.p(Xr, Ht, hzF), cam.p(Xr, Ht, hzB)], 2.8, {op: 0.8, over: 6}) + softPencil([cam.p(Xr, 0, hzF), cam.p(Xr, 0, hzB)], 2.2, {op: 0.55}) + softPencil([cam.p(Xr, Ht, hzB), cam.p(Xr, 0, hzB)], 2.2, {op: 0.55});
    g += softPencil([cam.p(Xl, Ht, hzF), cam.p(Xl, Ht, hzB), cam.p(Xr, Ht, hzB)], 2, {op: 0.45});
    g += softPencil([d1, [d1[0], d2[1]], d2, [d2[0], d1[1]]], 3.2, {over: 6, op: 0.95});
    g += softPencil([[d1[0] - 20, d2[1] - 10], [d2[0] + 60, d2[1] - 10]], 2, {op: 0.55});
    g += pencilHatch([cam.p(Xr, Ht, hzF), cam.p(Xr, Ht, hzB), cam.p(Xr, 0, hzB), cam.p(Xr, 0, hzF)], 7, {op: 0.3, w: 1.6});
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
  for (const [zb, ok] of [[21.1, mode === 'vision'], [29.1, mode === 'vision'], [36.3, mode === 'vision'], [43.7, true], [53.6, true]]) {
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

// ---------- B2: a cathedral of computers. From a low eye just inside the hall's door (snow blown in over its sill,
// her cart's tracks through it), the aisle runs away between two walls of giant computers that climb out of sight, each
// with its rows of small cool lights; far at the end a door stands open on the snowy night, the brightest thing in the
// hall; she walks small toward it, pushing her cart ----------
FRAMES.B2 = () => {
  seed(21);
  const cam = Cam(900, 540, 1290, 0.5);
  const ax = 1.55, rh = 4.8, z0 = 0.7, z1 = 24;
  let s = '';
  s += `<linearGradient id="b2g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1920"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.16" stop-color="${C.paper}"/><stop offset="0.315" stop-color="${C.paper}"/><stop offset="0.39" stop-color="${V[7]}"/><stop offset="0.6" stop-color="${V[4]}"/><stop offset="1" stop-color="${V[3]}"/></linearGradient><rect x="0" y="0" width="${W}" height="${H}" fill="url(#b2g)"/>`;
  // the far wall and its door, open on the snowy night under a lamp: the light at the end of the nave
  s += faceZ(cam, z1, -ax - 0.2, ax + 0.2, 0, rh + 2, V[4]);
  const d1 = cam.p(-1.2, 0, z1), d2 = cam.p(1.2, 3.3, z1);
  s += rect(d1[0] - 130, d2[1] - 150, d2[0] - d1[0] + 260, d1[1] - d2[1] + 230, '#f4f7f8', 'opacity="0.6" filter="url(#b40)"');
  s += rect(d1[0] - 40, d2[1] - 40, d2[0] - d1[0] + 80, d1[1] - d2[1] + 60, '#ffffff', 'opacity="0.5" filter="url(#b14)"');
  s += hrect(d1[0], d2[1], d2[0] - d1[0], d1[1] - d2[1], '#f7f9fa', 0.4);
  s += rect(d1[0], d1[1] - (d1[1] - d2[1]) * 0.34, d2[0] - d1[0], (d1[1] - d2[1]) * 0.34, '#e9eef1');
  s += P(polyD([[d1[0] + 6, d1[1] - (d1[1] - d2[1]) * 0.36], [d1[0] + 20, d2[1] + 20], [d1[0] + 28, d1[1] - (d1[1] - d2[1]) * 0.36]], 0.4), V[9]);
  for (let i = 0; i < 16; i++) s += ell(rr(d1[0] + 3, d2[0] - 3), rr(d2[1] + 3, d1[1] - 6), 1.3, 1.3, V[8], 'opacity="0.8"');
  // the light it throws down the aisle: a long pale sheen on the floor toward us, and on the machines' edges
  s += P(polyD([cam.p(-1.0, 0, z1), cam.p(1.0, 0, z1), cam.p(1.25, 0, 3), cam.p(-1.25, 0, 3)]), '#eef3f5', 'opacity="0.22" filter="url(#b14)"');
  s += P(polyD([cam.p(-0.45, 0, z1), cam.p(0.45, 0, z1), cam.p(0.6, 0, 5), cam.p(-0.6, 0, 5)]), '#f3f6f7', 'opacity="0.2" filter="url(#b8)"');
  // the floor, a step down from the light: raised tiles, darker toward us
  s += P(polyD([cam.p(-ax, 0, z0), cam.p(-ax, 0, z1), cam.p(ax, 0, z1), cam.p(ax, 0, z0)]), V[5], 'opacity="0.75"');
  for (let z = z0 + 0.3; z < z1; z *= 1.2) s += S(lineD([cam.p(-ax, 0, z), cam.p(ax, 0, z)]), V[3], 1.4, 'opacity="0.7"');
  for (const x of [-ax / 2, 0, ax / 2]) s += S(lineD([cam.p(x, 0, z0), cam.p(x, 0, z1)]), V[3], 1.4, 'opacity="0.7"');
  // the two walls of giant computers, climbing out of sight: each cabinet a dark door with its rows of small cool
  // lights (regular: two per tray), the door's light catching their edges
  for (const side of [-1, 1]) {
    const X = side * ax;
    for (let z = z0; z < z1 - 0.5; z += 0.7) {
      const zz = z + 0.64;
      s += poly3(cam, [[X, 0, z], [X, 0, zz], [X, rh, zz], [X, rh, z]], V[1], '', 0.3);
      s += poly3(cam, [[X, 0.08, z + 0.05], [X, 0.08, zz - 0.05], [X, rh - 0.08, zz - 0.05], [X, rh - 0.08, z + 0.05]], V[2], '', 0.3);
      const k = clamp(1.2 - z / 30, 0.5, 1);
      for (let yy = 0.22; yy < rh - 0.12; yy += 0.15) for (const dzz of [0.12, 0.2]) {
        const p = cam.p(X, yy, z + dzz), r = Math.max(0.9, cam.sz(0.016, z));
        s += ell(p[0], p[1], r, r, '#bfe6f2', `opacity="${f1(0.85 * k)}"`);
      }
      s += S(lineD([cam.p(X, 0, zz), cam.p(X, rh, zz)]), '#e4eef1', Math.max(0.8, cam.sz(0.012, z)), `opacity="${f1(0.4 * (z / z1))}"`);
    }
    // the cable tray along the tops
    s += S(lineD([cam.p(side * (ax - 0.25), rh + 0.25, 3.5), cam.p(side * (ax - 0.25), rh + 0.25, z1)]), V[1], 9, 'opacity="0.85"');
    s += P(polyD(q3(cam, [[side * ax * 0.98, 0, z0], [side * ax * 0.98, 0, z1], [side * ax * 0.6, 0, z1], [side * ax * 0.6, 0, z0]])), '#bfe6f2', 'opacity="0.08" filter="url(#b8)"');
  }
  // the high hall above them, lost in its light (the machines climb into it)
  s += `<linearGradient id="b2up" gradientUnits="userSpaceOnUse" x1="0" y1="590" x2="0" y2="760"><stop offset="0" stop-color="${C.paper}" stop-opacity="1"/><stop offset="0.4" stop-color="${C.paper}" stop-opacity="0.5"/><stop offset="1" stop-color="${C.paper}" stop-opacity="0"/></linearGradient><rect x="0" y="0" width="${W}" height="760" fill="url(#b2up)"/>`;
  // her, small, walking toward the light, pushing her cart; its wet tracks behind her
  const zf = 9.5, f = cam.p(1.0, 0, zf), hp = cam.sz(1.7, zf);
  const c1 = cam.p(0.64, 0, zf + 0.9), c2 = cam.p(1.36, 1.0, zf + 0.9);
  s += hrect(c1[0], c2[1], c2[0] - c1[0], c1[1] - c2[1] - 4, V[2], 0.4) + rect(c1[0], c2[1], c2[0] - c1[0], 4, V[4]) + rect(c1[0] + 4, c2[1] + 10, c2[0] - c1[0] - 8, 3, V[4], 'opacity="0.8"');
  s += ell(f[0], f[1] + 1, hp * 0.2, hp * 0.035, V[3], 'opacity="0.6"');
  s += her(f[0], f[1], hp, {view: 'back', arms: [[14, 18], [14, 18]], coat: V[1], coatL: V[3], hair: V[0], skin: V[6], scarf: V[8], step: [1.5, 4]});
  for (const tx of [0.78, 1.3]) s += S(smoothD([cam.p(tx, 0, zf + 0.6), cam.p(tx - 0.3, 0, 4), cam.p(tx - 0.5, 0, 1.6)], false), V[2], 3, 'opacity="0.6"');
  // the threshold behind us: the door's steel sill across the bottom, the snow blown in over it in a drift (in the
  // hall's cool shadow, never as bright as the far door), her cart's tracks and her footprints through it
  s += P(smoothD([[-30, 1706], [140, 1692], [300, 1706], [470, 1688], [650, 1704], [820, 1686], [960, 1700], [1110, 1690], [1110, 1940], [-30, 1940]], true), V[7]);
  s += P(smoothD([[-30, 1748], [200, 1732], [450, 1750], [700, 1734], [950, 1748], [1110, 1736], [1110, 1940], [-30, 1940]], true), V[8]);
  for (let i = 0; i < 10; i++) s += P(blobD(rr(0, W), rr(1700, 1770), rr(40, 100), rr(6, 12), 8, 0.35), V[9], 'opacity="0.5"');
  for (const tx of [0.78, 1.3]) { const a = cam.p(tx - 0.5, 0, 1.6), b = [a[0] + (a[0] - 540) * 0.5, 1900]; s += S(lineD([a, b]), V[6], 9, 'opacity="0.8"'); }
  for (let i = 0; i < 5; i++) { const p = [700 + (i % 2) * 34, 1700 + i * 44]; s += ell(p[0], p[1], 14 + i * 2, 6 + i, V[7], 'opacity="0.8"'); }
  s += rect(0, 1872, W, 48, V[3]) + rect(0, 1872, W, 5, V[8]);
  s += P(smoothD([[-30, 1878], [200, 1862], [480, 1876], [760, 1860], [1110, 1872], [1110, 1890], [-30, 1890]], true), V[9]);
  // a few flakes blowing in over the sill, in the near air only
  for (let i = 0; i < 26; i++) { const x = rr(0, W), y = rr(1560, 1880); s += ell(x, y, rr(2.4, 5), rr(2.4, 5), '#f4f6f8', `opacity="${f1(rr(0.5, 0.9))}"`); }
  s += caption([{t: 'giant computers,', x: 520, y: 400, size: 112}, {t: 'data centers.', x: 560, y: 528, size: 112}]);
  return svgPage(s);
};

// ---------- B3: too hot for snow (round 2). The hot aisle behind the machines: both walls are their backs, dark faces
// whose grille slits glow with the heat inside like an oven's, deep honey near us to white-hot where the aisle meets; the
// glow spills onto the floor and onto her; far down the aisle the air bends in the haze. She stands near us in the
// middle, her coat flung open, fanning herself with her beanie, her hair lifting in the hot draught; the flakes blown in
// behind us shrink and turn to drops before they reach the machines ----------
FRAMES.B3 = () => {
  seed(23);
  const cam = Cam(950, 540, 1060, 1.7);
  const ax = 1.5, rh = 2.9, z0 = 1.25, z1 = 30;
  let s = '';
  s += `<linearGradient id="b3g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1100"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.28" stop-color="${C.paper}"/><stop offset="0.55" stop-color="${C.paper}"/><stop offset="0.66" stop-color="#e3c9a3"/><stop offset="1" stop-color="${V[6]}"/></linearGradient><rect x="0" y="0" width="${W}" height="${H}" fill="url(#b3g)"/>`;
  // the upper walls over the racks, warm-dark (all below the band)
  s += `<linearGradient id="b3w" gradientUnits="userSpaceOnUse" x1="0" y1="560" x2="0" y2="1000"><stop offset="0" stop-color="${C.paper}"/><stop offset="0.3" stop-color="#d9c3a2"/><stop offset="1" stop-color="${V[5]}"/></linearGradient>`;
  for (const sx of [-1, 1]) s += P(polyD([cam.p(sx * ax, rh, z0), cam.p(sx * ax, rh, z1), cam.p(sx * ax, 7, z1), cam.p(sx * ax, 7, z0)], 1), 'url(#b3w)', 'opacity="0.9"');
  // far away everything sits in the bending air (the haze filters bend the straight lines more with distance)
  const hz = {hz1: '', hz2: '', hz3: '', hz4: '', hz5: ''};
  const cuts = [[5.5, 8, 'hz1'], [8, 11, 'hz2'], [11, 15, 'hz3'], [15, 20, 'hz4'], [20, z1, 'hz5']];
  const hzOf = (z) => { for (const [a, b, k] of cuts) if (z >= a && z < b) return k; return ''; };
  let vents = '';
  const ventPts = [];
  for (let z = 9; z < 28; z += 3.6) { const a = cam.p(-0.7, 6.9, z), b = cam.p(0.7, 6.9, z + 1.0); if (b[1] < 650) continue; ventPts.push([(a[0] + b[0]) / 2, b[1]]); vents += hrect(a[0], b[1], b[0] - a[0], Math.max(5, a[1] - b[1]), V[2], 0.5) + rect(a[0] + 3, b[1] + 1, b[0] - a[0] - 6, 2, C.honeyL, 'opacity="0.5"'); }
  // the core: where the aisle meets, white-hot
  const vp = cam.p(0, 1.3, z1);
  const farWall = G(faceZ(cam, z1, -ax - 0.1, ax + 0.1, 0, 7, C.honeyC), 'filter="url(#hz5)"');
  // the floor: dark tiles, the core's light running down the middle of it
  s += P(polyD([cam.p(-ax, 0, z0), cam.p(-ax, 0, z1), cam.p(ax, 0, z1), cam.p(ax, 0, z0)]), V[3]);
  s += P(polyD([cam.p(-0.5, 0, z1), cam.p(0.5, 0, z1), cam.p(0.7, 0, z0), cam.p(-0.7, 0, z0)]), C.honey, 'opacity="0.2" filter="url(#b24)"');
  for (let z = z0; z < z1; z *= 1.16) { const ln = S(lineD([cam.p(-ax, 0, z), cam.p(ax, 0, z)]), V[1], 1.6, 'opacity="0.7"'); const k = z > 11 ? hzOf(z) : ''; if (k) hz[k] += ln; else s += ln; }
  for (const x of [-ax / 2, 0, ax / 2]) { s += S(lineD([cam.p(x, 0, z0), cam.p(x, 0, 11)]), V[1], 1.4, 'opacity="0.6"'); for (const [a, b, k] of cuts.slice(2)) hz[k] += S(lineD([cam.p(x, 0, a), cam.p(x, 0, b)]), V[1], 1.3, 'opacity="0.6"'); }
  // the glow the walls throw on the floor along their feet (honey near us, paler toward the core)
  for (const side of [-1, 1]) {
    s += P(polyD(q3(cam, [[side * ax * 0.99, 0, z0], [side * ax * 0.99, 0, z1], [side * ax * 0.62, 0, z1], [side * ax * 0.62, 0, z0]])), C.honeyD, 'opacity="0.3" filter="url(#b14)"');
    s += P(polyD(q3(cam, [[side * ax * 0.99, 0, z0], [side * ax * 0.99, 0, z1], [side * ax * 0.84, 0, z1], [side * ax * 0.84, 0, z0]])), C.honey, 'opacity="0.42" filter="url(#b8)"');
  }
  // the two walls: the machines' backs, dark, their slits glowing (near, mid, far: the far ones in the bending air)
  const slices = cuts.slice().reverse().map(([a, b, k]) => [a, b, k, a < 11 ? 'b4' : 'b2']).concat([[z0, 5.5, '', 'b8']]);
  hz.hz3 += vents;
  let nearWalls = '';
  for (const [za, zb, k, bl] of slices) {
    let g = '';
    for (const side of [-1, 1]) { const w = slitWall(cam, side * ax, rh, za, zb, z0, z1); g += w.base + G(w.glow, `filter="url(#${bl})"`) + w.core; }
    if (k) hz[k] += g; else nearWalls += g;
  }
  // the white-hot core behind the far machines, so their dark edges shiver against it; a veil of hot air over them
  s += farWall + ell(vp[0], vp[1], 170, 220, C.honeyC, 'opacity="0.9" filter="url(#b40)"') + ell(vp[0], vp[1], 70, 110, '#fffaf0', 'opacity="0.95" filter="url(#b14)"');
  for (const k of ['hz5', 'hz4', 'hz3', 'hz2', 'hz1']) s += G(hz[k], `filter="url(#${k})"`);
  s += ell(vp[0], vp[1], 120, 150, '#fffaf0', 'opacity="0.42" filter="url(#b40)"');
  s += nearWalls;
  // the heat lifting off the backs in soft warm veils, up toward the vents
  for (const side of [-1, 1]) {
    const X = side * ax;
    for (let i = 0; i < 9; i++) {
      const z = z0 + 1 + i * 2.2, base = cam.p(X * 0.92, rh, z), up = cam.sz(3.6, z);
      s += P(blobD(base[0] - side * up * 0.08, base[1] - up * 0.45, cam.sz(0.5, z), up * 0.5, 9, 0.25), C.honeyC, 'opacity="0.2" filter="url(#b14)"');
    }
  }
  for (const [vx, vy] of ventPts) s += steam(vx, vy + 34, 90, 70, {n: 4, col: C.honeyC, op: 0.35, warm: false});
  // her, near, in the middle of the aisle: coat flung open, fanning herself with her beanie, the walls' heat on her
  const zf = 2.6, f = cam.p(-0.28, 0, zf), hp = cam.sz(1.7, zf);
  s += ell(f[0], f[1] + 4, hp * 0.26, hp * 0.04, C.honeyD, 'opacity="0.45" filter="url(#b4)"') + ell(f[0], f[1] + 3, hp * 0.16, hp * 0.025, V[0], 'opacity="0.6"');
  s += herHot(f[0], f[1], hp, {coat: V[2], knit: V[10], hair: V[1], skin: V[8], hatCol: V[6]});
  // the flakes blown in behind us: big and white at the edges, shrinking and wet as they go in, drops and little
  // puffs before they reach the machines
  for (let i = 0; i < 46; i++) {
    const ang = rr(0, Math.PI * 2), d = rr(0.15, 1), x = 540 + Math.cos(ang) * d * 600, y = 1240 + Math.sin(ang) * d * 760;
    if (y < 650 || y > 1900 || x < 0 || x > W) continue;
    if (d > 0.68) s += flakeStar(x, y, rr(5, 8), 0.95, rr(0, 1));
    else if (d > 0.42) s += ell(x, y, 3.4, 3.4, '#f6f7f8', 'opacity="0.85"') + ell(x + 1, y + 1, 1.2, 1.2, C.honeyL, 'opacity="0.8"');
    else s += P(smoothD([[x, y - 6], [x + 3, y + 1], [x, y + 4], [x - 3, y + 1]], true), '#f3efe6', 'opacity="0.85"') + ell(x, y - 12, 8, 6, '#ffffff', 'opacity="0.3" filter="url(#b4)"');
  }
  // the hall's top dissolves into the band's calm light (nothing in the band but the words)
  s += `<linearGradient id="b3up" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="720"><stop offset="0" stop-color="${C.paperT}" stop-opacity="1"/><stop offset="0.82" stop-color="${C.paper}" stop-opacity="1"/><stop offset="1" stop-color="${C.paper}" stop-opacity="0"/></linearGradient><rect x="0" y="0" width="${W}" height="720" fill="url(#b3up)"/>`;
  s += caption([{t: 'really', x: 340, y: 380, size: 112}, {t: 'hot.', x: 600, y: 520, lit: true, size: 170}]);
  return svgPage(s, hazeDefs());
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
  // closer and lower: one giant computer's door swung wide toward us, its inside BLAZING honey with the boiling: forty
  // kettles in eight rows of five catching the light, a jet of steam curling up off every spout and all of it rolling
  // out over the top in one cloud; the row around it and the floor stay cool. She steps back from it, both hands up, her
  // face tipped up to the top of the wall (round 2)
  seed(41);
  const cam = Cam(800, 520, 1387, 0.8);
  const zc = 2.9, Xl = -0.75, Xr = 0.85, Ht = 3.0;
  let s = '';
  s += `<linearGradient id="ceil4" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1920"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.15" stop-color="${C.paper}"/><stop offset="0.32" stop-color="${C.paper}"/><stop offset="0.45" stop-color="${V[10]}"/><stop offset="0.72" stop-color="${V[8]}"/><stop offset="1" stop-color="${V[6]}"/></linearGradient><rect x="0" y="0" width="${W}" height="${H}" fill="url(#ceil4)"/>`;
  // the row of computers going on behind her (right), dark, their small cool lights; the floor's tiles
  for (let i = 6; i >= 0; i--) { const z = 6.5 + i * 1.6, X1 = 1.9 + i * 0.25; const a = cam.p(X1, 2.4, z), b = cam.p(X1 + 0.6, 0, z); s += rackFront(a[0], a[1], b[0] - a[0], b[1] - a[1], {density: 0.7, body: V[3], door: V[4]}); }
  s += P(blobD(840, 1180, 330, 520, 10, 0.12), V[10], 'opacity="0.5" filter="url(#b40)"');
  s += P(polyD([[0, 1600], [W, 1600], [W, H], [0, H]]), V[7], 'opacity="0.5"');
  for (const z of [1.6, 2.1, 2.9, 4.2, 6.4]) s += S(lineD([cam.p(-4, 0, z), cam.p(6, 0, z)]), V[6], 1.6, 'opacity="0.7"');
  for (const X of [-1.2, -0.4, 0.4, 1.2, 2.0, 2.8]) s += S(lineD([cam.p(X, 0, 1.2), cam.p(X, 0, 9)]), V[6], 1.4, 'opacity="0.6"');
  // the open computer: its body, and its inside blazing honey with the boiling (a bloom only at the opening)
  const tl = cam.p(Xl, Ht, zc), br = cam.p(Xr, 0, zc), w = br[0] - tl[0], h = br[1] - tl[1];
  s += rect(tl[0] - 22, tl[1] - 26, w + 44, h + 36, C.honey, 'opacity="0.4" filter="url(#b24)"');
  s += hrect(tl[0] - 16, tl[1] - 18, w + 32, h + 22, V[0], 1);
  s += `<radialGradient id="k4in" gradientUnits="userSpaceOnUse" cx="${f1(tl[0] + w / 2)}" cy="${f1(tl[1] + h * 0.42)}" r="${f1(h * 0.66)}"><stop offset="0" stop-color="${C.honeyC}"/><stop offset="0.45" stop-color="${C.honeyL}"/><stop offset="1" stop-color="${C.honey}"/></radialGradient>`;
  s += hrect(tl[0], tl[1], w, h, 'url(#k4in)', 0.8);
  // eight shelves of five kettles, the shelves and the kettles catching the blaze, their water gauges glowing
  const rows = 8, cols = 5, ch = h / rows, cw = w / cols;
  const spouts = [];
  for (let r = 0; r < rows; r++) {
    const sy = tl[1] + (r + 1) * ch;
    s += rect(tl[0] + 4, sy - 8, w - 8, 9, C.honeyW) + rect(tl[0] + 4, sy - 8, w - 8, 2.4, C.honeyC, 'opacity="0.9"');
    for (let c = 0; c < cols; c++) {
      const kx = tl[0] + (c + 0.56) * cw + rr(-2, 2), ks = ch * 0.74;
      s += ell(kx + ks * 0.05, sy - 9, ks * 0.4, ks * 0.06, C.honeyW, 'opacity="0.6" filter="url(#b2)"');
      s += kettleLit(kx, sy - 8, ks);
      spouts.push([kx - 0.47 * ks, sy - 8 - 0.79 * ks, r, c]);
    }
  }
  // the boil: a jet of steam curling up off every spout (up the gaps between the kettles, the bodies crisp)
  for (const [sx, sy, r, c] of spouts) s += steamJet(sx, sy, ch * (r === 0 ? 1.15 : 0.95), {dir: -1, ph: r * 1.7 + c * 2.3, op: 0.9, w: ch * 0.075});
  s += ell(tl[0] + w / 2, br[1] + 10, w * 0.8, 40, C.honey, 'opacity="0.28" filter="url(#b14)"');
  // the door swung wide toward us on its left hinge: its inner face dark, perforated, its lights dead
  const ang = 115 * Math.PI / 180, dw = 1.6;
  const fe = [Xl + dw * Math.cos(ang), zc - dw * Math.sin(ang)];
  const dq = (t, Y) => cam.p(Xl + (fe[0] - Xl) * t, Y, zc + (fe[1] - zc) * t);
  const Dh = 2.45;
  s += P(polyD([dq(0, Dh + 0.02), dq(1, Dh + 0.02), dq(1, -0.02), dq(0, -0.02)], 0.6), V[1]);
  s += P(polyD([dq(0.03, Dh - 0.06), dq(0.97, Dh - 0.06), dq(0.97, 0.06), dq(0.03, 0.06)], 0.6), V[4]);
  s += P(polyD([dq(0.03, Dh - 0.06), dq(0.4, Dh - 0.06), dq(0.4, 0.06), dq(0.03, 0.06)], 0.6), C.honey, 'opacity="0.16"');
  for (let i = 1; i < 18; i++) for (let k = 1; k < 16; k++) { const t = i / 18, Y = k * Dh / 16, p = dq(t, Y), zz = zc + (fe[1] - zc) * t; s += ell(p[0], p[1], Math.max(1, cam.sz(0.012, zz)), Math.max(1, cam.sz(0.012, zz)), V[2], 'opacity="0.8"'); }
  s += S(lineD([dq(0, Dh), dq(1, Dh)]), V[6], 4, 'opacity="0.9"') + S(lineD([dq(0, 0), dq(1, 0)]), V[1], 3);
  { const hA = dq(0.86, 1.15), hB = dq(0.86, 1.55); s += S(lineD([hA, hB]), V[8], Math.max(4, cam.sz(0.03, 1.8)), 'opacity="0.9"'); }
  // the forty jets gather into ONE cloud rolling out over the computer's top, lit warm from below by the blaze
  s += rollCloud(tl[0] + w / 2, tl[1] - 4, w * 1.7, 290);
  // her, a step back from it, both hands up, her face tipped up to the top of the wall; the blaze's light on her front
  const fz = 3.3, f = cam.p(1.5, 0, fz), hp = cam.sz(1.7, fz);
  s += ell(f[0] + hp * 0.03, f[1] + 3, hp * 0.24, hp * 0.035, V[4], 'opacity="0.6"');
  s += herRecoil(f[0], f[1], hp, {dir: -1, coat: V[2], coatL: V[3], hair: V[1], skin: mixHex(V[8], C.honeyL, 0.3), hand: mixHex(V[8], C.honeyL, 0.4), scarf: V[8], rim: C.honeyL});
  // the high hall's light over it all (the band stays calm)
  s += `<linearGradient id="b4up" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="700"><stop offset="0" stop-color="${C.paperT}" stop-opacity="1"/><stop offset="0.86" stop-color="${C.paper}" stop-opacity="1"/><stop offset="1" stop-color="${C.paper}" stop-opacity="0"/></linearGradient><rect x="0" y="0" width="${W}" height="700" fill="url(#b4up)"/>`;
  s += caption([{t: '40', x: 470, y: 500, lit: true, size: 250}, {t: 'kettles,', x: 760, y: 572, size: 112}]);
  const jetDefs = `<linearGradient id="jetg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#d8d8d8"/><stop offset="1" stop-color="#000000"/></linearGradient><mask id="jetfade" maskContentUnits="objectBoundingBox"><rect x="0" y="0" width="1" height="1" fill="url(#jetg)"/></mask>`;
  return svgPage(s, jetDefs);
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

// ---------- B5 (reworked in round 1): one cup, raised. Close on the open computer: its forty kettles boiling in rows
// that run out of the frame on every side, their steam rolling up into one cloud; in front, her hand comes in and
// raises ONE mug to them, a toast (her mug: it comes back in her window at the end) ----------
FRAMES.B5 = () => {
  seed(52);
  let s = '';
  s += `<linearGradient id="c5" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1920"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.16" stop-color="${C.paper}"/><stop offset="0.36" stop-color="${C.paper}"/><stop offset="0.5" stop-color="${V[12]}"/><stop offset="1" stop-color="${V[10]}"/></linearGradient><rect x="0" y="0" width="${W}" height="${H}" fill="url(#c5)"/>`;
  // the wall of kettles inside the computer: shelves and kettles in rows, softened (they sit back), running out of the
  // frame; the water gauges glowing; every spout puffing
  let wall = '';
  const cw = 212, rh = 196, x0 = -70, y0 = 700;
  for (let r = 0; r < 7; r++) {
    const sy = y0 + r * rh;
    wall += rect(-20, sy + 2, W + 40, 12, V[6]) + rect(-20, sy + 14, W + 40, 5, V[4], 'opacity="0.6"');
    for (let c = 0; c < 6; c++) {
      const kx = x0 + c * cw + (r % 2) * 18 + rr(-4, 4);
      wall += kettle(kx, sy + 2, 150, {steamOn: false, body: V[11], shade: V[9], dark: V[6], gauge: C.honey});
      wall += steam(kx - 66, sy - 128, 70, 150, {n: 5, col: '#f7f8f9', op: 0.95, lean: -0.14, sharp: true});
    }
  }
  s += G(wall, 'opacity="0.78" filter="url(#b2)"');
  // the haze of their boiling over the wall, and the one cloud rolling up out of the top
  s += rect(0, 640, W, 1280, V[12], 'opacity="0.22"');
  s += steam(540, 860, 1300, 260, {n: 9, col: '#f3f4f6', op: 0.9, root: 0.2});
  s += steam(200, 900, 700, 240, {n: 7, col: '#f4f5f7', op: 0.7});
  s += steam(880, 900, 700, 240, {n: 7, col: '#f4f5f7', op: 0.7, lean: 0.1});
  s += rect(0, 600, W, 120, '#f1f1f0', 'opacity="0.55" filter="url(#b24)"');
  // her sleeve and hand from the right, raising the one mug (tilted a little toward them: cheers)
  const mx = 480, my = 1200, mw = 300;
  let hand = '';
  hand += limb([[1200, 1700], [1040, 1500], [900, 1360]], [230, 180, 130], V[2]);
  hand += S(smoothD([[1170, 1590], [1030, 1440], [930, 1360]], false), V[4], 8, 'opacity="0.55"');
  // the knit cuff of her sweater
  hand += limb([[928, 1386], [880, 1338]], [128, 118], V[9]);
  for (let i = -3; i <= 3; i++) hand += S(lineD([[916 + i * 15, 1396 + i * 13], [880 + i * 15, 1360 + i * 13]]), V[8], 3, 'opacity="0.75"');
  // the back of her hand round the handle, the fingers curled into its loop, the thumb laid along its top
  hand += P(smoothD([[884, 1350], [902, 1290], [880, 1214], [832, 1170], [790, 1166], [756, 1186], [744, 1226], [748, 1270], [764, 1310], [800, 1344], [846, 1360]], true), V[8]);
  for (const [cx2, cy2] of [[748, 1212], [745, 1248], [752, 1284], [770, 1314]]) hand += S(smoothD([[cx2 + 22, cy2 - 8], [cx2 + 6, cy2], [cx2 + 22, cy2 + 10]], false), V[6], 3.4, 'opacity="0.75"');
  hand += limb([[846, 1182], [790, 1144], [742, 1128]], [40, 32, 26], V[8]);
  hand += S(smoothD([[856, 1176], [796, 1136], [742, 1118]], false), C.honeyL, 4, 'opacity="0.6"');
  hand += S(smoothD([[896, 1300], [892, 1240], [866, 1196]], false), C.honeyL, 4, 'opacity="0.4"');
  s += G(herMug(mx, my, mw, {dir: 1, steamH: 12}) + hand, `transform="rotate(-7 ${mx} ${my})"`);
  s += ell(mx - 20, my - 190, 150, 40, C.honeyL, 'opacity="0.35" filter="url(#b14)"');
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
  s += roofFan(900, 1350, 76, 76 * 0.26, {dh: 24, glow: 0.7});
  s += warmAir(900, 1342, 90, 220, {op: 0.45, n: 6});
  // THE near fan: big, its drum, its blades turning, the hall's warmth coming up between them
  const cx = 470, cy = 1572, rx = 330, ry = rx * 0.27;
  s += roofFan(cx, cy, rx, ry, {dh: rx * 0.36, rot: 0.25});
  // the warm air: honey at the mouth, a clear warm shimmer climbing, thinning to nothing in the dark
  const top = 700, hh = cy - top;
  s += warmAir(cx, cy - ry * 0.4, rx * 1.1, hh, {op: 0.8, lean: 0.02, n: 11, root: C.honey});
  // the snow lifted inside it: soft stars rising with faint trails below them, the higher the fainter, melting away
  // near the top; everywhere else it falls, with faint trails above
  for (let i = 0; i < 64; i++) {
    const t = Math.pow(rnd(), 0.9), y = cy - ry - 30 - t * (hh - 90);
    const half = rx * (0.55 + 0.5 * t), x = cx + rr(-half, half) * 0.86;
    const r = rr(4.5, 8) * (1.15 - t * 0.55), op = 0.98 - t * 0.62;
    s += S(lineD([[x, y + r], [x + rr(-4, 4), y + r + rr(26, 52) * (1.1 - t * 0.5)]]), '#f4f6f8', r * 0.7, `opacity="${f1(op * 0.28)}" filter="url(#b2)"`);
    s += flakeStar(x, y, r, op, rr(0, 1));
  }
  // her, small beside the fan, looking up as the warmth goes, a hand lifted to feel it pass
  s += ell(862, 1516, 46, 8, V[2], 'opacity="0.6"');
  s += her(862, 1512, 186, {view: 'back', arms: [[10, 6], [44, 70]], coat: V[1], coatL: V[3], hair: V[0], skin: V[6], scarf: V[8], rim: C.honeyL, rimSide: -1, lift: 0.3});
  // the snow falling where the heat isn't (kept out of the warm column)
  { let g = ''; for (let i = 0; i < 230; i++) { const x = rr(0, W), y = rr(610, 1920); const t = clamp((cy - y) / hh, 0, 1), half = rx * (0.6 + 0.5 * t) + 40; if (y < cy && y > top - 40 && Math.abs(x - cx) < half) continue; const r = rr(1.4, 3.8); g += S(lineD([[x, y - r], [x, y - r - rr(8, 20)]]), '#f4f5f7', r * 0.6, 'opacity="0.18"') + ell(x, y, r, r * rr(0.85, 1.1), '#f4f5f7', `opacity="${f1(rr(0.35, 0.8))}"`); } s += g; }
  s += caption([{t: 'big fans', x: 380, y: 400, size: 112}, {t: 'blow that heat outside.', x: 545, y: 522, size: 100}]);
  return svgPage(s);
};

// ======================================================================================
// B10: cool in, honey out. Inside the drawn hall on the snowy lot: its walls and roof are only pencil lines, so the
// night, the falling snow and the city's warm windows show through them. Near us, one giant computer stands open, its
// door swung wide: a cold pipe, frosted white, comes in at its foot and winds back and forth over every shelf of chips,
// going wet, then warm, and leaves at its top with a breath of steam, through the valve under her hand, into the big
// warm pipe that runs out through the drawn wall toward the city's windows.
// ======================================================================================
FRAMES.B10 = () => {
  seed(101);
  const cam = Cam(900, 540, 1150, 1.6);
  let s = '';
  s += `<linearGradient id="sky10" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1152"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.25" stop-color="${C.paper}"/><stop offset="0.52" stop-color="${C.paper}"/><stop offset="0.6" stop-color="${V[9]}"/><stop offset="0.78" stop-color="${V[5]}"/><stop offset="1" stop-color="${V[6]}"/></linearGradient><rect x="0" y="0" width="${W}" height="1152" fill="url(#sky10)"/>`;
  // seen through the drawn walls: the harbour's ice (left), and across the lot the city's old blocks, their windows warm
  s += P(polyD([[0, 1152], [0, 1120], [380, 1126], [380, 1152]], 0.6), V[8]);
  const city = [[560, 1152], [560, 1060], [640, 1060], [640, 1040], [760, 1040], [760, 1066], [860, 1066], [860, 1030], [980, 1030], [980, 1056], [1080, 1056], [1080, 1152]];
  s += P(polyD(city, 0.8), V[3]) + P(polyD([[552, 1062], [600, 1034], [648, 1062]], 0.5), V[2]) + P(polyD([[852, 1032], [920, 1004], [988, 1032]], 0.5), V[2]);
  for (let i = 0; i < 70; i++) { const x = rr(566, 1074); const top = x < 640 ? 1068 : x < 760 ? 1048 : x < 860 ? 1074 : x < 980 ? 1038 : 1064; if (rnd() < 0.82) s += rect(x, rr(top, 1140), 5, 8, C.honey, `opacity="${f1(rr(0.65, 1))}"`); }
  s += ell(820, 1090, 300, 50, C.honey, 'opacity="0.14" filter="url(#b24)"');
  // the floor: the lot's snow inside the drawing, the floor's pencil grid
  s += P(polyD([[0, 1150], [W, 1150], [W, H], [0, H]]), V[8]);
  for (const [y1, col] of [[1300, V[7]], [1520, V[6]], [1760, V[5]]]) s += P(polyD([[0, y1], [W, y1 - 8], [W, H], [0, H]], 2), col);
  seed(102);
  for (let z = 3.2; z < 40; z *= 1.3) s += softPencil([cam.p(-8, 0, z), cam.p(8, 0, z)], 1.6, {op: 0.3, passes: 1});
  // the drawn walls and roof: pencil only (the night shows through)
  const H1 = 8.5;
  for (const x of [-7, 7]) {
    s += softPencil([cam.p(x, 0, 3.0), cam.p(x, 0, 40)], 2.6, {op: 0.65});
    s += softPencil([cam.p(x, H1, 6.4), cam.p(x, H1, 40)], 3, {op: 0.7});
    for (let z = 6; z < 40; z *= 1.45) s += softPencil([cam.p(x, 0, z), cam.p(x, H1, z)], 2, {op: 0.42, over: 6});
  }
  s += softPencil([cam.p(-7, 0, 40), cam.p(-7, H1, 40), cam.p(7, H1, 40), cam.p(7, 0, 40)], 2.4, {op: 0.55});
  for (let z = 8; z < 40; z *= 1.5) s += softPencil([cam.p(-7, H1, z), cam.p(7, H1, z)], 1.6, {op: 0.3, passes: 1});
  // the back rows: a few machines, quiet, their small lights and their pipes
  for (const [z, xs] of [[16, [-4.6, -2.8, 1.4, 3.2]], [11, [-4.4, 2.6]]]) for (const x1 of xs) {
    s += faceZ(cam, z, x1, x1 + 1.2, 0, 2.3, V[3]) + faceZ(cam, z - 0.01, x1 + 0.1, x1 + 1.1, 0.1, 2.2, V[4]);
    for (let k = 0; k < 5; k++) { const p = cam.p(x1 + 0.3, 0.4 + k * 0.4, z - 0.02); s += ell(p[0], p[1], 1.4, 1.4, '#e8f6fb', 'opacity="0.7"'); }
    s += S(lineD([cam.p(x1 + 0.6, 2.3, z - 0.05), cam.p(x1 + 0.6, 3.3, z - 0.05)]), C.honey, cam.sz(0.12, z), 'opacity="0.75"');
  }
  // the big warm pipe overhead, collecting them, running out through the drawn wall on the right toward the city
  const bp = [cam.p(-4, 2.6, 16), cam.p(0.0, 2.6, 16), cam.p(0.0, 2.6, 2.8), cam.p(2.0, 2.6, 2.8), cam.p(5.0, 2.6, 4.4), cam.p(12, 2.6, 9)];
  s += S(lineD(bp), C.honeyD, 28) + S(lineD(bp), C.honey, 18) + S(lineD(bp), C.honeyL, 5, 'opacity="0.8"');
  { const p = cam.p(4.2, 2.6, 4.0); s += ell(p[0], p[1], 60, 40, C.honeyL, 'opacity="0.3" filter="url(#b14)"'); }
  // THE ONE OPEN: near, its door swung wide toward us, its six shelves of chips; the cold pipe comes in frosted at its
  // foot and winds over every shelf, going wet, then warm, and leaves at its top with a breath of steam
  const zN = 2.6, X0 = -1.25, X1n = -0.3, Ht = 1.8;
  const tl = cam.p(X0, Ht, zN), br = cam.p(X1n, 0, zN), w = br[0] - tl[0], hh = br[1] - tl[1];
  const ang = 112 * Math.PI / 180, dw = 0.95, fe = [X0 + dw * Math.cos(ang), zN - dw * Math.sin(ang)];
  const dq = (t, Y) => cam.p(X0 + (fe[0] - X0) * t, Y, zN + (fe[1] - zN) * t);
  s += hrect(tl[0] - 16, tl[1] - 16, w + 32, hh + 20, V[0], 1) + hrect(tl[0], tl[1], w, hh, V[2], 0.8);
  const rows = 5, shelfY = (r) => br[1] - 30 - r * (hh - 70) / (rows - 1);
  for (let r = 0; r < rows; r++) {
    const sy = shelfY(r);
    s += hrect(tl[0] + 10, sy - 50, w - 20, 40, V[1], 0.5);
    for (let k = 0; k < 4; k++) s += hrect(tl[0] + 22 + k * (w - 44) / 4, sy - 42, (w - 44) / 4 - 10, 22, V[4], 0.4) + rect(tl[0] + 26 + k * (w - 44) / 4, sy - 38, 4, 4, '#dff2f8', 'opacity="0.8"');
  }
  // the pipe's path: in from the left along the floor, up into the foot, back and forth over each shelf, out at the top
  const path = [[-60, br[1] + 34], [tl[0] - 30, br[1] + 34], [tl[0] + 26, br[1] - 14]];
  for (let r = 0; r < rows; r++) { const y = shelfY(r) - 30; const left = r % 2 === 0; path.push(left ? [tl[0] + 26, y] : [tl[0] + w - 26, y]); path.push(left ? [tl[0] + w - 26, y] : [tl[0] + 26, y]); }
  const ex = cam.p(X1n + 0.02, 1.62, zN), vv = cam.p(0.02, 1.62, zN), up = cam.p(0.02, 2.6, 2.8);
  path.push([tl[0] + w - 26, ex[1]], [ex[0] + 16, ex[1]], [vv[0], vv[1]], [up[0], up[1]]);
  for (let i = 0; i < path.length - 1; i++) {
    const t = i / (path.length - 2);
    const col = t < 0.28 ? '#dfe4e8' : t < 0.5 ? V[9] : t < 0.7 ? C.honeyL : C.honey;
    const dk = t < 0.5 ? V[5] : C.honeyD;
    s += S(lineD([path[i], path[i + 1]]), dk, 26) + S(lineD([path[i], path[i + 1]]), col, 16);
    if (t >= 0.5) s += S(lineD([path[i], path[i + 1]]), C.honeyL, 5, 'opacity="0.7"');
  }
  // frost on the cold pipe: a white crust, crystals, a few icicles; drops where it turns wet; heat shimmer where warm
  for (let i = 0; i < 3; i++) { const a2 = path[i], b2 = path[i + 1]; for (let k = 0; k < 16; k++) { const t = rnd(), x = lerp(a2[0], b2[0], t), y = lerp(a2[1], b2[1], t); s += ell(x + rr(-6, 6), y - rr(6, 12), rr(3, 6), rr(2, 4), '#ffffff', 'opacity="0.9"'); if (rnd() < 0.3) s += P(polyD([[x - 3, y + 10], [x + 3, y + 10], [x, y + rr(20, 34)]], 0.2), '#eef4f7', 'opacity="0.9"'); } }
  for (let i = 0; i < 9; i++) { const p = path[3 + (i % 4)]; s += ell(p[0] + rr(-60, 60), p[1] + rr(10, 20), 2.4, 3.6, '#e8eef2', 'opacity="0.8"'); }
  s += steam(ex[0] + 26, ex[1] - 18, 80, 130, {n: 5, warm: true, col: V[13], op: 0.8, lean: 0.05});
  // the door swung wide (left), its inner face perforated
  s += P(polyD([dq(0, Ht + 0.02), dq(1, Ht + 0.02), dq(1, -0.02), dq(0, -0.02)], 0.6), V[1]) + P(polyD([dq(0.04, Ht - 0.06), dq(0.96, Ht - 0.06), dq(0.96, 0.06), dq(0.04, 0.06)], 0.6), V[3]);
  for (let i = 1; i < 12; i++) for (let k = 1; k < 14; k++) { const p = dq(i / 12, k * Ht / 14), zz = zN + (fe[1] - zN) * i / 12; s += ell(p[0], p[1], Math.max(1, cam.sz(0.01, zz)), Math.max(1, cam.sz(0.01, zz)), V[1], 'opacity="0.8"'); }
  // the valve on the warm pipe where it leaves, a wheel; her hand on it
  const vx = vv[0], vy = vv[1];
  s += ell(vx, vy, 34, 34, V[0]) + ell(vx, vy, 26, 26, C.honeyD) + ell(vx, vy, 8, 8, V[0]);
  for (let i = 0; i < 4; i++) { const a2 = i * Math.PI / 2 + 0.4; s += S(lineD([[vx, vy], [vx + Math.cos(a2) * 26, vy + Math.sin(a2) * 26]]), V[0], 5); }
  s += ell(vx, vy, 60, 60, C.honeyL, 'opacity="0.3" filter="url(#b14)"');
  // her, near, in profile, her hand on the valve, lit by the warm pipe
  const fz = 2.35, f = cam.p(0.5, 0, fz), hp = cam.sz(1.7, fz);
  s += ell(f[0] - 10, f[1] + 4, hp * 0.16, hp * 0.03, V[3], 'opacity="0.6"');
  s += her(f[0], f[1], hp, {view: 'side', dir: -1, step: [3, 4], arms: [[-6, 10], [95, 53]], coat: V[2], coatL: V[4], hair: V[1], hairL: C.honeyD, skin: V[8], scarf: V[9], rim: C.honeyL, lean: 3});
  s += S(smoothD([[f[0] - hp * 0.06, f[1] - hp * 0.78], [f[0] - hp * 0.07, f[1] - hp * 0.6], [f[0] - hp * 0.075, f[1] - hp * 0.4]], false), C.honeyL, 3, 'opacity="0.55"');
  s += snowfall(220, 0, 1920);
  s += caption([{t: 'with water', x: 420, y: 400, size: 112}, {t: 'in pipes.', x: 640, y: 522, lit: true, size: 150}]);
  return svgPage(s);
};

// ======================================================================================
// B12: your chat, a warm window. On the street below her old house, near: your gloved hand holds your phone (bottom
// left), your chat bubble popping; from your feet the warm line runs through the snow to her door; above, her window a
// step warmer, flung open, and her leaning out on the sill raising her mug to you (the mug from the forty kettles: the
// toast, now hers); down the quay to the left, the row's warm windows and, at its end, the hall still drawn in pencil.
// ======================================================================================
FRAMES.B12 = () => {
  seed(121);
  const cam = Cam(1000, 130, 1290, 1.7);
  let s = '';
  s += `<linearGradient id="sky12" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1292"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.24" stop-color="${C.paper}"/><stop offset="0.47" stop-color="${C.paper}"/><stop offset="0.54" stop-color="${V[10]}"/><stop offset="0.72" stop-color="${V[6]}"/><stop offset="1" stop-color="${V[7]}"/></linearGradient><rect x="0" y="0" width="${W}" height="1292" fill="url(#sky12)"/>`;
  // the snow of the street and the quay, everywhere under the night (darker toward us)
  s += P(polyD([[0, 1288], [W, 1288], [W, H], [0, H]]), V[8]);
  for (const [z1, col] of [[30, V[7]], [12, V[6]], [6, V[5]], [3.2, V[4]]]) { const y = cam.p(0, 0, z1)[1]; s += P(smoothD([[-20, y], [300, y - 6], [700, y + 4], [1100, y - 4], [1100, H + 20], [-20, H + 20]], true), col); }
  s += P(polyD([cam.p(-9, 0.1, 8), cam.p(-9, 0.1, 160), cam.p(-8, 0.9, 160), cam.p(-8, 0.9, 8)], 1), V[10]);
  // the quay's end, far: the hall still a pencil drawing, its computers' small lights painted inside; the harbour
  s += P(polyD([[0, 1290], [0, 1276], [60, 1280], [60, 1290]], 0.4), V[9]);
  { const z = 140, a = cam.p(-7, 0, z), b = cam.p(3.5, 14, z); seed(5); for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) if (rnd() < 0.8) s += rect(a[0] + 3 + i * (b[0] - a[0] - 6) / 9, b[1] + 6 + r * (a[1] - b[1] - 10) / 4, 2.2, 2.2, '#e6f4f8'); s += softPencil([[a[0], a[1]], [a[0], b[1]], [b[0], b[1]], [b[0], a[1]]], 2, {op: 0.9, passes: 2}); s += rect(a[0] + (b[0] - a[0]) * 0.3, a[1] - 18, (b[0] - a[0]) * 0.4, 18, '#dcebf0', 'opacity="0.8"'); s += ell((a[0] + b[0]) / 2, a[1] - 6, 70, 18, '#eaf4f7', 'opacity="0.3" filter="url(#b8)"'); }
  seed(121);
  // the row along the quay, receding to its end: shoulder to shoulder, roofs under the band, their windows warm
  const RX = 4.0;
  for (const [z1, z2, hgt, col] of [[40.4, 110, 19, V[2]], [18.2, 40, 11.5, V[3]]]) {
    s += facadeX(cam, RX, z1, z2, 0, hgt, col);
    s += poly3(cam, [[RX, hgt, z1], [RX, hgt, z2], [RX + 1.6, hgt + 1.6, z2], [RX + 1.6, hgt + 1.6, z1]], V[1]);
    s += S(lineD([cam.p(RX + 0.05, hgt + 0.08, z1), cam.p(RX + 0.05, hgt + 0.08, z2)]), V[12], 2.4, 'opacity="0.85"');
    for (let y1 = 3.6; y1 + 1.7 < hgt - 0.5; y1 += 3.1) for (let zz = z1 + 0.9; zz < z2 - 1.2; zz += 1.9) { const q = q3(cam, [[RX, y1, zz], [RX, y1, zz + 1.1], [RX, y1 + 1.7, zz + 1.1], [RX, y1 + 1.7, zz]]); s += P(polyD(q, 0.3), rnd() < 0.88 ? C.honey : V[1], 'opacity="0.88"'); }
    for (let zz = z1 + 1.4; zz < z2 - 2; zz += 4.6) { const q = q3(cam, [[RX, 0.5, zz], [RX, 0.5, zz + 2], [RX, 2.4, zz + 2], [RX, 2.4, zz]]); s += P(polyD(q, 0.3), C.honey, 'opacity="0.7"'); }
  }
  // HER HOUSE, near, front-on: a rough granite base, a snowy cornice; her door with its lit transom; her window above,
  // flung open, a step warmer
  const hz = 7.6, hx1 = RX, hx2 = 16, hT = 6.4;
  // its side wall along the quay (the row's first house), its windows warm, its cornice
  s += facadeX(cam, RX, hz, 18, 0, hT, V[2]) + facadeX(cam, RX, hz, 18, 0, 1.2, V[3]);
  for (const y1 of [3.9]) for (let zz = hz + 1.2; zz < 17; zz += 2.1) s += P(polyD(q3(cam, [[RX, y1, zz], [RX, y1, zz + 1.1], [RX, y1 + 1.8, zz + 1.1], [RX, y1 + 1.8, zz]]), 0.3), C.honey, 'opacity="0.85"');
  for (let zz = hz + 1.6; zz < 16.5; zz += 3.6) s += P(polyD(q3(cam, [[RX, 0.6, zz], [RX, 0.6, zz + 1.6], [RX, 2.4, zz + 1.6], [RX, 2.4, zz]]), 0.3), C.honey, 'opacity="0.7"');
  s += S(lineD([cam.p(RX + 0.03, hT + 0.07, hz), cam.p(RX + 0.03, hT + 0.07, 18)]), V[12], 4);
  s += faceZ(cam, hz, hx1, hx2, 0, hT, V[3]);
  s += faceZ(cam, hz - 0.01, hx1, hx2, 0, 1.2, V[4]);
  for (let yy = 0.3; yy < 1.2; yy += 0.42) s += S(lineD([cam.p(hx1, yy, hz - 0.02), cam.p(hx2, yy, hz - 0.02)]), V[3], 2, 'opacity="0.7"');
  s += S(lineD([cam.p(hx1, 3.45, hz - 0.02), cam.p(hx2, 3.45, hz - 0.02)]), V[5], 5, 'opacity="0.8"');
  s += faceZ(cam, hz - 0.02, hx1 - 0.15, hx2, hT - 0.3, hT + 0.05, V[5]) + S(lineD([cam.p(hx1 - 0.15, hT + 0.07, hz - 0.03), cam.p(hx2, hT + 0.07, hz - 0.03)]), V[12], 6);
  { const a = cam.p(7.4, 2.9, hz - 0.03), b = cam.p(8.7, 1.4, hz - 0.03); s += win(a[0], a[1], b[0] - a[0], b[1] - a[1], {lit: true, glow: 0.5, core: false}); }
  const da = cam.p(4.35, 2.7, hz - 0.03), db = cam.p(5.45, 0, hz - 0.03);
  s += hrect(da[0], da[1], db[0] - da[0], db[1] - da[1], V[1], 0.5) + rect(da[0] + 6, da[1] + 6, db[0] - da[0] - 12, 22, C.honey, 'opacity="0.8"');
  s += ell((da[0] + db[0]) / 2, db[1] + 6, 90, 14, C.honey, 'opacity="0.3" filter="url(#b8)"');
  const wa = cam.p(5.0, 6.0, hz - 0.03), wb = cam.p(6.75, 3.85, hz - 0.03);
  const wx = wa[0], wy = wa[1], ww = wb[0] - wa[0], wh = wb[1] - wa[1];
  s += ell(wx + ww / 2, wy + wh * 0.55, ww * 1.15, wh * 0.85, C.honeyL, 'opacity="0.34" filter="url(#b24)"');
  s += openWin(wx, wy, ww, wh, {open: true, spill: 1.3, room: C.honeyL, leafL: 0.24, leafR: 0.24});
  s += rect(wx + ww * 0.1, wy + wh * 0.8, ww * 0.8, wh * 0.16, C.honeyD, 'opacity="0.55"');
  s += herToast(wx + ww * 0.48, wy + wh, cam.sz(1, hz), {body: V[2], skin: V[5]});
  s += sillFront(wx, wy, ww, wh);
  // the warm line in the snow from your feet to her door (the melt, the warm showing through)
  s += meltSeam([[150, 1940], [260, 1790], [420, 1660], [580, 1574], [(da[0] + db[0]) / 2, db[1] + 4]], [84, 20]);
  // your gloved hand and your phone, your chat bubble popping (the screen's cool light)
  s += gloveHandPhone(300, 1540, 330, {rot: -8});
  s += snowfall(220, 0, 1920);
  s += caption([{t: 'could soon', x: 130, y: 352, size: 104, anchor: 'start'}, {t: 'heat', x: 286, y: 476, lit: true, size: 156, anchor: 'start'}, {t: 'an apartment', x: 930, y: 560, size: 100, anchor: 'end'}]);
  return svgPage(s);
};

// ======================================================================================
// THE LOT VIEW (B7, B8: one view, one change). At the quay's end, a person's eye. On the right, the last Jugendstil
// house before the water, its windows flung open on warm rooms and its people leaning out toward the warmth thrown away
// far across the ice; ahead, the empty lot by the water, its snow untouched beyond a ploughed bank; across the harbour,
// Helsinki's own lights. The city's warm line comes racing from under our feet and stops in a burst where the
// untouched snow begins. B8: the plan pencils itself onto the lot (a hall standing there, its big door faintly warm, a
// dashed pipe across the gap, the year pinned on the drawing).
// ======================================================================================
function lotView(o = {}) {
  seed(81);
  const cam = Cam(1000, 540, 1250, 1.7);
  const plan = !!o.plan;
  let s = '';
  // the night under the band (the band itself stays the light calm field)
  s += `<linearGradient id="sky8" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1254"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.24" stop-color="${C.paper}"/><stop offset="0.47" stop-color="${C.paper}"/><stop offset="0.53" stop-color="${V[10]}"/><stop offset="0.64" stop-color="${V[6]}"/><stop offset="0.88" stop-color="${V[5]}"/><stop offset="1" stop-color="${V[7]}"/></linearGradient><rect x="0" y="0" width="${W}" height="1254" fill="url(#sky8)"/>`;
  s += cloudBank(780, 90, V[8], 0.28, 6);
  // across the harbour: Helsinki, a long low belt of roofs, a dome, chimneys and cranes, its many small warm windows
  let far = '';
  const sk = [[0, 1214], [40, 1210], [44, 1196], [96, 1196], [100, 1206], [170, 1206], [176, 1190], [236, 1190], [240, 1202], [330, 1202], [336, 1186], [380, 1186], [384, 1198], [470, 1198], [474, 1206], [540, 1206], [546, 1192], [620, 1192], [626, 1200], [700, 1200], [706, 1184], [770, 1184], [774, 1196], [880, 1196], [886, 1204], [1080, 1204], [1080, 1256], [0, 1256]];
  far += P(polyD(sk, 0.6), V[3]);
  // the dome on its drum (the city's white church far off), a spire, two chimneys and a harbour crane
  far += hrect(626, 1170, 46, 24, V[3], 0.4) + P(smoothD([[620, 1172], [630, 1150], [649, 1140], [668, 1150], [678, 1172]], true), V[4]) + S(lineD([[649, 1140], [649, 1126]]), V[4], 2.4);
  far += S(lineD([[400, 1186], [400, 1150]]), V[3], 3) + S(lineD([[408, 1150], [372, 1150], [372, 1168]]), V[3], 2) + rect(812, 1168, 7, 28, V[3]) + rect(840, 1174, 6, 22, V[3]);
  for (let i = 0; i < 280; i++) { const x = rr(4, 1076); const top = 1192 + (x % 140 < 70 ? 4 : 10); far += rect(x, rr(top, 1248), rr(2.6, 4.4), rr(2.4, 3.6), rnd() < 0.15 ? C.honeyL : C.honey, `opacity="${f1(rr(0.6, 1))}"`); }
  s += ell(520, 1206, 620, 46, C.honey, 'opacity="0.12" filter="url(#b40)"');
  s += far;
  // the data center across the ice (far left): a low dark hall, its edge lit, throwing its warmth up into the night,
  // where it thins to nothing (the heat they want, far out of reach)
  s += hrect(70, 1204, 176, 40, V[1], 0.4) + rect(78, 1226, 160, 3, C.honey, 'opacity="0.55"');
  for (const vx of [100, 140, 180, 220]) s += hrect(vx - 12, 1196, 24, 9, V[1], 0.3) + ell(vx, 1197, 10, 3, C.honeyL, 'opacity="0.9"');
  s += warmPlume(160, 1196, 150, 560, {lean: 0.05, op: 1.3});
  // the harbour ice; the icebreakers' channel kept open along the far side
  s += P(polyD([[0, 1252], [W, 1252], [W, 1310], [0, 1310]]), V[10]);
  s += P(smoothD([[0, 1258], [300, 1256], [700, 1260], [1080, 1257], [1080, 1268], [700, 1272], [300, 1268], [0, 1270]], true), V[3], 'opacity="0.85"');
  for (let i = 0; i < 10; i++) { const y = rr(1276, 1304), x0 = rr(-40, 1000); s += S(lineD([[x0, y], [x0 + rr(40, 140), y + rr(-2, 2)]]), V[rnd() < 0.5 ? 8 : 12], rr(1, 2), 'opacity="0.6"'); }
  // the quay's stone edge along the water, snow-capped bollards
  s += P(polyD([[0, 1306], [W, 1306], [W, 1316], [0, 1316]], 0.6), V[3]);
  for (const X of [-14, -9.5, -5]) { const a = cam.p(X, 0, 29), b = cam.p(X, 0.9, 29), w = cam.sz(0.45, 29); s += hrect(a[0] - w / 2, b[1], w, a[1] - b[1], V[1], 0.4) + ell(a[0], b[1], w * 0.75, w * 0.3, V[13]); }
  // THE LOT: its snow untouched, smooth, pale, softly lit (the missing piece's ground): nothing has crossed it
  s += P(polyD([[0, 1315], [W, 1315], [W, 1446], [0, 1446]]), V[12]);
  for (let i = 0; i < 8; i++) s += P(blobD(rr(30, 430), rr(1330, 1420), rr(60, 150), rr(4, 9), 8, 0.3), V[13], 'opacity="0.7"');
  s += P(smoothD([[0, 1396], [160, 1384], [330, 1392], [440, 1384], [440, 1402], [300, 1410], [0, 1414]], true), V[10], 'opacity="0.35" filter="url(#b8)"');
  for (let i = 0; i < 26; i++) s += ell(rr(10, 430), rr(1322, 1436), 1.3, 1.3, '#ffffff', `opacity="${f1(rr(0.4, 0.9))}"`);
  // THE HOUSE: the last Jugendstil house before the water, front-on: a rough granite base, plaster above, string
  // courses, a cornice with snow, a steep roof with a lit dormer; its side wall turns back along the lot
  const hz = 10.2, hx1 = -1.0, hx2 = 9.5, hTop = 7.2;
  s += facadeX(cam, hx1, hz, 22, 0, hTop, V[2]);
  { const a = cam.p(hx1, 3.0, 15), b = cam.p(hx1, 5.6, 15.9); s += P(polyD([a, [b[0], a[1] + 1], b, [a[0], b[1] - 1]], 0.4), C.honey, 'opacity="0.75"'); }
  s += faceZ(cam, hz, hx1, hx2, 0, hTop, V[3]);
  s += faceZ(cam, hz - 0.01, hx1, hx2, 0, 1.0, V[4]);
  for (let yy = 0.25; yy < 1.0; yy += 0.36) s += S(lineD([cam.p(hx1, yy, hz - 0.02), cam.p(hx2, yy, hz - 0.02)]), V[3], 1.6, 'opacity="0.7"');
  for (const yy of [3.65, 6.55]) s += S(lineD([cam.p(hx1, yy, hz - 0.02), cam.p(hx2, yy, hz - 0.02)]), V[5], 4, 'opacity="0.8"');
  s += faceZ(cam, hz - 0.02, hx1 - 0.15, hx2, hTop - 0.3, hTop + 0.05, V[5]) + S(lineD([cam.p(hx1 - 0.15, hTop + 0.08, hz - 0.03), cam.p(hx2, hTop + 0.08, hz - 0.03)]), V[12], 4.4);
  s += poly3(cam, [[hx1 - 0.3, hTop + 0.05, hz], [hx2, hTop + 0.05, hz], [hx2, 10, hz + 3.4], [hx1 + 0.8, 10, hz + 3.4]], V[1]);
  s += S(lineD([cam.p(hx1 + 0.7, 9.95, hz + 3.3), cam.p(hx2, 9.95, hz + 3.3)]), V[12], 3.6, 'opacity="0.9"');
  { const a = cam.p(2.0, 7.9, hz + 1.9), b = cam.p(3.2, 9.0, hz + 1.9); s += hrect(a[0] - 8, b[1] - 10, b[0] - a[0] + 16, a[1] - b[1] + 12, V[2], 0.4) + P(polyD([[a[0] - 14, b[1] - 8], [(a[0] + b[0]) / 2, b[1] - 30], [b[0] + 14, b[1] - 8]], 0.4), V[1]) + S(lineD([[a[0] - 14, b[1] - 9], [(a[0] + b[0]) / 2, b[1] - 31], [b[0] + 14, b[1] - 9]]), V[12], 3) + win(a[0], b[1], b[0] - a[0], a[1] - b[1], {lit: true, glow: 0.8, core: true}); }
  { const a = cam.p(6.2, 9.0, hz + 2.8), b = cam.p(6.6, 9.75, hz + 2.8); s += hrect(a[0], b[1], b[0] - a[0], a[1] - b[1], V[1], 0.4) + ell((a[0] + b[0]) / 2, b[1], (b[0] - a[0]) * 0.7, 4, V[13]); }
  const winAt = (X1, Y1, w = 1.35, h = 1.9) => { const a = cam.p(X1, Y1 + h, hz - 0.03), b = cam.p(X1 + w, Y1, hz - 0.03); return [a[0], a[1], b[0] - a[0], b[1] - a[1]]; };
  const k = cam.sz(1, hz);
  // the upper floor: three windows flung open, three people reaching for it; the ground floor: a child at the window
  // bench, the arched door with its lit transom and the cat on the step, a young man reaching with both hands
  const ups = o.ups || [['mug', -0.35], ['point', 1.85], ['mittens', 4.05]];
  for (const [kind, X1] of ups) {
    const [x, y, w, h] = winAt(X1, 4.3);
    s += openWin(x, y, w, h, {open: true, spill: 1.2, leafL: 0.26, leafR: 0.22});
    s += leanOut(kind, x + w * 0.56, y + h, k, -1, {wx: x, wy: y}) + sillFront(x, y, w, h);
  }
  { const [x, y, w, h] = winAt(-0.35, 0.95, 1.35, 1.75); s += openWin(x, y, w, h, {open: true, spill: 1.1, leafL: 0.26, leafR: 0.22}); s += leanOut('child', x + w * 0.62, y + h, k, -1) + sillFront(x, y, w, h) + leanOut('cat', x + w * 0.08, y + h, k, -1, {catAt: 0}); }
  { const a = cam.p(1.95, 2.9, hz - 0.03), b = cam.p(3.15, 0, hz - 0.03); const dw = b[0] - a[0];
    s += P(smoothD([[a[0], b[1]], [a[0], a[1] + dw * 0.3], [a[0] + dw * 0.5, a[1]], [b[0], a[1] + dw * 0.3], [b[0], b[1]]], true, 0.6), V[1]);
    s += P(smoothD([[a[0] + 6, a[1] + dw * 0.36], [a[0] + dw * 0.5, a[1] + 8], [b[0] - 6, a[1] + dw * 0.36], [b[0] - 6, a[1] + dw * 0.5], [a[0] + 6, a[1] + dw * 0.5]], true, 0.6), C.honey, 'opacity="0.85"');
    s += ell((a[0] + b[0]) / 2, b[1] + 6, 80, 12, C.honey, 'opacity="0.26" filter="url(#b8)"'); }
  { const [x, y, w, h] = winAt(4.05, 0.95, 1.35, 1.75); s += openWin(x, y, w, h, {open: true, spill: 1.1, leafL: 0.24, leafR: 0.22}); s += leanOut('reach', x + w * 0.56, y + h, k, -1) + sillFront(x, y, w, h); }
  // the warm light the open windows throw on the snow at the house's foot
  s += ell(790, 1440, 360, 44, C.honey, 'opacity="0.26" filter="url(#b24)"');
  // the ploughed bank where the street's trodden snow ends and the lot begins (the line meets it and stops)
  s += P(smoothD([[-20, 1452], [60, 1436], [180, 1432], [300, 1438], [400, 1434], [470, 1440], [560, 1436], [700, 1440], [860, 1434], [1100, 1440], [1100, 1466], [-20, 1466]], true), V[12]);
  s += P(smoothD([[-20, 1458], [200, 1450], [420, 1454], [640, 1449], [1100, 1454], [1100, 1480], [-20, 1480]], true), V[9]);
  // the near street: trodden snow, tracks, darker toward us (a quiet field)
  s += P(polyD([[0, 1478], [W, 1478], [W, H], [0, H]]), V[6]);
  for (const [y1, col] of [[1560, V[5]], [1710, V[4]]]) s += P(smoothD([[0, y1], [300, y1 - 8], [700, y1 + 6], [1080, y1 - 4], [1080, H], [0, H]], true), col);
  for (let i = 0; i < 22; i++) { const x = rr(-20, 1060), y = rr(1490, 1900); s += S(lineD([[x, y], [x + rr(-30, 30), y + rr(40, 120)]]), V[rnd() < 0.5 ? 7 : 3], rr(3, 7), 'opacity="0.35"'); }
  for (let i = 0; i < 9; i++) { const p = [640 + i * 12 - (i % 2) * 18, 1890 - i * 46]; s += ell(p[0], p[1], 9 - i * 0.5, 4 - i * 0.2, V[3], 'opacity="0.7"'); }
  // the city's warm line racing from under our feet to the bank, where it stops in a burst of light and steam
  const end = [236, 1449];
  s += meltSeam([[600, 1950], [566, 1800], [470, 1650], [350, 1530], end], [76, 15]);
  if (!plan) {
    // its racing head: the snow thrown up off it, a bright wake along its last stretch
    s += S(smoothD([[440, 1610], [350, 1530], [286, 1482], end], false), C.honeyL, 10, 'opacity="0.55" filter="url(#b4)"');
    for (let i = 0; i < 16; i++) { const t = rnd(), px = lerp(440, end[0], t), py = lerp(1610, end[1], t); s += ell(px + rr(-40, 40), py - rr(10, 70), rr(2, 4), rr(2, 4), '#f6f7f9', `opacity="${f1(rr(0.6, 1))}"`); }
  }
  s += lineBurst(end[0], end[1] - 4, plan ? 0.62 : 1.4);
  if (plan) {
    seed(77);
    // the plan, drawn on the lot in soft pencil: a hall standing on the lot by the water, its long facade and its big
    // door facing the line's end; graphite hatching gives it a wall; its right end runs on behind the old house
    const z = 22, L = cam.p(-11.6, 0, z)[0], R = cam.p(hx1, 0, hz)[0] - 4, B = cam.p(0, 0, z)[1], T = cam.p(0, 10, z)[1];
    const dL = cam.p(-9.0, 0, z)[0], dR = cam.p(-5.0, 0, z)[0], dT = cam.p(0, 5.6, z)[1];
    s += hatchRect(L + 6, T + 30, R, B - 30, 20, {op: 0.26, w: 2.2, skip: (p, q) => false});
    s += rect(dL - 2, dT - 2, dR - dL + 4, B - dT + 2, V[5], 'opacity="0.5"');
    s += softPencil([[L, B], [L, T]], 6, {over: 20, op: 0.9}) + softPencil([[L, T], [R, T]], 6, {over: 12, op: 0.9});
    s += softPencil([[L - 6, T - 14], [R, T - 14]], 3, {op: 0.55}) + softPencil([[L - 6, T - 14], [L - 6, T + 2]], 3, {op: 0.55});
    s += softPencil([[L - 60, B + 1], [R, B - 1]], 3.4, {op: 0.62});
    s += softPencil([[L + 4, B - 26], [R, B - 26]], 2.4, {op: 0.48});
    for (let x = L + 70; x < R - 20; x += 70) if (x < dL - 10 || x > dR + 10) s += softPencil([[x, T + 26], [x, B - 30]], 1.8, {op: 0.34, passes: 1});
    // a strip of high windows, drawn
    for (let x = L + 30; x < R - 40; x += 70) if (x + 44 < dL - 8 || x > dR + 8) s += softPencil([[x, T + 50], [x + 44, T + 50], [x + 44, T + 82], [x, T + 82], [x, T + 50]], 2.2, {op: 0.5, passes: 1});
    // the big door, warm inside (the hope)
    s += rect(dL - 50, dT - 50, dR - dL + 100, B - dT + 70, C.honey, 'opacity="0.34" filter="url(#b24)"');
    s += hrect(dL, dT, dR - dL, B - dT, C.honeyL, 0.5, 'opacity="0.34"');
    s += hrect(dL + 14, dT + 16, dR - dL - 28, B - dT - 16, C.honeyC, 0.5, 'opacity="0.22" filter="url(#b8)"');
    s += softPencil([[dL, B], [dL, dT], [dR, dT], [dR, B]], 6, {over: 10, op: 0.95});
    s += softPencil([[(dL + dR) / 2, dT + 6], [(dL + dR) / 2, B - 4]], 2.6, {op: 0.55});
    s += softPencil([[dL - 34, dT - 18], [dR + 80, dT - 18]], 3, {op: 0.6});
    // the missing piece: a dashed pencil pipe across the untouched snow from the line's end to the drawn door, a
    // faint warmth along it as it draws itself
    const pipe = [[end[0] - 6, end[1] - 6], [230, 1416], [226, 1384], [224, 1356], [(dL + dR) / 2 + 12, B + 2]];
    s += S(smoothD(pipe, false), C.honey, 26, 'opacity="0.34" filter="url(#b8)"');
    s += softPencil(sampleSmooth(pipe, 6), 7, {dash: '26 15', op: 0.95, passes: 2});
    // the survey stake where the line ends, its ribbon
    const st = cam.p(-3.3, 0, 9.0), stT = cam.p(-3.3, 1.45, 9.0);
    s += S(lineD([st, stT]), V[1], 5) + ell(st[0], st[1], 10, 3.5, V[3]) + P(polyD([[stT[0], stT[1] + 2], [stT[0] + 30, stT[1] + 8], [stT[0] + 26, stT[1] + 17], [stT[0], stT[1] + 12]], 0.4), V[12]);
    // the year, on a paper pinned to the drawing above its door (the type guide's world word: Gaegu 700 at 122 px,
    // plum on cream, inside the frame and clear of the edges)
    const tx = 118, ty = T + 30;
    s += G(P(polyD([[tx, ty], [tx + 280, ty - 4], [tx + 283, ty + 166], [tx + 3, ty + 170]], 0.8), '#efe9dc') + ell(tx + 140, ty + 12, 7, 7, V[2]) +
      `<text x="${tx + 141}" y="${ty + 124}" font-family="Gaegu" font-weight="700" font-size="122" text-anchor="middle" fill="${C.ink}" class="ink">2027</text>`, `transform="rotate(-3 ${tx + 140} ${ty + 85})"`);
  }
  // her, in the street by the line's end, from behind: up on her toes, reaching for the warmth (B7), or still, looking
  // at the plan (B8)
  const f = cam.p(-0.9, 0, 7.9), hh = cam.sz(1.7, 7.9);
  s += ell(f[0] + 4, f[1] + 2, hh * 0.2, hh * 0.04, V[4], 'opacity="0.6"');
  s += her(f[0], f[1], hh, plan ? {view: 'back', arms: [[6, 4], [8, 30]], coat: V[1], coatL: V[3], hair: V[0], skin: V[6], scarf: V[8], rim: C.honeyL, rimSide: -1, step: [2.6, 2.6]} :
    {view: 'back', arms: [[146, -12], [62, 40]], lean: -8, step: [1.6, 5], coat: V[1], coatL: V[3], hair: V[0], skin: V[6], scarf: V[8], rim: C.honeyL, rimSide: -1, lift: 0.25});
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

// ---------- B6alt (reworked in round 1): only the fox gets it. At night, the long wall of a data center: its big
// fans breathe the hall's warmth straight out over the snow, which melts into a dark wet patch that leads nowhere,
// steaming into the cold; asleep in the middle of it, curled tight, a fox (the only one who gets the warmth); far
// across the empty field, the city's small warm lights ----------
FRAMES.B6alt = () => {
  seed(67);
  const cam = Cam(950, 540, 1180, 1.2);
  let s = '';
  s += `<linearGradient id="s6a" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1182"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.25" stop-color="${C.paper}"/><stop offset="0.5" stop-color="${C.paper}"/><stop offset="0.57" stop-color="${V[9]}"/><stop offset="0.72" stop-color="${V[4]}"/><stop offset="0.94" stop-color="${V[4]}"/><stop offset="1" stop-color="${V[6]}"/></linearGradient><rect x="0" y="0" width="${W}" height="1184" fill="url(#s6a)"/>`;
  // the empty snowy field to the horizon (right), a dark tree line, the city's few warm lights far off
  s += P(polyD([[0, 1180], [W, 1180], [W, 1500], [0, 1500]]), V[9]);
  s += P(smoothD([[700, 1182], [800, 1172], [900, 1176], [1000, 1168], [1080, 1172], [1080, 1186], [700, 1186]], true), V[3]);
  for (let i = 0; i < 46; i++) s += rect(rr(790, 1070), rr(1168, 1182), rr(2.2, 3.6), rr(2, 3), C.honey, `opacity="${f1(rr(0.55, 1))}"`);
  s += ell(930, 1172, 160, 18, C.honey, 'opacity="0.18" filter="url(#b14)"');
  for (const [z1, z2, col] of [[4, 7, V[8]], [7, 14, V[9]], [14, 60, V[10]]]) s += P(polyD([cam.p(-30, 0, z1), cam.p(30, 0, z1), cam.p(30, 0, z2), cam.p(-30, 0, z2)], 1.5), col);
  for (let i = 0; i < 9; i++) { const z = rr(5, 30), x = rr(1, 14); const p = cam.p(x, 0, z); s += P(blobD(p[0], p[1], cam.sz(rr(1, 2.4), z), cam.sz(rr(0.05, 0.12), z), 8, 0.3), V[11], 'opacity="0.6"'); }
  // THE WALL: a data center's long blank wall, front-on, its parapet under the band, a few small cool lights; two big
  // fans set low in it, breathing the hall's warmth out (a third runs off the frame)
  const z = 9.2, X1 = -12, X2 = 2.1, Ht = 5.6;
  s += faceZ(cam, z, X1, X2, 0, Ht, V[2]);
  for (let X = X1; X < X2; X += 0.9) s += S(lineD([cam.p(X, 0.05, z - 0.01), cam.p(X, Ht - 0.1, z - 0.01)]), V[1], 2, 'opacity="0.5"');
  s += faceZ(cam, z - 0.02, X1, X2 + 0.1, Ht - 0.35, Ht + 0.05, V[3]) + S(lineD([cam.p(X1, Ht + 0.08, z - 0.03), cam.p(X2 + 0.1, Ht + 0.08, z - 0.03)]), V[12], 4);
  for (const X of [-9.5, -6, -2.6, 1.0]) { const p = cam.p(X, 4.6, z - 0.03); s += ell(p[0], p[1], 3, 3, '#e6f4f8') + ell(p[0], p[1], 10, 10, '#e6f4f8', 'opacity="0.25" filter="url(#b4)"'); }
  const fans = [[-4.6, 1.75, 1.35], [-0.95, 1.75, 1.35], [-8.25, 1.75, 1.35]];
  for (const [X, Y, Rm] of fans) { const c = cam.p(X, Y, z - 0.04); s += wallFan(c[0], c[1], cam.sz(Rm, z), {rot: X * 0.3}); }
  // their breath: warm air pouring out toward us over the snow and rising, thinning into the cold night
  for (const [X, Y] of fans) {
    const c = cam.p(X, Y, z - 0.1), R = cam.sz(1.35, z);
    for (let i = 0; i < 8; i++) { const t = i / 7; s += P(blobD(c[0] + rr(-20, 20) + t * 40, c[1] + 30 + t * 90 - t * t * 320, R * (1.0 + 1.1 * t), R * (0.5 + 0.4 * t), 9, 0.2), t < 0.35 ? C.honey : '#efdcbc', `opacity="${f1(0.34 * (1 - t * 0.8))}" filter="url(#b40)"`); }
    for (let kk = 0; kk < 7; kk++) { const x0 = c[0] + rr(-R * 0.7, R * 0.7), pts = []; for (let j = 0; j <= 6; j++) pts.push([x0 + j * rr(4, 12) + Math.sin(j * 1.4 + kk) * 8, c[1] - R * 0.9 - j * rr(34, 52)]); s += S(smoothD(pts, false), C.honeyL, rr(1.6, 2.6), `opacity="${f1(rr(0.22, 0.4))}" filter="url(#b2)"`); }
  }
  // the near snow in front of us (a quiet field, darker toward us)
  s += `<linearGradient id="n6a" gradientUnits="userSpaceOnUse" x1="0" y1="1460" x2="0" y2="1920"><stop offset="0" stop-color="${V[8]}"/><stop offset="1" stop-color="${V[6]}"/></linearGradient>`;
  s += P(polyD([[0, 1440], [W, 1440], [W, H], [0, H]]), 'url(#n6a)');
  for (let i = 0; i < 10; i++) { const y = rr(1500, 1900); s += P(blobD(rr(0, W), y, rr(80, 200) * (y / 1500), rr(6, 14) * (y / 1500), 8, 0.3), V[9], 'opacity="0.4"'); }
  // the melted patch: the snow gone to dark wet ground (earth, flattened grass, puddles catching the warm light) in front
  // of the fans, spreading toward us and going nowhere; a wet slushy rim where the snow begins again
  const patch = [cam.p(-12, 0, z - 0.1), cam.p(1.8, 0, z - 0.1), cam.p(2.7, 0, 7.4), cam.p(3.1, 0, 5.2), cam.p(2.6, 0, 3.4), cam.p(0.9, 0, 2.55), cam.p(-1.6, 0, 2.6), cam.p(-3.4, 0, 3.3), cam.p(-5.8, 0, 4.3), cam.p(-12, 0, 5.2)];
  s += P(smoothD(patch.map(([a, b]) => [a + rr(-12, 12), b + rr(-8, 8)]), true), V[9], 'opacity="0.9"');
  s += P(smoothD(patch.map(([a, b]) => [lerp(a, 300, 0.05), lerp(b, 1330, 0.05)]), true), V[5]);
  s += P(smoothD(patch.map(([a, b]) => [lerp(a, 300, 0.12), lerp(b, 1320, 0.12)]), true), V[3]);
  for (let i = 0; i < 26; i++) { const zz = rr(3, 8.6), X = rr(-6, 2.4); const p = cam.p(X, 0, zz); s += P(blobD(p[0], p[1], cam.sz(rr(0.3, 0.9), zz), cam.sz(rr(0.04, 0.1), zz), 8, 0.35), rnd() < 0.5 ? V[4] : V[2], 'opacity="0.75"'); }
  for (let i = 0; i < 6; i++) { const zz = rr(3.4, 8.2), X = rr(-5.4, 1.8); const p = cam.p(X, 0, zz); s += P(blobD(p[0], p[1], cam.sz(rr(0.3, 0.6), zz), cam.sz(rr(0.03, 0.06), zz), 8, 0.3), V[1], 'opacity="0.9"') + P(blobD(p[0], p[1] - 1, cam.sz(rr(0.15, 0.3), zz), cam.sz(rr(0.012, 0.025), zz), 8, 0.3), C.honey, 'opacity="0.6"'); }
  for (let i = 0; i < 90; i++) { const zz = rr(2.8, 8.8), X = rr(-6.4, 2.6); const p = cam.p(X, 0, zz), hgt = cam.sz(rr(0.05, 0.13), zz); s += S(lineD([p, [p[0] + rr(-4, 4), p[1] - hgt]]), rnd() < 0.5 ? V[5] : V[6], rr(1.4, 2.6), 'opacity="0.75"'); }
  for (let i = 0; i < 18; i++) { const t = rnd(), pa = patch[Math.floor(t * (patch.length - 1))]; s += P(blobD(pa[0] + rr(-20, 20), pa[1] + rr(-6, 6), rr(8, 22), rr(3, 7), 7, 0.3), V[11], 'opacity="0.8"'); }
  s += ell(300, 1340, 440, 80, C.honey, 'opacity="0.14" filter="url(#b40)"');
  // steam lifting off the warm wet ground into the cold
  for (const [X, zz] of [[-4.4, 6.2], [-1.4, 5.0], [1.2, 6.8], [-6.4, 7.4]]) { const p = cam.p(X, 0, zz); s += steam(p[0], p[1] - 4, cam.sz(1.4, zz), cam.sz(2.6, zz), {n: 6, warm: true, col: V[12], op: 0.5, root: 0.25, lean: 0.06}); }
  // the fox, asleep in the warmest spot, curled tight, its tail over its nose
  const fp = cam.p(0.15, 0, 3.3);
  s += ell(fp[0], fp[1] - 10, 230, 50, C.honey, 'opacity="0.2" filter="url(#b14)"');
  s += foxCurled(fp[0], fp[1], cam.sz(1, 3.3), {dir: -1});
  // snow falling, melting to drops in the warm air before the fans
  { let g = ''; for (let i = 0; i < 200; i++) { const x = rr(0, W), y = rr(610, 1920); const warm = x < 760 && y > 820 && y < 1480; const r = rr(1.4, 3.6); g += warm && rnd() < 0.7 ? ell(x, y, r * 0.6, r * 1.1, '#e9eef2', 'opacity="0.55"') : ell(x, y, r, r * rr(0.85, 1.1), '#f4f5f7', `opacity="${f1(rr(0.4, 0.85))}"`); } s += g; }
  s += caption([{t: 'to blow that', x: 520, y: 395, size: 112}, {t: 'heat outside.', x: 560, y: 515, size: 112}]);
  return svgPage(s);
};

// ---------- B7alt: the city leans out: a Jugendstil facade front-on, window after window flung open and its people
// leaning out on their sills toward the warmth thrown away far across the ice (an old man pointing, a child, a raised
// mug, mittens pegged out to warm, a couple, a cat); below, the city's warm line runs along the street and stops where
// the lot's untouched snow begins ----------
FRAMES.B7alt = () => {
  seed(77);
  let s = '';
  s += `<linearGradient id="s7a" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1200"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.25" stop-color="${C.paper}"/><stop offset="0.5" stop-color="${C.paper}"/><stop offset="0.56" stop-color="${V[10]}"/><stop offset="0.7" stop-color="${V[6]}"/><stop offset="0.94" stop-color="${V[5]}"/><stop offset="1" stop-color="${V[7]}"/></linearGradient><rect x="0" y="0" width="${W}" height="1200" fill="url(#s7a)"/>`;
  // the harbour beyond the facade's end (left): the far shore's city lights, a data center far across the ice
  // throwing its warmth up into the night (far, out of reach), the ice, the quay's edge
  s += P(polyD([[0, 1200], [0, 1166], [50, 1164], [56, 1152], [120, 1152], [126, 1160], [210, 1160], [216, 1146], [300, 1146], [306, 1158], [380, 1158], [380, 1200]], 0.6), V[3]);
  for (let i = 0; i < 70; i++) s += rect(rr(4, 376), rr(1152, 1196), rr(2.4, 3.8), rr(2.2, 3.2), C.honey, `opacity="${f1(rr(0.55, 1))}"`);
  s += hrect(70, 1166, 150, 30, V[1], 0.4) + rect(78, 1184, 134, 3, C.honey, 'opacity="0.55"');
  for (const vx of [96, 136, 176]) s += hrect(vx - 11, 1159, 22, 8, V[1], 0.3) + ell(vx, 1160, 9, 3, C.honeyL, 'opacity="0.9"');
  s += warmPlume(140, 1158, 130, 470, {lean: 0.05, op: 1.3});
  s += P(polyD([[0, 1196], [400, 1196], [400, 1262], [0, 1262]]), V[10]) + P(smoothD([[0, 1204], [200, 1202], [400, 1205], [400, 1214], [200, 1216], [0, 1214]], true), V[3], 'opacity="0.85"');
  s += P(polyD([[0, 1258], [400, 1258], [400, 1268], [0, 1268]], 0.5), V[3]);
  // the lot by the water: its snow untouched (the gap), bright far off where the city's glow catches it, darker near
  s += `<linearGradient id="lot7a" gradientUnits="userSpaceOnUse" x1="0" y1="1266" x2="0" y2="1920"><stop offset="0" stop-color="${V[12]}"/><stop offset="0.45" stop-color="${V[10]}"/><stop offset="1" stop-color="${V[8]}"/></linearGradient>`;
  s += P(polyD([[0, 1266], [400, 1266], [400, 1920], [0, 1920]]), 'url(#lot7a)');
  for (let i = 0; i < 7; i++) { const y = rr(1300, 1880); s += P(blobD(rr(20, 330), y, rr(50, 120) * (y / 1400), rr(4, 9) * (y / 1400), 8, 0.3), V[13], 'opacity="0.45"'); }
  for (let i = 0; i < 6; i++) { const y = rr(1330, 1880); s += P(blobD(rr(20, 330), y + 8, rr(40, 110) * (y / 1400), rr(3, 7) * (y / 1400), 8, 0.3), V[7], 'opacity="0.3"'); }
  for (let i = 0; i < 22; i++) s += ell(rr(10, 340), rr(1280, 1880), 1.4, 1.4, '#ffffff', `opacity="${f1(rr(0.4, 0.9))}"`);
  for (const [bx, by, bw] of [[60, 1262, 12], [170, 1262, 12], [280, 1262, 12]]) s += hrect(bx - bw / 2, by - 20, bw, 20, V[1], 0.3) + ell(bx, by - 20, bw * 0.75, 3.5, V[13]);
  // the Jugendstil facade front-on, its steep roof under the band, a low corner turret at the right
  const fx = 352;
  s += hrect(fx, 700, W - fx + 20, 920, V[3], 1);
  s += P(polyD([[fx - 22, 704], [fx + 46, 642], [890, 642], [940, 704]], 1), V[1]) + S(lineD([[fx - 12, 700], [fx + 48, 646], [890, 646]]), V[12], 5);
  s += hrect(930, 690, 190, 930, V[2], 1) + P(smoothD([[920, 692], [956, 652], [1020, 628], [1084, 652], [1120, 692]], true), V[1]) + S(smoothD([[930, 690], [960, 654], [1020, 632]], false), V[12], 3.6, 'opacity="0.85"');
  s += hrect(fx, 1480, W - fx + 20, 140, V[4], 1);
  for (let y = 1500; y < 1610; y += 34) s += S(lineD([[fx, y], [W, y]]), V[3], 1.6, 'opacity="0.7"');
  for (const y of [940, 1140, 1340]) s += S(lineD([[fx, y], [930, y]]), V[5], 4, 'opacity="0.8"');
  s += S(lineD([[fx, 700], [fx, 1610]]), V[5], 4, 'opacity="0.6"');
  // the windows: most flung open, the people leaning out on their sills toward the far warmth
  const cols = [392, 582, 772], rows = [758, 958, 1158], ww = 128, wh = 150, k = 98;
  const kinds = {'0,0': 'mug', '1,0': 'mittens', '0,1': 'point', '2,1': 'couple', '0,2': 'child', '1,2': 'reach'};
  rows.forEach((wy, r) => cols.forEach((wx, c) => {
    const kind = kinds[c + ',' + r];
    if (!kind) { s += win(wx, wy, ww, wh, {lit: r !== 2 || c !== 2, glow: 0.5, core: false}); s += hrect(wx - 8, wy + wh, ww + 16, 8, V[6], 0.3) + rect(wx - 8, wy + wh - 2, ww + 16, 4, V[13]); return; }
    s += openWin(wx, wy, ww, wh, {open: true, spill: 1.1, leafL: 0.26, leafR: 0.22});
    s += leanOut(kind, wx + ww * (kind === 'child' ? 0.62 : 0.56), wy + wh, k, -1, {wx, wy});
    s += sillFront(wx, wy, ww, wh);
    if (kind === 'child') s += leanOut('cat', wx + ww * 0.1, wy + wh, k, -1, {catAt: 0});
  }));
  // the turret's two small windows, lit; the house door (arched, its transom lit) on the street
  s += win(990, 820, 56, 90, {lit: true, glow: 0.6, core: false}) + win(990, 1040, 56, 90, {lit: true, glow: 0.6, core: false}) + win(990, 1260, 56, 90, {lit: false});
  { const x0 = 590, x1 = 700, yT = 1380, yB = 1612; s += P(smoothD([[x0, yB], [x0, yT + 40], [(x0 + x1) / 2, yT], [x1, yT + 40], [x1, yB]], true, 0.6), V[1]) + P(smoothD([[x0 + 8, yT + 44], [(x0 + x1) / 2, yT + 10], [x1 - 8, yT + 44], [x1 - 8, yT + 60], [x0 + 8, yT + 60]], true, 0.6), C.honey, 'opacity="0.85"'); }
  for (const wx of [392, 772]) s += win(wx, 1380, ww, 110, {lit: true, glow: 0.45, core: false});
  s += ell(640, 1600, 420, 40, C.honey, 'opacity="0.2" filter="url(#b24)"');
  // the street below: trodden snow; the city's warm line runs along it and stops in a burst where the lot begins
  s += P(polyD([[0, 1608], [W, 1608], [W, H], [0, H]]), V[6]) + P(polyD([[0, 1740], [W, 1730], [W, H], [0, H]]), V[5]);
  // the ploughed bank where the trodden street ends and the untouched lot begins
  s += P(polyD([[0, 1608], [352, 1608], [336, 1920], [0, 1920]]), 'url(#lot7a)');
  s += P(smoothD([[340, 1606], [362, 1606], [384, 1760], [392, 1924], [300, 1924], [322, 1760]], true), V[10]) + P(smoothD([[352, 1606], [362, 1606], [384, 1760], [392, 1924], [356, 1924], [362, 1760]], true), V[7], 'opacity="0.55"') + S(smoothD([[342, 1608], [326, 1760], [304, 1920]], false), V[13], 4, 'opacity="0.7"');
  for (let i = 0; i < 16; i++) { const x = rr(380, 1060), y = rr(1620, 1900); s += S(lineD([[x, y], [x + rr(30, 120), y + rr(-4, 4)]]), V[rnd() < 0.5 ? 7 : 4], rr(3, 6), 'opacity="0.35"'); }
  s += meltSeam([[1110, 1716], [900, 1700], [700, 1712], [520, 1700], [372, 1706]], [26, 20]);
  s += lineBurst(368, 1700, 0.9);
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
