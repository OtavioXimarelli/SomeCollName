import Link from 'next/link';

export default function AppHeader() {
  return (
    <header className="bg-primary/20 shadow-md animate-fade-in">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-center sm:justify-between items-center">
        <Link href="/" className="text-3xl font-headline text-primary-foreground hover:opacity-80 transition-opacity">
          Evermore Bond
        </Link>
        {/* Navigation items can be added here if needed */}
      </div>
    </header>
  );
}
