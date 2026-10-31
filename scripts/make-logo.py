"""
Mann Patel logo system (v4): the name, and nothing else.

  Wordmark  "Mann Patel." set in Fraunces (Undercase Type, SIL Open Font License 1.1),
            a soft "Old Style" display serif, converted to outlines so the logo needs
            no web font. The full stop is the only colour: stamp orange.

  Two optical masters, like a foundry would cut them:
    display  opsz 144, lighter, finer contrast, tighter tracking: footer, share image,
             print, anything larger than ~48 px tall
    text     opsz 32, sturdier, slightly looser: the header and small screens

  Each letter is its own path so the site can animate them one by one
  (see src/components/Logo.astro).

Setup (once):  python3 -m venv .venv-logo && .venv-logo/bin/pip install fonttools brotli uharfbuzz
Run:           .venv-logo/bin/python scripts/make-logo.py   (needs `npm install` for the font)

Outputs
  src/data/logo.json                 per-letter geometry used by src/components/Logo.astro
  public/brand/*.svg                 standalone files: wordmark (ink / light), stacked,
                                     icon, and an animated wordmark
  public/favicon.svg                 app icon: "M." on an ink tile
"""
import io, json, pathlib
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
import uharfbuzz as hb

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2"
INK, PAPER, ACCENT, ACCENT_NIGHT = "#15171A", "#F4F1EA", "#D9481C", "#FF7A4D"
UNIT = 0.05  # font units (2000/em) -> logo units: 1 em = 100 units

# Optical masters. tracking/space are in em; kern adds optical pair adjustments (em).
MASTERS = {
    "display": {"axes": {"opsz": 144, "wght": 470, "SOFT": 50, "WONK": 0}, "tracking": -0.022, "space": 0.86,
                "kern": {("l", "."): 0.0}},
    "text": {"axes": {"opsz": 32, "wght": 560, "SOFT": 50, "WONK": 0}, "tracking": -0.008, "space": 0.9,
             "kern": {("l", "."): 0.0}},
    "stacked": {"axes": {"opsz": 72, "wght": 520, "SOFT": 50, "WONK": 0}, "tracking": -0.015, "space": 1.0,
                "kern": {("l", "."): 0.0}},
    "icon": {"axes": {"opsz": 18, "wght": 640, "SOFT": 50, "WONK": 0}, "tracking": 0.0, "space": 1.0,
             "kern": {("M", "."): -0.02}},
}


def ntos(v):
    s = f"{v:.1f}"
    s = s.rstrip("0").rstrip(".") if "." in s else s
    return "0" if s in ("-0", "") else s


def load(axes):
    font = TTFont(str(SRC))
    font.flavor = None
    inst = instancer.instantiateVariableFont(font, axes)
    buf = io.BytesIO()
    inst.save(buf)
    data = buf.getvalue()
    return TTFont(io.BytesIO(data)), hb.Font(hb.Face(data))


def set_line(text, master, dx=0.0, dy=0.0):
    """Shape `text` with HarfBuzz (kerning on) and return one outline per visible glyph."""
    cfg = MASTERS[master]
    font, hbfont = load(cfg["axes"])
    upem = font["head"].unitsPerEm
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbfont, buf, {"kern": True, "liga": True})
    order, gs = font.getGlyphOrder(), font.getGlyphSet()
    x, out = 0.0, []
    infos, poss = buf.glyph_infos, buf.glyph_positions
    for i, (info, pos) in enumerate(zip(infos, poss)):
        ch = text[info.cluster]
        name = order[info.codepoint]
        s = UNIT * 2000 / upem
        t = (s, 0, 0, -s, dx + (x + pos.x_offset) * s, dy - pos.y_offset * s)
        pen, bpen = SVGPathPen(gs, ntos=ntos), BoundsPen(gs)
        gs[name].draw(TransformPen(pen, t))
        gs[name].draw(TransformPen(bpen, t))
        if pen.getCommands():
            out.append({"ch": ch, "d": pen.getCommands(), "bounds": bpen.bounds})
        adv = pos.x_advance * (cfg["space"] if ch == " " else 1)
        nxt = text[infos[i + 1].cluster] if i + 1 < len(infos) else None
        extra = cfg["kern"].get((ch, nxt), 0) if nxt else 0
        x += adv + (cfg["tracking"] + extra) * upem if nxt else adv
    return out


def frame(glyphs, pad=(1.0, 1.0, 1.0, 0.6)):
    """Tight viewBox around the glyphs (left, top, right, bottom padding in units)."""
    x0 = min(g["bounds"][0] for g in glyphs) - pad[0]
    y0 = min(g["bounds"][1] for g in glyphs) - pad[1]
    x1 = max(g["bounds"][2] for g in glyphs) + pad[2]
    y1 = max(g["bounds"][3] for g in glyphs) + pad[3]
    return [round(x0, 1), round(y0, 1), round(x1 - x0, 1), round(y1 - y0, 1)]


def pack(glyphs, vb):
    letters = [{"ch": g["ch"], "d": g["d"]} for g in glyphs if g["ch"] != "."]
    stop = next(g for g in glyphs if g["ch"] == ".")
    return {"viewBox": " ".join(map(str, vb)), "letters": letters, "stop": stop["d"]}


logo = {}
for m in ("display", "text"):
    g = set_line("Mann Patel.", m)
    logo[m] = pack(g, frame(g))

# Stacked: "Mann" over "Patel.", centred, for square spaces (stamp, avatar).
l1 = set_line("Mann", "stacked")
l2 = set_line("Patel.", "stacked")
w1 = max(g["bounds"][2] for g in l1) - min(g["bounds"][0] for g in l1)
w2 = max(g["bounds"][2] for g in l2 if g["ch"] != ".") - min(g["bounds"][0] for g in l2)
lead = 82.0  # baseline-to-baseline, units (0.82 em: tight, display leading)
l1 = set_line("Mann", "stacked", dx=(w2 - w1) / 2)
l2 = set_line("Patel.", "stacked", dy=lead)
stacked = pack(l1 + l2, frame(l1 + l2, pad=(2, 2, 2, 1.5)))
stacked["lines"] = [len(l1), len([g for g in l2 if g["ch"] != "."])]
logo["stacked"] = stacked

icon = set_line("M.", "icon")
logo["icon"] = pack(icon, frame(icon, pad=(0, 0, 0, 0)))

(ROOT / "src/data/logo.json").write_text(json.dumps(logo, indent=1) + "\n")


# ── Standalone files ───────────────────────────────────────────────────────
def static_svg(part, ink, dot, label="Mann Patel"):
    p = logo[part]
    letters = "".join(f'<path d="{l["d"]}"/>' for l in p["letters"])
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{p["viewBox"]}" role="img" aria-label="{label}">'
            f'<title>{label}</title><g fill="{ink}">{letters}</g><path fill="{dot}" d="{p["stop"]}"/></svg>\n')


def animated_svg(ink, dot):
    """Self-contained motion version (plays once): letters rise, the stop drops, a glint passes."""
    p = logo["display"]
    vx, vy, vw, vh = map(float, p["viewBox"].split())
    letters = "".join(f'<path class="l" style="animation-delay:{120 + i * 55}ms" d="{l["d"]}"/>'
                      for i, l in enumerate(p["letters"]))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{p["viewBox"]}" role="img" aria-label="Mann Patel">
<title>Mann Patel</title>
<style>
.l{{fill:url(#glint);transform-box:fill-box;animation:rise 900ms cubic-bezier(.16,1,.3,1) both}}
.s{{fill:{dot};transform-box:fill-box;transform-origin:50% 100%;animation:drop 760ms cubic-bezier(.3,1.5,.5,1) 760ms both}}
@keyframes rise{{from{{transform:translateY(105%);opacity:0}}to{{transform:none;opacity:1}}}}
@keyframes drop{{0%{{transform:translateY(-260%) scale(.6);opacity:0}}60%{{opacity:1}}75%{{transform:translateY(0) scale(1.18,.82)}}to{{transform:none}}}}
@media (prefers-reduced-motion:reduce){{.l,.s{{animation:none}}}}
</style>
<defs><linearGradient id="glint" gradientUnits="userSpaceOnUse" x1="{vx}" x2="{vx + vw}" y1="0" y2="0" gradientTransform="translate({-vw * 0.62:.1f} 0)">
<stop offset="0" stop-color="{ink}"/><stop offset=".42" stop-color="{ink}"/><stop offset=".5" stop-color="{dot}"/>
<stop offset=".58" stop-color="{ink}"/><stop offset="1" stop-color="{ink}"/>
<animateTransform attributeName="gradientTransform" type="translate" from="{-vw * 0.62:.1f} 0" to="{vw * 0.62:.1f} 0" dur="1.1s" begin="1.25s" fill="freeze"/>
</linearGradient></defs>
<g>{letters}</g><path class="s" d="{p["stop"]}"/>
</svg>
'''


brand = ROOT / "public/brand"
brand.mkdir(parents=True, exist_ok=True)
for old in brand.glob("*.svg"):
    old.unlink()
(brand / "mann-patel-wordmark.svg").write_text(static_svg("display", INK, ACCENT))
(brand / "mann-patel-wordmark-light.svg").write_text(static_svg("display", PAPER, ACCENT_NIGHT))
(brand / "mann-patel-wordmark-small.svg").write_text(static_svg("text", INK, ACCENT))
(brand / "mann-patel-wordmark-stacked.svg").write_text(static_svg("stacked", INK, ACCENT))
(brand / "mann-patel-wordmark-animated.svg").write_text(animated_svg(INK, ACCENT))

# App icon: paper "M" and an orange stop on an ink tile, optically centred.
ic = logo["icon"]
ix, iy, iw, ih = map(float, ic["viewBox"].split())
size, box = 64, 40.0
k = box / max(iw, ih)
tx, ty = (size - iw * k) / 2 - ix * k + 0.6, (size - ih * k) / 2 - iy * k
icon_inner = "".join(f'<path d="{l["d"]}"/>' for l in ic["letters"])
icon_svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="{INK}"/>'
            f'<g transform="translate({tx:.2f} {ty:.2f}) scale({k:.4f})"><g fill="{PAPER}">{icon_inner}</g>'
            f'<path fill="{ACCENT_NIGHT}" d="{ic["stop"]}"/></g></svg>\n')
(ROOT / "public/favicon.svg").write_text(icon_svg)
(brand / "mann-patel-icon.svg").write_text(icon_svg.replace("<svg ", '<svg role="img" aria-label="Mann Patel" ', 1))

for m in ("display", "text", "stacked", "icon"):
    print(m, logo[m]["viewBox"], sum(len(l["d"]) for l in logo[m]["letters"]), "chars")
