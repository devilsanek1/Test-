/**
 * K2 MAP CONTRACT, video 2 "One Small Window" (docs/v2/TREATMENT.md sections 2-5 and 9). README: ./README.md.
 *
 * THE one source of truth every lane (L1-L7) and kit (K3-K7) builds to: the map, the shared spots, the shot clock,
 * the S1 scale sheet, the ghost row, Pip's seats and beats, every cut's match point, the legibility floor and the UI
 * zones. NUMBERS ONLY: nothing here draws and nothing here imports (pure TS, usable from node QA scripts). Colour
 * values appear only where a spec needs them and mirror K1 (`src/v2r/palette.ts` owns every token, the ink weights
 * included: `INK_PX`, `CM.ghostHead`, `SHOT_LIGHT`).
 *
 * CONVENTIONS (read before using a number):
 *  - Units: px in the 1080 x 1920 frame; seconds of the voice clock (`public/v2/voice.wav`, 39.08 s). Frame = round(t * 60).
 *  - `Spot` = CENTRE + size (W, W2, the S2 windows). `Rect` = edges x0..x1, y0..y1 (boards, zones). `Disc` = centre + r.
 *    `Seat` = Pip's BASE-CENTRE (where its soles / bottom touch the prop); Pip extends UP from it (86-120 px).
 *    `Fig` = a standing / seated figure: x = centre, feetY = sole line, h = full height (head top = feetY - h).
 *  - "y <= 600" in the treatment means "no higher on screen than y 600" (top edge at y >= 600). Same reading here.
 *  - Positions are SCREEN positions at each shot's `pose` moment (SHOTS[i].pose, POSE_T). `shotShapes(id, t)` maps
 *    them through the shot's camera (anchors and endpoints are contract; the curve between endpoints is the lane's).
 *  - A cut's match point is given in SCREEN space at the cut (MATCHES): both lanes hit it exactly.
 *  - Change a number only with the director; a lane that needs a change puts one line under REQUESTS in its report.
 *  - Overlay any shot at any time: composition `MapContractShot` {id, t} in src/entry-v2r-map.tsx.
 */

// ---------------------------------------------------------------------------------------------------------------
// 0. Clock and geometry types
// ---------------------------------------------------------------------------------------------------------------
export const FPS = 60;
export const FRAME_W = 1080;
export const FRAME_H = 1920;
/** voice take 2: 39.08 s = 2345 frames (round(39.08 * 60)). */
export const DURATION_S = 39.08;
export const DURATION_F = 2345;
/** The one frame rule: frame = round(t * 60). */
export const frameOf = (t: number): number => Math.round(t * FPS);
export const secOf = (f: number): number => f / FPS;

export type XY = {x: number; y: number};
export type Rect = {x0: number; y0: number; x1: number; y1: number};
export type Spot = {x: number; y: number; w: number; h: number};
export type Disc = {x: number; y: number; r: number};
export type Seat = XY;
export type Fig = {x: number; feetY: number; h: number};

export const spotRect = (s: Spot): Rect => ({x0: s.x - s.w / 2, y0: s.y - s.h / 2, x1: s.x + s.w / 2, y1: s.y + s.h / 2});
export const rectSpot = (r: Rect): Spot => ({x: (r.x0 + r.x1) / 2, y: (r.y0 + r.y1) / 2, w: r.x1 - r.x0, h: r.y1 - r.y0});
export const rectCentre = (r: Rect): XY => ({x: (r.x0 + r.x1) / 2, y: (r.y0 + r.y1) / 2});
export const discRect = (d: Disc): Rect => ({x0: d.x - d.r, y0: d.y - d.r, x1: d.x + d.r, y1: d.y + d.r});
/** Overlay-only widths (K4 / K5 draw the real silhouettes). */
export const FIGURE_ASPECT_OVERLAY = 0.3;
export const SEATED_ASPECT_OVERLAY = 0.5;
export const PIP_ASPECT_OVERLAY = 0.92;
export const figRect = (f: Fig, aspect: number = FIGURE_ASPECT_OVERLAY): Rect => ({x0: f.x - (f.h * aspect) / 2, y0: f.feetY - f.h, x1: f.x + (f.h * aspect) / 2, y1: f.feetY});
/** Pip's box from a seat (default = the largest Pip, 120 px). */
export const pipBox = (s: Seat, h: number = 120): Rect => ({x0: s.x - (h * PIP_ASPECT_OVERLAY) / 2, y0: s.y - h, x1: s.x + (h * PIP_ASPECT_OVERLAY) / 2, y1: s.y});
/** Scale a point about an anchor (a camera push / pull-out / ease-back): screen = a + (p - a) * z. */
export const scaleAbout = (p: XY, a: XY, z: number): XY => ({x: a.x + (p.x - a.x) * z, y: a.y + (p.y - a.y) * z});
export const scaleSpotAbout = (s: Spot, a: XY, z: number): Spot => ({...scaleAbout(s, a, z), w: s.w * z, h: s.h * z});
export const scaleRectAbout = (r: Rect, a: XY, z: number): Rect => {
  const p0 = scaleAbout({x: r.x0, y: r.y0}, a, z);
  const p1 = scaleAbout({x: r.x1, y: r.y1}, a, z);
  return {x0: p0.x, y0: p0.y, x1: p1.x, y1: p1.y};
};
export const scaleDiscAbout = (d: Disc, a: XY, z: number): Disc => ({...scaleAbout(d, a, z), r: d.r * z});
export const scaleFigAbout = (f: Fig, a: XY, z: number): Fig => {
  const p = scaleAbout({x: f.x, y: f.feetY}, a, z);
  return {x: p.x, feetY: p.y, h: f.h * z};
};
export const shiftRect = (r: Rect, dx: number, dy = 0): Rect => ({x0: r.x0 + dx, y0: r.y0 + dy, x1: r.x1 + dx, y1: r.y1 + dy});
export const overlaps = (a: Rect, b: Rect): boolean => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
export const inside = (a: Rect, b: Rect): boolean => a.x0 >= b.x0 && a.x1 <= b.x1 && a.y0 >= b.y0 && a.y1 <= b.y1;
export const rectGap = (a: Rect, b: Rect): number => {
  const dx = Math.max(0, a.x0 - b.x1, b.x0 - a.x1);
  const dy = Math.max(0, a.y0 - b.y1, b.y0 - a.y1);
  return Math.sqrt(dx * dx + dy * dy);
};

// Plain eases for the contract's camera maps (endpoints are contract, curves are the lane's).
const clamp01 = (u: number): number => Math.min(1, Math.max(0, u));
const prog = (t: number, t0: number, t1: number): number => clamp01((t - t0) / (t1 - t0));
export const EASE = {
  linear: (u: number) => u,
  in: (u: number) => u * u,
  out: (u: number) => 1 - (1 - u) * (1 - u),
  inOut: (u: number) => u * u * (3 - 2 * u),
} as const;
export type EaseName = keyof typeof EASE;
/** A zoom key: from -> to over t0..t1 about an anchor. */
export type ZoomKey = {from: number; to: number; t0: number; t1: number; anchor: XY; ease: EaseName};
export const zoomAt = (k: ZoomKey, t: number): number => k.from + (k.to - k.from) * EASE[k.ease](prog(t, k.t0, k.t1));
/** The house cubic bezier (same maths as src/v3/film/kit/Pullback.tsx `cubicBezier`), for S5's progress. */
export const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => (u: number): number => {
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  let lo = 0;
  let hi = 1;
  let s = u;
  for (let i = 0; i < 40; i++) {
    s = (lo + hi) / 2;
    const x = 3 * (1 - s) * (1 - s) * s * x1 + 3 * (1 - s) * s * s * x2 + s * s * s;
    if (x < u) lo = s;
    else hi = s;
  }
  return 3 * (1 - s) * (1 - s) * s * y1 + 3 * (1 - s) * s * s * y2 + s * s * s;
};

// ---------------------------------------------------------------------------------------------------------------
// 1. UI zones, the caption band, the legibility floor (TREATMENT sections 3, 5, 9)
// ---------------------------------------------------------------------------------------------------------------
export const UI = {
  frame: {x0: 0, y0: 0, x1: FRAME_W, y1: FRAME_H} as Rect,
  /** Captions pop in place inside this band on ONE flat field. NOTHING else is drawn here (no Pip, roof, hop arc, life). */
  captionBand: {x0: 0, y0: 317, x1: FRAME_W, y1: 556} as Rect,
  /** The ONE quiet field of every shot: the flat sky = the caption field. Flat horizon bands only below y 600. */
  quietSky: {x0: 0, y0: 0, x1: FRAME_W, y1: 600} as Rect,
  /** No built top (roof, parapet, chimney, aerial, tier, tree) higher than this line; exceptions: SKYLINE_EXCEPTIONS. */
  skylineMinY: 600,
  /** Every key read (a story change, a key line, Pip's beat) lives in here. */
  keyRead: {x0: 120, y0: 290, x1: 880, y1: 1250} as Rect,
  /** The platform's right rail (like / comment / share): masses only. Never Pip, a board, a key read. */
  rightRail: {x0: 780, y0: 840, x1: FRAME_W, y1: FRAME_H} as Rect,
  /** The bottom third runs under the platform UI: never quiet (each shot's mass in BOTTOM_THIRD), nothing to read. */
  bottomThird: {x0: 0, y0: 1250, x1: FRAME_W, y1: FRAME_H} as Rect,
  /** Paper edges (`paint-subtle`, final only, if the owner wants them): never in y 0-620. */
  noPaperEdge: {x0: 0, y0: 0, x1: FRAME_W, y1: 620} as Rect,
} as const;

/** Named exceptions to `UI.skylineMinY` (things allowed between the band and y 600; never in the band). */
export const SKYLINE_EXCEPTIONS = {
  /** S1: the roof-terrace planting may reach up to y 575 (never higher). */
  s1RoofPlantingTopMinY: 575,
  /** Sun discs: SUN2 top = 575 (19 px clear of the band); SUN1 top 585; SUN0 top 610; the S8 sun top 600. */
  sunTopMinY: 575,
  /** S5: the cloud bank and the obelisk tops stay at y >= 610. */
  s5CloudObeliskTopMinY: 610,
  /** S1 sky life above the band: the hero cloud (y 120-280) and a plane branch in the top-left gutter (y 0-240). */
  s1SkyLife: 'hero cloud y 120-280 upper right, drifting 2 px/s; plane branch x 0-220, y 0-240',
} as const;

/** The legibility floor (K2). Measured at 1080 x 1920. */
export const LEGIBILITY = {
  /** A story change is >= 80 px in its smallest dimension. */
  storyChangeMinPx: 80,
  /** A figure that carries a story change is >= 130 px tall. */
  carrierFigureMinH: 130,
  /** The S2 bench staffer, seated (the hood change = head + shoulders >= 80 px). */
  benchStafferSeatedMinH: 180,
  /** S3: her French-window silhouette at the match (so it stays >= 130 after the 5 % ease-back). */
  s3SilhouetteMinHAtMatch: 137,
  /** S2 staff windows: each >= 90 x 90. */
  staffWindowMinPx: 90,
  /** One type scale (K3): key lines read at 216 px; body and credits at full-screen phone width (~390 px). */
  keyLineMinPx: 56,
  bodyPx: [30, 34] as const,
  creditPx: [18, 20] as const,
  /** Pip: 86-120 px tall; >= 44 px only in S5's end frame. */
  pipMinH: 86,
  pipMaxH: 120,
  pipS5EndMinH: 44,
  /** Pip keeps >= 200 px (box to box) from every line of the F11 clause (S6). */
  pipClauseClearPx: 200,
  /** The phone checks: a whole frame 216 px wide (the cold read) and ~390 px (full-screen phone width). */
  phoneCheckPx: 216,
  phoneFullPx: 390,
} as const;

/** Camera speed limits (px per frame at 60 fps). */
export const CAMSPEED = {flatInkLongMoveMax: 7.5, detailedLayerMax: 15} as const;

// ---------------------------------------------------------------------------------------------------------------
// 2. The map (TREATMENT section 2): one London canal running EAST-WEST + one trip to Arlington, Virginia.
// ---------------------------------------------------------------------------------------------------------------
export type ShotId = 'V2S1' | 'V2S2' | 'V2S3' | 'V2S4' | 'V2S5' | 'V2S6' | 'V2S7' | 'V2S8';
export const SHOT_IDS: ShotId[] = ['V2S1', 'V2S2', 'V2S3', 'V2S4', 'V2S5', 'V2S6', 'V2S7', 'V2S8'];

export type PlaceId =
  | 'googleCanalWing' | 'googleForecourt' | 'roadBridge' | 'towpathWalk' | 'fingerpost' | 'herTerrace' | 'cafeBoat'
  | 'herLane' | 'gasholdersViaduct' | 'southSteps' | 'southTowpath' | 'arlingtonViewpoint' | 'pentagonGate';

export type Place = {
  id: PlaceId;
  /** 'north' = the north bank (Google's wing AND her terrace), 'south' = our bank, 'water', 'arlington'. */
  side: 'north' | 'south' | 'water' | 'arlington';
  /** Schematic chainage, metres WEST of the wing's east end (the overview sheet only; never a size). */
  chainM: number;
  what: string;
  shots: ShotId[];
};

/** North bank EAST -> WEST: Google's canal wing -> the towpath walk -> ONE fingerpost -> her terrace (the cafe boat
 *  moored below) -> gasholders and a viaduct far west. Her way home is WEST: S4 and S8 are one walk home (the post is
 *  behind her in S8). Then our (south) bank and Arlington. */
export const MAP_PLACES: Place[] = [
  {id: 'googleCanalWing', side: 'north', chainM: 0, what: "Google's canal wing: light brick, stone fins, tall glass, TWO storeys under a planted roof terrace; the stepped tiers far behind (seen only in S2, all at y >= 600); glass double doors under a canopy hand-lettered \"Google\" (no logo, no logo colours)", shots: ['V2S1', 'V2S2', 'V2S7']},
  {id: 'googleForecourt', side: 'north', chainM: 90, what: "the wing's WEST-end forecourt: cafe tables, bikes, fountain jets, plane trees with string lights, Google's A-board at B", shots: ['V2S7']},
  {id: 'roadBridge', side: 'water', chainM: 150, what: "a road bridge in the west gap (S1 deck y ~960); S7's west gap past the wing's corner holds SUN2", shots: ['V2S1']},
  {id: 'towpathWalk', side: 'north', chainM: 260, what: 'the towpath walk between Google and home: railings, lamps, benches, mooring rings, warehouses', shots: ['V2S4']},
  {id: 'fingerpost', side: 'north', chainM: 420, what: 'ONE dated fingerpost, both plates pointing WEST (DEC 2025 upper, APR 2026 lower), east of her terrace', shots: ['V2S4']},
  {id: 'herTerrace', side: 'north', chainM: 520, what: 'her brick terrace: two storeys + mansard, balconies, pots, string lights, chimney pots, aerials; her first-floor French window (teal frame, Juliet rail), her teal door', shots: ['V2S3', 'V2S8']},
  {id: 'cafeBoat', side: 'water', chainM: 540, what: 'the cafe boat moored below her terrace, its quote-of-the-day A-board on the towpath edge (her board at B in S8)', shots: ['V2S8']},
  {id: 'herLane', side: 'north', chainM: 560, what: 'her towpath running WEST to a bend, lamps receding; her house at the bend facing down the lane', shots: ['V2S8']},
  {id: 'gasholdersViaduct', side: 'north', chainM: 900, what: 'gasholders and a viaduct far west', shots: ['V2S4', 'V2S8']},
  {id: 'southSteps', side: 'south', chainM: 10, what: 'our broad canal-side stone steps facing the wing, people sitting (the S1 lens sits here)', shots: ['V2S1']},
  {id: 'southTowpath', side: 'south', chainM: 30, what: 'the south towpath facing the wing: newsstand, bench, railing (the S2 lens)', shots: ['V2S2']},
  {id: 'arlingtonViewpoint', side: 'arlington', chainM: 0, what: 'a public viewpoint terrace SOUTH-WEST of the Pentagon looking NORTH-EAST: lawns, parkway, the Pentagon, the Potomac, the low white city, the Washington Monument', shots: ['V2S5']},
  {id: 'pentagonGate', side: 'arlington', chainM: 0, what: "the Pentagon's perimeter footpath looking SOUTH: a low limestone facade band, a fence with a tall corner post, blossom, tulip beds, a service door 'CLASSIFIED · AUTHORIZED PERSONNEL ONLY'", shots: ['V2S6']},
];

/** Where each lens looks; which screen side is WEST (west = screen LEFT on every north-looking lens). */
export const LENSES: Record<ShotId, {looks: 'north' | 'west' | 'south' | 'north-east'; from: string; westIs: 'left' | 'right' | 'away'}> = {
  V2S1: {looks: 'north', from: 'our canal-side steps, seated eye level (1.3 m above the far towpath, ~14 m from her line)', westIs: 'left'},
  V2S2: {looks: 'north', from: 'the south towpath, standing', westIs: 'left'},
  V2S3: {looks: 'north', from: 'our bank across the water from her terrace', westIs: 'left'},
  V2S4: {looks: 'north', from: 'the water, trucking west with a narrowboat', westIs: 'left'},
  V2S5: {looks: 'north-east', from: 'the Arlington viewpoint terrace (crane back + up + ~75 deg arc)', westIs: 'left'},
  V2S6: {looks: 'south', from: "the Pentagon's perimeter footpath, eye level (morning sun in the EAST = screen left)", westIs: 'right'},
  V2S7: {looks: 'north', from: "the wing's west-end forecourt, eye level", westIs: 'left'},
  V2S8: {looks: 'west', from: 'her towpath, eye level, looking down the lane', westIs: 'away'},
};

/** Light = story time (= K1 `SHOT_LIGHT`; K1 `LIGHT[state]` has the bands, lamps, season). */
export type LightState = 'golden' | 'lowSun' | 'april' | 'sunset';
export const SHOT_LIGHT_MAP: Record<ShotId, LightState> = {
  V2S1: 'golden',
  V2S2: 'golden',
  V2S3: 'sunset', // a flash-forward in S8's sunset state (lamp on, blind up)
  V2S4: 'lowSun', // low sun on the far roofs, before sunset
  V2S5: 'april',
  V2S6: 'april',
  V2S7: 'sunset', // S7 and S8 share ONE sunset state (A5)
  V2S8: 'sunset',
};

// ---------------------------------------------------------------------------------------------------------------
// 3. Shared spots (TREATMENT section 5, "Shared spots (K2)")
// ---------------------------------------------------------------------------------------------------------------
/** W: her OFFICE window in S1 (first storey, the biggest pane; lamp-lit, dark from 0.40) AND her lit HOME window at the
 *  end of S8 (the loop seam). Centre (860, 700), 150 x 170 (1.65 x 1.9 m at the facade's 90 px/m). */
export const W: Spot = {x: 860, y: 700, w: 150, h: 170};
/** W2: the first staff window in S2 (base pose) = her French window in S3 (the window match-cut). */
export const W2: Spot = {x: 335, y: 785, w: 125, h: 155};
/** W2 at the S2 -> S3 cut, after S2's 6 % story push anchored on W2 (TREATMENT: 133 x 164). */
export const W2_CUT: Spot = {x: 335, y: 785, w: 132.5, h: 164.3};
/** The suns. SUN0 = S1's west gap; SUN1 = the S4 -> S5 match; SUN2 = S6 morning = S7 sunset (19 px clear of the band). */
export const SUN0: Disc = {x: 200, y: 690, r: 80};
export const SUN1: Disc = {x: 250, y: 650, r: 65};
export const SUN2: Disc = {x: 260, y: 620, r: 45};
/** S8's low sun over the canal past her board (20 px clear of B's top, never touching it). Fixed through S8's truck. */
export const SUN8: Disc = {x: 420, y: 640, r: 40};
/** B: the A-board FACE (Google's in S7 at its push landing 30.04; hers in S8 from the truck landing 35.60). */
export const B: Rect = {x0: 150, y0: 700, x1: 630, y1: 1220};
export const B_LEGS_Y1 = 1250;
/** Pip's board bollard beside B (S7, S8): base-centre. Clears B's face and the rail. */
export const BOARD_BOLLARD: Seat = {x: 700, y: 1205};
/** Pip's S1 waterline bollard (f0, and the loop landing). */
export const S1_BOLLARD: Seat = {x: 700, y: 1235};
/** Plum bridge colour of the S1 -> S2 push-through (= K1 CM.anchor). */
export const PLUM_BRIDGE = '#36223A';

// ---------------------------------------------------------------------------------------------------------------
// 4. Shots V2S1-V2S8 (TREATMENT section 5; = K8 src/v2r/film/scenes.json). Ids never clash with v1's edge hints.
// ---------------------------------------------------------------------------------------------------------------
export type TransitionIn =
  | {type: 'film-start'}
  | {type: 'push-through'; t0: number; t1: number; from: XY; to: XY; zoom: number; bridge: string; inkComp: number}
  | {type: 'matchcut'; t0: number; t1: number; on: string}
  | {type: 'cut-on-action'; on: string}
  | {type: 'foreground-wipe'; t0: number; t1: number; element: 'scene'; dir: 'left'; on: string};

export type ShotSpec = {
  id: ShotId;
  name: string;
  start: number;
  end: number;
  startF: number;
  endF: number;
  words: string;
  lane: 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6';
  set: string;
  framing: string;
  /** BUSY: >= 3.5 events/s, no gap > 1 s, flat <= 40 %. DENSE-CALM: >= 2 movers always, flat <= 30 %. SCALE: S5. */
  mood: 'BUSY' | 'DENSE-CALM' | 'SCALE';
  light: LightState;
  /** The moment the listed screen positions are exact (POSE_T[id]). */
  pose: string;
  transitionIn: TransitionIn;
  /** The ONE thing a sound-off viewer tells back (TREATMENT section 5, last column). */
  explains: string;
};

const shot = (s: Omit<ShotSpec, 'startF' | 'endF' | 'light'>): ShotSpec => ({...s, startF: frameOf(s.start), endF: frameOf(s.end), light: SHOT_LIGHT_MAP[s.id]});

export const SHOTS: ShotSpec[] = [
  shot({
    id: 'V2S1', name: 'Walking out', start: 0.0, end: 6.1, lane: 'L1', mood: 'BUSY', set: 'A frontal (S1 scale sheet)',
    words: 'She quit Google. And she says her contract bans her from criticizing it... for life.',
    framing: 'RIVERSIDE across the canal from a seated eye level on our steps, looking north',
    pose: '5.30, the cover (zoom 1.00 from 4.90); earlier: s1Screen(p, t) (the pull-out about W)',
    transitionIn: {type: 'film-start'},
    explains: 'She left, and she says the rule covers the whole rest of her life.',
  }),
  shot({
    id: 'V2S2', name: 'The wall', start: 6.1, end: 12.98, lane: 'L2', mood: 'BUSY', set: 'A from the south bank',
    words: "You'd think that's one odd contract. But Google's staff told the BBC they're scared to speak out, because of their contracts.",
    framing: 'RIVERSIDE from the south towpath; the wing in 3/4, cut by the left edge, receding right',
    pose: '6.70 (the push-through pull-back landed, zoom 1.00); the story push maps by scaleAbout(p, W2, 1.06) at the cut',
    transitionIn: {type: 'push-through', t0: 5.95, t1: 6.25, from: {x: 860, y: 700}, to: {x: 200, y: 795}, zoom: 12, bridge: PLUM_BRIDGE, inkComp: 0.6},
    explains: 'Not one odd contract: a few Google staff, in their account to the BBC, are scared too.',
  }),
  shot({
    id: 'V2S3', name: 'Her window', start: 12.98, end: 14.86, lane: 'L3', mood: 'DENSE-CALM', set: 'B across the water',
    words: 'So why is she talking?',
    framing: 'RIVERSIDE across the water to her terrace (a flash-forward in S8 sunset light)',
    pose: '12.98 (the match, zoom 1.00); the ease-back maps by scaleAbout(p, W2, 0.95) by 13.60',
    transitionIn: {type: 'matchcut', t0: 12.81, t1: 13.16, on: 'W2: the S2 staff window W2_CUT = her French window (same spot, same size)'},
    explains: 'Unlike the blinds, her window is open: she is the one talking.',
  }),
  shot({
    id: 'V2S4', name: 'The walk home', start: 14.86, end: 20.55, lane: 'L3', mood: 'DENSE-CALM', set: 'B: her towpath from the water',
    words: "She worked on Google's AI and told the BBC she objected to where its military work was heading.",
    framing: 'RIVERSIDE truck from the water, a narrowboat gliding with us as the foreground',
    pose: '17.96 (the stop on "objected": the post lands at x ~575); the 6 % push about SUN1 lands SUN1 at the cut',
    transitionIn: {type: 'cut-on-action', on: "Pip's leap out of S3 (14.70) -> Pip lands on the boat roof (14.95)"},
    explains: "Who she is (an insider at Google's AI lab who objected, then quit) and that \"heading\" was a direction: unclassified, then classified.",
  }),
  shot({
    id: 'V2S5', name: 'The far side', start: 20.55, end: 24.0, lane: 'L4', mood: 'SCALE', set: 'C Arlington heights',
    words: 'In April, that meant a deal letting the Pentagon use its AI for',
    framing: 'the S5 pull-back crane, the ONE big move: under a blossoming canopy -> the Arlington view',
    pose: 'start = the hold 20.55-21.30; end = the hold 23.40-24.00',
    transitionIn: {type: 'matchcut', t0: 20.1, t1: 20.67, on: 'SUN1 (250, 650) r 65 (cut 20.55, inside the pause)'},
    explains: 'April: the deal was with the US Department of Defense, a user the size of this view.',
  }),
  shot({
    id: 'V2S6', name: 'The gate', start: 24.0, end: 28.06, lane: 'L5', mood: 'BUSY', set: 'D the gate',
    words: '"any lawful government purpose". Google can\'t veto how it\'s used.',
    framing: 'eye level, straight-on, looking south along the perimeter fence',
    pose: 'linear in time 24.00 -> 28.06 (the lateral truck: the board drifts right 25 px/s)',
    transitionIn: {type: 'cut-on-action', on: "Pip's leap (S5 23.90) -> Pip lands on the fence's tall corner post (the cut on \"any\", 24.00)"},
    explains: "The deal's exact words with their limit; lawful use is the Pentagon's call, not Google's.",
  }),
  shot({
    id: 'V2S7', name: 'Google says', start: 28.06, end: 32.93, lane: 'L5', mood: 'DENSE-CALM', set: 'A forecourt (west end)',
    words: 'But Google says it follows its AI principles and bans retaliation "of any kind".',
    framing: "eye level from the forecourt at the wing's west end, looking north; uninterrupted to 32.70",
    pose: '30.04 (the 4 % push landed on "principles": B exact); at 28.06 everything is scaleAbout(p, B centre, 1/1.04)',
    transitionIn: {type: 'matchcut', t0: 27.82, t1: 28.31, on: 'SUN2 (260, 620) r 45 (S6 morning = S7 sunset)'},
    explains: "Google's answers to the deal (its AI principles) and to the fear (no retaliation), in its own words, at equal weight.",
  }),
  shot({
    id: 'V2S8', name: 'Her words', start: 32.93, end: 39.08, lane: 'L6', mood: 'DENSE-CALM', set: 'B: her lane',
    words: 'She says she can\'t criticize Google. But in her words, "talking about facts is not criticising".',
    framing: 'LANE along her towpath, looking west',
    pose: 'pre-truck to 34.99 (her board at x -100-380); landing 35.60 and 38.82 (board at B, W at (860, 700))',
    transitionIn: {type: 'foreground-wipe', t0: 32.7, t1: 33.16, element: 'scene', dir: 'left', on: "S7's Wiper (a narrowboat travelling west; bow in only after 32.70)"},
    explains: 'Her claim still stands (she says), and she talks anyway: in her words, talking about facts is not criticising.',
  }),
];

/** The time at which each shot's listed positions are exact. */
export const POSE_T: Record<ShotId, number> = {V2S1: 5.3, V2S2: 6.7, V2S3: 12.98, V2S4: 17.96, V2S5: 21.0, V2S6: 24.0, V2S7: 30.04, V2S8: 35.6};

export const shotById = (id: ShotId): ShotSpec => {
  const s = SHOTS.find((x) => x.id === id);
  if (!s) throw new Error(`map.ts: unknown shot ${id}`);
  return s;
};
/** Which shot owns film time t (the cut instant belongs to the incoming shot). */
export const shotAt = (t: number): ShotSpec => {
  for (let i = SHOTS.length - 1; i >= 0; i--) if (t >= SHOTS[i].start) return SHOTS[i];
  return SHOTS[0];
};

// ---------------------------------------------------------------------------------------------------------------
// 5. THE S1 SCALE SHEET (TREATMENT section 9, K2): every S1 size derives from this ONE lens.
// ---------------------------------------------------------------------------------------------------------------
/**
 * The lens sits on our steps at a seated eye height, level, 1.3 m above the far towpath and 14 m from her line.
 * Horizon y 965 (hidden by the far bank). Pinhole: px/m at a ground line = (feetY - 965) / 1.3; focal = 100 x 14 = 1400 px.
 *   her line (the far towpath's front, feet y 1095): 100 px/m -> she is 1.70 m = 170 px;
 *   Google's facade (base y 1082): 90 px/m -> 1400 / 90 = 15.56 m from the lens, 1.56 m behind her line (TREATMENT 1.5 m);
 *   her at the facade line (behind the glass door): 1.70 x 90 = 153 px.
 */
export const S1_LENS = {
  horizonY: 965,
  eyeHeightM: 1.3,
  herLineDistM: 14,
  focalPx: 1400,
  herLineFeetY: 1095,
  herLinePxPerM: 100,
  facadeBaseY: 1082,
  facadePxPerM: 90,
  facadeDistM: 1400 / 90,
} as const;

/** px per metre on the far towpath at a sole line (exact for the level S1 lens). */
export const s1PxPerM = (feetY: number): number => (feetY - S1_LENS.horizonY) / S1_LENS.eyeHeightM;
/** Her standing height (and every ghost's): 1.70 m. */
export const HER_HEIGHT_M = 1.7;
/** A 1.70 m figure's height in px at sole line feetY (S1). */
export const s1FigureH = (feetY: number): number => HER_HEIGHT_M * s1PxPerM(feetY);

/**
 * The far towpath's sole line in S1 (zoom 1.00 screen x -> feet y): straight at y 1095 right of x 470, then bending
 * gently away to the left. Fitted so the ghost sizes come out exactly as TREATMENT specs them (170 -> 135, outlines
 * 130 -> 120): G6 feet 1068 (135 px), O1 1064 (130), O3 1057 (120). TREATMENT's "feet -> y ~1065" = the row's far end.
 */
export const S1_TOWPATH_FEET: XY[] = [
  {x: 1080, y: 1095},
  {x: 470, y: 1095},
  {x: 183, y: 1068},
  {x: 58, y: 1057},
  {x: 0, y: 1051.9},
];
/** Piecewise-linear lookup over a polyline sorted by DEScending x (extrapolates past the last point). */
const lerpPoly = (pts: XY[], x: number): number => {
  if (x >= pts[0].x) return pts[0].y;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (x >= b.x) return a.y + ((x - a.x) / (b.x - a.x)) * (b.y - a.y);
  }
  const a = pts[pts.length - 2];
  const b = pts[pts.length - 1];
  return b.y + ((x - b.x) / (b.x - a.x)) * (b.y - a.y);
};
export const s1TowpathFeetY = (x: number): number => lerpPoly(S1_TOWPATH_FEET, x);
/** A 1.70 m figure's height at screen x on the far towpath (S1, zoom 1.00). */
export const s1FigureHAt = (x: number): number => s1FigureH(s1TowpathFeetY(x));

/** Every S1 size, derived (zoom 1.00 screen px). */
export const S1_SHEET = {
  herH: 170,
  herHAtFacade: 153,
  /** Google's canal wing x 330 -> past the right edge, slightly 3/4 (right bays nearest). */
  wing: {x0: 330, x1: FRAME_W},
  /** Parapet top: y 600 at the right edge falling to y 640 at the west corner (x 330); the planting never above y 575. */
  parapetY: {atX1080: 600, atX330: 640},
  plantingTopMinY: 575,
  /** Ground storey 3.2 m x 90 = 288 px. The first storey + the parapet: y 600/640 -> 794. */
  groundStorey: {y0: 794, y1: 1082},
  /** The glass double door 2.0 x 2.6 m = 180 x 234 px. Starts to slide 0.45 (the exit ding), open 0.52, shut by 1.10. */
  door: {x0: 540, y0: 848, x1: 720, y1: 1082} as Rect,
  /** The canopy fascia hand-lettered "Google": ~48 px letters (0.53 m), fill-pop one by one from 0.97. */
  canopyFascia: {x0: 520, y0: 800, x1: 740, y1: 845} as Rect,
  canopyLetterPx: 48,
  /** W = her office window, first storey, 1.65 x 1.9 m; lamp OFF at 0.40 (f24): the biggest window goes plum-dark. */
  w: W,
  wLampOffAt: 0.4,
  /** ~10 other panes, 40-70 % lit, switching every 0.6-1.5 s; a far window lights at 1.80. */
  otherPanes: 10,
  /** The west gap: far roofs (tops y ~790), a road bridge (deck y ~960), SUN0. */
  westGap: {x0: 0, x1: 330},
  farRoofTopY: 790,
  bridgeDeckY: 960,
  sun: SUN0,
  /** Her line on the straight; the bend: S1_TOWPATH_FEET. The far coping 1095-1110, the water 1110-1215. */
  herLineFeetY: 1095,
  water: {y0: 1110, y1: 1215},
  /** Two moored boats right: masses in the rail. */
  boatsRight: {x0: 760, y0: 1080, x1: FRAME_W, y1: 1215} as Rect,
  /** Our bank: the waterline 1215 -> the bottom; five broad stone steps rising toward us, ~14 seated backs. */
  ourBank: {y0: 1215, y1: FRAME_H},
  stepsCount: 5,
  stepsSeated: 14,
  /** Seated head-backs: near row cut by the bottom (250-330 px), middle (~110), low by the water (~60). */
  seatedHeadPx: {near: [250, 330] as const, middle: 110, low: 60},
  pipBollard: S1_BOLLARD,
  heroCloud: {x0: 640, y0: 120, x1: 1000, y1: 280} as Rect,
  heroCloudDriftPxS: 2,
  planeBranch: {x0: 0, y0: 0, x1: 220, y1: 240} as Rect,
} as const;

/** The S1 camera: a 5 % pull-out 1.05 -> 1.00 (ease-in) over 0-4.90, ANCHORED ON W, so W's centre is identical on every
 *  frame (the loop seam); then the push-through into W 5.95-6.25 (Film 'push-through', inkComp 0.6, plum bridge). */
export const S1_CAMERA = {
  pullOut: {from: 1.05, to: 1.0, t0: 0, t1: 4.9, anchor: {x: W.x, y: W.y}, ease: 'in'} as ZoomKey,
  pushThrough: {t0: 5.95, t1: 6.25, into: {x: W.x, y: W.y} as XY, zoom: 12, bridge: PLUM_BRIDGE, inkComp: 0.6},
};
export const s1Zoom = (t: number): number => zoomAt(S1_CAMERA.pullOut, t);
/** S1 world (zoom 1.00) -> screen at time t. */
export const s1Screen = (p: XY, t: number): XY => scaleAbout(p, S1_CAMERA.pullOut.anchor, s1Zoom(t));

/** The S1 clock: the spot-tied moments every S1 builder, K4/K5 and sound share (TREATMENT section 4). */
export const S1_CLOCK = {
  flood: {t0: 0.02, t1: 0.3, origin: {x: SUN0.x, y: SUN0.y} as XY, herCoatLastF: 18},
  voiceShe: 0.12,
  wLampOff: 0.4,
  doorsStart: 0.45, // OUR EXIT DING
  doorsOpen: 0.52,
  steppingOut: 0.97, // "Google": canopy letters fill-pop one by one
  doorsShut: 1.1, // a bus crosses the far bridge
  pipHeadFollows: 1.25,
  birdsLiftBridge: 1.4,
  ghostPops: [2.0, 2.53, 3.2, 3.8, 4.2, 4.79],
  stop: {t0: 4.54, t1: 4.98}, // the "...": everyone stops mid-stride, the ambience dips (to 4.79)
  life: 4.98, // ONE step together, three outlines, birds off the far roofs, Pip ears-cover
  cover: 5.3,
  herLooksBack: 5.59,
  pipHopsUpLeft: 5.9,
  dive: {t0: 5.95, t1: 6.25},
} as const;

/** S1 frame-0 words (mirror of TREATMENT section 4; K8's Frame0Text renders them). All inside y 317-556. */
export const FRAME0_TEXT = {
  lines: ['SHE SAYS: NO CRITICIZING', 'GOOGLE. FOR LIFE.'],
  linePx: 72,
  baselines: [372, 452],
  source: 'Source: BBC News, 21 Oct 2026',
  sourcePx: 20,
  sourceBaseline: 550,
  /** The ONLY spoken page under the block, 0.12-1.88: "She [quit] Google." */
  spokenPage: {text: 'She [quit] Google.', s: 0.12, e: 1.88, px: 52, baseline: 516},
  /** The peach box walks the block's own words, one at a time, ~0.06 s before each audible onset. */
  keys: [
    {t: 2.06, text: 'SAYS'},
    {t: 3.14, text: 'NO'},
    {t: 3.74, text: 'NO CRITICIZING'},
    {t: 4.77, text: 'FOR LIFE'},
  ],
  until: 5.95,
  /** S2's first page pops at 6.28 (the band stays empty through the dive). */
  nextPageAt: 6.28,
  /** The loop: the frame-0 words (no box) pop back at captionAt. */
  loopCaptionAt: 39.04,
} as const;

// ---------------------------------------------------------------------------------------------------------------
// 6. Her S1 walk and THE GHOST ROW (TREATMENT sections 3-4)
// ---------------------------------------------------------------------------------------------------------------
/**
 * Her x on the S1 far towpath (zoom 1.00 screen px). 0-0.97 behind the glass door at the facade line (153 px, feet
 * 1082, mid-step toward the doors); 0.97 she steps out (153 -> 170 px over her first steps, feet 1082 -> 1095 by 1.40)
 * and strolls WEST at ~40 px/s (short steps); 4.54 she stops (the "..."); 4.98 ONE step with the whole row (27 px,
 * eased, done by 5.25); 5.59 she looks back at W.
 */
export const S1_HER_KEYS: {t: number; x: number; note: string}[] = [
  {t: 0.0, x: 680, note: 'behind the glass door, mid-step (ink only at f0)'},
  {t: 0.97, x: 680, note: '"Google": steps out onto the towpath'},
  {t: 4.54, x: 537, note: 'stops (every ghost stops mid-stride)'},
  {t: 4.98, x: 537, note: '"life": the whole row takes ONE step'},
  {t: 5.25, x: 510, note: 'the cover pose (5.30)'},
];
export const S1_HER_WALK_PX_S = (680 - 537) / (4.54 - 0.97); // 40.06 px/s = 0.40 m/s
export const S1_HER_STEP_OUT = {t0: 0.97, t1: 1.4, hFrom: 153, hTo: 170, feetFrom: 1082, feetTo: 1095};
export const S1_HER_LOOK_BACK_AT = 5.59;

/** Her S1 x at time t (zoom 1.00 screen px). */
export const s1HerX = (t: number): number => {
  const k = S1_HER_KEYS;
  if (t <= k[1].t) return k[0].x;
  if (t <= k[2].t) return k[1].x + ((t - k[1].t) / (k[2].t - k[1].t)) * (k[2].x - k[1].x);
  if (t <= k[3].t) return k[2].x;
  if (t <= k[4].t) return k[3].x + EASE.inOut((t - k[3].t) / (k[4].t - k[3].t)) * (k[4].x - k[3].x);
  return k[4].x;
};

export type GhostKind = 'her' | 'ghost' | 'outline';
export type RowMember = {
  id: string;
  kind: GhostKind;
  /** Slot along the row (0 = her); one slot = one step ahead (62 px on the straight). */
  slot: number;
  /** Screen x at the cover (5.30, zoom 1.00), TREATMENT section 4. */
  coverX: number;
  /** Pop time: outline draws 0.10 s, paper fill 2 f later, a 4-frame scale settle; ONE soft wooden tick on the pop. */
  popT: number | null;
  word: string;
  /** Whole-head value (= K1 CM.ghostHead[slot - 1]; her = CM.anchor). null = a bare outline: ink only, no fill, no cues. */
  headHex: string | null;
  cues: string;
};

export const S1_ROW_SLOT_PX = 62;
/** The row (TREATMENT section 4 end state). Paper fill #FBF6EE (K1 CM.ghostPaper), ink 2.2 px; every figure WHOLE;
 *  lockstep with her; the world passes through them unaware. Nothing counts years (no dates, counters, accelerating ticks). */
export const S1_ROW: RowMember[] = [
  {id: 'HER', kind: 'her', slot: 0, coverX: 510, popT: null, word: '', headHex: '#36223A', cues: 'her: long teal coat, dark plum low bun, cream tote, a potted desk plant under her arm'},
  {id: 'G1', kind: 'ghost', slot: 1, coverX: 448, popT: 2.0, word: 'And', headHex: '#3E2A3A', cues: 'dark plum head: her, now'},
  {id: 'G2', kind: 'ghost', slot: 2, coverX: 389, popT: 2.53, word: 'contract', headHex: '#7D7387', cues: 'mid grey head (ageing reads by 2.6 s)'},
  {id: 'G3', kind: 'ghost', slot: 3, coverX: 333, popT: 3.2, word: 'bans', headHex: '#A9A5B5', cues: 'grey-silver head'},
  {id: 'G4', kind: 'ghost', slot: 4, coverX: 280, popT: 3.8, word: 'criticizing', headHex: '#CFCCD6', cues: 'silver + a scarf; a slightly softer back; shorter stride'},
  {id: 'G5', kind: 'ghost', slot: 5, coverX: 230, popT: 4.2, word: '(criticizing) it', headHex: '#ECEAF0', cues: 'white-silver + scarf + shorter stride'},
  {id: 'G6', kind: 'ghost', slot: 6, coverX: 183, popT: 4.79, word: 'for', headHex: '#ECEAF0', cues: 'white-silver + scarf + shorter stride (ageing stops: no stoop, stick, bag)'},
  {id: 'O1', kind: 'outline', slot: 7, coverX: 138, popT: 4.97, word: 'life', headHex: null, cues: 'bare ink outline (no fill, no age cues)'},
  {id: 'O2', kind: 'outline', slot: 8, coverX: 96, popT: 5.0, word: 'life', headHex: null, cues: 'bare ink outline'},
  {id: 'O3', kind: 'outline', slot: 9, coverX: 58, popT: 5.03, word: 'life', headHex: null, cues: 'bare ink outline'},
];
export const GHOST_PAPER_HEX = '#FBF6EE';
export const GHOST_POP = {outlineS: 0.1, fillDelayF: 2, settleF: 4} as const;
/** The "...": 4.54 she stops, every ghost stops mid-stride (the ambience dips to 4.79); all still until the 4.98 step. */
export const S1_ROW_STOP = {t0: 4.54, t1: 4.98} as const;
/** On "life" (4.98, f299): the whole row takes ONE step, three outlines pop, birds lift off the far roofs, Pip ears-cover. */
export const S1_LIFE_T = 4.98;

/**
 * LOCKSTEP. Every member walks the same metres as her: path coordinate u = herX(t) - 62 * slot ("straight px").
 * Screen x = s1RowXofU(u): identity on the straight (u >= 510), then the bend compresses through the cover slots.
 * Feet and height follow the towpath at that screen x (s1TowpathFeetY, s1FigureHAt).
 */
const S1_ROW_UMAP: XY[] = S1_ROW.map((m) => ({x: S1_ROW[0].coverX - S1_ROW_SLOT_PX * m.slot, y: m.coverX}));
export const s1RowXofU = (u: number): number => (u >= S1_ROW_UMAP[0].x ? u : lerpPoly(S1_ROW_UMAP, u));
export type RowPose = {id: string; kind: GhostKind; x: number; feetY: number; h: number; visible: boolean};
/** Every row member's pose at film time t, zoom 1.00 screen px (map through s1Screen for t < 4.90). */
export const s1RowAt = (t: number): RowPose[] => {
  const hx = s1HerX(t);
  const so = S1_HER_STEP_OUT;
  const u = prog(t, so.t0, so.t1);
  return S1_ROW.map((m) => {
    const x = m.slot === 0 ? hx : s1RowXofU(hx - S1_ROW_SLOT_PX * m.slot);
    const stepping = m.slot === 0 && t < so.t1;
    const feetY = stepping ? so.feetFrom + (so.feetTo - so.feetFrom) * u : s1TowpathFeetY(x);
    const h = stepping ? so.hFrom + (so.hTo - so.hFrom) * u : s1FigureHAt(x);
    return {id: m.id, kind: m.kind, x, feetY, h, visible: m.popT === null || t >= m.popT};
  });
};

// ---------------------------------------------------------------------------------------------------------------
// 7. Per-shot layouts (screen px at each shot's pose; TREATMENT section 5 table + the bottom third)
// ---------------------------------------------------------------------------------------------------------------
export const S2 = {
  /** Her dark window; an ink ring draws round it at 6.82 ("one"). */
  herDarkWindow: {x: 200, y: 795, w: 140, h: 170} as Spot,
  ringAt: 6.82,
  /** The five staff windows around hers (each >= 90 x 90). Order = the blind order. */
  staffWindows: [
    {id: 'W2', x: 335, y: 785, w: 125, h: 155},
    {id: 'SW2', x: 465, y: 776, w: 110, h: 140},
    {id: 'SW3', x: 460, y: 948, w: 100, h: 90},
    {id: 'SW4', x: 330, y: 955, w: 110, h: 95},
    {id: 'SW5', x: 190, y: 960, w: 120, h: 100},
  ] as (Spot & {id: string})[],
  /** 8.96 "staff": the five turn a cooler white, a standing silhouette in each (five light clicks, 0.04 s apart). */
  staffOnAt: 8.96,
  staffOnStagger: 0.04,
  /** 10.26-10.60 "scared": the five blinds drop to HALF one by one (0.085 s apart), the silhouettes step back. */
  blindsAt: 10.26,
  blindsStagger: 0.085,
  /** 10.36: the bench staffer's hood goes up (whole-head shape change; head + shoulders >= 80 px). */
  hoodAt: 10.36,
  /** 12.20 "contracts": W2's blind comes fully down (blind thump). */
  w2BlindDownAt: 12.2,
  /** The wing, cut by the left edge, receding right: rows at the left edge; ~400 windows (one batched path, LOD);
   *  the stepped tiers small behind it, all at y >= 600; pigeons on the parapet. */
  wing: {parapetMinY: 600, firstStoreyY: [700, 880] as const, groundRowY: [900, 1010] as const, windowWLeft: 150, windowWFar: 8, windowsTotal: 400},
  /** The newsstand A-board TOLD THE BBC (slid out by the newsagent at 8.44). */
  aBoard: {x0: 160, y0: 1050, x1: 560, y1: 1250} as Rect,
  aBoardOutAt: 8.44,
  /** The bench: the reporter (left: satchel, notebook, no BBC marks) and the staffer (right: slate coat, auburn hair,
   *  plain lanyard; seated >= 180 px, seated from the start). Seated figure boxes (centre x, feet, height). */
  bench: {x0: 560, y0: 1040, x1: 780, y1: 1230} as Rect,
  reporter: {x: 612, feetY: 1230, h: 165} as Fig,
  staffer: {x: 714, feetY: 1230, h: 180} as Fig,
  /** 9.48 "BBC": the notebook opens, the staffer turns to the reporter; 12.85 the notebook claps shut. */
  notebookOpenAt: 9.48,
  notebookShutAt: 12.85,
  pipSeat: {x: 590, y: 1050} as Seat,
  camera: {
    /** Out of the push-through: 1.12 -> 1.00 ease-out 6.10-6.70 about her dark window. */
    pullBack: {from: 1.12, to: 1.0, t0: 6.1, t1: 6.7, anchor: {x: 200, y: 795}, ease: 'out'} as ZoomKey,
    /** A float 10 px/s that is back at 0 (or absorbed) so W2's centre lands at (335, 785) at the cut. */
    floatPxS: 10,
    /** The 6 % story push on W2 8.50-12.80 (ease in-out). */
    push: {from: 1.0, to: 1.06, t0: 8.5, t1: 12.8, anchor: {x: W2.x, y: W2.y}, ease: 'inOut'} as ZoomKey,
  },
} as const;

export const S3 = {
  /** Her French window at the match = W2_CUT (teal frame, Juliet rail, blind UP, lamp on, plants). */
  frenchWindow: W2_CUT,
  /** Her full-figure silhouette pacing inside, phone at her ear: >= 137 px at the match (>= 130 after the ease-back),
   *  feet on the window's floor line; pacing range x 290-380 (clear of Pip). 14.28 her free hand moves. */
  silhouette: {x: 330, feetY: 862, h: 140} as Fig,
  pacingX: [290, 380] as const,
  handMovesAt: 14.28,
  /** Her window box (Pip on its right end, clear of the window opening and of her). */
  windowBox: {x0: 255, y0: 868, x1: 520, y1: 900} as Rect,
  pipSeat: {x: 462, y: 878} as Seat,
  /** Her terrace across the water: two storeys + mansard; chimneys and aerials all at y >= 600; two lit neighbours. */
  terraceTopMinY: 600,
  /** Bottom third: the moored narrowboat roof y ~1260-1330, cabin 1330-1580; our towpath y 1640-1920. */
  boatRoofY: [1260, 1330] as const,
  boatCabinY: [1330, 1580] as const,
  ourTowpathY: [1640, 1920] as const,
  camera: {easeBack: {from: 1.0, to: 0.95, t0: 13.0, t1: 13.6, anchor: {x: W2.x, y: W2.y}, ease: 'out'} as ZoomKey, floatPxS: [8, 12] as const},
} as const;

export const S4 = {
  /** Her: walking LEFT in profile, 170 px (100 px/m at her line, as S1), screen-fixed at x ~720 while the world trucks. */
  her: {x: 720, feetY: 1070, h: 170} as Fig,
  towpathY: [860, 1080] as const,
  /** The fingerpost at the stop (17.96): ONE post at x ~575, two arrow plates pointing WEST, time order top-to-bottom,
   *  fill-first pen reveal; she never touches it. Plate lettering: key 56 px, body 34 px, credit small. */
  post: {x: 575, topY: 735, footY: 1060},
  plateDec2025: {x0: 110, y0: 755, x1: 560, y1: 855} as Rect,
  plateApr2026: {x0: 110, y0: 865, x1: 560, y1: 965} as Rect,
  decPlateAt: 18.92,
  aprPlatePen: [19.45, 19.8] as const,
  /** The name tag: paper on a thin ink leader, screen-locked above her, builds 15.07 / 16.60, pops off 18.80. */
  nameTag: {x0: 600, y0: 600, x1: 880, y1: 800} as Rect,
  nameTagBuilds: [15.07, 16.6] as const,
  nameTagOffAt: 18.8,
  /** Truck west at her pace (far roofs 0.3x) -> stop on "objected" (0.6 s ease-out ending 17.96) -> 6 % push about
   *  SUN1 18.40-20.10 (ease-in), landing SUN1 at (250, 650) r 65 at the cut. */
  camera: {truckFarRoofsK: 0.3, stop: {t0: 17.36, t1: 17.96}, push: {from: 1.0, to: 1.06, t0: 18.4, t1: 20.1, anchor: {x: SUN1.x, y: SUN1.y}, ease: 'in'} as ZoomKey},
  /** SUN1 drawn at r 65 / 1.06 at the pose, so the push lands r 65 at the cut (the centre is the anchor: fixed). */
  sunAtPose: {x: SUN1.x, y: SUN1.y, r: SUN1.r / 1.06} as Disc,
  /** The narrowboat foreground: roof edge y ~1220 (herb pots, a bike, a coiled rope, a chimney, Pip). */
  boatRoofY: 1220,
  boatCabinY: [1290, 1660] as const,
  waterY: [1700, 1920] as const,
  /** Pip rides the boat roof LEFT of her (x 470), so neither its landing nor its hop into the sun ever crosses her. */
  pipSeat: {x: 470, y: 1218} as Seat,
  stopAt: 17.96,
  birdsWestAt: 19.8,
} as const;

/** S5 progress: the house cubic bezier re-fit for this cut (p 0.15 at 21.75, 0.48 at 22.16, 0.70 at 22.43, 0.96 at 23.02). */
export const S5_EASE = cubicBezier(0.35, 0.03, 0.45, 1.0);
export const S5 = {
  start: {
    /** Warm-dark under a blossoming canopy; the bright slot holds SUN1 from S4. */
    slot: {x0: 150, y0: 580, x1: 560, y1: 880} as Rect,
    sun: SUN1,
    /** Two small full-figure backs on a bench at x ~250-450 (the stranger, Pip), never cut at the hips. */
    bench: {x0: 230, y0: 1060, x1: 460, y1: 1230} as Rect,
    stranger: {x: 300, feetY: 1225, h: 150} as Fig,
    pipSeat: {x: 415, y: 1120} as Seat,
    /** The US newspaper box, no masthead: face 310 px wide; headline 40 px x 3 lines + an 18 px credit. */
    newsBox: {x0: 470, y0: 880, x1: 780, y1: 1230} as Rect,
    /** 20.76 "April": the disc flips into a calendar page APRIL 2026 and back by 21.20; blossom bursts in 4 frames. */
    calendarFlip: {t0: 20.76, t1: 21.2},
    blossomBurstF: 4,
  },
  /** The crane: hold 20.55-21.30 -> ONE ease 21.30-23.40 (dolly back + crane up + ~75 deg arc) -> hold to 24.00. */
  move: {t0: 21.3, t1: 23.4, bezier: [0.35, 0.03, 0.45, 1.0] as const, holdEnd: 24.0},
  /** By progress p (times from S5_EASE). The lamppost wipe needs >= 10 frames: p 0.40-0.50 is only 7 (f1324-1331),
   *  so it is widened to 22.02-22.19 (f1321-1331, p ~0.37-0.51). */
  beats: [
    {p0: 0.15, p1: 0.4, t0: 21.75, t1: 22.06, what: 'a big tree stands where the Pentagon will land'},
    {p0: 0.37, p1: 0.51, t0: 22.02, t1: 22.19, what: 'a lamppost wipes the backs at peak speed (>= 10 frames; the tiny drawings swap in behind it)'},
    {p0: 0.55, p1: 0.62, t0: 22.24, t1: 22.33, what: 'a light burst (the pale cloud bank)'},
    {p0: 0.7, p1: 0.7, t0: 22.43, t1: 22.43, what: 'the Pentagon clears the tree ON "Pentagon"; the plaque pops (The Pentagon · US Department of Defense)'},
    {p0: 0.77, p1: 0.96, t0: 22.54, t1: 23.02, what: 'the obelisk rises'},
  ],
  windowsWarmAt: 23.08,
  end: {
    /** Sky y 0-800; the horizon y ~800; a flat lobed cloud bank (top >= 610) cut by the right edge, behind the obelisk. */
    horizonY: 800,
    cloudBankTopMinY: 610,
    /** The stranger and Pip tiny at the balustrade, feet <= 1240; Pip >= 44 px (the scale anchor). Suggested spots. */
    figuresFeetMaxY: 1240,
    pipMinH: 44,
    pipSeat: {x: 360, y: 1236} as Seat,
    stranger: {x: 318, feetY: 1238, h: 62} as Fig,
    /** Flat steps toward the sky (ink full -> none), 6 planes; detailed layers <= 15 px/f. */
    flatStepsPct: [0, 12, 22, 40, 65] as const,
    planes: 6,
  },
  pipLeapAt: 23.9,
} as const;

export const S6 = {
  /** The deal board 560 x 560 (mid plane), drifting right with the lateral truck (parallel to the lens): exactly
   *  100 px over 24.00-28.06 = 24.63 px/s (TREATMENT's "25 px/s" would end 1.5 px inside the rail). */
  board0: {x0: 120, y0: 680, x1: 680, y1: 1240} as Rect,
  board1: {x0: 220, y0: 680, x1: 780, y1: 1240} as Rect,
  boardDriftPxS: 100 / 4.06,
  /** The F11 clause block starts at y >= 920 (keeps Pip >= 200 px away on the corner post). Up at the cut. */
  clauseTopMinY: 920,
  purposeLineAt: 24.03,
  f12LineAt: 26.4,
  /** The low limestone facade band (cut by both edges) + its service door; the facade plane drifts ~10 px/s. */
  facadeBandY: [705, 835] as const,
  serviceDoor0: {x0: 900, y0: 735, x1: 1020, y1: 835} as Rect,
  facadeDriftPxS: 10,
  doorShutsAt: [25.0, 27.4] as const,
  facadeWindowsLight: [27.08, 27.8] as const,
  nearCrossPxS: 65,
  /** Pip on the fence's tall corner post, right of the board, watching the service door: (770, 720) -> (870, 720). */
  pipSeat0: {x: 770, y: 720} as Seat,
  pipSeat1: {x: 870, y: 720} as Seat,
  pipLandBy: 24.12,
  pipEarFlickAt: 26.5,
  pipHopAt: 27.95,
  sun: SUN2,
  /** Near plane: three readers' head-backs cut by the bottom (240-300 px, x 60-700), crossing with the truck. */
  nearHeads: {x0: 60, x1: 700, hPx: [240, 300] as const},
} as const;
const s6u = (t: number): number => Math.min(28.06, Math.max(24, t)) - 24;
export const s6BoardAt = (t: number): Rect => shiftRect(S6.board0, s6u(t) * S6.boardDriftPxS);
export const s6PipSeatAt = (t: number): Seat => ({x: S6.pipSeat0.x + s6u(t) * S6.boardDriftPxS, y: S6.pipSeat0.y});
export const s6ServiceDoorAt = (t: number): Rect => shiftRect(S6.serviceDoor0, s6u(t) * S6.facadeDriftPxS);

export const S7 = {
  /** Google's A-board GOOGLE SAYS at B (exact at the push landing 30.04). Plain lit windows behind it, no silhouettes. */
  board: B,
  /** The canopy "Google", right of the board. */
  canopyGoogle: {x0: 660, y0: 760, x1: 900, y1: 810} as Rect,
  parapetMinY: 600,
  sun: SUN2,
  pipSeat: BOARD_BOLLARD,
  /** The ONE 4 % story push 28.40-30.04 about B's centre (ease in-out), landing on "principles". */
  camera: {push: {from: 1 / 1.04, to: 1.0, t0: 28.4, t1: 30.04, anchor: rectCentre(B), ease: 'inOut'} as ZoomKey, floatPxS: [8, 12] as const},
  boardBeats: [
    {t: 28.36, what: 'GOOGLE SAYS header + board clack'},
    {t: 29.65, what: 'follows its "AI principles" pen-draws (56 px), complete on 30.04'},
    {t: 30.04, what: 'the string lights come on in a run'},
    {t: 30.3, what: 'small row: Google\'s AI Principles: "human oversight" (20 px, F16)'},
    {t: 30.74, what: 'bans retaliation "of any kind" pen-draws (56 px), complete on 32.08'},
  ],
  /** Bottom third: two cafe tables, seated backs (heads 200-260 px) cut by the bottom-left; fountain rim bottom-right. */
  uninterruptedTo: 32.7,
} as const;

export const S8 = {
  /** Her board (the cafe boat's quote-of-the-day A-board): x -100-380 before the truck, B after. */
  boardPre: {x0: -100, y0: 700, x1: 380, y1: 1220} as Rect,
  board: B,
  /** The ONE plain truck left 34.99-35.60 (ease in-out, inside the pause). Screen shift per plane (px, rightward). */
  truck: {t0: 34.99, t1: 35.6, boardPlaneDx: 250, ghostPlaneDx: 240, housePlaneDx: 160, skyDx: 0},
  /** Her teal door at the bend (house plane): x 520-610 -> 680-770, y 880-1060. */
  doorPre: {x0: 520, y0: 880, x1: 610, y1: 1060} as Rect,
  door: {x0: 680, y0: 880, x1: 770, y1: 1060} as Rect,
  /** W above-right of the door (house plane): (700, 700) -> (860, 700) = W, the loop seam. */
  wPre: {x: 700, y: 700, w: 150, h: 170} as Spot,
  w: W,
  sun: SUN8,
  /** Pip rides the wiping narrowboat in, hops to the board bollard 33.20 (pre-truck (450, 1205)), rides the truck. */
  pipSeatPre: {x: 450, y: 1205} as Seat,
  pipSeat: BOARD_BOLLARD,
  /** She walks home (back, ~150 px) from 33.16, from the near right toward her door; reaches it 34.55; it shuts 34.75;
   *  W lights 34.95 (the picture S3 showed). Pre-truck spot at 33.78 (suggested). */
  her: {x: 640, feetY: 1095, h: 150} as Fig,
  herWalkFrom: 33.16,
  herAtDoor: 34.55,
  doorShuts: 34.75,
  wLights: 34.95,
  wipeBoardAt: 35.72,
  quotePenAt: 36.54,
  lampRunAt: 37.18,
  pipLooksUpAt: 37.7,
  /**
   * The three callback ghosts (G4-G6's cues, 140 -> 130 px), popping on "can't" 33.78 AHEAD of her: on the towpath
   * beyond her, left of her door and right of her board's edge (pre-truck), so her path to the door stays clear. They
   * stand on a plane just behind the board (truck dx 240), so the truck slides them in front of her SHUT door (from
   * 34.75): after the truck the only legal strip right of B and left of the rail is x 632-780. Whole, never over B,
   * never over Pip; they stay to the seam and un-build last with her window. Spots at the landing pose.
   */
  ghosts: [
    {id: 'S8G4', x: 658, feetY: 1084, h: 140},
    {id: 'S8G5', x: 696, feetY: 1072, h: 135},
    {id: 'S8G6', x: 734, feetY: 1060, h: 130},
  ] as (Fig & {id: string})[],
  ghostsPopAt: 33.78,
  /** Float 8-15 px/s 37.70-38.82 that turns back to the landing pose by 38.82; un-build 38.82-39.08 into S1's t < 0. */
  unbuild: {t0: 38.82, t1: 39.08, f0: 2329, f1: 2345},
  /** Bottom third: the cafe boat's stern deck x 0-560; NO near heads (only the board rhymes with S7). */
  sternDeck: {x0: 0, y0: 1300, x1: 560, y1: FRAME_H} as Rect,
} as const;
/** S8 truck progress (0 before 34.99, 1 after 35.60). */
export const s8TruckU = (t: number): number => EASE.inOut(prog(t, S8.truck.t0, S8.truck.t1));

// ---------------------------------------------------------------------------------------------------------------
// 8. Pip (TREATMENT section 3): seats per shot, beats, and the global rules.
// ---------------------------------------------------------------------------------------------------------------
export const PIP_RULES = {
  hPx: [86, 120] as const,
  /** Never in the caption band, never in the right rail, never over HER, >= 200 px from the F11 clause. */
  never: ['captionBand', 'rightRail', 'overHer', 'within200pxOfClause'] as const,
  /** Pip's hop / leap arcs stay at y >= 600 (they never cross the band; S3's exit leaves through the LEFT edge). */
  arcMinY: 600,
  /** One reaction per shot, never a gag near harm, none on Google's beat. */
  oneReactionPerShot: true,
} as const;

export type PipBeat = {t: number; what: string};
export type PipShot = {shot: ShotId; seat: Seat; seatEnd?: Seat; hEnd?: number; beats: PipBeat[]; reaction: string};
export const PIP: PipShot[] = [
  {shot: 'V2S1', seat: S1_BOLLARD, reaction: 'ears-cover on "life"', beats: [
    {t: 0, what: 'already in colour at f0 on the waterline bollard'},
    {t: 1.25, what: 'head follows her'},
    {t: 4.98, what: 'EARS-COVER (+ ear flap)'},
    {t: 5.9, what: 'hops up-left into the dive (arc at y >= 600)'},
  ]},
  {shot: 'V2S2', seat: S2.pipSeat, reaction: 'head turns to the wall on "But"', beats: [
    {t: 6.7, what: 'landed on the railing post behind the bench by the end of the pull-back'},
    {t: 8.3, what: '"But": its head turns to the wall (leads the eye; no shrug, no double-take)'},
    {t: 12.85, what: 'hops toward W2 (crosses the match-cut on PIP_HOP_S2_S3)'},
  ]},
  {shot: 'V2S3', seat: S3.pipSeat, reaction: 'turns to her on "she"', beats: [
    {t: 13.1, what: 'lands on her window box (soft land)'},
    {t: 13.9, what: 'turns to her on "she"'},
    {t: 14.7, what: 'leaps up-LEFT and leaves through the left edge at y 620-700 (never through the top: the band)'},
  ]},
  {shot: 'V2S4', seat: S4.pipSeat, reaction: 'turns west on "heading"', beats: [
    {t: 14.86, what: 'mid-air at the cut, descending down-left LEFT of her (x 520-640, y 940-1060): never over her'},
    {t: 14.95, what: 'lands on the boat roof'},
    {t: 19.55, what: 'turns west (leads "heading")'},
    {t: 20.25, what: 'hops toward the sun (mid-air at the cut 20.55; arc at y >= 600)'},
  ]},
  {shot: 'V2S5', seat: S5.start.pipSeat, seatEnd: S5.end.pipSeat, hEnd: 44, reaction: 'looks up at the calendar sun', beats: [
    {t: 20.55, what: 'comes down out of the sun\'s direction onto the bench beside the stranger (seated by 20.70)'},
    {t: 20.76, what: 'looks up at the calendar sun; the scale anchor through the move (>= 44 px at the end)'},
    {t: 23.9, what: 'leaps up-right'},
  ]},
  {shot: 'V2S6', seat: S6.pipSeat0, seatEnd: S6.pipSeat1, reaction: 'one ear flick on "veto" (no droop)', beats: [
    {t: 24.0, what: 'lands on the fence\'s tall corner post right of the board (by 24.12), watching the service door'},
    {t: 26.5, what: 'one ear flick on "veto"'},
    {t: 27.95, what: 'hops'},
  ]},
  {shot: 'V2S7', seat: BOARD_BOLLARD, reaction: 'NONE (sit-watch; neutral on Google\'s beat: no tilt, no nod)', beats: [
    {t: 28.2, what: 'sit-watch at the board bollard (the same pose as S8)'},
  ]},
  {shot: 'V2S8', seat: S8.pipSeatPre, seatEnd: BOARD_BOLLARD, reaction: 'ears down on "can\'t"', beats: [
    {t: 32.93, what: 'rides the wiping narrowboat in'},
    {t: 33.2, what: 'hops to the board bollard (pre-truck (450, 1205)); rides the truck to (700, 1205)'},
    {t: 33.78, what: 'ears down on "can\'t"'},
    {t: 37.7, what: 'looks up at W on "not"'},
    {t: 38.82, what: 'hops to f0\'s bollard (700, 1235) on the un-build'},
  ]},
];
export const pipShot = (id: ShotId): PipShot => PIP.find((p) => p.shot === id) as PipShot;

/** Pip's hop across the S2 -> S3 window match-cut: ONE screen-space arc both lanes evaluate.
 *  From the S2 seat at the push's 1.06 (605, 1066) at 12.85 to the S3 seat at 13.10, apex 50 px. */
export const PIP_HOP_S2_S3 = {t0: 12.85, t1: 13.1, from: scaleAbout(S2.pipSeat, S2.camera.push.anchor, 1.06), to: S3.pipSeat, apexPx: 50};
export const pipHopS2S3At = (t: number): XY => {
  const {t0, t1, from, to, apexPx} = PIP_HOP_S2_S3;
  const u = prog(t, t0, t1);
  return {x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u - apexPx * 4 * u * (1 - u)};
};

// ---------------------------------------------------------------------------------------------------------------
// 9. MATCH POINTS: what BOTH lanes of every cut hit, in SCREEN space at the cut
// ---------------------------------------------------------------------------------------------------------------
/** side: which shot draws it ('out' = the outgoing shot, 'in' = the incoming one, 'both' = the same screen spot in both). */
export type MatchShape = {label: string; side: 'out' | 'in' | 'both'; spot?: Spot; disc?: Disc; rect?: Rect; seat?: Seat};
export type MatchPoint = {cut: string; t: number; f: number; out: ShotId; in: ShotId; kind: string; shapes: MatchShape[]; rule: string};

export const MATCHES: MatchPoint[] = [
  {
    cut: 'S1 -> S2 push-through', t: 6.1, f: frameOf(6.1), out: 'V2S1', in: 'V2S2', kind: 'push-through 5.95-6.25 (plum bridge, zoom 12, inkComp 0.6)',
    shapes: [
      {label: 'S1: dive INTO W (her dark office window)', side: 'out', spot: W},
      {label: 'S2: pull back OUT of her dark window', side: 'in', spot: S2.herDarkWindow},
    ],
    rule: 'Film push-through {from [860, 700], to [200, 795], bridge #36223A, inkComp 0.6, dur 0.30}; S2 then pulls 1.12 -> 1.00 on the same window 6.10-6.70.',
  },
  {
    cut: 'S2 -> S3 window match-cut', t: 12.98, f: frameOf(12.98), out: 'V2S2', in: 'V2S3', kind: 'matchcut 12.81-13.16',
    shapes: [
      {label: 'W2 (S2 staff window, blind down) = her French window (S3, blind up)', side: 'both', spot: W2_CUT},
      {label: 'Pip mid-hop', side: 'both', seat: pipHopS2S3At(12.98)},
    ],
    rule: 'W2 centre (335, 785), 133 x 164 in BOTH shots at 12.98; Pip on PIP_HOP_S2_S3 on both sides of the cut.',
  },
  {
    cut: 'S3 -> S4 cut on action', t: 14.86, f: frameOf(14.86), out: 'V2S3', in: 'V2S4', kind: "cut on Pip's leap",
    shapes: [
      {label: 'S3: Pip leaving up-left through the left edge', side: 'out', rect: {x0: 0, y0: 620, x1: 120, y1: 700}},
      {label: 'S4: Pip mid-air, descending down-left (left of her)', side: 'in', rect: {x0: 520, y0: 940, x1: 640, y1: 1060}},
    ],
    rule: 'Pip moves LEFT (west) on both sides, rising in S3, falling in S4; it lands on the boat roof (470, 1218) at 14.95, never crossing her.',
  },
  {
    cut: 'S4 -> S5 sun match-cut', t: 20.55, f: frameOf(20.55), out: 'V2S4', in: 'V2S5', kind: 'matchcut on SUN1 (inside the 20.10-20.67 pause)',
    shapes: [{label: 'SUN1 in both', side: 'both', disc: SUN1}],
    rule: 'SUN1 centre (250, 650), r 65 on screen at 20.55 in BOTH; S4 draws r 61.3 at its pose so its 6 % push lands r 65.',
  },
  {
    cut: 'S5 -> S6 cut on action', t: 24.0, f: frameOf(24.0), out: 'V2S5', in: 'V2S6', kind: 'cut on Pip\'s leap (on "any", the one cut outside a pause)',
    shapes: [
      {label: 'S5: Pip leaps up-right from the balustrade (23.90)', side: 'out', seat: S5.end.pipSeat},
      {label: 'S6: Pip lands on the corner post by 24.12', side: 'in', seat: S6.pipSeat0},
      {label: 'S6: the deal board UP at the cut (frame, tag, FULL clause, credit)', side: 'in', rect: S6.board0},
    ],
    rule: 'Pip moves up-right on both sides; the clause is readable from 24.00, the purpose line pops ON "any" 24.03.',
  },
  {
    cut: 'S6 -> S7 sun match-cut', t: 28.06, f: frameOf(28.06), out: 'V2S6', in: 'V2S7', kind: 'matchcut on SUN2 (27.82-28.31)',
    shapes: [{label: 'SUN2 in both (S6 morning = S7 sunset)', side: 'both', disc: SUN2}],
    rule: 'SUN2 centre (260, 620), r 45 in BOTH at 28.06 (19 px clear of the band, >= 15 px above every board top).',
  },
  {
    cut: 'S7 -> S8 foreground wipe', t: 32.93, f: frameOf(32.93), out: 'V2S7', in: 'V2S8', kind: "foreground-wipe 32.70-33.16, S7's Wiper (a narrowboat, dir left)",
    shapes: [
      {label: "S7: Google's board (at 32.70)", side: 'out', rect: B},
      {label: 'S8: her board before the truck', side: 'in', rect: S8.boardPre},
    ],
    rule: "The bow enters only after 32.70 (Google's beat is never cut short); the wipe clears to S8 by 33.16 (board clack).",
  },
  {
    cut: 'S8 -> S1 loop (un-build)', t: 39.08, f: DURATION_F, out: 'V2S8', in: 'V2S1', kind: 'unbuild 38.82-39.08 onto S1 t < 0 (captions back at 39.04)',
    shapes: [
      {label: 'S8 end: her lit HOME window = W', side: 'out', spot: W},
      {label: 'S1 f0: her OFFICE window (zoom 1.05 about W)', side: 'in', spot: scaleSpotAbout(W, W, 1.05)},
      {label: "S8: Pip on the board bollard (700, 1205)", side: 'out', seat: BOARD_BOLLARD},
      {label: "S1 f0: Pip on the waterline bollard (700, 1235)", side: 'in', seat: S1_BOLLARD},
    ],
    rule: 'W centre identical; size 150 x 170 (S8) vs 157.5 x 178.5 (S1 f0 at zoom 1.05): S8 may end its last float on a 1.05 push about W to make it exact.',
  },
];

// ---------------------------------------------------------------------------------------------------------------
// 10. The bottom third, y 1250-1920 (TREATMENT section 5): never flat paving or bare water, nothing to read.
// ---------------------------------------------------------------------------------------------------------------
export const BOTTOM_THIRD: Record<ShotId, string> = {
  V2S1: 'our canal-side steps: five broad stone steps (edges 3.4-4.8 px), ~14 seated backs in three rows: near heads cut by the bottom (250-330 px: a hood, a beanie, a low bun with a mustard scarf, curls, a cap), a middle row (~110 px), a low row by the water (~60 px); cups, tote bags, a dog lying down, a bike cut by the bottom-right',
  V2S2: 'our towpath: broken paving lines, leaves, a drain cover, the A-board and bench legs; a planter of grasses cut by the left edge (x 0-230, y 1290-1650); a bike locked to a lamp-post whose foot is cut by the bottom-right (x 860-960); two head-backs cut by the bottom (260-320 px, x 300-720: a beanie, a cap); a dog nosing a leaf',
  V2S3: 'the narrowboat moored along our bank, cut by both edges: roof y ~1260-1330 (herb pots, a bike, a coiled rope, a chimney with smoke), cabin side y 1330-1580 (sage, plum gunwale stripe, cream portholes); our coping; our towpath y 1640-1920 with two head-backs cut by the bottom (260-300 px) and a lamp-post foot bottom-right',
  V2S4: 'the narrowboat beside us: cabin side y 1290-1660 (sage, plum gunwale stripe, cream portholes with curtains, a painted flower panel, fenders); water y 1700-1920 with the wake and floating leaves',
  V2S5: "start: the bench front, the stranger's bag, petal-strewn paving, the news box's base, a tree root cut by the bottom-left. End: the terrace floor from the crane's height (paving joints, petal drifts, a bench, a bin, a stroller), roots bottom-left, the lamppost base bottom-right",
  V2S6: "the fence's kerb and tulip beds; three readers' head-backs cut by the bottom (240-300 px, x 60-700) crossing with the truck; a bike rack and a bench in the rail",
  V2S7: 'the forecourt: two cafe tables with seated backs (heads 200-260 px cut by the bottom-left), a bike rack, a planter of grasses, paving joints, the fountain basin rim bottom-right',
  V2S8: "the cafe boat's stern deck bottom-left (x 0-560: two small tables, mugs, a folded chair, a potted bay, a coiled rope), towpath paving with leaves and a drain, a planter and a lamp-post foot bottom-right. NO near heads",
};

// ---------------------------------------------------------------------------------------------------------------
// 11. shotShapes(id, t): every contract shape of a shot at time t, in SCREEN px (the MapContract sheet + the checks)
// ---------------------------------------------------------------------------------------------------------------
/** key = a key read (inside x 120-880 / y 290-1250, never the rail); text = lettering (a board, a plate, a tag: also
 *  never the rail); her / ghost / pip / sun / figure = story actors; mass = dressing that may run into the rail and
 *  under y 1250; line = a reference line (towpath, horizon); match = a match point at a cut. */
export type ShapeRole = 'key' | 'text' | 'her' | 'ghost' | 'pip' | 'sun' | 'figure' | 'mass' | 'line' | 'match';
export type Shape =
  | {kind: 'rect'; role: ShapeRole; label: string; r: Rect}
  | {kind: 'disc'; role: ShapeRole; label: string; d: Disc}
  | {kind: 'fig'; role: ShapeRole; label: string; f: Fig; aspect?: number; outline?: boolean}
  | {kind: 'pip'; role: 'pip'; label: string; s: Seat; h: number}
  | {kind: 'line'; role: ShapeRole; label: string; pts: XY[]};

const R = (role: ShapeRole, label: string, r: Rect): Shape => ({kind: 'rect', role, label, r});
const D = (role: ShapeRole, label: string, d: Disc): Shape => ({kind: 'disc', role, label, d});
const F = (role: ShapeRole, label: string, f: Fig, aspect?: number, outline?: boolean): Shape => ({kind: 'fig', role, label, f, aspect, outline});
const P = (label: string, s: Seat, h = 104): Shape => ({kind: 'pip', role: 'pip', label, s, h});
const L = (role: ShapeRole, label: string, pts: XY[]): Shape => ({kind: 'line', role, label, pts});

/** Map every shape through one point transform (a camera zoom about an anchor, a shift). */
const mapShapes = (shapes: Shape[], fn: (p: XY) => XY, k: number): Shape[] =>
  shapes.map((s) => {
    if (s.kind === 'rect') {
      const a = fn({x: s.r.x0, y: s.r.y0});
      const b = fn({x: s.r.x1, y: s.r.y1});
      return {...s, r: {x0: a.x, y0: a.y, x1: b.x, y1: b.y}};
    }
    if (s.kind === 'disc') return {...s, d: {...fn(s.d), r: s.d.r * k}};
    if (s.kind === 'fig') {
      const p = fn({x: s.f.x, y: s.f.feetY});
      return {...s, f: {x: p.x, feetY: p.y, h: s.f.h * k}};
    }
    if (s.kind === 'pip') return {...s, s: fn(s.s), h: s.h * k};
    return {...s, pts: s.pts.map(fn)};
  });
const zoomShapes = (shapes: Shape[], key: ZoomKey, t: number): Shape[] => {
  const z = zoomAt(key, t);
  return z === 1 ? shapes : mapShapes(shapes, (p) => scaleAbout(p, key.anchor, z), z);
};

const s1Shapes = (t: number): Shape[] => {
  const sh = S1_SHEET;
  const world: Shape[] = [
    L('line', 'parapet (y 600 -> 640 at the west corner)', [{x: 330, y: sh.parapetY.atX330}, {x: FRAME_W, y: sh.parapetY.atX1080}]),
    R('mass', "Google's canal wing (two storeys)", {x0: 330, y0: 600, x1: FRAME_W, y1: 1082}),
    R('mass', 'ground storey 3.2 m (288 px)', {x0: 330, y0: sh.groundStorey.y0, x1: FRAME_W, y1: sh.groundStorey.y1}),
    R('key', 'glass double door 2.0 x 2.6 m', sh.door),
    R('text', 'canopy "Google" (48 px letters)', sh.canopyFascia),
    R('key', 'W: her office window (dark 0.40)', spotRect(W)),
    R('mass', 'west gap: far roofs y ~790, bridge deck ~960', {x0: 0, y0: sh.farRoofTopY, x1: 330, y1: 1095}),
    L('line', 'bridge deck y 960', [{x: 0, y: sh.bridgeDeckY}, {x: 330, y: sh.bridgeDeckY}]),
    D('sun', 'SUN0 (200, 690) r 80', SUN0),
    L('line', 'her line: far towpath feet (bend)', S1_TOWPATH_FEET),
    L('line', 'horizon y 965 (hidden)', [{x: 0, y: S1_LENS.horizonY}, {x: FRAME_W, y: S1_LENS.horizonY}]),
    R('mass', 'water y 1110-1215', {x0: 0, y0: sh.water.y0, x1: FRAME_W, y1: sh.water.y1}),
    R('mass', 'two moored boats (masses)', sh.boatsRight),
    R('mass', 'our steps: ~14 seated backs (near heads 250-330 px)', {x0: 0, y0: 1290, x1: FRAME_W, y1: FRAME_H}),
    R('mass', 'hero cloud (2 px/s)', sh.heroCloud),
    R('mass', 'plane branch', sh.planeBranch),
  ];
  const row = s1RowAt(Math.max(t, 0)).filter((m) => m.visible).map((m) =>
    F(m.kind === 'her' ? 'her' : 'ghost', `${m.id} ${Math.round(m.h)} px`, {x: m.x, feetY: m.feetY, h: m.h}, FIGURE_ASPECT_OVERLAY, m.kind === 'outline'));
  const all = [...world, ...row, P('Pip: waterline bollard (700, 1235)', S1_BOLLARD)];
  const z = s1Zoom(t);
  return z === 1 ? all : mapShapes(all, (p) => scaleAbout(p, S1_CAMERA.pullOut.anchor, z), z);
};

const s2Shapes = (t: number): Shape[] => {
  const base: Shape[] = [
    R('mass', 'the wing in 3/4 (cut by the left edge, receding right; ~400 windows)', {x0: 0, y0: 600, x1: 900, y1: 1030}),
    L('line', 'first-storey row y 700-880 at the left', [{x: 0, y: 700}, {x: 900, y: 760}]),
    L('line', 'ground row y 900-1010 at the left', [{x: 0, y: 1010}, {x: 900, y: 940}]),
    R('key', 'her dark window (ring 6.82)', spotRect(S2.herDarkWindow)),
    ...S2.staffWindows.map((w) => R('key', `${w.id} ${w.w} x ${w.h}`, spotRect(w))),
    ...(t >= S2.aBoardOutAt ? [R('text', 'A-board TOLD THE BBC (8.44)', S2.aBoard)] : []),
    R('mass', 'bench', S2.bench),
    F('figure', 'reporter (seated back)', S2.reporter, SEATED_ASPECT_OVERLAY),
    F('figure', 'staffer >= 180 px seated (hood 10.36)', S2.staffer, SEATED_ASPECT_OVERLAY),
    P('Pip: railing post (590, 1050)', S2.pipSeat),
    R('mass', 'planter of grasses', {x0: 0, y0: 1290, x1: 230, y1: 1650}),
    R('mass', 'two head-backs cut by the bottom', {x0: 300, y0: 1600, x1: 720, y1: FRAME_H}),
    R('mass', 'bike + lamp-post foot', {x0: 860, y0: 1250, x1: 960, y1: FRAME_H}),
  ];
  return zoomShapes(zoomShapes(base, S2.camera.pullBack, t), S2.camera.push, t);
};

const s3Shapes = (t: number): Shape[] => {
  const base: Shape[] = [
    R('mass', 'her terrace (two storeys + mansard, tops at y >= 600)', {x0: 0, y0: 600, x1: FRAME_W, y1: 1060}),
    R('key', 'her French window = W2_CUT (blind UP, lamp on)', spotRect(W2_CUT)),
    F('her', 'her silhouette >= 137 px, phone', S3.silhouette),
    R('mass', 'window box', S3.windowBox),
    P('Pip: window box (462, 878)', S3.pipSeat),
    R('mass', 'water', {x0: 0, y0: 1080, x1: FRAME_W, y1: 1260}),
    R('mass', 'moored narrowboat (roof 1260-1330, cabin 1330-1580)', {x0: 0, y0: 1260, x1: FRAME_W, y1: 1580}),
    R('mass', 'our towpath + two head-backs', {x0: 0, y0: 1640, x1: FRAME_W, y1: FRAME_H}),
  ];
  return zoomShapes(base, S3.camera.easeBack, t);
};

const s4Shapes = (t: number): Shape[] => {
  const base: Shape[] = [
    R('mass', 'terrace backs, warehouses, gasholders, viaduct (tops >= 600)', {x0: 0, y0: 600, x1: FRAME_W, y1: 860}),
    D('sun', 'SUN1 at the pose (r 61.3 -> 65 at the cut)', S4.sunAtPose),
    R('mass', 'her towpath y 860-1080', {x0: 0, y0: 860, x1: FRAME_W, y1: 1080}),
    L('line', 'the post (x ~575)', [{x: S4.post.x, y: S4.post.topY}, {x: S4.post.x, y: S4.post.footY}]),
    ...(t >= S4.decPlateAt ? [R('text', 'plate DEC 2025 (56 px) / unclassified', S4.plateDec2025)] : []),
    ...(t >= S4.aprPlatePen[0] ? [R('text', 'plate APR 2026 / classified', S4.plateApr2026)] : []),
    ...(t >= S4.nameTagBuilds[0] && t < S4.nameTagOffAt ? [R('text', 'name tag (15.07 / 16.60, off 18.80)', S4.nameTag)] : []),
    F('her', 'her 170 px, profile, walking left', S4.her),
    R('mass', 'narrowboat roof edge y ~1220 + cabin 1290-1660', {x0: 0, y0: 1220, x1: FRAME_W, y1: 1660}),
    P('Pip: boat roof (470, 1218)', S4.pipSeat),
    R('mass', 'water + wake', {x0: 0, y0: 1700, x1: FRAME_W, y1: FRAME_H}),
  ];
  return zoomShapes(base, S4.camera.push, t);
};

const s5Shapes = (t: number): Shape[] => {
  const p = S5_EASE(prog(t, S5.move.t0, S5.move.t1));
  if (p < 0.5) {
    const s = S5.start;
    return [
      R('mass', 'blossoming canopy (warm-dark)', {x0: 0, y0: 600, x1: FRAME_W, y1: 1060}),
      R('key', 'the bright slot', s.slot),
      D('sun', 'SUN1 (calendar APRIL 2026 20.76-21.20)', s.sun),
      R('mass', 'bench', s.bench),
      F('figure', 'the stranger (back, newspaper)', s.stranger, SEATED_ASPECT_OVERLAY),
      P('Pip: beside the stranger', s.pipSeat),
      R('text', 'news box (headline 40 px x 3 + credit)', s.newsBox),
      R('mass', 'bench front, paving, root', {x0: 0, y0: 1250, x1: FRAME_W, y1: FRAME_H}),
    ];
  }
  const e = S5.end;
  return [
    L('line', 'horizon y ~800', [{x: 0, y: e.horizonY}, {x: FRAME_W, y: e.horizonY}]),
    R('mass', 'cloud bank (top >= 610), cut by the right edge', {x0: 560, y0: 610, x1: FRAME_W, y1: 800}),
    R('key', 'the obelisk (top >= 610)', {x0: 380, y0: 610, x1: 410, y1: 800}),
    R('mass', 'the low white city + the Potomac', {x0: 0, y0: 760, x1: FRAME_W, y1: 880}),
    R('key', 'the Pentagon: two facades + rings past the right edge (plaque 22.43)', {x0: 300, y0: 870, x1: FRAME_W, y1: 1050}),
    R('mass', 'parkway, tiny cars, lawns with joggers', {x0: 0, y0: 1050, x1: FRAME_W, y1: 1180}),
    F('figure', 'the stranger (tiny)', e.stranger, FIGURE_ASPECT_OVERLAY),
    P('Pip >= 44 px (the scale anchor)', e.pipSeat, 48),
    R('mass', 'terrace floor from the crane height', {x0: 0, y0: 1250, x1: FRAME_W, y1: FRAME_H}),
  ];
};

const s6Shapes = (t: number): Shape[] => {
  const b = s6BoardAt(t);
  return [
    D('sun', 'SUN2 (lands at the cut)', SUN2),
    R('mass', 'limestone facade band (y 705-835)', {x0: 0, y0: 705, x1: FRAME_W, y1: 835}),
    R('mass', 'service door (shuts 25.0, 27.4)', s6ServiceDoorAt(t)),
    R('text', 'the deal board 560 x 560 (clause first; purpose on "any")', b),
    R('text', 'the F11 clause block (top >= 920)', {x0: b.x0 + 20, y0: S6.clauseTopMinY, x1: b.x1 - 20, y1: b.y1 - 70}),
    P('Pip: corner post (ear flick 26.50)', s6PipSeatAt(t)),
    R('mass', 'kerb, tulip beds, near posts + blossom (65 px/s)', {x0: 0, y0: 1240, x1: FRAME_W, y1: 1400}),
    R('mass', "three readers' head-backs (240-300 px)", {x0: S6.nearHeads.x0, y0: 1620, x1: S6.nearHeads.x1, y1: FRAME_H}),
  ];
};

const s7Shapes = (t: number): Shape[] => {
  const base: Shape[] = [
    D('sun', 'SUN2 (west gap past the corner)', SUN2),
    R('mass', 'the canal wing at human size (parapet >= 600)', {x0: 330, y0: 600, x1: FRAME_W, y1: 1080}),
    R('text', 'canopy "Google"', S7.canopyGoogle),
    R('text', "B: Google's board GOOGLE SAYS", B),
    L('line', 'B legs to 1250', [{x: B.x0 + 40, y: B.y1}, {x: B.x0 + 40, y: B_LEGS_Y1}]),
    P('Pip: board bollard (700, 1205)', BOARD_BOLLARD),
    R('mass', 'cafe tables, seated backs (heads 200-260 px)', {x0: 0, y0: 1400, x1: 620, y1: FRAME_H}),
    R('mass', 'fountain basin rim', {x0: 760, y0: 1500, x1: FRAME_W, y1: FRAME_H}),
  ];
  return zoomShapes(base, S7.camera.push, t);
};

const s8Shapes = (t: number): Shape[] => {
  const u = s8TruckU(t);
  const tr = S8.truck;
  const dxB = -tr.boardPlaneDx * (1 - u);
  const dxG = -tr.ghostPlaneDx * (1 - u);
  const dxH = -tr.housePlaneDx * (1 - u);
  const out: Shape[] = [
    D('sun', 'S8 low sun (420, 640) r 40', SUN8),
    R('mass', 'her terrace at the bend (house plane)', shiftRect({x0: 640, y0: 600, x1: FRAME_W + 160, y1: 1060}, dxH)),
    R('key', 'W: her home window (lights 34.95)', shiftRect(spotRect(W), dxH)),
    R('key', 'her teal door (shuts 34.75)', shiftRect(S8.door, dxH)),
    R('text', 'her board (SHE SAYS; quote 36.54)', shiftRect(B, dxB)),
    P('Pip: board bollard', {x: BOARD_BOLLARD.x + dxB, y: BOARD_BOLLARD.y}),
    R('mass', "the cafe boat's stern deck", S8.sternDeck),
    R('mass', 'planter + lamp-post foot', {x0: 860, y0: 1300, x1: FRAME_W, y1: FRAME_H}),
  ];
  if (t < S8.doorShuts) out.push(F('her', 'her walking home (~150 px)', S8.her));
  if (t >= S8.ghostsPopAt) S8.ghosts.forEach((g) => out.push(F('ghost', `${g.id} ${g.h} px`, {x: g.x + dxG, feetY: g.feetY, h: g.h})));
  return out;
};

/** Every contract shape of a shot at film time t (default: its pose), in SCREEN px. */
export const shotShapes = (id: ShotId, t: number = POSE_T[id]): Shape[] => {
  switch (id) {
    case 'V2S1': return s1Shapes(t);
    case 'V2S2': return s2Shapes(t);
    case 'V2S3': return s3Shapes(t);
    case 'V2S4': return s4Shapes(t);
    case 'V2S5': return s5Shapes(t);
    case 'V2S6': return s6Shapes(t);
    case 'V2S7': return s7Shapes(t);
    default: return s8Shapes(t);
  }
};

/** A shape's bounding rect (lines included). */
export const shapeRect = (s: Shape): Rect => {
  if (s.kind === 'rect') return s.r;
  if (s.kind === 'disc') return discRect(s.d);
  if (s.kind === 'fig') return figRect(s.f, s.aspect ?? FIGURE_ASPECT_OVERLAY);
  if (s.kind === 'pip') return pipBox(s.s, s.h);
  const xs = s.pts.map((p) => p.x);
  const ys = s.pts.map((p) => p.y);
  return {x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys)};
};

// ---------------------------------------------------------------------------------------------------------------
// 12. Contract self-check: the numbers against the rules, at each shot's key moments.
// ---------------------------------------------------------------------------------------------------------------
export type ContractIssue = {shot: ShotId | 'ALL'; t: number; what: string; severity: 'error' | 'note'};

/** The moments each shot is checked at (its pose + its key beats). */
export const CHECK_T: Record<ShotId, number[]> = {
  V2S1: [0, 2.0, 4.98, 5.3],
  V2S2: [6.7, 8.96, 10.36, 12.98],
  V2S3: [12.98, 13.6, 14.28],
  V2S4: [16.6, 17.96, 19.8, 20.55],
  V2S5: [21.0, 23.8],
  V2S6: [24.0, 26.5, 28.06],
  V2S7: [28.06, 30.04, 32.08],
  V2S8: [33.78, 34.0, 35.6, 37.18, 38.82],
};

export const contractProblems = (): ContractIssue[] => {
  const out: ContractIssue[] = [];
  const band = UI.captionBand;
  const rail = UI.rightRail;
  const key = UI.keyRead;
  SHOT_IDS.forEach((id) => {
    CHECK_T[id].forEach((t) => {
      const shapes = shotShapes(id, t);
      shapes.forEach((s) => {
        const r = shapeRect(s);
        const rf = {x0: Math.max(0, r.x0), y0: r.y0, x1: Math.min(FRAME_W, r.x1), y1: r.y1};
        if (rf.x1 <= rf.x0) return; // off-frame (before a truck)
        if (s.role !== 'line' && s.role !== 'mass' && overlaps(rf, band)) out.push({shot: id, t, what: `${s.label} enters the caption band (y ${r.y0.toFixed(0)})`, severity: 'error'});
        if (s.role === 'mass' && overlaps(rf, band)) out.push({shot: id, t, what: `mass "${s.label}" enters the caption band`, severity: 'error'});
        if ((s.role === 'pip' || s.role === 'text') && overlaps(rf, rail)) out.push({shot: id, t, what: `${s.label} enters the right rail`, severity: 'error'});
        if ((s.role === 'key' || s.role === 'her' || s.role === 'ghost') && overlaps(rf, rail)) out.push({shot: id, t, what: `${s.label} enters the right rail`, severity: 'note'});
        if ((s.role === 'key' || s.role === 'text' || s.role === 'her' || s.role === 'ghost' || s.role === 'pip') && !inside(rf, key)) {
          const by = Math.max(key.x0 - rf.x0, rf.x1 - key.x1, key.y0 - rf.y0, rf.y1 - key.y1);
          out.push({shot: id, t, what: `${s.label} leaves the key-read box by ${by.toFixed(0)} px`, severity: 'note'});
        }
        if ((s.role === 'ghost' || s.role === 'her') && s.kind === 'fig' && !s.outline && s.f.h < LEGIBILITY.carrierFigureMinH) out.push({shot: id, t, what: `${s.label}: ${s.f.h.toFixed(0)} px < 130`, severity: 'error'});
        if (s.kind === 'fig' && s.outline && s.f.h < LEGIBILITY.carrierFigureMinH) out.push({shot: id, t, what: `${s.label}: the outlines carry "the row goes on" as ONE group (TREATMENT 130 -> 120)`, severity: 'note'});
        if (s.kind === 'pip' && !(id === 'V2S5' && s.h < 60) && (s.h < LEGIBILITY.pipMinH - 6 || s.h > LEGIBILITY.pipMaxH + 6)) out.push({shot: id, t, what: `Pip ${s.h.toFixed(0)} px outside 86-120`, severity: 'note'});
      });
      // Pip never over her, never over a ghost / board (overlay boxes).
      const pips = shapes.filter((s) => s.kind === 'pip');
      shapes.filter((s) => s.role === 'her' || s.role === 'text' || s.role === 'ghost').forEach((s) => {
        pips.forEach((p) => {
          if (overlaps(shapeRect(p), shapeRect(s))) out.push({shot: id, t, what: `Pip overlaps ${s.label}`, severity: s.role === 'her' ? 'error' : 'note'});
        });
      });
    });
  });
  // S6: Pip >= 200 px from the clause block.
  [24, 26.5, 28.06].forEach((t) => {
    const b = s6BoardAt(t);
    const clause: Rect = {x0: b.x0 + 20, y0: S6.clauseTopMinY, x1: b.x1 - 20, y1: b.y1 - 70};
    const g = rectGap(pipBox(s6PipSeatAt(t)), clause);
    if (g < LEGIBILITY.pipClauseClearPx) out.push({shot: 'V2S6', t, what: `Pip is ${g.toFixed(0)} px from the clause`, severity: 'error'});
  });
  // Suns: clear of the band; SUN2 >= 15 px above every board top; the S8 sun never touches her board.
  ([['V2S1', SUN0], ['V2S4', SUN1], ['V2S6', SUN2], ['V2S8', SUN8]] as [ShotId, Disc][]).forEach(([id, d]) => {
    if (d.y - d.r < band.y1) out.push({shot: id, t: 0, what: `sun (${d.x}, ${d.y}) r ${d.r} enters the band`, severity: 'error'});
  });
  [S6.board0, B].forEach((r) => {
    if (r.y0 - (SUN2.y + SUN2.r) < 15) out.push({shot: 'V2S7', t: 28.06, what: 'SUN2 is < 15 px above a board top', severity: 'error'});
  });
  if (B.y0 - (SUN8.y + SUN8.r) < 15) out.push({shot: 'V2S8', t: 35.6, what: 'the S8 sun touches her board', severity: 'error'});
  // Staff windows >= 90 x 90; S3 silhouette >= 130 after the ease-back.
  S2.staffWindows.forEach((w) => {
    if (Math.min(w.w, w.h) < LEGIBILITY.staffWindowMinPx) out.push({shot: 'V2S2', t: 8.96, what: `staff window ${w.id} < 90 px`, severity: 'error'});
  });
  if (S3.silhouette.h * S3.camera.easeBack.to < LEGIBILITY.carrierFigureMinH) out.push({shot: 'V2S3', t: 13.6, what: 'her silhouette < 130 px after the ease-back', severity: 'error'});
  // The S2 -> S3 match: W2 at the cut = W2_CUT on both sides.
  const w2s2 = scaleSpotAbout(W2, S2.camera.push.anchor, zoomAt(S2.camera.push, 12.98));
  if (Math.abs(w2s2.w - W2_CUT.w) > 1 || Math.abs(w2s2.h - W2_CUT.h) > 1) out.push({shot: 'V2S2', t: 12.98, what: 'W2 at the cut differs from W2_CUT', severity: 'error'});
  // S5 progress hits TREATMENT's marks within 0.02.
  ([[21.75, 0.15], [22.16, 0.48], [22.43, 0.7], [23.02, 0.96]] as [number, number][]).forEach(([t, p]) => {
    const got = S5_EASE(prog(t, S5.move.t0, S5.move.t1));
    if (Math.abs(got - p) > 0.02) out.push({shot: 'V2S5', t, what: `crane p ${got.toFixed(3)} != ${p}`, severity: 'error'});
  });
  return out;
};
