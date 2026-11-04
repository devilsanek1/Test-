// v7_s1: HER in look 'v7', drawn by the people overhaul the owner put IN USE (2026-10-30: "I think it is a bit better
// overall I think yes let's go with that for now"; "Let's do open eyes"; PEOPLE_DESIGN.md's top): hair v4 on the v4
// head with OPEN EYES looking away, on the rebuilt body (people_v4 skel5 / hand5 / body5, assembled by
// hair_v4/asm_bodies.ts person6, as src/entry-look-people-bodies4.tsx does). Her evening look (N1: the long open coat
// over the light column, the copper long layers), walking west out of the lit doorway in profile (the walk's contact,
// the arms against the legs), her hair settled into the evening breeze from the west plus her own headwind (as the hair
// round's dusk still placed her: breeze [520, -60] + 540 for a walker), so it trails and lifts, never one firm shape.
// ~152 px tall at the door (v2's size: playbook DEPTH AND SCALE FROM A HUMAN VIEWPOINT). Crisp, never painted, never
// keyed (lib/tod's map touches <Fill>s only); her light is movers.tsx's live layers (the sun's rim on her front, the
// lit opening's wrap, her backlit shade, the pool with her shadows cut). The SVG string is built per instance with its
// own ids, because lib/light2 draws her several times (shade, rims, wrap, shadow cut, grain).
import React, {useId, useMemo} from 'react';
import {CAST6, person6, type Built6} from '../people_dirs/hair_v4/asm_bodies';
import {placeSvg} from '../people_dirs/hair_v4/asm_render';
import {walk5} from '../people_dirs/people_v4/skel5';

/** Her drawn height at the door (px, crown to sole; v6 and v7a's her 153). */
export const HER_V7_H = 152;
/** The walk's phase (0 = her right heel strikes in front): the contact, the stride open (the sheets' walking profile). */
const PHASE = 0.1;
/** The breeze her hair has settled into (figure units a second, screen axes): the evening air from the west (screen-left)
 *  and a touch up, plus her own headwind as she walks west (the hair round's dusk still: 520 + 540 for a walker; a
 *  little more here, the canal's open air). The rig moves what it lets move (the far curtain, the loose lock); the cut
 *  stays the owner's kept hair v4. */
const BREEZE: [number, number] = [1600, -120];

const CACHE = new Map<number, Built6>();
/** Her parts at a drawn height (the head's detail ladder reads it); deterministic, cached. */
function herParts(px: number): Built6 {
  const k = Math.round(px * 10);
  let b = CACHE.get(k);
  if (!b) {
    b = person6(CAST6.her, {pose: walk5('f', PHASE), yaw: -90, px, eyes: 'open', breeze: BREEZE, contact: {color: '#1A1226', opacity: 0.34}});
    CACHE.set(k, b);
  }
  return b;
}

export const V7Her: React.FC<{x: number; feetY: number; h?: number; shadow?: boolean}> = ({x, feetY, h = HER_V7_H, shadow = true}) => {
  const uid = 'v7her' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const svg = useMemo(() => placeSvg(herParts(h).parts, uid, x, feetY, h, {shadow}), [uid, x, feetY, h, shadow]);
  return <g dangerouslySetInnerHTML={{__html: svg}} />;
};
