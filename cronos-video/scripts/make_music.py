#!/usr/bin/env python3
"""Genera la música del comercial: 100 % sintetizada acá, sin samples ni copyright.

120 BPM -> 1 beat = 0,5 s = 15 fotogramas a 30 fps, así los cortes del video caen
en beat. Cada pista trae los efectos (impactos, whooshes, golpes) sincronizados con
los tiempos de src/CronosReel.tsx y src/CronosStory.tsx.

Uso:  python3 scripts/make_music.py   ->  public/music/reel.wav y public/music/story.wav
      (scripts/render.sh después los normaliza a -14 LUFS y los pasa a AAC)
"""
import os
import sys

import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
BPM = 120
BEAT = 60 / BPM          # 0,5 s
STEP = BEAT / 4          # semicorchea
BAR = 4 * BEAT           # 2 s

rng = np.random.default_rng(7)


def t_arr(dur):
    return np.arange(int(dur * SR)) / SR


def filt(x, kind, f, order=2):
    sos = butter(order, f, btype=kind, fs=SR, output="sos")
    return sosfilt(sos, x)


def noise(dur):
    return rng.standard_normal(int(dur * SR))


def saw(freq, t, phase=0.0):
    return 2.0 * ((t * freq + phase) % 1.0) - 1.0


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# ---------------------------------------------------------------- one-shots
def kick():
    t = t_arr(0.45)
    f = 47 + 125 * np.exp(-t * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7.0)
    click = filt(noise(0.45), "highpass", 2500) * np.exp(-t * 320) * 0.35
    return np.tanh(1.8 * (body + click)) * 0.95


def clap():
    t = t_arr(0.3)
    env = np.zeros_like(t)
    for d in (0.0, 0.010, 0.020):
        env += np.where(t >= d, np.exp(-(t - d) * 95), 0)
    env += np.where(t >= 0.022, np.exp(-(t - 0.022) * 16) * 0.55, 0)
    return filt(noise(0.3), "bandpass", [900, 5000]) * env * 0.75


def snare():
    t = t_arr(0.22)
    tone = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 30) * 0.5
    nz = filt(noise(0.22), "bandpass", [1500, 8000]) * np.exp(-t * 26)
    return (tone + nz) * 0.6


def hat(open_=False):
    d = 0.2 if open_ else 0.035
    t = t_arr(d)
    k = 14 if open_ else 140
    return filt(noise(d), "highpass", 7500) * np.exp(-t * k) * (0.32 if open_ else 0.26)


def impact(big=True):
    d = 2.8 if big else 1.2
    t = t_arr(d)
    f = 32 + 40 * np.exp(-t * 6)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (1.7 if big else 4.0))
    thump = filt(noise(d), "lowpass", 180) * np.exp(-t * 14) * 1.2
    crash = filt(noise(d), "highpass", 3500) * np.exp(-t * (1.4 if big else 4.5)) * 0.42
    return np.tanh(1.3 * (sub * 1.0 + thump + crash)) * (0.95 if big else 0.6)


def hit():
    """Golpe corto cuando 'aterriza' un número."""
    t = t_arr(0.6)
    f = 70 + 90 * np.exp(-t * 25)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    snap = filt(noise(0.6), "bandpass", [1800, 9000]) * np.exp(-t * 35) * 0.6
    return np.tanh(1.5 * (body + snap)) * 0.7


def whoosh(dur=0.42):
    """Barrido de ruido que crece hasta el corte (el pico queda al final)."""
    n = int(dur * SR)
    x = noise(dur)
    out = np.zeros(n)
    chunk = 1024
    for i in range(0, n, chunk):
        p = i / n
        fc = 300 + 5200 * p ** 2
        seg = filt(x[max(0, i - 512):i + chunk], "bandpass", [fc * 0.6, min(fc * 1.6, 20000)])
        out[i:i + chunk] = seg[-len(out[i:i + chunk]):]
    env = np.linspace(0, 1, n) ** 2.4
    env[-int(0.03 * SR):] *= np.linspace(1, 0, int(0.03 * SR))
    return out * env * 0.55


def riser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = noise(dur)
    out = np.zeros(n)
    chunk = 2048
    for i in range(0, n, chunk):
        p = i / n
        fc = 400 + 7000 * p ** 1.6
        seg = filt(x[max(0, i - 1024):i + chunk], "bandpass", [fc * 0.7, min(fc * 1.5, 20000)])
        out[i:i + chunk] = seg[-len(out[i:i + chunk]):]
    f = 180 + 900 * (t / dur) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.18
    env = (t / dur) ** 2
    return (out * 0.6 + tone) * env


# ---------------------------------------------------------------- instruments
def bass_note(freq, dur):
    t = t_arr(dur)
    x = saw(freq, t) * 0.6 + np.sin(2 * np.pi * freq * t) * 0.7
    x = filt(x, "lowpass", 700)
    a = np.minimum(1, t / 0.004)
    r = np.minimum(1, (dur - t) / 0.02)
    return np.tanh(1.4 * x) * a * r * 0.5


def supersaw(freqs, dur, cutoff, attack, decay=None):
    t = t_arr(dur)
    x = np.zeros_like(t)
    for f in freqs:
        for det in (-0.012, 0.0, 0.011):
            x += saw(f * (1 + det), t, phase=rng.random())
    x = filt(x / (len(freqs) * 3), "lowpass", cutoff)
    env = np.minimum(1, t / attack)
    if decay:
        env *= np.exp(-t * decay)
    env *= np.minimum(1, (dur - t) / 0.05)
    return x * env


def pluck(freq, dur):
    t = t_arr(dur)
    x = saw(freq, t) + 0.5 * saw(freq * 2.003, t)
    x = filt(x, "lowpass", 3200)
    return x * np.exp(-t * 11) * np.minimum(1, t / 0.002) * 0.32


# Progresión en La menor: Am - F - C - G (un acorde por compás)
PROG = [
    (45, [57, 60, 64]),   # Am
    (41, [57, 60, 65]),   # F
    (48, [55, 60, 64]),   # C
    (43, [55, 59, 62]),   # G
]
ARP = [0, 1, 2, 1]


def render(total, sections, origin, impacts_big, impacts_small, hits, whooshes,
           riser_span, end_button):
    n = int(total * SR) + SR * 3
    drums = np.zeros(n)
    bass = np.zeros(n)
    music = np.zeros(n)
    fx = np.zeros(n)
    duck = np.ones(n)

    def add(buf, sig, at, gain=1.0):
        i = int(round(at * SR))
        if i < 0:
            sig = sig[-i:]
            i = 0
        j = min(n, i + len(sig))
        buf[i:j] += sig[: j - i] * gain

    def section_at(ts):
        for a, b, name in sections:
            if a <= ts < b:
                return name
        return None

    K, CL, SN, HC, HO = kick(), clap(), snare(), hat(), hat(True)
    steps = int(total / STEP)
    origin_steps = int(round(origin / STEP))
    for s in range(steps):
        ts = s * STEP
        sec = section_at(ts)
        if sec is None:
            continue
        pos = (s - origin_steps) % 16            # posición en el compás
        bar = (s - origin_steps) // 16
        root, chord = PROG[bar % 4]
        on_beat = pos % 4 == 0
        full = sec in ("hook", "grooveB", "drop", "urgency")

        # ---- batería
        if sec == "build":
            build_end = riser_span[1]
            left = build_end - ts
            if on_beat and left > 1.0:
                add(drums, K, ts)
            rate = 4 if left > 1.0 else (2 if left > 0.5 else 1)
            if pos % rate == 0:
                add(drums, SN, ts, 0.35 + 0.65 * (1 - left / (riser_span[1] - riser_span[0])))
        else:
            if on_beat:
                add(drums, K, ts)
                k_i = int(ts * SR)
                d_len = int(0.22 * SR)
                env = 1 - 0.62 * np.exp(-np.arange(d_len) / SR * 14)
                duck[k_i:k_i + d_len] = np.minimum(duck[k_i:k_i + d_len], env[: len(duck[k_i:k_i + d_len])])
            if pos in (4, 12):
                add(drums, CL, ts)
            if pos % 4 == 2:
                add(drums, HO if full else HC, ts, 0.9)
            elif full and pos % 2 == 1:
                add(drums, HC, ts, 0.55)

        # ---- bajo (corcheas, salta de octava)
        if pos % 2 == 0 and not (sec == "build" and riser_span[1] - ts <= 0.5):
            f = midi(root + (12 if pos % 4 == 2 else 0))
            add(bass, bass_note(f, STEP * 2 * 0.92), ts)

        # ---- acordes
        if pos == 0 and sec in ("grooveA", "outro", "build"):
            add(music, supersaw([midi(c) for c in chord], BAR, 1400, 0.25), ts, 0.30)
        if sec in ("hook", "grooveB", "drop", "urgency") and pos in (0, 3, 6, 10, 14):
            add(music, supersaw([midi(c) for c in chord], STEP * 1.6, 3600, 0.003, decay=9),
                ts, 0.42 if sec == "drop" else 0.34)

        # ---- arpegio (solo en el drop y la urgencia)
        if sec in ("drop", "urgency"):
            note = chord[ARP[pos % 4]] + 12
            add(music, pluck(midi(note), STEP * 1.8), ts, 0.9 if sec == "drop" else 0.6)

    # ---- efectos sincronizados con el video
    if riser_span:
        a, b = riser_span
        add(fx, riser(b - a), a, 0.8)
    for at in impacts_big:
        add(fx, impact(True), at)
    for at in impacts_small:
        add(fx, impact(False), at)
    for at in hits:
        add(fx, hit(), at)
    for at in whooshes:
        w = whoosh()
        add(fx, w, at - len(w) / SR, 0.75)
    if end_button:
        root, chord = PROG[0]
        add(drums, K, end_button)
        add(fx, impact(False), end_button, 0.8)
        add(music, supersaw([midi(c) for c in chord], 1.5, 3000, 0.003, decay=2.5), end_button, 0.5)
        add(bass, bass_note(midi(root), 0.8), end_button)

    mix = drums * 0.95 + bass * duck * 0.95 + music * duck * 0.85 + fx * 0.8
    mix = filt(mix, "highpass", 28)
    mix = mix[: int(total * SR)]
    fade = int(0.35 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade) ** 1.5
    mix = np.tanh(mix * 1.25) / np.tanh(1.25)
    mix /= np.max(np.abs(mix)) + 1e-9
    mix *= 0.89
    stereo = np.stack([mix, mix], axis=1)
    return (stereo * 32767).astype(np.int16)


def write_wav(path, data):
    import wave

    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "public/music"
    os.makedirs(out_dir, exist_ok=True)

    # Reel de 40 s. Los cortes y aterrizajes coinciden con src/CronosReel.tsx (seg = fotograma / 30).
    reel = render(
        total=40.0,
        sections=[
            (0, 3, "hook"),
            (3, 12, "grooveA"),
            (12, 20, "grooveB"),
            (20, 22, "build"),
            (22, 32, "drop"),        # pico de energía: aparece el anticipo
            (32, 36, "urgency"),
            (36, 39.5, "outro"),
        ],
        origin=0.0,
        impacts_big=[0.0, 22.0],
        impacts_small=[3.0, 12.0, 32.0, 36.0],
        # golpes = fotograma en que aterriza cada texto/número / 30
        # (0KM?, JUNTO, AHORRO, $4.000.000, $450.000, resumen x3, ENERO, CONSULTÁ YA, WhatsApp)
        hits=[0.5, 12.767, 16.333, 22.733, 26.667, 30.0, 30.5, 31.0, 32.267, 33.0, 36.467],
        whooshes=[1.5, 5.0, 7.0, 9.5, 14.0, 16.0, 18.0, 20.0, 24.5, 27.0, 29.5],
        riser_span=(20.0, 22.0),
        end_button=39.5,
    )
    write_wav(os.path.join(out_dir, "reel.wav"), reel)

    # Story de 15 s. Coincide con src/CronosStory.tsx.
    story = render(
        total=15.0,
        sections=[
            (0, 2, "hook"),
            (2, 3, "build"),
            (3, 11, "drop"),         # pico de energía: aparece el anticipo
            (11, 14.5, "outro"),
        ],
        origin=3.0,
        impacts_big=[0.0, 3.0],
        impacts_small=[11.0],
        # (0KM?, $4.000.000, $450.000, ENERO, WhatsApp)
        hits=[0.5, 3.733, 6.667, 9.267, 11.467],
        whooshes=[1.5, 6.0, 9.0],
        riser_span=(2.0, 3.0),
        end_button=14.5,
    )
    write_wav(os.path.join(out_dir, "story.wav"), story)
    print("ok")


if __name__ == "__main__":
    main()
