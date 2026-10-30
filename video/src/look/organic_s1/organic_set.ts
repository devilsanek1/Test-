// The organic proof's four baked pieces (scripts/look/organic/organic_proof.py writes ./paint/<name>.ocpaint.png and
// ./paint/manifest.json; docs/look/organic/organic_proof.md). Each box is in its layer's own px (world px at rest):
// x, y, width, height. Imported as bundle URLs (assets.d.ts), never through staticFile().
import cloud from './paint/cloud.ocpaint.png';
import tree from './paint/tree.ocpaint.png';
import facade from './paint/facade.ocpaint.png';
import paving from './paint/paving.ocpaint.png';
import manifest from './paint/manifest.json';

export type OrganicPieceName = 'cloud' | 'tree' | 'facade' | 'paving';
export type OrganicPiece = {src: string; box: readonly [number, number, number, number]};

const BOX = (manifest as unknown as {pieces: Record<OrganicPieceName, {box: [number, number, number, number]}>}).pieces;

export const ORGANIC: Record<OrganicPieceName, OrganicPiece> = {
  cloud: {src: cloud, box: BOX.cloud.box},
  tree: {src: tree, box: BOX.tree.box},
  facade: {src: facade, box: BOX.facade.box},
  paving: {src: paving, box: BOX.paving.box},
};
export const ORGANIC_PIECES: readonly OrganicPieceName[] = ['cloud', 'tree', 'facade', 'paving'];
