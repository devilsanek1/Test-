import {pickup, PICKUP_T} from '/home/user/Test-/video/src/scenes/scene01/handoff';
import {toScreen} from '/home/user/Test-/video/src/scenes/scene01/camera';
import {PLAZA} from '/home/user/Test-/video/src/scenes/shared/sets';
const exitAt = 4.35;
const from = toScreen(exitAt, [PLAZA.pip[0], PLAZA.pip[1] + 12], 'near');
const H = (a: number, ma: number, b: number, mb: number, s: number) => { const s2 = s*s, s3 = s2*s; return (2*s3-3*s2+1)*a + (s3-2*s2+s)*ma + (-2*s3+3*s2)*b + (s3-s2)*mb; };
const D = PICKUP_T - exitAt;
let best: any[] = [];
for (const v0x of [0, 150, 300]) for (let tT = 4.55; tT <= 4.70; tT += 0.01) for (let xT = 940; xT <= 1010; xT += 2.5) for (let vT = 0; vT <= 900; vT += 25) {
  const X = (t: number) => t <= tT ? H(from[0], v0x*(tT-exitAt), xT, vT*(tT-exitAt), (t-exitAt)/(tT-exitAt)) : H(xT, vT*(PICKUP_T-tT), pickup.p.x, pickup.v[0]*(PICKUP_T-tT), (t-tT)/(PICKUP_T-tT));
  // velocity checks
  let ok = true; let prevV = 1e9; let apex = -1e9; let ta = 0;
  const N = 600; const dt = D / N;
  for (let i = 1; i < N; i++) { const t = exitAt + i*dt; const v = (X(t+1e-4)-X(t-1e-4))/2e-4; if (t > tT && v > prevV + 1) { ok = false; break; } if (t > tT) prevV = v; if (t <= tT && v < -1) { ok = false; break; } const x = X(t); if (x > apex) { apex = x; ta = t; } }
  if (!ok) continue;
  let maxA = 0; for (let f=131; f<=141; f++){ const t=f/30; const a = X(t+1/30)-2*X(t)+X(t-1/30); maxA = Math.max(maxA, Math.abs(a)); }
  if (maxA > 30) continue; if (ta*30 > Number(process.env.TA ?? 141.0)) continue;
  const fr: string[] = []; for (let f=131; f<=141; f++){ const t=f/30; if(t<exitAt) continue; fr.push(X(t).toFixed(0)); }
  best.push([apex, v0x, tT.toFixed(2), xT, vT, (ta*30).toFixed(1), maxA.toFixed(1), fr.join(' ')]);
}
best.sort((a, b) => a[0] - b[0]);
for (const b of best.slice(0, 12)) console.log(b.map((x: any) => typeof x === 'number' ? x.toFixed(1) : x).join(' | '));
