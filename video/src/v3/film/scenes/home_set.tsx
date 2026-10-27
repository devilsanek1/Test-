// home_set (SHARED PIECE, docs/v3/flow_v2.md §3; owner: the SQA pilot): THE HOME of video 3, the attic nook in POV at
// blue hour, first snow, extended to the right so one camera pans from the window (H1) to the chart card on the wall
// (J1, 5.15-6.45) and back (J2, 15.95-17.25). Keyed on FILM time: SQA, SQB and SQC draw it read-only and meet on the
// identical frame at their seams.
//
//   <HomeSet />                    the room + the window view under homeCam(T), lit by the nook rig (film time)
//   <HomeSet card={<MyChart />} /> SQB's chart on the card: drawn in H1 px, right after the card's paper (so it sits in
//                                  the room's ambient light like the card; CARD / PLOT / plotPt below)
//   homeCam(T)                     the shared camera: {x, y, z, zFar, room, far} (H1 px -> screen)
//
// THE CAMERA (flow_v2 §3): LOCKED through the hook (0-5.15; the first pilot's 1.05 -> 1.00 pull-out was a zoom in a
// hold, DIRECTION rule 8: every edge of the room crawled while the hook played); J1 pans x 0 -> -775 over 5.15-6.45, J2
// back over 15.95-17.25 (smoothstep: peak 14.9 px/f at 60 fps; room and outside together, a head turn has no
// parallax); the SQB hold between them floats (the cozy float, +-10 x 8 px, 8-12 px/s, from and back to home);
// everything else is locked. The thread plane (thread_plane.tsx) is screen-fixed in front of all of it.
// THE ROOM (H1 px = O1's framing at camera rest): the kit Nook ('pov': shelf cut by the left edge, the attic slope top
// right, ONE window glass 180-900 x 630-1060 with the mullion at 830, the desk from 1086, the anglepoise on the left);
// extended right: the wall, the slope above a horizontal tie beam (its bottom at y 285: the caption band below stays one
// flat value), the desk; THE CARD pinned right of the window (H1 px x 975-1715, y 612-1028; title, subtitle, axes, 2005
// and 2025 static, the chart itself is SQB's) and two flat notes beside it; calm desk dressing (tier C: no line, flat,
// low contrast; G5b's crumbs, mittens, candle, radio, planner, photos, star lantern, wall marks and desk grain dropped).
// THE OUTSIDE (far plane, clipped to the glass): the dusk sky, one far ridge, the town (flat houses with lit panes at
// the rig's window value), our neighbours' snowy roofs, THE AI DATA CENTER (tier B: tinted lines; the sign at 0.25; at
// 4.04 it goes dark, its sign lights cold white with a small pop and it is the subject; 4.16-4.53 its server rows light
// up one by one: the subject's own motion on "AI data centers"), falling snow (kept off the lit sign plate: a flake
// crossing the letters reads as a smudge), one chimney's smoke, lobed clouds drifting behind the data center (never a
// disc: a half-disc behind a building reads as a halo). Life is C: slow, small, low contrast (snow, smoke, the string
// lights' rare twinkle, the pothos, the steam).
// THE LIGHT (kit/Light.tsx, CRAFT §d): HOME_RIG = the nook rig (the lamp is the key, screen-left: its pool on the desk
// is LIT TERRACOTTA, keeping the desk's colour (ring L* 79 C* 42, core L* 84 C* 38, never a pale cream disc), contact
// shadows under everything that touches the desk, cast shadows only inside the pool, the headphones warm and lifted in
// the pool, a form shade on the side away from the lamp on every object (mug, pen cups, book stacks, the lamp's base,
// the headphones; the hand's is the thread plane's), ONE lamp wash on the shelf and the window's left reveal behind the
// lamp (a 2-step edge, below the caption band, cut at the desk's crease), the room one ambient step down outside the
// light, the slope / shelf cubbies / undersides a plane step down, the card's, the notes' and the pins' soft drop
// shadows falling AWAY from the lamp (right, a hair up), the lamp's mouth the brightest warm value). The outside keeps
// its own light (no Ambient stacked on it).
// FRAME 0 (T < 0.3, SQA wraps it in the pale colour cascade): every piece here lands as a flat shape before T 0 (the
// loop underlay: T -0.3 .. 0), the data center's tinted lines draw on from -0.15, the raw details (snow, server lights,
// string-light bulbs) appear from 0.08-0.3, as the colour floods in.
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {Tier} from '../../../lib/tier';
import {ease, prog, TimeProvider} from '../../../lib/time';
import {mat, type Mat, XG} from '../../../lib/xf';
import {
  BookStack,
  DataCenter,
  dataCenterGeo,
  EMBER,
  floatCam,
  FramedPrint,
  Headphones,
  Lamp,
  NightSky,
  Nook,
  NOOK_LAYOUT,
  Notebook,
  Mug,
  PenCup,
  Plant,
  Show,
  SkyClouds,
  Smoke,
  Snowfall,
  SnowTree,
  StringLights3,
  Txt,
  type LampPose,
  type Pt,
} from '../kit';
import {
  Ambient,
  CastShadow,
  ContactShadow,
  dropOffset,
  ellipseD,
  FormShade,
  LightPool,
  Lit,
  LitWindow,
  nookRig,
  PoolLift,
  polyD,
  rectD,
  Shade,
  Shadow,
  ShadowLayer,
  SourceCore,
  step,
  washHole,
  type Ellipse,
  type LightHole,
  type LightRig,
} from '../kit/Light';
import {Letters} from './O1_life';

/** Children see FILM time as useTime() (kit pieces key their beats on it, whatever sequence draws them). */
export const FilmClock: React.FC<{T: number; children?: React.ReactNode}> = ({T, children}) => (
  <TimeProvider global={T} offset={0}>
    {children}
  </TimeProvider>
);

// ================================================================= geometry (H1 px = canvas px at camera rest)

const NOOK = NOOK_LAYOUT.pov;
export const GLASS = NOOK.glass;
export const HORIZON = 950;
export const DC_AT = {x: 540, y: 952, w: 436};
/** The lamp (the key) and its pool on the desk: the Nook's own pose, the pool on CRAFT §d's ladder. */
export const LAMP: LampPose = NOOK.lamp;
export const POOL: Ellipse = NOOK.pool;
/** THE nook rig (CRAFT §d.1): every shot of the home reads it (the thread plane too). Its ambient step sits at the
 *  bright end of CRAFT §d.2's ladder (the wall 91 -> 84, the desk 68 -> 63, hue kept peach): the owner's "warm, never
 *  sickly" room stays warm. */
export const HOME_AMBIENT = '#F5E5DA';
/** The desk pool as LIT TERRACOTTA (SQA pilot review; CRAFT §d.7: "L* 82-85 at C* >= 36"): ring L* 79 C* 42 h 62, core
 *  L* 84 C* 38 h 70, both lighter (+16 / +21 over the ambient desk) and warmer than the desk (h 55), keeping its colour.
 *  The old ring #FFD7A4 / core #FFE8C1 (L* 88 / 93, C* 31 / 22) turned the terracotta into a pale cream disc that read as
 *  a placemat. The brightest 5 % of H1 is the phone's screen (and the card's paper in SQB), so the pool need not be. */
export const HOME_POOL: [string, string] = ['#FBB580', '#FFC78F'];
/** The lamp's ONE wash (CRAFT §d.7 room falloff): on the shelf and the window's left reveal behind the lamp, cut at the
 *  desk's crease (washHole), its top at y 838 (the caption band ends at 600). */
export const HOME_WASH: Ellipse = {cx: 190, cy: 1000, rx: 236, ry: 162};
export const HOME_RIG: LightRig = (() => {
  const r = nookRig({lamp: LAMP, pool: POOL, glass: GLASS}, {wash: HOME_WASH});
  return {...r, tints: {...r.tints, ambient: HOME_AMBIENT}, pool: HOME_POOL};
})();
/** The chart card on the wall right of the window (flow_v2 §3) and its plot box (SQB draws the line in it). */
export const CARD = {x: 975, y: 612, w: 740, h: 416};
/** The card's paper: a soft warm white (L* ~95), unlit (CRAFT §d.9): the brightest thing on the wall when the stage
 *  leads (SQB), and only a soft light strip at the frame's edge in H1. */
export const CARD_PAPER = '#FBF0E4';
export const PLOT = {x: CARD.x + 137, y: CARD.y + 150, w: CARD.w - 197, h: CARD.h - 232};
/** Plot units (u 0..1 = 2005..2026, v 0..1 bottom..top) -> H1 px. The year labels sit at u 0 (2005) and u 0.95 (2025). */
export const plotPt = ([u, v]: Pt): Pt => [PLOT.x + u * PLOT.w, PLOT.y + PLOT.h - v * PLOT.h];
export const YEAR_U = {y2005: 0, y2025: 0.95};
/** The deck line and the room's right extension (the pan's far end shows H1 x 775-1855). */
export const DESK_Y = NOOK.deskY;
const ROOM_X1 = 2200;
/** The attic: the Nook's slope (to x 1120) continues as a horizontal tie beam (y 259-285) with the slope above it. */
const SLOPE_K = 284 / 550;
const BEAM_TOP = -30 + 560 * SLOPE_K;
const BEAM_BOT = -4 + 560 * SLOPE_K;

// ================================================================= the camera

export const HOME_CENTER: Pt = [540, 960];
/** The hook's camera: LOCKED (z0 1.0; the first pilot's 1.05 -> 1.00 pull-out over 0-5.00 was a zoom in a hold). */
export const PULL = {t1: 5.0, z0: 1.0};
export const J1_PAN = {t0: 5.15, t1: 6.45, dx: -775};
export const J2_PAN = {t0: 15.95, t1: 17.25};
const FLOAT_SQB = {t0: J1_PAN.t1, t1: J2_PAN.t0};
const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

export type HomeCam = {x: number; y: number; z: number; zFar: number; room: Mat; far: Mat};

/** The home camera at film time T (H1 px -> screen): pull-out, the J1 / J2 pans, the SQB float. */
export function homeCam(T: number): HomeCam {
  const z = T <= 0 ? PULL.z0 : T >= PULL.t1 ? 1 : PULL.z0 - (PULL.z0 - 1) * ease.outCubic(T / PULL.t1);
  let x = 0;
  if (T >= J1_PAN.t0 && T < J2_PAN.t1) {
    if (T < J1_PAN.t1) x = J1_PAN.dx * smooth((T - J1_PAN.t0) / (J1_PAN.t1 - J1_PAN.t0));
    else if (T < J2_PAN.t0) x = J1_PAN.dx;
    else x = J1_PAN.dx * (1 - smooth((T - J2_PAN.t0) / (J2_PAN.t1 - J2_PAN.t0)));
  }
  let fx = 0;
  let fy = 0;
  if (T > FLOAT_SQB.t0 && T < FLOAT_SQB.t1) [fx, fy] = floatCam(T - FLOAT_SQB.t0, {dur: FLOAT_SQB.t1 - FLOAT_SQB.t0, seed: 'home/sqb', box: [10, 8]});
  const zFar = 1 + (z - 1) * 0.5;
  const about = (s: number) => mat.about(mat.scale(s), HOME_CENTER[0], HOME_CENTER[1]);
  const pan = mat.translate(x + fx, fy);
  return {x: x + fx, y: fy, z, zFar, room: mat.mul(pan, about(z)), far: mat.mul(pan, about(zFar))};
}

// ================================================================= the outside (far plane, H1 px)

const SKY_BOX: [number, number, number, number] = [GLASS.x - 40, GLASS.y - 40, GLASS.w + 80, GLASS.h + 80];
const RIDGE = '#4E5B88';
const RIDGE_HOUSE = '#46527E';
/** The ridge's top line (x -> y) and the tiny houses standing on it: [x, w, lit]. */
const RIDGE_PTS: Pt[] = [[140, 918], [230, 906], [330, 922], [430, 900], [520, 914], [640, 896], [760, 912], [860, 902], [940, 914]];
const RIDGE_Y = (x: number) => {
  for (let i = 1; i < RIDGE_PTS.length; i++) {
    const [x0, y0] = RIDGE_PTS[i - 1];
    const [x1, y1] = RIDGE_PTS[i];
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0) + 3;
  }
  return RIDGE_PTS[RIDGE_PTS.length - 1][1] + 3;
};
const FAR_ROW: [number, number, boolean][] = [
  [178, 26, true],
  [206, 22, false],
  [232, 28, true],
  [262, 24, false],
  [292, 26, true],
  [764, 24, true],
  [790, 28, false],
  [820, 24, true],
  [848, 26, false],
  [876, 22, true],
];
const ROOF = EMBER.roofs;
const NEAR_HOUSE = '#3E4870';

/** A far house: a flat body and roof, a snow cap, lit panes at the rig's window value (exact, never recoloured). */
const FarHouse: React.FC<{x: number; w: number; y: number; h?: number; pitch?: number; lit?: [number, number][]; at?: number; color?: string; chimney?: boolean}> = ({x, w, y, h = w * 0.62, pitch = 0.4, lit = [], at, color = ROOF, chimney}) => {
  const eave = y - h;
  const peak = eave - w * pitch;
  const pk = x + w / 2;
  const body: Pt[] = [[x, y + 2], [x, eave], [x - w * 0.06, eave + 2], [pk, peak], [x + w * 1.06, eave + 2], [x + w, eave], [x + w, y + 2]];
  const cap: Pt[] = [[x - w * 0.09, eave + 3], [pk, peak - w * 0.06], [x + w * 1.09, eave + 3], [x + w * 1.02, eave + w * 0.08], [pk, peak + w * 0.05], [x - w * 0.02, eave + w * 0.08]];
  const ch: Pt[] = [[x + w * 0.66, peak + w * 0.14], [x + w * 0.66, peak - w * 0.02], [x + w * 0.79, peak - w * 0.02], [x + w * 0.79, peak + w * 0.24]];
  return (
    <>
      {chimney ? <Fill d={polyD(ch)} color={color} at={at} offset={false} /> : null}
      <Fill d={polyD(body)} color={color} at={at} offset={false} />
      <Fill d={polyD(cap)} color={EMBER.snow} at={at === undefined ? undefined : at + 0.03} offset={false} />
      {lit.map(([u, v], i) => (
        <LitWindow key={i} rect={[x + w * u, eave + h * v, w * 0.16, h * 0.26]} at={at === undefined ? undefined : at + 0.05} />
      ))}
    </>
  );
};

/** THE AI data center: the sign pops at 0.25; at 4.04 it goes dark, its sign lights cold white with a small pop, and
 *  it is the beat's subject (its outline the full subject line); before, it is support (tinted lines). */
export const DC_SIGN_AT = 0.25;
/** The server lights: a soft cold value (a quiet texture under the sign, never a field of bright dashes). */
export const DC_LED = '#A8B6DE';
export const DC_DARK_AT = 4.04;
/** 4.16-4.53: the dark building's server rows light up one by one, after the sign's pop (rows OFF from 4.04). */
export const DC_ROWS_ON = {at: 4.16, dur: 0.4};
const HomeDataCenter: React.FC<{T: number}> = ({T}) => {
  const k = T >= DC_DARK_AT ? Math.sin(Math.PI * prog(T, DC_DARK_AT, 0.2, ease.linear)) : 0;
  const s = 1 + 0.045 * k;
  const body = (
    <DataCenter
      x={DC_AT.x}
      y={DC_AT.y}
      w={DC_AT.w}
      variant="normal"
      sign="AI DATA CENTER"
      signAt={DC_SIGN_AT}
      darkAt={DC_DARK_AT}
      signLitAt={DC_DARK_AT}
      at={-0.15}
      seed="home/dc"
      ledColor={DC_LED}
      ledStyle="bands"
      rowsOn={DC_ROWS_ON}
      tier={T >= DC_DARK_AT ? 'subject' : 'support'}
    />
  );
  return s > 1.0005 ? <XG m={mat.about(mat.scale(s), DC_AT.x, DC_AT.y)}>{body}</XG> : body;
};

/** The data center's sign plate (H1 px) grown by a margin (its 4.04 pop scales it x1.045): falling snow stays off it. */
const SIGN_PLATE = (() => {
  const g = dataCenterGeo(DC_AT.x, DC_AT.y, DC_AT.w).sign;
  const m = 14;
  return rectD(g.x - m, g.y - m, g.w + m * 2, g.h + m * 2);
})();
/** The snow's clip: the sky box minus the sign plate (even-odd). */
const SNOW_CLIP = rectD(-400, -400, 2000, 2400) + SIGN_PLATE;

/** Falling snow in the glass, kept off the lit sign plate (a grey flake crossing the letters reads as a smudge). */
const HomeSnow: React.FC = () => {
  const id = 'homesnow' + React.useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={SNOW_CLIP} clipRule="evenodd" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <Snowfall x={GLASS.x} y={GLASS.y} w={GLASS.w} h={GLASS.h} n={18} size={0.75} speed={0.6} seed="home/snow" at={0.18} />
        {/* a nearer, slower-looking layer of bigger flakes (still small, low contrast on the sky) */}
        <Snowfall x={GLASS.x} y={GLASS.y} w={GLASS.w} h={GLASS.h} n={8} size={1.6} speed={0.85} seed="home/snowNear" at={0.22} />
      </g>
    </>
  );
};

/** The view through the window (far plane, H1 px): exported for any shot that hangs the same window. */
export const HomeOutside: React.FC<{T: number}> = ({T}) => (
  <Tier tier="environment" bg={EMBER.sky}>
    <NightSky x={SKY_BOX[0]} y={SKY_BOX[1]} w={SKY_BOX[2]} h={SKY_BOX[3]} at={-0.5} />
    {/* one far ridge along the horizon (a flat step under the sky) */}
    <Fill d={polyD([[GLASS.x - 40, HORIZON + 4], [GLASS.x - 40, 918], [230, 906], [330, 922], [430, 900], [520, 914], [640, 896], [760, 912], [860, 902], [GLASS.x + GLASS.w + 40, 914], [GLASS.x + GLASS.w + 40, HORIZON + 4]])} color={RIDGE} at={-0.46} offset={false} />
    <Fill rect={[GLASS.x - 40, HORIZON, GLASS.w + 80, GLASS.y + GLASS.h - HORIZON + 40]} color={EMBER.snow} at={-0.44} offset={false} mode="snap" />
    {/* the far town along the ridge: a row of tiny houses with a few lit panes (flat, far, calm) */}
    {FAR_ROW.map(([x, w, lit], i) => (
      <FarHouse key={i} x={x} w={w} y={RIDGE_Y(x + w / 2)} h={w * 0.6} pitch={0.36} color={RIDGE_HOUSE} lit={lit ? [[0.42, 0.34]] : []} at={-0.43} />
    ))}
    {/* the town on the horizon: left of the data center, then right of it */}
    <FarHouse x={190} w={58} y={HORIZON + 2} lit={[[0.22, 0.3]]} at={-0.42} />
    <FarHouse x={250} w={64} y={HORIZON + 2} h={56} lit={[[0.56, 0.36]]} chimney at={-0.41} />
    <SnowTree x={326} y={HORIZON + 4} h={92} kind="pine" far seed="home/pine1" at={-0.4} />
    <FarHouse x={772} w={56} y={HORIZON + 2} h={82} pitch={0.2} lit={[[0.18, 0.2], [0.6, 0.55]]} at={-0.42} />
    <FarHouse x={836} w={62} y={HORIZON + 2} lit={[[0.4, 0.34]]} chimney at={-0.41} />
    <SnowTree x={758} y={HORIZON + 4} h={70} kind="pine" far seed="home/pine2" at={-0.4} />
    {/* a slow cloud band behind the data center (visible either side of it), a lighter flat step of the sky */}
    <Show at={0.15}>
      <SkyClouds x0={GLASS.x - 260} x1={GLASS.x + GLASS.w + 260} y0={640} y1={790} n={3} w={[240, 420]} speed={7} color="#67769F" seed="home/clouds" shape="lobed" />
    </Show>
    <HomeDataCenter T={T} />
    {/* one window lights up (a neighbour home: 1.05, in the hook's quiet stretch) */}
    <LitWindow rect={[836 + 62 * 0.66, HORIZON + 2 - 62 * 0.62 + 62 * 0.62 * 0.36, 62 * 0.16, 62 * 0.62 * 0.26]} at={1.05} />
    {/* the nearest houses down our street (in front of the horizon, behind the sill): small, a lit pane each */}
    <FarHouse x={186} w={76} y={1054} h={46} pitch={0.32} color={NEAR_HOUSE} lit={[[0.58, 0.3]]} at={-0.38} />
    <FarHouse x={772} w={70} y={1050} h={46} pitch={0.32} color={NEAR_HOUSE} lit={[[0.24, 0.3]]} at={-0.38} />
    <FarHouse x={848} w={64} y={1056} h={44} pitch={0.34} color={NEAR_HOUSE} lit={[[0.56, 0.32]]} chimney at={-0.38} />
    {/* one chimney's smoke drifting right (slow, low contrast) */}
    <Smoke x={250 + 64 * 0.725} y={HORIZON + 2 - 56 - 64 * 0.4 - 4} seed="home/smoke" at={0.2} ceil={640} r1={15} rise={120} drift={-70} />
    <HomeSnow />
  </Tier>
);

// ================================================================= the room

/** The room's right extension (drawn after the Nook): the wall, the slope above the tie beam, the desk. */
const RoomRight: React.FC = () => (
  <>
    <Fill rect={[1270, -200, ROOM_X1 - 1270 + 200, DESK_Y + 200]} color={EMBER.wall} at={-0.5} mode="snap" offset={false} />
    <Fill d={polyD([[1100, -60], [ROOM_X1 + 200, -60], [ROOM_X1 + 200, BEAM_TOP], [1100, BEAM_TOP]])} color={EMBER.slope} at={-0.48} offset={false} />
    <Fill d={polyD([[1112, BEAM_TOP], [ROOM_X1 + 200, BEAM_TOP], [ROOM_X1 + 200, BEAM_BOT], [1120, BEAM_BOT]])} color={EMBER.beam} at={-0.46} offset={false} />
    <Fill rect={[1100, DESK_Y, ROOM_X1 - 1100 + 200, 1000]} color={EMBER.desk} at={-0.47} offset={false} />
  </>
);

/** Reading glasses lying on the desk: warm amber lenses (a cool lens would turn grey under the room's warm ambient
 *  step: CRAFT §d.3), the frame as one hairline thing. */
const WarmGlasses: React.FC<{x: number; y: number; w: number; rot: number; at?: number}> = ({x, y, w, rot, at}) => {
  const r = w * 0.22;
  const lens = (cx: number) => ellipseD({cx, cy: y, rx: r, ry: r * 0.8});
  const frame = lens(x - w * 0.27) + lens(x + w * 0.27) + `M${x - w * 0.06} ${y - r * 0.2}Q${x} ${y - r * 0.5} ${x + w * 0.06} ${y - r * 0.2}M${x - w * 0.48} ${y - r * 0.3}L${x - w * 0.3} ${y - r * 1.1}M${x + w * 0.48} ${y - r * 0.3}L${x + w * 0.3} ${y - r * 1.1}`;
  return (
    <XG m={mat.about(mat.rotate(rot), x, y)}>
      <Fill d={lens(x - w * 0.27) + lens(x + w * 0.27)} color="#F3D9BC" at={at} offset={false} />
      <Ink thing d={frame} at={at} width={1.6} color="#8A5A44" />
    </XG>
  );
};

/** A plate with three biscuits (flat, no line, no crumbs). */
const Biscuits: React.FC<{x: number; y: number; at?: number}> = ({x, y, at}) => (
  <>
    <Fill d={ellipseD({cx: x, cy: y, rx: 72, ry: 22})} color={EMBER.card} at={at} offset={false} />
    <Fill d={ellipseD({cx: x, cy: y - 2, rx: 52, ry: 14})} color={EMBER.paper} at={at} offset={false} />
    {([[-24, -6, 20], [18, -2, 19], [-2, -16, 18]] as [number, number, number][]).map(([dx, dy, r], i) => (
      <Fill key={i} d={ellipseD({cx: x + dx, cy: y + dy, rx: r, ry: r * 0.6})} color={EMBER.books[6]} at={at} offset={false} />
    ))}
  </>
);

/** A closed book lying flat (rotated about its centre): the cover, the page block's edge, a ribbon. */
const DeskBook: React.FC<(typeof DESK_BOOKS)[number] & {at?: number}> = ({x, y, w, h, rot, color, at}) => (
  <XG m={mat.about(mat.rotate(rot), x + w / 2, y + h / 2)}>
    <Fill d={`M${x + 8} ${y}H${x + w - 8}Q${x + w} ${y} ${x + w} ${y + 8}V${y + h - 8}Q${x + w} ${y + h} ${x + w - 8} ${y + h}H${x + 8}Q${x} ${y + h} ${x} ${y + h - 8}V${y + 8}Q${x} ${y} ${x + 8} ${y}Z`} color={color} at={at} offset={false} />
    <Fill rect={[x + 10, y + h - 2, w - 20, 12]} color={EMBER.paper} at={at} offset={false} />
    <Fill rect={[x + w * 0.72, y + h - 4, 12, 30]} color={EMBER.mugBand} at={at} offset={false} />
  </XG>
);

/** A roof window in the slope over the card wall (H1 px; seen in SQB's framing): the night sky in it, a snow edge. */
const SKY_PANE: Pt[] = [[1318, 52], [1502, 52], [1522, 214], [1298, 214]];
const SKY_FRAME: Pt[] = [[1296, 30], [1524, 30], [1548, 236], [1272, 236]];
const Skylight: React.FC = () => (
  <>
    <Fill d={polyD(SKY_FRAME)} color={EMBER.reveal} at={-0.44} offset={false} />
    <Tier tier="environment" bg={EMBER.sky}>
      <Fill d={polyD(SKY_PANE)} color={EMBER.sky} at={-0.42} offset={false} />
      <Fill d={polyD([[1300, 200], [1520, 200], [1522, 214], [1298, 214]])} color={EMBER.snow} at={-0.4} offset={false} />
    </Tier>
    <Show at={0.3}>
      {([[1360, 96, 2.6], [1452, 76, 2], [1418, 150, 2.2]] as [number, number, number][]).map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={EMBER.snow} />
      ))}
    </Show>
  </>
);

/** The card's static face (title, subtitle, axes, the two years): the chart on it is SQB's. */
const CardFace: React.FC = () => {
  const P = PLOT;
  const axes = `M${P.x} ${P.y - 12}L${P.x} ${P.y + P.h}L${P.x + P.w + 18} ${P.y + P.h}`;
  return (
    <Show at={0.24}>
      <Txt x={CARD.x + CARD.w / 2} y={CARD.y + 74} size={58} fit={CARD.w * 0.86}>
        US computer prices
      </Txt>
      <Txt x={CARD.x + CARD.w / 2} y={CARD.y + 118} size={34} fill="#6E4A3A" fit={CARD.w * 0.8}>
        same computing power
      </Txt>
      <path d={axes} fill="none" stroke="#4B2A1E" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <Txt x={plotPt([YEAR_U.y2005, 0])[0]} y={P.y + P.h + 44} size={32} fill="#6E4A3A">
        2005
      </Txt>
      <Txt x={plotPt([YEAR_U.y2025, 0])[0]} y={P.y + P.h + 44} size={32} fill="#6E4A3A">
        2025
      </Txt>
    </Show>
  );
};

const PINS: Pt[] = [
  [CARD.x + 44, CARD.y + 20],
  [CARD.x + CARD.w - 44, CARD.y + 20],
];
/** Two flat notes on the wall right of the card (tier C: flat, no line). */
const NOTES: {x: number; y: number; w: number; h: number; rot: number; color: string; inner?: string}[] = [
  {x: 1748, y: 640, w: 86, h: 86, rot: 5, color: '#F3C98F'},
  {x: 1742, y: 770, w: 124, h: 84, rot: -4, color: EMBER.card, inner: '#EDC4A6'},
];
const noteD = (n: (typeof NOTES)[number]) => {
  const c: Pt = [n.x + n.w / 2, n.y + n.h / 2];
  const a = (n.rot * Math.PI) / 180;
  const pts: Pt[] = [[n.x, n.y], [n.x + n.w, n.y], [n.x + n.w, n.y + n.h], [n.x, n.y + n.h]].map(([px, py]) => {
    const dx = px - c[0];
    const dy = py - c[1];
    return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)] as Pt;
  });
  return polyD(pts);
};

// ---- the desk dressing (H1 px): left in the lamp's pool, right outside it, a few things on the extension

const HEAD = {x: 150, y: 1252, w: 150};
const CACTUS = {x: 78, y: 1488};
const LETTERS = {x: 226, y: 1452};
const MUG = {x: 872, top: 1130, w: 92};
const BOOKS_R = {x: 968, y: 1206, w: 128};
const PENS = {x: 1052, y: 1150, w: 50};
const GLASSES = {x: 902, y: 1444, w: 110};
const PLATE = {x: 112, y: 1352};
const SILL_PLANT = {x: 912, y: 1062};
const SNAKE = {x: 1806, y: 1214, size: 214};
const BOOKS_X = {x: 1560, y: 1212, w: 146};
/** Two closed books lying on the desk's front (flat: a cover, the page block, a ribbon): one right of the phone in
 *  H1 (under the thumb's reach), one on the extension (SQB's right). */
const DESK_BOOKS: {x: number; y: number; w: number; h: number; rot: number; color: string}[] = [
  {x: 820, y: 1596, w: 250, h: 180, rot: -8, color: EMBER.books[2]},
  {x: 1590, y: 1420, w: 220, h: 160, rot: 6, color: EMBER.books[1]},
];
const PENS_X = {x: 1214, y: 1206, w: 54};
const BOOKS_P = {x: 1300, y: 1208, w: 132};

/** The headphones' warm red-brown (a cool navy band was the pool's darkest thing, L* 25, and greyed in the light):
 *  after the environment tier's pull ~L* 54 C* 28, lifted +6..11 in the pool. */
const HEAD_COLOR = '#A85A4E';
/** The piece that lies LIT in the pool (its silhouette, band included, is an Ambient hole; it gets form + cast shadows
 *  and the pool's lift). */
const headphones = <Headphones x={HEAD.x} y={HEAD.y} w={HEAD.w} seed="home/hp" at={0.02} color={HEAD_COLOR} bandFill />;
/** The desk things with a form shade on the side away from the lamp (CRAFT §d.4; the lamp is screen-left, so the
 *  shade is their right side): elements shared by the drawing and its FormShade. */
const pens = <PenCup x={PENS.x} y={PENS.y + 10} w={PENS.w} seed="home/pens" at={-0.36} />;
const pensX = <PenCup x={PENS_X.x} y={PENS_X.y} w={PENS_X.w} seed="home/pensX" at={-0.36} />;
const booksR = <BookStack x={BOOKS_R.x} y={BOOKS_R.y} w={BOOKS_R.w} n={2} seed="home/booksR" at={-0.37} />;
const booksX = <BookStack x={BOOKS_X.x} y={BOOKS_X.y} w={BOOKS_X.w} n={3} seed="home/booksX" at={-0.36} />;
const booksP = <BookStack x={BOOKS_P.x} y={BOOKS_P.y} w={BOOKS_P.w} n={2} seed="home/booksP" at={-0.36} />;
const cactus = <Plant x={CACTUS.x} y={CACTUS.y} kind="cactus" size={70} seed="home/cactus" at={-0.36} />;
const snake = <Plant x={SNAKE.x} y={SNAKE.y} kind="snake" size={SNAKE.size} seed="home/snake" at={-0.36} />;
/** [element, centre, size] of each shaded desk thing (a pen cup's centre and height include its body only). */
const FORMS: [React.ReactNode, Pt, [number, number]][] = [
  [pens, [PENS.x, PENS.y + 10 - PENS.w * 0.575], [PENS.w, PENS.w * 1.15]],
  [pensX, [PENS_X.x, PENS_X.y - PENS_X.w * 0.575], [PENS_X.w, PENS_X.w * 1.15]],
  [booksR, [BOOKS_R.x + BOOKS_R.w / 2, BOOKS_R.y - 21], [BOOKS_R.w, 42]],
  [booksX, [BOOKS_X.x + BOOKS_X.w / 2, BOOKS_X.y - 32], [BOOKS_X.w, 63]],
  [booksP, [BOOKS_P.x + BOOKS_P.w / 2, BOOKS_P.y - 21], [BOOKS_P.w, 42]],
  [cactus, [CACTUS.x, CACTUS.y - 40], [30, 80]],
  [snake, [SNAKE.x, SNAKE.y - SNAKE.size * 0.4], [SNAKE.size * 0.4, SNAKE.size * 0.8]],
];
/** The lamp's base on the desk (inside the pool, right of the mouth): its shade side is its right. */
const LAMP_BASE_D = ellipseD({cx: LAMP.base[0], cy: LAMP.base[1], rx: 56, ry: 15});

const NOOK_AT = -0.5;
const NO_POOL: Ellipse = {cx: POOL.cx, cy: POOL.cy, rx: 0.5, ry: 0.5};
const NOOK_LAYOUT_HOME = {pool: NO_POOL, mug: null, notebook: false, desk: {x0: -60, x1: 1140}, shelf: {...NOOK.shelf!, plant: undefined}};
/** The room's planes turned from the lamp (CRAFT §d.7 falloff by planes): the attic slope (+ its extension), the
 *  shelf's upper cubbies, the board undersides (the demo's numbers: kit/KitSheetLight.tsx). */
const SLOPE_SHADE = polyD([[560, -60], [1120, -60], [1120, -30 + 560 * SLOPE_K]]);
/** The slope over the right extension (seen in SQB's framing): its own shape, so frame 0's colour wave reaches each part
 *  by its own centre (one shape spanning both landed its shade at 0.33 s, after everything else). */
const SLOPE_SHADE_X = polyD([[1120, -60], [ROOM_X1 + 200, -60], [ROOM_X1 + 200, BEAM_TOP], [1120, BEAM_TOP]]);
const SHELF_X1 = 116;
const CUBBIES = [[-30, -30, SHELF_X1 + 30, 298], [-30, 284, SHELF_X1 + 30, 300], [-30, 600, SHELF_X1 + 30, 256]].map((r) => rectD(r[0], r[1], r[2], r[3])).join('');
const UNDERSIDES = [284, 600, 872].map((y) => rectD(-30, y, SHELF_X1 + 30, 9)).join('');
const AMBIENT_REGION: [number, number, number, number] = [-600, -600, ROOM_X1 + 1000, 3200];
/** The card's drop shadow: 7 px away from the lamp (dropOffset: right, a hair up). */
const CARD_DROP = dropOffset(HOME_RIG, [CARD.x + CARD.w / 2, CARD.y + CARD.h / 2], 7);
/** The Ambient's holes, in order: the lamp's wash (a 2-step edge, cut at the desk's crease), the glass (the mullion
 *  painted back), the skylight, the card, the pool, the headphones lying lit in it. */
const AMBIENT_HOLES: LightHole[] = [
  ...[washHole(HOME_RIG, DESK_Y)].filter((h): h is LightHole => h !== null),
  {rect: [GLASS.x, GLASS.y, GLASS.w, GLASS.h]},
  {rect: [NOOK.mullionX - 7, GLASS.y, 14, GLASS.h], kind: 'dark'},
  {d: polyD(SKY_PANE)},
  {rect: [CARD.x, CARD.y, CARD.w, CARD.h]},
  {e: POOL},
  {of: headphones},
];
/** A clip path that keeps everything OUTSIDE a closed polygon path (a drop shadow falls on the wall, never on the
 *  card or note that casts it): the region's rect, then the shape reversed (a hole under the nonzero rule). */
function outside(d: string): string {
  const pts = d.replace(/Z$/, '').slice(1).split('L').map((p) => p.trim().split(/\s+/).map(Number) as Pt);
  const rev = pts.slice().reverse();
  const [x, y, w, h] = AMBIENT_REGION;
  return rectD(x, y, w, h) + polyD(rev);
}

export type HomeRoomProps = {
  T: number;
  cam: HomeCam;
  /** SQB's chart (H1 px), drawn on the card right after its paper. */
  card?: React.ReactNode;
  /** Anything else in the room plane, before the light (a lane's own prop on the desk). */
  room?: React.ReactNode;
};

/** The room plane (H1 px, inside the room camera): the set, then its light. */
export const HomeRoom: React.FC<HomeRoomProps> = ({T, cam, card, room}) => {
  const mug = <Mug x={MUG.x} top={MUG.top} w={MUG.w} seed="home/mug" at={-0.38} />;
  return (
    <>
      <Nook variant="pov" at={NOOK_AT} seed="home/nook" layout={NOOK_LAYOUT_HOME}>
        <XG m={mat.mul(mat.inv(cam.room), cam.far)}>
          <HomeOutside T={T} />
        </XG>
      </Nook>
      <Tier tier="environment">
        <RoomRight />
        <Skylight />
        {/* the top band: one print, the string lights along the slope (no glow discs) */}
        <FramedPrint x={430} y={40} w={84} h={100} picture="sun" seed="home/print" at={-0.4} />
        <FramedPrint x={330} y={84} w={66} h={82} picture="leaf" seed="home/print2" at={-0.4} />
        <StringLights3 points={[[574, 8], [744, 96], [904, 180], [1090, 262]]} sag={18} n={10} r={7} every={1.6} halo={false} seed="home/lights" at={0.18} />
      </Tier>
      {/* the card (paper, exact) and the notes on the wall */}
      {/* the card's paper and pins keep their exact colours (the subject tier recolours nothing) */}
      <Tier tier="subject">
        <Fill rect={[CARD.x, CARD.y, CARD.w, CARD.h]} color={CARD_PAPER} at={-0.4} offset={false} />
        {PINS.map(([x, y], i) => (
          <Fill key={i} d={ellipseD({cx: x, cy: y, rx: 9, ry: 9})} color={EMBER.beam} at={-0.3} offset={false} />
        ))}
      </Tier>
      <CardFace />
      {card}
      {NOTES.map((n, i) => (
        <React.Fragment key={i}>
          <Fill d={noteD(n)} color={n.color} at={-0.36} offset={false} />
          {n.inner ? <Fill d={noteD({...n, x: n.x + 10, y: n.y + 10, w: n.w - 20, h: n.h - 30})} color={n.inner} at={-0.34} offset={false} /> : null}
        </React.Fragment>
      ))}
      {/* the light: the pool on the desk, then the ground shadows, then the things standing on the desk */}
      <LightPool />
      <ShadowLayer>
        <ContactShadow x={600} y={DESK_Y} w={ROOM_X1 + 200} d={rectD(-80, DESK_Y, ROOM_X1 + 300, 6)} tint="cast" away={0} />
        <ContactShadow x={LAMP.base[0]} y={LAMP.base[1] + 8} w={112} h={12} />
        <ContactShadow x={HEAD.x - HEAD.w * 0.38} y={HEAD.y} w={HEAD.w * 0.26} h={8} />
        <ContactShadow x={HEAD.x + HEAD.w * 0.38} y={HEAD.y} w={HEAD.w * 0.26} h={8} />
        <CastShadow x={HEAD.x} y={HEAD.y - 4} w={HEAD.w * 0.9} depth={10} h={HEAD.w * 0.5} />
        <ContactShadow x={CACTUS.x} y={CACTUS.y} w={52} h={9} />
        <ContactShadow x={LETTERS.x + 6} y={LETTERS.y + 70} w={150} h={8} />
        <ContactShadow x={150} y={1730} w={400} d={polyD([[-64, 1594], [356, 1600], [352, 1860], [-54, 1858]])} away={5} />
        <ContactShadow x={MUG.x + MUG.w / 2} y={MUG.top + MUG.w * 1.14} w={MUG.w} />
        <ContactShadow x={BOOKS_R.x + BOOKS_R.w / 2} y={BOOKS_R.y} w={BOOKS_R.w} h={10} />
        <ContactShadow x={GLASSES.x} y={GLASSES.y + 6} w={GLASSES.w} h={7} />
        <ContactShadow x={PLATE.x} y={PLATE.y + 8} w={150} h={10} />
        <ContactShadow x={SILL_PLANT.x} y={SILL_PLANT.y} w={30} h={6} />
        <ContactShadow x={SNAKE.x} y={SNAKE.y} w={SNAKE.size * 0.38} h={10} />
        <ContactShadow x={BOOKS_X.x + BOOKS_X.w / 2} y={BOOKS_X.y} w={BOOKS_X.w} h={10} />
        <ContactShadow x={PENS_X.x} y={PENS_X.y} w={PENS_X.w} h={8} />
        <ContactShadow x={BOOKS_P.x + BOOKS_P.w / 2} y={BOOKS_P.y} w={BOOKS_P.w} h={10} />
        {DESK_BOOKS.map((bk, i) => (
          <Shadow key={i} d={rectD(bk.x, bk.y + 6, bk.w, bk.h + 6)} dx={3} dy={5} soft={3} tint="contact" />
        ))}
      </ShadowLayer>
      <Tier tier="environment">
        {headphones}
        {cactus}
        <Biscuits x={PLATE.x} y={PLATE.y} at={-0.36} />
        <Plant x={SILL_PLANT.x} y={SILL_PLANT.y} kind="succulent" size={42} seed="home/sillsu" at={-0.36} />
        <Letters x={LETTERS.x} y={LETTERS.y} at={-0.36} />
        <Notebook seed="home/nb" at={-0.4} />
        {mug}
        {booksR}
        {pens}
        <WarmGlasses x={GLASSES.x} y={GLASSES.y} w={GLASSES.w} rot={-10} at={-0.36} />
        {snake}
        {booksX}
        {pensX}
        {booksP}
        {DESK_BOOKS.map((bk, i) => (
          <DeskBook key={i} {...bk} at={-0.34} />
        ))}
        <Lamp pose={LAMP} lit at={NOOK_AT + 0.08} seed="home/nook" />
      </Tier>
      {room}
      {/* form: one step on the side away from the lamp, on the lit things in the pool and every desk thing; the planes
          turned from the lamp */}
      <FormShade of={headphones} c={[HEAD.x, HEAD.y - HEAD.w * 0.25]} size={[HEAD.w, HEAD.w * 0.5]} />
      <FormShade d={LAMP_BASE_D} />
      <FormShade of={mug} c={[MUG.x + MUG.w / 2, MUG.top + MUG.w * 0.57]} size={[MUG.w, MUG.w * 1.14]} />
      {FORMS.map(([el, c, size], i) => (
        <FormShade key={i} of={el} c={c} size={size} />
      ))}
      <Shade d={SLOPE_SHADE} />
      <Shade d={SLOPE_SHADE_X} />
      <Shade d={CUBBIES} />
      <Shade d={UNDERSIDES} tint="cast" />
      {/* the card and the notes stand a hair off the wall: soft drop shadows falling AWAY from the lamp (it is low on
          the left: right and a hair up), the pins' too */}
      <Shadow d={rectD(CARD.x, CARD.y, CARD.w, CARD.h)} dx={CARD_DROP[0]} dy={CARD_DROP[1]} soft={4} tint="form" clip={outside(rectD(CARD.x, CARD.y, CARD.w, CARD.h))} />
      {NOTES.map((n, i) => {
        const o = dropOffset(HOME_RIG, [n.x + n.w / 2, n.y + n.h / 2], 5);
        return <Shadow key={i} d={noteD(n)} dx={o[0]} dy={o[1]} soft={3} tint="form" clip={outside(noteD(n))} />;
      })}
      {PINS.map(([x, y], i) => {
        const o = dropOffset(HOME_RIG, [x, y], 5);
        return <Shadow key={i} d={ellipseD({cx: x, cy: y, rx: 9, ry: 9})} dx={o[0]} dy={o[1]} soft={2} />;
      })}
      {/* the room one step down outside the light: the lamp's wash on the shelf behind it, the glass, the pool and
          what stands lit in it keep their light */}
      <Ambient tint={ambientTint(T)} region={AMBIENT_REGION} holes={AMBIENT_HOLES} />
      {/* the headphones lie IN the pool: lifted +6..11 L* (a screen of the rig's lift, clipped to the pool) */}
      <PoolLift of={headphones} c={[HEAD.x, HEAD.y - HEAD.w * 0.25]} />
      <XG m={mat.compose(mat.translate(LAMP.head[0], LAMP.head[1]), mat.rotate(LAMP.rot))}>
        <SourceCore d={ellipseD({cx: 0, cy: 100, rx: 64, ry: 12})} />
      </XG>
    </>
  );
};

/** The light's arrival on frame 0: no light layer before LIGHT_ON (the pale underlay), then each shadow and the pool
 *  as the colour wave reaches them, and the room's ambient step in two flat steps (half at 0.16, full at 0.30: "the
 *  room settles into the lamp light"; never a fade). */
export const LIGHT_ON = 0.08;
export const AMBIENT_STEPS: [number, number] = [0.16, 0.3];
/** The ambient tint at film time T (null = none yet). */
export function ambientTint(T: number): string | undefined {
  if (T >= AMBIENT_STEPS[1]) return HOME_RIG.tints.ambient;
  if (T >= AMBIENT_STEPS[0]) return step(HOME_RIG.tints.ambient, 0.5);
  return '#FFFFFF';
}

export type HomeSetProps = {
  /** Film seconds (default: the caller's film time; pass useFilmTime()). */
  T: number;
  card?: React.ReactNode;
  room?: React.ReactNode;
};

/** THE HOME at film time T: the room + the window view under homeCam(T), lit by HOME_RIG. Draw it first inside the
 *  sequence's <World>, then the thread plane (screen space) on top. */
export const HomeSet: React.FC<HomeSetProps> = ({T, card, room}) => {
  const cam = homeCam(T);
  return (
    <FilmClock T={T}>
      <Lit rig={HOME_RIG} off={T < LIGHT_ON}>
        <XG m={cam.room}>
          <HomeRoom T={T} cam={cam} card={card} room={room} />
        </XG>
      </Lit>
    </FilmClock>
  );
};
