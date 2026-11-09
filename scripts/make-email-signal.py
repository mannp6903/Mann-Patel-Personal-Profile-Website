"""Builds public/email/signal.gif: the animated "signal line" banner at the top of enquiry emails.

GIF because it is the only animation Gmail and Outlook play. Drawn at 2x (1200x200) and shown at 600x100.
Run: python3 scripts/make-email-signal.py
"""
from PIL import Image, ImageDraw, ImageFilter

W, H, FRAMES = 1200, 200, 30
BG, DIM, LIME = (17, 17, 19), (42, 42, 47), (212, 248, 74)
BASE = 120

def signal_y(x: float) -> float:
    """Flat line with a heartbeat-style pulse every 400px."""
    p = (x - 140) % 400
    pts = [(0, 0), (30, 0), (45, 14), (60, 0), (75, -78), (92, 40), (108, 0), (150, 0), (170, -16), (190, 0), (400, 0)]
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        if x0 <= p <= x1:
            return BASE + y0 + (y1 - y0) * (p - x0) / (x1 - x0)
    return BASE

line = [(x, signal_y(x)) for x in range(0, W + 1, 2)]

frames = []
for f in range(FRAMES):
    head = int((f / FRAMES) * (W + 240)) - 120  # sweeps slightly past both edges so the loop is seamless
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    for gx in range(0, W, 40):  # faint grid dots
        for gy in range(20, H, 40):
            d.point((gx, gy), fill=(30, 30, 34))
    d.line(line, fill=DIM, width=4, joint='curve')
    trail = [(x, y) for x, y in line if head - 520 <= x <= head]
    glow = Image.new('RGB', (W, H), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for i in range(1, len(trail)):
        t = i / len(trail)  # 0 at the tail, 1 at the head
        c = tuple(int(BG[k] + (LIME[k] - BG[k]) * t ** 1.6) for k in range(3))
        d.line([trail[i - 1], trail[i]], fill=c, width=5)
        gd.line([trail[i - 1], trail[i]], fill=tuple(int(v * t ** 2 * 0.7) for v in LIME), width=14)
    if 0 <= head <= W:
        hy = signal_y(head)
        gd.ellipse([head - 22, hy - 22, head + 22, hy + 22], fill=(150, 175, 50))
    glow = glow.filter(ImageFilter.GaussianBlur(10))
    img = Image.fromarray(__import__('numpy').minimum(__import__('numpy').asarray(img, dtype='uint16') + __import__('numpy').asarray(glow, dtype='uint16'), 255).astype('uint8'))
    d = ImageDraw.Draw(img)
    if 0 <= head <= W:
        hy = signal_y(head)
        d.ellipse([head - 9, hy - 9, head + 9, hy + 9], fill=LIME)
    frames.append(img.quantize(colors=24, method=Image.Quantize.MEDIANCUT))

frames[0].save('public/email/signal.gif', save_all=True, append_images=frames[1:], duration=60, loop=0, optimize=True, disposal=1)
print('wrote public/email/signal.gif')
