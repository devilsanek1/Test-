// P8 (lane L5-scale): THE SCALE BEAT, 21.32-23.80 ("that meant a deal letting the Pentagon use its AI").
// ONE idea: the deal is with something huge. The S1 rise-over (docs/look/CINEMATIC_GUIDE.md; storyboard_g3.md P8;
// animatic.json P8): the cut lands on a wide where a low stone wall (coping + courses) hides about half of a Pentagon
// already cut by both side edges; the camera RISES (the board's 120 px + zoom 1.00 -> 1.04, its "unveil" ease,
// 21.32-23.40, landing on "AI", then a 0.4 s hold) while the wall drops away on its own (fastest plane, cut in moving,
// decelerating over the whole panel) with real multiplane parallax: the wall, the treetops on the slope below us, the
// verge and the service road, the highway, the lawn, the parked cars, the building, the near woods, the far highway,
// the suburbs, the river, the far towers, the farthest skyline, the sun's bands, the huge clouds. As it rises the
// world beyond the roof's back edges opens up (river, suburbs, highway, skyline) and the whole five-ring building lands
// wider than the frame with two rows of identical parked cars at its foot as the ruler.
// Look: the sister palette "6 Dusk" (LOOK.md; review/look/v2_g4/pentagon_dusk.png, StylePentagon's code and DUSK roles)
// plus P8_pal's extra steps of the same family; flat fills, ink on the building and the wall only, no gradients.
// Life (always on, draft motion): the huge clouds drift, bars cross the sun, a flock passes it, far windows twinkle,
// glints on the river, tiny cars on the bridge and the far highway, office windows switch on, highway traffic with
// headlight beams (cars keep entering through the hold), street lamps come on one by one, trees and ivy sway, two
// pigeons take off from the wall as we rise, a low flock crosses BELOW us and birds burst up out of the treetops below
// (the drop), a near bird glides in over the skyline. Fairness: no figures, aircraft, weapons, flags, lettering or "Google";
// her cat and her cobalt never appear here.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {clamp, useTime} from '../../../lib/time';
import {cruiseEase} from '../../../lib/spec';
import {mat, Mat, XG} from '../../../lib/xf';
import {applyM, DUSK, type Pt} from '../kit';
import {P8Clouds, P8CloudBars, P8FarCity, P8FarHighway, P8FarTowers, P8NearBird, P8NearWoods, P8River, P8SkyBands, P8SkyFlock, P8Suburbs} from './P8_world';
import {P8Highway, P8Lawn, P8Lot, P8LotGround, P8LowFlock, P8Pentagon, P8PigeonFlight, P8TreeBirds, P8Treetops, P8Verge, P8Wall, PIGEONS, WALL_Y_LAND} from './P8_site';

const START = 21.32;
/** The rise lands on "AI" (VO 23.40), then holds 0.4 s to the cut (23.80). */
export const P8_MOVE = 23.4 - START;
const PANEL = 23.8 - START;
/** The board's "unveil" ease (SketchReel trapezoid(0.1, 0.6): accelerate over 10 %, cruise, decelerate over 60 %). */
const UNVEIL = cruiseEase(0.1, 0.6);
/** The wall's own drop: cut in MOVING at its cruise speed, cruise to mid-panel, then a sine landing at the panel's end
 *  (outSine-like, but its peak stays under the 60 fps flat-ink limit: ~400 px/s for an 800 px drop). */
const CRUISE_OUT_C = 0.5;
const cruiseOut = (u: number) => {
  const x = clamp(u, 0, 1);
  const c = CRUISE_OUT_C;
  const tot = c + ((1 - c) * 2) / Math.PI;
  const s = x <= c ? x : c + ((1 - c) * 2 * Math.sin((Math.PI / 2) * ((x - c) / (1 - c)))) / Math.PI;
  return s / tot;
};
/** Start offsets (px, up) per plane at the cut; 0 at the landing. Parallax ~ 1 / distance: the building takes the
 *  board's camera rise (120 px), nearer planes more, farther ones less; the wall and the slope have their own drop. */
export const P8_TRAVEL = {
  clouds: 8,
  sky: 10,
  haze1: 14,
  towers: 20,
  river: 30,
  suburbs: 42,
  farRoad: 52,
  woods: 70,
  pentagon: 120,
  lot: 140,
  lawn: 150,
  highway: 165,
  verge: 185,
  slope: 470,
  wall: 800,
};

/** Camera state at scene time t (exported for the lane's speed check). */
export const p8Cam = (t: number) => {
  const p = UNVEIL(clamp(t / P8_MOVE));
  const pw = cruiseOut(t / PANEL);
  // push 1.00 -> 1.04 during the rise (the frame is designed at the landing, i.e. at 1.04)
  const z = (1 + 0.04 * p) / 1.04;
  const cam = mat.about(mat.scale(z), 540, 960);
  const layer = (travel: number, prog = p): Mat => mat.compose(cam, mat.translate(0, -travel * (1 - prog)));
  return {p, pw, cam, layer};
};

const P8: React.FC = () => {
  const t = useTime();
  const {pw, layer} = p8Cam(t);
  const T = P8_TRAVEL;
  // where each pigeon left the coping (screen px at its take-off)
  const pigeonStart = (i: number): Pt => {
    const c = p8Cam(PIGEONS[i].at);
    return applyM(c.layer(T.wall, c.pw), PIGEONS[i].x, WALL_Y_LAND);
  };
  return (
    <World sky={DUSK.sky}>
      <XG m={layer(T.sky)}>
        <P8SkyBands />
        <P8CloudBars />
      </XG>
      <XG m={layer(T.clouds)}>
        <P8Clouds />
      </XG>
      <XG m={layer(T.haze1)}>
        <P8FarCity />
      </XG>
      <XG m={layer(T.towers)}>
        <P8FarTowers />
        <P8SkyFlock />
      </XG>
      <XG m={layer(T.river)}>
        <P8River />
      </XG>
      <XG m={layer(T.suburbs)}>
        <P8Suburbs />
      </XG>
      <XG m={layer(T.farRoad)}>
        <P8FarHighway />
      </XG>
      <XG m={layer(T.woods)}>
        <P8NearWoods />
      </XG>
      <XG m={layer(T.lot)}>
        <P8LotGround />
      </XG>
      <XG m={layer(T.pentagon)}>
        <P8Pentagon />
      </XG>
      <XG m={layer(T.lot)}>
        <P8Lot />
      </XG>
      <XG m={layer(T.towers)}>
        <P8NearBird />
      </XG>
      <XG m={layer(T.lawn)}>
        <P8Lawn />
      </XG>
      <XG m={layer(T.highway)}>
        <P8Highway />
        <P8LowFlock />
      </XG>
      <XG m={layer(T.verge)}>
        <P8Verge />
      </XG>
      <XG m={layer(T.slope, pw)}>
        <P8Treetops />
        <P8TreeBirds />
      </XG>
      <XG m={layer(T.wall, pw)}>
        <P8Wall />
      </XG>
      {/* screen space: the pigeons start where they left the coping */}
      <P8PigeonFlight start={pigeonStart} />
    </World>
  );
};
export default P8;

/** Ink captions: the band is the flat light Dusk sky #A9B5EC (ink 8.6:1; white only ~2.0:1). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
