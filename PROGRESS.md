# SEVEN.FM - Retro-Futuristic Cyberpunk Terminal Music Player
**Project Progress & Architecture Tracker**

---

## 1. Current State
- **Status:** Phase 2 Complete (Real Web Audio API Pipeline, Bundled Offline Audio, Batch Drag & Drop Importer, Zustand Persist).
- **Version:** v0.2.0
- **Repository:** `https://github.com/NeekhillP/CyberPunk-Aesthetic-Music-Player.git`
- **Operational Features:**
  - ✅ **Real Web Audio API Engine:** Single persistent `HTMLAudioElement` connected via `MediaElementAudioSourceNode` -> `AnalyserNode` (64 FFT bins) -> `GainNode` -> `destination`.
  - ✅ **Resilient Lifecycle & Autoplay:** User gesture context auto-resuming, `timeupdate`, `durationchange`, `play`, `pause`, and `ended` events.
  - ✅ **Bundled Offline Audio:** High-quality synthesized WAV tracks (*Loving Machine* and *Neon Solitude*) stored locally in `public/audio/` for instant offline playback.
  - ✅ **Spectrum Visualizer Reactivity:** 24-band dual-zone LED `<canvas>` visualizer directly reacting to real audio frequencies at 60fps.
  - ✅ **Batch Drag-and-Drop Importer:** Full-window drag & drop zone for multiple audio (`.mp3`, `.wav`, `.flac`, `.ogg`) and `.lrc` files with automatic base-name pairing.
  - ✅ **Zustand State Persistence:** Preferences (volume, mute status, auto-scroll, current track index) saved in `localStorage`.
  - ✅ **Playlist & Auto-Advance:** Seamless track completion advance and queue removal management.
  - ✅ **Synchronized Lyrics Panel:** Active line highlight, dimmed inactive lines, auto-scroll centering, and click-to-seek.

---

## 2. Changelog

### [v0.2.0] - 2026-08-15
- Replaced simulated timer with real HTML5 audio decoding and Web Audio API graph.
- Generated and bundled offline audio assets (`loving_machine.wav`, `neon_solitude.wav`).
- Integrated Zustand `persist` middleware to preserve volume, auto-scroll, and active track across browser refreshes.
- Built multi-file batch importer modal and full-screen drag-and-drop HUD with automatic `.lrc` sync.
- Bound `onended` event to automatically play the next track in the queue.
- Tested and verified production build with Vite.

### [v0.1.1] - 2026-08-15
- Configured `.gitignore`, initialized local Git repository, created initial commit, and pushed `main` to GitHub.

### [v0.1.0-alpha] - 2026-08-15
- Initial scaffolding of project with Vite, React 18, Tailwind CSS, Zustand, and Lucide icons.
- Built terminal layout, duotone CRT album frame, and LRC parser.

---

## 3. Roadmap & Immediate Priorities
- [x] **Phase 1:** Core terminal player wireframe, visualizer, duotone art, LRC sync.
- [x] **Milestone Checkpoint:** Git setup, initial commit, GitHub remote link.
- [x] **Phase 2:** Real Web Audio HTML5 playback pipeline, offline audio tracks, multi-file batch drag & drop importer with auto-pair LRC, Zustand `persist` middleware, auto-advance.
- [ ] **Phase 3:** Advanced audio DSP effects (CRT vinyl crackle filter, reverb, lowpass radio filter switch, 5-band terminal equalizer presets).
- [ ] **Phase 4:** Waveform visualizer modes (Spectrum LED blocks vs Oscilloscope Waveform vs Peak VU Meter).
- [ ] **Phase 5:** Desktop packaging (Electron / Tauri wrapper scripts) and offline cache.

---

## 4. Known Issues / Tech Debt
- *None currently identified.*
