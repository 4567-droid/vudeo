"""Música de fondo original para el reel de Filo (sintetizada desde cero, sin samples).

80 BPM (1 compás = 3 s), acordes Am9 - Fmaj9 - Cmaj7 - Em7.
- 0-3 s: solo piano eléctrico (gancho).
- 3-24 s: entra bajo y batería suave.
- 24 s al final: sale la batería para el cierre, fundido final.

Uso: python3 make_music.py salida.wav [duracion_segundos]
"""
import sys
import wave

import numpy as np

OUT = sys.argv[1]
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 28.4
SR = 48000
BPM = 80
BEAT = 60 / BPM          # 0.75 s
BAR = 4 * BEAT           # 3.0 s
N = int(SR * DUR)
rng = np.random.default_rng(7)

L = np.zeros(N)
R = np.zeros(N)
SIDE = np.ones(N)        # ganancia de "sidechain" para piano y pad


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(buf, start, sig):
    i = int(round(start * SR))
    if i >= len(buf) or i < 0:
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def onepole_lp(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for k in range(len(x)):
        acc = (1 - a) * x[k] + a * acc
        y[k] = acc
    return y


def release(sig, secs=0.06):
    n = min(len(sig), int(secs * SR))
    sig[-n:] *= np.linspace(1, 0, n)
    return sig


def ep_note(f, dur, vel):
    """Piano eléctrico FM: portadora y moduladora 1:1, índice que decae."""
    t = np.arange(int(SR * dur)) / SR
    index = 1.4 * np.exp(-t / 0.22) + 0.12
    sig = np.sin(2 * np.pi * f * t + index * np.sin(2 * np.pi * f * t))
    sig += 0.10 * np.sin(2 * np.pi * f * 7.0 * t) * np.exp(-t / 0.04)  # ataque metálico
    env = np.minimum(1, t / 0.005) * np.exp(-t / 1.25)
    return release(vel * sig * env)


def pad_note(f, dur, vel, detune_cents):
    t = np.arange(int(SR * dur)) / SR
    fd = f * 2 ** (detune_cents / 1200)
    sig = sum(np.sin(2 * np.pi * fd * k * t) / k for k in range(1, 7))
    env = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.6)
    return vel * sig * env


def bass_note(f, dur, vel):
    t = np.arange(int(SR * dur)) / SR
    sig = np.sin(2 * np.pi * f * t) + 0.22 * np.sin(2 * np.pi * 2 * f * t)
    env = np.minimum(1, t / 0.008) * (0.55 + 0.45 * np.exp(-t / 0.18))
    return release(vel * np.tanh(1.4 * sig) * env, 0.08)


def kick(vel):
    t = np.arange(int(SR * 0.45)) / SR
    freq = 46 + 74 * np.exp(-t / 0.035)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    return vel * np.sin(phase) * np.exp(-t / 0.2)


NOISE = rng.standard_normal(SR)


def snare(vel):
    n = int(SR * 0.25)
    t = np.arange(n) / SR
    x = NOISE[:n]
    band = onepole_lp(x, 3500) - onepole_lp(x, 900)
    body = 0.35 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05)
    return vel * (band * np.exp(-t / 0.09) + body)


def hat(vel):
    n = int(SR * 0.07)
    t = np.arange(n) / SR
    x = NOISE[1000:1000 + n]
    hp = x - onepole_lp(x, 7000)
    return vel * hp * np.exp(-t / 0.018)


# Acordes por compás (MIDI): voicing del piano y raíz del bajo
CHORDS = [
    ([57, 60, 64, 67, 71], 45),  # Am9
    ([53, 57, 60, 64, 67], 41),  # Fmaj9
    ([55, 60, 64, 67, 71], 48),  # Cmaj7
    ([55, 59, 62, 64, 67], 40),  # Em7
]
n_bars = int(np.ceil(DUR / BAR))
DRUMS_FROM, DRUMS_UNTIL = 1, 8  # compases 1..7 (3 s a 24 s)

for b in range(n_bars):
    t0 = b * BAR
    voicing, root = CHORDS[b % 4]
    last_bar = b >= DRUMS_UNTIL
    # piano: golpe en 1, síncopa en 2.5 y anticipo en 3.75 (menos en el cierre)
    hits = [(0.0, 0.62, 2.4), (1.5, 0.36, 1.2), (2.75, 0.30, 1.4)]
    if last_bar:
        hits = [(0.0, 0.62, 4.0)]
    for beat, vel, dur in hits:
        for k, m in enumerate(voicing):
            strum = k * 0.009
            v = vel * (0.85 + 0.3 * rng.random()) / len(voicing) * 2.2
            s = ep_note(hz(m), dur, v)
            place(L, t0 + beat * BEAT + strum, s * (1.0 - 0.15 * (k % 2)))
            place(R, t0 + beat * BEAT + strum, s * (0.85 + 0.15 * (k % 2)))
    # pad suave con las tres notas graves del acorde
    for m in voicing[:3]:
        place(L, t0, pad_note(hz(m), BAR + 0.3, 0.018, -7))
        place(R, t0, pad_note(hz(m), BAR + 0.3, 0.018, +7))
    if DRUMS_FROM <= b < DRUMS_UNTIL:
        f = hz(root)
        for beat, dur, vel in [(0.0, 1.3, 0.34), (2.5, 0.9, 0.28), (3.5, 0.45, 0.2)]:
            s = bass_note(f, dur, vel)
            place(L, t0 + beat * BEAT, s)
            place(R, t0 + beat * BEAT, s)
        for beat in (0.0, 1.75, 2.5):
            k = kick(0.55 if beat == 0 else 0.4)
            place(L, t0 + beat * BEAT, k)
            place(R, t0 + beat * BEAT, k)
            i = int((t0 + beat * BEAT) * SR)
            n = min(N - i, int(0.3 * SR))
            if n > 0:
                SIDE[i:i + n] = np.minimum(SIDE[i:i + n], 1 - 0.3 * np.exp(-np.arange(n) / (0.12 * SR)))
        for beat in (1.0, 3.0):
            s = snare(0.16)
            place(L, t0 + beat * BEAT, s * 0.9)
            place(R, t0 + beat * BEAT, s)
        for e in range(8):
            swing = 0.06 if e % 2 else 0.0
            v = 0.05 if e % 2 else 0.03
            h = hat(v)
            place(L, t0 + (e * 0.5 + swing) * BEAT, h * 0.8)
            place(R, t0 + (e * 0.5 + swing) * BEAT, h)

# Aplicar sidechain sólo al piano/pad no es separable acá; se aplica suave a toda la mezcla.
L *= 0.85 + 0.15 * SIDE
R *= 0.85 + 0.15 * SIDE

# Fundidos: entrada 0.15 s, salida 1.4 s
t = np.arange(N) / SR
fade = np.minimum(1, t / 0.15) * np.minimum(1, (DUR - t) / 1.4)
L *= fade
R *= fade

mix = np.stack([L, R], axis=1)
mix = np.tanh(1.2 * mix) / np.tanh(1.2)
peak = np.abs(mix).max()
mix = mix / peak * 0.89
pcm = (mix * 32767).astype("<i2")
with wave.open(OUT, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"{OUT}: {DUR:.1f}s, pico normalizado")
