import fs from 'fs';
import path from 'path';

// Helper to write standard 16-bit PCM WAV file
function createWavBuffer(sampleRate, durationSec, generateSample) {
  const numSamples = Math.floor(sampleRate * durationSec);
  const numChannels = 2; // Stereo
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF Header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // 'fmt ' chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34); // BitsPerSample

  // 'data' chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const [left, right] = generateSample(t, i);

    const intLeft = Math.max(-32768, Math.min(32767, Math.floor(left * 32767)));
    const intRight = Math.max(-32768, Math.min(32767, Math.floor(right * 32767)));

    buffer.writeInt16LE(intLeft, offset);
    buffer.writeInt16LE(intRight, offset + 2);
    offset += 4;
  }

  return buffer;
}

// Ensure output dir
const outDir = path.resolve('public/audio');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Generating Track 1: Loving Machine...');
{
  const sampleRate = 44100;
  const duration = 227; // ~3m47s
  const bpm = 104;
  const beatSec = 60 / bpm;

  // Chord frequencies
  const chords = [
    [220.00, 261.63, 329.63, 392.00], // Am7
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [261.63, 329.63, 392.00, 523.25], // Cmaj
    [196.00, 246.94, 293.66, 392.00], // G
  ];
  const bassNotes = [55.0, 43.65, 65.41, 49.0]; // Sub bass frequencies

  const buffer = createWavBuffer(sampleRate, duration, (t) => {
    const currentBar = Math.floor(t / (beatSec * 4)) % chords.length;
    const currentChord = chords[currentBar];
    const currentBass = bassNotes[currentBar];
    const beatPos = (t % beatSec) / beatSec;
    const barPos = (t % (beatSec * 4)) / (beatSec * 4);

    let left = 0;
    let right = 0;

    // 1. Kick Drum (Beats 0 & 2)
    const kickBeat = (t % (beatSec * 2)) / (beatSec * 2);
    if (kickBeat < 0.2) {
      const kickEnv = Math.exp(-kickBeat * 25);
      const kickPitch = 120 * Math.exp(-kickBeat * 30) + 45;
      const kickWave = Math.sin(2 * Math.PI * kickPitch * t);
      left += kickWave * kickEnv * 0.45;
      right += kickWave * kickEnv * 0.45;
    }

    // 2. Snare / Clap (Beat 1 of 2)
    const snareBeat = ((t + beatSec) % (beatSec * 2)) / (beatSec * 2);
    if (snareBeat < 0.18) {
      const snareEnv = Math.exp(-snareBeat * 18);
      const noise = (Math.random() * 2 - 1) * 0.25;
      const body = Math.sin(2 * Math.PI * 180 * t) * 0.15;
      left += (noise + body) * snareEnv;
      right += (noise + body) * snareEnv;
    }

    // 3. Hi-Hat 16ths
    const sixteenth = (t % (beatSec / 4)) / (beatSec / 4);
    if (sixteenth < 0.05) {
      const hatEnv = Math.exp(-sixteenth * 50);
      const hatNoise = (Math.random() * 2 - 1) * 0.07 * hatEnv;
      left += hatNoise * 0.8;
      right += hatNoise * 1.2;
    }

    // 4. Bassline (8th notes groove)
    const eighthPos = (t % (beatSec / 2)) / (beatSec / 2);
    const bassEnv = Math.exp(-eighthPos * 6);
    const bassWave = Math.sin(2 * Math.PI * currentBass * t) + 
                     0.5 * Math.sin(2 * Math.PI * currentBass * 2 * t);
    left += bassWave * bassEnv * 0.25;
    right += bassWave * bassEnv * 0.25;

    // 5. Synth Pad Chords (Warm analog shimmer)
    for (let c = 0; c < currentChord.length; c++) {
      const freq = currentChord[c];
      const saw = (t * freq % 1) * 2 - 1;
      const padL = Math.sin(2 * Math.PI * (freq + 0.3) * t) * 0.04 + saw * 0.02;
      const padR = Math.sin(2 * Math.PI * (freq - 0.3) * t) * 0.04 + saw * 0.02;
      left += padL;
      right += padR;
    }

    // 6. Lead melody phrase
    const leadStep = Math.floor((t / (beatSec / 2)) % 16);
    const melodyScale = [440, 523.25, 659.25, 783.99, 880, 659.25, 523.25, 440];
    if (leadStep % 2 === 0 && t > 7) {
      const leadFreq = melodyScale[(leadStep + currentBar * 2) % melodyScale.length];
      const leadEnv = Math.exp(-((t % (beatSec / 2)) / (beatSec / 2)) * 4);
      const square = Math.sin(2 * Math.PI * leadFreq * t) > 0 ? 0.06 : -0.06;
      left += square * leadEnv * 0.7;
      right += square * leadEnv * 1.3;
    }

    // Soft master limiter
    left = Math.tanh(left * 0.9);
    right = Math.tanh(right * 0.9);

    return [left, right];
  });

  fs.writeFileSync(path.join(outDir, 'loving_machine.wav'), buffer);
  console.log('Track 1 generated successfully.');
}

console.log('Generating Track 2: Neon Solitude...');
{
  const sampleRate = 44100;
  const duration = 198;
  const bpm = 120;
  const beatSec = 60 / bpm;
  const chords = [
    [146.83, 220.0, 293.66, 349.23], // Dm
    [116.54, 174.61, 233.08, 293.66], // Bb
    [174.61, 220.0, 261.63, 349.23], // F
    [130.81, 196.0, 261.63, 329.63], // C
  ];
  const bassRoot = [73.42, 58.27, 87.31, 65.41];

  const buffer = createWavBuffer(sampleRate, duration, (t) => {
    const currentBar = Math.floor(t / (beatSec * 4)) % chords.length;
    const currentChord = chords[currentBar];
    const bass = bassRoot[currentBar];

    let left = 0;
    let right = 0;

    // Kick on all 4 beats
    const beatPos = (t % beatSec) / beatSec;
    if (beatPos < 0.15) {
      const env = Math.exp(-beatPos * 28);
      const kickWave = Math.sin(2 * Math.PI * (140 * Math.exp(-beatPos * 35) + 40) * t);
      left += kickWave * env * 0.48;
      right += kickWave * env * 0.48;
    }

    // Snare on 2 and 4
    const snareBeat = ((t + beatSec) % (beatSec * 2)) / (beatSec * 2);
    if (snareBeat < 0.16) {
      const env = Math.exp(-snareBeat * 22);
      const noise = (Math.random() * 2 - 1) * 0.28 * env;
      left += noise;
      right += noise;
    }

    // 16th Arpeggiator Bass
    const arp16 = Math.floor((t / (beatSec / 4)) % 16);
    const arpEnv = Math.exp(-((t % (beatSec / 4)) / (beatSec / 4)) * 9);
    const arpMult = [1, 1.5, 2, 1.5, 1, 1.5, 2, 2.5][arp16 % 8];
    const arpFreq = bass * arpMult;
    const saw = (t * arpFreq % 1) * 2 - 1;
    left += saw * arpEnv * 0.22;
    right += saw * arpEnv * 0.22;

    // Pad
    for (let c = 0; c < currentChord.length; c++) {
      const f = currentChord[c];
      left += Math.sin(2 * Math.PI * f * t) * 0.04;
      right += Math.sin(2 * Math.PI * (f * 1.004) * t) * 0.04;
    }

    left = Math.tanh(left * 0.9);
    right = Math.tanh(right * 0.9);
    return [left, right];
  });

  fs.writeFileSync(path.join(outDir, 'neon_solitude.wav'), buffer);
  console.log('Track 2 generated successfully.');
}

console.log('Audio generation finished.');
