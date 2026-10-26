# Sense of enclosure: the urban-design science, as 9:16 framing rules (research lane, 2026-10-25)

For v3 (desk nook at night, data center outside, scale pull-back) and v2 (DeepMind staff afraid to speak out). Sister file
`coziness.md` = the feeling; this = the geometry. Colours follow `../PALETTE.md`. Tags: **VERIFIED** = our measurement /
arithmetic or several sources agree; **REPORTED** = one secondary source or search summary; **UNCERTAIN** = contested,
unconfirmed or from memory. Rules are proposals for G4. Page fetches were blocked (proxy 403): claims come from search text.
Conventions: 1080 x 1920, captions y 387 / 510 (block 317-556), level camera, eye 1.6 m, walls 10 m, kit `persp1` f 1000.

## 0. The rules in brief
1. **Cozy = held, not shut:** walls on 2-3 sides + ONE brighter opening the subject faces (fully closed rooms drew exit decisions, §9).
2. **Pick H:W by mood:** canyon >= 2:1 (pressure) / cozy 1:1-1:1.5 / comfortable 1:2 / minimum 1:3 / exposed >= 1:4.
3. **9:16 crops the side walls** (sky 30 % at 1:2 vs 36 % at 1:4); what reads: a wall cut by the top, no side gaps, a closed vista.
4. **Close the vista:** <= 1 long sight line per cozy shot, ending on one object (tower, bend, the data center).
5. **Near boundaries beat far ones:** >= 1 enclosing element cut by a frame edge in every cozy shot.
6. **Human scale:** doors / windows on >= 50 % of the near ground storey, 3-6 hand-sized props in the near third.
7. **Sequence here -> there (Cullen):** enclosure with its opening (<= 30 % of frame) -> push through it -> reveal.

## 1. The owner's reference, measured (VERIFIED; `../ref_sense_of_enclosure.jpg`, 335 x 597)
Likely Circus Lane, Edinburgh [UNCERTAIN]. Eye-height camera tilted slightly up: VP ~ (0.70 W, 0.60 H). Sky 27 % of the
frame, a funnel widest at the top, all above 0.50 H. Asymmetric walls: left a 3-4 storey wall cut by the top edge (x 0-0.24
W), right a soft tree / hedge wall from 0.25 H down (x 0.75-1.0 W). The red overlay: H 0.35-0.73 H (223 px), W 0.24-0.93 W
(231 px) = **1:1 on screen**. Closure: a tower at x 0.45 W (top 0.15 H) ends the vista; the lane bends right in the far
third (deflection). Cobbles fill the bottom 30-38 %. Human scale: lamps, pots, climbers, doors, windows. Title caption on
sky / tower (0.27-0.33 H), subtitle on the cobbles (0.75 H).

## 2. Height-to-width ratio: what each feels like
| H:W | elevation of the opposite eave (atan H/W) | reported feel | tag |
|---|---|---|---|
| >= 2:1 | 63° | "canyon effect" | REPORTED (Durham NH) |
| 1:1 | 45° | full / strong enclosure, strong place-making | REPORTED, several |
| 1:2 | 26.6° | strong definition; the great-streets band is 1:1-1:2.5 | REPORTED (Jacobs, via summaries) |
| 1:3 | 18.4° | minimum; past it enclosure is lost | REPORTED (CNU, Edinburgh, Manual for Streets) |
| 1:4 | 14° | weak (or where enclosure first appears) | UNCERTAIN: sources disagree |
| 1:6 | 9.5° | absolute minimum; public, exterior-like | REPORTED (Davie FL; Ashihara D/H >= 6) |

Angles: VERIFIED arithmetic (the 45/30/18/14 labels credited to Spreiregen 1965: UNCERTAIN). A 1985 Japanese study found
good enclosure at 0.28 <= H/W <= 0.97 [REPORTED]. Tighter than 1:1 turns intimate, then cramped (Jakle) [REPORTED]. A VR
test of 8 squares found optimal D/H **wider** than theory for most qualities (Kim & Kim 2019) [REPORTED, abstract]: a 1:1
lane is a cozy *beat*, 1:2 the default. Trees count as walls and rescue streets wider than 1:3 [REPORTED].

## 3. The 9:16 geometry (VERIFIED, arithmetic)
- Every cross-section of a one-point street is an H:W rectangle at any depth and lens: draw the ratio as nested portals.
- The roofline rises from the VP at slope s = 2(H - e)/W (lens-independent); the kerb falls at 2e/W.
- Sky share, centred VP, horizon y_h: y_h^2/s if y_h/s <= 540, else 1080 y_h - 291600 s (of 2,073,600 px).

| H:W | roofline from VP | sky share, horizon 0.42 / 0.60 H | roofline leaves the frame (0.42 / 0.60) | sky slot at y 510 (0.42 / 0.60) |
|---|---|---|---|---|
| 2:1 | 73° | 9 / 19 % | top edge x 300-780 / x 197-883 | 176 / 382 px |
| 1:1 | 59° | 19 / 36 % | top corners (x 60, 1020) / side at 0.13 H | 352 / 764 px |
| 1:1.5 | 48° | 26 / 44 % | side 0.10 H / 0.28 H | 529 / full |
| 1:2 | 40° | 30 / 48 % | side 0.18 H / 0.36 H | 705 / full |
| 1:3 | 29° | 34 / 52 % | side 0.26 H / 0.44 H | 1057 / full |
| 1:4 | 23° | 36 / 54 % | side 0.30 H / 0.48 H | full / full |
| none | (none) | 42 / 60 % | (none) | full |

- **Captions:** a 2-line caption (~900 px) fits the sky V only at street >= 1:2.5 (horizon 0.42 H), >= 1:2 (0.50 H) or
  >= 1:1.5 (0.60 H). A 1:1 lane can't carry sky captions: make it asymmetric like the reference (one side <= 0.3 H), put
  the caption on a flat quiet facade / sign, or cap it at 760 px with the horizon at 0.60 H.
- **The look-up trick:** the reference's horizon at 0.60 H gives the walls height and keeps a sky slot, still reading as
  eye level. Enclosure street shots: horizon 0.50-0.60 H, VP off-centre at 0.60-0.70 W.
- **Kit (`PerspectiveStreet`):** `road` is the HALF width: W = 2(road + walk), heights ~ ratio x W. Header example (120 /
  260 / 270-330) = 1:2.5 (weak); defaults (420 / 260 / 700-1700) = 1:1.9-1.25:1. **Cozy lane:** camH 160, road 150, walk
  150 (W 6 m), heights 500-750, vp [650-750, 960-1150].

## 4. Maertens' optical scale (1877): 45° / 27° / 18°
~45° up: you study details; ~27°: the object reads as one whole image; 18-20° is listed (object with its surroundings)
[REPORTED, digitised book + Colonnese 2017; the 18° detail UNCERTAIN]. With D = W these are exactly 1:1, 1:2, 1:3, which
is why Maertens and the street literature agree [VERIFIED]. On screen (f 1000, horizon y 806; top edge = 39° up):

| θ | street | facade top, y = 806 - 1000 tan θ | reads as |
|---|---|---|---|
| 45° | 1:1 | cut by the top edge (y -194) | a wall around you: intimacy, details |
| 27° | 1:2 | y 296 (0.15 H) | a building as one object: establishing |
| 18° | 1:3 | y 481 (0.25 H) | part of a skyline / group |
| 14° | 1:4 | y 557 (0.29 H) | a backdrop; enclosure gone |

- **Caption clash:** tops seen at 14-26° land in the caption block. Keep them >= 27° (above y 300) or <= 14° (below
  y 560), or make the part inside the band a flat quiet field (`quietAbove`).
- **Scale tie-in:** the playbook's worm's-eye peak (horizon 0.70 H, tower top above 0.15 H) is a 47° view at f 1000, just
  past "can't take it in whole"; for "feel small", put the colossus top beyond 45-60°, cut by the frame.

## 5. Ewing & Handy (2009): enclosure and human scale, measured
Expert panels rated street clips; five qualities (imageability, enclosure, human scale, transparency, complexity) became
counts of physical features [REPORTED, abstract; J. Urban Design 14(1):65-84]. **Enclosure** = 2.57 + 0.72 wall own side + 0.94 wall
opposite side - 1.42 sky ahead - 2.19 sky across - 0.31 per long sight line [REPORTED, adapted scoring sheet; a second
source confirms the opposite wall is the largest term]. **Human scale** = 2.61 + long sight lines (-), street-level windows
(+), building height (-), planters (+), street furniture (+) [REPORTED]; weights -0.74 / +1.10 / -0.003 / +0.05 / +0.04
[UNCERTAIN, from memory]. **In frame:** >= 75 % of each side's length as continuous wall (trees count); no side gaps below
the roofline ("sky across" leaks worse than the sky V ahead); in a 3/4 view the opposite side is the taller, unbroken one;
light a few street-level windows at night (the strongest human-scale cue).

## 6. Camillo Sitte (1889): the closed square
Squares as enclosed entities; T-junctions and curving streets with changing vistas over straight boulevards [REPORTED].
Least dimension ~ the main building's height, 2x the working maximum; oblong up to ~3:1 (Unwin) [REPORTED, secondary].
**In frame:** plaza depth 1-2x the main building's height (top 27-45° up: just in frame or cut); side streets meet at an
angle so a facade, not sky, shows in each gap; bend lanes in the far third so the far wall closes the view.

## 7. Gordon Cullen, *Townscape* (1961): serial vision, here and there
Serial vision: a walk as a series of revelations, "existing view" vs "emerging view"; the other gateways are position
(here and there) and content (this and that). The outdoor room gives position and identity; closure, deflection and
punctuation are named devices [REPORTED; definitions UNCERTAIN]. **As camera grammar:** *here* = inside the enclosure, the
*there* seen through one opening at 10-30 % of the frame; *move* = a multiplane push through that frame (frame on a depth
-0.5 layer); *there* = the reveal. One revelation per move, one long reveal per video (playbook scale doses).

## 8. Christopher Alexander, *A Pattern Language* (1977) -> the v3 nook [REPORTED, mirrors of the book text]
- **106 Positive outdoor space** (leftover space goes unused; give it enclosure and a convex shape): the ground reads as
  one closed convex trapezoid, bounded both sides and at the end.
- **114 Hierarchy of open space** (back protected, looking out to a larger opening): camera and subject stand in the
  small space (nook, lane, porch) looking into the larger one.
- **159 Light on two sides** (people abandon rooms lit from one side): warm lamp one side, cool window the other, flat.
- **180 Window place / 222 Low sill** (sills 12-14 in = 30-36 cm): the window's bottom edge at the desk line; the wall's
  thickness as a deep reveal, a 0.03-0.05 W band, so the wall visibly holds the window.
- **179 Alcoves, 190 Ceiling height variety** (spots for ones and twos; uniform ceilings can't make people comfortable;
  alcove heights UNCERTAIN): a soffit / slope cuts the top 8-15 % over the nook, the taller room seen at the other edge.
- **252 Pools of light** [UNCERTAIN, from memory]: 1-2 pools (lamp ellipse 0.5-0.7 W, ref 2 §1.7), the room between
  them one value step down.

## 9. Prospect-refuge (Appleton 1975, Hildebrand 1999) -> where the subject stands
See without being seen; hazard is the third term; Hildebrand applied it to ceiling heights and terraces [REPORTED].
Evidence: a meta-analysis counted prospect 19 supportive / 2 contrary vs refuge 8 / 4 (Dosen & Ostwald 2016) [REPORTED;
totals UNCERTAIN]; enclosed rooms drew more exit decisions, open rooms and high ceilings were judged more beautiful
(Vartanian 2015) [VERIFIED, abstract]; enclosure tracks boundary height and near boundaries outweigh far ones (Stamps
2012) [REPORTED]. **Frame rules:** *refuge* = near surround (shelf, wall, soffit, curtain) 35-55 % of the frame on >= 2
edges, plus a top-edge element in 0-0.15 H (under the platform UI); *prospect* = one opening 15-30 %, centred at 0.30-0.45
H, ~10-15 L* lighter than the surround (holds the caption if flat); *subject* = head at 0.45-0.60 H, back or 3/4-back,
back to a wall, facing the opening, never above its top; *hazard* = in the prospect, kept outside (v3 data center glow in
the window; v2 watching windows).

## 10. The enclosure dial, for both videos
| dose | geometry | frame cues | feel | v3 | v2 |
|---|---|---|---|---|---|
| canyon | >= 2:1, sky slit <= 10 % | rooflines >= 73°, both walls cut by the top, blank or no end | pressure, trapped | (none) | glass-tower corridor; hallway with no exit |
| cozy | 1:1-1:1.5, one opening 15-30 % | one wall cut by the top, soft low side, closed vista, lamp pool | held, safe | desk nook; snowy lane | writing the letter at home at night |
| baseline | 1:2 | sky V ~30 %, captions in the sky | comfortable | transitions | transitions |
| exposed | >= 1:4 or plaza; observer 0.04-0.08 H | sky >= 36 %, long sight lines, no near boundary | small, watched | data center reveal | lone figure on a plaza under walls of windows |

Cozy -> exposed is v3's pull-back (reuse the nook's window shape as the tiny lit window at the colossus's foot, >= 10:1
per the playbook); canyon -> cozy is v2's "afraid" -> "speaking out". Arcane collage (`../../../assets/ref_cinematic/
arcane_collage.jpg`), in words: r2c3 terrace figure, a hanging lantern cutting the top edge, dark masses both sides, low sun
(refuge facing prospect); r2c2 tiny figure in a dark round hall under one shaft (extreme enclosure, one opening); r3c1 a
couple between railings (near boundaries both edges); r1c1 two figures on a roof edge over a night city (prospect).

## 11. Colour (follows `../PALETTE.md`)
Enclosing walls are background / mids (dominant wall L* >= 75, clay family), never the dark anchor, which stays ~5 % on
small things (muntins, hair, book spines): refuge "darkness" is one value step between surround and opening, flat, no
gradients. The opening carries the colour job: in the v3 nook the data center glow is the one hot pop (1-3 %), the hero
(5-15 %) sits on the subject or laptop, the lamp pool is a lighter warm page tint, the window light the cool tint. Sage
Study for the nook, its sister Dusk for the exterior reveal (PALETTE.md "How to use it").

## Sources
- Ratios: https://www.cnu.org/publicsquare/2023/04/18/how-urbanism-density-and-spatial-enclosure-are-related · https://greatstreets-stl.org/neighborhood-shops-design/site-planning/urban-scale · https://www.movementandplace.nsw.gov.au/place-and-network/built-environment-indicators/street-enclosure · https://www.davie-fl.gov/DocumentCenter/View/1303/Transit-Oriented-Corridor-Ideal-Height-to-Width-Ratios · https://www.durhamnh.gov/DocumentCenter/View/20185/Amendment-for-fifth-story-setbacks · https://doi.org/10.2208/jscej.1985.131 · https://viewpointvancouver.ca/2006/10/23/ratios/ · https://www.mdpi.com/2071-1050/9/4/675/xml · https://ashihara.jp/da/html/lect0102ea.htm · https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6427127/ · https://stud.epsilon.slu.se/12468/
- Maertens: https://digital.ub.uni-paderborn.de/download/pdf/7838430.pdf · https://papiro.unizar.es/ojs/index.php/zarch/article/download/2263/2024/5793 · (angle labels, forum) https://interviewmania.com/discussion/100916-architecture-and-planning-miscellaneous-architecture-and-planning-miscellaneous-topic
- Ewing & Handy: https://edisciplinas.usp.br/mod/resource/view.php?id=2754910 · https://public-pages-files-2025.frontiersin.org/articles/1631826/file/data_sheet_1.pdf/1631826_data-sheet_1/1 · https://www.sciencedirect.com/science/article/pii/S2210670723000057
- Sitte: https://en.wikipedia.org/wiki/The_Art_of_Building_Cities · https://londonsquares.net/design-issues/
- Cullen: https://apollo-magazine.com/?p=1046914 · https://www.yorkc20.york.ac.uk/vignette/walking-through-walmgate/ · https://researchonline.rca.ac.uk/5273/2/The%20Ragpicker%27s%20Journal%20REDACTED.pdf
- Alexander: https://www.patternlanguage.com/apl/apl159/apl159.htm · https://urbigenous.net/a-pattern-language/pattern-106.html (also pattern-114, -180, -222) · https://www.schemataworkshop.com/blog/tag/common+house · https://moss-design.com/design-diversity/
- Prospect-refuge: https://en.wikipedia.org/wiki/Jay_Appleton · https://metropolismag.com/projects/a-new-humanism-part-5/ · https://cityterritoryarchitecture.springeropen.com/articles/10.1186/s40410-016-0033-1 · https://doi.org/10.1016/j.jenvp.2014.11.006 · https://portalinvestigacio.uib.cat/documentos/5e39b79e2999523aa92714b1 · https://ideas.repec.org/a/sae/envirb/v32y2005i5p735-762.html · https://metatoc.com/papers/2385-effects-of-multiple-boundaries-on-perceived-spaciousness-and-enclosure
