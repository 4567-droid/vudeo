#!/usr/bin/env python3
"""Agrega una locución en español rioplatense al video sin tocar las imágenes.

    pip install edge-tts            # una sola vez (necesita internet)
    python3 scripts/locucion.py video.mp4

Genera, al lado del video:
  - video_con_voz.mp4  -> el mismo video (stream de imagen copiado bit a bit) con la
                          voz mezclada sobre la música; la música baja cuando habla la voz.
  - locucion.mp3       -> la voz sola, ya sincronizada con el video (misma duración).

Cada frase va en su escena. Si una frase no entra en su tramo, primero se le pide a
edge-tts que hable más rápido (suena natural) y, si todavía se pasa, se acelera con atempo.

Opcional: --frases CARPETA usa audios propios (frase1.mp3 ... frase6.mp3) en lugar de edge-tts,
por ejemplo para regrabar una frase. Requiere ffmpeg y ffprobe en el PATH.
"""
import argparse
import asyncio
import math
import os
import shutil
import subprocess
import sys
import tempfile

VOICE = "es-AR-TomasNeural"

# (inicio s, fin s, frase): tramos según los cortes del Reel de 40 s
# (gancho, auto, solución, plan, urgencia, WhatsApp).
GUION = [
    (0, 3, "¿Querés tu Fiat Cronos cero kilómetro?"),
    (3, 12, "El Cronos negro que estabas buscando, listo para vos."),
    (12, 22, "Y lo mejor: no necesitás tener todo el dinero junto. "
             "Con el plan de ahorro de Scuderia Fiat, llegás a tu cero kilómetro."),
    (22, 32, "Anticipo de cuatro millones y cuotas desde cuatrocientos cincuenta mil pesos. "
             "Entrega en enero."),
    (32, 36, "No esperes más. Consultá ya."),
    (36, 40, "Escribinos al WhatsApp: tres, seis, dos, cuatro, dos, siete, uno, uno, cinco, dos."),
]

LEAD = 0.12      # la frase arranca apenas después del corte
TAIL = 0.15      # y termina antes del corte siguiente
MAX_SPEED = 1.25 # aceleración máxima total: más rápido, los números dejan de entenderse
GAP = 0.3        # silencio mínimo entre dos frases
SR = 48000


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"Falló: {' '.join(cmd)}\n{r.stderr[-2000:]}")
    return r.stdout


def duration(path):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                      "-of", "csv=p=0", path]).strip())


async def tts(text, rate, out):
    import edge_tts  # se importa acá para que --frases funcione sin edge-tts

    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    await edge_tts.Communicate(text, VOICE, rate=f"{rate:+d}%", proxy=proxy).save(out)


def trim(src, dst):
    """Saca los silencios de punta y cola que agrega el TTS."""
    sil = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02"
    run(["ffmpeg", "-y", "-v", "error", "-i", src, "-af",
         f"{sil},areverse,{sil},areverse,aformat=sample_rates={SR}:channel_layouts=mono", dst])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("--frases", help="carpeta con frase1.mp3 ... frase6.mp3 (en lugar de edge-tts)")
    ap.add_argument("--salida", help="carpeta de salida (por defecto, la del video)")
    args = ap.parse_args()

    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            sys.exit(f"Falta {tool} en el PATH.")
    video = os.path.abspath(args.video)
    out_dir = os.path.abspath(args.salida or os.path.dirname(video))
    total = duration(video)
    tmp = tempfile.mkdtemp(prefix="locucion-")

    placed = []
    print(f"Video: {video} ({total:.2f} s)\n")
    for i, (a, b, text) in enumerate(GUION, 1):
        avail = (b - a) - LEAD - TAIL
        raw, clean = os.path.join(tmp, f"raw{i}.mp3"), os.path.join(tmp, f"f{i}.wav")
        rate = 0
        if args.frases:
            src = next((os.path.join(args.frases, f"frase{i}.{e}") for e in ("mp3", "wav", "m4a")
                        if os.path.exists(os.path.join(args.frases, f"frase{i}.{e}"))), None)
            if not src:
                sys.exit(f"No encuentro frase{i}.mp3/.wav/.m4a en {args.frases}")
            trim(src, clean)
        else:
            asyncio.run(tts(text, 0, raw))
            trim(raw, clean)
            d = duration(clean)
            if d > avail:
                # edge-tts acelera de forma natural; se pide un poco más de lo justo
                rate = min(round((MAX_SPEED - 1) * 100), math.ceil((d / avail - 1) * 100) + 3)
                asyncio.run(tts(text, rate, raw))
                trim(raw, clean)
        d = duration(clean)
        tempo = 1.0
        if d > avail:
            # completa con atempo sin pasar la aceleración máxima total
            tempo = min(d / avail * 1.01, MAX_SPEED / (1 + rate / 100))
            if tempo > 1.005:
                fast = os.path.join(tmp, f"f{i}_fast.wav")
                run(["ffmpeg", "-y", "-v", "error", "-i", clean, "-af", f"atempo={tempo:.4f}", fast])
                clean = fast
            else:
                tempo = 1.0
        final = duration(clean)
        start = a + LEAD
        note = ""
        if final > avail:
            # sigue sin entrar: termina al final de su tramo y arranca antes, en el silencio
            # que deja la frase anterior (nunca encima de ella)
            prev_end = placed[-1][0] + placed[-1][2] if placed else 0.0
            start = max(prev_end + GAP, b - TAIL - final)
            note = f"  ATENCIÓN: arranca {a - start:.2f}s antes de su escena para no acelerarla de más"
            if start + final > b:
                note += f"; igual se pasa {start + final - b:.2f}s del corte: acortá la frase"
        placed.append((start, clean, final))
        extra = []
        if rate:
            extra.append(f"edge-tts +{rate}%")
        if tempo > 1:
            extra.append(f"atempo x{tempo:.2f}")
        print(f"  {i}. {a:>4.1f}-{b:<4.1f}s  entra {start:5.2f}s, dura {final:4.2f}s "
              f"(lugar {avail:4.2f}s){'  -> ' + ', '.join(extra) if extra else ''}{note}")

    # ---- pista de voz alineada al video
    voice = os.path.join(tmp, "voz.wav")
    cmd = ["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-t", f"{total}", "-i",
           f"anullsrc=r={SR}:cl=mono"]
    for _, path, _ in placed:
        cmd += ["-i", path]
    chains, labels = [], ["[0:a]"]
    for k, (start, _, _) in enumerate(placed, 1):
        ms = int(round(start * 1000))
        chains.append(f"[{k}:a]adelay={ms}:all=1[v{k}]")
        labels.append(f"[v{k}]")
    chains.append(
        f"{''.join(labels)}amix=inputs={len(labels)}:normalize=0:duration=first,"
        "highpass=f=80,acompressor=threshold=0.1:ratio=3:attack=5:release=120,"
        "loudnorm=I=-15:TP=-1.5:LRA=7,"
        f"aformat=sample_rates={SR}:channel_layouts=stereo[voz]")
    cmd += ["-filter_complex", ";".join(chains), "-map", "[voz]", "-t", f"{total}", voice]
    run(cmd)

    mp3 = os.path.join(out_dir, "locucion.mp3")
    run(["ffmpeg", "-y", "-v", "error", "-i", voice, "-c:a", "libmp3lame", "-b:a", "192k", mp3])

    # ---- mezcla: la voz comprime (ducking) la música del video, unos -10 dB mientras habla
    out = os.path.join(out_dir, "video_con_voz.mp4")
    fc = (f"[0:a]aformat=sample_rates={SR}:channel_layouts=stereo[mus];"
          "[1:a]asplit=2[voz][sc];"
          "[mus][sc]sidechaincompress=threshold=0.05:ratio=4:attack=10:release=450:knee=3[duck];"
          "[duck][voz]amix=inputs=2:normalize=0:duration=first,"
          "loudnorm=I=-14:TP=-1.0:LRA=11[mix]")
    run(["ffmpeg", "-y", "-v", "error", "-i", video, "-i", voice, "-filter_complex", fc,
         "-map", "0:v:0", "-map", "[mix]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
         "-ar", str(SR), "-map_metadata", "0", "-movflags", "+faststart", out])
    shutil.rmtree(tmp, ignore_errors=True)
    print(f"\nListo:\n  {out}\n  {mp3}")


if __name__ == "__main__":
    main()
