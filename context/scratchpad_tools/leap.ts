import {pickup, PICKUP_T} from '/home/user/Test-/video/src/scenes/scene01/handoff';
import {toScreen, zoomAt} from '/home/user/Test-/video/src/scenes/scene01/camera';
import {PLAZA} from '/home/user/Test-/video/src/scenes/shared/sets';
const exitAt = 4.35;
const from = toScreen(exitAt, [PLAZA.pip[0], PLAZA.pip[1] + 12], 'near');
console.log('from', from, 'scale', zoomAt(exitAt, 'near'), 'pickup', pickup, PICKUP_T);
const hermite = (a: number, ma: number, b: number, mb: number, s: number) => { const s2 = s*s, s3 = s2*s; return (2*s3-3*s2+1)*a + (s3-2*s2+s)*ma + (-2*s3+3*s2)*b + (s3-s2)*mb; };
const D = PICKUP_T - exitAt;
for (const v0 of [[600,-1700],[150,-1900],[0,-1900],[-200,-1900],[150,-2100]]) {
  const xs: string[] = [];
  let mx = -1e9;
  for (let f = 131; f <= 141; f++) { const t = f/30; if (t < exitAt) continue; const s = (t-exitAt)/D; const x = hermite(from[0], v0[0]*D, pickup.p.x, pickup.v[0]*D, s); const y = hermite(from[1], v0[1]*D, pickup.p.y, pickup.v[1]*D, s); mx = Math.max(mx, x); xs.push(`${f}:(${x.toFixed(0)},${y.toFixed(0)})`); }
  let apex = -1e9; for (let i=0;i<=1000;i++){ const x = hermite(from[0], v0[0]*D, pickup.p.x, pickup.v[0]*D, i/1000); apex=Math.max(apex,x);} 
  console.log(v0, 'apexX', apex.toFixed(1), xs.join(' '));
}
