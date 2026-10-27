// S13_window (lane S13, G5b): the outside through S13's ONE window (the kit Nook 'objective' glass, x 470-1110,
// y 640-1006, mullion 1023; everything here is clipped to the glass and drawn fill-only: far planes get no ink).
// Locked board: the far data center silhouette (no sign, its 3 roof units name it) on the horizon (y 912), x 591-961.
// Added around it (docs/v3/density_plan_g5b.md S13, docs/v3/cozy_v2_application.md §1-2: DENSE-CALM, "the window
// street seen from above, as a sliver"):
//   sky        the dusk sky (the one cool calm field), the cooling plume sliding off the units along the glass top,
//              icicles under the lintel (dripping), two snow layers.
//   horizon    a far hill row behind the building, a terrace, a cottage and a snowy pine left of it, a block of flats
//              (two neighbours at lit windows) and a mansard right of it; chimneys smoke.
//   the sliver (y 912-1006, the attic is 3-4 floors up a hill street, so it looks DOWN on our street, stacked upward):
//              far roofs paling toward skyLow hide the building's base; the opposite houses' snowy roof planes seen from
//              above, their fronts with warm windows switching (one switches on at 0.78 = VO 32.1) and a lit
//              shopfront; the far kerb, a street lamp with its halo, a parked car; the snowy road with tracks.
//   life       1-3 movers in the sliver, sideways only, at real speeds (cozy v2 §2): a car with lit headlights (~1.5
//              lengths / s, in from the right glass edge), a walker out from behind the lamp head, a walker with a dog
//              (40-50 px tall, ~1 body h / s); at rest: two neighbours chatting by the shop, one waiting at the lamp, a
//              kid on a sledge with a parent.
import React from 'react';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {
  Car3,
  DataCenter,
  EMBER,
  Icicles,
  LampPost3,
  NightSky,
  PuffTrain,
  SnowLayers,
  SnowTree,
  Tiny,
  TownHouse,
  TownRow,
  windowLit,
  WindowSilhouette,
  type WindowForce,
} from '../kit';

/** The glass (NOOK_LAYOUT.objective) and the board's horizon. */
export const S13_GLASS = {x: 470, y: 640, w: 640, h: 366};
const HOR = 912;
const FAR_HILL = '#4B5884'; // one flat step between the sky and the roofs (O1's far hill), fill only
const FAR_ROW = '#414D78';
const FAR_ROOF = '#5E6C99'; // the far roofs below the horizon, paling toward skyLow
/** The sliver's rows (seen from above): ridge, front eave, front foot (far pavement), kerb, road. */
const ROW = {ridge: 925, eave: 939, foot: 962, kerb: 968, road: 971};

// ---------------------------------------------------------------- the opposite houses, seen from above

type Opp = {x: number; w: number; body: string; dy: number; chimney: number | null; shop: boolean; wins: number};

const OPP: Opp[] = (() => {
  const r = rng('s13/opp');
  const bodies = [EMBER.roofs, FAR_ROW, EMBER.dc, '#3B4670'];
  const out: Opp[] = [];
  let x = 452;
  let i = 0;
  while (x < 1130) {
    const shop = x > 780 && x < 830 && !out.some((o) => o.shop);
    const w = shop ? 84 : r.range(58, 96);
    out.push({x, w, body: bodies[i % bodies.length], dy: r.int(-1, 2) * 2, chimney: r.chance(0.7) ? r.range(0.2, 0.75) : null, shop, wins: w > 80 ? 3 : 2});
    x += w + r.range(-2, 3);
    i++;
  }
  return out;
})();

const N_WIN = OPP.reduce((n, o) => n + (o.shop ? 1 : o.wins), 0);
/** "a neighbour's light switching on (32.1)": window 5 pops on at 0.78; window 9 goes off late in the hold. */
const WIN_FORCE: WindowForce[] = [{i: 5, t: -9, on: false}, {i: 5, t: 0.78, on: true}, {i: 9, t: -9, on: true}, {i: 9, t: 1.86, on: false}];

const OppositeRow: React.FC = () => {
  const t = useTime();
  const out: React.ReactNode[] = [];
  const smoke: React.ReactNode[] = [];
  let wi = 0;
  OPP.forEach((o, k) => {
    const ridge = ROW.ridge + o.dy;
    // the front (facade) under the eave, a door
    out.push(<rect key={`f${k}`} x={o.x} y={ROW.eave} width={o.w} height={ROW.foot - ROW.eave + 1} fill={o.body} />);
    // the snowy roof plane seen from above (a trapezoid widening to the front eave), its frost ridge and the eave edge
    out.push(<path key={`r${k}`} d={`M${o.x + 3} ${ridge}L${o.x + o.w - 3} ${ridge}L${o.x + o.w + 3} ${ROW.eave}L${o.x - 3} ${ROW.eave}Z`} fill={EMBER.snow} />);
    out.push(<rect key={`rg${k}`} x={o.x + 3} y={ridge} width={o.w - 6} height={2.4} fill={EMBER.frost} />);
    out.push(<rect key={`ev${k}`} x={o.x - 3} y={ROW.eave - 1} width={o.w + 6} height={3} fill={EMBER.frost} />);
    if (o.chimney !== null) {
      const cx = o.x + o.w * o.chimney;
      out.push(<rect key={`c${k}`} x={cx - 4} y={ridge - 9} width={9} height={12} fill={EMBER.dcSide} />);
      out.push(<rect key={`cs${k}`} x={cx - 5.5} y={ridge - 11} width={12} height={3.4} fill={EMBER.snow} />);
      smoke.push(<PuffTrain key={`s${k}`} x={cx + 0.5} y={ridge - 11} n={6} life={2.8} rise={46} drift={42} r0={2.2} r1={7.5} wobble={2} stretch={1.8} color={EMBER.skyLow} seed={`s13/oppsmoke${k}`} at={-3 - k * 0.7} />);
    }
    if (o.shop) {
      // a lit shopfront: an awning (striped), the warm display window with boxes, a door and a small hanging sign
      const sx = o.x + 8;
      const sw = o.w * 0.62;
      out.push(<rect key="sw" x={sx} y={ROW.eave + 9} width={sw} height={12} fill={EMBER.houseLit} />);
      [0, 1, 2].forEach((j) => out.push(<rect key={`sb${j}`} x={sx + 6 + j * 15} y={ROW.eave + 15} width={9} height={6} fill={j === 1 ? EMBER.beam : EMBER.dcSide} />));
      [0, 1, 2, 3, 4, 5].forEach((j) => out.push(<rect key={`aw${j}`} x={sx - 3 + j * ((sw + 6) / 6)} y={ROW.eave + 3} width={(sw + 6) / 6} height={5} fill={j % 2 ? EMBER.card : EMBER.books[4]} />));
      out.push(<rect key="sd" x={sx + sw + 6} y={ROW.eave + 8} width={10} height={ROW.foot - ROW.eave - 8} fill={EMBER.houseLit} />);
      out.push(<rect key="sg" x={o.x + o.w - 10} y={ROW.eave + 2} width={8} height={8} fill={EMBER.ring} />);
      wi += 1;
    } else {
      for (let j = 0; j < o.wins; j++) {
        const wx = o.x + o.w * ((j + 0.5) / o.wins) - 4;
        const lit = windowLit(t, 's13/oppwin', wi, N_WIN, {gap: [0.7, 1.6], litFrac: 0.62, force: WIN_FORCE});
        out.push(<rect key={`w${k}_${j}`} x={wx} y={ROW.eave + 6} width={8} height={9} fill={lit ? EMBER.houseLit : EMBER.dcSide} />);
        wi++;
      }
      // a door on every other house
      if (k % 2 === 0) out.push(<rect key={`d${k}`} x={o.x + o.w * 0.5 - 4} y={ROW.foot - 9} width={8} height={9} fill={EMBER.dcSide} />);
    }
  });
  return (
    <>
      {smoke}
      {out}
    </>
  );
};

// ---------------------------------------------------------------- the street: pavement, kerb, road, lamp, parked car

const Street: React.FC = () => {
  const r = rng('s13/street');
  const banks: React.ReactNode[] = [];
  for (let x = 452; x < 1130; ) {
    const w = r.range(24, 52);
    banks.push(<ellipse key={`b${x.toFixed(0)}`} cx={x + w / 2} cy={ROW.kerb - 1} rx={w / 2} ry={r.range(2.6, 4.2)} fill={EMBER.snow} />);
    x += w + r.range(10, 40);
  }
  return (
    <>
      {/* pavement (snow, footprints), the kerb line, the road (snow) with a trodden band and two tyre tracks */}
      <rect x={450} y={ROW.foot} width={680} height={ROW.kerb - ROW.foot} fill={EMBER.snow} />
      {Array.from({length: 22}, (_, i) => (
        <rect key={`fp${i}`} x={462 + i * 30 + (i % 3) * 5} y={ROW.foot + 1.5 + (i % 2) * 2} width={4} height={2} fill={EMBER.frost} />
      ))}
      <rect x={450} y={ROW.kerb} width={680} height={2.6} fill={EMBER.skyLow} />
      <rect x={450} y={ROW.road} width={680} height={60} fill={EMBER.snow} />
      <rect x={450} y={ROW.road + 5} width={680} height={22} fill={EMBER.road} />
      <rect x={450} y={ROW.road + 9} width={680} height={2.4} fill={EMBER.frost} />
      <rect x={450} y={ROW.road + 19} width={680} height={2.4} fill={EMBER.frost} />
      {banks}
    </>
  );
};

/** The street lamp on the far kerb (its warm halo on the fronts) and a parked car under snow. */
const KerbThings: React.FC = () => (
  <>
    <Car3 x={1072} y={ROW.kerb - 1} w={64} view="side" dir={1} color={EMBER.skyLow} lights={false} snow ink={0} seed="s13/parked" />
    <LampPost3 x={872} y={ROW.kerb} h={74} arm="top" ink={0} seed="s13/lamp" halo={[EMBER.skyLow, EMBER.ring]} />
  </>
);

// ---------------------------------------------------------------- the people and the car (movers and resters)

const CAR_V = 100; // px / s (~1.1 lengths / s)

/** Movers' lanes, kept >= 71 px apart along x at every moment (car half-length 46 + a walker's 9 + the meter's 16 px
 *  merge), so each reads (and measures) as its own figure: walker A and walker B (a dog leading) go left to right in
 *  the left half, the car right to left in the right half. */
const People: React.FC = () => {
  const t = useTime();
  const bobA = Math.sin(t * 2.1) * 0.8;
  const bobB = Math.sin(t * 1.7 + 1.2) * 0.8;
  const aX = 600 + 54 * t; // walker A: out from behind the lamp head (~1.1 body h / s at 50 px)
  const bX = 724 + 48 * t; // walker B + dog
  const carX = 1122 - CAR_V * t; // the car: in from the right glass edge (headlights ahead)
  return (
    <>
      {/* at rest: a kid on a sledge with a parent (far left), two neighbours chatting at the shop door, one at the lamp */}
      <Tiny x={498} y={ROW.foot + 4} h={46} t={0} coat={EMBER.books[3]} hair={EMBER.anchor} />
      <Tiny x={520} y={ROW.foot + 5} h={30} t={0} coat={EMBER.books[0]} hair={EMBER.anchor} kind="sledge" dir={-1} />
      <g transform={`translate(0 ${bobA.toFixed(2)})`}>
        <Tiny x={848} y={ROW.foot + 3} h={46} t={0} coat={EMBER.books[1]} hair={EMBER.hair} kind="pair" />
      </g>
      <g transform={`translate(0 ${bobB.toFixed(2)})`}>
        <Tiny x={896} y={ROW.foot + 4} h={46} t={0} coat={EMBER.reveal} hair={EMBER.books[3]} kind="umbrella" />
      </g>
      {/* movers */}
      <Tiny x={aX} y={ROW.foot + 4} h={50} t={t} coat={EMBER.books[4]} hair={EMBER.anchor} dir={1} />
      <Tiny x={bX} y={ROW.foot + 5} h={50} t={t + 0.3} coat={EMBER.books[0]} hair={EMBER.hair} kind="dog" dir={1} />
      <Car3 x={carX} y={ROW.road + 22} w={92} view="side" dir={-1} color={EMBER.beam} beam={EMBER.frost} lights snow exhaust rolling ink={0} seed="s13/car" />
    </>
  );
};

// ---------------------------------------------------------------- the whole view (children of <Nook variant="objective">)

const DC_X = 776;

export const S13Outside: React.FC = () => {
  const g = S13_GLASS;
  return (
    <>
      <NightSky x={g.x - 30} y={g.y - 30} w={g.w + 60} h={g.h + 60} />
      <rect x={g.x - 30} y={HOR} width={g.w + 60} height={g.y + g.h - HOR + 30} fill={EMBER.snow} />
      {/* the horizon: a far hill row, a terrace, a cottage and a pine left of the building; a block and a mansard right */}
      <TownRow x0={452} x1={1130} y={HOR + 2} w={34} gap={-2} color={FAR_HILL} far seed="s13/hill" litFrac={0.5} />
      <TownHouse x={466} y={HOR + 4} w={56} kind="terrace" color={FAR_ROW} far seed="s13/fl1" litFrac={0.6} />
      <TownHouse x={516} y={HOR + 6} w={50} kind="cottage" color={EMBER.roofs} far seed="s13/fl2" litFrac={0.7} />
      <SnowTree x={572} y={HOR + 8} h={88} kind="pine" far seed="s13/pine" />
      {/* the cooling plume slides off the 3 roof units and drifts right along the glass top (the quiet ambient loop) */}
      {[692, 776, 860].map((x, i) => (
        <PuffTrain key={i} x={x} y={652} n={6} life={3.4} rise={14} drift={140} r0={6} r1={18} wobble={3} stretch={1.7} color={EMBER.skyLow} seed={`s13/plume${i}`} at={-3 - i * 1.1} />
      ))}
      <DataCenter x={DC_X} y={HOR + 2} w={371} variant="far" sign={null} seed="dc/objective" />
      <TownHouse x={960} y={HOR + 6} w={62} h={128} kind="block" color={FAR_ROW} far dish seed="s13/fr1" litFrac={0.7} />
      <WindowSilhouette x={970} y={806} w={16} h={20} who="cook" lit far seed="s13/blockwin" dark={EMBER.dcDark} />
      <WindowSilhouette x={994} y={850} w={15} h={19} who="read" lit far seed="s13/blockwin2" dark={EMBER.dcDark} />
      <TownHouse x={1034} y={HOR + 6} w={66} kind="mansard" color={EMBER.roofs} far antenna seed="s13/fr2" litFrac={0.6} />
      {/* far roofs below the horizon, paling toward skyLow, hide the building's base */}
      <TownRow x0={452} x1={1130} y={HOR + 22} w={30} gap={-3} kinds={['cottage', 'terrace', 'mansard']} color={FAR_ROOF} far seed="s13/farroofs" litFrac={0.55} />
      {/* the sliver: our street from above */}
      <OppositeRow />
      <Street />
      <KerbThings />
      <People />
      <Icicles x0={486} x1={1104} y={g.y + 2} n={7} len={[12, 34]} seed="s13/ice" ink={0} />
      <SnowLayers x={g.x} y={g.y} w={g.w} h={g.h} layers={['far', 'mid']} band={null} density={1.3} wind={-6} seed="s13/snow" />
    </>
  );
};
