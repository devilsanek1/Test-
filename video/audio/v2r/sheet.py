"""Video 2 ("One Small Window") sound timeline: shots, heard voice times, the hit words, the on-screen life the bed
sounds, and THE cue sheet.

Single source of truth for audio/v2r: `sfx.py` renders every file named here and writes public/v2r/cues.json from
CUES; `bed.py` composes the score on MARK and sounds LIFE in the world's air; `premix.py` mixes and measures exactly
this list. Times are HEARD times (docs/v2/direction/beat_map.md s2, public/v2r/voice_words_heard.json) and TREATMENT.md
s5 / s7 picture onsets, in voice seconds (0 = the first sample of public/v2/voice.wav).

Level = "under": how far the cue's loudest 400 ms (K-weighted momentary loudness) sits under the voice's speech
level (the median momentary loudness of the voice while it speaks). The linear `gain` in cues.json is derived from it.
House: SFX >= 8 dB under the voice; pops 15-20 under; a beat's special sound once; callbacks 3 dB softer.

Revision 2 (music director's review): word-synced cues sit 2 frames BEFORE the word's heard onset (`lead`: the beat
map lets hits lead the voice by 1-2 frames, never trail, and an SFX transient on a consonant masks it); every hit word
keeps the voice >= 6 dB over everything else at 1-4 and 4-10 kHz (HIT_WORDS, checked by sfx.py's word guard and by
premix.py); round-robin variants (`name:k`) so no impact repeats as the same sample; the lamp runs and the long pen
are timed into the vowels of BOTH boards' key words (one file each: A5).
"""
from __future__ import annotations

import json
from pathlib import Path

FPS = 60
LEAD_FRAMES = 2
_WORDS_JSON = Path(__file__).resolve().parents[2] / "public" / "v2r" / "voice_words_heard.json"
WORDS = json.loads(_WORDS_JSON.read_text())["words"]          # [{w, s, e}], 112 heard words (engine-owned, read only)


def fr(t):
    """the frame Remotion plays a cue on, as seconds."""
    return round(t * FPS) / FPS


def lead(onset, frames=LEAD_FRAMES):
    """a word-synced cue: `frames` frames before the frame of the word's heard onset."""
    return (round(onset * FPS) - frames) / FPS


def at_frame(f):
    return f / FPS


# shots (TREATMENT s5): id, start, end
SHOTS = [("V2S1", 0.00, 6.10), ("V2S2", 6.10, 12.98), ("V2S3", 12.98, 14.86), ("V2S4", 14.86, 20.55),
         ("V2S5", 20.55, 24.00), ("V2S6", 24.00, 28.06), ("V2S7", 28.06, 32.93), ("V2S8", 32.93, 39.08)]
CUTS = [s for (_, s, _) in SHOTS[1:]]

# voiced spans of the narration (10 ms RMS within 40 dB of the peak; = beat_map s2 "Voiced")
VOICED = [(0.24, 0.79), (0.97, 1.46), (2.00, 4.54), (4.79, 5.59), (6.28, 8.08), (8.44, 11.36), (11.57, 12.81),
          (13.16, 14.64), (15.07, 20.10), (20.67, 21.24), (21.37, 25.60), (26.08, 27.82), (28.31, 32.70),
          (33.16, 34.99), (35.45, 36.18), (36.54, 38.82)]

# The words the voice must win on (beat_map s2 "Hit" column + the opening line + the whole payoff line): at 1-4 kHz
# (diction) and 4-10 kHz (the consonants' noise), the voice >= 6 dB over bed + SFX over the frames where the word is
# active in that band (premix.py `hit_words`). (word as in voice_words_heard.json, its json onset)
HIT_WORDS = [("She", 0.12), ("quit", 0.52), ("Google.", 0.92), ("contract", 2.53), ("bans", 3.2), ("life.", 4.98),
             ("odd", 7.18), ("staff", 8.96), ("scared", 10.36), ("contracts.", 12.2), ("she", 13.96), ("AI", 16.12),
             ("objected", 17.96), ("military", 18.92), ("heading.", 19.8), ("April,", 20.76), ("deal", 21.84),
             ("Pentagon", 22.44), ("use", 23.08), ("any", 24.03), ("veto", 26.5), ("Google", 28.36), ("says", 28.76),
             ("principles", 30.04), ("bans", 30.84), ("of", 32.08), ("any", 32.2), ("kind.", 32.52), ("can't", 33.78),
             ("her", 35.72), ("words,", 35.8), ("talking", 36.54), ("about", 36.92), ("facts", 37.18), ("is", 37.5),
             ("not", 37.7), ("criticizing.", 38.2)]
WORD_PAD = 0.08        # a word's span for the check: json [s, e] +- this (the aligner's onsets run up to ~0.1 s late)


def word_span(w, s):
    for x in WORDS:
        if x["w"] == w and abs(x["s"] - s) < 1e-6:
            return (x["s"] - WORD_PAD, x["e"] + WORD_PAD)
    raise KeyError((w, s))


# the bed's story marks (TREATMENT s7), used by bed.py
MARK = {"pizz_false_relief": 6.28, "pulse_in": 8.44, "scared": 10.31, "pulse_out": 12.81, "air_in": 13.16,
        "she": 13.96, "walk_in": 15.07, "objected": 17.96, "military": 18.92, "heading": 19.80, "crane": 21.30,
        "accent1": 22.43, "clause_pulse": 24.00, "clause_end": 27.82, "google_pulse": 28.31, "google_end": 32.70,
        "motif_alone": 33.16, "held_breath": 36.18, "quote": 36.54, "accent2": 37.18, "dip": (4.54, 4.79)}

# The life already on screen, sounded in the world's air by bed.py (kit / scene timings; W4: re-spot from the final
# picture and rerun bed.py). (t, kind, pan, note)
LIFE = [
    (0.15, "pigeons", 0.35, "V2S1: the canopy pigeons shuffle (kit S1Set shuffleAt 0.15)"),
    (0.25, "bike", 0.7, "V2S1: a cyclist enters the far towpath from the right (kit walkers 'cyc1', f15)"),
    (1.10, "bus", -0.6, "V2S1: the bus crosses the road bridge in the west gap (kit busAt 1.1, f66)"),
    (2.30, "duck_land", -0.45, "V2S1: a mallard lands on the canal (kit duckLandsAt 2.3, f138)"),
    (2.80, "dog", 0.5, "V2S1: the dog trots down our steps (V2S1_public, f168)"),
    (7.00, "boat_pass", 0.6, "V2S2: a narrowboat passes from the vanishing point toward us (V2S2_Set boatAt 7.0)"),
    (10.40, "dog", -0.2, "V2S2: the dog on its lead trots on (V2S2_Life 10.4)"),
    (14.86, "boat_ride", 0.0, "V2S4: our narrowboat glides with us, engine at idle-ahead (14.86-20.55)"),
    (16.80, "train", -0.5, "V2S4: a train on the far viaduct (V2S4_far)"),
    (21.80, "gulls", 0.3, "V2S5: gulls wheel over the river (V2S5_far Gulls)"),
    (28.06, "fountain", 0.45, "V2S7: the forecourt fountain jets (28.06-32.93)"),
]

# THE cue sheet: (t, sound[:variant], dB under the voice, note). Same idea = same sound; a sound's variants (`:k`,
# round robin: the same design, its own noise and micro-tuning, ONE pitch) keep its level relation, and every cue of
# one sound keeps the relation written here (a callback's -3 dB; Google's and her board sounds equal: ONE file):
# when one of them has to come down for the voice, they all come down together.
LAMP_RUN_GOOGLE = at_frame(1811)      # 30.18: on the vowel of "principles" (after its /s/ 30.11-30.17)
LAMP_RUN_HER = at_frame(2234)         # 37.23: on the vowel of "facts" (after its /f/ 37.07-37.22)
CUES = [
    # V2S1 Walking out (0.00-6.10): no music; air + canal (in the bed) + these
    (0.00, "pencil_flood", 20, "f0: the bare ink scene, colour floods from the sun outward (f1-f18); 15 ms crossfade from the un-build"),
    (0.40, "lamp_click:1", 20, "her lamp at W clicks OFF: the biggest window goes dark (the first picture of 'quit')"),
    (0.45, "exit_ding", 9, "OUR exit ding, a struck glass chime C6 -> F6: the glass doors start to slide (first-second phone sound)"),
    (0.45, "door_glide", 24, "the glass doors' glide under the ding, fully open on 'quit' 0.52"),
    (lead(0.97), "step_thup", 20, "she steps out onto the towpath ('Google' 0.97)"),
    (lead(0.97), "letter_pops", 26, "the canopy letters fill-pop one by one: a quick ripple, done by 1.08 (before 'Goo-' opens)"),
    (1.46, "wings:1", 16, "five birds lift off the bridge rail (f84) and wheel west: the claps land as 'Google.' ends"),
    (lead(2.00), "ghost_tick:1", 14, "G1 pops (one soft wooden tick per ghost, ONE pitch) ('And' 2.00)"),
    (lead(2.53), "ghost_tick:2", 14, "G2 pops ('contract')"),
    (lead(3.20), "ghost_tick:3", 14, "G3 pops ('bans')"),
    (lead(3.80), "ghost_tick:4", 14, "G4 pops ('criticizing')"),
    (4.20, "ghost_tick:1", 14, "G5 pops"),
    (lead(4.79), "ghost_tick:2", 14, "G6 pops ('for'); the ambience dip 4.54-4.79 is in the bed"),
    (lead(4.98), "outline_pops", 15, "'life': three bare outlines pop in down the towpath (air puffs above 5 kHz; then air, no note)"),
    (lead(4.98), "ear_flap", 23, "Pip's leaf ears cover on 'life'"),
    (5.95, "whoosh_dive", 12, "push-through dive into the dark window (in the pause 5.59-6.28)"),
    # V2S2 The wall (6.10-12.98)
    (6.82, "pencil_ring", 17, "an ink ring draws round her dark window"),
    (lead(8.44), "board_clack:2", 13, "the newsstand A-board slides out: TOLD THE BBC (the ONE board sound) ('But')"),
    (lead(8.96), "light_clicks", 19, "'staff': the five windows turn a cooler white"),
    (lead(9.48), "notebook_flap", 19, "'BBC': the reporter's notebook opens"),
    (10.26, "blinds_five", 16, "'scared': five blinds drop to half one by one (10.26-10.60)"),
    (lead(12.20), "blind_thump", 15, "'contracts': W2's blind comes fully down"),
    (12.85, "notebook_clap", 14, "the notebook claps shut (pause 12.81-13.16)"),
    # V2S3 Her window (12.98-14.86)
    (12.98, "swap_pop", 14, "the window match-cut swap"),
    (13.10, "pip_land:1", 18, "Pip lands on her window box"),
    (14.70, "pip_hop:1", 15, "Pip leaps out of the top (pause 14.64-15.07)"),
    # V2S4 The walk home (14.86-20.55)
    (14.95, "pip_land:2", 17, "Pip lands on the boat roof"),
    (lead(15.07), "pop_high:1", 16, "her name tag pops (first build) ('She')"),
    (16.60, "pen_tick", 18, "the tag's second build"),
    (17.66, "steps_stop", 19, "her last two steps; the stop lands at 17.96 ('objected')"),
    (lead(18.92), "plate_knock", 15, "'military': the DEC 2025 plate builds (wood knock + pop)"),
    (19.45, "pen_short:1", 17, "the APR 2026 plate pen-reveals, complete on 'heading'"),
    (lead(19.80), "wings:2", 19, "birds fly west into the sun (callback, 3 dB softer) ('heading')"),
    (20.45, "glass_ting:1", 14, "sun match-cut S4 -> S5 (pause 20.10-20.67): a struck glass ting, 30 dB down by 20.67"),
    # V2S5 The far side (20.55-24.00)
    (lead(20.76), "calendar_flip", 16, "'April': the sun flips into a calendar page and back by 21.20"),
    (lead(20.76), "blossom_pops", 18, "the slot's trees burst into blossom in 4 frames"),
    (lead(22.12), "wipe_air", 17, "the lamppost wipes the backs at peak speed"),
    (lead(22.44), "pop_low", 16, "'Pentagon': the plaque pops (the bed's soft accent 1 is here too)"),
    (lead(23.08), "window_ticks:1", 20, "windows warm on along one wing ('use')"),
    (23.90, "pip_hop:2", 17, "Pip leaps"),
    # V2S6 The gate (24.00-28.06)
    (24.00, "board_clack:3", 13, "the deal board lands at the cut"),
    (lead(24.03), "pop", 17, "'any': the purpose line pops (never before the clause)"),
    (lead(26.50), "pop_high:2", 17, "'veto' (26.50): Lawful use: decided by the Pentagon (the line pops at 26.47 with it)"),
    (lead(27.08), "window_ticks:2", 20, "facade windows light one by one (27.05-27.75)"),
    (27.95, "pip_hop:3", 16, "Pip leaps (pause 27.82-28.31)"),
    (28.00, "glass_ting:2", 17, "sun match-cut S6 -> S7 (callback, 3 dB softer), 30 dB down by 28.31"),
    # V2S7 Google says (28.06-32.93): equal weight with S8's board (A5)
    (lead(28.36), "board_clack:1", 13, "GOOGLE SAYS: the header pops (THE same board file and level as hers)"),
    (lead(29.64), "pen_short:2", 17, "'AI principles' pen-builds, complete on 30.04"),
    (LAMP_RUN_GOOGLE, "lamp_run", 16, "the string lights come on in a run (THE same file and level as hers)"),
    (30.74, "pen_long", 19, "'of any kind' pen-builds (THE same pen file and level as her quote)"),
    (32.70, "boat_chug", 15, "the narrowboat foreground wipe (nothing starts before 32.70)"),
    # V2S8 Her words (32.93-39.08)
    (lead(33.16), "board_clack:1", 13, "the wipe clears: SHE SAYS (THE same board file and level as Google's)"),
    (lead(33.78), "ghost_tick:3", 17, "'can't': three ghosts pop ahead of her (3 dB softer, one pitch)"),
    (lead(33.78) + 5 / FPS, "ghost_tick:4", 17, "second ghost"),
    (lead(33.78) + 9 / FPS, "ghost_tick:1", 17, "third ghost"),
    (34.75, "door_latch", 16, "her door shuts behind her"),
    (34.95, "lamp_click:2", 23, "W lights (her home lamp: the 0.40 click as a callback, 3 dB softer)"),
    (lead(35.72), "cloth_wipe", 17, "'her words': the cafe owner wipes the board clean in one stroke"),
    (lead(36.54), "pen_long", 19, "her quote pen-draws on (THE same pen as Google's); its strokes end by 36.97, before 'facts'"),
    (LAMP_RUN_HER, "lamp_run", 16, "'facts': the lamps light in a run down the lane (= Google's, never the ding)"),
    (38.82, "pencil_reverse", 16, "the un-build: a reversed pencil into frame 0, crossfading 15 ms into 0.00's pencil flood"),
]

# Levels the review set relative to the first draft (dB vs the draft's momentary max at its gain, DRAFT_LEVEL):
# the ding is THE first-second sound, set to exactly +4 dB (LEAD_SOUNDS: no sheet / local / band / bus cap; only the
# word guard may lower it); the others are caps (the sheet and the voice rules may set them lower still).
DRAFT_LEVEL = {"exit_ding": -33.79, "lamp_click": -37.77, "door_glide": -37.71, "letter_pops": -39.40,
               "outline_pops": -35.17, "ear_flap": -38.19, "lamp_run": -31.97}
VS_DRAFT = {"exit_ding": +4.0, "lamp_click": -5.0, "door_glide": -6.0, "letter_pops": -6.0, "outline_pops": -5.0,
            "ear_flap": -5.0, "lamp_run": -6.0}
LEAD_SOUNDS = {"exit_ding"}      # never lowered by the bus guard (the moment's hero)


def sound_of(name):
    """'ghost_tick:3' -> ('ghost_tick', 3); 'pop' -> ('pop', None)."""
    if ":" in name:
        a, b = name.split(":")
        return a, int(b)
    return name, None


def file_stem(name):
    s, v = sound_of(name)
    return s if v is None else f"{s}_{v}"
