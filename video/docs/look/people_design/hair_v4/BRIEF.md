# Hair, overhaul (v4): designed shapes on a 2D rig (the shared brief, 2026-10-30)

**The owner, verbatim, on v3** (after v2 was "incoherent ... like a person woke up"): "Nope not good enough we need to
overhaul the hair I'm not convinced it's going to be animated properly it's not looking clean at all looks like garbage
and not appealing or clean". The playbook now (`video/docs/OWNER_PLAYBOOK.md`, Visual style, the hair bullet): hair is
a little messy INSIDE A PROPER, STYLISH, CLEAN HAIRCUT, and "BUILT TO ANIMATE and drawn CLEAN: a few smooth, designed
shapes (no facets, no jagged tips, no scatter of small locks), layered back / cap / front like a 2D cut-out rig, the
hanging pieces on bone chains with spring physics, so the same clean shapes bend and settle in motion; proven with
motion strips (frames of a turn, a walk, a breeze) beside the stills".

**Why v2 and v3 failed (the orchestrator's read):** the outlines were already smooth splines; the failure is the
METHOD. A program generated the locks from parameters (ribbons hung on a dome, the bend rule, waves), so nothing was
ever DESIGNED the way an illustrator designs a haircut, and nothing was rigged the way a 2D animator rigs one. v4
replaces the method: each cut is drawn as a few authored shapes (cubic Béziers with few, deliberate control points;
the hairline, the parting and the crown wrapping the skull with volume; one shadow shape and one highlight, authored),
then those exact shapes are bound to a rig (the cap rigid on the head; each hanging piece skinned to a chain of 4-6
bones; the chains simulated with springs: gravity, wind, inertia from the head and body), so motion bends the designed
shapes and never regenerates them.

**The references** (`../refs_hair_2026-10-30/`, its README; the owner's crop of v2 `owner_note_v2_after_incoherent.jpg`)
and the v3 comparison sheets (`../hair_v2/stills/08_refs_vs_v2.png`, `09_refs_vs_v3.png`). The look we live in: direction
C (flat two-tone shapes, no outlines, crisp; people near the story lit per `CRAFT.md` §d.8) with the LASH face; the
faces are being redesigned in parallel (`../faces_v2/`): build on the current heads; the hair attaches to the skull's
frame so a new face drops in.

**This is an ITERATION** (two agents at a time at most; no panel, no critic; stills and motion STRIPS (frames laid out
on one image), never a video file yet; the orchestrator looks at the result beside the references before the owner
does). Quality over quantity: 6 excellent cuts beat 12 average ones.

**Every agent:** writes its file from its FIRST step and updates it as it goes; returns at most 3 short lines; never runs
a git command that changes the index or history; code only in `video/src/look/people_dirs/hair_v4/` (new) and a new
`video/src/entry-look-people-hair4.tsx`, reading the rest; never `video/public`, `video/out`; starts no agents (if it
ever does, at max effort); cites a source (URL) for research claims with strength (a studio's or a tool's own
documentation; a pro artist's course or book; a practitioner's tutorial); never bbc.co.uk. WebFetch may be missing:
curl through the proxy. Renders one at a time (`node scripts/render-frames.mjs <Comp> <outDir> 0[,t2,...]
--entry=src/entry-look-people-hair4.tsx --concurrency=1`, from `video/`; ~25 s each, more frames share the bundle).

## The owner's latest (2026-10-30 ~18:10 UTC): ref 03's bob beside our v3 W1, no words
The owner sent a crop of the v3 comparison sheet: the students' girl (ref 03, her bob) beside our v3 W1, and nothing else
(`../refs_hair_2026-10-30/owner_note_ref03_bob_vs_v3.jpg`). Read as THE BAR and the size of the gap. Her hair: real
VOLUME around the skull, a jaw-length bob whose hem turns OUT in a few big flips, two thin placed arcs (flyaways), one
broad S through the mass, flat colour with a soft shadow and a RIM / gloss of light that makes it read glossy and
premium; her face: delicate, appealing, alive. Ours: small, flat, plain, a dome with a cut line, a blank face. Every cut
must reach that level of appeal in our own clean style; the assembled stills put ref 03 beside our bob again, and the
orchestrator judges them side by side before the owner sees anything. (Her face there has open eyes looking away; our
faces keep the closed-eye LASH unless the owner says otherwise: show one "open eyes, looking away, never at us" variant
of her head beside LASH in the final stills so the owner can choose.)
