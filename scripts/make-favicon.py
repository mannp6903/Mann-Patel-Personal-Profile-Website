"""
Builds public/favicon.svg: the stacked MΛNN / PΛTEL app icon (black tile, white letters, lime Λ's).

The letters are outlined from the site's own Geist variable font at a bold weight, so the icon
stays legible at 16-48 px. Both lines are justified to the same width, and the block sits inside
the circle Google crops search-result icons to, so no letter is cut off.

Run:  pip install fonttools brotli && python3 scripts/make-favicon.py && npm run images
(`npm run images` then rasterises favicon.svg into favicon.ico, the PNG sizes and apple-touch-icon.png.)
"""
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / 'public/fonts/geist-sans-wght.woff2'
OUT = ROOT / 'public/favicon.svg'

WEIGHT = 700
TILE = 512  # viewBox size
RADIUS = 112  # tile corner radius (browser tabs, home screens); Google crops to a circle anyway
INK, WHITE, LIME = '#0b0b0c', '#f2f1ec', '#d4f84a'

# Fit the two-line block inside the inscribed circle with breathing room: the block's diagonal
# is at most this share of the tile (1.0 would touch the circle).
DIAGONAL = 0.9
LINE_GAP = 0.36  # space between the lines, as a share of the cap height
GAP = 0.15  # space between letters (ink to ink), as a share of the cap height
# Optical spacing: the Λ's slanted sides read as extra space, so its neighbours move in.
PAIR = {('M', 'Lambda'): -0.06, ('Lambda', 'N'): -0.06, ('P', 'Lambda'): -0.05, ('Lambda', 'T'): -0.11}

LINES = [['M', 'Lambda', 'N', 'N'], ['P', 'Lambda', 'T', 'E', 'L']]

font = instantiateVariableFont(TTFont(FONT), {'wght': WEIGHT})
glyphs = font.getGlyphSet()
cap = font['OS/2'].sCapHeight


def ink_bounds(name):
    pen = BoundsPen(glyphs)
    glyphs[name].draw(pen)
    return pen.bounds  # xMin, yMin, xMax, yMax


def layout(line, extra=0.0):
    """Ink-box placement: returns [(glyph, x offset in font units)], line width."""
    x, placed, prev = 0.0, [], None
    for i, g in enumerate(line):
        x0, _, x1, _ = ink_bounds(g)
        if prev is not None:
            x += (GAP + PAIR.get((prev, g), 0.0)) * cap + extra
        placed.append((g, x - x0))
        x += x1 - x0
        prev = g
    return placed, x


widths = [layout(line)[1] for line in LINES]
target = max(widths)
# Justify: spread the shorter line's missing width over its gaps.
rows = [layout(line, (target - w) / (len(line) - 1))[0] for line, w in zip(LINES, widths)]

block_h = cap * (2 + LINE_GAP)
scale = DIAGONAL * TILE / (target**2 + block_h**2) ** 0.5
left = (TILE - target * scale) / 2
top = (TILE - block_h * scale) / 2


def path_for(name, dx, baseline_y):
    pen = SVGPathPen(glyphs, ntos=lambda v: f'{v:.1f}'.rstrip('0').rstrip('.'))
    # Font units are y-up; flip into SVG's y-down space and place on this line's baseline.
    glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, left + dx * scale, baseline_y)))
    return pen.getCommands()


white, lime = [], []
for i, row in enumerate(rows):
    baseline = top + (cap + i * cap * (1 + LINE_GAP)) * scale
    for g, dx in row:
        (lime if g == 'Lambda' else white).append(path_for(g, dx, baseline))

svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {TILE} {TILE}">'
    f'<rect width="{TILE}" height="{TILE}" rx="{RADIUS}" fill="{INK}"/>'
    f'<path fill="{WHITE}" d="{"".join(white)}"/>'
    f'<path fill="{LIME}" d="{"".join(lime)}"/>'
    '</svg>\n'
)
OUT.write_text(svg)
print(f'wrote {OUT.relative_to(ROOT)} ({len(svg)} bytes); block {target * scale:.0f}x{block_h * scale:.0f} of {TILE}')
