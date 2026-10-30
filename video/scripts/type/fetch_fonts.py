"""Download the type iteration's candidate fonts (Google Fonts, OFL/Apache) from jsdelivr's @fontsource packages.

    python3 scripts/type/fetch_fonts.py                 # every slug in fonts.json -> scripts/type/.fonts/<slug>/
    python3 scripts/type/fetch_fonts.py caveat jost     # only these slugs (added to nothing; fonts.json is the list)
    python3 scripts/type/fetch_fonts.py --list          # what is cached: family name, weights, files

Each slug gets its latin woff2 files (normal styles; italics when fonts.json's entry asks), its metadata.json and its
LICENSE, and .fonts/index.json maps the CSS family name to the files (render.mjs reads it). Cached files are skipped.
"""
import json
import os
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '.fonts')
CDN = 'https://cdn.jsdelivr.net/npm/@fontsource/{slug}@{ver}/{path}'


def get(url, binary=False):
    req = urllib.request.Request(url, headers={'User-Agent': 'type-iteration/1.0'})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    return data if binary else data.decode('utf-8')


def fetch(slug, italic=False):
    d = os.path.join(CACHE, slug)
    os.makedirs(d, exist_ok=True)
    try:
        ver = json.loads(get(f'https://registry.npmjs.org/@fontsource/{slug}'))['dist-tags']['latest']
    except Exception as e:
        return slug, f'MISSING ({e.__class__.__name__}: no @fontsource/{slug})'
    files = json.loads(get(f'https://data.jsdelivr.com/v1/packages/npm/@fontsource/{slug}@{ver}?structure=flat'))['files']
    want = [f['name'].lstrip('/') for f in files
            if f['name'].endswith('.woff2') and f'/{slug}-latin-' in f['name']
            and (f['name'].endswith('-normal.woff2') or (italic and f['name'].endswith('-italic.woff2')))]
    for extra in ('metadata.json', 'LICENSE'):
        if any(f['name'].lstrip('/') == extra for f in files):
            want.append(extra)
    got = 0
    for path in want:
        out = os.path.join(d, os.path.basename(path))
        if os.path.exists(out) and os.path.getsize(out) > 0:
            got += 1
            continue
        try:
            data = get(CDN.format(slug=slug, ver=ver, path=path), binary=True)
            open(out, 'wb').write(data)
            got += 1
        except Exception as e:
            print(f'  {slug}: {path} failed ({e})')
    return slug, f'{got} files (v{ver})'


def index():
    idx = {}
    for slug in sorted(os.listdir(CACHE)):
        d = os.path.join(CACHE, slug)
        if not os.path.isdir(d):
            continue
        meta = {}
        if os.path.exists(os.path.join(d, 'metadata.json')):
            meta = json.load(open(os.path.join(d, 'metadata.json')))
        family = meta.get('family') or slug.replace('-', ' ').title()
        faces = []
        for f in sorted(os.listdir(d)):
            if f.endswith('.woff2'):
                # <slug>-latin-<weight>-<style>.woff2
                parts = f[:-6].split('-')
                faces.append({'file': f'{slug}/{f}', 'weight': parts[-2], 'style': parts[-1]})
        if faces:
            idx[family] = {'slug': slug, 'license': meta.get('license', {}).get('type', ''), 'category': meta.get('category', ''), 'faces': faces}
    json.dump(idx, open(os.path.join(CACHE, 'index.json'), 'w'), indent=1)
    return idx


def main():
    os.makedirs(CACHE, exist_ok=True)
    cfg = json.load(open(os.path.join(HERE, 'fonts.json')))
    if '--list' in sys.argv:
        for fam, v in index().items():
            print(f"{fam:32s} {v['slug']:28s} {v['license']:10s} weights {sorted({f['weight'] for f in v['faces']})}")
        return
    slugs = [a for a in sys.argv[1:] if not a.startswith('-')]
    if not slugs:
        slugs = list(dict.fromkeys(s for k, v in cfg.items() if not k.startswith('_') for s in v))
    italic = set(cfg.get('_italic', []))
    with ThreadPoolExecutor(8) as ex:
        for slug, msg in ex.map(lambda s: fetch(s, s in italic), slugs):
            print(f'{slug:28s} {msg}')
    print(f'index: {len(index())} families -> {os.path.join(CACHE, "index.json")}')


if __name__ == '__main__':
    main()
