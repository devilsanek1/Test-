import subprocess, sys, os
D='/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/scenes/S05'
F=D+'/qa_rev/frames'
def strip(frames,out,crop,cols=8,src=F,off=16.59):
    args=[]
    for f in frames:
        t=f/30
        c=f'{src}/f{f:05d}.png'
        o=f'{D}/tmpc_{f}.png'
        subprocess.run(['convert',c,'-crop',crop,'+repage',o],check=True)
        args+=['-label',f'f{f} {t:.3f} / {off+t:.3f}',o]
    subprocess.run(['montage','-background','#2b2b2b','-fill','#f0f0f0','-pointsize','12']+args+['-tile',f'{cols}x','-geometry','+2+2',D+'/'+out],check=True)
    for f in frames: os.remove(f'{D}/tmpc_{f}.png')
if __name__=='__main__':
    a,b=map(int,sys.argv[1].split('-'))
    strip(range(a,b+1),sys.argv[2],sys.argv[3],cols=int(sys.argv[4]) if len(sys.argv)>4 else 8)
