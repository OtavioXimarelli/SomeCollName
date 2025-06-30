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
      <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm border-fuchsia-200 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center text-fuchsia-700 font-headline">
            <Music2 className="mr-3 h-6 w-6" />
            Nenhuma música na playlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-rose-500">Adicione músicas na página de edição para começar a ouvir.</p>
        </CardContent>
      </Card>
    );
  }

  const currentTrack = playlist[currentTrackIndex];
  const spotifyEmbedUrl = `https://open.spotify.com/embed/track/${currentTrack.spotifyTrackId}?utm_source=generator&theme=0`;

  return (
    <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm border-fuchsia-200 shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-3 overflow-hidden">
          {currentTrack.albumCoverUrl ? (
            <Image src={currentTrack.albumCoverUrl} alt={`Capa do álbum de ${currentTrack.title}`} width={56} height={56} className="rounded-md shadow-sm" />
          ) : (
            <div className="w-14 h-14 bg-fuchsia-100 rounded-md flex items-center justify-center">
              <Music2 className="h-8 w-8 text-fuchsia-400" />
            </div>
          )}
          <div className="flex flex-col overflow-hidden">
            <p className="font-headline text-lg text-fuchsia-800 truncate">{currentTrack.title}</p>
            <p className="text-sm text-rose-600 truncate">{currentTrack.artist}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsPlaylistVisible(!isPlaylistVisible)} 
          className="text-fuchsia-600 hover:text-fuchsia-800 p-2"
          aria-label={isPlaylistVisible ? "Hide playlist" : "Show playlist"}
          title={isPlaylistVisible ? "Hide playlist" : "Show playlist"}
        >
          <ListMusic className="h-6 w-6" />
        </button>
      </CardHeader>

      <CardContent className="p-0">
        <iframe
          title={`Spotify Player: ${currentTrack.title} by ${currentTrack.artist}`}
          key={currentTrack.id} // Re-render iframe when track changes
          className="rounded-b-xl"
          src={spotifyEmbedUrl}
          width="100%"
          height="152" // Standard compact player height
          frameBorder="0"
          allowFullScreen={false}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>

        {isPlaylistVisible && (
          <div className="p-4">
            <h3 className="text-fuchsia-700 font-semibold mb-2">Próximas</h3>
            <ScrollArea className="h-[150px]">
              <ul className="space-y-2">
                {playlist.map((song, index) => (
                  <li
                    key={song.id}
                    onClick={() => setCurrentTrackIndex(index)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      index === currentTrackIndex
                        ? 'bg-fuchsia-100/80'
                        : 'hover:bg-fuchsia-50/60'
                    }`}
                  >
                    {song.albumCoverUrl ? (
                       <Image src={song.albumCoverUrl} alt={`Capa de ${song.title}`} width={40} height={40} className="rounded" />
                    ) : (
                       <div className="w-10 h-10 bg-fuchsia-100 rounded flex items-center justify-center">
                         <Music2 className="h-5 w-5 text-fuchsia-400" />
                       </div>
                    )}
                    <div>
                      <p className={`font-semibold truncate text-sm ${index === currentTrackIndex ? 'text-fuchsia-800' : 'text-fuchsia-700'}`}>{song.title}</p>
                      <p className={`text-xs truncate ${index === currentTrackIndex ? 'text-rose-600' : 'text-rose-500'}`}>{song.artist}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
