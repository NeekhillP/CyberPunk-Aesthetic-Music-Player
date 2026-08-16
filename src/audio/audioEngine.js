/**
 * Web Audio Engine for SEVEN.FM
 * Complete Audio DSP Signal Chain:
 * HTMLMediaElement -> [5-Band BiquadFilter EQ] -> [DynamicsCompressor] -> [Cyber FX Filter] -> GainNode -> AnalyserNode -> Destination
 */

export const EQ_FREQUENCIES = [60, 250, 1000, 4000, 12000];
export const EQ_PRESETS = {
  'FLAT': [0, 0, 0, 0, 0],
  'CYBER-BASS': [8, 3, 0, 1, 2],
  'VAPORWAVE': [4, 2, -2, -4, -8],
  'CRT-RADIO': [-8, 2, 6, -3, -10],
};

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.audioElement = null;
    this.sourceNode = null;
    this.analyser = null;
    this.gainNode = null;
    this.compressor = null;
    this.fxFilter = null;
    this.eqFilters = [];
    
    this.volume = 0.8;
    this.playbackRate = 1.0;
    this.isMuted = false;
    this.isDspEnabled = true;
    this.currentPreset = 'FLAT';
    this.eqGains = [0, 0, 0, 0, 0];
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

    // 1. Persistent HTML5 Audio Element
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'auto';
    this.audioElement.playbackRate = this.playbackRate;

    // 2. 5-Band Biquad Filter Graphic EQ Chain
    this.eqFilters = EQ_FREQUENCIES.map((freq, idx) => {
      const filter = this.audioCtx.createBiquadFilter();
      if (idx === 0) {
        filter.type = 'lowshelf';
      } else if (idx === EQ_FREQUENCIES.length - 1) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
        filter.Q.value = 1.0;
      }
      filter.frequency.value = freq;
      filter.gain.value = this.isDspEnabled ? this.eqGains[idx] : 0;
      return filter;
    });

    // 3. Dynamics Compressor Limiter (prevents digital clipping during heavy bass boosts)
    this.compressor = this.audioCtx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-6, this.audioCtx.currentTime);
    this.compressor.knee.setValueAtTime(12, this.audioCtx.currentTime);
    this.compressor.ratio.setValueAtTime(8, this.audioCtx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.audioCtx.currentTime);
    this.compressor.release.setValueAtTime(0.25, this.audioCtx.currentTime);

    // 4. Cyber FX Filter (for CRT Radio bandpass / Vaporwave lowpass)
    this.fxFilter = this.audioCtx.createBiquadFilter();
    this.fxFilter.type = 'allpass';
    this.fxFilter.frequency.value = 1000;

    // 5. Master Gain Node
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);

    // 6. Analyser Node for Visualizers (128 FFT / time domain)
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 128;
    this.analyser.smoothingTimeConstant = 0.82;

    // Wire Web Audio Graph:
    // Source -> EQ[0] -> EQ[1] -> EQ[2] -> EQ[3] -> EQ[4] -> Compressor -> FX -> Gain -> Analyser -> Speakers
    try {
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
      
      let prevNode = this.sourceNode;
      for (const eqNode of this.eqFilters) {
        prevNode.connect(eqNode);
        prevNode = eqNode;
      }

      prevNode.connect(this.compressor);
      this.compressor.connect(this.fxFilter);
      this.fxFilter.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    } catch (err) {
      console.warn("Audio graph connection:", err);
    }

    // Audio Element Event Listeners
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
      console.warn("Audio playback error:", e);
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

  // --- DSP & GRAPHIC EQUALIZER CONTROLS ---

  setEqBandGain(bandIdx, gainDb) {
    const clampedGain = Math.max(-12, Math.min(12, gainDb));
    this.eqGains[bandIdx] = clampedGain;
    this.currentPreset = 'CUSTOM';

    if (this.eqFilters[bandIdx] && this.audioCtx) {
      const effectiveGain = this.isDspEnabled ? clampedGain : 0;
      this.eqFilters[bandIdx].gain.setTargetAtTime(effectiveGain, this.audioCtx.currentTime, 0.03);
    }
  }

  setEqPreset(presetName) {
    const gains = EQ_PRESETS[presetName] || EQ_PRESETS['FLAT'];
    this.currentPreset = presetName;
    this.eqGains = [...gains];

    // Configure EQ bands
    gains.forEach((gainVal, idx) => {
      if (this.eqFilters[idx] && this.audioCtx) {
        const effective = this.isDspEnabled ? gainVal : 0;
        this.eqFilters[idx].gain.setTargetAtTime(effective, this.audioCtx.currentTime, 0.03);
      }
    });

    // Configure Cyber FX Filter
    if (this.fxFilter && this.audioCtx) {
      if (!this.isDspEnabled || presetName === 'FLAT' || presetName === 'CYBER-BASS') {
        this.fxFilter.type = 'allpass';
      } else if (presetName === 'CRT-RADIO') {
        this.fxFilter.type = 'bandpass';
        this.fxFilter.frequency.setTargetAtTime(1400, this.audioCtx.currentTime, 0.03);
        this.fxFilter.Q.setTargetAtTime(1.8, this.audioCtx.currentTime, 0.03);
      } else if (presetName === 'VAPORWAVE') {
        this.fxFilter.type = 'lowpass';
        this.fxFilter.frequency.setTargetAtTime(3200, this.audioCtx.currentTime, 0.03);
        this.fxFilter.Q.setTargetAtTime(0.7, this.audioCtx.currentTime, 0.03);
      }
    }
  }

  toggleDsp(enabled) {
    this.isDspEnabled = enabled !== undefined ? enabled : !this.isDspEnabled;
    this.setEqPreset(this.currentPreset);
    return this.isDspEnabled;
  }

  getCurrentTime() {
    return this.audioElement?.currentTime || 0;
  }

  getDuration() {
    return this.audioElement?.duration || 0;
  }

  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(24);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  getTimeDomainData() {
    if (!this.analyser) return new Uint8Array(64).fill(128);
    const data = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }
}

export const audioEngine = new AudioEngine();
