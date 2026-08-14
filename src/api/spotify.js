import { get, set } from 'idb-keyval';

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SEARCH_URL = 'https://api.spotify.com/v1/search';
const CACHE_PREFIX = 'spotify_cache_';

// دریافت توکن با مدیریت خطا
export async function getSpotifyToken() {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn('Spotify credentials missing. Using fallback covers.');
    return null;
  }

  try {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
    });
    if (!response.ok) throw new Error('Token fetch failed');
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Spotify token error:', error);
    return null;
  }
}

// جستجوی آهنگ با کش IndexedDB
export async function searchTrack(artist, title, token) {
  if (!token) return null;
  
  const cacheKey = `${CACHE_PREFIX}${artist}_${title}`.toLowerCase().replace(/\s/g, '');
  
  // 1. چک کردن کش
  try {
    const cached = await get(cacheKey);
    if (cached) return cached;
  } catch (e) { /* اگر IndexedDB در دسترس نبود، بیخیال */ }

  try {
    const query = encodeURIComponent(`artist:${artist} track:${title}`);
    const res = await fetch(`${SEARCH_URL}?q=${query}&type=track&limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    const track = data.tracks?.items?.[0] || null;
    
    if (track) {
      const result = {
        cover: track.album?.images?.[0]?.url || null,
        spotifyId: track.id,
        album: track.album?.name || null,
        releaseDate: track.album?.release_date || null,
        externalUrl: track.external_urls?.spotify || null,
      };
      // ذخیره در کش به مدت نامحدود (یا می‌توانید تاریخ انقضا بگذارید)
      try { await set(cacheKey, result); } catch (e) { /* ignore */ }
      return result;
    }
    return null;
  } catch (error) {
    console.warn(`Spotify search failed for ${artist} - ${title}:`, error);
    return null;
  }
}
