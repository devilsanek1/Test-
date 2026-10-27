# T2 "The Line": treatment for the finished v2 film (39.08 s, voice take 2)

T2, 2026-10-27, lens "the-line". Read with `../house_digest.md`, `../beat_map.md` (F1-F20, V1-V17, A1-A10), `../teardown.md`,
`../toolkit.md`. Times = voice seconds on the audible onsets (beat map §2); frame = round(s x 60). Nothing from the dropped
production (no desk-as-stage, contract page, scroll of years, cat, rooms, Cream & Cobalt / Dusk); all sets, people, Pip,
props and music are new.

## 1. Title, concept, why it travels
**THE LINE.** Her contract's one clause is one hand-drawn vermilion line that should have ended at Google's door; it
overtakes her on the pavement and runs on through her London, past windows of staff with short lines of their own, back to
the desk where it began, along her rooftop at sunset and out to the horizon, while she talks anyway. The camera follows
the line, so the film is one idea made visible.
- **Stop:** a street being drawn, the claim in words; a small woman with a box steps past the neat end of a red line (a
  happy chime); at 3.1 s the line wakes and races past her, over the horizon on "for life".
- **Understand:** BEFORE "once you quit, you can say what you like". The line SHOWS a rule that keeps going (she says) and
  that it isn't one odd contract (staff have lines too). AFTER, a viewer can retell it: she objected to the military work
  (April: "any lawful government purpose", no veto), Google says it follows its principles and bans retaliation, and she
  talks anyway because, in her words, facts aren't criticism.
- **Share:** the last frame: she and Pip tiny on a rooftop, one red line through all of London, her quote on the sky.

## 2. The world
London's canal quarter (King's-Cross-like, never traced), one late-October afternoon into sunset: a glass-and-brick office
on a street of stock-brick shops, a towpath with narrowboats and railway-arch cafés, gasholder rings, cranes, and her hill
in north London. One flashback goes through the sun to an April sunset in Arlington, Virginia: the Pentagon behind cherry
blossom. Seasons tell the calendar (October leaves, April blossom), so her quitting and the deal never read as one day
(V13). **Sets:** R1 Door Street · R2 Towpath & Facade · R3 Arch Café · R4 The Lab · R5 The Avenue · R6 April Gate · R7
Google's Forecourt (R1's building at sunset) · R8 Her Roof Terrace + the London vista. **Light = story time:** day (R1-R2)
-> golden (R3-R4) -> low sun (R5) -> sunset (R6-R8: one light for Google's beat and hers, A5); the loop returns to day
(`World sky` tod keys; the palette never changes; no night-black, haze or glow).
**Palette, new sister "10 Canal Vermilion"** (v1's light page and clay mids, Ember's warmth; add to `palettes.json`):

| role | hex | job |
|---|---|---|
| page | `#DDEBE7` sky · `#F2E4D2` flags · `#F5EBDD` stucco | 50-80 % of every frame, many light fills; the caption field |
| mids | `#E7C8A2` stock brick · `#CF8466` red brick · `#9C93A6` plum-slate roofs · `#A9C9C5` canal · `#A8735A` lines · `#D9A27E` skin | small patches, never a slab |
| hero | `#17806F` canal teal | the story's objects: HER (coat, door, lamp, pots) and every public statement object (A-board, signs, the board's frame), 5-15 % |
| anchor · pop | `#2C2A40` slate-plum (hair, silhouettes, hulls, ~5 %) · `#E5442B` vermilion | the pop is THE LINE and its dot only, 1-3 %; London's reds (buses, post boxes) drawn plum or brick |
| disc · hl · ink | `#F5B27A` sun (ΔE >= 25 from the line) · `#F7C3A1` caption box · `#2B1B0A` | support: sunset bands `#F6D2B4` / `#E9C3C6` / `#B9B1CF`, shade toward `#6E79A8` (never grey), lamp `#F7C98B`, blossom `#F6D3D6` (R6 only) |

**Why:** a calm light page reads as serious news; one hot colour kept for her clause tells the eye where the claim is;
teal on her and on the public record is steady, never a villain colour; brick and lamps warm it, canal and sky cool it.

## 3. Cast (small and simple like reference 1: never a big model, waist-up shot or close-up face)
- **Her** (generic, never a likeness, V4): back or rear 3/4 only; round dark-brown head, low bun, teal coat, plum trousers,
  cream tote; 60-300 px full figure; one model sheet at every size. **"Google's staff"** (a few, unnamed, faceless, V11):
  four window silhouettes and a hooded staffer (R2), two lab colleagues (R4), staff at the door (R7). A reporter (R3,
  profile, notebook, no logo); Arlington: tiny plain-clothed staff (no uniforms), an attendant, a Google engineer.
- **Pip, drawn new, in every shot:** a small elephant whose ink is ONE continuous loose stroke (ears, tuft, trunk, body in a
  single line with 2-3 open gaps; the trunk ends in a pen-flourish curl; teddy soles), lavender `#958FD6` / `#7671B9`,
  inner ear `#F4BFC9`, fill offset 3/2 px, ΔE76 >= 20 from every ground (meter it on the plum roofs); 90-110 px in wides,
  ~170 / ~40 px at R8's start / end; never in the caption band, right rail or bottom 35 %. New geometry on the
  `src/lib/mascot` rig: sit-back, sit-front, walk-side, hop, flinch, shrug, head-tilt, ears-cover, peek, lean. It watches,
  turns to the next subject before the voice names it, makes one reaction per shot (§5), never mocks, and hops or walks
  across every cut. **People near and far** in every shot (R1 ~25, R2 ~30 + window silhouettes, R8 hundreds of specks);
  passers-by step over her line without noticing: it is only hers.
- **THE LINE (hero prop):** one flat vermilion stroke, 7-9 px near tapering to ~1.5 px at the horizon, slight wobble, round
  caps; it LIES ON surfaces (setts, kerbs, towpath, sills, coping) in perspective (`groundQuad` / `wallQuad`), occluded by
  feet, wheels and bench legs; a pen head (2-drawing stepped bead) draws it on; a dot marks an end. Never floating, never a
  rope, never touching a body (V7), never in the bottom 35 % or the right rail. Staff lines: short, a dot at both ends.

## 4. The opening, frame by frame (0.00-3.00 s), and the loop
**Frame 0:** R1 in bare warm ink on the light page, mid-motion (the revolving door mid-turn). The only colour is the line:
~200 px from inside the door across Google's granite setts to its DOT at (420, 1225), where the setts meet the public
flagstones: the expected end. Caption block (y 317-556): **SHE SAYS: NO CRITICIZING / GOOGLE. [FOR LIFE.]** (peach box, no
quote marks) + "Source: BBC News, 21 Oct 2026" small at y ~575. Layout: Google's building left (x 0-430; the door x
250-360 / y 1010-1190 under a cream fascia hand-lettered "Google"; above y 700 only in the gutter); a stock-brick row
right (café awning, newsagent, bus stop, lamp post, bikes); the street to the VP (560, 860): a zebra, a humpback canal
bridge, gasholders and cranes, her far hill; the apricot sun Ø150 on the hill (560, 790); her (feet 360/1215, 150 px, a
box with a plant on her hip); Pip on a bollard (x 470, top y 1110); two backs cut by the bottom; a birch at the left edge.
- **0.02-0.30 (f1-18):** colour floods shape by shape out from the sun (`<Look cascade>`): sky, sun, hill, right row,
  Google's facade, street, people, Pip, her teal coat last at f16 (the eye lands on her), foreground heads f18.
- **0.12** voice; "She quit Google." pops lowered under the block (y ~640); a 5 % pull-out creeps in (ease-in, the only
  camera move to 6.28). 0.05-0.40 the door ends its turn, she walks (12 drawings/s); 0.15 pigeons peck; 0.30 a plum bus
  crosses the far bridge; 0.45 a Google window switches off; 0.50 the café door opens, a cup, steam puffs.
- **0.58-0.66, THE EXPECTED THING:** she steps over the dot; it bounces once with three ink ticks; our "done" chime (two
  notes up) at **0.62**, the positive phone-like sound; Pip's ears lift.
- **0.70** pigeons lift off; **0.85** a cyclist crosses; **0.97 "Google"** the door stops (soft thunk); **1.10** Pip's
  head follows her; **1.20** a dog walker enters right; **1.40** a bus-stop figure raises a phone; **1.46-2.00** she
  hitches the box, half-turns to the door, two birch leaves fall; **1.90** the frame-0 block pops out (the source line
  stays); **2.00** the spoken page pops in.
- **2.15-2.40** the dot quivers (pre-motion). **2.43-2.53 "contract", REALITY STIRS:** the dot jolts (scale 1.4 -> 1);
  Pip flinches (its one big reaction); the dog stares. **2.60-3.05** the dot stretches into a dash aimed down the street,
  café patrons look over. **3.10 "bans":** the pen head shoots off (R1 below). ~22 events in 3 s.
**The loop (38.78-39.08):** R8 un-builds onto R1's t < 0 bare-line state (`{type: 'unbuild', loop: true, dur: 0.3}`; R8
drops its sky slab, `useExit() > 0` -> `sky="transparent"`): fills shrink into ink, the city's ink retracts, the line
rewinds along its route (a reversed pen sound) and leaves R1's short door-to-dot line; R1's door and pigeons start 3-4
frames before the seam; captions roll back to the frame-0 block (`captionAt` 39.04); air and the line tone cross the seam.

## 5. Shot list (8 shots; each has Pip, people, the sun and flat sky y 317-556 behind captions that pop in place; key reads
x 120-880, y 290-1250; [x] = the line's one highlight)
**R1 DOOR STREET 0.00-6.28** "She quit Google. And she says her contract bans her from criticizing it… for life." BUSY,
lane; one continuous shot, the 5 % pull-out, no cut. **3.10-4.54** the pen head races down the pavement: under her feet at
3.30 (she stops, looks down), OVERTAKING her; under the bus-stop bench 3.45 (feet lift); round the lamp post 3.60; across
the zebra 3.75 (a bike brakes); the dog jumps back 3.80; past the café tables 3.95; along the bridge parapet 4.20; to the
crest under the sun 4.50. **4.54-4.79 "…":** it stops; all but ambient holds. **4.88-5.30 "for life" (4.98):** it goes over
the crest, up the far hill road as a hairline, over the horizon under the sun. **5.30-6.28:** she stands looking down the
street; Pip sits by the line, ears low; the bus stop looks down at it. Explains: quitting should end the contract (the
dot); she says it doesn't. Out: 6.05 Pip hops toward camera right; cut on the action at 6.28. Captions: frame-0 block to
1.90; 2.00 "And she says her [contract]" / 3.13 "bans her from [criticizing] it…"; 4.79 line 2 pops to "…for [life]."
while line 1 keeps "she says" in frame (V5); "Her account · Source: BBC News, 21 Oct 2026" small under them to 6.28 (A2).

**R2 TOWPATH & FACADE 6.28-13.16** "You'd think that's one odd contract. But Google's staff told the BBC they're scared to
speak out, because of their contracts." BUSY, riverside. Eye level on the near towpath, 3/4 down the canal (VP 760, 900):
a moored narrowboat's bow bottom-left, bollards; her line along the towpath's water edge; walkers, joggers, a dog walker;
she walks away beside it (120 px), gone by 7.6; a kiosk A-board (x 520-640, y 1020-1180). Across the water: Google's canal
facade, 5 floors x ~12 bays (40-70 % lit, windows switching every 0.6-1.5 s), topping at y ~640; far-bank figures, a
footbridge, the sun at (880, 660). Camera: float 10 px/s; a 6 % story push to the facade 8.40-9.10. Moves: 6.30 Pip lands
on a bollard; 6.6 a jogger steps over the line; 7.0 two swans; **7.18 "odd": Pip's dry shrug**; 7.4 a scooter kid rolls
over the line; 8.38 Pip turns to the facade; **8.44** the A-board chalks in "TOLD THE BBC: one Google staffer would only
talk unnamed, “for fear of retaliation” · Source: BBC News, 21 Oct 2026" (F5, A2); **8.96 "staff":** four scattered
windows (floors 2-4) light, one standing figure in each; **9.24-10.07** on the far bank a hooded figure (back to us) comes
out to a figure with a notebook at the rail; **10.36 "scared":** the four step back from their glass, one closes the
window she'd opened, one lowers a blind, the hooded figure goes back in; 11.2 a narrowboat chugs across; **12.20
"contracts":** a short vermilion line draws along each of the four sills, 0.08 s apart, a dot at both ends (finite:
theirs, not "for life"); 12.45 Pip ears-cover. Explains: not one odd contract; the BBC heard the fear, and its cause is
the same kind of line. Out: 12.95-13.30 a cyclist passes close to the lens (`foreground-wipe`, `passer`). Captions: 6.28
"You'd think that's one / [odd] contract."; 8.44 "But Google's [staff] told the BBC" / 10.10 "they're [scared] to speak
out,"; 11.57 "because of their [contracts]."

**R3 ARCH CAFÉ 13.16-15.07** "So why is she talking?" DENSE-CALM nook on the water. Low on the towpath by a railway-arch
café: the brick pier left, a striped awning with festoon bulbs as the lid (y 0-280), tables; at the nearest (x 300-620, y
1000-1230) her (rear 3/4, seated, ~190 px) and the reporter (profile, a recorder on the table); her line along the edge by
her chair; a narrowboat right, Pip on its roof among herb pots; across the water HER OLD WINDOW, lit amber (700, 720).
Camera: float 8-12 px/s. Moves: 13.3 the reporter writes; 13.5 steam; 13.6 she talks (one hand gestures); **13.96 "she":
Pip's head-tilt**; 14.1 a heron lands on the bow; 14.3 a walker steps over the line; 14.64 Pip looks up at her old window.
Explains: she IS talking, to the BBC, beside her line: the open loop. Out: 14.80 Pip leaps up-right; cut on the action at
15.00; Pip lands in R4 at the same height, R3's line exits bottom-left where R4's enters. Captions: "So why is [she]
talking?"

**R4 THE LAB 15.07-18.40** "She worked on Google's AI and told the BBC she objected" DENSE-CALM nook (the past). Standing
eye level behind her: a soffit with pendant lamps (y 0-230); a window wall (y 230-1120) onto the canal and city (sky
through the glass carries the captions; the arch café across the water); her desk (x 140-620, y 960-1240): two monitors
(code, a small node graph), a teal lamp, plant, mug, pinboard; her seated (rear 3/4, ~230 px with chair); two colleagues
from behind; a glass door hand-lettered "Google DeepMind · Research"; Pip on the outside sill, peeking in. **The line
begins here:** a dot under her chair, running left across the floor out of frame. **Name tag** (A6, F1) on the mullion (x
640-940, y 620-830): "Sofia Liguori · research engineer, Google DeepMind · 3 years · resigned Oct 2026 · her account to the
BBC · Source: BBC News, 21 Oct 2026". Moves: 15.10 Pip lands on the sill; 15.30 the tag pops; 15.5 typing; 15.8 a chair
rolls; **16.12 "AI":** the node graph builds node by node (a burst); 16.4 a pigeon by Pip; 16.9 a narrowboat passes; 17.5
she pushes her chair back; **17.96 "objected":** she stands and faces the window (colleagues keep working); Pip's ears
perk. Explains: an insider on Google's AI who objected (her account): not an outside critic, not a hero. Captions: 15.07
"She worked on Google's [AI]"; 16.67 "and told the BBC she [objected]".

**R5 THE AVENUE 18.20-20.67** "to where its military work was heading." BUSY; the one mid-size move: a continuous forward
dolly + push (`ShotCam` keys, eased) past her shoulder (she exits left), the mullion wiping the lens (18.55), out over the
street: a gatepost hand-lettered "Google" and a plane-tree avenue running west into the low sun (VP 540, 820); two gantry
signs (teal frames, cream faces): near **"Dec 2025 → unclassified · the Pentagon's GenAI.mil"** (credit "Fox Business;
Decrypt"), far **"Apr 2026 → classified"** (credit "The Information via Japan Times; 9to5Google"); cars, plum buses,
bikes, birds; Pip trotting under the signs. **18.92 "military"** sign 1 readable overhead; **19.80 "heading"** sign 2;
20.00 Pip hops toward the sun. **Her line stays in the room:** 18.6-28.3 is Google's road and the deal, not her line; its
absence says the deal is not hers (V13). Explains: "heading" is a direction, not a number (F8 -> F9; no chart, V16). Out:
20.10-20.85 push-through into the sun (the disc and its ink rim fill the frame, midpoint 20.50) and out of R6's sun at
the same spot. Captions: 18.45 "to where its [military] work" / 19.64 "was heading."

**R6 APRIL GATE 20.67-28.31** "In April, that meant a deal letting the Pentagon use its AI for “any lawful government
purpose”. Google can't veto how it's used." BUSY, then a locked read; the coziness break. Eye level from a public footpath
across a lawn and road: the Pentagon's long, low limestone facade (5 storeys) running off BOTH side edges, roofline y
~740, the sun low over it; cherry branches as the top-left lid; a stone wall and bollards (Pip on one); the visitor gate
(gatehouse + barrier, x 560-860, y 1010-1200); a sign "The Pentagon · US Department of Defense" (no seal, no flag, V15);
joggers, tourists, tiny staff; a small obelisk far right. Camera: settles by 20.90; locked; a 7 % story push 23.85-24.45
as the board rises; locked for the read. Moves: **20.76 "April":** every tree bursts into blossom (14 clusters in 4
frames), a petal lands on Pip; **21.84 "deal":** at the gate a figure from a white van hand-lettered "Google" and the
attendant shake hands (small, side view); **22.46 "Pentagon":** the sign draws itself; **23.08 "use":** ~12 ground-floor
windows light in turn (screens, tiny figures typing); a door by the gate stamped "CLASSIFIED · cleared staff only"; 23.40
the van pulls out (no Google lettering shares a frame with the clause, V2); **23.80-24.03** the BOARD rises from behind the
wall (out-expo 0.25 s), its words drawing on fill-first on "any": "THE DEAL · Google and the Pentagon · April 2026" /
**“any lawful government purpose”** (64 px) / “should not be used for domestic mass surveillance or autonomous weapons
(including target selection) without appropriate human oversight and control” (36 px, in full, V9/A4) / "Reported Apr
2026 · BBC; The Information via Japan Times / 9to5Google" (A3); board x 110-970, y 600-1070, up 24.03-28.10. **Read hold**
(life off the text): petals at the edges, a jogger between the board's legs; **26.36-26.50 "veto":** under the board the
CLASSIFIED door slides shut with the Google engineer outside; he walks off; the screens keep working (who decides, nothing
more, V10); Pip ears-cover. Explains: what "heading" meant in April: the Pentagon may use Google's AI under the full clause,
and inside, Google has no say. Out: 27.85 Pip hops onto the board; **board match-cut at 28.10**: the board keeps its spot
and size, its words retract, the world swaps. Captions: 20.67 "In [April], that meant" / 21.72 "a deal letting the
[Pentagon]"; 23.08 "use its AI for" / 24.03 "“[any lawful government purpose]”."; 25.96 "Google can't [veto]" / 27.08
"how it's used."

**R7 GOOGLE'S FORECOURT 28.31-33.16** "But Google says it follows its AI principles, and bans retaliation “of any kind”."
Equal weight (A5): R1's building at sunset from its forecourt, the lit lobby behind; the SAME board component (size, spot,
light, sound as R6's); planters, bike racks, staff in and out (backs), two passers reading; the sun setting down the
street; her line only as a short quiet segment bottom-left (~1 %: the beat is Google's); trees and the board hide the
upper floors (no staff lines here, V14). **Board:** "GOOGLE SAYS · statement to the BBC, 21 Oct 2026" / “We work with
public sector organisations worldwide and follow a consistent process for reviewing and entering these contracts,
including compliance with our acceptable use policies and **AI principles**.” / “…strict workplace policies in place to
prevent retaliation **of any kind**.” (spoken parts 56 px). Optional plaque, cut if crowded: "Google's AI Principles:
“human oversight” · “international law and human rights”" (F16). Camera: locked. Moves: 28.36 the header draws on; 28.5 two
staff exit; 28.8 Pip hops down and sits reading; 29.2 a bus crosses far; **29.60-30.04** panel 1 builds; 30.3 a passer
stops; **30.60-31.00** panel 2; 31.3 pigeons; 31.6 a cyclist; **32.08** "of any kind" highlighted; 32.20 Pip nods once
(no irony); 32.45 Pip walks along her line. Explains: Google's side in its own words: principles answer the deal,
the retaliation policy answers the fear. Out: **match-cut on the line at 32.95** (R7's segment and R8's parapet line share
height and angle; Pip keeps walking). Captions: 28.31 "But [Google says] it follows" / 29.48 "its [AI principles],";
30.60 "and bans retaliation" / 31.88 "“[of any kind]”."

**R8 ROOF TERRACE + PULL-BACK 33.16-39.08** "She says she can't criticize Google. But in her words, “talking about facts
is not criticising”." Her roof terrace: festoon lights and a vine on a pergola (the lid, y 0-260); a chimney stack with
four pots left (cut left); the neighbour's gable right (finial y 640); ONE opening, the slot (x 260-600, y 760-900) onto
the city and the setting sun; her on a bench at the parapet (rear 3/4, ~300 px, blanket, a steaming mug on the coping),
pots, washing on a line; her line along the coping (y ~1200): through her home too, at the edge of her refuge. **33.16-
35.00 cozy hold** (float 10 px/s): Pip walks in along the coping and sits by her; 33.4 steam; **33.78 "can't":** her hands
close round the mug; 34.0 a pigeon on a chimney pot; 34.3 the bulbs come on one by one; 34.8 Pip leans on her arm.
**35.00-38.30 the pull-back** and **38.30-38.78 hold** (§6), **38.78-39.08 loop** (§4). Explains: this is the line she
means, through everything, for life, and her answer in her words. Captions: 33.16 "She says she [can't] / criticize
Google." (A1); 35.32 "But in [her words],"; 36.44 "“talking about [facts] / is not criticising.”" (A7) + "Sofia Liguori
to the BBC · Source: BBC News, 21 Oct 2026" small under it (A2).

## 6. The scale moment and the cozy home base
- **Scale, once (35.00-38.30 + hold, ~10 % of the runtime):** CG S5 retimed with `Pullback.tsx` (`s5Ease`, `planeMat`,
  `PullLayer`), 6 planes: dolly back + crane up + a ~70° arc round two backs (her, Pip), one ease, no roll. p 0-0.1 only
  the slot shows the city; p 0.15-0.40 the gable is the darkest beat; p ~0.48 (36.6) a chimney pot wipes the backs; p 0.5
  a light burst as the cloud bank catches the sun; p 0.77-0.96 the landmark lands on "facts" (37.18). **End frame:**
  horizon y ~880; she (~70 px) and Pip (~40 px) tiny at the parapet, feet above y 1250; the line drops from their coping
  into her street canyon, runs down it to the canal bridge (VP 520, 900) past the gasholders, the arch café and Google's
  building (its board and the A-board small but there), then on as a hairline over the far rows to the horizon under the
  half-set sun; nothing ends in the frame; a great dome (1.1-1.4 F over the horizon, right third, above y 840) in the gap
  of a hero cloud bank >= 1 W; 5-7 planes of roofs, chimney pots and railway lines in flat steps (0/12/22/40/65 %), detail
  peaking under the horizon. Hold life: a V of birds toward the dome, steam, bulbs, washing, and the line's far end still
  drawing on a few pixels. **Feels:** she is tiny, the line is the size of her city, and she is still talking; the camera
  stays at a person's height on her roof (no drone, no glow).
- **Cozy home base (R8's start; R3, R4 as nooks):** held on three sides, one opening onto the city, abundance at the edges
  (pots, mug, blanket, washing, bulbs), a calm centre, a lamp-warm bench and cool sky in the slot, signs of care (the mug,
  Pip leaning on her). The line sits on the parapet: the threat at the edge of the refuge, never inside. R6 strips the
  comfort on the heaviest line. Enclosed framings (R1 lane, R2 riverside, R3, R4, R8) hold ~70 % of the non-insert time.

## 7. Sound
**Bed, new ("one line"; `bedkit.py`, `sampler.py`, `instruments.py`, VSCO-2-CE / VCSL; ~84 BPM bent by `beatsync.py
--fit-tempo` so the cuts at 6.28, 13.16, 15.07, 20.67, 28.31, 33.16 land on beats):** ONE soft sustained high "line tone"
(bowed vibraphone / violin harmonic, pp) sounds wherever the line is; under it a light plucked pulse (harp + pizzicato), a
4-note cello motif for her, low strings for weight. 0-3.10 street air only; 3.10 the tone enters with the pen head;
4.54-4.79 all stops but the tone; 4.98 one low cello note (soft accent 1); 6.28-13.16 the pulse, low strings from "But";
13.16-18.40 the motif; a harp glissando into the sun (no riser); **20.67-28.31 the tone drops out** (her line isn't here),
a low pedal under the read; 28.31-33.16 the same pulse and strings as hers (no minor sting, no irony); 33.16 the tone
returns; 35.00-38.30 strings open gently (<= +3 dB), the motif resolves on "facts" (soft accent 2); the tone crosses the seam.
**SFX (new, `audio/tools/make_v2r_sfx.py` on the `make_phone_sfx.py` pattern; on visual hits, >= 8 dB under the voice):**
0.62 `done_chime` (two notes up; its top note IS the tone's pitch) · 0.97 door thunk · 2.43 `dot_jolt` · 3.10-4.54 `pen_run`
(felt-tip squeak + paper swish, rising with speed) with a bench tick, bike bell, dog yip, cup clink · 4.54 silence but the
tone · 4.98 `pen_tick` fading · 8.44 chalk · 8.96 four lamp clicks · 10.50 latch, blind · 12.20 four short pen strokes
(-3 dB callback) · 13.05 `fg_wipe` + bell · 16.12 node ticks · 17.96 chair scrape · 18.92 / 19.80 sign pops · 20.76 blossom
burst · 23.08 twelve screen blips (-6 dB) · 24.03 board thump · 26.50 door slide (no sting) · 28.36 the SAME thump · 32.08
swipe · 34.30 bulb clicks · 37.18 wings · 38.78 reversed `pen_run`; Pip's hops pop_low. Ambiences 20-25 dB under (street,
canal, lab, avenue, Arlington birds, rooftop wind). Mix `audio/mix.py` -14 LUFS / -1 dBTP; `qc.py --loop`.

## 8. Fairness and facts (beat map §4)
V1 the deal is buildings, a gate, screens, a stamp; "weapons" only as required clause text · V2 the van leaves before the
clause · V3 one sunset light, eye-level camera, no looming or stings · V4 generic figure + name tag · V5 "for life" only
beside "she says", never quoted or stamped · V6 no contract document: the line is the clause · V7 the line lies on surfaces,
never binds; she walks and talks freely · V8 no legal imagery · V9/A4 the clause in full 24.03-28.10 · V10 no infinity on
the deal (the endless line is hers and absent from R5-R6); the door shows who decides, nothing more · V11 four windows of
~60, no counts · V12 no cameras or eyes; R7's board is framed apart from her line and never answers her clause · V13 her
line ends at her lab; the deal lives on Google's road and a sourced board; leaves vs blossom · V14 Pip attentive; R7 cuts to
her roof, not the staff windows · V15 no logos, seals, flags · V16 two dated signs, no chart · V17 none of the excluded
words or people. A1 frame 0, R1, R8 · A2 source 0-6.28, 8.44-12.81 (A-board), R4 tag, 35.32-39.08 · A3 sign and board
credits · A5 one board component for R6 and R7 · A6 R4 tag · A7 exact quotes, "criticising" in hers · A8 "she says" / "told
the BBC" / sources / "GOOGLE SAYS" · A9 nothing after the payoff: it loops · A10 AI label on.

## 9. Production
**Build NEW:** palette module `src/v2r/palette.ts` (v3 pattern, first import, `problems()`) + the palette in
`palettes.json`; **`TheLine`** (per-shot paths from one `line_route.json`; draw-on, pen head, taper, dot / jolt / retract,
occluders); the 8 sets and a seeded London rooftop generator for R8 (terraces, chimney pots, plum roofs, railway fans; not
`EndlessCity`); her model sheet; a new small-people kit (walkers, seated, cyclists, joggers, dog walkers, window
silhouettes, reporter, Arlington figures); Pip (one-stroke geometry for 10 poses + a `Colorway`, sizes 40 / 100 / 170 px);
props (box, revolving door, A-board, gantry signs, the statement board, name tag, narrowboats, bulbs, blossom, birds,
steam, washing, van, screens); `WorldText` on `src/lib/font.ts`; the bed and SFX. **Tools:** `src/lib/Film.tsx` + the
`src/entry-v3-film.tsx` / `src/v3/film/Film3.tsx` shell (60 fps, 2345 frames, `captionMotion: 'pop'`, `frame0`); `src/lib`
Ink, Fill, sketch, persp, World, ShotCam, tod, exit (`Look cascade`, `UnBuild`, `useExit`); `src/v3/film/kit/idle.ts`,
`Pullback.tsx`; the `src/lib/mascot` rig; transitions `matchcut`, `foreground-wipe`, `push-through`, `unbuild`;
`scripts/film_captions.py`; `mix.py`, `beatlock.py`; QA `gate_check.py`, `density.py --cozy`, `deadframes.py`,
`framecheck.py`, `camspeed.py`, `colour_meter.py --hero '#17806F' --pop '#E5442B'`; renders `--gl=angle`.
**Risks:** (1) the line read as a road marking -> it leaves Google's door on "contract", the frame-0 words name it, nothing
else is vermilion, staff lines echo it; a bare sound-off cold read on the pilot. (2) read as a leash -> `TheLine`'s
surface-only rule. (3) the clause unreadable -> >= 36 px, locked hold, a 390-px read test. (4) R8's cost and fullness ->
batched paths, LOD, the CG scale checklist at phone size. (5) lane continuity -> one route file and one model sheet fixed
before lanes. (6) landing + quote + loop in 4 s -> R8's builder owns the seam. (7) equal weight -> R6 / R7 side by side.
**Fast to v1-level finish (~4 agents at once, checkpointed, commit after each):** Wave 1 kit contract (palette + `TheLine`;
her + people; Pip; boards + `WorldText`; London kit + rooftop generator), each shown at every size used. Wave 2 pilot: R1
and R8 at final density and full size, judged beside v1 and reference 1 at phone size. Wave 3 lanes: R2+R3, R4+R5, R6, R7
(0.5x renders, one combined review per shot, max 6 findings, fix, stop). Wave 4: assembly, the bare cold read, captions,
sound cued from the locked picture, `paint-subtle` edges (never at the top or by the captions), full 1080x1920 60 fps render.
