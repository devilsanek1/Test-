# v3 rework assembly: the integrator (transition agent), 2026-10-28 (IN PROGRESS)

Requests applied (code in 9dd6f49, checked after the resume):
1a. home_set homeCam: a PARALLAX float in SQB (room = the float, the window view FAR_FLOAT_K 0.25 of it; home 6.45, back by 15.95).
1b. From 6.35 the mug and the pen cup take one Haze step (k 0.25 toward EMBER.wall): their share of SQB's top-3 % salience
    12.5: 4.9 + 9.4 % -> 0 + 0 %, 14.95: 8.7 + 9.9 % -> 0 + 0 % (the card 76 -> 82 %, 58 -> 64 %).
1c. home_set exports TEACUP; SQB's steam reads it.
2.  flow_v2 §4 SQB: the first doodle ~2010 (10.32-10.50), the BETTER one ~2015, the 11.80 dot pop, the 14.74 step-back.
3.  Judged: the tag's tug window ends 18.60 (was 18.90): at 18.88 THE stick holds 100 % of the top-3 % (was 68 %, the tag 31 %).
4.  Skylight snow starts at J1's seam (kit Snowfall opt-in `enterAt`); the 6.35 calm is one 0.6 s settle (window, thread
    REST, desk darks), never a 2-step switch: the phone's per-frame change mid-pan 2.4 L* -> <= 0.25 L*.
7.  SQA vs the pilot code (2394c29), 61 frames at full size: the skylight flakes in 5.70-5.78 are gone; what is left
    (anti-aliased edges, <= 500 px at <= 43 levels) differs as much between two runs of the SAME code: renderer noise, invisible.
