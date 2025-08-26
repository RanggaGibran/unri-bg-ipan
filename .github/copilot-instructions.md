<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Aplikasi Progress Ujian Akhir Mahasiswa

## Konteks Aplikasi
Aplikasi ini adalah sistem monitoring progress ujian akhir mahasiswa dengan fitur:
- Pengelolaan data mahasiswa dan progress ujian
- Tahapan: Surat Tugas (UJ3), SUP, SHP, UK
- Sistem autentikasi sederhana dengan password admin
- Database menggunakan Supabase
- Interface admin untuk CRUD operations

## Tech Stack
- Next.js 14 dengan App Router
- TypeScript
- Tailwind CSS
- Supabase sebagai database
- ESLint untuk code quality

## Struktur Data Mahasiswa
- NIM Mahasiswa
- Nama Mahasiswa
- Tanggal Surat Tugas (UJ3)
- Pembimbing 1 dan 2
- Tanggal SUP
- Nama Pembimbing 1&2, Penguji 1&2 (SUP)
- Tanggal SHP
- Nama Pembimbing 1&2, Penguji 1&2 (SHP)
- Tanggal UK
- Penguji 1,2,3,4 (UK)
- Judul Proposal
- Izin Penelitian
- Status Kompre (untuk arsip)

## Panduan Development
- Gunakan TypeScript untuk type safety
- Implementasikan responsive design dengan Tailwind
- Ikuti best practices Next.js App Router
- Prioritaskan user experience yang intuitif
- Buat komponen yang reusable
