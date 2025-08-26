-- SQL untuk membuat tabel students di Supabase
-- Jalankan script ini di SQL Editor Supabase

CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  nim VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  thesis_title TEXT,
  research_permit TEXT,
  
  -- Surat Tugas (UJ3)
  uj3_date DATE,
  supervisor_1 VARCHAR(255),
  supervisor_2 VARCHAR(255),
  
  -- SUP (Seminar Usulan Penelitian)
  sup_date DATE,
  sup_supervisor_1 VARCHAR(255),
  sup_supervisor_2 VARCHAR(255),
  sup_examiner_1 VARCHAR(255),
  sup_examiner_2 VARCHAR(255),
  
  -- SHP (Seminar Hasil Penelitian)
  shp_date DATE,
  shp_supervisor_1 VARCHAR(255),
  shp_supervisor_2 VARCHAR(255),
  shp_examiner_1 VARCHAR(255),
  shp_examiner_2 VARCHAR(255),
  
  -- UK (Ujian Komprehensif)
  uk_date DATE,
  uk_examiner_1 VARCHAR(255),
  uk_examiner_2 VARCHAR(255),
  uk_examiner_3 VARCHAR(255),
  uk_examiner_4 VARCHAR(255),
  
  -- Status dan timestamps
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat index untuk performa query
CREATE INDEX idx_students_nim ON students(nim);
CREATE INDEX idx_students_is_completed ON students(is_completed);
CREATE INDEX idx_students_created_at ON students(created_at);

-- Buat trigger untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Buat policy untuk public access (sesuaikan dengan kebutuhan keamanan)
-- Untuk development, kita allow semua operasi
CREATE POLICY "Allow all operations for authenticated users" ON students
    FOR ALL USING (true);

-- Untuk production, Anda bisa membuat policy yang lebih spesifik:
-- CREATE POLICY "Allow read for authenticated users" ON students
--     FOR SELECT USING (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Allow insert for authenticated users" ON students
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Allow update for authenticated users" ON students
--     FOR UPDATE USING (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Allow delete for authenticated users" ON students
--     FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample data untuk testing (opsional)
INSERT INTO students (nim, name, thesis_title, uj3_date, supervisor_1, supervisor_2) VALUES
('20210001', 'Ahmad Fauzi', 'Implementasi Machine Learning untuk Prediksi Data', '2024-01-15', 'Dr. Budi Santoso', 'Dr. Siti Aminah'),
('20210002', 'Sari Dewi', 'Analisis Sistem Informasi Berbasis Web', '2024-02-01', 'Prof. Dr. Indra Wijaya', 'Dr. Maya Sari'),
('20210003', 'Rizki Pratama', 'Pengembangan Aplikasi Mobile dengan Flutter', '2024-01-20', 'Dr. Eko Prasetyo', 'Dr. Lina Marlina');

-- Update sample data dengan progress SUP
UPDATE students SET 
  sup_date = '2024-03-15',
  sup_supervisor_1 = 'Dr. Budi Santoso',
  sup_supervisor_2 = 'Dr. Siti Aminah',
  sup_examiner_1 = 'Prof. Dr. Anton Setiawan',
  sup_examiner_2 = 'Dr. Rini Kusuma'
WHERE nim = '20210001';

-- Tandai satu mahasiswa sebagai sudah kompre
UPDATE students SET 
  shp_date = '2024-05-20',
  shp_supervisor_1 = 'Prof. Dr. Indra Wijaya',
  shp_supervisor_2 = 'Dr. Maya Sari',
  shp_examiner_1 = 'Prof. Dr. Hadi Suryo',
  shp_examiner_2 = 'Dr. Dian Puspita',
  uk_date = '2024-06-15',
  uk_examiner_1 = 'Prof. Dr. Indra Wijaya',
  uk_examiner_2 = 'Dr. Maya Sari',
  uk_examiner_3 = 'Prof. Dr. Hadi Suryo',
  uk_examiner_4 = 'Dr. Ani Suryani',
  is_completed = TRUE
WHERE nim = '20210002';
