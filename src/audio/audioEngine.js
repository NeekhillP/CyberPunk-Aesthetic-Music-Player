/**
 * Web Audio Engine for SEVEN.FM
 * Features:
 * - Real HTML5 Audio Element connected to Web Audio API AudioContext
 * - AnalyserNode (64 FFT bins & TimeDomain waveform extraction)
 * - GainNode for Master Volume
 * - Playback Rate / Speed Modulation controller (0.5x - 2.0x)
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
    this.playbackRate = 1.0;
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
    this.audioElement.playbackRate = this.playbackRate;

    // Analyser Node for FFT frequency & Time Domain data
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 128; // 64 frequency bins / 128 waveform samples
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

    if (this.audioElement.src !== src && !this.audioElement.src.endsWith(src)) {
      this.audioElement.src = src;
      this.audioElement.load();
    }

    this.audioElement.playbackRate = this.playbackRate;

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

  setPlaybackRate(rate) {
    this.playbackRate = Math.max(0.25, Math.min(3.0, rate));
    if (this.audioElement) {
      this.audioElement.playbackRate = this.playbackRate;
    }
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

  getTimeDomainData() {
    if (!this.analyser) {
      return new Uint8Array(64).fill(128);
    }
    const bufferLength = this.analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }
}

export const audioEngine = new AudioEngine();
