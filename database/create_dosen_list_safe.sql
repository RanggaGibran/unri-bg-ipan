-- Create Dosen List Table for Supabase (Safe Version)
-- Script ini aman untuk dijalankan berulang kali

-- Create table only if not exists
CREATE TABLE IF NOT EXISTS dosen_list (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS only if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'dosen_list' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE dosen_list ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policy only if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'dosen_list' 
    AND policyname = 'Enable all access for authenticated users'
  ) THEN
    CREATE POLICY "Enable all access for authenticated users" ON dosen_list
      FOR ALL USING (true);
  END IF;
END $$;

-- Create indexes for better performance (only if not exists)
CREATE INDEX IF NOT EXISTS idx_dosen_list_name ON dosen_list(name);
CREATE INDEX IF NOT EXISTS idx_dosen_list_created_at ON dosen_list(created_at DESC);

-- Add trigger for updated_at (only if not exists)
CREATE OR REPLACE FUNCTION update_dosen_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_dosen_list_updated_at_trigger ON dosen_list;
CREATE TRIGGER update_dosen_list_updated_at_trigger
    BEFORE UPDATE ON dosen_list
    FOR EACH ROW
    EXECUTE FUNCTION update_dosen_list_updated_at();

-- Add comments
COMMENT ON TABLE dosen_list IS 'Tabel daftar nama dosen untuk dropdown autocomplete';
COMMENT ON COLUMN dosen_list.name IS 'Nama lengkap dosen';

-- Insert sample data (hanya jika belum ada)
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
  ('Dr. Putri Maharani'),
  ('Dr. Ahmad Fauzi'),
  ('Prof. Dr. Siti Nurhaliza'),
  ('Dr. Rizki Pratama'),
  ('Dr. Maya Sari'),
  ('Prof. Dr. Indra Wijaya'),
  ('Dr. Lina Marlina'),
  ('Prof. Dr. Anton Setiawan'),
  ('Dr. Citra Dewi'),
  ('Prof. Dr. Bambang Susilo'),
  ('Dr. Nurul Hidayah')
ON CONFLICT (name) DO NOTHING;

-- Verify table creation
SELECT 'Tabel dosen_list berhasil dibuat!' as status,
       count(*) as jumlah_dosen
FROM dosen_list;
