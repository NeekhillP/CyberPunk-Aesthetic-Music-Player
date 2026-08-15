# SEVEN.FM - Retro-Futuristic Cyberpunk Terminal Music Player
**Project Progress & Architecture Tracker**

---

## 1. Current State
- **Status:** Phase 2.7 Complete (Regional/Multilingual Metadata Sanitization, Multi-Provider Artwork/Lyrics Lookups, In-App Terminal Lyric Paste).
- **Version:** v0.2.7
- **Repository:** `https://github.com/NeekhillP/CyberPunk-Aesthetic-Music-Player.git`
- **Operational Features:**
  - ✅ **Smart Multilingual Query Sanitizer (`sanitizeQuery.js`):** Splits bilingual / mixed-script strings (e.g. `Kasari कसरी`), strips clutter (`(Official Video)`, `(Prod. by...)`, `Lyrical Video`), and produces prioritized Latin and Native search candidate arrays.
  - ✅ **Multi-Provider Artwork Pipeline:**
    - *Tier 1:* Embedded ID3 APIC frames.
    - *Tier 2:* iTunes Search API HD (`600x600bb`) across Latin & Native candidates.
    - *Tier 3:* Deezer Search API high-res album fallback.
    - *Tier 4:* Solo artist/title fuzzy search fallback.
  - ✅ **Multi-Tier Multilingual Lyrics Engine:**
    - *Tier 1:* Embedded ID3 (`SYLT`/`USLT`).
    - *Tier 2:* Local Companion `.lrc`.
    - *Tier 3:* LRCLIB multi-candidate search (Latin + Devanagari/Native scripts).
    - *Tier 4:* In-App Terminal Quick Lyric Paste interface (`[ + PASTE LRC / TEXT LYRICS ]`) with live track binding.
  - ✅ **Devanagari & Unicode Terminal Typography:** Integrated `Noto Sans Devanagari` and UTF-8 typography with neon glow support.
  - ✅ **Real Web Audio API Engine:** `HTMLAudioElement` connected to `AnalyserNode` and `GainNode`.
  - ✅ **Spectrum Visualizer Reactivity:** 24-band dual-zone LED `<canvas>` visualizer.
  - ✅ **Batch Drag-and-Drop Importer:** Full-window drag & drop HUD.
  - ✅ **Zustand State Persistence:** Preferences and playlist state saved in `localStorage`.

---

## 2. Changelog

### [v0.2.7] - 2026-08-15
- Built `src/utils/sanitizeQuery.js` with regex script-splitting (Latin/Romanized vs Devanagari/Native scripts) and clutter stripping.
- Upgraded `artworkService.js` with multi-provider fallbacks (iTunes + Deezer + Title-only fuzzy matching).
- Upgraded `lyricsService.js` to perform multi-stage LRCLIB queries across all generated candidate terms.
- Built interactive In-App Terminal Lyric Editor (`[ + PASTE LRC / TEXT LYRICS ]`) in `LyricsPanel.jsx` allowing instant manual lyrics binding.
- Updated `index.html` and `tailwind.config.js` with Google Font `Noto Sans Devanagari` for crisp regional character rendering.
- Tested and verified production build with Vite.

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
- [x] **Phase 2.7 (Current):** Multilingual/Devanagari query sanitizer, multi-provider artwork/lyrics fallbacks, and in-app lyric paste terminal.
- [ ] **Phase 3:** Advanced audio DSP effects (CRT vinyl crackle filter, reverb, lowpass radio filter switch, 5-band terminal equalizer presets).
- [ ] **Phase 4:** Waveform visualizer modes (Spectrum LED blocks vs Oscilloscope Waveform vs Peak VU Meter).
- [ ] **Phase 5:** Desktop packaging (Electron / Tauri wrapper scripts).

---

## 4. Known Issues / Tech Debt
- *None currently identified.*
