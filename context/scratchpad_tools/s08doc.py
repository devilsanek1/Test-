p='/home/user/Test-/video/docs/scenes/S08.md'
s=open(p).read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt, (old[:90], s.count(old))
    s=s.replace(old,new)

new_sec=open('/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/s08sec.md').read()
anchor="## A1 fix round 1 (integration polish, after the usage-limit relaunch)"
rep(anchor, new_sec+anchor)
rep("""| 2.335-2.695 | 'Cloudflare': the shield dome's arc draws from both feet and CLOSES on the word; the glass, the plinth and the district towers pop; 2.445 dolly push 1.0 -> 1.15 toward x 560 |
| 2.55 | the board rises with L8 (alone 1.70 s) over its pencil construction (flag outline, dashed tally frame, two dashed stamp slots) |""","""| 2.335-2.695 | 'Cloudflare': the colossal dome's arc draws from both feet (rising from behind row 2) and CLOSES on the word; the glass and the far district pop; 2.445 dolly push 1.0 -> 1.15 toward x 560 |
| 2.55 | the board rises with L8 (alone 1.70 s) over its pencil construction (solid tan strokes: flag post + pennant, two tally baselines, one rule per stamp slot) |""")
rep("""| 0.00-0.30 | the sun keeps S07's slide and brakes over 9 frames (to y 1062), then swells to r260 (0.3-1.9) while windows pop row by row |""","""| 0.00-0.30 | the far plane (sun, peach band, rows 0-1, dome) keeps S07's slide and brakes 41 px over 9 frames together (`farBrake`), easing back by 2.0; the sun swells to r260 (0.3-1.9) while windows pop row by row |""")
rep("""| 4.77 / 5.14 / 5.73 | 'they' 6 / 'tens' +10 / 'thousands' +24 attempters heap up OUTSIDE the left flank (one clump per word, the glass ringing bigger each time); gates 2 / 3-5 / 6 + the first overflow gate across the frame |
| 6.36 | 'hacking': the beam swings down onto the heap's contact with the glass, a cream pool lights the people outside, the caught wall figures flash cream |""","""| 4.77 / 5.14 / 5.73 | 'they' 6 / 'tens' +10 / 'thousands' +24 attempters heap up OUTSIDE the left flank, rising from behind row 2's roofs (one clump per word, the glass ringing bigger each time); gates 2 / 3-5 / 6 + the first overflow gate across the frame |
| 6.36 | 'hacking': the beam swings down onto the heap's contact with the glass and FLARES (3 frames), a cream pool lights the people outside, the glass rings (r 30), the caught wall figures flash cream and recoil 1.2x with impact ticks, +6 attempters join the heap |""")
rep("""- **Dome** `DOME8` {cx 310, by 1080, rx 172, ry 212} (A1): left of the board (storyboard 180-600) with its right flank""","""- **Dome** `DOME8` {cx 320, by 1132, rx 205, ry 318} (A1 r2; storyboard feet 180-600, apex 830): left of the board, its foot behind row 2, its right flank""")
rep("""## Checks (A1 fix round 1)""","""## Checks (A1 fix round 2)

- QA gate (`bash scripts/qa/run_all.sh S08`): **PASS, life 10.0/10**, 9.04 events/s, max gap 0.80 s, longest dead run
  0.10 s. Framecheck 0 errors, 2 ui-zone warnings (right-rail edge density: the city right of the board; the bottom
  band: the neighbours' reaction f262-f278 and the dusk relight f302, accepted, item 12).
- camspeed (`python3 scripts/camspeed.py S08 --allow=0-0.45,9.55-9.65`): OK (camera peak 25.4 px / frame inside the
  crane allow window); WARN only: fast local motion 20.3 px / frame at 3.13-3.17 s (the searchlight switch-on / board).
- Main f719-f733 (S07 cut): measured in item 11. Main f1032-f1036 (S09 cut): sky, stars and the set point unchanged.
- `npx tsc --noEmit`: clean for the S08 files.
- Render cost: **220 ms/frame** at 1080 x 1920 (12 frames over the scene, concurrency 1, incl. page setup, load ~3.9).

## Checks (A1 fix round 1)""")
rep("""## Known gaps / requests
""","""## Known gaps / requests

- A1 r2: the near pair's 'millions' reaction stays in the bottom UI band (accepted, item 12). The heap figures (25-32 px)
  are a deliberate cheat against the far district's scale: people pressing a far, colossal glass must read at phone size.
""")
open(p,'w').write(s)
