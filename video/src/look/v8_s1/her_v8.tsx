// v8_s1: HER, the people overhaul the owner put IN USE (2026-10-30: hair v4, the redrawn faces with OPEN EYES looking
// away, the rebuilt bodies; PEOPLE_DESIGN.md's top), as src/look/v7_s1/her_v7.tsx draws her (person6 from
// hair_v4/asm_bodies.ts on people_v4 skel5 / hand5 / body5), now MIRRORED to walk screen-right, out of the lobby toward
// the canal and the low sun (paint_test/v8_card.md): her evening look (the long open coat over the light column, the
// copper long layers), mid-stride a few steps out of the door, her chin lifted toward the light, her hair and coat taken
// by the breeze off the water. The figure is built facing screen-left (its own key upper left), then flipped, so its own
// modelling keys from the upper right: the sun's side. Crisp, never painted, never keyed; her light is the scene's live
// layers (V8Scene.tsx: the sun's rim, the lobby's wrap, her backlit shade, the paper). The SVG string is built per
// instance with its own ids, because lib/light2 draws her several times.
import React, {useId, useMemo} from 'react';
import {CAST6, person6, type Built6} from '../people_dirs/hair_v4/asm_bodies';
import {placeSvg, type P5} from '../people_dirs/hair_v4/asm_render';
import {walk5, type Pose5} from '../people_dirs/people_v4/skel5';

export type HerPose = {
  /** the camera's yaw on her body before the flip (-90 = profile; a little more toward 0 turns her front to us) */
  yaw: number;
  /** the walk's phase (0 = the heel strikes in front) */
  phase: number;
  /** the head's pitch (degrees; positive lifts the chin) and its yaw on the neck */
  headPitch: number;
  headYaw: number;
  /** the breeze in her hair (figure units a second, in the unflipped figure: + x blows toward her back) */
  breeze: [number, number];
  /** the gust off the water: how far (figure units, unflipped: + x is toward her back) the hanging hair's tips and the
   *  coat's hem are swept back, and how much the tips lift */
  gust: {hair: number; lift: number; coat: number};
};

/** The delivered pose: mid-stride toward the light, her chin up, the breeze off the water in her hair. */
export const HER_V8: HerPose = {yaw: -76, phase: 0.92, headPitch: 5, headYaw: 6, breeze: [2100, -260], gust: {hair: 92, lift: 34, coat: 62}};

/** THE GUST (v8): the v4 hair rig answers a breeze only in its far curtain in profile (paint_test/NOTES.md "v7"), so the
 *  wind off the water is laid on the drawing itself: every point of the hanging hair and of the coat's panels moves back
 *  by a smooth amount that grows with its height below the root (the head's jaw for the hair, the waist for the coat),
 *  the hair's tips lifting a little; every path of those parts moves together (its fill, its shading regions, the casts
 *  it carries), so the modelling stays attached. Figure units: y 0 at the crown, 1000 at the sole, x toward her back. */
const sweepD = (d: string, f: (x: number, y: number) => [number, number]): string => {
  const nums = d.match(/-?\d*\.?\d+(?:e-?\d+)?/g);
  if (!nums || /[aA]/.test(d)) return d;
  let i = 0;
  let px = 0;
  const out: string[] = [];
  return d.replace(/-?\d*\.?\d+(?:e-?\d+)?/g, (m) => {
    const v = parseFloat(m);
    if (i % 2 === 0) {
      px = v;
      i++;
      return '\u0000';
    }
    i++;
    const [nx, ny] = f(px, v);
    out.push(`${Math.round(nx * 100) / 100} ${Math.round(ny * 100) / 100}`);
    return '\u0001';
  }).replace(/\u0000[\s,]*\u0001/g, () => out.shift() ?? '0 0');
};
const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
function gust(parts: P5[], g: HerPose['gust']): P5[] {
  const hairF = (x: number, y: number): [number, number] => {
    const t = smooth(95, 470, y);
    return [x + g.hair * Math.pow(t, 1.25), y - g.lift * t * t];
  };
  const coatF = (x: number, y: number): [number, number] => {
    const t = smooth(430, 900, y);
    return [x + g.coat * Math.pow(t, 1.5), y - 0.12 * g.coat * t * t];
  };
  return parts.map((p) => {
    const f = p.role === 'hair' ? hairF : /^outer-/.test(p.name) ? coatF : null;
    if (!f) return p;
    return {
      ...p,
      d: sweepD(p.d, f),
      regions: p.regions?.map((r) => ({...r, d: sweepD(r.d, f)})),
      casts: p.casts?.map((c) => ({...c, ds: c.ds.map((dd) => sweepD(dd, f))})),
    };
  });
}

const CACHE = new Map<string, Built6>();
function herParts(px: number, p: HerPose): Built6 {
  const k = `${Math.round(px * 10)}|${p.yaw}|${p.phase}|${p.headPitch}|${p.headYaw}|${p.breeze.join(',')}|${p.gust.hair},${p.gust.lift},${p.gust.coat}`;
  let b = CACHE.get(k);
  if (!b) {
    const pose: Pose5 = walk5('f', p.phase);
    pose.head = {...pose.head, pitch: p.headPitch, yaw: p.headYaw};
    const built = person6(CAST6.her, {pose, yaw: p.yaw, px, eyes: 'open', breeze: p.breeze, contact: {color: '#2A1C30', opacity: 0.3}});
    b = {...built, parts: gust(built.parts, p.gust)};
    CACHE.set(k, b);
  }
  return b;
}

export const V8Her: React.FC<{x: number; feetY: number; h: number; pose?: HerPose; shadow?: boolean}> = ({x, feetY, h, pose = HER_V8, shadow = true}) => {
  const uid = 'v8her' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const svg = useMemo(() => placeSvg(herParts(h, pose).parts, uid, x, feetY, h, {shadow, flip: true}), [uid, x, feetY, h, pose, shadow]);
  return <g dangerouslySetInnerHTML={{__html: svg}} />;
};
