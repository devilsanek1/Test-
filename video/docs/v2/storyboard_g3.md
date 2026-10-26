# Video 2, G3 storyboard (board v2): "The line that never ends"

Data: `public/v2/animatic.json` (`"style": "board"`, drawn by `src/v3/SketchReel.tsx`, composition `Animatic` in
`src/entry-v2.tsx`), built by `scripts/v2/build_board.py` (patterns from `scripts/v3/build_board_cine.py`). Sounds:
`scripts/v2/make_sfx.py` -> `public/v2/v2_*.wav`. Cold-read sheet: `scripts/v2/coldread_sheet.py` (one frame per panel at
its middle, the opening at 0.3 / 1.2 / 2.0 / 3.0 / 5.0 s, P8's start and landing frames, never inside a caption pop;
notes strip cropped). Lint: `python3 scripts/v3/board_lint.py public/v2/animatic.json` reports 0 errors and 0 warnings.
Voice: the owner's take 2 (`public/v2/voice.wav`, 0.12 s lead, 39.08 s); the film is 39.5 s. Frame-0 text **SHE SAYS:
NO CRITICIZING GOOGLE. FOR LIFE.** + "Her account to BBC News, 21 Oct 2026", now held to the end of O1 (6.12 s).
Board v2 (2026-10-26) is the fix round after board v1's sound-off cold read, cinematography check and standards check.
Story, core line, voice and every cut are unchanged.

**The story in pictures.** Her job contract, signed (chime), on her lamp-lit desk; her sleeve drops her GOOGLE badge in
a box and carries the box out. A highlighter marks the clause, in words: "no criticizing Google". Then the page runs past
its own end and pours off the desk, a year on every other row: 2030, 2040, 2050... Her nook, wide: she holds her contract
up and it runs down to the floor. Two other staffers, worried, NAME WITHHELD, at an interview mic. Back in the nook (medium)
her bubble pops: she IS talking. Over her shoulder, AI on her laptop. A new angle, close: worried, she tells the BBC.
Hard cut out of her room: a cold page stamped APRIL 2026, then the one big move, a rise over a low wall onto a Pentagon
too big for the frame, rows of parked cars at its foot. The deal's words in two quoted blocks (the oversight clause in
full), then, pulled back, NO VETO stamped beside the purpose line. Google's own page at the same size, on the same
ground. Her contract again, its line running on. In her nook her bubble says FACTS. Back to frame 0's bare lines.

## Camera plan and panels

| Panel | Time (s) | Line | The one idea | Drawing | Shot / framing | Move | Sound |
|---|---|---|---|---|---|---|---|
| O1 | 0-6.12 | She quit Google. And she says her CONTRACT bans her from criticizing it… for life. | She quit, and says her contract bans criticizing Google, for life: the expected end, then the line runs on for decades. | Frame 0 = bare lines ~85 % drawn, the room tone and fills flood 0.03-0.25; signature 0-0.25. 0.36-0.58 her sleeve brings the GOOGLE badge (170 px) to the centre, 0.70-0.92 drops it in the box, 1.24-1.82 carries the box out. 1.84-2.14 it brings a highlighter to the clause; 2.60-2.96 a light band sweeps under "no criticizing / Google" (v1's dark bar read as crossed out). 3.00-3.50 the page steps out past its edge (2030), 3.55-6.05 pours over the desk edge, faster and faster: 2040, 2050, 2060... | HOME BASE desk, COZY, INSERT high 3/4: one room tone; desk back edge, front face, right end + leg, floor line past it; shelf cut left, lamp shade cut right; paper pool 740 px | PULL OUT 1.05 to 1.00, ease-in (the one opening move) | 0.08 "signed!" chime, 0.92 badge clack, 2.60 marker squeak, 3.00-4.36 unroll, then near silence for "for life" |
| P2 | 6.12-8.36 | You'd think that's one odd contract. | One odd contract: hers. | She stands in her nook (long hair, the dark mass) holding her contract up; it hangs to the floor and runs on toward us. | HOME BASE nook, COZY, WIDE eye level: room tone, landscape glass 660 x 470 (15 %) with sill, one mullion, far roofs; shelf cut left, curtain right, soffit edge; lamp shade + paper pool on the desk; chair | HOLD | room tone |
| P3 | 8.36-13.24 | But Google's staff told the BBC they're scared to speak out, because of their contracts. | Other staff told the BBC they're scared, because of their contracts. | Two staffers (badges, no hair: not her) at an interview table, worried faces (head r 81), NAME WITHHELD over the one who spoke, a plain mic, CONTRACT on the table; an ordinary underline on "contracts" (12.20). | MEDIUM 2-shot, interview look (plain, not home) | HOLD | 12.20 pencil |
| P4 | 13.24-15.00 | So why is SHE talking? | Yet she is talking. | She sits at her mic (dark); her bubble pops on "SHE" (13.96). | HOME BASE nook redrawn at 1.4x (MEDIUM): glass cut by the band's edge and the right side | HOLD | 13.96 pop |
| P5 | 15.00-16.60 | She worked on Google's AI | She worked on Google's AI. | Over her shoulder (long hair): her laptop with the AI network on screen, the lamp, a paper pool on the mid desk. Name caption: Sofia Liguori · former research engineer, Google DeepMind. | COZY CLOSE, over the shoulder | HOLD | room tone |
| P6 | 16.60-20.52 | and told the BBC she objected to where its military work was heading. | Worried, she tells the BBC she objected. | Her face (head r 99, worried, long hair) turned to the mic; bubble on "told" (16.76); the window behind her. Nothing military, no Google lettering. Credit: BBC. | COZY MEDIUM CLOSE, new angle (3/4 front, window behind her) | HOLD | 16.76 pop |
| P7 | 20.52-21.32 | In April, | In April, a deal. | DEAL page, two signatures, APRIL 2026 stamp on "April" (20.76). Credit: The Information via Japan Times. | INSERT, cold (out of her room by a hard cut) | HOLD | cold air, date stamp |
| P8 | 21.32-23.80 | that meant a deal letting the Pentagon use its AI | The deal lets the Pentagon use Google's AI. | The cut lands on a wide: a low stone wall (coping + courses) hides about half of a Pentagon already cut by both side edges; the wall drops away and the whole five-ring building lands wider than the frame, two rows of identical parked cars (47 px, under 1/8 of P7's page) at its foot. No figures, aircraft, weapons or "Google". | SCALE (`scale: true`), S1 rise-over in two layers | RISE: camera 120 px + 1.00 to 1.04, unveil, 21.32-23.40 (lands on "AI"), hold 0.4 s; the wall's own 640 px drop, outSine over the panel | 21.32 swell |
| P9 | 23.80-25.96 | for "any lawful government purpose". | The deal's words, and its oversight clause in full. | The deal page (460 x 620): DEAL; block 1 "any lawful government purpose" (58 px, in quotes); a rule; block 2 "should not be used for domestic mass surveillance or autonomous weapons (including target selection) without appropriate human oversight and control" (34 px, in quotes, never cut). Credit: BBC. | INSERT close, straight-on (the scale cut back in) | HOLD | - |
| P10 | 25.96-28.20 | Google can't veto how it's used. | Google gets no veto. | The same page redrawn at 0.85x (both blocks whole) and a 330 px NO VETO stamp (the subject) slamming on "veto" (26.70) across the page's top edge, beside block 1, clear of block 2. Credits: BBC · The Information via Japan Times. | INSERT pulled back (the size changes at the cut) | HOLD | 26.70 stamp |
| P11 | 28.20-33.08 | But Google says it follows its AI principles, and bans retaliation "of any kind". | Google's side, equal weight. | GOOGLE SAYS (hand-lettered): it follows its / AI principles; staff can safely / raise concerns (FL 6.2, paraphrase, no quotes); bans retaliation / "of any kind". Underlines read along (30.04, 30.76). Credit: Statement to the BBC. | INSERT at the deal page's size, position, ground and tone | HOLD | paper tap, pencil x2 |
| P12 | 33.08-35.32 | She says she can't criticize Google. | She says she still can't. | O1's end frame (matched): the highlighted clause, 2030, the run-on; on "can't" (33.72) it pours on 200 px. Credit: her account. | HOME BASE callback = O1's end | HOLD | 33.72 short unroll |
| P13 | 35.32-39.08 | But in her words, "talking about FACTS is not criticising". | In her words: talking about facts is not criticising. | She sits at her mic; her bubble (the subject, 400 px) pops on "talking" (36.44) with FACTS, her word, hand-lettered. No document in it. Caption in quote marks, BBC spelling. Credit: BBC. | HOME BASE nook redrawn at 1.2x (MEDIUM-WIDE) | HOLD | 36.44 pop |
| LOOP | 39.08-39.50 | (room tone) | Back to frame 0. | O1's frame-0 strokes, bare, drawing on so each ends at exactly its frame-0 progress (the tail shows the desk 50-85 % sketched). | O1's start framing (1.05) | 0.12 s dissolve | room tone |

**Cinematography.** Home base about 22 of 39.5 s in two places that share one room tone: the desk (O1, P12, LOOP) and
the nook at three sizes plus a new angle (P2 wide, P13 1.2x, P4 1.4x, P6 medium close 3/4 front; P5 over the shoulder).
One break into the cold (P7-P11) by a hard cut, never through her window; one scale moment (P8, 2.5 s, the only big
move) with a scale cut in (P7's page to the wide) and out (to P9's page). Two moves in the film: O1's 5 % pull-out and
P8's rise; everything else holds and cuts on the voice. Size or angle changes at every cut except the deliberate match
P12 = O1's end.

**Fairness on screen (CORE_LINE §2).** "SHE SAYS" on screen for all of O1; the drawn clause is her account, credited
"Her account to BBC News" wherever her contract is drawn (O1, P2, P12); "for life" never in quote marks; the running line
only ever on HER page; "any lawful government purpose" always with the full clause, as two separate quoted blocks; NO VETO
only beside block 1; no war imagery, figures, aircraft or weapons; no "Google" lettering P6-P10; Google's page at equal
size, ground and tone, with its safe-channels line (FL 6.2); her bubble holds only her own word; she is a generic figure
with long hair and a name caption ("former research engineer"); credits name The Information via Japan Times for the
April reporting. Judgement call for the reviewer: the clause is drawn in words ("no criticizing Google", no quote marks,
under SHE SAYS) because the v1 squiggle line left cold readers asking what was banned; fallback = squiggles + the light
highlight band.

## Board v2: what the checks flagged and what changed

- **Cold read** (frames 4, 5, 6, 7, 13, 14, 18 of board v1): O1's dark bar read as crossed out -> a light highlighter
  band under the clause's words; the run-on read as an easel -> it carries years (2030-2060 on screen); P2 was "just a
  person at a desk" -> she holds up her contract and it runs to the floor, long hair says it's her; P3's silhouettes showed
  no fear -> worried faces, badges, an interview mic; P9 was a wall of text -> block 1 big, block 2 smaller and apart;
  P10's stamp was small -> a pulled-back cut with a 330 px stamp; the LOOP looked erased -> frame 0 drawn further (85 %).
  Not changed: "criticising" stays in BBC spelling inside her quote (script_g1 rule: exact quote).
- **Cinematography:** O1 gets a new event every few frames on the centre axis (badge, drop, box out, highlighter) and the
  run-on starts on "contract" (3.00), over the edge by "criticizing"; the desk reads high 3/4 with a second edge mass;
  the nook is a room tone with a 15 % light window, shelf left, curtain right; P4/P6/P13 are three sizes and an angle;
  P8 cuts in on a wide and lands with the colossus cut by both edges and a car ruler (move 2.08 s + 0.4 s hold); P9-P11
  change size at each cut, P11 on the deal page's ground; P13's bubble is the subject. Moves follow the newer house rule
  (two in the film), so P13 holds instead of pushing.
- **Standards:** all nine points fixed (frame-0 text to 6.12; "Her account to BBC News" on P2/P12 and frame 0; two quoted
  blocks; stamp clear of the clause; no document in her bubble; P11's ground; "staff can safely raise concerns";
  "former research engineer"; The Information via Japan Times).

**Tool changes (additive).** `SketchReel.tsx`: figure `hair: 'long' | 'bun'` (a generic cue, never a likeness).
`SketchIcons.tsx`: page row `=` (a highlighter band under a row's words); icon `cars` (a row of identical parked cars
with gaps, the ISOTYPE ruler for a colossus). `coldread_sheet.py`: STORYBOARD_STYLE §3 sampling (off caption pops; a
scale panel's start and landing). Captions: "can'tveto" split in the animatic's words (`voice_words.json` unchanged).
