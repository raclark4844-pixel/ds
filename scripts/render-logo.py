#!/usr/bin/env python3
"""Rasterize the Demore Technology Solutions orbital lockup."""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = Path("/workspace/public")
FONT = "/tmp/fonts/Syne-Bold.ttf"
BG = (5, 5, 5, 255)
GREEN = (0, 255, 156, 255)
YELLOW = (255, 225, 74, 255)
RED = (255, 42, 58, 255)


def ellipse_points(cx, cy, rx, ry, angle_deg, steps=720):
    a = math.radians(angle_deg)
    ca, sa = math.cos(a), math.sin(a)
    pts = []
    for i in range(steps + 1):
        t = 2 * math.pi * i / steps
        x = rx * math.cos(t)
        y = ry * math.sin(t)
        pts.append((cx + x * ca - y * sa, cy + x * sa + y * ca))
    return pts


def axis_ends(cx, cy, rx, angle_deg):
    a = math.radians(angle_deg)
    dx, dy = rx * math.cos(a), rx * math.sin(a)
    return (cx + dx, cy + dy), (cx - dx, cy - dy)


def draw_mark(size: int, glow: bool = True) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cx = cy = size / 2
    scale = size / 200
    rx, ry = 72 * scale, 26 * scale
    stroke = max(3, int(7 * scale))
    node_r = max(4, int(7.5 * scale))
    rings = [(0, GREEN), (60, YELLOW), (120, RED)]

    glow_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow_layer)
    line_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ldraw = ImageDraw.Draw(line_layer)
    node_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ndraw = ImageDraw.Draw(node_layer)

    for ang, color in rings:
        pts = ellipse_points(cx, cy, rx, ry, ang)
        gdraw.line(pts, fill=color, width=stroke + int(4 * scale), joint="curve")
        ldraw.line(pts, fill=color, width=stroke, joint="curve")
        p1, p2 = axis_ends(cx, cy, rx, ang)
        for p in (p1, p2):
            x, y = p
            ndraw.ellipse(
                (x - node_r, y - node_r, x + node_r, y + node_r),
                fill=color,
            )

    if glow:
        glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=3.2 * scale))
        img = Image.alpha_composite(img, glow_layer)
    img = Image.alpha_composite(img, line_layer)
    img = Image.alpha_composite(img, node_layer)
    return img


def gradient_text(text: str, font: ImageFont.FreeTypeFont):
    dummy = Image.new("L", (1, 1))
    d = ImageDraw.Draw(dummy)
    bbox = d.textbbox((0, 0), text, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad = 4
    mask = Image.new("L", (w + pad * 2, h + pad * 2), 0)
    ImageDraw.Draw(mask).text((pad - bbox[0], pad - bbox[1]), text, font=font, fill=255)
    grad = Image.new("RGBA", mask.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(grad)
    stops = [
        (0.0, (236, 240, 245, 255)),
        (0.28, (168, 176, 186, 255)),
        (0.52, (220, 225, 232, 255)),
        (0.78, (140, 148, 158, 255)),
        (1.0, (198, 204, 212, 255)),
    ]
    for y in range(mask.size[1]):
        t = y / max(1, mask.size[1] - 1)
        col = stops[-1][1]
        for i in range(len(stops) - 1):
            a0, c0 = stops[i]
            a1, c1 = stops[i + 1]
            if a0 <= t <= a1:
                u = (t - a0) / (a1 - a0) if a1 > a0 else 0
                col = tuple(int(c0[k] + (c1[k] - c0[k]) * u) for k in range(4))
                break
        gd.line([(0, y), (mask.size[0], y)], fill=col)
    grad.putalpha(mask)
    return grad


def spaced_text(text: str, font: ImageFont.FreeTypeFont, tracking: int):
    glyphs = [gradient_text(ch, font) for ch in text]
    total = sum(g.size[0] for g in glyphs) + tracking * (len(glyphs) - 1)
    h = max(g.size[1] for g in glyphs)
    canvas = Image.new("RGBA", (total, h), (0, 0, 0, 0))
    x = 0
    for i, g in enumerate(glyphs):
        canvas.alpha_composite(g, (x, (h - g.size[1]) // 2))
        x += g.size[0] + (tracking if i < len(glyphs) - 1 else 0)
    return canvas


def lockup() -> Image.Image:
    mark = draw_mark(360, glow=True)
    title_font = ImageFont.truetype(FONT, 152)
    sub_font = ImageFont.truetype(FONT, 28)
    title = gradient_text("DEMORE", title_font)
    sub = spaced_text("TECHNOLOGY SOLUTIONS", sub_font, 10)
    gap = 36
    text_w = max(title.size[0], sub.size[0])
    text_h = title.size[1] + 10 + sub.size[1]
    width = mark.size[0] + gap + text_w + 24
    height = max(mark.size[1], text_h + 24)
    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    mark_y = (height - mark.size[1]) // 2
    canvas.alpha_composite(mark, (0, mark_y))
    tx = mark.size[0] + gap
    ty = (height - text_h) // 2
    canvas.alpha_composite(title, (tx, ty))
    canvas.alpha_composite(sub, (tx, ty + title.size[1] + 10))
    bbox = canvas.getbbox()
    if bbox:
        canvas = canvas.crop(bbox)
    return canvas


def fit_on_bg(src: Image.Image, box: tuple[int, int], pad: int, bg: tuple[int, int, int, int]) -> Image.Image:
    w, h = box
    out = Image.new("RGBA", (w, h), bg)
    max_w, max_h = w - pad * 2, h - pad * 2
    scale = min(max_w / src.size[0], max_h / src.size[1])
    nw, nh = int(src.size[0] * scale), int(src.size[1] * scale)
    resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
    out.alpha_composite(resized, ((w - nw) // 2, (h - nh) // 2))
    return out


def to_ico(src: Image.Image, path: Path):
    sizes = [16, 32, 48]
    imgs = []
    for s in sizes:
        canvas = Image.new("RGBA", (s, s), (0, 0, 0, 0))
        r = src.resize((s, s), Image.Resampling.LANCZOS)
        canvas.alpha_composite(r)
        imgs.append(canvas)
    imgs[0].save(path, format="ICO", sizes=[(s, s) for s in sizes], append_images=imgs[1:])


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    full = lockup()
    mark = draw_mark(1024, glow=True)

    header = Image.new("RGBA", (full.size[0] + 16, full.size[1] + 16), (0, 0, 0, 0))
    header.alpha_composite(full, (8, 8))
    header.save(OUT / "logo.png", "PNG", optimize=True)

    mark.save(OUT / "logo-mark.png", "PNG", optimize=True)

    og = fit_on_bg(full, (1200, 630), 96, BG)
    og.convert("RGB").save(OUT / "og.png", "PNG", optimize=True)

    apple = fit_on_bg(mark, (180, 180), 22, BG)
    apple.convert("RGB").save(OUT / "apple-touch-icon.png", "PNG", optimize=True)

    to_ico(mark, OUT / "favicon.ico")
    print("logo", header.size, "mark", mark.size)


if __name__ == "__main__":
    main()
