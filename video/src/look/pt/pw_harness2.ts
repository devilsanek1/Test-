// PT lane: harness 2 (twoPointCam / groundAt against v2 S1's bank construction; shown pre-compensation; grid).
import {twoPointCam, groundAt, groundPatchwork, patchTones, patchStats, patchworkProblems, viaQuad, patchwork} from '../../lib/patchwork';
import {lab} from '../../lib/light';
import {tierFill, setPen} from '../../lib/pen';
const cam = twoPointCam({horizon: 1000, vpL: -1100, vpR: 2600, height: 1.2});
const vp = cam.vp, vpX = cam.vpX;
console.log('vp', vp.map((v) => v.toFixed(1)), 'vpX', vpX?.map((v) => v.toFixed(1)), 'f', cam.f.toFixed(1), 'yaw', cam.yaw.toFixed(2));
// v2's edgeY: the line through GROUND_VP whose y at x 540 is y540
const edgeY = (y540: number, x: number) => 1000 + ((y540 - 1000) * (x + 1100)) / (540 + 1100);
for (const y540 of [1234, 1290, 1456, 1745]) {
  const a = groundAt(cam, 540, y540)!;
  const b = groundAt(cam, 1000, edgeY(y540, 1000))!;
  console.log(`edge ${y540}: world x ${a[0].toFixed(3)} / ${b[0].toFixed(3)} (equal = a line of constant x), z ${a[1].toFixed(2)} ${b[1].toFixed(2)}; back`, cam.pt(a[0], a[1]).map((v) => v.toFixed(2)));
}
// shown pre-compensation: the environment tier's pull 16 % toward a bg
setPen('clean', {bg: '#F6E3D4'});
const shown = (c: string) => tierFill(c, 'environment');
const t = patchTones('#B98F7E', {plane: -1, shown});
console.log('tones', t.join(' '), 'authored L', t.map((c) => lab(c)[0].toFixed(2)).join(' '), 'shown L', t.map((c) => lab(shown(c))[0].toFixed(2)).join(' '));
// a tread via its quad (v2's 2-VP), cell in metres; and the same via the camera
const X0 = -80, X1 = 1160;
const quad: [number, number][] = [[X0, edgeY(1456, X0)], [X1, edgeY(1456, X1)], [X1, edgeY(1580, X1)], [X0, edgeY(1580, X0)]];
const pq = patchwork({seed: 'tq', poly: [[0, 0], [30, 0], [30, 0.6], [0, 0.6]], project: viaQuad(quad as any, 30, 0.6), cell: [0.9, 0.6], tones: t, shown, plane: -1});
console.log('tread via quad', JSON.stringify(patchStats(pq)), patchworkProblems(pq, 'tread'));
const g = groundPatchwork(cam, {seed: 'grid', poly: [[2.0, -6], [6.5, -6], [6.5, 9], [2.0, 9]], cell: 0.9, grid: 0.3, tones: t, shown});
console.log('bank via cam, grid 0.3', JSON.stringify(patchStats(g)), patchworkProblems(g, 'bank'));
