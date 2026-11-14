#!/usr/bin/env python3
"""
Trilha de fundo v2 — duas versões originais, sintetizadas do zero (sem samples, sem direitos autorais).

  emotiva : piano + cordas, 4/4, Ré maior, 76 BPM, ~88 s (começa só com piano, cresce, termina em Ré e volta ao início)
  suave   : ambiente com cordas longas e poucas notas de piano/harpa, 60 BPM, ~64 s (bom para fundo)

Instrumentos: piano com 2-3 cordas desafinadas (batimento), decaimento em dois estágios e martelo;
cordas = conjunto de "serras" desafinadas filtrado; harpa por Karplus-Strong; reverb de salão por convolução.
O loop é sem emenda (a cauda do reverb do final é somada ao começo).

Uso:  pip install numpy scipy
      python3 tools/make_music2.py emotiva musica-emotiva.wav
      ffmpeg -i musica-emotiva.wav -af loudnorm=I=-23:TP=-2 -c:a libmp3lame -b:a 96k -joint_stereo 1 assets/musica.mp3
"""
import sys
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt, lfilter
from scipy.io import wavfile

SR = 44100
STYLE = sys.argv[1] if len(sys.argv) > 1 else "emotiva"
OUTFILE = sys.argv[2] if len(sys.argv) > 2 else f"musica-{STYLE}.wav"
rng = np.random.default_rng(15)

NOTE = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def hz(name):
    p, o = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((12 * (o + 1) + NOTE[p] - 69) / 12)


# ============================================================ instrumentos
def piano(freq, dur, vel=.5, strings=3):
    n = int(dur * SR); t = np.arange(n) / SR
    d0 = 0.9 + 0.55 * (freq / 261.6)                       # agudo some mais rápido
    B = 0.00011
    out = np.zeros(n)
    dets = (-0.0007, 0.0, 0.0008)[:strings] if strings == 3 else (-0.0004, 0.0005)
    for det in dets:
        f0 = freq * (1 + det); ph0 = rng.uniform(0, 6.28)
        for k in range(1, 13):
            f = f0 * k * np.sqrt(1 + B * k * k)
            if f > 9500: break
            amp = (1.0 / k ** 1.12) * (vel ** (0.10 * (k - 1))) * (1.0 if k < 8 else .6)
            dec = d0 * (1 + .5 * (k - 1))
            env = .62 * np.exp(-3.0 * dec * t) + .38 * np.exp(-.62 * dec * t)   # decaimento em dois estágios
            out += amp * np.sin(2 * np.pi * f * t + ph0 * k) * env
    out /= len(dets)
    th = rng.standard_normal(min(n, int(.012 * SR)))      # martelo
    sos = butter(2, 2200 / (SR / 2), btype="low", output="sos")
    th = sosfilt(sos, th) * np.linspace(1, 0, len(th)) * .22 * vel
    out[:len(th)] += th
    a = np.minimum(1, t / .003)
    rel = np.clip((dur - t) / .22, 0, 1)
    return vel * out * a * rel


def strings(freqs, dur, vel=.2, attack=1.0, release=1.4):
    n = int(dur * SR); t = np.arange(n) / SR
    out = np.zeros(n)
    vib = 1 + .0022 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 1.4)
    for f in freqs:
        for det in (-.0075, -.0035, 0, .0035, .0075):
            ph = rng.uniform(0, 6.28); ff = f * (1 + det)
            sig = np.zeros(n)
            for k in range(1, 11):
                sig += np.sin(2 * np.pi * ff * k * t * vib + ph * k) / k ** 1.25
            out += sig
    out /= (len(freqs) * 5)
    a = np.minimum(1, t / attack) ** 1.6
    r = np.clip((dur - t) / release, 0, 1) ** 1.4
    return vel * out * a * r


def harp(freq, dur, vel=.4):
    """Karplus-Strong: corda dedilhada."""
    n = int(dur * SR); N = int(SR / freq)
    buf = rng.uniform(-1, 1, N) * vel
    buf = lfilter([.5, .5], [1], buf)
    out = np.zeros(n)
    idx = 0
    for i in range(n):
        out[i] = buf[idx]
        nxt = .5 * (buf[idx] + buf[(idx + 1) % N]) * .9965
        buf[idx] = nxt
        idx = (idx + 1) % N
    t = np.arange(n) / SR
    return out * np.clip((dur - t) / .3, 0, 1)


# ============================================================ harmonia
CH = {   # nome: (baixo, voicing de 5 notas p/ arpejo, notas das cordas)
    "D":  ("D2",  ["D3", "A3", "D4", "F#4", "A4"], ["D3", "A3", "D4", "F#4"]),
    "A":  ("A2",  ["A2", "E3", "A3", "C#4", "E4"], ["A2", "E3", "A3", "C#4"]),
    "Bm": ("B2",  ["B2", "F#3", "B3", "D4", "F#4"], ["B2", "F#3", "B3", "D4"]),
    "G":  ("G2",  ["G2", "D3", "G3", "B3", "D4"], ["G2", "D3", "G3", "B3"]),
    "DF": ("F#2", ["F#3", "A3", "D4", "F#4", "A4"], ["F#2", "A3", "D4", "F#4"]),
    "Em": ("E2",  ["E2", "B2", "E3", "G3", "B3"], ["E2", "B2", "E3", "G3"]),
    "F#m": ("F#2", ["F#2", "C#3", "F#3", "A3", "C#4"], ["F#2", "C#3", "F#3", "A3"]),
    "A7": ("A2",  ["A2", "E3", "G3", "C#4", "E4"], ["A2", "E3", "G3", "C#4"]),
}

if STYLE == "emotiva":
    BPM, N_BEATS = 76, 4
    BARS = [
        # (acordes[(nome, tempos)], melodia[(nota, tempos)] ou None, seção)
        ([("D", 4)], None, 1), ([("A", 4)], None, 1), ([("Bm", 4)], None, 1), ([("G", 4)], None, 1),
        ([("D", 4)], [("F#5", 2), ("A5", 1), ("F#5", 1)], 1), ([("A", 4)], [("E5", 3), ("C#5", 1)], 1),
        ([("Bm", 4)], [("D5", 2), ("F#5", 1), ("E5", 1)], 1), ([("G", 4)], [("D5", 3), ("B4", 1)], 1),
        ([("D", 4)], [("F#5", 2), ("A5", 1), ("B5", 1)], 2), ([("A", 4)], [("A5", 2), ("E5", 2)], 2),
        ([("Bm", 2), ("A", 2)], [("D5", 2), ("C#5", 2)], 2), ([("G", 2), ("A", 2)], [("B4", 2), ("C#5", 2)], 2),
        ([("G", 4)], [("B5", 2), ("A5", 1), ("G5", 1)], 2), ([("DF", 4)], [("F#5", 3), ("A5", 1)], 2),
        ([("Em", 4)], [("G5", 2), ("E5", 2)], 2), ([("A", 4)], [("C#6", 2), ("B5", 1), ("A5", 1)], 2),
        ([("Bm", 4)], [("D6", 2), ("B5", 2)], 3), ([("F#m", 4)], [("A5", 2), ("C#6", 2)], 3),
        ([("G", 4)], [("B5", 2), ("D6", 2)], 3), ([("A7", 4)], [("C#6", 2), ("A5", 2)], 3),
        ([("D", 4)], [("D6", 4)], 3), ([("A", 4)], [("E6", 2), ("C#6", 2)], 3),
        ([("Bm", 4)], [("D6", 2), ("B5", 2)], 3), ([("G", 4)], [("B5", 2), ("G5", 2)], 3),
        ([("Em", 4)], [("G5", 2), ("B5", 2)], 3), ([("A", 4)], [("A5", 2), ("E5", 2)], 3),
        ([("G", 2), ("DF", 2)], [("D5", 2), ("F#5", 2)], 3), ([("D", 4)], [("D5", 4)], 3),
    ]
    PAD_FROM = 2          # compasso (0-index) em que as cordas começam
else:                      # suave
    BPM, N_BEATS = 60, 4
    BARS = [([("D", 4)], [("A5", 4)], 1), ([("Bm", 4)], [("F#5", 2), ("E5", 2)], 1), ([("G", 4)], [("D5", 4)], 1), ([("A", 4)], [("E5", 2), ("C#5", 2)], 1)] * 4
    PAD_FROM = 0

BEAT = 60.0 / BPM
BAR = N_BEATS * BEAT
N_BARS = len(BARS)
LOOP = N_BARS * BAR
TAIL = 5.5
TOTAL = int((LOOP + TAIL) * SR)
PIANO = np.zeros((TOTAL, 2)); STR = np.zeros((TOTAL, 2))


def put(buf, sig, start, pan=0.0, gain=1.0):
    if start < 0:                          # a 'humanização' pode puxar a 1ª nota para antes do zero
        sig = sig[int(-start * SR):]; start = 0.0
    i = int(start * SR)
    if i >= TOTAL: return
    j = min(TOTAL, i + len(sig))
    g = np.array([np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)]) * gain
    buf[i:j] += sig[: j - i, None] * g[None, :]


jit = lambda ms=6: rng.uniform(-ms, ms) / 1000.0
EIGHTH = BEAT / 2
SEC_VEL = {1: .55, 2: .64, 3: .72}

for b, (chords, melody, sec) in enumerate(BARS):
    t0 = b * BAR
    beat_off = 0
    for name, beats in chords:
        bass, voic, pad = CH[name]
        start = t0 + beat_off * BEAT
        # baixo (com a oitava de cima, audível em alto-falante de celular)
        put(PIANO, piano(hz(bass), beats * BEAT * 1.15 + .5, .5, 2), start + jit(4), 0.0, .9)
        put(PIANO, piano(hz(bass) * 2, beats * BEAT * 1.0 + .3, .22, 2), start + jit(4), 0.0, .7)
        # arpejo (colcheias)
        if STYLE == "emotiva":
            pat = [0, 2, 3, 4, 3, 2, 3, 1] if beats == 4 else [0, 2, 4, 3]
            for i, k in enumerate(pat):
                v = (.30 if i % 4 == 0 else .24) * rng.uniform(.92, 1.07)
                put(PIANO, piano(hz(voic[k]), 2.4, v, 2), start + i * EIGHTH + jit(), [-.28, .0, .3][i % 3], 1.0)
        else:
            if b % 4 == 0:   # harpa só no início de cada ciclo
                for i, k in enumerate([0, 2, 3, 4]):
                    put(STR, harp(hz(voic[k]), 3.0, .35), start + i * (BEAT * .5) + jit(), [-.3, -.1, .1, .3][i], .7)
        # cordas
        if b >= PAD_FROM:
            vel = .30 if sec == 1 else (.42 if sec == 2 else .52)
            if STYLE == "suave": vel = .42
            fade = min(1.0, (b - PAD_FROM + 1) / 3) if STYLE == "emotiva" else 1.0
            put(STR, strings([hz(x) for x in pad], beats * BEAT + 1.1, vel * fade, attack=1.1), start - .25 if b > 0 else start, 0.0, 1.0)
        beat_off += beats
    if melody:
        acc = 0
        for note, beats in melody:
            dur = beats * BEAT
            v = SEC_VEL[sec] * (1.05 if beats >= 2 else .9)
            put(PIANO, piano(hz(note), dur * 1.25 + .6, v, 3), t0 + acc * BEAT + jit(9), .1, 1.2)
            if STYLE == "emotiva" and sec >= 2:    # cordas dobram a melodia (suave)
                put(STR, strings([hz(note)], dur + .8, .16, attack=.35, release=.8), t0 + acc * BEAT, .1, 1.0)
            acc += beats


# ============================================================ reverb de salão
def make_ir(seconds=4.0, seed=0):
    r = np.random.default_rng(seed)
    n = int(seconds * SR); t = np.arange(n) / SR
    noise = r.standard_normal(n) * np.exp(-t / 1.0)
    early = sosfilt(butter(2, 6000 / (SR / 2), "low", output="sos"), noise)
    late = sosfilt(butter(2, 1500 / (SR / 2), "low", output="sos"), noise)
    mix = np.clip(t / 1.6, 0, 1)
    ir = early * (1 - mix) + late * mix
    ir[: int(.02 * SR)] = 0
    return ir / np.sqrt(np.sum(ir ** 2))


irs = [make_ir(seed=1), make_ir(seed=2)]


def wet(buf):
    return np.stack([fftconvolve(buf[:, c], irs[c])[:TOTAL] for c in range(2)], axis=1)


# cordas passam por filtro passa-baixa (mais macias)
lp = butter(2, 2600 / (SR / 2), btype="low", output="sos")
STR = np.stack([sosfilt(lp, STR[:, c]) for c in range(2)], axis=1)
mix = PIANO * .74 + STR * .78 + wet(PIANO) * .50 + wet(STR) * .62

# loop sem emenda: a cauda volta a soar no início
loop_n = int(LOOP * SR); tail_n = TOTAL - loop_n
out = mix[:loop_n].copy(); out[:tail_n] += mix[loop_n:]
hp = butter(2, 45 / (SR / 2), btype="high", output="sos")
out = np.stack([sosfilt(hp, out[:, c]) for c in range(2)], axis=1)
peak = np.max(np.abs(out))
out = out / peak * 10 ** (-3.5 / 20)
wavfile.write(OUTFILE, SR, (out * 32767).astype(np.int16))
print(f"ok: {STYLE}, {N_BARS} compassos, {LOOP:.1f}s -> {OUTFILE}")
