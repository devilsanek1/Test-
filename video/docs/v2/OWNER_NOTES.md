# Video 2 (Google DeepMind resignations): the owner's notes on THIS video

Concrete notes on this one video: picks, lines, takes, shots. Approach-level lessons drawn from them live in
`docs/OWNER_PLAYBOOK.md` (linked as "-> rule"). Newest at the bottom. Format: date, gate: what the owner said -> what we did.

## Topic, core line, script
- 2026-10-25, G0: topic = the BBC report (21 Oct 2026) of Google DeepMind staff resigning over military AI contracts;
  "make it into something bigger: ENGINEERS ARE RESIGNING AND AFRAID kind of vibe", a hook stronger than "Engineers are
  leaving Google!" -> research of the bigger story (timeline, industry, guardrails; `research/`). -> rules: Hook and
  pacing (bigger story, true hook).
- 2026-10-26, G0.5: "Let's go with A": core line "She quit Google, and says her contract bans criticizing it, for life."
  (over the plural headline and the "ashamed" line; their own two lines ranked 45th and 47th of 50 with the viewer panel).
  -> rule: Taste signals (one real person in her own attributed words).
- 2026-10-26, G1: the story-first script (113 words, "Why is she talking?") was accepted without word notes.

## Voice
- 2026-10-26, G2: take 1 broke (88 s: doubled opening, a derail and restart, the ending looped 3x, "And 'oogle"), so it
  was rescued by cutting. "We need to be able to paste it full and get ElevenLabs to narrate it cleanly ... make sure we
  don't see this issue again" -> root-cause study (`docs/voice/`), paste format v2, check_paste/check_take hardening,
  the API generator. -> rule: Script and voice (one full paste must narrate cleanly).
- 2026-10-26, G2: take 2 (format v2: 5 short tags, 714 characters) was clean first time; owner: "It's good yes let's
  continue" -> voice LOCKED (`public/v2/voice.wav`).
- 2026-10-26: connected the ElevenLabs API (voice "Test 3", `gHYdn45bUiDI9umVTpCo`); "play around with the voice cues to
  make it perfect for the reel" -> 4 API deliveries (secret / news / story / punch, `assets/v2/voice_*`), all clean
  first try; no pick yet, so take 2 stays.

## Animatic (G3)
- 2026-10-26: the board animatic (`deliverables/v2/v2_g3_animatic.mp4`) was sent; owner: "Keep going" (no notes) ->
  G3 taken as approved; on to G4 (look).

## Look (G4)
- 2026-10-26, G4: "lets go with A": palette 3 Cream & Cobalt (desk_A); then "lets do dusk": the Pentagon scale beat in the
  6 Dusk sister palette. -> `docs/v2/LOOK.md`; rule: Taste signals (palettes).
  Superseded by the restart (2026-10-27, "full creative freedom"): the dropped pass's Cream & Cobalt + dusk picks no longer
  bind; the restart's judged direction uses palette "10 Canal Mint" (an October evening, `src/v2r/palette.ts`, STYLE.md).

## Production (G5 on)
- 2026-10-26, G5 (while the v2 blocking build ran): "we've updated the repo with a few more ground rules" (every scene must feel
  alive; great scale; every cut names its stage; no token limit for creative work) -> the v2 G5 workflow was stopped before its
  lanes (the engine's finished shell kept) and re-briefed: dense, living sets with ambient life always on, HER CAT as the recurring
  living character in her home only (our call for this cut; the owner may veto it), P8 with the great-scale cues, a kit critic and a
  per-lane aliveness critic + fix round. -> rules: Visual style (feel alive; great scale), Process (say the stage; no token limit).

- 2026-10-27, G5 cut (`deliverables/v2/archive/v2_g5_blocking.mp4`): "No I don't like it, let's start from scratch, let's
  reset all cache, let's not do the sketch. Do the video right away, full creative freedom, but look at our GitHub repo's
  general direction and principles. NO LIMIT ON TOKENS" -> the whole first visual pass (board, look, G5) dropped to
  `archive/restart_2026-10-27/`; a fresh production straight to the finished film (no sketch), new creative direction
  judged against the repo's principles and v1; script and voice take 2 kept (approved; no API key in this session).
  -> rule: Process (a rejected cut restarts clean).
- 2026-10-27 (restart, direction stage): "Don't rely on reusable assets" -> everything visual and musical in the new v2
  film is made new for it (no v1 shared sets, no v3 kit, no stock mascot drawing, no house music bed); engine primitives
  and QA tools only. -> rule: Visual style (don't rely on reusable assets).
- 2026-10-27 (restart, direction stage): "don't use big models of people; the people we showed in the first example video
  are the right direction" -> no big character models or close-up faces in the new film: small, simple figures in the
  world like reference 1 (crowds, small full figures, backs of heads). -> rule: Visual style (people small and simple).
- 2026-10-27 (restart, kit stage): "make sure to parallelize the work as much as you can, start more instances of cloud
  machines if you have to, but clean them up after" -> lanes and kit work farmed out to helper cloud sessions (report file =
  done-signal), each archived once its work is merged and checked. -> rule: Process (parallelize; archive helpers).
- 2026-10-27: "They must all use ultracode effort btw - all support sessions you spin up" -> every helper's prompt says
  ultracode and COMMON.md tells it to orchestrate with workflows; the running helpers were told. -> rule: Process (helpers).
- 2026-10-27: (screenshot of a helper at "Opus 5.5 Medium") "the effort should be either max or ultracode" -> helpers restarted with
  the first prompt `/effort ultracode on` ("Ultracode on: dynamic workflows on every task"), the task sent as a message;
  `is_ultracode_active: true` verified. -> rule: Process (helpers).
- 2026-10-27: "the key rule is we need to ensure the effort is MAX! ... we can't sacrifice the quality of the video because we
  didn't set the proper effort level and the video ends up lazy" -> every agent at MAX effort: the local kit review and the
  sound critique/revision restarted with effort 'max' on every agent; helper sessions restarted at /effort max (ultracode on
  top). -> rule: Process (MAX effort, always).
- 2026-10-27: "do each subsection understand the repo rules and the full stylistic direction? including colors, cinematic
  references, etc?" -> not provably yet: a workflow writes one definitive `docs/v2/STYLE.md` from every style source, an
  independent audit finds what the helpers could miss or what contradicts, COMMON.md makes STYLE.md the first mandatory read,
  and every lane answers `lanes/STYLE_CHECK.md` (graded against a private key). -> rule: Process (lanes prove the style).
- 2026-10-27 ~14:30: "the key rule tho is to fit within the weekly limit of tokens - we are now at 50% overall usage this week -
  monitor it", then "using all 100% is fine if we are able to complete the video fully" -> spend tracked hourly (helpers'
  cost_usd + workflow tokens); measured ~$350 in the helpers' first 69 min (~$300/h); QA lane told to wrap up; every lane
  gets a finish-first budget (acceptance bar, at most 2 critic rounds, no full-film renders); the owner's % reading calibrates.
  -> rule: Process (the weekly limit is the real budget).
- 2026-10-27 ~15:05 UTC, plan usage screenshot (session limit 89 %, resets 18:30; weekly 58 %, resets Mon 10:00): "make sure that if we do hit the current
  session limit we are not losing any progress" -> controlled pause of every lane and local workflow (all pushed, handovers, resume scheduled 18:33 UTC).
  Then: "before you restart the work read the updated overall stylistic instructions and the guideline from the repo" -> the playbook's new
  clean / light / hierarchy / flowing-story rules integrated into STYLE.md + a clean pen for v2r (15:40 UTC).
- 2026-10-27 18:38 UTC, after the reset: "Okay the limits seem to reset" (taken as the go for the proposed plan: conform v2 to
  DIRECTION.md / CRAFT.md, a look clip of the S1 opening first, the lanes conform after their briefs land).
- 2026-10-27 ~20:10 UTC: "Yes": S5-S7 (12.4 s: the Arlington crane reveal, the deal board, Google's reply) run without her window
  (the thread) as a declared fairness exception; the window holds 67 % of the film (98 % outside S5-S7). Rejected: restaging the
  boards on the canal beside her window (~2 lane-days, weakens equal weight). General rule added (playbook core-line rule, CRAFT §a.1, DIRECTION 1).
- 2026-10-27 ~22:20 UTC, G4 look clip (`deliverables/v2/v2r_G4_look.mp4`, S1 0-6.13 s in the clean pen, tiers, RIG_CANAL): "okay good
  continue" -> the look is APPROVED for the lanes (incl. the row change: oat coats, white-haired copies on "life" instead of see-through
  outlines); no comment on the big orange sun -> kept as is; the foreground fix (things at foreground scale on the steps) goes on as v2.
- 2026-10-27 ~22:30 UTC, on the G4 look clip (two screenshots: the Google facade + far city; the steps): "the foreground and the
  main focus still blurs with the background supporting entities ... the Google office vs the building on the background - they are all
  blurred together ... no distance effect nor perspective; similarly the bottom part ... little to no perspective or depth at all; the
  shadows added are better; research some libraries on github that would help you achieve better, more natural effects and add perhaps a
  bit of particles here and there". -> playbook rule DEPTH AND SEPARATION (+ DIRECTION rule 2); S1 v2: the far city recedes (atmospheric
  perspective), the Google wing separates, the steps recede in perspective; a researched particles + depth toolkit for every lane.
- 2026-10-27 ~22:50 UTC (screenshot: the mint caption sky above, a peach band with the big orange sun below it): "what bothered me
  is different color of the space and sun, like why is it blue sky and then suddenly abruptly orange, weird" -> playbook ONE CONTINUOUS
  SKY + DIRECTION rule 6; S1: the sky steps from the caption field to a warm horizon, the sun smaller/lower in agreeing sky, the far
  haze = the lowest sky step; every lane's brief gets it.
- 2026-10-27 ~22:55 UTC: "maybe when it comes to sky we can find a beautiful way to do a gentle gradient" -> the sky is one gentle,
  dithered gradient (the one place a gradient is welcome; DIRECTION rules 5/6, playbook), nearly flat in the caption band.
- 2026-10-27 ~23:00 UTC: "I think it might make the sky much nicer" / "again find the pro way and tools to do it the best way you can"
  -> playbook rule "Find the PRO way and the pro tools"; a researched lib/sky.tsx (OKLab eased gradient, sun warmth, blue-noise dither, a
  banding check on the encoded mp4) before S1 v3.
- 2026-10-27 ~23:30 UTC, budget: weekly 68 % (23:22); "V3 is managed by separate account" -> this account's weekly % is video 2's
  own (plus the idle v4 research session); recalibrated to ~$25 per weekly % (23-29): ~$800 left, video 2 needs ~$500-700 -> ~88-96 %.
- 2026-10-27 ~23:40 UTC: "Dedicate the full budget to finishing this video" -> the whole remaining week (to 100 %) goes to video 2; the guard
  becomes "finish inside 100 %": quality where it shows (the S1 look, the lanes' one critic round, the whole-film review), no waste.
- 2026-10-27 ~23:45 UTC: "Let's do the best job we can" -> quality first inside the full budget: a fresh-eyes art-director check of S1 v3
  before the owner sees it; lanes may take a second critic round when a must-fix remains; a full whole-film review panel (cold viewer, art,
  flow/motion, fairness, sound) and a G6 polish pass on the hook and the key beats before the master.

- 2026-10-28 ~00:35 UTC, asked about the scout's parallax-float proposal: "switch it on if you think it will make the videos better and
  improve engagement" -> ON (orchestrator's call: depth in motion without more movers): playbook rule, DIRECTION rule 8,
  COZY_AND_SCALE 3b.5; a parallax helper in lib/depth.ts (L1 builds it with S1, the lanes reuse it).
- 2026-10-28, on the G4 look clip v4 (`deliverables/v2/v2r_G4_look_v4.mp4`: depth, one gentle sky, particles, the parallax float, the art
  director's fixes): "Okay I think this is better now the hook video" -> v4 APPROVED as the look; L2-L6 resume from
  `lanes/RESUME_2026-10-28.md`.
- 2026-10-28 ~08:00 UTC: "Continue. Tho I don't see any changes in the particles anywhere, you mentioned some leaves previously no?"
  -> verified: at phone size v4's particles are invisible (13 px leaf, 14-24 px glints, 3-4 px motes); new numbers in CRAFT §f.6 (leaves
  26-40 px, glints 20-36 px x 4-6, motes 6-10 px) + lib/particles presets; S1 gets a particles pass (look clip v5); lanes inherit.
- 2026-10-28 ~08:55 UTC, on the G4 look clip v5 (`deliverables/v2/v2r_G4_look_v5.mp4`: leaves 34-40 px blown across the water and the
  quay, 4-6 glints in the sun's path, near motes on the bay tree): "I don't like the water too much, leafs are great, but let's keep it and
  keep going" -> v5 is the look; the leaves are the proven particle (playbook: the depth rule's evidence); the water stays as it is for this
  film (every lane keeps S1's water, no new water styling) and is a known weak spot: playbook "water gets its own study in the next film's
  G4"; if the budget allows at G6 polish, one water pass across all shots, shown to the owner first.
- 2026-10-28 ~09:05 UTC, asked what bothers them about the water: "It's just looking way too cheap, not clean or premium quality or
  refined. Just lazy and cheap. I mean that about the water" -> the water is redesigned NOW as one shared premium component (researched,
  two competing treatments judged on S1, the winner built into the library), shown to the owner on S1 as the G4 look clip v6 before the
  lanes swap it in; the lanes keep going meanwhile (their water isolated in one component, no water polish); the final review round
  shrinks to pay for it inside 100 % of the week.

## Posting
- 2026-10-26: "should we link the Google article in our post?" -> cite the source (BBC, with the headline and date) in
  the caption and the pinned comment as text plus a URL people can copy; links in captions aren't clickable; a
  link-in-bio sources page later. Waiting for the owner's yes to make it a default.
