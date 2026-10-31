#!/usr/bin/env python3
"""Imagination B's sheet: the 12 beat frames in order (B-B1..B-B12), then the alternates (B-B5alt, ...).

usage: python3 make_sheet.py <renders_dir> <out.png> [alt ids...]
Each frame is a 1080 x 1920 render of pages/<id>.html (video/scripts/type/render.mjs); the sheet shows each at
phone-glance size with its label, its words and its beat's feeling.
"""
import sys
from PIL import Image, ImageDraw, ImageFont

BEATS = [
    ("B1", "The warm line", "Did you know Helsinki wants AI to heat 70,000 homes?", "surprise, curiosity"),
    ("B2", "A cathedral of computers", "AI actually runs on giant computers, in buildings called data centers.", "a little awe"),
    ("B3", "Too hot for snow", "Those computers get really hot.", "heat rising, a touch of alarm"),
    ("B4", "Forty kettles in one", "...as much heat as FORTY kettles, boiling non-stop.", "playful astonishment"),
    ("B5", "One cup", "That's a lot of tea.", "a smile and a breath"),
    ("B6", "Snow falling up", "Normally, data centers just use big fans to blow that heat outside.", "a small pang"),
    ("B7", "The city reaches", "But Helsinki WANTS that heat.", "the turn, a spark of delight"),
    ("B8", "The missing piece, drawn", "The city has a plan to use it, starting next year.", "hope, anticipation"),
    ("B9", "A drawn door opens", "So how would that work?", "leaning in"),
    ("B10", "Cool in, honey out", "...take the heat out of its computers with water in pipes.", "clarity, 'oh, that's how'"),
    ("B11", "Under the snow, home", "Then pipes under the streets carry that heat into people's homes.", "cozy relief"),
    ("B12", "Your chat, a warm window", "So your chatbot could soon heat an apartment in Helsinki.", "personal warmth, a wink"),
]
ALTS = {
    "B5alt": ("One cup, close", "That's a lot of tea.", "a smile and a breath"),
    "B6alt": ("Everywhere, up it goes", "Normally, data centers just use big fans to blow that heat outside.", "a small pang"),
    "B7alt": ("The city leans out", "But Helsinki WANTS that heat.", "the turn, a spark of delight"),
    "B12alt": ("The cat on the warm sill", "So your chatbot could soon heat an apartment in Helsinki.", "personal warmth, a wink"),
}

def font(size, bold=False):
    for p in (["/home/user/Test-/video/scripts/type/.fonts/gaegu/gaegu-latin-700-normal.ttf"] if bold else []) + [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()

def wrap(draw, text, fnt, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=fnt) <= width:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines

def main():
    src, out = sys.argv[1], sys.argv[2]
    alts = sys.argv[3:]
    items = [(f"B-{b}", b, t, w, f) for b, t, w, f in BEATS] + [(f"B-{a}", a, *ALTS[a]) for a in alts]
    tw, th = 300, 533
    cols = 6
    pad, cap_h, head_h = 22, 118, 96
    rows_main = 2
    rows_alt = (len(alts) + cols - 1) // cols
    sep = 56 if alts else 0
    Wd = cols * tw + (cols + 1) * pad
    Ht = head_h + (rows_main + rows_alt) * (th + cap_h + pad) + pad + sep
    sheet = Image.new("RGB", (Wd, Ht), (22, 24, 30))
    d = ImageDraw.Draw(sheet)
    d.text((pad, 18), "Video 4 ideas  ·  imagination B: the machine and the mechanism  ·  \"The open machine\" (one piece missing)",
           font=font(26, True), fill=(240, 236, 226))
    d.text((pad, 56), "Value sketches: the night in cool greys, ONE warm accent (the heat); the caption band kept light. Beat order, then the alternates.",
           font=font(17), fill=(178, 182, 192))
    for i, (label, fid, title, words, feel) in enumerate(items):
        if i < 12:
            r, c = divmod(i, cols)
            y = head_h + r * (th + cap_h + pad)
        else:
            r, c = divmod(i - 12, cols)
            y = head_h + rows_main * (th + cap_h + pad) + sep + r * (th + cap_h + pad)
        x = pad + c * (tw + pad)
        im = Image.open(f"{src}/{fid}.png").convert("RGB").resize((tw, th), Image.LANCZOS)
        sheet.paste(im, (x, y))
        d.rectangle([x - 1, y - 1, x + tw, y + th], outline=(70, 74, 86))
        d.text((x, y + th + 8), label, font=font(22, True), fill=(255, 210, 127))
        tx = x + d.textlength(label + "  ", font=font(22, True))
        fs = 16
        while fs > 11 and tx + d.textlength(title, font=font(fs, True)) > x + tw:
            fs -= 1
        d.text((tx, y + th + 11 + (16 - fs) // 2), title, font=font(fs, True), fill=(236, 233, 226))
        yy = y + th + 38
        for ln in wrap(d, words, font(14), tw)[:3]:
            d.text((x, yy), ln, font=font(14), fill=(196, 199, 207)); yy += 18
        d.text((x, yy + 2), "feel: " + feel, font=font(14), fill=(150, 196, 214))
    if alts:
        ya = head_h + rows_main * (th + cap_h + pad) + 10
        d.text((pad, ya), "Alternates (the beats I am least sure of)", font=font(22, True), fill=(240, 236, 226))
    sheet.save(out, optimize=True)
    print("wrote", out, sheet.size)

if __name__ == "__main__":
    main()
