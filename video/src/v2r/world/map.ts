/**
 * K2 MAP CONTRACT, video 2 "One Small Window" (docs/v2/TREATMENT.md sections 2-5 and 9), CONFORMED 2026-10-27 to
 * docs/look/DIRECTION.md, docs/look/CRAFT.md and docs/v2/THROUGHLINE.md (they win where they differ; the lanes' own
 * orders are docs/v2/lanes/conform_L1..L6.md). README: ./README.md.
 *
 * THE one source of truth every lane (L1-L7) and kit (K3-K7) builds to: the map, the shared spots, the thread's spots
 * (her window: W, M, S4's far window), the shot clock, the S1 scale sheet, the ghost row, Pip's seats and beats, every
 * join's carrier and match point, the legibility floor and the UI zones. NUMBERS ONLY: nothing here draws and nothing
 * here imports (pure TS, usable from node QA scripts). Colour values appear only where a spec needs them and mirror K1
 * (`src/v2r/palette.ts` owns every token, the authored ink widths included: `INK_PX`, `CM.ghostHead`, `SHOT_LIGHT`);
 * the light rigs live beside this file in `rigs.ts` (it imports lib/light, so it cannot live here).
 *
 * CONVENTIONS (read before using a number):
 *  - Units: px in the 1080 x 1920 frame; seconds of the voice clock (`public/v2/voice.wav`, 39.08 s). Frame = round(t * 60).
 *  - `Spot` = CENTRE + size (W, W2, the S2 windows). `Rect` = edges x0..x1, y0..y1 (boards, zones). `Disc` = centre + r.
 *    `Seat` = Pip's BASE-CENTRE (where its soles / bottom touch the prop); Pip extends UP from it (86-120 px).
 *    `Fig` = a standing / seated figure: x = centre, feetY = sole line, h = full height (head top = feetY - h).
 *  - "y <= 600" in the treatment means "no higher on screen than y 600" (top edge at y >= 600). Same reading here.
 *  - Positions are SCREEN positions at each shot's `pose` moment (SHOTS[i].pose, POSE_T). `shotShapes(id, t)` maps
 *    them through the shot's camera (anchors and endpoints are contract; the curve between endpoints is the lane's).
 *  - A join's match point is given in SCREEN space at the join (MATCHES): both lanes hit it exactly. Every join names
 *    its carrier (A-F, CRAFT §a); none is a plain cut, and Pip never hops across one (it rides the carrier or keeps
 *    its screen spot).
 *  - RETIRED fields (the conform) keep their names and a neutral value (a zoom from 1.00 to 1.00, a zero-height hop)
 *    so built code compiles until its lane conforms; the comment says what replaced them. Never build on one.
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
/** The house cubic bezier (same maths as src/lib/pullback.tsx `cubicBezier`), for S5's progress. */
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
  /** Captions pop in place inside this band on ONE flat field. NOTHING else is drawn here (no Pip, roof, wiper, life). */
  captionBand: {x0: 0, y0: 317, x1: FRAME_W, y1: 556} as Rect,
  /** The ONE quiet field of every shot: the flat sky = the caption field. Flat horizon bands only below y 600. */
  quietSky: {x0: 0, y0: 0, x1: FRAME_W, y1: 600} as Rect,
  /** No built top (roof, parapet, chimney, aerial, tier, tree) higher than this line; exceptions: SKYLINE_EXCEPTIONS. */
  skylineMinY: 600,
  /** Every key read (a story change, a key line, Pip's beat) lives in here. */
  keyRead: {x0: 120, y0: 290, x1: 880, y1: 1250} as Rect,
  /** The platform's right rail (like / comment / share): masses only. Never Pip, a board, a key read. */
  rightRail: {x0: 780, y0: 840, x1: FRAME_W, y1: FRAME_H} as Rect,
  /** The bottom third runs under the platform UI: never quiet (each shot's mass in BOTTOM_THIRD), nothing to read, and
   *  THINGS only: no stranger's back in any foreground (DIRECTION rule 3; only Pip and things down here). */
  bottomThird: {x0: 0, y0: 1250, x1: FRAME_W, y1: FRAME_H} as Rect,
  /** Paper edges (`paint-subtle`, final only, if the owner wants them): never in y 0-620. */
  noPaperEdge: {x0: 0, y0: 0, x1: FRAME_W, y1: 620} as Rect,
} as const;

/** Named exceptions to `UI.skylineMinY` (things allowed between the band and y 600; never in the band). */
export const SKYLINE_EXCEPTIONS = {
  /** S1: the roof-terrace planting may reach up to y 575 (never higher). */
  s1RoofPlantingTopMinY: 575,
  /** Sun discs: SUN2 top = 575 (19 px clear of the band); SUN1 top 585; SUN0 top 720 (behind the far roofs from y ~752); SUN8 top 600 (sets behind S8's level far coping, y 646); S5's end sun 586. */
  sunTopMinY: 575,
  /** S5: the cloud bank and the obelisk tops stay at y >= 610. */
  s5CloudObeliskTopMinY: 610,
  /** The two foreground wipers (S5's blossom tree into S6, S7's narrowboat into S8) are clipped at y >= 560: they may
   *  cross y 560-600 (covering the suns' tops), never the band. */
  wiperClipMinY: 560,
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
  /** S3: her French-window silhouette at the match (>= 130; S3 holds zoom 1.00: the ease-back is retired). */
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
  /** RETIRED with the F11 clause (REVIEW_1 MUST 3: the clause is not drawn; kept for the dev sheets). */
  pipClauseClearPx: 200,
  /** SUN2 floats at least ONE DIAMETER clear of every board's frame top (REVIEW_1 MUST 4: it read as a ball sitting on
   *  the board); the same for SUN8 over her board. */
  sunBoardClearDiam: 1,
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
  {id: 'southSteps', side: 'south', chainM: 10, what: 'our broad canal-side stone steps facing the wing (the S1 lens sits here): things on the near steps, a few people sitting only on the step by the water', shots: ['V2S1']},
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
/** THE THREAD (THROUGHLINE §1.2): her window, the one small window. Its home spots: W (S1, S8), M (S2, S3) and S4's far
 *  window (`S4.herWindow`); S5-S7 run without it (the owner-approved fairness stretch, 20.55-33.00). */
/** W: her OFFICE window in S1 (first storey, the biggest pane; lamp-lit, dark from 0.40: "quit") AND her lit HOME window
 *  at the end of S8 (lights 34.95; the loop seam). Centre (860, 700), 150 x 170 (1.65 x 1.9 m at the facade's 90 px/m),
 *  at zoom 1.00 in both shots (S1's pull-out and S8's seam push are retired). */
export const W: Spot = {x: 860, y: 700, w: 150, h: 170};
/** M: the thread's match spot (THROUGHLINE §1.2): her DARK office window in S2 (pulled out of at 6.10; the one dark pane
 *  among the staff's) = her LIT home window in S3 (blind up, she is on the phone): the B match at 12.98. 132.5 x 164.3
 *  (TREATMENT's 133 x 164) for the whole of S2 and S3: no story push, no ease-back. */
export const M: Spot = {x: 335, y: 785, w: 132.5, h: 164.3};
/** = M. Before the conform W2 was the first STAFF window here (125 x 155, pushed to 133 x 164 by S2's retired 6 % push);
 *  her window now holds the spot and that staff window moved to her old place (S2.staffWindows SW1). Name kept. */
export const W2: Spot = M;
/** = M (S2's window at the match: there is no push any more, so it is this size throughout). Name kept. */
export const W2_CUT: Spot = M;
/** The suns: one per frame, a source that never moves between cuts, never a character (DIRECTION rule 5, "Retired").
 *  SUN0 = S1's west gap; SUN1 = S4's low sun just above her far window = S5's April sun in the slot (the S4 -> S5 A
 *  push-through); SUN2 = S6's April morning = S7's sunset (the S6 -> S7 A push-through; 19 px clear of the band). */
/** (L1, 2026-10-27, the owner's continuous-sky note: an evening sun in its sky, not a sticker) 65 % of the old r 80 and
 *  lower, setting behind the west gap's far roofs (tops y ~752-830); S4/S5 keep their own suns. */
export const SUN0: Disc = {x: 196, y: 772, r: 52};
export const SUN1: Disc = {x: 250, y: 650, r: 65};
export const SUN2: Disc = {x: 260, y: 620, r: 45};
/** S8's low sun ahead, over the canal past her board (top 600; since REVIEW_1 MUST 4 its bottom 680 is 100 px over her
 *  board's frame top 780, more than one diameter). Fixed through S8's
 *  truck; it un-builds before S1's SUN0 shows through at the seam (two suns never share a frame). */
export const SUN8: Disc = {x: 420, y: 640, r: 40};
/** B: the A-board FACE (Google's in S7 at its push landing 30.04; hers in S8 from the truck landing 35.60). 480 x 420
 *  since REVIEW_1 MUST 3 + 4 (2026-10-28): the few big lines need less height, so the top came down 100 px (frame top
 *  780) and SUN2 floats > 1 diameter clear; the feet stay on 1250. */
export const B: Rect = {x0: 150, y0: 800, x1: 630, y1: 1220};
export const B_LEGS_Y1 = 1250;
/** Pip's board bollard beside B (S7, S8): base-centre. Clears B's face and the rail. */
export const BOARD_BOLLARD: Seat = {x: 700, y: 1205};
/** Pip's S1 waterline bollard (f0, the whole of S1, and the loop: a 30 px settle from BOARD_BOLLARD, no hop). */
export const S1_BOLLARD: Seat = {x: 700, y: 1235};
/** Plum bridge colour of the S1 -> S2 and S3 -> S4 push-throughs (her plum = K1 CM.anchor); the two sun push-throughs
 *  (S4 -> S5, S6 -> S7) have no bridge. */
export const PLUM_BRIDGE = '#36223A';

// ---------------------------------------------------------------------------------------------------------------
// 4. Shots V2S1-V2S8 (TREATMENT section 5 + THROUGHLINE §3; = K8 src/v2r/film/scenes.json). Ids never clash with v1's
//    edge hints.
// ---------------------------------------------------------------------------------------------------------------
/** A join's carrier (DIRECTION rule 1, CRAFT §a; lib/Film `FilmCarrier`): A push-through, B thread match, C continuous
 *  camera, D object carry or wipe, E card flip or swipe, F plain cut (at most 2, on a "But" turn). This film: A, B, A, A,
 *  D, A, D, and the loop's B (0 plain cuts). */
export type Carrier = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
/** t0..t1 = the transition's span (its midpoint = the incoming shot's `start`, on the next sentence's first word). */
export type TransitionIn =
  | {type: 'film-start'}
  | {type: 'push-through'; carrier: 'A'; t0: number; t1: number; from: XY; to: XY; zoom: number; bridge?: string; inkComp: number}
  | {type: 'matchcut'; carrier: 'B'; t0: number; t1: number; on: string}
  | {type: 'foreground-wipe'; carrier: 'D'; t0: number; t1: number; element: 'scene'; dir: 'left'; on: string};

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
  /** The alive profile (LIFE_AND_DENSITY §0), INFORMATION only: STORY-LED (was "BUSY": the opening and explainer beats,
   *  the meter's flat <= 40 %), DENSE-CALM (cozy holds, flat <= 30 %, `density.py --cozy`), SCALE (S5). No events/s
   *  quota anywhere; at most 3-4 noticeable supporting movers at once, taking turns (DIRECTION rule 3, CRAFT §b). */
  mood: 'STORY-LED' | 'DENSE-CALM' | 'SCALE';
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
    id: 'V2S1', name: 'Walking out', start: 0.0, end: 6.1, lane: 'L1', mood: 'STORY-LED', set: 'A frontal (S1 scale sheet)',
    words: 'She quit Google. And she says her contract bans her from criticizing it... for life.',
    framing: 'RIVERSIDE across the canal from a seated eye level on our steps, looking north',
    pose: '5.30, the cover; zoom 1.00 at every t (the pull-out is retired): every S1 spot is its zoom-1.00 value',
    transitionIn: {type: 'film-start'},
    explains: 'She left, and she says the rule covers the whole rest of her life.',
  }),
  shot({
    id: 'V2S2', name: 'The wall', start: 6.1, end: 12.98, lane: 'L2', mood: 'STORY-LED', set: 'A from the south bank',
    words: "You'd think that's one odd contract. But Google's staff told the BBC they're scared to speak out, because of their contracts.",
    framing: 'RIVERSIDE from the south towpath; the wing in 3/4, cut by the left edge, receding right',
    pose: '6.70 (the pull-back out of M landed, zoom 1.00; the 6 % story push is retired: her window at M to the match)',
    transitionIn: {type: 'push-through', carrier: 'A', t0: 5.875, t1: 6.325, from: {x: W.x, y: W.y}, to: {x: M.x, y: M.y}, zoom: 12, bridge: PLUM_BRIDGE, inkComp: 0.6},
    explains: 'Not one odd contract: a few Google staff, in their account to the BBC, are scared too.',
  }),
  shot({
    id: 'V2S3', name: 'Her window', start: 12.98, end: 14.86, lane: 'L3', mood: 'DENSE-CALM', set: 'B across the water',
    words: 'So why is she talking?',
    framing: 'RIVERSIDE across the water to her terrace (a flash-forward in S8 sunset light)',
    pose: '12.98 (the match; zoom 1.00 throughout, the ease-back is retired; the 2D float home at 12.98 and from 14.60)',
    transitionIn: {type: 'matchcut', carrier: 'B', t0: 12.81, t1: 13.16, on: 'M: her dark office window (S2) = her lit home window (S3), the same spot and size'},
    explains: 'Unlike the blinds, her window is open: she is the one talking.',
  }),
  shot({
    id: 'V2S4', name: 'The walk home', start: 14.86, end: 20.55, lane: 'L3', mood: 'DENSE-CALM', set: 'B: her towpath from the water',
    words: "She worked on Google's AI and told the BBC she objected to where its military work was heading.",
    framing: 'RIVERSIDE truck from the water, a narrowboat gliding with us as the foreground',
    pose: '17.96 (the stop on "objected": the post lands at x ~575); zoom 1.00 throughout (the push toward SUN1 is retired), the hold home by 20.40',
    transitionIn: {type: 'push-through', carrier: 'A', t0: 14.635, t1: 15.085, from: {x: 330, y: 742}, to: {x: 720, y: 912}, zoom: 12, bridge: PLUM_BRIDGE, inkComp: 0.6},
    explains: "Who she is (an insider at Google's AI lab who objected, then quit) and that \"heading\" was a direction: unclassified, then classified.",
  }),
  shot({
    id: 'V2S5', name: 'The far side', start: 20.55, end: 23.8, lane: 'L4', mood: 'SCALE', set: 'C Arlington heights',
    words: 'In April, that meant a deal letting the Pentagon use its AI for',
    framing: 'the S5 pull-back crane, the ONE big move: under a blossoming canopy -> the Arlington view',
    pose: 'start = the hold 20.55-21.30; end = the hold 23.40-23.98 (under the blossom-tree wipe 23.62-23.98)',
    transitionIn: {type: 'push-through', carrier: 'A', t0: 20.4, t1: 20.7, from: {x: SUN1.x, y: SUN1.y}, to: {x: SUN1.x, y: SUN1.y}, zoom: 7, inkComp: 0.6},
    explains: 'April: the deal was with the US Department of Defense, a user the size of this view.',
  }),
  shot({
    id: 'V2S6', name: 'The gate', start: 23.8, end: 28.1, lane: 'L5', mood: 'STORY-LED', set: 'D the gate',
    words: '"any lawful government purpose". Google can\'t veto how it\'s used.',
    framing: 'eye level, straight-on, looking south along the perimeter fence; HELD at its 24.00 pose (the truck is retired)',
    pose: '24.00, held: every listed position is exact 23.80-28.10 (locked or a slow 2D float)',
    transitionIn: {type: 'foreground-wipe', carrier: 'D', t0: 23.62, t1: 23.98, element: 'scene', dir: 'left', on: "S5's Wiper: one blossom tree close to the lens, right to left, clipped at y >= 560 (S5's end sun covered first, SUN2 and the deal board uncovered last)"},
    explains: "The deal's exact words with their limit; lawful use is the Pentagon's call, not Google's.",
  }),
  shot({
    id: 'V2S7', name: 'Google says', start: 28.1, end: 32.93, lane: 'L5', mood: 'DENSE-CALM', set: 'A forecourt (west end)',
    words: 'But Google says it follows its AI principles and bans retaliation "of any kind".',
    framing: "eye level from the forecourt at the wing's west end, looking north; uninterrupted to 32.70",
    pose: '30.04 (the 4 % push landed on "principles": B exact); before 28.40 everything is scaleAbout(p, B centre, 1/1.04); SUN2 is screen-fixed',
    transitionIn: {type: 'push-through', carrier: 'A', t0: 27.95, t1: 28.25, from: {x: SUN2.x, y: SUN2.y}, to: {x: SUN2.x, y: SUN2.y}, zoom: 7, inkComp: 0.6},
    explains: "Google's answers to the deal (its AI principles) and to the fear (no retaliation), in its own words, at equal weight.",
  }),
  shot({
    id: 'V2S8', name: 'Her words', start: 32.93, end: 39.08, lane: 'L6', mood: 'DENSE-CALM', set: 'B: her lane',
    words: 'She says she can\'t criticize Google. But in her words, "talking about facts is not criticising".',
    framing: 'LANE along her towpath, looking west',
    pose: 'pre-truck to 34.99 (her board at x -100-380); from the landing 35.60 to the end: board at B, W at (860, 700) = S1 frame 0\'s W (the seam push is retired)',
    transitionIn: {type: 'foreground-wipe', carrier: 'D', t0: 32.7, t1: 33.16, element: 'scene', dir: 'left', on: "S7's Wiper (a narrowboat travelling west; bow in only after 32.70); Pip rides its stern"},
    explains: 'Her claim still stands (she says), and she talks anyway: in her words, talking about facts is not criticising.',
  }),
];

/** The time at which each shot's listed positions are exact. */
export const POSE_T: Record<ShotId, number> = {V2S1: 5.3, V2S2: 6.7, V2S3: 12.98, V2S4: 17.96, V2S5: 21.0, V2S6: 24.0, V2S7: 30.04, V2S8: 35.6};
/** The loop join (S8 -> S1): B (W = W at zoom 1.00) + the un-build 38.82-39.08 (scenes.json V2S8 `transitionOut`). */
export const LOOP_CARRIER: Carrier = 'B';

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
  /** Our bank: the waterline 1215 -> the bottom; five broad stone steps rising toward us, holding THINGS (THROUGHLINE
   *  §1.5, DIRECTION rule 3: no stranger's back in the foreground): step edges as flat 2-tone bands, a tote, two takeaway
   *  cups, a folded newspaper, a scarf left on a step, a bike cut by the bottom-right, a planter of grasses, leaves. */
  ourBank: {y0: 1215, y1: FRAME_H},
  stepsCount: 5,
  /** The seated public: ONLY on the step by the water (the landing, seat line y ~1300: the mid ground; tier B), half at
   *  rest, no two alike, x 620-780 clear for Pip's bollard (as built: 7 figures, 56-62 px). The near and middle rows of
   *  seated backs are RETIRED. */
  stepsSeated: 7,
  seatedHeadPx: {low: 60},
  pipBollard: S1_BOLLARD,
  heroCloud: {x0: 640, y0: 120, x1: 1000, y1: 280} as Rect,
  heroCloudDriftPxS: 2,
  planeBranch: {x0: 0, y0: 0, x1: 220, y1: 240} as Rect,
} as const;

/** The S1 camera: zoom 1.00 at every t, held locked or on the 2D float (eased straight legs within +-12 px, home by
 *  5.90); then the A push-through into W 5.875-6.325 (Film 'push-through' 0.45 s, inkComp 0.6, plum bridge 0.05 s: REVIEW_1 MUST 5). `pullOut` is
 *  RETIRED (no zoom in a hold: DIRECTION rule 8; THROUGHLINE §6): from = to = 1.00, so s1Zoom / s1Screen are the
 *  identity and every S1 spot is its zoom-1.00 value; kept so built code compiles. */
export const S1_CAMERA = {
  pullOut: {from: 1.0, to: 1.0, t0: 0, t1: 4.9, anchor: {x: W.x, y: W.y}, ease: 'in'} as ZoomKey,
  pushThrough: {t0: 5.875, t1: 6.325, into: {x: W.x, y: W.y} as XY, zoom: 12, bridge: PLUM_BRIDGE, inkComp: 0.6},
};
export const s1Zoom = (t: number): number => zoomAt(S1_CAMERA.pullOut, t);
/** S1 world (zoom 1.00) -> screen at time t. */
export const s1Screen = (p: XY, t: number): XY => scaleAbout(p, S1_CAMERA.pullOut.anchor, s1Zoom(t));

/** The S1 clock: the spot-tied moments every S1 builder, K4/K5 and sound share (TREATMENT section 4, THROUGHLINE §4.1).
 *  Frame 0 (DIRECTION rule 9; REVIEW_1 MUST 2): paper; the C world lands as flat PALE shapes; the strokes START at f0
 *  and are the event: the clean pen draws the A subjects (her behind the glass door, the door, then W, its frame closing
 *  on the lamp click 0.40) bold (5.4 px), one moving pen each with a visible tip (V2S1_clock S1_DRAW, S1_BOLD); no colour
 *  before the flood (the sun half-coloured: the flood starts from it); the flood from SUN0 0.44-0.74, Pip's line with
 *  it, her teal coat last (f47), done by ~0.8 s. */
export const S1_CLOCK = {
  flood: {t0: 0.44, t1: 0.74, origin: {x: SUN0.x, y: SUN0.y} as XY, herCoatLastF: 47},
  voiceShe: 0.12,
  wLampOff: 0.4,
  doorsStart: 0.45, // OUR EXIT DING
  doorsOpen: 0.52,
  steppingOut: 0.97, // "Google": the canopy letters pop one by one (A: a pop is A's, never B's)
  doorsShut: 1.1, // a bus crosses the far bridge (once)
  pipHeadFollows: 1.25,
  birdsLiftBridge: 2.45, // the ONLY bird lift in S1: small, pale and far, after the first copy (2.00; the art director, v3: at 1.40 they crossed the sun and competed with it); none on the 4.98 hit
  ghostPops: [2.0, 2.53, 3.2, 3.8, 4.2, 4.79],
  stop: {t0: 4.54, t1: 4.98}, // the "...": everyone stops mid-stride, the ambience dips (to 4.79)
  life: 4.98, // ONE step together, three outlines pop, Pip ears-cover (the hit is the row's: no birds)
  cover: 5.3,
  herLooksBack: 5.59,
  /** RETIRED (THROUGHLINE §3): Pip stays on its bollard; the push-through into W sweeps it. Kept for built code. */
  pipHopsUpLeft: 5.9,
  dive: {t0: 5.875, t1: 6.325}, // the A push-through into W (0.45 s: MUST 5); in 5.80-6.40 nothing enters, pops or turns but the dive
} as const;

/** S1 frame-0 words. REVIEW_1 MUST 1 (playbook "Hook and pacing": no title over the captions): the frame-0 block is
 *  RETIRED. Frame 0 shows the first spoken page at the house size; the core line is the cover's text and the source
 *  line is the post's (docs/v2/POSTING_KIT.md). The S1 pages (captions_pages.txt): */
export const FRAME0_TEXT = {
  /** 0.12-2.00, at the house size from frame 0. */
  spokenPage: {text: 'She [quit] Google.', s: 0.12, e: 2.0},
  /** 2.00-4.79 (line 2 on "bans" 3.20) and 4.79-5.88 ("for life." leaves the band as the dive into W starts). */
  pages: ['And she says her contract / bans her from [criticizing] it…', '[for life].'],
  out: 5.88,
  /** S2's first page pops at 6.28 (the band stays empty through the dive). */
  nextPageAt: 6.28,
  /** The loop: page 1 pops back at captionAt, as at frame 0. */
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
/** On "life" (4.98, f299): the whole row takes ONE step, three outlines pop, Pip ears-cover (no other mover joins in). */
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
  /** Her DARK office window at M (THROUGHLINE §1.2: the thread's match spot; the staff window that sat here moved to her
   *  old spot, SW1). Pulled out of at 6.10; the plum anchor all shot (the one dark pane: the thread's reaction). */
  herDarkWindow: M,
  /** 6.82 "one": her window's own A outline pops on (one frame; one closed 3.0 px line in the frame's own deep warm
   *  shade, the only full outline in the frame). */
  outlineAt: 6.82,
  /** = outlineAt. RETIRED name: the drawn ink ring is board notation (G5_BLOCKING §2), never a drawn circle. */
  ringAt: 6.82,
  /** The five staff windows round hers (each >= 90 x 90). Order = the blind order. The id 'W2' marks the window whose
   *  blind comes FULLY down on "contracts" 12.20 (built code keys it): since the conform, the one beside hers. */
  staffWindows: [
    {id: 'SW1', x: 200, y: 795, w: 140, h: 170},
    {id: 'W2', x: 465, y: 776, w: 110, h: 140},
    {id: 'SW3', x: 460, y: 948, w: 100, h: 90},
    {id: 'SW4', x: 330, y: 955, w: 110, h: 95},
    {id: 'SW5', x: 190, y: 960, w: 120, h: 100},
  ] as (Spot & {id: string})[],
  /** 8.96 "staff": the five turn a cooler white in ONE step each, a standing silhouette in each (five clicks, 0.04 s
   *  apart: single steps, flash-safe). */
  staffOnAt: 8.96,
  staffOnStagger: 0.04,
  /** 10.26-10.60 "scared": the five blinds drop to HALF one by one (0.085 s apart), the silhouettes step back. */
  blindsAt: 10.26,
  blindsStagger: 0.085,
  /** ~10.85: the bench staffer's hood goes up, AFTER the blinds (never two story actions at once; head + shoulders
   *  >= 80 px). Was 10.36. */
  hoodAt: 10.85,
  /** 12.20 "contracts": the blind of 'W2' (465, 776), beside hers, comes fully down (blind thump). */
  w2BlindDownAt: 12.2,
  /** The wing, cut by the left edge, receding right: rows at the left edge; ~400 windows (one batched path, LOD);
   *  the stepped tiers small behind it, all at y >= 600; pigeons on the parapet. */
  wing: {parapetMinY: 600, firstStoreyY: [700, 880] as const, groundRowY: [900, 1010] as const, windowWLeft: 150, windowWFar: 8, windowsTotal: 400},
  /** The newsstand A-board TOLD THE BBC (slid out by the newsagent at 8.44). Its face as S2 draws it (L2's request,
   *  2026-10-28): 50 px left of the treatment's x 160-560 (V2S2_Board's former BOARD_SHIFT), so K3's frame (26 px
   *  stiles) ends at x 536, a clear gap left of Pip's seat (590, 1050). */
  aBoard: {x0: 110, y0: 1050, x1: 510, y1: 1250} as Rect,
  aBoardOutAt: 8.44,
  /** The bench: the reporter (left: satchel, notebook, no BBC marks) and the staffer (right: slate coat, auburn hair,
   *  plain lanyard; seated >= 180 px, seated from the start). Seated figure boxes (centre x, feet, height). As S2 draws
   *  them (V2S2_Layout, L2's request 2026-10-28): the bench on the A-board's ground line, x 600-800, y 1110-1290 (the
   *  earlier x 560-780, y 1040-1230 put the reporter's head 15 px under Pip's seat); the pair on its seat line y 1244
   *  (seat to head 124 / 140: heads at y 1120 / 1104). */
  bench: {x0: 600, y0: 1110, x1: 800, y1: 1290} as Rect,
  reporter: {x: 640, feetY: 1290, h: 170} as Fig,
  staffer: {x: 718, feetY: 1290, h: 186} as Fig,
  /** 9.48 "BBC": the notebook opens, the staffer turns to the reporter; the notebook claps shut by 12.70 (was 12.85):
   *  nothing enters, pops or turns in 12.78-13.18 (the match). */
  notebookOpenAt: 9.48,
  notebookShutAt: 12.7,
  /** Pip's railing post, from the first frame (no hop-in) to the match, and the SAME screen spot in S3 (no hop). */
  pipSeat: {x: 590, y: 1050} as Seat,
  camera: {
    /** Out of the push-through: 1.12 -> 1.00 ease-out 6.10-6.70 about her dark window at M. */
    pullBack: {from: 1.12, to: 1.0, t0: 6.1, t1: 6.7, anchor: {x: M.x, y: M.y}, ease: 'out'} as ZoomKey,
    /** The 2D float (translation only: straight eased legs turning every 0.6-1.5 s, within +-12 px), home exactly at 12.98
     *  so M is exact on the match. */
    floatPxS: 10,
    /** RETIRED (the 6 % story push: no zoom in a hold, DIRECTION rule 8): from = to = 1.00, kept for built code. */
    push: {from: 1.0, to: 1.0, t0: 8.5, t1: 12.8, anchor: {x: M.x, y: M.y}, ease: 'inOut'} as ZoomKey,
  },
} as const;

export const S3 = {
  /** Her lit HOME window at M (= S2's dark office window: the B match at 12.98; teal frame, Juliet rail, blind UP, lamp
   *  on, plants; = S8's window). The thread, A in this shot. */
  frenchWindow: M,
  /** Her full-figure silhouette pacing inside, phone at her ear: 140 px (>= 137 at the match), feet on the window's floor
   *  line; pacing range x 290-380. 14.28 her free hand moves. From `stillFrom` 14.60 she stands still at x 330 with her
   *  head on `pushFrom` (330, 742), where the A push-through into her starts (at zoom 12 a 10 px miss is 120 px). */
  silhouette: {x: 330, feetY: 862, h: 140} as Fig,
  pacingX: [290, 380] as const,
  handMovesAt: 14.28,
  stillFrom: 14.6,
  pushFrom: {x: 330, y: 742} as XY,
  /** Her window box (plants; no longer Pip's seat). */
  windowBox: {x0: 255, y0: 868, x1: 520, y1: 900} as Rect,
  /** Pip on her terrace's front railing below and right of her window, from the first frame: S2's screen spot (590, 1050)
   *  on both sides of the match (THROUGHLINE §3); turns to her on "she" 13.96, then stays (the push-through sweeps it). */
  pipSeat: {x: 590, y: 1050} as Seat,
  /** Her terrace across the water: two storeys + mansard; chimneys and aerials all at y >= 600; two lit neighbours. */
  terraceTopMinY: 600,
  /** Bottom third: the moored narrowboat roof y ~1260-1330, cabin 1330-1580; our towpath y 1640-1920 with things only (a
   *  bench with a bag left on it, a mooring bollard and its rope, leaves, the lamp foot held from S2): no head-backs. */
  boatRoofY: [1260, 1330] as const,
  boatCabinY: [1330, 1580] as const,
  ourTowpathY: [1640, 1920] as const,
  camera: {
    /** RETIRED (the 5 % ease-back: no zoom in a hold): from = to = 1.00, kept for built code. */
    easeBack: {from: 1.0, to: 1.0, t0: 13.0, t1: 13.6, anchor: {x: M.x, y: M.y}, ease: 'out'} as ZoomKey,
    /** The 2D float (eased straight legs within +-12 px), home at 12.98 (M exact on the match) and from 14.60. */
    floatPxS: [8, 12] as const,
  },
} as const;

export const S4 = {
  /** Her: walking LEFT in profile, 170 px (100 px/m at her line, as S1), screen-fixed at x ~720 while the world trucks. */
  her: {x: 720, feetY: 1070, h: 170} as Fig,
  /** The A push-through from S3 pulls back out of her head here (14.86-15.01); the name tag pops on "She" 15.07. */
  pullFrom: {x: 720, y: 912} as XY,
  /** THE THREAD in S4 (THROUGHLINE §1.2, §2): her house's first-floor French window ahead at the far left, in the backs
   *  plane (0.6x the path's 310 px truck: it starts to enter at ~14.95, half in by ~15.6, whole by ~16.3); teal frame,
   *  Juliet rail, blind UP, a DARK pane (she is not home yet); tier B (the thread's home spot), >= 90 px wide (90 x 102:
   *  S8's W proportion); at the stop she looks west along the plates toward it, and the push-through into SUN1 leaves
   *  from the sun right beside it. At its pose (17.96) it sits left of SUN1's disc (x <= 170, its house's cornice <= 172;
   *  the disc reaches x 185: a 13-15 px gap, never a tangent; at x 135 (until 2026-10-28) its frame and cornice sat
   *  3-5 px from the limb, so the integrator moved it 10 px left rather than shrink SUN1, which S5's far plane is
   *  pinned to) and 6 px above the DEC plate (x 110-560, y 755-855, on the nearer path plane, up from 18.92): an earlier
   *  draft's ~(150, 790) sat behind that plate (hidden from 18.92 to the join) and crossed the disc. 47 px stay above it
   *  for the house's eave, mansard and low chimney pots, all at y >= 600 (the backs' ridges sit at y ~615-620). Never
   *  over the plates, the tag or the band. */
  herWindow: {x: 125, y: 698, w: 90, h: 102} as Spot,
  backsPlaneK: 0.6,
  towpathY: [860, 1080] as const,
  /** The fingerpost at the stop (17.96): ONE post at x ~575, two arrow plates pointing WEST, time order top-to-bottom,
   *  fill-first pen reveal; she never touches it. Plate lettering: ONE row, the key 52 px + its short word 44 px
   *  ("DEC 2025 · unclassified"; REVIEW_1 MUST 3: no credit, no small line). */
  post: {x: 575, topY: 735, footY: 1060},
  plateDec2025: {x0: 110, y0: 755, x1: 560, y1: 855} as Rect,
  plateApr2026: {x0: 110, y0: 865, x1: 560, y1: 965} as Rect,
  decPlateAt: 18.92,
  aprPlatePen: [19.45, 19.8] as const,
  /** The name tag: paper on a thin ink leader, screen-locked above her, builds 15.07 / 16.60, pops off 18.80. Widened
   *  (lane L3, the orchestrator's 2026-10-27 decision) so every line holds unsqueezed and the card ends above y 840. */
  /** Her name tag (V2S4_tag), x1 fitted to its two lines since REVIEW_1 MUST 3 (1000 -> 892: "Google DeepMind" 264 px
   *  at 44 from x 608, an 18-20 px margin). */
  nameTag: {x0: 590, y0: 600, x1: 892, y1: 800} as Rect,
  nameTagBuilds: [15.07, 16.6] as const,
  nameTagOffAt: 18.8,
  /** Truck west at her pace (far roofs 0.3x) -> stop on "objected" (0.6 s ease-out ending 17.96) -> hold, locked or the
   *  2D float, home by `homeBy` 20.40 so the A push-through (20.40-20.70) starts exactly on SUN1. `push` is RETIRED (the
   *  6 % push toward SUN1: no zoom in a hold): from = to = 1.00, kept for built code. */
  camera: {truckFarRoofsK: 0.3, stop: {t0: 17.36, t1: 17.96}, push: {from: 1.0, to: 1.0, t0: 18.4, t1: 20.1, anchor: {x: SUN1.x, y: SUN1.y}, ease: 'in'} as ZoomKey, homeBy: 20.4},
  /** SUN1 as drawn: (250, 650) r 65 at zoom 1.00 (no push to land it any more), the gasholder lattice off it. */
  sunAtPose: {x: SUN1.x, y: SUN1.y, r: SUN1.r} as Disc,
  /** The narrowboat foreground: roof edge y ~1220 (herb pots, a bike, a coiled rope, a chimney, Pip). */
  boatRoofY: 1220,
  boatCabinY: [1290, 1660] as const,
  waterY: [1700, 1920] as const,
  /** Pip seated on the boat roof LEFT of her (x 470) from the first frame (no landing, no hop into the sun: the
   *  push-throughs sweep it); it turns west on "heading" 19.55 (its one reaction). */
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
    /** The US newspaper box, no masthead: face 310 px wide; headline body 34 px x 3 lines + an 18 px credit (K3 NewsBox's
     *  default since 2026-10-28: 40 was off the type scale). */
    newsBox: {x0: 470, y0: 880, x1: 780, y1: 1230} as Rect,
    /** 20.76 "April": the slot's trees burst into blossom in 4 frames (the beat's A); Pip looks up at the blossom (its
     *  one reaction). The disc stays a disc. */
    aprilAt: 20.76,
    blossomBurstF: 4,
    /** RETIRED (the sun as a character: DIRECTION "Retired"): no calendar flip. Kept for kit/dc/crane.ts until L4
     *  conforms. */
    calendarFlip: {t0: 20.76, t1: 21.2},
  },
  /** The crane: hold 20.55-21.30 -> ONE ease 21.30-23.40 (dolly back + crane up + ~75 deg arc) -> hold to 23.98 (S5 ends
   *  at 23.80, the middle of its blossom-tree wipe 23.62-23.98). */
  move: {t0: 21.3, t1: 23.4, bezier: [0.35, 0.03, 0.45, 1.0] as const, holdEnd: 23.98},
  /** By progress p (times from S5_EASE). The lamppost wipe needs >= 10 frames: p 0.40-0.50 is only 7 (f1324-1331),
   *  so it is widened to 22.02-22.19 (f1321-1331, p ~0.37-0.51). */
  beats: [
    {p0: 0.15, p1: 0.4, t0: 21.75, t1: 22.06, what: 'a big tree stands where the Pentagon will land'},
    {p0: 0.37, p1: 0.51, t0: 22.02, t1: 22.19, what: 'a lamppost wipes the backs at peak speed (>= 10 frames; the tiny drawings swap in behind it)'},
    {p0: 0.55, p1: 0.62, t0: 22.24, t1: 22.33, what: 'a light burst (the pale cloud bank)'},
    {p0: 0.7, p1: 0.7, t0: 22.43, t1: 22.43, what: 'the Pentagon clears the tree ON "Pentagon"; the plaque pops (The Pentagon · US Department of Defense)'},
    {p0: 0.77, p1: 0.96, t0: 22.54, t1: 23.02, what: 'the obelisk rises'},
  ],
  /** 23.08: the wing's windows warm in ONE flat step (one change), never one by one. */
  windowsWarmAt: 23.08,
  end: {
    /** Sky y 0-800; the horizon y ~800; a flat lobed cloud bank (top >= 610) cut by the right edge, behind the obelisk. */
    horizonY: 800,
    cloudBankTopMinY: 610,
    /** The stranger and Pip tiny at the balustrade, feet <= 1240; Pip >= 44 px (the scale anchor). As built (V2S5_rig:
     *  the deck mapping of the start seats): the stranger (318, 1238) 62 px, Pip (366, 1195). */
    figuresFeetMaxY: 1240,
    pipMinH: 44,
    pipSeat: {x: 366, y: 1195} as Seat,
    stranger: {x: 318, feetY: 1238, h: 62} as Fig,
    /** The end sun at the right edge (as built; top 586): the wipe covers it first (~23.68). */
    sun: {x: 1058, y: 646, r: 60} as Disc,
    /** Flat steps toward the sky, 6 planes (far planes draw no line: C); detailed layers <= 15 px/f. */
    flatStepsPct: [0, 12, 22, 40, 65] as const,
    planes: 6,
  },
  /** The OUT join, D (THROUGHLINE §3): S5 exports `Wiper`, ONE blossom tree passing close to the lens (trunk + crown
   *  ~300 px wide, half ~150; flat fills, no outline: C), crossing RIGHT TO LEFT 23.62-23.98 (midpoint 23.80 = V2S6's
   *  start), clipped at y >= 560 (its crown covers both discs: tops 586 and 575; the band stays one flat field). S5's end
   *  sun is covered first (~23.68), S6's SUN2 and deal board uncovered last (~23.88; the board clear by ~23.90): two
   *  suns never share a frame. The tiny Pip holds the balustrade until the tree covers it (~23.81). */
  wipe: {t0: 23.62, t1: 23.98, half: 150, clipMinY: 560},
  /** RETIRED (Pip never hops across a join): no 23.90 leap. Kept for kit/dc/crane.ts until L4 conforms. */
  pipLeapAt: 23.9,
} as const;

export const S6 = {
  /** The deal board 560 x 460 (mid plane), HELD at its 24.00 pose for the whole shot, 23.80-28.10 (THROUGHLINE §4.6:
   *  the 4 s parallax truck is RETIRED, DIRECTION rule 8: a hold is locked or a slow 2D float). board1 = board0. Its
   *  top came down 100 px (680 -> 780; REVIEW_1 MUST 4) with Google's (B): SUN2 floats > 1 diameter clear. */
  board0: {x0: 120, y0: 780, x1: 680, y1: 1240} as Rect,
  board1: {x0: 120, y0: 780, x1: 680, y1: 1240} as Rect,
  /** RETIRED drift (the truck): 0. The dc gate kit's GATE_DRIFT reads it (and facadeDriftPxS, nearCrossPxS). */
  boardDriftPxS: 0,
  /** RETIRED (REVIEW_1 MUST 3): the F11 clause is not drawn (its point is in the post: POSTING_KIT.md). Kept for the
   *  dev sheets only. */
  clauseTopMinY: 920,
  clauseBottomMaxY: 1108,
  /** The purpose line pops ON "any" 24.03, after the wipe; the F12 line on "veto" 26.40 (V9). */
  purposeLineAt: 24.03,
  /** On "veto": 26.467 = f1588 (the sound lane's request, 2026-10-28: on its SFX frame). */
  f12LineAt: 26.467,
  /** The low limestone facade band (cut by both edges) + its service door (held: no drift). */
  facadeBandY: [705, 835] as const,
  serviceDoor0: {x0: 900, y0: 735, x1: 1020, y1: 835} as Rect,
  facadeDriftPxS: 0,
  doorShutsAt: [25.0, 27.4] as const,
  /** The facade windows light 27.08-27.80, at most 3 switch-ons per second (flash-safe). */
  facadeWindowsLight: [27.08, 27.8] as const,
  /** ...in three grouped switch-ons on these film frames (the sound lane's request, 2026-10-28): 27.100 / 27.450 / 27.833. */
  facadeWindowsF: [1626, 1647, 1670] as const,
  nearCrossPxS: 0,
  /** The staff walk-in to the service door starts >= 24.40 (outside the join window 23.60-24.00), or is already under way. */
  staffWalkInMinT: 24.4,
  /** The fence's tall corner post right of the board: its cap. A set position (the dc gate kit's GATE.post); it was
   *  Pip's seat before the conform. */
  cornerPost: {x: 770, y: 720} as Seat,
  /** Pip at the deal board's foot, seated on the paving in front of it and STILL from the first frame (THROUGHLINE §3:
   *  the column of S5's tiny Pip (366, 1195), swapped in by the tree ~23.85); at `pipH` 98 px its head is 204 px under
   *  the clause's last line (>= 200). pipSeat1 = pipSeat0 (no drift). No arrival, no hop out: the push-through into SUN2
   *  sweeps it. Its one reaction: an ear flick on "veto" 26.50. */
  pipSeat0: {x: 360, y: 1410} as Seat,
  pipSeat1: {x: 360, y: 1410} as Seat,
  pipH: 98,
  pipEarFlickAt: 26.5,
  sun: SUN2,
  /** Near plane: things only (THROUGHLINE §1.5): the tulip beds' kerb, a bench, a bike rack (in the rail), fence posts
   *  with blossom; petals are declared falling weather. The three readers' head-backs are RETIRED. */
} as const;
/** S6 is held: every drift is 0, so these return the pose (kept for the kits and built code). */
const s6u = (t: number): number => Math.min(28.1, Math.max(23.8, t)) - 23.8;
export const s6BoardAt = (t: number): Rect => shiftRect(S6.board0, s6u(t) * S6.boardDriftPxS);
export const s6PipSeatAt = (t: number): Seat => ({x: S6.pipSeat0.x + s6u(t) * S6.boardDriftPxS, y: S6.pipSeat0.y});
export const s6ServiceDoorAt = (t: number): Rect => shiftRect(S6.serviceDoor0, s6u(t) * S6.facadeDriftPxS);

export const S7 = {
  /** Google's A-board GOOGLE SAYS at B (exact at the push landing 30.04), A for the whole shot. Plain lit windows
   *  behind it, no silhouettes. */
  board: B,
  /** The canopy "Google", right of the board. */
  canopyGoogle: {x0: 660, y0: 760, x1: 900, y1: 810} as Rect,
  parapetMinY: 600,
  /** SUN2, screen-fixed: the push-through out of S6's April sun lands here (27.95-28.25). */
  sun: SUN2,
  /** Pip sit-watching on the board bollard from the first frame (no hop in; NO reaction: V14), the same pose as S8's (A5);
   *  it stays seated until the narrowboat's bow covers it (~32.83). */
  pipSeat: BOARD_BOLLARD,
  /** The ONE 4 % story push 28.40-30.04 about B's centre (ease in-out), landing on "principles" (A5: kept). */
  camera: {push: {from: 1 / 1.04, to: 1.0, t0: 28.4, t1: 30.04, anchor: rectCentre(B), ease: 'inOut'} as ZoomKey, floatPxS: [8, 12] as const},
  boardBeats: [
    {t: 28.33, what: 'GOOGLE SAYS header + board clack (28.32-28.34: after the join window, leading "Google" 28.36)'},
    {t: 29.65, what: 'follows its "AI principles" pen-draws (56 px), complete on 30.04'},
    {t: 30.1, what: 'the festoons light in a run 30.10-30.60 (<= 3 switch-ons per second), just after the pen completes'},
    {t: 30.2, what: 'the festoon switch-ons on film frames 1812 / 1836 / 1848 (30.200 / 30.600 / 30.800: the sound lane, 2026-10-28)'},
    {t: 30.3, what: 'small row: Google\'s AI Principles: "human oversight" (20 px, F16)'},
    {t: 30.74, what: 'bans retaliation "of any kind" pen-draws (56 px), complete on 32.08'},
  ],
  /** Bottom third: things only (THROUGHLINE §1.5): cafe tables and chairs with cups, a folded newspaper, a coat over a
   *  chair-back, a saucer; a bike rack, a planter of grasses, the fountain basin's rim bottom-right. The cafe's people sit
   *  in the mid ground, small and at rest: no seated backs at the bottom. Nothing starts in 32.50-33.10 but the wiper. */
  uninterruptedTo: 32.7,
} as const;

export const S8 = {
  /** Her board (the cafe boat's quote-of-the-day A-board): x -100-380 before the truck, B after. */
  boardPre: {x0: -100, y0: 800, x1: 380, y1: 1220} as Rect,
  board: B,
  /** The ONE plain truck left 34.99-35.60 (ease in-out, inside the pause). Screen shift per plane (px, rightward). */
  truck: {t0: 34.99, t1: 35.6, boardPlaneDx: 250, ghostPlaneDx: 240, housePlaneDx: 160, skyDx: 0},
  /** Her teal door at the bend (house plane): x 520-610 -> 680-770, y 880-1060. */
  doorPre: {x0: 520, y0: 880, x1: 610, y1: 1060} as Rect,
  door: {x0: 680, y0: 880, x1: 770, y1: 1060} as Rect,
  /** W (THE THREAD) above-right of the door (house plane): (700, 700) -> (860, 700) = W, the loop seam. Uncovered by
   *  the boat's stern ~33.0; lights 34.95 (LitWindow + a WindowSpill: the thread's answer). */
  wPre: {x: 700, y: 700, w: 150, h: 170} as Spot,
  w: W,
  sun: SUN8,
  /** Pip rides the wiping narrowboat in on its stern deck (32.97), steps off 33.00, lands on the pre-truck board bollard
   *  (450, 1205) at 33.20 (it rides the carrier: no hop across the join), rides the truck to BOARD_BOLLARD. */
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
  /** The float law after the truck (home at 35.60 and at 38.82); the seam push is RETIRED (S1 opens at zoom 1.00, so W
   *  here IS S1's frame-0 window). Un-build 38.82-39.08 onto S1's NEW frame-0 state (flat pale shapes, the subject's
   *  outline and Pip's tinted line drawing on: L1 exports it); S8's sun un-builds before SUN0 shows through (never two
   *  suns); W and the ghosts leave last; Pip settles 30 px from BOARD_BOLLARD to S1_BOLLARD (no hop). Nothing new enters,
   *  pops or turns in 38.72-39.08 but the un-build. */
  unbuild: {t0: 38.82, t1: 39.08, f0: 2329, f1: 2345},
  /** The cafe owner wipes her board from its LEFT side (the long-handled squeegee), standing just left of it at its depth,
   *  between the board and the cafe boat (feet <= ~1265, ~210 px, rear 3/4 or profile), never in front of the face. NO
   *  ONE in front of the board: the two readers are RETIRED (v3's retired S4 model; Q9 (c)). */
  cafeOwner: {side: 'left', feetMaxY: 1265, h: 210},
  /** Bottom third: the cafe boat's stern deck x 0-560; NO near heads (only the board rhymes with S7). */
  sternDeck: {x0: 0, y0: 1300, x1: 560, y1: FRAME_H} as Rect,
} as const;
/** S8 truck progress (0 before 34.99, 1 after 35.60). */
export const s8TruckU = (t: number): number => EASE.inOut(prog(t, S8.truck.t0, S8.truck.t1));

// ---------------------------------------------------------------------------------------------------------------
// 8. Pip (TREATMENT section 3, THROUGHLINE §1.6 and §3): seats per shot, beats, and the global rules.
// ---------------------------------------------------------------------------------------------------------------
export const PIP_RULES = {
  hPx: [86, 120] as const,
  /** Never in the caption band, never in the right rail, never over HER, >= 200 px from the F11 clause. */
  never: ['captionBand', 'rightRail', 'overHer', 'within200pxOfClause'] as const,
  /** Pip NEVER hops across a join (DIRECTION "Retired"): on both sides of every join it is swept by a push-through, rides
   *  a wipe's carrier, or keeps its screen spot (within ~200 px). Any move INSIDE a shot keeps its arc at y >= 600. */
  arcMinY: 600,
  /** One reaction per shot, never a gag near harm, none on Google's beat. */
  oneReactionPerShot: true,
  /** Tier B (DIRECTION rule 2, CRAFT §b): <= 1 % of the frame (close-ups too), its colours at C* <= 25 (K1 CM.pip*), a
   *  same-hue line <= 2.2 px; only blinks and ear moves (<= 10 %W/s) while the subject moves; clear of the subject. */
  maxFrameShare: 0.01,
} as const;

export type PipBeat = {t: number; what: string};
export type PipShot = {shot: ShotId; seat: Seat; seatEnd?: Seat; hEnd?: number; beats: PipBeat[]; reaction: string};
export const PIP: PipShot[] = [
  {shot: 'V2S1', seat: S1_BOLLARD, reaction: 'ears-cover on "life"', beats: [
    {t: 0, what: 'on the waterline bollard; at f0 its tinted line draws on with the subject and its colour comes with the flood (no full-colour Pip at f0)'},
    {t: 1.25, what: 'head follows her'},
    {t: 4.98, what: 'EARS-COVER (+ ear flap): its one reaction'},
    {t: 5.95, what: 'stays on its bollard: the A push-through into W sweeps it out (no hop)'},
  ]},
  {shot: 'V2S2', seat: S2.pipSeat, reaction: 'head turns to the wall on "But"', beats: [
    {t: 6.1, what: 'already seated on the railing post on the first frame: the pull-back out of M brings it in (no hop-in)'},
    {t: 8.3, what: '"But": its head turns to the wall (leads the eye; no shrug, no double-take)'},
    {t: 12.98, what: 'holds (590, 1050) across the B match: the same screen spot in S3 (no hop)'},
  ]},
  {shot: 'V2S3', seat: S3.pipSeat, reaction: 'turns to her on "she"', beats: [
    {t: 12.98, what: 'on her terrace\'s front railing at (590, 1050), S2\'s spot, from the first frame (no landing)'},
    {t: 13.96, what: 'turns to her on "she"'},
    {t: 14.71, what: 'stays put: the A push-through into her sweeps it (no leap)'},
  ]},
  {shot: 'V2S4', seat: S4.pipSeat, reaction: 'turns west on "heading"', beats: [
    {t: 14.86, what: 'seated on the boat roof, left of her, from the first frame: the pull-back out of her head brings it in'},
    {t: 19.55, what: 'turns west (leads "heading")'},
    {t: 20.4, what: 'stays put: the A push-through into SUN1 sweeps it (no hop)'},
  ]},
  {shot: 'V2S5', seat: S5.start.pipSeat, seatEnd: S5.end.pipSeat, hEnd: 44, reaction: 'looks up at the blossom on "April"', beats: [
    {t: 20.55, what: 'seated beside the stranger on the bench from the first frame (no arrival)'},
    {t: 20.76, what: 'looks up at the blossom on "April"; the scale anchor through the crane (>= 44 px at the end)'},
    {t: 23.62, what: 'holds the balustrade (366, 1195) until the tree covers it (~23.81): the wipe swaps it in the same column'},
  ]},
  {shot: 'V2S6', seat: S6.pipSeat0, seatEnd: S6.pipSeat1, reaction: 'one ear flick on "veto" (no droop)', beats: [
    {t: 23.8, what: 'seated and still at the deal board\'s foot (360, 1410), uncovered by the tree ~23.85'},
    {t: 26.5, what: 'one ear flick on "veto"'},
    {t: 27.95, what: 'stays put: the A push-through into SUN2 sweeps it (no hop)'},
  ]},
  {shot: 'V2S7', seat: BOARD_BOLLARD, reaction: 'NONE (sit-watch; neutral on Google\'s beat: no tilt, no nod)', beats: [
    {t: 28.1, what: 'sit-watch at the board bollard from the first frame (the pull-back out of SUN2; no hop): the same pose as S8 (A5)'},
    {t: 32.83, what: 'still seated as the narrowboat\'s bow covers it'},
  ]},
  {shot: 'V2S8', seat: S8.pipSeatPre, seatEnd: BOARD_BOLLARD, reaction: 'ears down on "can\'t"', beats: [
    {t: 32.97, what: 'rides the wiping narrowboat in on its stern deck (the carrier); steps off 33.00'},
    {t: 33.2, what: 'lands on the pre-truck board bollard (450, 1205); rides the truck to (700, 1205)'},
    {t: 33.78, what: 'ears down on "can\'t"'},
    {t: 37.7, what: 'looks up at W on "not" (a lead, not a second reaction)'},
    {t: 38.82, what: 'settles 30 px down to f0\'s bollard (700, 1235) on the un-build (no hop)'},
  ]},
];
export const pipShot = (id: ShotId): PipShot => PIP.find((p) => p.shot === id) as PipShot;

/** RETIRED (THROUGHLINE §3: Pip never hops across a join): Pip holds (590, 1050) on both sides of the S2 -> S3 match.
 *  Kept as a zero-height "hop" from that spot to itself so built code compiles until L2 and L3 conform. */
export const PIP_HOP_S2_S3 = {t0: 12.85, t1: 13.1, from: {x: S2.pipSeat.x, y: S2.pipSeat.y} as XY, to: {x: S3.pipSeat.x, y: S3.pipSeat.y} as XY, apexPx: 0};
export const pipHopS2S3At = (t: number): XY => {
  const {t0, t1, from, to, apexPx} = PIP_HOP_S2_S3;
  const u = prog(t, t0, t1);
  return {x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u - apexPx * 4 * u * (1 - u)};
};

// ---------------------------------------------------------------------------------------------------------------
// 9. MATCH POINTS: what BOTH lanes of every join hit, in SCREEN space at the join (THROUGHLINE §3)
// ---------------------------------------------------------------------------------------------------------------
/** side: which shot draws it ('out' = the outgoing shot, 'in' = the incoming one, 'both' = the same screen spot in both). */
export type MatchShape = {label: string; side: 'out' | 'in' | 'both'; spot?: Spot; disc?: Disc; rect?: Rect; seat?: Seat};
/** `t` = the join's midpoint (the incoming shot's start; the loop: the film's end). Every join: within its midpoint
 *  +-0.2 s nothing enters, pops, turns or speeds up but the carrier (and Pip riding it); slow life keeps its pace; <= 4
 *  movers within 0.4 s; two suns never share a frame. */
export type MatchPoint = {cut: string; t: number; f: number; out: ShotId; in: ShotId; carrier: Carrier; kind: string; shapes: MatchShape[]; rule: string};

export const MATCHES: MatchPoint[] = [
  {
    cut: 'S1 -> S2 push-through', t: 6.1, f: frameOf(6.1), out: 'V2S1', in: 'V2S2', carrier: 'A', kind: 'push-through 5.875-6.325 (zoom 12, plum bridge 6.075-6.125, inkComp 0.6)',
    shapes: [
      {label: 'S1: dive INTO W (her office window, dark from 0.40)', side: 'out', spot: W},
      {label: 'S2: pull back OUT of her dark office window at M', side: 'in', spot: M},
      {label: 'S1: Pip on its bollard, swept by the zoom', side: 'out', seat: S1_BOLLARD},
      {label: 'S2: Pip seated on its railing post from the first frame', side: 'in', seat: S2.pipSeat},
    ],
    rule: 'Film push-through {from [860, 700], to [335, 785], zoom 12, bridge #36223A, inkComp 0.6, dur 0.30}; midpoint 6.10, 0.18 s before "You\'d" 6.28; S2 pulls 1.12 -> 1.00 about M 6.10-6.70; nothing enters, pops or turns in 5.80-6.40 but the dive.',
  },
  {
    cut: 'S2 -> S3 window match (the thread)', t: 12.98, f: frameOf(12.98), out: 'V2S2', in: 'V2S3', carrier: 'B', kind: 'matchcut at M (both floats home)',
    shapes: [
      {label: 'her DARK office window (S2) = her LIT home window (S3)', side: 'both', spot: M},
      {label: 'Pip in the same spot (no hop)', side: 'both', seat: S2.pipSeat},
    ],
    rule: 'M centre (335, 785), 132.5 x 164.3 in BOTH at 12.98; Pip at (590, 1050) on both sides; midpoint 12.98, 0.18 s before "So" 13.16; nothing enters, pops or turns in 12.78-13.18 (the notebook claps by 12.70).',
  },
  {
    cut: 'S3 -> S4 push-through (into her)', t: 14.86, f: frameOf(14.86), out: 'V2S3', in: 'V2S4', carrier: 'A', kind: 'push-through 14.635-15.085 (zoom 12, plum bridge 14.835-14.885, inkComp 0.6)',
    shapes: [
      {label: "S3: into her silhouette's head (she stands still from 14.60)", side: 'out', seat: S3.pushFrom},
      {label: 'S4: out of her head (her walking, 170 px)', side: 'in', seat: S4.pullFrom},
      {label: 'S3: Pip on the terrace railing, swept', side: 'out', seat: S3.pipSeat},
      {label: 'S4: Pip seated on the boat roof from the first frame', side: 'in', seat: S4.pipSeat},
    ],
    rule: 'Film push-through {from [330, 742], to [720, 912], zoom 12, bridge #36223A, inkComp 0.6, dur 0.30}; midpoint 14.86, 0.21 s before "She" 15.07 (the name tag pops on it); nothing else enters, pops or turns in 14.66-15.06; a declared light change (sunset -> low sun).',
  },
  {
    cut: 'S4 -> S5 push-through (into the sun)', t: 20.55, f: frameOf(20.55), out: 'V2S4', in: 'V2S5', carrier: 'A', kind: 'push-through 20.40-20.70 (zoom 7, no bridge, inkComp 0.6)',
    shapes: [
      {label: "SUN1: S4's low October sun beside her far window = S5's April sun in the slot", side: 'both', disc: SUN1},
      {label: "S4: her far window (the thread's last frame before the stretch)", side: 'out', spot: S4.herWindow},
      {label: 'S4: Pip on the boat roof, swept', side: 'out', seat: S4.pipSeat},
      {label: 'S5: Pip seated on the bench from the first frame', side: 'in', seat: S5.start.pipSeat},
    ],
    rule: 'SUN1 (250, 650) r 65 at zoom 1.00 in both (S4\'s push is retired); midpoint 20.55, 0.12 s before "In" 20.67; nothing enters, pops or turns in 20.35-20.75; a declared light change (October -> April). The fairness stretch (S5-S7) runs without the thread.',
  },
  {
    cut: 'S5 -> S6 foreground wipe', t: 23.8, f: frameOf(23.8), out: 'V2S5', in: 'V2S6', carrier: 'D', kind: "foreground-wipe 23.62-23.98: S5's Wiper (one blossom tree, right to left, clipped at y >= 560)",
    shapes: [
      {label: "S5: the end sun at the right edge, covered first (~23.68)", side: 'out', disc: S5.end.sun},
      {label: 'S6: SUN2 and the deal board, uncovered last (~23.88; the board clear by ~23.90)', side: 'in', rect: S6.board0},
      {label: 'S5: the tiny Pip at the balustrade, covered ~23.81', side: 'out', seat: S5.end.pipSeat},
      {label: "S6: Pip at the board's foot, uncovered ~23.85 (the same column)", side: 'in', seat: S6.pipSeat0},
    ],
    rule: 'Film foreground-wipe {element "scene", dir "left", dur 0.36}; V2S6 starts 23.80, 0.23 s before "any" 24.03 (the quote\'s first word, mid-sentence: the one forced exception); never two suns in a frame; the purpose line pops on "any" 24.03, after the wipe; the staff walk-in starts >= 24.40.',
  },
  {
    cut: 'S6 -> S7 push-through (into the sun)', t: 28.1, f: frameOf(28.1), out: 'V2S6', in: 'V2S7', carrier: 'A', kind: 'push-through 27.95-28.25 (zoom 7, no bridge, inkComp 0.6)',
    shapes: [
      {label: "SUN2: S6's April morning sun = S7's London sunset sun (screen-fixed)", side: 'both', disc: SUN2},
      {label: "S6: Pip at the board's foot, swept", side: 'out', seat: S6.pipSeat0},
      {label: 'S7: Pip seated on the board bollard from the first frame', side: 'in', seat: BOARD_BOLLARD},
    ],
    rule: 'SUN2 (260, 620) r 45 in both (19 px clear of the band, >= one diameter above every board frame top: 780); the 7x zoom window (x 183-337, y 483-757) holds no board; midpoint 28.10, 0.21 s before "But" 28.31; the deal board holds still and readable to >= 27.95; nothing enters, pops or turns in 27.90-28.30 (the GOOGLE SAYS header lands 28.32-28.34); a declared light change (April -> sunset).',
  },
  {
    cut: 'S7 -> S8 foreground wipe', t: 32.93, f: frameOf(32.93), out: 'V2S7', in: 'V2S8', carrier: 'D', kind: "foreground-wipe 32.70-33.16, S7's Wiper (a narrowboat travelling west, dir left)",
    shapes: [
      {label: "S7: Google's board (at 32.70)", side: 'out', rect: B},
      {label: 'S8: her board before the truck', side: 'in', rect: S8.boardPre},
      {label: "S7: Pip seated until the bow covers it (~32.83)", side: 'out', seat: BOARD_BOLLARD},
      {label: "S8: Pip rides the stern in (32.97), lands 33.20", side: 'in', seat: S8.pipSeatPre},
    ],
    rule: "The bow enters only after 32.70 (Google's beat is never cut short, A5); the wipe clears to S8 by 33.16 (board clack); midpoint 32.93, 0.23 s before \"She\" 33.16; the stern uncovers W ~33.0 (the thread returns at its next join).",
  },
  {
    cut: 'S8 -> S1 loop (un-build)', t: 39.08, f: DURATION_F, out: 'V2S8', in: 'V2S1', carrier: 'B', kind: 'unbuild 38.82-39.08 onto S1 t < 0 (captions back at 39.04)',
    shapes: [
      {label: 'S8 end: her lit HOME window = W', side: 'out', spot: W},
      {label: 'S1 f0: her OFFICE window = W (zoom 1.00)', side: 'in', spot: W},
      {label: "S8: Pip on the board bollard (700, 1205)", side: 'out', seat: BOARD_BOLLARD},
      {label: "S1 f0: Pip on the waterline bollard (700, 1235)", side: 'in', seat: S1_BOLLARD},
    ],
    rule: "W (860, 700) 150 x 170 in both (S1's pull-out and S8's seam push are retired); the un-build lands on S1's new frame-0 state (flat pale shapes, the subject's outline and Pip's tinted line drawing on); S8's sun un-builds before SUN0 shows (never two suns); Pip settles 30 px (no hop); the midpoint 38.95 leads the next loop's \"She\" (0.24 heard) by 0.37 s: the file's tail and lead.",
  },
];

// ---------------------------------------------------------------------------------------------------------------
// 10. The bottom third, y 1250-1920 (TREATMENT section 5, THROUGHLINE §1.5): never flat paving or bare water, nothing
//     to read, THINGS only: no stranger's back in any foreground (DIRECTION rule 3); strangers stay small in the mid
//     and far ground. Only Pip and things down here.
// ---------------------------------------------------------------------------------------------------------------
export const BOTTOM_THIRD: Record<ShotId, string> = {
  V2S1: "our canal-side steps: five broad stone steps (their edges as flat 2-tone bands) holding things: a tote, two takeaway cups, a folded newspaper, a scarf left on a step, a bike cut by the bottom-right, a planter of grasses, a few leaves as flat shapes; the densest band. The seated public sits ONLY on the step by the water (seat line ~1300, ~60 px, the mid ground), half at rest. No seated backs nearer than that",
  V2S2: "our towpath: York-stone paving as long 2-tone bands, a drain cover, a few fallen leaves as flat shapes, the planter of grasses cut by the left edge (x 0-230, y 1290-1650), a bike locked to the near lamp-post's foot cut by the bottom-right (the lamp slim, x ~1030, CM.line; L3 holds it across the match), newspaper bundles and a crate at the kiosk foot, the dog lying at rest by the kiosk. No head-backs",
  V2S3: "the narrowboat moored along our bank, cut by both edges: roof y ~1260-1330 (herb pots, a bike, a coiled rope, a chimney with smoke), cabin side y 1330-1580 (sage, plum gunwale stripe, cream portholes); our coping; our towpath y 1640-1920 with things: a bench with a bag left on it, a mooring bollard and its rope, a few fallen leaves as flat shapes, the lamp foot held from S2. No head-backs",
  V2S4: 'the narrowboat beside us: cabin side y 1290-1660 (sage, plum gunwale stripe, cream portholes with curtains, a painted flower panel, fenders); water y 1700-1920 with the wake and floating leaves',
  V2S5: "start: the bench front, the stranger's bag, petals as a few flat shapes on the paving, the news box's base, a tree root cut by the bottom-left. End: the terrace floor from the crane's height (paving bands, petal drifts, a bench, a bin, a stroller), roots bottom-left, the lamppost base bottom-right",
  V2S6: "the near plane, things: the tulip beds' kerb, a bench, a bike rack (in the rail), fence posts with blossom, falling petals (declared weather); Pip seated at the deal board's foot (360, 1410). No readers' head-backs",
  V2S7: "the forecourt, things: cafe tables and chairs with cups, a folded newspaper, a coat over a chair-back, a saucer (cut by the bottom-left); a bike rack, a planter of grasses, paving joints, the fountain basin's rim bottom-right. The cafe's people sit in the mid ground, small and at rest: no seated backs at the bottom",
  V2S8: "the cafe boat's stern deck bottom-left (x 0-560: two small tables, mugs, a folded chair, a potted bay, a coiled rope), towpath paving bands with leaves and a drain, a planter and a lamp-post foot bottom-right. NO near heads, and no one in front of her board",
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
    D('sun', 'SUN0 (196, 772) r 52', SUN0),
    L('line', 'her line: far towpath feet (bend)', S1_TOWPATH_FEET),
    L('line', 'horizon y 965 (hidden)', [{x: 0, y: S1_LENS.horizonY}, {x: FRAME_W, y: S1_LENS.horizonY}]),
    R('mass', 'water y 1110-1215', {x0: 0, y0: sh.water.y0, x1: FRAME_W, y1: sh.water.y1}),
    R('mass', 'two moored boats (masses)', sh.boatsRight),
    R('mass', 'our steps: things only (the seated public only by the water, ~60 px)', {x0: 0, y0: 1290, x1: FRAME_W, y1: FRAME_H}),
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
    R('key', 'her dark window at M (A outline 6.82)', spotRect(S2.herDarkWindow)),
    ...S2.staffWindows.map((w) => R('key', `${w.id} ${w.w} x ${w.h}`, spotRect(w))),
    ...(t >= S2.aBoardOutAt ? [R('text', 'A-board “for fear of retaliation” (8.44)', S2.aBoard)] : []),
    R('mass', 'bench', S2.bench),
    F('figure', 'reporter (seated back)', S2.reporter, SEATED_ASPECT_OVERLAY),
    F('figure', 'staffer >= 180 px seated (hood ~10.85)', S2.staffer, SEATED_ASPECT_OVERLAY),
    P('Pip: railing post (590, 1050)', S2.pipSeat),
    R('mass', 'planter of grasses', {x0: 0, y0: 1290, x1: 230, y1: 1650}),
    R('mass', 'paving bands, drain cover, leaves, bundles + crate, the dog at rest (things only)', {x0: 230, y0: 1290, x1: 940, y1: FRAME_H}),
    R('mass', 'bike + the near lamp-post foot (x ~1030)', {x0: 940, y0: 1250, x1: FRAME_W, y1: FRAME_H}),
  ];
  return zoomShapes(zoomShapes(base, S2.camera.pullBack, t), S2.camera.push, t);
};

const s3Shapes = (t: number): Shape[] => {
  const base: Shape[] = [
    R('mass', 'her terrace (two storeys + mansard, tops at y >= 600)', {x0: 0, y0: 600, x1: FRAME_W, y1: 1060}),
    R('key', 'her lit home window at M (blind UP, lamp on)', spotRect(M)),
    F('her', 'her silhouette >= 137 px, phone', S3.silhouette),
    R('mass', 'window box', S3.windowBox),
    P('Pip: terrace railing (590, 1050) = S2', S3.pipSeat),
    R('mass', 'water', {x0: 0, y0: 1080, x1: FRAME_W, y1: 1260}),
    R('mass', 'moored narrowboat (roof 1260-1330, cabin 1330-1580)', {x0: 0, y0: 1260, x1: FRAME_W, y1: 1580}),
    R('mass', 'our towpath: bench + bag, bollard + rope, leaves, lamp foot (things only)', {x0: 0, y0: 1640, x1: FRAME_W, y1: FRAME_H}),
  ];
  return zoomShapes(base, S3.camera.easeBack, t);
};

const s4Shapes = (t: number): Shape[] => {
  const base: Shape[] = [
    R('mass', 'terrace backs, warehouses, gasholders, viaduct (tops >= 600)', {x0: 0, y0: 600, x1: FRAME_W, y1: 860}),
    D('sun', 'SUN1 (250, 650) r 65 (zoom 1.00; the push-through into it)', S4.sunAtPose),
    R('mass', 'THE THREAD: her far window (B, dark pane)', spotRect(S4.herWindow)),
    R('mass', 'her towpath y 860-1080', {x0: 0, y0: 860, x1: FRAME_W, y1: 1080}),
    L('line', 'the post (x ~575)', [{x: S4.post.x, y: S4.post.topY}, {x: S4.post.x, y: S4.post.footY}]),
    ...(t >= S4.decPlateAt ? [R('text', 'plate DEC 2025 · unclassified (52 / 44 px)', S4.plateDec2025)] : []),
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
      D('sun', 'SUN1 in the slot (the push-through out of it; the disc stays a disc)', s.sun),
      R('mass', 'bench', s.bench),
      F('figure', 'the stranger (back, newspaper)', s.stranger, SEATED_ASPECT_OVERLAY),
      P('Pip: beside the stranger', s.pipSeat),
      R('text', 'news box (headline 44 px x 4)', s.newsBox),
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
    D('sun', 'the end sun (covered first by the wipe)', e.sun),
    R('mass', 'terrace floor from the crane height', {x0: 0, y0: 1250, x1: FRAME_W, y1: FRAME_H}),
  ];
};

const s6Shapes = (t: number): Shape[] => {
  const b = s6BoardAt(t);
  return [
    D('sun', 'SUN2 (lands at the cut)', SUN2),
    R('mass', 'limestone facade band (y 705-835)', {x0: 0, y0: 705, x1: FRAME_W, y1: 835}),
    R('mass', 'service door (shuts 25.0, 27.4)', s6ServiceDoorAt(t)),
    R('text', 'the deal board 560 x 460 (tag; purpose on "any"; F12 on "veto")', b),
    R('mass', 'the corner post (cap 770, 720)', {x0: S6.cornerPost.x - 27, y0: S6.cornerPost.y, x1: S6.cornerPost.x + 27, y1: 1250}),
    P("Pip: the board's foot (360, 1410), still (ear flick 26.50)", s6PipSeatAt(t), S6.pipH),
    R('mass', 'near plane: kerb, tulip beds, bench, bike rack, posts + blossom (things only)', {x0: 0, y0: 1240, x1: FRAME_W, y1: FRAME_H}),
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
    R('mass', 'cafe tables and chairs with things (no seated backs)', {x0: 0, y0: 1400, x1: 620, y1: FRAME_H}),
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
    D('sun', 'SUN8: S8 low sun (420, 640) r 40, setting behind one level far coping at y 646', SUN8),
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
  V2S2: [6.7, 8.96, 10.85, 12.98],
  V2S3: [12.98, 13.6, 14.28],
  V2S4: [16.6, 17.96, 19.8, 20.55],
  V2S5: [21.0, 23.62],
  V2S6: [23.8, 24.03, 26.5, 28.1],
  V2S7: [28.1, 30.04, 32.08],
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
  // S6: the Pip-vs-clause check is RETIRED with the clause (REVIEW_1 MUST 3: nothing small is drawn on the board).
  // Suns: clear of the band; SUN2 >= one diameter above every board's frame top, and the S6 -> S7 push's 7x window
  // round it holds no board (REVIEW_1 MUST 4); the S8 sun >= one diameter over her board's frame.
  ([['V2S1', SUN0], ['V2S4', SUN1], ['V2S6', SUN2], ['V2S8', SUN8]] as [ShotId, Disc][]).forEach(([id, d]) => {
    if (d.y - d.r < band.y1) out.push({shot: id, t: 0, what: `sun (${d.x}, ${d.y}) r ${d.r} enters the band`, severity: 'error'});
  });
  const frameTops: [ShotId, Rect, number][] = [['V2S6', S6.board0, S6.board0.y0], ['V2S7', B, B.y0 - 20]];
  const s2 = shotById('V2S7').transitionIn;
  const zoom = s2.type === 'push-through' ? s2.zoom ?? 7 : 7;
  const win: Rect = {x0: SUN2.x - FRAME_W / 2 / zoom, y0: SUN2.y - FRAME_H / 2 / zoom, x1: SUN2.x + FRAME_W / 2 / zoom, y1: SUN2.y + FRAME_H / 2 / zoom};
  frameTops.forEach(([id, r, top]) => {
    const gap = top - (SUN2.y + SUN2.r);
    if (gap < LEGIBILITY.sunBoardClearDiam * 2 * SUN2.r) out.push({shot: id, t: 28.1, what: `SUN2 is ${gap.toFixed(0)} px above a board's frame top (< one diameter)`, severity: 'error'});
    if (overlaps({x0: r.x0 - 40, y0: top, x1: r.x1 + 40, y1: r.y1}, win)) out.push({shot: id, t: 28.1, what: 'a board enters the S6 -> S7 push window round SUN2', severity: 'error'});
  });
  if (B.y0 - 20 - (SUN8.y + SUN8.r) < LEGIBILITY.sunBoardClearDiam * 2 * SUN8.r) out.push({shot: 'V2S8', t: 35.6, what: 'the S8 sun is < one diameter over her board', severity: 'error'});
  // Staff windows >= 90 x 90; S3 silhouette >= 130 after the ease-back.
  S2.staffWindows.forEach((w) => {
    if (Math.min(w.w, w.h) < LEGIBILITY.staffWindowMinPx) out.push({shot: 'V2S2', t: 8.96, what: `staff window ${w.id} < 90 px`, severity: 'error'});
  });
  if (S3.silhouette.h * S3.camera.easeBack.to < LEGIBILITY.carrierFigureMinH) out.push({shot: 'V2S3', t: 13.6, what: 'her silhouette < 130 px after the ease-back', severity: 'error'});
  // The S2 -> S3 match: her window at M on both sides (S2's window at the match = S3's).
  const ms2 = scaleSpotAbout(S2.herDarkWindow, S2.camera.push.anchor, zoomAt(S2.camera.push, 12.98));
  if (Math.abs(ms2.x - S3.frenchWindow.x) > 1 || Math.abs(ms2.y - S3.frenchWindow.y) > 1 || Math.abs(ms2.w - S3.frenchWindow.w) > 1 || Math.abs(ms2.h - S3.frenchWindow.h) > 1) out.push({shot: 'V2S2', t: 12.98, what: 'her window at the match differs between S2 and S3 (M)', severity: 'error'});
  // Joins: every join names its carrier (CRAFT §a); at most 2 plain cuts (F), and each on a "But" turn; Pip on both sides.
  const joins = SHOTS.slice(1).map((sh) => sh.transitionIn);
  if (joins.some((ti) => ti.type === 'film-start')) out.push({shot: 'ALL', t: 0, what: 'a join without a carrier', severity: 'error'});
  const plain = MATCHES.filter((m) => m.carrier === 'F').length;
  if (plain > 2) out.push({shot: 'ALL', t: 0, what: `${plain} plain cuts (F; at most 2)`, severity: 'error'});
  MATCHES.forEach((m) => {
    const sh = shotById(m.in);
    const want = m.in === 'V2S1' ? LOOP_CARRIER : sh.transitionIn.type === 'film-start' ? null : sh.transitionIn.carrier;
    if (want !== m.carrier) out.push({shot: m.in, t: m.t, what: `MATCHES carrier ${m.carrier} != the shot's transitionIn ${want}`, severity: 'error'});
    if (m.in !== 'V2S1' && Math.abs(m.t - sh.start) > 1e-6) out.push({shot: m.in, t: m.t, what: `the join's midpoint ${m.t} != the shot's start ${sh.start}`, severity: 'error'});
  });
  // S5 progress hits TREATMENT's marks within 0.02.
  ([[21.75, 0.15], [22.16, 0.48], [22.43, 0.7], [23.02, 0.96]] as [number, number][]).forEach(([t, p]) => {
    const got = S5_EASE(prog(t, S5.move.t0, S5.move.t1));
    if (Math.abs(got - p) > 0.02) out.push({shot: 'V2S5', t, what: `crane p ${got.toFixed(3)} != ${p}`, severity: 'error'});
  });
  return out;
};
