import React from 'react';
import { Play, Star, Plus, Check, Info } from 'lucide-react';
import { Anime, WatchHistoryItem } from '../types';

interface AnimeCardProps {
  anime: Anime;
  onPlay: (anime: Anime, episodeNumber?: number) => void;
  onOpenDetails: (anime: Anime) => void;
  isBookmarked: boolean;
  onToggleBookmark: (animeId: string) => void;
  historyItem?: WatchHistoryItem;
  showProgress?: boolean;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  onPlay,
  onOpenDetails,
  isBookmarked,
  onToggleBookmark,
  historyItem,
  showProgress = false,
}) => {
  const targetEpisode = historyItem?.episodeNumber || 1;

  return (
    <div 
      id={`anime-card-${anime.id}`}
      className="group relative flex-none w-44 sm:w-52 md:w-56 cursor-pointer rounded-2xl overflow-hidden bg-zinc-900/90 border border-white/5 hover:border-rose-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/40 hover:-translate-y-1.5 select-none"
      onClick={() => onOpenDetails(anime)}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-zinc-950">
        <img
          src={anime.posterUrl}
          alt={anime.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 z-10 pointer-events-none">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-bold text-amber-300">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{anime.rating.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded-md bg-rose-600/90 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
              {anime.language.includes('Dub') ? 'SUB/DUB' : 'SUB'}
            </span>
          </div>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3.5 z-20">
          <div className="space-y-2">
            <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
              {anime.synopsis}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                id={`play-card-${anime.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(anime, targetEpisode);
                }}
                title={historyItem ? `Resume Episode ${targetEpisode}` : 'Watch Episode 1'}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/40 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{historyItem ? `Resume E${targetEpisode}` : 'Play'}</span>
              </button>

              <button
                id={`bookmark-card-${anime.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(anime.id);
                }}
                title={isBookmarked ? 'Remove from My List' : 'Add to My List'}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isBookmarked
                    ? 'bg-emerald-600/25 border-emerald-500 text-emerald-400'
                    : 'bg-zinc-800/90 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                }`}
              >
                {isBookmarked ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
              </button>

              <button
                id={`info-card-${anime.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails(anime);
                }}
                title="Anime Details & Episodes"
                className="p-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-colors cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Continue Watching Progress bar */}
        {(showProgress || historyItem) && historyItem && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800 z-10">
            <div
              className="h-full bg-rose-500"
              style={{ width: `${historyItem.progressPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Footer Info */}
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-bold text-white truncate group-hover:text-rose-400 transition-colors">
          {anime.title}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
          <span className="truncate">{anime.genres[0] || 'Anime'}</span>
          <span>{anime.releaseYear} • {anime.episodes.length} Eps</span>
        </div>
      </div>
    </div>
  );
};
