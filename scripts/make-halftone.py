"""
The hero portrait's halftone print (22 Nov 2026): Mann's cut-out drawn as a field of round dots, bigger where the photo
is brighter, the same size as the cut-out so the two stack exactly. On Home the print is laid over the photo for a
moment, as a dotted veil, then fades to leave the real photo ("developing"; src/components/home/HeroPortrait.astro).
It is fetched only after the photo has painted, so it never delays the largest paint.

Run after changing the cut-out:
    python3 scripts/make-halftone.py
Needs Pillow (pip install pillow). Writes src/assets/mann-patel-halftone.png: warm white dots on the silhouette, which
is veiled in the page's dark at 60%, so the dots read against the photo while it stays visible underneath.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageStat

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src/assets/mann-patel-cutout.png'
OUT = ROOT / 'src/assets/mann-patel-halftone.png'

CELL = 8  # px between dot centres in the source (914 px wide: about 114 dots across)
INK = (242, 241, 236)  # --text, the site's warm white
SCALE = 4  # draw large, then reduce, for smooth dot edges

src = Image.open(SRC).convert('RGBA')
w, h = src.size
grey = src.convert('L')
alpha = src.split()[-1]

# One sample per cell: how much of it is the figure, and how bright it is.
cells = []
for cy in range(CELL // 2, h, CELL):
    for cx in range(CELL // 2, w, CELL):
        box = (cx - CELL // 2, cy - CELL // 2, cx + CELL // 2, cy + CELL // 2)
        a = ImageStat.Stat(alpha.crop(box)).mean[0] / 255
        if a < 0.35:
            continue
        cells.append((cx, cy, a, ImageStat.Stat(grey.crop(box)).mean[0] / 255))

# Stretch the figure's own brightness range (5th to 97th percentile) so the face reads: the photo is dark overall.
lums = sorted(c[3] for c in cells)
lo, hi = lums[int(len(lums) * 0.05)], lums[int(len(lums) * 0.97)]

# The silhouette is veiled in the page's dark (--bg-2) at 60%: the dots stand out and the photo stays in view under them.
FILL = (18, 18, 17)
VEIL = 0.6
base = Image.new('RGBA', (w, h), FILL + (0,))
base.putalpha(alpha.point(lambda v: int(v * VEIL)))
big = base.resize((w * SCALE, h * SCALE), Image.LANCZOS)
draw = ImageDraw.Draw(big)
for cx, cy, a, lum in cells:
    t = min(1.0, max(0.0, (lum - lo) / (hi - lo)))
    # Small dots in the shadows, full dots in the highlights; never quite touching.
    r = (CELL / 2) * 0.95 * (0.14 + 0.86 * t**0.9) * min(1.0, a)
    if r < 0.5:
        continue
    x, y, rr = cx * SCALE, cy * SCALE, r * SCALE
    draw.ellipse((x - rr, y - rr, x + rr, y + rr), fill=INK + (255,))
big.resize((w, h), Image.LANCZOS).save(OUT, optimize=True)
print(f'wrote {OUT.relative_to(ROOT)} ({w} x {h})')
