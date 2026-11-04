"""PNG <-> raw RGBA bytes, for the Node renderers (no PNG codec needed there)."""
import sys, numpy as np
from PIL import Image
def to_raw(png, raw):
    a = np.asarray(Image.open(png).convert('RGBA')); open(raw, 'wb').write(a.tobytes()); return a.shape[1], a.shape[0]
def from_raw(raw, w, h, png):
    a = np.frombuffer(open(raw, 'rb').read(), np.uint8).reshape(h, w, 4); Image.fromarray(a, 'RGBA').save(png); return a
if __name__ == '__main__':
    if sys.argv[1] == 'to': print(*to_raw(sys.argv[2], sys.argv[3]))
    else: from_raw(sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5])
