import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { Anime, Episode, Profile, WatchHistoryItem } from './src/types';
import { INITIAL_ANIMES, INITIAL_PROFILES } from './server/initialData';

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent store setup
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'hotmp_db.json');

interface DatabaseStore {
  animes: Anime[];
  profiles: Profile[];
  watchHistory: Record<string, WatchHistoryItem[]>; // keyed by profileId
  bookmarks: Record<string, string[]>; // keyed by profileId: animeId[]
}

let db: DatabaseStore = {
  animes: [...INITIAL_ANIMES],
  profiles: [...INITIAL_PROFILES],
  watchHistory: {
    'prof-1': [
      {
        id: 'hist-1',
        profileId: 'prof-1',
        animeId: 'anime-solo-leveling',
        episodeId: 'sl-ep-1',
        episodeNumber: 1,
        progressSeconds: 680,
        durationSeconds: 1440,
        progressPercentage: 47,
        lastWatchedAt: new Date(Date.now() - 3600000).toISOString(),
        animeTitle: 'Solo Leveling',
        animePoster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
        episodeTitle: "I'm Used to It"
      }
    ]
  },
  bookmarks: {
    'prof-1': ['anime-solo-leveling', 'anime-jujutsu-kaisen']
  }
};

function loadStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      db = JSON.parse(data);
      if (Array.isArray(db.profiles)) {
        db.profiles = db.profiles.map(p => ({
          ...p,
          autoPlay: p.autoPlay !== undefined ? p.autoPlay : true
        }));
      }
      console.log('Database loaded successfully from file.');
    } else {
      saveStore();
    }
  } catch (err) {
    console.error('Error loading database file, using in-memory defaults:', err);
  }
}

function saveStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to file:', err);
  }
}

loadStore();

// Admin Authentication Middleware
const ADMIN_SECRET_TOKEN = 'hotmp-admin-secret-token-7788';
const ADMIN_PASSCODES = ['admin123', 'hotmp-admin', 'hotmp2025'];

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }
  const token = authHeader.split(' ')[1];
  if (token !== ADMIN_SECRET_TOKEN) {
    return res.status(403).json({ error: 'Forbidden: Invalid admin credentials' });
  }
  next();
}

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'HOTMP Anime Streaming API' });
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { passcode } = req.body;
  if (ADMIN_PASSCODES.includes(passcode?.trim())) {
    return res.json({
      success: true,
      token: ADMIN_SECRET_TOKEN,
      message: 'Admin authenticated successfully'
    });
  }
  return res.status(401).json({ success: false, message: 'Invalid admin passcode. Try: admin123' });
});

// --- Anime endpoints ---

// Get all anime with filtering & sorting
app.get('/api/anime', (req, res) => {
  const { query, genre, year, language, minRating, status, sort } = req.query;

  let results = [...db.animes];

  if (query && typeof query === 'string') {
    const q = query.toLowerCase().trim();
    results = results.filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.japaneseTitle && a.japaneseTitle.toLowerCase().includes(q)) ||
      a.genres.some(g => g.toLowerCase().includes(q)) ||
      a.studio.toLowerCase().includes(q) ||
      a.synopsis.toLowerCase().includes(q)
    );
  }

  if (genre && typeof genre === 'string' && genre !== 'All') {
    results = results.filter(a =>
      a.genres.map(g => g.toLowerCase()).includes(genre.toLowerCase())
    );
  }

  if (year && typeof year === 'string' && year !== 'All') {
    results = results.filter(a => a.releaseYear.toString() === year);
  }

  if (language && typeof language === 'string' && language !== 'All') {
    results = results.filter(a =>
      a.language.toLowerCase().includes(language.toLowerCase()) ||
      (language === 'Sub' && a.language.includes('Sub')) ||
      (language === 'Dub' && a.language.includes('Dub'))
    );
  }

  if (minRating && typeof minRating === 'string' && minRating !== '0') {
    const ratingNum = parseFloat(minRating);
    if (!isNaN(ratingNum)) {
      results = results.filter(a => a.rating >= ratingNum);
    }
  }

  if (status && typeof status === 'string' && status !== 'All') {
    results = results.filter(a => a.status.toLowerCase() === status.toLowerCase());
  }

  // Sorting
  if (sort === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    results.sort((a, b) => b.releaseYear - a.releaseYear);
  } else if (sort === 'title') {
    results.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    // Trending default: featured & trending first, then rating
    results.sort((a, b) => {
      if (a.trending && !b.trending) return -1;
      if (!a.trending && b.trending) return 1;
      return b.rating - a.rating;
    });
  }

  res.json(results);
});

// Get single anime by ID
app.get('/api/anime/:id', (req, res) => {
  const anime = db.animes.find(a => a.id === req.params.id);
  if (!anime) {
    return res.status(404).json({ error: 'Anime not found' });
  }
  res.json(anime);
});

// Admin: Add new anime
app.post('/api/anime', requireAdmin, (req, res) => {
  const newAnimeData = req.body;
  if (!newAnimeData.title) {
    return res.status(400).json({ error: 'Anime title is required' });
  }

  const newAnime: Anime = {
    id: newAnimeData.id || `anime-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: newAnimeData.title,
    japaneseTitle: newAnimeData.japaneseTitle || '',
    synopsis: newAnimeData.synopsis || '',
    posterUrl: newAnimeData.posterUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    bannerUrl: newAnimeData.bannerUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600&auto=format&fit=crop&q=80',
    genres: Array.isArray(newAnimeData.genres) ? newAnimeData.genres : (newAnimeData.genres ? [newAnimeData.genres] : ['Action']),
    releaseYear: Number(newAnimeData.releaseYear) || new Date().getFullYear(),
    language: newAnimeData.language || 'Sub & Dub',
    rating: Number(newAnimeData.rating) || 8.0,
    ageRating: newAnimeData.ageRating || 'TV-14',
    status: newAnimeData.status || 'Ongoing',
    studio: newAnimeData.studio || 'Animation Studio',
    featured: Boolean(newAnimeData.featured),
    trending: Boolean(newAnimeData.trending),
    episodes: Array.isArray(newAnimeData.episodes) ? newAnimeData.episodes : []
  };

  db.animes.unshift(newAnime);
  saveStore();
  res.status(201).json(newAnime);
});

// Admin: Update anime
app.put('/api/anime/:id', requireAdmin, (req, res) => {
  const index = db.animes.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Anime not found' });
  }

  const current = db.animes[index];
  const updated: Anime = {
    ...current,
    ...req.body,
    id: current.id, // cannot change id
    episodes: req.body.episodes || current.episodes
  };

  db.animes[index] = updated;
  saveStore();
  res.json(updated);
});

// Admin: Delete anime completely
app.delete('/api/anime/:id', requireAdmin, (req, res) => {
  const animeId = req.params.id;
  const initialLength = db.animes.length;
  db.animes = db.animes.filter(a => a.id !== animeId);

  if (db.animes.length === initialLength) {
    return res.status(404).json({ error: 'Anime not found' });
  }

  // Also clean up watch history & bookmarks for this anime across all profiles
  for (const profId in db.watchHistory) {
    db.watchHistory[profId] = db.watchHistory[profId].filter(h => h.animeId !== animeId);
  }
  for (const profId in db.bookmarks) {
    db.bookmarks[profId] = db.bookmarks[profId].filter(id => id !== animeId);
  }

  saveStore();
  res.json({ success: true, message: `Anime ${animeId} deleted successfully` });
});

// --- Episode Management Endpoints ---

// Admin: Add episode to an anime
app.post('/api/anime/:id/episodes', requireAdmin, (req, res) => {
  const anime = db.animes.find(a => a.id === req.params.id);
  if (!anime) {
    return res.status(404).json({ error: 'Anime not found' });
  }

  const { episodeNumber, title, thumbnailUrl, duration, description, servers } = req.body;
  const nextNumber = episodeNumber ? Number(episodeNumber) : (anime.episodes.length + 1);

  const newEpisode: Episode = {
    id: `ep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    episodeNumber: nextNumber,
    title: title || `Episode ${nextNumber}`,
    thumbnailUrl: thumbnailUrl || anime.bannerUrl || anime.posterUrl,
    duration: duration || '24m',
    description: description || `Episode ${nextNumber} of ${anime.title}`,
    servers: Array.isArray(servers) && servers.length > 0 ? servers : [
      {
        id: `srv-${Date.now()}`,
        name: 'Server 1 (HOTMP Ultra CDN)',
        type: 'mp4',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        quality: '1080p'
      }
    ]
  };

  anime.episodes.push(newEpisode);
  saveStore();
  res.status(201).json(newEpisode);
});

// Admin: Update episode (including servers)
app.put('/api/anime/:id/episodes/:episodeId', requireAdmin, (req, res) => {
  const anime = db.animes.find(a => a.id === req.params.id);
  if (!anime) {
    return res.status(404).json({ error: 'Anime not found' });
  }

  const epIndex = anime.episodes.findIndex(e => e.id === req.params.episodeId);
  if (epIndex === -1) {
    return res.status(404).json({ error: 'Episode not found' });
  }

  const currentEp = anime.episodes[epIndex];
  const updatedEp: Episode = {
    ...currentEp,
    ...req.body,
    id: currentEp.id,
    episodeNumber: req.body.episodeNumber !== undefined ? Number(req.body.episodeNumber) : currentEp.episodeNumber
  };

  anime.episodes[epIndex] = updatedEp;
  saveStore();
  res.json(updatedEp);
});

// Admin: Delete episode
app.delete('/api/anime/:id/episodes/:episodeId', requireAdmin, (req, res) => {
  const anime = db.animes.find(a => a.id === req.params.id);
  if (!anime) {
    return res.status(404).json({ error: 'Anime not found' });
  }

  const epId = req.params.episodeId;
  const initialLength = anime.episodes.length;
  anime.episodes = anime.episodes.filter(e => e.id !== epId);

  if (anime.episodes.length === initialLength) {
    return res.status(404).json({ error: 'Episode not found' });
  }

  saveStore();
  res.json({ success: true, message: `Episode ${epId} deleted successfully` });
});

// --- Profile Endpoints ---

// Get all profiles
app.get('/api/profiles', (req, res) => {
  res.json(db.profiles);
});

// Create new profile
app.post('/api/profiles', (req, res) => {
  const { name, avatar, isKids, autoPlay } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Profile name is required' });
  }

  const newProfile: Profile = {
    id: `prof-${Date.now()}`,
    name: name.trim(),
    avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isKids: Boolean(isKids),
    autoPlay: autoPlay !== undefined ? Boolean(autoPlay) : true,
    createdAt: new Date().toISOString()
  };

  db.profiles.push(newProfile);
  db.watchHistory[newProfile.id] = [];
  db.bookmarks[newProfile.id] = [];
  saveStore();
  res.status(201).json(newProfile);
});

// Update profile
app.put('/api/profiles/:id', (req, res) => {
  const index = db.profiles.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const current = db.profiles[index];
  const updated: Profile = {
    ...current,
    ...req.body,
    id: current.id,
    autoPlay: req.body.autoPlay !== undefined ? Boolean(req.body.autoPlay) : (current.autoPlay ?? true)
  };

  db.profiles[index] = updated;
  saveStore();
  res.json(updated);
});

// Delete profile
app.delete('/api/profiles/:id', (req, res) => {
  const profId = req.params.id;
  if (db.profiles.length <= 1) {
    return res.status(400).json({ error: 'Cannot delete the only remaining profile' });
  }

  db.profiles = db.profiles.filter(p => p.id !== profId);
  delete db.watchHistory[profId];
  delete db.bookmarks[profId];
  saveStore();
  res.json({ success: true, message: 'Profile deleted' });
});

// --- Watch History & Continue Watching Endpoints ---

// Get watch history for profile
app.get('/api/profiles/:id/history', (req, res) => {
  const history = db.watchHistory[req.params.id] || [];
  // Sort by most recently watched
  history.sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime());
  res.json(history);
});

// Record or update watch progress
app.post('/api/profiles/:id/history', (req, res) => {
  const profileId = req.params.id;
  const {
    animeId,
    episodeId,
    episodeNumber,
    progressSeconds,
    durationSeconds,
    animeTitle,
    animePoster,
    episodeTitle
  } = req.body;

  if (!animeId || !episodeId) {
    return res.status(400).json({ error: 'animeId and episodeId are required' });
  }

  if (!db.watchHistory[profileId]) {
    db.watchHistory[profileId] = [];
  }

  const progress = Number(progressSeconds) || 0;
  const duration = Number(durationSeconds) || 1440;
  const percentage = duration > 0 ? Math.min(100, Math.round((progress / duration) * 100)) : 0;

  const existingIndex = db.watchHistory[profileId].findIndex(h => h.animeId === animeId);

  const historyItem: WatchHistoryItem = {
    id: existingIndex >= 0 ? db.watchHistory[profileId][existingIndex].id : `hist-${Date.now()}`,
    profileId,
    animeId,
    episodeId,
    episodeNumber: Number(episodeNumber) || 1,
    progressSeconds: progress,
    durationSeconds: duration,
    progressPercentage: percentage,
    lastWatchedAt: new Date().toISOString(),
    animeTitle,
    animePoster,
    episodeTitle
  };

  if (existingIndex >= 0) {
    db.watchHistory[profileId][existingIndex] = historyItem;
  } else {
    db.watchHistory[profileId].unshift(historyItem);
  }

  saveStore();
  res.json(historyItem);
});

// Delete an item from history
app.delete('/api/profiles/:id/history/:animeId', (req, res) => {
  const profileId = req.params.id;
  const animeId = req.params.animeId;
  if (db.watchHistory[profileId]) {
    db.watchHistory[profileId] = db.watchHistory[profileId].filter(h => h.animeId !== animeId);
    saveStore();
  }
  res.json({ success: true });
});

// --- Bookmarks / My List Endpoints ---

// Get bookmarks for profile
app.get('/api/profiles/:id/bookmarks', (req, res) => {
  const bookmarkedIds = db.bookmarks[req.params.id] || [];
  // Return the full anime objects for bookmarked items
  const bookmarkedAnime = db.animes.filter(a => bookmarkedIds.includes(a.id));
  res.json(bookmarkedAnime);
});

// Toggle bookmark (add or remove)
app.post('/api/profiles/:id/bookmarks', (req, res) => {
  const profileId = req.params.id;
  const { animeId } = req.body;

  if (!animeId) {
    return res.status(400).json({ error: 'animeId is required' });
  }

  if (!db.bookmarks[profileId]) {
    db.bookmarks[profileId] = [];
  }

  const index = db.bookmarks[profileId].indexOf(animeId);
  let isBookmarked = false;

  if (index >= 0) {
    // Remove
    db.bookmarks[profileId].splice(index, 1);
    isBookmarked = false;
  } else {
    // Add
    db.bookmarks[profileId].push(animeId);
    isBookmarked = true;
  }

  saveStore();
  res.json({ success: true, animeId, isBookmarked });
});

// Delete bookmark specifically
app.delete('/api/profiles/:id/bookmarks/:animeId', (req, res) => {
  const profileId = req.params.id;
  const animeId = req.params.animeId;

  if (db.bookmarks[profileId]) {
    db.bookmarks[profileId] = db.bookmarks[profileId].filter(id => id !== animeId);
    saveStore();
  }
  res.json({ success: true });
});

// ---------------- SERVER & VITE INTEGRATION ----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HOTMP Anime Streaming Platform server listening on port ${PORT}`);
  });
}

startServer();
