-- Create Students Table for Supabase
CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  nim VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  program_studi VARCHAR(100) CHECK (program_studi IN ('Teknologi Hasil Pertanian', 'Teknologi Industri Pertanian')),
  thesis_title TEXT,
  research_permit DATE, -- Tanggal izin penelitian
  
  -- UJ3 (Surat Tugas) fields
  uj3_date DATE,
  supervisor_1 VARCHAR(255),
  supervisor_2 VARCHAR(255),
  
  -- SUP (Seminar Usulan Penelitian) fields
  sup_date DATE,
  sup_supervisor_1 VARCHAR(255),
  sup_supervisor_2 VARCHAR(255),
  sup_examiner_1 VARCHAR(255),
  sup_examiner_2 VARCHAR(255),
  
  -- SHP (Seminar Hasil Penelitian) fields
  shp_date DATE,
  shp_supervisor_1 VARCHAR(255),
  shp_supervisor_2 VARCHAR(255),
  shp_examiner_1 VARCHAR(255),
  shp_examiner_2 VARCHAR(255),
  
  -- UK (Ujian Komprehensif) fields
  uk_date DATE,
  uk_examiner_1 VARCHAR(255),
  uk_examiner_2 VARCHAR(255),
  uk_examiner_3 VARCHAR(255),
  uk_examiner_4 VARCHAR(255),
  
  -- Status and metadata
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS (Row Level Security) policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (you can make this more restrictive)
CREATE POLICY "Enable all access for authenticated users" ON students
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_students_nim ON students(nim);
CREATE INDEX idx_students_program_studi ON students(program_studi);
CREATE INDEX idx_students_is_completed ON students(is_completed);
CREATE INDEX idx_students_created_at ON students(created_at DESC);

-- Add comments
COMMENT ON TABLE students IS 'Tabel mahasiswa dan progress ujian akhir';
COMMENT ON COLUMN students.research_permit IS 'Tanggal izin penelitian (format: YYYY-MM-DD)';
COMMENT ON COLUMN students.program_studi IS 'Program studi: Teknologi Hasil Pertanian atau Teknologi Industri Pertanian';

-- Insert sample data
INSERT INTO students (
  nim, name, program_studi, thesis_title, research_permit,
  uj3_date, supervisor_1, supervisor_2,
  sup_date, sup_supervisor_1, sup_supervisor_2, sup_examiner_1, sup_examiner_2,
  is_completed
) VALUES 
  (
    '2021001001', 
    'Ahmad Pratama', 
    'Teknologi Hasil Pertanian',
    'Optimasi Proses Fermentasi Tempe Menggunakan Metode Response Surface',
    '2024-02-15',
    '2024-01-15',
    'Dr. Siti Aminah, M.T.',
    'Prof. Budi Santoso, Ph.D.',
    '2024-03-20',
    'Dr. Siti Aminah, M.T.',
    'Prof. Budi Santoso, Ph.D.',
    'Dr. Rina Wijaya, M.Sc.',
    'Dr. Agus Setiawan, M.T.',
    false
  ),
  (
    '2021001002',
    'Siti Nurhaliza',
    'Teknologi Industri Pertanian',
    'Pengembangan Sistem Monitoring IoT untuk Greenhouse Management',
    '2024-02-20',
    '2024-01-20',
    'Prof. Indra Permana, Ph.D.',
    'Dr. Maya Sari, M.T.',
    '2024-03-25',
    'Prof. Indra Permana, Ph.D.',
    'Dr. Maya Sari, M.T.',
    'Dr. Fendi Kurniawan, M.Sc.',
    'Dr. Lisa Handayani, M.T.',
    false
  );
