// V2S3 helper (lane L3): the shot's gentle PARALLAX float (DIRECTION rule 8, conform_L3 §1; lib/depth floatAt /
// parallaxOffset; S1's V2S1_float.tsx is the model). Home on the B match (12.98: M exact), two straight legs, home again
// by 14.50 so the A push-through into her (14.71-15.01) starts from rest with her head on (330, 742). Each plane shows
// its share of the float (V2S3_rig S3_PLANE): our towpath all of it, the boat and its water 0.85, the canal ~0.75, the
// terrace (her window, Pip on its railing) 0.6, the roofs 0.45, the far city 0.35, the sky and the captions nothing.
// Shadows and particles ride the group of the plane they lie on.
import React from 'react';
import {useTime} from '../../lib/time';
import {parallaxOffset} from '../../lib/depth';
import {s3Float} from './V2S3_rig';

/** One plane's group: translated by its share of the float (sub-pixel, never rounded); translate(0 0) at rest (the
 *  same tree every frame: nothing remounts when the float starts or stops). */
export const S3Plane: React.FC<{plane: number; children?: React.ReactNode}> = ({plane, children}) => {
  const t = useTime();
  const [dx, dy] = parallaxOffset(s3Float(t), plane);
  return <g transform={`translate(${dx.toFixed(3)} ${dy.toFixed(3)})`}>{children}</g>;
};
