"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addPhotoAction, deletePhotoAction, updatePhotoCaptionAction, suggestPhotoCaptionAction } from '@/lib/actions';
import type { Photo } from '@/types';
import { useState } from 'react';
import { ImagePlus, Trash2, Edit, Save, Sparkles, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const photoUploadSchema = z.object({
  photoFile: z.instanceof(FileList).refine(files => files?.length === 1, "É necessário selecionar uma foto."),
  context: z.string().optional(),
  captionChoice: z.string().optional(),
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

interface PhotoUploadFormProps {
  coupleId: string;
  currentPhotos: Photo[];
  onPhotoListChange: (photos: Photo[]) => void;
}

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
      setSuggestedCaptions([]);
      form.setValue('captionChoice', '');
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
        form.setValue('captionChoice', result.captions[0]);
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
      const finalCaption = suggestedCaptions.length > 0 ? data.captionChoice : manualCaption;
      const result = await addPhotoAction(coupleId, { url: `https://placehold.co/400x300.png?text=${encodeURIComponent(photoFile.name)}`, caption: finalCaption || "" });
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
      <Card className="bg-fuchsia-50/30 border-fuchsia-100 p-2">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline text-fuchsia-700"><ImagePlus className="mr-3 h-7 w-7 text-fuchsia-500" /> Adicionar Nova Foto</CardTitle>
          <CardDescription className="text-rose-500">Compartilhe um novo momento. Adicione contexto para melhores sugestões de legenda.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="space-y-2">
                <Label htmlFor="photo-upload" className="text-fuchsia-700 font-semibold">1. Escolha a Foto</Label>
                <Input id="photo-upload" type="file" accept="image/*" {...form.register("photoFile")} onChange={handleFileChange} className="file:text-fuchsia-600 file:font-semibold" />
                <FormMessage>{form.formState.errors.photoFile?.message?.toString()}</FormMessage>
              </div>
              {selectedPhotoPreview && (
                <div className="relative mx-auto border-2 border-fuchsia-200 rounded-xl overflow-hidden shadow-md">
                  <Image src={selectedPhotoPreview} alt="Pré-visualização" width={200} height={200} className="object-cover" />
                </div>
              )}
            </div>
            
            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-fuchsia-700 font-semibold">2. Adicione Contexto (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Nossa viagem para a praia em 2023!" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="button" onClick={handleSuggestCaptions} disabled={isSuggesting || !selectedPhotoPreview} className="gap-2">
              {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Gerar Legendas com IA
            </Button>

            {suggestedCaptions.length > 0 ? (
              <FormField
                control={form.control}
                name="captionChoice"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-fuchsia-700 font-semibold">3. Escolha uma Legenda</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                        {suggestedCaptions.map((caption, i) => (
                          <FormItem key={i} className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value={caption} /></FormControl>
                            <FormLabel className="font-normal text-fuchsia-800">{caption}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div>
                <Label htmlFor="manual-caption" className="text-fuchsia-700 font-semibold">3. Ou Escreva sua Legenda</Label>
                <Textarea id="manual-caption" value={manualCaption} onChange={(e) => setManualCaption(e.target.value)} placeholder="Sua legenda aqui..." />
              </div>
            )}

            <Button type="submit" disabled={isUploading} className="w-full sm:w-auto gap-2">
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar Foto
            </Button>
          </form>
        </Form>
      </Card>

      <Card className="bg-fuchsia-50/30 border-fuchsia-100 p-2">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline text-fuchsia-700"><ImagePlus className="mr-3 h-7 w-7 text-fuchsia-500" /> Gerenciar Fotos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {currentPhotos.map((photo) => (
              <div key={photo.id} className="relative group border-2 border-fuchsia-200 rounded-xl overflow-hidden shadow-md">
                <Image src={photo.url} alt={photo.caption || 'Foto'} width={300} height={300} className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingPhotoId === photo.id ? (
                    <div className="flex flex-col gap-2">
                      <Textarea value={editingCaption} onChange={(e) => setEditingCaption(e.target.value)} className="text-sm" />
                      <Button onClick={() => handleSaveCaption(photo.id)} size="sm" className="gap-1"><Save className="h-3 w-3" /> Salvar</Button>
                      <Button onClick={() => setEditingPhotoId(null)} variant="ghost" size="sm">Cancelar</Button>
                    </div>
                  ) : (
                    <p className="text-white text-sm font-semibold">{photo.caption || "Sem legenda"}</p>
                  )}
                  <div className="flex gap-2 self-end">
                    <Button onClick={() => handleEditCaption(photo)} size="icon" variant="outline" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                    <Button onClick={() => handleDeletePhoto(photo.id)} size="icon" variant="destructive" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
