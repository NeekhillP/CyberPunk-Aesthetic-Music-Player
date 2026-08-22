# SEVEN.FM - Retro-Futuristic Cyberpunk Terminal Music Player
**Project Progress & Architecture Tracker**

---

## 1. Current State
- **Status:** Phase 5 Complete (Advanced Queue HUD, YouTube Video Noise Stripper, Playback Modes & OS Media Session Keys).
- **Version:** v0.5.0-dev
- **Repository:** `https://github.com/NeekhillP/CyberPunk-Aesthetic-Music-Player.git`
- **Operational Features:**
  - ✅ **YouTube Video Clutter Auto-Stripper (`sanitizeQuery.js` & `metadataExtractor.js`):**
    - Automatically cleans video flags like `(Official Music Video)`, `(Official Audio)`, `[Lyrics]`, `(Prod. by ...)`, `Lyrical Video` from displayed titles and search queries.
    - Example: `"Ji Chanta Matina (Official Music Video)"` $\rightarrow$ cleans to `"Ji Chanta Matina"`.
  - ✅ **Advanced Queue HUD & Drag-and-Drop Reordering (`PlaylistModal.jsx`):**
    - Interactive playlist queue with drag-and-drop ordering and `[ ↑ ]` `[ ↓ ]` step buttons.
    - Individual track deletion `[ ✕ ]` with automatic IndexedDB synchronization.
    - Full Media Vault purge action `[ CLEAR VAULT ]`.
  - ✅ **Transport Playback Modes (`TransportControls.jsx`):**
    - `[ 🔁 REPEAT: OFF | ALL | ONE ]` mode cycler with automatic track repeat/loop logic.
    - `[ 🔀 SHUFFLE: ON | OFF ]` non-repeating randomized index selection.
  - ✅ **Native OS Media Session API (`useMediaSession.js`):**
    - Pushes track title, artist, album, and high-res cover art to OS lock screen and notification widgets.
    - Connects hardware keyboard media keys (Play/Pause, Previous/Next, Seek +/- 5s).
  - ✅ **5-Band Graphic Equalizer & Master Limiter:** 60Hz to 12kHz with DynamicsCompressor.
  - ✅ **IndexedDB Media Vault:** Permanent client-side audio/lyrics/art persistence with boot hydration.
  - ✅ **Multi-Mode Visualizers:** `BARS`, `WAVE` (Oscilloscope), and `RADAR`.

---

## 2. Changelog

### [v0.5.0-dev] - 2026-08-22
- Enhanced `src/utils/sanitizeQuery.js` and `metadataExtractor.js` with automated YouTube video metadata and bracketed noise stripper.
- Added playback mode controls (`repeatMode: OFF/ALL/ONE` and `isShuffle: ON/OFF`) to `playerStore.js` and `TransportControls.jsx`.
- Upgraded `PlaylistModal.jsx` to support drag-and-drop reordering, `[ ↑ ]` / `[ ↓ ]` buttons, and single-track deletion.
- Integrated `src/hooks/useMediaSession.js` connecting `navigator.mediaSession` with OS lock screen controls and hardware media keys.
- Tested and verified production build with Vite.

### [v0.4.0] - 2026-08-16
- Extended Web Audio API graph with 5-band Graphic EQ, Dynamics Compressor, and Cyber DSP profiles.
- Built IndexedDB Media Vault.

### [v0.3.0] - 2026-08-15
- Added metadata swap/editor, speed modulation engine, and 3-mode visualizer.

### [v0.2.8] - 2026-08-15
- Re-architected `lyricsService.js` for strict title verification.

---

## 3. Roadmap & Immediate Priorities
- [x] **Phase 1:** Core terminal player wireframe, visualizer, duotone art, LRC sync.
- [x] **Milestone Checkpoint:** Git setup, initial commit, GitHub remote link.
- [x] **Phase 2:** Real Web Audio HTML5 playback pipeline, offline audio tracks, batch importer.
- [x] **Phase 2.5:** ID3 tag extraction, embedded cover art rendering, and LRCLIB online lyric auto-fetch.
- [x] **Phase 2.6:** Robust artwork pipeline with iTunes Search API online fallback.
- [x] **Phase 2.7:** Multilingual/Devanagari query sanitizer and in-app lyric paste terminal.
- [x] **Phase 2.8:** Strict lyric validation & verification.
- [x] **Phase 3:** Quick metadata swap/editor, playback speed engine, multi-mode visualizer.
- [x] **Phase 4:** 5-Band Graphic Equalizer, Cyber DSP FX profiles, Dynamics Compressor limiter, IndexedDB Media Vault.
- [x] **Phase 5 (Current):** Advanced Queue HUD (Shuffle/Repeat/Reorder), YouTube Video Noise Stripper, and Native OS Media Session keys.
- [ ] **Phase 6:** Desktop packaging (Electron / Tauri wrapper scripts) & PWA offline install manifest.

---

## 4. Known Issues / Tech Debt
- *None currently identified.*
