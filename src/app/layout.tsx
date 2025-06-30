import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppHeader from '@/components/layout/AppHeader';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export const metadata: Metadata = {
  title: 'Laço Eterno - Sua História de Amor Digital',
  description: 'Crie sua história de amor digital única. Um espaço privado para guardar memórias, celebrar conquistas e crescer juntos, para sempre.',
  keywords: ['amor', 'casal', 'relacionamento', 'memórias', 'fotos', 'música', 'spotify'],
  authors: [{ name: 'Laço Eterno' }],
  creator: 'Laço Eterno',
  publisher: 'Laço Eterno',
  openGraph: {
    title: 'Laço Eterno - Sua História de Amor Digital',
    description: 'Crie sua história de amor digital única. Um espaço privado para guardar memórias, celebrar conquistas e crescer juntos.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Laço Eterno - Sua História de Amor Digital',
    description: 'Crie sua história de amor digital única. Um espaço privado para guardar memórias, celebrar conquistas e crescer juntos.',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" 
          rel="stylesheet" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Belleza&display=swap" 
          rel="stylesheet" 
        />
        <meta name="theme-color" content="#ec4899" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-gradient-to-br from-pink-50/50 via-rose-50/50 to-fuchsia-50/50">
        <ErrorBoundary>
          <AuthProvider>
            <AppHeader />
            <main className="flex-grow relative">
              {children}
            </main>
            <Toaster />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
