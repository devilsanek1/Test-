"""shapes_crops.py: the matching crops of shapes.md (ours and the references), in px of each picture resized to 1080 px
wide (the phone's width). Every crop avoids the phone UI (counters, mute buttons, the lighthouse post's chrome and
palette), the posters' titles and the captions.

Groups: OURS = v6 still; HS = refs_human_scale (02 and 03 are the owner's painting-style models); PT = refs_paint;
CP = the city posters. The painted references (HS + PT) are the main target; the posters are the clean, designed end
of the range (geometric patchwork, but hand-made edges)."""

LOOK = '/home/user/Test-/video/docs/look/'
SRC = {
    'ours_v6': '/home/user/Test-/video/docs/studies/2026-10-28_city_posters/paint_test/paint_still_v6.png',
    'hs01_city_hill': LOOK + 'refs_human_scale/01_city_hill_sunset.jpg',
    'hs02_bus_stop': LOOK + 'refs_human_scale/02_bus_stop_night.jpg',
    'hs03_beach_dusk': LOOK + 'refs_human_scale/03_beach_dusk.jpg',
    'hs04_cloud_beast': LOOK + 'refs_human_scale/04_cloud_beast_frame.jpg',
    'p01_beach_van': LOOK + 'refs_paint/01_beach_van_dusk.jpg',
    'p02_lighthouse': LOOK + 'refs_paint/02_lighthouse_process.jpg',
    'c01_singapore': LOOK + 'poster_refs/01_singapore.jpg',
    'c02_reykjavik': LOOK + 'poster_refs/02_reykjavik.jpg',
    'c03_hanoi': LOOK + 'poster_refs/03_hanoi.jpg',
    'c04_buenos_aires': LOOK + 'poster_refs/04_buenos_aires.jpg',
    'c05_cape_town': LOOK + 'poster_refs/05_cape_town.jpg',
    'c06_copenhagen': LOOK + 'poster_refs/06_copenhagen.jpg',
    'c07_kyoto': LOOK + 'poster_refs/07_kyoto.jpg',
}

GROUP_OF = lambda src: 'OURS' if src.startswith('ours') else 'HS' if src.startswith('hs') else 'PT' if src.startswith('p0') else 'CP'

# (crop id, element, source, x0, y0, x1, y1, what it shows)
CROPS = [
    # ---- sky: the open sky and its thin forms (streaks, banks, wisps), no hero cloud, no title
    ('ours_sky', 'sky', 'ours_v6', 230, 0, 650, 330, 'v6 sky: hatch, the mid bank'),
    ('ours_sky_low', 'sky', 'ours_v6', 0, 590, 262, 760, 'v6 low sky: streaks, sun, flock'),
    ('hs01_sky', 'sky', 'hs01_city_hill', 0, 0, 560, 115, 'sunset sky, cloud streaks'),
    ('hs02_sky', 'sky', 'hs02_bus_stop', 0, 0, 400, 205, 'night sky, wisps, stars'),
    ('hs03_sky', 'sky', 'hs03_beach_dusk', 560, 0, 1080, 260, 'dusk sky, banks, hatch'),
    ('p01_sky', 'sky', 'p01_beach_van', 30, 25, 560, 170, 'dusk sky, soft clouds'),
    ('p02_sky', 'sky', 'p02_lighthouse', 215, 420, 480, 1000, 'day sky, soft clouds'),
    ('c05_sky', 'sky', 'c05_cape_town', 0, 260, 1000, 450, 'poster sky, paper texture'),
    ('c02_sky', 'sky', 'c02_reykjavik', 450, 380, 1080, 800, 'aurora, pale wedges'),
    ('c01_sky', 'sky', 'c01_singapore', 150, 230, 900, 560, 'poster sky, pale blocks'),
    # ---- cloud: the hero cloud mass
    ('ours_cloud', 'cloud', 'ours_v6', 640, 0, 1080, 330, 'v6 near cumulus'),
    ('hs02_cloud', 'cloud', 'hs02_bus_stop', 380, 10, 860, 290, 'the bus-stop cloud'),
    ('hs03_cloud', 'cloud', 'hs03_beach_dusk', 60, 30, 600, 340, 'the beach-dusk cloud'),
    ('hs04_cloud', 'cloud', 'hs04_cloud_beast', 60, 480, 1080, 1500, 'the glowing cumulus (9:16, x1.5)'),
    ('p01_cloud', 'cloud', 'p01_beach_van', 560, 70, 1060, 230, 'pink dusk clouds'),
    ('p02_cloud', 'cloud', 'p02_lighthouse', 700, 560, 1040, 1080, 'day cumulus'),
    ('c05_cloud', 'cloud', 'c05_cape_town', 230, 455, 1080, 600, 'the table cloth cloud'),
    ('c01_cloud', 'cloud', 'c01_singapore', 780, 430, 1080, 620, 'poster cloud and blocks'),
    # ---- tree: trees and greenery masses
    ('ours_tree', 'tree', 'ours_v6', 0, 1250, 310, 1530, 'v6 near tree'),
    ('hs02_trees_l', 'tree', 'hs02_bus_stop', 0, 190, 270, 320, 'night trees, left'),
    ('hs02_trees_r', 'tree', 'hs02_bus_stop', 920, 190, 1080, 310, 'night trees, right'),
    ('c03_tree', 'tree', 'c03_hanoi', 0, 390, 430, 800, 'flame tree'),
    ('c07_pine', 'tree', 'c07_kyoto', 330, 1000, 560, 1200, 'pine'),
    ('c07_maple', 'tree', 'c07_kyoto', 0, 880, 300, 1250, 'maple branches'),
    ('c05_domes', 'tree', 'c05_cape_town', 380, 960, 700, 1130, 'round trees'),
    ('c04_jacaranda', 'tree', 'c04_buenos_aires', 480, 1000, 660, 1200, 'jacaranda'),
    ('c01_trees', 'tree', 'c01_singapore', 0, 900, 560, 1020, 'far trees band'),
    # ---- building: man-made masses
    ('ours_facade', 'building', 'ours_v6', 330, 590, 1080, 1080, 'v6 facade (the subject\'s)'),
    ('ours_far_city', 'building', 'ours_v6', 0, 590, 330, 960, 'v6 far city and tower'),
    ('hs01_towers', 'building', 'hs01_city_hill', 520, 130, 1080, 450, 'sunset towers'),
    ('hs02_shelter', 'building', 'hs02_bus_stop', 380, 285, 710, 480, 'the bus shelter'),
    ('p02_tower', 'building', 'p02_lighthouse', 380, 430, 880, 1420, 'the lighthouse'),
    ('p01_van', 'building', 'p01_beach_van', 130, 185, 370, 320, 'the van (man-made)'),
    ('c06_houses', 'building', 'c06_copenhagen', 0, 760, 700, 1180, 'harbour houses'),
    ('c02_houses', 'building', 'c02_reykjavik', 0, 1060, 900, 1420, 'roofs'),
    ('c04_palace', 'building', 'c04_buenos_aires', 600, 900, 1080, 1300, 'palace'),
    ('c03_city', 'building', 'c03_hanoi', 330, 500, 1080, 760, 'far city'),
    ('c05_houses', 'building', 'c05_cape_town', 690, 760, 1080, 1300, 'pink houses'),
    # ---- ground: the ground plane near the viewer
    ('ours_paving', 'ground', 'ours_v6', 300, 1280, 1080, 1540, 'v6 paving, joints, shadows'),
    ('ours_near', 'ground', 'ours_v6', 0, 1540, 1080, 1920, 'v6 near ground and props'),
    ('hs02_ground', 'ground', 'hs02_bus_stop', 0, 300, 380, 545, 'reeds and road'),
    ('hs03_ground', 'ground', 'hs03_beach_dusk', 0, 395, 730, 561, 'sea foam and wet sand'),
    ('hs01_ground', 'ground', 'hs01_city_hill', 0, 470, 960, 566, 'dark grass hill'),
    ('p01_ground', 'ground', 'p01_beach_van', 120, 280, 1060, 365, 'sand and stones'),
    ('p02_ground', 'ground', 'p02_lighthouse', 200, 1360, 940, 1620, 'rocks and water'),
    ('c05_road', 'ground', 'c05_cape_town', 450, 1290, 960, 1437, 'street'),
    ('c06_quay', 'ground', 'c06_copenhagen', 0, 1370, 950, 1464, 'quay paving'),
    # ---- people: figures at phone scale
    ('ours_her', 'people', 'ours_v6', 640, 890, 730, 1090, 'v6 her, in the door'),
    ('ours_man', 'people', 'ours_v6', 915, 935, 1010, 1035, 'v6 man at the right'),
    ('hs03_couple', 'people', 'hs03_beach_dusk', 740, 320, 830, 470, 'the couple'),
    ('hs01_people', 'people', 'hs01_city_hill', 395, 290, 540, 490, 'two people on the hill'),
    ('hs02_sitter', 'people', 'hs02_bus_stop', 540, 370, 630, 465, 'the sitter'),
    ('hs04_girl', 'people', 'hs04_cloud_beast', 670, 1620, 820, 1820, 'the girl'),
    ('c03_rider', 'people', 'c03_hanoi', 80, 1290, 250, 1442, 'cyclo rider'),
]
