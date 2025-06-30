"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { LogOut, User, Heart, Sparkles, Settings } from 'lucide-react';

export default function AppHeader() {
  const { user, logout } = useAuth();

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-pink-200/30 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <Link href="/" className="group flex items-center space-x-3 transition-all duration-300 hover:scale-105">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 opacity-0 blur transition-opacity duration-300 group-hover:opacity-30"></div>
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 shadow-lg">
              <Heart className="w-6 h-6 text-white" />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-2xl lg:text-3xl font-headline font-bold bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
              Laço Eterno
            </h1>
          </div>
        </Link>
        
        {/* User Section */}
        {user ? (
          <div className="flex items-center space-x-4">
            {/* Welcome Message - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-3 px-4 py-2 rounded-full bg-gradient-to-r from-pink-50 to-fuchsia-50 border border-pink-200/50">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm font-medium text-pink-700">
                Olá, {user.displayName?.split(' ')[0] || 'Usuário'}!
              </span>
            </div>

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="group relative h-12 w-12 rounded-full p-0 ring-2 ring-transparent transition-all duration-300 hover:ring-pink-300/50 hover:ring-offset-2 hover:ring-offset-white/50"
                >
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 opacity-0 blur transition-opacity duration-300 group-hover:opacity-20"></div>
                  <Avatar className="relative h-12 w-12 border-2 border-pink-200/50 transition-all duration-300 group-hover:border-pink-300">
                    <AvatarImage 
                      src={user.photoURL || undefined} 
                      alt={user.displayName || 'User'} 
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-bold text-lg">
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-72 mt-2 p-2 bg-white/95 backdrop-blur-xl border border-pink-200/50 shadow-2xl" 
                align="end" 
                forceMount
              >
                {/* User Info Header */}
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-pink-50 to-fuchsia-50 mb-2">
                  <Avatar className="h-12 w-12 border-2 border-pink-200">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback className="bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-bold">
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-pink-700 truncate">
                      {user.displayName || 'Usuário'}
                    </p>
                    <p className="text-xs text-pink-600/70 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <DropdownMenuSeparator className="bg-pink-200/50" />

                {/* Menu Items */}
                <DropdownMenuItem className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-pink-50 focus:bg-pink-50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100">
                    <User className="h-4 w-4 text-pink-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Meu Perfil</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-pink-50 focus:bg-pink-50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-fuchsia-100">
                    <Settings className="h-4 w-4 text-fuchsia-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Configurações</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-pink-200/50" />

                <DropdownMenuItem 
                  className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-red-50 focus:bg-red-50 text-red-600"
                  onClick={logout}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                    <LogOut className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="text-sm font-medium">Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          /* Login/Register buttons for non-authenticated users */
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost"
              className="hidden sm:inline-flex text-pink-700 hover:text-pink-800 hover:bg-pink-50 font-medium transition-all duration-300"
            >
              Entrar
            </Button>
            <Button 
              className="bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white shadow-lg hover:shadow-pink-500/25 transition-all duration-300 font-medium px-6"
            >
              Criar Conta
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
