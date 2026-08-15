import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { audioEngine } from '../audio/audioEngine';
import { Activity, BarChart2, Disc } from 'lucide-react';

export const AudioVisualizer = () => {
  const canvasRef = useRef(null);
  const { isPlaying, visualizerMode, setVisualizerMode } = usePlayerStore();
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const numBars = 24;
    const segmentsPerBar = 12;
    const whiteBarCount = 8;

    const barHeights = new Array(numBars).fill(0);
    const peakHeights = new Array(numBars).fill(0);
    let radarAngle = 0;

    const render = () => {
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

      // Clear Canvas
      ctx.fillStyle = '#0a0205';
      ctx.fillRect(0, 0, width, height);

      // Render based on active visualizerMode
      if (visualizerMode === 'BARS') {
        renderBars(ctx, width, height, numBars, segmentsPerBar, whiteBarCount, barHeights, peakHeights, isPlaying);
      } else if (visualizerMode === 'WAVE') {
        renderOscilloscopeWave(ctx, width, height, isPlaying);
      } else if (visualizerMode === 'RADAR') {
        radarAngle += isPlaying ? 0.04 : 0.01;
        renderRadarCircle(ctx, width, height, radarAngle, isPlaying);
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
  }, [isPlaying, visualizerMode]);

  return (
    <div className="w-full border border-cyber-neon/80 bg-cyber-bgCard/90 p-2 shadow-inner-glow relative flex flex-col font-mono">
      {/* Top Header & Visualizer Mode Switcher */}
      <div className="flex justify-between items-center text-[9px] mb-1">
        <span className="text-cyber-textDim uppercase tracking-wider">
          VISUALIZER
        </span>

        {/* Mode Selector Badges */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setVisualizerMode('BARS')}
            className={`px-1.5 py-0.2 border transition-all ${
              visualizerMode === 'BARS'
                ? 'border-cyber-neon bg-cyber-neon/20 text-white font-bold'
                : 'border-cyber-borderDim text-cyber-textDim hover:text-white'
            }`}
          >
            BARS
          </button>
          <button
            onClick={() => setVisualizerMode('WAVE')}
            className={`px-1.5 py-0.2 border transition-all ${
              visualizerMode === 'WAVE'
                ? 'border-cyber-cyan bg-cyber-cyan/20 text-white font-bold'
                : 'border-cyber-borderDim text-cyber-textDim hover:text-white'
            }`}
          >
            WAVE
          </button>
          <button
            onClick={() => setVisualizerMode('RADAR')}
            className={`px-1.5 py-0.2 border transition-all ${
              visualizerMode === 'RADAR'
                ? 'border-cyber-hotPink bg-cyber-hotPink/20 text-white font-bold'
                : 'border-cyber-borderDim text-cyber-textDim hover:text-white'
            }`}
          >
            RADAR
          </button>
        </div>
      </div>

      {/* Visualizer Canvas Container */}
      <div className="w-full h-16 relative overflow-hidden bg-[#080104] border border-cyber-borderDim">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};

/**
 * MODE 1: Segmented LED Bar Equalizer
 */
function renderBars(ctx, width, height, numBars, segmentsPerBar, whiteBarCount, barHeights, peakHeights, isPlaying) {
  // Grid background
  ctx.strokeStyle = 'rgba(255, 42, 109, 0.08)';
  ctx.lineWidth = 1;
  for (let y = 0; y < height; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const freqData = audioEngine.getFrequencyData();
  const padding = 2;
  const totalSpacing = padding * (numBars - 1);
  const barWidth = Math.max(2, (width - totalSpacing) / numBars);
  const segmentHeight = Math.max(2, (height - (segmentsPerBar * 2)) / segmentsPerBar);

  for (let i = 0; i < numBars; i++) {
    const dataIndex = Math.floor((i / numBars) * (freqData.length * 0.75));
    let rawVal = freqData[dataIndex] || 0;

    if (!isPlaying) {
      rawVal = Math.sin(Date.now() * 0.003 + i * 0.4) * 8 + 10;
    }

    const normalized = Math.min(1, Math.max(0.05, rawVal / 255));
    const targetHeight = normalized * segmentsPerBar;

    barHeights[i] += (targetHeight - barHeights[i]) * 0.35;
    if (barHeights[i] > peakHeights[i]) {
      peakHeights[i] = barHeights[i];
    } else {
      peakHeights[i] = Math.max(0, peakHeights[i] - 0.15);
    }

    const activeSegments = Math.round(barHeights[i]);
    const x = i * (barWidth + padding);

    for (let s = 0; s < segmentsPerBar; s++) {
      const y = height - (s + 1) * (segmentHeight + 2);
      const isWhiteZone = i < whiteBarCount;
      const isActive = s < activeSegments;

      if (isActive) {
        if (isWhiteZone) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.shadowBlur = 4;
        } else {
          ctx.fillStyle = s > segmentsPerBar * 0.75 ? '#ff5388' : '#ff0055';
          ctx.shadowColor = 'rgba(255, 42, 109, 0.9)';
          ctx.shadowBlur = 5;
        }
      } else {
        ctx.fillStyle = isWhiteZone ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 42, 109, 0.08)';
        ctx.shadowBlur = 0;
      }

      ctx.fillRect(x, y, barWidth, segmentHeight);
    }

    const peakSeg = Math.min(segmentsPerBar - 1, Math.floor(peakHeights[i]));
    if (peakSeg > 0 && isPlaying) {
      const peakY = height - (peakSeg + 1) * (segmentHeight + 2);
      ctx.fillStyle = i < whiteBarCount ? '#ffffff' : '#05d9e8';
      ctx.shadowColor = i < whiteBarCount ? '#ffffff' : '#05d9e8';
      ctx.shadowBlur = 6;
      ctx.fillRect(x, peakY, barWidth, segmentHeight);
    }
  }
}

/**
 * MODE 2: Oscilloscope Waveform Line
 */
function renderOscilloscopeWave(ctx, width, height, isPlaying) {
  // Oscilloscope Reticle Grid
  ctx.strokeStyle = 'rgba(5, 217, 232, 0.12)';
  ctx.lineWidth = 1;
  const midY = height / 2;

  // Center reference line
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(width, midY);
  ctx.stroke();

  // Vertical reticle lines
  for (let x = 0; x < width; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  const timeData = audioEngine.getTimeDomainData();
  const sliceWidth = width / (timeData.length - 1);

  // Draw Glowing Phosphor Waveform
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#05d9e8';
  ctx.shadowColor = '#05d9e8';
  ctx.shadowBlur = 8;
  ctx.beginPath();

  for (let i = 0; i < timeData.length; i++) {
    let v = timeData[i] / 128.0; // 0 to 2
    if (!isPlaying) {
      // Idle ambient ripple
      v = 1.0 + Math.sin(Date.now() * 0.005 + i * 0.2) * 0.08;
    }

    const y = (v * height) / 2;
    const x = i * sliceWidth;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();

  // Secondary Hot-Pink Ghost Trace for authentic CRT bloom
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255, 42, 109, 0.85)';
  ctx.shadowColor = '#ff2a6d';
  ctx.shadowBlur = 4;
  ctx.beginPath();

  for (let i = 0; i < timeData.length; i++) {
    let v = timeData[i] / 128.0;
    if (!isPlaying) {
      v = 1.0 + Math.sin(Date.now() * 0.005 + i * 0.2) * 0.08;
    }
    const y = ((v * height) / 2) + Math.sin(i * 0.5) * 1.5;
    const x = i * sliceWidth;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

/**
 * MODE 3: Circular Frequency Radar Scanner
 */
function renderRadarCircle(ctx, width, height, angle, isPlaying) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 6;

  // Radar Grid Rings
  ctx.strokeStyle = 'rgba(255, 42, 109, 0.2)';
  ctx.lineWidth = 1;
  [0.35, 0.7, 1.0].forEach((ratio) => {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * ratio, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(centerX - radius, centerY);
  ctx.lineTo(centerX + radius, centerY);
  ctx.moveTo(centerX, centerY - radius);
  ctx.lineTo(centerX, centerY + radius);
  ctx.stroke();

  const freqData = audioEngine.getFrequencyData();
  const numPoints = Math.min(32, freqData.length);
  const step = (Math.PI * 2) / numPoints;

  // Frequency Spikes Ring
  ctx.strokeStyle = '#ff0055';
  ctx.fillStyle = 'rgba(255, 42, 109, 0.15)';
  ctx.shadowColor = '#ff0055';
  ctx.shadowBlur = 6;
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  for (let i = 0; i < numPoints; i++) {
    let val = freqData[i] || 0;
    if (!isPlaying) {
      val = Math.sin(Date.now() * 0.004 + i * 0.5) * 15 + 20;
    }
    const offset = (val / 255) * 14;
    const r = radius * 0.65 + offset;
    const a = i * step;

    const x = centerX + Math.cos(a) * r;
    const y = centerY + Math.sin(a) * r;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Sweeping Radar Beam Line
  const sweepX = centerX + Math.cos(angle) * radius;
  const sweepY = centerY + Math.sin(angle) * radius;

  ctx.strokeStyle = '#05d9e8';
  ctx.shadowColor = '#05d9e8';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(sweepX, sweepY);
  ctx.stroke();
}
