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
    // Se não houver dados, pode ser um novo espaço de casal. Crie-o.
    coupleData = await createNewCoupleSpace(params.id);
    // Fallback se a criação também falhar ou não for desejada aqui
    if(!coupleData) {
       return (
        <div className="text-center py-10">
          <h1 className="text-3xl font-headline mb-4">Erro</h1>
          <p className="text-muted-foreground mb-6">Não foi possível carregar ou criar os dados do espaço do casal para o ID "{params.id}".</p>
          <Button asChild>
            <Link href="/">Ir para a Página Inicial</Link>
          </Button>
        </div>
      );
    }
  }
  
  return <EditCouplePageClient coupleData={coupleData} />;
}
