#!/usr/bin/env python3
"""Gera a textura de cetim azul-marinho do fundo (dobras suaves com reflexos).
Uso: python3 tools/make_cetim.py assets/img/fundo/cetim.webp"""
import sys
import numpy as np
from PIL import Image, ImageFilter

W, H = 900, 1600
rng = np.random.default_rng(15)
y, x = np.mgrid[0:H, 0:W].astype(np.float32)


def ruido(escala, oitavas=3):
    """Ruído suave (soma de grades aleatórias ampliadas)."""
    tot = np.zeros((H, W), np.float32)
    amp = 1.0
    for o in range(oitavas):
        g = rng.standard_normal((int(H / escala) + 2, int(W / escala) + 2)).astype(np.float32)
        im = Image.fromarray(g).resize((W, H), Image.BICUBIC)
        tot += np.asarray(im) * amp
        escala /= 2
        amp *= .5
    return tot / np.abs(tot).max()


def dobras(ang, freq, warp, nitidez):
    a = np.deg2rad(ang)
    t = (x * np.cos(a) + y * np.sin(a)) * freq + warp
    return (0.5 + 0.5 * np.sin(t)) ** nitidez


w1 = ruido(700, 2) * 1.6
w2 = ruido(600, 2) * 1.3
luz = 0.65 * dobras(58, 0.0042, w1, 3) + 0.35 * dobras(122, 0.0031, w2, 4)
# vinheta e direção de luz (mais claro em cima)
vy = 1 - (y / H) * 0.55
vx = 1 - np.abs(x / W - 0.5) * 0.5
luz = luz * vy * vx

base = np.array([7, 16, 46], np.float32)       # marinho profundo
meio = np.array([22, 46, 120], np.float32)     # azul
alto = np.array([70, 104, 184], np.float32)    # reflexo royal
l = luz[..., None]
cor = base + (meio - base) * np.clip(l * 1.6, 0, 1) + (alto - meio) * np.clip((l - .55) * 1.4, 0, 1)
cor += rng.normal(0, 1.4, cor.shape)           # grão finíssimo (evita faixas no degradê)
img = Image.fromarray(np.clip(cor, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
out = sys.argv[1]
img.save(out, "WEBP", quality=72, method=6)
print(out, round(__import__("os").path.getsize(out) / 1024), "KB")
