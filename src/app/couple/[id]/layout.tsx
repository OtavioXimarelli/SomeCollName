import { Button } from "@/components/ui/button";
import { Home, Settings } from "lucide-react";
import Link from "next/link";

export default async function CouplePageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return (
    <div className="container mx-auto px-4 py-8">
       <nav className="mb-6 flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-2">
        <Button variant="outline" asChild>
          <Link href={`/couple/${id}`}>
            <Home className="mr-2 h-4 w-4" /> Ver Nosso Espaço
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/couple/${id}/edit`}>
            <Settings className="mr-2 h-4 w-4" /> Personalizar
          </Link>
        </Button>
      </nav>
      {children}
    </div>
  );
}
