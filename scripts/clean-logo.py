#!/usr/bin/env python3
"""Extract just the 'D' letter from the old dilizhans-show.ru logo.
- Crop to top portion (the D letter, remove text below)
- Remove white outline (make white-ish pixels transparent)
- Recolor yellow→gold, red→bronze
- Save with transparency (PNG)
"""
from PIL import Image, ImageDraw
import os

SRC = "/home/z/my-project/public/images/old-logo.png"
OUT = "/home/z/my-project/public/images/logo-clean.png"

# Target gold gradient colors
GOLD_TOP = (230, 199, 117)      # #E6C775 bright gold
GOLD_MID = (201, 169, 97)       # #C9A961 antique gold
BRONZE = (138, 111, 47)         # #8A6F2F deep bronze

def recolor_pixel(r, g, b, a, y_norm):
    """y_norm: 0 at top, 1 at bottom of the D letter area."""
    if a < 30:
        return (0, 0, 0, 0)
    # Detect white-ish pixels (the bad outline) — high R, G, B with low saturation
    max_c = max(r, g, b)
    min_c = min(r, g, b)
    sat = (max_c - min_c) / max_c if max_c > 0 else 0
    # white-ish = high brightness + low saturation + not transparent
    if max_c > 200 and sat < 0.15:
        return (0, 0, 0, 0)  # transparent (remove white outline)
    # Detect yellow/red gradient pixels (the D letter)
    # original gradient: yellow top (R=255, G=200+, B=0) to red bottom (R=200+, G=0-50, B=0)
    is_warm = r > 100 and r > g and r > b * 1.5
    if is_warm and a > 100:
        # Compute gold gradient based on y position
        if y_norm < 0.4:
            # Top 40%: bright gold
            t = y_norm / 0.4
            nr = int(GOLD_TOP[0] + (GOLD_MID[0] - GOLD_TOP[0]) * t)
            ng = int(GOLD_TOP[1] + (GOLD_MID[1] - GOLD_TOP[1]) * t)
            nb = int(GOLD_TOP[2] + (GOLD_MID[2] - GOLD_TOP[2]) * t)
        else:
            # Bottom 60%: gold → bronze
            t = (y_norm - 0.4) / 0.6
            nr = int(GOLD_MID[0] + (BRONZE[0] - GOLD_MID[0]) * t)
            ng = int(GOLD_MID[1] + (BRONZE[1] - GOLD_MID[1]) * t)
            nb = int(GOLD_MID[2] + (BRONZE[2] - GOLD_MID[2]) * t)
        # preserve original alpha
        return (max(0, min(255, nr)), max(0, min(255, ng)), max(0, min(255, nb)), a)
    # Other warm-ish pixels (text "Dilizhans-show" below): we'll crop those out anyway
    return (r, g, b, a)

def main():
    im = Image.open(SRC).convert("RGBA")
    w, h = im.size
    print(f"Original: {w}x{h}")

    # Crop to just the D letter (top ~65% of original)
    # Original 127x127: D takes top ~80 pixels, text below ~47 pixels
    crop_top = 0
    crop_bottom = int(h * 0.62)  # ~79 px for 127-tall — just the D
    cropped = im.crop((0, crop_top, w, crop_bottom))
    cw, ch = cropped.size
    print(f"Cropped to: {cw}x{ch}")

    # Recolor pixel by pixel
    pixels = cropped.load()
    for y in range(ch):
        y_norm = y / max(1, ch - 1)
        for x in range(cw):
            r, g, b, a = pixels[x, y]
            nr, ng, nb, na = recolor_pixel(r, g, b, a, y_norm)
            pixels[x, y] = (nr, ng, nb, na)

    # Trim transparent borders (find non-transparent bbox)
    bbox = cropped.getbbox()
    if bbox:
        # Add small padding around the D
        pad = 6
        left = max(0, bbox[0] - pad)
        top = max(0, bbox[1] - pad)
        right = min(cw, bbox[2] + pad)
        bottom = min(ch, bbox[3] + pad)
        cropped = cropped.crop((left, top, right, bottom))

    # Make it square (transparent pad) for clean rendering in a circle
    cw, ch = cropped.size
    target = max(cw, ch)
    square = Image.new("RGBA", (target, target), (0, 0, 0, 0))
    offset = ((target - cw) // 2, (target - ch) // 2)
    square.paste(cropped, offset, cropped)

    # Save
    square.save(OUT, "PNG")
    print(f"✅ saved {OUT}: {square.size} ({os.path.getsize(OUT)//1024} KB)")

if __name__ == "__main__":
    main()
