// V2S4_light.tsx (lane L3): the shot's LIGHT LAYERS under RIG_CANAL (docs/look/CRAFT.md §d, THROUGHLINE §5, conform_L3
// §2, lib/LIGHT.md; S1's V2S1_light.tsx and S3's V2S3_light.tsx are the models). The key is SUN1, low at screen left
// (sunLight toward 15, el 36, casts capped at 0.8 h, the ground flattened 0.28): shadows fall right and a little toward
// us. Every shape is a flat multiply step of the film's ONE tint family (rigs.ts TINT_CANAL; on the water its `water`
// tint) or a flat lighter step; nothing here draws outside V2S4.tsx's <Lit rig={RIG_CANAL}>, and `{"lightOff": true}`
// turns it all off (check_light's A side). Each layer is drawn INSIDE the group of the plane it lies on (shadows ride
// their plane: the backs 0.6x, the towpath 1.0x, the boat and Pip screen-fixed with our boat's bob, hers with her).
//   S4BacksShades   the backs (+1): the planes turned from the sun (the back extensions' east returns, the dormers' east
//                   cheeks) one Shade step; the stacks a form step on their east side
//   S4Ground        her towpath (0): contact + cast shadows of everything standing on it (one ShadowLayer)
//   S4FormShades    form steps on the towpath's round and boxy things (FormShade on the side away from the sun)
//   S4RoofShadows   our boat's roof (-1): contact + casts of the roof's things, Pip's contact
import React from 'react';
import {CastShadow, ContactShadow, FormShade, Shade, ShadowLayer} from '../../lib/light';

/** The backs' shade shapes (plane px; V2S4_wbacks BACKS_SHADES): one Shade step on the planes turned from the sun, a
 *  form step on each stack (its east side). */
export const S4BacksShades: React.FC<{form: string[]; stacks: string[]}> = ({form, stacks}) => (
  <>
    {form.length ? <Shade d={form.join('')} /> : null}
    {stacks.map((d, i) => (
      <FormShade key={i} d={d} />
    ))}
  </>
);

/** One standing thing's ground shadows: contact under its footprint (x centre, y foot, w footprint width) and a cast
 *  along the light (h its height; `w2` the cast's width, default the footprint's). */
export type Stander = {x: number; y: number; w: number; h: number; w2?: number; k?: number; person?: boolean};

/** A ground's shadows (one isolated multiply layer: no double-darkening where casts overlap). */
export const S4Ground: React.FC<{things: Stander[]}> = ({things}) => (
  <ShadowLayer>
    {things.map((s, i) => (
      <React.Fragment key={i}>
        <ContactShadow x={s.x} y={s.y} w={s.w} k={s.k ?? (s.person ? 1.2 : 1.1)} />
        {s.h > 0 ? <CastShadow x={s.x} y={s.y} w={s.w2 ?? s.w * 0.8} h={s.h} /> : null}
      </React.Fragment>
    ))}
  </ShadowLayer>
);

/** Form steps (the side away from the sun) on things given by their silhouette path. */
export const S4FormShades: React.FC<{ds: string[]}> = ({ds}) => (
  <>
    {ds.map((d, i) => (
      <FormShade key={i} d={d} />
    ))}
  </>
);
