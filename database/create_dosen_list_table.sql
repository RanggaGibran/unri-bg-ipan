-- Create Dosen List Table for Supabase
CREATE TABLE IF NOT EXISTS dosen_list (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS (Row Level Security) policies
ALTER TABLE dosen_list ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists and create new one
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON dosen_list;
CREATE POLICY "Enable all access for authenticated users" ON dosen_list
  FOR ALL USING (true);

-- Create indexes for better performance (only if not exists)
CREATE INDEX IF NOT EXISTS idx_dosen_list_name ON dosen_list(name);
CREATE INDEX IF NOT EXISTS idx_dosen_list_created_at ON dosen_list(created_at DESC);

-- Add comments
COMMENT ON TABLE dosen_list IS 'Tabel daftar nama dosen untuk dropdown autocomplete';
COMMENT ON COLUMN dosen_list.name IS 'Nama lengkap dosen';

-- Insert sample data
INSERT INTO dosen_list (name) VALUES 
  ('Dr. Budi Santoso'),
  ('Prof. Sari Wijaya'),
  ('Dr. Andi Rahman'),
  ('Dr. Lisa Permata'),
  ('Prof. Eko Prasetyo'),
  ('Dr. Maya Indira'),
  ('Dr. Rudi Hartono'),
  ('Dr. Nina Sari'),
  ('Dr. Dian Kurnia'),
  ('Prof. Agus Setiawan'),
  ('Dr. Vera Amalia'),
  ('Dr. Tomi Wijaksono'),
  ('Prof. Indra Kusuma'),
  ('Dr. Sinta Dewi'),
  ('Dr. Rahmat Hidayat'),
  ('Dr. Putri Maharani')
ON CONFLICT (name) DO NOTHING;