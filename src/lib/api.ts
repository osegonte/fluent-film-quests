
// src/lib/api.ts - Updated to work with production CineFluent API

const API_BASE = 'https://cinefluent-api-production.up.railway.app/api/v1';

export interface Movie {
  id: string;
  title: string;
  description: string;
  duration: number;
  release_year: number;
  difficulty_level: string;
  languages: string[];
  genres: string[];
  thumbnail_url: string;
  video_url?: string;
  is_premium: boolean;
  vocabulary_count: number;
  imdb_rating?: number;
}

export interface MovieResponse {
  movies: Movie[];
  total: number;
  page: number;
  per_page: number;
}

export interface UserProgress {
  user_id: string;
  movie_id: string;
  progress_percentage: number;
  time_watched: number;
  vocabulary_learned: number;
  last_watched_at: string | null;
}

export interface ProgressUpdate {
  movie_id: string;
  progress_percentage: number;
  time_watched: number;
  vocabulary_learned?: number;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  message: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  full_name?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Health check - updated to use correct endpoint
  async healthCheck() {
    return this.request<{ status: string; service: string; message: string }>('/health');
  }

  // Authentication API
  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(token: string) {
    return this.request<{ user: any; profile: any }>('/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async logout(token: string): Promise<void> {
    await this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Movies API
  async getMovies(params?: {
    page?: number;
    limit?: number;
    language?: string;
    difficulty?: string;
    genre?: string;
  }): Promise<MovieResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.language) searchParams.append('language', params.language);
    if (params?.difficulty) searchParams.append('difficulty', params.difficulty);
    if (params?.genre) searchParams.append('genre', params.genre);

    const query = searchParams.toString();
    return this.request<MovieResponse>(`/movies${query ? `?${query}` : ''}`);
  }

  async getMovie(movieId: string, token?: string): Promise<{ movie: Movie; user_progress?: UserProgress }> {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return this.request<{ movie: Movie; user_progress?: UserProgress }>(`/movies/${movieId}`, {
      headers,
    });
  }

  async searchMovies(query: string, limit = 10) {
    return this.request<{ movies: Movie[]; query: string; total: number }>(
      `/movies/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  async getFeaturedMovies() {
    return this.request<{ movies: Movie[] }>('/movies/featured');
  }

  // Progress API
  async getUserProgress(userId: string) {
    return this.request<{ progress: UserProgress[] }>(`/users/${userId}/progress`);
  }

  async updateProgress(data: ProgressUpdate, token: string) {
    return this.request<{ message: string; progress: UserProgress }>(
      '/progress/update',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );
  }

  async getProgressStats(token: string) {
    return this.request<{
      total_movies_watched: number;
      completed_movies: number;
      total_time_watched: number;
      total_vocabulary_learned: number;
      average_progress: number;
      recent_activity: any[];
    }>('/progress/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Subtitles API
  async getSubtitles(movieId: string, language = 'en') {
    return this.request<{
      subtitles: Array<{
        id: string;
        movie_id: string;
        language: string;
        title: string;
        file_type: string;
        total_cues: number;
        total_segments: number;
        duration: number;
        vocabulary_count: number;
        created_at: string;
      }>;
      total: number;
    }>(`/subtitles/movie/${movieId}?language=${language}`);
  }

  // Categories API
  async getCategories() {
    return this.request<{
      categories: Array<{ 
        id: string; 
        name: string; 
        description: string;
        sort_order: number;
      }>;
    }>('/categories');
  }

  // Languages API
  async getLanguages() {
    return this.request<{
      languages: string[];
    }>('/languages');
  }
}

export const apiService = new ApiService();
