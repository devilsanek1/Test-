import re,subprocess,sys,os
BASE='ee81c55'
files=subprocess.check_output(['git','ls-tree','--name-only','-r',BASE,'--','src/scenes/shared']).decode().split()
def types(src):
    out={}
    for m in re.finditer(r'export type (\w+)\s*=\s*(?:[^{;]*&\s*)?\{',src):
        i=m.end(); depth=1; j=i
        while depth and j<len(src):
            if src[j]=='{': depth+=1
            elif src[j]=='}': depth-=1
            j+=1
        body=src[i:j-1]
        # top-level fields only
        d=0; fields=set(); line=''
        for k,ch in enumerate(body):
            if ch in '{([': d+=1
            elif ch in '})]': d-=1
            if d==0:
                pass
        for fm in re.finditer(r'^\s*(\w+)\??\s*:',body,re.M):
            fields.add(fm.group(1))
        out[m.group(1)]=fields
    return out
for f in files:
    if not f.endswith(('.ts','.tsx')): continue
    old=subprocess.run(['git','show',f'{BASE}:./{f}'],capture_output=True).stdout.decode()
    if not os.path.exists(f): print('missing',f); continue
    new=open(f).read()
    to,tn=types(old),types(new)
    for k,v in to.items():
        if k not in tn: print(f,'type gone',k); continue
        gone=v-tn[k]
        if gone: print(f,k,'fields gone:',sorted(gone))
