import RelationshipCounter from '@/components/couple/RelationshipCounter';
import PhotoGallery from '@/components/couple/PhotoGallery';
import MusicPlayer from '@/components/couple/MusicPlayer';
import { getCoupleData } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

interface CouplePageProps {
  params: Promise<{ id: string }>;
}

export default async function CouplePage({ params }: CouplePageProps) {
  const { id } = await params;
  const coupleData = await getCoupleData(id);

  if (!coupleData) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-headline mb-4">Espaço do Casal Não Encontrado</h1>
        <p className="text-muted-foreground mb-6">O espaço com ID "{id}" não foi encontrado. Ele pode ter sido movido ou excluído.</p>
      </div>
    );
  }

  const mainPhoto = coupleData.photos?.[0];

  return (
    <div className="flex justify-center items-start min-h-screen p-2 sm:p-4 bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      <Card className="w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-8 rounded-3xl bg-white/90 border-2 border-fuchsia-100 shadow-xl my-8">
        
        {/* Main Photo */}
        {mainPhoto && (
          <div className="rounded-2xl overflow-hidden border-2 border-fuchsia-200 bg-white flex items-center justify-center aspect-[4/5] max-h-96 md:max-h-[32rem] mx-auto shadow-lg w-full">
            <Image src={mainPhoto.url} alt={mainPhoto.caption || 'Foto principal do casal'} width={480} height={600} className="object-cover w-full h-full" priority />
          </div>
        )}

        {/* Spotify Music Player */}
        <MusicPlayer playlist={coupleData.playlist} />

        {/* Relationship Counter */}
        <div className="rounded-xl border-2 border-fuchsia-200 bg-fuchsia-50/60 p-6 shadow-sm">
          <RelationshipCounter startDate={coupleData.startDate} />
        </div>

        {/* Photo Album */}
        <div className="rounded-xl border-2 border-fuchsia-200 bg-fuchsia-50/60 p-6 shadow-sm">
          <PhotoGallery photos={coupleData.photos} coupleName={coupleData.coupleName} />
        </div>
      </Card>
    </div>
  );
}
