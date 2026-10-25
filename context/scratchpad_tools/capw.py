import sys, json
from fontTools.ttLib import TTFont
f = TTFont('/home/user/Test-/video/node_modules/@fontsource/patrick-hand/files/patrick-hand-latin-400-normal.woff')
cmap = f.getBestCmap(); hmtx = f['hmtx']; upm = f['head'].unitsPerEm
kern = None
def width(s, size=98):
    w = 0
    for ch in s:
        g = cmap.get(ord(ch))
        w += hmtx[g][0] if g else upm*0.5
    return w * size / upm
if __name__ == '__main__':
    sb = json.load(open(sys.argv[1]))
    for sc in sb['scenes']:
        for c in sc['captions']:
            for l in c['lines']:
                w = width(l['text'])
                flag = ' <<< WIDE' if w > 850 else ''
                if w > 800 or flag: print(f"{sc['id']} {w:6.0f} {len(l['text']):2d} '{l['text']}'{flag}")
