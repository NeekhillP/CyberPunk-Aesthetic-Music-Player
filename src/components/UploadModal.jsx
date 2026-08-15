import React, { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { X, Upload, FileAudio, FileText, CheckCircle2 } from 'lucide-react';

export const UploadModal = () => {
  const { isUploadOpen, setUploadOpen, addCustomTrack } = usePlayerStore();
  const [audioFile, setAudioFile] = useState(null);
  const [lrcFile, setLrcFile] = useState(null);
  const [lrcContent, setLrcContent] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');

  if (!isUploadOpen) return null;

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      // Auto-populate title if empty
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        setTitle(cleanName);
      }
    }
  };

  const handleLrcChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLrcFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLrcContent(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleLoad = () => {
    if (!title && !audioFile && !lrcContent) return;

    const newTrack = {
      id: `custom-${Date.now()}`,
      title: title || 'Custom Terminal Track',
      artist: artist || 'Local Broadcast',
      cover: '/album_covers/loving_machine.jpg',
      audioUrl: audioFile ? URL.createObjectURL(audioFile) : null,
      lrc: lrcContent || `[00:00.00]${title || 'Custom Track'} (No LRC parsed)`,
      duration: 200,
      station: 'LOCAL // BROADCAST',
      genre: 'CUSTOM // AUDIO',
    };

    addCustomTrack(newTrack);
    setUploadOpen(false);

    // Reset fields
    setAudioFile(null);
    setLrcFile(null);
    setLrcContent('');
    setTitle('');
    setArtist('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg border border-cyber-cyan bg-cyber-bgCard p-5 shadow-cyan relative font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyber-cyan/50 pb-3 mb-4">
          <div className="flex items-center space-x-2 text-cyber-cyan text-glow-cyan font-bold text-sm">
            <Upload size={16} />
            <span>&gt; IMPORT AUDIO / LRC TELEMETRY</span>
          </div>
          <button
            onClick={() => setUploadOpen(false)}
            className="text-cyber-textDim hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Metadata Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-cyber-textDim uppercase mb-1">
                Track Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cyber Memory"
                className="w-full bg-cyber-bgDark border border-cyber-borderDim px-2.5 py-1.5 text-white focus:border-cyber-cyan outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-cyber-textDim uppercase mb-1">
                Artist Name
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Neon Ghost"
                className="w-full bg-cyber-bgDark border border-cyber-borderDim px-2.5 py-1.5 text-white focus:border-cyber-cyan outline-none"
              />
            </div>
          </div>

          {/* Audio File Picker */}
          <div>
            <label className="block text-[10px] text-cyber-textDim uppercase mb-1">
              Audio File (.mp3 / .wav / .ogg / .flac)
            </label>
            <label className="flex items-center justify-center space-x-2 border border-dashed border-cyber-borderDim hover:border-cyber-cyan p-4 bg-cyber-bgDark/60 cursor-pointer transition-colors">
              <FileAudio size={18} className={audioFile ? 'text-cyber-cyan' : 'text-cyber-textDim'} />
              <span className="text-cyber-textBright">
                {audioFile ? audioFile.name : 'Select audio track or leave empty for synth engine'}
              </span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="hidden"
              />
            </label>
          </div>

          {/* LRC File Picker or Text Paste */}
          <div>
            <label className="block text-[10px] text-cyber-textDim uppercase mb-1">
              Synchronized LRC File (.lrc) or Paste Raw LRC Text
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-center space-x-2 border border-dashed border-cyber-borderDim hover:border-cyber-cyan p-2.5 bg-cyber-bgDark/60 cursor-pointer transition-colors">
                <FileText size={16} className={lrcFile ? 'text-cyber-cyan' : 'text-cyber-textDim'} />
                <span className="text-cyber-textBright text-[11px]">
                  {lrcFile ? lrcFile.name : 'Choose .LRC file'}
                </span>
                <input
                  type="file"
                  accept=".lrc,.txt"
                  onChange={handleLrcChange}
                  className="hidden"
                />
              </label>

              <textarea
                value={lrcContent}
                onChange={(e) => setLrcContent(e.target.value)}
                placeholder="[00:05.00] Synchronized lyric line 1&#10;[00:10.50] Synchronized lyric line 2..."
                rows={4}
                className="w-full bg-cyber-bgDark border border-cyber-borderDim p-2 text-[11px] text-white focus:border-cyber-cyan outline-none font-mono resize-none"
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            onClick={handleLoad}
            className="w-full py-2 bg-cyber-bgCardLight border border-cyber-cyan hover:bg-cyber-cyan/20 text-cyber-cyan hover:text-white transition-all font-bold tracking-widest text-xs shadow-cyan flex items-center justify-center space-x-2"
          >
            <CheckCircle2 size={16} />
            <span>TRANSMIT TO TERMINAL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
