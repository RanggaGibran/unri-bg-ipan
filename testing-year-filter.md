# 🧪 Testing Script - Filter Tahun Angkatan

## Persiapan Testing

1. **Start Development Server**
```bash
cd "d:\Buat Aplikasi\Versi-12-Supabase"
npm run dev
```

2. **Login sebagai Admin** (jika diperlukan)
- Username: admin
- Password: admin123

---

## Test Cases

### **Test 1: Students Page Filter**

**URL:** `http://localhost:3000/students`

**Steps:**
1. ✅ Buka halaman `/students`
2. ✅ Klik tombol expand filter (arrow di header hijau)
3. ✅ Cari dropdown "🎓 Tahun Angkatan"
4. ✅ Verify options tersedia:
   - "Semua Angkatan" (default)
   - "Angkatan 2024", "Angkatan 2023", dll (berdasarkan data)
5. ✅ Pilih angkatan tertentu (misal: "Angkatan 2023")
6. ✅ Verify hanya mahasiswa dengan NIM "23..." yang tampil
7. ✅ Check filter badge muncul: "Angkatan 2023"
8. ✅ Klik × pada badge untuk remove filter
9. ✅ Verify kembali ke "Semua Angkatan"

**Expected Results:**
- Dropdown tahun angkatan muncul dan berfungsi
- Filter hasil sesuai dengan NIM mahasiswa
- Filter badge management berfungsi

---

### **Test 2: Archive Page Filter**

**URL:** `http://localhost:3000/archive`

**Steps:**
1. ✅ Login sebagai admin jika belum
2. ✅ Buka halaman `/archive`
3. ✅ Klik tombol expand filter
4. ✅ Cari dropdown "🎓 Tahun Angkatan"
5. ✅ Verify options sesuai dengan data mahasiswa kompre
6. ✅ Pilih angkatan tertentu
7. ✅ Verify hasil filter mahasiswa kompre untuk angkatan tersebut
8. ✅ Test kombinasi dengan filter lain (stage, date)

**Expected Results:**
- Filter tahun angkatan berfungsi di halaman arsip
- Kombinasi filter bekerja dengan baik

---

### **Test 3: Kombinasi Filter**

**Steps:**
1. ✅ Pilih tahun angkatan "2023"
2. ✅ Tambah search term "John"
3. ✅ Verify hasil: mahasiswa angkatan 2023 dengan nama "John"
4. ✅ Tambah stage filter "SUP"
5. ✅ Verify hasil: mahasiswa angkatan 2023, nama "John", sudah SUP
6. ✅ Clear all filters
7. ✅ Verify semua filter ter-reset

**Expected Results:**
- Kombinasi multiple filters berfungsi
- Clear all filters reset semua termasuk tahun angkatan

---

### **Test 4: Edge Cases**

**Steps:**
1. ✅ Test dengan data mahasiswa NIM yang tidak standar
2. ✅ Test dengan dropdown kosong (tidak ada data)
3. ✅ Test responsiveness di mobile
4. ✅ Test keyboard navigation
5. ✅ Test dengan banyak data mahasiswa

**Expected Results:**
- Graceful handling untuk edge cases
- Responsive design berfungsi baik
- Accessibility features bekerja

---

### **Test 5: Performance**

**Steps:**
1. ✅ Test dengan 100+ data mahasiswa
2. ✅ Monitor loading time saat filter
3. ✅ Test switching between angkatan dengan cepat
4. ✅ Verify no memory leaks atau lag

**Expected Results:**
- Filter responsive meski dengan data banyak
- No performance issues

---

## Debugging Checklist

Jika ada masalah, check:

### **Filter Tidak Muncul:**
- ✅ Verify `enableYearFilter: true` di config
- ✅ Check komponen AdvancedSearchFilter ter-import
- ✅ Verify ada data mahasiswa dengan NIM valid

### **Filter Tidak Berfungsi:**
- ✅ Check console untuk errors
- ✅ Verify logic parsing NIM (2 digit pertama)
- ✅ Check selectedYear state management

### **Dropdown Kosong:**
- ✅ Verify ada data mahasiswa di database
- ✅ Check NIM format (minimal 2 karakter)
- ✅ Verify availableYears calculation

### **Styling Issues:**
- ✅ Check Tailwind classes
- ✅ Verify responsive breakpoints
- ✅ Check focus states dan hover effects

---

## Expected Console Output

Saat testing, di browser console tidak boleh ada:
- ❌ JavaScript errors
- ❌ React warnings
- ❌ Network errors
- ❌ Type errors

Yang normal muncul:
- ✅ Database queries logs
- ✅ Filter state changes logs
- ✅ Navigation logs

---

## Test Data Examples

**NIM Format yang Didukung:**
- "21010123" → Angkatan 2021
- "20010456" → Angkatan 2020
- "22010789" → Angkatan 2022
- "23010234" → Angkatan 2023

**Edge Cases:**
- "1234" → Length < 2, should be filtered out
- "" (empty) → Should be filtered out
- null/undefined → Should be filtered out

---

## Success Criteria

✅ **Test dianggap BERHASIL jika:**
1. Filter tahun angkatan muncul di students dan archive pages
2. Dropdown options ter-generate otomatis dari data NIM
3. Filter berfungsi dengan hasil yang akurat
4. Kombinasi dengan filter lain bekerja
5. Clear filters reset tahun angkatan
6. UI responsive dan accessible
7. No JavaScript errors di console
8. Performance tetap baik dengan data banyak

---

## Timeline Testing

**Estimasi:** 30-45 menit untuk testing komprehensif

**Prioritas:**
1. **High:** Basic functionality (Test 1-2)
2. **Medium:** Kombinasi filter (Test 3)
3. **Low:** Edge cases dan performance (Test 4-5)

Ready untuk testing! 🚀
