# For the production sessions: the look test's new engine pieces (2026-10-29)

All opt-in: no existing export changed its default, and every lane proved the shipped films unchanged (Film2R-V2S1 and
Film3 at several frames, 0 differing pixels; `npm run typecheck` clean). No new npm dependency. They implement the
owner's decisions from the city-poster study (DIRECTION, CRAFT, LAYOUT), first judged in the look test
(`video/deliverables/tests/poster_look_test_v1.mp4`); a film uses them from its W1/G3 on, once the owner has judged the
test. The APIs and their numbers are in this folder's notes.

| Piece | File | What it gives you | Notes |
|---|---|---|---|
| Depth by 1/z | `src/lib/depth.ts` | a 1/z parallax table with a 1.8x neighbour lint, a +5 ghost step (k 0.87), the near group's floor, `anchorTones` for the far scale anchor | `ENGINE.md` |
| Gamut | `src/lib/gamut.ts` (new) | a gamut mask, calm lights, seeded sibling tints per role | `ENGINE.md` |
| Light per tier | `src/lib/light.tsx` | `FormShade` strength per tier (A 0.56, B and C 0.20), `tierFormFor(surface, base, dL)` | `ENGINE.md` |
| No outlines | `src/lib/pen.ts` | `setPen({outlines: false, lineMin: 2})`: the no-outline look, 2 px minimum on floating layers | `ENGINE.md` |
| Patchwork | `src/lib/patchwork.ts` (new) | a seeded guillotine split via `groundCam` / `twoPointCam` / `viaQuad`, `frontalBlocks` for the far city | `ENGINE_PT.md` |
| Texture | `src/lib/texture.tsx` (new) | `<Mottle>` per plane (feTurbulence, static, locked to its plane), `mottleSeed(plane)`; `scripts/qa/check_banding.py --texture` | `ENGINE_PT.md` (rotated or scaled groups soften ~1 px inside the filter: keep them out of it) |
| Nature | `src/lib/foliage.tsx`, `wind.ts`, `clouds.tsx` (new) | a faceted tree crown with leaf edges and a spray, one wind (transforms only), a hero cumulus | `ENGINE_NATURE.md` |
| Far stage | `src/lib/persp.tsx` | `farStage`, `splitStages` (a second horizon for the designed view) | `SCENE.md` |

The scene itself (`src/look/poster_s1/`, entry `src/entry-look-poster.tsx`) is a look test, not a film: copy from it,
never import it (each film draws its own world).
