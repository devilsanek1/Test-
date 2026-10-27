// kit/KitSheetLight.tsx: the LIGHT AND SHADOW demo (v3 rework, look engineer 2: kit/Light.tsx, kit/README.md "Light and
// shadow"). Two frames at film size, each lit by its set's ONE rig, and the same frames with the light off (`lit` false:
// the A/B check, the kit's look before the light system):
//   LightNook    the home base's desk in S7's grammar: the lamp (THE key, screen-left) throws its pool on the desk; your
//                laptop and its tag stand in it (lit: the subject, a warm rim on the key side, the tag's drop shadow on
//                the lid); books and the pen cup in the pool (form shade on the side away from the lamp, contact, cast
//                shadows radiating from the lamp's foot, only inside the pool); the mug, the notebook and Pip outside it
//                (the ambient: one step down, contact shadows only); the room one step down outside the light (no wall
//                wash: the anglepoise stands in front of the glass), the caption band one value; the outside keeps its
//                own light (the clean pen's environment tier already lays its snow at the night ambient).
//   LightStreet  a blue-hour street corner: the sky is the key (tops lit, no cast direction), one street lamp is a
//                practical (one small halo step on the sky, its pool on the snow, cast shadows only inside it), lit windows
//                at L* 88 with their spill on the snow, the open snow at its ambient L* 83, the facade turned away from
//                the bright sky one step down and the eave's underside in shadow, contact shadows under everything that
//                stands, a person in the pool (the subject: form shade, rim, cast shadow) and a walker whose shadow swings
//                round the lamp's foot.
//   LightDemo    both, side by side (2160 x 1920).
// Render (src/entry-v3-kit.tsx): node scripts/render-frames.mjs LightDemo <dir> 3.0 --entry=src/entry-v3-kit.tsx
//   and --props='{"lit":false}' for the A side.

import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Tier} from '../../../lib/tier';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../palette';
import {LampPose, Mug, Nook, NOOK_LAYOUT, Notebook} from './Nook';
import {Laptop, laptopGeo} from './Laptop';
import {PriceTag, tagHole, tagShape} from './PriceTag';
import {Book, PenCup} from './Room';
import {Pip3} from './Pip3';
import {Car3, LampPost3} from './Street';
import {personGeo, Walker, WinterPerson} from './People3';
import {NightSky, Snowfall, TownBand} from './Outside';
import {loopPos} from './idle';
import {Pt, Txt} from './util';
import {
  Ambient,
  CastShadow,
  ContactShadow,
  dropOffset,
  Ellipse,
  ellipseD,
  FormShade,
  groundAmbientOf,
  Halo,
  Lit,
  LightHole,
  LightPool,
  lightProblems,
  LitWindow,
  nookRig,
  PoolLift,
  polyD,
  rectD,
  Rim,
  RIGS,
  Shade,
  Shadow,
  ShadowLayer,
  useLightOff,
  useRig,
  SourceCore,
  streetLamp,
  WindowSpill,
  withKey,
} from './Light';

export const LIGHT_SHEET = {w: 2160, h: 1920};

// ================================================================= the nook: the desk props under the lamp

const NOOK = NOOK_LAYOUT.pov;
/** The lamp, screen-left (the key), its head over the laptop's left shoulder. */
const LAMP: LampPose = {base: [150, 1290], elbow: [196, 1020], head: [330, 990], rot: -22};
/** Its pool on the desk: wider than the laptop (it reads as light, not a mat), centred right of the mouth's foot. */
const POOL: Ellipse = {cx: 470, cy: 1400, rx: 330, ry: 100};
/** The kit Nook's own pool, shrunk away when the rig's LightPool replaces it. */
const NO_POOL: Ellipse = {cx: 470, cy: 1400, rx: 0.5, ry: 0.5};
/** The rig: the lamp is the key; no wall wash (the anglepoise stands in front of the glass: a wash's edge would wrap
 *  round the window and read as the window glowing). */
export const RIG_NOOK_DEMO = nookRig({lamp: LAMP, pool: POOL, glass: NOOK.glass});

const LAP = {x: 480, y: 1372, w: 340};
const LG = laptopGeo(LAP.x, LAP.y, LAP.w);
const LID_D = polyD(LG.lid);
const DECK_D = polyD(LG.deck) + polyD(LG.edge);
const TAG = {x: 520, y: 1236, w: 150, rot: 4};
/** The tag's outline on the canvas (PriceTag: rotated about its hole). */
function tagPts(x: number, y: number, w: number, rot: number): Pt[] {
  const [hx, hy] = tagHole(w);
  const a = (rot * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return tagShape(w).map(([px, py]) => {
    const dx = px - hx;
    const dy = py - hy;
    return [x + hx + dx * c - dy * s, y + hy + dx * s + dy * c] as Pt;
  });
}
const TAG_PTS = tagPts(TAG.x, TAG.y, TAG.w, TAG.rot);
const TAG_D = polyD(TAG_PTS);
const BOOKS = [
  {x: 160, y: 1412, w: 128, h: 24, c: EMBER.books[3]},
  {x: 168, y: 1392, w: 116, h: 20, c: EMBER.books[0]},
  {x: 163, y: 1374, w: 108, h: 18, c: EMBER.books[4]},
];
const PENCUP = {x: 735, y: 1388, w: 56};
const MUG = {x: 830, top: 1270, w: 98};
const PIP = {x: 944, y: 1584, scale: 0.85};
const NOTEBOOK_COVER: Pt[] = [[-64, 1594], [356, 1600], [352, 1860], [-54, 1858]];

export const LightNook: React.FC<{lit?: boolean}> = ({lit = true}) => {
  const rig = RIG_NOOK_DEMO;
  const laptop = <Laptop x={LAP.x} y={LAP.y} w={LAP.w} seed="light/lap" />;
  const tag = <PriceTag x={TAG.x} y={TAG.y} w={TAG.w} rot={TAG.rot} value="$1,099" stringFrom={[LG.lid[1][0] - 8, LG.lid[1][1] + 6]} seed="light/tag" />;
  const books = (
    <>
      {BOOKS.map((bk, i) => (
        <Book key={i} x={bk.x} y={bk.y} w={bk.w} h={bk.h} color={bk.c} seed={`light/book${i}`} lying />
      ))}
    </>
  );
  const penCup = <PenCup x={PENCUP.x} y={PENCUP.y} w={PENCUP.w} seed="light/pens" />;
  const mug = <Mug x={MUG.x} top={MUG.top} w={MUG.w} steam={false} seed="light/mug" />;
  // the hinge as a thin strip: the lid's footprint (it stands on it, h = the lid's height)
  const hinge: Pt[] = [LG.lid[3], LG.lid[2], [LG.lid[2][0], LG.lid[2][1] - 5], [LG.lid[3][0], LG.lid[3][1] - 5]];
  const deckFront: Pt[] = [LG.edge[3], LG.edge[2], [LG.edge[2][0] + 2, LG.edge[2][1] + 6], [LG.edge[3][0] - 2, LG.edge[3][1] + 7]];
  const tagC: Pt = [TAG.x + TAG.w * 0.55, TAG.y + TAG.w * 0.25];
  const drop = dropOffset(rig, tagC, 14);
  const g = NOOK.glass;
  const holes: LightHole[] = [
    {rect: [g.x, g.y, g.w, g.h]}, // the glass: the outside keeps its own light
    {rect: [NOOK.mullionX - 7, g.y, 14, g.h], kind: 'dark'}, // the mullion is the room's
    {e: POOL}, // the pool on the desk (hard: its two steps are the gradient)
    {of: laptop},
    {of: tag},
    {of: books},
    {of: penCup},
  ];
  return (
    <Lit rig={rig} off={!lit}>
      <Nook variant="pov" layout={{lamp: LAMP, pool: lit ? NO_POOL : POOL, mug: null}} seed="light/nook" />
      {/* the outside keeps its own light: the clean pen's environment tier already lays its snow at ~L* 82 (the night
          ambient), so no Ambient is stacked on it */}
      <LightPool />
      <ShadowLayer exclude={[ellipseD({cx: LAMP.base[0], cy: LAMP.base[1], rx: 56, ry: 15})]}>
        <ContactShadow x={LAMP.base[0]} y={LAMP.base[1] + 8} w={112} h={12} />
        <ContactShadow x={224} y={1436} w={128} />
        <CastShadow x={224} y={1428} w={128} depth={14} h={62} />
        <ContactShadow x={PENCUP.x} y={PENCUP.y} w={PENCUP.w} />
        <CastShadow x={PENCUP.x} y={PENCUP.y - 4} w={PENCUP.w} h={66} />
        <ContactShadow x={LAP.x} y={LAP.y} w={LAP.w} d={polyD(deckFront)} />
        <CastShadow x={LAP.x} y={LAP.y} w={LAP.w} pts={hinge} h={LG.H} />
        <ContactShadow x={MUG.x + MUG.w / 2} y={MUG.top + MUG.w * 1.14} w={MUG.w} />
        <ContactShadow x={150} y={1730} w={400} d={polyD(NOTEBOOK_COVER)} away={5} />
        <ContactShadow x={PIP.x} y={PIP.y} w={62} />
      </ShadowLayer>
      {penCup}
      {books}
      {laptop}
      {tag}
      {mug}
      <Pip3 x={PIP.x} y={PIP.y} scale={PIP.scale} pose="sit-front" seed={7} />
      <Notebook seed="light/nb" />
      {/* form: the side away from the lamp, one step (the books are left of the mouth: their left ends; the pen cup right) */}
      <FormShade of={books} c={[224, 1405]} size={[128, 62]} />
      <FormShade of={penCup} c={[PENCUP.x, PENCUP.y - 32]} size={[PENCUP.w, 64]} />
      {/* the tag hangs in front of the lid: its shadow lands on the lid, down and away from the lamp */}
      <Shadow d={TAG_D} dx={drop[0]} dy={drop[1]} clip={LID_D} soft={2} />
      {/* the room one step down outside the light (falloff); holes: the glass, the pool, the lit objects */}
      <Ambient holes={holes} />
      <PoolLift d={DECK_D} c={LG.keysC} />
      <Rim d={LID_D} width={5} />
      <Rim d={TAG_D} width={4} />
      <XG m={mat.compose(mat.translate(LAMP.head[0], LAMP.head[1]), mat.rotate(LAMP.rot))}>
        <SourceCore d={ellipseD({cx: 0, cy: 100, rx: 64, ry: 12})} />
      </XG>
      {/* a caption stand-in (captions are the Film's, never lit): the band must read one flat value */}
      <Txt x={540} y={430} size={66}>
        Mostly because
      </Txt>
      <Txt x={540} y={512} size={66}>
        your laptop runs on
      </Txt>
    </Lit>
  );
};

// ================================================================= the street corner at blue hour

const HORIZON = 1252;
const LAMP_POST = {x: 600, y: 1662, h: 520};
/** LampPost3's lantern (arm 'top'): lw = 30 k, lh = 40 k, top at y - h - 6 k (k = h / 300). */
function lanternOf(x: number, y: number, h: number) {
  const k = h / 300;
  const lw = 30 * k;
  const lh = 40 * k;
  const ly = y - h - 6 * k;
  const quad: Pt[] = [[x - lw / 2, ly], [x + lw / 2, ly], [x + lw * 0.32, ly + lh], [x - lw * 0.32, ly + lh]];
  return {lw, lh, ly, c: [x, ly + lh * 0.5] as Pt, quad};
}
const LANTERN = lanternOf(LAMP_POST.x, LAMP_POST.y, LAMP_POST.h);
const FAR_POST = {x: 524, y: 1330, h: 130};
const FAR_LANTERN = lanternOf(FAR_POST.x, FAR_POST.y, FAR_POST.h);
const MAIN_LAMP = streetLamp(LANTERN.c, [LAMP_POST.x, LAMP_POST.y], {k: 0.75});
const FAR_LAMP = streetLamp(FAR_LANTERN.c, [FAR_POST.x, FAR_POST.y], {k: 0.75});
export const RIG_STREET_DEMO = withKey(RIGS.street, RIGS.street.key, [MAIN_LAMP, FAR_LAMP]);

/** The brick corner (left): its front faces us, its side runs down the street (facing right: away from the bright
 *  sky, one step down). */
const LB = {x0: -40, x1: 400, top: 668, base: 1500, sideX: 478, sideTop: 722, sideBase: 1452};
const LB_SIDE: Pt[] = [[LB.x1, LB.top], [LB.sideX, LB.sideTop], [LB.sideX, LB.sideBase], [LB.x1, LB.base]];
/** The blue block (right): its side faces the street (toward the bright sky: lit). */
const RB = {x0: 720, x1: 1140, top: 712, base: 1478, sideX: 640, sideTop: 760, sideBase: 1430};
const RB_SIDE: Pt[] = [[RB.sideX, RB.sideTop], [RB.x0, RB.top], [RB.x0, RB.base], [RB.sideX, RB.sideBase]];
const L_WINDOWS: {r: [number, number, number, number]; lit: boolean}[] = [
  {r: [48, 760, 92, 128], lit: true},
  {r: [236, 760, 92, 128], lit: false},
  {r: [48, 950, 92, 128], lit: false},
  {r: [236, 950, 92, 128], lit: true},
];
const SHOP_WIN: [number, number, number, number] = [30, 1222, 340, 200];
const R_WINDOWS: {r: [number, number, number, number]; lit: boolean}[] = [
  {r: [770, 800, 100, 140], lit: true},
  {r: [930, 800, 100, 140], lit: false},
  {r: [770, 1000, 100, 140], lit: false},
  {r: [930, 1000, 100, 140], lit: true},
];
const R_DOOR: [number, number, number, number] = [850, 1290, 90, 188];
const BENCH = {x0: 262, x1: 418, seat: 1612, top: 1560, base: 1664};
const PERSON = {x: 760, feet: 1700, h: 270, seed: 'light/p1'};
/** Supporting life: a slow walker crossing the lamp's pool behind the bench (x 335 -> 665 over the 6 s clip: it never
 *  crosses the subject), its shadow swinging round the lamp's foot. */
const WALK = {from: [-120, 1610] as Pt, to: [1200, 1610] as Pt, h: 205, speed: 55, phase: 0.3245, pause: 1.5, seed: 'light/w1'};
const CAR = {x: 160, y: 1850, w: 300};

/** Thin sky-facing snow caps at the rig's cap value (CRAFT §d.2: L* 87-89, under the pool core; the sky at ~45 lights
 *  them), exact: the environment tier would pull them to ~82, flat with the ground (README "Light and shadow", open). */
const SkyCaps: React.FC<{d: string[]}> = ({d}) => {
  const rig = useRig();
  const off = useLightOff();
  return (
    <>
      {d.map((p, i) => (
        <Fill key={i} d={p} color={off ? EMBER.snow : rig.snowCap} mode="snap" offset={false} backdrop />
      ))}
    </>
  );
};

const BuildingL: React.FC = () => (
  <>
    <Fill rect={[LB.x0, LB.top, LB.x1 - LB.x0, LB.base - LB.top]} color={EMBER.brick} />
    <Fill d={polyD(LB_SIDE)} color={EMBER.brick} />
    {/* the eave band under the snow cap; the shop's sign */}
    <Fill rect={[LB.x0, LB.top, LB.x1 - LB.x0 + 2, 22]} color={EMBER.brickShade} />
    <Fill rect={[20, 1150, 360, 48]} color={EMBER.anchor} />
    {L_WINDOWS.filter((w) => !w.lit).map((w, i) => (
      <Fill key={i} rect={w.r} color={EMBER.dcSide} />
    ))}
    {/* sky-facing caps: thin snow on the roof line and the sills */}
    <SkyCaps d={[polyD([[LB.x0 - 10, LB.top - 16], [LB.x1 + 8, LB.top - 16], [LB.sideX + 8, LB.sideTop - 16], [LB.sideX + 8, LB.sideTop - 2], [LB.x1, LB.top], [LB.x0 - 10, LB.top]]), ...L_WINDOWS.map((w) => rectD(w.r[0] - 6, w.r[1] + w.r[3], w.r[2] + 12, 7))]} />
  </>
);

const BuildingR: React.FC = () => (
  <>
    <Fill rect={[RB.x0, RB.top, RB.x1 - RB.x0, RB.base - RB.top]} color={EMBER.dc} />
    <Fill d={polyD(RB_SIDE)} color={EMBER.dc} />
    {R_WINDOWS.filter((w) => !w.lit).map((w, i) => (
      <Fill key={i} rect={w.r} color={EMBER.dcSide} />
    ))}
    <SkyCaps d={[polyD([[RB.sideX - 8, RB.sideTop - 14], [RB.x0, RB.top - 14], [RB.x1 + 10, RB.top - 14], [RB.x1 + 10, RB.top], [RB.x0, RB.top], [RB.sideX, RB.sideTop]]), ...R_WINDOWS.map((w) => rectD(w.r[0] - 6, w.r[1] + w.r[3], w.r[2] + 12, 7))]} />
  </>
);

/** A park bench (red-brown wood) with a snow cushion on the seat and the back rail. */
const Bench: React.FC = () => (
  <>
    <Fill rect={[BENCH.x0 + 8, BENCH.seat, 10, BENCH.base - BENCH.seat]} color={EMBER.anchor} />
    <Fill rect={[BENCH.x1 - 18, BENCH.seat, 10, BENCH.base - BENCH.seat]} color={EMBER.anchor} />
    <Fill rect={[BENCH.x0 + 10, BENCH.top, 6, BENCH.seat - BENCH.top]} color={EMBER.anchor} />
    <Fill rect={[BENCH.x1 - 16, BENCH.top, 6, BENCH.seat - BENCH.top]} color={EMBER.anchor} />
    <Fill rect={[BENCH.x0, BENCH.top, BENCH.x1 - BENCH.x0, 22]} color={EMBER.beam} />
    <Fill rect={[BENCH.x0, BENCH.seat - 2, BENCH.x1 - BENCH.x0, 16]} color={EMBER.beam} />
    <Fill d={`M${BENCH.x0 + 4} ${BENCH.seat}Q${(BENCH.x0 + BENCH.x1) / 2} ${BENCH.seat - 16} ${BENCH.x1 - 4} ${BENCH.seat}Z`} color={EMBER.snow} />
    <Fill d={`M${BENCH.x0 + 2} ${BENCH.top + 1}Q${(BENCH.x0 + BENCH.x1) / 2} ${BENCH.top - 12} ${BENCH.x1 - 2} ${BENCH.top + 1}Z`} color={EMBER.snow} />
  </>
);

export const LightStreet: React.FC<{lit?: boolean}> = ({lit = true}) => {
  const rig = RIG_STREET_DEMO;
  const pg = personGeo(PERSON.seed, {legs: true});
  const ps = PERSON.h / (pg.legH - pg.headTop);
  const person = <WinterPerson x={PERSON.x} y={PERSON.feet - pg.legH * ps} s={ps} seed={PERSON.seed} legs tier="subject" breathe={0} />;
  const personC: Pt = [PERSON.x, PERSON.feet - PERSON.h * 0.5];
  const personSize: [number, number] = [pg.w * ps * 1.1, PERSON.h];
  return (
    <Lit rig={rig} off={!lit}>
      <NightSky bandY={1050} horizon={HORIZON} />
      {/* one halo step per lantern, on the sky only (drawn before anything stands in front of it) */}
      <Halo x={LANTERN.c[0]} y={LANTERN.c[1]} w={LANTERN.lw} />
      <Halo x={FAR_LANTERN.c[0]} y={FAR_LANTERN.c[1]} w={FAR_LANTERN.lw} />
      {/* the open snow: its ambient value (the light system lowers it from L* 93 to 83 so pools and windows read) */}
      <Fill rect={[-200, HORIZON - 2, 1480, 2200 - HORIZON]} color={lit ? groundAmbientOf(rig) : EMBER.snow} mode="snap" offset={false} backdrop />
      <Tier tier="environment" bg={EMBER.sky}>
        <Fill d={polyD([[LB.sideX, LB.sideBase + 4], [RB.sideX, RB.sideBase + 4], [590, HORIZON], [560, HORIZON]])} color={EMBER.road} />
        <TownBand y={HORIZON} houses={[{x: 470, w: 50, lit: true}, {x: 522, w: 42, chimney: true}, {x: 566, w: 54, lit: true}, {x: 622, w: 46}]} far seed="light/town" />
      </Tier>
      <LampPost3 x={FAR_POST.x} y={FAR_POST.y} h={FAR_POST.h} halo={lit ? false : undefined} seed="light/farlamp" />
      {/* ground light: the shop window's spill, the door's spill, the lamps' pools (the brighter pool covers a spill) */}
      <WindowSpill win={SHOP_WIN} base={LB.base} widen={1.4} depth={0.75} />
      <WindowSpill win={R_DOOR} base={RB.base} widen={1.5} depth={0.6} />
      <LightPool light={FAR_LAMP} />
      <LightPool light={MAIN_LAMP} />
      <ShadowLayer>
        {/* where the walls meet the snow, the lamp post's foot, the bench, the person, the walker, the car */}
        <ContactShadow x={180} y={1500} w={440} tint="cast" d={polyD([[LB.x0, LB.base - 3], [LB.x1, LB.base - 3], [LB.sideX, LB.sideBase - 3], [LB.sideX, LB.sideBase + 6], [LB.x1, LB.base + 7], [LB.x0, LB.base + 7]])} />
        <ContactShadow x={900} y={1478} w={500} tint="cast" d={polyD([[RB.sideX, RB.sideBase - 3], [RB.x0, RB.base - 3], [RB.x1, RB.base - 3], [RB.x1, RB.base + 7], [RB.x0, RB.base + 7], [RB.sideX, RB.sideBase + 6]])} />
        <ContactShadow x={LAMP_POST.x} y={LAMP_POST.y} w={46} h={8} />
        <ContactShadow x={FAR_POST.x} y={FAR_POST.y} w={12} h={4} />
        <ContactShadow x={(BENCH.x0 + BENCH.x1) / 2} y={BENCH.base} w={BENCH.x1 - BENCH.x0} h={8} />
        <CastShadow x={(BENCH.x0 + BENCH.x1) / 2} y={BENCH.base - 10} w={BENCH.x1 - BENCH.x0} depth={14} h={BENCH.base - BENCH.top} />
        <ContactShadow x={PERSON.x} y={PERSON.feet} w={58} k={1.25} />
        <CastShadow x={PERSON.x} y={PERSON.feet} w={52} h={PERSON.h} light={MAIN_LAMP} />
        <WalkerShadows />
        <ContactShadow x={CAR.x} y={CAR.y} w={CAR.w} h={16} k={1.05} />
      </ShadowLayer>
      <Tier tier="environment" bg={EMBER.sky}>
        <BuildingL />
        <BuildingR />
      </Tier>
      {/* lit panes: L* 88 (the brightest warm things outside), never recoloured */}
      {L_WINDOWS.filter((w) => w.lit).map((w, i) => (
        <LitWindow key={i} rect={w.r} />
      ))}
      <LitWindow rect={SHOP_WIN} />
      <Fill rect={[SHOP_WIN[0] + SHOP_WIN[2] / 2 - 4, SHOP_WIN[1], 8, SHOP_WIN[3]]} color={EMBER.anchor} mode="snap" offset={false} />
      {R_WINDOWS.filter((w) => w.lit).map((w, i) => (
        <LitWindow key={`r${i}`} rect={w.r} />
      ))}
      <LitWindow rect={R_DOOR} />
      {/* the side turned away from the bright sky, one step down; the eave's underside in shadow */}
      <Shade d={polyD(LB_SIDE)} />
      <Shade d={rectD(LB.x0, LB.top, LB.x1 - LB.x0, 22)} tint="cast" />
      <Walker from={WALK.from} to={WALK.to} h={WALK.h} speed={WALK.speed} phase={WALK.phase} pause={WALK.pause} seed={WALK.seed} />
      <LampPost3 x={LAMP_POST.x} y={LAMP_POST.y} h={LAMP_POST.h} halo={lit ? false : undefined} seed="light/lamp" />
      <Bench />
      <Car3 x={CAR.x} y={CAR.y} w={CAR.w} view="side" lights={false} snow seed="light/car" />
      {person}
      {/* the subject: its side away from the lamp one step down, the lamp side's lit edge */}
      <FormShade of={person} c={personC} size={personSize} />
      <Rim of={person} c={personC} size={personSize} width={4} cover={0.35} />
      <SourceCore d={polyD(LANTERN.quad)} />
      <SourceCore d={polyD(FAR_LANTERN.quad)} />
      <Snowfall x={0} y={0} w={1080} h={1920} n={34} seed="light/snow" />
      <Txt x={540} y={430} size={66} fill={EMBER.white}>
        so they get
      </Txt>
      <Txt x={540} y={512} size={66} fill={EMBER.white}>
        first dibs.
      </Txt>
    </Lit>
  );
};

/** The walker's contact and cast shadows follow its feet (the kit Walker's own loopPos), its cast shadow swinging round
 *  the lamp's foot as it crosses the pool. */
const WalkerShadows: React.FC = () => {
  const t = useTime();
  const p = loopPos(t, WALK.from, WALK.to, WALK.speed, WALK.phase, WALK.pause);
  if (!p.on) return null;
  return (
    <>
      <ContactShadow x={p.x} y={p.y} w={46} k={1.2} />
      <CastShadow x={p.x} y={p.y} w={40} h={WALK.h} light={MAIN_LAMP} />
    </>
  );
};

// ================================================================= the rig check (lightProblems for every rig)

/** The surfaces each rig's shadows land on (lit palette colours), and the ground its pools sit on. */
const RIG_SURFACES: {name: string; rig: () => import('./Light').LightRig; surfaces: Record<string, string>; ground?: string}[] = [
  {name: 'nook (O1 pov)', rig: () => RIGS.nook, surfaces: {wall: EMBER.wall, desk: EMBER.desk, mug: EMBER.mug, hero: EMBER.hero, book: EMBER.books[0], sleeve: EMBER.sleeve}, ground: EMBER.desk},
  {name: 'nook (demo)', rig: () => RIG_NOOK_DEMO, surfaces: {wall: EMBER.wall, desk: EMBER.desk, paper: EMBER.paper, hero: EMBER.hero}, ground: EMBER.desk},
  {name: 'shop', rig: () => RIGS.shop, surfaces: {wall: EMBER.wall, shelf: EMBER.shelf, desk: EMBER.desk, sleeve: EMBER.sleeve, skin: EMBER.skin}},
  {name: 'street (demo)', rig: () => RIG_STREET_DEMO, surfaces: {snow: '#C9CFE6', pool: '#EADBD2', brick: EMBER.brick, road: EMBER.road, frost: EMBER.frost}, ground: EMBER.snow},
  {name: 'roof', rig: () => RIGS.roof, surfaces: {snow: '#C9CFE6', brick: EMBER.brick, deck: EMBER.desk, sleeve: EMBER.sleeve}, ground: EMBER.snow},
];

export const LightRigCheck: React.FC = () => {
  const rows = RIG_SURFACES.map((r) => {
    const rig = r.rig();
    return {name: r.name, problems: lightProblems(rig, r.surfaces, {ground: r.ground})};
  });
  const total = rows.reduce((a, r) => a + r.problems.length, 0);
  let y = 70;
  return (
    <div style={{position: 'absolute', inset: 0, background: EMBER.card}}>
      <svg width={1080} height={900} viewBox="0 0 1080 900" style={{position: 'absolute', left: 0, top: 0}}>
        <Txt x={40} y={y} size={44} anchor="start">{`light rigs: ${total} problem${total === 1 ? '' : 's'}`}</Txt>
        {rows.map((r) => {
          y += 64;
          const head = <Txt key={r.name} x={40} y={y} size={34} anchor="start">{`${r.name}: ${r.problems.length ? r.problems.length + ' problem(s)' : 'OK'}`}</Txt>;
          const lines = r.problems.slice(0, 4).map((p, i) => {
            y += 40;
            return (
              <Txt key={`${r.name}${i}`} x={70} y={y} size={24} anchor="start" fit={980}>
                {p}
              </Txt>
            );
          });
          return (
            <React.Fragment key={r.name}>
              {head}
              {lines}
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
};

// ================================================================= the compositions

const Frame: React.FC<{children?: React.ReactNode; x?: number}> = ({children, x = 0}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: x, top: 0}}>
    {children}
  </svg>
);

export const LightNookFrame: React.FC<{lit?: boolean}> = ({lit = true}) => (
  <div style={{position: 'absolute', inset: 0, background: EMBER.wall}}>
    <Frame>
      <LightNook lit={lit} />
    </Frame>
  </div>
);

export const LightStreetFrame: React.FC<{lit?: boolean}> = ({lit = true}) => (
  <div style={{position: 'absolute', inset: 0, background: EMBER.sky}}>
    <Frame>
      <LightStreet lit={lit} />
    </Frame>
  </div>
);

export const LightDemo: React.FC<{lit?: boolean}> = ({lit = true}) => (
  <div style={{position: 'absolute', inset: 0, background: EMBER.wall}}>
    <Frame>
      <LightNook lit={lit} />
    </Frame>
    <Frame x={1080}>
      <LightStreet lit={lit} />
    </Frame>
  </div>
);
