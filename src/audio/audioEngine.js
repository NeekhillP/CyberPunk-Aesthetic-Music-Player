/**
 * Web Audio Engine for SEVEN.FM
 * Features:
 * - Real-time FFT spectrum analysis for canvas visualizer
 * - Dual playback mode: HTML5 Audio streaming + Multi-track Procedural Synthwave Synthesizer
 * - Master gain, mute, volume ramping
 */

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.masterGain = null;
    this.audioElement = null;
    this.sourceNode = null;
    this.isSynthPlaying = false;
    this.synthInterval = null;
    this.currentTrack = null;
    this.volume = 0.8;
    this.isMuted = false;
    this.onTimeUpdateCallback = null;
    this.synthStartTime = 0;
    this.synthPauseOffset = 0;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      // Analyser for real-time spectrum visualization
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64; // Gives 32 frequency bins, perfect for segmented retro LEDs
      this.analyser.smoothingTimeConstant = 0.82;

      // Master Gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);

      // Connect analyser -> master gain -> destination
      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.audioCtx.destination);
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.audioCtx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.03);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
  }

  setMute(muted) {
    this.isMuted = muted;
    this.setVolume(this.volume);
  }

  /**
   * Connect an HTMLAudioElement or File to the analyzer
   */
  loadAudioSource(urlOrFile) {
    this.initContext();
    this.stopSynth();

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
      this.sourceNode.connect(this.analyser);
    }

    if (typeof urlOrFile === 'string') {
      this.audioElement.src = urlOrFile;
    } else if (urlOrFile instanceof File || urlOrFile instanceof Blob) {
      this.audioElement.src = URL.createObjectURL(urlOrFile);
    }

    this.audioElement.load();
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

  // --- PROCEDURAL SYNTHWAVE GENERATOR (Plays retro cyber beats in-browser seamlessly) ---

  playSynthTrack(track, startFrom = 0) {
    this.initContext();
    this.stopSynth();
    this.currentTrack = track;
    this.isSynthPlaying = true;
    this.synthPauseOffset = startFrom;
    this.synthStartTime = this.audioCtx.currentTime - startFrom;

    const bpm = track.bpm || 110;
    const beatInterval = 60 / bpm; // in seconds
    const sixteenthInterval = beatInterval / 4;

    let step = Math.floor((startFrom % (beatInterval * 16)) / sixteenthInterval);

    // Chords progression based on track
    const chords = [
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [261.63, 329.63, 392.00, 523.25], // Cmaj
      [196.00, 246.94, 293.66, 392.00], // G
    ];

    const bassNotes = [110, 87.31, 130.81, 98];
    const leadNotes = [440, 493.88, 523.25, 587.33, 659.25, 783.99, 880];

    this.synthInterval = setInterval(() => {
      if (!this.isSynthPlaying || !this.audioCtx) return;

      const currentPlayTime = this.audioCtx.currentTime - this.synthStartTime;
      const currentBar = Math.floor(currentPlayTime / (beatInterval * 4)) % chords.length;
      const currentChord = chords[currentBar];
      const currentBass = bassNotes[currentBar];

      const time = this.audioCtx.currentTime;

      // 1. Kick on beats 0, 4, 8, 12 (4-on-the-floor)
      if (step % 4 === 0) {
        this.triggerKick(time);
      }

      // 2. Snare / Clack on beats 4, 12
      if (step % 8 === 4) {
        this.triggerSnare(time);
      }

      // 3. Hi-hat on every offbeat sixteenth
      if (step % 2 === 1) {
        this.triggerHiHat(time, step % 4 === 2 ? 0.08 : 0.04);
      }

      // 4. Bassline 16th arp
      if (step % 2 === 0) {
        const bassFreq = (step % 4 === 2) ? currentBass * 1.5 : currentBass;
        this.triggerBass(time, bassFreq, sixteenthInterval * 1.5);
      }

      // 5. Ambient Pad Chords on downbeats of bar
      if (step === 0) {
        this.triggerPad(time, currentChord, beatInterval * 3.8);
      }

      // 6. Lead melody note
      if (step % 4 === 0 && Math.random() > 0.3) {
        const randomLead = leadNotes[Math.floor(Math.random() * leadNotes.length)];
        this.triggerLead(time, randomLead, beatInterval * 0.9);
      }

      step = (step + 1) % 16;
    }, sixteenthInterval * 1000);
  }

  triggerKick(time) {
    if (!this.audioCtx || !this.analyser) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.18);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.analyser);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  triggerSnare(time) {
    if (!this.audioCtx || !this.analyser) return;
    
    // Noise buffer
    const bufferSize = this.audioCtx.sampleRate * 0.15;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800;

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);

    noise.start(time);
    noise.stop(time + 0.16);
  }

  triggerHiHat(time, vol = 0.05) {
    if (!this.audioCtx || !this.analyser) return;
    
    const bufferSize = this.audioCtx.sampleRate * 0.05;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6000;

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  triggerBass(time, freq, dur) {
    if (!this.audioCtx || !this.analyser) return;
    const osc = this.audioCtx.createOscillator();
    const filter = this.audioCtx.createBiquadFilter();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, time);
    filter.frequency.exponentialRampToValueAtTime(200, time + dur);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.linearRampToValueAtTime(0.2, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);

    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  triggerPad(time, chordFreqs, dur) {
    if (!this.audioCtx || !this.analyser) return;

    chordFreqs.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const filter = this.audioCtx.createBiquadFilter();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      // Subtle detuning for analog chorus lushness
      osc.frequency.setValueAtTime(freq + (idx % 2 === 0 ? 0.8 : -0.8), time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, time);
      filter.frequency.linearRampToValueAtTime(950, time + dur * 0.5);
      filter.frequency.linearRampToValueAtTime(350, time + dur);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.06, time + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.analyser);

      osc.start(time);
      osc.stop(time + dur + 0.05);
    });
  }

  triggerLead(time, freq, dur) {
    if (!this.audioCtx || !this.analyser) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.analyser);

    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  stopSynth() {
    this.isSynthPlaying = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  getCurrentTime() {
    if (this.audioElement && this.audioElement.src && !this.isSynthPlaying) {
      return this.audioElement.currentTime;
    }
    if (this.isSynthPlaying && this.audioCtx) {
      return Math.max(0, this.audioCtx.currentTime - this.synthStartTime);
    }
    return this.synthPauseOffset || 0;
  }

  seek(seconds) {
    if (this.audioElement && this.audioElement.src && !this.isSynthPlaying) {
      this.audioElement.currentTime = seconds;
    } else if (this.isSynthPlaying) {
      this.playSynthTrack(this.currentTrack, seconds);
    } else {
      this.synthPauseOffset = seconds;
    }
  }
}

export const audioEngine = new AudioEngine();
