"use client";

import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();

  if (loading || (user && !userProfile)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500 mx-auto mb-4" />
          <p className="text-fuchsia-700 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return fallback || <AuthForm />;
  }

  return <>{children}</>;
}
