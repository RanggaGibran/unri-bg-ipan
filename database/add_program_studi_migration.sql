-- Migration untuk menambahkan field program_studi ke tabel students
-- Jalankan script ini di SQL Editor Supabase

-- Tambahkan kolom program_studi ke tabel students
ALTER TABLE students 
ADD COLUMN program_studi VARCHAR(100);

-- Tambahkan index untuk performa query filtering
CREATE INDEX idx_students_program_studi ON students(program_studi);

-- Update data existing (opsional - jika ada data yang perlu diupdate)
-- Uncomment dan sesuaikan jika diperlukan:
-- UPDATE students SET program_studi = 'Teknik Informatika' WHERE program_studi IS NULL;

-- Verification query - untuk memastikan kolom berhasil ditambahkan
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'students' AND column_name = 'program_studi';
