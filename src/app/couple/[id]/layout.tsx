import { Button } from "@/components/ui/button";
import { Home, Settings, Heart, ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      {/* Enhanced Navigation Header */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-xl border-b border-pink-200/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between py-4">
            {/* Back to Home */}
            <Link 
              href="/"
              className="group flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-50 to-fuchsia-50 border border-pink-200/50 hover:border-pink-300/50 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 text-pink-600 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="text-sm font-medium text-pink-700">Voltar</span>
            </Link>

            {/* Couple Space Title */}
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
              <h2 className="text-xl font-headline font-bold bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
                Nosso Espaço
              </h2>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                asChild
                className="group relative overflow-hidden border-pink-300/60 text-pink-700 hover:text-white hover:border-pink-500 transition-all duration-300"
              >
                <Link href={`/couple/${id}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-fuchsia-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <Home className="mr-2 h-4 w-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  <span className="relative z-10">Ver</span>
                </Link>
              </Button>
              <Button 
                size="sm"
                asChild
                className="group relative overflow-hidden bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
              >
                <Link href={`/couple/${id}/edit`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <Settings className="mr-2 h-4 w-4 relative z-10 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="relative z-10">Personalizar</span>
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
