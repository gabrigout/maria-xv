#!/usr/bin/env python3
"""Converte os PNGs da arte (tools/make_art.js) em WebP com transparência.
Uso: python3 tools/to_webp.py <pasta-png> assets/img/art"""
import sys, pathlib
from PIL import Image
src, dst = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
dst.mkdir(parents=True, exist_ok=True)
for p in sorted(src.glob("*.png")):
    if p.stem == "preview": continue
    out = dst / (p.stem + ".webp")
    Image.open(p).save(out, "WEBP", quality=84, method=6)
    print(f"{out}  {out.stat().st_size/1024:.0f} KB")
