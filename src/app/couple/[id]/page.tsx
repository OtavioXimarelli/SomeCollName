import RelationshipCounter from '@/components/couple/RelationshipCounter';
import PhotoGallery from '@/components/couple/PhotoGallery';
import { getCoupleData } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Music2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CouplePageProps {
  params: { id: string };
}

export default async function CouplePage({ params }: CouplePageProps) {
  const coupleData = await getCoupleData(params.id);

  if (!coupleData) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-headline mb-4">Espaço do Casal Não Encontrado</h1>
        <p className="text-muted-foreground mb-6">O espaço com ID "{params.id}" não foi encontrado. Ele pode ter sido movido ou excluído.</p>
      </div>
    );
  }

  const mainPhoto = coupleData.photos?.[0]?.url;
  const mainSong = coupleData.playlist?.[0];

  return (
    <div className="flex justify-center items-center min-h-[90vh] p-2 sm:p-4 bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      <Card className="w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto p-4 sm:p-8 flex flex-col gap-8 rounded-3xl bg-white/90 border-2 border-fuchsia-100 shadow-xl">
        {/* Música favorita (acima da foto) */}
        {mainSong && (
          <div className="rounded-xl border border-fuchsia-200 bg-fuchsia-50/80 p-4 flex items-center gap-3 shadow-sm mb-2">
            <Music2 className="text-fuchsia-500 w-7 h-7" />
            <div className="flex flex-col overflow-hidden">
              <span className="font-headline text-fuchsia-700 text-base truncate font-semibold">{mainSong.title}</span>
              <span className="text-xs text-rose-500 truncate">{mainSong.artist}</span>
              {mainSong.url && (
                <a href={mainSong.url} target="_blank" rel="noopener noreferrer" className="text-xs text-fuchsia-600 underline mt-1">Ouvir</a>
              )}
            </div>
          </div>
        )}
        {/* Foto do casal */}
        {mainPhoto && (
          <div className="rounded-2xl overflow-hidden border-2 border-fuchsia-200 bg-white flex items-center justify-center aspect-[4/5] max-h-96 md:max-h-[32rem] mx-auto shadow-md">
            <Image src={mainPhoto} alt="Foto do casal" width={480} height={600} className="object-cover w-full h-full" />
          </div>
        )}
        {/* Card de tempo de relacionamento */}
        <div className="rounded-xl border-2 border-fuchsia-200 bg-fuchsia-50/60 p-6 shadow-sm">
          <RelationshipCounter startDate={coupleData.startDate} />
        </div>
        {/* Card de álbum de fotos */}
        <div className="rounded-xl border-2 border-fuchsia-200 bg-fuchsia-50/60 p-6 shadow-sm">
          <PhotoGallery photos={coupleData.photos} coupleName={coupleData.coupleName} />
        </div>
      </Card>
    </div>
  );
}
