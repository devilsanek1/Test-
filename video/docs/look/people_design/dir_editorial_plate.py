# Builds the doorway plate for the editorial people sheet (dir_editorial.png, row B): a crop of the painted still v6
# with the still's own "her" painted out. The doorway's interior is flat bands of colour, so the reconstruction is
# exact, rule by rule: the two wall bands, the table's edge and leg, the floor, the threshold, the jamb and the frame.
# Run from video/:
#   python3 docs/look/people_design/dir_editorial_plate.py \
#     docs/studies/2026-10-28_city_posters/paint_test/paint_still_v6.png src/look/people_dirs/editorial/door_v6_plate.png
# The crop is (440, 790)-(900, 1120) of the 1080 x 1920 still; the old figure's feet were at (685, 1078), so a new
# figure stands at (245, 288) in the plate.
import sys
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
px = im.load()
H = lambda s: tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))
orig = im.copy()
op = orig.load()
for x in range(664, 716):
    for y in range(915, 1083):
        if x >= 697:
            if 955 <= y <= 990:
                px[x, y] = op[x, 950]
            continue
        if y >= 1076:
            px[x, y] = op[700, y]
            continue
        if y <= 953:
            if x <= 672 and 924 <= y <= 948:
                px[x, y] = H('6b4b5f') if (x >= 670 or y <= 927 or y >= 945) else H('d8ac74')
            elif x >= 673 or y < 924 or y > 948:
                px[x, y] = H('fbe6c2')
            continue
        if y == 954:
            px[x, y] = H('f8d596'); continue
        if y <= 1042:
            c = H('f7cf86')
            if 1015 <= y <= 1019 and x <= 690:
                c = H('8a6355') if x == 690 else H('6f4849')
            elif 1020 <= y <= 1042 and 683 <= x <= 688:
                c = H('c0986d') if x == 683 else H('e9c17f') if x == 688 else H('6f4849')
            px[x, y] = c
            continue
        if y <= 1048:
            px[x, y] = H('ebd7c5'); continue
        if y == 1049:
            px[x, y] = H('eedfcf'); continue
        px[x, y] = H('efe2d2')
crop = im.crop((440, 790, 900, 1120))
crop.save(out, optimize=True)
print(crop.size)
