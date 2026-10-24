// Scene registry: id -> component, AUTO-DISCOVERED (no shared file to edit).
// Drop a file named src/scenes/SceneNN.tsx (or SNN.tsx) that `export default`s a React.FC (or exports `Scene`)
// and it is registered as id "SNN" (e.g. Scene07.tsx -> "S07"; Scene07b.tsx -> "S07b").
// Ids in src/data/scenes.json without a file render a "missing scene" placeholder.
import React from 'react';

type SceneModule = {default?: React.FC; Scene?: React.FC; [k: string]: unknown};
type Ctx = {keys(): string[]; (key: string): SceneModule};

// webpack require.context (resolved at bundle time). Typed loosely so tsc accepts it.
const ctx: Ctx = (require as unknown as {context: (dir: string, deep: boolean, re: RegExp) => Ctx}).context('./', false, /^\.\/(Scene|S)\d+[a-z]?\.tsx$/);

const pick = (m: SceneModule): React.FC | undefined => {
  if (typeof m.default === 'function') return m.default;
  if (typeof m.Scene === 'function') return m.Scene;
  const fn = Object.values(m).find((v) => typeof v === 'function');
  return fn as React.FC | undefined;
};

export const sceneComponents: Record<string, React.FC> = {};
for (const key of ctx.keys()) {
  const m = key.match(/^\.\/(?:Scene|S)(\d+[a-z]?)\.tsx$/);
  if (!m) continue;
  const comp = pick(ctx(key));
  if (comp) sceneComponents[`S${m[1]}`] = comp;
}
