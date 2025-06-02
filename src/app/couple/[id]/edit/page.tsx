import EditCouplePageClient from '@/components/couple/EditCouplePageClient';
import { getCoupleData, createNewCoupleSpace } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface CoupleEditPageProps {
  params: { id: string };
}

export default async function CoupleEditPage({ params }: CoupleEditPageProps) {
  let coupleData = await getCoupleData(params.id);

  if (!coupleData) {
    // If no data, this might be a new couple space. Create it.
    coupleData = await createNewCoupleSpace(params.id);
    // Fallback if creation also fails or is not desired here
    if(!coupleData) {
       return (
        <div className="text-center py-10">
          <h1 className="text-3xl font-headline mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">Could not load or create couple space data for ID "{params.id}".</p>
          <Button asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      );
    }
  }
  
  return <EditCouplePageClient coupleData={coupleData} />;
}
