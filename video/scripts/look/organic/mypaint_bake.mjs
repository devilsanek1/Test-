// The organic proof's brush (docs/look/organic/organic_proof.md; libraries.md rank 1): MyPaint's brush engine through
// peinten (MIT, a TypeScript port of libmypaint, ISC; pinned peinten@1.3.0) with the CC0 mypaint-brushes 2.0.2 presets,
// on the CPU in Node. Our Python planner (organic_proof.py) decides every mark (where, which brush, which colour, why);
// this only lays them, over the piece's own designed base, so smudge and wet brushes pick up OUR colours.
// Deterministic: one seed per stroke, fixed stroke order, integer fix15 tiles (the same bytes on every run).
//   node mypaint_bake.mjs <job.json>
//   job = {size: [w, h], base: "base.rgba" | null, out: "out.rgba",
//          clips: {name: "mask.u8"} (optional: w*h bytes, 0..255, a selection a stroke may be clipped to),
//          strokes: [{brush, pts: [[x, y, pressure]], color: "#rrggbb", width, opacity, seed, speed?, lock?, clip?,
//                     eraser?, rawSize?}]}
// Paths (outside the repo: nothing installs into it): OC_PEINTEN (peinten's dist/domain), OC_BRUSHES (the .myb folder).
import fs from 'fs';

const P = process.env.OC_PEINTEN || '/tmp/organic/organic_proof/npm/node_modules/peinten/dist/domain';
const BR = process.env.OC_BRUSHES || '/tmp/organic/organic_proof/data/mypaint-brushes-2.0.2/brushes';
const {BrushEngine} = await import(`${P}/brush/brush-engine.js`);
const {TiledSurface} = await import(`${P}/brush/tiled-surface.js`);
const {CompiledBrush} = await import(`${P}/brush/mapping.js`);
const {parseMyb} = await import(`${P}/brush/myb.js`);
const {resolveBrush} = await import(`${P}/brush/resolve-brush.js`);
const {libMyPaintPigmentMixer} = await import(`${P}/brush/color-mixer.js`);
const {TILE_SIZE, FIX15_ONE, tileKey} = await import(`${P}/tiles/tile.js`);

const job = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const [W, H] = job.size;
const mixer = libMyPaintPigmentMixer;
const brushes = new Map();
function brushOf(name) {
  if (!brushes.has(name)) brushes.set(name, parseMyb(fs.readFileSync(`${BR}/${name}.myb`, 'utf8'), name).brush);
  return brushes.get(name);
}
// A size override sets the BASE radius; a pressure curve on the radius adds to it in log space, so a full-pressure dab
// would come out e^curve(p) wider than asked: take that out, so `width` is the full-pressure diameter.
function curveAt(points, x) {
  if (!points || !points.length) return 0;
  if (x <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++)
    if (x <= points[i][0]) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      return y0 + ((y1 - y0) * (x - x0)) / Math.max(x1 - x0, 1e-9);
    }
  return points[points.length - 1][1];
}
function sizeFor(brush, width, pmax) {
  const r = brush.settings.radius_logarithmic;
  const pc = r && r.inputs && r.inputs.pressure;
  return width * Math.exp(-curveAt(pc, pmax));
}
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);

// the base image -> premultiplied fix15 tiles
let tiles = new Map();
if (job.base) {
  const buf = fs.readFileSync(job.base);
  for (let ty = 0; ty * TILE_SIZE < H; ty++)
    for (let tx = 0; tx * TILE_SIZE < W; tx++) {
      const t = new Uint16Array(TILE_SIZE * TILE_SIZE * 4);
      let any = false;
      for (let y = 0; y < TILE_SIZE; y++)
        for (let x = 0; x < TILE_SIZE; x++) {
          const X = tx * TILE_SIZE + x;
          const Y = ty * TILE_SIZE + y;
          if (X >= W || Y >= H) continue;
          const i = (Y * W + X) * 4;
          const a = buf[i + 3] / 255;
          if (!a) continue;
          const o = (y * TILE_SIZE + x) * 4;
          any = true;
          t[o] = Math.round((buf[i] / 255) * a * FIX15_ONE);
          t[o + 1] = Math.round((buf[i + 1] / 255) * a * FIX15_ONE);
          t[o + 2] = Math.round((buf[i + 2] / 255) * a * FIX15_ONE);
          t[o + 3] = Math.round(a * FIX15_ONE);
        }
      if (any) tiles.set(tileKey(tx, ty), t);
    }
}
// selections (clip masks) -> fix15 coverage tiles
const clips = new Map();
for (const [name, file] of Object.entries(job.clips || {})) {
  const buf = fs.readFileSync(file);
  const m = new Map();
  for (let ty = 0; ty * TILE_SIZE < H; ty++)
    for (let tx = 0; tx * TILE_SIZE < W; tx++) {
      const t = new Uint16Array(TILE_SIZE * TILE_SIZE);
      let any = false;
      for (let y = 0; y < TILE_SIZE; y++)
        for (let x = 0; x < TILE_SIZE; x++) {
          const X = tx * TILE_SIZE + x;
          const Y = ty * TILE_SIZE + y;
          if (X >= W || Y >= H) continue;
          const v = buf[Y * W + X];
          if (!v) continue;
          any = true;
          t[y * TILE_SIZE + x] = Math.round((v / 255) * FIX15_ONE);
        }
      if (any) m.set(tileKey(tx, ty), t);
    }
  clips.set(name, m);
}

const t0 = Date.now();
for (let si = 0; si < job.strokes.length; si++) {
  const s = job.strokes[si];
  const br = brushOf(s.brush);
  const pmax = Math.max(...s.pts.map((q) => q[2]));
  const res = {color: hex(s.color), brush: br, eraser: !!s.eraser, size: s.rawSize ? s.width : sizeFor(br, s.width, pmax), opacity: s.opacity ?? 1};
  const compiled = new CompiledBrush(resolveBrush(res));
  const eng = new BrushEngine(compiled, mixer, s.seed ?? si + 1);
  const surf = new TiledSurface(tiles, {mixer, bounds: {x: 0, y: 0, width: W, height: H}, clip: s.clip ? clips.get(s.clip) ?? null : null, alphaLocked: !!s.lock});
  const speed = s.speed ?? 400; // px per second: the speed inputs see a calm, steady hand
  let px = s.pts[0][0];
  let py = s.pts[0][1];
  eng.strokeTo(surf, px, py, 0, 0, 0, 0.5, 1, 0, 0); // pen down (pressure 0), as a tablet starts a stroke
  for (const [x, y, p] of s.pts) {
    const d = Math.hypot(x - px, y - py);
    px = x;
    py = y;
    eng.strokeTo(surf, x, y, p, 0, 0, Math.max(d / speed, 0.004), 1, 0, 0);
  }
  const [lx, ly] = s.pts[s.pts.length - 1];
  eng.strokeTo(surf, lx, ly, 0, 0, 0, 0.02, 1, 0, 0); // pen up
  tiles = surf.commit();
}
// tiles -> straight RGBA bytes
const out = Buffer.alloc(W * H * 4);
for (let ty = 0; ty * TILE_SIZE < H; ty++)
  for (let tx = 0; tx * TILE_SIZE < W; tx++) {
    const t = tiles.get(tileKey(tx, ty));
    if (!t) continue;
    for (let y = 0; y < TILE_SIZE; y++)
      for (let x = 0; x < TILE_SIZE; x++) {
        const X = tx * TILE_SIZE + x;
        const Y = ty * TILE_SIZE + y;
        if (X >= W || Y >= H) continue;
        const o = (y * TILE_SIZE + x) * 4;
        const a = t[o + 3];
        if (!a) continue;
        const i = (Y * W + X) * 4;
        out[i] = Math.min(255, Math.round((t[o] / a) * 255));
        out[i + 1] = Math.min(255, Math.round((t[o + 1] / a) * 255));
        out[i + 2] = Math.min(255, Math.round((t[o + 2] / a) * 255));
        out[i + 3] = Math.round((a / FIX15_ONE) * 255);
      }
  }
fs.writeFileSync(job.out, out);
console.log(`mypaint: ${job.strokes.length} strokes in ${((Date.now() - t0) / 1000).toFixed(2)} s -> ${job.out}`);
