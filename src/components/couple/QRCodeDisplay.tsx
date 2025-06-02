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
    // Ensure this runs only on the client where window is available
    if (typeof window !== 'undefined') {
      setPageUrl(`${window.location.origin}/couple/${couplePageId}`);
    }
  }, [couplePageId]);

  if (!pageUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><QrCode className="mr-2 h-5 w-5 text-accent" /> Share Your Space</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Generating QR Code...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-headline">
          <QrCode className="mr-2 h-6 w-6 text-accent" /> Share Your Space
        </CardTitle>
        <CardDescription>
          Scan this QR code to easily access your couple's page.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="bg-white p-4 rounded-lg shadow-inner inline-block">
          <QRCode value={pageUrl} size={192} level="H" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground break-all">
          Or share this link: <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{pageUrl}</a>
        </p>
      </CardContent>
    </Card>
  );
}
