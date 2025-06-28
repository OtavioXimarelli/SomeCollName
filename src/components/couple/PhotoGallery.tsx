import type { Photo } from '@/types';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

interface PhotoGalleryProps {
  photos: Photo[];
  coupleName?: string;
}

export default function PhotoGallery({ photos, coupleName }: PhotoGalleryProps) {
  if (!photos || photos.length === 0) {
    return (
      <div className="w-full">
        <h2 className="flex items-center text-lg font-headline text-fuchsia-700 mb-4 gap-2">
          <ImageIcon className="h-6 w-6 text-fuchsia-500" /> Nosso Álbum de Fotos
        </h2>
        <p className="font-body text-rose-600 bg-white/80 rounded-lg p-4 border border-fuchsia-100">
          Ainda não há fotos! {coupleName ? `${coupleName}, adicione` : "Adicione"} alguns momentos especiais à sua galeria na seção de edição.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="flex items-center text-lg font-headline text-fuchsia-700 mb-4 gap-2">
        <ImageIcon className="h-6 w-6 text-fuchsia-500" /> Nosso Álbum de Fotos
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {photos.map((photo, index) => (
          <div key={photo.id} className="overflow-hidden rounded-xl border border-fuchsia-100 bg-white/90 shadow-sm">
            <div className="aspect-w-1 aspect-h-1">
              <Image
                src={photo.url}
                alt={photo.caption || 'Foto do casal'}
                width={600}
                height={600}
                className="object-cover w-full h-full"
                data-ai-hint={photo.dataAiHint || "foto do casal"}
              />
            </div>
            {photo.caption && (
              <div className="p-3 bg-fuchsia-50/60">
                <p className="text-xs font-body text-fuchsia-700">{photo.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
