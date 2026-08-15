# SEVEN.FM - Retro-Futuristic Cyberpunk Terminal Music Player
**Project Progress & Architecture Tracker**

---

## 1. Current State
- **Status:** Phase 2.8 Complete (Strict Lyric Verification, False-Positive Elimination & Locked Playback Sync).
- **Version:** v0.2.8
- **Repository:** `https://github.com/NeekhillP/CyberPunk-Aesthetic-Music-Player.git`
- **Operational Features:**
  - ✅ **Strict Lyric Title & Artist Verification:** Eliminated loose fallback indexing by implementing strict string similarity, Levenshtein distance, and duration tolerance validation ($\pm 8$s) before accepting any online lyric match.
  - ✅ **Precision Playback-Lyric Sync Lock:** Direct event-driven and RAF-driven audio element timestamp locking with binary search index lookups.
  - ✅ **Smart Multilingual Query Sanitizer (`sanitizeQuery.js`):** Script-splitting for Latin & Devanagari regional titles and clutter removal.
  - ✅ **Multi-Provider Artwork Pipeline:** Embedded ID3 APIC, iTunes 600x600 HD, Deezer fallback.
  - ✅ **Interactive In-App Lyric Injection:** Paste timestamped `.lrc` or plain lyrics directly into the active track.
  - ✅ **Devanagari & Unicode Terminal Typography:** Google Font `Noto Sans Devanagari` support with glowing CRT aesthetic.
  - ✅ **Real Web Audio API Engine:** `HTMLAudioElement` connected to `AnalyserNode` and `GainNode`.
  - ✅ **Spectrum Visualizer Reactivity:** 24-band dual-zone LED `<canvas>` visualizer.
  - ✅ **Batch Drag-and-Drop Importer:** Full-window drag & drop HUD.
  - ✅ **Zustand State Persistence:** Preferences and playlist state saved in `localStorage`.

---

## 2. Changelog

### [v0.2.8] - 2026-08-15
- Re-architected `src/utils/lyricsService.js` to enforce strict title verification:
  - Exact match GET verification with duration tolerance.
  - Rejection of loose search results where `trackName` does not match the target song (prevented wrong song lyrics like "Jhari" for "Kasari").
  - Added token overlap and normalized Levenshtein similarity metric ($\ge 0.75$ threshold).
- Hardened playback time sync in `src/audio/audioEngine.js` and `src/utils/lrcParser.js` to ensure zero drift between audio timeline and active lyric highlighting.
- Tested and verified production build with Vite.

### [v0.2.7] - 2026-08-15
- Built `src/utils/sanitizeQuery.js` with regex script-splitting (Latin/Romanized vs Devanagari/Native scripts) and clutter stripping.
- Upgraded `artworkService.js` with multi-provider fallbacks (iTunes + Deezer).
- Built interactive In-App Terminal Lyric Editor (`[ + PASTE LRC / TEXT LYRICS ]`).

### [v0.2.6] - 2026-08-15
- Built multi-tier cover art pipeline with iTunes 600x600 HD fallback.

### [v0.2.5] - 2026-08-15
- Integrated audio metadata extraction using client-side metadata parsing.
- Built 3-Tier Lyric Resolution service with LRCLIB API integration.

### [v0.2.0] - 2026-08-15
- Replaced simulated timer with real HTML5 audio decoding and Web Audio API graph.
- Generated and bundled offline audio assets.

---

## 3. Roadmap & Immediate Priorities
- [x] **Phase 1:** Core terminal player wireframe, visualizer, duotone art, LRC sync.
- [x] **Milestone Checkpoint:** Git setup, initial commit, GitHub remote link.
- [x] **Phase 2:** Real Web Audio HTML5 playback pipeline, offline audio tracks, multi-file batch drag & drop importer with auto-pair LRC.
- [x] **Phase 2.5:** ID3 tag extraction, embedded cover art rendering, and LRCLIB online lyric auto-fetch.
- [x] **Phase 2.6:** Robust artwork pipeline with iTunes Search API online fallback & dynamic component bindings.
- [x] **Phase 2.7:** Multilingual/Devanagari query sanitizer, multi-provider artwork/lyrics fallbacks, and in-app lyric paste terminal.
- [x] **Phase 2.8 (Current):** Strict lyric validation & verification to eliminate song mismatches, locked time sync.
- [ ] **Phase 3:** Advanced audio DSP effects (CRT vinyl crackle filter, reverb, lowpass radio filter switch, 5-band terminal equalizer presets).
- [ ] **Phase 4:** Waveform visualizer modes (Spectrum LED blocks vs Oscilloscope Waveform vs Peak VU Meter).
- [ ] **Phase 5:** Desktop packaging (Electron / Tauri wrapper scripts).

---

## 4. Known Issues / Tech Debt
- *None currently identified.*
