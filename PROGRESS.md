# SEVEN.FM - Retro-Futuristic Cyberpunk Terminal Music Player
**Project Progress & Architecture Tracker**

---

## 1. Current State
- **Status:** Phase 6 Complete (Desktop Packaging via Tauri v2, System Tray, Global Media Keys & Native Dialogs).
- **Version:** v0.5.0-desktop
- **Repository:** `https://github.com/NeekhillP/CyberPunk-Aesthetic-Music-Player.git`
- **Operational Features:**
  - ✅ **Tauri v2 Native Desktop Architecture:**
    - Scaffolded `src-tauri` directory with `tauri.conf.json`, `Cargo.toml`, `build.rs`, `lib.rs`, `main.rs`, and capabilities.
    - Configured desktop window: 1200x760 (min 900x600), centered, `#0c0205` void background, custom title `"SEVEN.FM // CYBERPUNK TERMINAL"`.
  - ✅ **System Tray & Global Media Keys:**
    - Cyberpunk system tray icon with context menu (`Show / Hide Terminal`, `Play / Pause`, `Next Track`, `Quit`).
    - Global OS media key hooks (`MediaPlayPause`, `MediaTrackNext`, `MediaTrackPrevious`) allowing playback control when minimized.
  - ✅ **Native OS File Dialog Integration:**
    - `@tauri-apps/plugin-dialog` & `@tauri-apps/plugin-fs` bridge allowing native file selection for `.mp3`, `.wav`, `.flac`, `.lrc` alongside web drag-and-drop.
  - ✅ **YouTube Video Clutter Auto-Stripper (`sanitizeQuery.js` & `metadataExtractor.js`):**
    - Automatically cleans video flags like `(Official Music Video)`, `(Official Audio)`, `[Lyrics]`, `(Prod. by ...)`, `Lyrical Video` from displayed titles and search queries.
  - ✅ **Advanced Queue HUD & Drag-and-Drop Reordering (`PlaylistModal.jsx`):**
    - Interactive playlist queue with drag-and-drop ordering and `[ ↑ ]` `[ ↓ ]` step buttons.
    - Single track deletion `[ ✕ ]` with automatic IndexedDB synchronization.
  - ✅ **Transport Playback Modes (`TransportControls.jsx`):**
    - `[ 🔁 REPEAT: OFF | ALL | ONE ]` and `[ 🔀 SHUFFLE: ON | OFF ]`.
  - ✅ **5-Band Graphic Equalizer & Master Limiter:** 60Hz to 12kHz with DynamicsCompressor.
  - ✅ **IndexedDB Media Vault:** Permanent client-side audio/lyrics/art persistence.
  - ✅ **Multi-Mode Visualizers:** `BARS`, `WAVE` (Oscilloscope), and `RADAR`.

---

## 2. Changelog

### [v0.5.0-desktop] - 2026-08-22
- Scaffolded Tauri v2 native desktop application in `src-tauri`.
- Integrated `@tauri-apps/plugin-dialog`, `@tauri-apps/plugin-fs`, and `@tauri-apps/plugin-global-shortcut`.
- Built `src/services/tauriService.js` connecting system tray events, native dialogs, and global OS shortcuts to the React audio state.
- Added desktop development and build scripts to `package.json` (`tauri:dev` and `tauri:build`).
- Tested and verified production build with Vite.

### [v0.4.0] - 2026-08-16
- Extended Web Audio API graph with 5-band Graphic EQ, Dynamics Compressor, and Cyber DSP profiles.
- Built IndexedDB Media Vault.

### [v0.3.0] - 2026-08-15
- Added metadata swap/editor, speed modulation engine, and 3-mode visualizer.

---

## 3. Desktop Build & Run Instructions

### Prerequisites
1. **Node.js:** v18+ (currently running v24)
2. **Rust & Cargo:** Install via [https://rustup.rs](https://rustup.rs)
3. **C++ Build Tools (Windows):** Visual Studio C++ Build Tools or Build Tools for Visual Studio with "Desktop development with C++".

### Commands
- Run in Desktop Dev Mode:
  ```bash
  npm run tauri:dev
  ```
- Build Standalone Desktop Installer / Executable:
  ```bash
  npm run tauri:build
  ```
- Run Web Browser Dev Mode:
  ```bash
  npm run dev
  ```

---

## 4. Known Issues / Tech Debt
- *None currently identified.*
