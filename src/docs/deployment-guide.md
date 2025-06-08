
# CineFluent Deployment Guide

This guide covers the complete deployment process for CineFluent, from development setup to production deployment across different environments.

## Environment Configuration

### Development Environment
```bash
# Required tools
- Node.js 18+
- PostgreSQL 14+
- Redis 6+ (optional)
- FFmpeg (for video processing)
- Git

# Environment variables (.env.local)
DATABASE_URL="postgresql://user:password@localhost:5432/cinefluent_dev"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
REDIS_URL="redis://localhost:6379"
STRIPE_SECRET_KEY="sk_test_..."
VIDEO_CDN_URL="https://your-cdn.com"
TMDB_API_KEY="your-tmdb-key"
GOOGLE_OAUTH_CLIENT_ID="your-google-client-id"
JWT_SECRET="your-jwt-secret"
ENVIRONMENT="development"
```

### Staging Environment
```bash
# Environment variables (.env.staging)
DATABASE_URL="postgresql://user:password@staging-db:5432/cinefluent_staging"
SUPABASE_URL="https://staging-project.supabase.co"
SUPABASE_ANON_KEY="staging-anon-key"
SUPABASE_SERVICE_ROLE_KEY="staging-service-role-key"
REDIS_URL="redis://staging-redis:6379"
STRIPE_SECRET_KEY="sk_test_..."
VIDEO_CDN_URL="https://staging-cdn.com"
TMDB_API_KEY="your-tmdb-key"
GOOGLE_OAUTH_CLIENT_ID="staging-google-client-id"
JWT_SECRET="staging-jwt-secret"
ENVIRONMENT="staging"
```

### Production Environment
```bash
# Environment variables (.env.production)
DATABASE_URL="postgresql://user:password@prod-db:5432/cinefluent_prod"
SUPABASE_URL="https://prod-project.supabase.co"
SUPABASE_ANON_KEY="prod-anon-key"
SUPABASE_SERVICE_ROLE_KEY="prod-service-role-key"
REDIS_URL="redis://prod-redis:6379"
STRIPE_SECRET_KEY="sk_live_..."
VIDEO_CDN_URL="https://cdn.cinefluent.com"
TMDB_API_KEY="your-tmdb-key"
GOOGLE_OAUTH_CLIENT_ID="prod-google-client-id"
JWT_SECRET="prod-jwt-secret"
ENVIRONMENT="production"
```

## Supabase Deployment

### Database Setup
```sql
-- Run these commands in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create all tables (see database-schemas.md)
-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own progress" ON user_progress
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own vocabulary progress" ON user_vocabulary_progress
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks" ON bookmarks
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view all community posts" ON community_posts
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create own posts" ON community_posts
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON community_posts
FOR UPDATE USING (auth.uid() = user_id);
```

### Edge Functions Deployment
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy edge functions
supabase functions deploy auth-callback
supabase functions deploy progress-update
supabase functions deploy recommendation-engine
supabase functions deploy payment-webhook
supabase functions deploy content-sync
supabase functions deploy analytics-processor

# Set function secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set TMDB_API_KEY=your-tmdb-key
supabase secrets set OPENAI_API_KEY=your-openai-key
```

### Storage Configuration
```javascript
// Storage buckets setup
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Create storage buckets
await supabase.storage.createBucket('avatars', {
  public: true,
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif'],
  fileSizeLimit: 5242880 // 5MB
});

await supabase.storage.createBucket('videos', {
  public: false,
  allowedMimeTypes: ['video/mp4', 'video/webm'],
  fileSizeLimit: 1073741824 // 1GB
});

await supabase.storage.createBucket('subtitles', {
  public: false,
  allowedMimeTypes: ['text/vtt', 'text/plain'],
  fileSizeLimit: 1048576 // 1MB
});

// Set storage policies
await supabase.rpc('create_storage_policy', {
  bucket_name: 'avatars',
  policy_name: 'Public avatar access',
  definition: 'true'
});
```

## Docker Deployment

### Dockerfile
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_SUPABASE_URL=${SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - backend

  backend:
    image: supabase/edge-runtime:latest
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    volumes:
      - ./supabase/functions:/home/deno/functions

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend

volumes:
  redis_data:
```

## Cloud Deployment Options

### Vercel Deployment (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Environment variables in Vercel dashboard:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=https://api.cinefluent.com
```

### Netlify Deployment (Frontend)
```bash
# Build settings
Build command: npm run build
Publish directory: dist
Node version: 18

# Environment variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=https://api.cinefluent.com
```

### AWS Deployment
```yaml
# AWS CloudFormation template (abbreviated)
AWSTemplateFormatVersion: '2010-09-09'
Description: 'CineFluent Infrastructure'

Resources:
  # S3 bucket for static assets
  StaticAssetsBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: cinefluent-static-assets
      PublicReadPolicy: true
      
  # CloudFront distribution
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - DomainName: !GetAtt StaticAssetsBucket.DomainName
            Id: S3Origin
            S3OriginConfig:
              OriginAccessIdentity: ""
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          
  # Application Load Balancer
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Scheme: internet-facing
      SecurityGroups:
        - !Ref ALBSecurityGroup
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2
```

## Mobile App Deployment

### Android Deployment
```bash
# Build Android APK
npm run build
npx cap copy android
npx cap sync android

# Open in Android Studio
npx cap open android

# Build signed APK for release
cd android
./gradlew assembleRelease

# Generate upload key
keytool -genkey -v -keystore cinefluent-upload-key.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore cinefluent-upload-key.keystore app-release-unsigned.apk upload
```

### iOS Deployment
```bash
# Build iOS app
npm run build
npx cap copy ios
npx cap sync ios

# Open in Xcode
npx cap open ios

# Configure signing & provisioning profiles in Xcode
# Archive and upload to App Store Connect
```

### App Store Configuration
```json
{
  "ios": {
    "bundleIdentifier": "com.cinefluent.app",
    "version": "1.0.0",
    "buildNumber": "1",
    "icon": "public/icon-1024.png",
    "splash": "public/splash-2732x2732.png"
  },
  "android": {
    "packageName": "com.cinefluent.app",
    "versionCode": 1,
    "versionName": "1.0.0",
    "icon": "public/icon-512.png",
    "splash": "public/splash-1920x1920.png"
  }
}
```

## Performance Optimization

### CDN Configuration
```nginx
# nginx.conf for CDN
server {
    listen 80;
    server_name cdn.cinefluent.com;

    location /videos/ {
        proxy_pass http://video-storage;
        proxy_cache video_cache;
        proxy_cache_valid 200 1d;
        proxy_cache_use_stale error timeout updating;
        add_header X-Cache-Status $upstream_cache_status;
    }

    location /images/ {
        proxy_pass http://image-storage;
        proxy_cache image_cache;
        proxy_cache_valid 200 7d;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Database Optimization
```sql
-- Database performance tuning
-- Connection pooling
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';

-- Query optimization
ANALYZE;
VACUUM ANALYZE;

-- Create additional indexes for common queries
CREATE INDEX CONCURRENTLY idx_user_progress_updated_at ON user_progress(updated_at);
CREATE INDEX CONCURRENTLY idx_movies_created_at ON movies(created_at);
CREATE INDEX CONCURRENTLY idx_community_posts_user_created ON community_posts(user_id, created_at);
```

## Monitoring and Logging

### Application Monitoring
```javascript
// Sentry configuration
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.ENVIRONMENT,
  tracesSampleRate: 1.0,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.ENVIRONMENT
  });
});
```

### Logging Configuration
```javascript
// Winston logger setup
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'cinefluent-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});
```

## Security Configuration

### SSL/TLS Setup
```bash
# Let's Encrypt SSL certificate
certbot --nginx -d cinefluent.com -d www.cinefluent.com -d api.cinefluent.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

### Security Headers
```nginx
# Security headers in nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## Backup and Recovery

### Database Backup
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > /backups/cinefluent_$DATE.sql
aws s3 cp /backups/cinefluent_$DATE.sql s3://cinefluent-backups/

# Keep only last 30 days of backups
find /backups -name "cinefluent_*.sql" -mtime +30 -delete
```

### Disaster Recovery Plan
```bash
# Recovery procedure
1. Restore database from latest backup
2. Deploy latest application code
3. Verify all services are running
4. Run database migrations if needed
5. Update DNS if switching servers
6. Monitor application logs
```

This deployment guide provides comprehensive coverage for deploying CineFluent across different environments with proper security, monitoring, and backup procedures.
