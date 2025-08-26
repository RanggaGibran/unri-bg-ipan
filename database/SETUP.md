# Setup Supabase Database

Ikuti langkah-langkah berikut untuk mengatur database Supabase:

## 1. Buat Project Supabase

1. Buka [Supabase Dashboard](https://app.supabase.com/)
2. Klik "New Project"
3. Pilih organization dan berikan nama project
4. Pilih region yang terdekat (Asia Southeast untuk Indonesia)
5. Buat password database yang kuat
6. Klik "Create new project"

## 2. Dapatkan URL dan API Key

1. Setelah project dibuat, buka tab "Settings" → "API"
2. Copy `URL` dan `anon public` key
3. Paste ke file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Buat Tabel Database

1. Buka tab "SQL Editor" di Supabase Dashboard
2. Buat query baru
3. Copy dan paste isi dari file `database/init.sql`
4. Klik "Run" untuk menjalankan script
5. Pastikan tabel `students` berhasil dibuat

## 4. Verifikasi Setup

1. Buka tab "Table Editor"
2. Pastikan tabel `students` terlihat dengan kolom yang sesuai
3. Pastikan ada 3 data contoh yang sudah di-insert

## 5. Test Koneksi

1. Jalankan aplikasi dengan `npm run dev`
2. Buka http://localhost:3000
3. Pastikan dashboard menampilkan data yang benar:
   - Total Mahasiswa: 3
   - Sudah Kompre: 1
   - Dalam Progress: 2
   - Status Database: ✅ Terhubung

## 6. Konfigurasi RLS (Row Level Security)

Script `init.sql` sudah mengaktifkan RLS dengan policies yang memungkinkan:
- Semua user bisa membaca data
- Semua user bisa menambah data
- Semua user bisa mengupdate data
- Semua user bisa menghapus data

**Catatan Keamanan**: Untuk production, sebaiknya buat policies yang lebih ketat dan implementasikan autentikasi yang proper.

## 7. Troubleshooting

### Error: "Invalid API key"
- Pastikan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah benar
- Restart development server setelah mengubah `.env.local`

### Error: "relation 'students' does not exist"
- Pastikan script SQL sudah dijalankan dengan benar
- Cek di Table Editor apakah tabel `students` sudah ada

### Error: "Network error"
- Pastikan `NEXT_PUBLIC_SUPABASE_URL` sudah benar
- Cek koneksi internet
- Pastikan project Supabase masih aktif

### Error: "Permission denied"
- Pastikan RLS policies sudah diterapkan dengan benar
- Cek di Authentication → Policies

## 8. Backup Database

Untuk backup data, gunakan:
```sql
-- Export data
SELECT * FROM students;

-- Atau gunakan pg_dump dari terminal
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
```

## 9. Monitoring

1. Buka tab "Logs" untuk melihat query logs
2. Buka tab "Database" → "Replication" untuk monitoring real-time
3. Buka tab "Settings" → "Database" untuk melihat usage dan performance

---

**Selamat! Database Supabase sudah siap digunakan.** 🎉
