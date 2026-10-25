// S10 elephant plate FACE (100-unit design, centred on 0, 0), shared by the near hanging plaques (plaques.tsx) and the far
// wall plates (secondRow.tsx), so 'old' reads by VALUE and SILHOUETTE at every size (fix round 2):
//  - CURRENT: cream face (it pops off the sand / mintPale / tan walls) with a sage frame band, four screws, the modern
//    ink emblem;
//  - OLD: two palette steps darker (ochre `brown`), the emblem engraved in cream (old style), a chipped top-right corner,
//    the bottom-left corner BENT forward (its tan back shows), an ink crack with a cream lip, screws missing.
// Palette tokens only (no new tints): cream / sage / tan / brown / ink.

import React from 'react';
import {palette} from '../../lib/theme';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {blob, polyPath, Pt, rect, roundRect} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {ElephantEmblem} from './kit';

export const PLATE = {
  newFill: palette.cream,
  band: palette.sage,
  oldFill: palette.brown,
  oldBack: palette.tan,
  oldLine: palette.cream,
};

/** Old outline: chipped top-right, the bottom-left corner folded forward along (-50, 32) -> (-32, 50). */
export const OLD_OUTLINE: Pt[] = [[-50, -50], [26, -50], [33, -42], [38, -44], [44, -36], [50, -30], [50, 50], [-32, 50], [-50, 32]];
/** The folded corner (the plate's back, seen): the corner (-50, 50) reflected over the fold line lands at (-32, 32). */
const FLAP: Pt[] = [[-50, 32], [-32, 50], [-31, 31]];
const CRACK = 'M16 50L20 40L12 31L21 19L16 11';
const CRACK_LIP = 'M19 49L23 40L15 31L24 19';

export type PlateFaceProps = {
  old: boolean;
  /** Ink width in face units (world ink / scale). */
  W: number;
  seed: string;
  /** Emblem size (face units) and its old-style lean / cane / wobble (near plaque only). */
  emblem?: number;
  lean?: number;
  cane?: boolean;
  caneAt?: number;
  wob?: number;
  /** Misregistration of the plate fill (face units; false = none). */
  offset?: [number, number] | false;
  /** Screw dots (default true). */
  screws?: boolean;
};

/** The plate face nodes (draw inside the plate's transform). */
export function plateFace(p: PlateFaceProps): React.ReactNode[] {
  const {old, W, seed} = p;
  const out: React.ReactNode[] = [];
  if (old) {
    out.push(<Fill key="plate" d={polyPath(OLD_OUTLINE)} color={PLATE.oldFill} offset={p.offset ?? [2.4, 1.8]} seed={`${seed}/plate`} />);
    out.push(<Fill key="flap" d={polyPath(FLAP)} color={PLATE.oldBack} offset={false} mode="snap" seed={`${seed}/flap`} />);
    out.push(<Ink key="plateI" d={polyPath(OLD_OUTLINE) + polyPath(FLAP)} width={W} seed={`${seed}/pi`} />);
    out.push(<Ink key="crack" d={CRACK} width={W * 0.75} taper={false} seed={`${seed}/cr`} />);
    out.push(<Ink key="lip" d={CRACK_LIP} width={W * 0.4} color={PLATE.oldLine} taper={false} seed={`${seed}/crl`} />);
    if (p.screws !== false) out.push(<Fill key="screws" d={blob(-38, -38, 3.8, 3.8, {seed: `${seed}/s1`}) + blob(38, 38, 3.8, 3.8, {seed: `${seed}/s2`})} color={palette.ink} mode="snap" offset={false} seed={`${seed}/scr`} />);
  } else {
    const band = roundRect(-44, -44, 88, 88, 4) + roundRect(-35, -35, 70, 70, 3);
    out.push(<Fill key="plate" d={roundRect(-50, -50, 100, 100, 6)} color={PLATE.newFill} offset={p.offset ?? [2.4, 1.8]} seed={`${seed}/plate`} />);
    out.push(<Fill key="band" d={band} rule="evenodd" color={PLATE.band} offset={false} mode="snap" seed={`${seed}/band`} />);
    out.push(<Fill key="bevel" d={polyPath([[-50, -44], [-45, -44], [-45, 45], [44, 45], [44, 50], [-50, 50]])} color={palette.tan} mode="snap" offset={false} seed={`${seed}/bev`} />);
    out.push(<Ink key="plateI" d={rect(-50, -50, 100, 100, {seed: `${seed}/pi`, over: 5})} width={W} seed={`${seed}/pi`} />);
    if (p.screws !== false) out.push(<Fill key="screws" d={[[-46.5, -46.5], [46.5, 46.5], [-46.5, 46.5], [46.5, -46.5]].map(([a, c]) => blob(a, c, 3.2, 3.2, {seed: `${seed}/s${a}${c}`})).join('')} color={palette.ink} mode="snap" offset={false} seed={`${seed}/scr`} />);
  }
  const es = p.emblem ?? (old ? 74 : 60);
  const wob = p.wob ?? 0;
  out.push(
    <XG key="emb" m={mat.about(mat.rotate(wob * 0.5), 37.7 * (es / 100), 29.2 * (es / 100))}>
      <ElephantEmblem size={es} y={old ? 4 : 3} bg={old ? PLATE.oldFill : PLATE.newFill} color={old ? PLATE.oldLine : palette.ink} style={old ? 'old' : 'modern'} seed={`${seed}/e`} ink={W * 0.8} cane={old && p.cane} caneAt={p.caneAt} lean={(p.lean ?? 0) + wob} />
    </XG>,
  );
  return out;
}
