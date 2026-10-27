import numpy as np, cv2, sys
def h2r(h): h=h.lstrip('#'); return np.array([int(h[i:i+2],16) for i in (0,2,4)])/255.
def lin(c): return np.where(c<=0.04045,c/12.92,((c+0.055)/1.055)**2.4)
def lab(rgb):
    v=cv2.cvtColor(np.float32([[rgb[::-1]]]),cv2.COLOR_BGR2Lab)[0,0]; return v[0],np.hypot(v[1],v[2]),(np.degrees(np.arctan2(v[2],v[1]))+360)%360
def hexs(rgb): return '#%02X%02X%02X'%tuple(int(round(x*255)) for x in np.clip(rgb,0,1))
surf={'wall':'#F6E3D4','desk':'#DA9670','sleeve':'#A8492F','skin':'#D9926B','hero':'#D9542F','snow':'#E6EBF7','road':'#B9C3DE','brick':'#9A4A2E','sky':'#5B6A94','jeans':'#46527C'}
def show(mode,col,keys):
    c=h2r(col); print(f'{mode} {col}:')
    for k in keys:
        s=h2r(surf[k]); r= s*c if mode=='multiply' else 1-(1-s)*(1-c)
        L0,C0,H0=lab(s); L1,C1,H1=lab(r); dh=(H1-H0+180)%360-180
        print(f'   {k:7s} {surf[k]} L{L0:.0f} -> {hexs(r)} L{L1:.0f} (dL {L1-L0:+.0f}) C x{C1/max(C0,1):.2f} dh {dh:+.0f}')
for m in sys.argv[1:]:
    mode,col,keys=m.split(':'); show(mode,col,keys.split(','))
