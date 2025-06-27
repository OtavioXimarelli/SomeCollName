import RelationshipCounter from '@/components/couple/RelationshipCounter';
import PhotoGallery from '@/components/couple/PhotoGallery';
import MusicPlayer from '@/components/couple/MusicPlayer';
import { getCoupleData } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic'; // Garante dados atualizados, útil para dados mockados

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
        <Button asChild>
          <Link href="/">Ir para a Página Inicial</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <Card className="bg-gradient-to-br from-primary/30 to-accent/30 p-8 rounded-xl shadow-xl text-center animate-fade-in">
        <CardHeader>
          <CardTitle className="text-5xl font-headline text-primary-foreground">
            {coupleData.coupleName ? `Laço Eterno de ${coupleData.coupleName}` : "Nosso Laço Eterno"}
          </CardTitle>
          <CardDescription className="text-xl text-muted-foreground mt-2">
            Um lugar especial para nossas memórias, sonhos e jornada juntos.
          </CardDescription>
        </CardHeader>
      </Card>

      <RelationshipCounter startDate={coupleData.startDate} />
      
      <PhotoGallery photos={coupleData.photos} coupleName={coupleData.coupleName} />
      
      {/* MusicPlayer é posicionado como sticky, pode sobrepor conteúdo se não houver cuidado com o layout.
          Melhor posicioná-lo fora do fluxo principal ou garantir padding inferior suficiente na página.
          Por enquanto, apenas incluindo aqui. Possui estilização própria com Card.
      */}
      <div className="mt-12"> {/* Adiciona um espaçamento antes do player de música sticky aparecer para interação */}
         <MusicPlayer playlist={coupleData.playlist} autoplay={false}/>
      </div>
    </div>
  );
}
