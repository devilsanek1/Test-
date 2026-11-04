"""OpenCV (Apache-2.0) + contrib, scikit-image (BSD-3), pykuwahara (GPL-3, a tool only): the classic NPR FILTERS on
our design and on v6's painting, as filters on the piece only (alpha kept, colour filtered on a bleed-filled copy).
usage: venv/bin/python -B src/opencv_filters.py"""
import time, numpy as np, cv2
from scipy import ndimage as ndi
from PIL import Image
import pykuwahara
from skimage import segmentation, color as skcolor
L = '/tmp/organic/libraries'


def fill_out(rgb, a):
    """Extend the colour past the alpha edge (nearest inside pixel), so a filter never pulls in black."""
    inside = a > 0.5
    idx = ndi.distance_transform_edt(~inside, return_distances=False, return_indices=True)
    return rgb[tuple(idx)]


def run(name, which):
    src = np.asarray(Image.open(f'{L}/inputs/{name}_{which}.png').convert('RGBA'))
    a = src[..., 3]
    rgb = fill_out(src[..., :3], a)
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    out, ms = {}, {}
    def put(k, img, alpha=a):
        out[k] = np.dstack([cv2.cvtColor(img, cv2.COLOR_BGR2RGB), alpha])
    t = time.time(); put('stylization', cv2.stylization(bgr, sigma_s=40, sigma_r=0.35)); ms['stylization'] = time.time() - t
    t = time.time(); put('edge_preserving', cv2.edgePreservingFilter(bgr, flags=cv2.RECURS_FILTER, sigma_s=40, sigma_r=0.3)); ms['edge_preserving'] = time.time() - t
    t = time.time(); put('oil_painting', cv2.xphoto.oilPainting(bgr, 9, 1)); ms['oil_painting'] = time.time() - t
    t = time.time(); put('kuwahara_gauss', pykuwahara.kuwahara(bgr, method='gaussian', radius=7)); ms['kuwahara_gauss'] = time.time() - t
    t = time.time()
    ad = cv2.ximgproc.anisotropicDiffusion(bgr, 0.15, 0.04, 30); put('anisotropic_diffusion', ad); ms['anisotropic_diffusion'] = time.time() - t
    t = time.time()
    seg = segmentation.slic(rgb, n_segments=220 if name == 'cloud' else 300, compactness=8, start_label=1, mask=a > 128)
    av = skcolor.label2rgb(seg, rgb, kind='avg', bg_label=0).astype(np.uint8)
    put('slic_mosaic', cv2.cvtColor(av, cv2.COLOR_RGB2BGR)); ms['slic_mosaic'] = time.time() - t
    for k, v in out.items():
        Image.fromarray(v, 'RGBA').save(f'{L}/out/opencv/{name}_{which}_{k}.png')
    return {k: round(v, 3) for k, v in ms.items()}


if __name__ == '__main__':
    for name in ['cloud', 'tree']:
        for which in ['design', 'v6']:
            print(name, which, run(name, which))
