import json,sys,re
T=json.load(open('/home/user/Test-/video/assets/timing.json'))
W=T['words']
def norm(s): return re.sub(r"[^a-z0-9']","",s.lower())
for n in sys.argv[1:]:
    d=json.load(open(f'/home/user/Test-/video/docs/storyboard_drafts/{n}.json'))
    print('=====',n)
    wi=0
    allwords=[]
    for sc in d['scenes']:
        print(f"-- {sc['id']} {sc['start']:.2f}-{sc['end']:.2f} ({sc['end']-sc['start']:.2f}s) {sc['title']} | in={sc['transitionIn'].get('type')}")
        for c in sc['captions']:
            dur=c['e']-c['s']
            lines=c['lines']
            txt=' / '.join(l['text'] for l in lines)
            nchar=sum(len(l['text']) for l in lines)
            flags=[]
            for l in lines:
                toks=l['text'].split()
                # find word start for first token
                first=norm(toks[0])
                # locate in W from wi
                j=wi
                while j<len(W) and norm(W[j]['w'])!=first: j+=1
                if j<len(W):
                    ds=l['s']-W[j]['s']
                    if abs(ds)>0.06: flags.append(f"L'{toks[0]}' s={l['s']:.2f} vs word {W[j]['s']:.2f} ({ds:+.2f})")
                    wi=j+len(toks)
                if len(l['text'])>24: flags.append(f'LEN{len(l["text"])}')
            hl=c.get('highlights',[])
            hs=' '.join(f"[{h['text']}@{h['s']:.2f}]" for h in hl)
            if len(hl)>1: flags.append('MULTI-HL')
            cps = nchar/dur if dur>0 else 0
            print(f"   {c['s']:6.2f}-{c['e']:6.2f} ({dur:4.2f}s, {cps:4.1f}cps) {txt:52s} {hs} {' '.join(flags)}")
