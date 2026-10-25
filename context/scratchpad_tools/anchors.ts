import {blueprintAnchors} from '/home/user/Test-/video/src/scenes/shared/sets/BlueprintStreet';
import {SIDE_HOUSES} from '/home/user/Test-/video/src/scenes/scene03/plan';
const a = blueprintAnchors();
const toS = (p: number[]) => [((p[0] - 545) * 1.04 + 540).toFixed(0), ((p[1] - 945) * 1.04 + 960).toFixed(0)];
for (const {id, h} of SIDE_HOUSES) {
  const A = a[id];
  console.log(id, 'tier', h.tier, 'hScr', h.h.toFixed(0), 'base', h.base.map((v) => v.toFixed(0)).join(','), 'top', h.top.map((v)=>v.toFixed(0)).join(','), 'overDoor', A.overDoor.map((v) => v.toFixed(0)).join(','), 'scr', toS(A.overDoor).join(','), 'plaque', A.plaque.x.toFixed(0), A.plaque.y.toFixed(0), A.plaque.size.toFixed(1), 'lock', A.lock.x.toFixed(0), A.lock.y.toFixed(0), A.lock.h.toFixed(1), 'door', h.door.map(p=>p.map(v=>v.toFixed(0)).join(',')).join(' '), 'browser', h.browser.map(p=>p.map(v=>v.toFixed(0)).join(',')).join(' '));
}
console.log('P', JSON.stringify(a.P));
