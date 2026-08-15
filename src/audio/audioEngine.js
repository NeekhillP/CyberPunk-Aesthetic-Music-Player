/**
 * Web Audio Engine for SEVEN.FM
 * Features:
 * - Real HTML5 Audio Element connected to Web Audio API AudioContext
 * - AnalyserNode (64 FFT bins) for 60fps real frequency spectrum analysis
 * - GainNode for smooth volume and mute management
 * - Resilient autoplay lifecycle & user gesture activation
 */

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.audioElement = null;
    this.sourceNode = null;
    this.analyser = null;
    this.gainNode = null;
    this.volume = 0.8;
    this.isMuted = false;
    this.isInitialized = false;

    // Callbacks for store integration
    this.onEndedCallback = null;
    this.onTimeUpdateCallback = null;
    this.onDurationChangeCallback = null;
    this.onErrorCallback = null;
  }

  init() {
    if (this.isInitialized) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContextClass();

    // Create the persistent HTML5 Audio Element
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'auto';

    // Analyser Node for FFT frequency data
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 64; // 32 frequency bins
    this.analyser.smoothingTimeConstant = 0.82;

    // Gain Node for Master Volume
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);

    // Connect Web Audio Graph: Source -> Analyser -> Gain -> Speakers
    try {
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
    } catch (err) {
      console.warn("Audio graph connection:", err);
    }

    // Bind Audio Element Events
    this.audioElement.addEventListener('ended', () => {
      if (this.onEndedCallback) this.onEndedCallback();
    });

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.audioElement.currentTime);
      }
    });

    this.audioElement.addEventListener('durationchange', () => {
      if (this.onDurationChangeCallback && !isNaN(this.audioElement.duration)) {
        this.onDurationChangeCallback(this.audioElement.duration);
      }
    });

    this.audioElement.addEventListener('error', (e) => {
      console.warn("Audio element playback error:", e);
      if (this.onErrorCallback) this.onErrorCallback(e);
    });

    this.isInitialized = true;
  }

  async resumeContext() {
    this.init();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch (e) {
        console.warn("AudioContext resume failed:", e);
      }
    }
  }

  async loadAndPlay(src, startTime = 0) {
    await this.resumeContext();

    if (!src) return;

    // Check if changing track source
    if (this.audioElement.src !== src && !this.audioElement.src.endsWith(src)) {
      this.audioElement.src = src;
      this.audioElement.load();
    }

    if (startTime > 0) {
      this.audioElement.currentTime = startTime;
    }

    try {
      await this.audioElement.play();
    } catch (err) {
      console.warn("Playback prevented by browser policy:", err);
    }
  }

  pause() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  seek(seconds) {
    if (this.audioElement && !isNaN(seconds)) {
      this.audioElement.currentTime = Math.max(0, seconds);
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.audioCtx) {
      const target = this.isMuted ? 0 : this.volume;
      this.gainNode.gain.setTargetAtTime(target, this.audioCtx.currentTime, 0.02);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
  }

  setMute(muted) {
    this.isMuted = muted;
    this.setVolume(this.volume);
  }

  getCurrentTime() {
    if (this.audioElement) {
      return this.audioElement.currentTime || 0;
    }
    return 0;
  }

  getDuration() {
    if (this.audioElement && !isNaN(this.audioElement.duration)) {
      return this.audioElement.duration;
    }
    return 0;
  }

  getFrequencyData() {
    if (!this.analyser) {
      return new Uint8Array(24);
    }
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }
}

export const audioEngine = new AudioEngine();
