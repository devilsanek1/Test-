# Storyboard draft: RETENTION-MAX

Angle: optimize watch-time on TikTok/Reels (scroll-stop, a pattern interrupt every 2 to 3 s, open loops with payoffs, rewatch rewards, a seamless loop) without breaking clarity or the reference style.
Machine-readable version: `docs/storyboard_drafts/retention.json` (13 scenes, validated: JSON parses, scenes are contiguous 0 to 70.687 s, every caption line is 24 characters or fewer, at most one highlight per caption, and the caption text reproduces the VO word for word).

---

## 1. The concept in one breath

**The web is a city, websites are buildings, and PHP is the foundation under most of them.**
Every building's main window is drawn as a **browser window** (three dots and an address bar), so viewers get "building = website" within 0.5 s and no labels are needed. Under the street, seven out of ten buildings stand on identical brick foundations stamped with a small elephant cornerstone. Each foundation is one **copy of PHP**. The bug is **a crack that shows up in every copy at once**, and a tiny ink beetle named **Bit** lives in it.

### Metaphor system (one object per idea, reused all film long)

| Idea in the VO | Object on screen | Where it shows up |
|---|---|---|
| a website | a building whose main window is a browser window | S01, S02, S10, S11, S12 |
| PHP / a copy of PHP | a brick foundation with a periwinkle elephant cornerstone | S02, S04, S05, S10, S12 |
| the bug | the same crack in every foundation + Bit the beetle | S02 to S05, hidden in S01/S03 |
| the two steps | the **two-pane notice board** (pane 1 magnifier = find, pane 2 patch = fix) | S03, S09, S13 (our version of the reference's bulletin board) |
| the fix | a band-aid style **patch** (peach strip, cream pad) | S03, S06, S07, S09, S10, S12 |
| the people who make PHP | a small brick workshop with a hanging elephant-silhouette sign, plus its patch cart | S06, S07, S12 |
| switching a site off | roller shutter + padlock, and the sun pressed like a power button | S01, S11, S13 |
| Cloudflare | a generic glass shield-dome over a big chunk of the skyline | S08 |
| attacks | small ink darts that bounce off; knocks on doors (never anyone getting in) | S08, S10, S11 |

### Color code taught by the film
- **Orange (sun)** = the anchor and "attention" (power button, clock, target ring, the one patched roof).
- **Periwinkle** = PHP. It's used only for Pip and the elephant cornerstones/PHP markers (S02 tally, S10 dots, S12 emblems). This matches the mascot stream's current `MASCOT_COLORWAY = 'periwinkle'` in `src/lib/mascot/colors.ts`. Pip is the only cool-violet shape in the frame, so the eye finds him instantly without him fighting the orange disc.
- **Peach** = caption highlights and the patch (the fix).

### The orange disc: one morph per act, always recognizably the same disc
S01 power button (frame 0 carries a faint glyph, which inks bold and gets pressed on "off") → S03 hops twice on "two steps" → S04 clock face spinning 14 laps → S05 summer heat strokes on "August" → S06 dips down to stamp the secret envelope with a wax-seal dot → S07 slides along an arc ("hours") → S08 clock with a 45-minute wedge, then **sets** halfway behind the panel edge "by evening" → S09 rises again on "So now comes step two" (a new day) → S11 power button again (callback) → S13 a small press on "switch off", then takes back the faint glyph so the last frame matches frame 0.

### Mascot: Pip, the little elephant
An original baby elephant about the size the reference cat reads at. Bean body, stubby column legs with cream toenails, one big D-shaped ear (the emotion dial), short curled trunk with three ink wrinkle ticks (our version of the cat's stripes), a tufted tail and a dot eye. No tusks, no text, no logo. Periwinkle. He watches like the cat does and gets **one small trunk gag per scene**, timed to a word but never placed between the viewer and the explanation:

S01 taps a padlock (it holds: "Nobody hacked them") · S02 copies the carved elephant's pose · S03 gets hit by a flying patch sticker · S04 turns to camera on "right?" (the only front view), then sleeps through 14 years while Bit walks over his trunk · S05 jolts awake on "found it" · S06 "shh" with his trunk · S07 grabs at a leaked sheet and misses, then a trunk facepalm · S08 folds his ear over his eyes · S09 holds the flashlight that reveals each "?" · S10 hands over the patch, then becomes a speck in the 22 million · S11 taps the padlock again and nods · S12 blows dust off the old emblem · S13 crosses his trunk for "hope", then rides the un-build back to his frame-0 spot.

---

## 2. Retention map

**Hook (0 to 1.5 s).** Frame 0 is a dense line-art civic plaza with an orange sun carrying a faint power glyph and a periwinkle elephant. It is never a blank card. At 0.16 color floods in building by building. At 0.56 the windows reveal browser chrome (the "aha"). At 1.12 people pop in. At 1.36 four pennants unfurl. That's four visual events before the viewer can decide to swipe. Then four shutters slam in rhythm on "switched / them- / -selves / off" and the world goes dark: the most striking image of the film lands at 3.3 s.

**Pattern interrupts.** 134 timed beats. The longest stretch without a new visual event is 1.48 s (inside S08 and S10, where continuous motion runs anyway). The camera language keeps changing:
push down (4.7) → flip (10.8) → iris through the magnifier (15.6) → time-lapse (18.9) → push-in (21.6) → pan (25.3) → flip to the back of the building (30.6) → zoom out to the city (35.4) → cut to night (43.7) → iris through pane 2 (47.7) → three-step powers-of-ten zoom out (49.7 to 51.5) → zoom into one dot (54.4) → pull back to the hook frame (59.0) → flip (60.6) → push-in (66.4) → un-build (69.5).

**Open loops and payoffs.**
1. "Why would they switch themselves off?" (S01) → paid off in S11, which returns to the same building and pulls back to the exact S01 frame on "That's what those government sites did."
2. "Two steps" (S03) → step one is entered through pane 1 (S04, iris through the magnifier) and checked off in S09. Step two is entered through pane 2 (S10, iris through the patch pane). S13 reuses the same board for the final choice.
3. "Nobody found it for 14 years" (S04) → found 3 s later (S05). Pip sleeps through the wait and wakes exactly on "found it".
4. A paper corner slips out of the workshop vent at 30.2 s, just before "Except," (S06 → S07).
5. "Nobody knows yet how many got in" stays honestly open: "?" marks, no answers.

**Rewatch rewards (hidden details).**
- **Bit the beetle is on screen before anyone "finds" him:** on govA's cornice in frame 0 and in S01, on the board's leg in S03, in plain sight in S04 (he ducks the magnifier, then walks over sleeping Pip). He's back on the cornice in the final frame.
- Pip mirrors the elephant cornerstone's pose on "PHP" (S02).
- Every leaked sheet on the wires carries a tiny sketch of the crack and Bit (S07).
- The calendar's last tear in S04 is year 14; the next tear in S05 shows "AUG".
- "Find Pip in the 22 million": at the widest zoom he's a periwinkle speck waving beside the one orange patched roof (S10).
- The old foundations' elephant emblems lean on tiny canes (S12).
- S13 board = S03 board = the reference's yes/no finale, and the last frame is pixel-identical to frame 0.

**Seamless loop.** The visual loop: the un-build returns to the opening line art (the reference's ending move). The narrative loop: the video ends on "switch off" and starts on "switched themselves off". The audio loop: the VO restarts with "Government" at 0.16 as the color floods back.

---

## 3. Timeline at a glance

| # | Time (s) | Dur | In | Title | Key visual |
|---|---|---|---|---|---|
| S01 | 0.00-4.72 | 4.72 | loop-start | Four capitols power down | 4 civic "website" buildings; shutters slam; sun = power button; intact padlocks |
| S02 | 4.72-10.80 | 6.08 | push (tilt down) | What's under the street | cross-section: 7 of 10 buildings on identical PHP foundations; crack in all; 7/10 tally |
| S03 | 10.80-15.70 | 4.90 | flip | The two-step board | two-pane board: 1 = magnifier (find), 2 = patch (fix); patches burst "everywhere" |
| S04 | 15.70-21.56 | 5.86 | zoom (iris via magnifier) | Fourteen years in plain sight | magnifier sweep; Pip faces camera "right?"; 14-year time-lapse, sun = clock |
| S05 | 21.56-25.40 | 3.84 | matchcut | Found | calendar "AUG"; two teams down hatches; sparkle scanners; beams lock onto Bit |
| S06 | 25.40-30.50 | 5.10 | push (pan right) | The quiet letter | sealed envelope (sun stamps the wax seal) to the PHP workshop; patches made; neighbors asleep |
| S07 | 30.50-35.50 | 5.00 | flip (to the back) | Leaked on the line | sheets slip out the back window and get pegged on telephone wires ("online"); crate comes out late |
| S08 | 35.50-43.70 | 8.20 | zoom out | Under the dome | shield-dome over a big chunk of the skyline; darts and tallies; sun = 45-min clock, then sets |
| S09 | 43.70-47.78 | 4.08 | matchcut (night) | Question marks, then step two | flashlight reveals "?" on doors; sunrise; board: ✓ pane 1, pane 2 lights, a snail |
| S10 | 47.78-54.48 | 6.70 | zoom (iris via pane 2) | Twenty-two million copies | one patch → powers-of-ten zoom out to a sea of PHP dots; loupe; reticles |
| S11 | 54.48-60.48 | 6.00 | zoom in | Why they switched off | slow progress bar vs darts; sun = power button; shutter; pull back to the S01 frame |
| S12 | 60.48-66.56 | 6.08 | flip | Too old to fix | every third house on an old crumbling foundation; patch cart skips them |
| S13 | 66.56-70.687 | 4.13 | matchcut | Switch off, or hope | board: power glyph vs hosting rack; Pip crosses his trunk; un-build back to frame 0 |

Three flips (10.8 / 30.6 / 60.6), two iris zooms that rhyme (pane 1 → step one, pane 2 → step two), and every other change is a continuous camera move, which keeps the sense of one continuous world.

Corrected word starts for glued ASR tokens, all checked against onset/energy dips in `vo.mp3`: "7" 9.36, "10" 9.88, "14" 18.88, "45" 41.06, "22" 51.08, "version" 62.74 (the "a" at 62.64).

---

## 4. Scene by scene (with rationale)

### S01 · 0.00-4.72 · Four capitols power down
*"Government websites in four countries just switched themselves off. Nobody hacked them."*
- **Picture.** A civic plaza. Front row: govA (columned hall, x 80-470, y 470-905) and govB (domed hall, x 490-880). Back row: govC (brick tower) and govD (modern slab). Each main window is a browser window. Four abstract pennants stand for four countries (dot, chevron, stripe, star; never real flags). Five back-view citizens are on the plaza and three pigeons sit on a wire.
- **Beats.** 0.16 fills flood bottom-up · 0.56 browser dots pop + address bars draw on · 1.12 citizens pop in · 1.36 / 1.48 / 1.60 / 1.72 pennants unfurl · 2.32 bold power glyph inks onto the sun · 2.80 / 3.04 / 3.28 / 3.44 shutters drop on their own · 3.28 the sun presses in, the world dims to 35%, pigeons scatter · 3.76 padlocks pop · 4.30 Pip taps one ("tok"), and it holds · 4.48 all locks glint.
- **Captions.** "Government websites / in four countries" (hl *four countries* 1.36) → "just switched / themselves off." (hl *themselves* 2.80) → "Nobody hacked them." (hl *Nobody* 3.76).
- **Why this visual.** Buildings with browser windows say "websites" in half a second without a single label. Four civic buildings say "government, four countries". The shutters coming down **with nobody pulling them** say "themselves", which is the word I highlight because it creates the question the film answers in S11. Intact padlocks say "nobody hacked them" without drawing a hacker (the brief forbids showing one).
- **Why rewatchable.** The rhythmic four-shutter slam is satisfying. Bit sits on govA's cornice from frame 0. Frame 0 is also the final frame.

### S02 · 4.72-10.80 · What's under the street
*"They were fixing a security bug in PHP, the programming language behind WordPress and about 7 out of 10 websites."*
- **Picture.** The camera pulls back and tilts down into a cross-section. Ten small buildings stand at the top; the four gov ones keep their shutters down. Below each is its own foundation: seven teal brick blocks with periwinkle elephant cornerstones and code glyphs ({ } < > $ ;), and three grey concrete blocks. A little print house is the WordPress stand-in (a press roller sign, paper stacks). A tally of 10 house pictograms sits at the bottom.
- **Beats.** 4.80 work lamp on, workers under govB' · 5.44 one crack draws through **all seven** PHP foundations at once · 5.84 Bit pops out · 6.32 cornerstones stamp left to right; Pip copies the emblem's pose · 7.20 code glyphs ripple · 8.24 the print house bounces and puffs paper · 9.04 tally outlines · 9.36 seven fill periwinkle with rising ticks · 9.88 three fill grey.
- **Captions.** "They were fixing / a security bug in PHP," (hl *PHP*) → "the programming language / behind WordPress" (hl *WordPress*) → "and about 7 out of 10 / websites." (hl *7 out of 10*).
- **Why.** "Behind" literally means underneath, so the cross-section is the most honest picture of "a language behind websites". Separate identical foundations (not one shared slab) set up "copies of PHP" and "install it on every site" later. The crack appearing in all seven at once explains why one bug matters everywhere.
- **Rewatch.** Pip's pose-match. The code glyphs include `$`, a nod for developers.

### S03 · 10.80-15.70 · The two-step board
*"Fixing a bug like that takes two steps. First, you find it. Then, you fix it everywhere."*
- **Picture.** The card flips to a sunny wall with a two-pane notice board (painted "1" and "2"), a teal door, and three readers. Pip sits on top of the board exactly like the reference cat.
- **Beats.** 11.28 a wanted-style sheet with Bit's sketch pins into pane 1 · 12.24 / 12.36 numerals pop; the sun hops twice ("step, step") · 13.68 a magnifier draws over pane 1 · 14.80 a patch pops into pane 2 · 15.20 16 patch stickers burst across the wall; one hits Pip (15.50), and he shakes it off.
- **Captions.** "Fixing a bug like that / takes two steps." (hl *two steps*) → "First, you find it." (hl *find*) → "Then, you fix it / everywhere." (hl *everywhere*).
- **Why.** This is the film's structural spine: the same board returns in S09 and S13, like the reference's bulletin board. The burst of stickers makes "everywhere" physical and plants the scale problem.
- **Rewatch.** Bit sits on the board's left leg the whole time.

### S04 · 15.70-21.56 · Fourteen years in plain sight
*"You'd think finding it is the hard part, right? And for 14 years, nobody did."*
- **Picture.** An iris zoom through pane 1's magnifier lands on a close-up of one PHP foundation, with the street and a tree above ground. A tear-off calendar hangs on the foundation wall.
- **Beats.** 16.24 a big magnifier sweeps the bricks; Bit ducks as it passes over the crack · 17.04 searchers appear above ground, looking the wrong way · 17.92 Pip turns to camera ("right?") · 18.88 to 20.32 **time-lapse**: 14 calendar tears, the sun as a clock spinning 14 laps, day/night pulses, the tree cycles seasons, a crane comes and goes, the building above gains a storey, a cobweb grows, Pip falls asleep · 20.32 hard stop on year 14 · 21.04 Bit walks across sleeping Pip's trunk.
- **Captions.** "You'd think finding it / is the hard part, right?" (hl *hard part*) → "And for 14 years, / nobody did." (hl *14 years*).
- **Why.** Fourteen years is abstract; a time-lapse where everything changes except the crack makes it felt. Code draws calendars, clocks and season swaps beautifully.
- **Rewatch.** The only fourth-wall beat. Bit dodging the magnifier. The bug walking over the elephant (a bug living on PHP, literally).

### S05 · 21.56-25.40 · Found
*"Then, in August, two security teams using AI tools found it"*
- **Picture.** The same vault in summer, with a slow push toward the crack. Two street hatches open, two teams of two climb down, and their tablets show a generic four-point sparkle (no brand).
- **Beats.** 21.68 the calendar tears to "AUG" · 22.16 heat strokes on the sun · 22.80 / 22.92 hatches open · 23.04 / 23.20 teams slide down · 24.16 the sparkle lights up · 24.56 scan beams sweep · 24.96 beams converge and the orange target ring locks onto Bit · 25.20 Pip jolts awake.
- **Captions.** "Then, in August," (hl *August*) → "two security teams / using AI tools found it" (hl *AI tools*).
- **Why.** It's a match-cut in the same place as the 14-year wait, so the payoff is instant. Two teams come from two sides, which says "two independent teams".
- **Scene split note.** This sentence runs 9 s, so I split it at "found it / and quietly told". The split is a continuous pan rather than a cut, so the sentence reads as one flow while every scene stays at 8.2 s or less.

### S06 · 25.40-30.50 · The quiet letter
*"and quietly told the people who make PHP so a fix could be ready before anyone else knew."*
- **Picture.** The camera pans right to a dusk street. On the right is the PHP workshop: a brick building with a hanging periwinkle-elephant sign and a lit window with three makers at a bench. On the left, neighbors' houses have their curtains shut.
- **Beats.** 25.44 team A holds up the envelope · 25.68 Pip goes "shh" with his trunk; **the sun dips and stamps the envelope's wax seal**, then floats back · 26.16 the envelope glides into the mail slot · 26.48 the makers pop in · 27.12 the sign swings · 28.08 three patches appear on the bench · 28.72 they go into a crate and the lid closes · 29.20 "Zzz" from a neighbor's window · 29.92 the door lock clicks · 30.20 a sheet corner slips out of a side vent and Pip's ear twitches.
- **Captions.** "and quietly told / the people who make PHP" (hl *quietly*) → "so a fix could be ready / before anyone else knew." (hl *before*).
- **Why.** A sealed letter is the clearest picture of "quietly told", and sleeping neighbors are the clearest "before anyone else knew". The sun as wax seal is the most playful disc moment in the film.
- **Rewatch.** The leak is foreshadowed 0.4 s before "Except".

### S07 · 30.50-35.50 · Leaked on the line
*"Except, the details of the bug leaked online hours before the fix came out."*
- **Picture.** The flip turns the workshop around (edge-on exactly on "Except"). We're in the back alley: telephone poles, three sagging wires, birds, rooftops beyond.
- **Beats.** 31.60 sheets visible behind the back window · 32.72 they slip out one by one · 33.20 they get **pegged onto the wires** and travel off across the city (12 by 33.90); Pip jumps for one and misses · 33.84 the sun slides along an arc and shadows stretch ("hours") · 34.72 the side door opens · 35.04 the patch crate rolls out, too late · 35.25 Pip facepalms with his trunk.
- **Captions.** "Except, the details / of the bug leaked online" (hl *leaked*) → "hours before / the fix came out." (hl *hours*).
- **Why.** "Online" becomes "on the line": a visual pun that code draws cleanly (curves, rectangles, pegs) and that reads instantly. The flip to the back of the same building makes "Except" a literal reversal.
- **Rewatch.** Every sheet carries a tiny sketch of the crack and Bit.

### S08 · 35.50-43.70 · Under the dome
*"Cloudflare, which protects a big chunk of the web, says it saw tens of thousands of break-in attempts in 45 minutes, and millions by evening."*
- **Picture.** Zoom out: the wires become thin lines over a dense skyline. A glass shield-dome covers a big chunk of it (plain shield emblem, a lookout with binoculars, no cloud shape, nothing orange-cloud-like). A tally board stands on a pole.
- **Beats.** 35.60 the dome draws in one arc · 36.56 a glint · 37.04 a dashed outline marks the "big chunk" · 38.16 binoculars up · 38.88 darts arrive in 3, then 10, then 30 and bounce off the dome while tallies fill · 40.00 knocks on unprotected doors (doors hold) · 41.06 **the sun becomes a clock and a wedge sweeps 270° = 45 minutes** · 42.48 the rain turns into dense ink hatching across the sky, tallies overflow, Pip folds his ear over his eyes · 43.04 **the sun sets** halfway behind the panel edge, dusk, lamps on.
- **Captions.** "Cloudflare, / which protects" (hl *Cloudflare*) → "a big chunk of the web, / says it saw" (hl *big chunk*) → "tens of thousands / of break-in attempts" (hl *tens of thousands*) → "in 45 minutes," (hl *45 minutes*) → "and millions / by evening." (hl *millions*). The captions speed up deliberately to match the escalation.
- **Why.** Scale is shown as density, not invented numbers: tally marks and hatching, no odometer showing fake figures. The 45-minute wedge and the sunset are exactly what the VO claims ("in 45 minutes", "by evening"). Attempts bounce; nothing is shown getting in, because the next line says nobody knows.

### S09 · 43.70-47.78 · Question marks, then step two
*"Nobody knows yet how many got in. So now comes step two, the slow one."*
- **Picture.** A night street of four doors, with the dome far behind and the sun half-set. Pip holds a flashlight in his trunk. The two-step board stands at the end of the street.
- **Beats.** 43.76 the flashlight clicks on · 44.08 / 44.32 / 44.56 / 44.72 a "?" pops in each door window as the beam passes · 45.52 the beam swings and the camera pans to the board · 45.84 **sunrise**: the disc rises home and night lifts · 46.08 a ✓ stamps into pane 1 · 46.40 pane 2 lights up and the "2" pops · 47.12 a snail carrying a patch inches in; Pip yawns.
- **Captions.** "Nobody knows yet / how many got in." (hl *how many*) → "So now comes step two, / the slow one." (hl *slow*).
- **Why.** "?" marks on intact doors are honest: no break-ins shown, no answers given. The flashlight is the device that carries the eye from the doors to the board. The sunrise marks "now comes step two" as a new chapter. The snail is the funniest possible "slow".

### S10 · 47.78-54.48 · Twenty-two million copies
*"Someone has to install that fix on every site, and there are about 22 million copies of PHP out there that could be hit."*
- **Picture.** An iris through pane 2 (mirroring S04's iris through pane 1) lands on one ordinary building on its cracked PHP foundation. A back-view worker is the "someone".
- **Beats.** 47.84 the worker walks in · 48.60 Pip hands over the patch · 48.80 the patch slaps on, ✓ · 49.68 / 49.92 / 50.88 **three zoom-outs**: a street of ten, a 10×10 block, then a sea of rooftops · 51.08 periwinkle dots ripple outward, one per copy · 52.56 a loupe shows one dot is the same cracked foundation · 53.84 dark reticles pop over random dots · the one orange patched roof stays safe while tiny Pip gulps.
- **Captions.** "Someone has to install / that fix on every site," (hl *every site*) → "and there are about / 22 million copies of PHP" (hl *22 million*) → "out there / that could be hit." (hl *hit*).
- **Why.** A powers-of-ten zoom-out is one of the most rewatched moves in short-form, and it turns "every site" and "22 million" into felt scale. A pattern tile is cheap to render. One patched roof in an ocean of unpatched ones makes the slowness obvious.
- **Rewatch.** Find Pip in the 22 million.

### S11 · 54.48-60.48 · Why they switched off
*"If a site can't update fast enough, the safest thing is to switch it off until it can. That's what those government sites did."*
- **Picture.** Zoom into one reticled dot: it's govB, the domed hall from S01. Its browser window now holds a slow progress bar while darts gather.
- **Beats.** 55.28 the bar crawls 0→18% · 55.68 darts inch closer and Pip looks bar ↔ darts · 56.56 the power glyph inks onto the sun (callback) · 57.52 the sun presses and the shutter slams (57.84), then the padlock · 58.00 darts bounce off · 58.24 a peephole and blinking lamp show the update still running · 59.04 **pull back to the exact S01 framing**: all four shuttered with blinking lamps · 59.52 pennants wave · 60.16 Pip's padlock tap (callback) and a nod.
- **Captions.** "If a site can't update / fast enough," (hl *fast enough*) → "the safest thing / is to switch it off" (hl *switch it off*) → "until it can." → "That's what those / government sites did." (hl *did*).
- **Why.** This pays off the hook with the hook's own picture. The progress bar behind the shutter shows "until it can" (the site is off but still fixing).

### S12 · 60.48-66.56 · Too old to fix
*"And one in three sites on PHP runs a version so old that the people who make PHP don't fix it anymore."*
- **Picture.** A flip to a street cross-section (rhymes with S02): six houses in two groups of three. Houses 3 and 6 are old-style, on crumbling stone foundations with cobwebs. A tally of three pictograms sits below.
- **Beats.** 61.12 houses pop in threes · 61.36 every third one "ages" with a wobble · 61.84 emblems appear; the old ones lean on tiny canes · 62.74 cobwebs · 63.50 Pip blows dust off an old emblem · 64.24 the workshop's patch cart rolls in · 65.52 to 66.20 the cart patches the new foundations and **rolls straight past the old ones** · 66.30 Pip's ear droops.
- **Captions.** "And one in three / sites on PHP" (hl *one in three*) → "runs a version / so old that" (hl *so old*) → "the people who make PHP / don't fix it anymore." (hl *anymore*).
- **Why.** The cart physically skipping a house is the clearest picture of "they don't fix it anymore". Using the cart from the S06 workshop means no new characters are needed.

### S13 · 66.56-70.687 · Switch off, or hope
*"For those, it's switch off or hope the hosting company sorts it out."*
- **Picture.** Push into old house #3's wall. The two-step board returns in its exact S03 position. Pane 1 holds a big power glyph; pane 2 holds a small server-rack building (the hosting company) with a tech walking toward it. Pip sits on top. The staging is the reference's yes/no finale.
- **Beats.** 67.60 pane 1 power glyph; the sun echoes a small press · 68.80 pane 2 rack pops in and Pip **crosses his trunk** · 69.20 rack lights blink · **69.52 un-build**: fills drain into one tan block that shrinks downward to reveal the S01 plaza line art; the board un-draws; pane 1's glyph floats up onto the sun as the faint frame-0 glyph; Pip hops to his S01 spot and Bit to the cornice; the caption rolls out at 70.45 · 70.687 = frame 0.
- **Captions.** "For those, it's / switch off" (hl *switch off*) → "or hope the hosting / company sorts it out." (hl *hope*).
- **Why.** Two panes, two bad options. The un-build is the reference's signature ending, and it loops into the hook line art.

---

## 5. Production notes for the orchestrator and scene agents
- **Reuse is built in.** The board (S03/S09/S13), the PHP foundation block (S02/S04/S05/S10/S12), the civic buildings (S01/S02/S11), the workshop + cart (S06/S07/S12), back-view people, darts and patches are each one component used many times. That makes these good candidates for `src/lib` kit parts (board, foundation, browser-window facade, patch, dart, padlock, shutter).
- **Shared states the engine must hand across scenes.** The sun's position/morph (half-set from 43.04 to 45.84, glyph on in S01 and S11 and at the loop seam) and Pip's screen position at match-cuts. Frame 0 and the final frame must be generated from the same S01 "linework-only" state.
- **Mascot colorway.** Assumes periwinkle (current `MASCOT_COLORWAY`). If the mascot stream switches to orange, swap the PHP marker color to the mascot color too, so "elephant color = PHP" still holds.
- **Things not to draw.** No intruders inside any building. No real flags, no clouds in orange, no PHP/WordPress/Cloudflare marks. Darts never pass through a door. Scanners show a generic sparkle only.
- **Caption pacing.** S08 runs five captions in 8 s on purpose (escalation). S11 has one short single-line caption ("until it can.", 0.8 s), which is acceptable because the shutter beat carries it.
