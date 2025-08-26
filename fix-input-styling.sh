#!/bin/bash

# Script untuk memperbaiki styling semua input fields di form tambah mahasiswa
# Menambahkan bg-white text-gray-900 placeholder-gray-500 untuk visibilitas yang baik

FILE="d:/Buat Aplikasi/Versi-12-Supabase/src/app/students/new/page.tsx"

# Backup original file
cp "$FILE" "$FILE.backup"

# Replace all incomplete input styling
sed -i 's/className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"/g' "$FILE"

echo "✅ Fixed all input styling in $FILE"
echo "Original file backed up as $FILE.backup"
