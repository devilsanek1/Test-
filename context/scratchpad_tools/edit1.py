p='src/scenes/scene03/plan.tsx'
s=open(p).read()
a=s.index('/** A lit page in a side screen:')
b=s.index('// ---------------------------------------------------------------- flower boxes')
new=open('/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/new_page.txt').read()
s=s[:a]+new+s[b:]
a=s.index('/** Per side house: its screen state + page')
b=s.index('// ---------------------------------------------------------------- count signs')
new=open('/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/new_overlays.txt').read()
s=s[:a]+new+s[b:]
a=s.index('// ---------------------------------------------------------------- count signs')
b=s.index("/** The press house's screen")
s=s[:a]+s[b:]
open(p,'w').write(s)
