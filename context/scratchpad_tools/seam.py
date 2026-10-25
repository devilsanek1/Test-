import sys
import numpy as np
from PIL import Image
for f in sys.argv[1:]:
    a=np.asarray(Image.open(f).convert('RGB')).astype(int)
    sub=a[880:1500, 700:1060]
    l=sub[:, :-2]; c=sub[:,1:-1]; r=sub[:,2:]
    dl=np.abs(c-l).sum(2); dr=np.abs(c-r).sum(2); dlr=np.abs(l-r).sum(2)
    m=(dl>25)&(dr>25)&(dlr<12)
    cnt=m.sum(0)
    top=np.argsort(cnt)[::-1][:5]
    print(f, [(int(x+701), int(cnt[x])) for x in top])
