import sys, numpy as np, cv2
p=sys.argv[1]; x0,y0,x1,y1=[int(v) for v in sys.argv[2].split(',')]; n=int(sys.argv[3]) if len(sys.argv)>3 else 12
im=cv2.imread(p)[y0:y1,x0:x1]
q=(im//6)*6+3
flat=q.reshape(-1,3); cols,cnt=np.unique(flat,axis=0,return_counts=True)
o=np.argsort(-cnt)[:n]; tot=cnt.sum()
for i in o:
    b,g,r=cols[i]; lab=cv2.cvtColor(np.uint8([[[b,g,r]]]).astype(np.float32)/255,cv2.COLOR_BGR2Lab)[0,0]
    ys,xs=np.nonzero((q==cols[i]).all(-1))
    print('#%02X%02X%02X %4.1f%%  L%3.0f C%3.0f h%3.0f  centre(%d,%d)'%(r,g,b,100*cnt[i]/tot,lab[0],np.hypot(lab[1],lab[2]),(np.degrees(np.arctan2(lab[2],lab[1]))+360)%360, x0+xs.mean(), y0+ys.mean()))
