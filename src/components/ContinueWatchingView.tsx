import React from 'react';
import { Clock, Play, Trash2, CheckCircle2 } from 'lucide-react';
import { Anime, WatchHistoryItem } from '../types';

interface ContinueWatchingViewProps {
  historyItems: WatchHistoryItem[];
  animes: Anime[];
  onPlayAnime: (anime: Anime, episodeNumber?: number) => void;
  onRemoveHistory: (animeId: string) => void;
  onBrowseMore: () => void;
  profileName: string;
}

export const ContinueWatchingView: React.FC<ContinueWatchingViewProps> = ({
  historyItems,
  animes,
  onPlayAnime,
  onRemoveHistory,
  onBrowseMore,
  profileName,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-500" />
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif]">
              Continue Watching
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Pick up right where you left off for <span className="text-rose-400 font-semibold">{profileName}</span>
          </p>
        </div>

        <span className="text-xs px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium">
          {historyItems.length} In Progress
        </span>
      </div>

      {historyItems.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-500">
            <Clock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No active watch history</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Episodes you start watching will automatically appear here with saved progress so you can seamlessly continue later.
          </p>
          <button
            onClick={onBrowseMore}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-600/30"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Watching Anime</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {historyItems.map((item) => {
            const anime = animes.find((a) => a.id === item.animeId);
            if (!anime) return null;

            const remainingSeconds = Math.max(0, item.durationSeconds - item.progressSeconds);
            const remainingMins = Math.ceil(remainingSeconds / 60);

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden bg-zinc-900/80 border border-zinc-800 hover:border-rose-500/40 transition-all shadow-lg hover:shadow-rose-950/20 flex flex-col justify-between"
              >
                {/* Image Banner */}
                <div 
                  className="relative aspect-video w-full overflow-hidden bg-zinc-950 cursor-pointer"
                  onClick={() => onPlayAnime(anime, item.episodeNumber)}
                >
                  <img
                    src={item.animePoster || anime.posterUrl}
                    alt={anime.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                    <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-white">
                    EP {item.episodeNumber}
                  </div>

                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono text-zinc-300">
                    {remainingMins > 0 ? `${remainingMins}m left` : 'Finished'}
                  </div>

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800">
                    <div
                      className="h-full bg-gradient-to-r from-rose-600 to-amber-500"
                      style={{ width: `${item.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 
                      className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors truncate cursor-pointer"
                      onClick={() => onPlayAnime(anime, item.episodeNumber)}
                    >
                      {anime.title}
                    </h3>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {item.episodeTitle || `Episode ${item.episodeNumber}`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                    <div className="text-[11px] text-zinc-400">
                      <span className="text-rose-400 font-semibold">{item.progressPercentage}%</span> watched
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onPlayAnime(anime, item.episodeNumber)}
                        className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Resume
                      </button>

                      <button
                        onClick={() => onRemoveHistory(item.animeId)}
                        title="Remove from Continue Watching"
                        className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
