import math,sys
def bez(a,c1,c2,b,u):
    v=1-u
    return (v**3*a[0]+3*u*v*v*c1[0]+3*u*u*v*c2[0]+u**3*b[0], v**3*a[1]+3*u*v*v*c1[1]+3*u*u*v*c2[1]+u**3*b[1])
def boxdist(p,bx):
    x0,y0,x1,y1=bx
    dx=max(x0-p[0],0,p[0]-x1); dy=max(y0-p[1],0,p[1]-y1)
    return math.hypot(dx,dy)
def run(a,b,rise,fall,dc1=-10,dc2=-51,dur=0.5):
    c1=(a[0]+dc1,a[1]-rise); c2=(b[0]+dc2,b[1]-fall)
    pts=[bez(a,c1,c2,b,i/400) for i in range(401)]
    L=sum(math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]) for i in range(400))
    obs={'bit':(485,1068,512,1100),'plate':(518,1072,662,1216),'bracket':(533,1035,625,1056),'window':(420,920,610,1040)}
    res={k:min(boxdist(p,v) for p in pts) for k,v in obs.items()}
    apex=min(p[1] for p in pts)
    print(f"rise {rise} fall {fall} L {L:.0f} px/f {L/(dur*30):.1f} apex {apex:.0f}", {k:round(v) for k,v in res.items()})
a=(452,1230.5); b=(900,1115.4)
for rise,fall in [(307,190),(360,190),(400,220),(420,240),(380,260)]:
    run(a,b,rise,fall)
for dur in (0.5,0.55):
    run(a,b,400,220,dur=dur)
print('--- hand at 432')
a=(432,1228)
for rise,fall,dc1,dc2 in [(360,200,-10,-51),(380,220,-10,-51),(400,220,0,-51),(380,200,10,-60),(360,240,10,-80),(400,240,20,-80)]:
    run(a,b,rise,fall,dc1,dc2)
