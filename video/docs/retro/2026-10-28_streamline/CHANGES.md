# What the streamlining's Phase 1 changed for production (2026-10-29 to 11-04)

For whoever makes the next film, here or in the new studio repo. The owner's condition held throughout: "we MUST not
sacrifice the quality of the video, we MUST not sacrifice the details and overall look and feel". No frame changed:
the delivered v2r G7 master re-renders **byte for byte** with the new scripts (MD5 `cfe247ee...`). The proofs: `phase1_render.md`, `phase1_codebase.md`, `phase1_meter.md`, `phase1_docs.md` (this folder).

## Do differently
- **Gate videos (the G4 clip, the G5-G7 cuts) in one command, never the bare CLI:**
  `node scripts/render-media.mjs FilmN deliverables/vN/<name>.mp4 --entry=src/entry-vN-film.tsx --master --parallel`.
  The master's encode, 3 chunks cut on the film's scene boundaries, joined and checked frame by frame, the audio
  muxed once (bit-identical to a one-step render's). v2r: 5:03 instead of 6:11; v3's old chunked recipe took 63 min +
  26 min of audio. `npx remotion render` writes JPEG q80 frames at CRF 18, which band a sky.
- **The posted master stays one step:** `render-media.mjs ... --master` (no `--parallel`).
- **A lane clip** (one shot, 0.25-0.5 scale): one step, `node scripts/render-media.mjs FilmN-<ID> /tmp/x.mp4 $E
  --scale=0.5` (`--parallel` gains nothing on a short clip with 4 cores).
- **Typecheck:** `npm run typecheck` (the pinned TypeScript), never `npx tsc` (it fetches another TypeScript and prints
  thousands of false errors).
- **The spend:** `python3 video/scripts/ops/status.py --film vN` (one screen: commits, gate table, open items, spend;
  0.4 s, no agent) or `python3 video/docs/retro/spend.py --since 2h`. Label agents `vN G<n> role: what`. Figures from
  the old meter (v1's "12.5 B tokens") are about 2.4x too high.
- **After a usage limit:** the session arms an hourly self check-in while agents are in flight; it resumes them once
  the limit resets and deletes itself when nothing is left (playbook, Process).

## Faster, same pixels
- `still.sh`, `sheet.sh`, `render-frames.mjs`: the bundle is cached until `src/`, `public/` or the lockfile change,
  and one browser serves a call. A still ~1.5 s (was ~4 s), a contact sheet with its caption check 3-4 s (was 8-10 s).
  `RENDER_BUNDLE_CACHE=0` or `--no-cache` turns it off; the cache keeps 3 bundles (~225 MB) in `$TMPDIR/render-bundles`.
- `sheet.sh --props=...` now checks the captions too (drop the old `--no-capcheck` workaround).
- `strip.sh` works on the films again (pass `$E`) and shows EVERY frame at 60 fps (it showed every 2nd).
- `render-frames.mjs` takes ranges: `0.5:1.0` is every frame from 0.5 s to 1.0 s.
- Without `--entry`, the tools find the one `src/entry-*.tsx` that registers the composition, or name the candidates.
- The CLI (`npx remotion still/render`) no longer uses the slow software GL (`swangle`): its frames equal the scripts'.

## Where things went
- `video/src` holds only live code: v1 is in `video/archive/v1/`, v2's first try in `video/archive/v2-first/`, v3's
  unused G5b panels in `video/archive/v3/`; v1's docs in `video/docs/v1/`; `docs/CINE.md` is `docs/CINE_KIT.md`.
- An old film re-renders at its commit: v1 `76c166c1`, v2's first try `56f905df`, v3 `79e956c3`
  (`git worktree add --detach /tmp/v1 76c166c1 && cd /tmp/v1/video && npm ci`). The tags (`v1-final`, `v2-first`,
  `v3-final`) exist locally only: pushing them was refused (HTTP 403).
- Find a tool: `video/scripts/README.md` (one line per tool; `python3 -I video/scripts/index.py` regenerates it).
- After moving files: `python3 -I video/scripts/ops/linkcheck.py --git <base>` lists every stale reference.

## Watch
- QA tools with `--t0` and no `--scenes` used v1's cut list; now they detect cuts. Pass `--scenes
  src/<film>/film/scenes.json` (the gate docs do). `beatsync.py` needs `--cuts`.
- A frame diff can show a few pixels on a 256-px raster tile seam with no change at all (Chrome's tiles; up to 0.08 %
  at 0.35 scale), and one master run on a busy box once failed to reproduce. Test on an idle box against two runs of the
  old code before calling a change pixel-neutral.
- `scripts/v2/coldread_sheet.py` no longer runs (it was wired to v2's first-try entry, now archived).

## Not done (PLAN.md Phases 2-3, each needs the owner's yes and a quality test)
Masters on Remotion's own Chrome (-40 %) or across 3 browsers (-55 %); closed-list reviews and a one-command QA pack;
short sessions; per-gate briefs; a new film from a template; the light layers' blend cost; a scene-level render cache.
