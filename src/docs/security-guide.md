
# CineFluent Security Guide

This document outlines comprehensive security measures, best practices, and implementation guidelines for the CineFluent platform.

## Security Framework Overview

### Security Principles
1. **Defense in Depth**: Multiple layers of security controls
2. **Zero Trust**: Verify everything, trust nothing
3. **Least Privilege**: Minimal access rights for users and systems
4. **Privacy by Design**: Data protection built into the system
5. **Continuous Monitoring**: Real-time threat detection and response

## Authentication Security

### JWT Implementation
```typescript
interface JWTSecurity {
  algorithm: "HS256";
  tokenExpiry: "24 hours";
  refreshTokenExpiry: "30 days";
  issuer: "cinefluent.com";
  audience: "cinefluent-app";
  secretRotation: "90 days";
}

// JWT Token Structure
interface JWTPayload {
  sub: string;           // User ID
  email: string;         // User email
  role: string;          // User role
  iat: number;           // Issued at
  exp: number;           // Expiration
  aud: string;           // Audience
  iss: string;           // Issuer
  subscription_tier: string;
}
```

### Password Security
```typescript
interface PasswordPolicy {
  minLength: 8;
  maxLength: 128;
  requireUppercase: true;
  requireLowercase: true;
  requireNumbers: true;
  requireSpecialChars: true;
  preventCommonPasswords: true;
  preventUserInfo: true;
  passwordHistory: 5;
  maxAttempts: 5;
  lockoutDuration: "15 minutes";
}

// Password hashing with bcrypt
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};
```

### Multi-Factor Authentication
```typescript
interface MFAConfig {
  methods: ["TOTP", "SMS", "Email"];
  backupCodes: 10;
  codeLength: 6;
  codeExpiry: "5 minutes";
  rateLimiting: {
    attempts: 3;
    window: "15 minutes";
  };
}

// TOTP Implementation
const generateTOTPSecret = (): string => {
  return authenticator.generateSecret();
};

const verifyTOTP = (token: string, secret: string): boolean => {
  return authenticator.verify({ token, secret });
};
```

### OAuth Security
```typescript
interface OAuthSecurity {
  providers: ["Google", "Apple"];
  scopes: ["openid", "email", "profile"];
  pkce: true;
  state: "required";
  nonce: "required";
  tokenValidation: "strict";
}

// OAuth token validation
const validateOAuthToken = async (token: string, provider: string) => {
  const response = await fetch(`https://${provider}.com/tokeninfo?id_token=${token}`);
  const tokenInfo = await response.json();
  
  if (!tokenInfo.aud === process.env.OAUTH_CLIENT_ID) {
    throw new Error('Invalid audience');
  }
  
  if (tokenInfo.exp < Date.now() / 1000) {
    throw new Error('Token expired');
  }
  
  return tokenInfo;
};
```

## Database Security

### Row Level Security (RLS)
```sql
-- Enable RLS on all user-related tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- User data access policies
CREATE POLICY "Users can only access own data" ON users
FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only see own progress" ON user_progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only update own progress" ON user_progress
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update own progress" ON user_progress
FOR UPDATE USING (auth.uid() = user_id);

-- Admin access policies
CREATE POLICY "Admins can access all data" ON users
FOR ALL TO service_role USING (true);

-- Public content policies
CREATE POLICY "Public content is viewable by authenticated users" ON movies
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Community posts are viewable by all authenticated users" ON community_posts
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create their own posts" ON community_posts
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON community_posts
FOR UPDATE TO authenticated USING (auth.uid() = user_id);
```

### Data Encryption
```sql
-- Encrypt sensitive user data
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt PII fields
CREATE OR REPLACE FUNCTION encrypt_pii(data TEXT) 
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_encrypt(data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_pii(encrypted_data TEXT) 
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted_data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit logging
CREATE TABLE security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  details JSONB
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO security_audit_log (
    user_id, action, resource, ip_address, user_agent, details
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    current_setting('request.headers')::json->>'x-real-ip',
    current_setting('request.headers')::json->>'user-agent',
    row_to_json(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## API Security

### Input Validation
```typescript
import { z } from 'zod';

// Request validation schemas
const userRegistrationSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  fullName: z.string().min(2).max(100).regex(/^[a-zA-Z\s]+$/),
  nativeLanguage: z.string().length(2)
});

const progressUpdateSchema = z.object({
  lessonId: z.string().uuid(),
  progressPercentage: z.number().min(0).max(100),
  timeSpent: z.number().min(0).max(86400), // Max 24 hours
  currentPosition: z.number().min(0),
  vocabularyLearned: z.array(z.string().uuid()).optional()
});

// Validation middleware
const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
  };
};
```

### Rate Limiting
```typescript
interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: true;
  legacyHeaders: false;
}

const rateLimitConfigs = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many authentication attempts'
  },
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window
    message: 'Too many API requests'
  },
  search: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 searches per minute
    message: 'Too many search requests'
  }
};

// Advanced rate limiting with Redis
const createAdvancedRateLimit = (config: RateLimitConfig) => {
  return rateLimit({
    ...config,
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.call(...args),
    }),
    keyGenerator: (req: Request) => {
      return `${req.ip}:${req.user?.id || 'anonymous'}`;
    },
    skip: (req: Request) => {
      // Skip rate limiting for admins
      return req.user?.role === 'admin';
    }
  });
};
```

### CORS Configuration
```typescript
const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = [
      'https://cinefluent.com',
      'https://www.cinefluent.com',
      'https://app.cinefluent.com',
      'https://admin.cinefluent.com'
    ];
    
    // Allow mobile apps and development
    if (!origin || allowedOrigins.includes(origin) || 
        origin.startsWith('capacitor://') || 
        origin.startsWith('ionic://') ||
        (process.env.NODE_ENV === 'development' && origin.includes('localhost'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
```

## Content Security

### Content Security Policy (CSP)
```typescript
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'", // Required for some React features
    "https://js.stripe.com",
    "https://www.google-analytics.com"
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // Required for styled-components
    "https://fonts.googleapis.com"
  ],
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com"
  ],
  imgSrc: [
    "'self'",
    "data:",
    "https://image.tmdb.org",
    "https://cdn.cinefluent.com"
  ],
  mediaSrc: [
    "'self'",
    "https://video.cinefluent.com",
    "blob:"
  ],
  connectSrc: [
    "'self'",
    "https://api.cinefluent.com",
    "https://analytics.google.com",
    "wss://realtime.supabase.co"
  ],
  frameSrc: [
    "https://js.stripe.com"
  ],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"]
};
```

### File Upload Security
```typescript
interface FileUploadSecurity {
  allowedTypes: string[];
  maxFileSize: number;
  scanForMalware: boolean;
  virusScanning: boolean;
  contentTypeValidation: boolean;
}

const uploadConfigs = {
  avatar: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    dimensions: { maxWidth: 1024, maxHeight: 1024 }
  },
  video: {
    allowedTypes: ['video/mp4', 'video/webm'],
    maxFileSize: 500 * 1024 * 1024, // 500MB
    duration: { max: 7200 } // 2 hours
  },
  subtitle: {
    allowedTypes: ['text/vtt', 'text/plain'],
    maxFileSize: 1024 * 1024, // 1MB
    encoding: 'utf-8'
  }
};

const validateFileUpload = async (file: File, config: FileUploadSecurity) => {
  // Validate file type
  if (!config.allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  // Validate file size
  if (file.size > config.maxFileSize) {
    throw new Error('File too large');
  }
  
  // Validate file content (magic number check)
  const buffer = await file.arrayBuffer();
  const isValidContent = await validateFileContent(buffer, file.type);
  if (!isValidContent) {
    throw new Error('Invalid file content');
  }
  
  return true;
};
```

## Privacy and Data Protection

### GDPR Compliance
```typescript
interface GDPRCompliance {
  dataMinimization: boolean;
  purposeLimitation: boolean;
  storageMinimization: boolean;
  userConsent: boolean;
  rightToPortability: boolean;
  rightToErasure: boolean;
  dataBreachNotification: boolean;
}

// Data retention policies
const dataRetentionPolicies = {
  userAccounts: {
    activeUsers: 'indefinite',
    inactiveUsers: '3 years',
    deletedAccounts: '30 days'
  },
  learningData: {
    progressData: 'indefinite',
    activityLogs: '2 years',
    analyticsData: '2 years'
  },
  communicationData: {
    supportTickets: '3 years',
    marketingData: '2 years',
    auditLogs: '7 years'
  }
};

// Data export functionality
const exportUserData = async (userId: string) => {
  const userData = {
    profile: await getUserProfile(userId),
    progress: await getUserProgress(userId),
    vocabulary: await getUserVocabulary(userId),
    activities: await getUserActivities(userId),
    preferences: await getUserPreferences(userId)
  };
  
  return {
    format: 'JSON',
    data: userData,
    generatedAt: new Date().toISOString(),
    version: '1.0'
  };
};
```

### Cookie Security
```typescript
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  domain: process.env.NODE_ENV === 'production' ? '.cinefluent.com' : undefined
};

// Session cookie
app.use(session({
  name: 'cinefluent-session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: cookieOptions,
  store: new RedisStore({ client: redisClient })
}));
```

## Monitoring and Incident Response

### Security Monitoring
```typescript
interface SecurityEvent {
  type: 'authentication' | 'authorization' | 'data_access' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, any>;
}

const securityEventTypes = {
  failedLogin: {
    threshold: 5,
    window: '15 minutes',
    action: 'account_lock'
  },
  dataExfiltration: {
    threshold: 1000,
    window: '1 hour',
    action: 'rate_limit'
  },
  privilegeEscalation: {
    threshold: 1,
    window: 'immediate',
    action: 'immediate_review'
  },
  suspiciousLocation: {
    threshold: 1,
    window: 'immediate',
    action: 'mfa_required'
  }
};

const logSecurityEvent = async (event: SecurityEvent) => {
  await supabase
    .from('security_events')
    .insert(event);
    
  if (event.severity === 'critical') {
    await notifySecurityTeam(event);
  }
};
```

### Incident Response Plan
```typescript
interface IncidentResponse {
  detection: string;
  classification: string;
  containment: string;
  eradication: string;
  recovery: string;
  lessonsLearned: string;
}

const incidentResponseProcedures = {
  dataBreach: {
    immediate: [
      'Identify affected systems',
      'Contain the breach',
      'Assess data exposure',
      'Notify stakeholders'
    ],
    shortTerm: [
      'Patch vulnerabilities',
      'Reset affected credentials',
      'Monitor for further activity',
      'Communicate with users'
    ],
    longTerm: [
      'Conduct security review',
      'Update security policies',
      'Implement additional controls',
      'Train staff on prevention'
    ]
  }
};
```

This comprehensive security guide ensures that CineFluent maintains the highest standards of security and privacy protection while providing a seamless user experience.
