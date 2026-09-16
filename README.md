# C-Zero Audio Refactoring Lab

C-Zero is an experimental browser-based audio tool intended to preserve rhythm and timing while refactoring melodic material toward a target note or, later, a selected scale. The default target is middle C (`C4`, 261.63 Hz).

## Current milestone

The first vertical slice runs entirely in the browser and includes:

- local audio import and Web Audio decoding;
- waveform rendering and click-to-seek;
- play, pause, stop, volume, time, and file diagnostics;
- target-C octave and refactor-strength controls;
- a clear passthrough state so unimplemented DSP is never mistaken for processing.

No audio is uploaded. In this milestone, playback is deliberately unprocessed.

## Web test

Once GitHub Pages is enabled for the `main` branch/root folder, test at:

**https://diallo100x.github.io/c-zero-web/**

The app is static and has no build step. For local testing, serve the repository with any static server rather than opening `index.html` directly. For example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## First DSP implementation step

Implement a testable **monophonic pitch-analysis adapter** behind a stable processing contract:

1. divide a mono test signal into overlapping frames;
2. estimate fundamental frequency plus confidence per frame;
3. reject silence, percussion, and low-confidence frames;
4. calculate the signed pitch offset from each accepted frame to the chosen C octave;
5. visualize the detected pitch and proposed correction before altering samples.

This is intentionally narrower than full-song de-melodization. Polyphonic songs require source/stem separation or multi-pitch estimation so drums and concurrent notes are not flattened by a whole-mix pitch shifter.

## Planned architecture

```text
Audio file -> Decoder -> Waveform/Transport
                       -> Analysis frames -> Pitch/confidence -> C/scale mapper -> Time-preserving shifter -> Export
```

DSP modules should remain independent of the UI so the same engine can later move into the Instrument Builder, Time-Locked Sampler, or a native app.

## Browser support

Recent Safari, Chrome, Edge, and Firefox releases with Web Audio support. File-format decoding depends on the browser and operating system.

## Status

Prototype / research software. Do not use it as a mastering replacement yet.
