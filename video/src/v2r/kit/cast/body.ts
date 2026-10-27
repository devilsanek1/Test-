// K4 cast: the figure geometry. Pure functions: (model, pose, size, gait) -> Part[] in LOCAL px (feet at 0,0; y up is
// negative; profile and rear 3/4 views face LEFT, mirror for right). Reference 1's grammar: a round head that IS the
// hair (seen from behind), a neck, a tombstone torso, one accessory, two leg bars, few lines; no face, no features,
// ever (and no line inside a head that could read as one). Every size-dependent detail is gated by the level of
// detail (parts.ts lodFor).
//
// Builders:
//   standParts   standing / walking / jogging / cycling figures (views back | rear34 | profile)
//   seatParts    seated backs (steps, benches, café chairs): sit, cup, read, phone, notebook, hood up
//   nearParts    head-and-shoulder backs cut by the frame bottom (the near row)
//   bustParts    window figures (a head and shoulders behind a sill): neighbours, staff silhouettes
// Proportions (fractions of the standing height H): head radius 0.112, shoulders 0.75 below the top, torso width
// 0.33 (back) / 0.17 (profile), hem 0.31 (jacket) / 0.24 (mid) / 0.16 (long coat) above the feet.

import {CM} from '../../palette';
import {AccKind, HairKind, Traits} from './traits';
import {Gait, STILL} from './gait';
import {arcPts, capsule, circlePath, curlsPath, curve, ellipsePath, hemLine, Lod, Part, penLoop, polyline, Pt, tomb} from './parts';
import {rng} from '../../../lib/rng';

export type View = 'back' | 'rear34' | 'profile';
export type StandPose = 'stand' | 'walk' | 'jog' | 'cycle' | 'tiller' | 'reach' | 'phoneEar';

/** What to draw: the public's traits plus the extras the named cast uses. */
export type Model = Traits & {
  /** A tote on the shoulder in this colour (her cream tote), besides `acc`. */
  tote?: string;
  /** Her potted desk plant under the arm (S1). */
  plant?: boolean;
  /** A plain lanyard cord at the nape (the S2 staffer). */
  lanyard?: string;
  /** A scarf in this colour, besides `acc` (G4+ ghosts, the near row's bun + mustard scarf). */
  scarf?: string;
  /** 0..1: a slightly softer (rounder) back (G4+), never a stoop. */
  soft?: number;
  /** A back vent line up from the hem (her long coat). */
  vent?: boolean;
  /** Hood down: a collar mound behind the neck (the staffer before 10.36). */
  hoodDown?: boolean;
  /** 0..1 the hood going up over the head (the staffer at 10.36): a whole-head shape change. */
  hoodUp?: number;
  /** A skin crescent at the front of a profile head (direction cue, no features). Default true in profile. */
  cheek?: boolean;
  /** Ghost: every fill this colour except the head (paper). */
  paper?: string;
  /** Ghost: the head (and bun) value. */
  headFill?: string;
  /** No fills at all (the bare outlines). */
  bare?: boolean;
  /** Silhouette: every fill this one colour, no inner detail lines (window figures). */
  mono?: string;
  /** Closed contours everywhere (the ghosts: "the ONE closed outline on purpose"). */
  closed?: boolean;
  /** Apron (the café owner): bib strap at the nape, waist ties with a bow at the back. */
  apron?: string;
  /** Satchel (the reporter): a crossbody strap + a flap bag at the hip. */
  satchel?: string;
};

export type StandOpts = {
  view: View;
  pose: StandPose;
  /** Standing height (px). */
  H: number;
  gait: Gait;
  /** Stride amplitude factor (1 = a normal walk; 0.68 = the G5-G6 shorter stride). */
  stride?: number;
  /** Head turn -1..1 (+1 = toward screen right in the drawn, left-facing frame: a look back over the shoulder). */
  turn?: number;
  /** Head tilt in degrees (- = looking up: S4's stop-look along the plates). */
  tilt?: number;
  lod: Lod;
  seed: string;
  /** Legs on the gait (walk / jog default true; phoneEar / reach when pacing). */
  moving?: boolean;
  /** reach: the hand target (local px) for pose 'reach' (S8 go-in: the door; the café owner's wipe). */
  reach?: Pt;
  /** reach: the elbow (local px); default: bent outward between the shoulder and the hand. */
  elbow?: Pt;
  /** 0..1: one foot up on a step (back view, the right leg: S8 going in at her door). */
  stepUp?: number;
  /** phoneEar: 0..1 the free hand's gesture (S3, 14.28). */
  gesture?: number;
  /** cycle: crank angle (rad). */
  crank?: number;
};

// ---------------------------------------------------------------- colour roles (ghost / bare / silhouette aware)

type Col = (c: string | undefined, role?: 'head' | 'skin' | 'body') => string | undefined;
function colorer(m: Model): Col {
  return (c, role = 'body') => {
    if (m.bare) return undefined;
    if (m.mono) return m.mono;
    if (m.paper) return role === 'head' ? m.headFill ?? m.hairColor : m.paper;
    return c;
  };
}

const P = (n: number) => n.toFixed(1);

// ---------------------------------------------------------------- heads

/** The part of circle (bx, by, br) that lies outside circle (cx, cy, r), as one open curve (the longest run). */
function outsideArc(bx: number, by: number, br: number, cx: number, cy: number, r: number): string {
  const n = 40;
  const pts: Pt[] = [];
  const out: boolean[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const p: Pt = [bx + Math.cos(a) * br, by + Math.sin(a) * br];
    pts.push(p);
    out.push(Math.hypot(p[0] - cx, p[1] - cy) > r * 0.985);
  }
  const s0 = out.indexOf(false);
  if (s0 < 0) return curve([...pts, pts[0]]);
  let best: Pt[] = [];
  let cur: Pt[] = [];
  for (let k = 1; k <= n; k++) {
    const i = (s0 + k) % n;
    if (out[i]) cur.push(pts[i]);
    else {
      if (cur.length > best.length) best = cur;
      cur = [];
    }
  }
  if (cur.length > best.length) best = cur;
  return best.length >= 2 ? curve(best) : '';
}

type HeadOut = {behind: Part[]; front: Part[]};

/** A head of kind `hair` at (cx, cy) radius r. `shoulderY` / `hairEnd` bound long hair and hoods. `turn` (-1..1)
 *  shows a cheek crescent on the turned side (back views); profile heads face left. */
function head(
  m: Model,
  col: Col,
  o: {cx: number; cy: number; r: number; view: View; lod: Lod; seed: string; shoulderY: number; hairEnd: number; turn?: number; tilt?: number},
): HeadOut {
  const {cx, cy, r, view, lod, seed, shoulderY, hairEnd} = o;
  const turn = o.turn ?? 0;
  const tilt = ((o.tilt ?? 0) * Math.PI) / 180;
  const behind: Part[] = [];
  const front: Part[] = [];
  const hairC = col(m.hairColor, 'head');
  const hatC = col(m.hatColor, 'head');
  const skinC = col(m.skin, 'skin');
  const inkOn = lod <= 1;
  const loop = (x: number, y: number, rx: number, ry: number, k: string, over = 14) => (m.closed ? ellipsePath(x, y, rx, ry) : penLoop(x, y, rx, ry, `${seed}/${k}`, over));
  const rot = (dx: number, dy: number): Pt => [cx + dx * Math.cos(tilt) - dy * Math.sin(tilt), cy + dx * Math.sin(tilt) + dy * Math.cos(tilt)];
  let kind: HairKind = m.hair;
  if (m.hoodUp !== undefined && m.hoodUp >= 1) kind = 'hood';

  // ---- ears (behind the head): back views both, rear 3/4 the near (left) one
  const ear = (x: number, y: number, k: string) => {
    if (lod > 1 || !skinC || kind === 'long' || kind === 'hood' || kind === 'curls') return;
    const er = r * 0.2;
    behind.push({k, d: circlePath(x, y, er), fill: skinC, ink: lod === 0 ? penLoop(x, y, er, er, `${seed}/${k}`, 8) : undefined, w: 0.8});
  };
  if (view === 'back') {
    if (turn > -0.6) ear(cx + r * 0.97, cy + r * 0.12, 'earR');
    if (turn < 0.6) ear(cx - r * 0.97, cy + r * 0.12, 'earL');
  } else if (view === 'rear34') {
    if (turn < 0.5) ear(cx - r * 0.95, cy + r * 0.14, 'earL');
  }

  // ---- a high bun sits on top: behind the head (the head overlaps its base)
  if (kind === 'bun') {
    const [bx, by] = view === 'profile' ? rot(r * 0.42, -r * 0.92) : [cx + turn * r * 0.15, cy - r * 0.98];
    behind.push({k: 'bunHi', d: circlePath(bx, by, r * 0.42), fill: hairC, ink: inkOn ? loop(bx, by, r * 0.42, r * 0.42, 'bunHi', 10) : undefined});
  }

  // ---- the head itself
  if (kind === 'long') {
    // one shape: the crown arc and the hair falling to hairEnd (over the back in back views, down the back in profile)
    const pts: Pt[] = [];
    if (view === 'profile') {
      for (const p of arcPts(cx, cy, r, r, 150, 360, 12)) pts.push(p);
      pts.push([cx + r * 1.02, cy + r * 0.6], [cx + r * 0.98, hairEnd], [cx + r * 0.45, hairEnd + r * 0.08], [cx + r * 0.1, cy + r * 0.9]);
    } else {
      const sx = view === 'rear34' ? -r * 0.08 : 0;
      for (const p of arcPts(cx, cy, r, r, 180, 360, 14)) pts.push(p);
      pts.push([cx + r * 1.02, cy + r * 0.55], [cx + r * 0.98 + sx, hairEnd - r * 0.15], [cx + r * 0.7 + sx, hairEnd + r * 0.06], [cx + sx, hairEnd + r * 0.12], [cx - r * 0.7 + sx, hairEnd + r * 0.06], [cx - r * 0.98 + sx, hairEnd - r * 0.15], [cx - r * 1.02, cy + r * 0.55]);
    }
    const d = curve(pts, true, 0.42);
    front.push({k: 'head', d, fill: hairC, ink: inkOn ? d : undefined});
    if (lod === 0 && !m.mono && view !== 'profile') {
      // two strand lines (the hair falls in locks): they run down the back, well below the crown
      front.push({k: 'strands', ink: `M${P(cx - r * 0.38)} ${P(cy + r * 1.1)}Q${P(cx - r * 0.45)} ${P((cy + r + hairEnd) / 2)} ${P(cx - r * 0.32)} ${P(hairEnd - r * 0.1)}M${P(cx + r * 0.28)} ${P(cy + r * 1.15)}Q${P(cx + r * 0.34)} ${P((cy + r + hairEnd) / 2 + r * 0.1)} ${P(cx + r * 0.22)} ${P(hairEnd - r * 0.05)}`, w: 0.6});
    }
  } else if (kind === 'curls') {
    const d = curlsPath(cx, cy, r * 1.04, `${seed}/curls`, lod >= 2 ? 7 : 10);
    front.push({k: 'head', d, fill: hairC, ink: inkOn ? d : undefined});
  } else if (kind === 'hood') {
    // the hood is the whole head shape from behind (coat colour), with a centre seam; in profile, a face opening
    const hc = m.hoodUp !== undefined ? col(m.coat) : hatC;
    if (view === 'profile') {
      const d = curve([...arcPts(cx + r * 0.14, cy + r * 0.02, r * 1.18, r * 1.17, 200, 470, 18), [cx - r * 0.5, cy + r * 1.12]], true, 0.4);
      front.push({k: 'head', d, fill: hc, ink: inkOn ? d : undefined});
      if (skinC && !m.mono && !m.paper && !m.bare) {
        const fd = curve([...arcPts(cx - r * 0.05, cy + r * 0.08, r * 0.82, r * 0.86, 120, 240, 8), [cx - r * 0.45, cy + r * 0.1]], true, 0.4);
        front.push({k: 'face', d: fd, fill: skinC});
      }
    } else {
      const ox = view === 'rear34' ? -r * 0.06 : 0;
      const pts: Pt[] = [...arcPts(cx + ox, cy + r * 0.04, r * 1.2, r * 1.2, 160, 380, 18), [cx + r * 1.15, shoulderY + r * 0.15], [cx + ox, shoulderY + r * 0.42], [cx - r * 1.15, shoulderY + r * 0.15]];
      const d = curve(pts, true, 0.4);
      front.push({k: 'head', d, fill: hc, ink: inkOn ? d : undefined});
      if (lod === 0 && !m.mono) front.push({k: 'seam', ink: `M${P(cx + ox)} ${P(cy - r * 1.12)}Q${P(cx + ox + r * 0.06)} ${P(cy)} ${P(cx + ox)} ${P(shoulderY + r * 0.36)}`, w: 0.7});
    }
  } else {
    const isCrop = kind === 'crop';
    const d = circlePath(cx, cy, r);
    front.push({k: 'head', d, fill: isCrop ? skinC ?? hairC : hairC, ink: inkOn ? loop(cx, cy, r, r, 'head') : undefined});
    if (isCrop && skinC) {
      // a buzz cut: hair over the top 3/4, the nape skin below (its edge is a fill edge, never an inked inner line)
      const cap = curve([...arcPts(cx, cy, r, r, view === 'profile' ? 140 : 168, 372, 14), [cx + r * 0.55, cy + r * 0.48], [cx, cy + r * 0.56], [cx - r * 0.55, cy + r * 0.48]], true, 0.4);
      front.push({k: 'crop', d: cap, fill: hairC, exact: true});
    }
  }

  // ---- a cheek crescent (profile always unless cheek false; back views when the head turns): skin, no features
  const cheekOn = view === 'profile' ? m.cheek !== false && kind !== 'hood' : Math.abs(turn) > 0.15 && kind !== 'hood' && kind !== 'long';
  if (cheekOn && skinC && lod <= 1 && !m.mono && !m.bare && !m.paper) {
    if (view === 'profile') {
      const a0 = 118 + (o.tilt ?? 0);
      const a1 = 222 + (o.tilt ?? 0);
      const arc = arcPts(cx, cy, r, r, a0, a1, 10);
      const inner: Pt = rot(-r * 0.42, r * 0.02);
      front.push({k: 'cheek', d: curve([...arc, inner], true, 0.45), fill: skinC, exact: true});
    } else {
      const sgn = Math.sign(turn);
      const span = 40 + 50 * Math.min(1, Math.abs(turn));
      const mid = sgn > 0 ? 10 : 170;
      const arc = arcPts(cx, cy, r, r, mid - span / 2 + 25 * sgn, mid + span / 2 + 25 * sgn, 10);
      const inner: Pt = [cx + sgn * r * (0.95 - 0.5 * Math.min(1, Math.abs(turn))), cy + r * 0.25];
      front.push({k: 'cheek', d: curve([...arc, inner], true, 0.45), fill: skinC, exact: true});
    }
  }

  // ---- a low bun at the nape (her bun: the identity read from behind). Drawn OVER the head in the head's own colour
  // (exact fill) with ink only on the part of its circle OUTSIDE the head, so head + bun read as one silhouette: never
  // a line inside the head (an inner arc reads as a mouth, i.e. a face).
  if (kind === 'lowBun') {
    let bx: number;
    let by: number;
    if (view === 'profile') [bx, by] = rot(r * 0.84, r * 0.56);
    else if (view === 'rear34') [bx, by] = [cx + r * (0.18 - 0.62 * turn), cy + r * 0.84];
    else [bx, by] = [cx - turn * r * 0.55, cy + r * 0.86];
    const br = r * 0.41;
    front.push({k: 'bunLo', d: circlePath(bx, by, br), fill: hairC, ink: inkOn ? outsideArc(bx, by, br, cx, cy, r) : undefined, exact: true});
  }

  // ---- hats over the head
  if (kind === 'cap' && hatC) {
    if (view === 'profile') {
      const dome = curve([...arcPts(cx, cy, r * 1.04, r * 1.04, 178, 362, 12), [cx, cy - r * 0.1]], true, 0.35);
      front.push({k: 'cap', d: dome, fill: hatC, ink: inkOn ? dome : undefined});
      const bill = ellipsePath(cx - r * 1.2, cy - r * 0.12, r * 0.55, r * 0.13);
      front.push({k: 'bill', d: bill, fill: hatC, ink: inkOn ? bill : undefined});
    } else {
      const dome = curve([...arcPts(cx, cy, r * 1.04, r * 1.04, 186, 354, 12), [cx + r * 0.6, cy - r * 0.02], [cx, cy + r * 0.04], [cx - r * 0.6, cy - r * 0.02]], true, 0.35);
      front.push({k: 'cap', d: dome, fill: hatC, ink: inkOn ? dome : undefined});
      if (lod === 0) {
        // the back strap opening and the top button
        const op = `M${P(cx - r * 0.22)} ${P(cy + r * 0.03)}Q${P(cx)} ${P(cy - r * 0.32)} ${P(cx + r * 0.22)} ${P(cy + r * 0.03)}`;
        front.push({k: 'capOpen', d: `${op}Z`, fill: hairC, ink: op, w: 0.7});
        front.push({k: 'capBtn', d: circlePath(cx, cy - r * 1.02, r * 0.1), fill: hatC, ink: circlePath(cx, cy - r * 1.02, r * 0.1), w: 0.6, exact: true});
      }
    }
  }
  if (kind === 'beanie' && hatC) {
    const ox = view === 'profile' ? r * 0.05 : 0;
    const dome = curve([...arcPts(cx + ox, cy, r * 1.05, r * 1.05, 185, 355, 12), [cx + ox + r * 0.9, cy - r * 0.3], [cx + ox - r * 0.9, cy - r * 0.3]], true, 0.35);
    front.push({k: 'beanie', d: dome, fill: hatC, ink: inkOn ? dome : undefined});
    const band = `M${P(cx + ox - r * 1.08)} ${P(cy - r * 0.34)}Q${P(cx + ox)} ${P(cy - r * 0.42)} ${P(cx + ox + r * 1.08)} ${P(cy - r * 0.34)}L${P(cx + ox + r * 1.06)} ${P(cy - r * 0.02)}Q${P(cx + ox)} ${P(cy - r * 0.1)} ${P(cx + ox - r * 1.06)} ${P(cy - r * 0.02)}Z`;
    front.push({k: 'band', d: band, fill: hatC, ink: lod <= 1 ? band : undefined, w: 0.8});
    if (rng(`pom/${seed}`).chance(0.5) && lod <= 1) {
      const pr = r * 0.24;
      front.push({k: 'pom', d: circlePath(cx + ox, cy - r * 1.1, pr), fill: hatC, ink: inkOn ? loop(cx + ox, cy - r * 1.1, pr, pr, 'pom', 8) : undefined, w: 0.8});
    }
  }

  // ---- the hood going up (0..1): the hood rises from the collar over the head (a whole-head shape change)
  if (m.hoodUp !== undefined && m.hoodUp > 0 && m.hoodUp < 1) {
    const k = m.hoodUp;
    const hc = col(m.coat);
    const top = shoulderY - (shoulderY - (cy - r * 1.22)) * k;
    const pts: Pt[] = [[cx - r * 1.2, shoulderY + r * 0.15], ...arcPts(cx, top + r * 1.2 * Math.min(1, k * 1.2), r * 1.2, r * 1.2 * Math.min(1, k * 1.15), 180, 360, 14), [cx + r * 1.2, shoulderY + r * 0.15], [cx, shoulderY + r * 0.42]];
    const d = curve(pts, true, 0.4);
    front.push({k: 'hoodRise', d, fill: hc, ink: inkOn ? d : undefined});
  }

  // ---- headphones (accessory): band over the crown + ear cups
  if (m.acc === 'headphones' && kind !== 'hood' && lod <= 1) {
    const hp = col(m.accColor);
    if (view === 'profile') {
      const band = `M${P(cx - r * 0.05)} ${P(cy - r * 1.05)}Q${P(cx + r * 0.25)} ${P(cy - r * 0.6)} ${P(cx + r * 0.12)} ${P(cy - r * 0.05)}`;
      front.push({k: 'hpBand', ink: band, w: 1.6, inkColor: m.mono ?? CM.ink});
      const cup = ellipsePath(cx + r * 0.1, cy + r * 0.12, r * 0.28, r * 0.34);
      front.push({k: 'hpCup', d: cup, fill: hp, ink: cup, w: 0.8});
    } else {
      const band = curve(arcPts(cx, cy - r * 0.05, r * 1.06, r * 1.06, 192, 348, 10));
      front.push({k: 'hpBand', ink: band, w: 1.7, inkColor: m.mono ?? CM.ink});
      for (const s of [-1, 1]) {
        if ((view === 'rear34' && s > 0) || s * turn < -0.6) continue;
        const cup = ellipsePath(cx + s * r * 1.02, cy + r * 0.12, r * 0.24, r * 0.34);
        front.push({k: `hpCup${s}`, d: cup, fill: hp, ink: cup, w: 0.8});
      }
    }
  }
  return {behind, front};
}

// ---------------------------------------------------------------- torso accessories (back views)

function backAcc(m: Model, col: Col, o: {cx: number; W: number; shoulderY: number; H: number; lod: Lod; view: View; seated?: boolean}): {under: Part[]; over: Part[]} {
  const {cx, W, shoulderY, H, lod, view} = o;
  const under: Part[] = [];
  const over: Part[] = [];
  const inkOn = lod <= 1;
  const acc: AccKind = m.acc;
  const accC = col(m.accColor);
  if (acc === 'backpack') {
    const pw = W * 0.6;
    const ph = H * (o.seated ? 0.2 : 0.24);
    const top = shoulderY + H * 0.06;
    const px = cx + (view === 'rear34' ? W * 0.06 : 0);
    const d = `M${P(px - pw / 2)} ${P(top + ph * 0.25)}Q${P(px - pw / 2)} ${P(top)} ${P(px)} ${P(top - ph * 0.02)}Q${P(px + pw / 2)} ${P(top)} ${P(px + pw / 2)} ${P(top + ph * 0.25)}L${P(px + pw / 2)} ${P(top + ph * 0.88)}Q${P(px + pw / 2)} ${P(top + ph)} ${P(px + pw * 0.4)} ${P(top + ph)}L${P(px - pw * 0.4)} ${P(top + ph)}Q${P(px - pw / 2)} ${P(top + ph)} ${P(px - pw / 2)} ${P(top + ph * 0.88)}Z`;
    over.push({k: 'pack', d, fill: accC, ink: inkOn ? d : undefined});
    if (lod === 0 && !m.mono) {
      over.push({k: 'packFlap', ink: `M${P(px - pw * 0.42)} ${P(top + ph * 0.3)}Q${P(px)} ${P(top + ph * 0.42)} ${P(px + pw * 0.42)} ${P(top + ph * 0.3)}`, w: 0.7});
      over.push({k: 'packPocket', ink: `M${P(px - pw * 0.26)} ${P(top + ph * 0.62)}L${P(px + pw * 0.26)} ${P(top + ph * 0.62)}`, w: 0.6});
    }
    if (lod <= 1 && !m.mono) {
      for (const s of [-1, 1]) {
        if (view === 'rear34' && s < 0) continue;
        over.push({k: `strap${s}`, ink: `M${P(cx + s * W * 0.3)} ${P(shoulderY + H * 0.003)}Q${P(cx + s * W * 0.33)} ${P(top - H * 0.01)} ${P(px + s * pw * 0.38)} ${P(top + ph * 0.08)}`, w: 0.9});
      }
    }
  } else if (acc === 'tote') {
    if (o.seated) {
      // a tote set down on the seat beside the hip, its handles up
      const bw = H * 0.13;
      const bh = H * 0.13;
      const bx = cx + W * 0.62;
      const d = `M${P(bx - bw / 2)} ${P(-bh)}L${P(bx + bw / 2)} ${P(-bh)}L${P(bx + bw * 0.55)} 0L${P(bx - bw * 0.55)} 0Z`;
      under.push({k: 'bag', d, fill: accC, ink: inkOn ? d : undefined});
      if (inkOn) under.push({k: 'bagHandle', ink: `M${P(bx - bw * 0.28)} ${P(-bh)}Q${P(bx)} ${P(-bh - H * 0.09)} ${P(bx + bw * 0.28)} ${P(-bh)}`, w: 0.8});
    } else {
      const tp = totePartsBack(accC, {cx, W, shoulderY, H, lod, k: 'bag'});
      under.push(tp.bag);
      if (tp.straps) over.push(tp.straps);
    }
  } else if (acc === 'strap') {
    const bagW = H * 0.085;
    const bagH = H * 0.075;
    const bx = cx + W * 0.42;
    const by = o.seated ? -H * 0.13 : -H * 0.42;
    const d = `M${P(bx - bagW / 2)} ${P(by)}L${P(bx + bagW / 2)} ${P(by)}L${P(bx + bagW * 0.54)} ${P(by + bagH)}L${P(bx - bagW * 0.54)} ${P(by + bagH)}Z`;
    over.push({k: 'bag', d, fill: accC, ink: inkOn ? d : undefined});
    if (inkOn) over.push({k: 'bagStrap', ink: `M${P(cx - W * 0.3)} ${P(shoulderY + H * 0.01)}L${P(bx)} ${P(by + H * 0.004)}`, w: 0.9});
  }
  return {under, over};
}

/** A shoulder tote hanging at the side: two handle lines from the shoulder to the bag's mouth (back / rear 3/4). */
function totePartsBack(c: string | undefined, o: {cx: number; W: number; shoulderY: number; H: number; lod: Lod; k: string; side?: number}): {bag: Part; straps?: Part} {
  const {cx, W, shoulderY, H} = o;
  const s = o.side ?? 1;
  const bagW = H * 0.13;
  const bagH = H * 0.15;
  const bx = cx + s * (W * 0.5 + bagW * 0.12);
  const by = -H * 0.52;
  const d = `M${P(bx - bagW / 2)} ${P(by)}L${P(bx + bagW / 2)} ${P(by)}L${P(bx + bagW * 0.55)} ${P(by + bagH)}L${P(bx - bagW * 0.55)} ${P(by + bagH)}Z`;
  const bag: Part = {k: o.k, d, fill: c, ink: o.lod <= 1 ? d : undefined};
  if (o.lod > 1) return {bag};
  const a0 = cx + s * W * 0.2;
  const a1 = cx + s * W * 0.34;
  const straps: Part = {
    k: `${o.k}Straps`,
    ink: `M${P(a0)} ${P(shoulderY - H * 0.002)}Q${P(a0 + s * W * 0.2)} ${P((shoulderY + by) / 2)} ${P(bx - s * bagW * 0.3)} ${P(by + H * 0.004)}M${P(a1)} ${P(shoulderY + H * 0.012)}Q${P(a1 + s * W * 0.16)} ${P((shoulderY + by) / 2 + H * 0.02)} ${P(bx + s * bagW * 0.22)} ${P(by + H * 0.004)}`,
    w: 0.85,
  };
  return {bag, straps};
}

/** A scarf at the neck: a band and one end thrown back over a shoulder, angled outward (never down the centre: that
 *  reads as a tie, i.e. a front view). */
function scarfParts(c: string | undefined, o: {cx: number; y: number; w: number; H: number; view: View; lod: Lod; k: string}): Part[] {
  if (o.lod >= 3) return [];
  const {cx, y, w, H} = o;
  const h = H * 0.055;
  const band = `M${P(cx - w / 2)} ${P(y - h * 0.3)}Q${P(cx)} ${P(y - h * 0.9)} ${P(cx + w / 2)} ${P(y - h * 0.3)}L${P(cx + w / 2)} ${P(y + h * 0.5)}Q${P(cx)} ${P(y + h * 0.2)} ${P(cx - w / 2)} ${P(y + h * 0.5)}Z`;
  const tx = o.view === 'profile' ? cx + w * 0.42 : cx + w * 0.3;
  const tdx = o.view === 'profile' ? H * 0.04 : H * 0.05;
  const tail = `M${P(tx - H * 0.024)} ${P(y)}L${P(tx + H * 0.024)} ${P(y - H * 0.004)}L${P(tx + tdx + H * 0.022)} ${P(y + H * 0.13)}L${P(tx + tdx - H * 0.02)} ${P(y + H * 0.135)}Z`;
  const inkOn = o.lod <= 1;
  return [
    {k: `${o.k}Tail`, d: tail, fill: c, ink: inkOn ? tail : undefined, w: 0.85},
    {k: `${o.k}Band`, d: band, fill: c, ink: inkOn ? band : undefined, w: 0.85},
  ];
}

/** Her potted desk plant (carried under the arm, S1): a brick pot held at the hip and five long leaves fanning up and
 *  out past her silhouette, so it reads at 216 px ("she cleared her desk"). (x, y) = the pot's base centre; `out` =
 *  which way the leaves lean (-1 left). */
function plantParts(col: Col, o: {x: number; y: number; H: number; lod: Lod; out?: number}): Part[] {
  const {x, y, H} = o;
  const lean = o.out ?? -1;
  const pw = H * 0.1;
  const ph = H * 0.085;
  const pot = `M${P(x - pw / 2)} ${P(y - ph)}L${P(x + pw / 2)} ${P(y - ph)}L${P(x + pw * 0.38)} ${P(y)}L${P(x - pw * 0.38)} ${P(y)}Z`;
  const rim = `M${P(x - pw * 0.56)} ${P(y - ph - H * 0.016)}L${P(x + pw * 0.56)} ${P(y - ph - H * 0.016)}L${P(x + pw * 0.56)} ${P(y - ph + H * 0.008)}L${P(x - pw * 0.56)} ${P(y - ph + H * 0.008)}Z`;
  const leaves: Part[] = [];
  // [angle from vertical (deg, + = outward), length (x H), half-width (x H)]
  const L: [number, number, number][] = [
    [-30, 0.12, 0.022],
    [-10, 0.165, 0.026],
    [10, 0.18, 0.027],
    [32, 0.15, 0.025],
    [55, 0.11, 0.021],
  ];
  const base: Pt = [x, y - ph - H * 0.01];
  L.forEach(([a, len, hw], i) => {
    const rad = (a * Math.PI) / 180;
    const ux = Math.sin(rad) * lean;
    const uy = -Math.cos(rad);
    const tip: Pt = [base[0] + ux * len * H, base[1] + uy * len * H];
    const nx = -uy;
    const ny = ux;
    const mid: Pt = [(base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2];
    const w = hw * H;
    const d = curve([base, [mid[0] + nx * w, mid[1] + ny * w], tip, [mid[0] - nx * w, mid[1] - ny * w]], true, 0.55);
    leaves.push({k: `leaf${i}`, d, fill: col(CM.sage), ink: o.lod <= 1 ? d : undefined, w: 0.7});
    if (o.lod === 0) leaves.push({k: `vein${i}`, ink: `M${P(base[0] + (tip[0] - base[0]) * 0.2)} ${P(base[1] + (tip[1] - base[1]) * 0.2)}L${P(base[0] + (tip[0] - base[0]) * 0.75)} ${P(base[1] + (tip[1] - base[1]) * 0.75)}`, w: 0.45});
  });
  return [
    ...leaves,
    {k: 'pot', d: pot, fill: col(CM.brick), ink: o.lod <= 1 ? pot : undefined, w: 0.85},
    {k: 'potRim', d: rim, fill: col(CM.brick), ink: o.lod <= 1 ? rim : undefined, w: 0.75},
  ];
}

// ---------------------------------------------------------------- standing / walking figures

/** Standing, walking, jogging, cycling, tiller, reach and phone-at-ear figures in three views. */
export function standParts(m: Model, o: StandOpts): Part[] {
  const col = colorer(m);
  const {H, lod, view, seed} = o;
  const g = o.gait;
  const pose = o.pose;
  const moving = o.moving ?? (pose === 'walk' || pose === 'jog');
  const amp = (o.stride ?? 1) * (pose === 'jog' ? 1.45 : 1);
  const br = m.broad;
  const r = H * 0.112;
  const bobY = moving ? g.bob * H * (pose === 'jog' ? 0.03 : 0.013) : 0;
  const lean = pose === 'jog' ? H * 0.04 : pose === 'cycle' ? H * 0.12 : 0;
  const inkOn = lod <= 1;
  const out: Part[] = [];
  const legC = col(m.trousers);
  const shoeC = col(m.shoes);
  const coatC = col(m.coat);
  const soft = m.soft ?? 0;

  if (pose === 'cycle') return cycleParts(m, col, o);

  const hemY = (m.coatLen === 'long' ? -0.165 : m.coatLen === 'mid' ? -0.245 : -0.315) * H + bobY * 0.5;
  const flare = m.coatLen === 'long' ? 0.15 : m.coatLen === 'mid' ? 0.08 : 0.03;
  const shoulderY = -H + 2 * r + H * 0.03 + bobY;
  let headCx = -lean * 0.9;
  const headCy = -H + r + bobY;

  if (view === 'back') {
    const sway = moving ? H * 0.009 * g.s : 0;
    headCx += sway * 1.1;
    const cx = sway;
    const W = H * 0.33 * br;
    const up = o.stepUp ?? 0;
    // legs (left = liftNear, right = liftFar; the right one goes up a step on stepUp)
    for (const [s, lift0] of [
      [-1, moving ? g.liftNear : 0],
      [1, moving ? g.liftFar : 0],
    ] as [number, number][]) {
      const lift = s > 0 ? Math.max(lift0, up * 1.3) : lift0;
      const lx = cx * 0.4 + s * H * 0.068 * br;
      const fy = -lift * H * 0.06 * (s > 0 && up > 0 ? 1 : amp);
      const legTop = hemY - H * 0.04;
      if (lod <= 2) {
        const d = capsule([lx, legTop], [lx, fy - H * 0.018], H * 0.04 * br, H * 0.035 * br);
        out.push({k: `leg${s}`, d, fill: legC, ink: inkOn ? d : undefined});
        // shoe: a heel from behind; a lifted foot shows its sole
        const sd = ellipsePath(lx, fy - H * 0.014, H * 0.045 * br, H * 0.022);
        out.push({k: `shoe${s}`, d: sd, fill: lift > 0.35 && !m.paper && !m.mono ? CM.paper : shoeC, ink: lod === 0 ? sd : undefined, w: 0.75});
      } else {
        out.push({k: `leg${s}`, d: capsule([lx, legTop], [lx, fy - H * 0.01], H * 0.045, H * 0.04), fill: legC});
      }
    }
    // neck
    if (lod <= 1 && m.hair !== 'long' && m.hair !== 'hood') {
      const nd = `M${P(headCx - r * 0.34)} ${P(headCy + r * 0.5)}L${P(headCx + r * 0.34)} ${P(headCy + r * 0.5)}L${P(cx + r * 0.36)} ${P(shoulderY + H * 0.02)}L${P(cx - r * 0.36)} ${P(shoulderY + H * 0.02)}Z`;
      out.push({k: 'neck', d: nd, fill: col(m.skin, 'skin'), ink: lod === 0 ? `M${P(headCx - r * 0.34)} ${P(headCy + r * 0.62)}L${P(cx - r * 0.36)} ${P(shoulderY + H * 0.012)}M${P(headCx + r * 0.34)} ${P(headCy + r * 0.62)}L${P(cx + r * 0.36)} ${P(shoulderY + H * 0.012)}` : undefined, w: 0.7});
    }
    const acc = backAcc(m, col, {cx, W, shoulderY, H, lod, view});
    if (m.tote) {
      const tp = totePartsBack(col(m.tote), {cx, W, shoulderY, H, lod, k: 'tote'});
      acc.under.push(tp.bag);
      if (tp.straps) acc.over.push(tp.straps);
    }
    out.push(...acc.under);
    // the coat
    const round = 0.42 + soft * 0.1;
    const fillD = tomb(cx, hemY, W, hemY - shoulderY, round, flare, true);
    out.push({k: 'coat', d: fillD, fill: coatC, ink: inkOn ? (m.closed ? fillD : tomb(cx, hemY, W, hemY - shoulderY, round, flare, false)) : undefined});
    if (inkOn && !m.closed) out.push({k: 'hem', ink: hemLine(cx, hemY, W, flare, `${seed}/hem`), w: 0.9});
    if (lod === 0 && !m.mono) {
      // arm seams (the arms live inside the coat from behind), swinging a hair on a walk
      const sw = moving ? H * 0.008 * g.s : 0;
      const armEnd = -H * 0.45 + bobY;
      const reachR = pose === 'reach';
      out.push({k: 'seams', ink: `M${P(cx - W / 2 + H * 0.06)} ${P(shoulderY + H * 0.1)}Q${P(cx - W / 2 + H * 0.05 - sw)} ${P((shoulderY + armEnd) / 2)} ${P(cx - W / 2 + H * 0.055 - sw)} ${P(armEnd)}` + (reachR ? '' : `M${P(cx + W / 2 - H * 0.06)} ${P(shoulderY + H * 0.1)}Q${P(cx + W / 2 - H * 0.05 + sw)} ${P((shoulderY + armEnd) / 2)} ${P(cx + W / 2 - H * 0.055 + sw)} ${P(armEnd)}`), w: 0.6});
      if (m.vent) out.push({k: 'vent', ink: `M${P(cx)} ${P(hemY - H * 0.005)}L${P(cx + H * 0.002)} ${P(hemY - H * 0.1)}`, w: 0.7});
      if (m.apron) {
        // apron: a strap round the nape and the waist ties with a bow at the small of the back
        const ap = col(m.apron);
        const wy = -H * 0.5 + bobY;
        out.push({k: 'apTie', d: `M${P(cx - W * 0.5)} ${P(wy - H * 0.012)}L${P(cx + W * 0.5)} ${P(wy - H * 0.012)}L${P(cx + W * 0.5)} ${P(wy + H * 0.012)}L${P(cx - W * 0.5)} ${P(wy + H * 0.012)}Z`, fill: ap, ink: `M${P(cx - W * 0.5)} ${P(wy - H * 0.012)}L${P(cx + W * 0.5)} ${P(wy - H * 0.012)}M${P(cx - W * 0.5)} ${P(wy + H * 0.012)}L${P(cx + W * 0.5)} ${P(wy + H * 0.012)}`, w: 0.6});
        const bow = `M${P(cx)} ${P(wy)}L${P(cx - H * 0.05)} ${P(wy - H * 0.025)}L${P(cx - H * 0.05)} ${P(wy + H * 0.025)}ZM${P(cx)} ${P(wy)}L${P(cx + H * 0.05)} ${P(wy - H * 0.025)}L${P(cx + H * 0.05)} ${P(wy + H * 0.025)}Z`;
        out.push({k: 'apBow', d: bow, fill: ap, ink: bow, w: 0.6});
        out.push({k: 'apTails', ink: `M${P(cx - H * 0.01)} ${P(wy + H * 0.01)}L${P(cx - H * 0.03)} ${P(wy + H * 0.09)}M${P(cx + H * 0.01)} ${P(wy + H * 0.01)}L${P(cx + H * 0.035)} ${P(wy + H * 0.085)}`, w: 0.7});
        out.push({k: 'apNeck', ink: `M${P(cx - r * 0.42)} ${P(shoulderY + H * 0.008)}Q${P(cx)} ${P(shoulderY + H * 0.04)} ${P(cx + r * 0.42)} ${P(shoulderY + H * 0.008)}`, w: 0.8, inkColor: CM.ink});
      }
    }
    out.push(...acc.over);
    if (m.scarf || m.acc === 'scarf') out.push(...scarfParts(col(m.scarf ?? m.accColor), {cx: headCx * 0.5 + cx * 0.5, y: shoulderY, w: r * 1.9, H, view, lod, k: 'scarf'}));
    if (pose === 'reach' && o.reach) {
      const from: Pt = [cx + W * 0.34, shoulderY + H * 0.06];
      const el: Pt = o.elbow ?? [Math.max(from[0], o.reach[0]) + H * 0.04, (from[1] + o.reach[1]) / 2 + H * 0.05];
      out.push(...armParts(col, m, {from, to: o.reach, H, lod, k: 'reachArm', elbow: el}));
    }
    const hd = head(m, col, {cx: headCx, cy: headCy, r, view, lod, seed, shoulderY, hairEnd: shoulderY + H * 0.17, turn: o.turn, tilt: o.tilt});
    out.push(...hd.behind, ...hd.front);
    return out;
  }

  // ---- profile and rear 3/4 (facing LEFT): legs scissor about the hip
  const r34 = view === 'rear34';
  const A = (((pose === 'jog' ? 30 : 22) * Math.PI) / 180) * amp * (r34 ? 0.62 : 1);
  const hipY = -H * 0.47 + bobY;
  const L = -hipY;
  const legOne = (which: 'near' | 'far') => {
    const sgn = which === 'near' ? 1 : -1;
    const th = moving ? A * g.s * sgn : pose === 'tiller' ? 0.12 * sgn : 0;
    const lift = moving ? (which === 'near' ? g.liftNear : g.liftFar) * H * (pose === 'jog' ? 0.09 : 0.05) * (o.stride ?? 1) : 0;
    const hx = (r34 ? (which === 'near' ? -H * 0.05 : H * 0.05) : H * 0.008) - lean * 0.2;
    const fx = hx - Math.sin(th) * L;
    const fy = -lift;
    if (lod <= 2) {
      const knee: Pt = [hx - Math.sin(th) * L * 0.5 - (lift > 0 ? H * 0.025 * (lift / (H * 0.05)) : 0), hipY + (fy - hipY) * 0.5];
      const d1 = capsule([hx, hipY], knee, H * 0.042, H * 0.037);
      const d2 = capsule(knee, [fx, fy - H * 0.02], H * 0.037, H * 0.031);
      out.push({k: `thigh${which}`, d: d1, fill: legC});
      out.push({k: `shin${which}`, d: d2, fill: legC, ink: inkOn ? d2 : undefined});
      // a shoe pointing forward (left), toe down a hair on a swing
      const tl = r34 ? H * 0.045 : H * 0.07;
      const tip = lift > 0 ? lift * 0.35 : 0;
      const shoe = `M${P(fx + H * 0.026)} ${P(fy - H * 0.035)}L${P(fx - tl * 0.55)} ${P(fy - H * 0.034 + tip * 0.3)}Q${P(fx - tl)} ${P(fy - H * 0.03 + tip)} ${P(fx - tl)} ${P(fy - H * 0.006 + tip)}L${P(fx + H * 0.026)} ${P(fy)}Z`;
      out.push({k: `shoe${which}`, d: shoe, fill: shoeC, ink: lod === 0 ? shoe : undefined, w: 0.75});
    } else {
      out.push({k: `leg${which}`, d: capsule([hx, hipY], [fx, fy - H * 0.01], H * 0.045, H * 0.04), fill: legC});
    }
  };
  legOne('far');
  legOne('near');

  const armA = moving ? -A * 0.9 * g.s : 0;
  if (r34) {
    const W = H * 0.29 * br;
    const cx = H * 0.012 - lean * 0.6;
    headCx = cx - H * 0.035 - lean * 0.3;
    // the tote on the right (away) shoulder, the plant under the left arm
    const under: Part[] = [];
    const over: Part[] = [];
    if (m.tote) {
      const tp = totePartsBack(col(m.tote), {cx, W, shoulderY, H, lod, k: 'tote'});
      under.push(tp.bag);
      if (tp.straps) over.push(tp.straps);
    }
    const acc = backAcc(m, col, {cx, W, shoulderY, H, lod, view});
    out.push(...under, ...acc.under);
    const round = 0.42 + soft * 0.1;
    const fillD = tomb(cx, hemY, W, hemY - shoulderY, round, flare, true);
    out.push({k: 'coat', d: fillD, fill: coatC, ink: inkOn ? (m.closed ? fillD : tomb(cx, hemY, W, hemY - shoulderY, round, flare, false)) : undefined});
    if (inkOn && !m.closed) out.push({k: 'hem', ink: hemLine(cx, hemY, W, flare, `${seed}/hem`), w: 0.9});
    if (lod === 0 && !m.mono) {
      out.push({k: 'seamR', ink: `M${P(cx + W / 2 - H * 0.06)} ${P(shoulderY + H * 0.1)}Q${P(cx + W / 2 - H * 0.05)} ${P(shoulderY + H * 0.2)} ${P(cx + W / 2 - H * 0.055)} ${P(-H * 0.45)}`, w: 0.6});
      if (m.vent) out.push({k: 'vent', ink: `M${P(cx + H * 0.025)} ${P(hemY - H * 0.005)}L${P(cx + H * 0.027)} ${P(hemY - H * 0.1)}`, w: 0.7});
    }
    out.push(...acc.over, ...over);
    if (m.scarf || m.acc === 'scarf') out.push(...scarfParts(col(m.scarf ?? m.accColor), {cx: headCx * 0.6 + cx * 0.4, y: shoulderY, w: r * 1.85, H, view, lod, k: 'scarf'}));
    // the near (left) arm: inside the coat (a seam) on a walk, like reference 1's backs; out only to carry the plant
    // or to reach (a hanging arm outside the silhouette reads as a stick at 216 px)
    const sh: Pt = [cx - W / 2 + H * 0.04, shoulderY + H * 0.05];
    if (m.plant) {
      const potX = cx - W / 2 - H * 0.025;
      const potY = -H * 0.4;
      out.push(...armParts(col, m, {from: sh, to: [potX + H * 0.03, potY - H * 0.07], H, lod, k: 'armL', elbow: [cx - W / 2 - H * 0.01, shoulderY + H * 0.16], noHand: true}));
      out.push(...plantParts(col, {x: potX, y: potY, H, lod, out: -1}));
      if (lod <= 1) {
        const hd = circlePath(potX + H * 0.03, potY - H * 0.05, H * 0.024);
        out.push({k: 'plantHand', d: hd, fill: col(m.skin, 'skin'), ink: lod === 0 ? hd : undefined, w: 0.7});
      }
    } else if (pose === 'reach' && o.reach) {
      out.push(...armParts(col, m, {from: sh, to: o.reach, H, lod, k: 'armL', elbow: o.elbow}));
    } else if (lod === 0 && !m.mono) {
      const sw = moving ? H * 0.01 * g.s : 0;
      out.push({k: 'seamL', ink: `M${P(cx - W / 2 + H * 0.06)} ${P(shoulderY + H * 0.1)}Q${P(cx - W / 2 + H * 0.05 - sw)} ${P(shoulderY + H * 0.2)} ${P(cx - W / 2 + H * 0.055 - sw)} ${P(-H * 0.45)}`, w: 0.6});
    }
    const hd = head(m, col, {cx: headCx, cy: headCy, r, view, lod, seed, shoulderY, hairEnd: shoulderY + H * 0.17, turn: o.turn, tilt: o.tilt});
    out.push(...hd.behind, ...hd.front);
    return out;
  }

  // ---- profile
  const cx = H * 0.005 - lean * 0.5;
  headCx = cx - H * 0.012 - lean * 0.6;
  const fl = m.coatLen === 'long' ? H * 0.035 : m.coatLen === 'mid' ? H * 0.02 : H * 0.004;
  const swing = moving ? H * 0.012 * g.s : 0;
  const halfW = H * 0.088 * br * (1 + soft * 0.06);
  const coatPts: Pt[] = [
    [cx - halfW * 0.62, shoulderY + H * 0.004],
    [cx + halfW * 0.55, shoulderY - H * 0.006],
    [cx + halfW * 1.02, shoulderY + H * 0.05 + soft * H * 0.01],
    [cx + halfW * 1.02 + fl * 0.4, (shoulderY + hemY) / 2],
    [cx + halfW + fl + swing, hemY],
    [cx - halfW - fl * 0.6 + swing * 0.6, hemY],
    [cx - halfW * 0.98, (shoulderY + hemY) / 2],
    [cx - halfW * 0.88, shoulderY + H * 0.06],
  ];
  const coatD = curve(coatPts, true, 0.28);
  // back accessories behind the coat (a backpack shows on the back), the tote strap over it
  const accC = col(m.accColor);
  if (m.acc === 'backpack') {
    const d = `M${P(cx + halfW * 0.7)} ${P(shoulderY + H * 0.05)}L${P(cx + halfW * 1.75)} ${P(shoulderY + H * 0.07)}Q${P(cx + halfW * 1.9)} ${P(shoulderY + H * 0.2)} ${P(cx + halfW * 1.7)} ${P(shoulderY + H * 0.3)}L${P(cx + halfW * 0.8)} ${P(shoulderY + H * 0.3)}Z`;
    out.push({k: 'pack', d, fill: accC, ink: inkOn ? d : undefined});
  }
  if (m.tote || m.acc === 'tote') {
    const bw = H * 0.11;
    const bx = cx + halfW * 0.55;
    const by = -H * 0.49;
    const d = `M${P(bx - bw / 2)} ${P(by)}L${P(bx + bw / 2)} ${P(by)}L${P(bx + bw * 0.56)} ${P(by + H * 0.15)}L${P(bx - bw * 0.56)} ${P(by + H * 0.15)}Z`;
    out.push({k: 'tote', d, fill: col(m.tote ?? m.accColor), ink: inkOn ? d : undefined});
  }
  if (pose === 'phoneEar' && lod <= 2) {
    // the far arm (free hand) in front of the chest, gesturing on `gesture`
    const gk = o.gesture ?? 0;
    const sh: Pt = [cx - halfW * 0.2, shoulderY + H * 0.05];
    const hand: Pt = [cx - halfW * (1.3 + 1.1 * gk), shoulderY + H * (0.3 - 0.12 * gk)];
    out.push(...armParts(col, m, {from: sh, to: hand, H, lod, k: 'armFar', elbow: [cx - halfW * (0.7 + 0.2 * gk), shoulderY + H * 0.24]}));
  }
  out.push({k: 'coat', d: coatD, fill: coatC, ink: inkOn ? coatD : undefined});
  if (lod === 0 && !m.mono && m.vent) out.push({k: 'vent', ink: `M${P(cx + halfW + fl * 0.8 + swing)} ${P(hemY - H * 0.003)}L${P(cx + halfW * 0.92 + fl * 0.5)} ${P(hemY - H * 0.09)}`, w: 0.7});
  if (inkOn && !m.mono && (m.tote || m.acc === 'tote')) out.push({k: 'toteStrap', ink: `M${P(cx + halfW * 0.1)} ${P(shoulderY + H * 0.002)}L${P(cx + halfW * 0.4)} ${P(-H * 0.49)}M${P(cx + halfW * 0.3)} ${P(shoulderY + H * 0.004)}L${P(cx + halfW * 0.72)} ${P(-H * 0.49)}`, w: 0.85});
  if (m.acc === 'strap' && lod <= 1) {
    const d = ellipsePath(cx - halfW * 0.95, -H * 0.4, H * 0.04, H * 0.035);
    out.push({k: 'strapBag', d, fill: accC, ink: d});
    out.push({k: 'strapLine', ink: `M${P(cx + halfW * 0.4)} ${P(shoulderY + H * 0.004)}L${P(cx - halfW * 0.9)} ${P(-H * 0.43)}`, w: 0.9});
  }
  if (m.acc === 'backpack' && lod <= 1) out.push({k: 'packStrap', ink: `M${P(cx + halfW * 0.3)} ${P(shoulderY + H * 0.004)}Q${P(cx - halfW * 0.2)} ${P(shoulderY + H * 0.12)} ${P(cx + halfW * 0.5)} ${P(shoulderY + H * 0.24)}`, w: 0.9});
  if (m.scarf || m.acc === 'scarf') out.push(...scarfParts(col(m.scarf ?? m.accColor), {cx: cx + H * 0.004, y: shoulderY + H * 0.005, w: halfW * 1.5, H, view, lod, k: 'scarf'}));
  // the near arm
  const sh: Pt = [cx + halfW * 0.08, shoulderY + H * 0.045];
  if (pose === 'phoneEar') {
    // elbow out in front of the chest, the hand at the ear: the pose reads in silhouette
    const elbow: Pt = [cx - halfW * 1.55, shoulderY + H * 0.11];
    const hand: Pt = [headCx - r * 0.45, headCy + r * 0.3];
    out.push(...armParts(col, m, {from: sh, to: hand, H, lod, k: 'armNear', elbow}));
    const ph = `M${P(hand[0] - H * 0.012)} ${P(hand[1] - H * 0.05)}L${P(hand[0] + H * 0.014)} ${P(hand[1] - H * 0.052)}L${P(hand[0] + H * 0.016)} ${P(hand[1] + H * 0.012)}L${P(hand[0] - H * 0.01)} ${P(hand[1] + H * 0.014)}Z`;
    out.push({k: 'phone', d: ph, fill: m.mono ?? CM.anchor, exact: true});
  } else if (pose === 'jog') {
    const elbow: Pt = [sh[0] + Math.sin(armA) * H * 0.13, sh[1] + H * 0.13];
    out.push(...armParts(col, m, {from: sh, to: [elbow[0] - H * 0.08, elbow[1] - H * 0.06], H, lod, k: 'armNear', elbow}));
  } else if (pose === 'tiller') {
    out.push(...armParts(col, m, {from: sh, to: [sh[0] + H * 0.16, sh[1] + H * 0.25], H, lod, k: 'armNear'}));
  } else if (pose === 'reach' && o.reach) {
    out.push(...armParts(col, m, {from: sh, to: o.reach, H, lod, k: 'armNear', elbow: o.elbow}));
  } else if (m.plant) {
    const potX = cx - halfW * 1.15;
    const potY = -H * 0.4;
    out.push(...armParts(col, m, {from: sh, to: [potX + H * 0.03, potY - H * 0.07], H, lod, k: 'armNear', elbow: [cx + halfW * 0.2, shoulderY + H * 0.18], noHand: true}));
    out.push(...plantParts(col, {x: potX, y: potY, H, lod, out: -1}));
  } else {
    const La = H * 0.3;
    out.push(...armParts(col, m, {from: sh, to: [sh[0] - Math.sin(armA) * La, sh[1] + Math.cos(armA) * La], H, lod, k: 'armNear'}));
  }
  const hd = head(m, col, {cx: headCx, cy: headCy, r, view, lod, seed, shoulderY, hairEnd: shoulderY + H * 0.16, turn: o.turn, tilt: o.tilt});
  out.push(...hd.behind, ...hd.front);
  return out;
}

/** A sleeve (coat colour) from the shoulder to the hand, optionally through an elbow; a small skin hand at LOD 0-1. */
function armParts(col: Col, m: Model, o: {from: Pt; to: Pt; H: number; lod: Lod; k: string; elbow?: Pt; noHand?: boolean}): Part[] {
  const {from, to, H, lod, k} = o;
  const out: Part[] = [];
  const inkOn = lod <= 1;
  const c = col(m.coat);
  const hw0 = H * 0.034;
  const hw1 = H * 0.028;
  if (o.elbow) {
    const d1 = capsule(from, o.elbow, hw0, hw0 * 0.92);
    const d2 = capsule(o.elbow, to, hw0 * 0.92, hw1);
    out.push({k: `${k}U`, d: d1, fill: c, ink: inkOn ? d1 : undefined});
    out.push({k: `${k}F`, d: d2, fill: c, ink: inkOn ? d2 : undefined});
  } else {
    const d = capsule(from, to, hw0, hw1);
    out.push({k, d, fill: c, ink: inkOn ? d : undefined});
  }
  if (lod <= 1 && !o.noHand) {
    const hr = H * 0.024;
    const d = circlePath(to[0], to[1] + hr * 0.4, hr);
    out.push({k: `${k}H`, d, fill: col(m.skin, 'skin'), ink: lod === 0 ? d : undefined, w: 0.7});
  }
  return out;
}

/** A cyclist in profile (riding left): the bike in ink, the rider leaning forward, legs on the cranks. */
function cycleParts(m: Model, col: Col, o: StandOpts): Part[] {
  const {H, lod, seed} = o;
  const inkOn = lod <= 1;
  const out: Part[] = [];
  const wr = H * 0.2;
  const wb = H * 0.62;
  const fwx = -wb / 2;
  const bwx = wb / 2;
  const wy = -wr;
  const crank = o.crank ?? 0;
  const bb: Pt = [H * 0.04, -wr * 0.95];
  const seat: Pt = [H * 0.12, -H * 0.58];
  const bar: Pt = [-H * 0.22, -H * 0.66];
  for (const [x, k] of [
    [bwx, 'wB'],
    [fwx, 'wF'],
  ] as [number, string][]) {
    out.push({k, d: lod === 0 ? circlePath(x, wy, wr) : undefined, fill: lod === 0 && !m.mono ? CM.glass : undefined, ink: inkOn ? penLoop(x, wy, wr, wr, `${seed}/${k}`, 6) : undefined, w: 0.85});
  }
  if (inkOn) out.push({k: 'frame', ink: polyline([[bwx, wy], bb, seat]) + polyline([bb, [-H * 0.18, -H * 0.56], bar]) + polyline([seat, [-H * 0.17, -H * 0.56]]) + polyline([[-H * 0.18, -H * 0.56], [fwx, wy]]) + `M${P(bar[0] - H * 0.04)} ${P(bar[1] - H * 0.01)}L${P(bar[0] + H * 0.04)} ${P(bar[1] + H * 0.01)}`, w: 0.85});
  const legC = col(m.trousers);
  for (const [k, ph] of [
    ['far', crank + Math.PI],
    ['near', crank],
  ] as [string, number][]) {
    const pedal: Pt = [bb[0] + Math.cos(ph) * H * 0.08, bb[1] + Math.sin(ph) * H * 0.08];
    const hip: Pt = [seat[0], seat[1] + H * 0.02];
    const dx = pedal[0] - hip[0];
    const dy = pedal[1] - hip[1];
    const dist = Math.hypot(dx, dy) || 1;
    const Lh = H * 0.24;
    const bend = Math.sqrt(Math.max(0, Lh * Lh - (dist / 2) * (dist / 2)));
    const knee: Pt = [hip[0] + dx / 2 + (dy / dist) * bend, hip[1] + dy / 2 - (dx / dist) * bend];
    const d1 = capsule(hip, knee, H * 0.04, H * 0.036);
    const d2 = capsule(knee, pedal, H * 0.036, H * 0.03);
    out.push({k: `th${k}`, d: d1, fill: legC, ink: inkOn ? d1 : undefined});
    out.push({k: `sh${k}`, d: d2, fill: legC, ink: inkOn ? d2 : undefined});
  }
  const shoulder: Pt = [-H * 0.06, -H * 0.86];
  const tor = curve(
    [
      [seat[0] + H * 0.06, seat[1] + H * 0.03],
      [seat[0] - H * 0.08, seat[1] + H * 0.04],
      [shoulder[0] - H * 0.06, shoulder[1] + H * 0.05],
      [shoulder[0] + H * 0.02, shoulder[1] - H * 0.035],
      [shoulder[0] + H * 0.1, shoulder[1] + H * 0.02],
    ],
    true,
    0.35,
  );
  out.push({k: 'coat', d: tor, fill: col(m.coat), ink: inkOn ? tor : undefined});
  out.push(...armParts(col, m, {from: [shoulder[0] + H * 0.01, shoulder[1] + H * 0.04], to: bar, H, lod, k: 'arm'}));
  const r = H * 0.105;
  const hd = head(m, col, {cx: shoulder[0] - H * 0.03, cy: shoulder[1] - r * 1.05, r, view: 'profile', lod, seed, shoulderY: shoulder[1], hairEnd: shoulder[1] + H * 0.1});
  out.push(...hd.behind, ...hd.front);
  return out;
}

// ---------------------------------------------------------------- seated backs

export type SeatOpts = {
  /** Visible seated height: head top to the seat line (px). */
  h: number;
  lod: Lod;
  seed: string;
  turn?: number;
  /** 0..1: a takeaway cup lifting from the lap to the mouth (it peeks beside the head). */
  cup?: number;
  /** An open newspaper held up (its spread shows past both shoulders). */
  read?: boolean;
  /** A raised phone (arm up). */
  phone?: boolean;
  /** 0 closed .. 1 open: a notebook held at the side (the reporter). */
  notebook?: number;
  /** Which side the cup / phone / notebook is on (+1 right). */
  side?: 1 | -1;
};

export function seatParts(m: Model, o: SeatOpts): Part[] {
  const col = colorer(m);
  const {h, lod} = o;
  const H = h / 0.56;
  const r = H * 0.112;
  const side = o.side ?? 1;
  const turn = o.turn ?? 0;
  const inkOn = lod <= 1;
  const out: Part[] = [];
  const headCx = turn * r * 0.12;
  const headCy = -h + r;
  const shoulderY = -h + 2 * r + H * 0.03;
  const W = H * 0.35 * m.broad;
  const flare = 0.16;
  // the open newspaper sits in front of the person: drawn first (behind)
  if (o.read) {
    const top = headCy + r * 0.3;
    const bot = shoulderY + H * 0.2;
    const xw = W * 0.78;
    const pc = col(CM.paper);
    const dl = polyline([[-xw, top + H * 0.02], [-H * 0.01, top - H * 0.015], [-H * 0.01, bot], [-xw, bot + H * 0.025]], true);
    const dr = polyline([[xw, top + H * 0.02], [H * 0.01, top - H * 0.015], [H * 0.01, bot], [xw, bot + H * 0.025]], true);
    out.push({k: 'paperL', d: dl, fill: pc, ink: inkOn ? dl : undefined, w: 0.8});
    out.push({k: 'paperR', d: dr, fill: pc, ink: inkOn ? dr : undefined, w: 0.8});
    if (lod === 0 && !m.mono) {
      let tl = '';
      for (let i = 0; i < 5; i++) {
        const y = top + H * 0.035 + (i * (bot - top - H * 0.04)) / 5;
        tl += `M${P(-xw + H * 0.02)} ${P(y + H * 0.004)}L${P(-xw + H * 0.07)} ${P(y)}M${P(xw - H * 0.02)} ${P(y + H * 0.004)}L${P(xw - H * 0.07)} ${P(y)}`;
      }
      out.push({k: 'paperText', ink: tl, w: 0.4});
    }
  }
  // neck
  if (lod <= 1 && m.hair !== 'long' && m.hair !== 'hood') {
    const nd = `M${P(headCx - r * 0.34)} ${P(headCy + r * 0.5)}L${P(headCx + r * 0.34)} ${P(headCy + r * 0.5)}L${P(r * 0.36)} ${P(shoulderY + H * 0.02)}L${P(-r * 0.36)} ${P(shoulderY + H * 0.02)}Z`;
    out.push({k: 'neck', d: nd, fill: col(m.skin, 'skin')});
  }
  const acc = backAcc(m, col, {cx: 0, W, shoulderY, H, lod, view: 'back', seated: true});
  out.push(...acc.under);
  const fillD = tomb(0, 0, W, -shoulderY, 0.45 + (m.soft ?? 0) * 0.08, flare, true);
  out.push({k: 'coat', d: fillD, fill: col(m.coat), ink: inkOn ? (m.closed ? fillD : tomb(0, 0, W, -shoulderY, 0.45, flare, false)) : undefined});
  if (inkOn && !m.closed) out.push({k: 'seat', ink: hemLine(0, 0, W, flare, `${o.seed}/seat`, 0.12), w: 0.9});
  if (lod === 0 && !m.mono && !o.read) {
    out.push({k: 'seams', ink: `M${P(-W / 2 + H * 0.06)} ${P(shoulderY + H * 0.1)}Q${P(-W / 2 + H * 0.05)} ${P(shoulderY * 0.5)} ${P(-W / 2 + H * 0.07)} ${P(-H * 0.03)}M${P(W / 2 - H * 0.06)} ${P(shoulderY + H * 0.1)}Q${P(W / 2 - H * 0.05)} ${P(shoulderY * 0.5)} ${P(W / 2 - H * 0.07)} ${P(-H * 0.03)}`, w: 0.6});
  }
  out.push(...acc.over);
  if (m.satchel) {
    const sc = col(m.satchel);
    out.push({k: 'satStrap', ink: `M${P(-W * 0.3)} ${P(shoulderY + H * 0.01)}L${P(W * 0.46)} ${P(-H * 0.09)}`, w: 1.1});
    const bw = H * 0.16;
    const sd = `M${P(W * 0.42)} ${P(-H * 0.15)}L${P(W * 0.42 + bw)} ${P(-H * 0.15)}L${P(W * 0.42 + bw)} 0L${P(W * 0.42)} 0Z`;
    out.push({k: 'satchel', d: sd, fill: sc, ink: inkOn ? sd : undefined});
    if (lod === 0) out.push({k: 'satFlap', ink: `M${P(W * 0.42)} ${P(-H * 0.15)}L${P(W * 0.42)} ${P(-H * 0.08)}Q${P(W * 0.42 + bw / 2)} ${P(-H * 0.05)} ${P(W * 0.42 + bw)} ${P(-H * 0.08)}`, w: 0.7});
  }
  if (m.scarf || m.acc === 'scarf') out.push(...scarfParts(col(m.scarf ?? m.accColor), {cx: 0, y: shoulderY, w: r * 1.95, H, view: 'back', lod, k: 'scarf'}));
  if (m.hoodDown && (m.hoodUp === undefined || m.hoodUp <= 0)) {
    const d = curve([[-r * 1.15, shoulderY + H * 0.03], ...arcPts(0, shoulderY + H * 0.02, r * 1.15, r * 0.62, 190, 350, 10), [r * 1.15, shoulderY + H * 0.03], [0, shoulderY + H * 0.08]], true, 0.4);
    out.push({k: 'hoodDown', d, fill: col(m.coat), ink: inkOn ? d : undefined});
  }
  // the lanyard cord over the collar (and over a hood that is down)
  if (m.lanyard && lod <= 1 && (m.hoodUp === undefined || m.hoodUp <= 0)) {
    const ly = m.hoodDown ? shoulderY - H * 0.012 : shoulderY + H * 0.004;
    out.push({k: 'lanyard', ink: `M${P(-r * 0.7)} ${P(ly + H * 0.02)}Q${P(-r * 0.5)} ${P(ly - H * 0.01)} 0 ${P(ly - H * 0.012)}Q${P(r * 0.5)} ${P(ly - H * 0.01)} ${P(r * 0.7)} ${P(ly + H * 0.02)}`, w: 1.5, inkColor: m.mono ?? m.lanyard});
  }
  // cup / phone / notebook arm on `side`
  const sh: Pt = [side * W * 0.36, shoulderY + H * 0.06];
  if (o.cup !== undefined) {
    const k = Math.max(0, Math.min(1, o.cup));
    const elbow: Pt = [side * (W * 0.55 + H * 0.03 * k), shoulderY + H * (0.2 - 0.09 * k)];
    const hand: Pt = [side * (W * (0.52 - 0.18 * k)), -H * 0.05 + (headCy + r * 0.55 + H * 0.05) * k];
    out.push(...armParts(col, m, {from: sh, to: hand, H, lod, k: 'cupArm', elbow}));
    const cw = H * 0.045;
    const chh = H * 0.07;
    const cx = hand[0] + side * H * 0.01;
    const cy = hand[1] - H * 0.01;
    const cd = polyline([[cx - cw / 2, cy - chh], [cx + cw / 2, cy - chh], [cx + cw * 0.38, cy], [cx - cw * 0.38, cy]], true);
    out.push({k: 'cup', d: cd, fill: col(CM.paper), ink: inkOn ? cd : undefined, w: 0.7});
    if (lod === 0) out.push({k: 'cupSleeve', d: polyline([[cx - cw * 0.47, cy - chh * 0.62], [cx + cw * 0.47, cy - chh * 0.62], [cx + cw * 0.43, cy - chh * 0.3], [cx - cw * 0.43, cy - chh * 0.3]], true), fill: col(CM.brick), exact: true});
    if (lod === 0) out.push({k: 'cupLid', d: polyline([[cx - cw * 0.58, cy - chh - H * 0.012], [cx + cw * 0.58, cy - chh - H * 0.012], [cx + cw * 0.56, cy - chh + H * 0.004], [cx - cw * 0.56, cy - chh + H * 0.004]], true), fill: col(CM.coatOat), ink: polyline([[cx - cw * 0.58, cy - chh - H * 0.012], [cx + cw * 0.58, cy - chh - H * 0.012]]), w: 0.6, exact: true});
  }
  if (o.phone) {
    const hand: Pt = [side * W * 0.5, headCy - r * 0.6];
    out.push(...armParts(col, m, {from: sh, to: hand, H, lod, k: 'phoneArm', elbow: [side * W * 0.62, shoulderY + H * 0.05]}));
    const pd = polyline([[hand[0] - H * 0.026, hand[1] - H * 0.1], [hand[0] + H * 0.026, hand[1] - H * 0.1], [hand[0] + H * 0.026, hand[1] + H * 0.005], [hand[0] - H * 0.026, hand[1] + H * 0.005]], true);
    out.push({k: 'phone', d: pd, fill: col(CM.anchor), ink: inkOn ? pd : undefined, w: 0.7, exact: true});
  }
  if (o.notebook !== undefined) {
    const k = Math.max(0, Math.min(1, o.notebook));
    const hand: Pt = [side * W * 0.56, shoulderY + H * 0.14];
    out.push(...armParts(col, m, {from: sh, to: hand, H, lod, k: 'nbArm', elbow: [side * W * 0.6, shoulderY + H * 0.2]}));
    const nh = H * 0.13;
    const nw = H * (0.035 + 0.1 * k);
    const nx = hand[0] + side * nw * 0.35;
    const ny = hand[1] - nh * 0.55;
    const nd = polyline([[nx - nw / 2, ny], [nx + nw / 2, ny], [nx + nw / 2, ny + nh], [nx - nw / 2, ny + nh]], true);
    out.push({k: 'notebook', d: nd, fill: col(CM.paper), ink: inkOn ? nd : undefined, w: 0.75});
    if (k > 0.4 && lod === 0) {
      let tl = `M${P(nx)} ${P(ny)}L${P(nx)} ${P(ny + nh)}`;
      for (let i = 1; i < 5; i++) tl += `M${P(nx + H * 0.008)} ${P(ny + (nh * i) / 5)}L${P(nx + nw / 2 - H * 0.008)} ${P(ny + (nh * i) / 5)}`;
      out.push({k: 'nbLines', ink: tl, w: 0.45});
    }
  }
  const hd = head(m, col, {cx: headCx, cy: headCy, r, view: 'back', lod, seed: o.seed, shoulderY, hairEnd: shoulderY + H * 0.15, turn});
  out.push(...hd.behind, ...hd.front);
  // the reading arms reach out to the paper's edges
  if (o.read && lod <= 1) {
    for (const s of [-1, 1]) out.push({k: `readArm${s}`, ink: `M${P(s * W * 0.45)} ${P(shoulderY + H * 0.06)}Q${P(s * W * 0.62)} ${P(shoulderY + H * 0.06)} ${P(s * W * 0.72)} ${P(shoulderY + H * 0.02)}`, w: 0.7});
  }
  return out;
}

// ---------------------------------------------------------------- the near row: head-and-shoulder backs cut by the frame bottom

export type NearOpts = {
  /** Visible height: head top to the frame bottom (px). The torso runs `bleed` px past it. */
  hv: number;
  seed: string;
  turn?: number;
  bleed?: number;
};

export function nearParts(m: Model, o: NearOpts): Part[] {
  const col = colorer(m);
  const {hv, seed} = o;
  const bleed = o.bleed ?? 40;
  const r = hv * 0.205;
  const H = r / 0.112; // the standing height this head belongs to (accessory sizes)
  const headCx = (o.turn ?? 0) * r * 0.1;
  const headCy = -hv + r;
  const shoulderY = -hv + 2 * r + hv * 0.06;
  const W = hv * 0.84 * m.broad;
  const out: Part[] = [];
  if (m.hair !== 'long' && m.hair !== 'hood') {
    const nd = `M${P(headCx - r * 0.36)} ${P(headCy + r * 0.45)}L${P(headCx + r * 0.36)} ${P(headCy + r * 0.45)}L${P(r * 0.4)} ${P(shoulderY + hv * 0.03)}L${P(-r * 0.4)} ${P(shoulderY + hv * 0.03)}Z`;
    out.push({k: 'neck', d: nd, fill: col(m.skin, 'skin'), ink: `M${P(headCx - r * 0.36)} ${P(headCy + r * 0.62)}L${P(-r * 0.4)} ${P(shoulderY + hv * 0.015)}M${P(headCx + r * 0.36)} ${P(headCy + r * 0.62)}L${P(r * 0.4)} ${P(shoulderY + hv * 0.015)}`, w: 0.7});
  }
  const fillD = tomb(0, bleed, W, bleed - shoulderY, 0.36, 0.02, true);
  out.push({k: 'coat', d: fillD, fill: col(m.coat), ink: tomb(0, bleed, W, bleed - shoulderY, 0.36, 0.02, false)});
  if (m.hair !== 'hood') out.push({k: 'collar', ink: `M${P(-r * 0.62)} ${P(shoulderY + hv * 0.005)}Q0 ${P(shoulderY + hv * 0.07)} ${P(r * 0.62)} ${P(shoulderY + hv * 0.005)}`, w: 0.7});
  const accC = col(m.accColor);
  if (m.acc === 'backpack') {
    const pw = W * 0.5;
    const top = shoulderY + hv * 0.16;
    const d = `M${P(-pw / 2)} ${P(bleed)}L${P(-pw / 2)} ${P(top + pw * 0.2)}Q${P(-pw / 2)} ${P(top)} 0 ${P(top - hv * 0.01)}Q${P(pw / 2)} ${P(top)} ${P(pw / 2)} ${P(top + pw * 0.2)}L${P(pw / 2)} ${P(bleed)}Z`;
    out.push({k: 'pack', d, fill: accC, ink: d});
    out.push({k: 'packFlap', ink: `M${P(-pw * 0.42)} ${P(top + hv * 0.08)}Q0 ${P(top + hv * 0.13)} ${P(pw * 0.42)} ${P(top + hv * 0.08)}`, w: 0.7});
    for (const s of [-1, 1]) out.push({k: `strap${s}`, ink: `M${P(s * W * 0.3)} ${P(shoulderY + hv * 0.004)}Q${P(s * W * 0.32)} ${P(top - hv * 0.02)} ${P(s * pw * 0.4)} ${P(top + hv * 0.04)}`, w: 0.9});
  } else if (m.acc === 'tote' || m.acc === 'strap') {
    out.push({k: 'bagStrap', ink: m.acc === 'tote' ? `M${P(W * 0.24)} ${P(shoulderY + hv * 0.004)}Q${P(W * 0.3)} ${P(shoulderY + hv * 0.2)} ${P(W * 0.28)} ${P(bleed)}` : `M${P(-W * 0.3)} ${P(shoulderY + hv * 0.01)}L${P(W * 0.42)} ${P(bleed)}`, w: 1.2});
  }
  if (m.scarf || m.acc === 'scarf') out.push(...scarfParts(col(m.scarf ?? m.accColor), {cx: 0, y: shoulderY + hv * 0.01, w: r * 2.05, H, view: 'back', lod: 0, k: 'scarf'}));
  if (m.hoodDown) {
    const d = curve([[-r * 1.2, shoulderY + hv * 0.03], ...arcPts(0, shoulderY + hv * 0.02, r * 1.2, r * 0.6, 190, 350, 10), [r * 1.2, shoulderY + hv * 0.03], [0, shoulderY + hv * 0.09]], true, 0.4);
    out.push({k: 'hoodDown', d, fill: col(m.coat), ink: d});
  }
  const hd = head(m, col, {cx: headCx, cy: headCy, r, view: 'back', lod: 0, seed, shoulderY, hairEnd: shoulderY + hv * 0.2, turn: o.turn});
  out.push(...hd.behind, ...hd.front);
  return out;
}

// ---------------------------------------------------------------- window figures (busts behind a sill)

export type BustOpts = {
  /** Visible height: head top to the sill (px). */
  hb: number;
  lod: Lod;
  seed: string;
  /** 'idle' | 'water' (an arm out with a can, tilting `tip` 0..1) | 'read' (a book up) | 'phone'. */
  act?: 'idle' | 'water' | 'read' | 'phone';
  tip?: number;
  turn?: number;
  /** Busts across the water read as backs or profiles (never a face). */
  view?: 'back' | 'profile';
};

export function bustParts(m: Model, o: BustOpts): Part[] {
  const col = colorer(m);
  const {hb, lod, seed} = o;
  const r = hb * 0.27;
  const H = r / 0.112;
  const view = o.view ?? 'back';
  const headCy = -hb + r;
  const shoulderY = -hb + 2 * r + hb * 0.05;
  const W = hb * 0.92 * m.broad;
  const inkOn = lod <= 1;
  const out: Part[] = [];
  const act = o.act ?? 'idle';
  if (act === 'water') {
    const tip = o.tip ?? 0;
    const sh: Pt = [-W * 0.3, shoulderY + hb * 0.08];
    const hand: Pt = [-W * 0.95, shoulderY + hb * 0.05];
    const d = capsule(sh, hand, H * 0.034, H * 0.03);
    out.push({k: 'arm', d, fill: col(m.coat), ink: inkOn ? d : undefined});
    const a = (-10 - 35 * tip) * (Math.PI / 180);
    const cw = H * 0.09;
    const chh = H * 0.07;
    const base: Pt[] = [
      [0, 0],
      [-cw, 0],
      [-cw, chh],
      [0, chh],
      [-cw * 1.7, -chh * 0.35],
    ];
    const pts: Pt[] = base.map(([x, y]) => [hand[0] + x * Math.cos(a) - y * Math.sin(a), hand[1] - chh * 0.5 + x * Math.sin(a) + y * Math.cos(a)] as Pt);
    const can = polyline([pts[0], pts[1], pts[2], pts[3]], true);
    out.push({k: 'can', d: can, fill: col(CM.coatSlate), ink: inkOn ? can : undefined, w: 0.8});
    if (inkOn) out.push({k: 'spout', ink: polyline([[(pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2], pts[4]]), w: 0.8});
  }
  const fillD = tomb(0, 0, W, -shoulderY, 0.44, 0.04, true);
  out.push({k: 'coat', d: fillD, fill: col(m.coat), ink: inkOn ? tomb(0, 0, W, -shoulderY, 0.44, 0.04, false) : undefined});
  if (act === 'read' || act === 'phone') {
    const bw = act === 'read' ? hb * 0.42 : hb * 0.14;
    const bh = act === 'read' ? hb * 0.3 : hb * 0.24;
    const bx = act === 'read' ? 0 : W * 0.34;
    const by = act === 'read' ? shoulderY + hb * 0.04 : headCy - r * 0.2;
    const d = polyline([[bx - bw / 2, by], [bx + bw / 2, by], [bx + bw / 2, by + bh], [bx - bw / 2, by + bh]], true);
    out.push({k: 'held', d, fill: col(act === 'read' ? CM.brick : CM.anchor), ink: inkOn ? d : undefined, w: 0.8});
  }
  const hd = head(m, col, {cx: (o.turn ?? 0) * r * 0.1, cy: headCy, r, view, lod, seed, shoulderY, hairEnd: shoulderY + hb * 0.25, turn: o.turn});
  out.push(...hd.behind, ...hd.front);
  return out;
}

export {STILL};
