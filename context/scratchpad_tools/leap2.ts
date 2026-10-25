import {pickup, PICKUP_T} from '/home/user/Test-/video/src/scenes/scene01/handoff';
import {toScreen} from '/home/user/Test-/video/src/scenes/scene01/camera';
import {PLAZA} from '/home/user/Test-/video/src/scenes/shared/sets';
const exitAt = 4.35;
const from = toScreen(exitAt, [PLAZA.pip[0], PLAZA.pip[1] + 12], 'near');
const H = (a: number, ma: number, b: number, mb: number, s: number) => { const s2 = s*s, s3 = s2*s; return (2*s3-3*s2+1)*a + (s3-2*s2+s)*ma + (-2*s3+3*s2)*b + (s3-s2)*mb; };
const D = PICKUP_T - exitAt;
const v0x = 0;
for (const tT of [4.62, 4.64, 4.65, 4.66, 4.67]) for (const xT of [985, 990, 995, 1000]) {
  const X = (t: number) => t <= tT ? H(from[0], v0x*(tT-exitAt), xT, 0, (t-exitAt)/(tT-exitAt)) : H(xT, 0, pickup.p.x, pickup.v[0]*(PICKUP_T-tT), (t-tT)/(PICKUP_T-tT));
  let apex = -1e9, ta = 0; for (let i=0;i<=2000;i++){ const t = exitAt + D*i/2000; const x = X(t); if (x>apex){apex=x;ta=t;} }
  const fr: string[] = []; for (let f=131; f<=141; f++){ const t=f/30; if(t<exitAt) continue; fr.push(X(t).toFixed(0)); }
  // max accel (px/frame^2) estimate
  let maxA = 0; for (let f=131; f<=141; f++){ const t=f/30; const a = X(t+1/30)-2*X(t)+X(t-1/30); maxA = Math.max(maxA, Math.abs(a)); }
  console.log(`tT ${tT} xT ${xT} apex ${apex.toFixed(1)}@${(ta*30).toFixed(1)}f  frames ${fr.join(' ')}  maxAcc ${maxA.toFixed(1)}`);
}
console.log('from', from, 'pickup', pickup.p.x.toFixed(1), pickup.p.y.toFixed(1));
