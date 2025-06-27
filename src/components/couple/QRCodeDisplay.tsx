"use client";

import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode } from 'lucide-react';

interface QRCodeDisplayProps {
  couplePageId: string;
}

export default function QRCodeDisplay({ couplePageId }: QRCodeDisplayProps) {
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    // Garante que roda apenas no client, onde window está disponível
    if (typeof window !== 'undefined') {
      setPageUrl(`${window.location.origin}/couple/${couplePageId}`);
    }
  }, [couplePageId]);

  if (!pageUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-fuchsia-700"><QrCode className="mr-2 h-5 w-5 text-fuchsia-500" /> Compartilhe seu Espaço</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Gerando QR Code...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-headline text-fuchsia-700">
          <QrCode className="mr-2 h-6 w-6 text-fuchsia-500" /> Compartilhe seu Espaço
        </CardTitle>
        <CardDescription>
          Escaneie este QR code para acessar facilmente a página do casal.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="bg-white p-4 rounded-lg shadow-inner inline-block">
          <QRCode value={pageUrl} size={192} level="H" />
        </div>
        <p className="mt-4 text-sm text-rose-500 break-all">
          Ou compartilhe este link: <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="text-fuchsia-700 hover:underline">{pageUrl}</a>
        </p>
      </CardContent>
    </Card>
  );
}
