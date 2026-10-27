import sys, cv2, numpy as np
# usage: sheet.py out.jpg h img[:x0,y0,x1,y1][@label] ...
out=sys.argv[1]; H=int(sys.argv[2]); tiles=[]
for spec in sys.argv[3:]:
    lab=None
    if '@' in spec: spec,lab=spec.split('@',1)
    crop=None
    if ':' in spec: spec,c=spec.split(':'); crop=[int(v) for v in c.split(',')]
    im=cv2.imread(spec)
    if crop: im=im[crop[1]:crop[3],crop[0]:crop[2]]
    s=H/im.shape[0]; im=cv2.resize(im,(int(im.shape[1]*s),H),interpolation=cv2.INTER_AREA)
    if lab: cv2.putText(im,lab,(8,H-12),cv2.FONT_HERSHEY_SIMPLEX,0.8,(0,0,0),4); cv2.putText(im,lab,(8,H-12),cv2.FONT_HERSHEY_SIMPLEX,0.8,(255,255,255),2)
    tiles.append(im); tiles.append(np.full((H,6,3),30,np.uint8))
cv2.imwrite(out,np.hstack(tiles[:-1]),[cv2.IMWRITE_JPEG_QUALITY,88])
