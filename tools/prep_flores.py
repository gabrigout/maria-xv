#!/usr/bin/env python3
"""Prepara as ilustrações das flores (PNG com fundo transparente) para o site.
Limpa o alfa, recorta, reduz e salva em WebP em assets/img/flores/.

Uso: python3 tools/prep_flores.py <pasta-com-os-png>
     A pasta deve ter: canto.png, arranjo.png, ramo.png, guirlanda.png, hortensia.png, florzinhas.png"""
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage

UP = sys.argv[1].rstrip('/') + '/'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'img', 'flores') + '/'

def limpar(im):
    a = np.asarray(im.convert('RGBA')).astype(np.float32)
    al = a[..., 3]
    al = np.where(al < 10, 0, np.clip((al - 10) * 255 / (252 - 10), 0, 255))   # 252 → opaco; ruído → transparente
    a[..., 3] = al
    return Image.fromarray(a.astype(np.uint8), 'RGBA')

def salvar(im, nome, largura):
    im = im.crop(im.getbbox())
    h = round(im.height * largura / im.width)
    im = im.resize((largura, h), Image.LANCZOS)
    p = OUT + nome + '.webp'
    im.save(p, 'WEBP', quality=82, method=6)
    print(f'{nome}: {im.size} {os.path.getsize(p)//1024} KB')
    return im

for f, nome, w in [('canto', 'canto', 640), ('arranjo', 'arranjo', 520), ('ramo', 'ramo', 900),
                   ('guirlanda', 'guirlanda', 480), ('hortensia', 'hortensia', 440)]:
    salvar(limpar(Image.open(UP + f + '.png')), nome, w)

# florzinhas: separa cada uma e monta uma tira 6 × 96 px para o canvas
im = limpar(Image.open(UP + 'florzinhas.png'))
al = np.asarray(im)[..., 3] > 40
lab, n = ndimage.label(ndimage.binary_dilation(al, iterations=6))
objs = sorted([s for s in ndimage.find_objects(lab) if (s[0].stop - s[0].start) > 120], key=lambda s: (s[0].start // 300, s[1].start))
T = 96
tira = Image.new('RGBA', (T * len(objs), T), (0, 0, 0, 0))
for i, (sy, sx) in enumerate(objs):
    c = im.crop((sx.start, sy.start, sx.stop, sy.stop)); c = c.crop(c.getbbox())
    k = (T - 4) / max(c.size); c = c.resize((max(1, round(c.width * k)), max(1, round(c.height * k))), Image.LANCZOS)
    tira.alpha_composite(c, (i * T + (T - c.width) // 2, (T - c.height) // 2))
p = OUT + 'florzinhas.webp'; tira.save(p, 'WEBP', quality=86, method=6)
print('florzinhas:', len(objs), 'peças', tira.size, os.path.getsize(p) // 1024, 'KB')
