"""
Generates the "Mann Patel." wordmark and the "MP" monogram as SVG outlines from
Bodoni Moda (SIL Open Font License 1.1), so the logo needs no web font.

Setup (once):  python3 -m venv .venv-logo && .venv-logo/bin/pip install fonttools brotli uharfbuzz
Run:           .venv-logo/bin/python scripts/make-logo.py

Outputs
  src/data/logo.json             path data used by src/components/Logo.astro
  public/brand/*.svg             standalone logo files (ink, light, monogram)
"""
import io, json, pathlib
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
import uharfbuzz as hb

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "node_modules/@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-standard-normal.woff2"
INK, PAPER, ACCENT, ACCENT_NIGHT = "#15171A", "#F4F1EA", "#D9481C", "#FF7A4D"

# Two masters: "display" for large sizes, "small" (lower optical size, heavier) for the header.
MASTERS = {
    "display": {"opsz": 72, "wght": 500, "tracking": -0.008},
    "small": {"opsz": 28, "wght": 600, "tracking": 0.0},
}


def instance(axes):
    font = TTFont(str(SRC))
    font.flavor = None
    inst = instancer.instantiateVariableFont(font, {"opsz": axes["opsz"], "wght": axes["wght"]})
    buf = io.BytesIO()
    inst.save(buf)
    data = buf.getvalue()
    return TTFont(io.BytesIO(data)), data


def shape(text, font, data, tracking):
    upem = font["head"].unitsPerEm
    hbfont = hb.Font(hb.Face(data))
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbfont, buf, {"kern": True, "liga": True})
    order = font.getGlyphOrder()
    glyphset = font.getGlyphSet()
    x = 0
    pieces = []  # (char_index, path_d, bounds)
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        name = order[info.codepoint]
        pen = SVGPathPen(glyphset)
        bpen = BoundsPen(glyphset)
        # font units → y-down SVG units
        t = (1, 0, 0, -1, x + pos.x_offset, -pos.y_offset)
        glyphset[name].draw(TransformPen(pen, t))
        glyphset[name].draw(TransformPen(bpen, t))
        pieces.append((info.cluster, pen.getCommands(), bpen.bounds))
        advance = pos.x_advance * (0.72 if text[info.cluster] == " " else 1)  # tighter word space
        x += advance + tracking * upem
    return pieces, upem


def build(text, master, dot_last=True):
    font, data = instance(master)
    pieces, upem = shape(text, font, data, master["tracking"])
    xs = [b for _, _, b in pieces if b]
    minx = min(b[0] for b in xs); miny = min(b[1] for b in xs)
    maxx = max(b[2] for b in xs); maxy = max(b[3] for b in xs)
    pad = upem * 0.02
    letters = " ".join(d for i, d, b in pieces if d and not (dot_last and text[i] == "."))
    dot = " ".join(d for i, d, b in pieces if d and dot_last and text[i] == ".")
    vb = [round(minx - pad, 1), round(miny - pad, 1), round(maxx - minx + 2 * pad, 1), round(maxy - miny + 2 * pad, 1)]
    return {"viewBox": " ".join(map(str, vb)), "letters": letters, "dot": dot, "ratio": round(vb[2] / vb[3], 4)}


def svg_file(entry, fill, dot_fill, bg=None, title="Mann Patel"):
    vb = entry["viewBox"].split()
    rect = f'<rect x="{vb[0]}" y="{vb[1]}" width="{vb[2]}" height="{vb[3]}" fill="{bg}"/>' if bg else ""
    dot = f'<path fill="{dot_fill}" d="{entry["dot"]}"/>' if entry["dot"] else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{entry["viewBox"]}" role="img" aria-label="{title}">'
            f'<title>{title}</title>{rect}<path fill="{fill}" d="{entry["letters"]}"/>{dot}</svg>\n')


out = {
    "wordmark": {k: build("Mann Patel.", m) for k, m in MASTERS.items()},
    "monogram": build("MP", {"opsz": 28, "wght": 800, "tracking": 0.03}, dot_last=False),
}
(ROOT / "src/data/logo.json").write_text(json.dumps(out, indent=1) + "\n")

brand = ROOT / "public/brand"
brand.mkdir(parents=True, exist_ok=True)
(brand / "mann-patel-wordmark.svg").write_text(svg_file(out["wordmark"]["display"], INK, ACCENT))
(brand / "mann-patel-wordmark-light.svg").write_text(svg_file(out["wordmark"]["display"], PAPER, ACCENT_NIGHT))
(brand / "mann-patel-wordmark-small.svg").write_text(svg_file(out["wordmark"]["small"], INK, ACCENT))
(brand / "mann-patel-monogram.svg").write_text(svg_file(out["monogram"], INK, ACCENT, title="MP"))
# Favicon: ink tile, paper monogram, accent dot.
m = out["monogram"]
mx, my, mw, mh = map(float, m["viewBox"].split())
scale = 46 / mw
tx, ty = 31 - (mw * scale) / 2 - mx * scale, 32 - (mh * scale) / 2 - my * scale
fav = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="{INK}"/>'
       f'<path fill="{PAPER}" transform="translate({tx:.2f} {ty:.2f}) scale({scale:.5f})" d="{m["letters"]}"/>'
       f'<circle cx="54" cy="52" r="3.4" fill="{ACCENT_NIGHT}"/></svg>\n')
(ROOT / "public/favicon.svg").write_text(fav)
print({k: v["ratio"] for k, v in out["wordmark"].items()}, "monogram", out["monogram"]["ratio"])
