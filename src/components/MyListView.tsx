import React from 'react';
import { Bookmark, Play, Trash2, Compass } from 'lucide-react';
import { Anime, WatchHistoryItem } from '../types';
import { AnimeCard } from './AnimeCard';

interface MyListViewProps {
  bookmarkedAnimes: Anime[];
  onPlayAnime: (anime: Anime, episodeNumber?: number) => void;
  onOpenDetails: (anime: Anime) => void;
  onToggleBookmark: (animeId: string) => void;
  watchHistoryMap: Record<string, WatchHistoryItem>;
  onBrowseMore: () => void;
  profileName: string;
}

export const MyListView: React.FC<MyListViewProps> = ({
  bookmarkedAnimes,
  onPlayAnime,
  onOpenDetails,
  onToggleBookmark,
  watchHistoryMap,
  onBrowseMore,
  profileName,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif]">
              My List
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Personal saved watchlist for <span className="text-rose-400 font-semibold">{profileName}</span>
          </p>
        </div>

        <span className="text-xs px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium">
          {bookmarkedAnimes.length} {bookmarkedAnimes.length === 1 ? 'Title' : 'Titles'} Saved
        </span>
      </div>

      {bookmarkedAnimes.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-500">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Your list is empty</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Bookmark anime shows and movies by clicking the <span className="text-rose-400 font-semibold">+ My List</span> button while browsing to easily access them here.
          </p>
          <button
            id="empty-list-browse-btn"
            onClick={onBrowseMore}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-600/30"
          >
            <Compass className="w-4 h-4" />
            <span>Browse Trending Anime</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {bookmarkedAnimes.map((anime) => (
            <div key={anime.id} className="flex justify-center">
              <AnimeCard
                anime={anime}
                onPlay={onPlayAnime}
                onOpenDetails={onOpenDetails}
                isBookmarked={true}
                onToggleBookmark={onToggleBookmark}
                historyItem={watchHistoryMap[anime.id]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
