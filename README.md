# C-Zero Audio Refactoring Lab

C-Zero is an experimental browser audio tool for preserving a source timeline while refactoring dominant melodic pitch toward C or a selected scale. The long-term engine is intended to become part of the Instrument Builder infrastructure and later feed the Time-Locked Sampler.

## Current milestone

The browser test now includes local audio import, waveform/transport, dominant-pitch analysis on overlapping frames, C-Zero root-only mapping, major/natural-minor/minor-pentatonic/chromatic scale mapping, adjustable correction strength, original/processed A-B preview, and processed WAV export.

Processing stays local in the browser; audio is not uploaded.

### Important DSP limitation

This is the first audible processing prototype, not the final full-mix algorithm. It works best on monophonic and melody-dominant material. A polyphonic master contains simultaneous notes plus drums/noise, so reliable full-song de-melodization requires stem-aware processing and/or multi-pitch estimation. The current overlap-add resynthesis keeps output duration fixed but can introduce artifacts on complex material.

## Web test

GitHub Pages target:

**https://diallo100x.github.io/c-zero-web/**

The app is static and has no build step. Local test:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Processing path

```text
Audio file
  -> Web Audio decode
  -> overlapping analysis frames
  -> dominant F0 + voiced-frame gate
  -> nearest C / selected-scale note
  -> strength interpolation
  -> fixed-timeline overlap-add resynthesis
  -> A/B preview
  -> WAV export
```

## Next DSP steps

1. Separate transient/percussive energy from pitched energy so drums remain untouched.
2. Replace the prototype frame resampler with a higher-quality phase-vocoder or PSOLA-style time-preserving pitch engine.
3. Add multi-pitch/polyphonic analysis or stem adapters for full mixes.
4. Add pitch/confidence visualization and per-region correction diagnostics.
5. Package the DSP contract so the same refactor engine can be reused by Instrument Builder and Time-Locked Sampler.

## Status

Prototype / research software. Do not use it as a mastering replacement yet.

## v0.2 development — Melodic Refactor Engine

The `v0.2-melodic-refactor` branch adds two explicit transformation models:

- **Flatten**: move each voiced note center to the selected pitch class in its nearest octave rather than forcing all material into one physical C.
- **Scale Conform**: move each detected note center to the nearest legal degree of the selected root/scale.
- **Expression Preserve**: retain a selectable percentage of the original cents deviation around the newly mapped note center, preserving vibrato/bends while changing the underlying melody.
- Added Dorian, Mixolydian and Harmonic Minor targets in addition to the existing scales.

This is the first step toward a shared PaperChase pitch/scale analysis contract for C-Zero, Instrument DNA, Voice → Instrument, Instrument Builder and Time-Locked Sampler. The browser autocorrelation/resampler remains a prototype; FCPE/RMVPE/GAME-style analysis and higher-quality resynthesis are later engine upgrades.
