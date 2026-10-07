import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, RotateCcw, Star } from 'lucide-react';
import { Anime, SearchFilters, WatchHistoryItem } from '../types';
import { AnimeCard } from './AnimeCard';

interface SearchAndFilterViewProps {
  animes: Anime[];
  onPlayAnime: (anime: Anime, episodeNumber?: number) => void;
  onOpenDetails: (anime: Anime) => void;
  isBookmarked: (animeId: string) => boolean;
  onToggleBookmark: (animeId: string) => void;
  watchHistoryMap: Record<string, WatchHistoryItem>;
  initialQuery?: string;
}

const ALL_GENRES = [
  'All',
  'Action',
  'Fantasy',
  'Supernatural',
  'Sci-Fi',
  'Shounen',
  'Comedy',
  'Slice of Life',
  'Drama',
  'Cyberpunk',
  'Adventure',
  'Horror',
  'Historical'
];

const ALL_YEARS = ['All', '2024', '2023', '2022', '2021', '2020'];
const ALL_LANGUAGES = ['All', 'Sub & Dub', 'Sub', 'Dub'];
const ALL_RATINGS = [
  { label: 'All Ratings', value: '0' },
  { label: '8.0+ Rating', value: '8.0' },
  { label: '8.5+ Rating', value: '8.5' },
  { label: '9.0+ Rating', value: '9.0' },
];

export const SearchAndFilterView: React.FC<SearchAndFilterViewProps> = ({
  animes,
  onPlayAnime,
  onOpenDetails,
  isBookmarked,
  onToggleBookmark,
  watchHistoryMap,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedMinRating, setSelectedMinRating] = useState('0');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'trending' | 'rating' | 'newest' | 'title'>('trending');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Instant client-side filtering and sorting for real-time responsiveness
  const filteredAnimes = useMemo(() => {
    let results = [...animes];

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      results = results.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.japaneseTitle && a.japaneseTitle.toLowerCase().includes(q)) ||
          a.genres.some((g) => g.toLowerCase().includes(q)) ||
          a.studio.toLowerCase().includes(q) ||
          a.synopsis.toLowerCase().includes(q)
      );
    }

    if (selectedGenre !== 'All') {
      results = results.filter((a) =>
        a.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())
      );
    }

    if (selectedYear !== 'All') {
      results = results.filter((a) => a.releaseYear.toString() === selectedYear);
    }

    if (selectedLanguage !== 'All') {
      results = results.filter((a) => a.language.includes(selectedLanguage));
    }

    if (selectedMinRating !== '0') {
      const min = parseFloat(selectedMinRating);
      results = results.filter((a) => a.rating >= min);
    }

    if (selectedStatus !== 'All') {
      results = results.filter((a) => a.status.toLowerCase() === selectedStatus.toLowerCase());
    }

    // Sort
    if (sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      results.sort((a, b) => b.releaseYear - a.releaseYear);
    } else if (sortBy === 'title') {
      results.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      results.sort((a, b) => {
        if (a.trending && !b.trending) return -1;
        if (!a.trending && b.trending) return 1;
        return b.rating - a.rating;
      });
    }

    return results;
  }, [animes, query, selectedGenre, selectedYear, selectedLanguage, selectedMinRating, selectedStatus, sortBy]);

  const resetFilters = () => {
    setQuery('');
    setSelectedGenre('All');
    setSelectedYear('All');
    setSelectedLanguage('All');
    setSelectedMinRating('0');
    setSelectedStatus('All');
    setSortBy('trending');
  };

  const hasActiveFilters =
    query ||
    selectedGenre !== 'All' ||
    selectedYear !== 'All' ||
    selectedLanguage !== 'All' ||
    selectedMinRating !== '0' ||
    selectedStatus !== 'All' ||
    sortBy !== 'trending';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header & Big Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif]">
            Search & Explore Anime
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Find your favorite series by title, genre, year, language, and rating.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              id="search-view-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by anime name, genre, character, or studio..."
              className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-rose-500 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="toggle-advanced-filters-btn"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold border transition-colors cursor-pointer ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-rose-600/15 border-rose-500/50 text-rose-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {hasActiveFilters && (
              <button
                id="reset-filters-btn"
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Genre Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
        {ALL_GENRES.map((g) => (
          <button
            key={g}
            id={`genre-pill-${g}`}
            onClick={() => setSelectedGenre(g)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedGenre === g
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Advanced Filter Controls Panel */}
      {showAdvancedFilters && (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in duration-150">
          {/* Release Year */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Release Year</label>
            <select
              id="filter-year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              {ALL_YEARS.map((y) => (
                <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>
              ))}
            </select>
          </div>

          {/* Language / Audio */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Audio & Sub</label>
            <select
              id="filter-language-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              {ALL_LANGUAGES.map((l) => (
                <option key={l} value={l}>{l === 'All' ? 'All Languages' : l}</option>
              ))}
            </select>
          </div>

          {/* Min Rating */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Min Rating</label>
            <select
              id="filter-rating-select"
              value={selectedMinRating}
              onChange={(e) => setSelectedMinRating(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              {ALL_RATINGS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Sort By</label>
            <select
              id="filter-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              <option value="trending">🔥 Trending Now</option>
              <option value="rating">⭐ Highest Rated</option>
              <option value="newest">📅 Newest First</option>
              <option value="title">🔤 Title (A-Z)</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Count & Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>
            Showing <strong className="text-white">{filteredAnimes.length}</strong> {filteredAnimes.length === 1 ? 'anime' : 'animes'}
          </span>
          {selectedGenre !== 'All' && (
            <span className="text-rose-400 font-medium">Genre: {selectedGenre}</span>
          )}
        </div>

        {filteredAnimes.length === 0 ? (
          <div className="text-center py-20 p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-3">
            <Search className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No matching anime found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              We couldn't find anything matching your search criteria. Try adjusting your filters or search keywords.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredAnimes.map((anime) => (
              <div key={anime.id} className="flex justify-center">
                <AnimeCard
                  anime={anime}
                  onPlay={onPlayAnime}
                  onOpenDetails={onOpenDetails}
                  isBookmarked={isBookmarked(anime.id)}
                  onToggleBookmark={onToggleBookmark}
                  historyItem={watchHistoryMap[anime.id]}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
