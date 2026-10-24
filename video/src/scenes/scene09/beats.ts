// S09 beat table: ABSOLUTE film seconds on the recorded take (docs/storyboard_v3_resolved.json, assets/timing.json),
// converted to scene-local seconds by `local()` (local = absolute - the scene's start from src/data/scenes.json).
// Every beat is a word anchor; the comment names it the way the storyboard writes it.

/** The scene's start on the take (src/data/scenes.json S09.start = cut(day)). */
export const S09_START = 34.483;
/** The scene's end (cut(server @0.8) = the centre of the tram wipe into S10). */
export const S09_END = 39.634;
/** The S10 foreground wipe (the tram, this module's Wiper) runs end -0.25 .. end +0.25. */
export const WIPE_DUR = 0.5;

/** Storyboard beats (absolute s). */
const ABS = {
  cut: 34.483, //            cut(day): match-cut on the set point; dusk street, cart + crate already there
  but: 34.715, //            w112 'But': Pip (walking in since the cut) hops up onto step 2 beside the crate
  win1: 34.835, //           w112+0.12: a last lit window pops off; a lamp glow flickers once
  even: 34.98, //            w113 'even': two more windows pop off, right to left; pigeons shuffle
  dawn: 35.145, //           w114 'with': DAWN wipes up (0.4 s); the sun rises at the VP; peach band + rims
  the: 35.305, //            w115 'the': pigeons wake and hop; Pip stretches
  fix: 35.445, //            w116 'fix': the crate's lid pops open (new locks inside)
  out: 35.795, //            w117 'out': check tags pop up; 'still fixing...' struck, 'fixed!' scribbled; cart rolls off
  cutA2: 36.082, //          cut(out): HARD CUT, door #4 close; the keeper rises in beside the stoop
  drop: 36.23, //            w118+0.05 'somebody': the old lock drops (clunk), Bit rides it, hops off, scurries up
  lift: 36.43, //            w118+0.25 'somebody': Pip lifts a new lock from the crate (hold)
  still: 36.705, //          w119 'STILL': GAG: Pip hands the lock to the keeper
  lockOn: 36.765, //         w119+0.06: the new lock pops onto door #4 (overshoot)
  check: 36.805, //          w119+0.10 'still': its check strokes on (0.17 s, finishes across the hidden cut)
  hidden: 36.915, //         w120-0.05 'has': HIDDEN MATCH-CUT into the hillside; the pull-back starts from rest
  to: 37.215, //             w121 'to': row 0's neighbours resolve; the keeper walks #4 -> #5
  install: 37.385, //        w122 'install': Pip hops onto the screen-space bollard (0.75)
  path: 37.635, //           w122+0.25: the keeper's dotted path draws on; door #3's plaque glints
  it: 37.845, //             w123 'it': rows 1-3 pop as the caption floor passes (revealFloor)
  every: 38.16, //           w125-0.05 'every': upper terraces tile outward; walls + stairs
  single: 38.505, //         w126 'single': door #4's check flag pops + one ink ring pulse
  land: 38.555, //           w126+0.05 'single': the pull-back lands (still from here to the tram)
  tags: 38.605, //           w126+0.10 'single': EMPTY check-box tags pop over every other door (0.6 s wave)
  server: 38.865, //         w127 'server': the sun crests the ridge (r150); terraces extend at the side edges
  kneel: 39.115, //          w127+0.25 'server': the keeper reaches door #5 and kneels; far window dots twinkle
  snail: 39.215, //          w127+0.35 'server': the snail crawls along Pip's bollard, Bit riding its shell
  sigh: 39.334, //           cut(server @0.8)-0.30: Pip sighs (sit-back squash pulse)
  end: 39.634, //            cut(server @0.8): the tram wipe's centre; the sun takes off behind the tram
} as const;

export type BeatName = keyof typeof ABS;

/** Scene-local beat times. */
export const B: Record<BeatName, number> = Object.fromEntries(Object.entries(ABS).map(([k, v]) => [k, +(v - S09_START).toFixed(4)])) as Record<BeatName, number>;

/** Scene-local time of an absolute film time. */
export const local = (abs: number) => abs - S09_START;
