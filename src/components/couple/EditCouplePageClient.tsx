"use client";

import type { CoupleData, Photo, Song } from '@/types';
import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Save, Settings, Image as ImageIcon, Music2Icon, QrCodeIcon, Trash2, Music2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { useToast } from '@/hooks/use-toast';
import { saveCoupleDetailsAction, updatePlaylistAction } from '@/lib/actions';
import PhotoUploadForm from './PhotoUploadForm';
import QRCodeDisplay from './QRCodeDisplay';
import SpotifyTrackPicker from './SpotifyTrackPicker';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Image from 'next/image';

const generalSettingsSchema = z.object({
  coupleName: z.string().optional(),
  startDate: z.date({ required_error: "Selecione a data de início do relacionamento." }),
});
type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;

const musicSettingsSchema = z.object({
  songs: z.array(z.object({
    title: z.string().min(1, "Título da música é obrigatório"),
    artist: z.string().min(1, "Nome do artista é obrigatório"),
    spotifyTrackId: z.string().min(1, "ID da música do Spotify é obrigatório"),
    albumCoverUrl: z.string().url("URL da capa do álbum inválida").optional(),
  })).max(10, "A playlist pode ter no máximo 10 músicas."),
});
type MusicSettingsFormValues = z.infer<typeof musicSettingsSchema>;

interface EditCouplePageClientProps {
  coupleData: CoupleData;
}

export default function EditCouplePageClient({ coupleData: initialCoupleData }: EditCouplePageClientProps) {
  const [coupleData, setCoupleData] = useState<CoupleData>(initialCoupleData);
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();

  useEffect(() => {
    setCoupleData(initialCoupleData);
  }, [initialCoupleData]);

  const generalForm = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      coupleName: coupleData.coupleName || '',
      startDate: coupleData.startDate ? parseISO(coupleData.startDate) : new Date(),
    },
  });

  useEffect(() => {
    generalForm.reset({
      coupleName: coupleData.coupleName || '',
      startDate: coupleData.startDate ? parseISO(coupleData.startDate) : new Date(),
    });
  }, [coupleData, generalForm]);

  const musicForm = useForm<MusicSettingsFormValues>({
    resolver: zodResolver(musicSettingsSchema),
    defaultValues: {
      songs: coupleData.playlist.map(s => ({ ...s, albumCoverUrl: s.albumCoverUrl || '' })) || [],
    },
  });
  
  useEffect(() => {
    musicForm.reset({
      songs: coupleData.playlist.map(s => ({ ...s, albumCoverUrl: s.albumCoverUrl || '' })) || [],
    });
  }, [coupleData.playlist, musicForm]);

  const handleGeneralSettingsSubmit: SubmitHandler<GeneralSettingsFormValues> = async (data) => {
    try {
      const updatedData = await saveCoupleDetailsAction(coupleData.id, {
        coupleName: data.coupleName,
        startDate: data.startDate.toISOString(),
      });
      if (updatedData) {
        setCoupleData(updatedData);
        toast({ title: "Configurações salvas!", description: "Suas configurações gerais foram atualizadas." });
      } else {
        throw new Error("Falha ao salvar configurações gerais.");
      }
    } catch (error) {
      toast({ title: "Falha ao salvar", description: (error as Error).message || "Não foi possível salvar as configurações gerais.", variant: "destructive" });
    }
  };

  const handleMusicSettingsSubmit: SubmitHandler<MusicSettingsFormValues> = async (data) => {
    try {
      const newPlaylist = data.songs.map((song, index) => ({ ...song, id: coupleData.playlist[index]?.id || Date.now().toString() + index }));
      const updatedData = await updatePlaylistAction(coupleData.id, newPlaylist);
      if (updatedData) {
        setCoupleData(updatedData);
        toast({ title: "Playlist atualizada!", description: "Sua playlist de músicas foi salva." });
      } else {
        throw new Error("Falha ao atualizar a playlist.");
      }
    } catch (error) {
      toast({ title: "Falha ao salvar", description: (error as Error).message || "Não foi possível salvar a playlist.", variant: "destructive" });
    }
  };

  const handlePhotoListChange = (newPhotos: Photo[]) => {
    setCoupleData(prev => ({ ...prev, photos: newPhotos }));
  };

  const songsFields = musicForm.watch('songs');
  const mainPhoto = coupleData.photos?.[0]?.url;
  const mainSong = coupleData.playlist?.[0];

  return (
    <ProtectedRoute>
      <div className="flex justify-center items-start min-h-[90vh] p-2 sm:p-4 bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
        <Card className="w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto p-4 sm:p-8 flex flex-col gap-8 rounded-3xl bg-white/90 border-2 border-fuchsia-100 shadow-xl">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            {mainSong && (
              <div className="rounded-xl border border-fuchsia-200 bg-fuchsia-50/80 p-4 flex items-center gap-3 shadow-sm">
                <Music2 className="text-fuchsia-500 w-7 h-7 flex-shrink-0" />
                <div className="flex flex-col overflow-hidden">
                  <span className="font-headline text-fuchsia-700 text-base truncate font-semibold">{mainSong.title}</span>
                  <span className="text-xs text-rose-500 truncate">{mainSong.artist}</span>
                </div>
              </div>
            )}
            {mainPhoto && (
              <div className="rounded-2xl overflow-hidden border-2 border-fuchsia-200 bg-white flex items-center justify-center aspect-[4/3] max-h-60 mx-auto shadow-md w-full">
                <Image src={mainPhoto} alt="Foto principal do casal" width={320} height={240} className="object-cover w-full h-full" />
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 mb-6 bg-pink-100/60 p-2 rounded-xl">
              <TabsTrigger value="general" className="text-fuchsia-700 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-fuchsia-800 rounded-lg py-2.5 font-semibold flex items-center justify-center gap-2"><Settings className="h-5 w-5" />Geral</TabsTrigger>
              <TabsTrigger value="photos" className="text-fuchsia-700 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-fuchsia-800 rounded-lg py-2.5 font-semibold flex items-center justify-center gap-2"><ImageIcon className="h-5 w-5" />Fotos</TabsTrigger>
              <TabsTrigger value="music" className="text-fuchsia-700 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-fuchsia-800 rounded-lg py-2.5 font-semibold flex items-center justify-center gap-2"><Music2Icon className="h-5 w-5" />Música</TabsTrigger>
              <TabsTrigger value="share" className="text-fuchsia-700 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-fuchsia-800 rounded-lg py-2.5 font-semibold flex items-center justify-center gap-2"><QrCodeIcon className="h-5 w-5" />Compartilhar</TabsTrigger>
            </TabsList>

          <TabsContent value="general">
            <Card className="bg-fuchsia-50/30 border-fuchsia-100 p-2">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-fuchsia-700">Configurações Gerais</CardTitle>
                <CardDescription className="text-rose-500">Defina o nome do casal e a data de início do relacionamento.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={generalForm.handleSubmit(handleGeneralSettingsSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="coupleName" className="text-base text-fuchsia-700">Nome do Casal (Opcional)</Label>
                    <Input
                      id="coupleName"
                      placeholder="ex: Alex & Jamie"
                      {...generalForm.register("coupleName")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate" className="text-base text-fuchsia-700">Data de Início do Relacionamento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal mt-1"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-fuchsia-500" />
                          {generalForm.watch("startDate") ? format(generalForm.watch("startDate"), "PPP") : <span>Selecione uma data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={generalForm.watch("startDate")}
                          onSelect={(date) => date && generalForm.setValue("startDate", date, { shouldValidate: true })}
                          initialFocus
                          captionLayout="dropdown-buttons"
                          fromYear={1970}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    {generalForm.formState.errors.startDate && <p className="text-sm text-destructive mt-1">{generalForm.formState.errors.startDate.message}</p>}
                  </div>
                  <Button type="submit" disabled={generalForm.formState.isSubmitting} className="w-full sm:w-auto">
                    {generalForm.formState.isSubmitting ? "Salvando..." : <><Save className="mr-2 h-4 w-4" /> Salvar Configurações Gerais</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos">
            <PhotoUploadForm coupleId={coupleData.id} currentPhotos={coupleData.photos} onPhotoListChange={handlePhotoListChange} />
          </TabsContent>

          <TabsContent value="music">
            <Card className="bg-fuchsia-50/30 border-fuchsia-100 p-2">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-fuchsia-700">Playlist do Spotify</CardTitle>
                <CardDescription className="text-rose-500">Busque e adicione suas músicas favoritas do Spotify. Crie uma trilha sonora especial para vocês dois.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SpotifyTrackPicker 
                  onTrackSelect={(track) => {
                    const currentSongs = musicForm.getValues('songs');
                    musicForm.setValue('songs', [...currentSongs, track], { shouldValidate: true });
                  }}
                  selectedTracks={coupleData.playlist} // Use the actual playlist with IDs
                  maxTracks={10}
                />
                
                {songsFields.length > 0 && (
                  <form onSubmit={musicForm.handleSubmit(handleMusicSettingsSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-fuchsia-700">Sua Playlist</h3>
                      {songsFields.map((song, index) => (
                        <Card key={index} className="p-4 space-y-3 bg-white/50">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3 flex-grow">
                              {song.albumCoverUrl && (
                                <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                  <Image src={song.albumCoverUrl} alt="Album cover" width={48} height={48} className="object-cover" />
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold text-gray-900">{song.title}</h4>
                                <p className="text-sm text-gray-600">{song.artist}</p>
                              </div>
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                const currentSongs = musicForm.getValues('songs');
                                currentSongs.splice(index, 1);
                                musicForm.setValue('songs', currentSongs, { shouldValidate: true });
                              }}
                              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                    <Button type="submit" disabled={musicForm.formState.isSubmitting} className="w-full sm:w-auto">
                      {musicForm.formState.isSubmitting ? "Salvando Playlist..." : <><Save className="mr-2 h-4 w-4" /> Salvar Playlist</>}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="share">
            <QRCodeDisplay couplePageId={coupleData.id} couplePhotoUrl={mainPhoto} musicTitle={mainSong?.title} musicArtist={mainSong?.artist} spotifyTrackId={mainSong?.spotifyTrackId} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
    </ProtectedRoute>
  );
}

