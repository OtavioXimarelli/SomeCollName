"use client";

import type { Photo } from '@/types';
import Image from 'next/image';
import { ImageIcon, Heart, Calendar, Expand } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PhotoGalleryProps {
  photos: Photo[];
  coupleName?: string;
}

// Utility function to get animation delay class
const getAnimationDelayClass = (index: number): string => {
  const delay = Math.min(index * 100, 1500); // Cap at 1500ms
  return `animate-delay-${delay}`;
};

export default function PhotoGallery({ photos, coupleName }: PhotoGalleryProps) {

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full">
        <h2 className="flex items-center text-lg font-headline text-fuchsia-700 mb-4 gap-2">
          <ImageIcon className="h-6 w-6 text-fuchsia-500" /> Nosso Álbum de Fotos
        </h2>
        <div className="bg-gradient-to-r from-fuchsia-50 to-pink-50 rounded-xl p-8 border-2 border-dashed border-fuchsia-200 text-center">
          <ImageIcon className="h-16 w-16 text-fuchsia-300 mx-auto mb-4" />
          <p className="font-body text-rose-600 text-lg">
            Ainda não há fotos! {coupleName ? `${coupleName}, adicione` : "Adicione"} alguns momentos especiais à sua galeria na seção de edição.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center text-xl font-headline text-fuchsia-700 gap-2">
          <ImageIcon className="h-6 w-6 text-fuchsia-500" /> 
          Nosso Álbum de Fotos
        </h2>
        <Badge variant="secondary" className="bg-fuchsia-100 text-fuchsia-700">
          {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {photos.map((photo, index) => (
          <Dialog key={photo.id}>
            <DialogTrigger asChild>
              <div 
                className={`group relative overflow-hidden rounded-xl border-2 border-fuchsia-100 bg-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover-lift animate-fade-in ${getAnimationDelayClass(index)}`}
              >
                <div className="aspect-square relative">
                  <Image
                    src={photo.url}
                    alt={photo.caption || 'Foto do casal'}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Expand className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Badge variant="secondary" className="bg-white/90 text-fuchsia-700 backdrop-blur-sm">
                      <Heart className="h-3 w-3 mr-1" />
                      Ver
                    </Badge>
                  </div>
                </div>
                {photo.caption && (
                  <div className="p-3 bg-gradient-to-r from-fuchsia-50 to-pink-50 border-t border-fuchsia-100">
                    <p className="text-sm font-medium text-fuchsia-800 line-clamp-2">{photo.caption}</p>
                    {photo.uploadedAt && (
                      <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(parseISO(photo.uploadedAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
              <div className="relative">
                <Image
                  src={photo.url}
                  alt={photo.caption || 'Foto do casal'}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-contain max-h-[80vh]"
                />
                {photo.caption && (
                  <div className="p-6 bg-white">
                    <p className="text-lg text-gray-800 mb-2">{photo.caption}</p>
                    {photo.uploadedAt && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(parseISO(photo.uploadedAt), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
