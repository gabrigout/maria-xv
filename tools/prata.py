#!/usr/bin/env python3
"""Converte dourado em prata mantendo o relevo (luz e sombra).
Pixels amarelados/alaranjados viram cinza-prateado levemente azulado;
o resto (azuis das flores) fica intacto. Também limpa o halo colorido
de bordas semitransparentes.

Uso: python3 tools/prata.py <entrada.png|webp> <saida.png|webp> [largura]"""
import sys, colorsys
import numpy as np
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
w = int(sys.argv[3]) if len(sys.argv) > 3 else None
im = Image.open(src).convert('RGBA')
a = np.asarray(im).astype(np.float32)
rgb = a[..., :3] / 255
r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
mx, mn = rgb.max(-1), rgb.min(-1)
sat = (mx - mn) / np.maximum(mx, 1e-4)
# matiz em graus (0 = vermelho, 60 = amarelo)
d = np.maximum(mx - mn, 1e-4)
h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
quente = ((h < 70) | (h > 345)) & (sat > .12)          # dourado, laranja e o halo avermelhado
peso = np.clip((sat - .12) / .2, 0, 1) * quente
lum = rgb @ np.array([.3, .55, .15])
lum = np.clip((lum - .08) * 1.18 + .08, 0, 1)          # prata tem mais contraste que ouro
prata = np.stack([lum * .93, lum * .97, lum * 1.04], -1)
rgb = rgb * (1 - peso[..., None]) + prata * peso[..., None]
out = Image.fromarray(np.concatenate([np.clip(rgb, 0, 1) * 255, a[..., 3:]], -1).astype(np.uint8), 'RGBA')
out = out.crop(out.getbbox())
if w and out.width > w:
    out = out.resize((w, round(out.height * w / out.width)), Image.LANCZOS)
if dst.endswith('.webp'):
    out.save(dst, 'WEBP', quality=82, method=6)
else:
    out.save(dst)
print(dst, out.size)
