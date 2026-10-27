"""Video 2 ("One Small Window") sound timeline: shots, joins, heard voice times, the hit words, the on-screen life the
bed sounds, and THE cue sheet.

Single source of truth for audio/v2r: `sfx.py` renders every file named here and writes public/v2r/cues.json from
CUES; `bed.py` composes the score on MARK and sounds LIFE / BIRDS in the world's air; `premix.py` mixes and measures
exactly this list. Times are HEARD times (docs/v2/direction/beat_map.md s2, public/v2r/voice_words_heard.json) and the
picture's onsets (TREATMENT.md s5 as conformed by docs/v2/THROUGHLINE.md s3, src/v2r/film/scenes.json and
src/v2r/world/map.ts), in voice seconds (0 = the first sample of public/v2/voice.wav).

Level = "under": how far the cue's loudest 400 ms (K-weighted momentary loudness) sits under the voice's speech
level (the median momentary loudness of the voice while it speaks). The linear `gain` in cues.json is derived from it.
House: SFX >= 8 dB under the voice; pops 15-20 under; a beat's special sound once; callbacks 3 dB softer.

Revision 2 (music director's review + DIRECTION / THROUGHLINE, 2026-10-27):
- every join's sound rides its CARRIER and peaks on its MIDPOINT (JOINS); Pip never hops across a join, so no hop,
  leap or landing sound remains; the retired camera moves had no sound of their own and get none;
- nothing but the carrier starts in [midpoint - 0.2, midpoint + 0.12) (the next sentence's first word is >= 0.12 s
  after it): no other cue, no life sound, no water lap, no music note (premix.py checks it);
- word-synced cues sit 2 frames BEFORE the word's heard onset (`lead`: the beat map lets hits lead the voice by 1-2
  frames, never trail, and an SFX transient on a consonant masks it); every hit word keeps the voice >= 6 dB over
  everything else at 1-4 and 4-10 kHz (HIT_WORDS, checked by sfx.py's word guard and by premix.py);
- round-robin variants (`name:k`) so no impact repeats as the same sample;
- the two lamp runs are ONE file (A5) of three flash-safe switch-ons (<= 3 per second), placed in the vowels of BOTH
  boards' key words, the long pen ONE file that falls silent before "facts".
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


# shots (src/v2r/film/scenes.json: S6 starts at the blossom-tree wipe's midpoint 23.80, S7 at the sun push-through's
# midpoint 28.10): id, start, end
SHOTS = [("V2S1", 0.00, 6.10), ("V2S2", 6.10, 12.98), ("V2S3", 12.98, 14.86), ("V2S4", 14.86, 20.55),
         ("V2S5", 20.55, 23.80), ("V2S6", 23.80, 28.10), ("V2S7", 28.10, 32.93), ("V2S8", 32.93, 39.08)]
CUTS = [s for (_, s, _) in SHOTS[1:]]

# THROUGHLINE s3: every join, its midpoint, its carrier (DIRECTION rule 1: A push-through, B thread match, D wipe), the
# carrier's span on screen, and THE sound that rides it (peaking on the midpoint).
JOINS = [
    ("S1>S2", 6.10, "A push-through into her dark office window W (plum bridge 6.05-6.15)", (5.95, 6.25), "whoosh_dive:1"),
    ("S2>S3", 12.98, "B match: her dark office window at M = her lit home window at M", (12.98, 12.98), "lamp_click:2"),
    ("S3>S4", 14.86, "A push-through into her silhouette, out of her walking (plum bridge)", (14.71, 15.01), "whoosh_dive:2"),
    ("S4>S5", 20.55, "A push-through into the low October sun SUN1, out of the April sun", (20.40, 20.70), "sun_through:1"),
    ("S5>S6", 23.80, "D wipe: one blossom tree crosses the lens right to left", (23.62, 23.98), "tree_wipe"),
    ("S6>S7", 28.10, "A push-through into the April sun SUN2, out of the sunset sun", (27.95, 28.25), "sun_through:2"),
    ("S7>S8", 32.93, "D wipe: the narrowboat glides west past the lens", (32.70, 33.16), "boat_pass"),
    ("S8>S1", 38.95, "B + un-build: her lit home window W = her office window W at frame 0", (38.82, 39.08), "pen_unbuild"),
]
JOIN_BEFORE = 0.20     # nothing but the carrier starts in [midpoint - 0.20, midpoint + 0.12)
JOIN_AFTER = 0.12

# voiced spans of the narration (10 ms RMS within 40 dB of the peak; = beat_map s2 "Voiced")
VOICED = [(0.24, 0.79), (0.97, 1.46), (2.00, 4.54), (4.79, 5.59), (6.28, 8.08), (8.44, 11.36), (11.57, 12.81),
          (13.16, 14.64), (15.07, 20.10), (20.67, 21.24), (21.37, 25.60), (26.08, 27.82), (28.31, 32.70),
          (33.16, 34.99), (35.45, 36.18), (36.54, 38.82)]
PAUSES = [(1.46, 2.00), (4.54, 4.79), (5.59, 6.28), (8.08, 8.44), (11.36, 11.57), (12.81, 13.16), (14.64, 15.07),
          (20.10, 20.67), (21.24, 21.37), (25.60, 26.08), (27.82, 28.31), (32.70, 33.16), (34.99, 35.45), (36.18, 36.54)]

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
# The opening line shares its first second with THE ding (review item 3: +4 dB): on these two words a measured-tonal
# masker (bare partials: the ding's glass) counts 10 dB less, as a tone masks speech far less than noise of the same
# energy; the raw number is reported too. Every other hit word is held on raw energy, as the review measured it.
TONAL_RELAXED = {("She", 0.12), ("quit", 0.52)}
TONAL_MASKING_DB = 10.0


def word_span(w, s):
    for x in WORDS:
        if x["w"] == w and abs(x["s"] - s) < 1e-6:
            return (x["s"] - WORD_PAD, x["e"] + WORD_PAD)
    raise KeyError((w, s))


# the bed's story marks (TREATMENT s7), used by bed.py
MARK = {"pizz_false_relief": 6.28, "pulse_in": 8.44, "scared": 10.31, "pulse_out": 12.81, "air_in": 13.16,
        "she": 13.96, "walk_in": 15.07, "objected": 17.96, "military": 18.92, "heading": 19.80, "april": 20.76,
        "crane": 21.30, "accent1": 22.43, "clause_pulse": 24.00, "clause_end": 27.82, "google_pulse": 28.31,
        "google_end": 32.70, "motif_alone": 33.16, "held_breath": 36.18, "quote": 36.54, "accent2": 37.18,
        "dip": (4.54, 4.79)}

# The world: London (S1-S4, S7-S8) and the April morning in Arlington (S5-S6); the air changes at the carriers'
# midpoints (the push-throughs through the suns).
LONDON = [(0.00, 20.55), (28.10, 2345 / FPS)]
ARL = [(20.55, 28.10)]

# The life already on screen that the bed sounds in the world's air (DIRECTION rule 3, "alive but calm": small, slow,
# taking turns, never over the beat's own sound, none starting within a join's window). Only what the conformed
# picture keeps (conform_L1-L6: S1's cyclist, duck and dog, S2's trotting dog, the S5 gulls are cut). (t, kind, pan,
# note). W4: re-spot from the final picture and rerun bed.py.
LIFE = [
    (1.10, "bus", -0.6, "V2S1: the bus crosses the road bridge in the west gap, once (map S1_CLOCK doorsShut 1.10)"),
    (7.00, "boat_pass", 0.6, "V2S2: a narrowboat glides up from the vanishing point toward us (V2S2_Set boatAt 7.0)"),
    (14.86, "boat_ride", 0.0, "V2S4: our narrowboat glides with us at idle-ahead (14.86-20.55; fades in under the push-through)"),
    (15.25, "train", -0.5, "V2S4: a train on the far viaduct (V2S4_wfar TRAIN t0 15.25), gone before 'military'"),
    (28.10, "fountain", 0.45, "V2S7: the forecourt fountain jets (28.10-32.93)"),
]
# Birds (CC0 grains, field.py): (film t, source, grain a, b, dB, pan, lowpass Hz, why). One at a time, in the voice's
# pauses where they can be, never in a join's window.
BIRDS = [
    (1.50, 409145, 6.92, 7.17, -6, -0.5, 9000, "the bridge birds' calls as they lift (with the wings SFX), pause 1.46-2.00"),
    (1.74, 409145, 7.42, 7.79, -8, -0.35, 9000, ""),
    (8.09, 418425, 12.59, 12.88, -4, 0.6, 9000, "a robin in the pause before 'But' (gone before the board's clack 8.40)"),
    (21.25, (616969, 0), 0.01, 0.50, -13, -0.4, 8000, "April morning: an American robin under the canopy (the 21.24 pause)"),
    (22.95, 626652, 7.13, 9.15, -7, 0.5, 8000, "spring birds far below the terrace (the view)"),
    (25.62, 147594, 5.23, 5.70, -4, 0.6, 9000, "a cardinal's 'cheer' in the pause after 'purpose.'"),
    (35.02, 418425, 6.07, 6.42, -5, -0.7, 9000, "a robin on the sunset lane (the pause 34.99-35.45)"),
]

# THE lamp run (A5: Google's string lights on "principles", her lane's lamps on "facts"): ONE file of three
# switch-ons, flash-safe (<= 3 per second), each a small struck glass bulb; the picture lights its three groups on
# these frames (REQUESTS to L5 / L6). Offsets in frames from the cue: in BOTH lines every tink falls in a vowel or a
# pause, clear of the consonants the review named ("facts": its /f/ 37.05-37.21 and /k/ 37.38-37.50, its /ts/
# 37.50-37.63; "principles": /s/ 30.11-30.18, /z/ 30.43-30.56; "bans" /b/ 30.83).
LAMP_RUN_FRAMES = [0, 24, 36]
LAMP_RUN_GOOGLE = at_frame(1812)      # 30.200 (the /i/ after "princ-"), 30.600 (the pause), 30.800 (end of "and")
LAMP_RUN_HER = at_frame(2237)         # 37.283 (the vowel of "facts"), 37.683 (the /i/ of "is"), 37.883 ("not")
# S6's facade windows light 27.08-27.80, flash-safe: three switch-ons at these frame offsets from 27.10 (27.10 in
# "how it's", 27.45 in "used", 27.83 in the pause before the join window); REQUEST to L5.
WINDOW_TICK_FRAMES = [0, 21, 44]

# THE cue sheet: (t, sound[:variant], dB under the voice, note). Same idea = same sound; a sound's variants (`:k`,
# round robin: the same design, its own noise and micro-tuning, ONE pitch) keep its level relation, and every cue of
# one sound keeps the relation written here (a callback's -3 dB; Google's and her board sounds equal: ONE file):
# when one of them has to come down for the voice, they all come down together.
CUES = [
    # V2S1 Walking out (0.00-6.10): no music; air + canal (in the bed) + these
    (0.00, "pen_drawon", 20, "f0: the clean pen finishes drawing her, the door and W on (one stroke each, begun at -0.26 "
                             "under the un-build), the colour floods from the sun outward (f1-f18), her coat last"),
    (0.40, "lamp_click:1", 20, "her lamp at W clicks OFF: the biggest window goes dark (the first picture of 'quit')"),
    (0.45, "exit_ding", 9, "OUR exit ding, two struck glass-chime notes rising a fourth (C6 -> F6): the glass doors start "
                           "to slide (the first-second phone sound, DIRECTION rule 9)"),
    (0.45, "door_glide", 24, "the glass doors' glide under the ding, open on 'quit' 0.52"),
    (lead(0.97), "step_thup", 20, "she steps out onto the towpath ('Google' 0.97)"),
    (lead(0.97), "letter_pops", 26, "the canopy letters fill-pop one by one: a quick ripple, done by 1.08 (before 'Goo-' opens)"),
    (1.46, "wings:1", 16, "five far birds lift off the bridge rail (picture 1.40; far, heard a little later) and wheel "
                          "west: the claps in the pause after 'Google.'"),
    (lead(2.00), "ghost_tick:1", 14, "G1 pops (one soft wooden tick per ghost, ONE pitch) ('And' 2.00)"),
    (lead(2.53), "ghost_tick:2", 14, "G2 pops ('contract')"),
    (lead(3.20), "ghost_tick:3", 14, "G3 pops ('bans')"),
    (lead(3.80), "ghost_tick:4", 14, "G4 pops ('criticizing')"),
    (4.20, "ghost_tick:1", 14, "G5 pops"),
    (lead(4.79), "ghost_tick:2", 14, "G6 pops ('for'); the ambience dip 4.54-4.79 is in the bed"),
    (lead(4.98), "outline_pops", 15, "'life': three bare outlines pop in down the towpath (air puffs above 5 kHz; then air, no note)"),
    (lead(4.98), "ear_flap", 23, "Pip's leaf ears cover on 'life' (its one reaction)"),
    (5.95, "whoosh_dive:1", 12, "JOIN S1>S2, the A push-through into her dark window W 5.95-6.25: the air rises into it, "
                                "'through the glass' on the midpoint 6.10 (the plum bridge), settles, gone by 6.27"),
    # V2S2 The wall (6.10-12.98)
    (at_frame(407), "window_outline", 17, "'one': her dark window's A outline pops on (one frame), in the gap before 'one'"),
    (lead(8.44), "board_clack:2", 13, "the newsstand A-board slides out: TOLD THE BBC (the ONE board sound) ('But')"),
    (lead(8.96), "light_clicks", 19, "'staff': the five windows round hers turn a cooler white"),
    (lead(9.48), "notebook_flap", 19, "'BBC': the reporter's notebook opens"),
    (10.26, "blinds_five", 16, "'scared': five blinds drop to half one by one (10.26-10.60)"),
    (lead(12.20), "blind_thump", 15, "'contracts': the blind beside hers comes fully down"),
    (12.70, "notebook_clap", 14, "the notebook claps shut (map notebookShutAt 12.70: clear of the join window)"),
    (12.98, "lamp_click:2", 20, "JOIN S2>S3, the B match: her dark office window becomes her lit home window at M: her "
                                "lamp clicks ON (the thread's own sound: OFF at 0.40, ON here, ON again at 34.95)"),
    # V2S3 Her window (12.98-14.86)
    (14.71, "whoosh_dive:2", 15, "JOIN S3>S4, the A push-through into her silhouette 14.71-15.01, 'through the glass' "
                                 "on 14.86 (the callback, 3 dB softer)"),
    # V2S4 The walk home (14.86-20.55)
    (lead(15.07), "pop_high:1", 16, "her name tag pops (first build) ('She')"),
    (16.60, "pen_tick", 18, "the tag's second build (in the gap after 'AI')"),
    (17.66, "steps_stop", 19, "her last two steps; the stop lands at 17.96 ('objected')"),
    (lead(18.92), "plate_knock", 15, "'military': the DEC 2025 plate builds (wood knock + pop)"),
    (19.45, "pen_short:1", 17, "the APR 2026 plate pen-reveals, complete on 'heading'"),
    (lead(19.80), "wings:2", 19, "the flock flies west into the sun (19.78; the callback, 3 dB softer) ('heading')"),
    (20.40, "sun_through:1", 14, "JOIN S4>S5, the A push-through into the low October sun 20.40-20.70: a glass shimmer "
                                 "swells into the light and a small glass tink lands on the midpoint 20.55, 30 dB down by 'In' 20.67"),
    # V2S5 The far side (20.55-23.80)
    (lead(20.76), "blossom_pops", 18, "'April': the slot's trees burst into blossom in 4 frames (the calendar flip is retired)"),
    (at_frame(1317), "wipe_air", 17, "the lamppost wipes the backs at the crane's peak speed (22.02-22.19), its air pass centred 22.10"),
    (lead(22.44), "pop_low", 16, "'Pentagon': the plaque pops (the bed's soft accent 1 is here too)"),
    (lead(23.08), "window_warm", 22, "'use': the wing's windows warm on in ONE step: one far switch"),
    (23.62, "tree_wipe", 18, "JOIN S5>S6, the D wipe: one blossom tree crosses the lens right to left 23.62-23.98, its "
                             "rush peaking on the midpoint 23.80"),
    # V2S6 The gate (23.80-28.10): held; the board is uncovered by the wipe, it never lands (no clack)
    (lead(24.03), "pop", 17, "'any': the purpose line pops (never before the clause)"),
    (lead(26.50), "pop_high:2", 17, "'veto' (26.50): Lawful use: decided by the Pentagon (REQUEST: the line pops on this frame)"),
    (at_frame(1626), "window_ticks", 21, "the facade windows light: three far switch-ons, flash-safe (frames 1626 / 1647 / 1670)"),
    (27.95, "sun_through:2", 17, "JOIN S6>S7, the A push-through into the April sun 27.95-28.25: the same glass "
                                 "shimmer and tink, on the midpoint 28.10 (the callback, 3 dB softer)"),
    # V2S7 Google says (28.10-32.93): equal weight with S8's board (A5)
    (lead(28.36), "board_clack:1", 13, "GOOGLE SAYS: the header pops (THE same board file and level as hers)"),
    (lead(29.64), "pen_short:2", 17, "'AI principles' pen-builds, complete on 30.04"),
    (LAMP_RUN_GOOGLE, "lamp_run", 16, "the forecourt lights come on in a run: three switch-ons (frames 1812 / 1836 / "
                                      "1848; THE same file and level as hers)"),
    (30.74, "pen_long", 19, "'of any kind' pen-builds (THE same pen file and level as her quote)"),
    (32.70, "boat_pass", 15, "JOIN S7>S8, the D wipe: the narrowboat glides west past the lens 32.70-33.16, nearest on "
                             "the midpoint 32.93 (nothing starts before 32.70)"),
    # V2S8 Her words (32.93-39.08)
    (lead(33.16), "board_clack:1", 13, "the wipe clears: SHE SAYS (THE same board file and level as Google's)"),
    (lead(33.78), "ghost_tick:3", 17, "'can't': three ghosts pop ahead of her (3 dB softer, one pitch)"),
    (lead(33.78) + 5 / FPS, "ghost_tick:4", 17, "second ghost"),
    (lead(33.78) + 9 / FPS, "ghost_tick:1", 17, "third ghost"),
    (34.75, "door_latch", 16, "her door shuts behind her"),
    (34.95, "lamp_click:2", 23, "W lights: her home lamp ON (the 12.98 click; the 0.40 click's answer), 3 dB softer"),
    (lead(35.72), "cloth_wipe", 17, "'her words': the cafe owner wipes the board clean in one stroke"),
    (lead(36.54), "pen_long", 19, "her quote pen-draws on (THE same pen as Google's); its strokes end by 36.97, before 'facts'"),
    (LAMP_RUN_HER, "lamp_run", 16, "'facts': the lamps light west down the lane: three switch-ons (frames 2237 / 2261 / "
                                   "2273; = Google's run, never the ding)"),
    (38.82, "pen_unbuild", 16, "JOIN S8>S1, the un-build 38.82-39.08: the pen's line rewinds, turns into frame 0's "
                               "draw-on at the midpoint 38.95 and crossfades 15 ms into pen_drawon at the seam"),
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


def join_windows():
    """[(lo, hi, carrier name)] in which only the carrier may start."""
    return [(m - JOIN_BEFORE, m + JOIN_AFTER, snd) for (_, m, _, _, snd) in JOINS]
