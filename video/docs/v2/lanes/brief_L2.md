# Helper brief L2: THE WALL (V2S2)

Read `COMMON.md` (this folder) first. You are lane **L2** (TREATMENT.md section 9). You own `video/src/v2r/scenes/V2S2.tsx`
 plus helpers named `<ID>_*.tsx` for your shots, nothing else.

**Build at FINISHED quality** (final drawing, final camera, character animation, ambient life; texture off): V2S2: the receding wall of Google's lit windows from the south bank, the five staff windows whose blinds drop on 'scared' (map.ts window list), her dark window ringed, the bench with the staffer and the reporter (the hood goes up), the newsstand, Pip's one beat on 'But' (8.30, head turns to the wall), the push and the window match into V2S3 at 12.81-13.16 (both sides of the cut hit map.ts's match points; coordinate with L3's V2S3 via map.ts).
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
for the wall (V2S2) of a premium hand-drawn reel (9:16, on a phone). The owner rejected our last film and wants it fresh, beautiful, ALIVE like
reference 1 and our v1, people small and simple like reference 1 (never big models), a new Pip in every shot, strictly fair. Read
video/docs/v2/TREATMENT.md (V2S2; the acceptance bar in section 9; fairness in section 8). Look at the review files and at reference 1 /
v1 frames at the same 216 px size. Judge: would the owner say 'yes, this'? Is every paused frame as full and specific as the references?
Does it move like v1 (something new every few frames, motion carried across cuts, never a still tableau)? Does every frame read literally
with the sound off? Do the five blinds read at a glance as 'a few people inside a big company are scared'? Colour roles right (teal only on her, orange only in the sun)? Speeds readable at 60 fps? Verdict pass only when
nothing must change; at most 12 problems, most important first, each with a concrete fix."


Done signal: `video/docs/v2/lanes/report_L2.md`.
