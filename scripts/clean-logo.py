#!/usr/bin/env python3
"""Extract just the 'D' letter from the old dilizhans-show.ru logo — NO cropping of the D itself.
- Crop to top portion keeping FULL D letter (more generous crop)
- Remove white outline (white-ish pixels → transparent)
- Recolor yellow→gold gradient, red→bronze
- Save with transparent background + small padding
"""
from PIL import Image, ImageOps
import os

SRC = "/home/z/my-project/public/images/old-logo.png"
OUT = "/home/z/my-project/public/images/logo-clean.png"

GOLD_TOP = (230, 199, 117)     # #E6C775
GOLD_MID = (201, 169, 97)      # #C9A961
BRONZE = (138, 111, 47)        # #8A6F2F

def recolor_pixel(r, g, b, a, y_norm):
    if a < 30:
        return (0, 0, 0, 0)
    max_c = max(r, g, b)
    min_c = min(r, g, b)
    sat = (max_c - min_c) / max_c if max_c > 0 else 0
    # White outline = high brightness + very low saturation
    if max_c > 200 and sat < 0.12:
        return (0, 0, 0, 0)
    # Detect warm/yellow/red gradient (the D letter)
    is_warm = r > 100 and r > g and r > b * 1.4
    if is_warm and a > 100:
        if y_norm < 0.4:
            t = y_norm / 0.4
            nr = int(GOLD_TOP[0] + (GOLD_MID[0] - GOLD_TOP[0]) * t)
            ng = int(GOLD_TOP[1] + (GOLD_MID[1] - GOLD_TOP[1]) * t)
            nb = int(GOLD_TOP[2] + (GOLD_MID[2] - GOLD_TOP[2]) * t)
        else:
            t = (y_norm - 0.4) / 0.6
            nr = int(GOLD_MID[0] + (BRONZE[0] - GOLD_MID[0]) * t)
            ng = int(GOLD_MID[1] + (BRONZE[1] - GOLD_MID[1]) * t)
            nb = int(GOLD_MID[2] + (BRONZE[2] - GOLD_MID[2]) * t)
        return (max(0, min(255, nr)), max(0, min(255, ng)), max(0, min(255, nb)), a)
    return (r, g, b, a)

def main():
    im = Image.open(SRC).convert("RGBA")
    w, h = im.size
    print(f"Original: {w}x{h}")

    # Crop more generously — keep entire D letter (top ~70%)
    crop_bottom = int(h * 0.70)
    cropped = im.crop((0, 0, w, crop_bottom))
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

    # Trim transparent borders
    bbox = cropped.getbbox()
    if bbox:
        pad = 10
        left = max(0, bbox[0] - pad)
        top = max(0, bbox[1] - pad)
        right = min(cw, bbox[2] + pad)
        bottom = min(ch, bbox[3] + pad)
        cropped = cropped.crop((left, top, right, bottom))

    # Save with transparent background
    cropped.save(OUT, "PNG")
    print(f"✅ saved {OUT}: {cropped.size} ({os.path.getsize(OUT)//1024} KB)")

if __name__ == "__main__":
    main()
