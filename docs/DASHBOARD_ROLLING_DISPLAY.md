# Dashboard Rolling Display - Dokumentasi

## 📊 Fitur Dashboard Rolling Display

### Deskripsi
Fitur dashboard utama yang menampilkan informasi mahasiswa aktif dengan sistem rolling otomatis setiap 2 detik. Menampilkan hingga 10 mahasiswa aktif dengan informasi lengkap termasuk pembimbing dan aktivitas terakhir.

### ✨ Fitur Utama

#### 1. **Rolling Display Mahasiswa**
- ⏱️ **Auto-refresh setiap 2 detik** dengan animasi smooth
- 👥 **Maksimal 10 mahasiswa aktif** yang ditampilkan secara bergantian
- 🔄 **Animasi transisi** dengan opacity dan scaling effect
- 📊 **Counter display** menunjukkan posisi mahasiswa saat ini (1/10, 2/10, dst.)

#### 2. **Informasi Mahasiswa**
- 📋 **Nama dan NIM** mahasiswa
- 📝 **Judul proposal** (jika ada)
- 👨‍🏫 **Pembimbing 1 dan 2** dengan indicator visual
- 📅 **Aktivitas terakhir** dengan format "Telah [tahapan] X hari yang lalu"
- 🎯 **Progress indicator** visual untuk tahapan UJ3 → SUP → SHP → UK

#### 3. **Status Aktivitas**
Format status aktivitas:
- ✅ **"Telah UK X hari yang lalu"** - Jika sudah ujian komprehensif
- ✅ **"Telah SHP X hari yang lalu"** - Jika sudah seminar hasil penelitian
- ✅ **"Telah SUP X hari yang lalu"** - Jika sudah seminar usulan penelitian
- ✅ **"Telah UJ3 X hari yang lalu"** - Jika sudah surat tugas
- 🚀 **"Siap memulai perjalanan ujian"** - Jika belum ada aktivitas

#### 4. **Handling Edge Cases**
- 📚 **Tidak ada mahasiswa aktif**: Tampilkan pesan dan tombol tambah mahasiswa
- ⏳ **Loading state**: Tampilkan spinner loading saat mengambil data
- ⚠️ **Belum ada pembimbing**: Tampilkan peringatan dengan icon

### 🎨 Design System

#### **Color Scheme**
- **Primary Card**: Gradient blue-500 to purple-600
- **Pembimbing 1**: Blue-400 badge
- **Pembimbing 2**: Purple-400 badge 
- **Progress Completed**: Green-400
- **Progress Pending**: White dengan opacity
- **Status Activity**: Green-400 background

#### **Typography**
- **Nama Mahasiswa**: text-2xl font-bold
- **NIM**: font-mono untuk konsistensi
- **Activity Status**: text-lg untuk emphasis
- **Details**: text-sm untuk informasi tambahan

#### **Animations**
- **Rolling Transition**: 400ms fade out, 100ms fade in
- **Transform Effect**: scale-95 saat transisi
- **Opacity Change**: 50% saat rolling

### 🔧 Implementasi Teknis

#### **State Management**
```tsx
const [currentStudentIndex, setCurrentStudentIndex] = useState(0)
const [displayStudents, setDisplayStudents] = useState<Student[]>([])
const [isRolling, setIsRolling] = useState(false)
```

#### **Logic Aktivitas Terakhir**
```tsx
const getLastActivity = (student: Student): { activity: string; daysAgo: number; status: string } => {
  // Sorting berdasarkan tanggal terbaru: UK → SHP → SUP → UJ3
  // Return formatted status: "Telah [tahapan] X hari yang lalu"
}
```

#### **Rolling Timer**
```tsx
useEffect(() => {
  const interval = setInterval(() => {
    setIsRolling(true)
    setTimeout(() => {
      setCurrentStudentIndex(prev => (prev + 1) % studentsForDisplay.length)
      setTimeout(() => {
        setIsRolling(false)
      }, 100)
    }, 400)
  }, 2000) // Update setiap 2 detik
}, [activeStudents])
```

### 📱 Responsive Design

#### **Desktop (md+)**
- Grid 2 kolom: Info mahasiswa | Aktivitas & progress
- Full display dengan semua informasi

#### **Mobile**
- Grid 1 kolom: Stack vertikal
- Optimized spacing dan font size

### 🚀 Performance Optimizations

1. **Efficient Re-renders**: useEffect dependency hanya pada activeStudents
2. **Limited Dataset**: Maksimal 10 mahasiswa untuk performa
3. **Optimized Transitions**: Fast fade-in, slower fade-out untuk UX
4. **Memory Management**: Cleanup interval saat component unmount

### 🎯 User Experience Features

1. **Visual Feedback**: Progress dots, badges, dan status colors
2. **Informative States**: Clear messaging untuk setiap kondisi
3. **Smooth Animations**: Professional transitions
4. **Accessibility**: Proper semantic HTML dan ARIA labels
5. **Loading States**: Graceful handling saat data loading

### 📝 Cara Penggunaan

1. **Akses Dashboard**: Buka halaman utama aplikasi
2. **Lihat Rolling Display**: Section biru-ungu di tengah dashboard
3. **Monitor Progress**: Perhatikan dots indicator untuk tahapan ujian
4. **Track Activity**: Lihat status aktivitas terakhir setiap mahasiswa
5. **Navigate**: Gunakan quick actions untuk manage data

### 🔮 Future Enhancements

1. **Pause/Play Control**: Tombol untuk pause rolling display
2. **Speed Control**: Setting kecepatan rolling (1-5 detik)
3. **Filter Options**: Tampilkan hanya mahasiswa dengan tahapan tertentu
4. **Click to Detail**: Klik mahasiswa untuk lihat detail lengkap
5. **Export Display**: Screenshot atau export data mahasiswa yang sedang ditampilkan

---

**Dibuat**: Juli 2025  
**Versi**: 1.0.0  
**Status**: ✅ Active & Deployed
