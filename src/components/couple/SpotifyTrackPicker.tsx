"use client";

import { useState, useEffect } from 'react';
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
    if (debouncedSearch?.trim()) {
      search(debouncedSearch.trim());
    } else if (searchQuery === '') {
      clearResults();
    }
  }, [debouncedSearch, search, clearResults, searchQuery]);

  const handleTrackSelect = (spotifyTrack: SpotifyTrack) => {
    try {
      const song: Song = {
        id: spotifyTrack.id,
        title: spotifyTrack.name,
        artist: spotifyTrack.artists.map(a => a.name).join(', '),
        spotifyTrackId: spotifyTrack.id,
        albumCoverUrl: spotifyTrack.album.images[0]?.url || undefined,
        addedBy: '', // Will be set in the parent component
        addedAt: new Date().toISOString(),
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
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="spotify-search" className="text-fuchsia-700 font-semibold flex items-center gap-2 text-base">
          <Music className="h-5 w-5" />
          Buscar Música no Spotify
        </Label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            id="spotify-search"
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);
            }}
            className="pl-12 pr-12 py-3 text-base border-fuchsia-200 focus:border-fuchsia-400 focus:ring-fuchsia-400"
            disabled={isMaxTracksReached}
            autoComplete="off"
          />
          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-fuchsia-500" />
          )}
        </div>
        {isMaxTracksReached && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <p className="font-medium">Limite atingido</p>
              <p className="text-sm">Máximo de {maxTracks} músicas atingido. Remova uma música para adicionar outra.</p>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {searchError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-3">
              <div>
                <p className="font-semibold">Erro na busca do Spotify</p>
                <p className="text-sm mt-1">{searchError}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => search(searchQuery)}
                className="text-red-700 border-red-300 hover:bg-red-100"
                disabled={!searchQuery.trim()}
              >
                <Search className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {searchResults.length > 0 && (
        <Card className="border-fuchsia-200/50 bg-white/90 shadow-lg">
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] sm:h-[450px]">
              <div className="space-y-3 p-4">
                {searchResults.map((track) => (
                  <div
                    key={track.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl border border-fuchsia-100 hover:bg-fuchsia-50/80 transition-all duration-200 hover:shadow-md"
                  >
                    {/* Album Cover */}
                    <div className="relative w-16 h-16 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
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

                    {/* Track Information */}
                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <h4 className="font-semibold text-gray-900 text-base mb-1 leading-tight">
                        {track.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1 leading-tight">
                        {track.artists.map(a => a.name).join(', ')}
                      </p>
                      <p className="text-xs text-gray-500 leading-tight">
                        {track.album.name}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:flex-shrink-0">
                      {track.preview_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const audio = new Audio(track.preview_url!);
                            audio.play();
                          }}
                          className="h-9 w-9 p-0 hover:bg-fuchsia-100"
                          title="Prévia"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(track.external_urls.spotify, '_blank')}
                        className="h-9 w-9 p-0 hover:bg-fuchsia-100"
                        title="Abrir no Spotify"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleTrackSelect(track)}
                        disabled={isTrackSelected(track.id) || isMaxTracksReached}
                        className={`px-4 py-2 font-medium transition-all duration-200 ${
                          isTrackSelected(track.id) 
                            ? "bg-green-500 hover:bg-green-600 text-white" 
                            : "bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white"
                        }`}
                      >
                        {isTrackSelected(track.id) ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Adicionada</span>
                            <span className="sm:hidden">✓</span>
                          </>
                        ) : (
                          <>
                            <span className="hidden sm:inline">Adicionar</span>
                            <span className="sm:hidden">+</span>
                          </>
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
        <Card className="border-fuchsia-200/50 bg-gradient-to-r from-fuchsia-50 to-pink-50 shadow-sm">
          <CardContent className="p-4">
            <Label className="text-fuchsia-700 font-semibold flex items-center gap-2 mb-3">
              <Music className="h-4 w-4" />
              Músicas Selecionadas ({selectedTracks.length}/{maxTracks})
            </Label>
            <div className="space-y-2">
              {selectedTracks.map((track) => (
                <div 
                  key={track.id} 
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-fuchsia-200/50 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    {track.albumCoverUrl ? (
                      <Image
                        src={track.albumCoverUrl}
                        alt={track.title}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm leading-tight">
                      {track.title}
                    </p>
                    <p className="text-xs text-gray-600 leading-tight">
                      {track.artist}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge variant="secondary" className="bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200">
                      <Check className="h-3 w-3 mr-1" />
                      Adicionada
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
