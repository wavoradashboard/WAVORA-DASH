-- Run this in your Supabase SQL Editor to set up storage policies

-- 1. Create the bucket (if it doesn't already exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('app-files', 'app-files', false)
ON CONFLICT (id) DO NOTHING;

-- 2. (RLS is usually already enabled on storage.objects by Supabase)

-- 3. Policy: Users can upload their own files
-- The path will be: {auth.uid()}/... so we check if the first folder matches the user ID
CREATE POLICY "Users can upload to their own folder" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'app-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Policy: Users can read their own files
CREATE POLICY "Users can read their own files" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'app-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Policy: Users can update their own files
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'app-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Policy: Users can delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'app-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 7. Policy: Global Read (Optional/For Admin)
-- If you need admins to hear the files, you might want this policy:
CREATE POLICY "Authenticated users can preview files" ON storage.objects
FOR SELECT
USING (auth.role() = 'authenticated');
