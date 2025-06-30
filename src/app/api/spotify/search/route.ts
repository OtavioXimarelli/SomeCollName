import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

interface SpotifyTrack {
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

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
  };
}

// Cache for access token
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getSpotifyAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify credentials not configured');
  }

  try {
    const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get Spotify access token: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // Cache the token (expires in 1 hour, we'll refresh 5 minutes early)
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 300) * 1000,
    };

    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = searchParams.get('limit') || '20';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const token = await getSpotifyAccessToken();
    
    const spotifySearchParams = new URLSearchParams({
      q: query,
      type: 'track',
      limit: limit,
      market: 'US', // Add market for better results
    });

    const response = await fetch(`https://api.spotify.com/v1/search?${spotifySearchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Spotify API error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to search Spotify' }, { status: response.status });
    }

    const data: SpotifySearchResponse = await response.json();
    
    return NextResponse.json({
      tracks: data.tracks.items,
      total: data.tracks.total,
    });

  } catch (error) {
    console.error('Spotify search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
