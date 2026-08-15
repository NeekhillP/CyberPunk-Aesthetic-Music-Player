# SEVEN.FM - Retro-Futuristic Cyberpunk Terminal Music Player
**Project Progress & Architecture Tracker**

---

## 1. Current State
- **Status:** Phase 1 Complete • Repository Initialized & Linked to GitHub Remote.
- **Version:** v0.1.1
- **Repository:** `https://github.com/NeekhillP/CyberPunk-Aesthetic-Music-Player.git`
- **Operational Features:**
  - ✅ Complete React + Vite + Tailwind CSS + Zustand architecture.
  - ✅ Cyberpunk Terminal Design System with CRT scanlines, horizontal scan-beam, glowing neon borders (`#ff2a6d`, `#05d9e8`), and monospace typography (`JetBrains Mono`, `VT323`, `Share Tech Mono`).
  - ✅ Duotone filtered retro-aesthetic album artwork frame with CRT beam animations.
  - ✅ Real-time Web Audio API frequency spectrum analyzer rendered on HTML5 `<canvas>` with dual-color LED segmented blocks (white baselines & neon magenta peaks).
  - ✅ Robust `.lrc` timestamped lyrics parser with millisecond precision.
  - ✅ Synchronized auto-scrolling lyrics panel with smooth centering, active glowing highlight bar, dim inactive typography, and interactive click-to-seek.
  - ✅ Full transport controls (`[ |<< ]`, `[ || ]` / `[ > ]`, `[ >>| ]`), interactive volume bar, and `auto-scroll: [0 on / off]` toggle.
  - ✅ Full-width interactive seekbar with live time elapsed and duration readout.
  - ✅ Built-in procedural Synthwave Audio Synthesizer (drum machine, bass arp, pads, lead) for instantaneous zero-latency playback without external network dependencies.
  - ✅ Station Directory Modal with built-in cyberpunk / indie lo-fi tracks (including *Loving Machine - TV Girl*).
  - ✅ Custom Audio (`.mp3`, `.wav`, `.ogg`, `.flac`) & `.lrc` lyric file importer.
  - ✅ Global keyboard shortcuts (Space, Arrows, Mute, Auto-Scroll, Next/Prev).

---

## 2. Changelog

### [v0.1.1] - 2026-08-15
- Configured production `.gitignore` covering `node_modules`, `dist`, logs, environment files, and IDE configs.
- Initialized local Git repository and staged all core project files, assets, and config.
- Created initial structured commit: `feat: complete phase 1 baseline UI and playback scaffold (v0.1.1)`.
- Configured GitHub remote: `https://github.com/NeekhillP/CyberPunk-Aesthetic-Music-Player.git` and prepared `main` branch.

### [v0.1.0-alpha] - 2026-08-15
- Scaffolding of project with Vite, React 18, Tailwind CSS, Zustand, and Lucide icons.
- Built `src/audio/audioEngine.js` with Web Audio API context, AnalyserNode, and procedural synthesizer engine.
- Created `src/utils/lrcParser.js` for timestamp synchronization and binary search lookup.
- Designed `src/components/AudioVisualizer.jsx` rendering 24-band dual-zone LED blocks (white low-frequency bands + magenta peaks).
- Created `src/components/AlbumArt.jsx`, `src/components/MetadataCard.jsx`, `src/components/TransportControls.jsx`, `src/components/LyricsPanel.jsx`, and `src/components/BottomBar.jsx` accurately replicating the SEVEN.FM reference UI.
- Implemented `PlaylistModal.jsx`, `UploadModal.jsx`, and `SettingsModal.jsx`.
- Verified build integrity with Vite production bundler.

---

## 3. Roadmap & Immediate Priorities
- [x] **Phase 1:** Core terminal player wireframe, Web Audio engine, Canvas LED visualizer, duotone art, LRC sync.
- [x] **Milestone Checkpoint:** Git repository initialization, `.gitignore` setup, initial commit, GitHub remote link.
- [ ] **Phase 2:** Advanced audio DSP effects (CRT vinyl crackle filter, reverb, lowpass radio filter switch).
- [ ] **Phase 3:** Real-time waveform mode switcher (Spectrum Bars vs Oscilloscope Waveform vs Peak VU Meter).
- [ ] **Phase 4:** Desktop packaging setup (Electron / Tauri wrapper scripts).

---

## 4. Known Issues / Tech Debt
- *None currently identified.*
