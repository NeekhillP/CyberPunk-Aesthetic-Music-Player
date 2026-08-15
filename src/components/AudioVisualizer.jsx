import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { audioEngine } from '../audio/audioEngine';

export const AudioVisualizer = () => {
  const canvasRef = useRef(null);
  const { isPlaying } = usePlayerStore();
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const numBars = 24;
    const segmentsPerBar = 12;
    const whiteBarCount = 8; // First 8 bars are bright white as seen in reference image

    // Peak tracking array for smooth physics falloff
    const barHeights = new Array(numBars).fill(0);
    const peakHeights = new Array(numBars).fill(0);

    const render = () => {
      // Resize canvas cleanly to match internal display size
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;

      // Clear with dark transparent black
      ctx.fillStyle = '#140409';
      ctx.fillRect(0, 0, width, height);

      // Subtle background grid
      ctx.strokeStyle = 'rgba(255, 42, 109, 0.08)';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Get real frequency data from Web Audio Analyser
      const freqData = audioEngine.getFrequencyData();

      const padding = 2;
      const totalSpacing = padding * (numBars - 1);
      const barWidth = Math.max(2, (width - totalSpacing) / numBars);
      const segmentHeight = Math.max(2, (height - (segmentsPerBar * 2)) / segmentsPerBar);

      for (let i = 0; i < numBars; i++) {
        // Map FFT bins to visualizer bars
        const dataIndex = Math.floor((i / numBars) * (freqData.length * 0.75));
        let rawVal = freqData[dataIndex] || 0;

        if (!isPlaying) {
          // Subtle idle ambient ripple
          rawVal = Math.sin(Date.now() * 0.003 + i * 0.4) * 8 + 10;
        }

        const normalized = Math.min(1, Math.max(0.05, rawVal / 255));
        const targetHeight = normalized * segmentsPerBar;

        // Smooth interpolation
        barHeights[i] += (targetHeight - barHeights[i]) * 0.35;
        if (barHeights[i] > peakHeights[i]) {
          peakHeights[i] = barHeights[i];
        } else {
          peakHeights[i] = Math.max(0, peakHeights[i] - 0.15);
        }

        const activeSegments = Math.round(barHeights[i]);
        const x = i * (barWidth + padding);

        // Draw segmented LED blocks
        for (let s = 0; s < segmentsPerBar; s++) {
          const y = height - (s + 1) * (segmentHeight + 2);
          const isWhiteZone = i < whiteBarCount;
          const isActive = s < activeSegments;

          if (isActive) {
            if (isWhiteZone) {
              // White LED block
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
              ctx.shadowBlur = 4;
            } else {
              // Hot pink / Neon Magenta block
              ctx.fillStyle = s > segmentsPerBar * 0.75 ? '#ff5388' : '#ff0055';
              ctx.shadowColor = 'rgba(255, 42, 109, 0.9)';
              ctx.shadowBlur = 5;
            }
          } else {
            // Unlit LED background silhouette
            ctx.fillStyle = isWhiteZone ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 42, 109, 0.08)';
            ctx.shadowBlur = 0;
          }

          ctx.fillRect(x, y, barWidth, segmentHeight);
        }

        // Draw Peak indicator LED dot
        const peakSeg = Math.min(segmentsPerBar - 1, Math.floor(peakHeights[i]));
        if (peakSeg > 0 && isPlaying) {
          const peakY = height - (peakSeg + 1) * (segmentHeight + 2);
          ctx.fillStyle = i < whiteBarCount ? '#ffffff' : '#05d9e8';
          ctx.shadowColor = i < whiteBarCount ? '#ffffff' : '#05d9e8';
          ctx.shadowBlur = 6;
          ctx.fillRect(x, peakY, barWidth, segmentHeight);
        }
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="w-full border border-cyber-neon/80 bg-cyber-bgCard/90 p-2 shadow-inner-glow relative flex flex-col">
      {/* Top Label */}
      <div className="flex justify-between items-center text-[9px] text-cyber-textDim uppercase tracking-wider mb-1 font-mono">
        <span>SPECTRUM [Hz]</span>
        <span className="text-cyber-cyan text-glow-cyan text-[8px]">
          {isPlaying ? 'ACTIVE // 44.1kHz' : 'STANDBY'}
        </span>
      </div>

      {/* Visualizer Canvas */}
      <div className="w-full h-14 relative overflow-hidden bg-[#0a0205] border border-cyber-borderDim">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
