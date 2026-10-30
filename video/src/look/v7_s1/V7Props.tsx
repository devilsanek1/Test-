// v7_s1: what STAYS after the composition's prop cut (ORGANIC.md §6 step 4; composition.md §5's T1/T3 plan, R6: <= 6
// named objects at phone size; R12: Pip tone-on-tone inside a mass of the busy belt, >= 250 px from the focal, off the
// eye path). Run FIRST, so nothing is keyed, lit or painted and then removed.
//   the near frame   ONE cafe table and ONE chair at the right edge, the table cut by it, inside the canopy's shade
//                    (their shapes are v6's: V2S1_fore's table and Chair, copied here because paint_s1 keeps them
//                    module-private; contact shadows only: nothing inside a shade mass casts a sun shadow)
//   the boats        boat A alone (the long one behind; boat B, the boater and the cat are cut); its cabin a dusky rose
//                    inside the family (v6's sage cabin read green beside the dusk); its hull the darks' iron
//   Pip              off the bollard under the door (it sat on the door's light column: v6's eye path) and onto boat
//                    A's cabin roof, where the boater sat: 328 px right of the door's centre, small (70: the boat's
//                    distance), facing back toward her; tone-on-tone with the boat in the facade's shade (step 2)
// Cut in the scene's composers (never drawn): the leaf spray (top left), the cloud bar, the duck, the bench and its
// backpack, the bay tree and its grass, the planter and its ivy, the flower crates, the pier with its potted thyme, the
// fern pot, the fallen leaves (nine are redrawn below), Pip's bollard.
import React, {useMemo} from 'react';
import {Fill} from '../../lib/Fill';
import {Tier} from '../../lib/tier';
import {ContactShadow, ShadowLayer} from '../../lib/light';
import {Look} from '../../lib/exit';
import {CM} from '../../v2r/palette';
import {Batch} from '../../v2r/kit/canal/core';
import {boatInto, boatGeom, type BoatOpts} from '../../v2r/kit/canal/boat';
import {PipTrack} from '../../v2r/kit/pip';
import {POSES} from '../../v2r/kit/pip/poses';
import {CellPaint} from '../paint_s1/V2S1_set_core';
import {BOAT_A, BOAT_B} from '../paint_s1/V2S1_set_life';
import {edgeSlope} from '../paint_s1/V2S1_steps_stone';
import {C, S1_PIP, floodAt} from '../paint_s1/V2S1_clock';
import {dark, recolourBatch} from '../paint_s1/darks';
import {useSwitches} from '../paint_s1/switches';

// ---------------------------------------------------------------- boat B leaves the shared canal too

/** The shared canal (paint_s1 V2S1_water: lib/water's reflections, built lazily on the first frame) mirrors BOAT_A and
 *  BOAT_B by their exported options. v7 cuts boat B, so its options move off the frame here, at this module's load,
 *  before any frame renders: the vector canal (the painter's design frame) then mirrors boat A alone. A scene-level
 *  override in v7's own bundle only (the entry imports nothing else that draws BOAT_B); a film would give its water
 *  spec its own boats list. */
Object.assign(BOAT_B as BoatOpts, {x: 2600});

type Pt = [number, number];
const r1 = (n: number) => Math.round(n * 10) / 10;
const poly = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${r1(x)} ${r1(y)}`).join('') + 'Z';
const ell = (cx: number, cy: number, rx: number, ry: number) => `M${r1(cx - rx)} ${r1(cy)}A${r1(rx)} ${r1(ry)} 0 1 0 ${r1(cx + rx)} ${r1(cy)}A${r1(rx)} ${r1(ry)} 0 1 0 ${r1(cx - rx)} ${r1(cy)}Z`;
/** An ellipse lying on the ground: its long axis along the bank's edges there (V2S1_fore's groundEll). */
const groundEll = (cx: number, cy: number, rx: number, ry: number) => {
  const a = Math.atan(edgeSlope(cx, cy));
  const pts: Pt[] = [];
  for (let k = 0; k < 28; k++) {
    const u = (k / 28) * Math.PI * 2;
    const ex = Math.cos(u) * rx;
    const ey = Math.sin(u) * ry;
    pts.push([cx + ex * Math.cos(a) - ey * Math.sin(a), cy + ex * Math.sin(a) + ey * Math.cos(a)]);
  }
  return poly(pts);
};

// ---------------------------------------------------------------- the near frame: one table, one chair

/** The kept prop in screen px (plane -2, the camera locked): the table cut by the right edge, the chair left of it. A
 *  step nearer and lower than v6's cafe set (so the edge cuts the table and the pair sits in the canopy's shade). */
export const V7_TABLE = {x: 1050, top: 1648, foot: 1786, chairX: 930, seatY: 1712, k: 1.08} as const;
const RATTAN = '#C9876A';
/** The table's top: a rose stone in the mid-tones (v6's marble top was the bank's lit cream, L* 89: in the canopy's
 *  shade it stayed +17 L* over the quay; R6 asks a near prop within 8 L* of its shade mass). */
const TABLE_TOP = '#A97F80';
const TABLE_EDGE = '#977174';

const Chair: React.FC<{x: number; seatY: number; k: number}> = ({x, seatY, k: z}) => {
  const k = z;
  const foot = seatY + 74 * z;
  const legC = dark('wood');
  return (
    <>
      <Fill d={poly([[x - 36 * k, seatY], [x - 26 * k, seatY], [x - 30 * k, foot], [x - 42 * k, foot]])} color={legC} seed="v7/chair/L1" offset={false} />
      <Fill d={poly([[x + 26 * k, seatY], [x + 36 * k, seatY], [x + 42 * k, foot], [x + 30 * k, foot]])} color={legC} seed="v7/chair/L2" offset={false} />
      <Fill d={ell(x, seatY + 6 * z, 44 * z, 11 * z)} color={dark('wood')} seed="v7/chair/U" offset={false} />
      <Fill d={`M${x - 40 * k} ${seatY}C${x - 46 * k} ${seatY - 46 * z} ${x - 40 * k} ${seatY - 80 * z} ${x - 20 * k} ${seatY - 86 * z}L${x - 10 * k} ${seatY - 74 * z}C${x - 26 * k} ${seatY - 66 * z} ${x - 30 * k} ${seatY - 36 * z} ${x - 26 * k} ${seatY}Z`} color={RATTAN} seed="v7/chair/B" offset={false} />
      <Fill d={ell(x, seatY, 46 * z, 12 * z)} color={RATTAN} seed="v7/chair/S" offset={false} />
    </>
  );
};

/** A fallen leaf lying on the quay (V2S1_fore's leaf: flat, bigger the nearer). */
function leaf(x: number, y: number, L: number, a: number): string {
  const r = (a * Math.PI) / 180;
  const ux = Math.cos(r) * L;
  const uy = Math.sin(r) * L * 0.5;
  return `M${r1(x - ux)} ${r1(y - uy)}Q${r1(x - uy)} ${r1(y + ux * 0.25)} ${r1(x + ux)} ${r1(y + uy)}Q${r1(x + uy)} ${r1(y - ux * 0.25)} ${r1(x - ux)} ${r1(y - uy)}Z`;
}
/** A few leaves fallen from the plane tree whose canopy shades the quay (T1/T3: the quiet field patterned at +-3-6 L*,
 *  never empty: composition.md R5), in uneven clusters, none near the table; in the canopy's shade they sit
 *  tone-on-tone (step 2). v6 had seventeen; nine stay. */
const LEAVES: [number, number, number, number, 'gold' | 'rust' | 'dark'][] = [
  [318, 1652, 14, 60, 'gold'], [352, 1676, 12, -25, 'dark'], [590, 1786, 19, -10, 'rust'], [552, 1812, 15, 40, 'dark'],
  [168, 1834, 25, 30, 'rust'], [214, 1760, 17, 70, 'dark'], [96, 1892, 22, 25, 'gold'], [452, 1890, 26, -60, 'dark'],
  [760, 1560, 11, 15, 'rust'],
];
const FallenLeaves: React.FC = () => {
  const col = {gold: CM.leafGold, rust: RATTAN, dark: dark('wood')};
  return (
    <>
      {(['gold', 'rust', 'dark'] as const).map((k) => (
        <Fill key={k} d={LEAVES.filter((l) => l[4] === k).map(([x, y, L, a]) => leaf(x, y, L, a)).join('')} color={col[k]} seed={`v7/leaves/${k}`} offset={false} />
      ))}
    </>
  );
};

/** The table (a marble top on a dark pedestal, a flat foot) and the chair, with their contact shadows; the fallen
 *  leaves. */
export const V7NearProps: React.FC = () => {
  const {x, top, foot, chairX, seatY, k} = V7_TABLE;
  const z = k;
  return (
    <>
      <ShadowLayer>
        <ContactShadow x={x} y={foot + 2} w={104 * z} d={groundEll(x, foot + 5, 58 * z, 10 * z)} at={floodAt(x, foot)} />
        <ContactShadow x={chairX} y={seatY + 76 * z} w={96 * z} d={groundEll(chairX, seatY + 79 * z, 52 * z, 9 * z)} at={floodAt(chairX, seatY + 76)} />
      </ShadowLayer>
      <Tier tier="environment">
        <FallenLeaves />
        <Chair x={chairX} seatY={seatY} k={z} />
        <Fill d={groundEll(x, foot, 48 * z, 9 * z)} color={dark('iron')} seed="v7/table/foot" offset={false} />
        <Fill d={poly([[x - 7 * z, top + 10], [x + 7 * z, top + 10], [x + 7 * z, foot], [x - 7 * z, foot]])} color={dark('iron')} seed="v7/table/ped" offset={false} />
        <Fill d={ell(x, top + 7 * z, 94 * z, 20 * z)} color={TABLE_EDGE} seed="v7/table/edge" offset={false} />
        <Fill d={ell(x, top, 94 * z, 20 * z)} color={TABLE_TOP} seed="v7/table/top" offset={false} />
      </Tier>
    </>
  );
};

// ---------------------------------------------------------------- the boat: boat A alone

/** Boat A with a cabin of the family (a dusky rose painted cabin: v6's sage read green against the dusk). */
export const V7_BOAT: BoatOpts = {...BOAT_A, cabin: '#C9A0A6'};

export const V7Boat: React.FC = () => {
  const {darks} = useSwitches();
  const b = useMemo(() => {
    const b = new Batch();
    boatInto(b, V7_BOAT, 0);
    // the darks' hull, portholes and stern doors (paint_s1's OneBoat: the kit's fills recoloured by layer)
    if (darks) {
      recolourBatch(b, {[CM.paneUnlit]: dark('iron')}, [0]);
      recolourBatch(b, {[CM.glass]: dark('pane'), [CM.line]: dark('wood')}, [1]);
      recolourBatch(b, {[CM.brickDeep]: dark('wood'), [CM.coatSlate]: dark('iron')}, [2, 3, 4, 5]);
    }
    return b;
  }, [darks]);
  return <CellPaint b={b} seed="s1boat/s1boatA" cell={160} misreg={0.8} />;
};

// ---------------------------------------------------------------- Pip on boat A's cabin roof

const G = boatGeom(V7_BOAT);
/** Pip's seat: boat A's cabin roof, where v6's boater sat (x 962), its scale the boat's (70: the far towpath's px per
 *  metre against the landing's). */
export const V7_PIP = {seat: [958, G.roofY - G.roofH - (V7_BOAT.topView ?? 0) * 0.4] as [number, number], size: 70} as const;
const EARS_COVER = {...POSES.earsCover, hunch: 0.72, headDrop: 8.5, earDroopA: 72, earDroopB: 72, earSwingA: 150, earSwingB: 150, earFoldA: 0.5, earFoldB: 0.5, trunkCurl: 1.55, scarfLift: 0.4};

/** Pip seated on the roof, facing back (it watches her across the water), drawn with the flood like v6's Pip (its line
 *  goes under its colour: the no-outline look), its contact strip on the roof. */
export const V7Pip: React.FC = () => {
  const [x, y] = V7_PIP.seat;
  return (
    <>
      <ShadowLayer>
        <ContactShadow x={x} y={y + 1} w={V7_PIP.size * 0.42} h={5} at={floodAt(x, y)} />
      </ShadowLayer>
      <Look ink={false}>
        <PipTrack
          x={x}
          y={y}
          size={V7_PIP.size}
          facing="back"
          seed="pipS1"
          paint="look"
          tier="support"
          keys={[
            {t: S1_PIP.from, draw: S1_PIP.drawDur},
            {t: C.life, pose: EARS_COVER, dur: 0.1},
            {t: 5.55, pose: 'sit', dur: 0.25},
          ]}
        />
      </Look>
    </>
  );
};
