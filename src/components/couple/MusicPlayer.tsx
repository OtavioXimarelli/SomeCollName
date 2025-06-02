"use client";

import type { Song } from '@/types';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, SkipForward, SkipBack, Music2, ListMusic, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MusicPlayerProps {
  playlist: Song[];
  autoplay?: boolean;
}

export default function MusicPlayer({ playlist, autoplay = false }: MusicPlayerProps) {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentSong = playlist && playlist.length > 0 ? playlist[currentSongIndex] : null;

  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.url;
      audioRef.current.volume = isMuted ? 0 : volume;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentSong, isPlaying, volume, isMuted]);

  useEffect(() => {
     if (audioRef.current) {
      const audio = audioRef.current;
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      const handleEnded = () => playNext();

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [currentSongIndex, playlist]);


  const togglePlayPause = () => {
    if (!currentSong) return;
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (!playlist || playlist.length === 0) return;
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % playlist.length);
    setIsPlaying(true);
  };

  const playPrev = () => {
    if (!playlist || playlist.length === 0) return;
    setCurrentSongIndex((prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0];
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
  };
  
  const handleSeek = (newTime: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime[0];
      setCurrentTime(newTime[0]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  if (!playlist || playlist.length === 0) {
    return (
      <Card className="shadow-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline text-primary-foreground">
            <Music2 className="mr-2 h-6 w-6 text-accent" /> Our Soundtrack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground font-body">No songs in the playlist. Add some music in the edit section!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg animate-fade-in sticky bottom-4 left-4 right-4 md:max-w-md md:ml-auto z-50 bg-background/90 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-xl font-headline text-primary-foreground">
          <div className="flex items-center">
            <Music2 className="mr-2 h-6 w-6 text-accent" />
            <span>{currentSong?.title || 'Our Soundtrack'}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowPlaylist(!showPlaylist)}>
            <ListMusic className="h-5 w-5 text-accent" />
          </Button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{currentSong?.artist || 'Select a song'}</p>
      </CardHeader>
      <CardContent>
        <audio ref={audioRef} loop={false} preload="metadata" />
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs w-10 text-muted-foreground">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 0}
            step={1}
            onValueChange={handleSeek}
            className="flex-1"
            aria-label="Song progress"
          />
          <span className="text-xs w-10 text-muted-foreground">{formatTime(duration)}</span>
        </div>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Button variant="ghost" size="icon" onClick={playPrev} disabled={playlist.length <= 1}>
            <SkipBack className="h-6 w-6 text-accent" />
          </Button>
          <Button variant="primary" size="icon" onClick={togglePlayPause} className="w-12 h-12 rounded-full">
            {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={playNext} disabled={playlist.length <= 1}>
            <SkipForward className="h-6 w-6 text-accent" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {isMuted || volume === 0 ? <VolumeX className="h-5 w-5 text-accent" /> : <Volume2 className="h-5 w-5 text-accent" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
            aria-label="Volume control"
          />
        </div>
        {showPlaylist && (
          <ScrollArea className="h-40 mt-4 border rounded-md p-2 bg-muted/20">
            <ul className="space-y-1">
              {playlist.map((song, index) => (
                <li key={song.id}>
                  <Button
                    variant={index === currentSongIndex ? "secondary" : "ghost"}
                    className={`w-full justify-start text-left h-auto py-1.5 px-2 ${index === currentSongIndex ? 'font-bold' : ''}`}
                    onClick={() => {setCurrentSongIndex(index); setIsPlaying(true);}}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm">{song.title}</span>
                      <span className="text-xs text-muted-foreground">{song.artist}</span>
                    </div>
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
