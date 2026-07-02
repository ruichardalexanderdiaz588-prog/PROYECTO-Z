
-- NEXUS Database Schema

-- 1. Tables for Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  birth_date DATE,
  age INTEGER,
  gender_identity TEXT,
  orientation TEXT,
  is_orientation_public BOOLEAN DEFAULT TRUE,
  profile_pic TEXT,
  bio TEXT,
  is_adult BOOLEAN DEFAULT FALSE,
  is_parent_monitored BOOLEAN DEFAULT FALSE,
  hobbies TEXT[] DEFAULT '{}',
  is_hobbies_public BOOLEAN DEFAULT TRUE,
  points INTEGER DEFAULT 100,
  is_suspended BOOLEAN DEFAULT FALSE,
  banned_multiaccounts BOOLEAN DEFAULT FALSE,
  unlocked_skins TEXT[] DEFAULT '{"standard"}',
  followers TEXT[] DEFAULT '{}',
  following TEXT[] DEFAULT '{}',
  last_mood TEXT,
  last_mood_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tables for Posts
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  author_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT,
  author_pic TEXT,
  author_age INTEGER,
  author_is_adult BOOLEAN,
  content_type TEXT NOT NULL, -- 'image', 'video', 'text'
  caption TEXT,
  media_url TEXT,
  likes TEXT[] DEFAULT '{}',
  stats JSONB DEFAULT '{"likes": 0, "comments": 0, "shares": 0, "saves": 0, "views": 0}',
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  privacy TEXT DEFAULT 'public', -- 'public', 'friends', 'minors', 'majors', 'private'
  allow_comments BOOLEAN DEFAULT TRUE,
  allow_sharing BOOLEAN DEFAULT TRUE,
  allow_downloads BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tables for Comments
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  author_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT,
  author_pic TEXT,
  author_age INTEGER,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tables for Chat Requests
CREATE TABLE IF NOT EXISTS chat_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  recipient_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'expired', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tables for Chats
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user1_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  user2_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tables for Stories
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  author_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT,
  author_pic TEXT,
  media_url TEXT NOT NULL,
  text_overlay TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  views_count INTEGER DEFAULT 0
);

-- 7. Tables for Notes
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  author_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT,
  author_pic TEXT,
  text TEXT NOT NULL,
  bg_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- 8. Tables for Clubs
CREATE TABLE IF NOT EXISTS clubs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  profile_image TEXT,
  tags TEXT[] DEFAULT '{}',
  is_18_plus BOOLEAN DEFAULT FALSE,
  privacy TEXT DEFAULT 'public', -- 'public', 'private'
  creator_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  admins TEXT[] DEFAULT '{}',
  members TEXT[] DEFAULT '{}',
  pending_requests TEXT[] DEFAULT '{}',
  chat_messages JSONB DEFAULT '[]',
  allow_all_to_message BOOLEAN DEFAULT TRUE,
  allow_media BOOLEAN DEFAULT TRUE,
  allow_stickers BOOLEAN DEFAULT TRUE,
  allow_voice_notes BOOLEAN DEFAULT TRUE,
  allow_videos_30s BOOLEAN DEFAULT TRUE,
  banned_words TEXT[] DEFAULT '{}',
  invite_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Allow all for now, or refine per user_id)
-- Note: Replace with more granular policies if needed
CREATE POLICY "Public users are viewable by everyone." ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own data." ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Posts are viewable by everyone (subject to logic)." ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own posts." ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own posts." ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own posts." ON posts FOR DELETE USING (auth.uid() = author_id);

-- Storage Buckets Setup
-- 1. Create the 'media' bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to read files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'media');

-- 3. Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'media' AND auth.role() = 'authenticated'
);

-- 4. Allow users to update/delete their own files
CREATE POLICY "Users can update their own files" ON storage.objects FOR UPDATE USING (
  bucket_id = 'media' AND auth.uid()::text = owner::text
);

CREATE POLICY "Users can delete their own files" ON storage.objects FOR DELETE USING (
  bucket_id = 'media' AND auth.uid()::text = owner::text
);
