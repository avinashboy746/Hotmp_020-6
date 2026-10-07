import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Server, 
  List, 
  SkipForward, 
  ArrowLeft, 
  Settings, 
  Check, 
  Layers,
  Sparkles,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import { Anime, Episode, Profile, StreamingServer, WatchHistoryItem } from '../types';

interface VideoPlayerProps {
  anime: Anime;
  initialEpisodeNumber: number;
  onClose: () => void;
  onSaveProgress: (data: {
    animeId: string;
    episodeId: string;
    episodeNumber: number;
    progressSeconds: number;
    durationSeconds: number;
    animeTitle: string;
    animePoster: string;
    episodeTitle: string;
  }) => void;
  initialHistoryItem?: WatchHistoryItem;
  activeProfile?: Profile | null;
  autoPlayNextPreference?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  anime,
  initialEpisodeNumber,
  onClose,
  onSaveProgress,
  initialHistoryItem,
  activeProfile,
  autoPlayNextPreference,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Active episode
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(() => {
    const idx = anime.episodes.findIndex((e) => e.episodeNumber === initialEpisodeNumber);
    return idx >= 0 ? idx : 0;
  });

  const currentEpisode: Episode = anime.episodes[currentEpisodeIndex] || {
    id: 'default-ep',
    episodeNumber: 1,
    title: 'Episode 1',
    thumbnailUrl: anime.posterUrl,
    duration: '24m',
    description: anime.synopsis,
    servers: [
      {
        id: 'def-srv',
        name: 'Server 1 (HOTMP Ultra CDN)',
        type: 'mp4',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        quality: '1080p'
      }
    ]
  };

  // Active Server
  const [selectedServerId, setSelectedServerId] = useState<string>(() => {
    return currentEpisode.servers[0]?.id || '';
  });

  // Whenever episode changes, select first server if current server not found
  useEffect(() => {
    if (!currentEpisode.servers.find(s => s.id === selectedServerId)) {
      setSelectedServerId(currentEpisode.servers[0]?.id || '');
    }
  }, [currentEpisodeIndex]);

  const activeServer: StreamingServer = currentEpisode.servers.find((s) => s.id === selectedServerId) ||
    currentEpisode.servers[0] || {
      id: 'fallback-s',
      name: 'Server 1 (Standard)',
      type: 'mp4',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      quality: '1080p'
    };

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(() => {
    if (autoPlayNextPreference !== undefined) return autoPlayNextPreference;
    if (activeProfile?.autoPlay !== undefined) return activeProfile.autoPlay;
    return true;
  });

  useEffect(() => {
    if (autoPlayNextPreference !== undefined) {
      setAutoPlayNext(autoPlayNextPreference);
    } else if (activeProfile?.autoPlay !== undefined) {
      setAutoPlayNext(activeProfile.autoPlay);
    }
  }, [autoPlayNextPreference, activeProfile?.autoPlay]);

  const [nextEpisodeCountdown, setNextEpisodeCountdown] = useState<number | null>(null);
  const [showEndOfEpisodeOverlay, setShowEndOfEpisodeOverlay] = useState(false);
  const [resumePrompt, setResumePrompt] = useState<{ seconds: number } | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Auto-play countdown timer effect
  useEffect(() => {
    if (nextEpisodeCountdown === null) return;
    if (nextEpisodeCountdown <= 0) {
      setNextEpisodeCountdown(null);
      playNextEpisode();
      return;
    }
    const timer = setTimeout(() => {
      setNextEpisodeCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [nextEpisodeCountdown]);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Resume check on initial mount
  useEffect(() => {
    if (
      initialHistoryItem &&
      initialHistoryItem.episodeNumber === currentEpisode.episodeNumber &&
      initialHistoryItem.progressSeconds > 10 &&
      initialHistoryItem.progressPercentage < 95
    ) {
      setResumePrompt({ seconds: initialHistoryItem.progressSeconds });
    }
  }, []);

  // Sync progress callback
  const syncProgress = useCallback((sec: number, dur: number) => {
    if (dur > 0) {
      onSaveProgress({
        animeId: anime.id,
        episodeId: currentEpisode.id,
        episodeNumber: currentEpisode.episodeNumber,
        progressSeconds: Math.floor(sec),
        durationSeconds: Math.floor(dur),
        animeTitle: anime.title,
        animePoster: anime.posterUrl,
        episodeTitle: currentEpisode.title,
      });
    }
  }, [anime, currentEpisode, onSaveProgress]);

  // Periodic progress save every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && videoRef.current) {
        syncProgress(videoRef.current.currentTime, videoRef.current.duration);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, syncProgress]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.duration > 0) {
        syncProgress(videoRef.current.currentTime, videoRef.current.duration);
      }
    };
  }, [syncProgress]);

  // Handle Controls Hide on idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowServerMenu(false);
        setShowSpeedMenu(false);
      }
    }, 3500);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skip(10);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skip(-10);
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen?.();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFullscreen]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Video element events
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch((err) => console.log('Play failed:', err));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      syncProgress(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.min(Math.max(videoRef.current.currentTime + seconds, 0), duration || 1440);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVol: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVol;
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen toggle failed:', err);
    }
  };

  // Next Episode
  const playNextEpisode = () => {
    if (currentEpisodeIndex < anime.episodes.length - 1) {
      setCurrentEpisodeIndex((prev) => prev + 1);
      setCurrentTime(0);
      setIsPlaying(true);
      setResumePrompt(null);
      setVideoError(null);
      setNextEpisodeCountdown(null);
      setShowEndOfEpisodeOverlay(false);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    syncProgress(duration, duration);
    if (currentEpisodeIndex < anime.episodes.length - 1) {
      if (autoPlayNext) {
        setNextEpisodeCountdown(3);
      } else {
        setShowEndOfEpisodeOverlay(true);
      }
    } else {
      setShowEndOfEpisodeOverlay(true);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const applyResume = (sec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = sec;
      setCurrentTime(sec);
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    setResumePrompt(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* Top Header Overlay */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent z-30 transition-opacity duration-300 flex items-center justify-between gap-4 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Left: Back & Anime info */}
        <div className="flex items-center gap-3">
          <button
            id="video-player-back-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Exit Player (Esc)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-rose-600 text-white font-bold">
                EPISODE {currentEpisode.episodeNumber}
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                {anime.title}
              </h2>
            </div>
            <p className="text-xs text-zinc-400 truncate mt-0.5 max-w-sm">
              {currentEpisode.title}
            </p>
          </div>
        </div>

        {/* Right: Server Switcher Dropdown & Episode List button */}
        <div className="flex items-center gap-2.5">
          {/* Server Switcher */}
          <div className="relative">
            <button
              id="server-switcher-btn"
              onClick={() => setShowServerMenu(!showServerMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer shadow-md"
            >
              <Server className="w-3.5 h-3.5 text-rose-500" />
              <span className="truncate max-w-28 sm:max-w-40">{activeServer.name}</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-rose-500/20 text-rose-300 rounded font-bold">
                {activeServer.quality}
              </span>
            </button>

            {/* Server Menu Dropdown */}
            {showServerMenu && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-40 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1.5 border-b border-zinc-800 mb-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Switch Streaming Server
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    If current server buffers, switch to a backup server
                  </p>
                </div>
                <div className="space-y-1">
                  {currentEpisode.servers.map((srv) => (
                    <button
                      key={srv.id}
                      id={`select-server-${srv.id}`}
                      onClick={() => {
                        setSelectedServerId(srv.id);
                        setShowServerMenu(false);
                        setVideoError(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left cursor-pointer transition-colors ${
                        selectedServerId === srv.id
                          ? 'bg-rose-500/20 text-rose-300 font-bold'
                          : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Server className={`w-3.5 h-3.5 ${selectedServerId === srv.id ? 'text-rose-400' : 'text-zinc-500'}`} />
                        <span className="truncate">{srv.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                          {srv.type}
                        </span>
                        {selectedServerId === srv.id && <Check className="w-3.5 h-3.5 text-rose-400 ml-1" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Episode Drawer Trigger */}
          <button
            id="toggle-episodes-drawer-btn"
            onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
          >
            <List className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Episodes</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div 
        className="relative w-full h-full flex items-center justify-center bg-black cursor-pointer"
        onClick={() => {
          if (activeServer.type !== 'embed') togglePlay();
        }}
      >
        {activeServer.type === 'embed' ? (
          // Embed Iframe player
          <iframe
            src={activeServer.url}
            title={currentEpisode.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          // Direct HTML5 Video Player
          <video
            ref={videoRef}
            src={activeServer.url}
            poster={currentEpisode.thumbnailUrl || anime.bannerUrl}
            className="w-full h-full object-contain"
            playsInline
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration);
                videoRef.current.playbackRate = playbackSpeed;
                // Auto play if not blocked
                videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
              }
            }}
            onEnded={handleVideoEnded}
            onError={() => {
              setVideoError('Unable to stream from this server. Please switch to another streaming server above.');
            }}
          />
        )}

        {/* Big Center Play/Pause indicator when paused (for MP4 stream) */}
        {activeServer.type !== 'embed' && !isPlaying && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl shadow-rose-600/50 transform scale-100 hover:scale-110 transition-transform">
              <Play className="w-9 h-9 fill-white ml-1.5" />
            </div>
          </div>
        )}

        {/* Video Error Banner */}
        {videoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center z-20">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Playback Error</h3>
            <p className="text-sm text-zinc-400 max-w-md mb-4">{videoError}</p>
            <div className="flex items-center gap-3">
              {currentEpisode.servers.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const otherServer = currentEpisode.servers.find((s) => s.id !== selectedServerId);
                    if (otherServer) {
                      setSelectedServerId(otherServer.id);
                      setVideoError(null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Switch to Backup Server
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current) {
                    videoRef.current.load();
                    videoRef.current.play().catch(() => {});
                  }
                  setVideoError(null);
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Resume Playback Prompt notification */}
        {resumePrompt && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-24 left-6 z-40 p-4 rounded-2xl bg-zinc-900/95 border border-zinc-700 shadow-2xl backdrop-blur-md flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200"
          >
            <div>
              <p className="text-xs text-zinc-400 font-medium">Resume where you left off?</p>
              <p className="text-sm font-bold text-white">
                Timestamp: <span className="text-rose-400">{formatTime(resumePrompt.seconds)}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="accept-resume-btn"
                onClick={() => applyResume(resumePrompt.seconds)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Resume
              </button>
              <button
                onClick={() => setResumePrompt(null)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* Auto-Play Next Episode Countdown Notification Card */}
        {nextEpisodeCountdown !== null && currentEpisodeIndex < anime.episodes.length - 1 && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-24 right-6 z-40 p-4 rounded-2xl bg-zinc-900/95 border border-rose-500/40 shadow-2xl backdrop-blur-md flex flex-col gap-3 min-w-[280px] max-w-sm animate-in slide-in-from-bottom-4 duration-200"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>Playing Next in {nextEpisodeCountdown}s</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30">
                Auto-Play ON
              </span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wide">
                Episode {anime.episodes[currentEpisodeIndex + 1]?.episodeNumber}
              </p>
              <p className="text-sm font-bold text-white truncate">
                {anime.episodes[currentEpisodeIndex + 1]?.title}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <button
                id="autoplay-play-now-btn"
                onClick={() => {
                  setNextEpisodeCountdown(null);
                  playNextEpisode();
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Play Now
              </button>
              <button
                id="autoplay-cancel-btn"
                onClick={() => {
                  setNextEpisodeCountdown(null);
                  setShowEndOfEpisodeOverlay(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* End of Episode Screen (when Auto-Play is OFF or canceled) */}
        {showEndOfEpisodeOverlay && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          >
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-rose-600/20 text-rose-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Episode {currentEpisode.episodeNumber} Complete</h3>
                <p className="text-xs text-zinc-400 mt-1">{currentEpisode.title}</p>
                {!autoPlayNext && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-[11px] text-zinc-300">
                    <PlayCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Auto-play is disabled for <strong className="text-white">{activeProfile?.name || 'this profile'}</strong></span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                {currentEpisodeIndex < anime.episodes.length - 1 ? (
                  <button
                    id="play-next-episode-end-btn"
                    onClick={() => {
                      setShowEndOfEpisodeOverlay(false);
                      playNextEpisode();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 cursor-pointer"
                  >
                    Play Episode {anime.episodes[currentEpisodeIndex + 1]?.episodeNumber}
                  </button>
                ) : (
                  <span className="text-xs text-zinc-400">You have completed all available episodes!</span>
                )}
                <button
                  id="replay-episode-btn"
                  onClick={() => {
                    setShowEndOfEpisodeOverlay(false);
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                      setCurrentTime(0);
                      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Replay
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar (for MP4 / direct stream) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute bottom-0 left-0 right-0 px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-30 transition-opacity duration-300 space-y-2.5 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber Timeline */}
        {activeServer.type !== 'embed' && (
          <div className="relative group/timeline flex items-center">
            <input
              id="video-timeline-scrubber"
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-none transition-all hover:h-2"
            />
            {/* Progress visual background */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-rose-600 rounded-lg pointer-events-none transition-all"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        )}

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-white">
          
          {/* Left Controls: Play, Skip, Volume, Time */}
          <div className="flex items-center gap-2 sm:gap-4">
            {activeServer.type !== 'embed' && (
              <>
                {/* Play/Pause */}
                <button
                  id="player-play-pause-btn"
                  onClick={togglePlay}
                  className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                </button>

                {/* Skip -10s */}
                <button
                  id="player-skip-back-btn"
                  onClick={() => skip(-10)}
                  className="p-2 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="Rewind 10s (Left Arrow)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Skip +10s */}
                <button
                  id="player-skip-fwd-btn"
                  onClick={() => skip(10)}
                  className="p-2 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="Forward 10s (Right Arrow)"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Volume slider */}
                <div className="flex items-center gap-1.5 group/vol">
                  <button
                    id="player-mute-btn"
                    onClick={toggleMute}
                    className="p-2 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-16 sm:w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500 opacity-70 hover:opacity-100"
                  />
                </div>

                {/* Time Display */}
                <div className="text-xs font-mono text-zinc-300 pl-1">
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-zinc-500 mx-1">/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </>
            )}

            {activeServer.type === 'embed' && (
              <span className="text-xs text-zinc-400 font-medium">
                Embed Mode • Use internal player controls
              </span>
            )}
          </div>

          {/* Right Controls: Auto-Play, Next Episode, Speed, Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Auto-Play Toggle button */}
            {currentEpisodeIndex < anime.episodes.length - 1 && (
              <button
                id="player-autoplay-toggle-btn"
                onClick={() => setAutoPlayNext(!autoPlayNext)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  autoPlayNext
                    ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 border border-transparent'
                }`}
                title={`Auto-play next episode: ${autoPlayNext ? 'ON' : 'OFF'} (${activeProfile?.name ? `${activeProfile.name}'s profile setting` : 'Profile preference'})`}
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Auto-Play</span>
                <span className={`text-[10px] font-bold uppercase px-1 py-0.2 rounded ${autoPlayNext ? 'bg-rose-500/30 text-rose-200' : 'bg-zinc-700 text-zinc-400'}`}>
                  {autoPlayNext ? 'ON' : 'OFF'}
                </span>
              </button>
            )}

            {/* Next Episode Button */}
            {currentEpisodeIndex < anime.episodes.length - 1 && (
              <button
                id="player-next-episode-btn"
                onClick={playNextEpisode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors cursor-pointer"
                title="Next Episode"
              >
                <span>Next Ep</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Playback Speed Menu */}
            {activeServer.type !== 'embed' && (
              <div className="relative">
                <button
                  id="player-speed-btn"
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
                >
                  {playbackSpeed}x
                </button>

                {showSpeedMenu && (
                  <div className="absolute right-0 bottom-9 w-24 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-1 z-50 text-xs space-y-0.5">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSpeedChange(s)}
                        className={`w-full text-left px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                          playbackSpeed === s ? 'bg-rose-600 text-white font-bold' : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen Button */}
            <button
              id="player-fullscreen-btn"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Episode Drawer Sidebar */}
      {showEpisodeDrawer && (
        <div 
          className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-zinc-900/95 border-l border-zinc-800 z-40 flex flex-col backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-8 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Episodes</h3>
              <p className="text-xs text-zinc-400">{anime.title}</p>
            </div>
            <button
              onClick={() => setShowEpisodeDrawer(false)}
              className="text-zinc-400 hover:text-white text-xs p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Drawer Auto-Play Toggle Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/60 border-b border-zinc-800 text-xs">
            <div className="flex items-center gap-2">
              <PlayCircle className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-300 text-[11px] font-medium">Auto-Play Next Episode</span>
            </div>
            <button
              id="drawer-autoplay-toggle-btn"
              onClick={() => setAutoPlayNext(!autoPlayNext)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                autoPlayNext 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              {autoPlayNext ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Episode List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {anime.episodes.map((ep, idx) => (
              <button
                key={ep.id}
                id={`drawer-ep-${ep.id}`}
                onClick={() => {
                  setCurrentEpisodeIndex(idx);
                  setCurrentTime(0);
                  setIsPlaying(true);
                  setShowEpisodeDrawer(false);
                  setResumePrompt(null);
                  setVideoError(null);
                }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left cursor-pointer transition-all ${
                  idx === currentEpisodeIndex
                    ? 'bg-rose-600/20 border border-rose-500/50'
                    : 'bg-zinc-800/60 hover:bg-zinc-800 border border-transparent'
                }`}
              >
                <div className="relative w-20 aspect-video rounded-lg overflow-hidden shrink-0 bg-zinc-950">
                  <img
                    src={ep.thumbnailUrl || anime.posterUrl}
                    alt={ep.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[9px] font-mono text-zinc-300">
                    {ep.duration}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold ${idx === currentEpisodeIndex ? 'text-rose-400' : 'text-zinc-400'}`}>
                      E{ep.episodeNumber}
                    </span>
                    <span className="text-xs font-bold text-white truncate">
                      {ep.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                    {ep.description}
                  </p>
                  <span className="text-[10px] text-zinc-500">
                    {ep.servers.length} {ep.servers.length === 1 ? 'Server' : 'Servers'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
