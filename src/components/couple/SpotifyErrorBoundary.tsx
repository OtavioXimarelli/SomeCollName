"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface SpotifyErrorBoundaryProps {
  children: React.ReactNode;
}

interface SpotifyErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SpotifyErrorBoundary extends React.Component<
  SpotifyErrorBoundaryProps,
  SpotifyErrorBoundaryState
> {
  constructor(props: SpotifyErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SpotifyErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Spotify component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-2">
              <p className="font-semibold">Erro na integração com Spotify</p>
              <p className="text-sm">
                Houve um problema ao carregar a busca de músicas. Verifique sua conexão e tente novamente.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Tentar Novamente
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
