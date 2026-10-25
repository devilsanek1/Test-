import {tabletCentre, personGeo} from '../../../../../home/user/Test-/video/src/scenes/scene05/shims';
const K = 1.12;
for (const m of [{x: 274, h: 140*K, seed: 's5a2', arm: 'right'}, {x: 548, h: 128*K, seed: 's5b1', arm: 'left'}] as const) {
  const c = tabletCentre({x: m.x, y: 1470, h: m.h, seed: m.seed, arm: m.arm, tabletSize: 60, tabletLift: 'high', landscape: true});
  console.log(m.seed, c.map((v) => v.toFixed(1)).join(','), 'screen', ((c[0]-540)*1.13+540).toFixed(0), ((c[1]-940)*1.13+960).toFixed(0), 'geo', JSON.stringify(personGeo(m.seed)));
}
