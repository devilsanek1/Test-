// MODERN GRAPHIC people: the cast. HER (27, the film's lead; the film's teal is her accent) in two outfits, each in
// three views; a man and a woman who support her (different looks, builds and skins). Each figure is built from its
// skeleton (a pose) and its outfit, in z order: the ground, the hair behind, the far limbs, the legs, the torso
// pieces, the near limbs, the neck and head, the hair in front, the props.
import {V2, V3, add, mul} from './geo';
import {Cam, cam, toCam} from './rig';
import {WOMAN, MAN, Skel, Frame, framePt, Build} from './body';
import {headParts} from './head';
import {hairLong, hairPonytail, hairCurtains, hairBraids} from './hair';
import {cap, ear, sunglasses, headphones} from './headwear';
import {coat, top, trousers, sleeve, cuffOf, bareArm, shortSleeve, bareLegs, bomber, ribSleeve, leatherJacket, leatherSleeve, slipSkirt} from './wear';
import {shoe, contact} from './feet';
import {hand, bag, icedCoffee, gripCup} from './props';
import {SKIN, HAIR, T, BG} from './palette';
import {rimOf, type Tone} from './color';
import type {Built, Part} from './part';

export type View = 'q' | 'p' | 'b';
export type Who = 'herEvening' | 'herWeekend' | 'man' | 'woman';

// ---------------------------------------------------------------- skeletons
type PoseIn = {
  b: Build;
  pelvis: Frame;
  chest: Frame;
  head: {yaw: number; roll: number; pitch: number; dx?: number; dz?: number};
  legs: {l: {knee: V3; ankle: V3; fy: number; fp: number}; r: {knee: V3; ankle: V3; fy: number; fp: number}};
  arms: {l: {el: V3; wr: V3}; r: {el: V3; wr: V3}};
};
function skel(p: PoseIn): Skel {
  const b = p.b;
  const hipY = b.hipJ;
  const shY = b.shoulderY - 14;
  const hipL = framePt(p.pelvis, 48, hipY, 0);
  const hipR = framePt(p.pelvis, -48, hipY, 0);
  const shL = framePt(p.chest, b.shoulderW / 2 - 13, shY, -16);
  const shR = framePt(p.chest, -(b.shoulderW / 2 - 13), shY, -16);
  const neckBase: V3 = [p.chest.x, b.shoulderY + 8, p.chest.z - 14];
  const neckTop: V3 = [p.chest.x + (p.head.dx ?? 0) * 0.6, 1000 - b.skull - 4, p.chest.z - 6 + (p.head.dz ?? 0) * 0.6];
  const headC: V3 = [p.chest.x + (p.head.dx ?? 0), 1000 - b.skull / 2, p.chest.z + 4 + (p.head.dz ?? 0)];
  return {
    b,
    pelvis: p.pelvis,
    chest: p.chest,
    head: {c: headC, yaw: p.head.yaw, roll: p.head.roll, pitch: p.head.pitch},
    neckTop,
    neckBase,
    arm: {
      l: {sh: shL, el: p.arms.l.el, wr: p.arms.l.wr, hd: [0, -1, 0], hp: 'relaxed'},
      r: {sh: shR, el: p.arms.r.el, wr: p.arms.r.wr, hd: [0, -1, 0], hp: 'relaxed'},
    },
    leg: {
      l: {hip: hipL, knee: p.legs.l.knee, ankle: p.legs.l.ankle, fy: p.legs.l.fy, fp: p.legs.l.fp},
      r: {hip: hipR, knee: p.legs.r.knee, ankle: p.legs.r.ankle, fy: p.legs.r.fy, fp: p.legs.r.fp},
    },
  };
}

/** Standing in contrapposto, the weight on the right leg, the left knee eased forward (A2: the pelvis 6 degrees, the
 *  shoulders 4 the other way, the head tilted off the shoulders' line). */
const stand = (b: Build, arms: PoseIn['arms'], o: {headYaw?: number; roll?: number} = {}): PoseIn => ({
  b,
  pelvis: {x: -12, z: 0, roll: -(o.roll ?? 8), tw: 4},
  chest: {x: -2, z: -2, roll: (o.roll ?? 8) * 0.62, tw: -4},
  head: {yaw: o.headYaw ?? 6, roll: -5, pitch: 3, dx: 2},
  legs: {
    r: {knee: [-46, 295, 2], ankle: [-28, 40, -6], fy: -14, fp: 0},
    l: {knee: [50, 302, 36], ankle: [70, 42, 62], fy: 26, fp: 0},
  },
  arms,
});
/** The walk's contact pose: the left (near) leg forward, the right pushing off; the free arm swings little (A6). */
const walk = (b: Build, arms: PoseIn['arms']): PoseIn => ({
  b,
  pelvis: {x: 0, z: 0, roll: 0, tw: -8},
  chest: {x: 0, z: 2, roll: 0, tw: 6},
  head: {yaw: 0, roll: 0, pitch: 1, dz: 4},
  legs: {
    l: {knee: [48, 300, 78], ankle: [46, 40, 158], fy: 4, fp: 0},
    r: {knee: [-46, 296, -50], ankle: [-44, 74, -148], fy: -4, fp: 32},
  },
  arms,
});
/** From behind, standing, the weight on the left leg, looking back over the left shoulder (the lost profile). */
const back = (b: Build, arms: PoseIn['arms']): PoseIn => ({
  b,
  pelvis: {x: 10, z: 0, roll: 6, tw: -4},
  chest: {x: 2, z: -2, roll: -4, tw: 4},
  head: {yaw: 26, roll: 4, pitch: 2},
  legs: {
    l: {knee: [46, 295, 2], ankle: [28, 40, -6], fy: 14, fp: 0},
    r: {knee: [-52, 302, 30], ankle: [-74, 42, 52], fy: -26, fp: 0},
  },
  arms,
});

const YAW: Record<View, number> = {q: -40, p: -90, b: 196};
const ARMS_COAT: Record<View, PoseIn['arms']> = {
  // the right hand in the coat's pocket (the elbow out), the left arm clamping the bag
  q: {r: {el: [-150, 632, -20], wr: [-112, 520, 46]}, l: {el: [134, 628, -14], wr: [124, 482, 12]}},
  p: {l: {el: [128, 630, -30], wr: [122, 486, -6]}, r: {el: [-122, 632, 28], wr: [-114, 494, 82]}},
  b: {l: {el: [134, 628, -14], wr: [124, 482, 12]}, r: {el: [-150, 634, -12], wr: [-128, 528, 22]}},
};
const ARMS_COFFEE: Record<View, PoseIn['arms']> = {
  // the left hand holds the iced coffee (the forearm up, A5), the right arm loose
  q: {l: {el: [128, 640, 6], wr: [74, 676, 146]}, r: {el: [-130, 630, -6], wr: [-124, 488, 16]}},
  p: {l: {el: [122, 642, -4], wr: [108, 690, 138]}, r: {el: [-120, 634, 28], wr: [-112, 494, 80]}},
  b: {l: {el: [134, 628, -10], wr: [126, 488, 18]}, r: {el: [-136, 628, -12], wr: [-128, 486, 6]}},
};

// ---------------------------------------------------------------- helpers
/** Is this side's arm in front of the torso in this view? */
const armNear = (sk: Skel, side: 'l' | 'r', c: Cam) => toCam(sk.arm[side].sh, c)[2] > -20;
/** The thumb's side on screen: the thumb faces the body's front. */
const thumbSide = (c: Cam): -1 | 0 | 1 => {
  const fx = Math.sin((c.yaw * Math.PI) / 180);
  if (Math.abs(fx) < 0.35) return 0;
  return fx < 0 ? -1 : 1;
};
const handAt = (sk: Skel, side: 'l' | 'r', c: Cam, skin: Tone, z: number, len = 1): Part => {
  const cf = cuffOf(sk, side, c, len);
  const th = thumbSide(c);
  return hand(`hand-${side}`, add(cf.p, mul(cf.dir, -4)) as V2, cf.dir, sk.b.hand, th, skin, z, th === 0 ? 'edge' : 'relaxed');
};
/** The hand gripping the iced coffee, and the cup. */
function coffeeIn(sk: Skel, side: 'l' | 'r', c: Cam, skin: Tone, z: number, hanging = false): Part[] {
  const cf = cuffOf(sk, side, c, 1);
  const len = sk.b.hand;
  const hgt = 118;
  const cupW = hgt * 0.6;
  const cupC: V2 = hanging ? (add(cf.p, [0, len * 0.72]) as V2) : (add(add(cf.p, mul(cf.dir, len * 0.55)) as V2, [0, -hgt * 0.06]) as V2);
  return [
    ...icedCoffee(cupC, hgt, 0, z - 0.2, {coffee: T.latte, clear: '#E7DED6', lid: '#F4EFE8', straw: '#F4EFE8'}),
    ...gripCup(`grip-${side}`, cf.p, cupC, cupW, hgt, len, skin, z + 0.3, hanging),
  ];
}
/** Her parts that catch the rim light (the subject's key-side edge): never skin. */
const RIMMED = /^(coat|sleeve|hair|ponytail|cap|bag|seat|leg-)/;
const withRim = (parts: Part[]): Part[] => parts.map((p) => (RIMMED.test(p.name) && !p.line ? {...p, rim: rimOf(p.fill)} : p));

// ---------------------------------------------------------------- her, autumn city evening (N1: the long open coat)
function herEvening(view: View): Built {
  const pose = view === 'q' ? stand(WOMAN, ARMS_COAT.q) : view === 'p' ? walk(WOMAN, ARMS_COAT.p) : back(WOMAN, ARMS_COAT.b);
  const sk = skel(pose);
  const c = cam(YAW[view]);
  const parts: Part[] = [];
  parts.push(contact(sk, c, BG.ground));
  const walking = view === 'p';
  parts.push(...trousers(sk, c, {tone: T.trouserCream, thigh: 64, knee: 60, hem: walking ? 60 : 66, hemY: 10, riseY: 615, z: 32}));
  for (const s of ['l', 'r'] as const) parts.push(...shoe(sk, s, c, {kind: 'pointedFlat', tone: T.shoeBlack, sole: '#1D1517'}));
  parts.push(top(sk, c, {tone: T.knit, hemY: 520, neckA: 30, z: 40}));
  parts.push(
    ...coat(sk, c, {
      tone: T.coat,
      facing: T.coatFacing,
      hemY: 182,
      hemA: walking ? 150 : 152,
      shA: 140,
      open: 22,
      hemB: walking ? 114 : 100,
      hemZ: walking ? 16 : 8,
      z: 44,
    }),
  );
  for (const s of ['l', 'r'] as const) {
    const near = armNear(sk, s, c);
    const z = near ? 60 : 22;
    parts.push(sleeve(sk, s, c, {tone: T.coat, r: [44, 39, 37], len: 0.97, z}));
    const pocket = (view === 'q' || view === 'b') && s === 'r';
    if (!pocket) parts.push(handAt(sk, s, c, SKIN.s2, z + 0.5, 0.97));
  }
  const bagAt = framePt(sk.chest, 118, 652, -66);
  parts.push(...bag(sk, 'l', bagAt, c, T.teal, armNear(sk, 'l', c) ? 59 : 21, {yaw: -26, len: 128, h: 86, th: 34}));
  const H = headParts(sk, c, SKIN.s2);
  parts.push(...H.parts);
  const turn = view === 'b' ? Math.min(1, Math.max(0, (180 - Math.abs(H.hf.yaw)) / 50)) : 0;
  parts.push(...hairLong({hf: H.hf, view: H.lm.view, faceX: H.lm.faceX, t: HAIR.copper, swing: walking ? 0.06 : 0, turn}));
  return finish(withRim(parts), H.hf.c);
}

// ---------------------------------------------------------------- her, casual weekend (L2: baby tee, jeans, cap, ponytail)
function herWeekend(view: View): Built {
  const pose = view === 'q' ? stand(WOMAN, ARMS_COFFEE.q) : view === 'p' ? walk(WOMAN, ARMS_COFFEE.p) : back(WOMAN, ARMS_COFFEE.b);
  const sk = skel(pose);
  const c = cam(YAW[view]);
  const parts: Part[] = [];
  parts.push(contact(sk, c, BG.ground));
  parts.push(...trousers(sk, c, {tone: T.denim, thigh: 52, knee: 45, hem: 47, hemY: 16, riseY: 616, z: 32}));
  for (const s of ['l', 'r'] as const) parts.push(...shoe(sk, s, c, {kind: 'sneaker', tone: T.sneaker, sole: '#F7F2EA', stripe: '#664334'}));
  parts.push(top(sk, c, {tone: T.tee, hemY: 608, neckA: 34, fit: 2, z: 40, hemA: WOMAN.waistW / 2 + 9}));
  for (const s of ['l', 'r'] as const) {
    const near = armNear(sk, s, c);
    const z = near ? 60 : 22;
    parts.push(bareArm(sk, s, c, SKIN.s2, z, 0.25));
    parts.push(shortSleeve(sk, s, c, T.tee, 32, 29, 0.42, z + 0.2));
    if (s === 'l') parts.push(...coffeeIn(sk, s, c, SKIN.s2, z + 0.5, view === 'b'));
    else parts.push(handAt(sk, s, c, SKIN.s2, z + 0.5));
  }
  const H = headParts(sk, c, SKIN.s2);
  parts.push(...H.parts);
  const turn = view === 'b' ? Math.min(1, Math.max(0, (180 - Math.abs(H.hf.yaw)) / 50)) : 0;
  if (H.lm.view === 'b') parts.push(...ear(H.hf, 'b', SKIN.s2, -1), ...ear(H.hf, 'b', SKIN.s2, 1));
  else parts.push(...ear(H.hf, H.lm.view, SKIN.s2));
  parts.push(...hairPonytail({hf: H.hf, view: H.lm.view, faceX: H.lm.faceX, t: HAIR.copper, swing: view === 'p' ? 0.08 : 0, turn}));
  parts.push(...cap(H.hf, H.lm.view, T.teal, SKIN.s2.shade, turn));
  return finish(withRim(parts), H.hf.c);
}

// ---------------------------------------------------------------- the man (N6: the suede bomber, headphones)
function man(view: View): Built {
  const arms: PoseIn['arms'] = {
    // the left hand in the jeans' front pocket (the elbow out), the right arm loose
    l: {el: [168, 612, -18], wr: [118, 506, 46]},
    r: {el: [-152, 612, -8], wr: [-140, 470, 14]},
  };
  const pose = stand(MAN, arms, {headYaw: 4, roll: 5});
  const sk = skel(pose);
  const c = cam(view === 'q' ? -34 : YAW[view]);
  const parts: Part[] = [];
  parts.push(contact(sk, c, BG.ground));
  parts.push(...trousers(sk, c, {tone: T.indigo, thigh: 54, knee: 47, hem: 46, hemY: 20, riseY: 600, z: 32}));
  for (const s of ['l', 'r'] as const) parts.push(...shoe(sk, s, c, {kind: 'sneaker', tone: T.sneaker, sole: '#F7F2EA', stripe: '#2F4566'}));
  parts.push(top(sk, c, {tone: T.tee, hemY: 560, neckA: 36, fit: 6, z: 40}));
  const rib: Tone = {...T.cognac, lit: T.cognac.shade, shade: T.cognac.deep};
  parts.push(...bomber(sk, c, {tone: T.cognac, rib, z: 44, vY: 742}));
  for (const s of ['l', 'r'] as const) {
    const near = armNear(sk, s, c);
    const z = near ? 60 : 22;
    parts.push(...ribSleeve(sk, s, c, T.cognac, rib, [42, 37, 34], z));
    if (s === 'r') parts.push(handAt(sk, s, c, SKIN.s3, z + 0.5, 0.98));
  }
  const H = headParts(sk, c, SKIN.s3);
  parts.push(...H.parts);
  parts.push(...hairCurtains({hf: H.hf, view: H.lm.view, faceX: H.lm.faceX, t: HAIR.blackBrown}));
  parts.push(...headphones(H.hf, T.phones, '#8E7F78'));
  return finish(parts, H.hf.c);
}

// ---------------------------------------------------------------- the woman (N3: the cropped leather jacket, the satin skirt)
function woman(view: View): Built {
  const arms: PoseIn['arms'] = {
    // the left hand in the jacket's pocket, the right arm loose
    l: {el: [150, 628, -22], wr: [118, 540, 40]},
    r: {el: [-132, 630, -4], wr: [-124, 486, 20]},
  };
  const pose = stand({...WOMAN, shoulderW: 232, hipW: 214}, arms, {headYaw: 8, roll: 7});
  const sk = skel(pose);
  const c = cam(view === 'q' ? -30 : YAW[view]);
  const parts: Part[] = [];
  parts.push(contact(sk, c, BG.ground));
  parts.push(...bareLegs(sk, c, SKIN.s5, 30));
  for (const s of ['l', 'r'] as const) parts.push(...shoe(sk, s, c, {kind: 'kitten', tone: T.shoeBlack, sole: '#1D1517', above: SKIN.s5}));
  parts.push(slipSkirt(sk, c, {tone: T.butter, z: 38, hemY: 205, hemA: 140, swing: 6}));
  parts.push(...leatherJacket(sk, c, {tone: T.burgundy, z: 44, zip: '#B98A86'}));
  for (const s of ['l', 'r'] as const) {
    const near = armNear(sk, s, c);
    const z = near ? 60 : 22;
    parts.push(leatherSleeve(sk, s, c, T.burgundy, [36, 32, 30], z));
    if (s === 'r') parts.push(handAt(sk, s, c, SKIN.s5, z + 0.5, 0.97));
  }
  const H = headParts(sk, c, SKIN.s5);
  parts.push(...H.parts);
  parts.push(...hairBraids({hf: H.hf, view: H.lm.view, faceX: H.lm.faceX, t: HAIR.black}, HAIR.honey));
  parts.push(...sunglasses(H.hf, H.lm.faceX, '#241B1F', '#6E5C62'));
  return finish(parts, H.hf.c);
}

function finish(parts: Part[], head: V2): Built {
  return {parts, box: {x0: -400, x1: 400, y0: -20, y1: 1010}, head: [head[0], head[1]]};
}

export function build(who: Who, view: View): Built {
  switch (who) {
    case 'herEvening':
      return herEvening(view);
    case 'herWeekend':
      return herWeekend(view);
    case 'man':
      return man(view);
    case 'woman':
      return woman(view);
  }
}
