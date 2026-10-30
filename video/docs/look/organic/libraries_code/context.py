"""The full scene-1 still (v6) with one library's cloud and tree swapped in: v6's own cloud replaced by its sky, v6's
tree inpainted out (OpenCV Telea; a stand-in for the flat ground behind it, fine at phone size), then the new pieces."""
import numpy as np, cv2
from PIL import Image
L = '/tmp/organic/libraries'
STILL = '/home/user/Test-/video/docs/studies/2026-10-28_city_posters/paint_test/paint_still_v6.png'
PUB = '/home/user/Test-/video/public/paint/v2s1_v6'
CB, TB = (560, 0), (-60, 1250)
_base = None


def base():
    global _base
    if _base is not None: return _base.copy()
    st = np.asarray(Image.open(STILL).convert('RGB')).copy()
    # cloud: the sky behind it, plus the mid bank's sliver that reaches into the box
    sky = Image.open(f'{L}/inputs/cloud_sky_v6.png').convert('RGBA')
    p2 = Image.open(f'{PUB}/clouds_p2.png').convert('RGBA')   # box (0, 100)
    sky.alpha_composite(p2.crop((560, 0, 580, 190)), (0, 100))
    st[0:345, 560:1080] = np.asarray(sky.convert('RGB'))
    # tree: inpaint where v6's tree was
    t = np.asarray(Image.open(f'{L}/inputs/tree_v6.png').convert('RGBA'))
    m = np.zeros(st.shape[:2], np.uint8)
    a = (t[..., 3] > 8).astype(np.uint8) * 255
    x0, y0 = TB
    m[y0:y0 + 300, 0:360] = a[:, 60:420]
    m = cv2.dilate(m, np.ones((7, 7), np.uint8))
    st = cv2.inpaint(st, m, 7, cv2.INPAINT_TELEA)
    _base = st
    return st.copy()


_front = None


def front():
    """What the still draws IN FRONT of the tree (the planter wall over the trunk's foot): re-laid on top."""
    global _front
    if _front is None:
        st = np.asarray(Image.open(STILL).convert('RGB')).astype(int)
        im = Image.fromarray(base()).convert('RGBA')
        im.alpha_composite(Image.open(f'{L}/inputs/tree_v6.png').convert('RGBA').crop((60, 0, 420, 300)), (0, 1250))
        d = np.abs(np.asarray(im.convert('RGB')).astype(int) - st).max(-1) > 8
        d[:1468] = False
        _front = (d, st.astype(np.uint8))
    return _front


def compose(cloud_png, tree_png):
    im = Image.fromarray(base()).convert('RGBA')
    im.alpha_composite(Image.open(cloud_png).convert('RGBA'), CB)
    t = Image.open(tree_png).convert('RGBA').crop((60, 0, 420, 300))
    im.alpha_composite(t, (0, 1250))
    out = np.asarray(im.convert('RGB')).copy()
    m, st = front()
    out[m] = st[m]
    return Image.fromarray(out)


if __name__ == '__main__':
    v6 = compose(f'{L}/inputs/cloud_v6.png', f'{L}/inputs/tree_v6.png')
    st = Image.open(STILL).convert('RGB')
    d = np.abs(np.asarray(v6).astype(int) - np.asarray(st).astype(int))
    print('v6 rebuilt vs the real still: max', d.max(), 'mean', round(d.mean(), 3), 'px >8:', int((d.max(-1) > 8).sum()))
    v6.save(f'{L}/work/context_v6_rebuilt.png')
