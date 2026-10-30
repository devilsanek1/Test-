// MODERN GRAPHIC people: the cast. HER (27, the film's lead; the film's teal is her accent) in two outfits, each in
// three views; a man and a woman who support her (different looks, builds and skins). Each figure is built from its
// skeleton (a pose) and its outfit, in z order: the ground, the hair behind, the far limbs, the legs, the torso
// pieces, the near limbs, the neck and head, the hair in front, the props.
import {V2, V3, add, sub, norm, mul} from './geo';
import {Cam, cam, proj, toCam} from './rig';
import {WOMAN, MAN, Skel, Frame, framePt, Build} from './body';
import {headParts} from './head';
import {hairLong} from './hair';
import {coat, top, trousers, sleeve, cuffOf} from './wear';
import {shoe, contact} from './feet';
import {hand, bag} from './props';
import {SKIN, HAIR, T, BG} from './palette';
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

/** Her standing in contrapposto, the weight on her right leg, the left knee eased forward. */
const herStand = (o: {headYaw?: number} = {}): PoseIn => ({
  b: WOMAN,
  pelvis: {x: -10, z: 0, roll: -6, tw: 4},
  chest: {x: -2, z: -2, roll: 4, tw: -4},
  head: {yaw: o.headYaw ?? 6, roll: -5, pitch: 3, dx: 2},
  legs: {
    r: {knee: [-46, 295, 2], ankle: [-28, 40, -6], fy: -14, fp: 0},
    l: {knee: [50, 302, 36], ankle: [70, 42, 62], fy: 26, fp: 0},
  },
  arms: {
    // the right hand in the coat's pocket (the elbow out), the left arm clamping the bag
    r: {el: [-150, 632, -20], wr: [-112, 520, 46]},
    l: {el: [134, 628, -14], wr: [124, 482, 12]},
  },
});
/** Her walking, the contact pose: the left (near) leg forward, the right pushing off. */
const herWalk = (): PoseIn => ({
  b: WOMAN,
  pelvis: {x: 0, z: 0, roll: 0, tw: -8},
  chest: {x: 0, z: 2, roll: 0, tw: 6},
  head: {yaw: 0, roll: 0, pitch: 1, dz: 4},
  legs: {
    l: {knee: [48, 302, 108], ankle: [46, 40, 212], fy: 4, fp: 0},
    r: {knee: [-46, 298, -64], ankle: [-44, 82, -200], fy: -4, fp: 36},
  },
  arms: {
    l: {el: [128, 630, -34], wr: [122, 486, -4]},
    r: {el: [-122, 632, 36], wr: [-114, 494, 100]},
  },
});
/** Her from behind, standing, the weight on her left leg, looking back over her left shoulder. */
const herBack = (): PoseIn => ({
  b: WOMAN,
  pelvis: {x: 10, z: 0, roll: 6, tw: -4},
  chest: {x: 2, z: -2, roll: -4, tw: 4},
  head: {yaw: 26, roll: 4, pitch: 2},
  legs: {
    l: {knee: [46, 295, 2], ankle: [28, 40, -6], fy: 14, fp: 0},
    r: {knee: [-52, 302, 30], ankle: [-74, 42, 52], fy: -26, fp: 0},
  },
  arms: {
    l: {el: [134, 628, -14], wr: [124, 482, 12]},
    r: {el: [-150, 632, -20], wr: [-112, 520, 46]},
  },
});

const YAW: Record<View, number> = {q: -40, p: -90, b: 196};

// ---------------------------------------------------------------- helpers
/** Is this side's arm in front of the torso in this view? */
const armNear = (sk: Skel, side: 'l' | 'r', c: Cam) => toCam(sk.arm[side].sh, c)[2] > -20;
/** The thumb's side on screen for a relaxed hand: the thumb faces the body's front. */
const thumbSide = (c: Cam, side: 'l' | 'r'): -1 | 0 | 1 => {
  const fx = Math.sin((c.yaw * Math.PI) / 180);
  if (Math.abs(fx) < 0.35) return 0;
  void side;
  return fx < 0 ? -1 : 1;
};
const handAt = (sk: Skel, side: 'l' | 'r', c: Cam, z: number, kind: 'relaxed' | 'edge' = 'relaxed', len = 1): Part => {
  const cf = cuffOf(sk, side, c, len);
  const th = thumbSide(c, side);
  return hand(`hand-${side}`, add(cf.p, mul(cf.dir, -4)) as V2, cf.dir, sk.b.hand, th, SKIN.s2, z, th === 0 ? 'edge' : kind);
};

// ---------------------------------------------------------------- her, autumn city evening (N1: the long open coat)
function herEvening(view: View): Built {
  const pose = view === 'q' ? herStand() : view === 'p' ? herWalk() : herBack();
  const sk = skel(pose);
  const c = cam(YAW[view]);
  const parts: Part[] = [];
  parts.push(contact(sk, c, BG.ground));
  // legs: wide cream trousers to the floor, pointed black flats
  parts.push(...trousers(sk, c, {tone: T.trouserCream, thigh: 66, knee: 64, hem: 68, hemY: 10, riseY: 615, z: 32}));
  for (const s of ['l', 'r'] as const) parts.push(...shoe(sk, s, c, {kind: 'pointedFlat', tone: T.shoeBlack, sole: '#1D1517'}));
  // the fine knit
  parts.push(top(sk, c, {tone: T.knit, hemY: 520, neckA: 30, z: 40}));
  // the coat
  const walk = view === 'p';
  parts.push(
    ...coat(sk, c, {
      tone: T.coat,
      facing: T.coatFacing,
      hemY: 182,
      hemA: walk ? 150 : 152,
      shA: 140,
      open: 22,
      hemB: walk ? 132 : 100,
      hemZ: walk ? 30 : 8,
      z: 44,
    }),
  );
  // arms: coat sleeves; the far arm behind the coat, the near arm in front
  for (const s of ['l', 'r'] as const) {
    const near = armNear(sk, s, c);
    const z = near ? 60 : 22;
    const sl = sleeve(sk, s, c, {tone: T.coat, r: [44, 39, 37], len: 0.97, z});
    parts.push(sl);
    const pocket = (view === 'q' && s === 'r') || (view === 'b' && s === 'r');
    if (!pocket) parts.push(handAt(sk, s, c, z + 0.5, 'relaxed', 0.97));
  }
  // the teal bag under her left arm
  const bagAt = framePt(sk.chest, 118, 655, -18);
  const bz = armNear(sk, 'l', c) ? 59 : 21;
  parts.push(...bag(sk, 'l', bagAt, c, T.teal, bz));
  // head and hair
  const H = headParts(sk, c, SKIN.s2);
  parts.push(...H.parts);
  const turn = view === 'b' ? Math.min(1, Math.max(0, (180 - Math.abs(H.hf.yaw)) / 50)) : 0;
  parts.push(...hairLong({hf: H.hf, view: H.lm.view, faceX: H.lm.faceX, t: HAIR.copper, swing: view === 'p' ? 0.06 : 0, turn}));
  return finish(parts);
}

function finish(parts: Part[]): Built {
  return {parts, box: {x0: -400, x1: 400, y0: -20, y1: 1010}};
}

export function build(who: Who, view: View): Built {
  switch (who) {
    case 'herEvening':
      return herEvening(view);
    default:
      return herEvening(view);
  }
}
export const _unused = {MAN, proj, sub, norm};
