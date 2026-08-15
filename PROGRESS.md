# SEVEN.FM - Retro-Futuristic Cyberpunk Terminal Music Player
**Project Progress & Architecture Tracker**

---

## 1. Current State
- **Status:** Phase 3 Complete (Metadata Corrector, Playback Speed Engine, Multi-Mode Oscilloscope & Radar Visualizers).
- **Version:** v0.3.0
- **Repository:** `https://github.com/NeekhillP/CyberPunk-Aesthetic-Music-Player.git`
- **Operational Features:**
  - ✅ **Quick Metadata Corrector & Swap:**
    - `[ ⇄ SWAP ]`: 1-click Title $\leftrightarrow$ Artist swapping with instant artwork & lyrics re-resolution.
    - `[ EDIT ]`: Inline terminal prompt to edit song title and artist on the fly.
  - ✅ **Playback Speed & Lo-Fi Engine:**
    - Variable speed modulation from `0.5x` to `2.0x`.
    - Quick terminal presets: `[ 0.8x SLOWED ]`, `[ 1.0x NORMAL ]`, `[ 1.25x NIGHTCORE ]`.
    - Dynamic locked lyric sync and canvas audio analysis across all speed factors.
  - ✅ **Multi-Mode Canvas Visualizer Engine:**
    - `BARS`: 24-band dual-zone LED segmented spectrum.
    - `WAVE`: High-resolution phosphor oscilloscope waveform (`getByteTimeDomainData`) with CRT persistence.
    - `RADAR`: Rotating cyber-radar with radial frequency spikes and scanning beam.
  - ✅ **Strict Lyric Title & Artist Verification:** Rejection of loose search results and elimination of mismatched song lyrics.
  - ✅ **Multilingual Sanitizer & Multi-Provider Artwork/Lyrics:** iTunes 600x600 HD, Deezer, and Devanagari script support.
  - ✅ **Interactive In-App Lyric Injection:** Manual lyric pasting and timeline auto-distribution.
  - ✅ **Web Audio Engine & State Persistence:** Real Web Audio graph with localStorage settings persistence.

---

## 2. Changelog

### [v0.3.0] - 2026-08-15
- Added `[ ⇄ SWAP ]` and `[ EDIT ]` metadata corrector buttons to `MetadataCard.jsx` with automatic artwork and lyric re-fetching.
- Integrated playback speed engine in `audioEngine.js`, `playerStore.js`, and `TransportControls.jsx` (`0.5x` - `2.0x` + presets `0.8x`, `1.0x`, `1.25x`).
- Added multi-mode visualizer switch to `AudioVisualizer.jsx` supporting `BARS`, `WAVE` (Oscilloscope), and `RADAR` (Circular frequency scanner).
- Tested and verified production build with Vite.

### [v0.2.8] - 2026-08-15
- Re-architected `lyricsService.js` to enforce strict title verification and Levenshtein similarity.
- Hardened playback-lyric synchronization lock.

### [v0.2.7] - 2026-08-15
- Built `sanitizeQuery.js` with regex script-splitting for Devanagari/regional songs.
- Built interactive In-App Terminal Lyric Editor.

### [v0.2.6] - 2026-08-15
- Built multi-tier cover art pipeline with iTunes 600x600 HD fallback.

### [v0.2.5] - 2026-08-15
- Integrated audio metadata extraction and LRCLIB auto-sync.

### [v0.2.0] - 2026-08-15
- Built real Web Audio API playback pipeline and bundled offline audio assets.

---

## 3. Roadmap & Immediate Priorities
- [x] **Phase 1:** Core terminal player wireframe, visualizer, duotone art, LRC sync.
- [x] **Milestone Checkpoint:** Git setup, initial commit, GitHub remote link.
- [x] **Phase 2:** Real Web Audio HTML5 playback pipeline, offline audio tracks, multi-file batch drag & drop importer with auto-pair LRC.
- [x] **Phase 2.5:** ID3 tag extraction, embedded cover art rendering, and LRCLIB online lyric auto-fetch.
- [x] **Phase 2.6:** Robust artwork pipeline with iTunes Search API online fallback.
- [x] **Phase 2.7:** Multilingual/Devanagari query sanitizer and in-app lyric paste terminal.
- [x] **Phase 2.8:** Strict lyric validation & verification to eliminate song mismatches.
- [x] **Phase 3 (Current):** Quick metadata swap/editor, playback speed & Lo-Fi modulation engine, multi-mode visualizer (BARS / WAVE / RADAR).
- [ ] **Phase 4:** Advanced audio DSP effects (CRT vinyl crackle filter, reverb, lowpass radio filter switch, 5-band terminal equalizer presets).
- [ ] **Phase 5:** Desktop packaging (Electron / Tauri wrapper scripts).

---

## 4. Known Issues / Tech Debt
- *None currently identified.*
