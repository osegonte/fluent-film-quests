
// src/hooks/useApi.ts - Updated for production API
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';

// Health Check Hook
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiService.healthCheck(),
    refetchInterval: 30000, // Check every 30 seconds
    retry: 3,
  });
}

// Movies Hooks
export function useMovies(params?: { page?: number; limit?: number; language?: string; difficulty?: string; genre?: string }) {
  return useQuery({
    queryKey: ['movies', params],
    queryFn: () => apiService.getMovies(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMovie(id: string, token?: string) {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: () => apiService.getMovie(id, token),
    enabled: !!id,
  });
}

export function useMovieSearch(query: string) {
  return useQuery({
    queryKey: ['movies', 'search', query],
    queryFn: () => apiService.searchMovies(query),
    enabled: query.length > 2, // Only search if query is 3+ characters
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useFeaturedMovies() {
  return useQuery({
    queryKey: ['movies', 'featured'],
    queryFn: () => apiService.getFeaturedMovies(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Progress Hooks
export function useProgressStats(token: string) {
  return useQuery({
    queryKey: ['progress', 'stats'],
    queryFn: () => apiService.getProgressStats(token),
    enabled: !!token,
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ data, token }: {
      data: { movie_id: string; progress_percentage: number; time_watched: number; vocabulary_learned?: number };
      token: string;
    }) => apiService.updateProgress(data, token),
    onSuccess: () => {
      // Invalidate and refetch progress data
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

// Authentication Hooks
export function useLogin() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => apiService.login(data),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: { email: string; password: string; full_name?: string }) => apiService.register(data),
  });
}

export function useCurrentUser(token: string) {
  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: () => apiService.getCurrentUser(token),
    enabled: !!token,
  });
}

// Subtitles Hook
export function useSubtitles(movieId: string, language = 'en') {
  return useQuery({
    queryKey: ['subtitles', movieId, language],
    queryFn: () => apiService.getSubtitles(movieId, language),
    enabled: !!movieId,
  });
}

// Categories and Languages Hooks
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useLanguages() {
  return useQuery({
    queryKey: ['languages'],
    queryFn: () => apiService.getLanguages(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Connection Status Hook
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  const healthQuery = useHealthCheck();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (healthQuery.isSuccess) {
      setApiStatus('connected');
    } else if (healthQuery.isError) {
      setApiStatus('disconnected');
    } else {
      setApiStatus('checking');
    }
  }, [healthQuery.isSuccess, healthQuery.isError]);

  return {
    isOnline,
    apiStatus,
    isConnected: isOnline && apiStatus === 'connected',
  };
}
