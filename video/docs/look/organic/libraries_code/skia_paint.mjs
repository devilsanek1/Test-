// Skia (CanvasKit, BSD-3; the same engine as @remotion/skia) + perfect-freehand (MIT): our designed zones drawn as
// vector paths, warped by a fractal-noise displacement (one consistent domain warp, so zone edges never gap), the
// silhouette roughened by a Discrete+Corner path effect, lost-and-found edges by an SkSL runtime shader (crisp where
// the edge faces the light, blurred where it turns away, broken up by noise), then the shared stroke plan as tapered
// perfect-freehand strokes with an SkSL dry-brush texture along each stroke. Deterministic: every noise is seeded.
// usage: node skia_paint.mjs <name> <out.rgba> [variant]
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const CanvasKitInit = require('/tmp/organic/libraries/npm/node_modules/canvaskit-wasm/bin/full/canvaskit.js');
const { getStroke } = await import('/tmp/organic/libraries/npm/node_modules/perfect-freehand/dist/esm/index.mjs');
const CK = await CanvasKitInit({ locateFile: (f) => `/tmp/organic/libraries/npm/node_modules/canvaskit-wasm/bin/full/${f}` });
const [name, outRaw, variant = 'full'] = process.argv.slice(2);
const plan = JSON.parse(fs.readFileSync(`/tmp/organic/libraries/plans/${name}.json`, 'utf8'));
const [W, H] = plan.size;
const T = name === 'cloud'
  ? { warp: 9, warpFreq: 0.022, disc: [10, 2.6], corner: 7, lostSigma: 7, lostNoise: 0.012, strokeOp: 0.85, lost: true }
  : { warp: 4, warpFreq: 0.045, disc: [5, 1.6], corner: 2, lostSigma: 1.2, lostNoise: 0.03, strokeOp: 0.95, lost: false };
const hex = (h, a = 1) => CK.Color(parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), a);
// CanvasKit's raster surface is UNPREMUL: its snapshot, sampled with a linear filter or blurred, lerps straight colour
// toward transparent black (dark fringes). Re-wrap every snapshot as a PREMUL image before filtering it.
function premulImage(surface) {
  const px = surface.makeImageSnapshot().readPixels(0, 0, { width: W, height: H, colorType: CK.ColorType.RGBA_8888,
    alphaType: CK.AlphaType.Premul, colorSpace: CK.ColorSpace.SRGB });
  return CK.MakeImage({ width: W, height: H, colorType: CK.ColorType.RGBA_8888, alphaType: CK.AlphaType.Premul,
    colorSpace: CK.ColorSpace.SRGB }, px, W * 4);
}
function pathOf(polys) {
  const b = new CK.PathBuilder();
  for (const poly of polys) if (poly.length >= 3) b.addPolygon(poly.flat(), true);
  return b.detach();
}
const t0 = Date.now();
const surf = CK.MakeSurface(W, H);
const cv = surf.getCanvas();
cv.clear(CK.TRANSPARENT);
if (plan.wood) cv.drawImage(CK.MakeImageFromEncoded(fs.readFileSync(plan.wood)), 0, 0);   // the trunk stays the design's

// ---- 1. zones, drawn crisp, then ONE domain warp for the whole layer (an SkSL value-noise fbm: every zone edge moves
// together, so nothing gaps); the silhouette roughened by a Discrete path effect
const zsurf = CK.MakeSurface(W, H); const zc = zsurf.getCanvas(); zc.clear(CK.TRANSPARENT);
const silPaint = new CK.Paint(); silPaint.setAntiAlias(true);
silPaint.setColor(hex(plan.zones[Math.min(1, plan.zones.length - 1)].color));
silPaint.setPathEffect(CK.PathEffect.MakeDiscrete(T.disc[0], T.disc[1], 5));   // CanvasKit has no MakeCompose
zc.drawPath(pathOf(plan.silhouette), silPaint);
for (const z of plan.zones) {
  const zp = new CK.Paint(); zp.setAntiAlias(true); zp.setColor(hex(z.color));
  zp.setPathEffect(CK.PathEffect.MakeCorner(T.corner));
  zc.drawPath(pathOf(z.polys), zp);
}
const zimg = premulImage(zsurf);
const warpFx = CK.RuntimeEffect.Make(`
uniform shader img; uniform float freq; uniform float amp; uniform float2 seed;
float h(float2 p) { return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453); }
float vn(float2 p) { float2 i = floor(p), f = fract(p); f = f * f * (3 - 2 * f);
  return mix(mix(h(i), h(i + float2(1, 0)), f.x), mix(h(i + float2(0, 1)), h(i + float2(1, 1)), f.x), f.y); }
float fbm(float2 p) { float s = 0, a = 0.5; for (int k = 0; k < 4; k++) { s += a * vn(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
half4 tex(float2 p) {   // bilinear in PREMULTIPLIED space (CanvasKit's linear sampler lerps straight colour: dark fringes)
  float2 q = p - 0.5; float2 i = floor(q); float2 f = q - i;
  half4 a = img.eval(i + 0.5), b = img.eval(i + float2(1.5, 0.5)), c = img.eval(i + float2(0.5, 1.5)), d = img.eval(i + 1.5);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
half4 main(float2 p) {
  float2 q = p * freq;
  float2 w = float2(fbm(q + seed), fbm(q + seed.yx + 31.7)) - 0.5;
  return tex(p + w * 2 * amp);
}`);
if (!warpFx) throw new Error('warp SkSL failed');
const wp = new CK.Paint();
wp.setShader(warpFx.makeShaderWithChildren([T.warpFreq, T.warp, 13.1, 7.7],
  [zimg.makeShaderOptions(CK.TileMode.Decal, CK.TileMode.Decal, CK.FilterMode.Nearest, CK.MipmapMode.None)]));
if (variant === 'zones_raw') cv.drawImage(zimg, 0, 0); else cv.drawRect(CK.LTRBRect(0, 0, W, H), wp);

// ---- 2. the stroke plan: perfect-freehand outlines; an SkSL dry-brush texture along each stroke
const bristle = CK.RuntimeEffect.Make(`
uniform half4 color; uniform float2 dir; uniform float2 off; uniform float along; uniform float across; uniform float dry;
float h(float2 p) { return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453); }
float vn(float2 p) { float2 i = floor(p), f = fract(p); f = f * f * (3 - 2 * f);
  return mix(mix(h(i), h(i + float2(1, 0)), f.x), mix(h(i + float2(0, 1)), h(i + float2(1, 1)), f.x), f.y); }
half4 main(float2 p) {
  float2 q = float2(dot(p, dir), dot(p, float2(-dir.y, dir.x)));
  float n = 0.65 * vn(q / float2(along, across) + off) + 0.35 * vn(q / float2(along * 0.4, across * 0.5) + off * 1.7);
  float a = smoothstep(dry - 0.12, dry + 0.12, n);
  return half4(color.rgb * color.a * a, color.a * a);
}`);
if (!bristle) throw new Error('SkSL bristle shader failed to compile');
function strokePath(s, opts) {
  const outline = getStroke(s.pts, { size: s.width, thinning: 0.55, smoothing: 0.6, streamline: 0.35, simulatePressure: false,
    start: { taper: s.width * 0.6, cap: true }, end: { taper: s.width * (opts.tail ?? 2.2), cap: true }, last: true });
  if (outline.length < 3) return null;
  return pathOf([outline]);
}
let si = 0;
const KIND = {
  wash: { blur: 3.2, dry: 0.0, op: 0.55 }, form: { blur: 0, dry: 0.30, op: 0.9 }, blend: { blur: 3.5, dry: 0.0, op: 0.6 },
  edge: { blur: 0, dry: 0.22, op: 0.95 }, lost: { blur: name === 'cloud' ? 6 : 0, dry: name === 'cloud' ? 0.0 : 0.25, op: 0.7 }, dab: { blur: 0, dry: 0.15, op: 1, tail: 0.8 },
  leafy: { blur: 0, dry: 0.1, op: 1, tail: 0.6 }, accent: { blur: 0, dry: 0.05, op: 1, tail: 1.5 },
};
if (!variant.startsWith('zones')) {
  for (const kind of ['wash', 'form', 'blend', 'edge', 'dab', 'leafy', 'accent']) {
    for (const s of plan.strokes) {
      if (s.kind !== kind) continue; si++;
      const k = (kind === 'edge' && s.lost) ? KIND.lost : KIND[kind];
      const path = strokePath(s, k); if (!path) continue;
      const pt = new CK.Paint(); pt.setAntiAlias(true);
      const a = s.pts[0], b = s.pts[s.pts.length - 1];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const dn = Math.hypot(dx, dy) || 1; dx /= dn; dy /= dn;
      const c = hex(s.color, Math.min(1, s.opacity * k.op * T.strokeOp));
      if (k.dry > 0) {
        pt.setShader(bristle.makeShader([c[0], c[1], c[2], c[3], dx, dy, (si * 7.31) % 97, (si * 3.17) % 89,
          Math.max(6, s.width * 2.2), Math.max(0.9, s.width * 0.12), k.dry]));
      } else pt.setColor(c);
      if (k.blur > 0) pt.setMaskFilter(CK.MaskFilter.MakeBlur(CK.BlurStyle.Normal, k.blur, true));
      cv.drawPath(path, pt);
    }
  }
}
// ---- 3. lost-and-found edges: an SkSL mix of the crisp layer and a blurred copy, by how the edge faces the light
const snap = premulImage(surf);
if (variant === 'zones_raw' || variant === 'zones_warp') { const px0 = snap.readPixels(0, 0, { width: W, height: H, colorType: CK.ColorType.RGBA_8888, alphaType: CK.AlphaType.Unpremul, colorSpace: CK.ColorSpace.SRGB }); fs.writeFileSync(outRaw, Buffer.from(px0.buffer, px0.byteOffset, px0.byteLength)); console.log('early out', variant); process.exit(0); }
const blurSurf = CK.MakeSurface(W, H); const bc = blurSurf.getCanvas(); bc.clear(CK.TRANSPARENT);
const bp = new CK.Paint(); bp.setImageFilter(CK.ImageFilter.MakeBlur(T.lostSigma, T.lostSigma, CK.TileMode.Decal, null));
bc.drawImage(snap, 0, 0, bp);
const blurred = blurSurf.makeImageSnapshot();
const lostFx = CK.RuntimeEffect.Make(`
uniform shader crisp; uniform shader soft; uniform float2 light; uniform float freq;
float h(float2 p) { return fract(sin(dot(p, float2(41.3, 289.1))) * 43758.5453); }
float vn(float2 p) { float2 i = floor(p), f = fract(p); f = f * f * (3 - 2 * f);
  return mix(mix(h(i), h(i + float2(1, 0)), f.x), mix(h(i + float2(0, 1)), h(i + float2(1, 1)), f.x), f.y); }
half4 main(float2 p) {
  half4 c = crisp.eval(p), s = soft.eval(p);
  float gx = soft.eval(p + float2(3, 0)).a - soft.eval(p - float2(3, 0)).a;
  float gy = soft.eval(p + float2(0, 3)).a - soft.eval(p - float2(0, 3)).a;
  float g = length(float2(gx, gy));
  float2 n = g > 1e-4 ? -float2(gx, gy) / g : float2(0);          // outward normal of the mass
  float away = smoothstep(-0.15, 0.55, -dot(n, light));             // 1 where the edge turns from the light
  float brk = smoothstep(0.35, 0.65, vn(p * freq));                  // lost and found alternate along the edge
  float w = clamp(away * (0.35 + 0.65 * brk), 0, 1) * smoothstep(0.0, 0.08, g);
  return mix(c, s, w);
}`);
const out = CK.MakeSurface(W, H); const oc = out.getCanvas(); oc.clear(CK.TRANSPARENT);
const lp = new CK.Paint();
lp.setShader(lostFx.makeShaderWithChildren([plan.light[0], plan.light[1], T.lostNoise],
  [snap.makeShaderOptions(CK.TileMode.Decal, CK.TileMode.Decal, CK.FilterMode.Nearest, CK.MipmapMode.None),
   blurred.makeShaderOptions(CK.TileMode.Decal, CK.TileMode.Decal, CK.FilterMode.Nearest, CK.MipmapMode.None)]));
if (T.lost) oc.drawRect(CK.LTRBRect(0, 0, W, H), lp); else oc.drawImage(snap, 0, 0);
const img = out.makeImageSnapshot();
const px = img.readPixels(0, 0, { width: W, height: H, colorType: CK.ColorType.RGBA_8888, alphaType: CK.AlphaType.Unpremul, colorSpace: CK.ColorSpace.SRGB });
fs.writeFileSync(outRaw, Buffer.from(px.buffer, px.byteOffset, px.byteLength));
console.log(`skia: ${name} ${si} strokes in ${((Date.now() - t0) / 1000).toFixed(2)} s`);
