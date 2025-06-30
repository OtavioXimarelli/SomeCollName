import { useState } from 'react';

const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

// Spotify Web API types
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; width: number; height: number }>;
  };
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
  };
}

// Get Spotify access token using client credentials flow
export const getSpotifyAccessToken = async (): Promise<string> => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify access token');
  }

  const data = await response.json();
  return data.access_token;
};

// Search for tracks on Spotify
export const searchSpotifyTracks = async (query: string, limit: number = 20): Promise<SpotifyTrack[]> => {
  if (!query.trim()) return [];

  try {
    const token = await getSpotifyAccessToken();
    
    const searchParams = new URLSearchParams({
      q: query,
      type: 'track',
      limit: limit.toString(),
    });

    const response = await fetch(`https://api.spotify.com/v1/search?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search Spotify tracks');
    }

    const data: SpotifySearchResponse = await response.json();
    return data.tracks.items;
  } catch (error) {
    console.error('Spotify search error:', error);
    return [];
  }
};

// Get track details by ID
export const getSpotifyTrack = async (trackId: string): Promise<SpotifyTrack | null> => {
  try {
    const token = await getSpotifyAccessToken();
    
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Spotify track:', error);
    return null;
  }
};

// Extract Spotify track ID from various URL formats
export const extractSpotifyTrackId = (input: string): string | null => {
  // Spotify URI: spotify:track:4iV5W9uYEdYUVa79Axb7Rh
  if (input.startsWith('spotify:track:')) {
    return input.split(':')[2];
  }

  // Spotify URL: https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh
  const urlMatch = input.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
  if (urlMatch) {
    return urlMatch[1];
  }

  // Direct track ID
  if (/^[a-zA-Z0-9]{22}$/.test(input)) {
    return input;
  }

  return null;
};

// Hook for Spotify search functionality
export const useSpotifySearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await searchSpotifyTracks(query);
      setSearchResults(results);
    } catch (error) {
      setSearchError('Erro ao buscar músicas. Tente novamente.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearResults = () => {
    setSearchResults([]);
    setSearchError(null);
  };

  return {
    search,
    clearResults,
    searchResults,
    isSearching,
    searchError,
  };
};
