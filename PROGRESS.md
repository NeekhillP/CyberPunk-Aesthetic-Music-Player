# SEVEN.FM - Retro-Futuristic Cyberpunk Terminal Music Player
**Project Progress & Architecture Tracker**

---

## 1. Current State
- **Status:** Phase 2.6 Complete (Multi-tier Cover Art Pipeline: Embedded ID3 APIC + Online iTunes/Deezer Search API Fallback).
- **Version:** v0.2.6
- **Repository:** `https://github.com/NeekhillP/CyberPunk-Aesthetic-Music-Player.git`
- **Operational Features:**
  - ✅ **Multi-Tier Cover Art Pipeline:**
    - *Tier 1:* Embedded ID3 APIC / picture extraction from audio buffer.
    - *Tier 2:* High-resolution online artwork resolution via iTunes Search API (`600x600bb`).
    - *Tier 3:* Cyberpunk duotone fallback placeholder with error recovery.
  - ✅ **Dynamic Album Art Frame:** `AlbumArt.jsx` bound to `currentTrack.coverUrl` / `artwork` with CRT scanline shader, moving laser beam, and image load error fallback.
  - ✅ **Automatic ID3 Metadata Extraction:** Client-side metadata reading for Title, Artist, Album, Duration, and Embedded Lyrics.
  - ✅ **3-Tier Synchronized Lyric Engine:** Embedded ID3 (`SYLT`/`USLT`), companion `.lrc`, and LRCLIB online API auto-sync.
  - ✅ **Real Web Audio API Engine:** `HTMLAudioElement` connected to `AnalyserNode` and `GainNode`.
  - ✅ **Spectrum Visualizer Reactivity:** 24-band dual-zone LED `<canvas>` visualizer reacting to real audio frequencies.
  - ✅ **Batch Drag-and-Drop Importer:** Full-window drag & drop HUD with scanning indicator `[SCANNING ID3/TELEMETRY...]`.
  - ✅ **Zustand State Persistence:** Preferences (volume, mute, auto-scroll, active track) saved in `localStorage`.

---

## 2. Changelog

### [v0.2.6] - 2026-08-15
- Built `src/utils/artworkService.js` implementing a multi-tier artwork resolver:
  1. Embedded ID3 APIC picture tags.
  2. High-resolution iTunes Search API lookup (`600x600bb`) with regex title cleaning.
  3. Default retro cyberpunk placeholder with `onError` image fallback.
- Updated `AlbumArt.jsx`, `UploadModal.jsx`, `App.jsx`, and `PlaylistModal.jsx` to dynamically bind to `coverUrl` / `artwork`.
- Updated scanning HUD to reflect artwork telemetry resolution `[FETCHING ARTWORK: <title>...]`.
- Tested and verified production build with Vite.

### [v0.2.5] - 2026-08-15
- Integrated audio metadata extraction using client-side metadata parsing.
- Implemented embedded album cover art extraction to dynamic object URLs.
- Built 3-Tier Lyric Resolution service with LRCLIB API integration.

### [v0.2.0] - 2026-08-15
- Replaced simulated timer with real HTML5 audio decoding and Web Audio API graph.
- Generated and bundled offline audio assets.
- Integrated Zustand `persist` middleware.

### [v0.1.1] - 2026-08-15
- Configured `.gitignore`, initialized local Git repository, created initial commit, and pushed `main` to GitHub.

---

## 3. Roadmap & Immediate Priorities
- [x] **Phase 1:** Core terminal player wireframe, visualizer, duotone art, LRC sync.
- [x] **Milestone Checkpoint:** Git setup, initial commit, GitHub remote link.
- [x] **Phase 2:** Real Web Audio HTML5 playback pipeline, offline audio tracks, multi-file batch drag & drop importer with auto-pair LRC.
- [x] **Phase 2.5:** ID3 tag extraction, embedded cover art rendering, and LRCLIB online lyric auto-fetch.
- [x] **Phase 2.6 (Current):** Robust artwork pipeline with iTunes Search API online fallback & dynamic component bindings.
- [ ] **Phase 3:** Advanced audio DSP effects (CRT vinyl crackle filter, reverb, lowpass radio filter switch, 5-band terminal equalizer presets).
- [ ] **Phase 4:** Waveform visualizer modes (Spectrum LED blocks vs Oscilloscope Waveform vs Peak VU Meter).
- [ ] **Phase 5:** Desktop packaging (Electron / Tauri wrapper scripts).

---

## 4. Known Issues / Tech Debt
- *None currently identified.*
