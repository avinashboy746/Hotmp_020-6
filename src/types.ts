export interface StreamingServer {
  id: string;
  name: string;
  type: 'mp4' | 'embed' | 'hls';
  url: string;
  quality: string;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  thumbnailUrl: string;
  duration: string;
  description: string;
  servers: StreamingServer[];
}

export interface Anime {
  id: string;
  title: string;
  japaneseTitle?: string;
  synopsis: string;
  posterUrl: string;
  bannerUrl: string;
  genres: string[];
  releaseYear: number;
  language: 'Sub' | 'Dub' | 'Sub & Dub';
  rating: number;
  ageRating: 'PG-13' | 'TV-14' | 'TV-MA' | 'G';
  status: 'Ongoing' | 'Completed';
  studio: string;
  featured?: boolean;
  trending?: boolean;
  episodes: Episode[];
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  isKids: boolean;
  autoPlay?: boolean;
  createdAt: string;
}

export interface WatchHistoryItem {
  id: string;
  profileId: string;
  animeId: string;
  episodeId: string;
  episodeNumber: number;
  progressSeconds: number;
  durationSeconds: number;
  progressPercentage: number;
  lastWatchedAt: string;
  animeTitle?: string;
  animePoster?: string;
  episodeTitle?: string;
}

export interface SearchFilters {
  query: string;
  genre: string;
  year: string;
  language: string;
  minRating: string;
  status: string;
  sortBy: 'trending' | 'rating' | 'newest' | 'title';
}
