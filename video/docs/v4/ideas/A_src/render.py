"""render one frame's SVG to PNG through the project's still renderer (video/scripts/type/render.mjs).
Full-size renders go to OUT (env A_OUT, default a temp folder outside the repo); sheet.py builds the sheet from them."""
import os
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
OUT = os.environ.get('A_OUT', os.path.join(tempfile.gettempdir(), 'v4_ideas_A_frames'))  # full-size renders stay out of the repo

PAGE = """<!doctype html><html><head><meta charset="utf-8"><style>
html,body{{margin:0;padding:0;background:#000}} svg{{display:block}}
</style></head><body>{svg}</body></html>"""


def render(name, svg, phone=True):
    os.makedirs(OUT, exist_ok=True)
    page = os.path.join(OUT, f'{name}.html')
    with open(page, 'w') as fh:
        fh.write(PAGE.format(svg=svg))
    png = os.path.join(OUT, f'{name}.png')
    cmd = ['node', os.path.join(VIDEO, 'scripts', 'type', 'render.mjs'), page, png]
    if phone:
        cmd.append('--phone')
    res = subprocess.run(cmd, cwd=VIDEO, capture_output=True, text=True)
    if res.returncode != 0:
        print(res.stdout[-2000:], res.stderr[-2000:], file=sys.stderr)
        raise SystemExit(f'render failed: {name}')
    return png
