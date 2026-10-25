import math
exec(open('lob.py').read().split("a=(452")[0])
def run2(a,b,rise,fall,dc1,dc2,bit,dur=0.5):
    c1=(a[0]+dc1,a[1]-rise); c2=(b[0]+dc2,b[1]-fall)
    pts=[bez(a,c1,c2,b,i/400) for i in range(401)]
    L=sum(math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]) for i in range(400))
    obs={'bit':bit,'plate':(518,1072,662,1216),'bracket':(533,1035,625,1056)}
    res={k:min(boxdist(p,v) for p in pts) for k,v in obs.items()}
    print(f"a {a} rise {rise} fall {fall} dc {dc1},{dc2} L {L:.0f} px/f {L/(dur*30):.1f} apex {min(p[1] for p in pts):.0f}", {k:round(v) for k,v in res.items()})
b=(900,1115.4)
bit=(493,1068,520,1100)
for hx in (427,422):
  for rise,fall,dc1,dc2 in [(380,220,-10,-51),(400,220,-20,-51),(420,240,-25,-60),(380,240,-30,-80)]:
    run2((hx,1228),b,rise,fall,dc1,dc2,bit)
