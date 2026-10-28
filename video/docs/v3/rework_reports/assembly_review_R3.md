# v3 rework assembly: independent review R3 (the owner's eye, cold)

Status: IN PROGRESS (skeleton). Reviewer R3, 2026-10-28.

Film under review: `scratchpad/rework/assembly/film_full.mp4` (2469 frames, 1080x1920, 60 fps, voice, code at be03dfa;
rendered from `Film3`). Bar: the approved hook pilot `video/deliverables/v3/v3_rework_pilot.mp4` (SQA 0-5.80).

Method: watched cold first, as a viewer scrolling a feed (0.25-scale frames, 5 per second of film, contact sheets;
once with the narration's words and timings beside the frames = "sound on", once with only the pictures and the
burned-in captions = "sound off"); notes per 2-3 s written BEFORE reading the owner's words, DIRECTION or any spec;
then turned into findings against the owner's words and the rules only.

## 1. Cold watch notes (written before reading any spec)

### Pass 1: sound off (pictures + burned-in captions only; 14 sheets, 5 frames per second, 0.25 scale)

| film s | where my eye went | what I understood | rough / empty / busy / abrupt / swipe? |
|---|---|---|---|
| 0-1 | pen outline of a phone and a $999 tag on frame 0, full colour by 0.2; the red tag, then the title | someone is about to buy a $999 laptop; the payoff line is printed on top | clean, warm, one subject. Two text blocks to read in the first second (title + caption) |
| 1-3 | the tag; the price ticks $1,015 ... $1,079; a tiny stick flies from the window into the phone | AI is making it pricier, the price is climbing | fine; the stick is tiny (I only saw it on the sheet, not as a read) |
| 3-6 | the phone washes pale, the "AI DATA CENTER" sign plate lights in the window | the data center is the cause | clear hand-off of focus; good |
| 5.4-6.4 | a pan right; a white chart card slides in | a chart is coming | smooth |
| 6.4-9.5 | the caption, then the chart: a thin red line falls 2005 -> 2025 | laptops get cheaper for the same power | the chart is small (about 2/3 of the width, 1/5 of the height, mostly empty white); the pale phone is the biggest thing on screen and says nothing new |
| 9.5-11.5 | two tiny laptop stickers ($999, BETTER $999) on the line | you buy, then a better one comes | the stickers' words are unreadable at phone size |
| 11.5-14.2 | only the caption changes ("But this past year, in the US,") | waiting | NOTHING new on screen: same framing since 6.0 s. First swipe point (~12-13 s) |
| 14.2-16.0 | the line's end kinks up (tiny), "+9.7%" in red; the tag on the pale phone flashes red | prices went up almost 10%; my laptop price is part of it | +9.7% reads; the up-kink itself is a few pixels |
| 16.0-17.4 | pan back left to the window, the phone lights up again | back to my phone | smooth, clear |
| 18.2-19.2 | a memory stick pops out of the phone top and grows over it | memory chips are inside laptops | strongest beat of the middle; clean, one subject |
| 19.4 | a giant close-up of the stick fills the frame: big black chip blocks, the caption printed over the board | ? | ABRUPT: reads as a cut into a heavy dark block; the caption sits on the stick |
| 19.6-21.0 | the stick sits on a heap; the camera pulls back to a hill of hundreds of tan rectangles with dark slots, a town at the foot | a pile ... of pallets? bricks? | the BUSIEST, roughest frames of the film; at phone size the heap does not read as memory chips; the voice says "AI data centers" but no data center is on screen |
| 21.0-21.4 | a near-black slab enters at the left edge, then "AI DATA CENTER" | oh, the data center sits by the hill | the slab is a black block cut by the edge for ~0.3 s |
| 21.4-22.6 | the street band: data center, gold hill, vans, a bench, a bike; a desk edge rises at the bottom | we are looking out of a window | fine settle |
| 22.6-25.2 | the hand and phone slide in from the left, cut by the left edge; many small vans in a row; a mug on the right | "they pay more, so they get first dibs" | I could not find "paying more" or "first dibs" on screen: who pays, which van goes first? Where do I look? |
| 25.2-27.0 | a slow push-in; a tiny crate hops above a white van; the mug grows | "what's left costs ..." | the crate is a few pixels; nothing says "what's left" |
| 27.0-29.0 | a white "~5x RAM chips" notice on the small shop at right | five times the price | readable, but small (about 1/5 of the width) and off to the side |
| 29.2-31.2 | the phone (half cut by the left edge) lights, $1,079 -> $1,099 | laptop makers pass it on | the beat plays on a half-visible phone |
| 31.3-33.4 | nothing new | "normally you'd wait for the better one" | NOTHING new on screen; second swipe point (~32 s): the same window frame since 23 s |
| 33.4-36.4 | a "2027" notice replaces "~5x" | next year is tighter | small, readable |
| 36.4-38.2 | a small camera nudge, the data-center sign lights white | "that's how an AI data center ..." | fine |
| 38.2-39.9 | the phone slides to the centre, big, full colour | it ends up on my price tag | clear payoff |
| 39.9-40.8 | the tag shows a tiny data center inside it; a purple toy elephant pops up beside the phone top | the data center IS my price tag | nice idea; the toy's pop at the same moment pulls my eye off the tag |
| 41.0 | top half wipes to the pale opening room while the bottom is still the window | loop | a split frame for a beat |

What stayed with me (sound off): the hook (0-6) and the chip pop (18-19) are the film at its best; the two long holds
(6-16 on the small chart, 23-36 on the street band) are where I would swipe; the heap (19.4-21) is the one place that
looks rough and busy rather than calm; the window band (23-36) has many small parts and no single place to look, and
the biggest bright shape there is the gold hill, which is not what the voice is talking about.

Motion as measured at phone size (moving-area share per 0.5 s, 0.1 s lag, luma step > 6): hook 2-3 %; 6.5-15.5 2-5 %
(the chart line plus a faint whole-scene float); 19-21.5 41-62 % (the zoom over the heap); 23-36 mostly 0.4-1.6 %,
with the only peaks at camera moves (25.0, 36.5) and the phone beats (30.0, 31.0).

### Pass 2: sound on (the voice's words and timings beside the frame at each spoken key word; 2 sheets, 38 beats)

The track is the voice alone (no bed): first sound at 0.20 s, pauses of 0.25-0.5 s between lines, silence 40.40-41.15.
Does the picture show what the voice says, when it says it?

| words heard (s) | on screen at that word | match? |
|---|---|---|
| "Buying a laptop soon?" (0.12) / "AI's making it pricier" (1.64-2.6) | the $999 tag, then the price ticking up | yes, exactly |
| "Well, AI data centers are." (3.64-4.04) | phone washes out, the data-center sign lights | yes |
| "Which is backwards." (5.80) | an empty chart card | late: "backwards" is only drawn from 7.0 |
| "Laptops get better for the same money ... right after you buy one" (7.08-10.44) | the falling line, two tiny laptop stickers | yes, but small |
| "But this past year, in the US," (11.48-12.60) | unchanged frame | NO: the story's turn ("But") has no picture for 2.7 s |
| "computers went up almost 10%." (13.56-14.84) | the up-kink at 14.2-14.6, "+9.7%" at 14.8 | yes (0.6 s late, fine) |
| "Mostly because your laptop runs on memory chips." (16.60-18.28) | back to the phone; the stick pops out of it | yes, the best-matched beat after the hook |
| "And so do" (19.40) | a giant dark close-up of the stick, caption over it | abrupt |
| "AI data centers." (19.96) | a heap of tan blocks; no data center anywhere | NO: the data center the voice names is not on screen until 21.0, and then as a black slab at the edge |
| "By the mountain." (21.32) | data center + hill + street | yes |
| "They pay more, so they get first dibs." (22.68-24.20) | the window band; a row of small vans; the pale phone's tag flashes at the left edge | NO: nobody visibly pays or goes first at phone size |
| "Which means what's left costs" (25.24-25.72) | a slow push; a few-pixel crate above a white van | NO: "what's left" is not readable |
| "about five times last year's price." (26.84-27.88) | "~5x RAM chips" notice on the far-right shop | yes, small |
| "And laptop makers pass that on." (29.16-30.28) | the half-visible phone lights, $1,079 -> $1,099 | yes, on a phone cut by the frame edge |
| "Normally you'd wait for the better one." (31.32-32.28) | unchanged frame | NO picture for 2.1 s |
| "But chip makers say next year's even tighter." (33.40-35.32) | "2027" notice replaces "~5x" | yes (from 34.8), small |
| "So that's how an AI data center ends up on your next laptop's price tag." (36.36-39.88) | sign lights; the phone slides to centre; the tag shows the data center | yes: a clean payoff; the toy elephant's pop at 40.4 competes with it |

Sound on, the film is easier to follow (the voice carries 11.5-14 and 22.7-26), but it confirms that four spoken beats
have no picture of their own and that two of the film's three longest holds (SQB's card, SQE's window band) are where
the picture falls behind the words.

## 2. Verdict

(pending)

## 3. Scores (the measures run)

(pending)

## 4. Findings (blockers first, then what the owner sees longest)

(pending)
