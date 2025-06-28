"use client";

import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Music2 } from 'lucide-react';
import Image from 'next/image';

interface QRCodeDisplayProps {
  couplePageId: string;
  couplePhotoUrl?: string;
  musicTitle?: string;
  musicArtist?: string;
  musicUrl?: string;
}

export default function QRCodeDisplay({ couplePageId, couplePhotoUrl, musicTitle, musicArtist, musicUrl }: QRCodeDisplayProps) {
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    // Garante que roda apenas no client, onde window está disponível
    if (typeof window !== 'undefined') {
      setPageUrl(`${window.location.origin}/couple/${couplePageId}`);
    }
  }, [couplePageId]);

  if (!pageUrl) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] p-4">
        <Card className="w-full max-w-md mx-auto p-4">
          <CardHeader>
            <CardTitle className="flex items-center text-fuchsia-700"><QrCode className="mr-2 h-5 w-5 text-fuchsia-500" /> Compartilhe seu Espaço</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Gerando QR Code...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-2 sm:p-4">
      <Card className="w-full max-w-md mx-auto p-4 flex flex-col gap-6">
        {/* Foto do casal, se houver */}
        {couplePhotoUrl && (
          <div className="rounded-2xl overflow-hidden border border-pink-200 bg-white/80 flex items-center justify-center aspect-[4/5] max-h-80 mx-auto">
            <Image src={couplePhotoUrl} alt="Foto do casal" width={320} height={400} className="object-cover w-full h-full" />
          </div>
        )}
        {/* Card de música, se houver */}
        {musicTitle && musicArtist && (
          <div className="rounded-xl border border-fuchsia-200 bg-fuchsia-50/80 p-4 flex items-center gap-3 shadow-sm">
            <Music2 className="text-fuchsia-500 w-7 h-7" />
            <div className="flex flex-col overflow-hidden">
              <span className="font-headline text-fuchsia-700 text-base truncate">{musicTitle}</span>
              <span className="text-xs text-rose-500 truncate">{musicArtist}</span>
              {musicUrl && (
                <a href={musicUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-fuchsia-600 underline mt-1">Ouvir</a>
              )}
            </div>
          </div>
        )}
        {/* QR Code e link */}
        <div className="flex flex-col items-center gap-3">
          <div className="bg-white p-4 rounded-lg shadow-inner inline-block">
            <QRCode value={pageUrl} size={192} level="H" />
          </div>
          <p className="mt-2 text-sm text-rose-500 break-all text-center">
            Ou compartilhe este link: <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="text-fuchsia-700 hover:underline">{pageUrl}</a>
          </p>
        </div>
      </Card>
    </div>
  );
}
