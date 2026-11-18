"""
The wordmark's small-size cut (design upgrade gate C4, Mann's approval 18 Nov 2026): MΛNN PΛTEL outlined from Geist
Medium (weight 500) with +20% tracking, for uses under 20px tall (the header). The regular cut in Wordmark.astro is Geist
Regular with +26% tracking; thin Regular strokes read faint at 13-16px.

The layout copies the regular cut's spacing: the gap between one letter's advance and the next letter's origin, with
its optical pairs (the Λ's slanted sides read as extra space) and the word space, each 60 units (6% of the em) tighter.
Each Λ keeps the signal gap (scripts/lambda_gap.py).

Run:  pip install fonttools brotli && python3 scripts/wordmark_cut.py
It prints the `small` letters for src/components/ui/Wordmark.astro and its viewBox.
"""
import json
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

from lambda_gap import path as gap_path, split_lambda

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / 'public/fonts/geist-sans-wght.woff2'
WEIGHT = 500
TRACKING_DELTA = -60  # +26% (regular cut) → +20%, in font units (1000 to the em)
CAP = 710

ORDER = ['M', 'Lambda', 'N', 'N', 'P', 'Lambda', 'T', 'E', 'L']
# The regular cut's gaps (font units) between a letter's advance end and the next letter's origin, read from
# Wordmark.astro: tracking 260 with the optical pairs M-Λ, Λ-N, N-N, P-Λ, Λ-T, T-E, E-L, and the word space N-P.
REGULAR_GAPS = [205, 195, 240, 630, 160, 105, 240, 260]

font = instantiateVariableFont(TTFont(FONT), {'wght': WEIGHT})
glyphs, hmtx = font.getGlyphSet(), font['hmtx']


def outline(name, x):
    transform = (1, 0, 0, -1, x, CAP)  # font units are y-up; SVG is y-down, baseline at the cap height
    if name == 'Lambda':
        rec = RecordingPen()
        glyphs[name].draw(TransformPen(rec, transform))
        pts = [args[0] for op, args in rec.value if op in ('moveTo', 'lineTo')]
        return gap_path(split_lambda(pts))
    pen = SVGPathPen(glyphs, ntos=lambda v: str(round(v)))
    glyphs[name].draw(TransformPen(pen, transform))
    return pen.getCommands()


x, letters = 0.0, []
for i, name in enumerate(ORDER):
    bounds = BoundsPen(glyphs)
    glyphs[name].draw(bounds)
    x0, _, x1, _ = bounds.bounds
    letters.append({'d': outline(name, x), 'c': round(x + (x0 + x1) / 2), 'lam': name == 'Lambda', 'x0': round(x + x0), 'x1': round(x + x1)})
    if i < len(REGULAR_GAPS):
        x += hmtx[name][0] + REGULAR_GAPS[i] + TRACKING_DELTA

left, right = letters[0]['x0'], letters[-1]['x1']
print(f"viewBox: '{left} 0 {right - left} {CAP}'")
for l in letters:
    lam = ', lam: true' if l['lam'] else ''
    print(f"    {{ d: {json.dumps(l['d'])}, c: {l['c']}{lam} }},")
