import cv2, numpy as np, sys, json
S='/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/retro/story/'
V='/home/user/Test-/video/'
cfg = {
 'board': (V+'deliverables/v3/v3_g3_animatic_board.mp4', [5.8,9.48,11.48,16.6,18.28,19.4,22.68,25.24,29.4,31.32,33.4,36.36,38.84], ('top',0.30)),


}
def load(path):
    cap=cv2.VideoCapture(path); fps=cap.get(cv2.CAP_PROP_FPS); fr=[]
    while True:
        ok,f=cap.read()
        if not ok: break
        fr.append(cv2.resize(f,(108, int(108*f.shape[0]/f.shape[1])),interpolation=cv2.INTER_AREA))
    return fps, fr
out={}
for name,(path,cuts,(side,lim)) in cfg.items():
    fps, fr = load(path); H,W = fr[0].shape[:2]
    mask=np.ones((H,W),bool)
    if side=='top': mask[:int(lim*H)]=False
    else: mask[int(lim*H):]=False
    lab=[cv2.cvtColor(f,cv2.COLOR_BGR2LAB).astype(np.float32) for f in fr]
    def energy(a,b):
        e=np.zeros((H,W),np.float32)
        for i in range(a,b):
            d=np.abs(lab[i+1]-lab[i]).mean(2); e+= (d>6)*d
        return e*mask
    def centroid(e):
        s=e.sum()
        if s<1e-6: return None
        ys,xs=np.mgrid[0:H,0:W]; return ((xs*e).sum()/s/W, (ys*e).sum()/s/H)
    def movers(e):
        b=(e>0).astype(np.uint8); b=cv2.dilate(b,np.ones((3,3),np.uint8))
        n,l,st,_=cv2.connectedComponentsWithStats(b); return int(((st[1:,4])>=4).sum())
    rows=[]
    for t in cuts:
        c=int(round(t*fps)); w=int(round(0.4*fps)); g=max(1,int(round(0.05*fps)))
        epre=energy(c-w, c-g); epost=energy(c+g, c+w)
        cp,cq=centroid(epre),centroid(epost)
        dist = None if (cp is None or cq is None) else float(np.hypot(cp[0]-cq[0],(cp[1]-cq[1])*H/W)/np.hypot(1,H/W))
        # still-image carry: fraction of pixels (outside captions) nearly unchanged between c-g and c+g
        a,b=lab[c-g],lab[c+g]; d=np.abs(a-b).mean(2)
        keep=float(((d<8)&mask).sum()/mask.sum())
        # global colour shift (mean L,a,b) before/after over 0.4 s
        mpre=np.mean([lab[i][mask].mean(0) for i in range(c-w,c-g)],0); mpost=np.mean([lab[i][mask].mean(0) for i in range(c+g,c+w)],0)
        dE=float(np.linalg.norm(mpre-mpost))
        rows.append(dict(t=t, eye_jump=None if dist is None else round(dist,2), carry_px=round(keep,2), dE_mean=round(dE,1), movers_pre=movers(epre), movers_post=movers(epost), Lpre=round(float(mpre[0]),0), Lpost=round(float(mpost[0]),0)))
    out[name]=rows
    print(name)
    for r in rows: print('  ',r)
json.dump(out,open(S+'carry_board.json','w'),indent=1)
