"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { suggestPhotoCaptionAction, addPhotoAction, deletePhotoAction, updatePhotoCaptionAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, Send, Trash2, Edit3, ImagePlus, Wand2, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import type { Photo } from '@/types';

interface PhotoUploadFormProps {
  coupleId: string;
  currentPhotos: Photo[];
  onPhotoListChange: (photos: Photo[]) => void; // Callback to update parent state
}

const photoUploadSchema = z.object({
  photoFile: z.custom<FileList>().refine(files => files && files.length > 0, "Photo is required."),
  context: z.string().optional(),
  captionChoice: z.string().optional(), // For selected AI caption or manual input
});

type PhotoUploadFormValues = z.infer<typeof photoUploadSchema>;

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function PhotoUploadForm({ coupleId, currentPhotos, onPhotoListChange }: PhotoUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedCaptions, setSuggestedCaptions] = useState<string[]>([]);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);
  const [manualCaption, setManualCaption] = useState('');
  const { toast } = useToast();

  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState('');

  const form = useForm<PhotoUploadFormValues>({
    resolver: zodResolver(photoUploadSchema),
    defaultValues: {
      context: '',
      captionChoice: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhotoPreview(URL.createObjectURL(file));
      setSuggestedCaptions([]); // Reset suggestions on new file
      form.setValue('captionChoice', ''); // Reset caption choice
      setManualCaption('');
    } else {
      setSelectedPhotoPreview(null);
    }
  };

  const handleSuggestCaptions = async () => {
    const photoFile = form.getValues("photoFile")?.[0];
    if (!photoFile) {
      toast({ title: "No photo selected", description: "Please select a photo first.", variant: "destructive" });
      return;
    }
    setIsSuggesting(true);
    setSuggestedCaptions([]);
    try {
      const photoDataUri = await fileToDataUri(photoFile);
      const context = form.getValues("context") || "";
      const result = await suggestPhotoCaptionAction({ photoDataUri, context });
      if (result.captions.length > 0) {
        setSuggestedCaptions(result.captions);
        form.setValue('captionChoice', result.captions[0]); // Pre-select first suggestion
      } else {
        toast({ title: "No suggestions", description: "AI couldn't generate captions. Try a different photo or context." });
      }
    } catch (error) {
      toast({ title: "Suggestion failed", description: "Could not get AI caption suggestions.", variant: "destructive" });
    } finally {
      setIsSuggesting(false);
    }
  };

  const onSubmit: SubmitHandler<PhotoUploadFormValues> = async (data) => {
    setIsUploading(true);
    try {
      const photoFile = data.photoFile[0];
      const photoUrl = URL.createObjectURL(photoFile); // Temporary URL for display, real URL would come from storage
      // In a real app, you'd upload photoFile to a storage service and get back a URL.
      // For this mock, we'll use the object URL and assume it's "uploaded".

      const finalCaption = suggestedCaptions.length > 0 ? data.captionChoice : manualCaption;

      const result = await addPhotoAction(coupleId, { url: `https://placehold.co/400x300.png?text=${encodeURIComponent(photoFile.name)}` /* Replace with actual uploaded URL */, caption: finalCaption || "" });
      
      if (result && result.photos) {
        onPhotoListChange(result.photos);
        toast({ title: "Photo added!", description: "Your new memory is saved." });
        form.reset();
        setSelectedPhotoPreview(null);
        setSuggestedCaptions([]);
        setManualCaption('');
      } else {
         throw new Error("Failed to add photo.");
      }

    } catch (error) {
      toast({ title: "Upload failed", description: (error as Error).message || "Could not save the photo.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this photo?");
    if (!confirmed) return;

    try {
      const result = await deletePhotoAction(coupleId, photoId);
      if (result && result.photos) {
        onPhotoListChange(result.photos);
        toast({ title: "Photo deleted", description: "The photo has been removed." });
      } else {
        throw new Error("Failed to delete photo.");
      }
    } catch (error) {
       toast({ title: "Deletion failed", description: (error as Error).message || "Could not delete the photo.", variant: "destructive" });
    }
  };
  
  const handleEditCaption = (photo: Photo) => {
    setEditingPhotoId(photo.id);
    setEditingCaption(photo.caption);
  };

  const handleSaveCaption = async (photoId: string) => {
    if (!editingCaption.trim() && !window.confirm("Caption is empty. Save anyway?")) {
        return;
    }
    try {
      const result = await updatePhotoCaptionAction(coupleId, photoId, editingCaption);
      if (result && result.photos) {
        onPhotoListChange(result.photos);
        toast({ title: "Caption updated!", description: "The photo caption has been saved." });
        setEditingPhotoId(null);
        setEditingCaption('');
      } else {
        throw new Error("Failed to update caption.");
      }
    } catch (error) {
      toast({ title: "Update failed", description: (error as Error).message || "Could not save the caption.", variant: "destructive" });
    }
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-xl animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline"><ImagePlus className="mr-3 h-7 w-7 text-accent" /> Add New Photo</CardTitle>
          <CardDescription>Share a new cherished moment. Add context for better AI caption suggestions.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="photoFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="photoFile" className="text-base">Photo</FormLabel>
                    <FormControl>
                      <Input 
                        id="photoFile" 
                        type="file" 
                        accept="image/*" 
                        className="file:text-primary file:font-semibold"
                        onChange={(e) => { field.onChange(e.target.files); handleFileChange(e); }} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedPhotoPreview && (
                <div className="mt-4 border border-dashed border-border p-4 rounded-md flex justify-center">
                  <Image src={selectedPhotoPreview} alt="Selected preview" width={200} height={200} className="rounded-md object-contain max-h-48" />
                </div>
              )}

              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="context" className="text-base">Context (Optional)</FormLabel>
                    <FormControl>
                      <Textarea id="context" placeholder="e.g., Our trip to the beach, celebrating anniversary..." {...field} />
                    </FormControl>
                    <FormDescription>Provide some context for AI caption suggestions.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedPhotoPreview && (
                 <Button type="button" onClick={handleSuggestCaptions} disabled={isSuggesting || !form.getValues("photoFile")?.[0]} className="w-full sm:w-auto bg-accent hover:bg-accent/90">
                  {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Suggest Captions with AI
                </Button>
              )}

              {suggestedCaptions.length > 0 && (
                <FormField
                  control={form.control}
                  name="captionChoice"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base">Choose a Caption or Write Your Own:</FormLabel>
                       {suggestedCaptions.map((caption, index) => (
                        <FormItem key={index} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Input type="radio" {...field} value={caption} checked={field.value === caption} id={`caption-${index}`} className="h-4 w-4"/>
                          </FormControl>
                          <FormLabel htmlFor={`caption-${index}`} className="font-normal text-sm cursor-pointer">
                            {caption}
                          </FormLabel>
                        </FormItem>
                      ))}
                      <FormItem className="flex items-center space-x-3 space-y-0">
                         <FormControl>
                            <Input type="radio" {...field} value={"manual"} checked={field.value === "manual"} id="caption-manual-radio" className="h-4 w-4"/>
                          </FormControl>
                         <FormLabel htmlFor="caption-manual-radio" className="font-normal text-sm cursor-pointer">
                            Write my own
                          </FormLabel>
                      </FormItem>
                       {field.value === "manual" && (
                        <Textarea placeholder="Enter your caption here..." value={manualCaption} onChange={(e) => setManualCaption(e.target.value)} />
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {suggestedCaptions.length === 0 && selectedPhotoPreview && (
                 <FormItem>
                    <FormLabel htmlFor="manualCaption" className="text-base">Caption</FormLabel>
                    <FormControl>
                      <Textarea id="manualCaption" placeholder="Write a caption for your photo" value={manualCaption} onChange={(e) => setManualCaption(e.target.value)} />
                    </FormControl>
                 </FormItem>
              )}


            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isUploading || !form.getValues("photoFile")?.[0]} className="w-full sm:w-auto">
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                Add Photo
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="shadow-xl animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline"><ImagePlus className="mr-3 h-7 w-7 text-accent" /> Manage Photos</CardTitle>
          <CardDescription>View, edit captions, or delete your uploaded photos.</CardDescription>
        </CardHeader>
        <CardContent>
          {currentPhotos.length === 0 ? (
            <p className="text-muted-foreground">No photos uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {currentPhotos.map(photo => (
                <Card key={photo.id} className="overflow-hidden">
                  <Image src={photo.url} alt={photo.caption || "Couple photo"} width={300} height={200} className="w-full h-40 object-cover" data-ai-hint={photo.dataAiHint || "uploaded photo"}/>
                  <CardContent className="p-3 space-y-2">
                    {editingPhotoId === photo.id ? (
                      <div className="space-y-2">
                        <Textarea 
                          value={editingCaption}
                          onChange={(e) => setEditingCaption(e.target.value)}
                          placeholder="Enter caption"
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSaveCaption(photo.id)}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingPhotoId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground min-h-[40px]">{photo.caption || "No caption"}</p>
                    )}
                  </CardContent>
                  <CardFooter className="p-3 flex justify-end gap-2 bg-muted/30">
                     {editingPhotoId !== photo.id && (
                        <Button variant="outline" size="sm" onClick={() => handleEditCaption(photo)}>
                          <Edit3 className="mr-1 h-3 w-3" /> Edit
                        </Button>
                      )}
                    <Button variant="destructive" size="sm" onClick={() => handleDeletePhoto(photo.id)}>
                      <Trash2 className="mr-1 h-3 w-3" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
