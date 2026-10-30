// HAIR v2 iteration: the new figures. HER (the film's lead) in her autumn city evening look (the long open coat, the
// cream knit and wide trousers, pointed flats, the teal bag), built on the new stance (stance.ts) and the new hair
// (hair.ts, her cut W3 in copper with a 2B wave), with the LASH face (graphic_faces). The "before" is the current code
// (graphic_faces/cast.ts build(..., 'lash')), untouched.
// Part names: anything starting 'coat|sleeve|hair|bag|leg-' takes her rim (the subject only, the key-side edge); the
// hair builder names interior locks 'hl-...' so only the silhouette's locks catch it (never a line inside the hair).
import {V2, V3, RV, add, mul, rpath} from '../graphic/geo';
import {Cam, cam, toCam, loft, type Ring} from '../graphic/rig';
import {framePt, type Build, type Frame, type Skel} from '../graphic/body';
import {headParts, type FaceOpt, type HeadOut} from '../graphic_faces/head';
import {ear} from '../graphic_faces/headwear';
import {coat, top, trousers, sleeve, cuffOf, bareArm, shortSleeve, bareLegs, bomber, ribSleeve, leatherJacket, leatherSleeve, slipSkirt, fr, loftPart, type TopSpec} from '../graphic/wear';
import {shoe, contact} from '../graphic/feet';
import {hand, bag} from '../graphic/props';
import {SKIN, HAIR, T, BG} from '../graphic/palette';
import {rimOf, tone, skinTone, hairTone, lch, fromLch, type Tone} from '../graphic/color';
import type {Built, Part} from '../graphic/part';
import {hairV2, type HairView} from './hair';
import {CUTS, type Cut} from './cuts';
import {CUTS3} from './cuts3';
import {CALM, type HairState} from './states';
import {WOMAN_V2, MAN_V2, build as buildOf, skelV2, standV2, walkV2, backV2, armAt, shoulderOf, heightNumbers, yMap, type PoseV2, type SkelV2, type BuildName} from './stance';

export type View = 'q' | 'p' | 'b';
export const YAW_V2: Record<View, number> = {q: -58, p: -90, b: 196};

// ---------------------------------------------------------------- helpers
export const armNear = (sk: Skel, side: 'l' | 'r', c: Cam) => toCam(sk.arm[side].sh, c)[2] > -20;
const thumbSide = (c: Cam): -1 | 0 | 1 => {
  const fx = Math.sin((c.yaw * Math.PI) / 180);
  if (Math.abs(fx) < 0.35) return 0;
  return fx < 0 ? -1 : 1;
};
export const handAt = (sk: Skel, side: 'l' | 'r', c: Cam, skin: Tone, z: number, len = 1): Part => {
  const cf = cuffOf(sk, side, c, len);
  const th = thumbSide(c);
  return hand(`hand-${side}`, add(cf.p, mul(cf.dir, -4)) as V2, cf.dir, sk.b.hand, th, skin, z, th === 0 ? 'edge' : 'relaxed');
};
const RIMMED = /^(coat|sleeve|hair|bag|leg-|top)/;
export const withRim = (parts: Part[]): Part[] => parts.map((p) => (RIMMED.test(p.name) && !p.line && !p.rim ? {...p, rim: rimOf(p.fill)} : p));
export const turnOf = (H: HeadOut) => (H.lm.view === 'b' ? Math.min(1, Math.max(0, (180 - Math.abs(H.hf.yaw)) / 50)) : 0);
export function finish(parts: Part[], head: V2): Built {
  return {parts, box: {x0: -400, x1: 400, y0: -20, y1: 1010}, head: [head[0], head[1]]};
}

/** A knit or a tee that follows the new skeleton's waist frame (graphic/wear.ts top() blends the chest and the pelvis,
 *  so the back stays a straight slab): the lumbar S standing, the soft C seated. */
export function topV2(sk: SkelV2, c: Cam, s: TopSpec): Part {
  const ch = sk.chest;
  const pv = sk.pelvis;
  const b = sk.b;
  const fit = s.fit ?? 4;
  const rings = [
    fr(ch, 842, s.neckA ?? 30, 32, -10),
    fr(ch, 812, b.shoulderW / 2 - 14 + fit, 50, -10),
    fr(ch, b.chestY + 30, b.chestW / 2 + fit + 6, b.chestD + fit, -2),
    fr(ch, b.chestY - 15, b.chestW / 2 + fit, b.chestD + fit + 2, 2),
    fr(sk.waist, b.waistY, b.waistW / 2 + fit, b.waistD + fit, 0),
    fr(pv, s.hemY, s.hemA ?? b.hipW / 2 - 8 + fit, b.hipD - 4 + fit, 0),
  ];
  return loftPart('top', rings, c, s.tone, s.z, {r: [4, 26, 20, 16, 14, 2], hemR: 3});
}

/** The neck for the new stance (d.1): an elliptical column, deeper front to back than wide (a real neck is ~1.4x
 *  deeper than wide; the old round tube was too thin to fill the throat once the head sits forward), from its base up
 *  under the skull along the lean. One flat shade plane, as before (the lit face against the shaded neck is the jaw's
 *  line). It replaces the head's own round neck. */
export function neckV2(sk: Skel, c: Cam, skin: Tone): Part {
  const nb = sk.neckBase;
  const hc = sk.head.c;
  const r = sk.b.neckW / 2;
  const s = sk.b.skull;
  const zb = nb[2] + 4;
  const yt = hc[1] - 0.2 * s;
  const zt = hc[2] - 0.14 * s;
  const yb = nb[1] - 6;
  const at = (y: number) => zb + ((zt - zb) * (y - yb)) / (yt - yb);
  const xt = hc[0];
  const xb = nb[0];
  const ax = (y: number) => xb + ((xt - xb) * (y - yb)) / (yt - yb);
  const yj = hc[1] - 0.45 * s;
  const rings: Ring[] = [
    {y: yt, a: r * 0.95, b: 0.24 * s, x: xt, z: zt},
    {y: yj, a: r, b: r * 1.42, x: ax(yj), z: at(yj)},
    {y: (yj + yb) / 2, a: r * 0.98, b: r * 1.38, x: ax((yj + yb) / 2), z: at((yj + yb) / 2)},
    {y: yb, a: r * 1.1, b: r * 1.5, x: xb, z: zb},
  ];
  const L = loft(rings, c);
  const pts: RV[] = [];
  L.top.forEach((p) => pts.push([p[0], p[1], 2]));
  for (let i = 1; i < rings.length - 1; i++) pts.push([L.left[i][0], L.left[i][1], 8]);
  L.bottom.forEach((p) => pts.push([p[0], p[1], 2]));
  for (let i = rings.length - 2; i >= 1; i--) pts.push([L.right[i][0], L.right[i][1], 8]);
  return {name: 'neck', d: rpath(pts), fill: skin.shade, z: 50};
}

/** The head with the new neck in place of the round one. */
export function headV2(sk: Skel, c: Cam, skin: Tone, o: {face?: FaceOpt; hair?: Tone}): HeadOut {
  const H = headParts(sk, c, skin, o);
  return {...H, parts: [neckV2(sk, c, skin), ...H.parts.filter((p) => p.name !== 'neck')]};
}

/** The hair on a built head: the cut's view for the head's view, the state, the level of detail by drawn height. */
export function hairOn(H: HeadOut, cut: Cut, t: Tone, o: {state?: HairState; px?: number; rim?: boolean; sheen2?: string; dz?: number} = {}): Part[] {
  return hairV2({
    hf: H.hf,
    view: H.lm.view as HairView,
    faceX: H.lm.faceX,
    tone: t,
    cut,
    state: o.state ?? CALM,
    px: o.px ?? 640,
    turn: turnOf(H),
    rim: o.rim ? rimOf(t.lit) : undefined,
    sheen2: o.sheen2,
    dz: o.dz,
  });
}

// ---------------------------------------------------------------- her, the evening look, new stance and hair
/** Her arms per view: the near (left) hand carries the teal bag low, the arm hanging off the body (a gap at the
 *  waist, the elbow eased); the right hand in the coat's pocket with the elbow out. */
function herArms(view: View, b: Build): (chest: Frame) => PoseV2['arms'] {
  return (chest: Frame) => {
    const shL = shoulderOf(b, chest, 'l');
    const shR = shoulderOf(b, chest, 'r');
    if (view === 'p') {
      return {
        l: armAt(b, shL, 'l', -9, 7, 14, 4),
        r: armAt(b, shR, 'r', 12, 6, 20, 6),
      };
    }
    return {
      l: armAt(b, shL, 'l', -3, 10, 16, 4),
      r: {el: [-152, 630, -18], wr: [-112, 522, 44]},
    };
  };
}

/** ver: 2 = the v2 stills as rendered (the cut library cuts.ts, the head forward); 3 = after the owner's note (the
 *  clean cuts of cuts3.ts, the head stacked on an upright neck). The default stays 2 so HvS1-HvS7 reproduce. */
export type Ver = 2 | 3;
export type HerOpts = {view: View; state?: HairState; px?: number; cut?: Cut; face?: FaceOpt; tone?: Tone; headYaw?: number; ver?: Ver};

export function herV2(o: HerOpts): Built {
  const view = o.view;
  const b = WOMAN_V2;
  const arms = herArms(view, b);
  const up = o.ver === 3;
  const pose = view === 'q' ? standV2(b, arms, {headYaw: o.headYaw ?? 20, upright: up}) : view === 'p' ? walkV2(b, arms, {upright: up}) : backV2(b, arms, o.headYaw ?? 30, up);
  const sk = skelV2(pose);
  const c = cam(YAW_V2[view]);
  const parts: Part[] = [];
  const walking = view === 'p';
  parts.push(contact(sk, c, BG.ground));
  parts.push(...trousers(sk, c, {tone: T.trouserCream, thigh: 64, knee: 60, hem: walking ? 60 : 66, hemY: 10, riseY: 615, z: 32}));
  for (const s of ['l', 'r'] as const) parts.push(...shoe(sk, s, c, {kind: 'pointedFlat', tone: T.shoeBlack, sole: '#1D1517'}));
  parts.push(topV2(sk, c, {tone: T.knit, hemY: 520, neckA: 30, z: 40}));
  parts.push(
    ...coat(sk, c, {
      tone: T.coat,
      facing: T.coatFacing,
      hemY: 182,
      hemA: walking ? 148 : 150,
      shA: 136,
      open: 22,
      hemB: walking ? 114 : 100,
      hemZ: walking ? 26 : 20,
      z: 44,
    }),
  );
  for (const s of ['l', 'r'] as const) {
    const near = armNear(sk, s, c);
    const z = near ? 60 : 22;
    parts.push(sleeve(sk, s, c, {tone: T.coat, r: [42, 38, 36], len: 0.97, z}));
    if (s === 'r') continue; // the right hand in the coat's pocket
    parts.push(handAt(sk, s, c, SKIN.s2, z + 0.6, 0.97));
    // the teal bag hangs from the near hand (its top under the fingers)
    const A = sk.arm.l;
    const at: V3 = [A.wr[0] + 4, A.wr[1] - sk.b.hand * 0.7, A.wr[2] + 2];
    parts.push(...bag(sk, 'l', at, c, T.teal, z + 0.3, {yaw: view === 'p' ? 70 : -10, len: 118, h: 80, th: 32}));
  }
  const H = headV2(sk, c, SKIN.s2, {face: o.face ?? 'lash', hair: HAIR.copper});
  parts.push(...H.parts);
  parts.push(...hairOn(H, o.cut ?? (up ? CUTS3.W3 : CUTS.W3), o.tone ?? HAIR.copper, {state: o.state, px: o.px, rim: true}));
  return finish(withRim(parts), H.hf.c);
}

export {skelV2, type SkelV2, YAW_V2 as YAW};
export const herSkel = (view: View, ver: Ver = 2): SkelV2 => {
  const b = WOMAN_V2;
  const arms = herArms(view, b);
  const up = ver === 3;
  return skelV2(view === 'q' ? standV2(b, arms, {upright: up}) : view === 'p' ? walkV2(b, arms, {upright: up}) : backV2(b, arms, 34, up));
};
export {ear, framePt};


// ---------------------------------------------------------------- the cast: anyone, any cut, on the new stance
/** A second, warmer and more saturated sheen band for light hair (copper, honey, chestnut: a.5). */
export function sheen2Of(t: Tone): string {
  const q = lch(t.sheen);
  return fromLch(q.L - 5, q.C * 1.3 + 4, q.h - 6);
}
export type Outfit = 'coat' | 'tee' | 'knit' | 'bomber' | 'leather' | 'sweater' | 'shirt';
export type Look = {
  id: string;
  sex: 'f' | 'm';
  build?: BuildName;
  skin: Tone;
  hair: Tone;
  cut: Cut;
  light?: boolean;
  outfit: Outfit;
  /** the outfit's tones: top, outer layer, bottom, shoes */
  c: {top: Tone; outer?: Tone; bottom: Tone; shoe?: Tone; facing?: Tone};
  face?: FaceOpt;
};
export type PersonOpts = {view: View; state?: HairState; px?: number; headYaw?: number; walk?: boolean; face?: FaceOpt; cm?: number; build?: BuildName; bodyYaw?: number; ver?: Ver};
/** A look's cut in a version (v3: the same id in cuts3.ts, the clean cut). */
export const cutOf = (lk: Look, ver: Ver = 2): Cut => (ver === 3 ? CUTS3[lk.cut.id] ?? lk.cut : lk.cut);

// ---------------------------------------------------------------- heights: the body warped, the head drawn at its size
/** Map every y of a path (figure-local, y down from the crown) through a body-height map (y up from the sole). Our
 *  paths are absolute M/L/C/Z pairs, so the numbers alternate x, y. */
export function warpPath(d: string, f: (y: number) => number): string {
  let i = 0;
  return d.replace(/-?\d*\.?\d+/g, (m) => {
    const v = parseFloat(m);
    const out = i % 2 === 1 ? 1000 - f(1000 - v) : v;
    i++;
    return (Math.round(out * 10) / 10).toString();
  });
}
export const warpPart = (p: Part, f: (y: number) => number): Part => ({
  ...p,
  d: warpPath(p.d, f),
  regions: p.regions?.map((r) => ({...r, d: warpPath(r.d, f)})),
  cut: p.cut ? warpPath(p.cut, f) : undefined,
});
/** The skeleton's head and neck at another skull size (the head and its hair drawn at the figure's own scale; the neck
 *  meets the warped body). */
export function headSkel(sk: SkelV2, skull: number, f: (y: number) => number): SkelV2 {
  const hc = sk.head.c;
  return {
    ...sk,
    b: {...sk.b, skull},
    head: {...sk.head, c: [hc[0], 1000 - skull / 2, hc[2]]},
    neckTop: [sk.neckTop[0], 1000 - skull - 4, sk.neckTop[2]],
    neckBase: [sk.neckBase[0], f(sk.neckBase[1]), sk.neckBase[2]],
  };
}

/** Arms for the cast: the near arm loose and off the body (a gap at the waist, the elbow eased), the far hand in a
 *  pocket (the elbow out); from behind the same, so both show. */
function castArms(b: Build, view: View, o: Outfit): (chest: Frame) => PoseV2['arms'] {
  return (chest: Frame) => {
    const shL = shoulderOf(b, chest, 'l');
    const shR = shoulderOf(b, chest, 'r');
    const m = b.sex === 'm';
    if (view === 'p') return {l: armAt(b, shL, 'l', -10, 7, 16, 4), r: armAt(b, shR, 'r', 12, 6, 20, 6)};
    const pocket = o === 'coat' ? {el: [-152, 630, -18] as V3, wr: [-112, 522, 44] as V3} : {el: [m ? -168 : -150, 612, -18] as V3, wr: [m ? -118 : -108, 506, 46] as V3};
    return {l: armAt(b, shL, 'l', -3, 10, 15, 4), r: pocket};
  };
}

export function personV2(lk: Look, o: PersonOpts): Built {
  const view = o.view;
  const base = lk.sex === 'f' ? WOMAN_V2 : MAN_V2;
  const bn = o.build ?? lk.build;
  const b = bn ? buildOf(lk.sex, bn) : base;
  const arms = castArms(b, view, lk.outfit);
  const up = o.ver === 3;
  const cut = cutOf(lk, o.ver);
  const pose = view === 'q' ? standV2(b, arms, {headYaw: o.headYaw ?? 20, roll: lk.sex === 'm' ? 5 : 7, upright: up}) : view === 'p' ? walkV2(b, arms, {upright: up}) : backV2(b, arms, o.headYaw ?? 30, up);
  const sk = skelV2(pose);
  const c = cam(o.bodyYaw ?? YAW_V2[view]);
  const parts: Part[] = [];
  const walking = view === 'p';
  const m = lk.sex === 'm';
  const C = lk.c;
  parts.push(contact(sk, c, BG.ground));
  const shoeTone = C.shoe ?? T.shoeBlack;
  const pocketR = true; // the far (right) hand is in a pocket
  const drawHand = (s: 'l' | 'r', z: number, len = 1) => {
    if (s === 'r' && pocketR) return;
    parts.push(handAt(sk, s, c, lk.skin, z + 0.6, len));
  };
  const nearZ = (s: 'l' | 'r') => (armNear(sk, s, c) ? 60 : 22);
  switch (lk.outfit) {
    case 'coat': {
      parts.push(...trousers(sk, c, {tone: C.bottom, thigh: m ? 58 : 62, knee: m ? 54 : 58, hem: walking ? 56 : 60, hemY: 12, riseY: m ? 600 : 615, z: 32}));
      for (const s of ['l', 'r'] as const) parts.push(...shoe(sk, s, c, {kind: m ? 'loafer' : 'pointedFlat', tone: shoeTone, sole: '#1D1517'}));
      parts.push(top(sk, c, {tone: C.top, hemY: 520, neckA: m ? 36 : 30, z: 40}));
      const outer = C.outer ?? T.coat;
      parts.push(...coat(sk, c, {tone: outer, facing: C.facing ?? outer, hemY: m ? 250 : 182, hemA: walking ? 148 : m ? 160 : 150, shA: m ? 152 : 136, open: 22, hemB: walking ? 114 : 100, hemZ: walking ? 26 : 20, z: 44}));
      for (const s of ['l', 'r'] as const) {
        parts.push(sleeve(sk, s, c, {tone: outer, r: m ? [46, 42, 40] : [42, 38, 36], len: 0.97, z: nearZ(s)}));
        drawHand(s, nearZ(s), 0.97);
      }
      break;
    }
    case 'tee': {
      parts.push(...trousers(sk, c, {tone: C.bottom, thigh: m ? 54 : 50, knee: m ? 47 : 44, hem: m ? 46 : 45, hemY: 16, riseY: m ? 600 : 616, z: 32}));
      for (const s of ['l', 'r'] as const) parts.push(...shoe(sk, s, c, {kind: 'sneaker', tone: T.sneaker, sole: '#F7F2EA', stripe: '#664334'}));
      parts.push(top(sk, c, {tone: C.top, hemY: m ? 560 : 600, neckA: m ? 36 : 34, fit: m ? 8 : 3, z: 40, hemA: m ? undefined : b.waistW / 2 + 10}));
      for (const s of ['l', 'r'] as const) {
        parts.push(bareArm(sk, s, c, lk.skin, nearZ(s), 0.25));
        parts.push(shortSleeve(sk, s, c, C.top, m ? 36 : 32, m ? 33 : 29, 0.44, nearZ(s) + 0.2));
        drawHand(s, nearZ(s));
      }
      break;
    }
    case 'knit':
    case 'sweater':
    case 'shirt': {
      const roomy = lk.outfit === 'sweater' ? 12 : lk.outfit === 'shirt' ? 9 : 5;
      parts.push(...trousers(sk, c, {tone: C.bottom, thigh: lk.outfit === 'knit' ? 62 : m ? 54 : 52, knee: lk.outfit === 'knit' ? 58 : m ? 48 : 46, hem: lk.outfit === 'knit' ? 62 : 47, hemY: 14, riseY: m ? 600 : 615, z: 32}));
      for (const s of ['l', 'r'] as const) parts.push(...shoe(sk, s, c, lk.outfit === 'knit' ? {kind: 'loafer', tone: shoeTone, sole: '#1D1517'} : {kind: 'sneaker', tone: T.sneaker, sole: '#F7F2EA', stripe: '#3A2E33'}));
      parts.push(top(sk, c, {tone: C.top, hemY: lk.outfit === 'knit' ? 560 : 520, neckA: m ? 36 : 32, fit: roomy, z: 40}));
      for (const s of ['l', 'r'] as const) {
        const len = lk.outfit === 'shirt' ? 0.72 : 0.96;
        if (lk.outfit === 'shirt') parts.push(bareArm(sk, s, c, lk.skin, nearZ(s) - 0.1, 0.5));
        parts.push(sleeve(sk, s, c, {tone: C.top, r: m ? [38 + roomy * 0.4, 33, 30] : [33 + roomy * 0.4, 29, 26], len, z: nearZ(s)}));
        drawHand(s, nearZ(s), lk.outfit === 'shirt' ? 1 : 0.96);
      }
      break;
    }
    case 'bomber': {
      parts.push(...trousers(sk, c, {tone: C.bottom, thigh: 54, knee: 47, hem: 46, hemY: 20, riseY: 600, z: 32}));
      for (const s of ['l', 'r'] as const) parts.push(...shoe(sk, s, c, {kind: 'sneaker', tone: T.sneaker, sole: '#F7F2EA', stripe: '#2F4566'}));
      parts.push(top(sk, c, {tone: C.top, hemY: 560, neckA: 36, fit: 6, z: 40}));
      const outer = C.outer ?? T.cognac;
      const rib: Tone = {...outer, lit: outer.shade, shade: outer.deep};
      parts.push(...bomber(sk, c, {tone: outer, rib, z: 44, vY: 742}));
      for (const s of ['l', 'r'] as const) {
        parts.push(...ribSleeve(sk, s, c, outer, rib, [42, 37, 34], nearZ(s)));
        drawHand(s, nearZ(s), 0.98);
      }
      break;
    }
    case 'leather': {
      parts.push(...bareLegs(sk, c, lk.skin, 30));
      for (const s of ['l', 'r'] as const) parts.push(...shoe(sk, s, c, {kind: 'kitten', tone: shoeTone, sole: '#1D1517', above: lk.skin}));
      parts.push(slipSkirt(sk, c, {tone: C.bottom, z: 38, hemY: 205, hemA: 140, swing: 6}));
      const outer = C.outer ?? T.burgundy;
      parts.push(...leatherJacket(sk, c, {tone: outer, z: 44, zip: '#B98A86'}));
      for (const s of ['l', 'r'] as const) {
        parts.push(leatherSleeve(sk, s, c, outer, [36, 32, 30], nearZ(s)));
        drawHand(s, nearZ(s), 0.97);
      }
      break;
    }
  }
  // a height other than the build's own: the body warped (the legs carry the height), the head at its own size
  let skH: SkelV2 = sk;
  if (o.cm) {
    const hn = heightNumbers({who: lk.id, sex: lk.sex, cm: o.cm, build: bn ?? 'average'});
    const f = yMap(b, hn.skull, hn.crotch);
    const warped = parts.map((p) => warpPart(p, f));
    parts.length = 0;
    parts.push(...warped);
    skH = headSkel(sk, hn.skull, f);
  }
  const H = headV2(skH, c, lk.skin, {face: o.face ?? lk.face ?? ((o.px ?? 640) < 200 ? 'edge' : 'lash'), hair: lk.hair});
  parts.push(...H.parts);
  // short cuts show the ears (the cut's data leaves them clear)
  if (['W7', 'M1', 'M3', 'M4', 'M5'].includes(cut.id) || (cut.id === 'W1' && H.lm.view === 'q') || (cut.ears && cut.ears.includes(H.lm.view as View))) {
    if (H.lm.view === 'b') parts.push(...ear(H.hf, 'b', lk.skin, -1), ...ear(H.hf, 'b', lk.skin, 1));
    else parts.push(...ear(H.hf, H.lm.view, lk.skin));
  }
  parts.push(...hairOn(H, cut, lk.hair, {state: o.state, px: o.px, sheen2: lk.light ? sheen2Of(lk.hair) : undefined}));
  return finish(parts, H.hf.c);
}

// ---------------------------------------------------------------- the library's twelve people (RECIPE (b), S2)
const SK = {
  s1: skinTone('#EBC8B0'),
  s2: SKIN.s2,
  s3: skinTone('#C79671'),
  s4: skinTone('#B17A59'),
  s5: skinTone('#8B5A42'),
  s6: skinTone('#644132'),
};
export const HC = {
  black: hairTone('#2B2324'),
  espresso: hairTone('#3A2B27'),
  blackBrown: hairTone('#2F2627'),
  darkBrown: hairTone('#533A30'),
  chestnut: hairTone('#774D3A'),
  mutedCopper: hairTone('#A25E3B'),
  honey: hairTone('#CBA577'),
  copper: HAIR.copper,
};
const W = {
  cloud: tone('#F0EAE1', {k: 0.84}),
  cream: tone('#E9DBCA', {k: 0.82}),
  butter: tone('#F4E2A5', {k: 0.86, sheen: 6}),
  sage: tone('#94A68C', {k: 0.8, toward: 120, maxTurn: 6}),
  caramel: tone('#B58058', {k: 0.78}),
  rust: tone('#AF5A3E', {k: 0.78}),
  denim: tone('#5781A0', {k: 0.8, toward: 280, maxTurn: 6}),
  cocoa: tone('#8B6B5A', {k: 0.78}),
  chocolate: tone('#664334', {k: 0.76}),
  burgundy: tone('#743137', {k: 0.74, sheen: 22}),
  indigo: tone('#2F4566', {k: 0.76, toward: 290, maxTurn: 6}),
  navy: tone('#254161', {k: 0.76, toward: 290, maxTurn: 6}),
  nearBlack: tone('#3D2C2D', {k: 0.66}),
  pink: tone('#E9B9B3', {k: 0.84}),
};
export const LOOKS: Look[] = [
  {id: 'W1', sex: 'f', skin: SK.s1, hair: HC.espresso, cut: CUTS.W1, outfit: 'knit', c: {top: W.cloud, bottom: W.chocolate, shoe: T.shoeBlack}},
  {id: 'W2', sex: 'f', skin: SK.s4, hair: HC.darkBrown, cut: CUTS.W2, outfit: 'tee', c: {top: W.cloud, bottom: W.denim}},
  {id: 'W3', sex: 'f', skin: SK.s2, hair: HC.copper, cut: CUTS.W3, light: true, outfit: 'coat', c: {top: T.knit, outer: T.coat, facing: T.coatFacing, bottom: T.trouserCream}},
  {id: 'W4', sex: 'f', skin: SK.s3, hair: HC.honey, cut: CUTS.W4, light: true, outfit: 'leather', c: {top: W.cloud, outer: W.burgundy, bottom: W.butter}},
  {id: 'W5', sex: 'f', build: 'slim', skin: SK.s1, hair: HC.chestnut, cut: CUTS.W5, light: true, outfit: 'sweater', c: {top: W.sage, bottom: W.denim}},
  {id: 'W6', sex: 'f', skin: SK.s6, hair: HC.black, cut: CUTS.W6, outfit: 'shirt', c: {top: W.rust, bottom: W.cream}},
  {id: 'W7', sex: 'f', build: 'athletic', skin: SK.s5, hair: HC.mutedCopper, cut: CUTS.W7, light: true, outfit: 'tee', c: {top: W.nearBlack, bottom: W.cream}},
  {id: 'M1', sex: 'm', skin: SK.s3, hair: HC.blackBrown, cut: CUTS.M1, outfit: 'bomber', c: {top: W.cloud, outer: T.cognac, bottom: W.indigo}},
  {id: 'M2', sex: 'm', skin: SK.s2, hair: HC.darkBrown, cut: CUTS.M2, outfit: 'coat', c: {top: W.cocoa, outer: W.caramel, bottom: W.nearBlack, shoe: T.shoeBlack}},
  {id: 'M3', sex: 'm', build: 'slim', skin: SK.s4, hair: HC.chestnut, cut: CUTS.M3, light: true, outfit: 'tee', c: {top: W.nearBlack, bottom: W.indigo}},
  {id: 'M4', sex: 'm', build: 'slim', skin: SK.s1, hair: HC.mutedCopper, cut: CUTS.M4, light: true, outfit: 'sweater', c: {top: W.navy, bottom: W.cream}},
  {id: 'M5', sex: 'm', build: 'athletic', skin: SK.s6, hair: HC.black, cut: CUTS.M5, outfit: 'knit', c: {top: W.cloud, bottom: W.indigo, shoe: T.shoeBlack}},
];
export const lookOf = (id: string) => LOOKS.find((l) => l.id === id)!;
export {SK, W as WARDROBE};
const WD = W;

// ---------------------------------------------------------------- seated and leaning (RECIPE d.5, S6)
/** A shoe at its ankle's height (graphic/feet.ts always stands the sole on the floor): built at the standing ankle,
 *  then lifted. fp > 0 points the toes down (a hanging foot). */
export function shoeAt(sk: SkelV2, side: 'l' | 'r', c: Cam, spec: Parameters<typeof shoe>[3]): Part[] {
  const L = sk.leg[side];
  const lift = L.ankle[1] - 40;
  const sk2: SkelV2 = {...sk, leg: {...sk.leg, [side]: {...L, ankle: [L.ankle[0], 40, L.ankle[2]] as V3}}};
  return shoe(sk2, side, c, spec).map((p) => warpPart(p, (y) => y + lift));
}
/** An arm's draw order from its wrist: in front of the chest (toward us) 60, behind it 22. */
export function armZ(sk: SkelV2, side: 'l' | 'r', c: Cam): number {
  const w = toCam(sk.arm[side].wr, c)[2];
  const e = toCam(sk.arm[side].el, c)[2];
  const ch = toCam([sk.chest.x, sk.b.chestY, sk.chest.z] as V3, c)[2];
  return Math.min(w, e + 20) > ch - 8 ? 60 : 22;
}
/** A flat prop as a part in figure units (a ledge, the ground, a rail), with a lighter top edge. */
function block(name: string, x0: number, y0: number, x1: number, y1: number, fill: string, top: string, z: number, r = 6): Part {
  const d = rpath([[x0, y0, r], [x1, y0, r], [x1, y1, 0], [x0, y1, 0]]);
  return {name, d, fill, regions: [{d: rpath([[x0 - 2, y0 - 2, 0], [x1 + 2, y0 - 2, 0], [x1 + 2, y0 + 9, 0], [x0 - 2, y0 + 9, 0]]), fill: top}], z};
}
const STONE = {fill: '#9C8E93', top: '#B7AAAE', face: '#8A7C82'};

/** HER ON A LEDGE, in profile (ref 05): the seat on the ledge, the edge under the back of the knees, the thighs a
 *  little below the horizontal, the shins hanging forward and apart, the feet pointed; the torso a soft C leaning
 *  forward over the hands (a takeaway cup), the head bowed ~26 degrees; her hair falls forward by gravity. */
export function herLedge(o: {px?: number; state?: HairState} = {}): Built {
  const b = WOMAN_V2;
  const chest: Frame = {x: 0, z: 62, roll: 0, tw: 6};
  const pelvis: Frame = {x: 0, z: -6, roll: 0, tw: -4};
  const pose: PoseV2 = {
    b,
    pelvis,
    chest,
    waist: {z: 2},
    head: {yaw: 0, roll: 0, pitch: -26},
    fwd: 44,
    lean: 40,
    legs: {
      l: {knee: [48, 525, 248], ankle: [52, 284, 326], fy: 4, fp: 46},
      r: {knee: [-48, 528, 240], ankle: [-50, 274, 212], fy: -4, fp: 36},
    },
    arms: {l: {el: [112, 652, 122], wr: [34, 604, 238]}, r: {el: [-108, 654, 114], wr: [-28, 606, 232]}},
  };
  const sk = skelV2(pose);
  const c = cam(-90);
  const parts: Part[] = [];
  // the ledge: its top at the seat, its front edge under the back of the knees
  parts.push(block('ledge', -214, 506, 520, 1100, STONE.fill, STONE.top, -60, 4));
  parts.push(...trousers(sk, c, {tone: WD.denim, thigh: 54, knee: 48, hem: 47, hemY: 14, riseY: 612, z: 32}));
  for (const s of ['l', 'r'] as const) parts.push(...shoeAt(sk, s, c, {kind: 'sneaker', tone: T.sneaker, sole: '#F7F2EA', stripe: '#664334'}));
  parts.push(topV2(sk, c, {tone: T.knit, hemY: 530, neckA: 32, fit: 10, z: 40}));
  for (const s of ['l', 'r'] as const) {
    const z = armZ(sk, s, c);
    parts.push(sleeve(sk, s, c, {tone: T.knit, r: [36, 31, 28], len: 0.95, z}));
    parts.push(handAt(sk, s, c, SKIN.s2, z + 0.6, 0.95));
  }
  // the cup between the hands
  const cupAt = proj3(sk, c, [4, 640, 262]);
  parts.push({name: 'cup', d: rpath([[cupAt[0] - 20, cupAt[1] - 30, 4], [cupAt[0] + 20, cupAt[1] - 30, 4], [cupAt[0] + 16, cupAt[1] + 26, 3], [cupAt[0] - 16, cupAt[1] + 26, 3]]), fill: '#F2EAE0', regions: [{d: rpath([[cupAt[0] - 22, cupAt[1] - 12, 0], [cupAt[0] + 22, cupAt[1] - 12, 0], [cupAt[0] + 22, cupAt[1] + 8, 0], [cupAt[0] - 22, cupAt[1] + 8, 0]]), fill: T.teal.lit}], z: 61});
  const H = headV2(sk, c, SKIN.s2, {face: 'lash', hair: HAIR.copper});
  parts.push(...H.parts);
  parts.push(...hairOn(H, CUTS.W3, HAIR.copper, {state: o.state, px: o.px, rim: true}));
  return finish(withRim(parts), H.hf.c);
}
const proj3 = (sk: SkelV2, c: Cam, p: V3): V2 => {
  void sk;
  const t = (c.yaw * Math.PI) / 180;
  const x = p[0] * Math.cos(t) + p[2] * Math.sin(t);
  const z = -p[0] * Math.sin(t) + p[2] * Math.cos(t);
  return [x, 1000 - p[1] + (z * (c.eye - p[1])) / c.dist];
};

/** THE PAIR ON THE GROUND, from behind (ref 01), in the scene's breeze: she sits with her legs folded to her left, a
 *  hand on the ground, her back one long C leaning toward him, her head tilted onto his shoulder side; he sits with his
 *  knees up, one forearm on a knee, the other arm braced behind, his head turned toward her. Their shoulders touch. */
export function groundPair(o: {px?: number; state?: HairState} = {}): {her: Built; him: Built; gap: number} {
  const c = cam(186);
  const st = o.state;
  // her: a W3 cut in espresso on S4 skin, a rust sweater, jeans
  const bf = WOMAN_V2;
  const pf: PoseV2 = {
    b: bf,
    pelvis: {x: 0, z: 0, roll: 4, tw: 10},
    chest: {x: -30, z: -12, roll: -8, tw: -6},
    waist: {x: -12, z: -16},
    head: {yaw: 0, roll: -9, pitch: 3},
    fwd: 30,
    lean: 24,
    legs: {
      l: {knee: [172, 506, 150], ankle: [96, 492, -40], fy: 120, fp: 0},
      r: {knee: [64, 502, 222], ankle: [158, 490, 86], fy: 100, fp: 0},
    },
    arms: {l: {el: [154, 664, 26], wr: [182, 500, 58]}, r: {el: [-112, 652, 56], wr: [-60, 566, 150]}},
  };
  const skf = skelV2(pf);
  const her: Part[] = [];
  her.push(...trousers(skf, c, {tone: WD.denim, thigh: 52, knee: 46, hem: 46, hemY: 14, riseY: 612, z: 32}));
  her.push(topV2(skf, c, {tone: WD.rust, hemY: 525, neckA: 32, fit: 11, z: 40}));
  for (const s of ['l', 'r'] as const) {
    const z = armZ(skf, s, c);
    her.push(sleeve(skf, s, c, {tone: WD.rust, r: [37, 32, 29], len: 0.95, z}));
    her.push(handAt(skf, s, c, SK.s4, z + 0.6, 0.95));
  }
  const Hf = headV2(skf, c, SK.s4, {face: 'lash', hair: HC.espresso});
  her.push(...Hf.parts);
  her.push(...hairOn(Hf, CUTS.W3, HC.espresso, {state: st, px: o.px}));
  // him: an M3 cut in dark brown on S2 skin, a navy sweater, cream trousers
  const bm = MAN_V2;
  const pm: PoseV2 = {
    b: bm,
    pelvis: {x: 0, z: 0, roll: -3, tw: -6},
    chest: {x: 26, z: -22, roll: 6, tw: 6},
    waist: {x: 10, z: -20},
    head: {yaw: 26, roll: 7, pitch: 5},
    fwd: 28,
    lean: 22,
    legs: {
      l: {knee: [56, 734, 160], ankle: [60, 512, 278], fy: 6, fp: 0},
      r: {knee: [-62, 720, 172], ankle: [-66, 512, 292], fy: -8, fp: 0},
    },
    arms: {l: {el: [160, 640, -80], wr: [170, 492, -150]}, r: {el: [-92, 702, 150], wr: [-72, 652, 246]}},
  };
  const skm = skelV2(pm);
  const him: Part[] = [];
  him.push(...trousers(skm, c, {tone: WD.cream, thigh: 56, knee: 50, hem: 48, hemY: 14, riseY: 600, z: 32}));
  for (const s of ['l', 'r'] as const) him.push(...shoeAt(skm, s, c, {kind: 'sneaker', tone: T.sneaker, sole: '#F7F2EA', stripe: '#2F4566'}));
  him.push(topV2(skm, c, {tone: WD.navy, hemY: 520, neckA: 38, fit: 12, z: 40}));
  for (const s of ['l', 'r'] as const) {
    const z = armZ(skm, s, c);
    him.push(sleeve(skm, s, c, {tone: WD.navy, r: [42, 36, 32], len: 0.95, z}));
    him.push(handAt(skm, s, c, SK.s2, z + 0.6, 0.95));
  }
  const Hm = headV2(skm, c, SK.s2, {face: 'lash', hair: HC.darkBrown});
  him.push(...Hm.parts);
  him.push(...hairOn(Hm, CUTS.M3, HC.darkBrown, {state: st, px: o.px}));
  return {her: finish(her, Hf.hf.c), him: finish(him, Hm.hf.c), gap: 262};
}

/** LEANING ON A RAIL, from behind (d.5): the forearms on the railing, the weight on her left leg (the hip shifted, the
 *  pelvis tilted), the other knee bent with the heel up; the chest leaning a little forward; the head turned to the
 *  view (a lost profile). A W2 lob in the breeze. */
export function railLean(o: {px?: number; state?: HairState} = {}): Built {
  const lk = lookOf('W2');
  const b = WOMAN_V2;
  const pose: PoseV2 = {
    b,
    pelvis: {x: 22, z: -10, roll: 7, tw: -6},
    chest: {x: 4, z: 30, roll: -4, tw: 4},
    waist: {x: 13, z: 8},
    head: {yaw: 22, roll: 4, pitch: 2},
    fwd: 32,
    lean: 22,
    legs: {
      l: {knee: [48, 296, 2], ankle: [30, 40, -8], fy: 14, fp: 0},
      r: {knee: [-48, 300, -24], ankle: [-62, 74, -112], fy: -18, fp: 40},
    },
    arms: {l: {el: [142, 640, 96], wr: [62, 650, 210]}, r: {el: [-142, 642, 98], wr: [-62, 652, 212]}},
  };
  const sk = skelV2(pose);
  const c = cam(190);
  const parts: Part[] = [];
  parts.push(contact(sk, c, BG.ground));
  // the railing behind her (farther from us than she is): a top bar, a lower bar, posts
  parts.push(block('rail', -560, 336, 560, 352, '#6F6168', '#8E8087', -80, 6));
  parts.push(block('rail2', -560, 640, 560, 650, '#6F6168', '#8E8087', -80, 4));
  for (const x of [-430, 430]) parts.push(block('post', x - 9, 336, x + 9, 1000, '#655860', '#7E7178', -81, 3));
  parts.push(...trousers(sk, c, {tone: WD.denim, thigh: 50, knee: 44, hem: 45, hemY: 16, riseY: 616, z: 32}));
  for (const s of ['l', 'r'] as const) parts.push(...shoe(sk, s, c, {kind: 'sneaker', tone: T.sneaker, sole: '#F7F2EA', stripe: '#664334'}));
  parts.push(top(sk, c, {tone: WD.cloud, hemY: 600, neckA: 34, fit: 3, z: 40, hemA: b.waistW / 2 + 10}));
  for (const s of ['l', 'r'] as const) {
    const z = armZ(sk, s, c);
    parts.push(bareArm(sk, s, c, lk.skin, z, 0.25));
    parts.push(shortSleeve(sk, s, c, WD.cloud, 32, 29, 0.44, z + 0.2));
  }
  const H = headV2(sk, c, lk.skin, {face: 'lash', hair: lk.hair});
  parts.push(...H.parts);
  parts.push(...hairOn(H, CUTS.W2, lk.hair, {state: o.state, px: o.px}));
  return finish(parts, H.hf.c);
}
