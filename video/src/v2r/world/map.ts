/**
 * K2 MAP CONTRACT, video 2 "One Small Window" (docs/v2/TREATMENT.md sections 2-5 and 9).
 *
 * THE one source of truth every lane (L1-L7) and kit (K3-K7) builds to: the map, the shared spots, the shot clock,
 * the S1 scale sheet, the ghost row, Pip's seats and beats, every cut's match point, the legibility floor and the UI
 * zones. NUMBERS ONLY: nothing here draws, nothing here imports the palette (colour values are mirrored from TREATMENT
 * section 2 where a spec needs them; K1 `src/v2r/palette.ts` owns the tokens).
 *
 * CONVENTIONS (read before using a number):
 *  - Units: px in the 1080 x 1920 frame, seconds of the voice clock (`public/v2/voice.wav`, 39.08 s). Frame = round(t * 60).
 *  - `Spot` = CENTRE + size (W, W2, the S2 windows). `Rect` = edges x0..x1, y0..y1 (boards, zones). `Disc` = centre + r.
 *    `Seat` = Pip's BASE-CENTRE (where its soles / bottom touch the prop); Pip extends UP from it (86-120 px).
 *    Figures: `feetY` = the sole line, `h` = full height in px (head top = feetY - h).
 *  - "y <= 600" in the treatment means "no higher on screen than y 600" (top edge at y >= 600). Same reading here.
 *  - Positions are SCREEN positions at each shot's named `pose` moment (see SHOTS[i].pose). A camera move maps them by its
 *    own anchor (helpers below); a cut's match point is given in SCREEN space at the cut, so both lanes hit it exactly.
 *  - Change a number here only with the director; lanes that need a change put one line under REQUESTS in their report.
 */

// ---------------------------------------------------------------------------------------------------------------
// 0. Clock and frame
// ---------------------------------------------------------------------------------------------------------------
export const FPS = 60;
export const FRAME_W = 1080;
export const FRAME_H = 1920;
/** voice take 2: 39.08 s = 2345 frames (round(39.08 * 60) = 2345). */
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

export const spotRect = (s: Spot): Rect => ({x0: s.x - s.w / 2, y0: s.y - s.h / 2, x1: s.x + s.w / 2, y1: s.y + s.h / 2});
export const rectSpot = (r: Rect): Spot => ({x: (r.x0 + r.x1) / 2, y: (r.y0 + r.y1) / 2, w: r.x1 - r.x0, h: r.y1 - r.y0});
export const discRect = (d: Disc): Rect => ({x0: d.x - d.r, y0: d.y - d.r, x1: d.x + d.r, y1: d.y + d.r});
/** Scale a point about an anchor (a camera push / pull-out / ease-back): screen = a + (p - a) * z. */
export const scaleAbout = (p: XY, a: XY, z: number): XY => ({x: a.x + (p.x - a.x) * z, y: a.y + (p.y - a.y) * z});
export const scaleSpotAbout = (s: Spot, a: XY, z: number): Spot => {
  const c = scaleAbout(s, a, z);
  return {x: c.x, y: c.y, w: s.w * z, h: s.h * z};
};
export const scaleRectAbout = (r: Rect, a: XY, z: number): Rect => {
  const p0 = scaleAbout({x: r.x0, y: r.y0}, a, z);
  const p1 = scaleAbout({x: r.x1, y: r.y1}, a, z);
  return {x0: p0.x, y0: p0.y, x1: p1.x, y1: p1.y};
};
export const shiftRect = (r: Rect, dx: number, dy = 0): Rect => ({x0: r.x0 + dx, y0: r.y0 + dy, x1: r.x1 + dx, y1: r.y1 + dy});

// ---------------------------------------------------------------------------------------------------------------
// 1. UI zones, the caption band, the legibility floor (TREATMENT sections 3, 5, 9)
// ---------------------------------------------------------------------------------------------------------------
export const UI = {
  frame: {x0: 0, y0: 0, x1: FRAME_W, y1: FRAME_H} as Rect,
  /** Captions pop in place inside this band on ONE flat field. NOTHING else is drawn here (no Pip, no roof, no hop arc). */
  captionBand: {x0: 0, y0: 317, x1: FRAME_W, y1: 556} as Rect,
  /** The ONE quiet field of every shot: the flat sky (the caption field). Flat horizon bands only below y 600. */
  quietSky: {x0: 0, y0: 0, x1: FRAME_W, y1: 600} as Rect,
  /** No built top (roof, parapet, chimney, aerial, tier) higher than this line; exceptions in SKYLINE_EXCEPTIONS. */
  skylineMinY: 600,
  /** Every key read (a story change, a key line, Pip's beat) lives in here. */
  keyRead: {x0: 120, y0: 290, x1: 880, y1: 1250} as Rect,
  /** The platform's right rail (like / comment / share): masses only. Never Pip, a board, a key read. */
  rightRail: {x0: 780, y0: 840, x1: FRAME_W, y1: FRAME_H} as Rect,
  /** The bottom third runs under the platform UI: never quiet (each shot's mass in BOTTOM_THIRD), nothing to read. */
  bottomThird: {x0: 0, y0: 1250, x1: FRAME_W, y1: FRAME_H} as Rect,
  /** Paper edges (`paint-subtle`, final only, if the owner wants them): never in y 0-620. */
  noPaperEdge: {x0: 0, y0: 0, x1: FRAME_W, y1: 620} as Rect,
  /** Side gutter for the S1 plane branch: top-left, y 0-240. */
  s1PlaneBranch: {x0: 0, y0: 0, x1: 220, y1: 240} as Rect,
} as const;

/** Named exceptions to `UI.skylineMinY` (things allowed between the band and y 600). */
export const SKYLINE_EXCEPTIONS = {
  /** S1: the roof-terrace planting may reach up to y 575 (never higher). */
  s1RoofPlantingTopMinY: 575,
  /** Sun discs: SUN2 top = 575 (19 px clear of the band); SUN0 top 610, SUN1 top 585. */
  sunTopMinY: 575,
  /** S5: the cloud bank and the obelisk tops stay at y >= 610. */
  s5CloudObeliskTopMinY: 610,
} as const;

/** The legibility floor (K2). Measured at 1080 x 1920. */
export const LEGIBILITY = {
  /** A story change is >= 80 px in its smallest dimension. */
  storyChangeMinPx: 80,
  /** A figure that carries a story change is >= 130 px tall. */
  carrierFigureMinH: 130,
  /** The S2 bench staffer, seated. */
  benchStafferSeatedMinH: 180,
  /** S3: her French-window silhouette at the match (so it stays >= 130 after the 5 % ease-back). */
  s3SilhouetteMinHAtMatch: 137,
  /** S2 staff windows: each >= 90 x 90. */
  staffWindowMinPx: 90,
  /** Lettering (one type scale, K3): key lines read at 216 px; body and credits at full-screen phone width (~390 px). */
  keyLineMinPx: 56,
  bodyPx: [30, 34] as const,
  creditPx: [18, 20] as const,
  /** Pip: 86-120 px tall; >= 44 px only in S5's end frame. */
  pipMinH: 86,
  pipMaxH: 120,
  pipS5EndMinH: 44,
  /** Pip keeps >= 200 px from every line of the F11 clause (S6). */
  pipClauseClearPx: 200,
  /** The phone checks: a whole frame at 216 px wide (the cold read) and at ~390 px (full-screen phone width). */
  phoneCheckPx: 216,
  phoneFullPx: 390,
} as const;

/** Ink weights by depth (px at 1080), shared by every kit. Ghosts are a closed outline at 2.2 px. */
export const INK_PX = {near: 4.8, mid: 3.4, far: 2.2, farthest: 1.6, ghost: 2.2, pip: 3.4} as const;

/** Camera speed limits (px per frame at 60 fps). */
export const CAMSPEED = {flatInkLongMoveMax: 7.5, detailedLayerMax: 15} as const;

// ---------------------------------------------------------------------------------------------------------------
// 2. The map (TREATMENT section 2): one London canal running EAST-WEST + one trip to Arlington, Virginia.
// ---------------------------------------------------------------------------------------------------------------
export type PlaceId =
  | 'googleCanalWing'
  | 'googleForecourt'
  | 'towpathWalk'
  | 'fingerpost'
  | 'herTerrace'
  | 'herLane'
  | 'cafeBoat'
  | 'gasholdersViaduct'
  | 'southSteps'
  | 'southTowpath'
  | 'roadBridge'
  | 'arlingtonViewpoint'
  | 'pentagonGate';

export type Place = {
  id: PlaceId;
  /** 'north' = the north bank (Google's wing AND her terrace), 'south' = our bank, 'water', 'arlington'. */
  side: 'north' | 'south' | 'water' | 'arlington';
  /** Schematic chainage along the canal, metres WEST of the wing's east end (the overview sheet only; never a size). */
  chainM: number;
  what: string;
  /** Which shots see it. */
  shots: ShotId[];
};

/** North bank, EAST -> WEST, then our bank and Arlington. Her way home is WEST: S4 and S8 are one walk home. */
export const MAP_PLACES: Place[] = [
  {id: 'googleCanalWing', side: 'north', chainM: 0, what: "Google's canal wing: light brick, stone fins, tall glass, TWO storeys under a planted roof terrace; the stepped tiers far behind (seen only in S2, all under y 600); glass double doors under a canopy hand-lettered \"Google\" (no logo)", shots: ['V2S1', 'V2S2', 'V2S7']},
  {id: 'googleForecourt', side: 'north', chainM: 80, what: "the wing's WEST end forecourt: cafe tables, bikes, fountain jets, plane trees with string lights, Google's A-board at B", shots: ['V2S7']},
  {id: 'roadBridge', side: 'water', chainM: 140, what: 'a road bridge in the west gap (S1: deck y ~960 behind the west gap)', shots: ['V2S1']},
  {id: 'towpathWalk', side: 'north', chainM: 260, what: 'the towpath walk between Google and home: railings, lamps, benches, mooring rings', shots: ['V2S4']},
  {id: 'fingerpost', side: 'north', chainM: 420, what: 'ONE dated fingerpost, both plates pointing WEST (DEC 2025 upper, APR 2026 lower), east of her terrace', shots: ['V2S4']},
  {id: 'herTerrace', side: 'north', chainM: 520, what: 'her brick terrace: two storeys + mansard, balconies, pots, string lights, chimney pots, aerials; her first-floor French window (teal frame, Juliet rail), her teal door', shots: ['V2S3', 'V2S8']},
  {id: 'cafeBoat', side: 'water', chainM: 540, what: "the cafe boat moored below her terrace, its quote-of-the-day A-board on the towpath edge (her board at B in S8)", shots: ['V2S8']},
  {id: 'herLane', side: 'north', chainM: 560, what: 'her towpath running WEST to a bend, lamps receding; her house at the bend facing down the lane', shots: ['V2S8']},
  {id: 'gasholdersViaduct', side: 'north', chainM: 900, what: 'gasholders and a viaduct far west', shots: ['V2S4', 'V2S8']},
  {id: 'southSteps', side: 'south', chainM: 10, what: 'our broad canal-side stone steps facing the wing, people sitting (the S1 lens sits here)', shots: ['V2S1']},
  {id: 'southTowpath', side: 'south', chainM: 30, what: 'the south towpath facing the wing (newsstand, bench, railing; the S2 lens)', shots: ['V2S2']},
  {id: 'arlingtonViewpoint', side: 'arlington', chainM: 0, what: 'a public viewpoint terrace SOUTH-WEST of the Pentagon looking NORTH-EAST: lawns, parkway, the Pentagon, the Potomac, the low white city, the Washington Monument', shots: ['V2S5']},
  {id: 'pentagonGate', side: 'arlington', chainM: 0, what: "the Pentagon's perimeter footpath looking SOUTH: a low limestone facade band, a fence with a tall corner post, blossom, tulip beds, a service door 'CLASSIFIED · AUTHORIZED PERSONNEL ONLY'", shots: ['V2S6']},
];

/** Where each lens looks; which screen side is WEST. */
export const LENSES: Record<ShotId, {looks: 'north' | 'west' | 'south' | 'north-east'; from: string; westIs: 'left' | 'right' | 'away'}> = {
  V2S1: {looks: 'north', from: 'our canal-side steps, seated eye level (1.3 m above the far towpath, ~14 m from her line)', westIs: 'left'},
  V2S2: {looks: 'north', from: 'the south towpath, standing', westIs: 'left'},
  V2S3: {looks: 'north', from: 'our bank across the water from her terrace', westIs: 'left'},
  V2S4: {looks: 'north', from: 'the water, trucking with a narrowboat', westIs: 'left'},
  V2S5: {looks: 'north-east', from: 'the Arlington viewpoint terrace (crane back + up + ~75 deg arc)', westIs: 'left'},
  V2S6: {looks: 'south', from: "the Pentagon's perimeter footpath, eye level (morning sun in the EAST = screen left)", westIs: 'right'},
  V2S7: {looks: 'north', from: "the wing's west-end forecourt, eye level", westIs: 'left'},
  V2S8: {looks: 'west', from: 'her towpath, eye level, looking down the lane', westIs: 'away'},
};

/** Light = story time (World sky tod keys; the palette never changes). */
export const LIGHT: Record<ShotId, 'golden' | 'sunset' | 'lowSun' | 'aprilMorning'> = {
  V2S1: 'golden',
  V2S2: 'golden',
  V2S3: 'sunset', // a flash-forward in S8's sunset state (lamp on, blind up)
  V2S4: 'lowSun', // low sun on the far roofs, before sunset
  V2S5: 'aprilMorning',
  V2S6: 'aprilMorning',
  V2S7: 'sunset', // S7 and S8 share ONE sunset state (A5)
  V2S8: 'sunset',
};

// ---------------------------------------------------------------------------------------------------------------
// 3. Shared spots (TREATMENT section 5, "Shared spots (K2)")
// ---------------------------------------------------------------------------------------------------------------
/** W: her OFFICE window in S1 (first storey, the biggest pane, lamp-lit then dark at 0.40) AND her lit HOME window at
 *  the end of S8 (the loop seam). Centre (860, 700), 150 x 170 (1.65 x 1.9 m at the facade's 90 px/m). */
export const W: Spot = {x: 860, y: 700, w: 150, h: 170};
/** W2: the first staff window in S2 (base pose) = her French window in S3 (the window match-cut). */
export const W2: Spot = {x: 335, y: 785, w: 125, h: 155};
/** W2 at the S2 -> S3 cut, after S2's 6 % story push anchored on W2 (125 x 1.06, 155 x 1.06). */
export const W2_CUT: Spot = {x: 335, y: 785, w: 132.5, h: 164.3};
/** The suns. SUN0 = S1's west gap; SUN1 = S4 -> S5 match; SUN2 = S6 morning = S7 sunset (19 px clear of the band). */
export const SUN0: Disc = {x: 200, y: 690, r: 80};
export const SUN1: Disc = {x: 250, y: 650, r: 65};
export const SUN2: Disc = {x: 260, y: 620, r: 45};
/** S8's low sun over the canal past her board (never touching the board: 20 px clear of B's top). Fixed through S8's truck. */
export const SUN8: Disc = {x: 420, y: 640, r: 40};
/** B: the A-board FACE (Google's in S7 at its push landing 30.04, hers in S8 from the truck landing 35.60). Legs to 1250. */
export const B: Rect = {x0: 150, y0: 700, x1: 630, y1: 1220};
export const B_LEGS_Y1 = 1250;
/** Pip's board bollard beside B (S7, S8): base-centre. */
export const BOARD_BOLLARD: Seat = {x: 700, y: 1205};
/** Pip's S1 waterline bollard (f0 and the loop landing). */
export const S1_BOLLARD: Seat = {x: 700, y: 1235};

// ---------------------------------------------------------------------------------------------------------------
// 4. Shots V2S1-V2S8 (TREATMENT section 5). Ids never clash with v1's edge hints (S01-S12).
// ---------------------------------------------------------------------------------------------------------------
export type ShotId = 'V2S1' | 'V2S2' | 'V2S3' | 'V2S4' | 'V2S5' | 'V2S6' | 'V2S7' | 'V2S8';
export const SHOT_IDS: ShotId[] = ['V2S1', 'V2S2', 'V2S3', 'V2S4', 'V2S5', 'V2S6', 'V2S7', 'V2S8'];

export type TransitionIn =
  | {type: 'film-start'}
  | {type: 'push-through'; t0: number; t1: number; from: XY; to: XY; bridge: string; inkComp: number}
  | {type: 'matchcut'; t0: number; t1: number; on: string}
  | {type: 'cut-on-action'; on: string}
  | {type: 'foreground-wipe'; t0: number; t1: number; element: 'scene'; on: string};

export type ShotSpec = {
  id: ShotId;
  name: string;
  start: number;
  end: number;
  startF: number;
  endF: number;
  words: string;
  lane: 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6';
  framing: string;
  /** BUSY (>= 3.5 events/s, flat <= 40 %) or DENSE-CALM (>= 2 movers always, flat <= 30 %). */
  mood: 'BUSY' | 'DENSE-CALM' | 'SCALE';
  /** The moment the listed screen positions are exact. */
  pose: string;
  transitionIn: TransitionIn;
  /** The ONE thing a sound-off viewer tells back (TREATMENT section 5, last column). */
  explains: string;
};

const shot = (s: Omit<ShotSpec, 'startF' | 'endF'>): ShotSpec => ({...s, startF: frameOf(s.start), endF: frameOf(s.end)});

/** Plum bridge colour of the S1 -> S2 push-through (K1 dark anchor `#36223A`). */
export const PLUM_BRIDGE = '#36223A';

export const SHOTS: ShotSpec[] = [
  shot({
    id: 'V2S1', name: 'Walking out', start: 0.0, end: 6.1, lane: 'L1', mood: 'BUSY',
    words: "She quit Google. And she says her contract bans her from criticizing it... for life.",
    framing: 'RIVERSIDE across the canal from a seated eye level on our steps, looking north',
    pose: 'zoom 1.00 (t >= 4.90, after the pull-out); before that screen = scaleAbout(p, W, s1Zoom(t))',
    transitionIn: {type: 'film-start'},
    explains: 'She left, and she says the rule covers the whole rest of her life.',
  }),
  shot({
    id: 'V2S2', name: 'The wall', start: 6.1, end: 12.98, lane: 'L2', mood: 'BUSY',
    words: "You'd think that's one odd contract. But Google's staff told the BBC they're scared to speak out, because of their contracts.",
    framing: 'RIVERSIDE from the south towpath; the wing in 3/4, cut by the left edge, receding right',
    pose: '6.70 (the push-through pull-back landed, zoom 1.00); the story push maps by scaleAbout(p, W2, 1.06) at the cut',
    transitionIn: {type: 'push-through', t0: 5.95, t1: 6.25, from: {x: 860, y: 700}, to: {x: 200, y: 795}, bridge: PLUM_BRIDGE, inkComp: 0.6},
    explains: 'Not one odd contract: a few Google staff, in their account to the BBC, are scared too.',
  }),
  shot({
    id: 'V2S3', name: 'Her window', start: 12.98, end: 14.86, lane: 'L3', mood: 'DENSE-CALM',
    words: 'So why is she talking?',
    framing: 'RIVERSIDE across the water to her terrace (a flash-forward in S8 sunset light)',
    pose: '12.98 (the match, zoom 1.00); then the ease-back maps by scaleAbout(p, W2, 0.95) by 13.60',
    transitionIn: {type: 'matchcut', t0: 12.81, t1: 13.16, on: 'W2 (S2 staff window W2_CUT = her French window, same spot and size)'},
    explains: 'Unlike the blinds, her window is open: she is the one talking.',
  }),
  shot({
    id: 'V2S4', name: 'The walk home', start: 14.86, end: 20.55, lane: 'L3', mood: 'DENSE-CALM',
    words: "She worked on Google's AI and told the BBC she objected to where its military work was heading.",
    framing: 'RIVERSIDE truck from the water, a narrowboat gliding with us as the foreground',
    pose: '17.96 (the stop on "objected": the post lands at x ~575); the 6 % push anchored on SUN1 lands SUN1 at the cut',
    transitionIn: {type: 'cut-on-action', on: "Pip's leap out of S3 (14.70) -> Pip lands on the boat roof (14.95)"},
    explains: 'Who she is (an insider at Google\'s AI lab who objected, then quit) and that "heading" was a direction: unclassified, then classified.',
  }),
  shot({
    id: 'V2S5', name: 'The far side', start: 20.55, end: 24.0, lane: 'L4', mood: 'SCALE',
    words: 'In April, that meant a deal letting the Pentagon use its AI for',
    framing: 'the S5 pull-back crane, the ONE big move; under a blossoming canopy -> the Arlington view',
    pose: 'start = the hold 20.55-21.30; end = the hold 23.40-24.00',
    transitionIn: {type: 'matchcut', t0: 20.1, t1: 20.67, on: 'SUN1 (250, 650) r 65 (cut 20.55)'},
    explains: 'April: the deal was with the US Department of Defense, a user the size of this view.',
  }),
  shot({
    id: 'V2S6', name: 'The gate', start: 24.0, end: 28.06, lane: 'L5', mood: 'BUSY',
    words: '"any lawful government purpose". Google can\'t veto how it\'s used.',
    framing: 'eye level, straight-on, looking south along the perimeter fence',
    pose: 'linear in time between 24.00 and 28.06 (the lateral truck: the board drifts right 25 px/s)',
    transitionIn: {type: 'cut-on-action', on: "Pip's leap (S5 23.90) -> Pip lands on the fence's tall corner post (the cut on \"any\", 24.00)"},
    explains: "The deal's exact words with their limit; lawful use is the Pentagon's call, not Google's.",
  }),
  shot({
    id: 'V2S7', name: 'Google says', start: 28.06, end: 32.93, lane: 'L5', mood: 'DENSE-CALM',
    words: 'But Google says it follows its AI principles and bans retaliation "of any kind".',
    framing: "eye level from the forecourt at the wing's west end, looking north; uninterrupted to 32.70",
    pose: '30.04 (the 4 % story push landed on "principles": B exact); at 28.06 scaleAbout(p, B centre, 1/1.04)',
    transitionIn: {type: 'matchcut', t0: 27.82, t1: 28.31, on: 'SUN2 (260, 620) r 45 (S6 morning = S7 sunset)'},
    explains: "Google's answers to the deal (its AI principles) and to the fear (no retaliation), in its own words, at equal weight.",
  }),
  shot({
    id: 'V2S8', name: 'Her words', start: 32.93, end: 39.08, lane: 'L6', mood: 'DENSE-CALM',
    words: 'She says she can\'t criticize Google. But in her words, "talking about facts is not criticising".',
    framing: 'LANE along her towpath, looking west',
    pose: 'pre-truck 32.93-34.99 (board at x -100-380) and landing 35.60 / 38.82 (board at B, W at (860, 700))',
    transitionIn: {type: 'foreground-wipe', t0: 32.7, t1: 33.16, element: 'scene', on: "S7's Wiper (the narrowboat; bow in only after 32.70)"},
    explains: 'Her claim still stands (she says), and she talks anyway: in her words, talking about facts is not criticising.',
  }),
];

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
// 5. THE S1 SCALE SHEET (TREATMENT section 9, K2): every S1 size derives from this lens.
// ---------------------------------------------------------------------------------------------------------------
/**
 * The lens sits on our steps at a seated eye height, 1.3 m above the far towpath and ~14 m from her line, level.
 * Horizon y 965 (hidden by the far bank). A pinhole camera: px/m at a ground line = (feetY - horizonY) / eyeHeight,
 * focal = px/m x distance = 100 x 14 = 1400 px. Her line (feet y 1095): 100 px/m. The facade base (y 1082): 90 px/m,
 * i.e. 1400 / 90 = 15.56 m from the lens, 1.56 m behind her line (TREATMENT: "1.5 m").
 */
export const S1_LENS = {
  horizonY: 965,
  eyeHeightM: 1.3,
  herLineDistM: 14,
  focalPx: 1400,
  /** Her line = the far towpath's front edge on the straight. */
  herLineFeetY: 1095,
  herLinePxPerM: 100,
  /** Google's facade, 1.5 m behind her line. */
  facadeBaseY: 1082,
  facadePxPerM: 90,
} as const;

/** px per metre on the far towpath at a given sole line (exact for the level S1 lens). */
export const s1PxPerM = (feetY: number): number => (feetY - S1_LENS.horizonY) / S1_LENS.eyeHeightM;

/** Her standing height (and every ghost's): 1.70 m. */
export const HER_HEIGHT_M = 1.7;
/** Figure height in px for a 1.70 m figure standing at sole line feetY in S1. */
export const s1FigureH = (feetY: number): number => HER_HEIGHT_M * s1PxPerM(feetY);
/** Overlay-only figure width (a long coat seen from behind / in profile); K4 draws the real silhouette. */
export const FIGURE_ASPECT_OVERLAY = 0.3;

/**
 * The far towpath's sole line in S1 (zoom 1.00 screen x -> feet y). Straight (y 1095) right of x 470, then bending gently
 * away to the left. Fitted so the ghost sizes come out as TREATMENT specs them (170 -> 135, outlines 130 -> 120):
 * G6 feet 1068 (135 px), O3 feet 1057 (120 px). (TREATMENT's "feet -> y ~1065" is the row's far end, G6-O1.)
 */
export const S1_TOWPATH_FEET: XY[] = [
  {x: 1080, y: 1095},
  {x: 470, y: 1095},
  {x: 183, y: 1068},
  {x: 58, y: 1057},
  {x: 0, y: 1051.9},
];
/** Piecewise-linear lookup over a polyline sorted by DEScending x. */
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
  /** Her on the towpath: 1.70 m x 100 px/m. At the facade (behind the glass door): 1.70 x 90 = 153. */
  herH: 170,
  herHAtFacade: 153,
  /** Google's canal wing: x 330 -> past the right edge, slightly 3/4 (right bays nearest). */
  wing: {x0: 330, x1: FRAME_W},
  /** Parapet top: y 600 at the right edge falling to y 640 at the west corner (x 330). */
  parapetY: {atX1080: 600, atX330: 640},
  /** Ground storey 3.2 m x 90 = 288 px. */
  groundStorey: {y0: 794, y1: 1082},
  /** The glass double door 2.0 x 2.6 m = 180 x 234 px. Slides apart 0.45 -> fully open 0.52; shut by 1.10 (f66). */
  door: {x0: 540, y0: 848, x1: 720, y1: 1082} as Rect,
  /** Canopy fascia, hand-lettered "Google" (~48 px letters = 0.53 m), letters fill-pop one by one from 0.97. */
  canopyFascia: {x0: 520, y0: 800, x1: 740, y1: 845} as Rect,
  canopyLetterPx: 48,
  /** W = her office window, first storey, 1.65 x 1.9 m. Lamp OFF at 0.40 (f24). */
  w: W,
  /** ~10 other panes, 40-70 % lit, switching every 0.6-1.5 s. */
  otherPanes: 10,
  /** The west gap: far roofs, a road bridge, SUN0. */
  westGap: {x0: 0, x1: 330},
  farRoofTopY: 790,
  bridgeDeckY: 960,
  sun: SUN0,
  /** The far towpath front (her line) on the straight; the bend: S1_TOWPATH_FEET. */
  herLineFeetY: 1095,
  /** The far bank's coping 1095-1110, then the water 1110-1215 (two moored boats right: masses in the rail). */
  water: {y0: 1110, y1: 1215},
  /** Our bank: the waterline 1215 -> the bottom; five broad stone steps rising toward us, ~14 seated backs. */
  ourBank: {y0: 1215, y1: FRAME_H},
  stepsCount: 5,
  stepsSeated: 14,
  /** Seated head-backs: near row cut by the bottom (250-330 px), middle (~110), low by the water (~60). */
  seatedHeadPx: {near: [250, 330] as const, middle: 110, low: 60},
  pipBollard: S1_BOLLARD,
  /** Sky: hero cloud upper right (y 120-280, drifting 2 px/s); a plane branch in the top-left gutter (y 0-240). */
  heroCloud: {x0: 640, y0: 120, x1: 1000, y1: 280} as Rect,
  heroCloudDriftPxS: 2,
} as const;

/** The S1 camera: a 5 % pull-out 1.05 -> 1.00 (ease-in) over 0-4.90, ANCHORED ON W so W's centre is the same on every
 *  frame (the loop seam); then the push-through into W 5.95-6.25 (Film 'push-through', from W, inkComp 0.6, plum bridge). */
export const S1_CAMERA = {
  pullOut: {from: 1.05, to: 1.0, t0: 0, t1: 4.9, anchor: {x: W.x, y: W.y} as XY, ease: 'in-quad' as const},
  pushThrough: {t0: 5.95, t1: 6.25, into: {x: W.x, y: W.y} as XY, bridge: PLUM_BRIDGE, inkComp: 0.6},
};
/** S1 zoom at time t (1.05 at f0 -> 1.00 at 4.90, quadratic ease-in). */
export const s1Zoom = (t: number): number => {
  const {from, to, t0, t1} = S1_CAMERA.pullOut;
  const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  return from + (to - from) * u * u;
};
/** S1 world (zoom 1.00) -> screen at time t. */
export const s1Screen = (p: XY, t: number): XY => scaleAbout(p, S1_CAMERA.pullOut.anchor, s1Zoom(t));

/** S1 frame-0 words (mirror of TREATMENT section 4; ENGINE's Frame0Text renders them). All inside y 317-556. */
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
 * 1082, walking toward the doors); 0.97 she steps out (153 -> 170 px over her first steps, feet 1082 -> 1095 by 1.40)
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
export const S1_HER_WALK_PX_S = (680 - 537) / (4.54 - 0.97); // 40.06
export const S1_HER_STEP_OUT = {t0: 0.97, t1: 1.4, hFrom: 153, hTo: 170, feetFrom: 1082, feetTo: 1095};
export const S1_HER_LOOK_BACK_AT = 5.59;

const smooth = (u: number): number => u * u * (3 - 2 * u);
/** Her S1 x at time t (zoom 1.00 screen px). */
export const s1HerX = (t: number): number => {
  const k = S1_HER_KEYS;
  if (t <= k[1].t) return k[0].x;
  if (t <= k[2].t) return k[1].x + ((t - k[1].t) / (k[2].t - k[1].t)) * (k[2].x - k[1].x);
  if (t <= k[3].t) return k[2].x;
  if (t <= k[4].t) return k[3].x + smooth((t - k[3].t) / (k[4].t - k[3].t)) * (k[4].x - k[3].x);
  return k[4].x;
};

export type GhostKind = 'her' | 'ghost' | 'outline';
export type RowMember = {
  id: string;
  kind: GhostKind;
  /** Slot index along the row (0 = her). */
  slot: number;
  /** Screen x at the cover (5.30, zoom 1.00). */
  coverX: number;
  /** Pop time (outline draws 0.10 s, paper fill 2 f later, a 4-frame scale settle; one soft wooden tick ON the pop). */
  popT: number | null;
  /** The word it lands on. */
  word: string;
  /** Whole-head value (K1 mirror). null = the bare outlines: ink only, no fill, no age cues. */
  headHex: string | null;
  cues: string;
};

/** Slot spacing on the straight: one step = 62 px = 0.62 m at 100 px/m (the row compresses into the bend by the map below). */
export const S1_ROW_SLOT_PX = 62;
/** The row, TREATMENT section 4 end state. Paper fill #FBF6EE, ink 2.2 px; every figure WHOLE; the world passes through them. */
export const S1_ROW: RowMember[] = [
  {id: 'HER', kind: 'her', slot: 0, coverX: 510, popT: null, word: '', headHex: '#36223A', cues: 'her: teal coat, dark plum bun, cream tote, desk plant under her arm'},
  {id: 'G1', kind: 'ghost', slot: 1, coverX: 448, popT: 2.0, word: 'And', headHex: '#3E2A3A', cues: 'dark plum head: her, now'},
  {id: 'G2', kind: 'ghost', slot: 2, coverX: 389, popT: 2.53, word: 'contract', headHex: '#7D7387', cues: 'mid grey head (ageing reads by 2.6 s)'},
  {id: 'G3', kind: 'ghost', slot: 3, coverX: 333, popT: 3.2, word: 'bans', headHex: '#A9A5B5', cues: 'grey-silver head'},
  {id: 'G4', kind: 'ghost', slot: 4, coverX: 280, popT: 3.8, word: 'criticizing', headHex: '#CFCCD6', cues: 'silver + a scarf; a slightly softer back; shorter stride'},
  {id: 'G5', kind: 'ghost', slot: 5, coverX: 230, popT: 4.2, word: 'criticizing (2nd half)', headHex: '#ECEAF0', cues: 'white-silver + scarf + shorter stride'},
  {id: 'G6', kind: 'ghost', slot: 6, coverX: 183, popT: 4.79, word: 'for', headHex: '#ECEAF0', cues: 'white-silver + scarf + shorter stride (ageing stops here: no stoop, stick, bag)'},
  {id: 'O1', kind: 'outline', slot: 7, coverX: 138, popT: 4.97, word: 'life', headHex: null, cues: 'bare ink outline (no fill, no age cues)'},
  {id: 'O2', kind: 'outline', slot: 8, coverX: 96, popT: 5.0, word: 'life', headHex: null, cues: 'bare ink outline'},
  {id: 'O3', kind: 'outline', slot: 9, coverX: 58, popT: 5.03, word: 'life', headHex: null, cues: 'bare ink outline'},
];
export const GHOST_PAPER_HEX = '#FBF6EE';
export const GHOST_POP = {outlineS: 0.1, fillDelayF: 2, settleF: 4} as const;
/** The "...": 4.54-4.79 she stops and every ghost stops mid-stride (the ambience dips); still stopped until the 4.98 step. */
export const S1_ROW_STOP = {t0: 4.54, t1: 4.98} as const;
/** On "life" (4.98, f299): the whole row takes ONE step together, three outlines pop, birds lift off the far roofs, Pip ears-cover. */
export const S1_LIFE_T = 4.98;

/**
 * Lockstep. Each member walks the SAME metres as her: its path coordinate u = herX(t) - 62 * slot (in "straight px").
 * Screen x = s1RowXofU(u): identity on the straight (u >= 510), then the bend compresses through the cover slots.
 * Feet and height follow the towpath at that screen x (s1TowpathFeetY, s1FigureHAt).
 */
const S1_ROW_UMAP: XY[] = S1_ROW.map((m) => ({x: S1_ROW[0].coverX - S1_ROW_SLOT_PX * m.slot, y: m.coverX})); // {x: u, y: screen x}
export const s1RowXofU = (u: number): number => (u >= S1_ROW_UMAP[0].x ? u : lerpPoly(S1_ROW_UMAP, u));
export type RowPose = {id: string; kind: GhostKind; x: number; feetY: number; h: number; visible: boolean};
/** Every row member's pose at film time t (zoom 1.00 screen px; map through s1Screen for t < 4.90). */
export const s1RowAt = (t: number): RowPose[] => {
  const hx = s1HerX(t);
  return S1_ROW.map((m) => {
    const x = m.slot === 0 ? hx : s1RowXofU(hx - S1_ROW_SLOT_PX * m.slot);
    const feetY = m.slot === 0 && t < S1_HER_STEP_OUT.t1
      ? S1_HER_STEP_OUT.feetFrom + (S1_HER_STEP_OUT.feetTo - S1_HER_STEP_OUT.feetFrom) * Math.max(0, Math.min(1, (t - S1_HER_STEP_OUT.t0) / (S1_HER_STEP_OUT.t1 - S1_HER_STEP_OUT.t0)))
      : s1TowpathFeetY(x);
    const h = m.slot === 0 && t < S1_HER_STEP_OUT.t1
      ? S1_HER_STEP_OUT.hFrom + (S1_HER_STEP_OUT.hTo - S1_HER_STEP_OUT.hFrom) * Math.max(0, Math.min(1, (t - S1_HER_STEP_OUT.t0) / (S1_HER_STEP_OUT.t1 - S1_HER_STEP_OUT.t0)))
      : s1FigureHAt(x);
    return {id: m.id, kind: m.kind, x, feetY, h, visible: m.popT === null || t >= m.popT};
  });
};

/** S8's callback ghosts: three, with G4-G6's cues, 140 -> 130 px, pop on "can't" 33.78 (three ticks -3 dB, one pitch),
 *  stay to the seam (they un-build last with her window). Spots: see S8.ghosts. */
export const S8_GHOSTS_SPEC = {popT: 33.78, sizes: [140, 135, 130], cuesFrom: ['G4', 'G5', 'G6']} as const;

// ---------------------------------------------------------------------------------------------------------------
// 7. Per-shot layouts (screen px at each shot's pose; TREATMENT section 5 table + the bottom third)
// ---------------------------------------------------------------------------------------------------------------
export const S2 = {
  /** Her dark window (an ink ring draws round it at 6.82, "one"). */
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
  /** 10.36: the bench staffer's hood goes up (a whole-head shape change, >= 80 px with the shoulders). */
  hoodAt: 10.36,
  /** 12.20 "contracts": W2's blind comes fully down (blind thump). */
  w2BlindDownAt: 12.2,
  /** The wing: cut by the left edge, receding right; rows at the left; ~400 windows in all (one batched path, LOD). */
  wing: {firstStoreyY: [700, 880] as const, groundRowY: [900, 1010] as const, windowWLeft: 150, windowWFar: 8, windowsTotal: 400},
  /** The newsstand A-board TOLD THE BBC (slid out by the newsagent at 8.44). */
  aBoard: {x0: 160, y0: 1050, x1: 560, y1: 1250} as Rect,
  aBoardOutAt: 8.44,
  /** The bench: the reporter (left, satchel, notebook) and the staffer (right, slate coat, auburn hair, lanyard). */
  bench: {x0: 560, y0: 1040, x1: 780, y1: 1230} as Rect,
  benchGroundY: 1230,
  reporterX: 615,
  stafferX: 712,
  /** 9.48 "BBC": the notebook opens, the staffer turns to the reporter; 12.85 the notebook claps shut. */
  notebookOpenAt: 9.48,
  notebookShutAt: 12.85,
  pipSeat: {x: 590, y: 1050} as Seat,
  camera: {
    /** Out of the push-through: zoom 1.12 -> 1.00 ease-out 6.10-6.70 anchored on her dark window. */
    pullBack: {from: 1.12, to: 1.0, t0: 6.1, t1: 6.7, anchor: {x: 200, y: 795} as XY},
    /** A float 10 px/s that must be back at 0 (or absorbed) so W2's centre lands at (335, 785) at the cut. */
    floatPxS: 10,
    /** The 6 % story push on W2 8.50-12.80 (ease in-out), anchored on W2. */
    push: {from: 1.0, to: 1.06, t0: 8.5, t1: 12.8, anchor: {x: W2.x, y: W2.y} as XY},
  },
} as const;

export const S3 = {
  /** Her French window at the match = W2_CUT (teal frame, Juliet rail, blind UP, lamp on, plants). */
  frenchWindow: W2_CUT,
  /** Her full-figure silhouette pacing inside, phone at her ear: >= 137 px at the match (>= 130 after the ease-back). */
  silhouetteMinH: 137,
  silhouetteFeetY: 865,
  handMovesAt: 14.28,
  /** Her window box (Pip's seat on its right end, clear of the window and of her). */
  windowBox: {x0: 255, y0: 868, x1: 520, y1: 900} as Rect,
  pipSeat: {x: 462, y: 880} as Seat,
  /** Terrace: two storeys + mansard; chimneys and aerials all at y >= 600. */
  terraceTopMinY: 600,
  camera: {easeBack: {from: 1.0, to: 0.95, t0: 13.0, t1: 13.6, anchor: {x: W2.x, y: W2.y} as XY}, floatPxS: [8, 12] as const},
} as const;

export const S4 = {
  /** Her: walking LEFT in profile, 170 px (100 px/m at her line), screen-fixed at x ~720 while the world trucks. */
  her: {x: 720, feetY: 1070, h: 170},
  towpathY: [860, 1080] as const,
  /** The fingerpost: ONE post at x ~575 (at the stop, 17.96), two arrow plates pointing WEST, time order top-to-bottom. */
  post: {x: 575, topY: 735, footY: 1060},
  plateDec2025: {x0: 110, y0: 755, x1: 560, y1: 855} as Rect,
  plateApr2026: {x0: 110, y0: 865, x1: 560, y1: 965} as Rect,
  decPlateAt: 18.92,
  aprPlatePen: [19.45, 19.8] as const,
  /** The name tag: paper on a thin ink leader, screen-locked above her, two builds 15.07 / 16.60, off at 18.80. */
  nameTag: {x0: 600, y0: 600, x1: 880, y1: 800} as Rect,
  nameTagBuilds: [15.07, 16.6] as const,
  nameTagOffAt: 18.8,
  /** The camera: truck west at her pace (far roofs 0.3x) -> stop on "objected" (0.6 s ease-out ending 17.96)
   *  -> 6 % push toward SUN1 18.40-20.10 (ease-in), anchored on SUN1, landing SUN1 at (250, 650) r 65 at the cut. */
  camera: {truckFarRoofsK: 0.3, stop: {t0: 17.36, t1: 17.96}, push: {from: 1.0, to: 1.06, t0: 18.4, t1: 20.1, anchor: {x: SUN1.x, y: SUN1.y} as XY}},
  /** SUN1 radius drawn at the pose so the 6 % push lands r 65 at the cut. */
  sunRAtPose: SUN1.r / 1.06,
  /** The narrowboat foreground: roof edge y ~1220 (herb pots, a bike, a coiled rope, a chimney, Pip). */
  boatRoofY: 1220,
  pipSeat: {x: 600, y: 1218} as Seat,
  stopAt: 17.96,
  birdsWestAt: 19.8,
} as const;

export const S5 = {
  start: {
    /** Under a blossoming canopy; the bright slot holds SUN1 from S4. */
    slot: {x0: 150, y0: 580, x1: 560, y1: 880} as Rect,
    sun: SUN1,
    /** Two small full-figure backs on a bench (the stranger, Pip), never cut at the hips. */
    bench: {x0: 230, y0: 1060, x1: 460, y1: 1230} as Rect,
    benchSeatY: 1120,
    strangerX: 310,
    pipSeat: {x: 415, y: 1120} as Seat,
    /** The US newspaper box, no masthead: face 310 px wide; headline 40 px x 3 lines + an 18 px credit. */
    newsBox: {x0: 470, y0: 880, x1: 780, y1: 1230} as Rect,
    calendarFlip: {t0: 20.76, t1: 21.2},
    blossomBurstF: 4,
  },
  /** The crane: hold 20.55-21.30 -> ONE ease 21.30-23.40 (dolly back + crane up + ~75 deg arc) -> hold to 24.00. */
  move: {t0: 21.3, t1: 23.4, bezier: [0.35, 0.03, 0.45, 1.0] as const, holdEnd: 24.0},
  /** By progress p of the move. */
  beats: [
    {p0: 0.15, p1: 0.4, what: 'a big tree stands where the Pentagon will land'},
    {p0: 0.4, p1: 0.5, what: 'a lamppost wipes the backs at peak speed (>= 10 frames; the tiny drawings swap in behind it)'},
    {p0: 0.55, p1: 0.62, what: 'a light burst (the pale cloud bank)'},
    {p0: 0.7, p1: 0.7, what: 'the Pentagon clears the tree ON "Pentagon" (22.43); the plaque pops'},
    {p0: 0.77, p1: 0.96, what: 'the obelisk rises'},
  ],
  windowsWarmAt: 23.08,
  end: {
    skyY1: 800,
    horizonY: 800,
    cloudBankTopMinY: 610,
    /** The stranger and Pip tiny at the balustrade, feet <= 1240; Pip >= 44 px (the scale anchor). */
    figuresFeetMaxY: 1240,
    pipMinH: 44,
    pipSeat: {x: 360, y: 1236} as Seat,
    strangerX: 310,
    flatSteps: [0, 12, 22, 40, 65] as const,
    planes: 6,
  },
  pipLeapAt: 23.9,
} as const;

export const S6 = {
  /** The deal board 560 x 560 (mid plane), drifting right 25 px/s with the lateral truck. */
  board0: {x0: 120, y0: 680, x1: 680, y1: 1240} as Rect,
  board1: {x0: 220, y0: 680, x1: 780, y1: 1240} as Rect,
  boardDriftPxS: 25,
  /** The F11 clause block must start at y >= 920 (keeps Pip >= 200 px away on the corner post). */
  clauseTopMinY: 920,
  purposeLineAt: 24.03,
  f12LineAt: 26.4,
  /** The low limestone facade band (cut by both edges), its service door; the facade plane drifts ~10 px/s. */
  facadeBandY: [705, 835] as const,
  serviceDoor0: {x0: 900, y0: 735, x1: 1020, y1: 835} as Rect,
  facadeDriftPxS: 10,
  doorShutsAt: [25.0, 27.4] as const,
  facadeWindowsLight: [27.08, 27.8] as const,
  nearCrossPxS: 65,
  /** Pip on the fence's tall corner post, right of the board: (770, 720) -> (870, 720) with the truck. */
  pipSeat0: {x: 770, y: 720} as Seat,
  pipSeat1: {x: 870, y: 720} as Seat,
  pipLandBy: 24.12,
  pipEarFlickAt: 26.5,
  pipHopAt: 27.95,
  sun: SUN2,
  /** Near plane: three readers' head-backs cut by the bottom (240-300 px, x 60-700), crossing with the truck. */
  nearHeads: {x0: 60, x1: 700, hPx: [240, 300] as const},
} as const;
/** S6 board rect at time t (linear drift 24.00 -> 28.06). */
export const s6BoardAt = (t: number): Rect => shiftRect(S6.board0, (Math.min(28.06, Math.max(24, t)) - 24) * S6.boardDriftPxS);
export const s6PipSeatAt = (t: number): Seat => ({x: S6.pipSeat0.x + (Math.min(28.06, Math.max(24, t)) - 24) * S6.boardDriftPxS, y: S6.pipSeat0.y});

export const S7 = {
  /** Google's A-board GOOGLE SAYS at B (at the push landing 30.04). */
  board: B,
  boardCentre: {x: (B.x0 + B.x1) / 2, y: (B.y0 + B.y1) / 2} as XY,
  /** The canopy "Google", right of the board. */
  canopyGoogle: {x0: 660, y0: 760, x1: 900, y1: 810} as Rect,
  parapetMinY: 600,
  sun: SUN2,
  pipSeat: BOARD_BOLLARD,
  /** The ONE 4 % story push 28.40-30.04 anchored on B's centre (ease in-out), landing on "principles". */
  camera: {push: {from: 1 / 1.04, to: 1.0, t0: 28.4, t1: 30.04, anchor: {x: (B.x0 + B.x1) / 2, y: (B.y0 + B.y1) / 2} as XY}, floatPxS: [8, 12] as const},
  boardBeats: [
    {t: 28.36, what: 'GOOGLE SAYS header + board clack'},
    {t: 29.65, what: 'follows its "AI principles" pen-draws, complete on 30.04'},
    {t: 30.04, what: 'the string lights come on in a run'},
    {t: 30.3, what: 'small row: Google\'s AI Principles: "human oversight" (20 px, F16)'},
    {t: 30.74, what: 'bans retaliation "of any kind" pen-draws, complete on 32.08'},
  ],
  uninterruptedTo: 32.7,
} as const;

export const S8 = {
  /** Her board (the cafe boat's quote-of-the-day A-board): x -100-380 before the truck, B after. */
  boardPre: {x0: -100, y0: 700, x1: 380, y1: 1220} as Rect,
  board: B,
  /** The ONE plain truck left 34.99-35.60 (ease in-out). Per-plane screen shift (px, rightward). */
  truck: {t0: 34.99, t1: 35.6, boardPlaneDx: 250, housePlaneDx: 160, skyDx: 0},
  /** Her teal door at the bend (house plane): x 520-610 -> 680-770, y 880-1060. */
  doorPre: {x0: 520, y0: 880, x1: 610, y1: 1060} as Rect,
  door: {x0: 680, y0: 880, x1: 770, y1: 1060} as Rect,
  /** W above-right of the door (house plane): (700, 700) -> (860, 700) = W, the loop seam. */
  wPre: {x: 700, y: 700, w: 150, h: 170} as Spot,
  w: W,
  sun: SUN8,
  /** Pip: rides the wiping narrowboat in, hops to the board bollard 33.20 (pre-truck (450, 1205)), rides the truck to (700, 1205). */
  pipSeatPre: {x: 450, y: 1205} as Seat,
  pipSeat: BOARD_BOLLARD,
  /** She walks home (back, ~150 px) from 33.16; reaches her door 34.55; it shuts 34.75; W lights 34.95. */
  herH: 150,
  herWalkFrom: 33.16,
  herAtDoor: 34.55,
  doorShuts: 34.75,
  wLights: 34.95,
  wipeBoardAt: 35.72,
  quotePenAt: 36.54,
  lampRunAt: 37.18,
  pipLooksUpAt: 37.7,
  /**
   * The three callback ghosts (S8_GHOSTS_SPEC). OPEN: after the truck the only legal strip right of B and left of the
   * rail is x 632-780, which holds her door (680-770). Proposal: they stand on the towpath in front of her house,
   * G4 nearest, receding toward the door's left jamb, whole, never over B; they may overlap the door only once it is
   * shut (from 34.75). Landing-pose spots (house plane, so pre-truck x = x - 160). L6 owns the final staging.
   */
  ghosts: [
    {id: 'S8G4', x: 652, feetY: 1076, h: 140},
    {id: 'S8G5', x: 700, feetY: 1068, h: 135},
    {id: 'S8G6', x: 745, feetY: 1060, h: 130},
  ],
  ghostsStatus: 'OPEN' as const,
  /** Float 8-15 px/s 37.70-38.82 that turns back to the landing pose by 38.82; un-build 38.82-39.08 into S1's t < 0. */
  unbuild: {t0: 38.82, t1: 39.08, f0: 2329, f1: 2345},
} as const;

// ---------------------------------------------------------------------------------------------------------------
// 8. Pip (TREATMENT section 3): seats per shot, beats, and the global rules.
// ---------------------------------------------------------------------------------------------------------------
export const PIP_RULES = {
  hPx: [86, 120] as const,
  /** Never in the caption band, never in the right rail, never over HER, >= 200 px from the F11 clause. */
  never: ['captionBand', 'rightRail', 'overHer', 'within200pxOfClause'] as const,
  /** Pip's hop / leap arcs stay at y >= 600 (they never cross the band). */
  arcMinY: 600,
} as const;

export type PipBeat = {t: number; what: string};
export type PipShot = {shot: ShotId; seat: Seat; seatEnd?: Seat; beats: PipBeat[]; reaction: string};
export const PIP: PipShot[] = [
  {shot: 'V2S1', seat: S1_BOLLARD, reaction: 'ears-cover on "life"', beats: [
    {t: 0, what: 'already in colour at f0 on the waterline bollard'},
    {t: 1.25, what: 'head follows her'},
    {t: 4.98, what: 'EARS-COVER (+ ear flap sound)'},
    {t: 5.9, what: 'hops up-left into the dive (arc stays at y >= 600)'},
  ]},
  {shot: 'V2S2', seat: S2.pipSeat, reaction: 'head turns to the wall on "But"', beats: [
    {t: 6.4, what: 'lands on the railing post behind the bench'},
    {t: 8.3, what: '"But": its head turns to the wall (leads the eye; no shrug, no double-take)'},
    {t: 12.85, what: 'hops toward W2 (crosses the match-cut on PIP_HOP_S2_S3)'},
  ]},
  {shot: 'V2S3', seat: S3.pipSeat, reaction: 'turns to her on "she"', beats: [
    {t: 13.1, what: 'lands on her window box'},
    {t: 13.9, what: 'turns to her on "she"'},
    {t: 14.7, what: 'leaps out up-LEFT through the left edge at y >= 600 (never through the top: the band)'},
  ]},
  {shot: 'V2S4', seat: S4.pipSeat, reaction: 'turns west on "heading"', beats: [
    {t: 14.95, what: 'lands on the boat roof (enters descending from upper right, x <= 780)'},
    {t: 19.55, what: 'turns west (leads "heading")'},
    {t: 20.25, what: 'hops into the sun (mid-air at the cut 20.55)'},
  ]},
  {shot: 'V2S5', seat: S5.start.pipSeat, seatEnd: S5.end.pipSeat, reaction: 'looks up at the calendar sun', beats: [
    {t: 20.6, what: 'comes down out of the sun\'s direction onto the bench beside the stranger (seated by 20.70)'},
    {t: 20.76, what: 'looks up at the calendar sun (the scale anchor through the move)'},
    {t: 23.9, what: 'leaps (up-right)'},
  ]},
  {shot: 'V2S6', seat: S6.pipSeat0, seatEnd: S6.pipSeat1, reaction: 'one ear flick on "veto" (no droop)', beats: [
    {t: 24.0, what: 'lands on the fence\'s tall corner post right of the board (by 24.12), watching the service door'},
    {t: 26.5, what: 'one ear flick on "veto"'},
    {t: 27.95, what: 'hops'},
  ]},
  {shot: 'V2S7', seat: BOARD_BOLLARD, reaction: 'NONE (sit-watch; neutral on Google\'s beat)', beats: [
    {t: 28.2, what: 'sit-watch at the board bollard (no tilt, no nod)'},
  ]},
  {shot: 'V2S8', seat: S8.pipSeatPre, seatEnd: BOARD_BOLLARD, reaction: 'ears down on "can\'t"', beats: [
    {t: 32.93, what: 'rides the wiping narrowboat in'},
    {t: 33.2, what: 'hops to the board bollard (pre-truck (450, 1205); lands at (700, 1205) with the truck)'},
    {t: 33.78, what: 'ears down on "can\'t"'},
    {t: 37.7, what: 'looks up at W on "not"'},
    {t: 38.82, what: 'hops to f0\'s bollard (700, 1235) on the un-build'},
  ]},
];

// ---------------------------------------------------------------------------------------------------------------
// 9. MATCH POINTS: what BOTH lanes of every cut hit, in SCREEN space at the cut
// ---------------------------------------------------------------------------------------------------------------
export type MatchPoint = {
  cut: string;
  t: number;
  f: number;
  out: ShotId | 'LOOP';
  in: ShotId;
  kind: string;
  /** Screen-space shapes both shots draw at the cut. */
  shapes: {label: string; spot?: Spot; disc?: Disc; rect?: Rect; seat?: Seat}[];
  rule: string;
};

/** Pip's hop across the S2 -> S3 window match-cut: ONE screen-space arc both lanes evaluate.
 *  From the S2 seat at the push's 1.06 (605, 1066) at 12.85 to the S3 seat (462, 880) at 13.10, apex 50 px. */
export const PIP_HOP_S2_S3 = {t0: 12.85, t1: 13.1, from: scaleAbout(S2.pipSeat, S2.camera.push.anchor, 1.06), to: S3.pipSeat, apexPx: 50};
export const pipHopS2S3At = (t: number): XY => {
  const {t0, t1, from, to, apexPx} = PIP_HOP_S2_S3;
  const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  return {x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u - apexPx * 4 * u * (1 - u)};
};

export const MATCHES: MatchPoint[] = [
  {
    cut: 'S1 -> S2 push-through', t: 6.1, f: frameOf(6.1), out: 'V2S1', in: 'V2S2', kind: 'push-through 5.95-6.25 (plum bridge, inkComp 0.6)',
    shapes: [
      {label: 'S1: dive INTO W (her dark office window)', spot: W},
      {label: 'S2: pull back OUT of her dark window', spot: S2.herDarkWindow},
    ],
    rule: 'Film push-through {from: [860, 700], to: [200, 795], bridge: #36223A, inkComp 0.6, dur 0.30}; S2 then pulls 1.12 -> 1.00 on the same window 6.10-6.70.',
  },
  {
    cut: 'S2 -> S3 window match-cut', t: 12.98, f: frameOf(12.98), out: 'V2S2', in: 'V2S3', kind: 'matchcut 12.81-13.16',
    shapes: [
      {label: 'W2 (S2 staff window, blind down) = her French window (S3, blind up)', spot: W2_CUT},
      {label: 'Pip mid-hop at the cut', seat: pipHopS2S3At(12.98)},
    ],
    rule: 'W2 centre (335, 785) and 133 x 164 in BOTH shots at 12.98; Pip on PIP_HOP_S2_S3 on both sides.',
  },
  {
    cut: 'S3 -> S4 cut on action', t: 14.86, f: frameOf(14.86), out: 'V2S3', in: 'V2S4', kind: "cut on Pip's leap",
    shapes: [
      {label: 'S3: Pip leaving up-left through the left edge (y 620-700)', rect: {x0: 0, y0: 620, x1: 120, y1: 700}},
      {label: 'S4: Pip entering descending from upper right (x <= 780), lands 14.95', seat: S4.pipSeat},
    ],
    rule: 'Pip moves LEFT on both sides (west on both lenses); the apex at the cut.',
  },
  {
    cut: 'S4 -> S5 sun match-cut', t: 20.55, f: frameOf(20.55), out: 'V2S4', in: 'V2S5', kind: 'matchcut on SUN1 (inside the 20.10-20.67 pause)',
    shapes: [{label: 'SUN1 in both', disc: SUN1}],
    rule: 'SUN1 centre (250, 650), r 65 on screen at 20.55 in BOTH; S4 draws r 61.3 at its pose so the 6 % push lands r 65.',
  },
  {
    cut: 'S5 -> S6 cut on action', t: 24.0, f: frameOf(24.0), out: 'V2S5', in: 'V2S6', kind: "cut on Pip's leap (on \"any\", the one cut outside a pause)",
    shapes: [
      {label: 'S5: Pip leaps up-right from the balustrade (23.90)', seat: S5.end.pipSeat},
      {label: 'S6: Pip lands on the corner post by 24.12', seat: S6.pipSeat0},
      {label: 'S6: the deal board is UP at the cut (frame, tag, FULL clause, credit)', rect: S6.board0},
    ],
    rule: 'Pip moves up-right on both sides; the clause is readable from 24.00, the purpose line pops on "any" 24.03.',
  },
  {
    cut: 'S6 -> S7 sun match-cut', t: 28.06, f: frameOf(28.06), out: 'V2S6', in: 'V2S7', kind: 'matchcut on SUN2 (27.82-28.31)',
    shapes: [{label: 'SUN2 in both (S6 morning = S7 sunset)', disc: SUN2}],
    rule: 'SUN2 centre (260, 620), r 45 in BOTH at 28.06 (19 px clear of the band, >= 15 px above every board top).',
  },
  {
    cut: 'S7 -> S8 foreground wipe', t: 32.93, f: frameOf(32.93), out: 'V2S7', in: 'V2S8', kind: "foreground-wipe 32.70-33.16, S7's Wiper (a narrowboat)",
    shapes: [
      {label: 'S7 Google\'s board at B', rect: B},
      {label: 'S8 her board before the truck', rect: S8.boardPre},
    ],
    rule: 'The bow enters only after 32.70 (Google\'s beat is never cut short); the wipe clears to S8 by 33.16 (board clack).',
  },
  {
    cut: 'S8 -> S1 loop (un-build)', t: 39.08, f: DURATION_F, out: 'LOOP', in: 'V2S1', kind: 'unbuild 38.82-39.08 onto S1 t < 0',
    shapes: [
      {label: 'S8 end: her lit HOME window = W', spot: W},
      {label: 'S1 f0: her OFFICE window (zoom 1.05 about W: same centre)', spot: scaleSpotAbout(W, W, 1.05)},
      {label: "Pip: board bollard -> f0's waterline bollard", seat: S1_BOLLARD},
    ],
    rule: 'W centre identical; size 150 x 170 (S8) vs 157.5 x 178.5 (S1 f0 at zoom 1.05): L6 may end its last float at a 1.05 push on W to make it exact. Frame-0 words pop back at 39.04.',
  },
];

// ---------------------------------------------------------------------------------------------------------------
// 10. The bottom third, y 1250-1920 (TREATMENT section 5): never flat paving or bare water, nothing to read.
// ---------------------------------------------------------------------------------------------------------------
export const BOTTOM_THIRD: Record<ShotId, string> = {
  V2S1: "our canal-side steps: five broad stone steps (edges 3.4-4.8 px), ~14 seated backs in three rows: near heads cut by the bottom (250-330 px: a hood, a beanie, a low bun with a mustard scarf, curls, a cap), a middle row (~110 px), a low row by the water (~60 px); cups, tote bags, a dog lying down, a bike cut by the bottom-right",
  V2S2: 'our towpath: broken paving lines, leaves, a drain cover, the A-board and bench legs; a planter of grasses cut by the left edge (x 0-230, y 1290-1650); a bike locked to a lamp-post whose foot is cut by the bottom-right (x 860-960); two head-backs cut by the bottom (260-320 px, x 300-720: a beanie, a cap); a dog nosing a leaf',
  V2S3: 'the narrowboat moored along our bank, cut by both edges: roof y ~1260-1330 (herb pots, a bike, a coiled rope, a chimney with smoke), cabin side y 1330-1580 (sage, plum gunwale stripe, cream portholes); our coping; our towpath y 1640-1920 with two head-backs cut by the bottom (260-300 px) and a lamp-post foot bottom-right',
  V2S4: 'the narrowboat beside us: cabin side y 1290-1660 (sage, plum gunwale stripe, cream portholes with curtains, a painted flower panel, fenders); water y 1700-1920 with the wake and floating leaves',
  V2S5: "start: the bench front, the stranger's bag, petal-strewn paving, the news box's base, a tree root cut by the bottom-left. End: the terrace floor from the crane's height (paving joints, petal drifts, a bench, a bin, a stroller), roots bottom-left, the lamppost base bottom-right",
  V2S6: "the fence's kerb and tulip beds; three readers' head-backs cut by the bottom (240-300 px, x 60-700) crossing with the truck; a bike rack and a bench in the rail",
  V2S7: 'the forecourt: two cafe tables with seated backs (heads 200-260 px cut by the bottom-left), a bike rack, a planter of grasses, paving joints, the fountain basin rim bottom-right',
  V2S8: "the cafe boat's stern deck bottom-left (x 0-560: two small tables, mugs, a folded chair, a potted bay, a coiled rope), towpath paving with leaves and a drain, a planter and a lamp-post foot bottom-right. NO near heads",
};

// ---------------------------------------------------------------------------------------------------------------
// 11. Contract self-check (numbers vs the rules). Used by the MapContract sheet; run it in any QA script.
// ---------------------------------------------------------------------------------------------------------------
export type ContractIssue = {shot: ShotId | 'ALL'; what: string; severity: 'error' | 'note'};
const overlaps = (a: Rect, b: Rect): boolean => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
const inside = (a: Rect, b: Rect): boolean => a.x0 >= b.x0 && a.x1 <= b.x1 && a.y0 >= b.y0 && a.y1 <= b.y1;
/** Pip's box from a seat (max size, 110 wide x 120 tall unless given). */
export const pipBox = (s: Seat, h: number = LEGIBILITY.pipMaxH, w: number = 110): Rect => ({x0: s.x - w / 2, y0: s.y - h, x1: s.x + w / 2, y1: s.y});
export const rectGap = (a: Rect, b: Rect): number => {
  const dx = Math.max(0, a.x0 - b.x1, b.x0 - a.x1);
  const dy = Math.max(0, a.y0 - b.y1, b.y0 - a.y1);
  return Math.sqrt(dx * dx + dy * dy);
};

export const contractProblems = (): ContractIssue[] => {
  const out: ContractIssue[] = [];
  const band = UI.captionBand;
  const rail = UI.rightRail;
  const err = (shot: ShotId | 'ALL', what: string) => out.push({shot, what, severity: 'error'});
  const note = (shot: ShotId | 'ALL', what: string) => out.push({shot, what, severity: 'note'});
  // Pip never in the band or the rail; inside the key-read box.
  const seats: [ShotId, Seat, number][] = [];
  PIP.forEach((p) => {
    seats.push([p.shot, p.seat, p.shot === 'V2S5' ? LEGIBILITY.pipMaxH : LEGIBILITY.pipMaxH]);
    if (p.seatEnd) seats.push([p.shot, p.seatEnd, p.shot === 'V2S5' ? LEGIBILITY.pipS5EndMinH : LEGIBILITY.pipMaxH]);
  });
  seats.forEach(([id, s, h]) => {
    const b = pipBox(s, h, h === LEGIBILITY.pipS5EndMinH ? 40 : 110);
    if (overlaps(b, band)) err(id, `Pip at (${s.x}, ${s.y}) touches the caption band`);
    if (overlaps(b, rail)) err(id, `Pip at (${s.x}, ${s.y}) touches the right rail`);
    if (!inside(b, UI.keyRead)) note(id, `Pip at (${s.x}, ${s.y}) leaves the key-read box`);
  });
  // Suns clear the band.
  ([['V2S1', SUN0], ['V2S4', SUN1], ['V2S6', SUN2], ['V2S8', SUN8]] as [ShotId, Disc][]).forEach(([id, d]) => {
    if (d.y - d.r < band.y1) err(id, `sun at (${d.x}, ${d.y}) r ${d.r} enters the band`);
  });
  // Boards: inside x <= 780 below y 840, never in the band.
  ([['V2S2', S2.aBoard], ['V2S6', S6.board0], ['V2S6', S6.board1], ['V2S7', B], ['V2S8', B]] as [ShotId, Rect][]).forEach(([id, r]) => {
    if (overlaps(r, rail)) err(id, `board ${JSON.stringify(r)} enters the right rail`);
    if (overlaps(r, band)) err(id, `board ${JSON.stringify(r)} enters the band`);
    if (r.y1 > UI.keyRead.y1) note(id, `board bottom ${r.y1} below y 1250 (legs / the lowest credit only)`);
  });
  // S6: Pip >= 200 px from the clause block (board inner x, y from clauseTopMinY).
  [24, 28.06].forEach((t) => {
    const b = s6BoardAt(t);
    const clause: Rect = {x0: b.x0 + 20, y0: S6.clauseTopMinY, x1: b.x1 - 20, y1: b.y1 - 60};
    const g = rectGap(pipBox(s6PipSeatAt(t)), clause);
    if (g < LEGIBILITY.pipClauseClearPx) err('V2S6', `Pip is ${g.toFixed(0)} px from the clause at ${t}`);
  });
  // Sun 2 above every board top by >= 15 px.
  [S6.board0, B].forEach((r) => {
    if (r.y0 - (SUN2.y + SUN2.r) < 15) err('V2S7', 'SUN2 is < 15 px above a board top');
  });
  if (B.y0 - (SUN8.y + SUN8.r) < 15) err('V2S8', 'the S8 sun touches her board');
  // Staff windows >= 90 x 90.
  S2.staffWindows.forEach((w) => {
    if (Math.min(w.w, w.h) < LEGIBILITY.staffWindowMinPx) err('V2S2', `staff window ${w.id} < 90 px`);
  });
  // The S1 row: ghosts that carry a change >= 130 px.
  s1RowAt(5.3).forEach((m) => {
    if (m.kind === 'ghost' && m.h < LEGIBILITY.carrierFigureMinH) err('V2S1', `${m.id} is ${m.h.toFixed(0)} px (< 130)`);
    if (m.kind === 'outline' && m.h < LEGIBILITY.carrierFigureMinH) note('V2S1', `${m.id} is ${m.h.toFixed(0)} px: the three outlines carry "the row goes on" as ONE group (TREATMENT specs 130 -> 120)`);
    if (m.x < UI.keyRead.x0) note('V2S1', `${m.id} at x ${m.x.toFixed(0)} is left of the key-read box (TREATMENT position)`);
  });
  // W straddles x 880 (TREATMENT position).
  const wr = spotRect(W);
  if (wr.x1 > UI.keyRead.x1) note('ALL', `W spans x ${wr.x0}-${wr.x1}: its centre is inside the key-read box, its right edge ${wr.x1 - UI.keyRead.x1} px past x 880 (TREATMENT position, above the rail)`);
  return out;
};
