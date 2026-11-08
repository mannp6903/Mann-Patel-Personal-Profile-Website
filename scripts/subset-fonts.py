#!/usr/bin/env python3
"""Subset the site's web fonts to the characters the site uses (round 6).

    pip install fonttools brotli
    python3 scripts/subset-fonts.py

Reads the Fontsource latin files in public/fonts/ (kept as the sources, and still used by
scripts/make-images.mjs) and writes the smaller files the pages load:

    signal-sans-wdth-wght.woff2   Mona Sans, renamed "Signal Sans" ("Mona" is a Reserved Font Name
                                  under the SIL OFL, so a modified version must not use it)
    geist-mono-wght.sub.woff2     Geist Mono
    instrument-serif-italic.sub.woff2  Instrument Serif Italic

Characters: printable ASCII plus the punctuation and arrows the copy uses. Anything else (for
example an accented letter typed into the form) falls back to the metric-matched system font,
because tokens.css limits each @font-face to the same unicode-range. If the copy starts using a
new character, add it to UNICODES (and to the unicode-range in src/styles/tokens.css), then
re-run this script and give the output files new names (they are cached as immutable).
"""
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

FONTS = Path(__file__).resolve().parent.parent / "public" / "fonts"
UNICODES = (
    "U+0020-007E,U+00A0,U+00A9,U+00B0,U+00B7,U+00D7,"
    "U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2022,U+2026,U+2191,U+2192,U+2193"
)

JOBS = [
    ("mona-sans-latin-wdth-wght.woff2", "signal-sans-wdth-wght.woff2", "Signal Sans"),
    ("geist-mono-latin-wght.woff2", "geist-mono-wght.sub.woff2", None),
    ("instrument-serif-latin-400-italic.woff2", "instrument-serif-italic.sub.woff2", None),
]


def rename(font: TTFont, family: str) -> None:
    """Replace the family name everywhere it appears in the name table."""
    old = font["name"].getDebugName(1) or ""
    for rec in font["name"].names:
        text = rec.toUnicode()
        if old and old in text:
            rec.string = text.replace(old, family)
        elif "Mona" in text and rec.nameID in (1, 3, 4, 6, 16, 21, 25):
            rec.string = text.replace("Mona Sans", family).replace("MonaSans", family.replace(" ", "")).replace("Mona", family)


def main() -> None:
    for src, dst, family in JOBS:
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.layout_features = ["*"]
        opts.hinting = False
        opts.desubroutinize = True
        opts.name_IDs = ["*"]
        opts.notdef_outline = True
        font = subset.load_font(str(FONTS / src), opts)
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=subset.parse_unicodes(UNICODES))
        sub.subset(font)
        if family:
            rename(font, family)
        subset.save_font(font, str(FONTS / dst), opts)
        print(f"{src} {(FONTS / src).stat().st_size:>7} B -> {dst} {(FONTS / dst).stat().st_size:>7} B")


if __name__ == "__main__":
    main()
