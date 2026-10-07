import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Star, 
  Sparkles, 
  Zap, 
  Clock, 
  Compass, 
  Bookmark, 
  Film,
  Layers,
  Heart
} from 'lucide-react';
import { Anime, Profile, WatchHistoryItem, SearchFilters } from './types';
import { 
  getAnimeList, 
  getProfiles, 
  createProfile, 
  updateProfile, 
  deleteProfile, 
  getWatchHistory, 
  saveWatchProgress, 
  deleteWatchHistoryItem, 
  getBookmarks, 
  toggleBookmark 
} from './lib/api';

import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { AnimeRow } from './components/AnimeRow';
import { VideoPlayer } from './components/VideoPlayer';
import { AnimeDetailModal } from './components/AnimeDetailModal';
import { SearchAndFilterView } from './components/SearchAndFilterView';
import { MyListView } from './components/MyListView';
import { ContinueWatchingView } from './components/ContinueWatchingView';
import { ProfileModal } from './components/ProfileModal';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<'home' | 'browse' | 'continue' | 'mylist' | 'search'>('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Core Data
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [bookmarkedAnimes, setBookmarkedAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Active playback
  const [activePlayingAnime, setActivePlayingAnime] = useState<Anime | null>(null);
  const [activeEpisodeNumber, setActiveEpisodeNumber] = useState(1);
  const [selectedDetailAnime, setSelectedDetailAnime] = useState<Anime | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Admin authentication state
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('hotmp_admin_token') || null;
  });

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [animeData, profileData] = await Promise.all([
        getAnimeList(),
        getProfiles()
      ]);
      setAnimes(animeData);
      setProfiles(profileData);

      // Select active profile
      const savedProfileId = localStorage.getItem('hotmp_active_profile_id');
      const found = profileData.find((p) => p.id === savedProfileId);
      const chosen = found || profileData[0] || null;
      setActiveProfile(chosen);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load profile-specific history and bookmarks whenever active profile changes
  const loadProfileData = useCallback(async (profId: string) => {
    try {
      const [history, bookmarks] = await Promise.all([
        getWatchHistory(profId),
        getBookmarks(profId)
      ]);
      setWatchHistory(history);
      setBookmarkedAnimes(bookmarks);
    } catch (err) {
      console.error('Failed to load profile data:', err);
    }
  }, []);

  useEffect(() => {
    if (activeProfile?.id) {
      localStorage.setItem('hotmp_active_profile_id', activeProfile.id);
      loadProfileData(activeProfile.id);
    }
  }, [activeProfile?.id, loadProfileData]);

  // Handle Profile Switch
  const handleSelectProfile = (profile: Profile) => {
    setActiveProfile(profile);
  };

  const handleCreateProfile = async (data: { name: string; avatar: string; isKids: boolean; autoPlay?: boolean }) => {
    const newProf = await createProfile(data);
    const updated = await getProfiles();
    setProfiles(updated);
    setActiveProfile(newProf);
  };

  const handleUpdateProfile = async (id: string, data: Partial<Profile>) => {
    await updateProfile(id, data);
    const updated = await getProfiles();
    setProfiles(updated);
    if (activeProfile?.id === id) {
      const refreshed = updated.find((p) => p.id === id);
      if (refreshed) setActiveProfile(refreshed);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    await deleteProfile(id);
    const updated = await getProfiles();
    setProfiles(updated);
    if (activeProfile?.id === id) {
      setActiveProfile(updated[0] || null);
    }
  };

  // History mapping for quick lookup: animeId -> WatchHistoryItem
  const watchHistoryMap = useMemo(() => {
    const map: Record<string, WatchHistoryItem> = {};
    for (const item of watchHistory) {
      map[item.animeId] = item;
    }
    return map;
  }, [watchHistory]);

  // Bookmarks check
  const isBookmarked = useCallback((animeId: string) => {
    return bookmarkedAnimes.some((a) => a.id === animeId);
  }, [bookmarkedAnimes]);

  // Toggle Bookmark
  const handleToggleBookmark = async (animeId: string) => {
    if (!activeProfile) return;
    try {
      await toggleBookmark(activeProfile.id, animeId);
      // reload bookmarks
      const updated = await getBookmarks(activeProfile.id);
      setBookmarkedAnimes(updated);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  // Save watch progress from player
  const handleSaveProgress = async (data: {
    animeId: string;
    episodeId: string;
    episodeNumber: number;
    progressSeconds: number;
    durationSeconds: number;
    animeTitle: string;
    animePoster: string;
    episodeTitle: string;
  }) => {
    if (!activeProfile) return;
    try {
      await saveWatchProgress(activeProfile.id, data);
      const updatedHistory = await getWatchHistory(activeProfile.id);
      setWatchHistory(updatedHistory);
    } catch (err) {
      console.error('Failed to save watch progress:', err);
    }
  };

  // Remove item from history
  const handleRemoveHistory = async (animeId: string) => {
    if (!activeProfile) return;
    try {
      await deleteWatchHistoryItem(activeProfile.id, animeId);
      const updatedHistory = await getWatchHistory(activeProfile.id);
      setWatchHistory(updatedHistory);
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  // Play anime trigger
  const handlePlayAnime = (anime: Anime, episodeNumber: number = 1) => {
    setActivePlayingAnime(anime);
    setActiveEpisodeNumber(episodeNumber);
    setSelectedDetailAnime(null);
  };

  // Open Details Modal
  const handleOpenDetails = (anime: Anime) => {
    setSelectedDetailAnime(anime);
  };

  // Categorized Anime lists for Home page OTT rows
  const featuredAnimes = useMemo(() => {
    const featured = animes.filter((a) => a.featured);
    return featured.length > 0 ? featured : animes.slice(0, 3);
  }, [animes]);

  const trendingAnimes = useMemo(() => {
    return animes.filter((a) => a.trending);
  }, [animes]);

  const topRatedAnimes = useMemo(() => {
    return [...animes].sort((a, b) => b.rating - a.rating);
  }, [animes]);

  const actionAnimes = useMemo(() => {
    return animes.filter((a) => a.genres.includes('Action') || a.genres.includes('Shounen'));
  }, [animes]);

  const fantasyAnimes = useMemo(() => {
    return animes.filter((a) => a.genres.includes('Fantasy') || a.genres.includes('Supernatural'));
  }, [animes]);

  const scifiAnimes = useMemo(() => {
    return animes.filter((a) => a.genres.includes('Sci-Fi') || a.genres.includes('Cyberpunk'));
  }, [animes]);

  // Anime objects matching current profile watch history (Continue Watching Row)
  const continueWatchingAnimes = useMemo(() => {
    const list: Anime[] = [];
    for (const h of watchHistory) {
      const found = animes.find((a) => a.id === h.animeId);
      if (found && !list.some((a) => a.id === found.id)) {
        list.push(found);
      }
    }
    return list;
  }, [watchHistory, animes]);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#e0e2ec] flex flex-col selection:bg-rose-600 selection:text-white font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top OTT Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeProfile={activeProfile}
        profiles={profiles}
        onSelectProfile={handleSelectProfile}
        onOpenProfileManager={() => setShowProfileModal(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
        isAdminLoggedIn={Boolean(adminToken)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-rose-600/30 border-t-rose-600 animate-spin" />
            <p className="text-xs text-zinc-400 font-semibold tracking-wider uppercase">
              Loading HOTMP Anime Platform...
            </p>
          </div>
        ) : (
          <>
            {/* View: HOME OTT EXPERIENCE */}
            {currentTab === 'home' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Hero Spotlight Carousel */}
                <HeroBanner
                  featuredAnimes={featuredAnimes}
                  onPlayAnime={handlePlayAnime}
                  onOpenDetails={handleOpenDetails}
                  isBookmarked={isBookmarked}
                  onToggleBookmark={handleToggleBookmark}
                  watchHistory={watchHistory}
                />

                {/* Continue Watching Row (Profile History) */}
                {continueWatchingAnimes.length > 0 && (
                  <AnimeRow
                    title="Continue Watching"
                    subtitle={`Resume your episodes where you left off (${activeProfile?.name || 'Profile'})`}
                    icon={<Clock className="w-5 h-5" />}
                    animes={continueWatchingAnimes}
                    onPlayAnime={handlePlayAnime}
                    onOpenDetails={handleOpenDetails}
                    isBookmarked={isBookmarked}
                    onToggleBookmark={handleToggleBookmark}
                    watchHistoryMap={watchHistoryMap}
                    showProgress={true}
                  />
                )}

                {/* Trending Now */}
                <AnimeRow
                  title="Trending Now"
                  subtitle="Most watched series this week"
                  icon={<Flame className="w-5 h-5" />}
                  animes={trendingAnimes.length > 0 ? trendingAnimes : animes}
                  onPlayAnime={handlePlayAnime}
                  onOpenDetails={handleOpenDetails}
                  isBookmarked={isBookmarked}
                  onToggleBookmark={handleToggleBookmark}
                  watchHistoryMap={watchHistoryMap}
                />

                {/* Top Rated Masterpieces */}
                <AnimeRow
                  title="Top Rated Masterpieces"
                  subtitle="Critically acclaimed anime with 8.5+ ratings"
                  icon={<Star className="w-5 h-5" />}
                  animes={topRatedAnimes}
                  onPlayAnime={handlePlayAnime}
                  onOpenDetails={handleOpenDetails}
                  isBookmarked={isBookmarked}
                  onToggleBookmark={handleToggleBookmark}
                  watchHistoryMap={watchHistoryMap}
                />

                {/* Action & Supernatural */}
                {actionAnimes.length > 0 && (
                  <AnimeRow
                    title="Action & Supernatural"
                    subtitle="High-octane battles, cursed energy, and demons"
                    icon={<Zap className="w-5 h-5" />}
                    animes={actionAnimes}
                    onPlayAnime={handlePlayAnime}
                    onOpenDetails={handleOpenDetails}
                    isBookmarked={isBookmarked}
                    onToggleBookmark={handleToggleBookmark}
                    watchHistoryMap={watchHistoryMap}
                  />
                )}

                {/* Fantasy & Adventure */}
                {fantasyAnimes.length > 0 && (
                  <AnimeRow
                    title="Fantasy & Adventure"
                    subtitle="Sprawling voyages, magic spells, and ancient lore"
                    icon={<Sparkles className="w-5 h-5" />}
                    animes={fantasyAnimes}
                    onPlayAnime={handlePlayAnime}
                    onOpenDetails={handleOpenDetails}
                    isBookmarked={isBookmarked}
                    onToggleBookmark={handleToggleBookmark}
                    watchHistoryMap={watchHistoryMap}
                  />
                )}

                {/* Sci-Fi & Cyberpunk */}
                {scifiAnimes.length > 0 && (
                  <AnimeRow
                    title="Sci-Fi & Cyberpunk"
                    subtitle="Futuristic dystopias and high-tech chrome"
                    icon={<Film className="w-5 h-5" />}
                    animes={scifiAnimes}
                    onPlayAnime={handlePlayAnime}
                    onOpenDetails={handleOpenDetails}
                    isBookmarked={isBookmarked}
                    onToggleBookmark={handleToggleBookmark}
                    watchHistoryMap={watchHistoryMap}
                  />
                )}

                {/* My List Quick Row (if bookmarks exist) */}
                {bookmarkedAnimes.length > 0 && (
                  <AnimeRow
                    title="My List"
                    subtitle={`Saved bookmarks for ${activeProfile?.name || 'you'}`}
                    icon={<Bookmark className="w-5 h-5" />}
                    animes={bookmarkedAnimes}
                    onPlayAnime={handlePlayAnime}
                    onOpenDetails={handleOpenDetails}
                    isBookmarked={isBookmarked}
                    onToggleBookmark={handleToggleBookmark}
                    watchHistoryMap={watchHistoryMap}
                  />
                )}
              </div>
            )}

            {/* View: BROWSE / DISCOVER */}
            {currentTab === 'browse' && (
              <SearchAndFilterView
                animes={animes}
                onPlayAnime={handlePlayAnime}
                onOpenDetails={handleOpenDetails}
                isBookmarked={isBookmarked}
                onToggleBookmark={handleToggleBookmark}
                watchHistoryMap={watchHistoryMap}
              />
            )}

            {/* View: SEARCH */}
            {currentTab === 'search' && (
              <SearchAndFilterView
                animes={animes}
                onPlayAnime={handlePlayAnime}
                onOpenDetails={handleOpenDetails}
                isBookmarked={isBookmarked}
                onToggleBookmark={handleToggleBookmark}
                watchHistoryMap={watchHistoryMap}
                initialQuery={searchQuery}
              />
            )}

            {/* View: CONTINUE WATCHING */}
            {currentTab === 'continue' && (
              <ContinueWatchingView
                historyItems={watchHistory}
                animes={animes}
                onPlayAnime={handlePlayAnime}
                onRemoveHistory={handleRemoveHistory}
                onBrowseMore={() => setCurrentTab('home')}
                profileName={activeProfile?.name || 'Profile'}
              />
            )}

            {/* View: MY LIST */}
            {currentTab === 'mylist' && (
              <MyListView
                bookmarkedAnimes={bookmarkedAnimes}
                onPlayAnime={handlePlayAnime}
                onOpenDetails={handleOpenDetails}
                onToggleBookmark={handleToggleBookmark}
                watchHistoryMap={watchHistoryMap}
                onBrowseMore={() => setCurrentTab('home')}
                profileName={activeProfile?.name || 'Profile'}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/80 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-zinc-500 space-y-3">
        <div className="flex items-center justify-center gap-2">
          <span className="font-black text-white font-['Outfit',sans-serif] tracking-wider text-base">
            HOT<span className="text-rose-500">MP</span>
          </span>
          <span>— Premium Anime OTT Streaming Network</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-zinc-400">
          <button onClick={() => setCurrentTab('home')} className="hover:text-white cursor-pointer">Home</button>
          <button onClick={() => setCurrentTab('browse')} className="hover:text-white cursor-pointer">Browse Genres</button>
          <button onClick={() => setCurrentTab('continue')} className="hover:text-white cursor-pointer">Continue Watching</button>
          <button onClick={() => setCurrentTab('mylist')} className="hover:text-white cursor-pointer">My List</button>
          <button onClick={() => setShowAdminModal(true)} className="hover:text-rose-400 text-zinc-300 font-semibold cursor-pointer">
            Admin Panel
          </button>
        </div>
        <p className="text-[11px] text-zinc-600 max-w-lg mx-auto">
          Active Profile: <span className="text-zinc-400 font-semibold">{activeProfile?.name}</span> • Multi-server streaming playback powered by HOTMP OTT engine.
        </p>
      </footer>

      {/* Fullscreen Video Player Modal */}
      {activePlayingAnime && (
        <VideoPlayer
          anime={activePlayingAnime}
          initialEpisodeNumber={activeEpisodeNumber}
          onClose={() => setActivePlayingAnime(null)}
          onSaveProgress={handleSaveProgress}
          initialHistoryItem={watchHistoryMap[activePlayingAnime.id]}
          activeProfile={activeProfile}
          autoPlayNextPreference={activeProfile?.autoPlay !== false}
        />
      )}

      {/* Anime Detail & Episode Picker Modal */}
      {selectedDetailAnime && (
        <AnimeDetailModal
          anime={selectedDetailAnime}
          onClose={() => setSelectedDetailAnime(null)}
          onPlayEpisode={handlePlayAnime}
          isBookmarked={isBookmarked(selectedDetailAnime.id)}
          onToggleBookmark={handleToggleBookmark}
          historyItem={watchHistoryMap[selectedDetailAnime.id]}
        />
      )}

      {/* Profile Switcher & Manager Modal */}
      {showProfileModal && (
        <ProfileModal
          profiles={profiles}
          activeProfile={activeProfile}
          onSelectProfile={handleSelectProfile}
          onCreateProfile={handleCreateProfile}
          onUpdateProfile={handleUpdateProfile}
          onDeleteProfile={handleDeleteProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Admin Management Panel Modal */}
      {showAdminModal && (
        <AdminPanel
          animes={animes}
          onRefreshAnimes={loadInitialData}
          onClose={() => setShowAdminModal(false)}
          adminToken={adminToken}
          setAdminToken={setAdminToken}
        />
      )}
    </div>
  );
}
