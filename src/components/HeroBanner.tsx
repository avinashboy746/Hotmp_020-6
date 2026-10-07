import React, { useState, useEffect } from 'react';
import { Play, Plus, Check, Info, Star, ChevronRight, ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { Anime, WatchHistoryItem } from '../types';

interface HeroBannerProps {
  featuredAnimes: Anime[];
  onPlayAnime: (anime: Anime, episodeNumber?: number) => void;
  onOpenDetails: (anime: Anime) => void;
  isBookmarked: (animeId: string) => boolean;
  onToggleBookmark: (animeId: string) => void;
  watchHistory: WatchHistoryItem[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredAnimes,
  onPlayAnime,
  onOpenDetails,
  isBookmarked,
  onToggleBookmark,
  watchHistory,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate banner every 8 seconds if user doesn't interact
  useEffect(() => {
    if (featuredAnimes.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredAnimes.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [featuredAnimes.length]);

  if (!featuredAnimes || featuredAnimes.length === 0) return null;

  const currentAnime = featuredAnimes[currentIndex] || featuredAnimes[0];
  const bookmarked = isBookmarked(currentAnime.id);

  // Check if current anime has watch history
  const historyItem = watchHistory.find((h) => h.animeId === currentAnime.id);

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[640px] overflow-hidden select-none">
      {/* Background Image with Cinematic Gradients */}
      <div className="absolute inset-0">
        <img
          src={currentAnime.bannerUrl || currentAnime.posterUrl}
          alt={currentAnime.title}
          className="w-full h-full object-cover object-center filter brightness-90 transform scale-105 transition-all duration-700 ease-out"
          referrerPolicy="no-referrer"
        />
        {/* Gradients to blend smoothly into OTT dark layout */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/70 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0c10]/50 via-transparent to-[#0b0c10]" />
      </div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-20 z-10">
        <div className="max-w-2xl space-y-4">
          
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white shadow-md shadow-rose-600/30">
              HOTMP SPOTLIGHT
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {currentAnime.rating.toFixed(1)}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              {currentAnime.releaseYear}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              {currentAnime.ageRating}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-medium">
              {currentAnime.language}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-950/60 text-blue-300 border border-blue-500/30">
              {currentAnime.episodes.length} Episodes
            </span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-['Outfit',sans-serif] drop-shadow-md">
              {currentAnime.title}
            </h1>
            {currentAnime.japaneseTitle && (
              <p className="text-sm sm:text-base text-zinc-400 font-medium mt-1">
                {currentAnime.japaneseTitle}
              </p>
            )}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-300 font-medium">
            {currentAnime.genres.map((g) => (
              <span key={g} className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                {g}
              </span>
            ))}
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">{currentAnime.studio}</span>
          </div>

          {/* Synopsis */}
          <p className="text-xs sm:text-sm text-zinc-300 line-clamp-3 leading-relaxed max-w-xl">
            {currentAnime.synopsis}
          </p>

          {/* Continue Watching Progress bar preview if in history */}
          {historyItem && (
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 max-w-md backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-zinc-300 mb-1.5 font-medium">
                <span>Continue: Episode {historyItem.episodeNumber}</span>
                <span className="text-rose-400">{historyItem.progressPercentage}% watched</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-600 to-amber-500 rounded-full"
                  style={{ width: `${historyItem.progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id={`hero-play-btn-${currentAnime.id}`}
              onClick={() => onPlayAnime(currentAnime, historyItem?.episodeNumber || 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{historyItem ? `Resume Ep ${historyItem.episodeNumber}` : 'Watch Episode 1'}</span>
            </button>

            <button
              id={`hero-bookmark-btn-${currentAnime.id}`}
              onClick={() => onToggleBookmark(currentAnime.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border transition-all cursor-pointer ${
                bookmarked
                  ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/30'
                  : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
              }`}
            >
              {bookmarked ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>In My List</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to My List</span>
                </>
              )}
            </button>

            <button
              id={`hero-details-btn-${currentAnime.id}`}
              onClick={() => onOpenDetails(currentAnime)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 font-semibold text-sm transition-all cursor-pointer"
            >
              <Info className="w-4 h-4" />
              <span>Episodes & Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Dots & Controls */}
      {featuredAnimes.length > 1 && (
        <div className="absolute right-6 bottom-16 sm:bottom-20 z-20 flex items-center gap-2">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + featuredAnimes.length) % featuredAnimes.length)}
            aria-label="Previous Featured Anime"
            className="p-2 rounded-full bg-zinc-900/70 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 px-2">
            {featuredAnimes.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === currentIndex ? 'w-6 bg-rose-500' : 'w-2 bg-zinc-600 hover:bg-zinc-400'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredAnimes.length)}
            aria-label="Next Featured Anime"
            className="p-2 rounded-full bg-zinc-900/70 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
