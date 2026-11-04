// palette_check.ts: palette_v7's checks as JSON for check_v7.py (bundled by esbuild for node: the clean pen set first,
// as every v2r entry does, so forTier and the tier calm are the frame's). Prints {problems, roles}.
import '../../../v2r/palette';
import {lch} from '../../../lib/light';
import {CM_V2} from '../../paint_s1/palette_10b';
import {ACCENT_V7, V7_BG, keyV7, problems, shownV7} from '../palette_v7';
import {PEN} from '../../../lib/pen';

PEN.bg = V7_BG;
const roles: Record<string, unknown> = {};
for (const [role, v] of Object.entries(CM_V2)) {
  if (typeof v !== 'string' || !v.startsWith('#')) continue;
  const k = keyV7(v);
  const s = shownV7(v);
  const c = lch(s);
  roles[role] = {v2: v, v7: k, shown: s, L: +c.L.toFixed(1), C: +c.C.toFixed(1), h: +c.h.toFixed(0)};
}
const a = lch(ACCENT_V7.lamp);
console.log(JSON.stringify({problems: problems(), accent: {hex: ACCENT_V7.lamp, L: +a.L.toFixed(1), C: +a.C.toFixed(1), h: +a.h.toFixed(0)}, roles}));
