#!/usr/bin/env python3
"""The city-poster study's one-picture summary for the owner's phone (img/SUMMARY_sheet.jpg).

Six lessons, each a headline, one line and a small visual cropped from the posters, v2's frames or the study's
sheets (crop boxes in each source's own pixels). 1080 px wide, text >= 34 px, JPEG q90.
Run from the repo root:  python3 -I video/scripts/look/posters/summary_sheet.py [--out PATH]
"""
import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[4]
STUDY = ROOT / "video/docs/studies/2026-10-28_city_posters"
POSTERS = ROOT / "video/docs/look/poster_refs"
W, M = 1080, 48                      # width, side margin
INNER = W - 2 * M
BG, INK, SOFT, RULE = "#FBF4EA", "#2B1B0A", "#5E4636", "#E3D3C2"
TAG_POSTER, TAG_OURS = "#1D2B36", "#9A563C"
FONT_DIR = Path("/usr/share/fonts/opentype/inter")


def font(name, size):
    try:
        return ImageFont.truetype(str(FONT_DIR / name), size)
    except OSError:
        return ImageFont.truetype("DejaVuSans-Bold.ttf" if "Bold" in name else "DejaVuSans.ttf", size)


F_TITLE, F_SUB = font("Inter-Bold.otf", 64), font("Inter-Regular.otf", 36)
F_HEAD, F_BODY = font("Inter-Bold.otf", 50), font("Inter-Regular.otf", 36)
F_TAG, F_FOOT_H = font("Inter-SemiBold.otf", 34), font("Inter-Bold.otf", 40)

# (source, crop box, tag, tag colour[, options]); a panel shows one wide image or a pair side by side. Options: "pos"
# "bl" puts the tag bottom-left; "patches" paint the study sheet's numbered markers out with the wall colour sampled
# beside them (A vs B close-up only), before the crop.
LESSONS = [
    ("1  Make the near look near",
     "A dark, detailed frame along the bottom and sides, not pale open ground.",
     [(POSTERS / "05_cape_town.jpg", (0, 1180, 640, 1600), "POSTER", TAG_POSTER),
      (STUDY / "baseline/v2_t05.20_S1cover.jpg", (0, 540, 540, 894), "GOOGLE VIDEO", TAG_OURS)]),
    ("2  Put something WAY out",
     "One big, pale, simple shape on the horizon, behind everything, for scale.",
     [(POSTERS / "02_reykjavik.jpg", (250, 700, 1206, 1150), "POSTER", TAG_POSTER)]),
    ("3  Real darks, in many small pieces",
     "Windows, doorways, the shade under eaves: 6-10 % of the picture. The Google video has 2 %.",
     [(POSTERS / "06_copenhagen.jpg", (0, 760, 700, 1220), "POSTER", TAG_POSTER),
      (STUDY / "baseline/v2_t14.00_S3.jpg", (0, 280, 540, 635), "GOOGLE VIDEO", TAG_OURS)]),
    ("4  Crisp hero, simpler world",
     "The subject sharp and rich; the rest the same style in flat facets (\"low poly\"), never blurred.",
     [(STUDY / "img/pro_2_hierarchy_tiers.jpg", (160, 1113, 472, 1357), "THE HERO", TAG_POSTER),
      (STUDY / "img/pro_2_hierarchy_tiers.jpg", (868, 1113, 1192, 1357), "THE REST", TAG_POSTER)]),
    ("5  Shape with light, not lines",
     "Every volume a clear lit side and shade side. The posters draw no outlines.",
     [(STUDY / "img/AB_outlines.jpg", (24, 1525, 550, 2215), "A: OUR LINE", TAG_OURS,
       {"pos": "bl", "patches": [((377, 1575, 498, 1665), (530, 1624))]}),
      (STUDY / "img/AB_outlines.jpg", (915, 1525, 1441, 2215), "B: LIGHT AND SHADE", TAG_POSTER,
       {"pos": "bl", "patches": [((1281, 1585, 1412, 1665), (1425, 1624))]})]),
    ("6  Nature: real edges, faceted inside",
     "True leaf shapes at the edge, simple lit and shade facets inside, one gentle wind.",
     [(STUDY / "img/pro_3_nature_anatomy.jpg", (20, 78, 492, 380), "POSTER", TAG_POSTER),
      (STUDY / "img/pro_3_nature_anatomy.jpg", (20, 1060, 492, 1362), "GOOGLE VIDEO", TAG_OURS)]),
]
FOOT = [
    ("Your calls", "Outline or shade? Darks 5 % or 6-10 %? Try the low-poly world? Lift the far city?"),
    ("Next", "A 7-second test of the canal opening, drawn twice, played after the original."),
]


def wrap(draw, text, fnt, width):
    lines, line = [], ""
    for word in text.split():
        trial = (line + " " + word).strip()
        if draw.textlength(trial, font=fnt) <= width:
            line = trial
        else:
            lines.append(line)
            line = word
    return lines + [line] if line else lines


def tagged(src, box, tag, colour, width, pos="tl", patches=()):
    im = Image.open(src).convert("RGB")
    for rect, (sx, sy) in patches:
        ImageDraw.Draw(im).rectangle(rect, fill=im.getpixel((sx, sy)))
    im = im.crop(box)
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    tw = d.textlength(tag, font=F_TAG)
    y0 = 12 if pos == "tl" else im.height - 64
    d.rounded_rectangle((12, y0, 12 + tw + 28, y0 + 52), radius=10, fill=colour)
    d.text((26, y0 + 6), tag, font=F_TAG, fill="white")
    return im


def visual(items):
    gap = 24
    width = INNER if len(items) == 1 else (INNER - gap) // 2
    ims = [tagged(*it[:4], width, **(it[4] if len(it) > 4 else {})) for it in items]
    h = min(im.height for im in ims)                     # equal heights: trim the taller from the bottom
    out = Image.new("RGB", (INNER, h), BG)
    for i, im in enumerate(ims):
        out.paste(im.crop((0, 0, im.width, h)), (i * (width + gap), 0))
    return out


def build(out_path):
    probe = ImageDraw.Draw(Image.new("RGB", (W, 10)))
    blocks = []                                          # (kind, payload) laid out top to bottom
    blocks.append(("text", ("City posters: six lessons for our look", F_TITLE, INK, 14)))
    blocks.append(("text", ("What your seven posters do that the Google video doesn't yet.", F_SUB, SOFT, 40)))
    for head, line, items in LESSONS:
        blocks.append(("rule", None))
        blocks.append(("text", (head, F_HEAD, INK, 10)))
        blocks.append(("text", (line, F_BODY, SOFT, 22)))
        blocks.append(("image", visual(items)))
    blocks.append(("rule", None))
    for head, line in FOOT:
        blocks.append(("text", (head, F_FOOT_H, INK, 6)))
        blocks.append(("text", (line, F_BODY, SOFT, 26)))

    def height(kind, payload):
        if kind == "rule":
            return 60
        if kind == "image":
            return payload.height
        text, fnt, _, after = payload
        n = len(wrap(probe, text, fnt, INNER))
        return n * round(fnt.size * 1.28) + after

    H = 56 + sum(height(k, p) for k, p in blocks) + 40
    sheet = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(sheet)
    y = 56
    for kind, payload in blocks:
        if kind == "rule":
            d.line((M, y + 28, W - M, y + 28), fill=RULE, width=3)
        elif kind == "image":
            sheet.paste(payload, (M, y))
        else:
            text, fnt, colour, _ = payload
            for i, ln in enumerate(wrap(probe, text, fnt, INNER)):
                d.text((M, y + i * round(fnt.size * 1.28)), ln, font=fnt, fill=colour)
        y += height(kind, payload)
    sheet.save(out_path, quality=90, optimize=True)
    return sheet.size


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--out", default=str(STUDY / "img/SUMMARY_sheet.jpg"))
    a = ap.parse_args()
    print(a.out, build(a.out))
