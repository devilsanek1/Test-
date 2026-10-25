"""Transcribe a voiceover with Parakeet (sherpa-onnx) and emit word-level timestamps."""
import json
import subprocess
import sys

import numpy as np
import sherpa_onnx

audio_path, model_dir, out_path = sys.argv[1], sys.argv[2], sys.argv[3]

pcm = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", audio_path, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
    check=True, capture_output=True,
).stdout
samples = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0

rec = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=f"{model_dir}/encoder.int8.onnx",
    decoder=f"{model_dir}/decoder.int8.onnx",
    joiner=f"{model_dir}/joiner.int8.onnx",
    tokens=f"{model_dir}/tokens.txt",
    model_type="nemo_transducer",
    num_threads=4,
)
stream = rec.create_stream()
stream.accept_waveform(16000, samples)
rec.decode_stream(stream)
r = stream.result

# Merge sentencepiece tokens into words; a leading "▁"/space starts a new word.
words = []
for tok, ts in zip(r.tokens, r.timestamps):
    starts_word = tok.startswith(" ") or tok.startswith("▁") or not words
    clean = tok.replace("▁", " ").strip()
    if not clean:
        continue
    if starts_word:
        words.append({"w": clean, "s": round(float(ts), 3)})
    else:
        words[-1]["w"] += clean
# Word end = next word's start (capped); refined later against the energy envelope.
dur = len(samples) / 16000
for i, w in enumerate(words):
    w["e"] = round(min(words[i + 1]["s"] if i + 1 < len(words) else dur, w["s"] + 1.2), 3)

json.dump({"text": r.text, "duration": dur, "words": words}, open(out_path, "w"), indent=1)
print(r.text)
print(len(words), "words")
