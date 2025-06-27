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
  photoFile: z.custom<FileList>().refine(files => files && files.length > 0, "Foto é obrigatória."),
  context: z.string().optional(),
  captionChoice: z.string().optional(), // Para legenda sugerida por IA ou inserção manual
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
      toast({ title: "Nenhuma foto selecionada", description: "Selecione uma foto primeiro.", variant: "destructive" });
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
        toast({ title: "Sem sugestões", description: "A IA não conseguiu gerar legendas. Tente outra foto ou contexto." });
      }
    } catch (error) {
      toast({ title: "Sugestão falhou", description: "Não foi possível obter sugestões de legenda da IA.", variant: "destructive" });
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
        toast({ title: "Foto adicionada!", description: "Sua nova memória foi salva." });
        form.reset();
        setSelectedPhotoPreview(null);
        setSuggestedCaptions([]);
        setManualCaption('');
      } else {
         throw new Error("Falha ao adicionar foto.");
      }

    } catch (error) {
      toast({ title: "Falha no upload", description: (error as Error).message || "Não foi possível salvar a foto.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir esta foto?");
    if (!confirmed) return;

    try {
      const result = await deletePhotoAction(coupleId, photoId);
      if (result && result.photos) {
        onPhotoListChange(result.photos);
        toast({ title: "Foto excluída", description: "A foto foi removida." });
      } else {
        throw new Error("Falha ao excluir foto.");
      }
    } catch (error) {
       toast({ title: "Falha ao excluir", description: (error as Error).message || "Não foi possível excluir a foto.", variant: "destructive" });
    }
  };
  
  const handleEditCaption = (photo: Photo) => {
    setEditingPhotoId(photo.id);
    setEditingCaption(photo.caption);
  };

  const handleSaveCaption = async (photoId: string) => {
    if (!editingCaption.trim() && !window.confirm("A legenda está vazia. Salvar mesmo assim?")) {
        return;
    }
    try {
      const result = await updatePhotoCaptionAction(coupleId, photoId, editingCaption);
      if (result && result.photos) {
        onPhotoListChange(result.photos);
        toast({ title: "Legenda atualizada!", description: "A legenda da foto foi salva." });
        setEditingPhotoId(null);
        setEditingCaption('');
      } else {
        throw new Error("Falha ao atualizar legenda.");
      }
    } catch (error) {
      toast({ title: "Falha na atualização", description: (error as Error).message || "Não foi possível salvar a legenda.", variant: "destructive" });
    }
  };


  return (
    <div className="space-y-8">
      <Card className="">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline text-fuchsia-700"><ImagePlus className="mr-3 h-7 w-7 text-fuchsia-500" /> Adicionar Nova Foto</CardTitle>
          <CardDescription>Compartilhe um novo momento precioso. Adicione contexto para melhores sugestões de legenda pela IA.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="photoFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="photoFile" className="text-base text-fuchsia-700">Foto</FormLabel>
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
                    <FormLabel htmlFor="context" className="text-base text-fuchsia-700">Contexto (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea id="context" placeholder="Ex: Nossa viagem à praia, comemorando aniversário..." {...field} />
                    </FormControl>
                    <FormDescription>Forneça algum contexto para as sugestões de legenda da IA.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedPhotoPreview && (
                 <Button type="button" onClick={handleSuggestCaptions} disabled={isSuggesting || !form.getValues("photoFile")?.[0]} className="w-full sm:w-auto bg-fuchsia-500 hover:bg-fuchsia-600 text-white">
                  {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Sugerir Legendas com IA
                </Button>
              )}

              {suggestedCaptions.length > 0 && (
                <FormField
                  control={form.control}
                  name="captionChoice"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base text-fuchsia-700">Escolha uma Legenda ou Escreva a Sua:</FormLabel>
                       {suggestedCaptions.map((caption, index) => (
                        <FormItem key={index} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Input type="radio" {...field} value={caption} checked={field.value === caption} id={`caption-${index}`} className="h-4 w-4"/>
                          </FormControl>
                          <FormLabel htmlFor={`caption-${index}`} className="font-normal text-sm cursor-pointer text-fuchsia-700">
                            {caption}
                          </FormLabel>
                        </FormItem>
                      ))}
                      <FormItem className="flex items-center space-x-3 space-y-0">
                         <FormControl>
                            <Input type="radio" {...field} value={"manual"} checked={field.value === "manual"} id="caption-manual-radio" className="h-4 w-4"/>
                          </FormControl>
                         <FormLabel htmlFor="caption-manual-radio" className="font-normal text-sm cursor-pointer text-fuchsia-700">
                            Escrever meu próprio
                          </FormLabel>
                      </FormItem>
                       {field.value === "manual" && (
                        <Textarea placeholder="Digite sua legenda aqui..." value={manualCaption} onChange={(e) => setManualCaption(e.target.value)} />
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {suggestedCaptions.length === 0 && selectedPhotoPreview && (
                 <FormItem>
                    <FormLabel htmlFor="manualCaption" className="text-base">Legenda</FormLabel>
                    <FormControl>
                      <Textarea id="manualCaption" placeholder="Escreva uma legenda para sua foto" value={manualCaption} onChange={(e) => setManualCaption(e.target.value)} />
                    </FormControl>
                 </FormItem>
              )}


            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isUploading || !form.getValues("photoFile")?.[0]} className="w-full sm:w-auto">
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                Adicionar Foto
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="shadow-xl animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline"><ImagePlus className="mr-3 h-7 w-7 text-accent" /> Gerenciar Fotos</CardTitle>
          <CardDescription>Veja, edite legendas ou exclua suas fotos enviadas.</CardDescription>
        </CardHeader>
        <CardContent>
          {currentPhotos.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma foto enviada ainda.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {currentPhotos.map(photo => (
                <Card key={photo.id} className="overflow-hidden">
                  <Image src={photo.url} alt={photo.caption || "Foto do casal"} width={300} height={200} className="w-full h-40 object-cover" data-ai-hint={photo.dataAiHint || "foto enviada"}/>
                  <CardContent className="p-3 space-y-2">
                    {editingPhotoId === photo.id ? (
                      <div className="space-y-2">
                        <Textarea 
                          value={editingCaption}
                          onChange={(e) => setEditingCaption(e.target.value)}
                          placeholder="Digite a legenda"
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSaveCaption(photo.id)}>Salvar</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingPhotoId(null)}>Cancelar</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground min-h-[40px]">{photo.caption || "Sem legenda"}</p>
                    )}
                  </CardContent>
                  <CardFooter className="p-3 flex justify-end gap-2 bg-muted/30">
                     {editingPhotoId !== photo.id && (
                        <Button variant="outline" size="sm" onClick={() => handleEditCaption(photo)}>
                          <Edit3 className="mr-1 h-3 w-3" /> Editar
                        </Button>
                      )}
                    <Button variant="destructive" size="sm" onClick={() => handleDeletePhoto(photo.id)}>
                      <Trash2 className="mr-1 h-3 w-3" /> Excluir
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
