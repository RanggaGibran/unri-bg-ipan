-- SQL Script untuk membuat tabel students di Supabase
-- Jalankan script ini di Supabase SQL Editor

-- Membuat tabel students
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    nim VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    thesis_title TEXT,
    research_permit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
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

-- Membuat function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Membuat trigger untuk auto-update updated_at
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Membuat index untuk performa query
CREATE INDEX IF NOT EXISTS idx_students_nim ON students(nim);
CREATE INDEX IF NOT EXISTS idx_students_is_completed ON students(is_completed);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Membuat policy untuk akses data (sementara allow all untuk development)
-- Nanti bisa disesuaikan dengan kebutuhan autentikasi yang lebih kompleks
CREATE POLICY "Enable all access for development" ON students
    FOR ALL USING (true);

-- Insert contoh data (opsional)
INSERT INTO students (nim, name, thesis_title) VALUES
    ('2021001', 'Ahmad Budi Santoso', 'Analisis Sistem Informasi Akademik'),
    ('2021002', 'Siti Nur Aisyah', 'Implementasi Machine Learning untuk Prediksi'),
    ('2021003', 'Muhammad Rizky', 'Pengembangan Aplikasi Mobile dengan Flutter')
ON CONFLICT (nim) DO NOTHING;
