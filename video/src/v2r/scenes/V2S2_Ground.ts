// V2S2_Ground (lane L2): S2's ONE camera (CRAFT §f.4-5; THROUGHLINE §5b: "S2 the wall's VP (1400, 700)"). Screen px at
// the 6.70 pose. The canal runs east-west and the lens looks along it toward the vanishing point VP (1400, 700), just
// off the right edge: the wing's lines (kit/canal/wall), the far towpath AND our own bank all run to it, so the water
// narrows toward the VP (the kit's near-level bank under a steeply receding wall made the canal widen away from us: two
// cameras). The ground camera is sized from the bench's people (seated, feet on S2_BENCH.y1 1290 at ~154 px/m):
// groundCam({horizon 700, vpx 1400, f 1400, height 3.83}).
//   our water edge  the line through the VP and (0, 1290): the kiosk (ground 1292 at x <= 104), the board's feet (1298 at
//                   x 134-586) and the bench's (1290 at x 600-800) all stand on our side of it; Pip's seat (590, 1050)
//                   is a short mooring bollard on our coping, just in front of it.
//   our towpath     York-stone courses: long joints along the canal = a fan of lines from the VP; cross joints level,
//                   foreshortening with distance (z every 0.9 m).
import {groundCam} from '../../lib/depth';

export type Pt = [number, number];

/** The vanishing point every ground, wall and figure shares. */
export const GROUND_VP: Pt = [1400, 700];
/** S2's ground camera: the horizon at the VP's height, eye 3.83 m over our towpath (the bench's people at ~154 px/m). */
export const S2_CAM = groundCam({horizon: 700, vpx: 1400, f: 1400, height: 3.83});

/** A line through the VP and (0, y0): its y at x. */
export const vpLine = (y0: number) => (x: number): number => GROUND_VP[1] + ((y0 - GROUND_VP[1]) * (GROUND_VP[0] - x)) / GROUND_VP[0];

/** Our water edge (the coping's water side). */
export const OUR_EDGE = vpLine(1290);
/** The coping's near side (its stone strip ~0.35 m deep). */
export const OUR_COPING = vpLine(1342);
/** The railing's top (1.0 m over the coping: the same fan, one metre up in the ground camera at each x). */
export const railTopAt = (x: number): number => OUR_EDGE(x) - pxPerMAt(OUR_EDGE(x));

/** px per metre at a ground row y (the ground camera). */
export const pxPerMAt = (y: number): number => Math.max(0, (y - GROUND_VP[1]) / 3.83);

/** The long joints of our towpath (along the canal): lines from the VP through these points on the frame bottom (0.6 m
 *  apart at y 1920), nearest the camera first; only the ones on our side of the coping. */
export const LONG_JOINTS: number[] = (() => {
  const out: number[] = [];
  const step = 0.6 * pxPerMAt(1920);
  for (let xb = GROUND_VP[0] - step; xb > -1600; xb -= step) out.push(xb);
  return out;
})();
/** The line from the VP through (xb, 1920): its x at row y. */
export const fanX = (xb: number, y: number): number => GROUND_VP[0] + ((xb - GROUND_VP[0]) * (y - GROUND_VP[1])) / (1920 - GROUND_VP[1]);

/** The cross joints (level rows): z every 0.9 m, from the frame bottom up to the coping. */
export const CROSS_ROWS: number[] = (() => {
  const out: number[] = [];
  const fH = 1400 * 3.83;
  for (let z = fH / (1920 - GROUND_VP[1]); z < 40; z += 0.9) {
    const y = GROUND_VP[1] + fH / z;
    if (y < 1060) break;
    out.push(y);
  }
  return out;
})();
