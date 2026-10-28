# L3 agent brief: ONE art-director critic pass on V2S3 + V2S4 (2026-10-28)

You are a fresh art director for lane L3 of video 2 "One Small Window" (Remotion, `/home/user/Test-/video`, branch
`video-production`). Run at MAX effort. Do NOT start any agent, subagent or workflow. You only LOOK and WRITE findings:
change no code.

Judge V2S3 (film 12.98-14.86) and V2S4 (14.86-20.55) at PHONE size against, in this order: the owner's words
(`video/docs/v2/OWNER_NOTES.md`, the last 6 entries; the look section of `video/docs/OWNER_PLAYBOOK.md`),
`video/docs/look/DIRECTION.md`, `video/docs/look/CRAFT.md` §f **"Failures the eye catches first"** (and §a-§g where a
finding needs a number), `video/docs/v2/lanes/conform_L3.md` (the binding spec), and the approved look
`video/deliverables/v2/v2r_G4_look_v4.mp4` (pull a few frames with ffmpeg) as the bar. What the lane did and measured:
the "S3 art conform" and "S4 art conform" sections at the top of `video/docs/v2/lanes/handover_L3.md`.

Render (from `video/`): `env GL=angle node scripts/render-frames.mjs Film2R <dir> <t1,t2,...> --entry=src/entry-v2r-film.tsx
--scale=0.4` (film seconds). Look at 360 px wide (phone) and at 0.4. Frames: every 0.5 s of both shots, plus the joins
12.95 / 12.98 / 13.00, 14.71 / 14.86 / 15.01, 20.35 / 20.40 / 20.55 / 20.70. Write scratch files under
`/tmp/claude-0/-home-user-Test-/6f98c33a-2c7f-5355-893a-0f8c4c5abcb3/scratchpad/critic/`.

Must-checks (each a MUST if it fails):
1. S2 -> S3 cut (12.95 vs 12.98): her window at M (335, 785) 133 x 164 and Pip at (590, 1050) on the same screen spot;
   the near lamp continuous: L2's `S2_NEAR_LAMP` (post x 1014-1045, arm exit y 657-678, on screen #8F553F): measure x,
   the arm exit and the post's colour in both frames; any jump is a MUST.
2. S3 -> S4 (14.71-15.01): the dive lands on her plum head (no teal bar, no pane edge at the push centre (330, 742));
   S4's pull-back starts on her head (720, 912). Nothing enters, pops or turns in 14.66-15.06.
3. S4 -> S5 (20.35-20.75): SUN1 at (250, 650) r 65, nothing crosses the disc (no lattice line), nothing enters.
4. Life: <= 3 noticeable movers at once in each shot; no stranger's back; walkers enter at an edge already walking.
5. The squint test: the heaviest area is the beat's subject (S3 her lit window; S4 her, the tag, the plates), never
   the near dressing or the boat.
6. Particles SEEN at 360 px (leaves across the open mid ground, glints, motes) without searching; none in a join window.
7. Her far window in S4 visible at 16.0 and 19.9, never over the plates, the tag or the band.
Then CRAFT §f's failure list and the owner's notes: anything the eye catches first at phone size is a MUST; taste and
polish are SHOULDs. The water is out of scope (a shared redesign lands later): never a finding on its styling.

Write `video/docs/v2/lanes/critic_L3.md`: the MUSTs first, each one line: shot, time, what the eye sees, the rule it
breaks, the smallest fix (file and what to change); then at most 5 SHOULDs (one line each; they are not done now);
then the paths of the stills you judged. Commit it with `bash /home/user/Test-/context/workflows/v2r-l3-ckpt.sh "v2r L3:
critic pass (S3 + S4)"`. Your final message: at most 8 lines (the MUST count and their one-line titles, the commit).
Public repo: no email addresses or secrets in files; no reference frames committed.
