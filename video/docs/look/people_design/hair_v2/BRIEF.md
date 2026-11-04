# People, iteration 2: hair, proportions, stature (the shared brief, 2026-10-30)

**The owner, verbatim:** "So we previously made a recipe and a detailed research and the update to people figures / We
need to iterate on it more and improve the hair and the proportions and stature / I will send you more references when
it come to hair it's never really static or like one firm it's always a little messy, unstructured wavy / Research the
haircuts and the physics of hair and let's make sure it's the most pleasant and modern recipe we have". The five
references and what we take from each: `../refs_hair_2026-10-30/README.md` (look at the images). More hair references
will come; the recipe must be easy to extend.

**Where we start:** direction C, MODERN GRAPHIC, with the LASH face, in use for now (`video/docs/look/PEOPLE_DESIGN.md`:
its status block, §5.1 proportions, §5.4 the hair library, §5.7 poses, §5.9 motion notes; `../dir_graphic.md`;
`../fashion.md`; `../design_research.md`; `../faces_graphic.md`). The code: `video/src/look/people_dirs/graphic/`
(`hair.ts` draws each style as one flat polygon mass with a sheen band; `body.ts`, `rig.ts` the proportions and poses;
`Sheet.tsx`, `Test.tsx` the stills) and `graphic_faces/` (LASH). The current her, rendered: `baseline_her.png` here
(three views): the hair is one firm, straight polygon with a scalloped hem; the stance is upright and stiff.

**The rules that bind (the owner's words win):** the playbook (`video/docs/OWNER_PLAYBOOK.md`, Visual style): "Hair is
never static or one firm shape" (new); "People: small and simple in the frame, contemporary and refined in design"
(20-30-year-olds styled like New York and Los Angeles today, BEAUTIFUL, refined, clean and fluid, one flowing element
with follow-through, generic LASH faces, no outlines, people near the story lit per `CRAFT.md` §d.8); "The words are
PLEASANT" (the same bar for people: soft, warm, never menacing); ONE LOOK, ONE BRAND; ORGANIC, NOT GEOMETRIC and
PAINTED PIECES (the look is moving to a painted, organic world: the people stay crisp and clean in it,
`video/docs/look/ORGANIC.md`); people mostly 130-220 px tall in our 1080 x 1920 frame, seen from behind, in profile or
3/4.

**This is an ITERATION** (playbook, Process: two agents, no panels, no critics, no QA suite; stills first, motion only
after the owner approves a still; about an hour each; the owner's verdict is the review). Hair physics is researched
now and SHOWN as still states (calm, a breeze, walking, a turn of the head), never as a clip yet.

**Every agent:** writes its file from its FIRST step and updates it as it goes (a usage limit can stop it at any
moment); returns at most 3 short lines; never runs a git command that changes the index or history (the orchestrator
commits); never touches `video/src` outside `video/src/look/people_dirs/` and a new `video/src/entry-look-people-hair.tsx`,
nor `video/public`, `video/out`; puts new hair and proportion code in NEW files (another session may be editing the
existing people files: change them only where a new file cannot do it, and keep the old defaults working); starts no
agents (if it ever does, they run at max effort); cites a source (URL) for every research claim and marks its strength
(a study or a studio's own technical account; a textbook or a pro artist's course; a practitioner's advice); never
bbc.co.uk. WebFetch may be missing: fetch with curl through the session proxy and read as text. Renders: one at a time
on the shared CPUs (`node scripts/render-frames.mjs <Comp> <outDir> 0 --entry=<entry> --concurrency=1`, from `video/`;
about 25 s each).
