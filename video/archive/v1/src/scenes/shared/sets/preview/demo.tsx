// Demo helpers for the sets preview / catalog (World sky + a sun behind the set).
import React from 'react';
import {World} from '../../../../lib/World';
import {Sun, PowerSymbol} from '../../../../lib/Sun';
import {skies, TodName} from '../../../../lib/theme';

/** A simple S01-like demo: World sky + sun with the bold power glyph behind the set. `tod` relights the set the way a
 *  scene's World does (golden = the day sky + one-step-warmer light fields: mintPale -> cream, cream -> peach). */
export const DemoWorld: React.FC<{sky?: string; tod?: TodName; push?: boolean; children?: React.ReactNode}> = ({sky, tod, push, children}) => (
  <World sky={sky ?? (tod ? [{t: -1, tod}] : skies.day)} tod={tod} push={push ? {to: 1.04, dur: 2.2, anchor: [560, 980]} : undefined}>
    {children}
  </World>
);

/** The demo sun sits PINNED in its slot (no idle drift), so a preview frame shows the set's sun anchor exactly. */
export const DemoSun: React.FC<{cx: number; cy: number; r: number; glyph?: boolean}> = ({cx, cy, r, glyph}) => (
  <Sun cx={cx} cy={cy} r={r} drift={[0, 0]}>
    {glyph ? <PowerSymbol r={r * 0.37} color="#F3E0CB" width={10} /> : null}
  </Sun>
);
