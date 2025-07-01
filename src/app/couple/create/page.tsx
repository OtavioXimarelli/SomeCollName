"use client";

import { useAuth } from '@/contexts/AuthContext';
import CoupleManager from '@/components/couple/CoupleManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CreateCouplePage() {
  const { user, userProfile, loading } = useAuth();

  // Show loading while auth and userProfile are loading
  if (loading || (user && !userProfile)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500 mx-auto"></div>
          <p className="text-fuchsia-700 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // If no user, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-fuchsia-700">Acesso Restrito</CardTitle>
            <CardDescription>Você precisa estar logado para criar um espaço de casal.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button className="bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If authenticated, render the couple creation form
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-fuchsia-700 hover:text-fuchsia-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
        </div>
        
        <Card className="shadow-lg border-fuchsia-100">
          <CardHeader className="text-center bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white rounded-t-lg">
            <div className="flex items-center justify-center mb-2">
              <Heart className="w-8 h-8 mr-2" />
            </div>
            <CardTitle className="text-3xl font-bold">Criar Espaço do Casal</CardTitle>
            <CardDescription className="text-pink-100">
              Comece sua jornada juntos criando um espaço único para vocês dois
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <CoupleManager />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
