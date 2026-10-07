import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Anime, WatchHistoryItem } from '../types';
import { AnimeCard } from './AnimeCard';

interface AnimeRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  animes: Anime[];
  onPlayAnime: (anime: Anime, episodeNumber?: number) => void;
  onOpenDetails: (anime: Anime) => void;
  isBookmarked: (animeId: string) => boolean;
  onToggleBookmark: (animeId: string) => void;
  watchHistoryMap?: Record<string, WatchHistoryItem>;
  showProgress?: boolean;
}

export const AnimeRow: React.FC<AnimeRowProps> = ({
  title,
  subtitle,
  icon,
  animes,
  onPlayAnime,
  onOpenDetails,
  isBookmarked,
  onToggleBookmark,
  watchHistoryMap = {},
  showProgress = false,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!animes || animes.length === 0) return null;

  return (
    <section className="relative py-4 space-y-3">
      {/* Row Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end justify-between">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-rose-500">{icon}</span>}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-['Outfit',sans-serif]">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-zinc-400 font-medium">{subtitle}</p>}
          </div>
        </div>

        {/* Scroll navigation arrows */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            aria-label={`Scroll ${title} left`}
            className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label={`Scroll ${title} right`}
            className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Cards Slider */}
      <div className="relative group">
        <div
          ref={rowRef}
          className="flex items-stretch gap-4 overflow-x-auto scrollbar-none px-4 sm:px-6 lg:px-8 py-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {animes.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              onPlay={onPlayAnime}
              onOpenDetails={onOpenDetails}
              isBookmarked={isBookmarked(anime.id)}
              onToggleBookmark={onToggleBookmark}
              historyItem={watchHistoryMap[anime.id]}
              showProgress={showProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
