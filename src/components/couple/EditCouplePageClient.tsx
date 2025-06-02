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
import { CalendarIcon, Save, Settings, Image as ImageIcon, Music2Icon, QrCodeIcon, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { useToast } from '@/hooks/use-toast';
import { saveCoupleDetailsAction, updatePlaylistAction } from '@/lib/actions';
import PhotoUploadForm from './PhotoUploadForm';
import QRCodeDisplay from './QRCodeDisplay';
import { Textarea } from '../ui/textarea';

const generalSettingsSchema = z.object({
  coupleName: z.string().optional(),
  startDate: z.date({ required_error: "Please select your relationship start date."}),
});
type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;

const musicSettingsSchema = z.object({
  songs: z.array(z.object({
    title: z.string().min(1, "Song title is required"),
    artist: z.string().min(1, "Artist name is required"),
    url: z.string().url("Must be a valid URL").min(1, "Song URL is required"),
  })).max(10, "Playlist can have a maximum of 10 songs."), // Limit playlist size
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
      songs: coupleData.playlist.map(s => ({...s})) || [], // Ensure new array for form
    },
  });
  
  useEffect(() => {
    musicForm.reset({
      songs: coupleData.playlist.map(s => ({...s})) || [],
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
        toast({ title: "Settings saved!", description: "Your general settings have been updated." });
      } else {
        throw new Error("Failed to save general settings.");
      }
    } catch (error) {
      toast({ title: "Save failed", description: (error as Error).message || "Could not save general settings.", variant: "destructive" });
    }
  };

  const handleMusicSettingsSubmit: SubmitHandler<MusicSettingsFormValues> = async (data) => {
     try {
      const newPlaylist = data.songs.map((song, index) => ({ ...song, id: coupleData.playlist[index]?.id || Date.now().toString() + index }));
      const updatedData = await updatePlaylistAction(coupleData.id, newPlaylist);
      if (updatedData) {
        setCoupleData(updatedData);
        toast({ title: "Playlist updated!", description: "Your music playlist has been saved." });
      } else {
        throw new Error("Failed to update playlist.");
      }
    } catch (error) {
      toast({ title: "Save failed", description: (error as Error).message || "Could not save playlist.", variant: "destructive" });
    }
  };
  
  const handlePhotoListChange = (newPhotos: Photo[]) => {
    setCoupleData(prev => ({...prev, photos: newPhotos}));
  };

  // Music form dynamic fields
  const { fields, append, remove } = musicForm.control.register ? musicForm.control : { fields: [], append: () => {}, remove: () => {} }; // Basic handling for useFieldArray like structure
  // This is a simplified way to handle dynamic fields without useFieldArray for brevity
  // In a real app, useFieldArray from react-hook-form is preferred.
  const songsFields = musicForm.watch('songs');


  return (
    <Card className="shadow-xl animate-fade-in">
      <CardHeader>
        <CardTitle className="text-4xl font-headline text-primary-foreground flex items-center">
          <Settings className="mr-3 h-10 w-10 text-accent" /> Customize Your Space
        </CardTitle>
        <CardDescription className="text-lg">
          Personalize your couple's page with your unique touches, memories, and soundtrack.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="general" className="text-base py-3"><Settings className="mr-2 h-5 w-5" />General</TabsTrigger>
            <TabsTrigger value="photos" className="text-base py-3"><ImageIcon className="mr-2 h-5 w-5" />Photos</TabsTrigger>
            <TabsTrigger value="music" className="text-base py-3"><Music2Icon className="mr-2 h-5 w-5" />Music</TabsTrigger>
            <TabsTrigger value="share" className="text-base py-3"><QrCodeIcon className="mr-2 h-5 w-5" />Share</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl">General Settings</CardTitle>
                <CardDescription>Set your couple's name and relationship start date.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={generalForm.handleSubmit(handleGeneralSettingsSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="coupleName" className="text-base">Couple's Name (Optional)</Label>
                    <Input 
                      id="coupleName" 
                      placeholder="e.g., Alex & Jamie" 
                      {...generalForm.register("coupleName")} 
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate" className="text-base">Relationship Start Date</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal mt-1"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {generalForm.watch("startDate") ? format(generalForm.watch("startDate"), "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={generalForm.watch("startDate")}
                            onSelect={(date) => date && generalForm.setValue("startDate", date, {shouldValidate: true})}
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
                    {generalForm.formState.isSubmitting ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save General Settings</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos">
             <PhotoUploadForm coupleId={coupleData.id} currentPhotos={coupleData.photos} onPhotoListChange={handlePhotoListChange} />
          </TabsContent>

          <TabsContent value="music">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl">Music Playlist</CardTitle>
                <CardDescription>Manage the songs for your background music player. Add up to 10 songs.</CardDescription>
              </CardHeader>
              <CardContent>
                 <form onSubmit={musicForm.handleSubmit(handleMusicSettingsSubmit)} className="space-y-6">
                  {songsFields.map((song, index) => (
                    <Card key={index} className="p-4 space-y-3 bg-muted/30">
                       <div className="flex justify-between items-center">
                         <h4 className="font-semibold text-primary-foreground">Song #{index + 1}</h4>
                         <Button type="button" variant="ghost" size="icon" onClick={() => {
                             const currentSongs = musicForm.getValues('songs');
                             currentSongs.splice(index, 1);
                             musicForm.setValue('songs', currentSongs);
                           }}
                           disabled={songsFields.length <=1 && index === 0}
                           className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                      <div>
                        <Label htmlFor={`songs.${index}.title`} className="text-sm">Title</Label>
                        <Input id={`songs.${index}.title`} {...musicForm.register(`songs.${index}.title`)} placeholder="Song Title" className="mt-1" />
                        {musicForm.formState.errors.songs?.[index]?.title && <p className="text-sm text-destructive mt-1">{musicForm.formState.errors.songs[index]?.title?.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor={`songs.${index}.artist`} className="text-sm">Artist</Label>
                        <Input id={`songs.${index}.artist`} {...musicForm.register(`songs.${index}.artist`)} placeholder="Artist Name" className="mt-1" />
                         {musicForm.formState.errors.songs?.[index]?.artist && <p className="text-sm text-destructive mt-1">{musicForm.formState.errors.songs[index]?.artist?.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor={`songs.${index}.url`} className="text-sm">Song URL</Label>
                        <Input id={`songs.${index}.url`} type="url" {...musicForm.register(`songs.${index}.url`)} placeholder="https://example.com/song.mp3" className="mt-1" />
                        {musicForm.formState.errors.songs?.[index]?.url && <p className="text-sm text-destructive mt-1">{musicForm.formState.errors.songs[index]?.url?.message}</p>}
                      </div>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={() => {
                      if (songsFields.length < 10) {
                        const currentSongs = musicForm.getValues('songs');
                        musicForm.setValue('songs', [...currentSongs, { title: "", artist: "", url: "" }]);
                      } else {
                        toast({ title: "Playlist Full", description: "You can add a maximum of 10 songs.", variant: "destructive" });
                      }
                    }}
                    disabled={songsFields.length >= 10}
                  >
                    Add Song
                  </Button>
                   <Button type="submit" disabled={musicForm.formState.isSubmitting} className="w-full sm:w-auto">
                    {musicForm.formState.isSubmitting ? "Saving Playlist..." : <><Save className="mr-2 h-4 w-4" /> Save Playlist</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="share">
            <QRCodeDisplay couplePageId={coupleData.id} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
