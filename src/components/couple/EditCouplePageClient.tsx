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
    url: z.string().url("Deve ser uma URL válida (ex: link do YouTube)").min(1, "URL da música é obrigatória"),
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
      songs: coupleData.playlist.map(s => ({ ...s })) || [],
    },
  });

  useEffect(() => {
    musicForm.reset({
      songs: coupleData.playlist.map(s => ({ ...s })) || [],
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
                <CardTitle className="font-headline text-2xl text-fuchsia-700">Playlist de Música</CardTitle>
                <CardDescription className="text-rose-500">Gerencie as músicas para o seu tocador. Use URLs de vídeos do YouTube.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={musicForm.handleSubmit(handleMusicSettingsSubmit)} className="space-y-6">
                  {songsFields.map((song, index) => (
                    <Card key={index} className="p-4 space-y-3 bg-muted/30">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-primary-foreground">Música #{index + 1}</h4>
                        <Button type="button" variant="ghost" size="icon" onClick={() => {
                          const currentSongs = musicForm.getValues('songs');
                          currentSongs.splice(index, 1);
                          musicForm.setValue('songs', currentSongs, { shouldValidate: true });
                        }}
                          disabled={songsFields.length <= 1 && index === 0 && songsFields[0]?.title === "" && songsFields[0]?.artist === "" && songsFields[0]?.url === ""}
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <Label htmlFor={`songs.${index}.title`} className="text-sm">Título</Label>
                        <Input id={`songs.${index}.title`} {...musicForm.register(`songs.${index}.title`)} placeholder="Título da Música" className="mt-1" />
                        {musicForm.formState.errors.songs?.[index]?.title && <p className="text-sm text-destructive mt-1">{musicForm.formState.errors.songs[index]?.title?.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor={`songs.${index}.artist`} className="text-sm">Artista</Label>
                        <Input id={`songs.${index}.artist`} {...musicForm.register(`songs.${index}.artist`)} placeholder="Nome do Artista" className="mt-1" />
                        {musicForm.formState.errors.songs?.[index]?.artist && <p className="text-sm text-destructive mt-1">{musicForm.formState.errors.songs[index]?.artist?.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor={`songs.${index}.url`} className="text-sm">URL da Música (YouTube)</Label>
                        <Input id={`songs.${index}.url`} type="url" {...musicForm.register(`songs.${index}.url`)} placeholder="https://www.youtube.com/watch?v=..." className="mt-1" />
                        {musicForm.formState.errors.songs?.[index]?.url && <p className="text-sm text-destructive mt-1">{musicForm.formState.errors.songs[index]?.url?.message}</p>}
                      </div>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={() => {
                    if (songsFields.length < 10) {
                      const currentSongs = musicForm.getValues('songs');
                      musicForm.setValue('songs', [...currentSongs, { title: "", artist: "", url: "" }], { shouldValidate: true });
                    } else {
                      toast({ title: "Playlist Cheia", description: "Você pode adicionar no máximo 10 músicas.", variant: "destructive" });
                    }
                  }}
                    disabled={songsFields.length >= 10}
                  >
                    Adicionar Música
                  </Button>
                  <Button type="submit" disabled={musicForm.formState.isSubmitting} className="w-full sm:w-auto">
                    {musicForm.formState.isSubmitting ? "Salvando Playlist..." : <><Save className="mr-2 h-4 w-4" /> Salvar Playlist</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="share">
            <QRCodeDisplay couplePageId={coupleData.id} couplePhotoUrl={mainPhoto} musicTitle={mainSong?.title} musicArtist={mainSong?.artist} musicUrl={mainSong?.url} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

