import sys
from fontTools.ttLib import TTFont
f = TTFont('/home/user/Test-/video/public/fonts/CaptionHand.woff2')
cmap = f.getBestCmap(); hmtx = f['hmtx']; upm = f['head'].unitsPerEm
def w(s):
    return sum(hmtx[cmap.get(ord(c), cmap.get(ord('?')))][0] for c in s)/upm
for s in sys.argv[1:]:
    print(f"{w(s):.3f} em  {s!r}")
os2=f['OS/2']; print('asc',f['hhea'].ascent/upm,'desc',f['hhea'].descent/upm,'cap',getattr(os2,'sCapHeight',0)/upm,'xh',getattr(os2,'sxHeight',0)/upm)
