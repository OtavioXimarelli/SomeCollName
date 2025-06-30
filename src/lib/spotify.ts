import { useState } from 'react';

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
  tracks: SpotifyTrack[];
  total: number;
}

// Search for tracks using our API route
export const searchSpotifyTracks = async (query: string, limit: number = 20): Promise<SpotifyTrack[]> => {
  if (!query.trim()) return [];

  try {
    const searchParams = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });

    const response = await fetch(`/api/spotify/search?${searchParams}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to search Spotify tracks');
    }

    const data: SpotifySearchResponse = await response.json();
    return data.tracks;
  } catch (error) {
    console.error('Spotify search error:', error);
    throw error; // Re-throw to handle in the hook
  }
};

// Get track details by ID using our API route
export const getSpotifyTrack = async (trackId: string): Promise<SpotifyTrack | null> => {
  try {
    const response = await fetch(`/api/spotify/track/${trackId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch Spotify track');
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
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await searchSpotifyTracks(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Erro ao buscar músicas. Tente novamente.');
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
