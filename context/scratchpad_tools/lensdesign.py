import math
s0,c0,rot0=8.064,(405.028,924.874),6.661
R=(295,1140); k=s0-1
F=((s0*R[0]-c0[0])/k,(s0*R[1]-c0[1])/k)
t0=659/30; t1=22.165
w,h=210,270; f=31.5
def state(q):
    s=s0*(1/s0)**q
    cx=F[0]+s*(R[0]-F[0]); cy=F[1]+s*(R[1]-F[1])
    th=math.radians(rot0+(-2-rot0)*q)
    def P(px,py): return (cx+s*(px*math.cos(th)-py*math.sin(th)), cy+s*(px*math.sin(th)+py*math.cos(th)))
    return s,P
def edge_info(q):
    s,P=state(q)
    # top edge (-105,-135)->(73.5,-135) then ear to (105,-103.5)
    pts=[P(-105+i*(178.5/200),-135) for i in range(201)]+[P(73.5+i*31.5/50,-135+i*31.5/50) for i in range(51)]
    band=[p for p in pts if 150<=p[0]<=900]
    ys=[p[1] for p in band]
    # heading bar
    hb=[P(-w*0.36,-h*0.33),P(-w*0.02,-h*0.33)]
    return s,(min(ys) if ys else None,max(ys) if ys else None),hb
def run(m,p):
    q=lambda u: 1-(1-max(0,min(1,u))**m)**p
    print('m',m,'p',p)
    prev=None
    for T in [21.985,22.0,22.0333,22.0667,22.1,22.1333]:
        u=(T-t0)/(t1-t0)
        s,(ylo,yhi),hb=edge_info(q(u))
        r='' if prev is None else f'{s/prev:.3f}'
        prev=s if T>=22.0 else None
        print(f'  T {T:.4f} u {u:.3f} q {q(u):.3f} s {s:.3f} ratio {r} topEdge y(150..900) {ylo:.0f}..{yhi:.0f}  headbar y {hb[0][1]:.0f}/{hb[1][1]:.0f}')
run(1,1.4)
for m,p in [(1.5,1.6),(1.6,1.6),(1.8,1.7),(1.4,1.5),(2,1.8)]:
    run(m,p)
