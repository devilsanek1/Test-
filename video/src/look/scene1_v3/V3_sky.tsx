// Scene 1, still v3: THE SKY, in SCREEN px (the sky never floats and never shifts with the world). v2's one gentle
// dithered evening gradient (lib/sky eveningSky: the mint flat through the caption band, the pale warm light band, the
// peach horizon), re-fit to the world's new horizon (V3_SHIFT lower), with things happening in it (the owner on still
// v1: "the sky is not entirely single color there are more things happening"; the orchestrator, 2026-10-29: "a big,
// warm, glowing evening cloud bank can tower above and below the caption band; the band itself must stay calm"):
//   the cloud bank   lib/clouds cumulus in warm evening tones, lit from the low western sun (S1_KEY): a long low bank
//                    behind the wing's roof (its tops under the band), a tower rising out of it at the right edge (it
//                    passes the band only at x > 860, right of the caption's last letter at ~800) and its billowing top
//                    above the band; nothing of it crosses the caption's text box
//   strata           two long soft flat streaks round the low sun (left), lit peach on top, rose under
//   small cloud      a calm small cumulus above the band (v2's hero cloud, moved left of the tower)
//   birds            a small loose flock low over the west gap, three more higher up
// Every piece floods with the sky (inside the same growing disc from the sun), so frame 0 stays paper.
import React, {useId} from 'react';
import {Sky, eveningSky, skyColorAt, type SkySpec} from '../../lib/sky';
import {Cumulus, type CumulusSpec, type CloudTones} from '../../lib/clouds';
import {Fill} from '../../lib/Fill';
import {Tier} from '../../lib/tier';
import {useTime} from '../../lib/time';
import {CM} from '../../v2r/palette';
import {S1_HORIZON} from '../../v2r/world/skies';
import * as MAP from '../../v2r/world/map';
import {CM10B} from './palette_10b';
import {S1_KEY} from './V2S1_nature';
import {useSwitches} from './switches';
import {V3_SHIFT} from './V3_layout';

/** The sun in SCREEN px (v2's SUN0, shifted with the world). */
export const V3_SUN = {x: MAP.SUN0.x, y: MAP.SUN0.y + V3_SHIFT} as const;
/** v2's S1 evening sky (world/skies S1_EVENING, the look test's 10b band), its horizon and sun moved down with the world;
 *  the sun's warmth a little wider (the glow the cloud bank catches). */
export const v3Sky = (palette10b: boolean): SkySpec =>
  eveningSky({band: palette10b ? CM10B.sky : CM.sky, horizon: S1_HORIZON, horizonY: 800 + V3_SHIFT, sun: {x: V3_SUN.x, y: V3_SUN.y, rx: 420}});

const FLOOD_T0 = MAP.S1_CLOCK.flood.t0;
/** The sky's flood (V2S1_sky's): a disc growing from the sun, px/s. */
const SKY_SPEED = 26000;

// ---------------------------------------------------------------- the cloud bank (warm evening tones)

/** The bank's three flat tones: a warm glowing lit face (apricot cream), a peach body, a rose belly (never beige:
 *  each keeps its chroma; the belly parts from the mint by hue). */
const BANK_TONES: CloudTones = {lit: '#FFE3BC', body: '#F8C9B1', belly: '#E9B0B6'};
/** The tower's top, higher in the cooler sky: a touch pinker. */
const TOP_TONES: CloudTones = {lit: '#FFE6CF', body: '#F5C6BC', belly: '#DEADBB'};
/** A tower body's tones where its flat base sits in open sky: no belly band (the base is the body's own edge). */
const flatBase = (c: CloudTones): CloudTones => ({...c, belly: c.body});
/** The crown: its lit caps a small step over its body (a big facet reads as one hard line otherwise), no belly. */
const CROWN_TONES: CloudTones = {lit: '#F9D6CB', body: '#F5C6BC', belly: '#F5C6BC'};

const cloudSpecs = (sky: SkySpec): CumulusSpec[] => {
  const at = (x: number, y: number) => skyColorAt(sky, y, x);
  const base = {light: S1_KEY, sky: at, soft: {steps: 0}, drift: 0} as const;
  // back to front: the crown, the waist (its top lobes over the crown's base), the foot and the bank (over the
  // waist's base), the small cloud; so no tower body shows a straight base in open sky
  return [
    // the tower's crown above the band, spreading left like an anvil (its far-left base scalloped: CROWN_UNDER); a
    // gentle facet step only (a big crown's facet cut ran as one long straight line)
    {...base, seed: 'v3-towerCrown', x: 650, base: 262, w: 560, h: 270, towers: 3, lobes: [0.08, 0.14], tones: CROWN_TONES},
    // its waist, through the band only at x > ~880 (the caption ends at ~800): its base hidden inside the foot
    {...base, seed: 'v3-towerWaist', x: 930, base: 780, w: 280, h: 560, towers: 2, lobes: [0.14, 0.22], tones: flatBase(TOP_TONES)},
    // its foot behind the wing's roof
    {...base, seed: 'v3-towerFoot', x: 780, base: 905, w: 420, h: 400, towers: 3, lobes: [0.09, 0.16], tones: BANK_TONES},
    // the long low bank behind the wing's roof: its flat base hidden by the roofline and the far roofs, its tops under
    // the band; its left end catches the low sun (the glow)
    {...base, seed: 'v3-bank', x: 300, base: 1010, w: 980, h: 330, towers: 4, lobes: [0.035, 0.07], tones: BANK_TONES},
    // a small calm cumulus above the band, between the spray and the tower (v2's hero cloud, moved left)
    {...base, seed: 'v3-small', x: 330, base: 258, w: 360, h: 112, towers: 3, lobes: [0.05, 0.09], tones: TOP_TONES},
  ];
};;;

/** [x, y, r]: lobes along the crown's base (y 284), their bottoms <= 290. */
const CROWN_UNDER: [number, number, number][] = [
  [676, 262, 26],
  [722, 254, 34],
  [782, 258, 32],
  [842, 252, 38],
  [902, 256, 34],
];
const circ = (x: number, y: number, r: number) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;

// ---------------------------------------------------------------- strata and birds

type Pt = [number, number];
const r1 = (n: number) => Math.round(n * 10) / 10;
/** A long thin streak: a lens with rounded ends, its belly flatter than its top (a calm stratus). */
const streak = (x0: number, x1: number, y: number, h: number): string => {
  const xm = (x0 + x1) / 2;
  return `M${r1(x0)} ${r1(y)}Q${r1(x0 + (x1 - x0) * 0.18)} ${r1(y - h)} ${r1(xm)} ${r1(y - h * 1.05)}Q${r1(x1 - (x1 - x0) * 0.16)} ${r1(y - h)} ${r1(x1)} ${r1(y)}Q${r1(xm)} ${r1(y + h * 0.42)} ${r1(x0)} ${r1(y)}Z`;
};
const belly = (x0: number, x1: number, y: number, h: number): string => {
  const xm = (x0 + x1) / 2;
  return `M${r1(x0 + 10)} ${r1(y + 1)}Q${r1(xm)} ${r1(y - h * 0.18)} ${r1(x1 - 8)} ${r1(y + 1)}Q${r1(xm)} ${r1(y + h * 0.42)} ${r1(x0 + 10)} ${r1(y + 1)}Z`;
};
/** [x0, x1, y, h]: low round the sun under the band, and two high wisps above it (all clear of the band 290-600). */
const STRATA: [number, number, number, number][] = [
  [-80, 300, 742, 17],
  [10, 400, 806, 13],
];
const STRATA_LIT = '#FFE0C9';
const STRATA_BELLY = '#F3C3BB';

/** A small bird, wings up or level (`flap` 0..1): one closed shape, no line. */
const bird = (x: number, y: number, s: number, flap: number): string => {
  const up = s * (0.15 + 0.45 * flap);
  return `M${r1(x - s)} ${r1(y - up * 0.6)}Q${r1(x - s * 0.45)} ${r1(y - up)} ${r1(x)} ${r1(y)}Q${r1(x + s * 0.45)} ${r1(y - up)} ${r1(x + s)} ${r1(y - up * 0.6)}Q${r1(x + s * 0.5)} ${r1(y - up * 0.45)} ${r1(x)} ${r1(y + s * 0.2)}Q${r1(x - s * 0.5)} ${r1(y - up * 0.45)} ${r1(x - s)} ${r1(y - up * 0.6)}Z`;
};
/** [x, y, half-span, flap]: a loose flock of seven low over the west gap (heading west, away from the wing), three high. */
const BIRDS: [number, number, number, number][] = [
  [188, 872, 9, 0.8],
  [214, 856, 8, 0.2],
  [240, 881, 8, 0.6],
  [162, 846, 7, 0.4],
  [268, 864, 7, 0.9],
  [134, 866, 6, 0.3],
  [300, 846, 6, 0.7],
  [742, 170, 6, 0.5],
  [766, 154, 5, 0.9],
  [788, 176, 5, 0.2],
];

export const V3Sky: React.FC = () => {
  const t = useTime();
  const {palette10b} = useSwitches();
  const id = 'v3sk' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const r = (t - FLOOD_T0) * SKY_SPEED;
  if (r <= 0) return null;
  const sky = v3Sky(!!palette10b);
  const birdC = CM.shadeWarm;
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <circle cx={V3_SUN.x} cy={V3_SUN.y} r={Math.min(r, 2600)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <Sky spec={sky} />
        <Tier tier="environment">
          {STRATA.map(([x0, x1, y, h], i) => (
            <React.Fragment key={i}>
              <Fill d={streak(x0, x1, y, h)} color={STRATA_LIT} seed={`v3sky/str${i}`} offset={false} />
              <Fill d={belly(x0, x1, y, h)} color={STRATA_BELLY} seed={`v3sky/strB${i}`} offset={false} />
            </React.Fragment>
          ))}
          {cloudSpecs(sky).map((s) => (
            <Cumulus key={s.seed} spec={s} t={0} />
          ))}
          {/* the crown's underside: soft lobes under its flat base (left of the waist), so no straight edge runs along
              the band's top; they stay above y 290 */}
          <Fill d={CROWN_UNDER.map(([x, y, r]) => circ(x, y, r)).join('')} color={TOP_TONES.body} seed="v3sky/crownUnder" offset={false} />
          <Fill d={BIRDS.map(([x, y, s, f]) => bird(x, y, s, f)).join('')} color={birdC} seed="v3sky/birds" offset={false} />
        </Tier>
      </g>
    </>
  );
};
