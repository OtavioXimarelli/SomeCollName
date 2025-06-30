"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';

export default function AppHeader() {
  const { user, logout } = useAuth();

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-rose-300 shadow-lg border-b-2 border-fuchsia-200 animate-fade-in">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-center sm:justify-between items-center">
        <Link href="/" className="text-3xl font-headline text-white drop-shadow-lg hover:opacity-90 transition-opacity">
          Laço Eterno
        </Link>
        
        {user && (
          <div className="mt-4 sm:mt-0 flex items-center gap-4">
            <span className="hidden sm:inline text-white/90 font-medium">
              Olá, {user.displayName || 'Usuário'}!
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10">
                  <Avatar className="h-10 w-10 border-2 border-white/30">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback className="bg-fuchsia-500 text-white font-semibold">
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
