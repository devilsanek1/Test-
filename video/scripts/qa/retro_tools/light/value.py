import sys, numpy as np, cv2, json
def labimg(p):
    im=cv2.imread(p).astype(np.float32)/255
    return cv2.cvtColor(im,cv2.COLOR_BGR2Lab)
for p in sys.argv[1:]:
    L=labimg(p); l=L[...,0]; h,w=l.shape
    C=np.hypot(L[...,1],L[...,2])
    q=np.percentile(l,[5,25,50,75,95])
    top=l>=np.percentile(l,95); ys,xs=np.nonzero(top)
    # thirds
    rows=[round(float(l[int(h*a):int(h*b)].mean()),1) for a,b in [(0,.33),(.33,.66),(.66,1)]]
    cols=[round(float(l[:,int(w*a):int(w*b)].mean()),1) for a,b in [(0,.33),(.33,.66),(.66,1)]]
    print(p.split('/')[-1][:22].ljust(22),'Lpct',[int(v) for v in q],'L>=88 %.0f%%'%(100*(l>=88).mean()),'L<30 %.0f%%'%(100*(l<30).mean()),
      'top5%% centroid (%.2f,%.2f)'%(xs.mean()/w,ys.mean()/h),'rows',rows,'cols',cols)
