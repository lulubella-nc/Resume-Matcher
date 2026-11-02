#!/usr/bin/env python3
"""Render a template into the README sample assets (webp thumbnail + PDF).

The markup comes from the real React component, so a sample cannot drift from the
code. Dump it with the committed helper, which always renders an invented resume:

    cd apps/frontend
    DUMP_TEMPLATES=editorial npx vitest run --pool=threads --maxWorkers=1 \
      tests/dump-template-markup.test.tsx

then render it here:

    python scripts/make-template-assets.py --template editorial --css profile \
      --html .workbuddy/tmp/editorial.html

The dump carries the settings inline (accent, fonts, margins), so the sample shows
the template's own look. CSS-module class names are hashed in the dump; they are
mapped back to their source names before the stylesheet is inlined.

Requires Playwright + Pillow (both in apps/backend/.venv) and network access for
the Google Fonts stylesheet; without it the shots fall back to system faces.
"""

from __future__ import annotations

import argparse
import io
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STYLES = ROOT / "apps/frontend/components/resume/styles"
ASSET_DIR = ROOT / "assets/pdf-templates"

# A4 in CSS pixels at 96 dpi.
A4_WIDTH_PX = 794.0
A4_HEIGHT_PX = 1123.0
A4_RATIO = A4_HEIGHT_PX / A4_WIDTH_PX

FONT_LINK = (
    '<link href="https://fonts.googleapis.com/css2?'
    "family=Noto+Sans:wght@300;400;500;600;700;800&"
    'family=Noto+Serif:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">'
)


def load_css(name: str) -> str:
    css = (STYLES / name).read_text(encoding="utf-8")
    css = "\n".join(line for line in css.splitlines() if not line.startswith("@import"))
    return css.replace(":global(", "(")


def dehash(markup: str) -> str:
    """CSS modules append `_<hash>`: `_resume-body_ab12cd` → `resume-body`."""
    return re.sub(r"_([A-Za-z0-9-]+)_[0-9a-f]{6}", r"\1", markup)


def build_document(markup: str, css: str, *, print_mode: bool, margin_mm: int) -> str:
    print_css = (
        f"""
      @page {{ margin: {margin_mm}mm; }}
      body {{ padding: 0 !important; background: #ffffff !important; }}
      .resume-body {{ padding: 0 !important; width: 210mm !important; }}
    """
        if print_mode
        else ""
    )
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
{FONT_LINK}
<style>
*{{box-sizing:border-box}}
body{{margin:0;background:#ffffff;font-family:'Noto Sans',sans-serif}}
ul,ol{{list-style:none;margin:0;padding:0}}
h1,h2,h3,h4,p{{margin:0}}
{css}
.resume-body{{width:210mm;min-height:0;background:#ffffff}}
{print_css}
</style></head><body>{markup}</body></html>"""


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--template", required=True, help="template id, e.g. editorial")
    parser.add_argument(
        "--html", required=True, help="dumped component markup (repo-relative)"
    )
    parser.add_argument("--out", help="output basename (default: the template id)")
    parser.add_argument(
        "--css",
        help="stylesheet basename (default: the template id); the profile presets all "
        "share profile.module.css",
    )
    parser.add_argument(
        "--margin", type=int, default=10, help="PDF printer margin in mm"
    )
    parser.add_argument(
        "--dpi",
        type=float,
        default=150,
        help="thumbnail resolution (150 gives a 1242 px wide A4)",
    )
    args = parser.parse_args()

    try:
        from PIL import Image
        from playwright.sync_api import sync_playwright
    except ImportError:
        print(
            "Playwright and Pillow are required (apps/backend/.venv).", file=sys.stderr
        )
        return 1

    html_path = (ROOT / args.html).resolve()
    if not html_path.exists():
        print(
            f"No markup at {html_path}. Dump it first (see the docstring).",
            file=sys.stderr,
        )
        return 1

    markup = dehash(html_path.read_text(encoding="utf-8"))
    css_name = args.css or args.template
    css = "\n".join(
        load_css(n)
        for n in ("_tokens.css", "_base.module.css", f"{css_name}.module.css")
    )
    out = ASSET_DIR / (args.out or args.template)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)

    scale = args.dpi / 96.0
    with sync_playwright() as p:
        browser = p.chromium.launch()

        page = browser.new_page(
            viewport={"width": int(A4_WIDTH_PX), "height": int(A4_HEIGHT_PX)},
            device_scale_factor=scale,
        )
        page.set_content(
            build_document(markup, css, print_mode=False, margin_mm=args.margin)
        )
        page.wait_for_timeout(1200)
        page.wait_for_load_state("networkidle")
        node = page.query_selector(".resume-body")
        png = node.screenshot()
        image = Image.open(io.BytesIO(png)).convert("RGB")
        # Every thumbnail is one A4 page so the README table stays a grid: a short
        # resume is padded with white, a long one is trimmed to its first page.
        target_height = round(image.width * A4_RATIO)
        page = Image.new("RGB", (image.width, target_height), "#ffffff")
        page.paste(
            image.crop((0, 0, image.width, min(image.height, target_height))), (0, 0)
        )
        image = page
        image.save(out.with_suffix(".webp"), "WEBP", quality=88)
        print(
            f"{out.with_suffix('.webp').relative_to(ROOT)}  {image.width}x{image.height}"
        )
        page.close()

        page = browser.new_page()
        page.set_content(
            build_document(markup, css, print_mode=True, margin_mm=args.margin)
        )
        page.wait_for_timeout(1200)
        page.wait_for_load_state("networkidle")
        page.pdf(
            path=str(out.with_suffix(".pdf")),
            format="A4",
            print_background=True,
            margin={
                side: f"{args.margin}mm" for side in ("top", "bottom", "left", "right")
            },
        )
        print(f"{out.with_suffix('.pdf').relative_to(ROOT)}")
        browser.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
