import sys, numpy as np
from PIL import Image
from scipy import ndimage
ink=np.array([0x30,0x20,0x13])
st=np.ones((3,3),bool)
for path in sys.argv[1:]:
    rgba=np.asarray(Image.open(path).convert('RGBA')).astype(int); a=rgba[...,3]
    opaque=a==255; clear=a==0; partial=(a>0)&(a<255)
    # un-premultiplied colour of partial pixels: is it ink (AA of a thin line) or a body/fill colour?
    near_ink=np.abs(rgba[...,:3]-ink).sum(2)<90
    core=ndimage.binary_erosion(partial,st,iterations=1)
    nearO=ndimage.binary_dilation(opaque,st,iterations=2); nearC=ndimage.binary_dilation(clear,st,iterations=2)
    offedge=partial & ~(nearO & nearC)
    print(path.split('/')[-1], '| partial px', partial.sum(), '| translucent cores (3x3 all partial):', core.sum(),
          '| off-edge partial:', offedge.sum(), 'of which ink-coloured:', (offedge & near_ink).sum(), '| non-ink off-edge:', (offedge & ~near_ink).sum())
