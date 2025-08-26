'use client'

import { DosenAutocomplete } from '@/components/DosenAutocomplete'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createStudent } from '@/lib/database'
import { StudentInsert } from '@/types/database'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'

export default function AddStudentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // Daftar program studi yang tersedia
  const programStudiOptions = [
    'Teknologi Hasil Pertanian',
    'Teknologi Industri Pertanian'
  ]
  const [formData, setFormData] = useState<StudentInsert>({
    nim: '',
    name: '',
    program_studi: '',
    thesis_title: '',
    research_permit: null,
    // UJ3 fields
    uj3_date: null,
    supervisor_1: '',
    supervisor_2: '',
    // SUP fields
    sup_date: null,
    sup_supervisor_1: '',
    sup_supervisor_2: '',
    sup_examiner_1: '',
    sup_examiner_2: '',
    // SHP fields
    shp_date: null,
    shp_supervisor_1: '',
    shp_supervisor_2: '',
    shp_examiner_1: '',
    shp_examiner_2: '',
    // UK fields
    uk_date: null,
    uk_examiner_1: '',
    uk_examiner_2: '',
    uk_examiner_3: '',
    uk_examiner_4: '',
    is_completed: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    // Handle date fields - convert empty string to null
    if (type === 'date') {
      setFormData(prev => ({
        ...prev,
        [name]: value || null
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value || ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Validasi basic
      if (!formData.nim || !formData.name) {
        throw new Error('NIM dan Nama mahasiswa wajib diisi')
      }

      const { data, error } = await createStudent(formData)
      
      if (error) {
        throw new Error(error.message || 'Gagal menambahkan mahasiswa')
      }

      // Redirect ke halaman students setelah berhasil
      router.push('/students')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute>
      <Header title="Tambah Mahasiswa Baru" showBackButton backUrl="/students" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/students" className="text-blue-600 hover:text-blue-800">
                ← Kembali ke Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Tambah Mahasiswa Baru
            </h1>
            <p className="text-gray-600">
              Masukkan data mahasiswa dan progress ujian akhir
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Data Dasar Mahasiswa */}
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Data Dasar Mahasiswa
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nim" className="block text-sm font-medium text-gray-700 mb-2">
                      NIM Mahasiswa *
                    </label>
                    <input
                      type="text"
                      id="nim"
                      name="nim"
                      value={formData.nim}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Contoh: 20210001"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Nama lengkap mahasiswa"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="program_studi" className="block text-sm font-medium text-gray-700 mb-2">
                      Program Studi
                    </label>
                    <select
                      id="program_studi"
                      name="program_studi"
                      value={formData.program_studi || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    >
                      <option value="">Pilih Program Studi</option>
                      {programStudiOptions.map((prodi) => (
                        <option key={prodi} value={prodi}>
                          {prodi}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="thesis_title" className="block text-sm font-medium text-gray-700 mb-2">
                      Judul Proposal
                    </label>
                    <textarea
                      id="thesis_title"
                      name="thesis_title"
                      value={formData.thesis_title || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Judul proposal/skripsi/tesis"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="research_permit" className="block text-sm font-medium text-gray-700 mb-2">
                      📅 Tanggal Izin Penelitian
                    </label>
                    <input
                      type="date"
                      id="research_permit"
                      name="research_permit"
                      value={formData.research_permit || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Tanggal diterbitkan surat izin penelitian
                    </p>
                  </div>
                </div>
              </div>

              {/* Surat Tugas (UJ3) */}
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  📋 Surat Tugas (UJ3)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="uj3_date" className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Surat Tugas
                    </label>
                    <input
                      type="date"
                      id="uj3_date"
                      name="uj3_date"
                      value={formData.uj3_date || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="supervisor_1" className="block text-sm font-medium text-gray-700 mb-2">
                      Pembimbing 1
                    </label>
                    <DosenAutocomplete
                      value={formData.supervisor_1 || ''}
                      onChange={value => setFormData(prev => ({ ...prev, supervisor_1: value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama pembimbing 1"
                    />
                  </div>
                  <div>
                    <label htmlFor="supervisor_2" className="block text-sm font-medium text-gray-700 mb-2">
                      Pembimbing 2
                    </label>
                    <DosenAutocomplete
                      value={formData.supervisor_2 || ''}
                      onChange={value => setFormData(prev => ({ ...prev, supervisor_2: value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama pembimbing 2"
                    />
                  </div>
                </div>
              </div>

              {/* SUP (Seminar Usulan Penelitian) */}
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  📊 SUP (Seminar Usulan Penelitian)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="sup_date" className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal SUP
                    </label>
                    <input
                      type="date"
                      id="sup_date"
                      name="sup_date"
                      value={formData.sup_date || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    />
                  </div>
                  <div></div>
                  <div>
                    <label htmlFor="sup_supervisor_1" className="block text-sm font-medium text-gray-700 mb-2">
                      Pembimbing 1 (SUP)
                    </label>
                    <DosenAutocomplete
                      value={formData.sup_supervisor_1 || ''}
                      onChange={value => setFormData(prev => ({ ...prev, sup_supervisor_1: value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama pembimbing 1"
                    />
                  </div>
                  <div>
                    <label htmlFor="sup_supervisor_2" className="block text-sm font-medium text-gray-700 mb-2">
                      Pembimbing 2 (SUP)
                    </label>
                    <DosenAutocomplete
                      value={formData.sup_supervisor_2 || ''}
                      onChange={value => setFormData(prev => ({ ...prev, sup_supervisor_2: value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama pembimbing 2"
                    />
                  </div>
                  <div>
                    <label htmlFor="sup_examiner_1" className="block text-sm font-medium text-gray-700 mb-2">
                      Penguji 1 (SUP)
                    </label>
                    <DosenAutocomplete
                      value={formData.sup_examiner_1 || ''}
                      onChange={value => setFormData(prev => ({ ...prev, sup_examiner_1: value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama penguji 1"
                    />
                  </div>
                  <div>
                    <label htmlFor="sup_examiner_2" className="block text-sm font-medium text-gray-700 mb-2">
                      Penguji 2 (SUP)
                    </label>
                    <DosenAutocomplete
                      value={formData.sup_examiner_2 || ''}
                      onChange={value => setFormData(prev => ({ ...prev, sup_examiner_2: value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama penguji 2"
                    />
                  </div>
                </div>
              </div>

              {/* SHP (Seminar Hasil Penelitian) */}
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  📋 SHP (Seminar Hasil Penelitian)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="shp_date" className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal SHP
                    </label>
                    <input
                      type="date"
                      id="shp_date"
                      name="shp_date"
                      value={formData.shp_date || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    />
                  </div>
                  <div></div>
                  <div>
                    <label htmlFor="shp_supervisor_1" className="block text-sm font-medium text-gray-700 mb-2">
                      Pembimbing 1 (SHP)
                    </label>
                    <DosenAutocomplete
                      value={formData.shp_supervisor_1 || ''}
                      onChange={value => setFormData(prev => ({ ...prev, shp_supervisor_1: value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama pembimbing 1"
                    />
                  </div>
                  <div>
                    <label htmlFor="shp_supervisor_2" className="block text-sm font-medium text-gray-700 mb-2">
                      Pembimbing 2 (SHP)
                    </label>
                    <DosenAutocomplete
                      value={formData.shp_supervisor_2 || ''}
                      onChange={value => setFormData(prev => ({ ...prev, shp_supervisor_2: value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama pembimbing 2"
                    />
                  </div>
                  <div>
                    <label htmlFor="shp_examiner_1" className="block text-sm font-medium text-gray-700 mb-2">
                      Penguji 1 (SHP)
                    </label>
                    <DosenAutocomplete
                      value={formData.shp_examiner_1 || ''}
                      onChange={value => setFormData(prev => ({ ...prev, shp_examiner_1: value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama penguji 1"
                    />
                  </div>
                  <div>
                    <label htmlFor="shp_examiner_2" className="block text-sm font-medium text-gray-700 mb-2">
                      Penguji 2 (SHP)
                    </label>
                    <DosenAutocomplete
                      value={formData.shp_examiner_2 || ''}
                      onChange={value => setFormData(prev => ({ ...prev, shp_examiner_2: value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama penguji 2"
                    />
                  </div>
                </div>
              </div>

              {/* UK (Ujian Komprehensif) */}
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  🎓 UK (Ujian Komprehensif)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="uk_date" className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal UK
                    </label>
                    <input
                      type="date"
                      id="uk_date"
                      name="uk_date"
                      value={formData.uk_date || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    />
                  </div>
                  <div></div>
                  <div>
                    <label htmlFor="uk_examiner_1" className="block text-sm font-medium text-gray-700 mb-2">
                      Penguji 1 (UK)
                    </label>
                    <DosenAutocomplete
                      value={formData.uk_examiner_1 || ''}
                      onChange={value => setFormData(prev => ({ ...prev, uk_examiner_1: value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama penguji 1"
                    />
                  </div>
                  <div>
                    <label htmlFor="uk_examiner_2" className="block text-sm font-medium text-gray-700 mb-2">
                      Penguji 2 (UK)
                    </label>
                    <DosenAutocomplete
                      value={formData.uk_examiner_2 || ''}
                      onChange={value => setFormData(prev => ({ ...prev, uk_examiner_2: value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama penguji 2"
                    />
                  </div>
                  <div>
                    <label htmlFor="uk_examiner_3" className="block text-sm font-medium text-gray-700 mb-2">
                      Penguji 3 (UK)
                    </label>
                    <DosenAutocomplete
                      value={formData.uk_examiner_3 || ''}
                      onChange={value => setFormData(prev => ({ ...prev, uk_examiner_3: value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama penguji 3"
                    />
                  </div>
                  <div>
                    <label htmlFor="uk_examiner_4" className="block text-sm font-medium text-gray-700 mb-2">
                      Penguji 4 (UK)
                    </label>
                    <DosenAutocomplete
                      value={formData.uk_examiner_4 || ''}
                      onChange={value => setFormData(prev => ({ ...prev, uk_examiner_4: value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama penguji 4"
                    />
                  </div>
                </div>
              </div>

              {/* Status Kompre */}
              <div className="pb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  ✅ Status Kompre
                </h2>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_completed"
                    name="is_completed"
                    checked={formData.is_completed}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_completed" className="ml-2 block text-sm text-gray-700">
                    Mahasiswa sudah menyelesaikan ujian komprehensif (akan dipindah ke arsip)
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Mahasiswa'}
                </button>
                <Link
                  href="/students"
                  className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 text-center font-semibold"
                >
                  Batal
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}

// Global fix for all text input styling - apply bg-white text-gray-900 placeholder-gray-500 to all inputs
// This ensures all text inputs are visible with consistent styling
