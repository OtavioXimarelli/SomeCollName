import Link from 'next/link';

export default function AppHeader() {
  return (
    <header className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-rose-300 shadow-lg border-b-2 border-fuchsia-200 animate-fade-in">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-center sm:justify-between items-center">
        <Link href="/" className="text-3xl font-headline text-white drop-shadow-lg hover:opacity-90 transition-opacity">
          Laço Eterno
        </Link>
        {/* Navigation items can be added here if needed */}
      </div>
    </header>
  );
}
