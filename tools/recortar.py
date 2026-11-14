#!/usr/bin/env python3
"""Recorta elementos de pranchas SEM transparência real.

  claro  — elementos sobre papel claro / "xadrez" pintado: o fundo é achado por
           inundação a partir das bordas (o miolo branco de lírios e rosas, cercado
           por contorno, fica protegido) e só a faixa da borda recebe alfa
           proporcional à diferença para o papel (sem halo branco no azul).
  escuro — prata e pérolas sobre azul-escuro: o alfa vem do brilho.

Uso: python3 tools/recortar.py claro|escuro <prancha.png> <pasta-saida> [area-minima]
Saída: um PNG por elemento (p00.png, p01.png...) + mapa.png com a numeração."""
import sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

modo, src, out = sys.argv[1], sys.argv[2], sys.argv[3]
area_min = int(sys.argv[4]) if len(sys.argv) > 4 else 2500
os.makedirs(out, exist_ok=True)
img = Image.open(src).convert('RGB')
p = np.asarray(img).astype(np.float32)
H, W, _ = p.shape

if modo == 'claro':
    # cor local do papel: mediana larga da imagem (acompanha o xadrez/grão sem pegar as flores)
    papel = np.asarray(img.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(6))).astype(np.float32)
    papel = np.maximum(papel, 225)
    d = np.max(papel - p, axis=2)                                  # quanto o pixel é mais escuro que o papel
    sat = p.max(axis=2) - p.min(axis=2)
    pareceFundo = (d < 16) & (sat < 22)
    # inundação a partir das bordas
    lab, _ = ndimage.label(pareceFundo)
    bordas = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    fundo = np.isin(lab, bordas[bordas > 0])
    # bolsões de papel presos entre folhas: quase todos os pixels iguais ao papel (pétala branca tem sombreado)
    lab2, n2 = ndimage.label(pareceFundo & ~fundo)
    if n2:
        idx = np.arange(1, n2 + 1)
        total = ndimage.sum(np.ones_like(d), lab2, idx)
        liso = ndimage.sum((d < 6).astype(np.float32), lab2, idx)
        bolsao = idx[(total >= 30) & (liso / np.maximum(total, 1) > .82)]
        fundo |= np.isin(lab2, bolsao)
    frente = ~fundo
    frente = ndimage.binary_opening(frente, iterations=1)
    # faixa de transição: alfa proporcional à diferença para o papel
    faixa = ndimage.binary_dilation(frente, iterations=2) & ~ndimage.binary_erosion(frente, iterations=2)
    alfa = np.where(frente, 255.0, 0.0)
    a_faixa = np.clip((d + sat * .6) / 70.0, 0, 1) * 255
    alfa = np.where(faixa, np.minimum(np.maximum(a_faixa, 0), 255), alfa)
    # tira o "branco do papel" misturado na borda (desmultiplica)
    a = np.clip(alfa / 255.0, 1e-3, 1)[..., None]
    cor = np.where(faixa[..., None], np.clip((p - (1 - a) * papel) / a, 0, 255), p)
else:
    lum = p @ np.array([.299, .587, .114], np.float32)
    fundo_l = ndimage.uniform_filter(np.minimum(lum, 60), 41)
    alfa = np.clip((lum - fundo_l - 18) / 70.0, 0, 1) * 255
    alfa = ndimage.grey_closing(alfa, size=(3, 3))
    cor = p
    frente = alfa > 30

rgba = np.dstack([cor, alfa]).astype(np.uint8)
# separa os elementos
lab, n = ndimage.label(ndimage.binary_dilation(alfa > 40, iterations=4))
objs = ndimage.find_objects(lab)
info = []
for k, sl in enumerate(objs, 1):
    if sl is None: continue
    m = lab[sl] == k
    if m.sum() < area_min: continue
    info.append((sl[0].start, sl[1].start, sl[0].stop, sl[1].stop, k))
info.sort(key=lambda t: (round(((t[0] + t[2]) / 2) / 160), t[1]))
mapa = Image.new('RGB', (W, H), (9, 20, 52))
mapa.paste(Image.fromarray(rgba), (0, 0), Image.fromarray(rgba))
dr = ImageDraw.Draw(mapa)
for i, (y0, x0, y1, x1, k) in enumerate(info):
    peca = rgba[y0:y1, x0:x1].copy()
    peca[..., 3] = np.where(lab[y0:y1, x0:x1] == k, peca[..., 3], 0)
    Image.fromarray(peca).save(os.path.join(out, f'p{i:02d}.png'))
    dr.rectangle((x0, y0, x1, y1), outline=(255, 90, 90), width=2)
    dr.text((x0 + 4, y0 + 2), str(i), fill=(255, 255, 0))
mapa.save(os.path.join(out, 'mapa.png'))
print(len(info), 'elementos')
