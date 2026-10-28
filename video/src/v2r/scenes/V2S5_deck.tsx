// V2S5_deck.tsx (lane L4, TERRACE): the S5 DECK (the viewpoint terrace in END coords, drawn in the rig's deck plane:
// pinned on the stranger, 2.42x at the start) and the end frame's near frames:
//   S5Deck        the terrace under the figures, in LIGHT.md's layer order: the floor (one calm lit paving, a few petal
//                 drifts: V2S5_deck_floor) and the balustrade (the ONE level line), then the deck's ONE ShadowLayer (the
//                 rig's tint family multiplied: the large soft shade shapes, the shade under the seats, contact strips
//                 under everything that touches the deck, casts along the rig's sun for people and things; the casts
//                 swing with the sun's screen spot through the arc, V2S5_light), then the stranger's bench UNDER part
//                 (Pip's perch), the props and the people sorted by depth (V2S5_deck_props / _life).
//   S5DeckOver    over the figures: the stranger's bench OVER part (the top rail's left half across the stranger's
//                 back, the iron ends, the seat's back edge). An OPEN back: the stranger's whole seated back shows.
//   S5TreeLeft    the blossoming terrace tree, the LEFT frame (box TREE_BOX: it slides in from the left)
//   S5RightFrame  the terrace lamppost (a nodding basket) + the corner crown, the RIGHT frame (box RIGHT_BOX)
//   S5WipeProp    the lamppost with two hanging baskets that wipes the backs at the peak (base at (0, 0); the rig moves it)
//   S5NearEnd     screen-space petals near the lens (never in y 290-600, never over a subject)
// Tier C: V2S5_set wraps all of it in the environment tier (no outlines; lines that ARE the thing as hairlines).
// The deck camera follows the far plane's horizon (V2S5_deck_cam: FAR_END.horizon), its VP sits above the pair.
// Import rule: never import V2S5_rig / V2S5_set / V2S5_figs (the rig imports this file).
import React, {useMemo} from 'react';
import {useTime} from '../../lib/time';
import {CastShadow, ContactShadow, Shadow, ShadowLayer} from '../../lib/light';
import {Paint, ellD} from '../kit/dc/core';
import {CRANE_T, WIPE, type PullBox} from '../kit/dc/crane';
import {CM} from '../palette';
import {DeckFloor, DECK_SHADE, NEAR_AMBIENT} from './V2S5_deck_floor';
import {balustrade, strangerBench, strangerBenchLight, parkBench, bin, fountain, tulipBed, crabPlanter, bikeAtRail, lectern, type Prop, type PropLight} from './V2S5_deck_props';
import {lifeItems, type FigLight} from './V2S5_deck_life';
import {TerraceTree5, RightFrame5, LampPost5, NearPetals5, TREE5_BOX, RIGHT5_BOX} from './V2S5_deck_frames';

/** The left frame's box: its crown's top-left travels in from the left (end top held at y 642). */
export const TREE_BOX: PullBox = TREE5_BOX;
/** The right frame's box: the lamppost's base travels in from beyond the bottom-right. */
export const RIGHT_BOX: PullBox = RIGHT5_BOX;

/** The terrace's static props (END coords), each with its foot y for the depth sort and its light. */
function props(): Prop[] {
  return [
    bikeAtRail(14.6),
    parkBench(6.0, 8.0, 16.5),
    parkBench(-1.5, 1.5, 10.8, (B, a, b, k) => {
      // a takeaway cup and a folded scarf on the near bench's right end
      const x = b[0] - 0.42 * k;
      const y = b[1] - 0.47 * k;
      B.rect(CM.paper, x, y - 0.13 * k, 0.07 * k, 0.13 * k);
      B.rect(CM.brick, x, y - 0.09 * k, 0.07 * k, 0.04 * k);
      B.fill(CM.coatPlum, ellD(x - 0.3 * k, y - 0.03 * k, 0.16 * k, 0.045 * k));
      void a;
    }),
    bin(-2.25, 11.1),
    fountain(3.0, 11.6),
    crabPlanter(13.1, 17.0, 'R'),
    lectern(4.35, 12.75),
    tulipBed(-1.0, 1.6, 8.2, 9.7, 'nearL'),
    tulipBed(2.3, 4.0, 8.2, 9.5, 'nearR'),
  ];
}

/** The shade under the canopy's shapes is softer than a cast's tip: a 12 px half-tint band (2.42x at the start). */
const SHADE_SOFT = 12;

/** A prop's light shapes (inside the deck's ShadowLayer). */
const PropShadows: React.FC<{light: PropLight}> = ({light}) => (
  <>
    {(light.shade ?? []).map((s, i) => (
      <Shadow key={`s${i}`} d={s.d} tint={s.tint ?? 'cast'} soft={s.soft ?? 3} />
    ))}
    {(light.cast ?? []).map((c, i) => (
      <CastShadow key={`c${i}`} x={c.x} y={c.y} w={c.w} depth={c.depth} pts={c.pts} h={c.h} />
    ))}
    {(light.contact ?? []).map((c, i) => (
      <ContactShadow key={`k${i}`} x={c.x} y={c.y} w={c.w} h={c.h} k={c.k} d={c.d} />
    ))}
  </>
);

/** A figure's light: a cast of its height along the sun (none for h 0), its contact strip. */
const FigShadows: React.FC<{l: FigLight}> = ({l}) => (
  <>
    {l.h > 0 ? <CastShadow x={l.x} y={l.y} w={l.w * 0.85} depth={l.depth} h={l.h} /> : null}
    <ContactShadow x={l.x} y={l.y} w={l.w} k={l.k ?? 1.1} />
  </>
);

export const S5Deck: React.FC = () => {
  const t = useTime();
  const rail = useMemo(() => balustrade(), []);
  const benchU = useMemo(() => strangerBench('under'), []);
  const benchL = useMemo(() => strangerBenchLight(), []);
  const ps = useMemo(() => props(), []);
  const life = lifeItems(t);
  const items = [...ps.map((p) => ({y: p.y, key: p.key, el: <Paint b={p.b} seed={`s5deck/${p.key}`} misreg={false} />})), ...life].sort((a, b) => a.y - b.y);
  return (
    <>
      <DeckFloor />
      <Paint b={rail} seed="s5deck/rail" misreg={false} />
      {/* the near paving one value step down (REVIEW_1 SHOULD 3): its own multiply layer, under the deck's shade */}
      <ShadowLayer>
        <Shadow d={NEAR_AMBIENT} tint="ambient" soft={SHADE_SOFT} />
      </ShadowLayer>
      <ShadowLayer>
        {DECK_SHADE.map((d, i) => (
          <Shadow key={`deck${i}`} d={d} tint="cast" soft={SHADE_SOFT} />
        ))}
        <PropShadows light={benchL} />
        {ps.map((p) => (p.light ? <PropShadows key={p.key} light={p.light} /> : null))}
        {life.map((i) => (i.light ?? []).map((l, j) => <FigShadows key={`${i.key}${j}`} l={l} />))}
      </ShadowLayer>
      <Paint b={benchU} seed="s5deck/benchU" misreg={false} />
      {items.map((i) => (
        <React.Fragment key={i.key}>{i.el}</React.Fragment>
      ))}
    </>
  );
};

export const S5DeckOver: React.FC = () => {
  const b = useMemo(() => strangerBench('over'), []);
  return <Paint b={b} seed="s5deck/benchO" misreg={false} />;
};
export const S5TreeLeft: React.FC = () => <TerraceTree5 burstAt={CRANE_T.april} />;
export const S5RightFrame: React.FC = () => <RightFrame5 />;
export const S5WipeProp: React.FC = () => <LampPost5 h={WIPE.h} baskets={2} seed="wipe" nod={false} shadows />;
export const S5NearEnd: React.FC<{p: number}> = () => <NearPetals5 n={14} />;
