// S03's elephant stamp print (fix round 1: the set's ElephantStamp is cream-on-cream line art that Pip hides; at phone
// size only its tan ring read, like a manhole cover). Scene-owned stand-in until the sets lane re-draws the print:
// a FLAT SOLID tealDark print filling the whole 320 x 120 ellipse (BLUEPRINT.stamp), a cream border ring inset, the
// elephant reversed out in cream (facing LEFT, so its trunk, ear and legs stay clear of Pip on its rump at the right
// end), and a 3 px misregistered ink outline. Same slam as the set: the ink ring draws (0.13 s), then the print lands
// 2.6x -> 1.0x (0.27 s), from `slamAt`.
//   <StampS03 slamAt={b.stamp} />   (in the set's 'ground' layer; pass stampAt={false} to BlueprintStreet)

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {ellipse} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {BLUEPRINT} from '../shared/sets';
import {ElephantEmblem} from '../shared/props';

const S = BLUEPRINT.stamp; // (330, 1400) rx 160 ry 60
const ell = (rx: number, ry: number) => `M${S.x - rx} ${S.y}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
/** The border ring (cream) inset 11 px, 4.5 px wide (both radii scaled by the ellipse's squash). */
const SQ = S.ry / S.rx;
const BORDER = ell(S.rx - 11, S.ry - 11 * SQ * 1.4) + ell(S.rx - 15.5, S.ry - 15.5 * SQ * 1.4);

/** The print's slam scale at t (1 when printed; null before the print lands). */
export function stampK(t: number, slamAt: number): number | null {
  const printAt = slamAt + 0.13;
  if (t < printAt) return null;
  return lerp(2.6, 1, E.inOutCubic(prog(t, printAt, 0.27)));
}

export const StampS03: React.FC<{slamAt: number; seed?: string}> = ({slamAt, seed = 's03/stamp'}) => {
  const t = useTime();
  if (t < slamAt) return null;
  const k = stampK(t, slamAt);
  return (
    <>
      {k !== null ? (
        <XG m={mat.about(mat.scale(k), S.x, S.y)}>
          <Fill d={ell(S.rx, S.ry)} color={palette.tealDark} offset={[3, 2]} mode="none" seed={`${seed}/print`} />
          <Fill d={BORDER} rule="evenodd" color={palette.cream} offset={[3, 2]} mode="none" seed={`${seed}/border`} />
          {/* the elephant reversed out of the print: cream body, carved in the print's tealDark; facing left */}
          <XG m={mat.compose(mat.translate(S.x + 3, S.y + 4), mat.scale(-1, SQ * 1.18), mat.translate(-S.x, -S.y))}>
            <ElephantEmblem x={S.x} y={S.y} size={S.rx * 1.42} mode="line" bg={palette.cream} color={palette.tealDark} ink={5} seed={`${seed}/e`} />
          </XG>
        </XG>
      ) : null}
      <Ink d={ellipse(S.x, S.y, S.rx + 2, S.ry + 2, {seed: `${seed}/ri`, overlap: 18})} at={slamAt} dur={0.13} width={3} taper={false} seed={`${seed}/ri`} />
    </>
  );
};
