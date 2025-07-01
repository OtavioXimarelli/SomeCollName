import EditCouplePageClient from '@/components/couple/EditCouplePageClient';
import { getCoupleData } from '@/lib/firestore-service';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const dynamic = 'force-dynamic';

interface CoupleEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function CoupleEditPage({ params }: CoupleEditPageProps) {
  const { id } = await params;
  const coupleData = await getCoupleData(id);

  if (!coupleData) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-headline mb-4">Espaço do Casal Não Encontrado</h1>
        <p className="text-muted-foreground mb-6">O espaço com ID "{id}" não foi encontrado. Verifique se você tem permissão para acessá-lo.</p>
        <Button asChild>
          <Link href="/">Ir para a Página Inicial</Link>
        </Button>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <EditCouplePageClient coupleData={coupleData} />
    </ProtectedRoute>
  );
}
