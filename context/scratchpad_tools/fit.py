import json,re,statistics as st, numpy as np, sys
SYL = {}
for tok in """10:1 14:2 22:3 45:3 7:2 a:1 about:2 ai:2 all:1 already:3 and:1 announced:2 answer:2 anymore:3 anyone:3 are:1
attempts:2 august:2 bad:1 basically:3 be:1 because:2 before:2 behind:2 big:1 break-in:2 bug:1 bunch:1 but:1 by:1 came:1 can:1
can't:1 chunk:1 cloudflare:2 comes:1 company:3 copies:2 could:1 countries:2 day:1 details:2 did:1 don't:1 down:1 else:1 enough:2
europe:2 evening:2 even:2 every:2 everyone:3 everything:3 everywhere:3 except:2 fast:1 fbi:3 figured:2 find:1 finding:2 first:1
fix:1 fixing:2 for:1 forty-five:3 found:1 four:1 fourteen:2 gave:1 got:1 government:3 governments:3 hacked:1 hackers:2 hacking:2
half:1 hard:1 has:1 heads-up:2 hit:1 hope:1 hosting:2 hours:2 how:1 if:1 in:1 install:2 is:1 it:1 it's:1 just:1 knew:1 knows:1
language:2 leaked:1 like:1 loves:1 make:1 many:2 million:2 millions:2 minutes:2 nobody:3 not:1 now:1 of:1 off:1 officially:4
old:1 on:1 once:1 one:1 online:2 or:1 out:1 over:2 own:1 part:1 password:2 people:2 php:3 plus:1 programming:3 protects:2
purpose:2 quietly:3 ready:2 researchers:3 right:1 run:1 runs:1 safest:2 said:1 saw:1 says:1 security:4 server:2 seven:2 shut:1
single:2 site:1 sites:1 slow:1 so:1 some:1 somebody:3 someone:2 something:2 sorts:1 step:1 steps:1 still:1 support's:2
supported:3 switch:1 switched:1 take:1 takes:1 teams:1 tech:1 ten:1 tens:1 that:1 that's:1 the:1 their:1 them:1 themselves:2
then:1 there:1 they:1 they're:1 thing:1 think:1 this:1 those:1 thousands:2 three:1 to:1 told:1 tools:1 trying:2 turn:1 two:1
until:2 update:2 use:1 using:2 version:2 versions:2 was:1 web:1 websites:2 were:1 what:1 where:1 which:1 who:1 with:1 within:2
without:2 word:1 wordpress:2 years:1 yet:1 you:1 you'd:1""".split():
    k,v=tok.rsplit(':',1); SYL[k]=int(v)
FUNC=set("a an the of in on to and but or so for it is was were are be by as at that this those these there their they them then than with if you your it's that's they're can could has have had how what which who where when some all just like not now once even own its from into until because before after while about".split())
ACR={'php':3,'ai':2,'fbi':3}
def n(w): return re.sub(r"[^a-z0-9'\-]","",w.lower().replace('’',"'"))
def punct(w):
    w=w.strip('"\'”“)')
    if w.endswith(('.','?','!')): return 'sentence'
    if w.endswith(','): return 'comma'
    if w.endswith(('…','...')): return 'ellipsis'
    return None
def feats(w):
    k=n(w); s=SYL[k]; f=1.0 if k in FUNC else 0.0; a=1.0 if k in ACR else 0.0
    p=punct(w); fin=1.0 if p else 0.0
    return [1.0, s, f, a, fin, fin*s, len(k)]
def slots(T):
    W=T['words']; X=[];y=[];sent=[]
    si=0
    for i,w in enumerate(W):
        p=punct(w['w']); nxt=W[i+1]['s'] if i+1<len(W) else None
        slot=(w['e']-w['s']) if (p or nxt is None) else nxt-w['s']
        X.append(feats(w['w'])); y.append(slot); sent.append(si)
        if p=='sentence': si+=1
    return np.array(X),np.array(y),np.array(sent)
for name in ['assets/timing.json','assets/timing_v1.json']:
    T=json.load(open(name))
    X,y,sent=slots(T)
    for cols,label in [([0,1],'syl'),([0,1,2],'syl+func'),([0,1,2,3],'+acr'),([0,1,2,3,4],'+final'),([0,1,2,3,4,5],'+final*syl'),([0,1,2,3,4,5,6],'+chars')]:
        # leave-one-sentence-out CV on sentence word-time sums
        errs=[];werr=[]
        for s in np.unique(sent):
            tr=sent!=s; te=sent==s
            b,*_=np.linalg.lstsq(X[tr][:,cols],y[tr],rcond=None)
            pr=X[te][:,cols]@b
            errs.append(pr.sum()-y[te].sum()); werr+=list(pr-y[te])
        b,*_=np.linalg.lstsq(X[:,cols],y,rcond=None)
        print(name,label,'coef',np.round(b,3),'sent-sum err mean %.3f rms %.3f'%(np.mean(errs),np.sqrt(np.mean(np.square(errs)))),'word rms %.3f'%np.sqrt(np.mean(np.square(werr))))
    # by-syllable medians
    for s in range(1,5):
        m=[y[i] for i in range(len(y)) if X[i,1]==s and X[i,4]==0 and X[i,2]==0]
        mf=[y[i] for i in range(len(y)) if X[i,1]==s and X[i,4]==0 and X[i,2]==1]
        mfin=[y[i] for i in range(len(y)) if X[i,1]==s and X[i,4]==1]
        print(' syl',s,'content n%d med %.3f'%(len(m),st.median(m)) if m else '', 'func n%d med %.3f'%(len(mf),st.median(mf)) if mf else '', 'final n%d med %.3f'%(len(mfin),st.median(mfin)) if mfin else '')

print('---- model C (bucket means + word-specific shrinkage), LOSO CV on v2')
T=json.load(open('assets/timing.json')); W=T['words']
X,y,sent=slots(T)
keys=[n(w['w']) for w in W]
pun=[punct(w['w']) for w in W]
def fitC(idx):
    b,*_=np.linalg.lstsq(X[idx][:,[0,1,2]],y[idx],rcond=None)
    reg=lambda i: X[i,[0,1,2]]@b
    # final deltas
    dc=[y[i]-reg(i) for i in idx if pun[i]=='comma']; ds=[y[i]-reg(i) for i in idx if pun[i]=='sentence']
    dC=np.mean(dc) if dc else 0; dS=np.mean(ds) if ds else 0
    def base(i): return reg(i)+(dC if pun[i]=='comma' else dS if pun[i] in('sentence',) else 0)
    # bucket residual means
    buck={}
    for i in idx:
        bk=(int(X[i,1]>=4 and 4 or X[i,1]), int(X[i,2]))
        buck.setdefault(bk,[]).append(y[i]-base(i))
    wres={}
    for i in idx: wres.setdefault(keys[i],[]).append(y[i]-base(i))
    K=5
    def pred(i, useword=True):
        bk=(int(X[i,1]>=4 and 4 or X[i,1]), int(X[i,2]))
        r=buck.get(bk,[]); br=sum(r)/(len(r)+K) if r else 0
        p=base(i)+br
        if useword and keys[i] in wres:
            wr=wres[keys[i]]; p=base(i)+ (sum(wr)+K*br)/(len(wr)+K)
        return p
    return pred
for useword in (False,True):
    errs=[];werr=[]
    for s in np.unique(sent):
        tr=[i for i in range(len(y)) if sent[i]!=s]; te=[i for i in range(len(y)) if sent[i]==s]
        pred=fitC(tr)
        pr=np.array([pred(i,useword) for i in te])
        errs.append(pr.sum()-y[te].sum()); werr+=list(pr-y[te])
    print('useword',useword,'sent-sum err mean %.3f rms %.3f'%(np.mean(errs),np.sqrt(np.mean(np.square(errs)))),'word rms %.3f'%np.sqrt(np.mean(np.square(werr))))
