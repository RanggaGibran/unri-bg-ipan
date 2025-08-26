# Setup Database Supabase

## 🚀 Langkah-langkah Setup

### 1. Buat Project Supabase

1. Kunjungi [https://supabase.com](https://supabase.com)
2. Klik "Start your project" 
3. Login dengan GitHub/Google
4. Klik "New project"
5. Pilih Organization dan beri nama project: `ujian-akhir-mahasiswa`
6. Pilih region yang terdekat (Singapore/Tokyo)
7. Buat password yang kuat untuk database
8. Klik "Create new project"

### 2. Konfigurasi Environment Variables

1. Setelah project selesai dibuat, buka tab "Settings" > "API"
2. Copy nilai berikut ke file `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Admin Password
ADMIN_PASSWORD=admin123

# Database Configuration (opsional)
DATABASE_URL=your-database-connection-string-here
```

### 3. Membuat Tabel Database

1. Buka tab "SQL Editor" di dashboard Supabase
2. Klik "New query"
3. Copy dan paste seluruh isi file `database/create_tables.sql`
4. Klik "Run" untuk menjalankan query
5. Pastikan tidak ada error dan tabel berhasil dibuat

### 4. Verifikasi Setup

1. Buka tab "Table Editor" di dashboard Supabase
2. Pastikan tabel `students` sudah ada dengan kolom-kolom berikut:
   - `id` (Primary Key)
   - `nim` (Text, Unique)
   - `name` (Text)
   - `thesis_title` (Text, nullable)
   - `research_permit` (Text, nullable)
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)
   - `is_completed` (Boolean)
   - Kolom-kolom untuk UJ3, SUP, SHP, UK

### 5. Test Connection

Setelah setup selesai, jalankan aplikasi dengan:

```bash
npm run dev
```

Aplikasi akan otomatis test koneksi ke database saat pertama kali dijalankan.

## 📊 Struktur Database

### Tabel `students`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | SERIAL | Primary key |
| `nim` | VARCHAR(20) | NIM mahasiswa (unique) |
| `name` | VARCHAR(255) | Nama mahasiswa |
| `thesis_title` | TEXT | Judul proposal |
| `research_permit` | TEXT | Izin penelitian |
| `created_at` | TIMESTAMP | Tanggal dibuat |
| `updated_at` | TIMESTAMP | Tanggal diupdate |
| `is_completed` | BOOLEAN | Status kompre |

#### Tahapan UJ3 (Surat Tugas)
- `uj3_date` - Tanggal surat tugas
- `supervisor_1` - Pembimbing 1
- `supervisor_2` - Pembimbing 2

#### Tahapan SUP (Seminar Usulan Penelitian)
- `sup_date` - Tanggal SUP
- `sup_supervisor_1` - Pembimbing 1
- `sup_supervisor_2` - Pembimbing 2
- `sup_examiner_1` - Penguji 1
- `sup_examiner_2` - Penguji 2

#### Tahapan SHP (Seminar Hasil Penelitian)
- `shp_date` - Tanggal SHP
- `shp_supervisor_1` - Pembimbing 1
- `shp_supervisor_2` - Pembimbing 2
- `shp_examiner_1` - Penguji 1
- `shp_examiner_2` - Penguji 2

#### Tahapan UK (Ujian Komprehensif)
- `uk_date` - Tanggal UK
- `uk_examiner_1` - Penguji 1
- `uk_examiner_2` - Penguji 2
- `uk_examiner_3` - Penguji 3
- `uk_examiner_4` - Penguji 4

## 🔒 Security

- Row Level Security (RLS) diaktifkan
- Policy sementara mengizinkan akses penuh (untuk development)
- Autentikasi akan diimplementasikan di aplikasi

## 📝 Catatan

- Pastikan environment variables sudah dikonfigurasi dengan benar
- Backup database secara berkala
- Monitor penggunaan quota di dashboard Supabase
- Upgrade plan jika diperlukan untuk production

## 🔧 Troubleshooting

### Connection Error
- Pastikan SUPABASE_URL dan SUPABASE_ANON_KEY benar
- Periksa apakah project Supabase masih aktif
- Pastikan tidak ada firewall yang memblokir koneksi

### Query Error
- Periksa format data yang dikirim ke database
- Pastikan tabel dan kolom sudah sesuai
- Cek logs di dashboard Supabase untuk error details
