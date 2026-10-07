import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Plus, 
  Check, 
  Star, 
  Calendar, 
  Tv, 
  Clock, 
  Layers, 
  Server,
  Sparkles
} from 'lucide-react';
import { Anime, WatchHistoryItem } from '../types';

interface AnimeDetailModalProps {
  anime: Anime;
  onClose: () => void;
  onPlayEpisode: (anime: Anime, episodeNumber: number) => void;
  isBookmarked: boolean;
  onToggleBookmark: (animeId: string) => void;
  historyItem?: WatchHistoryItem;
}

export const AnimeDetailModal: React.FC<AnimeDetailModalProps> = ({
  anime,
  onClose,
  onPlayEpisode,
  isBookmarked,
  onToggleBookmark,
  historyItem,
}) => {
  const [activeTab, setActiveTab] = useState<'episodes' | 'about'>('episodes');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-anime-detail-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Banner */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-zinc-950">
          <img
            src={anime.bannerUrl || anime.posterUrl}
            alt={anime.title}
            className="w-full h-full object-cover object-center filter brightness-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/40 to-transparent" />

          {/* Banner Details Overlay */}
          <div className="absolute bottom-4 left-4 sm:left-6 right-4 flex flex-col sm:flex-row sm:items-end gap-4 z-10">
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {anime.rating.toFixed(1)}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-medium">
                  {anime.releaseYear}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-medium">
                  {anime.ageRating}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold">
                  {anime.language}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-medium">
                  {anime.status}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif]">
                {anime.title}
              </h2>
              {anime.japaneseTitle && (
                <p className="text-xs text-zinc-400">{anime.japaneseTitle}</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                id={`modal-play-btn-${anime.id}`}
                onClick={() => onPlayEpisode(anime, historyItem?.episodeNumber || 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{historyItem ? `Resume Ep ${historyItem.episodeNumber}` : 'Watch Ep 1'}</span>
              </button>

              <button
                id={`modal-bookmark-btn-${anime.id}`}
                onClick={() => onToggleBookmark(anime.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  isBookmarked
                    ? 'bg-emerald-600/25 border-emerald-500 text-emerald-400'
                    : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                }`}
              >
                {isBookmarked ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
                <span>{isBookmarked ? 'In My List' : 'My List'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-zinc-800 flex items-center gap-6">
          <button
            onClick={() => setActiveTab('episodes')}
            className={`py-3.5 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'episodes'
                ? 'text-rose-500 border-rose-500'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            Episodes ({anime.episodes.length})
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3.5 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'about'
                ? 'text-rose-500 border-rose-500'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            Overview & Details
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 max-h-[420px] overflow-y-auto">
          {activeTab === 'episodes' ? (
            <div className="space-y-3">
              {anime.episodes.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-sm">
                  No episodes currently uploaded for this anime.
                </div>
              ) : (
                anime.episodes.map((ep) => (
                  <div
                    key={ep.id}
                    id={`episode-row-${ep.id}`}
                    onClick={() => onPlayEpisode(anime, ep.episodeNumber)}
                    className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-2xl bg-zinc-800/40 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
                  >
                    {/* Thumbnail and Info */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden shrink-0 bg-zinc-950">
                        <img
                          src={ep.thumbnailUrl || anime.posterUrl}
                          alt={ep.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                          <div className="w-8 h-8 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-md">
                            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-zinc-300">
                          {ep.duration}
                        </span>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-rose-400">
                            Episode {ep.episodeNumber}
                          </span>
                          <span className="text-xs text-zinc-500">•</span>
                          <span className="text-xs text-zinc-400 font-medium">
                            {ep.servers.length} Servers
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors truncate">
                          {ep.title}
                        </h4>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {ep.description}
                        </p>
                      </div>
                    </div>

                    {/* Server Badges */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <div className="hidden sm:flex flex-col items-end text-[11px] text-zinc-400">
                        <span className="text-zinc-500 font-medium">Available on:</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          {ep.servers.slice(0, 2).map((s) => (
                            <span key={s.id} className="px-1.5 py-0.5 rounded bg-zinc-700/60 text-[10px] text-zinc-300">
                              {s.name.split(' ')[0]}
                            </span>
                          ))}
                          {ep.servers.length > 2 && (
                            <span className="text-[10px] text-zinc-500">+{ep.servers.length - 2}</span>
                          )}
                        </div>
                      </div>

                      <button
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold transition-colors"
                      >
                        Play
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Overview & Details
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Synopsis</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">{anime.synopsis}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-zinc-800/40 border border-zinc-800 text-xs">
                <div>
                  <span className="text-zinc-500 block">Studio</span>
                  <span className="font-bold text-zinc-200 mt-0.5 block">{anime.studio}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Release Year</span>
                  <span className="font-bold text-zinc-200 mt-0.5 block">{anime.releaseYear}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Audio & Sub</span>
                  <span className="font-bold text-zinc-200 mt-0.5 block">{anime.language}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Status</span>
                  <span className="font-bold text-zinc-200 mt-0.5 block">{anime.status}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Genres</h4>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((g) => (
                    <span key={g} className="px-3 py-1 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 font-medium">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
