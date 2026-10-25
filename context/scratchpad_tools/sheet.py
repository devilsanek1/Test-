import sys, glob, os
from PIL import Image, ImageDraw
d=sys.argv[1]; out=sys.argv[2]; cols=int(sys.argv[3]) if len(sys.argv)>3 else 6; tw=int(sys.argv[4]) if len(sys.argv)>4 else 270
files=sorted(glob.glob(os.path.join(d,'f*.png')))
ims=[Image.open(f) for f in files]
w,h=ims[0].size; th=int(h*tw/w)
rows=(len(ims)+cols-1)//cols
S=Image.new('RGB',(cols*tw,rows*(th+18)),'white')
dr=ImageDraw.Draw(S)
for i,(f,im) in enumerate(zip(files,ims)):
    r,c=divmod(i,cols)
    S.paste(im.resize((tw,th)),(c*tw,r*(th+18)+18))
    n=int(os.path.basename(f)[1:-4])
    dr.text((c*tw+4,r*(th+18)+3),f"f{n} {n/30:.3f}",fill='black')
S.save(out)
