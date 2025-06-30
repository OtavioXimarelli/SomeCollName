import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

// Performance monitoring utility
export const performanceMonitor = {
  // Track page load times
  measurePageLoad: (pageName: string) => {
    if (typeof window !== 'undefined') {
      const startTime = performance.now();
      
      window.addEventListener('load', () => {
        const loadTime = performance.now() - startTime;
        
        if (analytics) {
          logEvent(analytics, 'page_load_time', {
            page_name: pageName,
            load_time: Math.round(loadTime),
            timestamp: Date.now()
          });
        }
        
        console.log(`Page ${pageName} loaded in ${Math.round(loadTime)}ms`);
      });
    }
  },

  // Track user interactions
  trackInteraction: (action: string, category: string, label?: string) => {
    if (analytics && typeof window !== 'undefined') {
      logEvent(analytics, 'user_interaction', {
        action,
        category,
        label,
        timestamp: Date.now()
      });
    }
  },

  // Track errors
  trackError: (error: Error, context?: string) => {
    if (analytics && typeof window !== 'undefined') {
      logEvent(analytics, 'app_error', {
        error_message: error.message,
        error_stack: error.stack?.substring(0, 500), // Limit stack trace
        context: context || 'unknown',
        timestamp: Date.now()
      });
    }
    
    console.error('Tracked error:', error, context);
  },

  // Track photo upload performance
  trackPhotoUpload: (fileSize: number, uploadTime: number, success: boolean) => {
    if (analytics && typeof window !== 'undefined') {
      logEvent(analytics, 'photo_upload', {
        file_size: fileSize,
        upload_time: uploadTime,
        success,
        timestamp: Date.now()
      });
    }
  },

  // Track Spotify search performance
  trackSpotifySearch: (query: string, resultCount: number, searchTime: number) => {
    if (analytics && typeof window !== 'undefined') {
      logEvent(analytics, 'spotify_search', {
        query_length: query.length,
        result_count: resultCount,
        search_time: searchTime,
        timestamp: Date.now()
      });
    }
  }
};

// Hook for performance monitoring
export const usePerformanceMonitor = () => {
  return {
    trackInteraction: performanceMonitor.trackInteraction,
    trackError: performanceMonitor.trackError,
  };
};

// Image optimization utility
export const imageOptimization = {
  // Generate responsive image sizes
  getResponsiveSizes: (width: number, height: number) => {
    const aspectRatio = width / height;
    
    return {
      thumbnail: { width: 150, height: Math.round(150 / aspectRatio) },
      small: { width: 300, height: Math.round(300 / aspectRatio) },
      medium: { width: 600, height: Math.round(600 / aspectRatio) },
      large: { width: 1200, height: Math.round(1200 / aspectRatio) },
    };
  },

  // Check if image needs compression
  shouldCompress: (file: File): boolean => {
    const maxSize = 2 * 1024 * 1024; // 2MB
    return file.size > maxSize;
  },

  // Get optimal image format
  getOptimalFormat: (file: File): string => {
    if (file.type === 'image/png' && file.size > 1024 * 1024) {
      return 'webp'; // Convert large PNGs to WebP
    }
    return file.type;
  }
};

// Loading states management
export const loadingStates = {
  photo: 'Fazendo upload da foto...',
  spotify: 'Buscando no Spotify...',
  saving: 'Salvando alterações...',
  deleting: 'Excluindo item...',
  loading: 'Carregando...',
  authenticating: 'Fazendo login...',
  generating: 'Gerando sugestões...'
};

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
