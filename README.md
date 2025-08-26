# Aplikasi Progress Ujian Akhir Mahasiswa

Sistem monitoring dan pengelolaan progress ujian akhir mahasiswa dengan database Supabase.

## 📋 Fitur Utama

- **Dashboard Mahasiswa**: Pengelolaan data mahasiswa dan monitoring progress
- **Tahapan Ujian**: Surat Tugas (UJ3), SUP, SHP, UK
- **Arsip Kompre**: Daftar mahasiswa yang sudah menyelesaikan ujian
- **Autentikasi Admin**: Sistem login sederhana dengan password
- **Database Supabase**: Penyimpanan data yang aman dan scalable

## 🛠️ Tech Stack

- **Framework**: Next.js 14 dengan App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Linting**: ESLint

## 📊 Struktur Data Mahasiswa

1. NIM Mahasiswa
2. Nama Mahasiswa
3. Tanggal Surat Tugas (UJ3)
4. Pembimbing 1 dan Pembimbing 2
5. Tanggal SUP
6. Nama Pembimbing 1&2, Penguji 1&2 (SUP)
7. Tanggal SHP
8. Nama Pembimbing 1&2, Penguji 1&2 (SHP)
9. Tanggal UK
10. Penguji 1,2,3,4 (UK)
11. Judul Proposal
12. Izin Penelitian
13. Status Kompre (untuk arsip)

## 🚀 Instalasi dan Setup

1. **Clone repository**:
   ```bash
   git clone <repository-url>
   cd versi-12-supabase
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   - Copy `.env.local` dan isi dengan konfigurasi Supabase Anda
   - Dapatkan URL dan API Key dari dashboard Supabase

4. **Setup database**:
   - Buat project baru di Supabase
   - Ikuti panduan di `database/SETUP.md`
   - Jalankan script SQL dari `database/init.sql`
   - Pastikan tabel `students` berhasil dibuat

5. **Jalankan development server**:
   ```bash
   npm run dev
   ```

## 📁 Struktur Project

```
src/
├── app/
│   ├── layout.tsx      # Layout utama
│   ├── page.tsx        # Homepage
│   └── globals.css     # Global styles
├── components/         # Reusable components
├── lib/               # Utility functions
└── types/             # TypeScript types
```

## 🔧 Konfigurasi Environment

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Admin Password
ADMIN_PASSWORD=admin123

# Database Configuration
DATABASE_URL=your_database_connection_string_here
```

## 📱 Penggunaan

1. **Login Admin**: Masukkan password admin untuk mengakses sistem
2. **Tambah Mahasiswa**: Klik "Tambah Mahasiswa Baru" untuk menambah data
3. **Edit Progress**: Update tahapan ujian sesuai progress mahasiswa
4. **Arsip Kompre**: Pindahkan mahasiswa yang sudah selesai ke arsip

## 🔒 Keamanan

- Autentikasi sederhana dengan password admin
- Environment variables untuk konfigurasi sensitif
- Input validation untuk semua form
- Secure database connection melalui Supabase

## 📈 Development Roadmap

- [x] Setup project dan homepage
- [x] Setup Supabase database dan tabel
- [x] Konfigurasi environment variables
- [x] Database utilities dan types
- [ ] Implementasi autentikasi
- [ ] CRUD operations untuk data mahasiswa
- [ ] Dashboard monitoring progress
- [ ] Halaman arsip mahasiswa kompre
- [ ] Export data ke format Excel/PDF

## 🤝 Kontribusi

Project ini dikembangkan untuk keperluan internal pengelolaan ujian akhir mahasiswa.

## 📄 License

Private project untuk keperluan internal institusi.

---

**Catatan**: Pastikan untuk mengkonfigurasi Supabase dengan benar sebelum menjalankan aplikasi.
