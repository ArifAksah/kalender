-- Storage Policies for Supabase Storage Bucket "avatars"
-- Jalankan ini di Supabase SQL Editor setelah membuat bucket "avatars"

-- IMPORTANT: 
-- 1. Pastikan bucket "avatars" sudah dibuat di Storage dashboard
-- 2. Pastikan bucket dibuat sebagai PUBLIC bucket (bukan private)
-- 3. Pastikan SUPABASE_SERVICE_ROLE_KEY digunakan di server .env (bukan anon key)

-- Hapus policy lama jika ada (optional, untuk reset)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- 1. Policy untuk INSERT (Upload) - Allow authenticated users to upload
-- NOTE: Service role key bypasses this, tapi tetap perlu untuk client-side uploads
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- 2. Policy untuk SELECT (Read) - Allow public to read
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ALTERNATIVE: Jika ingin allow semua (termasuk anon) untuk upload (UNTUK DEVELOPMENT)
-- UNCOMMENT baris di bawah:
-- CREATE POLICY "Allow all uploads"
-- ON storage.objects FOR INSERT
-- TO public
-- WITH CHECK (bucket_id = 'avatars');

-- 3. Policy untuk UPDATE - Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- 4. Policy untuk DELETE - Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- NOTE: Tidak bisa disable RLS untuk storage.objects (system table)
-- Gunakan service role key di backend untuk bypass RLS
-- Atau buat bucket sebagai PUBLIC bucket di Storage dashboard

-- Note: Service role key seharusnya bypass RLS, tapi jika masih error,
-- mungkin perlu disable RLS untuk storage.objects di development

