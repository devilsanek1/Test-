import cv2, numpy as np, sys, json
# usage: cutsheet.py video out.jpg "label:t,label:t,..." [offsets]
path, out, spec = sys.argv[1], sys.argv[2], sys.argv[3]
offs = [float(x) for x in (sys.argv[4] if len(sys.argv)>4 else "-0.5,-0.017,0.017,0.5").split(',')]
cap = cv2.VideoCapture(path); fps = cap.get(cv2.CAP_PROP_FPS); n=int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
TW=170
rows=[]
for item in spec.split(','):
    lab, t = item.split(':'); t=float(t)
    cells=[]
    for o in offs:
        fi = int(round((t+o)*fps)) if o>=0 else int(round(t*fps))+int(np.floor(o*fps))
        fi = fi % n if fi>=n else max(0,fi)
        cap.set(cv2.CAP_PROP_POS_FRAMES, fi); ok, f = cap.read()
        h = int(TW*f.shape[0]/f.shape[1]); f = cv2.resize(f,(TW,h),interpolation=cv2.INTER_AREA)
        cv2.putText(f, f"{fi/fps:.2f}", (3,12), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0,0,255),1)
        cells.append(f)
    row = np.hstack([np.full((h,4,3),255,np.uint8)] + sum([[c, np.full((h,4,3),255,np.uint8)] for c in cells],[]))
    # separator between before and after
    mid = 4 + (TW+4)*(len(offs)//2) - 4
    row[:, mid:mid+4] = (0,0,255)
    lbl = np.full((h,70,3),255,np.uint8); 
    for k,line in enumerate(lab.split('|')):
        cv2.putText(lbl, line, (3,20+18*k), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0,0,0),1)
    rows.append(np.hstack([lbl,row])); rows.append(np.full((4,rows[-1].shape[1],3),255,np.uint8))
cv2.imwrite(out, np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 85])
print(out, np.vstack(rows).shape)
