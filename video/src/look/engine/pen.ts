// The engine demos' pen (imported FIRST by src/entry-look-engine.tsx): the tiered clean pen, as v2r sets it, with the
// 10b sky as the ground calmer fills are pulled toward. The demos' own bundle only: no film imports this.
import {setPenMode} from '../../lib/sketch';
import {setPen} from '../../lib/pen';

setPenMode('clean');
setPen('clean', {bg: '#C5DDD3', untagged: 'support', untaggedLines: true, tiers: {support: {chromaMax: 25}}});
