// people_dirs/painterly: a person = a build, a skin, a face, hair and an outfit; posed and turned, it becomes a Model
// (surfaces + decals + palette) for the painter (paint.tsx). The cast is in cast.ts.
import {
  type Build,
  type FaceShape,
  type Pose,
  type Skeleton,
  armSurface,
  earSurface,
  handSurfaces,
  headSurface,
  legSurface,
  neckSurface,
  skeleton,
  torsoSurface,
} from './body';
import type {Kind} from './color';
import type {Surface} from './mesh';
import type {DecalFn, Model, Palette} from './paint';
import type {V3} from './math';

export type Part = {surfaces: Surface[]; decals?: DecalFn[]; palette?: Palette};
/** What a garment or hair piece hides of the body, and builds. */
export type Piece = {
  /** Body parts it covers (not built): 'torso', 'legs', 'legsAbove:<y>' handled by `legFrom`, 'arms', etc. */
  hides?: {torso?: boolean; legsFrom?: number; legs?: boolean; armsTo?: number; arms?: boolean; neck?: boolean; feet?: boolean; ears?: boolean};
  build: (sk: Skeleton, res: number) => Part;
};

export type Person = {
  name: string;
  build: Build;
  face: FaceShape;
  skin: string;
  /** Extra materials (garments, hair) by key. */
  mats: Record<string, {base: string; kind: Kind}>;
  pieces: Piece[];
  /** Face decals (lashes, brows, lips, sunglasses), given the skeleton. */
  faceMarks?: (sk: Skeleton, res: number, fs: FaceShape) => Part;
};

export function buildModel(p: Person, pose: Pose, res = 1): Model {
  const sk = skeleton(p.build, pose);
  const surfaces: Surface[] = [];
  const decals: DecalFn[] = [];
  const palette: Palette = {skin: {base: p.skin, kind: 'skin'}, ...p.mats};
  // what the pieces cover
  let torso = true;
  let neck = true;
  let legsFrom = 610;
  let legs = true;
  let armsTo = -1e9;
  let arms = true;
  let ears = p.build.sex === 'm';
  const built: Part[] = [];
  for (const pc of p.pieces) {
    const h = pc.hides ?? {};
    if (h.torso) torso = false;
    if (h.neck) neck = false;
    if (h.legs) legs = false;
    if (h.legsFrom !== undefined) legsFrom = Math.min(legsFrom, h.legsFrom);
    if (h.armsTo !== undefined) armsTo = Math.max(armsTo, h.armsTo);
    if (h.arms) arms = false;
    if (h.ears === false) ears = false;
    built.push(pc.build(sk, res));
  }
  // under a garment, the upper chest and the trapezius stay (they fill a neckline; the garment covers the rest)
  if (torso) surfaces.push(torsoSurface(sk, res));
  else surfaces.push(torsoSurface(sk, res, 'torso', 'skin', 772));
  if (neck) surfaces.push(neckSurface(sk, res));
  surfaces.push(headSurface(sk, res, p.face));
  if (ears) surfaces.push(earSurface(sk, 1, res), earSurface(sk, -1, res));
  if (legs) {
    surfaces.push(legSurface(sk, 'L', res, legsFrom), legSurface(sk, 'R', res, legsFrom));
  }
  if (arms) {
    // under a sleeve only the part near the cuff is built (it shows inside the open cuff)
    for (const s of ['L', 'R'] as const) surfaces.push(armSurface(sk, s, res, armsTo > -26 ? Math.min(armsTo - 40, 300) : -26));
  }
  for (const s of ['L', 'R'] as const) surfaces.push(...handSurfaces(sk, s, res));
  if (p.faceMarks) built.push(p.faceMarks(sk, res, p.face));
  for (const b of built) {
    surfaces.push(...b.surfaces);
    if (b.decals) decals.push(...b.decals);
    if (b.palette) Object.assign(palette, b.palette);
  }
  const feet: V3[] = [
    [sk.ankle.L[0], 0, sk.ankle.L[2] + 30],
    [sk.ankle.R[0], 0, sk.ankle.R[2] + 30],
  ];
  return {surfaces, decals, palette, feet};
}
