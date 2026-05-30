import os
import math
from PIL import Image, ImageDraw

BG_COLOR = (26, 26, 46)
ACCENT_COLOR = (217, 119, 87)
LIGHT_ACCENT = (240, 180, 150)
OUTLINE_COLOR = (80, 80, 120)

OUTPUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "macos", "SkillVault", "Assets.xcassets", "AppIcon.appiconset"
)

SIZES = [16, 32, 64, 128, 256, 512, 1024]


def rounded_rectangle(draw, bbox, radius, fill=None, outline=None, width=1):
    x0, y0, x1, y1 = bbox
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)


def draw_vault_icon(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    padding = max(1, size // 32)
    corner_radius = max(2, size // 5)

    rounded_rectangle(
        draw,
        (padding, padding, size - padding, size - padding),
        corner_radius,
        fill=BG_COLOR,
    )

    inner_pad = max(2, size // 6)
    vault_left = inner_pad
    vault_top = inner_pad
    vault_right = size - inner_pad
    vault_bottom = size - inner_pad
    vault_radius = max(2, size // 10)

    rounded_rectangle(
        draw,
        (vault_left, vault_top, vault_right, vault_bottom),
        vault_radius,
        outline=ACCENT_COLOR,
        width=max(1, size // 64),
    )

    mid_x = size // 2
    mid_y = size // 2

    circle_r = max(2, size // 8)
    draw.ellipse(
        (mid_x - circle_r, mid_y - circle_r, mid_x + circle_r, mid_y + circle_r),
        outline=ACCENT_COLOR,
        width=max(1, size // 64),
    )

    handle_r = max(1, size // 24)
    draw.ellipse(
        (mid_x - handle_r, mid_y - handle_r, mid_x + handle_r, mid_y + handle_r),
        fill=ACCENT_COLOR,
    )

    bolt_len = max(2, size // 16)
    bolt_w = max(1, size // 80)
    draw.rectangle(
        (mid_x - bolt_w, mid_y - circle_r - bolt_len, mid_x + bolt_w, mid_y - circle_r),
        fill=ACCENT_COLOR,
    )
    draw.rectangle(
        (mid_x - bolt_w, mid_y + circle_r, mid_x + bolt_w, mid_y + circle_r + bolt_len),
        fill=ACCENT_COLOR,
    )
    draw.rectangle(
        (mid_x - circle_r - bolt_len, mid_y - bolt_w, mid_x - circle_r, mid_y + bolt_w),
        fill=ACCENT_COLOR,
    )
    draw.rectangle(
        (mid_x + circle_r, mid_y - bolt_w, mid_x + circle_r + bolt_len, mid_y + bolt_w),
        fill=ACCENT_COLOR,
    )

    hinge_size = max(1, size // 20)
    hinge_y = vault_top + max(1, size // 16)
    for hx in [vault_left + max(1, size // 8), vault_right - max(1, size // 8)]:
        draw.rectangle(
            (hx - hinge_size // 2, hinge_y - hinge_size // 2,
             hx + hinge_size // 2, hinge_y + hinge_size // 2),
            fill=LIGHT_ACCENT,
        )

    return img


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for size in SIZES:
        img = draw_vault_icon(size)
        filename = f"icon_{size}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)
        img.save(filepath, "PNG")
        print(f"Generated {filepath}")

    print("All icons generated.")


if __name__ == "__main__":
    main()
