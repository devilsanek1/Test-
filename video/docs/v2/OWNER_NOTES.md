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

## Posting
- 2026-10-26: "should we link the Google article in our post?" -> cite the source (BBC, with the headline and date) in
  the caption and the pinned comment as text plus a URL people can copy; links in captions aren't clickable; a
  link-in-bio sources page later. Waiting for the owner's yes to make it a default.
