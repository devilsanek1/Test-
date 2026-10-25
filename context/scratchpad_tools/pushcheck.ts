import {worldPushMat} from '../../../../../home/user/Test-/video/src/lib/World';
const dur = 1.4;
const lnB = Math.log(1 + 0.12);
const scene = {id: 'x', start: 0, end: 5, dur: 5, transitionIn: {type: 'camera-continuous', dur, dir: 'out'}};
const rows: string[] = [];
let prev = NaN, reversals = 0, dirPrev = 0;
for (let f = 0; f <= 120; f++) {
  const t = f / 30;
  const v = Math.min(1, t / dur);
  const cam = lnB * Math.pow(1 - v, 3);
  const push = Math.log(worldPushMat(true, t, scene as any)[0]);
  const z = cam + push;
  if (!isNaN(prev)) {
    const d = Math.sign(Math.round((z - prev) * 1e6));
    if (d !== 0 && dirPrev !== 0 && d !== dirPrev) reversals++;
    if (d !== 0) dirPrev = d;
  }
  prev = z;
  if (f % 12 === 0) rows.push(`${t.toFixed(2)}s logzoom ${z.toFixed(4)}`);
}
const noScene = Math.log(worldPushMat(true, 0.8, undefined)[0]);
console.log(rows.join('\n'));
console.log('direction changes:', reversals, '| without scene info the push at 0.8 s =', noScene.toFixed(4));
