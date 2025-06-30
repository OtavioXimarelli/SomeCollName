"use client";

import { Heart, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export default function Loading({ message = "Carregando...", fullScreen = false }: LoadingProps) {
  const containerClass = fullScreen 
    ? "fixed inset-0 flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 z-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClass}>
      <Card className="p-8 bg-white/90 backdrop-blur-sm border-2 border-fuchsia-100 shadow-xl rounded-3xl text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Heart className="w-12 h-12 text-pink-500 animate-pulse" />
            <Loader2 className="w-6 h-6 text-fuchsia-500 animate-spin absolute -bottom-1 -right-1" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-fuchsia-700">{message}</p>
            <p className="text-sm text-rose-500">Preparando algo especial para vocês...</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
