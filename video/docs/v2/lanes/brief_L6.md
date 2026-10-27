# Helper brief L6: HER WORDS + THE SEAM (V2S8)

Read `COMMON.md` (this folder) first. You are lane **L6** (TREATMENT.md section 9). You own `video/src/v2r/scenes/V2S8.tsx`
 plus helpers named `<ID>_*.tsx` for your shots, nothing else.

**Build at FINISHED quality** (final drawing, final camera, character animation, ambient life; texture off): V2S8 (the wipe in on the narrowboat from V2S7, her towpath at sunset, the cafe's quote-of-the-day board with her words (L5's StatementBoard face: pull until `src/v2r/kit/boards` exists), the cafe owner (a small back), the three ghosts still standing (map.ts S8 ghost spots; the map agent proposes they stand left of her door, then slide in front of her shut door with the truck: decide and note it), lamps lighting in a run down the lane on 'facts', neighbours stopping to read, her window W lighting at 34.95, Pip's ears down on 'can't' 33.78 and looking up at W on 'not' 37.70) and THE SEAM: V2S8 un-builds into V2S1's t < 0 bare-line state so the film loops (end on a 1.05 push about W (860, 700) so W matches V2S1's frame 0 exactly; drop your full-frame background while you un-build so the bare lines draw on in place). Check a strip of the last 0.3 s next to frames 0-6.
Everything per TREATMENT.md and `video/src/v2r/world/map.ts`; the kit READMEs (`src/v2r/kit/*/README.md`) for the API.
The kits: cast + Pip are done; the canal kit (`src/v2r/kit/canal`) and the Arlington kit (`src/v2r/kit/dc`) are landing now, and the
orchestrator runs a final kit review whose fixes land as `video/docs/v2/lanes/report_KIT.md`: `git pull` before you start building (wait,
pulling every ~5 min, until the kit README you need exists), and pull again when report_KIT.md appears. A kit defect you hit: work around it in
your own files AND add a REQUESTS line.

**Review files** (your scratch dir; the critic reads exactly these): each shot at 6+ key times as 216 px stills beside reference 1 / v1
frames, labelled with shot id and time; one full-size 1080x1920 still of each shot's key frame; a motion strip (10 frames 0.1 s apart from the
busiest second, 8 frames 0.25 s apart from the calmest); a 0.5-scale clip with voice and cues (render Film2R with `--frames` covering your
shots, `--gl=angle`); `python3 scripts/qa/density.py` on it (and the camera-speed check for any move).

**Critic prompt** (give it your review files' paths and TREATMENT.md): "You are a fresh-eyes art director and a sound-off viewer
for her words + the seam (V2S8) of a premium hand-drawn reel (9:16, on a phone). The owner rejected our last film and wants it fresh, beautiful, ALIVE like
reference 1 and our v1, people small and simple like reference 1 (never big models), a new Pip in every shot, strictly fair. Read
video/docs/v2/TREATMENT.md (V2S8; the acceptance bar in section 9; fairness in section 8). Look at the review files and at reference 1 /
v1 frames at the same 216 px size. Judge: would the owner say 'yes, this'? Is every paused frame as full and specific as the references?
Does it move like v1 (something new every few frames, motion carried across cuts, never a still tableau)? Does every frame read literally
with the sound off? Does the payoff land (her words, the street noticing), and is the loop seam invisible? Colour roles right (teal only on her, orange only in the sun)? Speeds readable at 60 fps? Verdict pass only when
nothing must change; at most 12 problems, most important first, each with a concrete fix."


Done signal: `video/docs/v2/lanes/report_L6.md`.
