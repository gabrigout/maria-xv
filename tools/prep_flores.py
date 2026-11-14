#!/usr/bin/env python3
"""Prepara o conjunto floral (PNG com fundo transparente) para o site.
Só recorta, limpa a franja do alfa, reduz e exporta em WebP: as cores ficam exatamente
as que foram geradas.

Uso: python3 tools/prep_flores.py <pasta-com-os-png>
A pasta deve ter: faixa-cima.png, faixa-baixo.png, vinha-esq.png, vinha-dir.png,
                  arranjo-lacre.png, divisor.png, petalas.png
Saída: assets/img/flores/*.webp"""
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

SRC = sys.argv[1].rstrip('/') + '/'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'img', 'flores') + '/'
os.makedirs(OUT, exist_ok=True)


def limpar(im, corte=26, cheio=236):
    """Zera a névoa quase transparente da borda e firma o resto do alfa."""
    a = np.asarray(im.convert('RGBA')).astype(np.float32)
    al = a[..., 3]
    a[..., 3] = np.where(al < corte, 0, np.clip((al - corte) * 255 / (cheio - corte), 0, 255))
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def salvar(im, nome, largura, q=80):
    if im.width > largura:
        im = im.resize((largura, round(im.height * largura / im.width)), Image.LANCZOS)
    p = OUT + nome + '.webp'
    im.save(p, 'WEBP', quality=q, method=6)
    print(f'{nome}: {im.size} {os.path.getsize(p) // 1024} KB')
    return im


def abrir(nome):
    return limpar(Image.open(SRC + nome + '.png'))


# faixas: a tela inteira (as pontas dos galhos têm que continuar chegando às bordas)
salvar(abrir('faixa-cima'), 'faixa-cima', 960, 78)
salvar(abrir('faixa-baixo'), 'faixa-baixo', 960, 78)

# vinhas: recorta uma largura fixa centrada na haste, para a haste ficar no meio da imagem
for nome, cx in (('vinha-esq', 374), ('vinha-dir', 342)):
    im = abrir(nome)
    w = 420
    im = im.crop((cx - w // 2, 0, cx + w // 2, im.height))
    salvar(im, nome, 210, 76)

# arranjo do lacre, divisor
for nome, w in (('arranjo-lacre', 560), ('divisor', 840)):
    im = abrir(nome)
    salvar(im.crop(im.getbbox()), nome, w, 80)

# pétalas: 8 peças soltas viram uma tira de 8 quadrados de 96 px (usada no canvas da abertura)
im = abrir('petalas')
al = np.asarray(im)[..., 3] > 40
lab, _ = ndimage.label(ndimage.binary_dilation(al, iterations=10))
objs = [s for s in ndimage.find_objects(lab) if s is not None and (s[0].stop - s[0].start) > 60]
objs.sort(key=lambda s: (round(((s[0].start + s[0].stop) / 2) / 400), s[1].start))
T = 96
tira = Image.new('RGBA', (T * len(objs), T))
for i, (sy, sx) in enumerate(objs):
    c = im.crop((sx.start, sy.start, sx.stop, sy.stop))
    c = c.crop(c.getbbox())
    k = (T - 6) / max(c.size)
    c = c.resize((max(1, round(c.width * k)), max(1, round(c.height * k))), Image.LANCZOS)
    tira.alpha_composite(c, (i * T + (T - c.width) // 2, (T - c.height) // 2))
p = OUT + 'petalas.webp'
tira.save(p, 'WEBP', quality=84, method=6)
print('petalas:', len(objs), 'peças', os.path.getsize(p) // 1024, 'KB')
