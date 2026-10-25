import {camAt, project} from '/home/user/Test-/video/src/lib/cine/camera';
import {CAMERA, craneZoom} from '/home/user/Test-/video/src/scenes/Scene08';
const ts = process.argv.slice(2).map(Number);
for (const t of ts) {
  const c = camAt(CAMERA, t);
  const cz = {...c, zoom: c.zoom * craneZoom(t)};
  const b0 = project(cz, 0, [440, 1046]);
  const b1 = project(cz, 0, [880, 1436]);
  const cop0 = project(cz, 0, [0, 1450]);
  const cop1 = project(cz, 0, [1080, 1441]);
  console.log(JSON.stringify({t, board: [b0[0], b0[1], b1[0], b1[1]], coping: [cop0[1], cop1[1]]}));
}
