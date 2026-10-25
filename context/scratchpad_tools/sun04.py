import math
from cam04 import cam, ts
T=0.225; T0=-0.225; AIR=0.45; R=110
STRETCH=(0.97,1.06); SQ=(1.085,0.88); LAND=0.07; REC=0.13
def oc(x): return 1-(1-x)**3
def lsq(a,b,p): return (a[0]+(b[0]-a[0])*p, a[1]+(b[1]-a[1])*p)
def land(dt):
    if dt<0 or dt>LAND+REC: return (1,1)
    if dt<LAND: return lsq((1,1),SQ,oc(dt/LAND))
    return lsq(SQ,(1,1),oc((dt-LAND)/REC))
def hop(t):
    u=(t-T0)/AIR
    if u>=1: return (930,690), land(t-(T0+AIR))
    x=690+240*u; y=700-10*u-60*u*(1-u)
    st=lsq(STRETCH,(1,1),u/0.35) if u<0.35 else (lsq((1,1),STRETCH,(u-0.8)/0.2) if u>0.8 else (1,1))
    return (x,y),st
def ios(p): return 0.5*(1-math.cos(math.pi*min(1,max(0,p))))
def offset(t,C,W,D=0.26,dl=0.034,sink=7):
    dx,dy=C[0]-930,C[1]-690
    if t<=0: return (0,0)
    if t<=T:
        u=t/T; h01=3*u*u-2*u**3; h11=u**3-u*u
        return (dx*h01+T*W[0]*h11, dy*h01+T*W[1]*h11)
    e=ios((t-T-dl)/D)
    return (dx*(1-e), dy*(1-e)+sink*e)
def pose(t,C,W,**k):
    (x,y),sq=hop(t); o=offset(t,C,W,**k)
    x+=o[0]; y+=o[1]
    cy=(y+R)-R*sq[1]
    return x,cy,R*sq[0],R*sq[1]
def clear(t,p):
    c=cam(t); a=ts(c,(520,660)); b=ts(c,(720,1060))
    ux,uy=b[0]-a[0],b[1]-a[1]; l=math.hypot(ux,uy); ux/=l; uy/=l
    nx,ny=uy,-ux  # sky side
    x,y,rx,ry=p
    d=(x-a[0])*nx+(y-a[1])*ny
    sup=math.hypot(rx*nx,ry*ny)
    return d-sup
