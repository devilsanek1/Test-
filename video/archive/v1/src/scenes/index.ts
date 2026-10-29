// Scene registry: id -> component, AUTO-DISCOVERED (no shared file to edit).
// Drop a file named src/scenes/SceneNN.tsx (or SNN.tsx) that `export default`s a React.FC (or exports `Scene`)
// and it is registered as id "SNN" (e.g. Scene07.tsx -> "S07"; Scene07b.tsx -> "S07b").
// Optional: `export const Wiper: React.FC<WiperProps>` = this scene's foreground element for a
// {type: 'foreground-wipe', element: 'scene'} transition OUT of it.
// Ids in src/data/scenes.json without a file render a "missing scene" placeholder.
import React from 'react';
import type {WiperProps} from '../lib/Film';

type SceneModule = {default?: React.FC; Scene?: React.FC; Wiper?: React.FC<WiperProps>; [k: string]: unknown};
type Ctx = {keys(): string[]; (key: string): SceneModule};

// webpack require.context (resolved at bundle time). Typed loosely so tsc accepts it.
const ctx: Ctx = (require as unknown as {context: (dir: string, deep: boolean, re: RegExp) => Ctx}).context('./', false, /^\.\/(Scene|S)\d+[a-z]?\.tsx$/);

const pick = (m: SceneModule): React.FC | undefined => {
  if (typeof m.default === 'function') return m.default;
  if (typeof m.Scene === 'function') return m.Scene;
  const fn = Object.entries(m).find(([k, v]) => k !== 'Wiper' && typeof v === 'function');
  return fn?.[1] as React.FC | undefined;
};

export const sceneComponents: Record<string, React.FC> = {};
export const sceneWipers: Record<string, React.FC<WiperProps>> = {};
for (const key of ctx.keys()) {
  const m = key.match(/^\.\/(?:Scene|S)(\d+[a-z]?)\.tsx$/);
  if (!m) continue;
  const mod = ctx(key);
  const comp = pick(mod);
  if (comp) sceneComponents[`S${m[1]}`] = comp;
  if (typeof mod.Wiper === 'function') sceneWipers[`S${m[1]}`] = mod.Wiper;
}
