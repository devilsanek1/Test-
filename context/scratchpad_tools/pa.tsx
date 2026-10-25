import {pageAt} from '/home/user/Test-/video/src/scenes/scene06/page';
for (const f of [652,653,654,655,656,657,658,659,660,661,662,663,664,665]) {
  const T = f / 30;
  const p = pageAt(T);
  console.log(f, T.toFixed(3), p ? `x=${p.x.toFixed(0)} y=${p.y.toFixed(0)} s=${p.s.toFixed(2)} rot=${p.rot.toFixed(1)}` : null);
}
