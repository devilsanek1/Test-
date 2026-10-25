import numpy as np
from PIL import Image
S=45.618
cache={}
def L(f):
    if f not in cache: cache[f]=np.asarray(Image.open(f'qa/frames/f{f:05d}.png').convert('RGB')).astype(int)
    return cache[f]
def diff(f,box):
    x0,y0,x1,y1=[v//2 for v in box]
    a=L(f-1)[y0:y1,x0:x1]; b=L(f)[y0:y1,x0:x1]
    return int((np.abs(a-b).max(axis=2)>60).sum())
beats=[
 ('pipLand Even',45.85,(330,1340,500,1500)),
 ('ringHiccup the',46.035,(650,1185,720,1245)),
 ('pigeon shuffle the',46.035,(690,1040,800,1110)),
 ('barFlicker FBI',46.195,(440,1195,560,1240)),
 ('earFlick FBI+.25',46.445,(330,1330,500,1480)),
 ('notice said',46.735,(380,1290,700,1430)),
 ('lookNotice if',47.095,(330,1330,500,1480)),
 ('snailShell you',47.235,(690,1400,780,1470)),
 ('barStep cant',47.315,(380,1190,720,1300)),
 ('snailCrawl update',47.575,(680,1400,780,1470)),
 ('barBack yet',47.995,(380,1190,720,1300)),
 ('glanceSun yetEnd+.05',48.195,(330,1330,500,1480)),
 ('glyph just-.1',48.265,(800,630,940,770)),
 ('press turn',48.69,(740,570,1000,830)),
 ('shutter it',48.905,(380,1180,720,1300)),
 ('lightsOut off',49.065,(250,800,380,1000)),
 ('padlock off+.14',49.205,(500,1410,580,1480)),
 ('bitHop offEnd+.05',49.45,(560,1380,700,1470)),
 ('pigeonLand which',49.63,(380,1100,500,1200)),
 ('tagTwirl is',49.735,(560,1450,660,1560)),
 ('antennae basically',49.99,(690,1400,790,1470)),
 ('noteSlap tech-.05',50.185,(540,1260,740,1420)),
 ('noteCurl supports',50.55,(540,1260,740,1420)),
 ('preen supports+.25',50.80,(690,1040,800,1110)),
 ('shrug answer',51.035,(330,1330,500,1480)),
 ('glint to',51.345,(500,1410,580,1480)),
 ('boxPigeonHop to',51.345,(380,1100,500,1200)),
 ('bitTap toEnd-.05',51.655,(500,1380,600,1450)),
 ('strike everything+.05',51.755,(540,1300,740,1420)),
 ('pipOut everythingEnd+.05',51.945,(330,1300,560,1600)),
 ('tagSway cut-.1',52.063,(560,1450,680,1580)),
]
for name,T,box in beats:
    ft=(T-S)*30
    lo=max(1,int(ft)-6); hi=min(196,int(ft)+10)
    ds=[(f,diff(f,box)) for f in range(lo,hi+1)]
    base=sorted(d for f,d in ds if f< ft-1)[:3]
    on=None
    for f,d in ds:
        if f>=ft-6 and d>=max(15,3*(max(base) if base else 0)):
            on=f;break
    off=(on/30+S-T)*1000 if on else None
    print(f"{name:26s} T={T:.3f} f*={ft:6.1f} onset f{on} dt={'%+.0f ms'%off if off is not None else 'none'}  diffs={[d for f,d in ds]}")
