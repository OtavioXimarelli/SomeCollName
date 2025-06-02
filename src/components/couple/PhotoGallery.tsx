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
      <Card className="shadow-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline text-primary-foreground">
            <ImageIcon className="mr-3 h-8 w-8 text-accent" /> Our Photo Album
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground font-body">
            No photos yet! {coupleName ? `${coupleName}, add` : "Add"} some cherished moments to your gallery in the edit section.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-headline text-primary-foreground mb-6 flex items-center">
        <ImageIcon className="mr-3 h-8 w-8 text-accent" /> Our Photo Album
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos.map((photo, index) => (
          <Card key={photo.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
            <CardContent className="p-0">
              <div className="aspect-w-1 aspect-h-1"> {/* For square aspect ratio, adjust as needed */}
                 <Image
                    src={photo.url}
                    alt={photo.caption || 'Couple photo'}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                    data-ai-hint={photo.dataAiHint || "couple photo"}
                  />
              </div>
            </CardContent>
            {photo.caption && (
              <CardFooter className="p-4 bg-background/80">
                <p className="text-sm font-body text-foreground">{photo.caption}</p>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
