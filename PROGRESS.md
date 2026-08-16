# SEVEN.FM - Retro-Futuristic Cyberpunk Terminal Music Player
**Project Progress & Architecture Tracker**

---

## 1. Current State
- **Status:** Phase 4 Complete (5-Band Graphic EQ, Cyber DSP FX Rack, Dynamics Compressor Limiter & IndexedDB Media Vault).
- **Version:** v0.4.0-dev
- **Repository:** `https://github.com/NeekhillP/CyberPunk-Aesthetic-Music-Player.git`
- **Operational Features:**
  - ✅ **5-Band Graphic Equalizer:**
    - Parametric Biquad filter chain at `60Hz`, `250Hz`, `1kHz`, `4kHz`, and `12kHz` with range `-12dB` to `+12dB`.
    - Smooth `setTargetAtTime` gain transitions.
  - ✅ **Master Dynamics Compressor Limiter:**
    - Zero-clipping gain staging with threshold `-6dB`, knee `12`, ratio `8`, attack `0.003s`, and release `0.25s`.
  - ✅ **Cyber FX Profiles & Filters:**
    - `FLAT`: Direct neutral studio monitoring.
    - `CYBER-BASS`: Heavy +8dB sub-bass boost with warm low-mids.
    - `VAPORWAVE`: Lo-fi high-shelf rolloff with analog warmth.
    - `CRT-RADIO`: Bandpass radio filter (cutting <350Hz & >3.8kHz, mid presence peak).
  - ✅ **Neon Audio Rack Drawer (`AudioRack.jsx`):**
    - Slide-out terminal configuration drawer (`> audio_dsp.cfg`).
    - 5 interactive neon faders, preset triggers, and master DSP bypass switch.
  - ✅ **IndexedDB Media Vault (`dbService.js`):**
    - Permanent client-side caching of imported audio files, cover art blobs, and synchronized lyrics.
    - Auto-hydration on application launch with `[ CLEAR VAULT ]` queue management.
  - ✅ **Quick Metadata Corrector & Swap:** `[ ⇄ SWAP ]` and `[ EDIT ]`.
  - ✅ **Playback Speed & Lo-Fi Modulation Engine:** `0.5x` - `2.0x` variable speed.
  - ✅ **Multi-Mode Visualizers:** `BARS`, `WAVE`, and `RADAR`.

---

## 2. Changelog

### [v0.4.0-dev] - 2026-08-16
- Extended Web Audio API graph: `MediaElementAudioSourceNode` $\rightarrow$ `5-Band BiquadFilter EQ` $\rightarrow$ `DynamicsCompressor` $\rightarrow$ `Cyber FX Filter` $\rightarrow$ `GainNode` $\rightarrow$ `AnalyserNode` $\rightarrow$ `destination`.
- Built `src/components/AudioRack.jsx` terminal drawer with 5-band faders and presets (`FLAT`, `CYBER-BASS`, `VAPORWAVE`, `CRT-RADIO`).
- Built `src/services/dbService.js` IndexedDB Media Vault to store audio files and artwork locally.
- Connected IndexedDB auto-hydration on app startup in `App.jsx` and added `[ CLEAR VAULT ]` in `PlaylistModal.jsx`.
- Verified build and tested DSP audio chain.

### [v0.3.0] - 2026-08-15
- Added metadata swap/editor, speed modulation engine, and 3-mode visualizer.

### [v0.2.8] - 2026-08-15
- Re-architected `lyricsService.js` for strict title verification.

### [v0.2.7] - 2026-08-15
- Built `sanitizeQuery.js` with regex script-splitting for Devanagari songs.

### [v0.2.6] - 2026-08-15
- Built multi-tier cover art pipeline with iTunes 600x600 HD fallback.

---

## 3. Roadmap & Immediate Priorities
- [x] **Phase 1:** Core terminal player wireframe, visualizer, duotone art, LRC sync.
- [x] **Milestone Checkpoint:** Git setup, initial commit, GitHub remote link.
- [x] **Phase 2:** Real Web Audio HTML5 playback pipeline, offline audio tracks, multi-file batch drag & drop importer.
- [x] **Phase 2.5:** ID3 tag extraction, embedded cover art rendering, and LRCLIB online lyric auto-fetch.
- [x] **Phase 2.6:** Robust artwork pipeline with iTunes Search API online fallback.
- [x] **Phase 2.7:** Multilingual/Devanagari query sanitizer and in-app lyric paste terminal.
- [x] **Phase 2.8:** Strict lyric validation & verification.
- [x] **Phase 3:** Quick metadata swap/editor, playback speed engine, multi-mode visualizer.
- [x] **Phase 4 (Current):** 5-Band Graphic Equalizer, Cyber DSP FX profiles, Dynamics Compressor limiter, IndexedDB Media Vault.
- [ ] **Phase 5:** Desktop packaging (Electron / Tauri wrapper scripts) & PWA offline manifest.

---

## 4. Known Issues / Tech Debt
- *None currently identified.*
