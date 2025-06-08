
# CineFluent API Specifications

This document defines all REST API endpoints, request/response formats, and data structures for the CineFluent backend.

## Base Configuration

- **Base URL**: `/api/v1`
- **Authentication**: JWT Bearer tokens
- **Content-Type**: `application/json`
- **Rate Limiting**: 1000 requests/hour per user

## Authentication Endpoints

### POST /auth/register
Register a new user account.

```typescript
interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
  fullName?: string;
  nativeLanguage?: string;
}

interface RegisterResponse {
  user: User;
  session: Session;
  message: string;
}
```

### POST /auth/login
Authenticate existing user.

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  session: Session;
  expiresAt: string;
}
```

### POST /auth/google
Google OAuth authentication.

```typescript
interface GoogleAuthRequest {
  idToken: string;
}

interface GoogleAuthResponse {
  user: User;
  session: Session;
  isNewUser: boolean;
}
```

### GET /auth/me
Get current user profile.

```typescript
interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  nativeLanguage: string;
  targetLanguages: string[];
  subscriptionTier: 'free' | 'premium' | 'pro';
  streakCount: number;
  totalPoints: number;
  dailyGoal: number;
  createdAt: string;
  lastActiveAt: string;
}
```

### POST /auth/logout
Invalidate current session.

```typescript
interface LogoutResponse {
  message: string;
}
```

## Content Management Endpoints

### GET /movies
Retrieve movies with filtering and pagination.

```typescript
interface MoviesQuery {
  search?: string;
  languages?: string[];
  genres?: string[];
  difficulty?: string[];
  isPremium?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'popularity' | 'rating' | 'recent' | 'alphabetical';
}

interface MoviesResponse {
  movies: Movie[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    languages: string[];
    genres: string[];
    difficulties: string[];
  };
}

interface Movie {
  id: string;
  title: string;
  originalTitle: string;
  description: string;
  releaseDate: string;
  duration: number;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  rating: number;
  ageRating: string;
  genres: string[];
  availableLanguages: string[];
  difficultyLevels: Record<string, string>;
  isPremium: boolean;
  popularityScore: number;
}
```

### GET /movies/:id
Get detailed movie information.

```typescript
interface MovieDetail extends Movie {
  lessons: MovieLesson[];
  userProgress?: UserMovieProgress;
  isBookmarked: boolean;
  vocabularyCount: number;
  estimatedLearningTime: number;
}

interface MovieLesson {
  id: string;
  movieId: string;
  language: string;
  difficultyLevel: string;
  lessonOrder: number;
  title: string;
  description: string;
  videoUrl: string;
  vocabularyCount: number;
  estimatedDuration: number;
  learningObjectives: string[];
  isPremium: boolean;
}
```

### GET /movies/:id/lessons
Get lessons for a specific movie.

```typescript
interface LessonQuery {
  language: string;
  difficulty?: string;
}

interface LessonResponse {
  lessons: MovieLesson[];
  totalDuration: number;
  vocabularyCount: number;
  userProgress: LessonProgress[];
}
```

### GET /lessons/:id
Get detailed lesson content.

```typescript
interface LessonDetail {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  subtitles: Subtitle[];
  vocabulary: VocabularyItem[];
  learningObjectives: string[];
  userProgress: LessonProgress;
  nextLesson?: string;
  previousLesson?: string;
}

interface Subtitle {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  translation?: string;
  difficultyWords: string[];
  contextNotes?: string;
}

interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  pronunciation?: string;
  partOfSpeech: string;
  difficultyLevel: string;
  exampleSentence: string;
  audioUrl?: string;
  userProgress?: VocabularyProgress;
}
```

### GET /movies/search
Search movies by query.

```typescript
interface SearchQuery {
  q: string;
  language?: string;
  limit?: number;
}

interface SearchResponse {
  movies: Movie[];
  query: string;
  total: number;
  suggestions: string[];
}
```

### GET /movies/featured
Get featured/recommended movies.

```typescript
interface FeaturedResponse {
  movies: Movie[];
  categories: Array<{
    name: string;
    movies: Movie[];
  }>;
}
```

## Progress Tracking Endpoints

### GET /progress/stats
Get user learning statistics.

```typescript
interface ProgressStats {
  currentStreak: number;
  longestStreak: number;
  totalLessonsCompleted: number;
  totalTimeSpent: number; // in seconds
  wordsLearned: number;
  pointsEarned: number;
  weeklyGoalProgress: {
    target: number;
    completed: number;
    percentage: number;
  };
  dailyActivity: Array<{
    date: string;
    lessonsCompleted: number;
    timeSpent: number;
    pointsEarned: number;
  }>;
  languageProgress: Array<{
    language: string;
    level: string;
    wordsLearned: number;
    lessonsCompleted: number;
  }>;
}
```

### POST /progress/update
Update lesson progress.

```typescript
interface ProgressUpdate {
  lessonId: string;
  progressPercentage: number;
  timeSpent: number;
  currentPosition: number;
  vocabularyLearned?: string[];
  quizResults?: Record<string, any>;
}

interface ProgressUpdateResponse {
  message: string;
  pointsEarned: number;
  newAchievements: string[];
  streakUpdated: boolean;
}
```

### GET /progress/history
Get user's learning history.

```typescript
interface ProgressHistory {
  lessons: Array<{
    lesson: MovieLesson;
    movie: Movie;
    progress: number;
    completedAt?: string;
    timeSpent: number;
    vocabularyLearned: number;
  }>;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}
```

### GET /progress/vocabulary
Get vocabulary learning progress.

```typescript
interface VocabularyProgressResponse {
  words: Array<{
    vocabulary: VocabularyItem;
    masteryLevel: number;
    timesReviewed: number;
    accuracy: number;
    nextReviewAt: string;
    source: string; // movie/lesson where learned
  }>;
  summary: {
    totalWords: number;
    masteredWords: number;
    reviewingWords: number;
    newWords: number;
  };
}
```

## Social Features Endpoints

### GET /community/posts
Get community posts with filtering.

```typescript
interface CommunityQuery {
  language?: string;
  movieId?: string;
  postType?: string;
  page?: number;
  limit?: number;
}

interface CommunityPost {
  id: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string;
    level: string;
  };
  content: string;
  movie?: {
    id: string;
    title: string;
    posterUrl: string;
  };
  language?: string;
  postType: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isPinned: boolean;
  createdAt: string;
}

interface CommunityResponse {
  posts: CommunityPost[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}
```

### POST /community/posts
Create a new community post.

```typescript
interface CreatePostRequest {
  content: string;
  movieId?: string;
  language?: string;
  postType?: string;
}

interface CreatePostResponse {
  post: CommunityPost;
  message: string;
}
```

### GET /leaderboard
Get leaderboard rankings.

```typescript
interface LeaderboardQuery {
  period?: 'weekly' | 'monthly' | 'all-time';
  language?: string;
  limit?: number;
}

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    username: string;
    avatarUrl: string;
    level: string;
  };
  points: number;
  lessonsCompleted: number;
  streak: number;
  wordsLearned: number;
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  userRank?: LeaderboardEntry;
  period: string;
}
```

## Search and Discovery

### GET /search
Universal search across content.

```typescript
interface SearchQuery {
  q: string;
  type?: 'movies' | 'vocabulary' | 'users' | 'all';
  language?: string;
  limit?: number;
}

interface SearchResponse {
  movies?: Movie[];
  vocabulary?: VocabularyItem[];
  users?: UserProfile[];
  suggestions: string[];
  total: number;
}
```

### GET /search/suggestions
Get search suggestions and trending terms.

```typescript
interface SearchSuggestions {
  recent: string[];
  popular: string[];
  trending: string[];
  byCategory: {
    movies: string[];
    vocabulary: string[];
    topics: string[];
  };
}
```

## User Management

### PUT /users/profile
Update user profile.

```typescript
interface ProfileUpdateRequest {
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  nativeLanguage?: string;
  targetLanguages?: string[];
  dailyGoal?: number;
}
```

### POST /users/bookmarks
Manage user bookmarks.

```typescript
interface BookmarkRequest {
  movieId: string;
  action: 'add' | 'remove';
}

interface BookmarkResponse {
  message: string;
  isBookmarked: boolean;
}
```

## Subscription Management

### GET /subscription/status
Get current subscription status.

```typescript
interface SubscriptionStatus {
  tier: 'free' | 'premium' | 'pro';
  isActive: boolean;
  expiresAt?: string;
  features: string[];
  limits: {
    dailyLessons: number;
    offlineDownloads: number;
    advancedFeatures: boolean;
  };
  usage: {
    lessonsToday: number;
    downloadsUsed: number;
  };
}
```

### POST /subscription/upgrade
Upgrade subscription tier.

```typescript
interface UpgradeRequest {
  tier: 'premium' | 'pro';
  paymentMethodId: string;
  billingCycle: 'monthly' | 'yearly';
}

interface UpgradeResponse {
  subscription: SubscriptionStatus;
  invoice: {
    id: string;
    amount: number;
    currency: string;
    status: string;
  };
}
```

## Content Support

### GET /movies/:id/subtitles
Get subtitles for a movie.

```typescript
interface SubtitleQuery {
  language?: string;
  format?: 'vtt' | 'srt' | 'json';
}

interface SubtitleResponse {
  movieId: string;
  language: string;
  format: string;
  subtitles: Subtitle[];
  downloadUrl?: string;
}
```

### GET /categories
Get available content categories.

```typescript
interface CategoriesResponse {
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    movieCount: number;
  }>;
}
```

### GET /languages
Get supported languages.

```typescript
interface LanguagesResponse {
  languages: Array<{
    code: string;
    name: string;
    nativeName: string;
    flag: string;
    difficulty: string;
    learnerCount: number;
  }>;
}
```

## Error Responses

All endpoints may return these standard error responses:

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}

// Common HTTP status codes:
// 400 - Bad Request
// 401 - Unauthorized
// 403 - Forbidden
// 404 - Not Found
// 429 - Too Many Requests
// 500 - Internal Server Error
```

This API specification provides comprehensive coverage of all CineFluent features with clear request/response formats and proper TypeScript interfaces.
