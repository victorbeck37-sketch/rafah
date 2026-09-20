import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music as MusicIcon, Disc } from 'lucide-react';
import { MusicTrack } from '../types';

interface AudioPlayerProps {
  track: MusicTrack;
}

export function AudioPlayer({ track }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.65);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  if (!track.is_active || !track.audio_url) {
    return null;
  }

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Audio playback error:", err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <audio
        ref={audioRef}
        src={track.audio_url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />

      {/* Collapsed Pill Button */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-3 bg-[#12090D]/90 hover:bg-[#1A0D14] border border-[#3A0D18] hover:border-[#641329] backdrop-blur-md px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 group cursor-pointer"
          title="Tocar nossa música"
          aria-label="Abrir reprodutor de música do casal"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#3A0D18]/80 text-[#F0C95A] group-hover:text-[#DFAE27]">
            <Disc className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#D92E45] rounded-full animate-ping" />
            )}
          </div>
          <div className="text-left max-w-[130px] hidden sm:block truncate">
            <p className="text-xs font-medium text-[#F6EBDD] truncate">{track.title}</p>
            <p className="text-[10px] text-[#B9A8A0] truncate">{track.artist}</p>
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-7 h-7 rounded-full bg-[#A9162F] hover:bg-[#D92E45] flex items-center justify-center text-[#F6EBDD] transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </div>
        </button>
      ) : (
        /* Expanded Player Card */
        <div className="w-80 sm:w-88 bg-[#12090D]/95 backdrop-blur-xl border border-[#3A0D18] rounded-2xl p-4 shadow-2xl transition-all duration-300">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              {track.cover_url ? (
                <img
                  src={track.cover_url}
                  alt={track.title}
                  className="w-12 h-12 rounded-lg object-cover border border-[#641329]/50"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-[#3A0D18] flex items-center justify-center text-[#F0C95A]">
                  <MusicIcon className="w-6 h-6" />
                </div>
              )}
              <div className="overflow-hidden">
                <span className="text-[10px] tracking-wider uppercase text-[#DFAE27] font-semibold block">Nossa Música</span>
                <h4 className="text-sm font-serif font-semibold text-[#F6EBDD] truncate">{track.title}</h4>
                <p className="text-xs text-[#B9A8A0] truncate">{track.artist}</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-[#B9A8A0] hover:text-[#F6EBDD] text-xs p-1 cursor-pointer"
              aria-label="Minimizar tocador"
            >
              ✕
            </button>
          </div>

          {track.message && (
            <p className="text-[11px] text-[#B9A8A0] italic mb-3 line-clamp-2 bg-[#090708]/60 p-2 rounded-lg border border-[#3A0D18]/50">
              "{track.message}"
            </p>
          )}

          {/* Scrubber */}
          <div className="space-y-1 mb-3">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-[#2A0F16] rounded-lg appearance-none cursor-pointer accent-[#D92E45]"
            />
            <div className="flex justify-between text-[10px] text-[#B9A8A0]">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-1 border-t border-[#3A0D18]/60">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="flex items-center gap-2 bg-[#A9162F] hover:bg-[#D92E45] text-[#F6EBDD] px-4 py-1.5 rounded-full text-xs font-medium transition-all shadow-md cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pausar
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 ml-0.5" /> Tocar
                </>
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-[#B9A8A0] hover:text-[#F0C95A] transition-colors cursor-pointer"
                aria-label={isMuted ? "Ativar som" : "Mutar som"}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-16 h-1 bg-[#2A0F16] rounded-lg appearance-none cursor-pointer accent-[#F0C95A]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
