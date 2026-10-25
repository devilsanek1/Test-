import math
END=2.42; DIVE=0.365; ACC=0.42; TRAVEL=0.85; M=1.5
K_REST=(330,900,1.5); K_LOCK=(360,1130,1.9)
def ios(p): return 0.5*(1-math.cos(math.pi*p))
def kc(): z=1.55; return (330, 640-(570-960)/z, z)
def ts(c,p): return ((p[0]-c[0])*c[2]+540,(p[1]-c[1])*c[2]+960)
def trap(x,acc=ACC):
    u=min(1,max(0,x)); v=1/(1-acc)
    if u<acc: return 0.5*v*u*u/acc
    if u<1-acc: return 0.5*v*acc+v*(u-acc)
    r=1-u; return 1-0.5*v*r*r/acc
def cam(t):
    d0=END-DIVE
    if t<d0:
        p=ios(min(1,max(0,t/d0)))
        z=math.exp((1-p)*math.log(1.5)+p*math.log(1.55))
        return (330, 640-(570-960)/z, z)
    u=min(1,(t-d0)/DIVE)
    pz=(3-M)*u*u+(M-2)*u**3
    z=math.exp((1-pz)*math.log(1.55)+pz*math.log(1.9))
    L=(330,1130)
    s0=ts(kc(),L); s1=ts(K_LOCK,L)
    q=trap(u/TRAVEL)
    sx=s0[0]+(s1[0]-s0[0])*q; sy=s0[1]+(s1[1]-s0[1])*q
    return (L[0]-(sx-540)/z, L[1]-(sy-960)/z, z)
