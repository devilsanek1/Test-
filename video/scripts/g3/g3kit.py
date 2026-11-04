"""g3kit.py: Python helpers for writing a G3 board JSON for the shared kit (src/lib/g3/, schema src/lib/g3/types.ts;
spec docs/G3_ANIMATIC.md). A film's board builder imports it:

  import sys, os; sys.path.insert(0, os.path.join(VIDEO, 'scripts', 'g3')); import g3kit as k
  words = k.load_words('public/v4/voice_words.json')
  t = k.word_t(words, 'AI')                       # a word's start (film s); after=... picks a later one
  p = k.Panel('S2', 4.28, 8.76, note='WIDE -> MEDIUM · PUSH IN\\nthe pen un-draws the warm run', set='street')
  p.add(k.rect(0, 1240, 1080, 680, 'light', tier='C', life='snow', promise='snowy street'), 'street')
  p.add(k.icon('server', 380, 760, 320, tier='A'), 'computer')
  p.cam_keys([k.key(3.92, 540, 960, 1.0), k.key(5.68, 380, 900, 1.56, peak=4.28, word='PUSH IN', anchor='the computer')])
  p.move('computer', 0, -40, at=p.rel(5.68), dur=0.3)   # element times are shot-relative: p.rel(film_s)
  p.poses('you', [(t0, 'stand'), (t1, 'reach')], x=540, y=1500, h=420, tier='B')   # pose test: stepped key poses
  shot = p.shot(transition=k.join('C', 'continuous', what='the pen tip'))

TIME: camera keys are FILM seconds; element times (in, out, draw, undraw, fillIn, moves) are seconds after the shot's
start (p.rel converts). A set's shared drawing lives on the film clock.
"""
import json
import math

FPS = 60
W, H = 1080, 1920
BAND = (290, 600)
NOTES_TOP = 1680


def load_words(path):
    with open(path) as f:
        d = json.load(f)
    return d['words'] if isinstance(d, dict) else d


def norm(w):
    return ''.join(ch for ch in w.lower() if ch.isalnum() or ch == "'")


def word_t(words, w, after=-1.0, end=False):
    """the start (or end) of the first word matching w (case and punctuation ignored) at or after `after` s"""
    key = norm(w)
    for x in words:
        if x['s'] >= after - 1e-6 and norm(x['w']) == key:
            return round(x['e'] if end else x['s'], 3)
    raise KeyError(f'word {w!r} not found after {after}')


def snap(t, fps=FPS):
    """the pose-change idiom (G3_ANIMATIC §4): an instant move (dur 1/(4 fps)) starts here, between two frames, so no
    frame lands mid-jump; and an element's in / out swap at snap(t) pops on the frame after t"""
    return round(math.floor(t * fps + 1e-9) / fps + 1 / (4 * fps), 4)


def r2(v):
    return round(v, 2)


def _el(t, kw):
    e = {'t': t}
    e.update({k: v for k, v in kw.items() if v is not None})
    return e


def rect(x, y, w, h, fill=None, **kw):
    return _el('rect', dict(x=x, y=y, w=w, h=h, fill=fill, **kw))


def ell(cx, cy, rx, ry, fill=None, **kw):
    return _el('ellipse', dict(cx=cx, cy=cy, rx=rx, ry=ry, fill=fill, **kw))


def line(pts, **kw):
    return _el('line', dict(pts=[list(map(r2, p)) for p in pts], **kw))


def shape(pts, fill, **kw):
    return line(pts, closed=True, fill=fill, **kw)


def text(x, y, s, size=64, **kw):
    return _el('text', dict(x=x, y=y, text=s, size=size, **kw))


def icon(name, x, y, w, h=None, **kw):
    return _el('icon', dict(name=name, x=x, y=y, w=w, h=h, **kw))


def figure(x, y, h, pose='stand', facing=None, **kw):
    return _el('figure', dict(x=x, y=y, h=h, pose=pose, facing=facing, **kw))


def scribble(x, y, w, h, **kw):
    return _el('scribble', dict(x=x, y=y, w=w, h=h, **kw))


def dress(x, y, w, h, kind='scribble', **kw):
    """a dress-layer mass (tier C, exempt from the 25-element cap and the subject lint)"""
    kw.setdefault('role', 'dress')
    kw.setdefault('tier', 'C')
    return scribble(x, y, w, h, **kw) if kind == 'scribble' else rect(x, y, w, h, 'light', **kw)


def pool(cx, cy, rx, ry, **kw):
    kw.setdefault('tier', 'C')
    return _el('pool', dict(cx=cx, cy=cy, rx=rx, ry=ry, **kw))


def shade(pts=None, cx=None, cy=None, rx=None, ry=None, **kw):
    kw.setdefault('tier', 'C')
    return _el('shade', dict(pts=[list(p) for p in pts] if pts else None, cx=cx, cy=cy, rx=rx, ry=ry, **kw))


def ground(x0, x1, y0, y1, n=5, **kw):
    kw.setdefault('tier', 'C')
    return _el('ground', dict(x0=x0, x1=x1, y0=y0, y1=y1, n=n, **kw))


def pipe(pts, bore=26, **kw):
    return _el('pipe', dict(pts=[list(map(r2, p)) for p in pts], bore=bore, **kw))


def ambient(kit, **kw):
    """a shared ambient preset: snow, steam, window, cloud, water, bird (src/lib/g3/ambient.tsx); loop is implied"""
    kw.setdefault('tier', 'C')
    e = {'t': 'ambient', 'kit': kit, 'loop': True}
    e.update({k: v for k, v in kw.items() if v is not None})
    return e


def key(t, x, y, z, **kw):
    """a camera key (film s); the segment INTO it takes ease / peak / word / anchor / pivot"""
    k = {'t': round(t, 3), 'x': r2(x), 'y': r2(y), 'z': round(z, 4)}
    k.update({a: b for a, b in kw.items() if b is not None})
    return k


def hold(x=540, y=960, z=1.0):
    return {'from': {'x': x, 'y': y, 'z': z}, 'to': {'x': x, 'y': y, 'z': z}, 'word': 'HOLD'}


DEVICE_OF = {'A': 'push-through', 'B': 'thread-match', 'C': 'continuous', 'D': 'object-carry', 'E': 'card-flip', 'F': 'plain-cut'}


def join(carrier, device=None, what=None, mid=None, type='cut', **kw):
    """the join INTO a shot: its carrier letter and device (CRAFT §a; G3_ANIMATIC §4)"""
    tr = {'type': type, 'carrier': carrier, 'device': device or DEVICE_OF.get(carrier)}
    if what:
        tr['what'] = what
    if mid is not None:
        tr['mid'] = round(mid, 3)
    tr.update(kw)
    return tr


class Panel:
    """one board panel: els + moves, element ids, the camera, the shot dict"""

    def __init__(self, sid, s, e, note='', **shot):
        self.id, self.s, self.e, self.note = sid, s, e, note
        self.extra = shot
        self.els, self.moves, self.ix = [], [], {}
        self.camera = hold()

    def rel(self, t):
        """film s -> s after this shot's start"""
        return round(t - self.s, 4)

    def add(self, el, eid=None):
        if eid:
            el['id'] = eid
            self.ix[eid] = len(self.els)
        self.els.append(el)
        return el

    def move(self, eid, dx, dy, at, dur, **kw):
        m = {'el': eid, 'dx': r2(dx), 'dy': r2(dy), 'at': round(at, 4), 'dur': round(dur, 4)}
        m.update({a: b for a, b in kw.items() if b is not None})
        self.moves.append(m)
        return m

    def poses(self, prefix, keys, x, y, h, facing=None, smear=None, **kw):
        """the pose test (G3_ANIMATIC §4): one figure per key pose, each popping in on its film time and out on the
        next drawing's (stepped, never tweened). keys = [(film_s, pose) or (film_s, pose, x, y)]; smear = [(film_s,
        frames, x, y)] inserts the ONE smear drawing of a fast transit, held `frames` frames (2-3), between two keys"""
        ev = [(k[0], 'pose', k[1], k[2] if len(k) > 2 else x, k[3] if len(k) > 3 else y) for k in keys]
        ev += [(sm[0], 'smear', sm[1], sm[2], sm[3]) for sm in smear or []]
        ev.sort(key=lambda e: e[0])
        for i, (t0, kind, what, px, py) in enumerate(ev):
            nxt = ev[i + 1][0] if i + 1 < len(ev) else None
            el = figure(px, py, h, 'smear' if kind == 'smear' else what, facing, **kw)
            t_in = self.rel(t0)
            if t_in > 0 or kind == 'smear':
                el['in'] = snap(t_in)
            out = snap(self.rel(nxt)) if nxt is not None else None
            if kind == 'smear':
                end = snap(t_in + what / FPS)
                out = min(out, end) if out is not None else end
            if out is not None:
                el['out'] = out
            self.add(el, f'{prefix}@{"smear" if kind == "smear" else what}{t0:.2f}')

    def cam_keys(self, keys):
        self.camera = {'keys': keys}

    def shot(self, transition, **kw):
        d = {'id': self.id, 's': round(self.s, 3), 'e': round(self.e, 3), 'note': self.note, 'transition': transition,
             'camera': self.camera, 'els': self.els}
        if self.moves:
            d['moves'] = self.moves
        d.update(self.extra)
        d.update(kw)
        return d


def animatic(film, label, audio, words, shots, duration, **kw):
    d = {'film': film, 'style': 'board', 'label': label, 'audio': audio, 'durationSec': duration, 'fps': FPS,
         'words': words, 'sfx': [], 'shots': shots}
    d.update(kw)
    return d


def write(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=1)
        f.write('\n')
