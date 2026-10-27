// P8_pal.tsx (lane L5-scale): the extra roles P8 needs beyond StylePentagon's DUSK (kit palette `DUSK`, verbatim), all in
// the same "6 Dusk" family: saturated blue-violet with peach accents, never grey mist (LOOK.md; owner: "warm, never
// sickly"). Haze steps run far -> near, each farther plane one value step lighter and closer to the sky (CINEMATIC rule 4).
// Hero cobalt and the pop orange are NOT here: they belong to her (P8 has neither).
import {DUSK} from '../palette';

export const P8X = {
  // ---- the big sky
  cloud: '#C2BCEE', // the huge clouds: one step lighter and pinker than the sky #A9B5EC
  cloudLit: '#F3C7B8', // their undersides, lit by the low sun
  cloudFar: '#B7B3EA', // a farther cloud layer behind them
  cloudFarLit: '#E9C0C2',
  cloudBar: '#EDB7A6', // thin bars across the sun (one step darker than the glow)
  // ---- the world beyond the building (haze steps, far -> near)
  haze1: '#CEC1EA', // the farthest skyline, nearly the dusk band
  haze2: DUSK.far, // #B4AEDF the far towers
  towerLit: '#F1D2B4', // far windows (tiny, twinkling)
  bank: '#AAA4DC', // the far river bank
  river: '#D2CEF1', // the river, catching the sky
  glint: '#F7D2BB', // the sun's glints on the water
  bridge: '#918BC9',
  sub: '#A39DD9', // far suburbs
  subRoof: '#9690D1',
  subRoofLit: '#BEB0E1',
  farRoad: '#C0BCE8',
  farCar: '#56509A',
  farLight: '#F6D7B0',
  woodsDark: '#8A84C9', // near woods behind the building, shade step
  houseRoof: '#B9A3D2', // rose-lilac roofs among the near woods
  // ---- the building's roof dressing
  unitTop: '#D3D2F1',
  unitSide: '#9E9CD8',
  // ---- the ground in front of it
  curb: '#B9B6E6',
  bay: '#B6B3E4', // parking bay ticks
  tree: DUSK.courtTree, // #5D7BA6
  treeLit: '#7896C0',
  trunk: '#4A4483',
  rail: '#9692CF', // the median's guardrail
  median: '#837FC0',
  lampOff: DUSK.post,
  lampOn: DUSK.lit, // #F7C98B
  pool: '#D3C6E8', // a street lamp's light on the road
  beam: '#F8DFBE', // headlight beams
  tail: '#E0979B',
  bush: DUSK.bush,
  bushLit: '#7468AE',
  // ---- the drop: treetops on the slope below the wall, seen from above
  canopy: '#544B8F',
  canopyLit: '#6E63A7',
  canopyDark: '#463E7E',
  // ---- the wall
  stone2: '#57497F',
  stone3: '#66589A',
  moss: '#7570A8',
  ivy: '#45528A',
  ivyLit: '#5D6BA4',
  weep: DUSK.joint,
  // ---- birds
  bird: '#2A2650', // sky flock (against the glow)
  birdNear: '#241F3E', // the pigeons on the wall
  birdBelly: '#7E6BA6',
};
