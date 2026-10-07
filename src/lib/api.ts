import { Anime, Episode, Profile, SearchFilters, WatchHistoryItem } from '../types';

export const API_BASE = '/api';

export async function getAnimeList(filters?: Partial<SearchFilters>): Promise<Anime[]> {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.query) params.append('query', filters.query);
    if (filters.genre && filters.genre !== 'All') params.append('genre', filters.genre);
    if (filters.year && filters.year !== 'All') params.append('year', filters.year);
    if (filters.language && filters.language !== 'All') params.append('language', filters.language);
    if (filters.minRating && filters.minRating !== '0') params.append('minRating', filters.minRating);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.sortBy) params.append('sort', filters.sortBy);
  }
  const res = await fetch(`${API_BASE}/anime?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch anime');
  return res.json();
}

export async function getAnimeById(id: string): Promise<Anime> {
  const res = await fetch(`${API_BASE}/anime/${id}`);
  if (!res.ok) throw new Error('Failed to fetch anime details');
  return res.json();
}

export async function createAnime(data: Partial<Anime>, adminToken: string): Promise<Anime> {
  const res = await fetch(`${API_BASE}/anime`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to create anime' }));
    throw new Error(err.error || 'Failed to create anime');
  }
  return res.json();
}

export async function updateAnime(id: string, data: Partial<Anime>, adminToken: string): Promise<Anime> {
  const res = await fetch(`${API_BASE}/anime/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update anime' }));
    throw new Error(err.error || 'Failed to update anime');
  }
  return res.json();
}

export async function deleteAnime(id: string, adminToken: string): Promise<void> {
  const res = await fetch(`${API_BASE}/anime/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to delete anime' }));
    throw new Error(err.error || 'Failed to delete anime');
  }
}

export async function addEpisode(animeId: string, epData: Partial<Episode>, adminToken: string): Promise<Episode> {
  const res = await fetch(`${API_BASE}/anime/${animeId}/episodes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(epData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to add episode' }));
    throw new Error(err.error || 'Failed to add episode');
  }
  return res.json();
}

export async function updateEpisode(animeId: string, episodeId: string, epData: Partial<Episode>, adminToken: string): Promise<Episode> {
  const res = await fetch(`${API_BASE}/anime/${animeId}/episodes/${episodeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(epData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update episode' }));
    throw new Error(err.error || 'Failed to update episode');
  }
  return res.json();
}

export async function deleteEpisode(animeId: string, episodeId: string, adminToken: string): Promise<void> {
  const res = await fetch(`${API_BASE}/anime/${animeId}/episodes/${episodeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to delete episode' }));
    throw new Error(err.error || 'Failed to delete episode');
  }
}

export async function getProfiles(): Promise<Profile[]> {
  const res = await fetch(`${API_BASE}/profiles`);
  if (!res.ok) throw new Error('Failed to fetch profiles');
  return res.json();
}

export async function createProfile(data: { name: string; avatar?: string; isKids?: boolean; autoPlay?: boolean }): Promise<Profile> {
  const res = await fetch(`${API_BASE}/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create profile');
  return res.json();
}

export async function updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
  const res = await fetch(`${API_BASE}/profiles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function deleteProfile(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/profiles/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to delete profile' }));
    throw new Error(err.error || 'Failed to delete profile');
  }
}

export async function getWatchHistory(profileId: string): Promise<WatchHistoryItem[]> {
  const res = await fetch(`${API_BASE}/profiles/${profileId}/history`);
  if (!res.ok) throw new Error('Failed to fetch watch history');
  return res.json();
}

export async function saveWatchProgress(profileId: string, data: Partial<WatchHistoryItem>): Promise<WatchHistoryItem> {
  const res = await fetch(`${API_BASE}/profiles/${profileId}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to save watch progress');
  return res.json();
}

export async function deleteWatchHistoryItem(profileId: string, animeId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/profiles/${profileId}/history/${animeId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete history item');
}

export async function getBookmarks(profileId: string): Promise<Anime[]> {
  const res = await fetch(`${API_BASE}/profiles/${profileId}/bookmarks`);
  if (!res.ok) throw new Error('Failed to fetch bookmarks');
  return res.json();
}

export async function toggleBookmark(profileId: string, animeId: string): Promise<{ isBookmarked: boolean }> {
  const res = await fetch(`${API_BASE}/profiles/${profileId}/bookmarks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ animeId })
  });
  if (!res.ok) throw new Error('Failed to toggle bookmark');
  return res.json();
}

export async function adminLogin(passcode: string): Promise<{ success: boolean; token?: string; message?: string }> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode })
  });
  return res.json();
}
