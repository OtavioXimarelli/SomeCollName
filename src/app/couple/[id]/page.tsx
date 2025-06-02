import RelationshipCounter from '@/components/couple/RelationshipCounter';
import PhotoGallery from '@/components/couple/PhotoGallery';
import MusicPlayer from '@/components/couple/MusicPlayer';
import { getCoupleData } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic'; // Ensure data is fresh, good for mock data that might change

interface CouplePageProps {
  params: { id: string };
}

export default async function CouplePage({ params }: CouplePageProps) {
  const coupleData = await getCoupleData(params.id);

  if (!coupleData) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-headline mb-4">Couple Space Not Found</h1>
        <p className="text-muted-foreground mb-6">The space with ID "{params.id}" couldn't be found. It might have been moved or deleted.</p>
        <Button asChild>
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <Card className="bg-gradient-to-br from-primary/30 to-accent/30 p-8 rounded-xl shadow-xl text-center animate-fade-in">
        <CardHeader>
          <CardTitle className="text-5xl font-headline text-primary-foreground">
            {coupleData.coupleName ? `${coupleData.coupleName}'s Evermore Bond` : "Our Evermore Bond"}
          </CardTitle>
          <CardDescription className="text-xl text-muted-foreground mt-2">
            A special place for our memories, dreams, and journey together.
          </CardDescription>
        </CardHeader>
      </Card>

      <RelationshipCounter startDate={coupleData.startDate} />
      
      <PhotoGallery photos={coupleData.photos} coupleName={coupleData.coupleName} />
      
      {/* MusicPlayer is positioned sticky, so it might overlay content if not careful with layout.
          It's better to place it outside the main flow or ensure enough bottom padding on the page.
          For now, just including it here. It has its own Card styling.
      */}
      <div className="mt-12"> {/* Add some spacing before sticky music player appears to interact */}
         <MusicPlayer playlist={coupleData.playlist} autoplay={false}/>
      </div>
    </div>
  );
}
