// v7_s1: the particles (paint_s1's S1Particles, cut): the far flock (the painted sprite), the far motes in the low sun's
// air and the plane leaves blowing in from the tree off-frame left (the canopy whose shade lies on our bank: their
// caster, born from 1.2 s). The near motes are cut with the bay tree they floated past (v6's lone pale speck over our
// bank at 1.0 s; DIRECTION rule 4: no specks).
import React from 'react';
import {Particles} from '../../lib/particles';
import {PaintedLayer} from '../../lib/paint';
import {S1Plane, S1_PLANE} from '../paint_s1/V2S1_float';
import {S1_PARTICLE_FIELDS} from '../paint_s1/V2S1_particles';

const FIELDS = S1_PARTICLE_FIELDS.filter((q) => q.f.seed !== 's1motesNear101');

export const V7Particles: React.FC = () => (
  <>
    <S1Plane plane={S1_PLANE.sky} texture={false}>
      <PaintedLayer piece="flock" />
    </S1Plane>
    {FIELDS.map(({plane, f}) => (
      <S1Plane key={f.seed} plane={plane} texture={false}>
        <Particles {...f} />
      </S1Plane>
    ))}
  </>
);
