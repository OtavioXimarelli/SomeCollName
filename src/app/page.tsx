import './animation-delay.css';
import './uiverse-btn.css';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, GalleryVerticalEnd, Music2, Sparkle } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-fuchsia-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center text-center animate-fade-in">
        <span className="relative flex items-center justify-center mb-8">
          <Heart className="w-24 h-24 sm:w-32 sm:h-32 text-pink-500 animate-pulse drop-shadow-lg" />
          <Sparkle className="absolute -top-4 -right-4 w-8 h-8 text-fuchsia-400 animate-spin-slow" />
        </span>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-headline text-rose-700 font-bold mb-4 drop-shadow-lg">
          Laço Eterno
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl font-body text-rose-500 mb-10 max-w-2xl font-medium">
          Crie sua história de amor digital única. Um espaço privado para guardar memórias, celebrar conquistas e crescer juntos, para sempre.
        </p>
        <button className="uiverse-btn mt-2 mb-8">
          <span className="uiverse-btn-bg">
            <span className="uiverse-btn-bg-layers">
              <span className="uiverse-btn-bg-layer uiverse-btn-bg-layer-1 -purple"></span>
              <span className="uiverse-btn-bg-layer uiverse-btn-bg-layer-2 -turquoise"></span>
              <span className="uiverse-btn-bg-layer uiverse-btn-bg-layer-3 -yellow"></span>
            </span>
          </span>
          <span className="uiverse-btn-inner">
            <span className="uiverse-btn-inner-static">Crie seu Espaço de Casal</span>
            <span className="uiverse-btn-inner-hover">Crie seu Espaço de Casal</span>
          </span>
          <Link href="/couple/our-story/edit" className="absolute inset-0 z-10" tabIndex={-1} aria-label="Crie seu Espaço de Casal"></Link>
        </button>
      </div>

      <div className="mt-24 grid md:grid-cols-3 gap-10 w-full max-w-6xl">
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl animate-fade-in animation-delay-800 hover:scale-105 hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-pink-600 font-bold"><GalleryVerticalEnd className="text-fuchsia-400 w-8 h-8 animate-bounce" /> Galeria Compartilhada</CardTitle>
            <CardDescription className="text-rose-400 font-medium">Preencha seu espaço com fotos que contam sua história de amor única.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-rose-500">Reviva seus momentos favoritos, desde grandes aventuras até noites tranquilas juntos.</p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl animate-fade-in animation-delay-1000 hover:scale-105 hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-pink-600 font-bold"><Heart className="text-pink-400 w-8 h-8 animate-pulse" /> Contador do Amor</CardTitle>
            <CardDescription className="text-rose-400 font-medium">Acompanhe o crescimento do seu amor com um contador marcando sua jornada.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-rose-500">Comemore cada dia, mês e ano do seu lindo relacionamento.</p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl animate-fade-in animation-delay-1200 hover:scale-105 hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-pink-600 font-bold"><Music2 className="text-fuchsia-400 w-8 h-8 animate-spin-slow" /> Nossa Trilha Sonora</CardTitle>
            <CardDescription className="text-rose-400 font-medium">Crie o clima com músicas de fundo que significam algo para vocês.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-rose-500">Monte uma playlist com suas músicas especiais, a trilha sonora do seu amor.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
