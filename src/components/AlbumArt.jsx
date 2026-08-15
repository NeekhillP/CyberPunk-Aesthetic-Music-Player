import React from 'react';
import { usePlayerStore } from '../store/playerStore';

export const AlbumArt = () => {
  const { playlist, currentTrackIndex, isPlaying } = usePlayerStore();
  const currentTrack = playlist[currentTrackIndex] || {};

  return (
    <div className="relative w-full aspect-square border border-cyber-neon bg-cyber-bgCard shadow-neon overflow-hidden group">
      {/* Corner Terminal Notches */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white z-20" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white z-20" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white z-20" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white z-20" />

      {/* Album Artwork Image */}
      <img
        src={currentTrack.cover || '/album_covers/loving_machine.jpg'}
        alt={currentTrack.title || 'Album Cover'}
        className={`w-full h-full object-cover duotone-filter transition-transform duration-700 ${
          isPlaying ? 'scale-[1.02]' : 'scale-100 opacity-90'
        }`}
      />

      {/* Duotone Overlay Gradient for authentic retro-cyber contrast */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#1f020a]/80 via-transparent to-[#005670]/40 mix-blend-color pointer-events-none" />

      {/* Scanline texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none opacity-70" />

      {/* Moving CRT Glitch / Scan Beam */}
      <div className={`scan-beam ${isPlaying ? 'opacity-80' : 'opacity-30'}`} />

      {/* Audio Reactive Pulse Vignette */}
      {isPlaying && (
        <div className="absolute inset-0 border border-cyber-hotPink/40 animate-pulse pointer-events-none" />
      )}
    </div>
  );
};
