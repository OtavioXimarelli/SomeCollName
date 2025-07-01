import RelationshipCounter from '@/components/couple/RelationshipCounter';
import PhotoGallery from '@/components/couple/PhotoGallery';
import MusicPlayer from '@/components/couple/MusicPlayer';
import { getCoupleData, validateUserCoupleAccess } from '@/lib/firestore-service';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const dynamic = 'force-dynamic';

interface CouplePageProps {
  params: Promise<{ id: string }>;
}

export default async function CouplePage({ params }: CouplePageProps) {
  const { id } = await params;
  
  // Get couple data from Firestore
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
    <ProtectedRoute>
      <CouplePageContent coupleData={coupleData} mainPhoto={mainPhoto} />
    </ProtectedRoute>
  );
}

function CouplePageContent({ coupleData, mainPhoto }: { 
  coupleData: any; 
  mainPhoto: any; 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Main Photo */}
          {mainPhoto && (
            <Card className="overflow-hidden border-2 border-fuchsia-200/50 bg-white/90 shadow-xl rounded-2xl">
              <div className="relative aspect-[4/3] sm:aspect-[16/10] md:aspect-[4/3] max-h-96 sm:max-h-[28rem] overflow-hidden">
                <Image 
                  src={mainPhoto.url} 
                  alt={mainPhoto.caption || 'Foto principal do casal'} 
                  fill
                  className="object-cover" 
                  priority 
                />
              </div>
            </Card>
          )}

          {/* Music Player */}
          <div className="w-full">
            <MusicPlayer playlist={coupleData.playlist} />
          </div>

          {/* Relationship Counter */}
          <Card className="border-2 border-fuchsia-200/50 bg-white/90 shadow-lg rounded-2xl p-6">
            <RelationshipCounter startDate={coupleData.startDate} />
          </Card>

          {/* Photo Gallery */}
          <Card className="border-2 border-fuchsia-200/50 bg-white/90 shadow-lg rounded-2xl p-6">
            <PhotoGallery photos={coupleData.photos} coupleName={coupleData.coupleName} />
          </Card>
          
        </div>
      </div>
    </div>
  );
}
