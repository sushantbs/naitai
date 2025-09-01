# Authentication Setup Guide

This guide will help you complete the authentication setup for your application, including social authentication with Google and Facebook.

## Overview

Your application now includes:

- ✅ Email/password authentication
- ✅ Protected routes
- ✅ User session management
- ✅ JWT token authentication on backend
- ✅ User-specific data (habits)
- ✅ Profile management
- ✅ Authentication UI components

## Required Environment Variables

Make sure you have these environment variables configured:

### Frontend (.env)

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3002  # Your backend URL
```

### Backend (.env)

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key  # Service role key for backend
SUPABASE_ANON_KEY=your_supabase_anon_key    # Anonymous key for RLS
PORT=3002
```

## Database Schema Setup

You need to create the `habits` table in your Supabase database:

```sql
-- Create habits table
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  completed BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Create policies for habits table
CREATE POLICY "Users can view their own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Social Authentication Setup

### 1. Google Authentication

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen
6. Set application type to "Web application"
7. Add authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)

8. In your Supabase Dashboard:
   - Go to Authentication → Providers
   - Enable Google provider
   - Add your Google Client ID and Client Secret

### 2. Facebook Authentication

1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add "Facebook Login" product
4. Go to Facebook Login → Settings
5. Add Valid OAuth Redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)

6. In your Supabase Dashboard:
   - Go to Authentication → Providers
   - Enable Facebook provider
   - Add your Facebook App ID and App Secret

### 3. Configure Redirect URLs in Supabase

In your Supabase Dashboard → Authentication → URL Configuration:

Add these redirect URLs:

- `http://localhost:3000/auth/callback` (development)
- `https://yourdomain.com/auth/callback` (production)

## Testing the Authentication

1. Start your backend server:

```bash
cd backend
npm run dev
```

2. Start your frontend:

```bash
cd frontend
npm run dev
```

3. Visit `http://localhost:3000` and test:
   - Email/password registration
   - Email/password login
   - Google social login
   - Facebook social login
   - Protected routes (should redirect to login)
   - User profile management
   - Logout functionality

## Security Features Included

- ✅ JWT token verification on backend
- ✅ Row Level Security (RLS) policies
- ✅ User-specific data isolation
- ✅ Protected API endpoints
- ✅ Secure password requirements
- ✅ Email verification (if enabled in Supabase)
- ✅ Session management
- ✅ CSRF protection via SameSite cookies

## Available Authentication Features

### User Registration

- Email/password with validation
- Strong password requirements
- Social registration (Google, Facebook)
- Email verification support

### User Login

- Email/password authentication
- Social login options
- Remember session across browser sessions
- "Forgot password" functionality

### Session Management

- Automatic token refresh
- Persistent login state
- Secure logout
- Session expiration handling

### Protected Routes

- Automatic redirect to login
- Loading states during auth checks
- User context throughout the app

### User Profile

- View account information
- Change password
- Account management
- Sign out functionality

## Next Steps

1. Run the database schema setup in your Supabase SQL editor
2. Configure your environment variables
3. Set up Google and Facebook OAuth apps
4. Configure the providers in Supabase
5. Test all authentication flows
6. Deploy and update redirect URLs for production

Your authentication system is now fully functional with both email/password and social authentication options!
