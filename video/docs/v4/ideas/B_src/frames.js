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
    const z = 66, zs = 72;
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
  s += block(80, 92, 14.5, V[2], 31, litP) + block(61, 79.6, 15.5, V[3], 32, litP) + block(41.5, 60.6, 16.6, V[2], 33, litP);
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
  const hz1 = 92;
  if (mode === 'vision') {
    let g = '';
    // the snow melted round its foot: a dark wet ring
    g += P(polyD([cam.p(-9, 0, hz1 - 3), cam.p(8.5, 0, hz1 - 3), cam.p(8.5, 0, hz1), cam.p(-9, 0, hz1)], 1), V[3]);
    g += faceZ(cam, hz1, -8.5, 8, 0, 13, V[1]);
    g += facadeX(cam, 8, hz1, hz1 + 30, 0, 13, V[0]);
    // its face: a band of small cool lights and vents
    for (let i = 0; i < 26; i++) { const p = cam.p(rr(-8, 7.5), rr(9, 12.4), hz1); g += ell(p[0], p[1], 1.3, 1.3, '#e8f6fb', `opacity="${f1(rr(0.5, 0.95))}"`); }
    // the big door, open on rows of giant computers (cool light, small lights)
    const d1 = cam.p(-4.2, 0, hz1), d2 = cam.p(4.2, 8.6, hz1);
    g += rect(d1[0] - 22, d2[1] - 16, d2[0] - d1[0] + 44, d1[1] - d2[1] + 22, '#eaf4f7', 'opacity="0.4" filter="url(#b14)"');
    g += hrect(d1[0], d2[1], d2[0] - d1[0], d1[1] - d2[1], '#d6e6ec', 0.4);
    for (let i = 0; i < 6; i++) { const xx = d1[0] + 9 + i * (d2[0] - d1[0] - 18) / 5, hh = (d1[1] - d2[1]) * (0.74 - Math.abs(i - 2.5) * 0.06), ww = 11; g += rect(xx - ww / 2, d1[1] - hh, ww, hh, V[1]); for (let k = 0; k < 8; k++) g += ell(xx + rr(-2, 2), d1[1] - hh + 5 + k * hh / 9, 1.3, 1.3, '#f6fdff'); }
    g += P(polyD([[d1[0], d1[1]], [d2[0], d1[1]], [d2[0] + 70, d1[1] + 40], [d1[0] - 70, d1[1] + 40]]), '#dfeef3', 'opacity="0.28" filter="url(#b8)"');
    // steam rolling off its roof into the snowing night, warm at its root
    const r1 = cam.p(-4, 13, hz1 + 6), r2 = cam.p(3.6, 13, hz1 + 12);
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
  for (let i = 0; i < pts.length; i++) { if (rnd() < 0.45) continue; const [x, z] = pts[i]; const p = cam.p(x + rr(-0.12, 0.12), 0, z), w = cam.sz(rr(0.14, 0.3), z); s += P(blobD(p[0], p[1], w, w * 0.32, 7, 0.3), V[2], 'opacity="0.9"'); }
  // thin branches of melt to the far blocks' doors (the homes it reaches)
  for (const [zb, ok] of [[43.7, true], [63.2, true], [82.2, mode === 'vision']]) {
    if (!ok || zb > zEnd) continue;
    const a = cam.p(lineX, 0, zb - 1.2), m = cam.p(4.5, 0, zb + 0.4), b = cam.p(10.2, 0, zb + 0.9);
    s += S(smoothD([a, m, b], false), V[3], cam.sz(0.26, zb), 'opacity="0.9"') + S(smoothD([a, m, b], false), C.honey, cam.sz(0.07, zb), 'opacity="0.85"');
  }
  // manholes on the line, puffing steam
  for (const zm of [9.5, 27, 52]) { if (zm > zEnd) continue; const m = cam.p(lineX + 0.1, 0, zm), w = cam.sz(0.75, zm); s += ell(m[0], m[1], w, w * 0.24, V[1]) + steam(m[0], m[1] - 2, w * 3, w * 8, {warm: true, op: 0.55, n: 6, col: V[12], lean: 0.12}); }
  // ---- the lamps hung on wires across the street (cool white) ----
  for (const z of [24, 42, 62]) {
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
  for (const sx of [-1, 1]) { const a = cam.p(sx * (ax - 0.4), rh + 0.6, z0 + 1), b = cam.p(sx * (ax - 0.4), rh + 0.6, z1); s += S(lineD([a, b]), V[3], 7, 'opacity="0.9"'); const c = cam.p(sx * (ax + 0.2), rh + 1.1, z0 + 1), d = cam.p(sx * (ax + 0.2), rh + 1.1, z1); s += S(lineD([c, d]), V[4], 5, 'opacity="0.8"'); }
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
  s += P(smoothD([[-20, 1560], [160, 1520], [360, 1548], [520, 1530], [700, 1552], [900, 1522], [1100, 1546], [1100, 1940], [-20, 1940]], true), V[12]);
  s += P(smoothD([[-20, 1640], [240, 1610], [540, 1636], [820, 1606], [1100, 1630], [1100, 1940], [-20, 1940]], true), V[11], 'opacity="0.8"');
  s += snowfall(70, 1100, 1920, {rmax: 6}) + snowfall(40, 600, 1100, {rmax: 3, op: 0.6});
  s += caption([{t: 'giant computers,', x: 520, y: 400, size: 112}, {t: 'data centers.', x: 560, y: 528, size: 112}]);
  return svgPage(s);
};

// ---------- B3: too hot for snow ----------
FRAMES.B3 = () => {
  const h = hallAisle({seed: 23, hot: true, z1: 30, ax: 1.5, farDoor: false, hz: 1060});
  let s = h.s;
  const cam = h.cam;
  // the air shimmering up to the vents (warm wavy strokes rising)
  for (let i = 0; i < 26; i++) {
    const x = rr(-1.3, 1.3), z = rr(4, 20), y0 = rr(0.6, 2.4);
    const a = cam.p(x, y0, z), len = cam.sz(rr(0.6, 1.4), z);
    const pts = []; for (let k = 0; k < 6; k++) pts.push([a[0] + Math.sin(k * 1.4 + i) * len * 0.08, a[1] - k * len / 5]);
    s += S(smoothD(pts, false), C.honeyC, Math.max(1.2, cam.sz(0.03, z)), 'opacity="0.55"');
  }
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
  s += `<linearGradient id="sky6" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1200"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.24" stop-color="${C.paper}"/><stop offset="0.5" stop-color="${C.paper}"/><stop offset="0.58" stop-color="${V[8]}"/><stop offset="0.66" stop-color="${V[4]}"/><stop offset="0.9" stop-color="${V[3]}"/><stop offset="1" stop-color="${V[6]}"/></linearGradient><rect x="0" y="0" width="${W}" height="1202" fill="url(#sky6)"/>`;
  // far below and away: the snowy land, a dark forest belt, other halls sending up their plumes, Helsinki's lights
  s += P(polyD([[0, 1196], [W, 1196], [W, 1238], [0, 1238]]), V[9]);
  s += P(smoothD([[0, 1200], [150, 1186], [320, 1194], [480, 1184], [660, 1192], [840, 1186], [1080, 1192], [1080, 1214], [0, 1216]], true), V[2]);
  for (const [x, w, hh] of [[80, 34, 260], [250, 24, 190], [400, 16, 140]]) { s += hrect(x - w / 2, 1176, w, 12, V[1], 0.4); s += steam(x, 1174, w * 3, hh, {n: 7, col: V[9], op: 0.55, lean: 0.25}); }
  for (let i = 0; i < 50; i++) s += rect(rr(680, 1070), rr(1186, 1198), 2.2, 2, C.honey, `opacity="${f1(rr(0.45, 1))}"`);
  // the roof: its far parapet with snow, the deck dark, melted round the fans
  s += P(polyD([[0, 1236], [W, 1236], [W, H], [0, H]]), V[4]);
  s += P(polyD([[0, 1236], [W, 1236], [W, 1262], [0, 1262]]), V[2]) + S(lineD([[0, 1236], [W, 1236]]), V[12], 5);
  for (const [y1, col] of [[1330, V[3]], [1560, V[2]]]) s += P(polyD([[0, y1], [W, y1 - 12], [W, H], [0, H]], 2), col);
  for (let i = 0; i < 12; i++) { const y = rr(1280, 1880); s += P(blobD(rr(0, W), y, rr(40, 130) * (y / 1300), rr(6, 14) * (y / 1300), 8, 0.3), V[7], 'opacity="0.5"'); }
  // the fans: far ones first, the big one near us last
  const fans = [[930, 1268, 92], [705, 1300, 150], [300, 1470, 330]];
  for (const [cx, cy, rx] of fans) {
    const ry = rx * 0.26, dh = rx * 0.42;
    s += ell(cx, cy + dh + ry * 0.4, rx * 1.4, ry * 1.6, V[1], 'opacity="0.8"');  // the melted ring
    s += P(polyD([[cx - rx * 1.06, cy], [cx + rx * 1.06, cy], [cx + rx * 1.06, cy + dh], [cx - rx * 1.06, cy + dh]], 0.6), V[2]);
    s += ell(cx, cy + dh, rx * 1.06, ry * 1.06, V[2]);
    s += S(lineD([[cx - rx * 1.06, cy + dh * 0.5], [cx + rx * 1.06, cy + dh * 0.5]]), V[3], 2, 'opacity="0.7"');
    s += fan(cx, cy, rx, ry, {ring: V[4], inner: V[1], blade: V[8]});
    // the plume: warm at the fan's mouth, pale vapour rising into the dark, thinning to nothing under the band
    const top = 650, hh = cy - top;
    s += steam(cx, cy - ry * 0.3, rx * 2.0, hh, {n: 14, warm: true, col: V[11], op: rx > 200 ? 0.8 : 0.6, root: 0.12, lean: 0.03, sharp: true});
    s += steam(cx, cy - ry * 0.3, rx * 2.6, hh * 0.9, {n: 8, col: V[9], op: 0.35, lean: 0.05});
    // the snow lifted in it: bright streaks curving upward, fading as they rise
    const nS = Math.round(rx / 5);
    for (let i = 0; i < nS; i++) { const x = cx + rr(-rx * 0.95, rx * 0.95), y = rr(top + 20, cy - ry - 10); const l = rr(8, 18) * (rx / 330 + 0.4); const fade = clamp((y - top) / hh, 0, 1); s += S(smoothD([[x, y + l], [x + rr(-4, 4), y + l * 0.45], [x + rr(-7, 7), y]], false), '#f7f8fa', rr(1.8, 3.4) * (rx / 330 + 0.5), `opacity="${f1(0.25 + 0.7 * fade)}"`); }
  }
  // her, small between the fans, looking up as the warmth goes, her coat lifting
  s += person(560, 1356, 128, {pose: 'stand', coat: V[1], dark: V[0], hair: V[0], skin: V[6], scarf: V[9], rim: C.honeyL});
  // snow falling where the heat isn't
  s += snowfall(180, 0, 1920, {rmax: 4.5});
  s += caption([{t: 'big fans', x: 380, y: 400, size: 112}, {t: 'blow that heat outside.', x: 545, y: 522, size: 100}]);
  return svgPage(s);
};

// ======================================================================================
// B7: the city reaches. From the terrace on Uspenski's rock, looking down one long snowy street of Katajanokka to the
// harbour: under the snow the city's own warm pipes light up and race to the water's edge, pointing across the ice at
// the plume of thrown-away heat. She leans on the railing.
// ======================================================================================
FRAMES.B7 = () => {
  seed(71);
  const cam = Cam(900, 540, 770, 27);
  let s = '';
  s += `<linearGradient id="sky7" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="772"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.38" stop-color="${C.paper}"/><stop offset="0.78" stop-color="${C.paper}"/><stop offset="0.9" stop-color="${V[10]}"/><stop offset="1" stop-color="${V[8]}"/></linearGradient><rect x="0" y="0" width="${W}" height="772" fill="url(#sky7)"/>`;
  // across the harbour: the far shore, the far data center and its plume of thrown-away heat
  s += P(polyD([[0, 772], [0, 758], [180, 760], [400, 754], [640, 760], [860, 752], [1080, 758], [1080, 772]], 1), V[6]);
  for (let i = 0; i < 22; i++) s += rect(rr(10, 1070), rr(758, 769), 2, 2, C.honey, `opacity="${f1(rr(0.4, 0.85))}"`);
  const dc = cam.p(1.5, 0, 1400);
  s += hrect(dc[0] - 30, dc[1] - 30, 60, 22, V[3], 0.4);
  s += steam(dc[0] - 4, dc[1] - 30, 260, 150, {n: 9, col: V[12], op: 0.9, warm: true, root: 0.22, lean: 0.15, sharp: true});
  // the frozen harbour between (light), the icebreakers' dark channel
  s += P(polyD([[0, 772], [W, 772], [W, 930], [0, 930]]), V[11]);
  s += P(smoothD([[0, 845], [300, 832], [640, 840], [1080, 828], [1080, 842], [640, 856], [300, 850], [0, 862]], true), V[7], 'opacity="0.8"');
  // the street's snow (white) running down to the quay; the city's roofs on both sides seen from above, snowy
  const zq = 230, sx = 6.5;
  s += poly3(cam, [[-sx, 0, 18], [sx, 0, 18], [sx, 0, zq], [-sx, 0, zq]], V[12]);
  for (const side of [-1, 1]) {
    // the facades facing the street (in shade), their warm windows, then the roof slopes with snow, block by block
    let z = 16;
    while (z < zq - 6) {
      const z2 = Math.min(zq - 4, z + rr(16, 26));
      const X = side * sx, Xr = side * (sx + 4.5), H1 = 16.5, H2 = 20.5;
      s += poly3(cam, [[X, 0, z], [X, 0, z2], [X, H1, z2], [X, H1, z]], V[side < 0 ? 2 : 3]);
      for (let fl = 0; fl < 4; fl++) for (let zz = z + 1.2; zz < z2 - 1.4; zz += rr(2.3, 3.1)) {
        const y1 = 3.6 + fl * 3.2;
        const q = q3(cam, [[X, y1, zz], [X, y1, zz + 1.2], [X, y1 + 1.8, zz + 1.2], [X, y1 + 1.8, zz]]);
        s += P(polyD(q, 0.3), rnd() < 0.62 ? C.honey : V[1], 'opacity="0.9"');
      }
      s += poly3(cam, [[X, H1, z], [X, H1, z2], [Xr, H2, z2], [Xr, H2, z]], V[6]);              // the roof slope
      s += poly3(cam, [[X, H1, z + 0.6], [X, H1, z2 - 0.6], [lerp(X, Xr, 0.55), lerp(H1, H2, 0.55), z2 - 1], [lerp(X, Xr, 0.55), lerp(H1, H2, 0.55), z + 1]], V[12], 'opacity="0.75"');   // its snow
      s += S(lineD([cam.p(X, H1, z), cam.p(X, H1, z2)]), V[1], 2.4);                         // the eave
      s += poly3(cam, [[Xr, H2, z], [Xr, H2, z2], [Xr + side * 9, H2 - 3, z2], [Xr + side * 9, H2 - 3, z]], V[3]); // the back slope
      // the end wall at the side street (a gap between blocks), and chimneys with snow
      s += poly3(cam, [[X, 0, z2], [Xr + side * 9, 0, z2], [Xr + side * 9, H2 - 3, z2], [Xr, H2, z2], [X, H1, z2]], V[side < 0 ? 1 : 2]);
      for (const cz of [z + 3, (z + z2) / 2]) { const a = cam.p(side * (sx + 2.6), H1 + 1.3, cz), b = cam.p(side * (sx + 2.6), H1 + 4, cz), w = cam.sz(0.9, cz); s += hrect(a[0] - w / 2, b[1], w, a[1] - b[1], V[1], 0.4) + ell(a[0], b[1], w * 0.6, w * 0.25, V[13]); }
      // the side street's own warm branch, joining the main line
      if (z2 < zq - 8) { const a = cam.p(side * 22, 0, z2 + 2), b = cam.p(0, 0, z2 + 2); s += S(lineD([a, b]), V[6], cam.sz(0.7, z2), 'opacity="0.6"') + S(lineD([a, b]), C.honey, cam.sz(0.25, z2)); }
      z = z2 + 4;
    }
  }
  // more of the city beyond, both sides: rows of snowy ridges receding (texture, no detail)
  for (const side of [-1, 1]) for (const X0 of [26, 44, 64]) for (let z = 30; z < zq - 10; z += rr(18, 28)) {
    const a = cam.p(side * X0, 18, z), b = cam.p(side * (X0 + 12), 18, z), c2 = cam.p(side * (X0 + 6), 22, z + 6);
    s += P(polyD([a, b, c2], 1), V[side < 0 ? 3 : 4]) + S(lineD([a, c2, b]), V[12], cam.sz(0.6, z), 'opacity="0.8"');
  }
  // the city's own warm line racing down the street to the water's edge (and stopping there, reaching across)
  const ln = [];
  for (let z = 18; z <= zq - 1; z *= 1.06) ln.push(cam.p(Math.sin(z * 0.08) * 0.4, 0, z));
  ln.push(cam.p(0, 0, zq - 1));
  s += S(lineD(ln), V[7], 30, 'opacity="0.6"') + S(lineD(ln), C.honey, 14) + S(lineD(ln), C.honeyL, 5);
  const tip = cam.p(0, 0, zq - 1);
  s += ell(tip[0], tip[1], 16, 6, C.honeyL) + steam(tip[0], tip[1] - 3, 70, 80, {n: 4, warm: true, col: V[13], op: 0.8});
  // the terrace's iron railing with snow on it, and her leaning on it, looking down the street (from behind)
  s += P(polyD([[0, 1560], [W, 1540], [W, H], [0, H]]), V[3]);
  s += S(lineD([[0, 1520], [W, 1500]]), V[0], 10) + S(lineD([[0, 1512], [W, 1492]]), V[13], 5);
  for (let x = 16; x < W; x += 40) s += S(lineD([[x, 1520 - x * 0.0185], [x, 1700]]), V[0], 4.5);
  s += S(lineD([[0, 1640], [W, 1622]]), V[0], 5);
  s += person(225, 1780, 430, {pose: 'lean', coat: V[1], dark: V[0], hair: V[0], skin: V[5], scarf: V[9], rim: C.honeyL});
  s += snowfall(220, 0, 1920);
  s += caption([{t: 'But Helsinki', x: 360, y: 368, size: 112}, {t: 'wants', x: 570, y: 488, lit: true, size: 156}, {t: 'that heat.', x: 770, y: 580, size: 104}]);
  return svgPage(s);
};

// ======================================================================================
// B8: the missing piece, drawn. Closer on the quay's end: the city's warm line comes from under our feet and stops in
// the untouched snow; from its end a dashed pencil pipe runs on to a big pencil hall on the empty lot; a paper tag
// "2027" on a survey stake marks the gap.
// ======================================================================================
FRAMES.B8 = () => {
  seed(81);
  const cam = Cam(1050, 520, 1110, 1.7);
  let s = '';
  s += `<linearGradient id="sky8" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1112"><stop offset="0" stop-color="${C.paperT}"/><stop offset="0.27" stop-color="${C.paper}"/><stop offset="0.54" stop-color="${C.paper}"/><stop offset="0.68" stop-color="${V[10]}"/><stop offset="0.86" stop-color="${V[7]}"/><stop offset="1" stop-color="${V[8]}"/></linearGradient><rect x="0" y="0" width="${W}" height="1114" fill="url(#sky8)"/>`;
  s += cloudBank(780, 110, V[9], 0.4, 6);
  // the far shore across the harbour, its windows
  s += P(polyD([[0, 1112], [0, 1084], [140, 1086], [300, 1080], [520, 1088], [760, 1082], [1080, 1090], [1080, 1112]], 1), V[5]);
  for (let i = 0; i < 40; i++) s += rect(rr(4, 1070), rr(1088, 1108), 2.4, 2.4, C.honey, `opacity="${f1(rr(0.45, 0.9))}"`);
  // the harbour ice to the left and beyond the lot
  s += P(polyD([[0, 1112], [W, 1112], [W, 1150], cam.p(-9.6, -1.1, 3), [0, 1920]]), V[9]);
  s += P(smoothD([[0, 1135], [260, 1125], [600, 1130], [1080, 1122], [1080, 1134], [600, 1142], [260, 1140], [0, 1150]], true), V[5], 'opacity="0.7"');
  // the icebreaker moored at the left, its stern toward us (black hull, pale decks)
  {
    const z = 30, zs = 34, st = (x, y) => cam.p(x, y, z);
    s += P(smoothD([st(-10, -1.1), st(-10, 4.2), st(-14, 5.1), st(-24, 5.4), st(-34, 4.8), st(-36, -1.1)], true), V[1]);
    s += faceZ(cam, zs, -32, -12, 5.1, 8.2, V[11]) + faceZ(cam, zs + 2, -30, -14, 8.2, 11.3, V[12]) + faceZ(cam, zs + 4, -27, -16, 11.3, 13.8, V[13]);
    for (const [yy, zz, x1, x2] of [[6.2, zs, -31, -13], [9.3, zs + 2, -29, -15], [12.2, zs + 4, -26, -17]]) for (let x = x1; x < x2 - 0.8; x += 1.7) s += faceZ(cam, zz - 0.01, x, x + 1, yy, yy + 1, rnd() < 0.15 ? '#e2eef3' : V[3]);
    s += faceZ(cam, zs + 9, -24, -19, 13.8, 18.2, V[2]);
    s += S(lineD([cam.p(-30, 8.25, zs), cam.p(-12, 8.25, zs)]), V[14], 2.6);
  }
  // the quay's snow, untouched toward the lot; the kerb along the water
  s += P(polyD([cam.p(-9.6, 0, 2.4), cam.p(-9.6, 0, 70), cam.p(10.4, 0, 70), cam.p(10.4, 0, 2.4)]), V[9]);
  for (const [z1, z2, col] of [[2.4, 3.8, V[5]], [3.8, 6, V[6]], [6, 10, V[7]], [10, 18, V[8]]]) s += P(polyD([cam.p(-9.6, 0, z1), cam.p(-9.6, 0, z2), cam.p(10.4, 0, z2), cam.p(10.4, 0, z1)], 1.5), col);
  s += P(polyD([cam.p(-9.8, 0.1, 2.4), cam.p(-9.8, 0.1, 70), cam.p(-8.6, 0.8, 70), cam.p(-8.6, 0.8, 2.4)], 1), V[11]);
  // the last old block on the right, its end wall facing the lot, warm windows, its door where the line branches in
  s += facadeX(cam, 10.4, 2.4, 12, 0, 10.5, V[3]) + poly3(cam, [[10.4, 10.5, 2.4], [10.4, 10.5, 12], [12, 12.9, 12], [12, 12.9, 2.4]], V[1]);
  s += faceZ(cam, 12, 10.4, 24, 0, 10.5, V[2]);
  for (let fl = 0; fl < 2; fl++) for (let zz = 4; zz < 11; zz += 2.6) { const q = q3(cam, [[10.4, 4 + fl * 3.2, zz], [10.4, 4 + fl * 3.2, zz + 1.2], [10.4, 5.8 + fl * 3.2, zz + 1.2], [10.4, 5.8 + fl * 3.2, zz]]); s += P(polyD(q, 0.3), rnd() < 0.7 ? C.honey : V[1], 'opacity="0.85"'); }
  // the drawn hall on the empty lot: big pale pencil lines over the night (painted = real, pencil = planned)
  seed(77);
  const pz1 = 30, pz2 = 56, h = 13, c = (x, y, z) => cam.p(x, y, z);
  s += pencil([c(-8.5, 0, pz1), c(8, 0, pz1), c(8, h, pz1), c(-8.5, h, pz1), c(-8.5, 0, pz1)], 4.2);
  s += pencil([c(8, 0, pz1), c(8, 0, pz2), c(8, h, pz2), c(8, h, pz1)], 3, {op: 0.7});
  s += pencil([c(-8.5, h, pz1), c(-8.5, h, pz2), c(8, h, pz2)], 2.6, {op: 0.55});
  s += pencil([c(-3.2, 0, pz1), c(-3.2, 7, pz1), c(3.2, 7, pz1), c(3.2, 0, pz1)], 3.4, {op: 0.95});
  for (let i = 0; i < 5; i++) { const xx = -6.4 + i * 3.2; s += pencil([c(xx, 9, pz1), c(xx + 1.6, 9, pz1)], 2, {op: 0.5}); }
  s += pencil([c(-10.5, 0, pz1 - 1.2), c(10, 0, pz1 - 1.2)], 1.8, {op: 0.4, dash: '10 12'});
  // the city's warm line from under our feet, stopping in the untouched snow: the gap
  const zEnd = 13.5;
  const pts = []; for (let z = 2.4; z <= zEnd; z *= 1.06) pts.push([-0.6 + Math.sin(z * 0.3) * 0.25, z]); pts.push([-0.6, zEnd]);
  const seam = (half, col, ex, wob) => { const tp = (z) => clamp(z / 5, 0.6, 1); const L = pts.map(([x, z]) => cam.p(x - half * tp(z) * (1 + rr(-wob, wob)), 0, z)), Rr = pts.map(([x, z]) => cam.p(x + half * tp(z) * (1 + rr(-wob, wob)), 0, z)).reverse(); return P(smoothD(L.concat(Rr), true), col, ex); };
  s += seam(0.95, V[10], 'opacity="0.5"', 0.35) + seam(0.62, V[2], '', 0.3) + seam(0.5, C.honey, 'opacity="0.4" filter="url(#b8)"', 0.2) + seam(0.2, C.honeyD, 'opacity="0.95"', 0.45) + seam(0.085, C.honeyL, '', 0.55);
  const end = cam.p(-0.6, 0, zEnd);
  s += steam(end[0], end[1] - 4, 70, 120, {n: 5, warm: true, col: V[12], op: 0.7});
  // the missing piece: a dashed pencil pipe across the untouched snow, from the line's end to the drawn door
  seed(78);
  const gap = [c(-0.6, 0, zEnd), c(-0.45, 0, 17), c(-0.2, 0, 22.5), c(0, 0, pz1)];
  s += S(lineD(gap), V[3], 16, 'opacity="0.35"');
  s += pencil(gap, 7, {dash: '22 14', op: 1});
  // the survey stake at the line's end, its paper tag swinging: 2027
  const stB = cam.p(-2.4, 0, 12.5), stT = cam.p(-2.4, 1.8, 12.5);
  s += S(lineD([stB, stT]), V[1], 5) + ell(stB[0], stB[1], 10, 3.5, V[3]);
  const tx = stT[0] - 150, ty = stT[1] + 4;
  s += S(lineD([[stT[0], stT[1] + 3], [tx + 136, ty + 8]]), V[2], 1.8);
  s += P(polyD([[tx, ty + 6], [tx + 136, ty], [tx + 140, ty + 78], [tx + 6, ty + 86]], 0.8), '#f4f2ea');
  s += `<text x="${tx + 72}" y="${ty + 60}" font-family="Gaegu" font-weight="700" font-size="58" text-anchor="middle" fill="${C.ink}" transform="rotate(-3 ${tx + 72} ${ty + 48})" class="ink">2027</text>`;
  // she stands by the line's end, looking at the drawn hall (from behind)
  const f = cam.p(1.8, 0, 9.2);
  s += ell(f[0] + 4, f[1] + 1, cam.sz(0.5, 9.2), cam.sz(0.12, 9.2), V[4], 'opacity="0.6"');
  s += person(f[0], f[1], cam.sz(1.7, 9.2), {pose: 'stand', coat: V[1], dark: V[0], hair: V[0], skin: V[5], scarf: V[9], rim: C.honeyL});
  s += snowfall(220, 0, 1920);
  s += caption([{t: 'a plan,', x: 360, y: 400, size: 112}, {t: 'starting next year.', x: 560, y: 522, size: 108}]);
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
