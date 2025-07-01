"use client";

import type { Song } from '@/types';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListMusic, Music2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

interface MusicPlayerProps {
  playlist: Song[];
  autoplay?: boolean;
}

export default function MusicPlayer({ playlist, autoplay: _autoplay = false }: MusicPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaylistVisible, setIsPlaylistVisible] = useState(true);

  useEffect(() => {
    // Reset to the first track if the playlist changes
    setCurrentTrackIndex(0);
  }, [playlist]);

  if (!playlist || playlist.length === 0) {
    return (
      <Card className="w-full bg-white/90 backdrop-blur-sm border-2 border-fuchsia-200/50 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center text-fuchsia-700 font-headline text-lg">
            <Music2 className="mr-3 h-6 w-6" />
            Playlist Vazia
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-fuchsia-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Music2 className="h-8 w-8 text-fuchsia-400" />
            </div>
            <p className="text-gray-600 mb-2">Nenhuma música adicionada ainda</p>
            <p className="text-sm text-gray-500">Personalize seu espaço adicionando suas músicas favoritas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTrack = playlist[currentTrackIndex];
  const spotifyEmbedUrl = `https://open.spotify.com/embed/track/${currentTrack.spotifyTrackId}?utm_source=generator&theme=0`;

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm border-2 border-fuchsia-200/50 shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
          {currentTrack.albumCoverUrl ? (
            <div className="flex-shrink-0">
              <Image 
                src={currentTrack.albumCoverUrl} 
                alt={`Capa do álbum de ${currentTrack.title}`} 
                width={56} 
                height={56} 
                className="rounded-md shadow-sm" 
              />
            </div>
          ) : (
            <div className="w-14 h-14 bg-fuchsia-100 rounded-md flex items-center justify-center flex-shrink-0">
              <Music2 className="h-8 w-8 text-fuchsia-400" />
            </div>
          )}
          <div className="flex flex-col overflow-hidden min-w-0">
            <p className="font-headline text-lg text-fuchsia-800 truncate">{currentTrack.title}</p>
            <p className="text-sm text-rose-600 truncate">{currentTrack.artist}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsPlaylistVisible(!isPlaylistVisible)} 
          className="text-fuchsia-600 hover:text-fuchsia-800 p-2 flex-shrink-0 ml-2"
          aria-label={isPlaylistVisible ? "Hide playlist" : "Show playlist"}
          title={isPlaylistVisible ? "Hide playlist" : "Show playlist"}
        >
          <ListMusic className="h-6 w-6" />
        </button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="w-full">
          <iframe
            title={`Spotify Player: ${currentTrack.title} by ${currentTrack.artist}`}
            key={currentTrack.id}
            className="w-full"
            src={spotifyEmbedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allowFullScreen={false}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        </div>

        {isPlaylistVisible && playlist.length > 1 && (
          <div className="p-4 sm:p-6 border-t border-fuchsia-200/30">
            <h3 className="text-fuchsia-700 font-semibold mb-3 flex items-center gap-2">
              <ListMusic className="h-4 w-4" />
              Próximas ({playlist.length - 1})
            </h3>
            <ScrollArea className="h-[200px]">
              <ul className="space-y-2">
                {playlist.map((song, index) => {
                  if (index === currentTrackIndex) return null;
                  
                  return (
                    <li
                      key={song.id}
                      onClick={() => setCurrentTrackIndex(index)}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-fuchsia-50/80 active:scale-95"
                    >
                      {song.albumCoverUrl ? (
                        <Image 
                          src={song.albumCoverUrl} 
                          alt={`Capa de ${song.title}`} 
                          width={40} 
                          height={40} 
                          className="rounded flex-shrink-0" 
                        />
                      ) : (
                        <div className="w-10 h-10 bg-fuchsia-100 rounded flex items-center justify-center flex-shrink-0">
                          <Music2 className="h-5 w-5 text-fuchsia-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate text-sm text-fuchsia-700">{song.title}</p>
                        <p className="text-xs truncate text-rose-500">{song.artist}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
