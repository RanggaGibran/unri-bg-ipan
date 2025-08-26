'use client'
import { DosenAutocomplete } from './DosenAutocomplete';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Student, StudentUpdate } from '@/types/database'
import { getStudentById, updateStudent } from '@/lib/database'

interface EditProgressFormProps {
  studentId: number
  initialData?: Student
}

export default function EditProgressForm({ studentId, initialData }: EditProgressFormProps) {
  const router = useRouter()
  const [student, setStudent] = useState<StudentUpdate>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (initialData) {
      setStudent(initialData)
    } else {
      // Load student data if not provided
      loadStudentData()
    }
  }, [studentId, initialData])

  const loadStudentData = async () => {
    setLoading(true)
    try {
      const { data, error } = await getStudentById(studentId)
      if (error) throw error
      if (data) setStudent(data)
    } catch (error) {
      setMessage('Error loading student data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setStudent(prev => ({
      ...prev,
      [field]: value || null
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await updateStudent(studentId, student)
      if (error) throw error
      
      setMessage('Progress berhasil diupdate!')
      setTimeout(() => {
        router.push('/students')
      }, 1500)
    } catch (error) {
      setMessage('Error updating progress: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsCompleted = async () => {
    if (!confirm('Apakah Anda yakin ingin menandai mahasiswa ini sebagai sudah kompre?')) {
      return
    }

    setLoading(true)
    try {
      const updatedData = { ...student, is_completed: true }
      const { data, error } = await updateStudent(studentId, updatedData)
      if (error) throw error
      
      setMessage('Mahasiswa berhasil ditandai sebagai kompre!')
      setTimeout(() => {
        router.push('/archive')
      }, 1500)
    } catch (error) {
      setMessage('Error marking as completed: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !student.name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">
              Edit Progress Ujian - {student.name}
            </h1>
            <p className="text-gray-600">NIM: {student.nim}</p>
          </div>

          {message && (
            <div className={`mx-6 mt-4 p-4 rounded-lg ${
              message.includes('Error') ? 'bg-red-100 border border-red-400 text-red-700' : 'bg-green-100 border border-green-400 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 Informasi Dasar</h2>
              
              {/* Program Studi */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Studi
                </label>
                <input
                  type="text"
                  value={student.program_studi || ''}
                  onChange={(e) => handleInputChange('program_studi', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Program studi mahasiswa"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Proposal
                  </label>
                  <textarea
                    value={student.thesis_title || ''}
                    onChange={(e) => handleInputChange('thesis_title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Masukkan judul proposal..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Izin Penelitian
                  </label>
                  <textarea
                    value={student.research_permit || ''}
                    onChange={(e) => handleInputChange('research_permit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Informasi izin penelitian..."
                  />
                </div>
              </div>
            </div>

            {/* UJ3 - Surat Tugas */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-3">UJ3</span>
                Surat Tugas (UJ3)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Surat Tugas
                  </label>
                  <input
                    type="date"
                    value={student.uj3_date || ''}
                    onChange={(e) => handleInputChange('uj3_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pembimbing 1
                  </label>
                  <DosenAutocomplete
                    value={student.supervisor_1 || ''}
                    onChange={(value: string) => handleInputChange('supervisor_1', value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nama pembimbing 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pembimbing 2
                  </label>
                  <DosenAutocomplete
                    value={student.supervisor_2 || ''}
                    onChange={(value: string) => handleInputChange('supervisor_2', value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nama pembimbing 2"
                  />
                </div>
              </div>
            </div>

            {/* SUP - Seminar Usulan Penelitian */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mr-3">SUP</span>
                Seminar Usulan Penelitian (SUP)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal SUP
                  </label>
                  <input
                    type="date"
                    value={student.sup_date || ''}
                    onChange={(e) => handleInputChange('sup_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pembimbing 1 (SUP)
                  </label>
                  <DosenAutocomplete
                    value={student.sup_supervisor_1 || ''}
                    onChange={(value: string) => handleInputChange('sup_supervisor_1', value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Nama pembimbing 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pembimbing 2 (SUP)
                  </label>
                  <DosenAutocomplete
                    value={student.sup_supervisor_2 || ''}
                    onChange={(value: string) => handleInputChange('sup_supervisor_2', value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Nama pembimbing 2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penguji 1 (SUP)
                  </label>
                  <DosenAutocomplete
                    value={student.sup_examiner_1 || ''}
                    onChange={(value: string) => handleInputChange('sup_examiner_1', value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Nama penguji 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penguji 2 (SUP)
                  </label>
                  <DosenAutocomplete
                    value={student.sup_examiner_2 || ''}
                    onChange={(value: string) => handleInputChange('sup_examiner_2', value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Nama penguji 2"
                  />
                </div>
              </div>
            </div>

            {/* SHP - Seminar Hasil Penelitian */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm mr-3">SHP</span>
                Seminar Hasil Penelitian (SHP)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal SHP
                  </label>
                  <input
                    type="date"
                    value={student.shp_date || ''}
                    onChange={(e) => handleInputChange('shp_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pembimbing 1 (SHP)
                  </label>
                  <DosenAutocomplete
                    value={student.shp_supervisor_1 || ''}
                    onChange={(value: string) => handleInputChange('shp_supervisor_1', value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Nama pembimbing 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pembimbing 2 (SHP)
                  </label>
                  <DosenAutocomplete
                    value={student.shp_supervisor_2 || ''}
                    onChange={(value: string) => handleInputChange('shp_supervisor_2', value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Nama pembimbing 2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penguji 1 (SHP)
                  </label>
                  <DosenAutocomplete
                    value={student.shp_examiner_1 || ''}
                    onChange={(value: string) => handleInputChange('shp_examiner_1', value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Nama penguji 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penguji 2 (SHP)
                  </label>
                  <DosenAutocomplete
                    value={student.shp_examiner_2 || ''}
                    onChange={(value: string) => handleInputChange('shp_examiner_2', value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Nama penguji 2"
                  />
                </div>
              </div>
            </div>

            {/* UK - Ujian Komprehensif */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm mr-3">UK</span>
                Ujian Komprehensif (UK)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal UK
                  </label>
                  <input
                    type="date"
                    value={student.uk_date || ''}
                    onChange={(e) => handleInputChange('uk_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penguji 1 (UK)
                  </label>
                  <DosenAutocomplete
                    value={student.uk_examiner_1 || ''}
                    onChange={(value: string) => handleInputChange('uk_examiner_1', value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Nama penguji 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penguji 2 (UK)
                  </label>
                  <DosenAutocomplete
                    value={student.uk_examiner_2 || ''}
                    onChange={(value: string) => handleInputChange('uk_examiner_2', value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Nama penguji 2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penguji 3 (UK)
                  </label>
                  <DosenAutocomplete
                    value={student.uk_examiner_3 || ''}
                    onChange={(value: string) => handleInputChange('uk_examiner_3', value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Nama penguji 3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penguji 4 (UK)
                  </label>
                  <DosenAutocomplete
                    value={student.uk_examiner_4 || ''}
                    onChange={(value: string) => handleInputChange('uk_examiner_4', value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Nama penguji 4"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {loading ? 'Menyimpan...' : '💾 Simpan Progress'}
              </button>
              
              {!student.is_completed && (
                <button
                  type="button"
                  onClick={handleMarkAsCompleted}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  🎓 Tandai Sebagai Kompre
                </button>
              )}
              
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                ↩️ Kembali
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
