import React from 'react';
import { usePlayerStore } from '../store/playerStore';
import { EQ_FREQUENCIES } from '../audio/audioEngine';
import { X, Sliders, Zap, ShieldAlert, RotateCcw } from 'lucide-react';

const BAND_LABELS = ['60 Hz\nSUB', '250 Hz\nLOW-MID', '1 kHz\nMID', '4 kHz\nPRESENCE', '12 kHz\nAIR'];

export const AudioRack = () => {
  const {
    isDspOpen,
    setDspOpen,
    isDspEnabled,
    toggleDsp,
    eqPreset,
    setEqPreset,
    eqGains,
    setEqBandGain,
  } = usePlayerStore();

  if (!isDspOpen) return null;

  const presets = ['FLAT', 'CYBER-BASS', 'VAPORWAVE', 'CRT-RADIO'];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl border border-cyber-neon bg-cyber-bgCard p-5 shadow-neon-strong relative font-mono text-xs select-none">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-cyber-border pb-3 mb-4">
          <div className="flex items-center space-x-2 text-cyber-neon text-glow font-bold text-sm">
            <Sliders size={16} />
            <span>&gt; AUDIO_DSP_RACK.CFG // 5-BAND EQ</span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Master DSP Bypass Toggle */}
            <button
              onClick={toggleDsp}
              className={`px-2 py-0.5 border text-[11px] font-bold transition-all flex items-center space-x-1 ${
                isDspEnabled
                  ? 'border-cyber-cyan bg-cyber-cyan/20 text-cyber-cyan text-glow-cyan shadow-cyan'
                  : 'border-cyber-borderDim bg-cyber-bgDark text-cyber-textDim'
              }`}
            >
              <Zap size={11} />
              <span>{isDspEnabled ? 'DSP ACTIVE' : 'DSP BYPASS'}</span>
            </button>

            <button
              onClick={() => setDspOpen(false)}
              className="text-cyber-textDim hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Preset Selector Bar */}
        <div className="mb-5 space-y-1.5">
          <div className="text-[10px] text-cyber-textDim uppercase tracking-wider flex justify-between">
            <span>DSP SOUND PROFILES</span>
            <span className="text-cyber-cyan">ACTIVE: {eqPreset}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => setEqPreset(preset)}
                className={`py-1.5 px-2 border transition-all text-center text-[10px] font-bold tracking-wider ${
                  eqPreset === preset
                    ? 'border-cyber-neon bg-cyber-neon/20 text-white shadow-neon-sm'
                    : 'border-cyber-borderDim bg-cyber-bgDark text-cyber-textDim hover:border-cyber-neon/50 hover:text-white'
                }`}
              >
                [ {preset} ]
              </button>
            ))}
          </div>
        </div>

        {/* 5-Band Graphic Equalizer Faders */}
        <div className="p-4 bg-cyber-bgDark border border-cyber-borderDim mb-4">
          <div className="flex justify-between items-center text-[10px] text-cyber-textDim mb-4">
            <span>5-BAND PARAMETRIC GRAPHIC EQUALIZER (-12dB to +12dB)</span>
            <button
              onClick={() => setEqPreset('FLAT')}
              className="flex items-center space-x-1 hover:text-cyber-neon transition-colors"
            >
              <RotateCcw size={10} />
              <span>RESET</span>
            </button>
          </div>

          <div className="grid grid-cols-5 gap-3 h-44 items-center justify-items-center">
            {EQ_FREQUENCIES.map((freq, idx) => {
              const gain = eqGains[idx] || 0;
              return (
                <div key={freq} className="flex flex-col items-center justify-between h-full w-full">
                  {/* Gain dB Readout */}
                  <span className={`text-[10px] font-bold ${gain > 0 ? 'text-cyber-neon text-glow' : gain < 0 ? 'text-cyber-cyan' : 'text-cyber-textDim'}`}>
                    {gain > 0 ? `+${gain}dB` : `${gain}dB`}
                  </span>

                  {/* Vertical Neon Slider */}
                  <div className="relative flex-1 flex items-center justify-center my-2">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="0.5"
                      value={gain}
                      disabled={!isDspEnabled}
                      onChange={(e) => setEqBandGain(idx, parseFloat(e.target.value))}
                      className="h-28 w-2 bg-[#140208] border border-cyber-borderDim rounded-none appearance-none cursor-pointer accent-cyber-neon [writing-mode:bt-lr] [-webkit-appearance:slider-vertical] disabled:opacity-40"
                    />
                  </div>

                  {/* Frequency Label */}
                  <span className="text-[9px] text-center text-cyber-textBright whitespace-pre-line leading-tight">
                    {BAND_LABELS[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamics Compressor / Limiter Status */}
        <div className="p-2.5 bg-cyber-bgDark border border-cyber-borderDim flex items-center justify-between text-[10px] text-cyber-textDim">
          <div className="flex items-center space-x-2">
            <ShieldAlert size={14} className="text-cyber-cyan" />
            <span className="text-white font-bold">DYNAMICS COMPRESSOR LIMITER:</span>
            <span className="text-cyber-cyan">-6dB THRESHOLD • 8:1 RATIO</span>
          </div>
          <span className="text-cyber-neon">ANTI-CLIPPING ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
