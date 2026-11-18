"""
The Λ's "signal gap" (Mann, 18 Nov 2026): a small slanted break in the Λ's right leg, like a pulse passing through.

The Λ is drawn as two pieces: the left leg, the top and the upper right leg as one, and the lower right leg on its own.
The break is a band between two parallel lines, set in proportions of the Λ's own box (as in the approved mock-up on a
628 × 710 Λ), so the same cut works for the wordmark's light Λ and the favicon's bold one.

Run:  python3 scripts/lambda_gap.py
It prints the paths used in src/components/ui/Wordmark.astro, src/styles/tokens.css (--lambda) and the brand SVGs in
public/brand/. scripts/make-favicon.py imports split_lambda() for the icon.
"""

# The band: line A through two points and line B through two points, as (x, y) shares of the Λ's box (y down).
LINE_A = ((380 / 628, 330 / 710), (640 / 628, 250 / 710))
LINE_B = ((400 / 628, 390 / 710), (660 / 628, 310 / 710))


def _line(p, q):
    """a·x + b·y = c through p and q."""
    a, b = q[1] - p[1], p[0] - q[0]
    return a, b, a * p[0] + b * p[1]


def _meet(l1, l2):
    a1, b1, c1 = l1
    a2, b2, c2 = l2
    d = a1 * b2 - a2 * b1
    return ((c1 * b2 - c2 * b1) / d, (a1 * c2 - a2 * c1) / d)


def split_lambda(pts):
    """
    pts: the Λ outline's seven corners, in any order (y down): two on the baseline at each side (outer and inner), two
    at the top, and the inner apex. Returns two polygons (lists of (x, y)): the main piece and the lower right leg.
    """
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    x0, y0, w, h = min(xs), min(ys), max(xs) - min(xs), max(ys) - min(ys)
    base = sorted([p for p in pts if abs(p[1] - (y0 + h)) < 1e-6 * max(1, h) + 1e-3], key=lambda p: p[0])
    top = sorted([p for p in pts if abs(p[1] - y0) < 1e-6 * max(1, h) + 1e-3], key=lambda p: p[0])
    inner = [p for p in pts if p not in base and p not in top]
    assert len(base) == 4 and len(top) == 2 and len(inner) == 1, (base, top, inner)
    outer_l, inner_l, inner_r, outer_r = base
    apex_l, apex_r = top
    apex_in = inner[0]
    box = lambda s: (x0 + s[0] * w, y0 + s[1] * h)
    a = _line(box(LINE_A[0]), box(LINE_A[1]))
    b = _line(box(LINE_B[0]), box(LINE_B[1]))
    outer_edge = _line(apex_r, outer_r)
    inner_edge = _line(apex_in, inner_r)
    a_out, a_in = _meet(a, outer_edge), _meet(a, inner_edge)
    b_out, b_in = _meet(b, outer_edge), _meet(b, inner_edge)
    main = [outer_l, apex_l, apex_r, a_out, a_in, apex_in, inner_l]
    lower = [b_out, outer_r, inner_r, b_in]
    return main, lower


def path(polys, digits=0):
    fmt = (lambda v: str(round(v))) if digits == 0 else (lambda v: f'{v:.{digits}f}'.rstrip('0').rstrip('.'))
    return ''.join('M' + ' '.join(f'{fmt(x)} {fmt(y)}' for x, y in poly) + 'Z' for poly in polys)


def wordmark_lambda(x):
    """The wordmark's Λ (Geist Regular outline, 628 × 710) with its left edge at x."""
    pts = [(x, 710), (x + 256, 0), (x + 372, 0), (x + 628, 710), (x + 534, 710), (x + 314, 75), (x + 94, 710)]
    return path(split_lambda(pts))


if __name__ == '__main__':
    print('wordmark Λ 1:', wordmark_lambda(1102))
    print('wordmark Λ 2:', wordmark_lambda(5131))
