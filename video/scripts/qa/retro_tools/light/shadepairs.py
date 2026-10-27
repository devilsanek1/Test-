# proxy: area of flat regions that sit next to a lighter region of the same hue family (dL 8-45, dh<40 or both C<8, C ratio .4-1.4, L>24)
import sys, numpy as np, cv2
def run(p,k=18):
    im=cv2.imread(p); h,w=im.shape[:2]; s=360/w; im=cv2.resize(im,(360,int(h*s)),interpolation=cv2.INTER_AREA)
    lab=cv2.cvtColor(im.astype(np.float32)/255,cv2.COLOR_BGR2Lab); X=lab.reshape(-1,3)
    crit=(cv2.TERM_CRITERIA_EPS+cv2.TERM_CRITERIA_MAX_ITER,30,0.5)
    _,lb,c=cv2.kmeans(X,k,None,crit,3,cv2.KMEANS_PP_CENTERS); lb=lb.reshape(lab.shape[:2])
    lb=cv2.medianBlur(lb.astype(np.uint8),3)
    area=np.bincount(lb.ravel(),minlength=k)/lb.size
    adj=np.zeros((k,k))
    for a,b in [(lb[:,1:],lb[:,:-1]),(lb[1:],lb[:-1])]:
        m=a!=b; np.add.at(adj,(a[m],b[m]),1); np.add.at(adj,(b[m],a[m]),1)
    L=c[:,0]; C=np.hypot(c[:,1],c[:,2]); H=np.degrees(np.arctan2(c[:,2],c[:,1]))
    shade=set(); dLs=[]; dhs=[]; cr=[]
    for i in range(k):      # i = lit
        for j in range(k):  # j = shade candidate
            if i==j or adj[i,j]< 0.15*np.sqrt(area[j]*lb.size)*2: continue
            dL=L[i]-L[j]
            if not(8<=dL<=45) or L[j]<24: continue
            dh=abs((H[i]-H[j]+180)%360-180)
            if not((C[i]>8 and C[j]>6 and dh<40) or (C[i]<8 and C[j]<8)): continue
            if C[i]>8 and not(0.4<=C[j]/C[i]<=1.4): continue
            if area[i]<area[j]*0.8: continue
            shade.add(j); dLs.append(dL); dhs.append((H[j]-H[i]+180)%360-180); cr.append(C[j]/max(C[i],1))
    sa=sum(area[j] for j in shade)
    return sa, (np.median(dLs) if dLs else 0), (np.median(cr) if cr else 0)
for p in sys.argv[1:]:
    r=[run(p) for _ in range(2)]
    print(p.split('/')[-1][:20].ljust(20),'shade-step area %.0f-%.0f%%'%(100*min(x[0] for x in r),100*max(x[0] for x in r)),' median dL %.0f  C ratio %.2f'%(r[0][1],r[0][2]))
