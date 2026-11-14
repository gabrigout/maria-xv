#!/usr/bin/env python3
"""Puxa as ilustrações para o azul-escuro: escurece o conjunto, aprofunda os azuis
e transforma os brancos grandes (lírios, rosas brancas) em azul-pó; o branco fica
só nos pontos de luz (miolos, reflexos).

Uso: python3 tools/tom_azul.py <entrada.webp|png> <saida.webp> [intensidade 0-1]"""
import sys
import numpy as np
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
k = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
im = Image.open(src).convert('RGBA')
a = np.asarray(im).astype(np.float32)
rgb, al = a[..., :3] / 255, a[..., 3:]
PROFUNDO = len(sys.argv) > 4 and sys.argv[4] == 'profundo'
if PROFUNDO:
    # nada de branco nem azul-bebê: tons claros viram azul royal saturado, mantendo o sombreado
    mx, mn = rgb.max(-1, keepdims=True), rgb.min(-1, keepdims=True)
    sat = (mx - mn) / np.maximum(mx, 1e-4)
    lum = (rgb @ np.array([.3, .55, .15]))[..., None]
    azulado = (rgb[..., 2:3] > rgb[..., 0:1] + .05).astype(np.float32)
    claro = np.clip((lum - .32) / .3, 0, 1)
    peso = claro * np.clip(np.clip(1 - sat / .5, 0, 1) + azulado * .75, 0, 1)
    royal = np.array([.19, .31, .82])
    alvo = np.clip(royal * (.3 + .82 * lum), 0, 1)
    rgb = rgb * (1 - peso * .9) + alvo * peso * .9
    # folhas verde-acinzentadas puxam para azul-ardósia
    verde = np.clip((rgb[..., 1:2] - rgb[..., 2:3]) / .06 + .5, 0, 1) * (1 - peso)
    ardosia = np.concatenate([lum * .58, lum * .72, lum * 1.02], -1)
    rgb = rgb * (1 - verde * .55) + ardosia * verde * .55
    out = np.concatenate([np.clip(rgb * .95, 0, 1) * 255, al], -1).astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(dst, 'WEBP', quality=82, method=6)
    sys.exit()
mx, mn = rgb.max(-1, keepdims=True), rgb.min(-1, keepdims=True)
sat = (mx - mn) / np.maximum(mx, 1e-4)
# quanto o pixel é "branco": claro e pouco saturado
branco = np.clip((mx - .55) / .3, 0, 1) * np.clip(1 - sat / .28, 0, 1)
azul_po = np.array([.48, .58, .82])                 # azul-pó acinzentado
lum = rgb @ np.array([.3, .55, .15])
tingido = azul_po * (.55 + .5 * lum[..., None])      # mantém o sombreado da pétala
rgb = rgb * (1 - branco * .85 * k) + tingido * branco * .85 * k
# escurece e aprofunda o azul no conjunto
rgb = rgb * (1 - .26 * k) * np.array([1 - .16 * k, 1 - .08 * k, 1])
out = np.concatenate([np.clip(rgb, 0, 1) * 255, al], -1).astype(np.uint8)
Image.fromarray(out, 'RGBA').save(dst, 'WEBP', quality=82, method=6)
