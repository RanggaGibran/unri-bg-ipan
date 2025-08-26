-- Script SQL untuk membuat tabel students di Supabase
-- Jalankan script ini di SQL Editor Supabase Dashboard

-- Membuat tabel students
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    nim VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    thesis_title TEXT,
    research_permit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_completed BOOLEAN DEFAULT FALSE,
    
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
    uk_examiner_4 VARCHAR(255)
);

-- Membuat index untuk performa yang lebih baik
CREATE INDEX IF NOT EXISTS idx_students_nim ON students(nim);
CREATE INDEX IF NOT EXISTS idx_students_completed ON students(is_completed);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at);

-- Membuat trigger untuk auto-update updated_at
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

-- Membuat RLS (Row Level Security) policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy untuk membaca data (semua user bisa membaca)
CREATE POLICY "Allow read access to all users" ON students
    FOR SELECT USING (true);

-- Policy untuk insert data (semua user bisa insert)
CREATE POLICY "Allow insert access to all users" ON students
    FOR INSERT WITH CHECK (true);

-- Policy untuk update data (semua user bisa update)
CREATE POLICY "Allow update access to all users" ON students
    FOR UPDATE USING (true);

-- Policy untuk delete data (semua user bisa delete)
CREATE POLICY "Allow delete access to all users" ON students
    FOR DELETE USING (true);

-- Insert data contoh untuk testing
INSERT INTO students (nim, name, thesis_title, supervisor_1, supervisor_2) VALUES
('2019001', 'Ahmad Rizki', 'Implementasi Machine Learning untuk Prediksi Cuaca', 'Dr. Budi Santoso', 'Dr. Siti Rahayu'),
('2019002', 'Sari Dewi', 'Analisis Sentimen Media Sosial menggunakan Deep Learning', 'Dr. Agus Pratama', 'Dr. Rina Kartika'),
('2019003', 'Dedi Kurniawan', 'Sistem Informasi Manajemen Perpustakaan Berbasis Web', 'Dr. Joko Widodo', 'Dr. Maya Sari')
ON CONFLICT (nim) DO NOTHING;

-- Update beberapa data contoh dengan progress
UPDATE students 
SET uj3_date = '2024-01-15', 
    sup_date = '2024-02-20',
    sup_supervisor_1 = 'Dr. Budi Santoso',
    sup_supervisor_2 = 'Dr. Siti Rahayu',
    sup_examiner_1 = 'Dr. Andi Wijaya',
    sup_examiner_2 = 'Dr. Lina Maharani'
WHERE nim = '2019001';

UPDATE students 
SET uj3_date = '2024-01-20', 
    sup_date = '2024-02-25',
    sup_supervisor_1 = 'Dr. Agus Pratama',
    sup_supervisor_2 = 'Dr. Rina Kartika',
    sup_examiner_1 = 'Dr. Hadi Susanto',
    sup_examiner_2 = 'Dr. Dian Permata',
    shp_date = '2024-06-15',
    shp_supervisor_1 = 'Dr. Agus Pratama',
    shp_supervisor_2 = 'Dr. Rina Kartika',
    shp_examiner_1 = 'Dr. Hadi Susanto',
    shp_examiner_2 = 'Dr. Dian Permata'
WHERE nim = '2019002';

UPDATE students 
SET uj3_date = '2024-02-01', 
    sup_date = '2024-03-10',
    sup_supervisor_1 = 'Dr. Joko Widodo',
    sup_supervisor_2 = 'Dr. Maya Sari',
    sup_examiner_1 = 'Dr. Rudi Hartono',
    sup_examiner_2 = 'Dr. Fitri Anggraini',
    shp_date = '2024-07-20',
    shp_supervisor_1 = 'Dr. Joko Widodo',
    shp_supervisor_2 = 'Dr. Maya Sari',
    shp_examiner_1 = 'Dr. Rudi Hartono',
    shp_examiner_2 = 'Dr. Fitri Anggraini',
    uk_date = '2024-12-15',
    uk_examiner_1 = 'Dr. Bambang Susilo',
    uk_examiner_2 = 'Dr. Nur Laila',
    uk_examiner_3 = 'Dr. Eko Prasetyo',
    uk_examiner_4 = 'Dr. Dewi Sartika',
    is_completed = true
WHERE nim = '2019003';

-- Menampilkan hasil
SELECT 
    nim, 
    name, 
    thesis_title,
    CASE 
        WHEN is_completed THEN 'Selesai (Kompre)'
        WHEN uk_date IS NOT NULL THEN 'Sudah UK'
        WHEN shp_date IS NOT NULL THEN 'Sudah SHP'
        WHEN sup_date IS NOT NULL THEN 'Sudah SUP'
        WHEN uj3_date IS NOT NULL THEN 'Sudah UJ3'
        ELSE 'Belum Mulai'
    END as status
FROM students
ORDER BY created_at;
