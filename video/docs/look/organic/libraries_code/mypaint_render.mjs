// MyPaint (libmypaint's engine, via peinten's MIT TypeScript port, on the CPU in Node): paint a stroke plan over a
// base image with real MyPaint brushes (CC0 mypaint-brushes 2.0.2). Deterministic: one seed per stroke.
// usage: node mypaint_render.mjs <job.json>   job = {size:[w,h], base:"in.rgba"|null, out:"out.rgba", strokes:[{brush, pts:[[x,y,p]], color, width, opacity, seed, speed}]}
import fs from 'fs';
const P = '/tmp/organic/libraries/npm/node_modules/peinten/dist/domain';
const { BrushEngine } = await import(`${P}/brush/brush-engine.js`);
const { TiledSurface } = await import(`${P}/brush/tiled-surface.js`);
const { CompiledBrush } = await import(`${P}/brush/mapping.js`);
const { parseMyb } = await import(`${P}/brush/myb.js`);
const { resolveBrush } = await import(`${P}/brush/resolve-brush.js`);
const { libMyPaintPigmentMixer } = await import(`${P}/brush/color-mixer.js`);
const { TILE_SIZE, FIX15_ONE, tileKey } = await import(`${P}/tiles/tile.js`);
const { withBaseValues } = await import(`${P}/brush/settings.js`);
const BR = '/tmp/organic/libraries/data/mypaint-brushes/mypaint-brushes-2.0.2/brushes';

const job = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const [W, H] = job.size;
const mixer = libMyPaintPigmentMixer;
const cache = new Map();
function brushOf(name) {
  if (!cache.has(name)) cache.set(name, parseMyb(fs.readFileSync(`${BR}/${name}.myb`, 'utf8'), name).brush);
  return cache.get(name);
}
// the size override sets the BASE radius; a pressure curve on the radius adds to it (log scale), so a full-pressure
// dab would be e^curve(1) times wider than asked: take that out, so `width` is the full-pressure diameter
function curveAt(points, x) {
  if (!points || !points.length) return 0;
  if (x <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) if (x <= points[i][0]) {
    const [x0, y0] = points[i - 1], [x1, y1] = points[i]; return y0 + (y1 - y0) * (x - x0) / Math.max(x1 - x0, 1e-9);
  }
  return points[points.length - 1][1];
}
function sizeFor(brush, width, pmax) {
  const r = brush.settings.radius_logarithmic; const pc = r && r.inputs && r.inputs.pressure;
  return width * Math.exp(-curveAt(pc, pmax));
}
function hex(c) { return [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16) / 255); }

// base image -> premultiplied fix15 tiles
let base = new Map();
if (job.base) {
  const buf = fs.readFileSync(job.base);
  for (let ty = 0; ty * TILE_SIZE < H; ty++) for (let tx = 0; tx * TILE_SIZE < W; tx++) {
    const t = new Uint16Array(TILE_SIZE * TILE_SIZE * 4); let any = false;
    for (let y = 0; y < TILE_SIZE; y++) for (let x = 0; x < TILE_SIZE; x++) {
      const X = tx * TILE_SIZE + x, Y = ty * TILE_SIZE + y; if (X >= W || Y >= H) continue;
      const i = (Y * W + X) * 4, a = buf[i + 3] / 255; if (!a) continue;
      const o = (y * TILE_SIZE + x) * 4; any = true;
      t[o] = Math.round(buf[i] / 255 * a * FIX15_ONE); t[o + 1] = Math.round(buf[i + 1] / 255 * a * FIX15_ONE);
      t[o + 2] = Math.round(buf[i + 2] / 255 * a * FIX15_ONE); t[o + 3] = Math.round(a * FIX15_ONE);
    }
    if (any) base.set(tileKey(tx, ty), t);
  }
}
const opts = { mixer, bounds: { x: 0, y: 0, width: W, height: H }, clip: null, alphaLocked: false };
const t0 = Date.now(); let nDab = 0;
for (let si = 0; si < job.strokes.length; si++) {
  const s = job.strokes[si];
  let br = brushOf(s.brush);
  if (job.paintMode !== undefined) br = withBaseValues(br, { paint_mode: job.paintMode });   // 0 = no spectral mixing
  const pmax = Math.max(...s.pts.map(q => q[2]));
  const res = { color: hex(s.color), brush: br, eraser: !!s.eraser, size: s.rawSize ? s.width : sizeFor(br, s.width, pmax), opacity: s.opacity ?? 1 };
  const compiled = new CompiledBrush(resolveBrush(res));
  const eng = new BrushEngine(compiled, mixer, s.seed ?? (si + 1));
  const surf = new TiledSurface(base, opts);
  const speed = s.speed ?? 400;                      // px per second: the speed inputs see a calm, steady hand
  let px = s.pts[0][0], py = s.pts[0][1];
  eng.strokeTo(surf, px, py, 0, 0, 0, 0.5, 1, 0, 0);  // pen down (pressure 0), as a tablet starts a stroke
  for (const [x, y, p] of s.pts) {
    const d = Math.hypot(x - px, y - py); px = x; py = y;
    eng.strokeTo(surf, x, y, p, 0, 0, Math.max(d / speed, 0.004), 1, 0, 0);
  }
  const [lx, ly] = s.pts[s.pts.length - 1];
  eng.strokeTo(surf, lx, ly, 0, 0, 0, 0.02, 1, 0, 0);   // pen up
  base = surf.commit(); nDab++;
}
// tiles -> straight RGBA bytes
const out = Buffer.alloc(W * H * 4);
for (const [key, t] of base) {
  // tileKey packs (tx, ty); recompute by scanning the grid once
}
for (let ty = 0; ty * TILE_SIZE < H; ty++) for (let tx = 0; tx * TILE_SIZE < W; tx++) {
  const t = base.get(tileKey(tx, ty)); if (!t) continue;
  for (let y = 0; y < TILE_SIZE; y++) for (let x = 0; x < TILE_SIZE; x++) {
    const X = tx * TILE_SIZE + x, Y = ty * TILE_SIZE + y; if (X >= W || Y >= H) continue;
    const o = (y * TILE_SIZE + x) * 4, a = t[o + 3]; if (!a) continue;
    const i = (Y * W + X) * 4;
    out[i] = Math.min(255, Math.round(t[o] / a * 255)); out[i + 1] = Math.min(255, Math.round(t[o + 1] / a * 255));
    out[i + 2] = Math.min(255, Math.round(t[o + 2] / a * 255)); out[i + 3] = Math.round(a / FIX15_ONE * 255);
  }
}
fs.writeFileSync(job.out, out);
console.log(`mypaint: ${job.strokes.length} strokes in ${((Date.now() - t0) / 1000).toFixed(2)} s -> ${job.out}`);
