import json, sys, numpy as np
S='/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/retro/story/'
for name in ['v3','ref','v1']:
    d=json.load(open(S+name+'_diff.json')); fps=d['fps']; a=np.array(d['d'])
    t, m, frac = a[:,0], a[:,1], a[:,2]
    dur=t[-1]
    # hard jump: single-frame change fraction > 0.5
    jumps=[(round(t[i],3), round(frac[i],2)) for i in range(len(t)) if frac[i]>0.45 and (i==0 or frac[i]>frac[i-1]) and (i==len(t)-1 or frac[i]>=frac[i+1])]
    big=[j for j in jumps]
    print(name, 'dur',round(dur,2),'fps',fps,'single-frame >45% changes:',len(big), 'per min', round(len(big)/dur*60,1))
    print('  ', big)
    # also distribution of fraction of pixels changed per second (activity)
    print('  mean frac changed/frame', round(frac.mean(),4), 'median', round(np.median(frac),4), 'frames with >2% changed:', round((frac>0.02).mean(),3))
