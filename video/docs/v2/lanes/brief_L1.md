# Helper brief L1: THE HOOK (V2S1)

Read `COMMON.md` (this folder) first. You are lane **L1** (TREATMENT.md section 9). You own `video/src/v2r/scenes/V2S1.tsx`
 plus helpers named `<ID>_*.tsx` for your shots, nothing else.

**Build at FINISHED quality** (final drawing, final camera, character animation, ambient life; texture off): V2S1 complete: its t < 0 bare-line state (the loop returns to it), the colour flood (coat last), the exit ding at 0.45 s, the glass doors, her window W going dark, the GHOST ROW on its exact times (map.ts `s1RowAt`; the cast kit's GhostRow), 'life' at the heard 4.98 s with the extra outlines, the steps with the seated public (near head-backs <= ~140 px), Pip on the waterline bollard (its ears-cover on 'life'), the dive into her window at the end. It is the most important shot: frame 0 is the scene being drawn (lines, then colour within ~0.3 s), voice from frame 1, something new every few frames, never still; the frame-0 words are the engine's (keep the band clear). You are also the PILOT: your shot sets the bar the other lanes follow.
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
for the hook (V2S1) of a premium hand-drawn reel (9:16, on a phone). The owner rejected our last film and wants it fresh, beautiful, ALIVE like
reference 1 and our v1, people small and simple like reference 1 (never big models), a new Pip in every shot, strictly fair. Read
video/docs/v2/TREATMENT.md (V2S1; the acceptance bar in section 9; fairness in section 8). Look at the review files and at reference 1 /
v1 frames at the same 216 px size. Judge: would the owner say 'yes, this'? Is every paused frame as full and specific as the references?
Does it move like v1 (something new every few frames, motion carried across cuts, never a still tableau)? Does every frame read literally
with the sound off? For the hook: is frame 0 to 3 s a banger, and does the ghost row read 'for the rest of her life', never death? Colour roles right (teal only on her, orange only in the sun)? Speeds readable at 60 fps? Verdict pass only when
nothing must change; at most 12 problems, most important first, each with a concrete fix."
**The sound-off cold-read test** (TREATMENT.md section 1 and 9; do it after your critic passes): spawn SIX independent subagents, each one
persona (a 19-year-old on TikTok; a 35-year-old parent not into tech; a software engineer; a skeptic who distrusts media; a 60-year-old
retired teacher; a politics-curious student), each seeing ONLY your V2S1 frames at 216 px (0.0, 0.3, 0.6, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0,
4.5, 5.0, 5.5 s, Film2R, sound off, no project files), asked "what will happen to her?" and whether anything reads as death. Pass: >= 4 of 6
say she can never speak / is bound for the rest of her life, and nobody reads death. If it fails: TREATMENT's fallback (5 ghosts and lighter
heads, nothing else) plus what their answers show, then test again. Put the six answers in your report.

Done signal: `video/docs/v2/lanes/report_L1.md`.
