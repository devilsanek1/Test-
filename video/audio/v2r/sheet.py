"""Video 2 ("One Small Window") sound timeline: shots, heard voice times, and THE cue sheet.

Single source of truth for audio/v2r: `sfx.py` renders every file named here and writes public/v2r/cues.json from
CUES; `premix.py` mixes and measures exactly this list. Times are HEARD times (docs/v2/direction/beat_map.md s2) and
TREATMENT.md s5 / s7 picture onsets, in voice seconds (0 = the first sample of public/v2/voice.wav).

Level = "under": how far the cue's loudest 400 ms (K-weighted momentary loudness) sits under the voice's speech
level (the median momentary loudness of the voice while it speaks). The linear `gain` in cues.json is derived from it.
House: SFX >= 8 dB under the voice; pops 15-20 under; a beat's special sound once; callbacks 3 dB softer.
"""

# shots (TREATMENT s5): id, start, end
SHOTS = [("V2S1", 0.00, 6.10), ("V2S2", 6.10, 12.98), ("V2S3", 12.98, 14.86), ("V2S4", 14.86, 20.55),
         ("V2S5", 20.55, 24.00), ("V2S6", 24.00, 28.06), ("V2S7", 28.06, 32.93), ("V2S8", 32.93, 39.08)]
CUTS = [s for (_, s, _) in SHOTS[1:]]

# voiced spans of the narration (10 ms RMS within 40 dB of the peak; = beat_map s2 "Voiced")
VOICED = [(0.24, 0.79), (0.97, 1.46), (2.00, 4.54), (4.79, 5.59), (6.28, 8.08), (8.44, 11.36), (11.57, 12.81),
          (13.16, 14.64), (15.07, 20.10), (20.67, 21.24), (21.37, 25.60), (26.08, 27.82), (28.31, 32.70),
          (33.16, 34.99), (35.45, 36.18), (36.54, 38.82)]

# the bed's story marks (TREATMENT s7), used by bed.py
MARK = {"pizz_false_relief": 6.28, "pulse_in": 8.44, "scared": 10.31, "pulse_out": 12.81, "air_in": 13.16,
        "she": 13.96, "walk_in": 15.07, "objected": 17.96, "military": 18.92, "heading": 19.80, "crane": 21.30,
        "accent1": 22.43, "clause_pulse": 24.00, "clause_end": 27.82, "google_pulse": 28.31, "google_end": 32.70,
        "motif_alone": 33.16, "held_breath": 36.18, "quote": 36.54, "accent2": 37.18, "dip": (4.54, 4.79)}

# Tonal sounds (energy in a few partials: a bell, a glass, a wood block, a pop's glide) mask the voice's 1-4 kHz
# diction far less than noise of the same level, so the 1-4 kHz rule is relaxed for them (premix still reports it).
TONAL = {"exit_ding", "ghost_tick", "glass_tone", "lamp_run", "outline_pops", "letter_pops", "pop", "pop_high",
         "pop_low", "swap_pop", "pip_hop", "board_clack", "plate_knock", "blossom_pops"}

# THE cue sheet: (t, file stem in public/v2r/sfx, dB under the voice, note). Same idea = same file, and every cue
# of one file keeps the level relation written here (a callback's -3 dB; Google's and her board sounds equal):
# when one of them has to come down for the voice, they all come down together.
CUES = [
    # V2S1 Walking out (0.00-6.10): no music; air + canal (in the bed) + these
    (0.00, "pencil_flood", 20, "f0: the bare ink scene, colour floods from the sun outward (f1-f18)"),
    (0.40, "lamp_click", 20, "her lamp at W clicks OFF: the biggest window goes dark (the first picture of 'quit')"),
    (0.45, "exit_ding", 9, "OUR exit ding: the glass doors start to slide apart (first-second phone sound)"),
    (0.45, "door_glide", 24, "the glass doors' glide under the ding, fully open on 'quit' 0.52"),
    (0.97, "step_thup", 20, "she steps out onto the towpath ('Google')"),
    (0.99, "letter_pops", 26, "the canopy letters fill-pop one by one"),
    (1.40, "wings", 16, "five birds lift off the bridge rail and wheel west (in the pause 1.46-2.00)"),
    (2.00, "ghost_tick", 14, "G1 pops (one soft wooden tick per ghost, ONE pitch)"),
    (2.53, "ghost_tick", 14, "G2 pops ('contract')"),
    (3.20, "ghost_tick", 14, "G3 pops ('bans')"),
    (3.80, "ghost_tick", 14, "G4 pops"),
    (4.20, "ghost_tick", 14, "G5 pops"),
    (4.79, "ghost_tick", 14, "G6 pops ('for'); the ambience dip 4.54-4.79 is in the bed"),
    (4.98, "outline_pops", 15, "'life': three bare outlines pop in down the towpath (then air: no note, no riser)"),
    (4.98, "ear_flap", 23, "Pip's ears-cover on 'life'"),
    (5.95, "whoosh_dive", 12, "push-through dive into the dark window (in the pause 5.59-6.28)"),
    # V2S2 The wall (6.10-12.98)
    (6.82, "pencil_ring", 17, "an ink ring draws round her dark window"),
    (8.44, "board_clack", 13, "the newsstand A-board slides out: TOLD THE BBC (the ONE board sound)"),
    (8.96, "light_clicks", 19, "'staff': the five windows turn a cooler white"),
    (9.48, "notebook_flap", 19, "'BBC': the reporter's notebook opens"),
    (10.26, "blinds_five", 16, "'scared': five blinds drop to half one by one (10.26-10.60)"),
    (12.20, "blind_thump", 15, "'contracts': W2's blind comes fully down"),
    (12.85, "notebook_clap", 14, "the notebook claps shut (pause 12.81-13.16)"),
    # V2S3 Her window (12.98-14.86)
    (12.98, "swap_pop", 14, "the window match-cut swap"),
    (13.10, "pip_land", 18, "Pip lands on her window box"),
    (14.70, "pip_hop", 15, "Pip leaps out of the top (pause 14.64-15.07)"),
    # V2S4 The walk home (14.86-20.55)
    (14.95, "pip_land", 17, "Pip lands on the boat roof"),
    (15.07, "pop_high", 16, "her name tag pops (first build)"),
    (16.60, "pen_tick", 18, "the tag's second build"),
    (17.66, "steps_stop", 19, "her last two steps; the stop lands at 17.96 ('objected')"),
    (18.92, "plate_knock", 15, "'military': the DEC 2025 plate builds (wood knock + pop)"),
    (19.45, "pen_short", 17, "the APR 2026 plate pen-reveals, complete on 'heading'"),
    (19.80, "wings", 19, "birds fly west into the sun (callback, 3 dB softer)"),
    (20.45, "glass_tone", 14, "sun match-cut S4 -> S5 (pause 20.10-20.67)"),
    # V2S5 The far side (20.55-24.00)
    (20.76, "calendar_flip", 16, "'April': the sun flips into a calendar page and back by 21.20"),
    (20.76, "blossom_pops", 18, "the slot's trees burst into blossom in 4 frames"),
    (22.12, "wipe_air", 17, "the lamppost wipes the backs at peak speed"),
    (22.43, "pop_low", 16, "'Pentagon': the plaque pops (the bed's soft accent 1 is here too)"),
    (23.08, "window_ticks", 20, "windows warm on along one wing"),
    (23.90, "pip_hop", 17, "Pip leaps"),
    # V2S6 The gate (24.00-28.06)
    (24.00, "board_clack", 13, "the deal board lands at the cut"),
    (24.03, "pop", 17, "'any': the purpose line pops (never before the clause)"),
    (26.40, "pop_high", 17, "'veto': Lawful use: decided by the Pentagon"),
    (27.10, "window_ticks", 20, "facade windows light one by one (27.10-27.80)"),
    (27.95, "pip_hop", 16, "Pip leaps (pause 27.82-28.31)"),
    (28.00, "glass_tone", 17, "sun match-cut S6 -> S7 (callback, 3 dB softer)"),
    # V2S7 Google says (28.06-32.93): equal weight with S8's board (A5)
    (28.36, "board_clack", 13, "GOOGLE SAYS: the header pops (same board sound, same level as hers)"),
    (29.65, "pen_short", 17, "'AI principles' pen-builds, complete on 30.04"),
    (30.04, "lamp_run", 16, "the string lights come on in a run (same sound and level as hers at 37.18)"),
    (30.74, "pen_long", 19, "'of any kind' pen-builds, complete on 32.08"),
    (32.70, "boat_chug", 15, "the narrowboat foreground wipe (nothing starts before 32.70)"),
    # V2S8 Her words (32.93-39.08)
    (33.16, "board_clack", 13, "the wipe clears: SHE SAYS (same board sound, same level as Google's)"),
    (33.78, "ghost_tick", 17, "'can't': three ghosts pop ahead of her (3 dB softer, one pitch)"),
    (33.86, "ghost_tick", 17, "second ghost"),
    (33.94, "ghost_tick", 17, "third ghost"),
    (34.75, "door_latch", 16, "her door shuts behind her"),
    (34.95, "lamp_click", 23, "W lights (her home lamp: the 0.40 click as a callback, 3 dB softer)"),
    (35.72, "cloth_wipe", 17, "'her words': the café owner wipes the board clean in one stroke"),
    (36.54, "pen_long", 19, "her quote pen-draws on (the same pen as Google's)"),
    (37.18, "lamp_run", 16, "'facts': the lamps light in a run down the lane (= Google's 30.04, never the ding)"),
    (38.82, "pencil_reverse", 16, "the un-build: a reversed pencil into frame 0 (meets 0.00's pencil flood)"),
]
