"use client";

import './animation-delay.css';
import './uiverse-btn.css';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, GalleryVerticalEnd, Music2, Sparkles, LogIn, UserPlus, Star, Camera, Users } from "lucide-react";
import Link from "next/link";
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import AuthForm from '@/components/auth/AuthForm';

export default function HomePage() {
  const { user } = useAuth();
  const [showAuthForm, setShowAuthForm] = useState(false);

  if (showAuthForm && !user) {
    return <AuthForm onSuccess={() => setShowAuthForm(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-fuchsia-200/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-rose-200/25 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16 lg:py-24">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Main Icon with floating elements */}
          <div className="relative mb-12 group">
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative flex items-center justify-center">
              <Heart className="w-28 h-28 lg:w-36 lg:h-36 text-pink-500 animate-pulse drop-shadow-2xl" />
              <Sparkles className="absolute -top-6 -right-6 w-10 h-10 text-fuchsia-400 animate-spin" style={{ animationDuration: '8s' }} />
              <Star className="absolute -bottom-4 -left-4 w-8 h-8 text-rose-400 animate-bounce" />
              <Camera className="absolute top-8 left-10 w-6 h-6 text-pink-300 animate-float" />
            </div>
          </div>

          {/* Enhanced Typography */}
          <div className="space-y-8 mb-16">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-headline text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 font-bold leading-tight tracking-tight">
              Laço Eterno
            </h1>
            
            <div className="space-y-4">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-body text-rose-600 font-medium max-w-4xl mx-auto leading-relaxed">
                Crie sua história de amor digital única
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-body text-rose-500/80 max-w-3xl mx-auto leading-relaxed">
                Um espaço privado para guardar memórias, celebrar conquistas e crescer juntos, para sempre.
              </p>
            </div>
          </div>
        
          {/* Enhanced Action Buttons */}
          {user ? (
            <div className="flex flex-col items-center space-y-6">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <button className="relative uiverse-btn transform hover:scale-105 transition-transform duration-300">
                  <span className="uiverse-btn-bg">
                    <span className="uiverse-btn-bg-layers">
                      <span className="uiverse-btn-bg-layer uiverse-btn-bg-layer-1 -purple"></span>
                      <span className="uiverse-btn-bg-layer uiverse-btn-bg-layer-2 -turquoise"></span>
                      <span className="uiverse-btn-bg-layer uiverse-btn-bg-layer-3 -yellow"></span>
                    </span>
                  </span>
                  <span className="uiverse-btn-inner">
                    <span className="uiverse-btn-inner-static">✨ Crie seu Espaço de Casal</span>
                    <span className="uiverse-btn-inner-hover">✨ Crie seu Espaço de Casal</span>
                  </span>
                  <Link href="/couple/our-story/edit" className="absolute inset-0 z-10" tabIndex={-1} aria-label="Crie seu Espaço de Casal"></Link>
                </button>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/60 backdrop-blur-md rounded-full border border-pink-200/50 shadow-lg">
                <Users className="w-5 h-5 text-fuchsia-600" />
                <p className="text-lg text-fuchsia-700 font-medium">
                  Bem-vindo de volta, {user.displayName || 'usuário'}! ✨
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <Button 
                onClick={() => setShowAuthForm(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white px-10 py-4 text-xl font-semibold rounded-full shadow-2xl hover:shadow-pink-500/25 transform hover:scale-105 transition-all duration-300 border-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <LogIn className="mr-3 h-6 w-6" />
                Entrar
              </Button>
              <Button 
                onClick={() => setShowAuthForm(true)}
                variant="outline"
                className="group px-10 py-4 text-xl font-semibold rounded-full border-3 border-fuchsia-400/60 text-fuchsia-700 hover:bg-gradient-to-r hover:from-fuchsia-50 hover:to-pink-50 shadow-xl hover:shadow-fuchsia-500/20 transform hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              >
                <UserPlus className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                Criar Conta
              </Button>
            </div>
          )}
        </div>

        {/* Enhanced Feature Cards Grid */}
        <div className="mt-32 grid lg:grid-cols-3 gap-8 lg:gap-12 w-full max-w-7xl mx-auto">
          <Card className="group relative bg-white/70 backdrop-blur-xl border-0 rounded-3xl shadow-2xl hover:shadow-pink-500/20 animate-fade-in animation-delay-800 hover:scale-105 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <GalleryVerticalEnd className="text-white w-8 h-8" />
                </div>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <CardTitle className="text-2xl lg:text-3xl text-pink-700 font-bold leading-tight">
                Galeria Compartilhada
              </CardTitle>
              <CardDescription className="text-lg text-rose-500 font-medium mt-2">
                Preencha seu espaço com fotos que contam sua história de amor única.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
              <p className="text-rose-600 leading-relaxed text-lg">
                Reviva seus momentos favoritos, desde grandes aventuras até noites tranquilas juntos. 
                Upload seguro com Firebase Storage e AI para sugestões de legendas.
              </p>
            </CardContent>
          </Card>
          
          <Card className="group relative bg-white/70 backdrop-blur-xl border-0 rounded-3xl shadow-2xl hover:shadow-rose-500/20 animate-fade-in animation-delay-1000 hover:scale-105 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Heart className="text-white w-8 h-8" />
                </div>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <CardTitle className="text-2xl lg:text-3xl text-pink-700 font-bold leading-tight">
                Contador do Amor
              </CardTitle>
              <CardDescription className="text-lg text-rose-500 font-medium mt-2">
                Acompanhe o crescimento do seu amor com um contador marcando sua jornada.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
              <p className="text-rose-600 leading-relaxed text-lg">
                Comemore cada dia, mês e ano do seu lindo relacionamento com estatísticas especiais 
                e marcos importantes da sua história juntos.
              </p>
            </CardContent>
          </Card>
          
          <Card className="group relative bg-white/70 backdrop-blur-xl border-0 rounded-3xl shadow-2xl hover:shadow-fuchsia-500/20 animate-fade-in animation-delay-1200 hover:scale-105 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Music2 className="text-white w-8 h-8" />
                </div>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <CardTitle className="text-2xl lg:text-3xl text-pink-700 font-bold leading-tight">
                Trilha Sonora do Spotify
              </CardTitle>
              <CardDescription className="text-lg text-rose-500 font-medium mt-2">
                Busque e adicione suas músicas favoritas diretamente do Spotify.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
              <p className="text-rose-600 leading-relaxed text-lg">
                Monte uma playlist colaborativa com suas músicas especiais usando a integração 
                completa com Spotify e compartilhe a trilha sonora do seu amor.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
