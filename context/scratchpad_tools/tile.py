import sys, glob
from PIL import Image, ImageDraw
# tile.py out.png crop(x0,y0,x1,y1 in source px) cols scale files...
out=sys.argv[1]; crop=tuple(int(v) for v in sys.argv[2].split(',')); cols=int(sys.argv[3]); sc=float(sys.argv[4]); fs=sys.argv[5:]
ims=[Image.open(f).convert('RGB').crop(crop) for f in fs]
ims=[im.resize((int(im.width*sc),int(im.height*sc)),Image.LANCZOS) for im in ims]
w,h=ims[0].size; rows=(len(ims)+cols-1)//cols
o=Image.new('RGB',(w*cols,h*rows),'white'); d=ImageDraw.Draw(o)
for i,(f,im) in enumerate(zip(fs,ims)):
    x,y=(i%cols)*w,(i//cols)*h; o.paste(im,(x,y)); d.text((x+4,y+4),f.split('/')[-1].replace('.png',''),fill='red')
o.save(out); print(o.size)
