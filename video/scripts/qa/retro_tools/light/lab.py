import sys, numpy as np, cv2
def lab(hexs):
    out=[]
    for h in hexs:
        h=h.lstrip('#'); bgr=np.uint8([[[int(h[4:6],16),int(h[2:4],16),int(h[0:2],16)]]])
        L,a,b=cv2.cvtColor(bgr.astype(np.float32)/255,cv2.COLOR_BGR2Lab)[0,0]
        C=(a*a+b*b)**.5; H=(np.degrees(np.arctan2(b,a))+360)%360
        out.append((h,round(float(L),1),round(float(C),1),round(float(H))))
    return out
if __name__=='__main__':
    names=sys.argv[1::2]; hx=sys.argv[2::2]
    for n,(h,L,C,H) in zip(names,lab(hx)): print(f'{n:10s} #{h} L{L} C{C} h{H}')
