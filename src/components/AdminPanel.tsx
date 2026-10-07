import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Server, 
  Play, 
  X, 
  Tv, 
  Layers, 
  Search, 
  Lock, 
  Check, 
  AlertCircle,
  ExternalLink,
  Film
} from 'lucide-react';
import { Anime, Episode, StreamingServer } from '../types';
import { 
  createAnime, 
  updateAnime, 
  deleteAnime, 
  addEpisode, 
  updateEpisode, 
  deleteEpisode, 
  adminLogin 
} from '../lib/api';

interface AdminPanelProps {
  animes: Anime[];
  onRefreshAnimes: () => Promise<void>;
  onClose: () => void;
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  animes,
  onRefreshAnimes,
  onClose,
  adminToken,
  setAdminToken,
}) => {
  // Login State
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Search & Navigation
  const [adminSearch, setAdminSearch] = useState('');
  const [selectedAnimeForEpisodes, setSelectedAnimeForEpisodes] = useState<Anime | null>(null);

  // Modals
  const [showAnimeModal, setShowAnimeModal] = useState(false);
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);

  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

  // Server management inside episode
  const [activeEpisodeForServers, setActiveEpisodeForServers] = useState<Episode | null>(null);
  const [showServerModal, setShowServerModal] = useState(false);
  const [editingServer, setEditingServer] = useState<StreamingServer | null>(null);

  // Stream preview test modal
  const [testStream, setTestStream] = useState<StreamingServer | null>(null);

  // Loading & Notification state
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Anime Form State
  const [animeForm, setAnimeForm] = useState({
    title: '',
    japaneseTitle: '',
    synopsis: '',
    posterUrl: '',
    bannerUrl: '',
    genres: 'Action, Fantasy',
    releaseYear: new Date().getFullYear(),
    language: 'Sub & Dub',
    rating: 8.5,
    ageRating: 'TV-14',
    status: 'Ongoing',
    studio: 'Mappa',
    featured: false,
    trending: true,
  });

  // Episode Form State
  const [episodeForm, setEpisodeForm] = useState({
    episodeNumber: 1,
    title: '',
    thumbnailUrl: '',
    duration: '24m',
    description: '',
  });

  // Server Form State
  const [serverForm, setServerForm] = useState({
    name: 'Server 1 (HOTMP Ultra CDN)',
    type: 'mp4' as 'mp4' | 'embed',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    quality: '1080p',
  });

  // --- Handlers ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await adminLogin(passcode);
      if (res.success && res.token) {
        setAdminToken(res.token);
        localStorage.setItem('hotmp_admin_token', res.token);
      } else {
        setLoginError(res.message || 'Invalid admin passcode');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Connection error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('hotmp_admin_token');
  };

  const openAddAnime = () => {
    setEditingAnime(null);
    setAnimeForm({
      title: '',
      japaneseTitle: '',
      synopsis: '',
      posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600&auto=format&fit=crop&q=80',
      genres: 'Action, Fantasy',
      releaseYear: 2024,
      language: 'Sub & Dub',
      rating: 8.8,
      ageRating: 'TV-14',
      status: 'Ongoing',
      studio: 'Animation Studio',
      featured: false,
      trending: true,
    });
    setShowAnimeModal(true);
  };

  const openEditAnime = (a: Anime) => {
    setEditingAnime(a);
    setAnimeForm({
      title: a.title,
      japaneseTitle: a.japaneseTitle || '',
      synopsis: a.synopsis,
      posterUrl: a.posterUrl,
      bannerUrl: a.bannerUrl,
      genres: a.genres.join(', '),
      releaseYear: a.releaseYear,
      language: a.language,
      rating: a.rating,
      ageRating: a.ageRating,
      status: a.status,
      studio: a.studio,
      featured: Boolean(a.featured),
      trending: Boolean(a.trending),
    });
    setShowAnimeModal(true);
  };

  const handleSaveAnime = async () => {
    if (!adminToken) return;
    if (!animeForm.title.trim()) {
      setStatusMessage({ type: 'error', text: 'Anime title is required' });
      return;
    }

    setActionLoading(true);
    setStatusMessage(null);
    try {
      const payload: Partial<Anime> = {
        title: animeForm.title.trim(),
        japaneseTitle: animeForm.japaneseTitle.trim(),
        synopsis: animeForm.synopsis.trim(),
        posterUrl: animeForm.posterUrl.trim(),
        bannerUrl: animeForm.bannerUrl.trim(),
        genres: animeForm.genres.split(',').map((g) => g.trim()).filter(Boolean),
        releaseYear: Number(animeForm.releaseYear),
        language: animeForm.language as any,
        rating: Number(animeForm.rating),
        ageRating: animeForm.ageRating as any,
        status: animeForm.status as any,
        studio: animeForm.studio.trim(),
        featured: animeForm.featured,
        trending: animeForm.trending,
      };

      if (editingAnime) {
        await updateAnime(editingAnime.id, payload, adminToken);
        setStatusMessage({ type: 'success', text: `Updated "${payload.title}" successfully` });
      } else {
        await createAnime(payload, adminToken);
        setStatusMessage({ type: 'success', text: `Created "${payload.title}" successfully` });
      }

      await onRefreshAnimes();
      setShowAnimeModal(false);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save anime' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAnime = async (anime: Anime) => {
    if (!adminToken) return;
    if (!confirm(`Are you sure you want to permanently delete "${anime.title}" and all its episodes?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteAnime(anime.id, adminToken);
      setStatusMessage({ type: 'success', text: `Deleted "${anime.title}" completely` });
      if (selectedAnimeForEpisodes?.id === anime.id) {
        setSelectedAnimeForEpisodes(null);
      }
      await onRefreshAnimes();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete anime' });
    } finally {
      setActionLoading(false);
    }
  };

  // --- Episode Handlers ---

  const openAddEpisode = (anime: Anime) => {
    setEditingEpisode(null);
    setEpisodeForm({
      episodeNumber: anime.episodes.length + 1,
      title: `Episode ${anime.episodes.length + 1}`,
      thumbnailUrl: anime.bannerUrl || anime.posterUrl,
      duration: '24m',
      description: `Episode ${anime.episodes.length + 1} of ${anime.title}`,
    });
    setShowEpisodeModal(true);
  };

  const openEditEpisode = (ep: Episode) => {
    setEditingEpisode(ep);
    setEpisodeForm({
      episodeNumber: ep.episodeNumber,
      title: ep.title,
      thumbnailUrl: ep.thumbnailUrl,
      duration: ep.duration,
      description: ep.description,
    });
    setShowEpisodeModal(true);
  };

  const handleSaveEpisode = async () => {
    if (!adminToken || !selectedAnimeForEpisodes) return;
    setActionLoading(true);
    try {
      if (editingEpisode) {
        await updateEpisode(
          selectedAnimeForEpisodes.id,
          editingEpisode.id,
          {
            episodeNumber: Number(episodeForm.episodeNumber),
            title: episodeForm.title.trim(),
            thumbnailUrl: episodeForm.thumbnailUrl.trim(),
            duration: episodeForm.duration.trim(),
            description: episodeForm.description.trim(),
          },
          adminToken
        );
        setStatusMessage({ type: 'success', text: `Episode updated successfully` });
      } else {
        await addEpisode(
          selectedAnimeForEpisodes.id,
          {
            episodeNumber: Number(episodeForm.episodeNumber),
            title: episodeForm.title.trim(),
            thumbnailUrl: episodeForm.thumbnailUrl.trim(),
            duration: episodeForm.duration.trim(),
            description: episodeForm.description.trim(),
          },
          adminToken
        );
        setStatusMessage({ type: 'success', text: `New episode added successfully` });
      }

      await onRefreshAnimes();
      // update local reference
      const updated = animes.find((a) => a.id === selectedAnimeForEpisodes.id);
      if (updated) setSelectedAnimeForEpisodes(updated);
      setShowEpisodeModal(false);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save episode' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEpisode = async (epId: string) => {
    if (!adminToken || !selectedAnimeForEpisodes) return;
    if (!confirm('Are you sure you want to remove this episode?')) return;

    setActionLoading(true);
    try {
      await deleteEpisode(selectedAnimeForEpisodes.id, epId, adminToken);
      setStatusMessage({ type: 'success', text: 'Episode deleted successfully' });
      await onRefreshAnimes();
      const updated = animes.find((a) => a.id === selectedAnimeForEpisodes.id);
      if (updated) setSelectedAnimeForEpisodes(updated);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete episode' });
    } finally {
      setActionLoading(false);
    }
  };

  // --- Server Handlers ---

  const openAddServer = (ep: Episode) => {
    setActiveEpisodeForServers(ep);
    setEditingServer(null);
    setServerForm({
      name: `Server ${ep.servers.length + 1} (VidStream HD)`,
      type: 'mp4',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      quality: '1080p',
    });
    setShowServerModal(true);
  };

  const openEditServer = (ep: Episode, srv: StreamingServer) => {
    setActiveEpisodeForServers(ep);
    setEditingServer(srv);
    setServerForm({
      name: srv.name,
      type: srv.type,
      url: srv.url,
      quality: srv.quality,
    });
    setShowServerModal(true);
  };

  const handleSaveServer = async () => {
    if (!adminToken || !selectedAnimeForEpisodes || !activeEpisodeForServers) return;

    setActionLoading(true);
    try {
      let updatedServers = [...activeEpisodeForServers.servers];
      if (editingServer) {
        updatedServers = updatedServers.map((s) =>
          s.id === editingServer.id
            ? {
                ...s,
                name: serverForm.name.trim(),
                type: serverForm.type,
                url: serverForm.url.trim(),
                quality: serverForm.quality.trim(),
              }
            : s
        );
      } else {
        const newServer: StreamingServer = {
          id: `srv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: serverForm.name.trim(),
          type: serverForm.type,
          url: serverForm.url.trim(),
          quality: serverForm.quality.trim(),
        };
        updatedServers.push(newServer);
      }

      await updateEpisode(
        selectedAnimeForEpisodes.id,
        activeEpisodeForServers.id,
        { servers: updatedServers },
        adminToken
      );

      setStatusMessage({ type: 'success', text: 'Streaming servers updated successfully' });
      await onRefreshAnimes();
      const updated = animes.find((a) => a.id === selectedAnimeForEpisodes.id);
      if (updated) {
        setSelectedAnimeForEpisodes(updated);
        const epUpdated = updated.episodes.find((e) => e.id === activeEpisodeForServers.id);
        if (epUpdated) setActiveEpisodeForServers(epUpdated);
      }
      setShowServerModal(false);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update servers' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteServer = async (ep: Episode, serverId: string) => {
    if (!adminToken || !selectedAnimeForEpisodes) return;
    if (ep.servers.length <= 1) {
      setStatusMessage({ type: 'error', text: 'Episode must have at least one streaming server' });
      return;
    }
    if (!confirm('Remove this streaming server from the episode?')) return;

    setActionLoading(true);
    try {
      const updatedServers = ep.servers.filter((s) => s.id !== serverId);
      await updateEpisode(
        selectedAnimeForEpisodes.id,
        ep.id,
        { servers: updatedServers },
        adminToken
      );

      setStatusMessage({ type: 'success', text: 'Streaming server removed' });
      await onRefreshAnimes();
      const updated = animes.find((a) => a.id === selectedAnimeForEpisodes.id);
      if (updated) setSelectedAnimeForEpisodes(updated);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to remove server' });
    } finally {
      setActionLoading(false);
    }
  };

  // Filter animes in table
  const filteredAnimes = animes.filter(
    (a) =>
      a.title.toLowerCase().includes(adminSearch.toLowerCase()) ||
      a.studio.toLowerCase().includes(adminSearch.toLowerCase()) ||
      a.genres.some((g) => g.toLowerCase().includes(adminSearch.toLowerCase()))
  );

  // Total stats calculation
  const totalEpisodes = animes.reduce((acc, a) => acc + a.episodes.length, 0);
  const totalServers = animes.reduce(
    (acc, a) => acc + a.episodes.reduce((epAcc, ep) => epAcc + ep.servers.length, 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-6xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white font-['Outfit',sans-serif]">
                  HOTMP Content Admin Panel
                </h2>
                {adminToken && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    Authenticated
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Manage anime catalog, add/remove episodes, and modify streaming servers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {adminToken && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
              >
                Logout
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 border-b border-emerald-800/80 text-emerald-300'
                : 'bg-rose-950/80 border-b border-rose-800/80 text-rose-300'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* If NOT Authenticated: Show Login Screen */}
          {!adminToken ? (
            <div className="max-w-md mx-auto py-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700 text-rose-500 flex items-center justify-center mx-auto shadow-xl">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Admin Authentication Required</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Enter administrator passcode to access the anime database and server management.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3 text-left">
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Passcode</label>
                  <input
                    id="admin-passcode-input"
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter admin passcode (e.g. admin123)"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Demo Passcode: <span className="text-rose-400 font-mono font-bold">admin123</span> or <span className="text-rose-400 font-mono font-bold">hotmp-admin</span>
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 font-medium">
                    {loginError}
                  </div>
                )}

                <button
                  id="admin-login-submit-btn"
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? 'Verifying...' : 'Unlock Admin Panel'}
                </button>
              </form>
            </div>
          ) : (
            // Authenticated Admin Dashboard
            <div className="space-y-6">
              
              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600/15 text-rose-500 flex items-center justify-center font-bold">
                    <Tv className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400">Total Anime Titles</span>
                    <h3 className="text-xl font-bold text-white">{animes.length}</h3>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400">Total Episodes</span>
                    <h3 className="text-xl font-bold text-white">{totalEpisodes}</h3>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400">Active Streaming Servers</span>
                    <h3 className="text-xl font-bold text-white">{totalServers}</h3>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search titles or studios in admin library..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  id="admin-add-anime-btn"
                  onClick={openAddAnime}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Anime</span>
                </button>
              </div>

              {/* Anime Content Table */}
              <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950/60">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 uppercase tracking-wider font-semibold">
                        <th className="p-3 pl-4">Anime Info</th>
                        <th className="p-3">Studio & Year</th>
                        <th className="p-3">Rating & Status</th>
                        <th className="p-3">Episodes & Servers</th>
                        <th className="p-3 text-right pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {filteredAnimes.map((anime) => (
                        <tr key={anime.id} className="hover:bg-zinc-850/40 transition-colors">
                          <td className="p-3 pl-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={anime.posterUrl}
                                alt={anime.title}
                                className="w-10 h-14 rounded-lg object-cover shrink-0 bg-zinc-900"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0 max-w-xs">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-bold text-white truncate">{anime.title}</h4>
                                  {anime.featured && (
                                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold">
                                      Spotlight
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-zinc-400 truncate">
                                  {anime.genres.join(', ')}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-3 text-zinc-300">
                            <div>{anime.studio}</div>
                            <div className="text-[11px] text-zinc-500">{anime.releaseYear} • {anime.language}</div>
                          </td>

                          <td className="p-3">
                            <div className="flex items-center gap-1 font-bold text-amber-400">
                              ⭐ {anime.rating.toFixed(1)}
                            </div>
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-medium">
                              {anime.status}
                            </span>
                          </td>

                          <td className="p-3">
                            <button
                              id={`manage-episodes-btn-${anime.id}`}
                              onClick={() => setSelectedAnimeForEpisodes(anime)}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
                            >
                              <Film className="w-3.5 h-3.5 text-rose-500" />
                              <span>{anime.episodes.length} Episodes</span>
                            </button>
                          </td>

                          <td className="p-3 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                id={`edit-anime-btn-${anime.id}`}
                                onClick={() => openEditAnime(anime)}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                title="Edit Anime Info"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                id={`delete-anime-btn-${anime.id}`}
                                onClick={() => handleDeleteAnime(anime)}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950 text-zinc-300 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Delete Anime Completely"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sub-Section: Episodes & Streaming Servers Manager for Selected Anime */}
              {selectedAnimeForEpisodes && (
                <div className="p-5 rounded-3xl bg-zinc-950/90 border border-zinc-800 space-y-4 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                        Episode & Server Manager
                      </span>
                      <h3 className="text-lg font-bold text-white">
                        {selectedAnimeForEpisodes.title} ({selectedAnimeForEpisodes.episodes.length} Episodes)
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id="admin-add-episode-btn"
                        onClick={() => openAddEpisode(selectedAnimeForEpisodes)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Episode</span>
                      </button>

                      <button
                        onClick={() => setSelectedAnimeForEpisodes(null)}
                        className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs"
                      >
                        ✕ Close Episodes
                      </button>
                    </div>
                  </div>

                  {/* Episode List Cards */}
                  <div className="space-y-3">
                    {selectedAnimeForEpisodes.episodes.map((ep) => (
                      <div
                        key={ep.id}
                        className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-400 font-bold text-xs">
                              EP {ep.episodeNumber}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-white">{ep.title}</h4>
                              <p className="text-xs text-zinc-400">{ep.duration} • {ep.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openAddServer(ep)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3 text-rose-500" />
                              <span>Add Server</span>
                            </button>

                            <button
                              onClick={() => openEditEpisode(ep)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                              title="Edit Episode Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteEpisode(ep.id)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950 text-zinc-300 hover:text-rose-400 cursor-pointer"
                              title="Delete Episode"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Streaming Servers under this episode */}
                        <div className="pt-2 border-t border-zinc-800/80">
                          <div className="text-[11px] font-semibold text-zinc-400 mb-2 flex items-center gap-1">
                            <Server className="w-3 h-3 text-rose-500" />
                            <span>Configured Streaming Servers ({ep.servers.length}):</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {ep.servers.map((srv) => (
                              <div
                                key={srv.id}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs"
                              >
                                <div className="min-w-0 flex-1 mr-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white truncate">{srv.name}</span>
                                    <span className="px-1 py-0.2 rounded bg-zinc-800 text-[9px] text-zinc-400 uppercase">
                                      {srv.type}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                                    {srv.url}
                                  </p>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {/* Test Stream Button */}
                                  <button
                                    onClick={() => setTestStream(srv)}
                                    className="p-1 rounded bg-zinc-800 hover:bg-rose-600 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                    title="Test Stream Playback"
                                  >
                                    <Play className="w-3 h-3 fill-current" />
                                  </button>

                                  <button
                                    onClick={() => openEditServer(ep, srv)}
                                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                                    title="Edit Server URL/Quality"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>

                                  {ep.servers.length > 1 && (
                                    <button
                                      onClick={() => handleDeleteServer(ep, srv.id)}
                                      className="p-1 rounded bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 cursor-pointer"
                                      title="Remove Server"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal: Add / Edit Anime Form */}
        {showAnimeModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <div 
              className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <h3 className="text-base font-bold text-white">
                  {editingAnime ? `Edit Anime: ${editingAnime.title}` : 'Add New Anime to HOTMP'}
                </h3>
                <button onClick={() => setShowAnimeModal(false)} className="text-zinc-400 hover:text-white text-xs">
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Title</label>
                  <input
                    id="anime-form-title"
                    type="text"
                    value={animeForm.title}
                    onChange={(e) => setAnimeForm({ ...animeForm, title: e.target.value })}
                    placeholder="e.g. Solo Leveling"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Japanese Title</label>
                  <input
                    type="text"
                    value={animeForm.japaneseTitle}
                    onChange={(e) => setAnimeForm({ ...animeForm, japaneseTitle: e.target.value })}
                    placeholder="e.g. 俺だけレベルアップな件"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-zinc-400">Synopsis</label>
                  <textarea
                    rows={3}
                    value={animeForm.synopsis}
                    onChange={(e) => setAnimeForm({ ...animeForm, synopsis: e.target.value })}
                    placeholder="Enter full anime story synopsis..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Poster Image URL</label>
                  <input
                    type="text"
                    value={animeForm.posterUrl}
                    onChange={(e) => setAnimeForm({ ...animeForm, posterUrl: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Banner Backdrop URL</label>
                  <input
                    type="text"
                    value={animeForm.bannerUrl}
                    onChange={(e) => setAnimeForm({ ...animeForm, bannerUrl: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Genres (comma separated)</label>
                  <input
                    type="text"
                    value={animeForm.genres}
                    onChange={(e) => setAnimeForm({ ...animeForm, genres: e.target.value })}
                    placeholder="Action, Fantasy, Supernatural"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Studio</label>
                  <input
                    type="text"
                    value={animeForm.studio}
                    onChange={(e) => setAnimeForm({ ...animeForm, studio: e.target.value })}
                    placeholder="MAPPA, ufotable, A-1 Pictures"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Release Year</label>
                  <input
                    type="number"
                    value={animeForm.releaseYear}
                    onChange={(e) => setAnimeForm({ ...animeForm, releaseYear: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Language / Audio</label>
                  <select
                    value={animeForm.language}
                    onChange={(e) => setAnimeForm({ ...animeForm, language: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Sub & Dub">Sub & Dub</option>
                    <option value="Sub">Subtitled Only</option>
                    <option value="Dub">Dubbed Only</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Rating (1 - 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={animeForm.rating}
                    onChange={(e) => setAnimeForm({ ...animeForm, rating: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Status</label>
                  <select
                    value={animeForm.status}
                    onChange={(e) => setAnimeForm({ ...animeForm, status: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={animeForm.featured}
                      onChange={(e) => setAnimeForm({ ...animeForm, featured: e.target.checked })}
                      className="w-4 h-4 accent-rose-500 rounded"
                    />
                    <span className="font-bold text-white">Hero Spotlight Banner</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={animeForm.trending}
                      onChange={(e) => setAnimeForm({ ...animeForm, trending: e.target.checked })}
                      className="w-4 h-4 accent-rose-500 rounded"
                    />
                    <span className="font-bold text-white">Trending Row</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAnimeModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="save-anime-form-btn"
                  type="button"
                  disabled={actionLoading}
                  onClick={handleSaveAnime}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingAnime ? 'Update Anime' : 'Create Anime'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add / Edit Episode */}
        {showEpisodeModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div 
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <h3 className="text-sm font-bold text-white">
                  {editingEpisode ? `Edit Episode ${editingEpisode.episodeNumber}` : 'Add Episode'}
                </h3>
                <button onClick={() => setShowEpisodeModal(false)} className="text-zinc-400 hover:text-white text-xs">
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Episode Number</label>
                  <input
                    type="number"
                    value={episodeForm.episodeNumber}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, episodeNumber: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Title</label>
                  <input
                    type="text"
                    value={episodeForm.title}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value })}
                    placeholder="e.g. Ryomen Sukuna"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Thumbnail URL</label>
                  <input
                    type="text"
                    value={episodeForm.thumbnailUrl}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, thumbnailUrl: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Duration</label>
                  <input
                    type="text"
                    value={episodeForm.duration}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, duration: e.target.value })}
                    placeholder="24m"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Description</label>
                  <textarea
                    rows={2}
                    value={episodeForm.description}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, description: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowEpisodeModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="save-episode-btn"
                  type="button"
                  disabled={actionLoading}
                  onClick={handleSaveEpisode}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingEpisode ? 'Update Episode' : 'Add Episode'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add / Modify Streaming Server */}
        {showServerModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div 
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingServer ? `Modify Streaming Server` : 'Add Streaming Server'}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    For Episode {activeEpisodeForServers?.episodeNumber}
                  </p>
                </div>
                <button onClick={() => setShowServerModal(false)} className="text-zinc-400 hover:text-white text-xs">
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Server Name</label>
                  <input
                    id="server-name-input"
                    type="text"
                    value={serverForm.name}
                    onChange={(e) => setServerForm({ ...serverForm, name: e.target.value })}
                    placeholder="e.g. Server 1 (HOTMP Ultra CDN)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Stream Type</label>
                  <select
                    value={serverForm.type}
                    onChange={(e) => setServerForm({ ...serverForm, type: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="mp4">Direct MP4 / Stream Video URL</option>
                    <option value="embed">External Embed / Iframe Mirror URL</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Streaming URL</label>
                  <input
                    id="server-url-input"
                    type="text"
                    value={serverForm.url}
                    onChange={(e) => setServerForm({ ...serverForm, url: e.target.value })}
                    placeholder="https://.../video.mp4 or embed url"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Supports direct MP4s, CDN endpoints, and embed URLs (e.g. Youtube, MegaCloud).
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Quality Label</label>
                  <select
                    value={serverForm.quality}
                    onChange={(e) => setServerForm({ ...serverForm, quality: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="1080p">1080p Ultra HD</option>
                    <option value="720p">720p HD</option>
                    <option value="4K">4K UHD</option>
                    <option value="Auto">Auto Multi-Bitrate</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowServerModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="save-server-btn"
                  type="button"
                  disabled={actionLoading}
                  onClick={handleSaveServer}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingServer ? 'Update Server' : 'Add Server'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Test Stream Playback */}
        {testStream && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div 
              className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl space-y-3 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Stream Test Preview</h4>
                  <p className="text-xs text-zinc-400">{testStream.name} • {testStream.quality}</p>
                </div>
                <button onClick={() => setTestStream(null)} className="p-1 rounded-lg bg-zinc-800 text-zinc-300">
                  ✕
                </button>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                {testStream.type === 'embed' ? (
                  <iframe src={testStream.url} className="w-full h-full border-0" allowFullScreen />
                ) : (
                  <video
                    src={testStream.url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div className="text-[11px] font-mono text-zinc-500 truncate">
                Source: {testStream.url}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
