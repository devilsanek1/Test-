# T1 "Into the Sunset": camera-journey treatment for the finished v2 film (39.08 s)

Treatment writer T1 (lens: one continuous camera journey through one living world), 2026-10-27. Read with `../house_digest.md` (HD), `../beat_map.md` (BM),
`../teardown.md`, `../toolkit.md` (TK). Clock: take 2, `public/v2/voice.wav`; f = round(s x 60) at 60 fps. Nothing comes from the dropped production (no desk,
contract page, scroll of years, cat, sealed room or its palettes).

## 1. Title, concept, why it works
**Into the Sunset.** One travelling camera spends one October evening with her on a London canal: out of Google's door into the sunset, along the water past
the staff's windows, west through the setting sun to Washington in April for the deal, and back at dusk to a bench facing the door, where the film loops.
- **Stop:** frame 0 is a golden canal being drawn under SHE SAYS: NO CRITICIZING GOOGLE. FOR LIFE., a bright chime, a small woman walking out into the sunset.
  By 2 s it turns: on each clause the sun steps down and her shadow stretches back until, on "life", it touches Google's door. She is out; the reach (she
  says) is not.
- **Understand:** BEFORE "once you quit, you can say what you like". AFTER: she walked out but says her contract still reaches her; staff told the BBC the
  same fear (three blinds come down); she talks anyway because what she talks about is on the record (dated posts on her towpath, the deal's own words on a
  billboard, a gate closing on Google), and Google's answer stands on the same kind of board in the same light. The walk's places carry the facts, so the
  payoff lands unnarrated and the loop replays the walk "as facts".
- **Share:** the shadow touching the door under the frame-0 words (the cover), and the crane landing on the Pentagon under the same sun.

## 2. The world, the light, the palette
**One world under one sun.** A canal quarter in London (generic, no real address). North bank: a long brick-and-glass office, "Google DeepMind" hand-lettered
in ink on its canopy (never the logo or its colours), its plaza, the far towpath, a footbridge west of the door. Our south bank, west to east: the bridge
foot, a newsagent kiosk with two A-boards and a bench straight across from the door (**View B**), two dated posts, a café terrace; behind, a London roofline
(chimney pots, a spire, cranes); a floating-bookshop narrowboat. Through the sun: **Washington, late April**: a rooftop terrace south of the Pentagon, the
Pentagon, the Potomac, the far city and the Washington Monument; a billboard by the Pentagon's delivery gate.
**Time = light.** Golden hour (W01) -> sunset (W02-W04) -> Washington noon, late April (W05-W06) -> afterglow dusk, lamps on (W07-W09) -> un-build -> golden.
October leaves in London, blossom and tulips in Washington: the season says without words that the deal came months before she quit (BM V13). Never
night-black: dusk is a light rose sky; captions dark ink all film.
**Palette: new house sister "10 Towpath" and one cool sister "10b Spring" for Washington only** (the owner's taste signal: a clean, calm page for a serious
story, a cold sister only for the scale beat). Measured CIE L*/C*:

| role | 10 Towpath (London) | 10b Spring (Washington) | job |
|---|---|---|---|
| page / sky | golden `#F7E6D2` (92/12) -> sunset `#F4CDB8` (85/19) -> afterglow `#E9C9C6` (84/12) | `#E4EEF0` (93/4) | >= 50 % light fills; the caption field |
| ground / walls | paving `#EED3BD`; soft apricot brick `#E2A98A` (C <= 25); glass `#C9DCE0` | limestone `#F1E6D3`, shade `#B8C7D3` | many light fills, never one slab |
| cool field | canal `#9FBFC4` (75/11), dusk water `#93A9C2` | Potomac `#A9CBD3` | the >= 10 % opposite temperature |
| hero | canal green `#00876E` (50/38) | same | HER coat and the statement objects (A-board frames, posts, billboard band); never Google's building, the Pentagon or dressing |
| anchor | aubergine `#3A2433` (18/14) | same | railings, lamp posts, silhouettes, ~5 % |
| disc = pop | sun orange `#EE6B2E` (61/73) | same | the sun; look-here only (<= 3 %): the door spark, the REC dot, the date tabs on "facts" |
| caption | box peach `#F6B892`, ink `#2B1B0A` (13.6:1 golden, 10.8:1 afterglow) | same | dark ink captions all film |
| shadow / lamp | plum-red-brown `#A65E4E` on warm, blue-plum on cool; lamp `#F7C98B`, core `#FBE6C2` | cool lilac shade | colour, never grey |
| confetti (< 1 % each, C <= 28) | narrowboat reds and creams, awnings, coats, leaves | blossom `#F2C4CC`, leaf `#8DBE8A` | life, never fields |

Why it fits: v1's bright, legible charm (cream page, apricot brick, one orange sun) with a calm green hero instead of an alarm colour; no violet or cobalt
wash; dusk, not night, keeps the light page through the payoff.

## 3. Cast
- **Her** (never a likeness: an invented look, hair under an oat knitted hat): canal-green coat (hero), a tote, a small potted plant under her arm (her tell
  in crowds; it ends on the bench beside her). 85-100 px walking on the far bank, 120-140 px on the bridge, <= 210 px seated from behind at the café (her
  largest), 150 px on the bench. Back, rear 3/4 or walking profile; no face, no waist-up.
- **Google's staff:** three small window figures (50-70 px, faceless backs, phones at the ear) on three floors; never more, never a row, never named; they
  lower their own blinds (fear, not surveillance: BM V12). **The reporter** (the BBC, unbranded): a small back beside her at the café, a notebook and a
  recorder whose REC dot is the pop. **Google** appears only as its building, its words on a board and, in Washington, a cream van hand-lettered "Google" with
  a courier. **The Pentagon:** its building and one civilian worker in shirt sleeves; no uniforms, guards, flags or seals.
- **The public (= us), about half at rest:** 2-3 backs cut by the bottom, a cyclist, a jogger, pigeons (hook); 6-8 crossers, a busker, a dog (bridge); the
  bookseller, a browser (boat); 4-6 patrons, a waiter (café); two lunch-break workers (the crane's pivot), joggers, specks on the Pentagon's paths, 3-4
  readers at the billboard (Washington); walkers home, a cyclist's lamp, the newsagent, two readers per A-board (dusk).
- **Pip, redrawn NEW** (new geometry and rig code; `src/lib/mascot` studied, not shipped): "towpath Pip", a cat-sized round elephant, pear body, two big
  lily-pad ears, a short curled trunk, a tuft, an oat scarf (`#D9BE8C`) lifting in the wind. Lavender `#9D97CF` (C31, under the hero), shade `#7E77BE`, ink
  ~3.4 px tapered, fill offset 3/2 px; ΔE76 >= 36 from every ground; 86-110 px; never in the caption band, the right rail or over the subject. One reaction
  per shot at most, never on the subject's own beat, never a gag near harm: W01 on a bollard, tail wags at the freedom, ears-cover on "life"; W02 trots the
  bridge rail, shrugs on "odd" (the false relief); W03 rides the boat roof, head up to the windows before "staff", ears droop on "contracts"; W04 head tilt on
  "she", turns west 6 frames before "objected", leaps for the sun; W05 lands on the parapet with a wobble, a petal on its head, the scale anchor; W06 an ear
  flick on "veto" from the billboard post; W07 upright facing Google's board, no reaction (BM V14); W08 curled against her tote; W09 looks up at the posts on
  "facts", then hops to its frame-0 bollard as the world un-builds. Pip crosses every change of place.

## 4. The opening, frame by frame (W01: one continuous shot, View B, a slow 5 % pull-out 1.05 -> 1.00 over 6 s)
View B: eye level across the canal, looking north. Sky y 0-600 (captions); the sun low at the left (x 70-250, y 650-830); the office across the water (its top
at y 610 or lower), its door at centre (x 480-620, y 960-1040); the far towpath runs left to the footbridge; water y 1040-1110; our bank: the empty bench, the
kiosk cut by the left edge, an unlit lamp post, Pip on a bollard (x ~620, y 1150), 2-3 backs cut by the bottom. Frame-0 block: **SHE SAYS: NO CRITICIZING
GOOGLE. FOR LIFE.** (2 lines, "FOR LIFE." boxed) and a small "Source: BBC News, 21 Oct 2026"; the words yield to spoken captions at ~1.9 s, the source stays
to 6.28 (BM A2).
- **f0:** bare ink only, every shape drawn (the sun a ring, the facade grid, the bridge, her figure inside the glass door).
- **f1-f18 (to 0.30):** colour floods shape by shape from the sun outward (`<Look cascade>` origin = the sun): sky, bridge, facade bays, water, our bank last;
  Pip's fill at f10, a blink at f14. **f7 (0.12) "She":** the glass doors slide apart. **f18 (0.30):** our two-note chime as she steps into the light.
- **f24:** six plaza pigeons lift, 0.06 s apart. **f31 (0.52) "quit":** she turns left and walks; the plant's leaves bob. **f40:** Pip's ears perk. **f45:** a
  cyclist crosses against her. **f58 (0.97) "Google":** the canopy letters fill-pop one by one. **f66:** a moored boat's chimney puffs (every 0.5 s).
- **f78-f120 (1.30-2.00), the expected thing:** she walks into the gold toward the sun; pigeons wheel onto the bridge rail; ink glints tick on the sun's rim;
  a window switches on; Pip's tail wags; her shadow is short (~60 px).
- **f120 (2.00) "And", reality starts:** the sun steps down (a 30 px stepped drop, 0.12 s out-ease); her shadow jumps back toward the door. **f152 (2.53)
  "contract" [boxed]:** step 2, the shadow 260 px; Pip's head turns from her to the shadow. **f192 (3.20) "bans":** step 3, 340 px; the pigeons turn their
  heads.
- **f228-f271 (3.80-4.52) "criticizing it":** the shadow's head crosses the plaza and climbs the steps; on "it" it touches the door's threshold: three tiny
  pop-orange ink ticks spark there. **f272-f287, the "…":** she walks on, the shadow stays, a puff.
- **f299 (4.98) "life" [boxed], the sting:** step 4, the sun's rim touches the far roofs; the light steps golden -> sunset (one flat `tod` wipe, 0.2 s); 40+
  windows switch on in 4 frames (the burst); Pip ears-cover; the ambience stops dead; the full-length shadow still touches the door (cover frame f290-f299).
  **f300-f336:** she reaches the bridge stairs; a jogger passes. **f337-f377:** the camera pans left after her (T1).
One unit of cause = one visible tick: each clause is one sun step and one jump of her shadow (CG "show the real mechanism").
**The loop:** W09 pulls back onto exactly this framing at zoom 1.05 (dusk, her and Pip on the bench); 38.80-39.08 (f2328-f2345) it un-builds (fills shrink,
ink retracts, the sky slab last) to View B's bare lines = f0; the door glass starts to slide at f2342, 3 frames before the seam; the chime returns at 0.30.

## 5. Shot list (9 shots; every change of place a move, a match or a carried cut; captions y 317-556 on flat sky in every frame)
**W01 Out the Door** 0.00-6.00, "She quit Google. And she says her contract bans her from criticizing it… for life." Section 4. BUSY. Explains: she walked
out, but (she says) the contract still reaches her. Out: T1, a ~25° pan left (5.62-6.40, detailed layers <= 15 px/f), camera-continuous.
**W02 One Odd Contract** 6.00-8.26, "You'd think that's one odd contract." Fg: our lamp posts lighting one by one, the kiosk awning edge, two backs. Mid: the
footbridge at an angle; she crosses in profile, a silhouette against the low sun, among 6-8 crossers, a busker, a dog; Pip on the rail. Bg: the sun on the
roofline. The pan lands into a 2D float; leaves blow across; the bookshop boat noses out from under the bridge (7.6). DENSE-CALM, the one breath beat.
Explains: the viewer's guess: she is one ordinary person in an ordinary crowd. Out (8.08-8.44): Pip hops down onto the boat roof; the camera tilts down and
pans right with Pip onto the moving boat, the arch's dark underside passing the lens at 8.30.
**W03 Behind the Blinds** 8.26-12.98, "But Google's staff told the BBC they're scared to speak out, because of their contracts." A truck east at boat pace
(60-80 px/s), level across the water. Fg: the bookshop roof moving with us (book crates, a newspaper rack, a bike, the smoking chimney, the bookseller), Pip,
and its A-board, readable all beat: **TOLD THE BBC** / One Google staffer would only talk without a name, "for fear of retaliation" / Source: BBC News, 21 Oct
2026; mid: the far towpath. Bg: the wing sliding left, dozens of ordinary lit windows (plants, lamps, a whiteboard, someone stretching). Windows 1-3 slide in
at 8.96 "staff", 9.48 "BBC", 10.1, each a small figure on a phone; **10.36 "scared": the three blinds drop halfway, 0.15 s apart; 12.20 "contracts": a small
lamp-lit page pops on each desk under the blind** (illustrative, no lines). BUSY. Explains: not one odd contract: a few staff, in their words to the BBC, keep
it behind the blind. Out (12.81-13.16): the café awning's post passes the lens (pole wipe) as the truck slows.
**W04 On the Record, Heading West** 12.98-20.38, "So why is she talking? She worked on Google's AI and told the BBC she objected to where its military work
was heading." From behind her café table, looking north. Fg: the reporter's shoulder cut by the left edge; the table (her plant, two steaming cups, the
recorder). Mid: she (back, seated), the railing, Pip, the water. Bg: the east wing, its upper lab windows; string lights in the gutters. Locked, then a float.
**14.28 "talking?": the REC dot pops**; **15.10 a hand-lettered tag on a thin leader: "Sofia Liguori · research engineer, Google DeepMind · 3 years · resigned
Oct 2026"** (BM A6); **15.6-16.12 "Google's AI": the lab windows light floor by floor, whiteboards draw node-and-arrow diagrams**; **17.96 "objected": she
turns her head west**; 18.00-19.70 a ~45° pan west along her gaze to the bridge and the low sun; **18.92 "military": the near post pops its sign: DEC 2025 ·
Google's Gemini goes on the Pentagon's GenAI.mil · unclassified work · Fox Business; Decrypt** (BM F8); **19.40 the fingerpost beyond: APR 2026 · classified
work ->, pointing into the sun**; birds fly west. DENSE-CALM to 17.9, then BUSY. Explains: an insider who objected, and the direction of travel (unclassified,
then classified) as places on her towpath. Out (19.70-20.67): the camera pushes along her gaze; the sun grows to its match spot (x 170, y 720, r 110: left of
W05's slot and tower, under the caption band).
**W05 The Same Sun** (the S5 pull-back crane, the film's one big move) 20.38-23.95, "In April, that meant a deal letting the Pentagon use its AI for". In: **a
match cut on the sun at 20.38** (the act-break breath): same disc, same spot, high in a cool spring noon. Start (CG S5): warm dark rooftop clutter (a
stair-tower x 600-1080 to the bottom edge, an AC box x 0-240, a parasol, tulips, coffee steam); two lunch-break workers (backs, 3/4, heads turned right),
centre x 470, heads ~180 px from y 1060, cut at the hips, looking at the slot (x 240-600, y 780-900, the brightest, coolest patch). Move 20.40-23.15 on
`s5Ease` (0.55, 0.03, 0.50, 1.0): dolly back, crane up and a ~70° arc round the pair on one ease (pivot x ~0.45 W, roll 0); p 0.15-0.40 the tower stands where
the landmark will land; p ~0.48 a blossom branch wipes the pair (its own >= 10-frame window); p 0.50-0.55 the light burst (a pale flat cloud bank); **p 0.77
(22.40; "Pentagon" 22.46) the Pentagon's near corner rises past the tower**, landing by p 0.96 (23.05). End (hold 23.15-23.95): horizon 0.46 H; the Pentagon
centre-right (x 380-1000, y 860-1080) seen off its corner, deliberately widened so the five sides and ring courtyard read at 216 px; parking, curving roads,
the lagoon, the Potomac, the far city; the Monument (x ~760, top y >= 620) in the gap of a flat hero cloud bank (>= 1 W); the tiny pair at the parapet (heads
y <= 1200, clear of the UI band) with Pip; a parapet plaque "Deal reported Apr 2026 · The Information via Japan Times; 9to5Google" (BM A3). **23.08 "use": a
ripple of window-dots flips to a cool screen tint round the facades** (people at screens: the only reported kind of use, BM F8); birds, petals, a jogger;
every CG scale cue (6 planes, flat steps 0/12/22/40/65 %, nothing ends in frame). Explains: what "heading" meant: a deal with the Pentagon, vast, across the
ocean, months earlier. Out (23.95): a cut on Pip's hop, onto the quote's first word (the one cut outside a >= 0.3 s pause).
**W06 The Deal** 23.95-28.06, "\"any lawful government purpose\". Google can't veto how it's used." Eye level, straight-on, a 2D float. Fg: 3-4 readers' backs
cut by the bottom. Mid: a roadside billboard on two posts (x 100-880, y 610-1030), hero-green band: **GOOGLE – THE PENTAGON (US DEPT. OF DEFENSE) · APRIL
2026** / big: **"any lawful government purpose"** / It "should not be used for domestic mass surveillance or autonomous weapons (including target selection)
without appropriate human oversight and control" / Reported Apr 2026 · The Information via Japan Times; 9to5Google. Bg, between the posts: the Pentagon's long
limestone facade (cut by both edges), a delivery gate with a barrier arm, a roller door; blossom in the gutters; the cream "Google" van at the right. 24.03
the quote pops; 24.3-25.5 the clause draws on line by line (BM V9: whole and readable 24.03 to the wipe at 27.90); **25.96 "Google": the courier wheels a
plain rack of computers lettered "Google AI" through the gate** (an illustration of the handover, not of how the software is installed); **26.50 "veto": the
barrier drops behind the rack, the courier outside**; 27.08 a civilian worker wheels it in, the roller door comes down, the courier turns back. BUSY (insert).
Explains: the deal's exact words with their limits, and that once handed over Google has no say (BM F12, no judgement). Out (27.82-28.31): the van pulls away
across the lens, its long cream side the wiper (`foreground-wipe`, element 'scene') into London.
**W07 Google Says** 28.06-32.93, "But Google says it follows its AI principles, and bans retaliation \"of any kind\"." London, afterglow, lamps on, at the
kiosk. Its LEFT A-board (x 140-740, y 600-1240, hero-green frame; the newsagent pins the sheet at 28.30): **GOOGLE SAYS** / it follows its AI principles /
"...compliance with our acceptable use policies and AI principles" / it bans retaliation / "...strict workplace policies in place to prevent retaliation of
any kind" / Statement to the BBC, 21 Oct 2026; lines pop with the voice (28.36, 30.04, 30.84, 32.08). Behind, across the water: the office and the frame-0
door, windows switching neutrally; readers, walkers home, a cyclist's lamp, chimney smoke. Float, DENSE-CALM, uninterrupted to 32.70; same light, size and
temperature as W08 (BM A5). Explains: Google's side in its own words, answering the deal (principles) and the fear (retaliation). Out (32.70-33.16): a truck
right along the kiosk, the lamp post passing the lens (pole wipe).
**W08 She Says** 32.93-36.36, "She says she can't criticize Google. But in her words," The kiosk's RIGHT A-board, same size and frame (inside x <= 880): **SHE
SAYS** / her contract bans her from criticizing Google, for life / Sofia Liguori to the BBC · Source: BBC News, 21 Oct 2026 (BM A1, V5). Beside it the bench:
she (back, 150 px), the plant, Pip; across the water, the office and its door. **33.78 "can't": the lamp over the bench flickers on and her shadow springs
long across the paving toward the door opposite** (the hook's callback); a narrowboat lantern glides by in the pause; **35.72 "words": the newsagent pins a
new sheet: SHE SAYS / "…talking about facts is not criticising" / Sofia Liguori to the BBC · Source: BBC News, 21 Oct 2026** (exact, British spelling: BM A7).
DENSE-CALM, float. Explains: back to her claim, still hers, then her own words.
**W09 Facts** 36.36-39.08, "\"talking about facts is not criticising.\"" The one mid-size move: from W08's framing the camera dollies back and rises gently
(36.45-38.60) onto View B at zoom 1.05: the A-board shrinks (quote and source still in frame), the bench and her small, the bridge at the left, the two dated
posts we passed at the right. **37.12, ending before "facts": their date tabs pop in the pop orange, DEC 2025 then APR 2026** (the record she talks about;
Google's board does not pop: BM §5 Q9 d). 38.80-39.08 the un-build to frame 0. Explains, unnarrated: what she talks about is the sourced record we travelled
through.

## 6. The scale moment and the cozy home base
**Scale (W05, 3.57 s, 9 % of runtime, the one big move):** from two people on a lunch break to the US Department of Defense, under the sun she was watching;
GREAT on every cue (the world past every edge, the Monument huge yet far in the cloud gap, tiny anchors, the drop under the parapet), and daylight, blossom,
people at work: vast, never monstrous (BM V3). Agency follows within 5 s (W06); it is the one break of the coziness; the heaviest line ("can't veto") has no
cute props. **Cozy home base: the south towpath** (RIVERSIDE: level across water, the far facade as backdrop, one lane of life, the water as moat): the bridge
breath (W02), the café (W04 to 17.9), the kiosk and her bench under one lamp (W07-W09), held by the facade belt and the kiosk awning, with a lamp pool, steam,
her plant and Pip as signs of care: 18.2 s of the 35.0 s outside the W06 insert (52 %). Cozy holds lock or float (8-15 px/s), never zoom.

## 7. Sound
**Bed (new, composed on this film's cut grid with `bedkit.py`, `sampler.py`, `instruments.py`):** "canal evening": a pizzicato cello/bass walking line in a
slow 6/8 lilt (her footsteps), harp and celesta glints for the sun, a warm solo clarinet 3-note motif (her), soft strings as air. 0-4.98 **air only** under
the voice; **4.98 "life": everything stops** (the stop is the effect); 6.28 the walk enters, light (false relief); 8.44 cello, minor, steady; 13.16 an open
fifth (the question); 15.07 warmer; 20.38 the register opens in Washington; **accent 1 at 22.46** (harp and low strings, no boom); thinned under the clause;
28.31 Google's side with the same instruments and level as hers (no minor turn, no sting); 33.16 clarinet alone; **accent 2 at 37.18**, the motif resolving on
"facts"; the tail wraps into 0.0's air. Median ~27 dB under the voice, never under 12 dB, -14 dB duck; cuts on beats (`beatsync.py --fit-tempo`).
**SFX (new, `audio/tools/make_v2r_sfx.py`; on visual hits, >= 8 dB under the voice, never over a key word):** 0.10 paper "fwip" (the flood); **0.30 our
two-note chime with a soft sent-swoosh (the positive phone sound)**; 0.97 pop_high (letters); 2.00/2.53/3.20/4.52 wooden ticks on the sun steps, each softer;
4.98 a low soft pop and a 4-frame click cascade (windows), then silence; 8.30 a thud (Pip on the roof); 10.30-10.60 three blind slides; 14.28 a tiny "bip"
(REC); 18.92 pop_high and a wood knock (post); 20.38 an air pop into the Washington bed (birds, far traffic); 23.08 an LED tick cascade; **26.50 a dry barrier
clack (plain, never a sting)**; 27.82 van pass-by; 28.30 and 35.72 the **same** paper-and-pin tap for both A-boards; 33.78 lamp tink-hum; 37.12 two tiny pops
(tabs); 38.80 reverse "fwip" into the loop. Ambiences 20-25 dB under. `audio/mix.py` -14 LUFS / -1 dBTP, circular tails; `qc.py --loop`.

## 8. Fairness and facts (BM §4, checked frame by frame)
- **V1/V2/V17:** no war imagery; Washington is lunch, blossom, an office building and a delivery gate; "Google" never near weapons, targets or strikes; no
  Israel, Hegseth, Trump; never "Department of War", "secret" or "exclusive". **V3:** Google's building is sunlit in the hook (she is backlit); the Pentagon
  is ordinary daylight. **V4:** an invented figure with a hat and a name tag; staff faceless, unnamed; the narrator reads every quote.
- **V5/A1:** "for life" appears as text only under SHE SAYS (frame 0, W08), never in quote marks; the shadow is her claim made visible under those words,
  never a stamp or term. **V6:** no contract document, only three tiny illustrative pages (W03); quote marks only on exact words (F5, F10, F11, F13, F14,
  F18). **V7/V8:** no tape, padlocks, chains or cages (the blinds are the staff's own; the barrier closes on a rack, never a person); no gavels or verdicts.
- **V9/A4:** never the purpose line without the whole clause, readable 24.03-27.90. **V10:** no blank cheques; the screen ripple is office use (F8); "can't
  veto" = Google outside the gate, nothing more. **V11:** three windows, never a row, count or staff crowd. **V12:** no cameras, eyes or escorts; the camera
  is never in Google's windows looking out at her. **V13:** the deal in April blossom, never near her. **V14:** Google's beat uncut, no irony, Pip neutral.
  **V15:** no logos, BBC graphics, seals or flags. **V16:** "heading" = two dated posts.
- **A2/A3/A8:** sources on objects: the frame-0 block (0-6.28), the boat's A-board, the plaque and billboard (deal), the posts, "Statement to the BBC" (W07),
  her board. At a glance: A-boards headed SHE SAYS / TOLD THE BBC / GOOGLE SAYS = accounts and Google's words; dated posts and the billboard = the record.
  **A5** equal boards, measured; **A6** name tag; **A7** British spelling; **A9** nothing after the payoff; **A10** AI label on.

## 9. Production
**Build NEW** (owner rule: no v1 sets, v3 kit, `src/lib/kit` people or placement components, cine generators, stock Pip or house bed), in `src/v2r/` (never
the dropped `src/v2/**`): `palette.ts` (10 and 10b, `problems()`: page >= 50 %, hero 5-15 %, pop <= 3 %, Pip ΔE); a people kit in this film's design (back
views, round heads); her; Pip; the London kit (a seeded long-facade generator with window life and canopy lettering; plaza, footbridge, patterned canal, the
towpath with kiosk, A-boards, bench, lamps, café, posts; a roofline row generator; narrowboats; leaves, smoke, pigeons, walkers); the Washington kit (rooftop
clutter, a Pentagon generator on ground-plane math, Potomac and far city bands, Monument, hero cloud, billboard, gate, van, rack; blossom, joggers); a
world-text component on `lib/font`; `scenes.json` (ids W01-W09); `captions_pages.txt` (one boxed word per page: contract, life, odd, staff, scared, contracts,
she, AI, objected, military, April, Pentagon, purpose, veto, says, principles, any kind, can't, words, facts) -> `captions.json`.
**Engine tools (TK):** `src/lib/Film.tsx` (camera-continuous, matchcut, foreground-wipe 'scene' and 'pole', unbuild loop), `World.tsx`, `ShotCam.tsx` with
`<Layer depth>`, `src/v3/film/kit/Pullback.tsx` (`s5Ease`, `planeMat`, `PullLayer`; imports only `lib/xf`, `lib/inkComp`, `lib/time`) and `idle.ts`
(`floatCam`, `windowLit`, `crossing`, `puffs`), `Ink.tsx`, `Fill.tsx`, `sketch.ts`, `<Look cascade>`, `<UnBuild>`, `tod.tsx`, `Sun.tsx`, `rng.ts`,
`Captions.tsx` and `film_captions.py`; the shell after `src/entry-v3-film.tsx` (new `src/entry-v2r-film.tsx`, 2345 frames); sound and QA per TK §4-5
(`gate_check.py`, `density.py --cozy`, `deadframes.py`, `camspeed.py`, `colour_meter.py --hero '#00876E' --pop '#EE6B2E'`); renders `--gl=angle`.
**Risks -> mitigations.** (1) The shadow may not read as "still reaches her": stepped jumps on the words, Pip's head following it, the door spark, a shadow >=
28 px thick, a sound-off cold read at 216 px on the pilot; fallback: on "life" it climbs onto the door glass. (2) London -> Washington confusion: the sun
match, blossom vs leaves, the Monument, "US Dept. of Defense"; fallback, a small "WASHINGTON" sign on the rooftop. (3) The Pentagon at low crane height: the
widened corner view, tested at 216 px first. (4) Text load: each board in a place with readers, <= 20 words except the deal. (5) Speeds (T1, W04, W09, and W05
with a far peak of 14 px/f at most): `camspeed.py`, foreground masses over any over-cap frame. (6) The rack read as military: a plain office rack, a civilian
worker. (7) Pip overload: one small reaction per shot. (8) The caption band: facade tops, the Monument, string lights and blossom out of y 317-556 in every
frame.
**Fast to v1-level finish with many builders** (~4 agents at once, small checkpointed commits, lane renders at 0.5 scale): Phase 0 (1): palette, shell, and
the **kit consistency contract sheet** (her, Pip, A-board, post, boat, facade bay, van, at every size used). Phase 1 (4): London kit / Washington kit /
people, Pip and life / bed and SFX. Phase 2 (2): **pilot W01 and W05 at final density, full 1080x1920 at 60 fps**, judged at 216 px beside v1 and reference 1
(density, colour meter, cold read) before anything else. Phase 3 (4): W02-W03, W04, W06, W07-W09 with the loop seam. Phase 4: assembly, captions, cue sheet
from the final picture, mix; one combined review per shot (max 6 findings) by an aliveness critic, a fairness critic (section 8) and a bare sound-off read;
fix once; final render (`--crf 14`, TV-range pass), `gate_check.py`, a download with its stage named.
