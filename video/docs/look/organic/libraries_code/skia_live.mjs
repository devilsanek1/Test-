// CanvasKit (the engine under @remotion/skia), CPU raster in Node: the same live organic pass (SkSL fbm domain warp)
// over the full 1080 x 1920 still, timed per frame.
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const CanvasKitInit = require('/tmp/organic/libraries/npm/node_modules/canvaskit-wasm/bin/full/canvaskit.js');
const CK = await CanvasKitInit({ locateFile: (f) => `/tmp/organic/libraries/npm/node_modules/canvaskit-wasm/bin/full/${f}` });
const img = CK.MakeImageFromEncoded(fs.readFileSync('/tmp/organic/libraries/inputs/still_v6.png'));
const W = 1080, H = 1920;
const fx = CK.RuntimeEffect.Make(`
uniform shader img; uniform float time;
float h(float2 p) { return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453); }
float vn(float2 p) { float2 i = floor(p), f = fract(p); f = f * f * (3 - 2 * f);
  return mix(mix(h(i), h(i + float2(1, 0)), f.x), mix(h(i + float2(0, 1)), h(i + float2(1, 1)), f.x), f.y); }
float fbm(float2 p) { float s = 0, a = 0.5; for (int k = 0; k < 4; k++) { s += a * vn(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
half4 main(float2 p) {
  float inBox = step(560, p.x) * step(p.y, 345);
  float2 q = p / 70 + float2(time * 0.15, 0);
  float2 w = float2(fbm(q), fbm(q + 31.7)) - 0.5;
  return img.eval(p + inBox * w * 12);
}`);
const surf = CK.MakeSurface(W, H); const c = surf.getCanvas();
const sh = (t) => fx.makeShaderWithChildren([t], [img.makeShaderOptions(CK.TileMode.Clamp, CK.TileMode.Clamp, CK.FilterMode.Linear, CK.MipmapMode.None)]);
const p = new CK.Paint();
p.setShader(sh(0)); c.drawRect(CK.LTRBRect(0, 0, W, H), p); surf.flush();
const N = 5, t0 = Date.now();
for (let i = 0; i < N; i++) { p.setShader(sh(i / 60)); c.drawRect(CK.LTRBRect(0, 0, W, H), p); surf.flush(); surf.makeImageSnapshot().readPixels(0, 0, { width: 1, height: 1, colorType: CK.ColorType.RGBA_8888, alphaType: CK.AlphaType.Unpremul, colorSpace: CK.ColorSpace.SRGB }); }
console.log('canvaskit cpu ms/frame (full-frame SkSL warp):', Math.round((Date.now() - t0) / N));
