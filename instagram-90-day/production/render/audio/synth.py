#!/usr/bin/env python3
"""
Original, procedurally generated audio for the campaign: music beds and UI sound effects.

Everything here is synthesised from scratch (sine, noise, Karplus-Strong plucks, FM bells),
so there are no third-party samples, loops or licences involved. Output is 48 kHz stereo WAV.

Usage: python3 synth.py <out-dir>
Deterministic: fixed random seeds, so a re-run produces identical files.
"""
import sys, os, wave
import numpy as np

SR = 48000
OUT = sys.argv[1] if len(sys.argv) > 1 else 'audio'
os.makedirs(OUT, exist_ok=True)


# ───────────────────────── helpers ─────────────────────────
def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def env_adsr(n, a=0.01, d=0.1, s=0.7, r=0.2, total=None):
    total = total or n / SR
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    s_n = max(0, n - a_n - d_n - r_n)
    e = np.concatenate([
        np.linspace(0, 1, a_n, endpoint=False),
        np.linspace(1, s, d_n, endpoint=False),
        np.full(s_n, s),
        np.linspace(s, 0, r_n),
    ])
    return np.pad(e, (0, max(0, n - len(e))))[:n]


def exp_env(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def lowpass(x, cutoff):
    # one-pole low-pass, run twice for 12 dB/oct
    a = np.exp(-2 * np.pi * cutoff / SR)
    for _ in range(2):
        y = np.empty_like(x)
        acc = 0.0
        for i in range(len(x)):
            acc = (1 - a) * x[i] + a * acc
            y[i] = acc
        x = y
    return x


def lp_fast(x, cutoff):
    """FFT brick-ish low-pass with a soft roll-off (fast for long buffers)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


def hp_fast(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (cutoff / np.maximum(f, 1e-3)) ** 4)
    return np.fft.irfft(X, len(x))


def bp_fast(x, lo, hi):
    return hp_fast(lp_fast(x, hi), lo)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def reverb(stereo, seconds=2.2, mix=0.25, seed=7, damp=5000):
    rng = np.random.default_rng(seed)
    n = int(seconds * SR)
    out = []
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (seconds / 6.9 * SR))
        ir = lp_fast(ir, damp)
        ir[: int(0.012 * SR)] = 0  # pre-delay
        ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
        sig = stereo[:, ch]
        L = len(sig) + n
        nfft = 1 << (L - 1).bit_length()
        wet = np.fft.irfft(np.fft.rfft(sig, nfft) * np.fft.rfft(ir, nfft), nfft)[: len(sig)]
        out.append(sig * (1 - mix) + wet * mix * 1.4)
    return np.stack(out, axis=1)


def pan(mono, p=0.0):
    l = np.cos((p + 1) * np.pi / 4)
    r = np.sin((p + 1) * np.pi / 4)
    return np.stack([mono * l, mono * r], axis=1)


def soft_clip(x, drive=1.2):
    return np.tanh(x * drive) / np.tanh(drive)


def normalize(x, peak=0.89):
    m = np.max(np.abs(x)) + 1e-9
    return x / m * peak


def write(name, stereo):
    stereo = np.clip(stereo, -1, 1)
    data = (stereo * 32767).astype('<i2')
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print('wrote', name, f'{len(stereo)/SR:.2f}s')


def place(buf, sig, at):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


# ───────────────────────── instruments ─────────────────────────
def pad(freqs, dur, cutoff=1800, detune=0.004, seed=1):
    rng = np.random.default_rng(seed)
    t = t_axis(dur)
    sig = np.zeros_like(t)
    for f in freqs:
        for d in (-detune, 0, detune):
            ph = rng.random() * 2 * np.pi
            # soft saw from 6 harmonics
            for h in range(1, 7):
                sig += np.sin(2 * np.pi * f * (1 + d) * h * t + ph * h) / (h ** 1.6)
    sig = lp_fast(sig, cutoff)
    sig *= env_adsr(len(t), a=min(0.8, dur * 0.3), d=0.4, s=0.85, r=min(1.2, dur * 0.35))
    return sig / (len(freqs) * 3)


def pluck(f, dur=1.2, bright=0.5, seed=0):
    """Karplus-Strong plucked string."""
    rng = np.random.default_rng(seed)
    n = int(dur * SR)
    period = int(SR / f)
    buf = rng.uniform(-1, 1, period)
    buf = lp_fast(np.tile(buf, 4), 2000 + bright * 6000)[:period]
    out = np.empty(n)
    idx = 0
    decay = 0.996
    for i in range(n):
        v = buf[idx]
        out[i] = v
        nxt = buf[(idx + 1) % period]
        buf[idx] = decay * 0.5 * (v + nxt)
        idx = (idx + 1) % period
    return out * exp_env(n, dur * 0.45)


def bell(f, dur=1.6, ratio=3.5, index=2.2):
    t = t_axis(dur)
    mod = np.sin(2 * np.pi * f * ratio * t) * index * exp_env(len(t), 0.35)
    return np.sin(2 * np.pi * f * t + mod) * exp_env(len(t), dur * 0.35)


def keys(f, dur=0.9):
    """Electric-piano-like FM tone."""
    t = t_axis(dur)
    mod = np.sin(2 * np.pi * f * 1.0 * t) * 1.3 * exp_env(len(t), 0.25)
    tone = np.sin(2 * np.pi * f * t + mod) + 0.25 * np.sin(2 * np.pi * f * 2 * t)
    return tone * env_adsr(len(t), a=0.004, d=0.3, s=0.35, r=0.25)


def kick(dur=0.45, f0=120, f1=42):
    t = t_axis(dur)
    f = f1 + (f0 - f1) * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * exp_env(len(t), 0.13) * 0.95


def hat(dur=0.06, seed=3, open_=False):
    rng = np.random.default_rng(seed)
    n = int((0.22 if open_ else dur) * SR)
    x = hp_fast(rng.standard_normal(n), 7000)
    return x * exp_env(n, 0.06 if open_ else 0.012) * 0.35


def clap(seed=5):
    rng = np.random.default_rng(seed)
    n = int(0.25 * SR)
    x = bp_fast(rng.standard_normal(n), 900, 3500)
    e = np.zeros(n)
    for k, off in enumerate((0, 0.009, 0.018)):
        i = int(off * SR)
        e[i:] += exp_env(n - i, 0.008 if k < 2 else 0.06)
    return x * e * 0.4


def sub(f, dur):
    t = t_axis(dur)
    return np.sin(2 * np.pi * f * t) * env_adsr(len(t), a=0.01, d=0.1, s=0.9, r=0.08)


def noise_bed(dur, seed=11, lo=200, hi=2500, level=0.03):
    rng = np.random.default_rng(seed)
    return bp_fast(rng.standard_normal(int(dur * SR)), lo, hi) * level


def vinyl(dur, seed=13):
    rng = np.random.default_rng(seed)
    n = int(dur * SR)
    x = lp_fast(rng.standard_normal(n), 5000) * 0.006
    clicks = (rng.random(n) > 0.99985).astype(float) * rng.uniform(0.05, 0.18, n)
    return x + lp_fast(clicks, 3000)


# ───────────────────────── music beds ─────────────────────────
def bed(name, bpm, chords, bars_per_chord=1, beats=4, total_bars=16, drums='pulse',
        lead='pluck', cutoff=1800, rev=0.28, seed=1, swing=0.0, extra=None, root_oct=0, arp_pattern=(0, 1, 2, 1)):
    spb = 60 / bpm
    bar = spb * beats
    dur = bar * total_bars + 2.5
    L = np.zeros(int(dur * SR))
    R = np.zeros(int(dur * SR))
    music = np.zeros((len(L), 2))

    def add(sig, at, p=0.0, g=1.0):
        st = pan(sig * g, p)
        i = int(at * SR)
        j = min(len(music), i + len(st))
        if i < len(music):
            music[i:j] += st[: j - i]

    for b in range(total_bars):
        ch = chords[(b // bars_per_chord) % len(chords)]
        bar_t = b * bar
        # pads: one per chord change
        if b % bars_per_chord == 0:
            add(pad([midi(n + root_oct) for n in ch], bar * bars_per_chord + 0.6, cutoff=cutoff, seed=seed + b), bar_t, 0, 0.55)
            # bass on root
            add(sub(midi(ch[0] - 12 + root_oct), bar * bars_per_chord * 0.98), bar_t, 0, 0.32 if drums else 0.22)
        # lead arps
        if lead:
            steps = beats * 2
            for s in range(steps):
                if lead == 'sparse' and s % 4 != 0:
                    continue
                if lead == 'half' and s % 2 != 0:
                    continue
                note = ch[arp_pattern[s % len(arp_pattern)] % len(ch)] + 12 + root_oct
                at = bar_t + s * spb / 2 + (swing * spb / 2 if s % 2 else 0)
                p = -0.35 if s % 2 else 0.35
                if lead in ('pluck', 'sparse', 'half'):
                    add(pluck(midi(note), 0.9, 0.4, seed=s + b), at, p, 0.22)
                elif lead == 'bell':
                    if s % 2 == 0:
                        add(bell(midi(note + 12), 1.4), at, p, 0.10)
                elif lead == 'keys':
                    if s % 2 == 0:
                        add(keys(midi(note), 0.8), at, p, 0.16)
        # drums
        if drums:
            for k in range(beats):
                at = bar_t + k * spb
                if drums in ('pulse', 'full', 'lofi'):
                    if k in (0, 2) or (drums == 'full' and k == 3 and b % 2):
                        add(kick(), at, 0, 0.55 if drums != 'lofi' else 0.45)
                    if drums in ('full', 'lofi') and k in (1, 3):
                        add(clap(seed=b + k), at, 0.05, 0.6 if drums == 'full' else 0.42)
                    for hh in range(2):
                        hat_at = at + hh * spb / 2 + (swing * spb / 2 if hh else 0)
                        add(hat(seed=b * 8 + k * 2 + hh, open_=(hh == 1 and k == 3 and drums == 'full')), hat_at, 0.25, 0.55 if hh else 0.35)
                elif drums == 'tick':
                    for q in range(4):
                        add(hat(0.03, seed=b * 16 + k * 4 + q), at + q * spb / 4, -0.2 + 0.4 * (q % 2), 0.45 if q == 0 else 0.25)
                    if k == 0:
                        add(kick(0.3, 90, 40), at, 0, 0.35)
                elif drums == 'heart':
                    if k == 0:
                        add(kick(0.35, 70, 38), at, 0, 0.5)
                        add(kick(0.3, 64, 36), at + spb * 0.32, 0, 0.32)
    if extra == 'vinyl':
        v = vinyl(dur)
        music += np.stack([v, v * 0.9], axis=1)
    if extra == 'air':
        nb = noise_bed(dur, seed=seed + 50, lo=300, hi=3000, level=0.012)
        music += pan(nb, 0.1)
    music = reverb(music, seconds=2.4, mix=rev, seed=seed)
    music = soft_clip(music, 1.1)
    # fade tail
    fade = int(2.0 * SR)
    music[-fade:] *= np.linspace(1, 0, fade)[:, None]
    write(name, normalize(music, 0.8))


# Chords as MIDI notes (C4 = 60)
Dm9 = [50, 57, 60, 64, 65]
Bbmaj7 = [46, 53, 57, 62, 65]
Fmaj7 = [53, 57, 60, 64]
C6 = [48, 55, 60, 64, 69]
Am7 = [45, 52, 55, 60, 64]
Gsus = [43, 50, 55, 60, 62]
Em7 = [52, 55, 59, 62, 64]
Cmaj9 = [48, 55, 59, 62, 64]
Ebmaj7 = [51, 58, 62, 65]
Cm9 = [48, 55, 58, 62, 63]
Abmaj7 = [44, 51, 55, 60, 63]
Gm7 = [43, 50, 53, 58, 62]
Fsus2 = [41, 48, 53, 55, 60]
Dmaj9 = [50, 57, 61, 64, 66]
Bm7 = [47, 54, 57, 62, 66]
Gmaj7 = [43, 50, 54, 59, 62]
A6 = [45, 52, 57, 61, 66]


def sfx_set():
    rng = np.random.default_rng(42)

    def tap():
        n = int(0.05 * SR)
        x = bp_fast(rng.standard_normal(n), 1500, 6000) * exp_env(n, 0.004)
        x += np.sin(2 * np.pi * 1900 * t_axis(0.05)) * exp_env(n, 0.006) * 0.4
        return pan(x * 0.7, 0)

    def key_click(seed):
        r = np.random.default_rng(seed)
        n = int(0.035 * SR)
        x = bp_fast(r.standard_normal(n), 2000, 7000) * exp_env(n, 0.003)
        x += np.sin(2 * np.pi * r.uniform(900, 1300) * t_axis(0.035)) * exp_env(n, 0.005) * 0.25
        return x * 0.5

    def typing(sec=1.6):
        buf = np.zeros(int(sec * SR))
        t = 0.0
        k = 0
        while t < sec - 0.05:
            place(buf, key_click(k), t)
            t += np.random.default_rng(k).uniform(0.06, 0.13)
            k += 1
        return pan(buf, 0.05)

    def ding(f1=1318.5, f2=1760, gap=0.11, level=0.35):
        sec = 1.3
        buf = np.zeros(int(sec * SR))
        place(buf, bell(f1, 1.0, ratio=2.0, index=0.8), 0)
        place(buf, bell(f2, 1.1, ratio=2.0, index=0.8), gap)
        return reverb(pan(buf * level, 0), 1.0, 0.2, seed=3)

    def error():
        sec = 0.42
        t = t_axis(sec)
        x = (np.sign(np.sin(2 * np.pi * 110 * t)) * 0.5 + np.sin(2 * np.pi * 116 * t)) * 0.3
        x = lp_fast(x, 1400)
        e = np.zeros(len(t))
        for off in (0, 0.2):
            i = int(off * SR)
            e[i:i + int(0.16 * SR)] = 1
        return pan(x * e * np.linspace(1, 0.8, len(t)), 0)

    def success():
        sec = 1.0
        buf = np.zeros(int(sec * SR))
        place(buf, bell(midi(76), 0.8, 2.0, 1.0) * 0.4, 0)
        place(buf, bell(midi(83), 0.9, 2.0, 1.0) * 0.4, 0.09)
        return reverb(pan(buf, 0), 1.0, 0.25, seed=4)

    def ring(sec=2.0):
        # North American ringing tone: 440 Hz + 480 Hz
        t = t_axis(sec)
        x = (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)) * 0.18
        x *= env_adsr(len(t), 0.02, 0.0, 1, 0.05)
        return pan(lp_fast(x, 3000), 0)

    def ringtone(sec=1.6):
        # marimba-ish phone ringtone (original pattern)
        buf = np.zeros(int(sec * SR))
        seq = [76, 81, 79, 84, 76, 81, 79, 84]
        for i, n in enumerate(seq):
            place(buf, pluck(midi(n), 0.4, 0.8, seed=i) * 0.4 + bell(midi(n), 0.4, 3.0, 0.5) * 0.15, i * 0.12 + (0.25 if i >= 4 else 0))
        return reverb(pan(buf, 0), 1.0, 0.15)

    def vibrate(sec=0.8):
        t = t_axis(sec)
        x = np.sin(2 * np.pi * 165 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * t))
        e = ((t % 0.4) < 0.28).astype(float)
        return pan(lp_fast(x * e, 900) * 0.4, 0)

    def whoosh(sec=0.6, lo=300, hi=6000, rev=True):
        n = int(sec * SR)
        x = rng.standard_normal(n)
        # sweep by crossfading two band-passed copies
        a = bp_fast(x, lo, lo * 3)
        b = bp_fast(x, hi / 3, hi)
        mix = np.linspace(0, 1, n) if not rev else np.concatenate([np.linspace(0, 1, n // 2), np.linspace(1, 0, n - n // 2)])
        y = a * (1 - mix) + b * mix
        e = np.sin(np.linspace(0, np.pi, n)) ** 1.5
        return pan(y * e * 0.35, 0)

    def swipe():
        return whoosh(0.28, 600, 7000, rev=False)

    def paper():
        n = int(0.5 * SR)
        x = bp_fast(rng.standard_normal(n), 1200, 9000)
        grain = (rng.random(n) > 0.7) * 1.0
        e = np.sin(np.linspace(0, np.pi, n)) ** 2
        return pan(x * (0.5 + 0.5 * lp_fast(grain, 200)) * e * 0.3, -0.1)

    def shutter():
        buf = np.zeros(int(0.25 * SR))
        for off, f in ((0, 3500), (0.07, 2500)):
            n = int(0.05 * SR)
            place(buf, bp_fast(rng.standard_normal(n), f / 2, f * 2) * exp_env(n, 0.008), off)
        return pan(buf * 0.6, 0)

    def scan():
        sec = 0.3
        t = t_axis(sec)
        x = np.sin(2 * np.pi * 2093 * t) * env_adsr(len(t), 0.005, 0.02, 0.8, 0.05) * 0.25
        return pan(x, 0)

    def pop():
        sec = 0.12
        t = t_axis(sec)
        f = 900 * np.exp(-t * 30) + 300
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * exp_env(len(t), 0.025)
        return pan(x * 0.45, 0)

    def tick():
        n = int(0.03 * SR)
        x = hp_fast(rng.standard_normal(n), 3000) * exp_env(n, 0.003)
        return pan(x * 0.45, 0)

    def impact():
        sec = 1.6
        x = kick(1.2, 80, 30)
        x = np.pad(x, (0, int(sec * SR) - len(x)))
        x += lp_fast(rng.standard_normal(len(x)), 400) * exp_env(len(x), 0.25) * 0.4
        return reverb(pan(x * 0.8, 0), 2.0, 0.3)

    def riser(sec=1.4):
        n = int(sec * SR)
        t = t_axis(sec)
        f = 200 * (4 ** (t / sec))
        tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.15
        nz = hp_fast(rng.standard_normal(n), 2000) * 0.12 * (t / sec) ** 2
        e = (t / sec) ** 1.8
        return reverb(pan((tone + nz) * e, 0), 1.2, 0.25)

    def stamp():
        x = kick(0.25, 160, 60) * 0.6
        n = len(x)
        x += bp_fast(rng.standard_normal(n), 200, 2000) * exp_env(n, 0.02) * 0.5
        return pan(x, 0)

    def sent():
        sec = 0.45
        n = int(sec * SR)
        x = whoosh(0.35, 800, 5000, rev=False)[:, 0]
        x = np.pad(x, (0, n - len(x)))
        x += bell(midi(88), sec, 2, 0.5) * 0.12
        return pan(x, 0.1)

    def glitch():
        sec = 0.35
        n = int(sec * SR)
        x = np.sign(np.sin(2 * np.pi * np.repeat(rng.uniform(200, 1800, 12), n // 12 + 1)[:n] * t_axis(sec)))
        x = x * (rng.random(n) > 0.3) * 0.18
        return pan(lp_fast(x, 5000), 0)

    def hum(sec=3.0):
        # fluorescent/room tone for cold opens
        t = t_axis(sec)
        x = np.sin(2 * np.pi * 60 * t) * 0.05 + np.sin(2 * np.pi * 120 * t) * 0.03
        x += noise_bed(sec, 77, 200, 1500, 0.02)
        return pan(x, 0)

    def door():
        sec = 0.9
        n = int(sec * SR)
        x = np.zeros(n)
        place(x, bell(midi(91), 0.8, 2.76, 1.4) * 0.18, 0)
        place(x, bell(midi(86), 0.9, 2.76, 1.4) * 0.14, 0.02)
        return reverb(pan(x, 0.2), 1.2, 0.3)

    def street(sec=4.0):
        x = noise_bed(sec, 91, 80, 1200, 0.05)
        # passing car swell
        t = t_axis(sec)
        x *= 0.6 + 0.4 * np.exp(-((t - sec * 0.55) ** 2) / 0.6)
        return pan(x, -0.1)

    for name, fn in [
        ('tap', tap), ('typing', typing), ('notify', ding), ('error', error), ('success', success),
        ('ring', ring), ('ringtone', ringtone), ('vibrate', vibrate), ('whoosh', whoosh), ('swipe', swipe),
        ('paper', paper), ('shutter', shutter), ('scan', scan), ('pop', pop), ('tick', tick),
        ('impact', impact), ('riser', riser), ('stamp', stamp), ('sent', sent), ('glitch', glitch),
        ('hum', hum), ('door', door), ('street', street),
    ]:
        write('sfx-' + name, fn())


if __name__ == '__main__':
    which = sys.argv[2] if len(sys.argv) > 2 else 'all'
    if which in ('all', 'sfx'):
        sfx_set()
    if which in ('all', 'beds'):
        # 1 · signal: the brand bed. Minimal pulse, warm minor-major colour.
        bed('bed-signal', 96, [Dm9, Bbmaj7, Fmaj7, C6], 1, total_bars=16, drums='pulse', lead='pluck', cutoff=1700, seed=1)
        # 2 · night-drive: darker, slower, for customer POV cold opens.
        bed('bed-night', 84, [Cm9, Abmaj7, Ebmaj7, Gm7], 1, total_bars=14, drums='heart', lead='sparse', cutoff=1200, rev=0.35, seed=2, extra='air')
        # 3 · paper: bright, quick plucks for playbooks and tests.
        bed('bed-paper', 108, [Cmaj9, Am7, Fmaj7, Gsus], 1, total_bars=18, drums='full', lead='pluck', cutoff=2400, rev=0.2, seed=3)
        # 4 · clockwork: ticking tension for countdowns and missed calls.
        bed('bed-clock', 120, [Am7, Fmaj7, Am7, Em7], 1, total_bars=20, drums='tick', lead='half', cutoff=1500, rev=0.22, seed=4, arp_pattern=(0, 2))
        # 5 · dawn: slow, hopeful, for the founder and case studies.
        bed('bed-dawn', 72, [Dmaj9, Bm7, Gmaj7, A6], 2, total_bars=12, drums=None, lead='bell', cutoff=1600, rev=0.4, seed=5, extra='air')
        # 6 · workshop: lo-fi swing for build breakdowns.
        bed('bed-workshop', 88, [Fmaj7, Em7, Dm9, Cmaj9], 1, total_bars=14, drums='lofi', lead='keys', cutoff=1300, rev=0.25, seed=6, swing=0.18, extra='vinyl')
        # 7 · resolve: uplifting payoff bed.
        bed('bed-resolve', 100, [Gmaj7, Dmaj9, Em7, A6], 1, total_bars=16, drums='full', lead='bell', cutoff=2200, rev=0.3, seed=7)
        # 8 · drone: no beat; a held low tension for quiet frames.
        bed('bed-drone', 60, [Cm9, Abmaj7], 2, total_bars=8, drums=None, lead=None, cutoff=700, rev=0.5, seed=8, extra='air')
