import type { Photo } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';

interface PhotoGalleryProps {
  photos: Photo[];
  coupleName?: string;
}

export default function PhotoGallery({ photos, coupleName }: PhotoGalleryProps) {
  if (!photos || photos.length === 0) {
    return (
      <Card className="">
        <CardHeader>
          <CardTitle className="">
            <ImageIcon className="mr-3 h-8 w-8 text-fuchsia-500" /> Nosso Álbum de Fotos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-body text-rose-600">
            Ainda não há fotos! {coupleName ? `${coupleName}, adicione` : "Adicione"} alguns momentos especiais à sua galeria na seção de edição.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-headline text-fuchsia-700 mb-6 flex items-center">
        <ImageIcon className="mr-3 h-8 w-8 text-fuchsia-500" /> Nosso Álbum de Fotos
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos.map((photo, index) => (
          <Card key={photo.id} className="" style={{animationDelay: `${index * 100}ms`}}>
            <CardContent className="p-0">
              <div className="aspect-w-1 aspect-h-1"> {/* Para proporção quadrada, ajuste se necessário */}
                 <Image
                    src={photo.url}
                    alt={photo.caption || 'Foto do casal'}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                    data-ai-hint={photo.dataAiHint || "foto do casal"}
                  />
              </div>
            </CardContent>
            {photo.caption && (
              <CardFooter className="p-4 bg-white/80">
                <p className="text-sm font-body text-fuchsia-700">{photo.caption}</p>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
