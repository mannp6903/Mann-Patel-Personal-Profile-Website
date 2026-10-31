"""
Mann Patel logo system.

  Monogram  — a custom "MP" ligature: the M's last stroke is also the P's stem,
              finished with a stamp-orange square (the brand's full stop).
              Hand-built geometry (see MONOGRAM below), no font involved.
  Wordmark  — "MANN PATEL" in Archivo Expanded Bold (wdth 125, wght 760,
              SIL Open Font License 1.1), tracked +0.16em, converted to outlines
              with HarfBuzz kerning so the logo needs no web font.

Setup (once):  python3 -m venv .venv-logo && .venv-logo/bin/pip install fonttools brotli uharfbuzz
Run:           .venv-logo/bin/python scripts/make-logo.py

Outputs
  src/data/logo.json          geometry used by src/components/Logo.astro
  public/brand/*.svg          standalone files: lockup (light/dark), monogram, wordmark
  public/favicon.svg          app icon (ink tile, paper monogram, accent square)
"""
import io, json, pathlib
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
import uharfbuzz as hb

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "node_modules/@fontsource-variable/archivo/files/archivo-latin-standard-normal.woff2"
INK, PAPER, ACCENT, ACCENT_NIGHT = "#15171A", "#F4F1EA", "#D9481C", "#FF7A4D"

# ── Monogram geometry (viewBox units) ──────────────────────────────────────
MONOGRAM = {
    "viewBox": "-4 -4 124 108",
    "stroke": 20,
    # M: left stem, diagonal down to the V, diagonal up into the shared stem.
    "m": "M10 100 V10 L41 66 L72 10 V100",
    # P bowl, drawn from the shared stem.
    "p": "M72 10 H90 a20 20 0 0 1 0 40 H72",
    # The full stop.
    "dot": {"x": 104, "y": 84, "w": 14, "h": 14},
}


def wordmark(text, wdth=125, wght=760, tracking=0.16):
    font = TTFont(str(SRC))
    font.flavor = None
    inst = instancer.instantiateVariableFont(font, {"wdth": wdth, "wght": wght})
    buf = io.BytesIO()
    inst.save(buf)
    data = buf.getvalue()
    font = TTFont(io.BytesIO(data))
    upem = font["head"].unitsPerEm
    hbfont = hb.Font(hb.Face(data))
    b = hb.Buffer()
    b.add_str(text)
    b.guess_segment_properties()
    hb.shape(hbfont, b, {"kern": True})
    order, glyphs = font.getGlyphOrder(), font.getGlyphSet()
    x, paths, bounds = 0, [], []
    for info, pos in zip(b.glyph_infos, b.glyph_positions):
        name = order[info.codepoint]
        t = (1, 0, 0, -1, x + pos.x_offset, -pos.y_offset)
        pen, bpen = SVGPathPen(glyphs), BoundsPen(glyphs)
        glyphs[name].draw(TransformPen(pen, t))
        glyphs[name].draw(TransformPen(bpen, t))
        if pen.getCommands():
            paths.append(pen.getCommands())
            bounds.append(bpen.bounds)
        x += pos.x_advance + tracking * upem * (0.5 if text[info.cluster] == " " else 1)
    minx = min(bb[0] for bb in bounds); maxx = max(bb[2] for bb in bounds)
    top = min(bb[1] for bb in bounds); base = max(bb[3] for bb in bounds)
    vb = [round(minx, 1), round(top, 1), round(maxx - minx, 1), round(base - top, 1)]
    return {"viewBox": " ".join(map(str, vb)), "d": " ".join(paths), "ratio": round(vb[2] / vb[3], 4)}


def monogram_svg(fill, dot):
    m, d = MONOGRAM, MONOGRAM["dot"]
    return (f'<g fill="none" stroke="{fill}" stroke-width="{m["stroke"]}" stroke-linejoin="miter" stroke-miterlimit="3">'
            f'<path d="{m["m"]}"/><path d="{m["p"]}"/></g>'
            f'<rect x="{d["x"]}" y="{d["y"]}" width="{d["w"]}" height="{d["h"]}" fill="{dot}"/>')


word = wordmark("MANN PATEL")

# Lockup: monogram is 100 units tall; wordmark cap height is 42% of it, centred vertically.
mx, my, mw, mh = map(float, MONOGRAM["viewBox"].split())
wx, wy, ww, wh = map(float, word["viewBox"].split())
cap, gap = 42.0, 26
scale = cap / wh
lock_w = mw + gap + ww * scale
lock = {
    "viewBox": f"{mx} {my} {round(lock_w, 1)} {mh}",
    "wordTransform": f"translate({round(mx + mw + gap - wx * scale, 2)} {round(my + (mh - cap) / 2 - wy * scale, 2)}) scale({round(scale, 6)})",
}
(ROOT / "src/data/logo.json").write_text(json.dumps({"monogram": MONOGRAM, "wordmark": word, "lockup": lock}, indent=1) + "\n")


def lockup_file(ink, dot):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{lock["viewBox"]}" role="img" aria-label="Mann Patel">'
            f'<title>Mann Patel</title>{monogram_svg(ink, dot)}'
            f'<path fill="{ink}" transform="{lock["wordTransform"]}" d="{word["d"]}"/></svg>\n')


brand = ROOT / "public/brand"
brand.mkdir(parents=True, exist_ok=True)
for old in brand.glob("*.svg"):
    old.unlink()
(brand / "mann-patel-lockup.svg").write_text(lockup_file(INK, ACCENT))
(brand / "mann-patel-lockup-light.svg").write_text(lockup_file(PAPER, ACCENT_NIGHT))
(brand / "mann-patel-monogram.svg").write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{MONOGRAM["viewBox"]}" role="img" aria-label="MP"><title>MP</title>{monogram_svg(INK, ACCENT)}</svg>\n')
(brand / "mann-patel-wordmark.svg").write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{word["viewBox"]}" role="img" aria-label="Mann Patel"><title>Mann Patel</title><path fill="{INK}" d="{word["d"]}"/></svg>\n')

# App icon: ink tile with the paper monogram.
(ROOT / "public/favicon.svg").write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="{INK}"/>'
    f'<g transform="translate(13 13.5) scale(0.33)">{monogram_svg(PAPER, ACCENT_NIGHT)}</g></svg>\n')
print("wordmark ratio", word["ratio"], "lockup", lock["viewBox"])
