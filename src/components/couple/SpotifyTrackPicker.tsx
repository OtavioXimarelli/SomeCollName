"use client";

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Music, Play, Check, Loader2, ExternalLink, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { useSpotifySearch, type SpotifyTrack } from '@/lib/spotify';
import type { Song } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SpotifyTrackPickerProps {
  onTrackSelect: (track: Song) => void;
  selectedTracks?: Song[];
  maxTracks?: number;
  placeholder?: string;
}

export default function SpotifyTrackPicker({ 
  onTrackSelect, 
  selectedTracks = [], 
  maxTracks = 10,
  placeholder = "Buscar música no Spotify..."
}: SpotifyTrackPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { search, searchResults, isSearching, searchError, clearResults } = useSpotifySearch();

  useEffect(() => {
    if (debouncedSearch) {
      search(debouncedSearch);
    } else {
      clearResults();
    }
  }, [debouncedSearch, search, clearResults]);

  const handleTrackSelect = (spotifyTrack: SpotifyTrack) => {
    try {
      const song: Song = {
        id: spotifyTrack.id,
        title: spotifyTrack.name,
        artist: spotifyTrack.artists.map(a => a.name).join(', '),
        spotifyTrackId: spotifyTrack.id,
        albumCoverUrl: spotifyTrack.album.images[0]?.url || undefined,
      };

      onTrackSelect(song);
      setSearchQuery(''); // Clear search after selection
      clearResults();
    } catch (error) {
      console.error('Error selecting track:', error);
    }
  };

  const isTrackSelected = (trackId: string) => {
    return selectedTracks.some((track: Song) => track.spotifyTrackId === trackId);
  };

  const isMaxTracksReached = selectedTracks.length >= maxTracks;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="spotify-search" className="text-fuchsia-700 font-semibold flex items-center gap-2">
          <Music className="h-4 w-4" />
          Buscar Música no Spotify
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="spotify-search"
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            disabled={isMaxTracksReached}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-fuchsia-500" />
          )}
        </div>
        {isMaxTracksReached && (
          <p className="text-sm text-amber-600">
            Máximo de {maxTracks} músicas atingido. Remova uma música para adicionar outra.
          </p>
        )}
      </div>

      {searchError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-2">
              <p className="font-semibold">Erro na busca do Spotify</p>
              <p className="text-sm">{searchError}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => search(searchQuery)}
                className="text-red-700 border-red-300 hover:bg-red-100"
                disabled={!searchQuery.trim()}
              >
                <Search className="h-3 w-3 mr-1" />
                Tentar Novamente
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {searchResults.length > 0 && (
        <Card className="border-fuchsia-200">
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              <div className="space-y-2 p-4">
                {searchResults.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-fuchsia-50 transition-colors"
                  >
                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      {track.album.images[0] ? (
                        <Image
                          src={track.album.images[0].url}
                          alt={track.album.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-grow min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{track.name}</h4>
                      <p className="text-sm text-gray-600 truncate">
                        {track.artists.map(a => a.name).join(', ')}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{track.album.name}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {track.preview_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const audio = new Audio(track.preview_url!);
                            audio.play();
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(track.external_urls.spotify, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleTrackSelect(track)}
                        disabled={isTrackSelected(track.id) || isMaxTracksReached}
                        className={isTrackSelected(track.id) ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {isTrackSelected(track.id) ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Adicionada
                          </>
                        ) : (
                          'Adicionar'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Selected tracks preview */}
      {selectedTracks.length > 0 && (
        <div className="space-y-2">
          <Label className="text-fuchsia-700 font-semibold">
            Músicas Selecionadas ({selectedTracks.length}/{maxTracks})
          </Label>
          <div className="flex flex-wrap gap-2">
            {selectedTracks.map((track) => (
              <Badge key={track.id} variant="secondary" className="text-xs">
                {track.title} - {track.artist}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
