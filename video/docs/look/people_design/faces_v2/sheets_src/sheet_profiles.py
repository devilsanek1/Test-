# faces_v2 sheet 1: the profiles. Her (now = LASH, beside 3 options and the blue-cliff crop) and him (now beside 3
# options); each option also as a 3/4 head and at film size (~200 px). Run: python3 sheet_profiles.py, then
# node shot.mjs sheet_profiles.html <out.png> 2400 <H>.
import base64, io, sys
from PIL import Image
from geo import Frame
from faces import HER, HIM, measure
from draw import profile_svg, q34, q34_svg
from figure import figure_profile, figure_q34

REFS = '/home/user/Test-/video/docs/look/people_design/refs_hair_2026-10-30/'
FCTEST = sys.argv[1] if len(sys.argv) > 1 else 'fctest.png'
W = 2400
BG = '#F2EAE2'
PANEL = '#EAE0D6'
INK = '#3B2A26'
SUB = '#6E5A52'
REC = '#1F7A68'
FILM = '#A8948F'
FONT = "Inter, 'Helvetica Neue', Arial, sans-serif"


def b64img(im):
    buf = io.BytesIO()
    im.save(buf, 'PNG')
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()


def crop_ref(path, box, w, h):
    im = Image.open(path).convert('RGB').crop(box)
    sc = min(w / im.width, h / im.height)
    im = im.resize((int(im.width * sc), int(im.height * sc)), Image.LANCZOS)
    return im


def text(x, y, s, size=20, weight=400, color=INK, anchor='start'):
    s = s.replace('&', '&amp;').replace('<', '&lt;')
    return f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" font-weight="{weight}" fill="{color}" text-anchor="{anchor}">{s}</text>'


def panel(x, y, w, h, fill=PANEL, rec=False):
    o = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="{fill}"/>'
    if rec:
        o += f'<rect x="{x - 4}" y="{y - 4}" width="{w + 8}" height="{h + 8}" rx="17" fill="none" stroke="{REC}" stroke-width="5"/>'
    return o


def clip(x, y, w, h, inner):
    import random
    cid = f'pc{random.randint(0, 10 ** 9)}'
    return f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14"/></clipPath><g clip-path="url(#{cid})">{inner}</g>'


def badge(x, y, label='RECOMMENDED'):
    return f'<rect x="{x}" y="{y}" width="196" height="34" rx="17" fill="{REC}"/>' + text(x + 98, y + 23, label, 17, 700, '#FFFFFF', 'middle')


# the options' 3/4 parameters (draw.q34)
Q_HER = {
    'now': {},
    'A': dict(tipY=0.175, nl=0.128, lips=0.008, jw=0.25, jy=0.28, ear=True, tipR=0.016),
    'B': dict(dy=0.05, eyeY=0.045, tipY=0.205, nl=0.112, lips=0.01, lipsY=0.015, jw=0.235, jy=0.27, cheek=0.012, ear=True,
              curl=0.03, lashW=1.05, tipR=0.017, scoop=0.006),
    'C': dict(dy=0.035, eyeY=0.03, tipY=0.198, nl=0.13, tipR=0.006, lips=0.014, lipsY=0.012, jw=0.25, jy=0.27, ear=True,
              flick=1.25, scoop=0.004),
}
Q_HIM = {
    'now': {},
    'A': dict(brow=0.012, sock=0.012, jw=0.33, jy=0.35, chinW=0.13, bluntChin=1, ear=True, nl=0.165),
    'B': dict(brow=0.006, sock=0.006, jw=0.31, jy=0.33, ear=True, flick=0.6, nl=0.16, tipR=0.014),
    'C': dict(brow=0.016, sock=0.016, jw=0.35, jy=0.36, chinW=0.14, bluntChin=1, ear=True, beard=True, nl=0.185),
}

NAMES_HER = {'now': 'NOW: LASH as built', 'A': 'A  REFINED', 'B': 'B  CUTE (05\'s lesson)', 'C': 'C  CHIC'}
NAMES_HIM = {'now': 'NOW: LASH as built', 'A': 'A  CLEAN', 'B': 'B  SOFT', 'C': 'C  RUGGED'}
LINES_HER = {
    'A': ['placement as now; a shorter, softly scooped', 'nose, the tip lifted; fuller lips; the chin on', 'the line; a V jaw; a slimmer neck'],
    'B': ['features 0.05 h lower; a round forehead;', 'a short button nose lifted hard; one full lip', 'bump; a small round chin; a short V jaw'],
    'C': ['placed low like B; a straight ski-slope nose', 'with a crisp point; a soft pout; a pointed', 'V chin; a crisp jaw; a long neck'],
}
LINES_HIM = {
    'A': ['a brow shelf, the forehead sloping back; a', 'deep bridge; a straight strong nose; a square', 'chin on the line; a low jaw with a corner'],
    'B': ['a softer brow; a straight slim nose lifted a', 'touch; a clear chin; a long clean jaw; a long', 'neck (03\'s student, the "idol")'],
    'C': ['a heavy brow; a longer nose; a square chin;', 'a wide jaw; a thick neck; a short beard as', 'one flat tone (04\'s lesson)'],
}


def nums(F):
    m = measure(F)
    return (f"eye {m['eye']:.2f} h, nose {m['noseLen']:.2f} h, NLA {m['NLA']:.0f}",
            f"lips {m['UL']:.3f} h back, chin {m['chin']:+.3f}, jaw {m['jawRise']:.0f} deg")


def section(y0, who, S, Q, names, lines, rec, ref_im, ref_label, fct, fct_q):
    o = []
    title = 'HER: the woman\'s face (the "you")' if who == 'her' else 'HIM: the man\'s face'
    o.append(text(30, y0 + 34, title, 34, 800))
    o.append(text(30, y0 + 66, 'Row 1: the profile, the skull 245 px (as on a 1920 px figure). Row 2: the 3/4 head (yaw -34) and every option at film size, 1:1.', 20, 400, SUB))
    y = y0 + 90
    pw, ph = 375, 470
    xs = [30 + i * (pw + 18) for i in range(6)]
    # 1: the reference crop
    o.append(panel(xs[0], y, pw, ph))
    o.append(f'<image x="{xs[0] + (pw - ref_im.width) / 2}" y="{y + 10}" width="{ref_im.width}" height="{ref_im.height}" href="{b64img(ref_im)}"/>')
    o.append(text(xs[0] + 16, y + ph + 30, ref_label[0], 20, 700))
    o.append(text(xs[0] + 16, y + ph + 54, ref_label[1], 17, 400, SUB))
    o.append(text(xs[0] + 16, y + ph + 76, ref_label[2], 17, 400, SUB))
    # 2: now, as the code renders it (FcTest crop)
    o.append(panel(xs[1], y, pw, ph))
    o.append(clip(xs[1], y, pw, ph, f'<image x="{xs[1]}" y="{y}" width="{pw}" height="{ph}" href="{b64img(fct)}"/>'))
    o.append(text(xs[1] + 16, y + ph + 30, names['now'], 20, 700))
    o.append(text(xs[1] + 16, y + ph + 54, 'the FcTest render, the current hair', 17, 400, SUB))
    o.append(text(xs[1] + 16, y + ph + 76, nums(S['now'])[0], 15, 400, INK))
    o.append(text(xs[1] + 16, y + ph + 95, nums(S['now'])[1], 15, 400, INK))
    # 3..6: the face geometry on the sheet's common hair: now, A, B, C
    for i, k in enumerate(['now', 'A', 'B', 'C']):
        x = xs[2 + i]
        o.append(panel(x, y, pw, ph, rec=(k == rec)))
        fr = Frame(x + 212, y + 190, 245)
        o.append(clip(x, y, pw, ph, profile_svg(S[k], who, fr, neck_depth=1.4)))
        nm = 'NOW, on the sheet\'s hair' if k == 'now' else names[k]
        o.append(text(x + 16, y + ph + 30, nm, 20, 700, REC if k == rec else INK))
        if k == 'now':
            o.append(text(x + 16, y + ph + 54, 'the same face as built, the hair', 17, 400, SUB))
            o.append(text(x + 16, y + ph + 76, 'the options share (a fair compare)', 17, 400, SUB))
        else:
            for j, ln in enumerate(lines[k]):
                o.append(text(x + 16, y + ph + 54 + j * 21, ln, 16, 400, SUB))
            o.append(text(x + 16, y + ph + 54 + 3 * 21 + 4, nums(S[k])[0], 15, 400, INK))
            o.append(text(x + 16, y + ph + 54 + 3 * 21 + 23, nums(S[k])[1], 15, 400, INK))
        if k == rec:
            o.append(badge(x + pw - 210, y + 14))
    # row 2: the 3/4 heads
    y2 = y + ph + 165
    qh = 400
    o.append(panel(xs[0], y2, pw, qh))
    o.append(clip(xs[0], y2, pw, qh, f'<image x="{xs[0]}" y="{y2}" width="{pw}" height="{qh}" href="{b64img(fct_q)}"/>'))
    o.append(text(xs[0] + 16, y2 + qh + 30, 'NOW 3/4, as built', 20, 700))
    for i, k in enumerate(['A', 'B', 'C']):
        x = xs[1 + i]
        o.append(panel(x, y2, pw, qh, rec=(k == rec)))
        fr = Frame(x + 205, y2 + 185, 245)
        o.append(clip(x, y2, pw, qh, q34_svg(who, q34(who, Q[k]), fr, neck_w=0.46 if who == 'him' else 0.34)))
        o.append(text(x + 16, y2 + qh + 30, names[k] + ', 3/4', 20, 700, REC if k == rec else INK))
    # the film-size band: now, A, B, C (profile + 3/4), 1:1
    fx0 = xs[4]
    fw = xs[5] + pw - fx0
    o.append(panel(fx0, y2, fw, qh, fill=FILM))
    o.append(text(fx0 + 16, y2 + 30, 'film size 1:1: a 200 px figure (profile, 3/4)', 18, 600, '#FFFFFF'))
    base = y2 + 345
    for i, k in enumerate(['now', 'A', 'B', 'C']):
        cx = fx0 + 60 + i * 188
        o.append(figure_profile(who, S[k], cx + 6, base))
        o.append(figure_q34(who, q34(who, Q[k]), cx + 92, base))
        o.append(text(cx + 48, base + 34, 'now' if k == 'now' else k, 19, 700, '#FFFFFF' if k != rec else '#D9FFF4', 'middle'))
    return '\n'.join(o), y2 + qh + 60


def main():
    fct = Image.open(FCTEST).convert('RGB')
    # the FcTest render: 2000 x 700, four columns of 500: her p, her q, man p, man q (mag 3: skull ~245 px)
    def fc(col, dx=0):
        return fct.crop((col * 500 + 60 + dx, 92, col * 500 + 60 + dx + 375, 92 + 470))
    def fcq(col, dx=0):
        return fct.crop((col * 500 + 60 + dx, 92, col * 500 + 60 + dx + 375, 92 + 400))
    ref05 = crop_ref(REFS + '05_girl_on_ledge.jpg', (196, 70, 306, 205), 355, 450)
    ref03 = crop_ref(REFS + '03_students_and_sheet.jpg', (424, 44, 556, 214), 355, 450)
    parts = []
    parts.append(text(30, 62, 'People: faces with appeal (faces_v2), sheet 1: the profiles', 46, 800))
    parts.append(text(30, 100, 'The owner: "the face profile should be cute and like super appealing by modern standards ... like the woman sitting on the blue cliff reference ...', 21, 400, SUB))
    parts.append(text(30, 128, 'our man refreshed similarly has manly features". Direction C\'s language: flat two-tone shapes, no outlines, the closed-eye lash. The hair is a neutral clean cut shared by every', 21, 400, SUB))
    parts.append(text(30, 156, 'option (the hair round decides the cuts); only the face, the ear and the neck change. Numbers: h = the skull; NLA = the nose-to-lip angle; lips = the upper lip behind the nose-to-chin line.', 21, 400, SUB))
    s1, y = section(180, 'her', HER, Q_HER, NAMES_HER, LINES_HER, 'B', ref05,
                    ('REF 05, the blue-cliff woman', 'a small face low on a big head; a tiny', 'lifted nose; a short jaw; the ear shows'),
                    fc(0), fcq(1))
    parts.append(s1)
    s2, y = section(y + 10, 'him', HIM, Q_HIM, NAMES_HIM, LINES_HIM, 'A', ref03,
                    ('REF 03, the student (principle only)', 'a clear brow, a straight nose, a forward', 'chin, a long jaw with a corner, a long neck'),
                    fc(2), fcq(3))
    parts.append(s2)
    parts.append(text(30, y + 10, 'Look at: is B cute and appealing without reading young? Is A manly yet friendly? Does each still read at film size (the band), where the face is mostly the contour?', 22, 600))
    H = int(y + 50)
    html = (f'<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:{BG}">'
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
            f'<rect width="{W}" height="{H}" fill="{BG}"/>' + '\n'.join(parts) + '</svg></body></html>')
    open('sheet_profiles.html', 'w').write(html)
    print(H)


main()
