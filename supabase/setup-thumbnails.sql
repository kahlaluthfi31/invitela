-- Bucket thumbnails (jalankan sekali di Supabase SQL Editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Public read thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

-- Authenticated upload
CREATE POLICY "Auth upload thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');
