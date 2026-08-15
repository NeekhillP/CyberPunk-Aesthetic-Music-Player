import React from 'react';
import { usePlayerStore } from '../store/playerStore';
import { X, Sliders, Shield, Terminal, Volume2 } from 'lucide-react';

export const SettingsModal = () => {
  const { isSettingsOpen, setSettingsOpen } = usePlayerStore();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-cyber-neon bg-cyber-bgCard p-5 shadow-neon relative font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyber-border pb-3 mb-4">
          <div className="flex items-center space-x-2 text-cyber-neon text-glow font-bold text-sm">
            <Sliders size={16} />
            <span>&gt; SYSTEM CONFIGURATION</span>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className="text-cyber-textDim hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Audio Engine Info */}
          <div className="p-3 bg-cyber-bgDark border border-cyber-borderDim space-y-1">
            <div className="text-white font-bold flex items-center gap-1.5">
              <Terminal size={14} className="text-cyber-neon" />
              <span>AUDIO HARDWARE INTERFACE</span>
            </div>
            <p className="text-[11px] text-cyber-textDim">
              Core: Web Audio API (Analyser FFT 64-band)
            </p>
            <p className="text-[11px] text-cyber-textDim">
              Sample Rate: 44,100 Hz • Stereo 32-bit float
            </p>
            <p className="text-[11px] text-cyber-cyan">
              DSP Latency: ~5.8ms (Zero Dropped Frames)
            </p>
          </div>

          {/* Keyboard Shortcuts Guide */}
          <div className="p-3 bg-cyber-bgDark border border-cyber-borderDim space-y-2">
            <div className="text-white font-bold flex items-center gap-1.5">
              <Shield size={14} className="text-cyber-cyan" />
              <span>KEYBOARD SHORTCUTS</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-cyber-textBright">
              <div><span className="text-cyber-neon font-bold">[SPACE]</span> Play / Pause</div>
              <div><span className="text-cyber-neon font-bold">[LEFT/RIGHT]</span> Seek -/+ 5s</div>
              <div><span className="text-cyber-neon font-bold">[UP/DOWN]</span> Volume -/+ 10%</div>
              <div><span className="text-cyber-neon font-bold">[M]</span> Toggle Mute</div>
              <div><span className="text-cyber-neon font-bold">[A]</span> Toggle Auto-Scroll</div>
              <div><span className="text-cyber-neon font-bold">[N]</span> Next Track</div>
            </div>
          </div>

          {/* Station Status */}
          <div className="flex justify-between items-center text-[10px] text-cyber-textDim pt-2 border-t border-cyber-borderDim">
            <span>SEVEN.FM BUILD // v0.1.0-alpha</span>
            <span className="text-cyber-neon">ALL PROTOCOLS NOMINAL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
