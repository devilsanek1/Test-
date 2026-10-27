// src/v2r/kit/tiers.tsx: the v2r kits' ATTENTION-TIER wrappers (clean pen: src/v2r/pen.ts; the scopes and hooks:
// lib/tier.tsx; the spec: docs/look/CRAFT.md §b-§c, DIRECTION rule 2). Every kit export carries a DEFAULT tier, by story
// role, never by depth (each kit README, "Tiers"):
//   environment  canal / Arlington sets, buildings, water, towpath and furniture, far city, sky things, ambient life
//   support      the public, staff, Pip, boards and small lettered objects off their beat (thin same-hue lines where a
//                piece says `lines`: line-drawn figures and Pip)
//   subject      her (and whatever a scene promotes on its beat: <Ghost tier="subject">, <HerBoard tier="subject">)
// Resolution (lib/tier.tsx): an explicit `tier` prop > a scene's forced <Tier tier=...> > the piece's default.
//
//   tiered(def, opts, Body)     a piece whose nested kit pieces keep THEIR defaults (a set: her slot stays the subject,
//                               Pip stays support, inside an environment set)
//   tieredAll(def, opts, Body)  a figure built from other tiered pieces (Her draws a Person; Movers draw K4 people): its
//                               resolved tier is forced on everything it draws, so the whole figure has ONE tier
import React from 'react';
import {tiered, Tier, TierPart, useTierScope} from '../../lib/tier';
import type {Tier as TierName, TierProps} from '../../lib/tier';

export {tiered, Tier, TierPart, useTierHere, useTierScope, useTierLine, useTierPaint, useTierMotion} from '../../lib/tier';
export type {TierProps, TierName};

export type TierOpts<P> = {
  /** The piece's main colour: its lines are its own shade (never near-black). */
  tone?: string | ((p: P) => string | undefined);
  /** What its calmer fills are pulled toward (default: inherited, then the pen's sky). */
  bg?: string;
  /** Draw its tier's thin tinted lines (support / environment draw none by default). */
  lines?: boolean;
};

/** A set's SLOT (lane content placed inside a kit set: her and the row on the towpath, Pip, a board, the people behind a
 *  door, a story overlay): drawn as untagged content (support, with its thin tinted lines), never inheriting the set's
 *  environment (where its lines would vanish); kit pieces in it keep their own defaults; a scene's forced <Tier> still
 *  wins. */
export const Slot: React.FC<{tier?: TierName; children?: React.ReactNode}> = ({tier, children}) => (
  <TierPart def="support" tier={tier} lines>
    {children}
  </TierPart>
);

/** Like lib/tier's tiered(), but the resolved tier is FORCED on everything the piece draws (one tier per figure). */
export function tieredAll<P extends object>(def: TierName | ((p: P) => TierName), opts: TierOpts<P>, C: React.FC<P>): React.FC<P & TierProps> {
  const Held: React.FC<P> = (p) => {
    const s = useTierScope();
    if (!s) return <C {...p} />;
    return (
      <Tier tier={s.tier} tone={s.tone} bg={s.bg} lines={s.lines}>
        <C {...p} />
      </Tier>
    );
  };
  Held.displayName = C.displayName ?? C.name ?? 'piece';
  return tiered(def, opts, Held);
}
