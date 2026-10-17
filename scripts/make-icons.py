"""Generate Sudoku Journey app icons: a black 3x3 sudoku block on white.

Usage (needs Pillow: pip install pillow):  python3 scripts/make-icons.py assets
"""
import sys
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1]
SS = 4  # supersampling factor for smooth edges
BLACK = (17, 17, 17, 255)  # matches theme primary #111111
WHITE = (255, 255, 255, 255)
FONT = '/System/Library/Fonts/Avenir Next.ttc'
FONT_DEMI = 2

# (row, col) -> digit; the centre cell is "selected" (filled black).
DIGITS = {(0, 0): '1', (1, 1): '5', (2, 2): '9'}
FILLED = {(1, 1)}


def draw_logo(img, cx, cy, size):
    d = ImageDraw.Draw(img)
    outer = size * 0.075
    inner = size * 0.03
    radius = size * 0.2
    x0, y0 = cx - size / 2, cy - size / 2
    x1, y1 = x0 + size, y0 + size

    # Outer rounded frame (black block, then white interior).
    d.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=BLACK)
    ix0, iy0, ix1, iy1 = x0 + outer, y0 + outer, x1 - outer, y1 - outer
    d.rounded_rectangle([ix0, iy0, ix1, iy1], radius=radius - outer, fill=WHITE)

    cell = (ix1 - ix0) / 3
    font = ImageFont.truetype(FONT, int(cell * 0.62), index=FONT_DEMI)

    for (r, c) in FILLED:
        cx0, cy0 = ix0 + c * cell, iy0 + r * cell
        d.rectangle([cx0, cy0, cx0 + cell, cy0 + cell], fill=BLACK)

    # Inner grid lines.
    for i in (1, 2):
        x = ix0 + i * cell
        y = iy0 + i * cell
        d.rectangle([x - inner / 2, iy0, x + inner / 2, iy1], fill=BLACK)
        d.rectangle([ix0, y - inner / 2, ix1, y + inner / 2], fill=BLACK)

    for (r, c), digit in DIGITS.items():
        mx = ix0 + (c + 0.5) * cell
        my = iy0 + (r + 0.5) * cell
        color = WHITE if (r, c) in FILLED else BLACK
        d.text((mx, my), digit, font=font, fill=color, anchor='mm')


def render(w, h, logo_frac, bg, name):
    big = Image.new('RGBA', (w * SS, h * SS), bg)
    draw_logo(big, w * SS / 2, h * SS / 2, min(w, h) * SS * logo_frac)
    big.resize((w, h), Image.LANCZOS).save(f'{OUT}/{name}')
    print('wrote', name)


# Full icon (iOS + legacy Android): white background, logo fills most of it.
render(1024, 1024, 0.68, WHITE, 'icon.png')
# Android adaptive foreground: transparent, logo inside the 66% safe circle.
render(1024, 1024, 0.52, (0, 0, 0, 0), 'adaptive-icon.png')
# Splash image: logo only on white; app.json scales it with resizeMode contain.
render(1024, 1024, 0.5, WHITE, 'splash-icon.png')
