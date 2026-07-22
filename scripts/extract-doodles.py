#!/usr/bin/env python3
"""Extract HoneyHearts white-background doodle stickers to trimmed transparent PNGs.
Three modes: 'global' (luminance+saturation key, keys enclosed interiors),
'floodfill' (border-connected paper only, keeps enclosed white content) and
'alpha' (trust the source's existing alpha channel — for assets whose shape is
already an alpha matte over a flat RGB fill, e.g. doodle-heart-pink).
Deps: pillow numpy scipy
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

SRC = "assets/stickers/raw/doodles"
DST = "public/stickers/doodles"
MAX_EDGE = 800

# per-image overrides; default mode is 'global'
CONFIG = {
    "doodle-love-letter": {"mode": "floodfill"},
    # solid paper wrapper — global keying leaves its light interior folds
    # semi-transparent, so keep the whole enclosed motif via floodfill.
    "sticker-bouquet": {"mode": "floodfill"},
    # shape ships as an alpha matte over a flat pink fill — keying by colour/
    # luminance would erase it, so reuse the source alpha verbatim.
    "doodle-heart-pink": {"mode": "alpha"},
}

def _channels(path):
    rgb = np.asarray(Image.open(path).convert("RGB")).astype(np.float32) / 255
    mx, mn = rgb.max(-1), rgb.min(-1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    return rgb, mx, sat

def key_global(path, v=0.86, s=0.16, soft=0.06):
    rgb, val, sat = _channels(path)
    bg = (np.clip((val - (v - soft)) / (2 * soft), 0, 1)
          * np.clip(((s + soft) - sat) / (2 * soft), 0, 1))
    return rgb, 1 - bg

def key_floodfill(path, v=0.80, s=0.18):
    rgb, val, sat = _channels(path)
    paper = (val > v) & (sat < s)
    lbl, _ = ndimage.label(paper)
    border = set(np.unique(np.concatenate(
        [lbl[0], lbl[-1], lbl[:, 0], lbl[:, -1]]))) - {0}
    return rgb, (~np.isin(lbl, list(border))).astype(np.float32)

def key_alpha(path):
    """Trust the source's own alpha matte; RGB is taken as-is (flat fill)."""
    arr = np.asarray(Image.open(path).convert("RGBA")).astype(np.float32) / 255
    return arr[..., :3], arr[..., 3]

def finish(rgb, alpha, min_frac=0.001, pad=40):
    solid = alpha > 0.2
    lbl, n = ndimage.label(solid)
    if n:
        sizes = ndimage.sum(np.ones_like(lbl), lbl, range(1, n + 1))
        keep = np.where(sizes >= min_frac * alpha.size)[0] + 1
        alpha = np.where(np.isin(lbl, list(keep)), alpha, 0)
    a8 = (np.clip(alpha, 0, 1) * 255).astype(np.uint8)
    im = Image.fromarray(np.dstack([(rgb * 255).astype(np.uint8), a8]), "RGBA")
    ys, xs = np.where(a8 > 40)
    if len(xs):
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        im = im.crop((max(0, x0 - pad), max(0, y0 - pad),
                      min(im.width, x1 + pad), min(im.height, y1 + pad)))
    if max(im.size) > MAX_EDGE:
        sc = MAX_EDGE / max(im.size)
        im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    return im

MODES = {"global": key_global, "floodfill": key_floodfill, "alpha": key_alpha}

def main():
    os.makedirs(DST, exist_ok=True)
    for f in sorted(x for x in os.listdir(SRC) if x.endswith(".png")):
        name = os.path.splitext(f)[0].replace("doole-", "doodle-")  # fix typo
        cfg = CONFIG.get(name, {})
        mode = cfg.get("mode", "global")
        rgb, alpha = MODES[mode](os.path.join(SRC, f))
        out = finish(rgb, alpha)
        out.save(os.path.join(DST, name + ".png"), optimize=True)
        print(f"{name:24s} [{mode:9s}] -> {out.size}")

if __name__ == "__main__":
    main()