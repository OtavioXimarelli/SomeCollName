"use client";

import type { Song } from '@/types';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, SkipForward, SkipBack, Music2, ListMusic, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import './yt-player-hidden.css';

// Declare YT types for window object, or use 'any' if specific types are not installed
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
    _ytApiCallbacks?: Array<() => void>; // To handle multiple player instances / API ready callbacks
  }
}

const YOUTUBE_PLAYER_DOM_ID = 'youtube-player-container-unique'; // Unique ID for the player div

interface MusicPlayerProps {
  playlist: Song[];
  autoplay?: boolean;
}

const getYouTubeID = (url: string): string | null => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    if (urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
      return urlObj.searchParams.get('v');
    }
    if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.startsWith('/embed/')) {
      return urlObj.pathname.split('/embed/')[1];
    }
  } catch (e) {
    // Fallback for non-URL strings or malformed URLs, try regex
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2] && match[2].length === 11) ? match[2] : null;
};


export default function MusicPlayer({ playlist, autoplay = false }: MusicPlayerProps) {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay); // Desired playing state
  const [volume, setVolume] = useState(0.5); // 0 to 1
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isApiScriptReady, setIsApiScriptReady] = useState(false);
  
  const playerRef = useRef<any>(null); // YT.Player instance

  const currentSong = playlist && playlist.length > 0 ? playlist[currentSongIndex] : null;
  const currentVideoId = currentSong ? getYouTubeID(currentSong.url) : null;

  // Load YouTube IFrame API Script
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsApiScriptReady(true);
      return;
    }

    if (!window._ytApiCallbacks) {
        window._ytApiCallbacks = [];
    }
    window._ytApiCallbacks.push(() => setIsApiScriptReady(true));
    
    const existingScript = document.getElementById('youtube-iframe-api');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = "https://www.youtube.com/iframe_api";
      
      window.onYouTubeIframeAPIReady = () => {
          window._ytApiCallbacks?.forEach(cb => cb());
          window._ytApiCallbacks = []; // Clear callbacks after execution
      };
      
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  }, []);

  const onPlayerReady = useCallback((event: any) => { // YT.PlayerEvent
    setIsPlayerReady(true);
    const player = event.target;
    player.setVolume(volume * 100);
    if (isMuted) player.mute(); else player.unMute();
    
    if (isPlaying && currentVideoId) { // Use desired 'isPlaying' state
      player.playVideo();
    }
  }, [volume, isMuted, isPlaying, currentVideoId]);

  const playNext = useCallback(() => {
    if (!playlist || playlist.length === 0) return;
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % playlist.length);
    setIsPlaying(true); // Signal intent to play next song
  }, [playlist]);

  const onPlayerStateChange = useCallback((event: any) => { // YT.OnStateChangeEvent
    const playerState = event.data;
    const player = event.target;

    if (playerState === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      setDuration(player.getDuration());
    } else if (playerState === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    } else if (playerState === window.YT.PlayerState.ENDED) {
      playNext();
    } else if (playerState === window.YT.PlayerState.CUED) {
        // When a new video is cued, if isPlaying is true, play it.
        if (isPlaying) player.playVideo();
    }
    // Keep currentTime updated for smoother UI
    setCurrentTime(player.getCurrentTime() || 0);

  }, [playNext, isPlaying]);

  // Initialize or update player
  useEffect(() => {
    if (!isApiScriptReady || !document.getElementById(YOUTUBE_PLAYER_DOM_ID)) return;

    if (!currentVideoId) {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      setIsPlayerReady(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    if (playerRef.current) {
      // Check if video ID is different before loading
      if (playerRef.current.getVideoData && playerRef.current.getVideoData().video_id !== currentVideoId) {
        playerRef.current.loadVideoById(currentVideoId);
      } else if (!playerRef.current.getVideoData || (playerRef.current.getPlayerState && playerRef.current.getPlayerState() === window.YT.PlayerState.UNSTARTED)) {
        // If player is in unstarted state, or getVideoData not available (might be initializing)
        // loadVideoById is safer. Or cueVideoById then play if isPlaying.
        playerRef.current.cueVideoById(currentVideoId); // Cue first, onPlayerStateChange/onPlayerReady might play
      }
    } else {
      playerRef.current = new window.YT.Player(YOUTUBE_PLAYER_DOM_ID, {
        height: '0', // Hidden player
        width: '0',
        videoId: currentVideoId,
        playerVars: {
          playsinline: 1, // Important for iOS
          controls: 0,    // Hide YouTube's own controls
          disablekb: 1,   // Disable keyboard controls
          fs: 0,          // Disable fullscreen button
          modestbranding: 1, // Reduce YouTube logo
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
        },
      });
    }
  }, [currentVideoId, isApiScriptReady, onPlayerReady, onPlayerStateChange]);

  // Effect to control play/pause based on `isPlaying` state
   useEffect(() => {
    if (playerRef.current && isPlayerReady) {
      const playerState = playerRef.current.getPlayerState();
      if (isPlaying && playerState !== window.YT.PlayerState.PLAYING && playerState !== window.YT.PlayerState.BUFFERING) {
        playerRef.current.playVideo();
      } else if (!isPlaying && playerState === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, isPlayerReady]);


  // Update current time for progress bar
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isPlaying && isPlayerReady && playerRef.current) {
      intervalId = setInterval(() => {
        setCurrentTime(playerRef.current?.getCurrentTime() || 0);
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, isPlayerReady]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);


  const togglePlayPause = () => {
    if (!isPlayerReady || !currentVideoId) return;
    setIsPlaying(!isPlaying); // Let the useEffect handle actual player state
  };

  const playPrev = useCallback(() => {
    if (!playlist || playlist.length === 0) return;
    setCurrentSongIndex((prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  }, [playlist]);

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    setIsMuted(vol === 0);
    if (playerRef.current && isPlayerReady) {
      playerRef.current.setVolume(vol * 100);
      if (vol > 0 && playerRef.current.isMuted()) {
        playerRef.current.unMute();
      }
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (playerRef.current && isPlayerReady) {
      if (newMutedState) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        // If unmuting and volume was 0, set to a default or last known volume
        if (volume === 0) {
            const defaultUnmuteVolume = 0.5;
            setVolume(defaultUnmuteVolume);
            playerRef.current.setVolume(defaultUnmuteVolume * 100);
        }
      }
    }
  };
  
  const handleSeek = (newTime: number[]) => {
    if (playerRef.current && isPlayerReady) {
      playerRef.current.seekTo(newTime[0], true);
      setCurrentTime(newTime[0]);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const time = Math.max(0, Math.floor(timeInSeconds));
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  if (!playlist || playlist.length === 0) {
    return (
      <Card className="">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline text-fuchsia-700">
            <Music2 className="mr-2 h-6 w-6 text-fuchsia-500" /> Nossa Trilha Sonora
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-body text-rose-600">Nenhuma música na playlist. Adicione links de vídeos do YouTube na seção de edição!</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentVideoId && currentSong) {
     return (
      <Card className="sticky bottom-4 inset-x-4 md:left-auto md:max-w-md z-50 w-full max-w-xs sm:max-w-sm mx-auto md:mx-0 md:ml-auto bg-white/90 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-xl font-headline text-fuchsia-700">
             <div className="flex items-center">
                <Music2 className="mr-2 h-6 w-6 text-fuchsia-500" />
                <span>{currentSong?.title || 'Nossa Trilha Sonora'}</span>
             </div>
          </CardTitle>
          <p className="text-sm text-rose-500">{currentSong?.artist || 'Selecione uma música'}</p>
        </CardHeader>
        <CardContent>
            <p className="text-destructive font-body">Não foi possível tocar esta música. URL do YouTube inválida.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="sticky bottom-4 inset-x-4 md:left-auto md:max-w-md z-50 w-full max-w-xs sm:max-w-sm mx-auto md:mx-0 md:ml-auto bg-white/90 backdrop-blur-md">
      {/* Hidden div for YouTube player */}
      <div id={YOUTUBE_PLAYER_DOM_ID} className="yt-player-hidden" />
      
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-xl font-headline text-fuchsia-700">
          <div className="flex items-center overflow-hidden">
            <Music2 className="mr-2 h-6 w-6 text-fuchsia-500 flex-shrink-0" />
            <span className="truncate" title={currentSong?.title}>{currentSong?.title || 'Nossa Trilha Sonora'}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowPlaylist(!showPlaylist)}>
            <ListMusic className="h-5 w-5 text-fuchsia-500" />
          </Button>
        </CardTitle>
        <p className="text-sm text-rose-500 truncate" title={currentSong?.artist}>{currentSong?.artist || 'Selecione uma música'}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs w-10 text-muted-foreground">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration > 0 ? duration : 1} // Ensure max is at least 1 to prevent slider issues
            step={1}
            onValueChange={handleSeek}
            className="flex-1"
            aria-label="Song progress"
            disabled={!isPlayerReady || duration === 0}
          />
          <span className="text-xs w-10 text-muted-foreground">{formatTime(duration)}</span>
        </div>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Button variant="ghost" size="icon" onClick={playPrev} disabled={!isPlayerReady || playlist.length <= 1}>
            <SkipBack className="h-6 w-6 text-accent" />
          </Button>
          <Button variant="default" size="icon" onClick={togglePlayPause} className="w-12 h-12 rounded-full" disabled={!isPlayerReady || !currentVideoId}>
            {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={playNext} disabled={!isPlayerReady || playlist.length <= 1}>
            <SkipForward className="h-6 w-6 text-accent" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button variant="ghost" size="icon" onClick={toggleMute} disabled={!isPlayerReady}>
            {isMuted || volume === 0 ? <VolumeX className="h-5 w-5 text-accent" /> : <Volume2 className="h-5 w-5 text-accent" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
            aria-label="Volume control"
            disabled={!isPlayerReady}
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
                    onClick={() => {
                        setCurrentSongIndex(index); 
                        setIsPlaying(true); // Signal intent to play
                        if (index === currentSongIndex && playerRef.current && isPlayerReady) {
                            // If same song is clicked, toggle play/pause or replay
                            if(playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
                                playerRef.current.pauseVideo();
                            } else {
                                playerRef.current.playVideo();
                            }
                        }
                    }}
                    disabled={!getYouTubeID(song.url)} // Disable if URL is invalid for YouTube
                  >
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm truncate" title={song.title}>{song.title}</span>
                      <span className="text-xs text-muted-foreground truncate" title={song.artist}>{song.artist}</span>
                      {!getYouTubeID(song.url) && <span className="text-xs text-destructive"> (URL Inválida)</span>}
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
