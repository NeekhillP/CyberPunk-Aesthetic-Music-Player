# SEVEN.FM - Retro-Futuristic Cyberpunk Terminal Music Player
**Project Progress & Architecture Tracker**

---

## 1. Current State
- **Status:** Phase 2.5 Complete (Automatic ID3 Tag Reading, Embedded Cover Art Extraction, LRCLIB Online Auto-Sync).
- **Version:** v0.2.5
- **Repository:** `https://github.com/NeekhillP/CyberPunk-Aesthetic-Music-Player.git`
- **Operational Features:**
  - ✅ **Automatic ID3 Metadata Extraction:** Client-side metadata reading for Title, Artist, Album, Duration, and Embedded Lyrics.
  - ✅ **Embedded Cover Art Pipeline:** Extracts embedded `APIC`/`picture` bytes and renders high-res artwork dynamically in the duotone CRT frame.
  - ✅ **3-Tier Synchronized Lyric Engine:**
    - *Tier 1:* Embedded ID3 Synchronized / Unsynchronized Lyrics (`SYLT`/`USLT`).
    - *Tier 2:* Local Companion `.lrc` file auto-pairing.
    - *Tier 3:* Real-time online telemetry lookup via LRCLIB API (`lrclib.net`) with synced & plain lyric fallbacks.
  - ✅ **Terminal Status Badges:** Displays lyric source telemetry (`[LRC AUTO-SYNCED • LRCLIB]`, `[ID3 EMBEDDED]`, `[LOCAL LRC]`).
  - ✅ **Real Web Audio API Engine:** Single persistent `HTMLAudioElement` connected to `AnalyserNode` (64 FFT bins) and `GainNode`.
  - ✅ **Spectrum Visualizer Reactivity:** 24-band dual-zone LED `<canvas>` visualizer directly reacting to real audio frequencies.
  - ✅ **Batch Drag-and-Drop Importer:** Full-window drag & drop HUD with scanning indicator `[SCANNING ID3/TELEMETRY...]`.
  - ✅ **Zustand State Persistence:** Preferences (volume, mute, auto-scroll, active track) saved in `localStorage`.

---

## 2. Changelog

### [v0.2.5] - 2026-08-15
- Integrated audio metadata extraction using client-side metadata parsing.
- Implemented embedded album cover art extraction to dynamic object URLs.
- Built 3-Tier Lyric Resolution service with LRCLIB API integration (`https://lrclib.net/api/get` + search fallback).
- Added terminal scanning indicator HUD (`[SCANNING ID3/TELEMETRY...]`) during file batch ingestion.
- Updated `UploadModal`, `App.jsx`, `AlbumArt`, and `LyricsPanel` with metadata badges.

### [v0.2.0] - 2026-08-15
- Replaced simulated timer with real HTML5 audio decoding and Web Audio API graph.
- Generated and bundled offline audio assets (`loving_machine.wav`, `neon_solitude.wav`).
- Integrated Zustand `persist` middleware.
- Built multi-file batch importer modal and full-screen drag-and-drop HUD.

### [v0.1.1] - 2026-08-15
- Configured `.gitignore`, initialized local Git repository, created initial commit, and pushed `main` to GitHub.

### [v0.1.0-alpha] - 2026-08-15
- Initial scaffolding of project with Vite, React 18, Tailwind CSS, Zustand, and Lucide icons.

---

## 3. Roadmap & Immediate Priorities
- [x] **Phase 1:** Core terminal player wireframe, visualizer, duotone art, LRC sync.
- [x] **Milestone Checkpoint:** Git setup, initial commit, GitHub remote link.
- [x] **Phase 2:** Real Web Audio HTML5 playback pipeline, offline audio tracks, multi-file batch drag & drop importer with auto-pair LRC.
- [x] **Phase 2.5 (Current):** ID3 tag extraction, embedded cover art rendering, and LRCLIB online lyric auto-fetch.
- [ ] **Phase 3:** Advanced audio DSP effects (CRT vinyl crackle filter, reverb, lowpass radio filter switch, 5-band terminal equalizer presets).
- [ ] **Phase 4:** Waveform visualizer modes (Spectrum LED blocks vs Oscilloscope Waveform vs Peak VU Meter).
- [ ] **Phase 5:** Desktop packaging (Electron / Tauri wrapper scripts).

---

## 4. Known Issues / Tech Debt
- *None currently identified.*
