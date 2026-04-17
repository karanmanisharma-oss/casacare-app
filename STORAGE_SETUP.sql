-- Create storage bucket for CasaCare media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'casacare-media',
  'casacare-media',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Anyone can view media" ON storage.objects;
DROP POLICY IF EXISTS "Auth users upload media" ON storage.objects;
DROP POLICY IF EXISTS "Auth users delete own media" ON storage.objects;

CREATE POLICY "Public read media" ON storage.objects
  FOR SELECT USING (bucket_id = 'casacare-media');

CREATE POLICY "Auth users upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'casacare-media'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Auth users delete own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'casacare-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
