#!/usr/bin/env python3
"""
Gerador da trilha de fundo do convite: uma valsa instrumental curta (3/4, Ré maior).
Composição original, sintetizada do zero com numpy/scipy (sem samples, sem direitos autorais).

Camadas: arpejo de piano (síntese aditiva), melodia em piano elétrico (FM), pad de cordas,
baixo discreto e reverb de salão (convolução com resposta ao impulso sintética).
O loop é sem emenda: a cauda do reverb do final é somada ao começo.

Uso:
    pip install numpy scipy
    python3 tools/make_music.py musica.wav
    ffmpeg -i musica.wav -af volume=-7dB -c:a libmp3lame -b:a 64k -joint_stereo 1 assets/musica.mp3
"""
import sys
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
from scipy.io import wavfile

SR = 44100
BPM = 76
BEAT = 60.0 / BPM
BAR = 3 * BEAT
rng = np.random.default_rng(15)  # XV :)

# ---------------------------------------------------------------- notas
NOTE_IDX = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7,
            "G#": 8, "A": 9, "A#": 10, "B": 11}


def hz(name):
    """'F#4' -> frequência em Hz (A4 = 440)."""
    pitch, octave = name[:-1], int(name[-1])
    midi = 12 * (octave + 1) + NOTE_IDX[pitch]
    return 440.0 * 2 ** ((midi - 69) / 12)


# ---------------------------------------------------------------- harmonia
# (baixo, [3 notas do arpejo], melodia [(nota|None, batidas)])
D, AC, Bm, F, G, DF, Em, A7, A, Gm7 = "D", "AC", "Bm", "F#m", "G", "DF", "Em7", "A7", "A", "Gmaj7"
CHORDS = {
    "D":    ("D2",  ["A3", "D4", "F#4"]),
    "AC":   ("C#3", ["A3", "C#4", "E4"]),
    "Bm":   ("B2",  ["B3", "D4", "F#4"]),
    "F#m":  ("F#2", ["A3", "C#4", "F#4"]),
    "G":    ("G2",  ["B3", "D4", "G4"]),
    "DF":   ("F#2", ["A3", "D4", "F#4"]),
    "Em7":  ("E2",  ["B3", "D4", "G4"]),
    "A7":   ("A2",  ["G3", "C#4", "E4"]),
    "A":    ("A2",  ["A3", "C#4", "E4"]),
    "Gmaj7": ("G2", ["B3", "D4", "F#4"]),
}

# 32 compassos = 4 frases de 8
PROGRESSION = [
    # frase A
    ("D",  [("F#5", 3)]),
    ("AC", [("E5", 2), ("D5", 1)]),
    ("Bm", [("D5", 2), ("F#5", 1)]),
    ("F#m", [("A5", 2), ("F#5", 1)]),
    ("G",  [("B5", 2), ("A5", 1)]),
    ("DF", [("F#5", 1.5), ("A5", 1.5)]),
    ("Em7", [("G5", 1), ("F#5", 1), ("E5", 1)]),
    ("A7", [("E5", 2), ("C#5", 1)]),
    # frase B
    ("D",  [("D5", 1), ("F#5", 1), ("A5", 1)]),
    ("Bm", [("B5", 2), ("A5", 1)]),
    ("G",  [("G5", 2), ("B5", 1)]),
    ("A",  [("A5", 1.5), ("E5", 1.5)]),
    ("DF", [("F#5", 2), ("A5", 1)]),
    ("Gmaj7", [("B5", 1.5), ("A5", 0.5), ("F#5", 1)]),
    ("A7", [("A5", 1), ("G5", 1), ("E5", 1)]),
    ("D",  [("D5", 3)]),
    # frase C (ponte, mais ansiosa)
    ("Bm", [("F#5", 1), ("B5", 2)]),
    ("G",  [("B5", 1.5), ("D6", 1.5)]),
    ("D",  [("A5", 1), ("D6", 2)]),
    ("A",  [("C#6", 2), ("B5", 1)]),
    ("Bm", [("D6", 1), ("B5", 1), ("F#5", 1)]),
    ("G",  [("G5", 2), ("B5", 1)]),
    ("Em7", [("B5", 1.5), ("G5", 1.5)]),
    ("A7", [("E5", 2), ("C#5", 1)]),
    # frase D (volta e fecha)
    ("D",  [("F#5", 3)]),
    ("AC", [("E5", 2), ("C#5", 1)]),
    ("Bm", [("D5", 2), ("F#5", 1)]),
    ("F#m", [("A5", 2), ("F#5", 1)]),
    ("G",  [("B5", 2), ("G5", 1)]),
    ("A",  [("E5", 1.5), ("A5", 1.5)]),
    ("D",  [("F#5", 2), ("A5", 1)]),
    ("D",  [("D5", 3)]),
]

N_BARS = len(PROGRESSION)
LOOP_LEN = N_BARS * BAR
TAIL = 5.0
TOTAL = int((LOOP_LEN + TAIL) * SR)


# ---------------------------------------------------------------- sintes
def env_ad(n, attack, decay_rate):
    t = np.arange(n) / SR
    a = np.minimum(1.0, t / max(attack, 1e-4))
    return a * np.exp(-decay_rate * t)


def piano(freq, dur, vel=0.5):
    """Piano suave por síntese aditiva, com leve inarmonicidade."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    B = 0.00012
    for k in range(1, 9):
        f = freq * k * np.sqrt(1 + B * k * k)
        if f > 9000:
            break
        amp = (1.0 / k ** 1.35) * (1.0 if k < 6 else 0.6)
        dec = 1.1 + 0.9 * (k - 1)        # harmônicos agudos somem rápido
        out += amp * np.sin(2 * np.pi * f * t + rng.uniform(0, 0.4)) * np.exp(-dec * t)
    # martelo: sopro curtíssimo
    nz = rng.standard_normal(min(n, int(0.012 * SR)))
    out[:len(nz)] += 0.04 * nz * np.linspace(1, 0, len(nz))
    a = np.minimum(1.0, t / 0.004)
    rel = np.minimum(1.0, (dur - t) / 0.18)  # release
    return vel * out * a * np.clip(rel, 0, 1)


def epiano(freq, dur, vel=0.5):
    """Piano elétrico macio (FM 1:1 + harmônico 14:1 discreto)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    idx = 1.5 * np.exp(-2.4 * t) + 0.25
    vib = 1 + 0.0025 * np.sin(2 * np.pi * 5.1 * t) * np.minimum(1, t / 0.6)
    mod = np.sin(2 * np.pi * freq * t * vib) * idx
    car = np.sin(2 * np.pi * freq * t * vib + mod)
    bell = 0.12 * np.sin(2 * np.pi * freq * 14 * t + mod) * np.exp(-14 * t)
    body = (car + bell) * np.exp(-0.55 * t)
    a = np.minimum(1.0, t / 0.012)
    rel = np.clip((dur - t) / 0.35, 0, 1)
    return vel * body * a * rel


def pad(freqs, dur, vel=0.2):
    """Cordas suaves: serras filtradas + chorus lento."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for f in freqs:
        for det in (-0.0035, 0.0, 0.0035):
            ph = rng.uniform(0, 2 * np.pi)
            ff = f * (1 + det)
            sig = np.zeros(n)
            for k in range(1, 7):
                sig += np.sin(2 * np.pi * ff * k * t + ph * k) / k ** 1.7
            out += sig
    a = np.minimum(1.0, t / 1.1)
    r = np.clip((dur - t) / 1.4, 0, 1)
    return vel * out / (len(freqs) * 3) * a * r


def bass(freq, dur, vel=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2 * t) * np.exp(-3 * t)
    # oitava acima, para soar em alto-falante de celular
    s += 0.55 * np.sin(2 * np.pi * freq * 2 * t)
    return vel * s * env_ad(n, 0.01, 1.7) * np.clip((dur - t) / 0.25, 0, 1)


# ---------------------------------------------------------------- mixagem
L = np.zeros(TOTAL)
R = np.zeros(TOTAL)


def place(sig, start_s, pan=0.0):
    i = int(start_s * SR)
    if i >= TOTAL:
        return
    j = min(TOTAL, i + len(sig))
    seg = sig[: j - i]
    gl = np.cos((pan + 1) * np.pi / 4)
    gr = np.sin((pan + 1) * np.pi / 4)
    L[i:j] += seg * gl
    R[i:j] += seg * gr


def jitter(ms=7):
    return rng.uniform(-ms, ms) / 1000.0


EIGHTH = BEAT / 2
ARP_PATTERN = [None, 0, 1, 2, 1, 0]            # índice 0..2 nas 3 notas; None = baixo
ARP_VEL = [0, 0.26, 0.30, 0.34, 0.28, 0.24]

for b, (chord, melody) in enumerate(PROGRESSION):
    t0 = b * BAR
    bass_note, arp = CHORDS[chord]
    # baixo na batida 1
    place(bass(hz(bass_note), BEAT * 2.4, 0.55), t0 + jitter(4), 0.0)
    # arpejo de piano (colcheias)
    for i, p in enumerate(ARP_PATTERN):
        if p is None:
            continue
        v = ARP_VEL[i] * rng.uniform(0.9, 1.08)
        pan = [-0.25, 0.05, 0.3][p]
        place(piano(hz(arp[p]), 1.9, v), t0 + i * EIGHTH + jitter(), pan)
    # pad de cordas segurando o acorde (com leve sobreposição entre compassos)
    pad_notes = [hz(bass_note) * 2, hz(arp[0]), hz(arp[1]), hz(arp[2])]
    place(pad(pad_notes, BAR + 0.9, 0.34), t0 - 0.25 if b else t0, 0.0)
    # melodia
    acc = 0.0
    for note, beats in melody:
        dur = beats * BEAT
        vel = 0.62 if beats >= 2 else 0.5
        place(epiano(hz(note), dur * 1.25 + 0.2, vel), t0 + acc * BEAT + jitter(9), 0.12)
        acc += beats

# ---------------------------------------------------------------- reverb
def make_ir(seconds=3.4, seed=0):
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    noise = r.standard_normal(n) * np.exp(-t / 0.85)
    # escurece com o tempo (ar absorve agudos)
    sos_hi = butter(2, 5500 / (SR / 2), btype="low", output="sos")
    sos_lo = butter(2, 1600 / (SR / 2), btype="low", output="sos")
    early = sosfilt(sos_hi, noise)
    late = sosfilt(sos_lo, noise)
    mix = np.clip(t / 1.4, 0, 1)
    ir = early * (1 - mix) + late * mix
    ir[: int(0.018 * SR)] = 0           # pre-delay
    ir /= np.sqrt(np.sum(ir ** 2))
    return ir


irL, irR = make_ir(seed=1), make_ir(seed=2)
wetL = fftconvolve(L, irL)[:TOTAL]
wetR = fftconvolve(R, irR)[:TOTAL]
WET = 0.55
L = L * 0.72 + wetL * WET
R = R * 0.72 + wetR * WET

# ---------------------------------------------------------------- loop sem emenda
# a cauda do reverb que passou do fim volta a soar no começo
loop_n = int(LOOP_LEN * SR)
tail_n = TOTAL - loop_n
L2, R2 = L[:loop_n].copy(), R[:loop_n].copy()
L2[:tail_n] += L[loop_n:]
R2[:tail_n] += R[loop_n:]

# ---------------------------------------------------------------- finalização
# filtro grave suave (celular não reproduz sub) e roll-off de agudos
sos_hp = butter(2, 45 / (SR / 2), btype="high", output="sos")
sos_lp = butter(2, 9500 / (SR / 2), btype="low", output="sos")
L2, R2 = sosfilt(sos_lp, sosfilt(sos_hp, L2)), sosfilt(sos_lp, sosfilt(sos_hp, R2))

peak = max(np.max(np.abs(L2)), np.max(np.abs(R2)))
target_peak = 10 ** (-3.5 / 20)
L2, R2 = L2 / peak * target_peak, R2 / peak * target_peak
stereo = np.stack([L2, R2], axis=1)
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else 'musica.wav', SR, (stereo * 32767).astype(np.int16))
print(f"ok: {LOOP_LEN:.1f}s, {N_BARS} compassos, pico {20*np.log10(target_peak):.1f} dBFS")
