# Pro practice 3: nature that looks real but is stylised

*City-poster study, pro-practice researcher 3, 2026-10-28. Analysis only: nothing here is a rule until the owner
approves it; `video/docs/look/DIRECTION.md` stands. Meter: `video/scripts/look/posters/pro_3_nature.py` (25 nature
samples, boxes in each screenshot's own pixels, the UI masked; lengths in px at a 1080-wide frame). Sheets:
`img/pro_3_nature_anatomy.jpg` (what reads real, what is low poly, and v2), `img/pro_3_nature_recipe.jpg` (the tree
recipe drawn in flat SVG, rendered in Chrome). Scratch: `/tmp/posters-pro_3_nature/`.*

Status: sections 1-2 written; 3-6 being filled in.

## 1. The feeling, restated precisely
The owner: nature is "very subtle", "visually very interesting", "obviously very real, but if you look closely we
combine the real effects with the lower poly kind of effects". Measured, it is three things at once:
1. **A realism ladder by distance and role**, the same species of shapes getting simpler as it recedes:
   - **Near, framing, cut by the frame** (Singapore's banana leaves `[0,1330,250,1620]`, Hanoi's flame tree
     `[0,420,470,860]`, Kyoto's maples `[0,880,250,1180]` and bamboo `[860,1260,1206,1470]`, Cape Town's proteas
     `[0,1260,520,1600]`, Buenos Aires' jacaranda `[980,1360,1206,1575]`): species-true silhouettes (roughness, the
     edge's length over its 8 px-smoothed length, 1.31-3.19), 6+ tones over an L* range of 32-49, painted rather than flat
     (flat share 0.13-0.59), and dark (mean L* 33-42 for leaves). This is the most "real" nature in every poster.
   - **Mid masses** (Singapore's round trees `[0,1020,340,1112]`, Cape Town's `[440,1090,600,1180]`): Mary Blair's
     lollipops, each crown a disc split into a lit and a shade half (roughness 1.19-1.31, as smooth as v2's 1.25),
     yet still 5-6 tones over 28-41 L*. Hanoi's lake trees `[400,770,1100,900]` sit between (scalloped, 1.67).
   - **Far** (Kyoto's ranges `[260,650,1200,760]`, Reykjavik's Esja `[400,885,1206,990]`, far trees inside the
     patchwork): straight-edged polygons (Esja 47 % of its edge in straight runs >= 30 px), flat (Kyoto flat share
     0.95), Kyoto 4 tones in ~5 L* steps (Esja and Table Mountain 5-7), local contrast 2.6-5.3 (CRAFT §e).
2. **Low poly where the light turns, real at the silhouette, in the air and in the material.** The facets sit INSIDE
   organic shapes: a bract or leaf folded along its midrib into a lit half and a shade half (proteas, banana leaves;
   tone steps 6-13 L*), a crown split into two half-discs, a boulder cut into triangles (the Little Mermaid's rock
   `[820,1330,1206,1560]`: 49 % straight edge, steps 7-13 L*), a range cut into lit-snow and shade faces (Esja). The
   real effects: (a) the species silhouette (the flame tree's lace, the maple's lobes, the jacaranda's dabs); (b) a
   material inside a facet (Table Mountain's strata and gullies, the rock's stone mottle: mottle 4.4-6.7 L*); (c) soft
   air: the tablecloth cloud's top edge is 7.5 px wide against the ridge's 3.7 and a building's 1.9, and the aurora is a
   whisper (dL* -1.8, da* -1.6, db* +1.6 on its sky: dE ~2.9; vertical streaks every ~23 px); (d) particles: the Merlion's stream
   breaks into droplets of ~1-3 px (est.) at its edges; (e) true reflections (style.md 1.7). "Very subtle" is literal: the soft
   effects sit within dE ~2-5 of what is behind them, the facets within 5-13 L* of their neighbours.
3. **Nature carries the darks and the counter-shapes.** Leaves at mean L* 33-48 are each poster's mid-dark field, and
   their curves are the only organic edges against the ruled city (style.md 1.3: the city's edges are level, plumb or
   45 deg; "the rest organic (foliage, flowers)").

**Where v2 stands** (the anatomy sheet's last row): one mode for all nature. S1's sage tree, the nearest nature in the
film (`baseline` v2 @3.0 `[0,1290,290,1480]`), is five flat circles and two floating shade ellipses: 4 tones over 19
L*, mean L* 71, flat share 0.93, local contrast 3.0. That is Blair's lollipop on the plane where every poster puts its
most real nature. S5's blossom trees (@22.0 `[0,790,320,1000]`, `[760,790,1080,1100]`) are one mauve body with pink
polygons and dots spread evenly, branch whiskers poking out of the silhouette, and their lit sides face 16 deg and -67 deg
(no one key). The approved pieces stay: the falling leaves ("leafs are great") and the shared water ("Yeah this is better").

## 2. How the professionals do it
Web note: in this session WebFetch was blocked (DNS) for gurneyjourney.blogspot.com and the-solute.com, so pages were
read through search summaries; quotes marked (s) should be checked against the page before they are quoted as exact.
1. **Satoru Takizawa, *Breath of the Wild*** ("Change and Constant", GDC 2017-03-01, https://gdcvault.com/play/1024562;
   Zelda Universe, 2017-03-14): the art style is "the reconciliation between ... playability and reality"; the artists
   looked for "an art style that makes it easy to lie", and *Wind Waker*'s lies were "too big" (s). **Teaches:** the
   size of the lie. Small lies near, bigger lies far, and never a big lie on the nearest plane (v2's lollipop).
2. **Jane Ng and Olly Moss, *Firewatch*** (GDC 2016 "Making the World of Firewatch"; PC Gamer, "Why less is more when it
   comes to Firewatch's beautiful trees", 2016, https://pcgamer.com/why-less-is-more-when-it-comes-to-firewatchs-beautiful-trees;
   Game Developer, "Jane Ng only made 23 unique trees"): 23 hand-made trees for ~4,600 placed, flat billboards far;
   Moss asked for trees "more stylised" as they recede; the aim "aesthetically stylised" yet "felt real" (s). **Teaches:**
   a few well-made species per film, reused; stylisation grows with distance (pro_1 takes the depth side).
3. **Eyvind Earle, *Sleeping Beauty*** (1959; Walt Disney Family Museum, https://www.waltdisney.org/eyvind-earle;
   *Awaking Beauty*, 2017): "I wanted stylized, simplified Gothic" (s); his bushes start as a blob, then smaller and
   smaller leaves (Gurney Journey's video bio of Earle, 2019-02-06, (s)); trees as ruled columns with crisp edges.
   **Teaches:** a designed big shape carries the style; the realism is controlled small detail laid on it.
4. **Mary Blair and Charley Harper.** Blair's trees "become lollipops or triangles", the colour fields compose and a
   thin line adds detail after (John Canemaker, *The Art and Flair of Mary Blair*, 2003; WBUR, 2016-02-15,
   https://www.wbur.org/news/2016/02/15/mary-blair). Harper's "minimal realism": "I don't count the feathers ... I just
   count the wings" (Audubon, "Counting the Wings", 2008, https://www.audubon.org/magazine/january-february-2008/counting-wings;
   wording varies). **Teaches:** mid and far nature may be pure geometry if the species' key counts are right.
5. **Henri Rousseau's jungles** (National Gallery of Art, "Rousseau in the Jungle",
   https://www.nga.gov/educational-resources/art-and-ecology/rousseau-jungle; National Gallery London on *Surprised!*,
   1891): Jardin des Plantes specimens "as a point of departure, vastly enlarging and changing them"; "giant leaves
   overlapping in shades of green". **Teaches:** near nature = one real species, enlarged, flattened, overlapping in a
   family of greens (Singapore's banana leaves, Kyoto's maples).
6. **Kazuo Oga, Ghibli's backgrounds** (Animation Obsessive, "What Kazuo Oga Thinks About When He Thinks About
   Backgrounds", https://animationobsessive.substack.com/p/what-kazuo-oga-thinks-about-when): looked at closely, his
   paintings are "impressionistic ... He's not rendering everything"; a forest's "expressions" come from "the density of
   trees, the weather, the transition of light" (s). **Teaches:** it reads real because the light and the density are
   right, not because of the leaf count: the owner's "if you look closely".
7. **James Gurney and John F. Carlson on values.** Gurney (*Color and Light*, 2010; Gurney Journey, "Foliage is lightest
   at its outer edges", 2015-12-01, and "Transparency of foliage", 2009-06-08, (s)): state the largest masses first;
   dense foliage reads as a light side and a shadow side; in indirect light it is lightest at its outer and upper edges
   and darkest at its core; sky holes are darker than the open sky, used sparingly; shaded leaves facing up go blue-green.
   Carlson (*Carlson's Guide to Landscape Painting*, 1929, "Angles and Consequent Values";
   https://theartistsroad.net/articles/thecarlsontheoryofangles): the sky lightest, then the flat ground, the slants
   (mountains, roofs), the uprights (trees) darkest. **Teaches:** the value of every cluster and every plane.
8. **Cartoon Saloon, *Wolfwalkers*** (2020; BTL News, "The Myriad Animation Styles Within Wolfwalkers",
   https://www.btlnews.com/?p=93527; Maria Pareja, Awards Radar, 2021-03-04): the town in "thick lines and angular,
   geometric shapes" from woodcuts, the forest in "curving shapes" and watercolour, "rich and alive"; near the forest
   edge "some of the trees were angular and had more of a thick line" to meet the town (s). **Teaches:** nature is the
   curved counter-shape to the ruled city, and nature beside buildings may borrow their facets (the posters' midrib and
   half-disc splits are that bridge).
9. **Low-poly games and the one-mass crown.** Ken Wong, "The Art of Monument Valley" (GDC 2015,
   https://gdcvault.com/play/1022299): low-poly 3D art and Japanese flower arrangement among the sources, every frame
   "worthy of public display" (s); Harry Nesbitt (*Alto's*, Pocket Gamer interview, 2018): "a more minimalist,
   impressionistic approach". Game artists light a stylised crown as ONE form by giving its leaves a sphere's or hull's
   normals (gamesartist.co.uk "Lush tree"; the Blender "Foliage Normals" add-on, superhivemarket.com). **Teaches:**
   one value per facet from its angle to the key (flat shading), and the crown lit as one mass, its leaves only
   breaking the silhouette and the terminator.
10. **Calm wind.** Tiago Sousa (Crytek), "Vegetation Procedural Animation and Shading in Crysis", *GPU Gems 3* ch. 16
    (2007, https://developer.nvidia.com/gpugems/gpugems3/part-iii-rendering/chapter-16-vegetation-procedural-animation-and-shading-crysis):
    main bending (the whole plant along the wind, scaled by height) plus detail bending (leaves, edges), phases from the
    object's position, the branch and the vertex; "too much bending will ruin the illusion". Bill Rockenbeck (Sucker
    Punch), "Blowing from the West: Simulating Wind in Ghost of Tsushima" (GDC 2021, https://gdcvault.com/play/1027124):
    one wind for the world, gusts as "vorticles" (position, orientation, radius, direction) that grass, trees, leaves
    and cloth all read. **Teaches:** one shared wind; sway in a hierarchy (crown, cluster, leaf edge), each smaller and
    faster, its phase from position; nothing in lockstep, nothing redrawn.
11. **Stylised water effects in layers** (80.lv, Arbaz Malik's waterfall: the main stream, two whitewater layers, an upper
    and a lower mist, https://80.lv/articles/how-to-create-realistic-waterfall-vfx-in-houdini; *RiME*-style stylised falls
    from "multiple simple meshes and particles"). **Teaches:** a spray is a core shape, edge droplets and a mist band,
    each its own layer with its own motion.

## 3. The concrete approach for our films
### 3.0 The shared rules (all nature)
(pending)
### 3.1 Trees and foliage
(pending)
### 3.2 Flowers and plants
(pending)
### 3.3 Mountains and rocks
(pending)
### 3.4 Clouds and sky effects
(pending)
### 3.5 Water and spray
(pending)
### 3.6 Engine, gate, check, cost, risk (one table)
(pending)

## 4. What it would change in v2 (the baseline)
(pending)

## 5. What the owner didn't name that matters for this feeling
(pending)

## 6. Clashes with the owner's earlier words, and open questions
(pending)
