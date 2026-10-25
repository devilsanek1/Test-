import {SIDE_HOUSES} from '/home/user/Test-/video/src/scenes/scene03/plan';
const cam = {x: 545, y: 945, zoom: 1.04};
const S = (p: number[]) => [((p[0] - cam.x) * cam.zoom + 540).toFixed(0), ((p[1] - cam.y) * cam.zoom + 960).toFixed(0)];
for (const {id, h} of SIDE_HOUSES) {
  const n = (h.g.screen.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const pts = [[n[0], n[1]], [n[2], n[3]], [n[4], n[5]], [n[6], n[7]]];
  console.log(id, 'screen', pts.map(S).map(p => p.join(',')).join(' '), 'door', JSON.stringify(h.door.map(S)), 'base', S(h.base as any), 'h', h.h.toFixed(0));
}
