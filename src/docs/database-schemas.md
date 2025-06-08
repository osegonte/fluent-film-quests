
# CineFluent Database Schemas

This document defines the complete database schema for CineFluent, including all tables, relationships, and indexes.

## Core Tables

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  native_language VARCHAR(10) DEFAULT 'en',
  target_languages TEXT[] DEFAULT '{}',
  subscription_tier VARCHAR(20) DEFAULT 'free',
  subscription_ends_at TIMESTAMPTZ,
  streak_count INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  daily_goal INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Movies Table
```sql
CREATE TABLE movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE,
  title VARCHAR(255) NOT NULL,
  original_title VARCHAR(255),
  description TEXT,
  release_date DATE,
  duration_minutes INTEGER,
  poster_url TEXT,
  backdrop_url TEXT,
  trailer_url TEXT,
  imdb_rating DECIMAL(3,1),
  age_rating VARCHAR(10),
  genres TEXT[] DEFAULT '{}',
  available_languages TEXT[] DEFAULT '{}',
  difficulty_levels JSONB DEFAULT '{}',
  popularity_score DECIMAL(5,2) DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for search performance
CREATE INDEX idx_movies_search ON movies USING GIN(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_movies_languages ON movies USING GIN(available_languages);
CREATE INDEX idx_movies_genres ON movies USING GIN(genres);
```

### Movie Lessons Table
```sql
CREATE TABLE movie_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  difficulty_level VARCHAR(20) NOT NULL,
  lesson_order INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT,
  subtitle_url TEXT,
  vocabulary_count INTEGER DEFAULT 0,
  estimated_duration INTEGER, -- in minutes
  learning_objectives TEXT[],
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(movie_id, language, lesson_order)
);
```

### Subtitles Table
```sql
CREATE TABLE subtitles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES movie_lessons(id) ON DELETE CASCADE,
  start_time DECIMAL(10,3) NOT NULL, -- seconds
  end_time DECIMAL(10,3) NOT NULL,
  text TEXT NOT NULL,
  translation TEXT,
  difficulty_words TEXT[] DEFAULT '{}',
  context_notes TEXT,
  sequence_order INTEGER NOT NULL
);

CREATE INDEX idx_subtitles_timing ON subtitles(lesson_id, start_time, end_time);
```

### Vocabulary Table
```sql
CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word VARCHAR(255) NOT NULL,
  language VARCHAR(10) NOT NULL,
  translation VARCHAR(255) NOT NULL,
  pronunciation TEXT,
  part_of_speech VARCHAR(50),
  difficulty_level VARCHAR(20),
  frequency_rank INTEGER,
  example_sentence TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(word, language)
);

CREATE INDEX idx_vocabulary_search ON vocabulary USING GIN(to_tsvector('english', word || ' ' || translation));
```

## Progress Tracking Tables

### User Progress Table
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES movie_lessons(id) ON DELETE CASCADE,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  completed_at TIMESTAMPTZ,
  time_spent INTEGER DEFAULT 0, -- seconds
  vocabulary_learned TEXT[] DEFAULT '{}',
  quiz_scores JSONB DEFAULT '{}',
  last_position DECIMAL(10,3) DEFAULT 0, -- video timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);
```

### User Vocabulary Progress Table
```sql
CREATE TABLE user_vocabulary_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
  mastery_level INTEGER DEFAULT 0, -- 0-5 scale
  times_seen INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vocabulary_id)
);
```

## Social and Community Tables

### Bookmarks Table
```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);
```

### Community Posts Table
```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  movie_id UUID REFERENCES movies(id),
  language VARCHAR(10),
  post_type VARCHAR(50) DEFAULT 'general',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### User Activities Table
```sql
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  activity_data JSONB DEFAULT '{}',
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_activities_user_date ON user_activities(user_id, created_at);
```

## Indexes and Performance Optimization

### Additional Indexes
```sql
-- Performance indexes
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_movies_popularity ON movies(popularity_score DESC);
CREATE INDEX idx_movies_rating ON movies(imdb_rating DESC);
CREATE INDEX idx_vocabulary_frequency ON vocabulary(frequency_rank);
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);
```

### Database Views

#### User Statistics View
```sql
CREATE VIEW user_statistics AS
SELECT 
  u.id,
  u.username,
  u.streak_count,
  u.total_points,
  COUNT(DISTINCT up.lesson_id) as lessons_completed,
  SUM(up.time_spent) as total_time_spent,
  COUNT(DISTINCT uvp.vocabulary_id) as words_learned
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id AND up.completed_at IS NOT NULL
LEFT JOIN user_vocabulary_progress uvp ON u.id = uvp.user_id AND uvp.mastery_level > 0
GROUP BY u.id, u.username, u.streak_count, u.total_points;
```

#### Popular Movies View
```sql
CREATE VIEW popular_movies AS
SELECT 
  m.*,
  COUNT(DISTINCT up.user_id) as active_learners,
  AVG(up.progress_percentage) as avg_progress,
  COUNT(DISTINCT b.user_id) as bookmark_count
FROM movies m
LEFT JOIN movie_lessons ml ON m.id = ml.movie_id
LEFT JOIN user_progress up ON ml.id = up.lesson_id
LEFT JOIN bookmarks b ON m.id = b.movie_id
WHERE m.is_active = true
GROUP BY m.id
ORDER BY active_learners DESC, m.popularity_score DESC;
```

## Data Relationships

### Primary Relationships
- Users → User Progress (1:many)
- Movies → Movie Lessons (1:many)
- Movie Lessons → Subtitles (1:many)
- Movie Lessons → User Progress (1:many)
- Users → Bookmarks → Movies (many:many)
- Users → User Vocabulary Progress → Vocabulary (many:many)

### Cascade Rules
- Movie deletion cascades to lessons, subtitles, and progress
- User deletion cascades to all user-related data
- Lesson deletion cascades to progress and subtitles
- Vocabulary deletion cascades to user vocabulary progress

This schema supports scalable language learning with comprehensive progress tracking, social features, and performance optimization.
