import {ROOFS} from '../../../../../home/user/Test-/video/src/scenes/scene08/roofs';
for (const ri of [0,1,2,3]) {
  console.log('row', ri, ROOFS[ri].filter(b => b.x + b.w > -60 && b.x < 1140).map(b => `${b.x.toFixed(0)}+${b.w.toFixed(0)}@${b.top.toFixed(0)}`).join(' '));
}
